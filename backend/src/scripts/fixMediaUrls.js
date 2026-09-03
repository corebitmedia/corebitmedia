require('dotenv').config();
const { Service, BlogPost, CaseStudy, Testimonial, SiteSettings } = require('../models');

// One-time migration: corebitmedia.com's DNS now points at Vercel (the new
// site), so the old WordPress media path (www.corebitmedia.com/wp-content)
// is no longer served there. A `media.corebitmedia.com` subdomain was set up
// pointing at the old WordPress hosting's same docroot specifically so this
// path keeps working — this script repoints every stored URL at it.
const OLD = 'https://www.corebitmedia.com/wp-content';
const NEW = 'https://media.corebitmedia.com/wp-content';

// Sequelize-managed bookkeeping columns — never touch these, and Date
// instances specifically must pass through untouched (typeof a Date is
// 'object', so a naive recursive walk mistakes it for a plain object and
// mangles it into `{}`, which then fails as an invalid datetime on save).
const SKIP_FIELDS = new Set(['id', 'createdAt', 'updatedAt']);

function deepReplace(value) {
  if (typeof value === 'string') return value.split(OLD).join(NEW);
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(deepReplace);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepReplace(v);
    return out;
  }
  return value;
}

async function run() {
  const models = { Service, BlogPost, CaseStudy, Testimonial, SiteSettings };
  let totalUpdated = 0;

  for (const [name, Model] of Object.entries(models)) {
    const rows = await Model.findAll();
    let updated = 0;
    for (const row of rows) {
      const json = row.toJSON();
      if (!JSON.stringify(json).includes(OLD)) continue;

      const patch = {};
      for (const [key, value] of Object.entries(json)) {
        if (value == null || SKIP_FIELDS.has(key)) continue;
        const replaced = deepReplace(value);
        if (JSON.stringify(replaced) !== JSON.stringify(value)) patch[key] = replaced;
      }
      if (Object.keys(patch).length > 0) {
        await row.update(patch);
        updated++;
      }
    }
    console.log(`${name}: updated ${updated}/${rows.length} rows`);
    totalUpdated += updated;
  }

  console.log(`\nDone. ${totalUpdated} rows updated total.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
