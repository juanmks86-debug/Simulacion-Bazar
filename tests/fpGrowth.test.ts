import { describe, expect, it } from 'vitest'
import { apriori, rulesFrom } from '../src/sim/apriori'
import { fpGrowth } from '../src/sim/fpGrowth'
import { bootstrapRule, compareAlgorithms, recommendCombos, sensitivityAnalysis } from '../src/sim/validation'

const baskets = [['A', 'B', 'C'], ['A', 'B'], ['A', 'C'], ['B', 'C'], ['A', 'B', 'C']]

describe('FP-Growth', () => {
  it('produce los mismos itemsets y soportes que Apriori', () => {
    const a = apriori(baskets, 0.4, 3)
    const f = fpGrowth(baskets, 0.4, 3)
    expect(f.map((x) => [x.items.join(','), x.count]).sort()).toEqual(a.map((x) => [x.items.join(','), x.count]).sort())
  })
  it('respeta soporte y tamaño máximo', () => {
    const result = fpGrowth(baskets, 0.6, 2)
    expect(result.every((x) => x.support >= 0.6 && x.items.length <= 2)).toBe(true)
  })
  it('compara algoritmos sin diferencias de conjuntos', () => {
    const result = compareAlgorithms(baskets, 0.4, 0.2, 3)
    expect(result.onlyApriori).toHaveLength(0)
    expect(result.onlyFp).toHaveLength(0)
    expect(result.matched).toBe(result.apriori.length)
  })
})

describe('validación y combos', () => {
  it('bootstrap es reproducible con un generador determinista', () => {
    const random = () => 0.2
    const result = bootstrapRule(baskets, ['A'], ['B'], 20, 0.1, random)
    expect(result.iterations).toBe(20)
    expect(result.appearances).toBe(20)
    expect(result.confidenceMean).toBeCloseTo(1)
  })
  it('sensibilidad recalcula los conteos mínimos', () => {
    const rows = sensitivityAnalysis(baskets, [0.2, 0.6], 0)
    expect(rows[0].minCount).toBe(1)
    expect(rows[1].minCount).toBe(3)
    expect(rows[0].itemsets).toBeGreaterThanOrEqual(rows[1].itemsets)
  })
  it('recomienda reglas de combos frecuentes', () => {
    const itemsets = apriori(baskets, 0.4, 3)
    const from = rulesFrom(itemsets, baskets.length, 0)
    expect(recommendCombos(itemsets, from, 3).length).toBeGreaterThan(0)
  })
})

describe('integración con el dataset de demostración', () => {
  it('coincide con Apriori en el CSV sintético de 220 tickets', async () => {
    const { sampleCsv } = await import('../src/sim/sampleData')
    const { parseSales, toBaskets } = await import('../src/sim/salesData')
    const salesBaskets = toBaskets(parseSales(sampleCsv()).sales)
    const result = compareAlgorithms(salesBaskets, 0.02, 0.2, 4)
    expect(salesBaskets).toHaveLength(220)
    expect(result.onlyApriori).toHaveLength(0)
    expect(result.onlyFp).toHaveLength(0)
    expect(result.matched).toBe(result.apriori.length)
  })
})
