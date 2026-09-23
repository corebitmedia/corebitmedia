require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes');
const miscRoutes = require('./routes/miscRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const ga4Routes = require('./routes/ga4Routes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const customerAdminRoutes = require('./routes/customerAdminRoutes');
const { pagesRouter, servicesRouter, blogRouter, caseStudiesRouter, industriesRouter } = require('./routes/contentRoutes');
const { startCredsSweeper } = require('./services/mcpGa4Client');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

// Allow the production frontend + local dev servers (Next.js on 3000, Vite admin on 5173).
// FRONTEND_URL can be a single origin or a comma-separated list, since the
// site is reachable at more than one live origin at once (apex + www,
// the raw Vercel deployment URL, etc.) and forgetting one there shouldn't
// need a code change here — the two production domains are hardcoded as a
// baseline regardless of what's set.
const allowedOrigins = [
  'https://corebitmedia.com',
  'https://www.corebitmedia.com',
  ...(process.env.FRONTEND_URL || '').split(',').map((o) => o.trim()),
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    // Reject without throwing — an uncaught CORS error falls through to the
    // generic 500 handler below with no CORS headers attached at all, which
    // browsers surface as an opaque "Failed to fetch" instead of a clean
    // CORS rejection.
    callback(null, false);
  }
}));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Serve the built admin panel (React/Vite) from /admin — built via `npm run build` in /admin
app.use('/admin', express.static(path.join(__dirname, '..', 'public', 'admin')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pages', pagesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/blog', blogRouter);
app.use('/api/case-studies', caseStudiesRouter);
app.use('/api/industries', industriesRouter);
app.use('/api/settings', settingsRoutes);
app.use('/api/ga4', ga4Routes); // self-serve GA4 OAuth + shareable client reports
app.use('/api/customers', customerAuthRoutes); // dashboard account signup/login
app.use('/api/admin/customers', customerAdminRoutes); // admin panel: manage dashboard signups
app.use('/api', miscRoutes); // /api/testimonials, /api/faqs, /api/contact

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

// sequelize.sync() (no {alter: true}) only CREATEs tables that don't exist
// yet — it silently does NOT add new columns to tables that already have
// rows in production. navGroup (Service) and category (CaseStudy) were
// added to those models without a real migration, so on an existing
// database every single query against those two tables was crashing with
// "Unknown column" (ER_BAD_FIELD_ERROR) — which, left uncaught, was taking
// the whole server down repeatedly. This adds those two columns directly
// via raw SQL if they're missing, swallowing the "column already exists"
// case so it's safe to run on every boot.
async function ensureColumnsExist() {
  const statements = [
    "ALTER TABLE `services` ADD COLUMN `navGroup` ENUM('analytics','experimentation','marketing','webdev','reporting','conversion-tracking','paid-advertising','seo-aeo') NULL",
    "ALTER TABLE `case_studies` ADD COLUMN `category` ENUM('analytics','experimentation','marketing') NULL",
    // Same "sync() never alters existing columns" issue as above, but
    // widening an existing ENUM's allowed values needs MODIFY, not ADD
    // COLUMN — MySQL has no "add enum value" statement. Re-running MODIFY
    // COLUMN with the same final definition on every boot is a safe no-op
    // once applied, so no need to swallow a specific error code here.
    "ALTER TABLE `services` MODIFY COLUMN `navGroup` ENUM('analytics','experimentation','marketing','webdev','reporting','conversion-tracking','paid-advertising','seo-aeo') NULL"
  ];
  for (const sql of statements) {
    try {
      await sequelize.query(sql);
      console.log('[migrate] Applied:', sql);
    } catch (err) {
      if (err.original?.code !== 'ER_DUP_FIELDNAME') {
        console.error('[migrate] Failed:', sql, err.message);
      }
    }
  }
}

sequelize
  .authenticate()
  .then(() => sequelize.sync()) // for production, prefer migrations over sync()
  .then(() => ensureColumnsExist())
  .then(() => {
    app.listen(PORT, () => console.log(`Core Bit Media API running on port ${PORT}`));
    startCredsSweeper();
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = app;
