# Fase 1 — Correcciones y estabilización

Se conserva la interfaz, el diseño, la navegación y la estructura general del proyecto.

## Correcciones realizadas

- **Pack Mesa:** el KPI `Combos Pack Mesa` ahora cuenta tickets pagados que contienen los cuatro productos (Platos, Tazas, Servilletero y Canasta). El descuento del 15% de la canasta continúa activándose al tener los tres antecedentes, como estaba diseñado.
- **Promoción 2x1:** si el stock disponible no alcanza para entregar dos unidades, se cobra una sola unidad y la venta ya no se marca falsamente como una promoción aplicada.
- **CSV e ingresos:** se advierten precios faltantes o inválidos. Los ingresos generales se muestran como incompletos (`null`) si falta el precio de alguna línea; el ingreso por producto se conserva cuando todas sus líneas tienen precio válido.
- **Resumen vacío:** el promedio de productos por ticket devuelve `0` y no `NaN` cuando no hay ventas.
- **Persistencia CSV:** un CSV inválido deja intacto el último conjunto válido y el mensaje identifica qué archivo continúa activo. Los archivos demasiado grandes o que no pueden persistirse eliminan una copia anterior para evitar restaurar datos desactualizados. También se elimina una copia guardada que no pueda restaurarse.
- **Aleatoriedad:** el orden aleatorio de productos del perfil curioso utiliza Fisher–Yates en lugar de ordenar con un comparador aleatorio.

## Archivos modificados

- `src/sim/pricing.ts`
- `src/sim/logic.js`
- `src/sim/random.ts` (nuevo)
- `src/sim/salesData.ts`
- `src/sim/dataStore.ts`
- `tests/pricing.test.ts`
- `tests/csv.test.ts`
- `tests/random.test.ts` (nuevo)

## Verificación

- `node --check src/sim/logic.js`: correcto.
- `git diff --check`: correcto.
- TypeScript de los módulos de catálogo, precios, aleatoriedad, CSV y almacenamiento: verificado con `tsc --noEmit` y `typeRoots` aislado.
- Se ejecutaron 11 comprobaciones manuales aisladas sobre precios, promoción 2x1, Pack Mesa, resumen CSV y Fisher–Yates: correctas.
- No se pudo ejecutar Vitest ni la compilación integral: la instalación de dependencias (`npm ci`) agotó el tiempo disponible en el entorno. Ejecutar localmente `npm ci`, `npm test`, `npm run build` y `npm run lint` antes de desplegar.
- La prueba opcional `npm run test:regression` usa snapshots de comportamiento previos. Como esta fase corrige el conteo del Pack Mesa y el orden aleatorio, esos snapshots deben regenerarse y revisarse intencionalmente con `npm run test:regression -- --update` en un entorno que tenga instalado `canvas`; no se actualizaron a ciegas.
