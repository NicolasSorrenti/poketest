-- Durable, authoritative RPG duel snapshots (not a public game-state endpoint).
-- Access is limited to the currently authenticated player's own rows.
create table if not exists public.rpg_duel_checkpoints (
  user_id uuid not null references auth.users(id) on delete cascade,
  duel_id text not null check (duel_id ~ '^[A-Za-z0-9_-]{4,100}$'),
  revision bigint not null check (revision >= 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot)='object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, duel_id)
);
alter table public.rpg_duel_checkpoints enable row level security;
revoke all on public.rpg_duel_checkpoints from anon;
grant select, insert, update on public.rpg_duel_checkpoints to authenticated;
drop policy if exists "read own RPG duel" on public.rpg_duel_checkpoints;
create policy "read own RPG duel" on public.rpg_duel_checkpoints for select to authenticated
 using ((select auth.uid())=user_id);
drop policy if exists "create own RPG duel" on public.rpg_duel_checkpoints;
create policy "create own RPG duel" on public.rpg_duel_checkpoints for insert to authenticated
 with check ((select auth.uid())=user_id);
drop policy if exists "update own RPG duel" on public.rpg_duel_checkpoints;
create policy "update own RPG duel" on public.rpg_duel_checkpoints for update to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

-- Exact revision compare-and-swap prevents stale tabs/devices from replacing a
-- newer battle state. The browser never sends arbitrary snapshots to this RPC;
-- the RPG server persists its own authoritative headless-duel engine session.
create or replace function public.rpg_duel_checkpoint_cas(
  p_duel_id text, p_expected_revision bigint, p_revision bigint, p_snapshot jsonb
) returns table (saved_revision bigint)
language plpgsql security invoker set search_path=''
as $$
begin
 if (select auth.uid()) is null then
   raise exception 'Authentication required' using errcode='28000';
 end if;
 if p_duel_id is null or p_duel_id !~ '^[A-Za-z0-9_-]{4,100}$'
    or p_snapshot is null or jsonb_typeof(p_snapshot)<>'object'
    or octet_length(p_snapshot::text)>6291456
    or p_revision<0 or p_expected_revision is null or p_revision<=p_expected_revision then
   raise exception 'Invalid duel checkpoint' using errcode='22023';
 end if;
 if p_expected_revision=-1 then
   return query
     insert into public.rpg_duel_checkpoints(user_id,duel_id,revision,snapshot,updated_at)
     values ((select auth.uid()),p_duel_id,p_revision,p_snapshot,now())
     on conflict (user_id,duel_id) do nothing
     returning rpg_duel_checkpoints.revision;
 elsif p_expected_revision>=0 then
   return query
     update public.rpg_duel_checkpoints
     set revision=p_revision,snapshot=p_snapshot,updated_at=now()
     where user_id=(select auth.uid()) and duel_id=p_duel_id and revision=p_expected_revision
     returning rpg_duel_checkpoints.revision;
 else
   raise exception 'Invalid revision' using errcode='22023';
 end if;
 if not found then raise exception 'RPG_DUEL_CHECKPOINT_CONFLICT' using errcode='40001'; end if;
end;
$$;
revoke execute on function public.rpg_duel_checkpoint_cas(text,bigint,bigint,jsonb) from public,anon;
grant execute on function public.rpg_duel_checkpoint_cas(text,bigint,bigint,jsonb) to authenticated;
