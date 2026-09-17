const express = require('express');
const bcrypt = require('bcryptjs');
const { User, BlogPost } = require('../models');
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

  // An admin demoting/deactivating their own only admin account would lock
  // everyone out of user management — block role changes away from admin
  // and deactivation on your own account (deleting is blocked separately
  // below); editing your own name/email/password is still fine.
  const isSelf = req.user.id === user.id;
  if (isSelf && req.body.role && req.body.role !== 'admin') {
    return res.status(400).json({ error: "You can't change your own role away from admin." });
  }
  if (isSelf && req.body.isActive === false) {
    return res.status(400).json({ error: "You can't deactivate your own account." });
  }

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
  if (req.user.id === user.id) return res.status(400).json({ error: "You can't deactivate your own account." });
  await user.update({ isActive: false }); // soft-deactivate rather than hard delete
  res.status(204).send();
});

// Permanent delete — separate from the soft-deactivate above, since it's
// irreversible and fails outright if the user authored any blog posts
// (authorId is NOT NULL, so the FK would reject it anyway) rather than
// silently orphaning or cascading into deleting their content.
router.delete('/:id/permanent', requireAuth, requireRole('admin'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (req.user.id === user.id) return res.status(400).json({ error: "You can't delete your own account." });

  const postCount = await BlogPost.count({ where: { authorId: user.id } });
  if (postCount > 0) {
    return res.status(409).json({ error: `This user has authored ${postCount} blog post(s) — deactivate instead, or reassign their posts first.` });
  }

  await user.destroy();
  res.status(204).send();
});

module.exports = router;
