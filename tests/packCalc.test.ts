import { describe, expect, it } from 'vitest'
import { comboCalc, packCalc } from '../src/sim/calculator'

describe('packCalc', () => {
  it('con los 4 productos del Pack Mesa reproduce comboCalc', () => {
    const items = [
      { name: 'Platos', pvp: 14000, costo: 8400 }, { name: 'Servilletero', pvp: 2000, costo: 1200 },
      { name: 'Tazas', pvp: 2000, costo: 1200 }, { name: 'Canasta', pvp: 35000, costo: 14000 },
    ]
    const a = packCalc(items, [3], 15), b = comboCalc(15)
    expect(a.pvpCombo).toBeCloseTo(b.pvpCombo)
    expect(a.margenCon).toBeCloseTo(b.margenCon)
    expect(a.margenSin).toBeCloseTo(b.margenSin)
    expect(a.ahorro).toBeCloseTo(b.ahorro)
  })
  it('calcula la venta extra necesaria para igualar la ganancia', () => {
    const items = [{ name: 'A', pvp: 1000, costo: 600 }, { name: 'B', pvp: 1000, costo: 600 }]
    const r = packCalc(items, [1], 20)          // margen sin = 800, con = 600
    expect(r.margenAbsSin).toBe(800); expect(r.margenAbsCon).toBe(600)
    expect(r.ventaExtraEquilibrio).toBeCloseTo(800 / 600 - 1)
  })
  it('sin descuento no hace falta vender más; si el descuento elimina la ganancia no hay equilibrio', () => {
    const items = [{ name: 'A', pvp: 1000, costo: 900 }, { name: 'B', pvp: 1000, costo: 900 }]
    expect(packCalc(items, [0], 0).ventaExtraEquilibrio).toBe(0)
    expect(packCalc(items, [0, 1], 50).ventaExtraEquilibrio).toBeNull()
  })
})
