import { C, S, ZS, OX, OY, WD, DP, WH, LN, QX, QY, cam } from '../sim/constants.js';
import { P, PROD, PR, PROF, OUT, NAMES, KIDS, CAP, ST, crispData } from '../sim/catalog.js';
import { setCtx, setSize, pj, poly, ell, SH, shelf, LAMPS, PL, plant, counter, door, DR, person } from '../sim/gfx.js';
import { createAudio } from '../sim/audio.js';
import { monteCarlo } from '../sim/stats.js';
import { simStore } from '../sim/store.js';

/* Motor de simulación del Bazar (lógica, bucle de dibujo y eventos). Se inicializa una sola vez desde React.
   El dibujo vive en ../sim/gfx.js, los datos en ../sim/catalog.js y el estado visible se publica en ../sim/store.js */
export function initBazar() {

/* ==========================================================================
   CONFIGURACIÓN Y CATÁLOGO DE PRODUCTOS (PERICO, JUJUY - AGOSTO 2026)
   ========================================================================== */
const $ = id => document.getElementById(id);
window.$ = $;
window.setCrisp = (...a) => setCrisp(...a);
let stopped = false;
const audio = createAudio();
const sfx = audio.sfx;




/* ==========================================================================
   MOTOR GRÁFICO 3D ISOMÉTRICO MEJORADO
   ========================================================================== */
const cv = $('cv'), mainX = cv.getContext('2d');
let x = mainX;
setCtx(mainX); setSize(cv.width, cv.height);
const bg = document.createElement('canvas');
bg.width = cv.width; bg.height = cv.height;


let particles = [];
function addParticle(text, x, y, color = '#ffd54f') {
  particles.push({ text, x, y, alpha: 1.0, vy: -1.2, color });
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.y += p.vy;
    p.alpha -= dt * 0.75;
    if (p.alpha <= 0) particles.splice(i, 1);
  }
}
function drawParticles() {
  particles.forEach(p => {
    x.save();
    x.globalAlpha = Math.max(0, p.alpha);
    x.font = 'bold ' + (13 * cam.zoom) + 'px system-ui';
    x.fillStyle = p.color;
    x.textAlign = 'center';
    x.shadowColor = 'rgba(0,0,0,0.85)';
    x.shadowBlur = 4;
    x.fillText(p.text, p.x, p.y);
    x.restore();
  });
}

function bgDraw() {
  x = bg.getContext('2d'); setCtx(x);
  const w = bg.width, h = bg.height;
  let g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1a1613');
  g.addColorStop(1, '#0c0a08');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  
  poly([[0, DP, 0], [WD, DP, 0], [WD, DP, -0.35], [0, DP, -0.35]], '#665541');
  poly([[WD, 0, 0], [WD, DP, 0], [WD, DP, -0.35], [WD, 0, -0.35]], '#473a2b');
  
  for (let i = 0; i < WD; i++) {
    for (let j = 0; j < DP; j++) {
      poly([[i, j, 0], [i + 1, j, 0], [i + 1, j + 1, 0], [i, j + 1, 0]], (i + j) % 2 ? '#e4d8c1' : '#d5c6ab', 'rgba(110,90,60,0.22)');
    }
  }
  
  poly([[0, 0, 0], [9.2, 0, 0], [9.2, DP, 0], [0, DP, 0]], 'rgba(23,178,106,0.12)');
  poly([[10.8, 0, 0], [WD, 0, 0], [WD, DP, 0], [10.8, DP, 0]], 'rgba(240,130,50,0.12)');
  poly([[2.1, 12.9, 0], [4.3, 12.9, 0], [4.3, 14.4, 0], [2.1, 14.4, 0]], '#2a2a30');
  poly([[19.2, 11.5, 0], [20.6, 11.5, 0], [20.6, 13.5, 0], [19.2, 13.5, 0]], '#2a2a30');
  
  poly([[0, 0, 0], [0, DP, 0], [0, DP, WH], [0, 0, WH]], ['#eae2d1', '#cac0aa']);
  poly([[0, 0, 0], [WD, 0, 0], [WD, 0, WH], [0, 0, WH]], ['#eee7d9', '#d1c6b1']);
  poly([[0, 0, 0.12], [0, DP, 0.12], [0, DP, 1.1], [0, 0, 1.1]], 'rgba(110,80,50,0.22)');
  poly([[0, 0, 0.12], [WD, 0, 0.12], [WD, 0, 1.1], [0, 0, 1.1]], 'rgba(110,80,50,0.22)');
  
  for (let i = 0; i <= 6; i++) {
    const p = pj(0, 1 + i * 2, WH - 0.15);
    const gl = x.createRadialGradient(p[0], p[1] + 30, 2, p[0], p[1] + 30, 70);
    gl.addColorStop(0, 'rgba(255,230,170,0.35)'); gl.addColorStop(1, 'rgba(255,230,170,0)');
    x.fillStyle = gl; x.fillRect(p[0] - 80, p[1] - 40, 160, 200);
    ell(p[0], p[1], 5, 2.5, '#fff3c8');
  }
  for (let i = 0; i <= 9; i++) {
    const p = pj(1 + i * 2, 0, WH - 0.15);
    const gl = x.createRadialGradient(p[0], p[1] + 30, 2, p[0], p[1] + 30, 70);
    gl.addColorStop(0, 'rgba(255,230,170,0.30)'); gl.addColorStop(1, 'rgba(255,230,170,0)');
    x.fillStyle = gl; x.fillRect(p[0] - 80, p[1] - 40, 160, 200);
    ell(p[0], p[1], 5, 2.5, '#fff3c8');
  }
  
  const wt = (sg, ox, oy) => x.setTransform(C * S / 100, sg * 0.5 * S / 100, 0, ZS / 100, ox, oy - WH * ZS);
  x.save(); wt(1, OX, OY);
  x.fillStyle = '#1a1a1d'; x.beginPath(); x.roundRect(860, 55, 420, 150, 10); x.fill();
  x.strokeStyle = '#caa45a'; x.lineWidth = 4; x.stroke();
  x.fillStyle = '#f1e6cf'; x.font = 'italic bold 76px Georgia,serif'; x.textAlign = 'center';
  x.fillText('🏠 Bazar Perico', 1070, 155);
  
  x.fillStyle = '#b4561e'; x.beginPath(); x.roundRect(1440, 30, 540, 110, 10); x.fill();
  x.strokeStyle = '#fff'; x.lineWidth = 3; x.stroke();
  x.fillStyle = '#fff'; x.font = 'bold 40px system-ui';
  x.fillText('ZONA BAJA ROTACIÓN', 1710, 82);
  x.font = '26px system-ui'; x.fillText('(Canasta, Mantel, Adorno)', 1710, 122);
  x.restore();
  
  x.save(); wt(-1, OX - DP * C * S, OY + DP * 0.5 * S);
  x.fillStyle = '#0f6b4a'; x.beginPath(); x.roundRect(480, 30, 700, 110, 10); x.fill();
  x.strokeStyle = '#fff'; x.lineWidth = 3; x.stroke();
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = 'bold 40px system-ui';
  x.fillText('ZONA ALTA ROTACIÓN', 830, 82);
  x.font = '26px system-ui'; x.fillText('★ PACK MESA COMPLETA ★', 830, 122);
  x.restore();
  
  x = mainX; setCtx(mainX);
}


