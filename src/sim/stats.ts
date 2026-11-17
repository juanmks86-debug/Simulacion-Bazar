/* Estadística pura (sin DOM): Evaluación financiera Monte Carlo, 10.000 escenarios. */
import type { Product } from './catalog'
export interface MonteCarloResult {
  // Base simplificada (Sección 14.2): combo activo (4 productos) contra canasta vendida sola
  meanA: number; meanB: number; diffMean: number; winRate: number; tieRate: number; loseRate: number; histDiff: number[]
  // Control con línea base equivalente (Sección 14.2.7): se suman al escenario A los combos orgánicos a precio pleno
  meanAeq: number; diffMeanEq: number; winRateEq: number; loseRateEq: number; histDiffEq: number[]
  // Variante conservadora: el margen del trío de alta rotación no se cuenta como incremental
  meanAcons: number; meanBcons: number; diffMeanCons: number; winRateCons: number; loseRateCons: number
}

/** Diferencias de hasta $1 se consideran empate (p. ej. un mes sin ningún combo vendido). */
const TOL = 1

/** Poisson(λ) por el método de Knuth (λ pequeño, como en este modelo). */
const poisson = (lambda: number, rand: () => number): number => {
  const L = Math.exp(-lambda)
  let k = 0, p = 1
  do { k++; p *= rand() } while (p > L)
  return k - 1
}

/** Normal(media, desvío) por Box–Muller. */
const normal = (mean: number, sd: number, rand: () => number): number => {
  const u1 = Math.max(rand(), 1e-12), u2 = rand()
  return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

/**
 * 10.000 escenarios mensuales con las mismas distribuciones que el notebook del informe (Sección 14.2.1):
 * venta suelta ~ Poisson(2,3), multiplicador de demanda ~ U(3, 6) sobre 1,3 combos orgánicos, descuento ~ U(10%, 25%),
 * ruido de costos N(1; 0,05) en la canasta y N(1; 0,03) en el trío de alta rotación.
 * `rand` se puede inyectar para tests reproducibles. Los resultados varían unos puntos entre corridas (no usa semilla fija).
 */
export function monteCarlo(rand: () => number = Math.random, products?: Product[]): MonteCarloResult {
  const n_sim = 10000;
  const valid = (products ?? []).filter((p) => Number.isFinite(p.p) && p.p > 0 && Number.isFinite(p.costo));
  const ranked = [...valid].sort((a, b) => (b.tickets ?? 0) - (a.tickets ?? 0) || (b.units ?? 0) - (a.units ?? 0));
  const chosen = ranked.slice(0, Math.min(2, ranked.length));
  const pvp_canasta = chosen.length ? chosen[0].p : 35000;
  const costo_canasta = chosen.length ? chosen[0].costo : 14000;
  const pvp_alta = chosen.length > 1 ? chosen[1].p : 0;
  const costo_alta = chosen.length > 1 ? chosen[1].costo : 0;

  let totalA = 0, totalB = 0, totalAeq = 0, totalAcons = 0, totalBcons = 0;
  let win = 0, tie = 0, lose = 0, winEq = 0, loseEq = 0, winCons = 0, loseCons = 0;
  const histDiff: number[] = [];
  const histDiffEq: number[] = [];

  for (let i = 0; i < n_sim; i++) {
    const desc = 0.10 + rand() * 0.15;
    const dSola = poisson(2.3, rand);
    const mult = 3.0 + rand() * 3.0;
    const dCombo = poisson(1.3 * mult, rand);
    const ruidoCanasta = normal(1, 0.05, rand);
    const ruidoAlta = normal(1, 0.03, rand);
    const canib = 0.30 + rand() * 0.20;
    const dOrg = poisson(1.3, rand);

    const residualSola = Math.max(0, dSola - dCombo * canib * 0.3);
    const margenCanastaPleno = pvp_canasta - costo_canasta * ruidoCanasta;
    const margenCanastaDesc = pvp_canasta * (1 - desc) - costo_canasta * ruidoCanasta;
    const margenComboPleno = pvp_alta - costo_alta * ruidoAlta + margenCanastaPleno;
    const margenComboDesc = pvp_alta - costo_alta * ruidoAlta + margenCanastaDesc;

    const mA = dSola * margenCanastaPleno;                              // base simplificada: solo canastas sueltas
    const mB = dCombo * margenComboDesc + residualSola * margenCanastaPleno;
    const mAeq = mA + dOrg * margenComboPleno;                          // línea base equivalente
    const mAcons = mA + dOrg * margenCanastaPleno;                      // variante conservadora
    const mBcons = dCombo * margenCanastaDesc + residualSola * margenCanastaPleno;

    totalA += mA; totalB += mB; totalAeq += mAeq; totalAcons += mAcons; totalBcons += mBcons;

    const diff = mB - mA, diffEq = mB - mAeq, diffCons = mBcons - mAcons;
    if (diff > TOL) win++; else if (diff < -TOL) lose++; else tie++;
    if (diffEq > TOL) winEq++; else if (diffEq < -TOL) loseEq++;
    if (diffCons > TOL) winCons++; else if (diffCons < -TOL) loseCons++;
    if (i < 3000) { histDiff.push(diff); histDiffEq.push(diffEq); }
  }

  const pct = (n: number) => (n / n_sim) * 100;
  const meanA = totalA / n_sim, meanB = totalB / n_sim, meanAeq = totalAeq / n_sim;
  const meanAcons = totalAcons / n_sim, meanBcons = totalBcons / n_sim;
  return {
    meanA, meanB, diffMean: meanB - meanA, winRate: pct(win), tieRate: pct(tie), loseRate: pct(lose), histDiff,
    meanAeq, diffMeanEq: meanB - meanAeq, winRateEq: pct(winEq), loseRateEq: pct(loseEq), histDiffEq,
    meanAcons, meanBcons, diffMeanCons: meanBcons - meanAcons, winRateCons: pct(winCons), loseRateCons: pct(loseCons),
  };
}

export interface HistogramBin { from: number; to: number; mid: number; count: number }

/** Histograma de `numBins` intervalos iguales entre el mínimo y el máximo. */
export function histogram(data: number[], numBins = 50): HistogramBin[] {
  if (!data.length) return []
  let min = Infinity, max = -Infinity
  for (const v of data) { if (v < min) min = v; if (v > max) max = v }
  const width = (max - min) / numBins || 1
  const bins: HistogramBin[] = Array.from({ length: numBins }, (_, i) => ({
    from: min + i * width, to: min + (i + 1) * width, mid: min + (i + 0.5) * width, count: 0,
  }))
  for (const v of data) bins[Math.min(numBins - 1, Math.floor((v - min) / width))].count++
  return bins
}
