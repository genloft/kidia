<script lang="ts">
    import { tooltipStore } from "../../stores/tooltipStore";
</script>

{#if $tooltipStore.visible}
    <div
        class="tooltip-global-content"
        role="tooltip"
        style="
            left: {$tooltipStore.x}px; 
            top: {$tooltipStore.y}px;
        "
    >
        {$tooltipStore.text}
    </div>
{/if}

<style>
    .tooltip-global-content {
        position: fixed;
        /* Center horizontally around mouse, offset upward so cursor doesn't block it */
        transform: translate(-50%, calc(-100% - 15px));
        background: var(--bg-deep);
        color: var(--text-main);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        border: 4px solid var(--border-stone);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        font-size: 0.85rem;
        font-weight: normal;
        white-space: normal;
        width: max-content;
        max-width: 250px;
        text-align: center;
        z-index: 99999; /* Highest priority to escape all clipping */
        pointer-events: none;
        animation: pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* Small triangle pointer pointing down to the cursor */
    .tooltip-global-content::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 8px;
        border-style: solid;
        border-color: var(--border-stone) transparent transparent transparent;
    }

    @keyframes pop {
        from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translate(-50%, calc(-100% - 15px)) scale(1);
        }
    }
</style>
