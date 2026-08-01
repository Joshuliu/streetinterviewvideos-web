import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Studio | StreetInterviewVideos',
  robots: { index: false, follow: false },
};

// Light shell for the client order tracker (studio.streetinterviewvideos.com):
// matches the marketing site's paper palette. The internal team. CRM keeps
// its dark shell.
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className="shell-paper min-h-screen bg-paper-soft text-text-700">{children}</div>;
}
