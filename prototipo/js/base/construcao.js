'use strict';
// ================= construção (caixas, colisão) =================
const colliders = [], solids = [], fadeables = [], upper = [], surfaces = [], allMats = [];
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const srgb = hex => new THREE.Color(hex);
function stdMat(color, o = {}) { const m = new THREE.MeshStandardMaterial({ color: srgb(color), roughness: o.rough ?? 0.95, metalness: o.metal ?? 0, side: o.side ?? THREE.FrontSide }); m.userData.rough = m.roughness; allMats.push(m); return m; }

function box(x0, x1, z0, z1, y0, y1, color, o = {}) {
  const mat = stdMat(color, o);
  if (o.fade) mat.transparent = true;
  const m = new THREE.Mesh(boxGeo, mat);
  m.scale.set(x1 - x0, y1 - y0, z1 - z0);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = o.cast ?? true; m.receiveShadow = true;
  scene.add(m);
  if (o.collide !== false) colliders.push({ x0, x1, z0, z1, y0, y1 });
  if (o.solid !== false) solids.push(m);
  if (o.fade) fadeables.push(m);
  if (o.upper) upper.push(m);
  return m;
}
function footing(x0, x1, z0, z1) {
  const th = terrainHeight, m = 0.9, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  let lo = Infinity, hi = -Infinity;
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [cx, cz]]) lo = Math.min(lo, th(x, z));
  for (const [x, z] of [[x0 - m, z0 - m], [x1 + m, z0 - m], [x0 - m, z1 + m], [x1 + m, z1 + m], [cx, z0 - m], [cx, z1 + m], [x0 - m, cz], [x1 + m, cz]]) hi = Math.max(hi, th(x, z));
  return { lo: lo - 0.06, y: clamp(hi, lo, lo + 0.9) };
}
const WALL = 0xd6c3a0, CAP = 0x2c2621;
function wall(x0, x1, z0, z1, y0, y1, o = {}) {
  box(x0, x1, z0, z1, y0, y1, o.color ?? WALL, { fade: true, upper: o.upper });
  box(x0 - 0.01, x1 + 0.01, z0 - 0.01, z1 + 0.01, y1, y1 + 0.05, CAP, { collide: false, solid: false, cast: false, upper: o.upper });
}
const glasses = [], glassMat = new THREE.MeshStandardMaterial({ color: 0xbfe3f0, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.35, depthWrite: false });
function windowWall(x0, x1, z0, z1, y0, y1) {
  wall(x0, x1, z0, z1, y0, y0 + 1.0); wall(x0, x1, z0, z1, y0 + 2.1, y1);
  // vidro da janela: só enfeite (não bloqueia visão); quebra com tiro ou explosão
  const thinX = x1 - x0 < z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const g = new THREE.Mesh(boxGeo, glassMat);
  g.scale.set(thinX ? 0.04 : x1 - x0, 1.1, thinX ? z1 - z0 : 0.04); g.position.set(cx, y0 + 1.55, cz);
  scene.add(g); glasses.push(g);
}
function breakGlass(g) {
  if (!g.visible) return; g.visible = false;
  const P = g.position;
  for (let i = 0; i < 14; i++) spawnPart(new V3(P.x + rand(-0.5, 0.5) * g.scale.x, P.y + rand(-0.5, 0.5), P.z + rand(-0.5, 0.5) * g.scale.z), 0xd8f2ff, rand(0.06, 0.14), rand(0.5, 0.9), new V3(rand(-2, 2), rand(0, 2), rand(-2, 2)), true, 0, 9);
  if (actx && player) { const v = vol(player.pos.distanceTo(P)); noise(0.35, 0.35 * v, 'highpass', 4200); for (let k = 0; k < 4; k++) setTimeout(() => actx && tone(rand(2500, 5200), rand(1800, 3000), 0.06, 0.05 * v, 'triangle'), 40 + k * rand(30, 70)); }
}
const glassRay = new THREE.Raycaster();
function glassAlong(a, b) {
  const d = new V3().subVectors(b, a), L = d.length(); if (L < 0.05) return; glassRay.set(a, d.divideScalar(L)); glassRay.far = L;
  for (const h of glassRay.intersectObjects(glasses, false)) breakGlass(h.object);
}
function resetGlass() { for (const g of glasses) g.visible = true; }

