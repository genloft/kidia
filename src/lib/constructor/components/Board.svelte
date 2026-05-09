<script lang="ts">
    import { game, gameMetrics, stageProgress } from "../stores/game";
    import type { SlotCategory, Piece } from "../types";
    import { PIECES } from "../data/pieces";
    import CircularProgress from "./ui/CircularProgress.svelte";
    import Tooltip from "./ui/Tooltip.svelte";
    import TooltipText from "./ui/TooltipText.svelte";
    import { showResetModal } from "../stores/ui";
    import { showSingularityModal } from "../stores/game";
    import { t } from "../stores/i18n";
    import SlotItem from "./SlotItem.svelte";

    const SLOTS: SlotCategory[] = [
        "Datos",
        "Cerebro",
        "Entrenamiento",
        "Examen",
        "Salida",
    ];
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

    <!-- Pipeline -->
    <div class="pipeline-area">
        <div class="pipeline-line {$game.isTraining ? 'flowing' : ''}"></div>

        <div class="slots-container stg-{$game.currentStage}">
            {#each SLOTS as slotName, i}
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
            <button
                id="btn-train"
                class="btn-train {allObjectivesMet && $game.currentStage < 5
                    ? 'ready-pulse'
                    : ''}"
                disabled={!allObjectivesMet && $game.currentStage < 5}
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
        color: #fca5a5;
        font-weight: 700;
        letter-spacing: 0.5px;
        font-size: 0.8rem;
        background: rgba(239, 68, 68, 0.15);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid rgba(239, 68, 68, 0.3);
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
        background: rgba(16, 185, 129, 0.05);
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
        box-shadow: 0 4px 6px -1px rgba(146, 151, 254, 0.3);
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
        box-shadow: 0 6px 8px -1px rgba(146, 151, 254, 0.4);
    }

    .btn-train.ready-pulse {
        animation: trainPulse 1.5s ease infinite;
    }
    @keyframes trainPulse {
        0% {
            box-shadow: 0 0 0 0 rgba(89, 204, 89, 0.6);
        }
        50% {
            box-shadow: 0 0 20px 5px rgba(89, 204, 89, 0.4);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(89, 204, 89, 0);
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
        border-color: #ef4444;
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.15);
    }

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
</style>
