create table if not exists public.account_preferences (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  account_id text not null,
  nickname text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, account_id)
);

create index if not exists account_preferences_workspace_id_idx
  on public.account_preferences (workspace_id);

create or replace function public.set_account_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists account_preferences_set_updated_at on public.account_preferences;

create trigger account_preferences_set_updated_at
before update on public.account_preferences
for each row
execute function public.set_account_preferences_updated_at();
