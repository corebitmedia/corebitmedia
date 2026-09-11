// TEMPORARY — a one-off trigger for src/scripts/restructureNav.js, added
// only because Render's free tier has no Shell access to run one-off
// scripts directly. Admin panel gets a one-click button for it (see
// admin/src/pages/Dashboard.jsx); trigger it once, confirm the result, then
// delete this whole file + its mount in server.js + the button.
//
// Runs the migration IN-PROCESS (awaiting the same restructureNav()
// function the CLI script uses) rather than spawning it as a child
// process — an earlier version used child_process.execFile, which doubles
// memory usage (a second full Node process + its own DB connection pool)
// on top of the already-running server, and on the free tier's limited RAM
// that was enough to crash-loop the whole service. In-process, the
// migration's DB calls are all async/await and don't block the event loop,
// so the rest of the server keeps serving requests while it runs.

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { restructureNav } = require('../scripts/restructureNav');

const router = express.Router();

router.post('/restructure-nav', requireAuth, requireRole('admin'), async (req, res) => {
  // Captures console.log output from restructureNav() so the admin UI can
  // show a summary, without changing that script's own logging.
  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => { logs.push(args.map(String).join(' ')); originalLog(...args); };

  try {
    const summary = await restructureNav();
    res.json({ ok: true, stdout: [...logs, summary].join('\n') });
  } catch (err) {
    console.error('[restructure-nav] Failed:', err);
    res.status(500).json({ error: err.message, stdout: logs.join('\n') });
  } finally {
    console.log = originalLog;
  }
});

module.exports = router;
