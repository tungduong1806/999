begin;
create table public.weather_forecast_cache (
  grid_key text primary key check (char_length(grid_key) <= 24),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  fetched_at timestamptz not null default now()
);
create index weather_forecast_cache_fetched_at on public.weather_forecast_cache (fetched_at);
alter table public.weather_forecast_cache enable row level security;
revoke all on public.weather_forecast_cache from public, anon, authenticated;
grant select, insert, update, delete on public.weather_forecast_cache to service_role;

create table public.weather_ai_quota (
  singleton boolean primary key default true check (singleton),
  bucket timestamptz not null,
  request_count integer not null check (request_count between 1 and 60)
);
alter table public.weather_ai_quota enable row level security;
revoke all on public.weather_ai_quota from public, anon, authenticated;
grant select, insert, update on public.weather_ai_quota to service_role;

create function public.take_weather_ai_slot() returns boolean
language sql volatile security invoker set search_path = ''
as $$
  with taken as (
    insert into public.weather_ai_quota as quota (singleton, bucket, request_count)
    values (true, pg_catalog.date_trunc('hour', pg_catalog.now()), 1)
    on conflict (singleton) do update
    set bucket = excluded.bucket,
        request_count = case when quota.bucket < excluded.bucket then 1 else quota.request_count + 1 end
    where quota.bucket < excluded.bucket or (quota.bucket = excluded.bucket and quota.request_count < 60)
    returning 1
  ) select exists (select 1 from taken);
$$;
revoke all on function public.take_weather_ai_slot() from public, anon, authenticated;
grant execute on function public.take_weather_ai_slot() to service_role;
commit;
