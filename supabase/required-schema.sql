-- MBSTURU application schema reference
-- This file only creates missing tables and the missing reaction-count view;
-- it does not alter or delete existing data.
-- Review your current Supabase schema and RLS policies before running it.
-- CREATE TABLE IF NOT EXISTS does not add missing columns to an existing table.
-- Do not expose newly-created tables through the API until appropriate RLS policies
-- and grants have been reviewed and configured.
-- The app also uploads files to Storage buckets named "post-images" and "notices".
-- Optional RPCs with client-side fallbacks: admin_get_all_profiles,
-- admin_delete_user, admin_export_backup, increment_post_view,
-- and verify_event_certificate.
-- Newsroom drafts have scoped role-based RLS policies below; review existing
-- policies on every other table before exposing it through the API.

create table if not exists public.app_config (
  key text primary key,
  value text not null default ''
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text not null default '',
  department text,
  batch text,
  student_id text,
  phone text,
  role text not null default 'user',
  user_type text not null default 'student',
  designation text,
  office_section text,
  staff_id text,
  bio text,
  approved boolean not null default false,
  can_publish_notice boolean,
  newspaper_name text,
  avatar_url text,
  director_visible boolean not null default false,
  moderator_permissions jsonb,
  created_at timestamptz not null default now()
);

-- Stage 4: Global Moderator Panel master toggle (app_config key: moderator_panel_enabled)
-- Admin sets this to 'true' or 'false' to enable/disable the entire moderator panel globally.
-- The app reads this key from app_config via getSiteSettings / saveSiteSettings.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  heading text,
  body text,
  category text,
  club_id uuid,
  page_id uuid,
  author text,
  author_avatar text,
  author_user_type text,
  show_author_avatar boolean,
  image_url text,
  video_url text,
  embed_media_url text,
  user_id uuid,
  created_at timestamptz not null default now(),
  hidden boolean,
  link_url text,
  view_count bigint not null default 0
);

create table if not exists public.categories (
  name text primary key,
  sort_order integer,
  is_hidden boolean not null default false,
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  name text,
  message text not null,
  parent_id uuid,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  device_id text not null,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, device_id)
);

create table if not exists public.leaders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  position text not null default '',
  sort_order integer not null default 0,
  display_name text not null default '',
  department text,
  message text,
  photo_url text,
  is_visible boolean not null default true,
  term_year integer not null default extract(year from now())::integer,
  photo_style jsonb
);

