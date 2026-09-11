// TEMPORARY — a one-off trigger for src/scripts/restructureNav.js, added
// only because Render's free tier has no Shell access to run one-off
// scripts directly. Admin panel gets a one-click button for it (see
// admin/src/pages/Dashboard.jsx); trigger it once, confirm the result, then
// delete this whole file + its mount in server.js + the button.
//
// Fire-and-forget: the migration does ~150 sequential DB writes, which took
// longer than Render's own proxy will hold an HTTP request open (an
// earlier in-process-but-awaited version still returned "Request failed"
// from the client even though nothing crashed server-side). So POST here
// starts the job and returns immediately; GET the status endpoint (no auth
// — it reveals no sensitive data, just progress) to poll for completion.

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { restructureNav } = require('../scripts/restructureNav');

const router = express.Router();

let state = { status: 'idle', log: [], error: null, startedAt: null, finishedAt: null };

function runInBackground() {
  state = { status: 'running', log: [], error: null, startedAt: new Date().toISOString(), finishedAt: null };

  const originalLog = console.log;
  console.log = (...args) => { state.log.push(args.map(String).join(' ')); originalLog(...args); };

  restructureNav()
    .then((summary) => {
      state.log.push(summary);
      state.status = 'done';
    })
    .catch((err) => {
      console.error('[restructure-nav] Failed:', err);
      state.status = 'error';
      state.error = err.message;
    })
    .finally(() => {
      console.log = originalLog;
      state.finishedAt = new Date().toISOString();
    });
}

router.post('/restructure-nav', requireAuth, requireRole('admin'), (req, res) => {
  if (state.status === 'running') return res.status(409).json({ error: 'Already running', state });
  runInBackground();
  res.json({ ok: true, started: true });
});

router.get('/restructure-nav/status', (req, res) => {
  res.json(state);
});

module.exports = router;
