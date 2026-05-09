<script lang="ts">
	export let data;
	import PieceLibrary from "$lib/components/PieceLibrary.svelte";
	import Board from "$lib/components/Board.svelte";
	import FloatingMentor from "$lib/components/FloatingMentor.svelte";
	import ModalSingularity from "$lib/components/ModalSingularity.svelte";
	import ModalReset from "$lib/components/ModalReset.svelte";
	import DevPanel from "$lib/components/DevPanel.svelte";
	import TutorialOverlay from "$lib/components/TutorialOverlay.svelte";
	import ModalWelcome from "$lib/components/ModalWelcome.svelte";
	import ModalVictory from "$lib/components/ModalVictory.svelte";
	import ModalStageIntro from "$lib/components/ModalStageIntro.svelte";
	import { game } from "$lib/stores/game";
	import { onMount } from "svelte";

	onMount(() => {
		// Verify if it's the first time so we can show the Welcome Modal
		game.initCheck();
	});
</script>

<svelte:head>
	<title>Kidia | Constructor de IA</title>
</svelte:head>

<div class="workspace">
	<div class="workspace-content">
		<PieceLibrary />
		<Board />
	</div>
</div>

<FloatingMentor />
<ModalSingularity />
<ModalReset />
<TutorialOverlay />
<ModalWelcome />
<ModalStageIntro />
<ModalVictory />
<DevPanel />

<style>
	.workspace {
		width: 100%;
		flex: 1;
		min-height: 0;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		box-sizing: border-box;
	}

	.workspace-content {
		/* En lugar de 3 columnas, ahora son 2, dando más ancho a la parte central */
		display: grid;
		grid-template-columns: 320px 1fr;
		flex: 1;
		gap: 1.5rem;
		min-height: 0;
	}

	:global(.workspace-content > *) {
		min-height: 0;
		max-height: 100%;
	}

	@media (max-width: 1024px) {
		.workspace {
			display: flex;
			flex-direction: column;
			height: auto;
		}
		.workspace-content {
			display: flex;
			flex-direction: column;
			overflow: visible;
		}
	}
</style>
