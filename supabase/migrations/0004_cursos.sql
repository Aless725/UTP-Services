-- UTP+ Service · 0004 · Cursos, matrícula, ciclo y avance académico
-- Ejecutar después de 0003. Se puede repetir sin problema.

alter table public.profiles add column if not exists plan_codigo text not null default '';

-- Ciclo académico
create table if not exists public.terms (
  id             text primary key,            -- '2026-2'
  nombre         text not null,               -- 'Ciclo 2026-2'
  estado         text not null,               -- 'En curso'
  semana_actual  int  not null,
  semanas_total  int  not null,
  inicio         date not null,
  fin            date not null
);

-- Catálogo de cursos
create table if not exists public.courses (
  id        text primary key,                 -- 'ihm'
  nombre    text not null,
  docente   text not null,
  creditos  int  not null,
  modalidad text not null check (modalidad in ('Presencial', 'Virtual'))
);

-- Qué alumno lleva qué curso en cada ciclo
create table if not exists public.enrollments (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  course_id  text not null references public.courses(id),
  term_id    text not null references public.terms(id),
  orden      int  not null default 0,
  primary key (user_id, course_id, term_id)
);

-- Avance de malla curricular por alumno (tres grupos de tres cifras)
create table if not exists public.progress_stats (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  grupo     text not null,
  orden     int  not null,
  etiqueta  text not null,
  valor     numeric not null,
  decimales int  not null default 0,
  primary key (user_id, grupo, orden)
);

alter table public.terms          enable row level security;
alter table public.courses        enable row level security;
alter table public.enrollments    enable row level security;
alter table public.progress_stats enable row level security;

drop policy if exists "terms_leer" on public.terms;
create policy "terms_leer" on public.terms for select to authenticated using (true);
drop policy if exists "courses_leer" on public.courses;
create policy "courses_leer" on public.courses for select to authenticated using (true);
drop policy if exists "enrollments_leer" on public.enrollments;
create policy "enrollments_leer" on public.enrollments for select to authenticated using (user_id = auth.uid());
drop policy if exists "progress_leer" on public.progress_stats;
create policy "progress_leer" on public.progress_stats for select to authenticated using (user_id = auth.uid());

revoke all on public.terms, public.courses, public.enrollments, public.progress_stats from anon;
