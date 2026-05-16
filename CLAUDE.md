# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server (http://localhost:3000).
- `npm run build` — production build. Use this (not just typecheck) to catch App Router / server-action wiring errors.
- `npm run start` — serve the production build.
- `npm run lint` — ESLint with `eslint-config-next`, Prettier, and the Tailwind plugin.
- `npm run typecheck` — `tsc --noEmit`. Faster than `build` for type-only verification.
- `npm run format` — Prettier write across `**/*.{ts,tsx,md}`.

No test runner is configured. Validate changes with `typecheck` + `lint` + `build`; exercise UI flows in the browser when feasible.

React is pinned to a 19 RC and forced via `package.json` `overrides`. If npm complains about peer deps, prefer `npm install --legacy-peer-deps` over changing the React version.

## Architecture

This is a Next.js 16 / React 19 App Router app backed by **Appwrite Cloud** (Auth + Database + Storage). There is no custom database layer — Appwrite collections are the source of truth.

### Route groups (`app/`)

- `(marketing)/` — public landing pages.
- `(auth)/` — `/login`, `/register`, OTP modal flow.
- `(dashboard)/` — authenticated routes: `/dashboard` and `/dashboard/[type]` (documents | images | media | others).
- `api/auth/oauth-callback/` — Google + GitHub OAuth landing endpoint. Uses the **Users admin service** (not `account.get()`) to look up the user post-redirect — see commit `191723b`. Do not regress this.
- `api/health/` — keep-warm endpoint invoked by the Vercel cron (`vercel.json`, daily at 13:00 UTC).

### Appwrite clients (`lib/appwrite/`)

Two factory functions, both `"use server"`:

- `createSessionClient()` — reads the `appwrite-session` cookie and binds it to a Client. Used for *acting as the logged-in user*. Throws `"No session"` if the cookie is missing — callers in server actions catch this and redirect to login.
- `createAdminClient()` — uses `NEXT_APPWRITE_KEY`. Used for privileged lookups (OAuth callback, user provisioning) and anything that must bypass per-user permissions.

`appwriteConfig` in [lib/appwrite/config.ts](lib/appwrite/config.ts) centralizes all env-derived IDs. Reach for it instead of re-reading `process.env`.

### Server actions (`lib/actions/`)

All mutations go through server actions, not API routes:

- `user.actions.ts` — OTP send/verify, session cookie write, sign-out, current-user fetch.
- `file.actions.ts` — upload, list (with search/sort/type filter), rename, share (per-file `users: string[]`), delete. Uploads hit Appwrite Storage and write a metadata row to the Files collection in the same action.
- `oauth.actions.ts` — Google/GitHub OAuth init; the callback route finishes the flow.

Pattern: server action → `createSessionClient()` / `createAdminClient()` → Appwrite SDK → `revalidatePath()` for affected route → return a plain object (no class instances) to the client.

### Data model (Appwrite, not code)

The README documents the required collections. Two non-obvious shapes:

- **Files.owner** is an Appwrite *relationship* → Users collection. Queries that need owner fields must include them via `Query.select` or rely on the relationship expansion.
- **Files.users** is a plain `string[]` of email addresses for sharing. Membership checks happen in queries (`Query.contains("users", currentUserEmail)` style) — there is no separate share collection.
- **Files.deletedAt** (datetime, optional) — soft-delete marker. NULL/missing = active; non-null = trashed. `getFiles`/`getTotalSpaceUsed` filter on `Query.isNull("deletedAt")`; the Trash page uses `Query.isNotNull("deletedAt")`.
- **Files.shareToken** (string, optional, **indexed**) + **Files.shareExpiresAt** (datetime, optional) — public share links. Anyone with the token can read the file at `/share/<token>` until expiry; revoking clears both fields.
- **Files.folderId** (string, optional, **indexed**) — references a row in the Folders collection. NULL/missing = root. `getFiles({ folderId })` filters by this (use `null` for root-only).
- **Folders** (separate collection) — single level of nesting today (`parentId` optional, indexed). Soft-deleted via `deletedAt`. Per-document permissions are written at create time (`Permission.read/update/delete(Role.user(accountId))`).

### UI layer

- `components/ui/` is shadcn/ui (`new-york` style, see `components.json`). Treat these as vendored — edit freely, but expect future `shadcn add` runs to overwrite.
- `components/magicui/` contains animated decorative components (marquee, bento, aurora, meteors, dot/grid). Used by the marketing pages.
- Top-level `components/*.tsx` are app-specific (Sidebar, Header, FileUploader, ActionDropdown, Chart, etc.).
- Theming is `next-themes` with class strategy; tokens live in [app/globals.css](app/globals.css) and [tailwind.config.ts](tailwind.config.ts).

### SEO / production niceties

`app/layout.tsx` wires metadata, JSON-LD, and theme provider. `app/opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, and `manifest.ts` are edge-rendered. `NEXT_PUBLIC_SITE_URL` must be set to the production origin or these resolve to localhost.

## Conventions worth knowing

- Path alias `@/*` → repo root (see `tsconfig.json`). Prefer `@/lib/...` over relative `../../`.
- Files marked `"use server"` at the top are server actions; do not import them into client components except via the action-call pattern.
- Toasts use `sonner`. Don't add another toast lib.
- Forms use `react-hook-form` + `zod` via `@hookform/resolvers`. Match this pattern for any new form.
- Don't introduce a state-management library; the app uses server actions + `useState` + URL params (search/sort are query-string driven and debounced via `use-debounce`).

## Environment

Required vars (see README for full list):

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT`, `NEXT_PUBLIC_APPWRITE_DATABASE`
- `NEXT_PUBLIC_APPWRITE_USERS_COLLECTION`, `NEXT_PUBLIC_APPWRITE_FILES_COLLECTION`, `NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION`, `NEXT_PUBLIC_APPWRITE_BUCKET`
- `NEXT_APPWRITE_KEY` (server-only API key)
- `CRON_SECRET` (validated by `/api/health` for the Vercel cron)

`NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION` powers the folders feature. The provisioning script (`scripts/setup-v2-schema.mjs`) creates the collection on first run and prints the ID for you to add. Folder server actions call `requireFoldersCollectionId()` (in `lib/appwrite/config.ts`) and throw a clean error if it's missing.

When adding new Appwrite resources, thread their IDs through `appwriteConfig` rather than reading `process.env` at the call site.
