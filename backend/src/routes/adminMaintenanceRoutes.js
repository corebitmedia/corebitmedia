// TEMPORARY — a one-off trigger for src/scripts/restructureSixCategories.js,
// added only because Render's free tier has no Shell access to run one-off
// scripts directly. Admin panel gets a one-click button for it (see
// admin/src/pages/Dashboard.jsx); trigger it once, confirm the result, then
// delete this whole file + its mount in server.js + the button.
//
// ~70 row updates + 11 new records — noticeably more work than prior
// one-off scripts but still well short of the ~150-write nav restructure
// that needed fire-and-forget + polling, so a plain awaited request is fine.

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { restructureSixCategories } = require('../scripts/restructureSixCategories');

const router = express.Router();

router.post('/restructure-six-categories', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const summary = await restructureSixCategories();
    res.json({ ok: true, summary });
  } catch (err) {
    console.error('[restructure-six-categories] Failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
