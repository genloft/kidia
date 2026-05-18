import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
    server: {
        port: 3000
    },
    integrations: [svelte()]
});
