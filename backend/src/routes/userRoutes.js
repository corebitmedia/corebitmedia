const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['passwordHash'] } });
  res.json(users);
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: role || 'author' });
  const { passwordHash: _, ...safeUser } = user.toJSON();
  res.status(201).json(safeUser);
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });

  const updates = { ...req.body };
  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }
  await user.update(updates);
  const { passwordHash: _, ...safeUser } = user.toJSON();
  res.json(safeUser);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  await user.update({ isActive: false }); // soft-deactivate rather than hard delete
  res.status(204).send();
});

module.exports = router;
