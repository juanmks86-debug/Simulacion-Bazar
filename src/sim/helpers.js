import { PR } from './catalog';
import { getParams } from './params';
import { sim } from './state';

/* Utilidades de formato, horario (hora pico, luz del día) y promoción activa. */
export const fm = n => '$ ' + Math.round(n).toLocaleString('es-AR');
export const conv = () => getParams().sC / 100;
export const basketConv = () => getParams().sB / 100;
export const spd = () => getParams().sS;
export const rn = a => a[Math.floor(Math.random() * a.length)];
export const leaders = () => sim.cust.filter(c => c.role === 'lead');

export const light = h => h < 5.5 || h >= 21 ? 0 : h < 7.5 ? (h - 5.5) / 2 : h < 18 ? 1 : (21 - h) / 3;
export const warm = h => Math.max(0, 1 - Math.abs(h - 18.8) / 1.7) * 0.16 + Math.max(0, 1 - Math.abs(h - 6.8) / 1.2) * 0.1;
export const rush = h => h < 8 || h >= 21 ? 0 : h < 10 ? 0.7 : h < 12 ? 1 : h < 14 ? 2 : h < 17 ? 1 : h < 20 ? 1.9 : 0.6;
export const period = h => h >= 21 || h < 8 ? '🌙 Cerrado' : (h >= 12 && h < 14) ? '🔥 Hora pico (almuerzo)' : (h >= 17 && h < 20) ? '🔥 Hora pico (tarde)' : h < 12 ? 'Mañana' : 'Tarde';
export const hrs = () => (sim.clock / 60) % 24;

export function actPromo() {
  const v = getParams().sP;
  if (v === 'none') return null;
  if (v !== 'auto') return PR[v];
  const h = hrs();
  return h < 8 || h >= 21 ? null : h < 12 ? PR.tazas : h < 16 ? PR.mantel : PR.vela;
}

export function fmt() {
  const m = Math.floor(sim.clock);
  return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}
