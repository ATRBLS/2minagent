-- 2minAgent core schema

create extension if not exists "pgcrypto";

-- ============ PLATFORM ============

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  timezone text default 'Europe/Paris',
  language text default 'fr' check (language in ('fr','en')),
  plan text default 'free' check (plan in ('free','pro','builder')),
  stripe_customer_id text,
  push_subscription jsonb,
  vapid_public_key text,
  created_at timestamptz default now()
);

create table agents (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  category text,
  is_first_party boolean default true,
  builder_id uuid references users(id),
  status text default 'active' check (status in ('active','inactive','coming_soon')),
  created_at timestamptz default now()
);

create table user_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  installed_at timestamptz default now(),
  is_active boolean default true,
  config jsonb default '{}'::jsonb,
  unique (user_id, agent_id)
);

create table connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  provider text not null check (provider in ('gmail','outlook','linkedin','instagram')),
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  account_email text,
  created_at timestamptz default now(),
  unique (user_id, provider)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  agent_id uuid references agents(id),
  type text,
  title text not null,
  body text not null,
  action_url text,
  is_read boolean default false,
  push_sent boolean default false,
  created_at timestamptz default now()
);

-- ============ AGENT EMAIL ============

create table emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  account_id uuid references connected_accounts(id) on delete cascade,
  message_id text not null,
  sender_name text,
  sender_email text,
  subject text,
  received_at timestamptz,
  category text check (category in ('action_required','deadline','info','noise')),
  ai_summary text,
  action_needed text,
  deadline_date date,
  is_done boolean default false,
  replied_at timestamptz,
  created_at timestamptz default now(),
  unique (account_id, message_id)
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  email_id uuid references emails(id) on delete cascade,
  remind_at timestamptz not null,
  sent_at timestamptz
);

-- ============ AGENT SOCIAL MEDIA ============

create table social_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  account_id uuid references connected_accounts(id) on delete cascade,
  platform text check (platform in ('linkedin','instagram')),
  content text,
  hashtags text[],
  scheduled_at timestamptz,
  published_at timestamptz,
  status text default 'draft' check (status in ('draft','scheduled','published','failed')),
  reach int default 0,
  engagement int default 0,
  reminded_at timestamptz,
  created_at timestamptz default now()
);

create table content_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  week_start date not null,
  generated_at timestamptz default now(),
  posts_count int default 0
);

create table user_voice_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  industry text,
  topics text[],
  goal text check (goal in ('visibility','leads','personal_brand')),
  tone_descriptors text[],
  last_updated timestamptz default now()
);

create table trending_topics (
  id uuid primary key default gen_random_uuid(),
  industry text,
  topic text,
  score numeric,
  detected_at timestamptz default now()
);

-- ============ MARKETPLACE ============

create table agent_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table builder_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  company_name text,
  website text,
  stripe_account_id text,
  verified boolean default false
);

-- ============ INDEXES ============

create index idx_emails_user_category on emails(user_id, category);
create index idx_emails_user_deadline on emails(user_id, deadline_date);
create index idx_social_posts_user_status on social_posts(user_id, status);
create index idx_notifications_user_read on notifications(user_id, is_read);
create index idx_user_agents_user on user_agents(user_id);

-- ============ ROW LEVEL SECURITY ============

alter table users enable row level security;
alter table user_agents enable row level security;
alter table connected_accounts enable row level security;
alter table notifications enable row level security;
alter table emails enable row level security;
alter table reminders enable row level security;
alter table social_posts enable row level security;
alter table content_plans enable row level security;
alter table user_voice_profile enable row level security;
alter table agent_reviews enable row level security;
alter table builder_profiles enable row level security;

create policy "own row" on users for select using (auth.uid() = id);
create policy "own row update" on users for update using (auth.uid() = id);

create policy "own data" on user_agents for all using (auth.uid() = user_id);
create policy "own data" on connected_accounts for all using (auth.uid() = user_id);
create policy "own data" on notifications for all using (auth.uid() = user_id);
create policy "own data" on emails for all using (auth.uid() = user_id);
create policy "own data" on reminders for all using (auth.uid() = user_id);
create policy "own data" on social_posts for all using (auth.uid() = user_id);
create policy "own data" on content_plans for all using (auth.uid() = user_id);
create policy "own data" on user_voice_profile for all using (auth.uid() = user_id);
create policy "own data" on builder_profiles for all using (auth.uid() = user_id);

create policy "read reviews" on agent_reviews for select using (true);
create policy "write own review" on agent_reviews for insert with check (auth.uid() = user_id);

-- agents table: public read
alter table agents enable row level security;
create policy "public read agents" on agents for select using (true);

-- seed first-party agents
insert into agents (slug, name, description, icon, category, is_first_party, status) values
  ('email-agent', 'Agent Email', 'Lit tes emails, classe les urgences, te previent au bon moment.', 'mail', 'productivity', true, 'active'),
  ('social-media-agent', 'Agent Social Media', 'Genere et planifie tes posts LinkedIn et Instagram.', 'share-2', 'marketing', true, 'active'),
  ('finance-agent', 'Agent Finance', 'Bientot disponible.', 'wallet', 'finance', true, 'coming_soon'),
  ('devops-agent', 'Agent DevOps', 'Bientot disponible.', 'server', 'tech', true, 'coming_soon'),
  ('lifestyle-agent', 'Agent Lifestyle', 'Bientot disponible.', 'sparkles', 'lifestyle', true, 'coming_soon');

-- auto-create users row on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
