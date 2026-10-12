/* Dibujo del canvas 3D: fondo estático, sombras, orden de profundidad, personas, luces y etiquetas. */
import { C, S, ZS, OX, OY, WD, DP, WH, cam } from './constants';
import { PROD, PROF, ST } from './catalog';
import { setCtx, setSize, pj, poly, ell, SH, shelf, LAMPS, PL, plant, counter, door, DR, person } from './gfx';
import { sim } from './state';
import { light, warm, hrs, actPromo } from './helpers';
import { drawParticles } from './particles';
import { stTxt } from './logic';

let cv, mainX, x, bg;

/** Prepara el canvas principal y el canvas de fondo (piso, paredes, carteles). Se llama una vez al iniciar. */
export function initRender(canvas) {
  cv = canvas;
  mainX = cv.getContext('2d');
  x = mainX;
  setCtx(mainX); setSize(cv.width, cv.height);
  bg = document.createElement('canvas');
  bg.width = cv.width; bg.height = cv.height;
}

export function bgDraw() {
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

export function draw() {
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
  
  sim.cust.forEach(c => {
    const lead = c.role === 'lead', o = Object.assign({}, c.o, { k: c.k, walk: c.walk, ph: c.ph, face: (c.vx + c.vy) >= 0 && c.st !== 'look' });
    if (lead) {
      o.arm = c.st === 'look' && c.t < 0.9 && c.t > 0.3;
      if (c.paid) o.bag = c.o.bag;
      else if (c.st !== 'exit') o.basket = c.dots;
    }
    ob.push({ x0: c.x - 0.3, y0: c.y - 0.3, x1: c.x + 0.3, y1: c.y + 0.3, draw: () => person(c.x, c.y, o) });
  });
  
  if (sim.emp) {
    const e = sim.emp, o = {
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
  
  sim.cust.forEach(c => {
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
  
  if (sim.emp) { const [a, b] = pj(sim.emp.x, sim.emp.y, 0); pill('Empleado 📦', a, b - 100 * cam.zoom, '#2d6a4f', 11); }
  let q = pj(3.2, 14, 3.3); pill('ENTRADA ⬇', q[0], q[1], '#0f7a52', 13);
  q = pj(20, 12.5, 3.3); pill('SALIDA ↔', q[0], q[1], '#2e7be0', 13);
  q = pj(10.6, 0.6, 3.55); pill('CAJA', q[0], q[1], '#222831', 13);
  
  drawParticles(x);
  
  const v = x.createRadialGradient(cv.width * 0.5, cv.height * 0.5, 320, cv.width * 0.5, cv.height * 0.5, 800);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.38)');
  x.fillStyle = v; x.fillRect(0, 0, cv.width, cv.height);
}
