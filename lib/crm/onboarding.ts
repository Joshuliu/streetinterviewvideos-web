// The onboarding form questions. The six fields are columns on
// onboarding_forms (lib/db/schema.ts); this file owns their wording and
// order. Business-side only since 2026-08-30: admins fill it in during the
// sales call and the shoot brief is written from it.

export const ONBOARDING_QUESTIONS = [
  {
    field: 'products',
    label: 'Products & value props',
    prompt: 'Describe the product(s) you are looking to promote and any specific value props you’d like us to push.',
    placeholder: 'What are we promoting, and what should people remember about it?',
  },
  {
    field: 'hooks',
    label: 'Hooks & ice breakers',
    prompt: 'Any specific hooks/ice breakers you’d like us to use for starting the interactions?',
    placeholder: 'Opening lines, questions, or bits that fit the brand.',
  },
  {
    field: 'ctas',
    label: 'CTA points',
    prompt: 'Any points you’d like us to push in the CTAs (e.g. clicking a link, promotions)?',
    placeholder: 'Where should viewers go, and what gets them there?',
  },
  {
    field: 'hostPreferences',
    label: 'Host demographic',
    prompt: 'Do you have any preferences for the host demographic?',
    placeholder: 'Age range, vibe, style — or no preference.',
  },
  {
    field: 'intervieweePreferences',
    label: 'Interviewee demographic',
    prompt: 'Do you have any preferences for the people we interview on the street?',
    placeholder: 'Age range, gender split, profession, city, or no preference.',
  },
  {
    field: 'additionalNotes',
    label: 'Additional notes',
    prompt: 'Any additional notes?',
    placeholder: 'Anything else worth knowing before we write the brief.',
  },
] as const;

export type OnboardingField = (typeof ONBOARDING_QUESTIONS)[number]['field'];

export const ONBOARDING_FIELDS = ONBOARDING_QUESTIONS.map((q) => q.field) as OnboardingField[];
