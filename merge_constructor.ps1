$ErrorActionPreference = 'Stop'

Write-Host "Iniciando fusión del constructor en la app principal..."

# 1. Instalar integración de Svelte en Astro
Write-Host "Instalando @astrojs/svelte y dependencias..."
npx astro add svelte -y

# 2. Mover la carpeta lib de constructor a src/lib/constructor
Write-Host "Copiando archivos fuente..."
if (!(Test-Path -Path "src\lib\constructor")) {
    New-Item -ItemType Directory -Force -Path "src\lib\constructor" | Out-Null
}
Copy-Item -Path "constructor\src\lib\*" -Destination "src\lib\constructor" -Recurse -Force

# 3. Copiar componentes principales del constructor
Copy-Item -Path "constructor\src\routes\+layout.svelte" -Destination "src\components\ConstructorLayout.svelte" -Force
Copy-Item -Path "constructor\src\routes\+page.svelte" -Destination "src\components\ConstructorPage.svelte" -Force

# Reemplazar la etiqueta <slot /> en ConstructorLayout con <ConstructorPage />
$layoutContent = Get-Content "src\components\ConstructorLayout.svelte" -Raw
$layoutContent = $layoutContent -replace 'import "\.\./app\.css";', ''
$layoutContent = $layoutContent -replace '<slot\s*/>', '<ConstructorPage />'
$layoutContent = $layoutContent -replace '<script lang="ts">', "<script lang=`"ts`">`n`timport ConstructorPage from './ConstructorPage.svelte';"
Set-Content -Path "src\components\ConstructorApp.svelte" -Value $layoutContent -Encoding UTF8

# 4. Copiar los estilos globales del constructor a la app
if (Test-Path -Path "constructor\src\app.css") {
    Copy-Item -Path "constructor\src\app.css" -Destination "src\styles\constructor.css" -Force
}

# 5. Crear la página constructor.astro
Write-Host "Creando ruta /constructor en Astro..."
$astroPage = @"
---
import Layout from '../layouts/Layout.astro';
import ConstructorApp from '../components/ConstructorApp.svelte';
import '../styles/constructor.css';
---

<Layout title="Constructor - Kidia">
  <!-- El componente Svelte debe renderizarse en el cliente para su interactividad -->
  <ConstructorApp client:only="svelte" />
</Layout>
"@
Set-Content -Path "src\pages\constructor.astro" -Value $astroPage -Encoding UTF8

Write-Host "¡Fusión completada! Ahora todo corre bajo Astro."
Write-Host "Para iniciar la aplicación unificada, ejecuta: npm run dev"
