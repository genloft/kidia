// Motor secuencial del formato "unidad-aventura" (rediseño tramo 8-9).
// A diferencia de game-engine.ts (grafo de DialogueNode), este motor avanza
// por una secuencia FIJA de 9 pantallas leídas directamente del JSON de la
// unidad. No comparte código con game-engine.ts a propósito — son formatos
// de contenido distintos que conviven en el sitio.

import type { UnidadAventuraSchema } from '../schemas/unidad';
import { storage, syncWithCloud } from './storage-simple';
import { UnidadService } from './unidad-service';
import { activeChild } from './active-child';
import { mountHipotesisPruebaRegla } from './unidad-widgets/hipotesis-prueba-regla';
import { mountEntrenarClasificador } from './unidad-widgets/entrenar-clasificador';
import { mountConstruirPromptImagen } from './unidad-widgets/construir-prompt-imagen';
import { mountDetectarInvencion } from './unidad-widgets/detectar-invencion';
import { mountAfinarPromptDetalles } from './unidad-widgets/afinar-prompt-detalles';
import { mountVerificarConFuente } from './unidad-widgets/verificar-con-fuente';
import { mountCompararVersiones } from './unidad-widgets/comparar-versiones';
import { mountDecisionConsecuencia } from './unidad-widgets/decision-consecuencia';
import { mountConstruirHistoria } from './unidad-widgets/construir-historia';
import { mountIterarVersion } from './unidad-widgets/iterar-version';
import { mountConstruirJuego } from './unidad-widgets/construir-juego';
import { mountMontarLibro } from './unidad-widgets/montar-libro';
import { mountIdeaParaAyudar } from './unidad-widgets/idea-para-ayudar';
import { mountPresentarCreacion } from './unidad-widgets/presentar-creacion';
import { el, iconEmoji, createGatedInput, fireVaelAction } from './unidad-widgets/shared';

type Screen = 'portada' | 'mision' | 'palabras' | 'investiga' | 'crea' | 'detective' | 'familia' | 'comparte' | 'cierre';

// 7 puntos visibles en la barra de progreso (Portada y Cierre son estados, no pasos).
const PROGRESS_SCREENS: Screen[] = ['mision', 'palabras', 'investiga', 'crea', 'detective', 'familia', 'comparte'];

const RESUMEN_LABELS: Record<string, string> = {
    reglaFormulada: 'Tu regla',
    objetosInvestigados: 'Cosas investigadas',
    motivos: 'Tus motivos',
    prediccionInicialCorrecta: 'Tu primera predicción',
    promptFinal: 'Tu hechizo',
    aciertos: 'Errores cazados',
    total: 'Frases investigadas',
    eleccion: 'Tus elecciones',
    detalleLibre: 'Tu detalle',
    detallesAnadidos: 'Detalles añadidos',
    detalleClave: 'El detalle clave',
    fuenteElegida: 'Fuente consultada',
    afirmacionEraCorrecta: '¿Era verdad?',
    conclusion: 'Tu conclusión',
    versionElegida: 'Versión elegida',
    razon: 'Tu razón',
    eligioLaQueCumple: '¿Cumplía el encargo?',
    combinacion: 'Tu combinación',
    decisionesSeguras: 'Decisiones seguras',
    principio: 'Cómo empieza',
    problema: 'El problema',
    giro: 'Tu giro',
    final: 'Cómo termina',
    edicion: 'Lo que cambiaste',
    cambioElegido: 'Qué mejoraste',
    quiereV3: '¿Habrá versión 3?',
    tema: 'Tema del juego',
    adivinanzasElegidas: 'Tus adivinanzas',
    paginas: 'Páginas del libro',
    destinatario: 'A quién ayuda',
    necesidad: 'Qué necesita',
    idea: 'Tu idea',
    respuestas: 'Tus respuestas',
    totalCreaciones: 'Creaciones en tu Cuaderno',
};

function formatearValor(value: any): string {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (value && typeof value === 'object') {
        return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(' · ');
    }
    return String(value);
}

