'use strict';
// ================= partida =================
function setupMatch(cls) {
  matchXP = 0;
  for (const s of soldiers) { scene.remove(s.m.root); s.tag.remove(); s.edge.remove(); }
  clearWorld();
  player = new Soldier('Você', false, 'A', cls, { skin: choice.skin, acc: choice.acc });
  if (mode === 'br') player.team = 'P';
  const rl = () => ({ skin: Math.random() < 0.5 ? pick(Object.keys(SKINS)) : 'padrao', acc: pick(['nenhum', 'nenhum', 'boina', 'oculos', 'mascara', 'mochila']) });
  bots = mode === 'br' ? [1, 2, 3, 4, 5, 6, 7].map(i => new Soldier('Bot ' + i, true, 'b' + i, pick(['tr', 'ct', 'medic', 'sniper']), rl()))
    : mode === 'bomb' ? [new Soldier('Aliado 1', true, 'A', 'tr'), new Soldier('Aliado 2', true, 'A', 'medic'),
       new Soldier('CT 1', true, 'B', 'ct'), new Soldier('CT 2', true, 'B', 'ct'), new Soldier('CT 3', true, 'B', 'sniper')]
    : mode === 'tdm' || mode === 'ctf'
    ? [new Soldier('Aliado 1', true, 'A', 'ct'), new Soldier('Aliado 2', true, 'A', 'medic'),
       new Soldier('Inimigo 1', true, 'B', 'tr'), new Soldier('Inimigo 2', true, 'B', 'sniper'), new Soldier('Inimigo 3', true, 'B', 'tr')]
    : [new Soldier('Bot 1', true, 'B', 'tr'), new Soldier('Bot 2', true, 'B', pick(['sniper', 'ct']))];
  soldiers = [player, ...bots];
  if (mode === 'ctf') { bots[0].role = 'atk'; bots[1].role = 'def'; bots[2].role = 'atk'; bots[3].role = 'def'; bots[4].role = 'atk'; ctfReset(); }
  for (const F of Object.values(FLAGS)) { F.g.visible = mode === 'ctf'; F.ring.visible = mode === 'ctf'; }
  document.body.classList.toggle('medic', !!player.C.heal);
  kills = deaths = 0; teamScore = { A: 0, B: 0 };
  for (const site of SITES) site.g.visible = mode === 'bomb';
  planeSnd?.stop(); planeSnd = null;
  zoneMesh.visible = false; plane.mesh.visible = false; bombMesh.visible = false; $('#buyBtn').style.display = 'none'; matchEnd = ''; roundOver = 0; pings.length = 0;
  for (const st of soldiers) st.stats = { k: 0, d: 0, dmg: 0 };
  if (mode === 'br') startBR();
  else if (mode === 'bomb') { bombS.score = { A: 0, B: 0 }; bombS.round = 0; startBombRound(); }
  else respawnAll();
  updateScore();
}
// limpa granadas, fogo, minas, airdrops, veículos e metralhadoras entre partidas/rodadas
function clearWorld() {
  resetGlass(); clearChips();
  for (const n of nades) scene.remove(n.m); nades.length = 0;
  for (const f of fires) scene.remove(f.light); fires.length = 0;
  for (const M of mines) scene.remove(M.m); mines.length = 0;
  for (const s of smokes) for (const sp of s.sprites) scene.remove(sp); smokes.length = 0;
  for (const L of loots.filter(l => l.drop)) removeLoot(L);
  for (const D of drops) scene.remove(D.g); drops.length = 0;
  for (const V of vehicles) { if (V.driver) { V.driver.veh = null; V.driver = null; } V.reset(); }
  for (const T of turrets) { T.user = null; T.heat = 0; T.cool = 0; T.g.visible = mode === 'ctf'; }   // metralhadora fixa só no modo Bandeira
  engineStop(); droneT = 0; droneMesh.visible = false;
}
function respawnAll() {
  for (const s of soldiers) s.alive = false;
  for (const s of soldiers) { const [x, z] = farSpawn(s); s.spawn(x, z); if (s.isBot) { s.ai = newAI(); s.ai.wp = nearestWP(s.pos); } }
  camTarget.set(player.pos.x, player.y, player.pos.z);
}

