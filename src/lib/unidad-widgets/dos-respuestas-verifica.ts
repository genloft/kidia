// Widget "Investiga con Vael" para investiga.tipo === 'dos_respuestas_verifica'
// (2.2 del tramo 10-11, "El detective de datos" — el reto insignia del Nivel 2).
// Flujo de la ficha del docx: ver las DOS respuestas contradictorias de la IA →
// registrar la intuición ("¿cuál te crees?") → comprobar en una fuente segura →
// veredicto final. La señal pedagógica es si el veredicto se apoya en la
// evidencia y no en la intuición inicial (por eso se guardan ambas elecciones).

import type { DosRespuestasVerificaInvestiga } from '../../schemas/unidad';
import { el, createGatedInput, showFeedback, fireVaelAction } from './shared';

export interface DosRespuestasResultado {
    eleccionInicial: 'A' | 'B';
    fuenteElegida: string;
    veredictoFinal: 'A' | 'B';
    veredictoCorrecto: boolean;
    cambioTrasComprobar: boolean;
    conclusion: string;
}

export function mountDosRespuestasVerifica(
    container: HTMLElement,
    data: DosRespuestasVerificaInvestiga,
    onComplete: (resultado: DosRespuestasResultado) => void
): void {
    let eleccionInicial: 'A' | 'B' | null = null;
    let fuenteElegida = '';

    renderIntuicion();

    function renderRespuestas(): HTMLElement {
        const wrap = el('div', 'ua-dos-respuestas');
        const cajaA = el('div', 'ua-pista-box');
        cajaA.appendChild(el('p', 'ua-pista-label', 'Respuesta 1 de la IA'));
        cajaA.appendChild(el('p', 'ua-pista-texto', data.respuestaA));
        const cajaB = el('div', 'ua-pista-box');
        cajaB.appendChild(el('p', 'ua-pista-label', 'Respuesta 2 de la IA'));
        cajaB.appendChild(el('p', 'ua-pista-texto', data.respuestaB));
        wrap.appendChild(cajaA);
        wrap.appendChild(cajaB);
        return wrap;
    }

    function renderIntuicion() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', `La misma pregunta, dos respuestas distintas: "${data.pregunta}"`));
        container.appendChild(renderRespuestas());
        container.appendChild(el('p', 'ua-prompt', 'Antes de investigar: ¿cuál te crees?'));

        const row = el('div', 'ua-choice-row');
        (['A', 'B'] as const).forEach(opcion => {
            const btn = el('button', 'k-btn k-btn--secondary k-btn--lg', `La respuesta ${opcion === 'A' ? '1' : '2'}`);
            btn.type = 'button';
            btn.addEventListener('click', () => {
                eleccionInicial = opcion;
                fireVaelAction('think');
                renderFuentes();
            });
            row.appendChild(btn);
        });
        container.appendChild(row);
    }

    function renderFuentes() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', 'Un buen detective no decide por corazonada: comprueba. ¿Dónde investigas?'));
        const grid = el('div', 'ua-bank-grid');
        data.fuentes.forEach(f => {
            const btn = el('button', 'ua-bank-card', f.label);
            btn.type = 'button';
            btn.addEventListener('click', () => {
                fuenteElegida = f.label;
                renderContenido(f);
            });
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    }

    function renderContenido(fuente: DosRespuestasVerificaInvestiga['fuentes'][number]) {
        container.innerHTML = '';
        const box = el('div', 'ua-pista-box');
        box.appendChild(el('p', 'ua-pista-label', fuente.label));
        box.appendChild(el('p', 'ua-pista-texto', fuente.contenido));
        container.appendChild(box);
        showFeedback(box, true);

        container.appendChild(el('p', 'ua-prompt', 'Con la evidencia delante: ¿cuál era la respuesta correcta?'));
        const row = el('div', 'ua-choice-row');
        (['A', 'B'] as const).forEach(opcion => {
            const btn = el('button', 'k-btn k-btn--secondary k-btn--lg', `La respuesta ${opcion === 'A' ? '1' : '2'}`);
            btn.type = 'button';
            btn.addEventListener('click', () => renderVeredicto(opcion));
            row.appendChild(btn);
        });
        container.appendChild(row);
    }

    function renderVeredicto(veredictoFinal: 'A' | 'B') {
        const veredictoCorrecto = veredictoFinal === data.correcta;
        container.innerHTML = '';

        const box = el('div', 'ua-pista-box');
        box.appendChild(el('p', 'ua-pista-label', veredictoCorrecto ? '¡Veredicto acertado!' : 'Mmm… revisa la evidencia.'));
        box.appendChild(el('p', 'ua-pista-texto', veredictoCorrecto
            ? 'La fuente lo confirma. Decidiste con evidencia, no con corazonada: eso es ser detective de datos.'
            : 'La fuente apunta a la otra respuesta. Vuelve a leerla con tu lupa: la evidencia manda.'));
        container.appendChild(box);
        showFeedback(box, veredictoCorrecto);

        if (!veredictoCorrecto) {
            const reintentarBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'Volver a mirar la fuente →');
            reintentarBtn.type = 'button';
            reintentarBtn.addEventListener('click', renderFuentes);
            container.appendChild(reintentarBtn);
            return;
        }

        container.appendChild(el('p', 'ua-prompt', 'Escribe tu veredicto: ¿cómo lo comprobaste?'));
        const input = createGatedInput({
            placeholder: 'Lo comprobé mirando...',
            onAccepted: (conclusion) => {
                fireVaelAction('celebrate');
                onComplete({
                    eleccionInicial: eleccionInicial ?? veredictoFinal,
                    fuenteElegida,
                    veredictoFinal,
                    veredictoCorrecto: true,
                    cambioTrasComprobar: eleccionInicial !== null && eleccionInicial !== veredictoFinal,
                    conclusion,
                });
            },
        });
        container.appendChild(input);
    }
}
