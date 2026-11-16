import { P } from './catalog'
import { dataStore } from './dataStore'
import { apriori, evaluateRule, rulesFrom, type Rule } from './apriori'
import { toBaskets } from './salesData'
import { norm } from './csv'
import { getParams } from './params'
import { shuffleArray } from './random'
import { actPromo } from './helpers'

export type CustomerKind = 'normal' | 'apurado' | 'curioso' | 'ofertas'
export interface CustomerTraits {
  budget: number
  priceSensitivity: number
  promoAffinity: number
  curiosity: number
  impulseRate: number
  preferences: string[]
  patience: number
}
export interface PlannedItem { k: string; buy: boolean; reason: string; probability: number; rule?: string }
export interface BehaviorModel {
  source: 'csv-apriori' | 'configured-prior'
  synthetic: boolean
  tickets: number
  comboConfidence: number | null
  basketConfidence: number | null
  rules: Rule[]
}

const productByName = new Map<string, string>()
for (const [id, product] of Object.entries(P)) {
  productByName.set(norm(id), id)
  productByName.set(norm(product.n), id)
}

function productId(name: string): string | null {
  const normalized = norm(name)
  const exact = productByName.get(normalized)
  if (exact) return exact
  for (const [label, id] of productByName) {
    if (normalized.includes(label) || label.includes(normalized)) return id
  }
  return null
}

let cachedSales: unknown = null
let cachedSynthetic: boolean | null = null
let cachedModel: BehaviorModel | null = null

/** Aprende reglas de los tickets cargados. Si no hay datos suficientes, utiliza los parámetros del simulador. */
export function getBehaviorModel(): BehaviorModel {
  const data = dataStore.getSnapshot()
  const sales = data.sales
  if (sales === cachedSales && data.synthetic === cachedSynthetic && cachedModel) return cachedModel
  cachedSales = sales
  cachedSynthetic = data.synthetic
  const baskets = toBaskets(sales)
    .map((basket) => basket.map(productId).filter((id): id is string => Boolean(id)))
    .filter((basket) => basket.length > 0)

  if (baskets.length >= 3) {
    const itemsets = apriori(baskets, Math.min(0.02, 1 / baskets.length), 4)
    const rules = rulesFrom(itemsets, baskets.length, 0.05)
      .filter((rule) => rule.antecedent.every((id) => Boolean(P[id])) && rule.consequent.every((id) => Boolean(P[id])))
      .slice(0, 40)
    const step = evaluateRule(baskets, ['platos'], ['tazas', 'servilletero'])
    const pack = evaluateRule(baskets, ['platos', 'tazas', 'servilletero'], ['canasta'])
    cachedModel = {
      source: 'csv-apriori',
      synthetic: data.synthetic,
      tickets: baskets.length,
      comboConfidence: step.antecedentCount >= 3 ? step.confidence : null,
      basketConfidence: pack.antecedentCount >= 3 ? pack.confidence : null,
      rules,
    }
  } else {
    cachedModel = { source: 'configured-prior', synthetic: data.synthetic, tickets: baskets.length, comboConfidence: null, basketConfidence: null, rules: [] }
  }
  return cachedModel
}

/** Combina la confianza observada por Apriori (65%) con el parámetro operativo (35%). */
export function effectiveProbabilities(model = getBehaviorModel()) {
  const params = getParams()
  const blend = (observed: number | null, configured: number) => observed === null
    ? configured / 100
    : Math.max(0, Math.min(1, observed * 0.65 + (configured / 100) * 0.35))
  return {
    combo: blend(model.comboConfidence, params.sC),
    basket: blend(model.basketConfidence, params.sB),
  }
}

export function createCustomerTraits(kind: CustomerKind, random: () => number = Math.random): CustomerTraits {
  const between = (min: number, max: number) => Math.round(min + random() * (max - min))
  const traits: Record<CustomerKind, Omit<CustomerTraits, 'budget'>> = {
    normal: { priceSensitivity: 0.48, promoAffinity: 0.52, curiosity: 0.35, impulseRate: 0.55, preferences: ['platos', 'tazas', 'servilletero', 'canasta'], patience: 22 },
    apurado: { priceSensitivity: 0.35, promoAffinity: 0.25, curiosity: 0.12, impulseRate: 0.28, preferences: ['vasos', 'cubiertos', 'platos'], patience: 9 },
    curioso: { priceSensitivity: 0.42, promoAffinity: 0.45, curiosity: 0.95, impulseRate: 0.68, preferences: ['adorno', 'retrato', 'vela', 'mantel'], patience: 34 },
    ofertas: { priceSensitivity: 0.92, promoAffinity: 0.96, curiosity: 0.42, impulseRate: 0.38, preferences: ['tazas', 'mantel', 'vela'], patience: 26 },
  }
  const budgets: Record<CustomerKind, [number, number]> = {
    normal: [55000, 105000], apurado: [18000, 42000], curioso: [35000, 100000], ofertas: [28000, 78000],
  }
  return { ...traits[kind], budget: between(...budgets[kind]) }
}

