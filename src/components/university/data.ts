/**
 * Mock content for the Seller University prototype.
 * Mirrors the block schema from wireframes S3 — this shape becomes the
 * Supabase JSONB contract at Phase 0.
 */

export interface Topic {
  slug: string;
  title: string;
  titleUr: string;
  icon: 'rocket' | 'tag' | 'package' | 'wallet' | 'wrench' | 'sprout';
  tint: string;
  count: number;
}

export const topics: Topic[] = [
  { slug: 'start-selling', title: 'Start Selling', titleUr: 'بیچنا شروع کریں', icon: 'rocket', tint: 'var(--yellow-soft)', count: 12 },
  { slug: 'list-products', title: 'List Products', titleUr: 'پروڈکٹ لسٹ کریں', icon: 'tag', tint: 'var(--blue-soft)', count: 18 },
  { slug: 'ship-orders', title: 'Ship Orders', titleUr: 'آرڈر بھیجیں', icon: 'package', tint: 'var(--violet-soft)', count: 15 },
  { slug: 'get-paid', title: 'Get Paid', titleUr: 'پیسے وصول کریں', icon: 'wallet', tint: 'var(--green-soft)', count: 14 },
  { slug: 'fix-problem', title: 'Fix a Problem', titleUr: 'مسئلہ حل کریں', icon: 'wrench', tint: 'var(--red-soft)', count: 16 },
  { slug: 'grow', title: 'Grow', titleUr: 'ترقی کریں', icon: 'sprout', tint: 'var(--cream2)', count: 8 },
];

export interface QuickAnswer {
  rank: number;
  title: string;
  articleSlug: string;
}

export const quickAnswers: QuickAnswer[] = [
  { rank: 1, title: 'When will I get paid?', articleSlug: 'when-will-i-get-paid' },
  { rank: 2, title: 'Change your bank account', articleSlug: 'change-your-bank-account' },
  { rank: 3, title: 'Why was my order cancelled?', articleSlug: 'when-will-i-get-paid' },
  { rank: 4, title: 'How grading works (A / B / C)', articleSlug: 'how-grading-works' },
];

export interface Lesson {
  id: string;
  title: string;
  duration: string;
}

export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  badge: { text: string; bg: string; color: string };
  tint: string;
  lessons: Lesson[];
}

export const courses: Course[] = [
  {
    slug: 'new-seller-journey',
    title: 'New Seller Journey',
    subtitle: '7 lessons · 24 min · videos in اردو',
    badge: { text: '3/7 done', bg: 'var(--green-soft)', color: 'var(--green)' },
    tint: 'var(--yellow-soft)',
    lessons: [
      { id: 'l1', title: 'Welcome to Fleek', duration: '2:10' },
      { id: 'l2', title: 'Your first listing, step by step', duration: '4:05' },
      { id: 'l3', title: 'Price your lots to win', duration: '3:40' },
      { id: 'l4', title: 'Photos that sell', duration: '3:15' },
      { id: 'l5', title: 'Ship your first order', duration: '4:30' },
      { id: 'l6', title: 'Get paid: how payouts work', duration: '3:00' },
      { id: 'l7', title: 'Quiz — earn your badge', duration: '5 Qs' },
    ],
  },
  {
    slug: 'grow-your-gmv',
    title: 'Grow your GMV',
    subtitle: '5 lessons · 18 min · ratings, sea shipping, repeat buyers',
    badge: { text: 'New', bg: 'var(--blue-soft)', color: 'var(--blue)' },
    tint: 'var(--violet-soft)',
    lessons: [
      { id: 'g1', title: 'What your rating really measures', duration: '3:20' },
      { id: 'g2', title: 'Win bulk orders with Sea Shipping', duration: '4:10' },
      { id: 'g3', title: 'Turn buyers into repeat buyers', duration: '3:45' },
      { id: 'g4', title: 'Price for the season', duration: '3:30' },
      { id: 'g5', title: 'Quiz — earn your badge', duration: '5 Qs' },
    ],
  },
];

/** Typed article blocks — the S3 contract. */
export type ArticleBlock =
  | { type: 'text'; html: string }
  | { type: 'heading'; level: 2 | 3; html: string }
  | { type: 'list'; style: 'bullet' | 'number'; items: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'code'; code: string; lang?: string }
  | { type: 'quote'; html: string }
  | { type: 'divider' }
  | { type: 'in_short'; text: string }
  | { type: 'section'; title: string }
  | { type: 'chips'; items: string[] }
  | { type: 'step'; n: number; html: string; shot?: string }
  | { type: 'image'; assetId: string; alt: string; src?: string }
  | { type: 'video'; caption: string; length: string; assetId?: string; embedUrl?: string }
  | { type: 'pdf'; assetId?: string; src?: string; caption?: string }
  | { type: 'callout'; tone: 'warn'; title: string; text: string }
  | { type: 'faq'; items: { q: string; a: string }[] }
  | { type: 'related'; items: { title: string; slug: string }[] };

