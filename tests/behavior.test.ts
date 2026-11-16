import { afterEach, describe, expect, it } from 'vitest'
import { buildCustomerPlan, createCustomerTraits, effectiveProbabilities, getBehaviorModel } from '../src/sim/behavior'
import { clearData, loadCsvText } from '../src/sim/dataStore'
import { DEFAULT_PARAMS, setParam } from '../src/sim/params'

afterEach(() => {
  clearData()
  setParam('sC', DEFAULT_PARAMS.sC)
  setParam('sB', DEFAULT_PARAMS.sB)
})

describe('inteligencia híbrida de clientes', () => {
  it('asigna presupuestos y rasgos coherentes con el perfil', () => {
    const economic = createCustomerTraits('ofertas', () => 0.5)
    const hurried = createCustomerTraits('apurado', () => 0.5)
    expect(economic.budget).toBeGreaterThanOrEqual(28000)
    expect(economic.budget).toBeLessThanOrEqual(78000)
    expect(economic.priceSensitivity).toBeGreaterThan(hurried.priceSensitivity)
    expect(economic.promoAffinity).toBeGreaterThan(0.9)
    expect(hurried.patience).toBeLessThan(economic.patience)
  })

  it('usa los parámetros del simulador cuando no hay tickets suficientes', () => {
    clearData()
    setParam('sC', 70)
    setParam('sB', 40)
    const model = getBehaviorModel()
    expect(model.source).toBe('configured-prior')
    expect(effectiveProbabilities(model)).toEqual({ combo: 0.7, basket: 0.4 })
  })

  it('marca el origen sintético para no confundirlo con ventas reales', () => {
    const rows = ['ticket,producto', 'T1,Platos Londres', 'T1,Tazas de café', 'T2,Platos Londres', 'T2,Tazas de café', 'T3,Platos Londres', 'T3,Tazas de café']
    expect(loadCsvText(rows.join('\n'), 'ejemplo.csv', true)).toBe(true)
    expect(getBehaviorModel().synthetic).toBe(true)
  })

  it('aprende confianza de combo y canasta desde tickets CSV', () => {
    const rows = ['ticket,producto']
    for (const ticket of ['T1', 'T2', 'T3']) {
      rows.push(`${ticket},Platos Londres`, `${ticket},Tazas de café`, `${ticket},Servilletero`, `${ticket},Canasta de mimbre`)
    }
    rows.push('T4,Platos Londres', 'T4,Tazas de café', 'T4,Servilletero')
    expect(loadCsvText(rows.join('\n'), 'ventas.csv')).toBe(true)
    const model = getBehaviorModel()
    expect(model.source).toBe('csv-apriori')
    expect(model.synthetic).toBe(false)
    expect(model.tickets).toBe(4)
    expect(model.comboConfidence).toBe(1)
    expect(model.basketConfidence).toBe(0.75)
    expect(model.rules.length).toBeGreaterThan(0)
  })

  it('construye el Pack Mesa mediante probabilidades controlables y explica las decisiones', () => {
    clearData()
    setParam('sC', 100)
    setParam('sB', 100)
    const traits = createCustomerTraits('normal', () => 0.5)
    const plan = buildCustomerPlan('normal', traits, () => 0.1)
    expect(plan.items.map((item) => item.k)).toEqual(['platos', 'tazas', 'servilletero', 'canasta'])
    expect(plan.items.every((item) => item.reason.length > 0)).toBe(true)
    expect(plan.items.every((item) => item.buy)).toBe(true)
  })

  it('no duplica productos en el plan y solo recomienda productos del catálogo', () => {
    clearData()
    const traits = createCustomerTraits('curioso', () => 0.4)
    const plan = buildCustomerPlan('curioso', traits, () => 0.3)
    const ids = plan.items.map((item) => item.k)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every((id) => ['vasos', 'servilletero', 'cubiertos', 'platos', 'tazas', 'mantel', 'canasta', 'vela', 'retrato', 'adorno'].includes(id))).toBe(true)
  })
})
