const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// A website visitor with a dashboard account — distinct from the admin
// panel's `User` table (admin/editor/author CMS roles). passwordHash is
// nullable because a customer can sign up with Google only and never set
// a password.
const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: true },
  googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
  avatarUrl: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'customers',
  timestamps: true
});

module.exports = Customer;
