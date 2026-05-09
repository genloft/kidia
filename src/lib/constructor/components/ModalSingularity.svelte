<script lang="ts">
    import { showSingularityModal } from "../stores/game";
    import { t } from "../stores/i18n";

    let dialog: HTMLDialogElement;

    $: if (dialog) {
        if ($showSingularityModal && !dialog.open) {
            dialog.showModal();
        } else if (!$showSingularityModal && dialog.open) {
            dialog.close();
        }
    }

    function close() {
        showSingularityModal.set(false);
    }
</script>

<!-- Utilizando el elemento nativo <dialog> que incluye Focus Trap e interacciones ARIA automáticas -->
<dialog bind:this={dialog} on:close={close} aria-labelledby="modal-title">
    <div class="modal-content">
        <header>
            <h2 id="modal-title">{$t.singularityTitle}</h2>
            <button
                class="close-btn"
                on:click={close}
                aria-label={$t.closeWindow}>✕</button
            >
        </header>

        <div class="modal-body">
            <section>
                <h3>{$t.singq1}</h3>
                <p>
                    {$t.singa1}
                </p>
            </section>

            <section>
                <h3>{$t.singq2}</h3>
                <p>
                    {$t.singa2}
                </p>
            </section>

            <section>
                <h3>{$t.singq3}</h3>
                <ul class="reasons">
                    <li>
                        <strong>{$t.singr1Title}</strong>
                        {$t.singr1Body}
                    </li>
                    <li>
                        <strong>{$t.singr2Title}</strong>
                        {$t.singr2Body}
                    </li>
                    <li>
                        <strong>{$t.singr3Title}</strong>
                        {$t.singr3Body}
                    </li>
                </ul>
            </section>

            <div class="axiom-box">
                <p class="highlight">{$t.singAxiom}</p>
            </div>
        </div>
    </div>
</dialog>

<style>
    dialog {
        padding: 0;
        border: none;
        border-radius: var(--radius-md);
        background: var(--bg-panel);
        color: var(--text-main);
        max-width: 600px;
        width: 90%;
        box-shadow: var(--shadow-lg);
        opacity: 0;
        transform: scale(0.95);
        transition:
            opacity 0.3s ease,
            transform 0.3s ease;
    }

    dialog[open] {
        opacity: 1;
        transform: scale(1);
    }

    dialog::backdrop {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        animation: fade-in 0.3s ease-out;
    }

    @keyframes fade-in {
        from {
            background: rgba(15, 23, 42, 0);
            backdrop-filter: blur(0px);
        }
        to {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
        }
    }

    .modal-content {
        display: flex;
        flex-direction: column;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--border-stone);
        background: var(--bg-main);
        border-top-left-radius: var(--radius-md);
        border-top-right-radius: var(--radius-md);
    }

    h2 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--primary);
        font-weight: 700;
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        margin: 0;
        line-height: 1;
        transition: color 0.2s;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .close-btn:hover,
    .close-btn:focus {
        color: var(--text-main);
        background: var(--border-stone);
    }

    .modal-body {
        padding: 1.5rem;
        font-size: 0.95rem;
        line-height: 1.6;
        overflow-y: auto;
        max-height: 70vh;
    }

    section {
        margin-bottom: 1.5rem;
    }

    h3 {
        font-size: 1.05rem;
        color: var(--text-main);
        margin: 0 0 0.5rem 0;
        font-weight: 700;
    }

    p {
        margin: 0;
        color: var(--text-muted);
    }

    .reasons {
        padding-left: 1.2rem;
        margin: 0.5rem 0 0 0;
        color: var(--text-muted);
    }

    .reasons li {
        margin-bottom: 0.5rem;
    }

    .reasons strong {
        color: var(--primary);
    }

    .axiom-box {
        margin-top: 2rem;
        padding: 1.5rem;
        background: var(--bg-deep);
        border-radius: var(--radius-sm);
        text-align: center;
        border-left: 4px solid var(--primary);
    }

    .highlight {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--primary);
        letter-spacing: 0.5px;
    }
</style>
