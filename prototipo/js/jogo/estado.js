'use strict';
// ================= estado do jogo =================
let now = 0, started = false, kills = 0, deaths = 0, mode = 'treino', teamScore = { A: 0, B: 0 }, roundOver = 0;
const TDM_GOAL = 20;
let player, bots = [], soldiers = [];
const enemiesOf = s => soldiers.filter(o => o.alive && !o.air && o.team !== s.team);
const SPAWNS = { A: [[0, 22], [-24, 20], [27, 4], [-6, 30], [12, 28]], B: [[-19, -22], [24, -18], [-28, -4], [2, -26], [-4, -34]] };
function farSpawn(s) {
  let best = SPAWNS[s.team][0], bd = -Infinity;
  for (const p of SPAWNS[s.team]) {
    let d = 60;
    for (const o of soldiers) if (o !== s && o.alive && o.team !== s.team) d = Math.min(d, Math.hypot(p[0] - o.pos.x, p[1] - o.pos.z));
    for (const o of soldiers) if (o !== s && o.alive && Math.hypot(p[0] - o.pos.x, p[1] - o.pos.z) < 1.5) d -= 30;
    d += rand(0, 6);
    if (d > bd) { bd = d; best = p; }
  }
  return [best[0] + rand(-1, 1), best[1] + rand(-1, 1)];
}

