// Widget para investiga.tipo === 'construir_juego' (4.1): elige tema y
// exactamente 3 adivinanzas de un banco cerrado.

import type { ConstruirJuegoInvestiga, Adivinanza } from '../../schemas/unidad';
import { el, fireVaelAction } from './shared';

export interface JuegoResultado {
    tema: string;
    adivinanzasElegidas: string[];
}

const MAX_ADIVINANZAS = 3;

export function mountConstruirJuego(
    container: HTMLElement,
    data: ConstruirJuegoInvestiga,
    onComplete: (resultado: JuegoResultado) => void
): void {
    let tema: string | null = null;
    const elegidas: Adivinanza[] = [];

    renderTema();

    function renderTema() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', '¿De qué será tu juego?'));
        const row = el('div', 'ua-chip-row');
        data.temas.forEach(t => {
            const btn = el('button', 'ua-chip', t.label);
            btn.type = 'button';
            btn.addEventListener('click', () => { tema = t.label; renderAdivinanzas(); });
            row.appendChild(btn);
        });
        container.appendChild(row);
    }

    function renderAdivinanzas() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', `Elige 3 adivinanzas (llevas ${elegidas.length}/${MAX_ADIVINANZAS}).`));

        const grid = el('div', 'ua-bank-grid');
        data.bancoAdivinanzas.forEach(a => {
            const yaElegida = elegidas.some(e => e.id === a.id);
            const btn = el('button', `ua-bank-card${yaElegida ? ' selected' : ''}`, a.pregunta);
            btn.type = 'button';
            btn.disabled = !yaElegida && elegidas.length >= MAX_ADIVINANZAS;
            btn.addEventListener('click', () => {
                if (yaElegida) {
                    const idx = elegidas.findIndex(e => e.id === a.id);
                    elegidas.splice(idx, 1);
                } else if (elegidas.length < MAX_ADIVINANZAS) {
                    elegidas.push(a);
                    fireVaelAction('happy');
                }
                renderAdivinanzas();
            });
            grid.appendChild(btn);
        });
        container.appendChild(grid);

        if (elegidas.length === MAX_ADIVINANZAS) {
            const confirmarBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'Ordenar y confirmar mi juego →');
            confirmarBtn.type = 'button';
            confirmarBtn.addEventListener('click', () => {
                fireVaelAction('celebrate');
                onComplete({ tema: tema!, adivinanzasElegidas: elegidas.map(e => e.pregunta) });
            });
            container.appendChild(confirmarBtn);
        }
    }
}
