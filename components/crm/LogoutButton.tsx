'use client';

export function LogoutButton() {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  }
  return (
    <button onClick={logout} className="text-sm text-[var(--crm-muted)] hover:text-[var(--crm-text)] transition-colors">
      Log out
    </button>
  );
}
