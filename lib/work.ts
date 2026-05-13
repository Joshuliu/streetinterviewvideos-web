export type WorkCategory = {
  slug: string;
  title: string;
  h1: string;
  meta: string;
  navLabel: string;
  hero: { kicker: string; headline: string; sub: string };
  videos: WorkVideo[];
};

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
};

const SAMPLE_VIDEOS: WorkVideo[] = [
  { id: 'v1',  src: '/videos/clip-01.mp4', poster: '/posters/clip-01.jpg', title: 'DTC Beauty Launch — Public Reactions', category: 'Beauty Brand', goal: 'Launch a new SKU on TikTok and Meta with native creative.', format: 'Scripted street interview', deliverables: '5 vertical edits, 12 hook variants, raw footage, no-caption versions', whyItWorked: 'The ad looked like a TikTok, not a launch ad. CTR doubled the brand’s prior best.' },
  { id: 'v12', src: '/videos/clip-12.mp4', poster: '/posters/clip-12.jpg', title: 'E-Commerce Launch — Hook Test', category: 'DTC E-Commerce', goal: 'Identify winning hooks for a new product launch.', format: 'Hook-engineered UGC + street interview', deliverables: '12 vertical ads, 24 hook variants, raw', whyItWorked: 'Hook variant testing in week 1 gave a 3x performance lift in week 3.' },
  { id: 'v3',  src: '/videos/clip-03.mp4', poster: '/posters/clip-03.jpg', title: 'App Launch — Problem/Solution Hooks', category: 'Mobile App', goal: 'Drive cold installs on Meta with hook variants.', format: 'Scripted UGC + street interview hybrid', deliverables: '10 vertical ads, 20 hook variants, no-caption versions', whyItWorked: 'Hook engineering let the brand fail fast on weak hooks and scale the winners in week 1.' },
  { id: 'v4',  src: '/videos/clip-04.mp4', poster: '/posters/clip-04.jpg', title: 'Skincare Routine — Real Customers', category: 'Beauty Brand', goal: 'Lift landing page conversion with social proof.', format: 'Customer testimonial street interviews', deliverables: '6 short-form testimonials, montage edit, raw footage', whyItWorked: 'Multi-customer montage outperformed single-celebrity testimonial on add-to-cart rate.' },
  { id: 'v5',  src: '/videos/clip-05.mp4', poster: '/posters/clip-05.jpg', title: 'Pop-Up Activation — Brand Reactions', category: 'Brand Activation', goal: 'Capture launch energy and feed paid social with native clips.', format: 'Event-based street interviews', deliverables: '20 short-form clips, hero recap, raw footage', whyItWorked: 'Same-week delivery let the brand run paid ads while the activation was still being talked about.' },
  { id: 'v2',  src: '/videos/clip-02.mp4', poster: '/posters/clip-02.jpg', title: 'Beverage Sampling — Taste Test', category: 'Beverage', goal: 'Build TikTok-native trust ahead of retail rollout.', format: 'Unscripted street interview', deliverables: '8 short-form edits, raw footage, captioned and no-caption', whyItWorked: 'Real reactions to a new flavor were uncoachable and unfakeable. Used in retail decks too.' },
  { id: 'v7',  src: '/videos/clip-07.mp4', poster: '/posters/clip-07.jpg', title: 'Founder Story — SaaS B2B', category: 'B2B SaaS', goal: 'Drive LinkedIn-led B2B pipeline with founder-first content.', format: 'Founder-led street interview hybrid', deliverables: '4 LinkedIn-cut videos, captioned and no-caption', whyItWorked: 'Founder on camera in the wild beat polished demo videos on LinkedIn engagement.' },
  { id: 'v8',  src: '/videos/clip-08.mp4', poster: '/posters/clip-08.jpg', title: 'Restaurant Launch — Neighborhood Reactions', category: 'Local Restaurant', goal: 'Drive opening-week foot traffic.', format: 'Unscripted street interview', deliverables: '5 vertical edits, captioned, raw footage', whyItWorked: 'Neighborhood-shot reactions signaled local belonging instantly. Opening week sold out.' },
  { id: 'v9',  src: '/videos/clip-09.mp4', poster: '/posters/clip-09.jpg', title: 'Food Brand Comedy Hook', category: 'Food', goal: 'Test a comedy-led format for cold paid social.', format: 'Scripted comedy street interview', deliverables: '6 vertical ads, multiple hooks, raw footage', whyItWorked: 'Comedy-led format gave the brand a fresh creative lane that didn’t fatigue in 48 hours.' },
  { id: 'v10', src: '/videos/clip-10.mp4', poster: '/posters/clip-10.jpg', title: 'Beauty Brand Multi-Customer Reel', category: 'Beauty Brand', goal: 'Build a paid retargeting library with high-trust formats.', format: 'Multi-customer testimonial street interview', deliverables: '5 vertical edits, montage version, hook variants', whyItWorked: 'Stacked customer reactions in a single ad raised retargeting CVR vs. single-creator UGC.' },
  { id: 'v11', src: '/videos/clip-11.mp4', poster: '/posters/clip-11.jpg', title: 'App Reaction — Real Strangers', category: 'Mobile App', goal: 'Test cold-traffic UGC that doesn’t look like UGC.', format: 'Unscripted street interview UGC', deliverables: '8 vertical ads, 10 hook variants, raw', whyItWorked: 'Real strangers reacting to the app gave the account a creative angle no UGC marketplace could ship.' },
  { id: 'v6',  src: '/videos/clip-06.mp4', poster: '/posters/clip-06.jpg', title: 'Public Opinion — Category Disruptor', category: 'DTC E-Commerce', goal: 'Reposition a category-disruptor brand on TikTok and Reels.', format: 'Unscripted public opinion street interview', deliverables: '8 vertical ads, 6 hook variants, raw footage', whyItWorked: 'Audience saw real strangers articulate the brand’s positioning unprompted. Trust delta was instant.' },
];

