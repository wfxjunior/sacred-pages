drop policy if exists "anyone reads tag names" on public.content_tag_translations;

create policy "anyone reads active tag names"
on public.content_tag_translations
for select
using (
  exists (
    select 1 from public.content_tags ct
    where ct.id = content_tag_translations.tag_id
      and ct.is_active
  )
);

create policy "staff reads all tag names"
on public.content_tag_translations
for select
to authenticated
using (public.is_content_staff(auth.uid()));

drop policy if exists "published media readable" on public.media_assets;

create policy "published content media readable"
on public.media_assets
for select
to anon, authenticated
using (
  archived_at is null
  and (
    exists (
      select 1 from public.journeys j
      where (j.hero_media_id = media_assets.id or j.social_media_id = media_assets.id)
        and j.status = 'published'::content_status
        and j.archived_at is null
    )
    or exists (
      select 1 from public.collections c
      where (c.cover_media_id = media_assets.id or c.thumbnail_media_id = media_assets.id)
        and c.status = 'published'::content_status
        and c.archived_at is null
    )
  )
);

create policy "staff reads all media"
on public.media_assets
for select
to authenticated
using (public.is_content_staff(auth.uid()));
