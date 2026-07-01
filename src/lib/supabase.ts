import { createClient } from '@supabase/supabase-js';

// Sitio estático: un único cliente de navegador que gestiona la sesión con
// localStorage. No hay cliente de servidor (ver src/pages/auth/callback.astro
// para por qué la confirmación de email / OAuth también se resuelve aquí).
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
