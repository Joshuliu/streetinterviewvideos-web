import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team | StreetInterviewVideos',
  robots: { index: false, follow: false },
};

// Shell for the internal CRM (team.streetinterviewvideos.com). It follows the
// device: paper by default, ink when the OS asks for dark. The palette itself
// (the --crm-* tokens every page reads) lives in app/globals.css under
// .shell-crm. Auth is enforced one level down in (app)/layout.tsx so /login
// stays public.
export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <div className="shell-crm min-h-screen bg-[var(--crm-bg)] text-[var(--crm-text)]">{children}</div>;
}
