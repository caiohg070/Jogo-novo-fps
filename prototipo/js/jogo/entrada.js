'use strict';
// ================= entrada =================
const isTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
if (isTouch) { document.body.classList.add('is-touch'); $('#hint').style.display = 'none'; }
const joyEl = $('#joy'), joyKnob = $('#joyKnob'), aimEl = $('#aimBtn'), aimKnob = $('#aimKnob'), nadeEl = $('#nadeBtn'), nadeKnob = $('#nadeKnob'), healEl = $('#healBtn');
const JOY_R = 55, AIM_R = 58, NADE_R = 50;
const joy = { id: null, ox: 0, oy: 0, vx: 0, vy: 0 };
const aimT = { id: null, ox: 0, oy: 0, vx: 0, vy: 0 };
const nadeT = { id: null, ox: 0, oy: 0, vx: 0, vy: 0 };
const mouse = { x: 0, y: 0, down: false, has: false };
const keys = {};
let lastTouch = -99;
const mousePlane = new THREE.Plane(new V3(0, 1, 0), 0), ndc = new THREE.Vector2(), mouseHit = new V3();
function setVec(o, e, R, knob) {
  let dx = e.clientX - o.ox, dy = e.clientY - o.oy; const l = Math.hypot(dx, dy);
  if (l > R) { dx = (dx / l) * R; dy = (dy / l) * R; }
  o.vx = dx / R; o.vy = dy / R; knob.style.transform = `translate(${dx}px,${dy}px)`;
}
const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width / 2]; };
function nadeTarget() {
  const l = Math.hypot(nadeT.vx, nadeT.vy);
  if (l < 0.25) return [player.pos.x + Math.sin(player.facing) * 9, player.pos.z + Math.cos(player.facing) * 9];
  const dist = 2 + (THROW_MAX - 2) * clamp((l - 0.25) / 0.75, 0, 1);
  return [player.pos.x + (nadeT.vx / l) * dist, player.pos.z + (nadeT.vy / l) * dist];
}
function mouseWorld() {
  ndc.set((mouse.x / innerWidth) * 2 - 1, -(mouse.y / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera); mousePlane.constant = -(player.y + 1.0);
  return ray.ray.intersectPlane(mousePlane, mouseHit) ? mouseHit : null;
}
const usingMouse = () => mouse.has && now - lastTouch > 1.5;
function cycleNade() {
  const p = player, i = NADE_ORDER.indexOf(p.nadeSel);
  for (let k = 1; k <= NADE_ORDER.length; k++) { const n = NADE_ORDER[(i + k) % NADE_ORDER.length]; if (p.nades[n] > 0) { p.nadeSel = n; blip(700, 0.03, 0.05); return; } }
}
function throwSelected() {
  if (usingMouse()) { const m = mouseWorld(); if (m) { throwNade(player, player.nadeSel, m.x, m.z); if (tut && !tut.done) tut.nadeDrag = true; } }
  else { throwNade(player, player.nadeSel, player.pos.x + Math.sin(player.facing) * 9, player.pos.z + Math.cos(player.facing) * 9); if (tut && !tut.done) tut.nadeDrag = true; }
}
function useSlot(id) {
  if (id === 'nade') { if (usingMouse()) throwSelected(); else cycleNade(); }
  else player.switchTo(id === 'knife' ? 'knife' : player.inv[id]);
}
addEventListener('pointerdown', e => {
  if (!started || paused || e.target.closest?.('.board,#buyBtn,#actBtn,#fsBtn,#pauseBtn')) return;
  if (e.target.closest?.('#walkBtn') || (isTouch && e.pointerType !== 'mouse' && (() => { const [wx, wy, wr] = center($('#walkBtn')); return Math.hypot(e.clientX - wx, e.clientY - wy) < wr * 1.1; })())) { walkOn = !walkOn; $('#walkBtn').classList.toggle('on', walkOn); lastTouch = now; return; }
  const slot = e.target.closest?.('.slot');
  if (slot) { if (e.pointerType !== 'mouse') lastTouch = now; useSlot(slot.dataset.slot); return; }
  if (e.target.id === 'reloadBtn') { lastTouch = now; player.startReload(); return; }
  if (player.drones > 0 && isTouch && e.pointerType !== 'mouse') { const [dx, dy, dr] = center($('#droneBtn')); if (Math.hypot(e.clientX - dx, e.clientY - dy) < dr * 1.1) { lastTouch = now; useDrone(player); return; } }
  if (e.pointerType === 'mouse') { if (e.button === 0) mouse.down = true; mouse.has = true; return; }
  lastTouch = now;
  if (player.C.heal || player.kits > 0) { const [hx, hy, hr] = center(healEl); if (Math.hypot(e.clientX - hx, e.clientY - hy) < hr * 1.1) { player.heal(); return; } }
  const [nx, ny, nr] = center(nadeEl);
  if (nadeT.id === null && Math.hypot(e.clientX - nx, e.clientY - ny) < nr * 1.15) {
    nadeT.id = e.pointerId; nadeT.ox = nx; nadeT.oy = ny; setVec(nadeT, e, NADE_R, nadeKnob); nadeEl.classList.add('on'); return;
  }
  const [ax, ay, ar] = center(aimEl);
  if (aimT.id === null && Math.hypot(e.clientX - ax, e.clientY - ay) < ar * 1.7) {
    aimT.id = e.pointerId; aimT.ox = ax; aimT.oy = ay; setVec(aimT, e, AIM_R, aimKnob); aimEl.classList.add('on'); return;
  }
  if (joy.id === null && e.clientX < innerWidth * 0.5) {
    joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY;
    joyEl.style.left = e.clientX + 'px'; joyEl.style.top = e.clientY + 'px'; joyEl.classList.remove('idle');
    setVec(joy, e, JOY_R, joyKnob);
  }
});
addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse') { mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true; return; }
  if (e.pointerId === joy.id) setVec(joy, e, JOY_R, joyKnob);
  if (e.pointerId === aimT.id) setVec(aimT, e, AIM_R, aimKnob);
  if (e.pointerId === nadeT.id) setVec(nadeT, e, NADE_R, nadeKnob);
});
function endPointer(e) {
  if (e.pointerType === 'mouse') { if (e.button === 0) mouse.down = false; return; }
  if (e.pointerId === joy.id) { joy.id = null; joy.vx = joy.vy = 0; joyKnob.style.transform = ''; joyEl.style.left = ''; joyEl.style.top = ''; joyEl.classList.add('idle'); }
  if (e.pointerId === aimT.id) { aimT.id = null; aimT.vx = aimT.vy = 0; aimKnob.style.transform = ''; aimEl.classList.remove('on'); }
  if (e.pointerId === nadeT.id) {
    if (e.type === 'pointerup') { const [tx, tz] = nadeTarget(), dragged = Math.hypot(nadeT.vx, nadeT.vy) >= 0.25, n = tut && !tut.done ? tut.nadeCount() : 0; throwNade(player, player.nadeSel, tx, tz); if (dragged && tut && !tut.done && tut.nadeCount() < n) tut.nadeDrag = true; }
    nadeT.id = null; nadeT.vx = nadeT.vy = 0; nadeKnob.style.transform = ''; nadeEl.classList.remove('on');
  }
}
addEventListener('pointerup', endPointer); addEventListener('pointercancel', endPointer);
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('keydown', e => {
  keys[e.code] = true;
  if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat && started) { setPause(!paused); return; }
  if (!started || paused || e.repeat) return;
  if (e.code === 'KeyR') player.startReload();
  if (e.code === 'Digit1') useSlot('primary');
  if (e.code === 'Digit2') useSlot('secondary');
  if (e.code === 'Digit3') useSlot('knife');
  if (e.code === 'Digit4') cycleNade();
  if (e.code === 'KeyG') throwSelected();
  if (e.code === 'KeyE') player.heal();
  if (e.code === 'KeyV') useDrone(player);
  if (e.code === 'KeyB') openShop();
  if (e.code === 'KeyF') lootAction();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('wheel', e => {
  if (!started) return;
  const L = player.loadout, i = L.indexOf(player.weapon);
  player.switchTo(L[(i + (e.deltaY > 0 ? 1 : L.length - 1)) % L.length]);
}, { passive: true });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouse.down = false; });

