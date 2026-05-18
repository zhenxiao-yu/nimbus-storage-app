# Changelog

## 2.0.0 — 2026-05-17

A product-grade pass on top of the original 1.0 demo. Roughly: 10 new product features, a top-to-bottom polish on UX and copy, full SEO + cookie-consent + legal pages, accessibility and responsive sweep, a hardened error/logging path, and a reproducible Appwrite setup script.

### Features

- **Folders.** Create, rename, soft-delete, and move files between folders. Breadcrumb nav on the folder page; Folders row on the dashboard root.
- **Trash + 30-day undo.** Delete is now soft-delete with a 7-second Undo toast. New `/dashboard/trash` route with Restore / Delete forever / Empty trash actions.
- **Public share links.** "Get share link" action generates a 32-char token with a 1/7/30/90-day expiry. The `/share/[token]` route is public — no account needed.
- **Command palette (⌘K / Ctrl+K).** Global keyboard launcher with fuzzy search across navigation, recent files, and actions (upload, theme, sign out).
- **In-app preview modal.** Click any file → modal opens with the right viewer for the file type (image, video, audio, PDF, text/markdown, fallback "Open in new tab").
- **Appwrite Realtime sync.** Upload/rename/delete in one tab and other open tabs refresh automatically. Subscribes with a short-lived JWT.
- **Multi-select + bulk operations.** Shift-click range select; ⌘/Ctrl-click toggle. Floating BulkActionsBar with Download, Move, Trash, and Clear actions.
- **Image thumbnails via Appwrite preview endpoint.** Cards request resized webp instead of full originals — meaningful bandwidth win on photo libraries.
- **PWA + offline shell.** Service worker precaches the app shell; `/offline` page renders when network fails; install prompt on supporting browsers.
- **Onboarding sample.** First-time signup auto-seeds a `Welcome to Nimbus.md` file so the dashboard is never empty on first visit.

### UX + visual polish

- Premium dashboard pass: aurora-backed storage chart with count-up percentage, color-coded summary cards with per-bucket progress bars, springy file-grid stagger, hover gradient wash, `layoutId` sidebar pill, avatar dropdown for sign-out.
- Premium marketing pass: hero with aurora + grid backdrop and gradient keyword, BorderBeam on the primary CTA, scroll-tilt on the product preview, glass-blur scroll-spy nav, smooth FAQ accordion, scroll-progress bar, meteors on the closing CTA.
- New favicon set (32 / 180 / 512) generated as edge ImageResponse routes matching the in-app cloud mark.
- Inline-SVG initials avatars: deterministic per-user gradient, zero network calls, never breaks.
- Thumbnails fail gracefully — if the Appwrite preview endpoint errors, the static file-type icon shows instead of a broken-image glyph.

### Quality + safety

- **Hardened logging.** New `lib/logger.ts` introduces `ActionError` and `handleActionError` — server-side errors are logged with full context, but only sanitized, generic messages reach the client. No more leaking Appwrite IDs or SDK stack traces through toasts.
- **Env validation.** New `lib/env.ts` with `requireEnv` / `requirePublicEnv` so a misconfigured deploy fails loudly with a clear message.
- **Cookie consent + legal pages.** GDPR-friendly banner with Necessary (locked) + Analytics categories; Vercel Analytics + Speed Insights now load only on consent. `/privacy`, `/terms`, `/cookies` pages linked from the footer.
- **SEO.** Per-page metadata, canonicals, robots noindex on private routes, JSON-LD `SoftwareApplication` + `Organization` + `WebSite`, brand-gradient OG image, complete sitemap + robots.
- **Security headers.** COOP / CORP / Origin-Agent-Cluster / CSP-Report-Only added on top of the existing HSTS / X-Frame / Referrer-Policy / Permissions-Policy set.
- **Error boundaries + loading skeletons** on every authenticated route, plus dedicated `not-found.tsx` for expired share links.
- **Responsive + a11y sweep.** Tested at 375 / 768 / 1024 / 1280. Focus-visible rings on every interactive element; decorative icons hidden from screen readers; `prefers-reduced-motion` honored throughout.
- **OAuth cookie fix.** Session cookie is now `SameSite=Lax` (was `Strict`) so the post-Google/GitHub redirect to `/dashboard` carries the cookie.

### Performance

- `getFiles` / `getTrashedFiles` raised default `Query.limit` from Appwrite's 25 to 100. `getTotalSpaceUsed` paginates with a cursor (up to 5000 files) and uses `Query.select` to slash payload size.
- `next.config.ts` `experimental.optimizePackageImports` for `lucide-react`, `recharts`, framer-motion, Radix barrels, cmdk.
- `Realtime` refresh debounced 200ms so a burst of events causes one re-render.

### Tooling

- ESLint 8 → 9 with flat config; `npm run lint` now runs `eslint .` (was broken under Next 16's removed `next lint` wrapper).
- Vitest 3 + `@vitest/coverage-v8` + 33 unit tests on `lib/utils`.
- `scripts/setup-v2-schema.mjs` provisions every collection / attribute / index needed for v2 features. Idempotent — safe to re-run on a fresh Appwrite project.
- `scripts/cleanup-duplicate-folder.mjs` for cleaning up duplicate Folders collections from misconfigured runs.

### Dependency bumps

- React 19 RC → stable 19.2.x.
- `node-appwrite` 14 → 24.
- `framer-motion` 11 → 12, `recharts` 2 → 3, `react-dropzone` 14 → 15, `lucide-react` 0.454 → 1.x, `@vercel/speed-insights` 1 → 2.
- New runtime dep: `appwrite` (browser SDK) for Realtime subscriptions.
- All Radix UI packages bumped to their current 1.1.x / 2.1.x / 2.2.x releases.

### Schema additions

Three new optional attributes on the **Files** collection (run `node --env-file=.env.local scripts/setup-v2-schema.mjs` to apply):

| Attribute | Type | Notes |
|-----------|------|-------|
| `deletedAt` | Datetime | NULL = active, non-null = trashed. |
| `shareToken` | String (64) | **Indexed.** Public share token. |
| `shareExpiresAt` | Datetime | When the share token expires. |
| `folderId` | String (64) | **Indexed.** NULL = root. |

Plus a new **Folders** collection with `name` / `ownerId` / `accountId` / `parentId` / `deletedAt`, indexed on `ownerId` and `parentId`.

Required env var added: `NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION`.

## 1.0.0 — initial

Original release: marketing landing, passwordless auth (OTP + Google + GitHub), dashboard with upload / list / rename / share-by-email / delete, basic Appwrite wiring.
