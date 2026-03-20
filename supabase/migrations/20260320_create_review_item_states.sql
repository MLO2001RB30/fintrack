create table if not exists public.review_item_states (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  item_id text not null,
  status text not null check (status in ('open', 'snoozed', 'resolved')),
  snoozed_until date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, item_id)
);

create index if not exists review_item_states_workspace_id_idx
  on public.review_item_states (workspace_id);

create index if not exists review_item_states_status_idx
  on public.review_item_states (status);

create or replace function public.set_review_item_states_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists review_item_states_set_updated_at on public.review_item_states;

create trigger review_item_states_set_updated_at
before update on public.review_item_states
for each row
execute function public.set_review_item_states_updated_at();
