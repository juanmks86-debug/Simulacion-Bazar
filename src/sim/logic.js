/* Lógica de la simulación: clientes (perfiles, recorridos, compras), cola de caja, empleado repositor y reloj. */
import { LN, QX, QY, cam } from './constants';
import { P, PROD, PROF, OUT, NAMES, KIDS, CAP, ST } from './catalog';
import { pj } from './gfx';
import { sim } from './state';
import { fm, conv, basketConv, spd, rn, leaders, rush, hrs, fmt, actPromo } from './helpers';
import { addParticle, updateParticles, clearParticles } from './particles';
import { audio } from './audioInstance';
import { getParams } from './params';
import { priceOf as pricePure } from './pricing';

export function reset() {
  sim.cust = []; sim.queue = []; sim.serving = null; sim.emp = null; sim.empCd = 8; sim.uid = 0;
  PROD.forEach(p => ST[p.id] = CAP);
  sim.S2 = {
    n: 0, visits: 0, combo: 0, can: 0, inc: 0, cost: 0, margin: 0, promo: 0,
    nobuy: 0, aband: 0, repo: 0, byUnits: {}
  };
  sim.LOG = []; sim.clock = 690; sim.arr = 0; sim.nameI = 0; clearParticles();
}

export function route(f, t) {
  const a = [];
  if (Math.abs(f.y - LN) > 0.01) a.push({ x: f.x, y: LN });
  a.push({ x: t.x, y: LN }, { x: t.x, y: t.y });
  return a;
}


