'use strict';
// ---------- portas (abrem/fecham com o botão; quebram com tiros) ----------
const doors = [];
function door(x0, x1, z0, z1, y0, y1, open = false, swing = 1) {
  const alongX = x1 - x0 > z1 - z0, w = alongX ? x1 - x0 : z1 - z0, th = alongX ? z1 - z0 : x1 - x0;
  const pivot = new THREE.Group(); pivot.position.set(alongX ? x0 : (x0 + x1) / 2, 0, alongX ? (z0 + z1) / 2 : z0); scene.add(pivot);
  const mat = stdMat(0x6e4e30);
  const m = new THREE.Mesh(boxGeo, mat); m.castShadow = true; m.receiveShadow = true;
  m.scale.set(alongX ? w : th, y1 - y0, alongX ? th : w); m.position.set(alongX ? w / 2 : 0, (y0 + y1) / 2, alongX ? 0 : w / 2); pivot.add(m);
  const knob = new THREE.Mesh(boxGeo, stdMat(0xc9b36a, { metal: 0.6, rough: 0.4 })); knob.scale.set(alongX ? 0.06 : th + 0.1, 0.06, alongX ? th + 0.1 : 0.06);
  knob.position.set(alongX ? w - 0.15 : 0, y0 + 1.0, alongX ? 0 : w - 0.15); pivot.add(knob);
  const col = { x0, x1, z0, z1, y0, y1, door: true };
  // porta aberta continua sólida: bloqueia onde a folha fica depois de girar (encostada, perpendicular ao vão)
  const hx = pivot.position.x, hz = pivot.position.z, t2 = th / 2 + 0.03;
  const colOpen = alongX ? { x0: hx - t2, x1: hx + t2, z0: Math.min(hz, hz - swing * w), z1: Math.max(hz, hz - swing * w), y0, y1, door: true, leaf: true }
                         : { x0: Math.min(hx, hx + swing * w), x1: Math.max(hx, hx + swing * w), z0: hz - t2, z1: hz + t2, y0, y1, door: true, leaf: true };
  const d = { pivot, m, col, colOpen, open: false, ang: 0, swing, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, y0, broken: false, x0, x1, z0, z1 };
  m.userData.hp = 240; m.userData.col = col; m.userData.door = d; m.userData.chip = 0x6e4e30;
  solids.push(m); colliders.push(col); doors.push(d);   // porta não fica transparente
  if (open) { setDoor(d, true, true); d.ang = d.swing * 1.6; pivot.rotation.y = d.ang; }
  return d;
}
function setDoor(d, open, quiet) {
  if (d.broken || d.open === open) return;
  if (!open && soldiers.some(s => s.alive && s.pos.x > d.x0 - 0.5 && s.pos.x < d.x1 + 0.5 && s.pos.z > d.z0 - 0.5 && s.pos.z < d.z1 + 0.5)) return;   // alguém no vão
  d.open = open;
  const i = colliders.indexOf(d.col), j = colliders.indexOf(d.colOpen);
  if (open) { if (i >= 0) colliders.splice(i, 1); if (j < 0) colliders.push(d.colOpen); }
  else { if (j >= 0) colliders.splice(j, 1); if (i < 0) colliders.push(d.col); }
  if (typeof navRefresh === 'function') navRefresh(d.colOpen);   // bots desviam da folha aberta
  if (!quiet && actx && player) { const v = vol(player.pos.distanceTo(new V3(d.cx, d.y0, d.cz)) * 2); if (v > 0.02 && !sfx(open ? 'porta_abrir' : 'porta_fechar', 0.55 * v, { pan: panOf(new V3(d.cx, d.y0, d.cz)) })) { noise(0.18, 0.12 * v, 'lowpass', 700); tone(open ? 240 : 180, open ? 140 : 90, 0.15, 0.06 * v, 'triangle'); } }
}
function updateDoors(dt) {
  for (const d of doors) {
    if (d.broken) continue;
    d.ang = lerp(d.ang, d.open ? d.swing * 1.6 : 0, Math.min(1, dt * 9)); d.pivot.rotation.y = d.ang;
    // bots abrem a porta fechada quando chegam nela
    if (!d.open) for (const b of bots) if (b.alive && !b.downed && Math.abs(b.y - d.y0) < 1.2 && Math.hypot(b.pos.x - d.cx, b.pos.z - d.cz) < 1.2) { setDoor(d, true); break; }
  }
}
door(-4, -2.6, -6.22, -6.08, H0, H0 + 2.2, false, 1);         // casa: frente
door(1, 2.4, -14.92, -14.78, H0, H0 + 2.2, false, -1);        // casa: fundos
door(-1.07, -0.93, -11.2, -9.8, H0, H0 + 2.2, true, 1);       // casa: porta de dentro
door(15, 17, -35.95, -35.8, BARN_Y, BARN_Y + 2.3, false, 1);   // barracão: norte
door(15, 17, -21.2, -21.05, BARN_Y, BARN_Y + 2.3, false, -1);  // barracão: sul
door(6.05, 6.2, -29.5, -27.5, BARN_Y, BARN_Y + 2.3, true, -1); // barracão: oeste
door(25.8, 25.95, -29.5, -27.5, BARN_Y, BARN_Y + 2.3, true, 1); // barracão: leste

