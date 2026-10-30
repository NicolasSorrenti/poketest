-- Shared, public game presentation data with writes restricted to the existing cloud-save owner.
create table if not exists public.overworld_layout_editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.overworld_layout_editors enable row level security;
revoke all on public.overworld_layout_editors from anon, authenticated;
grant select on public.overworld_layout_editors to authenticated;
drop policy if exists "read own overworld editor grant" on public.overworld_layout_editors;
create policy "read own overworld editor grant"
  on public.overworld_layout_editors for select to authenticated
  using ((select auth.uid()) = user_id);

insert into public.overworld_layout_editors (user_id)
select user_id from public.rpg_saves
order by updated_at desc
limit 1
on conflict (user_id) do nothing;

create table if not exists public.overworld_placements (
  id text primary key default 'global' check (id = 'global'),
  placements jsonb not null default '{"schemaVersion":1,"maps":{}}'::jsonb,
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint overworld_placements_valid_payload check (
    jsonb_typeof(placements) = 'object'
    and placements ? 'maps'
    and jsonb_typeof(placements->'maps') = 'object'
    and octet_length(placements::text) <= 1048576
  )
);
alter table public.overworld_placements enable row level security;
revoke all on public.overworld_placements from anon, authenticated;
grant select on public.overworld_placements to anon, authenticated;
grant update (placements, revision, updated_at, updated_by) on public.overworld_placements to authenticated;
insert into public.overworld_placements (id) values ('global') on conflict (id) do nothing;
drop policy if exists "read public overworld placements" on public.overworld_placements;
create policy "read public overworld placements"
  on public.overworld_placements for select to anon, authenticated using (id = 'global');
drop policy if exists "edit overworld placements by granted editor" on public.overworld_placements;
create policy "edit overworld placements by granted editor"
  on public.overworld_placements for update to authenticated
  using (
    id = 'global'
    and exists (select 1 from public.overworld_layout_editors e where e.user_id = (select auth.uid()))
  )
  with check (
    id = 'global'
    and updated_by = (select auth.uid())
    and exists (select 1 from public.overworld_layout_editors e where e.user_id = (select auth.uid()))
  );
