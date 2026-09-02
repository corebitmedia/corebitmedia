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
const { pagesRouter, servicesRouter, blogRouter, caseStudiesRouter } = require('./routes/contentRoutes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

// Allow the production frontend + local dev servers (Next.js on 3000, Vite admin on 5173)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
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
app.use('/api/settings', settingsRoutes);
app.use('/api', miscRoutes); // /api/testimonials, /api/faqs, /api/contact

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

sequelize
  .authenticate()
  .then(() => sequelize.sync()) // for production, prefer migrations over sync()
  .then(() => {
    app.listen(PORT, () => console.log(`Core Bit Media API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = app;
