/* Verificación financiera del Pack Mesa Completa (Sección 8.4). Funciones puras. */
const PLATOS = { pvp: 14000, costo: 8400 }
const SERV = { pvp: 2000, costo: 1200 }
const TAZAS = { pvp: 2000, costo: 1200 }
const CANASTA = { pvp: 35000, costo: 14000 }

export interface ComboCalc {
  pvpCanastaCombo: number; pvpCombo: number; pvpRegularTotal: number; costoTotal: number
  margenSin: number; margenCon: number; perdidaPP: number; ahorro: number
}

/** @param descPct descuento de la canasta, en porcentaje (ej. 15) */
export function comboCalc(descPct: number): ComboCalc {
  const d = descPct / 100
  const pvpCanastaCombo = CANASTA.pvp * (1 - d)
  const pvpCombo = PLATOS.pvp + SERV.pvp + TAZAS.pvp + pvpCanastaCombo
  const pvpRegularTotal = PLATOS.pvp + SERV.pvp + TAZAS.pvp + CANASTA.pvp
  const costoTotal = PLATOS.costo + SERV.costo + TAZAS.costo + CANASTA.costo
  const margenSin = ((pvpRegularTotal - costoTotal) / pvpRegularTotal) * 100
  const margenCon = ((pvpCombo - costoTotal) / pvpCombo) * 100
  return { pvpCanastaCombo, pvpCombo, pvpRegularTotal, costoTotal, margenSin, margenCon, perdidaPP: margenSin - margenCon, ahorro: pvpRegularTotal - pvpCombo }
}

export const money = (n: number) => '$ ' + Math.round(n).toLocaleString('es-AR')

/* ---------- Calculadora dinámica: cualquier pack de productos del CSV ---------- */
export interface PackItem { name: string; pvp: number; costo: number }
export interface PackRow extends PackItem { pvpCombo: number; discounted: boolean }
export interface PackCalc extends ComboCalc {
  rows: PackRow[]
  margenAbsSin: number            // ganancia en $ por pack vendido sin descuento
  margenAbsCon: number            // ganancia en $ por pack vendido con descuento
  ventaExtraEquilibrio: number | null // aumento de packs vendidos (0,4 = +40%) para igualar la ganancia total; null si no se puede
}

/**
 * Verificación financiera de un pack formado por los productos indicados.
 * @param discounted posiciones (en `items`) de los productos que reciben el descuento
 * @param descPct descuento en porcentaje (ej. 15)
 */
export function packCalc(items: PackItem[], discounted: number[], descPct: number): PackCalc {
  const d = Math.min(100, Math.max(0, descPct)) / 100
  const marked = new Set(discounted)
  const rows: PackRow[] = items.map((it, i) => ({ ...it, discounted: marked.has(i), pvpCombo: marked.has(i) ? it.pvp * (1 - d) : it.pvp }))
  const pvpRegularTotal = rows.reduce((a, r) => a + r.pvp, 0)
  const pvpCombo = rows.reduce((a, r) => a + r.pvpCombo, 0)
  const costoTotal = rows.reduce((a, r) => a + r.costo, 0)
  const margenAbsSin = pvpRegularTotal - costoTotal, margenAbsCon = pvpCombo - costoTotal
  const margenSin = pvpRegularTotal > 0 ? (margenAbsSin / pvpRegularTotal) * 100 : 0
  const margenCon = pvpCombo > 0 ? (margenAbsCon / pvpCombo) * 100 : 0
  const ventaExtraEquilibrio = d === 0 ? 0 : margenAbsCon > 0 && margenAbsSin > 0 ? margenAbsSin / margenAbsCon - 1 : null
  return {
    rows, pvpCanastaCombo: rows.filter((r) => r.discounted).reduce((a, r) => a + r.pvpCombo, 0), pvpCombo, pvpRegularTotal, costoTotal,
    margenSin, margenCon, perdidaPP: margenSin - margenCon, ahorro: pvpRegularTotal - pvpCombo, margenAbsSin, margenAbsCon, ventaExtraEquilibrio,
  }
}
