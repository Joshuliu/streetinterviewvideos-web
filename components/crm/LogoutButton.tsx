'use client';

// `light` pins studio to the paper palette; the default follows the CRM
// tokens, so on team. the label tracks the device theme.
export function LogoutButton({ light = false }: { light?: boolean }) {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  }
  return (
    <button
      onClick={logout}
      className={
        light
          ? 'text-sm text-text-400 hover:text-ink-900 transition-colors'
          : 'text-sm text-[var(--crm-muted)] hover:text-[var(--crm-text)] transition-colors'
      }
    >
      Log out
    </button>
  );
}
