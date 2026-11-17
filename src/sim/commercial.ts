import { PROD, type Product } from './catalog'
import type { Rule } from './apriori'
import { evaluateRule } from './apriori'
import { norm } from './csv'

export interface CommercialOpportunity {
  products: Product[]; labels: string[]; support: number; confidence: number; lift: number; count: number
  revenue: number; cost: number; margin: number; maxSafeDiscount: number; suggestedDiscount: number
  marginAtSuggestion: number; targetMarginFeasible: boolean; source: 'association' | 'cooccurrence' | 'individual'
}

function matchProduct(label: string, catalog: Product[]): Product | undefined {
  const value = norm(label)
  return catalog.find((p) => norm(p.id) === value || norm(p.n) === value)
    ?? catalog.find((p) => value.includes(norm(p.n)) || norm(p.n).includes(value))
}

function makeOpportunity(products: Product[], metrics: { support: number; confidence: number; lift: number; count: number }, targetMargin: number, maxSuggestedDiscount: number, source: CommercialOpportunity['source']): CommercialOpportunity {
  const revenue = products.reduce((sum, p) => sum + p.p, 0)
  const cost = products.reduce((sum, p) => sum + p.costo, 0)
  const margin = revenue > 0 ? (revenue - cost) / revenue : 0
  const safe = revenue > 0 ? Math.max(0, Math.min(1, 1 - cost / (revenue * (1 - targetMargin)))) : 0
  const suggestedDiscount = Math.min(safe, Math.max(0, maxSuggestedDiscount))
  const discountedRevenue = revenue * (1 - suggestedDiscount)
  return { products, labels: products.map((p) => p.n), ...metrics, revenue, cost, margin, maxSafeDiscount: safe,
    suggestedDiscount, marginAtSuggestion: discountedRevenue > 0 ? (discountedRevenue - cost) / discountedRevenue : 0,
    targetMarginFeasible: margin + 1e-12 >= targetMargin, source }
}

/**
 * Usa primero reglas observadas. Si no hay reglas comerciales suficientes, ofrece pares que
 * efectivamente coaparecen en tickets; si tampoco existen pares, muestra fichas económicas
 * individuales. Estas alternativas nunca se presentan como asociaciones descubiertas.
 */
export function buildCommercialOpportunities(
  rules: Rule[], targetMargin = 0.35, maxSuggestedDiscount = 0.15,
  catalog: Product[] = PROD, baskets: string[][] = [],
): CommercialOpportunity[] {
  const seen = new Set<string>()
  const output: CommercialOpportunity[] = []
  for (const rule of rules) {
    const labels = [...new Set([...rule.antecedent, ...rule.consequent])]
    if (labels.length < 2) continue
    const products = labels.map((label) => matchProduct(label, catalog))
    if (products.some((p) => !p || !(p.p > 0))) continue
    const resolved = products as Product[]
    const key = resolved.map((p) => p.id).sort().join('|')
    if (seen.has(key)) continue
    seen.add(key)
    output.push(makeOpportunity(resolved, { support: rule.support, confidence: rule.confidence, lift: rule.lift, count: rule.count }, targetMargin, maxSuggestedDiscount, 'association'))
  }
  if (output.length) return output.sort((a, b) => b.lift - a.lift || b.confidence - a.confidence || b.support - a.support)

  const names = [...new Set(baskets.flat())]
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
    const a = matchProduct(names[i], catalog), b = matchProduct(names[j], catalog)
    if (!a || !b || !(a.p > 0) || !(b.p > 0) || a.id === b.id) continue
    const metrics = evaluateRule(baskets, [names[i]], [names[j]])
    if (metrics.count < 1) continue
    const products = [a, b]
    const key = products.map((p) => p.id).sort().join('|')
    if (seen.has(key)) continue
    seen.add(key)
    output.push(makeOpportunity(products, { support: metrics.support, confidence: metrics.confidence ?? 0, lift: metrics.lift ?? 0, count: metrics.count }, targetMargin, maxSuggestedDiscount, 'cooccurrence'))
  }
  if (output.length) return output.sort((a, b) => b.lift - a.lift || b.confidence - a.confidence).slice(0, 12)

  return catalog.map((product) => makeOpportunity([product], {
    support: baskets.length ? baskets.filter((basket) => basket.includes(product.n)).length / baskets.length : 0,
    confidence: 1, lift: 1, count: product.p > 0 ? product.tickets ?? 0 : 0,
  }, targetMargin, maxSuggestedDiscount, 'individual'))
    .filter((item) => item.products[0].p > 0)
}