const aimGeo = new THREE.PlaneGeometry(0.14, 1); aimGeo.rotateX(-Math.PI / 2); aimGeo.translate(0, 0, 0.5);
const aimTex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); return new THREE.CanvasTexture(c); })();
const aimLine = new THREE.Mesh(aimGeo, new THREE.MeshBasicMaterial({ map: aimTex, color: 0xffffff, transparent: true, opacity: 0.6, depthTest: false, depthWrite: false, fog: false }));
aimLine.material.opacity = 0.85; aimLine.renderOrder = 10; aimLine.visible = false; scene.add(aimLine);
const ringGeo = new THREE.RingGeometry(0.55, 0.75, 32); ringGeo.rotateX(-Math.PI / 2);
const nadeRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthTest: false, depthWrite: false, fog: false }));
nadeRing.renderOrder = 10; nadeRing.visible = false; scene.add(nadeRing);

const FIRST_SHOT_DELAY = 0.18; let fireHoldT = 0;
function autoAimAngle() {
  let best = null, bd = player.w.kind === 'melee' ? 4 : player.w.range;
  for (const b of enemiesOf(player)) {
    const d = Math.hypot(b.pos.x - player.pos.x, b.pos.z - player.pos.z);
    if (d < bd && los(player, b)) { bd = d; best = b; }
  }
  return best ? Math.atan2(best.pos.x - player.pos.x, best.pos.z - player.pos.z) : player.facing;
}
let scopeHeld = false, scopeAng = 0, walkOn = false, stepT = 0;
function updatePlayer(dt) {
  const p = player;
  let mx = joy.vx, mz = joy.vy;
  if (keys.KeyW || keys.ArrowUp) mz -= 1; if (keys.KeyS || keys.ArrowDown) mz += 1;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
  const l = Math.hypot(mx, mz); if (l > 1) { mx /= l; mz /= l; }
  let aimAng = null, firing = false, showAim = false;
  if (p.air) return updateAirPlayer(p, mx, mz, dt);
  if (p.veh) { aimLine.visible = false; nadeRing.visible = false; driveVehicle(p.veh, roundOver ? 0 : mx, roundOver ? 0 : mz, dt); return; }
  if (p.zip) { aimLine.visible = false; updateZip(p, dt); return; }
  if (aimT.id !== null) {
    firing = true;
    if (Math.hypot(aimT.vx, aimT.vy) > 0.28) { aimAng = Math.atan2(aimT.vx, aimT.vy); showAim = true; }
    else aimAng = autoAimAngle();
  } else if (usingMouse()) {
    const m = mouseWorld();
    if (m) { aimAng = Math.atan2(m.x - p.pos.x, m.z - p.pos.z); showAim = true; }
    firing = mouse.down;
  }
  if (!p.alive || roundOver) { firing = false; showAim = false; mx = mz = 0; }
  if (p.downed) { firing = false; showAim = false; }
  p.walking = walkOn || keys.ShiftLeft || keys.ShiftRight;
  if (p.healChan > 0) { mx *= 0.3; mz *= 0.3; }
  p.move(mx, mz, p.w.speed * (firing && p.w.kind === 'gun' ? 0.82 : 1) * (p.walking ? 0.5 : 1), dt);
  // passos correndo: bots inimigos por perto ouvem
  if (p.moving && !p.walking && (stepT -= dt) <= 0) { stepT = 0.5; for (const b of enemiesOf(p)) if (b.isBot && b.pos.distanceTo(p.pos) < 13) botHeard(b, p.pos); }
  if (aimAng !== null) p.facing = aimAng; else if (p.moving) p.facing = Math.atan2(mx, mz);
  // AWP (luneta): segurar = mirar com a linha vermelha; soltar = atirar
  if (p.w.scope) {
    if (firing) { showAim = true; scopeAng = p.facing; firing = false; p.move(0, 0, 0, dt); }
    else if (scopeHeld && p.alive && !roundOver) p.tryFire(scopeAng);
    scopeHeld = aimT.id !== null || (usingMouse() && mouse.down);
  } else scopeHeld = false;
  // pequeno atraso antes do 1º tiro (dá tempo de mirar); rajada continua normal depois
  if (firing && p.w.kind === 'gun') { if ((fireHoldT += dt) >= FIRST_SHOT_DELAY) p.tryFire(p.facing); }
  else { fireHoldT = 0; if (firing) p.tryFire(p.facing); }
  aimLine.visible = showAim;
  if (showAim) {
    const range = p.w.range * (p.attOn.mira ? 1.25 : 1), o = eye(p, SHOT_H);
    let h = Math.min(range, groundShot(o, Math.sin(p.facing), Math.cos(p.facing), range, p).dist); hitProp = null;
    const fx = Math.sin(p.facing), fz = Math.cos(p.facing);
    for (const t of enemiesOf(p)) {                                // para no primeiro inimigo na linha
      const ox = t.pos.x - p.pos.x, oz = t.pos.z - p.pos.z, pr = ox * fx + oz * fz;
      if (pr > 0 && pr < h && ox * ox + oz * oz - pr * pr < HIT_R * HIT_R) h = Math.max(0.5, pr - HIT_R);
    }
    // laser: sai do cano da arma, na altura dela
    const mz = p.w.kind === 'gun' && p.m.guns[p.weapon] ? p.muzzlePos() : eye(p, SHOT_H);
    const fwd = (mz.x - p.pos.x) * fx + (mz.z - p.pos.z) * fz;
    aimLine.position.set(mz.x, mz.y, mz.z); aimLine.rotation.set(-Math.atan(lastSlope), p.facing, 0, 'YXZ');   // laser inclinado igual à bala (sobe/desce o morro em linha reta)
    aimLine.scale.z = Math.max(0.2, (h - fwd) * Math.sqrt(1 + lastSlope * lastSlope));
    aimLine.scale.x = 0.25;
    aimLine.material.color.set(p.w.scope ? 0xff2a1f : firing ? 0xff7a50 : 0xff4a3a);
  }
  nadeRing.visible = nadeT.id !== null && p.alive && p.nades[p.nadeSel] > 0;
  if (nadeRing.visible) { const [tx, tz] = nadeTarget(); nadeRing.position.set(tx, groundAt(tx, tz, p.y + 1) + 0.08, tz); }
}

