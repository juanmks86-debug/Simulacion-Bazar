import { norm, parseCsv, parseNumber } from './csv'

/** Una línea de venta: un producto dentro de un ticket. */
export interface Sale { ticket: string; product: string; qty: number; price?: number; date?: string }
export interface ParseResult { sales: Sale[]; warnings: string[] }

const ALIASES = {
  ticket: ['ticket', 'id_ticket', 'nro_ticket', 'numero_ticket', 'factura', 'comprobante', 'venta', 'id_venta', 'transaccion', 'transaction', 'orden', 'pedido', 'order', 'id'],
  product: ['producto', 'articulo', 'item', 'descripcion', 'product', 'nombre'],
  qty: ['cantidad', 'cant', 'qty', 'unidades'],
  price: ['precio', 'precio_unitario', 'pvp', 'importe', 'monto', 'price'],
  date: ['fecha', 'date', 'dia'],
} as const

const key = (h: string) => norm(h).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

/** Lee un CSV de ventas (una fila por producto vendido). Lanza Error con un mensaje claro si faltan columnas. */
export function parseSales(text: string): ParseResult {
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('El archivo está vacío o no tiene filas de datos.')
  const header = rows[0].map(key)
  const find = (names: readonly string[]) => header.findIndex((h) => names.includes(h))
  const iT = find(ALIASES.ticket), iP = find(ALIASES.product)
  if (iT < 0 || iP < 0) {
    throw new Error(`No encontré las columnas obligatorias. Necesito una columna de ticket (ej. "ticket") y una de producto (ej. "producto"). Encabezados leídos: ${rows[0].join(' | ')}`)
  }
  const iQ = find(ALIASES.qty), iPr = find(ALIASES.price), iD = find(ALIASES.date)
  const sales: Sale[] = []
  const names = new Map<string, string>() // nombre normalizado -> primer nombre visto
  let skipped = 0
  for (const r of rows.slice(1)) {
    const ticket = (r[iT] ?? '').trim(), rawProduct = (r[iP] ?? '').replace(/\s+/g, ' ').trim()
    const qty = iQ >= 0 ? parseNumber(r[iQ] ?? '') : 1
    if (!ticket || !rawProduct || (iQ >= 0 && !(qty > 0))) { skipped++; continue }
    const k = norm(rawProduct)
    if (!names.has(k)) names.set(k, rawProduct)
    const price = iPr >= 0 ? parseNumber(r[iPr] ?? '') : NaN
    sales.push({
      ticket, product: names.get(k) as string, qty,
      price: Number.isFinite(price) ? price : undefined,
      date: iD >= 0 ? (r[iD] ?? '') || undefined : undefined,
    })
  }
  if (!sales.length) throw new Error('No quedó ninguna venta válida: revisá que las columnas ticket y producto tengan datos.')
  const warnings: string[] = []
  if (skipped) warnings.push(`Se ignoraron ${skipped} fila(s) sin ticket, sin producto o con cantidad inválida.`)
  if (iQ < 0) warnings.push('No hay columna de cantidad: se asumió 1 unidad por fila.')
  if (iPr < 0) warnings.push('No hay columna de precio: no se calculan ingresos.')
  return { sales, warnings }
}

/** Canastas: un array de productos únicos por ticket. */
export function toBaskets(sales: Sale[]): string[][] {
  const map = new Map<string, Set<string>>()
  for (const s of sales) {
    if (!map.has(s.ticket)) map.set(s.ticket, new Set())
    map.get(s.ticket)?.add(s.product)
  }
  return [...map.values()].map((set) => [...set].sort())
}

export interface SalesSummary {
  tickets: number; lines: number; units: number; products: number
  revenue: number | null; avgBasket: number
  from?: string; to?: string
  top: { product: string; tickets: number; units: number; revenue: number | null }[]
}

export function summarize(sales: Sale[]): SalesSummary {
  const baskets = toBaskets(sales)
  const byProduct = new Map<string, { tickets: Set<string>; units: number; revenue: number; hasPrice: boolean }>()
  let units = 0, revenue = 0, anyPrice = false
  const dates: string[] = []
  for (const s of sales) {
    units += s.qty
    const e = byProduct.get(s.product) ?? { tickets: new Set<string>(), units: 0, revenue: 0, hasPrice: false }
    e.tickets.add(s.ticket); e.units += s.qty
    if (s.price !== undefined) { e.revenue += s.price * s.qty; e.hasPrice = true; revenue += s.price * s.qty; anyPrice = true }
    byProduct.set(s.product, e)
    if (s.date) dates.push(s.date)
  }
  dates.sort()
  return {
    tickets: baskets.length, lines: sales.length, units, products: byProduct.size,
    revenue: anyPrice ? revenue : null,
    avgBasket: baskets.reduce((a, b) => a + b.length, 0) / baskets.length,
    from: dates[0], to: dates[dates.length - 1],
    top: [...byProduct.entries()]
      .map(([product, e]) => ({ product, tickets: e.tickets.size, units: e.units, revenue: e.hasPrice ? e.revenue : null }))
      .sort((a, b) => b.tickets - a.tickets || b.units - a.units)
      .slice(0, 10),
  }
}
