# Capstone Study Assistance

Monorepo for a study assistance platform with separate Next.js UIs for **students** and **professors/admin**.

## Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or later
- [pnpm](https://pnpm.io/installation) 9.x

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

## Project structure

```
Capstone-study-assistance/
├── apps/
│   ├── student/          # Student portal  → http://localhost:3000
│   └── admin/            # Professor portal → http://localhost:3001
├── packages/
│   ├── ui/               # Shared React components (Button, Card, …)
│   ├── types/            # Shared TypeScript types
│   ├── api-client/       # HTTP client for the external backend
│   └── config/           # Shared TypeScript config
├── docs/                 # Project documentation
├── package.json          # Root workspace scripts
├── pnpm-workspace.yaml
└── turbo.json
```

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/cathe-michline/Capstone-study-assistance.git
   cd Capstone-study-assistance
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Copy the example env file in each app:

   ```bash
   cp apps/student/.env.example apps/student/.env.local
   cp apps/admin/.env.example apps/admin/.env.local
   ```

   Edit both `.env.local` files and set your backend URL:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Running the project

### Run both apps (recommended)

```bash
pnpm dev
```

- Student app → [http://localhost:3000](http://localhost:3000)
- Admin app → [http://localhost:3001](http://localhost:3001)

### Run a single app

```bash
pnpm dev:student        # Student app only
pnpm dev:student:clean  # Student app (clears Next.js cache first)
pnpm dev:admin          # Admin app only
```

## Other commands

```bash
pnpm build         # Production build for all apps and packages
pnpm lint          # Lint all packages
```

## App routes

### Student (`apps/student`)

| Route | Description |
|-------|-------------|
| `/login` | Student sign in |
| `/register` | Student registration |
| `/` | AI Assistant (chat) |
| `/unit-resources` | Unit materials and downloads |
| `/assignments` | Assignments and due dates |
| `/team-support` | Teamwork guidance |
| `/profile` | Profile and unit access requests |

### Admin (`apps/admin`)

| Route | Description |
|-------|-------------|
| `/login` | Professor sign in |
| `/` | Admin dashboard |
| `/courses` | Manage courses |
| `/courses/new` | Create a course |
| `/courses/[courseId]` | Course detail |
| `/courses/[courseId]/students` | Course roster |
| `/students` | All students |
| `/content` | Study materials |
| `/analytics` | Usage analytics |
| `/settings` | Account settings |

## Backend

This repo is **frontend-only**. Both apps communicate with an external backend through `packages/api-client`. Update `NEXT_PUBLIC_API_URL` to point at your API server.

## Branch workflow

- `main` — stable releases
- `dev` — active development
