'use strict';
// ---------- objetos do mapa ----------
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 14);
function cyl(x, y, z, r, h, color, rot = null, o = {}) {
  const m = new THREE.Mesh(cylGeo, stdMat(color, { rough: 0.9, side: o.side }));
  m.scale.set(r, h, r); m.position.set(x, y, z);
  if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = true; m.receiveShadow = true; scene.add(m);
  if (o.solid) solids.push(m);
  return m;
}
function crate(x, z, stack = 1, s = 1.15) {
  const { lo, y } = footing(x - s / 2, x + s / 2, z - s / 2, z + s / 2);
  for (let k = 0; k < stack; k++) { const m = box(x - s / 2, x + s / 2, z - s / 2, z + s / 2, k ? y + k * s : lo, y + (k + 1) * s, k % 2 ? 0x8f6c40 : 0x9e7a48); m.userData.hp = 160; m.userData.col = colliders[colliders.length - 1]; m.userData.crate = true; }
}
function sandbags(x0, x1, z0, z1) {
  const { lo, y } = footing(x0, x1, z0, z1);
  box(x0, x1, z0, z1, lo, y + 0.7, 0xa8936c);
  box(x0 + 0.06, x1 - 0.06, z0 + 0.05, z1 - 0.05, y + 0.7, y + 1.22, 0x9d8862, { collide: false });
}
function barrier(x, z, alongX) {
  const [hx, hz] = alongX ? [1.1, 0.28] : [0.28, 1.1];
  const { lo, y } = footing(x - hx, x + hx, z - hz, z + hz);
  box(x - hx, x + hx, z - hz, z + hz, lo, y + 1.25, 0xa7a297, { rough: 0.85 });
}
function car(x, z, alongX, color = 0x6b4b36) {
  const [hx, hz] = alongX ? [2.1, 0.95] : [0.95, 2.1];
  const { lo, y } = footing(x - hx, x + hx, z - hz, z + hz);
  box(x - hx, x + hx, z - hz, z + hz, y + 0.25, y + 1.0, color, { rough: 0.7, metal: 0.2 });
  const [cx, cz] = alongX ? [1.1, 0.85] : [0.85, 1.1];
  box(x - cx, x + cx, z - cz, z + cz, y + 1.0, y + 1.5, 0x2f2a25, { rough: 0.6, collide: false });
  box(x - hx + 0.05, x + hx - 0.05, z - hz + 0.05, z + hz - 0.05, lo, y + 0.25, 0x221e1a, { collide: false, cast: false });
  colliders.push({ x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y0: lo, y1: y + 1.5 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const wx = alongX ? x + sx * 1.35 : x + sx * 0.9, wz = alongX ? z + sz * 0.9 : z + sz * 1.35;
    cyl(wx, y + 0.34, wz, 0.34, 0.28, 0x1f1c19, alongX ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2]);
  }
}
function truck(x0, z0) {
  const { lo, y } = footing(x0, x0 + 7, z0, z0 + 2.4);
  box(x0 + 4.8, x0 + 7, z0 + 0.1, z0 + 2.3, y + 0.5, y + 2.4, 0x5c6142, { rough: 0.8 });
  box(x0 + 6.6, x0 + 7.05, z0 + 0.3, z0 + 2.1, y + 0.5, y + 1.4, 0x4a4e36, { collide: false });
  box(x0, x0 + 4.7, z0, z0 + 2.4, y + 0.6, y + 1.2, 0x555a3c, { rough: 0.8 });
  box(x0, x0 + 4.7, z0, z0 + 0.12, y + 1.2, y + 1.9, 0x4d5236, { collide: false });
  box(x0, x0 + 4.7, z0 + 2.28, z0 + 2.4, y + 1.2, y + 1.9, 0x4d5236, { collide: false });
  box(x0 + 0.1, x0 + 6.9, z0 + 0.2, z0 + 2.2, lo, y + 0.6, 0x23201b, { collide: false, cast: false });
  colliders.push({ x0, x1: x0 + 7, z0, z1: z0 + 2.4, y0: lo, y1: y + 2.4 });
  for (const wx of [0.9, 2.4, 6.0]) for (const wz of [0.05, 2.35]) cyl(x0 + wx, y + 0.48, z0 + wz, 0.48, 0.35, 0x1c1a17, [Math.PI / 2, 0, 0]);
}
function container(x0, z0, alongX, color = 0x8a3b2b) {
  const [w, d] = alongX ? [6.1, 2.45] : [2.45, 6.1];
  const { lo, y } = footing(x0, x0 + w, z0, z0 + d);
  box(x0, x0 + w, z0, z0 + d, lo, y + 2.6, color, { rough: 0.75, metal: 0.25, fade: true });
}
function pipes(x, z) {
  const { y } = footing(x - 1.3, x + 1.3, z - 1.8, z + 1.8);
  const r = 0.6;
  for (const [ox, oy, oz] of [[0, r, -1.2], [0, r, 0.05], [0, r * 2.7, -0.58]]) cyl(x + ox, y + oy, z + oz, r, 2.6, 0xa29d93, [0, 0, Math.PI / 2], { side: THREE.DoubleSide, solid: true });
  colliders.push({ x0: x - 1.3, x1: x + 1.3, z0: z - 1.85, z1: z + 0.7, y0: y, y1: y + 2.2 });
}
const streetLights = [], lampGlows = [];
function pole(x, z, real = true) {
  const y = terrainHeight(x, z);
  cyl(x, y + 3.5, z, 0.13, 7, 0x6e5640, null, { solid: true });
  box(x - 0.9, x + 0.9, z - 0.06, z + 0.06, y + 6.4, y + 6.55, 0x5e4936, { collide: false, solid: false });
  box(x + 0.6, x + 1.1, z - 0.15, z + 0.15, y + 6.2, y + 6.35, 0x3a3631, { collide: false, solid: false });
  colliders.push({ x0: x - 0.15, x1: x + 0.15, z0: z - 0.15, z1: z + 0.15, y0: y, y1: y + 7 });
  if (real) { const l = new THREE.PointLight(0xffc477, 0, 20, 1.6); l.position.set(x + 0.85, y + 6.0, z); scene.add(l); streetLights.push(l); return; }
  // poste extra sem PointLight (leve no celular): lâmpada acesa + círculo de luz no chão, só à noite
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd49a }));
  bulb.position.set(x + 0.85, y + 6.1, z); bulb.visible = false; scene.add(bulb);
  const geo = new THREE.CircleGeometry(4.5, 20); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, c = document.createElement('canvas'); c.width = c.height = 64;
  for (let i = 0; i < pos.count; i++) { const gx = x + 0.85 + pos.getX(i), gz = z + pos.getZ(i); pos.setXYZ(i, gx, terrainHeight(gx, gz) + 0.05, gz); }
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,200,130,0.5)'); gr.addColorStop(1, 'rgba(255,200,130,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const glow = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.renderOrder = 1; glow.visible = false; scene.add(glow); lampGlows.push(bulb, glow);
}
function barrel(x, z, color = 0x7a4a2a) {
  const y = terrainHeight(x, z);
  cyl(x, y + 0.6, z, 0.32, 1.2, color, null, { solid: true });
  colliders.push({ x0: x - 0.32, x1: x + 0.32, z0: z - 0.32, z1: z + 0.32, y0: y, y1: y + 1.2 });
}
function fence(x, z0, z1) {
  const { lo, y } = footing(x - 0.1, x + 0.1, z0, z1);
  box(x - 0.1, x + 0.1, z0, z1, lo, y + 1.9, 0xa49d8e, { fade: true });
}
const bushes = [];
// tábua de madeira: quebra com tiros (200) ou granada
function plank(x0, x1, z0, z1, y0, y1, color = 0x8a6a45) {
  const m = box(x0, x1, z0, z1, y0, y1, color, { rough: 0.95, fade: true });
  m.userData.hp = 200; m.userData.col = colliders[colliders.length - 1]; m.userData.chip = 0x7a5a38; return m;
}
function shack(x, z) {
  const { lo, y } = footing(x - 2.2, x + 2.2, z - 2.2, z + 2.2), h = y + 2.3, T = 0.15, W = 2.2;
  box(x - W, x + W, z - W, z + W, lo, y + 0.05, 0x6b5238, { collide: false, solid: false, cast: false });
  for (let i = 0; i < 4; i++) {
    const a = -W + i * 1.1, b = a + 1.1, c = i % 2 ? 0x8a6a45 : 0x7d5f3d;
    plank(x + a, x + b, z - W, z - W + T, lo, h, c);                                   // norte
    if (i === 0 || i === 3) plank(x + a, x + b, z + W - T, z + W, lo, h, c);            // sul (porta no meio)
    plank(x - W, x - W + T, z + a, z + b, lo, h, c);                                   // oeste
    plank(x + W - T, x + W, z + a, z + b, lo, i === 2 ? y + 1.0 : h, c);               // leste (janela)
  }
  crate(x + 1.2, z - 1.2, 1, 1.0);
  OUTER_LOOT.push([x - 1.0, z + 0.6]);
}

