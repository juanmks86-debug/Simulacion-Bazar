import type { Itemset } from './apriori'

type WeightedBasket = { items: string[]; weight: number }
type Node = { item: string | null; count: number; parent: Node | null; children: Map<string, Node>; links: Node[] }
const keyOf = (items: string[]) => [...items].sort().join('\u0001')

/** FP-Growth: árbol de patrones frecuentes y bases condicionales ponderadas. */
export function fpGrowth(baskets: string[][], minSupport: number, maxSize = 3): Itemset[] {
  const n = baskets.length
  if (!n) return []
  const minCount = Math.max(1, Math.ceil(minSupport * n - 1e-9))
  const initial: WeightedBasket[] = baskets.map((items) => ({ items: [...new Set(items)], weight: 1 }))
  const output = new Map<string, Itemset>()

  const mine = (transactions: WeightedBasket[], suffix: string[], globalOrder?: Map<string, number>) => {
    const frequency = new Map<string, number>()
    for (const tx of transactions) for (const item of new Set(tx.items)) frequency.set(item, (frequency.get(item) ?? 0) + tx.weight)
    const frequent = [...frequency.entries()].filter(([, count]) => count >= minCount)
    if (!frequent.length) return
    const order = globalOrder ?? new Map(frequent.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([item], i) => [item, i]))
    const root: Node = { item: null, count: 0, parent: null, children: new Map(), links: [] }
    const header = new Map<string, Node[]>()
    for (const tx of transactions) {
      const sorted = [...new Set(tx.items)].filter((item) => frequency.get(item)! >= minCount)
        .sort((a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER))
      let current = root
      for (const item of sorted) {
        let child = current.children.get(item)
        if (!child) {
          child = { item, count: 0, parent: current, children: new Map(), links: [] }
          current.children.set(item, child)
          const list = header.get(item) ?? []
          list.push(child); header.set(item, list)
        }
        child.count += tx.weight
        current = child
      }
    }
    const ascending = frequent.sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    for (const [item, count] of ascending) {
      const pattern = [...suffix, item]
      if (pattern.length > maxSize) continue
      const sortedPattern = [...pattern].sort()
      output.set(keyOf(sortedPattern), { items: sortedPattern, count, support: count / n })
      if (pattern.length >= maxSize) continue
      const conditional: WeightedBasket[] = []
      for (const node of header.get(item) ?? []) {
        const path: string[] = []
        let parent = node.parent
        while (parent && parent.item !== null) { path.push(parent.item); parent = parent.parent }
        if (path.length) conditional.push({ items: path, weight: node.count })
      }
      if (conditional.length) mine(conditional, pattern, order)
    }
  }
  mine(initial, [])
  return [...output.values()].sort((a, b) => a.items.length - b.items.length || keyOf(a.items).localeCompare(keyOf(b.items)))
}
