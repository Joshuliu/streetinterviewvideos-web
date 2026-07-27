import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team | StreetInterviewVideos',
  robots: { index: false, follow: false },
};

// Dark shell for the internal CRM (team.streetinterviewvideos.com). Auth is
// enforced one level down in (app)/layout.tsx so /login stays public.
export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0a0a0a] text-white">{children}</div>;
}
