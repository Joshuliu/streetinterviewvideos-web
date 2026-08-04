'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import {
  createVideo,
  deleteVideo,
  setVideoPublished,
  updateVideo,
} from '@/app/team/(app)/portfolio/actions';
import { GrowingTextarea } from '@/components/crm/GrowingTextarea';

// Create/edit form for a portfolio video, including the upload pipeline:
// pick a file → browser-side checks against the export standard → straight
// to Blob from the browser (client upload; the 4.5MB serverless body cap
// makes a server roundtrip a non-starter) → poster frame auto-grabbed at 1s,
// scrubbable to any other frame. The DB row is only written on Save, so an
// abandoned upload never half-publishes.

const fieldStyles =
  'w-full min-w-0 max-w-full rounded-lg bg-[var(--crm-panel)] border border-[var(--crm-line-2)] px-3 py-2 text-base sm:text-sm text-[var(--crm-text)] placeholder-[var(--crm-faint)] focus:outline-none focus:border-[var(--crm-accent)]';

// The export standard we ask editors to follow (also enforced/warned here):
// 9:16 vertical, 1080x1920, H.264 MP4 + AAC, SDR, under 150MB. That's the
// stock TikTok/Reels export preset in CapCut and Premiere.
const STANDARD_NOTE = '9:16 vertical MP4 (H.264), 1080x1920, SDR, under 150MB. The TikTok/Reels export preset is exactly this.';
const WARN_BYTES = 150 * 1024 * 1024;
const MAX_BYTES = 500 * 1024 * 1024;

export interface FormVideo {
  id: string;
  slug: string;
  title: string;
  category: string;
  goal: string;
  format: string;
  deliverables: string;
  whyItWorked: string;
  kind: 'scripted' | 'unscripted';
  published: boolean;
  src: string;
  poster: string;
}

type MediaState =
  | { status: 'none' }
  | { status: 'checking' }
  | { status: 'blocked'; error: string }
  | { status: 'uploading'; progress: number }
  | { status: 'ready'; url: string };

const FORMAT_TEMPLATES = {
  unscripted: 'Unscripted street interview · Branded UGC',
  scripted: 'Scripted street interview · Branded UGC',
} as const;
const DELIVERABLES_TEMPLATE = 'Vertical 9:16 · sound-on, captioned';

function fmtBytes(n: number): string {
  return n >= 1024 * 1024 ? `${Math.round(n / (1024 * 1024))}MB` : `${Math.round(n / 1024)}KB`;
}

function fmtTime(s: number): string {
  const whole = Math.floor(s);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

// Draw the video element's current frame to a JPEG. Frames land at most
// 720px wide (the library's playback size; posters don't need more).
async function captureFrame(video: HTMLVideoElement): Promise<Blob> {
  const scale = Math.min(1, 720 / (video.videoWidth || 720));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round((video.videoWidth || 720) * scale);
  canvas.height = Math.round((video.videoHeight || 1280) * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('capture failed'))), 'image/jpeg', 0.85);
  });
}

function seekTo(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener('seeked', done);
      resolve();
    };
    video.addEventListener('seeked', done);
    video.currentTime = t;
  });
}

