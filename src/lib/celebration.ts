// Sistema de celebración unificado (doc 04 §5): un solo punto de entrada
// con 3 intensidades, en vez del confeti/shake ad-hoc que cada motor
// implementaba por su cuenta.
//
//  - micro:  acierto en una actividad — pop + 3 partículas sobre el
//            elemento, ~400ms. La usa showFeedback (unidad-widgets/shared).
//  - media:  misión completada, palabra nueva — ráfaga parcial desde el
//            centro + mensaje opcional, ~1.2s.
//  - grande: zona completa, insignia, subida de nivel — confeti a pantalla
//            completa + mensaje destacado, ~2.5s.
//
// prefers-reduced-motion: versión estática con el MISMO contenido (el
// mensaje se muestra igual, sin partículas ni animación). El kill-switch
// global de global.css ya acorta cualquier animación CSS a 0.01ms, pero
// aquí además no se generan las partículas — cientos de nodos DOM sin
// animación solo ensuciarían la pantalla.

export type CelebrationIntensity = 'micro' | 'media' | 'grande';

const COLORES = ['#22d3ee', '#8b5cf6', '#e879f9', '#fbbf24', '#4ade80'];

function reducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function crearParticula(x: number, y: number, opts: { clase: string; duracionMs: number }): HTMLElement {
    const p = document.createElement('span');
    p.className = opts.clase;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = COLORES[Math.floor(Math.random() * COLORES.length)];
    // Dirección/rotación aleatorias vía variables CSS (la animación las lee)
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
    p.style.setProperty('--dy', `${-40 - Math.random() * 120}px`);
    p.style.setProperty('--rot', `${(Math.random() - 0.5) * 540}deg`);
    setTimeout(() => p.remove(), opts.duracionMs);
    return p;
}

function overlay(): HTMLElement {
    let node = document.querySelector<HTMLElement>('.k-celebrate-overlay');
    if (!node) {
        node = document.createElement('div');
        node.className = 'k-celebrate-overlay';
        node.setAttribute('aria-hidden', 'true'); // decorativo: el contenido real (chispas, insignia) ya está en la página
        document.body.appendChild(node);
    }
    return node;
}

function mostrarMensaje(texto: string, grande: boolean, duracionMs: number) {
    const chip = document.createElement('div');
    chip.className = `k-celebrate-mensaje${grande ? ' k-celebrate-mensaje--grande' : ''}`;
    chip.setAttribute('role', 'status'); // los lectores de pantalla sí lo anuncian
    chip.textContent = texto;
    overlay().appendChild(chip);
    setTimeout(() => chip.remove(), duracionMs);
}

export function celebrate(intensity: CelebrationIntensity, opts?: { target?: HTMLElement; mensaje?: string }) {
    if (typeof document === 'undefined') return;

    const estatico = reducedMotion();

    if (intensity === 'micro') {
        const target = opts?.target;
        if (!target || estatico) return; // el feedback visible (clase de acierto) ya lo pone showFeedback
        const rect = target.getBoundingClientRect();
        const ov = overlay();
        for (let i = 0; i < 3; i++) {
            ov.appendChild(crearParticula(
                rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.5,
                rect.top + rect.height / 2,
                { clase: 'k-celebrate-particula', duracionMs: 500 }
            ));
        }
        return;
    }

    if (intensity === 'media') {
        if (opts?.mensaje) mostrarMensaje(opts.mensaje, false, 2200);
        if (estatico) return;
        const ov = overlay();
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight * 0.55;
        for (let i = 0; i < 14; i++) {
            ov.appendChild(crearParticula(cx + (Math.random() - 0.5) * 200, cy, { clase: 'k-celebrate-particula', duracionMs: 1300 }));
        }
        return;
    }

    // grande
    if (opts?.mensaje) mostrarMensaje(opts.mensaje, true, 3200);
    if (estatico) return;
    const ov = overlay();
    for (let i = 0; i < 40; i++) {
        const pieza = document.createElement('span');
        pieza.className = 'k-celebrate-confeti';
        pieza.style.left = `${Math.random() * 100}vw`;
        pieza.style.background = COLORES[Math.floor(Math.random() * COLORES.length)];
        pieza.style.animationDelay = `${Math.random() * 0.7}s`;
        pieza.style.setProperty('--rot', `${(Math.random() - 0.5) * 720}deg`);
        setTimeout(() => pieza.remove(), 3000);
        ov.appendChild(pieza);
    }
}
