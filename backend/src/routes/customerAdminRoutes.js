const express = require('express');
const { Customer, Ga4Connection, Ga4Report } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

// Admin-panel management of dashboard signups (Customer accounts) —
// distinct from customerAuthRoutes.js, which is the customer's OWN
// signup/login. Gated by the CMS admin's own JWT (requireAuth +
// requireRole), never a customer token.
const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  // Only passwordHash is actually sensitive — googleId needs to stay in
  // the query (just not in the response body below) so signupMethod can
  // tell the two apart; excluding it from `attributes` here made it
  // always read as undefined/falsy regardless of the real value.
  const customers = await Customer.findAll({
    attributes: { exclude: ['passwordHash'] },
    include: [{ association: 'connections', attributes: ['id', 'propertyDisplayName'] }],
    order: [['createdAt', 'DESC']]
  });

  res.json(customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    signupMethod: c.googleId ? 'Google' : 'Email/Password',
    avatarUrl: c.avatarUrl,
    createdAt: c.createdAt,
    propertyCount: c.connections?.length || 0,
    properties: c.connections?.map((conn) => conn.propertyDisplayName).filter(Boolean) || []
  })));
});

router.get('/:id', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  const customer = await Customer.findByPk(req.params.id, {
    attributes: { exclude: ['passwordHash', 'googleId'] }
  });
  if (!customer) return res.status(404).json({ error: 'Not found' });

  const connections = await Ga4Connection.findAll({
    where: { customerId: customer.id },
    include: [{ association: 'reports', separate: true, order: [['createdAt', 'DESC']], limit: 1 }]
  });

  res.json({
    ...customer.toJSON(),
    connections: connections.map((c) => ({
      id: c.id,
      googleEmail: c.googleEmail,
      propertyDisplayName: c.propertyDisplayName,
      latestReport: c.reports?.[0] ? { shareSlug: c.reports[0].shareSlug, lastRefreshedAt: c.reports[0].lastRefreshedAt } : null
    }))
  });
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Not found' });

  // Cascades: a deleted account's connections/reports are meaningless
  // without an owner, and each connection holds a live Google refresh
  // token that should stop being usable once the account is gone.
  const connections = await Ga4Connection.findAll({ where: { customerId: customer.id } });
  const connectionIds = connections.map((c) => c.id);
  if (connectionIds.length > 0) {
    await Ga4Report.destroy({ where: { connectionId: connectionIds } });
    await Ga4Connection.destroy({ where: { id: connectionIds } });
  }
  await customer.destroy();

  res.status(204).send();
});

module.exports = router;
