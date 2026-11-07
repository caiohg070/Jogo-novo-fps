'use strict';
// ================= efeitos =================
function radialTex(soft = false) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(soft ? 0.6 : 0.4, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const dotTex = radialTex(), softTex = radialTex(true);
const parts = [];
for (let i = 0; i < 140; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, transparent: true, depthWrite: false }));
  s.visible = false; scene.add(s); parts.push({ s, life: 0, max: 1, vel: new V3(), grow: 0, size: 1, grav: 2 });
}
let partIdx = 0;
function spawnPart(pos, color, size, life, vel, additive = false, grow = 0, grav = 2) {
  const p = parts[partIdx++ % parts.length];
  p.s.position.copy(pos); p.s.scale.setScalar(size); p.s.visible = true;
  p.s.material.color.set(color); p.s.material.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
  p.s.material.opacity = 1; p.life = p.max = life; p.vel.copy(vel); p.grow = grow; p.size = size; p.grav = grav;
}
function updateParts(dt) {
  for (const p of parts) {
    if (p.life <= 0) continue;
    p.life -= dt;
    if (p.life <= 0) { p.s.visible = false; continue; }
    p.s.position.addScaledVector(p.vel, dt); p.vel.y -= p.grav * dt;
    const t = p.life / p.max; p.s.material.opacity = t;
    p.s.scale.setScalar(p.size + p.grow * (1 - t));
  }
}
const tracers = [];
for (let i = 0; i < 40; i++) {
  const g = new THREE.BufferGeometry().setFromPoints([new V3(), new V3()]);
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffd894, transparent: true, opacity: 0.9, depthWrite: false }));
  l.visible = false; l.frustumCulled = false; scene.add(l); tracers.push({ l, life: 0 });
}
let trIdx = 0;
function tracer(a, b, color = 0xffd894, life = 0.07) {
  const t = tracers[trIdx++ % tracers.length], p = t.l.geometry.attributes.position;
  p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true;
  t.l.material.color.set(color); t.l.visible = true; t.life = life;
}
function impact(p) { for (let i = 0; i < 3; i++) spawnPart(p, 0xb9a88a, 0.25, rand(0.35, 0.6), new V3(rand(-1, 1), rand(0.5, 1.6), rand(-1, 1)), false, 0.5); }
function blood(p) { for (let i = 0; i < 4; i++) spawnPart(p, 0x8a0f0a, 0.22, rand(0.3, 0.5), new V3(rand(-1.5, 1.5), rand(0.2, 1.5), rand(-1.5, 1.5)), false, 0.15); }
const boomLight = new THREE.PointLight(0xffffff, 0, 30, 1.5); scene.add(boomLight);
const muzzleLights = [0, 1].map(() => { const l = new THREE.PointLight(0xffb45a, 0, 7, 2); scene.add(l); return { l, t: 0 }; });
let mlIdx = 0;
function muzzleFlashLight(p) { const m = muzzleLights[mlIdx++ % 2]; m.l.position.copy(p); m.t = 0.05; }
let shakeT = 0;