// modos de time: com 0 de vida o soldado CAI (rasteja, não atira); aliado parado ao lado por 3 s levanta (médico: na hora, com a cura)
const canDown = t => TEAM_MODES.has(mode) && !t.downed && !t.veh && soldiers.some(o => o !== t && o.alive && !o.downed && o.team === t.team);
function goDown(t, from) {
  t.downed = true; t.hp = 40; t.downT = 20; t.downBy = from; t.reloadT = 0; t.healChan = 0; t.reviveT = 0;
  if (t.turret) leaveTurret(t);
  if (t.zip) t.zip = null;
  const d = document.createElement('div'); d.className = 'panel';
  const n = s => `<span class="${s === player ? 'k' : s.team === player.team ? 'a' : 'e'}">${s.name}</span>`;
  d.innerHTML = `${n(from)} ▸ derrubou ▸ ${n(t)}`; $('#feed').prepend(d); setTimeout(() => d.remove(), 4000);
  if (t === player) showCenter('VOCÊ CAIU', 'rasteje até um aliado · ele te levanta parado ao seu lado (3 s)');
}
function revive(t, by) {
  if (!t.downed) return;
  t.downed = false; t.hp = 35; t.reviveT = 0; t.lastHurt = now;
  for (let i = 0; i < 8; i++) spawnPart(eye(t, rand(0.3, 1.5)), 0x7dff7d, 0.25, 0.8, new V3(rand(-0.3, 0.3), 1.2, rand(-0.3, 0.3)), true, 0, 0);
  if (t === player) { hideCenter(); toast(`${by.name} te levantou`); } else if (by === player) toast(`Você levantou ${t.name}`);
  if (actx && player.pos.distanceTo(t.pos) < 25) tone(520, 880, 0.2, 0.08);
}
function updateDowned(dt) {
  for (const t of soldiers) {
    if (!t.alive || !t.downed) continue;
    const helper = soldiers.find(o => o !== t && o.alive && !o.downed && !o.veh && o.team === t.team && !o.moving && Math.hypot(o.pos.x - t.pos.x, o.pos.z - t.pos.z) < 1.6 && Math.abs(o.y - t.y) < 1.2);
    if (helper) { t.reviveT += dt * (helper.C.heal ? 2 : 1); t.reviveBy = helper; if (t.reviveT >= 3) revive(t, helper); }
    else t.reviveT = Math.max(0, t.reviveT - dt);
  }
  // time inteiro caído/morto: quem está caído morre
  for (const team of new Set(soldiers.map(s => s.team))) {
    const mates = soldiers.filter(s => s.team === team && s.alive);
    if (mates.length && mates.every(s => s.downed)) for (const s of mates) { s.downed = false; s.deathBy = 'time todo caiu'; die(s, s.downBy && s.downBy.team !== s.team ? s.downBy : s); }
  }
}
function damage(t, dmg, from, pen = 0.5) {
  if (tut && tut.step < TUT.length - 1 && t.isBot) return;   // no tutorial os bots só valem no último passo
  if (!t.alive || t.team === from.team) return;
  let toArmor = 0;
  if (t.armor > 0) { const red = (1 - pen) * 0.5; toArmor = dmg * red; t.armor = Math.max(0, Math.round(t.armor - toArmor * 1.2)); }
  dmg -= toArmor;
  if (t.helmet) dmg *= 0.9;
  dmg = Math.round(dmg);
  t.hp -= dmg; t.lastHurt = now; from.stats.dmg += Math.max(0, Math.min(dmg, t.hp + dmg));
  if (t.armor <= 0) t.showGear();
  if (t === player) { $('#hurt').style.opacity = 1; setTimeout(() => $('#hurt').style.opacity = 0, 160); if (from !== player) hitDir(from); }
  else if (from === player) { dmgNumber(t, dmg, toArmor > 0); if (!sfx('acerto', 0.45, { dur: 0.4 })) blip(1250, 0.03, 0.06); }
  if (t.isBot) botHeard(t, from.pos);
  if (t.hp <= 0) { t.hp = 0; if (canDown(t)) goDown(t, from); else { t.downed = false; die(t, from); } }
}
// arco vermelho em volta do jogador apontando para quem atirou
const hitDirs = new Map();
function hitDir(from) {
  const [px, py] = toScreen(eye(player, 1)), [ax, ay] = toScreen(eye(from, 1));
  const a = Math.atan2(ax - px, -(ay - py));
  const old = hitDirs.get(from); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'hdir';
  el.style.left = px + 'px'; el.style.top = py + 'px'; el.style.transform = `rotate(${a}rad)`;
  $('#tags').appendChild(el); hitDirs.set(from, el);
  setTimeout(() => { el.remove(); if (hitDirs.get(from) === el) hitDirs.delete(from); }, 1100);
}
// histórico salvo no aparelho
const CAREER_KEY = 'tatico.carreira';
const career = (() => { try { return JSON.parse(localStorage.getItem(CAREER_KEY)) || {}; } catch { return {}; } })();
for (const k of ['partidas', 'abates', 'mortes', 'vitorias', 'xp']) career[k] = career[k] || 0;
function saveCareer() { try { localStorage.setItem(CAREER_KEY, JSON.stringify(career)); } catch {} }
// XP e níveis: abate 100, captura 300, plantar 150, vitória 500, partida jogada 50
const xpNeed = l => 300 + 200 * (l - 1);                       // XP para ir do nível l para o l+1
function levelInfo(xp) { let l = 1; while (xp >= xpNeed(l)) { xp -= xpNeed(l); l++; } return { lvl: l, cur: xp, need: xpNeed(l) }; }
let matchXP = 0;
const addXP = (n, why) => { if (!started) return; matchXP += n; if (why) toast(`+${n} XP · ${why}`); };
function renderCareer() {
  const c = career, kd = (c.abates / Math.max(1, c.mortes)).toFixed(2);
  const L = levelInfo(c.xp || 0);
  $('#career').innerHTML = `<b>NÍVEL ${L.lvl}</b> · ${L.cur}/${L.need} XP<div class="xpbar"><i style="width:${(L.cur / L.need) * 100}%"></i></div>` + (c.partidas || c.abates ? `<b>Seu histórico:</b> ${c.partidas} partidas · ${c.vitorias} vitórias · ${c.abates} abates · ${c.mortes} mortes · K/D ${kd}` + (c.melhorBR ? ` · melhor no BR: ${c.melhorBR}º` : '') : '');
}
let killInfo = '';
function die(t, by) {
  if (!t.alive) return;
  t.downed = false;
  if (t.veh) { t.veh.driver = null; if (t === player) engineStop(); t.veh = null; t.y = groundAt(t.pos.x, t.pos.z, t.y + 1); }
  if (t.turret) leaveTurret(t);
  t.zip = null;
  if (mode === 'ctf') ctfDrop(t);
  if (t === player) {
    player.diedAt = now; player.killer = by !== t ? by : null;
    killInfo = by !== t ? `${by.name} · ${by.lastKillWith || by.w.name} · ficou com ${Math.max(1, Math.ceil(by.hp))} de vida` : (t.deathBy || '');
    if (started) { career.mortes++; saveCareer(); }
  } else if (by === player && started) { career.abates++; saveCareer(); }
  t.alive = false; t.respawnT = 3; t.moving = false; t.blindT = 0; t.healChan = 0;
  t.stats.d++; if (by !== t) { by.stats.k++; if (mode === 'bomb') by.money = Math.min(16000, by.money + (by.w.scope ? 100 : 300)); }
  feed(by, t);
  if (mode === 'tdm' && by !== t) teamScore[by.team] += 1;
  if (t === player) { deaths++; if (RESPAWN_MODES.has(mode)) showCenter('VOCÊ MORREU', (killInfo ? killInfo + ' · ' : '') + 'renascendo em 3…'); else showCenter('VOCÊ MORREU', killInfo || (mode === 'br' ? '' : 'aguarde a próxima rodada'), 3); }
  if (by === player && t !== player) { addXP(100); kills++; player.refill(); blip(880, 0.12, 0.1); }
  updateScore();
  if (mode === 'bomb') bombCheckWipe();
  if (mode === 'br' && !roundOver) {
    const alive = soldiers.filter(s => s.alive).length;
    if (t === player) { roundOver = 3; showCenter(`${alive + 1}º LUGAR`, `${kills} abates` + (killInfo ? ' · ' + killInfo : ''), 3); matchEnd = `VOCÊ FICOU EM ${alive + 1}º`; career.melhorBR = Math.min(career.melhorBR || 99, alive + 1); saveCareer(); }
    else if (alive === 1 && player.alive) { roundOver = 3; showCenter('VITÓRIA!', `1º lugar · ${kills} abates`, 3); matchEnd = 'VITÓRIA · 1º LUGAR'; career.melhorBR = 1; saveCareer(); }
  }
  if (mode === 'tdm' && !roundOver && teamScore[by.team] >= TDM_GOAL) {
    roundOver = 3; matchEnd = (by.team === 'A' ? 'VITÓRIA · ' : 'DERROTA · ') + `${teamScore.A} × ${teamScore.B}`;
    showCenter(by.team === 'A' ? 'VITÓRIA' : 'DERROTA', `${teamScore.A} × ${teamScore.B}`, 3);
  }
}
function updateScore() {
  if (mode === 'br') { $('#score').innerHTML = `RESTAM <b>${soldiers.filter(s => s.alive).length}</b> &nbsp;·&nbsp; ABATES <b>${kills}</b>`; return; }
  if (mode === 'bomb') {
    const t = bombS.planted ? `<span class="tb">BOMBA ${Math.ceil(bombS.timer)} s</span>` : `${Math.floor(bombS.roundT / 60)}:${String(Math.floor(bombS.roundT % 60)).padStart(2, '0')}`;
    $('#score').innerHTML = `$${player.money} · RODADA ${bombS.round} · <span class="ta">AZUL <b>${bombS.score.A}</b></span> × <span class="tb"><b>${bombS.score.B}</b> VERM.</span> · ${t}`; return;
  }
  // só o placar dos times + meta (sem segunda contagem pessoal; seus abates estão no TAB/fim de partida)
  if (mode === 'ctf') { $('#score').innerHTML = `<span class="ta">AZUL <b>${ctfS.score.A}</b></span> × <span class="tb"><b>${ctfS.score.B}</b> VERM.</span> &nbsp;·&nbsp; até ${CTF_GOAL}`; return; }
  $('#score').innerHTML = mode === 'tdm'
    ? `<span class="ta">AZUL <b>${teamScore.A}</b></span> × <span class="tb"><b>${teamScore.B}</b> VERMELHO</span> &nbsp;·&nbsp; até ${TDM_GOAL}`
    : `ABATES <b>${kills}</b> &nbsp;·&nbsp; MORTES <b>${deaths}</b>`;
}
function feed(by, t) {
  const d = document.createElement('div'); d.className = 'panel';
  const n = s => `<span class="${s === player ? 'k' : s.team === player.team ? 'a' : 'e'}">${s.name}</span>`;
  d.innerHTML = by === t ? `${n(t)} ▸ ${t.deathBy || 'se matou'}` : `${n(by)} ▸ ${by.lastKillWith || by.w.name} ▸ ${n(t)}`; t.deathBy = null;
  by.lastKillWith = null;
  $('#feed').prepend(d); setTimeout(() => d.remove(), 4000);
  while ($('#feed').children.length > 3) $('#feed').lastChild.remove();
}
function toast(msg) { const d = document.createElement('div'); d.className = 'panel'; d.textContent = msg; $('#toast').prepend(d); setTimeout(() => d.remove(), 2500); }
let centerTimer = 0;
function showCenter(t, s, dur = 0) { $('#ctitle').textContent = t; $('#csub').textContent = s; $('#center').style.display = 'block'; centerTimer = dur; }
function hideCenter() { $('#center').style.display = 'none'; }
const projV = new V3();
function toScreen(p) { projV.copy(p).project(camera); return [(projV.x * 0.5 + 0.5) * innerWidth, (-projV.y * 0.5 + 0.5) * innerHeight, projV.z < 1]; }
function dmgNumber(t, n, arm) {
  const [x, y] = toScreen(new V3(t.pos.x + rand(-0.3, 0.3), t.y + 2.0, t.pos.z));
  const d = document.createElement('div'); d.className = 'dmg' + (arm ? ' arm' : ''); d.textContent = n;
  d.style.left = x + 'px'; d.style.top = y + 'px'; $('#tags').appendChild(d); setTimeout(() => d.remove(), 700);
}

