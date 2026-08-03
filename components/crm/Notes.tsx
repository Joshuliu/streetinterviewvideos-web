'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addNote, deleteNote } from '@/app/team/(app)/actions';
import { GrowingTextarea } from './GrowingTextarea';

// The one notes stream for a person. Same component on the lead page and the
// client page; on a client it also shows the notes from back when they were a
// lead, so the sales history and the delivery history read as one list.
//
// Notes are ours, always (2026-07-31). There used to be a "Visible to client"
// tick that pushed a note into the studio "Updates" list; it was removed
// because clients are updated by email, and a box that is sometimes
// client-facing makes the whole stream something you have to write carefully.
// Nothing on studio. reads notes now, so there is no internal/external split
// left to name: the section is just "Notes".

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[var(--crm-panel)] border border-[var(--crm-line-2)] px-3 py-2 text-base sm:text-sm text-[var(--crm-text)] placeholder-[var(--crm-faint)] focus:outline-none focus:border-[var(--crm-accent)]';

export interface NoteView {
  id: string;
  date: string; // already formatted, e.g. "Jul 29"
  text: string;
  /** True for a note written before they converted. */
  fromLead: boolean;
}

function NoteRow({ note, showLeadTag }: { note: NoteView; showLeadTag: boolean }) {
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <li className="rounded-xl bg-[var(--crm-inset)] border border-[var(--crm-divide)] p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--crm-muted)] mb-1">
        {note.date}
        {showLeadTag && note.fromLead && (
          <span className="rounded bg-[var(--crm-soft)] border border-[var(--crm-line)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--crm-muted)]">
            SALES
          </span>
        )}
        <span className="flex-1" />
        <button
          type="button"
          disabled={busy}
          title="Delete note"
          onClick={() =>
            startTransition(async () => {
              await deleteNote(note.id);
              router.refresh();
            })
          }
          className="text-[var(--crm-faint)] hover:text-[var(--crm-accent)] font-bold disabled:opacity-60"
        >
          ×
        </button>
      </div>
      <p className="text-sm text-[var(--crm-text)] whitespace-pre-wrap break-words">{note.text}</p>
    </li>
  );
}

/** How many notes render before the rest fold behind "Show all". Without a cap
 *  the section grows without bound and shoves everything under it (on a lead:
 *  the captured info, the onboarding form, and the convert button) further down
 *  the page with every note written. */
const VISIBLE_NOTES = 5;

/** Pass whichever the page is: `leadId` on a lead, `accountId` on a client. */
export function Notes({
  leadId,
  accountId,
  notes,
  today,
}: {
  leadId?: string;
  accountId?: string;
  notes: NoteView[];
  today: string;
}) {
  const isClient = !!accountId;
  const [text, setText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [busy, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const shown = showAll ? notes : notes.slice(0, VISIBLE_NOTES);
  const hidden = notes.length - shown.length;

  return (
    <div>
      <form
        ref={formRef}
        action={(fd) =>
          startTransition(async () => {
            await addNote(fd);
            // Clears the box (controlled) and puts the date back to today
            // (uncontrolled), so the next note starts clean instead of
            // inheriting the last one's date.
            setText('');
            formRef.current?.reset();
            router.refresh();
          })
        }
        className="space-y-2 mb-5"
      >
        {accountId && <input type="hidden" name="accountId" value={accountId} />}
        {leadId && <input type="hidden" name="leadId" value={leadId} />}
        <GrowingTextarea
          name="text"
          required
          value={text}
          onChange={setText}
          className={fieldStyles}
          placeholder="What happened, objections, what we agreed, next step…"
        />
        <div className="flex flex-wrap items-center gap-3">
          <input type="date" name="date" defaultValue={today} className={fieldStyles} />
          <button type="submit" disabled={busy} className="sign-btn-cta text-xs px-4 py-2 disabled:opacity-60">
            {busy ? 'Saving…' : 'Add note'}
          </button>
        </div>
      </form>
      <ul className="space-y-3">
        {shown.map((n) => (
          <NoteRow key={n.id} note={n} showLeadTag={isClient} />
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 text-xs font-semibold text-[var(--crm-accent-soft)] hover:underline"
        >
          Show {hidden} older {hidden === 1 ? 'note' : 'notes'}
        </button>
      )}
      {showAll && notes.length > VISIBLE_NOTES && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="mt-3 text-xs font-semibold text-[var(--crm-muted)] hover:text-[var(--crm-text)]"
        >
          Show fewer
        </button>
      )}
      {notes.length === 0 && <p className="text-sm text-[var(--crm-faint)]">No notes yet.</p>}
    </div>
  );
}
