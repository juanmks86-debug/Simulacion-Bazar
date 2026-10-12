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
