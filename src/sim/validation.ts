import { apriori, evaluateRule, rulesFrom, type Itemset, type Rule } from './apriori'
import { fpGrowth } from './fpGrowth'

export interface AlgorithmComparison { apriori: Itemset[]; fpGrowth: Itemset[]; aprioriRules: Rule[]; fpRules: Rule[]; onlyApriori: string[][]; onlyFp: string[][]; matched: number }
const key = (items: string[]) => [...items].sort().join('|')
export function compareAlgorithms(baskets: string[][], minSupport = 0.02, minConfidence = 0.2, maxSize = 3): AlgorithmComparison {
  const a = apriori(baskets, minSupport, maxSize)
  const f = fpGrowth(baskets, minSupport, maxSize)
  const ak = new Set(a.map((x) => key(x.items))), fk = new Set(f.map((x) => key(x.items)))
  return {
    apriori: a, fpGrowth: f,
    aprioriRules: rulesFrom(a, baskets.length, minConfidence),
    fpRules: rulesFrom(f, baskets.length, minConfidence),
    onlyApriori: a.filter((x) => !fk.has(key(x.items))).map((x) => x.items),
    onlyFp: f.filter((x) => !ak.has(key(x.items))).map((x) => x.items),
    matched: a.filter((x) => fk.has(key(x.items))).length,
  }
}

export interface BootstrapResult { iterations: number; appearances: number; appearanceRate: number; confidenceMean: number | null; liftMean: number | null; confidenceP05: number | null; confidenceP95: number | null; liftP05: number | null; liftP95: number | null; values: number }
const quantile = (values: number[], q: number) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * q))]
}
export function bootstrapRule(baskets: string[][], antecedent: string[], consequent: string[], iterations = 500, minSupport = 0.02, random: () => number = Math.random): BootstrapResult {
  if (!baskets.length || iterations < 1) return { iterations, appearances: 0, appearanceRate: 0, confidenceMean: null, liftMean: null, confidenceP05: null, confidenceP95: null, liftP05: null, liftP95: null, values: 0 }
  let appearances = 0
  const confidences: number[] = [], lifts: number[] = []
  for (let i = 0; i < iterations; i++) {
    const sample = Array.from({ length: baskets.length }, () => baskets[Math.floor(random() * baskets.length)])
    const metric = evaluateRule(sample, antecedent, consequent)
    if (metric.support + 1e-12 >= minSupport && metric.confidence !== null && metric.confidence > 0 && metric.lift !== null && metric.lift > 0) appearances++
    if (metric.confidence !== null) confidences.push(metric.confidence)
    if (metric.lift !== null) lifts.push(metric.lift)
  }
  const mean = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
  return { iterations, appearances, appearanceRate: appearances / iterations, confidenceMean: mean(confidences), liftMean: mean(lifts), confidenceP05: quantile(confidences, .05), confidenceP95: quantile(confidences, .95), liftP05: quantile(lifts, .05), liftP95: quantile(lifts, .95), values: confidences.length }
}

export function sensitivityAnalysis(baskets: string[][], thresholds = [0.01, 0.015, 0.02, 0.03, 0.05], minConfidence = 0.2, maxSize = 4) {
  return thresholds.map((threshold) => {
    const itemsets = apriori(baskets, threshold, maxSize)
    const rules = rulesFrom(itemsets, baskets.length, minConfidence)
    return { threshold, minCount: baskets.length ? Math.max(1, Math.ceil(threshold * baskets.length - 1e-9)) : 0, itemsets: itemsets.length, rules: rules.length, combos: itemsets.filter((x) => x.items.length >= 3).length }
  })
}

export function recommendCombos(itemsets: Itemset[], rules: Rule[], minItems = 3) {
  const frequent = new Set(itemsets.filter((x) => x.items.length >= minItems).map((x) => key(x.items)))
  return rules.filter((rule) => rule.antecedent.length >= minItems - 1 && rule.consequent.length === 1 && frequent.has(key([...rule.antecedent, ...rule.consequent])))
    .sort((a, b) => b.lift - a.lift || b.confidence - a.confidence)
}
