-- Run once in the Supabase SQL Editor. Never use a service_role key in the browser.
create table if not exists public.rpg_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 save_data jsonb not null check (jsonb_typeof(save_data) = 'object'),
 revision bigint not null default 1 check (revision >= 1),
 updated_at timestamptz not null default now()
);
alter table public.rpg_saves enable row level security;
revoke all on public.rpg_saves from anon;
grant select, insert, update on public.rpg_saves to authenticated;
drop policy if exists "read own rpg save" on public.rpg_saves;
create policy "read own rpg save" on public.rpg_saves for select to authenticated
 using ((select auth.uid()) = user_id);
drop policy if exists "create own rpg save" on public.rpg_saves;
create policy "create own rpg save" on public.rpg_saves for insert to authenticated
 with check ((select auth.uid()) = user_id);
drop policy if exists "update own rpg save" on public.rpg_saves;
create policy "update own rpg save" on public.rpg_saves for update to authenticated
 using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Atomic compare-and-swap stops stale device writes from replacing recent saves.
create or replace function public.rpg_save_cas(expected_revision bigint, new_save jsonb)
returns table (new_revision bigint, server_updated_at timestamptz)
language plpgsql security invoker set search_path = ''
as $$
begin
 if (select auth.uid()) is null then
  raise exception 'Authentication required' using errcode = '28000';
 end if;
 if new_save is null or jsonb_typeof(new_save) <> 'object'
    or octet_length(new_save::text) > 1048576 then
  raise exception 'Invalid RPG save or size exceeds 1 MB' using errcode = '22023';
 end if;
 if expected_revision = 0 then
  return query insert into public.rpg_saves (user_id, save_data, revision, updated_at)
   values ((select auth.uid()), new_save, 1, now())
   on conflict (user_id) do nothing
   returning rpg_saves.revision, rpg_saves.updated_at;
 elsif expected_revision > 0 then
  return query update public.rpg_saves
   set save_data = new_save, revision = public.rpg_saves.revision + 1, updated_at = now()
   where user_id = (select auth.uid()) and revision = expected_revision
   returning rpg_saves.revision, rpg_saves.updated_at;
 else
  raise exception 'Invalid save revision' using errcode = '22023';
 end if;
 if not found then raise exception 'CLOUD_SAVE_CONFLICT' using errcode = '40001'; end if;
end;
$$;
revoke execute on function public.rpg_save_cas(bigint, jsonb) from public, anon;
grant execute on function public.rpg_save_cas(bigint, jsonb) to authenticated;
