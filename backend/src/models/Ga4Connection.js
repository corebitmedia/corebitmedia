const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Customer = require('./Customer');

// One row per Google account that's gone through the OAuth flow to connect
// a GA4 property. Not tied to our own `User` table on purpose — the person
// connecting is usually an external visitor (prospect or client), not
// someone with an admin-panel login.
const Ga4Connection = sequelize.define('Ga4Connection', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Nullable: the original self-serve flow (/ga4-insights/) creates
  // connections with no logged-in customer at all. Stamped when the
  // visitor is logged in (see ga4Routes.js's /oauth/start `state` param).
  customerId: { type: DataTypes.INTEGER, allowNull: true },
  googleEmail: { type: DataTypes.STRING, allowNull: false },
  // AES-256-GCM ciphertext (see services/cryptoService.js) — never the
  // plaintext refresh token.
  encryptedRefreshToken: { type: DataTypes.TEXT, allowNull: false },
  propertyId: { type: DataTypes.STRING, allowNull: true },
  propertyDisplayName: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'ga4_connections',
  timestamps: true
});

Ga4Connection.belongsTo(Customer, { as: 'customer', foreignKey: 'customerId' });
Customer.hasMany(Ga4Connection, { as: 'connections', foreignKey: 'customerId' });

module.exports = Ga4Connection;
