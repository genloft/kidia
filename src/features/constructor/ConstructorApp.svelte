<script lang="ts">
	import ConstructorPage from './ConstructorPage.svelte';

	import TooltipGlobal from "./components/ui/TooltipGlobal.svelte";
	import TopBar from "./components/TopBar.svelte";
	import { game, showSingularityModal } from "./stores/game";
	import { showResetModal } from "./stores/ui";

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
			/* Ambos ejes en `visible`: con overflow-x:hidden el eje vertical
			   computa a `auto`, se crea un contenedor de scroll y la barra de
			   acción `sticky` del tablero deja de anclarse al viewport. */
			overflow: visible;
		}
		main {
			overflow: visible;
			padding: 0.75rem;
		}
	}
</style>

