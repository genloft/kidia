// Lectura en voz alta vía Web Speech API (SpeechSynthesis del propio
// navegador). No hay llamada a servidor ni a un modelo — es la misma
// limitación de hosting estático que ya afecta a /api/chat: aquí no hace
// falta rodearla porque el navegador ya trae su propio motor de voz.
// La disponibilidad y calidad de la voz "es-ES" depende del dispositivo
// del usuario (accesibilidad DUA: el texto siempre sigue visible, el
// audio es un complemento, nunca la única vía).

export function isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeaking(): boolean {
    return isSpeechSupported() && window.speechSynthesis.speaking;
}

export function stopSpeaking() {
    if (isSpeechSupported()) window.speechSynthesis.cancel();
}

export function speak(text: string, onEnd?: () => void) {
    if (!isSpeechSupported() || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
}

/** Texto legible de un elemento: ignora botones/inputs (no queremos leer "Listo", "Escuchar"...). */
export function readableText(root: HTMLElement): string {
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('button, input, select, textarea, [aria-hidden="true"]').forEach(n => n.remove());
    return clone.textContent?.replace(/\s+/g, ' ').trim() || '';
}

/**
 * Botón "Escuchar" reutilizable: al pulsarlo, lee en voz alta el texto que
 * devuelve getText() en ese momento (se reevalúa en cada click, así sirve
 * para contenido que cambia sin recrear el botón). Si el navegador no
 * soporta síntesis de voz, se deshabilita en vez de fallar en silencio.
 */
export function createReadAloudButton(getText: () => string, opts?: { label?: string; className?: string }): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = opts?.className || 'listen-btn';
    const label = opts?.label || 'Escuchar';

    const setIdle = () => { btn.textContent = `🔊 ${label}`; btn.classList.remove('listening'); };
    (btn as any)._reset = setIdle;

    if (!isSpeechSupported()) {
        btn.disabled = true;
        btn.title = 'Tu navegador no permite leer en voz alta';
        setIdle();
        return btn;
    }

    setIdle();
    btn.addEventListener('click', () => {
        if (isSpeaking()) {
            stopSpeaking();
            setIdle();
            return;
        }
        const text = getText();
        if (!text) return;
        btn.textContent = '⏸ Detener';
        btn.classList.add('listening');
        speak(text, setIdle);
    });

    return btn;
}
