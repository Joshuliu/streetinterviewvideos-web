'use client';

import { useEffect, useRef } from 'react';
import type { WorkVideo } from '@/lib/work';

export function HeroVideoWall({ videos }: { videos: WorkVideo[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const vids = Array.from(root.querySelectorAll<HTMLVideoElement>('video'));

    let active = true;
    const visibilityHandler = () => {
      if (document.hidden) {
        vids.forEach((v) => { try { v.pause(); } catch {} });
      } else if (active) {
        vids.forEach((v) => { v.play().catch(() => {}); });
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && !document.hidden) {
            v.play().catch(() => {});
          } else {
            try { v.pause(); } catch {}
          }
        }
      },
      { threshold: 0.05 }
    );

    vids.forEach((v, i) => {
      v.muted = true;
      v.dataset.bg = '1';
      io.observe(v);
      setTimeout(() => {
        v.play().catch(() => {});
      }, i * 80);
    });

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', visibilityHandler);
      io.disconnect();
    };
  }, []);

  const tiles = videos.slice(0, 12);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-6 grid-rows-2 gap-2 sm:gap-3 h-full w-full p-2 sm:p-3">
        {tiles.map((v, i) => (
          <div
            key={v.id}
            className={`relative overflow-hidden rounded-lg sm:rounded-xl bg-ink-700 ${
              // Mobile: 2x2 = 4 tiles (no empty cells, wider tiles). sm: 5x2 =
              // 10 tiles. lg: 6x2 = 12. Each breakpoint fills its grid exactly
              // so there's never a stray gap.
              i >= 10 ? 'hidden lg:block' : i >= 4 ? 'hidden sm:block' : ''
            }`}
          >
            <video
              src={v.src}
              poster={v.poster}
              muted
              loop
              playsInline
              preload="metadata"
              data-bg="1"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/30 lg:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-transparent to-ink-900/60" />
    </div>
  );
}
