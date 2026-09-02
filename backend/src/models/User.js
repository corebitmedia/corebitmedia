const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Roles: admin (full access), editor (edit/publish any content),
// author (create/edit own content, needs editor approval to publish)
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('admin', 'editor', 'author'),
    defaultValue: 'author'
  },
  avatarUrl: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
