/* Motor gráfico isométrico: primitivas, sprites, mobiliario y personas.
   Dibuja sobre el contexto activo (setCtx). Sin dependencias del DOM. */
import { C, S, ZS, OX, OY, WH, cam } from './constants';
import { PROD, ST, CAP } from './catalog';

let x = null, CW = 1240, CHt = 830;
export const setCtx = c => { x = c; };
export const setSize = (w, h) => { CW = w; CHt = h; };

export function pj(a, b, z = 0) {
  const base_x = OX + (a - b) * C * S;
  const base_y = OY + (a + b) * 0.5 * S - z * ZS;
  return [
    CW * 0.5 + (base_x - CW * 0.5 + cam.ox) * cam.zoom,
    CHt * 0.5 + (base_y - CHt * 0.5 + cam.oy) * cam.zoom
  ];
}

export function poly(pts, fill, stroke, lw) {
  const q = pts.map(p => pj(...p));
  x.beginPath();
  q.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]));
  x.closePath();
  if (fill) {
    if (Array.isArray(fill)) {
      const ys = q.map(p => p[1]);
      const g = x.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys) + 0.01);
      g.addColorStop(0, fill[0]);
      g.addColorStop(1, fill[1]);
      x.fillStyle = g;
    } else x.fillStyle = fill;
    x.fill();
  }
  if (stroke) {
    x.strokeStyle = stroke;
    x.lineWidth = (lw || 1) * cam.zoom;
    x.stroke();
  }
}

export function box(x0, y0, x1, y1, z0, z1, ct, cr, cl) {
  poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], cr, 'rgba(0,0,0,0.22)');
  poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], cl, 'rgba(0,0,0,0.22)');
  poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], ct, 'rgba(255,255,255,0.25)');
}

export function ell(a, b, rx, ry, f, s, lw = 1) {
  x.beginPath();
  x.ellipse(a, b, rx * cam.zoom, ry * cam.zoom, 0, 0, Math.PI * 2);
  if (f) { x.fillStyle = f; x.fill(); }
  if (s) { x.strokeStyle = s; x.lineWidth = lw * cam.zoom; x.stroke(); }
}

export function cyl(a, b, r, h, f, t, s) {
  r *= cam.zoom; h *= cam.zoom;
  x.fillStyle = f;
  x.beginPath();
  x.moveTo(a - r, b);
  x.lineTo(a - r, b - h);
  x.lineTo(a + r, b - h);
  x.lineTo(a + r, b);
  x.ellipse(a, b, r, r * 0.48, 0, 0, Math.PI);
  x.closePath();
  x.fill();
  if (s) { x.strokeStyle = s; x.lineWidth = 1 * cam.zoom; x.stroke(); }
  ell(a, b - h, r / cam.zoom, (r * 0.48) / cam.zoom, t || f, s);
}

/* ==========================================================================
   PILAR 1: DIBUJO DETALLADO E INDIVIDUAL DE LOS 10 PRODUCTOS (SP)
   ========================================================================== */
