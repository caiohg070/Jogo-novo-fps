'use strict';
// ---------- granadas ----------
const nades = [];
const nadeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.16, 10);
const nadeMats = { flash: new THREE.MeshStandardMaterial({ color: srgb(0x5b6150), roughness: 0.5, metalness: 0.4 }), he: new THREE.MeshStandardMaterial({ color: srgb(0x3d4a2c), roughness: 0.6 }), smoke: new THREE.MeshStandardMaterial({ color: srgb(0x7a7f86), roughness: 0.6 }),
  molotov: new THREE.MeshStandardMaterial({ color: srgb(0x6a8a3a), roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85 }), impact: new THREE.MeshStandardMaterial({ color: srgb(0x8a3a2a), roughness: 0.6 }),
  mine: new THREE.MeshStandardMaterial({ color: srgb(0x3a4030), roughness: 0.7, metalness: 0.3 }) };
const FLASH_RANGE = 18, THROW_MAX = 14, HE_R = 7;
function throwNade(s, type, tx, tz) {
  if (!s.alive || s.downed || s.veh || !(s.nades[type] > 0)) return false;
  s.nades[type]--;
  if (!(s.nades[s.nadeSel] > 0)) s.nadeSel = NADE_ORDER.find(n => s.nades[n] > 0) || s.nadeSel;
  const o = new V3(s.pos.x, s.y + 1.5, s.pos.z);
  let dx = tx - o.x, dz = tz - o.z, d = Math.hypot(dx, dz);
  if (d > THROW_MAX) { dx *= THROW_MAX / d; dz *= THROW_MAX / d; d = THROW_MAX; }
  if (d < 0.5) { dx = Math.sin(s.facing) * 0.5; dz = Math.cos(s.facing) * 0.5; d = 0.5; }
  s.facing = Math.atan2(dx, dz);
  const T = 0.4 + d * 0.045, G = 18;
  const ty = groundAt(o.x + dx, o.z + dz, s.y + 1) + 0.1;
  const m = new THREE.Mesh(nadeGeo, nadeMats[type]); m.castShadow = true; scene.add(m);
  nades.push({ m, type, pos: o, vel: new V3(dx / T, (ty - o.y + 0.5 * G * T * T) / T, dz / T), fuse: NADES[type].fuse, owner: s, age: 0, hit: false });
  pinPull(player.pos.distanceTo(s.pos)); whoosh(player.pos.distanceTo(s.pos), false, s.pos);
  return true;
}
function updateNades(dt) {
  for (let i = nades.length - 1; i >= 0; i--) {
    const n = nades[i];
    for (let k = 0; k < 4; k++) {
      const h = dt / 4, prev = n.pos.clone();
      n.vel.y -= 18 * h; n.pos.addScaledVector(n.vel, h);
      for (const c of colliders) {
        if (n.pos.x > c.x0 && n.pos.x < c.x1 && n.pos.z > c.z0 && n.pos.z < c.z1 && n.pos.y > c.y0 && n.pos.y < c.y1) {
          const inX = prev.x > c.x0 && prev.x < c.x1, inZ = prev.z > c.z0 && prev.z < c.z1;
          n.pos.copy(prev); n.hit = true;
          if (inX && inZ) { n.vel.y = Math.abs(n.vel.y) * 0.3; n.vel.x *= 0.6; n.vel.z *= 0.6; }
          else { if (!inX) n.vel.x *= -0.35; if (!inZ) n.vel.z *= -0.35; }
          break;
        }
      }
      const g = groundAt(n.pos.x, n.pos.z, n.pos.y) + 0.06;
      if (n.pos.y < g) { n.pos.y = g; n.hit = true; if (n.vel.y < 0) n.vel.y = -n.vel.y * 0.3; n.vel.x *= 0.7; n.vel.z *= 0.7; }
    }
    n.m.position.copy(n.pos); n.m.rotation.x += dt * 9;
    n.fuse -= dt; n.age += dt;
    if (n.fuse <= 0 || (NADES[n.type].impact && n.hit && n.age > 0.12)) {
      if (n.type === 'flash') flashBang(n.pos); else if (n.type === 'he') explode(n.pos, n.owner);
      else if (n.type === 'impact') explode(n.pos, n.owner, 5, 80, 'Impacto');
      else if (n.type === 'molotov') startFire(n.pos, n.owner);
      else if (n.type === 'mine') placeMine(n.pos, n.owner);
      else startSmoke(n.pos);
      scene.remove(n.m); nades.splice(i, 1);
    }
  }
}
// molotov: fogo no chão por 7 s, queima quem pisa (o time de quem jogou não se queima)
const fires = [];
// luzes do fogo criadas uma vez só: criar luz nova a cada molotov recompilava todos os materiais (travava o jogo)
const fireLights = [0, 1, 2].map(() => { const l = new THREE.PointLight(0xff7a2a, 0, 9, 1.6); scene.add(l); return l; });
function startFire(P, owner) {
  const y = groundAt(P.x, P.z, P.y + 0.5);
  const light = fireLights.find(l => !fires.some(f => f.light === l)) || null; if (light) light.position.set(P.x, y + 1, P.z);
  fires.push({ x: P.x, z: P.z, y, r: 3.0, life: 7, owner, light, tick: 0 });
  if (actx) { const v = vol(player.pos.distanceTo(P)); noise(0.12, 0.35 * v, 'highpass', 3000); noise(0.9, 0.3 * v, 'lowpass', 900); }
}
const inFire = s => fires.find(f => Math.hypot(s.pos.x - f.x, s.pos.z - f.z) < f.r && Math.abs(s.y - f.y) < 1.4);
function updateFires(dt) {
  for (let i = fires.length - 1; i >= 0; i--) {
    const f = fires[i]; f.life -= dt; f.tick -= dt;
    if (f.light) f.light.intensity = (f.life > 1 ? 30 : 30 * f.life) * rand(0.7, 1.1);
    for (let k = 0; k < 3; k++) { const a = rand(0, 6.28), r = Math.sqrt(Math.random()) * f.r;
      spawnPart(new V3(f.x + Math.cos(a) * r, f.y + 0.2, f.z + Math.sin(a) * r), Math.random() < 0.7 ? 0xff8a2a : 0xffd04a, rand(0.35, 0.7), rand(0.3, 0.6), new V3(0, rand(1, 2.2), 0), true, -0.2, 0); }
    if (Math.random() < dt * 4) spawnPart(new V3(f.x + rand(-1, 1), f.y + 1.5, f.z + rand(-1, 1)), 0x3a3530, 1.2, 1.5, new V3(0, 1.5, 0), false, 1.5, 0);
    if (actx && Math.random() < dt * 6) { const v = vol(player.pos.distanceTo(new V3(f.x, f.y, f.z)) * 1.5); if (v > 0.02) noise(0.05, 0.08 * v, 'bandpass', rand(1200, 3000)); }
    if (f.tick <= 0) {
      f.tick = 0.25;
      for (const s of soldiers) if (s.alive && !s.air && !s.veh && Math.hypot(s.pos.x - f.x, s.pos.z - f.z) < f.r && Math.abs(s.y - f.y) < 1.4) {
        f.owner.lastKillWith = 'Molotov';
        if (s === f.owner) { s.hp -= 3; s.lastHurt = now; if (s.hp <= 0) { s.hp = 0; s.deathBy = 'se queimou'; die(s, s); } }
        else damage(s, 6, f.owner, 1);
        f.owner.lastKillWith = null;
      }
    }
    if (f.life <= 0) { if (f.light) f.light.intensity = 0; fires.splice(i, 1); }
  }
}
// mina: arma em 1 s; explode quando um inimigo pisa perto
const mines = [];
const mineGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.08, 12);
function placeMine(P, owner) {
  const y = groundAt(P.x, P.z, P.y + 0.5);
  const m = new THREE.Mesh(mineGeo, nadeMats.mine); m.position.set(P.x, y + 0.04, P.z); m.castShadow = true; scene.add(m);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), new THREE.MeshBasicMaterial({ color: 0xff2a1a })); led.position.y = 0.06; m.add(led);
  mines.push({ x: P.x, z: P.z, y, owner, arm: 1.0, m, led });
  if (owner === player) toast('Mina armada');
}
function updateMines(dt) {
  for (let i = mines.length - 1; i >= 0; i--) {
    const M = mines[i];
    if (M.arm > 0) { M.arm -= dt; continue; }
    M.led.visible = Math.sin(now * 8) > 0;
    const v = soldiers.find(s => s.alive && !s.air && s.team !== M.owner.team && Math.hypot(s.pos.x - M.x, s.pos.z - M.z) < 1.3 && Math.abs(s.y - M.y) < 1);
    const car = vehicles.find(V => !V.dead && V.driver && V.driver.team !== M.owner.team && Math.hypot(V.pos.x - M.x, V.pos.z - M.z) < V.def.r + 0.5);
    if (v || car) { scene.remove(M.m); mines.splice(i, 1); if (car) vehDamage(car, 260, M.owner); explode(new V3(M.x, M.y, M.z), M.owner, 4.5, 130, 'Mina'); }
  }
}
function flashBang(P) {
  const src = P.clone(); src.y += 0.3;
  boomLight.position.copy(src); boomLight.color.set(0xffffff); boomLight.intensity = 80;
  spawnPart(src, 0xffffff, 5, 0.3, new V3(), true, 3);
  let deafen = 0;
  for (const s of soldiers) {
    if (!s.alive) continue;
    const e = eye(s), d = e.distanceTo(src);
    if (d > FLASH_RANGE || firstHit(src, e) < Infinity || smokeBlocks(src, e)) continue;
    const df = Math.abs(angDiff(s.facing, Math.atan2(src.x - s.pos.x, src.z - s.pos.z)));
    const k = (1 - d / FLASH_RANGE) * (df < 1.0 ? 1 : df < 2.0 ? 0.5 : 0.25);
    if (k < 0.05) continue;
    const dur = 0.4 + 4.6 * k;
    s.blindT = Math.max(s.blindT, dur);
    if (s === player) deafen = dur; else if (s.isBot) s.ai.blindDir = rand(0, Math.PI * 2);
  }
  bang(player.pos.distanceTo(src), deafen, src);
}
function explode(P, owner, R = HE_R, dmg = 100, name = 'HE') {
  for (const g of glasses) if (g.visible && g.position.distanceTo(P) < R + 1) breakGlass(g);
  const src = P.clone(); src.y += 0.4;
  boomLight.position.copy(src); boomLight.color.set(0xffa040); boomLight.intensity = 120;
  for (let i = 0; i < 14; i++) spawnPart(src, i < 6 ? 0xffa040 : 0x4a3f35, rand(0.6, 1.2), rand(0.4, 1.1), new V3(rand(-4, 4), rand(1, 5), rand(-4, 4)), i < 6, 1.5);
  if (player.pos.distanceTo(src) < 20) shakeT = 0.35;
  boom(player.pos.distanceTo(src), src);
  scorchMark(P, R * 0.42, 0.75);   // queimado no chão (mancha suave que segue o relevo)
  for (const m of solids.slice()) if (m.userData.hp && !m.userData.veh && m.getWorldPosition(_d).distanceTo(src) < R * 0.8) hurtProp(m, 200, owner);
  for (const V of vehicles) if (!V.dead && V.pos.distanceTo(new V3(src.x, V.y, src.z)) < R * 0.8 && Math.abs(V.y - src.y) < 3) vehDamage(V, dmg * 1.6 * (1 - V.pos.distanceTo(new V3(src.x, V.y, src.z)) / R), owner);
  for (const s of soldiers) {
    if (!s.alive || (s.team === owner.team && s !== owner)) continue;
    const e = eye(s, 1.0), d = e.distanceTo(src);
    if (d > R || firstHit(src, e) < Infinity) continue;
    owner.lastKillWith = name;
    if (s === owner) { s.hp -= Math.round(dmg * 0.6 * (1 - d / R)); s.lastHurt = now; if (s.hp <= 0) { s.hp = 0; s.deathBy = 'se explodiu'; die(s, s); } continue; }
    damage(s, dmg * Math.pow(1 - d / R, 1.1), owner, 0.3);
    if (s.alive) owner.lastKillWith = null;
  }
}
function startSmoke(P) {
  const s = { pos: P.clone().add(new V3(0, 1.4, 0)), r: 4.2, age: 0, life: 15, sprites: [] };
  for (let i = 0; i < 22; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: 0xb9b6ae, transparent: true, opacity: 0, depthWrite: false }));
    const a = rand(0, 6.28), r = rand(0, 3.2);
    sp.userData.off = new V3(Math.cos(a) * r, rand(-1.2, 1.4), Math.sin(a) * r); sp.userData.size = rand(3.2, 4.6);
    sp.position.copy(P); sp.scale.setScalar(0.5); scene.add(sp); s.sprites.push(sp);
  }
  smokes.push(s); hiss(player.pos.distanceTo(P), P);
}
function updateSmokes(dt) {
  for (let i = smokes.length - 1; i >= 0; i--) {
    const s = smokes[i]; s.age += dt; s.life -= dt;
    const grow = smooth(0, 1.5, s.age), op = Math.min(grow, smooth(0, 2.5, s.life)) * 0.92;
    for (const sp of s.sprites) {
      sp.position.copy(s.pos).addScaledVector(sp.userData.off, grow);
      sp.scale.setScalar(sp.userData.size * (0.3 + 0.7 * grow)); sp.material.opacity = op;
    }
    if (s.life <= 0) { for (const sp of s.sprites) { scene.remove(sp); sp.material.dispose(); } smokes.splice(i, 1); }
  }
}

