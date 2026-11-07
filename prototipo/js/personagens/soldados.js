'use strict';
// ================= soldados =================
function buildSoldier(pal, team, medic, look = {}) {
  const sk = SKINS[look.skin]; if (sk) pal = sk;
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: srgb(c), roughness: o.r ?? 0.9, metalness: o.m ?? 0 });
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const add = (geo, m, x, y, z, parent = body) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  const B = (x, y, z) => new THREE.BoxGeometry(x, y, z);
  const legs = [];
  for (const sx of [-0.13, 0.13]) {
    const hip = new THREE.Group(); hip.position.set(sx, 0.82, 0); body.add(hip);
    add(B(0.22, 0.82, 0.26), mat(pal.pants), 0, -0.41, 0, hip);
    add(B(0.24, 0.14, 0.32), mat(0x2a2520), 0, -0.78, 0.04, hip);
    legs.push(hip);
  }
  add(B(0.52, 0.6, 0.32), mat(pal.shirt), 0, 1.12, 0);
  const vest = add(B(0.58, 0.44, 0.4), mat(pal.vest), 0, 1.16, 0.01);
  add(B(0.42, 0.46, 0.22), mat(pal.pack), 0, 1.16, -0.28);
  if (medic) { add(B(0.26, 0.08, 0.02), mat(0xc0201a), 0, 1.18, -0.4); add(B(0.08, 0.26, 0.02), mat(0xc0201a), 0, 1.18, -0.4); }
  add(B(0.6, 0.07, 0.42), mat(TEAM_COLOR[team] ?? 0x9a9a9a), 0, 0.97, 0.01);              // faixa do time
  add(B(0.14, 0.06, 0.15), mat(TEAM_COLOR[team] ?? 0x9a9a9a), -0.3, 1.3, 0);
  add(new THREE.SphereGeometry(0.15, 12, 10), mat(0xb08a6a), 0, 1.58, 0.02);
  const helmet = add(new THREE.SphereGeometry(0.185, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(pal.helmet), 0, 1.6, 0);
  const cap = add(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x3a3530), 0, 1.62, 0.01);
  add(B(0.13, 0.13, 0.5), mat(pal.shirt), 0.22, 1.25, 0.25);
  add(B(0.13, 0.13, 0.55), mat(pal.shirt), -0.12, 1.22, 0.32);
  // camuflagem: manchas; ghillie ganha tiras de "mato" pelo corpo
  if (sk) {
    for (const [w, h, x, y, z] of [[0.16, 0.12, 0.12, 1.22, 0.165], [0.12, 0.16, -0.14, 1.04, 0.165], [0.18, 0.12, -0.08, 1.3, -0.165], [0.1, 0.14, 0.16, 1.0, -0.165]]) add(B(w, h, 0.02), mat(sk.spot), x, y, z);
    for (const hip of legs) add(B(0.1, 0.22, 0.02), mat(sk.spot), 0.02, -0.32, 0.135, hip);
  }
  if (sk?.ghillie) {
    for (let i = 0; i < 26; i++) {
      const o = add(B(rand(0.07, 0.15), rand(0.18, 0.36), rand(0.04, 0.09)), mat(pick([0x4f5a32, 0x5e5a35, 0x3e4a2a, 0x6b6a3a, 0x75703f])),
        rand(-0.3, 0.3), i < 6 ? rand(1.6, 1.8) : rand(0.7, 1.5), i < 6 ? rand(-0.14, 0.14) : pick([-1, 1]) * rand(0.13, 0.24));
      o.rotation.z = rand(-0.6, 0.6); o.rotation.x = rand(-0.3, 0.3);
    }
  }
  let beret = null;
  if (look.acc === 'boina') { beret = add(B(0.33, 0.07, 0.33), mat(0x6a1e1e), 0.03, 1.72, 0); beret.rotation.z = -0.25; }
  else if (look.acc === 'oculos') { add(B(0.27, 0.06, 0.05), mat(0x111111, { r: 0.2, m: 0.5 }), 0, 1.6, 0.14); add(B(0.3, 0.02, 0.2), mat(0x222222), 0, 1.6, 0.04); }
  else if (look.acc === 'mascara') add(B(0.25, 0.12, 0.07), mat(0x2a2a2a), 0, 1.52, 0.12);
  else if (look.acc === 'mochila') { add(B(0.5, 0.62, 0.3), mat(pal.pack), 0, 1.14, -0.4); add(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), mat(0x5a5040), 0, 1.5, -0.42).rotation.z = Math.PI / 2; }
  const guns = {};
  const gun = (id, px, py, pz, parts, mz) => {
    const g = new THREE.Group(); g.position.set(px, py, pz); g.userData.z0 = pz; body.add(g);
    for (const [sx, sy, sz, x, y, z, c, o, rx] of parts) { const m = add(B(sx, sy, sz), mat(c, o || {}), x, y, z, g); if (rx) m.rotation.x = rx; }
    const m = new THREE.Object3D(); m.position.set(0, mz[0], mz[1]); g.add(m); guns[id] = { g, mz: m };
    // acessórios (aparecem só se o soldado tiver): silenciador na ponta e mira em cima
    const sil = add(B(0.065, 0.065, 0.24), mat(0x111111), 0, mz[0], mz[1] + 0.1, g); sil.visible = false;
    const sc = add(B(0.05, 0.065, 0.2), mat(0x151515, { r: 0.4, m: 0.4 }), 0, 0.1, 0.1, g); sc.visible = false;
    guns[id].sil = sil; guns[id].sc = sc;
  };
  const BLK = 0x1c1c1c, MET = { r: 0.5, m: 0.4 };
  gun('ak', 0.08, 1.26, 0.35, [[0.07, 0.1, 0.62, 0, 0, 0.15, 0x2b2926], [0.06, 0.09, 0.28, 0, -0.02, -0.25, 0x6e4426], [0.075, 0.07, 0.22, 0, -0.01, 0.32, 0x7a4b2a], [0.05, 0.2, 0.08, 0, -0.13, 0.12, 0x2b2926, null, 0.4], [0.03, 0.03, 0.3, 0, 0.02, 0.6, 0x1e1d1b]], [0.02, 0.78]);
  gun('m4', 0.08, 1.26, 0.35, [[0.07, 0.11, 0.55, 0, 0, 0.12, BLK, MET], [0.06, 0.12, 0.26, 0, -0.01, -0.26, 0x232323], [0.03, 0.05, 0.22, 0, 0.08, 0.06, BLK], [0.05, 0.18, 0.07, 0, -0.13, 0.1, 0x2a2a2a], [0.028, 0.028, 0.32, 0, 0.01, 0.55, 0x151515]], [0.01, 0.72]);
  gun('awp', 0.08, 1.26, 0.35, [[0.08, 0.11, 0.7, 0, 0, 0.1, 0x3d4a34], [0.07, 0.14, 0.3, 0, -0.02, -0.33, 0x34402c], [0.05, 0.05, 0.3, 0, 0.1, 0.1, BLK, MET], [0.03, 0.03, 0.5, 0, 0.02, 0.68, 0x151515], [0.05, 0.12, 0.06, 0, -0.12, 0.05, BLK]], [0.02, 0.95]);
  gun('deagle', 0.2, 1.24, 0.5, [[0.05, 0.09, 0.26, 0, 0, 0.05, 0x8d8f92, MET], [0.045, 0.14, 0.06, 0, -0.09, -0.05, 0x222222]], [0.02, 0.2]);
  gun('pistol', 0.2, 1.24, 0.5, [[0.04, 0.07, 0.2, 0, 0, 0.04, 0x222222], [0.04, 0.12, 0.05, 0, -0.08, -0.04, 0x1a1a1a]], [0.02, 0.15]);
  gun('knife', 0.24, 1.2, 0.48, [[0.035, 0.05, 0.12, 0, 0, 0, 0x1a1a1a], [0.015, 0.06, 0.24, 0, 0.005, 0.18, 0xc9ccd0, { r: 0.3, m: 0.8 }]], [0, 0.3]);
  gun('shotgun', 0.08, 1.26, 0.35, [[0.08, 0.1, 0.6, 0, 0, 0.12, 0x2a2724], [0.07, 0.11, 0.28, 0, -0.02, -0.27, 0x6a4a2c], [0.065, 0.06, 0.3, 0, -0.07, 0.3, 0x5a3d24], [0.04, 0.04, 0.25, 0, 0.03, 0.52, 0x151515]], [0.03, 0.66]);
  gun('smg', 0.12, 1.25, 0.4, [[0.07, 0.1, 0.4, 0, 0, 0.08, BLK, MET], [0.05, 0.08, 0.16, 0, 0, -0.18, 0x262626], [0.04, 0.2, 0.05, 0, -0.14, 0.12, 0x2a2a2a], [0.025, 0.025, 0.15, 0, 0.01, 0.34, 0x151515]], [0.01, 0.42]);
  gun('lmg', 0.08, 1.26, 0.35, [[0.09, 0.13, 0.66, 0, 0, 0.12, 0x333631, MET], [0.07, 0.13, 0.28, 0, -0.02, -0.3, 0x2a2c28], [0.12, 0.12, 0.14, 0.07, -0.1, 0.08, 0x4a4a2a], [0.035, 0.035, 0.4, 0, 0.02, 0.62, 0x151515], [0.02, 0.2, 0.02, 0, -0.12, 0.66, BLK]], [0.02, 0.84]);
  scene.add(root);
  const chute = new THREE.Group(); chute.position.y = 2.6; chute.visible = false; root.add(chute);
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2.4), new THREE.MeshStandardMaterial({ color: srgb(pick([0xc0392b, 0x2f7fd0, 0xd9a43a, 0x5a7a3a])), roughness: 0.8, side: THREE.DoubleSide }));
  canopy.scale.y = 0.6; canopy.castShadow = true; chute.add(canopy);
  return { root, body, legs, guns, helmet, cap, vest, chute, beret };
}

