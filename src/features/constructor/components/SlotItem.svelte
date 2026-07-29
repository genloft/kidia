<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { Piece, SlotCategory } from "../types";
    import Tooltip from "./ui/Tooltip.svelte";
    import { t } from "../stores/i18n";
    import { tramo } from "../stores/tramo";
    import { pieceName } from "../utils/pieceText";

    export let slotName: SlotCategory;
    export let pData: Piece | undefined;
    export let isTargeted: boolean;
    export let isTraining: boolean;
    export let slotColor: string;
    export let slotEmoji: string;
    export let slotTitle: string;
    export let slotDescription: string;
    export let delayIndex: number;

    const dispatch = createEventDispatcher<{
        drop: { e: DragEvent; slotName: SlotCategory };
        click: void;
        remove: void;
        keydown: { e: KeyboardEvent; slotName: SlotCategory };
    }>();

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "move";
        }
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="slot-wrapper {isTraining ? 'shake-anim' : ''}"
    style="--anim-delay: {delayIndex * 0.15}s; --slot-color: {slotColor}"
>
    <div class="slot-title">
        <Tooltip text={slotDescription}>
            <h4 class="slot-label">
                <span class="slot-emoji">{slotEmoji}</span>
                {slotTitle}
            </h4>
        </Tooltip>
    </div>
    <div
        id="slot-{slotName}"
        data-slot={slotName}
        class="slot {pData ? 'filled' : 'empty'} {isTargeted
            ? 'highlight-drop'
            : ''}"
        role="button"
        tabindex="0"
        on:dragover={handleDragOver}
        on:drop={(e) => dispatch("drop", { e, slotName })}
        on:keydown={(e) => dispatch("keydown", { e, slotName })}
        on:click={() => dispatch("click")}
        aria-label="Hueco {slotTitle}. {pData
            ? `Contiene ${pieceName(pData, $tramo, $t)}. Toca para quitarla.`
            : isTargeted
              ? 'Vacío. Toca aquí para colocar la pieza elegida.'
              : 'Vacío. Elige antes una pieza.'}"
    >
        {#if pData}
            <span class="p-name">{pieceName(pData, $tramo, $t)}</span>
            <button
                class="p-remove"
                on:click|stopPropagation={() => dispatch("remove")}
                aria-label="Quitar {pieceName(pData, $tramo, $t)}"
                >✕</button
            >
        {:else if isTargeted}
            <span class="drop-here">👇 Toca aquí</span>
        {:else}
            <span class="placeholder">+ {slotTitle}</span>
        {/if}
    </div>
</div>

<style>
    .slot-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        max-width: 160px;
    }

    .slot-title {
        display: flex;
        justify-content: center;
    }

    .slot-emoji {
        margin-right: 0.25rem;
    }

    .slot-label {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
        background: var(--bg-main);
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        white-space: nowrap;
        border: 1px solid var(--border-stone);
        box-shadow: var(--shadow-sm);
    }

    .slot {
        width: 100%;
        height: 100px;
        background: var(--bg-panel);
        border: 2px dashed var(--slot-color);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        cursor: pointer;
        position: relative;
    }

    .slot:hover {
        background: var(--bg-main);
    }

    /* Con una pieza elegida, los huecos libres se anuncian como destino:
       es la señal que hace descubrible el modo tocar-para-colocar. */
    .slot.highlight-drop {
        border-color: var(--slot-color);
        background: var(--bg-main);
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
    }
    .slot.empty.highlight-drop {
        animation: awaitDrop 1.4s ease infinite;
    }
    @keyframes awaitDrop {
        0%,
        100% {
            box-shadow: 0 0 0 0 var(--slot-color);
        }
        50% {
            box-shadow: 0 0 14px 3px var(--slot-color);
        }
    }

    .drop-here {
        color: var(--slot-color);
        font-size: 0.9rem;
        font-weight: 800;
        text-align: center;
        line-height: 1.2;
    }

    .slot.filled {
        background: var(--bg-panel);
        border: 2px solid var(--slot-color);
        border-left-width: 6px;
        box-shadow: var(--shadow-md);
    }
    .slot.filled:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }
    .slot.filled:hover .p-remove {
        opacity: 1;
    }

    .placeholder {
        color: var(--slot-color);
        font-size: 0.8rem;
        font-weight: 700;
        /* 0.5 dejaba el nombre del hueco por debajo de cualquier umbral de
           contraste legible; el hueco vacío es justo lo que hay que leer. */
        opacity: 0.8;
    }

    .p-name {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-main);
        text-align: center;
        padding: 0 0.5rem;
        line-height: 1.3;
    }

    .p-remove {
        position: absolute;
        top: -8px;
        right: -8px;
        background: var(--bg-deep);
        color: var(--text-muted);
        width: 24px;
        height: 24px;
        border: 1px solid var(--border-stone);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        opacity: 0;
        transition: all 0.2s;
        box-shadow: var(--shadow-md);
        cursor: pointer;
        padding: 0;
    }
    .p-remove:hover {
        color: var(--k-state-danger);
        border-color: var(--k-state-danger);
    }

    .shake-anim .slot.filled {
        animation: pulseSlot 0.8s ease var(--anim-delay) infinite;
    }

    @keyframes pulseSlot {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 transparent;
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px color-mix(in srgb, var(--color-5) 60%, transparent);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 transparent;
        }
    }

    /* En móvil los huecos crecen: 100px es poco para el dedo y deja el
       nombre de la pieza apretado. */
    @media (max-width: 640px) {
        .slot-wrapper {
            max-width: none;
        }
        .slot {
            height: 84px;
        }
    }

    /* El sistema de diseño (03 §5) exige respetar reduced-motion. */
    @media (prefers-reduced-motion: reduce) {
        .slot.empty.highlight-drop {
            animation: none;
            box-shadow: 0 0 0 3px var(--slot-color);
        }
        .shake-anim .slot.filled {
            animation: none;
        }
    }
</style>
