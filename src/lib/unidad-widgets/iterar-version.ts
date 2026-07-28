// Widget para investiga.tipo === 'iterar_version' (3.4 de ambos tramos).
// 8-9 (default): una iteración v1→v2 y la pregunta "¿harías una v3?".
// 10-11 (iteraciones: 2, pideMotivo: true — ficha «De la v1 a la v3»): dos
// iteraciones documentadas, cada cambio con su porqué, y elección final de
// la versión favorita con criterio.

import type { IterarVersionInvestiga } from '../../schemas/unidad';
import { el, createGatedInput, fireVaelAction } from './shared';

export interface IterarResultado {
    cambioElegido: string;
    quiereV3: boolean;
}

export interface IterarDobleResultado {
    cambiosRealizados: string[];
    versionFavorita: string;
}

const TINTES = ['#64748b', '#8b5cf6', '#22d3ee'];
const ICONOS = ['🖼️', '✨', '🌟'];

export function mountIterarVersion(
    container: HTMLElement,
    data: IterarVersionInvestiga,
    onComplete: (resultado: IterarResultado | IterarDobleResultado) => void
): void {
    const totalIteraciones = data.iteraciones ?? 1;
    const cambios: string[] = [];
    let restantes = [...data.cambiosPosibles];

    renderEleccion();

    function versionActual(): number {
        return cambios.length + 1; // v1 es la creación original
    }

    function renderEleccion() {
        container.innerHTML = '';
        const v = versionActual();
        container.appendChild(el('p', 'ua-prompt', v === 1
            ? 'Elige una creación tuya de antes y piensa UNA cosa para mejorar.'
            : `Versión ${v} lista. Cambia OTRA cosa (con intención) para la versión ${v + 1}.`));

        const grid = el('div', 'ua-bank-grid');
        restantes.forEach(c => {
            const btn = el('button', 'ua-bank-card', c.label);
            btn.type = 'button';
            btn.addEventListener('click', () => {
                restantes = restantes.filter(x => x.id !== c.id);
                if (data.pideMotivo) renderMotivo(c);
                else registrarCambio(c.label);
            });
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    }

    function renderMotivo(cambio: IterarVersionInvestiga['cambiosPosibles'][number]) {
        container.innerHTML = '';
        container.appendChild(el('p', 'ua-prompt', `Vas a cambiar: "${cambio.label}". Anota POR QUÉ (los inventores apuntan sus motivos).`));
        const input = createGatedInput({
            placeholder: 'Lo cambio porque...',
            onAccepted: (motivo) => registrarCambio(`${cambio.label} (porque ${motivo})`),
        });
        container.appendChild(input);
    }

    function registrarCambio(descripcion: string) {
        cambios.push(descripcion);
        if (cambios.length < totalIteraciones) {
            fireVaelAction('happy');
            renderEleccion();
        } else {
            renderComparacion();
        }
    }

    function renderComparacion() {
        container.innerHTML = '';
        fireVaelAction('celebrate');

        const compareRow = el('div', 'ua-choice-row');
        for (let i = 0; i <= cambios.length; i++) {
            const caja = el('div', 'ua-imagen-compuesta');
            caja.style.setProperty('--ua-tint', TINTES[i] ?? TINTES[TINTES.length - 1]);
            caja.appendChild(el('span', 'ua-imagen-animal', ICONOS[i] ?? '🌟'));
            caja.appendChild(el('span', 'ua-imagen-caption', i === 0 ? 'Versión 1' : `Versión ${i + 1} (${cambios[i - 1]})`));
            compareRow.appendChild(caja);
        }
        container.appendChild(compareRow);

        if (totalIteraciones === 1) {
            // Flujo 8-9 original: ¿quieres una v3?
            container.appendChild(el('p', 'ua-prompt', '¿Harías una versión 3?'));
            const row = el('div', 'ua-choice-row');
            const siBtn = el('button', 'k-btn k-btn--secondary k-btn--lg', 'Sí, otra mejora más');
            siBtn.type = 'button';
            siBtn.addEventListener('click', () => onComplete({ cambioElegido: cambios[0], quiereV3: true }));
            const noBtn = el('button', 'k-btn k-btn--primary k-btn--lg', 'No, esta ya me gusta');
            noBtn.type = 'button';
            noBtn.addEventListener('click', () => onComplete({ cambioElegido: cambios[0], quiereV3: false }));
            row.appendChild(siBtn);
            row.appendChild(noBtn);
            container.appendChild(row);
            return;
        }

        // Flujo 10-11: elegir la favorita con criterio.
        container.appendChild(el('p', 'ua-prompt', 'Las tres juntas: ¿cuál es tu favorita y por qué?'));
        const row = el('div', 'ua-choice-row');
        for (let i = 0; i <= cambios.length; i++) {
            const btn = el('button', 'k-btn k-btn--secondary k-btn--lg', `Versión ${i + 1}`);
            btn.type = 'button';
            btn.addEventListener('click', () => {
                fireVaelAction('celebrate');
                onComplete({ cambiosRealizados: cambios, versionFavorita: `Versión ${i + 1}` });
            });
            row.appendChild(btn);
        }
        container.appendChild(row);
    }
}
