INSERT INTO public.invited_emails (email) VALUES ('k@kbw.vc') ON CONFLICT (email) DO NOTHING;
