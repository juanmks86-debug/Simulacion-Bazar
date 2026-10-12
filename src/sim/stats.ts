/* Estadística pura (sin DOM): Evaluación financiera Monte Carlo, 10.000 escenarios. */
export interface MonteCarloResult { meanA: number; meanB: number; diffMean: number; winRate: number; histDiff: number[] }

/** 10.000 escenarios; `rand` se puede inyectar para tests reproducibles. */
export function monteCarlo(rand: () => number = Math.random): MonteCarloResult {
  const n_sim = 10000;
  const pvp_canasta = 35000, costo_canasta = 14000;
  const pvp_alta = 14000 + 2000 + 2000;
  const costo_alta = 8400 + 1200 + 1200;
  
  let totalMargenA = 0, totalMargenB = 0, winsB = 0;
  const histDiff: number[] = [];
  
  for (let i = 0; i < n_sim; i++) {
    const dSola = Math.max(0, Math.round(2.3 + (rand() + rand() + rand() - 1.5) * 2.5));
    const noiseCost = 1 + (rand() - 0.5) * 0.08;
    const mA = dSola * (pvp_canasta - costo_canasta * noiseCost);
    totalMargenA += mA;
    
    const desc = 0.10 + rand() * 0.15;
    const pvpCanastaDesc = pvp_canasta * (1 - desc);
    const pvpCombo = pvp_alta + pvpCanastaDesc;
    const costoCombo = costo_alta + (costo_canasta * noiseCost);
    
    const mult = 3.0 + rand() * 3.0;
    const dCombo = Math.max(0, Math.round(1.3 * mult + (rand() + rand() - 1.0) * 2.0));
    const residualSola = Math.max(0, dSola - Math.round(dCombo * 0.15));
    
    const mB = dCombo * (pvpCombo - costoCombo) + residualSola * (pvp_canasta - costo_canasta * noiseCost);
    totalMargenB += mB;
    
    const diff = mB - mA;
    if (diff > 0) winsB++;
    if (i < 3000) histDiff.push(diff);
  }
  
  const meanA = totalMargenA / n_sim;
  const meanB = totalMargenB / n_sim;
  return { meanA, meanB, diffMean: meanB - meanA, winRate: (winsB / n_sim) * 100, histDiff };
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
