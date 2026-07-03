// Widget "Investiga con Vael" para investiga.tipo === 'construir_prompt_imagen'.
// Reutilizado por 1.3 (animal+color+acción) y 3.1 (criatura por
// color+tamaño+rareza+acción): el niño arma un prompt eligiendo un chip por
// categoría (+ un detalle libre opcional) y "lanza el hechizo". El resultado
// es una ilustración compuesta en el momento (icono + color + pose), NO una
// llamada real a un generador de imágenes — ver nota en src/lib/moderation.ts
// sobre por qué esta unidad no llama a un modelo en esta fase.

import type { ConstruirPromptImagenInvestiga, ChipOpcion } from '../../schemas/unidad';
import { el, createGatedInput, iconEmoji, fireVaelAction } from './shared';

export interface PromptImagenResultado {
    promptFinal: string;
    eleccion: Record<string, string>; // label de categoría -> label de chip elegido
    detalleLibre?: string;
}

// Iconos disponibles para representar el resultado; si el valor elegido no
// coincide con ningún icono conocido, cae a un emoji genérico.
function iconoParaEleccion(eleccion: Record<string, string>): string {
    for (const valor of Object.values(eleccion)) {
        const key = valor.toLowerCase();
        if (['gato', 'perro', 'dragon', 'unicornio', 'pajaro'].includes(key)) return iconEmoji(key);
    }
    return '🐾';
}

export function mountConstruirPromptImagen(
    container: HTMLElement,
    data: ConstruirPromptImagenInvestiga,
    onComplete: (resultado: PromptImagenResultado) => void
): void {
    const seleccion: Record<string, ChipOpcion> = {};
    data.categorias.forEach(cat => { seleccion[cat.label] = cat.opciones[0]; });
    let detalleLibre = '';
    let primeraGeneracion: Record<string, ChipOpcion> | null = null;

    renderConstructor();

    function chipRow(cat: ConstruirPromptImagenInvestiga['categorias'][number], opciones = cat.opciones): HTMLElement {
        const wrap = el('div', 'ua-chip-group');
        wrap.appendChild(el('p', 'ua-chip-label', cat.label));
        const row = el('div', 'ua-chip-row');
        opciones.forEach(op => {
            const btn = el('button', `ua-chip${op.id === seleccion[cat.label]?.id ? ' selected' : ''}`, op.label);
            btn.type = 'button';
            btn.addEventListener('click', () => { seleccion[cat.label] = op; renderConstructor(); });
            row.appendChild(btn);
        });
        wrap.appendChild(row);
        return wrap;
    }

    function promptTexto(): string {
        const partes = data.categorias.map(cat => seleccion[cat.label].label.toLowerCase());
        return partes.join(', ') + (detalleLibre ? ', ' + detalleLibre : '');
    }

    function renderConstructor() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', 'Elige un chip de cada categoría para formar tu hechizo.'));

        data.categorias.forEach(cat => container.appendChild(chipRow(cat)));

        if (data.permiteDetalleLibre) {
            const detalleWrap = el('div', 'ua-chip-group');
            detalleWrap.appendChild(el('p', 'ua-chip-label', 'Detalle extra (opcional)'));
            detalleWrap.appendChild(createGatedInput({
                placeholder: 'Añade una palabra tuya...',
                onAccepted: (texto) => { detalleLibre = texto; },
            }));
            container.appendChild(detalleWrap);
        }

        container.appendChild(el('p', 'ua-prompt-preview', `Tu hechizo: "${promptTexto()}"`));

        const lanzarBtn = el('button', 'btn btn-primary', 'Lanza tu hechizo ✨');
        lanzarBtn.type = 'button';
        lanzarBtn.addEventListener('click', renderResultado);
        container.appendChild(lanzarBtn);
    }

    function renderImagenCompuesta(): HTMLElement {
        const card = el('div', 'ua-imagen-compuesta');
        const colorCat = data.categorias.find(c => c.label.toLowerCase().includes('color'));
        const accionCat = data.categorias.find(c => c.label.toLowerCase().includes('acci'));
        const tint = colorCat ? seleccion[colorCat.label]?.valor : '#8b5cf6';
        const accionId = accionCat ? seleccion[accionCat.label]?.id : '';
        card.style.setProperty('--ua-tint', tint || '#8b5cf6');
        const animalSpan = el('span', `ua-imagen-animal ua-pose-${accionId}`, iconoParaEleccion(Object.fromEntries(Object.entries(seleccion).map(([k, v]) => [k, v.id]))));
        card.appendChild(animalSpan);
        card.appendChild(el('span', 'ua-imagen-caption', promptTexto()));
        return card;
    }

    function renderResultado() {
        container.innerHTML = '';
        fireVaelAction('celebrate');
        container.appendChild(el('p', 'ua-prompt', `¡Aquí está! "${promptTexto()}"`));
        container.appendChild(renderImagenCompuesta());

        if (data.comparaCambiandoUna && !primeraGeneracion) {
            primeraGeneracion = { ...seleccion };
            const primeraCat = data.categorias[0];
            const cambiarBtn = el('button', 'btn btn-secondary', `Cambia SOLO "${primeraCat.label}" y vuelve a lanzarlo →`);
            cambiarBtn.type = 'button';
            cambiarBtn.addEventListener('click', () => {
                container.innerHTML = '';
                container.appendChild(el('p', 'ua-prompt', `Elige otro/a ${primeraCat.label.toLowerCase()} (deja lo demás igual).`));
                container.appendChild(chipRow(primeraCat, primeraCat.opciones.filter(o => o.id !== primeraGeneracion![primeraCat.label].id)));
                const seguirBtn = el('button', 'btn btn-primary', 'Volver a lanzar →');
                seguirBtn.type = 'button';
                seguirBtn.addEventListener('click', renderResultado);
                container.appendChild(seguirBtn);
            });
            container.appendChild(cambiarBtn);
            return;
        }

        const seguirBtn = el('button', 'btn btn-primary', 'Guardar mi creación →');
        seguirBtn.type = 'button';
        seguirBtn.addEventListener('click', () => {
            const eleccionLabels: Record<string, string> = {};
            Object.entries(seleccion).forEach(([k, v]) => { eleccionLabels[k] = v.label; });
            onComplete({ promptFinal: promptTexto(), eleccion: eleccionLabels, detalleLibre: detalleLibre || undefined });
        });
        container.appendChild(seguirBtn);
    }
}
