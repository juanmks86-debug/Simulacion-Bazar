import { createStore } from './createStore'
import type { McParams, McResult } from './monteCarloDynamic'

/** Escenario comercial calculado con Monte Carlo sobre el CSV activo. Se guarda solo el resumen. */
export interface SavedScenario {
  id: number; name: string; dataset: string; params: McParams; promotedCount: number; productsCount: number
  meanActual: number; meanPromo: number; delta: number; pBeat: number; pLoss: number
  marginPct: number; p025: number; p975: number; meanRevenue: number
}

let nextId = 1
export const scenarioStore = createStore<{ items: SavedScenario[] }>({ items: [] })

export function addScenario(name: string, dataset: string, r: McResult): SavedScenario {
  const item: SavedScenario = {
    id: nextId++, name, dataset, params: r.params, promotedCount: r.promotedCount, productsCount: r.products.length,
    meanActual: r.actual.mean, meanPromo: r.promo.mean, delta: r.promo.mean - r.actual.mean,
    pBeat: r.promo.pBeatActual ?? 0, pLoss: r.promo.pLoss, marginPct: r.promo.marginPct, p025: r.promo.p025, p975: r.promo.p975,
    meanRevenue: r.promo.meanRevenue,
  }
  scenarioStore.publish({ items: [...scenarioStore.getSnapshot().items, item] })
  return item
}
export const removeScenario = (id: number) => scenarioStore.publish({ items: scenarioStore.getSnapshot().items.filter((s) => s.id !== id) })
export const clearScenarios = (dataset: string) => scenarioStore.publish({ items: scenarioStore.getSnapshot().items.filter((s) => s.dataset !== dataset) })
