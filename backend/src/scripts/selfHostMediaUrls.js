require('dotenv').config();
const { Service, BlogPost, CaseStudy, Testimonial, SiteSettings } = require('../models');

// Second and final step of the media migration (see fixMediaUrls.js for the
// first step). Rather than depending on the old WordPress hosting staying
// alive on a subdomain forever (SSL renewal, an old cPanel account, etc.),
// every referenced image was copied into frontend/public/media/uploads/ and
// now ships as part of this site's own deployment — no external dependency.
const OLD = 'https://media.corebitmedia.com/wp-content/uploads';
const NEW = 'https://www.corebitmedia.com/media/uploads';

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
