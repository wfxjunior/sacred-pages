# Technical Architecture

Date: 2026-07-28
Status: approved baseline for Phases 0–10. Update this document when architecture decisions change.

---

## 1. High-level architecture

```
┌────────────────────────────────────────────────────────────┐
│  Browser (React 19 / TanStack Start client)                │
│  UI components · TanStack Query · i18n · theme · a11y      │
└──────────────┬─────────────────────────────┬───────────────┘
               │ anon-key client (RLS)       │ SSR / server fns
┌──────────────▼──────────────┐  ┌───────────▼───────────────┐
│  Supabase                   │  │  TanStack Start server     │
│  Auth · Postgres+RLS ·      │  │  (Nitro) — privileged ops, │
│  Storage · Edge Functions   │  │  webhooks, SSR, sitemap    │
└──────────────┬──────────────┘  └───────────┬───────────────┘
               │                             │
        ┌──────▼──────┐               ┌──────▼──────┐
        │   Stripe    │◄──webhooks───►│  Email/     │
        │  (billing)  │               │  analytics  │
        └─────────────┘               └─────────────┘
```

Principles:

- **Database is the source of truth** for identity, roles, entitlements, content, and progress. RLS enforces authorization; the frontend only _reflects_ it.
- **The browser only ever holds the anon key.** Service-role operations live in server-only modules (`*.server.ts`) or Supabase Edge Functions.
- **Stripe webhooks are the billing source of truth** — never checkout redirects.
- Pure domain logic (word-search engine, entitlements, milestone rules) is framework-free TypeScript, unit-testable without React or Supabase.

## 2. Frontend architecture

- TanStack Start file-based routes (`src/routes/`); generated `routeTree.gen.ts` untouched by hand.
- Layout layers: `SiteLayout`/`Header`/`Footer` (public) and `AppShell` (member area). Preserved as approved visuals.
- Server state via TanStack Query (query keys namespaced per domain: `['profile']`, `['collections', locale]`, …). Local UI state stays in components; user preferences in providers backed by localStorage, later synced to `user_preferences`.
- Directory plan (grows by phase; existing structure preserved):

```
src/
  components/{site,ui}/       # existing, approved visuals
  lib/
    config/                   # env.ts, pricing.ts, typed constants
    supabase/                 # client.ts (browser), server.ts (server-only)
    auth/                     # service.ts, types
    i18n/                     # provider + locales/{en,pt,es}.ts
    errors.ts, logger.ts      # centralized error handling / logging
    engine/                   # Phase 3: word-search engine (pure TS)
    entitlements/             # Phase 5: typed entitlement keys + resolver
  routes/                     # file-based routes
supabase/
  migrations/                 # ordered SQL migrations
docs/
```

## 3. Backend architecture

- Supabase Postgres + RLS for all domain data.
- Privileged operations (webhook handling, admin mutations, invitation token issuance) run in TanStack Start server routes/functions (Nitro) or Supabase Edge Functions — decision per feature, documented in the phase that introduces it. Default: Start server functions (already deployed with the app), Edge Functions where proximity to the DB or cron triggers matter.
- CSRF middleware for server functions is already active (`src/start.ts`) — keep.

## 4. Authentication architecture

- Supabase Auth: email/password + email verification + password reset; OAuth providers addable later without rewrite (service boundary hides the provider).
- `src/lib/auth/service.ts` is the **only** module that talks to `supabase.auth`. UI calls the service; the service returns typed results/errors. Session restoration via `onAuthStateChange` + `getSession`.
- A `profiles` row is created by DB trigger on signup (never trusted to the client).
- Detailed role/permission model: see `05-auth-and-permissions.md`.

## 5. Authorization architecture

- Roles stored in `user_roles` (DB), never trusted from browser state.
- RLS policies use `auth.uid()` plus `security definer` helper functions (`has_role(uid, role)`) to avoid recursive-policy pitfalls.
- Frontend route guards are UX only; every privileged read/write is authorized in the database or a server boundary.
- Entitlements (Phase 5) resolve from `subscriptions` + `plan_entitlements`; enforced in RLS/server, mirrored in UI.

## 6. Database architecture

See `04-database-blueprint.md`. Summary: UUID PKs, `created_at`/`updated_at` everywhere, soft delete only where justified (user content), localized content via `*_translations` tables keyed by `language_code`, all changes through ordered migrations in `supabase/migrations/`.

## 7. Content architecture

- Canonical content entities (collections, journeys) are language-neutral; all display text lives in `*_translations` rows with review status.
- Scripture is stored as **references** (book/chapter/verse ranges) plus a `scripture_sources` strategy: licensed stored text, API fetch, or public-domain text — per translation. No copyrighted text hardcoded (see licensing notes doc).
- Publishing workflow: draft → in_review → approved → scheduled → published → archived, with `content_versions` history and audit logs (Phase 2/9).

## 8. Localization architecture

- UI strings: per-locale modules `src/lib/i18n/locales/{en,pt,es}.ts` with `en` as the complete reference dictionary; `pt`/`es` typed as `Partial<>` of the key union → **compile-time key safety, runtime fallback to English**, dev-mode missing-key logging.
- Adding a language = adding one locale file + one row in `languages` table (content side). No app rebuild architecture changes.
- Content localization: `*_translations` tables; fallback chain `requested → en`.
- Locale state: explicit user choice in localStorage (existing behavior preserved), synced to `user_preferences` once authenticated (later phase). Dates/numbers via `Intl` with the active locale (adopted incrementally). Localized SEO metadata for public pages in Phase 2.
- No country flags for language selection (existing `LanguageSelector` already text-based).

