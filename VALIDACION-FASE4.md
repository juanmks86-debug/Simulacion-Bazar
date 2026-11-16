# Validación técnica — Fase 4

Fecha: 16/11/2026
Artefacto revisado: `Simulacion-Bazar-Fase4-decisiones-comerciales.zip`

## Alcance revisado

- Se recuperó y abrió el ZIP guardado en la Biblioteca de archivos.
- Se inspeccionaron `src/sim/commercial.ts`, `src/sections/Decisions.tsx`, `tests/commercial.test.ts`, `src/hooks/useAnalysis.ts`, `src/sim/dataStore.ts`, `src/sim/salesData.ts`, `src/routes.ts` y `src/App.tsx`.
- Se verificó que la ruta `/decisiones` está conectada al menú y al enrutador.
- Se verificó que el módulo consume las reglas del análisis del dataset activo y que etiqueta los datos sintéticos.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
|---|---|
| Integridad del ZIP (`unzip -t`) | Correcta |
| Transpilación sintáctica TypeScript/TSX (72 archivos) | 0 errores sintácticos |
| `node --check` en los módulos JavaScript del motor | Correcto |
| Balance de llaves del CSS | 182 aperturas / 182 cierres |
| Prueba aislada del motor comercial | Correcta |
| Precio del combo Platos + Tazas + Canasta | $51.000 |
| Costo del combo | $23.600 |
| Margen sin descuento | 53,73% |
| Descuento propuesto con tope 15% | 15% |
| Margen después del descuento | 45,56% |
| Objetivo imposible (65%) sin descuento | Se marca como no alcanzable |
| Deduplicación de combos equivalentes | Correcta |
| Exclusión de combos sin producto estancado | Correcta |

La prueba aislada ejecutó la lógica real de `src/sim/commercial.ts` y sus módulos puros relacionados, en una copia temporal con extensiones explícitas para el cargador ESM de Node. No modifica el proyecto.

## Comprobaciones bloqueadas por el entorno

Se intentó instalar dependencias con `npm ci --no-audit --no-fund`, pero la instalación agotó el tiempo disponible. El directorio `node_modules` quedó incompleto y no contiene los ejecutables de Vitest ni ESLint.

Por esa razón no fue posible completar:

- `npm test` (Vitest no instalado).
- `npm run typecheck` (faltan los tipos de `node`, `vite/client` y `vitest/globals`).
- `npm run lint` (ESLint no instalado).
- `npm run build` (requiere dependencias completas y typecheck).

La transpilación sintáctica sin resolución de tipos no sustituye al typecheck. No se declara aprobado el build ni la batería completa de pruebas.

## Conclusión

La lógica financiera central de Fase 4 y la integración de la ruta fueron inspeccionadas y las comprobaciones aisladas indicadas arriba pasaron. La validación integral queda **parcial**, pendiente de ejecutar los cuatro comandos de calidad en un entorno donde `npm ci` pueda completar correctamente.

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```
