-- UTP+ Service · 0005 · Contenido de los cursos y estado del alumno
-- Ejecutar después de 0004. Se puede repetir sin problema.
-- Catálogo (igual para todos): detalles, materiales, evaluaciones, tareas, foros y anuncios.
-- Por alumno: materiales vistos, entregas, notas y anuncios leídos.

-- ───────────────────────── Catálogo ─────────────────────────

create table if not exists public.course_details (
  course_id       text primary key references public.courses(id) on delete cascade,
  codigo          text not null,
  horas           int  not null,
  sumilla         text not null,
  logro           text not null,
  metodologia     text not null,
  proyecto        text not null,
  -- 16 temas: semanas 1-8 y 10-17 (la 9 es el parcial y la 18 el final).
  temas           text[] not null,
  bib_base        text[] not null default '{}',
  bib_comp        text[] not null default '{}',
  -- [{ "dow": 2, "inicio": "10:30", "fin": "12:00", "tipo": "Clase virtual" }], dow 0 = domingo
  zoom_sesiones   jsonb  not null default '[]',
  zoom_meeting_id text not null,
  zoom_passcode   text not null,
  zoom_url        text not null
);

create table if not exists public.course_materials (
  id        text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  semana    int  not null,
  orden     int  not null default 0,
  tipo      text not null check (tipo in ('Presentación', 'Lectura', 'Video')),
  titulo    text not null,
  detalle   text not null
);
create index if not exists course_materials_curso_idx on public.course_materials (course_id, semana);

create table if not exists public.course_evaluations (
  id        text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  clave     text not null,
  orden     int  not null default 0,
  nombre    text not null,
  semana    int  not null,
  peso      int  not null check (peso between 0 and 100)
);
create index if not exists course_evaluations_curso_idx on public.course_evaluations (course_id);

create table if not exists public.course_tasks (
  id        text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  titulo    text not null,
  semana    int  not null
);
create index if not exists course_tasks_curso_idx on public.course_tasks (course_id);

create table if not exists public.course_threads (
  id          text primary key,
  course_id   text not null references public.courses(id) on delete cascade,
  semana      int,
  titulo      text not null,
  tipo        text not null check (tipo in ('calificado', 'no_calificado')),
  descripcion text not null
);
create index if not exists course_threads_curso_idx on public.course_threads (course_id);

