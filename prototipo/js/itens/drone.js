'use strict';
// ---------- drone: marca os inimigos num raio de 35 m por 6 s (minimapa + silhueta) ----------
const droneMesh = new THREE.Group();
{
  const M = stdMat(0x3a3f45, { metal: 0.5, rough: 0.4 });
  const b = new THREE.Mesh(boxGeo, M); b.scale.set(0.4, 0.12, 0.4); droneMesh.add(b);
  for (const [x, z] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) {
    const arm = new THREE.Mesh(boxGeo, M); arm.scale.set(0.05, 0.04, 0.05); arm.position.set(x, 0.05, z); droneMesh.add(arm);
    const r = new THREE.Mesh(cylGeo, stdMat(0x111111)); r.scale.set(0.2, 0.01, 0.2); r.position.set(x, 0.09, z); droneMesh.add(r);
  }
  const led = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0x40ff60 })); led.scale.set(0.06, 0.04, 0.06); led.position.set(0, -0.08, 0.18); droneMesh.add(led);
  droneMesh.visible = false; scene.add(droneMesh);
}
let droneT = 0, droneOwner = null;
function useDrone(s) {
  if (!s.alive || s.downed || s.air || !(s.drones > 0) || droneT > 0) return;
  s.drones--; droneOwner = s; droneT = 6; droneMesh.visible = true; droneMesh.position.set(s.pos.x, s.y + 1.5, s.pos.z);
  const found = enemiesOf(s).filter(e => Math.hypot(e.pos.x - s.pos.x, e.pos.z - s.pos.z) < 35);
  if (s.team === player.team) for (const e of found) e.revealT = 6;
  if (found.length) for (const b of bots) if (b.alive && b.team === s.team && b.ai && b.ai.state !== 'engage') {
    const e = found.reduce((a, c) => Math.hypot(c.pos.x - b.pos.x, c.pos.z - b.pos.z) < Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z) ? c : a);
    b.ai.last.copy(e.pos); b.ai.state = 'search'; b.ai.searchT = 8;
  }
  if (s === player) toast(found.length ? `Drone: ${found.length} inimigo(s) marcado(s) por 6 s` : 'Drone: nenhum inimigo a 35 m');
  else if (found.includes(player)) toast('Um drone inimigo te viu!');
  if (actx) { const v = vol(player.pos.distanceTo(s.pos)); tone(180, 240, 0.6, 0.05 * v, 'sawtooth'); }
}
function updateDrone(dt) {
  if (droneT <= 0) return;
  droneT -= dt; const o = droneOwner, a = now * 1.6;
  droneMesh.position.lerp(new V3(o.pos.x + Math.cos(a) * 3, o.y + 6 + Math.sin(now * 3) * 0.2, o.pos.z + Math.sin(a) * 3), Math.min(1, dt * 2));
  droneMesh.rotation.y += dt * 2;
  if (droneT <= 0) droneMesh.visible = false;
}
function updateTurrets(dt) {
  for (const T of turrets) {
    if (T.cool > 0) { T.cool -= dt; if (T.cool <= 0) T.heat = 0.5; }
    else T.heat = Math.max(0, T.heat - dt * 0.15);
    const u = T.user;
    if (u && (!u.alive || u.downed)) { leaveTurret(u); continue; }
    if (u) { u.pos.set(T.sx, 0, T.sz); T.head.rotation.y = T.ang + clamp(angDiff(T.ang, u.facing), -1.1, 1.1); }
  }
}

{
  const near = (x, z, m) => colliders.some(c => x > c.x0 - m && x < c.x1 + m && z > c.z0 - m && z < c.z1 + m);
  const inHouse = (x, z) => (x > HOUSE.x0 - 1 && x < HOUSE.x1 + 1 && z > HOUSE.z0 - 1 && z < HOUSE.z1 + 1) || (x > BK.x0 - 1 && x < BK.x1 + 1 && z > BK.z0 - 1 && z < BK.z1 + 1);
  const place = (mesh, count, sMin, sMax, yOff) => {
    const d = new THREE.Object3D(); let n = 0, tries = 0;
    while (n < count && tries++ < count * 20) {
      const x = rand(-MAP + 2, MAP - 2), z = rand(-MAP + 2, MAP - 2);
      if (roadFactor(x, z) > 0.3 || inHouse(x, z) || near(x, z, 0.8)) continue;
      const s = rand(sMin, sMax);
      d.position.set(x, terrainHeight(x, z) + yOff * s, z); d.scale.set(s, s * rand(0.6, 1.1), s); d.rotation.y = rand(0, 6.28);
      d.updateMatrix(); mesh.setMatrixAt(n++, d.matrix);
    }
    mesh.count = n; mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  };
  place(new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.55, 0), new THREE.MeshStandardMaterial({ color: srgb(0x8a7d4c), roughness: 1, flatShading: true }), 320), 320, 0.5, 1.3, 0.25);
  place(new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.32, 0), new THREE.MeshStandardMaterial({ color: srgb(0x8c7b66), roughness: 1, flatShading: true }), 200), 200, 0.4, 1.4, 0.1);
}

// poças (aparecem com chuva)
const puddles = new THREE.Group(); scene.add(puddles);
{
  const mat = new THREE.MeshStandardMaterial({ color: srgb(0x5d636b), roughness: 0.08, metalness: 0.35, transparent: true, opacity: 0.45, depthWrite: false });
  const spots = [[-6, 3], [2, 5.5], [12, 6.2], [20, 3], [-14, 0], [-13, 18], [-15, -8], [-20, 4.5], [5, 1.8], [26, 5], [-28, 3], [-13.5, 26]];
  for (const [x, z] of spots) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(rand(0.8, 1.8), 18), mat);
    m.rotation.x = -Math.PI / 2; m.scale.set(1, rand(0.5, 0.9), 1); m.rotation.z = rand(0, 3);
    m.position.set(x, terrainHeight(x, z) + 0.03, z); m.receiveShadow = true; m.renderOrder = 1; puddles.add(m);
  }
  puddles.visible = false;
}

