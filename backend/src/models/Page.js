const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const seoFields = require('./seoFields');

// Generic editable page: Home, About Us, Contact Us, Privacy Policy, etc.
const Page = sequelize.define('Page', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  contentBlocks: { type: DataTypes.JSON, allowNull: false, defaultValue: [] }, // ordered array of section blocks
  status: { type: DataTypes.ENUM('draft', 'pending_review', 'published'), defaultValue: 'draft' },
  ...seoFields()
}, {
  tableName: 'pages',
  timestamps: true
});

module.exports = Page;
