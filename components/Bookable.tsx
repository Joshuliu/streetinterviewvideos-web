import { Button } from './Button';
import { SITE, CTA } from '@/lib/site';

export function BookCallButton({ size = 'lg', className = '', dataCta = 'book' }: { size?: 'md' | 'lg'; className?: string; dataCta?: string }) {
  return (
    <Button href={SITE.bookingUrl} external variant="primary" size={size} className={className} dataCta={dataCta}>
      {CTA.primary}
    </Button>
  );
}
