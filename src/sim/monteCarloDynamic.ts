/* Monte Carlo dinámico (sin DOM): la demanda sale de las ventas del CSV y los precios/costos del catálogo dinámico.
 * Funciona con cualquier cantidad de productos (10, 20, 50 o más). `rand` se puede inyectar para tests reproducibles. */
import { norm } from './csv'
import type { Sale } from './salesData'

export interface McProductInput { id: string; name: string; price: number; cost: number; rot: string }
export type DemandModel = 'poisson' | 'negbin'
export interface ProductDemand extends McProductInput {
  units: number          // unidades vendidas en todo el período observado
  meanDaily: number      // unidades por día (incluye días sin ventas)
  dispersion: number     // varianza / media de las ventas diarias (1 = Poisson)
  model: DemandModel     // distribución elegida automáticamente
  priceCV: number        // variabilidad relativa del precio (observada en el CSV, mínimo 2%)
}
export interface DemandSummary {
  products: ProductDemand[]
  excluded: { name: string; reason: string }[]
  observedDays: number
  hasDates: boolean
}

const MIN_PRICE_CV = 0.02
const OVERDISPERSION = 1.2   // por encima de este índice se usa Binomial negativa
const ASSUMED_DAYS = 30      // período asumido si el CSV no trae fechas

function dayOf(value?: string): number | null {
  if (!value) return null
  const m = value.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  const t = m ? Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : Date.parse(value)
  return Number.isFinite(t) ? Math.floor(t / 86400000) : null
}

/** Estima la demanda diaria de cada producto del catálogo a partir de las ventas observadas. */
export function buildDemand(sales: Sale[], catalog: McProductInput[]): DemandSummary {
  const days = sales.map((s) => dayOf(s.date))
  const hasDates = sales.length > 0 && days.every((d) => d !== null)
  let observedDays = ASSUMED_DAYS
  if (hasDates) {
    const valid = days as number[]
    observedDays = Math.max(1, Math.max(...valid) - Math.min(...valid) + 1)
  }
  type Acc = { units: number; byDay: Map<number, number>; n: number; sum: number; sumSq: number }
  const acc = new Map<string, Acc>()
  sales.forEach((s, i) => {
    const key = norm(s.product)
    const a = acc.get(key) ?? { units: 0, byDay: new Map<number, number>(), n: 0, sum: 0, sumSq: 0 }
    a.units += s.qty
    if (hasDates) a.byDay.set(days[i] as number, (a.byDay.get(days[i] as number) ?? 0) + s.qty)
    if (s.price !== undefined && Number.isFinite(s.price) && s.price > 0) { a.n++; a.sum += s.price; a.sumSq += s.price * s.price }
    acc.set(key, a)
  })

  const products: ProductDemand[] = []
  const excluded: { name: string; reason: string }[] = []
  for (const c of catalog) {
    const a = acc.get(norm(c.name))
    if (!a || a.units <= 0) { excluded.push({ name: c.name, reason: 'sin ventas' }); continue }
    if (!(c.price > 0)) { excluded.push({ name: c.name, reason: 'sin precio en el CSV' }); continue }
    const meanDaily = a.units / observedDays
    let dispersion = 1
    if (hasDates && observedDays > 1) {
      let sumSq = 0
      for (const q of a.byDay.values()) sumSq += q * q
      const variance = Math.max(0, (sumSq - observedDays * meanDaily * meanDaily) / (observedDays - 1))
      dispersion = meanDaily > 0 ? variance / meanDaily : 1
    }
    let priceCV = MIN_PRICE_CV
    if (a.n > 1) {
      const m = a.sum / a.n
      const sd = Math.sqrt(Math.max(0, a.sumSq / a.n - m * m))
      if (m > 0) priceCV = Math.max(MIN_PRICE_CV, sd / m)
    }
    const model: DemandModel = hasDates && observedDays >= 7 && dispersion > OVERDISPERSION ? 'negbin' : 'poisson'
    products.push({ ...c, units: a.units, meanDaily, dispersion, model, priceCV })
  }
  return { products, excluded, observedDays, hasDates }
}

/* ---------- Muestreo ---------- */
const normal = (rand: () => number): number => {
  const u1 = Math.max(rand(), 1e-12), u2 = rand()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}
