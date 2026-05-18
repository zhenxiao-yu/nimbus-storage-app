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
- **Beam (P2P transfer).** Send any file to another browser with a 4-digit code at `/beam` — streams peer-to-peer over WebRTC, file bytes never touch Nimbus servers.
- **Modern UI.** Light + dark themes, animated bento landing page, polished empty/loading/error states.
- **Production-ready.** Security headers, dynamic OG images, sitemap & robots, structured data, and Vercel Analytics + Speed Insights baked in.
- **AI Workspace (optional).** Summarize text files with Claude inside the preview modal, and ask factual questions about your files at `/dashboard/ai`. Powered by `claude-haiku-4-5` with prompt caching. Enabled when `ANTHROPIC_API_KEY` is set — hidden automatically when it isn't.

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
NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION=your_folders_collection_id
NEXT_PUBLIC_APPWRITE_BUCKET=your_bucket_id
NEXT_APPWRITE_KEY=your_server_api_key

# Optional — enables the AI Workspace (file summaries + /dashboard/ai chat).
# Leave unset to hide all AI surfaces gracefully.
ANTHROPIC_API_KEY=your_anthropic_api_key
```

> **AI Workspace (optional).** Set `ANTHROPIC_API_KEY` to enable the
> "Summarize with AI" button inside the file preview modal and the
> Ask-AI chat at `/dashboard/ai`. Uses `claude-haiku-4-5` with prompt
> caching on the system prompt to keep follow-up turns fast and cheap.
> When the key is missing, the sidebar entry, the Summarize button, and
> the `/dashboard/ai` route all degrade quietly (the route shows a
> friendly "not configured" message).

> `NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION` enables folder organization. If it's missing, `scripts/setup-v2-schema.mjs` will create the collection and print the ID — copy that into `.env.local` (and your Vercel project env) before redeploying.

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

## Schema additions for v2 features

The easiest way to apply every v2 schema change is to run the provisioning script — it's idempotent and creates any missing attributes, indexes, or collections:

```bash
node --env-file=.env.local scripts/setup-v2-schema.mjs
```

This will:

- Add three attributes to **Files** (`deletedAt`, `shareToken`, `shareExpiresAt`) and index `shareToken`.
- Add `folderId` (string, indexed) to **Files** so files can belong to a folder.
- Create a new **Folders** collection (if the `NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION` env var isn't set, the script creates the collection and prints its ID so you can add it to `.env.local`).

| Collection | Attribute        | Type     | Required | Notes                                                                                       |
| ---------- | ---------------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| Files      | `deletedAt`      | Datetime | No       | NULL = active. Set to the deletion timestamp when a file is moved to Trash.                 |
| Files      | `shareToken`     | String   | No       | 64 char max. URL-safe random token for public share links (indexed).                        |
| Files      | `shareExpiresAt` | Datetime | No       | Public share link expiry. NULL when no link exists or the link has been revoked.            |
| Files      | `folderId`       | String   | No       | 64 char max. NULL = root. References a row in the Folders collection (indexed).             |
| Folders    | `name`           | String   | Yes      | 100 char max.                                                                               |
| Folders    | `ownerId`        | String   | Yes      | 64 char max — Users document ID (indexed).                                                  |
| Folders    | `accountId`      | String   | Yes      | 64 char max — Appwrite account ID; used for per-row permissions.                            |
| Folders    | `parentId`       | String   | No       | 64 char max. NULL = top-level folder (indexed).                                             |
| Folders    | `deletedAt`      | Datetime | No       | Soft-delete marker.                                                                         |

Existing rows without these attributes continue to work — `Query.isNull("deletedAt")` matches both explicit nulls and attribute-missing documents.

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

## First-time user experience

The first time a user signs up — whether via email OTP or Google/GitHub
OAuth — Nimbus seeds their workspace with a single sample file,
**"Welcome to Nimbus.md"**, so the dashboard isn't empty on the very
first visit. The source asset lives at [public/onboarding/welcome.md](public/onboarding/welcome.md)
and is uploaded by [lib/actions/onboarding.actions.ts](lib/actions/onboarding.actions.ts)
using the admin Appwrite client.

Notes:

- The seeder is **idempotent**: it checks for an existing file with the
  same name owned by the user before uploading, so re-runs (e.g., flaky
  retries on the serverless edge) won't pile up duplicates.
- Seeding failures are logged but **never block signup** — a user with a
  broken seed step still lands in an empty (but functional) dashboard.
- The welcome file is a normal user-owned file: they can rename, share,
  trash, or permanently delete it like anything else.

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
