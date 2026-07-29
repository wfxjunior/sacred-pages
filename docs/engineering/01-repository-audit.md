# Repository Audit

Date: 2026-07-28
Auditor: Claude Code (Phase 0)
Scope: full inspection of the repository prior to any Phase 0/1 implementation.

---

## 1. Stack summary

| Concern         | Finding                                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | TanStack Start (`@tanstack/react-start` ^1.168.26) with TanStack Router file-based routing (`@tanstack/router-plugin`)                                          |
| UI library      | React 19.2                                                                                                                                                      |
| Build tool      | Vite 8 via `@lovable.dev/vite-tanstack-config` ^2.7.7 (wraps tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro, devtools, error-logger plugins)       |
| Server runtime  | Nitro 3 beta (`nitro` 3.0.260603-beta), Cloudflare as default build target per the Lovable wrapper                                                              |
| Styling         | Tailwind CSS v4 (`@tailwindcss/vite`), design tokens as CSS custom properties in `src/styles.css`                                                               |
| Component kit   | shadcn/ui — 48 components under `src/components/ui/` (Radix primitives)                                                                                         |
| Data layer      | TanStack Query v5 installed and wired in `router.tsx` / `__root.tsx`, but no queries exist yet                                                                  |
| Validation      | Zod ^3.24 installed (used by `react-hook-form` resolvers; not yet used for env/schema validation)                                                               |
| Package manager | Bun (`bun.lock`, `bunfig.toml` present). **Bun is NOT installed on this machine** — only node v26 / npm 11.12. The project README explicitly sanctions `npm i`. |
| TypeScript      | 5.8, `strict: true`, `noEmit`, bundler resolution, `@/*` path alias                                                                                             |
| Lint/format     | ESLint 9 flat config + typescript-eslint + prettier plugin; Prettier 3.7 (`.prettierrc`: printWidth 100, 2-space)                                               |
| Source control  | git, `main` branch, remote `github.com/wfxjunior/sacred-pages` (Lovable-synced — history rewrites forbidden per AGENTS.md)                                      |

## 2. Environment hazards (discovered during audit)

### 2.1 ExFAT volume — CRITICAL (environmental)

The repository lives on `/Volumes/Untitled` which is **ExFAT**:

- macOS creates AppleDouble `._*` metadata files next to every real file. 45+ of them pollute `git status` as untracked files.
- **Two AppleDouble files inside `.git/objects/pack/` were corrupting git operations** — every git command emitted `error: non-monotonic index .git/objects/pack/._pack-….idx`. They were removed during this audit (they are 4 KB Finder metadata, not git data; `git fsck` passes cleanly after removal). They may be recreated by Finder; if git errors reappear, delete `.git/objects/pack/._*` again.
- **AppleDouble files break the production build.** `vite build` copies `public/` into `.output/public/` and then `chmod`s each file; the copied `._robots.txt` disappears mid-build, failing with `ENOENT … chmod … ._robots.txt`. Fix: `find public .output -name "._*" -delete` before building. Observed and reproduced during this execution.
- AppleDouble files were also collected as **test files** by Vitest and as **lint targets** by ESLint (parse errors). Both are now excluded via config (`vitest.config.ts` `exclude`, `eslint.config.js` `ignores`, `.prettierignore`).
- ExFAT does not support symlinks. npm avoids hard failures in modern versions, but tool shims and some postinstall steps can misbehave. If installs fail, the durable fix is moving the project to an APFS volume.
- ExFAT has no POSIX permissions; every file shows mode 755. Harmless, but `git config core.fileMode false` may be needed if spurious mode diffs appear.

Mitigation applied in Phase 0: `._*` and `.DS_Store` added to `.gitignore`.

### 2.2 Missing `node_modules`

Dependencies were not installed at audit time. `npm install` was run as part of Phase 0 (README-sanctioned). Note: this creates `package-lock.json` alongside `bun.lock`; Lovable's cloud side uses Bun. Both lockfiles are kept — do not delete `bun.lock`.

## 3. Route inventory

All routes are file-based under `src/routes/`. `routeTree.gen.ts` is generated — never edit by hand.