export function PortfolioVideoForm({
  video,
  categories,
}: {
  video: FormVideo | null; // null = new video
  categories: string[];
}) {
  const isNew = video === null;
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [kind, setKind] = useState<'scripted' | 'unscripted'>(video?.kind ?? 'unscripted');
  const [format, setFormat] = useState(video?.format ?? FORMAT_TEMPLATES.unscripted);
  const [deliverables, setDeliverables] = useState(video?.deliverables ?? DELIVERABLES_TEMPLATE);

  // Swapping kind on a fresh form swaps the format template, but never
  // clobbers something already typed.
  function onKindChange(next: 'scripted' | 'unscripted') {
    setKind(next);
    const untouched = format === FORMAT_TEMPLATES.unscripted || format === FORMAT_TEMPLATES.scripted || !format;
    if (untouched) setFormat(FORMAT_TEMPLATES[next]);
  }

  // --- Media ---
  const [media, setMedia] = useState<MediaState>(video ? { status: 'ready', url: video.src } : { status: 'none' });
  const [posterUrl, setPosterUrl] = useState<string | null>(video?.poster ?? null);
  const [posterBusy, setPosterBusy] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  // What the scrubber plays: the local object URL for a fresh pick (instant,
  // same-origin), else the stored remote src (Blob serves CORS *, /videos/...
  // is same-origin, so frame capture works for both).
  const [previewSrc, setPreviewSrc] = useState<string | null>(video?.src ?? null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scrub, setScrub] = useState(0);
  const [duration, setDuration] = useState(0);

  async function uploadPosterFromPreview() {
    const el = previewRef.current;
    if (!el || el.readyState < 2) return;
    setPosterBusy(true);
    setError(null);
    try {
      const blob = await captureFrame(el);
      const result = await upload(`portfolio/poster-${Date.now()}.jpg`, blob, {
        access: 'public',
        handleUploadUrl: '/api/portfolio/upload',
        contentType: 'image/jpeg',
      });
      setPosterUrl(result.url);
    } catch {
      setError('Poster upload failed. Try the frame again.');
    } finally {
      setPosterBusy(false);
    }
  }

  async function onPickFile(file: File) {
    setError(null);
    setWarnings([]);
    setMedia({ status: 'checking' });

    if (file.size > MAX_BYTES) {
      setMedia({ status: 'blocked', error: `That file is ${fmtBytes(file.size)}. The hard cap is 500MB; a feed-ready export should be under 150MB.` });
      return;
    }
    const isMp4 = file.type === 'video/mp4' || /\.mp4$/i.test(file.name);
    const isMov = file.type === 'video/quicktime' || /\.mov$/i.test(file.name);
    if (!isMp4 && !isMov) {
      setMedia({ status: 'blocked', error: 'Not a video file this site can play. Export as MP4 (H.264).' });
      return;
    }

    // Decode test: if the browser can't play it here, visitors can't either.
    const objectUrl = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.muted = true;
    const meta = await new Promise<{ ok: boolean; w: number; h: number; dur: number }>((resolve) => {
      probe.onloadedmetadata = () =>
        resolve({ ok: true, w: probe.videoWidth, h: probe.videoHeight, dur: probe.duration });
      probe.onerror = () => resolve({ ok: false, w: 0, h: 0, dur: 0 });
      probe.src = objectUrl;
    });
    if (!meta.ok || !meta.w || !meta.h) {
      URL.revokeObjectURL(objectUrl);
      setMedia({
        status: 'blocked',
        error: 'This browser cannot decode that file (probably ProRes or HEVC). Re-export as MP4 with H.264.',
      });
      return;
    }

    const warns: string[] = [];
    const aspect = meta.w / meta.h;
    if (Math.abs(aspect - 9 / 16) > 0.02) warns.push(`Not 9:16 (this is ${meta.w}x${meta.h}). It will letterbox in the library.`);
    if (meta.w < 720) warns.push(`Only ${meta.w}px wide. 1080x1920 is the standard; this will look soft.`);
    if (meta.dur > 90) warns.push(`Runs ${Math.round(meta.dur)}s. Portfolio clips are usually 30 to 60s.`);
    if (file.size > WARN_BYTES) warns.push(`Heavy file (${fmtBytes(file.size)}). It will play, but a 150MB-max export loads faster.`);
    if (isMov) warns.push('MOV container. It plays here, but MP4 is the safer standard.');
    setWarnings(warns);

    // The scrubber runs off the local file immediately; the poster resets
    // because it belonged to the previous video.
    setPreviewSrc(objectUrl);
    setPosterUrl(null);
    setScrub(0);
    setDuration(meta.dur || 0);

    setMedia({ status: 'uploading', progress: 0 });
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-80);
      const result = await upload(`portfolio/${safeName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/portfolio/upload',
        onUploadProgress: ({ percentage }) => setMedia({ status: 'uploading', progress: percentage }),
      });
      setMedia({ status: 'ready', url: result.url });
    } catch (e) {
      setMedia({
        status: 'blocked',
        error:
          e instanceof Error && /unauthorized/i.test(e.message)
            ? 'Session expired. Log in again.'
            : 'Upload failed. Check the connection and try again.',
      });
    }
  }

  // Auto-poster: first frame-at-1s once a freshly picked file is decodable,
  // unless a poster was already chosen while the upload ran.
  const autoPosterDone = useRef(false);
  useEffect(() => {
    autoPosterDone.current = false;
  }, [previewSrc]);
  async function onPreviewLoaded() {
    const el = previewRef.current;
    if (!el) return;
    if (Number.isFinite(el.duration)) setDuration(el.duration);
    if (autoPosterDone.current || posterUrl || !isDirtyMedia()) return;
    autoPosterDone.current = true;
    await seekTo(el, Math.min(1, (el.duration || 1) * 0.5));
    setScrub(el.currentTime);
    await uploadPosterFromPreview();
  }

  // On the edit page the video element is in the server-rendered HTML, so it
  // can finish loading BEFORE hydration attaches onLoadedData: the event is
  // gone and `duration` would stay 0, leaving the scrubber with no range
  // (max=0, thumb won't move). Poll the element directly after mount to pick
  // up whatever state the events already delivered. (Shipped as a bug once:
  // the frame picker on existing videos was dead on arrival, 2026-08-03.)
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const read = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
    };
    read();
    el.addEventListener('durationchange', read);
    // preload="metadata" can stall before loadeddata in some browsers; a
    // metadata-only element still seeks and draws frames, so just nudge it.
    if (el.readyState === 0) el.load();
    return () => el.removeEventListener('durationchange', read);
  }, [previewSrc]);

  // Fresh pick = previewSrc is a blob: URL (edit mode starts on the remote src).
  function isDirtyMedia() {
    return previewSrc?.startsWith('blob:') ?? false;
  }

  const mediaReady = media.status === 'ready';
  const canSave = isNew ? mediaReady && !!posterUrl : media.status !== 'uploading' && !posterBusy;

  function submit(fd: FormData) {
    startTransition(async () => {
      setError(null);
      if (isNew) {
        const res = await createVideo(fd);
        if (!res.ok) return setError(res.error);
        router.push('/portfolio');
        router.refresh();
      } else {
        const res = await updateVideo(fd);
        if (!res.ok) return setError(res.error);
        router.push('/portfolio');
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="space-y-6 max-w-2xl">
      {!isNew && <input type="hidden" name="id" value={video.id} />}
      {/* Media URLs travel as plain fields; on edit an empty value means
          "keep what's there" (see updateVideo). A ready URL is only sent when
          it came from a fresh pick, i.e. it differs from what's stored. */}
      <input type="hidden" name="src" value={media.status === 'ready' && isDirtyMedia() ? media.url : ''} />
      <input type="hidden" name="poster" value={posterUrl ?? ''} />

      {/* --- Video file --- */}
      <section className="rounded-2xl border border-[var(--crm-line)] bg-[var(--crm-panel)] p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[var(--crm-strong)]">Video file</h2>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={media.status === 'uploading'}
            className="rounded-lg border border-[var(--crm-line-2)] px-3 py-1.5 text-xs font-semibold text-[var(--crm-text)] hover:border-[var(--crm-accent)] disabled:opacity-50"
          >
            {isNew && media.status === 'none' ? 'Choose file' : 'Replace video'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f);
              e.target.value = '';
            }}
          />
        </div>
        <p className="text-xs text-[var(--crm-muted)]">{STANDARD_NOTE}</p>

        {media.status === 'uploading' && (
          <div>
            <div className="h-2 rounded-full bg-[var(--crm-inset)] overflow-hidden">
              <div className="h-full bg-[var(--crm-good)] transition-all" style={{ width: `${media.progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-[var(--crm-muted)]">Uploading, {Math.round(media.progress)}%. Keep this page open.</p>
          </div>
        )}
        {media.status === 'blocked' && <p className="text-sm text-[var(--crm-warn)]">{media.error}</p>}
        {warnings.map((w) => (
          <p key={w} className="text-xs text-[var(--crm-warn-soft)]">⚠ {w}</p>
        ))}

        {/* --- Poster picker: scrub the video, then stamp the frame --- */}
        {previewSrc && (
          <div className="pt-1 space-y-3">
            <div className="flex gap-4 items-start">
              <div className="w-28 shrink-0">
                <div className="text-xs font-semibold text-[var(--crm-muted)] mb-1.5">Video</div>
                <video
                  ref={previewRef}
                  src={previewSrc}
                  crossOrigin="anonymous"
                  muted
                  playsInline
                  preload="metadata"
                  onLoadedData={onPreviewLoaded}
                  className="w-full aspect-[9/16] object-cover rounded-lg bg-[var(--crm-inset)]"
                />
              </div>
              <div className="w-28 shrink-0">
                <div className="text-xs font-semibold text-[var(--crm-muted)] mb-1.5">Poster</div>
                {posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterUrl} alt="Poster frame" className="w-full aspect-[9/16] object-cover rounded-lg bg-[var(--crm-inset)]" />
                ) : (
                  <div className="w-full aspect-[9/16] rounded-lg bg-[var(--crm-inset)] flex items-center justify-center text-[10px] text-[var(--crm-faint)] text-center px-2">
                    No frame picked yet
                  </div>
                )}
              </div>
            </div>
            {/* Full-width scrubber: drag to move through the video, then set
                the poster from whatever frame is showing. */}
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={duration > 0 ? Math.round(duration * 20) / 20 : 0}
                  step={0.05}
                  value={scrub}
                  disabled={duration <= 0}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setScrub(t);
                    if (previewRef.current) previewRef.current.currentTime = t;
                  }}
                  className="flex-1 min-w-0 h-8 accent-[var(--crm-accent)] disabled:opacity-40"
                  aria-label="Scrub to a poster frame"
                />
                <span className="shrink-0 text-xs tabular-nums text-[var(--crm-muted)] w-20 text-right">
                  {fmtTime(scrub)} / {duration > 0 ? fmtTime(duration) : '–:––'}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={uploadPosterFromPreview}
                  disabled={posterBusy || media.status === 'uploading' || duration <= 0}
                  className="rounded-lg border border-[var(--crm-line-2)] px-3 py-1.5 text-xs font-semibold text-[var(--crm-text)] hover:border-[var(--crm-accent)] disabled:opacity-50"
                >
                  {posterBusy ? 'Saving frame…' : 'Set this frame as poster'}
                </button>
                <span className="text-xs text-[var(--crm-faint)]">Drag the slider, the video follows.</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* --- Copy fields --- */}
      <div className="space-y-5">
        <div>
          <label htmlFor="pv-title" className="block text-sm font-semibold text-[var(--crm-text)] mb-1.5">
            Title
          </label>
          <input id="pv-title" name="title" defaultValue={video?.title ?? ''} required maxLength={200} placeholder="Brand: What the Video Does" className={fieldStyles} />
          {!isNew && <p className="mt-1 text-xs text-[var(--crm-faint)]">URL stays /portfolio/{video.slug}/ even if the title changes.</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-sm font-semibold text-[var(--crm-text)] mb-1.5">Kind</span>
            <div className="flex rounded-lg border border-[var(--crm-line-2)] overflow-hidden">
              {(['unscripted', 'scripted'] as const).map((k) => (
                <label
                  key={k}
                  className={`flex-1 text-center px-3 py-2 text-base sm:text-sm cursor-pointer capitalize ${
                    kind === k ? 'bg-[var(--crm-accent)] text-white font-semibold' : 'bg-[var(--crm-panel)] text-[var(--crm-muted)]'
                  }`}
                >
                  <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => onKindChange(k)} className="sr-only" />
                  {k}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="pv-category" className="block text-sm font-semibold text-[var(--crm-text)] mb-1.5">
              Category
            </label>
            <input id="pv-category" name="category" defaultValue={video?.category ?? ''} maxLength={120} list="pv-categories" placeholder="Perfume / Fragrance" className={fieldStyles} />
            <datalist id="pv-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label htmlFor="pv-goal" className="block text-sm font-semibold text-[var(--crm-text)] mb-1.5">
            Goal
          </label>
          <p className="text-xs text-[var(--crm-muted)] -mt-0.5 mb-1.5">What the brand hired this video to do, one sentence.</p>
          <GrowingTextarea id="pv-goal" name="goal" minRows={2} maxHeightClass="max-h-48" defaultValue={video?.goal ?? ''} className={fieldStyles} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pv-format" className="block text-sm font-semibold text-[var(--crm-text)] mb-1.5">
              Format
            </label>
            <input id="pv-format" name="format" value={format} onChange={(e) => setFormat(e.target.value)} maxLength={300} className={fieldStyles} />
          </div>
          <div>
            <label htmlFor="pv-deliverables" className="block text-sm font-semibold text-[var(--crm-text)] mb-1.5">
              Deliverables
            </label>
            <input id="pv-deliverables" name="deliverables" value={deliverables} onChange={(e) => setDeliverables(e.target.value)} maxLength={300} placeholder="Vertical 9:16 · ~40s edit · sound-on, captioned" className={fieldStyles} />
          </div>
        </div>

        <div>
          <label htmlFor="pv-why" className="block text-sm font-semibold text-[var(--crm-text)] mb-1.5">
            Why it worked
          </label>
          <p className="text-xs text-[var(--crm-muted)] -mt-0.5 mb-1.5">
            The write-up shown on the site. Hook, what made it land, real quotes if there are good ones.
          </p>
          <GrowingTextarea id="pv-why" name="whyItWorked" minRows={4} maxHeightClass="max-h-96" defaultValue={video?.whyItWorked ?? ''} className={fieldStyles} />
        </div>
      </div>

      {error && <p className="text-sm text-[var(--crm-warn)]">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy || !canSave} className="sign-btn-cta text-xs px-5 py-2.5 disabled:opacity-50">
          {busy ? 'Saving…' : isNew ? 'Add to portfolio' : 'Save changes'}
        </button>
        {isNew && !canSave && media.status !== 'uploading' && (
          <span className="text-xs text-[var(--crm-faint)]">Upload a video and pick a poster first</span>
        )}
        {media.status === 'uploading' && <span className="text-xs text-[var(--crm-faint)]">Wait for the upload to finish</span>}
      </div>
    </form>
  );
}

// --- Edit-page side controls ---

export function PublishedToggle({ id, published }: { id: string; published: boolean }) {
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() =>
        startTransition(async () => {
          const res = await setVideoPublished(id, !published);
          if (!res.ok) alert(res.error);
          router.refresh();
        })
      }
      className="rounded-lg border border-[var(--crm-line-2)] px-3 py-1.5 text-xs font-semibold text-[var(--crm-text)] hover:border-[var(--crm-accent)] disabled:opacity-50"
    >
      {busy ? 'Working…' : published ? 'Hide from site' : 'Publish to site'}
    </button>
  );
}

export function DeleteVideoButton({ id, title }: { id: string; title: string }) {
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        if (!window.confirm(`Delete "${title}" from the portfolio? The video file goes with it. This cannot be undone.`)) return;
        startTransition(async () => {
          const res = await deleteVideo(id);
          if (!res.ok) return alert(res.error);
          router.push('/portfolio');
          router.refresh();
        });
      }}
      className="text-xs font-semibold text-[var(--crm-warn)] hover:underline disabled:opacity-50"
    >
      {busy ? 'Deleting…' : 'Delete video'}
    </button>
  );
}
