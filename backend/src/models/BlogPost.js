const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const seoFields = require('./seoFields');
const User = require('./User');

const BlogPost = sequelize.define('BlogPost', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  excerpt: { type: DataTypes.STRING(300), allowNull: true },
  body: { type: DataTypes.TEXT('long'), allowNull: false },
  coverImageUrl: { type: DataTypes.STRING, allowNull: true },
  category: { type: DataTypes.STRING, allowNull: true },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  authorId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('draft', 'pending_review', 'published'), defaultValue: 'draft' },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
  ...seoFields()
}, {
  tableName: 'blog_posts',
  timestamps: true
});

BlogPost.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

module.exports = BlogPost;
