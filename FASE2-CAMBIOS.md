# Fase 2 — Inteligencia híbrida de clientes

## Criterio de conservación

Se conserva la identidad visual, la navegación, la distribución de módulos, el canvas isométrico y el motor de movimiento existente. Los cambios se concentran en la lógica de decisión y en la ficha desplegable de clientes.

## Cambios implementados

### 1. Modelo híbrido de comportamiento (`src/sim/behavior.ts`)

- Define rasgos individuales por perfil: presupuesto, sensibilidad al precio, afinidad a promociones, curiosidad, impulso, preferencias y paciencia.
- Mantiene los cuatro perfiles actuales: Comprador Mesa, Paso Rápido, Mirón / Bazar y Caza Promos; conserva la consideración de la promoción activa en los perfiles que la buscan.
- Aprende reglas desde el CSV activo mediante Apriori cuando existen al menos tres tickets utilizables. Distingue explícitamente los CSV sintéticos de ejemplo de los archivos cargados por el usuario.
- Calcula las probabilidades observadas de formar los antecedentes del Pack Mesa y sumar la canasta.
- Combina la confianza observada con los parámetros del simulador: 65% señal de datos y 35% parámetro operativo.
- Si no hay datos suficientes, utiliza los parámetros `sC` y `sB` existentes.
- Puede incorporar una recomendación de producto basada en reglas Apriori de consecuente único, con lift y confianza positivos.
- Evita duplicar productos dentro del plan.

### 2. Decisiones individuales (`src/sim/logic.js`)

- Cada cliente recibe un presupuesto inicial y saldo disponible.
- Se registra por qué compra, descarta, no encuentra o rechaza un producto.
- La sensibilidad al precio afecta la probabilidad de rechazo.
- La afinidad a promociones reduce la presión de precio cuando la promoción está activa.
- Se conserva el inventario, la caja, los recorridos y las colas. El KPI de canastas con descuento se contabiliza al cobrar, no al tomar el producto, por lo que una compra abandonada no queda registrada como venta.

### 3. Ficha de cliente (`src/components/ClientList.tsx`)

- La lista actual sigue mostrando los clientes activos.
- Al seleccionar un cliente se despliega una ficha con presupuesto, saldo, sensibilidad, afinidad a promociones, preferencias, fuente del modelo, historial de compras y decisiones recientes.
- Se reutilizan las clases y variables visuales del tema actual; no se reemplaza el diseño general.

### 4. Pruebas (`tests/behavior.test.ts`)

Incluye pruebas para rasgos de perfiles, fallback de parámetros, aprendizaje desde CSV, probabilidades controlables, planes sin duplicados y productos válidos.

## Consideraciones metodológicas

- Los tickets cargados por CSV son la fuente observada para Apriori. Si no se cargan datos suficientes, la simulación no afirma haber aprendido reglas: utiliza los parámetros configurados.
- El modelo híbrido mezcla la confianza observada con los parámetros operativos en una proporción explícita 65/35.
- Las reglas Apriori se usan como sugerencias probabilísticas, no como certezas ni como causalidad.
- Los clientes son agentes simulados con reglas probabilísticas; no son personas reales ni un modelo predictivo entrenado.
- Los acompañantes visuales continúan siguiendo al cliente principal y no generan tickets independientes.

## Verificación pendiente

Ejecutar `npm ci`, `npm test`, `npm run typecheck`, `npm run lint` y `npm run build` en un entorno con dependencias instalables. No declarar el build como validado hasta obtener salida exitosa de esos comandos. Como la lógica de clientes cambia intencionalmente, regenerar los snapshots de regresión con `npm run test:regression -- --update` cuando esté disponible el paquete opcional `canvas`, y luego ejecutar la prueba sin `--update`.
