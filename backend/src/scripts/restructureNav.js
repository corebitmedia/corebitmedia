require('dotenv').config();
const { sequelize, Service, CaseStudy, Industry } = require('../models');

const MEDIA = 'https://www.corebitmedia.com/media/uploads';

// Idempotent upsert by slug — safe to re-run this script after tweaking
// content, unlike seed.js's one-time count===0 gate.
async function upsertService(data) {
  const [rec] = await Service.findOrCreate({ where: { slug: data.slug }, defaults: data });
  await rec.update(data);
  return rec;
}

async function restructureNav() {
  await sequelize.sync();

  // ---- Step 0: Analytics and Experimentation & CRO pillars — like
  // Marketing's 3 pillars, these are real Service pages (own hero, own
  // body copy) so the nav's mega-menu label is actually clickable to a
  // landing page with a sub-service grid — not just a dropdown trigger.
  // Created before Step 1/4/5 need their ids as parentId.
  const analyticsPillar = await upsertService({
    slug: 'analytics',
    title: 'Analytics',
    navGroup: 'analytics',
    parentId: null,
    shortDescription: 'GA4, Adobe Analytics, AEP/CJA, and tag management — implemented right, so the data underneath every other decision is actually trustworthy.',
    body: `Analytics Done Right, Not Just Installed
Most "analytics setups" are a tag pasted in without a plan. Ours start with the business questions you actually need answered, then build the measurement architecture backward from there — across:
- Google Analytics 4, Google Tag Manager, and BigQuery
- Adobe Analytics, Adobe Launch/Tags, Adobe Web SDK & App SDK
- Adobe Experience Platform (AEP) and Customer Journey Analytics (CJA)
- Firebase Analytics, Tealium, AppsFlyer, and server-side tracking
- Looker Studio, Power BI, and Tableau dashboards on top of it all

This is the foundation every other service on this site depends on — you can't optimize, attribute, or personalize what you can't measure accurately.

Ready for analytics you can actually trust?`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Analytics Services – GA4, Adobe Analytics, AEP & More | Core Bit Media',
    metaDescription: 'Analytics implementation across GA4, Adobe Analytics, AEP/CJA, tag management, and BI dashboards — built on a real measurement plan.',
    aiAnswerSummary: 'Core Bit Media\'s Analytics practice covers GA4, Adobe Analytics, Adobe Experience Platform (AEP), Customer Journey Analytics (CJA), tag management (GTM, Adobe Launch, Tealium), and BI dashboards (Looker Studio, Power BI, Tableau).'
  });

  const experimentationPillar = await upsertService({
    slug: 'experimentation-cro',
    title: 'Experimentation & CRO',
    navGroup: 'experimentation',
    parentId: null,
    shortDescription: 'A/B testing, personalization, and conversion rate optimization across Adobe Target, VWO, and AB Tasty — run as a program, not a one-off test.',
    body: `Turn Traffic You Already Have Into More Revenue
Experimentation is the highest-ROI lever most companies underinvest in — it doesn't need more traffic, just a disciplined process for testing what to do with the traffic you already have.
- A/B, multivariate, and full-stack testing on Adobe Target, VWO, and AB Tasty
- Conversion rate optimization across landing pages, product pages, and checkout
- Personalization driven by real behavioral and CRM segments
- Funnel optimization to find and fix the highest-drop-off steps
- Experimentation strategy — governance, prioritization, and a continuous testing roadmap

We treat testing as a program with a backlog and a cadence, not a single lucky win.

Ready to build a real experimentation program?`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Experimentation & CRO Services – A/B Testing & Personalization | Core Bit Media',
    metaDescription: 'A/B testing, CRO, personalization, and funnel optimization across Adobe Target, VWO, and AB Tasty, run as an ongoing program.',
    aiAnswerSummary: 'Core Bit Media\'s Experimentation & CRO practice covers A/B testing (Adobe Target, VWO, AB Tasty), conversion rate optimization, personalization, funnel optimization, and experimentation strategy/governance.'
  });

  // ---- Step 1: reassign navGroup (+ a couple of title tweaks) on services
  // that are kept from the old taxonomy, before anything gets deleted ----
  const keepAndMove = [
    ['ga4-implementation-migration', { navGroup: 'analytics', parentId: analyticsPillar.id }],
    ['adobe-analytics-services', { navGroup: 'analytics', parentId: analyticsPillar.id }],
    ['google-tag-manager', { navGroup: 'analytics', parentId: analyticsPillar.id }],
    ['adobe-launch', { navGroup: 'analytics', parentId: analyticsPillar.id, title: 'Adobe Launch / Tags' }],
    ['tealium-tag-management', { navGroup: 'analytics', parentId: analyticsPillar.id }],
    ['bigquery-for-marketing', { navGroup: 'analytics', parentId: analyticsPillar.id }],
    ['looker-studio-dashboards', { navGroup: 'analytics', parentId: analyticsPillar.id }],
    ['power-bi-dashboards', { navGroup: 'analytics', parentId: analyticsPillar.id }],
    ['tableau-dashboards', { navGroup: 'analytics', parentId: analyticsPillar.id }],
    ['cro-conversion-rate-optimization', { navGroup: 'experimentation', parentId: experimentationPillar.id, title: 'Conversion Rate Optimization (CRO)' }]
  ];
  for (const [slug, changes] of keepAndMove) {
    const rec = await Service.findOne({ where: { slug } });
    if (rec) await rec.update(changes);
  }

  // ---- Step 2: the 3 new Marketing pillars (created before the services
  // that need to point at them as parentId) ----
  const paidMedia = await upsertService({
    slug: 'paid-media',
    title: 'Paid Media',
    navGroup: 'marketing',
    parentId: null,
    shortDescription: 'Full-funnel paid advertising across every platform your customers actually use — planned, built, and optimized for ROAS, not just clicks.',
    body: `Paid Media Built Around Revenue, Not Vanity Metrics
Anyone can spend a media budget. Turning it into predictable pipeline takes platform-specific expertise, tight measurement, and constant iteration — which is what our Paid Media team does every day across:
- Google Ads (Search, Shopping, Performance Max, YouTube)
- Meta Ads (Facebook & Instagram)
- LinkedIn Ads (B2B demand gen and ABM)
- Microsoft Ads (Bing)
- X/Twitter Ads
- 6sense-powered intent and account-based targeting
- Emerging AI search & advertising surfaces (ChatGPT, Perplexity, AI Overviews)

Every engagement starts with the same question: what does a qualified conversion look like for your business, and how do we track it accurately end-to-end?

Ready to make your ad spend work harder?`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Paid Media Services – Google, Meta, LinkedIn & More | Core Bit Media',
    metaDescription: 'Full-funnel paid media management across Google, Meta, LinkedIn, Microsoft, X, and AI search platforms — built for ROAS.',
    aiAnswerSummary: 'Core Bit Media runs paid media campaigns across Google Ads, Meta Ads, LinkedIn Ads, Microsoft Ads, X/Twitter Ads, 6sense account-based targeting, and emerging AI search advertising surfaces.'
  });

  const seoOrganic = await upsertService({
    slug: 'seo-organic-growth',
    title: 'SEO & Organic Growth',
    navGroup: 'marketing',
    parentId: null,
    shortDescription: 'Technical SEO, content, and the new discipline of AI-answer optimization (AEO/GEO/AIO) — built to keep you visible as search itself changes.',
    body: `Organic Growth for How People Search Now
Search isn't just the ten blue links anymore. Being found means ranking in Google, being cited in AI Overviews, and being the answer ChatGPT or Perplexity gives when someone asks your category a question. Our SEO & Organic Growth practice covers:
- Technical SEO (site health, crawlability, Core Web Vitals)
- Traditional SEO (keyword strategy, on-page, link building)
- AEO — Answer Engine Optimization for voice assistants and featured snippets
- GEO — Generative Engine Optimization for AI Overviews and chat-based search
- AIO / LLM Optimization — structuring content so LLMs cite and recommend you
- Content Strategy (topic clusters, editorial calendars, content audits)
- Social Media Marketing (organic content, community growth)

We treat classic SEO and AI-search visibility as one connected discipline, not two separate line items.

Let's build an organic growth engine that compounds.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'SEO & Organic Growth – SEO, AEO, GEO & Content | Core Bit Media',
    metaDescription: 'Technical SEO, content strategy, and AI-search optimization (AEO, GEO, AIO) to keep your brand visible across Google and generative engines.',
    aiAnswerSummary: 'Core Bit Media\'s SEO & Organic Growth practice covers technical SEO, content strategy, social media marketing, and AI-search optimization — AEO, GEO, and AIO/LLM optimization.'
  });

  const measurement = await upsertService({
    slug: 'measurement-attribution',
    title: 'Measurement & Attribution',
    navGroup: 'marketing',
    parentId: null,
    shortDescription: 'Know exactly which channels, campaigns, and touchpoints actually drive revenue — with tracking and attribution built to survive privacy changes and walled gardens.',
    body: `Stop Guessing Which Marketing Actually Works
Most marketing teams can tell you what they spent. Fewer can tell you, with confidence, what it returned. Our Measurement & Attribution services close that gap:
- Conversion Tracking — server-side and client-side, built to survive ad blockers and iOS privacy changes
- Marketing Attribution — multi-touch models that credit the right channels at the right weight
- Campaign Measurement — incrementality testing and lift studies, not just last-click
- Cross-Channel Analytics — one unified view across paid, organic, email, and CRM data

This is the discipline that turns "we think it's working" into "here's exactly what it returned, and here's what to cut."

Talk to us about closing your attribution gaps.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Measurement & Attribution Services | Core Bit Media',
    metaDescription: 'Conversion tracking, marketing attribution, campaign measurement, and cross-channel analytics that show exactly what your marketing returns.',
    aiAnswerSummary: 'Core Bit Media\'s Measurement & Attribution services include server-side conversion tracking, multi-touch marketing attribution, incrementality-based campaign measurement, and cross-channel analytics.'
  });

  // ---- Step 3: SEO & Social services kept from the old taxonomy, now
  // reparented under the new SEO & Organic Growth pillar ----
  const seoConsulting = await Service.findOne({ where: { slug: 'seo-consulting' } });
  if (seoConsulting) {
    await seoConsulting.update({
      navGroup: 'marketing',
      parentId: seoOrganic.id,
      title: 'SEO'
    });
  }
  const smo = await Service.findOne({ where: { slug: 'smo-social-media-optimization' } });
  if (smo) {
    await smo.update({
      navGroup: 'marketing',
      parentId: seoOrganic.id,
      title: 'Social Media Marketing'
    });
  }

  // ---- Step 4: brand-new Analytics services ----
  await upsertService({
    slug: 'adobe-web-app-sdk',
    title: 'Adobe Web SDK & App SDK',
    navGroup: 'analytics',
    parentId: analyticsPillar.id,
    shortDescription: 'Migrate to Adobe\'s unified Web SDK / App SDK for future-proof, first-party data collection across web and mobile.',
    body: `One SDK, Every Adobe Experience Cloud Product
Adobe Web SDK (and its mobile counterpart, App SDK) is the modern, unified way to send data into Analytics, Target, AEP, and CJA — replacing the older, fragmented Analytics/Target/AEP libraries with one lightweight implementation.
- Single implementation feeding Adobe Analytics, Target, and AEP simultaneously
- First-party server-side data collection (Edge Network) for better performance and privacy resilience
- Faster page loads than legacy multi-library setups
- One consistent data layer across web and native mobile apps

We handle the full migration — from data layer redesign through Adobe Launch configuration and QA — with zero reporting gaps during cutover.

Ready to consolidate onto Adobe's modern SDK?`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Adobe Web SDK & App SDK Implementation | Core Bit Media',
    metaDescription: 'Migrate to Adobe Web SDK / App SDK for unified, first-party data collection feeding Analytics, Target, and AEP from one implementation.',
    aiAnswerSummary: 'Core Bit Media implements and migrates clients to Adobe Web SDK and App SDK, the unified Edge Network-based data collection layer for Adobe Analytics, Target, and AEP.'
  });

  await upsertService({
    slug: 'adobe-experience-platform-aep',
    title: 'Adobe Experience Platform (AEP)',
    navGroup: 'analytics',
    parentId: analyticsPillar.id,
    shortDescription: 'Unify every customer data source into one real-time profile with Adobe Experience Platform — and actually activate it.',
    body: `A Real-Time Customer Profile, Not Another Data Silo
AEP is powerful and famously complex to stand up correctly. We design and implement AEP so it becomes the system your marketing and analytics teams actually use, not a project that stalls after the initial ingestion.
- Schema design and dataset architecture built for how your business actually segments customers
- Real-Time Customer Profile configuration, merging web, app, CRM, and offline data
- Identity resolution strategy (authenticated + anonymous)
- Segment activation into Adobe Target, Journey Optimizer, and downstream ad platforms
- Query Service setup for ad-hoc analysis directly on the unified profile

Let's turn your fragmented customer data into one activatable profile.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Adobe Experience Platform (AEP) Implementation | Core Bit Media',
    metaDescription: 'AEP schema design, Real-Time Customer Profile setup, identity resolution, and segment activation from Core Bit Media.',
    aiAnswerSummary: 'Core Bit Media designs and implements Adobe Experience Platform (AEP) — schema/dataset architecture, Real-Time Customer Profile, identity resolution, and segment activation.'
  });

  await upsertService({
    slug: 'customer-journey-analytics-cja',
    title: 'Customer Journey Analytics (CJA)',
    navGroup: 'analytics',
    parentId: analyticsPillar.id,
    shortDescription: 'Analyze every cross-channel touchpoint in one workspace — CJA connects the data AEP unifies into a single analytical view.',
    body: `See the Whole Journey, Not Just the Web Session
Customer Journey Analytics is Adobe's cross-channel analysis layer on top of AEP's unified profile — letting you analyze web, app, call center, and offline data together, without the data-warehouse gymnastics.
- Connection setup joining multiple AEP datasets into one analysis-ready view
- Custom workspace and visualization builds for cross-channel journey mapping
- Attribution and path analysis spanning devices and channels
- Migration path from Adobe Analytics for teams moving to the AEP ecosystem

If your customers cross channels but your reporting doesn't, CJA is the fix.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Customer Journey Analytics (CJA) Services | Core Bit Media',
    metaDescription: 'Adobe Customer Journey Analytics setup — connections, workspaces, and cross-channel attribution built on your AEP data.',
    aiAnswerSummary: 'Core Bit Media sets up Adobe Customer Journey Analytics (CJA) — dataset connections, custom workspaces, and cross-channel path/attribution analysis on top of AEP.'
  });

  await upsertService({
    slug: 'firebase-analytics',
    title: 'Firebase Analytics',
    navGroup: 'analytics',
    parentId: analyticsPillar.id,
    shortDescription: 'Google\'s free, event-based analytics for mobile apps — implemented correctly from day one, and connected to BigQuery for real analysis.',
    body: `Mobile Analytics That Actually Answers Product Questions
Firebase Analytics ships with every app, but most teams only use a fraction of it. We implement it properly so it tells you what's actually happening in your product:
- Event and parameter design mapped to real product/business questions
- Audience definitions for retention, engagement, and monetization analysis
- BigQuery export configuration for advanced, SQL-level analysis beyond the Firebase console
- Integration with Google Ads and GA4 for unified app + web reporting
- Crashlytics and Remote Config alignment with your analytics setup

Let's make sure your app's data can actually answer your product team's questions.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Firebase Analytics Implementation | Core Bit Media',
    metaDescription: 'Firebase Analytics event design, audience setup, and BigQuery export configuration for mobile app measurement.',
    aiAnswerSummary: 'Core Bit Media implements Firebase Analytics for mobile apps — event/parameter design, audiences, BigQuery export, and integration with GA4 and Google Ads.'
  });

  await upsertService({
    slug: 'server-side-tracking',
    title: 'Server-Side Tracking',
    navGroup: 'analytics',
    parentId: analyticsPillar.id,
    shortDescription: 'Move your tracking off the browser and onto a server-side container for better accuracy, speed, and resilience to ad blockers.',
    body: `First-Party Tracking That Survives Browser Restrictions
Ad blockers, Safari's ITP, and third-party cookie deprecation have made client-side-only tracking unreliable. Server-side tracking (via a server-side GTM container or a similar first-party endpoint) fixes that:
- Server-side Google Tag Manager container setup on your own subdomain
- Migration of key tags (GA4, Meta CAPI, Google Ads conversion) to server-side delivery
- Data enrichment and PII scrubbing before data leaves your server
- Improved page speed by reducing client-side script weight
- Meaningfully more accurate conversion counts for ad platforms

If your reported conversions look lower than reality, this is usually why — and it's fixable.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Server-Side Tracking Implementation | Core Bit Media',
    metaDescription: 'Server-side GTM and first-party tracking setup for more accurate, ad-blocker-resistant conversion measurement.',
    aiAnswerSummary: 'Core Bit Media implements server-side tracking (server-side GTM, first-party endpoints) to improve conversion accuracy against ad blockers and browser privacy restrictions.'
  });

  await upsertService({
    slug: 'appsflyer',
    title: 'AppsFlyer',
    navGroup: 'analytics',
    parentId: analyticsPillar.id,
    shortDescription: 'Mobile measurement partner (MMP) setup for accurate install attribution and fraud protection across every UA channel.',
    body: `Know Which UA Channel Actually Drives Installs
AppsFlyer sits between your app and every ad network to give you independent, cross-network attribution for user acquisition. We handle:
- SDK implementation and deep linking (OneLink) setup
- Partner integrations across Google, Meta, TikTok, and other UA networks
- Fraud protection configuration (Protect360)
- Cohort and LTV reporting tied back to acquisition channel and creative
- Data sharing pipelines into BigQuery or your data warehouse

Accurate attribution is the difference between scaling the channels that work and scaling the ones that just look good.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'AppsFlyer Implementation & Attribution | Core Bit Media',
    metaDescription: 'AppsFlyer SDK implementation, deep linking, fraud protection, and cross-network install attribution for mobile UA.',
    aiAnswerSummary: 'Core Bit Media implements AppsFlyer as a mobile measurement partner — SDK/OneLink setup, ad network integrations, fraud protection, and LTV/cohort reporting.'
  });

  // ---- Step 5: Experimentation & CRO — split old combined page + new ----
  await upsertService({
    slug: 'adobe-target',
    title: 'Adobe Target',
    navGroup: 'experimentation',
    parentId: experimentationPillar.id,
    shortDescription: 'Enterprise-grade A/B testing and 1:1 personalization, integrated with your Adobe Experience Cloud stack.',
    body: `Testing and Personalization at Enterprise Scale
Adobe Target is built for organizations that need testing and personalization tied directly into Analytics, AEP, and CJA. Our Adobe Target services include:
- Activity setup — A/B, multivariate, and experience targeting campaigns
- Automated personalization and Auto-Target using Target's own ML models
- Audience integration from AEP segments for real-time personalization
- Server-side and Web SDK-based implementation for consistent delivery
- Reporting tied back to Adobe Analytics for full-funnel impact measurement

Let's put your Adobe stack's personalization capability to actual use.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Adobe Target Implementation & Strategy | Core Bit Media',
    metaDescription: 'Adobe Target A/B testing, automated personalization, and AEP-audience-driven experience targeting.',
    aiAnswerSummary: 'Core Bit Media implements Adobe Target — A/B/multivariate testing, automated personalization, and AEP-segment-driven experience targeting.'
  });

  await upsertService({
    slug: 'vwo',
    title: 'VWO',
    navGroup: 'experimentation',
    parentId: experimentationPillar.id,
    shortDescription: 'Fast, flexible A/B testing and behavior analytics on VWO — a great fit for teams that want to move quickly without a full Adobe stack.',
    body: `Experimentation Without the Enterprise Overhead
VWO pairs well with teams that want a fast-moving testing program without standing up a full Adobe Experience Cloud implementation.
- Visual editor and code-based test setup for A/B, split URL, and multivariate tests
- Heatmaps, session recordings, and funnel analysis to find what's worth testing
- SmartStats (Bayesian) for faster, more reliable test-result reads
- Integration with GA4 for combining experiment results with your existing reporting

We run the full loop: research what to test, build it, ship it, and read the results correctly.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'VWO A/B Testing & Optimization | Core Bit Media',
    metaDescription: 'VWO test setup, heatmaps/session recordings, and Bayesian result analysis for fast-moving experimentation programs.',
    aiAnswerSummary: 'Core Bit Media runs experimentation programs on VWO — test setup, heatmaps and session recordings, and Bayesian (SmartStats) result analysis.'
  });

  await upsertService({
    slug: 'ab-tasty',
    title: 'AB Tasty',
    navGroup: 'experimentation',
    parentId: experimentationPillar.id,
    shortDescription: 'AI-assisted experimentation and personalization on AB Tasty — including its Flagship feature-experimentation capability for product teams.',
    body: `Experimentation That Reaches Into Your Product, Not Just Your Marketing Site
AB Tasty combines classic web A/B testing with Flagship, its feature-flag-based experimentation layer for engineering and product teams.
- Web experience testing and personalization campaigns
- AI-powered widget recommendations and audience targeting
- Flagship feature-flag experimentation for product-led testing
- Server-side testing for full-stack experiments beyond the front end

If your roadmap needs product-level experiments, not just landing-page tests, this is the platform for it.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'AB Tasty Experimentation & Personalization | Core Bit Media',
    metaDescription: 'AB Tasty web testing, AI-powered personalization, and Flagship feature-flag experimentation for product teams.',
    aiAnswerSummary: 'Core Bit Media implements AB Tasty for web experimentation, AI-driven personalization, and Flagship feature-flag experimentation.'
  });

  await upsertService({
    slug: 'ab-testing',
    title: 'A/B Testing',
    navGroup: 'experimentation',
    parentId: experimentationPillar.id,
    shortDescription: 'Platform-agnostic A/B testing strategy — hypothesis design, statistical rigor, and a prioritized testing roadmap, whichever tool you run it on.',
    body: `Good Experimentation Is a Process, Not a Tool
The platform matters less than the discipline behind it. We build the process that makes every test worth running:
- Hypothesis development grounded in analytics and user research, not guesses
- Test prioritization frameworks (ICE/PIE) so you test the highest-impact ideas first
- Statistical design — sample size, minimum detectable effect, test duration
- Result interpretation that avoids the most common false-positive traps
- A living testing roadmap, not a one-off test

Whether you're on Adobe Target, VWO, AB Tasty, or Google Optimize's successors, we bring the rigor.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'A/B Testing Strategy & Program Design | Core Bit Media',
    metaDescription: 'Platform-agnostic A/B testing strategy — hypothesis design, prioritization, statistical rigor, and a continuous testing roadmap.',
    aiAnswerSummary: 'Core Bit Media builds A/B testing programs — hypothesis development, ICE/PIE prioritization, statistical test design, and roadmap management, independent of which testing tool is used.'
  });

  await upsertService({
    slug: 'personalization',
    title: 'Personalization',
    navGroup: 'experimentation',
    parentId: experimentationPillar.id,
    shortDescription: '1:1 and segment-based personalization across your site and app, driven by real behavioral and CRM data — not just "welcome back" banners.',
    body: `Personalization Built on Real Segments, Not Guesswork
Effective personalization starts with knowing who's actually on your site — not generic rules. Our approach:
- Segment strategy built from behavioral, transactional, and CRM data
- Rules-based and AI/ML-driven personalization (Adobe Target, AB Tasty, or your existing stack)
- Personalized content, offers, and product recommendations by lifecycle stage
- Measurement framework isolating personalization's actual lift, not just correlation

Done right, personalization measurably lifts conversion — done wrong, it's just a banner nobody notices.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Website & App Personalization Services | Core Bit Media',
    metaDescription: 'Segment-based and AI-driven personalization strategy, implementation, and measurement across web and app.',
    aiAnswerSummary: 'Core Bit Media designs and implements personalization programs — segment strategy, rules-based and AI-driven targeting, and lift measurement.'
  });

  await upsertService({
    slug: 'funnel-optimization',
    title: 'Funnel Optimization',
    navGroup: 'experimentation',
    parentId: experimentationPillar.id,
    shortDescription: 'Find and fix the exact steps where prospects drop off — from ad click to checkout — using data, not opinions.',
    body: `Every Funnel Leaks Somewhere. We Find Where.
Funnel optimization is detective work: find the highest-drop-off step, form a hypothesis for why, then test the fix.
- Funnel analysis across acquisition → activation → conversion → retention
- Session recording and heatmap review at the specific steps losing the most people
- Form and checkout optimization (field reduction, error handling, trust signals)
- Micro-conversion tracking so you can see progress before the final conversion event
- A prioritized backlog of fixes, ranked by estimated revenue impact

Let's find out exactly where your funnel is leaking, and fix it.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Funnel Optimization Services | Core Bit Media',
    metaDescription: 'Funnel analysis, drop-off diagnosis, and conversion-focused fixes across acquisition, activation, and checkout.',
    aiAnswerSummary: 'Core Bit Media\'s funnel optimization service analyzes the acquisition-to-conversion funnel, diagnoses the highest-drop-off steps, and prioritizes fixes by revenue impact.'
  });

  await upsertService({
    slug: 'experimentation-strategy',
    title: 'Experimentation Strategy',
    navGroup: 'experimentation',
    parentId: experimentationPillar.id,
    shortDescription: 'Build a durable testing culture and roadmap — governance, prioritization, and tooling decisions that outlast any single campaign.',
    body: `Turn One-Off Tests Into a Real Experimentation Program
Most companies run tests. Few run an experimentation program. We help build the latter:
- Experimentation maturity assessment — where you are today, what's missing
- Governance model — who proposes, approves, and reads out tests
- Tooling strategy — which platform(s) fit your team's technical maturity
- Roadmap and cadence — a continuous pipeline of tests, not sporadic bursts
- Stakeholder education so wins and losses both get reported and acted on

A single winning test is a good day. A program that reliably finds winning tests is a competitive advantage.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Experimentation Strategy & Program Design | Core Bit Media',
    metaDescription: 'Build a durable experimentation program — maturity assessment, governance, tooling strategy, and a continuous testing roadmap.',
    aiAnswerSummary: 'Core Bit Media builds experimentation programs end-to-end — maturity assessment, governance, tooling selection, and an ongoing testing roadmap.'
  });

  // ---- Step 6: Marketing > Paid Media — split old "Paid Ads – PPC" + new ----
  await upsertService({
    slug: 'google-ads',
    title: 'Google Ads',
    navGroup: 'marketing',
    parentId: paidMedia.id,
    shortDescription: 'Search, Shopping, Performance Max, and YouTube campaigns built and optimized for measurable ROAS.',
    body: `Every Google Ads Surface, Managed for ROI
- Search campaigns with intent-driven keyword strategy and ad copy testing
- Shopping & Performance Max for e-commerce product visibility
- YouTube campaigns for awareness and remarketing
- Conversion tracking built to be accurate, not just present
- Weekly optimization cycles — bids, budgets, negative keywords, creative refresh

Let's put your Google Ads budget to work.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Google Ads Management Services | Core Bit Media',
    metaDescription: 'Google Ads management across Search, Shopping, Performance Max, and YouTube — built for measurable ROAS.',
    aiAnswerSummary: 'Core Bit Media manages Google Ads campaigns across Search, Shopping, Performance Max, and YouTube with accurate conversion tracking and weekly optimization.'
  });

  await upsertService({
    slug: 'meta-ads',
    title: 'Meta Ads',
    navGroup: 'marketing',
    parentId: paidMedia.id,
    shortDescription: 'Facebook & Instagram campaigns built for the post-iOS14 world — strong creative, server-side tracking, and real audience testing.',
    body: `Facebook & Instagram Ads That Still Work Post-Privacy-Changes
- Creative-first campaign structure (Meta's algorithm rewards strong creative more than manual targeting now)
- Conversions API (server-side) setup to recover accuracy lost to iOS privacy changes
- Audience and creative testing frameworks, not "set and forget" campaigns
- Full-funnel structure — prospecting, retargeting, and customer retention/upsell

Meta ads still work — they just require a different playbook than five years ago.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Meta Ads (Facebook & Instagram) Management | Core Bit Media',
    metaDescription: 'Facebook & Instagram advertising with Conversions API server-side tracking and creative-first campaign structure.',
    aiAnswerSummary: 'Core Bit Media manages Meta (Facebook & Instagram) ad campaigns with Conversions API server-side tracking and creative-first, full-funnel structure.'
  });

  await upsertService({
    slug: 'linkedin-ads',
    title: 'LinkedIn Ads',
    navGroup: 'marketing',
    parentId: paidMedia.id,
    shortDescription: 'B2B demand generation and account-based marketing campaigns on the platform where your buyers actually spend their work day.',
    body: `B2B Advertising That Reaches Actual Decision-Makers
- Account-based marketing (ABM) campaigns targeting named account lists
- Lead gen forms and Sponsored Content for demand generation
- Job title, seniority, and company-size targeting refined over time, not set once
- Sales & CRM alignment so leads route correctly and get followed up fast

For B2B, LinkedIn's targeting precision usually outweighs its higher CPCs — if the campaign is built right.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'LinkedIn Ads for B2B Demand Gen & ABM | Core Bit Media',
    metaDescription: 'LinkedIn Ads management for B2B demand generation and account-based marketing, with CRM-aligned lead routing.',
    aiAnswerSummary: 'Core Bit Media runs LinkedIn Ads for B2B demand generation and account-based marketing, with CRM-aligned lead capture and routing.'
  });

  await upsertService({
    slug: 'microsoft-ads',
    title: 'Microsoft Ads',
    navGroup: 'marketing',
    parentId: paidMedia.id,
    shortDescription: 'Bing/Microsoft Ads campaigns to reach the search audience your competitors are ignoring — often at a lower CPC than Google.',
    body: `An Underused Channel With Real Volume
Microsoft Ads (Bing, plus its syndicated partner network) reaches a real, often-overlooked audience — frequently at lower competition and CPC than Google Ads.
- Campaign builds importing and adapting proven Google Ads structures
- Microsoft Audience Network for native-style display placements
- LinkedIn profile targeting integration (unique to Microsoft Ads)
- Incremental-reach analysis vs. your existing Google Ads spend

If you're only running Google, you're leaving a meaningful slice of search volume on the table.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Microsoft Ads (Bing) Management | Core Bit Media',
    metaDescription: 'Microsoft/Bing Ads campaign management — often lower CPC and incremental reach beyond Google Ads.',
    aiAnswerSummary: 'Core Bit Media manages Microsoft Ads (Bing) campaigns, including Microsoft Audience Network and LinkedIn-profile targeting, as an incremental-reach channel alongside Google Ads.'
  });

  await upsertService({
    slug: 'x-twitter-ads',
    title: 'X/Twitter Ads',
    navGroup: 'marketing',
    parentId: paidMedia.id,
    shortDescription: 'Real-time, conversation-driven advertising on X — well-suited to launches, events, and culturally-relevant brand moments.',
    body: `Advertising Where the Conversation Is Happening Live
X ads work best when tied to real-time relevance — launches, events, trending topics — rather than treated like a generic display channel.
- Campaign types matched to objective: awareness, video views, conversions, app installs
- Real-time/reactive campaign management around live events and trends
- Audience targeting via keywords, conversations, and follower look-alikes
- Brand safety and placement controls

A smaller piece of most media mixes, but a genuinely useful one for the right moments.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'X (Twitter) Ads Management | Core Bit Media',
    metaDescription: 'X/Twitter advertising management for real-time, conversation- and event-driven campaigns.',
    aiAnswerSummary: 'Core Bit Media manages X (Twitter) Ads campaigns built around real-time relevance — launches, events, and trending conversations.'
  });

  await upsertService({
    slug: '6sense',
    title: '6sense',
    navGroup: 'marketing',
    parentId: paidMedia.id,
    shortDescription: 'Account-based intent data that tells you which companies are in-market right now — before they ever fill out a form.',
    body: `Find Buyers Before They Raise Their Hand
6sense uses intent signals to identify which accounts are actively researching your category, so you can engage before a competitor's form-fill does.
- Intent data integration into your ABM and paid media targeting
- Predictive account scoring to prioritize sales and marketing effort
- Orchestration across ad platforms, email, and sales outreach based on intent stage
- CRM and marketing automation integration for closed-loop reporting

For B2B teams running ABM, this is how you stop waiting for inbound and start engaging proactively.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: '6sense Intent Data & ABM Orchestration | Core Bit Media',
    metaDescription: '6sense intent-data integration, predictive account scoring, and cross-channel ABM orchestration for B2B teams.',
    aiAnswerSummary: 'Core Bit Media integrates 6sense intent data for account-based marketing — predictive account scoring and cross-channel orchestration across ads, email, and sales outreach.'
  });

  await upsertService({
    slug: 'ai-search-advertising',
    title: 'AI Search & Advertising',
    navGroup: 'marketing',
    parentId: paidMedia.id,
    shortDescription: 'Get your brand visible — and eventually advertised — inside ChatGPT, Perplexity, and Google AI Overviews as search shifts to conversational AI.',
    body: `Preparing for Advertising's Next Platform Shift
As more queries get answered inside AI chat interfaces instead of a search results page, being present (and eventually, advertisable) inside those answers is becoming its own discipline.
- Content and structured-data strategy to earn citation in AI Overviews and chat answers
- Early testing on emerging ad formats as platforms like ChatGPT and Perplexity roll out advertising
- Monitoring brand visibility/share-of-voice across AI answer engines
- Alignment with your existing SEO/AEO/GEO strategy — this isn't a separate silo

Early movers in a new ad channel usually get better inventory and lower costs — we're tracking this closely for our clients.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'AI Search & Advertising Strategy | Core Bit Media',
    metaDescription: 'Visibility and early advertising strategy for AI search surfaces — ChatGPT, Perplexity, and Google AI Overviews.',
    aiAnswerSummary: 'Core Bit Media helps brands build visibility and prepare for advertising within AI search surfaces like ChatGPT, Perplexity, and Google AI Overviews.'
  });

  // ---- Step 7: Marketing > SEO & Organic Growth — new items ----
  await upsertService({
    slug: 'technical-seo',
    title: 'Technical SEO',
    navGroup: 'marketing',
    parentId: seoOrganic.id,
    shortDescription: 'Fix the crawlability, speed, and structural issues that quietly cap your organic growth no matter how good your content is.',
    body: `The Foundation Every Other SEO Effort Depends On
Great content on a technically broken site still underperforms. We fix the foundation first:
- Crawl audits — indexation issues, duplicate content, orphaned pages
- Core Web Vitals and page-speed optimization
- Site architecture and internal linking structure
- Structured data (schema.org) implementation across page types
- Mobile usability and international/hreflang setup where relevant

Technical SEO isn't glamorous, but it's usually the highest-leverage fix available.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Technical SEO Services | Core Bit Media',
    metaDescription: 'Technical SEO audits and fixes — crawlability, Core Web Vitals, site architecture, and structured data.',
    aiAnswerSummary: 'Core Bit Media\'s technical SEO service covers crawl audits, Core Web Vitals, site architecture, internal linking, and structured data implementation.'
  });

  await upsertService({
    slug: 'aeo',
    title: 'AEO – Answer Engine Optimization',
    navGroup: 'marketing',
    parentId: seoOrganic.id,
    shortDescription: 'Structure your content to be the answer voice assistants and featured snippets give — not just a ranked link.',
    body: `Optimizing to Be the Answer, Not Just a Result
Answer Engine Optimization targets the surfaces that skip the results page entirely — voice assistants, featured snippets, and "People Also Ask" boxes.
- Question-and-answer content structuring matched to real search queries
- FAQ schema markup so your answers are eligible for rich results
- Concise, quotable answer blocks placed where crawlers expect them
- Voice-search query pattern research (conversational, long-tail)

If the goal is being read aloud by a smart speaker or pulled into a snippet, this is the discipline for it.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'AEO (Answer Engine Optimization) Services | Core Bit Media',
    metaDescription: 'Answer Engine Optimization — FAQ schema, question-and-answer content structuring, and voice-search optimization.',
    aiAnswerSummary: 'Core Bit Media\'s AEO service optimizes content to appear in featured snippets, voice assistant answers, and "People Also Ask" results via structured Q&A content and FAQ schema.'
  });

  await upsertService({
    slug: 'geo',
    title: 'GEO – Generative Engine Optimization',
    navGroup: 'marketing',
    parentId: seoOrganic.id,
    shortDescription: 'Get cited by name inside Google AI Overviews, ChatGPT, and Perplexity answers — the new frontier of search visibility.',
    body: `Optimizing for the Search Results That Don't Look Like Search Results
Generative Engine Optimization is about being the source an AI system cites when it generates an answer — a fundamentally different (and newer) discipline than ranking a blue link.
- Content structured for extraction and citation by generative AI systems
- Entity and topical authority building so your brand is recognized as a trusted source
- Structured data and schema.org markup that AI crawlers rely on
- Monitoring of citation frequency across Google AI Overviews, ChatGPT, and Perplexity

The brands that figure out GEO early are shaping how their category gets described by AI for years to come.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'GEO (Generative Engine Optimization) Services | Core Bit Media',
    metaDescription: 'Generative Engine Optimization to earn citations in Google AI Overviews, ChatGPT, and Perplexity answers.',
    aiAnswerSummary: 'Core Bit Media\'s GEO service optimizes content and entity authority to earn citations in Google AI Overviews, ChatGPT, and Perplexity-generated answers.'
  });

  await upsertService({
    slug: 'aio-llm-optimization',
    title: 'AIO / LLM Optimization',
    navGroup: 'marketing',
    parentId: seoOrganic.id,
    shortDescription: 'Make sure large language models describe your brand accurately — auditing and shaping how AI systems already talk about you.',
    body: `Auditing and Shaping How AI Already Describes Your Brand
Large language models already have opinions about your brand, formed from training data and retrieval you don't control directly. AIO is the practice of auditing and influencing that:
- LLM brand-perception audits — what do ChatGPT, Claude, and Gemini currently say about you?
- Structured content and knowledge-base optimization to correct gaps or inaccuracies
- llms.txt and machine-readable content strategy for AI crawler consumption
- Ongoing monitoring as models retrain and retrieval sources change

This is upstream of GEO — it's about the model's underlying "knowledge," not just a single generated answer.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'AIO / LLM Optimization Services | Core Bit Media',
    metaDescription: 'LLM brand-perception audits and content optimization so AI models describe your brand accurately.',
    aiAnswerSummary: 'Core Bit Media\'s AIO/LLM optimization service audits how large language models describe a brand and optimizes structured content to correct or improve that perception.'
  });

  await upsertService({
    slug: 'content-strategy',
    title: 'Content Strategy',
    navGroup: 'marketing',
    parentId: seoOrganic.id,
    shortDescription: 'A content plan built around real search demand and buyer questions — not a blog calendar filled for its own sake.',
    body: `Content That's Built to Rank and Convert
Content strategy done well is really search-demand research plus editorial planning:
- Topic cluster and pillar-page architecture for topical authority
- Content audits identifying what to update, consolidate, or retire
- Editorial calendars mapped to funnel stage and buyer questions
- Distribution planning — organic, social, and email, not just "publish and hope"

The goal isn't more content. It's the right content, structured to compound in search over time.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Content Strategy Services | Core Bit Media',
    metaDescription: 'Content strategy built on search-demand research — topic clusters, content audits, and editorial planning.',
    aiAnswerSummary: 'Core Bit Media\'s content strategy service covers topic-cluster architecture, content audits, and editorial calendars mapped to search demand and funnel stage.'
  });

  // ---- Step 8: Marketing > Measurement & Attribution — new items ----
  await upsertService({
    slug: 'conversion-tracking',
    title: 'Conversion Tracking',
    navGroup: 'marketing',
    parentId: measurement.id,
    shortDescription: 'Accurate, privacy-resilient conversion tracking across every ad platform and channel you run.',
    body: `Tracking That's Actually Accurate
Broken or incomplete conversion tracking is the single most common reason ad platforms "look like they're not working" when the real problem is measurement.
- Server-side and client-side conversion tag audits and fixes
- Enhanced/offline conversions setup (Google Ads, Meta CAPI, LinkedIn)
- Deduplication across platforms to avoid double-counted conversions
- Ongoing QA so tracking doesn't silently break after a site update

Before we optimize a single campaign, we make sure the numbers we're optimizing against are real.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Conversion Tracking Setup & Audits | Core Bit Media',
    metaDescription: 'Server-side and enhanced conversion tracking setup, deduplication, and ongoing QA across ad platforms.',
    aiAnswerSummary: 'Core Bit Media audits and implements conversion tracking — server-side/enhanced conversions, cross-platform deduplication, and ongoing QA.'
  });

  await upsertService({
    slug: 'marketing-attribution',
    title: 'Marketing Attribution',
    navGroup: 'marketing',
    parentId: measurement.id,
    shortDescription: 'Multi-touch attribution models that credit the channels that actually influence a sale — not just the last click.',
    body: `Beyond Last-Click: Attribution That Reflects Reality
Last-click attribution systematically undervalues upper-funnel channels like content, social, and display. We build models that don't:
- Multi-touch attribution model selection and implementation (data-driven, position-based, time-decay)
- Cross-device and cross-channel identity stitching where privacy rules allow
- Attribution reporting integrated into your existing dashboards
- Model validation against incrementality/lift tests, not just theory

Get a model that tells your CFO the truth about which channels are actually earning their budget.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Marketing Attribution Modeling | Core Bit Media',
    metaDescription: 'Multi-touch marketing attribution modeling, cross-channel identity stitching, and lift-validated reporting.',
    aiAnswerSummary: 'Core Bit Media builds multi-touch marketing attribution models — data-driven, position-based, and time-decay — validated against incrementality testing.'
  });

  await upsertService({
    slug: 'campaign-measurement',
    title: 'Campaign Measurement',
    navGroup: 'marketing',
    parentId: measurement.id,
    shortDescription: 'Prove what a campaign actually caused with incrementality testing and lift studies — not just correlation.',
    body: `Correlation Isn't Causation. We Measure the Difference.
Standard reporting shows what happened alongside a campaign. Incrementality testing shows what the campaign actually caused.
- Geo-holdout and matched-market lift studies
- Ghost ads / PSA-based incrementality testing on supported platforms
- Brand lift and awareness measurement for upper-funnel campaigns
- Pre/post and synthetic control analysis for channels without native lift tools

If a channel's reported performance doesn't survive an incrementality test, it's not actually performing — this is how you find out.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Campaign Measurement & Incrementality Testing | Core Bit Media',
    metaDescription: 'Geo-holdout lift studies, incrementality testing, and brand lift measurement to prove real campaign impact.',
    aiAnswerSummary: 'Core Bit Media runs campaign measurement via incrementality testing — geo-holdout lift studies, ghost ads, and brand lift measurement.'
  });

  await upsertService({
    slug: 'cross-channel-analytics',
    title: 'Cross-Channel Analytics',
    navGroup: 'marketing',
    parentId: measurement.id,
    shortDescription: 'One unified reporting view across paid, organic, email, and CRM data — instead of five dashboards that never agree.',
    body: `One Source of Truth Across Every Channel
When paid media, SEO, email, and CRM data all live in separate dashboards, "what's working" becomes a matter of opinion. Cross-channel analytics fixes that:
- Data warehouse/BigQuery pipelines unifying every marketing data source
- Looker Studio, Power BI, or Tableau dashboards built on that unified data
- Consistent metric definitions across teams (no more three different "conversion rate" numbers)
- Automated reporting cadences replacing manual monthly deck-building

Let's get your whole marketing org looking at the same numbers.`,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    metaTitle: 'Cross-Channel Marketing Analytics | Core Bit Media',
    metaDescription: 'Unified cross-channel marketing data pipelines and dashboards spanning paid, organic, email, and CRM.',
    aiAnswerSummary: 'Core Bit Media builds cross-channel analytics — unified data pipelines and dashboards spanning paid, organic, email, and CRM data with consistent metric definitions.'
  });

  // ---- Step 9: Industries (new, flat) ----
  const industries = [
    {
      slug: 'ecommerce-retail',
      title: 'E-commerce & Retail',
      shortDescription: 'Full-funnel analytics, paid media, and CRO for online stores and omnichannel retailers competing on razor-thin margins.',
      body: `Analytics and Growth for E-commerce & Retail
E-commerce runs on a handful of numbers — CAC, AOV, LTV, and conversion rate — and small improvements in each compound fast.
- GA4 + server-side tracking tuned for e-commerce event data (purchases, cart, product views)
- Google Shopping, Performance Max, and Meta Ads built for ROAS, not just traffic
- CRO focused on product pages, cart, and checkout — where most revenue is won or lost
- Customer Journey Analytics/CJA for cross-device purchase path analysis
- Looker Studio / BigQuery dashboards unifying ad spend, revenue, and inventory data

We've helped retail brands fix broken attribution and lift conversion rate through structured testing — see our case studies for the numbers.`,
      status: 'published',
      metaTitle: 'E-commerce & Retail Analytics and Marketing | Core Bit Media',
      metaDescription: 'GA4, paid media, and CRO services built for e-commerce and omnichannel retail businesses.',
      aiAnswerSummary: 'Core Bit Media helps e-commerce and retail brands with GA4/server-side tracking, Shopping/Performance Max/Meta Ads, and conversion rate optimization focused on product and checkout pages.'
    },
    {
      slug: 'b2b-saas',
      title: 'B2B & SaaS',
      shortDescription: 'Demand generation, attribution, and product analytics for B2B and SaaS companies with long, multi-touch sales cycles.',
      body: `Analytics and Growth for B2B & SaaS
B2B sales cycles are long and multi-touch, which makes attribution and pipeline visibility the hardest — and most valuable — problem to solve.
- LinkedIn Ads and 6sense-powered ABM for account-level demand generation
- Multi-touch marketing attribution built for long, multi-stakeholder sales cycles
- HubSpot/Salesforce and CRM-integrated reporting connecting marketing spend to closed revenue
- Product analytics (GA4, Adobe Analytics) for PLG and trial-to-paid conversion
- Content strategy and SEO built around high-intent, bottom-of-funnel keywords

If your board asks "which channels actually drove pipeline" and the honest answer is "we're not sure," this is where we start.`,
      status: 'published',
      metaTitle: 'B2B & SaaS Marketing Analytics | Core Bit Media',
      metaDescription: 'ABM, multi-touch attribution, and product analytics for B2B and SaaS companies with long sales cycles.',
      aiAnswerSummary: 'Core Bit Media helps B2B and SaaS companies with ABM (LinkedIn, 6sense), multi-touch attribution for long sales cycles, and CRM-integrated pipeline reporting.'
    },
    {
      slug: 'financial-services',
      title: 'Financial Services',
      shortDescription: 'Compliance-aware analytics and paid media for banks, fintechs, and insurers navigating strict data and advertising regulations.',
      body: `Analytics and Growth for Financial Services
Financial services marketing has to hit growth targets inside real regulatory constraints — data handling, ad platform restrictions, and compliance review.
- Privacy-compliant tracking architecture (server-side, PII-scrubbed) for regulated data
- Google/Meta restricted-category ad campaign management (financial products have special rules)
- Attribution modeling adapted to longer consideration cycles for loans, insurance, and investment products
- Adobe Analytics/AEP implementations for enterprise-grade data governance
- Conversion tracking built to survive compliance review, not just marketing review

We work within your compliance function, not around it.`,
      status: 'published',
      metaTitle: 'Financial Services Marketing Analytics | Core Bit Media',
      metaDescription: 'Compliance-aware analytics, tracking, and paid media strategy for banks, fintechs, and insurers.',
      aiAnswerSummary: 'Core Bit Media provides compliance-aware analytics and paid media services for financial services — privacy-first tracking, restricted-category ad management, and enterprise data governance.'
    },
    {
      slug: 'healthcare',
      title: 'Healthcare',
      shortDescription: 'HIPAA-aware analytics and patient-acquisition marketing for healthcare providers, telehealth, and health-tech companies.',
      body: `Analytics and Growth for Healthcare
Healthcare marketing has to balance genuine patient-acquisition growth with strict privacy requirements around health information.
- HIPAA-aware analytics architecture — no PHI in ad platform pixels or analytics events
- Local SEO and Google Business Profile optimization for provider/location-based search
- Patient journey attribution from first search to appointment booking
- Server-side tracking to keep sensitive query/page data off third-party tags
- Content and AEO strategy for the health questions patients actually search

Growth and compliance aren't a trade-off if the tracking architecture is built correctly from day one.`,
      status: 'published',
      metaTitle: 'Healthcare Marketing Analytics | Core Bit Media',
      metaDescription: 'HIPAA-aware analytics, local SEO, and patient-acquisition marketing for healthcare providers and health-tech.',
      aiAnswerSummary: 'Core Bit Media provides HIPAA-aware analytics and marketing services for healthcare — privacy-safe tracking architecture, local SEO, and patient-journey attribution.'
    },
    {
      slug: 'travel-hospitality',
      title: 'Travel & Hospitality',
      shortDescription: 'Seasonal demand forecasting, booking-funnel analytics, and paid media for hotels, airlines, and travel platforms.',
      body: `Analytics and Growth for Travel & Hospitality
Travel and hospitality marketing lives and dies by booking-funnel conversion and getting seasonal demand timing right.
- Booking funnel analytics — search, dates selected, booking started, booking completed
- Dynamic remarketing for abandoned searches and incomplete bookings
- Seasonal campaign planning built on historical demand and pricing data
- Cross-channel attribution across OTA, direct, and metasearch (Google Hotel Ads, Trivago-style) channels
- Looker Studio dashboards blending booking data, ADR/RevPAR, and marketing spend

We help travel brands know which channel actually drives direct bookings — not just which one shows up first in a report.`,
      status: 'published',
      metaTitle: 'Travel & Hospitality Marketing Analytics | Core Bit Media',
      metaDescription: 'Booking-funnel analytics, dynamic remarketing, and cross-channel attribution for hotels, airlines, and travel platforms.',
      aiAnswerSummary: 'Core Bit Media provides booking-funnel analytics, dynamic remarketing, and cross-channel attribution for travel and hospitality brands.'
    },
    {
      slug: 'education-elearning',
      title: 'Education & E-learning',
      shortDescription: 'Enrollment funnel analytics and paid media for universities, bootcamps, and e-learning platforms competing for student attention.',
      body: `Analytics and Growth for Education & E-learning
From inquiry to enrolled student is a long, multi-touch funnel — one that most education marketers can't fully see end-to-end.
- Enrollment funnel tracking from inquiry/lead through application and enrollment
- Paid search and social campaigns built around program-specific keywords and audiences
- Attribution connecting marketing spend to actual enrollments, not just leads
- Content and SEO strategy targeting high-intent "program + location" search queries
- A/B testing on program pages and application flows to lift completion rate

We've driven measurable enrollment growth for test-prep and postgraduate education brands — see our case studies.`,
      status: 'published',
      metaTitle: 'Education & E-learning Marketing Analytics | Core Bit Media',
      metaDescription: 'Enrollment funnel analytics, paid media, and attribution for universities, bootcamps, and e-learning platforms.',
      aiAnswerSummary: 'Core Bit Media provides enrollment-funnel analytics, paid media, and lead-to-enrollment attribution for education and e-learning brands.'
    },
    {
      slug: 'media-entertainment',
      title: 'Media & Entertainment',
      shortDescription: 'Audience analytics, subscription funnel optimization, and content-driven growth for publishers, streaming, and entertainment brands.',
      body: `Analytics and Growth for Media & Entertainment
Media and entertainment brands compete for attention first, then have to convert that attention into subscriptions or ad revenue.
- Audience analytics — content consumption patterns, session depth, churn signals
- Subscription funnel optimization (trial-to-paid conversion, churn reduction)
- Ad revenue and sponsorship measurement alongside subscription metrics
- SEO and content strategy for discovery-driven traffic
- Cross-platform analytics spanning web, app, and connected TV where relevant

We help media brands understand which content actually drives retention, not just pageviews.`,
      status: 'published',
      metaTitle: 'Media & Entertainment Analytics | Core Bit Media',
      metaDescription: 'Audience analytics, subscription funnel optimization, and content strategy for publishers and streaming brands.',
      aiAnswerSummary: 'Core Bit Media provides audience analytics, subscription-funnel optimization, and content strategy for media, publishing, and entertainment brands.'
    },
    {
      slug: 'manufacturing',
      title: 'Manufacturing',
      shortDescription: 'B2B demand generation and long-cycle attribution for manufacturers selling through complex, multi-stakeholder buying processes.',
      body: `Analytics and Growth for Manufacturing
Manufacturing sales cycles often involve multiple stakeholders, RFQs, and long consideration windows — very different from consumer marketing.
- ABM and LinkedIn-led demand generation targeting procurement and engineering roles
- Attribution modeling built for long, multi-touch, multi-stakeholder B2B cycles
- Website analytics tied to spec-sheet downloads, RFQ submissions, and distributor locators
- SEO for technical, spec-driven search queries and product categories
- CRM-integrated reporting connecting marketing activity to won RFQs/quotes

We build the reporting bridge between "marketing qualified lead" and an actual signed purchase order.`,
      status: 'published',
      metaTitle: 'Manufacturing Marketing Analytics | Core Bit Media',
      metaDescription: 'ABM, long-cycle attribution, and CRM-integrated marketing analytics for manufacturers.',
      aiAnswerSummary: 'Core Bit Media provides ABM, long-cycle B2B attribution, and CRM-integrated marketing analytics for manufacturers.'
    },
    {
      slug: 'automotive',
      title: 'Automotive',
      shortDescription: 'Dealer and OEM analytics connecting online research behavior to showroom visits and vehicle sales.',
      body: `Analytics and Growth for Automotive
Automotive buyers research extensively online before ever visiting a dealership — the hard part is connecting that research to an actual sale.
- Online-to-offline attribution connecting web behavior to showroom visits and sales
- VDP (vehicle detail page) and inventory-search analytics
- Local SEO and Google Business Profile management across dealer locations
- Paid media (Search, Meta, YouTube) built around model-specific and local intent
- Call tracking integration for phone-based lead attribution

We help dealer groups and OEMs see the full path from first search to signed sale.`,
      status: 'published',
      metaTitle: 'Automotive Marketing Analytics | Core Bit Media',
      metaDescription: 'Online-to-offline attribution, local SEO, and paid media analytics for dealers and OEMs.',
      aiAnswerSummary: 'Core Bit Media provides online-to-offline attribution, local SEO, and paid media analytics connecting automotive research behavior to showroom sales.'
    },
    {
      slug: 'consumer-brands',
      title: 'Consumer Brands',
      shortDescription: 'Full-funnel brand and performance marketing analytics for CPG and consumer brands building direct and retail-channel growth.',
      body: `Analytics and Growth for Consumer Brands
Consumer brands increasingly need to prove brand marketing's impact alongside performance marketing's — and connect both to actual sales, whether DTC or retail.
- Brand lift and awareness measurement alongside performance campaign tracking
- DTC e-commerce analytics plus retail-channel/Amazon marketplace measurement
- Social media marketing and influencer campaign attribution
- Cross-channel dashboards unifying paid social, retail media, and DTC revenue data
- Marketing mix modeling for brands balancing upper-funnel and performance spend

We help consumer brands prove that brand investment and performance marketing are working together, not competing for budget.`,
      status: 'published',
      metaTitle: 'Consumer Brands (CPG) Marketing Analytics | Core Bit Media',
      metaDescription: 'Brand lift measurement, DTC and retail-channel analytics, and cross-channel dashboards for consumer brands.',
      aiAnswerSummary: 'Core Bit Media provides brand lift measurement, DTC and retail-channel analytics, and marketing mix modeling for consumer/CPG brands.'
    }
  ];
  for (const data of industries) {
    const [rec] = await Industry.findOrCreate({ where: { slug: data.slug }, defaults: data });
    await rec.update(data);
  }

  // ---- Step 10: case study categories ----
  const caseStudyCategories = [
    ['climbing-the-serp-how-strategic-seo-drove-300-organic-growth', 'marketing'],
    ['precision-metrics-for-strategic-growth-leveraging-adobe-analytics', 'analytics'],
    ['visualizing-success-how-looker-studio-ga4-drove-smarter-campaigns', 'analytics'],
    ['from-clicks-to-conversions-scaling-roi-with-google-facebook-ads-delivered-4x-roas', 'marketing']
  ];
  for (const [slug, category] of caseStudyCategories) {
    const rec = await CaseStudy.findOne({ where: { slug } });
    if (rec) await rec.update({ category });
  }

  // ---- Step 11: delete everything superseded by the new taxonomy ----
  // Old combined pages, now replaced by the split-out pages above.
  const obsoleteServiceSlugs = [
    'ab-testing-vwo-optimizely-adobe-target',
    'paid-ads-ppc',
    'native-ads-platform',
    'orm-online-reputation-management',
    'social-ads',
    'aeo-geo-ai-search-optimization',
    // CRM & Marketing pillar + children — confirmed deletion
    'crm-marketing',
    'hubspot-services',
    'salesforce-marketing-cloud',
    'marketo-services',
    'microsoft-dynamics-365',
    'landing-page-creation',
    'pardot-oracle-eloqua',
    // Old pillar shells, now empty after their children moved to navGroup-based grouping
    'reporting-and-dashboards',
    'analytics-tms',
    'digital-marketing'
  ];
  const deleted = await Service.destroy({ where: { slug: obsoleteServiceSlugs } });

  const summary = `Nav restructure complete. Deleted ${deleted} obsolete services. Created/updated ${industries.length} industries.`;
  console.log(summary);
  return summary;
}

module.exports = { restructureNav };

// Only run immediately (and exit the process) when invoked directly as a
// CLI script (`npm run restructure-nav`) — NOT when required from
// adminMaintenanceRoutes.js, which awaits `restructureNav()` in-process
// inside the already-running server and must never have that server's own
// process torn down by a stray process.exit().
if (require.main === module) {
  restructureNav()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Nav restructure failed:', err);
      process.exit(1);
    });
}
