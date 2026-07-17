// Toast del sistema de diseño (doc 03 §3). Es una función y no un
// componente Astro porque quien lo lanza es siempre JS (motores, servicios,
// handlers). Estilos en src/styles/components.css (.k-toast*).

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
    variant?: ToastVariant;
    /** ms visibles; por defecto 3500 */
    duration?: number;
}

function getContainer(): HTMLElement {
    let container = document.querySelector<HTMLElement>('.k-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'k-toast-container';
        // Región viva: los lectores de pantalla anuncian el mensaje sin robar foco.
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }
    return container;
}

export function showToast(message: string, opts: ToastOptions = {}) {
    if (typeof document === 'undefined') return;

    const { variant = 'default', duration = 3500 } = opts;

    const toast = document.createElement('div');
    toast.className = `k-toast${variant !== 'default' ? ` k-toast--${variant}` : ''}`;
    toast.textContent = message;

    getContainer().appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 250ms ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
