-- Newlog CMS independente do WordPress
-- Execute no SQL Editor do Supabase depois de criar o projeto.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('superadmin', 'admin', 'editor', 'author', 'contributor');
create type public.content_status as enum ('draft', 'published', 'scheduled', 'archived');
create type public.media_status as enum ('active', 'hidden');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role public.user_role not null default 'contributor',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null default 'primary',
  items jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'published',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(name, location)
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  blocks jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  template text not null default 'default',
  seo_title text,
  seo_description text,
  canonical_url text,
  featured_image text,
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  featured boolean not null default false,
  featured_image text,
  author_id uuid references public.profiles(id) on delete set null,
  seo_title text,
  seo_description text,
  canonical_url text,
  published_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.taxonomies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  taxonomy_type text not null check (taxonomy_type in ('category', 'tag')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_taxonomies (
  post_id uuid not null references public.posts(id) on delete cascade,
  taxonomy_id uuid not null references public.taxonomies(id) on delete cascade,
  primary key (post_id, taxonomy_id)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_path text not null unique,
  mime_type text not null,
  alt_text text,
  caption text,
  description text,
  folder text,
  width integer,
  height integer,
  size_bytes bigint,
  status public.media_status not null default 'active',
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('page', 'post', 'menu', 'settings')),
  entity_id uuid not null,
  version integer not null,
  snapshot jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(entity_type, entity_id, version)
);

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  fields jsonb not null default '[]'::jsonb,
  notification_email text,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  modality text,
  category text,
  ranking_points integer not null default 0,
  source_sheet text,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ranking_entries (
  id uuid primary key default gen_random_uuid(),
  team_name text not null unique,
  position integer not null,
  total_points integer not null default 0,
  scores jsonb not null default '[]'::jsonb,
  source_sheet text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  metric text not null,
  value integer not null default 0,
  position integer not null,
  source_sheet text not null,
  image_url text,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  edition integer not null unique,
  label text not null,
  year integer,
  highlights jsonb not null default '[]'::jsonb,
  source_sheet text not null,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  status text not null check (status in ('preview', 'review', 'completed', 'failed')),
  summary jsonb not null default '{}'::jsonb,
  error_log jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text not null,
  entity_id uuid,
  user_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index pages_status_idx on public.pages(status);
create index posts_status_published_idx on public.posts(status, published_at desc);
create index media_folder_idx on public.media_assets(folder);
create index audit_logs_created_idx on public.audit_logs(created_at desc);
create index submissions_created_idx on public.form_submissions(created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','site_settings','menus','pages','posts','taxonomies','media_assets','forms','teams','ranking_entries','players','competitions'] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true limit 1;
$$;

create or replace function public.can_edit_content()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_user_role() in ('superadmin', 'admin', 'editor', 'author'), false);
$$;

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.menus enable row level security;
alter table public.pages enable row level security;
alter table public.posts enable row level security;
alter table public.taxonomies enable row level security;
alter table public.post_taxonomies enable row level security;
alter table public.media_assets enable row level security;
alter table public.revisions enable row level security;
alter table public.forms enable row level security;
alter table public.form_submissions enable row level security;
alter table public.teams enable row level security;
alter table public.ranking_entries enable row level security;
alter table public.players enable row level security;
alter table public.competitions enable row level security;
alter table public.import_jobs enable row level security;
alter table public.audit_logs enable row level security;

create policy "public read published pages" on public.pages for select using (status = 'published');
create policy "public read published posts" on public.posts for select using (status = 'published');
create policy "public read published menus" on public.menus for select using (status = 'published');
create policy "public read public settings" on public.site_settings for select using (is_public = true);
create policy "public read active media" on public.media_assets for select using (status = 'active');
create policy "public read published teams" on public.teams for select using (status = 'published');
create policy "public read ranking" on public.ranking_entries for select using (true);
create policy "public read players" on public.players for select using (status = 'published');
create policy "public read competitions" on public.competitions for select using (status = 'published');
create policy "public read taxonomies" on public.taxonomies for select using (true);
create policy "public read post taxonomies" on public.post_taxonomies for select using (true);

create policy "editors manage profiles" on public.profiles for all using (id = auth.uid() or public.current_user_role() in ('superadmin', 'admin')) with check (id = auth.uid() or public.current_user_role() in ('superadmin', 'admin'));
create policy "editors manage settings" on public.site_settings for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage menus" on public.menus for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage pages" on public.pages for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage posts" on public.posts for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage taxonomies" on public.taxonomies for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage post taxonomies" on public.post_taxonomies for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage media" on public.media_assets for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors read revisions" on public.revisions for select using (public.can_edit_content());
create policy "editors manage revisions" on public.revisions for insert with check (public.can_edit_content());
create policy "editors manage forms" on public.forms for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "public create submissions" on public.form_submissions for insert with check (true);
create policy "editors read submissions" on public.form_submissions for select using (public.can_edit_content());
create policy "editors manage submissions" on public.form_submissions for update using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage teams" on public.teams for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage ranking" on public.ranking_entries for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage players" on public.players for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage competitions" on public.competitions for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors manage imports" on public.import_jobs for all using (public.can_edit_content()) with check (public.can_edit_content());
create policy "editors read audit" on public.audit_logs for select using (public.can_edit_content());
create policy "editors create audit" on public.audit_logs for insert with check (public.can_edit_content());

insert into storage.buckets (id, name, public)
values ('newlog-media', 'newlog-media', true)
on conflict (id) do nothing;

create policy "public read newlog media" on storage.objects for select using (bucket_id = 'newlog-media');
create policy "editors upload newlog media" on storage.objects for insert to authenticated with check (bucket_id = 'newlog-media' and public.can_edit_content());
create policy "editors update newlog media" on storage.objects for update to authenticated using (bucket_id = 'newlog-media' and public.can_edit_content()) with check (bucket_id = 'newlog-media' and public.can_edit_content());
create policy "admins delete newlog media" on storage.objects for delete to authenticated using (bucket_id = 'newlog-media' and public.current_user_role() in ('superadmin', 'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
