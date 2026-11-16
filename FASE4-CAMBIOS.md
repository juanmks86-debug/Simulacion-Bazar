# Fase 4 — Laboratorio de Decisiones Comerciales

## Objetivo

Conectar los patrones de compra descubiertos en la Fase 3 con una evaluación económica transparente de posibles combos. Se conserva la simulación 3D, el menú lateral y las secciones existentes.

## Cambios

- Nueva sección **Decisiones Comerciales** (`/decisiones`) accesible desde el sidebar.
- Lee las reglas del dataset activo mediante `useAnalysis`; no inventa tickets ni mezcla datos sintéticos con ventas reales.
- Detecta reglas de tres o más productos que incluyan al menos un artículo clasificado como estancado y cuyos nombres puedan asociarse al catálogo.
- Calcula precio conjunto, costo, margen bruto, descuento máximo compatible con el margen objetivo y descuento propuesto limitado por el tope elegido. Si el margen objetivo ya es inalcanzable sin descuento, lo informa en lugar de presentar el objetivo como cumplido.
- Permite ajustar el margen objetivo (20–65%) y el tope de descuento (0–35%).
- Exporta las oportunidades evaluadas a CSV.
- Etiqueta la procedencia del dataset y aclara que lift expresa asociación, no causalidad ni garantía de incremento de ventas.

## Supuestos y límites

- La economía unitaria utiliza precios y costos definidos en `src/sim/catalog.ts`; no sustituye una actualización de costos reales.
- El descuento se modela sobre el precio total del combo.
- Solo se muestran reglas con tres o más productos, al menos uno de rotación estancada y correspondencia con el catálogo.
- La salida es una herramienta de evaluación, no una predicción de demanda ni una asignación automática de promociones al motor 3D.

## Pruebas

`tests/commercial.test.ts` cubre el mapeo al catálogo, el respeto del margen mínimo, la exclusión de reglas no elegibles y la deduplicación.

## Validación

Se verificó sintaxis de los archivos nuevos/modificados y la lógica pura con pruebas aisladas. La validación completa de Vitest, TypeScript, ESLint y Vite requiere instalar dependencias con `npm ci` y ejecutar:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
