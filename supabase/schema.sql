-- users 表由 Supabase Auth 自动管理

create table if not exists interviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  job_role text not null,
  experience text,
  question text not null,
  answer text,
  score float,
  level text,
  feedback text,
  created_at timestamp with time zone default now()
);

alter table interviews enable row level security;

create policy "Users can view own interviews"
  on interviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own interviews"
  on interviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own interviews"
  on interviews for update
  using (auth.uid() = user_id);