| Route                        | File                            | Status                                                                              |
| ---------------------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| `/`                          | `index.tsx`                     | Landing page (hero + `LandingSections`) — visual, complete                          |
| `/about`                     | `about.tsx`                     | Static marketing page                                                               |
| `/features`                  | `features.tsx`                  | Static marketing page (1,370 lines — largest route)                                 |
| `/pricing`                   | `pricing.tsx`                   | Static pricing page (prices hardcoded via i18n keys — see §10)                      |
| `/signin`                    | `signin.tsx`                    | **Visual prototype** — no form logic; button is a `Link` to `/my-journey`           |
| `/signup`                    | `signup.tsx`                    | **Visual prototype** — same pattern                                                 |
| `/forgot`                    | `forgot.tsx`                    | **Visual prototype** — button does nothing                                          |
| `/onboarding`                | `onboarding.tsx`                | Visual prototype                                                                    |
| `/my-journey`                | `my-journey.tsx`                | Mock dashboard; **hardcoded "Good morning, Samuel."**                               |
| `/today`                     | `today.tsx`                     | Word-search journey flow, mock `TODAY` content, local component state only          |
| `/collections`               | `collections.tsx`               | Mock collection grid                                                                |
| `/collections/$slug`         | `collections.$slug.tsx`         | Only route with a `loader` (resolves mock data by slug)                             |
| `/favorites`                 | `favorites.tsx`                 | Mock favorites                                                                      |
| `/progress`                  | `progress.tsx`                  | Mock progress                                                                       |
| `/together`                  | `together.tsx`                  | Mock Journey Together UI                                                            |
| `/notifications`             | `notifications.tsx`             | Mock notification list                                                              |
| `/notifications/preferences` | `notifications.preferences.tsx` | Preference UI persisted to localStorage                                             |
| `/profile`                   | `profile.tsx`                   | Mock profile                                                                        |
| `/settings`                  | `settings.tsx`                  | Settings UI (language/theme wired to real providers; rest mock)                     |
| `/sitemap.xml`               | `sitemap[.]xml.ts`              | Server handler; **`BASE_URL = ""` — emits relative `<loc>` URLs (invalid sitemap)** |
| 404 / error                  | `__root.tsx`                    | Real notFound + error boundary components exist                                     |

No broken routes were found; all route files compile against the generated route tree.

## 4. Component inventory

- `src/components/ui/` — 48 shadcn/ui components. Stock; not audited line-by-line. Several are unused (e.g. `chart`, `carousel`, `menubar`, `input-otp`, `resizable`) — candidates for later cleanup, kept for now (rule: no silent deletions).
- `src/components/site/` — 24 product components. Notable:
  - `AppShell.tsx` — authenticated-app layout (sidebar + mobile tab bar). One nav label hardcoded `"Together"` (not via `t()`).
  - `Header.tsx`, `Footer.tsx`, `SiteLayout.tsx` — public site chrome.
  - `WordSearch.tsx` (453 lines) — interactive grid. Mixes engine concerns (selection validation at line ~113) with rendering. Good a11y baseline: `role="grid"`, keyboard model, `aria-live` announcements, reduced-motion support.
  - `HeroWordGrid.tsx`, `HeroMockup.tsx`, `HeroPreview.tsx` — static illustrations.
  - `ShareModal.tsx`, `InviteCompanionModal.tsx`, `SharedJourneyProgress.tsx`, `SharedReflection.tsx`, `CompanionCard.tsx` — Journey Together / Share visual prototypes on mock data.
  - `LanguageSelector.tsx` — text-based (EN/PT/ES), no country flags. Compliant with localization rules.
  - `DarkModeToggle.tsx`, `ThemeSelector.tsx` — wired to the real `ThemeProvider`.

## 5. State management

- No global store. React context providers in `__root.tsx`: `I18nProvider`, `ThemeProvider`, `NotifPrefsProvider`, plus `QueryClientProvider` (unused as yet).
- All journey/game state is local `useState` in route components — resets on navigation (acceptable for prototype; must move to persisted sessions in Phase 4).

## 6. Localization (current)

