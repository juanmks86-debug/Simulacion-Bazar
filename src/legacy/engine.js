/* Motor de simulación del Bazar (adaptado del HTML original). Se inicializa una sola vez desde React. */
export function initBazar() {

/* ==========================================================================
   CONFIGURACIÓN Y CATÁLOGO DE PRODUCTOS (PERICO, JUJUY - AGOSTO 2026)
   ========================================================================== */
const $ = id => document.getElementById(id);
window.$ = $;
window.setCrisp = (...a) => setCrisp(...a);
let stopped = false;

const P = {
  vasos:       { id: 'vasos',       n: 'Set de vasos',            e: '🥛', p: 3000,  costo: 1800, rot: 'Alta',      x: 2.4,  y: 3.6, s: 0, t: 1, k: 'glass',  c: '#9bc4de', rol: 'Alta rotación / Vajilla' },
  servilletero:{ id: 'servilletero',n: 'Servilletero',            e: '🧻', p: 2000,  costo: 1200, rot: 'Alta',      x: 2.4,  y: 6.4, s: 0, t: 2, k: 'napk',   c: '#caa55f', rol: 'Pack Mesa (Antecedente)' },
  cubiertos:   { id: 'cubiertos',   n: 'Cubiertos sueltos',       e: '🍴', p: 8000,  costo: 4800, rot: 'Alta',      x: 2.4,  y: 9.2, s: 0, t: 3, k: 'cutl',   c: '#b8c0cc', rol: 'Alta rotación / Menaje' },
  platos:      { id: 'platos',      n: 'Platos Londres',          e: '🍽️', p: 14000, costo: 8400, rot: 'Alta',      x: 7.0,  y: 4.6, s: 1, t: 0, k: 'plate',  c: '#e9eef7', rol: 'Pack Mesa (Producto Ancla)' },
  tazas:       { id: 'tazas',       n: 'Tazas de café',           e: '☕', p: 2000,  costo: 1200, rot: 'Alta',      x: 7.0,  y: 7.4, s: 1, t: 1, k: 'cup',    c: '#4f7fc4', rol: 'Pack Mesa (Antecedente)' },
  mantel:      { id: 'mantel',      n: 'Mantel de lino',          e: '🟫', p: 50000, costo: 20000,rot: 'Estancado', x: 15.4, y: 5.6, s: 2, t: 0, k: 'linen',  c: '#eee7da', rol: 'Regla secundaria' },
  canasta:     { id: 'canasta',     n: 'Canasta de mimbre',       e: '🧺', p: 35000, costo: 14000,rot: 'Estancado', x: 15.4, y: 7.8, s: 2, t: 1, k: 'basket', c: '#b07a3e', rol: 'Pack Mesa (Consecuente -15%)' },
  vela:        { id: 'vela',        n: 'Vela aromática',          e: '🕯️', p: 14000, costo: 5600, rot: 'Estancado', x: 15.4, y: 9.9, s: 2, t: 2, k: 'candle', c: '#e0a93a', rol: 'Estancado / Aromas' },
  retrato:     { id: 'retrato',     n: 'Portarretrato de madera', e: '🖼️', p: 10000, costo: 4000, rot: 'Estancado', x: 16.4, y: 2.4, s: 3, t: 0, k: 'frame',  c: '#6b4a2a', rol: 'Estancado / Decoración' },
  adorno:      { id: 'adorno',      n: 'Adorno de cerámica',      e: '🏺', p: 15000, costo: 6000, rot: 'Estancado', x: 18.4, y: 2.4, s: 3, t: 1, k: 'vase',   c: '#f4f1ea', rol: 'Estancado / Cerámica' }
};

const PROD = Object.values(P);
const ST = {};
const CAP = 5;

const PR = {
  tazas:  { txt: '2x1 en Tazas de café',    lab: '2x1',  prod: 'tazas',  type: '2x1' },
  mantel: { txt: '20% OFF Mantel de lino', lab: '-20%', prod: 'mantel', type: 'pct', v: 0.20 },
  vela:   { txt: '30% OFF Vela aromática', lab: '-30%', prod: 'vela',   type: 'pct', v: 0.30 }
};

/* ==========================================================================
   MOTOR GRÁFICO 3D ISOMÉTRICO MEJORADO
   ========================================================================== */
const cv = $('cv'), mainX = cv.getContext('2d');
let x = mainX;
const bg = document.createElement('canvas');
bg.width = cv.width; bg.height = cv.height;

const C = 0.866, S = 38, ZS = 34, OX = 520.7, OY = 150, WD = 20, DP = 14, WH = 3.7, LN = 12.5, QX = 10.5, QY = 3.0;

const cam = {
  current: 'general',
  zoom: 1.0,
  targetZoom: 1.0,
  ox: 0,
  targetOx: 0,
  oy: 0,
  targetOy: 0
};

function pj(a, b, z = 0) {
  const base_x = OX + (a - b) * C * S;
  const base_y = OY + (a + b) * 0.5 * S - z * ZS;
  return [
    cv.width * 0.5 + (base_x - cv.width * 0.5 + cam.ox) * cam.zoom,
    cv.height * 0.5 + (base_y - cv.height * 0.5 + cam.oy) * cam.zoom
  ];
}

function poly(pts, fill, stroke, lw) {
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

function box(x0, y0, x1, y1, z0, z1, ct, cr, cl) {
  poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], cr, 'rgba(0,0,0,0.22)');
  poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], cl, 'rgba(0,0,0,0.22)');
  poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], ct, 'rgba(255,255,255,0.25)');
}

