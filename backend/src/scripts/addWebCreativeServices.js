require('dotenv').config();
const { sequelize, Service } = require('../models');

// One-off content addition: a 4th Marketing pillar — Web & Creative — for
// services that don't fit the Analytics/Experimentation taxonomy at all
// (web dev, design, apps, content). Mirrors restructureNav.js's pattern
// (idempotent upsert by slug, real written content, no stub pages) but kept
// as its own script since it's an addition, not part of that migration.
const MEDIA = 'https://www.corebitmedia.com/media/uploads';

async function upsertService(data) {
  const [rec] = await Service.findOrCreate({ where: { slug: data.slug }, defaults: data });
  await rec.update(data);
  return rec;
}

async function addWebCreativeServices() {
  await sequelize.sync();

  const pillar = await upsertService({
    slug: 'web-creative',
    title: 'Web & Creative',
    navGroup: 'marketing',
    parentId: null,
    shortDescription: 'Websites, apps, design, and content — the creative and technical foundation every marketing campaign needs to actually convert.',
    body: `Marketing Needs Something to Point To
The best campaigns still fail if they land on a slow website, a confusing app, or a page nobody designed with conversion in mind. We build the web presence, product experience, and content your marketing actually depends on:
- Web Development — fast, conversion-ready websites and landing pages
- UI/UX Design — interfaces people can actually use, backed by research
- App Development — mobile and web apps built to scale
- Content Writing — copy that ranks, reads well, and converts

This is the foundation every other Marketing service on this site drives traffic toward — it has to hold up once people arrive.

Ready to build something worth marketing?`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Web & Creative Services',
    metaDescription: 'Web development, UI/UX design, app development, and content writing — the creative and technical foundation for marketing that converts.',
    aiAnswerSummary: "Core Bit Media's Web & Creative practice covers web development, UI/UX design, app development, and content writing — the technical and creative foundation supporting every marketing campaign."
  });

  const children = [
    {
      slug: 'web-development',
      title: 'Web Development',
      shortDescription: 'Fast, responsive, conversion-ready websites and landing pages built on modern frameworks, not page builders that fight you later.',
      body: `Why Web Development Matters
A website that loads slowly or breaks on mobile undoes everything your marketing spend is trying to achieve. We build sites and landing pages meant to convert, not just exist.

What We Offer:
- Custom Website Development — built on modern frameworks for speed, security, and easy content updates
- Landing Page Development — high-converting pages built to match specific campaigns and offers
- E-commerce Development — online stores built for checkout conversion, not just product listings
- CMS Integration — content management setups your team can actually update without a developer
- Performance Optimization — Core Web Vitals, page speed, and mobile responsiveness tuned for both users and search rankings
- Ongoing Maintenance & Support — updates, security patches, and uptime monitoring after launch

Key Benefits:
- Built for Conversion — every page designed around a clear action, not just aesthetics
- Fast By Default — performance budgets baked in from the first line of code
- Scales With You — architecture that doesn't need a rebuild every time you grow`,
      metaTitle: 'Web Development Services',
      metaDescription: 'Custom website, landing page, and e-commerce development built for speed, conversion, and easy content management.',
      focusKeyword: 'web development services',
      aiAnswerSummary: 'Core Bit Media builds custom websites, landing pages, and e-commerce stores optimized for speed, conversion, and Core Web Vitals.',
      faqSchema: [
        { question: 'What platforms does Core Bit Media build websites on?', answer: "We build on modern frameworks (like Next.js and React) as well as CMS platforms like WordPress, chosen based on your team's technical needs and who will maintain the site afterward." },
        { question: 'How long does a website project take?', answer: 'A standard marketing website typically takes 3-6 weeks depending on page count and design complexity; landing pages can launch in 1-2 weeks.' },
        { question: 'Does Core Bit Media handle website maintenance after launch?', answer: 'Yes — we offer ongoing maintenance plans covering updates, security patches, backups, and uptime monitoring.' }
      ]
    },
    {
      slug: 'ui-ux-design',
      title: 'UI/UX Design',
      shortDescription: 'Research-backed interface design that makes your website or app easier to use — and easier to convert on.',
      body: `Why UI/UX Design Matters
Good design isn't decoration — it's the difference between a visitor who converts and one who bounces confused. We design interfaces around how real users actually behave, not assumptions.

What We Offer:
- User Research & Testing — understanding how your actual users navigate and where they get stuck
- Wireframing & Prototyping — clickable prototypes validated before a single line of code is written
- Visual & Interaction Design — interfaces that reflect your brand and guide users toward action
- Conversion-Focused UX — layouts, forms, and flows designed around your actual conversion goals
- Design Systems — reusable component libraries that keep your product consistent as it grows
- Accessibility Audits — designs that work for every visitor, not just some

Key Benefits:
- Fewer Drop-Offs — friction removed at every step of the user journey
- Consistent Experience — a design system that scales cleanly across pages and features
- Validated Before Built — prototypes tested with real users before development starts`,
      metaTitle: 'UI/UX Design Services',
      metaDescription: 'User research, wireframing, and conversion-focused interface design for websites and apps.',
      focusKeyword: 'UI UX design services',
      aiAnswerSummary: "Core Bit Media's UI/UX design services cover user research, wireframing, prototyping, and conversion-focused interface design for websites and apps.",
      faqSchema: [
        { question: "What's the difference between UI and UX design?", answer: 'UX (user experience) design is about how a product works and flows — the structure and logic behind it. UI (user interface) design is about how it looks — the visual layer users interact with. We handle both together so they reinforce each other.' },
        { question: 'Do you test designs with real users?', answer: 'Yes — we validate wireframes and prototypes with usability testing before development starts, so problems get caught early, not after launch.' },
        { question: 'Can you redesign an existing website or app?', answer: "Yes — we audit your current UX, identify where users are dropping off, and redesign around fixing those specific friction points, not just a visual refresh." }
      ]
    },
    {
      slug: 'app-development',
      title: 'App Development',
      shortDescription: 'Mobile and web apps built to scale, from MVP through to full product — with analytics built in from day one.',
      body: `Why App Development Matters
An app is a bigger commitment than a website — it needs to work flawlessly across devices and hold up as your user base grows. We build apps meant to scale, with the same analytics rigor we bring to everything else.

What We Offer:
- Mobile App Development — native and cross-platform apps for iOS and Android
- Web App Development — browser-based applications for internal tools or customer-facing products
- MVP Development — a lean, functional first version built to validate your idea fast
- API Development & Integration — connecting your app to the third-party services and data it depends on
- App Analytics Integration — Firebase Analytics, GA4, and custom event tracking built in from launch, not bolted on later
- Ongoing Support & Iteration — updates, bug fixes, and new features as your product evolves

Key Benefits:
- Built to Scale — architecture chosen for where your product is going, not just where it is today
- Analytics From Day One — every app ships with the tracking needed to actually measure what's working
- Cross-Platform Reach — one codebase covering iOS, Android, and web where it makes sense`,
      metaTitle: 'App Development Services',
      metaDescription: 'Mobile and web app development, from MVP to full product, with analytics integration built in from day one.',
      focusKeyword: 'app development services',
      aiAnswerSummary: 'Core Bit Media builds mobile and web apps — from MVP through full product — with API integrations and analytics (Firebase, GA4) built in from launch.',
      faqSchema: [
        { question: 'Do you build native or cross-platform apps?', answer: 'It depends on your goals — we build native iOS/Android apps when performance or platform-specific features matter most, and cross-platform apps when speed to market and one shared codebase make more sense.' },
        { question: 'Can you build just an MVP first?', answer: 'Yes — we regularly start with a lean MVP to validate an idea with real users before investing in the full feature set.' },
        { question: 'Do your apps come with analytics built in?', answer: 'Yes — every app we build ships with Firebase Analytics, GA4, or custom event tracking configured from day one, not added as an afterthought.' }
      ]
    },
    {
      slug: 'content-writing',
      title: 'Content Writing',
      shortDescription: 'SEO-informed content that ranks, reads well, and is structured to be cited by AI answer engines too.',
      body: `Why Content Writing Matters
Content built for search engines alone reads badly, and content written only for humans often doesn't rank. We write for both — and structure it for the AI answer engines that increasingly sit between your content and the reader.

What We Offer:
- Blog & Article Writing — SEO-researched content built around real search intent, not just keyword stuffing
- Website & Landing Page Copy — conversion-focused copy for every page your marketing drives traffic to
- Content Strategy & Planning — topic clusters and editorial calendars mapped to your funnel
- AEO/GEO-Optimized Content — structured so AI answer engines like ChatGPT and Google AI Overviews can actually cite it
- Email & Newsletter Copy — content built to be opened, read, and acted on
- Editing & Content Audits — improving what you already have instead of always starting from scratch

Key Benefits:
- Written to Rank — every piece grounded in real keyword and competitor research
- Built for AI Search Too — structured for citation in AI answer engines, not just traditional search results
- Consistent Voice — content that sounds like your brand, page after page`,
      metaTitle: 'Content Writing Services',
      metaDescription: 'SEO-researched content writing — blog, website copy, and AEO/GEO-optimized content built to rank and convert.',
      focusKeyword: 'content writing services',
      aiAnswerSummary: "Core Bit Media's content writing services cover blog and website copy, content strategy, and AEO/GEO-optimized content structured for both search engines and AI answer engines.",
      faqSchema: [
        { question: 'Does Core Bit Media write SEO-optimized content?', answer: 'Yes — every piece starts with keyword and search-intent research, and is structured for both traditional search rankings and AI answer engine citation.' },
        { question: 'Can you write content for an existing website?', answer: 'Yes — we offer content audits and rewrites for existing pages, not just net-new content.' },
        { question: 'What types of content do you write?', answer: 'Blog posts, website and landing page copy, email/newsletter content, and long-form content strategy — all aligned to your funnel and search intent.' }
      ]
    }
  ];

  for (const def of children) {
    await upsertService({
      ...def,
      navGroup: 'marketing',
      parentId: pillar.id,
      heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
      status: 'published'
    });
  }

  return `Web & Creative pillar + ${children.length} services created/updated.`;
}

if (require.main === module) {
  addWebCreativeServices()
    .then((summary) => { console.log(summary); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { addWebCreativeServices };