export interface Article {
  slug: string;
  topic: string;
  title: string;
  readMins: number;
  updated: string;
  blocks: ArticleBlock[];
}

export const articles: Article[] = [
  {
    slug: 'change-your-bank-account',
    topic: 'Get Paid',
    title: 'Change your bank account',
    readMins: 2,
    updated: 'Updated 3 days ago',
    blocks: [
      {
        type: 'in_short',
        text: 'Add the new account in Account → Payments, upload one proof document, and we verify it in about 2 working days.',
      },
      { type: 'section', title: 'What you need' },
      { type: 'chips', items: ['IBAN or account no.', 'Bank letter or cheque photo'] },
      { type: 'section', title: 'Do this' },
      { type: 'step', n: 1, html: 'Open <b>Account → Payments</b> in this app.', shot: 'screenshot · payments-tab.png' },
      { type: 'step', n: 2, html: 'Tap <b>Change bank account</b> and type the new details. Check the IBAN twice — one wrong digit delays your payout.' },
      { type: 'step', n: 3, html: 'Upload a photo of your bank letter or a cancelled cheque.' },
      { type: 'video', caption: 'Watch: changing your bank account, start to finish', length: '0:24' },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Payouts pause during review',
        text: "Money already earned is safe — it's paid to the new account once it's approved (~2 working days).",
      },
      { type: 'section', title: 'Common questions' },
      {
        type: 'faq',
        items: [
          { q: "Can I use someone else's account?", a: 'No — the bank account name must match your registered business name. This protects your money.' },
          { q: "What if my bank isn't listed?", a: 'Message us in chat with your bank name — most banks are added within a week.' },
          { q: 'Why was my account rejected?', a: "Usually the name on the bank account doesn't match your registered business name. Fix the name with your bank, or upload a letter showing both names." },
        ],
      },
      {
        type: 'related',
        items: [
          { title: 'When will I get paid?', slug: 'when-will-i-get-paid' },
          { title: 'How grading works (A / B / C)', slug: 'how-grading-works' },
        ],
      },
    ],
  },
  {
    slug: 'when-will-i-get-paid',
    topic: 'Get Paid',
    title: 'When will I get paid?',
    readMins: 1,
    updated: 'Updated 1 week ago',
    blocks: [
      {
        type: 'in_short',
        text: 'Sample content for the prototype: payouts run weekly. An order joins your next payout once it is delivered and clears the check window.',
      },
      { type: 'section', title: 'How the timeline works' },
      { type: 'step', n: 1, html: 'Your order is <b>delivered</b> — you can see this in Orders.' },
      { type: 'step', n: 2, html: 'It waits in the <b>check window</b> while the buyer confirms everything is right.' },
      { type: 'step', n: 3, html: 'It joins your <b>next weekly payout</b> to your bank account.' },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Seeing "on hold"?',
        text: 'A hold means one thing needs fixing — usually bank details or a quality check. The article below shows how to clear each one.',
      },
      { type: 'section', title: 'Common questions' },
      {
        type: 'faq',
        items: [
          { q: 'Where do I see the exact amount?', a: 'Open Income Statement in this app — every order, fee, and deduction is listed there.' },
          { q: 'My payout day passed and nothing arrived', a: 'Bank transfers can take 1–2 working days to land. If it has been longer, chat with us and we will trace it.' },
        ],
      },
      {
        type: 'related',
        items: [
          { title: 'Change your bank account', slug: 'change-your-bank-account' },
          { title: 'How grading works (A / B / C)', slug: 'how-grading-works' },
        ],
      },
    ],
  },
  {
    slug: 'how-grading-works',
    topic: 'List Products',
    title: 'How grading works (A / B / C)',
    readMins: 2,
    updated: 'Updated 2 weeks ago',
    blocks: [
      {
        type: 'in_short',
        text: 'Grades tell buyers what condition to expect. Listing the honest grade is the single biggest driver of good ratings and repeat orders.',
      },
      { type: 'section', title: 'What each grade means' },
      { type: 'text', html: '<b>A</b> — like new. No visible flaws, no repairs needed.' },
      { type: 'text', html: '<b>B</b> — good. Light wear you can see, nothing that stops the item being worn.' },
      { type: 'text', html: '<b>C</b> — worn. Visible flaws; priced for buyers who repair or upcycle.' },
      { type: 'video', caption: 'Watch: grading a bundle in under a minute', length: '0:48' },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Mixed-grade lots (A/B, A/B/C)',
        text: 'The label promises the mix. If a buyer finds mostly C in an A/B lot, that becomes a quality complaint against your rating.',
      },
      { type: 'section', title: 'Common questions' },
      {
        type: 'faq',
        items: [
          { q: 'Who decides the grade?', a: 'You do, when you list — but buyer complaints are checked against the grade you promised, so honest grading protects you.' },
          { q: 'Can I show photos per grade?', a: 'Representative photos per grade are coming — for now, photograph the true mix of the lot.' },
        ],
      },
      {
        type: 'related',
        items: [
          { title: 'When will I get paid?', slug: 'when-will-i-get-paid' },
          { title: 'Change your bank account', slug: 'change-your-bank-account' },
        ],
      },
    ],
  },
];