## 9. Word-search engine architecture

See `06-word-search-engine-spec.md`. Pure TS module `src/lib/engine/`, deterministic by seed, Unicode-normalized, React-free. `WordSearch.tsx` becomes a renderer over engine output (Phase 3). Puzzle instances + seeds persisted (`puzzle_instances`) so re-renders and revisits reproduce the same puzzle.

## 10. Subscription architecture (Phase 5)

- Stripe Checkout Sessions + Customer Portal; monthly/yearly prices via env-configured price IDs.
- Webhook endpoint (server-only) with signature verification; every event stored in `webhook_events` (unique on Stripe event id → idempotent); entitlement sync updates `subscriptions` and derived access.
- Grace periods / past_due / cancellations modeled as subscription states; access resolution reads DB state only.

## 11. Journey Together architecture (Phase 7)

- Private-by-default companion graph: `companion_invitations` (opaque revocable tokens) → `companion_relationships` → `shared_journeys` + members + per-member progress visibility flags.
- Encouragements ("Amen") as idempotent event rows. No public profiles, no follower model, no feeds.

## 12. Share architecture (Phase 6)

- Every shareable thing gets a `share_links` row with an opaque token and an **explicit safe-share payload schema** (Zod) — never serialized user objects. Public previews render only whitelisted fields. Links revocable; private reflections/prayers never shareable by default.

## 13. Gamification architecture (Phase 4/6)

- Modular services: progress, consistency, milestones, referrals — separate modules with idempotent event processing (`user_milestones` unique per user+milestone).
- No public rankings, no manipulative mechanics; "Days in the Word" language in UI.

## 14. Admin architecture (Phase 9)

- Separate route subtree guarded by DB roles (editor/reviewer/support_admin/super_admin); all admin mutations through server boundaries writing `admin_audit_logs`. Route hiding is never the security boundary.

## 15. Analytics architecture

- Product analytics events behind a thin `track(event, props)` façade (provider TBD; env-configured). No PII in event payloads; no prayers/reflections ever.

## 16. Notification architecture (Phase 8)

- `notifications` (in-app) + `notification_preferences` (already prototyped in localStorage — schema mirrors the existing `NotificationPrefs` shape) + `notification_deliveries` for email. Email provider behind an interface; env-configured.

## 17. Security architecture

See `07-security-threat-model.md`. Highlights: RLS everywhere, anon key only in browser, service-role only in `*.server.ts`/Edge Functions, Zod validation at all boundaries, opaque tokens for invitations/shares, webhook signature verification + idempotency, audit logs, no sensitive logging (never prayers/reflections/tokens).

## 18. Testing strategy

- **Vitest** (unit/integration; Vite-native, added Phase 1). Pure-logic tests need no DOM; component tests can add `@testing-library/react` + jsdom when needed (Phase 3+).
- Unit: engine, entitlements, i18n fallback, env validation, milestone rules.
- Integration: auth service against mocked supabase-js; later against a local Supabase (CI service container).
- E2E: Playwright from Phase 4+ (signup → journey → completion; language/dark-mode switching).
- RLS authorization tests: SQL-level tests per policy (Phase 2+).
- No snapshot-only testing.

## 19. Deployment strategy

- Current: Lovable-managed builds (Nitro/Cloudflare default target). GitHub `main` is the sync branch — keep it green; no history rewrites (AGENTS.md).
- Later: preview deployments per PR, env-separated Supabase projects (dev/staging/prod), migration application via Supabase CLI in CI before deploy.

## 20. Observability strategy

- `src/lib/logger.ts` façade (structured, level-based, no-op debug in prod) — all app logging goes through it; existing Lovable error capture retained for the editor.
- Client error reporting provider (e.g. Sentry) added via env in a later phase; server logs via Nitro; Stripe webhook logs + admin audit logs in DB tables.
- Forbidden in logs: passwords, tokens, private prayers/reflections, emails where avoidable.

## 21. Backup & recovery

- Supabase PITR/daily backups (plan-dependent) — enable before launch; migration files in git are the schema source of truth; content export job (Phase 9) for editorial data.

## 22. Data retention

- User deletion: cascade personal data (progress, reflections, prayers, preferences); anonymize referral/billing records where legally required to retain. Documented per-table in the blueprint. Webhook/audit logs retained with TTL policy (e.g. 24 months) — finalized in Phase 10.

## 23. Future scalability

- Additional languages: add locale file + `languages` row.
- Family/group/church plans: `plans`/`plan_entitlements` already generic; group membership tables planned in blueprint (Phase 7+).
- Audio/offline: entitlement keys reserved; storage via Supabase Storage/CDN later.
- If server load grows: server functions migrate cleanly to Edge Functions or dedicated services because domain logic is framework-free.

## 24. Module dependency map

```
config/env  ◄── supabase/client ◄── auth/service ◄── UI (auth screens, providers)
    ▲              ▲                     ▲
    │              │                     │
config/pricing   supabase/server    i18n (standalone)
    ▲              ▲                     ▲
    UI         server-only ops       all UI
                (webhooks, admin)
engine/ (pure, depends on nothing app-specific)
entitlements/ (depends on: DB types only)
errors/logger (leaf utilities — everything may depend on them; they depend on nothing)
```

Rule: `lib/engine`, `lib/errors`, `lib/logger`, `lib/config` must never import from `components/` or `routes/`. `supabase/server.ts` must never be imported by client code (enforced by `.server.ts` naming + lint).
