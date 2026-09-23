const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const seoFields = require('./seoFields');

const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  shortDescription: { type: DataTypes.STRING(300), allowNull: true },
  body: { type: DataTypes.TEXT('long'), allowNull: true }, // markdown/HTML from editor
  iconUrl: { type: DataTypes.STRING, allowNull: true },
  heroImageUrl: { type: DataTypes.STRING, allowNull: true },
  parentId: { type: DataTypes.INTEGER, allowNull: true }, // self-ref for sub-services (e.g. Paid Ads under Digital Marketing)
  // Which top-level nav column this service (pillar or child) belongs
  // under — orthogonal to parentId, which only says "which pillar within
  // this group". Nullable for anything not yet assigned to the new nav.
  // 'experimentation' and 'marketing' are retained in the enum for backward
  // compatibility but no longer assigned to anything as of the 6-category
  // restructure (see backend/src/scripts/restructureSixCategories.js) —
  // Experimentation & CRO became a second pillar nested under 'analytics',
  // and Marketing's 3 pillars (Paid Media, SEO & Organic Growth,
  // Measurement & Attribution) were promoted to their own top-level groups.
  navGroup: {
    type: DataTypes.ENUM(
      'analytics', 'experimentation', 'marketing', 'webdev',
      'reporting', 'conversion-tracking', 'paid-advertising', 'seo-aeo'
    ),
    allowNull: true
  },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('draft', 'pending_review', 'published'), defaultValue: 'draft' },
  ...seoFields()
}, {
  tableName: 'services',
  timestamps: true
});

// self-referencing association for sub-services
Service.hasMany(Service, { as: 'children', foreignKey: 'parentId' });
Service.belongsTo(Service, { as: 'parent', foreignKey: 'parentId' });

module.exports = Service;
