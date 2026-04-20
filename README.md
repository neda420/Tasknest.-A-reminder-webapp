# TaskNest — Reminder Web App

TaskNest is a Next.js reminder and task management web app with user registration/login, reminder tracking, categories, priorities, recurring schedules, analytics, and an admin dashboard.
<img width="1919" height="1033" alt="image" src="https://github.com/user-attachments/assets/6f301f5f-f2f1-4eb5-a7e4-dd6a25921923" />
<img width="1919" height="1032" alt="image" src="https://github.com/user-attachments/assets/29eb7588-516f-429c-b65a-7e662f5b57e1" />
<img width="1919" height="1026" alt="image" src="https://github.com/user-attachments/assets/c22d000b-10a5-4ac4-b4d2-6caa30c9aaf3" />
<img width="1919" height="1033" alt="image" src="https://github.com/user-attachments/assets/dae29f40-7733-46d0-aa6c-d163242e2789" />
<img width="1919" height="979" alt="image" src="https://github.com/user-attachments/assets/60e70e6d-1b28-4831-8226-e98b2b0b60bf" />
<img width="1919" height="976" alt="image" src="https://github.com/user-attachments/assets/6dc3d7c1-0974-461e-aece-e1f0534293c7" />
<img width="1919" height="976" alt="Screenshot 2026-04-20 120242" src="https://github.com/user-attachments/assets/04f4bb3f-7aff-4a47-959c-a462b4e85858" />


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
