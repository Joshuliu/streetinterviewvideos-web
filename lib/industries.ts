export type Industry = {
  slug: string;
  title: string;
  h1: string;
  meta: string;
  navLabel: string;
  cardBlurb: string;
  hero: { kicker: string; headline: string; sub: string };
  useCases: string[];
  formats: string[];
  why: { h2: string; body: string[] };
  internalLinks: { label: string; href: string }[];
  faq: { q: string; a: string }[];
};

export const INDUSTRIES: Industry[] = [
  {
    slug: 'ecommerce-brands',
    title: 'Street Interview Videos for E-Commerce Brands',
    h1: 'Street Interview Videos for E-Commerce Brands',
    meta: 'Product reactions, UGC ads, launch campaigns, TikTok creative, and Meta-ready content for e-commerce brands using unscripted street interview videos.',
    navLabel: 'E-Commerce Brands',
    cardBlurb: 'Product reactions, UGC ads, and TikTok/Meta creative for DTC and e-commerce.',
    hero: {
      kicker: 'E-Commerce Brands',
      headline: 'Street Interview Videos for E-Commerce Brands',
      sub: 'Product reactions, UGC-style ads, launch creative, and TikTok and Meta video built around real people.',
    },
    useCases: ['Product launches', 'TikTok and Meta paid creative', 'Amazon and PDP videos', 'Retargeting creative', 'Launch buzz campaigns', 'Always-on UGC libraries'],
    formats: ['Product reaction videos', 'Street interview ads', 'UGC ads', 'Unboxing reactions', 'Comparison ads', 'Founder-led launch videos'],
    why: {
      h2: 'Why this works for e-commerce',
      body: [
        'Studio product photography is table stakes. The feed wants real people, in real environments, holding the product.',
        'Street-interview-led video creative tests faster, scales further, and lasts longer in ad accounts than commercial-style assets.',
      ],
    },
    internalLinks: [
      { label: 'E-Commerce Video Production', href: '/services/ecommerce-video-production/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'E-Commerce UGC Case Study', href: '/case-studies/ecommerce-ugc-video-ads/' },
      { label: 'UGC Ad Examples', href: '/work/ugc-video-ads/' },
    ],
    faq: [
      { q: 'Do we ship product to you?', a: 'Yes. Most e-commerce shoots include a product seed step.' },
      { q: 'How fast can we go from product to live ads?', a: 'Two to three weeks standard.' },
    ],
  },
  {
    slug: 'beauty-brands',
    title: 'Street Interview Videos for Beauty Brands',
    h1: 'Street Interview Videos for Beauty Brands',
    meta: 'Before/after reactions, product demos, public opinion videos, and UGC-style beauty ads built with street interview formats.',
    navLabel: 'Beauty Brands',
    cardBlurb: 'Before/after reactions, demos, and public opinion videos for beauty.',
    hero: {
      kicker: 'Beauty Brands',
      headline: 'Street Interview Videos for Beauty Brands',
      sub: 'Before/after reactions, product demos, and UGC-style beauty ads — built around real people.',
    },
    useCases: ['Beauty product launches', 'Before/after reaction videos', 'Public opinion campaigns', 'Influencer-style UGC ads', 'Retail launch buzz', 'Sampling activations'],
    formats: ['Before/after reactions', 'Public opinion street interviews', 'Product demo reactions', 'UGC-style beauty ads', 'Multi-customer testimonial videos', 'Comparison ads'],
    why: {
      h2: 'Why this works for beauty',
      body: [
        'Beauty buyers want proof, and proof has to be visible. Real-person reactions on camera convert better than studio demos.',
        'Beauty TikTok and Reels reward unfiltered moments. The street-interview format owns that lane.',
      ],
    },
    internalLinks: [
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
      { label: 'Beauty Brand Case Study', href: '/case-studies/beauty-brand-street-interview-campaign/' },
    ],
    faq: [
      { q: 'Do you handle product seeding?', a: 'Yes — we receive product, store it, and integrate into shoots.' },
      { q: 'Can we capture before/after?', a: 'Yes. Multi-day shoots or staged within a single shoot, depending on the product.' },
    ],
  },
  {
    slug: 'food-beverage-brands',
    title: 'Street Interview Videos for Food & Beverage Brands',
    h1: 'Street Interview Videos for Food and Beverage Brands',
    meta: 'Taste tests, public reactions, launch campaigns, retail sampling, and event activations for food and beverage brands using street interview videos.',
    navLabel: 'Food & Beverage',
    cardBlurb: 'Taste tests, public reactions, and launch campaigns for food and beverage.',
    hero: {
      kicker: 'Food & Beverage',
      headline: 'Street Interview Videos for Food & Beverage Brands',
      sub: 'Taste tests, public reactions, retail sampling, and launch energy — captured on the street.',
    },
    useCases: ['Taste tests', 'New flavor launches', 'Retail sampling activations', 'Event and pop-up coverage', 'Public reaction campaigns', 'Founder-led brand stories'],
    formats: ['Taste test videos', 'Public reaction street interviews', 'Sampling activation videos', 'Retail launch videos', 'Multi-customer testimonial videos', 'UGC food ads'],
    why: {
      h2: 'Why this works for food and beverage',
      body: [
        'Taste reactions are unfakeable. They convert because they look real because they are real.',
        'Sampling on the street + street interview = the most native paid social ad format for F&B.',
      ],
    },
    internalLinks: [
      { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Street Interview Examples', href: '/work/street-interviews/' },
    ],
    faq: [
      { q: 'Can you handle in-the-wild taste tests?', a: 'Yes — that’s a big part of our F&B work.' },
      { q: 'Do you handle event sampling?', a: 'Yes — see our street interview video ads service for on-the-ground sampling work.' },
    ],
  },
  {
    slug: 'apps-saas',
    title: 'Street Interview Videos for Apps & SaaS Brands',
    h1: 'Street Interview Videos for Apps and SaaS Brands',
    meta: 'Problem/solution videos, public opinion hooks, app reaction videos, and B2B street interviews for apps and SaaS companies.',
    navLabel: 'Apps & SaaS',
    cardBlurb: 'Problem/solution videos, public opinion hooks, and B2B street interviews.',
    hero: {
      kicker: 'Apps & SaaS',
      headline: 'Street Interview Videos for Apps & SaaS Brands',
      sub: 'Problem/solution videos, public opinion hooks, app reaction videos, and B2B-friendly street interviews.',
    },
    useCases: ['App install ads', 'SaaS landing page proof', 'Founder-led B2B content', 'Problem/solution paid creative', 'Conference and event B2B interviews', 'Public opinion campaign hooks'],
    formats: ['Problem/solution street interviews', 'Public opinion videos', 'App reaction videos', 'Founder-led B2B ads', 'Customer testimonial street interviews', 'Conference floor interviews'],
    why: {
      h2: 'Why this works for apps and SaaS',
      body: [
        'B2B buyers and app installers respond to real-person formats just like B2C audiences. The format gap is the only difference.',
        'Founder-on-camera + street-interview reaction is one of the highest-trust ad formats for early-stage SaaS and apps.',
      ],
    },
    internalLinks: [
      { label: 'B2B Video Production', href: '/services/b2b-video-production/' },
      { label: 'App Launch Case Study', href: '/case-studies/app-launch-street-interview-ads/' },
      { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
    ],
    faq: [
      { q: 'Will videos work on LinkedIn?', a: 'Yes — every package includes LinkedIn-cut versions.' },
      { q: 'Do you do app install ads?', a: 'Yes. Performance-led app accounts are a core use case.' },
    ],
  },
  {
    slug: 'events-activations',
    title: 'Street Interview Videos for Events & Brand Activations',
    h1: 'Street Interview Videos for Events and Brand Activations',
    meta: 'Event coverage, attendee interviews, product launches, pop-up activations, and trade show video content captured live and edited for social.',
    navLabel: 'Events & Activations',
    cardBlurb: 'Live event coverage, attendee interviews, and on-the-ground reactions.',
    hero: {
      kicker: 'Events & Activations',
      headline: 'Street Interview Videos for Events & Brand Activations',
      sub: 'Live event coverage, attendee interviews, and pop-up reactions — edited for paid and organic social.',
    },
    useCases: ['Pop-up shop coverage', 'Brand activation videos', 'Conference floor interviews', 'Launch event recap videos', 'Trade show booth content', 'Influencer event reaction videos'],
    formats: ['Attendee street interviews', 'Live product reactions', 'Activation walkthroughs', 'Brand experience reels', 'Behind-the-scenes activation video', 'Event recap films'],
    why: {
      h2: 'Why this works for events',
      body: [
        'The most valuable footage at any event is the unscripted reaction of a real attendee.',
        'A 10-second moment shot vertical and edited fast is worth more than a 90-second sizzle reel.',
      ],
    },
    internalLinks: [
      { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
      { label: 'Event Activation Case Study', href: '/case-studies/event-activation-street-interviews/' },
      { label: 'Branded Content Examples', href: '/work/branded-content/' },
    ],
    faq: [
      { q: 'How fast can we get clips after an event?', a: 'Same-day or next-day for hero clips, with full delivery within a week.' },
      { q: 'Can you travel?', a: 'Yes — nationally for activations and events.' },
    ],
  },
  {
    slug: 'local-businesses',
    title: 'Street Interview Videos for Local Businesses',
    h1: 'Street Interview Videos for Local Businesses',
    meta: 'Restaurant launches, gym promos, real estate brands, retail stores, and local service businesses — short-form street interview videos built for community trust.',
    navLabel: 'Local Businesses',
    cardBlurb: 'Restaurant launches, gym promos, real estate, retail, and local services.',
    hero: {
      kicker: 'Local Businesses',
      headline: 'Street Interview Videos for Local Businesses',
      sub: 'Real-people content for restaurants, gyms, real estate, retail, and local services.',
    },
    useCases: ['Restaurant launches', 'Gym and fitness promos', 'Real estate brand content', 'Retail store launches', 'Local service businesses', 'Multi-location franchise content'],
    formats: ['Customer street interviews', 'Founder-led local content', 'In-store reaction videos', 'Community testimonial videos', 'Public opinion street interviews', 'Behind-the-scenes local brand content'],
    why: {
      h2: 'Why this works for local',
      body: [
        'Local businesses sell on community trust. Real-person video builds it faster than ads ever will.',
        'A street interview shot in your neighborhood signals belonging in two seconds — every passing scroller feels it.',
      ],
    },
    internalLinks: [
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
    ],
    faq: [
      { q: 'Do you work with single-location businesses?', a: 'Yes — single-location and multi-location.' },
      { q: 'Can you film in our city?', a: 'Most major US markets. We travel for the right project.' },
    ],
  },
];

export const INDUSTRY_BY_SLUG = Object.fromEntries(INDUSTRIES.map((i) => [i.slug, i]));
