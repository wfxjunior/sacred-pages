-- 0002_publication_admin_role.sql
-- Phase 2: adds the publication_admin role.
--
-- This migration is deliberately isolated. PostgreSQL forbids using a value
-- added by ALTER TYPE ... ADD VALUE inside the same transaction that adds it
-- ("unsafe use of new value of enum type"). Migration 0003 references
-- 'publication_admin' in policies, so the value must be committed first.
--
-- Reversible: enum values cannot be dropped in PostgreSQL. Rolling back
-- requires recreating the type; see docs/engineering/content-admin-implementation.md.

alter type public.app_role add value if not exists 'publication_admin';
