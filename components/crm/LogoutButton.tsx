'use client';

export function LogoutButton() {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  }
  return (
    <button onClick={logout} className="text-sm text-[#9ca3af] hover:text-white transition-colors">
      Log out
    </button>
  );
}
