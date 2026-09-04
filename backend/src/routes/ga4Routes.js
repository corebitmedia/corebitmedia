const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { Ga4Connection, Ga4Report } = require('../models');
const { encrypt } = require('../services/cryptoService');
const ga4Service = require('../services/ga4Service');
const { sendGa4LeadNotification } = require('../services/mailService');

const router = express.Router();

const refreshLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 1, keyGenerator: (req) => req.params.shareSlug });

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.corebitmedia.com';

// Short-lived (10 min) token identifying a just-connected Ga4Connection
// during the setup step, instead of passing its raw database id around in
// URLs — nothing about a connection is guessable/reusable from it.
function signSetupToken(connectionId) {
  return jwt.sign({ connectionId }, process.env.JWT_SECRET, { expiresIn: '10m' });
}
function verifySetupToken(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return payload.connectionId;
}

router.get('/oauth/start', (req, res) => {
  const url = ga4Service.getAuthUrl();
  res.redirect(url);
});

router.get('/oauth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing authorization code');

    const { tokens, email } = await ga4Service.exchangeCode(code);
    if (!tokens.refresh_token) {
      // Google only issues a refresh token on the FIRST consent for an
      // account, or when prompt=consent forces re-consent (which
      // getAuthUrl always sets) — if this ever fires, the user denied
      // offline access.
      return res.redirect(`${FRONTEND_URL}/ga4-insights/?error=no_refresh_token`);
    }

    // Re-encrypting on every connect (rather than only when new) is
    // intentional, not just simplest — AES-GCM uses a random IV per call,
    // so comparing ciphertexts to detect "did the token actually change"
    // would always be true anyway even for an identical token.
    const [connection] = await Ga4Connection.findOrCreate({
      where: { googleEmail: email },
      defaults: { googleEmail: email, encryptedRefreshToken: encrypt(tokens.refresh_token) }
    });
    await connection.update({ encryptedRefreshToken: encrypt(tokens.refresh_token) });

    const setupToken = signSetupToken(connection.id);
    res.redirect(`${FRONTEND_URL}/ga4-insights/setup/?token=${setupToken}`);
  } catch (err) {
    // err.response?.data carries Google's actual API error body, which is
    // far more specific than err.message alone (e.g. exactly which scope
    // or credential was missing, invalid_grant details, etc.).
    console.error('[ga4] OAuth callback failed at step:', err.ga4Step || 'unknown', '|', err.message, '|', JSON.stringify(err.response?.data || {}));
    res.redirect(`${FRONTEND_URL}/ga4-insights/?error=oauth_failed`);
  }
});

router.get('/properties', async (req, res) => {
  try {
    const connectionId = verifySetupToken(req.query.token);
    const connection = await Ga4Connection.findByPk(connectionId);
    if (!connection) return res.status(404).json({ error: 'Connection not found' });

    const properties = await ga4Service.listProperties(connection.encryptedRefreshToken);
    res.json({ properties, googleEmail: connection.googleEmail });
  } catch (err) {
    console.error('[ga4] Failed to list properties:', err.message);
    res.status(400).json({ error: 'Invalid or expired setup token' });
  }
});

router.post('/reports', async (req, res) => {
  try {
    const { token, propertyId, propertyDisplayName, leadName, leadEmail } = req.body;
    const connectionId = verifySetupToken(token);
    const connection = await Ga4Connection.findByPk(connectionId);
    if (!connection) return res.status(404).json({ error: 'Connection not found' });
    if (!propertyId) return res.status(400).json({ error: 'propertyId required' });

    await connection.update({ propertyId, propertyDisplayName });

    const cachedData = await ga4Service.runReport(connection.encryptedRefreshToken, propertyId);
    const shareSlug = crypto.randomBytes(16).toString('hex');

    const report = await Ga4Report.create({
      connectionId: connection.id,
      shareSlug,
      title: propertyDisplayName || 'GA4 Report',
      dateRangeLabel: 'Last 30 days',
      cachedData,
      leadName: leadName || null,
      leadEmail: leadEmail || null,
      lastRefreshedAt: new Date()
    });

    const shareUrl = `${FRONTEND_URL}/ga4-insights/view/?r=${report.shareSlug}`;
    if (leadEmail) {
      sendGa4LeadNotification({ leadName, leadEmail, propertyDisplayName, shareUrl }).catch(() => {});
    }

    res.status(201).json({ shareSlug: report.shareSlug, shareUrl });
  } catch (err) {
    console.error('[ga4] Failed to create report:', err.message);
    res.status(400).json({ error: 'Could not generate report — the setup link may have expired.' });
  }
});

// Public — anyone with the link can view, no auth. Deliberately returns
// only the cached snapshot + display metadata, never the connection's
// tokens or internal ids.
router.get('/reports/:shareSlug', async (req, res) => {
  const report = await Ga4Report.findOne({
    where: { shareSlug: req.params.shareSlug },
    include: [{ association: 'connection', attributes: ['propertyDisplayName'] }]
  });
  if (!report) return res.status(404).json({ error: 'Report not found' });

  res.json({
    title: report.title,
    dateRangeLabel: report.dateRangeLabel,
    data: report.cachedData,
    lastRefreshedAt: report.lastRefreshedAt
  });
});

router.post('/reports/:shareSlug/refresh', refreshLimiter, async (req, res) => {
  try {
    const report = await Ga4Report.findOne({ where: { shareSlug: req.params.shareSlug } });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const connection = await Ga4Connection.findByPk(report.connectionId);
    const cachedData = await ga4Service.runReport(connection.encryptedRefreshToken, connection.propertyId);
    await report.update({ cachedData, lastRefreshedAt: new Date() });

    res.json({ data: cachedData, lastRefreshedAt: report.lastRefreshedAt });
  } catch (err) {
    console.error('[ga4] Failed to refresh report:', err.message);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

module.exports = router;
