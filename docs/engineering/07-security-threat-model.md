# Security Threat Model

Date: 2026-07-28
Living document — every phase that adds an attack surface must update it.

---

## 1. Assets

| Asset                                                       | Sensitivity                                                          |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| User credentials / sessions (Supabase JWT + refresh tokens) | Critical                                                             |
| Private reflections & prayers                               | Critical (intimate spiritual content — breach = severe trust damage) |
| Personal data (email, display name, preferences, progress)  | High                                                                 |
| Billing data (Stripe customer/subscription state)           | High (card data never touches us — Stripe-hosted)                    |
| Service-role key, Stripe secret/webhook keys                | Critical                                                             |
| Content library (editorial work, licensed Scripture text)   | Medium (licensing exposure)                                          |
| Invitation/share tokens                                     | Medium-High (grant scoped access)                                    |
| Availability / brand trust                                  | High                                                                 |

## 2. Threat actors

- Opportunistic attackers (credential stuffing, scraping, scanners).
- Malicious or curious authenticated users (IDOR attempts, RLS probing, referral abuse).
- A user's untrusted contact (abusing invitation/share links; harassment via encouragement features).
- Compromised admin/editor account.
- Malicious dependency / supply chain.
- Careless insiders (logging sensitive data, leaking env files).

## 3. Trust boundaries

1. Browser ↔ Supabase (anon key + RLS) — the primary enforcement line.
2. Browser ↔ Start server functions (CSRF middleware already active in `src/start.ts`).
3. Server ↔ Stripe (webhook signature verification boundary).
4. Server-only code (`*.server.ts`, Edge Functions) holding service-role — must never be imported client-side (naming convention + lint; verify at build).
5. Public share/invite token resolution — service-mediated, no direct table access for anon.
6. Lovable editor telemetry (`__lovableEvents`) — dev-preview only; must remain a no-op in production.

## 4. Attack surfaces & mitigations

| Surface                  | Threats                                                     | Mitigations                                                                                                                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth endpoints           | credential stuffing, enumeration, weak passwords            | Supabase rate limits + email confirmation; generic error copy (service maps errors, never echoes "email exists" beyond what signup inherently reveals); password policy in Supabase settings; CAPTCHA if abuse observed                                                                      |
| Session storage          | XSS-stolen tokens                                           | React escaping; no `dangerouslySetInnerHTML` (none present — keep it that way); CSP headers (Phase 10); no tokens in logs/URLs                                                                                                                                                               |
| RLS policies             | policy gaps, recursive-policy bugs, IDOR                    | RLS enabled on every table at creation; owner-scoped defaults; `security definer has_role()` helper; **negative tests per policy** (cross-user access must fail) in CI                                                                                                                       |
| Server functions         | CSRF, injection, over-posting                               | existing CSRF middleware retained; Zod validation on every input; no string-built SQL (supabase-js/parameterized only)                                                                                                                                                                       |
| Stripe webhooks          | forged events, replays, out-of-order                        | signature verification; `webhook_events.stripe_event_id` unique (idempotent); state machine tolerant of ordering; secrets server-only                                                                                                                                                        |
| Share links              | token guessing, private-data leakage, revoked-link use      | ≥128-bit random opaque tokens; explicit Zod safe-share payloads (no user objects); revocation + expiry checked at resolution; rate-limited resolution endpoint                                                                                                                               |
| Invitations              | forwarding to unintended party, spam                        | opaque single-use revocable tokens with expiry; accept requires authenticated session; inviter can cancel; invite issuance rate-limited; unverified-email accounts cannot invite                                                                                                             |
| Referrals                | self-referral, disposable-email farming, reward duplication | one attribution per referred user (DB unique); reward requires activation threshold (e.g. N completed journeys); same-payment-method/self heuristics; rewards idempotent by unique constraint; all grants audited                                                                            |
| Journey Together         | privacy erosion, harassment                                 | private-by-default flags; explicit per-reflection opt-in table; remove/leave always available; encouragements idempotent + members-only; no public profiles or search                                                                                                                        |
| Admin portal             | privilege escalation, route-hiding reliance                 | DB-enforced roles for every operation; editor/reviewer/publisher separation; insert-only audit logs; admin sessions same rigor as user sessions                                                                                                                                              |
| Env/secrets              | service key in bundle, committed .env                       | `.env*` gitignored (`.env.example` only); env validation separates `VITE_`-public from server-only; grep/secret-scanning in CI (Phase 10); bunfig 24h `minimumReleaseAge` guards bun installs (supply chain) — npm installs lack this guard: prefer lockfile-exact installs (`npm ci`) in CI |
| Logging                  | prayers/reflections/tokens in logs                          | logger façade with explicit redaction rule: never log body fields of reflections/prayers, tokens, passwords; code review gate                                                                                                                                                                |
| Sitemap/SEO/public pages | private data in public metadata                             | share previews render whitelisted snapshot fields only; no user identifiers in URLs (opaque tokens)                                                                                                                                                                                          |
| Account deletion/export  | orphaned personal data, deletion abuse                      | re-auth before deletion; server-side cascade per blueprint retention rules; export produces only the requester's data (Phase 10)                                                                                                                                                             |

## 5. Abuse cases (product-level)

- Mass invitation spam → per-user daily invite caps, verified-email requirement.
- Scripted puzzle completion for streak/referral farming → server-side plausibility checks (minimum duration) before milestone/reward events; rewards idempotent regardless.
- Harassment via repeated encouragements → idempotency (one per journey per pair) + companion removal + block-on-remove semantics (Phase 7 decision).
- Content scraping of premium library → entitlement checks in RLS on content reads (premium collections readable only with entitlement); acceptable residual risk: authenticated scraping by paying accounts.

## 6. Residual risks (accepted, revisit each phase)

- supabase-js default token storage is localStorage (XSS-reachable). Accepted at current scale; CSP + dependency hygiene reduce likelihood; cookie-session migration is isolated behind the auth service if risk profile changes.
- ExFAT dev volume lacks POSIX permissions — local-only risk, not production.
- Dual lockfiles (bun.lock authoritative on Lovable cloud, package-lock.json locally) could drift → periodic reconciliation; CI installs from bun.lock.
- Google Fonts CDN discloses visitor IPs to Google — evaluate self-hosting in Phase 10.

## 7. Security requirements checklist (tracked)

- [x] RLS on all tables (Phase 1 tables done)
- [x] Anon key only in client; service-role isolated server-side (`supabase/server.server.ts`)
- [x] Env validation with public/server separation
- [x] CSRF middleware for server functions (pre-existing, retained)
- [ ] CSP + security headers (Phase 10)
- [ ] Webhook signature verification + idempotency (Phase 5)
- [ ] RLS negative-test suite in CI (Phase 2)
- [ ] Rate limiting on token resolution/invites (Phases 6–7)
- [ ] Secret scanning + dependency audit in CI (Phase 10)
- [ ] Account deletion + export flows (Phase 10)
