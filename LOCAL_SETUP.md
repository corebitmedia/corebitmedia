# Local Development Setup

Three separate apps that run together:
1. **backend** — Node/Express API + MySQL (port 4000)
2. **admin** — React admin panel (port 5173 in dev)
3. **frontend** — Next.js public site (port 3000 in dev)

## TL;DR — one command

```bash
# one-time only:
npm install
npm run setup      # installs everything + copies .env files + seeds the DB

# every time after that:
npm run dev         # starts backend + admin + frontend together
```

Run these from the **project root** (the folder with this file in it). `npm run setup` will still stop and warn you if MySQL isn't running or `backend/.env` has the wrong DB credentials — fix those and re-run `npm run seed --prefix backend` once, then `npm run dev` works from then on.

> Note: the `frontend` scaffold currently has Header/Footer/styles/API client
> done but the actual pages (Home, Services, Blog, etc.) are still being
> built — just ask Claude to continue and it'll pick up where it left off.
> You can fully run and test the **backend + admin panel** right now, though.

---

## 0. Prerequisites

- **Node.js 18+** — check with `node -v`
- **MySQL** running locally. Easiest options:
  - Install MySQL directly (mysql.com) or via `brew install mysql` (Mac) / XAMPP (Windows)
  - Or run it in Docker: `docker run --name cbm-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=corebitmedia -p 3306:3306 -d mysql:8`

Create the database (skip if you used the Docker command above, which already creates it):
```sql
CREATE DATABASE corebitmedia;
```

---

## 1. Backend (manual, if not using `npm run setup`)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=corebitmedia
DB_USER=root
DB_PASSWORD=root          # whatever you set
JWT_SECRET=some_long_random_string
FRONTEND_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-xxxx   # only needed to use the AI Optimize button
SEED_ADMIN_EMAIL=you@corebitmedia.com
SEED_ADMIN_PASSWORD=ChangeMe123!
```

Create tables + your first admin login + sample services/FAQs:
```bash
npm run seed
```

Start the API:
```bash
npm run dev
```
Check it worked: open http://localhost:4000/api/health — should return `{"ok":true,...}`

---

## 2. Admin panel (manual)

In a **new terminal**:
```bash
cd admin
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173/admin/login — log in with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` you set above.

You should be able to: view the dashboard, create/edit Services, Blog Posts, Case Studies, Testimonials, FAQs, and click **"✨ AI Optimize This Content"** (requires a valid `ANTHROPIC_API_KEY` in the backend `.env`).

---

## 3. Frontend (manual, once pages are finished)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
Open http://localhost:3000

`next dev` runs a normal dev server (SSR-like, hot reload) — the static-export behavior (`output: 'export'`) only kicks in when you run `npm run build`, which is what you'll do for the actual Namecheap deployment later.

---

## Common local issues

- **"Unable to connect to the database"** → MySQL isn't running, or the `.env` credentials don't match. Test with `mysql -u root -p` using the same credentials.
- **Admin panel shows CORS errors** → make sure the backend is running; allowed dev origins (`localhost:5173`, `localhost:3000`) are already whitelisted in `backend/src/server.js`.
- **AI Optimize button fails** → `ANTHROPIC_API_KEY` missing/invalid in backend `.env`, or you're out of API credits.
- **Port already in use** → change `PORT` in backend `.env`, or stop whatever else is on 3000/4000/5173.

---

## Later: deployment (Namecheap + Render/Railway)

Once everything works locally:
- **Frontend**: `npm run build` in `/frontend` → uploads the generated `/out` folder to Namecheap via FTP/cPanel File Manager
- **Backend + Admin**: deploy the `/backend` folder (which also serves the built `/admin`) to Render or Railway, connected to a managed MySQL instance
- Full step-by-step deploy guide comes once the frontend pages are finished and you've smoke-tested locally.
