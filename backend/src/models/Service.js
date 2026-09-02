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
