<script lang="ts">
    import {
        game,
        gameMetrics,
        stageProgress,
        boardSlots,
        maxStage,
    } from "../stores/game";
    import type { SlotCategory, Piece } from "../types";
    import { PIECES } from "../data/pieces";
    import CircularProgress from "./ui/CircularProgress.svelte";
    import Tooltip from "./ui/Tooltip.svelte";
    import TooltipText from "./ui/TooltipText.svelte";
    import { showResetModal } from "../stores/ui";
    import { showSingularityModal } from "../stores/game";
    import { t } from "../stores/i18n";
    import SlotItem from "./SlotItem.svelte";
    import TrainResult from "./TrainResult.svelte";

    import { getSlotColor, getSlotEmoji } from "../utils/slotUtils";

    function handleDrop(e: DragEvent, slotName: SlotCategory) {
        e.preventDefault();
        const pId = e.dataTransfer?.getData("text/plain");
        if (pId) {
            game.placePiece(slotName, pId);
        } else if ($game.selectedPieceId) {
            game.placePiece(slotName, $game.selectedPieceId);
        }
        game.selectPiece(undefined);
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "move";
        }
    }

    function handleSlotKeyDown(e: KeyboardEvent, slotName: SlotCategory) {
        if (e.key === "Enter") {
            if ($game.selectedPieceId) {
                game.placePiece(slotName, $game.selectedPieceId);
                game.selectPiece(undefined);
            } else if ($game.placements[slotName]) {
                game.removePiece(slotName);
            }
        }
    }

    function getPieceDisplay(id: string | undefined): Piece | undefined {
        if (!id) return undefined;
        return PIECES.find((p) => p.id === id);
    }

    function getSlotDescription(slot: SlotCategory) {
        return $t.tut?.[`desc${slot}`] || "";
    }

    $: allObjectivesMet = $stageProgress.every((o) => o.met);
</script>

