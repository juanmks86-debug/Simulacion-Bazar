import { describe, expect, it } from 'vitest'
import { histogram, monteCarlo } from '../src/sim/stats'

// Generador pseudoaleatorio con semilla (reproducible)
const seeded = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }

describe('monteCarlo', () => {
  it('es reproducible con la misma semilla', () => {
    expect(monteCarlo(seeded(42))).toEqual(monteCarlo(seeded(42)))
  })
  it('el combo supera a la canasta sola y la probabilidad es razonable', () => {
    const r = monteCarlo(seeded(7))
    expect(r.meanB).toBeGreaterThan(r.meanA)
    expect(r.diffMean).toBeCloseTo(r.meanB - r.meanA)
    expect(r.winRate).toBeGreaterThan(90)
    expect(r.winRate).toBeLessThanOrEqual(100)
    expect(r.histDiff).toHaveLength(3000)
  })
})

describe('histogram', () => {
  it('reparte todos los datos en los intervalos', () => {
    const data = Array.from({ length: 1000 }, (_, i) => i - 300)
    const bins = histogram(data, 50)
    expect(bins).toHaveLength(50)
    expect(bins.reduce((a, b) => a + b.count, 0)).toBe(1000)
    expect(bins[0].from).toBe(-300)
    expect(bins[49].to).toBeCloseTo(699)
  })
  it('maneja datos vacíos o constantes', () => {
    expect(histogram([])).toEqual([])
    const bins = histogram([5, 5, 5], 10)
    expect(bins.reduce((a, b) => a + b.count, 0)).toBe(3)
  })
})

describe('sensibilidad (misma simulación)', () => {
  it('la fila Caso Base reutiliza la corrida principal', async () => {
    const { sensitivityRows } = await import('../src/sim/stats')
    const base = monteCarlo(seeded(3))
    const rows = sensitivityRows(base, seeded(11))
    expect(rows).toHaveLength(4)
    const b = rows.find((r) => r.isBase)!
    expect(b.meanB).toBe(base.meanB)
    expect(b.winRate).toBe(base.winRate)
  })
  it('más demanda implica más margen y más escenarios favorables', async () => {
    const { sensitivityRows } = await import('../src/sim/stats')
    const rows = sensitivityRows(monteCarlo(seeded(3)), seeded(11))
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].meanB).toBeGreaterThan(rows[i - 1].meanB)
      expect(rows[i].winRate).toBeGreaterThanOrEqual(rows[i - 1].winRate - 0.5)
    }
  })
})
