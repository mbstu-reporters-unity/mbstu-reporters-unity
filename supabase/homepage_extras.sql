alter table public.posts
  add column if not exists is_featured boolean not null default false,
  add column if not exists summary text,
  add column if not exists tags text[] not null default '{}';
