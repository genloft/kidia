<script lang="ts">
    import { showTooltip, hideTooltip } from "../../stores/tooltipStore";
    export let text = "";

    function handleEnter(e: MouseEvent | FocusEvent) {
        showTooltip(text, e);
    }

    function handleLeave() {
        hideTooltip();
    }
</script>

<span
    class="tooltip-wrapper"
    on:mouseenter={handleEnter}
    on:mouseleave={handleLeave}
    on:focusin={handleEnter}
    on:focusout={handleLeave}
    role="button"
    tabindex="0"
    aria-label="Ayuda: {text}"
>
    <slot />
</span>

<style>
    .tooltip-wrapper {
        position: relative;
        display: inline-block;
        border-bottom: 2px dashed var(--color-3);
        cursor: help;
        transition: color 0.2s;
        font-weight: bold;
        color: var(--color-4);
    }

    .tooltip-wrapper:hover,
    .tooltip-wrapper:focus {
        color: var(--color-1);
        border-bottom-color: var(--color-1);
        outline: none;
    }
</style>
