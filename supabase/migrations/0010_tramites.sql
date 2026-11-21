-- UTP+ Service · 0010 · Trámites y solicitudes SAE
-- Ejecutar después de 0009. Se puede repetir sin problema.
-- Catálogo de trámites (con los campos que pide cada uno), solicitudes de cada alumno y su historial.
-- Las solicitudes se crean y cancelan con funciones que validan todo en el servidor.

-- ───────────────────────── Catálogo ─────────────────────────

create table if not exists public.procedure_types (
  id          text primary key,
  categoria   text not null check (categoria in ('autogestionable', 'sae')),
  titulo      text not null,
  descripcion text not null,
  icono       text not null default 'description',
  costo       numeric(8, 2) not null default 0 check (costo >= 0),
  plazo       text not null,
  modalidad   text not null,
  -- Campos del formulario: [{ "key", "label", "type": select|text|textarea|curso|check, "options": [...], "required": bool }]
  campos      jsonb not null default '[]',
  orden       int not null default 0
);

create sequence if not exists public.tramite_seq start 150;

-- ───────────────────────── Solicitudes ─────────────────────────

create table if not exists public.procedures (
  id             uuid primary key default gen_random_uuid(),
  codigo         text not null unique,
  user_id        uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tipo_id        text not null references public.procedure_types(id),
  estado         text not null default 'en_revision' check (estado in ('en_revision', 'aprobado', 'rechazado', 'cancelada')),
  detalle        jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index if not exists procedures_user_idx on public.procedures (user_id, created_at desc);

create table if not exists public.procedure_events (
  id           uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  estado       text not null,
  nota         text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists procedure_events_idx on public.procedure_events (procedure_id, created_at);

-- ───────────────────────── RLS ─────────────────────────

alter table public.procedure_types  enable row level security;
alter table public.procedures       enable row level security;
alter table public.procedure_events enable row level security;

drop policy if exists "tramites_tipos_leer" on public.procedure_types;
create policy "tramites_tipos_leer" on public.procedure_types for select to authenticated using (true);

drop policy if exists "tramites_leer" on public.procedures;
create policy "tramites_leer" on public.procedures for select to authenticated using (user_id = auth.uid());

drop policy if exists "tramites_eventos_leer" on public.procedure_events;
create policy "tramites_eventos_leer" on public.procedure_events for select to authenticated
  using (exists (select 1 from public.procedures p where p.id = procedure_id and p.user_id = auth.uid()));

revoke all on public.procedure_types, public.procedures, public.procedure_events from anon;
revoke insert, update, delete on public.procedures, public.procedure_events from authenticated;

-- ───────────────────────── Solicitar ─────────────────────────
-- Valida cada campo del trámite en el servidor y solo guarda los campos declarados.
create or replace function public.solicitar_tramite(p_tipo text, p_detalle jsonb)
returns public.procedures
language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  t        public.procedure_types%rowtype;
  f        jsonb;
  v_key    text;
  v_val    text;
  v_clean  jsonb := '{}';
  v_proc   public.procedures%rowtype;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.' using errcode = 'P0001'; end if;

  select * into t from public.procedure_types where id = p_tipo;
  if not found then raise exception 'Ese trámite no existe.' using errcode = 'P0001', hint = 'invalid'; end if;

  if exists (select 1 from public.procedures where user_id = v_uid and tipo_id = p_tipo and estado = 'en_revision') then
    raise exception 'Ya tienes una solicitud de este trámite en revisión.' using errcode = 'P0001', hint = 'duplicate';
  end if;

  for f in select * from jsonb_array_elements(t.campos) loop
    v_key := f ->> 'key';
    v_val := nullif(btrim(coalesce(p_detalle ->> v_key, '')), '');

    if v_val is null then
      if coalesce((f ->> 'required')::boolean, false) then
        raise exception 'Falta completar: %.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
      end if;
      continue;
    end if;

    case f ->> 'type'
      when 'select' then
        if not exists (select 1 from jsonb_array_elements_text(f -> 'options') o where o = v_val) then
          raise exception 'Valor no válido en: %.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
        end if;
      when 'curso' then
        if not exists (select 1 from public.enrollments e where e.user_id = v_uid and e.course_id = v_val) then
          raise exception 'Ese curso no está en tu matrícula.' using errcode = 'P0001', hint = 'invalid';
        end if;
      when 'check' then
        if v_val <> 'true' then
          raise exception 'Debes aceptar: %.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
        end if;
      when 'textarea' then
        if char_length(v_val) > 400 then
          raise exception 'El texto de % es demasiado largo.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
        end if;
      else
        if char_length(v_val) > 120 then
          raise exception 'El texto de % es demasiado largo.', f ->> 'label' using errcode = 'P0001', hint = 'invalid';
        end if;
    end case;

    v_clean := v_clean || jsonb_build_object(v_key, v_val);
  end loop;

  insert into public.procedures (codigo, user_id, tipo_id, detalle)
  values ('SOL-' || to_char(now() at time zone 'America/Lima', 'YYYY') || '-' || lpad(nextval('public.tramite_seq')::text, 4, '0'),
          v_uid, p_tipo, v_clean)
  returning * into v_proc;

  insert into public.procedure_events (procedure_id, estado, nota)
  values (v_proc.id, 'en_revision', 'Solicitud recibida. Está en revisión.');

  return v_proc;
end $$;

-- ───────────────────────── Cancelar ─────────────────────────
create or replace function public.cancelar_tramite(p_codigo text)
returns void
language plpgsql security definer set search_path = public as $$
declare v_proc public.procedures%rowtype;
begin
  select * into v_proc from public.procedures where codigo = p_codigo and user_id = auth.uid() for update;
  if not found then raise exception 'No encontramos esa solicitud.' using errcode = 'P0001', hint = 'invalid'; end if;
  if v_proc.estado <> 'en_revision' then
    raise exception 'Esta solicitud ya no se puede cancelar.' using errcode = 'P0001', hint = 'invalid';
  end if;
  update public.procedures set estado = 'cancelada', actualizado_en = now() where id = v_proc.id;
  insert into public.procedure_events (procedure_id, estado, nota)
  values (v_proc.id, 'cancelada', 'Cancelaste la solicitud.');
end $$;

-- ───────────────────────── Avisos en el centro de notificaciones ─────────────────────────
create or replace function public.trg_notif_tramite()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_titulo text;
begin
  select titulo into v_titulo from public.procedure_types where id = new.tipo_id;
  if tg_op = 'INSERT' then
    perform public.notificar(new.user_id, 'sistema', 'Solicitud enviada',
      coalesce(v_titulo, 'Trámite') || ' · ' || new.codigo, '/tramites/solicitud/' || new.codigo);
  elsif tg_op = 'UPDATE' and new.estado is distinct from old.estado and new.estado in ('aprobado', 'rechazado') then
    perform public.notificar(new.user_id, 'sistema',
      case new.estado when 'aprobado' then 'Solicitud aprobada' else 'Solicitud rechazada' end,
      coalesce(v_titulo, 'Trámite') || ' · ' || new.codigo, '/tramites/solicitud/' || new.codigo);
  end if;
  return new;
end $$;

drop trigger if exists trg_tramite_notif on public.procedures;
create trigger trg_tramite_notif
  after insert or update of estado on public.procedures
  for each row execute function public.trg_notif_tramite();

-- ───────────────────────── Permisos de ejecución ─────────────────────────
revoke execute on function public.solicitar_tramite(text, jsonb) from public, anon;
revoke execute on function public.cancelar_tramite(text)         from public, anon;
grant  execute on function public.solicitar_tramite(text, jsonb) to authenticated;
grant  execute on function public.cancelar_tramite(text)         to authenticated;