<div class="board" role="region" aria-label="Tablero de Ensamblaje">
    <!-- Header: in normal flow now -->
    <div class="board-header">
        <div class="stage-info">
            <div class="stage-wrapper">
                <span class="label">{$t.stage}</span>
                <div class="stage-badge">{$game.currentStage}</div>
            </div>
            {#if $game.currentStage >= 4}
                <button
                    class="btn-info"
                    on:click={() => showSingularityModal.set(true)}
                    aria-label="Información sobre la Singularidad"
                    title="Singularidad"
                >
                    <i>i</i>
                </button>
            {/if}
            {#if $game.currentStage === 5}
                <span class="warning-text">{$t.singularity}</span>
            {/if}
        </div>
        <div class="metrics">
            <CircularProgress
                value={$gameMetrics.accuracy}
                color="var(--color-4)"
                label={$t.accuracy}
            />
            <CircularProgress
                value={$gameMetrics.performance}
                color="var(--color-1)"
                label={$t.speed}
            />
            <CircularProgress
                value={$gameMetrics.complexity}
                color="var(--color-5)"
                label={$t.difficulty}
            />
        </div>
    </div>

    <!-- Resultado del último entrenamiento: qué cambió y qué le pasa (C2). -->
    <TrainResult />

    <!-- Pipeline -->
    <div class="pipeline-area">
        <div class="pipeline-line {$game.isTraining ? 'flowing' : ''}"></div>

        <div class="slots-container stg-{$game.currentStage}">
            {#each $boardSlots as slotName, i}
                {@const pData = getPieceDisplay($game.placements[slotName])}
                {@const isTargeted = !!$game.selectedPieceId}
                {@const slotColor = getSlotColor(slotName)}

                <SlotItem
                    {slotName}
                    {pData}
                    {isTargeted}
                    isTraining={!!$game.isTraining}
                    {slotColor}
                    slotEmoji={getSlotEmoji(slotName)}
                    slotTitle={$t[`slot${slotName}`] || slotName}
                    slotDescription={getSlotDescription(slotName)}
                    delayIndex={i}
                    on:drop={(e) => handleDrop(e.detail.e, slotName)}
                    on:keydown={(e) => handleSlotKeyDown(e.detail.e, slotName)}
                    on:click={() => {
                        if ($game.selectedPieceId) {
                            game.placePiece(slotName, $game.selectedPieceId);
                            game.selectPiece(undefined);
                        }
                    }}
                    on:remove={() => game.removePiece(slotName)}
                />
            {/each}
        </div>
    </div>

    <!-- Bottom Action Section -->
    <div class="board-action-bar">
        <!-- Métricas compactas: en móvil las del cabecero quedan fuera de
             pantalla y se pierde la relación entre colocar y su efecto. -->
        <div class="metrics-compact" aria-hidden="true">
            <span class="mc-item" style="--mc: var(--color-4)"
                >{$t.accuracy}<b>{$gameMetrics.accuracy}</b></span
            >
            <span class="mc-item" style="--mc: var(--color-1)"
                >{$t.speed}<b>{$gameMetrics.performance}</b></span
            >
            <span class="mc-item" style="--mc: var(--color-5)"
                >{$t.difficulty}<b>{$gameMetrics.complexity}</b></span
            >
        </div>

        <div class="objectives">
            <h4>{$t.objectivesTitle} {$game.currentStage}</h4>
            <ul class="checklist">
                {#each $stageProgress as obj}
                    <li class={obj.met ? "met" : "pending"}>
                        <span class="checkbox">{obj.met ? "✓" : "○"}</span>
                        <span class="obj-text"
                            ><TooltipText
                                text={$t.objectives[obj.id] || obj.description}
                            /></span
                        >
                    </li>
                {/each}
            </ul>
        </div>

        <div class="action-buttons">
            <button class="btn-reset" on:click={() => showResetModal.set(true)}>
                {$t.reset}
            </button>
            <!-- Entrenar siempre que el modelo sea válido: probar, leer el
                 diagnóstico y ajustar ES el aprendizaje (Fase C2). Los
                 objetivos deciden si además se AVANZA de etapa, no si se
                 puede entrenar. -->
            <button
                id="btn-train"
                class="btn-train {allObjectivesMet ? 'ready-pulse' : ''}"
                disabled={!!$game.isTraining}
                on:click={() => game.train()}
            >
                {$t.trainModel}
            </button>
        </div>
    </div>
</div>

<style>
    .board {
        flex: 1;
        background: var(--bg-panel);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-stone);
        box-shadow: var(--shadow-md);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
    }

    /* ---- Header (normal flow) ---- */
    .board-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-stone);
        background: var(--bg-main);
        flex-shrink: 0;
    }

    .stage-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .stage-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--bg-panel);
        padding: 0.3rem 0.5rem 0.3rem 0.75rem;
        border-radius: 20px;
        border: 1px solid var(--border-stone);
        box-shadow: var(--shadow-sm);
    }
    .label {
        color: var(--text-muted);
        font-size: 0.7rem;
        text-transform: uppercase;
        font-weight: 800;
        letter-spacing: 1px;
    }
    .stage-badge {
        background: var(--primary);
        color: white;
        font-weight: bold;
        font-size: 0.9rem;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    .btn-info {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--bg-panel);
        border: 1px solid var(--border-stone);
        color: var(--text-muted);
        font-weight: bold;
        font-style: italic;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        margin-left: 0.5rem;
        box-shadow: var(--shadow-sm);
    }
    .btn-info:hover {
        background: var(--bg-deep);
        color: var(--primary);
        border-color: var(--border-highlight);
    }
    .warning-text {
        color: var(--k-red-400);
        font-weight: 700;
        letter-spacing: 0.5px;
        font-size: 0.8rem;
        background: color-mix(in srgb, var(--k-state-danger) 15%, transparent);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid color-mix(in srgb, var(--k-state-danger) 30%, transparent);
    }
    .metrics {
        display: flex;
        gap: 1rem;
        background: var(--bg-panel);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-stone);
        box-shadow: var(--shadow-sm);
    }

    /* ---- Pipeline Area ---- */
    .pipeline-area {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 1.5rem 2rem;
        min-height: 0;
    }

    .pipeline-line {
        position: absolute;
        left: 8%;
        right: 8%;
        height: 4px;
        top: 50%;
        transform: translateY(-50%);
        background: var(--border-stone);
        border-radius: var(--radius-sm);
        z-index: 0;
    }

    .slots-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1rem;
        z-index: 1;
        width: 100%;
    }

    /* ---- Flow Animations ---- */
    .pipeline-line.flowing {
        background: linear-gradient(
            90deg,
            var(--bg-deep) 0%,
            var(--color-1) 25%,
            var(--color-3) 50%,
            var(--color-5) 100%
        );
        background-size: 200% 100%;
        animation: gradientFlow 0.8s linear infinite;
    }

    @keyframes gradientFlow {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    /* ---- Bottom Action Bar ---- */
    .board-action-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        padding: 1rem 1.5rem;
        background: var(--bg-main);
        border-top: 1px solid var(--border-stone);
        flex-shrink: 0;
    }

    .objectives {
        flex: 1;
        min-width: 0;
    }

    .objectives h4 {
        margin: 0 0 0.4rem 0;
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .checklist {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    .checklist li {
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--text-muted);
        background: var(--bg-panel);
        padding: 0.3rem 0.6rem;
        border-radius: var(--radius-sm);
        transition: all 0.2s;
        border: 1px solid var(--border-stone);
    }
    .checklist li.met {
        color: var(--color-4);
        border-color: var(--color-4);
        background: color-mix(in srgb, var(--color-4) 8%, transparent);
    }
    .checkbox {
        font-weight: 700;
        font-size: 1.1rem;
    }
    .checklist li.met .checkbox {
        color: var(--color-4);
    }
    .checklist li.pending .checkbox {
        color: var(--border-highlight);
    }
    .obj-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 600;
        max-width: 200px;
    }

    .btn-train {
        padding: 0.75rem 1.5rem;
        background: var(--primary);
        border: none;
        color: var(--bg-deep); /* Contrast against primary */
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 1rem;
        transition: all 0.2s;
        cursor: pointer;
        flex-shrink: 0;
        white-space: nowrap;
        box-shadow: 0 4px 6px -1px color-mix(in srgb, var(--primary) 35%, transparent);
    }
    .btn-train:disabled {
        background: var(--border-stone);
        color: var(--text-muted);
        cursor: not-allowed;
        box-shadow: none;
    }
    .btn-train:not(:disabled):hover {
        background: var(--primary-hover);
        transform: translateY(-2px);
        box-shadow: 0 6px 8px -1px color-mix(in srgb, var(--primary) 40%, transparent);
    }

    .btn-train.ready-pulse {
        animation: trainPulse 1.5s ease infinite;
    }
    @keyframes trainPulse {
        0% {
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-4) 60%, transparent);
        }
        50% {
            box-shadow: 0 0 20px 5px color-mix(in srgb, var(--color-4) 40%, transparent);
        }
        100% {
            box-shadow: 0 0 0 0 transparent;
        }
    }

    .action-buttons {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-shrink: 0;
    }

    .btn-reset {
        padding: 0.75rem 1.5rem;
        background: var(--bg-panel);
        border: 1px solid var(--border-stone);
        color: var(--text-muted);
        border-radius: var(--radius-md);
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.2s;
        cursor: pointer;
        flex-shrink: 0;
    }
    .btn-reset:hover {
        border-color: var(--k-state-danger);
        color: var(--k-red-400);
        background: color-mix(in srgb, var(--k-state-danger) 15%, transparent);
    }

    /* Métricas compactas: solo en pantallas donde el cabecero se va de vista. */
    .metrics-compact {
        display: none;
        gap: 0.4rem;
        width: 100%;
    }
    .mc-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.1rem;
        font-size: 0.62rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 700;
        color: var(--text-muted);
        background: var(--bg-panel);
        border: 1px solid var(--border-stone);
        border-top: 3px solid var(--mc);
        border-radius: var(--radius-sm);
        padding: 0.3rem 0.2rem;
    }
    .mc-item b {
        font-size: 1rem;
        color: var(--mc);
    }

    /* ---- Tablet ---- */
    @media (max-width: 1024px) {
        .board-action-bar {
            flex-direction: column;
            align-items: stretch;
        }
        .btn-train {
            width: 100%;
        }
        .slots-container {
            flex-wrap: wrap;
        }
    }

    /* ---- Táctil / móvil: el bucle debe caber en una pantalla ----
       Antes, "Entrenar" quedaba a ~1.500px del inicio: colocar una pieza y
       ver su efecto ocupaba dos pantallas de scroll y se perdía la relación
       causa-efecto, que es lo que el juego enseña. */
    @media (max-width: 900px) {
        .board {
            overflow: visible; /* necesario para que sticky se ancle al viewport */
        }
        .board-action-bar {
            position: sticky;
            bottom: 0;
            z-index: 20;
            gap: 0.6rem;
            padding: 0.6rem 0.9rem calc(0.6rem + env(safe-area-inset-bottom));
            box-shadow: 0 -6px 16px -6px rgba(0, 0, 0, 0.7);
        }
        .metrics-compact {
            display: flex;
        }
        /* Los objetivos ocupaban mucho junto a la acción principal. */
        .objectives h4 {
            margin-bottom: 0.25rem;
        }
        .obj-text {
            max-width: 100%;
            white-space: normal;
        }
        .checklist {
            gap: 0.3rem;
        }
        .checklist li {
            font-size: 0.78rem;
            padding: 0.25rem 0.45rem;
        }
        .action-buttons {
            gap: 0.6rem;
        }
        .btn-reset,
        .btn-train {
            padding: 0.7rem 1rem;
            min-height: 48px; /* objetivo táctil cómodo */
        }
        .btn-reset {
            flex: 0 0 auto;
        }
        .btn-train {
            flex: 1;
        }
        .pipeline-area {
            padding: 1rem 0.75rem;
        }
        .board-header {
            padding: 0.7rem 0.9rem;
        }
    }

    /* ---- Teléfono ---- */
    @media (max-width: 640px) {
        .slots-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }
        .pipeline-line {
            display: none; /* la tubería horizontal no aplica en rejilla */
        }
        .board-header {
            flex-direction: column;
            align-items: stretch;
            gap: 0.6rem;
        }
        .metrics {
            justify-content: space-around;
            gap: 0.5rem;
            padding: 0.4rem 0.5rem;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .btn-train.ready-pulse,
        .pipeline-line.flowing {
            animation: none;
        }
    }
</style>
