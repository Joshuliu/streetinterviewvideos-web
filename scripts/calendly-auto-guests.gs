/**
 * StreetInterviewVideos.com — Calendly auto-guests (Apps Script)
 * ==============================================================
 *
 * LIVE PROJECT (deployed 2026-07-28, trigger installed, runs as studio@):
 * https://script.google.com/u/6/home/projects/1TV9vgrlkawG17OoRC8dnGvPblYrwdBTQCHoihK-cEUClETajJju2vkxR/edit
 * Edit there when changing behavior, and mirror the change in this file.
 *
 * Runs inside the studio@streetinterviewvideos.com Google account. Every few
 * minutes it scans studio@'s calendar for upcoming Calendly-created bookings
 * and adds the GUESTS below (currently Neil) as guests, so the meeting lands
 * on their calendar (with the video link) automatically. This is the free
 * replacement for Calendly's paid co-hosts feature.
 *
 * ── SETUP (one time, logged in AS studio@) ──────────────────────────
 * 1. Go to script.new, paste this whole file over the default Code.gs.
 * 2. Left sidebar → Services (+) → add "Google Calendar API" (leave the
 *    identifier as "Calendar"). This is the advanced service the script uses
 *    to patch guests onto events.
 * 3. Run the `setup` function once (▶ with `setup` selected). Approve the
 *    authorization prompts. That single run:
 *      - installs the every-5-minutes trigger, and
 *      - does a first scan immediately.
 * 4. Done. Check the Executions page later to see it ticking.
 *
 * Notes:
 * - GUESTS get the event on their calendars because they're attendees; with
 *   SEND_UPDATES = 'none' the Calendar API emails nobody about the change, so
 *   the client isn't hit with an "event updated" mail seconds after booking.
 * - Calendar's sendUpdates is all-or-nothing: there is no way to notify only
 *   the guest you just added. So NOTIFY_GUESTS handles that half separately,
 *   emailing each newly added guest (and only them) a proper invitation with
 *   an .ics attachment, which Gmail renders as an invite card with RSVP
 *   buttons. Leave SEND_UPDATES on 'none' unless you actually want the client
 *   emailed too.
 * - Only events whose description contains calendly.com are touched (that's
 *   where Calendly puts its reschedule/cancel links), so manually created
 *   events on studio@'s calendar are left alone.
 * - One email per guest per event: the invite is sent on the same pass that
 *   adds them, and a guest already on the event is skipped entirely. If a
 *   guest removes themselves, the next scan re-adds and re-invites them.
 */

// Default: Neil only (changed 2026-07-28; Joshua opted out of auto-invites).
var GUESTS = ['neil@streetinterviewvideos.com'];
var CALENDAR_ID = 'primary'; // studio@'s own calendar
var LOOKAHEAD_DAYS = 60;
var SEND_UPDATES = 'none'; // 'none' | 'all' (see note above)
var NOTIFY_GUESTS = true; // email each newly added guest their own invitation
var FROM_NAME = 'StreetInterviewVideos.com';

/**
 * HARD RULE: clients must never receive mail from this script. They are live
 * leads mid-booking; a stray "event updated" or duplicate invite is a real
 * business problem. Two independent guards enforce it, both below.
 *
 * 1. NOTIFY_DOMAINS — inviteGuest() refuses to email any address outside
 *    these domains, so even a bad edit to GUESTS cannot mail a client.
 * 2. The SEND_UPDATES assertion in addGuestsToCalendlyEvents() — the Calendar
 *    API's own notifications are all-or-nothing and would hit every attendee,
 *    clients included, so the script hard-fails rather than run with them on.
 *
 * Only flip ALLOW_CLIENT_EMAILS if you have decided, deliberately, that
 * clients SHOULD be emailed on every guest change. Nothing else needs it.
 */
var NOTIFY_DOMAINS = ['streetinterviewvideos.com'];
var ALLOW_CLIENT_EMAILS = false;

