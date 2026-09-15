// TEMPORARY — a one-off trigger for src/scripts/updateGa4Service.js, added
// only because Render's free tier has no Shell access to run one-off
// scripts directly. Admin panel gets a one-click button for it (see
// admin/src/pages/Dashboard.jsx); trigger it once, confirm the result, then
// delete this whole file + its mount in server.js + the button.
//
// A single-row update (unlike the ~150-write nav restructure that needed a
// fire-and-forget + polling endpoint), so a plain awaited request is fine.

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { updateGa4Service } = require('../scripts/updateGa4Service');

const router = express.Router();

router.post('/update-ga4-service', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const summary = await updateGa4Service();
    res.json({ ok: true, summary });
  } catch (err) {
    console.error('[update-ga4-service] Failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
