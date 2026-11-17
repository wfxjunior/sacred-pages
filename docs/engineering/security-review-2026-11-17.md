# Security review — 2026-11-17

## Requested warnings
- Invitation email now requires a caller-scoped `has_role` super-admin check in the shared sender. Both creation and resend enforce ownership, pending status and expiry. Ordinary accounts retain shareable invitation links without email dispatch.
- Subscription, donation and billing portal use an exact app-origin allowlist; untrusted Origin, Referer, configured external domains and lookalikes cannot set external return destinations. Production fallback is the canonical live site.
- Invitation sends include transactional purpose and provider idempotency keyed by invitation ID.

## Verification
- 15 focused tests passed (email policy, return destinations, donation bounds).
- Browser: ordinary temporary user created a link without sending email.
- Browser: administrator sent an invitation to their own address; provider log recorded one sent event. Repeated send was idempotent. Test invitations remain in the administrator's pending list and can be cancelled.
- Latest preview build reported OK.
- Quick scan: only the intentional public languages and milestone translations informational findings.
- Deep scan began before edits and repeated the return-origin warnings; all instances of the four requested warnings were marked fixed after verification.

## Remaining scan item
The deep scan again flags client-selected donation amounts despite the existing whole-dollar $5–$1,000 server validation and tests. This review did not change the custom-donation policy or clear that critical finding. A future review must reconcile the scanner's expected policy with intentionally donor-selected amounts; do not describe the app as security-clean.