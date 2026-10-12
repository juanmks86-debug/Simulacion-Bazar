import { P, ST as STOCK, type Promo } from './catalog'

export interface PriceResult { price: number; q: number; label: string; promo: boolean; disc: boolean }

export const COMBO_KEYS = ['platos', 'tazas', 'servilletero'] as const
/** ¿El carrito tiene los tres antecedentes del Pack Mesa? */
export const hasCombo = (cartKeys: readonly string[]) => COMBO_KEYS.every((z) => cartKeys.includes(z))

/**
 * Precio de un producto para un cliente: aplica la promoción activa (2x1 o % off) y el 15% Pack Mesa
 * de la canasta cuando el carrito ya tiene el combo. Función pura: recibe stock y promo.
 */
export function priceOf(
  k: string,
  cartKeys: readonly string[],
  promo: Promo | null,
  stock: Record<string, number> = STOCK,
): PriceResult {
  const p = P[k]
  let price = p.p, q = 1, label = '', usedPromo = false, disc = false
  if (promo && promo.prod === k) {
    usedPromo = true
    if (promo.type === '2x1' && stock[k] >= 2) { q = 2; label = '2x1' }
    else if (promo.type === 'pct') { price *= 1 - (promo.v ?? 0); label = promo.lab }
  }
  if (k === 'canasta' && hasCombo(cartKeys)) {
    price = Math.min(price, p.p * 0.85)
    label = '15% Pack Mesa'
    disc = true
  }
  return { price, q, label, promo: usedPromo, disc }
}
