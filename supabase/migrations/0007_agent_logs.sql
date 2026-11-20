-- UTP+ Service · 0007 · Registro de conversaciones del asistente
-- Ejecutar después de 0006. Se puede repetir sin problema.
-- Sirve de evidencia para las pruebas de usabilidad y para limitar el uso por alumno.

create table if not exists public.agent_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  canal         text not null default 'texto' check (canal in ('texto', 'voz')),
  mensaje       text not null,
  respuesta     text,
  herramientas  jsonb not null default '[]',
  propuesta     text,
  latencia_ms   int,
  error         text,
  created_at    timestamptz not null default now()
);
create index if not exists agent_logs_user_idx on public.agent_logs (user_id, created_at desc);

alter table public.agent_logs enable row level security;

drop policy if exists "agent_logs_leer" on public.agent_logs;
create policy "agent_logs_leer" on public.agent_logs for select to authenticated using (user_id = auth.uid());
drop policy if exists "agent_logs_crear" on public.agent_logs;
create policy "agent_logs_crear" on public.agent_logs for insert to authenticated with check (user_id = auth.uid());

revoke all on public.agent_logs from anon;
