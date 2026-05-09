<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { fade } from "svelte/transition";
    import { game, pieceFeedback } from "../stores/game";
    import { t } from "../stores/i18n";
    import type { Metrics } from "../types";

    let dismissed = false;
    let targetX = -1000;
    let targetY = -1000;
    let arrowDir = "top"; // top, bottom, left, right

    let lastStepTitle = "";
    let introStepIndex = 0;

    $: baseCurrentStep = getTutorialStep($game, introStepIndex);
    $: currentStep = getActiveStep(baseCurrentStep, $pieceFeedback);

    $: {
        if (currentStep && currentStep.title !== lastStepTitle) {
            lastStepTitle = currentStep.title;
            dismissed = false;
        }
    }

    $: isVisible = currentStep !== null && !dismissed;

    function formatEffects(eff: Partial<Metrics>) {
        let t = [];
        if (eff.accuracy)
            t.push(`Precisión ${eff.accuracy > 0 ? "+" : ""}${eff.accuracy}`);
        if (eff.performance)
            t.push(
                `Rendimiento ${eff.performance > 0 ? "+" : ""}${eff.performance}`,
            );
        if (eff.complexity)
            t.push(
                `Complejidad ${eff.complexity > 0 ? "+" : ""}${eff.complexity}`,
            );
        return t.length > 0 ? t.join(", ") : "Sin efecto numérico.";
    }

    function getActiveStep(
        base: ReturnType<typeof getTutorialStep>,
        feedback: typeof $pieceFeedback,
    ) {
        if (feedback.visible && feedback.piece && feedback.slot) {
            const translatedPieceName =
                $t.pieces?.[feedback.piece.id]?.name || feedback.piece.name;
            const translatedTooltip =
                $t.pieces?.[feedback.piece.id]?.tooltip ||
                feedback.piece.tooltip;
            return {
                title: `${$t.tut?.installed || "Instalado"}: ${translatedPieceName}`,
                message: `${translatedTooltip}\n\n${$t.tut?.impact || "Impacto"}: ${formatEffects(feedback.piece.effects)}`,
                targetId: `slot-${feedback.slot}`,
            };
        }
        return base;
    }

    function getTutorialStep(g: typeof $game, introIdx: number) {
        if (!g.hasSeenIntroTour) {
            const introSequence = [
                {
                    title: $t.tut?.welcomeTitle || "Welcome",
                    message: $t.tut?.welcomeMsg || "...",
                    targetId: "tut-title",
                    isIntro: true,
                },
                {
                    title: $t.tut?.libTitle || "Library",
                    message: $t.tut?.libMsg || "...",
                    targetId: "lib-p_data_raw",
                    isIntro: true,
                },
                {
                    title: $t.tut?.slotsTitle || "Slots",
                    message: $t.tut?.slotsMsg || "...",
                    targetId: "slot-Cerebro",
                    isIntro: true,
                },
                {
                    title: $t.tut?.mentorTitle || "Mentor",
                    message: $t.tut?.mentorMsg || "...",
                    targetId: "btn-train",
                    isIntro: true,
                },
                {
                    title: $t.tut?.startTitle || "Start",
                    message: $t.tut?.startMsg || "...",
                    targetId: "tut-title",
                    isIntro: true,
                },
            ];
            return introSequence[introIdx] || null;
        }

        if (g.currentStage === 1) {
            if (!g.placements.Datos) {
                return {
                    title: $t.tut?.stg1s1Title,
                    message: $t.tut?.stg1s1Msg,
                    targetId: "lib-p_data_raw",
                };
            }
            if (!g.placements.Cerebro) {
                return {
                    title: $t.tut?.stg1s2Title,
                    message: $t.tut?.stg1s2Msg,
                    targetId: "lib-p_model_linear",
                };
            }
            if (!g.placements.Entrenamiento) {
                return {
                    title: $t.tut?.stg1s3Title,
                    message: $t.tut?.stg1s3Msg,
                    targetId: "lib-p_labels",
                };
            }
            if (!g.placements.Examen) {
                return {
                    title: $t.tut?.stg1s4Title,
                    message: $t.tut?.stg1s4Msg,
                    targetId: "lib-p_metric_basic",
                };
            }
            if (!g.placements.Salida) {
                return {
                    title: $t.tut?.stg1s5Title,
                    message: $t.tut?.stg1s5Msg,
                    targetId: "lib-p_output_text",
                };
            }

            return {
                title: $t.tut?.stg1doneTitle,
                message: $t.tut?.stg1doneMsg,
                targetId: "btn-train",
            };
        } else if (g.currentStage === 2) {
            if (g.placements.Cerebro !== "p_layers") {
                return {
                    title: $t.tut?.stg2CerebroTitle,
                    message: $t.tut?.stg2CerebroMsg,
                    targetId: "lib-p_layers",
                };
            } else if (
                !g.placements.Entrenamiento ||
                g.placements.Entrenamiento !== "p_regularization"
            ) {
                return {
                    title: $t.tut?.stg2RegTitle,
                    message: $t.tut?.stg2RegMsg,
                    targetId: "lib-p_regularization",
                };
            }
        } else if (g.currentStage === 3) {
            if (g.placements.Datos !== "p_tokenizer") {
                return {
                    title: $t.tut?.stg3DatosTitle,
                    message: $t.tut?.stg3DatosMsg,
                    targetId: "lib-p_tokenizer",
                };
            } else if (g.placements.Cerebro !== "p_model_transformer") {
                return {
                    title: $t.tut?.stg3BrainTitle,
                    message: $t.tut?.stg3BrainMsg,
                    targetId: "lib-p_model_transformer",
                };
            }
        } else if (g.currentStage === 4) {
            if (g.placements.Datos !== "p_multimodal_in") {
                return {
                    title: $t.tut?.stg4DatosTitle,
                    message: $t.tut?.stg4DatosMsg,
                    targetId: "lib-p_multimodal_in",
                };
            } else if (
                g.placements.Entrenamiento !== "p_rlhf" &&
                g.placements.Examen !== "p_human_eval"
            ) {
                return {
                    title: $t.tut?.stg4Title,
                    message: $t.tut?.stg4Msg,
                    targetId: "lib-p_rlhf", // Just points to one of them as a hint
                };
            }
        } else if (g.currentStage === 5) {
            if (g.placements.Datos !== "p_exascale") {
                return {
                    title: $t.tut?.stg5DatosTitle,
                    message: $t.tut?.stg5DatosMsg,
                    targetId: "lib-p_exascale",
                };
            } else if (
                !g.placements.Cerebro ||
                g.placements.Cerebro !== "p_moe"
            ) {
                return {
                    title: $t.tut?.stg5Title,
                    message: $t.tut?.stg5Msg,
                    targetId: "lib-p_moe",
                };
            }
        }
        return null;
    }

    function dismiss() {
        if ($pieceFeedback.visible) {
            pieceFeedback.set({ ...$pieceFeedback, visible: false });
        } else if (!$game.hasSeenIntroTour) {
            // Avanzar en el tour
            if (introStepIndex < 4) {
                introStepIndex++;
            } else {
                game.completeIntroTour();
            }
        } else {
            dismissed = true;
        }
    }

    let animationFrame: ReturnType<typeof requestAnimationFrame>;

    function trackTarget() {
        if (currentStep && currentStep.targetId) {
            const el = document.getElementById(currentStep.targetId);
            if (el) {
                const rect = el.getBoundingClientRect();

                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;

                let prelimX = 0,
                    prelimY = 0,
                    dir = "top";
                if (cx < window.innerWidth * 0.3) {
                    prelimX = rect.right + 20;
                    prelimY = cy;
                    dir = "left";
                } else if (cx > window.innerWidth * 0.7) {
                    prelimX = rect.left - 20;
                    prelimY = cy;
                    dir = "right";
                } else {
                    prelimX = cx;
                    if (rect.bottom + 20 + 200 <= window.innerHeight) {
                        prelimY = rect.bottom + 20;
                        dir = "top";
                    } else {
                        prelimY = Math.max(20, rect.top - 20);
                        dir = "bottom";
                    }
                }

                // Smooth out sub-pixel jitter
                if (
                    Math.abs(targetX - prelimX) > 1 ||
                    Math.abs(targetY - prelimY) > 1
                ) {
                    targetX = prelimX;
                    targetY = prelimY;
                    arrowDir = dir;
                }
            }
        }
        animationFrame = requestAnimationFrame(trackTarget);
    }

    onMount(() => {
        trackTarget();
    });

    onDestroy(() => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
    });
