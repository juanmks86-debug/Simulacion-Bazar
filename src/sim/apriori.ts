import { norm } from './csv'

export interface Itemset { items: string[]; count: number; support: number }
export interface Rule { antecedent: string[]; consequent: string[]; count: number; support: number; confidence: number; lift: number }

const keyOf = (items: string[]) => items.join('\u0001')

/** Apriori clásico: conjuntos de hasta `maxSize` productos con soporte >= minSupport (0 a 1). */
export function apriori(baskets: string[][], minSupport: number, maxSize = 3): Itemset[] {
  const n = baskets.length
  if (!n) return []
  const minCount = Math.max(1, Math.ceil(minSupport * n - 1e-9))
  const sets = baskets.map((b) => new Set(b))
  const counts = new Map<string, number>()
  for (const b of baskets) for (const it of new Set(b)) counts.set(it, (counts.get(it) ?? 0) + 1)
  let level: Itemset[] = [...counts.entries()]
    .filter(([, c]) => c >= minCount)
    .map(([it, c]) => ({ items: [it], count: c, support: c / n }))
    .sort((a, b) => (a.items[0] < b.items[0] ? -1 : 1))
  const all: Itemset[] = [...level]
  for (let size = 2; size <= maxSize && level.length > 1; size++) {
    const frequent = new Set(level.map((s) => keyOf(s.items)))
    const candidates = new Map<string, string[]>()
    for (let i = 0; i < level.length; i++) {
      for (let j = i + 1; j < level.length; j++) {
        const a = level[i].items, b = level[j].items
        if (a.slice(0, -1).join('\u0001') !== b.slice(0, -1).join('\u0001')) continue
        const cand = [...a, b[b.length - 1]].sort()
        // poda: todos los subconjuntos de tamaño size-1 deben ser frecuentes
        const ok = cand.every((_, k) => frequent.has(keyOf(cand.filter((__, idx) => idx !== k))))
        if (ok) candidates.set(keyOf(cand), cand)
      }
    }
    const next: Itemset[] = []
    for (const cand of candidates.values()) {
      let c = 0
      for (const s of sets) if (cand.every((it) => s.has(it))) c++
      if (c >= minCount) next.push({ items: cand, count: c, support: c / n })
    }
    next.sort((a, b) => (keyOf(a.items) < keyOf(b.items) ? -1 : 1))
    all.push(...next)
    level = next
  }
  return all
}

/** Reglas X → Y a partir de los conjuntos frecuentes, ordenadas por lift y confianza. */
export function rulesFrom(itemsets: Itemset[], nBaskets: number, minConfidence: number): Rule[] {
  const support = new Map(itemsets.map((s) => [keyOf(s.items), s.support]))
  const rules: Rule[] = []
  for (const s of itemsets) {
    if (s.items.length < 2) continue
    const m = s.items.length
    for (let mask = 1; mask < (1 << m) - 1; mask++) {
      const antecedent = s.items.filter((_, i) => mask & (1 << i))
      const consequent = s.items.filter((_, i) => !(mask & (1 << i)))
      const sa = support.get(keyOf(antecedent)), sc = support.get(keyOf(consequent))
      if (!sa || !sc) continue
      const confidence = s.support / sa
      if (confidence + 1e-12 < minConfidence) continue
      rules.push({ antecedent, consequent, count: s.count, support: s.support, confidence, lift: confidence / sc })
    }
  }
  void nBaskets
  return rules.sort((a, b) => b.lift - a.lift || b.confidence - a.confidence || b.support - a.support)
}

/** Métricas de una regla concreta aunque no supere el soporte mínimo (ej. el Pack Mesa). */
export function evaluateRule(baskets: string[][], antecedent: string[], consequent: string[]) {
  const n = baskets.length
  let a = 0, c = 0, both = 0
  for (const b of baskets) {
    const s = new Set(b)
    const hasA = antecedent.every((i) => s.has(i)), hasC = consequent.every((i) => s.has(i))
    if (hasA) a++
    if (hasC) c++
    if (hasA && hasC) both++
  }
  const support = n ? both / n : 0
  const confidence = a ? both / a : null
  const lift = confidence !== null && c ? confidence / (c / n) : null
  return { n, antecedentCount: a, consequentCount: c, count: both, support, confidence, lift }
}

/** Busca en el dataset un producto cuyo nombre contenga la palabra clave (sin tildes ni mayúsculas). */
export function findProduct(names: string[], keyword: string): string | null {
  const k = norm(keyword)
  return names.find((n) => norm(n).includes(k)) ?? null
}