let run = true, cust, queue, serving, S2, LOG, clock, arr, nameI, uid, emp, empCd, last = performance.now(), uiT = 0;
const fm = n => '$ ' + Math.round(n).toLocaleString('es-AR');
const conv = () => $('sC').value / 100;
const basketConv = () => $('sB').value / 100;
const spd = () => +$('sS').value;
const rn = a => a[Math.floor(Math.random() * a.length)];
const leaders = () => cust.filter(c => c.role === 'lead');

const light = h => h < 5.5 || h >= 21 ? 0 : h < 7.5 ? (h - 5.5) / 2 : h < 18 ? 1 : (21 - h) / 3;
const warm = h => Math.max(0, 1 - Math.abs(h - 18.8) / 1.7) * 0.16 + Math.max(0, 1 - Math.abs(h - 6.8) / 1.2) * 0.1;
const rush = h => h < 8 || h >= 21 ? 0 : h < 10 ? 0.7 : h < 12 ? 1 : h < 14 ? 2 : h < 17 ? 1 : h < 20 ? 1.9 : 0.6;
const period = h => h >= 21 || h < 8 ? '🌙 Cerrado' : (h >= 12 && h < 14) ? '🔥 Hora pico (almuerzo)' : (h >= 17 && h < 20) ? '🔥 Hora pico (tarde)' : h < 12 ? 'Mañana' : 'Tarde';
const hrs = () => (clock / 60) % 24;

function actPromo() {
  const v = $('sP').value;
  if (v === 'none') return null;
  if (v !== 'auto') return PR[v];
  const h = hrs();
  return h < 8 || h >= 21 ? null : h < 12 ? PR.tazas : h < 16 ? PR.mantel : PR.vela;
}

function fmt() {
  const m = Math.floor(clock);
  return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

function reset() {
  cust = []; queue = []; serving = null; emp = null; empCd = 8; uid = 0;
  PROD.forEach(p => ST[p.id] = CAP);
  S2 = {
    n: 0, visits: 0, combo: 0, can: 0, inc: 0, cost: 0, margin: 0, promo: 0,
    nobuy: 0, aband: 0, repo: 0, byUnits: {}
  };
  LOG = []; clock = 690; arr = 0; nameI = 0; particles = [];
  ui();
}

function route(f, t) {
  const a = [];
  if (Math.abs(f.y - LN) > 0.01) a.push({ x: f.x, y: LN });
  a.push({ x: t.x, y: LN }, { x: t.x, y: t.y });
  return a;
}


function planFor(prof) {
  const a = actPromo(), it = [], add = (k, b) => it.push({ k, buy: b !== false });
  if (prof === 'apurado') add(rn(['platos', 'vasos', 'tazas', 'servilletero', 'cubiertos', 'mantel', 'vela']));
  else if (prof === 'curioso') {
    const ks = Object.keys(P).sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3));
    ks.forEach(k => add(k, Math.random() < 0.35));
  } else if (prof === 'ofertas') {
    if (a) add(a.prod); else add(rn(['mantel', 'vela', 'adorno']), Math.random() < 0.5);
    if (Math.random() < 0.5) add(rn(['canasta', 'retrato', 'cubiertos']), false);
  } else {
    if (Math.random() < 0.75) {
      if (Math.random() < 0.65) {
        add('platos');
        if (Math.random() < conv()) {
          add('tazas');
          add('servilletero');
          if (Math.random() < basketConv()) add('canasta');
        } else if (Math.random() < 0.5) add('cubiertos');
      } else {
        add(rn(['vasos', 'cubiertos', 'tazas', 'servilletero']));
      }
    } else {
      add(rn(['mantel', 'vela', 'retrato', 'adorno', 'canasta']));
    }
    if (a && Math.random() < 0.35 && !it.some(i => i.k === a.prod)) add(a.prod);
    if (Math.random() < 0.12) it[it.length - 1].buy = false;
  }
  return it}

