<script lang="ts">
    import { game } from "../stores/game";
    import { showResetModal } from "../stores/ui";
    import { t } from "../stores/i18n";

    let dialog: HTMLDialogElement;

    $: if (dialog) {
        if ($showResetModal && !dialog.open) {
            dialog.showModal();
        } else if (!$showResetModal && dialog.open) {
            dialog.close();
        }
    }

    function close() {
        showResetModal.set(false);
    }

    function confirmReset() {
        game.reset();
        close();
    }
</script>

<dialog bind:this={dialog} on:close={close} aria-labelledby="reset-title">
    <div class="modal-content">
        <header>
            <h2 id="reset-title">{$t.resetTitle}</h2>
            <button class="close-btn" on:click={close} aria-label={$t.cancel}
                >✕</button
            >
        </header>

        <div class="modal-body">
            <p>
                {$t.resetBody1}
            </p>
            <p class="warning-text">{$t.resetWarning}</p>
        </div>

        <footer>
            <button class="btn-cancel" on:click={close}>{$t.cancel}</button>
            <button class="btn-danger" on:click={confirmReset}
                >{$t.yesReset}</button
            >
        </footer>
    </div>
</dialog>

<style>
    dialog {
        padding: 0;
        border: none;
        border-radius: var(--radius-md);
        background: var(--bg-panel);
        color: var(--text-main);
        max-width: 400px;
        width: 90%;
        box-shadow: var(--shadow-lg);
        opacity: 0;
        transform: scale(0.95);
        transition:
            opacity 0.2s ease,
            transform 0.2s ease;
    }

    dialog[open] {
        opacity: 1;
        transform: scale(1);
    }

    dialog::backdrop {
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
    }

    .modal-content {
        display: flex;
        flex-direction: column;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-stone);
        background: var(--bg-main);
        border-top-left-radius: var(--radius-md);
        border-top-right-radius: var(--radius-md);
    }

    h2 {
        margin: 0;
        font-size: 1.15rem;
        color: #ef4444;
        font-weight: 700;
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.2s;
    }

    .close-btn:hover {
        color: var(--text-main);
        background: var(--border-stone);
    }

    .modal-body {
        padding: 1.5rem;
        font-size: 0.95rem;
        color: var(--text-muted);
    }

    .warning-text {
        color: #ef4444;
        margin-top: 1rem;
        font-weight: 600;
    }

    footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border-stone);
        background: var(--bg-main);
        border-bottom-left-radius: var(--radius-md);
        border-bottom-right-radius: var(--radius-md);
    }

    button {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-cancel {
        background: var(--bg-panel);
        border: 1px solid var(--border-stone);
        color: var(--text-muted);
    }

    .btn-cancel:hover {
        background: var(--bg-deep);
        color: var(--text-main);
    }

    .btn-danger {
        background: #ef4444;
        border: none;
        color: white;
    }

    .btn-danger:hover {
        background: #dc2626;
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
    }
</style>
