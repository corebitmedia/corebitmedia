require('dotenv').config();
const { sequelize, Service } = require('../models');

// One-off content fix: Universal Analytics is fully sunset, so the
// "GA4 Implementation & Migration" service (created by
// seedAdditionalServices.js, which only creates missing rows and never
// updates existing ones) needs both its copy AND its slug updated to drop
// the now-irrelevant migration framing — a plain re-run of that seed script
// wouldn't touch this already-existing row, so this targets it directly by
// its OLD slug and updates the row in place (never creates a second one).
const OLD_SLUG = 'ga4-implementation-migration';
const NEW_SLUG = 'ga4-implementation';

const UPDATED_FIELDS = {
  slug: NEW_SLUG,
  title: 'GA4 Implementation',
  shortDescription: 'Full Google Analytics 4 setup and custom event tracking, done right the first time.',
  body: `Why GA4 Implementation Matters
Google Analytics 4 is event-based, not session-based — a fundamentally different model from how analytics used to work. A rushed or incomplete setup means broken funnels, missing conversions, and decisions made on bad data.

What We Offer:
- GA4 Property Setup — clean, properly structured GA4 properties built for your specific business model
- Custom Event & Conversion Tracking — form fills, purchases, calls, and other key actions tracked accurately from day one
- E-commerce Tracking — enhanced e-commerce implementation for accurate revenue and product-level reporting
- GA4 + Google Ads Integration — conversion data flowing correctly for accurate campaign optimization
- Data Validation & QA — side-by-side checks to confirm GA4 numbers are trustworthy before you rely on them

Key Benefits:
- Accurate Data From Day One — avoid months of decisions made on broken tracking
- Future-Proof Setup — built the way Google's current and next-generation analytics platform expects
- Full-Funnel Visibility — see the complete customer journey, not just sessions`,
  metaTitle: 'GA4 Implementation Services',
  metaDescription: 'Google Analytics 4 setup, custom event tracking, and data validation — accurate data from day one.',
  focusKeyword: 'GA4 implementation services',
  aiAnswerSummary: 'Core Bit Media implements Google Analytics 4 properties with custom event and conversion tracking, e-commerce tracking, and full data validation.',
  faqSchema: [
    { question: 'What does a GA4 implementation include?', answer: 'A GA4 implementation from Core Bit Media includes property setup, custom event and conversion tracking, e-commerce tracking, Google Ads integration, and full data validation and QA.' },
    { question: 'How long does a GA4 implementation take?', answer: 'A standard GA4 implementation with custom event tracking typically takes 1-3 weeks depending on site complexity and the number of conversion events being tracked.' },
    { question: 'How do I know my GA4 data is accurate?', answer: 'Core Bit Media runs side-by-side data validation and QA checks against your defined events and conversions before you rely on the numbers for decisions.' }
  ]
};

async function updateGa4Service() {
  await sequelize.sync();

  const rec = await Service.findOne({ where: { slug: OLD_SLUG } });
  if (!rec) {
    // Already renamed (safe to re-run) — nothing to do.
    const already = await Service.findOne({ where: { slug: NEW_SLUG } });
    return already
      ? `Already updated — "${NEW_SLUG}" exists, "${OLD_SLUG}" not found.`
      : `Neither "${OLD_SLUG}" nor "${NEW_SLUG}" found — nothing to update.`;
  }

  await rec.update({
    ...UPDATED_FIELDS,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: UPDATED_FIELDS.title,
      serviceType: UPDATED_FIELDS.title,
      description: UPDATED_FIELDS.metaDescription,
      provider: { '@type': 'Organization', name: 'Core Bit Media', url: 'https://www.corebitmedia.com' },
      areaServed: 'Worldwide',
      url: `https://www.corebitmedia.com/services/${NEW_SLUG}/`
    }
  });

  return `Updated service id ${rec.id}: "${OLD_SLUG}" -> "${NEW_SLUG}", migration copy removed.`;
}

if (require.main === module) {
  updateGa4Service()
    .then((summary) => { console.log(summary); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { updateGa4Service };
