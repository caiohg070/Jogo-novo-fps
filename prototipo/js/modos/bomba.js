'use strict';
// ================= Bomba =================
const BOMB_GOAL = 5;
const SITES = [{ name: 'A', x: 16, z: -28.5, r: 3.2 }, { name: 'B', x: -20, z: 5, r: 3.2 }];
function letterTex(t) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = 'rgba(232,163,58,.95)'; g.font = 'bold 110px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 64, 70);
  return new THREE.CanvasTexture(c);
}
for (const st of SITES) {
  st.y = st.name === 'A' ? BARN_Y : terrainHeight(st.x, st.z);
  st.g = new THREE.Group(); st.g.position.set(st.x, st.y + 0.05, st.z);
  const ring = new THREE.Mesh(new THREE.RingGeometry(st.r - 0.2, st.r, 48), new THREE.MeshBasicMaterial({ color: 0xe8a33a, transparent: true, opacity: 0.7, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; st.g.add(ring);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: letterTex(st.name), transparent: true, depthWrite: false })); sp.position.y = 3.2; sp.scale.setScalar(2); st.g.add(sp);
  st.g.visible = false; scene.add(st.g);
}
const bombMesh = new THREE.Group();
{
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.32), new THREE.MeshStandardMaterial({ color: srgb(0x3a2a22), roughness: 0.7 })); b.position.y = 0.1; bombMesh.add(b);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), new THREE.MeshBasicMaterial({ color: 0xff2a1a })); led.position.set(0.1, 0.22, 0); bombMesh.add(led); bombMesh.userData.led = led;
  bombMesh.visible = false; scene.add(bombMesh);
}
const bombS = { round: 0, score: { A: 0, B: 0 }, carrier: null, pos: null, planted: false, timer: 0, roundT: 0, plantBy: null, plantT: 0, defuseT: 0, beep: 0 };
const siteOf = s => SITES.find(st => Math.hypot(s.pos.x - st.x, s.pos.z - st.z) < st.r && Math.abs(s.y - st.y) < 1.5);
const SHOP = [['deagle', 'Desert Eagle', 700], ['shotgun', 'Escopeta', 1100], ['smg', 'SMG', 1250], ['ak', 'AK-47', 2700], ['m4', 'Colt M4', 3100], ['awp', 'AWP', 4750], ['lmg', 'Metralhadora', 5200],
  ['colete', 'Colete', 650], ['kitcap', 'Colete + capacete', 1000], ['sil', 'Silenciador', 400], ['drone', 'Drone', 600],
  ['he', 'Granada HE', 300], ['flash', 'Flash', 200], ['smoke', 'Smoke', 300], ['molotov', 'Molotov', 400], ['mine', 'Mina', 400]];
