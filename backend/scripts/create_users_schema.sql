create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'lite',
  plan text default 'lite',
  trial_end timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.users enable row level security;

create policy "Users can view their own user data"
  on public.users
  for select
  using (auth.email() = email);

create policy "Users can update their own user data"
  on public.users
  for update
  using (auth.email() = email);

create policy "Service role can access all user data"
  on public.users
  for all
  using (auth.role() = 'service_role');

create or replace function public.get_user_subscription(email_param text)
returns json as $$
declare
  user_data record;
  is_active boolean;
  trial_active boolean;
  result json;
begin
  select * into user_data from public.users where email = email_param;
  
  if user_data is null then
    return json_build_object(
      'status', 'lite',
      'trial_active', false,
      'trial_days_left', 0,
      'current_period_end', null
    );
  end if;
  
  trial_active := user_data.trial_end is not null and user_data.trial_end > now();
  
  is_active := user_data.subscription_status = 'active' or 
               user_data.plan = 'lite' or 
               trial_active;
  
  result := json_build_object(
    'status', user_data.plan,
    'trial_active', trial_active,
    'trial_days_left', case when trial_active then 
                         extract(day from user_data.trial_end - now())::integer
                       else 
                         0 
                       end,
    'current_period_end', user_data.current_period_end
  );
  
  return result;
end;
$$ language plpgsql security definer;
