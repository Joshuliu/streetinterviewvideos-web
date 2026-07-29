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
 * and adds josh@ and neil@ as guests, so both get the meeting (with the video
 * link) on their own calendars automatically. This is the free replacement
 * for Calendly's paid co-hosts feature.
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
 *   SEND_UPDATES = 'none' nobody is emailed about the change (the client
 *   isn't confused by an "event updated" mail). Switch to 'all' if josh/neil
 *   also want an invite email each time.
 * - Only events whose description contains calendly.com are touched (that's
 *   where Calendly puts its reschedule/cancel links), so manually created
 *   events on studio@'s calendar are left alone.
 */

var GUESTS = ['josh@streetinterviewvideos.com', 'neil@streetinterviewvideos.com'];
var CALENDAR_ID = 'primary'; // studio@'s own calendar
var LOOKAHEAD_DAYS = 60;
var SEND_UPDATES = 'none'; // 'none' | 'all' (see note above)

/** Run once by hand: installs the trigger and does a first scan. */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'addGuestsToCalendlyEvents') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('addGuestsToCalendlyEvents').timeBased().everyMinutes(5).create();
  addGuestsToCalendlyEvents();
}

function addGuestsToCalendlyEvents() {
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
    });
    pageToken = resp.nextPageToken;
  } while (pageToken);
}
