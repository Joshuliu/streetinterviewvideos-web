'use client';

// `light` switches the label colors for studio's light theme; team stays dark.
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
          : 'text-sm text-[#9ca3af] hover:text-white transition-colors'
      }
    >
      Log out
    </button>
  );
}
