'use strict';
// ================= física e visão =================
function groundAt(x, z, y) {
  let g = terrainHeight(x, z);
  for (const s of surfaces) {
    if (x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1) { const h = s.h(x, z); if (h <= y + 0.55 && h > g) g = h; }
  }
  return g;
}
function collide(pos, r, y) {
  for (let pass = 0; pass < 2; pass++) for (const c of colliders) {
    if (c.y1 < y + 0.35 || c.y0 > y + 1.7) continue;
    const cx = clamp(pos.x, c.x0, c.x1), cz = clamp(pos.z, c.z0, c.z1);
    const dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
    if (d2 >= r * r) continue;
    if (d2 > 1e-8) { const d = Math.sqrt(d2); pos.x = cx + (dx / d) * r; pos.z = cz + (dz / d) * r; }
    else {
      const l = pos.x - c.x0, rr = c.x1 - pos.x, t = pos.z - c.z0, b = c.z1 - pos.z, m = Math.min(l, rr, t, b);
      if (m === l) pos.x = c.x0 - r; else if (m === rr) pos.x = c.x1 + r; else if (m === t) pos.z = c.z0 - r; else pos.z = c.z1 + r;
    }
  }
  pos.x = clamp(pos.x, -MAP + 2, MAP - 2); pos.z = clamp(pos.z, -MAP + 2, MAP - 2);
}
const ray = new THREE.Raycaster();
function terrainBlocks(a, b) {
  const d = a.distanceTo(b), n = Math.ceil(d / 0.5);
  for (let i = 1; i < n; i++) {
    const t = i / n, x = lerp(a.x, b.x, t), y = lerp(a.y, b.y, t), z = lerp(a.z, b.z, t);
    if (terrainHeight(x, z) > y + 0.3) return t * d;
  }
  return Infinity;
}
const _d = new V3();
let hitProp = null;
function hurtProp(m, dmg, by) {
  if (!m || !m.parent) return;
  if (m.userData.veh) { vehDamage(m.userData.veh, dmg, by); return; }
  m.userData.hp -= dmg;
  if (m.userData.hp > 0) return;
  const c = m.userData.col; const P = m.getWorldPosition(new V3());
  if (m.userData.door) m.userData.door.broken = true;
  m.parent.remove(m); solids.splice(solids.indexOf(m), 1); const ci = colliders.indexOf(c); if (ci >= 0) colliders.splice(ci, 1);
  const fi = fadeables.indexOf(m); if (fi >= 0) fadeables.splice(fi, 1);
  for (let i = 0; i < 10; i++) spawnPart(P, m.userData.chip ?? 0x8f6c40, rand(0.2, 0.4), rand(0.5, 1), new V3(rand(-3, 3), rand(1, 4), rand(-3, 3)), false, 0.2, 8);
  if (actx) {
    const v = vol(player.pos.distanceTo(P));
    noise(0.35, 0.3 * v, 'lowpass', 1400); tone(160, 70, 0.18, 0.15 * v, 'triangle');
    for (let i = 0; i < 4; i++) noise(0.06, 0.22 * v, 'bandpass', rand(900, 2200), i * 0.06 + rand(0, 0.03));
  }
  navRefresh(c);
  if (c) dropStacked(c);
  buildMinimap();
}
// caixote quebrou: o que estava em cima cai até o chão/caixote de baixo (não fica flutuando)
const falling = [];
function dropStacked(c) {
  for (const o of solids) {
    const k = o.userData.col;
    if (!o.userData.crate || !k || k === c || Math.abs(k.y0 - c.y1) > 0.05 || k.x1 <= c.x0 || k.x0 >= c.x1 || k.z1 <= c.z0 || k.z0 >= c.z1) continue;
    if (falling.some(f => f.m === o)) continue;
    let floor = Math.max(c.y0, terrainHeight((k.x0 + k.x1) / 2, (k.z0 + k.z1) / 2) - 0.06);   // apoio: topo de outro collider embaixo (ou a base do que quebrou)
    for (const q of colliders) if (q !== k && q.y1 <= k.y0 + 0.01 && q.y1 > floor && q.x1 > k.x0 && q.x0 < k.x1 && q.z1 > k.z0 && q.z0 < k.z1) floor = q.y1;
    falling.push({ m: o, k, to: floor, v: 0 });
  }
}
function updateFalling(dt) {
  for (let i = falling.length - 1; i >= 0; i--) {
    const f = falling[i], { m, k } = f;
    if (!m.parent) { falling.splice(i, 1); continue; }
    f.v += 18 * dt; let d = f.v * dt;
    const done = k.y0 - d <= f.to; if (done) d = k.y0 - f.to;
    k.y0 -= d; k.y1 -= d; m.position.y -= d;
    if (done) { falling.splice(i, 1); navRefresh(k); dropStacked({ ...k, y1: k.y1 + d }); thud(m); }
  }
}
function thud(m) { if (actx) { const v = vol(player.pos.distanceTo(m.position)); tone(110, 55, 0.15, 0.2 * v, 'triangle'); noise(0.12, 0.15 * v, 'lowpass', 600); } }
// tiro/mira sem alvo acompanha o relevo: sobe nos morros e desce nas partes baixas (em trechos de 1,5 m)
function groundShot(o, dx, dz, range, shooter) {
  const onGround = Math.abs(shooter.y - terrainHeight(shooter.pos.x, shooter.pos.z)) < 0.35, base = o.y - shooter.y;
  const yAt = (x, z) => onGround ? Math.max(terrainHeight(x, z) + base, o.y - 4) : Math.max(o.y, terrainHeight(x, z) + base);
  let a = o.clone(), d = 0; const STEP = 1.5;
  while (d < range) {
    const n = Math.min(range, d + STEP), x = o.x + dx * n, z = o.z + dz * n, b = new V3(x, yAt(x, z), z);
    const h = firstHit(a, b); if (h < Infinity) { const seg = a.distanceTo(b); return { dist: d + (n - d) * h / seg, end: a.clone().lerp(b, h / seg) }; }
    a = b; d = n;
  }
  hitProp = null; return { dist: Infinity, end: a };
}
let lastHit = null;
function firstHit(a, b) {
  _d.subVectors(b, a); const dist = _d.length(); if (dist < 1e-4) return Infinity; _d.divideScalar(dist);
  ray.set(a, _d); ray.far = dist;
  const h = ray.intersectObjects(solids, false); lastHit = h[0] || null;
  hitProp = h.length && h[0].object.userData.hp ? h[0].object : null;
  return Math.min(h.length ? h[0].distance : Infinity, terrainBlocks(a, b));
}
// tiro em 3 trechos: perto de quem atira e perto do alvo corre na horizontal, na altura do peito de cada um
function shotBlock(o, P) {
  const hx = P.x - o.x, hz = P.z - o.z, hl = Math.hypot(hx, hz);
  if (hl < 0.01) return Infinity;
  const up = o.y - P.y > 1.5, k = Math.min(up ? 2.2 : 1.5, hl * (up ? 0.5 : 0.4)) / hl;
  const A = new V3(o.x + hx * k, o.y, o.z + hz * k), B = new V3(P.x - hx * k, P.y, P.z - hz * k);
  const dA = o.distanceTo(A), dAB = A.distanceTo(B);
  let h = firstHit(o, A); if (h < Infinity) return h;
  h = firstHit(A, B); if (h < Infinity) return dA + h;
  h = firstHit(B, P); return h < Infinity ? dA + dAB + h : Infinity;
}
const smokes = [];
function smokeBlocks(a, b) {
  for (const s of smokes) {
    if (s.age < 0.8 || s.life < 1) continue;
    const ab = new V3().subVectors(b, a), t = clamp(new V3().subVectors(s.pos, a).dot(ab) / ab.lengthSq(), 0, 1);
    if (a.clone().addScaledVector(ab, t).distanceTo(s.pos) < s.r * 0.9) return true;
  }
  return false;
}
const eye = (s, h = 1.5) => new V3(s.pos.x, s.y + h, s.pos.z);
// mato alto: quem está dentro, parado ou sem atirar há 1,5 s, só é visto de perto (vale para todos; não é a roupa)
const inBush = s => !s.veh && bushes.some(k => Math.hypot(s.pos.x - k.x, s.pos.z - k.z) < k.r && s.y < k.y + 0.6);
const bushHidden = (t, from) => inBush(t) && now - t.lastShot > 1.5 && Math.hypot(t.pos.x - from.pos.x, t.pos.z - from.pos.z) > 3.5;
const los = (a, b) => { if (bushHidden(b, a)) return false; const A = eye(a), B = eye(b); return !smokeBlocks(A, B) && firstHit(A, B) === Infinity; };
// no alto (terraço/escada) quem atira se inclina por cima da mureta; o alvo no alto só expõe a cabeça quando está atirando
// quem usa a metralhadora fixa atira por cima dos sacos de areia (e fica com a cabeça exposta)
const lean = (a, b) => (a.y - b.y > 1.5 ? 0.45 : 0) + (a.turret ? 0.5 : 0);
const onTerrace = t => t.y > H1 - 0.3 && t.pos.x > HOUSE.x0 && t.pos.x < HOUSE.x1 && t.pos.z > HOUSE.z0 && t.pos.z < HOUSE.z1;
const nearEdge = t => Math.min(t.pos.x - HOUSE.x0, HOUSE.x1 - t.pos.x, t.pos.z - HOUSE.z0, HOUSE.z1 - t.pos.z) < 1.3;
const peek = (t, from) => (t.y - from.y > 1.5 && onTerrace(t) && nearEdge(t) ? (now - t.lastShot < 0.7 ? 0.3 : -0.3) : 0);
function aimPoint(t, x, z, from) { const hi = from && t.y - from.y > 1.5 && !onTerrace(t); return new V3(x ?? t.pos.x, t.y + SHOT_H + (t.turret ? 0.45 : 0) + (t.downed ? -0.6 : 0) + (from ? peek(t, from) : 0) + (hi ? rand(0.1, 0.5) : rand(-0.05, 0.1)), z ?? t.pos.z); }
const canShoot = (a, b) => shotBlock(eye(a, SHOT_H + lean(a, b)), aimPoint(b, null, null, a)) === Infinity;