export class UnidadEngine {
    private unidad: UnidadAventuraSchema;
    private container: HTMLElement;
    private childId: string;
    private investigaResultado: Record<string, any> | null = null;
    private artifactId: string | null = null;

    constructor(unidad: UnidadAventuraSchema, containerId: string) {
        this.unidad = unidad;
        this.container = document.getElementById(containerId) as HTMLElement;
        this.childId = activeChild.get() || '';
        this.init();
    }

    private async init() {
        const dependeDe = this.unidad.dependeDe || [];
        if (dependeDe.length > 0 && this.childId) {
            const cuaderno = await UnidadService.getCuaderno(this.childId);
            const unidadesEnCuaderno = new Set(cuaderno.map(a => a.unidad_id));
            const faltantes = dependeDe.filter(id => !unidadesEnCuaderno.has(id));
            if (faltantes.length > 0) {
                this.renderBloqueado(faltantes);
                return;
            }
        }
        this.renderScreen('portada');
    }

    private renderBloqueado(faltantes: string[]) {
        fireVaelAction('think');
        this.container.innerHTML = '';
        this.container.appendChild(el('p', 'ua-eyebrow', 'Todavía no'));
        this.container.appendChild(el('h1', 'ua-titulo', 'Antes de esta misión...'));
        this.container.appendChild(el('p', 'ua-vael-texto', `Esta misión usa cosas que creaste en la unidad ${faltantes.join(', ')}. Complétala primero y vuelve por aquí.`));
        const link = el('a', 'btn btn-primary', 'Volver al Mapa');
        link.setAttribute('href', '/mapa');
        this.container.appendChild(link);
    }

    private updateProgress(screen: Screen) {
        window.dispatchEvent(new CustomEvent('unidad:step', {
            detail: { screen, index: PROGRESS_SCREENS.indexOf(screen), total: PROGRESS_SCREENS.length },
        }));
    }

    private renderScreen(screen: Screen) {
        this.updateProgress(screen);
        this.container.innerHTML = '';
        const map: Record<Screen, () => void> = {
            portada: () => this.renderPortada(),
            mision: () => this.renderMision(),
            palabras: () => this.renderPalabras(),
            investiga: () => this.renderInvestiga(),
            crea: () => this.renderCrea(),
            detective: () => this.renderDetective(),
            familia: () => this.renderFamilia(),
            comparte: () => this.renderComparte(),
            cierre: () => this.renderCierre(),
        };
        map[screen]();
    }

    private continueButton(label: string, onClick: () => void): HTMLButtonElement {
        const btn = el('button', 'btn btn-primary ua-continue', label);
        btn.type = 'button';
        btn.addEventListener('click', onClick);
        return btn;
    }

    // --- Pantallas genéricas: se generan directamente del JSON ---

    private renderPortada() {
        fireVaelAction('smile');
        this.container.appendChild(el('span', 'ua-zona-badge', this.unidad.zona.nombre));
        this.container.appendChild(el('h1', 'ua-titulo', this.unidad.web.tituloPantalla));
        this.container.appendChild(el('p', 'ua-subtitulo', this.unidad.unidadCurricular));
        this.container.appendChild(this.continueButton('Empezar misión →', () => this.renderScreen('mision')));
    }

    private renderMision() {
        fireVaelAction('talk');
        this.container.appendChild(el('p', 'ua-eyebrow', 'La misión'));
        this.container.appendChild(el('p', 'ua-vael-texto', this.unidad.web.introVael));
        this.container.appendChild(this.continueButton('¡Vamos! →', () => this.renderScreen('palabras')));
    }

