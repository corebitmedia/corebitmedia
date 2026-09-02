const express = require('express');
const { SiteSettings } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Ensures the singleton settings row exists, returns it
async function getOrCreateSettings() {
  let settings = await SiteSettings.findByPk(1);
  if (!settings) {
    settings = await SiteSettings.create({ id: 1 });
  }
  return settings;
}

// Public: the frontend fetches this to apply the current theme
router.get('/theme', async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

// Admin/editor only: update theme settings
router.put('/theme', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  const settings = await getOrCreateSettings();
  await settings.update(req.body);
  res.json(settings);
});

module.exports = router;
