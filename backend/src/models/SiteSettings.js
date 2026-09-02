const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Singleton table (always row id=1) holding site-wide theme/branding settings,
// editable from the admin panel's Theme page. The frontend fetches this
// (client-side) and applies it as CSS custom properties, so changes show up
// without needing a full site rebuild/redeploy.
const SiteSettings = sequelize.define('SiteSettings', {
  id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },

  siteName: { type: DataTypes.STRING, defaultValue: 'Core Bit Media' },
  logoUrl: { type: DataTypes.STRING, allowNull: true },
  faviconUrl: { type: DataTypes.STRING, allowNull: true },

  // Core brand colors — hex values, applied as CSS variables.
  // Pulled directly from the live site's Elementor kit/element settings
  // (WordPress database export, Aug 2026) — exact values, not estimates.
  // A purple/violet theme, not the navy+teal placeholder this scaffold shipped with.
  primaryColor: { type: DataTypes.STRING, defaultValue: '#8e2680' },   // magenta-purple accent (kit "primary_color")
  primaryColorDark: { type: DataTypes.STRING, defaultValue: '#6e1d63' },
  secondaryColor: { type: DataTypes.STRING, defaultValue: '#232358' }, // dark navy-indigo
  textColor: { type: DataTypes.STRING, defaultValue: '#23242c' },
  mutedColor: { type: DataTypes.STRING, defaultValue: '#6b6690' },
  backgroundColor: { type: DataTypes.STRING, defaultValue: '#ffffff' },
  backgroundAltColor: { type: DataTypes.STRING, defaultValue: '#f4eff6' },

  fontFamily: {
    type: DataTypes.STRING,
    defaultValue: "'Poppins', 'Segoe UI', system-ui, -apple-system, sans-serif"
  },
  buttonRadius: { type: DataTypes.STRING, defaultValue: '6px' } // e.g. '0px' sharp, '999px' pill
}, {
  tableName: 'site_settings',
  timestamps: true
});

module.exports = SiteSettings;
