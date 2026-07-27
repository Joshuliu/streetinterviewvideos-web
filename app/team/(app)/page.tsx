import { getAdminSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Placeholder landing until build step 5 (My tasks view). Its job right now
// is proving the auth gate + session end to end.
export default function TeamHomePage() {
  const session = getAdminSession()!;
  return (
    <div>
      <h1 className="font-display text-3xl mb-4">My Tasks</h1>
      <p className="text-[#9ca3af]">
        Auth is live — you’re logged in as <span className="text-white">{session.email}</span> (task owner:{' '}
        <span className="text-white">{session.owner}</span>). The task list lands in build step 5.
      </p>
    </div>
  );
}
