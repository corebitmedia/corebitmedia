require('dotenv').config();
const { sequelize, Service } = require('../models');

// Restructures the Services taxonomy from 4 top-level nav groups into 6,
// matching the user's own service catalog infographic exactly:
//   1. Analytics Services        (navGroup: 'analytics' — 2 nested pillars:
//                                  Analytics Services + Experimentation & CRO)
//   2. Reporting & Data Solutions (navGroup: 'reporting' — new pillar)
//   3. Conversion & Tracking Solutions (navGroup: 'conversion-tracking' —
//                                  was the "Measurement & Attribution" pillar)
//   4. Paid Advertising Services (navGroup: 'paid-advertising' — was "Paid Media")
//   5. SEO & AI-Driven Discovery Services (navGroup: 'seo-aeo' — was
//                                  "SEO & Organic Growth")
//   6. Web & App Development     (navGroup: 'webdev' — unchanged)
//
// Nothing existing is deleted — every current service keeps its slug (so no
// URLs break) and just gets reassigned to its new navGroup/parentId. Three
// existing pillars get retitled to match the infographic's category names
// (slugs kept, except Measurement & Attribution which also gets a slug
// rename — see MEASUREMENT_NEW_SLUG below). 11 brand-new services fill the
// gaps the infographic has that the site didn't (privacy/consent,
// reporting connectors, native ads, and finer-grained SEO).
const MEDIA = 'https://www.corebitmedia.com/media/uploads';

async function upsertService(data) {
  const [rec] = await Service.findOrCreate({ where: { slug: data.slug }, defaults: data });
  await rec.update(data);
  return rec;
}

async function reassignChildren(parentId, navGroup) {
  await Service.update({ navGroup }, { where: { parentId } });
}

const MEASUREMENT_OLD_SLUG = 'measurement-attribution';
const MEASUREMENT_NEW_SLUG = 'conversion-tracking-solutions';

