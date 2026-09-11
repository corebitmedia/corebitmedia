const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const seoFields = require('./seoFields');

// A flat list of industry landing pages (E-commerce, B2B/SaaS, Healthcare,
// etc.) — same shape as Service.js minus parentId/navGroup, since
// industries don't have a pillar/child hierarchy or their own nav mega-menu.
const Industry = sequelize.define('Industry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  shortDescription: { type: DataTypes.STRING(300), allowNull: true },
  body: { type: DataTypes.TEXT('long'), allowNull: true },
  iconUrl: { type: DataTypes.STRING, allowNull: true },
  heroImageUrl: { type: DataTypes.STRING, allowNull: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('draft', 'pending_review', 'published'), defaultValue: 'draft' },
  ...seoFields()
}, {
  tableName: 'industries',
  timestamps: true
});

module.exports = Industry;
