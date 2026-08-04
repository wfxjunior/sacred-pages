create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.customers is 'Maps auth users to Stripe customer objects.';

grant select, insert, update, delete on public.customers to authenticated;
grant all on public.customers to service_role;

alter table public.customers enable row level security;

create policy "Users can read their own customer record"
  on public.customers
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own customer record"
  on public.customers
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own customer record"
  on public.customers
  for update
  to authenticated
  using (user_id = auth.uid());

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  status text not null,
  price_id text,
  product_id text,
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is 'Stripe subscription state synced via webhooks.';

grant select, insert, update, delete on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscriptions"
  on public.subscriptions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update their own subscriptions"
  on public.subscriptions
  for update
  to authenticated
  using (user_id = auth.uid());

create table public.products (
  id text primary key,
  name text not null,
  description text,
  active boolean not null default true,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is 'Stripe products mirrored locally.';

grant select on public.products to anon;
grant select on public.products to authenticated;
grant all on public.products to service_role;

alter table public.products enable row level security;

create policy "Anyone can read active products"
  on public.products
  for select
  to anon, authenticated
  using (active = true);

create table public.prices (
  id text primary key,
  product_id text references public.products(id) on delete restrict not null,
  unit_amount bigint,
  currency text not null default 'usd',
  type text not null check (type in ('one_time', 'recurring')),
  interval text check (interval in (null, 'day', 'week', 'month', 'year')),
  interval_count integer default 1,
  active boolean not null default true,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.prices is 'Stripe prices mirrored locally.';

grant select on public.prices to anon;
grant select on public.prices to authenticated;
grant all on public.prices to service_role;

alter table public.prices enable row level security;

create policy "Anyone can read active prices"
  on public.prices
  for select
  to anon, authenticated
  using (active = true);

create or replace function public.is_premium(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = _user_id
      and status in ('trialing', 'active', 'past_due')
      and (current_period_end is null or current_period_end > now())
  )
$$;

comment on function public.is_premium(uuid) is 'Returns true when the user has an active/trialing/past_due subscription.';

grant execute on function public.is_premium(uuid) to authenticated;
grant execute on function public.is_premium(uuid) to service_role;