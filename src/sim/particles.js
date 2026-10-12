import { cam } from './constants';

/* Textos flotantes (+$, PACK MESA) que suben y se desvanecen sobre el canvas. */
let particles = [];

export function clearParticles() { particles = []; }
export function addParticle(text, x, y, color = '#ffd54f') {
  particles.push({ text, x, y, alpha: 1.0, vy: -1.2, color });
}
export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.y += p.vy;
    p.alpha -= dt * 0.75;
    if (p.alpha <= 0) particles.splice(i, 1);
  }
}
export function drawParticles(x) {
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
