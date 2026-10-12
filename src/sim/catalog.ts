/* Catálogo, perfiles de cliente y datos fijos de la simulación (Perico, Jujuy - Ago 2026). */
export interface Product {
  id: string; n: string; e: string; p: number; costo: number; rot: 'Alta' | 'Estancado'
  x: number; y: number; s: number; t: number; k: string; c: string; rol: string
}
export interface Promo { txt: string; lab: string; prod: string; type: '2x1' | 'pct'; v?: number }
export interface Outfit { sh: string; pa: string; sk: string; hair: string; long: number; bag: string }
export interface Profile { ic: string; nm: string; sp: number; pat: number; dw: number }
export interface CrispPhase { t: string; d: string }

export const P: Record<string, Product> = {
  vasos:       { id: 'vasos',       n: 'Set de vasos',            e: '🥛', p: 3000,  costo: 1800, rot: 'Alta',      x: 2.4,  y: 3.6, s: 0, t: 1, k: 'glass',  c: '#9bc4de', rol: 'Alta rotación / Vajilla' },
  servilletero:{ id: 'servilletero',n: 'Servilletero',            e: '🧻', p: 2000,  costo: 1200, rot: 'Alta',      x: 2.4,  y: 6.4, s: 0, t: 2, k: 'napk',   c: '#caa55f', rol: 'Pack Mesa (Antecedente)' },
  cubiertos:   { id: 'cubiertos',   n: 'Cubiertos sueltos',       e: '🍴', p: 8000,  costo: 4800, rot: 'Alta',      x: 2.4,  y: 9.2, s: 0, t: 3, k: 'cutl',   c: '#b8c0cc', rol: 'Alta rotación / Menaje' },
  platos:      { id: 'platos',      n: 'Platos Londres',          e: '🍽️', p: 14000, costo: 8400, rot: 'Alta',      x: 7.0,  y: 4.6, s: 1, t: 0, k: 'plate',  c: '#e9eef7', rol: 'Pack Mesa (Producto Ancla)' },
  tazas:       { id: 'tazas',       n: 'Tazas de café',           e: '☕', p: 2000,  costo: 1200, rot: 'Alta',      x: 7.0,  y: 7.4, s: 1, t: 1, k: 'cup',    c: '#4f7fc4', rol: 'Pack Mesa (Antecedente)' },
  mantel:      { id: 'mantel',      n: 'Mantel de lino',          e: '🟫', p: 50000, costo: 20000,rot: 'Estancado', x: 15.4, y: 5.6, s: 2, t: 0, k: 'linen',  c: '#eee7da', rol: 'Regla secundaria' },
  canasta:     { id: 'canasta',     n: 'Canasta de mimbre',       e: '🧺', p: 35000, costo: 14000,rot: 'Estancado', x: 15.4, y: 7.8, s: 2, t: 1, k: 'basket', c: '#b07a3e', rol: 'Pack Mesa (Consecuente -15%)' },
  vela:        { id: 'vela',        n: 'Vela aromática',          e: '🕯️', p: 14000, costo: 5600, rot: 'Estancado', x: 15.4, y: 9.9, s: 2, t: 2, k: 'candle', c: '#e0a93a', rol: 'Estancado / Aromas' },
  retrato:     { id: 'retrato',     n: 'Portarretrato de madera', e: '🖼️', p: 10000, costo: 4000, rot: 'Estancado', x: 16.4, y: 2.4, s: 3, t: 0, k: 'frame',  c: '#6b4a2a', rol: 'Estancado / Decoración' },
  adorno:      { id: 'adorno',      n: 'Adorno de cerámica',      e: '🏺', p: 15000, costo: 6000, rot: 'Estancado', x: 18.4, y: 2.4, s: 3, t: 1, k: 'vase',   c: '#f4f1ea', rol: 'Estancado / Cerámica' }
};

export const PR: Record<string, Promo> = {
  tazas:  { txt: '2x1 en Tazas de café',    lab: '2x1',  prod: 'tazas',  type: '2x1' },
  mantel: { txt: '20% OFF Mantel de lino', lab: '-20%', prod: 'mantel', type: 'pct', v: 0.20 },
  vela:   { txt: '30% OFF Vela aromática', lab: '-30%', prod: 'vela',   type: 'pct', v: 0.30 }
};