create table if not exists public.forum_posts (
  id          text primary key default ('p-' || gen_random_uuid()::text),
  thread_id   text not null references public.course_threads(id) on delete cascade,
  -- Nulo en las publicaciones de ejemplo (docente y compañeros).
  user_id     uuid references public.profiles(id) on delete set null,
  autor       text not null,
  rol         text not null check (rol in ('Docente', 'Estudiante')),
  texto       text not null check (char_length(texto) between 1 and 1000),
  cuando_demo text,
  parent_id   text references public.forum_posts(id) on delete cascade,
  orden       int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists forum_posts_thread_idx on public.forum_posts (thread_id, orden, created_at);

create table if not exists public.announcements (
  id        text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  titulo    text not null,
  texto     text not null,
  -- La fecha es relativa para que la demo siempre esté vigente:
  -- "hace_dias" días antes de hoy, o el día "dia" de la semana "semana" del curso.
  hace_dias int,
  semana    int,
  dia       int,
  nuevo     boolean not null default false,
  orden     int not null default 0
);
create index if not exists announcements_curso_idx on public.announcements (course_id);

-- ───────────────────────── Estado del alumno ─────────────────────────

create table if not exists public.material_progress (
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  course_id   text not null references public.courses(id) on delete cascade,
  material_id text not null references public.course_materials(id) on delete cascade,
  primary key (user_id, material_id)
);

create table if not exists public.task_submissions (
  user_id      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  course_id    text not null references public.courses(id) on delete cascade,
  task_id      text not null references public.course_tasks(id) on delete cascade,
  archivo      text not null check (char_length(archivo) between 1 and 200),
  entregada_en timestamptz not null default now(),
  -- La nota la pone el docente: el alumno no puede escribirla.
  nota         int check (nota between 0 and 20),
  primary key (user_id, task_id)
);

create table if not exists public.evaluation_grades (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  course_id     text not null references public.courses(id) on delete cascade,
  evaluation_id text not null references public.course_evaluations(id) on delete cascade,
  nota          int not null check (nota between 0 and 20),
  primary key (user_id, evaluation_id)
);

create table if not exists public.announcement_reads (
  user_id         uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  course_id       text not null references public.courses(id) on delete cascade,
  announcement_id text not null references public.announcements(id) on delete cascade,
  primary key (user_id, announcement_id)
);

-- ───────────────────────── RLS ─────────────────────────

alter table public.course_details     enable row level security;
alter table public.course_materials   enable row level security;
alter table public.course_evaluations enable row level security;
alter table public.course_tasks       enable row level security;
alter table public.course_threads     enable row level security;
alter table public.forum_posts        enable row level security;
alter table public.announcements      enable row level security;
alter table public.material_progress  enable row level security;
alter table public.task_submissions   enable row level security;
alter table public.evaluation_grades  enable row level security;
alter table public.announcement_reads enable row level security;

-- Catálogo: lectura para alumnos autenticados.
drop policy if exists "detalles_leer" on public.course_details;
create policy "detalles_leer" on public.course_details for select to authenticated using (true);
drop policy if exists "materiales_leer" on public.course_materials;
create policy "materiales_leer" on public.course_materials for select to authenticated using (true);
drop policy if exists "evaluaciones_leer" on public.course_evaluations;
create policy "evaluaciones_leer" on public.course_evaluations for select to authenticated using (true);
drop policy if exists "tareas_leer" on public.course_tasks;
create policy "tareas_leer" on public.course_tasks for select to authenticated using (true);
drop policy if exists "foros_leer" on public.course_threads;
create policy "foros_leer" on public.course_threads for select to authenticated using (true);
drop policy if exists "publicaciones_leer" on public.forum_posts;
create policy "publicaciones_leer" on public.forum_posts for select to authenticated using (true);
drop policy if exists "anuncios_leer" on public.announcements;
create policy "anuncios_leer" on public.announcements for select to authenticated using (true);

-- Estado propio.
drop policy if exists "progreso_leer" on public.material_progress;
create policy "progreso_leer" on public.material_progress for select to authenticated using (user_id = auth.uid());
drop policy if exists "progreso_marcar" on public.material_progress;
create policy "progreso_marcar" on public.material_progress for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "progreso_desmarcar" on public.material_progress;
create policy "progreso_desmarcar" on public.material_progress for delete to authenticated using (user_id = auth.uid());

drop policy if exists "entregas_leer" on public.task_submissions;
create policy "entregas_leer" on public.task_submissions for select to authenticated using (user_id = auth.uid());
drop policy if exists "entregas_crear" on public.task_submissions;
create policy "entregas_crear" on public.task_submissions for insert to authenticated
  with check (user_id = auth.uid() and nota is null);

drop policy if exists "notas_leer" on public.evaluation_grades;
create policy "notas_leer" on public.evaluation_grades for select to authenticated using (user_id = auth.uid());

drop policy if exists "lecturas_leer" on public.announcement_reads;
create policy "lecturas_leer" on public.announcement_reads for select to authenticated using (user_id = auth.uid());
drop policy if exists "lecturas_crear" on public.announcement_reads;
create policy "lecturas_crear" on public.announcement_reads for insert to authenticated with check (user_id = auth.uid());

-- ───────────────────────── Publicar en un foro ─────────────────────────
-- El autor sale del directorio de alumnos, no del cliente: nadie puede firmar como otra persona.
create or replace function public.publicar_comentario(p_thread text, p_texto text, p_parent text default null)
returns public.forum_posts
language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_codigo text;
  v_autor  text;
  v_post   public.forum_posts%rowtype;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.' using errcode = 'P0001'; end if;
  p_texto := btrim(coalesce(p_texto, ''));
  if char_length(p_texto) < 2 or char_length(p_texto) > 1000 then
    raise exception 'El comentario debe tener entre 2 y 1000 caracteres.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.course_threads where id = p_thread) then
    raise exception 'No encontramos ese foro.' using errcode = 'P0001';
  end if;
  if p_parent is not null and not exists (select 1 from public.forum_posts where id = p_parent and thread_id = p_thread) then
    raise exception 'No encontramos el comentario al que respondes.' using errcode = 'P0001';
  end if;

  select codigo into v_codigo from public.profiles where id = v_uid;
  select coalesce(s.nombre, p.nombre) into v_autor
  from public.profiles p left join public.students s on s.codigo = p.codigo
  where p.id = v_uid;

  insert into public.forum_posts (thread_id, user_id, autor, rol, texto, parent_id, orden)
  values (p_thread, v_uid, v_autor, 'Estudiante', p_texto, p_parent, 1000)
  returning * into v_post;
  return v_post;
end $$;

revoke execute on function public.publicar_comentario(text, text, text) from public, anon;
grant  execute on function public.publicar_comentario(text, text, text) to authenticated;

revoke all on public.course_details, public.course_materials, public.course_evaluations, public.course_tasks,
  public.course_threads, public.forum_posts, public.announcements, public.material_progress,
  public.task_submissions, public.evaluation_grades, public.announcement_reads from anon;