    private renderPalabras() {
        fireVaelAction('smile');
        this.container.appendChild(el('p', 'ua-eyebrow', 'Palabras poderosas'));
        const grid = el('div', 'ua-palabras-grid');
        this.unidad.palabras.forEach(p => {
            const card = el('div', 'ua-palabra-card');
            card.appendChild(el('span', 'ua-palabra-icono', iconEmoji(p.icono)));
            card.appendChild(el('strong', 'ua-palabra-nombre', p.palabra));
            card.appendChild(el('p', 'ua-palabra-def', p.definicion));
            grid.appendChild(card);
        });
        this.container.appendChild(grid);

        this.container.appendChild(this.continueButton('Coleccionar palabras →', async () => {
            if (this.childId) {
                await UnidadService.collectPalabras(this.childId, this.unidad.id, this.unidad.palabras.map(p => p.palabra));
            }
            this.renderScreen('investiga');
        }));
    }

    private renderInvestiga() {
        fireVaelAction('think');
        this.container.appendChild(el('p', 'ua-eyebrow', 'Investiga con Vael'));
        const widgetContainer = el('div', 'ua-widget-container');
        this.container.appendChild(widgetContainer);

        const onDone = (resultado: Record<string, any>) => {
            this.investigaResultado = resultado;
            this.renderScreen('crea');
        };

        const investiga = this.unidad.investiga;
        switch (investiga.tipo) {
            case 'hipotesis_prueba_regla':
                mountHipotesisPruebaRegla(widgetContainer, investiga, onDone);
                break;
            case 'entrenar_clasificador':
                mountEntrenarClasificador(widgetContainer, investiga, onDone);
                break;
            case 'construir_prompt_imagen':
                mountConstruirPromptImagen(widgetContainer, investiga, onDone);
                break;
            case 'detectar_invencion':
                mountDetectarInvencion(widgetContainer, investiga, onDone);
                break;
            case 'afinar_prompt_detalles':
                mountAfinarPromptDetalles(widgetContainer, investiga, onDone);
                break;
            case 'verificar_con_fuente':
                mountVerificarConFuente(widgetContainer, investiga, onDone);
                break;
            case 'comparar_versiones':
                mountCompararVersiones(widgetContainer, investiga, onDone);
                break;
            case 'decision_consecuencia':
                mountDecisionConsecuencia(widgetContainer, investiga, onDone);
                break;
            case 'construir_historia':
                mountConstruirHistoria(widgetContainer, investiga, onDone);
                break;
            case 'iterar_version':
                mountIterarVersion(widgetContainer, investiga, onDone);
                break;
            case 'construir_juego':
                mountConstruirJuego(widgetContainer, investiga, onDone);
                break;
            case 'montar_libro':
                mountMontarLibro(widgetContainer, investiga, onDone);
                break;
            case 'idea_para_ayudar':
                mountIdeaParaAyudar(widgetContainer, investiga, onDone);
                break;
            case 'presentar_creacion':
                mountPresentarCreacion(widgetContainer, investiga, onDone, this.childId);
                break;
        }
    }

