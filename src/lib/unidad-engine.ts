// Motor secuencial del formato "unidad-aventura" (rediseño tramo 8-9).
// A diferencia de game-engine.ts (grafo de DialogueNode), este motor avanza
// por una secuencia FIJA de 9 pantallas leídas directamente del JSON de la
// unidad. No comparte código con game-engine.ts a propósito — son formatos
// de contenido distintos que conviven en el sitio.

import type { UnidadAventuraSchema } from '../schemas/unidad';
import { storage, syncWithCloud } from './storage-simple';
import { UnidadService } from './unidad-service';
import { ChispasService, CHISPAS, nivelInventor } from './chispas-service';
import { celebrate } from './celebration';
import { activeChild } from './active-child';
import { mountHipotesisPruebaRegla } from './unidad-widgets/hipotesis-prueba-regla';
import { mountEntrenarClasificador } from './unidad-widgets/entrenar-clasificador';
import { mountConstruirPromptImagen } from './unidad-widgets/construir-prompt-imagen';
import { mountDetectarInvencion } from './unidad-widgets/detectar-invencion';
import { mountAfinarPromptDetalles } from './unidad-widgets/afinar-prompt-detalles';
import { mountVerificarConFuente } from './unidad-widgets/verificar-con-fuente';
import { mountDosRespuestasVerifica } from './unidad-widgets/dos-respuestas-verifica';
import { mountVerificacionCruzada } from './unidad-widgets/verificacion-cruzada';
import { mountCompararVersiones } from './unidad-widgets/comparar-versiones';
import { mountDecisionConsecuencia } from './unidad-widgets/decision-consecuencia';
import { mountConstruirHistoria } from './unidad-widgets/construir-historia';
import { mountIterarVersion } from './unidad-widgets/iterar-version';
import { mountConstruirJuego } from './unidad-widgets/construir-juego';
import { mountMontarLibro } from './unidad-widgets/montar-libro';
import { mountIdeaParaAyudar } from './unidad-widgets/idea-para-ayudar';
import { mountPresentarCreacion } from './unidad-widgets/presentar-creacion';
import { el, iconEmoji, createGatedInput, fireVaelAction, RESUMEN_LABELS, formatearValor } from './unidad-widgets/shared';
import { stopSpeaking } from './speech';

type Screen = 'portada' | 'mision' | 'palabras' | 'investiga' | 'crea' | 'detective' | 'familia' | 'comparte' | 'cierre';

// 7 puntos visibles en la barra de progreso (Portada y Cierre son estados, no pasos).
const PROGRESS_SCREENS: Screen[] = ['mision', 'palabras', 'investiga', 'crea', 'detective', 'familia', 'comparte'];

// Estado de "retomar donde ibas": si el niño cierra a mitad de misión
// (merienda, fin de sesión...), al volver puede continuar en su pantalla.
// Vive solo en localStorage (transitorio, por hijo y unidad) — no se
// sincroniza a la nube a propósito.
interface ResumeState {
    screen: Screen;
    investigaResultado: Record<string, any> | null;
    artifactId: string | null;
    savedAt: number;
}

export class UnidadEngine {
    private unidad: UnidadAventuraSchema;
    private container: HTMLElement;
    private childId: string;
    private investigaResultado: Record<string, any> | null = null;
    private artifactId: string | null = null;
    // Chispas ganadas en ESTA pasada (doc 04 §3.1). No se persiste en el
    // resume state a propósito: el ledger es la fuente de verdad y su
    // índice único hace que retomar/rejugar no dupliquen recompensas.
    private chispasGanadas = 0;
    private insigniaRecienGanada = false;

    private async otorgarChispas(tipo: import('./chispas-service').EventoTipo, refId: string, cantidad: number) {
        if (!this.childId) return;
        const { otorgadas } = await ChispasService.logEvent(this.childId, tipo, refId, cantidad);
        this.chispasGanadas += otorgadas;
    }

    constructor(unidad: UnidadAventuraSchema, containerId: string) {
        this.unidad = unidad;
        this.container = document.getElementById(containerId) as HTMLElement;
        this.childId = activeChild.get() || '';
        this.setupScrollReset();
        this.init();
    }

    // Bug de "saltos al responder": no solo las pantallas (renderScreen)
    // reemplazan su contenido — también los widgets de Investiga re-renderizan
    // por dentro (elegir tarjeta, revelar pista, siguiente pregunta…). Al
    // sustituir contenido más corto que el anterior, el navegador recorta la
    // posición de scroll de forma inconsistente y parece dar saltos. Un único
    // observador lleva la vista al inicio de la misión ante CUALQUIER
    // re-render de contenido dentro de la etapa, así el flujo es continuo.
    private setupScrollReset() {
        if (typeof MutationObserver === 'undefined') return;
        const obs = new MutationObserver(mutaciones => {
            // Solo re-renders de contenido (nodos añadidos), no cambios de
            // clase (showFeedback) ni las partículas de celebración (que van
            // a un overlay fuera de la etapa). Se llama directo (no en rAF):
            // el nodo ya está en el DOM y así funciona aunque la pestaña no
            // esté componiendo frames. Varias llamadas seguidas son inocuas
            // (mismo destino).
            if (mutaciones.some(m => m.addedNodes.length > 0)) this.scrollToTop();
        });
        obs.observe(this.container, { childList: true, subtree: true });
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
        const link = el('a', 'k-btn k-btn--primary k-btn--lg', 'Volver al Mapa');
        link.setAttribute('href', '/mapa');
        this.container.appendChild(link);
    }

