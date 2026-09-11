// TEMPORARY — a one-off trigger for src/scripts/restructureNav.js, added
// only because Render's free tier has no Shell access to run one-off
// scripts directly. Runs the script as a child process (so its own
// process.exit() calls only end the child, never this server) using
// whatever DB/env config this very server is already running with — no
// credentials need to be typed in or shared anywhere. Admin panel gets a
// one-click button for it (see admin/src/pages/Dashboard.jsx); trigger it
// once, confirm the result, then delete this whole file + its mount in
// server.js + the button.

const express = require('express');
const path = require('path');
const { execFile } = require('child_process');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/restructure-nav', requireAuth, requireRole('admin'), (req, res) => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'restructureNav.js');

  execFile(
    process.execPath,
    [scriptPath],
    { cwd: path.join(__dirname, '..', '..'), timeout: 5 * 60 * 1000, maxBuffer: 10 * 1024 * 1024 },
    (err, stdout, stderr) => {
      if (err) {
        console.error('[restructure-nav] Failed:', err.message);
        return res.status(500).json({ error: err.message, stdout, stderr });
      }
      res.json({ ok: true, stdout, stderr });
    }
  );
});

module.exports = router;
