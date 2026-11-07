'use strict';
// ---------- veículos: quadriciclo (rápido, frágil) e jipe (mais resistente) ----------
// joystick/WASD aponta para onde ir; o veículo vira e acelera nessa direção. Atropelar inimigo causa dano. Tiro e explosão estragam; com 0 explode.
const VEH = {
  quad: { name: 'Quadriciclo', r: 0.95, hp: 260, max: 13, acc: 10, turn: 2.8, seat: 0.45 },
  jeep: { name: 'Jipe', r: 1.4, hp: 520, max: 15, acc: 7.5, turn: 2.0, seat: 0.7 },
};
const vehicles = [];
function buildVehicle(type, V) {
  const g = new THREE.Group(), tilt = new THREE.Group(); g.add(tilt); scene.add(g);
  const part = (sx, sy, sz, x, y, z, c, solid, o = {}) => {
    const m = new THREE.Mesh(boxGeo, stdMat(c, o)); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; tilt.add(m);
    if (solid) { m.userData.hp = 1; m.userData.veh = V; solids.push(m); V.solids.push(m); }
    V.parts.push(m); return m;
  };
  const wheels = [];
  const wheel = (x, y, z, r, w) => { const m = new THREE.Mesh(cylGeo, stdMat(0x1c1a17)); m.scale.set(r, w, r); m.rotation.z = Math.PI / 2; m.position.set(x, y, z); m.castShadow = true; tilt.add(m); wheels.push(m); V.parts.push(m); };
  if (type === 'quad') {
    part(0.8, 0.32, 1.5, 0, 0.6, 0, 0x6a7a3a, true, { rough: 0.6, metal: 0.2 });
    part(0.5, 0.14, 0.6, 0, 0.82, -0.15, 0x222222);
    part(0.9, 0.08, 0.5, 0, 0.82, 0.62, 0x5a6a30);
    part(0.9, 0.08, 0.45, 0, 0.82, -0.62, 0x5a6a30);
    part(0.06, 0.4, 0.06, 0, 0.95, 0.42, 0x222222); part(0.7, 0.05, 0.05, 0, 1.15, 0.42, 0x222222);
    part(0.12, 0.08, 0.04, 0, 0.7, 0.76, 0xfff2c0, false, { rough: 0.2 });
    for (const sx of [-0.52, 0.52]) for (const sz of [-0.55, 0.55]) wheel(sx, 0.32, sz, 0.32, 0.26);
  } else {
    part(1.7, 0.55, 3.3, 0, 0.8, 0, 0x55603d, true, { rough: 0.7, metal: 0.2 });
    part(1.6, 0.25, 1.1, 0, 1.18, 1.05, 0x4c5636, true);
    part(1.6, 0.5, 0.06, 0, 1.55, 0.45, 0x88a0a8, false, { rough: 0.1, metal: 0.3 });
    part(0.6, 0.45, 0.5, -0.4, 1.25, -0.2, 0x2a2622); part(0.6, 0.45, 0.5, 0.4, 1.25, -0.2, 0x2a2622);
    part(0.06, 0.9, 0.06, -0.78, 1.5, -0.7, 0x222222); part(0.06, 0.9, 0.06, 0.78, 1.5, -0.7, 0x222222); part(1.6, 0.06, 0.06, 0, 1.95, -0.7, 0x222222);
    part(0.5, 0.5, 0.2, 0, 1.1, -1.75, 0x1c1a17);
    for (const sx of [-0.55, 0.55]) part(0.2, 0.1, 0.04, sx, 0.95, 1.66, 0xfff2c0, false, { rough: 0.2 });
    for (const sx of [-0.88, 0.88]) for (const sz of [-1.1, 1.1]) wheel(sx, 0.45, sz, 0.45, 0.32);
  }
  return { g, tilt, wheels };
}
class Vehicle {
  constructor(type, x, z, ang) {
    this.type = type; this.def = VEH[type]; this.home = [x, z, ang]; this.solids = []; this.parts = [];
    this.mesh = buildVehicle(type, this); this.pos = new V3(); this.reset();
  }
  reset() {
    const [x, z, ang] = this.home;
    this.pos.set(x, 0, z); this.y = terrainHeight(x, z); this.vy = 0; this.ang = ang; this.v = 0; this.hp = this.def.hp;
    this.driver = null; this.dead = false; this.respawnT = 0; this.hitCd = new Map(); this.lastBy = null;
    this.mesh.g.visible = true; for (const m of this.parts) m.material.color.multiplyScalar(this.burnt ? 1 / 0.25 : 1); this.burnt = false;
    for (const m of this.solids) if (!solids.includes(m)) solids.push(m);
  }
}
function vehDamage(V, dmg, by) {
  if (V.dead) return;
  V.hp -= dmg; if (by) V.lastBy = by;
  if (V.hp > 0) return;
  V.dead = true; V.respawnT = 45; V.burnt = true; V.v = 0;
  for (const m of V.parts) m.material.color.multiplyScalar(0.25);
  for (const m of V.solids) { const i = solids.indexOf(m); if (i >= 0) solids.splice(i, 1); }
  const d = V.driver; if (d) exitVeh(d, true);
  const owner = V.lastBy || d || player;
  explode(new V3(V.pos.x, V.y + 0.3, V.pos.z), owner, 6, 110, V.def.name);
  if (d && d.alive) { const n = owner.lastKillWith; owner.lastKillWith = V.def.name; if (owner.team !== d.team) damage(d, 90, owner, 1); else { d.hp -= 60; if (d.hp <= 0) { d.hp = 0; d.deathBy = 'veículo explodiu'; die(d, d); } } owner.lastKillWith = n; }
}
function enterVeh(s, V) {
  if (V.driver || V.dead) return;
  if (s.turret) leaveTurret(s);
  V.driver = s; s.veh = V; s.reloadT = 0; s.healChan = 0; s.showGear();
  if (s === player) { engineStart(); toast(`${V.def.name}: joystick aponta para onde ir · ${isTouch ? 'botão laranja' : 'F'} sai`); }
}
function exitVeh(s, forced) {
  const V = s.veh; if (!V) return;
  V.driver = null; s.veh = null; s.showGear();
  const side = V.ang + Math.PI / 2;
  s.pos.set(V.pos.x + Math.sin(side) * (V.def.r + 0.6), 0, V.pos.z + Math.cos(side) * (V.def.r + 0.6));
  collide(s.pos, BODY_R, V.y); s.y = groundAt(s.pos.x, s.pos.z, V.y + 1);
  if (s === player) engineStop();
  if (!forced) V.v *= 0.3;
}
let engine = null;
function engineStart() {
  if (!actx || engine) return;
  const o = actx.createOscillator(), o2 = actx.createOscillator(), f = actx.createBiquadFilter(), g = actx.createGain();
  o.type = 'sawtooth'; o2.type = 'square'; o.frequency.value = 45; o2.frequency.value = 22.5; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0.05;
  o.connect(f); o2.connect(f); f.connect(g).connect(masterOut); o.start(); o2.start(); engine = { o, o2, f, g };
}
function engineStop() { if (!engine) return; try { engine.o.stop(); engine.o2.stop(); } catch {} engine = null; }
function driveVehicle(V, ix, iz, dt) {
  const D = V.def, l = Math.hypot(ix, iz);
  if (l > 0.15) {
    const want = Math.atan2(ix, iz), diff = angDiff(V.ang, want), rev = Math.abs(diff) > 2.3 && V.v < 2;
    const turn = D.turn * dt * clamp(Math.abs(V.v) / 4 + 0.35, 0, 1);
    if (rev) { V.ang += clamp(angDiff(V.ang, want + Math.PI), -turn, turn); V.v = Math.max(-D.max * 0.35, V.v - D.acc * dt); }
    else { V.ang += clamp(diff, -turn, turn) * (V.v < 0 ? -1 : 1); const k = Math.max(0, Math.cos(diff)) * Math.min(1, l); V.v = Math.min(D.max * k + 0.5, V.v + D.acc * dt * (V.v < 0 ? 2 : 1)); }
  } else V.v *= 1 - Math.min(1, dt * 1.6);
}
function updateVehicles(dt) {
  for (const V of vehicles) {
    if (V.dead) {
      if (Math.random() < dt * 6) spawnPart(new V3(V.pos.x + rand(-0.5, 0.5), V.y + 1, V.pos.z + rand(-0.5, 0.5)), 0x2a2622, 1, 1.4, new V3(0, 1.4, 0), false, 1.2, 0);
      if ((V.respawnT -= dt) <= 0 && !soldiers.some(s => s.alive && Math.hypot(s.pos.x - V.home[0], s.pos.z - V.home[1]) < 4)) V.reset();
      V.mesh.g.position.set(V.pos.x, V.y, V.pos.z); continue;
    }
    const D = V.def;
    if (!V.driver) V.v *= 1 - Math.min(1, dt * 2.5);
    const ox = V.pos.x, oz = V.pos.z, want = V.v * dt;
    V.pos.x += Math.sin(V.ang) * want; V.pos.z += Math.cos(V.ang) * want;
    collide(V.pos, D.r, V.y + 0.1);
    for (const o of vehicles) if (o !== V && !o.dead) {
      const dx = V.pos.x - o.pos.x, dz = V.pos.z - o.pos.z, d = Math.hypot(dx, dz), r = D.r + o.def.r;
      if (d < r && d > 1e-4) { V.pos.x = o.pos.x + dx / d * r; V.pos.z = o.pos.z + dz / d * r; }
    }
    const moved = Math.hypot(V.pos.x - ox, V.pos.z - oz);
    if (Math.abs(want) > 0.02 && moved < Math.abs(want) * 0.5) {   // bateu
      if (Math.abs(V.v) > 8) { vehDamage(V, Math.abs(V.v) * 2.5, V.driver); shakeT = V.driver === player ? 0.25 : shakeT; if (actx && V.driver === player) noise(0.25, 0.4, 'lowpass', 600); }
      V.v *= 0.25;
    }
    // altura e inclinação pelo terreno
    const g = groundAt(V.pos.x, V.pos.z, V.y + 0.6);
    if (V.y > g + 0.05) { V.vy -= 22 * dt; V.y = Math.max(g, V.y + V.vy * dt); if (V.y === g) V.vy = 0; } else { V.y = g; V.vy = 0; }
    const fx = Math.sin(V.ang), fz = Math.cos(V.ang), L = D.r * 0.9;
    const hf = groundAt(V.pos.x + fx * L, V.pos.z + fz * L, V.y + 0.6), hb = groundAt(V.pos.x - fx * L, V.pos.z - fz * L, V.y + 0.6);
    const hr = groundAt(V.pos.x + fz * 0.6, V.pos.z - fx * 0.6, V.y + 0.6), hl = groundAt(V.pos.x - fz * 0.6, V.pos.z + fx * 0.6, V.y + 0.6);
    V.mesh.g.position.set(V.pos.x, V.y, V.pos.z); V.mesh.g.rotation.y = V.ang;
    V.mesh.tilt.rotation.x = lerp(V.mesh.tilt.rotation.x, -Math.atan2(hf - hb, 2 * L), Math.min(1, dt * 8));
    V.mesh.tilt.rotation.z = lerp(V.mesh.tilt.rotation.z, Math.atan2(hr - hl, 1.2) * 0.8, Math.min(1, dt * 8));
    for (const w of V.mesh.wheels) w.rotation.x += V.v * dt * 2.5;
    // atropelar
    const dr = V.driver;
    if (dr && Math.abs(V.v) > 4.5) for (const s of soldiers) {
      if (!s.alive || s.veh || s.air || s === dr || Math.abs(s.y - V.y) > 1.3) continue;
      const dx = s.pos.x - V.pos.x, dz = s.pos.z - V.pos.z, d = Math.hypot(dx, dz);
      if (d > D.r + 0.45 || (V.hitCd.get(s) ?? 0) > now) continue;
      V.hitCd.set(s, now + 0.8);
      s.pos.x += dx / (d || 1) * 1.2; s.pos.z += dz / (d || 1) * 1.2; collide(s.pos, BODY_R, s.y);
      if (s.team !== dr.team) { dr.lastKillWith = D.name; damage(s, 20 + Math.abs(V.v) * 5, dr, 1); if (s.alive) dr.lastKillWith = null; V.v *= 0.7; if (actx) noise(0.12, 0.3 * vol(player.pos.distanceTo(s.pos)), 'lowpass', 900); }
    }
    if (dr) { dr.pos.set(V.pos.x, 0, V.pos.z); dr.y = V.y + D.seat; dr.facing = V.ang; dr.m.root.rotation.y = V.ang; }
    if (dr === player && engine) { engine.o.frequency.value = 45 + Math.abs(V.v) * 9; engine.o2.frequency.value = (45 + Math.abs(V.v) * 9) / 2; engine.g.gain.value = 0.04 + Math.abs(V.v) / D.max * 0.05; }
  }
}
// pontos de veículos (procura um lugar livre perto do ponto pedido)
for (const [type, x, z, ang] of [['quad', 36, 4.5, -Math.PI / 2], ['quad', -14, 33, Math.PI], ['quad', -40, 4.5, Math.PI / 2], ['jeep', -14, -40, 0], ['jeep', 44, -6, Math.PI], ['quad', 6, -44, Math.PI / 2]]) {
  const r = VEH[type].r + 0.4;
  let px = x, pz = z;
  for (let k = 0; k < 40; k++) {
    if (!colliders.some(c => px > c.x0 - r && px < c.x1 + r && pz > c.z0 - r && pz < c.z1 + r && c.y1 - c.y0 > 0.5)) break;
    const a = k * 2.4, rr = 1 + k * 0.4; px = x + Math.cos(a) * rr; pz = z + Math.sin(a) * rr;
  }
  vehicles.push(new Vehicle(type, px, pz, ang));
}
