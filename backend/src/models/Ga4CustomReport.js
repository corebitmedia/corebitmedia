const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Ga4Connection = require('./Ga4Connection');

// A customer-built Looker-Studio-style report: a name, a default date range,
// and an ordered list of "widgets" (chart type + dimension + metrics + an
// optional row limit). Stored as one JSON blob rather than a widgets table —
// widgets have no independent lifecycle outside their report and the shape
// is exactly what the report builder UI and the /run endpoint both want.
const Ga4CustomReport = sequelize.define('Ga4CustomReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  connectionId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  dateRangeStart: { type: DataTypes.STRING, allowNull: false, defaultValue: '30daysAgo' },
  dateRangeEnd: { type: DataTypes.STRING, allowNull: false, defaultValue: 'today' },
  widgets: { type: DataTypes.JSON, allowNull: false, defaultValue: [] }
}, {
  tableName: 'ga4_custom_reports',
  timestamps: true
});

Ga4CustomReport.belongsTo(Ga4Connection, { as: 'connection', foreignKey: 'connectionId' });
Ga4Connection.hasMany(Ga4CustomReport, { as: 'customReports', foreignKey: 'connectionId' });

module.exports = Ga4CustomReport;
