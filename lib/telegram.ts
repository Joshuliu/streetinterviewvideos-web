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
//
// TELEGRAM_CHAT_ID may be a single id or a comma-separated list to alert
// several people (e.g. "6261151414,5710168061"). Each recipient must have
// started the bot first.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_IDS = (process.env.TELEGRAM_CHAT_ID || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function telegramConfigured(): boolean {
  return Boolean(TOKEN && CHAT_IDS.length);
}

// Escape the few characters that matter for Telegram's HTML parse mode.
export function escapeHtml(v: string): string {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendOne(chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      console.error('[telegram] sendMessage', chatId, res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[telegram] error', chatId, err);
    return false;
  }
}

// Sends to every configured chat id. ok = at least one delivered.
export async function sendTelegram(
  text: string
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!TOKEN || !CHAT_IDS.length) return { ok: true, skipped: true };
  const results = await Promise.all(CHAT_IDS.map((id) => sendOne(id, text)));
  return { ok: results.some(Boolean) };
}
