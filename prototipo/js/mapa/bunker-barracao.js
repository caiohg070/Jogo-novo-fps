'use strict';
// ---------- bunker subterrâneo: rampa a partir do leste, sala com teto que some quando você entra ----------
const bunkerRoof = [];
{
  const { x0, x1, z0, z1 } = BK, T = 0.3, F = BK_FLOOR, TOP = BK_TOP, RT = TOP - 0.25, C = 0x6f6a60;
  box(x0, x1, z0, z1, F - 0.2, F + 0.02, 0x55524b, { collide: false, solid: false, cast: false });
  box(x0, x0 + T, z0, z1, F - 0.2, RT, C); box(x0, x1, z0, z0 + T, F - 0.2, RT, C);
  box(x0, x1, z1 - T, z1, F - 0.2, TOP, C);
  box(x1 - T, x1, z0, -0.3, F - 0.2, RT, C);
  box(29, x1, -0.5, -0.3, F - 0.2, TOP, 0x625e55);                                      // parede entre rampa e sala
  // rampa (de x=33 no nível do chão até x=27 no piso)
  const rampH = x => F + clamp((x - 27) / 6, 0, 1) * (TOP - F);
  surfaces.push({ x0: 27, x1: x1 + 0.01, z0: -0.3, z1: z1 - T, h: (x) => rampH(x) });
  for (let i = 0; i < 12; i++) {
    const xa = 27 + i * 0.5, xb = xa + 0.5;
    box(xa, xb, -0.3, z1 - T, F, rampH(xb), i % 2 ? 0x7a756b : 0x847f74, { collide: false, solid: false });
    const top = rampH(xa) - 0.1; if (top > F + 0.4) colliders.push({ x0: xa, x1: xb, z0: -0.3, z1: z1 - T, y0: F, y1: top });
  }
  // teto (anda-se por cima); vão sobre a rampa
  for (const [a, b, c, d] of [[x0, x1, z0, -0.3], [x0, 27, -0.3, z1]]) {
    bunkerRoof.push(box(a, b, c, d, RT, TOP, 0x8a8478, { collide: false }));
    surfaces.push({ x0: a, x1: b, z0: c, z1: d, h: () => TOP });
  }
  // dentro: caixas e barris
  box(26, 27.3, -5.6, -4.4, F, F + 1.2, 0x9e7a48); box(30.5, 32.5, -5.6, -4.6, F, F + 1.1, 0x6b5a44);
  box(26, 26.9, -2.4, -1.4, F, F + 1.1, 0x8f6c40);
  const lamp = new THREE.PointLight(0xffd9a0, 8, 10, 1.6); lamp.position.set(29, F + 2.6, -3); scene.add(lamp);
}

// ---------- barracão de chapa com 4 portas (uma em cada lado) ----------
{
  const { x0, x1, z0, z1 } = BARN, T = 0.25, y0 = BARN_Y - 0.3, y1 = BARN_Y + 3.4, D = 1.0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const MW = 0x7f8279;
  box(x0, x1, z0, z1, BARN_Y - 0.2, BARN_Y + 0.03, 0x6d6a62, { collide: false, solid: false, cast: false });   // piso de concreto
  wall(x0, cx - D, z0, z0 + T, y0, y1, { color: MW }); wall(cx + D, x1, z0, z0 + T, y0, y1, { color: MW });   // norte
  wall(x0, cx - D, z1 - T, z1, y0, y1, { color: MW }); wall(cx + D, x1, z1 - T, z1, y0, y1, { color: MW });   // sul
  wall(x0, x0 + T, z0, cz - D, y0, y1, { color: MW }); wall(x0, x0 + T, cz + D, z1, y0, y1, { color: MW });   // oeste
  wall(x1 - T, x1, z0, cz - D, y0, y1, { color: MW }); wall(x1 - T, x1, cz + D, z1, y0, y1, { color: MW });   // leste
  for (const [a, b, c, d] of [[cx - D, cx + D, z0, z0 + T], [cx - D, cx + D, z1 - T, z1], [x0, x0 + T, cz - D, cz + D], [x1 - T, x1, cz - D, cz + D]])
    box(a, b, c, d, BARN_Y + 2.3, y1, MW, { fade: true });                                                   // vergas das portas
  // dentro: pilhas de caixas, paletes e uma divisória baixa
  const Y = BARN_Y;
  for (const [bx, bz, w, d, h] of [[8, -34.5, 2.2, 1.4, 1.2], [8, -34.5, 1.1, 1.1, 2.3], [22.5, -34.6, 2.6, 1.3, 1.2], [8, -23.2, 1.4, 1.4, 1.2],
    [23, -23.2, 1.6, 1.3, 1.2], [23.5, -23.2, 1.0, 1.0, 2.3], [12, -31, 1.3, 2.6, 1.15], [20, -31, 1.3, 2.6, 1.15], [12, -26, 1.3, 2.6, 1.15], [20, -26, 1.3, 2.6, 1.15]])
    box(bx - w / 2, bx + w / 2, bz - d / 2, bz + d / 2, Y, Y + h, h > 2 ? 0x8f6c40 : 0x9e7a48);
  box(14.2, 17.8, -24.2, -23.8, Y, Y + 1.15, 0x6b5a44);
}

// ---------- telhado do barracão + escada de mão na parede leste (lado de fora) ----------
const barnRoof = []; let ladderZ = null;
{
  const { x0, x1, z0, z1 } = BARN, R = BARN_Y + 3.4, top = R + 0.12;
  barnRoof.push(box(x0, x1, z0, z1, R, top, 0x6f726b, { collide: false, rough: 0.55, metal: 0.35 }));
  for (let i = 1; i < 10; i++) barnRoof.push(box(x0 + i * 2 - 0.05, x0 + i * 2 + 0.05, z0, z1, top, top + 0.04, 0x5c5f58, { collide: false, solid: false, cast: false }));
  surfaces.push({ x0, x1, z0, z1, h: () => top });
  const LX0 = x1, LX1 = x1 + 1.7, LZ0 = -34.6, LZ1 = -33.8;
  // escada de mão: não é rampa — sobe/desce pelo botão de ação (SUBIR/DESCER ESCADA)
  const LZ = (LZ0 + LZ1) / 2, la = { x: LX1 + 0.2, z: LZ, y: BARN_Y }, lb = { x: x1 - 0.9, z: LZ, y: top };
  ladderZ = { a: la, b: lb, ladder: true, time: 1.3, cable: t => t < 0.75 ? new V3(x1 + 0.4, lerp(BARN_Y, top, t / 0.75) + 1.95, LZ) : new V3(lerp(x1 + 0.4, lb.x, (t - 0.75) / 0.25), top + 1.95, LZ) };
  const rm = stdMat(0x5a4632);
  for (const z of [LZ0 + 0.05, LZ1 - 0.05]) {
    const L = Math.hypot(LX1 - LX0, top - BARN_Y), m = new THREE.Mesh(boxGeo, rm);
    m.scale.set(0.08, L, 0.08); m.position.set((LX0 + LX1) / 2, (BARN_Y + top) / 2, z); m.rotation.z = Math.atan2(LX1 - LX0, top - BARN_Y); m.castShadow = true; scene.add(m);
  }
  for (let i = 1; i < 10; i++) { const t = i / 10, x = LX1 - t * (LX1 - LX0), yy = BARN_Y + t * (top - BARN_Y); box(x - 0.04, x + 0.04, LZ0, LZ1, yy - 0.03, yy + 0.03, 0x6a5440, { collide: false, solid: false }); }
}

