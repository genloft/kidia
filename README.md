# Kidia 🚀

Proyecto educativo de IA para niños (9-12 años).

## Estructura del Proyecto

*   **`src/pages`**: Rutas de la aplicación (Home, Escenario, Perfil).
*   **`src/components`**: Componentes reutilizables (Chat, Friend, Quiz).
*   **`src/lib`**: Lógica de negocio (Contenido de escenarios, Estado global).
*   **`src/styles`**: Variables CSS y estilos globales.

## Decisiones Técnicas

*   **Framework**: Astro (Rendimiento estático por defecto).
*   **Estilos**: CSS Vaniila con Variables para theming fácil.
*   **Estado**: Nano Stores + LocalStorage (Persistencia sin backend).
*   **Interacción**: Vanilla JS para ligereza en Chat y Quiz.

## Ejecución Local

1.  Instalar dependencias:
    ```bash
    npm install
    ```

2.  Iniciar servidor de desarrollo:
    ```bash
    npm run dev
    ```

3.  Abrir en el navegador:
    `http://localhost:3000`

## Próximos Pasos (Fase 2)

*   Integrar Supabase para auth real.
*   Conectar OpenAI API para chats dinámicos.
*   Añadir pasarela de pago (Stripe) para modo "Premium".
