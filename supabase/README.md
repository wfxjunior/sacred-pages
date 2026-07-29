# Supabase

Ordered SQL migrations live in `migrations/`. Apply with the Supabase CLI:

```sh
supabase link --project-ref <your-project-ref>
supabase db push          # applies pending migrations
```

Rules (see docs/engineering/04-database-blueprint.md):

- Every schema change is a new ordered migration file — no manual dashboard edits.
- RLS is enabled on every table at creation.
- Destructive statements require a `-- DESTRUCTIVE:` header and review.
- After applying `0001_identity_foundation.sql`, enable **Confirm email** in
  Auth settings and set the site URL for email links.

Bootstrap the first super_admin (one-time, via SQL editor with service role):

```sql
insert into public.user_roles (user_id, role)
values ('<auth-user-uuid>', 'super_admin')
on conflict do nothing;
```
