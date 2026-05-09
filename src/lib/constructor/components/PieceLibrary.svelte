<script lang="ts">
    import { game } from "../stores/game";
    import { PIECES } from "../data/pieces";
    import type { Piece, SlotCategory } from "../types";
    import TooltipText from "./ui/TooltipText.svelte";
    import { t } from "../stores/i18n";
    import { getSlotColor, getSlotEmoji } from "../utils/slotUtils";

    let selectedCategory: SlotCategory | "Todas" = "Todas";
    const categories: SlotCategory[] = [
        "Datos",
        "Cerebro",
        "Entrenamiento",
        "Examen",
        "Salida",
    ];

    let expandedPiece: string | null = null;

    $: availablePieces = PIECES.filter(
        (p) =>
            $game.unlockedPieces.includes(p.id) &&
            (selectedCategory === "Todas" ||
                p.recommendedSlot === selectedCategory),
    );

    $: placedPieceIds = new Set(
        Object.values($game.placements).filter(Boolean) as string[],
    );

    function handleDragStart(e: DragEvent, pieceId: string) {
        game.selectPiece(pieceId);
        if (e.dataTransfer) {
            e.dataTransfer.setData("text/plain", pieceId);
            e.dataTransfer.effectAllowed = "move";
        }
    }

    function handleKeyDown(e: KeyboardEvent, pieceId: string) {
        if (e.key === "Enter") {
            game.selectPiece(pieceId);
        } else if (e.key === "Escape") {
            game.selectPiece(undefined);
            expandedPiece = null;
        }
    }

    function toggleExpand(pieceId: string) {
        expandedPiece = expandedPiece === pieceId ? null : pieceId;
    }
</script>

