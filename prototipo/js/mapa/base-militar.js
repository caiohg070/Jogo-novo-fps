'use strict';
// ---------- Base Militar (só no Battle Royale) ----------
// Quadrado de 30 m cercado por muro, com 2 portões, torre de vigia (escada + tirolesa), barracas,
// contêineres, caminhão quebrado e mais loot. O lugar é sorteado em terreno-cena.js (MIL).
// As posições abaixo são "locais": u/v de -15 a 15, com a torre sempre no canto virado para o centro do mapa.
const MIL_LOOT = [], MIL_FLOAT = [];
if (MIL) {
  const { cx, cz } = MIL, Y = MIL_Y, sx = cx > 0 ? -1 : 1, sz = cz > 0 ? -1 : 1;
  const X = u => cx + sx * u, Z = v => cz + sz * v;
  // retângulo local -> mundo [x0, x1, z0, z1]
  const W = (u0, u1, v0, v1) => [Math.min(X(u0), X(u1)), Math.max(X(u0), X(u1)), Math.min(Z(v0), Z(v1)), Math.max(Z(v0), Z(v1))];
  const B = (u0, u1, v0, v1, y0, y1, color, o) => { const [a, b, c, d] = W(u0, u1, v0, v1); return box(a, b, c, d, y0, y1, color, o); };

  // piso de terra batida
  B(-15, 15, -15, 15, Y - 0.25, Y + 0.02, 0x9a8a6a, { collide: false, solid: false, cast: false });
  // muro (2,3 m) com portões de 5 m no meio dos lados v = ±15
  const MC = 0x8c8a74, T = 0.35, MH = Y + 2.3, mw = (u0, u1, v0, v1) => { const [a, b, c, d] = W(u0, u1, v0, v1); wall(a, b, c, d, Y - 0.3, MH, { color: MC }); };
  for (const v of [-15, 15 - T]) { mw(-15, -2.5, v, v + T); mw(2.5, 15, v, v + T); }
  mw(-15, -15 + T, -15 + T, 15 - T); mw(15 - T, 15, -15 + T, 15 - T);

  // torre de vigia: 4 pernas, plataforma a 5 m, mureta com abertura para a escada
  const TOP = Y + 5, t0 = 7.5, t1 = 11.5, tc = (t0 + t1) / 2, LEG = 0x5a4a36;
  for (const u of [t0, t1 - 0.3]) for (const v of [t0, t1 - 0.3]) B(u, u + 0.3, v, v + 0.3, Y, TOP, LEG);
  B(t0, t1, t0, t1, TOP - 0.2, TOP, 0x6b5a42, { collide: false, fade: true });
  { const [a, b, c, d] = W(t0, t1, t0, t1); surfaces.push({ x0: a, x1: b, z0: c, z1: d, h: () => TOP }); }
  const PC = 0x5e4e38, pw = (u0, u1, v0, v1) => B(u0, u1, v0, v1, TOP, TOP + 1.0, PC, { fade: true });
  pw(t0, t1, t0, t0 + 0.2); pw(t0, t1, t1 - 0.2, t1); pw(t1 - 0.2, t1, t0 + 0.2, t1 - 0.2);
  pw(t0, t0 + 0.2, t0 + 0.2, tc - 0.7); pw(t0, t0 + 0.2, tc + 0.7, t1 - 0.2);           // lado da escada (abertura no meio)
  B(t0 - 0.2, t1 + 0.2, t0 - 0.2, t1 + 0.2, TOP + 2.1, TOP + 2.3, 0x4d5236, { collide: false, fade: true });   // telhadinho
  for (const u of [t0, t1 - 0.15]) for (const v of [t0, t1 - 0.15]) B(u, u + 0.15, v, v + 0.15, TOP + 1.0, TOP + 2.1, LEG, { collide: false });
  // escada de mão do lado de dentro da base (igual à do barracão)
  {
    const lz = Z(tc), xe = X(t0), out = -sx;   // "out" = sentido para fora da torre
    const la = { x: xe + out * 0.75, z: lz, y: Y }, lb = { x: xe - out * 0.9, z: lz, y: TOP }, xr = xe + out * 0.42;
    zips.push({ a: la, b: lb, ladder: true, time: 1.9, cable: t => t < 0.1 ? new V3(lerp(la.x, xr, t / 0.1), Y + 1.95, lz)
      : t < 0.8 ? new V3(xr, lerp(Y, TOP, (t - 0.1) / 0.7) + 1.95, lz) : new V3(lerp(xr, lb.x, (t - 0.8) / 0.2), TOP + 1.95, lz) });
    const LX = xe + out * 0.12, rm = stdMat(0x5a4632);
    for (const dz of [-0.4, 0.4]) { const m = new THREE.Mesh(boxGeo, rm); m.scale.set(0.08, TOP + 0.6 - Y, 0.08); m.position.set(LX, (Y + TOP + 0.6) / 2, lz + dz); m.castShadow = true; scene.add(m); }
    for (let i = 1; i <= 16; i++) { const yy = Y + i * 0.3; box(LX - 0.04, LX + 0.04, lz - 0.4, lz + 0.4, yy - 0.03, yy + 0.03, 0x6a5440, { collide: false, solid: false }); }
  }
  // tirolesa: do canto da torre, por cima do muro, até o chão do lado de fora (virado para o centro do mapa)
  {
    const k = Math.SQRT1_2, a = { x: X(t1 - 0.5), z: Z(t1 - 0.5), y: TOP };
    let L = 24, bx, bz;
    for (; L > 14; L -= 2) { bx = clamp(a.x + sx * k * L, -MAP + 6, MAP - 6); bz = clamp(a.z + sz * k * L, -MAP + 6, MAP - 6);
      if (!colliders.some(c => bx > c.x0 - 1 && bx < c.x1 + 1 && bz > c.z0 - 1 && bz < c.z1 + 1)) break; }
    const b = { x: bx, z: bz, y: terrainHeight(bx, bz) };
    const HANG = 2.7, SAG = 1.0, cable = t => new V3(lerp(a.x, b.x, t), lerp(a.y, b.y, t) + HANG - Math.sin(Math.PI * t) * SAG, lerp(a.z, b.z, t));
    const pts = []; for (let i = 0; i <= 24; i++) pts.push(cable(i / 24));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x222222 })));
    cyl(a.x, a.y + HANG / 2, a.z, 0.08, HANG + 0.1, 0x55504a);
    cyl(b.x, b.y + HANG / 2, b.z, 0.12, HANG + 0.1, 0x6e5640, null, { solid: true });
    colliders.push({ x0: b.x - 0.12, x1: b.x + 0.12, z0: b.z - 0.12, z1: b.z + 0.12, y0: b.y, y1: b.y + HANG });
    zips.push({ a, b, cable, HANG });
  }

  // barracas de lona (fechadas): base + telhado de duas águas
  const tent = (u, v) => {
    const [x0, x1, z0, z1] = W(u - 2.25, u + 2.25, v - 1.6, v + 1.6), cxx = (x0 + x1) / 2, czz = (z0 + z1) / 2, D = z1 - z0, RH = 1.0;
    box(x0, x1, z0, z1, Y, Y + 1.5, 0x5d6640, { fade: true });
    colliders[colliders.length - 1].y1 = Y + 2.5;
    const mat = stdMat(0x66704a), ang = Math.atan2(RH, D / 2), len = Math.hypot(RH, D / 2);
    for (const s of [-1, 1]) { const m = new THREE.Mesh(boxGeo, mat); m.scale.set(x1 - x0 + 0.2, 0.06, len + 0.1); m.position.set(cxx, Y + 1.5 + RH / 2, czz + s * D / 4); m.rotation.x = s * ang; m.castShadow = true; scene.add(m); }
  };
  tent(-9, -9); tent(-9, -2);
  // contêineres, caminhão quebrado, sacos de areia nos portões, barris e caixas
  { const [a, , c] = W(1, 7.1, -11, -8.55); container(a, c, true, 0x4a5a3a); }
  { const [a, , c] = W(-3, -0.55, 4, 10.1); container(a, c, false, 0x3f4a36); }
  {
    const [a, b, c, d] = W(1, 8, -4, -1.6); truck(a, c);
    const y = footing(a, a + 7, c, c + 2.4).y;
    box(a + 4.75, a + 7.05, c + 0.05, c + 2.35, y + 2.4, y + 2.46, 0x1d1a16, { collide: false, solid: false });   // capô/teto queimado
    box(a + 0.3, a + 3.2, c + 0.3, c + 2.1, y + 1.2, y + 1.24, 0x2a2620, { collide: false, solid: false });       // fuligem na carroceria
    cyl(sx > 0 ? b + 0.8 : a - 0.8, y + 0.18, (c + d) / 2 + 0.6, 0.48, 0.35, 0x1c1a17);                            // roda caída no chão
  }
  for (const [u0, u1, v0, v1] of [[-4.5, -1.5, 12, 12.8], [1.5, 4.5, -12.8, -12]]) { const [a, b, c, d] = W(u0, u1, v0, v1); sandbags(a, b, c, d); }
  for (const [u, v] of [[12, -12], [12.9, -11.2], [-12, 12], [-13, 11]]) barrel(X(u), Z(v), 0x4a5a36);
  crate(X(12), Z(0), 2); crate(X(12), Z(1.2), 1); crate(X(-3), Z(-8), 1);

  // loot: 6 baús (um em cima da torre) + 10 itens flutuando, todos com a tabela melhor
  for (const [u, v] of [[-9, -5.6], [4, -6], [0, 0], [11, 3], [-12, 8], [5, 12]]) MIL_LOOT.push([X(u), Z(v)]);
  MIL_LOOT.push([X(tc), Z(tc), TOP]);
  for (const [u, v] of [[-5, -12], [9.5, -2], [-12, -12], [2, 8], [-6, 6], [12, -6], [-13, 0], [6, 4], [-1, -5], [0, 13]]) MIL_FLOAT.push([X(u), Z(v)]);
}
