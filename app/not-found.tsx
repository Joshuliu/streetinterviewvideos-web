import Link from 'next/link';
import { Button } from '@/components/Button';
import { SITE, CTA } from '@/lib/site';

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center">
      <div className="max-w-site mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-2xl">
          <div className="kicker mb-4">404</div>
          <h1 className="text-h1 font-extrabold tracking-tight mb-4">This page doesn’t exist.</h1>
          <p className="text-lead text-text-700 mb-8">
            But we made a video about it. While we didn’t actually — try one of these instead.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <Button href="/" variant="primary">Home</Button>
            <Button href="/work/" variant="secondary">View Work</Button>
            <Button href="/services/" variant="ghost">All Services</Button>
          </div>
          <div className="text-sm text-text-400">
            Or just <a href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-accent font-semibold">{CTA.primary}</a>.
          </div>
        </div>
      </div>
    </section>
  );
}
