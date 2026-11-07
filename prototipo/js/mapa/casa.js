'use strict';
// ---------- casa de 2 andares ----------
{
  const T = 0.3, yb = H0 - 0.3, yt = H1 - 0.25;
  const { x0, x1, z0, z1 } = HOUSE;
  box(x0, x1, z0, z1, H0 - 0.2, H0 + 0.02, 0x7d5b3e, { collide: false, solid: false, cast: false });
  wall(x0, -4, z1 - T, z1, yb, yt); wall(-2.6, 0, z1 - T, z1, yb, yt);
  windowWall(0, 2, z1 - T, z1, yb, yt); wall(2, x1, z1 - T, z1, yb, yt);
  box(-4, -2.6, z1 - T, z1, H0 + 2.2, yt, WALL, { fade: true });
  wall(x0, -4, z0, z0 + T, yb, yt); windowWall(-4, -2, z0, z0 + T, yb, yt);
  wall(-2, 1, z0, z0 + T, yb, yt); wall(2.4, x1, z0, z0 + T, yb, yt);
  box(1, 2.4, z0, z0 + T, H0 + 2.2, yt, WALL, { fade: true });
  wall(x0, x0 + T, z0, -12, yb, yt); windowWall(x0, x0 + T, -12, -10, yb, yt); wall(x0, x0 + T, -10, z1, yb, yt);
  wall(x1 - T, x1, z0, z1, yb, yt);
  wall(-1.15, -0.85, z0 + T, -11.2, yb, yt); wall(-1.15, -0.85, -9.8, z1 - T, yb, yt);
  box(-1.15, -0.85, -11.2, -9.8, H0 + 2.2, yt, WALL, { fade: true });
  wall(3.2, 3.4, -12.6, -7.4, yb, yt, { color: 0xc9b592 });
  // fecha a fresta entre o topo das paredes e a mureta no vão da escada (tiro passava por ali)
  box(x1 - T, x1, -12.6, z1, yt, H1, WALL, { fade: true });
  box(3.2, x1, z1 - T, z1, yt, H1, WALL, { fade: true });

  // escada: rampa lógica + degraus visuais + blocos por baixo (não dá para atravessar por trás/lado)
  const RZ0 = -6.5, RZ1 = -12.6, RL = RZ0 - RZ1, rampH = z => H0 + clamp((RZ0 - z) / RL, 0, 1) * FLOOR_H;
  surfaces.push({ x0: 3.4, x1: 5.7, z0: RZ1, z1: z1 - T, h: (x, z) => rampH(z) });
  const N = 12;
  for (let i = 0; i < N; i++) {
    const za = RZ0 - (i * RL) / N, zb = RZ0 - ((i + 1) * RL) / N;
    box(3.4, 5.7, zb, za, H0, H0 + ((i + 1) * FLOOR_H) / N, i % 2 ? 0xa89c86 : 0xb3a78f, { collide: false });   // sólido: a bala não atravessa a escada por baixo
    const top = rampH(za) - 0.1;
    if (top > H0 + 0.4) colliders.push({ x0: 3.4, x1: 5.7, z0: zb, z1: za, y0: H0, y1: top });
  }

  const SL = 0xb5a993;
  box(x0, 3.2, z0, z1, H1 - 0.25, H1, SL, { collide: false, upper: true });
  box(3.2, x1, z0, -12.6, H1 - 0.25, H1, SL, { collide: false, upper: true });
  surfaces.push({ x0, x1: 3.2, z0, z1, h: () => H1 });
  surfaces.push({ x0: 3.2, x1, z0, z1: -12.6, h: () => H1 });
  const PT = 0.25, py0 = H1, py1 = H1 + 0.6, PC = 0xcbb895;
  wall(x0, x1, z1 - PT, z1, py0, py1, { upper: true, color: PC });
  wall(x0, x1, z0, z0 + PT, py0, py1, { upper: true, color: PC });
  wall(x0, x0 + PT, z0, z1, py0, py1, { upper: true, color: PC });
  wall(x1 - PT, x1, z0, z1, py0, py1, { upper: true, color: PC });
  wall(3.0, 3.2, -12.6, z1 - PT, py0, py1, { upper: true, color: PC });
  box(-4.2, -1.6, -7.0, -6.35, H1, H1 + 0.8, 0xa38f69, { upper: true });
  box(-5.6, -4.8, -14.6, -13.8, H1, H1 + 0.8, 0x9a7444, { upper: true });

  box(-4.6, -3.0, -13.6, -12.7, H0, H0 + 0.78, 0x6b4a30);
  box(-5.6, -5.0, -9.4, -7.2, H0, H0 + 0.7, 0x5b4636);
  box(-0.4, 0.5, -14.6, -13.7, H0, H0 + 1.1, 0x9a7444);
}

