'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Service } from '@/lib/services';

export function ServiceCard({
  service,
  featured = false,
  structureIndex,
}: {
  service: Service;
  featured?: boolean;
  structureIndex?: number;
}) {
  const eyebrowLabel = structureIndex
    ? `Structure ${String(structureIndex).padStart(2, '0')}`
    : featured
    ? 'Featured'
    : 'Service';
  return (
    <Link
      href={`/services/${service.slug}/`}
      className={`group relative block rounded-2xl border ${
        featured ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-900 border-border hover:border-ink-900/30'
      } p-6 lg:p-7 card-hover transition-colors overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold ${featured ? 'text-accent' : 'text-text-400 group-hover:text-accent transition-colors'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${featured ? 'bg-accent' : 'bg-text-400 group-hover:bg-accent transition-colors'}`} />
          {eyebrowLabel}
        </div>
        <span
          aria-hidden
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all ${
            featured ? 'bg-accent text-white' : 'bg-paper-soft text-ink-900 group-hover:bg-accent group-hover:text-white'
          } group-hover:translate-x-0.5`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h8M8 4l3 3-3 3" />
          </svg>
        </span>
      </div>
      <div className="text-lg lg:text-xl font-extrabold mb-2 leading-tight tracking-tight">{service.shortLabel}</div>
      <div className={`text-sm leading-relaxed ${featured ? 'text-white/80' : 'text-text-700'}`}>
        {service.cardBlurb}
      </div>
    </Link>
  );
}

export function ServiceCardWithVideo({
  service,
  videoSrc,
  poster,
  featured = false,
}: {
  service: Service;
  videoSrc: string;
  poster: string;
  featured?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnter = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.play().catch(() => {});
  };
  const handleLeave = () => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    try { el.currentTime = 0; } catch {}
  };

  return (
    <Link
      href={`/services/${service.slug}/`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className={`group relative block rounded-2xl overflow-hidden border ${
        featured ? 'border-ink-900' : 'border-border'
      } card-hover bg-ink-900 text-white aspect-[3/4]`}
    >
      <img
        src={poster}
        alt={service.shortLabel}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
      />
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/55 to-ink-900/10 pointer-events-none" />

      <div className="relative h-full flex flex-col justify-between p-5 lg:p-6">
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold ${featured ? 'text-accent' : 'text-white/80'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${featured ? 'bg-accent' : 'bg-white/80'}`} />
            {featured ? 'Featured' : 'Service'}
          </div>
        </div>
        <div>
          <div className="text-xl lg:text-2xl font-extrabold leading-tight mb-2 tracking-tight">{service.shortLabel}</div>
          <p className="text-sm text-white/85 leading-relaxed mb-4 line-clamp-3">{service.cardBlurb}</p>
          <div className="text-sm font-semibold text-accent inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            Learn more
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h8M8 4l3 3-3 3" /></svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
