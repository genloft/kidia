<script lang="ts">
    import { game } from "../stores/game";
    import { t } from "../stores/i18n";
    import { fade, scale } from "svelte/transition";

    // Show only if stage > 1, no tutorial is showing, not won yet, not ack'd yet.
    $: isVisible =
        $game.currentStage > 1 &&
        !$game.stageIntroAck &&
        !$game.hasWonGame &&
        $game.hasSeenWelcomeModal;

    // Get the corresponding Title and Description for the current stage.
    // The translations for stages are found inside `tut` as `stgXTitle` and `stgXMsg`
    $: currentTitle =
        $game.currentStage === 2
            ? $t.tut?.stg2Title
            : $game.currentStage === 3
              ? $t.tut?.stg3Title
              : $game.currentStage === 4
                ? $t.tut?.stg4Title
                : $game.currentStage === 5
                  ? $t.tut?.stg5Title
                  : "Siguiente Etapa";

    $: currentMsg =
        $game.currentStage === 2
            ? $t.tut?.stg2Msg
            : $game.currentStage === 3
              ? $t.tut?.stg3Msg
              : $game.currentStage === 4
                ? $t.tut?.stg4Msg
                : $game.currentStage === 5
                  ? $t.tut?.stg5Msg
                  : "Continúa expandiendo tu modelo.";

    function startStage() {
        game.update((s) => ({ ...s, stageIntroAck: true }));
    }
</script>

{#if isVisible}
    <div class="modal-backdrop" transition:fade={{ duration: 300 }}>
        <div
            class="modal-content"
            transition:scale={{ start: 0.95, duration: 300 }}
        >
            <div class="stage-badge">
                Etapa {$game.currentStage}
            </div>
            <h2>{currentTitle}</h2>
            <div class="text-body">
                <p>
                    {currentMsg}
                </p>
            </div>
            <button class="btn-start" on:click={startStage}>
                {$t.game?.startPlaying || "¡Empezar Etapa!"}
            </button>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99998; /* Underneath WelcomeModal and VictoryModal just in case */
    }

    .modal-content {
        background: var(--bg-panel);
        border: 4px solid var(--border-highlight);
        border-radius: var(--radius-md);
        padding: 2.5rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        position: relative;
    }

    .stage-badge {
        display: inline-block;
        background: var(--border-highlight);
        color: var(--bg-panel);
        font-weight: 900;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        padding: 0.4rem 1rem;
        border-radius: 20px;
        margin-bottom: 1rem;
    }

    h2 {
        color: var(--primary);
        font-size: 1.6rem;
        margin: 0 0 1rem 0;
        font-weight: 800;
        letter-spacing: -0.5px;
    }

    .text-body {
        color: var(--text-main);
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 2rem;
        background: rgba(146, 151, 254, 0.1);
        padding: 1rem;
        border-radius: var(--radius-sm);
        border-left: 4px solid var(--primary);
        font-weight: 600;
        text-align: left;
    }

    p {
        margin: 0;
    }

    .btn-start {
        background: var(--primary);
        color: white;
        border: none;
        padding: 1rem 2rem;
        font-size: 1.2rem;
        font-weight: 800;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
        box-shadow: 0 4px 0 var(--border-highlight);
        width: 100%;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .btn-start:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 0 var(--border-highlight);
    }

    .btn-start:active {
        transform: translateY(4px);
        box-shadow: 0 0 0 var(--border-highlight);
    }
</style>