function spawn() {
  if (leaders().length >= 8) return;
  S2.visits = (S2.visits || 0) + 1;
  const prof = rn(['normal', 'normal', 'normal', 'normal', 'apurado', 'curioso', 'ofertas']);
  const nm = NAMES[nameI % NAMES.length], o = Object.assign({}, OUT[nameI % OUT.length]);
  nameI++;
  const c = {
    id: ++uid, name: nm, prof, o, role: 'lead', k: 1, x: 3.1, y: 14.9,
    items: planFor(prof), i: 0, cart: [], keys: [], dots: [], tot: 0, totCost: 0,
    st: 'walk', t: 0, ph: 0, vx: 0, vy: -1, walk: false, pat: PROF[prof].pat,
    chatT: 0, chatted: false, paid: false, promoUsed: false, isCombo: false, spf: PROF[prof].sp
  };
  c.path = route(c, P[c.items[0].k]);
  cust.push(c);
  sfx.door();
  
  const r = Math.random();
  if (r < 0.25) {
    const kid = r >= 0.12, oo = Object.assign({}, OUT[(nameI + 3) % OUT.length]);
    cust.push({
      role: 'follow', leader: c, kid, name: kid ? rn(KIDS) : NAMES[(nameI + 5) % NAMES.length],
      o: oo, k: kid ? 0.68 : 1, off: kid ? { x: 0.65, y: 0.3 } : { x: 0.7, y: 0 },
      x: 3.8, y: 15.2, ph: 0, vx: 0, vy: -1, walk: false, st: 'follow'
    });
    c.fam = kid ? '👨‍👧' : '👫';
  }
}

function add(m, v) {
  LOG.unshift({ t: fmt(), m, v });
  LOG.length = Math.min(LOG.length, 35);
}

function step(c, dt, m) {
  let s = 2.4 * spd() * (c.spf || 1) * (m || 1) * dt;
  c.walk = false;
  while (s > 0 && c.path.length) {
    const p = c.path[0], dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy);
    c.walk = true;
    if (d > 1e-6) { c.vx = dx; c.vy = dy; }
    if (d <= s) { c.x = p.x; c.y = p.y; s -= d; c.path.shift(); }
    else { c.x += dx / d * s; c.y += dy / d * s; s = 0; }
  }
  if (c.walk) c.ph += dt * 9 * spd() * (c.spf || 1);
}

function priceOf(c, k) {
  const p = P[k], a = actPromo();
  let price = p.p, q = 1, label = '', promo = false, disc = false;
  
  if (a && a.prod === k) {
    promo = true;
    if (a.type === '2x1' && ST[k] >= 2) { q = 2; label = '2x1'; }
    else if (a.type === 'pct') { price *= (1 - a.v); label = a.lab; }
  }
  
  if (k === 'canasta' && ['platos', 'tazas', 'servilletero'].every(z => c.keys.includes(z))) {
    price = Math.min(price, p.p * 0.85);
    label = '15% Pack Mesa';
    disc = true;
    c.isCombo = true;
  }
  return { price, q, label, promo, disc };
}

function takeItem(c, it) {
  const p = P[it.k];
  if (!it.buy) { add(c.name + ' miró ' + p.n + ' y lo dejó', '—'); return; }
  if (ST[it.k] <= 0) { add(c.name + ' no encontró ' + p.n + ' (agotado)', '—'); return; }
  
  const pr = priceOf(c, it.k);
  ST[it.k] -= pr.q;
  
  const itemCost = p.costo * pr.q;
  c.totCost = (c.totCost || 0) + itemCost;
  c.tot += pr.price;
  
  for (let q = 0; q < pr.q; q++) {
    c.cart.push(p.e);
    c.keys.push(it.k);
    c.dots.push(p.c);
  }
  if (pr.promo) c.promoUsed = true;
  if (pr.disc) {
    S2.can++;
    const pt = pj(c.x, c.y, 0);
    addParticle('🧺 PACK MESA (-15%)', pt[0], pt[1] - 80 * cam.zoom, '#ffd54f');
  }
  
  add(c.name + ' tomó ' + (pr.q > 1 ? '2× ' : '') + p.n + (pr.label ? ' (' + pr.label + ')' : ''), fm(pr.price));
  sfx.pick();
}

function leave(c, why) {
  c.st = 'exit';
  c.path = route(c, { x: 20.9, y: LN });
  if (why) add(c.name + ' ' + why, '—');
}

function updEmp(dt) {
  if (!emp) {
    empCd -= dt * spd();
    if (empCd <= 0) {
      const low = PROD.filter(p => ST[p.id] <= 1).sort((a, b) => ST[a.id] - ST[b.id])[0];
      if (low) {
        emp = { x: 3.1, y: 14.9, st: 'in', p: low, t: 0, ph: 0, vx: 0, vy: -1, walk: false, k: 1 };
        emp.path = route(emp, { x: low.x, y: low.y });
        add('Empleado va a reponer ' + low.n, '—');
        sfx.door();
      } else empCd = 3;
    }
    return;
  }
  if (emp.st === 'in') {
    step(emp, dt, 1.15);
    if (!emp.path.length) { emp.st = 'work'; emp.t = 2.6; }
  } else if (emp.st === 'work') {
    emp.walk = false;
    emp.t -= dt * spd();
    if (emp.t <= 0) {
      ST[emp.p.id] = CAP;
      S2.repo++;
      add('Empleado repuso ' + emp.p.n, '—');
      sfx.bell();
      emp.st = 'out';
      emp.path = route(emp, { x: 20.9, y: LN });
    }
  } else {
    step(emp, dt, 1.15);
    if (!emp.path.length) { emp = null; empCd = 10; }
  }
}

