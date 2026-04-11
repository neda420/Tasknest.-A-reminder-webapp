This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Prerequisites

You need a MySQL-compatible database accessible from the internet. Recommended providers that work well with Vercel's serverless environment:

- **[PlanetScale](https://planetscale.com)** (MySQL-compatible, serverless-friendly)
- **[Railway](https://railway.app)** (managed MySQL)
- Any other remotely accessible MySQL instance

### Steps

1. **Push your database schema** (run once from your local machine after setting `DATABASE_URL` in `.env`):
   ```bash
   cd tasknest-reminder
   npm run db:push
   ```

2. **Import the repository into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and import this repository.
   - Vercel will automatically detect the `vercel.json` at the repo root and use the correct build configuration.

3. **Set environment variables** in the Vercel project dashboard under *Settings → Environment Variables*:

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | MySQL connection string (e.g. `mysql://user:pass@host/db`) |

4. **Deploy** — Vercel will run `prisma generate && next build` automatically.

> **Note**: `prisma generate` is included in the build command so Prisma's TypeScript client is always generated fresh on each deployment.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
