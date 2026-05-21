import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

export const createSupabaseClient = (cookies: AstroCookies) => {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key) {
          return cookies.get(key)?.value;
        },
        set(key, value, options) {
          try {
            cookies.set(key, value, { ...options, path: options.path || '/' });
          } catch (error) {
            // Ignorar si estamos en un contexto de solo lectura
          }
        },
        remove(key, options) {
          try {
            cookies.delete(key, { ...options, path: options.path || '/' });
          } catch (error) {
            // Ignorar
          }
        },
      },
    }
  );
};

// Para sitios estáticos y el navegador, usamos el cliente estándar que gestiona la sesión con localStorage
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
