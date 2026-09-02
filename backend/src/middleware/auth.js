const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verifies the JWT sent from the admin panel and attaches req.user
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid session' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Restrict a route to specific roles, e.g. requireRole('admin', 'editor')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Authors can only edit their own content unless they're editor/admin.
// Pass the model + the field name holding the owning user id (default authorId).
function requireOwnerOrRole(model, ownerField = 'authorId', ...elevatedRoles) {
  return async (req, res, next) => {
    if (elevatedRoles.includes(req.user.role)) return next();
    const record = await model.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    if (record[ownerField] !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own content' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, requireOwnerOrRole };
