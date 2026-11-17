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
    const summary = summarize(data.sales)
    // Limita la explosión combinatoria en catálogos amplios (p. ej. 50 productos).
    const maxSize = summary.products > 20 ? 3 : 4
    const itemsets = apriori(baskets, minSupport, maxSize)
    const rules = rulesFrom(itemsets, baskets.length, minConfidence)
    const comparison = compareAlgorithms(baskets, minSupport, minConfidence, maxSize)
    return {
      baskets,
      summary,
      rules,
      itemsets,
      fpItemsets: fpGrowth(baskets, minSupport, maxSize),
      combos: recommendCombos(itemsets, rules),
      sensitivity: sensitivityAnalysis(baskets, [0.01, 0.015, 0.02, 0.03, 0.05], minConfidence, maxSize),
      comparison,
      pack: packMesaMetrics(baskets),
    }
  }, [data.sales, minSupport, minConfidence])
  return { data, analysis }
}
