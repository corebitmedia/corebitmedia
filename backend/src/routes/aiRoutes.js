const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth, requireRole } = require('../middleware/auth');
const { optimizeContent, generateAltText, suggestInternalLinks } = require('../services/aiSeoService');
const { Page, Service, BlogPost, CaseStudy } = require('../models');

const router = express.Router();

// AI calls cost money - keep this modest per user
const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 60 });

// "AI Optimize" button in the admin editor - generates meta tags, AEO answer
// summary, FAQ schema, and structured data for the content being edited.
router.post('/optimize', requireAuth, requireRole('admin', 'editor', 'author'), aiLimiter, async (req, res) => {
  try {
    const { title, bodyText, contentType, url } = req.body;
    if (!title || !bodyText) return res.status(400).json({ error: 'title and bodyText required' });
    const result = await optimizeContent({ title, bodyText, contentType: contentType || 'WebPage', url: url || '' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/alt-text', requireAuth, aiLimiter, async (req, res) => {
  try {
    const { imageContext, pageTitle } = req.body;
    const altText = await generateAltText({ imageContext, pageTitle });
    res.json({ altText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/internal-links', requireAuth, requireRole('admin', 'editor', 'author'), aiLimiter, async (req, res) => {
  try {
    const { title, bodyText, excludeSlug } = req.body;
    const [pages, services, posts, caseStudies] = await Promise.all([
      Page.findAll({ attributes: ['slug', 'title'] }),
      Service.findAll({ attributes: ['slug', 'title'] }),
      BlogPost.findAll({ attributes: ['slug', 'title'] }),
      CaseStudy.findAll({ attributes: ['slug', 'title'] })
    ]);
    const existingPages = [...pages, ...services, ...posts, ...caseStudies]
      .filter((p) => p.slug !== excludeSlug)
      .map((p) => p.get({ plain: true }));

    const result = await suggestInternalLinks({ title, bodyText, existingPages });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
