'use strict';
// ---------- itens soltos flutuando (só no Battle Royale): colete, capacete, arma, kit médico, munição ----------
// Entram na mesma lista "loots" dos baús (L.float = true): o botão PEGAR e os bots funcionam igual.
// Quem pega primeiro leva; não volta. São sorteados de novo a cada partida (spawnFloats, chamado em startBR).
const FLOAT_N = 35;
const FLOAT_TABLE = [['arma', 30], ['colete', 22], ['capacete', 18], ['medkit', 18], ['municao', 12]];
const FLOAT_TABLE_MIL = [['arma', 45], ['colete', 28], ['capacete', 22], ['medkit', 5]];
const FLOAT_GLOW = { colete: 0x6fb3ff, capacete: 0x8fe36a, arma: 0xffc24a, medkit: 0xff6a6a, municao: 0xffe08a };
const fltMats = {}, fm = (c, e = 0) => fltMats[c + ':' + e] || (fltMats[c + ':' + e] = new THREE.MeshStandardMaterial({ color: srgb(c), roughness: 0.6, emissive: srgb(e) }));
const fRingGeo = new THREE.RingGeometry(0.42, 0.62, 24); fRingGeo.rotateX(-Math.PI / 2);
function floatModel(L) {
  const g = new THREE.Group(), add = (sx, sy, sz, x, y, z, m) => { const k = new THREE.Mesh(boxGeo, m); k.scale.set(sx, sy, sz); k.position.set(x, y, z); k.castShadow = true; g.add(k); return k; };
  if (L.k === 'colete') {
    const m = fm(0x4c5a6a, 0x111a24); add(0.5, 0.56, 0.2, 0, 0, 0, m);
    for (const x of [-0.17, 0.17]) add(0.11, 0.14, 0.2, x, 0.34, 0, m);
    add(0.36, 0.12, 0.05, 0, -0.08, 0.12, fm(0x3a4654));
  } else if (L.k === 'capacete') {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), fm(0x3d4a3a, 0x0e140c)); d.castShadow = true; g.add(d);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.04, 16), fm(0x34402f)); g.add(b);
  } else if (L.k === 'arma') {
    const len = { awp: 1.25, lmg: 1.1, shotgun: 1.0, smg: 0.65 }[L.sub] || 0.95, m = fm(0x222222, 0x111111);
    add(len * 0.55, 0.14, 0.08, 0, 0, 0, m);                         // corpo
    add(len * 0.42, 0.05, 0.05, len * 0.48, 0.02, 0, m);              // cano
    add(len * 0.28, 0.16, 0.07, -len * 0.4, -0.03, 0, fm(0x5a3e26));  // coronha
    add(0.08, 0.2, 0.06, 0.05, -0.16, 0, m);                         // pente
    if (L.sub === 'awp') add(0.3, 0.07, 0.07, 0, 0.12, 0, m);         // luneta
    g.rotation.z = 0.15;
  } else if (L.k === 'medkit') {
    add(0.46, 0.3, 0.3, 0, 0, 0, fm(0xe8e2d6, 0x222222));
    const r = fm(0xd02a2a, 0x400000); add(0.24, 0.07, 0.02, 0, 0, 0.16, r); add(0.07, 0.24, 0.02, 0, 0, 0.16, r);
  } else {
    add(0.42, 0.26, 0.28, 0, 0, 0, fm(0xb08a3a, 0x2a1e00));
    add(0.43, 0.05, 0.29, 0, 0.06, 0, fm(0x3a3020));
  }
  return g;
}
function makeFloat(x, z, mil) {
  const loot = rollLoot({ mil }, mil ? FLOAT_TABLE_MIL : FLOAT_TABLE);
  const y = (x > BARN.x0 && x < BARN.x1 && z > BARN.z0 && z < BARN.z1 ? BARN_Y : terrainHeight(x, z)) + 0.02;
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  const item = floatModel(loot); item.position.y = 0.7; g.add(item);
  const ring = new THREE.Mesh(fRingGeo, new THREE.MeshBasicMaterial({ color: FLOAT_GLOW[loot.k], transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
  ring.position.y = 0.06; g.add(ring);
  const tag = document.createElement('div'); tag.className = 'lootTag'; tag.style.display = 'none'; $('#tags').appendChild(tag);
  const L = { x, z, y, g, item, ring, tag, col: null, state: 'open', loot, t: 0, ang: 0, float: true, mil, ph: rand(0, 6.28) };
  loots.push(L); return L;
}
function floatAnim(l, dt) {
  l.item.rotation.y += dt * 1.6; l.item.position.y = 0.7 + Math.sin(now * 2.5 + l.ph) * 0.09;
  l.ring.material.opacity = 0.4 + 0.25 * Math.sin(now * 3 + l.ph);
}
function spawnFloats() {
  for (const L of loots.filter(l => l.float)) removeLoot(L);
  if (!BR_SEED) return;
  const blocked = (x, z) => inBK(x, z) || inMil(x, z, 1) || colliders.some(c => x > c.x0 - 1 && x < c.x1 + 1 && z > c.z0 - 1 && z < c.z1 + 1)
    || loots.some(l => Math.hypot(l.x - x, l.z - z) < 4);
  for (let i = 0; i < FLOAT_N; i++) for (let k = 0; k < 40; k++) {
    const x = rand(-MAP + 8, MAP - 8), z = rand(-MAP + 8, MAP - 8);
    if (!blocked(x, z)) { makeFloat(x, z, false); break; }
  }
  for (const [x, z] of MIL_FLOAT) makeFloat(x, z, true);
}
