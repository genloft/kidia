<script lang="ts">
    import { game } from "../stores/game";

    let isOpen = false;

    function toggle() {
        isOpen = !isOpen;
    }
</script>

<div class="dev-panel {isOpen ? 'open' : ''}">
    <button
        class="toggle-btn"
        on:click={toggle}
        aria-label="Toggle Debug Panel"
    >
        {isOpen ? "↓ Debug Data" : "↑ Debug"}
    </button>

    {#if isOpen}
        <div class="json-view">
            <pre><code>{JSON.stringify($game, null, 2)}</code></pre>
        </div>
    {/if}
</div>

<style>
    .dev-panel {
        position: fixed;
        bottom: 0;
        left: 20px;
        background: #111827;
        border: 1px solid #374151;
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        z-index: 9999;
        font-family: monospace;
        box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.5);
        width: 400px;
        max-width: 90vw;
        transition: transform 0.3s ease;
    }

    .toggle-btn {
        width: 100%;
        padding: 0.25rem;
        background: #1f2937;
        color: #9ca3af;
        border: none;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        font-size: 0.75rem;
        border-bottom: 1px solid #374151;
    }

    .toggle-btn:hover {
        background: #374151;
        color: #e5e7eb;
    }

    .json-view {
        padding: 1rem;
        max-height: 400px;
        overflow-y: auto;
        color: #10b981;
        font-size: 0.75rem;
        background: #0f172a;
    }

    pre {
        margin: 0;
    }

    /* Scrollbar custom */
    .json-view::-webkit-scrollbar {
        width: 8px;
    }
    .json-view::-webkit-scrollbar-track {
        background: #0f172a;
    }
    .json-view::-webkit-scrollbar-thumb {
        background: #374151;
        border-radius: 4px;
    }
</style>
