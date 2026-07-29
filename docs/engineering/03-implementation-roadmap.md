# Implementation Roadmap

Date: 2026-07-28 (status updated 2026-07-29)
Execution rule: one phase at a time; a phase is done when its acceptance criteria pass.

**Status legend.** ✅ = acceptance criteria met. 🟡 = code and migrations written, tests pass, but **no Supabase project exists**, so nothing has run against a database and the acceptance criteria are unverified.

| Phase | State |
|---|---|
| 0 Audit & stabilization | ✅ |
| 1 Core foundation | ✅ |
| 2 Content platform | 🟡 `docs/engineering/content-admin-implementation.md` |
| 3 Word-search engine | 🟡 `docs/engineering/puzzle-domain.md` |
| 4 User progress | 🟡 `docs/engineering/progress-and-milestones.md` |
| 5–10 | Not started |

The single blocker shared by phases 2–4 is the same: create a Supabase project, apply migrations 0001–0006, and run the RLS suites.

Legend per phase: **Scope · Dependencies · DB · Frontend · Backend · Security · Tests · Acceptance · Risks**

---

## Phase 0 — Audit & stabilization ✅ (this execution)

- **Scope:** full repository audit (`01-repository-audit.md`); fix git pack corruption from AppleDouble files; ignore `._*`/`.DS_Store`; install dependencies; verify build & lint baselines; document all findings without silent fixes.
- **Dependencies:** none.
- **DB:** none.
- **Frontend:** no visual changes.
- **Backend:** none.
- **Security:** confirmed no secrets in repo.
- **Tests:** none yet (infra comes in Phase 1).
- **Acceptance:** `git fsck` clean; `npm run build` and `npm run lint` produce a known, documented status; audit doc merged.
- **Risks:** ExFAT volume keeps regenerating `._*` files; npm/bun lockfile duality with Lovable cloud builds.

## Phase 1 — Core foundation ✅ (this execution)

- **Scope:** typed env validation + `.env.example`; Supabase client architecture (browser/server split); initial migrations (profiles, roles, user_preferences + RLS + signup trigger); auth service boundary wired to existing screens **without breaking the approved UI** (prototype navigation preserved when Supabase env is absent); i18n restructure into per-locale modules with compile-time key safety and dev missing-key detection (public API unchanged); pricing values moved from i18n strings into typed config; centralized error types + logger; Vitest infrastructure + initial tests; searchable `TODO(phase-N):` markers.
- **Dependencies:** Phase 0.
- **DB:** `0001_identity_foundation.sql` (profiles, app_role enum, user_roles, user_preferences, RLS, `handle_new_user` trigger, `has_role` helper).
- **Frontend:** auth screens gain real submit handlers behind config detection; zero visual redesign; dark mode untouched.
- **Backend:** none beyond Supabase schema (no server functions yet).
- **Security:** RLS on all new tables; roles never client-trusted; anon key only in client; service-role only in `supabase/server.server.ts` (unused until needed).
- **Tests:** env validation, auth service boundaries (mocked supabase-js), i18n fallback/missing keys.
- **Acceptance:** build green; lint green; all tests pass; app renders identically with no env vars configured.
- **Risks:** Vitest on ExFAT performance; supabase-js version drift vs future CLI.

## Phase 2 — Content platform 🟡

- **Scope:** collections/journeys/devotionals/reflections/prayers/word lists as DB content with translations; publishing workflow (draft→review→published) minimal viable; replace `mock-data.ts` reads with queries (visuals unchanged); localized SEO metadata; content seeds for launch collections.
- **Dependencies:** Phase 1 (auth, env, i18n).
- **DB:** languages, collections(+translations), journeys(+translations), scripture_references, devotionals, reflections, prayers, journey_words, tags, content_versions, review status.
- **Frontend:** TanStack Query data layer; loading/empty/error states added carefully within existing visual language.
- **Backend:** read APIs are direct RLS-protected selects; editorial mutations via server boundary.
- **Security:** public read = published-only rows; editorial roles for writes; RLS tests.
- **Tests:** content retrieval + fallback locale integration tests; publishing state-machine unit tests.
- **Acceptance:** landing/collections/today pages render DB content with EN/PT/ES fallback; mock file no longer imported by member-area routes (kept only where visuals demand placeholders).
- **Risks:** Scripture licensing (see legal doc) gates which text ships; content seeding effort.