    private renderCrea() {
        fireVaelAction('proud');
        this.container.appendChild(el('p', 'ua-eyebrow', 'Crea'));
        this.container.appendChild(el('p', 'ua-vael-texto', this.unidad.crea.instrucciones));

        const resumen = el('div', 'ua-resumen-box');
        Object.entries(this.investigaResultado || {}).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            const label = RESUMEN_LABELS[key] || key;
            const row = el('p', 'ua-resumen-row');
            row.appendChild(el('strong', undefined, `${label}: `));
            row.appendChild(document.createTextNode(formatearValor(value)));
            resumen.appendChild(row);
        });
        this.container.appendChild(resumen);

        const tituloInput = createGatedInput({
            placeholder: 'Ponle un nombre a tu creación',
            onAccepted: async (titulo) => {
                fireVaelAction('celebrate');
                if (this.childId) {
                    const { data } = await UnidadService.saveArtifact(
                        this.childId,
                        this.unidad.id,
                        this.unidad.crea.tipo,
                        { ...this.investigaResultado, tituloArtefacto: titulo },
                        this.unidad.dependeDe || []
                    );
                    this.artifactId = data?.id || null;
                }
                this.renderScreen('detective');
            },
        });
        this.container.appendChild(tituloInput);
    }

    private renderDetective() {
        fireVaelAction('think');
        this.container.appendChild(el('p', 'ua-eyebrow', 'Piensa como detective'));
        let i = 0;
        const preguntaBox = el('div', 'ua-pista-box');
        this.container.appendChild(preguntaBox);

        const renderPregunta = () => {
            preguntaBox.innerHTML = '';
            if (this.unidad.detective.casoTruco && i === 0) {
                preguntaBox.appendChild(el('p', 'ua-pista-texto', this.unidad.detective.casoTruco));
            }
            preguntaBox.appendChild(el('p', 'ua-vael-texto', this.unidad.detective.preguntas[i]));
        };
        renderPregunta();

        this.container.appendChild(this.continueButton('Siguiente →', () => {
            i++;
            if (i >= this.unidad.detective.preguntas.length) {
                this.renderScreen('familia');
                return;
            }
            renderPregunta();
        }));
    }

    private renderFamilia() {
        fireVaelAction('smile');
        this.container.appendChild(el('p', 'ua-eyebrow', 'Misión en familia'));
        this.container.appendChild(el('h2', 'ua-familia-nombre', this.unidad.familia.nombre));
        this.container.appendChild(el('p', 'ua-familia-meta', `${this.unidad.familia.duracionMinutos} min · ${this.unidad.familia.modo === 'offline' ? 'Sin pantalla' : 'En la app'}`));
        this.container.appendChild(el('p', 'ua-vael-texto', this.unidad.familia.instrucciones));

        let detalle = '';
        if (this.unidad.familia.capturaEnApp.tipo !== 'checklist_con_iconos') {
            this.container.appendChild(createGatedInput({
                placeholder: 'Cuéntanos qué pasó (opcional)',
                onAccepted: (texto) => { detalle = texto; },
            }));
        }

        this.container.appendChild(this.continueButton('Ya lo hicimos ✓', async () => {
            if (this.childId) {
                await UnidadService.completeFamilyMission(this.childId, this.unidad.familia.nombre, this.unidad.id, detalle || undefined);
            }
            this.renderScreen('comparte');
        }));
    }

    private renderComparte() {
        fireVaelAction('celebrate');
        this.container.appendChild(el('p', 'ua-eyebrow', 'Comparte y colecciona'));
        const mensaje = this.unidad.comparte.publicaEnGaleria
            ? 'Tu creación va a la galería del laboratorio, donde otros inventores e inventoras la pueden ver una vez que Vael la revise.'
            : 'Esta creación es tuya y se queda en tu Cuaderno — no hace falta compartirla con nadie más.';
        this.container.appendChild(el('p', 'ua-vael-texto', mensaje));

        const label = this.unidad.comparte.publicaEnGaleria ? 'Publicar y terminar →' : 'Guardar y terminar →';
        this.container.appendChild(this.continueButton(label, async () => {
            if (this.artifactId && this.unidad.comparte.publicaEnGaleria) {
                await UnidadService.submitToGallery(this.artifactId);
            }
            if (this.childId && this.unidad.comparte.insigniaPosible) {
                await UnidadService.awardBadge(this.childId, this.unidad.comparte.insigniaPosible.id);
            }
            // Mismo array completedScenarios/badges que usan mapa.astro, insignias.astro
            // y el Panel Familiar — se reutiliza en vez de crear un sistema paralelo.
            storage.update(s => ({
                ...s,
                completedScenarios: Array.from(new Set([...s.completedScenarios, this.unidad.id])),
                badges: this.unidad.comparte.insigniaPosible
                    ? Array.from(new Set([...s.badges, this.unidad.comparte.insigniaPosible.id]))
                    : s.badges,
            }));
            await syncWithCloud();
            this.renderScreen('cierre');
        }));
    }

    private renderCierre() {
        fireVaelAction('celebrate');
        this.container.appendChild(el('p', 'ua-vael-texto ua-cierre-texto', this.unidad.web.cierreVael));
        const link = el('a', 'btn btn-primary', 'Volver al Mapa');
        link.setAttribute('href', '/mapa');
        this.container.appendChild(link);
    }
}
