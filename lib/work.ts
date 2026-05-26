// Portfolio videos. Order is curated by the founder and reflects the
// preferred sequence for the public site (hero featured first, then the
// rest of the library). Only videos with a published file in
// /public/videos/ are listed; weak / duplicate / brand-unsafe clips from
// the master review CSV are intentionally not surfaced here.
//
// Copy is derived from per-video scoring notes where available; for newer
// additions without ratings the description is intentionally brief and
// should be updated as briefs come in.

export type WorkVideo = {
  id: string;
  title: string;
  category: string;
  goal: string;
  format: string;
  deliverables: string;
  whyItWorked: string;
  src: string;
  poster: string;
  kind: 'scripted' | 'unscripted';
};

export const ALL_WORK_VIDEOS: WorkVideo[] = [
  {
    id: 'find-the-cat',
    src: '/videos/clip-12.mp4',
    poster: '/posters/clip-12.jpg',
    title: 'Find the Cat — Scripted Street Interview',
    category: 'Branded UGC',
    goal: 'Branded short-form video built for paid social.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~28s edit · sound-on, captioned',
    whyItWorked:
      'Scripted street interview format with hook-led delivery, shot vertical and edited for the feed.',
    kind: 'scripted',
  },
  {
    id: 'mott-bow',
    src: '/videos/clip-04.mp4',
    poster: '/posters/clip-04.jpg',
    title: 'Mott & Bow — Free-Shirt Blind Test',
    category: 'Apparel Sampling',
    goal: 'Prove premium-tee comfort through a blind test and a free-shirt incentive.',
    format: 'Unscripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~40s edit · sound-on, captioned',
    whyItWorked:
      'A free-shirt blind-test incentive pulls real strangers in; a memorable “like a baby floating in a cloud” reaction sells the comfort claim, and the line is unprompted, which is the whole point. Clean brand callout, tight edit.',
    kind: 'unscripted',
  },
  {
    id: 'sunday-swagger',
    src: '/videos/clip-10.mp4',
    poster: '/posters/clip-10.jpg',
    title: 'Sunday Swagger — Beverly Hills Golf-Polo Test',
    category: 'Apparel',
    goal: 'Sell golf polos with a premium location and a buy-one-get-one offer.',
    format: 'Unscripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~46s edit · sound-on, premium audio',
    whyItWorked:
      'A Beverly Hills backdrop raises the production ceiling, the audio is the cleanest in the library, and a buy-one-get-one-50%-off CTA closes. Real strangers, real reactions, no actors.',
    kind: 'unscripted',
  },
  {
    id: 'mental-toughness',
    src: '/videos/clip-07.mp4',
    poster: '/posters/clip-07.jpg',
    title: 'Mental Toughness (Kids’ Book) — Story-Led Street Hook',
    category: 'Sports / Education',
    goal: 'Sell a youth-athlete mindset book to parents with a story-led hook and review proof.',
    format: 'Unscripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~48s edit · sound-on, captioned',
    whyItWorked:
      'A Kobe-and-dad story frames the book emotionally, real age-appropriate interviewees keep it credible, and Amazon-review social proof closes the sale. The trust comes from unprompted parent voices.',
    kind: 'unscripted',
  },
  {
    id: 'cartablet',
    src: '/videos/clip-01.mp4',
    poster: '/posters/clip-01.jpg',
    title: 'CarTablet — Street Price-Reveal Reactions',
    category: 'Auto Accessory',
    goal: 'Sell an aftermarket CarTablet touchscreen on paid social with a price-reveal hook and real urgency.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~55s edit · sound-on, captioned',
    whyItWorked:
      'A multi-interviewee street format builds to a price reveal, $1,100 down to $150, 80% off, with a viral-grade off-the-cuff line (“my ex and my little black dress”) carrying the hook. Tightly cut for the feed.',
    kind: 'scripted',
  },
  {
    id: 'simpler-dye',
    src: '/videos/clip-11.mp4',
    poster: '/posters/clip-11.jpg',
    title: 'Simpler Hair Dye — Compliment-to-Demo Story',
    category: 'Men’s Grooming',
    goal: 'Sell a natural men’s hair dye through an in-person before/after demo.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~59s edit · sound-on, captioned',
    whyItWorked:
      'A style-compliment hook turns into an invitation home for a real product demo, an unusual narrative structure with a visible before/after and a genuine “new man” payoff.',
    kind: 'scripted',
  },
  {
    id: 'swipewipe',
    src: '/videos/clip-05.mp4',
    poster: '/posters/clip-05.jpg',
    title: 'SwipeWipe — “150,688 Photos?!” Shock Opener',
    category: 'App Demo',
    goal: 'Drive installs for a photo-cleanup app with a storage-shock hook.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~23s edit · sound-on, captioned',
    whyItWorked:
      'A genuine storage-shock reaction (“150,688 photos?!”) opens cold, and a 23-second runtime keeps it perfectly feed-sized. Strong, clean audio.',
    kind: 'scripted',
  },
  {
    id: 'slimkit',
    src: '/videos/clip-13.mp4',
    poster: '/posters/clip-13.jpg',
    title: 'Slimkit — Scripted Street Interview',
    category: 'Branded UGC',
    goal: 'Branded short-form video built for paid social.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~58s edit · sound-on, captioned',
    whyItWorked:
      'Scripted street interview format with hook-led delivery, shot vertical and edited for the feed.',
    kind: 'scripted',
  },
  {
    id: 'studycom-1200',
    src: '/videos/clip-09.mp4',
    poster: '/posters/clip-09.jpg',
    title: 'Study.com — “$1,200 for One Class?” Street Take',
    category: 'EdTech',
    goal: 'Drive Study.com signups by reframing the cost of a single college class.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~48s edit · burned-in captions',
    whyItWorked:
      'A sharp “$1,200 for one class” cost reframe lands hard, and a real “I dropped out” interviewee adds emotional pull. Burned-in captions carry it sound-off.',
    kind: 'scripted',
  },
  {
    id: 'gasper-jewelry',
    src: '/videos/clip-03.mp4',
    poster: '/posters/clip-03.jpg',
    title: 'Gasper Jewelry — “Jewelry to the Gym?” Street Test',
    category: 'Jewelry Sampling',
    goal: 'Position sweat-proof jewelry for everyday wear and convert with a lifetime-guarantee offer.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~42s edit · sound-on, clean audio',
    whyItWorked:
      'A relatable “would you wear jewelry to the gym?” hook earns attention, then closes on a lifetime guarantee plus a free travel-case CTA. Crisp audio throughout.',
    kind: 'scripted',
  },
  {
    id: 'charter-springbreak',
    src: '/videos/clip-06.mp4',
    poster: '/posters/clip-06.jpg',
    title: 'Offshore Fishing Charter — Spring-Break Hook',
    category: 'Travel / Charter',
    goal: 'Book spring-break charter trips by speaking the audience’s language.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~25s edit · sound-on',
    whyItWorked:
      'Peak Gen-Z vernacular (“NPCs on the beach,” “main character”) makes a charter ad feel like organic content, not a tourism spot. High viral ceiling.',
    kind: 'scripted',
  },
  {
    id: 'zeus-hair',
    src: '/videos/clip-02.mp4',
    poster: '/posters/clip-02.jpg',
    title: 'Zeus Hair Restoration — “Rate This Guy” Reveal',
    category: 'Men’s Hair Restoration',
    goal: 'Drive paid-social demand for a men’s hair-restoration brand with a before/after reveal.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~37s edit · sound-on, captioned',
    whyItWorked:
      'A “rate this guy 1–10” street hook pays off with a same-face reveal, hair edited back in, and genuine “wait, no way!” reactions. A repeatable viral mechanic, not a one-off.',
    kind: 'scripted',
  },
  {
    id: 'allday-energy',
    src: '/videos/clip-14.mp4',
    poster: '/posters/clip-14.jpg',
    title: 'ALLDAY Energy — Scripted Street Interview',
    category: 'Branded UGC',
    goal: 'Branded short-form video built for paid social.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~53s edit · sound-on, captioned',
    whyItWorked:
      'Scripted street interview format with hook-led delivery, shot vertical and edited for the feed.',
    kind: 'scripted',
  },
  {
    id: 'charter-bachelor',
    src: '/videos/clip-08.mp4',
    poster: '/posters/clip-08.jpg',
    title: 'Bachelor-Party Fishing Charter — “Don’t Lose the Groom”',
    category: 'Travel / Bachelor Party',
    goal: 'Book bachelor-party charter groups with a comedy-led hook.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~59s edit · sound-on, clean audio',
    whyItWorked:
      'A “don’t lose the groom” comedy premise and a “groom fighting a shark” visual make a charter ad genuinely funny, shareable well beyond the buying audience.',
    kind: 'scripted',
  },
  {
    id: 'block-party',
    src: '/videos/clip-15.mp4',
    poster: '/posters/clip-15.jpg',
    title: 'Block Party — Scripted Street Interview',
    category: 'Branded UGC',
    goal: 'Branded short-form video built for paid social.',
    format: 'Scripted street interview · Branded UGC',
    deliverables: 'Vertical 9:16 · ~29s edit · sound-on, captioned',
    whyItWorked:
      'Scripted street interview format with hook-led delivery, shot vertical and edited for the feed.',
    kind: 'scripted',
  },
];

export const SCRIPTED_WORK_VIDEOS = ALL_WORK_VIDEOS.filter((v) => v.kind === 'scripted');
export const UNSCRIPTED_WORK_VIDEOS = ALL_WORK_VIDEOS.filter((v) => v.kind === 'unscripted');
