# Core Bit Media — React/Node Rebuild

Replaces the WordPress site at corebitmedia.com with a fast static Next.js
frontend, a Node/Express CMS + API backend with a role-based admin panel,
and built-in AI tools for SEO, AEO (answer engine optimization), and GEO
(generative engine optimization).

## Architecture

```
frontend/   Next.js site, statically exported → upload to Namecheap shared hosting
backend/    Express API + CMS + admin panel, deployed to Render/Railway
admin/      React/Vite admin panel — builds INTO backend/public/admin
```

Why split this way: your Namecheap **Stellar** plan is shared PHP/Apache
hosting and can't run a persistent Node process. So:

- The **frontend** is built as plain HTML/CSS/JS (`next build` with
  `output: 'export'`) and just gets FTP'd to Namecheap like any static site.
  It calls the backend API at *build time* to pull in your services, blog
  posts, case studies, etc.
- The **backend** (API + admin panel + AI features) needs to run 24/7, so it
  lives on a small Node host — Render or Railway have free/cheap tiers that
  are plenty for this. Your domain stays on Namecheap; you just point a
  subdomain like `api.corebitmedia.com` at it.

## 1. Backend setup (Render/Railway)

```bash
cd backend
cp .env.example .env
# fill in DB credentials, JWT_SECRET, ANTHROPIC_API_KEY
npm install
npm run seed     # creates your first admin login + seeds existing services/FAQs
npm run dev      # local dev on http://localhost:4000
```

Deploy: push this repo to GitHub, connect it in Render/Railway, set the same
env vars there, and set the start command to `npm start` (after `npm run
build` in `/admin`, see step 2). Point `api.corebitmedia.com` at the
generated Render/Railway URL via a CNAME record in Namecheap's DNS.

Database: use Render/Railway's managed MySQL (a few minutes to spin up), or
your Namecheap cPanel MySQL if you'd rather keep data there — either works,
just update `DB_HOST` etc. in `.env`.

## 2. Admin panel

The admin panel is a separate Vite app that **builds into the backend**, so
your team logs in at `api.corebitmedia.com/admin` — no separate deploy step.

```bash
cd admin
npm install
echo "VITE_API_BASE_URL=https://api.corebitmedia.com" > .env
npm run build     # outputs to backend/public/admin
```

Run this build before every backend deploy (or wire it into your CI).

First login: use the email/password from `npm run seed` (defaults to
`admin@corebitmedia.com` / whatever you set as `SEED_ADMIN_PASSWORD` in
`.env`) — **change the password immediately** after first login via the
Users page.

Roles:
- **Admin** — full access, manages the team
- **Editor** — creates/edits/publishes any content, approves authors' posts
- **Author** — creates/edits their own content; publishing sends it to
  "Pending Review" until an editor approves it

## 3. Frontend (Namecheap shared hosting)

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_BASE_URL=https://api.corebitmedia.com" > .env.local
npm run build     # outputs static site to /out
```

Then, via Namecheap's cPanel File Manager or FTP (FileZilla):
1. Zip the contents of `frontend/out`
2. Upload + extract into `public_html` on your Stellar hosting
3. Done — no Node needed on this side at all

**To publish new content:** whenever an admin/editor publishes something in
the admin panel, re-run `npm run build` in `/frontend` and re-upload `/out`.
This is the one manual step with static export — you may want to automate it
later with a small GitHub Action that rebuilds+uploads via FTP on a schedule
or on a webhook from the backend.

## 4. AI SEO / AEO / GEO features

In the admin content editor, the **"✨ AI Optimize This Content"** button
calls Claude (via `backend/src/services/aiSeoService.js`) and automatically
fills in:

- **SEO**: meta title, meta description, focus keyword, a 0–100 score with
  improvement notes
- **AEO**: a short "AI Answer Summary" written so voice assistants and
  Google's AI Overviews can quote it directly as a complete answer
- **GEO**: FAQ Q&A pairs (rendered as `FAQPage` schema on the live page) and
  full `schema.org` structured data (`Service`/`Article`/`WebPage`), which is
  what generative engines like ChatGPT, Perplexity, and Gemini use to decide
  what to cite

Also available: AI-generated image alt text, and AI internal-linking
suggestions between your pages/posts.

Requires `ANTHROPIC_API_KEY` set in the backend's `.env`.

## What's built vs. what's next

**Done:** full CMS data model, JWT auth + roles, admin panel (dashboard,
content CRUD for pages/services/blog/case studies, testimonials, FAQs,
leads, team management), AI SEO/AEO/GEO engine, and a Next.js frontend
covering Home, About, Services (+ sub-services), Case Study, Blog, Contact,
sitemap.xml, robots.txt, and Organization/FAQPage/Service schema markup.

**Recommended next steps:**
- Swap the plain `<textarea>` editor for a rich-text editor (Tiptap) once
  you're ready — the data model already supports HTML/Markdown in `body`
- Migrate your actual existing blog posts/case studies from WordPress into
  the new CMS (I can help write an import script from a WP XML export)
- Set up the auto-rebuild pipeline (GitHub Action) so publishing content
  doesn't require a manual FTP re-upload
- Add a proper WYSIWYG image gallery in the admin uploader
