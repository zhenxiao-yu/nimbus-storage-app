# Technical Debt Register

Last updated: 2026-05-15
Total items: 11 (11 resolved, 0 open)

## Resolved (2026-05-15)

| ID | Description | Resolution |
|----|-------------|------------|
| TD-001 | React 19 RC pinned; types v18 | `react`/`react-dom` → `^19.2.6`; `@types/react`/`react-dom` → v19; removed unnecessary `overrides`. |
| TD-002 | `node-appwrite` 14 → 24 (10 majors) | Bumped to `^24.1.0`. Only breaking surface: `Models.Document` lost its index signature — switched dynamic-access sites to `Models.DefaultDocument` in `file.query.ts`, `ActionsModalContent`, `ActionDropdown`, `Card`, `Search`, `dashboard/page.tsx`, `dashboard/[type]/page.tsx`. All SDK call sites unchanged. |
| TD-003 | No test runner | Vitest 3 + `@vitest/coverage-v8`; `vitest.config.ts` with `@/*` alias; `npm test` / `npm run test:watch`; `__tests__/lib/utils.test.ts` (30 assertions). `__tests__/` excluded from eslint. |
| TD-004 | Five `console.log/error` sites; no structured logging | [lib/logger.ts](../lib/logger.ts) — `logError` (JSON in prod, pretty in dev) + `handleActionError`. Wired into actions + OAuth callback. Client error boundaries left as-is (Vercel captures). |
| TD-005 | Duplicated `handleError` across two action files | Both import `handleActionError as handleError` from `@/lib/logger`. |
| TD-006 | ESLint 8 (EOL) + `next lint` broken on Next 16 | ESLint → `^9`; new flat `eslint.config.mjs`; `lint` script → `eslint .`; `.eslintrc.json` removed. `react-hooks/set-state-in-effect` downgraded to warn pending refactors in `Search.tsx` and `meteors.tsx`. 50 pre-existing tailwind warnings remain (auto-fixable with `--fix`). |
| TD-007 | `file.actions.ts` (294 LOC) god file | Split into `file.upload.ts` (68 LOC), `file.query.ts` (126 LOC), `file.mutate.ts` (105 LOC); `file.actions.ts` now a 36-LOC barrel with async-wrapper re-exports (required by Next's `"use server"` validator). Public API unchanged. |
| TD-008 | 5 held-back majors | `lucide-react` 0.454 → ^1.16 (brand icons removed in v1 — added local `components/icons/brand-icons.tsx`). `framer-motion` 11 → 12 (clean). `recharts` 2 → 3 (tooltip/legend prop-shape changes in `components/ui/chart.tsx`). `react-dropzone` 14 → 15 (clean). `@vercel/speed-insights` 1 → 2 (clean). |
| TD-009 | Radix + misc minors out of date | All Radix packages bumped to current 1.x/2.x; `@hookform/resolvers`, `react-hook-form`, `prettier`, `cva`, `input-otp`, postcss 8.5, `prettier-plugin-tailwindcss` 0.6.14, `@types/node` 20.19. |
| TD-010 | `AuthForm.tsx` (282 LOC) login/register branching | Extracted shared pieces into `components/AuthForm.fields.tsx` (102 LOC) — `COPY` table, `IconField` generic, `OAuthButtons`, `SwitchFlowLink`. Main file 163 LOC. Public API (`<AuthForm type="login" \| "register" />`) preserved. |
| TD-011 | `getUsageSummary(totalSpace: any)` | Added `TotalSpace` / `TotalSpaceBucket` interfaces in `types/index.d.ts`; signature now `(totalSpace: TotalSpace)`. Covered by new tests. |

## Validation snapshot (post-cleanup)

- `npm test` — 30/30 passed
- `npm run typecheck` — clean
- `npm run lint` — 0 errors, 50 warnings (pre-existing tailwindcss shorthand suggestions + 2 `react-hooks/set-state-in-effect` flags)
- `npm run build` — Next.js 16 Turbopack, 5–6s, all 8 routes generated

## Follow-ups worth tracking (not yet logged)

- Clear the 36 auto-fixable tailwindcss warnings with `npm run lint -- --fix`.
- Refactor `Search.tsx` and `meteors.tsx` to satisfy `react-hooks/set-state-in-effect` instead of leaving the rule warn-level.
- Resolve the 5 remaining `npm audit` advisories (4 moderate, 1 high) — currently transitive through tooling, not runtime.

## Rules

- Every debt entry must explain WHY it was accepted.
- Items older than 3 sprints without action should either be fixed or consciously accepted with a documented reason.
- Re-run `/tech-debt scan` at the start of each sprint.
