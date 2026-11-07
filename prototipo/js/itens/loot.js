'use strict';
// ---------- baús de loot: chegue perto, ABRIR (F), veja o item e PEGAR (F) ----------
const LOOT_SPOTS = [[-8, -24], [20, -3], [-20, 16], [3, 28], [-4.8, -11], [-3, -12.2, H1], [28, 20], [-30, -14], [16, -33], [-12, 30], [12, -16], [29.5, -3, BK_FLOOR], ...OUTER_LOOT];
const LOOT_TABLE = [['colete', 22], ['capacete', 16], ['medkit', 18], ['municao', 12], ['arma', 18], ['granada', 12], ['acessorio', 9], ['drone', 4]];
const ITEM_COLOR = { colete: 0x4c5a6a, capacete: 0x3d4a3a, medkit: 0xe8e2d6, municao: 0xb08a3a, arma: 0x222222, granada: 0x4a5a36, acessorio: 0x111111, drone: 0x6a7a8a, drop: 0xd04a2a };
const loots = [];
const lootMats = {
  body: new THREE.MeshStandardMaterial({ color: srgb(0x4d5a35), roughness: 0.8 }), lid: new THREE.MeshStandardMaterial({ color: srgb(0x5e6c40), roughness: 0.8 }),
  dbody: new THREE.MeshStandardMaterial({ color: srgb(0x8a2a1e), roughness: 0.7 }), dlid: new THREE.MeshStandardMaterial({ color: srgb(0xa8382a), roughness: 0.7 }),
  strip: new THREE.MeshStandardMaterial({ color: srgb(0xd9c25a), roughness: 0.6, emissive: srgb(0x332a00) }), inner: new THREE.MeshStandardMaterial({ color: srgb(0x1e2216), roughness: 1 }),
};
function makeLoot(x, z, yy, drop = false) {
  const y = yy ?? (x > BARN.x0 && x < BARN.x1 && z > BARN.z0 && z < BARN.z1 ? BARN_Y : terrainHeight(x, z) - 0.02);
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rand(-0.4, 0.4);
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.62, 0.85), drop ? lootMats.dbody : lootMats.body); b.position.y = 0.31; b.castShadow = b.receiveShadow = true; g.add(b);
  const ins = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 0.75), lootMats.inner); ins.position.y = 0.63; g.add(ins);
  const s = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.08, 0.14), lootMats.strip); s.position.y = 0.45; g.add(s);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.62, -0.43); g.add(hinge);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.12, 0.87), drop ? lootMats.dlid : lootMats.lid); lid.position.set(0, 0.06, 0.43); lid.castShadow = true; hinge.add(lid);
  const item = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.35), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, emissive: srgb(0x222200) }));
  item.position.y = 0.85; item.visible = false; g.add(item);
  scene.add(g);
  if (yy === H1) upper.push(b, s, lid, ins, item);
  const tag = document.createElement('div'); tag.className = 'lootTag'; tag.style.display = 'none'; $('#tags').appendChild(tag);
  const col = { x0: x - 0.7, x1: x + 0.7, z0: z - 0.43, z1: z + 0.43, y0: y, y1: y + 0.62 };
  colliders.push(col);
  const L = { x, z, y, g, hinge, item, tag, col, state: 'closed', loot: null, t: 0, ang: 0, drop };
  loots.push(L); return L;
}
for (const [x, z, yy] of LOOT_SPOTS) makeLoot(x, z, yy);
function removeLoot(L) {
  scene.remove(L.g); L.tag.remove(); const i = loots.indexOf(L); if (i >= 0) loots.splice(i, 1);
  const ci = colliders.indexOf(L.col); if (ci >= 0) colliders.splice(ci, 1);
}
function rollLoot() {
  let r = rand(0, LOOT_TABLE.reduce((a, b) => a + b[1], 0)), k = 'medkit';
  for (const [kk, w] of LOOT_TABLE) if ((r -= w) <= 0) { k = kk; break; }
  const sub = k === 'arma' ? pick(['ak', 'm4', 'awp', 'awp', 'shotgun', 'shotgun', 'smg', 'smg', 'lmg']) : k === 'granada' ? pick(NADE_ORDER) : k === 'acessorio' ? pick(['sil', 'mira']) : null;
  return { k, sub };
}
const ATT_NAME = { sil: 'Silenciador', mira: 'Mira' };
const lootName = L => L.k === 'colete' ? 'Colete' : L.k === 'capacete' ? 'Capacete' : L.k === 'medkit' ? 'Kit médico' : L.k === 'municao' ? 'Munição'
  : L.k === 'arma' ? WEAPONS[L.sub].name : L.k === 'acessorio' ? ATT_NAME[L.sub] : L.k === 'drone' ? 'Drone' : L.k === 'drop' ? 'Airdrop: ' + L.items.map(lootName).join(' + ') : 'Granada ' + NADES[L.sub].name;
