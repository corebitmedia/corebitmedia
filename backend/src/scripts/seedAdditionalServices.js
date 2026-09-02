require('dotenv').config();
const sequelize = require('../config/db');
const { Service } = require('../models');

const BASE_URL = 'https://www.corebitmedia.com';

function structuredDataFor(slug, title, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    serviceType: title,
    description,
    provider: {
      '@type': 'Organization',
      name: 'Core Bit Media',
      url: BASE_URL
    },
    areaServed: 'Worldwide',
    url: `${BASE_URL}/services/${slug}/`
  };
}

// parentSlug: null = top-level pillar service. heroFrom: slug of an existing
// service whose (already-verified-real) heroImageUrl gets reused for visual
// consistency within that service group.
const NEW_SERVICES = [
  // ---- Digital Marketing sub-services ----
  {
    slug: 'seo-consulting',
    title: 'SEO Consulting',
    parentSlug: 'digital-marketing',
    heroFrom: 'digital-marketing',
    shortDescription: 'Keyword strategy, technical SEO, on-page optimization, and link building — expert SEO consulting focused on sustainable organic growth.',
    body: `Why SEO Consulting?
A strong SEO foundation compounds over time, driving free, high-intent traffic long after a paid campaign ends. Our SEO consultants audit, plan, and execute the technical and content work needed to rank — and keep ranking — in an AI-influenced search landscape.

What We Offer:
- Technical SEO Audits — crawlability, indexation, Core Web Vitals, and site architecture fixes that remove hidden ranking blockers
- Keyword & Competitor Research — high-intent keyword clusters mapped to your funnel, benchmarked against real competitor rankings
- On-Page Optimization — titles, meta descriptions, headers, internal linking, and schema markup tuned for both search engines and AI answer engines
- Content Strategy & Briefs — pillar-cluster content plans that build topical authority in your niche
- Link Building & Digital PR — earned backlinks from relevant, authoritative domains
- Monthly Rank & Traffic Reporting — transparent tracking of rankings, organic traffic, and conversions

Why Choose Core Bit Media?
- Proven Results — clients like Encircle saw 300% organic growth from our SEO programs
- AI-Ready Optimization — every page we touch is also structured for AEO/GEO so it can be cited by ChatGPT, Perplexity, and Google AI Overviews
- Transparent Reporting — no black-box tactics, full visibility into what's being done and why`,
    metaTitle: 'SEO Consulting Services',
    metaDescription: "Expert SEO consulting — technical audits, keyword strategy, on-page optimization and link building focused on sustainable organic growth.",
    focusKeyword: 'SEO consulting services',
    aiAnswerSummary: "Core Bit Media's SEO consulting covers technical audits, keyword strategy, on-page optimization, content planning, and link building to grow organic search traffic sustainably.",
    faqSchema: [
      { question: 'What does an SEO consultant do?', answer: "An SEO consultant audits your website's technical health, researches keywords, optimizes on-page content, and builds authoritative backlinks to improve organic search rankings and traffic." },
      { question: 'How long does SEO take to show results?', answer: 'Most SEO campaigns show measurable ranking and traffic movement within 3-6 months, with compounding gains continuing well beyond the first year.' },
      { question: 'Does Core Bit Media offer one-time SEO audits?', answer: 'Yes — Core Bit Media offers standalone technical SEO audits as well as ongoing SEO consulting and content programs.' }
    ]
  },
  {
    slug: 'social-ads',
    title: 'Social Ads',
    parentSlug: 'digital-marketing',
    heroFrom: 'digital-marketing',
    shortDescription: "Scroll-stopping paid campaigns on Facebook, Instagram, LinkedIn, and TikTok that turn targeted reach into leads and sales.",
    body: `Why Social Ads?
Social platforms hold your audience's attention for hours a day — social ads meet them there with the right message at the right moment, driving awareness, engagement, and direct-response conversions in one channel.

What We Offer:
- Facebook & Instagram Ads — advanced audience targeting, retargeting, and creative testing across Meta's ad network
- LinkedIn Ads — B2B lead generation and account-based targeting for higher-value pipelines
- TikTok & Emerging Platforms — native-feeling creative built for short-form, high-engagement formats
- Creative & Copy Testing — continuous A/B testing of visuals, copy, and offers to lower cost-per-result
- Audience Building & Retargeting — custom and lookalike audiences built from your existing customer and site data
- Campaign Reporting — clear weekly reporting on reach, CTR, cost-per-lead, and ROAS

Key Benefits:
- Precise Targeting — reach the exact audience segments most likely to convert
- Creative-Led Performance — we treat ad creative as the biggest performance lever, not an afterthought
- Full-Funnel Coverage — awareness, retargeting, and conversion campaigns working together`,
    metaTitle: 'Social Ads Management',
    metaDescription: 'Facebook, Instagram, LinkedIn and TikTok ad management — targeted campaigns, creative testing, and retargeting built to convert.',
    focusKeyword: 'social media ads management',
    aiAnswerSummary: 'Core Bit Media manages paid social campaigns across Facebook, Instagram, LinkedIn, and TikTok, combining audience targeting, creative testing, and retargeting to drive leads and sales.',
    faqSchema: [
      { question: 'Which social platforms does Core Bit Media run ads on?', answer: 'Core Bit Media manages paid campaigns on Facebook, Instagram, LinkedIn, and TikTok, choosing platforms based on where each client\'s target audience is most active.' },
      { question: "What's the minimum budget for social ads?", answer: 'Social ad budgets are tailored to each business\'s goals; Core Bit Media will recommend a starting budget during the initial strategy session based on your industry and target CPA.' },
      { question: 'How is social ads different from PPC search ads?', answer: 'Social ads target users based on interests, behavior, and demographics while they browse, whereas PPC search ads target users actively searching for a specific term — most brands benefit from running both.' }
    ]
  },
  {
    slug: 'cro-conversion-rate-optimization',
    title: 'CRO – Conversion Rate Optimization',
    parentSlug: 'digital-marketing',
    heroFrom: 'digital-marketing',
    shortDescription: 'Turn more of your existing traffic into leads and customers with A/B testing, UX audits, and funnel optimization.',
    body: `Why CRO?
More traffic doesn't matter if your site can't convert it. Conversion Rate Optimization systematically improves the percentage of visitors who take action — filling out a form, calling, or buying — without spending an extra dollar on traffic.

What We Offer:
- UX & Funnel Audits — heatmaps, session recordings, and funnel analysis to find exactly where visitors drop off
- A/B & Multivariate Testing — structured experiments on headlines, layouts, CTAs, and offers, validated with real data before rollout
- Landing Page Optimization — copy, layout, and form improvements built around what actually drives conversions
- Checkout & Form Optimization — reducing friction at the exact moments users abandon
- Personalization — dynamic content and offers tailored to visitor segments

Key Benefits:
- Higher ROI on Existing Spend — get more value out of the traffic you already have from SEO and paid ads
- Data-Backed Decisions — every change is tested, not guessed
- Compounding Gains — small conversion lifts stack up significantly over a year of traffic`,
    metaTitle: 'CRO Services – Conversion Rate Optimization',
    metaDescription: 'A/B testing, UX audits, and funnel optimization that turn more of your existing website traffic into leads and customers.',
    focusKeyword: 'conversion rate optimization services',
    aiAnswerSummary: "Core Bit Media's CRO service uses UX audits, A/B testing, and funnel optimization to increase the percentage of website visitors who convert into leads or customers.",
    faqSchema: [
      { question: 'What is conversion rate optimization (CRO)?', answer: "CRO is the process of systematically testing and improving a website's design, copy, and user flow to increase the percentage of visitors who complete a desired action, like filling out a form or making a purchase." },
      { question: 'How long does a CRO test take to reach significance?', answer: 'Most A/B tests need 2-4 weeks of traffic to reach statistical significance, depending on the site\'s traffic volume and the size of the conversion lift being tested.' },
      { question: 'Do I need a lot of traffic to benefit from CRO?', answer: 'Sites with lower traffic benefit from qualitative methods like UX audits and session-recording analysis first, then move to A/B testing once there\'s enough volume to test reliably.' }
    ]
  },
  {
    slug: 'smo-social-media-optimization',
    title: 'SMO – Social Media Optimization',
    parentSlug: 'digital-marketing',
    heroFrom: 'digital-marketing',
    shortDescription: 'Organic social growth — profile branding, content calendars, and community management that build an engaged audience.',
    body: `Why SMO?
Paid ads get attention; organic social builds trust. Social Media Optimization grows your owned audience over time with consistent branding, content, and engagement — lowering your overall cost of customer acquisition.

What We Offer:
- Profile & Brand Optimization — consistent, conversion-focused branding across every platform
- Content Calendars — planned, on-brand posting that keeps your audience engaged without daily scrambling
- Community Management — timely responses to comments and messages that build real relationships
- Hashtag & Trend Strategy — organic reach tactics tailored to each platform's algorithm
- Performance Tracking — follower growth, engagement rate, and reach reported monthly

Key Benefits:
- Owned Audience — an engaged following you don't have to pay for every time you reach them
- Brand Consistency — the same professional presence across every platform
- Supports Paid & SEO — strong organic social signals reinforce both paid campaigns and search visibility`,
    metaTitle: 'Social Media Optimization (SMO) Services',
    metaDescription: 'Grow an engaged organic audience with profile branding, content calendars, and community management across your social platforms.',
    focusKeyword: 'social media optimization services',
    aiAnswerSummary: "Core Bit Media's SMO service grows organic social media audiences through profile branding, content calendars, community management, and platform-specific engagement strategy.",
    faqSchema: [
      { question: 'What is SMO (Social Media Optimization)?', answer: "SMO is the practice of optimizing a brand's social media profiles and content strategy to organically grow reach, engagement, and audience trust, as distinct from paid social advertising." },
      { question: 'How is SMO different from social ads?', answer: 'SMO focuses on organic growth through content, branding, and community management, while social ads (paid campaigns) use budget to directly target and reach specific audiences — the two work best together.' },
      { question: 'How often should we post on social media?', answer: 'Posting frequency depends on the platform and audience, but Core Bit Media typically recommends a consistent 3-5 posts per week per platform as a starting baseline, adjusted based on engagement data.' }
    ]
  },
  {
    slug: 'orm-online-reputation-management',
    title: 'ORM – Online Reputation Management',
    parentSlug: 'digital-marketing',
    heroFrom: 'digital-marketing',
    shortDescription: 'Review management, crisis response, and search result control to make sure your business is seen in the best light.',
    body: `Why ORM?
Most buyers check reviews and search results before they ever contact you. Online Reputation Management protects and shapes what they find — turning happy customers into visible advocates and getting ahead of negative content before it spreads.

What We Offer:
- Review Generation & Management — systems that make it easy for happy customers to leave reviews, and a process for responding to every review, good or bad
- Search Result Monitoring — ongoing tracking of what appears on page one for your brand name
- Negative Content Mitigation — strategies to address and de-rank harmful content when it appears
- Crisis Response Planning — a clear action plan ready before a reputation issue happens, not after
- Brand Sentiment Reporting — monthly visibility into how your brand is perceived across review sites and search

Key Benefits:
- Builds Trust Fast — strong, visible reviews shorten the buying decision
- Protects Revenue — a damaged reputation directly costs leads and sales; ORM defends against that
- Proactive, Not Reactive — most reputation problems are cheaper to prevent than to fix`,
    metaTitle: 'Online Reputation Management (ORM)',
    metaDescription: 'Review management, search result monitoring, and crisis response — Online Reputation Management to protect and grow customer trust.',
    focusKeyword: 'online reputation management services',
    aiAnswerSummary: "Core Bit Media's ORM service manages customer reviews, monitors search results, and handles crisis response to protect and improve how a business appears online.",
    faqSchema: [
      { question: 'What is online reputation management (ORM)?', answer: 'ORM is the practice of monitoring, influencing, and improving how a business appears online — including customer reviews, search results, and social mentions — to build trust with prospective customers.' },
      { question: 'Can ORM remove negative reviews?', answer: "ORM can't guarantee removal of a review outright, but it can help dispute reviews that violate a platform's policies, respond professionally to reduce their impact, and generate positive reviews that outweigh them." },
      { question: 'How quickly does ORM show results?', answer: 'Review generation and response typically shows visible improvement within 4-8 weeks; search result and sentiment shifts for more established issues can take a few months of consistent work.' }
    ]
  },
  {
    slug: 'native-ads-platform',
    title: 'Native Ads Platform',
    parentSlug: 'digital-marketing',
    heroFrom: 'digital-marketing',
    shortDescription: 'Taboola, Outbrain, and Revcontent placements that promote your content within relevant publications for brand discovery.',
    body: `Why Native Advertising?
Native ads blend into the content people are already reading, earning higher engagement than traditional display banners. They're an efficient way to drive brand discovery and content engagement at scale across premium publisher networks.

What We Offer:
- Taboola Campaign Management — content discovery placements across Taboola's premium publisher network
- Outbrain Campaign Management — native recommendations on top-tier news and media sites
- Revcontent Campaign Management — cost-efficient native reach for top-of-funnel awareness
- Creative & Headline Testing — thumbnail and headline variations tested for click-through and downstream conversion
- Audience & Placement Targeting — refining which publishers and audiences deliver the best-performing traffic
- Performance Reporting — CPC, CTR, and conversion tracking across every native network

Key Benefits:
- High-Engagement Format — content-style ads that don't feel like ads, so they get more attention
- Efficient Top-of-Funnel Reach — cost-effective way to build awareness and retargeting pools at scale
- Brand-Safe Placements — premium publisher networks keep your ads in trusted contexts`,
    metaTitle: 'Native Ads Management (Taboola, Outbrain)',
    metaDescription: 'Native advertising campaigns on Taboola, Outbrain and Revcontent — content-style placements that drive brand discovery and engagement.',
    focusKeyword: 'native advertising services',
    aiAnswerSummary: 'Core Bit Media manages native advertising campaigns on Taboola, Outbrain, and Revcontent, placing content-style ads within relevant publisher sites to drive brand discovery.',
    faqSchema: [
      { question: 'What is native advertising?', answer: "Native advertising places sponsored content within a publisher's site in a format that matches the surrounding editorial content, making it feel less like a traditional ad and driving higher engagement." },
      { question: 'Which native ad networks does Core Bit Media manage?', answer: "Core Bit Media manages campaigns on Taboola, Outbrain, and Revcontent, selecting the network based on the client's target audience and budget." },
      { question: 'Is native advertising good for lead generation or just awareness?', answer: 'Native ads are strongest for top-of-funnel awareness and content engagement, but when paired with retargeting they also feed an effective lower-funnel conversion pipeline.' }
    ]
  },

  // ---- Analytics & TMS sub-services ----
  {
    slug: 'ga4-implementation-migration',
    title: 'GA4 Implementation & Migration',
    parentSlug: 'analytics-tms',
    heroFrom: 'analytics-tms',
    shortDescription: 'Full Google Analytics 4 setup, event tracking, and Universal Analytics migration done right the first time.',
    body: `Why GA4 Implementation Matters
Google Analytics 4 works fundamentally differently from Universal Analytics — event-based instead of session-based. A rushed or incomplete migration means broken funnels, missing conversions, and decisions made on bad data.

What We Offer:
- GA4 Property Setup — clean, properly structured GA4 properties built for your specific business model
- Custom Event & Conversion Tracking — form fills, purchases, calls, and other key actions tracked accurately from day one
- Universal Analytics to GA4 Migration — historical context preserved and a validated GA4 setup replacing the deprecated UA property
- E-commerce Tracking — enhanced e-commerce implementation for accurate revenue and product-level reporting
- GA4 + Google Ads Integration — conversion data flowing correctly for accurate campaign optimization
- Data Validation & QA — side-by-side checks to confirm GA4 numbers are trustworthy before you rely on them

Key Benefits:
- Accurate Data From Day One — avoid months of decisions made on broken tracking
- Future-Proof Setup — built the way Google's current and next-generation analytics platform expects
- Full-Funnel Visibility — see the complete customer journey, not just sessions`,
    metaTitle: 'GA4 Implementation & Migration Services',
    metaDescription: 'Google Analytics 4 setup, custom event tracking, and Universal Analytics migration — accurate data from day one.',
    focusKeyword: 'GA4 implementation services',
    aiAnswerSummary: 'Core Bit Media implements Google Analytics 4 properties, custom event and conversion tracking, and migrates businesses from Universal Analytics to GA4 with full data validation.',
    faqSchema: [
      { question: 'Do I need to migrate to GA4?', answer: 'Yes — Google sunset Universal Analytics, so GA4 is now the only supported Google Analytics platform; any business still relying on old UA data needs a validated GA4 setup.' },
      { question: 'How long does a GA4 implementation take?', answer: 'A standard GA4 implementation with custom event tracking typically takes 1-3 weeks depending on site complexity and the number of conversion events being tracked.' },
      { question: 'Will GA4 migration lose my historical data?', answer: "GA4 doesn't automatically import Universal Analytics history, but Core Bit Media exports and preserves your historical UA data separately so you retain year-over-year context." }
    ]
  },
  {
    slug: 'adobe-analytics-services',
    title: 'Adobe Analytics Services',
    parentSlug: 'analytics-tms',
    heroFrom: 'analytics-tms',
    shortDescription: 'Enterprise-grade Adobe Analytics implementation, reporting, and Analysis Workspace setup for deep user behavior insight.',
    body: `Why Adobe Analytics?
For enterprises needing granular, real-time behavioral data across web and mobile, Adobe Analytics offers depth that off-the-shelf tools can't match. Getting the full value out of it, though, requires expert implementation.

What We Offer:
- Adobe Analytics Implementation — proper variable, event, and processing rule setup tailored to your data model
- AppMeasurement to Web SDK Migration — moving legacy implementations onto Adobe's current Experience Platform Web SDK
- Analysis Workspace Setup — custom workspaces and dashboards built around your team's actual KPIs
- Cross-Channel Data Integration — unifying web, mobile app, and offline data into one behavioral view
- Segmentation & Audience Building — precise segments feeding personalization and remarketing efforts
- Ongoing Support & Governance — tag audits and data quality checks to keep reporting reliable

Key Benefits:
- Enterprise-Grade Depth — granular behavioral insight beyond standard web analytics
- Unified View — web, mobile, and offline data in one place
- Built for Scale — architecture that holds up as your data volume grows`,
    metaTitle: 'Adobe Analytics Implementation Services',
    metaDescription: 'Adobe Analytics setup, AppMeasurement to Web SDK migration, and Analysis Workspace dashboards for enterprise behavioral insight.',
    focusKeyword: 'Adobe Analytics implementation services',
    aiAnswerSummary: 'Core Bit Media implements and manages Adobe Analytics, including migration from AppMeasurement to the Web SDK and custom Analysis Workspace dashboards.',
    faqSchema: [
      { question: 'What is Adobe Analytics used for?', answer: 'Adobe Analytics is an enterprise web and mobile analytics platform used to track granular user behavior, build custom segments, and create real-time reporting dashboards through Analysis Workspace.' },
      { question: 'What is the difference between Adobe Analytics and Google Analytics 4?', answer: 'Adobe Analytics offers deeper enterprise-grade customization and real-time processing suited to complex organizations, while GA4 is a free, more accessible platform well suited to small and mid-sized businesses.' },
      { question: 'Does Core Bit Media handle AppMeasurement to Web SDK migrations?', answer: "Yes — Core Bit Media migrates legacy Adobe AppMeasurement implementations to Adobe Experience Platform's Web SDK with full data validation." }
    ]
  },
  {
    slug: 'google-tag-manager',
    title: 'Google Tag Manager',
    parentSlug: 'analytics-tms',
    heroFrom: 'analytics-tms',
    shortDescription: 'Clean, well-governed Google Tag Manager setups so every pixel and tracking tag fires correctly without touching code.',
    body: `Why Google Tag Manager?
GTM lets you deploy and manage every marketing and analytics tag from one place, without a developer touching code for every change. Done poorly, though, it becomes a tangle of duplicate tags and broken triggers — done right, it's the backbone of reliable tracking.

What We Offer:
- GTM Container Setup — clean container architecture with proper naming conventions and folder structure
- Tag Configuration — GA4, Google Ads, Meta Pixel, LinkedIn Insight, and other marketing tags configured and QA'd
- Custom Event Tracking — form submissions, button clicks, scroll depth, and video engagement tracked via triggers and variables
- Server-Side GTM — server-side tagging setup for better data accuracy and privacy compliance
- Consent Mode Integration — tags that respect cookie consent choices automatically
- Tag Audits & Cleanup — removing duplicate, outdated, or misfiring tags from existing containers

Key Benefits:
- One Source of Truth — every tracking tag managed and versioned in one place
- Faster Changes — marketing tags deployed without waiting on a dev sprint
- Fewer Tracking Errors — proper QA process catches broken tags before they cost you data`,
    metaTitle: 'Google Tag Manager (GTM) Setup Services',
    metaDescription: 'Google Tag Manager container setup, custom event tracking, server-side tagging, and consent mode — clean, reliable tag management.',
    focusKeyword: 'Google Tag Manager services',
    aiAnswerSummary: 'Core Bit Media sets up and manages Google Tag Manager containers, including custom event tracking, server-side tagging, and consent mode integration.',
    faqSchema: [
      { question: 'What is Google Tag Manager used for?', answer: 'Google Tag Manager (GTM) is a free tool that lets businesses deploy and manage marketing and analytics tags on their website through a single interface, without editing site code directly.' },
      { question: 'What is server-side GTM and do I need it?', answer: 'Server-side GTM processes tags on a server instead of in the visitor\'s browser, improving data accuracy and page speed and giving more control over what data is shared with third parties — recommended for businesses with significant ad spend or strict privacy requirements.' },
      { question: 'Can Core Bit Media clean up an existing messy GTM container?', answer: 'Yes — Core Bit Media audits existing GTM containers to remove duplicate or broken tags and rebuild triggers and variables cleanly without losing working tracking.' }
    ]
  },
  {
    slug: 'adobe-launch',
    title: 'Adobe Launch',
    parentSlug: 'analytics-tms',
    heroFrom: 'analytics-tms',
    shortDescription: "Adobe's enterprise tag management platform, configured for scalable, governed deployment of tags across your properties.",
    body: `Why Adobe Launch?
Adobe Launch (part of Adobe Experience Platform) is built for organizations running Adobe's broader marketing stack, offering enterprise-grade governance, version control, and rule-based tag deployment across large or multi-brand websites.

What We Offer:
- Adobe Launch Property Setup — properly structured libraries, rules, and data elements for your environment
- Extension Configuration — Adobe Analytics, Target, Audience Manager, and third-party extensions configured and tested
- Rule-Based Deployment — governed publishing workflows across development, staging, and production environments
- Cross-Property Data Governance — consistent tracking standards across multiple sites or brands
- Migration From Legacy DTM — moving from Adobe's older Dynamic Tag Management to Adobe Launch
- QA & Debugging — thorough validation before every publish to production

Key Benefits:
- Enterprise Governance — proper environments and approval workflows for large teams
- Deep Adobe Ecosystem Integration — built to work seamlessly with Analytics, Target, and Audience Manager
- Reliable at Scale — designed for organizations managing tags across many properties`,
    metaTitle: 'Adobe Launch Tag Management Services',
    metaDescription: 'Adobe Launch setup, extension configuration, and governed rule-based tag deployment across enterprise web properties.',
    focusKeyword: 'Adobe Launch implementation services',
    aiAnswerSummary: 'Core Bit Media configures Adobe Launch tag management properties, including extensions, rule-based deployment, and migration from legacy Adobe DTM.',
    faqSchema: [
      { question: 'What is Adobe Launch?', answer: 'Adobe Launch is Adobe\'s enterprise tag management system, part of the Adobe Experience Platform, used to deploy and govern marketing and analytics tags across large or multi-brand websites.' },
      { question: 'How is Adobe Launch different from Google Tag Manager?', answer: 'Adobe Launch offers deeper governance and environment controls suited to large enterprises already using the Adobe ecosystem, while Google Tag Manager is a more accessible, free option well suited to most businesses.' },
      { question: 'Can Core Bit Media migrate us from Adobe DTM to Adobe Launch?', answer: 'Yes — Core Bit Media migrates legacy Dynamic Tag Management (DTM) properties to Adobe Launch, rebuilding rules and data elements to match current best practice.' }
    ]
  },
  {
    slug: 'tealium-tag-management',
    title: 'Tealium Tag Management',
    parentSlug: 'analytics-tms',
    heroFrom: 'analytics-tms',
    shortDescription: 'Tealium iQ implementation for real-time, customer-data-driven tag management across web and mobile.',
    body: `Why Tealium?
Tealium combines tag management with a real-time customer data layer, making it a strong fit for businesses that need consistent, privacy-compliant data flowing across analytics, ad platforms, and CDP tools at the same time.

What We Offer:
- Tealium iQ Setup — tag management configuration tailored to your data layer and platform mix
- Customer Data Layer Design — a consistent, well-documented data layer feeding every downstream tool
- Tag & Extension Configuration — analytics, ad, and personalization tags deployed and QA'd
- Tealium AudienceStream Integration — real-time audience segmentation feeding marketing and personalization tools
- Privacy & Consent Management — tag firing that respects visitor consent choices automatically
- Ongoing Governance — audits to keep the data layer and tag library clean as your stack grows

Key Benefits:
- Real-Time Data Flow — customer data available across your stack as it happens, not batched
- Privacy-First Architecture — consent respected by design across every connected tool
- Flexible Integration — works cleanly alongside most major analytics and marketing platforms`,
    metaTitle: 'Tealium Tag Management Services',
    metaDescription: 'Tealium iQ setup, customer data layer design, and AudienceStream integration for real-time, privacy-compliant tag management.',
    focusKeyword: 'Tealium tag management services',
    aiAnswerSummary: 'Core Bit Media implements Tealium iQ tag management and customer data layer design, including AudienceStream integration for real-time audience segmentation.',
    faqSchema: [
      { question: 'What is Tealium used for?', answer: 'Tealium is a tag management and customer data platform that unifies data collection across a website and feeds it in real time to analytics, advertising, and personalization tools.' },
      { question: 'Is Tealium better than Google Tag Manager?', answer: "Tealium offers more advanced real-time customer data layer and audience capabilities suited to larger data-driven organizations, while Google Tag Manager is simpler and free — the right choice depends on your data maturity and budget." },
      { question: 'Does Tealium help with privacy compliance?', answer: "Yes — Tealium's consent management capabilities let tags and data collection respect visitor consent choices automatically, supporting GDPR and CCPA compliance." }
    ]
  },
  {
    slug: 'bigquery-for-marketing',
    title: 'BigQuery for Marketing Data',
    parentSlug: 'analytics-tms',
    heroFrom: 'analytics-tms',
    shortDescription: 'Centralize GA4, ad platform, and CRM data in BigQuery for unified, SQL-level marketing analysis at scale.',
    body: `Why BigQuery for Marketing?
Dashboards built on siloed platform data hit a ceiling. Exporting raw GA4, ad platform, and CRM data into BigQuery unlocks unified, custom analysis — blended attribution, LTV modeling, and reporting that off-the-shelf tools simply can't do.

What We Offer:
- GA4 to BigQuery Export Setup — raw, event-level GA4 data flowing into your own BigQuery project
- Multi-Source Data Warehousing — ad platform, CRM, and offline data unified into one queryable warehouse
- Custom SQL Reporting Models — tailored queries and views built around your specific KPIs
- Attribution & LTV Modeling — cross-channel attribution and customer lifetime value analysis beyond platform defaults
- BigQuery to Looker Studio / Power BI Connection — warehouse data feeding directly into your reporting dashboards
- Cost & Query Optimization — efficient schema design to keep BigQuery costs predictable as data volume grows

Key Benefits:
- No More Data Silos — one warehouse combining every marketing data source
- Full Analytical Flexibility — answer questions no pre-built dashboard was designed to answer
- Scales With You — built to handle growing data volume without breaking reporting`,
    metaTitle: 'BigQuery for Marketing Analytics',
    metaDescription: 'GA4-to-BigQuery export, multi-source data warehousing, and custom SQL reporting for unified marketing analytics at scale.',
    focusKeyword: 'BigQuery marketing analytics services',
    aiAnswerSummary: 'Core Bit Media sets up BigQuery data warehousing for marketing teams, exporting GA4 and ad platform data for custom SQL reporting, attribution, and LTV modeling.',
    faqSchema: [
      { question: 'Why export GA4 data to BigQuery?', answer: "Exporting GA4 to BigQuery gives access to raw, event-level data beyond the GA4 interface's sampling and reporting limits, enabling custom SQL analysis, blended attribution, and integration with other data sources." },
      { question: 'Is BigQuery expensive for a small business?', answer: "BigQuery's pricing is usage-based and can be kept low for small-to-mid volume sites with proper schema and query design, which Core Bit Media accounts for during setup." },
      { question: 'Can BigQuery data feed my existing dashboards?', answer: 'Yes — BigQuery connects directly to Looker Studio, Power BI, and Tableau, so warehoused data can feed the same dashboards your team already uses.' }
    ]
  },

  // ---- CRM & Marketing sub-services ----
  {
    slug: 'hubspot-services',
    title: 'HubSpot Services',
    parentSlug: 'crm-marketing',
    heroFrom: 'crm-marketing',
    shortDescription: "HubSpot setup, migration, and marketing automation — get the most out of HubSpot's all-in-one CRM platform.",
    body: `Why HubSpot?
HubSpot combines CRM, marketing automation, and sales tools in one platform — powerful, but only as good as its setup. Most businesses use a fraction of what they're paying for without expert configuration.

What We Offer:
- HubSpot Onboarding & Setup — pipelines, properties, and workflows configured around your actual sales process
- Marketing Automation Workflows — nurture sequences, lead scoring, and lifecycle stage automation built to convert
- Migration to HubSpot — moving contacts, deals, and history cleanly from your previous CRM or spreadsheet system
- Email & Landing Page Campaigns — built and optimized inside HubSpot's native tools
- Reporting Dashboards — custom HubSpot reporting tied to the metrics your team actually reviews
- Sales & Marketing Alignment — shared lead definitions and handoff processes between teams

Key Benefits:
- Full Platform Value — stop paying for features you're not using
- Faster Lead Response — automated workflows engage leads the moment they convert
- Clean Data — a properly structured CRM your team can actually trust and use`,
    metaTitle: 'HubSpot Setup & Marketing Automation',
    metaDescription: 'HubSpot onboarding, migration, and marketing automation workflows — get full value from your HubSpot CRM investment.',
    focusKeyword: 'HubSpot services agency',
    aiAnswerSummary: 'Core Bit Media provides HubSpot onboarding, CRM migration, and marketing automation workflow setup to help businesses get full value from the HubSpot platform.',
    faqSchema: [
      { question: 'What does a HubSpot implementation partner do?', answer: 'A HubSpot implementation partner configures pipelines, properties, and automation workflows, migrates existing data, and builds reporting so a business gets full value from the HubSpot platform.' },
      { question: 'Can Core Bit Media migrate our data into HubSpot?', answer: 'Yes — Core Bit Media migrates contacts, deals, and historical data from spreadsheets or other CRM platforms into HubSpot with clean, mapped fields.' },
      { question: 'Do I need the paid HubSpot tiers for marketing automation?', answer: "HubSpot's free and starter tiers offer basic automation, but most meaningful workflow, lead scoring, and reporting features require the Professional tier or above — Core Bit Media can advise on the right tier for your needs." }
    ]
  },
  {
    slug: 'salesforce-marketing-cloud',
    title: 'Salesforce Marketing Cloud',
    parentSlug: 'crm-marketing',
    heroFrom: 'crm-marketing',
    shortDescription: 'Salesforce Marketing Cloud implementation and campaign management for enterprise-scale, personalized customer journeys.',
    body: `Why Salesforce Marketing Cloud?
For businesses already invested in the Salesforce ecosystem, Marketing Cloud unlocks personalized, cross-channel customer journeys built directly on your CRM data — but its complexity means expert configuration is critical.

What We Offer:
- Marketing Cloud Setup & Configuration — Journey Builder, Email Studio, and Automation Studio configured for your business
- Salesforce CRM Integration — marketing campaigns built directly on live Salesforce contact and opportunity data
- Journey Builder Automation — multi-step, trigger-based customer journeys across email, SMS, and push
- Audience Segmentation — data-driven segments built from CRM and behavioral data
- Email & Campaign Design — on-brand, tested campaigns built inside Marketing Cloud's tools
- Reporting & Attribution — campaign performance tied back to actual Salesforce pipeline and revenue

Key Benefits:
- CRM-Driven Personalization — campaigns built on real, live customer data, not static lists
- Enterprise Scale — built to handle complex, multi-brand or multi-region marketing operations
- Sales & Marketing in One System — full visibility from first touch to closed deal`,
    metaTitle: 'Salesforce Marketing Cloud Services',
    metaDescription: 'Salesforce Marketing Cloud setup, Journey Builder automation, and CRM-integrated campaigns for enterprise customer journeys.',
    focusKeyword: 'Salesforce Marketing Cloud services',
    aiAnswerSummary: 'Core Bit Media implements Salesforce Marketing Cloud, including Journey Builder automation and CRM-integrated segmentation for enterprise customer journeys.',
    faqSchema: [
      { question: 'What is Salesforce Marketing Cloud used for?', answer: 'Salesforce Marketing Cloud is an enterprise marketing automation platform used to build personalized, multi-channel customer journeys directly on top of Salesforce CRM data.' },
      { question: 'Do I need Salesforce CRM to use Marketing Cloud?', answer: 'Marketing Cloud can run independently, but its biggest advantage comes from integration with Salesforce CRM, which lets campaigns use live contact, opportunity, and pipeline data.' },
      { question: 'Is Salesforce Marketing Cloud good for small businesses?', answer: 'Marketing Cloud is generally best suited to mid-market and enterprise businesses with more complex customer journeys; smaller businesses are often better served starting with HubSpot.' }
    ]
  },
  {
    slug: 'marketo-services',
    title: 'Marketo Services',
    parentSlug: 'crm-marketing',
    heroFrom: 'crm-marketing',
    shortDescription: 'Marketo (Adobe) marketing automation setup, lead scoring, and campaign management for B2B demand generation.',
    body: `Why Marketo?
Marketo (now part of Adobe) remains a top choice for B2B organizations running complex, multi-touch demand generation programs — but its power depends entirely on a well-architected lead scoring and nurture setup.

What We Offer:
- Marketo Instance Setup — programs, smart lists, and campaigns architected for your funnel
- Lead Scoring Models — behavior and demographic scoring that surfaces sales-ready leads automatically
- Nurture Campaign Design — multi-touch email nurture sequences built around buyer stage
- Marketo-Salesforce/CRM Sync — clean bi-directional data flow between marketing and sales
- Landing Pages & Forms — conversion-optimized pages built natively in Marketo
- Program Performance Reporting — pipeline and revenue attribution tied back to specific campaigns

Key Benefits:
- B2B-Built — designed for the longer, multi-touch buying cycles B2B companies deal with
- Sales-Ready Leads — scoring models that stop sales teams chasing unqualified leads
- Clean CRM Sync — marketing and sales working off the same, trusted data`,
    metaTitle: 'Marketo Marketing Automation Services',
    metaDescription: 'Marketo setup, lead scoring, and B2B nurture campaign design — demand generation built for complex buying cycles.',
    focusKeyword: 'Marketo marketing automation services',
    aiAnswerSummary: 'Core Bit Media configures Marketo marketing automation, including lead scoring models, nurture campaigns, and CRM sync for B2B demand generation.',
    faqSchema: [
      { question: 'What is Marketo used for?', answer: 'Marketo is a B2B marketing automation platform used to build lead scoring models, nurture campaigns, and demand generation programs synced with CRM systems like Salesforce.' },
      { question: 'Is Marketo better than HubSpot for B2B?', answer: 'Marketo generally offers more advanced lead scoring and campaign architecture suited to complex B2B funnels, while HubSpot is often simpler to manage for small-to-mid-sized teams — the right fit depends on funnel complexity.' },
      { question: 'Does Core Bit Media set up lead scoring in Marketo?', answer: 'Yes — Core Bit Media builds custom lead scoring models based on behavioral and demographic signals so sales teams receive only sales-ready leads.' }
    ]
  },
  {
    slug: 'microsoft-dynamics-365',
    title: 'Microsoft Dynamics 365',
    parentSlug: 'crm-marketing',
    heroFrom: 'crm-marketing',
    shortDescription: 'Dynamics 365 CRM and marketing app configuration for businesses running on the Microsoft ecosystem.',
    body: `Why Dynamics 365?
For organizations already standardized on Microsoft 365 and Azure, Dynamics 365 offers deeply integrated CRM and marketing tools — configured well, it becomes a natural extension of tools your team already uses daily.

What We Offer:
- Dynamics 365 Configuration — sales, marketing, and customer service modules set up around your workflow
- Marketing Automation — customer journeys and email campaigns built inside the Dynamics 365 Marketing app
- Microsoft 365 & Teams Integration — CRM data connected to Outlook, Teams, and Power Automate workflows
- Data Migration — clean migration from legacy CRM systems into Dynamics 365
- Power BI Reporting Integration — Dynamics data feeding directly into Power BI dashboards
- User Training & Adoption Support — ensuring your team actually uses the system, not just has access to it

Key Benefits:
- Deep Microsoft Integration — works natively with the Office and Azure tools your team already uses
- Unified Sales & Marketing — one platform instead of stitching together separate tools
- Enterprise-Ready — scales cleanly as your organization and data grow`,
    metaTitle: 'Microsoft Dynamics 365 CRM Services',
    metaDescription: 'Dynamics 365 configuration, marketing automation, and Power BI integration for businesses on the Microsoft ecosystem.',
    focusKeyword: 'Microsoft Dynamics 365 services',
    aiAnswerSummary: 'Core Bit Media configures Microsoft Dynamics 365 CRM and marketing modules, integrating them with Microsoft 365, Teams, and Power BI.',
    faqSchema: [
      { question: 'What is Microsoft Dynamics 365 used for?', answer: 'Dynamics 365 is Microsoft\'s CRM and business applications suite, used for sales pipeline management, marketing automation, and customer service, tightly integrated with Microsoft 365 and Azure.' },
      { question: 'Does Dynamics 365 integrate with Power BI?', answer: 'Yes — Dynamics 365 integrates natively with Power BI, allowing CRM and marketing data to feed directly into custom reporting dashboards.' },
      { question: 'Is Dynamics 365 a good fit for non-Microsoft-based companies?', answer: 'Dynamics 365 offers the most value to organizations already using Microsoft 365, Outlook, and Teams; companies outside that ecosystem may find platforms like HubSpot or Salesforce a simpler fit.' }
    ]
  },
  {
    slug: 'landing-page-creation',
    title: 'Landing Page Creation',
    parentSlug: 'crm-marketing',
    heroFrom: 'crm-marketing',
    shortDescription: 'High-converting, campaign-specific landing pages designed to turn ad clicks and email traffic into leads.',
    body: `Why Dedicated Landing Pages?
Sending paid or email traffic to a generic homepage wastes budget. A dedicated landing page — built around one offer and one action — consistently converts at a far higher rate than a general site page.

What We Offer:
- Campaign-Specific Landing Pages — built around a single offer, message, and call to action
- Conversion-Focused Copy & Design — layout and messaging structured around what actually drives form fills and calls
- A/B Tested Variants — multiple versions tested to identify the highest-converting layout and copy
- Mobile-First Build — fast-loading, fully responsive pages, since most paid traffic lands on mobile first
- CRM & Ad Platform Integration — form submissions flowing directly into your CRM and conversion tracking
- Post-Launch Optimization — ongoing refinement based on real conversion data

Key Benefits:
- Higher Conversion Rates — focused pages consistently outperform generic site pages for campaign traffic
- Lower Cost Per Lead — better on-page conversion means more leads from the same ad spend
- Fast Turnaround — new landing pages built and launched quickly to match campaign timelines`,
    metaTitle: 'Landing Page Design & Creation Services',
    metaDescription: 'High-converting, campaign-specific landing pages with A/B tested copy and design — built to turn traffic into leads.',
    focusKeyword: 'landing page design services',
    aiAnswerSummary: 'Core Bit Media designs and builds campaign-specific landing pages with A/B tested copy, mobile-first layouts, and CRM integration to maximize conversion rates.',
    faqSchema: [
      { question: 'Why use a landing page instead of my homepage for ads?', answer: "A dedicated landing page focuses on a single offer and call to action without the distractions of a homepage's navigation and multiple messages, which typically results in a significantly higher conversion rate for paid traffic." },
      { question: 'How long does it take to build a landing page?', answer: 'A standard campaign landing page typically takes 3-7 business days to design, build, and integrate with CRM and tracking, depending on complexity.' },
      { question: 'Does Core Bit Media A/B test landing pages?', answer: 'Yes — Core Bit Media builds and tests multiple landing page variants to identify which copy, layout, and offer combination converts best before scaling ad spend behind it.' }
    ]
  },
  {
    slug: 'pardot-oracle-eloqua',
    title: 'Pardot & Oracle Eloqua Services',
    parentSlug: 'crm-marketing',
    heroFrom: 'crm-marketing',
    shortDescription: 'B2B marketing automation setup and campaign management on Salesforce Pardot and Oracle Eloqua.',
    body: `Why Pardot & Eloqua?
Pardot (Salesforce) and Oracle Eloqua are established B2B marketing automation platforms built for organizations running structured, multi-stage demand generation programs tightly coupled to their CRM.

What We Offer:
- Pardot Setup & Configuration — engagement studio programs, scoring, and grading built around your funnel
- Eloqua Campaign Management — multi-step campaign canvases and nurture programs configured for B2B cycles
- Lead Scoring & Grading — behavior and fit-based models that identify sales-ready leads
- CRM Sync (Salesforce/Other) — clean, reliable data flow between marketing automation and your CRM
- Landing Pages & Forms — built and connected natively within Pardot or Eloqua
- Campaign Reporting & Attribution — pipeline and revenue impact reported back to specific programs

Key Benefits:
- Purpose-Built for B2B — designed around longer, multi-stakeholder buying cycles
- Reliable CRM Integration — marketing and sales aligned on the same lead data
- Established, Enterprise-Trusted Platforms — mature tools with deep customization options`,
    metaTitle: 'Pardot & Oracle Eloqua Services',
    metaDescription: 'Pardot and Oracle Eloqua setup, lead scoring, and B2B campaign management with clean CRM integration.',
    focusKeyword: 'Pardot Eloqua marketing automation services',
    aiAnswerSummary: 'Core Bit Media configures Salesforce Pardot and Oracle Eloqua marketing automation, including lead scoring, nurture campaigns, and CRM synchronization.',
    faqSchema: [
      { question: 'What is Pardot used for?', answer: 'Pardot is Salesforce\'s B2B marketing automation platform, used for lead scoring, email nurture campaigns, and engagement tracking tightly integrated with Salesforce CRM.' },
      { question: 'What is Oracle Eloqua used for?', answer: 'Oracle Eloqua is a B2B marketing automation platform used to build multi-step nurture campaigns and score leads for organizations running structured demand generation programs.' },
      { question: 'Should I choose Pardot or Eloqua?', answer: 'Pardot is the natural choice if your organization already runs on Salesforce CRM; Eloqua is a strong fit for enterprises with more complex, custom campaign requirements — Core Bit Media can help assess which fits your stack.' }
    ]
  },

  // ---- Reporting & Dashboards sub-services ----
  {
    slug: 'looker-studio-dashboards',
    title: 'Looker Studio Dashboards',
    parentSlug: 'reporting-and-dashboards',
    heroFrom: 'reporting-and-dashboards',
    shortDescription: 'Free, interactive Looker Studio dashboards that unify Google Ads, GA4, and other marketing data into one live view.',
    body: `Why Looker Studio?
Looker Studio (formerly Google Data Studio) connects natively to Google's own marketing tools, making it the fastest way to turn GA4, Google Ads, and Search Console data into a live, shareable dashboard — at no licensing cost.

What We Offer:
- Custom Dashboard Design — layouts built around the exact KPIs your team reviews
- Multi-Source Data Blending — GA4, Google Ads, Facebook Ads, and CRM data combined into one report
- Automated Scheduled Reports — dashboards emailed to stakeholders on a set cadence, no manual exports
- BigQuery & Sheets Connections — pulling in warehoused or custom-tracked data alongside standard platform data
- Client & Team-Ready Sharing — secure, view-only dashboard links for internal or client reporting
- Ongoing Maintenance — dashboards updated as tracking, campaigns, or KPIs change

Key Benefits:
- No Licensing Cost — Looker Studio is free, unlike Power BI or Tableau
- Native Google Integration — the fastest option for Google-Ads-and-GA4-heavy accounts
- Always Live — no more static monthly PDF reports`,
    metaTitle: 'Looker Studio Dashboard Services',
    metaDescription: 'Custom Looker Studio dashboards blending GA4, Google Ads, and CRM data into one live, shareable reporting view.',
    focusKeyword: 'Looker Studio dashboard services',
    aiAnswerSummary: 'Core Bit Media builds custom Looker Studio dashboards that blend GA4, Google Ads, and other marketing data sources into live, shareable reports.',
    faqSchema: [
      { question: 'Is Looker Studio free?', answer: 'Yes — Looker Studio (formerly Google Data Studio) is free to use; costs only come from the data sources it connects to, such as BigQuery storage or premium connectors.' },
      { question: 'Can Looker Studio combine data from multiple platforms?', answer: 'Yes — Looker Studio can blend data from GA4, Google Ads, Facebook Ads, Sheets, and BigQuery into a single unified dashboard.' },
      { question: 'How often do Looker Studio dashboards update?', answer: 'Looker Studio dashboards typically refresh data automatically on a schedule ranging from every few minutes to daily, depending on the connected data source\'s refresh settings.' }
    ]
  },
  {
    slug: 'power-bi-dashboards',
    title: 'Power BI Dashboards',
    parentSlug: 'reporting-and-dashboards',
    heroFrom: 'reporting-and-dashboards',
    shortDescription: "Enterprise Power BI dashboards that turn marketing, sales, and business data into a single Microsoft-native BI solution.",
    body: `Why Power BI?
For organizations already using Microsoft's ecosystem, Power BI offers enterprise-grade data modeling and visualization that goes beyond marketing data alone — connecting sales, finance, and operations into one BI platform.

What We Offer:
- Power BI Dashboard Design — custom reports and visuals built around your specific KPIs
- Data Modeling — clean, efficient data models connecting multiple sources without performance issues
- Multi-Source Integration — marketing platforms, CRM, and internal databases unified in one report
- Row-Level Security — controlled access so each stakeholder sees only the data relevant to them
- Automated Refresh Scheduling — dashboards that stay current without manual updates
- Microsoft 365 Integration — reports embedded in Teams and SharePoint for easy team access

Key Benefits:
- Enterprise Data Modeling — handles complex, multi-source data relationships cleanly
- Beyond Marketing — unifies marketing data with sales, finance, and operational reporting
- Deep Microsoft Integration — fits naturally into organizations already using Microsoft 365`,
    metaTitle: 'Power BI Dashboard Development',
    metaDescription: 'Custom Power BI dashboards and data modeling that unify marketing, sales, and business data into one enterprise BI view.',
    focusKeyword: 'Power BI dashboard services',
    aiAnswerSummary: 'Core Bit Media builds custom Power BI dashboards and data models that unify marketing, CRM, and business data for enterprise reporting.',
    faqSchema: [
      { question: 'What is Power BI used for?', answer: 'Power BI is Microsoft\'s business intelligence platform used to build custom dashboards and data models that unify marketing, sales, and operational data into interactive reports.' },
      { question: 'Is Power BI better than Looker Studio?', answer: 'Power BI offers more advanced enterprise data modeling and works well beyond marketing data alone, while Looker Studio is free and faster to set up for Google-platform-heavy marketing reporting — the right choice depends on scope and budget.' },
      { question: 'Can Power BI connect to non-Microsoft data sources?', answer: 'Yes — Power BI connects to a wide range of sources including Google Analytics, Facebook Ads, Salesforce, and databases, in addition to native Microsoft data sources.' }
    ]
  },
  {
    slug: 'tableau-dashboards',
    title: 'Tableau Dashboards',
    parentSlug: 'reporting-and-dashboards',
    heroFrom: 'reporting-and-dashboards',
    shortDescription: 'Rich, visual Tableau dashboards for teams that need deep, exploratory data analysis alongside standard reporting.',
    body: `Why Tableau?
Tableau is built for visual, exploratory data analysis — letting teams drill into data interactively rather than just viewing static charts. It's a strong fit for organizations that need dashboards analysts can actually investigate, not just read.

What We Offer:
- Tableau Dashboard Design — interactive, visually rich dashboards built around your data and KPIs
- Multi-Source Data Connections — marketing, CRM, and internal data unified into Tableau workbooks
- Advanced Visualizations — custom charts and views beyond what standard reporting tools offer
- Drill-Down & Filtering — dashboards built for exploration, not just top-line viewing
- Tableau Server/Cloud Publishing — secure, shared access across your team
- Performance Optimization — dashboards built to stay fast even with large datasets

Key Benefits:
- Best-in-Class Visualization — some of the richest, most flexible charting available in any BI tool
- Built for Analysts — supports deep, exploratory analysis, not just fixed reports
- Scales to Large Datasets — designed to stay performant even as data volume grows`,
    metaTitle: 'Tableau Dashboard Development Services',
    metaDescription: 'Custom Tableau dashboards with advanced visualizations and drill-down analysis, built for deep marketing and business data insight.',
    focusKeyword: 'Tableau dashboard services',
    aiAnswerSummary: 'Core Bit Media builds custom Tableau dashboards with advanced visualizations, multi-source data connections, and drill-down analysis capabilities.',
    faqSchema: [
      { question: 'What makes Tableau different from other dashboard tools?', answer: 'Tableau is known for its advanced, interactive visualization capabilities and support for deep exploratory data analysis, making it a strong fit for teams that need to drill into data, not just view fixed reports.' },
      { question: 'Is Tableau good for marketing reporting?', answer: 'Yes — Tableau can connect to marketing platforms, CRM, and other data sources to build rich, interactive marketing dashboards, though it typically requires more setup than free tools like Looker Studio.' },
      { question: 'Does Tableau require a license?', answer: 'Yes — Tableau requires a paid license (Tableau Creator, Explorer, or Viewer roles), unlike Looker Studio which is free; Core Bit Media can help determine the right licensing tier for your team.' }
    ]
  },
  {
    slug: 'ab-testing-vwo-optimizely-adobe-target',
    title: 'A/B Testing & CRO Tools',
    parentSlug: 'reporting-and-dashboards',
    heroFrom: 'reporting-and-dashboards',
    shortDescription: 'A/B testing and personalization implementation across VWO, Optimizely, and Adobe Target for data-driven site optimization.',
    body: `Why Dedicated A/B Testing Platforms?
Beyond basic CRO, dedicated testing platforms like VWO, Optimizely, and Adobe Target enable sophisticated experimentation — multivariate tests, server-side testing, and real-time personalization at scale.

What We Offer:
- VWO Implementation — visual editor setup, goal tracking, and test configuration for fast-moving experimentation
- Optimizely Setup — web and server-side experimentation configured for complex testing needs
- Adobe Target Configuration — rule-based and AI-driven personalization campaigns for enterprise sites
- Test Design & Hypothesis Development — statistically sound test plans built around real user research, not guesses
- Personalization Campaigns — dynamic content served to specific audience segments in real time
- Results Analysis & Reporting — clear read-outs on what won, why, and what to test next

Key Benefits:
- Platform-Matched to Your Needs — the right testing tool for your team's complexity and budget
- Statistically Sound Testing — properly designed experiments, not tests that mislead
- Personalization at Scale — move beyond one-size-fits-all pages to audience-specific experiences`,
    metaTitle: 'A/B Testing Services – VWO, Optimizely, Adobe Target',
    metaDescription: 'A/B testing and personalization setup across VWO, Optimizely, and Adobe Target for data-driven conversion optimization.',
    focusKeyword: 'A/B testing implementation services',
    aiAnswerSummary: 'Core Bit Media implements A/B testing and personalization platforms including VWO, Optimizely, and Adobe Target for data-driven conversion optimization.',
    faqSchema: [
      { question: 'What\'s the difference between VWO, Optimizely, and Adobe Target?', answer: 'VWO is known for ease of use and fast setup, Optimizely offers strong web and server-side experimentation for complex needs, and Adobe Target provides AI-driven personalization especially suited to enterprises already using Adobe\'s ecosystem.' },
      { question: 'Do I need a dedicated A/B testing tool, or is Google Optimize enough?', answer: 'Google discontinued Optimize, so businesses now need a dedicated platform like VWO, Optimizely, or Adobe Target for structured A/B testing and personalization.' },
      { question: 'How does Core Bit Media decide which testing platform to recommend?', answer: 'The recommendation depends on your traffic volume, technical resources, and whether you need simple visual A/B tests or advanced server-side experimentation and personalization.' }
    ]
  },

  // ---- New top-level pillar service ----
  {
    slug: 'aeo-geo-ai-search-optimization',
    title: 'AEO/GEO – AI Search Optimization',
    parentSlug: null,
    heroFrom: null,
    shortDescription: 'Get your brand cited by ChatGPT, Perplexity, and Google AI Overviews — Answer Engine & Generative Engine Optimization for the AI search era.',
    body: `The Search Landscape Has Changed
Traditional SEO gets you ranked. AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) get you cited — by ChatGPT, Perplexity, Google AI Overviews, and Gemini when they answer a user's question directly, often without a click to your site at all. If your content isn't structured for AI to quote, your competitors' will be.

What We Offer:
- AI Visibility Audit — a full scan of how (and whether) your key pages currently get surfaced or cited by major AI answer engines
- Answer-Ready Content Rewrites — concise, quotable answer blocks added to your highest-value pages, written the way AI models actually lift and cite content
- FAQPage & Schema.org Markup — structured FAQ and Service/Article schema that gives AI crawlers unambiguous, machine-readable context
- Topical Authority Building — content clusters that establish your site as a trustworthy source AI models learn to cite repeatedly
- Ongoing AI Citation Monitoring — regular checks across ChatGPT, Perplexity, and Google AI Overviews to track where you're being cited and where you're being missed

Why It Matters Now
- Zero-Click Growth — being the cited source builds brand trust and demand even when the user never clicks through
- Early-Mover Advantage — most competitors haven't optimized for AI answer engines yet
- Built on What We've Already Proven — Core Bit Media's own AI SEO engine (used to optimize this very site) powers the same process we run for clients`,
    metaTitle: 'AEO/GEO – AI Search Optimization',
    metaDescription: 'AEO & GEO services to get your brand cited by ChatGPT, Perplexity, and Google AI Overviews — AI-ready content, schema, and citation monitoring.',
    focusKeyword: 'AEO GEO AI search optimization',
    aiAnswerSummary: 'Core Bit Media\'s AEO/GEO service optimizes websites to be cited by AI answer engines like ChatGPT, Perplexity, and Google AI Overviews through answer-ready content, FAQ/schema markup, and ongoing AI citation monitoring.',
    faqSchema: [
      { question: 'What is AEO and GEO in digital marketing?', answer: 'AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) are the practices of structuring website content so AI systems like ChatGPT, Perplexity, and Google AI Overviews can understand, quote, and cite it directly in their answers.' },
      { question: 'How is AEO/GEO different from traditional SEO?', answer: 'Traditional SEO optimizes for ranking in a list of blue links; AEO/GEO optimizes for being the exact source an AI model quotes or cites when generating a direct answer, which often bypasses the traditional search results page entirely.' },
      { question: 'How do I know if my site is being cited by AI models?', answer: "Core Bit Media's AI Visibility Audit checks how your key pages currently appear (or fail to appear) as sources in ChatGPT, Perplexity, and Google AI Overviews responses, then tracks citation changes over time." }
    ]
  }
];