/** Placeholder rows shown on topic pages for content not yet written (prototype honesty). */
export const comingSoon: Record<string, string[]> = {
  'start-selling': ['Set up your shop profile', 'Get your bank approved fast', 'Your first 7 days on Fleek'],
  'list-products': ['Photos that sell', 'Write titles buyers search for', 'Bundle sizes that move'],
  'ship-orders': ['Book a pickup', 'Pack lots the right way', 'Sea Shipping: when to offer it'],
  'get-paid': ['Read your payout statement', 'Payout on hold: what it means'],
  'fix-problem': ['Buyer opened a dispute', 'Your rating dropped: why', 'Order stuck in transit'],
  grow: ['Win repeat buyers', 'Price for the season', 'Grow with Sea Shipping'],
};

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export interface Update {
  id: string;
  date: string;
  title: string;
  body: string;
  important?: boolean;
}

export const updates: Update[] = [
  { id: 'u1', date: '8 Jul 2026', title: 'Eid holiday pickup schedule', body: 'Pickups pause 27–29 Jul. Payouts are not affected. Orders placed during Eid ship from 30 Jul.', important: true },
  { id: 'u2', date: '1 Jul 2026', title: 'Sea Shipping now on Custom Handpick', body: 'Offer the lower-cost sea option when you create a Custom Handpick listing. Delivery 60–90 days, shown to buyers at checkout.' },
  { id: 'u3', date: '24 Jun 2026', title: 'Payout statements got simpler', body: 'Every deduction now has a plain-language reason. Open Income Statement to see the new layout.' },
];

/** Quiz for the course badge — prototype sample. */
export interface QuizQ {
  q: string;
  options: string[];
  correct: number;
}

export const quizQuestions: QuizQ[] = [
  { q: 'A buyer opens an A/B lot. What should they find?', options: ['Only grade A pieces', 'The honest A/B mix you promised', 'Whatever was left in the warehouse'], correct: 1 },
  { q: 'When does an order join your payout?', options: ['The moment it ships', 'After delivery clears the check window', 'At the end of the month'], correct: 1 },
  { q: 'Your payout is on hold. Best first move?', options: ['Open the hold reason in Get Paid', 'Create a new account', 'Wait a few weeks'], correct: 0 },
];

/** Manager-side mock rows (prototype). */
export const managerRows = [
  { slug: 'when-will-i-get-paid', title: 'When will I get paid?', cat: 'Get Paid', status: 'published', langs: ['EN', 'UR'], updated: 'Jul 6', views: 1284, helpful: 91 },
  { slug: 'change-your-bank-account', title: 'Change your bank account', cat: 'Get Paid', status: 'published', langs: ['EN'], updated: 'Jul 6', views: 893, helpful: 87 },
  { slug: 'eid-pickup-schedule', title: 'Eid pickup schedule 2026', cat: 'Ship Your Orders', status: 'scheduled', langs: ['EN', 'UR'], updated: 'Jul 8', views: 0, helpful: 0 },
  { slug: 'sea-shipping-policy', title: 'Sea Shipping policy & guide', cat: 'Ship Your Orders', status: 'draft', langs: ['EN'], updated: 'Jul 9', views: 0, helpful: 0 },
  { slug: 'how-grading-works', title: 'How grading works (A / B / C)', cat: 'List Products', status: 'published', langs: ['EN', 'UR'], updated: 'Jun 30', views: 712, helpful: 78 },
  { slug: 'old-cod-reconciliation', title: 'Old: COD reconciliation', cat: 'Get Paid', status: 'archived', langs: ['EN'], updated: 'May 12', views: 0, helpful: 0 },
] as const;

export const failedSearches = [
  { q: 'stitching machine loan', n: 41 },
  { q: 'iban change without letter', n: 33 },
  { q: 'ramzan pickup timing', n: 27 },
  { q: 'who pays sea freight', n: 19 },
];

export const helpSuggestions = [
  { title: 'When will I get paid?', meta: 'Payout schedule + how to check status · 1 min', slug: 'change-your-bank-account' },
  { title: 'Payout on hold: what it means', meta: 'The 4 reasons and how to clear each · 2 min', slug: 'change-your-bank-account' },
  { title: 'Read your payout statement', meta: 'Understand every deduction · 3 min', slug: 'change-your-bank-account' },
];