function upd(dt) {
  const h = hrs(), rs = rush(h);
  if (rs > 0) {
    arr -= dt * spd();
    if (arr <= 0) {
      spawn();
      arr = -Math.log(1 - Math.random()) / (($('sL').value / 20) * rs);
    }
  } else arr = 0;
  
  updEmp(dt);
  updateParticles(dt);
  
  cam.zoom += (cam.targetZoom - cam.zoom) * 0.08;
  cam.ox += (cam.targetOx - cam.ox) * 0.08;
  cam.oy += (cam.targetOy - cam.oy) * 0.08;
  
  const ls = leaders();
  for (let i = 0; i < ls.length; i++) {
    const a = ls[i];
    if (a.chatted || a.st !== 'walk' || !a.path.length) continue;
    for (let j = i + 1; j < ls.length; j++) {
      const b = ls[j];
      if (b.chatted || b.st !== 'walk' || !b.path.length) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) < 1.5 && Math.random() < dt * 1.5) {
        a.chatted = b.chatted = true;
        a.chatT = b.chatT = 2.5 + Math.random() * 1.5;
        a.bub = '💬'; b.bub = rn(['😄', '💬', '🙂']);
        add(a.name + ' y ' + b.name + ' se pararon a charlar', '—');
        break;
      }
    }
  }
  
  for (const c of ls) {
    if (c.chatT > 0) { c.chatT -= dt * spd(); c.walk = false; continue; }
    if (c.st === 'walk') {
      step(c, dt);
      if (!c.path.length) { c.st = 'look'; c.t = PROF[c.prof].dw + Math.random() * 0.5; }
    } else if (c.st === 'look') {
      c.walk = false;
      c.t -= dt * spd();
      if (c.t <= 0) {
        takeItem(c, c.items[c.i]);
        c.i++;
        if (c.i < c.items.length) { c.st = 'walk'; c.path = route(c, P[c.items[c.i].k]); }
        else if (!c.cart.length) { S2.nobuy++; leave(c, 'salió sin comprar'); }
        else { c.st = 'toq'; queue.push(c); c.path = route(c, { x: QX, y: QY + (queue.length - 1) * 0.85 }); }
      }
    } else if (c.st === 'toq' || c.st === 'queue') {
      c.pat -= dt * spd() * (1 + 0.45 * Math.max(0, queue.length - 2));
      if (c.pat <= 0 && serving !== c) {
        queue.splice(queue.indexOf(c), 1);
        c.keys.forEach(k => ST[k] = Math.min(CAP, ST[k] + 1));
        c.cart = []; c.dots = []; c.tot = 0;
        S2.aband++;
        leave(c, 'se fue de la cola (demasiada espera)');
        continue;
      }
      if (c.st === 'toq') { step(c, dt); if (!c.path.length) c.st = 'queue'; }
      else {
        const i = queue.indexOf(c), ty = QY + i * 0.85;
        c.walk = false;
        if (c.y > ty + 0.01) {
          c.y = Math.max(ty, c.y - 1.8 * spd() * dt);
          c.walk = true; c.vx = 0; c.vy = -1; c.ph += dt * 9 * spd();
        }
        if (i === 0 && !serving && Math.abs(c.y - QY) < 0.05) {
          serving = c; c.st = 'pay'; c.t = 1.7; c.walk = false;
          add(c.name + ' va a caja', fm(c.tot));
        }
      }
    } else if (c.st === 'pay') {
      c.t -= dt * spd();
      if (c.t <= 0) {
        queue.shift();
        serving = null;
        S2.n++;
        S2.inc += c.tot;
        S2.cost += c.totCost;
        const realMargin = c.tot - c.totCost;
        S2.margin += realMargin;
        
        c.keys.forEach(k => S2.byUnits[k] = (S2.byUnits[k] || 0) + 1);
        if (['platos', 'tazas', 'servilletero'].every(z => c.keys.includes(z))) {
          S2.combo++;
        }
        if (c.promoUsed) S2.promo++;
        c.paid = true;
        sfx.cash();
        
        const pt = pj(10.5, 2.0, 1.2);
        addParticle('+$' + Math.round(c.tot), pt[0], pt[1] - 20 * cam.zoom, '#72e09e');
        leave(c);
      }
    } else if (c.st === 'exit') {
      step(c, dt);
      if (!c.path.length) {
        c.st = 'gone';
        add(c.name + ' salió del local', c.tot ? fm(c.tot) : '—');
        sfx.door();
      }
    }
  }
  
  for (const f of cust.filter(c => c.role === 'follow')) {
    const l = f.leader, tx = l.x + f.off.x, ty = l.y + f.off.y, dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy), m = Math.min(d, 3.4 * spd() * dt);
    f.walk = d > 0.12;
    if (d > 1e-3) {
      f.x += dx / d * m; f.y += dy / d * m;
      if (d > 0.12) { f.vx = dx; f.vy = dy; }
    }
    if (f.walk) f.ph += dt * 9 * spd();
  }
  
  cust = cust.filter(c => c.role === 'lead' ? c.st !== 'gone' : c.leader.st !== 'gone');
  const fast = rs === 0 && !leaders().length && !emp ? 8 : 1;
  clock += dt * spd() * 2 * fast;
}

function sorted(o) {
  const n = o.length, beh = (A, B) => A.x1 <= B.x0 + 0.001 || A.y1 <= B.y0 + 0.001, done = Array(n).fill(false), out = [];
  for (let k = 0; k < n; k++) {
    let best = -1, bk = 1e9, any = -1, ak = 1e9;
    for (let i = 0; i < n; i++) {
      if (done[i]) continue;
      const key = o[i].x0 + o[i].x1 + o[i].y0 + o[i].y1;
      if (key < ak) { ak = key; any = i; }
      let ok = true;
      for (let j = 0; j < n; j++) {
        if (j === i || done[j]) continue;
        if (beh(o[j], o[i]) && !beh(o[i], o[j])) { ok = false; break; }
      }
      if (ok && key < bk) { bk = key; best = i; }
    }
    if (best < 0) best = any;
    done[best] = true;
    out.push(o[best]);
  }
  return out;
}

function hull(pts) {
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

function shadow(x0, y0, x1, y1, h, sx, sy, al) {
  const dx = sx * h, dy = sy * h;
  poly(hull([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0 + dx, y0 + dy], [x1 + dx, y0 + dy], [x1 + dx, y1 + dy], [x0 + dx, y1 + dy]]).map(p => [p[0], p[1], 0]), 'rgba(15,22,16,' + al + ')');
}

function stTxt(c) {
  const z = c.x < 9.5 ? 'alta' : 'baja', pn = (P[(c.items[c.i] || {}).k] || {}).n || '';
  if (c.chatT > 0) return ['Charlando con otro cliente', '#e0a93a'];
  return ({
    walk: ['Hacia ' + pn, '#7c4dff'],
    look: ['En zona ' + z + ' rotación · ' + pn, '#17b26a'],
    toq: ['Yendo a la caja', '#2e7be0'],
    queue: ['En cola para pagar', '#2e7be0'],
    pay: ['Pagando en caja', '#2e7be0'],
    exit: [c.paid ? 'Saliendo (compra exitosa)' : 'Se va sin comprar', '#f5b82e']
  })[c.st] || ['', '#888'];
}

