// Widget "Investiga con Vael" para investiga.tipo === 'entrenar_clasificador' (unidad 1.2).
// Entrena solo con un tipo -> predice sobre el ejemplo trampa -> descubre el fallo -> reentrena variado.

import type { EntrenarClasificadorInvestiga } from '../../schemas/unidad';
import { el, createBankCard, createGatedInput, showFeedback, fireVaelAction } from './shared';

export interface EntrenarResultado {
    reglaFormulada: string;
    prediccionInicialCorrecta: boolean;
}

export function mountEntrenarClasificador(
    container: HTMLElement,
    data: EntrenarClasificadorInvestiga,
    onComplete: (resultado: EntrenarResultado) => void
): void {
    const [catA] = data.categorias;
    renderEntrenar();

    function renderEntrenar() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', `Dale ejemplos a tu mini-cerebro: todos son de "${catA}".`));

        const grid = el('div', 'ua-bank-grid');
        data.bancoEntrenamiento.forEach(ej => {
            const card = createBankCard({ icono: ej.icono, label: ej.label, onClick: () => showFeedback(card, true) });
            grid.appendChild(card);
        });
        container.appendChild(grid);

        const listoBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'Ya lo entrené →');
        listoBtn.type = 'button';
        listoBtn.addEventListener('click', renderPredecirTrampa);
        container.appendChild(listoBtn);
    }

    function renderPredecirTrampa() {
        container.innerHTML = '';
        fireVaelAction('think');
        container.appendChild(el('p', 'ua-prompt', `Ahora enséñale algo nuevo: "${data.ejemploTrampa.label}". ¿Qué crees que dirá tu mini-cerebro?`));

        const row = el('div', 'ua-choice-row');
        data.categorias.forEach(cat => {
            const btn = el('button', 'k-btn k-btn--secondary k-btn--lg', cat.replace('_', ' '));
            btn.type = 'button';
            btn.addEventListener('click', () => renderResultadoTrampa(cat === data.ejemploTrampa.categoria));
            row.appendChild(btn);
        });
        container.appendChild(row);
    }

    function renderResultadoTrampa(prediccionCorrecta: boolean) {
        container.innerHTML = '';
        const box = el('div', 'ua-pista-box');
        box.appendChild(el('p', 'ua-pista-label', prediccionCorrecta ? '¡Tu mini-cerebro acertó!' : 'Tu mini-cerebro se lió…'));
        box.appendChild(el('p', 'ua-pista-texto', `"${data.ejemploTrampa.label}" en realidad es "${data.ejemploTrampa.categoria.replace('_', ' ')}". Como solo vio ejemplos de un tipo, le cuesta reconocer algo distinto.`));
        container.appendChild(box);
        showFeedback(box, prediccionCorrecta);

        const reentrenarBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'Reentrenarlo con ejemplos variados →');
        reentrenarBtn.type = 'button';
        reentrenarBtn.addEventListener('click', () => renderReentrenar(prediccionCorrecta));
        container.appendChild(reentrenarBtn);
    }

    function renderReentrenar(prediccionInicialCorrecta: boolean) {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', 'Ahora entrénalo con ejemplos de todo tipo.'));

        const grid = el('div', 'ua-bank-grid');
        data.bancoReentrenamiento.forEach(ej => {
            const card = createBankCard({ icono: ej.icono, label: ej.label, onClick: () => showFeedback(card, true) });
            grid.appendChild(card);
        });
        container.appendChild(grid);

        const listoBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'Ya lo reentrené →');
        listoBtn.type = 'button';
        listoBtn.addEventListener('click', () => renderFormularRegla(prediccionInicialCorrecta));
        container.appendChild(listoBtn);
    }

    function renderFormularRegla(prediccionInicialCorrecta: boolean) {
        container.innerHTML = '';
        fireVaelAction('think');
        container.appendChild(el('p', 'ua-prompt', '¿Qué le faltó aprender a tu máquina la primera vez? ¿Cuál es tu regla?'));
        const input = createGatedInput({
            placeholder: 'Mi regla es...',
            onAccepted: (regla) => {
                fireVaelAction('celebrate');
                onComplete({ reglaFormulada: regla, prediccionInicialCorrecta });
            },
        });
        container.appendChild(input);
    }
}
