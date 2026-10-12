# Bazar Inteligente · React + React Router

Versión en React del archivo `bazar_inteligente_con_menu.html` (Simulación 3D isométrica + Business Intelligence · IES N.º 6).

## Cómo usarlo

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # genera la carpeta dist/ lista para subir (Vercel, Netlify, GitHub Pages...)
npm run preview   # prueba el build local
```

## Rutas (HashRouter)

| Ruta | Sección |
|---|---|
| `#/` | Inicio (advertencia metodológica + KPIs) |
| `#/simulacion` | Simulación 3D + controles + clientes |
| `#/parametros` | Control del flujo comercial |
| `#/indicadores` | KPIs |
| `#/montecarlo` | Monte Carlo |
| `#/bootstrap` | Estabilidad Bootstrap |
| `#/calculadora` | Calculadora de margen |
| `#/reglas` · `#/apriori-fp` | Apriori · Apriori vs FP-Growth |
| `#/sensibilidad` · `#/piloto` | Test de sensibilidad · Plan piloto |
| `#/crisp` | CRISP-DM |
| `#/productos` · `#/ventas` · `#/escenarios` | Catálogo · Ventas · Escenarios |
| `#/academico` · `#/eventos` | Ficha académica · Registro |

## Estructura

```
src/
  main.jsx                  HashRouter + estilos
  App.jsx                   Rutas (React Router)
  routes.js                 Lista de rutas / menú
  components/
    Sidebar.jsx             Menú lateral con NavLink
    Dashboard.jsx           Monta el contenido una vez, muestra/oculta bloques por ruta y monta los componentes React (portales)
    Kpis.jsx · ClientList.jsx · EventLog.jsx · SalesChart.jsx · CatalogRows.jsx   (componentes React)
  hooks/useSim.js           Lee el estado de la simulación (useSyncExternalStore)
  sim/
    store.js                Estado visible que publica el motor (KPIs, clientes, registro, unidades)
    catalog.js              Productos, promociones, perfiles de cliente, nombres, CRISP-DM
    constants.js            Geometría de la tienda y cámara
    gfx.js                  Dibujo isométrico: primitivas, sprites, góndolas, personas
    audio.js                Sonido (Web Audio)
    stats.js                Monte Carlo (función pura)
  legacy/
    engine.js               Lógica de la simulación, bucle y eventos (~1000 líneas)
    content.html            HTML original (cada bloque con data-pages)
    bazar.css               Estilos originales
```

## Qué ya es React y qué sigue siendo HTML original

Ya son componentes React: KPIs, clientes en tienda, registro de eventos, gráfico de ventas y catálogo.
Siguen como HTML original dentro de `legacy/content.html`: cabecera, controles, canvas, Monte Carlo (gráfico), Bootstrap, calculadora, Apriori, escenarios y CRISP-DM.

Los parámetros (llegada, conversión, canasta, velocidad, promoción) se guardan en `localStorage` y se restauran al recargar.

`npm run lint` revisa el código con ESLint.

La simulación sigue corriendo al cambiar de ruta. Atajos: Espacio (pausa), R (reiniciar), M (sonido), Z (modo ampliado), 1/2/3 (cámaras).

Para subir a Vercel: importá el repositorio, framework "Vite", build `npm run build`, salida `dist`.
