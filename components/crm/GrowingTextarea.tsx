'use client';

import { useState } from 'react';

// Box metrics the auto-growing field and its measuring twin MUST share, or the
// twin sizes the box wrong. Font size (and so line height) changes at `sm`,
// which is exactly why both sides read it from the same string instead of
// hard-coding a height.
const boxMetrics = 'w-full min-w-0 rounded-lg border px-3 py-2 text-base sm:text-sm';

/**
 * A textarea that grows with its content, with no height measurement anywhere.
 *
 * The obvious implementation (read `scrollHeight` on input and set `height`)
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
 *
 * `minRows` adds a second invisible twin of that many empty lines. The grid row
 * takes the taller of the two, so the box starts at a sensible size and still
 * grows past it. Do NOT pad the text twin with newlines instead: one long
 * wrapped line is several visual rows but only one newline, so the box would
 * over-grow.
 *
 * Uncontrolled (`defaultValue`) is supported so plain FormData forms can use
 * this without lifting every field into state; pass `value` + `onChange` when
 * the parent needs to clear or drive the box.
 */
export function GrowingTextarea({
  value,
  defaultValue,
  onChange,
  className = '',
  minRows = 1,
  maxHeightClass = 'max-h-56',
  ...props
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  className?: string;
  /** Lines the box is at least tall, before any text is typed. */
  minRows?: number;
  /** Height the box stops growing at and starts scrolling inside. */
  maxHeightClass?: string;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'defaultValue' | 'onChange' | 'style' | 'rows'
>) {
  const [inner, setInner] = useState(defaultValue ?? '');
  const text = value ?? inner;
  return (
    <div className="grid">
      <div
        aria-hidden
        className={`${boxMetrics} ${maxHeightClass} invisible col-start-1 row-start-1 overflow-hidden whitespace-pre-wrap break-words`}
      >
        {text + '\n'}
      </div>
      {minRows > 1 && (
        <div
          aria-hidden
          className={`${boxMetrics} invisible col-start-1 row-start-1 overflow-hidden whitespace-pre-wrap`}
        >
          {'\n'.repeat(minRows - 1) + ' '}
        </div>
      )}
      <textarea
        {...props}
        value={text}
        onChange={(e) => {
          setInner(e.target.value);
          onChange?.(e.target.value);
        }}
        className={`${className} ${boxMetrics} col-start-1 row-start-1 resize-none overflow-y-auto`}
      />
    </div>
  );
}