function ell(a, b, rx, ry, f, s, lw = 1) {
  x.beginPath();
  x.ellipse(a, b, rx * cam.zoom, ry * cam.zoom, 0, 0, Math.PI * 2);
  if (f) { x.fillStyle = f; x.fill(); }
  if (s) { x.strokeStyle = s; x.lineWidth = lw * cam.zoom; x.stroke(); }
}

function cyl(a, b, r, h, f, t, s) {
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
const SP = {
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
const SH = [
  { i: 0, x0: 0,   y0: 1.2, x1: 1.2,  y1: 11.5, h: 2.2, face: 'x', tiers: [['plate', 9], ['glass', 11], ['napk', 8], ['cutl', 8]], top: ['vase', 'basket', 'vase', 'basket', 'vase'] },
  { i: 1, x0: 4.6, y0: 3.2, x1: 6.0,  y1: 10.8, h: 1.7, face: 'x', tiers: [['plate', 6], ['cup', 8], ['cutl', 5]], top: ['basket', 'vase', 'basket'] },
  { i: 2, x0: 13.0,y0: 4.2, x1: 14.4, y1: 11.0, h: 1.7, face: 'x', tiers: [['linen', 5], ['basket', 5], ['candle', 7]], top: ['vase', 'frame', 'vase'] },
  { i: 3, x0: 15.0,y0: 0,   x1: 19.8, y1: 1.2,  h: 2.2, face: 'y', tiers: [['frame', 6], ['vase', 6], ['candle', 7], ['linen', 5]], top: ['basket', 'vase', 'basket', 'vase'] }
];

function shelf(d) {
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

const LAMPS = [];
for (let i = 0; i <= 6; i++) LAMPS.push([0, 1 + i * 2, WH - 0.15]);
for (let i = 0; i <= 9; i++) LAMPS.push([1 + i * 2, 0, WH - 0.15]);
LAMPS.push([10.6, 1.5, 1.9], [3.2, 13.8, 2.8], [20, 12.5, 2.8]);
const PL = [[2.2, 0.7, 1], [13.7, 0.7, 1.1], [19.2, 2.8, 1], [6.2, 13.5, 1.2], [0.8, 12.9, 1.1], [19.2, 9.8, 1]];

function plant(px, py, k) {
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

function counter() {
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

function door(x0, y0, x1, y1, gl) {
  box(x0, y0, x1, y1, gl ? 2.65 : 0, 2.8, '#3b4a5c', '#27323f', '#303d4d');
  if (gl === 'y') poly([[x0 + 0.15, y1, 0.05], [x1 - 0.15, y1, 0.05], [x1 - 0.15, y1, 2.65], [x0 + 0.15, y1, 2.65]], 'rgba(170,215,240,0.18)', 'rgba(200,230,250,0.4)');
  else if (gl === 'x') poly([[x1, y0 + 0.15, 0.05], [x1, y1 - 0.15, 0.05], [x1, y1 - 0.15, 2.65], [x1, y0 + 0.15, 2.65]], 'rgba(170,215,240,0.18)', 'rgba(200,230,250,0.4)');
}

const DR = [
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
function person(px, py, o) {
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

const OUT = [
  { sh: '#e07a34', pa: '#26344d', sk: '#e8bf9a', hair: '#3a2418', long: 1, bag: '#1e9b67' },
  { sh: '#3f6aa3', pa: '#33333d', sk: '#c99a74', hair: '#1c1410', long: 0, bag: '#e07a34' },
  { sh: '#ba3859', pa: '#25252e', sk: '#f0cba8', hair: '#6a3a1c', long: 1, bag: '#3f6aa3' },
  { sh: '#33333d', pa: '#44536e', sk: '#a87a56', hair: '#111111', long: 0, bag: '#ba3859' },
  { sh: '#8347b8', pa: '#272730', sk: '#e8bf9a', hair: '#2a1810', long: 1, bag: '#d49e28' },
  { sh: '#d49e28', pa: '#35435e', sk: '#d9a981', hair: '#4a2a14', long: 0, bag: '#8347b8' },
  { sh: '#279883', pa: '#24242c', sk: '#b88862', hair: '#1a1210', long: 1, bag: '#e07a34' },
  { sh: '#a94834', pa: '#334257', sk: '#f0cba8', hair: '#8a5a2a', long: 0, bag: '#279883' }
];
const NAMES = ['Ana', 'Carlos', 'Lucía', 'Mateo', 'Sofía', 'Diego', 'Valeria', 'Juan (Flores)', 'Camila', 'Tomás', 'Paula', 'Martín'];

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
  x = bg.getContext('2d');
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
  
  x = mainX;
}

let AC = null, snd = false, mg = null, mt = null, mi = 0;
function ac() {
  if (!AC && typeof AudioContext !== 'undefined') {
    AC = new AudioContext();
    mg = AC.createGain(); mg.gain.value = 0.55; mg.connect(AC.destination);
  }
  if (AC && AC.resume) AC.resume();
  return AC;
}
function tone(f, d, ty, v, t) {
  if (!snd || !AC) return;
  const o = AC.createOscillator(), g = AC.createGain(), s = AC.currentTime + (t || 0);
  o.type = ty || 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(0, s);
  g.gain.linearRampToValueAtTime(v || 0.1, s + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, s + d);
  o.connect(g); g.connect(mg);
  o.start(s); o.stop(s + d + 0.05);
}
const sfx = {
  cash() { tone(1318, 0.35, 'triangle', 0.12); tone(1760, 0.5, 'triangle', 0.1, 0.09); tone(180, 0.1, 'square', 0.05); },
  door() { tone(784, 0.25, 'sine', 0.09); tone(1047, 0.4, 'sine', 0.09, 0.18); },
  pick() { tone(520, 0.07, 'triangle', 0.06); },
  bell() { tone(660, 0.3, 'sine', 0.07); }
};
const CH = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]];
function music(on) {
  clearInterval(mt);
  if (on) mt = setInterval(() => {
    const c = CH[Math.floor(mi / 8) % 4], n = c[[0, 1, 2, 1, 0, 2, 1, 2][mi % 8]];
    tone(n * 2, 0.5, 'triangle', 0.03);
    if (mi % 4 === 0) tone(c[0] / 2, 0.9, 'sine', 0.06);
    mi++;
  }, 330);
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

const PROF = {
  normal:  { ic: '🛒', nm: 'Comprador Mesa', sp: 1.0,  pat: 22, dw: 1.3 },
  apurado: { ic: '⚡', nm: 'Paso Rápido',    sp: 1.45, pat: 9,  dw: 0.6 },
  curioso: { ic: '🔍', nm: 'Mirón / Bazar',  sp: 0.8,  pat: 34, dw: 2.2 },
  ofertas: { ic: '🏷️', nm: 'Caza Promos',    sp: 1.1,  pat: 26, dw: 1.4 }
};

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

const KIDS = ['Nico', 'Mía', 'Lola', 'Bruno'];
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
  x = mainX;
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
  
  $('kRevenue').textContent = fm(S2.inc);
  $('kMargin').textContent = fm(S2.margin || 0);
  $('kSales').textContent = S2.n;
  $('kCombo').textContent = S2.combo;
  $('kBasket').textContent = S2.can;
  
  const convRate = S2.visits ? (100 * S2.n / S2.visits).toFixed(1) : '0.0';
  $('kConversion').textContent = 'Conversión: ' + convRate + '%';
  const marginPct = S2.inc > 0 ? (100 * S2.margin / S2.inc).toFixed(1) : '0.0';
  $('kMarginPct').textContent = 'Margen medio: ' + marginPct + '%';
  
  $('cls').innerHTML = leaders().slice(0, 7).map(c => {
    const s = stTxt(c);
    return `<div class="cl">
      <span class="dot" style="background:${s[1]}"></span>
      <div class="cl-info">
        <div class="cl-name">${c.name} ${PROF[c.prof].ic} ${c.fam || ''} <span style="font-size:10px;color:var(--mu)">(${PROF[c.prof].nm})</span></div>
        <div class="cl-sub">${s[0]} ${c.cart.join('')}</div>
      </div>
      <div class="cl-total">${c.tot ? fm(c.tot) : '—'}</div>
    </div>`;
  }).join('') || '<div class="sub" style="padding:8px">Sin clientes en este instante…</div>';
  
  $('lg').innerHTML = LOG.slice(0, 16).map(l => `<div><span>${l.t}</span><span>${l.m}</span><span>${l.v}</span></div>`).join('');
  
  $('vL').textContent = $('sL').value;
  $('vC').textContent = (+ $('sC').value).toFixed(1);
  $('vB').textContent = $('sB').value;
  $('vS').textContent = spd().toFixed(1);
  
  renderProductChart();
}

function renderProductChart() {
  const el = $('productChart');
  if (!el) return;
  const keys = Object.keys(P);
  const vals = keys.map(k => S2.byUnits && S2.byUnits[k] || 0);
  const max = Math.max(1, ...vals);
  el.innerHTML = keys.map((k, i) => `
    <div class="barcol">
      <div class="barval">${vals[i]}</div>
      <div class="bar" style="height:${Math.max(3, vals[i] / max * 100)}%" title="${P[k].n}: ${vals[i]} u."></div>
      <div class="barlabel">${P[k].e}<br>${P[k].n.split(' ')[0]}</div>
    </div>
  `).join('');
}

function runMonteCarlo() {
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
  const diffMean = meanB - meanA;
  const winRate = (winsB / n_sim) * 100;
  
  $('mcMeanA').textContent = fm(meanA);
  $('mcMeanB').textContent = fm(meanB);
  $('mcDiff').textContent = '+' + fm(diffMean);
  $('mcWin').textContent = winRate.toFixed(1) + '%';
  
  drawMCHistogram(histDiff, diffMean);
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

function renderCatalog() {
  const tbody = $('catalogTbody');
  if (!tbody) return;
  tbody.innerHTML = PROD.map(p => {
    const margenBase = p.rot === 'Alta' ? '40%' : '60%';
    const tagClass = p.rot === 'Alta' ? 'tag-high' : 'tag-low';
    return `
      <tr>
        <td>${p.e} <b>${p.id}</b></td>
        <td>${p.n}</td>
        <td><span class="tag-rot ${tagClass}">${p.rot}</span></td>
        <td style="color:#fff;font-weight:bold">${fm(p.p)}</td>
        <td style="color:var(--mu)">${fm(p.costo)}</td>
        <td>${margenBase}</td>
        <td style="font-size:11px;color:var(--gold)">${p.rol}</td>
      </tr>
    `;
  }).join('');
}

const crispData = [
  { t: "1. Comprensión del Negocio (Business Understanding) — Secciones 2, 3 y 4", d: "Definición de la problemática central y formulación de hipótesis de trabajo: ciertos antecedentes de alta rotación aumentan la probabilidad de compra de productos estancados (lift > 1) sin destruir el margen de ganancia comercial." },
  { t: "2. Comprensión de los Datos (Data Understanding) — Secciones 5 y 7", d: "Dataset transaccional sintético (615 registros iniciales, 188 tickets, 90 días, semilla 42). Análisis EDA con 6 gráficos. 70,2% alta rotación / 29,8% baja rotación. Precios reales relevados en comercios de Perico." },
  { t: "3. Preparación de los Datos (Data Preparation) — Sección 6", d: "Depuración de 14 duplicados exactos y 19 nulos imputados con mediana ($9.325,42). Total final consolidado: 601 registros. Corrección del bug de clasificación 'tipo_producto'. Construcción de matriz de tickets binaria (188 tickets × 10 productos)." },
  { t: "4. Modelado (Apriori Algorithm) — Sección 8", d: "Algoritmo Apriori con min_support = 0,02 (4 tickets) y min_confidence = 0,20. Generación de 111 itemsets frecuentes y 240 reglas. Filtrado del antecedente (≥3 productos alta rotación) hacia consecuente estancado." },
  { t: "5. Evaluación (Evaluation, Bootstrap y Sensibilidad) — Secciones 9 y 10", d: "Identificación de 4 combos objetivo. Análisis con 5 métricas (Soporte 2,13%, Confianza 57,1%, Lift 3,47, Leverage 0,0151, Conviction 1,95). Validación de estabilidad por Bootstrap (500 remuestreos, regla estable en 56,4%) y simulación Monte Carlo (10.000 iteraciones)." },
  { t: "6. Despliegue (Deployment & Plan Piloto) — Sección 11", d: "Diseño de prueba piloto controlada de 2 a 4 semanas con 4 KPIs verificables. Implementación del 'Pack Mesa Completa' ($47.750) y propuesta de reorganización física de layout en góndola." }
];

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

$('clearLog').onclick = () => { $('lg').innerHTML = ''; LOG = []; };
$('btnRunMC').onclick = runMonteCarlo;
$('calcDescRange').oninput = updateComboCalculator;

$('go').onclick = () => run = true;
$('pa').onclick = () => run = false;
$('re').onclick = () => { reset(); run = true; };
$('so').onclick = () => {
  if (!snd) {
    if (!ac()) return;
    snd = true; music(true);
    $('so').textContent = '🔊 Sonido: SÍ';
  } else {
    snd = false; music(false);
    $('so').textContent = '🔊 Sonido: NO';
  }
};

['sL', 'sC', 'sB', 'sS', 'sP'].forEach(id => $(id).oninput = ui);

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

bgDraw();
reset();
renderCatalog();
updateComboCalculator();
runMonteCarlo();
spawn();
requestAnimationFrame(loop);

return () => {
  stopped = true;
  window.removeEventListener('keydown', onKey);
  try { music(false); if (AC && AC.close) AC.close(); } catch (e) {}
  delete window.__bazarCloseMenu;
};
}
