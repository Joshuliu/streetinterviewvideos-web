/**
 * StreetInterviewVideos.com — Lead capture webhook + Telegram alerts (Apps Script)
 * ================================================================================
 *
 * Receives lead posts from /api/lead (forwarded when Vercel's LEAD_WEBHOOK_URL
 * points at this script's Web App URL) and:
 *   1. Writes them to a Google Sheet — ONE row per lead, keyed by `leadId`,
 *      filling in as the visitor progresses:
 *        contact (step 1) → brand (step 2) → qualified/unqualified (step 3) → booked
 *   2. Sends a Telegram alert that EDITS ONE message in place through every
 *      stage (contact → … → qualified → booked), so there's just one tidy,
 *      self-updating message per lead and no duplicate texts. The message id
 *      per recipient is remembered in a hidden column on the lead's row, which
 *      is why this lives in the script (the stateless serverless route can't
 *      remember it).
 *
 * ── SETUP ────────────────────────────────────────────────────────────
 * A) Sheet + Web App (if not already done):
 *    1. Extensions → Apps Script, paste this whole file (replacing the old one).
 *    2. Deploy → Manage deployments → edit your deployment → deploy a NEW
 *       version (the /exec URL stays the same). If first time: Deploy → New
 *       deployment → Web app, Execute as: Me, Who has access: Anyone.
 * B) Telegram (Project Settings → Script properties → Add script property):
 *       TELEGRAM_BOT_TOKEN = 123456:ABC...            (from @BotFather)
 *       TELEGRAM_CHAT_ID   = 6261151414,5710168061    (comma-separated; each
 *                            recipient must have started the bot)
 *    Telegram alerts no-op until both properties are set.
 *
 * NOTE: with this change, Telegram moves OUT of Vercel. You can delete the
 * TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID env vars from Vercel — they're now
 * Script properties here instead.
 */

// Column order. `tgMsgIds` (last) stores the per-recipient Telegram message ids
// as JSON so the alert can be edited in place; you can hide that column.
var HEADERS = [
  'leadId', 'status', 'name', 'email', 'phone', 'company', 'website',
  'adspend', 'qualified', 'utm', 'source', 'createdAt', 'updatedAt', 'tgMsgIds',
];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Leads') || ss.getSheets()[0];
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]); // idempotent header row
  sheet.setFrozenRows(1);
  return sheet;
}

function fieldFor_(key, body, now) {
  switch (key) {
    case 'leadId':  return String(body.leadId || '');
    case 'status':  return String(body.stage || '');
    case 'name':    return String(body.name || '');
    case 'email':   return String(body.email || '');
    case 'phone':   return String(body.phone || '');
    case 'company': return String(body.company || '');
    case 'website': return String(body.website || '');
    case 'adspend': return String(body.adspend || '');
    case 'qualified':
      return body.qualified === true ? 'yes' : body.qualified === false ? 'no' : '';
    case 'utm':
      return body.utm && typeof body.utm === 'object' ? JSON.stringify(body.utm) : '';
    case 'source':  return String(body.source || '');
    case 'createdAt': return now;
    case 'updatedAt': return now;
    case 'tgMsgIds': return ''; // managed separately after the Telegram send
    default: return '';
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var body = JSON.parse(e.postData.contents);
    if (!body.leadId) body.leadId = 'noid-' + new Date().getTime();

    var sheet = getSheet_();
    var now = new Date();
    var values = sheet.getDataRange().getValues();
    var msgCol = HEADERS.indexOf('tgMsgIds'); // 0-based

    // Find existing row by leadId (column 1).
    var rowIndex = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(body.leadId)) { rowIndex = i + 1; break; }
    }

    var existingMsgIds = '{}';
    if (rowIndex === -1) {
      var row = HEADERS.map(function (h) { return fieldFor_(h, body, now); });
      sheet.appendRow(row);
      rowIndex = sheet.getLastRow();
    } else {
      var existing = values[rowIndex - 1];
      existingMsgIds = existing[msgCol] || '{}';
      var updated = HEADERS.map(function (h, ci) {
        if (h === 'createdAt') return existing[ci] || now;
        if (h === 'updatedAt') return now;
        if (h === 'tgMsgIds') return existing[ci]; // keep; updated below
        var nv = fieldFor_(h, body, now);
        return (nv !== '' && nv !== null && nv !== undefined) ? nv : existing[ci];
      });
      sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([updated]);
    }

    // Isolate Telegram errors so a notify failure never breaks the sheet write.
    try {
      notifyTelegram_(sheet, rowIndex, msgCol, body, existingMsgIds);
    } catch (tgErr) {
      console.error('telegram notify failed: ' + tgErr);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function notifyTelegram_(sheet, rowIndex, msgCol, body, existingMsgIdsJson) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatIds = (props.getProperty('TELEGRAM_CHAT_ID') || '')
    .split(',').map(function (s) { return s.trim(); }).filter(String);
  if (!token || !chatIds.length) return; // not configured → no-op

  var text = tgMessage_(body);
  var map = {};
  try { map = JSON.parse(existingMsgIdsJson || '{}'); } catch (e2) { map = {}; }

  // One message per lead, edited in place through EVERY stage (contact → … →
  // qualified → booked). Telegram edits are silent (no extra ping per stage) —
  // that's the intent: one tidy, self-updating message, no duplicate texts.
  chatIds.forEach(function (cid) {
    var mid = map[cid];
    if (mid) {
      // Edit in place; if the message is gone / too old / unchanged, send fresh.
      if (!tgEdit_(token, cid, mid, text)) {
        var nid = tgSend_(token, cid, text);
        if (nid) map[cid] = nid;
      }
    } else {
      var nid2 = tgSend_(token, cid, text);
      if (nid2) map[cid] = nid2;
    }
  });

  sheet.getRange(rowIndex, msgCol + 1, 1, 1).setValue(JSON.stringify(map));
}

