<script lang="ts">
	export let data;
	import "../app.css";
	import TooltipGlobal from "$lib/components/ui/TooltipGlobal.svelte";
	import TopBar from "$lib/components/TopBar.svelte";
	import { game, showSingularityModal } from "$lib/stores/game";
	import { showResetModal } from "$lib/stores/ui";

	function handleReset() {
		showResetModal.set(true);
	}
</script>

<div class="layout">
	<TopBar />
	<main>
		<slot />
	</main>
</div>

<TooltipGlobal />

<style>
	.layout {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		box-sizing: border-box;
	}
	main {
		flex: 1;
		padding: 1.5rem;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-height: 0;
	}

	@media (max-width: 1024px) {
		.layout {
			height: auto;
			min-height: 100vh;
			overflow-y: auto;
			overflow-x: hidden;
		}
		main {
			overflow: visible;
		}
	}
</style>
