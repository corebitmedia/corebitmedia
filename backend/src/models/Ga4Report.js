const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Ga4Connection = require('./Ga4Connection');

// A generated report snapshot with a public, unguessable share link —
// anyone with the link can view it, no login required, same model as
// sharing a Google Doc. shareSlug is a long random string (see
// routes/ga4Routes.js), not a sequential id, specifically so links can't
// be enumerated/guessed.
const Ga4Report = sequelize.define('Ga4Report', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  connectionId: { type: DataTypes.INTEGER, allowNull: false },
  shareSlug: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: true },
  dateRangeLabel: { type: DataTypes.STRING, allowNull: true },
  cachedData: { type: DataTypes.JSON, allowNull: true },
  aiRecommendations: { type: DataTypes.JSON, allowNull: true },
  leadName: { type: DataTypes.STRING, allowNull: true },
  leadEmail: { type: DataTypes.STRING, allowNull: true },
  lastRefreshedAt: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'ga4_reports',
  timestamps: true
});

Ga4Report.belongsTo(Ga4Connection, { as: 'connection', foreignKey: 'connectionId' });
Ga4Connection.hasMany(Ga4Report, { as: 'reports', foreignKey: 'connectionId' });

module.exports = Ga4Report;
