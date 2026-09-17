// TEMPORARY — a one-off trigger for src/scripts/promoteWebCreativeGroup.js,
// added only because Render's free tier has no Shell access to run one-off
// scripts directly. Admin panel gets a one-click button for it (see
// admin/src/pages/Dashboard.jsx); trigger it once, confirm the result, then
// delete this whole file + its mount in server.js + the button.
//
// A couple of row updates, so a plain awaited request is fine — no
// fire-and-forget/polling needed.

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { promoteWebCreativeGroup } = require('../scripts/promoteWebCreativeGroup');

const router = express.Router();

router.post('/promote-web-creative-group', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const summary = await promoteWebCreativeGroup();
    res.json({ ok: true, summary });
  } catch (err) {
    console.error('[promote-web-creative-group] Failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
