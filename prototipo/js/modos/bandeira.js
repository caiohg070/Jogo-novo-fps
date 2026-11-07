'use strict';
// ================= Capture a bandeira =================
const CTF_GOAL = 3;
const FLAGS = { A: { team: 'A', base: new V3(2, 0, 31) }, B: { team: 'B', base: new V3(-4, 0, -40) } };
for (const F of Object.values(FLAGS)) {
  F.base.y = terrainHeight(F.base.x, F.base.z); F.pos = F.base.clone();
  F.g = new THREE.Group(); scene.add(F.g); F.g.visible = false;
  const pole = new THREE.Mesh(cylGeo, stdMat(0xdddddd, { metal: 0.5 })); pole.scale.set(0.04, 2.6, 0.04); pole.position.y = 1.3; F.g.add(pole);
  const cloth = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: TEAM_COLOR[F.team], roughness: 0.8, side: THREE.DoubleSide })); cloth.scale.set(0.9, 0.6, 0.03); cloth.position.set(0.47, 2.25, 0); F.g.add(cloth); F.cloth = cloth;
  F.ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.85, 40), new THREE.MeshBasicMaterial({ color: TEAM_COLOR[F.team], transparent: true, opacity: 0.6, depthWrite: false }));
  F.ring.rotation.x = -Math.PI / 2; F.ring.position.set(F.base.x, F.base.y + 0.06, F.base.z); F.ring.visible = false; scene.add(F.ring);
  // coluna de luz bem alta: dá para ver a bandeira de longe
  F.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 40, 16, 1, true), new THREE.MeshBasicMaterial({ color: TEAM_COLOR[F.team], transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false }));
  F.beam.position.y = 20; F.g.add(F.beam);
}
const ctfS = { score: { A: 0, B: 0 } };
const enemyFlag = s => FLAGS[s.team === 'A' ? 'B' : 'A'];
const ctfCarried = s => Object.values(FLAGS).find(F => F.carrier === s);
function ctfReset() {
  ctfS.score = { A: 0, B: 0 };
  for (const F of Object.values(FLAGS)) { F.carrier = null; F.atBase = true; F.pos.copy(F.base); F.dropT = 0; }
}
function ctfDrop(s) {
  const F = ctfCarried(s); if (!F) return;
  F.carrier = null; F.atBase = false; F.dropT = 20; F.pos.set(s.pos.x, s.y, s.pos.z);
  toast(`Bandeira ${F.team === player.team ? 'AZUL (sua)' : 'VERMELHA'} caiu no chão`);
}
function ctfReturn(F, by) { F.carrier = null; F.atBase = true; F.pos.copy(F.base); if (by) toast(`${by.name} devolveu a bandeira ${F.team === 'A' ? 'azul' : 'vermelha'}`); }
function updateCTF(dt) {
  for (const F of Object.values(FLAGS)) {
    const c = F.carrier;
    if (c && (!c.alive || c.downed)) ctfDrop(c);
    if (F.carrier) F.pos.set(F.carrier.pos.x, F.carrier.y + 0.5, F.carrier.pos.z);
    else {
      if (!F.atBase && (F.dropT -= dt) <= 0) ctfReturn(F, null);
      for (const s of soldiers) {
        if (!s.alive || s.downed || s.air || Math.hypot(s.pos.x - F.pos.x, s.pos.z - F.pos.z) > 1.3 || Math.abs(s.y - F.pos.y) > 1.5) continue;
        if (s.team === F.team) { if (!F.atBase) ctfReturn(F, s); }
        else if (!ctfCarried(s)) { F.carrier = s; F.atBase = false; toast(s === player ? 'Você pegou a bandeira! Leve até a sua base' : `${s.name} pegou a bandeira ${F.team === 'A' ? 'AZUL' : 'vermelha'}`); if (actx) tone(600, 900, 0.2, 0.08); }
        break;
      }
    }
    F.g.position.copy(F.pos); F.g.rotation.y = F.carrier ? F.carrier.facing + Math.PI : now * 0.4;
    F.cloth.rotation.y = Math.sin(now * 3 + F.base.x) * 0.25;
    F.beam.material.opacity = 0.24 + 0.14 * Math.sin(now * 4);
  }
  // captura: chegou na própria base com a bandeira inimiga e a sua está em casa
  for (const s of soldiers) {
    const F = ctfCarried(s); if (!F) continue;
    const home = FLAGS[s.team];
    if (home.atBase && Math.hypot(s.pos.x - home.base.x, s.pos.z - home.base.z) < 2) {
      ctfReturn(F, null); ctfS.score[s.team]++; if (s === player) addXP(300, 'captura');
      showCenter(s.team === player.team ? 'CAPTURA DO SEU TIME!' : 'O INIMIGO CAPTUROU', `${s.name} · AZUL ${ctfS.score.A} × ${ctfS.score.B} VERM.`, 2.5);
      if (actx) { tone(520, 1040, 0.35, 0.1); }
      if (ctfS.score[s.team] >= CTF_GOAL && !roundOver) { roundOver = 3; matchEnd = (s.team === 'A' ? 'VITÓRIA · ' : 'DERROTA · ') + `${ctfS.score.A} × ${ctfS.score.B}`; }
      updateScore();
    }
  }
}
function ctfObjective(b) {
  const mine = FLAGS[b.team], theirs = enemyFlag(b), ai = b.ai;
  if (ctfCarried(b)) return { x: mine.base.x, z: mine.base.z, stop: 0.5 };
  if (mine.carrier) return { x: mine.carrier.pos.x, z: mine.carrier.pos.z, stop: 2 };           // persegue quem roubou
  if (!mine.atBase) return { x: mine.pos.x, z: mine.pos.z, stop: 0.2 };                          // devolve a bandeira caída
  if (b.role === 'def') {
    if (!ai.guard || Math.random() < 0.002) { const a = rand(0, 6.28); ai.guard = { x: mine.base.x + Math.cos(a) * rand(3, 7), z: mine.base.z + Math.sin(a) * rand(3, 7) }; }
    return { x: ai.guard.x, z: ai.guard.z, stop: 0.8, act: bb => { bb.facing += 0.01; } };
  }
  if (theirs.carrier) return { x: theirs.carrier.pos.x, z: theirs.carrier.pos.z, stop: 3 };       // escolta o aliado
  return { x: theirs.pos.x, z: theirs.pos.z, stop: 0.2 };
}