for (const l of loots) l.loot = rollLoot();
function giveLoot(s, L) {
  if (typeof L === 'string') L = { k: L, sub: L === 'arma' ? 'awp' : L === 'granada' ? 'he' : L === 'acessorio' ? 'sil' : null };
  const k = L.k;
  if (k === 'drop') { for (const it of L.items) giveLoot(s, it); return; }
  if (k === 'colete') s.armor = 100;
  else if (k === 'capacete') s.helmet = true;
  else if (k === 'medkit') s.kits = (s.kits || 0) + 1;
  else if (k === 'municao') s.refill();
  else if (k === 'granada') { s.nades[L.sub] = (s.nades[L.sub] || 0) + 1; if (!(s.nades[s.nadeSel] > 0)) s.nadeSel = L.sub; }
  else if (k === 'acessorio') s.att[L.sub] = true;
  else if (k === 'drone') s.drones = (s.drones || 0) + 1;
  else if (k === 'arma') {
    const wasPrimary = s.isBot || !s.inv.primary || s.weapon === s.inv.primary;
    s.inv.primary = L.sub; s.giveAmmo(L.sub);
    if (wasPrimary && !s.turret) { s.weapon = L.sub; s.reloadT = 0; }
  }
  s.showGear();
  if (s === player) { toast('+ ' + lootName(L) + (k === 'medkit' ? ' · use em CURA/E (2,5 s)' : k === 'colete' ? ' (100)' : k === 'acessorio' ? ' (arma principal)' : k === 'drone' ? ' · botão DRONE / V' : '')); if (!sfx('pegar', 0.5, { dur: 1 }) && actx) tone(520, 880, 0.15, 0.1); }
}
function openLoot(l) {
  { const d = Math.hypot(player.pos.x - l.x, player.pos.z - l.z); if (d < 18 && sfx('bau', 0.55 * (1 - d / 18), { dur: 2 })) l.quiet = true; }
  l.state = 'open'; l.item.material.color.set(ITEM_COLOR[l.loot.k]); l.item.visible = true;
  if (actx) { noise(0.25, 0.12, 'lowpass', 900); tone(180, 120, 0.2, 0.08); }
}
function takeLoot(l, s) {
  giveLoot(s, l.loot); l.state = 'empty'; l.t = 30; l.item.visible = false; l.tag.style.display = 'none';
  if (l.drop) { l.state = 'gone'; setTimeout(() => removeLoot(l), 2500); }
}
let nearLoot = null, curAct = null;
// ação do botão laranja / tecla F: escolhe a coisa mais importante perto do jogador
function playerAction() {
  const p = player;
  if (p.air === 'plane') return { t: 'SALTAR DO AVIÃO', f: () => jumpOut(p) };
  if (!started || !p.alive || p.air || p.downed) return null;
  if (p.veh) return { t: 'SAIR DO ' + p.veh.def.name.toUpperCase(), f: () => exitVeh(p) };
  if (p.turret) return { t: 'SAIR DA METRALHADORA', f: () => leaveTurret(p) };
  if (p.zip) return null;
  if (mode === 'bomb' && bombS.plantBy === p) return { t: `PLANTANDO… ${(3 - bombS.plantT).toFixed(1)} s (não se mexa)` };
  if (mode === 'bomb' && bombS.carrier === p && siteOf(p) && !bombS.planted) return { t: 'PLANTAR BOMBA', f: () => { bombS.plantBy = p; bombS.plantT = 0; sfx('plantar', 0.6); } };
  const dn = soldiers.find(o => o !== p && o.alive && o.downed && o.team === p.team && Math.hypot(o.pos.x - p.pos.x, o.pos.z - p.pos.z) < 1.6);
  if (dn) return { t: `LEVANTANDO ${dn.name.toUpperCase()}… ${Math.max(0, 3 - dn.reviveT).toFixed(1)} s (fique parado)` };
  const l = nearLoot;
  if (l) return { t: l.state === 'closed' ? (l.drop ? 'ABRIR AIRDROP' : 'ABRIR BAÚ') : 'PEGAR ' + lootName(l.loot).toUpperCase(), f: () => { if (l.state === 'closed') openLoot(l); else if (l.state === 'open') takeLoot(l, p); } };
  const T = turrets.find(T => T.g.visible && !T.user && Math.hypot(T.sx - p.pos.x, T.sz - p.pos.z) < 1.5 && Math.abs(T.y - p.y) < 1);
  if (T) return { t: 'USAR METRALHADORA FIXA', f: () => useTurret(p, T) };
  const V = vehicles.find(V => !V.dead && !V.driver && Math.hypot(V.pos.x - p.pos.x, V.pos.z - p.pos.z) < V.def.r + 1.3 && Math.abs(V.y - p.y) < 1.2);
  if (V) return { t: 'ENTRAR NO ' + V.def.name.toUpperCase(), f: () => enterVeh(p, V) };
  for (const Z of zips) for (const [a, b] of [[Z.a, Z.b], [Z.b, Z.a]])
    if (Math.hypot(a.x - p.pos.x, a.z - p.pos.z) < 1.7 && Math.abs(a.y - p.y) < 1) return { t: Z.ladder ? (a === Z.a ? 'SUBIR ESCADA' : 'DESCER ESCADA') : 'DESCER NA TIROLESA', f: () => { p.zip = { a, b, t: 0, len: Math.hypot(b.x - a.x, b.z - a.z), Z }; p.reloadT = 0; if (actx) Z.ladder ? noise(0.25, 0.08, 'lowpass', 900) : noise(0.4, 0.15, 'highpass', 2500); } };
  let D = null, dd = 1.7;
  for (const d of doors) { if (d.broken || Math.abs(d.y0 - p.y) > 1.2) continue; const k = Math.hypot(d.cx - p.pos.x, d.cz - p.pos.z); if (k < dd) { dd = k; D = d; } }
  if (D) return { t: D.open ? 'FECHAR PORTA' : 'ABRIR PORTA', f: () => setDoor(D, !D.open) };
  return null;
}
function lootAction() { const a = playerAction(); if (a && a.f) { if (tut) { tut.acts.add(a.t.split(' ')[0]); tut.acts.add(a.t.split(' ').slice(0, 2).join(' ')); } a.f(); } }
const actBtn = $('#actBtn');
actBtn.addEventListener('pointerdown', e => { e.stopPropagation(); lastTouch = e.pointerType === 'mouse' ? lastTouch : now; lootAction(); });
function updateLoot(dt) {
  nearLoot = null; let nd = 1.7;
  for (const l of loots) {
    l.ang = lerp(l.ang, l.state === 'closed' ? 0 : -1.9, Math.min(1, dt * 10)); l.hinge.rotation.x = l.ang;
    if (l.state === 'gone') continue;
    if (l.state === 'empty') { if ((l.t -= dt) <= 0) { l.state = 'closed'; l.loot = rollLoot(); } continue; }
    if (l.state === 'open') { l.item.rotation.y += dt * 2; l.item.position.y = 0.85 + Math.sin(now * 3) * 0.05; }
    for (const s of soldiers) {
      if (!s.alive || s.air || s.downed || s.veh || Math.abs(s.y - l.y) > 1) continue;
      const d = Math.hypot(s.pos.x - l.x, s.pos.z - l.z);
      if (s === player) { if (d < nd) { nd = d; nearLoot = l; } }
      else if (d < 1.4) { if (l.state === 'closed') openLoot(l); takeLoot(l, s); break; }   // bots abrem e pegam direto
    }
    // etiqueta com o nome do item quando aberto
    if (l.state === 'open') {
      const [x, y, ok] = toScreen(new V3(l.x, l.y + 1.4, l.z));
      const hidden = !ok || (upper.includes(l.item) && !upper[0].visible);
      l.tag.style.display = hidden ? 'none' : ''; l.tag.textContent = lootName(l.loot);
      l.tag.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
    } else l.tag.style.display = 'none';
  }
  curAct = playerAction();
  const txt = curAct ? curAct.t + (isTouch || !curAct.f ? '' : '  (F)') : '';
  if (actBtn.textContent !== txt) actBtn.textContent = txt;
  actBtn.style.display = txt ? 'block' : 'none';
}

