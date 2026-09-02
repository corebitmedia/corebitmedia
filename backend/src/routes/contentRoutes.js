const express = require('express');
const { Page, Service, BlogPost, CaseStudy } = require('../models');
const crudFactory = require('../controllers/crudFactory');
const { requireAuth, requireRole, requireOwnerOrRole } = require('../middleware/auth');

function buildRoutes(Model, opts) {
  const router = express.Router();
  const c = crudFactory(Model, opts);

  // Public-facing endpoints (consumed by the Next.js frontend)
  router.get('/', c.listPublic);
  router.get('/:slug', c.getPublicBySlug);

  // Admin endpoints
  router.get('/admin/all', requireAuth, c.listAdmin);
  router.get('/admin/:id', requireAuth, c.getAdminById);
  router.post('/admin', requireAuth, requireRole('admin', 'editor', 'author'), c.create);

  if (opts.hasOwner) {
    router.put('/admin/:id', requireAuth, requireOwnerOrRole(Model, 'authorId', 'admin', 'editor'), c.update);
    router.delete('/admin/:id', requireAuth, requireOwnerOrRole(Model, 'authorId', 'admin', 'editor'), c.remove);
  } else {
    router.put('/admin/:id', requireAuth, requireRole('admin', 'editor', 'author'), c.update);
    router.delete('/admin/:id', requireAuth, requireRole('admin', 'editor'), c.remove);
  }

  // Editors/admins approve author submissions
  router.post('/admin/:id/publish', requireAuth, requireRole('admin', 'editor'), async (req, res) => {
    const item = await Model.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update({ status: 'published' });
    res.json(item);
  });

  return router;
}

const pagesRouter = buildRoutes(Page, { hasWorkflow: true, hasOwner: false });
const servicesRouter = buildRoutes(Service, { hasWorkflow: true, hasOwner: false });
const blogRouter = buildRoutes(BlogPost, { hasWorkflow: true, hasOwner: true });
const caseStudiesRouter = buildRoutes(CaseStudy, { hasWorkflow: true, hasOwner: false });

module.exports = { pagesRouter, servicesRouter, blogRouter, caseStudiesRouter };
