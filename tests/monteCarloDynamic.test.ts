import { describe, expect, it } from 'vitest'
import { DEFAULT_PARAMS, buildDemand, sensitivityByUplift, simulate, type McProductInput } from '../src/sim/monteCarloDynamic'
import type { Sale } from '../src/sim/salesData'

const seeded = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
const iso = (i: number) => new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10)

/** Ventas sintéticas: `n` productos, 30 días; el producto 0 llega en rachas (sobredispersión). */
function fixture(n: number) {
  const rand = seeded(11)
  const sales: Sale[] = []
  const catalog: McProductInput[] = []
  for (let p = 0; p < n; p++) {
    catalog.push({ id: `p${p}`, name: `Producto ${p}`, price: 1000 + p * 100, cost: (1000 + p * 100) * 0.55, rot: p % 2 ? 'Estancado' : 'Alta' })
    for (let d = 0; d < 30; d++) {
      const qty = p === 0 ? (d % 10 === 0 ? 12 : 0) : (rand() < 0.5 ? 1 : 0) + (rand() < 0.2 ? 1 : 0)
      if (qty > 0) sales.push({ ticket: `T${p}-${d}`, product: `Producto ${p}`, qty, price: 1000 + p * 100, date: iso(d) })
    }
  }
  return { sales, catalog }
}

describe('buildDemand', () => {
  it('reconoce 10, 20 y 50 productos y elige la distribución según la dispersión', () => {
    for (const n of [10, 20, 50]) {
      const { sales, catalog } = fixture(n)
      const s = buildDemand(sales, catalog)
      expect(s.products.length).toBe(n)
      expect(s.observedDays).toBe(30)
      expect(s.products[0].model).toBe('negbin')
      expect(s.products[1].model).toBe('poisson')
    }
  })
  it('excluye productos sin precio o sin ventas', () => {
    const { sales, catalog } = fixture(3)
    const s = buildDemand(sales, [...catalog, { id: 'x', name: 'Sin ventas', price: 10, cost: 5, rot: 'Alta' }, { ...catalog[1], name: 'Producto 1', price: 0 }])
    expect(s.excluded.map((e) => e.reason)).toEqual(expect.arrayContaining(['sin ventas', 'sin precio en el CSV']))
  })
  it('sin fechas asume 30 días y Poisson', () => {
    const { sales, catalog } = fixture(3)
    const s = buildDemand(sales.map((x) => ({ ...x, date: undefined })), catalog)
    expect(s.hasDates).toBe(false)
    expect(s.products.every((p) => p.model === 'poisson')).toBe(true)
  })
})

describe('simulate', () => {
  const { sales, catalog } = fixture(20)
  const products = buildDemand(sales, catalog).products
  it('es reproducible con la misma semilla', () => {
    expect(simulate(products, DEFAULT_PARAMS, seeded(5))).toEqual(simulate(products, DEFAULT_PARAMS, seeded(5)))
  })
  it('la demanda simulada coincide con la observada (±10%)', () => {
    const r = simulate(products, { ...DEFAULT_PARAMS, horizonDays: 30, iterations: 4000 }, seeded(3))!
    const sim = r.products.reduce((a, p) => a + p.meanUnits, 0), obs = products.reduce((a, p) => a + p.units, 0)
    expect(Math.abs(sim - obs) / obs).toBeLessThan(0.1)
  })
  it('sin descuento ni incremento, la promoción es igual a la situación actual', () => {
    const r = simulate(products, { ...DEFAULT_PARAMS, discount: 0, demandUplift: 0, iterations: 2000 }, seeded(9))!
    expect(r.promo.mean).toBeCloseTo(r.actual.mean, 6)
    expect(r.promo.pBeatActual).toBe(0)
  })
  it('un descuento sin respuesta de demanda reduce la ganancia; con mucha demanda la mejora', () => {
    const base = { ...DEFAULT_PARAMS, scope: 'all' as const, discount: 0.2, iterations: 3000 }
    const r = simulate(products, { ...base, demandUplift: 3 }, seeded(2))!
    expect(r.discountOnly.mean).toBeLessThan(r.actual.mean)
    expect(r.promo.mean).toBeGreaterThan(r.actual.mean)
  })
  it('costos fijos altos producen probabilidad de pérdida cercana a 100%', () => {
    const r = simulate(products, { ...DEFAULT_PARAMS, fixedCosts: 1e9, iterations: 1000 }, seeded(1))!
    expect(r.actual.pLoss).toBe(100)
  })
  it('ordena el ranking por ganancia y calcula el intervalo de confianza', () => {
    const r = simulate(products, { ...DEFAULT_PARAMS, iterations: 2000 }, seeded(4))!
    for (let i = 1; i < r.products.length; i++) expect(r.products[i - 1].profitActual).toBeGreaterThanOrEqual(r.products[i].profitActual)
    expect(r.actual.p025).toBeLessThanOrEqual(r.actual.mean)
    expect(r.actual.ciMean[0]).toBeLessThan(r.actual.ciMean[1])
  })
  it('devuelve null sin productos y soporta 50 productos', () => {
    expect(simulate([], DEFAULT_PARAMS)).toBeNull()
    const f = fixture(50)
    expect(simulate(buildDemand(f.sales, f.catalog).products, { ...DEFAULT_PARAMS, iterations: 1000 }, seeded(8))!.products).toHaveLength(50)
  })
  it('la sensibilidad crece con el incremento de demanda', () => {
    const rows = sensitivityByUplift(products, { ...DEFAULT_PARAMS, scope: 'all', discount: 0.2 }, [0, 1, 3], seeded(6), 1500)
    expect(rows[2].meanDiff).toBeGreaterThan(rows[0].meanDiff)
  })
})
