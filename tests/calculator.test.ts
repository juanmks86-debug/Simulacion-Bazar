import { describe, expect, it } from 'vitest'
import { comboCalc, money } from '../src/sim/calculator'

describe('comboCalc (verificación del Pack Mesa)', () => {
  it('con 15% de descuento coincide con el informe', () => {
    const c = comboCalc(15)
    expect(c.pvpRegularTotal).toBe(53000)
    expect(c.pvpCombo).toBe(47750)
    expect(c.costoTotal).toBe(24800)
    expect(c.ahorro).toBe(5250)
    expect(c.margenSin).toBeCloseTo(53.2, 1)
    expect(c.margenCon).toBeCloseTo(48.1, 1)
    expect(c.perdidaPP).toBeCloseTo(5.1, 1)
  })
  it('más descuento baja el margen y aumenta el ahorro', () => {
    expect(comboCalc(30).margenCon).toBeLessThan(comboCalc(10).margenCon)
    expect(comboCalc(30).ahorro).toBeGreaterThan(comboCalc(10).ahorro)
  })
  it('sin descuento no hay ahorro ni pérdida de margen', () => {
    const c = comboCalc(0)
    expect(c.ahorro).toBe(0)
    expect(c.perdidaPP).toBeCloseTo(0)
  })
  it('formatea en pesos argentinos', () => {
    expect(money(47750)).toBe('$ 47.750')
  })
})
