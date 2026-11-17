import { useMemo } from 'react'
import { dataStore } from '../sim/dataStore'
import { economicsStore, buildDynamicCatalog } from '../sim/dynamicCatalog'
import { useStore } from './useStore'

export function useDynamicCatalog() {
  const data = useStore(dataStore, (state) => state)
  const economics = useStore(economicsStore, (state) => state)
  const products = useMemo(() => buildDynamicCatalog(data.sales, economics), [data.sales, economics])
  return { products, data }
}
