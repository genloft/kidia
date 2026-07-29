<script lang="ts">
    import { game, stageProgress, boardSlots } from "../stores/game";
    import TooltipText from "./ui/TooltipText.svelte";
    import type { LogEvent, SlotCategory } from "../types";
    import { PIECES } from "../data/pieces";
    import { t } from "../stores/i18n";

    // Los huecos dependen del tramo: en 8-9 el tablero solo tiene tres.
    $: SLOTS = $boardSlots as SlotCategory[];

    $: recentLogs = [...$game.logs].reverse().slice(0, 6);

    // Dynamic interactive hint
    $: activeHint = (() => {
        if ($game.isTraining) {
            return {
                message: "⏳ Entrenando… vamos a ver qué sale.",
                type: "info" as const,
            };
        }

        const unmet = $stageProgress.find((o) => !o.met);
        if (!unmet) {
            if ($game.currentStage < 5)
                return {
                    message: "¡Lo tienes! Dale a Entrenar y vemos qué tal va.",
                    type: "success" as const,
                };
            return {
                message: "Tu modelo está al límite. Pruébalo y hablamos.",
                type: "error" as const,
            };
        }

        const emptySlot = SLOTS.find((s) => !$game.placements[s]);
        if (
            emptySlot &&
            PIECES.some(
                (p) =>
                    p.recommendedSlot === emptySlot &&
                    $game.unlockedPieces.includes(p.id),
            )
        ) {
            return {
                message: `Te falta algo en ${$t[`slot${emptySlot}`]}. ¿Qué le pondrías?`,
                type: "warn" as const,
            };
        }

        return {
            message: `Siguiente reto: ${unmet.description.toLowerCase()}.`,
            type: "warn" as const,
        };
    })();

    // La Dra. Vael cambia de gesto según cómo va la cosa: es la misma guía
    // que acompaña en las misiones, no un asistente anónimo.
    $: avatarVael =
        $game.isTraining
            ? "/dravael-work.webp"
            : activeHint.type === "success"
              ? "/dravael-ok.webp"
              : activeHint.type === "error"
                ? "/dravael-no.webp"
                : "/dravael-doubt.webp";

    function getTypeColor(type: LogEvent["type"]): string {
        switch (type) {
            case "error":
                return "var(--k-state-danger)";
            case "warn":
                return "#f59e0b";
            case "success":
                return "#10b981";
            default:
                return "var(--primary)";
        }
    }

    let expanded = false;
    let lastAutoHint = "";
    let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

    // Auto-open only when hint changes and is important
    $: {
        const hintKey = activeHint.message;
        if (
            hintKey !== lastAutoHint &&
            (activeHint.type === "warn" || activeHint.type === "success")
        ) {
            lastAutoHint = hintKey;
            expanded = true;
            // Auto-close after 6 seconds
            if (autoCloseTimer) clearTimeout(autoCloseTimer);
            autoCloseTimer = setTimeout(() => {
                expanded = false;
            }, 6000);
        }
    }

    // Auto-collapse when training starts
    $: if ($game.isTraining) {
        expanded = false;
        if (autoCloseTimer) clearTimeout(autoCloseTimer);
    }

    function toggleMentor() {
        expanded = !expanded;
        if (autoCloseTimer) clearTimeout(autoCloseTimer);
    }
</script>

<!-- Floating Mentor -->
<div
    class="mentor-widget {expanded ? 'expanded' : 'collapsed'}"
    style="--l-color: {getTypeColor(activeHint.type)}"
>
    <!-- Inline hint when collapsed -->
    {#if !expanded}
        <div
            class="inline-hint"
            style="border-color: {getTypeColor(activeHint.type)}"
        >
            <span class="inline-text">{activeHint.message}</span>
        </div>
    {/if}

    <button
        class="mentor-toggle"
        on:click={toggleMentor}
        aria-label="Abrir o cerrar los consejos de la Dra. Vael"
        aria-expanded={expanded}
    >
        <div class="avatar-icon">
            <img src={avatarVael} alt="Dra. Vael" class="avatar-img" />
            {#if !expanded && activeHint.type !== "info"}
                <span
                    class="notification-dot"
                    style="background: {getTypeColor(activeHint.type)}"
                ></span>
            {/if}
        </div>
    </button>

    {#if expanded}
        <div class="mentor-content">
            <div class="feed-header">
                <h4>Dra. Vael</h4>
                <button
                    class="close-btn"
                    on:click={() => {
                        expanded = false;
                        if (autoCloseTimer) clearTimeout(autoCloseTimer);
                    }}>✕</button
                >
            </div>
            <p class="main-hint" role="status" aria-live="polite">
                <TooltipText text={activeHint.message} />
            </p>

            {#if recentLogs.length > 0}
                <div class="history-section">
                    <h5>{$t.recentEvents}</h5>
                    <ul class="log-list">
                        {#each recentLogs.slice(0, 3) as log}
                            <li style="--c: {getTypeColor(log.type)}">
                                <span class="time"
                                    >{new Date(
                                        log.timestamp,
                                    ).toLocaleTimeString([], {
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })}</span
                                >
                                <TooltipText text={log.message} />
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .mentor-widget {
        position: fixed;
        top: 80px;
        right: 1.5rem;
        z-index: 50;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
        pointer-events: none;
    }

    .inline-hint,
    .mentor-toggle,
    .mentor-content {
        pointer-events: auto;
    }

    .inline-hint {
        background: var(--bg-panel);
        border: 1px solid var(--border-stone);
        border-left: 4px solid;
        border-radius: var(--radius-md);
        padding: 0.5rem 1rem;
        max-width: 280px;
        box-shadow: var(--shadow-md);
        animation: fadeIn 0.3s ease;
    }
    .inline-text {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-main);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.3;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .mentor-toggle {
        background: var(--bg-panel);
        border: 2px solid var(--border-stone);
        border-color: var(--l-color);
        border-radius: 50%;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
    }

    .mentor-toggle:hover {
        transform: scale(1.1);
    }

    .avatar-icon {
        position: relative;
        width: 44px;
        height: 44px;
    }

    .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 50%;
    }

    .notification-dot {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid var(--bg-panel);
        animation: pulseDot 2s infinite;
    }

    @keyframes pulseDot {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(146, 151, 254, 0.5);
        }
        70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 6px rgba(146, 151, 254, 0);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(146, 151, 254, 0);
        }
    }

    .mentor-content {
        background: var(--bg-panel);
        border: 1px solid var(--border-stone);
        border-top: 4px solid var(--l-color);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        width: 320px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        animation: scaleIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform-origin: bottom right;
    }

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .feed-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-stone);
        padding-bottom: 0.5rem;
    }

    .feed-header h4 {
        margin: 0;
        color: var(--text-muted);
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 1px;
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0;
        font-weight: bold;
        font-size: 1rem;
    }
    .close-btn:hover {
        color: var(--text-main);
    }

    .main-hint {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.4;
        color: var(--text-main);
        font-weight: bold;
    }

    .history-section h5 {
        margin: 0 0 0.5rem 0;
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .log-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.7rem;
    }
    .log-list li {
        color: var(--text-muted);
        border-left: 2px solid var(--c);
        padding-left: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .time {
        opacity: 0.5;
        margin-right: 0.25rem;
        font-family: monospace;
    }
</style>
