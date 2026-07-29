// Tramo de edad del hijo/a activo, para adaptar el Constructor.
//
// Antes el Constructor era agnóstico a la edad: a un niño de 8 años se le
// ofrecían igualmente "Regularización (Dropout)", "Capa Softmax" y "Modelo
// Transformer". Aquí se resuelve el tramo real y el resto del juego (piezas,
// huecos, etapas y vocabulario) se adapta a él.

import { writable, get } from 'svelte/store';
import type { TramoId } from '../../../lib/tramos';
import { TRAMO_POR_DEFECTO } from '../logic/tramo-config';

export const tramo = writable<TramoId>(TRAMO_POR_DEFECTO);

let yaResuelto = false;

/**
 * Resuelve el tramo a partir del hijo/a activo. Si no hay sesión o hijo/a
 * (p. ej. una visita pública a /constructor), se queda en el tramo por
 * defecto, que ofrece la experiencia completa.
 */
export async function initTramo(): Promise<void> {
    if (yaResuelto || typeof window === 'undefined') return;
    yaResuelto = true;

    try {
        const [{ activeChild }, { ChildrenService }, { tramoForChild }] = await Promise.all([
            import('../../../lib/active-child'),
            import('../../../lib/children-service'),
            import('../../../lib/tramos')
        ]);

        const childId = activeChild.get();
        if (!childId) return;

        const children = await ChildrenService.listChildren();
        const current = children.find(c => c.id === childId);
        if (!current) return;

        const t = tramoForChild(current.birth_date);
        if (t) tramo.set(t.id);
    } catch (error) {
        // Sin tramo resuelto el juego sigue siendo jugable en su versión
        // completa; no tiene sentido romper la pantalla por esto.
        console.error('No se pudo resolver el tramo del hijo/a activo:', error);
    }
}

export function getTramo(): TramoId {
    return get(tramo);
}
