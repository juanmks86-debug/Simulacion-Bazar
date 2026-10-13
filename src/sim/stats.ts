/* Estadística pura (sin DOM): Evaluación financiera Monte Carlo, 10.000 escenarios. */
export interface MonteCarloResult { meanA: number; meanB: number; diffMean: number; winRate: number; histDiff: number[] }

export interface MonteCarloOptions { multMin?: number; multMax?: number }

/**
 * 10.000 escenarios; `rand` se puede inyectar para tests reproducibles.
 * `multMin`/`multMax` es el rango del multiplicador de demanda del combo (caso base: 3x a 6x).
 */
export function monteCarlo(rand: () => number = Math.random, { multMin = 3, multMax = 6 }: MonteCarloOptions = {}): MonteCarloResult {
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
    
    const mult = multMin + rand() * (multMax - multMin);
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

export interface SensitivityRow { range: string; level: string; meanB: number; winRate: number; isBase: boolean }

const SENSITIVITY_CASES = [
  { range: '1x – 2x', level: 'Promoción débil', min: 1, max: 2 },
  { range: '2x – 3x', level: 'Promoción moderada', min: 2, max: 3 },
  { range: '3x – 6x (Caso Base)', level: 'Promoción activa (usada en informe)', min: 3, max: 6 },
  { range: '6x – 9x', level: 'Promoción muy fuerte', min: 6, max: 9 },
]

/**
 * Tabla de sensibilidad (Sección 14.2.2) calculada con el mismo modelo Monte Carlo.
 * La fila "Caso Base" reutiliza `base` (la misma corrida que muestran los indicadores), así los números coinciden.
 */
export function sensitivityRows(base: MonteCarloResult, rand: () => number = Math.random): SensitivityRow[] {
  return SENSITIVITY_CASES.map((c) => {
    const isBase = c.min === 3 && c.max === 6
    const r = isBase ? base : monteCarlo(rand, { multMin: c.min, multMax: c.max })
    return { range: c.range, level: c.level, meanB: r.meanB, winRate: r.winRate, isBase }
  })
}
