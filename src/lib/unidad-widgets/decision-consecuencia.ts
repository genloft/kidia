// Widget para investiga.tipo === 'decision_consecuencia' (2.4).

import type { DecisionConsecuenciaInvestiga } from '../../schemas/unidad';
import { el, showFeedback, fireVaelAction } from './shared';

export interface DecisionResultado {
    decisionesSeguras: number;
    total: number;
}

export function mountDecisionConsecuencia(
    container: HTMLElement,
    data: DecisionConsecuenciaInvestiga,
    onComplete: (resultado: DecisionResultado) => void
): void {
    let indice = 0;
    let seguras = 0;

    render();

    function render() {
        container.innerHTML = '';

        if (indice >= data.escenarios.length) {
            fireVaelAction('celebrate');
            const resumen = el('div', 'ua-pista-box');
            resumen.appendChild(el('p', 'ua-pista-label', `Tomaste ${seguras} de ${data.escenarios.length} decisiones seguras.`));
            container.appendChild(resumen);
            const continuarBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'Diseñar mi Escudo →');
            continuarBtn.type = 'button';
            continuarBtn.addEventListener('click', () => onComplete({ decisionesSeguras: seguras, total: data.escenarios.length }));
            container.appendChild(continuarBtn);
            return;
        }

        const escenario = data.escenarios[indice];
        container.appendChild(el('p', 'ua-prompt', escenario.situacion));

        const row = el('div', 'ua-choice-row');
        escenario.opciones.forEach(op => {
            const btn = el('button', 'k-btn k-btn--secondary k-btn--lg', op.label);
            btn.type = 'button';
            btn.addEventListener('click', () => revelar(op));
            row.appendChild(btn);
        });
        container.appendChild(row);
    }

    function revelar(opcion: DecisionConsecuenciaInvestiga['escenarios'][number]['opciones'][number]) {
        if (opcion.segura) seguras++;
        container.innerHTML = '';
        const box = el('div', 'ua-pista-box');
        box.appendChild(el('p', 'ua-pista-texto', opcion.consecuencia));
        container.appendChild(box);
        showFeedback(box, opcion.segura);

        const siguienteBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'Siguiente →');
        siguienteBtn.type = 'button';
        siguienteBtn.addEventListener('click', () => { indice++; render(); });
        container.appendChild(siguienteBtn);
    }
}
