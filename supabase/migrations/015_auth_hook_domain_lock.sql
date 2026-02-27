-- ============================================================================
-- Auth Hook: Restrict signups to @kbw.vc domain
-- Server-side enforcement — cannot be bypassed by calling Supabase Auth API directly
-- After applying this migration, enable the hook in Supabase Dashboard:
--   Authentication > Hooks > Before User Created > select public.hook_restrict_email_domain
-- ============================================================================

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

-- Grant execute to supabase_auth_admin (required for auth hooks)
GRANT EXECUTE ON FUNCTION public.hook_restrict_email_domain(jsonb) TO supabase_auth_admin;

-- Revoke from public roles to prevent direct invocation via Data APIs
REVOKE EXECUTE ON FUNCTION public.hook_restrict_email_domain(jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.hook_restrict_email_domain(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.hook_restrict_email_domain(jsonb) FROM public;
