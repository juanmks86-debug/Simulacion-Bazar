/* Estadística pura (sin DOM): Evaluación financiera Monte Carlo, 10.000 escenarios. */
export function monteCarlo() {
  const n_sim = 10000;
  const pvp_canasta = 35000, costo_canasta = 14000;
  const pvp_alta = 14000 + 2000 + 2000;
  const costo_alta = 8400 + 1200 + 1200;
  
  let totalMargenA = 0, totalMargenB = 0, winsB = 0;
  const histDiff = [];
  
  for (let i = 0; i < n_sim; i++) {
    const dSola = Math.max(0, Math.round(2.3 + (Math.random() + Math.random() + Math.random() - 1.5) * 2.5));
    const noiseCost = 1 + (Math.random() - 0.5) * 0.08;
    const mA = dSola * (pvp_canasta - costo_canasta * noiseCost);
    totalMargenA += mA;
    
    const desc = 0.10 + Math.random() * 0.15;
    const pvpCanastaDesc = pvp_canasta * (1 - desc);
    const pvpCombo = pvp_alta + pvpCanastaDesc;
    const costoCombo = costo_alta + (costo_canasta * noiseCost);
    
    const mult = 3.0 + Math.random() * 3.0;
    const dCombo = Math.max(0, Math.round(1.3 * mult + (Math.random() + Math.random() - 1.0) * 2.0));
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
