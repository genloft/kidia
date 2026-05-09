import { writable } from 'svelte/store';

interface TooltipData {
    text: string;
    x: number;
    y: number;
    visible: boolean;
}

export const tooltipStore = writable<TooltipData>({
    text: '',
    x: 0,
    y: 0,
    visible: false
});

export function showTooltip(text: string, event: MouseEvent | FocusEvent) {
    let x = 0;
    let y = 0;

    if (event instanceof MouseEvent) {
        x = event.clientX;
        y = event.clientY;
    } else if (event.target instanceof HTMLElement) {
        const rect = event.target.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top;
    }

    tooltipStore.set({ text, x, y, visible: true });
}

export function hideTooltip() {
    tooltipStore.update(state => ({ ...state, visible: false }));
}
