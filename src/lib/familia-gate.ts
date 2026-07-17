import { supabase } from './supabase';

/**
 * Gate del Modo Familia (doc 02 §1): el padre define un PIN de 4 dígitos
 * y las páginas de adulto (parents, perfil) lo piden antes de mostrarse,
 * para que el hijo/a no entre por error desde el Modo Aventura.
 *
 * Alcance honesto: el hijo usa la sesión del padre en el mismo navegador,
 * así que esto es una barrera de despiste, no seguridad fuerte. Por eso:
 * - se guarda hash SHA-256 (salt = user id) en user_profiles.parent_pin_hash,
 *   nunca el PIN en claro (migración supabase/migrations/004_parent_pin.sql);
 * - el desbloqueo vive en sessionStorage con caducidad corta, para que si
 *   el padre devuelve la tablet sin cerrar la pestaña, el gate reaparezca.
 *
 * Si la columna aún no existe en Supabase (migración sin pegar), todo
 * degrada a "sin PIN": el gate no bloquea y la sección de PIN lo avisa.
 */

const UNLOCK_KEY = 'kidia-familia-unlocked-until';
const UNLOCK_TTL_MS = 15 * 60 * 1000; // 15 min

const isBrowser = typeof window !== 'undefined';

async function sha256Hex(text: string): Promise<string> {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function hashPin(pin: string, userId: string): Promise<string> {
    return sha256Hex(`kidia-pin:${userId}:${pin}`);
}

async function currentUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

export const FamiliaGate = {
    /** Hash del PIN guardado, o null si no hay PIN (o la columna no existe aún). */
    async getPinHash(): Promise<string | null> {
        const userId = await currentUserId();
        if (!userId) return null;

        const { data, error } = await supabase
            .from('user_profiles')
            .select('parent_pin_hash')
            .eq('id', userId)
            .single();

        if (error) {
            // Columna inexistente (42703) u otro fallo: degradar a "sin PIN".
            console.warn('[FamiliaGate] No se pudo leer el PIN:', error.message);
            return null;
        }
        return data?.parent_pin_hash ?? null;
    },

    async hasPin(): Promise<boolean> {
        return (await this.getPinHash()) !== null;
    },

    /** Guarda (o cambia) el PIN. Valida formato: exactamente 4 dígitos. */
    async setPin(pin: string): Promise<{ error?: string }> {
        if (!/^\d{4}$/.test(pin)) {
            return { error: 'El PIN debe tener exactamente 4 números.' };
        }
        const userId = await currentUserId();
        if (!userId) return { error: 'No hay sesión activa.' };

        const parent_pin_hash = await hashPin(pin, userId);
        const { error } = await supabase
            .from('user_profiles')
            .update({ parent_pin_hash })
            .eq('id', userId);

        if (error) {
            console.error('[FamiliaGate] Error guardando PIN:', error);
            if (error.message.includes('parent_pin_hash')) {
                return { error: 'Falta aplicar la migración 004_parent_pin.sql en Supabase.' };
            }
            return { error: 'No se pudo guardar el PIN. Inténtalo de nuevo.' };
        }
        this.markUnlocked();
        return {};
    },

    async removePin(): Promise<{ error?: string }> {
        const userId = await currentUserId();
        if (!userId) return { error: 'No hay sesión activa.' };

        const { error } = await supabase
            .from('user_profiles')
            .update({ parent_pin_hash: null })
            .eq('id', userId);

        if (error) {
            console.error('[FamiliaGate] Error quitando PIN:', error);
            return { error: 'No se pudo quitar el PIN. Inténtalo de nuevo.' };
        }
        return {};
    },

    /** Comprueba el PIN; si es correcto, desbloquea la sesión (con TTL). */
    async unlockWithPin(pin: string): Promise<boolean> {
        const userId = await currentUserId();
        if (!userId) return false;

        const stored = await this.getPinHash();
        if (!stored) return true; // sin PIN no hay gate

        const attempt = await hashPin(pin, userId);
        if (attempt !== stored) return false;

        this.markUnlocked();
        return true;
    },

    markUnlocked() {
        if (!isBrowser) return;
        sessionStorage.setItem(UNLOCK_KEY, String(Date.now() + UNLOCK_TTL_MS));
    },

    isUnlocked(): boolean {
        if (!isBrowser) return false;
        const until = Number(sessionStorage.getItem(UNLOCK_KEY) || 0);
        return Date.now() < until;
    },

    lock() {
        if (!isBrowser) return;
        sessionStorage.removeItem(UNLOCK_KEY);
    },

    /**
     * Guardia para páginas del Modo Familia. Si hay PIN y la sesión no está
     * desbloqueada, muestra el modal del gate ANTES de dejar ver la página.
     * Devuelve true si se puede continuar; si el adulto/niño cancela,
     * redirige al Mapa y devuelve false. No comprueba login: las páginas
     * ya usan requireSession/requireActiveChild para eso.
     */
    async requireFamiliaAccess(): Promise<boolean> {
        if (this.isUnlocked()) return true;

        const stored = await this.getPinHash();
        if (!stored) return true; // sin PIN configurado no hay gate

        const ok = await showGateModal();
        if (!ok) {
            window.location.href = '/mapa';
            return false;
        }
        return true;
    }
};

/**
 * Modal del gate sobre <dialog> nativo (foco y Escape gratis), con las
 * clases k-modal/k-btn del sistema de diseño. Se monta bajo demanda porque
 * quien lo lanza es siempre JS (guardia de página o botón del header).
 * Resuelve true si el PIN es correcto, false si se cancela/cierra.
 */
export function showGateModal(): Promise<boolean> {
    return new Promise(resolve => {
        const dialog = document.createElement('dialog');
        dialog.className = 'k-modal';
        dialog.innerHTML = `
            <div class="k-modal__content familia-gate">
                <h2 class="familia-gate__title">Zona para madres y padres 🔒</h2>
                <p class="familia-gate__text">Si eres el niño o la niña, pide ayuda a tu familia. ¡Tu aventura sigue en el Mapa! 🚀</p>
                <form method="dialog" class="familia-gate__form">
                    <label class="familia-gate__label" for="familia-gate-pin">PIN familiar</label>
                    <input
                        id="familia-gate-pin"
                        class="familia-gate__input"
                        type="password"
                        inputmode="numeric"
                        autocomplete="off"
                        pattern="[0-9]{4}"
                        maxlength="4"
                        placeholder="••••"
                        aria-describedby="familia-gate-error"
                    />
                    <p id="familia-gate-error" class="familia-gate__error" role="alert" hidden>PIN incorrecto. Prueba otra vez.</p>
                    <div class="familia-gate__actions">
                        <button type="button" class="k-btn k-btn--ghost k-btn--md" data-action="cancel">Volver al Mapa</button>
                        <button type="submit" class="k-btn k-btn--primary k-btn--md" data-action="enter">Entrar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(dialog);

        const input = dialog.querySelector('#familia-gate-pin') as HTMLInputElement;
        const errorEl = dialog.querySelector('#familia-gate-error') as HTMLElement;
        const form = dialog.querySelector('form') as HTMLFormElement;
        const enterBtn = dialog.querySelector('[data-action="enter"]') as HTMLButtonElement;

        let settled = false;
        function finish(ok: boolean) {
            if (settled) return;
            settled = true;
            dialog.close();
            dialog.remove();
            resolve(ok);
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            enterBtn.disabled = true;
            const ok = await FamiliaGate.unlockWithPin(input.value);
            enterBtn.disabled = false;
            if (ok) {
                finish(true);
            } else {
                errorEl.hidden = false;
                input.value = '';
                input.focus();
            }
        });

        dialog.querySelector('[data-action="cancel"]')?.addEventListener('click', () => finish(false));
        // Escape (evento cancel de <dialog>) y cierres externos cuentan como cancelar.
        dialog.addEventListener('close', () => finish(false));

        dialog.showModal();
        input.focus();
    });
}