export const SP = {
  // 1. SET DE VASOS: 3 vasos de vidrio con transparencia, base gruesa y reflejos blancos especulares
  glass(a, b) {
    const z = cam.zoom;
    const drawSingleGlass = (gx, gy, scale = 1) => {
      const r = 5.2 * z * scale, h = 15 * z * scale;
      // Cuerpo translúcido
      x.save();
      const grad = x.createLinearGradient(gx - r, gy, gx + r, gy);
      grad.addColorStop(0, 'rgba(165, 210, 235, 0.45)');
      grad.addColorStop(0.3, 'rgba(235, 248, 255, 0.7)');
      grad.addColorStop(0.7, 'rgba(175, 218, 240, 0.4)');
      grad.addColorStop(1, 'rgba(135, 185, 215, 0.6)');
      
      x.fillStyle = grad;
      x.beginPath();
      x.moveTo(gx - r * 0.85, gy);
      x.lineTo(gx - r, gy - h);
      x.lineTo(gx + r, gy - h);
      x.lineTo(gx + r * 0.85, gy);
      x.ellipse(gx, gy, r * 0.85, r * 0.42, 0, 0, Math.PI);
      x.closePath();
      x.fill();
      
      // Borde superior
      ell(gx, gy - h, r / z, (r * 0.42) / z, 'rgba(230,245,255,0.7)', 'rgba(255,255,255,0.85)', 1);
      
      // Base gruesa de cristal
      ell(gx, gy - 2 * z, (r * 0.8) / z, (r * 0.38) / z, 'rgba(150,205,235,0.6)', 'rgba(255,255,255,0.6)', 1);
      
      // Brillo especular blanco vertical
      x.strokeStyle = 'rgba(255,255,255,0.85)';
      x.lineWidth = 1.2 * z;
      x.beginPath();
      x.moveTo(gx - r * 0.5, gy - h + 3 * z);
      x.lineTo(gx - r * 0.4, gy - 3 * z);
      x.stroke();
      x.restore();
    };
    drawSingleGlass(a - 4 * z, b - 2 * z, 0.85);
    drawSingleGlass(a + 5 * z, b - 1 * z, 0.9);
    drawSingleGlass(a, b, 1.0);
  },

  // 2. PLATOS LONDRES: Pila de platos hondos de loza blanca con reborde azul cobalto
  plate(a, b) {
    const z = cam.zoom;
    for (let i = 0; i < 4; i++) {
      const py = b - i * 3.5 * z;
      // Plato inferior / cuerpo
      ell(a, py, 13, 6.2, '#f0f3f8', '#9ab0cc', 1.2);
      // Reborde azul cobalto inglés
      ell(a, py - 0.8 * z, 12.2, 5.7, null, '#204d88', 1.4);
      // Fondo cóncavo blanco
      ell(a, py - 1.4 * z, 10.5, 4.8, '#ffffff');
    }
    // Plato superior con concavidad y fileteado decorativo
    const topY = b - 4 * 3.5 * z;
    ell(a, topY, 13, 6.2, '#f8fafc', '#8fa6c8', 1.5);
    ell(a, topY - 1 * z, 12.2, 5.7, null, '#1e4882', 1.6);
    ell(a, topY - 1.8 * z, 9.8, 4.5, '#eef3f9', '#adc2db', 0.8);
  },

  // 3. TAZAS DE CAFÉ: Platillo cerámico, taza con asa curva y café oscuro humeante
  cup(a, b) {
    const z = cam.zoom;
    // Platillo inferior
    ell(a, b + 1 * z, 11, 4.8, '#eaeff5', '#9cb3ce', 1.2);
    ell(a, b + 0.5 * z, 8, 3.2, null, '#2b5288', 0.8);
    
    // Cuerpo de la taza
    cyl(a, b - 1 * z, 6, 9.5, '#f5f7fa', '#ffffff', '#9bb0cc');
    
    // Filete azul en la base de la taza
    x.fillStyle = '#225592';
    x.fillRect(a - 6 * z, b - 4 * z, 12 * z, 1.8 * z);
    
    // Café en la superficie
    ell(a, b - 10.5 * z, 5.2, 2.4, '#3e2417', '#25130b', 0.8);
    // Reflejo de brillo en el café
    ell(a - 1.5 * z, b - 11 * z, 1.6, 0.7, 'rgba(255,255,255,0.45)');
    
    // Asa lateral curva
    x.strokeStyle = '#e6ecf4';
    x.lineWidth = 2.4 * z;
    x.beginPath();
    x.arc(a + 7 * z, b - 6 * z, 3.8 * z, -1.4, 1.4);
    x.stroke();
    x.strokeStyle = '#8fa6c8';
    x.lineWidth = 0.8 * z;
    x.stroke();
  },

  // 4. CUBIERTOS SUELTOS: Estuche o atado con cuchara, tenedor y cuchillo cruzados de acero brillante
  cutl(a, b) {
    const z = cam.zoom;
    // Base/estuche soporte
    box(0, 0, 0, 0, 0, 0); // dummy for consistency
    ell(a, b, 14, 6.5, '#5c3e23', '#3a2412', 1);
    
    x.save();
    // Hoja de cuchillo (plateado pulido)
    x.strokeStyle = '#f8fafc';
    x.lineWidth = 2.4 * z;
    x.beginPath();
    x.moveTo(a - 8 * z, b + 2 * z);
    x.lineTo(a + 7 * z, b - 5 * z);
    x.stroke();
    
    // Tenedor con púas
    x.strokeStyle = '#d5dfea';
    x.lineWidth = 2.0 * z;
    x.beginPath();
    x.moveTo(a + 7 * z, b + 2 * z);
    x.lineTo(a - 6 * z, b - 5 * z);
    x.stroke();
    for (let k = -1; k <= 1; k++) {
      x.beginPath();
      x.moveTo(a - 6 * z + k * 1.5 * z, b - 5 * z);
      x.lineTo(a - 8 * z + k * 1.5 * z, b - 7 * z);
      x.stroke();
    }
    
    // Cuchara cóncava
    ell(a, b - 2 * z, 4.5, 2.2, '#ffffff', '#9fb2c8', 1);
    ell(a - 1 * z, b - 2.5 * z, 2.0, 0.9, 'rgba(255,255,255,0.9)');
    x.restore();
  },

  // 5. SERVILLETERO: Arco vertical elegante con servilletas triangulares de papel
  napk(a, b) {
    const z = cam.zoom;
    // Servilletas de papel en abanico (fondo)
    x.fillStyle = '#f5f7fa';
    x.beginPath();
    x.moveTo(a - 8 * z, b - 1 * z);
    x.lineTo(a - 3 * z, b - 15 * z);
    x.lineTo(a + 1 * z, b - 7 * z);
    x.closePath();
    x.fill();
    x.strokeStyle = '#cbd5e1';
    x.lineWidth = 0.8 * z;
    x.stroke();
    
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.moveTo(a - 2 * z, b - 2 * z);
    x.lineTo(a + 3 * z, b - 17 * z);
    x.lineTo(a + 8 * z, b - 3 * z);
    x.closePath();
    x.fill();
    x.stroke();
    
    // Soporte/arco frontal de madera cálida o bronce
    x.fillStyle = '#caa158';
    x.beginPath();
    x.roundRect(a - 9 * z, b - 6 * z, 18 * z, 6 * z, 2 * z);
    x.fill();
    x.strokeStyle = '#8c6827';
    x.lineWidth = 1.2 * z;
    x.stroke();
    
    // Arco frontal decorativo
    x.beginPath();
    x.arc(a, b - 6 * z, 6 * z, Math.PI, 0);
    x.stroke();
  },

  // 6. MANTEL DE LINO: Rollo textil y tejido doblado en capas beiges con textura y lazo
  linen(a, b) {
    const z = cam.zoom;
    const colors = ['#cfc2ab', '#e4dbcc', '#f3eee4'];
    for (let i = 0; i < 3; i++) {
      const ly = b - (i * 5.5) * z;
      x.fillStyle = colors[i];
      x.beginPath();
      x.roundRect(a - 14 * z, ly - 6 * z, 28 * z, 5.5 * z, 2 * z);
      x.fill();
      x.strokeStyle = '#ab9c84';
      x.lineWidth = 0.8 * z;
      x.stroke();
      
      // Pliegues y textura textil
      x.strokeStyle = 'rgba(0,0,0,0.12)';
      x.beginPath();
      x.moveTo(a - 13 * z, ly - 3 * z);
      x.lineTo(a + 13 * z, ly - 3 * z);
      x.stroke();
    }
    // Lazo o faja decorativa rústica
    x.fillStyle = '#a67c52';
    x.fillRect(a - 2.5 * z, b - 18 * z, 5 * z, 18 * z);
    x.strokeStyle = '#6e4c2b';
    x.lineWidth = 0.8 * z;
    x.strokeRect(a - 2.5 * z, b - 18 * z, 5 * z, 18 * z);
  },

  // 7. PORTARRETRATO DE MADERA: Marco oscuro con moldura, paspartú y paisaje miniatura
  frame(a, b) {
    const z = cam.zoom;
    // Marco exterior de madera oscura
    x.fillStyle = '#5c3a1e';
    x.beginPath();
    x.roundRect(a - 10 * z, b - 23 * z, 20 * z, 23 * z, 2 * z);
    x.fill();
    x.strokeStyle = '#38200d';
    x.lineWidth = 1.2 * z;
    x.stroke();
    
    // Paspartú blanco
    x.fillStyle = '#f8fafc';
    x.fillRect(a - 8 * z, b - 21 * z, 16 * z, 19 * z);
    
    // Fotografía/paisaje en miniatura (cielo celeste, sol y colinas verdes)
    const g = x.createLinearGradient(0, b - 20 * z, 0, b - 3 * z);
    g.addColorStop(0, '#78c6ed');
    g.addColorStop(0.55, '#c5ebfc');
    g.addColorStop(0.56, '#5a9954');
    g.addColorStop(1, '#3b6f37');
    x.fillStyle = g;
    x.fillRect(a - 6.5 * z, b - 19.5 * z, 13 * z, 16 * z);
    
    // Sol diminuto en la foto
    ell(a + 2.5 * z, b - 16 * z, 1.8, 1.8, '#ffeb3b');
    
    // Reflejo diagonal de cristal
    x.strokeStyle = 'rgba(255,255,255,0.4)';
    x.lineWidth = 1.2 * z;
    x.beginPath();
    x.moveTo(a - 6 * z, b - 10 * z);
    x.lineTo(a + 4 * z, b - 19 * z);
    x.stroke();
  },

  // 8. CANASTA DE MIMBRE: Cesta texturizada con malla entrecruzada y asa arqueada
  basket(a, b) {
    const z = cam.zoom;
    // Cuerpo cónico de mimbre
    cyl(a, b, 13.5, 11, '#9e6d36', '#c99658', '#6d481e');
    
    // Trama de mimbre trenzado
    x.strokeStyle = '#6d481e';
    x.lineWidth = 1.2 * z;
    for (let i = -10; i <= 10; i += 5) {
      x.beginPath();
      x.moveTo(a + i * z, b - 10 * z);
      x.lineTo(a + (i * 0.85) * z, b);
      x.stroke();
    }
    // Líneas horizontales de mimbre
    for (let j = 3; j <= 9; j += 3) {
      ell(a, b - j * z, (13.5 - j * 0.2) / z, ((13.5 - j * 0.2) * 0.45) / z, null, '#5e3d17', 0.9);
    }
    
    // Asa superior arqueada completa
    x.strokeStyle = '#6d481e';
    x.lineWidth = 3.2 * z;
    x.beginPath();
    x.arc(a, b - 11 * z, 11 * z, Math.PI, 0);
    x.stroke();
    x.strokeStyle = '#d4a263';
    x.lineWidth = 1.6 * z;
    x.stroke();
  },

  // 9. VELA AROMÁTICA: Vaso de cristal con cera de soja, mecha y llama viva con halo difuminado
  candle(a, b) {
    const z = cam.zoom;
    // Vaso de cristal exterior translúcido
    cyl(a, b, 7.5, 11, 'rgba(220,235,245,0.55)', 'rgba(240,250,255,0.8)', '#9ab5cc');
    
    // Cera aromática interior marfil
    ell(a, b - 8 * z, 6.2, 2.8, '#fff5db', '#d9c79e', 0.8);
    
    // Mecha negra
    x.strokeStyle = '#222';
    x.lineWidth = 1.2 * z;
    x.beginPath();
    x.moveTo(a, b - 8 * z);
    x.lineTo(a, b - 12 * z);
    x.stroke();
    
    // Halo brillante difuminado
    const g = x.createRadialGradient(a, b - 14 * z, 1 * z, a, b - 14 * z, 12 * z);
    g.addColorStop(0, 'rgba(255, 220, 100, 0.95)');
    g.addColorStop(0.4, 'rgba(255, 160, 40, 0.45)');
    g.addColorStop(1, 'rgba(255, 120, 0, 0)');
    x.fillStyle = g;
    x.fillRect(a - 12 * z, b - 26 * z, 24 * z, 24 * z);
    
    // Llama viva en forma de lágrima
    x.fillStyle = '#fff9c4';
    x.beginPath();
    x.moveTo(a - 2 * z, b - 12 * z);
    x.quadraticCurveTo(a - 3 * z, b - 16 * z, a, b - 18 * z);
    x.quadraticCurveTo(a + 3 * z, b - 16 * z, a + 2 * z, b - 12 * z);
    x.closePath();
    x.fill();
  },

  // 10. ADORNO DE CERÁMICA: Florero / ánfora escultural con cuerpo abultado, cuello estrecho y reflejos
  vase(a, b) {
    const z = cam.zoom;
    x.save();
    // Silueta con curvas Bezier tridimensionales
    x.beginPath();
    x.moveTo(a - 3.5 * z, b - 24 * z);
    x.bezierCurveTo(a - 16 * z, b - 14 * z, a - 13 * z, b - 3 * z, a - 7 * z, b);
    x.lineTo(a + 7 * z, b);
    x.bezierCurveTo(a + 13 * z, b - 3 * z, a + 16 * z, b - 14 * z, a + 3.5 * z, b - 24 * z);
    x.closePath();
    
    // Degradado de cerámica vidriada cálida
    const g = x.createLinearGradient(a - 16 * z, 0, a + 16 * z, 0);
    g.addColorStop(0, '#e5ded1');
    g.addColorStop(0.3, '#fbf9f4');
    g.addColorStop(0.7, '#dfd5c5');
    g.addColorStop(1, '#b5a995');
    x.fillStyle = g;
    x.fill();
    x.strokeStyle = '#8f816d';
    x.lineWidth = 1.2 * z;
    x.stroke();
    
    // Franja ocre decorativa artesanal
    x.strokeStyle = '#c4793f';
    x.lineWidth = 2.5 * z;
    x.beginPath();
    x.ellipse(a, b - 10 * z, 10 * z, 4 * z, 0, 0, Math.PI);
    x.stroke();
    
    // Boca superior del jarrón
    ell(a, b - 24 * z, 3.5, 1.8, '#d4c7b2', '#7a6b57', 1);
    
    // Brillo blanco especular mate curvado
    x.strokeStyle = 'rgba(255,255,255,0.7)';
    x.lineWidth = 1.4 * z;
    x.beginPath();
    x.moveTo(a - 6 * z, b - 16 * z);
    x.quadraticCurveTo(a - 8 * z, b - 10 * z, a - 4 * z, b - 4 * z);
    x.stroke();
    x.restore();
  }
};

