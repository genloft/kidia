<script lang="ts">
    import { currentLanguage, t, type Language } from "../stores/i18n";

    const languages: { code: Language; label: string }[] = [
        { code: "es", label: "🇪🇸 Español" },
        { code: "en", label: "🇬🇧 English" },
        { code: "ru", label: "🇷🇺 Русский" },
    ];

    function changeLang(e: Event) {
        const target = e.target as HTMLSelectElement;
        currentLanguage.set(target.value as Language);
    }
</script>

<header class="top-bar">
    <div class="left-section">
        <div class="logo-container">
            <h1>Kidia</h1>
        </div>
    </div>

    <div class="right-section">
        <label for="lang-select" class="sr-only">Seleccionar Idioma</label>
        <div class="lang-wrapper">
            <select
                id="lang-select"
                class="lang-select"
                value={$currentLanguage}
                on:change={changeLang}
                aria-label={$t.language}
            >
                {#each languages as lang}
                    <option value={lang.code}>{lang.label}</option>
                {/each}
            </select>
            <span class="select-icon">▼</span>
        </div>

        <button class="btn-login" disabled>
            {$t.login}
        </button>
    </div>
</header>

<style>
    .top-bar {
        width: 100vw;
        height: 60px;
        background: var(--bg-main);
        border-bottom: 1px solid var(--border-stone);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.5rem;
        box-sizing: border-box;
        flex-shrink: 0;
        z-index: 1000000;
    }

    .left-section,
    .right-section {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .logo-container {
        display: flex;
        align-items: center;
    }

    h1 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 800;
        font-family:
            "Outfit",
            system-ui,
            -apple-system,
            sans-serif;
        background: linear-gradient(
            90deg,
            #00f0ff 0%,
            #5271ff 35%,
            #b026ff 70%,
            #ff1b6b 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -1px;
        line-height: 1;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }

    .lang-wrapper {
        position: relative;
    }

    .lang-select {
        appearance: none;
        background: var(--bg-panel);
        border: 1px solid var(--border-stone);
        border-radius: var(--radius-sm);
        color: var(--text-main);
        font-family: var(--font-body);
        font-size: 0.9rem;
        font-weight: 500;
        padding: 0.4rem 2rem 0.4rem 1rem;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
    }

    .lang-select:hover {
        border-color: var(--primary);
    }

    .lang-select:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(146, 151, 254, 0.3);
    }

    .lang-select option {
        background: var(--bg-main);
        color: var(--text-main);
    }

    .select-icon {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--text-muted);
        font-size: 0.6rem;
    }

    .btn-login {
        background: transparent;
        border: 1px solid var(--border-highlight);
        color: var(--text-muted);
        border-radius: var(--radius-sm);
        padding: 0.4rem 1rem;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: not-allowed;
        opacity: 0.6;
        transition: all 0.2s;
    }
</style>