    // Pantallas de progreso reales de ESTA unidad: el programa 10-11 no
    // define Palabras Poderosas por reto (es una mecánica del 8-9), así que
    // si la unidad no trae palabras esa pantalla no existe — ni en la barra
    // ni en la secuencia (ver renderPalabras/renderMision).
    private progressScreens(): Screen[] {
        return this.unidad.palabras.length > 0
            ? PROGRESS_SCREENS
            : PROGRESS_SCREENS.filter(s => s !== 'palabras');
    }

    private updateProgress(screen: Screen) {
        const screens = this.progressScreens();
        window.dispatchEvent(new CustomEvent('unidad:step', {
            detail: { screen, index: screens.indexOf(screen), total: screens.length },
        }));
    }

    // --- Persistencia "retomar donde ibas" ---

    private resumeKey(): string {
        return `kidia-unidad-resume-${this.childId || 'anon'}-${this.unidad.id}`;
    }

    private saveResumeState(screen: Screen) {
        if (typeof localStorage === 'undefined') return;
        try {
            if (screen === 'portada') return;
            if (screen === 'cierre') {
                localStorage.removeItem(this.resumeKey());
                return;
            }
            const state: ResumeState = {
                screen,
                investigaResultado: this.investigaResultado,
                artifactId: this.artifactId,
                savedAt: Date.now(),
            };
            localStorage.setItem(this.resumeKey(), JSON.stringify(state));
        } catch { /* almacenamiento lleno o bloqueado: retomar es opcional */ }
    }

    private loadResumeState(): ResumeState | null {
        if (typeof localStorage === 'undefined') return null;
        try {
            const raw = localStorage.getItem(this.resumeKey());
            if (!raw) return null;
            const parsed = JSON.parse(raw) as ResumeState;
            if (!this.progressScreens().includes(parsed.screen)) return null;
            // "Crea" sin resultado de investiga no puede reconstruirse: se
            // retoma desde investiga.
            if (parsed.screen === 'crea' && !parsed.investigaResultado) {
                parsed.screen = 'investiga';
            }
            return parsed;
        } catch {
            return null;
        }
    }

    private clearResumeState() {
        if (typeof localStorage === 'undefined') return;
        try { localStorage.removeItem(this.resumeKey()); } catch { /* ídem */ }
    }

    private renderScreen(screen: Screen) {
        stopSpeaking();
        this.saveResumeState(screen);
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

        // Cada pantalla arranca desde su inicio (bug de "saltos"): sin esto,
        // al pasar de una pantalla larga —donde el niño hizo scroll para
        // responder— a otra más corta, el navegador recorta la posición de
        // scroll de forma inconsistente y el contenido parece dar saltos.
        // Llevar la vista al principio de la misión hace el flujo continuo.
        this.scrollToTop();
    }

    private scrollToTop() {
        if (typeof window === 'undefined') return;
        // Al inicio de la unidad, no al top absoluto de la página: así el
        // header sticky no tapa nada y se ve la cabecera de Vael + progreso.
        const layout = this.container.closest('.ua-layout') as HTMLElement | null;
        const top = layout ? layout.getBoundingClientRect().top + window.scrollY - 12 : 0;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    }

    private continueButton(label: string, onClick: () => void): HTMLButtonElement {
        const btn = el('button', 'k-btn k-btn--primary k-btn--xl ua-continue', label);
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

        // Si dejó la misión a medias, ofrecer retomarla donde estaba.
        const saved = this.loadResumeState();
        if (saved) {
            this.container.appendChild(el('p', 'ua-vael-texto', 'Dejaste esta misión a medias. ¿Seguimos donde estabas?'));
            this.container.appendChild(this.continueButton('Seguir donde lo dejé →', () => {
                this.investigaResultado = saved.investigaResultado;
                this.artifactId = saved.artifactId;
                this.renderScreen(saved.screen);
            }));
            const restart = el('button', 'k-btn k-btn--ghost k-btn--md', 'Empezar desde el principio');
            restart.setAttribute('type', 'button');
            restart.addEventListener('click', () => {
                this.clearResumeState();
                this.investigaResultado = null;
                this.artifactId = null;
                this.renderScreen('mision');
            });
            this.container.appendChild(restart);
            return;
        }

        this.container.appendChild(this.continueButton('Empezar misión →', () => this.renderScreen('mision')));
    }

