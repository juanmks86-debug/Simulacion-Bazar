import { useMemo } from 'react'
import { dataStore } from '../sim/dataStore'
import { economicsStore, buildDynamicCatalog } from '../sim/dynamicCatalog'
import { useStore } from './useStore'
import { buildDemand } from '../sim/monteCarloDynamic'

export function useDynamicCatalog() {
  const data = useStore(dataStore, (state) => state)
  const economics = useStore(economicsStore, (state) => state)
  const products = useMemo(() => buildDynamicCatalog(data.sales, economics), [data.sales, economics])
  return { products, data }
}

/** Demanda estimada por producto a partir del CSV activo (para Monte Carlo y escenarios). */
export function useDemandSummary() {
  const { products, data } = useDynamicCatalog()
  const summary = useMemo(
    () => buildDemand(data.sales, products.map((p) => ({ id: p.id, name: p.n, price: p.p, cost: p.costo, rot: p.rot }))),
    [data.sales, products],
  )
  return { summary, products, data }
}