async function restructureSixCategories() {
  await sequelize.sync();

  // ---- Step 1: Analytics Services — retitle the existing "Analytics"
  // pillar, and fold Experimentation & CRO in as a second nested pillar
  // under the same navGroup (kept as its own real page/content, per "don't
  // remove existing services" — just relocated under a different top-level
  // menu item rather than being its own). ----
  const analyticsPillar = await Service.findOne({ where: { slug: 'analytics' } });
  if (analyticsPillar) {
    await analyticsPillar.update({ title: 'Analytics Services', metaTitle: 'Analytics Services' });
  }

  const experimentationPillar = await Service.findOne({ where: { slug: 'experimentation-cro' } });
  if (experimentationPillar) {
    await experimentationPillar.update({ navGroup: 'analytics' });
    await reassignChildren(experimentationPillar.id, 'analytics');
  }

  // New Analytics Services children filling infographic gaps.
  const analyticsNewChildren = [
    {
      slug: 'google-tag-gateway',
      title: 'Google Tag Gateway',
      shortDescription: "Server-side tag routing through Google's own Tag Gateway — first-party, cookieless-resilient tracking without standing up your own server infrastructure.",
      body: `Why Google Tag Gateway Matters
Google Tag Gateway routes your tags through a first-party endpoint on your own domain, without the infrastructure overhead of running your own server-side GTM container. It's Google's answer to the accuracy problems ad blockers and browser privacy changes created.

What We Offer:
- Google Tag Gateway Setup — first-party endpoint configuration on your own domain
- First-Party Data Routing — tags served from your domain instead of third-party ones
- Secure & Scalable Tracking — Google-managed infrastructure, no servers for your team to maintain
- Consent Mode Support — routing that respects user consent signals end-to-end

Key Benefits:
- Better Data Accuracy — first-party routing recovers data lost to ad blockers and ITP
- No Infrastructure to Manage — Google handles the server-side layer for you
- Consent-Aware by Design — built to work correctly with Consent Mode from day one`,
      metaTitle: 'Google Tag Gateway Setup Services',
      metaDescription: 'Google Tag Gateway implementation for first-party, cookieless-resilient tag routing without managing your own server infrastructure.',
      focusKeyword: 'Google Tag Gateway services',
      aiAnswerSummary: 'Core Bit Media implements Google Tag Gateway for first-party tag routing, improving data accuracy against ad blockers and browser privacy restrictions without server infrastructure overhead.',
      faqSchema: [
        { question: 'What is Google Tag Gateway?', answer: "Google Tag Gateway is Google's managed first-party tag routing service — it serves your tags from your own domain instead of third-party domains, improving accuracy without you having to run your own server-side container." },
        { question: 'How is Tag Gateway different from server-side GTM?', answer: 'Server-side GTM requires you to run and maintain your own cloud infrastructure. Tag Gateway is fully managed by Google, giving similar first-party benefits with less setup and maintenance overhead.' },
        { question: 'Does Tag Gateway work with Consent Mode?', answer: 'Yes — Core Bit Media configures Tag Gateway routing to respect Consent Mode signals so tracking stays compliant with user consent choices.' }
      ]
    },
    {
      slug: 'cookie-consent-data-privacy',
      title: 'Cookie Consent & Data Privacy',
      shortDescription: 'Cookie consent platforms (OneTrust, Cookiebot, Didomi) configured correctly, so your analytics stays both compliant and actually functional.',
      body: `Why Cookie Consent Management Matters
A consent banner that's misconfigured either blocks tracking you're legally allowed to run, or lets tracking fire before consent is given — both are real risks. We configure consent platforms to get this balance right.

What We Offer:
- Consent Platform Implementation — OneTrust, Cookiebot, or Didomi configured for your exact tracking stack
- Consent Management — granular category-based consent (analytics, marketing, functional) wired into your tags
- Privacy by Design — tracking architecture built around consent from the start, not bolted on after
- Compliance Configuration — GDPR, CCPA, and other regional requirements reflected in your actual banner logic

Key Benefits:
- Compliant AND Functional — tracking that respects consent without breaking unnecessarily
- Fewer Legal Risks — consent flows configured against current GDPR/CCPA requirements
- Clean Handoff to Tags — consent state wired directly into GTM/Tag Gateway so nothing fires out of turn`,
      metaTitle: 'Cookie Consent & Data Privacy Services',
      metaDescription: 'OneTrust, Cookiebot, and Didomi consent platform implementation — compliant, granular consent management wired into your tracking stack.',
      focusKeyword: 'cookie consent management services',
      aiAnswerSummary: 'Core Bit Media implements cookie consent platforms (OneTrust, Cookiebot, Didomi) with granular, GDPR/CCPA-compliant consent management wired into the tracking and tagging setup.',
      faqSchema: [
        { question: 'Which consent management platforms does Core Bit Media work with?', answer: 'We implement OneTrust, Cookiebot, and Didomi, chosen based on your existing stack and specific compliance requirements.' },
        { question: 'Will adding a consent banner break my analytics?', answer: "Not if it's configured correctly — we wire consent categories directly into your tags so analytics keeps working for users who consent, while respecting the choices of those who don't." },
        { question: 'Does this cover GDPR and CCPA?', answer: 'Yes — consent flows are configured against both GDPR and CCPA requirements, along with other regional privacy regulations relevant to your audience.' }
      ]
    },
    {
      slug: 'data-privacy-compliance',
      title: 'Data Privacy & Compliance',
      shortDescription: 'Data mapping, retention policy, and privacy impact assessments — the compliance groundwork behind a defensible analytics and marketing data practice.',
      body: `Why Data Privacy & Compliance Matters
Consent banners are only part of the picture — real compliance means knowing what data you collect, where it goes, how long you keep it, and having that documented. We build the compliance layer underneath your analytics stack.

What We Offer:
- Data Mapping & Inventory — a real accounting of what personal data you collect and where it flows
- Data Retention Policies — defined, enforced retention periods across your analytics and marketing platforms
- Privacy Impact Assessments — structured assessments identifying and mitigating privacy risk in your data practices
- Compliance Implementation — turning policy into actual platform configuration, not just a document

Key Benefits:
- Audit-Ready — documentation and mapping that holds up under regulatory scrutiny
- Reduced Risk Exposure — retention and handling practices that limit liability
- Built Into Your Stack — compliance reflected in actual tool configuration, not a shelf document`,
      metaTitle: 'Data Privacy & Compliance Services',
      metaDescription: 'Data mapping, retention policy, and privacy impact assessments to build a defensible, audit-ready data compliance practice.',
      focusKeyword: 'data privacy compliance services',
      aiAnswerSummary: 'Core Bit Media provides data privacy compliance services — data mapping and inventory, retention policy design, privacy impact assessments, and compliance implementation across analytics and marketing platforms.',
      faqSchema: [
        { question: 'What is a data privacy impact assessment?', answer: 'A structured evaluation of how a data practice or system collects, uses, and stores personal data, identifying privacy risks and recommending mitigations before they become compliance problems.' },
        { question: 'Do you help set data retention policies, not just write them?', answer: "Yes — we define retention policy AND implement it in your actual analytics and marketing platforms, so it's enforced, not just documented." },
        { question: 'Is this a one-time project or ongoing?', answer: 'Both are available — an initial data mapping and compliance implementation project, plus ongoing reviews as your data practices and regulations evolve.' }
      ]
    }
  ];
  for (const def of analyticsNewChildren) {
    await upsertService({ ...def, navGroup: 'analytics', parentId: analyticsPillar.id, heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`, status: 'published' });
  }

  // ---- Step 2: Reporting & Data Solutions — new pillar. Absorbs the
  // dashboard/warehouse/platform services that were flat children of
  // Analytics (moved, not duplicated), plus 2 brand-new connector services. ----
  const reportingPillar = await upsertService({
    slug: 'reporting-data-solutions',
    title: 'Reporting & Data Solutions',
    navGroup: 'reporting',
    parentId: null,
    shortDescription: 'Dashboards, data warehousing, and the connectors and integrations that pull every platform into one reliable reporting layer.',
    body: `One Reporting Layer, Not a Dozen Logins
Marketing data scattered across ad platforms, analytics tools, and CRMs is useless until it's actually reportable. We build the dashboards, data warehouse, and connections that turn scattered data into one live reporting layer:
- Looker Studio, Power BI, and Tableau dashboards built around your actual KPIs
- BigQuery data warehousing for scalable, SQL-level analysis
- Supermetrics, Funnel.io, and other connectors automating the data pull
- Adobe Experience Platform and Customer Journey Analytics for unified, cross-channel data
- CRM, ERP, and custom integrations connecting marketing to the rest of the business

If you can't see it in one place, you can't make decisions on it — this is where that gets fixed.

Ready for reporting you can actually trust?`,
    heroImageUrl: `${MEDIA}/2025/07/analytics-banner.jpg`,
    status: 'published',
    metaTitle: 'Reporting & Data Solutions',
    metaDescription: 'Looker Studio, Power BI, Tableau, and BigQuery reporting, plus the connectors and integrations that unify your marketing data.',
    aiAnswerSummary: "Core Bit Media's Reporting & Data Solutions practice covers Looker Studio, Power BI, Tableau, BigQuery, Adobe Experience Platform, and the connectors/integrations that unify marketing data into one reporting layer."
  });

  const reportingMovedSlugs = [
    'looker-studio-dashboards', 'power-bi-dashboards', 'tableau-dashboards',
    'bigquery-for-marketing', 'adobe-experience-platform-aep', 'customer-journey-analytics-cja'
  ];
  for (const slug of reportingMovedSlugs) {
    const rec = await Service.findOne({ where: { slug } });
    if (rec) await rec.update({ navGroup: 'reporting', parentId: reportingPillar.id });
  }

  const reportingNewChildren = [
    {
      slug: 'third-party-connectors',
      title: 'Third-Party Connectors',
      shortDescription: 'Supermetrics, Funnel.io, and other data connectors that pull your ad platform and CRM data into one place for reporting.',
      body: `Why Third-Party Connectors Matter
Your data lives across a dozen different ad platforms, CRMs, and tools — reporting is painful until it's all in one place. Connectors automate that pull so your dashboards stay current without manual exports.

What We Offer:
- Supermetrics Implementation — automated data pulls from ad platforms, CRMs, and more into your reporting tools
- Funnel.io Setup — marketing data consolidated and normalized across every platform you advertise on
- Power My Analytics Configuration — additional connector options matched to your specific platform mix
- Custom Connector Selection — the right tool chosen for your stack, not a one-size-fits-all default

Key Benefits:
- No More Manual Exports — data flows automatically into your dashboards and warehouse
- Unified Reporting — every platform's data normalized into one consistent view
- Scales With Your Stack — connectors added as you adopt new ad platforms or tools`,
      metaTitle: 'Third-Party Data Connectors Services',
      metaDescription: 'Supermetrics, Funnel.io, and other connector implementations to automate marketing data pulls into your reporting stack.',
      focusKeyword: 'third-party data connectors',
      aiAnswerSummary: 'Core Bit Media implements third-party data connectors (Supermetrics, Funnel.io, and similar tools) to automate marketing data pulls from ad platforms and CRMs into unified reporting.',
      faqSchema: [
        { question: 'What is Supermetrics used for?', answer: 'Supermetrics automatically pulls marketing data from ad platforms, CRMs, and other tools into destinations like Looker Studio, Google Sheets, or a data warehouse, removing manual export work.' },
        { question: 'Which connector is right for my business?', answer: 'It depends on your platform mix and reporting destination — we assess your specific stack and recommend Supermetrics, Funnel.io, or another connector accordingly.' },
        { question: 'Can connectors feed into BigQuery?', answer: 'Yes — most connectors we implement can route data into BigQuery or another warehouse, not just spreadsheet-style dashboards.' }
      ]
    },
    {
      slug: 'other-integrations',
      title: 'Other Integrations',
      shortDescription: 'CRM, ERP, and custom platform integrations that connect your marketing data to the rest of your business systems.',
      body: `Why Integrations Matter
Marketing data that stays siloed from your CRM or ERP can't tell you which leads actually became revenue. We build the integrations that connect marketing platforms to the rest of your business systems.

What We Offer:
- CRM Integrations — Salesforce, HubSpot, and other CRMs connected to your marketing and analytics data
- ERP Integrations — marketing data linked to order, fulfillment, and financial systems
- Marketing Platform Integrations — connecting tools across your martech stack so they share data cleanly
- Custom Integration Development — bespoke API integrations when an off-the-shelf connector doesn't exist

Key Benefits:
- Full-Funnel Visibility — marketing data connected all the way through to closed revenue
- No More Data Silos — systems that actually share data instead of operating in isolation
- Built to Your Stack — integrations designed around your specific tools, not a generic template`,
      metaTitle: 'Marketing & CRM Integration Services',
      metaDescription: 'CRM, ERP, and custom marketing platform integrations connecting your marketing data to the rest of your business systems.',
      focusKeyword: 'marketing integration services',
      aiAnswerSummary: "Core Bit Media builds CRM, ERP, and custom marketing platform integrations connecting marketing data to the rest of a business's operational systems.",
      faqSchema: [
        { question: 'Which CRMs can you integrate with?', answer: 'We commonly integrate with Salesforce and HubSpot, along with other CRMs depending on your specific setup.' },
        { question: 'Can you build a custom integration if no connector exists?', answer: "Yes — when there's no off-the-shelf connector for a system you use, we build a custom API integration to bridge it into your marketing data stack." },
        { question: 'Why does connecting marketing data to my CRM matter?', answer: "It's the only way to see which marketing campaigns actually produced closed revenue, not just leads or clicks — without that link, attribution stops at the top of the funnel." }
      ]
    }
  ];
  for (const def of reportingNewChildren) {
    await upsertService({ ...def, navGroup: 'reporting', parentId: reportingPillar.id, heroImageUrl: `${MEDIA}/2025/07/analytics-banner.jpg`, status: 'published' });
  }

  // ---- Step 3: Conversion & Tracking Solutions — was "Measurement &
  // Attribution". Retitled AND re-slugged (a redirect from the old slug is
  // added in frontend/vercel.json) since the infographic's category name is
  // meaningfully different from the old one, not just a synonym. ----
  let conversionPillar = await Service.findOne({ where: { slug: MEASUREMENT_OLD_SLUG } });
  if (!conversionPillar) conversionPillar = await Service.findOne({ where: { slug: MEASUREMENT_NEW_SLUG } });
  if (conversionPillar) {
    await conversionPillar.update({
      slug: MEASUREMENT_NEW_SLUG,
      title: 'Conversion & Tracking Solutions',
      navGroup: 'conversion-tracking',
      metaTitle: 'Conversion & Tracking Solutions'
    });
    await reassignChildren(conversionPillar.id, 'conversion-tracking');
  }

  const conversionNewChildren = [
    {
      slug: 'ecommerce-tracking',
      title: 'E-commerce Tracking',
      shortDescription: 'Enhanced e-commerce tracking across checkout, revenue, and product performance — so every transaction reports accurately back to your ad platforms.',
      body: `Why E-commerce Tracking Matters
Generic pageview tracking can't tell you which products drive revenue or where checkout is leaking customers. Enhanced e-commerce tracking gives you transaction-level accuracy across the entire purchase funnel.

What We Offer:
- Enhanced E-commerce Implementation — full purchase funnel tracked from product view through transaction
- Checkout Behavior Tracking — every step of checkout instrumented to find where customers drop off
- Revenue Attribution — transactions tied back to the campaigns and channels that drove them
- Product Performance Tracking — which products and categories actually convert, not just get viewed

Key Benefits:
- Transaction-Level Accuracy — revenue data your ad platforms and dashboards can actually trust
- Checkout Funnel Visibility — see exactly where customers abandon, not just that they did
- Product-Level Insight — know which products drive revenue, not just traffic`,
      metaTitle: 'E-commerce Tracking Services',
      metaDescription: 'Enhanced e-commerce tracking across checkout, revenue attribution, and product performance for accurate transaction-level reporting.',
      focusKeyword: 'ecommerce tracking services',
      aiAnswerSummary: 'Core Bit Media implements enhanced e-commerce tracking — checkout behavior, revenue attribution, and product performance — for accurate transaction-level reporting.',
      faqSchema: [
        { question: 'What is enhanced e-commerce tracking?', answer: "It's a tracking implementation that captures the full purchase funnel — product views, cart actions, checkout steps, and transactions — rather than just pageviews, giving you revenue and product-level reporting." },
        { question: 'Can this integrate with Google Ads and Meta Ads?', answer: 'Yes — revenue and conversion data is configured to flow back into Google Ads, Meta Ads, and other platforms for accurate ROAS reporting.' },
        { question: 'Does this work for Shopify, WooCommerce, or custom stores?', answer: 'Yes — we implement enhanced e-commerce tracking across major platforms (Shopify, WooCommerce, Magento) as well as custom-built stores.' }
      ]
    },
    {
      slug: 'user-event-tracking',
      title: 'User & Event Tracking',
      shortDescription: 'Custom event tracking for scroll depth, video engagement, site search, and every other interaction that matters to your business.',
      body: `Why User & Event Tracking Matters
Standard analytics setups miss most of what users actually do on your site — scrolling, watching videos, searching, engaging with specific features. Custom event tracking captures the behavior that actually predicts conversion.

What We Offer:
- User Behavior Analysis — understanding how visitors actually move through and use your site
- Scroll, Click & Video Tracking — engagement events instrumented across every content type
- Site Search Tracking — what users search for on your own site, and whether they find it
- Custom Event Tracking — any interaction specific to your business, tracked and reported on

Key Benefits:
- See What Standard Analytics Misses — engagement signals most setups never capture
- Better Segmentation — audiences built around actual behavior, not just pageviews
- Feeds Better Optimization — event data that informs CRO and personalization decisions`,
      metaTitle: 'User & Event Tracking Services',
      metaDescription: 'Custom event tracking for scroll depth, video engagement, site search, and business-specific interactions.',
      focusKeyword: 'event tracking services',
      aiAnswerSummary: 'Core Bit Media implements custom user and event tracking — scroll depth, video engagement, site search, and business-specific interaction tracking — beyond standard pageview analytics.',
      faqSchema: [
        { question: 'What counts as a custom event?', answer: 'Any user interaction beyond a pageview — scroll depth, video plays, button clicks, form interactions, site search queries, or any action specific to your product or site.' },
        { question: 'Why track scroll depth and video engagement?', answer: 'These signals show genuine content engagement rather than just a visit, and often correlate strongly with conversion likelihood — they help you understand what content actually works.' },
        { question: 'Does this feed into segmentation and personalization?', answer: 'Yes — event data captured this way is exactly what powers meaningful audience segments and personalization targeting rather than relying on demographic guesses.' }
      ]
    }
  ];
  for (const def of conversionNewChildren) {
    await upsertService({ ...def, navGroup: 'conversion-tracking', parentId: conversionPillar.id, heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`, status: 'published' });
  }

  // ---- Step 4: Paid Advertising Services — was "Paid Media" (slug kept). ----
  const paidPillar = await Service.findOne({ where: { slug: 'paid-media' } });
  if (paidPillar) {
    await paidPillar.update({ title: 'Paid Advertising Services', navGroup: 'paid-advertising', metaTitle: 'Paid Advertising Services' });
    await reassignChildren(paidPillar.id, 'paid-advertising');
  }

  await upsertService({
    slug: 'native-ads',
    title: 'Native Ads',
    navGroup: 'paid-advertising',
    parentId: paidPillar.id,
    heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`,
    status: 'published',
    shortDescription: 'Taboola and Outbrain native advertising campaigns that blend into content, driving discovery without feeling like an interruption.',
    body: `Why Native Advertising Matters
Native ads earn attention by matching the look and feel of the content around them instead of interrupting it — a real complement to search and social when you want to reach people earlier in their research, before they're actively searching.

What We Offer:
- Taboola & Outbrain Campaign Management — full setup and ongoing optimization across both networks
- Native Campaign Creative — content-matched creative built to perform in a native placement, not repurposed display ads
- Audience & Placement Targeting — publisher and audience targeting tuned to your actual customer profile
- Performance Tracking — conversion tracking wired in so native spend is measured to the same standard as every other channel

Key Benefits:
- Reach Earlier in the Funnel — native placements catch users in a content-discovery mindset
- Content-Native Creative — ads built to fit their placement, not just resized banners
- Measured Like Every Channel — the same conversion tracking rigor as Google, Meta, and LinkedIn Ads`,
    metaTitle: 'Native Advertising Services',
    metaDescription: 'Taboola and Outbrain native advertising campaign management, creative, and performance tracking.',
    focusKeyword: 'native advertising services',
    aiAnswerSummary: 'Core Bit Media manages native advertising campaigns on Taboola and Outbrain, including content-matched creative and conversion tracking.',
    faqSchema: [
      { question: 'What is native advertising?', answer: 'Native advertising places ads that match the form and function of the content around them — usually shown as recommended-content widgets on publisher sites — rather than traditional banner ads.' },
      { question: 'Which native ad networks does Core Bit Media manage?', answer: 'We manage campaigns on Taboola and Outbrain, the two largest native advertising networks.' },
      { question: 'Is native advertising tracked the same way as Google or Meta Ads?', answer: 'Yes — we wire the same conversion tracking standards into native campaigns so performance is measured consistently across every paid channel.' }
    ]
  });

  // ---- Step 5: SEO & AI-Driven Discovery Services — was "SEO & Organic
  // Growth" (slug kept). "SEO" gets retitled to "On-Page & Content SEO" to
  // match the infographic's naming (slug kept — same page, clearer title). ----
  const seoPillar = await Service.findOne({ where: { slug: 'seo-organic-growth' } });
  if (seoPillar) {
    await seoPillar.update({ title: 'SEO & AI-Driven Discovery Services', navGroup: 'seo-aeo', metaTitle: 'SEO & AI-Driven Discovery Services' });
    await reassignChildren(seoPillar.id, 'seo-aeo');
  }

  const onPageSeo = await Service.findOne({ where: { slug: 'seo-consulting' } });
  if (onPageSeo) await onPageSeo.update({ title: 'On-Page & Content SEO', metaTitle: 'On-Page & Content SEO Services' });

  const seoNewChildren = [
    {
      slug: 'off-page-authority',
      title: 'Off-Page & Authority',
      shortDescription: 'Backlink strategy, digital PR, and authority building — the off-site signals search engines and AI answer engines both weigh heavily.',
      body: `Why Off-Page Authority Matters
On-page optimization only gets you so far — search engines (and increasingly, AI answer engines) weigh how the rest of the internet talks about and links to you just as heavily. Off-page work builds that external credibility.

What We Offer:
- Backlink Strategy — a structured link-building plan targeting relevant, authoritative domains
- Brand Mention Building — earned and structured mentions across relevant publications and communities
- Digital PR — press and content outreach designed to earn coverage and links at once
- Authority Building — the sustained work of establishing your site as a trusted source in your niche

Key Benefits:
- Real Authority, Not Shortcuts — links and mentions earned from relevant, credible sources
- Compounds Over Time — authority built this way keeps paying off well after the campaign ends
- Feeds AI Citation Too — the same signals that build search authority increasingly influence AI answer engine trust`,
      metaTitle: 'Off-Page SEO & Authority Building Services',
      metaDescription: 'Backlink strategy, digital PR, and authority building to strengthen off-site SEO and AI answer engine trust signals.',
      focusKeyword: 'off-page SEO services',
      aiAnswerSummary: 'Core Bit Media provides off-page SEO services — backlink strategy, digital PR, and authority building — to strengthen the external trust signals search engines and AI answer engines use.',
      faqSchema: [
        { question: 'What is off-page SEO?', answer: "Off-page SEO covers everything that builds your site's authority from outside your own site — backlinks, brand mentions, and digital PR — as opposed to on-page factors like content and technical structure." },
        { question: 'How does digital PR help SEO?', answer: 'Digital PR earns press coverage and editorial mentions that often include backlinks, building authority and referral traffic at the same time.' },
        { question: 'Does off-page authority affect AI search visibility too?', answer: "Yes — AI answer engines like ChatGPT and Google AI Overviews weigh a site's external authority and citations similarly to how traditional search ranking does." }
      ]
    },
    {
      slug: 'local-multi-location-seo',
      title: 'Local & Multi-Location SEO',
      shortDescription: 'Google Business Profile optimization, local citations, and review management for businesses competing in local and multi-location search.',
      body: `Why Local SEO Matters
For any business with a physical location — or several — local search is often the highest-intent traffic you can get. Local SEO makes sure you show up, and look credible, when nearby customers are searching.

What We Offer:
- Google Business Profile Optimization — complete, accurate, and actively managed profiles for every location
- Local Citation Building — consistent business listings across the directories that matter for local ranking
- Review Management — a system for generating, responding to, and leveraging customer reviews
- Multi-Location Strategy — scalable local SEO across dozens or hundreds of locations, not just one

Key Benefits:
- Show Up Where It Counts — visibility in local pack and maps results for high-intent searches
- Consistent Across Every Location — no citation or listing inconsistencies dragging down rankings
- Reviews Working For You — a steady flow of reviews that build trust and improve local ranking`,
      metaTitle: 'Local SEO & Multi-Location SEO Services',
      metaDescription: 'Google Business Profile optimization, local citations, and review management for local and multi-location search visibility.',
      focusKeyword: 'local SEO services',
      aiAnswerSummary: 'Core Bit Media provides local and multi-location SEO — Google Business Profile optimization, citation building, and review management — for businesses competing in local search.',
      faqSchema: [
        { question: 'What is included in Google Business Profile optimization?', answer: 'Complete profile setup, accurate business information, category and service selection, photos, posts, and ongoing management to keep the profile active and accurate.' },
        { question: 'How do you handle SEO for businesses with many locations?', answer: 'We build a scalable local SEO process — templated but locally accurate Business Profiles, consistent citations, and location-specific landing pages — that works whether you have 5 locations or 500.' },
        { question: 'Does review management include responding to reviews?', answer: 'Yes — we set up a system for generating new reviews and for monitoring and responding to reviews, both positive and negative.' }
      ]
    },
    {
      slug: 'seo-reporting-insights',
      title: 'SEO Reporting Insights',
      shortDescription: "Rank tracking, traffic analysis, and clear reporting that turns SEO performance into decisions, not just a spreadsheet of keyword positions.",
      body: `Why SEO Reporting Matters
A list of keyword rankings doesn't tell you if SEO is actually working. Real SEO reporting connects rankings, traffic, and conversions into a clear picture of what's driving results — and what to do next.

What We Offer:
- Rank Tracking — accurate, ongoing tracking of your target keywords across search engines
- Traffic Analysis — organic traffic trends broken down by page, query, and intent
- SEO Performance Reporting — rankings and traffic connected to actual conversions and revenue
- Actionable Insights — reporting that ends in recommendations, not just numbers

Key Benefits:
- Beyond Vanity Metrics — reporting tied to conversions, not just keyword position
- Clear Monthly Visibility — consistent reporting your team can actually act on
- Informs the Next Move — insights that directly shape the next SEO priority`,
      metaTitle: 'SEO Reporting & Analytics Services',
      metaDescription: 'Rank tracking, traffic analysis, and actionable SEO reporting connecting rankings to real conversions.',
      focusKeyword: 'SEO reporting services',
      aiAnswerSummary: 'Core Bit Media provides SEO reporting — rank tracking, traffic analysis, and performance reporting tied to conversions — with actionable recommendations, not just raw metrics.',
      faqSchema: [
        { question: 'What does SEO reporting typically include?', answer: 'Keyword rank tracking, organic traffic analysis, and performance reporting that connects both to actual conversions — plus clear recommendations based on the data.' },
        { question: 'How often will I receive SEO reports?', answer: 'Monthly reporting is standard, with more frequent check-ins available for active campaigns or significant ranking changes.' },
        { question: 'Can you report on both traditional SEO and AI search visibility?', answer: 'Yes — reporting can include traditional rank tracking alongside AI answer engine visibility (AEO/GEO) as that becomes a bigger part of overall search performance.' }
      ]
    }
  ];
  for (const def of seoNewChildren) {
    await upsertService({ ...def, navGroup: 'seo-aeo', parentId: seoPillar.id, heroImageUrl: `${MEDIA}/2025/06/hero-1-bg-1.jpg`, status: 'published' });
  }

  return 'Restructured into 6 categories: Analytics Services (+ Experimentation & CRO nested), Reporting & Data Solutions (new), Conversion & Tracking Solutions, Paid Advertising Services (+Native Ads), SEO & AI-Driven Discovery Services, Web & App Development. 11 new services created, 0 deleted.';
}

if (require.main === module) {
  restructureSixCategories()
    .then((summary) => { console.log(summary); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { restructureSixCategories };