function recommendFromApriori(cart: string[], model: BehaviorModel, random: () => number): PlannedItem | null {
  const candidates = model.rules
    .filter((rule) => rule.antecedent.every((id) => cart.includes(id)) && rule.consequent.length === 1)
    .map((rule) => ({ rule, id: rule.consequent[0] }))
    .filter(({ id }) => !cart.includes(id) && Boolean(P[id]))
    .sort((a, b) => b.rule.lift - a.rule.lift || b.rule.confidence - a.rule.confidence)
  const selected = candidates[0]
  if (!selected) return null
  const probability = Math.min(0.7, Math.max(0.08, selected.rule.confidence * Math.min(selected.rule.lift, 2) * 0.35))
  if (random() >= probability) return null
  return {
    k: selected.id,
    buy: random() < 0.82,
    probability,
    reason: 'Sugerencia basada en asociación Apriori',
    rule: `${selected.rule.antecedent.join(' + ')} → ${selected.id} (lift ${selected.rule.lift.toFixed(2)})`,
  }
}

export function buildCustomerPlan(
  kind: CustomerKind,
  traits: CustomerTraits,
  random: () => number = Math.random,
): { items: PlannedItem[]; model: BehaviorModel } {
  const model = getBehaviorModel()
  const probabilities = effectiveProbabilities(model)
  const items: PlannedItem[] = []
  const add = (k: string, buy: boolean, reason: string, probability = buy ? 1 : 0) => {
    if (P[k] && !items.some((item) => item.k === k)) items.push({ k, buy, reason, probability })
  }

  if (kind === 'normal') {
    if (random() < 0.78) {
      add('platos', true, 'Producto ancla del Pack Mesa')
      if (random() < probabilities.combo) {
        add('tazas', true, 'Patrón de compra: acompaña a Platos', probabilities.combo)
        add('servilletero', true, 'Patrón de compra: completa los antecedentes', probabilities.combo)
        if (random() < probabilities.basket) add('canasta', true, 'Consecuente probable del Pack Mesa', probabilities.basket)
      } else if (random() < 0.42) {
        const extra = random() < 0.5 ? 'cubiertos' : 'vasos'
        add(extra, true, 'Alternativa de compra del perfil planificador')
      }
    } else {
      const alternatives = ['vasos', 'cubiertos', 'mantel', 'vela']
      add(alternatives[Math.floor(random() * alternatives.length)], true, 'Compra alternativa del perfil planificador')
    }
  } else if (kind === 'apurado') {
    const quick = ['vasos', 'cubiertos', 'platos', 'tazas']
    const first = quick[Math.floor(random() * quick.length)]
    add(first, true, 'Compra rápida: prioriza productos conocidos')
    if (random() < 0.24) add(quick[Math.floor(random() * quick.length)], true, 'Compra complementaria rápida')
  } else if (kind === 'curioso') {
    const options = [...new Set([...traits.preferences, 'mantel', 'vela', 'retrato', 'adorno', 'vasos', 'canasta', 'cubiertos'])]
    const count = 2 + Math.floor(random() * (1 + traits.curiosity * 2))
    for (const k of shuffleArray(options, random).slice(0, count)) {
      add(k, random() < traits.impulseRate, 'Explora novedades y decide en góndola', traits.impulseRate)
    }
  } else {
    const activePromo = actPromo()
    const promo = activePromo?.prod || ['tazas', 'mantel', 'vela'][Math.floor(random() * 3)]
    add(promo, random() < traits.promoAffinity, 'Busca una promoción y compara el ahorro', traits.promoAffinity)
    const secondary = ['canasta', 'cubiertos', 'retrato'][Math.floor(random() * 3)]
    if (random() < 0.48) add(secondary, random() < traits.impulseRate, 'Evalúa un producto complementario', traits.impulseRate)
  }

  if (kind === 'normal') {
    const activePromo = actPromo()
    if (activePromo && !items.some((item) => item.k === activePromo.prod) && random() < 0.35) {
      add(activePromo.prod, random() < traits.promoAffinity, 'Interés adicional por la promoción vigente', traits.promoAffinity)
    }
  }

  const purchased = items.filter((item) => item.buy).map((item) => item.k)
  const recommendation = recommendFromApriori(purchased, model, random)
  if (recommendation && items.length < 5) items.push(recommendation)
  if (!items.length) add('vasos', true, 'Producto de entrada por defecto')
  return { items, model }
}

export function describeBehaviorSource(model: BehaviorModel): string {
  if (model.source !== 'csv-apriori') return 'Parámetros del simulador (sin CSV suficiente)'
  return model.synthetic
    ? `Apriori sobre ${model.tickets} tickets sintéticos de ejemplo`
    : `Apriori sobre ${model.tickets} tickets del CSV cargado`
}
