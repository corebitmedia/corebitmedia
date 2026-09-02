const { DataTypes } = require('sequelize');

// This MySQL instance doesn't have native JSON column support, so `sync()`
// falls back to LONGTEXT for DataTypes.JSON fields. Sequelize's automatic
// JSON parse-on-read relies on the driver reporting a real JSON column type,
// which never happens on LONGTEXT — writes stringify fine, but reads come
// back as a raw string instead of an object/array. A getter that parses
// defensively fixes every model that shares this field set.
function jsonField(fieldName) {
  return {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      const raw = this.getDataValue(fieldName);
      if (typeof raw !== 'string') return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
  };
}

// Reusable field set added to every content model (Page, Service, BlogPost, CaseStudy)
// so each piece of content can carry its own SEO / AEO / GEO metadata,
// most of which is filled in by the AI SEO assistant in the admin panel.
function seoFields() {
  return {
    metaTitle: { type: DataTypes.STRING(70), allowNull: true },
    metaDescription: { type: DataTypes.STRING(160), allowNull: true },
    focusKeyword: { type: DataTypes.STRING, allowNull: true },

    // AEO: a short, direct answer block AI models / answer engines can lift verbatim
    aiAnswerSummary: { type: DataTypes.TEXT, allowNull: true },

    // GEO: structured FAQ pairs attached to this content, rendered as FAQPage schema
    faqSchema: jsonField('faqSchema'),

    // Full schema.org JSON-LD object (Service/Article/Organization etc.) rendered on the page
    structuredData: jsonField('structuredData'),

    // 0-100 score from the AI SEO scoring tool, shown in admin before publish
    seoScore: { type: DataTypes.INTEGER, allowNull: true },
    seoNotes: { type: DataTypes.TEXT, allowNull: true },

    ogImageUrl: { type: DataTypes.STRING, allowNull: true }
  };
}

module.exports = seoFields;
