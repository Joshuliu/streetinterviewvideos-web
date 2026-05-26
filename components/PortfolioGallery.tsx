'use client';

import { useState, useEffect } from 'react';
import { ALL_WORK_VIDEOS, WorkVideo } from '@/lib/work';
import { HoverPreview, VideoTile } from './VideoCard';
import { VideoLightbox } from './VideoLightbox';
import { Eyebrow, H2, Lead } from './Sections';

// Single source of truth for lightbox state across all portfolio tiles.
// Keeps the URL in sync with which video (if any) is currently open, so
// share links like /portfolio/mott-bow open the lightbox on landing and
// the URL changes back to /portfolio when the lightbox closes.
export function PortfolioGallery({ initialOpenSlug }: { initialOpenSlug?: string }) {
  // Featured pair: top unscripted + top scripted in Neil's preferred order.
  const topUnscripted = ALL_WORK_VIDEOS.find((v) => v.kind === 'unscripted');
  const topScripted = ALL_WORK_VIDEOS.find((v) => v.kind === 'scripted');
  const featured = [topUnscripted, topScripted].filter(Boolean) as WorkVideo[];
  const featuredIds = new Set(featured.map((v) => v.id));
  const grid = ALL_WORK_VIDEOS.filter((v) => !featuredIds.has(v.id));

  const [openVideo, setOpenVideo] = useState<WorkVideo | null>(() => {
    if (!initialOpenSlug) return null;
    return ALL_WORK_VIDEOS.find((v) => v.id === initialOpenSlug) ?? null;
  });

  // Keep URL in sync with which video is open (or none) without doing a
  // full Next.js navigation. replaceState is shallow — no re-render — so
  // the page stays mounted and the video keeps playing.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const target = openVideo ? `/portfolio/${openVideo.id}/` : '/portfolio/';
    if (window.location.pathname !== target) {
      window.history.replaceState(null, '', target);
    }
  }, [openVideo]);

  return (
    <>
      {/* Featured: one unscripted + one scripted, side by side */}
      <section className="bg-paper-soft">
        <div className="section-body max-w-site mx-auto px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-3xl mb-10">
            <Eyebrow>Featured</Eyebrow>
            <H2 className="mt-4">One unscripted, one scripted.</H2>
            <Lead className="mt-4">
              Two top picks from the library, one real-stranger unscripted, one actor-led scripted, so you can compare
              the two paths side by side.
            </Lead>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
            {featured.map((v) => (
              <article
                key={v.id}
                className="rounded-3xl border border-border bg-white p-5 lg:p-6"
              >
                {/* HoverPreview rendered directly (not via VideoCard) to avoid
                    a redundant rounded/border wrapper that was causing the
                    featured tiles to feel jumpy on hover. */}
                <HoverPreview video={v} onOpen={setOpenVideo} rounded="rounded-2xl" />
                <div className="mt-5">
                  <div className="text-xs uppercase tracking-widest text-text-400 mb-2">
                    {v.kind === 'unscripted' ? 'Unscripted, ' : 'Scripted, '}{v.category}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight mb-3">{v.title}</h3>
                  <p className="text-text-700 text-sm leading-relaxed mb-3">
                    <span className="font-semibold text-ink-900">Goal:</span> {v.goal}
                  </p>
                  <p className="text-text-700 text-sm leading-relaxed mb-3">
                    <span className="font-semibold text-ink-900">Format:</span> {v.format}
                  </p>
                  <p className="text-text-700 text-sm leading-relaxed mb-4">
                    <span className="font-semibold text-ink-900">Why it worked:</span> {v.whyItWorked}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section>
        <div className="section-body max-w-site mx-auto px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-3xl mb-10">
            <Eyebrow>The library</Eyebrow>
            <H2 className="mt-4">The full library</H2>
            <Lead className="mt-4">
              Every video below is real client work, produced for paying brands and shipped to live ad accounts or active
              social channels. Scroll the whole library or jump straight to a brief.
            </Lead>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {grid.map((v) => (
              <VideoTile key={v.id} video={v} onOpen={setOpenVideo} />
            ))}
          </div>
        </div>
      </section>

      {/* Single shared lightbox driven by the gallery's openVideo state. */}
      <VideoLightbox video={openVideo} onClose={() => setOpenVideo(null)} />
    </>
  );
}