/* ==========================================================================
   PILAR 3: ESTRUCTURA 3D DE LOS ESTANTES CON PATAS, BISSELADO Y SOMBRAS
   ========================================================================== */
export const SH = [
  { i: 0, x0: 0,   y0: 1.2, x1: 1.2,  y1: 11.5, h: 2.2, face: 'x', tiers: [['plate', 9], ['glass', 11], ['napk', 8], ['cutl', 8]], top: ['vase', 'basket', 'vase', 'basket', 'vase'] },
  { i: 1, x0: 4.6, y0: 3.2, x1: 6.0,  y1: 10.8, h: 1.7, face: 'x', tiers: [['plate', 6], ['cup', 8], ['cutl', 5]], top: ['basket', 'vase', 'basket'] },
  { i: 2, x0: 13.0,y0: 4.2, x1: 14.4, y1: 11.0, h: 1.7, face: 'x', tiers: [['linen', 5], ['basket', 5], ['candle', 7]], top: ['vase', 'frame', 'vase'] },
  { i: 3, x0: 15.0,y0: 0,   x1: 19.8, y1: 1.2,  h: 2.2, face: 'y', tiers: [['frame', 6], ['vase', 6], ['candle', 7], ['linen', 5]], top: ['basket', 'vase', 'basket', 'vase'] }
];

