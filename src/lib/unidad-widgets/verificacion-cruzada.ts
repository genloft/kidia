// Widget "Investiga con Vael" para investiga.tipo === 'verificacion_cruzada'
// (2.2 del tramo 12-14, "Verificación cruzada"). El alumno lee una afirmación
// de la IA, consulta VARIAS fuentes marcando en cada una si es fiable y si
// apoya o contradice la afirmación, y emite un veredicto con grado de
// confianza. La señal pedagógica del docx: decidir por convergencia de fuentes
// fiables, no por una sola — por eso el veredicto se contrasta con
// afirmacionEsCierta y con cuántas fuentes fiables se consultaron.

import type { VerificacionCruzadaInvestiga, FuenteCruzada } from '../../schemas/unidad';
import { el, createGatedInput, showFeedback, fireVaelAction } from './shared';

export interface VerificacionCruzadaResultado {
    fuentesConsultadas: string[];
    veredicto: 'cierta' | 'falsa';
    veredictoCorrecto: boolean;
    confianza: string;
    conclusion: string;
}

export function mountVerificacionCruzada(
    container: HTMLElement,
    data: VerificacionCruzadaInvestiga,
    onComplete: (resultado: VerificacionCruzadaResultado) => void
): void {
    const consultadas = new Set<string>();

    renderFuentes();

    function renderFuentes() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', `La IA afirma: "${data.afirmacionIA}"`));
        container.appendChild(el('p', 'ua-prompt', 'No te fíes de una sola: consulta varias fuentes y mira si coinciden. (Abre al menos 2.)'));

        const grid = el('div', 'ua-bank-grid');
        data.fuentes.forEach(f => {
            const btn = el('button', `ua-bank-card${consultadas.has(f.id) ? ' selected' : ''}`, f.label);
            btn.type = 'button';
            btn.addEventListener('click', () => renderContenido(f));
            grid.appendChild(btn);
        });
        container.appendChild(grid);

        if (consultadas.size >= 2) {
            const seguir = el('button', 'k-btn k-btn--primary k-btn--lg', 'Ya tengo suficiente: emitir veredicto →');
            seguir.type = 'button';
            seguir.addEventListener('click', renderVeredicto);
            container.appendChild(seguir);
        } else {
            container.appendChild(el('p', 'ua-prompt-preview', `Fuentes consultadas: ${consultadas.size} de ${data.fuentes.length}`));
        }
    }

    function renderContenido(fuente: FuenteCruzada) {
        consultadas.add(fuente.id);
        container.innerHTML = '';

        const box = el('div', 'ua-pista-box');
        box.appendChild(el('p', 'ua-pista-label', fuente.label));
        box.appendChild(el('p', 'ua-pista-texto', fuente.contenido));
        // Pista de fiabilidad: ayuda a distinguir fuente seria de opinión.
        box.appendChild(el('p', 'ua-pista-texto', fuente.fiable
            ? '✅ Fuente fiable: tiene autoría, datos y contexto.'
            : '⚠️ Poco fiable: es una opinión sin datos ni autoría clara.'));
        container.appendChild(box);

        const volver = el('button', 'k-btn k-btn--secondary k-btn--lg', '← Volver a las fuentes');
        volver.type = 'button';
        volver.addEventListener('click', renderFuentes);
        container.appendChild(volver);
    }

    function renderVeredicto() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', 'Con lo que has cruzado, ¿la afirmación es cierta o falsa?'));

        const row = el('div', 'ua-choice-row');
        (['cierta', 'falsa'] as const).forEach(v => {
            const btn = el('button', 'k-btn k-btn--secondary k-btn--lg', v === 'cierta' ? 'Es cierta ✅' : 'Es falsa ❌');
            btn.type = 'button';
            btn.addEventListener('click', () => renderConfianza(v));
            row.appendChild(btn);
        });
        container.appendChild(row);
    }

    function renderConfianza(veredicto: 'cierta' | 'falsa') {
        const veredictoCorrecto = (veredicto === 'cierta') === data.afirmacionEsCierta;
        container.innerHTML = '';

        const box = el('div', 'ua-pista-box');
        box.appendChild(el('p', 'ua-pista-label', veredictoCorrecto ? '¡Veredicto sólido!' : 'Revisa las fuentes fiables.'));
        box.appendChild(el('p', 'ua-pista-texto', veredictoCorrecto
            ? 'Las fuentes fiables convergen y tu veredicto lo respeta. Así se combate la desinformación: cruzando, no confiando en una sola voz.'
            : 'Fíjate en las fuentes con autoría y datos, no en las opiniones sueltas: su consenso apunta a lo contrario.'));
        container.appendChild(box);
        showFeedback(box, veredictoCorrecto);

        if (!veredictoCorrecto) {
            const reintentar = el('button', 'k-btn k-btn--primary k-btn--lg', 'Volver a mirar las fuentes →');
            reintentar.type = 'button';
            reintentar.addEventListener('click', renderFuentes);
            container.appendChild(reintentar);
            return;
        }

        container.appendChild(el('p', 'ua-prompt', '¿Con qué grado de confianza lo afirmas?'));
        const rowConf = el('div', 'ua-choice-row');
        ['Alta: fuentes claras y de acuerdo', 'Media: alguna duda', 'Baja: fuentes flojas'].forEach(nivel => {
            const btn = el('button', 'k-btn k-btn--secondary k-btn--lg', nivel.split(':')[0]);
            btn.type = 'button';
            btn.addEventListener('click', () => renderConclusion(veredicto, nivel));
            rowConf.appendChild(btn);
        });
        container.appendChild(rowConf);
    }

    function renderConclusion(veredicto: 'cierta' | 'falsa', confianza: string) {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', 'Escribe tu veredicto: ¿qué fuentes coincidían y cuáles descartaste?'));
        const input = createGatedInput({
            placeholder: 'Contrasté... y descarté... porque...',
            onAccepted: (conclusion) => {
                fireVaelAction('celebrate');
                onComplete({
                    fuentesConsultadas: [...consultadas],
                    veredicto,
                    veredictoCorrecto: true,
                    confianza,
                    conclusion,
                });
            },
        });
        container.appendChild(input);
    }
}