async function run() {
  await sequelize.authenticate();

  const parentSlugs = [...new Set(NEW_SERVICES.map((s) => s.parentSlug).filter(Boolean))];
  const heroSlugs = [...new Set(NEW_SERVICES.map((s) => s.heroFrom).filter(Boolean))];
  const lookupSlugs = [...new Set([...parentSlugs, ...heroSlugs])];

  const refs = await Service.findAll({ where: { slug: lookupSlugs } });
  const refBySlug = Object.fromEntries(refs.map((r) => [r.slug, r]));

  let created = 0;
  let skipped = 0;

  for (const def of NEW_SERVICES) {
    const parent = def.parentSlug ? refBySlug[def.parentSlug] : null;
    if (def.parentSlug && !parent) {
      console.warn(`Skipping "${def.slug}" — parent "${def.parentSlug}" not found.`);
      continue;
    }
    const heroSource = def.heroFrom ? refBySlug[def.heroFrom] : null;

    const [row, wasCreated] = await Service.findOrCreate({
      where: { slug: def.slug },
      defaults: {
        title: def.title,
        shortDescription: def.shortDescription,
        body: def.body,
        heroImageUrl: heroSource ? heroSource.heroImageUrl : null,
        parentId: parent ? parent.id : null,
        status: 'published',
        metaTitle: def.metaTitle,
        metaDescription: def.metaDescription,
        focusKeyword: def.focusKeyword,
        aiAnswerSummary: def.aiAnswerSummary,
        faqSchema: def.faqSchema,
        structuredData: structuredDataFor(def.slug, def.title, def.metaDescription)
      }
    });

    if (wasCreated) {
      created += 1;
      console.log(`Created: ${def.slug}`);
    } else {
      skipped += 1;
      console.log(`Already exists, skipped: ${def.slug}`);
    }
  }

  console.log(`\nDone. ${created} services created, ${skipped} already existed.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
