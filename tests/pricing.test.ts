import { describe, expect, it } from 'vitest'
import { PR, PROD, P } from '../src/sim/catalog'
import { hasCombo, priceOf } from '../src/sim/pricing'

const full = () => Object.fromEntries(PROD.map((p) => [p.id, 5]))

describe('catálogo', () => {
  it('tiene 10 productos únicos: 5 de alta rotación y 5 estancados', () => {
    expect(PROD).toHaveLength(10)
    expect(new Set(PROD.map((p) => p.id)).size).toBe(10)
    expect(PROD.filter((p) => p.rot === 'Alta')).toHaveLength(5)
    expect(PROD.filter((p) => p.rot === 'Estancado')).toHaveLength(5)
  })
  it('todos los productos dejan margen positivo', () => {
    for (const p of PROD) expect(p.costo).toBeLessThan(p.p)
  })
})

describe('priceOf', () => {
  it('sin promoción cobra el precio de lista', () => {
    expect(priceOf('platos', [], null, full())).toMatchObject({ price: 14000, q: 1, label: '', promo: false, disc: false })
  })
  it('2x1 en tazas: se llevan 2 y se paga 1 si hay stock', () => {
    expect(priceOf('tazas', [], PR.tazas, full())).toMatchObject({ price: P.tazas.p, q: 2, label: '2x1', promo: true })
  })
  it('2x1 sin stock suficiente: se vende una sola unidad', () => {
    expect(priceOf('tazas', [], PR.tazas, { ...full(), tazas: 1 })).toMatchObject({ q: 1, label: '', promo: true })
  })
  it('promociones porcentuales', () => {
    expect(priceOf('mantel', [], PR.mantel, full()).price).toBeCloseTo(50000 * 0.8)
    expect(priceOf('vela', [], PR.vela, full()).price).toBeCloseTo(14000 * 0.7)
  })
  it('una promoción solo afecta a su producto', () => {
    expect(priceOf('platos', [], PR.mantel, full())).toMatchObject({ price: 14000, promo: false })
  })
  it('la canasta lleva 15% off solo si el carrito tiene el Pack Mesa', () => {
    const combo = ['platos', 'tazas', 'servilletero']
    expect(hasCombo(combo)).toBe(true)
    expect(hasCombo(['platos', 'tazas'])).toBe(false)
    expect(priceOf('canasta', combo, null, full())).toMatchObject({ price: 35000 * 0.85, disc: true, label: '15% Pack Mesa' })
    expect(priceOf('canasta', ['platos'], null, full())).toMatchObject({ price: 35000, disc: false })
  })
})
