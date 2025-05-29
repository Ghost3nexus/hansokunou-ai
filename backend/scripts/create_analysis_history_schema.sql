create table if not exists public.analysis_history (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  url text not null,
  analyzed_at timestamp with time zone default now(),
  product_count integer default 0,
  category_count integer default 0,
  price_count integer default 0,
  has_advice boolean default false,
  advice_summary text,
  notion_page_url text,
  tags text[] default '{}',
  summary_json jsonb,
  sns_score float default 0,
  structure_score float default 0,
  ux_score float default 0,
  app_score float default 0,
  theme_score float default 0,
  created_at timestamp with time zone default now()
);

alter table public.analysis_history enable row level security;

create policy "Users can view their own analysis history"
  on public.analysis_history
  for select
  using (auth.email() = user_email);

create policy "Users can insert their own analysis history"
  on public.analysis_history
  for insert
  with check (auth.email() = user_email);
