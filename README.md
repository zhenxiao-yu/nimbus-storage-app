<div align="center">

# Nimbus

**Cloud storage that gets out of your way.**

A modern, end-to-end cloud workspace for your files — built with Next.js 15, React 19, Appwrite, shadcn/ui, and Magic UI patterns. Free to deploy on Vercel + Appwrite Cloud.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzhenxiao-yu%2Fnimbus-storage-app)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-cloud-fd366e?logo=appwrite)](https://appwrite.io/)

</div>

---

## Highlights

- **Passwordless auth.** Magic-link OTP via Appwrite — no passwords stored, no resets to manage.
- **Drag-and-drop uploads.** Server actions write to Appwrite Storage with auto file-type classification (documents, images, media, others).
- **Live search & sorting.** Debounced search across every file with name, date, and size sorts.
- **Sharing & revocation.** Per-file user lists, instant revoke, no extra tooling.
- **Modern UI.** Light + dark themes, animated bento landing page, polished empty/loading/error states.
- **Production-ready.** Security headers, dynamic OG images, sitemap & robots, structured data, and Vercel Analytics + Speed Insights baked in.

## Tech stack

| Layer       | Tools                                                                |
| ----------- | -------------------------------------------------------------------- |
| Framework   | Next.js 15 (App Router, server actions) · React 19                   |
| Backend     | Appwrite Cloud (Auth, Database, Storage)                             |
| Styling     | Tailwind CSS, shadcn/ui (`new-york`), Magic UI patterns, Lucide      |
| State/forms | React Hook Form, Zod                                                 |
| Animation   | Framer Motion, custom keyframes                                      |
| Tooling     | TypeScript 5, ESLint, Prettier (with Tailwind plugin), `next-themes` |

## Quick start

### 1. Prerequisites

- Node.js 20+
- An [Appwrite Cloud](https://cloud.appwrite.io) project (or a self-hosted Appwrite instance)

### 2. Configure Appwrite

In your Appwrite project, create:

- A **Database** (note its ID).
- A **Users** collection with attributes: `fullName` (string), `email` (string, unique), `avatar` (URL), `accountId` (string, unique).
- A **Files** collection with attributes: `type`, `name`, `url`, `extension`, `size`, `owner` (relationship → users), `accountId`, `users` (string\[]), `bucketFileId`.
- A **Storage bucket** with appropriate read/write permissions.

Generate an **API Key** with `databases.read`, `databases.write`, `storage.read`, `storage.write`, and `users.read`.

### 3. Environment variables

Create `.env.local` from the template below:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE=your_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION=your_users_collection_id
NEXT_PUBLIC_APPWRITE_FILES_COLLECTION=your_files_collection_id
NEXT_PUBLIC_APPWRITE_BUCKET=your_bucket_id
NEXT_APPWRITE_KEY=your_server_api_key
```

> When deploying, update `NEXT_PUBLIC_SITE_URL` to your production domain so SEO metadata, sitemaps, and OG images resolve correctly.

### 4. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Description                            |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Start the dev server.                  |
| `npm run build`     | Production build.                      |
| `npm run start`     | Run the production build.              |
| `npm run lint`      | ESLint with Next + Tailwind + Prettier rules. |
| `npm run typecheck` | `tsc --noEmit`.                        |
| `npm run format`    | Prettier write across the project.     |

## Project structure

```
app/
  (marketing)/         # Public landing — hero, bento, FAQ, CTA
  (auth)/              # /login, /register, OTP modal
  (dashboard)/         # /dashboard and /dashboard/[type]
  globals.css          # Design tokens, light + dark
  layout.tsx           # Root layout, theme provider, SEO, JSON-LD
  opengraph-image.tsx  # Edge-rendered OG image
  sitemap.ts | robots.ts | manifest.ts
components/
  ui/                  # shadcn primitives
  magicui/             # animated marquee, bento, dot/grid, aurora, meteors…
  marketing/           # landing sections
  …Sidebar, Card, Chart, etc.
constants/             # site config, navigation, sort options
lib/
  appwrite/            # session + admin clients
  actions/             # server actions: file + user
  utils.ts             # cn, formatters, file-type helpers
```

## Deploy

1. Push to GitHub.
2. Import the repo on [Vercel](https://vercel.com/new). Set the env vars above.
3. Add your Vercel domain to Appwrite **Platforms** (Web).
4. Done — every push deploys.

For self-hosting, any Node 20+ host works. Build with `npm run build` and run `npm run start`.

## Optional: OAuth providers

Nimbus ships with one-click sign-in for **Google** and **GitHub**. To turn them on:

### Google

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (type: Web application).
2. Add authorized redirect URI:
   `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/<APPWRITE_PROJECT_ID>`
3. In Appwrite Console → **Auth → Settings → Google**, paste the Client ID and Client Secret. Toggle on.

### GitHub

1. In [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers), create a new OAuth App.
2. Authorization callback URL:
   `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/<APPWRITE_PROJECT_ID>`
3. Paste the Client ID and Secret into Appwrite Console → **Auth → Settings → GitHub**.

The “Continue with Google/GitHub” buttons will then work end-to-end. Until configured, clicking them surfaces a friendly toast.

## Optional: Vercel Cron (keep Appwrite warm)

Appwrite Cloud's free tier auto-pauses projects after ~30 days of inactivity. Nimbus ships with a daily cron at [vercel.json](vercel.json) that hits `/api/health`, which in turn pings Appwrite's `/health` endpoint with the server API key. That single request resets the inactivity timer.

To require an auth header (recommended for production):

```bash
vercel env add CRON_SECRET production
# paste a long random value
```

When `CRON_SECRET` is set, the route rejects any request that doesn't carry `Authorization: Bearer ${CRON_SECRET}`. Vercel Cron sends this header automatically.

## Roadmap

- Folders + drag-to-organize
- Tagging & smart collections
- Public sharing links with expiry
- PWA offline cache + background uploads
- File previews (PDF, video, audio) inline
- Multi-tenant workspaces

## License

MIT © [Mark Yu](https://m4rkyu.com)

## Acknowledgements

Patterns inspired by [Magic UI](https://magicui.design), built on [shadcn/ui](https://ui.shadcn.com), powered by [Appwrite](https://appwrite.io).
