# Kidia 🚀

Proyecto educativo de IA para niños (9-12 años).

## Estructura del Proyecto (Feature-Sliced Design)

*   **`src/pages`**: Rutas de la aplicación principal (Astro).
*   **`src/layouts`**: Plantillas maestras de Astro.
*   **`src/components`**: Componentes UI compartidos y de core (Header, Chat, Quiz).
*   **`src/features`**: Módulos encapsulados por dominio (ej. `constructor` en Svelte).
*   **`src/lib`**: Servicios globales (Supabase, OpenAI, Stripe) y sincronización.
*   **`src/styles`**: Variables CSS y estilos globales.

## Decisiones Técnicas y Stack

*   **Arquitectura de Islas**: Combinación de Astro (para SEO y rendimiento) y Svelte (para alta interactividad).
*   **Framework Core**: Astro v5 (Zero-JS por defecto, SSR parcial).
*   **Framework UI**: Svelte (usado exclusivamente en el Constructor interactivo).
*   **Base de Datos y Auth**: Supabase (PostgreSQL, Auth, Realtime).
*   **IA**: OpenAI API para generación y evaluación dinámica.
*   **Pagos**: Stripe integrado para la zona premium de padres.
*   **Estado**: Nano Stores para estado global (Astro) y Svelte Stores para estado local hiper-reactivo.
*   **Estilos**: CSS Vanilla con variables (theming) integrado por componentes.

## Ejecución Local

1.  Instalar dependencias:
    ```bash
    npm install
    ```

2.  Iniciar servidor de desarrollo (Astro + Svelte integrados):
    ```bash
    npm run dev
    ```

3.  Abrir en el navegador:
    `http://localhost:3000`
