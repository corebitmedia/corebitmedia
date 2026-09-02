const slugify = require('slugify');

// Builds a standard set of REST handlers for a content model so we don't
// repeat the same CRUD logic for Page/Service/BlogPost/CaseStudy.
// hasWorkflow=true models use draft/pending_review/published status,
// where authors publishing goes to pending_review instead of live.
function crudFactory(Model, { hasWorkflow = true, hasOwner = false } = {}) {
  return {
    // Public: list only published records
    async listPublic(req, res) {
      const where = hasWorkflow ? { status: 'published' } : {};
      const items = await Model.findAll({ where, order: [['createdAt', 'DESC']] });
      res.json(items);
    },

    async getPublicBySlug(req, res) {
      const where = { slug: req.params.slug };
      if (hasWorkflow) where.status = 'published';
      const item = await Model.findOne({ where });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    },

    // Admin: list everything regardless of status (for the dashboard)
    async listAdmin(req, res) {
      const items = await Model.findAll({ order: [['updatedAt', 'DESC']] });
      res.json(items);
    },

    async getAdminById(req, res) {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    },

    async create(req, res) {
      const data = { ...req.body };
      if (!data.slug && data.title) data.slug = slugify(data.title, { lower: true, strict: true });
      if (hasOwner) data.authorId = req.user.id;

      // Authors' content goes to review; editors/admins can publish directly
      if (hasWorkflow && data.status === 'published' && req.user.role === 'author') {
        data.status = 'pending_review';
      }

      const item = await Model.create(data);
      res.status(201).json(item);
    },

    async update(req, res) {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });

      const data = { ...req.body };
      if (hasWorkflow && data.status === 'published' && req.user.role === 'author') {
        data.status = 'pending_review';
      }

      await item.update(data);
      res.json(item);
    },

    async remove(req, res) {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.destroy();
      res.status(204).send();
    }
  };
}

module.exports = crudFactory;
