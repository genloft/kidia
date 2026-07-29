<script lang="ts">
	import PieceLibrary from "./components/PieceLibrary.svelte";
	import Board from "./components/Board.svelte";
	import FloatingMentor from "./components/FloatingMentor.svelte";
	import ModalSingularity from "./components/ModalSingularity.svelte";
	import ModalReset from "./components/ModalReset.svelte";
	import DevPanel from "./components/DevPanel.svelte";
	import TutorialOverlay from "./components/TutorialOverlay.svelte";
	import ModalWelcome from "./components/ModalWelcome.svelte";
	import ModalVictory from "./components/ModalVictory.svelte";
	import ModalEtica from "./components/ModalEtica.svelte";
	import ModalStageIntro from "./components/ModalStageIntro.svelte";
	import { game } from "./stores/game";
	import { initTramo } from "./stores/tramo";
	import { onMount } from "svelte";

	onMount(() => {
		// Verify if it's the first time so we can show the Welcome Modal
		game.initCheck();
		// Adapta piezas, huecos, etapas y vocabulario al tramo del hijo/a activo.
		initTramo();
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
<ModalEtica />
<ModalVictory />
{#if import.meta.env.DEV}
	<DevPanel />
{/if}

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
