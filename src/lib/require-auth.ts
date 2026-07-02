import { supabase } from './supabase';
import { activeChild } from './active-child';

/**
 * Guardia de acceso reutilizable para las páginas de producto (todo lo que
 * no sea marketing público: mapa, escenarios, constructor, insignias,
 * perfil, zona de padres). Sitio estático → la comprobación es en el
 * navegador, lo antes posible en cada página.
 *
 * Devuelve true si el acceso está permitido; si no, ya ha redirigido y el
 * código llamante debe parar (return).
 */
export async function requireSession(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

/**
 * Como requireSession, pero además exige que haya un hijo/a activo en la
 * sesión (si no, manda al padre a elegir/crear uno desde el dashboard).
 */
export async function requireActiveChild(): Promise<boolean> {
    const ok = await requireSession();
    if (!ok) return false;

    if (!activeChild.get()) {
        window.location.href = '/dashboard';
        return false;
    }
    return true;
}
