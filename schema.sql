-- Create a table for user settings
create table public.user_settings (
  user_id uuid not null primary key,
  background_settings jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.user_settings enable row level security;

-- Create policies
-- Allow anyone to select their own settings (based on user_id match if using auth, but here we use a simple ID)
-- Since we are using a client-side generated UUID for demo purposes without real auth,
-- we'll allow public access for now, but in a real app you'd use auth.uid()

create policy "Allow public access for demo"
  on public.user_settings
  for all
  using (true)
  with check (true);