create table if not exists public.community_pages (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid,
  name text not null default '',
  name_en text,
  slug text not null unique,
  category text,
  bio text,
  cover_url text,
  avatar_url text,
  phone text,
  email text,
  location text,
  website_url text,
  fb_url text,
  yt_url text,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.page_follows (
  page_id uuid not null references public.community_pages(id) on delete cascade,
  follower_key text not null,
  user_id uuid,
  created_at timestamptz not null default now(),
  primary key (page_id, follower_key)
);

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  parent_type text not null,
  parent_id uuid not null,
  url text not null,
  caption text,
  credit text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.image_layouts (
  parent_type text not null,
  parent_id uuid not null,
  layout text not null default 'grid',
  primary key (parent_type, parent_id)
);

create table if not exists public.student_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null default '',
  title text not null default '',
  excerpt text,
  author text,
  dept text,
  batch text,
  image_url text,
  link_url text,
  embed_media_url text,
  featured boolean not null default false,
  hidden boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.student_corner_categories (
  id bigint generated by default as identity primary key,
  name text not null unique
);

create table if not exists public.student_comments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  name text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.board_notices (
  id uuid primary key default gen_random_uuid(),
  branch text not null default 'university',
  department_id uuid,
  title text not null default '',
  heading text,
  body text,
  ref_number text,
  link_url text,
  embed_media_url text,
  file_url text,
  file_name text,
  file_type text,
  image_urls text[] not null default '{}',
  show_name boolean not null default true,
  poster_name text,
  is_pinned boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.board_notice_owners (
  notice_id uuid not null references public.board_notices(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (notice_id, user_id)
);

create table if not exists public.board_notice_comments (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references public.board_notices(id) on delete cascade,
  name text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  department text not null,
  batch text not null,
  student_id text not null,
  phone text not null,
  email text not null,
  current_media text,
  interests text[] not null default '{}',
  sample_writing text not null,
  photo_url text,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  full_name text not null,
  department text not null,
  batch text not null,
  student_id text not null,
  phone text not null,
  email text not null,
  certificate_code text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_feedback (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'contact',
  name text,
  email text,
  phone text,
  department_or_office text,
  subject text not null,
  message text not null,
  post_url text,
  is_anonymous boolean not null default false,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.user_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  sender_name text not null,
  sender_email text,
  sender_phone text,
  sender_type text not null default 'student',
  sender_dept text,
  sender_batch text,
  sender_student_id text,
  sender_designation text,
  sender_office_section text,
  submission_type text not null,
  title text,
  subtitle text,
  details text,
  truth_pledge text,
  media_urls jsonb not null default '[]'::jsonb,
  email_sent boolean not null default false,
  email_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.newsroom_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  author_name text not null,
  author_avatar text,
  title text not null,
  heading text,
  category text not null,
  body text not null,
  image_url text,
  link_url text,
  status text not null default 'draft',
  editor_note text,
  published_post_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Newsroom access: approved members write their own drafts; approved admins
-- and moderators review, publish, and manage drafts.
create or replace function public.is_approved_newsroom_member()
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
  );
$$;

create or replace function public.is_approved_newsroom_editor()
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
      and p.role in ('admin', 'moderator')
  );
$$;

revoke all on function public.is_approved_newsroom_member() from public;
revoke all on function public.is_approved_newsroom_editor() from public;
grant execute on function public.is_approved_newsroom_member() to authenticated;
grant execute on function public.is_approved_newsroom_editor() to authenticated;

alter table public.newsroom_drafts enable row level security;
revoke all on public.newsroom_drafts from anon;
grant select, insert, update, delete on public.newsroom_drafts to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'newsroom_drafts'
      and policyname = 'newsroom_drafts_read_own_or_editor'
  ) then
    execute $policy$
      create policy newsroom_drafts_read_own_or_editor
      on public.newsroom_drafts
      for select to authenticated
      using (
        (user_id = auth.uid() and public.is_approved_newsroom_member())
        or public.is_approved_newsroom_editor()
      )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'newsroom_drafts'
      and policyname = 'newsroom_drafts_insert_own'
  ) then
    execute $policy$
      create policy newsroom_drafts_insert_own
      on public.newsroom_drafts
      for insert to authenticated
      with check (
        user_id = auth.uid()
        and public.is_approved_newsroom_member()
        and status in ('draft', 'submitted')
      )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'newsroom_drafts'
      and policyname = 'newsroom_drafts_update_own_unpublished'
  ) then
    execute $policy$
      create policy newsroom_drafts_update_own_unpublished
      on public.newsroom_drafts
      for update to authenticated
      using (
        user_id = auth.uid()
        and status in ('draft', 'needs_revision')
        and public.is_approved_newsroom_member()
      )
      with check (
        user_id = auth.uid()
        and status in ('draft', 'submitted', 'needs_revision')
        and public.is_approved_newsroom_member()
      )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'newsroom_drafts'
      and policyname = 'newsroom_drafts_manage_as_editor'
  ) then
    execute $policy$
      create policy newsroom_drafts_manage_as_editor
      on public.newsroom_drafts
      for all to authenticated
      using (public.is_approved_newsroom_editor())
      with check (public.is_approved_newsroom_editor())
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'newsroom_drafts'
      and policyname = 'newsroom_drafts_delete_own_unpublished'
  ) then
    execute $policy$
      create policy newsroom_drafts_delete_own_unpublished
      on public.newsroom_drafts
      for delete to authenticated
      using (
        user_id = auth.uid()
        and status in ('draft', 'submitted', 'needs_revision')
        and public.is_approved_newsroom_member()
      )
    $policy$;
  end if;
end
$$;

