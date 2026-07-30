-- 0002_publication_admin_role.sql
-- Phase 2: adds the publication_admin role.

alter type public.app_role add value if not exists 'publication_admin';