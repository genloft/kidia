import { createClient } from '@supabase/supabase-js';

// Sitio estático: un único cliente de navegador que gestiona la sesión con
// localStorage. No hay cliente de servidor (ver src/pages/auth/callback.astro
// para por qué la confirmación de email / OAuth también se resuelve aquí).
//
// Las rutas bajo src/pages/api/*.ts se prerenderizan en el build (no hay
// adapter de servidor), lo que ejecuta este módulo en el proceso de Node de
// Astro/Hostinger, donde PUBLIC_SUPABASE_URL/ANON_KEY no están definidas si
// no se han configurado como variables de entorno del build. Sin un valor de
// respaldo, createClient() lanza "supabaseUrl is required" y tumba el build
// entero. Mismo patrón que ya usa src/lib/stripe.ts.
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY no están definidas. Supabase no funcionará hasta configurarlas.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