## Phase 3 — Word-search engine 🟡

- **Scope:** implement `06-word-search-engine-spec.md` fully (pure TS, seeded, normalized, hints, validation); refactor `WordSearch.tsx` into renderer; difficulty rules; persist puzzle instances + seeds.
- **Dependencies:** Phase 2 (journey_words).
- **DB:** puzzle_templates, puzzle_instances, puzzle_words, coordinates/solution storage, generation metadata.
- **Frontend:** identical look & interactions; a11y preserved and extended.
- **Backend:** deterministic server-side generation for canonical daily puzzles (same seed for all users of a journey+difficulty, or per-user seed — decided and documented in-phase).
- **Security:** solution data not exposed to clients before completion where it matters (hints server-mediated only if abuse becomes relevant — likely client-side fine).
- **Tests:** heavy unit coverage (placement, determinism, normalization PT/ES, validation, hints, failure handling); property-based tests for generation.
- **Acceptance:** same seed → identical puzzle across sessions/devices; accented words work in all three languages; no regeneration on re-render.
- **Risks:** dense-grid generation failure rates; performance on large grids (mitigate with attempt caps + fallback strategies).

## Phase 4 — User progress 🟡

- **Scope:** journey/puzzle sessions, completion, favorites, history, consistency ("Days in the Word"), milestones, personal preferences synced (theme/locale/difficulty/colors).
- **Dependencies:** Phases 2–3.
- **DB:** journey_sessions, puzzle_sessions(+selections), journey_progress, user_collection_progress, favorites, user_reflections, user_prayers, consistency records, milestones, user_milestones.
- **Frontend:** my-journey/progress/favorites pages go live on real data; streak week strip real.
- **Backend:** milestone awarding as idempotent event processing.
- **Security:** strict per-user RLS; private reflections/prayers owner-only; no cross-user reads.
- **Tests:** milestone idempotency, streak calculation (timezone-aware), favorites integration; E2E: signup→journey→completion.
- **Acceptance:** a real user completes a journey and sees persisted progress/milestones across devices.
- **Risks:** timezone streak math; migration of localStorage prefs to DB without UX regressions.

## Phase 5 — Membership (Stripe)

- **Scope:** plans/entitlements in DB; typed entitlement keys; Stripe Checkout + Customer Portal; webhook handler (signature-verified, idempotent, event-stored); subscription lifecycle incl. trial/past_due/grace/cancel/reactivate/plan change; access control UI+DB.
- **Dependencies:** Phase 4; product/pricing decisions final; Stripe account + env vars.
- **DB:** plans, plan_entitlements, subscriptions, billing_customers, billing_events, webhook_events, access_overrides.
- **Frontend:** pricing page reads plans from DB/config; upgrade flow; billing status in settings.
- **Backend:** webhook endpoint (server-only), checkout session creation, portal session creation.
- **Security:** webhook signature verification; duplicate-event protection; never trust redirect success; no price amounts client-authored.
- **Tests:** webhook idempotency + state transitions (fixture events); entitlement resolution unit tests; E2E upgrade with Stripe test mode.
- **Acceptance:** test-mode subscription lifecycle drives entitlements correctly with webhooks as source of truth.
- **Risks:** webhook ordering/races; grace-period edge cases.

## Phase 6 — Sharing & referrals

