/* Geometría de la tienda y cámara compartida entre el motor y el dibujo. */
export const C = 0.866, S = 38, ZS = 34, OX = 520.7, OY = 150, WD = 20, DP = 14, WH = 3.7, LN = 12.5, QX = 10.5, QY = 3.0;

export const cam = {
  current: 'general',
  zoom: 1.0,
  targetZoom: 1.0,
  ox: 0,
  targetOx: 0,
  oy: 0,
  targetOy: 0
};