export function shelf(d) {
  const { x0, y0, x1, y1, h, face, tiers } = d, T = tiers.length, gap = (h - 0.3) / T, X = face === 'x', pr = PROD.filter(p => p.s === d.i);
  
  // 1. Patas de madera/metal visibles en las 4 esquinas del mueble
  const legW = 0.12;
  box(x0, y0, x0 + legW, y0 + legW, 0, h, '#7c5228', '#4d3012', '#5f3c1b');
  box(x1 - legW, y0, x1, y0 + legW, 0, h, '#7c5228', '#4d3012', '#5f3c1b');
  box(x0, y1 - legW, x0 + legW, y1, 0, h, '#7c5228', '#4d3012', '#5f3c1b');
  box(x1 - legW, y1 - legW, x1, y1, 0, h, '#7c5228', '#4d3012', '#5f3c1b');
  
  // 2. Estructura principal del mueble con acabado barnizado
  box(x0, y0, x1, y1, 0.1, h, ['#d8a466', '#be894e'], ['#9e642e', '#7c4819'], ['#ad7438', '#8f5724']);
  
  // 3. Fondo interior oscuro del mueble
  if (X) poly([[x1, y0 + 0.1, 0.14], [x1, y1 - 0.1, 0.14], [x1, y1 - 0.1, h - 0.1], [x1, y0 + 0.1, h - 0.1]], ['#3d220f', '#241205']);
  else poly([[x0 + 0.1, y1, 0.14], [x1 - 0.1, y1, 0.14], [x1 - 0.1, y1, h - 0.1], [x0 + 0.1, y1, h - 0.1]], ['#3d220f', '#241205']);
  
  const at = (u, z) => X ? pj(x1 - 0.3, u, z) : pj(u, y1 - 0.3, z);
  
  // 4. Baldas con espesor real, biselado y colocación de productos
  tiers.forEach((t, i) => {
    const z = 0.14 + i * gap, n = t[1], L = (X ? y1 - y0 : x1 - x0) - 0.6, base = X ? y0 : x0, mine = pr.filter(p => p.t === i);
    
    // Baldosa con espesor y moldura dorada
    if (X) {
      poly([[x1 + 0.02, y0 + 0.08, z], [x1 + 0.02, y1 - 0.08, z], [x1 + 0.02, y1 - 0.08, z + 0.07], [x1 + 0.02, y0 + 0.08, z + 0.07]], '#e6b97b', '#aa7738', 1);
    } else {
      poly([[x0 + 0.08, y1 + 0.02, z], [x1 - 0.08, y1 + 0.02, z], [x1 - 0.08, y1 + 0.02, z + 0.07], [x0 + 0.08, y1 + 0.02, z + 0.07]], '#e6b97b', '#aa7738', 1);
    }
    
    for (let k = 0; k < n; k++) {
      const u = base + 0.3 + L * (k + 0.5) / n;
      if (mine.some(p => Math.abs(u - (X ? p.y : p.x)) < 0.9)) continue;
      const q = at(u, z + 0.07);
      SP[t[0]](q[0], q[1]);
    }
    mine.forEach(p => {
      const c = X ? p.y : p.x;
      for (let j = 0; j < ST[p.id]; j++) {
        const q = at(c + (j - (CAP - 1) / 2) * 0.36, z + 0.07);
        SP[p.k](q[0], q[1]);
      }
    });
  });
  
  // Productos colocados sobre la parte superior del mueble
  (d.top || []).forEach((k, i, ar) => {
    const L = (X ? y1 - y0 : x1 - x0) - 1, u = 0.5 + L * (i + 0.5) / ar.length, p = X ? pj((x0 + x1) / 2, y0 + u, h) : pj(x0 + u, (y0 + y1) / 2, h);
    SP[k](p[0], p[1]);
  });
}

