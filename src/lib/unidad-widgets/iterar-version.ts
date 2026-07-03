// Widget para investiga.tipo === 'iterar_version' (3.4).

import type { IterarVersionInvestiga } from '../../schemas/unidad';
import { el, fireVaelAction } from './shared';

export interface IterarResultado {
    cambioElegido: string;
    quiereV3: boolean;
}

export function mountIterarVersion(
    container: HTMLElement,
    data: IterarVersionInvestiga,
    onComplete: (resultado: IterarResultado) => void
): void {
    render();

    function render() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', 'Elige una creación tuya de antes y piensa UNA cosa para mejorar.'));

        const grid = el('div', 'ua-bank-grid');
        data.cambiosPosibles.forEach(c => {
            const btn = el('button', 'ua-bank-card', c.label);
            btn.type = 'button';
            btn.addEventListener('click', () => renderComparacion(c));
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    }

    function renderComparacion(cambio: IterarVersionInvestiga['cambiosPosibles'][number]) {
        container.innerHTML = '';
        fireVaelAction('celebrate');
        const compareRow = el('div', 'ua-choice-row');

        const v1 = el('div', 'ua-imagen-compuesta');
        v1.style.setProperty('--ua-tint', '#64748b');
        v1.appendChild(el('span', 'ua-imagen-animal', '🖼️'));
        v1.appendChild(el('span', 'ua-imagen-caption', 'Versión 1'));

        const v2 = el('div', 'ua-imagen-compuesta');
        v2.style.setProperty('--ua-tint', '#8b5cf6');
        v2.appendChild(el('span', 'ua-imagen-animal', '✨'));
        v2.appendChild(el('span', 'ua-imagen-caption', `Versión 2 (${cambio.label})`));

        compareRow.appendChild(v1);
        compareRow.appendChild(v2);
        container.appendChild(compareRow);

        container.appendChild(el('p', 'ua-prompt', '¿Harías una versión 3?'));
        const row = el('div', 'ua-choice-row');
        const siBtn = el('button', 'btn btn-secondary', 'Sí, otra mejora más');
        siBtn.type = 'button';
        siBtn.addEventListener('click', () => onComplete({ cambioElegido: cambio.label, quiereV3: true }));
        const noBtn = el('button', 'btn btn-primary', 'No, esta ya me gusta');
        noBtn.type = 'button';
        noBtn.addEventListener('click', () => onComplete({ cambioElegido: cambio.label, quiereV3: false }));
        row.appendChild(siBtn);
        row.appendChild(noBtn);
        container.appendChild(row);
    }
}
