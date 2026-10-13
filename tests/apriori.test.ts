import { describe, expect, it } from 'vitest'
import { apriori, evaluateRule, findProduct, rulesFrom } from '../src/sim/apriori'
import { calibrationParams, packMesaMetrics } from '../src/sim/calibration'
import { sampleCsv } from '../src/sim/sampleData'
import { parseSales, toBaskets } from '../src/sim/salesData'

const baskets = [['A', 'B', 'C'], ['A', 'B'], ['A', 'C'], ['B', 'C'], ['A', 'B', 'C']]

describe('apriori', () => {
  it('cuenta soportes y respeta el mínimo', () => {
    const sets = apriori(baskets, 0.6, 3)
    const get = (items: string[]) => sets.find((s) => s.items.join() === items.join())
    expect(get(['A'])?.count).toBe(4)
    expect(get(['A', 'B'])?.count).toBe(3)
  })
  it('no devuelve conjuntos por debajo del soporte mínimo', () => {
    const sets = apriori(baskets, 0.6, 3)
    expect(sets.find((s) => s.items.length === 3)).toBeUndefined()
    expect(sets.every((s) => s.support >= 0.6)).toBe(true)
  })
  it('calcula confianza y lift de las reglas', () => {
    const rules = rulesFrom(apriori(baskets, 0.4, 3), baskets.length, 0)
    const ab = rules.find((r) => r.antecedent.join() === 'A' && r.consequent.join() === 'B')!
    expect(ab.support).toBeCloseTo(0.6)
    expect(ab.confidence).toBeCloseTo(0.75)
    expect(ab.lift).toBeCloseTo(0.75 / 0.8)
  })
  it('filtra por confianza mínima y ordena por lift', () => {
    const rules = rulesFrom(apriori(baskets, 0.4, 3), baskets.length, 0.7)
    expect(rules.every((r) => r.confidence >= 0.7 - 1e-9)).toBe(true)
    for (let i = 1; i < rules.length; i++) expect(rules[i - 1].lift).toBeGreaterThanOrEqual(rules[i].lift - 1e-9)
  })
  it('evaluateRule mide una regla puntual y avisa si no hay casos', () => {
    expect(evaluateRule(baskets, ['A', 'B'], ['C'])).toMatchObject({ antecedentCount: 3, count: 2 })
    expect(evaluateRule(baskets, ['Z'], ['A']).confidence).toBeNull()
  })
  it('findProduct ignora tildes y mayúsculas', () => {
    expect(findProduct(['Tazas de café', 'Platos Londres'], 'CAFÉ')).toBe('Tazas de café')
    expect(findProduct(['Vasos'], 'plato')).toBeNull()
  })
})

describe('ejemplo sintético y calibración', () => {
  const b = toBaskets(parseSales(sampleCsv()).sales)
  it('el ejemplo es reproducible y tiene 220 tickets', () => {
    expect(sampleCsv()).toBe(sampleCsv())
    expect(b).toHaveLength(220)
  })
  it('mide el Pack Mesa cerca de lo que generó el ejemplo (57% y 35%)', () => {
    const m = packMesaMetrics(b)
    expect(m.missing).toEqual([])
    expect(m.step?.confidence).toBeGreaterThan(0.4)
    expect(m.step?.confidence).toBeLessThan(0.75)
    expect(m.pack?.confidence).toBeGreaterThan(0.15)
    expect(m.pack?.confidence).toBeLessThan(0.6)
  })
  it('la calibración respeta los límites de los deslizadores', () => {
    const m = packMesaMetrics(b)
    const c = calibrationParams(m)
    expect(c.sC).toBeGreaterThanOrEqual(5); expect(c.sC).toBeLessThanOrEqual(100)
    expect(Number.isInteger(c.sB)).toBe(true)
    expect(calibrationParams({ missing: ['plato'], step: null, pack: null })).toEqual({})
  })
  it('avisa si faltan productos del combo', () => {
    expect(packMesaMetrics([['Vasos'], ['Mantel']]).missing.length).toBeGreaterThan(0)
  })
})
