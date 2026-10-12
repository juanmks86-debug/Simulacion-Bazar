import { cam } from './constants';
import { PROD, PROF, ST, CAP } from './catalog';
import { pj } from './gfx';
import { sim } from './state';
import { fm, leaders, hrs, fmt, period, rush, actPromo } from './helpers';
import { reset, spawn, upd, stTxt } from './logic';
import { initRender, bgDraw, draw } from './render';
import { audio } from './audioInstance';
import { simStore } from './store';
import { getParams } from './params';
import { controller } from './controller';

/* Motor de la simulación: orquesta el bucle (lógica + dibujo), publica el estado visible para React
   y recibe órdenes de la interfaz por ./controller. Se inicializa una sola vez desde <Layout/>.
     state.js     estado mutable compartido        logic.js   clientes, cola, empleado, reloj
     render.js    dibujo del canvas 3D             helpers.js formato, horarios, promoción
     gfx.js       primitivas y sprites             particles.js textos flotantes */
export function initBazar() {
const cv = document.getElementById('cv');
initRender(cv);
let stopped = false;
let last = performance.now(), uiT = 0;

function ui() {
  const h = hrs();
  const convRate = sim.S2.visits ? (100 * sim.S2.n / sim.S2.visits).toFixed(1) : '0.0';
  const marginPct = sim.S2.inc > 0 ? (100 * sim.S2.margin / sim.S2.inc).toFixed(1) : '0.0';
  const promo = actPromo();
  simStore.publish({
    clock: fmt(),
    icon: h >= 7.5 && h < 18 ? '☀️' : (h >= 5.5 && h < 7.5) || (h >= 18 && h < 21) ? '🌇' : '🌙',
    period: period(h) + (rush(h) ? ' · x' + rush(h) : ''),
    promoText: promo ? promo.txt : 'ninguna',
    running: sim.run,
    kpi: { revenue: fm(sim.S2.inc), margin: fm(sim.S2.margin || 0), sales: sim.S2.n, combo: sim.S2.combo, basket: sim.S2.can, conversion: convRate, marginPct },
    clients: leaders().slice(0, 7).map(c => {
      const st = stTxt(c);
      return { id: c.id, name: c.name, icon: PROF[c.prof].ic, fam: c.fam || '', profile: PROF[c.prof].nm, color: st[1], status: st[0], cart: c.cart.join(''), total: c.tot ? fm(c.tot) : '—' };
    }),
    log: sim.LOG.slice(0, 16),
    units: { ...(sim.S2.byUnits || {}) }
  });
}

const CAMERAS = {
  general: { zoom: 1.0, ox: 0, oy: 0 },
  combo: { zoom: 1.45, ox: -110, oy: -70 },
  caja: { zoom: 1.6, ox: -180, oy: 160 }
};
function setCamera(name) {
  const c = CAMERAS[name];
  if (!c) return;
  cam.targetZoom = c.zoom; cam.targetOx = c.ox; cam.targetOy = c.oy;
  simStore.publish({ camera: name });
}

cv.addEventListener('click', e => {
  const rect = cv.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) * (cv.width / rect.width);
  const mouseY = (e.clientY - rect.top) * (cv.height / rect.height);
  
  let found = null;
  PROD.forEach(p => {
    const pt = pj(p.x, p.y, 0.8);
    const d = Math.hypot(mouseX - pt[0], mouseY - pt[1]);
    if (d < 45 * cam.zoom) found = p;
  });
  
  simStore.publish({
    inspector: found ? {
      title: found.e + ' ' + found.n, badge: found.rot, high: found.rot === 'Alta',
      pvp: fm(found.p), costo: fm(found.costo), stock: ST[found.id], cap: CAP, rol: found.rol
    } : null
  });
});

function saveScenario() {
  const p = getParams();
  const promo = actPromo();
  simStore.publish({
    scenarios: [...simStore.getSnapshot().scenarios, {
      promo: promo?.txt || 'Sin promo',
      comboProb: p.sC,
      basketProb: p.sB,
      visits: sim.S2.visits || 0,
      sales: sim.S2.n,
      revenue: sim.S2.inc,
      margin: sim.S2.margin || 0,
      combos: sim.S2.combo
    }]
  });
}

function exportCsv() {
  const rows = [
    ['INFORME TECNICO MINERIA DE DATOS - IES N.º 6 PERICO (VERSION REVISADA)'],
    ['Alumno', 'Flores Juan Israel'],
    ['Docente', 'Castro, Abraham'],
    ['Caso', 'Bazar Inteligente - Pack Mesa Completa'],
    ['Dataset', 'Sintetico - 601 registros finales - 188 tickets'],
    [],
    ['Indicador', 'Valor'],
    ['Visitas Totales', sim.S2.visits || 0],
    ['Tickets Cobrados', sim.S2.n],
    ['Tasa de Conversion (%)', (sim.S2.visits ? (100 * sim.S2.n / sim.S2.visits).toFixed(2) : '0')],
    ['Pack Mesa Completa Vendidos', sim.S2.combo],
    ['Canastas con Descuento (15%)', sim.S2.can],
    ['Facturacion Bruta ($)', Math.round(sim.S2.inc)],
    ['Margen Bruto Real ($)', Math.round(sim.S2.margin || 0)],
    ['Margen Porcentual (%)', (sim.S2.inc > 0 ? (100 * sim.S2.margin / sim.S2.inc).toFixed(2) : '0')],
    [],
    ['Producto', 'Tipo Rotacion', 'PVP Real', 'Costo Reposicion', 'Unidades Vendidas']
  ];
  PROD.forEach(p => rows.push([p.n, p.rot, p.p, p.costo, sim.S2.byUnits && sim.S2.byUnits[p.id] || 0]));
  
  const csv = '\ufeff' + rows.map(r => r.map(v => '"' + String(v ?? '').replaceAll('"', '""') + '"').join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'bazar_inteligente_revisado_ies6.csv'; a.click();
  URL.revokeObjectURL(url);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else if (document.exitFullscreen) document.exitFullscreen();
}

function toggleSound() {
  if (!audio.enabled) {
    if (!audio.enable()) return;
  } else {
    audio.disable();
  }
  simStore.publish({ sound: audio.enabled });
}

controller.register({
  isRunning: () => sim.run,
  setRunning: v => { sim.run = v; simStore.publish({ running: v }); },
  reset: () => { reset(); ui(); sim.run = true; simStore.publish({ running: true }); },
  toggleSound,
  setCamera,
  exportCsv,
  toggleFullscreen,
  saveScenario,
  clearLog: () => { sim.LOG = []; simStore.publish({ log: [] }); }
});

function loop(n) {
  if (stopped) return;
  const dt = Math.min(0.05, (n - last) / 1000);
  last = n;
  if (sim.run) upd(dt);
  draw();
  if (n - uiT > 150) { ui(); uiT = n; }
  requestAnimationFrame(loop);
}

bgDraw();
reset();
ui();
spawn();
requestAnimationFrame(loop);

return () => {
  stopped = true;
  audio.close();
  controller.unregister();
};
}
