# Personal Budget Tracker

This is a simple full‑stack personal budget tracker.
- Backend: Django REST Framework (JWT auth)
- Frontend: Next.js + Tailwind + D3 charts
- Database: PostgreSQL (via Docker Compose)

## What you can do
- Sign in and see dashboard cards and charts
- Create categories (income/expense)
- Add transactions with filters and pagination
- Set current month budget and view Budget vs Spent chart

## Project folders
- `backend/` → Django API
- `frontend/` → Next.js app (UI)
- `docker-compose.yml` → Postgres setup

## Quick start
1) Start database
   - In project root: `docker compose up -d`
2) Run backend (Django)
   - Create venv: `python3 -m venv .venv && source .venv/bin/activate`
   - Install: `pip install -r backend/requirements.txt`
   - Migrate: `python backend/manage.py migrate`
   - Run: `python backend/manage.py runserver 8000`
3) Run frontend (Next.js)
   - `cd frontend`
   - `npm install`
   - Set env (optional): `NEXT_PUBLIC_API_BASE` to your backend URL
   - Dev server: `npm run dev` (open `http://localhost:3000`)

## Sign in
- Demo user: `test@example.com` / `password123`

## Deploy
- Frontend can be deployed on Vercel
  - Set project root to `frontend`
  - Add env `NEXT_PUBLIC_API_BASE` pointing to your backend
- Backend can be deployed on any host that supports Django + Postgres
  - Remember to allow your Vercel domain in CORS

## Notes
- The app uses a cookie named `access` for the JWT access token.
- Middleware protects routes and redirects to `/signin` when not authenticated.
- Charts are rendered client‑side with D3.
