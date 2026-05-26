export type ResourceTopic = {
  slug: string;
  title: string;
  h1: string;
  meta: string;
  navLabel: string;
  description: string;
  servicePage: { label: string; href: string };
};

export type ResourceArticle = {
  topic: string;
  slug: string;
  title: string;
  h1: string;
  meta: string;
  intent: string;
  intro: string;
  body: { h2: string; paragraphs: string[]; list?: string[] }[];
  faq: { q: string; a: string }[];
  serviceLinks: { label: string; href: string }[];
  related: { label: string; href: string }[];
};

export const RESOURCE_TOPICS: ResourceTopic[] = [
  {
    slug: 'street-interview-videos',
    title: 'Street Interview Video Guides & Examples',
    h1: 'Everything You Need to Know About Street Interview Videos',
    meta: 'Guides, examples, and scripts on how to make street interview videos for brands — formats, costs, questions, and ad-ready production tips.',
    navLabel: 'Street Interview Videos',
    description: 'Practical guides and real examples on producing street interview videos for brand campaigns.',
    servicePage: { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
  },
  {
    slug: 'ugc-video-ads',
    title: 'UGC Video Ad Guides & Examples',
    h1: 'Everything You Need to Know About UGC Video Ads',
    meta: 'UGC video ad examples, hooks, comparison guides, AI vs real-person UGC, and platform-specific creative guides for TikTok and Meta.',
    navLabel: 'UGC Video Ads',
    description: 'Examples, hooks, comparisons, and platform breakdowns for UGC video ads.',
    servicePage: { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
  },
  {
    slug: 'branded-video-production',
    title: 'Branded Video Production Guides',
    h1: 'Everything You Need to Know About Branded Video Production',
    meta: 'What branded video production is, examples, ideas, and how to make brand content that feels like content first and advertising second.',
    navLabel: 'Branded Video Production',
    description: 'Guides on branded video production, content-first storytelling, and modern brand video strategy.',
    servicePage: { label: 'Branded Video Production', href: '/services/branded-video-production/' },
  },
  {
    slug: 'testimonial-video-production',
    title: 'Testimonial Video Production Guides',
    h1: 'Everything You Need to Know About Testimonial Videos',
    meta: 'Testimonial video examples, customer questions, scripting tips, cost guides, and how to make testimonial content that feels less corporate.',
    navLabel: 'Testimonial Video Production',
    description: 'Examples, questions, scripts, and cost breakdowns for testimonial videos that don’t feel corporate.',
    servicePage: { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
  },
  {
    slug: 'social-media-video-production',
    title: 'Social Media Video Production Guides',
    h1: 'Everything You Need to Know About Social Media Video Production',
    meta: 'Social media video production guides — process, ideas, TikTok vs Reels strategy, and how to scale ad creative for brand campaigns.',
    navLabel: 'Social Media Video Production',
    description: 'Process, strategy, and ideas for social media video production at brand scale.',
    servicePage: { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
  },
];

export const RESOURCE_TOPIC_BY_SLUG = Object.fromEntries(RESOURCE_TOPICS.map((t) => [t.slug, t]));

const buildArticle = (
  topic: string,
  slug: string,
  title: string,
  h1: string,
  meta: string,
  intent: string,
  bodySpec: { h2: string; paragraphs: string[]; list?: string[] }[],
  faq: { q: string; a: string }[],
  serviceLinks: { label: string; href: string }[],
  related: { label: string; href: string }[]
): ResourceArticle => ({
  topic,
  slug,
  title,
  h1,
  meta,
  intent,
  intro: bodySpec[0]?.paragraphs[0] ?? '',
  body: bodySpec,
  faq,
  serviceLinks,
  related,
});

const SERVICE_LINK_STREET = [
  { label: 'Street Interview Video Ads', href: '/services/street-interview-video-ads/' },
  { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
  { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
];
const SERVICE_LINK_UGC = [
  { label: 'UGC Video Ads', href: '/services/ugc-video-ads/' },
  { label: 'UGC-Style Videos', href: '/services/ugc-style-videos/' },
  { label: 'Video Ad Production', href: '/services/video-ad-production/' },
];
const SERVICE_LINK_BRAND = [
  { label: 'Branded Video Production', href: '/services/branded-video-production/' },
  { label: 'Brand Video Production', href: '/services/brand-video-production/' },
  { label: 'Video Production for Brands', href: '/services/video-production-for-brands/' },
];
const SERVICE_LINK_TEST = [
  { label: 'Testimonial Video Production', href: '/services/testimonial-video-production/' },
  { label: 'Customer Testimonial Video Production', href: '/services/customer-testimonial-video-production/' },
  { label: 'Video Testimonial Production', href: '/services/video-testimonial-production/' },
];
const SERVICE_LINK_SOCIAL = [
  { label: 'Social Media Video Production', href: '/services/social-media-video-production/' },
  { label: 'Video Ad Production', href: '/services/video-ad-production/' },
  { label: 'TikTok Video Ads', href: '/services/tiktok-video-ads/' },
];

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  // ─────────── Street Interview Videos ───────────
  buildArticle('street-interview-videos', 'what-is-a-street-interview-video',
    'What Is a Street Interview Video? (With Examples)',
    'What Is a Street Interview Video?',
    'A street interview video is short-form content shot on the street with real people. Here’s how the format works, why brands use it, and ad examples.',
    'Define the format and explain why brands now use it as paid ad creative.',
    [
      { h2: 'The short version', paragraphs: [
        'A street interview video is a short-form video shot in a public space — usually on a sidewalk or in a busy public area — where a host asks real people questions on camera.',
        'In a brand context, that format becomes a paid or organic ad: a real-person reaction to a product, a category, a question, or a hook.',
      ]},
      { h2: 'Why brands run street interview videos', paragraphs: [
        'Two reasons. First, the format feels native to social feeds — vertical, real environments, real reactions. The algorithm rewards it. Audiences finish it.',
        'Second, the social proof is unfakeable. A real stranger reacting on camera carries trust that no actor or polished ad can match.',
      ]},
      { h2: 'Two flavors: scripted vs unscripted', paragraphs: [
        'Scripted street interviews use actors who hit a brand message reliably. Faster, more on-brand, more consistent.',
        'Unscripted street interviews use real strangers. Slower, less predictable, higher trust.',
      ], list: ['Use scripted when you need a controlled brand message', 'Use unscripted when you need maximum trust', 'Use a mix when you want both in one campaign']},
      { h2: 'What you get from a street interview shoot', paragraphs: [
        'Most street interview shoots produce 20+ edited videos, raw footage, and captioned exports from a single shoot day. Hook variations are available as a paid add-on.',
      ], list: ['Edited vertical videos for paid and organic', 'Multiple hook variants per ad', 'Captioned and uncaptioned exports', 'Raw footage for re-cuts and repurposing']},
      { h2: 'Examples in the wild', paragraphs: [
        'Beauty brands use street interviews for before/after taste tests of new products. Beverage brands use them for taste reactions. Apps use them for problem/solution hooks. E-commerce brands use them for product reactions.',
      ]},
    ],
    [
      { q: 'How long is a street interview video?', a: 'For paid ads, 15–30 seconds. For organic, up to 60.' },
      { q: 'Are street interviews scripted?', a: 'Both formats exist. Scripted uses actors. Unscripted uses real strangers. We help you pick.' },
      { q: 'Where are they filmed?', a: 'On the street, in busy public spaces, at events, or in retail — anywhere with foot traffic and the right lighting.' },
    ],
    SERVICE_LINK_STREET,
    [
      { label: 'Man on the Street Interview Examples', href: '/resources/street-interview-videos/man-on-the-street-interview-examples/' },
      { label: 'Scripted vs Unscripted Street Interviews', href: '/resources/street-interview-videos/scripted-vs-authentic-street-interviews/' },
    ]),

  buildArticle('street-interview-videos', 'man-on-the-street-interview-examples',
    'Man on the Street Interview Examples for Brands',
    'Man on the Street Interview Examples for Brands',
    'Real examples of man-on-the-street interview videos used by brands for product launches, paid ads, and social campaigns.',
    'Show real-format examples and contextualize each one against a brand goal.',
    [
      { h2: 'Why these examples work', paragraphs: [
        'The man-on-the-street format works because the audience watches a real reaction unfold. There’s no studio bench, no logo bug, no obvious script.',
        'Below are recurring patterns that translate well into paid and organic content for brands.',
      ]},
      { h2: 'Pattern 1: The taste test', paragraphs: [
        'Used most by food and beverage brands. The host approaches strangers, hands them a product, films the reaction.',
      ], list: ['Hook: “What do you think this is?”', 'Reveal: brand and SKU on camera', 'Payoff: real reaction, often unscripted humor']},
      { h2: 'Pattern 2: Public opinion', paragraphs: [
        'Used by category-disruptor and rebranding campaigns. The host asks open-ended questions about a category or behavior.',
      ], list: ['Hook: “What do you hate about [category]?”', 'Reveal: brand-positioning answer', 'Payoff: viewer agrees emotionally before the brand shows up']},
      { h2: 'Pattern 3: Before/after reaction', paragraphs: [
        'Used by beauty, fitness, and wellness brands. Capture a stranger’s reaction to a product result on camera.',
      ]},
      { h2: 'Pattern 4: Founder-on-the-street', paragraphs: [
        'A founder asks strangers questions about their own product — sometimes pretending to be a customer or asking opinions of a competitor.',
      ]},
      { h2: 'How to pick the right pattern', paragraphs: [
        'Start with the campaign goal. Trust → reaction. Brand awareness → public opinion. Conversion → problem/solution. Launch → taste test or unboxing reaction.',
      ]},
    ],
    [
      { q: 'Are these all real strangers?', a: 'Some are, some aren’t. Unscripted uses real strangers; scripted uses actors. Both produce great ads.' },
      { q: 'How many videos come from one shoot?', a: '20+ edited videos depending on package, plus raw footage. Hook variations are available as a paid add-on.' },
    ],
    SERVICE_LINK_STREET,
    [
      { label: 'Best Street Interview Questions', href: '/resources/street-interview-videos/best-street-interview-questions-for-brands/' },
      { label: 'Street Interview Script Examples', href: '/resources/street-interview-videos/street-interview-video-script-examples/' },
    ]),

  buildArticle('street-interview-videos', 'best-street-interview-questions-for-brands',
    'Best Street Interview Questions for Brands',
    'The Best Street Interview Questions for Brands',
    'The questions that get the best on-camera reactions for street interview videos — by goal, format, and product type.',
    'Provide a question library brands can pull from, structured by intent.',
    [
      { h2: 'A good street interview question is short, sharp, and specific', paragraphs: [
        'The best on-camera reactions come from questions that don’t feel like brand questions. They feel like things you’d actually ask a stranger.',
      ]},
      { h2: 'Questions that drive reaction (best for cold paid social)', paragraphs: ['Use these as opening hooks. They’re engineered to produce a fast, watchable reaction.'], list: ['What’s the worst [category] product you’ve ever tried?', 'How much would you pay for this if you saw it in a store?', 'Try this and tell me what flavor you taste.', 'What does this remind you of?', 'When did you last buy [category]?']},
      { h2: 'Questions that drive trust (best for testimonial-style ads)', paragraphs: ['Use these mid-conversation, after the reaction.'], list: ['What surprised you about this?', 'Would you tell a friend about this?', 'Where would this fit in your life?', 'What were you using before?']},
      { h2: 'Questions that drive humor', paragraphs: ['Use sparingly. Comedy goes wrong fast on brand video.'], list: ['Pretend this costs $1,000 — sell it.', 'Roast this product.', 'What’s the most ridiculous use case you can think of?']},
      { h2: 'How to combine them in a real shoot', paragraphs: [
        'Layer reaction → trust → humor across a 90-second on-camera moment. Edit isolates the strongest beat. Repeat across multiple strangers.',
      ]},
    ],
    [
      { q: 'How many questions per shoot?', a: '5–10 prepared, with room to improvise on the day.' },
      { q: 'Should we share questions with strangers in advance?', a: 'No — the unrehearsed reaction is the entire point.' },
    ],
    SERVICE_LINK_STREET,
    [
      { label: 'Street Interview Script Examples', href: '/resources/street-interview-videos/street-interview-video-script-examples/' },
      { label: 'How to Make Street Interview Videos', href: '/resources/street-interview-videos/how-to-make-street-interview-videos/' },
    ]),

  buildArticle('street-interview-videos', 'street-interview-video-script-examples',
    'Street Interview Video Script Examples',
    'Street Interview Video Script Examples',
    'Real script examples for street interview videos — scripted and unscripted formats, by ad goal, with hooks and CTAs that perform.',
    'Show actual script structures brands can adapt.',
    [
      { h2: 'A street interview script is just a question list with a hook', paragraphs: [
        'Even scripted street interviews aren’t scripts in the movie sense. They’re structured prompts, ordered for the edit.',
      ]},
      { h2: 'Script template: cold-traffic ad (scripted)', paragraphs: ['Use this as a starting frame. Adapt brand voice in the bracketed sections.'], list: ['Hook: “Have you ever tried [category] that actually [outcome]?”', 'Reveal: hand product, ask for reaction', 'Trust beat: “Where would you use this?”', 'Brand line: “This is [brand]. It’s [positioning].”', 'CTA on screen']},
      { h2: 'Script template: unscripted public opinion', paragraphs: ['Used for repositioning campaigns and category-disruptor brands.'], list: ['Hook: “What do you actually want from [category]?”', 'Listening: 2–3 unprompted answers', 'Reveal: brand introduces solution', 'Trust beat: “Would you switch to this?”']},
      { h2: 'Script template: testimonial-style', paragraphs: ['Used for retargeting and landing page proof.'], list: ['Hook: “How long have you been using [brand]?”', 'Story beat: “What changed?”', 'Trust beat: “Would you recommend it?”']},
      { h2: 'Things to leave out of any street interview script', paragraphs: [
        'Don’t script the reaction — let it happen. Don’t mention the price unprompted. Don’t over-engineer humor. Keep brand mentions to once or twice per spot.',
      ]},
    ],
    [
      { q: 'Should the actor or stranger memorize lines?', a: 'No. They get talking points and a hook. Memorized lines kill the format.' },
      { q: 'How long is a typical script?', a: 'Half a page. The shoot day improvises around it.' },
    ],
    SERVICE_LINK_STREET,
    [
      { label: 'Best Street Interview Questions', href: '/resources/street-interview-videos/best-street-interview-questions-for-brands/' },
      { label: 'Scripted vs Unscripted Street Interviews', href: '/resources/street-interview-videos/scripted-vs-authentic-street-interviews/' },
    ]),

  buildArticle('street-interview-videos', 'how-to-make-street-interview-videos',
    'How to Make Street Interview Videos for Brands',
    'How to Make Street Interview Videos for Brands',
    'Step-by-step on how to make a street interview video — gear, location, questions, casting, editing, and ad-ready delivery.',
    'Provide a complete production walkthrough.',
    [
      { h2: 'Step 1: Pick the goal first', paragraphs: [
        'Format follows goal. Cold acquisition needs hook variants. Brand awareness needs reaction. Trust needs testimonials. Launch needs reactions plus product reveal.',
      ]},
      { h2: 'Step 2: Pick the format', paragraphs: [
        'Scripted = actor-led, fast, brand-controlled. Unscripted = real strangers, slower, higher trust. Hybrid = both in one shoot.',
      ]},
      { h2: 'Step 3: Pick the location', paragraphs: [
        'Foot traffic, light, and texture. The location shows up on camera as much as the people do. Avoid locations that look like every other ad.',
      ]},
      { h2: 'Step 4: Cast and prep', paragraphs: [
        'For scripted: cast for character range, not just look. For unscripted: secure permits, prep your interviewer, rehearse the hook.',
      ]},
      { h2: 'Step 5: Shoot day', paragraphs: [
        'Shoot vertical from the start. Capture multiple angles. Get release forms signed before publishing anything.',
      ]},
      { h2: 'Step 6: Edit', paragraphs: [
        'Cut for the reaction beat. Captions on by default. Multiple hook variants from the same source footage.',
      ]},
      { h2: 'Step 7: Deliver', paragraphs: [
        'Vertical exports, captioned and uncaptioned, ad-account-ready filenames, raw footage to the brand.',
      ]},
    ],
    [
      { q: 'Can we do this ourselves?', a: 'You can. Most brands find the time, casting, and edit pipeline outweigh the cost of a partner.' },
      { q: 'How long is a shoot day?', a: '6–10 hours, depending on package and locations.' },
    ],
    SERVICE_LINK_STREET,
    [
      { label: 'Best Street Interview Questions', href: '/resources/street-interview-videos/best-street-interview-questions-for-brands/' },
      { label: 'Street Interview Video Cost', href: '/resources/street-interview-videos/street-interview-video-cost/' },
    ]),

  buildArticle('street-interview-videos', 'scripted-vs-authentic-street-interviews',
    'Scripted vs Unscripted Street Interviews | Which to Use',
    'Scripted vs Unscripted Street Interviews',
    'Scripted street interviews are faster and more on-brand. Unscripted ones build more trust. Here’s when to use each format.',
    'Help brands pick between the two formats based on goal.',
    [
      { h2: 'Both formats work — they do different jobs', paragraphs: [
        'Most brands assume one is better than the other. Neither is. The right pick depends on what you’re trying to achieve and how much variability you can absorb.',
      ]},
      { h2: 'Scripted street interviews', paragraphs: ['Strengths and tradeoffs.'], list: ['Strength: brand-message control', 'Strength: fast and reliable', 'Strength: cleaner edit', 'Tradeoff: lower trust ceiling than unscripted', 'Tradeoff: can feel “produced” if cast or directed wrong']},
      { h2: 'Unscripted street interviews', paragraphs: ['Strengths and tradeoffs.'], list: ['Strength: highest trust ceiling', 'Strength: unfakeable reaction', 'Strength: organic-share friendly', 'Tradeoff: slower to capture usable beats', 'Tradeoff: requires editorial care to land brand message']},
      { h2: 'Decision matrix', paragraphs: ['How we recommend choosing.'], list: ['Cold paid acquisition → scripted (with unscripted test)', 'Brand awareness → unscripted', 'Repositioning → unscripted', 'Performance retargeting → scripted', 'Launch hype → hybrid']},
      { h2: 'Hybrid is often the best answer', paragraphs: [
        'Most strong campaigns mix both formats. Scripted carries the brand line. Unscripted carries the trust beat.',
      ]},
    ],
    [
      { q: 'Are unscripted street interviews more expensive?', a: 'Not always. They can be slower per usable beat but more durable in ad accounts.' },
      { q: 'Can we mix them?', a: 'Yes — most strong campaigns do.' },
    ],
    SERVICE_LINK_STREET,
    [
      { label: 'What Is a Street Interview Video?', href: '/resources/street-interview-videos/what-is-a-street-interview-video/' },
      { label: 'How to Make Street Interview Videos', href: '/resources/street-interview-videos/how-to-make-street-interview-videos/' },
    ]),

  buildArticle('street-interview-videos', 'street-interview-video-cost',
    'How Much Do Street Interview Videos Cost?',
    'How Much Do Street Interview Videos Cost?',
    'What street interview videos cost in 2026 — by format, deliverable count, location, and campaign size. With package examples.',
    'Set expectations on cost without giving exact dollar amounts.',
    [
      { h2: 'Street interview video cost depends on five things', paragraphs: [
        'Casting model, deliverable count, hook variant count, locations, and turnaround. Move any one of these up, the cost moves up. Move them all down, you get a starter shoot.',
      ]},
      { h2: 'Casting model', paragraphs: [
        'Scripted (actors) is generally faster and more predictable. Unscripted (real strangers) takes more on-the-ground time and permits. Hybrid splits the cost.',
      ]},
      { h2: 'Deliverable count', paragraphs: [
        'A starter package might produce 1–2 hero ads. A campaign package can produce 20+ from a single shoot.',
      ]},
      { h2: 'Hook variants', paragraphs: [
        'Hook engineering scales testing. More variants = more edit time = higher cost, but also a much faster path to a winning ad.',
      ]},
      { h2: 'Locations and turnaround', paragraphs: [
        'Multi-city or multi-day shoots cost more. Rush turnaround for time-sensitive launches costs more.',
      ]},
      { h2: 'How to size your first project', paragraphs: [
        'Start with a single-city shoot, scripted-led, with two hook variants per video. That gives a clear performance signal without overcommitting before you have data.',
      ]},
    ],
    [
      { q: 'Why don’t you list a price here?', a: 'Because the right answer depends on your goal, deliverables, and shoot logistics. Book a call and we’ll send a clear scope.' },
      { q: 'Are there add-ons that change cost?', a: 'Yes — extra hooks, extra languages, additional shoot days, product seeding, on-location event coverage.' },
    ],
    SERVICE_LINK_STREET,
    [
      { label: 'How to Make Street Interview Videos', href: '/resources/street-interview-videos/how-to-make-street-interview-videos/' },
      { label: 'Scripted vs Unscripted Street Interviews', href: '/resources/street-interview-videos/scripted-vs-authentic-street-interviews/' },
    ]),

  // ─────────── UGC Video Ads ───────────
  buildArticle('ugc-video-ads', 'ugc-video-ad-examples',
    'UGC Video Ad Examples for Brands',
    'UGC Video Ad Examples for Brands',
    'Real UGC video ad examples for TikTok, Meta, Reels, and Shorts — formats, hooks, and what makes them convert.',
    'Catalog UGC ad patterns and explain what works.',
    [
      { h2: 'UGC ads come in lanes — pick the right one', paragraphs: [
        'There’s no single UGC format. There are recognizable lanes — and brands tend to win when they pick a lane and run it well.',
      ]},
      { h2: 'Lane 1: Creator-style POV', paragraphs: ['A creator-style POV ad films from the user’s perspective. Hand-held, casual, voiceover style.']},
      { h2: 'Lane 2: Reaction', paragraphs: ['Filmed in a real environment, the user reacts to the product on camera. High trust, fast watch time.']},
      { h2: 'Lane 3: Problem/solution', paragraphs: ['A user articulates a problem on camera, then introduces the product as the fix. Highest converting on cold paid traffic.']},
      { h2: 'Lane 4: Comedy', paragraphs: ['Used sparingly. When it works, watch time is unmatched. When it misses, brand recall suffers.']},
      { h2: 'Lane 5: Founder UGC', paragraphs: ['Founder on camera, talking like a creator, not a CEO. Strong for early-stage and category-disruptor brands.']},
      { h2: 'Why street-interview UGC wins right now', paragraphs: [
        'Street-interview UGC is reaction at scale. Real strangers reacting to your product, edited like UGC. Audiences haven’t seen it 1,000 times yet.',
      ]},
    ],
    [
      { q: 'Are these all real users?', a: 'Some are real users. Some are creators. Some are actors. The format is the lane — the casting is a separate decision.' },
      { q: 'How many UGC ads should we test?', a: '20+ fresh creatives a month, minimum, for performance accounts.' },
    ],
    SERVICE_LINK_UGC,
    [
      { label: 'Best Video Ad Hooks', href: '/resources/ugc-video-ads/best-video-ad-hooks/' },
      { label: 'AI UGC vs Real-Person UGC', href: '/resources/ugc-video-ads/ai-ugc-vs-real-person-ugc/' },
    ]),

  buildArticle('ugc-video-ads', 'ugc-vs-street-interview-videos',
    'UGC vs Street Interview Videos | Which Performs Better?',
    'UGC vs Street Interview Videos',
    'UGC ads and street interview videos both feel native to social. Here’s when each format wins, with examples.',
    'Compare two adjacent formats and explain when each wins.',
    [
      { h2: 'They look similar but they’re different formats', paragraphs: [
        'UGC and street interview videos both feel native to social. They’re shot vertical. They feature real people. They sit on the same shelf in the feed.',
        'But the production model is different — and so is what the audience reads off the screen.',
      ]},
      { h2: 'UGC = the user reviewing the product', paragraphs: [
        'Filmed by a creator (or actor playing a creator) in their own space. POV camera. The user is presenting an opinion.',
      ]},
      { h2: 'Street interview = real strangers reacting', paragraphs: [
        'Filmed by a crew on the street. Multiple subjects. The brand records an unscripted moment and edits for the reaction.',
      ]},
      { h2: 'When UGC wins', paragraphs: [], list: ['Cold paid traffic with a strong creator-economy audience', 'Categories where the user’s home environment matters (skincare, fitness, home goods)', 'Whitelisting through real creator accounts']},
      { h2: 'When street interview wins', paragraphs: [], list: ['Cold paid traffic where “real stranger reacted” is the trust signal', 'Public opinion campaigns and category-disruptor positioning', 'Taste tests, before/afters, and reaction-led launches']},
      { h2: 'Hybrid wins more than either alone', paragraphs: [
        'Most strong creative pipelines run both. UGC for the at-home moment. Street interview for the public-trust moment.',
      ]},
    ],
    [
      { q: 'Can we use the same crew for both?', a: 'Yes — a hybrid shoot day can produce both formats from one production.' },
      { q: 'Which is faster to produce?', a: 'UGC marketplaces are fastest, but quality varies. Street interview is slower per video but produces more durable creative.' },
    ],
    SERVICE_LINK_UGC,
    [
      { label: 'AI UGC vs Real-Person UGC', href: '/resources/ugc-video-ads/ai-ugc-vs-real-person-ugc/' },
      { label: 'UGC Video Ad Examples', href: '/resources/ugc-video-ads/ugc-video-ad-examples/' },
    ]),

  buildArticle('ugc-video-ads', 'ai-ugc-vs-real-person-ugc',
    'AI UGC vs Real-Person UGC | 2026 Comparison',
    'AI UGC vs Real-Person UGC',
    'AI UGC is fast and cheap. Real-person UGC builds real trust. Here’s how each format performs in 2026 ad accounts.',
    'Take a clear position on AI vs real-person UGC.',
    [
      { h2: 'AI UGC works in narrow lanes — real-person UGC still wins on trust', paragraphs: [
        'AI UGC is faster. It’s cheaper. It’s available everywhere. None of those things mean it should be the default for brand video.',
      ]},
      { h2: 'Where AI UGC works', paragraphs: [], list: ['Concept testing before a real shoot', 'Translating an existing winning UGC ad into other languages', 'Producing variants for non-customer-facing tests']},
      { h2: 'Where AI UGC breaks', paragraphs: [], list: ['Cold paid traffic — audiences clock it', 'Trust-led campaigns', 'Brands where category authenticity is part of positioning', 'Anything where the face on screen carries the message']},
      { h2: 'Why real-person UGC still wins', paragraphs: [
        'The audience has spent two decades learning to read whether a face on camera is real. AI hasn’t crossed that threshold for ad recall yet.',
        'Real-person UGC ages slower in ad accounts and produces meaningful re-cuts for retargeting and PDPs.',
      ]},
      { h2: 'Hybrid is the right play if you’re cost-constrained', paragraphs: [
        'Use AI UGC to test concepts. Use real-person UGC to ship the winners.',
      ]},
    ],
    [
      { q: 'Will AI UGC ever replace real-person UGC?', a: 'For some lanes, eventually. For trust-led brand video, not anytime soon.' },
      { q: 'Do you produce AI UGC?', a: 'No. We produce real-person UGC and street-interview UGC. AI shows up in our edit assist tools, never on camera.' },
    ],
    SERVICE_LINK_UGC,
    [
      { label: 'UGC Video Ad Examples', href: '/resources/ugc-video-ads/ugc-video-ad-examples/' },
      { label: 'UGC vs Street Interview Videos', href: '/resources/ugc-video-ads/ugc-vs-street-interview-videos/' },
    ]),

  buildArticle('ugc-video-ads', 'best-video-ad-hooks',
    'Best Video Ad Hooks for TikTok, Meta, and Reels',
    'The Best Video Ad Hooks for TikTok, Meta, and Reels',
    'The video ad hooks that consistently win across TikTok, Meta, Reels, and Shorts — with examples and why they convert.',
    'Provide a hook library brands can use directly.',
    [
      { h2: 'A hook is the first 1.5 seconds. That’s it.', paragraphs: [
        'The first second and a half decides whether the rest of the ad gets watched. Everything else is downstream.',
      ]},
      { h2: 'Hook archetype 1: Public opinion', paragraphs: ['“What do you actually think about [category]?”'], list: ['Used by category-disruptor brands', 'Pairs with unscripted street interview format', 'Works on cold traffic']},
      { h2: 'Hook archetype 2: Pattern interrupt', paragraphs: ['“Stop scrolling. Try this.” / “If you’ve never [action], read this.”'], list: ['Used when the brand needs to break feed pattern fast', 'Pairs with creator-style UGC']},
      { h2: 'Hook archetype 3: Reveal', paragraphs: ['“Watch what happens when she tries it.”'], list: ['Used for taste tests and reaction-led ads', 'Pairs with street interview taste test format']},
      { h2: 'Hook archetype 4: Problem framing', paragraphs: ['“If you hate [problem], watch this.”'], list: ['Used for cold paid acquisition', 'Pairs with problem/solution UGC']},
      { h2: 'Hook archetype 5: Social proof', paragraphs: ['“Three real people tried this.”'], list: ['Used for retargeting', 'Pairs with multi-customer testimonial street interviews']},
      { h2: 'Test hooks against each other in the same audience', paragraphs: [
        'Don’t test ads. Test hooks. Same body, different first 1.5 seconds. The data clarifies in days instead of weeks.',
      ]},
    ],
    [
      { q: 'How many hooks per ad should we test?', a: '3–8 variants on every hero ad.' },
      { q: 'Should hooks include captions?', a: 'Yes — assume sound-off until proven otherwise.' },
    ],
    SERVICE_LINK_UGC,
    [
      { label: 'TikTok Ad Creative Examples', href: '/resources/ugc-video-ads/tiktok-ad-creative-examples/' },
      { label: 'Meta Ad Creative Examples', href: '/resources/ugc-video-ads/meta-ad-creative-examples/' },
    ]),

  buildArticle('ugc-video-ads', 'tiktok-ad-creative-examples',
    'TikTok Ad Creative Examples That Convert',
    'TikTok Ad Creative Examples That Convert',
    'TikTok ad creative examples for brands — UGC, street interviews, and short-form formats that drive scroll-stops and clicks.',
    'Show TikTok-specific creative patterns and explain why they work.',
    [
      { h2: 'TikTok creative is its own animal', paragraphs: [
        'What works on Meta doesn’t always survive on TikTok. The platform rewards content that feels like content, not content that feels like an ad.',
      ]},
      { h2: 'TikTok-native pattern 1: POV walk-and-talk', paragraphs: ['Creator filming themselves walking, talking to camera. Casual, hand-held.']},
      { h2: 'TikTok-native pattern 2: Public opinion street interview', paragraphs: ['Real strangers reacting to a category, brand, or product. Maximum trust, native energy.']},
      { h2: 'TikTok-native pattern 3: Taste test reaction', paragraphs: ['Highest CTR in food and beverage. Unfakeable reaction beats every studio shot.']},
      { h2: 'TikTok-native pattern 4: Problem/solution monologue', paragraphs: ['Camera close, voice-led, problem stated, product introduced. Performs on cold paid TikTok.']},
      { h2: 'TikTok-native pattern 5: Comedy hook', paragraphs: ['Sparingly used. When it works, watch time is unmatched.']},
      { h2: 'Avoid these mistakes', paragraphs: [
        'Don’t recycle Meta ads. Don’t use studio music. Don’t use a logo intro. Don’t use a logo outro. Don’t over-edit.',
      ]},
    ],
    [
      { q: 'Can we run our Meta ads on TikTok?', a: 'Sometimes. Most need re-cuts to feel native.' },
      { q: 'How many TikTok ads should we ship per month?', a: '20+ minimum for active accounts.' },
    ],
    SERVICE_LINK_UGC,
    [
      { label: 'Meta Ad Creative Examples', href: '/resources/ugc-video-ads/meta-ad-creative-examples/' },
      { label: 'Best Video Ad Hooks', href: '/resources/ugc-video-ads/best-video-ad-hooks/' },
    ]),

  buildArticle('ugc-video-ads', 'meta-ad-creative-examples',
    'Meta Ad Creative Examples for Brands',
    'Meta Ad Creative Examples for Brands',
    'Meta ad creative examples for Facebook and Instagram — formats, hooks, and ad-account-ready creative that performs.',
    'Show Meta-specific creative patterns and ad-account considerations.',
    [
      { h2: 'Meta ad creative has its own physics', paragraphs: [
        'Meta rewards consistency and volume. The account learns. Creative needs to ship faster than fatigue happens.',
      ]},
      { h2: 'Meta-native pattern 1: UGC reaction', paragraphs: ['Real-person UGC, hook variants, captioned. The reliable Meta workhorse.']},
      { h2: 'Meta-native pattern 2: Multi-customer testimonial montage', paragraphs: ['Stacked customer reactions in a single ad. Strong on retargeting.']},
      { h2: 'Meta-native pattern 3: Founder talking head', paragraphs: ['Founder on camera, in the wild, problem-solution structure.']},
      { h2: 'Meta-native pattern 4: Public opinion street interview', paragraphs: ['Real strangers reacting to your category. Trust signal at first watch.']},
      { h2: 'Meta-native pattern 5: Comparison ads', paragraphs: ['Side-by-side or before/after. Strong on category-disruptor positioning.']},
      { h2: 'Build a hook variant pipeline', paragraphs: [
        'Most Meta accounts that scale ship 20+ fresh creatives a month with 3–8 hook variants each. The pipeline matters more than any single ad.',
      ]},
    ],
    [
      { q: 'How fresh does Meta creative need to be?', a: 'Plan for ~14 days of active life on cold creative before fatigue measurably kicks in.' },
      { q: 'Do we need separate ads for Reels vs feed?', a: 'Reels-specific cuts perform best on Reels. The feed accepts more variety.' },
    ],
    SERVICE_LINK_UGC,
    [
      { label: 'TikTok Ad Creative Examples', href: '/resources/ugc-video-ads/tiktok-ad-creative-examples/' },
      { label: 'How Many Video Ads to Test', href: '/resources/ugc-video-ads/how-many-video-ads-should-a-brand-test/' },
    ]),

  buildArticle('ugc-video-ads', 'how-many-video-ads-should-a-brand-test',
    'How Many Video Ads Should a Brand Test?',
    'How Many Video Ads Should a Brand Test?',
    'How many video ad variants brands should test per campaign, per platform, and per creative cycle. With benchmarks.',
    'Set realistic expectations on volume and ship cadence.',
    [
      { h2: 'The short answer: more than you think, less than the gurus claim', paragraphs: [
        'Most brands under-ship creative. Some performance shops over-ship and confuse activity with results.',
      ]},
      { h2: 'Per campaign launch', paragraphs: ['8–12 unique ads at launch is a reasonable baseline. Each with 2–3 hook variants.']},
      { h2: 'Per month for an active paid account', paragraphs: ['20+ fresh creatives a month. Below that the account stalls; well above it you might be over-spending if your testing infrastructure can’t keep up.']},
      { h2: 'Per platform', paragraphs: ['Plan TikTok-native and Meta-native versions separately. Treat them as different creative pipelines, not the same set of files.']},
      { h2: 'Per shoot day', paragraphs: ['A well-engineered shoot can produce 10–20 unique ads with 30+ hook variants. Shoot fewer days, ship more variants.']},
      { h2: 'Volume is downstream of structure', paragraphs: [
        'Hook variant pipelines move faster than re-shooting. Pre-plan hook variants in scripting. Don’t wait until edit to find them.',
      ]},
    ],
    [
      { q: 'How long should each ad run?', a: 'Plan ~14 days on cold paid for most performance accounts.' },
      { q: 'How many of those will scale?', a: 'Two or three from a healthy 12-ad batch is normal. The rest provide signal.' },
    ],
    SERVICE_LINK_UGC,
    [
      { label: 'Best Video Ad Hooks', href: '/resources/ugc-video-ads/best-video-ad-hooks/' },
      { label: 'Meta Ad Creative Examples', href: '/resources/ugc-video-ads/meta-ad-creative-examples/' },
    ]),

  // ─────────── Branded Video Production ───────────
  buildArticle('branded-video-production', 'what-is-branded-video-production',
    'What Is Branded Video Production? (Modern Definition)',
    'What Is Branded Video Production?',
    'Branded video production in 2026 is content-first, not ad-first. Here’s how it differs from commercials and what brands actually need.',
    'Define branded video and contrast it with commercials.',
    [
      { h2: 'Branded video, defined', paragraphs: [
        'Branded video is video created for a brand’s audience that the brand owns. Unlike a commercial, it’s designed to earn watch time, not interrupt it.',
      ]},
      { h2: 'How it differs from a commercial', paragraphs: [
        'Commercials sell. Branded video earns. The format choices are different. The KPIs are different. The shoot decisions are different.',
      ]},
      { h2: 'Where branded video lives', paragraphs: [], list: ['TikTok and Reels (always-on social)', 'YouTube and YouTube Shorts', 'Branded podcast clips', 'Brand YouTube channels', 'Email and SMS embeds', 'Owned web properties']},
      { h2: 'What good branded video looks like in 2026', paragraphs: [
        'Native to its platform. Real people. Story-led. Brand integration that doesn’t kill the watch time.',
      ]},
    ],
    [
      { q: 'Can branded video drive sales?', a: 'Yes — when designed for it. Native branded video can outperform commercial ads on cold traffic.' },
      { q: 'How is branded video different from UGC?', a: 'UGC is creator-led. Branded video is brand-led. They can use similar formats — different ownership.' },
    ],
    SERVICE_LINK_BRAND,
    [
      { label: 'Branded Content vs Commercials', href: '/resources/branded-video-production/branded-content-vs-commercials/' },
      { label: 'Branded Content Video Examples', href: '/resources/branded-video-production/branded-content-video-examples/' },
    ]),

  buildArticle('branded-video-production', 'branded-content-video-examples',
    'Branded Content Video Examples That Don’t Feel Like Ads',
    'Branded Content Video Examples That Don’t Feel Like Ads',
    'Real branded content video examples that feel like content first and advertising second — with the formats and patterns that work.',
    'Show modern branded content patterns.',
    [
      { h2: 'The good ones look like content', paragraphs: [
        'The branded videos that earn watch time look like the rest of the feed — not like the ads next to them.',
      ]},
      { h2: 'Pattern 1: Street-interview branded series', paragraphs: ['Recurring host, real strangers, brand prompts. Always-on social presence.']},
      { h2: 'Pattern 2: Founder-led mini-doc', paragraphs: ['Founder talking about a topic adjacent to the product. Trust by association.']},
      { h2: 'Pattern 3: Customer reaction reel', paragraphs: ['Multi-customer reactions edited as branded content, not testimonial ads.']},
      { h2: 'Pattern 4: Comedy-led brand series', paragraphs: ['Recurring comedic format with the brand woven in. Highest watch time when it works.']},
      { h2: 'Pattern 5: Public opinion campaigns', paragraphs: ['Real strangers reacting to a question or category. Cross-platform-friendly.']},
    ],
    [
      { q: 'Should branded content always be vertical?', a: 'For social, yes. For YouTube long-form, sometimes horizontal. Plan format to platform.' },
      { q: 'How long should branded content be?', a: '15–60s for social, 60–90s for landing pages, 2–3min for brand films.' },
    ],
    SERVICE_LINK_BRAND,
    [
      { label: 'What Is Branded Video Production?', href: '/resources/branded-video-production/what-is-branded-video-production/' },
      { label: 'Branded Content vs Commercials', href: '/resources/branded-video-production/branded-content-vs-commercials/' },
    ]),

  buildArticle('branded-video-production', 'branded-content-vs-commercials',
    'Branded Content vs Commercials | Which to Make',
    'Branded Content vs Commercials',
    'Polished commercials still have a place. Branded content wins social. Here’s when each format performs and why.',
    'Help brands decide between content-led and commercial-led production.',
    [
      { h2: 'They’re different jobs', paragraphs: [
        'A commercial sells in 30 seconds. Branded content earns watch time over a longer arc. Both are useful. Mistaking one for the other costs money.',
      ]},
      { h2: 'When commercials still win', paragraphs: [], list: ['TV and CTV placements', 'Out-of-home', 'High-frequency repetition channels', 'Brand-trust moments where polish is the message']},
      { h2: 'When branded content wins', paragraphs: [], list: ['TikTok and Reels', 'Always-on organic social', 'Brand awareness on cold traffic', 'Mid-funnel education', 'Earned media plays']},
      { h2: 'Why most modern brands need both', paragraphs: [
        'Branded content carries the day-to-day social presence. Commercials carry the moments where polish is the point.',
      ]},
    ],
    [
      { q: 'Can a commercial work as branded content?', a: 'Rarely. Re-cuts often help, but the structure of a commercial is built differently.' },
      { q: 'Can branded content work on TV?', a: 'Sometimes — when re-edited for length and pacing.' },
    ],
    SERVICE_LINK_BRAND,
    [
      { label: 'What Is Branded Video Production?', href: '/resources/branded-video-production/what-is-branded-video-production/' },
      { label: 'Brand Story Video Examples', href: '/resources/branded-video-production/brand-story-video-examples/' },
    ]),

  buildArticle('branded-video-production', 'brand-video-ideas',
    '30 Brand Video Ideas for Social-First Campaigns',
    '30 Brand Video Ideas for Social-First Campaigns',
    '30 brand video ideas for TikTok, Reels, Shorts, and Meta — by goal, format, and brand category.',
    'Provide a usable idea bank.',
    [
      { h2: '30 ideas, organized by intent', paragraphs: [
        'Use these as starting points. Adapt to your category.',
      ]},
      { h2: 'Awareness ideas (1–10)', paragraphs: [], list: ['Public opinion street interview', 'Founder reacts to category', 'Real-customer reaction reel', 'Comparison taste test', 'Pattern-interrupt comedy hook', 'Behind-the-scenes brand day', 'On-the-street brand stunt', 'Brand-history short film', 'Founder POV mini-doc', 'Customer interview montage']},
      { h2: 'Conversion ideas (11–20)', paragraphs: [], list: ['Problem/solution UGC', 'Real-person testimonial street interview', 'Multi-customer testimonial montage', 'Before/after reaction', 'Demo + reaction combo', 'Hook-engineered ad set', 'Founder ask-me-anything', 'Use case in the wild', 'Compare to category leader', 'Limited-time launch reaction']},
      { h2: 'Mid-funnel ideas (21–30)', paragraphs: [], list: ['Branded podcast clip', 'How-it’s-made micro-doc', 'Customer day-in-the-life', 'Real customer Q&A', 'Behind-the-product factory tour', 'Founder lessons-learned', 'Category-myth-busting', 'Real customer ratings reaction', 'Brand-vs-brand reaction', 'Brand value statement reaction']},
    ],
    [
      { q: 'How many of these should we run at once?', a: 'Pick 3–5 lanes. Run each repeatedly. Volume in lanes beats variety.' },
      { q: 'Do these all work on TikTok?', a: 'Most. Adjust pacing for platform.' },
    ],
    SERVICE_LINK_BRAND,
    [
      { label: 'Branded Content Video Examples', href: '/resources/branded-video-production/branded-content-video-examples/' },
      { label: 'Brand Story Video Examples', href: '/resources/branded-video-production/brand-story-video-examples/' },
    ]),

  buildArticle('branded-video-production', 'brand-story-video-examples',
    'Brand Story Video Examples That Sell',
    'Brand Story Video Examples That Sell',
    'Brand story videos that feel native and convert. Examples by category, with the formats that work in 2026 social feeds.',
    'Show brand-story video patterns.',
    [
      { h2: 'A brand story doesn’t have to be a brand film', paragraphs: [
        'Modern brand story videos can be 30 seconds. They can be a street interview. They can be a founder POV. The format matters less than whether the story actually lands.',
      ]},
      { h2: 'Brand story patterns that work in 2026', paragraphs: [], list: ['Founder POV mini-doc', 'Real-customer story video', 'Public opinion campaign about the category', 'On-the-street brand origin reel', 'Multi-customer story montage', 'Behind-the-scenes founder day']},
      { h2: 'How to plan a brand story video', paragraphs: [
        'Pick the audience first. Pick the platform second. Pick the format third. Write the story last. Most brand teams do this in reverse.',
      ]},
    ],
    [
      { q: 'How long should a brand story video be?', a: '60–120 seconds for a hero edit. 15–30 seconds for the social cut.' },
      { q: 'Can the founder be the host?', a: 'Yes — and often should be.' },
    ],
    SERVICE_LINK_BRAND,
    [
      { label: 'Brand Video Ideas', href: '/resources/branded-video-production/brand-video-ideas/' },
      { label: 'Branded Content Video Examples', href: '/resources/branded-video-production/branded-content-video-examples/' },
    ]),

  // ─────────── Testimonial Video Production ───────────
  buildArticle('testimonial-video-production', 'testimonial-video-examples',
    'Testimonial Video Examples That Feel Real',
    'Testimonial Video Examples That Feel Real',
    'Testimonial video examples in a street interview style — short-form, social-first proof that actually feels believable.',
    'Show modern testimonial video patterns.',
    [
      { h2: 'Believability is the only KPI', paragraphs: [
        'A testimonial’s job is to be believed. Production polish often gets in the way of that.',
      ]},
      { h2: 'Pattern 1: Street-interview testimonial', paragraphs: ['Real customers stopped on the street, reacting to your product. Maximum trust.']},
      { h2: 'Pattern 2: Multi-customer montage', paragraphs: ['Stacked short reactions edited as one ad. Strong on retargeting and landing pages.']},
      { h2: 'Pattern 3: Customer day-in-the-life', paragraphs: ['Real customer using the product in their own environment. Long-form trust.']},
      { h2: 'Pattern 4: In-store reaction shoot', paragraphs: ['Customers reacting at the point of purchase. Native energy.']},
      { h2: 'Pattern 5: Actor-led testimonial (when needed)', paragraphs: ['When real customer schedules can’t work, scripted actors deliver a real testimonial structure.']},
    ],
    [
      { q: 'Are these all real customers?', a: 'Most are. Some campaigns mix actor-led for scale.' },
      { q: 'How long are short-form testimonial videos?', a: '15–30 seconds for paid social. Longer for landing pages.' },
    ],
    SERVICE_LINK_TEST,
    [
      { label: 'Customer Testimonial Video Questions', href: '/resources/testimonial-video-production/customer-testimonial-video-questions/' },
      { label: 'How to Make Testimonial Videos Less Scripted', href: '/resources/testimonial-video-production/how-to-make-testimonial-videos-less-scripted/' },
    ]),

  buildArticle('testimonial-video-production', 'customer-testimonial-video-questions',
    'Customer Testimonial Video Questions That Get Real Answers',
    'Customer Testimonial Video Questions That Get Real Answers',
    'The testimonial video questions that get past corporate-speak and pull real, on-camera reactions from customers.',
    'Provide a question library for testimonial shoots.',
    [
      { h2: 'Bad questions get rehearsed answers', paragraphs: [
        'If you ask “how has [brand] helped your business,” you get a press-release answer. Better questions pull real beats.',
      ]},
      { h2: 'Questions that produce real answers', paragraphs: [], list: ['What were you using before this?', 'What surprised you?', 'When did you first realize it worked?', 'Who would you recommend this to?', 'What was the moment you decided to keep using it?']},
      { h2: 'Questions to avoid', paragraphs: [], list: ['Why do you love [brand]?', 'How would you describe [brand] in three words?', 'What makes [brand] different?']},
      { h2: 'Order matters', paragraphs: [
        'Open with the “before” story. Land the “moment.” End with the recommendation. Edits write themselves.',
      ]},
    ],
    [
      { q: 'Should we share questions ahead of time?', a: 'Share the topics, not the exact questions. Better answers come from natural reactions.' },
      { q: 'How long is a typical testimonial interview?', a: '20–40 minutes per person. Two minutes are usable. The format pulls them out.' },
    ],
    SERVICE_LINK_TEST,
    [
      { label: 'Testimonial Video Examples', href: '/resources/testimonial-video-production/testimonial-video-examples/' },
      { label: 'How to Make Testimonial Videos Less Scripted', href: '/resources/testimonial-video-production/how-to-make-testimonial-videos-less-scripted/' },
    ]),

  buildArticle('testimonial-video-production', 'how-to-make-testimonial-videos-less-scripted',
    'How to Make Testimonial Videos Less Scripted',
    'How to Make Testimonial Videos Less Scripted',
    'How to shoot testimonial videos that don’t feel like a board meeting — scripting, prompts, and on-the-ground techniques.',
    'Practical guide to producing authentic testimonial videos.',
    [
      { h2: 'Stop scripting. Start prompting.', paragraphs: [
        'A script tells someone what to say. A prompt asks them what they think. The second pulls real video.',
      ]},
      { h2: 'Move the shoot environment', paragraphs: [
        'Out of the studio. Into a real environment — the customer’s home, store, office, or the street. Lighting moves. Energy stays.',
      ]},
      { h2: 'Ask better questions', paragraphs: [
        'See the testimonial questions guide. The right questions break corporate-speak before the camera rolls.',
      ]},
      { h2: 'Edit for the moment, not the line', paragraphs: [
        'Most usable testimonial beats are an unintentional aside, not a planned line. Edit for those.',
      ]},
      { h2: 'Use multiple voices', paragraphs: [
        'A montage of three real customers carries more trust than one polished interview.',
      ]},
    ],
    [
      { q: 'What if the customer is shy?', a: 'Shoot longer. Talk longer before rolling. Cut the first 10 minutes.' },
      { q: 'Will the customer want to approve the edit?', a: 'Often, yes. Build that into the timeline.' },
    ],
    SERVICE_LINK_TEST,
    [
      { label: 'Customer Testimonial Video Questions', href: '/resources/testimonial-video-production/customer-testimonial-video-questions/' },
      { label: 'Customer Testimonial vs Street Interview', href: '/resources/testimonial-video-production/customer-testimonial-vs-street-interview/' },
    ]),

  buildArticle('testimonial-video-production', 'customer-testimonial-vs-street-interview',
    'Customer Testimonial vs Street Interview | Which Wins',
    'Customer Testimonial vs Street Interview',
    'Customer testimonials build proof. Street interviews build attention. Here’s when to use each format and how to combine them.',
    'Compare the two formats.',
    [
      { h2: 'They’re different jobs', paragraphs: [
        'A customer testimonial is a known buyer telling a story. A street interview is a real stranger reacting in real time.',
      ]},
      { h2: 'When customer testimonials win', paragraphs: [], list: ['Mid-funnel and bottom-of-funnel', 'Landing page proof', 'Sales decks', 'Retargeting on warm audiences']},
      { h2: 'When street interviews win', paragraphs: [], list: ['Cold paid traffic', 'Brand awareness', 'Repositioning campaigns', 'Categories where “real stranger reacted” is the trust signal']},
      { h2: 'When both win together', paragraphs: [
        'Most strong campaigns mix both. Street interview earns the click. Testimonial converts the click.',
      ]},
    ],
    [
      { q: 'Can a street interview work as a testimonial?', a: 'Yes — when filmed with a known customer in a public setting.' },
      { q: 'Can we test both?', a: 'Yes, in the same audience. The data clarifies in days.' },
    ],
    SERVICE_LINK_TEST,
    [
      { label: 'Testimonial Video Examples', href: '/resources/testimonial-video-production/testimonial-video-examples/' },
      { label: 'Video Testimonial Cost', href: '/resources/testimonial-video-production/video-testimonial-cost/' },
    ]),

  buildArticle('testimonial-video-production', 'video-testimonial-cost',
    'Video Testimonial Cost in 2026 | Real Pricing',
    'How Much Do Video Testimonials Cost?',
    'What video testimonials cost in 2026 — by format, length, deliverable count, and location. With package examples.',
    'Set expectations on testimonial pricing without exact dollars.',
    [
      { h2: 'Cost depends on five things', paragraphs: [
        'Casting model, deliverable count, length per video, location count, and turnaround.',
      ]},
      { h2: 'Real customers vs actors', paragraphs: [
        'Real customers cost more in coordination — scheduling, travel, releases. Actors cost more in casting fees but ship faster.',
      ]},
      { h2: 'Length and format', paragraphs: [
        'Short-form testimonial cuts (15–30s) are the cheapest per asset. Long-form testimonial stories cost more but produce multiple short cuts as byproducts.',
      ]},
      { h2: 'How to size your first project', paragraphs: [
        'Start with a multi-customer street-interview testimonial shoot. One day. Five customers. Ten short-form cuts. That’s a strong baseline.',
      ]},
    ],
    [
      { q: 'Why don’t you list a price here?', a: 'Because the right answer depends on your goal, deliverables, and shoot logistics. Book a call and we’ll send a clear scope.' },
    ],
    SERVICE_LINK_TEST,
    [
      { label: 'Testimonial Video Examples', href: '/resources/testimonial-video-production/testimonial-video-examples/' },
      { label: 'How to Make Testimonial Videos Less Scripted', href: '/resources/testimonial-video-production/how-to-make-testimonial-videos-less-scripted/' },
    ]),

  // ─────────── Social Media Video Production ───────────
  buildArticle('social-media-video-production', 'social-media-video-production-guide',
    'The Social Media Video Production Guide for Brands',
    'The Social Media Video Production Guide for Brands',
    'A complete social media video production guide for brands — formats, process, platforms, and how to ship ad-ready creative.',
    'Definitive guide to social media video production.',
    [
      { h2: 'Social media video has its own production model', paragraphs: [
        'It looks like film production from far away. Up close, the priorities are different — volume, format-fit, hook engineering, platform-native delivery.',
      ]},
      { h2: 'Step 1: Pick a creative system, not a one-off', paragraphs: [
        'Don’t produce ads. Produce a system that ships ads on a regular cadence.',
      ]},
      { h2: 'Step 2: Pick formats by platform', paragraphs: [
        'TikTok and Reels reward different content. So do YouTube Shorts and Meta. Most brands need at least two formats running in parallel.',
      ]},
      { h2: 'Step 3: Pre-plan hook variants', paragraphs: [
        'Hook engineering belongs in scripting, not in edit. The shoot day produces hook variants intentionally.',
      ]},
      { h2: 'Step 4: Build a delivery taxonomy', paragraphs: [
        'Filenames, folders, ad-account-ready exports. The brand’s ad team should never wonder which file to upload.',
      ]},
      { h2: 'Step 5: Measure what matters', paragraphs: [
        'Watch time, hold rate, hook efficiency, in-account fatigue. Don’t use brand metrics to grade performance creative.',
      ]},
    ],
    [
      { q: 'How many shoots a quarter?', a: 'For active accounts, monthly is reasonable. Quarterly is too slow for cold paid pipelines.' },
      { q: 'Can we run social production in-house?', a: 'You can. Most brands find production partners faster on volume creative.' },
    ],
    SERVICE_LINK_SOCIAL,
    [
      { label: 'Short-Form Video Production Process', href: '/resources/social-media-video-production/short-form-video-production-process/' },
      { label: 'How to Produce Video Ads at Scale', href: '/resources/social-media-video-production/how-to-produce-video-ads-at-scale/' },
    ]),

  buildArticle('social-media-video-production', 'short-form-video-production-process',
    'The Short-Form Video Production Process Explained',
    'The Short-Form Video Production Process',
    'How short-form video production works end-to-end — strategy, scripting, casting, shooting, editing, and platform delivery.',
    'Walk through the process step by step.',
    [
      { h2: 'A 5-stage process you can repeat', paragraphs: [
        'A repeatable process is the difference between shipping 2 ads a quarter and 20.',
      ]},
      { h2: 'Strategy', paragraphs: ['Goals, audience, platform mix, hook lanes. Locked before scripting.']},
      { h2: 'Script and questions', paragraphs: ['Hooks, prompts, hook variants. Pre-planned, not improvised in edit.']},
      { h2: 'Casting and shoot', paragraphs: ['Real people or actors. Vertical-first. Multiple looks, multiple lanes.']},
      { h2: 'Edit', paragraphs: ['Hook variations and both captioned and uncaptioned versions of each video. Ad-account-ready filenames.']},
      { h2: 'Delivery', paragraphs: ['Edited videos, raw footage, captions, exports. Done in a folder taxonomy that maps to the ad account.']},
    ],
    [
      { q: 'How long is the full process?', a: 'As little as 5–10 days for most projects. Up to 21 for bigger or more complex campaigns. Rush available.' },
      { q: 'How many people do we need on our side?', a: 'One brand stakeholder is typically enough.' },
    ],
    SERVICE_LINK_SOCIAL,
    [
      { label: 'Social Media Video Production Guide', href: '/resources/social-media-video-production/social-media-video-production-guide/' },
      { label: 'How to Produce Video Ads at Scale', href: '/resources/social-media-video-production/how-to-produce-video-ads-at-scale/' },
    ]),

  buildArticle('social-media-video-production', 'tiktok-vs-instagram-reels-video-strategy',
    'TikTok vs Instagram Reels | Video Strategy Compared',
    'TikTok vs Instagram Reels: Video Strategy Compared',
    'TikTok and Instagram Reels reward different content. Here’s how to think about format, length, and creative for each.',
    'Compare TikTok and Reels for brand strategy.',
    [
      { h2: 'They look the same. They’re not.', paragraphs: [
        'Same vertical aspect ratio. Different audience behavior. Different algorithm. Different ad ecosystem.',
      ]},
      { h2: 'TikTok strengths', paragraphs: [], list: ['Fast feed velocity', 'Strong reaction-format performance', 'Native creator energy', 'High organic discoverability']},
      { h2: 'Reels strengths', paragraphs: [], list: ['IG ad ecosystem already in place', 'Stronger retention on existing followers', 'Reels-to-feed cross-pollination', 'Better for higher-AOV brands']},
      { h2: 'How to plan for both', paragraphs: [
        'Treat them as different pipelines. Same shoot, different cuts. TikTok cuts open faster. Reels cuts hold the brand line longer.',
      ]},
    ],
    [
      { q: 'Can we use the same video on both?', a: 'You can — but the cut should be different.' },
      { q: 'Which platform performs better?', a: 'Depends on category. Test both, don’t assume.' },
    ],
    SERVICE_LINK_SOCIAL,
    [
      { label: 'TikTok Ad Creative Examples', href: '/resources/ugc-video-ads/tiktok-ad-creative-examples/' },
      { label: 'Meta Ad Creative Examples', href: '/resources/ugc-video-ads/meta-ad-creative-examples/' },
    ]),

  buildArticle('social-media-video-production', 'social-media-video-ideas-for-brands',
    '30 Social Media Video Ideas for Brands',
    '30 Social Media Video Ideas for Brands',
    '30 social media video ideas for brands — by goal, platform, and format, with examples and starting prompts.',
    'Provide a usable idea bank for brand teams.',
    [
      { h2: '30 ideas across awareness, consideration, and conversion', paragraphs: ['Use these as starting prompts. Adapt to your category.']},
      { h2: 'Awareness (1–10)', paragraphs: [], list: ['Public opinion street interview', 'Founder POV mini-doc', 'Real customer reaction reel', 'Pattern-interrupt comedy hook', 'Behind-the-scenes brand day', 'Brand stunt video', 'On-the-street brand activation reel', 'Brand-history short film', 'Comparison street interview', 'Multi-customer reaction montage']},
      { h2: 'Consideration (11–20)', paragraphs: [], list: ['Real customer day-in-the-life', 'Behind-the-product factory tour', 'Founder ask-me-anything', 'Use case in the wild', 'How-it’s-made micro-doc', 'Branded podcast clip', 'Brand-vs-brand reaction', 'Category-myth-busting', 'Real customer Q&A', 'In-store reaction shoot']},
      { h2: 'Conversion (21–30)', paragraphs: [], list: ['Problem/solution UGC', 'Multi-customer testimonial montage', 'Hook-engineered ad set', 'Limited-time launch reaction', 'Demo + reaction combo', 'Before/after reaction', 'Compare to category leader', 'Real-customer testimonial ad', 'Founder offer ad', 'Public opinion CTA campaign']},
    ],
    [
      { q: 'How many ideas should we run at once?', a: 'Pick 3–5 lanes. Volume in lanes beats variety across all 30.' },
      { q: 'Which work for cold paid?', a: 'Conversion ideas mostly. Some awareness ideas convert on cold for category-disruptor brands.' },
    ],
    SERVICE_LINK_SOCIAL,
    [
      { label: 'Brand Video Ideas', href: '/resources/branded-video-production/brand-video-ideas/' },
      { label: 'Social Media Video Production Guide', href: '/resources/social-media-video-production/social-media-video-production-guide/' },
    ]),

  buildArticle('social-media-video-production', 'how-to-produce-video-ads-at-scale',
    'How to Produce Video Ads at Scale (Without Losing Quality)',
    'How to Produce Video Ads at Scale',
    'How brands produce dozens of native video ads per month — process, casting, shoot logistics, and editing systems.',
    'Help brands scale creative production without losing quality.',
    [
      { h2: 'Volume comes from structure, not effort', paragraphs: [
        'Brands shipping 20+ ads a month aren’t working harder. They’re working with a creative system.',
      ]},
      { h2: 'System component 1: format lanes', paragraphs: ['Pick 3–5 lanes. Run them repeatedly. Don’t reinvent every shoot.']},
      { h2: 'System component 2: hook engineering pre-shoot', paragraphs: ['Plan hook variants in scripting. Capture them on shoot day.']},
      { h2: 'System component 3: shoot-day yield', paragraphs: ['One shoot day should produce 10–20 unique ads with 30+ hook variants.']},
      { h2: 'System component 4: edit taxonomy', paragraphs: ['Filenames, folders, ad-account-ready filenames. The brand’s ad team should never wonder which file to upload.']},
      { h2: 'System component 5: a feedback loop with the buyer', paragraphs: ['What worked, what didn’t, what to ship next. Weekly cadence.']},
    ],
    [
      { q: 'Is volume always the answer?', a: 'No — but a creative pipeline that can ship at volume is. The output rate is a choice; the capability isn’t optional.' },
      { q: 'How fast can a new partner ramp?', a: '14–30 days for a stable pipeline. Less if you bring an existing brand voice doc.' },
    ],
    SERVICE_LINK_SOCIAL,
    [
      { label: 'Short-Form Video Production Process', href: '/resources/social-media-video-production/short-form-video-production-process/' },
      { label: 'How Many Video Ads to Test', href: '/resources/ugc-video-ads/how-many-video-ads-should-a-brand-test/' },
    ]),
];

export const ARTICLES_BY_TOPIC = (topic: string) => RESOURCE_ARTICLES.filter((a) => a.topic === topic);
export const ARTICLE_BY_PATH = Object.fromEntries(RESOURCE_ARTICLES.map((a) => [`${a.topic}/${a.slug}`, a]));