const ghostGeo = new THREE.CylinderGeometry(0.32, 0.28, 1.7, 10); ghostGeo.translate(0, 0.85, 0);
const ghostMatE = new THREE.MeshBasicMaterial({ color: 0xff4a3a, transparent: true, opacity: 0.45, depthTest: false, depthWrite: false, fog: false });
const ghostMatA = new THREE.MeshBasicMaterial({ color: 0x5fb0ff, transparent: true, opacity: 0.4, depthTest: false, depthWrite: false, fog: false });
class Soldier {
  constructor(name, isBot, team, cls, look = {}) {
    this.name = name; this.isBot = isBot; this.team = team; this.cls = cls; this.C = CLASSES[cls];
    this.m = buildSoldier(this.C.pal, team, !!this.C.heal, look);
    this.pos = new V3(); this.y = 0; this.vy = 0;
    this.hp = MAX_HP; this.alive = true; this.facing = 0; this.walk = 0; this.moving = false;
    this.stats = { k: 0, d: 0, dmg: 0 }; this.money = 800;
    this.inv = {}; this.ammo = {}; this.weapon = 'knife'; this.nades = {}; this.nadeSel = 'flash';
    this.armor = 0; this.helmet = false; this.healCd = 0;
    this.reloadT = 0; this.fireCd = 0; this.swingT = 0; this.blindT = 0; this.gunPull = 0;
    this.lastHurt = -99; this.lastShot = -99; this.respawnT = 0;
    const el = document.createElement('div'); el.className = 'tag ' + (!isBot ? '' : team === 'A' ? 'ally' : 'enemy');
    el.innerHTML = `<div class="st"></div>${name}<div class="b"><i></i></div>`; $('#tags').appendChild(el);
    this.ghost = new THREE.Mesh(ghostGeo, isBot && team !== 'A' ? ghostMatE : ghostMatA); this.ghost.renderOrder = 9; this.ghost.visible = false; this.m.root.add(this.ghost);
    const ar = document.createElement('div'); ar.className = 'edge' + (isBot && team !== 'A' ? '' : ' ally'); ar.textContent = '▲'; $('#tags').appendChild(ar); this.edge = ar;
    this.tag = el; this.tagFill = el.querySelector('i'); this.tagSt = el.querySelector('.st'); this.tagStTxt = '';
  }
  get w() { return WEAPONS[this.weapon]; }
  get loadout() { return [this.inv.primary, this.inv.secondary, 'knife'].filter(Boolean); }
  get mag() { return this.ammo[this.weapon]?.mag ?? 0; }
  set mag(v) { if (this.ammo[this.weapon]) this.ammo[this.weapon].mag = v; }
  get reserve() { return this.ammo[this.weapon]?.res ?? 0; }
  set reserve(v) { if (this.ammo[this.weapon]) this.ammo[this.weapon].res = v; }
  giveAmmo(id) { if (!id) return; const w = WEAPONS[id]; this.ammo[id] = { mag: w.mag, res: this.isBot ? 9999 : w.reserve }; }
  refill() { this.giveAmmo(this.inv.primary); this.giveAmmo(this.inv.secondary); }
  showGear() {
    for (const k in this.m.guns) {
      const G = this.m.guns[k], prim = k === this.inv.primary;
      G.g.visible = k === this.weapon && !this.turret && !this.veh; G.sil.visible = prim && !!this.att?.sil; G.sc.visible = prim && !!this.att?.mira;
    }
    this.m.helmet.visible = this.helmet; this.m.cap.visible = !this.helmet && !this.m.beret; this.m.vest.visible = this.armor > 0;
    if (this.m.beret) this.m.beret.visible = !this.helmet;
  }
  // silenciador e mira valem para a arma principal
  get attOn() { return this.weapon === this.inv.primary ? (this.att || {}) : {}; }
  spawn(x, z) {
    const c = this.C;
    this.pos.set(x, 0, z); this.y = terrainHeight(x, z); this.vy = 0;
    this.hp = MAX_HP; this.alive = true;
    this.inv = { primary: c.primary, secondary: c.secondary }; this.ammo = {}; this.refill();
    this.nades = { ...c.nades }; this.nadeSel = NADE_ORDER.find(n => this.nades[n] > 0) || 'flash';
    this.armor = c.armor; this.helmet = c.helmet; this.healCd = 0; this.kits = 0; this.healChan = 0; this.walking = false;
    this.att = {}; this.drones = c.drone || 0; this.downed = false; this.reviveT = 0; this.veh = null; this.turret = null; this.zip = null; this.revealT = 0;
    this.weapon = this.inv.primary; this.showGear();
    this.reloadT = 0; this.blindT = 0; this.m.body.rotation.x = 0; this.m.body.position.y = 0;
    this.air = 0; this.m.chute.visible = false;
  }
  switchTo(id) {
    if (!this.alive || this.turret || id === this.weapon || !this.loadout.includes(id)) return;
    this.weapon = id; this.reloadT = 0; this.fireCd = WEAPONS[id].scope ? 0.6 : 0.3; this.showGear();
    if (!this.isBot && !sfx('sacar', 0.35, { dur: 0.6 })) blip(620, 0.04, 0.06);
  }
  startReload() {
    if (!this.alive || this.w.kind !== 'gun' || this.reloadT > 0 || this.mag >= this.w.mag || this.reserve <= 0) return;
    this.reloadT = this.w.reload;
    { const dd = player.pos.distanceTo(this.pos); if (!sfx('recarga', (this.isBot ? 0.35 : 0.6) * clamp(1 - dd / 20, 0, 1), { dur: 1.6, pan: this.isBot ? panOf(this.pos) : 0 }) && !this.isBot) blip(420, 0.06, 0.08); }
  }
  move(dx, dz, speed, dt) {
    const l = Math.hypot(dx, dz); this.moving = l > 0.05 && this.alive && !this.veh && !this.turret && !this.zip;
    if (!this.moving) return;
    if (this.downed) speed = Math.min(speed, 1.1);
    this.pos.x += dx * speed * dt; this.pos.z += dz * speed * dt;
    collide(this.pos, BODY_R, this.y);
    for (const V of vehicles) {   // não atravessa veículos
      if (V.dead || Math.abs(V.y - this.y) > 1.2) continue;
      const vx = this.pos.x - V.pos.x, vz = this.pos.z - V.pos.z, d = Math.hypot(vx, vz), r = V.def.r + BODY_R * 0.8;
      if (d < r && d > 1e-4) { this.pos.x = V.pos.x + vx / d * r; this.pos.z = V.pos.z + vz / d * r; }
    }
  }
  physics(dt) {
    if (this.air === 'plane' || this.veh || this.zip) return;
    if (this.air === 'chute') {
      this.y -= 4.5 * dt; const g = groundAt(this.pos.x, this.pos.z, this.y);
      if (this.y <= g) { this.y = g; this.air = 0; this.m.chute.visible = false; if (this === player) toast('Pousou! Procure baús para pegar armas'); }
      return;
    }
    const g = groundAt(this.pos.x, this.pos.z, this.y);
    if (this.y > g + 0.02) { this.vy -= 22 * dt; this.y = Math.max(g, this.y + this.vy * dt); if (this.y === g) this.vy = 0; }
    else { this.y = g; this.vy = 0; }
  }
  update(dt) {
    if (this.isBot && this.alive && this.moving && !this.air && player && this.team !== player.team && (this.stepT = (this.stepT || 0) - dt) <= 0) {
      this.stepT = 0.55; if (this.pos.distanceTo(player.pos) < 16) addPing(this.pos.x, this.pos.z, 'step');
    }
    if (this.alive && this.moving && !this.air && player && (this.sndStep = (this.sndStep || 0) - dt) <= 0) {
      this.sndStep = this.walking ? 0.6 : 0.36;
      const dd = this === player ? 0 : this.pos.distanceTo(player.pos);
      if (dd < 16) sfx('passo', (this === player ? (this.walking ? 0.035 : 0.09) : 0.16 * (1 - dd / 16)), { dur: 0.28, rate: rand(0.92, 1.12), muffle: this === player ? 2500 : 1800, pan: this === player ? 0 : panOf(this.pos) });
    }
    if (this.healChan > 0) { this.healChan -= dt; if (this.healChan <= 0) { this.hp = Math.min(MAX_HP, this.hp + 45); if (this === player) toast('+45 vida (kit)'); } }
    if (this.fireCd > 0) this.fireCd -= dt;
    if (this.blindT > 0) this.blindT -= dt;
    if (this.healCd > 0) this.healCd -= dt;
    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) { const t = Math.min(this.w.mag - this.mag, this.reserve); this.mag += t; this.reserve -= t; this.reloadT = 0; }
    }
    if (this.revealT > 0) this.revealT -= dt;
    if (this.alive && !this.downed && now - this.lastHurt > 4 && this.hp < MAX_HP) this.hp = Math.min(MAX_HP, this.hp + 12 * dt);
    if (this.alive && this.downed && (this.downT -= dt) <= 0) { this.deathBy = 'sangrou até morrer'; const k = this.downBy && this.downBy !== this ? this.downBy : this; this.downed = false; die(this, k); }
    this.physics(dt);
    const r = this.m.root; r.position.set(this.pos.x, this.y, this.pos.z); r.visible = this.air !== 'plane';
    r.rotation.y += angDiff(r.rotation.y, this.facing) * Math.min(1, dt * 18);
    if (this.alive && this.downed) {
      // caído: deitado de lado, rasteja devagar
      this.m.body.rotation.x = lerp(this.m.body.rotation.x, -1.25, Math.min(1, dt * 8));
      this.m.body.position.y = lerp(this.m.body.position.y, 0.3, Math.min(1, dt * 8));
      this.walk += this.moving ? dt * 5 : 0; const sw = this.moving ? Math.sin(this.walk) * 0.4 : 0;
      this.m.legs[0].rotation.x = sw; this.m.legs[1].rotation.x = -sw;
    } else if (this.alive) {
      if (this.m.body.rotation.x !== 0) { this.m.body.rotation.x = lerp(this.m.body.rotation.x, 0, Math.min(1, dt * 8)); this.m.body.position.y = lerp(this.m.body.position.y, 0, Math.min(1, dt * 8)); if (Math.abs(this.m.body.rotation.x) < 0.01) { this.m.body.rotation.x = 0; this.m.body.position.y = 0; } }
      this.walk += this.moving ? dt * 11 : 0;
      const sw = this.moving && !this.veh ? Math.sin(this.walk) * 0.6 : 0;
      this.m.legs[0].rotation.x = this.veh ? -1.3 : sw; this.m.legs[1].rotation.x = this.veh ? -1.3 : -sw;
      // encostado na parede: recolhe a arma para ela não atravessar
      const G = this.m.guns[this.weapon];
      if (G) {
        const len = this.w.scope ? 1.4 : 1.2, o = eye(this, 1.26), f = new V3(o.x + Math.sin(this.facing) * len, o.y, o.z + Math.cos(this.facing) * len);
        const h = firstHit(o, f);
        this.gunPull = lerp(this.gunPull, h < len ? len - h : 0, Math.min(1, dt * 20));
        G.g.position.z = G.g.userData.z0 - this.gunPull; G.g.rotation.x = -this.gunPull * 0.9;
      }
    } else {
      this.m.body.rotation.x = lerp(this.m.body.rotation.x, -Math.PI / 2, Math.min(1, dt * 8));
      this.m.body.position.y = lerp(this.m.body.position.y, 0.15, Math.min(1, dt * 8));
    }
    const kn = this.m.guns.knife.g;
    if (this.swingT > 0) { this.swingT -= dt; const t = 1 - this.swingT / 0.22; kn.rotation.y = Math.sin(t * Math.PI) * -1.3; kn.position.x = 0.24 - Math.sin(t * Math.PI) * 0.3; }
    else { kn.rotation.y = 0; kn.position.x = 0.24; }
  }
  muzzlePos() {
    if (this.turret) { this.turret.g.updateMatrixWorld(true); return this.turret.mz.getWorldPosition(new V3()); }
    this.m.root.updateMatrixWorld(true); const G = this.m.guns[this.weapon]; return (this.attOn.sil ? G.sil : G.mz).getWorldPosition(new V3());
  }
  tryFire(ang, extraSpread = 0) {
    if (!this.alive || this.downed || this.veh || this.zip || this.reloadT > 0 || this.fireCd > 0) return false;
    if (this.healChan > 0) { this.healChan = 0; this.kits++; }
    const w = this.w, enemies = enemiesOf(this), att = this.attOn;
    if (this.turret) { const T = this.turret; if (T.cool > 0) return false; ang = T.ang + clamp(angDiff(T.ang, ang), -1.1, 1.1); }
    this.facing = ang; this.m.root.rotation.y = ang;
    if (w.kind === 'melee') return this.stab(ang, enemies);
    if (this.mag <= 0) {
      this.startReload();
      // sem munição: clique seco baixo e no máximo 1× a cada 0,5 s (antes repetia a cada quadro)
      if (!this.isBot && this.reserve <= 0 && now - (this.dryAt ?? -9) > 0.5) { this.dryAt = now; if (!sfx('seco', 0.16, { dur: 0.25 })) blip(180, 0.04, 0.025); }
      return false;
    }
    this.fireCd = w.rate; this.lastShot = now; if (tut && this === player) tut.shots++;
    if (this.turret) { const T = this.turret; T.heat += 0.05; if (T.heat >= 1) { T.cool = 4; if (this === player) toast('Metralhadora superaqueceu!'); } }
    else this.mag--;
    const range = w.range * (att.mira ? 1.25 : 1);
    const spread = ((this.moving ? (this.walking ? w.spread * 1.15 : (w.moveSpread ?? w.spread * 1.7)) : w.spread) + extraSpread) * (att.mira ? 0.8 : 1);
    const origin = eye(this, SHOT_H + (this.turret ? 0.5 : 0)), muzzle = this.muzzlePos();
    if (this.turret) { const T = this.turret, f = 2.0; origin.x = T.sx + Math.sin(ang) * f; origin.z = T.sz + Math.cos(ang) * f; }   // tiro sai na frente dos sacos de areia (antes batia neles)
    const quiet = !!att.sil, dp = player.pos.distanceTo(this.pos);
    if (!quiet) muzzleFlashLight(muzzle);
    spawnPart(muzzle, 0xffc066, quiet ? 0.25 : w.scope ? 0.8 : 0.55, 0.05, new V3(), true);
    if (quiet) { if (actx && dp < 18) { const v = 1 - dp / 18; noise(0.07, 0.16 * v, 'bandpass', 1400); tone(300, 90, 0.05, 0.06 * v); } }
    else shotSound(w, dp, this.weapon, this.pos);
    if (this !== player && this.team !== player.team && dp < (quiet ? 10 : 45)) addPing(this.pos.x, this.pos.z, 'shot');
    if (this === player && (w.scope || w.pellets)) shakeT = 0.12;
    for (const b of bots) if (b.alive && b.team !== this.team && b.pos.distanceTo(this.pos) < (quiet ? 8 : 32)) botHeard(b, this.pos);
    for (let i = 0; i < (w.pellets || 1); i++) this.shootRay(ang + (Math.random() - 0.5) * 2 * spread, origin.clone(), muzzle, w, enemies, range);
    if (this.mag === 0 && !this.turret) this.startReload();
    return true;
  }
  shootRay(a, origin, muzzle, w, enemies, range) {
    const dx = Math.sin(a), dz = Math.cos(a);
    let best = null, bestT = range;
    for (const t of enemies) {
      const ox = t.pos.x - origin.x, oz = t.pos.z - origin.z, proj = ox * dx + oz * dz;
      if (proj < 0 || proj > bestT) continue;
      const perp2 = ox * ox + oz * oz - proj * proj; if (perp2 > HIT_R * HIT_R) continue;
      best = t; bestT = Math.max(0.1, proj - Math.sqrt(HIT_R * HIT_R - perp2));
    }
    let end, path = null;
    if (best) {
      origin.y = this.y + SHOT_H + lean(this, best);
      const P = aimPoint(best, undefined, undefined, this);   // centro do alvo (a borda podia ficar dentro da mureta)
      let block = shotBlock(origin, P), dist = origin.distanceTo(P);
      let hp1 = hitProp, lh = lastHit;
      // alvo no alto (telhado/terraço): se a linha reta até a cabeça/ombro está livre, acerta (antes a mureta/laje sempre barrava)
      if (block < dist - 0.2 && best.y - this.y > 1.2) for (const hh of [1.65, 1.35]) {
        const Q = new V3(best.pos.x, best.y + hh, best.pos.z), b2 = firstHit(origin, Q), d2 = origin.distanceTo(Q);
        if (b2 >= d2 - 0.15 && !smokeBlocks(origin, Q)) { P.copy(Q); block = Infinity; dist = d2; break; }
      }
      hp1 = block < dist - 0.2 ? hp1 : null;
      if (block < dist - 0.2) { end = origin.clone().add(P.sub(origin).normalize().multiplyScalar(block)); bulletHit(end); if (hp1) hurtProp(hp1, randInt(w.dmg[0], w.dmg[1]), this); else wallChip(lh); }
      else { end = P; damage(best, randInt(w.dmg[0], w.dmg[1]) * (this.isBot ? diff.dmg : 1), this, w.pen); hitProp = null; blood(P); }
    } else {
      const g = groundShot(origin, dx, dz, range, this);
      const lh = lastHit; end = g.end;   // bala em linha reta: traçante reto do cano até onde bateu
      if (g.dist < Infinity) { bulletHit(end); if (hitProp) hurtProp(hitProp, randInt(w.dmg[0], w.dmg[1]), this); else if (lh) wallChip(lh); else groundMark(end, rand(0.12, 0.18)); }
    }
    if (Math.hypot(end.x - origin.x, end.z - origin.z) < Math.hypot(muzzle.x - origin.x, muzzle.z - origin.z) + 0.05) muzzle = origin;   // colado na parede: traçante não sai de trás dela
    tracer(muzzle, end, w.scope ? 0xfff2c8 : 0xffd894, w.scope ? 0.18 : w.pellets ? 0.05 : 0.07, path);
    glassAlong(origin, end);
  }
  stab(ang, enemies) {
    const w = this.w; this.fireCd = w.rate; this.swingT = 0.22;
    whoosh(player.pos.distanceTo(this.pos), true, this.pos);
    for (const t of enemies) {
      if (Math.abs(t.y - this.y) > 1.2) continue;
      const d = Math.hypot(t.pos.x - this.pos.x, t.pos.z - this.pos.z);
      if (d > w.range + 0.4 || Math.abs(angDiff(ang, Math.atan2(t.pos.x - this.pos.x, t.pos.z - this.pos.z))) > 0.9) continue;
      if (!los(this, t)) continue;
      damage(t, randInt(w.dmg[0], w.dmg[1]), this, w.pen); blood(eye(t, 1.2)); groundMark(t.pos.clone().setY(t.y), rand(0.25, 0.35), 0x5a0a07, 0.8, 12);
      return true;
    }
    // golpe no vazio: risco na parede/caixa à frente ou no chão
    for (const h of [1.1, 0.55]) {                              // altura do peito e baixa (caixas, sacos de areia)
      const o = eye(this, h), f = o.clone().add(new V3(Math.sin(ang) * (w.range + 0.3), 0, Math.cos(ang) * (w.range + 0.3)));
      if (firstHit(o, f) < Infinity && lastHit) { const hp = hitProp, lh = lastHit; wallChip(lh, true); bulletHit(lh.point); if (hp) hurtProp(hp, 25, this); return true; }
    }
    groundMark(new V3(this.pos.x + Math.sin(ang) * 1.2, this.y, this.pos.z + Math.cos(ang) * 1.2), 0.32, 0x1a1410, 0.75, CHIP_LIFE, 0.18);
    return true;
  }
  useKit() {
    if (!this.alive || !(this.kits > 0) || this.healChan > 0 || this.hp >= MAX_HP) return;
    this.kits--; this.healChan = 2.5; if (this === player) toast('Usando kit… (2,5 s)');
  }
  heal() {
    if (this.downed) return;
    if (!this.C.heal || this.healCd > 0) return this.useKit();
    if (!this.alive) return;
    this.healCd = HEAL_CD;
    for (const s of soldiers) {
      if (!s.alive || s.team !== this.team || s.pos.distanceTo(this.pos) > 5) continue;
      if (s.downed) { revive(s, this); continue; }
      s.hp = Math.min(MAX_HP, s.hp + 40);
      for (let i = 0; i < 6; i++) spawnPart(eye(s, rand(0.5, 1.8)), 0x7dff7d, 0.25, 0.8, new V3(rand(-0.3, 0.3), 1.2, rand(-0.3, 0.3)), true, 0, 0);
      if (s === player) toast('+40 vida');
    }
    if (actx) tone(660, 990, 0.25, 0.12);
  }
}

