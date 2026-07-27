import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Studio | StreetInterviewVideos',
  robots: { index: false, follow: false },
};

// Dark shell for the client order tracker (studio.streetinterviewvideos.com).
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0a0a0a] text-white">{children}</div>;
}
