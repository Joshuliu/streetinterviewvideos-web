// Telegram notification helper. Sends a message to a chat via the Bot API when
// a lead comes in. Dormant (no-op) until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
// are configured — same safe pattern as LEAD_WEBHOOK_URL / META_CAPI_TOKEN.
//
// Setup:
//  1. In Telegram, message @BotFather → /newbot (or reuse an existing bot) to
//     get the bot TOKEN.
//  2. Get the CHAT_ID for where alerts should go:
//       - DM: message your bot once, then open
//         https://api.telegram.org/bot<TOKEN>/getUpdates and read result[].message.chat.id
//       - Group: add the bot to the group, send a message, same getUpdates call
//         (group ids are negative, e.g. -1001234567890).
//  3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Vercel (server-only, NOT
//     NEXT_PUBLIC) for Production + Preview, then redeploy.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export function telegramConfigured(): boolean {
  return Boolean(TOKEN && CHAT_ID);
}

// Escape the few characters that matter for Telegram's HTML parse mode.
export function escapeHtml(v: string): string {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function sendTelegram(
  text: string
): Promise<{ ok: boolean; skipped?: boolean; status?: number }> {
  if (!TOKEN || !CHAT_ID) return { ok: true, skipped: true };
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      console.error('[telegram] sendMessage', res.status, await res.text().catch(() => ''));
      return { ok: false, status: res.status };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    console.error('[telegram] error', err);
    return { ok: false };
  }
}
