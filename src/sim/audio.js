/* Sonido sintetizado con Web Audio (sin archivos). El navegador exige un clic del usuario para activarlo. */
export function createAudio() {
  let AC = null, mg = null, mt = null, mi = 0, enabled = false;
  function ac() {
    if (!AC && typeof AudioContext !== 'undefined') {
      AC = new AudioContext();
      mg = AC.createGain(); mg.gain.value = 0.55; mg.connect(AC.destination);
    }
    if (AC && AC.resume) AC.resume();
    return AC;
  }
  function tone(f, d, ty, v, t) {
    if (!enabled || !AC) return;
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
  return {
    sfx,
    get enabled() { return enabled; },
    enable() { if (!ac()) return false; enabled = true; music(true); return true; },
    disable() { enabled = false; music(false); },
    close() { try { music(false); if (AC && AC.close) AC.close(); } catch (e) { /* noop */ } }
  };
}
