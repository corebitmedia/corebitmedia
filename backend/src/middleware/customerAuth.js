const jwt = require('jsonwebtoken');
const { Customer } = require('../models');

// Mirrors middleware/auth.js's requireAuth, but for dashboard customers
// instead of admin-panel users — a separate identity/session space
// entirely. Signs with a distinct type claim so a customer token can
// never be replayed against admin routes (or vice versa) even though
// both share JWT_SECRET.
async function requireCustomerAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== 'customer') return res.status(401).json({ error: 'Invalid session' });

    const customer = await Customer.findByPk(payload.id);
    if (!customer) return res.status(401).json({ error: 'Invalid session' });

    req.customer = customer;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireCustomerAuth };
