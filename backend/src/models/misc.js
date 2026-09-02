const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Testimonial = sequelize.define('Testimonial', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clientName: { type: DataTypes.STRING, allowNull: false },
  clientRole: { type: DataTypes.STRING, allowNull: true },
  avatarUrl: { type: DataTypes.STRING, allowNull: true },
  quote: { type: DataTypes.TEXT, allowNull: false },
  rating: { type: DataTypes.FLOAT, defaultValue: 5 },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'testimonials', timestamps: true });

const Faq = sequelize.define('Faq', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  question: { type: DataTypes.STRING, allowNull: false },
  answer: { type: DataTypes.TEXT, allowNull: false },
  scope: { type: DataTypes.STRING, defaultValue: 'global' }, // global, or a service/page slug
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'faqs', timestamps: true });

const ContactSubmission = sequelize.define('ContactSubmission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: true },
  source: { type: DataTypes.STRING, allowNull: true }, // which page/form
  status: { type: DataTypes.ENUM('new', 'contacted', 'closed'), defaultValue: 'new' }
}, { tableName: 'contact_submissions', timestamps: true });

module.exports = { Testimonial, Faq, ContactSubmission };
