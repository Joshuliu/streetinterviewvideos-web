import { Button } from './Button';
import { SITE, CTA } from '@/lib/site';

export function BookCallButton({ size = 'lg', className = '', dataCta = 'book' }: { size?: 'md' | 'lg'; className?: string; dataCta?: string }) {
  return (
    <Button href={SITE.bookingUrl} external variant="cta" size={size} className={className} dataCta={dataCta}>
      {CTA.primary}
    </Button>
  );
}

// Centered Book-a-Call strip for slotting after section content.
// Reserved for the one conversion action; deliberately omits a secondary
// button so the eye lands on a single next step.
export function BookCallStrip({
  className = '',
  dataCta = 'section-book',
  caption,
}: {
  className?: string;
  dataCta?: string;
  caption?: string;
}) {
  return (
    <div className={`mt-12 lg:mt-14 flex flex-col items-center text-center ${className}`}>
      <BookCallButton dataCta={dataCta} />
      {caption && <p className="mt-3 text-xs text-text-400 tracking-wide">{caption}</p>}
    </div>
  );
}
