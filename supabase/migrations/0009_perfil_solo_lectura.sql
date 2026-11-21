-- UTP+ Service · 0009 · El perfil es de solo lectura
-- Ejecutar después de 0008. Se puede repetir sin problema.
-- Es una app institucional: nombre, DNI y demás datos vienen de la universidad y el alumno no puede cambiarlos.
-- (Antes se permitía editar nombre y DNI; ahora el servidor también lo impide, no solo la pantalla.)

drop policy if exists "profiles_editar" on public.profiles;
revoke update on public.profiles from authenticated, anon;
