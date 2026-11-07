'use strict';
// ---------- tirolesa: terraço da casa ⇄ morro a oeste ----------
const zips = [];
{
  const a = { x: -5.25, z: -8.2, y: H1 }, bx = -26.5, bz = -6.5, b = { x: bx, z: bz, y: terrainHeight(bx, bz) };
  const HANG = 2.7, SAG = 1.0, cable = t => new V3(lerp(a.x, b.x, t), lerp(a.y, b.y, t) + HANG - Math.sin(Math.PI * t) * SAG, lerp(a.z, b.z, t));
  const pts = []; for (let i = 0; i <= 24; i++) pts.push(cable(i / 24));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x222222 })); scene.add(line);
  upper.push(cyl(a.x, a.y + HANG / 2, a.z, 0.08, HANG + 0.1, 0x55504a));
  cyl(b.x, b.y + HANG / 2, b.z, 0.12, HANG + 0.1, 0x6e5640, null, { solid: true });
  colliders.push({ x0: b.x - 0.12, x1: b.x + 0.12, z0: b.z - 0.12, z1: b.z + 0.12, y0: b.y, y1: b.y + HANG });
  zips.push({ a, b, cable, HANG });
}
zips.push(ladderZ);
function updateZip(s, dt) {
  const Z = s.zip, dir = Z.a === Z.Z.a ? 1 : -1;
  Z.t = Math.min(1, Z.t + (Z.Z.ladder ? dt / Z.Z.time : (11 * dt) / Z.len));
  const tt = dir > 0 ? Z.t : 1 - Z.t, c = Z.Z.cable(tt);
  s.pos.set(c.x, 0, c.z); s.y = c.y - 1.95; s.facing = Z.Z.ladder ? Math.atan2(Z.Z.b.x - Z.Z.a.x, Z.Z.b.z - Z.Z.a.z) : Math.atan2(Z.b.x - Z.a.x, Z.b.z - Z.a.z); // escada de mão: sempre de frente para os degraus
  if (Z.t >= 1 && Z.Z.ladder) { s.zip = null; s.pos.set(Z.b.x, 0, Z.b.z); s.y = Z.b.y; s.vy = 0; return; }
  if (Z.t >= 1) { s.zip = null; s.y = Math.max(groundAt(s.pos.x, s.pos.z, s.y + 1), s.y); s.vy = 0; s.pos.x += Math.sin(s.facing) * 0.9; s.pos.z += Math.cos(s.facing) * 0.9; }
}

// ---------- metralhadoras fixas atrás dos sacos de areia ----------
const turrets = [];
function turretAt(x, z, ang) {
  const y = terrainHeight(x, z), g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  const M = c => stdMat(c, { metal: 0.4, rough: 0.5 });
  for (const a of [0, 2.1, 4.2]) { const l = new THREE.Mesh(boxGeo, M(0x2a2a28)); l.scale.set(0.06, 1.3, 0.06); l.position.set(Math.sin(a) * 0.3, 0.6, Math.cos(a) * 0.3); l.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); l.castShadow = true; g.add(l); }
  const head = new THREE.Group(); head.position.y = 1.32; head.rotation.y = ang; g.add(head);
  const parts = [[0.16, 0.18, 0.8, 0, 0, 0.1, 0x2f332c], [0.06, 0.06, 0.7, 0, 0.02, 0.8, 0x151515], [0.2, 0.16, 0.2, 0.15, -0.08, 0, 0x4a4a2a], [0.05, 0.14, 0.05, 0, -0.1, -0.3, 0x222222]];
  for (const [sx, sy, sz, px, py, pz, c] of parts) { const m = new THREE.Mesh(boxGeo, M(c)); m.scale.set(sx, sy, sz); m.position.set(px, py, pz); m.castShadow = true; head.add(m); }
  const mz = new THREE.Object3D(); mz.position.set(0, 0.02, 1.18); head.add(mz);
  turrets.push({ x, z, y, ang, g, head, mz, user: null, heat: 0, cool: 0, sx: x - Math.sin(ang) * 0.8, sz: z - Math.cos(ang) * 0.8 });
}
turretAt(-1, 11.5, Math.PI);          // sacos de areia ao sul da casa, virada para o norte
turretAt(19.5, 27.5, -Math.PI / 2);   // sacos de areia a leste, virada para o oeste
function useTurret(s, T) {
  if (T.user) return;
  T.user = s; s.turret = T; s.prevWeapon = s.weapon; s.weapon = 'turret'; s.reloadT = 0; s.giveAmmo('turret');
  s.pos.set(T.sx, 0, T.sz); s.facing = T.ang; s.showGear(); sfxAt('metralhadora', s.pos, 0.6);
  if (s === player) toast('Metralhadora: mire dentro do arco · não deixe superaquecer');
}
function leaveTurret(s) {
  const T = s.turret; if (!T) return;
  T.user = null; s.turret = null; s.weapon = s.prevWeapon && s.loadout.includes(s.prevWeapon) ? s.prevWeapon : s.loadout[0]; s.showGear();
}
