# Fase 3 — Laboratorio de Minería de Datos

## Objetivo

Convertir las vistas de comparación, sensibilidad y Bootstrap que antes mostraban cifras estáticas en herramientas calculadas sobre el CSV activo, e incorporar FP-Growth como segundo algoritmo de minería. Se conserva el diseño general, el menú lateral, el simulador isométrico y la estructura de rutas.

## Cambios implementados

### 1. FP-Growth real (`src/sim/fpGrowth.ts`)

- Implementación de FP-tree con conteos ponderados, ordenamiento de ítems frecuentes y minería recursiva de bases condicionales.
- Respeta soporte mínimo y tamaño máximo de itemset.
- Devuelve el mismo formato `Itemset` que Apriori para que las métricas y reglas sean comparables.

### 2. Comparación de algoritmos (`src/sim/validation.ts`, `src/sections/AprioriVsFp.tsx`)

- Compara Apriori y FP-Growth con exactamente las mismas canastas, soporte, confianza y tamaño máximo.
- Presenta cantidad de itemsets, reglas, coincidencias y conjuntos exclusivos de cada algoritmo.
- Muestra reglas encontradas por FP-Growth y propuestas de combos de tres o más productos.
- No afirma que FP-Growth sea más rápido: no se reporta rendimiento sin un benchmark controlado.

### 3. Bootstrap ejecutable (`src/sections/Bootstrap.tsx`)

- Remuestreo con reemplazo de tickets, con 100, 250, 500 o 1000 iteraciones.
- Calcula frecuencia de aparición de la regla, confianza y lift medios, percentiles P5–P95.
- Usa semilla reproducible (42) para que el mismo dataset y parámetros produzcan el mismo resultado.
- Normaliza los nombres del CSV a IDs de catálogo antes de evaluar el Pack Mesa.

### 4. Sensibilidad dinámica (`src/sections/Sensitivity.tsx`)

- Recalcula itemsets, reglas y combos para soportes 1%, 1,5%, 2%, 3% y 5%.
- Permite ajustar la confianza mínima.
- Expone el número mínimo de tickets que corresponde a cada soporte.

### 5. Reglas y combos conectados a los datos

- La vista de reglas Apriori deja de mostrar métricas fijas del informe y pasa a calcular soporte, confianza y lift con el dataset cargado.
- La comparación propone combos desde itemsets frecuentes y reglas observadas.
- `useAnalysis` centraliza los cálculos para las vistas.

### 6. Integración con clientes (`src/sim/behavior.ts`)

- El modelo de comportamiento combina reglas descubiertas por Apriori y FP-Growth, elimina duplicados y utiliza las asociaciones resultantes para sugerencias probabilísticas.
- La medición del Pack Mesa continúa usando las transacciones activas y conserva el fallback a parámetros cuando no hay tickets suficientes.
- La fuente se identifica como `Apriori + FP-Growth`; los datos sintéticos siguen rotulados como sintéticos.

## Pruebas añadidas

`tests/fpGrowth.test.ts` verifica:

- Igualdad de itemsets y conteos entre Apriori y FP-Growth.
- Respeto del soporte mínimo y tamaño máximo.
- Comparación sin diferencias de conjuntos.
- Reproducibilidad del Bootstrap con un generador determinista.
- Recuento de umbrales de sensibilidad.
- Recomendación de combos.
- Comparación integrada con el CSV sintético de 220 tickets.

## Validación realizada en este entorno

- FP-Growth y Apriori coincidieron en 100 datasets aleatorios de prueba, con distintos soportes y tamaño máximo 4.
- Coincidieron en el CSV sintético de 220 tickets: 21 itemsets por algoritmo con soporte 2% y tamaño máximo 4.
- El Bootstrap se ejecutó sobre las canastas sintéticas luego de mapear los nombres comerciales a IDs de catálogo.
- Los archivos TypeScript/TSX modificados pasaron el análisis sintáctico de TypeScript (`transpileModule`).
- No se pudo ejecutar Vitest, typecheck completo, lint ni build porque el proyecto no tiene `node_modules` y faltan las dependencias/tipos locales (`node`, `vite/client`, `vitest/globals`). No se declara el build como validado.

## Cómo validar con dependencias instaladas

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

Para probar la interfaz: abrir Datos reales (CSV), cargar el CSV propio o pulsar “Probar con ejemplo sintético”; luego visitar Reglas Apriori, Apriori vs. FP-Growth, Test de Sensibilidad y Estabilidad Bootstrap.
