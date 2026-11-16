import { useMemo } from 'react'
import { useStore } from './useStore'
import { dataStore } from '../sim/dataStore'
import { apriori, rulesFrom } from '../sim/apriori'
import { fpGrowth } from '../sim/fpGrowth'
import { compareAlgorithms, recommendCombos, sensitivityAnalysis } from '../sim/validation'
import { packMesaMetrics } from '../sim/calibration'
import { summarize, toBaskets } from '../sim/salesData'

/** Análisis derivado del CSV activo; no altera ni duplica las ventas originales. */
export function useAnalysis(minSupport = 0.02, minConfidence = 0.3) {
  const data = useStore(dataStore, (s) => s)
  const analysis = useMemo(() => {
    if (!data.sales.length) return null
    const baskets = toBaskets(data.sales)
    const itemsets = apriori(baskets, minSupport, 4)
    const rules = rulesFrom(itemsets, baskets.length, minConfidence)
    const comparison = compareAlgorithms(baskets, minSupport, minConfidence, 4)
    return {
      baskets,
      summary: summarize(data.sales),
      rules,
      itemsets,
      fpItemsets: fpGrowth(baskets, minSupport, 4),
      combos: recommendCombos(itemsets, rules),
      sensitivity: sensitivityAnalysis(baskets, [0.01, 0.015, 0.02, 0.03, 0.05], minConfidence),
      comparison,
      pack: packMesaMetrics(baskets),
    }
  }, [data.sales, minSupport, minConfidence])
  return { data, analysis }
}
