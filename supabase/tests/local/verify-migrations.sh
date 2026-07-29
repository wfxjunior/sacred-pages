#!/usr/bin/env bash
# Applies the shim + every migration, in order, to a throwaway local database.
#
# Purpose: prove the SQL executes before it is ever run against the live
# Supabase project. Stops at the first failure and prints the offending
# statement, because a migration that half-applies is worse than one that
# never ran.
#
# Usage:  supabase/tests/local/verify-migrations.sh [dbname]
# Needs:  a local PostgreSQL server (psql on PATH). Nothing touches Supabase.

set -euo pipefail

DB="${1:-lumena_migration_check}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SHIM="$ROOT/supabase/tests/local/00-shim.sql"

echo "==> Recreating database '$DB'"
dropdb --if-exists "$DB"
createdb "$DB"

# ON_ERROR_STOP is the whole point: without it psql reports failures and
# carries on, leaving a half-built schema that looks like success.
PSQL=(psql --quiet --no-psqlrc --set ON_ERROR_STOP=1 --dbname "$DB")

echo "==> Applying Supabase shim"
"${PSQL[@]}" --file "$SHIM"

for file in "$ROOT"/supabase/migrations/*.sql; do
  name="$(basename "$file")"
  echo "==> Applying $name"
  # Each migration runs in its own transaction, matching how `supabase db push`
  # applies them. A failure rolls that migration back entirely.
  "${PSQL[@]}" --single-transaction --file "$file"
done

echo
echo "==> All migrations applied cleanly to '$DB'"
"${PSQL[@]}" --tuples-only --command "
  select
    (select count(*) from pg_tables where schemaname = 'public')                    as tables,
    (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public')                                                  as functions,
    (select count(*) from pg_trigger where not tgisinternal)                        as triggers,
    (select count(*) from pg_policies where schemaname = 'public')                  as policies,
    (select count(*) from pg_type t join pg_namespace n on n.oid = t.typnamespace
       where n.nspname = 'public' and t.typtype = 'e')                              as enums,
    (select count(*) from pg_indexes where schemaname = 'public')                   as indexes;
"
