import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !key) {
  // Falla temprano y con un mensaje claro en vez de errores de red confusos.
  throw new Error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env (reinicia npm run dev).')
}

/** Cliente único de Supabase. Solo usa la llave pública: la seguridad la dan las políticas RLS. */
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})