export const LAMPS = [];
for (let i = 0; i <= 6; i++) LAMPS.push([0, 1 + i * 2, WH - 0.15]);
for (let i = 0; i <= 9; i++) LAMPS.push([1 + i * 2, 0, WH - 0.15]);
LAMPS.push([10.6, 1.5, 1.9], [3.2, 13.8, 2.8], [20, 12.5, 2.8]);
export const PL = [[2.2, 0.7, 1], [13.7, 0.7, 1.1], [19.2, 2.8, 1], [6.2, 13.5, 1.2], [0.8, 12.9, 1.1], [19.2, 9.8, 1]];

export function plant(px, py, k) {
  const [a, b] = pj(px, py, 0);
  ell(a + 3 * cam.zoom, b + 1 * cam.zoom, 13 * k, 6 * k, 'rgba(0,0,0,0.28)');
  cyl(a, b, 9 * k, 14 * k, '#8a5a3a', '#b07850', '#5e3b22');
  for (let i = 0; i < 9; i++) {
    const an = -1.2 + i * 0.3;
    x.save();
    x.translate(a, b - 14 * k * cam.zoom);
    x.rotate(an);
    ell(0, -16 * k, 5 * k, 16 * k, i % 2 ? '#2f8f4a' : '#3fae5c', '#1f6a35');
    x.restore();
  }
}

