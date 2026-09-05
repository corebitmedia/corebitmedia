const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Ga4Connection = require('./Ga4Connection');

// One row per turn in a customer's "ask AI about your data" conversation for
// a connection. Flat history (no separate thread table) — one continuous
// conversation per connection is enough for the MVP, mirroring how a
// connection has one running Ga4Report rather than a history of reports.
const Ga4ChatMessage = sequelize.define('Ga4ChatMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  connectionId: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'ga4_chat_messages',
  timestamps: true
});

Ga4ChatMessage.belongsTo(Ga4Connection, { as: 'connection', foreignKey: 'connectionId' });
Ga4Connection.hasMany(Ga4ChatMessage, { as: 'chatMessages', foreignKey: 'connectionId' });

module.exports = Ga4ChatMessage;
