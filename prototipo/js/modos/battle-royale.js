'use strict';
// ================= Battle Royale =================
const PLANE_Y = 20;
const plane = { mesh: new THREE.Group(), pos: new V3(), dir: new V3(), t: 0, len: 0, active: false };
{
  const m = new THREE.MeshStandardMaterial({ color: srgb(0x7c8279), roughness: 0.6, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 9), m); plane.mesh.add(body);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(14, 0.25, 1.8), m); wing.position.z = 0.5; plane.mesh.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 1.2), m); tail.position.set(0, 0.4, -4); plane.mesh.add(tail);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 1.2), m); fin.position.set(0, 1.2, -4); plane.mesh.add(fin);
  for (const c of plane.mesh.children) c.castShadow = true;
  plane.mesh.visible = false; scene.add(plane.mesh);
}
const zone = { x: 0, z: 0, r: 85, r0: 85, r1: 6, t: 0, dur: 200, delay: 30 };
const zoneMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 40, 64, 1, true), new THREE.MeshBasicMaterial({ color: 0x4aa3ff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
zoneMesh.visible = false; scene.add(zoneMesh);
let planeSnd = null;
function startBR() {
  planeSnd?.stop(); planeSnd = null;
  if (actx && SFX.aviao) { planeSnd = actx.createBufferSource(); planeSnd.buffer = SFX.aviao; planeSnd.loop = true; const g = actx.createGain(); g.gain.value = 0.35; planeSnd.connect(g).connect(masterOut); planeSnd.start(); }
  const a = rand(0, Math.PI * 2), d = new V3(Math.cos(a), 0, Math.sin(a));
  plane.dir.copy(d); plane.pos.set(-d.x * 70, PLANE_Y, -d.z * 70 + rand(-15, 15)); plane.len = 140; plane.t = 0; plane.active = true;
  plane.mesh.visible = true; plane.mesh.rotation.y = Math.atan2(d.x, d.z);
  const flight = plane.len / 13;
  for (const s of soldiers) {
    s.spawn(0, 0); s.inv.primary = null; s.giveAmmo(s.inv.secondary); s.weapon = s.inv.secondary; s.armor = 0; s.helmet = false; s.nades = {}; s.showGear();
    s.air = 'plane'; s.y = PLANE_Y;
    if (s.isBot) { s.ai = newAI(); s.jumpAt = now + rand(1.5, flight - 1); s.dropX = rand(-50, 50); s.dropZ = rand(-50, 50); }
  }
  for (const l of loots) { l.state = 'closed'; l.loot = rollLoot(); }
  zone.x = rand(-20, 20); zone.z = rand(-20, 20); zone.r = zone.r0; zone.t = 0; zoneMesh.visible = true;
  camTarget.copy(plane.pos);
}
function jumpOut(s) {
  if (s.air !== 'plane') return;
  if (s === player) { planeSnd?.stop(); planeSnd = null; sfx('paraquedas', 0.6); }
  s.air = 'chute'; s.y = PLANE_Y - 2; s.m.chute.visible = true;
  if (s.isBot) { s.ai.wp = nearestWP(new V3(s.dropX, 0, s.dropZ)); }
}
function updatePlane(dt) {
  if (!plane.active) return;
  plane.t += dt * 13; plane.pos.addScaledVector(plane.dir, dt * 13); plane.mesh.position.copy(plane.pos);
  for (const s of soldiers) if (s.air === 'plane') { s.pos.set(plane.pos.x, 0, plane.pos.z); s.y = PLANE_Y; }
  if (plane.t >= plane.len) { plane.active = false; plane.mesh.visible = false; for (const s of soldiers) jumpOut(s); }
  // pontos do jogador fora do mapa ficam presos dentro dos limites
  for (const s of soldiers) if (s.air === 'chute') { s.pos.x = clamp(s.pos.x, -MAP + 2, MAP - 2); s.pos.z = clamp(s.pos.z, -MAP + 2, MAP - 2); }
}
// airdrop: caixa vermelha cai de paraquedas dentro da zona (aos 50 s e 130 s) com arma rara + equipamento
const drops = [];
function dropCrate() {
  let x = 0, z = 0;
  for (let k = 0; k < 30; k++) {
    const a = rand(0, 6.28), r = rand(0, zone.r * 0.55); x = clamp(zone.x + Math.cos(a) * r, -MAP + 5, MAP - 5); z = clamp(zone.z + Math.sin(a) * r, -MAP + 5, MAP - 5);
    if (!colliders.some(c => x > c.x0 - 1.5 && x < c.x1 + 1.5 && z > c.z0 - 1.5 && z < c.z1 + 1.5) && !inBK(x, z)) break;
  }
  const g = new THREE.Group(); scene.add(g);
  const crateM = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.62, 0.85), lootMats.dbody); crateM.position.y = 0.31; crateM.castShadow = true; g.add(crateM);
  const ch = new THREE.Mesh(new THREE.SphereGeometry(1.6, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2.4), new THREE.MeshStandardMaterial({ color: srgb(0xd04a2a), roughness: 0.8, side: THREE.DoubleSide }));
  ch.position.y = 3; ch.scale.y = 0.6; g.add(ch);
  const y = terrainHeight(x, z);
  drops.push({ g, x, z, y: y + 26, gy: y });
  toast('AIRDROP caindo! Veja o quadrado vermelho no minimapa');
  if (actx) tone(900, 600, 0.4, 0.08);
}
function updateDrops(dt) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const D = drops[i]; D.y -= 3.2 * dt; D.g.position.set(D.x, D.y, D.z);
    if (Math.random() < dt * 8) spawnPart(new V3(D.x, D.y + 0.8, D.z), 0xff4a2a, 0.6, 1.2, new V3(rand(-0.3, 0.3), 1.2, rand(-0.3, 0.3)), true, 1, 0);
    if (D.y <= D.gy) {
      scene.remove(D.g); drops.splice(i, 1);
      const L = makeLoot(D.x, D.z, D.gy, true);
      L.loot = { k: 'drop', items: [{ k: 'arma', sub: pick(['lmg', 'awp', 'lmg']) }, { k: 'colete' }, { k: 'capacete' }, { k: 'acessorio', sub: pick(['sil', 'mira']) }, { k: 'granada', sub: pick(['molotov', 'impact', 'mine']) }] };
    }
  }
}
function updateZone(dt) {
  const t0 = zone.t;
  zone.t += dt;
  for (const T of [50, 130]) if (t0 < T && zone.t >= T) dropCrate();
  const k = clamp((zone.t - zone.delay) / zone.dur, 0, 1);
  zone.r = lerp(zone.r0, zone.r1, k);
  zoneMesh.scale.set(zone.r, 1, zone.r); zoneMesh.position.set(zone.x, 10, zone.z);
  for (const s of soldiers) {
    if (!s.alive || s.air) continue;
    if (Math.hypot(s.pos.x - zone.x, s.pos.z - zone.z) > zone.r) {
      s.hp -= (k < 0.5 ? 4 : 9) * dt; s.lastHurt = now;
      if (s === player && Math.random() < dt * 3) { $('#hurt').style.opacity = 0.6; setTimeout(() => $('#hurt').style.opacity = 0, 150); }
      if (s.hp <= 0) { s.hp = 0; s.deathBy = 'ficou fora da zona'; die(s, s); }
    }
  }
}
function updateAirPlayer(p, mx, mz, dt) {
  aimLine.visible = false;
  if (p.air === 'chute') { p.move(mx, mz, 7, dt); if (p.moving) p.facing = Math.atan2(mx, mz); }
  return;
}