function tgMessage_(body) {
  var H = {
    contact: '🟢 <b>New lead</b>',
    brand: '🟢 <b>New lead</b>',
    qualified: '🔥 <b>Qualified lead</b>',
    unqualified: '⚪ <b>Unqualified lead</b> · under $5k/mo',
    booked: '📅 <b>Call booked</b>',
  };
  var e = function (v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  var lines = [H[body.stage] || '🟢 <b>Lead</b>', ''];
  if (body.name) lines.push('👤 <b>Name:</b> ' + e(body.name));
  if (body.email) lines.push('✉️ <b>Email:</b> ' + e(body.email));
  if (body.phone) lines.push('📞 <b>Phone:</b> ' + e(body.phone));
  if (body.company) lines.push('🏢 <b>Company:</b> ' + e(body.company));
  if (body.website) lines.push('🔗 <b>Website:</b> ' + e(body.website));
  if (body.adspend) lines.push('💰 <b>Ad spend:</b> ' + e(body.adspend) + '/mo');
  if (body.utm && body.utm.utm_source) {
    var camp = body.utm.utm_campaign ? ' · ' + e(body.utm.utm_campaign) : '';
    lines.push('🎯 <b>Source:</b> ' + e(body.utm.utm_source) + camp);
  }
  return lines.join('\n');
}

function tgSend_(token, chatId, text) {
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  var data = JSON.parse(res.getContentText());
  return data.ok ? data.result.message_id : null;
}

function tgEdit_(token, chatId, messageId, text) {
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/editMessageText', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ chat_id: chatId, message_id: messageId, text: text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  var data = JSON.parse(res.getContentText());
  return !!data.ok; // false if message gone / unchanged → caller falls back to send
}

// Health check.
function doGet() {
  return json_({ ok: true, service: 'siv-lead-webhook' });
}

/**
 * Run this ONCE from the Apps Script editor (select testTelegram in the
 * function dropdown → Run) to grant the new permissions (external requests +
 * script properties) and confirm the bot can send. Google will prompt for
 * authorization — approve it (if it warns the app is "unverified", click
 * Advanced → Go to project → Allow). You should then get a test message in
 * Telegram. Check View → Execution log for details.
 */
function testTelegram() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatIds = (props.getProperty('TELEGRAM_CHAT_ID') || '')
    .split(',').map(function (s) { return s.trim(); }).filter(String);
  Logger.log('TELEGRAM_BOT_TOKEN set: ' + !!token);
  Logger.log('TELEGRAM_CHAT_ID: ' + JSON.stringify(chatIds));
  if (!token || !chatIds.length) {
    Logger.log('❌ Missing script properties — set them in Project Settings → Script properties.');
    return;
  }
  chatIds.forEach(function (cid) {
    var mid = tgSend_(token, cid, '🔧 <b>Test</b> — Apps Script Telegram is authorized and working.');
    Logger.log('sent to ' + cid + ' → message_id ' + mid + (mid ? ' ✅' : ' ❌ (check token/chat id)'));
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
