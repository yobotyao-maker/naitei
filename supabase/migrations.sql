-- ============================================================
-- naitei.ai — Supabase SQL Migrations
-- 在 Supabase SQL Editor 中按顺序执行全部内容
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. subscriptions 表
-- ────────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references auth.users(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  plan                   text default 'free',        -- free | pack | pro
  status                 text default 'active',
  interviews_used        int  default 0,
  interviews_limit       int  default 1,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

alter table subscriptions enable row level security;

drop policy if exists "Users can view own subscription" on subscriptions;
create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- 如果表已存在，补充缺少的字段
alter table subscriptions
  add column if not exists plan             text default 'free',
  add column if not exists interviews_used  int  default 0,
  add column if not exists interviews_limit int  default 1;


-- ────────────────────────────────────────────────────────────
-- 2. get_admin_stats() — 管理后台全量统计
-- ────────────────────────────────────────────────────────────
create or replace function get_admin_stats()
returns json
language sql
security definer
as $$
  select json_build_object(
    'total_users',      (select count(*) from subscriptions),
    'total_interviews', (select count(*) from interviews),
    'pack_users',       (select count(*) from subscriptions where plan = 'pack'),
    'pro_users',        (select count(*) from subscriptions where plan = 'pro'),
    'pack_revenue',     (select count(*) from subscriptions where plan = 'pack') * 980,
    'mrr',              (select count(*) from subscriptions where plan = 'pro')  * 1980,
    'level_dist', (
      select json_build_object(
        'S1', count(*) filter (where level = 'S1'),
        'S2', count(*) filter (where level = 'S2'),
        'S3', count(*) filter (where level = 'S3'),
        'S4', count(*) filter (where level = 'S4')
      ) from interviews
    ),
    'top_roles', (
      select json_agg(r)
      from (
        select job_role as role, count(*) as cnt
        from interviews
        group by job_role
        order by cnt desc
        limit 5
      ) r
    ),
    'daily_7d', (
      select json_agg(d)
      from (
        select
          to_char(date_trunc('day', created_at), 'MM/DD') as day,
          count(*) as cnt
        from interviews
        where created_at >= now() - interval '7 days'
        group by date_trunc('day', created_at)
        order by date_trunc('day', created_at)
      ) d
    )
  );
$$;

revoke execute on function get_admin_stats from anon;
grant  execute on function get_admin_stats to authenticated;


-- ────────────────────────────────────────────────────────────
-- 3. get_benchmark() — 同岗位 Benchmark 对比
-- ────────────────────────────────────────────────────────────
create or replace function get_benchmark(p_job_role text)
returns json
language sql
security definer
as $$
  select json_build_object(
    'count',         count(*),
    'avg_score',     round(avg(score)::numeric, 1),
    'percentile_75', percentile_cont(0.75) within group (order by score)
  )
  from interviews
  where job_role = p_job_role;
$$;


-- ────────────────────────────────────────────────────────────
-- 4. search_interviews() — 面接记录搜索 + 过滤
-- ────────────────────────────────────────────────────────────
create or replace function search_interviews(
  p_keyword text  default null,
  p_level   text  default null,
  p_from    date  default null,
  p_to      date  default null,
  p_limit   int   default 20,
  p_offset  int   default 0
)
returns json
language sql
security definer
as $$
  select json_build_object(
    'total', (
      select count(*) from interviews
      where (p_keyword is null or job_role ilike '%' || p_keyword || '%')
        and (p_level   is null or level = p_level)
        and (p_from    is null or created_at::date >= p_from)
        and (p_to      is null or created_at::date <= p_to)
    ),
    'rows', (
      select json_agg(r) from (
        select id, job_role, score, level, feedback, created_at
        from interviews
        where (p_keyword is null or job_role ilike '%' || p_keyword || '%')
          and (p_level   is null or level = p_level)
          and (p_from    is null or created_at::date >= p_from)
          and (p_to      is null or created_at::date <= p_to)
        order by created_at desc
        limit p_limit offset p_offset
      ) r
    )
  );
$$;

revoke execute on function search_interviews from anon;
grant  execute on function search_interviews to authenticated;


-- ────────────────────────────────────────────────────────────
-- 5. admin_set_plan() — 手动调整用户套餐
-- ────────────────────────────────────────────────────────────
create or replace function admin_set_plan(
  p_user_id uuid,
  p_plan    text,
  p_limit   int
)
returns void
language sql
security definer
as $$
  update subscriptions
  set plan             = p_plan,
      interviews_limit = p_limit,
      updated_at       = now()
  where user_id = p_user_id;
$$;

revoke execute on function admin_set_plan from anon;
grant  execute on function admin_set_plan to authenticated;


-- ────────────────────────────────────────────────────────────
-- 6. add_pack_quota() — Pack 累加 +5（可多次购买）
-- ────────────────────────────────────────────────────────────
create or replace function add_pack_quota(p_user_id uuid)
returns void
language sql
security definer
as $$
  update subscriptions
  set
    plan             = 'pack',
    interviews_limit = interviews_limit + 5,
    updated_at       = now()
  where user_id = p_user_id;
$$;

-- subscriptions 新增 current_period_end 字段（Pro 到期时间）
alter table subscriptions
  add column if not exists current_period_end timestamptz;

grant execute on function add_pack_quota to authenticated;


-- ────────────────────────────────────────────────────────────
-- 7. refund_pack_quota() — Pack 退款扣减（每次 -5，不低于已用次数）
-- ────────────────────────────────────────────────────────────
create or replace function refund_pack_quota(p_user_id uuid)
returns void
language sql
security definer
as $$
  update subscriptions
  set
    interviews_limit = greatest(interviews_used, interviews_limit - 5),
    plan             = case
                         when greatest(interviews_used, interviews_limit - 5) <= 1
                         then 'free'
                         else plan
                       end,
    updated_at       = now()
  where user_id = p_user_id;
$$;

grant execute on function refund_pack_quota to authenticated;


-- ────────────────────────────────────────────────────────────
-- 8. admins 表 — 多管理员支持
-- ────────────────────────────────────────────────────────────
create table if not exists admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz default now()
);

-- 只有 service_role 可以读写；authenticated 用户可以读（供 isAdmin() 使用）
alter table admins enable row level security;

drop policy if exists "Admins readable by authenticated" on admins;
create policy "Admins readable by authenticated"
  on admins for select
  to authenticated
  using (true);

-- 插入初始管理员（将 YOUR_ADMIN_USER_ID 替换为实际 UUID）
-- insert into admins (user_id, email)
-- values ('YOUR_ADMIN_USER_ID', 'admin@example.com')
-- on conflict (user_id) do nothing;
