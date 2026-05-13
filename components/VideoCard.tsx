'use client';

import { useRef, useState } from 'react';
import { WorkVideo } from '@/lib/work';
import { VideoLightbox } from './VideoLightbox';

function HoverPreview({
  video,
  onOpen,
  rounded = 'rounded-xl',
}: {
  video: WorkVideo;
  onOpen: (v: WorkVideo) => void;
  rounded?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  const handleEnter = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.currentTime = 0;
    el.play().catch(() => {});
  };
  const handleLeave = () => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    try { el.currentTime = 0; } catch {}
  };

  return (
    <button
      onClick={() => onOpen(video)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      aria-label={`Play video: ${video.title}`}
      className={`group block w-full text-left ${rounded} overflow-hidden border border-border bg-ink-900 aspect-[9/16] relative card-hover focus:outline-none focus:ring-2 focus:ring-accent`}
    >
      {/* Poster image — visible by default */}
      <img
        src={video.poster}
        alt={video.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
      />
      {/* Inline silent preview — fades in on hover */}
      <video
        ref={videoRef}
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        preload="none"
        onLoadedData={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100`}
      />
      <div className="absolute inset-0 gradient-edge pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white pointer-events-none">
        <div className="text-[10px] uppercase tracking-widest font-bold opacity-90">{video.category}</div>
        <div className="font-semibold text-sm leading-tight">{video.title}</div>
      </div>
      <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-accent transition-colors pointer-events-none">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><polygon points="3,2 10,6 3,10" /></svg>
      </div>
    </button>
  );
}

export function VideoTile({ video }: { video: WorkVideo }) {
  const [open, setOpen] = useState<WorkVideo | null>(null);
  return (
    <>
      <HoverPreview video={video} onOpen={setOpen} />
      <VideoLightbox video={open} onClose={() => setOpen(null)} />
    </>
  );
}

export function VideoCard({ video, accent = false }: { video: WorkVideo; accent?: boolean }) {
  const [open, setOpen] = useState<WorkVideo | null>(null);
  return (
    <>
      <div className="rounded-2xl overflow-hidden border border-border bg-white card-hover">
        <HoverPreview video={video} onOpen={setOpen} rounded="" />
        <div className="p-4 bg-white text-ink-900">
          <div className="text-xs uppercase tracking-widest text-text-400 mb-2">{video.format}</div>
          <p className="text-sm text-text-700 leading-relaxed mb-3">{video.whyItWorked}</p>
          <div className="text-xs text-text-400">
            <span className="font-semibold text-ink-900">Goal:</span> {video.goal}
          </div>
        </div>
      </div>
      <VideoLightbox video={open} onClose={() => setOpen(null)} />
    </>
  );
}
