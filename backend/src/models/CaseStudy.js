const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const seoFields = require('./seoFields');

const CaseStudy = sequelize.define('CaseStudy', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  clientName: { type: DataTypes.STRING, allowNull: true },
  industry: { type: DataTypes.STRING, allowNull: true },
  coverImageUrl: { type: DataTypes.STRING, allowNull: true },
  challenge: { type: DataTypes.TEXT, allowNull: true },
  solution: { type: DataTypes.TEXT, allowNull: true },
  results: { type: DataTypes.TEXT, allowNull: true },
  metrics: { type: DataTypes.JSON, defaultValue: [] }, // e.g. [{label:"ROAS", value:"9x"}]
  status: { type: DataTypes.ENUM('draft', 'pending_review', 'published'), defaultValue: 'draft' },
  ...seoFields()
}, {
  tableName: 'case_studies',
  timestamps: true
});

module.exports = CaseStudy;