const poisson = (lambda: number, rand: () => number): number => {
  if (lambda <= 0) return 0
  if (lambda >= 30) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * normal(rand)))
  const L = Math.exp(-lambda)
  let k = 0, p = 1
  do { k++; p *= rand() } while (p > L)
  return k - 1
}
/** Gamma(k, 1) por Marsaglia–Tsang. */
const gamma = (k: number, rand: () => number): number => {
  if (k < 1) return gamma(k + 1, rand) * Math.pow(Math.max(rand(), 1e-12), 1 / k)
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d)
  for (;;) {
    const x = normal(rand), v = Math.pow(1 + c * x, 3)
    if (v <= 0) continue
    const u = Math.max(rand(), 1e-12)
    if (Math.log(u) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v
  }
}
const drawDemand = (p: ProductDemand, horizon: number, rand: () => number): number => {
  const mu = p.meanDaily * horizon
  if (p.model === 'negbin') {
    const k = Math.min(1000, Math.max(0.1, mu / (p.dispersion - 1)))
    return poisson(gamma(k, rand) * (mu / k), rand)
  }
  return poisson(mu, rand)
}

/* ---------- Simulación ---------- */
export type PromoScope = 'all' | 'slow' | 'fast' | 'custom'
export interface McParams {
  horizonDays: number      // horizonte de simulación
  iterations: number       // cantidad de escenarios
  demandUplift: number     // incremento de demanda por la promoción (0,5 = +50%)
  discount: number         // descuento de la promoción (0,15 = 15%)
  scope: PromoScope        // a qué productos se aplica la promoción ('custom' usa productIds)
  productIds?: string[]    // productos elegidos cuando scope = 'custom'
  fixedCosts: number       // costos fijos del período (se restan de la ganancia)
  costSd: number           // variabilidad de costos (desvío relativo)
}
export const DEFAULT_PARAMS: McParams = { horizonDays: 30, iterations: 10000, demandUplift: 0.5, discount: 0.15, scope: 'slow', fixedCosts: 0, costSd: 0.05 }

export interface ScenarioStats {
  mean: number; sd: number; min: number; max: number; median: number
  p025: number; p975: number                 // rango central del 95% de los resultados simulados
  ciMean: [number, number]                   // intervalo de confianza del 95% para la media
  pLoss: number                              // probabilidad de ganancia negativa (en %)
  pBeatActual: number | null                 // probabilidad de superar la situación actual (en %)
  meanRevenue: number; marginPct: number     // margen neto sobre ingresos
}
export interface ProductResult {
  id: string; name: string; model: DemandModel; promoted: boolean
  meanUnits: number; price: number; cost: number; unitMarginPct: number
  profitActual: number; profitPromo: number; delta: number; sdActual: number
}
export interface McResult {
  params: McParams
  actual: ScenarioStats; promo: ScenarioStats; discountOnly: ScenarioStats
  products: ProductResult[]
  promotedCount: number
  sample: { actual: number[]; promo: number[]; diffPromo: number[] }
}

const SAMPLE = 5000
function stats(values: Float64Array, revenueSum: number, fixed: number, beat: number | null): ScenarioStats {
  const n = values.length
  let sum = 0
  for (const v of values) sum += v
  const mean = sum / n
  let ss = 0
  for (const v of values) ss += (v - mean) * (v - mean)
  const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : 0
  const sorted = Float64Array.from(values).sort()
  const q = (f: number) => sorted[Math.min(n - 1, Math.max(0, Math.floor((n - 1) * f)))]
  let loss = 0
  for (const v of values) if (v < 0) loss++
  const meanRevenue = revenueSum / n
  const half = 1.96 * sd / Math.sqrt(n)
  void fixed
  return {
    mean, sd, min: sorted[0], max: sorted[n - 1], median: q(0.5), p025: q(0.025), p975: q(0.975),
    ciMean: [mean - half, mean + half], pLoss: (loss / n) * 100, pBeatActual: beat,
    meanRevenue, marginPct: meanRevenue > 0 ? mean / meanRevenue : 0,
  }
}

