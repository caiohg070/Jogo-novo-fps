'use strict';
// ================= tela inicial =================
const choice = { mode: 'treino', cls: 'tr', weather: 'dia', diff: 'medio', skin: 'padrao', acc: 'nenhum' };
try { Object.assign(choice, JSON.parse(localStorage.getItem('tatico.visual')) || {}); } catch {}
for (const g of ['skin', 'acc']) for (const o of document.querySelectorAll(`.opts[data-group="${g}"] .opt`)) o.classList.toggle('on', o.dataset.v === choice[g]);
for (const grp of document.querySelectorAll('.opts')) {
  grp.addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b || b.disabled) return;
    for (const o of grp.querySelectorAll('.opt')) o.classList.toggle('on', o === b);
    choice[grp.dataset.group] = b.dataset.v;
    if (grp.dataset.group === 'weather') applyWeather(b.dataset.v);
    if (grp.dataset.group === 'skin' || grp.dataset.group === 'acc') try { localStorage.setItem('tatico.visual', JSON.stringify({ skin: choice.skin, acc: choice.acc })); } catch {}
  });
}
for (const k of ['vol', 'size', 'op', 'h']) {
  const inp = $('#c-' + k), show = () => { $('#cv-' + k).textContent = cfg[k] + '%'; };
  inp.value = cfg[k]; show();
  inp.addEventListener('input', () => { cfg[k] = +inp.value; show(); applyCfg(); try { localStorage.setItem('tatico.cfg', JSON.stringify(cfg)); } catch {} if (k === 'vol' && actx) blip(700, 0.05, 0.12); });
}
applyCfg();
const openCfg = () => { initAudio(); applyCfg(); $('#cfgBoard').style.display = 'flex'; document.body.classList.add('cfg-open'); };
$('#cfgOpen').addEventListener('click', openCfg); $('#cfgOpen2').addEventListener('click', openCfg);
$('#cfgClose').addEventListener('click', () => { $('#cfgBoard').style.display = 'none'; document.body.classList.remove('cfg-open'); });
$('#cfgReset').addEventListener('click', () => { Object.assign(cfg, { vol: 80, size: 100, op: 20, h: 64 }); for (const k in cfg) { $('#c-' + k).value = cfg[k]; $('#cv-' + k).textContent = cfg[k] + '%'; } applyCfg(); try { localStorage.removeItem('tatico.cfg'); } catch {} });
// jogador novo (nunca jogou nem fez/pulou o tutorial): oferece o tutorial antes
if (!career.tutorial && !career.partidas && !career.tutSkip) $('#firstBoard').style.display = 'flex';
const selMode = v => { choice.mode = v; for (const o of document.querySelectorAll('.opts[data-group="mode"] .opt')) o.classList.toggle('on', o.dataset.v === v); };
$('#firstYes').addEventListener('click', () => { $('#firstBoard').style.display = 'none'; selMode('tutorial'); $('#play').click(); });
$('#firstNo').addEventListener('click', () => { $('#firstBoard').style.display = 'none'; career.tutSkip = true; saveCareer(); });
mode = 'treino'; setupMatch('tr'); updateCamera(1); updateWalls(); updateHud(); renderCareer();
$('#start').addEventListener('pointerdown', () => initAudio(), { once: true });
// tutorial: passos simples no modo treino (bots parados até o último passo)
const T2 = (touch, pc) => isTouch ? touch : pc;
// cada passo: texto (toque / PC), botão que pisca no celular (hi), tecla no PC (key), alvo opcional (seta) e condição para avançar
const nearest = (arr, f) => { let b = null, bd = 1e9; for (const o of arr) { const P = f(o); if (!P) continue; const d = Math.hypot(P.x - player.pos.x, P.z - player.pos.z); if (d < bd) { bd = d; b = o; } } return b; };
const TUT = [
  { t: () => T2('Ande: arraste o joystick (círculo à esquerda)', 'Ande com as teclas'), hi: '#joy', key: 'W A S D', ok: () => tut.moved > 3 },
  { t: () => T2('Mire e atire: segure e arraste o botão vermelho', 'Mire com o mouse e segure o clique'), hi: '#aimBtn', key: 'CLIQUE', ok: () => tut.shots >= 3 },
  { t: () => T2('Recarregue: toque em RECAR.', 'Recarregue'), hi: '#reloadBtn', key: 'R', ok: () => player.reloadT > 0 },
  { t: () => T2('Troque de arma: toque numa arma da lista à direita', 'Troque de arma'), hi: '#slots', key: '1 · 2 · 3', ok: () => player.weapon !== tut.w0 },
  { t: () => T2('Granada: segure o botão da granada, ARRASTE para mirar e solte (só tocar não vale)', 'Jogue uma granada'), hi: '#nadeBtn', key: 'G', ok: () => isTouch ? !!tut.nadeDrag : tut.nadeCount() < tut.n0 },
  { t: () => T2('Siga a seta até o baú e toque em ABRIR BAÚ (botão laranja)', 'Siga a seta até o baú e abra'), hi: '#actBtn', key: 'F', label: 'BAÚ',
    pick: () => nearest(loots.filter(l => !l.drop && l.state === 'closed'), l => l), at: l => new V3(l.x, l.y, l.z), ok: () => tut.acts.has('ABRIR') },
  { t: () => T2('Agora toque em PEGAR para levar o item', 'Agora pegue o item'), hi: '#actBtn', key: 'F', ok: () => tut.acts.has('PEGAR') },
  { t: () => T2('Siga a seta até o carro e toque em ENTRAR', 'Siga a seta até o carro e entre'), hi: '#actBtn', key: 'F', label: 'CARRO',
    pick: () => nearest(vehicles.filter(V => !V.dead && !V.driver), V => V.pos), at: V => new V3(V.pos.x, V.y, V.pos.z), ok: () => !!player.veh },
  { t: () => T2('Dirija: use o joystick para andar com o carro', 'Dirija com as teclas'), hi: '#joy', key: 'W A S D', ok: () => tut.drove > 12 },
  { t: () => T2('Saia do carro: toque em SAIR (botão laranja)', 'Saia do carro'), hi: '#actBtn', key: 'F', ok: () => !player.veh },
  { t: () => T2('Siga a seta até a porta e toque em ABRIR PORTA', 'Siga a seta até a porta e abra'), hi: '#actBtn', key: 'F', label: 'PORTA',
    pick: () => nearest(doors.filter(d => !d.broken && !d.open && d.y0 < 1.5), d => ({ x: d.cx, z: d.cz })), at: d => new V3(d.cx, d.y0, d.cz), ok: () => tut.acts.has('ABRIR PORTA') || !tut.tgt || tut.tgt.broken || tut.tgt.open },
  { t: () => T2('Siga a seta até a escada do barracão e toque em SUBIR ESCADA', 'Siga a seta até a escada e suba'), hi: '#actBtn', key: 'F', label: 'ESCADA',
    pick: () => ladderZ, at: Z => new V3(Z.a.x, Z.a.y, Z.a.z), ok: () => tut.acts.has('SUBIR ESCADA') && !player.zip },
  { t: () => 'Agora elimine os 2 bots! (eles vão reagir)', hi: '#aimBtn', key: 'CLIQUE', ok: () => tut.kills >= 2 },
];
function tutTarget() { if (!started || !tut || tut.done || tut.shown !== tut.step) return null; const S = TUT[tut.step]; return S.at && tut.tgt ? { P: S.at(tut.tgt), label: S.label } : null; }
let tut = null;
function updateTut() {
  if (tut.done) return;
  if (tut.last) tut.moved += Math.hypot(player.pos.x - tut.last.x, player.pos.z - tut.last.z);
  tut.last = player.pos.clone(); tut.kills = kills;
  if (player.veh) { const V = player.veh.pos; if (tut.vlast) tut.drove += Math.hypot(V.x - tut.vlast.x, V.z - tut.vlast.z); tut.vlast = V.clone(); } else tut.vlast = null;
  // acabou a bala: lembra da faca e do baú
  if (player.w.kind === 'gun' && player.mag <= 0 && player.reserve <= 0 && !player.reloadT && !(tut.noAmmoT > now)) { tut.noAmmoT = now + 6; toast(T2('Sem balas! Use a FACA (lista de armas) ou abra um baú para achar munição', 'Sem balas! Aperte 3 para a FACA ou abra um baú para achar munição')); }
  const S = TUT[tut.step];
  if (tut.shown !== tut.step) {                                     // entrou num passo novo
    tut.shown = tut.step; tut.acts.clear(); tut.tgt = S.pick ? S.pick() : null;
    for (const e of document.querySelectorAll('.tutHi')) e.classList.remove('tutHi');
    if (isTouch && S.hi) $(S.hi).classList.add('tutHi');
    $('#tutStep').textContent = `TUTORIAL · PASSO ${tut.step + 1} DE ${TUT.length}`; $('#tutTxt').textContent = S.t();
    $('#tutKey').textContent = isTouch ? '' : S.key || ''; $('#tutKey').style.display = isTouch || !S.key ? 'none' : '';
  }
  if (S.ok()) {
    if (actx) tone(660, 990, 0.15, 0.08);
    if (++tut.step >= TUT.length) {
      tut.done = true; $('#tut').style.display = 'none'; for (const e of document.querySelectorAll('.tutHi')) e.classList.remove('tutHi'); career.tutorial = true; matchXP += 200;
      showCenter('TUTORIAL CONCLUÍDO!', 'agora escolha um modo no menu', 3); roundOver = 3; matchEnd = 'TUTORIAL CONCLUÍDO';
    } else if (tut.step === TUT.length - 1) for (const b of bots) b.revealT = 99;
  }
}
$('#play').addEventListener('click', () => {
  initAudio();
  const tutorial = choice.mode === 'tutorial';
  mode = tutorial ? 'treino' : choice.mode; diff = DIFF[choice.diff]; setupMatch(choice.cls); applyWeather(choice.weather);
  $('#start').style.display = 'none'; started = true; document.body.classList.add('playing');
  career.partidas++; saveCareer();
  if (isTouch) document.documentElement.requestFullscreen?.().then(() => screen.orientation?.lock?.('landscape')).catch(() => {});
  const intro = { treino: ['TREINO', 'elimine os 2 bots'], tdm: ['MATA-MATA', `primeiro time a ${TDM_GOAL} abates`],
    bomb: ['BOMBA', `você leva a bomba: plante no A (barracão) ou B (oeste) · ${BOMB_GOAL} rodadas vencem`], br: ['BATTLE ROYALE', 'toque SALTAR quando quiser · a zona azul fecha'],
    ctf: ['CAPTURE A BANDEIRA', `pegue a bandeira vermelha (norte) e leve até a sua base (sul) · ${CTF_GOAL} capturas vencem`] }[mode];
  tut = null; $('#tut').style.display = 'none';
  if (tutorial) {
    const nc = () => Object.values(player.nades).reduce((a, b) => a + b, 0);
    tut = { step: 0, moved: 0, shots: 0, kills: 0, drove: 0, last: null, vlast: null, shown: -1, acts: new Set(), tgt: null, w0: player.weapon, n0: nc(), nadeCount: nc };
    for (const k in player.ammo) player.ammo[k].res = WEAPONS[k].mag * 8;   // tutorial: bastante pente
    $('#tut').style.display = 'block'; hideCenter(); return;
  }
  showCenter(intro[0], intro[1], 3.5);
});
window.__nav = { navPath, navBlocked, navIdx, navLineClear, NAV_N }; window.__los = los; window.__die = die; window.__ts = () => teamScore; window.__bomb = bombS; window.__zone = zone; window.__jump = jumpOut; window.__cs = canShoot; window.__sfx = SFX; window.__game = { get player() { return player; }, get bots() { return bots; }, throwNade, giveLoot, applyWeather, get now() { return now; }, vehicles, doors, turrets, zips, bushes, FLAGS, ctfS, loots, fires, mines, enterVeh, exitVeh, useTurret, useDrone, dropCrate, damage, playerAction: () => playerAction(), setDoor, groundAt, terrainHeight, shotBlock, firstHit, terrainBlocks, aimPoint, get hitProp() { return hitProp; }, solids, get mode() { return mode; }, hurtProp };
frame();
