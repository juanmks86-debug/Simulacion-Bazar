# Catálogo dinámico desde CSV — cambios implementados

## Alcance

El catálogo de la interfaz deja de leer `PROD` (los diez productos fijos) cuando hay un CSV cargado. Se conserva el catálogo original como dataset de demostración de la simulación física cuando no se cargó un archivo.

## Construcción del catálogo

- Se agrupan ventas por nombre normalizado (`norm`), ignorando diferencias de mayúsculas, tildes y espacios repetidos.
- Cada producto se registra una sola vez.
- El precio de referencia es el último precio unitario válido según `fecha`; cuando la fecha no se puede interpretar, se respeta el orden de las filas.
- Las unidades y tickets se agregan desde el CSV.
- El costo inicial se calcula como `precio * 0.55`, equivalente a un margen bruto inicial del 45%.
- La rotación se estima comparando tickets por producto con la mediana del catálogo. Es una clasificación relativa al dataset, no una etiqueta comercial universal.
- Si no existe precio válido para un producto, se muestra como «Revisar precio» y se excluye de los cálculos económicos para no inventar ingresos o márgenes.

## Edición de economía unitaria

En `Catálogo dinámico de productos` se pueden editar costo y margen por producto. La edición se guarda en `localStorage` bajo `bazar:product-economics:v1` y se conserva al cambiar de pestaña o recargar el navegador. Al modificar costo se actualiza margen; al modificar margen se recalcula costo.

## Laboratorio de Decisiones Comerciales

1. Primero utiliza las reglas de asociación reales que Apriori encuentra en los tickets.
2. Si no hay reglas utilizables, ofrece pares de productos que efectivamente aparecen juntos en al menos un ticket. Se etiquetan como «Coaparición observada (exploratoria)», no como reglas Apriori.
3. Si no hay pares, ofrece fichas económicas individuales para productos con precio válido. Se etiquetan como «Evaluación económica individual (sin asociación)».

Así el panel puede seguir ofreciendo una evaluación económica aunque el rubro nuevo no tenga asociaciones fuertes. No se inventan asociaciones ni se presenta una ficha individual como combo descubierto.

## Monte Carlo

La evaluación financiera recibe los precios y costos del catálogo cargado y selecciona los dos productos con mayor frecuencia de tickets para construir el escenario genérico. Si solo hay un producto, ejecuta una variante promocional individual. Las distribuciones de demanda y descuento siguen siendo supuestos del modelo: no son una predicción estadística entrenada sobre el CSV.

## Escalabilidad

Para catálogos de más de 20 productos, el análisis de itemsets limita la longitud máxima a tres artículos para controlar el crecimiento combinatorio. Con 20 productos o menos mantiene el máximo de cuatro.

## Archivos modificados

- `src/sim/dynamicCatalog.ts` (nuevo): catálogo derivado y persistencia de costos/márgenes.
- `src/hooks/useDynamicCatalog.ts` (nuevo): hook compartido.
- `src/components/CatalogRows.tsx`: filas dinámicas y controles de edición.
- `src/sections/Catalog.tsx`: encabezado y columnas dinámicas.
- `src/sim/commercial.ts`: oportunidades con fallback explícito.
- `src/sections/Decisions.tsx`: conecta el laboratorio al catálogo CSV.
- `src/sim/stats.ts` y `src/sections/MonteCarlo.tsx`: economía dinámica en escenarios.
- `src/hooks/useAnalysis.ts` y `src/sim/validation.ts`: límite adaptativo para catálogos amplios.
- `src/sections/Sales.tsx`: gráfico de unidades según el CSV activo.
- `tests/csv.test.ts` y `tests/commercial.test.ts`: casos de catálogo dinámico y fallback.

## Validación pendiente

El ZIP recibido no contiene las dependencias instaladas de Node (solo directorios vacíos de `node_modules`). Se intentó instalar con `npm ci`, pero la operación agotó el tiempo disponible. Por eso esta entrega requiere ejecutar `npm ci`, `npm run typecheck`, `npm test` y `npm run build` en un entorno con acceso al registro de paquetes antes de considerarla validada en ejecución.