export function simulate(products: ProductDemand[], params: McParams, rand: () => number = Math.random): McResult | null {
  if (!products.length) return null
  const n = Math.max(100, Math.floor(params.iterations))
  const H = Math.max(1, params.horizonDays)
  const u = Math.max(0, params.demandUplift), d = Math.min(0.95, Math.max(0, params.discount))
  const chosen = new Set(params.productIds ?? [])
  const promoted = products.map((p) => params.scope === 'all' || (params.scope === 'slow' && p.rot === 'Estancado') || (params.scope === 'fast' && p.rot === 'Alta') || (params.scope === 'custom' && chosen.has(p.id)))
  const m = products.length
  const pA = new Float64Array(n), pB = new Float64Array(n), pC = new Float64Array(n)
  let revA = 0, revB = 0, revC = 0, beatB = 0, beatC = 0
  const sumA = new Float64Array(m), sumB = new Float64Array(m), sqA = new Float64Array(m), units = new Float64Array(m)

  for (let it = 0; it < n; it++) {
    let a = -params.fixedCosts, b = a, c = a
    for (let i = 0; i < m; i++) {
      const p = products[i]
      const N = drawDemand(p, H, rand)
      const price = p.price * Math.max(0.1, 1 + p.priceCV * normal(rand))
      const cost = p.cost * Math.max(0.1, 1 + params.costSd * normal(rand))
      const profA = N * (price - cost), rA = N * price
      let profB = profA, rB = rA, profC = profA, rC = rA
      if (promoted[i]) {
        const priceD = price * (1 - d)
        const NB = N + (u > 0 ? poisson(u * N, rand) : 0)
        profB = NB * (priceD - cost); rB = NB * priceD
        profC = N * (priceD - cost); rC = N * priceD
      }
      a += profA; b += profB; c += profC
      revA += rA; revB += rB; revC += rC
      sumA[i] += profA; sumB[i] += profB; sqA[i] += profA * profA; units[i] += N
    }
    pA[it] = a; pB[it] = b; pC[it] = c
    if (b - a > 1) beatB++
    if (c - a > 1) beatC++
  }

  const rows: ProductResult[] = products.map((p, i) => {
    const profitActual = sumA[i] / n
    return {
      id: p.id, name: p.name, model: p.model, promoted: promoted[i],
      meanUnits: units[i] / n, price: p.price, cost: p.cost, unitMarginPct: p.price > 0 ? (p.price - p.cost) / p.price : 0,
      profitActual, profitPromo: sumB[i] / n, delta: (sumB[i] - sumA[i]) / n,
      sdActual: Math.sqrt(Math.max(0, sqA[i] / n - profitActual * profitActual)),
    }
  }).sort((x, y) => y.profitActual - x.profitActual)

  const take = Math.min(SAMPLE, n)
  return {
    params: { ...params, iterations: n },
    actual: stats(pA, revA, params.fixedCosts, null),
    promo: stats(pB, revB, params.fixedCosts, (beatB / n) * 100),
    discountOnly: stats(pC, revC, params.fixedCosts, (beatC / n) * 100),
    products: rows,
    promotedCount: promoted.filter(Boolean).length,
    sample: {
      actual: Array.from(pA.subarray(0, take)), promo: Array.from(pB.subarray(0, take)),
      diffPromo: Array.from({ length: take }, (_, i) => pB[i] - pA[i]),
    },
  }
}

/** Sensibilidad recalculada con el CSV: ¿cuánto debe subir la demanda para que la promoción convenga? */
export interface SensitivityRow { uplift: number; meanPromo: number; meanDiff: number; pBeat: number; pLoss: number }
export function sensitivityByUplift(products: ProductDemand[], params: McParams, uplifts = [0, 0.25, 0.5, 1, 2], rand: () => number = Math.random, iterations = 2000): SensitivityRow[] {
  return uplifts.map((uplift) => {
    const r = simulate(products, { ...params, demandUplift: uplift, iterations }, rand)
    return r
      ? { uplift, meanPromo: r.promo.mean, meanDiff: r.promo.mean - r.actual.mean, pBeat: r.promo.pBeatActual ?? 0, pLoss: r.promo.pLoss }
      : { uplift, meanPromo: 0, meanDiff: 0, pBeat: 0, pLoss: 0 }
  })
}

export interface MultiBin { mid: number; label: string; a: number; b: number }
/** Histograma con intervalos compartidos para comparar dos distribuciones. */
export function overlayHistogram(a: number[], b: number[], bins = 40, fmt: (n: number) => string = String): MultiBin[] {
  if (!a.length && !b.length) return []
  let min = Infinity, max = -Infinity
  for (const v of [...a, ...b]) { if (v < min) min = v; if (v > max) max = v }
  const width = (max - min) / bins || 1
  const out: MultiBin[] = Array.from({ length: bins }, (_, i) => { const mid = min + (i + 0.5) * width; return { mid, label: fmt(mid), a: 0, b: 0 } })
  for (const v of a) out[Math.min(bins - 1, Math.floor((v - min) / width))].a++
  for (const v of b) out[Math.min(bins - 1, Math.floor((v - min) / width))].b++
  return out
}