function draw() {
  x = mainX; setCtx(mainX);
  x.drawImage(bg, 0, 0);
  
  const h = hrs(), L = light(h), d = 0.62 * (1 - L);
  if (L > 0) {
    const t = Math.min(1, Math.max(0, (h - 7) / 11)), sx = (0.5 - t) * 1.1, sy = 0.28, al = 0.2 * L;
    SH.forEach(s => shadow(s.x0, s.y0, s.x1, s.y1, s.h, sx, sy, al));
    shadow(8.6, 0.9, 12.6, 2.0, 1.05, sx, sy, al);
    PL.forEach(p => shadow(p[0] - 0.25, p[1] - 0.25, p[0] + 0.25, p[1] + 0.25, 1.2, sx, sy, al * 0.8));
  }
  
  const spotP = pj(5.5, 7.0, 0);
  const spotG = x.createRadialGradient(spotP[0], spotP[1], 10, spotP[0], spotP[1], 170 * cam.zoom);
  spotG.addColorStop(0, 'rgba(216, 182, 117, 0.16)');
  spotG.addColorStop(1, 'rgba(216, 182, 117, 0)');
  x.fillStyle = spotG;
  x.beginPath();
  x.ellipse(spotP[0], spotP[1], 170 * cam.zoom, 85 * cam.zoom, 0, 0, Math.PI * 2);
  x.fill();
  
  const ob = [];
  SH.forEach(s => ob.push({ x0: s.x0, y0: s.y0, x1: s.x1, y1: s.y1, draw: () => shelf(s) }));
  ob.push({ x0: 8.6, y0: 0.9, x1: 12.6, y1: 2.0, draw: counter });
  DR.forEach(r => ob.push({ x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, draw: () => door(r.x0, r.y0, r.x1, r.y1, r.g) }));
  PL.forEach(p => ob.push({ x0: p[0] - 0.3, y0: p[1] - 0.3, x1: p[0] + 0.3, y1: p[1] + 0.3, draw: () => plant(p[0], p[1], p[2]) }));
  ob.push({ x0: 10.2, y0: 0.2, x1: 10.8, y1: 0.7, draw: () => person(10.5, 0.45, { sh: '#f1f1f1', pa: '#202228', sk: '#e8bf9a', hair: '#222', long: 0, apron: '#1f1f23', face: true, ph: 0 }) });
  
  cust.forEach(c => {
    const lead = c.role === 'lead', o = Object.assign({}, c.o, { k: c.k, walk: c.walk, ph: c.ph, face: (c.vx + c.vy) >= 0 && c.st !== 'look' });
    if (lead) {
      o.arm = c.st === 'look' && c.t < 0.9 && c.t > 0.3;
      if (c.paid) o.bag = c.o.bag;
      else if (c.st !== 'exit') o.basket = c.dots;
    }
    ob.push({ x0: c.x - 0.3, y0: c.y - 0.3, x1: c.x + 0.3, y1: c.y + 0.3, draw: () => person(c.x, c.y, o) });
  });
  
  if (emp) {
    const e = emp, o = {
      sh: '#2d6a4f', pa: '#222831', sk: '#e0b08a', hair: '#222', long: 0, apron: '#e8c33a',
      walk: e.walk, ph: e.ph, face: (e.vx + e.vy) >= 0 && e.st !== 'work',
      box: e.st !== 'work', arm: e.st === 'work' && Math.sin(performance.now() / 180) > 0
    };
    ob.push({ x0: e.x - 0.3, y0: e.y - 0.3, x1: e.x + 0.3, y1: e.y + 0.3, draw: () => person(e.x, e.y, o) });
  }
  
  sorted(ob).forEach(o => o.draw());
  
  if (d > 0.01) { x.fillStyle = 'rgba(8,14,44,' + d + ')'; x.fillRect(0, 0, cv.width, cv.height); }
  const w = warm(h);
  if (w > 0.01) { x.fillStyle = 'rgba(255,120,40,' + w + ')'; x.fillRect(0, 0, cv.width, cv.height); }
  if (d > 0.04) {
    const I = d / 0.62;
    x.save(); x.globalCompositeOperation = 'lighter';
    LAMPS.forEach(l => {
      const p = pj(...l), g = x.createRadialGradient(p[0], p[1] + 50 * cam.zoom, 4, p[0], p[1] + 50 * cam.zoom, 125 * cam.zoom);
      g.addColorStop(0, 'rgba(255,214,140,' + (0.42 * I) + ')');
      g.addColorStop(1, 'rgba(255,214,140,0)');
      x.fillStyle = g;
      x.fillRect(p[0] - 130 * cam.zoom, p[1] - 80 * cam.zoom, 260 * cam.zoom, 260 * cam.zoom);
    });
    x.restore();
  }
  
  function pill(txt, px, py, col, fs) {
    x.font = 'bold ' + ((fs || 12) * cam.zoom) + 'px system-ui';
    const wt = x.measureText(txt).width + 16 * cam.zoom;
    x.fillStyle = col;
    x.beginPath(); x.roundRect(px - wt / 2, py - 11 * cam.zoom, wt, 22 * cam.zoom, 6); x.fill();
    x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = 1 * cam.zoom; x.stroke();
    x.fillStyle = '#fff'; x.textAlign = 'center';
    x.fillText(txt, px, py + 4 * cam.zoom);
  }
  
  const act = actPromo();
  PROD.forEach(p => {
    const sh = SH[p.s], X = sh.face === 'x', q = X ? pj(sh.x1 - 0.3, p.y, sh.h + 0.35) : pj(p.x, sh.y1 - 0.3, sh.h + 0.35);
    if (ST[p.id] <= 0) pill('AGOTADO', q[0], q[1] - (act && act.prod === p.id ? 24 * cam.zoom : 0), '#b3261e', 11);
    else if (act && act.prod === p.id) pill('🏷️ ' + act.lab, q[0], q[1], '#d99a12', 12);
  });
  
  cust.forEach(c => {
    const [a, b] = pj(c.x, c.y, 0), K = c.k * cam.zoom, ty = b - 96 * K - (c.k < 1 ? 4 : 0), lead = c.role === 'lead';
    x.font = 'bold ' + (11.5 * cam.zoom) + 'px system-ui';
    const nm = lead ? c.name + ' ' + PROF[c.prof].ic + (c.fam || '') : c.name;
    const wt = x.measureText(nm).width + 26 * cam.zoom;
    x.fillStyle = lead ? 'rgba(12,22,34,0.92)' : 'rgba(40,40,60,0.85)';
    x.beginPath(); x.roundRect(a - wt / 2, ty, wt, 20 * cam.zoom, 6); x.fill();
    if (lead) {
      const s = stTxt(c);
      ell(a - wt / 2 + 10 * cam.zoom, ty + 10 * cam.zoom, 4, 4, s[1]);
    }
    x.fillStyle = '#fff'; x.textAlign = 'left';
    x.fillText(nm, a - wt / 2 + (lead ? 18 : 8) * cam.zoom, ty + 14 * cam.zoom);
    
    if (c.chatT > 0 && c.bub) {
      x.font = (19 * cam.zoom) + 'px serif'; x.textAlign = 'center'; x.fillStyle = '#fff';
      x.beginPath(); x.roundRect(a - 16 * cam.zoom, ty - 32 * cam.zoom, 32 * cam.zoom, 26 * cam.zoom, 8); x.fill();
      x.fillStyle = '#000'; x.fillText(c.bub, a, ty - 12 * cam.zoom);
    } else if (lead && c.cart.length && c.st !== 'exit') {
      x.font = (14 * cam.zoom) + 'px serif'; x.textAlign = 'center';
      x.fillText(c.cart.slice(-4).join(''), a, ty - 5 * cam.zoom);
    }
  });
  
  if (emp) { const [a, b] = pj(emp.x, emp.y, 0); pill('Empleado 📦', a, b - 100 * cam.zoom, '#2d6a4f', 11); }
  let q = pj(3.2, 14, 3.3); pill('ENTRADA ⬇', q[0], q[1], '#0f7a52', 13);
  q = pj(20, 12.5, 3.3); pill('SALIDA ↔', q[0], q[1], '#2e7be0', 13);
  q = pj(10.6, 0.6, 3.55); pill('CAJA', q[0], q[1], '#222831', 13);
  
  drawParticles();
  
  const v = x.createRadialGradient(cv.width * 0.5, cv.height * 0.5, 320, cv.width * 0.5, cv.height * 0.5, 800);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.38)');
  x.fillStyle = v; x.fillRect(0, 0, cv.width, cv.height);
}

