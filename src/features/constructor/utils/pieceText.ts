// Texto de una pieza según el tramo de edad.
//
// Prioridad: vocabulario del tramo → traducción i18n → texto original del
// catálogo. "Capas Ocultas" o "Regularización (Dropout)" no significan nada
// a los 8 años, así que las piezas compartidas entre tramos llevan un nombre
// adaptado (ver data/pieces.ts).

import type { Piece } from '../types';
import type { TramoId } from '../../../lib/tramos';

type Dict = { pieces?: Record<string, { name?: string; tooltip?: string; curiousFact?: string }> };

export function pieceName(piece: Piece, tramo: TramoId, t?: Dict): string {
    return piece.nameByTramo?.[tramo] || t?.pieces?.[piece.id]?.name || piece.name;
}

export function pieceTooltip(piece: Piece, tramo: TramoId, t?: Dict): string {
    return piece.tooltipByTramo?.[tramo] || t?.pieces?.[piece.id]?.tooltip || piece.tooltip;
}

// El dato curioso no se adapta por tramo (todavía): se mantiene la firma
// homogénea con las otras dos para que los componentes las usen igual.
export function pieceCuriousFact(piece: Piece, _tramo: TramoId, t?: Dict): string {
    return t?.pieces?.[piece.id]?.curiousFact || piece.curiousFact;
}