export const OUT: Outfit[] = [
  { sh: '#e07a34', pa: '#26344d', sk: '#e8bf9a', hair: '#3a2418', long: 1, bag: '#1e9b67' },
  { sh: '#3f6aa3', pa: '#33333d', sk: '#c99a74', hair: '#1c1410', long: 0, bag: '#e07a34' },
  { sh: '#ba3859', pa: '#25252e', sk: '#f0cba8', hair: '#6a3a1c', long: 1, bag: '#3f6aa3' },
  { sh: '#33333d', pa: '#44536e', sk: '#a87a56', hair: '#111111', long: 0, bag: '#ba3859' },
  { sh: '#8347b8', pa: '#272730', sk: '#e8bf9a', hair: '#2a1810', long: 1, bag: '#d49e28' },
  { sh: '#d49e28', pa: '#35435e', sk: '#d9a981', hair: '#4a2a14', long: 0, bag: '#8347b8' },
  { sh: '#279883', pa: '#24242c', sk: '#b88862', hair: '#1a1210', long: 1, bag: '#e07a34' },
  { sh: '#a94834', pa: '#334257', sk: '#f0cba8', hair: '#8a5a2a', long: 0, bag: '#279883' }
];

export const PROF: Record<string, Profile> = {
  normal:  { ic: '🛒', nm: 'Comprador Mesa', sp: 1.0,  pat: 22, dw: 1.3 },
  apurado: { ic: '⚡', nm: 'Paso Rápido',    sp: 1.45, pat: 9,  dw: 0.6 },
  curioso: { ic: '🔍', nm: 'Mirón / Bazar',  sp: 0.8,  pat: 34, dw: 2.2 },
  ofertas: { ic: '🏷️', nm: 'Caza Promos',    sp: 1.1,  pat: 26, dw: 1.4 }
};

export const crispData: CrispPhase[] = [
  { t: "1. Comprensión del Negocio (Business Understanding) — Secciones 2, 3 y 4", d: "Definición de la problemática central y formulación de hipótesis de trabajo: ciertos antecedentes de alta rotación aumentan la probabilidad de compra de productos estancados (lift > 1) sin destruir el margen de ganancia comercial." },
  { t: "2. Comprensión de los Datos (Data Understanding) — Secciones 5 y 7", d: "Dataset transaccional sintético (615 registros iniciales, 188 tickets, 90 días, semilla 42). Análisis EDA con 6 gráficos. 70,2% alta rotación / 29,8% baja rotación. Precios reales relevados en comercios de Perico." },
  { t: "3. Preparación de los Datos (Data Preparation) — Sección 6", d: "Depuración de 14 duplicados exactos y 19 nulos imputados con mediana ($9.325,42). Total final consolidado: 601 registros. Corrección del bug de clasificación 'tipo_producto'. Construcción de matriz de tickets binaria (188 tickets × 10 productos)." },
  { t: "4. Modelado (Apriori Algorithm) — Sección 8", d: "Algoritmo Apriori con min_support = 0,02 (4 tickets) y min_confidence = 0,20. Generación de 111 itemsets frecuentes y 240 reglas. Filtrado del antecedente (≥3 productos alta rotación) hacia consecuente estancado." },
  { t: "5. Evaluación (Evaluation, Bootstrap y Sensibilidad) — Secciones 9 y 10", d: "Identificación de 4 combos objetivo. Análisis con 5 métricas (Soporte 2,13%, Confianza 57,1%, Lift 3,47, Leverage 0,0151, Conviction 1,95). Validación de estabilidad por Bootstrap (500 remuestreos, regla estable en 56,4%) y simulación Monte Carlo (10.000 iteraciones)." },
  { t: "6. Despliegue (Deployment & Plan Piloto) — Sección 11", d: "Diseño de prueba piloto controlada de 2 a 4 semanas con 4 KPIs verificables. Implementación del 'Pack Mesa Completa' ($47.750) y propuesta de reorganización física de layout en góndola." }
];

export const NAMES: string[] = ['Ana', 'Carlos', 'Lucía', 'Mateo', 'Sofía', 'Diego', 'Valeria', 'Juan (Flores)', 'Camila', 'Tomás', 'Paula', 'Martín'];

export const KIDS: string[] = ['Nico', 'Mía', 'Lola', 'Bruno'];

export const CAP = 5;

export const PROD: Product[] = Object.values(P);

export const ST: Record<string, number> = {};
