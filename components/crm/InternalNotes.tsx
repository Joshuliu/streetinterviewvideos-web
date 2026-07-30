'use client';

import { useTransition } from 'react';
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
  return (
    <div>
      <form action={addNote} className="space-y-2 mb-5">
        {accountId && <input type="hidden" name="accountId" value={accountId} />}
        {leadId && <input type="hidden" name="leadId" value={leadId} />}
        <textarea
          name="text"
          required
          rows={2}
          placeholder="What happened, objections, what we agreed, next step…"
          className={`${fieldStyles} w-full resize-y`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <input type="date" name="date" defaultValue={today} className={fieldStyles} />
          {isClient && (
            <label className="inline-flex items-center gap-2 text-xs text-[#9ca3af]">
              <input type="checkbox" name="clientVisible" className="accent-[#1f7a3a]" />
              Visible to client
            </label>
          )}
          <button type="submit" className="sign-btn-cta text-xs px-4 py-2">
            Add note
          </button>
        </div>
      </form>
      <ul className="space-y-3">
        {notes.map((n) => (
          <NoteRow key={n.id} note={n} showLeadTag={isClient} />
        ))}
      </ul>
      {notes.length === 0 && <p className="text-sm text-[#6b6b6b]">No notes yet.</p>}
    </div>
  );
}
