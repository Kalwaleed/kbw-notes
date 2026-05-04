-- ============================================================================
-- Allow anonymous sign-ins to bypass the @kbw.vc domain lock
-- ============================================================================
--
-- Migration 015 restricts every signup to @kbw.vc emails via a before-user-created
-- auth hook. That blocks Supabase Auth's anonymous sign-ins (which have no email),
-- so the public submission flow's cover-image uploader cannot create the
-- authenticated session that the storage policy in 009 requires.
--
-- This migration updates the hook to allow anonymous users through. The rest of
-- the security envelope is unchanged: anonymous users still cannot read or write
-- anything that RLS doesn't permit for the `authenticated` role, and the email
-- domain check still applies to every email-based signup.
--
-- Post-MVP: replace this with a service-role Edge Function for public cover
-- uploads (option C in phase 3 deploy notes) and remove anonymous sessions
-- entirely.

CREATE OR REPLACE FUNCTION public.hook_restrict_email_domain(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_email TEXT;
  email_domain TEXT;
BEGIN
  -- Anonymous sign-ins have no email and bypass the domain check by design.
  -- They are still subject to every downstream RLS policy.
  IF (event->'user'->>'is_anonymous')::boolean IS TRUE THEN
    RETURN '{}'::jsonb;
  END IF;

  user_email := event->'user'->>'email';
  email_domain := split_part(user_email, '@', 2);

  IF lower(email_domain) != 'kbw.vc' THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Only @kbw.vc email addresses are allowed to sign up.'
      )
    );
  END IF;

  -- Allow signup
  RETURN '{}'::jsonb;
END;
$$;

-- Permissions are inherited from migration 015 (CREATE OR REPLACE preserves
-- existing GRANT/REVOKE state), but re-state them for safety.
GRANT EXECUTE ON FUNCTION public.hook_restrict_email_domain(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.hook_restrict_email_domain(jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.hook_restrict_email_domain(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.hook_restrict_email_domain(jsonb) FROM public;
