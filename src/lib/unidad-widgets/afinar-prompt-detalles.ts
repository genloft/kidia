// Widget para investiga.tipo === 'afinar_prompt_detalles' (2.1: prompt flojo
// + detalles uno a uno; 3.3: imagen por capas — misma mecánica de "añade un
// elemento, regenera, compara" repetida sobre un banco cerrado).

import type { AfinarPromptDetallesInvestiga } from '../../schemas/unidad';
import { el, createGatedInput, fireVaelAction } from './shared';

export interface AfinarPromptResultado {
    promptFinal: string;
    detallesAnadidos: string[];
    detalleClave: string;
}

export function mountAfinarPromptDetalles(
    container: HTMLElement,
    data: AfinarPromptDetallesInvestiga,
    onComplete: (resultado: AfinarPromptResultado) => void
): void {
    const anadidos: typeof data.banco = [];
    let disponibles = [...data.banco];

    render();

    function promptActual(): string {
        return [data.promptBase, ...anadidos.map(d => d.label)].join(', ');
    }

    function render() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', 'Prompt actual:'));
        container.appendChild(el('p', 'ua-prompt-preview', `"${promptActual()}"`));

        if (anadidos.length > 0) {
            const imgCard = el('div', 'ua-imagen-compuesta');
            imgCard.style.setProperty('--ua-tint', '#8b5cf6');
            imgCard.appendChild(el('span', 'ua-imagen-animal', '🖼️'));
            imgCard.appendChild(el('span', 'ua-imagen-caption', `${anadidos.length} detalle(s) añadido(s)`));
            container.appendChild(imgCard);
        }

        if (disponibles.length === 0) {
            renderPreguntaClave();
            return;
        }

        container.appendChild(el('p', 'ua-chip-label', 'Añade un detalle más:'));
        const grid = el('div', 'ua-bank-grid');
        disponibles.forEach(d => {
            const btn = el('button', 'ua-bank-card', d.label);
            btn.type = 'button';
            btn.addEventListener('click', () => {
                anadidos.push(d);
                disponibles = disponibles.filter(x => x.id !== d.id);
                fireVaelAction('smile');
                render();
            });
            grid.appendChild(btn);
        });
        container.appendChild(grid);

        if (anadidos.length >= 1) {
            const paraBtn = el('button', 'k-btn k-btn--secondary k-btn--lg', 'Ya tengo suficiente →');
            paraBtn.type = 'button';
            paraBtn.addEventListener('click', renderPreguntaClave);
            container.appendChild(paraBtn);
        }
    }

    function renderPreguntaClave() {
        container.innerHTML = '';
        fireVaelAction('think');
        container.appendChild(el('p', 'ua-prompt', data.preguntaClave));
        const input = createGatedInput({
            placeholder: 'Creo que fue...',
            onAccepted: (texto) => {
                fireVaelAction('celebrate');
                onComplete({ promptFinal: promptActual(), detallesAnadidos: anadidos.map(d => d.label), detalleClave: texto });
            },
        });
        container.appendChild(input);
    }
}
