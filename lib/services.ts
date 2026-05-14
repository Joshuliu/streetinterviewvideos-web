export type Service = {
  slug: string;
  priority: 0 | 1 | 2 | 3;
  title: string;
  h1: string;
  meta: string;
  shortLabel: string;
  navLabel: string;
  cardBlurb: string;
  hero: { kicker: string; headline: string; sub: string };
  problem: { h2: string; body: string[] };
  solution: { h2: string; pillars: { title: string; body: string }[] };
  formats: { h2: string; items: string[] };
  useCases: { h2: string; items: string[] };
  examplesIntro: string;
  included: string[];
  process?: { title: string; body: string }[];
  faq: { q: string; a: string }[];
  internalLinks: { label: string; href: string }[];
  related: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
};

const PROCESS_DEFAULT = [
  { title: 'Strategy', body: 'We start with your campaign goal, audience, product, and platform mix. You leave the call with a content plan.' },
  { title: 'Script & questions', body: 'We write or refine the questions and prompts. Scripted, semi-scripted, or fully unscripted — your call.' },
  { title: 'Casting & shoot', body: 'We cast actors or pull real strangers in the right city, then shoot vertical-first on the street.' },
  { title: 'Edit', body: 'Hook variations plus captioned and uncaptioned versions of each video. Built for TikTok, Reels, Shorts, and Meta.' },
  { title: 'Delivery', body: 'You get edited videos, raw footage, captions, and ad-account-ready exports.' },
];

const COMMON_INCLUDED = [
  'Edited videos in vertical 9:16',
  'Caption and no-caption versions',
  'Multiple hook variations',
  'Raw footage',
  'Ad-account-ready exports',
  'Usage rights for paid and organic',
];

