// Qué hijo/a está "jugando" en esta sesión de navegador.
// Plain localStorage facade (sin nanostores), mismo criterio que storage-simple.ts
// para evitar problemas de hidratación SSR en Astro.

const isBrowser = typeof window !== 'undefined';
const KEY = 'kidia-active-child';

export const activeChild = {
    get(): string | null {
        if (!isBrowser) return null;
        return localStorage.getItem(KEY);
    },

    set(childId: string) {
        if (!isBrowser) return;
        localStorage.setItem(KEY, childId);
        window.dispatchEvent(new CustomEvent('active-child:changed', { detail: childId }));
    },

    clear() {
        if (!isBrowser) return;
        localStorage.removeItem(KEY);
    }
};