/**
 * CRM sync ping. Every tick also pokes the site's /api/calendly-sync, which
 * pulls ALL Calendly bookings (any channel: funnel embed, direct link, a
 * follow-up booked from a reschedule link) into the CRM's lead list and
 * Neil's task board. This script's 5-minute trigger doubles as the CRM's
 * free heartbeat — Calendly webhooks are a paid feature.
 *
 * One-time setup: Project Settings → Script properties → add CRM_SYNC_KEY
 * with the value of CALENDLY_SYNC_SECRET from the site's env. No property =
 * no ping (logged, not fatal).
 */
var CRM_SYNC_URL = 'https://streetinterviewvideos.com/api/calendly-sync';

/** Run once by hand: installs the trigger and does a first scan. */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'addGuestsToCalendlyEvents') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('addGuestsToCalendlyEvents').timeBased().everyMinutes(5).create();
  addGuestsToCalendlyEvents();
}

function addGuestsToCalendlyEvents() {
  // Guard 2 (see HARD RULE above). Fail loudly and touch nothing, rather than
  // quietly mailing every attendee on every future booking.
  if (!ALLOW_CLIENT_EMAILS && SEND_UPDATES !== 'none') {
    throw new Error(
      'Refusing to run: SEND_UPDATES is "' + SEND_UPDATES + '". Calendar notifications go to ALL ' +
      'attendees including clients. Set it back to "none" (guests are still emailed individually ' +
      'by NOTIFY_GUESTS), or set ALLOW_CLIENT_EMAILS = true if you really mean it.'
    );
  }

  // Overlapping trigger runs could both see a guest as missing and both add
  // and email them. Take the lock or skip this tick; the next one is 5 min out.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('Another run holds the lock; skipping this tick.');
    return;
  }
  try {
    scanAndAddGuests_();
  } finally {
    lock.releaseLock();
  }
  pingCrmSync_();
}

/** Poke the CRM's Calendly sync. Never throws — the guest scan must not fail
 *  because the site was slow. */
function pingCrmSync_() {
  try {
    var key = PropertiesService.getScriptProperties().getProperty('CRM_SYNC_KEY');
    if (!key) {
      Logger.log('CRM sync skipped: no CRM_SYNC_KEY script property set.');
      return;
    }
    var res = UrlFetchApp.fetch(CRM_SYNC_URL, {
      method: 'post',
      headers: { 'x-sync-key': key },
      muteHttpExceptions: true,
    });
    Logger.log('CRM sync: %s %s', res.getResponseCode(), res.getContentText().slice(0, 200));
  } catch (err) {
    Logger.log('CRM sync ping failed: %s', err);
  }
}

function scanAndAddGuests_() {
  var now = new Date();
  var timeMax = new Date(now.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);
  var pageToken = null;
  do {
    var resp = Calendar.Events.list(CALENDAR_ID, {
      timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      maxResults: 100,
      q: 'calendly.com', // free-text match; Calendly puts its links in the description
      pageToken: pageToken,
    });
    (resp.items || []).forEach(function (ev) {
      if (ev.status === 'cancelled') return;
      if (!ev.description || ev.description.indexOf('calendly.com') === -1) return;
      var existing = (ev.attendees || []).map(function (a) {
        return (a.email || '').toLowerCase();
      });
      var missing = GUESTS.filter(function (g) {
        return existing.indexOf(g.toLowerCase()) === -1;
      });
      if (missing.length === 0) return;
      var attendees = (ev.attendees || []).concat(
        missing.map(function (email) {
          return { email: email };
        })
      );
      Calendar.Events.patch({ attendees: attendees }, CALENDAR_ID, ev.id, { sendUpdates: SEND_UPDATES });
      Logger.log('Added %s to "%s" (%s)', missing.join(', '), ev.summary, ev.start && (ev.start.dateTime || ev.start.date));
      if (NOTIFY_GUESTS) missing.forEach(function (email) { inviteGuest(ev, email); });
    });
    pageToken = resp.nextPageToken;
  } while (pageToken);
}

/**
 * Email one newly added guest their own invitation. Never throws: a mail
 * failure must not abort the rest of the scan (the guest is already on the
 * event either way, this is just the heads-up).
 */
