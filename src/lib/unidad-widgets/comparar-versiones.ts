// Widget para investiga.tipo === 'comparar_versiones' (2.3).

import type { CompararVersionesInvestiga } from '../../schemas/unidad';
import { el, createGatedInput, showFeedback, fireVaelAction } from './shared';

export interface CompararResultado {
    versionElegida: string;
    razon: string;
    eligioLaQueCumple: boolean;
    combinacion: string;
}

export function mountCompararVersiones(
    container: HTMLElement,
    data: CompararVersionesInvestiga,
    onComplete: (resultado: CompararResultado) => void
): void {
    renderComparar();

    function renderComparar() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', `Encargo: "${data.encargo}"`));

        const grid = el('div', 'ua-bank-grid');
        data.versiones.forEach(v => {
            const card = el('div', 'ua-palabra-card');
            card.appendChild(el('strong', 'ua-palabra-nombre', v.label));
            card.appendChild(el('p', 'ua-palabra-def', v.descripcion));
            const btn = el('button', 'k-btn k-btn--secondary k-btn--lg', 'Elegir esta');
            btn.type = 'button';
            btn.addEventListener('click', () => renderRazon(v));
            card.appendChild(btn);
            grid.appendChild(card);
        });
        container.appendChild(grid);
    }

    function renderRazon(version: CompararVersionesInvestiga['versiones'][number]) {
        container.innerHTML = '';
        showFeedback(container, version.cumpleEncargo);
        container.appendChild(el('p', 'ua-prompt', `Elegiste: "${version.label}". ¿Por qué cumple mejor el encargo?`));
        const input = createGatedInput({
            placeholder: 'Porque...',
            onAccepted: (razon) => renderCombinar(version, razon),
        });
        container.appendChild(input);
    }

    function renderCombinar(version: CompararVersionesInvestiga['versiones'][number], razon: string) {
        container.innerHTML = '';
        fireVaelAction('think');
        container.appendChild(el('p', 'ua-prompt', '¿Y si juntas lo mejor de las dos? Cuéntame tu versión combinada.'));
        const input = createGatedInput({
            placeholder: 'Mi versión combinada tiene...',
            onAccepted: (combinacion) => {
                fireVaelAction('celebrate');
                onComplete({ versionElegida: version.label, razon, eligioLaQueCumple: version.cumpleEncargo, combinacion });
            },
        });
        container.appendChild(input);
    }
}