export const WORK_CATEGORIES: WorkCategory[] = [
  {
    slug: 'street-interviews',
    title: 'Street Interview Video Examples for Brands',
    h1: 'Street Interview Video Examples for Brands',
    meta: 'Real street interview videos we’ve produced for brands — scripted and unscripted formats, built for TikTok, Reels, Shorts, and Meta ad campaigns.',
    navLabel: 'Street Interview Examples',
    hero: {
      kicker: 'Street Interview Examples',
      headline: 'Street Interview Video Examples',
      sub: 'A selection of recent street interview campaigns produced for brands across e-commerce, beauty, food, apps, and local.',
    },
    videos: [SAMPLE_VIDEOS[0], SAMPLE_VIDEOS[1], SAMPLE_VIDEOS[5], SAMPLE_VIDEOS[7], SAMPLE_VIDEOS[8], SAMPLE_VIDEOS[10]],
  },
  {
    slug: 'ugc-video-ads',
    title: 'UGC Video Ad Examples | Real People, Not AI',
    h1: 'UGC Video Ad Examples',
    meta: 'UGC video ad examples produced for brand campaigns — real people, native formats, scroll-stopping hooks, and ad-account-ready creative.',
    navLabel: 'UGC Ad Examples',
    hero: {
      kicker: 'UGC Ad Examples',
      headline: 'UGC Video Ad Examples',
      sub: 'Real-person UGC ads built for paid social. Multiple voices, multiple hooks, multiple lanes.',
    },
    videos: [SAMPLE_VIDEOS[2], SAMPLE_VIDEOS[5], SAMPLE_VIDEOS[8], SAMPLE_VIDEOS[10], SAMPLE_VIDEOS[11]],
  },
  {
    slug: 'testimonial-videos',
    title: 'Testimonial Video Examples for Brands',
    h1: 'Testimonial Video Examples',
    meta: 'Testimonial video examples produced in a street interview style — authentic, social-first customer proof for brand and ad campaigns.',
    navLabel: 'Testimonial Examples',
    hero: {
      kicker: 'Testimonial Examples',
      headline: 'Testimonial Video Examples',
      sub: 'Customer testimonials shot in a street-interview style. Multi-voice, multi-format, social-first.',
    },
    videos: [SAMPLE_VIDEOS[3], SAMPLE_VIDEOS[6], SAMPLE_VIDEOS[9]],
  },
  {
    slug: 'branded-content',
    title: 'Branded Content Video Examples',
    h1: 'Branded Content Video Examples',
    meta: 'Branded content video examples that feel like content first and advertising second — built around street interviews and real-people storytelling.',
    navLabel: 'Branded Content Examples',
    hero: {
      kicker: 'Branded Content Examples',
      headline: 'Branded Content Video Examples',
      sub: 'Content first, advertising second. Street-interview-led branded content that earns watch time.',
    },
    videos: [SAMPLE_VIDEOS[4], SAMPLE_VIDEOS[5], SAMPLE_VIDEOS[6], SAMPLE_VIDEOS[7]],
  },
];

export const WORK_BY_SLUG = Object.fromEntries(WORK_CATEGORIES.map((c) => [c.slug, c]));
export const ALL_WORK_VIDEOS = SAMPLE_VIDEOS;
