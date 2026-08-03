import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { MetaPixel } from '@/components/MetaPixel';
import { Clarity } from '@/components/Clarity';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { CalendlyBooking } from '@/components/CalendlyBooking';
import { SchemaScript } from '@/lib/schema';
import { orgSchema, websiteSchema } from '@/lib/schema';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MetaPixel />
      <Clarity />
      <GoogleAnalytics />
      <CalendlyBooking />
      <SchemaScript data={[orgSchema(), websiteSchema()]} />
      <NavBar />
      <main>{children}</main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
