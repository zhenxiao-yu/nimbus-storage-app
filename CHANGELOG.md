# Changelog

## 2.2.0 — 2026-05-17

**Beam** — peer-to-peer file transfer between browsers. AirDrop in the web.

- New ActionDropdown item **Beam** on every file. Opens `/dashboard/beam/[fileId]` (sender, authenticated). Sender gets a big 4-digit code.
- New public route `/beam` (receiver, no account needed). 4-digit OTP-style input. Once connected, the file streams over WebRTC and the browser triggers a download with the original filename.
- File bytes never touch any Nimbus / Vercel / Appwrite server during transfer. Only the WebRTC handshake (kilobytes) goes through the public PeerJS signaling broker; file data flows directly browser-to-browser.
- 64KB chunks over an `RTCDataChannel` with JSON control frames (`meta` / `done` / `abort`) and binary chunk frames.
- 4-digit code collision regeneration (up to 6 attempts). Graceful failure modes: bad code, dropped sender, WebRTC unsupported, oversized file warning.
- New dependency: `peerjs@^1.5.5` (dynamically imported, client-side only — never bundled on the server).

## 2.1.1 — 2026-05-17

Migrate AI Workspace from Anthropic to Groq for always-free inference.

- Drop `@anthropic-ai/sdk`. Add `groq-sdk`.
- `lib/actions/ai.actions.ts` switched to Groq's OpenAI-compatible chat completions API.
- Model: `llama-3.1-8b-instant` (fits the 6000 tokens/min free-tier cap).
- Env var: `ANTHROPIC_API_KEY` → `GROQ_API_KEY`. `AI_ENABLED` flag now reads the new key.
- Summary content cap dropped from 50KB → 25KB to fit free-tier token budget.
- Dropped Anthropic-only `cache_control: ephemeral` (Groq doesn't have that API).
- Rate-limit / overloaded / auth error handling translated to Groq's `Groq.APIError` shape.
- Public UI, route surfaces, and feature-flag behavior identical to 2.1.0.

## 2.1.0 — 2026-05-17

The "wow" pass: AI workspace and Quick Look.

### Features

- **AI Workspace** (Anthropic Claude integration, feature-flagged on `ANTHROPIC_API_KEY`):
  - **Summarize with AI** button in the preview modal for text-extractable files (`.md`, `.txt`, `.csv`, `.json`, `.log`). One click → Claude reads the file and returns a 3-5 sentence factual summary, rendered inline. Regenerate button.
  - **Ask AI** page at `/dashboard/ai`. Chat-style UI that lets the user ask questions about their workspace metadata ("What's my biggest file?", "How am I using my storage?", "Suggest how to organize these into folders"). The most recent 200 files' metadata is passed to the model — file *contents* are never sent.
  - Sidebar nav entry "Ask AI" (sparkles icon) — gracefully hidden when the API key isn't set.
  - Model: `claude-haiku-4-5`, `max_tokens: 1024`. Prompt caching enabled on the system prompt (`cache_control: { type: "ephemeral" }`) so cost stays bounded on repeat turns.
  - Sanitized errors via the existing `ActionError` pattern; rate-limit (429) gets a specific "try again in a moment" message.
- **Quick Look** (Finder-style hold-space peek):
  - Hit Space on any file → giant overlay slides in with the file rendered in-place; arrow keys flip prev/next through `orderedIds`; Space or Esc closes; click body to open the full PreviewModal.
  - Mobile: long-press (500ms) on a card opens Quick Look. First-time hint stored in `localStorage`.
  - Type-color-coded badge, "N of M" indicator, focus restoration on close.
  - Respects `prefers-reduced-motion`. Ignores Space when typing in inputs.

### New env var

- `ANTHROPIC_API_KEY` (optional) — enables AI Workspace surfaces. Set in `.env.local` for local dev and Vercel project env for prod. Without it, AI features are hidden cleanly.

### Dependency

- `@anthropic-ai/sdk@^0.96` (browser-side never imports it; only server actions).

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
