'use strict';
// ---------- IA dos bots ----------
const WP = [
  [-3.3, -3.0], [-3.3, -7.8], [-2.5, -10.5], [0.5, -10.5], [2.5, -7.0], [4.5, -6.9], [4.5, -12.2], [4.6, -13.8],
  [0, -11], [-4.5, -7.6, 3], [0, -11], [4.6, -13.8], [4.5, -12.2], [4.5, -7.0], [2.5, -7.0], [2.5, -9], [1.7, -13.6],
  [1.7, -17], [8, -18], [16, -18.5], [16, -23.5], [16, -18.5], [20, -17], [26, -12], [24, 0, 1.5], [10, 10], [-8, 12], [-20, 6], [-22, -10, 1.5], [-8, -2],
];
// Battle Royale: volta extra pelo anel novo (pontos livres, em ordem de ângulo)
if (BR_SEED) for (let i = 0; i < 12; i++) for (let k = 0; k < 20; k++) {
  const a = (i + 0.5) / 12 * 6.283, r = 52 + srnd() * 26, x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (!navBlocked[navIdx(x, z)]) { WP.push([x, z, k % 3 ? 0 : 1.5]); break; }
}
const newAI = () => ({ state: 'patrol', wp: 0, wait: 0, last: new V3(), seenT: 0, searchT: 0, strafe: 1, strafeT: 0, burst: 0, burstCd: 0,
  stuckT: 0, stuckPos: new V3(), target: null, scanT: 0, clear: false, clearT: 0, blindDir: 0, nadeCd: rand(6, 12) });