// ---------- som provisório (sintetizado; ElevenLabs entra depois) ----------
// configurações do jogador (volume e controles de toque), salvas no aparelho
const cfg = { vol: 80, size: 100, op: 20, h: 64 };
try { Object.assign(cfg, JSON.parse(localStorage.getItem('tatico.cfg')) || {}); } catch {}
function applyCfg() {
  const R = document.documentElement.style;
  R.setProperty('--ctl-s', cfg.size / 100); R.setProperty('--ctl-op', cfg.op / 100); R.setProperty('--ctl-op2', Math.min(1, cfg.op / 100 + 0.22)); R.setProperty('--ctl-y', cfg.h + '%');
  if (masterOut) masterOut.gain.value = cfg.vol / 100;
}
let actx = null, noiseBuf = null, rainGain = null, masterOut = null;
const SFX = {};
// toca um som real; longe = mais baixo e abafado; pequena variação de tom para não cansar
function sfx(name, v, opts = {}) {
  if (!actx || !SFX[name] || v <= 0.01) return false;
  const src = actx.createBufferSource(); src.buffer = SFX[name];
  src.playbackRate.value = (opts.rate ?? 1) * (1 + rand(-0.04, 0.04));
  const g = actx.createGain(); g.gain.value = v;
  let node = src;
  if (opts.muffle) { const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.muffle; node.connect(f); node = f; }
  if (opts.pan && actx.createStereoPanner) { const pn = actx.createStereoPanner(); pn.pan.value = opts.pan; node.connect(pn); node = pn; }
  node.connect(g).connect(masterOut);
  src.start(0, 0, opts.dur); return true;
}
// som posicional: fonte à direita do jogador toca mais no fone/alto-falante direito
const panOf = p => (p && player ? clamp((p.x - player.pos.x) / 14, -0.8, 0.8) : 0);
const SND_GAIN = { m4: 5 };   // m4.mp3 foi gravado ~16 dB mais baixo que os outros tiros
const WSND = { ak: 'ak', m4: 'm4', awp: 'awp', deagle: 'deagle', pistol: 'pistola' };
function initAudio() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    masterOut = actx.createGain(); masterOut.gain.value = cfg.vol / 100; masterOut.connect(actx.destination);
    noiseBuf = actx.createBuffer(1, actx.sampleRate * 1, actx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    rainGain = actx.createGain(); rainGain.gain.value = 0; rainGain.connect(masterOut);
    // sons reais (ElevenLabs), decodificados uma vez
    for (const [k, url] of Object.entries(window.SONS || {})) {
      const bin = atob(url.split(',')[1]), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      actx.decodeAudioData(u8.buffer).then(buf => {
        SFX[k] = buf;
        if (k === 'chuva') { const src = actx.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(rainGain); src.start(); }
      }).catch(() => {});
    }
  } catch { actx = null; }
}
function noise(dur, vol, type, freq, when = 0) {
  const t = actx.currentTime + when, src = actx.createBufferSource(); src.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = actx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(masterOut); src.start(t); src.stop(t + dur + 0.02);
}
function tone(f0, f1, dur, vol, type = 'sine') {
  const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(masterOut); o.start(t); o.stop(t + dur + 0.02);
}
const vol = d => clamp(1 - d / 50, 0, 1);
const pings = [];
function addPing(x, z, kind) { pings.push({ x, z, kind, t: kind === 'shot' ? 1.4 : 0.7 }); if (pings.length > 40) pings.shift(); }
function shotSound(w, d, id, pos) { if (!actx) return; const v = vol(d); if (sfx(WSND[id], 0.85 * v * (SND_GAIN[id] || 1), { muffle: lerp(1200, 20000, v * v), dur: id === 'awp' ? 2 : 1.1, pan: panOf(pos) })) return; if (v <= 0.02) return; noise(w.scope ? 0.4 : 0.16, w.snd[2] * v, 'lowpass', lerp(700, w.snd[0], v)); tone(w.snd[1], 40, w.scope ? 0.25 : 0.12, 0.45 * v); }
function blip(freq, dur = 0.05, v = 0.15) { if (actx) tone(freq, freq, dur, v, 'square'); }
function whoosh(d, knife, pos) { if (knife && sfx('faca', 0.7 * clamp(1 - d / 20, 0, 1), { dur: 0.6, pan: panOf(pos) })) return; if (actx) noise(0.12, 0.25 * clamp(1 - d / 20, 0, 1), 'highpass', 2500); }
function bang(d, deafen, pos) {
  if (!actx) return;
  const v = clamp(1 - d / 60, 0.1, 1);
  if (!sfx('flash', v, { pan: panOf(pos) })) { noise(0.5, 0.9 * v, 'lowpass', 5000); tone(90, 30, 0.4, 0.8 * v); }
  if (deafen > 0) tone(3600, 3400, deafen, 0.12, 'sine');
}
function boom(d, pos) { if (!actx) return; const v = clamp(1 - d / 70, 0.1, 1); if (sfx('explosao', v, { muffle: lerp(1500, 20000, v), pan: panOf(pos) * 0.6 })) return; noise(1.0, 1.0 * v, 'lowpass', 900); tone(70, 25, 0.8, 0.9 * v); }
// sons sintetizados que faltavam (sem gastar créditos): bala no concreto/ricochete, pino da granada, alicate do desarme
// pequena destruição: marca de tiro (buraco escuro) + lascas da cor da parede; some quando a parede some
const chips = [], chipGeo = new THREE.BoxGeometry(1, 1, 1);
const debris = [], CHIP_LIFE = 8;   // marcas e lascas duram ~8 s e somem aos poucos
function clearChips() { for (const c of chips) c.parent?.remove(c); chips.length = 0; for (const d of debris) scene.remove(d.m); debris.length = 0; }
function updateChips(dt) {
  for (let i = chips.length - 1; i >= 0; i--) if (now - chips[i].userData.t > CHIP_LIFE) { chips[i].parent?.remove(chips[i]); chips.splice(i, 1); }
  for (let i = debris.length - 1; i >= 0; i--) {
    const d = debris[i], age = now - d.t, m = d.m;
    if (age > CHIP_LIFE) { scene.remove(m); debris.splice(i, 1); continue; }
    if (!d.rest) {
      d.v.y -= 12 * dt; m.position.addScaledVector(d.v, dt); m.rotation.x += d.spin * dt; m.rotation.z += d.spin * dt;
      const gy = groundAt(m.position.x, m.position.z, m.position.y + 0.3) + 0.02;
      if (m.position.y <= gy) { m.position.y = gy; d.rest = true; }
    }
    m.material.opacity = clamp((CHIP_LIFE - age) / 1.5, 0, 1);
  }
}
function wallChip(hit) {
  if (!hit || !hit.face) return;
  const m = hit.object; if (m.userData.veh || !m.parent || m.geometry !== boxGeo) return;
  const n = hit.face.normal, col = m.material.color;
  const wn = n.clone().transformDirection(m.matrixWorld);
  for (let i = 0; i < 4; i++) {                                    // lascas: caem e ficam no chão por ~8 s
    const dm = new THREE.Mesh(chipGeo, new THREE.MeshStandardMaterial({ color: col.getHex(), roughness: 0.9, transparent: true }));
    const k = rand(0.08, 0.15); dm.scale.set(k, k * rand(0.4, 0.8), k); dm.position.copy(hit.point).addScaledVector(wn, 0.06); scene.add(dm);
    debris.push({ m: dm, t: now, rest: false, spin: rand(-8, 8), v: wn.clone().multiplyScalar(rand(1, 2.5)).add(new V3(rand(-0.8, 0.8), rand(0.5, 2), rand(-0.8, 0.8))) });
  }
  if (debris.length > 300) scene.remove(debris.shift().m);
  const mat = new THREE.MeshBasicMaterial({ color: 0x2a221b, transparent: true, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const c = new THREE.Mesh(chipGeo, mat), sz = rand(0.09, 0.15), sc = m.scale;
  const local = m.worldToLocal(hit.point.clone()); local.addScaledVector(n, 0.004 / Math.max(Math.abs(n.x) * sc.x, Math.abs(n.y) * sc.y, Math.abs(n.z) * sc.z));
  c.position.copy(local);
  c.scale.set((Math.abs(n.x) > 0.5 ? 0.01 : sz) / sc.x, (Math.abs(n.y) > 0.5 ? 0.01 : sz) / sc.y, (Math.abs(n.z) > 0.5 ? 0.01 : sz) / sc.z);
  c.userData.t = now;
  c.onBeforeRender = () => { mat.opacity = 0.8 * clamp((CHIP_LIFE - (now - c.userData.t)) / 1.5, 0, 1) * (m.material.transparent ? m.material.opacity : 1); };
  m.add(c); chips.push(c);
  if (chips.length > 220) { const o = chips.shift(); o.parent?.remove(o); }
}
function bulletHit(p) {
  impact(p);
  if (!actx || !player) return;
  const d = player.pos.distanceTo(p); if (d > 14) return;
  const v = 1 - d / 14;
  noise(0.05, 0.14 * v, 'bandpass', rand(1800, 3200));
  if (Math.random() < 0.18) tone(rand(2600, 3600), rand(800, 1300), 0.22, 0.035 * v);
}
function pinPull(d) { if (!actx || d > 12) return; const v = 1 - d / 12; tone(2600, 2200, 0.04, 0.06 * v, 'triangle'); tone(3400, 3300, 0.07, 0.035 * v); noise(0.03, 0.08 * v, 'highpass', 5000, 0.05); }
function snip(d) { if (!actx) return; const v = vol(d * 1.5); if (v <= 0.02) return; noise(0.03, 0.2 * v, 'highpass', 3500); tone(1500, 700, 0.04, 0.05 * v, 'square'); }
function hiss(d, pos) { if (sfx('smoke', 0.6 * vol(d), { pan: panOf(pos) })) return; if (actx) noise(1.2, 0.25 * vol(d), 'highpass', 1800); }

