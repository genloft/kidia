<script lang="ts">
    import { showVictoryModal, game } from "../stores/game";
    import { t } from "../stores/i18n";
    import { fade, scale } from "svelte/transition";

    function restartGame() {
        showVictoryModal.set(false);
        game.reset();
        // Since we reset, the welcome modal might trigger again if state isn't preserved
        game.update((s) => ({
            ...s,
            hasSeenWelcomeModal: true,
            hasSeenIntroTour: true,
        }));
    }
</script>

{#if $showVictoryModal}
    <div class="modal-backdrop" transition:fade={{ duration: 500 }}>
        <div class="confetti-container">
            {#each Array(50) as _, i}
                <div
                    class="confetti"
                    style="--rx: {Math.random()}; --ry: {Math.random()}; --delay: {Math.random()}s"
                ></div>
            {/each}
        </div>

        <div
            class="modal-content"
            transition:scale={{ start: 0.8, duration: 600, opacity: 0 }}
        >
            <div class="cosmic-avatar">🌌</div>
            <h2>{$t.game?.victoryTitle || "¡Victoria!"}</h2>
            <div class="text-body">
                <p>
                    {($t.game?.victoryBody || "").split("\n\n")[0]}
                </p>
                <p class="highlight">
                    {($t.game?.victoryBody || "").split("\n\n")[1]}
                </p>
            </div>
            <button class="btn-restart" on:click={restartGame}>
                {$t.game?.playAgain || "Volver a jugar"}
            </button>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: radial-gradient(
            circle at center,
            rgba(30, 20, 60, 0.95) 0%,
            rgba(10, 10, 20, 0.98) 100%
        );
        backdrop-filter: blur(12px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        overflow: hidden;
    }

    .modal-content {
        background: rgba(20, 25, 40, 0.8);
        border: 2px solid var(--color-4);
        border-radius: var(--radius-md);
        padding: 3rem 2.5rem;
        max-width: 550px;
        width: 90%;
        text-align: center;
        box-shadow:
            0 0 50px rgba(176, 38, 255, 0.3),
            inset 0 0 20px rgba(82, 113, 255, 0.2);
        position: relative;
        z-index: 2;
        backdrop-filter: blur(10px);
    }

    .cosmic-avatar {
        font-size: 5rem;
        margin-bottom: 0.5rem;
        animation: pulse 4s infinite alternate;
        filter: drop-shadow(0 0 20px rgba(176, 38, 255, 0.8));
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.5));
        }
        100% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 30px rgba(255, 27, 107, 0.8));
        }
    }

    h2 {
        font-size: 2.2rem;
        margin: 0 0 1.5rem 0;
        font-weight: 900;
        background: linear-gradient(90deg, #00f0ff, #b026ff, #ff1b6b);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -1px;
    }

    .text-body {
        color: var(--text-main);
        font-size: 1.15rem;
        line-height: 1.6;
        margin-bottom: 2.5rem;
    }

    p {
        margin: 0 0 1rem 0;
    }

    .highlight {
        font-weight: 800;
        color: var(--color-1);
        font-size: 1.3rem;
        margin-top: 1.5rem;
    }

    .btn-restart {
        background: transparent;
        color: white;
        border: 2px solid var(--color-4);
        padding: 1rem 2.5rem;
        font-size: 1.2rem;
        font-weight: 900;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.3s;
        text-transform: uppercase;
        letter-spacing: 2px;
        position: relative;
        overflow: hidden;
    }

    .btn-restart::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, #5271ff, #b026ff);
        z-index: -1;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.4s ease;
    }

    .btn-restart:hover::before {
        transform: scaleX(1);
    }
    .btn-restart:hover {
        border-color: transparent;
        box-shadow: 0 0 20px rgba(176, 38, 255, 0.6);
        transform: translateY(-2px);
    }

    /* Confetti Animation */
    .confetti-container {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
    }

    .confetti {
        position: absolute;
        width: 10px;
        height: 20px;
        background: var(--color-4);
        top: -20px;
        left: calc(var(--rx) * 100vw);
        animation: fall 4s linear infinite;
        animation-delay: var(--delay);
        opacity: 0.8;
    }

    .confetti:nth-child(even) {
        background: var(--color-1);
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }

    .confetti:nth-child(3n) {
        background: var(--color-2);
    }

    @keyframes fall {
        0% {
            transform: translateY(-5vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(105vh) rotate(720deg);
            opacity: 0;
        }
    }
</style>
