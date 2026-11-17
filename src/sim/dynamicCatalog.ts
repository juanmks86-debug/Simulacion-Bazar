import { createStore } from './createStore'
import type { Product } from './catalog'
import type { Sale } from './salesData'
import { norm } from './csv'

export interface ProductEconomics { cost?: number; margin?: number }
export interface DynamicProduct extends Product { tickets: number; units: number; sourcePrice: 'csv' | 'missing' }

const STORAGE_KEY = 'bazar:product-economics:v1'
function dateRank(value: string, fallback: number): number {
  const iso = Date.parse(value)
  if (Number.isFinite(iso)) return iso
  const match = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (match) return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
  return fallback
}
function readOverrides(): Record<string, ProductEconomics> {
  try { return typeof localStorage === 'undefined' ? {} : JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, ProductEconomics> }
  catch { return {} }
}
export const economicsStore = createStore<Record<string, ProductEconomics>>(readOverrides())

export function setProductEconomics(productName: string, update: ProductEconomics) {
  const key = norm(productName)
  const next = { ...economicsStore.getSnapshot(), [key]: { ...economicsStore.getSnapshot()[key], ...update } }
  economicsStore.publish(next)
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* almacenamiento opcional */ }
}

export function buildDynamicCatalog(sales: Sale[], overrides = economicsStore.getSnapshot()): DynamicProduct[] {
  const grouped = new Map<string, { name: string; tickets: Set<string>; units: number; latestPrice?: number; latestRank: number; lastIndex: number }>()
  sales.forEach((sale, index) => {
    const key = norm(sale.product)
    const entry = grouped.get(key) ?? { name: sale.product.trim(), tickets: new Set<string>(), units: 0, latestRank: -Infinity, lastIndex: -1 }
    entry.tickets.add(sale.ticket); entry.units += sale.qty
    const rank = dateRank(sale.date || '', index)
    if (sale.price !== undefined && Number.isFinite(sale.price) && sale.price > 0 && (rank > entry.latestRank || (rank === entry.latestRank && index > entry.lastIndex))) {
      entry.latestPrice = sale.price; entry.latestRank = rank; entry.lastIndex = index
    }
    grouped.set(key, entry)
  })
  const ranked = [...grouped.entries()].sort((a, b) => b[1].tickets.size - a[1].tickets.size || b[1].units - a[1].units)
  const median = ranked.length ? [...ranked].map(([, v]) => v.tickets.size).sort((a, b) => a - b)[Math.floor((ranked.length - 1) / 2)] : 0
  const usedIds = new Set<string>()
  return ranked.map(([key, entry], index) => {
    const p = entry.latestPrice ?? 0
    const saved = overrides[key] ?? {}
    const cost = saved.cost != null && Number.isFinite(saved.cost) ? Math.max(0, saved.cost) : p * (1 - (saved.margin ?? 0.45))
    const margin = p > 0 ? (p - cost) / p : 0
    let id = key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `producto-${index + 1}`
    if (usedIds.has(id)) id = `${id}-${index + 1}`
    usedIds.add(id)
    return {
      id,
      n: entry.name, e: '📦', p, costo: cost, rot: (entry.tickets.size >= median ? 'Alta' : 'Estancado') as Product['rot'],
      x: 2 + (index % 5) * 3.2, y: 2 + Math.floor(index / 5) * 2.5, s: Math.floor(index / 5), t: index % 5,
      k: 'generic', c: '#9bb5c9', rol: `Detectado en CSV · margen ${Math.round(margin * 100)}%`,
      tickets: entry.tickets.size, units: entry.units, sourcePrice: entry.latestPrice == null ? 'missing' : 'csv',
    }
  })
}
