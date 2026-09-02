# Admin Backend API (Python)

FastAPI + Motor (async MongoDB) + PyJWT API for the admin (professor) portal.
Runs on **http://localhost:8000** — the URL `NEXT_PUBLIC_API_URL` already points at.

This is a 1:1 port of the previous Express/TypeScript backend: same routes, same
JSON shapes (`id` instead of `_id`, `passwordHash` never sent), same status codes
and error messages, and the same Mongo collections (`admins`, `students`,
`resources`, `unitaccessrequests`) — so both the existing Atlas data and the
admin frontend work without any changes. Passwords hashed by the old backend
(bcryptjs) still verify, since Python's `bcrypt` reads the same `$2b$` hashes.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in MONGODB_URI and JWT_SECRET
python seed.py                   # creates the first admin + demo data
uvicorn app.main:app --reload --port 8000
```

`python seed.py` prints the login it created (default `admin@capstone.edu.au` / `Admin@123`).

Interactive API docs (new with FastAPI): http://localhost:8000/docs

## Atlas checklist

1. In Atlas → **Network Access**, add your current IP (or `0.0.0.0/0` while developing).
2. In Atlas → **Database Access**, confirm the user has *readWrite* on the `capstone` database.
3. The database name comes from the path in the URI (`.../capstone?...`). Without it you get `test`.
4. Same URI works in MongoDB Compass — paste it into the connect box.

## Endpoints

All routes except `/health` and `/auth/login` need `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |
| POST | `/auth/login` | `{ email, password }` → `{ token, admin }` |
| GET | `/auth/me` | Current admin |
| GET | `/overview` | Dashboard counters + recent requests |
| GET | `/students` | `?search=&unit=&status=` |
| GET | `/students/:id` | Single student |
| POST | `/students` | Create student |
| PATCH | `/students/:id` | Update student |
| PATCH | `/students/:id/units` | `{ unitCode, action: "grant" \| "revoke" }` |
| DELETE | `/students/:id` | Delete student + their requests |
| GET | `/unit-requests` | `?status=Pending` |
| POST | `/unit-requests` | Student raises a request |
| PATCH | `/unit-requests/:id` | `{ status: "Approved" \| "Rejected" }` — syncs student units |
| GET | `/resources` | `?unit=&category=&search=&visible=` |
| POST | `/resources` | Create resource |
| PATCH | `/resources/:id` | Update resource |
| PATCH | `/resources/:id/visibility` | Show/hide toggle |
| DELETE | `/resources/:id` | Delete resource |
| GET | `/admins` | List admins |
| POST | `/admins` | Create admin |
| PATCH | `/admins/:id` | Update name / status / password |
| PATCH | `/admins/:id/toggle` | Active ⇄ Inactive |
| DELETE | `/admins/:id` | Delete admin (not yourself) |

## Response shape

Documents come back with `id` (not `_id`), and `passwordHash` is never sent —
they match `apps/admin/lib/types.ts` field-for-field, except `id` is a Mongo
ObjectId string instead of a number.

Errors are `{ "message": "..." }` (plus `issues` on validation errors, HTTP 400),
duplicate keys are 409, bad ObjectIds are 400 `Invalid id` — same as before.

## Quick test

```bash
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@capstone.edu.au","password":"Admin@123"}'

curl -s http://localhost:8000/students -H "Authorization: Bearer <token>"
```

## Structure

```
backend/
├── app/
│   ├── config.py             # Env vars (.env)
│   ├── db.py                 # Motor connection + unique indexes
│   ├── auth.py               # JWT sign/verify (7-day tokens)
│   ├── schemas.py            # Pydantic request validation (was Zod)
│   ├── serializers.py        # id/_id transform, hides passwordHash
│   ├── main.py               # App factory, CORS, error handlers
│   └── routes/               # auth, admins, students, unit_requests, resources, overview
├── seed.py                   # Seeds first admin + demo data
├── requirements.txt
└── .env                      # Not committed
```
