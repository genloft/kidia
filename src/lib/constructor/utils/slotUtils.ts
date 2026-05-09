import type { SlotCategory } from '../types';

export function getSlotColor(slot: SlotCategory | string): string {
    switch (slot) {
        case "Datos":
            return "var(--color-1)";
        case "Cerebro":
            return "var(--color-2)";
        case "Entrenamiento":
            return "var(--color-3)";
        case "Examen":
            return "var(--color-4)";
        case "Salida":
            return "var(--color-5)";
        default:
            return "var(--border-stone)";
    }
}

export function getSlotEmoji(slot: SlotCategory | string): string {
    switch (slot) {
        case "Datos":
            return "📦";
        case "Cerebro":
            return "🧠";
        case "Entrenamiento":
            return "🏋️";
        case "Examen":
            return "📝";
        case "Salida":
            return "🚀";
        default:
            return "❓";
    }
}
