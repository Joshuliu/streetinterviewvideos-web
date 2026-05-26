export type CaseStudy = {
  slug: string;
  title: string;
  h1: string;
  meta: string;
  cardBlurb: string;
  client: string;
  industry: string;
  format: string;
  deliverables: string;
  timeline: string;
  challenge: string[];
  contentFormat: string[];
  productionApproach: string[];
  results?: string[];
  testNext?: string[];
  internalLinks: { label: string; href: string }[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'ecommerce-ugc-video-ads',
    title: 'How an E-Commerce Brand Used Street Interview UGC Ads to Launch',
    h1: 'How an E-Commerce Brand Used Street Interview UGC Ads to Launch',
    meta: 'An e-commerce brand replaced polished launch creative with street interview UGC ads. Here’s how it performed and what we’d test next.',
    cardBlurb: 'A DTC brand swapped studio launch creative for street-interview UGC and unlocked a fresh creative lane.',
    client: 'DTC E-Commerce Brand (anonymous)',
    industry: 'E-Commerce',
    format: 'Street interview UGC + product reaction',
    deliverables: '12 vertical ads, 24 hook variants, raw footage',
    timeline: '3 weeks brief-to-live',
    challenge: [
      'The brand had launched two SKUs in the prior 12 months with studio-led creative. Both fatigued in ad accounts within 10 days.',
      'For their next launch, they needed creative the feed actually wanted, not another commercial-feeling ad.',
    ],
    contentFormat: [
      'Hybrid format: street-interview-led product reaction shoots, edited with UGC pacing.',
      'Multiple hook variants engineered into the same shoot day to feed Meta and TikTok testing pipelines.',
      'Customer-first scripting with real on-the-street reaction beats woven through.',
    ],
    productionApproach: [
      'Pre-shoot: aligned on three hero angles (founder POV, real reaction, problem/solution).',
      'Shoot day: multi-look shoot in two NYC neighborhoods, scripted plus unscripted interviews.',
      'Edit: 12 hero ads, each with two hook variants, captioned and uncaptioned exports.',
    ],
    results: [
      'CTR exceeded the brand’s prior launch creative on cold traffic.',
      'Creative held in-account longer than studio-led assets, fatigue measured in weeks, not days.',
      'Same shoot fed both PDP and Amazon listing video.',
    ],
    testNext: [
      'Layer in event-based reaction footage from a pop-up to extend the campaign for 60 more days.',
      'Test comedy-led hooks against problem/solution hooks in the same audience to find a third lane.',
    ],
    internalLinks: [
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'E-Commerce Video Production', href: '/services/ecommerce-video-production/' },
      { label: 'E-Commerce Brands', href: '/industries/ecommerce-brands/' },
      { label: 'Work', href: '/work/ugc-video-ads/' },
    ],
  },
  {
    slug: 'beauty-brand-street-interview-campaign',
    title: 'Beauty Brand Street Interview Campaign | Case Study',
    h1: 'How a Beauty Brand Ran a Street Interview Campaign Across TikTok and Meta',
    meta: 'A beauty brand used scripted and unscripted street interviews for a national TikTok and Meta campaign. The format, the videos, and the results.',
    cardBlurb: 'Scripted + unscripted street interviews powered a multi-month national TikTok and Meta beauty launch.',
    client: 'Beauty Brand (anonymous)',
    industry: 'Beauty',
    format: 'Scripted street interview + unscripted reactions',
    deliverables: '20 vertical ads, before/after montage, raw footage',
    timeline: '6 weeks brief-to-launch',
    challenge: [
      'A national beauty launch needed creative that felt native to TikTok and Reels, without giving up brand-voice control.',
      'The team had run influencer UGC for two years and felt the format was fatigued in their category.',
    ],
    contentFormat: [
      'Two-format mix: scripted street interviews delivered the brand message; unscripted reactions delivered trust.',
      'Before/after capture across two shoot days.',
      'Hook variants engineered for both cold and retargeting placements.',
    ],
    productionApproach: [
      'Casting balanced demo coverage across age, skin type, and city.',
      'Shoot days hit two cities to broaden visual texture.',
      'Edit prioritized real reaction beats; brand integration came after the hook landed.',
    ],
    results: [
      'Outperformed the brand’s prior influencer UGC on hold rate and CTR.',
      'Unscripted-format ads held longer in-account; scripted ads delivered cleaner brand recall.',
      'Same shoot library powered retargeting, retail decks, and in-store screens.',
    ],
    testNext: [
      'Reaction-only campaign for a follow-up SKU to isolate format impact.',
      'Add a comedy lane to test against the current creative mix.',
    ],
    internalLinks: [
      { label: 'Beauty Brands', href: '/industries/beauty-brands/' },
      { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
      { label: 'Work: Street Interviews', href: '/work/street-interviews/' },
    ],
  },
  {
    slug: 'event-activation-street-interviews',
    title: 'Event Activation Street Interview Campaign | Case Study',
    h1: 'How a Brand Used Live Event Street Interviews to Build Launch Buzz',
    meta: 'A brand activation captured 20+ short-form videos on the ground using street interview formats, used across paid social and organic launch campaigns.',
    cardBlurb: 'A pop-up activation produced 20+ short-form videos in one day, used across paid and organic for the next 60.',
    client: 'Brand Activation (anonymous)',
    industry: 'Brand Activation',
    format: 'Event-based street interviews + reaction reels',
    deliverables: '20+ short-form videos, hero recap, raw footage',
    timeline: '1-day shoot, same-week delivery',
    challenge: [
      'The brand had a one-day activation window and needed it to feed paid social for the next 60 days.',
      'Prior activations had produced a single 90-second sizzle reel, and not much else.',
    ],
    contentFormat: [
      'Embedded crew capturing attendee reactions, product moments, and street-interview-style interviews on-site.',
      'Multiple lanes: hype clips, testimonial moments, public opinion interviews, behind-the-scenes.',
      'Hero recap plus 20+ short-form clips.',
    ],
    productionApproach: [
      'Pre-event: shot list + interview prompt deck approved.',
      'On-site: 2-person crew rotating between activation floor and street.',
      'Same-week delivery: hero clips delivered next-day, full library within five business days.',
    ],
    results: [
      'Same shoot fueled 60 days of paid social and three organic content drops.',
      'Per-clip cost dropped substantially vs. a traditional event recap workflow.',
      'Several clips were re-cut into testimonial-style ads for the brand’s ongoing creative pipeline.',
    ],
    testNext: [
      'Layer in a follow-up shoot 30 days post-event to extend the trust narrative.',
    ],
    internalLinks: [
      { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
      { label: 'Events & Activations', href: '/industries/events-activations/' },
      { label: 'Branded Content Examples', href: '/work/branded-content/' },
    ],
  },
  {
    slug: 'app-launch-street-interview-ads',
    title: 'App Launch Street Interview Ads | Case Study',
    h1: 'How an App Used Street Interview Ads to Drive Installs',
    meta: 'An app launched into paid Meta and TikTok using street interview-style ad creative. Format choices, hook variations, and what we’d ship next.',
    cardBlurb: 'An app launch used street-interview-style hooks to drive cold installs on Meta and TikTok.',
    client: 'Mobile App (anonymous)',
    industry: 'Apps & SaaS',
    format: 'Scripted street interview UGC + problem/solution hooks',
    deliverables: '10 vertical ads, 20 hook variants, raw footage',
    timeline: '2 weeks brief-to-live',
    challenge: [
      'A new app needed to enter paid Meta and TikTok with creative that wouldn’t look like every other app ad in the feed.',
      'The team wanted a creative pipeline that could refresh weekly without a full re-shoot every time.',
    ],
    contentFormat: [
      'Scripted street-interview UGC anchored each ad.',
      'Problem/solution hook variants tested against public opinion hooks.',
      'Founder cameo on select hooks to add B2B-style trust to a B2C ad.',
    ],
    productionApproach: [
      'One shoot day, two locations, six on-camera people.',
      '20 hook variants edited from the same source footage.',
      'Ad-account-ready exports for Meta and TikTok.',
    ],
    results: [
      'Hook variants surfaced two clear winners by day 7 of testing.',
      'Winning hooks scaled with stable CPI for the campaign window.',
      'Reusable footage seeded the next month of always-on creative.',
    ],
    testNext: [
      'Test a comedy hook variant for cold traffic.',
      'Layer in customer street-interview testimonials at 30-day mark for retargeting.',
    ],
    internalLinks: [
      { label: 'Apps & SaaS', href: '/industries/apps-saas/' },
      { label: 'B2B Video Production', href: '/services/b2b-video-production/' },
      { label: 'Video Ad Production', href: '/services/video-ad-production/' },
      { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
    ],
  },
];

export const CASE_STUDY_BY_SLUG = Object.fromEntries(CASE_STUDIES.map((c) => [c.slug, c]));
