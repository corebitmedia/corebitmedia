const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { User } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Slow down brute-force attempts on login
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const { id, name, email, role, avatarUrl } = req.user;
  res.json({ id, name, email, role, avatarUrl });
});

module.exports = router;
