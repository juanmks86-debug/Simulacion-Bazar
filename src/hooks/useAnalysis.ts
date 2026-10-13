import { useMemo } from 'react'
import { useStore } from './useStore'
import { dataStore } from '../sim/dataStore'
import { apriori, rulesFrom } from '../sim/apriori'
import { packMesaMetrics } from '../sim/calibration'
import { summarize, toBaskets } from '../sim/salesData'

/** Análisis de los datos cargados: resumen, reglas Apriori y chequeo del Pack Mesa. */
export function useAnalysis(minSupport = 0.02, minConfidence = 0.3) {
  const data = useStore(dataStore, (s) => s)
  const analysis = useMemo(() => {
    if (!data.sales.length) return null
    const baskets = toBaskets(data.sales)
    const itemsets = apriori(baskets, minSupport, 3)
    return {
      baskets,
      summary: summarize(data.sales),
      rules: rulesFrom(itemsets, baskets.length, minConfidence),
      itemsets: itemsets.length,
      pack: packMesaMetrics(baskets),
    }
  }, [data.sales, minSupport, minConfidence])
  return { data, analysis }
}