truck(8, 2);
car(-3.9, 5.95, true);
car(-14.95, 14.1, false, 0x3e4a52);
car(26, 13, true, 0x5d3a2a);
container(16, -10, true);
container(-26, -26, false, 0x3f5a4a);
container(28, -26, false, 0x7a5a32);
barrier(3, 0, true); barrier(-9, 8, false); barrier(20, 6, true); barrier(-20, -2, true); barrier(9, 24, true);
sandbags(-3, 1, 10, 10.8); sandbags(10, 10.8, -4, -1); sandbags(-24, -21.5, 10, 10.8); sandbags(18, 18.8, 26, 29);
crate(6, 10, 1); crate(7.2, 10, 2); crate(-7.5, -18, 2); crate(-6.3, -18.2, 1); crate(22, -2, 1); crate(-24, 14, 2); crate(12, 18, 1); crate(-30, 26, 1);
pipes(-22, -16);
pole(-30, 8.6); pole(-4, 8.6); pole(14, 8.6); pole(30, 8.6);
// mais postes espalhados (perto da casa, barracão, bunker e morros); pula os que cairiam dentro de algo
for (const [x, z] of [[-10, -18], [9, -20], [22, -30], [38, -38], [36, 4], [-22, -30], [-40, -4], [-18, 30], [10, 26], [30, 40], [-36, 36], [44, 16]])
  if (!inMil(x, z, 2) && ![BARN, BK, HOUSE].some(c => x > c.x0 - 2 && x < c.x1 + 2 && z > c.z0 - 2 && z < c.z1 + 2) && !colliders.some(c => x > c.x0 - 1.4 && x < c.x1 + 1.4 && z > c.z0 - 1.4 && z < c.z1 + 1.4)) pole(x, z, false);
