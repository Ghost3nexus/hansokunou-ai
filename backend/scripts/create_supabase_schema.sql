create table if not exists public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  openai_key text,
  notion_token text,
  notion_database_id text,
  slack_webhook text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.user_settings enable row level security;

create policy "Users can view their own settings"
  on public.user_settings
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own settings"
  on public.user_settings
  for delete
  using (auth.uid() = user_id);
