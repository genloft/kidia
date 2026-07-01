<script lang="ts">
	import ConstructorPage from './ConstructorPage.svelte';
	export let data;
	
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
		<ConstructorPage />
	</main>
</div>

<TooltipGlobal />

<style>
	.layout {
		display: flex;
		flex-direction: column;
		position: relative;
		flex: 1;
		min-height: 0;
		width: 100%;
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
			flex: none;
			min-height: 0;
			overflow-y: visible;
			overflow-x: hidden;
		}
		main {
			overflow: visible;
		}
	}
</style>

