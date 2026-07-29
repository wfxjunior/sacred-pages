# Bible Content Licensing Notes

Date: 2026-07-28
Status: **blocking constraint for Phase 2 content work.** Not legal advice — obtain qualified review before launch.

---

## 1. The core rule

**Bible translations are not automatically free to store, reproduce, or redistribute.** Most modern translations (NIV, ESV, NVI, NTLH, ARA, NVI-PT, RVR1960, NVI-ES, DHH, …) are copyrighted works under active license programs. Quotation allowances (e.g. "up to N verses without written permission, not amounting to a complete book, not exceeding X% of the work") vary per publisher, usually assume non-commercial or limited use, and generally do **not** cover storing the text in a product database or redistributing it inside a paid membership app.

**Do not hardcode copyrighted Bible text into the production database or codebase without confirmed written permission.**

## 2. Current repository exposure

- `src/lib/mock-data.ts` (`TODAY.scripture`) contains Philippians 4:6–7 wording that matches the **NIV** (a licensed translation, Biblica/Zondervan). Acceptable as an internal visual mock only; **must be replaced with licensed or public-domain text before any public launch**, including marketing screenshots.
- `hero.verse` strings in the i18n dictionaries (Psalm 119:105 in EN/PT/ES) — verify the wording against public-domain sources (KJV/WEB for EN; Almeida RC for PT; RVA/older Reina-Valera for ES) or rewrite as an original paraphrase with attribution "cf. Psalm 119:105".

## 3. Sourcing strategies (architecture supports all four)

The content layer (`scripture_sources` table, blueprint §C) records a strategy per translation:

| Strategy               | When                                                                                                                               | Notes                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `stored` public-domain | KJV, WEB, ASV (EN); João Ferreira de Almeida Revista e Corrigida 1898 / Tradução Brasileira (PT); Reina-Valera 1909 / earlier (ES) | Verify the _specific edition_ is public domain in target jurisdictions — later revisions (e.g. ARC 2009, RVR1960) are still protected |
| `stored` licensed      | after a signed license with the rights holder                                                                                      | store license terms + attribution requirements in `scripture_sources.license_note`                                                    |
| `api`                  | API.Bible (American Bible Society), Biblia.com/Faithlife, YouVersion partnerships                                                  | each API has its own ToS: caching limits, attribution, no-derivative rules; respect caching clauses                                   |
| `reference_only`       | any translation we cannot store or fetch                                                                                           | show book/chapter/verse and invite users to read in their own Bible; always legal                                                     |

## 4. Practical launch recommendation

- **EN:** World English Bible (WEB) — public domain, modern-ish English, safe default.
- **PT:** Almeida Revista e Corrigida (1898 edition) or Tradução Brasileira — verify edition provenance.
- **ES:** Reina-Valera 1909 — verify edition provenance.
- Modern translations (NIV/NVI/RVR1960 etc.) only after signed licenses; budget for royalty or per-use fees; licenses often require attribution lines and translation-abbreviation display — model these in `scripture_sources`.

## 5. Additional obligations

- Attribution: even public-domain texts should state the translation name/edition; licensed texts must reproduce the exact required copyright notice (render location: journey Scripture tab + share previews).
- Share cards / verse images count as reproduction — the same license must cover them.
- Word lists derived from Scripture (single words) are not copyrightable content, but devotionals quoting passages are quotations — keep within license terms.
- Devotionals, reflections, prayers written for this product are original works — ensure contracts assign rights (work-for-hire) if outside writers contribute (Phase 9 editorial onboarding).

## 6. Action items

1. Before Phase 2 seeding: choose launch translations per language from the public-domain list; record in `scripture_sources`.
2. Replace NIV mock text and verify hero verses (see §2).
3. Legal review of chosen editions' public-domain status in launch jurisdictions (US + Brazil + Spanish-speaking markets).
4. If a modern translation is a product requirement, start license conversations early — lead times are long.
