/**
 * StreetInterviewVideos.com — Lead capture webhook (Google Apps Script)
 * =====================================================================
 *
 * Receives lead posts from /api/lead (which forwards them when the Vercel env
 * var LEAD_WEBHOOK_URL points at this script's Web App URL) and writes them to
 * a Google Sheet. Each lead is ONE row keyed by `leadId`, and the row fills in
 * as the visitor progresses through the funnel:
 *
 *   contact  → name, work email, phone        (after step 1)
 *   brand    → + company, website             (after step 2)
 *   qualified / unqualified → + ad spend       (after step 3)
 *   booked   → they picked a Calendly time     (on booking)
 *
 * Subsequent posts UPDATE the same row (overwriting only with non-empty values
 * and advancing the status), so you never lose a partial lead and never get
 * duplicate rows.
 *
 * ── SETUP (~2 min) ───────────────────────────────────────────────────
 * 1. Create a new Google Sheet. Note its tab name (default "Sheet1" is fine;
 *    or rename a tab to "Leads" — the script uses "Leads" if it exists, else
 *    the first tab).
 * 2. Extensions → Apps Script. Delete the boilerplate, paste this whole file.
 * 3. Click Deploy → New deployment → type "Web app".
 *      - Description: leads
 *      - Execute as: Me
 *      - Who has access: Anyone   ← required so the server can POST to it
 *    Deploy, authorize when prompted, and COPY the Web app URL
 *    (ends in /exec).
 * 4. In Vercel → Project → Settings → Environment Variables, set
 *      LEAD_WEBHOOK_URL = <that /exec URL>
 *    for Production + Preview, then redeploy (env vars apply on next deploy).
 * 5. Done. Walk the /qualify funnel once and watch a row appear and fill in.
 *
 * If you change the script later, Deploy → Manage deployments → edit → deploy
 * a NEW version (the /exec URL stays the same).
 */

// Column order written to the sheet. Edit freely — header row is (re)written
// to match. `createdAt` is set once; `updatedAt` bumps on every post.
var HEADERS = [
  'leadId',
  'status',
  'name',
  'email',
  'phone',
  'company',
  'website',
  'adspend',
  'qualified',
  'utm',
  'source',
  'createdAt',
  'updatedAt',
];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Leads') || ss.getSheets()[0];
  // Ensure the header row exists / matches.
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow[0] !== 'leadId') {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
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
    case 'updatedAt': return now;
    case 'createdAt': return now;
    default: return '';
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // serialize so concurrent posts can't double-append
  try {
    var body = JSON.parse(e.postData.contents);
    if (!body.leadId) {
      // No id → just append so nothing is silently dropped.
      body.leadId = 'noid-' + new Date().getTime();
    }
    var sheet = getSheet_();
    var now = new Date();
    var values = sheet.getDataRange().getValues();

    // Find existing row by leadId (column 1).
    var rowIndex = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(body.leadId)) { rowIndex = i + 1; break; }
    }

    if (rowIndex === -1) {
      // New lead → append a full row.
      var row = HEADERS.map(function (h) { return fieldFor_(h, body, now); });
      sheet.appendRow(row);
    } else {
      // Existing lead → overwrite only with non-empty new values; keep
      // createdAt; always bump updatedAt and advance status.
      var existing = values[rowIndex - 1];
      var row = HEADERS.map(function (h, ci) {
        if (h === 'createdAt') return existing[ci] || now;
        if (h === 'updatedAt') return now;
        var nv = fieldFor_(h, body, now);
        return (nv !== '' && nv !== null && nv !== undefined) ? nv : existing[ci];
      });
      sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([row]);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Simple health check so visiting the URL in a browser confirms it's live.
function doGet() {
  return json_({ ok: true, service: 'siv-lead-webhook' });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