export function counter() {
  box(8.6, 0.9, 12.6, 2.0, 0, 1.05, ['#f2ece0', '#ddd5c4'], ['#4a3320', '#2e1d0e'], ['#6a4a2e', '#432c18']);
  for (let i = 1; i < 10; i++) {
    const xx = 8.6 + i * 0.4;
    poly([[xx, 2.0, 0.1], [xx + 0.05, 2.0, 0.1], [xx + 0.05, 2.0, 0.95], [xx, 2.0, 0.95]], 'rgba(255,255,255,0.1)');
  }
  box(9.9, 1.15, 10.5, 1.65, 1.05, 1.25, '#3a414d', '#1c2027', '#262b33');
  poly([[9.95, 1.67, 1.3], [10.45, 1.67, 1.3], [10.45, 1.67, 1.72], [9.95, 1.67, 1.72]], ['#7fdcff', '#2a7ca8'], '#111');
  box(11.0, 1.2, 11.5, 1.6, 1.05, 1.2, '#d8d8d8', '#999', '#aaa');
  const p = pj(12.1, 1.4, 1.05); SP.vase(p[0], p[1]);
  const q = pj(9.3, 1.4, 1.05); SP.basket(q[0], q[1]);
}

export function door(x0, y0, x1, y1, gl) {
  box(x0, y0, x1, y1, gl ? 2.65 : 0, 2.8, '#3b4a5c', '#27323f', '#303d4d');
  if (gl === 'y') poly([[x0 + 0.15, y1, 0.05], [x1 - 0.15, y1, 0.05], [x1 - 0.15, y1, 2.65], [x0 + 0.15, y1, 2.65]], 'rgba(170,215,240,0.18)', 'rgba(200,230,250,0.4)');
  else if (gl === 'x') poly([[x1, y0 + 0.15, 0.05], [x1, y1 - 0.15, 0.05], [x1, y1 - 0.15, 2.65], [x1, y0 + 0.15, 2.65]], 'rgba(170,215,240,0.18)', 'rgba(200,230,250,0.4)');
}