function nearestWP(p) { let bi = 0, bd = Infinity; WP.forEach((w, i) => { const d = Math.hypot(w[0] - p.x, w[1] - p.z); if (d < bd) { bd = d; bi = i; } }); return bi; }
function botHeard(b, p) { const ai = b.ai; if (ai && ai.state !== 'engage') { ai.last.copy(p); ai.state = 'search'; ai.searchT = 7; } }
const downedMate = b => TEAM_MODES.has(mode) && soldiers.find(o => o !== b && o.alive && o.downed && o.team === b.team && Math.hypot(o.pos.x - b.pos.x, o.pos.z - b.pos.z) < 22);
function updateBot(b, dt) {
  const ai = b.ai;
  if (!b.alive) return;
  if (b.air === 'plane') { if (now >= b.jumpAt) jumpOut(b); return; }
  if (b.air === 'chute') { const dx = b.dropX - b.pos.x, dz = b.dropZ - b.pos.z, l = Math.hypot(dx, dz); if (l > 0.5) b.move(dx / l, dz / l, 7, dt); return; }
  if (b.turret) leaveTurret(b);
  if (b.downed) {   // caído: rasteja até o aliado de pé mais perto
    let m = null, md = 30;
    for (const o of soldiers) if (o !== b && o.alive && !o.downed && o.team === b.team) { const d = Math.hypot(o.pos.x - b.pos.x, o.pos.z - b.pos.z); if (d < md) { md = d; m = o; } }
    if (m && md > 1.2) { const [mx, mz] = navSteer(b, m.pos.x, m.pos.z); b.move(mx, mz, 1.1, dt); b.facing = Math.atan2(mx, mz); } else b.moving = false;
    return;
  }
  const blind = b.blindT > 0;
  const sight = (b.w.scope ? 34 : 24) * (weather === 'neblina' ? 0.6 : 1);
  ai.scanT -= dt; if (ai.ignoreT > 0) ai.ignoreT -= dt; if (ai.pathT > 0) ai.pathT -= dt;
  if (ai.scanT <= 0) {
    ai.scanT = 0.2; ai.target = null;
    if (!blind) {
      let bd = sight;   // fairPair: bot só mira em quem estaria na tela dele (e que também veria ele)
      for (const e of enemiesOf(b)) { if (e === ai.ignore && ai.ignoreT > 0) continue; const d = Math.hypot(e.pos.x - b.pos.x, e.pos.z - b.pos.z), dd = d + (e.downed ? 10 : 0); if (dd < bd && d < sight && fairPair(b, e) && los(b, e)) { bd = dd; ai.target = e; } }
    }
  }
  const t = ai.target && ai.target.alive && !ai.target.air && !blind ? ai.target : null;
  if (t) { ai.last.copy(t.pos); ai.seenT += dt; ai.state = 'engage'; ai.lastEnemyT = now; }
  // sem alvo: sai do combate (antes ficava preso em 'engage' se o alvo sumia enquanto estava cego ou fora do jogo)
  else { ai.seenT = 0; if (ai.state === 'engage' && (!blind || now - (ai.lastEnemyT ?? 0) > 2)) { ai.state = 'search'; ai.searchT = 7; } }
  if (!t && ai.state === 'search' && b.drones > 0 && Math.random() < dt * 0.3) useDrone(b);
  if (b.C.heal && b.hp < 60 && b.healCd <= 0) b.heal(); else if (!t && b.hp < 50 && b.kits > 0) b.useKit();
  if (t && b.inv.primary === 'awp') b.switchTo(Math.hypot(t.pos.x - b.pos.x, t.pos.z - b.pos.z) < 7 ? b.inv.secondary : 'awp');
  let mx = 0, mz = 0, speed = 3.1;
  const fire = inFire(b), mate = !t && downedMate(b);
  if (fire) {   // fogo do molotov: sai correndo
    const dx = b.pos.x - fire.x, dz = b.pos.z - fire.z, l = Math.hypot(dx, dz) || 1; mx = dx / l; mz = dz / l; speed = 4.2; if (!t) b.facing = Math.atan2(mx, mz);
  } else if (blind) {
    mx = Math.sin(ai.blindDir); mz = Math.cos(ai.blindDir); speed = 1.6;
    if (Math.random() < dt * 1.5) ai.blindDir += rand(-1.5, 1.5);
  } else if (mate) {   // aliado caído por perto: vai até ele e fica parado ao lado (levanta em 3 s)
    const d = Math.hypot(mate.pos.x - b.pos.x, mate.pos.z - b.pos.z);
    if (d > 1.1) { [mx, mz] = navSteer(b, mate.pos.x, mate.pos.z); speed = 4; b.facing = Math.atan2(mx, mz); }
  } else if (ai.state === 'engage' && t && !mustDefuse(b)) {
    const d = Math.hypot(t.pos.x - b.pos.x, t.pos.z - b.pos.z);
    const ang = Math.atan2(t.pos.x - b.pos.x, t.pos.z - b.pos.z), dx = Math.sin(ang), dz = Math.cos(ang);
    b.facing = ang;
    ai.clearT -= dt;
    if (ai.clearT <= 0) { ai.clearT = 0.25; ai.clear = canShoot(b, t); }
    ai.blockedT = ai.clear ? 0 : (ai.blockedT || 0) + dt;
    if (ai.blockedT > 3) { ai.blockedT = 0; ai.ignore = t; ai.ignoreT = 4; ai.state = 'patrol'; ai.wp = (nearestWP(b.pos) + 1) % WP.length; }
    const sniper = b.w.scope, far = sniper ? 30 : 16, near = sniper ? 12 : 7;
    const fwd = !ai.clear ? 1 : d > far ? 1 : d < near ? -1 : 0;
    ai.strafeT -= dt;
    if (ai.strafeT <= 0) { ai.strafe = Math.random() < (sniper ? 0.6 : 0.2) ? 0 : Math.random() < 0.5 ? -1 : 1; ai.strafeT = rand(0.7, 1.8); if (!ai.clear && !ai.strafe) ai.strafe = 1; }
    mx = dx * fwd + dz * ai.strafe; mz = dz * fwd - dx * ai.strafe; speed = 3.4;
    const react = (sniper ? 0.9 : 0.5) * diff.react;
    if (ai.seenT > react && ai.clear) {
      if (sniper) { mx *= 0.2; mz *= 0.2; b.tryFire(ang + (Math.random() - 0.5) * 0.03 * diff.err, (t.moving ? 0.02 : 0) * diff.err); }
      else if (ai.burst > 0) { if (b.tryFire(ang + (Math.random() - 0.5) * 0.1 * diff.err, (t.moving ? 0.04 : 0.015) * diff.err * (t.walking ? 0.8 : 1))) ai.burst--; }
      else { ai.burstCd -= dt; if (ai.burstCd <= 0) { ai.burst = randInt(4, 8); ai.burstCd = rand(0.45, 0.9); } }
    }
    ai.nadeCd -= dt;
    if (ai.nadeCd <= 0 && d > 6 && d < 13) {
      const type = ['molotov', 'he', 'flash'].find(n => b.nades[n] > 0);
      ai.nadeCd = rand(10, 18);
      if (type) throwNade(b, type, t.pos.x + rand(-1.5, 1.5), t.pos.z + rand(-1.5, 1.5));
    }
    if (b.hp < 35 && b.nades.smoke > 0 && Math.random() < dt) throwNade(b, 'smoke', b.pos.x + dx * 3, b.pos.z + dz * 3);
    const cf = mode === 'ctf' && ctfCarried(b);
    if (cf) { const h = ctfRoute(b); [mx, mz] = navSteer(b, h.x, h.z); speed = 3.8; }
  } else if (ai.state === 'search' && !mustDefuse(b)) {
    ai.searchT -= dt;
    const dx = ai.last.x - b.pos.x, dz = ai.last.z - b.pos.z, l = Math.hypot(dx, dz);
    if (l < 1.2 || ai.searchT <= 0) { ai.state = 'patrol'; ai.wp = nearestWP(b.pos); }
    else { [mx, mz] = navSteer(b, ai.last.x, ai.last.z); speed = 3.6; b.facing = Math.atan2(mx, mz); }
  } else if (objectiveFor(b) && !(ai.detourT > 0)) {
    const g = objectiveFor(b), dx = g.x - b.pos.x, dz = g.z - b.pos.z, l = Math.hypot(dx, dz);
    if (l > (g.stop ?? 0.6)) { [mx, mz] = navSteer(b, g.x, g.z); speed = 3.8; b.facing = Math.atan2(mx, mz); }
    else if (g.act) g.act(b, dt);
  } else {
    if (ai.detourT > 0) ai.detourT -= dt;
    // aliado acompanha o jogador; inimigo patrulha
    const dp = Math.hypot(player.pos.x - b.pos.x, player.pos.z - b.pos.z);
    if (false) {
      const dx = player.pos.x - b.pos.x, dz = player.pos.z - b.pos.z; mx = dx / dp; mz = dz / dp; speed = dp > 12 ? 4.6 : 3.4; b.facing = Math.atan2(mx, mz);
    } else if (mode === 'br' && !(ai.detourT > 0)) {
      // battle royale: sem arma/colete vai atrás do baú mais perto; senão anda por pontos aleatórios dentro da zona
      if (!ai.roam || Math.hypot(ai.roam.x - b.pos.x, ai.roam.z - b.pos.z) < 1.2 || Math.hypot(ai.roam.x - zone.x, ai.roam.z - zone.z) > zone.r * 0.9 || (ai.roam.loot && (ai.roam.loot.state === 'empty' || ai.roam.loot.state === 'gone')) || (!ai.roam.loot && Math.random() < dt * 0.3 && loots.some(lo => lo.drop && lo.state === 'closed'))) {
        let L = loots.find(lo => lo.drop && lo.state !== 'gone' && Math.hypot(lo.x - b.pos.x, lo.z - b.pos.z) < 45 && Math.hypot(lo.x - zone.x, lo.z - zone.z) < zone.r * 0.9) || null, ld = 30;
        if (!L && (!b.inv.primary || b.armor <= 0 || !b.helmet)) for (const lo of loots) {
          if (lo.state === 'empty' || Math.abs(lo.y - b.y) > 1 || Math.hypot(lo.x - zone.x, lo.z - zone.z) > zone.r * 0.85) continue;
          const d = Math.hypot(lo.x - b.pos.x, lo.z - b.pos.z); if (d < ld) { ld = d; L = lo; }
        }
        const a = rand(0, 6.28), r = rand(0, zone.r * 0.7);
        // mapa grande: anda perto de onde está (10–32 m) enquanto a zona é grande, para não juntar todo mundo no meio cedo
        let rx = zone.x + Math.cos(a) * r, rz = zone.z + Math.sin(a) * r;
        if (BR_SEED && zone.r > 45) { rx = b.pos.x + Math.cos(a) * rand(10, 32); rz = b.pos.z + Math.sin(a) * rand(10, 32);
          const zd = Math.hypot(rx - zone.x, rz - zone.z), lim = zone.r * 0.8; if (zd > lim) { rx = zone.x + (rx - zone.x) * lim / zd; rz = zone.z + (rz - zone.z) * lim / zd; } }
        ai.roam = L ? { x: L.x, z: L.z, loot: L } : { x: clamp(rx, -MAP + 3, MAP - 3), z: clamp(rz, -MAP + 3, MAP - 3) };
      }
      [mx, mz] = navSteer(b, ai.roam.x, ai.roam.z); speed = 3.6; b.facing = Math.atan2(mx, mz);
    } else if (ai.wait > 0) ai.wait -= dt;
    else {
      const w = WP[ai.wp], dx = w[0] - b.pos.x, dz = w[1] - b.pos.z, l = Math.hypot(dx, dz);
      if (l < 0.7) { ai.wait = w[2] || 0; ai.wp = (ai.wp + 1) % WP.length; }
      else { [mx, mz] = navSteer(b, w[0], w[1]); b.facing = Math.atan2(mx, mz); }
    }
  }
  const l = Math.hypot(mx, mz); if (l > 1) { mx /= l; mz /= l; }
  b.move(mx, mz, speed, dt);
  if (b.mag < (b.w.scope ? 2 : 8) && ai.state !== 'engage') b.startReload();
  ai.stuckT += dt;
  if (ai.stuckT > 1) {
    if (b.moving && ai.stuckPos.distanceTo(b.pos) < 0.35) {
      ai.path = null; ai.stuckN = (ai.stuckN || 0) + 1;
      // preso 2 vezes seguidas: desiste do ponto e vai para o seguinte ao próximo (antes voltava sempre para o mesmo)
      if (ai.stuckN >= 2 && !blind && ai.state !== 'engage') { ai.stuckN = 0; ai.state = 'patrol'; ai.roam = null; ai.detourT = 3; ai.wp = (nearestWP(b.pos) + 2) % WP.length; }
      else if (blind) ai.blindDir += Math.PI;
      else if (mode === 'br' && ai.state === 'patrol') ai.roam = null;
      else if (ai.state === 'patrol') { ai.wp = (ai.wp + 1) % WP.length; if (objectiveFor(b)) { ai.detourT = 2.5; ai.wp = nearestWP(b.pos); } }
      else if (ai.state === 'search') { ai.state = 'patrol'; ai.wp = nearestWP(b.pos); }
      else ai.strafe = -ai.strafe || 1;
    } else ai.stuckN = 0;
    ai.stuckT = 0; ai.stuckPos.copy(b.pos);
  }
}
function separate() {
  for (let i = 0; i < soldiers.length; i++) for (let j = i + 1; j < soldiers.length; j++) {
    const a = soldiers[i], b = soldiers[j];
    if (!a.alive || !b.alive || a.air || b.air || a.veh || b.veh || a.turret || b.turret || a.zip || b.zip || Math.abs(a.y - b.y) > 1) continue;
    const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d = Math.hypot(dx, dz);
    if (d > 0.001 && d < 0.84) { const k = (0.84 - d) / 2 / d; a.pos.x -= dx * k; a.pos.z -= dz * k; b.pos.x += dx * k; b.pos.z += dz * k; }
  }
}

