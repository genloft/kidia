import { createServerClient, createBrowserClient } from '@supabase/ssr';
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

export const supabase = createBrowserClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