function buy(s, id) {
  const it = SHOP.find(i => i[0] === id); if (!it || s.money < it[2]) return false;
  if (WEAPONS[id]) { const slot = WEAPONS[id].slot; if (s.inv[slot] === id) return false; s.inv[slot] = id; s.giveAmmo(id); s.weapon = id; s.reloadT = 0; }
  else if (id === 'colete') { if (s.armor >= 100) return false; s.armor = 100; }
  else if (id === 'kitcap') { if (s.armor >= 100 && s.helmet) return false; s.armor = 100; s.helmet = true; }
  else if (id === 'sil' || id === 'mira') { if (s.att[id]) return false; s.att[id] = true; }
  else if (id === 'drone') { if (s.drones >= 1) return false; s.drones = 1; }
  else { if ((s.nades[id] || 0) >= 2) return false; s.nades[id] = (s.nades[id] || 0) + 1; if (!(s.nades[s.nadeSel] > 0)) s.nadeSel = id; }
  s.money -= it[2]; s.showGear(); return true;
}
function botBuy(b) {
  const want = b.cls === 'sniper' ? ['awp', 'ak'] : b.team === 'A' ? [pick(['ak', 'ak', 'smg', 'shotgun'])] : [pick(['m4', 'm4', 'smg', 'shotgun']), 'ak'];
  for (const w of want) if (b.money >= SHOP.find(i => i[0] === w)[2] + 650) { buy(b, w); break; }
  if (!buy(b, 'kitcap')) buy(b, 'colete');
  if (b.money > 400) buy(b, pick(['he', 'flash', 'smoke', 'molotov']));
  if (!b.inv.primary && b.money >= 700) buy(b, 'deagle');
}
function renderShop() {
  $('#money').textContent = '$' + player.money;
  $('#buyGrid').innerHTML = SHOP.map(([id, n, c]) => `<button data-id="${id}" ${player.money < c ? 'disabled' : ''}>${n}<small>$${c}</small></button>`).join('');
}
$('#buyGrid').addEventListener('click', e => { const b = e.target.closest('button'); if (b && buy(player, b.dataset.id)) { renderShop(); if (actx) tone(700, 900, 0.08, 0.08); } });
$('#buyClose').addEventListener('click', () => { $('#buy').style.display = 'none'; });
function openShop() { if (mode !== 'bomb' || !(bombS.buyT > 0) || !player.alive) return; renderShop(); $('#buy').style.display = 'flex'; }
function toggleFS() {
  const d = document, el = d.documentElement;
  const isFS = d.fullscreenElement || d.webkitFullscreenElement;
  try {
    if (isFS) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else { const r = (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el, { navigationUI: 'hide' });
      if (r && r.then) r.then(() => screen.orientation?.lock?.('landscape')).catch(() => toast('Tela cheia bloqueada aqui: abra o link no Chrome do celular'));
      else if (!r) toast('Tela cheia não disponível neste app: abra o link no Chrome do celular'); }
  } catch { toast('Tela cheia não disponível neste app: abra o link no Chrome do celular'); }
}
$('#fsBtn').addEventListener('pointerdown', e => { e.stopPropagation(); toggleFS(); });
// celular bloqueado / aba escondida: pausa o som e o jogo
document.addEventListener('visibilitychange', () => {
  if (!actx) return;
  if (document.hidden) actx.suspend(); else if (!paused) actx.resume();
});
addEventListener('pagehide', () => actx?.suspend());
$('#buyBtn').addEventListener('pointerdown', e => { e.stopPropagation(); openShop(); });
function startBombRound() {
  if (bombS.round === 0) for (const s of soldiers) { s.money = 800; s.stats = { k: 0, d: 0, dmg: 0 }; }
  bombS.round++; clearWorld(); respawnAll();
  for (const s of soldiers) { s.inv.primary = null; s.weapon = s.inv.secondary; s.armor = 0; s.helmet = false; s.nades = {}; s.showGear(); if (s.isBot) botBuy(s); }
  bombS.buyT = 15;
  Object.assign(bombS, { carrier: player, pos: null, planted: false, timer: 0, roundT: 100, plantBy: null, plantT: 0, defuseT: 0 });
  bombMesh.visible = false;
  showCenter(`RODADA ${bombS.round}`, `você está com a bomba · $${player.money} para comprar (15 s)`, 2.5);
}
function endBombRound(winner, why) {
  if (roundOver) return;
  bombS.score[winner]++; roundOver = 4; bombS.plantBy = null;
  const over = bombS.score[winner] >= BOMB_GOAL;
  for (const s of soldiers) s.money = Math.min(16000, s.money + (s.team === winner ? 3250 : 1900));
  if (over) matchEnd = (winner === 'A' ? 'VITÓRIA · ' : 'DERROTA · ') + `${bombS.score.A} × ${bombS.score.B}`;
  showCenter(winner === 'A' ? (over ? 'VOCÊS VENCERAM A PARTIDA' : 'RODADA GANHA') : (over ? 'DERROTA NA PARTIDA' : 'RODADA PERDIDA'), `${why} · ${bombS.score.A} × ${bombS.score.B}`, 4);
  updateScore();
}
function bombCheckWipe() {
  const a = soldiers.some(s => s.alive && !s.downed && s.team === 'A'), b = soldiers.some(s => s.alive && !s.downed && s.team === 'B');
  if (!b) endBombRound('A', 'time vermelho eliminado');
  else if (!a && !bombS.planted) endBombRound('B', 'time azul eliminado');
}
function bombExplode() {
  const P = bombS.pos.clone(); P.y += 0.5;
  boomLight.position.copy(P); boomLight.color.set(0xff8030); boomLight.intensity = 250; shakeT = 0.8;
  for (let i = 0; i < 30; i++) spawnPart(P, i < 12 ? 0xffa040 : 0x3d342c, rand(1, 2.5), rand(0.6, 1.6), new V3(rand(-7, 7), rand(2, 9), rand(-7, 7)), i < 12, 3);
  boom(player.pos.distanceTo(P) * 0.5, P);
  for (const s of soldiers) {
    const d = Math.hypot(s.pos.x - P.x, s.pos.z - P.z);
    if (s.alive && d < 14) { s.hp -= 220 * (1 - d / 14); if (s.hp <= 0) { s.hp = 0; s.deathBy = 'explosão da bomba'; s.alive = false; s.respawnT = 3; feed(s, s); } }
  }
  bombMesh.visible = false;
  endBombRound('A', 'a bomba explodiu');
}
const mustDefuse = b => mode === 'bomb' && b.team === 'B' && bombS.planted && !roundOver && bombS.timer < 9;
function objectiveFor(b) {
  if (mode === 'ctf' && !roundOver) return ctfObjective(b);
  if (mode !== 'bomb' || roundOver) return null;
  if (b.team === 'A') {
    if (bombS.carrier === b) {
      const st = SITES.reduce((a, c) => Math.hypot(c.x - b.pos.x, c.z - b.pos.z) < Math.hypot(a.x - b.pos.x, a.z - b.pos.z) ? c : a);
      return { x: st.x, z: st.z, stop: 1.2, act: bb => { if (!bombS.plantBy && siteOf(bb)) { bombS.plantBy = bb; bombS.plantT = 0; sfx('plantar', 0.5 * vol(bb.pos.distanceTo(player.pos) * 1.5)); } } };
    }
    if (!bombS.carrier && bombS.pos && !bombS.planted) return { x: bombS.pos.x, z: bombS.pos.z, stop: 0.3 };
    // bomba plantada: o time que plantou se posiciona em volta e fica de tocaia
    if (bombS.planted) {
      if (!b.ai.guard) { const a = rand(0, 6.28); b.ai.guard = { x: bombS.pos.x + Math.cos(a) * rand(5, 8), z: bombS.pos.z + Math.sin(a) * rand(5, 8) }; }
      return { x: b.ai.guard.x, z: b.ai.guard.z, stop: 0.8, act: (bb, dt) => { bb.facing = Math.atan2(bombS.pos.x - bb.pos.x, bombS.pos.z - bb.pos.z) + Math.sin(now * 0.8) * 0.9; } };
    }
    return null;
  }
  if (bombS.planted) {
    // CT: não corre direto; viu inimigo há pouco → luta primeiro; senão limpa 1–2 pontos em volta antes de desarmar
    const ai = b.ai;
    if (bombS.timer > 9 && now - (ai.lastEnemyT ?? -99) < 4) return null;
    if (!ai.clearPts) {
      const a0 = Math.atan2(b.pos.z - bombS.pos.z, b.pos.x - bombS.pos.x);
      ai.clearPts = [0, 1].map(i => ({ x: bombS.pos.x + Math.cos(a0 + i * 1.4 - 0.7) * 7, z: bombS.pos.z + Math.sin(a0 + i * 1.4 - 0.7) * 7 })).slice(0, bombS.timer > 18 ? 2 : 1);
      ai.clearIdx = 0; ai.holdT = 0;
    }
    if (ai.clearIdx < ai.clearPts.length && bombS.timer > 9) {
      const c = ai.clearPts[ai.clearIdx];
      return { x: c.x, z: c.z, stop: 1.2, act: (bb, dt) => { bb.facing += dt * 2.5; if ((ai.holdT += dt) > 1.6) { ai.clearIdx++; ai.holdT = 0; } } };
    }
    return { x: bombS.pos.x, z: bombS.pos.z, stop: 1.0, act: () => {} };
  }
  return null;
}
function updateBomb(dt) {
  if (roundOver) { $('#buyBtn').style.display = 'none'; return; }
  const S = bombS;
  if (S.buyT > 0) S.buyT -= dt;
  const canBuy = S.buyT > 0 && player.alive;
  $('#buyBtn').style.display = canBuy ? 'block' : 'none';
  if (canBuy) $('#buyBtn').textContent = `COMPRAR $${player.money} · ${Math.ceil(S.buyT)} s` + (isTouch ? '' : ' (B)');
  else if ($('#buy').style.display === 'flex') $('#buy').style.display = 'none';
  if (S.carrier && !S.carrier.alive) { S.pos = new V3(S.carrier.pos.x, S.carrier.y, S.carrier.pos.z); S.carrier = null; if (S.plantBy) S.plantBy = null; }
  if (!S.carrier && !S.planted && S.pos) {
    for (const s of soldiers) if (s.alive && s.team === 'A' && Math.hypot(s.pos.x - S.pos.x, s.pos.z - S.pos.z) < 1.2) { S.carrier = s; S.pos = null; if (s === player) toast('Você pegou a bomba'); break; }
  }
  if (S.plantBy) {
    const pb = S.plantBy;
    if (!pb.alive || pb.downed || pb.moving || !siteOf(pb)) S.plantBy = null;
    else if ((S.plantT += dt) >= 3) {
      if (pb === player) addXP(150, 'bomba plantada'); pb.money = Math.min(16000, pb.money + 300); S.planted = true; S.pos = new V3(pb.pos.x, pb.y, pb.pos.z); S.carrier = null; S.plantBy = null; S.timer = 35;
      showCenter('BOMBA PLANTADA', 'defenda até explodir', 2.5);
      for (const b of bots) if (b.team === 'B' && b.alive) { b.ai.state = 'patrol'; }
    }
  }
  if (S.planted) {
    S.timer -= dt;
    if ((S.beep -= dt) <= 0) { S.beep = S.timer > 10 ? 1 : S.timer > 4 ? 0.5 : 0.2; { const bv = vol(player.pos.distanceTo(S.pos) * 0.6); if (!sfx('bipe', 0.35 * bv, { dur: 0.25 })) blip(1600, 0.05, 0.07 * bv); } bombMesh.userData.led.visible = !bombMesh.userData.led.visible; }
    // desarme: um CT parado ao lado por 5 s
    const def = soldiers.find(s => s.alive && !s.downed && !s.veh && s.team === 'B' && !s.moving && Math.hypot(s.pos.x - S.pos.x, s.pos.z - S.pos.z) < 1.4);
    if (def) { if (S.defuseT === 0) { sfx('plantar', 0.5 * vol(def.pos.distanceTo(player.pos) * 1.5), { rate: 0.8 }); S.cut = 0.6; } if ((S.cut -= dt) <= 0) { S.cut = 0.7; snip(def.pos.distanceTo(player.pos)); } S.defuseT += dt; def.tagSt.textContent = 'DESARMANDO'; if (S.defuseT >= 5) { bombMesh.visible = false; endBombRound('B', 'bomba desarmada'); return; } }
    else S.defuseT = 0;
    if (S.timer <= 0) { bombExplode(); return; }
  } else if ((S.roundT -= dt) <= 0) { endBombRound('B', 'tempo esgotado'); return; }
  bombMesh.visible = !!S.pos;
  if (S.pos) bombMesh.position.copy(S.pos);
}

