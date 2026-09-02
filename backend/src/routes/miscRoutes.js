const express = require('express');
const { Testimonial, Faq, ContactSubmission } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendContactNotification } = require('../services/mailService');

const router = express.Router();

// Testimonials - public read, admin write
router.get('/testimonials', async (req, res) => {
  const items = await Testimonial.findAll({ where: { isFeatured: true }, order: [['sortOrder', 'ASC']] });
  res.json(items);
});
router.post('/admin/testimonials', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  const item = await Testimonial.create(req.body);
  res.status(201).json(item);
});
router.put('/admin/testimonials/:id', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  const item = await Testimonial.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.update(req.body);
  res.json(item);
});
router.delete('/admin/testimonials/:id', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  const item = await Testimonial.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.destroy();
  res.status(204).send();
});

// FAQs - public read (used for FAQ schema + AEO), admin write
router.get('/faqs', async (req, res) => {
  const where = req.query.scope ? { scope: req.query.scope } : {};
  const items = await Faq.findAll({ where, order: [['sortOrder', 'ASC']] });
  res.json(items);
});
router.post('/admin/faqs', requireAuth, requireRole('admin', 'editor', 'author'), async (req, res) => {
  const item = await Faq.create(req.body);
  res.status(201).json(item);
});
router.put('/admin/faqs/:id', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  const item = await Faq.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.update(req.body);
  res.json(item);
});
router.delete('/admin/faqs/:id', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  const item = await Faq.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  await item.destroy();
  res.status(204).send();
});

// Contact form - public submit, admin view
router.post('/contact', async (req, res) => {
  const { name, email, phone, message, source } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  const submission = await ContactSubmission.create({ name, email, phone, message, source });
  res.status(201).json({ ok: true, id: submission.id });
  // Fire-and-forget: never let email delivery delay or fail the API response.
  sendContactNotification(submission).catch(() => {});
});
router.get('/admin/contact-submissions', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  const items = await ContactSubmission.findAll({ order: [['createdAt', 'DESC']] });
  res.json(items);
});

module.exports = router;