</script>

{#if isVisible && currentStep}
    <div
        class="tutorial-overlay"
        role="dialog"
        transition:fade={{ duration: 200 }}
        style="--tx: {arrowDir === 'right' || arrowDir === 'left'
            ? '0px'
            : '-50%'}; --ty: {arrowDir === 'bottom'
            ? '-100%'
            : arrowDir === 'top'
              ? '0px'
              : '-50%'}; left: {targetX === -1000
            ? -2000
            : targetX}px; top: {targetY === -1000 ? -2000 : targetY}px;"
    >
        <div class="tutorial-box arrow-{arrowDir}">
            <div class="avatar">🤖</div>
            <div class="content">
                <h3 id="tut-title">{currentStep.title}</h3>
                <p id="tut-desc">{currentStep.message}</p>
                <button class="btn-gotit" on:click={dismiss}
                    >{$t.tut?.gotit || "¡Entendido!"}</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .tutorial-overlay {
        position: fixed;
        z-index: 10000;
        pointer-events: none;
        transform: translate(var(--tx, 0px), var(--ty, 0px));
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .tutorial-box {
        pointer-events: auto;
        background: var(--bg-deep);
        border: 4px solid var(--border-stone);
        border-radius: var(--radius-sm);
        padding: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        max-width: 320px;
        color: var(--text-main);
        display: flex;
        gap: 1rem;
        position: relative;
        animation: floatMsg 2s ease-in-out infinite;
    }

    .avatar {
        font-size: 3rem;
        filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.2));
        animation: bounceAvatar 2s infinite;
    }

    .content {
        flex: 1;
        text-align: left;
    }

    /* Directional Arrows */
    .tutorial-box::after {
        content: "";
        position: absolute;
        border-width: 12px;
        border-style: solid;
    }
    .arrow-left::after {
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-color: transparent var(--border-stone) transparent transparent;
    }
    .arrow-right::after {
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-color: transparent transparent transparent var(--border-stone);
    }
    .arrow-top::after {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-color: transparent transparent var(--border-stone) transparent;
    }
    .arrow-bottom::after {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-color: var(--border-stone) transparent transparent transparent;
    }

    h3 {
        margin: 0 0 0.5rem 0;
        font-weight: 900;
        font-size: 1.1rem;
        text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
    }

    p {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        line-height: 1.4;
        font-weight: bold;
    }

    .btn-gotit {
        background: var(--color-4);
        color: white;
        border: 3px solid var(--border-stone);
        border-bottom-width: 5px;
        border-radius: var(--radius-sm);
        padding: 0.5rem 1rem;
        font-weight: 800;
        cursor: pointer;
        width: 100%;
        transition:
            transform 0.1s,
            border-bottom-width 0.1s;
    }
    .btn-gotit:hover {
        transform: translateY(2px);
        border-bottom-width: 3px;
    }

    @keyframes floatMsg {
        0% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
        100% {
            transform: translateY(0);
        }
    }
    @keyframes bounceAvatar {
        0%,
        100% {
            transform: translateY(0) rotate(-5deg);
        }
        50% {
            transform: translateY(-10px) rotate(5deg);
        }
    }
</style>
