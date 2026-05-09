<script lang="ts">
    import Tooltip from "./Tooltip.svelte";

    import { t } from "../../stores/i18n";

    export let text = "";

    function parseText(input: string, dict: Record<string, string>) {
        if (!input || !dict) return [];

        const keywords = Object.keys(dict).sort((a, b) => b.length - a.length);

        let parts = [{ isWord: false, text: input, tooltip: "" }];

        for (const word of keywords) {
            const regex = new RegExp(`\\b(${word})\\b`, "gi");
            let newParts: typeof parts = [];

            for (const part of parts) {
                if (part.isWord) {
                    newParts.push(part);
                    continue;
                }

                const splits = part.text.split(regex);

                splits.forEach((str) => {
                    if (str.toLowerCase() === word.toLowerCase()) {
                        newParts.push({
                            isWord: true,
                            text: str,
                            tooltip: dict[word],
                        });
                    } else if (str) {
                        newParts.push({
                            isWord: false,
                            text: str,
                            tooltip: "",
                        });
                    }
                });
            }
            parts = newParts;
        }
        return parts;
    }

    $: parsed = parseText(text, $t.tooltips || {});
</script>

<span>
    {#each parsed as part}
        {#if part.isWord}
            <Tooltip text={part.tooltip}>{part.text}</Tooltip>
        {:else}
            {part.text}
        {/if}
    {/each}
</span>
