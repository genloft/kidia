<script lang="ts">
    // Panel de resultado del entrenamiento (Fase C2). Antes, entrenar solo
    // escribía una línea en el log: no se veía qué había cambiado ni por qué
    // el modelo era peor. Aquí el niño lee el antes/después y el diagnóstico.
    import { trainResult } from "../stores/game";
    import { t } from "../stores/i18n";

    function cerrar() {
        trainResult.set(null);
    }

    function signo(n: number): string {
        return n > 0 ? `+${n}` : `${n}`;
    }
</script>

{#if $trainResult}
    {@const r = $trainResult}
    <section
        class="train-result {r.mejoro}"
        role="status"
        aria-live="polite"
        aria-label="Resultado del entrenamiento"
    >
        <div class="tr-head">
            <p class="tr-veredicto">{r.veredicto}</p>
            <button class="tr-cerrar" on:click={cerrar} aria-label="Cerrar resultado"
                >✕</button
            >
        </div>

        {#if r.bloqueo}
            <p class="tr-bloqueo">🔧 {r.bloqueo}</p>
        {/if}

        <div class="tr-metricas">
            {#each [{ k: "accuracy", label: $t.accuracy || "Precisión", c: "var(--color-4)" }, { k: "performance", label: $t.speed || "Velocidad", c: "var(--color-1)" }, { k: "complexity", label: $t.difficulty || "Dificultad", c: "var(--color-5)" }] as m}
                {@const valor = r.metricas[m.k]}
                {@const d = r.delta ? r.delta[m.k] : null}
                <div class="tr-metrica" style="--mc: {m.c}">
                    <span class="tr-label">{m.label}</span>
                    <span class="tr-valor">{valor}</span>
                    {#if d !== null && d !== 0}
                        <span class="tr-delta {d > 0 ? 'sube' : 'baja'}"
                            >{d > 0 ? "▲" : "▼"} {signo(d)}</span
                        >
                    {:else if d === 0}
                        <span class="tr-delta igual">=</span>
                    {/if}
                </div>
            {/each}
        </div>

        {#if r.diagnosticos.length > 0}
            <ul class="tr-diagnosticos">
                {#each r.diagnosticos as d (d.id)}
                    <li>
                        <span class="tr-icono" aria-hidden="true">{d.icono}</span>
                        <span class="tr-texto">
                            <strong>{d.titulo}</strong>
                            <span class="tr-expl">{d.explicacion}</span>
                            <span class="tr-pista">👉 {d.pista}</span>
                        </span>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>
{/if}

<style>
    .train-result {
        border: 1px solid var(--border-stone);
        border-left: 5px solid var(--primary);
        background: var(--bg-panel);
        border-radius: var(--radius-md);
        padding: 0.8rem 1rem;
        margin: 0 1.5rem 0.75rem;
        box-shadow: var(--shadow-md);
    }
    .train-result.mejor {
        border-left-color: var(--color-4);
    }
    .train-result.peor {
        border-left-color: var(--color-3);
    }

    .tr-bloqueo {
        margin: 0.6rem 0 0;
        padding: 0.6rem 0.75rem;
        border-radius: var(--radius-sm);
        background: rgba(245, 158, 11, 0.12);
        border-left: 3px solid var(--color-3);
        color: var(--text-main);
        font-size: 0.88rem;
        font-weight: 600;
        line-height: 1.4;
    }

    .tr-head {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }
    .tr-veredicto {
        flex: 1;
        margin: 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-main);
        line-height: 1.35;
    }
    .tr-cerrar {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--border-stone);
        background: var(--bg-main);
        color: var(--text-muted);
        cursor: pointer;
        font-size: 0.85rem;
        line-height: 1;
    }
    .tr-cerrar:hover {
        color: var(--text-main);
    }

    .tr-metricas {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.6rem;
    }
    .tr-metrica {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.1rem;
        padding: 0.35rem 0.25rem;
        border-radius: var(--radius-sm);
        background: var(--bg-main);
        border-top: 3px solid var(--mc);
    }
    .tr-label {
        font-size: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 700;
        color: var(--text-muted);
    }
    .tr-valor {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--mc);
        line-height: 1;
    }
    .tr-delta {
        font-size: 0.75rem;
        font-weight: 800;
    }
    .tr-delta.sube {
        color: var(--color-4);
    }
    .tr-delta.baja {
        color: #fca5a5;
    }
    .tr-delta.igual {
        color: var(--text-muted);
    }

    .tr-diagnosticos {
        list-style: none;
        margin: 0.7rem 0 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .tr-diagnosticos li {
        display: flex;
        gap: 0.6rem;
        background: var(--bg-main);
        border: 1px solid var(--border-stone);
        border-radius: var(--radius-sm);
        padding: 0.55rem 0.7rem;
    }
    .tr-icono {
        font-size: 1.3rem;
        line-height: 1.2;
    }
    .tr-texto {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        min-width: 0;
    }
    .tr-texto strong {
        font-size: 0.9rem;
        color: var(--text-main);
    }
    .tr-expl {
        font-size: 0.82rem;
        color: var(--text-muted);
        line-height: 1.35;
    }
    .tr-pista {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--color-3);
        line-height: 1.35;
    }

    @media (max-width: 900px) {
        .train-result {
            margin: 0 0.9rem 0.6rem;
            padding: 0.7rem 0.8rem;
        }
    }
</style>
