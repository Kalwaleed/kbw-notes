-- 022_security_advisor_hardening.sql
-- Resolve Supabase Security Advisor warnings:
--   1. Drop broad SELECT policy on storage.objects for post-images
--      (bucket is public; the policy adds nothing for object URL access
--      and currently allows clients to list every file in the bucket).
--   2. Switch is_admin() to SECURITY INVOKER (it only reads auth.jwt();
--      no privilege escalation needed, and it removes the lint).
--   3. Revoke EXECUTE on the four trigger-only SECURITY DEFINER functions
--      from PUBLIC / anon / authenticated. Triggers do not consult EXECUTE
--      privilege, so revoking is safe and prevents callable RPCs.

begin;

-- 1. Storage: drop the broad SELECT policy. The bucket's public flag
--    continues to serve direct object URLs (/storage/v1/object/public/...).
drop policy if exists "Anyone can view post images" on storage.objects;

-- 2. is_admin: re-create with SECURITY INVOKER. Body is identical to
--    migration 021 (auth.jwt() app_metadata.role check).
create or replace function public.is_admin()
returns boolean
language sql
security invoker
set search_path = ''
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- RLS policies evaluate as the connecting role, so anon/authenticated
-- must retain EXECUTE on is_admin().
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- 3. Trigger-only functions: revoke EXECUTE. Triggers fire regardless.
revoke execute on function public.enforce_comment_content_immutable() from public, anon, authenticated;
revoke execute on function public.enforce_submission_edit_rules()      from public, anon, authenticated;
revoke execute on function public.handle_new_user()                    from public, anon, authenticated;
revoke execute on function public.notify_on_comment_reply()            from public, anon, authenticated;

commit;
