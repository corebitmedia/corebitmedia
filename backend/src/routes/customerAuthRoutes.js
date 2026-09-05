const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { google } = require('googleapis');
const { Customer } = require('../models');
const { requireCustomerAuth } = require('../middleware/customerAuth');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.corebitmedia.com';

function signCustomerToken(customer) {
  return jwt.sign(
    { id: customer.id, type: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    avatarUrl: customer.avatarUrl,
    hasPassword: !!customer.passwordHash
  };
}

router.post('/signup', authLimiter, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const existing = await Customer.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await Customer.create({ name, email, passwordHash });

  res.status(201).json({ token: signCustomerToken(customer), customer: publicCustomer(customer) });
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const customer = await Customer.findOne({ where: { email } });
  if (!customer || !customer.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ token: signCustomerToken(customer), customer: publicCustomer(customer) });
});

router.get('/me', requireCustomerAuth, (req, res) => {
  res.json(publicCustomer(req.customer));
});

router.patch('/me', requireCustomerAuth, async (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  if (email !== req.customer.email) {
    const existing = await Customer.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
  }

  await req.customer.update({ name, email });
  res.json(publicCustomer(req.customer));
});

router.post('/me/password', requireCustomerAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  // A Google-only signup has no passwordHash yet — this doubles as the
  // "set a password" flow for that account, so no current password is
  // required in that case.
  if (req.customer.passwordHash) {
    const valid = currentPassword && await bcrypt.compare(currentPassword, req.customer.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await req.customer.update({ passwordHash });
  res.json({ ok: true });
});

// "Continue with Google" — a separate OAuth purpose/client-config from
// ga4Routes.js's GA4-connect flow (different scope, different redirect
// URI), even though both reuse the same GOOGLE_CLIENT_ID/SECRET. This one
// only ever asks for basic profile/email — never analytics access.
function getAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CUSTOMER_OAUTH_REDIRECT_URI
  );
}

router.get('/oauth/google/start', (req, res) => {
  const client = getAuthClient();
  const url = client.generateAuthUrl({
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account'
  });
  res.redirect(url);
});

router.get('/oauth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing authorization code');

    const client = getAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data: profile } = await oauth2.userinfo.get();

    let customer = await Customer.findOne({ where: { googleId: profile.id } });
    if (!customer) {
      // A prior email+password signup with the same email gets linked
      // rather than duplicated.
      customer = await Customer.findOne({ where: { email: profile.email } });
      if (customer) {
        await customer.update({ googleId: profile.id, avatarUrl: customer.avatarUrl || profile.picture });
      } else {
        customer = await Customer.create({
          name: profile.name || profile.email,
          email: profile.email,
          googleId: profile.id,
          avatarUrl: profile.picture
        });
      }
    }

    const token = signCustomerToken(customer);
    res.redirect(`${FRONTEND_URL}/dashboard/auth-callback/?token=${token}`);
  } catch (err) {
    console.error('[customerAuth] Google sign-in failed:', err.message);
    res.redirect(`${FRONTEND_URL}/dashboard/login/?error=google_failed`);
  }
});

module.exports = router;