- `src/lib/i18n.tsx` (747 lines): flat key→string dictionaries for `en`, `pt`, `es` in one file; `pt`/`es` spread `en` as fallback base; runtime fallback `dictionaries[locale][k] ?? en[k] ?? k`.
- Locale persisted in `localStorage["locale_explicit"]`; legacy `locale` key cleaned up; cross-tab sync via storage events; `document.documentElement.lang` kept in sync. Default: English. SSR renders `en` then re-detects on mount (acceptable hydration strategy; flash-of-English possible for pt/es users).
- Gaps: monolithic file; no missing-translation detection; **prices embedded as translation strings** (`pricing.premiumPrice: "$6"` / `"R$29"`); testimonial names/content in dictionaries; no locale-aware dates/numbers; no localized SEO metadata (route `head()` metadata is English-only); `__root.tsx` `<html lang="en">` is static (runtime effect corrects it client-side).

## 7. Dark mode

`src/lib/theme.tsx`: light/dark/system with `matchMedia` listener, class toggle on `<html>`, `localStorage["jornadas.theme"]`. Solid. Not persisted to any backend (marked TODO in-file). **Must be preserved as-is.**

## 8. Mock data structure

- `src/lib/mock-data.ts` — `COLLECTIONS` (9), `TODAY` (single journey incl. scripture text, devotional, reflection, prayer, word list), `MILESTONES`, `SELECTION_COLORS`.
- `src/lib/mock/` — `companions.ts`, `favorites.ts`, `groups.ts`, `milestones.ts`, `notifications.ts`.
- **Licensing flag:** `TODAY.scripture` contains what appears to be NIV text of Philippians 4:6–7 (a licensed translation). See `/docs/legal-and-content/01-bible-content-licensing-notes.md`. Must not ship to production without confirmed licensing.

## 9. Word-search logic (current)

`src/lib/word-search.ts` (59 lines):

- `buildGrid(words, size)` with **hardcoded seed 42** — every user gets the identical puzzle; changing difficulty only changes grid size.
- Directions: →, ↓, ↘, ↗ only; no reversed words; no difficulty rules; no Unicode/accent normalization (PT/ES words with accents would break matching); silently drops words it fails to place; filler is A–Z only.
- Selection validation lives inside `WordSearch.tsx` (component), not the engine.
- Help/hint menu in `today.tsx` is UI-only (no engine support).

Verdict: prototype only. Full engine specified in `06-word-search-engine-spec.md`, implemented in Phase 3.

## 10. Backend / auth / Stripe / storage

- **No Supabase code, no auth logic, no Stripe code, no API calls anywhere.** Zero secrets in the repo (verified by grep).
- `localStorage` usage: locale (`i18n.tsx`), theme (`theme.tsx`), notification prefs (`notification-preferences.tsx`). All UI preferences — acceptable, but must sync to profile later (TODOs already present in-file).
- Hardcoded business values violating rule 12 (to fix in phases, documented now):
  - Prices in i18n dictionaries (rendered at `LandingSections.tsx:443,455` and in `pricing.tsx`).
  - Collection `access: "Free" | "Premium"` flags in mock data (fine for mock; entitlements must come from DB later).
  - Hardcoded user name "Samuel" (`my-journey.tsx:30`), streak values, week grid.

## 11. Error handling / observability (current)

Surprisingly good for a prototype (Lovable-provided):

- `src/server.ts` — SSR wrapper normalizing h3-swallowed 500s into a friendly error page.
- `src/lib/error-capture.ts` — out-of-band error capture + `console.error` expansion with cause chains.
- `src/lib/error-page.ts` — static fallback HTML.
- `src/start.ts` — server middleware: error normalization + **CSRF middleware for server functions** (explicitly re-added; keep).
- `__root.tsx` — router-level `errorComponent` + `notFoundComponent`, reports to Lovable editor telemetry (`lovable-error-reporting.ts` — no-op outside the editor preview).
- 8 `console.*` call sites total; no sensitive data logged.

Gap: no client error-reporting service, no structured logger abstraction for app code.

## 12. Accessibility (current)