    private renderMision() {
        fireVaelAction('talk');
        this.container.appendChild(el('p', 'ua-eyebrow', 'La misión'));
        this.container.appendChild(el('p', 'ua-vael-texto', this.unidad.web.introVael));

        // Morti (12-14): su intervención aparece tras la de Vael, con voz y
        // color propios (morado, como marca el docx) — es el detonante ético.
        if (this.unidad.morti) {
            const bloque = el('div', 'ua-morti');
            bloque.appendChild(el('span', 'ua-morti-nombre', 'Morti'));
            bloque.appendChild(el('p', 'ua-morti-texto', this.unidad.morti.texto));
            this.container.appendChild(bloque);
        }

        this.container.appendChild(this.continueButton('¡Vamos! →', () => {
            // Sin palabras que coleccionar (programa 10-11/12-14): directo a investigar.
            this.renderScreen(this.unidad.palabras.length > 0 ? 'palabras' : 'investiga');
        }));
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
                await this.otorgarChispas('palabras_coleccionadas', this.unidad.id, this.unidad.palabras.length * CHISPAS.palabras_coleccionadas);
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
            case 'dos_respuestas_verifica':
                mountDosRespuestasVerifica(widgetContainer, investiga, onDone);
                break;
            case 'verificacion_cruzada':
                mountVerificacionCruzada(widgetContainer, investiga, onDone);
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
                if (this.childId) {
                    const { data, error } = await UnidadService.saveArtifact(
                        this.childId,
                        this.unidad.id,
                        this.unidad.crea.tipo,
                        { ...this.investigaResultado, tituloArtefacto: titulo },
                        this.unidad.dependeDe || []
                    );
                    // Error amable (doc 02 §3): si no se pudo guardar, el niño
                    // no avanza a ciegas — puede reintentar con el mismo input.
                    if (error || !data) {
                        fireVaelAction('think');
                        const { showToast } = await import('./toast');
                        showToast('¡Ups! Mi laboratorio ha hecho puf y no guardó tu creación. Prueba otra vez.', { variant: 'danger' });
                        return;
                    }
                    this.artifactId = data.id;
                }
                fireVaelAction('celebrate');
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
            stopSpeaking();
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
                // El bonus más alto del sistema: co-jugar es lo que más se premia.
                await this.otorgarChispas('mision_familia', this.unidad.id, CHISPAS.mision_familia);
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
                await this.otorgarChispas('creacion_publicada', this.unidad.id, CHISPAS.creacion_publicada);
            }
            if (this.childId && this.unidad.comparte.insigniaPosible) {
                // Señal de "primera vez" para la celebración del cierre:
                // independiente del ledger de chispas (que puede no estar
                // migrado aún) — lo que importa es si la insignia es nueva.
                this.insigniaRecienGanada = !storage.hasBadge(this.unidad.comparte.insigniaPosible.id);
                await UnidadService.awardBadge(this.childId, this.unidad.comparte.insigniaPosible.id);
                await this.otorgarChispas('insignia_ganada', this.unidad.comparte.insigniaPosible.id, CHISPAS.insignia_ganada);
            }
            await this.otorgarChispas('mision_completada', this.unidad.id, CHISPAS.mision_completada);
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

        // Celebración unificada (doc 04 §5): media al completar la misión;
        // grande si además cayó una insignia o una subida de nivel.
        const insignia = this.unidad.comparte.insigniaPosible;

        // Recompensa inmediata visible (doc 04 §2): solo si el ledger otorgó
        // algo de verdad — en un replay (chispas ya ganadas) o sin la
        // migración 006 pegada, no se enseña nada en vez de mentir.
        if (this.chispasGanadas > 0) {
            const box = el('div', 'ua-chispas-box');
            box.appendChild(el('span', 'ua-chispas-num', `⚡ +${this.chispasGanadas} chispas`));
            this.container.appendChild(box);

            if (this.childId) {
                ChispasService.getTotalChispas(this.childId).then(total => {
                    const nivel = nivelInventor(total);
                    const linea = el('p', 'ua-chispas-nivel', `${nivel.icono} ${nivel.nombre} · ${total} chispas en total`);
                    if (nivel.siguiente) {
                        linea.textContent += ` · a ${nivel.siguiente.faltan} de ${nivel.siguiente.nombre}`;
                    }
                    box.appendChild(linea);

                    // ¿Estas chispas cruzaron un umbral de nivel? → grande.
                    const nivelAntes = nivelInventor(total - this.chispasGanadas);
                    if (nivelAntes.nombre !== nivel.nombre) {
                        celebrate('grande', { mensaje: `${nivel.icono} ¡Ahora eres ${nivel.nombre}!` });
                    }
                });
            }
        }

        if (insignia && this.insigniaRecienGanada) {
            // Grande solo la primera vez que se gana ESTA insignia — la señal
            // viene de storage (badges), no del ledger de chispas: funciona
            // igual aunque la migración 006 no esté aplicada.
            celebrate('grande', { mensaje: `${insignia.icon} ¡Insignia: ${insignia.name}!` });
        } else {
            celebrate('media');
        }

        const link = el('a', 'k-btn k-btn--primary k-btn--lg', 'Volver al Mapa');
        link.setAttribute('href', '/mapa');
        this.container.appendChild(link);
    }
}
