# Bazar Inteligente · React + TypeScript + React Router

Plataforma de Minería de Datos del caso **Pack Mesa Completa** (IES N.º 6, Perico, Jujuy): simulación 3D isométrica de un bazar, KPIs en vivo, Monte Carlo, Bootstrap, reglas Apriori, calculadora de margen y más.

## Cómo usarlo

```bash
npm install
npm run dev          # desarrollo en http://localhost:5173
npm run build        # chequea tipos y genera dist/ (Vercel, Netlify, GitHub Pages...)
npm run preview      # prueba el build local
```

No abras `dist/index.html` con doble clic (los navegadores bloquean módulos desde `file://`): usá `npm run preview` o un hosting.
Para Vercel: framework "Vite", build `npm run build`, salida `dist`.

## Scripts de calidad

| Comando | Qué hace |
|---|---|
| `npm run typecheck` | TypeScript (`strict`) |
| `npm run lint` | ESLint (TS + React + hooks) |
| `npm test` | 75 tests (Vitest + Testing Library): precios y promociones, calculadora, Monte Carlo y sensibilidad, CSV, Apriori y calibración, presentación, informe, parámetros guardados, stores, rutas y componentes |
| `npm run test:regression` | Opcional (~1 min): corre la simulación completa en jsdom con azar y reloj fijos y la compara con `tests/regression/golden-900.json`. Sirve para comprobar que un refactor **no cambió el comportamiento**. `-- --full` usa 3600 cuadros. Necesita `npm i --no-save canvas` (no está en package.json para que la instalación y Vercel no dependan de él) |

## Para la entrega y la defensa

- **🎤 Presentar** (botón de la cabecera): modo presentación que recorre las secciones en orden con notas para decir. Teclas: `→` / `Espacio` siguiente, `←` anterior, `N` muestra/oculta notas, `Esc` sale. El guion está en `src/sim/presentation.ts` (editable).
- **Informe (PDF)** (`#/informe`): reúne indicadores, escenarios guardados, Monte Carlo, reglas, margen y, si cargaste datos, su análisis. El botón abre el cuadro de impresión: elegí «Guardar como PDF». Tip: antes, corré la simulación y guardá escenarios.
- **Monte Carlo consistente:** la tabla de sensibilidad se calcula con el mismo modelo; la fila «Caso Base» coincide con los indicadores de arriba.
- **Datos reales (CSV)** (`#/datos`): cargá tus ventas y obtené resumen, reglas Apriori (soporte, confianza, lift), la medición del Pack Mesa y un botón para **calibrar la simulación** con esos datos.
  - Formato: una fila por producto vendido. Obligatorias: `ticket` y `producto`. Opcionales: `cantidad`, `precio`, `fecha`. Acepta coma, punto y coma o tab, y números como `14.000` o `14000,50`.
  - Los datos se procesan en el navegador (no se envían a ningún servidor) y se recuerdan en ese navegador.
  - El botón «Probar con ejemplo sintético» y la plantilla descargable son datos inventados para ver el formato: **no son ventas reales** y la página lo avisa.

## Rutas (HashRouter)

`#/` Inicio · `#/simulacion` · `#/parametros` · `#/indicadores` · `#/montecarlo` · `#/bootstrap` · `#/calculadora` · `#/reglas` · `#/apriori-fp` · `#/sensibilidad` · `#/piloto` · `#/crisp` · `#/productos` · `#/datos` · `#/ventas` · `#/escenarios` · `#/academico` · `#/eventos` · `#/informe`

La simulación sigue corriendo al cambiar de ruta (el canvas y los controles están siempre montados). `Monte Carlo` se descarga bajo demanda porque trae la librería de gráficos.
Atajos: Espacio (pausa), R (reiniciar), M (sonido), Z (modo ampliado), 1/2/3 (cámaras). No actúan mientras escribís en un campo ni con un botón enfocado.

## Estructura

```
src/
  main.tsx · App.tsx · routes.ts      Entrada, rutas y qué muestra cada una
  components/   Layout, Sidebar, Header, Controls, SimulationArea (canvas), Kpis, ClientList, CatalogRows
  sections/     Una por bloque de contenido: MonteCarlo (Recharts), Calculator, Crisp, Scenarios, Sales, Events,
                Catalog y las estáticas (Callout, Bootstrap, RulesApriori, AprioriVsFp, Sensitivity, Pilot, Academic)
  hooks/        useStore, useSim, useShortcuts
  sim/
    createStore.ts · store.ts · params.ts · uiStore.ts · controller.ts   Estado (TS): lo que publica el motor, parámetros
                                                                          guardados en localStorage, menú, y puente React → motor
    catalog.ts · constants.ts · pricing.ts · calculator.ts · stats.ts · audio.ts · audioInstance.ts   Datos y funciones puras (TS)
    csv.ts · salesData.ts · apriori.ts · calibration.ts · dataStore.ts · sampleData.ts                 Datos reales: lector CSV, Apriori, calibración
    presentation.ts                                                                                    Guion y estado del modo presentación
    state.js · helpers.js · logic.js · render.js · particles.js · gfx.js · engine.js                    Motor (JS): estado mutable,
                                                                          horarios y promoción, clientes/cola/empleado,
                                                                          dibujo 3D, textos flotantes, sprites y orquestación
  styles/bazar.css
tests/          Vitest + regresión determinista
```

## Estado de la migración

- **React + TypeScript (strict):** toda la interfaz, los stores, el catálogo, los precios, la calculadora, la estadística y el audio.
- **JavaScript (motor):** `state/helpers/logic/render/particles/gfx/engine`. Son ~1.800 líneas con estado mutable compartido y dibujo en canvas. Pasarlos a TypeScript es el siguiente paso natural; ya están separados por responsabilidad y cubiertos por la prueba de regresión.
- Los parámetros (llegada, conversión, canasta, velocidad, promoción) se guardan en el navegador y se validan al cargar.
