create table if not exists public.transaction_overrides (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  transaction_id text not null,
  category_override text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, transaction_id)
);

create index if not exists transaction_overrides_workspace_id_idx
  on public.transaction_overrides (workspace_id);

create index if not exists transaction_overrides_transaction_id_idx
  on public.transaction_overrides (transaction_id);

create or replace function public.set_transaction_overrides_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transaction_overrides_set_updated_at on public.transaction_overrides;

create trigger transaction_overrides_set_updated_at
before update on public.transaction_overrides
for each row
execute function public.set_transaction_overrides_updated_at();
