// Widget para investiga.tipo === 'presentar_creacion' (4.4): repaso del
// Cuaderno y preparación de la presentación final (tres frases guiadas).

import type { PresentarCreacionInvestiga } from '../../schemas/unidad';
import { el, createGatedInput, fireVaelAction } from './shared';
import { UnidadService } from '../unidad-service';

export interface PresentarResultado {
    respuestas: string[];
    totalCreaciones: number;
}

export async function mountPresentarCreacion(
    container: HTMLElement,
    data: PresentarCreacionInvestiga,
    onComplete: (resultado: PresentarResultado) => void,
    childId: string
): Promise<void> {
    const cuaderno = childId ? await UnidadService.getCuaderno(childId) : [];
    const respuestas: string[] = [];
    let indice = 0;

    renderIntro();

    function renderIntro() {
        container.innerHTML = '';
        if (cuaderno.length === 0) {
            container.appendChild(el('p', 'ua-pista-texto', 'Tu Cuaderno de Inventor/a todavía se está llenando — sigue creando y aquí aparecerán tus creaciones.'));
        } else {
            container.appendChild(el('p', 'ua-prompt', `Tu Cuaderno tiene ${cuaderno.length} creación(es). Repásalas y elige tu favorita.`));
            const grid = el('div', 'ua-bank-grid');
            cuaderno.forEach(a => {
                grid.appendChild(el('div', 'ua-palabra-card', String(a.contenido?.tituloArtefacto || a.tipo)));
            });
            container.appendChild(grid);
        }
        const seguirBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'Preparar mi presentación →');
        seguirBtn.type = 'button';
        seguirBtn.addEventListener('click', renderPregunta);
        container.appendChild(seguirBtn);
    }

    function renderPregunta() {
        container.innerHTML = '';
        if (indice >= data.preguntasGuia.length) {
            fireVaelAction('celebrate');
            onComplete({ respuestas, totalCreaciones: cuaderno.length });
            return;
        }
        fireVaelAction('smile');
        container.appendChild(el('p', 'ua-prompt', data.preguntasGuia[indice]));
        container.appendChild(createGatedInput({
            placeholder: 'Mi respuesta...',
            onAccepted: (texto) => {
                respuestas.push(texto);
                indice++;
                renderPregunta();
            },
        }));
    }
}
