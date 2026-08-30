import type { Metadata } from 'next';
import { DM_Sans, Bungee } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/site';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const bungee = Bungee({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

// Root layout is deliberately bare: fonts + globals only. The marketing chrome
// (NavBar, Footer, pixel, Calendly) lives in app/(marketing)/layout.tsx so the
// team. CRM surface (app/team) doesn't inherit it.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Street Interview Videos for Brands | StreetInterviewVideos.com',
    // No template: each route owns its full <title> string so we never
    // accidentally double the "| StreetInterviewVideos.com" suffix.
    template: '%s',
  },
  description: SITE.tagline,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    url: SITE.url,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bungee.variable}`}>
      <body>{children}</body>
    </html>
  );
}
