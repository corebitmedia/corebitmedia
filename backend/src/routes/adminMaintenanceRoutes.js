// TEMPORARY — a one-off trigger for src/scripts/addWebCreativeServices.js,
// added only because Render's free tier has no Shell access to run one-off
// scripts directly. Admin panel gets a one-click button for it (see
// admin/src/pages/Dashboard.jsx); trigger it once, confirm the result, then
// delete this whole file + its mount in server.js + the button.
//
// A handful of upserts (idempotent by slug, like restructureNav.js), so a
// plain awaited request is fine — no fire-and-forget/polling needed.

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { addWebCreativeServices } = require('../scripts/addWebCreativeServices');

const router = express.Router();

router.post('/add-web-creative-services', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const summary = await addWebCreativeServices();
    res.json({ ok: true, summary });
  } catch (err) {
    console.error('[add-web-creative-services] Failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
