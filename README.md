# Meliact

Aplicación Astro + React para editar fórmulas de precio y sincronizar listados de proveedores con plantillas de Mercado Libre.

## 💡 Qué hace este proyecto

Meliact es una herramienta de gestión y sincronización que te permite:

- Definir reglas de precio por proveedor.
- Configurar comisión de Plantilla y porcentajes de IVA.
- Simular precios finales sobre un costo base.
- Importar y exportar configuración de reglas en JSON.
- Cargar archivos Excel de proveedores y plantillas oficiales de Meli.
- Mapear columnas de tu lista con los campos requeridos.
- Actualizar precios y stock en la plantilla ML y descargar el resultado.

## 🧭 Páginas principales

- `/precio`: editor de fórmulas y simulador de precios.
- `/sincronizador`: flujo de sincronización en 3 pasos entre archivo proveedor y plantilla ML.
- `/`: página principal de inicio (placeholder).

## 🧱 Estructura relevante

- `src/pages/` — rutas de Astro.
- `src/components/pricing/` — UI para fórmulas, proveedores y simulador.
- `src/components/synchronizer/` — paso a paso de carga, mapeo y procesamiento.
- `src/hooks/` — lógica de lectura de Excel, precios y sincronización.
- `src/store/` — estado persistente de reglas y configuración con `zustand`.
- `src/utils/` — utilidades de Excel, reglas y coincidencias.

## 🚀 Tecnologías usadas

- `Astro` como framework principal.
- `React` para los componentes del editor y sincronizador.
- `Tailwind CSS` para estilos.
- `Zustand` para persistencia del estado.
- `xlsx` para lectura y generación de archivos Excel.

## ⚙️ Requisitos

- Node.js >= `22.12.0`
- `pnpm` instalado globalmente

## 📦 Instalación y uso

Desde la raíz del proyecto:

```sh
pnpm install
pnpm dev
```

Abre tu navegador en:

```sh
http://localhost:4321
```

## 🛠️ Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo. |
| `pnpm build` | Genera la versión de producción en `dist/`. |
| `pnpm preview` | Previsualiza el sitio generado. |
| `pnpm astro` | Ejecuta comandos de Astro. |

## 📁 Flujo de uso principal

### Editor de precios (`/precio`)

1. Ajusta la comisión global de Mercado Libre.
2. Configura el porcentaje de IVA.
3. Agrega proveedores y define rangos de precio por costo.
4. Usa el simulador para ver el precio final según el costo base.
5. Exporta o importa tu configuración en JSON.

### Sincronizador (`/sincronizador`)

1. Carga el archivo del proveedor con costos y stocks.
2. Carga la plantilla oficial de Mercado Libre.
3. Mapea las columnas obligatorias (`Código/OEM`, `Precio`, `Stock`, `Nombre proveedor`).
4. Ejecuta la sincronización para actualizar precio y stock.
5. Descarga el archivo resultante con los valores ajustados.

## 🧪 Consideraciones

- El proyecto procesa archivos Excel directamente en el navegador.
- La plantilla ML debe incluir la hoja `Publicaciones`.
- El estado de proveedor y reglas se guarda localmente en el navegador.

## 📌 Nota

El contenido actual está pensado para uso interno y validación de listas. Si deseas expandirlo, puedes añadir:
- soporte de múltiples hojas en la plantilla ML,
- importación de catálogos adicionales,
- validaciones avanzadas de columnas y coincidencias,
- generación de reportes en PDF.
