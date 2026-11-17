# Paso 2 — Interfaz definitiva

## Alcance
Ajuste de navegación y coherencia visual sin cambiar la distribución de las vistas ni la lógica de simulación, minería o decisiones comerciales.

## Navegación
- Accesos directos: Inicio y Simulación.
- Cuatro grupos desplegables: Gestión, Comercial, Inteligencia y Configuración.
- Las 20 rutas definidas en `src/App.tsx` tienen un acceso correspondiente en el sidebar.
- El grupo de la sección activa se expande automáticamente.
- Se conserva el sidebar contraíble en escritorio y el menú deslizable en pantallas pequeñas.

## Ajustes realizados en esta entrega
- Se corrigieron colores residuales de la interfaz anterior en encabezado, canvas, controles, paneles de clientes y modo presentación para alinearlos con la identidad azul petróleo/turquesa.
- Se corrigió la reapertura del menú cuando el usuario vuelve desde el modo contraído en una pantalla móvil.
- Se añadieron etiquetas accesibles dinámicas al botón de menú y al control de contraer navegación.

## Paleta de referencia
- Fondo: `#0B1726`
- Superficie: `#14283D`
- Superficie secundaria: `#102238`
- Bordes: `#29445D`
- Acento turquesa: `#36B8A5` / `#43D4C0`
- Texto: `#F2F7FB`
- Se conservan colores semánticos de alertas y rotación de productos.

## Verificaciones
- Inspección de estructura y rutas: 20/20 rutas con acceso en el sidebar; no se detectaron rutas huérfanas ni accesos a rutas inexistentes.
- `npm run typecheck`: no completó; faltan definiciones de `node`, `vite/client` y `vitest/globals` en el entorno.
- `npm ci --no-audit --no-fund`: excedió el tiempo disponible.
- Por lo anterior, esta entrega no se declara certificada por build, lint ni tests. Deben ejecutarse en un entorno con dependencias instaladas.

## Revisión de coherencia de controles (17/11/2026)
- Se corrigió el texto del botón `toggleZenBtn` del encabezado: la acción real contrae/muestra el menú lateral, por lo que ya no se presenta como una acción de expandir el canvas.
- Se añadieron etiquetas accesibles dinámicas para describir la acción disponible.
- Esta corrección no altera el motor 3D ni el estado de simulación.


## Segunda pasada visual y de accesibilidad (17/11/2026)
- Se eliminaron fondos y bordes verde oscuro residuales de los controles de simulación, inspector de estantes, tablas y paneles CRISP-DM / decisiones / escenarios / sensibilidad / datos.
- El selector de promociones y el botón de sonido ahora usan la paleta del sistema mediante clases reutilizables y variables CSS.
- Las fases de CRISP-DM pasaron de contenedores `div` clicables a botones semánticos con `aria-pressed` y foco visible.
- Se conserva el verde como color semántico para identificar alta rotación y resultados favorables; no se cambia el color de productos ni la lógica de simulación.
- Auditoría de navegación repetida: 20 rutas declaradas, 20 rutas únicas y todas tienen acceso desde el sidebar; no hay enlaces desconocidos.
- No se pudo ejecutar build / lint / Vitest: la instalación `npm ci` excedió el tiempo disponible y no quedaron ejecutables locales `tsc`, `vite` ni `vitest`. La revisión visual en navegador también queda pendiente porque no hay entorno de navegador disponible en esta sesión.
