# TaskNest — Reminder Web App

TaskNest is a Next.js reminder and task management web app with user registration/login, reminder tracking, categories, priorities, recurring schedules, analytics, and an admin dashboard.

## Repository Layout

- `tasknest-reminder/` — main Next.js application
- `.env.example` — example environment file
- `vercel.json` — deployment configuration

## Features

- User registration and login
- Reminder creation, editing, and completion tracking
- Priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- Recurring reminders (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`, `CUSTOM`)
- Categories and dashboard analytics
- Admin management page

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + Radix UI
- date-fns, zod, lucide-react

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
cd tasknest-reminder
npm ci
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

Run these from `tasknest-reminder/`:

- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run start` — run production server
- `npm run lint` — run ESLint (Next.js lint)

## Environment Variables

The repository includes `.env.example` with a sample `DATABASE_URL`.

> Note: the current app logic uses a client-side localStorage data store (`tasknest-reminder/lib/store.ts`) for users, reminders, and categories.

## License

This project is licensed under the terms in [LICENSE](./LICENSE).
