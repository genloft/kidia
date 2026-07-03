// Utilidades DOM compartidas por los widgets de "Investiga con Vael".
// Mismo patrón de construcción manual de DOM que game-engine.ts, para no
// introducir una dependencia nueva (React/Svelte) solo para este módulo.

import { moderationGate, mensajeRedireccionVael } from '../moderation';

export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

export function fireVaelAction(action: string) {
    window.dispatchEvent(new CustomEvent('kidia:action', { detail: { action } }));
}

/** Tarjeta seleccionable de un banco cerrado (objeto/ejemplo/frase/chip). */
export function createBankCard(opts: { icono?: string; label: string; onClick: () => void }): HTMLButtonElement {
    const btn = el('button', 'ua-bank-card');
    btn.type = 'button';
    if (opts.icono) {
        const iconSpan = el('span', 'ua-bank-card-icon', iconEmoji(opts.icono));
        btn.appendChild(iconSpan);
    }
    btn.appendChild(el('span', 'ua-bank-card-label', opts.label));
    btn.addEventListener('click', opts.onClick);
    return btn;
}

// Mapeo simple de nombres de icono (definidos en el JSON de contenido) a
// un emoji visible. Suficiente para el MVP; sustituible por un set de
// iconos SVG propio más adelante sin tocar el contenido.
const ICON_MAP: Record<string, string> = {
    brain: '🧠', book: '📖', code: '💻', speaker: '🔊', thermometer: '🌡️',
    video: '📺', calculator: '🧮', microphone: '🎙️', tag: '🏷️', dumbbell: '🏋️',
    database: '🗄️', shapes: '🔷', bird: '🐦', plane: '✈️', dog: '🐶', fish: '🐟',
    bug: '🐝', sparkles: '✨', type: '🔤', search: '🔍', image: '🖼️',
    'alert-triangle': '⚠️', wand: '🪄', 'check-circle': '✅',
    gato: '🐱', perro: '🐶', dragon: '🐉', unicornio: '🦄', pajaro: '🐦',
};

export function iconEmoji(icono: string): string {
    return ICON_MAP[icono] || '❔';
}

/**
 * Fila de entrada libre (texto, con botón de "hablar" preparado para voz)
 * que SIEMPRE pasa por moderationGate antes de llamar a onAccepted.
 */
export function createGatedInput(opts: {
    placeholder: string;
    onAccepted: (texto: string) => void;
}): HTMLElement {
    const wrap = el('div', 'ua-gated-input');
    const input = el('input', 'ua-gated-input-field');
    input.type = 'text';
    input.placeholder = opts.placeholder;
    input.setAttribute('aria-label', opts.placeholder);

    const voiceBtn = el('button', 'ua-voice-btn', '🎤');
    voiceBtn.type = 'button';
    voiceBtn.title = 'Hablar en vez de escribir';
    voiceBtn.addEventListener('click', () => startVoiceInput(input));

    const submitBtn = el('button', 'btn btn-primary ua-gated-submit', 'Listo');
    submitBtn.type = 'button';

    const errorMsg = el('p', 'ua-gated-error hidden');

    submitBtn.addEventListener('click', () => {
        const gate = moderationGate(input.value);
        if (!gate.allowed) {
            errorMsg.textContent = mensajeRedireccionVael(gate.reason);
            errorMsg.classList.remove('hidden');
            fireVaelAction('think');
            return;
        }
        errorMsg.classList.add('hidden');
        opts.onAccepted(gate.sanitizedInput || input.value.trim());
    });

    wrap.appendChild(input);
    wrap.appendChild(voiceBtn);
    wrap.appendChild(submitBtn);
    wrap.appendChild(errorMsg);
    return wrap;
}

// Entrada por voz vía Web Speech API cuando el navegador la soporta;
// si no, el campo de texto sigue disponible (accesibilidad DUA: la voz
// es una alternativa, nunca la única vía).
function startVoiceInput(input: HTMLInputElement) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        input.focus();
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
        input.value = event.results[0][0].transcript;
    };
    recognition.start();
}

export function showFeedback(target: HTMLElement, correct: boolean) {
    target.classList.add(correct ? 'ua-feedback-correct' : 'ua-feedback-incorrect');
    fireVaelAction(correct ? 'happy' : 'think');
    setTimeout(() => target.classList.remove('ua-feedback-correct', 'ua-feedback-incorrect'), 900);
}
