import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

// Ruta /dev/ui (biblioteca del sistema de diseño) SOLO en `astro dev`:
// el fichero vive en src/dev/ (fuera de pages/) y la ruta se inyecta aquí,
// así jamás se publica en el build de producción.
const devOnlyRoutes = {
    name: 'kidia-dev-routes',
    hooks: {
        'astro:config:setup': ({ injectRoute, command }) => {
            if (command === 'dev') {
                injectRoute({ pattern: '/dev/ui', entrypoint: './src/dev/ui.astro' });
            }
        }
    }
};

// https://astro.build/config
export default defineConfig({
    site: 'https://kidia.es',
    server: {
        port: 3000
    },
    integrations: [svelte(), sitemap(), devOnlyRoutes]
});
