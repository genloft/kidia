// Widget para investiga.tipo === 'montar_libro' (4.2): reúne portada + páginas
// + página final, apoyándose en las creaciones previas del Cuaderno
// (dependeDe: 3.1, 3.2). El niño confirma cada página con una nota breve.

import type { MontarLibroInvestiga } from '../../schemas/unidad';
import { el, createGatedInput, fireVaelAction } from './shared';

export interface LibroResultado {
    paginas: Record<string, string>;
}

export function mountMontarLibro(
    container: HTMLElement,
    data: MontarLibroInvestiga,
    onComplete: (resultado: LibroResultado) => void
): void {
    const paginas: Record<string, string> = {};
    let indice = 0;

    render();

    function render() {
        container.innerHTML = '';

        if (indice >= data.estructuraSugerida.length) {
            fireVaelAction('celebrate');
            const resumen = el('div', 'ua-resumen-box');
            data.estructuraSugerida.forEach(p => {
                resumen.appendChild(el('p', 'ua-resumen-row', `${p}: ${paginas[p]}`));
            });
            container.appendChild(resumen);
            const continuarBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'Hojear mi libro →');
            continuarBtn.type = 'button';
            continuarBtn.addEventListener('click', () => onComplete({ paginas }));
            container.appendChild(continuarBtn);
            return;
        }

        const pagina = data.estructuraSugerida[indice];
        container.appendChild(el('p', 'ua-prompt', `${pagina}: ¿qué va aquí?`));
        container.appendChild(createGatedInput({
            placeholder: pagina === 'Portada' ? 'Título de mi libro...' : 'Qué pasa en esta página...',
            onAccepted: (texto) => {
                paginas[pagina] = texto;
                indice++;
                render();
            },
        }));
    }
}
