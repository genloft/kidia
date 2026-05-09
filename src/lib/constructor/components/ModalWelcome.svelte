<script lang="ts">
    import { showWelcomeModal, game } from "../stores/game";
    import { t } from "../stores/i18n";
    import { fade, scale } from "svelte/transition";

    function close() {
        showWelcomeModal.set(false);
        game.update((s) => ({ ...s, hasSeenWelcomeModal: true }));
    }
</script>

{#if $showWelcomeModal}
    <div class="modal-backdrop" transition:fade={{ duration: 300 }}>
        <div
            class="modal-content"
            transition:scale={{ start: 0.95, duration: 300 }}
        >
            <div class="robot-avatar">🤖</div>
            <h2>{$t.game?.welcomeTitle || "¡Bienvenido a Kidia!"}</h2>
            <div class="text-body">
                <p>
                    {($t.game?.welcomeBody || "").split("\n\n")[0]}
                </p>
                <p>
                    {($t.game?.welcomeBody || "").split("\n\n")[1]}
                </p>
                <p class="highlight">
                    {($t.game?.welcomeBody || "").split("\n\n")[2]}
                </p>
            </div>
            <button class="btn-start" on:click={close}>
                {$t.game?.startPlaying || "¡Empezar a jugar!"}
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
        z-index: 99999;
    }

    .modal-content {
        background: var(--bg-panel);
        border: 4px solid var(--border-stone);
        border-radius: var(--radius-md);
        padding: 2.5rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        position: relative;
    }

    .robot-avatar {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: float 3s ease-in-out infinite;
        filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.3));
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    h2 {
        color: var(--primary);
        font-size: 1.8rem;
        margin: 0 0 1.5rem 0;
        font-weight: 800;
        letter-spacing: -0.5px;
    }

    .text-body {
        color: var(--text-main);
        font-size: 1.05rem;
        line-height: 1.6;
        margin-bottom: 2rem;
        text-align: left;
    }

    p {
        margin: 0 0 1rem 0;
    }

    p:last-child {
        margin-bottom: 0;
    }

    .highlight {
        font-weight: 700;
        color: var(--color-4);
        background: rgba(146, 151, 254, 0.1);
        padding: 1rem;
        border-radius: var(--radius-sm);
        border-left: 4px solid var(--color-4);
        margin-top: 1.5rem;
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
