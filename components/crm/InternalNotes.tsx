'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addNote, deleteNote } from '@/app/team/(app)/actions';

// The one internal-notes stream for a person. Same component on the lead page
// and the client page; on a client it also shows the notes from back when they
// were a lead, so the sales history and the delivery history read as one list.
//
// "Visible to client" is offered on a client only (a lead has no studio
// access). Checked, the note shows up in their studio "Updates" — everything
// else here is ours.

const fieldStyles =
  'min-w-0 max-w-full rounded-lg bg-[#0a0a0a] border border-[#3a3a3a] px-3 py-2 text-base sm:text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#f97316]';

// Box metrics the auto-growing note field and its measuring twin MUST share,
// or the twin sizes the box wrong. Font size (and so line height) changes at
// `sm`, which is exactly why both sides read it from the same string instead of
// hard-coding a height.
const boxMetrics = 'w-full min-w-0 rounded-lg border px-3 py-2 text-base sm:text-sm';

/**
 * A textarea that grows with its content, with no height measurement anywhere.
 *
 * The obvious implementation — read `scrollHeight` on input and set `height` —
 * was tried and abandoned: in testing, an empty box reported a `scrollHeight`
 * of 1120px (the PLACEHOLDER inflates it), and after clearing the placeholder
 * one line reported 184px while five lines reported 136px. Sizing the box off
 * numbers that incoherent is not something to ship to an iPhone.
 *
 * Instead the text is rendered twice into one grid cell: an invisible div that
 * wraps and sets the row's height, and the textarea stretched over it. The
 * browser does the wrapping maths itself, so this is correct at any font size,
 * width or zoom. The trailing newline keeps a blank final line from collapsing,
 * so pressing Enter grows the box immediately.
 */
function GrowingTextarea({
  value,
  onChange,
  ...props
}: { value: string; onChange: (v: string) => void } & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'style' | 'rows'
>) {
  return (
    <div className="grid">
      <div
        aria-hidden
        className={`${boxMetrics} invisible col-start-1 row-start-1 max-h-56 overflow-hidden whitespace-pre-wrap break-words`}
      >
        {value + '\n'}
      </div>
      <textarea
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldStyles} ${boxMetrics} col-start-1 row-start-1 resize-none overflow-y-auto`}
      />
    </div>
  );
}

export interface NoteView {
  id: string;
  date: string; // already formatted, e.g. "Jul 29"
  text: string;
  clientVisible: boolean;
  /** True for a note written before they converted. */
  fromLead: boolean;
}

function NoteRow({ note, showLeadTag }: { note: NoteView; showLeadTag: boolean }) {
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  return (
    <li className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#9ca3af] mb-1">
        {note.date}
        {note.clientVisible && (
          <span className="rounded bg-[#1f7a3a] px-1.5 py-0.5 text-[10px] font-semibold text-white">CLIENT-VISIBLE</span>
        )}
        {showLeadTag && note.fromLead && (
          <span className="rounded bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 text-[10px] font-semibold text-[#9ca3af]">
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
          className="text-[#6b6b6b] hover:text-[#f97316] font-bold disabled:opacity-60"
        >
          ×
        </button>
      </div>
      <p className="text-sm text-white whitespace-pre-wrap break-words">{note.text}</p>
    </li>
  );
}

/** How many notes render before the rest fold behind "Show all". Without a cap
 *  the section grows without bound and shoves everything under it (on a lead:
 *  the captured info, the onboarding form, and the convert button) further down
 *  the page with every note written. */
const VISIBLE_NOTES = 5;

/** Pass whichever the page is: `leadId` on a lead, `accountId` on a client. */
export function InternalNotes({
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
            // Clears the box (controlled) and puts the date back to today /
            // unticks client-visible (uncontrolled), so the next note starts
            // clean instead of inheriting the last one's settings.
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
          placeholder="What happened, objections, what we agreed, next step…"
        />
        <div className="flex flex-wrap items-center gap-3">
          <input type="date" name="date" defaultValue={today} className={fieldStyles} />
          {isClient && (
            <label className="inline-flex items-center gap-2 text-xs text-[#9ca3af]">
              <input type="checkbox" name="clientVisible" className="accent-[#1f7a3a]" />
              Visible to client
            </label>
          )}
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
          className="mt-3 text-xs font-semibold text-[#fdba74] hover:underline"
        >
          Show {hidden} older {hidden === 1 ? 'note' : 'notes'}
        </button>
      )}
      {showAll && notes.length > VISIBLE_NOTES && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="mt-3 text-xs font-semibold text-[#9ca3af] hover:text-white"
        >
          Show fewer
        </button>
      )}
      {notes.length === 0 && <p className="text-sm text-[#6b6b6b]">No notes yet.</p>}
    </div>
  );
}
