'use strict';
// ================= loop =================
const clock = new THREE.Clock();
let mmT = 0, mmT2 = 0, matchEnd = '';
function showBoard(title) {
  started = false; matchEnd = ''; document.body.classList.remove('playing');
  if (/^VITÓRIA/.test(title)) { career.vitorias++; matchXP += 500; }
  matchXP += 50;
  const before = levelInfo(career.xp).lvl; career.xp += matchXP; saveCareer();
  const L = levelInfo(career.xp);
  $('#boardXP').innerHTML = (L.lvl > before ? `<div class="up">SUBIU PARA O NÍVEL ${L.lvl}!</div>` : '') + `+${matchXP} XP nesta partida · NÍVEL ${L.lvl} (${L.cur}/${L.need})<div class="xpbar"><i style="width:${(L.cur / L.need) * 100}%"></i></div>`;
  matchXP = 0;
  $('#boardTitle').textContent = title;
  const rows = [...soldiers].sort((a, b) => b.stats.k - a.stats.k || b.stats.dmg - a.stats.dmg);
  const cls = s => s === player ? 'me' : '';
  const tcl = s => mode === 'br' ? '' : s.team === player.team ? 'ta' : 'tb';
  $('#boardTable').innerHTML = '<tr><th>JOGADOR</th><th>CLASSE</th><th>ABATES</th><th>MORTES</th><th>DANO</th></tr>' +
    rows.map(s => `<tr class="${cls(s)}"><td class="${tcl(s)}">${s.name}</td><td>${s.C.name}</td><td>${s.stats.k}</td><td>${s.stats.d}</td><td>${Math.round(s.stats.dmg)}</td></tr>`).join('');
  $('#board').style.display = 'flex';
}
$('#again').addEventListener('click', () => { if (tut) { $('#board').style.display = 'none'; $('#play').click(); return; } $('#board').style.display = 'none'; career.partidas++; saveCareer(); setupMatch(choice.cls); started = true; document.body.classList.add('playing'); });
$('#toMenu').addEventListener('click', () => { tut = null; $('#board').style.display = 'none'; renderCareer(); $('#start').style.display = 'flex'; });
let paused = false;
function setPause(on) {
  if (!started && on) return;
  paused = on; $('#pause').style.display = on ? 'flex' : 'none';
  for (const k in keys) keys[k] = false; mouse.down = false;
  if (actx) on ? actx.suspend() : actx.resume();
  if (on) clock.getDelta();
}
$('#pauseBtn').addEventListener('pointerdown', e => { e.stopPropagation(); setPause(true); });
$('#resume').addEventListener('click', () => setPause(false));
$('#quit').addEventListener('click', () => { tut = null; $('#tut').style.display = 'none'; setPause(false); started = false; document.body.classList.remove('playing'); planeSnd?.stop(); planeSnd = null; hideCenter(); renderCareer(); $('#start').style.display = 'flex'; });
function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  if (document.hidden) { requestAnimationFrame(frame); return; }
  if (started && !paused) {
    now += dt;
    updatePlayer(dt);
    if (!roundOver && !(tut && tut.step < TUT.length - 1)) for (const b of bots) updateBot(b, dt);
    if (tut) updateTut();
    updateChips(dt);
    updateVehicles(dt); updateTurrets(dt);
    separate();
    for (const s of soldiers) {
      s.update(dt);
      if (!s.alive && !roundOver && RESPAWN_MODES.has(mode)) {
        s.respawnT -= dt;
        if (s === player && s.respawnT > 0) $('#csub').textContent = (killInfo ? killInfo + ' · ' : '') + `renascendo em ${Math.ceil(s.respawnT)}…`;
        if (s.respawnT <= 0) {
          const [x, z] = farSpawn(s); s.spawn(x, z);
          if (s === player) hideCenter(); else { s.ai = newAI(); s.ai.wp = nearestWP(s.pos); }
        }
      }
    }
    if (mode === 'br') { updatePlane(dt); updateZone(dt); updateDrops(dt); }
    if (mode === 'bomb') updateBomb(dt);
    if (mode === 'ctf' && !roundOver) updateCTF(dt);
    if (TEAM_MODES.has(mode) && !roundOver) updateDowned(dt);
    if (roundOver && (roundOver -= dt) <= 0) {
      roundOver = 0; hideCenter();
      if (matchEnd) showBoard(matchEnd);
      else if (mode === 'bomb') startBombRound();
      else { teamScore = { A: 0, B: 0 }; kills = deaths = 0; respawnAll(); }
      updateScore();
    }
    if (!RESPAWN_MODES.has(mode) || mode === 'ctf') if ((mmT2 += dt) > 0.5) { mmT2 = 0; updateScore(); }
    if (centerTimer > 0 && (centerTimer -= dt) <= 0) hideCenter();
    for (let i = pings.length - 1; i >= 0; i--) if ((pings[i].t -= dt) <= 0) pings.splice(i, 1);
    updateNades(dt); updateSmokes(dt); updateFires(dt); updateMines(dt); updateDoors(dt); updateDrone(dt); updateLoot(dt); updateParts(dt); updateRain(dt);
    if (boomLight.intensity > 0) boomLight.intensity = Math.max(0, boomLight.intensity - dt * 320);
    for (const m of muzzleLights) { m.t -= dt; m.l.intensity = m.t > 0 ? 18 : 0; }
    for (const t of tracers) if (t.life > 0 && (t.life -= dt) <= 0) t.l.visible = false;
    updateFalling(dt); updateCamera(dt); updateWalls(); updateHud();
    if ((mmT += dt) > 0.15) { mmT = 0; drawMinimap(); }
    if (now > 10) $('#hint').style.opacity = 0;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

