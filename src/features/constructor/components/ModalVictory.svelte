<script lang="ts">
    import { showVictoryModal, game, gameMetrics } from "../stores/game";
    import { t } from "../stores/i18n";
    import { tramo } from "../stores/tramo";
    import { getTextosTramo } from "../logic/tramo-config";
    import { registrarIACompletada } from "../logic/progression";
    import { fade, scale } from "svelte/transition";

    // El cierre lo escribe el tramo: a los 8 años no se ha desatado ninguna
    // singularidad, se ha construido una primera IA.
    $: textos = getTextosTramo($tramo);
    $: cuerpo = (textos?.victoriaCuerpo || $t.game?.victoryBody || "").split(
        "\n\n",
    );

    // La IA construida se guarda en el Cuaderno de Inventos con el nombre que
    // le ponga el niño: es SU creación, igual que los artefactos de las unidades.
    let nombreIA = "";
    let guardando = false;
    let guardada = false;

    async function guardarEnCuaderno() {
        if (guardando || guardada) return;
        guardando = true;
        const res = await registrarIACompletada(
            $tramo,
            $game,
            $gameMetrics,
            nombreIA,
        );
        guardada = res.guardada;
        guardando = false;
    }

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
            <img class="cosmic-avatar" src="/dravael-dance.webp" alt="Kidia" />
            <h2>{textos?.victoriaTitulo ||
                $t.game?.victoryTitle ||
                "¡Victoria!"}</h2>
            <div class="text-body">
                <p>
                    {cuerpo[0]}
                </p>
                <p class="highlight">
                    {cuerpo[1]}
                </p>
            </div>
            {#if guardada}
                <p class="guardada">
                    ✅ Guardada en tu <a href="/cuaderno">Cuaderno de Inventos</a>
                </p>
            {:else}
                <div class="guardar-zona">
                    <label class="guardar-label" for="nombre-ia">
                        Ponle nombre a tu IA y guárdala en tu Cuaderno
                    </label>
                    <div class="guardar-fila">
                        <input
                            id="nombre-ia"
                            class="guardar-input"
                            type="text"
                            maxlength="40"
                            bind:value={nombreIA}
                            placeholder="Mi IA increíble"
                            on:keydown={(e) =>
                                e.key === "Enter" && guardarEnCuaderno()}
                        />
                        <button
                            class="btn-guardar"
                            on:click={guardarEnCuaderno}
                            disabled={guardando}
                        >
                            {guardando ? "Guardando…" : "Guardar"}
                        </button>
                    </div>
                </div>
            {/if}

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
        width: 9rem;
        height: 9rem;
        object-fit: contain;
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
        background: linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-secondary));
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

    .guardar-zona {
        width: 100%;
        margin: 0.25rem 0 1rem;
        text-align: left;
    }
    .guardar-label {
        display: block;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-muted);
        margin-bottom: 0.4rem;
    }
    .guardar-fila {
        display: flex;
        gap: 0.5rem;
    }
    .guardar-input {
        flex: 1;
        min-width: 0;
        padding: 0.7rem 0.9rem;
        min-height: 48px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-stone);
        background: var(--bg-main);
        color: var(--text-main);
        font-family: var(--font-body);
        font-size: 1rem;
    }
    .guardar-input:focus {
        outline: none;
        border-color: var(--primary);
    }
    .btn-guardar {
        flex-shrink: 0;
        padding: 0.7rem 1.1rem;
        min-height: 48px;
        border: none;
        border-radius: var(--radius-sm);
        background: var(--primary);
        color: var(--bg-deep);
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
    }
    .btn-guardar:disabled {
        opacity: 0.6;
        cursor: default;
    }
    .guardada {
        margin: 0 0 1rem;
        font-weight: 700;
        color: var(--color-4);
    }
    .guardada a {
        color: inherit;
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
        background: linear-gradient(90deg, var(--color-accent), var(--color-secondary));
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
