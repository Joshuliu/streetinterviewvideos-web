'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addLeadMeeting, deleteLeadMeeting, saveMeetingNotes, setMeetingTime } from '@/app/team/(app)/actions';

// The lead page's meeting history: one card per call (first strategy call,
// follow-ups), each with the time, where it came from, and OUR internal
// notes. Calendly owns the times of synced rows; hand-added rows cover calls
// arranged over text. Same server-action pattern as the rest of team.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-base sm:text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

export interface MeetingView {
  id: string;
  /** "Wed, Jul 30 · 10:30 AM", or null when the time never synced. */
  label: string | null;
  /** datetime-local string for the editor, business timezone. */
  initialLocal: string;
  canceled: boolean;
  done: boolean;
  /** Hand-entered (no Calendly event behind it) — editable/deletable here. */
  manual: boolean;
  notes: string;
}

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
  const [notesState, setNotesState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  const badge = meeting.canceled
    ? { label: 'Canceled', className: 'bg-[#1a1a1a] text-[#6b6b6b] border-[#2a2a2a]' }
    : meeting.done
      ? { label: 'Happened', className: 'bg-[#0e4a22] text-[#a7f3c0] border-[#1f7a3a]' }
      : { label: 'Upcoming', className: 'bg-[#9a3412]/40 text-[#fdba74] border-[#ea580c]' };

  return (
    <div className={`rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 ${meeting.canceled ? 'opacity-60' : ''}`}>
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

      <form
        action={(fd) =>
          startTransition(async () => {
            const res = await saveMeetingNotes(fd);
            setNotesState(res.ok ? 'saved' : 'error');
            if (res.ok) router.refresh();
          })
        }
        className="mt-3"
      >
        <input type="hidden" name="meetingId" value={meeting.id} />
        <label htmlFor={`mn-${meeting.id}`} className="block text-xs uppercase tracking-wider text-[#9ca3af] font-semibold">
          Internal notes
        </label>
        <textarea
          id={`mn-${meeting.id}`}
          name="notes"
          rows={meeting.notes ? 4 : 2}
          defaultValue={meeting.notes}
          onChange={() => setNotesState('idle')}
          placeholder="Ours only, the client never sees these. What happened, objections, next step…"
          className={`${fieldStyles} w-full resize-y mt-1.5`}
        />
        <div className="flex items-center gap-3 mt-2">
          <button type="submit" disabled={busy} className="sign-btn-cta text-xs px-3 py-1.5 disabled:opacity-60">
            {busy ? 'Saving…' : 'Save notes'}
          </button>
          {notesState === 'saved' && !busy && <span className="text-xs text-[#2a9a4a] font-semibold">Saved</span>}
          {notesState === 'error' && !busy && <span className="text-xs text-[#f97316]">Could not save. Try again</span>}
        </div>
      </form>
    </div>
  );
}

export function LeadMeetings({ leadId, meetings }: { leadId: string; meetings: MeetingView[] }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-3">
      {meetings.length === 0 && <p className="text-sm text-[#9ca3af]">No meetings yet.</p>}
      {meetings.map((m) => (
        <MeetingCard key={m.id} meeting={m} />
      ))}

      {adding ? (
        <form
          action={() =>
            startTransition(async () => {
              const fd = new FormData();
              fd.set('leadId', leadId);
              fd.set('startAtISO', value ? new Date(value).toISOString() : '');
              const res = await addLeadMeeting(fd);
              if (res.ok) {
                setAdding(false);
                setValue('');
                setError(null);
                router.refresh();
              } else setError(res.error);
            })
          }
          className="flex flex-wrap items-center gap-2"
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
        <button type="button" onClick={() => setAdding(true)} className="text-xs text-[#9ca3af] hover:text-white">
          + Add a meeting by hand (booked over text or email; Calendly ones appear on their own)
        </button>
      )}
    </div>
  );
}
