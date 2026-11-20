-- One-time setup for the public writing/photo competition submission workflow.
-- Safe to run again: existing records are not deleted or rewritten.

create table if not exists public.opportunity_submissions (
  id uuid primary key default gen_random_uuid(),
  opportunity_id text not null,
  opportunity_title text not null,
  applicant_name text not null,
  applicant_email text not null,
  department text not null,
  batch text not null,
  student_id text,
  entry_title text not null,
  entry_text text,
  work_url text,
  status text not null default 'submitted'
    check (status in ('submitted', 'in_review', 'needs_revision', 'accepted', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_submissions_entry_check
    check (nullif(trim(entry_text), '') is not null or nullif(trim(work_url), '') is not null),
  constraint opportunity_submissions_work_url_check
    check (work_url is null or work_url ~* '^https://')
);

create index if not exists opportunity_submissions_created_at_idx
  on public.opportunity_submissions (created_at desc);

create or replace function public.is_approved_opportunity_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.approved = true
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_approved_opportunity_admin() from public;
grant execute on function public.is_approved_opportunity_admin() to authenticated;

alter table public.opportunity_submissions enable row level security;
grant insert on public.opportunity_submissions to anon;
grant select, update on public.opportunity_submissions to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'opportunity_submissions'
      and policyname = 'opportunity_submissions_public_insert'
  ) then
    create policy opportunity_submissions_public_insert
      on public.opportunity_submissions
      for insert to anon
      with check (status = 'submitted' and admin_note is null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'opportunity_submissions'
      and policyname = 'opportunity_submissions_admin_read'
  ) then
    create policy opportunity_submissions_admin_read
      on public.opportunity_submissions
      for select to authenticated
      using (public.is_approved_opportunity_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'opportunity_submissions'
      and policyname = 'opportunity_submissions_admin_update'
  ) then
    create policy opportunity_submissions_admin_update
      on public.opportunity_submissions
      for update to authenticated
      using (public.is_approved_opportunity_admin())
      with check (public.is_approved_opportunity_admin());
  end if;
end
$$;
