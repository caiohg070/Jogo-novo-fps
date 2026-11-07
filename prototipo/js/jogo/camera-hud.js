'use strict';
// ================= câmera, paredes, HUD =================
const camTarget = new V3();
// AWP (arma com luneta): câmera desliza alguns metros para o lado da mira
const scopeOff = new V3(), _so = new V3();
// depois de morrer, a câmera vai até quem te matou por ~2 s (mostra onde ele estava)
const killCamTarget = () => { const k = player.killer, t = now - (player.diedAt ?? -99); return !player.alive && k && k.alive && t > 0.5 && t < 2.8 ? k : null; };
function updateCamera(dt) {
  const kc = killCamTarget(), f = kc || player;
  camTarget.lerp(new V3(f.pos.x, f.air ? f.y - 2 : f.y, f.pos.z), Math.min(1, dt * (kc ? 4 : 8)));
  camZoom = lerp(camZoom, player.air === 'plane' ? 1.5 : player.air ? 1.35 : player.veh ? 1.25 + Math.abs(player.veh.v) / 60 : player.alive && player.w.scope ? 1.2 : player.alive && player.attOn.mira ? 1.15 : player.turret ? 1.2 : 1, Math.min(1, dt * 3));
  const sc = !kc && player.alive && !player.air && !player.veh && player.w.scope;
  _so.set(sc ? Math.sin(player.facing) * 3.5 : 0, 0, sc ? Math.cos(player.facing) * 3.5 : 0);
  scopeOff.lerp(_so, Math.min(1, dt * 4));
  camera.position.copy(camTarget).add(scopeOff).addScaledVector(CAM_OFF, camScale * camZoom); camera.position.y += 0.9;   // mira no meio do corpo: jogador no centro da tela
  if (shakeT > 0) { shakeT -= dt; camera.position.x += rand(-1, 1) * shakeT * 1.2; camera.position.z += rand(-1, 1) * shakeT * 1.2; }
  sun.position.copy(camTarget).add(SUN_OFF); sun.target.position.copy(camTarget);
  lantern.position.set(player.pos.x, player.y + 3, player.pos.z);
}
const faded = new Set();
const inBarnS = s => s.pos.x > BARN.x0 - 0.2 && s.pos.x < BARN.x1 + 0.2 && s.pos.z > BARN.z0 - 0.2 && s.pos.z < BARN.z1 + 0.2 && s.y < BARN_Y + 3;
const insideHouse = s => s.pos.x > HOUSE.x0 && s.pos.x < HOUSE.x1 && s.pos.z > HOUSE.z0 && s.pos.z < HOUSE.z1 && s.y < H1 - 0.6;
const inSmoke = s => smokes.some(k => k.age > 0.8 && eye(s, 1.2).distanceTo(k.pos) < k.r * 0.85);
function updateWalls() {
  // na escada conta como dentro até pisar no terraço (antes a laje voltava a ficar sólida no fim da subida)
  const inside = player.pos.x > HOUSE.x0 - 0.2 && player.pos.x < HOUSE.x1 + 0.2 && player.pos.z > HOUSE.z0 - 0.2 && player.pos.z < HOUSE.z1 + 0.2 && (player.y < H1 - 0.6 || onStairs(player));
  // atrás da casa (lado de cima da tela): a laje e as paredes da frente tapavam o jogador e as portas/janelas dos fundos
  const behind = !inside && player.pos.x > HOUSE.x0 - 1.5 && player.pos.x < HOUSE.x1 + 1.5 && player.pos.z < HOUSE.z0 + 0.2 && player.pos.z > HOUSE.z0 - 8 && player.y < H1 - 0.6;
  const inBunker = inBK(player.pos.x, player.pos.z) && player.y < BK_TOP - 1;
  for (const m of bunkerRoof) m.visible = !inBunker;
  const inBarn = inBarnS(player);
  // atrás do barracão (lado de cima da tela): telhado e paredes tapavam o jogador perto da porta norte
  const behindBarn = !inBarn && player.pos.x > BARN.x0 - 1.5 && player.pos.x < BARN.x1 + 1.5 && player.pos.z < BARN.z0 + 0.2 && player.pos.z > BARN.z0 - 8 && player.y < BARN_Y + 3;
  for (const m of barnRoof) m.visible = !inBarn && !behindBarn;
  for (const m of faded) { m.material.opacity = 1; m.material.depthWrite = true; }
  faded.clear();
  // dentro/atrás da casa: a laje e as muretas de cima ficam meio transparentes (45%) (antes sumiam e quem estava no telhado parecia flutuar)
  const ghostUp = inside || behind;
  for (const m of upper) {
    m.castShadow = !ghostUp;
    if (ghostUp) { m.material.transparent = true; m.material.opacity = 0.45; m.material.depthWrite = false; }
    else if (m.material.opacity < 1) { m.material.opacity = 1; m.material.depthWrite = true; }
  }
  if (behind || behindBarn) for (const m of fadeables) {
    const q = m.position, A = behind ? HOUSE : BARN;
    if (q.x > A.x0 - 0.5 && q.x < A.x1 + 0.5 && q.z > A.z0 + 0.5 && q.z < A.z1 + 0.5) { m.material.opacity = 0.22; m.material.depthWrite = false; faded.add(m); }
  }
  const targets = [[player, 1.2], [player, 0.3]];
  for (const s of soldiers) {
    if (s === player) continue;
    s.seen = s.alive && !s.air && !player.air && (s.team === player.team || s.revealT > 0 || los(player, s));
    let occl = false;
    if (s.seen) { const c = eye(s, 1.0); occl = firstHit(camera.position, c) < camera.position.distanceTo(c) - 0.5; targets.push([s, 1.0]); }
    // em cima da casa/barracão não mostra a silhueta do inimigo através do telhado/chão (parecia hack); drone continua mostrando
    const high = player.y - terrainHeight(player.pos.x, player.pos.z) > 1.5;
    s.ghost.visible = s.seen && occl && (s.team === player.team || s.revealT > 0 || !high);
  }
  const kc = killCamTarget(); if (kc) kc.ghost.visible = true;
  for (const [who, h] of targets) {
    const t = eye(who, h); _d.subVectors(t, camera.position); const dist = _d.length(); _d.divideScalar(dist);
    ray.set(camera.position, _d); ray.far = dist - 0.3;
    for (const hit of ray.intersectObjects(fadeables, false)) { hit.object.material.opacity = 0.22; hit.object.material.depthWrite = false; faded.add(hit.object); }
  }
}
const hud = { hp: -1, key: '' };
// seta do pega-bandeira: aponta para a bandeira inimiga (ou para a sua base, se você está com ela)
const objEl = $('#objArrow'), objIco = objEl.querySelector('i'), objTxt = objEl.querySelector('span');
function updateObjArrow() {
  const p = player;
  const tt = tutTarget();
  if ((mode !== 'ctf' && !tt) || !p.alive || roundOver) { objEl.style.display = 'none'; return; }
  let T, label;
  if (tt) { T = tt.P; label = tt.label; }
  else { const mine = FLAGS[p.team], theirs = enemyFlag(p), carrying = ctfCarried(p);
  if (carrying) { T = mine.base; label = mine.atBase ? 'LEVE PARA SUA BASE' : 'SUA BANDEIRA FOI ROUBADA'; }
  else if (!mine.atBase && !mine.carrier) { T = mine.pos; label = 'RECUPERE SUA BANDEIRA'; }
  else if (theirs.carrier && theirs.carrier.team === p.team) { T = mine.base; label = 'PROTEJA ' + theirs.carrier.name.toUpperCase(); }
  else { T = theirs.pos; label = 'BANDEIRA INIMIGA'; } }
  const d = Math.round(Math.hypot(T.x - p.pos.x, T.z - p.pos.z));
  objTxt.textContent = `${label} · ${d} m`; objEl.style.display = 'block';
  const [sx, sy, ok] = toScreen(new V3(T.x, T.y + 3.2, T.z));
  // área livre do HUD (minimapa à esquerda, armas à direita, placar em cima, barra embaixo)
  const side = Math.min(150, innerWidth * 0.22), L = side, R = innerWidth - side, Tp = tt ? 150 : 90, B = innerHeight - 100;
  const inside = ok && sx > L && sx < R && sy > Tp && sy < B;
  objEl.classList.toggle('on-screen', inside);
  if (inside) { objIco.style.transform = 'rotate(180deg)'; objEl.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-100%)`; return; }
  const cx = innerWidth / 2, cy = innerHeight / 2; let dx = (ok ? sx : 2 * cx - sx) - cx, dy = (ok ? sy : 2 * cy - sy) - cy;
  const k = Math.min((dx > 0 ? R - cx : cx - L) / Math.abs(dx || 1e-3), (dy > 0 ? B - cy : cy - Tp) / Math.abs(dy || 1e-3));
  objIco.style.transform = `rotate(${Math.atan2(dx, -dy)}rad)`;
  objEl.style.transform = `translate(${cx + dx * k}px,${cy + dy * k}px) translate(-50%,-50%)`;
}
function updateHud() {
  updateObjArrow();
  const p = player, hp = Math.ceil(p.hp);
  if (hp !== hud.hp) { hud.hp = hp; $('#hpv').textContent = hp; $('#hpfill').style.width = hp + '%'; $('#hpfill').style.background = hp < 35 ? 'var(--danger)' : ''; }
  const w = p.w, rl = p.reloadT > 0, A = p.ammo[p.inv.primary], S = p.ammo[p.inv.secondary];
  const healTxt = (p.C.heal && p.healCd <= 0) ? '✚' : p.healChan > 0 ? '…' : (p.kits || 0) > 0 ? '×' + p.kits : p.C.heal ? Math.ceil(p.healCd) : '0';
  const key = [mode, p.weapon, p.mag, p.reserve, rl, p.inv.primary, p.inv.secondary, A?.mag, A?.res, S?.mag, S?.res, p.nadeSel, JSON.stringify(p.nades), p.armor, p.helmet, healTxt, p.att?.sil, p.att?.mira, p.drones, !!p.veh].join('|');
  if (key !== hud.key) {
    hud.key = key;
    const at = p.attOn; $('#wname').textContent = p.veh ? p.veh.def.name.toUpperCase() : w.name.toUpperCase() + (at.sil ? ' · SIL' : '') + (at.mira ? ' · MIRA' : '');
    $('#droneN').textContent = p.drones || 0; $('#droneBtn').classList.toggle('show', (p.drones || 0) > 0);
    if (p.veh) { $('#ammo').textContent = '🚙'; $('#resWrap').style.display = 'none'; }
    else if (p.turret) { $('#ammo').textContent = '∞'; $('#resWrap').style.display = 'none'; $('#ammo').classList.remove('low'); }
    else if (w.kind === 'melee') { $('#ammo').textContent = '∞'; $('#resWrap').style.display = 'none'; $('#ammo').classList.remove('low'); }
    else { $('#ammo').textContent = rl ? '…' : p.mag; $('#res').textContent = p.reserve; $('#resWrap').style.display = ''; $('#ammo').classList.toggle('low', p.mag <= Math.ceil(w.mag / 4)); }
    for (const el of document.querySelectorAll('.slot')) el.classList.toggle('on', el.dataset.slot === WEAPONS[p.weapon].slot);
    $('#n-primary').textContent = p.inv.primary ? WEAPONS[p.inv.primary].name : '— vazio —'; $('#s-primary').textContent = A ? `${A.mag}/${A.res}` : (mode === 'bomb' ? 'compre (B)' : 'ache em baú');
    $('#n-secondary').textContent = WEAPONS[p.inv.secondary].name; $('#s-secondary').textContent = `${S.mag}/${S.res}`;
    const nc = p.nades[p.nadeSel] || 0;
    $('#n-nade').textContent = NADES[p.nadeSel].name;
    $('#s-nade').textContent = NADE_ORDER.filter(n => p.nades[n] > 0).map(n => `${NADES[n].s}${p.nades[n]}`).join(' ') || '—';
    $('#nadeLbl').textContent = NADES[p.nadeSel].name.toUpperCase(); $('#nadeCount').textContent = nc; nadeEl.classList.toggle('empty', nc <= 0);
    $('#armv').textContent = p.armor; $('#armBox').classList.toggle('off', p.armor <= 0); $('#helmBox').classList.toggle('off', !p.helmet);
    $('#healCd').textContent = healTxt; healEl.classList.toggle('cd', !(p.C.heal && p.healCd <= 0) && !(p.kits > 0)); healEl.classList.toggle('show', !!p.C.heal || p.kits > 0); $('#healLbl').firstChild.textContent = (p.C.heal && p.healCd <= 0) ? 'CURA' : 'KIT';
  }
  $('#flashFx').style.opacity = clamp(p.blindT / 1.2, 0, 1);
  const T = p.turret; $('#heat').style.display = T ? 'block' : 'none';
  if (T) { const i = $('#heat i'); i.style.width = (T.cool > 0 ? 100 : T.heat * 100) + '%'; i.style.background = T.cool > 0 ? 'var(--danger)' : ''; }
  for (const s of soldiers) {
    const [ex, ey, eok] = toScreen(eye(s, 1));
    const off = s !== p && s.seen && s.team !== p.team && (!eok || ex < 20 || ex > innerWidth - 20 || ey < 20 || ey > innerHeight - 20);
    s.edge.style.display = off ? '' : 'none';
    if (off) {
      const cx = innerWidth / 2, cy = innerHeight / 2; let dx = (eok ? ex : 2 * cx - ex) - cx, dy = (eok ? ey : 2 * cy - ey) - cy;
      const k = Math.min((cx - 28) / Math.abs(dx || 1e-3), (cy - 28) / Math.abs(dy || 1e-3));
      s.edge.style.transform = `translate(${cx + dx * k}px,${cy + dy * k}px) translate(-50%,-50%) rotate(${Math.atan2(dx, -dy)}rad)`;
    }
    const [x, y, ok] = toScreen(new V3(s.pos.x, s.y + 2.15, s.pos.z));
    const enemy = s.team !== p.team;
    const covered = enemy && !(s.revealT > 0) && ((insideHouse(s) && upper[0].visible) || (inBK(s.pos.x, s.pos.z) && s.y < BK_TOP - 1 && bunkerRoof[0].visible) || (inBarnS(s) && barnRoof[0].visible) || inSmoke(s) || bushHidden(s, p));
    const hidden = !s.alive || !ok || covered || s.air === 'plane';
    s.tag.style.display = hidden ? 'none' : '';
    if (!hidden) {
      s.tag.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`; s.tagFill.style.width = s.hp + '%';
      const st = s.downed ? `CAÍDO ${Math.ceil(s.downT)}s` : s.blindT > 0 ? 'CEGO' : s.reloadT > 0 ? 'recarregando' : '';
      if (st !== s.tagStTxt) { s.tagStTxt = st; s.tagSt.textContent = st; }
    }
  }
}
const mm = $('#minimap'), mctx = mm.getContext('2d'), mmBg = document.createElement('canvas');
function buildMinimap() {
  const S = 124 * 2; mm.width = mm.height = S; mmBg.width = mmBg.height = S;
  const g = mmBg.getContext('2d'), N = 62, cell = S / N;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = -MAP + ((i + 0.5) / N) * MAP * 2, z = -MAP + ((j + 0.5) / N) * MAP * 2, h = terrainHeight(x, z);
    const [r, gg, b] = terrainColor(x, z), k = 0.75 + clamp(h / 12, -0.2, 0.35);
    g.fillStyle = `rgb(${r * 255 * k | 0},${gg * 255 * k | 0},${b * 255 * k | 0})`; g.fillRect(i * cell, j * cell, cell + 1, cell + 1);
  }
  const w2m = v => ((v + MAP) / (MAP * 2)) * S;
  g.fillStyle = 'rgba(30,26,22,.85)';
  for (const c of colliders) if (c.y1 - c.y0 > 0.5) g.fillRect(w2m(c.x0), w2m(c.z0), Math.max(2, w2m(c.x1) - w2m(c.x0)), Math.max(2, w2m(c.z1) - w2m(c.z0)));
  g.fillStyle = '#c9d65a';
  for (const l of loots) g.fillRect(w2m(l.x) - 3, w2m(l.z) - 3, 6, 6);
}
buildMinimap();
function drawMinimap() {
  const S = mm.width, w2m = v => ((v + MAP) / (MAP * 2)) * S;
  mctx.save(); mctx.clearRect(0, 0, S, S);
  mctx.beginPath(); mctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); mctx.clip();
  mctx.drawImage(mmBg, 0, 0);
  for (const b of bots) {
    if (!b.alive) continue;
    const ally = b.team === player.team;
    if (!ally && !(b.revealT > 0 || los(player, b) || (now - b.lastShot < 1.2 && !b.attOn.sil))) continue;
    mctx.fillStyle = ally ? '#5fb0ff' : '#e0493c'; mctx.beginPath(); mctx.arc(w2m(b.pos.x), w2m(b.pos.z), 6, 0, Math.PI * 2); mctx.fill();
  }
  for (const pg of pings) {
    const a = clamp(pg.t, 0, 1);
    mctx.strokeStyle = pg.kind === 'shot' ? `rgba(255,80,60,${a})` : `rgba(255,220,120,${a * 0.8})`; mctx.lineWidth = pg.kind === 'shot' ? 3 : 2;
    mctx.beginPath(); mctx.arc(w2m(pg.x), w2m(pg.z), pg.kind === 'shot' ? 10 + (1.4 - pg.t) * 10 : 5, 0, Math.PI * 2); mctx.stroke();
  }
  if (mode === 'br' && zoneMesh.visible) { mctx.strokeStyle = '#4aa3ff'; mctx.lineWidth = 3; mctx.beginPath(); mctx.arc(w2m(zone.x), w2m(zone.z), (zone.r / (MAP * 2)) * S, 0, Math.PI * 2); mctx.stroke(); }
  if (mode === 'br' && plane.mesh.visible) { mctx.fillStyle = '#fff'; mctx.beginPath(); mctx.arc(w2m(plane.pos.x), w2m(plane.pos.z), 5, 0, Math.PI * 2); mctx.fill(); }
  if (mode === 'bomb') { mctx.font = 'bold 22px system-ui'; mctx.fillStyle = '#e8a33a'; for (const st of SITES) mctx.fillText(st.name, w2m(st.x) - 7, w2m(st.z) + 8);
    if (bombS.pos) { mctx.fillStyle = bombS.planted ? '#ff3b30' : '#e8a33a'; mctx.fillRect(w2m(bombS.pos.x) - 4, w2m(bombS.pos.z) - 4, 8, 8); } }
  for (const V of vehicles) { if (V.dead) continue; mctx.fillStyle = V.driver ? (V.driver.team === player.team ? '#5fb0ff' : '#e0493c') : '#d8d0b8'; mctx.fillRect(w2m(V.pos.x) - 5, w2m(V.pos.z) - 5, 10, 10); }
  for (const L of loots) if (L.drop && L.state !== 'gone') { mctx.fillStyle = Math.sin(now * 8) > 0 ? '#ff3b30' : '#ffd04a'; mctx.fillRect(w2m(L.x) - 7, w2m(L.z) - 7, 14, 14); }
  for (const D of drops) { mctx.strokeStyle = '#ff3b30'; mctx.lineWidth = 3; mctx.strokeRect(w2m(D.x) - 8, w2m(D.z) - 8, 16, 16); }
  if (mode === 'ctf') for (const F of Object.values(FLAGS)) { mctx.fillStyle = F.team === 'A' ? '#5fb0ff' : '#e0493c'; mctx.font = 'bold 24px system-ui'; mctx.fillText('⚑', w2m(F.pos.x) - 8, w2m(F.pos.z) + 8);
    if (F === enemyFlag(player) && !ctfCarried(player)) { mctx.strokeStyle = '#ffe28a'; mctx.lineWidth = 3; mctx.beginPath(); mctx.arc(w2m(F.pos.x), w2m(F.pos.z), 12 + 5 * Math.sin(now * 5), 0, Math.PI * 2); mctx.stroke(); } }
  for (const s of smokes) { mctx.fillStyle = 'rgba(200,200,200,.6)'; mctx.beginPath(); mctx.arc(w2m(s.pos.x), w2m(s.pos.z), (s.r / (MAP * 2)) * S, 0, Math.PI * 2); mctx.fill(); }
  const px = w2m(player.pos.x), pz = w2m(player.pos.z);
  mctx.translate(px, pz); mctx.rotate(-player.facing);
  mctx.fillStyle = '#7fd0ff'; mctx.strokeStyle = '#000'; mctx.lineWidth = 2;
  mctx.beginPath(); mctx.moveTo(0, 13); mctx.lineTo(8, -8); mctx.lineTo(-8, -8); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.restore();
}

