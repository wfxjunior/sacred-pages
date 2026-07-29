# Authentication & Permissions

Date: 2026-07-28
Implements: Phase 1 (foundation) — later phases extend the matrix, never weaken it.

---

## 1. Authentication

Provider: **Supabase Auth**.

Supported now (architecture) / wired in Phase 1 service boundary:

- Email + password sign-up with email verification (Supabase "confirm email" ON in project settings).
- Sign-in, secure sign-out (global scope), password reset via email link, session restoration (`getSession` + `onAuthStateChange`).
- Future OAuth (Google/Apple) requires only a new method on `authService` — no architectural change (UI screens already funnel through the service).

Rules:

- `src/lib/auth/service.ts` is the **only** module allowed to call `supabase.auth.*`. UI imports the service, never supabase directly.
- Sessions are Supabase-managed (JWT + refresh in localStorage via supabase-js defaults). Revisit cookie-based SSR sessions when server-rendered personalized pages arrive (Phase 4) — the service boundary isolates that change.
- The auth screens keep their approved visuals. When Supabase env vars are absent (e.g. Lovable preview without a backend), screens retain the prototype navigation; when configured, real auth is enforced. This is a documented Phase-1 bridge, removed in Phase 2 (`TODO(phase-2)` markers in code).

## 2. Roles

Stored in `user_roles` (DB). Browser state is never an authorization source.

| Role               | Granted by                       | Meaning                                                 |
| ------------------ | -------------------------------- | ------------------------------------------------------- |
| `guest`            | (no session — not stored)        | Public marketing pages, public share previews only      |
| `free_user`        | signup trigger (default)         | Baseline member                                         |
| `premium_user`     | billing sync (Phase 5)           | Member with premium entitlements                        |
| `content_editor`   | super_admin                      | Creates/edits content and translations                  |
| `content_reviewer` | super_admin                      | Approves/rejects content; cannot publish own edits      |
| `support_admin`    | super_admin                      | Reads user/billing state for support; no content powers |
| `super_admin`      | manual (service role, bootstrap) | Role grants, publication, access overrides              |

Notes: roles are additive (a content_editor is usually also free/premium_user). Premium is expressed both as a role for coarse checks and — authoritatively — as entitlements resolved from `subscriptions` (Phase 5). When they disagree, entitlements win.

## 3. Permission matrix (summary)

| Capability                                            | guest | free | premium | editor | reviewer | support | super |
| ----------------------------------------------------- | ----- | ---- | ------- | ------ | -------- | ------- | ----- |
| Public pages, share previews                          | ✓     | ✓    | ✓       | ✓      | ✓        | ✓       | ✓     |
| Daily journey                                         | –     | ✓    | ✓       | ✓      | ✓        | ✓       | ✓     |
| Selected collections                                  | –     | ✓    | ✓       | ✓      | ✓        | ✓       | ✓     |
| Full library / advanced difficulty / exclusive series | –     | –    | ✓       | ✓*     | ✓*       | –       | ✓     |
| Own progress, favorites, reflections, prayers         | –     | ✓    | ✓       | ✓      | ✓        | ✓       | ✓     |
| Journey Together                                      | –     | –    | ✓       | ✓      | ✓        | –       | ✓     |
| Create/edit content + translations                    | –     | –    | –       | ✓      | –        | –       | ✓     |
| Approve/reject content                                | –     | –    | –       | –      | ✓        | –       | ✓     |
| Publish/unpublish/schedule                            | –     | –    | –       | –      | –        | –       | ✓     |
| View any user profile/billing status                  | –     | –    | –       | –      | –        | ✓       | ✓     |
| Grant roles / access overrides                        | –     | –    | –       | –      | –        | –       | ✓     |
| View audit logs                                       | –     | –    | –       | –      | –        | –       | ✓     |

\* editors/reviewers see unpublished content for work purposes, not premium member features per se.

The full matrix grows per phase; each phase PR must update this table.

## 4. Route protection (UX layer)

- Member routes (`/my-journey`, `/today`, `/progress`, `/favorites`, `/together`, `/settings`, `/profile`, `/notifications*`): redirect unauthenticated users to `/signin` via a root-level `beforeLoad` guard (Phase 2, once real sessions exist — guarding now would break the approved prototype flow).
- Admin routes (Phase 9): separate subtree; guard checks DB roles via RLS-protected query; hiding is UX only — every admin operation re-authorizes server-side.

## 5. Database RLS rules (Phase 1, implemented)

- `profiles`: `select`/`update` own row (`auth.uid() = id`); insert via `handle_new_user()` trigger only; no client delete.
- `user_roles`: `select` own rows or super_admin; mutations super_admin only (`has_role()` security-definer helper prevents recursive policy evaluation).
- `user_preferences`: `select`/`insert`/`update` own row; no client delete.
- All future tables: RLS enabled at creation, owner-scoped by default, widened only by explicit documented policy (see blueprint per table).

## 6. Admin access rules

- No admin capability is ever granted by frontend state, URL knowledge, or hidden UI.
- Editor and reviewer are separated: a reviewer cannot edit; an editor cannot approve; only super_admin publishes (matrix above).
- Every admin mutation writes `admin_audit_logs` (insert-only).
- Support admins have read-only user/billing visibility; support actions that mutate (refund note, override) go through super_admin or explicit audited flows.

## 7. Premium entitlement rules (Phase 5 preview)

- Typed entitlement keys (see blueprint §F) resolved server/DB-side from active subscription + `access_overrides`; UI reads a single `useEntitlements()` result. No scattered `plan === 'premium'` checks.
- Billing truth: Stripe webhooks → `subscriptions`. Grace period: `grace_until` honored by the resolver. Redirect success pages never grant access.

## 8. Account states

| State                                        | Behavior                                                                                                                                                                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unverified email                             | Can sign in but member area prompts verification; no Journey Together invitations issued (abuse surface)                                                                                                                                                      |
| Active                                       | Normal per-role behavior                                                                                                                                                                                                                                      |
| Past due                                     | Premium entitlements retained until `grace_until`, then downgraded to free set; gentle in-app notice (no shame mechanics)                                                                                                                                     |
| Suspended (`profiles.suspended_at`, Phase 9) | Sessions invalidated (banned via Supabase admin API); public shares deactivated; sign-in returns a neutral "account unavailable" message                                                                                                                      |
| Deleted                                      | User-initiated: re-auth required → server-side deletion flow → auth.users delete cascades personal data (blueprint per-table retention rules); billing records anonymized-retained; share links & invitations revoked. Irreversible; confirmation UX required |

## 9. Testing requirements (accumulating per phase)

- Unit: service boundary behaviors (implemented in Phase 1: config-missing rejection, error mapping, sign-out scope).
- RLS: per-policy SQL tests — cross-user read/write attempts must fail (Phase 2+ CI with local Supabase).
- E2E: signup→verify→signin→reset flows (Phase 4+).