barrel(-9, -20); barrel(-8.3, -20.4, 0x4a5a3a); barrel(23, 4); barrel(-18, 24, 0x5a3a2a);
fence(-9.5, -20, -11); fence(-9.5, -9, -4);
// anel externo do mapa (modos normais: posições fixas, semente 7; Battle Royale: sorteado a cada partida e 3× mais coisas)
const OUTER_LOOT = [], BR_SPOTS = [];
{
  let seed = 7; const rnd = BR_SEED ? srnd : () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const K = BR_SEED ? 3 : 1, R1 = BR_SEED ? MAP - 7 : 54;
  const free = (x, z, m) => !inMil(x, z, m + 2) && !colliders.some(c => x > c.x0 - m && x < c.x1 + m && z > c.z0 - m && z < c.z1 + m);
  const spot = () => { for (let i = 0; i < 60; i++) { const a = rnd() * 6.283, r = 42 + rnd() * (R1 - 42), x = Math.cos(a) * r, z = Math.sin(a) * r; if (free(x, z, 4)) return [x, z]; } return null; };
  const put = (n, f) => { for (let i = 0; i < n * K; i++) { const p = spot(); if (p) f(p[0], p[1]); } };
  put(6, (x, z) => car(x, z, rnd() < 0.5, pick([0x6b4b36, 0x3e4a52, 0x5d3a2a, 0x4a4a3a])));
  put(10, (x, z) => barrier(x, z, rnd() < 0.5));
  put(7, (x, z) => sandbags(x - 1.3, x + 1.3, z - 0.4, z + 0.4));
  put(12, (x, z) => crate(x, z, rnd() < 0.4 ? 2 : 1));
  put(4, (x, z) => container(x - 3, z - 1.2, rnd() < 0.5, pick([0x8a3b2b, 0x3f5a4a, 0x7a5a32, 0x3a4a6a])));
  put(6, (x, z) => barrel(x, z));
  // ruínas: paredes em L com janela
  put(5, (x, z) => { const { lo, y } = footing(x - 3, x + 3, z - 3, z + 3); const C = 0xc9b592;
    wall(x - 3, x + 3, z - 3, z - 2.75, lo, y + 2.4, { color: C }); wall(x - 3, x - 2.75, z - 3, z + 1, lo, y + 1.0, { color: C }); wall(x - 3, x - 2.75, z + 1, z + 3, lo, y + 2.4, { color: C }); });
  put(12, (x, z) => OUTER_LOOT.push([x, z]));
  // cabanas de madeira (paredes quebram com tiro/granada) e moitas de mato alto
  put(3, (x, z) => shack(x, z));
  if (BR_SEED) { put(4, (x, z) => pole(x, z, false)); put(3, (x, z) => BR_SPOTS.push([x, z])); }
  put(16, (x, z) => { if (roadFactor(x, z) < 0.3) bushes.push({ x, z, r: 1.5 + rnd() * 1.1 }); });
}
for (const [x, z, r] of [[-16, 21, 2], [31, -13, 2.2], [-31, -19, 1.8], [7, 35, 2.2], [-36, 13, 2], [21, 33, 1.8], [36, 24, 2], [-8, -40, 2]])
  if (!colliders.some(c => x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r)) bushes.push({ x, z, r });
{
  // folhas meio transparentes: quem está dentro do arbusto aparece (antes sumia por completo)
  const mat = new THREE.MeshStandardMaterial({ color: srgb(0x5a6a32), roughness: 1, flatShading: true, transparent: true, opacity: 0.55, depthWrite: false });
  const mat2 = new THREE.MeshStandardMaterial({ color: srgb(0x6e7a3a), roughness: 1, flatShading: true, transparent: true, opacity: 0.55, depthWrite: false });
  const geo = new THREE.IcosahedronGeometry(0.75, 0), N = bushes.reduce((a, k) => a + Math.ceil(k.r * 5), 0);
  const im = [new THREE.InstancedMesh(geo, mat, N), new THREE.InstancedMesh(geo, mat2, N)], cnt = [0, 0], d = new THREE.Object3D();
  for (const k of bushes) {
    k.y = terrainHeight(k.x, k.z);
    for (let i = 0; i < Math.ceil(k.r * 5); i++) {
      const a = rand(0, 6.28), r = Math.sqrt(Math.random()) * k.r * 0.85, s = rand(0.8, 1.3), j = i % 2;
      d.position.set(k.x + Math.cos(a) * r, k.y + 0.45 * s, k.z + Math.sin(a) * r); d.scale.set(s, s * rand(1.1, 1.6), s); d.rotation.set(rand(0, 3), rand(0, 3), 0);
      d.updateMatrix(); im[j].setMatrixAt(cnt[j]++, d.matrix);
    }
  }
  for (let j = 0; j < 2; j++) { im[j].count = cnt[j]; im[j].castShadow = true; im[j].receiveShadow = true; scene.add(im[j]); }
}