function inviteGuest(ev, email) {
  try {
    // Guard 1 (see HARD RULE above). Anything not on our own domain is a
    // client or a stranger, and never gets mail from this script.
    if (!isNotifiableAddress_(email)) {
      Logger.log('BLOCKED invitation email to %s: not on an allowed domain (%s).', email, NOTIFY_DOMAINS.join(', '));
      return;
    }

    var tz = (ev.start && ev.start.timeZone) || Session.getScriptTimeZone();
    var when = ev.start && ev.start.dateTime
      ? Utilities.formatDate(new Date(ev.start.dateTime), tz, "EEEE d MMMM, h:mm a z")
      : (ev.start && ev.start.date) || 'time TBC';
    var title = ev.summary || 'New booking';
    var lines = [title, when];
    if (ev.location) lines.push('Where: ' + ev.location);
    if (ev.htmlLink) lines.push('Open in Calendar: ' + ev.htmlLink);
    lines.push('', 'It is already on your calendar. Details from the booking:', '', ev.description || '');

    var body = lines.join('\n');
    var options = {
      name: FROM_NAME,
      htmlBody: '<p><strong>' + escapeHtml_(title) + '</strong><br>' + escapeHtml_(when) + '</p>'
        + (ev.location ? '<p>Where: ' + escapeHtml_(ev.location) + '</p>' : '')
        + (ev.htmlLink ? '<p><a href="' + ev.htmlLink + '">Open in Google Calendar</a></p>' : '')
        + '<p>It is already on your calendar. Details from the booking:</p>'
        + '<pre style="white-space:pre-wrap;font-family:inherit">' + escapeHtml_(ev.description || '') + '</pre>',
    };

    var ics = buildIcs_(ev, email);
    if (ics) {
      options.attachments = [
        Utilities.newBlob(ics, 'text/calendar; charset=UTF-8; method=REQUEST', 'invite.ics'),
      ];
    }

    MailApp.sendEmail(email, 'Invitation: ' + title + ' (' + when + ')', body, options);
    Logger.log('Emailed invitation to %s for "%s"', email, title);
  } catch (err) {
    Logger.log('Invitation email to %s failed: %s', email, err);
  }
}

/** True only for addresses on our own domains. Matches the domain exactly, so
 *  a lookalike like "notstreetinterviewvideos.com" is rejected. */
function isNotifiableAddress_(email) {
  var at = String(email).toLowerCase().lastIndexOf('@');
  if (at === -1) return false;
  var domain = String(email).toLowerCase().slice(at + 1);
  return NOTIFY_DOMAINS.some(function (d) {
    return domain === String(d).toLowerCase();
  });
}

/** iCalendar REQUEST for the event, so Gmail shows an invite card. */
function buildIcs_(ev, email) {
  if (!ev.start || !ev.start.dateTime || !ev.end || !ev.end.dateTime) return null; // timed events only
  var organizer = (ev.organizer && ev.organizer.email) || Session.getEffectiveUser().getEmail();
  var lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StreetInterviewVideos//Calendly auto-guests//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    'UID:' + (ev.iCalUID || ev.id),
    'SEQUENCE:' + (ev.sequence || 0),
    'DTSTAMP:' + icsDate_(new Date()),
    'DTSTART:' + icsDate_(new Date(ev.start.dateTime)),
    'DTEND:' + icsDate_(new Date(ev.end.dateTime)),
    'SUMMARY:' + icsText_(ev.summary || 'Booking'),
    'DESCRIPTION:' + icsText_(ev.description || ''),
    'LOCATION:' + icsText_(ev.location || ''),
    'ORGANIZER;CN=' + icsText_((ev.organizer && ev.organizer.displayName) || organizer) + ':mailto:' + organizer,
    'ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:' + email,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(icsFold_).join('\r\n') + '\r\n';
}

function icsDate_(d) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsText_(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** RFC 5545 line folding: continuation lines start with a single space. */
function icsFold_(line) {
  if (line.length <= 75) return line;
  var out = line.slice(0, 75);
  var rest = line.slice(75);
  while (rest.length > 74) {
    out += '\r\n ' + rest.slice(0, 74);
    rest = rest.slice(74);
  }
  return out + '\r\n ' + rest;
}

function escapeHtml_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