- Word-search grid: keyboard navigation, `aria-live` announcements, focus ring, reduced-motion. Found words use color + line-through + check icon (not color alone). Good baseline.
- shadcn/Radix components provide accessible modals/tabs/accordions.
- Not audited: full keyboard pass over all routes, contrast ratios in dark mode. Deferred to Phase 10.

## 13. Tests / CI

**None.** No test runner, no test files, no CI config. Vitest infrastructure added in Phase 1.

## 14. Findings by severity

### Critical

1. **AppleDouble files corrupted git pack index** (`.git/objects/pack/._pack-*.idx`) — fixed during audit; watch for recurrence while on ExFAT.
2. **Auth screens are non-functional mockups** presented as real screens — sign-up button navigates straight to `/my-journey`. Must never ship as-is. (Phase 1 wires them to a real auth boundary behind a config check.)
3. **No environment validation / no env story at all** — Phase 1 deliverable.

### High

4. Repository on ExFAT volume — ongoing friction (junk files, no symlinks). Recommend moving to APFS.
5. Fixed-seed word search — identical puzzle for all users; no accent normalization (breaks PT/ES). Phase 3.
6. Licensed Bible text (NIV) hardcoded in mock data. Must be replaced or licensed before launch.
7. No tests of any kind. Phase 1 starts the infrastructure.

### Medium

8. Prices hardcoded in i18n dictionaries (rule 12 violation). Move to typed config now (done in Phase 1 as `src/lib/config/pricing.ts`), Stripe-driven later.
9. Monolithic 747-line i18n file; no missing-key detection. Restructured in Phase 1 (same public API).
10. `sitemap.xml` emits empty-base relative URLs — invalid for search engines. Needs `SITE_URL` env (Phase 1 env layer provides it; wiring the sitemap is a one-line follow-up once the env is set).
11. SEO metadata is English-only and duplicated per route.
12. `<html lang="en">` static in SSR shell while locale may be pt/es.
13. Journey state resets on navigation (no persistence).

### Low

14. `AppShell.tsx` hardcoded `"Together"` nav label (bypasses i18n).
15. Unused shadcn components (chart, carousel, menubar, input-otp, resizable, others).
16. `@typescript-eslint/no-unused-vars` disabled in eslint config.
17. `eslint.config.js` is listed in `tsconfig.include` but is a `.js` file (harmless).
18. Two hero implementations retained (`HeroMockup`, `HeroPreview`, `HeroWordGrid`) — only some used; verify usage before any cleanup.
19. Google Fonts loaded from CDN (privacy/perf consideration for later; fine for now).

## 15. Dead / duplicate code

- No hard evidence of dead routes. `HeroMockup.tsx` (590 lines) vs `HeroPreview.tsx` — `HeroPreview` is used by `my-journey.tsx`; `HeroMockup` usage should be verified before removal. Not removed in Phase 0/1 (rule 7/15).
- The `Field` helper component is duplicated across `signin.tsx`, `signup.tsx` (and similar in `forgot.tsx`) — consolidation candidate when auth screens are wired.

## 16. Recommended actions (executed in this run where marked ✅)

1. ✅ Remove AppleDouble junk from `.git/objects/pack/`; add `._*`/`.DS_Store` to `.gitignore`.
2. ✅ Install dependencies (npm; README-sanctioned).
3. ✅ Env validation layer (`src/lib/config/env.ts`) + `.env.example`.
4. ✅ Supabase client architecture (browser anon client; server client isolated).
5. ✅ Initial migrations: profiles, roles, user_preferences + RLS.
6. ✅ Auth service boundary; auth screens wired only when Supabase env is configured (prototype navigation preserved otherwise).
7. ✅ i18n restructure into per-locale modules, same public API; missing-key detection in dev.
8. ✅ Centralized error types + logger façade.
9. ✅ Vitest infrastructure + initial tests (env, auth boundary, i18n fallback).
10. ✅ Pricing values moved to typed config (display still identical).
11. ⏳ Move repo to APFS volume (user action, **strongly recommended** — see §2.1; AppleDouble files broke git, the build, the test runner and the linter during this execution).
12. ⏳ Set `SITE_URL` and wire sitemap base URL.
13. ⏳ Phase 2+ items per roadmap.
