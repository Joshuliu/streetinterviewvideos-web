'use client';

import { useEffect, useRef, useState } from 'react';
import type { WorkVideo } from '@/lib/work';
import { pauseAllBackgroundVideos, resumeBackgroundVideos } from '@/lib/videoBus';

export function VideoLightbox({ video, onClose }: { video: WorkVideo | null; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!video) return;

    pauseAllBackgroundVideos();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
      if (e.key === 'm') { e.preventDefault(); toggleMute(); }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    const start = setTimeout(() => {
      const el = videoRef.current;
      if (!el) return;
      el.currentTime = 0;
      el.muted = false;
      el.volume = 1;
      el.play().then(() => {
        setPlaying(true);
        setMuted(false);
      }).catch(() => {
        el.muted = true;
        setMuted(true);
        el.play().then(() => setPlaying(true)).catch(() => {});
      });
    }, 30);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(start);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      resumeBackgroundVideos();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    el.currentTime = pct * el.duration;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 2200);
  };

  if (!video) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onClick={onClose}
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <button
        onClick={onClose}
        aria-label="Close video"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center z-20 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l10 10M15 5L5 15" /></svg>
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        onMouseMove={showControlsTemporarily}
        className="relative flex flex-col items-center gap-4 w-full max-w-[min(95vw,calc(88vh*9/16))]"
      >
        <div className="relative w-full aspect-[9/16] max-h-[88vh] rounded-2xl overflow-hidden bg-black shadow-2xl group">
          <video
            ref={videoRef}
            src={video.src}
            poster={video.poster}
            playsInline
            preload="auto"
            onClick={togglePlay}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
            onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime || 0)}
            onEnded={() => { setPlaying(false); setShowControls(true); }}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Big center play overlay when paused */}
          {!playing && (
            <button
              onClick={togglePlay}
              aria-label="Play"
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
            >
              <span className="w-20 h-20 rounded-full bg-white/95 text-ink-900 flex items-center justify-center shadow-xl">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="7,4 21,12 7,20" /></svg>
              </span>
            </button>
          )}

          {/* Bottom custom control bar */}
          <div
            className={`absolute left-0 right-0 bottom-0 px-3 pb-3 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-200 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <div
              onClick={seekTo}
              className="w-full h-1.5 bg-white/25 rounded-full cursor-pointer mb-3 overflow-hidden"
            >
              <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                aria-label={playing ? 'Pause' : 'Play'}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white inline-flex items-center justify-center transition-colors"
              >
                {playing ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="7,4 21,12 7,20" /></svg>
                )}
              </button>
              <button
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white inline-flex items-center justify-center transition-colors"
              >
                {muted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                )}
              </button>
              <div className="ml-auto text-xs font-mono text-white/80 tabular-nums">
                {formatTime(progress)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center px-2 max-w-md">
          <div className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1">{video.category}</div>
          <div className="text-white font-semibold text-sm">{video.title}</div>
        </div>
      </div>
    </div>
  );
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
