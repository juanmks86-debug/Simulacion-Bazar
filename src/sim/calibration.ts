import { evaluateRule, findProduct } from './apriori'

/** Métricas del Pack Mesa Completa medidas en un dataset real. */
export interface PackMesaMetrics {
  missing: string[]                                   // productos del combo que no aparecen en los datos
  step: ReturnType<typeof evaluateRule> | null        // Platos → Tazas + Servilletero (formar el antecedente)
  pack: ReturnType<typeof evaluateRule> | null        // Platos + Tazas + Servilletero → Canasta (la regla del informe)
}

const KEYWORDS = { platos: 'plato', tazas: 'taza', servilletero: 'servilletero', canasta: 'canasta' } as const

export function packMesaMetrics(baskets: string[][]): PackMesaMetrics {
  const names = [...new Set(baskets.flat())]
  const found = Object.fromEntries(Object.entries(KEYWORDS).map(([k, kw]) => [k, findProduct(names, kw)])) as Record<keyof typeof KEYWORDS, string | null>
  const missing = (Object.keys(found) as (keyof typeof KEYWORDS)[]).filter((k) => !found[k])
  if (missing.length) return { missing: missing.map((k) => KEYWORDS[k]), step: null, pack: null }
  const { platos, tazas, servilletero, canasta } = found as Record<keyof typeof KEYWORDS, string>
  return {
    missing: [],
    step: evaluateRule(baskets, [platos], [tazas, servilletero]),
    pack: evaluateRule(baskets, [platos, tazas, servilletero], [canasta]),
  }
}

/**
 * Parámetros de la simulación calibrados con datos reales:
 *  sC (probabilidad de formar el antecedente) = confianza de Platos → Tazas + Servilletero
 *  sB (probabilidad de sumar la canasta)      = confianza del Pack Mesa → Canasta
 * Se ajustan a los límites de los deslizadores. Si no hay datos suficientes, ese parámetro no se devuelve.
 */
export function calibrationParams(m: PackMesaMetrics): { sC?: number; sB?: number } {
  const out: { sC?: number; sB?: number } = {}
  if (m.step?.confidence != null) out.sC = Math.min(100, Math.max(5, Math.round(m.step.confidence * 1000) / 10))
  if (m.pack?.confidence != null) out.sB = Math.min(100, Math.max(0, Math.round(m.pack.confidence * 100)))
  return out
}