function ui() {
  const h = hrs();
  $('clk').textContent = fmt();
  $('ico').textContent = h >= 7.5 && h < 18 ? '☀️' : (h >= 5.5 && h < 7.5) || (h >= 18 && h < 21) ? '🌇' : '🌙';
  $('per').textContent = period(h) + (rush(h) ? ' · x' + rush(h) : '');
  const a = actPromo();
  $('prm').textContent = a ? a.txt : 'ninguna';
  
  const convRate = S2.visits ? (100 * S2.n / S2.visits).toFixed(1) : '0.0';
  const marginPct = S2.inc > 0 ? (100 * S2.margin / S2.inc).toFixed(1) : '0.0';
  simStore.publish({
    kpi: { revenue: fm(S2.inc), margin: fm(S2.margin || 0), sales: S2.n, combo: S2.combo, basket: S2.can, conversion: convRate, marginPct },
    clients: leaders().slice(0, 7).map(c => {
      const st = stTxt(c);
      return { id: c.id, name: c.name, icon: PROF[c.prof].ic, fam: c.fam || '', profile: PROF[c.prof].nm, color: st[1], status: st[0], cart: c.cart.join(''), total: c.tot ? fm(c.tot) : '—' };
    }),
    log: LOG.slice(0, 16),
    units: { ...(S2.byUnits || {}) }
  });
  
  $('vL').textContent = $('sL').value;
  $('vC').textContent = (+ $('sC').value).toFixed(1);
  $('vB').textContent = $('sB').value;
  $('vS').textContent = spd().toFixed(1);
}

function runMonteCarlo() {
  const r = monteCarlo();
  $('mcMeanA').textContent = fm(r.meanA);
  $('mcMeanB').textContent = fm(r.meanB);
  $('mcDiff').textContent = '+' + fm(r.diffMean);
  $('mcWin').textContent = r.winRate.toFixed(1) + '%';
  drawMCHistogram(r.histDiff, r.diffMean);
}