export const SERVICES: Service[] = [
  {
    slug: 'social-media-video-production',
    priority: 0,
    title: 'Social Media Video Production | StreetInterviewVideos.com',
    h1: 'Social Media Video Production for Brands',
    meta: 'Social media video production for brands — short-form, interview-led video content engineered to grab attention on TikTok, Reels, Shorts, and paid social.',
    shortLabel: 'Social Media Video',
    navLabel: 'Social Media Video Production',
    cardBlurb: 'Short-form videos that feel native to TikTok, Reels, Shorts, and Meta — built around street interviews and real reactions.',
    primaryKeyword: 'social media video production',
    secondaryKeywords: ['video production for social media', 'social media video production company', 'social media video production services', 'short-form video production'],
    hero: {
      kicker: 'Social Media Video Production',
      headline: 'Social Media Video Production for Brands',
      sub: 'Short-form videos that feel native to TikTok, Reels, Shorts, and Meta. Built around street interviews and real reactions.',
    },
    problem: {
      h2: 'Polished commercials don’t feel native to social feeds',
      body: [
        'Most brands still ship commercial-looking video to social platforms. The feed punishes it. Watch time drops. CPMs climb. The ad gets ignored.',
        'Social-first audiences scroll past anything that looks produced. They watch real people, real reactions, and real conversations — even when those are made for a brand.',
      ],
    },
    solution: {
      h2: 'A social media video production service built around real people',
      pillars: [
        { title: 'Engineered for grabbing attention', body: 'We specialize in creating short-form video content that earns the first three seconds. Vertical, captioned, designed for sound-on or sound-off. Effective video that looks like the rest of the feed.' },
        { title: 'Format flexibility', body: 'Street interviews, UGC, real reactions, podcast clips, founder prompts. We pick the format that fits the marketing goal, not the format that fits a template.' },
        { title: 'Scaled engaging videos', body: 'Multiple hooks per video, multiple cuts per shoot. We optimize your video output so a single shoot day powers organic, paid, and retargeting across every social media platform you run on.' },
      ],
    },
    formats: {
      h2: 'Social media video formats we create',
      items: ['Street interviews', 'UGC-style ads', 'Product reaction videos', 'Founder and brand prompts', 'Comedy skits', 'Testimonial-style clips', 'Podcast clips'],
    },
    useCases: {
      h2: 'Marketing goals this works best for',
      items: ['Product launches', 'Paid ad testing', 'TikTok campaigns', 'Meta and Instagram ad campaigns', 'Always-on organic social', 'Event activations'],
    },
    examplesIntro: 'A few of the social-first video campaigns we’ve produced for brands.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'What does your social media video production service cover?', a: 'Strategy, scripting/prompts, casting, on-the-ground shoot, post-production, captioning, hook variations, and ad-account-ready exports. One social media video production service that handles every step from brief to live ad.' },
      { q: 'How do you know which videos perform?', a: 'We help you track key engagement metrics — hook rate, hold rate, CTR, CPM — and adjust the next shoot’s hook lanes based on what the data says. The pipeline gets sharper every cycle.' },
      { q: 'How fast is turnaround?', a: 'As little as 5–10 days for most projects. Bigger campaigns or complex shoots can run up to 21 days. Tight deadlines? Tell us — we plan around the launch.' },
      { q: 'Can we use the videos for TikTok and Meta ads?', a: 'Yes. Every package includes paid usage rights so you can run them across TikTok, Reels, Shorts, and Meta without extra licensing.' },
      { q: 'Do you handle scripting?', a: 'Yes. We write the questions, refine your prompts, and pre-test hooks. You always approve before we shoot.' },
      { q: 'Can you do organic and paid in one shoot?', a: 'Yes. We design every shoot to produce hero ad creative plus 5–15 organic-ready clips from the same day.' },
      { q: 'Where do you film?', a: 'Primarily New York and Los Angeles. We accommodate specific events and brand-requested locations on a case-by-case basis.' },
      { q: 'Will the videos feel like commercials?', a: 'No. That’s the whole point. We shoot in a street-interview style so they feel like content first and ad second.' },
      { q: 'Do you provide raw footage?', a: 'Yes, on every package. You own the assets so you can re-cut, repurpose, and re-edit forever.' },
      { q: 'How many hooks do we get?', a: '3–8 hook variations per hero video, depending on package. Built specifically for testing in ad accounts.' },
    ],
    internalLinks: [
      { label: 'Branded Video Production', href: '/services/branded-video-production/' },
      { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
      { label: 'Social Media Video Production Guide', href: '/resources/social-media-video-production/social-media-video-production-guide/' },
    ],
    related: ['video-ad-production', 'street-interview-video-ads', 'branded-video-production', 'testimonial-video-production'],
  },
  {
    slug: 'branded-video-production',
    priority: 0,
    title: 'Branded Video Production | StreetInterviewVideos.com',
    h1: 'Branded Video Production That Feels Like Real Content',
    meta: 'Branded video production for brands that want to elevate brand presence with authentic, social-first video content — interview-led, post-production-ready for TikTok, Reels, and paid social.',
    shortLabel: 'Branded Video',
    navLabel: 'Branded Video Production',
    cardBlurb: 'Branded content that feels like content first and advertising second. Real people, real reactions, real native energy.',
    primaryKeyword: 'branded video production',
    secondaryKeywords: ['brand video production', 'branded content video production', 'video production for brands', 'brand storytelling video'],
    hero: {
      kicker: 'Branded Video Production',
      headline: 'Branded Video Production That Feels Like Real Content',
      sub: 'Most branded videos feel like ads. Ours feel like content people actually watch — interview-led video content built to elevate your brand across TikTok, Reels, Shorts, and paid social.',
    },
    problem: {
      h2: 'Most branded videos feel like ads. Audiences know.',
      body: [
        'A traditional video production company will deliver something that looks like a commercial. The lighting is great, the music swells, the audience scrolls past. Traditional ads stopped buying attention years ago — the feed punishes anything that reads as branded first.',
        'Your brand doesn’t need another polished commercial. It needs video content the algorithm rewards and a target audience actually watches.',
      ],
    },
    solution: {
      h2: 'Branded content video production that earns the watch, then the brand recall',
      pillars: [
        { title: 'Content-first storytelling', body: 'Every video opens with a real moment, not a logo. Compelling narratives that earn the first three seconds before any branded message lands.' },
        { title: 'Real-person formats', body: 'Street interviews, public reactions, founder voiceovers. Interview-led storytelling instead of corporate-feeling explainer videos.' },
        { title: 'Built for the feed', body: 'Vertical, fast-paced, captioned, optimized for sound-on and sound-off. Native to TikTok, Reels, Shorts, and Meta — the platforms your video marketing actually runs on.' },
      ],
    },
    formats: {
      h2: 'Branded video formats we produce',
      items: ['Street interview brand stories', 'Real-person reaction videos', 'Founder-led brand films', 'UGC-style branded content', 'Public opinion campaigns', 'Behind-the-scenes brand films'],
    },
    useCases: {
      h2: 'When branded video earns its production cost',
      items: ['Brand awareness for social-first audiences', 'New brand launches', 'Repositioning campaigns', 'Always-on social and content marketing', 'Brand storytelling for paid ads', 'Mid-funnel education without explainer-video fatigue'],
    },
    examplesIntro: 'A selection of branded video campaigns produced in a street-interview style.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'What does branded video production mean for our brand?', a: 'It means we produce video content that fits where your target audience actually watches — short-form, vertical, interview-led — instead of a TV-shaped brand film that sits unused. The deliverable is a library of branded videos, not a single sizzle reel.' },
      { q: 'How does this fit our marketing strategy?', a: 'Branded video sits at the top and middle of the funnel — awareness, brand affinity, trust. We design every shoot to feed both your always-on social calendar and your paid media calendar, so one production cost powers months of video marketing.' },
      { q: 'What’s the difference between branded video and a commercial?', a: 'Commercials sell. Branded video earns watch time. We build branded video that feels like content first and advertising second.' },
      { q: 'Can branded video drive performance?', a: 'Yes. Branded video built for social feeds outperforms polished traditional ads on CTR and watch time, especially on TikTok and Reels.' },
      { q: 'Do we control the brand voice?', a: 'Always. We build a brand voice doc with you in the strategy phase and run every script through it before we shoot.' },
      { q: 'Do you produce traditional brand films or explainer videos?', a: 'We can. But we’ll usually recommend the street-interview-led version unless your distribution plan is TV or out-of-home — explainer videos and corporate brand films routinely underperform interview-led content in the feed.' },
      { q: 'Can we use branded videos for paid ads?', a: 'Yes. Every video is delivered with paid usage rights and ad-account-ready exports.' },
      { q: 'How long are typical branded videos?', a: '15–60 seconds for social, 60–90 seconds for landing pages, 2–3 minutes for longer brand films.' },
    ],
    internalLinks: [
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
      { label: 'Branded Content Video Production', href: '/services/branded-content-video-production/' },
      { label: 'Brand Video Production', href: '/services/brand-video-production/' },
      { label: 'Video Production for Brands', href: '/services/video-production-for-brands/' },
      { label: 'Branded Content Examples', href: '/work/branded-content/' },
    ],
    related: ['social-media-video-production', 'video-ad-production', 'street-interview-video-ads', 'testimonial-video-production'],
  },
  {
    slug: 'testimonial-video-production',
    priority: 0,
    title: 'Testimonial Video Production | StreetInterviewVideos.com',
    h1: 'Testimonial Video Production for Brands',
    meta: 'Testimonial video production that builds trust without corporate stiffness. Interview-led, high-quality customer testimonial video — social-first and ad-ready.',
    shortLabel: 'Testimonial Video',
    navLabel: 'Testimonial Video Production',
    cardBlurb: 'Testimonial-style proof without stiff corporate interviews. Real customers, real strangers, real reactions.',
    primaryKeyword: 'testimonial video production',
    secondaryKeywords: ['video testimonial production', 'customer testimonial video production', 'testimonial video services', 'client testimonial videos'],
    hero: {
      kicker: 'Testimonial Video Production',
      headline: 'Testimonial Video Production for Brands',
      sub: 'Interview-led customer testimonial video that builds trust without the corporate stiffness. Built for social feeds and paid ads.',
    },
    problem: {
      h2: 'Most testimonial videos feel stiff. Viewers skip.',
      body: [
        'Most video production companies still ship the same suit-and-chair testimonial format. The lighting is right, the words are clean, and nobody finishes watching.',
        'Buyers want social proof, but proof only works when it sounds like a real person talking about a real product or service — not when it sounds like a brand reading its own press release.',
      ],
    },
    solution: {
      h2: 'How we make testimonial video that actually builds trust',
      pillars: [
        { title: 'Interview-led, not scripted', body: 'We give prompts, not lines. Real conversations on real cameras. The interview footage we capture sounds like your customers, not your marketing team.' },
        { title: 'Customers feel comfortable on camera', body: 'On-the-day directing that loosens non-camera people in five minutes. Most clients say they forgot the camera was there before the first real answer landed.' },
        { title: 'Post-production tuned for the feed', body: 'High-quality 9:16 edits, hook variations, captions, and ad-account-ready exports. The same shoot powers landing pages, paid ads, and case study video content.' },
      ],
    },
    formats: {
      h2: 'Customer testimonial video formats we produce',
      items: ['Street interview testimonials', 'Customer reaction video', 'Case study video features', 'On-product reaction shoots', 'Actor-led testimonials (when timelines don’t allow real customers)', 'Multi-customer testimonial montages'],
    },
    useCases: {
      h2: 'When testimonial videos work best',
      items: ['Landing page social proof for your product or service', 'Paid ad creative aimed at a defined target audience', 'TikTok and Meta retargeting', 'Brand trust at activations and events', 'Sales and demo decks', 'Email and SMS nurture sequences'],
    },
    examplesIntro: 'Recent client testimonials and customer reaction videos produced in a street-interview format.',
    included: [
      '5–15 customer testimonials per shoot day',
      'Edited video content in vertical 9:16',
      'Captioned and uncaptioned exports of every video',
      'Hook variations on every hero testimonial',
      'B-roll cutaways and on-product reactions',
      'Raw interview footage handed over to you',
      'Ad-account-ready exports for paid and organic',
      'Signed releases from every on-camera person',
    ],
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'Do you use real customers or actors?', a: 'Both. We help you decide based on your timeline, customer availability, and ad usage requirements.' },
      { q: 'How do you help customers feel comfortable on camera?', a: 'We chat with them off-camera before the shoot, use prompts instead of scripts, and let the first two takes be throwaways. By the third answer, most clients forget the camera is there.' },
      { q: 'Will testimonials feel scripted?', a: 'Not unless you want them to. We give prompts, not scripts, and edit for the moments that sound like a real person, not a polished brand spot.' },
      { q: 'How many testimonials per shoot?', a: '5–15 per day depending on customer logistics, shoot length, and prompt list.' },
      { q: 'Can you handle hybrid shoots?', a: 'Yes — actor-led headline videos plus 2–3 real customer interviews captured the same week, edited as one campaign.' },
      { q: 'Will the videos work for paid ads?', a: 'Yes. Every package is built ad-account-ready with hook variations and platform exports.' },
    ],
    internalLinks: [
      { label: 'Customer Testimonial Video Production', href: '/services/customer-testimonial-video-production/' },
      { label: 'Video Testimonial Production', href: '/services/video-testimonial-production/' },
      { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
      { label: 'Testimonial Video Examples', href: '/work/testimonial-videos/' },
      { label: 'Reviews', href: '/reviews/' },
    ],
    related: ['street-interview-video-ads', 'social-media-video-production', 'video-ad-production', 'branded-video-production'],
  },
  {
    slug: 'ugc-video-ads',
    priority: 0,
    title: 'UGC Video Ads Made With Real People | Not AI UGC',
    h1: 'UGC Video Ads for Brands',
    meta: 'We create real-person UGC-style video ads using actors, street interviews, and authentic reaction formats — without the generic AI UGC look.',
    shortLabel: 'UGC Video Ads',
    navLabel: 'UGC Video Ads',
    cardBlurb: 'UGC-style ads with real people. No AI clones. No fake creator energy. Just creative that converts.',
    primaryKeyword: 'UGC video ads',
    secondaryKeywords: ['UGC videos', 'UGC-style video', 'UGC ads', 'real-person UGC'],
    hero: {
      kicker: 'UGC Video Ads',
      headline: 'UGC Video Ads, Made With Real People',
      sub: 'No AI clones. No fake creator energy. Real-person UGC built for TikTok, Meta, Reels, and Shorts.',
    },
    problem: {
      h2: 'Most UGC ads feel fake. AI UGC made it worse.',
      body: [
        'AI UGC is fast and cheap. It’s also obvious. Audiences spot it in two seconds and the ad burns out before it scales.',
        'Real-person UGC still wins on CTR, watch time, and account-level CAC. The format isn’t dead. The shortcuts are.',
      ],
    },
    solution: {
      h2: 'UGC ads with real people, real hooks, real ad performance',
      pillars: [
        { title: 'Real-person creators', body: 'We cast actors and creators who deliver creator-style energy without looking like a stock library.' },
        { title: 'Street-interview UGC', body: 'A different lane: real strangers reacting to your product, edited like UGC. Even more authentic, even harder to fake.' },
        { title: 'Hook engineering', body: '3–8 hook variations per hero video so you can test in ad accounts without re-shooting.' },
      ],
    },
    formats: {
      h2: 'UGC formats we produce',
      items: ['Creator-style UGC ads', 'Street interview UGC', 'Real-customer UGC reactions', 'Founder UGC ads', 'Comedy UGC formats', 'Problem-solution UGC ads'],
    },
    useCases: {
      h2: 'Best for',
      items: ['TikTok ad creative', 'Meta ad creative', 'Reels and Shorts campaigns', 'Cold paid traffic', 'Retargeting creative', 'Whitelisted partner ads'],
    },
    examplesIntro: 'Recent UGC video ad campaigns produced for brands across e-commerce, beauty, food, and apps.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'Do you use actors or real creators?', a: 'Both. We pick the casting model based on your category, budget, and ad goal. Some campaigns mix both.' },
      { q: 'How is this different from AI UGC?', a: 'AI UGC is generated. Ours is filmed with real people. Real people convert better and last longer in ad accounts.' },
      { q: 'How many hooks per ad?', a: '3–8 variations on every hero ad. We script and shoot them in the same shoot to keep cost and energy consistent.' },
      { q: 'Can we use UGC for paid Meta and TikTok?', a: 'Yes. Every package includes paid usage and is delivered ad-account-ready.' },
      { q: 'Can you ship UGC weekly?', a: 'Yes — campaign packages produce a steady cadence so your ad account never runs dry.' },
      { q: 'Do you use AI in any part of production?', a: 'Only in editing assistance, never as the on-camera person. The faces and voices are real.' },
    ],
    internalLinks: [
      { label: 'UGC-Style Videos', href: '/services/ugc-style-videos/' },
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
      { label: 'Video Ad Production', href: '/services/video-ad-production/' },
      { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
      { label: 'AI UGC vs Real-Person UGC', href: '/resources/ugc-video-ads/ai-ugc-vs-real-person-ugc/' },
    ],
    related: ['ugc-style-videos', 'social-media-video-production', 'video-ad-production'],
  },
  {
    slug: 'street-interview-video-ads',
    priority: 0,
    title: 'Street Interview Video Ads | StreetInterviewVideos.com',
    h1: 'Street Interview Videos That Turn Real Reactions Into Ad Creative',
    meta: 'We turn the man-on-the-street interview format into short-form video ads for brands that need real reactions, social proof, and scroll-stopping creative.',
    shortLabel: 'Street Interview Ads',
    navLabel: 'Street Interview Video Ads',
    cardBlurb: 'The man-on-the-street format, turned into short-form ads built for TikTok, Reels, Shorts, and Meta.',
    primaryKeyword: 'street interview video ads',
    secondaryKeywords: ['street interview videos', 'street interview ads', 'man on the street interviews', 'man on the street video ads', 'street interview videos for brands'],
    hero: {
      kicker: 'Street Interview Video Ads',
      headline: 'Street Interview Videos That Turn Real Reactions Into Ad Creative',
      sub: 'Real people, real reactions, real ad creative. Scripted or unscripted, vertical-first, ready for TikTok, Reels, Shorts, and Meta.',
    },
    problem: {
      h2: 'What are street interview video ads?',
      body: [
        'A street interview video ad takes the man-on-the-street format and turns it into short-form ad creative. Real people on camera. Real reactions. A brand product or message woven in.',
        'They feel like content because they look like content. The feed rewards them. Audiences finish them. Ad accounts scale them.',
      ],
    },
    solution: {
      h2: 'Why the format works',
      pillars: [
        { title: 'Native to social', body: 'Vertical, on the street, real environment. Indistinguishable from the rest of the feed.' },
        { title: 'Built-in trust', body: 'Real reactions are unfakeable. Audiences treat them as social proof on first watch.' },
        { title: 'Ad-account scalable', body: 'Multiple hooks, multiple cuts, multiple voices from a single shoot. Your testing pipeline never runs dry.' },
      ],
    },
    formats: {
      h2: 'Scripted vs unscripted — both work, different jobs',
      items: ['Scripted street interview ads', 'Unscripted man-on-the-street ads', 'Customer-led street interviews', 'Reaction-style street ads', 'Public opinion campaigns', 'Event-based street interviews'],
    },
    useCases: {
      h2: 'Best for',
      items: ['Product launches', 'App installs', 'Beauty and food taste tests', 'Event activations', 'Brand awareness on TikTok and Meta', 'Repositioning and rebrands'],
    },
    examplesIntro: 'A few of the recent street interview campaigns we’ve produced.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'Are these real strangers or actors?', a: 'Both formats exist. Unscripted street interviews use real strangers. Scripted street interviews use actors who can hit your message reliably. We help you pick.' },
      { q: 'Can we use the videos for paid ads?', a: 'Yes. Every package includes paid usage rights for TikTok, Meta, Reels, Shorts, and YouTube.' },
      { q: 'How many videos per shoot?', a: '5–20 edited videos per shoot day depending on package, plus raw footage and hook variations.' },
      { q: 'Where do you film?', a: 'Primarily New York and Los Angeles. We accommodate specific events and brand-requested locations on a case-by-case basis.' },
      { q: 'Can we ship our product to you?', a: 'Yes — most product-based campaigns ship product ahead of the shoot for taste tests, demos, and reactions.' },
    ],
    internalLinks: [
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Street Interview Examples', href: '/work/street-interviews/' },
      { label: 'What Is a Street Interview Video?', href: '/resources/street-interview-videos/what-is-a-street-interview-video/' },
      { label: 'Scripted vs Unscripted Street Interviews', href: '/resources/street-interview-videos/scripted-vs-authentic-street-interviews/' },
    ],
    related: ['social-media-video-production', 'street-interview-video-ads', 'branded-video-production', 'testimonial-video-production'],
  },
  {
    slug: 'video-ad-production',
    priority: 1,
    title: 'Video Ad Production | StreetInterviewVideos.com',
    h1: 'Video Ad Production That Feels Native, Not Overproduced',
    meta: 'Video ad production for brands that want ads people actually watch — high-quality, social-first creative built around street interviews, real-person hooks, and a clear call to action.',
    shortLabel: 'Video Ad Production',
    navLabel: 'Video Ad Production',
    cardBlurb: 'Ad creative built for paid social — multiple hooks, multiple cuts, ad-account-ready exports.',
    primaryKeyword: 'video ad production',
    secondaryKeywords: ['video ads for brands', 'paid social video ads', 'short-form video ads', 'TikTok and Meta video ads'],
    hero: {
      kicker: 'Video Ad Production',
      headline: 'Video Ad Production That Feels Native, Not Overproduced',
      sub: 'High-quality, social-first video ad production for brands that want ads people actually watch — real-person hooks, a clear call to action, and multiple variations from every shoot.',
    },
    problem: {
      h2: 'Most video ads die because the creative is wrong, not the targeting',
      body: [
        'Buyers blame audiences. The creative is the leak. If your video ad doesn’t feel native, no targeting saves it — and most video production services still ship the same overproduced template.',
        'You don’t need more ads. You need the right format, the right hook, and a clear call to action, shot and edited the way the feed actually rewards.',
      ],
    },
    solution: {
      h2: 'High-quality video ad production scaled for testing',
      pillars: [
        { title: 'Hook engineering', body: '3–8 variations per ad, scripted by our creative team to test against each other in the same campaign so you can see which version of your video content actually performs.' },
        { title: 'Format mix', body: 'Street interview, UGC, reaction, founder, comedy. We produce videos in the format that fits your product and audience, not the format we already have a template for.' },
        { title: 'Ad-account ready post production', body: 'Captioned and uncaptioned vertical exports, hook-tested call-to-action cards, and post-production cuts organized for Meta and TikTok creative libraries.' },
      ],
    },
    formats: {
      h2: 'Video ad formats we produce',
      items: ['Street interview ads', 'UGC ads', 'Founder ads', 'Reaction ads', 'Problem-solution ads', 'Comedy ads', 'Testimonial ads'],
    },
    useCases: {
      h2: 'Best for',
      items: ['New product launches', 'Cold acquisition', 'Retargeting creative', 'Whitelisting partner ads', 'Always-on paid campaigns', 'Creative testing pipelines'],
    },
    examplesIntro: 'Recent video ad campaigns produced for performance brands.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'What does your video ad production service cover?', a: 'Concept and hook design, scripting and prompts, casting, on-the-ground shoot, post-production, captions, call-to-action card variants, and ad-account-ready exports. Our creative team handles every step from brief to live ad.' },
      { q: 'How many ads should we test?', a: 'Most brands need 8–20 fresh creatives a month at minimum. We produce videos in batches and design shoots to feed that pipeline.' },
      { q: 'What platforms do you optimize for?', a: 'TikTok, Meta (Facebook + Instagram), YouTube Shorts, and increasingly LinkedIn for B2B.' },
      { q: 'Do you handle the actual ad buying?', a: 'No. We build the high-quality creative; your team or agency runs the buy. We work alongside both regularly.' },
      { q: 'How do you decide on hooks?', a: 'Your audience, the product, the platform, the call to action, and what’s already working in your ad account if we have access to it.' },
      { q: 'How fast can we get new ads?', a: 'As little as 5–10 days for most projects. Bigger campaigns or complex shoots can run up to 21 days. Rush turnaround available for launches and seasonal pushes.' },
    ],
    internalLinks: [
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'TikTok Video Ads', href: '/services/tiktok-video-ads/' },
      { label: 'Meta Video Ads', href: '/services/meta-video-ads/' },
      { label: 'Best Video Ad Hooks', href: '/resources/ugc-video-ads/best-video-ad-hooks/' },
    ],
    related: ['social-media-video-production', 'video-ad-production', 'branded-video-production', 'testimonial-video-production'],
  },
  {
    slug: 'video-production-for-brands',
    priority: 1,
    title: 'Video Production for Brands That Need Authentic Content',
    h1: 'Video Production for Brands',
    meta: 'We produce authentic video content for brands — street interviews, UGC ads, testimonials, and branded content built for paid social and organic feeds.',
    shortLabel: 'For Brands',
    navLabel: 'Video Production for Brands',
    cardBlurb: 'A video production partner built for modern brands. Authentic formats, social-first deliverables, real performance.',
    primaryKeyword: 'video production for brands',
    secondaryKeywords: ['video production company for brands', 'brand video production agency', 'video content for brands', 'video production studio for brands'],
    hero: {
      kicker: 'Video Production for Brands',
      headline: 'Video Production for Brands That Need Authentic Content',
      sub: 'Street interviews, UGC ads, testimonials, branded content. Built for performance, not award reels.',
    },
    problem: {
      h2: 'Brand video production needs a rebuild for 2026',
      body: [
        'Most production studios are still optimized for the TV-and-trade-show era. Big shoots. Big edits. Slow cycles.',
        'Modern brands need 30 videos a quarter, not 2. The old model can’t deliver and the new one isn’t in most agencies’ DNA.',
      ],
    },
    solution: {
      h2: 'A production partner built for the feed',
      pillars: [
        { title: 'Volume by design', body: 'Every shoot is engineered for output count, not just hero deliverables.' },
        { title: 'Native formats', body: 'Street interviews, UGC, reactions, founder. We don’t default to the commercial.' },
        { title: 'Performance instincts', body: 'We think in CTR, watch time, and CAC alongside brand storytelling.' },
      ],
    },
    formats: {
      h2: 'What we produce',
      items: ['Street interview videos', 'UGC ads', 'Testimonial videos', 'Branded content', 'Event content', 'Product reactions', 'Founder content'],
    },
    useCases: {
      h2: 'Best for',
      items: ['DTC and e-commerce brands', 'Beauty and personal care brands', 'Food and beverage brands', 'Apps and SaaS', 'Events and activations', 'Local and franchise brands'],
    },
    examplesIntro: 'Recent video work produced for brands.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'What kind of brands do you work with?', a: 'DTC, beauty, food and beverage, apps, SaaS, events, and local businesses. Mostly performance-led teams that need volume creative.' },
      { q: 'Do you replace our internal team?', a: 'No. We extend it. Most clients keep their in-house creative team and use us as a high-volume production partner.' },
      { q: 'Can you white-label?', a: 'Yes — we work behind the scenes for agencies regularly.' },
      { q: 'How do we get started?', a: 'Book a call. We’ll review your goals, ad account if relevant, and recommend a starting format.' },
    ],
    internalLinks: [
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
      { label: 'Branded Video Production', href: '/services/branded-video-production/' },
      { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
      { label: 'Work', href: '/work/' },
    ],
    related: ['social-media-video-production', 'branded-video-production', 'testimonial-video-production'],
  },
  {
    slug: 'ecommerce-video-production',
    priority: 1,
    title: 'Video Production for E-Commerce Brands',
    h1: 'Video Production for E-Commerce Brands',
    meta: 'Product reactions, UGC-style ads, launch creative, TikTok and Meta videos, and Amazon-ready content for e-commerce brands.',
    shortLabel: 'E-Commerce Video',
    navLabel: 'E-Commerce Video Production',
    cardBlurb: 'Product reactions, UGC ads, launch creative, and TikTok/Meta videos for e-commerce.',
    primaryKeyword: 'video production services for e-commerce brands',
    secondaryKeywords: ['ecommerce video production', 'product video production', 'shopify video ads', 'amazon video creative'],
    hero: {
      kicker: 'E-Commerce Video Production',
      headline: 'Video Production for E-Commerce Brands',
      sub: 'Product reactions, UGC ads, launch videos, and TikTok and Meta creative built to convert cold traffic.',
    },
    problem: {
      h2: 'Studio product shots don’t scale on TikTok and Meta',
      body: [
        'Lifestyle photography is a baseline. The feed wants someone holding the product on the street and reacting.',
        'You can’t out-spend bad creative. Most e-commerce CAC problems are creative problems disguised as media problems.',
      ],
    },
    solution: {
      h2: 'Product-first video built around real reactions',
      pillars: [
        { title: 'Product seeding into shoots', body: 'Send us product. We build it into reaction shoots, taste tests, and street interviews.' },
        { title: 'TikTok-and-Meta-native', body: 'Vertical, fast, hook-engineered. Built for direct response in paid social.' },
        { title: 'Amazon and PDP creative', body: 'Same shoot day produces creative for product detail pages and Amazon listings.' },
      ],
    },
    formats: {
      h2: 'E-commerce video formats',
      items: ['Product reaction videos', 'Street interview ads', 'UGC ads', 'Launch videos', 'Unboxing reactions', 'Comparison ads', 'Amazon and PDP video'],
    },
    useCases: {
      h2: 'Best for',
      items: ['New product launches', 'Cold paid traffic on TikTok and Meta', 'Retargeting creative', 'Amazon listing video', 'PDP video', 'Influencer-style content for whitelisting'],
    },
    examplesIntro: 'Recent e-commerce video work.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'Do we ship product to you?', a: 'Yes. Most e-commerce shoots include a product seed step. We handle storage and on-set handling.' },
      { q: 'Can videos be used for Amazon?', a: 'Yes — Amazon-spec exports available on request. Same shoot, multiple cuts.' },
      { q: 'Can you do PDP and ad creative in one shoot?', a: 'Yes. We design shoots for multi-deliverable output.' },
      { q: 'How fast can we go from product to live ads?', a: 'Two to three weeks standard. Rush available for launches.' },
    ],
    internalLinks: [
      { label: 'Industries: E-Commerce Brands', href: '/industries/ecommerce-brands/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
      { label: 'Work', href: '/work/' },
    ],
    related: ['ugc-video-ads', 'social-media-video-production', 'video-ad-production'],
  },
  {
    slug: 'branded-content-video-production',
    priority: 2,
    title: 'Branded Content Video Production for Social-First Brands',
    h1: 'Branded Content Video Production',
    meta: 'Branded content that feels like content first, advertising second — street interview-driven branded video for brands that want native social presence.',
    shortLabel: 'Branded Content',
    navLabel: 'Branded Content Video Production',
    cardBlurb: 'Branded content that earns watch time before it earns a click.',
    primaryKeyword: 'branded content video production',
    secondaryKeywords: ['branded content video', 'native branded content', 'brand storytelling video', 'content-led brand video'],
    hero: {
      kicker: 'Branded Content Video Production',
      headline: 'Branded Content That Earns Watch Time',
      sub: 'Content first. Advertising second. Built around real conversations, real reactions, and real audiences.',
    },
    problem: {
      h2: 'If it looks like a commercial, it gets treated like one',
      body: [
        'The line between content and advertising is the only line that matters in 2026.',
        'Branded content has to land on the content side or the audience tunes out before the value lands.',
      ],
    },
    solution: {
      h2: 'Native-first branded content, built around real people',
      pillars: [
        { title: 'Real-person formats', body: 'Street interviews, public reactions, founder voiceovers — content that earns the brand mention.' },
        { title: 'Story-led structure', body: 'Hook, narrative, payoff. Brand integration is woven through, not bolted on.' },
        { title: 'Designed for social', body: 'Vertical-first, fast-paced, captioned, native to TikTok, Reels, Shorts, Meta, and YouTube.' },
      ],
    },
    formats: {
      h2: 'Branded content we produce',
      items: ['Street-interview branded series', 'Real-person reaction content', 'Founder-led brand content', 'Mini-doc style brand films', 'Public opinion campaigns', 'Comedy-led branded content'],
    },
    useCases: {
      h2: 'Best for',
      items: ['Always-on brand presence', 'Brand awareness campaigns', 'Social-first launches', 'Mid-funnel brand education', 'Earned media plays', 'Cross-platform organic'],
    },
    examplesIntro: 'Recent branded content work in a street-interview style.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'How is branded content different from a commercial?', a: 'Branded content prioritizes watch time. Commercials prioritize message recall. Both have a place — the feed rewards the first.' },
      { q: 'Can branded content drive performance?', a: 'Yes — branded content built natively can outperform direct response ads on cold traffic, especially on TikTok.' },
      { q: 'Do we get usage rights?', a: 'Yes — paid and organic across platforms.' },
    ],
    internalLinks: [
      { label: 'Branded Video Production', href: '/services/branded-video-production/' },
      { label: 'Brand Video Production', href: '/services/brand-video-production/' },
      { label: 'Branded Content Examples', href: '/work/branded-content/' },
    ],
    related: ['branded-video-production', 'brand-video-production', 'social-media-video-production'],
  },
  {
    slug: 'brand-video-production',
    priority: 2,
    title: 'Brand Video Production for Social Media Campaigns',
    h1: 'Brand Video Production for Social-First Brands',
    meta: 'Brand video production for TikTok, Reels, Shorts, and Meta — using street interviews and real-people content that builds trust and stops the scroll.',
    shortLabel: 'Brand Video',
    navLabel: 'Brand Video Production',
    cardBlurb: 'Brand video built for social. Real people. Real moments. Real reactions.',
    primaryKeyword: 'brand video production',
    secondaryKeywords: ['brand video production company', 'brand storytelling video', 'brand campaign video', 'modern brand video'],
    hero: {
      kicker: 'Brand Video Production',
      headline: 'Brand Video, Native to the Feed',
      sub: 'Brand storytelling that uses real people instead of polished actors. Built for paid and organic social.',
    },
    problem: {
      h2: 'Brand videos can’t live in commercial-land anymore',
      body: [
        'Brand teams keep approving videos that look great in a boardroom and underperform in the feed.',
        'The fix is a different production model — one that prioritizes social-feed reality over agency-deck polish.',
      ],
    },
    solution: {
      h2: 'Brand video production for the platforms you actually run',
      pillars: [
        { title: 'Street-interview foundation', body: 'Real people, real on-camera energy. Brand voice without commercial varnish.' },
        { title: 'Vertical and fast', body: 'Built for sound-on, sound-off, vertical, fast cuts, captions, hook variations.' },
        { title: 'Brand-safe by default', body: 'We protect brand voice in scripting and edit gates. Real, not chaotic.' },
      ],
    },
    formats: {
      h2: 'Brand video formats',
      items: ['Brand story videos', 'Founder-led videos', 'Public opinion campaigns', 'Brand reaction videos', 'Always-on brand content', 'Brand documentary-style videos'],
    },
    useCases: {
      h2: 'Best for',
      items: ['Brand awareness', 'Brand repositioning', 'Founder-led storytelling', 'Always-on social', 'Mid-funnel brand education', 'Cross-channel brand campaigns'],
    },
    examplesIntro: 'Recent brand video production work.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'Do you handle brand voice consistency?', a: 'Yes. We build a quick brand voice doc with you and run every script and edit gate through it.' },
      { q: 'Can brand video work on TikTok?', a: 'Especially on TikTok. Native-feeling brand video earns watch time better than direct response.' },
      { q: 'Can we use it for paid ads?', a: 'Yes. Paid and organic usage included.' },
    ],
    internalLinks: [
      { label: 'Branded Video Production', href: '/services/branded-video-production/' },
      { label: 'Branded Content Video Production', href: '/services/branded-content-video-production/' },
      { label: 'Video Production for Brands', href: '/services/video-production-for-brands/' },
    ],
    related: ['branded-video-production', 'branded-content-video-production', 'video-production-for-brands'],
  },
  {
    slug: 'customer-testimonial-video-production',
    priority: 2,
    title: 'Customer Testimonial Video Production for Social Proof',
    h1: 'Customer Testimonial Video Production',
    meta: 'Customer testimonial videos that feel real — street interview-style reactions and authentic on-camera proof for brands that need believable social proof.',
    shortLabel: 'Customer Testimonials',
    navLabel: 'Customer Testimonial Videos',
    cardBlurb: 'Customer testimonials shot in a street-interview style. Real reactions, real proof, real conversion.',
    primaryKeyword: 'customer testimonial video production',
    secondaryKeywords: ['customer testimonial videos', 'customer review videos', 'customer story videos'],
    hero: {
      kicker: 'Customer Testimonial Video Production',
      headline: 'Customer Testimonials That Don’t Feel Corporate',
      sub: 'Real customers, street-interview style. The kind of proof buyers actually believe.',
    },
    problem: {
      h2: 'Most customer testimonials look staged. Buyers feel it.',
      body: [
        'A perfect-frame interview with a single light and a logo bug isn’t proof — it’s production.',
        'Testimonials that convert have to feel like they could have happened anywhere. The format change matters more than the script.',
      ],
    },
    solution: {
      h2: 'Customer testimonials, in the wild',
      pillars: [
        { title: 'Street-interview format', body: 'Real customers, on the street, reacting in real time.' },
        { title: 'Customer-prompt approach', body: 'No scripts — prompts. We pull real answers and edit for the moments that land.' },
        { title: 'Multi-customer campaigns', body: 'Build a library of customer testimonials in 1–2 shoot days, not 6 weeks.' },
      ],
    },
    formats: {
      h2: 'Customer testimonial formats',
      items: ['Street-interview customer testimonials', 'In-store reaction shoots', 'Customer event interviews', 'Multi-customer montage videos', 'Long-form customer stories', 'Short-form testimonial ads'],
    },
    useCases: {
      h2: 'Best for',
      items: ['Landing page proof', 'Paid ad creative', 'Sales decks', 'Email and SMS nurture', 'Retargeting creative', 'Trust-building on category-disruptor brands'],
    },
    examplesIntro: 'Recent customer testimonial video work.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'Do customers need to come to a studio?', a: 'No. We come to them — at events, in stores, or on the street. Lower friction, more authentic on camera.' },
      { q: 'How many customers per shoot?', a: '5–15 testimonials per shoot day depending on logistics.' },
    ],
    internalLinks: [
      { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
      { label: 'Video Testimonial Production', href: '/services/video-testimonial-production/' },
      { label: 'Reviews', href: '/reviews/' },
    ],
    related: ['testimonial-video-production', 'video-testimonial-production', 'street-interview-video-ads'],
  },
  {
    slug: 'video-testimonial-production',
    priority: 2,
    title: 'Video Testimonial Production for Brands',
    h1: 'Video Testimonial Production',
    meta: 'Video testimonial production for brands — short-form, social-ready customer testimonials shot in a street-interview style that feels authentic.',
    shortLabel: 'Video Testimonials',
    navLabel: 'Video Testimonial Production',
    cardBlurb: 'Short-form, social-ready video testimonials that don’t feel like a board meeting.',
    primaryKeyword: 'video testimonial production',
    secondaryKeywords: ['video testimonial services', 'short-form testimonials', 'testimonial video shoot'],
    hero: {
      kicker: 'Video Testimonial Production',
      headline: 'Video Testimonials, Built for Social and Sales',
      sub: 'Short-form, vertical, real-person testimonials that work in ads, on landing pages, and in sales decks.',
    },
    problem: {
      h2: 'Old-format testimonials are too long and too stiff for modern channels',
      body: [
        '90-second corporate testimonials don’t survive a TikTok feed or a paid Meta placement.',
        'Modern buyers want short, native-feeling proof — multiple voices, not a single talking head.',
      ],
    },
    solution: {
      h2: 'Video testimonials, modernized',
      pillars: [
        { title: 'Short and vertical', body: '15–30 second testimonial cuts that work natively across platforms.' },
        { title: 'Multi-voice montages', body: 'Mix multiple customers into single high-trust testimonial ads.' },
        { title: 'Authentic delivery', body: 'Street-interview style, prompt-based. No teleprompter energy.' },
      ],
    },
    formats: {
      h2: 'Testimonial formats',
      items: ['Short-form testimonial cuts', 'Multi-voice testimonial montages', 'Street-interview testimonials', 'Customer reaction testimonials', 'Founder-led testimonial videos', 'Long-form testimonial stories'],
    },
    useCases: {
      h2: 'Best for',
      items: ['Paid ad creative', 'Landing page proof', 'Email and SMS', 'Sales decks', 'Retargeting', 'Influencer-style trust content'],
    },
    examplesIntro: 'Recent video testimonial work.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'How long should video testimonials be?', a: '15–30 seconds for social and ads. 60–90 for landing pages. We’ll cut multiple lengths from one shoot.' },
      { q: 'Real customers or actors?', a: 'Both options. Most brands mix.' },
      { q: 'Do testimonials work as paid ads?', a: 'Yes — testimonial-style street interviews are some of the highest CTR formats on Meta and TikTok.' },
    ],
    internalLinks: [
      { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
      { label: 'Customer Testimonial Video Production', href: '/services/customer-testimonial-video-production/' },
      { label: 'Reviews', href: '/reviews/' },
    ],
    related: ['testimonial-video-production', 'customer-testimonial-video-production', 'street-interview-video-ads'],
  },
  {
    slug: 'ugc-style-videos',
    priority: 2,
    title: 'UGC-Style Videos Made With Real People',
    h1: 'UGC-Style Videos for Brands',
    meta: 'UGC-style videos made with real people, not AI — street interviews, customer reactions, and creator-style content for paid and organic social.',
    shortLabel: 'UGC-Style Videos',
    navLabel: 'UGC-Style Videos',
    cardBlurb: 'Creator-style content with real people. UGC energy without the fake creator feel.',
    primaryKeyword: 'UGC style video',
    secondaryKeywords: ['UGC style videos', 'creator-style videos', 'UGC content production', 'real-person UGC'],
    hero: {
      kicker: 'UGC-Style Videos',
      headline: 'UGC-Style Videos. Real People. Real Energy.',
      sub: 'Creator-style content shot in a street-interview format. UGC vibes without the fake creator feel.',
    },
    problem: {
      h2: 'UGC marketplaces are saturated with the same look',
      body: [
        'Every brand is buying from the same UGC creator pool. The feed is full of identical setups.',
        'Audiences clock the formula in two seconds. UGC stops working when it stops looking different.',
      ],
    },
    solution: {
      h2: 'UGC-style content with a different lane',
      pillars: [
        { title: 'Street-interview UGC', body: 'Real strangers reacting to your product. Maximum authenticity.' },
        { title: 'Creator-style with real range', body: 'We cast for character, not just look. Different voices, different angles, different rooms.' },
        { title: 'Hook variation built in', body: '3–8 hook variations on every video, designed to test in ad accounts.' },
      ],
    },
    formats: {
      h2: 'UGC-style formats we produce',
      items: ['Street-interview UGC', 'Creator-style UGC ads', 'Customer reaction UGC', 'Founder UGC content', 'Comedy UGC formats', 'Problem-solution UGC'],
    },
    useCases: {
      h2: 'Best for',
      items: ['TikTok and Meta paid ads', 'Cold acquisition', 'Retargeting creative', 'Always-on social', 'Whitelisting', 'Brand-safe UGC libraries'],
    },
    examplesIntro: 'Recent UGC-style video work for brands.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'How is this different from a UGC marketplace?', a: 'A marketplace gives you one creator at a time. We deliver a full campaign — multiple voices, multiple angles, edited as a system.' },
      { q: 'Real people or AI?', a: 'Real people, every time. AI shows up in the feed and ages your ad fast.' },
    ],
    internalLinks: [
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
      { label: 'Resources: UGC Video Ads', href: '/resources/ugc-video-ads/' },
    ],
    related: ['ugc-video-ads', 'social-media-video-production', 'street-interview-video-ads'],
  },
  {
    slug: 'b2b-video-production',
    priority: 2,
    title: 'B2B Video Production Services for Social-First Brands',
    h1: 'B2B Video Production Services',
    meta: 'B2B video production for SaaS, apps, and business brands — founder-led prompts, street interviews, and short-form content for LinkedIn, YouTube, and paid social.',
    shortLabel: 'B2B Video',
    navLabel: 'B2B Video Production',
    cardBlurb: 'B2B video for SaaS, apps, and business brands. Founder-led, street-interview-led, social-first.',
    primaryKeyword: 'B2B video production services',
    secondaryKeywords: ['business video production services', 'B2B video production', 'SaaS video production', 'B2B social video'],
    hero: {
      kicker: 'B2B Video Production',
      headline: 'B2B Video Production for Social-First Brands',
      sub: 'Founder-led, street-interview-led, social-first. Built for LinkedIn, YouTube, and modern B2B paid social.',
    },
    problem: {
      h2: 'B2B video still defaults to corporate format',
      body: [
        'Most B2B video looks like a 2014 explainer. It doesn’t survive LinkedIn, doesn’t scale to TikTok, and doesn’t earn trust the way modern B2B buyers want.',
        'B2B buyers are people first. They scroll the same feeds. They reward the same formats.',
      ],
    },
    solution: {
      h2: 'B2B video that works on the platforms B2B buyers actually use',
      pillars: [
        { title: 'Founder-led content', body: 'Founders on camera, in the wild, talking like humans. Highest trust for B2B.' },
        { title: 'Street-interview B2B', body: 'Real customer reactions, real prospect questions, captured on camera.' },
        { title: 'LinkedIn-native edits', body: 'Cut for LinkedIn watch behavior. Captions on by default. Hooks tuned for the feed.' },
      ],
    },
    formats: {
      h2: 'B2B video formats',
      items: ['Founder-led brand videos', 'Street-interview customer testimonials', 'Product walkthrough reaction videos', 'B2B podcast clips', 'Conference and event B2B interviews', 'Sales-deck testimonial videos'],
    },
    useCases: {
      h2: 'Best for',
      items: ['SaaS and apps', 'Agencies and services', 'B2B e-commerce', 'Founder-led brands', 'Always-on LinkedIn presence', 'Sales and demo enablement'],
    },
    examplesIntro: 'Recent B2B video production work.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'Will founders look natural on camera?', a: 'We coach in real time. Most founders relax within 10 minutes of rolling.' },
      { q: 'Can B2B video work on TikTok?', a: 'For some categories, yes. For most B2B, the bigger lift is LinkedIn and YouTube — but we plan TikTok for cross-over plays.' },
      { q: 'Do you handle scripting?', a: 'Yes — talking points and hooks, never full scripts unless requested.' },
    ],
    internalLinks: [
      { label: 'Industries: Apps & SaaS', href: '/industries/apps-saas/' },
      { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
    ],
    related: ['testimonial-video-production', 'social-media-video-production', 'video-production-for-brands'],
  },
  {
    slug: 'tiktok-video-ads',
    priority: 3,
    title: 'TikTok Video Ads Made With Real Street Interviews',
    h1: 'TikTok Video Ads for Brands',
    meta: 'TikTok video ads built around real street interviews and UGC-style creative — native, scroll-stopping, ad-account-ready video for brand campaigns.',
    shortLabel: 'TikTok Ads',
    navLabel: 'TikTok Video Ads',
    cardBlurb: 'TikTok ad creative built native — street interviews, UGC, and hook engineering for paid TikTok.',
    primaryKeyword: 'TikTok video ads',
    secondaryKeywords: ['TikTok ads', 'TikTok ad creative', 'TikTok ad production', 'TikTok video ad agency'],
    hero: {
      kicker: 'TikTok Video Ads',
      headline: 'TikTok Video Ads That Actually Look Like TikTok',
      sub: 'Real-person creative, street interviews, UGC, hook engineering. Built for paid TikTok performance.',
    },
    problem: {
      h2: 'TikTok punishes commercial-feeling ads',
      body: [
        'TikTok’s algorithm rewards content that fits the feed. Polished commercials get throttled fast.',
        'You can’t buy your way past the feed. The creative has to be the right format.',
      ],
    },
    solution: {
      h2: 'Street-interview-led TikTok ad creative',
      pillars: [
        { title: 'Vertical-native', body: 'Shot vertical from the start. No reformat tax.' },
        { title: 'Hook-first edit', body: 'First two seconds engineered to hold. The rest follows.' },
        { title: 'TikTok-ad-account-ready', body: 'All exports formatted for Spark Ads, hook variants, captioned, and uncaptioned.' },
      ],
    },
    formats: {
      h2: 'TikTok ad formats we produce',
      items: ['Street interview TikTok ads', 'UGC TikTok ads', 'Reaction TikTok ads', 'Founder TikTok ads', 'Comedy TikTok ads', 'Spark-ready creator content'],
    },
    useCases: {
      h2: 'Best for',
      items: ['TikTok cold acquisition', 'Spark Ads', 'TikTok Shop', 'Always-on TikTok creative', 'Retargeting on TikTok', 'Brand awareness on TikTok'],
    },
    examplesIntro: 'Recent TikTok ad creative.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'Do you handle Spark Ads?', a: 'Yes. We can run creative through partner accounts when relevant.' },
      { q: 'How many TikTok ads do we get?', a: '8–20 per shoot, depending on package.' },
      { q: 'Can videos run on Meta too?', a: 'Yes — every package includes cross-platform exports.' },
    ],
    internalLinks: [
      { label: 'Video Ad Production', href: '/services/video-ad-production/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Instagram Video Ads', href: '/services/instagram-video-ads/' },
      { label: 'TikTok Ad Creative Examples', href: '/resources/ugc-video-ads/tiktok-ad-creative-examples/' },
    ],
    related: ['video-ad-production', 'ugc-video-ads', 'instagram-video-ads'],
  },
  {
    slug: 'instagram-video-ads',
    priority: 3,
    title: 'Instagram Video Ads & Reels Production for Brands',
    h1: 'Instagram Video Ads for Brands',
    meta: 'Instagram video ads and Reels production for brands — street interview formats, UGC-style creative, and short-form ads built for the IG feed.',
    shortLabel: 'Instagram Ads',
    navLabel: 'Instagram Video Ads',
    cardBlurb: 'Instagram and Reels ad creative built around real-people formats and hook engineering.',
    primaryKeyword: 'Instagram video ads',
    secondaryKeywords: ['Instagram ad creative', 'Reels video ads', 'Instagram ad production', 'Instagram ad agency'],
    hero: {
      kicker: 'Instagram Video Ads',
      headline: 'Instagram Video Ads & Reels Production',
      sub: 'Reels-ready, IG-feed-ready, ad-account-ready. Real-person creative built for paid Instagram performance.',
    },
    problem: {
      h2: 'Instagram and Reels reward different content than the IG of 2018',
      body: [
        'Instagram is a video-first platform now. Static posts are background noise.',
        'Reels-native creative beats repurposed TikToks and beats studio commercials. The format matters.',
      ],
    },
    solution: {
      h2: 'Reels-native ad creative, built around real people',
      pillars: [
        { title: 'Reels-first edit', body: 'Pacing tuned for IG’s feed behavior, not just TikTok’s.' },
        { title: 'Hook engineering', body: 'Multiple hook variants per creative for fast in-account testing.' },
        { title: 'IG-ad-account-ready', body: 'Exports formatted for Reels, Stories, and feed placements.' },
      ],
    },
    formats: {
      h2: 'Instagram ad formats',
      items: ['Reels ads', 'Story ads', 'In-feed video ads', 'Street interview Reels', 'UGC Reels', 'Reaction Reels'],
    },
    useCases: {
      h2: 'Best for',
      items: ['Instagram cold acquisition', 'Reels organic and paid', 'Stories retargeting', 'IG Shopping', 'Influencer whitelisting', 'Always-on IG'],
    },
    examplesIntro: 'Recent Instagram ad creative work.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'Do you produce for Reels and TikTok in one shoot?', a: 'Yes — multi-platform output is the default.' },
      { q: 'What about Stories?', a: 'We deliver Stories-cut versions on request. Same shoot, different edit.' },
    ],
    internalLinks: [
      { label: 'Meta Video Ads', href: '/services/meta-video-ads/' },
      { label: 'TikTok Video Ads', href: '/services/tiktok-video-ads/' },
      { label: 'Video Ad Production', href: '/services/video-ad-production/' },
      { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
    ],
    related: ['meta-video-ads', 'tiktok-video-ads', 'video-ad-production'],
  },
  {
    slug: 'meta-video-ads',
    priority: 3,
    title: 'Meta Video Ads for Brands | Facebook & Instagram Creative',
    h1: 'Meta Video Ads for Brands',
    meta: 'Meta video ads for Facebook and Instagram — street interview ads, UGC-style creative, and high-converting hooks built for paid Meta campaigns.',
    shortLabel: 'Meta Ads',
    navLabel: 'Meta Video Ads',
    cardBlurb: 'Meta ad creative for Facebook and Instagram. Built native, built to test, built to scale.',
    primaryKeyword: 'Meta video ads',
    secondaryKeywords: ['Facebook video ads', 'Meta ad creative', 'Meta ad production', 'Meta ads agency'],
    hero: {
      kicker: 'Meta Video Ads',
      headline: 'Meta Video Ads. Native. Tested. Scalable.',
      sub: 'Facebook and Instagram ad creative built around real-people formats and hook engineering.',
    },
    problem: {
      h2: 'Meta accounts run dry on creative, not budget',
      body: [
        'Account-level CAC issues are almost always creative fatigue. Buyers blame audience saturation. The leak is the ad.',
        'Performance-led brands need fresh creative every two weeks. Most production partners can’t deliver that pace.',
      ],
    },
    solution: {
      h2: 'A creative pipeline built for Meta performance',
      pillars: [
        { title: 'Volume by design', body: '8–20 ads per shoot, with hook variants engineered for Meta testing.' },
        { title: 'Format mix', body: 'Street interview, UGC, reaction, founder, comedy. We pick the mix for your account.' },
        { title: 'Meta-ad-account-ready', body: 'All exports formatted for Meta Ads Manager, ready to upload and test.' },
      ],
    },
    formats: {
      h2: 'Meta ad formats',
      items: ['Reels and feed video ads', 'Street interview Meta ads', 'UGC Meta ads', 'Founder Meta ads', 'Reaction Meta ads', 'Testimonial Meta ads'],
    },
    useCases: {
      h2: 'Best for',
      items: ['Cold acquisition', 'Retargeting', 'Always-on Meta paid', 'New product launches', 'Whitelisting', 'Cross-platform creative pipelines'],
    },
    examplesIntro: 'Recent Meta ad creative work.',
    included: COMMON_INCLUDED,
    process: PROCESS_DEFAULT,
    faq: [
      { q: 'How often should we ship new ads?', a: 'Most brands need 8–20 fresh creatives a month at minimum. We design shoots to feed that pipeline.' },
      { q: 'Do you handle the buy?', a: 'No. We build creative; your team or agency runs the buy.' },
      { q: 'Can we use videos on TikTok too?', a: 'Yes — every package includes cross-platform exports.' },
    ],
    internalLinks: [
      { label: 'Instagram Video Ads', href: '/services/instagram-video-ads/' },
      { label: 'Video Ad Production', href: '/services/video-ad-production/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Meta Ad Creative Examples', href: '/resources/ugc-video-ads/meta-ad-creative-examples/' },
    ],
    related: ['instagram-video-ads', 'video-ad-production', 'ugc-video-ads'],
  },
];

export const SERVICE_BY_SLUG = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));
export const SERVICES_BY_PRIORITY = (p: 0 | 1 | 2 | 3) => SERVICES.filter((s) => s.priority === p);
