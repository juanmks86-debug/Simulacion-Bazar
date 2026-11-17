import { describe, expect, it } from 'vitest'
import { buildCommercialOpportunities } from '../src/sim/commercial'
import type { Rule } from '../src/sim/apriori'

const rule: Rule = {
  antecedent: ['Platos Londres', 'Tazas de café'],
  consequent: ['Canasta de mimbre'],
  count: 8, support: 0.08, confidence: 0.8, lift: 2.4,
}

describe('commercial decision engine', () => {
  it('maps observed rules to catalog economics and respects the target margin', () => {
    const [result] = buildCommercialOpportunities([rule], 0.35, 0.15)
    expect(result.products.map((p) => p.id).sort()).toEqual(['canasta', 'platos', 'tazas'])
    expect(result.revenue).toBe(51000)
    expect(result.cost).toBe(23600)
    expect(result.marginAtSuggestion).toBeGreaterThanOrEqual(0.35 - 1e-10)
    expect(result.suggestedDiscount).toBeLessThanOrEqual(0.15)
  })

  it('flags when the requested margin is impossible without a price or cost change', () => {
    const [result] = buildCommercialOpportunities([rule], 0.65, 0.15)
    expect(result.targetMarginFeasible).toBe(false)
    expect(result.suggestedDiscount).toBe(0)
  })

  it('ignores unknown products but does not require a preassigned stagnant rotation', () => {
    const highRotation: Rule = { ...rule, consequent: ['Servilletero'] }
    const unknown: Rule = { ...rule, consequent: ['Producto desconocido'] }
    expect(buildCommercialOpportunities([highRotation])).toHaveLength(1)
    expect(buildCommercialOpportunities([unknown])).toHaveLength(0)
  })

  it('deduplicates equivalent item combinations', () => {
    const reverse: Rule = { ...rule, antecedent: ['Canasta de mimbre', 'Tazas de café'], consequent: ['Platos Londres'] }
    expect(buildCommercialOpportunities([rule, reverse])).toHaveLength(1)
  })
})


describe('fallback de oportunidades para catálogos nuevos', () => {
  const products = ['Producto A', 'Producto B'].map((n, i) => ({
    id: `producto-${i}`, n, e: '📦', p: 1000 + i * 500, costo: (1000 + i * 500) * 0.55,
    rot: 'Alta' as const, x: 0, y: 0, s: 0, t: i, k: 'generic', c: '#aaa', rol: 'CSV', tickets: 1, units: 1,
  }))
  it('ofrece pares que coaparecen cuando no hay reglas Apriori suficientes', () => {
    const results = buildCommercialOpportunities([], 0.35, 0.15, products, [['Producto A', 'Producto B']])
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].source).toBe('cooccurrence')
  })
  it('ofrece evaluación individual si el CSV solo contiene un producto', () => {
    const results = buildCommercialOpportunities([], 0.35, 0.15, products.slice(0, 1), [['Producto A']])
    expect(results).toHaveLength(1)
    expect(results[0].source).toBe('individual')
  })
})
