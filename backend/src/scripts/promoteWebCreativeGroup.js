require('dotenv').config();
const { sequelize, Service } = require('../models');

// One-off follow-up to addWebCreativeServices.js: the "Web & Creative"
// pillar was originally added as a 4th pillar INSIDE the Marketing
// mega-menu column. Per updated direction, it needs to be its own
// top-level "Web & App Development" column instead — a peer of Analytics/
// Experimentation/Marketing, not nested under Marketing.
//
// Renames the pillar's slug (nothing links to the old one yet — added a
// day ago, not indexed) and moves both the pillar and its 4 children from
// navGroup 'marketing' to the new 'webdev' value (see Service.js's enum
// and server.js's ensureColumnsExist(), which must have already widened
// the navGroup column on this DB before this runs).
const OLD_PILLAR_SLUG = 'web-creative';
const NEW_PILLAR_SLUG = 'web-app-development';
const CHILD_SLUGS = ['web-development', 'ui-ux-design', 'app-development', 'content-writing'];

async function promoteWebCreativeGroup() {
  await sequelize.sync();

  const pillar = await Service.findOne({ where: { slug: OLD_PILLAR_SLUG } });
  if (!pillar) {
    const already = await Service.findOne({ where: { slug: NEW_PILLAR_SLUG } });
    return already
      ? `Already promoted — "${NEW_PILLAR_SLUG}" exists, "${OLD_PILLAR_SLUG}" not found.`
      : `Neither "${OLD_PILLAR_SLUG}" nor "${NEW_PILLAR_SLUG}" found — nothing to update.`;
  }

  await pillar.update({
    slug: NEW_PILLAR_SLUG,
    title: 'Web & App Development',
    navGroup: 'webdev',
    metaTitle: 'Web & App Development Services',
    body: `Marketing Needs Something to Point To
The best campaigns still fail if they land on a slow website, a confusing app, or a page nobody designed with conversion in mind. We build the web presence, product experience, and content your marketing depends on:
- Web Development — fast, conversion-ready websites and landing pages
- UI/UX Design — interfaces people can actually use, backed by research
- App Development — mobile and web apps built to scale
- Content Writing — copy that ranks, reads well, and converts

This is the foundation your marketing campaigns point traffic toward — it has to hold up once people arrive.

Ready to build something worth marketing?`
  });

  let updatedChildren = 0;
  for (const slug of CHILD_SLUGS) {
    const child = await Service.findOne({ where: { slug } });
    if (child) {
      await child.update({ navGroup: 'webdev' });
      updatedChildren += 1;
    }
  }

  return `Promoted "${OLD_PILLAR_SLUG}" -> "${NEW_PILLAR_SLUG}" (navGroup: webdev), updated ${updatedChildren} child services.`;
}

if (require.main === module) {
  promoteWebCreativeGroup()
    .then((summary) => { console.log(summary); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { promoteWebCreativeGroup };
