'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addMeeting, deleteLeadMeeting, setMeetingTime } from '@/app/team/(app)/actions';
import type { MeetingView } from '@/lib/crm/meetings';

// One card per call, on the lead page before they convert and on the client
// page after (a converted person's whole call history reads from the client
// page — sales calls included, so you never hop back to the lead to remember
// what was said). Notes are NOT per meeting: internal notes are one stream per
// person, rendered by InternalNotes right below this list.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-base sm:text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

function TimeEditor({ meetingId, initialLocal, onDone }: { meetingId: string; initialLocal: string; onDone: () => void }) {
  const [value, setValue] = useState(initialLocal);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form
      action={() =>
        startTransition(async () => {
          const fd = new FormData();
          fd.set('meetingId', meetingId);
          fd.set('startAtISO', value ? new Date(value).toISOString() : '');
          const res = await setMeetingTime(fd);
          if (res.ok) {
            onDone();
            router.refresh();
          } else setError(res.error);
        })
      }
      className="inline-flex flex-wrap items-center gap-2"
    >
      <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} className={fieldStyles} />
      <button type="submit" disabled={busy} className="text-xs font-semibold text-[#2a9a4a] hover:text-[#2a9a4a]/80 disabled:opacity-60">
        Save
      </button>
      <button type="button" onClick={onDone} className="text-xs text-[#9ca3af] hover:text-white">
        Cancel
      </button>
      {error && <span className="text-xs text-[#f97316]">{error}</span>}
    </form>
  );
}

function MeetingCard({ meeting }: { meeting: MeetingView }) {
  const [editingTime, setEditingTime] = useState(false);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  const badge = meeting.canceled
    ? { label: 'Canceled', className: 'bg-[#1a1a1a] text-[#6b6b6b] border-[#2a2a2a]' }
    : meeting.done
      ? { label: 'Happened', className: 'bg-[#0e4a22] text-[#a7f3c0] border-[#1f7a3a]' }
      : { label: 'Upcoming', className: 'bg-[#9a3412]/40 text-[#fdba74] border-[#ea580c]' };

  return (
    <div className={`rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3 ${meeting.canceled ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`text-sm font-semibold ${meeting.canceled ? 'line-through text-[#9ca3af]' : 'text-white'}`}>
          {meeting.label ?? 'Time not synced'}
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>{badge.label}</span>
        <span className="text-[11px] text-[#6b6b6b]">{meeting.manual ? 'added by hand' : 'Calendly'}</span>
        <span className="flex-1" />
        {!meeting.canceled && !editingTime && (
          <button type="button" onClick={() => setEditingTime(true)} className="text-xs text-[#9ca3af] hover:text-white">
            {meeting.label ? 'Edit time' : 'Set time'}
          </button>
        )}
        {meeting.manual && !editingTime && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              startTransition(async () => {
                await deleteLeadMeeting(meeting.id);
                router.refresh();
              })
            }
            className="text-xs text-[#9ca3af] hover:text-[#f97316] disabled:opacity-60"
          >
            Remove
          </button>
        )}
      </div>
      {editingTime && (
        <div className="mt-3">
          <TimeEditor meetingId={meeting.id} initialLocal={meeting.initialLocal} onDone={() => setEditingTime(false)} />
          {!meeting.manual && (
            <p className="text-[11px] text-[#6b6b6b] mt-1.5">
              Calendly meeting: the sync will put the time back to whatever Calendly says. Real reschedules happen there.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Pass whichever the page is: `leadId` on a lead, `accountId` on a client. */
export function Meetings({
  leadId,
  accountId,
  meetings,
}: {
  leadId?: string;
  accountId?: string;
  meetings: MeetingView[];
}) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-2.5">
      {meetings.length === 0 && <p className="text-sm text-[#9ca3af]">No calls yet.</p>}
      {meetings.map((m) => (
        <MeetingCard key={m.id} meeting={m} />
      ))}

      {adding ? (
        <form
          action={() =>
            startTransition(async () => {
              const fd = new FormData();
              if (leadId) fd.set('leadId', leadId);
              if (accountId) fd.set('accountId', accountId);
              fd.set('startAtISO', value ? new Date(value).toISOString() : '');
              const res = await addMeeting(fd);
              if (res.ok) {
                setAdding(false);
                setValue('');
                setError(null);
                router.refresh();
              } else setError(res.error);
            })
          }
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} className={fieldStyles} />
          <button type="submit" disabled={busy} className="text-xs font-semibold text-[#2a9a4a] hover:text-[#2a9a4a]/80 disabled:opacity-60">
            Add
          </button>
          <button type="button" onClick={() => setAdding(false)} className="text-xs text-[#9ca3af] hover:text-white">
            Cancel
          </button>
          {error && <span className="text-xs text-[#f97316]">{error}</span>}
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-xs text-[#9ca3af] hover:text-white pt-1">
          + Add a call by hand (booked over text or email; Calendly ones appear on their own)
        </button>
      )}
    </div>
  );
}
