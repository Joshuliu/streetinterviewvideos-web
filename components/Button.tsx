import Link from 'next/link';
import { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'darkPrimary' | 'darkSecondary' | 'cta';

// 'primary' / 'darkPrimary' use the green .sign-btn plate.
// 'secondary' / 'darkSecondary' use the companion .sign-btn-alt plate
// (white-with-dark-trim or transparent-with-white-trim), so primary and
// secondary read as members of the same sign family.
// 'cta' uses the .sign-btn-cta plate in orange, reserved for "Book a Call"
// so the conversion action stands out from green nav/section chrome.
const SIGN_PRIMARY: Variant[] = ['primary', 'darkPrimary'];
const SIGN_ALT: Variant[] = ['secondary', 'darkSecondary'];

const ghostStyles =
  'inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-200 px-6 py-3 text-base bg-transparent text-ink-900 hover:bg-paper-soft';

export function Button({
  href,
  children,
  variant = 'primary',
  className = '',
  external = false,
  size = 'lg',
  dataCta,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  size?: 'md' | 'lg';
  dataCta?: string;
}) {
  const sizeText = size === 'lg' ? 'text-sm' : 'text-xs';

  let base: string;
  if (variant === 'cta') {
    base = `sign-btn-cta ${sizeText} ${className}`;
  } else if (SIGN_PRIMARY.includes(variant)) {
    base = `sign-btn ${sizeText} ${className}`;
  } else if (SIGN_ALT.includes(variant)) {
    const onDark = variant === 'darkSecondary' ? 'on-dark' : '';
    base = `sign-btn-alt ${onDark} ${sizeText} ${className}`;
  } else {
    // ghost (light, unbordered), kept as the textual / tertiary action style
    base = `${ghostStyles} ${className}`;
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base} data-cta={dataCta}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={base} data-cta={dataCta}>
      {children}
    </Link>
  );
}
