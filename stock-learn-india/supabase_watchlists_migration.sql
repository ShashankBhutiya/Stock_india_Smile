-- Create watchlists table
create table if not exists public.watchlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  stock_id uuid references public.stocks(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, stock_id)
);

-- Add RLS policies
alter table public.watchlists enable row level security;

create policy "Users can view their own watchlist"
  on public.watchlists for select
  using (auth.uid() = user_id);

create policy "Users can insert into their own watchlist"
  on public.watchlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete from their own watchlist"
  on public.watchlists for delete
  using (auth.uid() = user_id);
