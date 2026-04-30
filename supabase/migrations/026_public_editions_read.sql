-- Make editions publicly readable for the anonymous reader folio bar.
-- Write access remains restricted by the existing editions_admin_write policy.

drop policy if exists "editions_select_authenticated" on public.editions;
drop policy if exists "editions_select_public" on public.editions;

create policy "editions_select_public"
  on public.editions for select
  to anon, authenticated
  using (true);