create table if not exists public.faculties (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  name_en text,
  image_url text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null,
  name text not null default '',
  name_en text,
  code text,
  image_url text,
  about text,
  contact_info text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.department_teachers (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null,
  name text not null default '',
  designation text not null default '',
  qualifications text,
  bio text,
  photo_url text,
  email text,
  phone text,
  sort_order integer not null default 0,
  is_chairman boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.department_events (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null,
  title text not null default '',
  details text,
  date text,
  image_url text,
  image_urls text[],
  created_at timestamptz not null default now()
);

create table if not exists public.campus_clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  name_bn text,
  tag text not null default '',
  icon text not null default '',
  logo_url text,
  cover_url text,
  activity text,
  activity_bn text,
  date text,
  fb_url text,
  yt_url text,
  web_url text,
  embed_media_url text,
  committee_term text,
  committee_members jsonb,
  reports_title text,
  reports jsonb,
  contact_info text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.university_associations (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  name_en text,
  university_name text,
  logo_url text,
  website_url text,
  fb_url text,
  yt_url text,
  description text,
  contact_info text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mbstu_administration (
  id uuid primary key default gen_random_uuid(),
  category text not null default '',
  office_name text not null default '',
  name text not null default '',
  designation text not null default '',
  photo_url text,
  bio text,
  email text,
  phone text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mbstu_social_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  name_en text,
  category text,
  logo_url text,
  website_url text,
  fb_url text,
  yt_url text,
  description text,
  contact_info text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.social_site_notices (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.mbstu_social_sites(id) on delete cascade,
  title text not null default '',
  details text,
  date text,
  image_urls text[],
  created_at timestamptz not null default now()
);

create table if not exists public.ticker_items (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  url text,
  level text not null default 'normal',
  sound_alert boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  expires_at timestamptz,
  author_name text,
  text_color text,
  bg_color text,
  speed integer not null default 70,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text,
  summary text,
  category text,
  button_text text,
  link_url text,
  slide_type text,
  banner_config jsonb,
  text_layers jsonb,
  video_config jsonb,
  transition_effect text,
  slide_duration integer,
  slide_speed_pct integer,
  media_items jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hero_settings (
  id integer primary key,
  breaking_on boolean not null default false,
  breaking_title text,
  breaking_text text,
  breaking_link text,
  breaking_btn_text text,
  breaking_bg_color text,
  breaking_bg_gradient text,
  desktop_splits integer,
  default_duration integer,
  default_transition text,
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  author_name text not null default '',
  author_avatar text,
  media_url text not null default '',
  media_type text not null default 'image',
  caption text,
  link_url text,
  post_id uuid,
  is_highlight boolean not null default false,
  highlight_title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  author_name text not null default '',
  author_avatar text,
  video_url text not null default '',
  thumbnail_url text,
  post_id uuid,
  link_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.campus_polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.campus_poll_votes (
  poll_id uuid not null references public.campus_polls(id) on delete cascade,
  option_id text not null,
  device_id text not null,
  created_at timestamptz not null default now(),
  primary key (poll_id, device_id)
);

create table if not exists public.campus_podcasts (
  id uuid primary key default gen_random_uuid(),
  series_name text not null default '',
  episode_number text,
  title text not null default '',
  description text,
  media_url text not null default '',
  thumbnail_url text,
  host_name text,
  guest_name text,
  duration text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Used by the public reaction UI. The UI expects post_id, emoji and total.
do $$
begin
  if to_regclass('public.post_reaction_counts') is null then
    execute 'create view public.post_reaction_counts as
      select post_id, emoji, count(*)::bigint as total
      from public.post_reactions group by post_id, emoji';
  end if;
end
$$;

-- Query used by the app to compare the live database with this reference.
select
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name in (
    'app_config', 'site_settings', 'profiles', 'posts', 'categories', 'comments',
    'post_reactions', 'post_reaction_counts', 'leaders', 'community_pages',
    'page_follows', 'post_images', 'image_layouts', 'student_items',
    'student_corner_categories', 'student_comments', 'board_notices',
    'board_notice_owners', 'board_notice_comments', 'membership_applications',
    'event_registrations', 'newsletter_subscribers', 'contact_feedback',
    'user_submissions', 'newsroom_drafts', 'faculties', 'departments',
    'department_teachers', 'department_events', 'campus_clubs',
    'university_associations', 'mbstu_administration', 'mbstu_social_sites',
    'social_site_notices', 'ticker_items', 'hero_slides', 'hero_settings',
    'stories', 'reels', 'campus_polls', 'campus_poll_votes', 'campus_podcasts'
  )
order by c.table_name, c.ordinal_position;

-- ============================================================================
-- Stage 4: Moderator Permissions System
-- ============================================================================

-- 1. Helper functions for permission checks
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

-- 2. Tamper-proof BEFORE UPDATE trigger on public.profiles
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

-- 3. RLS policies for profiles (admin full access; moderator read own)
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
