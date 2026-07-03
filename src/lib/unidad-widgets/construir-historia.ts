// Widget para investiga.tipo === 'construir_historia' (3.2).

import type { ConstruirHistoriaInvestiga, OpcionHistoria } from '../../schemas/unidad';
import { el, createGatedInput, fireVaelAction } from './shared';

export interface HistoriaResultado {
    principio: string;
    problema: string;
    giro?: string;
    final: string;
    edicion: string;
}

export function mountConstruirHistoria(
    container: HTMLElement,
    data: ConstruirHistoriaInvestiga,
    onComplete: (resultado: HistoriaResultado) => void
): void {
    let principio = '';
    let problema = '';
    let giro = '';
    let final = '';

    renderOpciones('¿Cómo EMPIEZA la aventura?', data.principios, (op) => {
        principio = op.label;
        renderOpciones('¿Qué PROBLEMA aparece?', data.problemas, (op2) => {
            problema = op2.label;
            if (data.permiteGiroLibre) {
                renderGiro();
            } else {
                renderFinal();
            }
        });
    });

    function renderOpciones(pregunta: string, opciones: OpcionHistoria[], onPick: (op: OpcionHistoria) => void) {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', pregunta));
        const grid = el('div', 'ua-bank-grid');
        opciones.forEach(op => {
            const btn = el('button', 'ua-bank-card', op.label);
            btn.type = 'button';
            btn.addEventListener('click', () => onPick(op));
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    }

    function renderGiro() {
        container.innerHTML = '';
        fireVaelAction('smile');
        container.appendChild(el('p', 'ua-prompt', '¡Añade un giro sorpresa que nadie se espere!'));
        container.appendChild(createGatedInput({
            placeholder: 'Y de repente...',
            onAccepted: (texto) => { giro = texto; renderFinal(); },
        }));
    }

    function renderFinal() {
        renderOpciones('¿Cómo TERMINA?', data.finales, (op) => {
            final = op.label;
            renderEdicion();
        });
    }

    function renderEdicion() {
        container.innerHTML = '';
        const resumen = el('div', 'ua-resumen-box');
        resumen.appendChild(el('p', 'ua-resumen-row', `Principio: ${principio}`));
        resumen.appendChild(el('p', 'ua-resumen-row', `Problema: ${problema}`));
        if (giro) resumen.appendChild(el('p', 'ua-resumen-row', `Giro: ${giro}`));
        resumen.appendChild(el('p', 'ua-resumen-row', `Final: ${final}`));
        container.appendChild(resumen);

        container.appendChild(el('p', 'ua-prompt', 'Lee la historia y cambia una frase para que sea 100% tuya.'));
        container.appendChild(createGatedInput({
            placeholder: 'Cambiaría...',
            onAccepted: (edicion) => {
                fireVaelAction('celebrate');
                onComplete({ principio, problema, giro: giro || undefined, final, edicion });
            },
        }));
    }
}