export const DR = [
  { x0: 2.0,  y0: 13.85, x1: 2.15, y1: 14.0, g: 0 },
  { x0: 4.25, y0: 13.85, x1: 4.4,  y1: 14.0, g: 0 },
  { x0: 2.0,  y0: 13.85, x1: 4.4,  y1: 14.0, g: 'y', hd: 1 },
  { x0: 19.85,y0: 11.3,  x1: 20.0, y1: 11.45,g: 0 },
  { x0: 19.85,y0: 13.55, x1: 20.0, y1: 13.7, g: 0 },
  { x0: 19.85,y0: 11.3,  x1: 20.0, y1: 13.7, g: 'x', hd: 1 }
];

/* ==========================================================================
   PILAR 2: PERSONAJES CON PROPORCIONES HUMANAS, MARCHA FLUIDA Y DETALLES
   ========================================================================== */
export function person(px, py, o) {
  const z = cam.zoom;
  const [a, b] = pj(px, py, 0);
  const K = (o.k || 1) * z;
  
  // Ciclo de marcha fluido y rebote de cadera natural
  const legCycle = o.walk ? Math.sin(o.ph) : 0;
  const armCycle = o.walk ? Math.cos(o.ph) : 0;
  const bob = o.walk ? Math.abs(Math.sin(o.ph * 2)) * 2.2 * z : 0;
  
  // 1. Sombra suave difuminada en el suelo
  ell(a, b + 1 * z, 14 * (o.k || 1), 6 * (o.k || 1), 'rgba(12, 18, 13, 0.45)');
  
  x.save();
  x.translate(a, b);
  x.scale(K, K);
  x.translate(-a, -b);
  
  // 2. Piernas con articulación y zapatos definidos
  x.lineCap = 'round';
  x.lineWidth = 5.5;
  x.strokeStyle = o.pa;
  
  // Pierna izquierda
  const lx = a - 4.5 - legCycle * 5.5;
  x.beginPath();
  x.moveTo(a - 4, b - 26 - bob);
  x.lineTo(lx, b - 3);
  x.stroke();
  // Zapato izquierdo
  ell(lx - 1, b - 1.5, 4.5, 2.4, '#1b1c20');
  
  // Pierna derecha (en contra-fase)
  const rx = a + 4.5 + legCycle * 5.5;
  x.beginPath();
  x.moveTo(a + 4, b - 26 - bob);
  x.lineTo(rx, b - 3);
  x.stroke();
  // Zapato derecho
  ell(rx + 1, b - 1.5, 4.5, 2.4, '#1b1c20');
  
  // 3. Torso con volumen y degradado de iluminación
  x.beginPath();
  x.roundRect(a - 9.5, b - 53 - bob, 19, 28, [6, 6, 3, 3]);
  const gTorso = x.createLinearGradient(a - 9.5, 0, a + 9.5, 0);
  gTorso.addColorStop(0, o.sh);
  gTorso.addColorStop(0.4, 'rgba(255,255,255,0.22)');
  gTorso.addColorStop(1, 'rgba(0,0,0,0.25)');
  x.fillStyle = o.sh;
  x.fill();
  x.fillStyle = gTorso;
  x.fill();
  
  // Delantal para el empleado o detalles de vestimenta
  if (o.apron) {
    x.fillStyle = o.apron;
    x.fillRect(a - 7.5, b - 44 - bob, 15, 18);
    x.strokeStyle = '#caa55f';
    x.lineWidth = 1;
    x.strokeRect(a - 7.5, b - 44 - bob, 15, 18);
  }
  
  // 4. Brazos articulados con balanceo
  const arm = (sx, sy, ex, ey) => {
    x.lineWidth = 5.2;
    x.strokeStyle = o.sh;
    x.beginPath(); x.moveTo(sx, sy); x.lineTo(ex, ey); x.stroke();
    ell(ex, ey, 2.8, 2.8, o.sk);
  };
  
  // Brazo izquierdo (opuesto a la pierna)
  if (!o.box) {
    arm(a - 10, b - 49 - bob, a - 11 - armCycle * 6, b - 30 - bob);
  }
  
  // Brazo derecho / Transporte de caja, canasta o bolsa
  if (o.box) {
    // Empleado llevando caja de cartón de reposición
    arm(a - 10, b - 49 - bob, a - 8, b - 36 - bob);
    arm(a + 10, b - 49 - bob, a + 8, b - 36 - bob);
    x.fillStyle = '#b8894d';
    x.beginPath(); x.roundRect(a - 11, b - 46 - bob, 22, 15, 3); x.fill();
    x.fillStyle = '#dbad6e';
    x.fillRect(a - 11, b - 46 - bob, 22, 4);
    x.strokeStyle = '#7c5424'; x.lineWidth = 1;
    x.strokeRect(a - 11, b - 46 - bob, 22, 15);
  } else {
    let hx = a + 11 + armCycle * 6, hy = b - 30 - bob;
    if (o.arm) { hx = a + 14; hy = b - 63 - bob; } // Levantando el brazo hacia la góndola
    arm(a + 10, b - 49 - bob, hx, hy);
    
    // Canasta de compras con mini-íconos de productos adquiridos
    if (o.basket && !o.arm) {
      x.fillStyle = '#9e6d36';
      x.beginPath();
      x.roundRect(hx - 8, hy + 1, 16, 11, [1, 1, 4, 4]);
      x.fill();
      x.strokeStyle = '#5a3d1b';
      x.lineWidth = 1.2;
      x.stroke();
      // Manija de la canasta
      x.strokeStyle = '#d4a263';
      x.lineWidth = 1.8;
      x.beginPath();
      x.arc(hx, hy + 1, 6.5, Math.PI, 0);
      x.stroke();
      
      // Productos asomando dentro de la canastita
      o.basket.slice(-4).forEach((c, idx) => {
        ell(hx - 4.5 + idx * 3, hy - (idx % 2) * 1.5, 2.5, 2.5, c, '#111', 0.8);
      });
    }
    
    // Bolsa de compras elegante al pagar y salir
    if (o.bag) {
      x.fillStyle = o.bag;
      x.beginPath();
      x.roundRect(hx - 6.5, hy + 2, 13, 16, 2);
      x.fill();
      x.fillStyle = 'rgba(255,255,255,0.3)';
      x.fillRect(hx - 6.5, hy + 2, 13, 4);
      x.strokeStyle = '#ffffff';
      x.lineWidth = 1.2;
      x.beginPath();
      x.arc(hx, hy + 2, 4.5, Math.PI, 0);
      x.stroke();
    }
  }
  
  // 5. Cuello y cabeza estilizada con peinados variados
  x.fillStyle = o.sk;
  x.fillRect(a - 2.8, b - 58 - bob, 5.6, 7);
  
  if (o.long) {
    // Cabello largo / melena
    ell(a, b - 61 - bob, 9.5, 12, o.hair);
  }
  // Cabeza
  ell(a, b - 65 - bob, 7.8, 8.2, o.sk);
  
  // Peinado y rasgos
  x.fillStyle = o.hair;
  if (o.face) {
    // Ojos y boca mínima
    ell(a - 2.8, b - 64 - bob, 1.1, 1.3, '#1c1c1c');
    ell(a + 2.8, b - 64 - bob, 1.1, 1.3, '#1c1c1c');
    // Cabello superior con flequillo
    x.beginPath();
    x.arc(a, b - 66 - bob, 8.2, Math.PI, 0);
    x.fill();
    x.fillRect(a - 8, b - 67 - bob, 16, 3.5);
  } else {
    // Vista de espalda
    ell(a, b - 65 - bob, 8.6, 9.0, o.hair);
  }
  x.restore();
}