<aside class="piece-library" role="region" aria-label="Librería de Componentes">
    <div class="filter-bar">
        <label for="category-select" class="sr-only">Filtrar piezas:</label>
        <div class="select-wrapper">
            <select
                id="category-select"
                bind:value={selectedCategory}
                class="category-select"
            >
                <option value="Todas">{$t.allPieces}</option>
                {#each categories as cat}
                    <option value={cat}>
                        {getSlotEmoji(cat)}
                        {$t[`slot${cat}`]}
                    </option>
                {/each}
            </select>
            <span class="select-icon">▼</span>
        </div>
    </div>

    <div class="pieces-list">
        {#each availablePieces as piece (piece.id)}
            {@const isPlaced = placedPieceIds.has(piece.id)}
            {@const isExpanded = expandedPiece === piece.id}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                id="lib-{piece.id}"
                class="piece-card {$game.selectedPieceId === piece.id
                    ? 'selected'
                    : ''} {isPlaced ? 'placed' : ''}"
                style="--badge-c: {getSlotColor(piece.recommendedSlot)}"
                draggable={!isPlaced}
                tabindex="0"
                on:dragstart={(e) => handleDragStart(e, piece.id)}
                on:keydown={(e) => handleKeyDown(e, piece.id)}
                on:click={() => {
                    if (!isPlaced) game.selectPiece(piece.id);
                    toggleExpand(piece.id);
                }}
                role="button"
                aria-pressed={$game.selectedPieceId === piece.id}
                aria-label="{piece.name}, {piece.category}. {isPlaced
                    ? 'Ya colocada.'
                    : 'Selecciónala y arrástrala.'}"
            >
                <div class="p-header">
                    <span class="badge"
                        >{$t[`slot${piece.category}`] || piece.category}</span
                    >
                    <div class="p-right">
                        {#if isPlaced}
                            <span class="placed-mark" title="Ya colocada"
                                >✓</span
                            >
                        {/if}
                        <span class="stage-tag">T{piece.stage}</span>
                    </div>
                </div>
                <h4>{$t.pieces[piece.id]?.name || piece.name}</h4>

                {#if isExpanded}
                    <div class="expanded-info">
                        <p class="tooltip">
                            <TooltipText
                                text={$t.pieces[piece.id]?.tooltip ||
                                    piece.tooltip}
                            />
                        </p>
                        <p class="curious">
                            💡 <TooltipText
                                text={$t.pieces[piece.id]?.curiousFact ||
                                    piece.curiousFact}
                            />
                        </p>
                    </div>
                {/if}
            </div>
        {/each}

        {#if availablePieces.length === 0}
            <p class="empty-msg">
                {$t.emptyCategory || "No hay piezas en esta categoría."}
            </p>
        {/if}
    </div>
</aside>

<style>
    .piece-library {
        background: var(--bg-panel);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-stone);
        box-shadow: var(--shadow-md);
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
    }

    .filter-bar {
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid var(--border-stone);
        position: sticky;
        top: 0;
        background: var(--bg-panel);
        z-index: 10;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }

    .select-wrapper {
        position: relative;
        width: 100%;
        max-width: 100%;
    }

    .category-select {
        width: 100%;
        appearance: none;
        background: var(--bg-main);
        border: 1px solid var(--border-stone);
        border-radius: var(--radius-sm);
        color: var(--text-main);
        font-family: var(--font-body);
        font-size: 0.9rem;
        font-weight: 600;
        padding: 0.6rem 2.5rem 0.6rem 1rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: var(--shadow-sm);
        outline: none;
    }

    .category-select:hover {
        border-color: var(--primary);
    }

    .category-select:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(146, 151, 254, 0.3);
    }

    .category-select option {
        background: var(--bg-panel);
        color: var(--text-main);
        font-family: var(--font-body);
    }

    .select-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--text-muted);
        font-size: 0.7rem;
    }

    .pieces-list {
        flex: 1;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .piece-card {
        background: var(--bg-main);
        border: 1px solid var(--border-stone);
        border-left: 4px solid var(--badge-c);
        border-radius: var(--radius-sm);
        padding: 0.75rem;
        cursor: grab;
        transition: all 0.2s ease;
        user-select: none;
        display: flex;
        flex-direction: column;
    }
    .piece-card.selected {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(146, 151, 254, 0.3);
        transform: translateY(-2px);
    }
    .piece-card:hover:not(.selected):not(.placed) {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        background: var(--bg-panel);
    }
    .piece-card.placed {
        opacity: 0.5;
        cursor: default;
        background: var(--bg-deep);
        border-style: dashed;
        border-left-style: solid;
    }
    .piece-card:active:not(.placed) {
        cursor: grabbing;
    }

    .p-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;
    }
    .p-right {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .badge {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        background: color-mix(in srgb, var(--badge-c) 15%, transparent);
        color: var(--text-main);
        padding: 4px 8px;
        border-radius: 4px;
    }
    .placed-mark {
        font-size: 0.85rem;
        color: var(--color-4);
        font-weight: 800;
    }
    .stage-tag {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--text-muted);
        background: var(--border-stone);
        padding: 2px 6px;
        border-radius: 4px;
    }
    h4 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-main);
        line-height: 1.3;
    }

    .expanded-info {
        margin-top: 0.5rem;
        animation: slideDown 0.2s ease;
    }
    @keyframes slideDown {
        from {
            opacity: 0;
            max-height: 0;
        }
        to {
            opacity: 1;
            max-height: 200px;
        }
    }

    .tooltip {
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-muted);
        line-height: 1.4;
        margin-bottom: 0.5rem;
    }
    .curious {
        margin: 0;
        font-size: 0.75rem;
        color: var(--color-3);
        font-style: italic;
        background: rgba(245, 158, 11, 0.1);
        padding: 0.5rem;
        border-radius: var(--radius-sm);
        font-weight: 500;
        line-height: 1.3;
        border-left: 3px solid var(--color-3);
    }

    .empty-msg {
        text-align: center;
        color: var(--text-muted);
        font-size: 0.9rem;
        padding: 2rem 0;
    }
</style>
