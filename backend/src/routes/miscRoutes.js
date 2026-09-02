const express = require('express');
const { Testimonial, Faq, ContactSubmission } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendContactNotification } = require('../services/mailService');

const router = express.Router();

// Verifies a Google reCAPTCHA v2 token server-side before trusting a contact
// submission. If RECAPTCHA_SECRET_KEY isn't set (not configured yet, or
// local dev), verification is skipped rather than blocking submissions —
// same "optional until configured" pattern as the SMTP email notification.
async function verifyRecaptcha(token) {
  if (!process.env.RECAPTCHA_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: token })
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('[recaptcha] Verification request failed:', err.message);
    return false;
  }
}

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

// Simple RFC-5322-ish check — good enough to catch typos/junk without
// rejecting real addresses; the actual proof an address works is the
// confirmation email/reply, not this regex.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Contact form - public submit, admin view
router.post('/contact', async (req, res) => {
  const { name, email, phone, message, source, recaptchaToken } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email and phone are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (!(await verifyRecaptcha(recaptchaToken))) {
    return res.status(400).json({ error: 'reCAPTCHA verification failed — please try again.' });
  }
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
