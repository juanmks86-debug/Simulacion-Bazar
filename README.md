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
| `npm test` | 36+ tests (Vitest + Testing Library): precios y promociones, calculadora, Monte Carlo, histograma, parámetros guardados, stores, rutas y componentes |
| `npm run test:regression` | Opcional (~1 min): corre la simulación completa en jsdom con azar y reloj fijos y la compara con `tests/regression/golden-900.json`. Sirve para comprobar que un refactor **no cambió el comportamiento**. `-- --full` usa 3600 cuadros. Necesita el paquete `canvas` (es opcional; si no se instala, el resto funciona igual) |

## Rutas (HashRouter)

`#/` Inicio · `#/simulacion` · `#/parametros` · `#/indicadores` · `#/montecarlo` · `#/bootstrap` · `#/calculadora` · `#/reglas` · `#/apriori-fp` · `#/sensibilidad` · `#/piloto` · `#/crisp` · `#/productos` · `#/ventas` · `#/escenarios` · `#/academico` · `#/eventos`

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