function drawMCHistogram(data, meanVal) {
  const c = $('mcCanvas'), cx = c.getContext('2d');
  const w = c.width, h = c.height;
  cx.clearRect(0, 0, w, h);
  
  cx.fillStyle = '#0c140f'; cx.fillRect(0, 0, w, h);
  cx.strokeStyle = '#233628'; cx.lineWidth = 1;
  for (let y = 30; y < h; y += 40) {
    cx.beginPath(); cx.moveTo(0, y); cx.lineTo(w, y); cx.stroke();
  }
  
  const numBins = 50;
  const min = Math.min(...data), max = Math.max(...data);
  const binWidth = (max - min) / numBins;
  const bins = Array(numBins).fill(0);
  data.forEach(v => {
    const idx = Math.min(numBins - 1, Math.floor((v - min) / binWidth));
    bins[idx]++;
  });
  const maxFreq = Math.max(...bins);
  
  const colW = (w - 80) / numBins;
  bins.forEach((freq, i) => {
    const barH = (freq / maxFreq) * (h - 60);
    const xPos = 40 + i * colW;
    const yPos = h - 25 - barH;
    const valAtX = min + i * binWidth;
    
    cx.fillStyle = valAtX >= 0 ? '#3ea05d' : '#cf483d';
    cx.fillRect(xPos, yPos, colW - 1, barH);
  });
  
  const zeroX = 40 + ((0 - min) / (max - min)) * (w - 80);
  if (zeroX >= 40 && zeroX <= w - 40) {
    cx.strokeStyle = '#cf483d'; cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(zeroX, 15); cx.lineTo(zeroX, h - 25); cx.stroke();
    cx.fillStyle = '#cf483d'; cx.font = '10px system-ui'; cx.fillText('Equilibrio ($0)', zeroX + 4, 25);
  }
  
  const meanX = 40 + ((meanVal - min) / (max - min)) * (w - 80);
  cx.strokeStyle = '#d8b675'; cx.lineWidth = 2.5; cx.setLineDash([4, 4]);
  cx.beginPath(); cx.moveTo(meanX, 15); cx.lineTo(meanX, h - 25); cx.stroke();
  cx.setLineDash([]);
  cx.fillStyle = '#d8b675'; cx.font = 'bold 11px system-ui';
  cx.fillText('Media: +' + fm(meanVal), meanX + 6, 40);
}

function updateComboCalculator() {
  const descPct = +$('calcDescRange').value / 100;
  $('calcDescVal').textContent = $('calcDescRange').value;
  
  const pvpPlatos = 14000, costoPlatos = 8400;
  const pvpServ = 2000, costoServ = 1200;
  const pvpTazas = 2000, costoTazas = 1200;
  const pvpCanastaReg = 35000, costoCanasta = 14000;
  
  const pvpCanastaCombo = pvpCanastaReg * (1 - descPct);
  const pvpCombo = pvpPlatos + pvpServ + pvpTazas + pvpCanastaCombo;
  const pvpRegularTotal = pvpPlatos + pvpServ + pvpTazas + pvpCanastaReg;
  const costoTotal = costoPlatos + costoServ + costoTazas + costoCanasta;
  
  const margenSin = ((pvpRegularTotal - costoTotal) / pvpRegularTotal) * 100;
  const margenCon = ((pvpCombo - costoTotal) / pvpCombo) * 100;
  const perdidaPP = (margenSin - margenCon).toFixed(1);
  const ahorro = pvpRegularTotal - pvpCombo;
  
  $('calcCanastaPVP').textContent = fm(pvpCanastaCombo);
  $('calcPvpReg').textContent = fm(pvpRegularTotal);
  $('calcPvpCombo').textContent = fm(pvpCombo);
  $('calcCostoTot').textContent = fm(costoTotal);
  $('calcAhorro').textContent = fm(ahorro);
  $('calcMargenSin').textContent = margenSin.toFixed(1) + '%';
  $('calcMargenCon').textContent = margenCon.toFixed(1) + '%';
  
  $('calcConclusion').innerHTML = `Caída de margen bruto porcentual: <b style="color:var(--gold)">-${perdidaPP} puntos porcentuales (pp)</b>. Margen resultante: <b style="color:#60c572">${margenCon.toFixed(1)}%</b>. Ahorro para el cliente: <b>${fm(ahorro)}</b>.`;
}

function setCrisp(idx) {
  document.querySelectorAll('.crisp-step').forEach((el, i) => el.classList.toggle('active', i === idx));
  $('crispTitle').textContent = crispData[idx].t;
  $('crispText').textContent = crispData[idx].d;
}

$('camGeneral').onclick = () => {
  cam.targetZoom = 1.0; cam.targetOx = 0; cam.targetOy = 0;
  setCamActive('camGeneral');
};
$('camCombo').onclick = () => {
  cam.targetZoom = 1.45; cam.targetOx = -110; cam.targetOy = -70;
  setCamActive('camCombo');
};
$('camCaja').onclick = () => {
  cam.targetZoom = 1.6; cam.targetOx = -180; cam.targetOy = 160;
  setCamActive('camCaja');
};

function setCamActive(id) {
  ['camGeneral', 'camCombo', 'camCaja'].forEach(b => $(b).classList.toggle('active', b === id));
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
  
  const insp = $('shelfInspector');
  if (found) {
    $('inspTitle').textContent = found.e + ' ' + found.n;
    $('inspBadge').textContent = found.rot;
    $('inspBadge').className = 'tag-rot ' + (found.rot === 'Alta' ? 'tag-high' : 'tag-low');
    $('inspDetails').innerHTML = `
      <b>PVP Real:</b> ${fm(found.p)}<br>
      <b>Costo Deducido:</b> ${fm(found.costo)}<br>
      <b>Stock en Góndola:</b> ${ST[found.id]} / ${CAP} unidades<br>
      <b>Rol Estratégico:</b> ${found.rol}
    `;
    insp.style.display = 'block';
  } else {
    insp.style.display = 'none';
  }
});

let savedScenarios = [];
$('saveScenario').onclick = () => {
  savedScenarios.push({
    promo: actPromo()?.txt || 'Sin promo',
    comboProb: $('sC').value,
    basketProb: $('sB').value,
    visits: S2.visits || 0,
    sales: S2.n,
    revenue: S2.inc,
    margin: S2.margin || 0,
    combos: S2.combo
  });
  renderScenarios();
};

function renderScenarios() {
  const el = $('scenarioList');
  if (!savedScenarios.length) { el.textContent = 'Todavía no guardaste escenarios.'; return; }
  el.innerHTML = savedScenarios.map((a, i) => `
    <div style="padding:6px 0;border-bottom:1px solid #1e2f22;display:flex;justify-content:space-between">
      <div>
        <b>${i + 1}. ${a.promo}</b><br>
        <small style="color:var(--mu)">Combo ${a.comboProb}% · Canasta ${a.basketProb}% · ${a.visits} visitas · ${a.combos} packs</small>
      </div>
      <div style="text-align:right">
        <b>${fm(a.revenue)}</b><br>
        <small style="color:#60c572">Margen: ${fm(a.margin)}</small>
      </div>
    </div>
  `).join('');
}

