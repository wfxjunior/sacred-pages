# Mock Data Migration Status

Date: 2026-07-29 (Phase 4 update)
Phase 2 outcome: **no mock data was removed.** The database-backed content platform now exists alongside it; pages migrate one domain at a time, only after real data is verified.
Phase 4 outcome: the progress domain (`src/lib/journey/`, migration 0006) now exists, so `/my-journey`, `/progress` and `/favorites` are no longer blocked on missing tables. They remain **unmigrated** — a data layer that has never run against a database is not a reason to delete a working page.

Rule 18 of the project brief: *do not silently delete mock data until real database-backed data is verified.*

---

## 1. Current status by page

| Page / Component | Mock source | New data source (available) | Status | Remaining work |
|---|---|---|---|---|
| `/` landing — `LandingSections` | `mock-data.ts` (`COLLECTIONS`) | `publicContent.getCollections()` | **Not migrated** | Swap after seeding; keep visuals identical |
| `/collections` | `COLLECTIONS` | `publicContent.getCollections()` | **Not migrated** | Add loading/empty/error states inside existing card layout |
| `/collections/$slug` | `COLLECTIONS` lookup in `loader` | `getCollectionBySlug()` + `getJourneysForCollection()` | **Not migrated** | Loader becomes async; 404 on `content/not-found` |
| `/today` | `TODAY` | `getDailyJourney(locale)` | **Not migrated** | Depends on Daily Journey assignments existing |
| `/my-journey` | `TODAY`, `COLLECTIONS`, `MILESTONES` | `getDailyJourney()`, `getCollections()`, `journeyApi.consistency()/milestones()` | **Not migrated** | Unblocked by Phase 4; week strip from `consistencyWindow()`, milestones from `journeyApi.milestones()` |
| `/favorites` | `mock/favorites.ts` | `journeyApi.listFavorites()/toggleFavorite()` | **Not migrated** | Unblocked by Phase 4; needs content join for card copy |
| `/progress` | inline mock | `journeyApi.consistency()`, `collectionProgress()`, `history()` | **Not migrated** | Unblocked by Phase 4 |
| `/together` | `mock/companions.ts`, `mock/groups.ts` | — | **Blocked** | Needs Phase 7 |
| `/notifications` | `mock/notifications.ts` | — | **Blocked** | Needs Phase 8 |
| `/features`, `/about`, `/pricing` | static copy | — | **Not applicable** | Marketing copy; pricing moved to typed config in Phase 1 |
| `WordSearch.tsx` | `TODAY.words`, `buildGrid()` | `journey_words` (content side ready) | **Deferred** | Phase 3 engine replaces `lib/word-search.ts` |
| `HeroWordGrid`, `HeroMockup`, `HeroPreview` | hardcoded letters | — | **Not applicable** | Static illustrations; intentionally not data-driven |

## 2. Migration approach (per domain)

1. Seed the domain in a dev project (`supabase/seed/dev-content-seed.sql`).
2. Verify the public repository returns the expected shape, including locale fallback.
3. Swap the page's data source to TanStack Query, adding loading / empty / error states **within the approved visual language** — no redesign.
4. Verify all three locales and both themes.
5. Remove the mock import from that page only.
6. Update this table.

Mock modules stay until every consumer has moved. `mock-data.ts` also exports `SELECTION_COLORS`, which is UI configuration rather than content and stays regardless.

## 3. Content-licensing blocker

`mock-data.ts` → `TODAY.scripture` contains **NIV** wording of Philippians 4:6–7 (licensed translation). It must not reach production.

Migrating `/today` to database content resolves this automatically, because the seed and the schema permit stored verse text only for sources marked `allows_text_storage` — enforced by the `enforce_scripture_text_storage()` trigger. Until then, the NIV text remains an internal mock only.

See `docs/legal-and-content/01-bible-content-licensing-notes.md`.

## 4. Development fallback policy

Once a page migrates, mock data is **not** retained as a runtime fallback. A silent fallback would hide a broken query in production and make "is this real data?" unanswerable. Pages show an explicit empty or error state instead; the seed script covers local development.

## 5. Definition of done

- [ ] Every row above is Migrated, Blocked-by-later-phase, or Not applicable
- [ ] `src/lib/mock-data.ts` exports only `SELECTION_COLORS`
- [ ] `src/lib/mock/` is deleted
- [ ] No NIV text anywhere in the repository
- [ ] All three locales verified against real content
