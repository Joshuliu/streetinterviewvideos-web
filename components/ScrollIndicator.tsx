'use client';

export function ScrollIndicator({ targetId = 'next-section' }: { targetId?: string }) {
  const scrollNext = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={scrollNext}
      aria-label="Scroll to next section"
      className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 group inline-flex flex-col items-center text-white/70 hover:text-white transition"
    >
      <span className="block w-10 h-10 rounded-full border border-white/30 group-hover:border-white/70 inline-flex items-center justify-center animate-bounce-slow">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5l4 4 4-4" />
        </svg>
      </span>
    </button>
  );
}
