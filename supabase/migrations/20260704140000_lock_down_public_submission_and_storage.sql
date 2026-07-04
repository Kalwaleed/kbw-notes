-- ============================================================================
-- Lock down the public submission + storage surface (HIGH #2 and #3).
-- ============================================================================
--
-- Before: the client called submit_reader_submission directly (granted to anon)
-- with no rate limit, and uploaded cover images to the post-images bucket using
-- an anonymous Supabase session. Both were abuse vectors (submission flood /
-- uncapped 5MB uploads).
--
-- After: the submit-reader-submission Edge Function is the only caller. It
-- rate-limits per IP and uploads images with the service role, so the client
-- needs neither direct RPC access nor storage write access. The service role
-- bypasses RLS, so revoking these grants does not affect the Edge Function.
-- ============================================================================

-- 1. Only the service role (via the Edge Function) may insert submissions now.
revoke execute on function
  public.submit_reader_submission(text, text, text, text, text, text[], text)
  from anon, authenticated;

-- 2. Remove client-side storage write access to post-images. Uploads are
--    service-role-only from here on; the bucket stays publicly readable via
--    its `public` flag (no SELECT policy needed).
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;