$('csv').onclick = () => {
  const rows = [
    ['INFORME TECNICO MINERIA DE DATOS - IES N.º 6 PERICO (VERSION REVISADA)'],
    ['Alumno', 'Flores Juan Israel'],
    ['Docente', 'Castro, Abraham'],
    ['Caso', 'Bazar Inteligente - Pack Mesa Completa'],
    ['Dataset', 'Sintetico - 601 registros finales - 188 tickets'],
    [],
    ['Indicador', 'Valor'],
    ['Visitas Totales', S2.visits || 0],
    ['Tickets Cobrados', S2.n],
    ['Tasa de Conversion (%)', (S2.visits ? (100 * S2.n / S2.visits).toFixed(2) : '0')],
    ['Pack Mesa Completa Vendidos', S2.combo],
    ['Canastas con Descuento (15%)', S2.can],
    ['Facturacion Bruta ($)', Math.round(S2.inc)],
    ['Margen Bruto Real ($)', Math.round(S2.margin || 0)],
    ['Margen Porcentual (%)', (S2.inc > 0 ? (100 * S2.margin / S2.inc).toFixed(2) : '0')],
    [],
    ['Producto', 'Tipo Rotacion', 'PVP Real', 'Costo Reposicion', 'Unidades Vendidas']
  ];
  PROD.forEach(p => rows.push([p.n, p.rot, p.p, p.costo, S2.byUnits && S2.byUnits[p.id] || 0]));
  
  const csv = '\ufeff' + rows.map(r => r.map(v => '"' + String(v ?? '').replaceAll('"', '""') + '"').join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'bazar_inteligente_revisado_ies6.csv'; a.click();
  URL.revokeObjectURL(url);
};

$('full').onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else if (document.exitFullscreen) document.exitFullscreen();
};

$('clearLog').onclick = () => { LOG = []; simStore.publish({ log: [] }); };
$('btnRunMC').onclick = runMonteCarlo;
$('calcDescRange').oninput = updateComboCalculator;

$('go').onclick = () => run = true;
$('pa').onclick = () => run = false;
$('re').onclick = () => { reset(); run = true; };
$('so').onclick = () => {
  if (!audio.enabled) {
    if (!audio.enable()) return;
    $('so').textContent = '🔊 Sonido: SÍ';
  } else {
    audio.disable();
    $('so').textContent = '🔊 Sonido: NO';
  }
};

// Parámetros guardados en el navegador: sobreviven a recargas y cambios de ruta
const PARAM_IDS = ['sL', 'sC', 'sB', 'sS', 'sP'], PARAM_KEY = 'bazar:params';
function loadParams() {
  try {
    const saved = JSON.parse(localStorage.getItem(PARAM_KEY) || '{}');
    PARAM_IDS.forEach(id => {
      const el = $(id), v = saved[id];
      if (!el || v == null) return;
      const prev = el.value;
      el.value = v;
      if (el.value !== String(v)) el.value = prev; // valor inválido (p. ej. opción que ya no existe)
    });
  } catch (e) { /* storage no disponible */ }
}
function saveParams() {
  try { localStorage.setItem(PARAM_KEY, JSON.stringify(Object.fromEntries(PARAM_IDS.map(id => [id, $(id).value])))); } catch (e) { /* noop */ }
}
PARAM_IDS.forEach(id => $(id).oninput = () => { saveParams(); ui(); });

// Control de Ocultamiento de Sidebar (Modo Ampliado / Zen)
const toggleSidebar = () => {
  const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
  $('toggleZenBtn').textContent = isCollapsed ? '▶ Mostrar Menú' : '◀ Expandir Canvas';
};
$('toggleZenBtn').onclick = toggleSidebar;
$('collapseSideBtn').onclick = toggleSidebar;

// Atajos de teclado para la defensa
const onKey = e => {
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (e.code === 'Space') { e.preventDefault(); run = !run; }
  else if (e.code === 'KeyR') { reset(); run = true; }
  else if (e.code === 'KeyM') { $('so').click(); }
  else if (e.code === 'KeyZ') { toggleSidebar(); }
  else if (e.code === 'Digit1') { $('camGeneral').click(); }
  else if (e.code === 'Digit2') { $('camCombo').click(); }
  else if (e.code === 'Digit3') { $('camCaja').click(); }
};
window.addEventListener('keydown', onKey);

// Menú lateral móvil (el estado activo lo maneja React Router con NavLink)
(() => {
  const menu = $('sideMenu'), toggle = $('menuToggle'), overlay = $('sideOverlay');
  const closeMenu = () => {
    menu.classList.remove('open'); overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰';
  };
  toggle.onclick = () => {
    if (document.body.classList.contains('sidebar-collapsed')) {
      document.body.classList.remove('sidebar-collapsed');
      $('toggleZenBtn').textContent = '◀ Expandir Canvas';
      return;
    }
    const opening = !menu.classList.contains('open');
    menu.classList.toggle('open', opening); overlay.classList.toggle('open', opening);
    toggle.setAttribute('aria-expanded', String(opening)); toggle.textContent = opening ? '✕' : '☰';
  };
  overlay.onclick = closeMenu;
  window.__bazarCloseMenu = closeMenu;
})();

function loop(n) {
  if (stopped) return;
  const dt = Math.min(0.05, (n - last) / 1000);
  last = n;
  if (run) upd(dt);
  draw();
  if (n - uiT > 150) { ui(); uiT = n; }
  requestAnimationFrame(loop);
}

loadParams();
bgDraw();
reset();
updateComboCalculator();
runMonteCarlo();
spawn();
requestAnimationFrame(loop);

return () => {
  stopped = true;
  window.removeEventListener('keydown', onKey);
  audio.close();
  delete window.__bazarCloseMenu;
};
}
