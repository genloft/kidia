// Widget para investiga.tipo === 'verificar_con_fuente' (2.2).

import type { VerificarConFuenteInvestiga } from '../../schemas/unidad';
import { el, createGatedInput, showFeedback, fireVaelAction } from './shared';

export interface VerificarResultado {
    fuenteElegida: string;
    afirmacionEraCorrecta: boolean;
    conclusion: string;
}

export function mountVerificarConFuente(
    container: HTMLElement,
    data: VerificarConFuenteInvestiga,
    onComplete: (resultado: VerificarResultado) => void
): void {
    renderDecision();

    function renderDecision() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', `La IA ha dicho: "${data.afirmacionIA}"`));
        container.appendChild(el('p', 'ua-prompt', '¿Te lo crees o lo compruebas?'));

        const row = el('div', 'ua-choice-row');
        const creoBtn = el('button', 'btn btn-secondary', 'Me lo creo');
        creoBtn.type = 'button';
        creoBtn.addEventListener('click', () => {
            fireVaelAction('think');
            container.innerHTML = '';
            container.appendChild(el('p', 'ua-pista-texto', '¿Seguro? Comprobar nos hace más listos que cualquier pantalla. Vamos a mirarlo juntos.'));
            setTimeout(renderFuentes, 900);
        });

        const compruoBtn = el('button', 'btn btn-primary', 'Lo compruebo');
        compruoBtn.type = 'button';
        compruoBtn.addEventListener('click', renderFuentes);

        row.appendChild(creoBtn);
        row.appendChild(compruoBtn);
        container.appendChild(row);
    }

    function renderFuentes() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', '¿Dónde lo compruebas?'));
        const grid = el('div', 'ua-bank-grid');
        data.fuentes.forEach(f => {
            const btn = el('button', 'ua-bank-card', f.label);
            btn.type = 'button';
            btn.addEventListener('click', () => renderContenido(f));
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    }

    function renderContenido(fuente: VerificarConFuenteInvestiga['fuentes'][number]) {
        container.innerHTML = '';
        const box = el('div', 'ua-pista-box');
        box.appendChild(el('p', 'ua-pista-texto', fuente.contenido));
        container.appendChild(box);
        showFeedback(box, true);

        container.appendChild(el('p', 'ua-prompt', '¿La IA tenía razón?'));
        const input = createGatedInput({
            placeholder: 'Descubrí que...',
            onAccepted: (texto) => {
                fireVaelAction('celebrate');
                onComplete({ fuenteElegida: fuente.label, afirmacionEraCorrecta: data.esCorrecta, conclusion: texto });
            },
        });
        container.appendChild(input);
    }
}
