-- ============================================================================
-- Stage 4: Moderator Permissions Migration
-- Safe to run multiple times (IF NOT EXISTS / DROP IF EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- 1. Add moderator_permissions JSONB column to profiles (idempotent).
alter table public.profiles
  add column if not exists moderator_permissions jsonb;

-- 2. Helper functions for permission checks.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.approved = true and p.role = 'admin'
  );
$$;

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.approved = true and p.role = 'moderator'
  );
$$;

create or replace function public.has_moderator_permission(perm_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select (p.moderator_permissions ->> perm_key)::boolean
     from public.profiles p
     where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_moderator() from public;
revoke all on function public.has_moderator_permission(text) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_moderator() to authenticated;
grant execute on function public.has_moderator_permission(text) to authenticated;

-- 3. Tamper-proof BEFORE UPDATE trigger on public.profiles.
--    Non-admin users cannot modify their own role, approved, or moderator_permissions columns.
create or replace function public.profiles_prevent_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_admin boolean;
begin
  -- Only enforce on UPDATE
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  -- If the executor is an admin, allow any change
  select public.is_admin() into v_is_admin;
  if v_is_admin then
    return new;
  end if;

  -- Non-admin: block changes to role, approved, moderator_permissions
  if new.role is distinct from old.role then
    raise exception 'role column is not modifiable by non-admin users';
  end if;
  if new.approved is distinct from old.approved then
    raise exception 'approved column is not modifiable by non-admin users';
  end if;
  if new.moderator_permissions is distinct from old.moderator_permissions then
    raise exception 'moderator_permissions column is not modifiable by non-admin users';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_escalation on public.profiles;
create trigger profiles_prevent_self_escalation
  before update on public.profiles
  for each row
  execute function public.profiles_prevent_self_escalation();

-- 4. RLS policies for profiles (admin full access; moderator read own).
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_admin_read_all'
  ) then
    execute $policy$
      create policy profiles_admin_read_all
      on public.profiles
      for select to authenticated
      using (public.is_admin());
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_admin_write_all'
  ) then
    execute $policy$
      create policy profiles_admin_write_all
      on public.profiles
      for update to authenticated
      using (public.is_admin())
      with check (public.is_admin());
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_moderator_read_own'
  ) then
    execute $policy$
      create policy profiles_moderator_read_own
      on public.profiles
      for select to authenticated
      using (id = auth.uid() and approved = true and role = 'moderator');
    $policy$;
  end if;
end
$$;