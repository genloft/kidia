// Widget "Investiga con Vael" para investiga.tipo === 'hipotesis_prueba_regla' (unidad 1.1).
// Predice -> prueba (pista pre-escrita, no generada) -> repite -> formula la regla.

import type { HipotesisPruebaReglaInvestiga } from '../../schemas/unidad';
import { el, createBankCard, createGatedInput, showFeedback, fireVaelAction } from './shared';

export interface HipotesisResultado {
    reglaFormulada: string;
    objetosInvestigados: string[];
    motivos: string[];
}

export function mountHipotesisPruebaRegla(
    container: HTMLElement,
    data: HipotesisPruebaReglaInvestiga,
    onComplete: (resultado: HipotesisResultado) => void
): void {
    const investigados: string[] = [];
    const motivos: string[] = [];
    let disponibles = [...data.banco];

    render();

    function render() {
        container.innerHTML = '';

        if (investigados.length >= data.maximoObjetos || disponibles.length === 0) {
            renderFormularRegla();
            return;
        }

        container.appendChild(el('p', 'ua-prompt', data.preguntaLinterna));

        const grid = el('div', 'ua-bank-grid');
        disponibles.forEach(obj => {
            grid.appendChild(createBankCard({
                icono: obj.icono,
                label: obj.label,
                onClick: () => renderPredict(obj),
            }));
        });
        container.appendChild(grid);

        if (investigados.length >= data.minimoObjetos) {
            const seguirBtn = el('button', 'btn btn-secondary', 'Ya tengo suficientes pistas →');
            seguirBtn.type = 'button';
            seguirBtn.addEventListener('click', renderFormularRegla);
            container.appendChild(seguirBtn);
        }
    }

    function renderPredict(obj: HipotesisPruebaReglaInvestiga['banco'][number]) {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', `¿Crees que "${obj.label}" APRENDE o SIEMPRE hace lo mismo?`));

        const row = el('div', 'ua-choice-row');
        const aprendeBtn = el('button', 'btn btn-secondary', 'Aprende 🧠');
        aprendeBtn.type = 'button';
        const igualBtn = el('button', 'btn btn-secondary', 'Siempre lo mismo 🔁');
        igualBtn.type = 'button';

        aprendeBtn.addEventListener('click', () => renderPista(obj, true));
        igualBtn.addEventListener('click', () => renderPista(obj, false));

        row.appendChild(aprendeBtn);
        row.appendChild(igualBtn);
        container.appendChild(row);
    }

    function renderPista(obj: HipotesisPruebaReglaInvestiga['banco'][number], predijoQueAprende: boolean) {
        const acerto = predijoQueAprende === obj.usaIA;
        investigados.push(obj.id);
        disponibles = disponibles.filter(o => o.id !== obj.id);

        container.innerHTML = '';
        const pistaBox = el('div', 'ua-pista-box');
        pistaBox.appendChild(el('p', 'ua-pista-label', acerto ? '¡Tu pista confirma tu hipótesis!' : 'Mira esta pista con atención…'));
        pistaBox.appendChild(el('p', 'ua-pista-texto', obj.pista));
        container.appendChild(pistaBox);
        showFeedback(pistaBox, acerto);

        const motivoInput = createGatedInput({
            placeholder: '¿Por qué crees que es así? (opcional)',
            onAccepted: (texto) => {
                motivos.push(texto);
                continuarBtn.click();
            },
        });
        container.appendChild(motivoInput);

        const continuarBtn = el('button', 'btn btn-primary', 'Seguir investigando →');
        continuarBtn.type = 'button';
        continuarBtn.addEventListener('click', render);
        container.appendChild(continuarBtn);
    }

    function renderFormularRegla() {
        container.innerHTML = '';
        fireVaelAction('think');
        container.appendChild(el('p', 'ua-prompt', 'Con todo lo que investigaste… ¿cuál es tu regla? ¿Cómo sabes si algo tiene "cerebro de IA"?'));
        const input = createGatedInput({
            placeholder: 'Mi regla es...',
            onAccepted: (regla) => {
                fireVaelAction('celebrate');
                onComplete({ reglaFormulada: regla, objetosInvestigados: investigados, motivos });
            },
        });
        container.appendChild(input);
    }
}