export function planFor(prof) {
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

export function spawn() {
  if (leaders().length >= 8) return;
  sim.S2.visits = (sim.S2.visits || 0) + 1;
  const prof = rn(['normal', 'normal', 'normal', 'normal', 'apurado', 'curioso', 'ofertas']);
  const nm = NAMES[sim.nameI % NAMES.length], o = Object.assign({}, OUT[sim.nameI % OUT.length]);
  sim.nameI++;
  const c = {
    id: ++sim.uid, name: nm, prof, o, role: 'lead', k: 1, x: 3.1, y: 14.9,
    items: planFor(prof), i: 0, cart: [], keys: [], dots: [], tot: 0, totCost: 0,
    st: 'walk', t: 0, ph: 0, vx: 0, vy: -1, walk: false, pat: PROF[prof].pat,
    chatT: 0, chatted: false, paid: false, promoUsed: false, isCombo: false, spf: PROF[prof].sp
  };
  c.path = route(c, P[c.items[0].k]);
  sim.cust.push(c);
  audio.sfx.door();
  
  const r = Math.random();
  if (r < 0.25) {
    const kid = r >= 0.12, oo = Object.assign({}, OUT[(sim.nameI + 3) % OUT.length]);
    sim.cust.push({
      role: 'follow', leader: c, kid, name: kid ? rn(KIDS) : NAMES[(sim.nameI + 5) % NAMES.length],
      o: oo, k: kid ? 0.68 : 1, off: kid ? { x: 0.65, y: 0.3 } : { x: 0.7, y: 0 },
      x: 3.8, y: 15.2, ph: 0, vx: 0, vy: -1, walk: false, st: 'follow'
    });
    c.fam = kid ? '👨‍👧' : '👫';
  }
}

export function add(m, v) {
  sim.LOG.unshift({ t: fmt(), m, v });
  sim.LOG.length = Math.min(sim.LOG.length, 35);
}

export function step(c, dt, m) {
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

export function priceOf(c, k) {
  const r = pricePure(k, c.keys, actPromo(), ST);
  if (r.disc) c.isCombo = true;
  return r;
}

export function takeItem(c, it) {
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
    sim.S2.can++;
    const pt = pj(c.x, c.y, 0);
    addParticle('🧺 PACK MESA (-15%)', pt[0], pt[1] - 80 * cam.zoom, '#ffd54f');
  }
  
  add(c.name + ' tomó ' + (pr.q > 1 ? '2× ' : '') + p.n + (pr.label ? ' (' + pr.label + ')' : ''), fm(pr.price));
  audio.sfx.pick();
}

export function leave(c, why) {
  c.st = 'exit';
  c.path = route(c, { x: 20.9, y: LN });
  if (why) add(c.name + ' ' + why, '—');
}

export function updEmp(dt) {
  if (!sim.emp) {
    sim.empCd -= dt * spd();
    if (sim.empCd <= 0) {
      const low = PROD.filter(p => ST[p.id] <= 1).sort((a, b) => ST[a.id] - ST[b.id])[0];
      if (low) {
        sim.emp = { x: 3.1, y: 14.9, st: 'in', p: low, t: 0, ph: 0, vx: 0, vy: -1, walk: false, k: 1 };
        sim.emp.path = route(sim.emp, { x: low.x, y: low.y });
        add('Empleado va a reponer ' + low.n, '—');
        audio.sfx.door();
      } else sim.empCd = 3;
    }
    return;
  }
  if (sim.emp.st === 'in') {
    step(sim.emp, dt, 1.15);
    if (!sim.emp.path.length) { sim.emp.st = 'work'; sim.emp.t = 2.6; }
  } else if (sim.emp.st === 'work') {
    sim.emp.walk = false;
    sim.emp.t -= dt * spd();
    if (sim.emp.t <= 0) {
      ST[sim.emp.p.id] = CAP;
      sim.S2.repo++;
      add('Empleado repuso ' + sim.emp.p.n, '—');
      audio.sfx.bell();
      sim.emp.st = 'out';
      sim.emp.path = route(sim.emp, { x: 20.9, y: LN });
    }
  } else {
    step(sim.emp, dt, 1.15);
    if (!sim.emp.path.length) { sim.emp = null; sim.empCd = 10; }
  }
}

export function upd(dt) {
  const h = hrs(), rs = rush(h);
  if (rs > 0) {
    sim.arr -= dt * spd();
    if (sim.arr <= 0) {
      spawn();
      sim.arr = -Math.log(1 - Math.random()) / ((getParams().sL / 20) * rs);
    }
  } else sim.arr = 0;
  
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
        else if (!c.cart.length) { sim.S2.nobuy++; leave(c, 'salió sin comprar'); }
        else { c.st = 'toq'; sim.queue.push(c); c.path = route(c, { x: QX, y: QY + (sim.queue.length - 1) * 0.85 }); }
      }
    } else if (c.st === 'toq' || c.st === 'queue') {
      c.pat -= dt * spd() * (1 + 0.45 * Math.max(0, sim.queue.length - 2));
      if (c.pat <= 0 && sim.serving !== c) {
        sim.queue.splice(sim.queue.indexOf(c), 1);
        c.keys.forEach(k => ST[k] = Math.min(CAP, ST[k] + 1));
        c.cart = []; c.dots = []; c.tot = 0;
        sim.S2.aband++;
        leave(c, 'se fue de la cola (demasiada espera)');
        continue;
      }
      if (c.st === 'toq') { step(c, dt); if (!c.path.length) c.st = 'queue'; }
      else {
        const i = sim.queue.indexOf(c), ty = QY + i * 0.85;
        c.walk = false;
        if (c.y > ty + 0.01) {
          c.y = Math.max(ty, c.y - 1.8 * spd() * dt);
          c.walk = true; c.vx = 0; c.vy = -1; c.ph += dt * 9 * spd();
        }
        if (i === 0 && !sim.serving && Math.abs(c.y - QY) < 0.05) {
          sim.serving = c; c.st = 'pay'; c.t = 1.7; c.walk = false;
          add(c.name + ' va a caja', fm(c.tot));
        }
      }
    } else if (c.st === 'pay') {
      c.t -= dt * spd();
      if (c.t <= 0) {
        sim.queue.shift();
        sim.serving = null;
        sim.S2.n++;
        sim.S2.inc += c.tot;
        sim.S2.cost += c.totCost;
        const realMargin = c.tot - c.totCost;
        sim.S2.margin += realMargin;
        
        c.keys.forEach(k => sim.S2.byUnits[k] = (sim.S2.byUnits[k] || 0) + 1);
        if (['platos', 'tazas', 'servilletero'].every(z => c.keys.includes(z))) {
          sim.S2.combo++;
        }
        if (c.promoUsed) sim.S2.promo++;
        c.paid = true;
        audio.sfx.cash();
        
        const pt = pj(10.5, 2.0, 1.2);
        addParticle('+$' + Math.round(c.tot), pt[0], pt[1] - 20 * cam.zoom, '#72e09e');
        leave(c);
      }
    } else if (c.st === 'exit') {
      step(c, dt);
      if (!c.path.length) {
        c.st = 'gone';
        add(c.name + ' salió del local', c.tot ? fm(c.tot) : '—');
        audio.sfx.door();
      }
    }
  }
  
  for (const f of sim.cust.filter(c => c.role === 'follow')) {
    const l = f.leader, tx = l.x + f.off.x, ty = l.y + f.off.y, dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy), m = Math.min(d, 3.4 * spd() * dt);
    f.walk = d > 0.12;
    if (d > 1e-3) {
      f.x += dx / d * m; f.y += dy / d * m;
      if (d > 0.12) { f.vx = dx; f.vy = dy; }
    }
    if (f.walk) f.ph += dt * 9 * spd();
  }
  
  sim.cust = sim.cust.filter(c => c.role === 'lead' ? c.st !== 'gone' : c.leader.st !== 'gone');
  const fast = rs === 0 && !leaders().length && !sim.emp ? 8 : 1;
  sim.clock += dt * spd() * 2 * fast;
}

export function stTxt(c) {
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
