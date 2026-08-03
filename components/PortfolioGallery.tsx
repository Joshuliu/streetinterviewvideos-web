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
      {/* Featured: one unscripted + one scripted. Deliberately a short,
          horizontal strip — a full 9:16 poster in a half-width column made
          this section ~1,500px tall and buried the library below it. Thumb
          left, copy right, so the whole thing clears the fold. */}
      <section className="bg-paper-soft">
        <div className="section-body max-w-site mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="mb-6 lg:mb-8 lg:flex lg:items-end lg:justify-between lg:gap-10">
            <div>
              <Eyebrow>Featured</Eyebrow>
              <H2 className="mt-3">One unscripted, one scripted.</H2>
            </div>
            <p className="mt-3 lg:mt-0 lg:shrink-0 lg:max-w-sm lg:text-right text-text-700 text-sm lg:text-base leading-relaxed">
              Two top picks, one real-stranger unscripted and one actor-led scripted, so you can compare the two paths
              side by side.
            </p>
          </div>
          {/* Two-up only from lg. At tablet widths a half-width card left the
              copy column ~190px wide and the title stacked to three lines. */}
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
            {featured.map((v) => (
              <article
                key={v.id}
                className="flex gap-4 lg:gap-5 rounded-2xl border border-border bg-white p-3 lg:p-4"
              >
                {/* Fixed-width thumb keeps the 9:16 poster from setting the
                    height of the whole section. */}
                <div className="w-24 sm:w-28 lg:w-32 shrink-0">
                  <HoverPreview video={v} onOpen={setOpenVideo} rounded="rounded-xl" compact />
                </div>
                <div className="min-w-0 flex-1 self-center">
                  <div className="text-[11px] lg:text-xs uppercase tracking-widest text-text-400">
                    {v.kind === 'unscripted' ? 'Unscripted, ' : 'Scripted, '}{v.category}
                  </div>
                  <h3 className="mt-1.5 text-base lg:text-lg font-extrabold tracking-tight leading-snug break-words">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-text-700 text-sm leading-relaxed line-clamp-3 lg:line-clamp-4">
                    {v.whyItWorked}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpenVideo(v)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover"
                  >
                    Watch
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                      <polygon points="3,2 10,6 3,10" />
                    </svg>
                  </button>
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
