<script lang="ts">
    // El momento ético antes de la victoria (Fase C3). Morti en 12-14, la
    // Dra. Vael en 10-11; en 8-9 no se monta nunca (ver logic/etica.ts).
    import { showEticaModal, game, cerrarEtica } from "../stores/game";
    import { tramo } from "../stores/tramo";
    import { elegirDilema, type OpcionEtica } from "../logic/etica";
    import { fade, scale } from "svelte/transition";

    $: dilema = $showEticaModal ? elegirDilema($game, $tramo) : null;

    let elegida: OpcionEtica | null = null;

    function responder(op: OpcionEtica) {
        elegida = op;
    }

    function continuar() {
        const responsable = elegida?.responsable ?? false;
        elegida = null;
        cerrarEtica(responsable);
    }
</script>

{#if $showEticaModal && dilema}
    <div class="modal-backdrop" transition:fade={{ duration: 300 }}>
        <div
            class="modal-content {dilema.interlocutor}"
            transition:scale={{ start: 0.95, duration: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label={dilema.interlocutor === "morti"
                ? "Morti te hace una pregunta"
                : "La Dra. Vael te hace una pregunta"}
        >
            <div class="pers">
                <img
                    class="pers-avatar"
                    src={dilema.interlocutor === "morti"
                        ? "/morti.webp"
                        : "/dravael-doubt.webp"}
                    alt=""
                />
                <span class="pers-nombre"
                    >{dilema.interlocutor === "morti"
                        ? "Morti"
                        : "Dra. Vael"}</span
                >
            </div>

            <p class="entradilla">{dilema.entradilla}</p>
            <h2>{dilema.pregunta}</h2>

            {#if !elegida}
                <ul class="opciones">
                    {#each dilema.opciones as op (op.id)}
                        <li>
                            <button
                                class="opcion"
                                on:click={() => responder(op)}
                            >
                                {op.texto}
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else}
                <div class="replica" role="status">
                    <p>{elegida.replica}</p>
                </div>
                <button class="btn-seguir" on:click={continuar}>
                    Seguir
                </button>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99990;
        padding: 1rem;
    }

    .modal-content {
        background: var(--bg-panel);
        border: 1px solid var(--border-stone);
        border-top: 5px solid var(--pers-color, var(--primary));
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 1.5rem;
        max-width: 520px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        text-align: left;
    }
    /* Morti tiene voz propia: morada, distinta de la guía. */
    .modal-content.morti {
        --pers-color: var(--k-violet-300);
    }
    .modal-content.vael {
        --pers-color: var(--primary);
    }

    .pers {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 0.75rem;
    }
    .pers-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--pers-color);
        background: var(--bg-main);
    }
    .pers-nombre {
        font-weight: 800;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--pers-color);
    }

    .entradilla {
        margin: 0 0 0.4rem;
        color: var(--text-muted);
        font-size: 0.95rem;
        line-height: 1.45;
    }
    h2 {
        margin: 0 0 1rem;
        font-size: 1.2rem;
        color: var(--text-main);
        line-height: 1.3;
    }

    .opciones {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
    }
    .opcion {
        width: 100%;
        text-align: left;
        padding: 0.85rem 1rem;
        min-height: 48px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-stone);
        background: var(--bg-main);
        color: var(--text-main);
        font-family: var(--font-body);
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.35;
        cursor: pointer;
        transition: border-color 0.2s ease;
    }
    .opcion:hover {
        border-color: var(--pers-color);
    }

    .replica {
        background: var(--bg-main);
        border-left: 4px solid var(--pers-color);
        border-radius: var(--radius-sm);
        padding: 0.85rem 1rem;
        margin-bottom: 1rem;
    }
    .replica p {
        margin: 0;
        color: var(--text-main);
        line-height: 1.5;
    }

    .btn-seguir {
        width: 100%;
        padding: 0.85rem;
        min-height: 48px;
        border: none;
        border-radius: var(--radius-md);
        background: var(--pers-color);
        color: var(--bg-deep);
        font-weight: 800;
        font-size: 1rem;
        cursor: pointer;
    }

    @media (prefers-reduced-motion: reduce) {
        .opcion {
            transition: none;
        }
    }
</style>
