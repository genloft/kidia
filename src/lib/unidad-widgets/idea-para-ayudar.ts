// Widget para investiga.tipo === 'idea_para_ayudar' (4.3).

import type { IdeaParaAyudarInvestiga } from '../../schemas/unidad';
import { el, createGatedInput, fireVaelAction } from './shared';

export interface IdeaResultado {
    destinatario: string;
    necesidad: string;
    idea: string;
}

export function mountIdeaParaAyudar(
    container: HTMLElement,
    data: IdeaParaAyudarInvestiga,
    onComplete: (resultado: IdeaResultado) => void
): void {
    renderDestinatario();

    function renderDestinatario() {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', '¿A quién te gustaría ayudar?'));
        const grid = el('div', 'ua-bank-grid');
        data.destinatarios.forEach(d => {
            const btn = el('button', 'ua-bank-card', d.label);
            btn.type = 'button';
            btn.addEventListener('click', () => renderNecesidad(d.label, d.id));
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    }

    function renderNecesidad(destinatarioLabel: string, destinatarioId: string) {
        container.innerHTML = '';
        fireVaelAction('think');
        container.appendChild(el('p', 'ua-prompt', `¿Qué necesita ${destinatarioLabel.toLowerCase()}?`));
        const opciones = data.necesidadesPorDestinatario[destinatarioId] || [];
        const grid = el('div', 'ua-bank-grid');
        opciones.forEach(n => {
            const btn = el('button', 'ua-bank-card', n.label);
            btn.type = 'button';
            btn.addEventListener('click', () => renderIdea(destinatarioLabel, n.label));
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    }

    function renderIdea(destinatarioLabel: string, necesidadLabel: string) {
        container.innerHTML = '';
        fireVaelAction('smile');
        container.appendChild(el('p', 'ua-prompt', `Inventa una idea sencilla para dar "${necesidadLabel.toLowerCase()}" a ${destinatarioLabel.toLowerCase()}.`));
        container.appendChild(createGatedInput({
            placeholder: 'Mi idea es...',
            onAccepted: (idea) => {
                fireVaelAction('celebrate');
                onComplete({ destinatario: destinatarioLabel, necesidad: necesidadLabel, idea });
            },
        }));
    }
}
