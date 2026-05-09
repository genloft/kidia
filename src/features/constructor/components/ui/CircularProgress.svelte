<script lang="ts">
    export let value: number;
    export let color: string;
    export let label: string;

    const size = 64;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    $: displayValue = Math.min(Math.max(value, 0), 100);
    $: dashoffset = circumference - (displayValue / 100) * circumference;
</script>

<div class="circular-progress" aria-label="{label}: {value}%">
    <svg width={size} height={size}>
        <circle
            class="bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke-width={strokeWidth}
        />
        <circle
            class="fg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke-width={strokeWidth}
            stroke={color}
            stroke-dasharray={circumference}
            stroke-dashoffset={dashoffset}
            stroke-linecap="round"
        />
    </svg>
    <div class="inner-text">
        <span class="val">{Math.round(value)}</span>
    </div>
    <div class="metric-label">{label}</div>
</div>

<style>
    .circular-progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 64px;
        position: relative;
    }
    svg {
        transform: rotate(-90deg);
    }
    circle {
        fill: none;
    }
    .bg {
        stroke: var(--border-stone);
        opacity: 0.5;
    }
    .fg {
        transition: stroke-dashoffset 0.5s ease-in-out;
    }
    .inner-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, calc(-50% - 6px));
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .val {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--text-main);
    }
    .metric-label {
        margin-top: 0.2rem;
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-muted);
        text-align: center;
        letter-spacing: 0.5px;
    }
</style>