- **Scope:** share links (journey/collection/verse card/milestone) with safe-share schemas + revocable opaque tokens; public preview pages; referral codes/attribution/rewards with abuse prevention.
- **Dependencies:** Phase 4 (things to share), Phase 5 (reward mechanics if premium-related).
- **DB:** share_links, share_events, referral_codes, referral_attributions, referral_rewards.
- **Frontend:** existing ShareModal wired; public preview routes with localized SEO.
- **Backend:** token resolution endpoint; attribution on signup.
- **Security:** no user objects serialized; previews expose whitelisted fields only; rate limits on token creation/resolution; reward idempotency.
- **Tests:** share-token resolution, payload schema conformance, referral attribution uniqueness.
- **Acceptance:** shared link renders safe preview logged-out; revocation works; referral attributes exactly once.
- **Risks:** abuse (self-referral loops) — mitigations documented in threat model.

## Phase 7 — Journey Together

- **Scope:** invitations (spouse/friend/family/mentor), accept/decline/cancel, remove companion, leave; shared journeys + shared completion; encouragement/"Amen"; privacy defaults (private reflections/prayers stay private); companion management UI (existing prototypes wired).
- **Dependencies:** Phases 4, 6 (invitation tokens reuse share-token infra).
- **DB:** companion_relationships, companion_invitations, shared_journeys(+members,+progress), encouragements, shared_reflection_permissions.
- **Frontend:** together/, InviteCompanionModal, SharedJourneyProgress wired.
- **Backend:** invitation issuance/acceptance server boundary.
- **Security:** opaque revocable tokens; explicit-permission model for any detail visibility; no public profiles.
- **Tests:** invitation permission matrix unit tests; relationship lifecycle integration; privacy-default assertions.
- **Acceptance:** two real accounts complete a shared journey with correct mutual visibility and nothing more.
- **Risks:** permission-model complexity — keep the matrix in `05-auth-and-permissions.md` current.

## Phase 8 — Notifications

- **Scope:** in-app notifications; email architecture (provider behind interface); preferences (migrate existing localStorage prototype shape to DB); daily reminders; companion activity; milestone notices; quiet hours/timezones.
- **Dependencies:** Phases 4, 7.
- **DB:** notifications, notification_preferences, notification_deliveries.
- **Frontend:** NotificationsMenu + preferences page wired to DB.
- **Backend:** scheduled jobs (Supabase cron/Edge Functions) for reminders/digests.
- **Security:** no sensitive content in emails; per-user delivery records; unsubscribe compliance.
- **Tests:** preference resolution (quiet hours/timezone) unit tests; delivery idempotency.
- **Acceptance:** reminder respects preferences, quiet hours, and locale.
- **Risks:** email deliverability; scheduling infra choice.

## Phase 9 — Administration & analytics

- **Scope:** admin portal (content CRUD, translate, review/approve/reject, schedule/publish/unpublish/archive, versions, audit history); user management; subscription visibility; support tools; product analytics; audit logs.
- **Dependencies:** Phases 2, 5.
- **DB:** admin_audit_logs, content_review_logs, support notes; analytics event pipeline.
- **Frontend:** admin route subtree (role-guarded UX; DB-enforced authz).
- **Backend:** all admin mutations server-side with audit writes.
- **Security:** editor/reviewer/admin separation enforced in DB; no admin data reachable via frontend hiding alone.
- **Tests:** authorization tests per admin operation; publishing workflow E2E.
- **Acceptance:** editor→reviewer→publish flow works with full audit trail; support_admin sees users but cannot edit content.
- **Risks:** scope creep — keep MVP admin minimal.

## Phase 10 — Production hardening

- **Scope:** performance passes (bundle, images, caching); security audit vs threat model; accessibility audit (WCAG AA); localization QA (all locales, dates/numbers); cross-browser + mobile QA; monitoring/alerting; backups verified; deployment runbooks; incident-response doc.
- **Dependencies:** all prior phases.
- **Acceptance:** launch checklist signed off; restore-from-backup rehearsed; error budget/monitoring live.
- **Risks:** discovered rework from audits — schedule buffer.

---

## Cross-phase rules

- Every DB change ships as a migration file; destructive migrations flagged in review.
- `TODO(phase-N):` is the only sanctioned TODO format (searchable: `grep -rn "TODO(phase-"`).
- Visual identity frozen; any visual deviation requires explicit approval.
- Keep `main` green (Lovable sync).
