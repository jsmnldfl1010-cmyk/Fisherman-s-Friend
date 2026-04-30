-- Fisherman's Friend PWA Supabase schema
-- Run this in the Supabase SQL editor or through your migration pipeline.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  primary_language text not null default 'Cebuano'
    check (primary_language in ('Cebuano', 'Hiligaynon', 'English', 'Filipino')),
  vessel_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cooperatives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  home_port text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.cooperative_members (
  cooperative_id uuid not null references public.cooperatives(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'coordinator', 'member')),
  trusted boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (cooperative_id, profile_id)
);

create table if not exists public.catch_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  device_id text,
  species text not null,
  weight_kg numeric(10, 2),
  location_name text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  notes text,
  caught_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.productive_zones (
  id uuid primary key default gen_random_uuid(),
  cooperative_id uuid not null references public.cooperatives(id) on delete cascade,
  name text not null,
  confidence text not null default 'medium' check (confidence in ('low', 'medium', 'high')),
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  radius_meters integer not null default 1000,
  last_catch_summary text,
  shared_by uuid references public.profiles(id) on delete set null,
  visibility text not null default 'trusted_members'
    check (visibility in ('admins', 'trusted_members', 'all_members')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marine_weather_alerts (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'PAGASA',
  title text not null,
  severity text not null check (severity in ('info', 'watch', 'warning', 'danger')),
  area text not null,
  message text not null,
  valid_from timestamptz not null,
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.community_alerts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  device_id text,
  cooperative_id uuid references public.cooperatives(id) on delete cascade,
  title text not null,
  level text not null default 'Safety' check (level in ('Safety', 'Weather', 'Market', 'Operations')),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  device_id text,
  name text not null,
  category text not null check (category in ('Fish', 'Supplies', 'Equipment', 'Services')),
  price text not null,
  seller_name text,
  quantity text,
  landing_site text,
  status text not null default 'active' check (status in ('active', 'reserved', 'sold', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voice_commands (
  id uuid primary key default gen_random_uuid(),
  language text not null check (language in ('Cebuano', 'Hiligaynon')),
  phrase text not null,
  intent text not null,
  response_template text,
  created_at timestamptz not null default now(),
  unique (language, phrase)
);

create index if not exists catch_logs_profile_caught_at_idx
  on public.catch_logs (profile_id, caught_at desc);

create index if not exists productive_zones_coop_idx
  on public.productive_zones (cooperative_id, confidence);

create index if not exists weather_alerts_validity_idx
  on public.marine_weather_alerts (area, valid_from desc);

create index if not exists community_alerts_coop_created_idx
  on public.community_alerts (cooperative_id, created_at desc);

create index if not exists marketplace_status_created_idx
  on public.marketplace_listings (status, created_at desc);

alter table public.profiles enable row level security;
alter table public.cooperatives enable row level security;
alter table public.cooperative_members enable row level security;
alter table public.catch_logs enable row level security;
alter table public.productive_zones enable row level security;
alter table public.marine_weather_alerts enable row level security;
alter table public.community_alerts enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.voice_commands enable row level security;

create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Authenticated users can read cooperatives"
  on public.cooperatives for select
  to authenticated
  using (true);

create policy "Public clients can read cooperatives"
  on public.cooperatives for select
  to anon
  using (true);

create policy "Members can read cooperative memberships"
  on public.cooperative_members for select
  to authenticated
  using (profile_id = auth.uid());

create policy "Users manage their own catch logs"
  on public.catch_logs for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Public clients can read catch logs"
  on public.catch_logs for select
  to anon
  using (true);

create policy "Public clients can create catch logs"
  on public.catch_logs for insert
  to anon
  with check (profile_id is null);

create policy "Coop members can read eligible productive zones"
  on public.productive_zones for select
  to authenticated
  using (
    exists (
      select 1
      from public.cooperative_members cm
      where cm.cooperative_id = productive_zones.cooperative_id
        and cm.profile_id = auth.uid()
        and (
          productive_zones.visibility = 'all_members'
          or (productive_zones.visibility = 'trusted_members' and cm.trusted)
          or (productive_zones.visibility = 'admins' and cm.role = 'admin')
        )
    )
  );

create policy "Public clients can read shared productive zones"
  on public.productive_zones for select
  to anon
  using (visibility in ('trusted_members', 'all_members'));

create policy "Trusted coop members can create productive zones"
  on public.productive_zones for insert
  to authenticated
  with check (
    shared_by = auth.uid()
    and exists (
      select 1
      from public.cooperative_members cm
      where cm.cooperative_id = productive_zones.cooperative_id
        and cm.profile_id = auth.uid()
        and cm.trusted
    )
  );

create policy "Authenticated users can read marine weather alerts"
  on public.marine_weather_alerts for select
  to authenticated
  using (true);

create policy "Public clients can read marine weather alerts"
  on public.marine_weather_alerts for select
  to anon
  using (true);

create policy "Authenticated users can read voice commands"
  on public.voice_commands for select
  to authenticated
  using (true);

create policy "Public clients can read voice commands"
  on public.voice_commands for select
  to anon
  using (true);

create policy "Coop members can read community alerts"
  on public.community_alerts for select
  to authenticated
  using (
    cooperative_id is null
    or exists (
      select 1
      from public.cooperative_members cm
      where cm.cooperative_id = community_alerts.cooperative_id
        and cm.profile_id = auth.uid()
    )
  );

create policy "Public clients can read community alerts"
  on public.community_alerts for select
  to anon
  using (true);

create policy "Authenticated users can create community alerts"
  on public.community_alerts for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "Public clients can create community alerts"
  on public.community_alerts for insert
  to anon
  with check (profile_id is null);

create policy "Authenticated users can read active marketplace listings"
  on public.marketplace_listings for select
  to authenticated
  using (status = 'active' or profile_id = auth.uid());

create policy "Public clients can read active marketplace listings"
  on public.marketplace_listings for select
  to anon
  using (status = 'active');

create policy "Users manage their own marketplace listings"
  on public.marketplace_listings for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Public clients can create marketplace listings"
  on public.marketplace_listings for insert
  to anon
  with check (profile_id is null);

insert into public.cooperatives (id, name, home_port, description)
values
  ('11111111-1111-4111-8111-111111111111', 'Sarangani Bluewater Coop', 'General Santos harbor', 'Trusted fishing zone sharing for Sarangani crews.'),
  ('22222222-2222-4222-8222-222222222222', 'Davao Gulf Handline Network', 'Davao Gulf', 'Handline crew reports and productive-zone verification.'),
  ('33333333-3333-4333-8333-333333333333', 'Southern Lights Fishers', 'Southern Mindanao', 'Night fishing and squid-light coordination.')
on conflict (id) do nothing;

insert into public.productive_zones (
  id,
  cooperative_id,
  name,
  confidence,
  latitude,
  longitude,
  radius_meters,
  last_catch_summary,
  visibility
)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Tuna shelf marker 14', 'high', 6.036000, 125.245000, 1850, 'Yellowfin movement reported 05:40', 'trusted_members'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Reef edge drift lane', 'medium', 7.001000, 125.702000, 1400, 'Mackerel school active before tide turn', 'all_members'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 'Night squid pocket', 'medium', 5.922000, 125.132000, 2100, 'Squid lights productive after moonset', 'trusted_members')
on conflict (id) do nothing;

insert into public.voice_commands (language, phrase, intent, response_template)
values
  ('Cebuano', 'Asa ang isda?', 'Show productive zones near current GPS position.', 'Nagpangita ko sa pinakaduol nga verified zone.'),
  ('Cebuano', 'Basaha ang panahon', 'Read PAGASA marine weather and sea condition alerts aloud.', 'Basahon nako ang pinakabag-o nga pahimangno.'),
  ('Hiligaynon', 'Diin ang maayo nga hulugan?', 'Find trusted cooperative fishing zones.', 'Ginapangita ko ang maayo nga hulugan halin sa coop.'),
  ('Hiligaynon', 'Irekord ang dakop', 'Start a hands-free catch log.', 'Sugdan ta ang rekord sang dakop.')
on conflict (language, phrase) do nothing;

insert into public.marine_weather_alerts (source, title, severity, area, message, valid_from, valid_until)
values
  ('PAGASA', 'Thunderstorm potential', 'watch', 'Sarangani Bay', 'Possible squalls west of Sarangani Bay after 16:00. Keep VHF and push alerts on.', now(), now() + interval '12 hours'),
  ('PAGASA', 'Moderate seas', 'info', 'General Santos coastal waters', 'Small craft can proceed nearshore with updated checks every 30 minutes.', now(), now() + interval '12 hours')
on conflict do nothing;
