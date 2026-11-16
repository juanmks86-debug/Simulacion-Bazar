# Ajuste de interfaz: navegación lateral compacta

## Objetivo
Reducir la cantidad de opciones visibles en el sidebar sin eliminar ni modificar las rutas o funcionalidades existentes.

## Nueva organización
- **Inicio:** centro de operaciones.
- **Simulación:** acceso directo al bazar 3D.
- **Gestión:** productos e inventario, clientes y ventas, parámetros e indicadores.
- **Comercial:** combos y promociones, calculadora de margen y escenarios comerciales.
- **Inteligencia:** Apriori, FP-Growth, Bootstrap, Monte Carlo, sensibilidad, piloto y CRISP-DM.
- **Configuración:** importación CSV, eventos, ficha académica e informe PDF.

## Comportamiento
- Los cuatro grupos se despliegan al hacer clic.
- El grupo que contiene la ruta actual se abre automáticamente.
- Los enlaces conservan sus rutas originales.
- En móvil se conserva el menú lateral deslizable.
- Se mantiene el control para contraer el sidebar.
- El acceso al asistente inteligente lleva al módulo de decisiones comerciales.

## Archivos modificados
- `src/components/Sidebar.tsx`
- `src/styles/bazar.css`

## Validación
- ZIP de Fase 4 extraído y estructura revisada.
- Se comprobó por inspección que las 20 rutas originales siguen representadas entre accesos directos y submenús.
- No se pudo completar `npm ci` dentro del tiempo disponible; por eso no se certifican todavía `typecheck`, tests ni build. El `tsc` global también quedó bloqueado por la ausencia de dependencias del proyecto (`@types/node`, `vite/client` y `vitest/globals`).
