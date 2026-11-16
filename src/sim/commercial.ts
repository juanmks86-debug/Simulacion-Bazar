import { PROD, type Product } from './catalog'
import type { Rule } from './apriori'
import { norm } from './csv'

export interface CommercialOpportunity {
  products: Product[]
  labels: string[]
  support: number
  confidence: number
  lift: number
  count: number
  revenue: number
  cost: number
  margin: number
  maxSafeDiscount: number
  suggestedDiscount: number
  marginAtSuggestion: number
  targetMarginFeasible: boolean
}

function matchProduct(label: string): Product | undefined {
  const value = norm(label)
  return PROD.find((p) => norm(p.id) === value || norm(p.n) === value)
    ?? PROD.find((p) => value.includes(norm(p.n)) || norm(p.n).includes(value))
}

/**
 * Convierte reglas observadas en oportunidades comerciales estimadas.
 * No predice ventas ni causalidad: calcula economía unitaria con precios/costos del catálogo.
 */
export function buildCommercialOpportunities(rules: Rule[], targetMargin = 0.35, maxSuggestedDiscount = 0.15): CommercialOpportunity[] {
  const seen = new Set<string>()
  const output: CommercialOpportunity[] = []
  for (const rule of rules) {
    const labels = [...new Set([...rule.antecedent, ...rule.consequent])]
    if (labels.length < 3) continue
    const products = labels.map(matchProduct)
    if (products.some((p) => !p)) continue
    const resolved = products as Product[]
    if (!resolved.some((p) => p.rot === 'Estancado')) continue
    const key = resolved.map((p) => p.id).sort().join('|')
    if (seen.has(key)) continue
    seen.add(key)
    const revenue = resolved.reduce((sum, p) => sum + p.p, 0)
    const cost = resolved.reduce((sum, p) => sum + p.costo, 0)
    const margin = revenue > 0 ? (revenue - cost) / revenue : 0
    const safe = revenue > 0 ? Math.max(0, Math.min(1, 1 - cost / (revenue * (1 - targetMargin)))) : 0
    const suggestedDiscount = Math.min(safe, Math.max(0, maxSuggestedDiscount))
    const discountedRevenue = revenue * (1 - suggestedDiscount)
    const marginAtSuggestion = discountedRevenue > 0 ? (discountedRevenue - cost) / discountedRevenue : 0
    output.push({
      products: resolved, labels, support: rule.support, confidence: rule.confidence,
      lift: rule.lift, count: rule.count, revenue, cost, margin, maxSafeDiscount: safe,
      suggestedDiscount, marginAtSuggestion, targetMarginFeasible: margin + 1e-12 >= targetMargin,
    })
  }
  return output.sort((a, b) => b.lift - a.lift || b.confidence - a.confidence || b.support - a.support)
}
