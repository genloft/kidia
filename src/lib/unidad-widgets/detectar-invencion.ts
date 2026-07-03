// Widget "Investiga con Vael" para investiga.tipo === 'detectar_invencion' (unidad 1.4).
// Banco cerrado de frases con una verdadera mezclada entre varias inventadas; el niño
// predice antes de revelar (mecánica de firma "Caza el error").

import type { DetectarInvencionInvestiga } from '../../schemas/unidad';
import { el, showFeedback, fireVaelAction } from './shared';

export interface DetectarInvencionResultado {
    aciertos: number;
    total: number;
    fraseVerdaderaRespetada: boolean;
}

export function mountDetectarInvencion(
    container: HTMLElement,
    data: DetectarInvencionInvestiga,
    onComplete: (resultado: DetectarInvencionResultado) => void
): void {
    let indice = 0;
    let aciertos = 0;
    let fraseVerdaderaRespetada = true;

    render();

    function render() {
        container.innerHTML = '';

        if (indice >= data.banco.length) {
            fireVaelAction('celebrate');
            const resumen = el('div', 'ua-pista-box');
            resumen.appendChild(el('p', 'ua-pista-label', `¡Investigación terminada! Acertaste ${aciertos} de ${data.banco.length}.`));
            container.appendChild(resumen);
            const continuarBtn = el('button', 'btn btn-primary', 'Crear mi expediente →');
            continuarBtn.type = 'button';
            continuarBtn.addEventListener('click', () => onComplete({ aciertos, total: data.banco.length, fraseVerdaderaRespetada }));
            container.appendChild(continuarBtn);
            return;
        }

        const frase = data.banco[indice];
        container.appendChild(el('p', 'ua-prompt', 'Antes de marcar, adivina: ¿cuál será falsa y por qué?'));
        container.appendChild(el('p', 'ua-frase-texto', `"${frase.texto}"`));

        const row = el('div', 'ua-choice-row');
        const verdadBtn = el('button', 'btn btn-secondary', 'Es verdad ✅');
        verdadBtn.type = 'button';
        const inventoBtn = el('button', 'btn btn-secondary', 'Es un invento ❌');
        inventoBtn.type = 'button';

        verdadBtn.addEventListener('click', () => revelar(frase, true));
        inventoBtn.addEventListener('click', () => revelar(frase, false));

        row.appendChild(verdadBtn);
        row.appendChild(inventoBtn);
        container.appendChild(row);
    }

    function revelar(frase: DetectarInvencionInvestiga['banco'][number], marcoVerdad: boolean) {
        const correcto = marcoVerdad === frase.esVerdadera;
        if (correcto) aciertos++;
        if (frase.esVerdadera && !marcoVerdad) fraseVerdaderaRespetada = false;

        container.innerHTML = '';
        const box = el('div', 'ua-pista-box');
        box.appendChild(el('p', 'ua-pista-label', frase.esVerdadera ? '¡Esta SÍ es verdad!' : 'Esta es un invento.'));
        if (!frase.esVerdadera && frase.pistaSiFalsa) {
            box.appendChild(el('p', 'ua-pista-texto', frase.pistaSiFalsa));
        }
        container.appendChild(box);
        showFeedback(box, correcto);

        const siguienteBtn = el('button', 'btn btn-primary', 'Siguiente frase →');
        siguienteBtn.type = 'button';
        siguienteBtn.addEventListener('click', () => { indice++; render(); });
        container.appendChild(siguienteBtn);
    }
}
