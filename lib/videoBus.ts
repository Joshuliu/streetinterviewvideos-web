'use client';

let pausedSet = new WeakSet<HTMLVideoElement>();

export function pauseAllBackgroundVideos(except?: HTMLVideoElement | null) {
  const vids = document.querySelectorAll<HTMLVideoElement>('video[data-bg="1"]');
  pausedSet = new WeakSet();
  vids.forEach((v) => {
    if (v === except) return;
    if (!v.paused) {
      pausedSet.add(v);
      try { v.pause(); } catch {}
    }
  });
}

export function resumeBackgroundVideos() {
  const vids = document.querySelectorAll<HTMLVideoElement>('video[data-bg="1"]');
  vids.forEach((v) => {
    if (pausedSet.has(v)) {
      v.play().catch(() => {});
    }
  });
  pausedSet = new WeakSet();
}
