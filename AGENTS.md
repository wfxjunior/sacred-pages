<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

<!--
  Everything below is maintained by hand and must stay OUTSIDE the LOVABLE
  markers above, which Lovable regenerates.
-->

# Working on Lumena

This repository is edited from two places: the Lovable editor and Claude Code,
both pushing to `main`. Pull before you start, and prefer one editor at a time —
concurrent edits to the same files are the main way work gets lost here.

## Decisions that are deliberate

These look like inconsistencies worth "fixing". They are not. Change them only
if the user asks for the change directly.

**Lumena is the brand. Word Journeys is the experience.**
`brand.name` is `"Lumena"` and names the product everywhere — header, footer,
auth, app shell. `brand.experience` is `"Word Journeys"` and appears in exactly
two places: the hero headline and the notebook title inside the hero mockup. The
landing page reads "Lumena presents Word Journeys". Do not rename the product to
Word Journeys, and do not put the experience name in the navigation.

Both keys live only in the English dictionary. That is intentional: `t()` falls
back to English, and neither string is translatable.

**The logo has one implementation.**
`LumenaLogo` is the component every surface consumes. It composes `LetterTile`
from `BrandMark`, which owns `TILE_PALETTE` — the same palette the puzzle grid
uses. Restyling the brand means editing `BrandMark`, never redefining tiles
somewhere else. The six tile colours, proportions, radius and weight are
identical on the landing header and all authentication pages; keep them that way.

**The Living Journal is not a feed.**
`livingJournal.types.ts` deliberately has no surname, avatar, user id, or
like/comment/view counts, so the section cannot quietly grow into a social feed.
Do not add engagement fields. Its entries are demonstration content and the page
says so on screen — do not present them as real reader submissions. The
"coming soon" note is a plain label, not a control, because there is no
submission backend; a button that silently did nothing would be a small lie.

**The journal spiral is decoration and must stay that way.**
`JournalBinding` draws its coils with a `repeating-linear-gradient` rather than N
ring elements, so it adapts to any spread height with no JavaScript, no layout
shift, and a constant ring pitch. It is `aria-hidden` with `pointer-events: none`
so it can never intercept a click meant for the puzzle grid underneath. Keep both.

## Before pushing

`npm run typecheck`, `npm run test`, and `npm run build` should all pass. The
repo carries pre-existing Prettier formatting debt in several files — do not
reformat files you did not otherwise change, as it buries real diffs.

## Secrets

`.env` is tracked in git for historical reasons and currently holds only public
Supabase values (project id, URL, and the `sb_publishable_` key, which is safe to
expose because RLS is enabled on every table). Never add a service-role key, JWT
secret, or database password to it — the repository is not a safe place for them.
