'use strict';
// ================= utilidades =================
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
const V3 = THREE.Vector3;

// ================= regras =================
const MAP = 58;   // mapa maior (era 40): o centro continua igual, anel externo novo
const HOUSE = { x0: -6, x1: 6, z0: -15, z1: -6 };
const H0 = 0.2, FLOOR_H = 3.0, H1 = H0 + FLOOR_H;
const MAX_HP = 100, SHOT_H = 1.0, BODY_R = 0.42, HIT_R = 0.36;
// pen = quanto atravessa o colete (1 = ignora)
const WEAPONS = {
  ak:     { name: 'AK-47', kind: 'gun', slot: 'primary', mag: 30, reserve: 90, rate: 0.1, dmg: [27, 36], spread: 0.03, range: 32, reload: 2.4, speed: 5.0, pen: 0.55, snd: [3200, 150, 0.38] },
  m4:     { name: 'Colt M4', kind: 'gun', slot: 'primary', mag: 30, reserve: 90, rate: 0.085, dmg: [22, 29], spread: 0.019, range: 34, reload: 2.1, speed: 5.2, pen: 0.5, snd: [4300, 190, 0.3] },
  awp:    { name: 'AWP', kind: 'gun', slot: 'primary', mag: 5, reserve: 20, rate: 1.45, dmg: [108, 122], spread: 0.002, moveSpread: 0.14, range: 60, reload: 3.6, speed: 4.3, pen: 0.85, scope: true, snd: [1800, 90, 0.6] },
  deagle: { name: 'Desert Eagle', kind: 'gun', slot: 'secondary', mag: 7, reserve: 35, rate: 0.5, dmg: [46, 60], spread: 0.022, range: 28, reload: 2.2, speed: 5.4, pen: 0.6, snd: [2400, 120, 0.45] },
  pistol: { name: 'Pistola', kind: 'gun', slot: 'secondary', mag: 20, reserve: 120, rate: 0.3, dmg: [16, 22], spread: 0.03, range: 24, reload: 2.0, speed: 5.5, pen: 0.3, snd: [5000, 220, 0.22] },
  knife:  { name: 'Faca', kind: 'melee', slot: 'knife', rate: 0.55, dmg: [50, 60], range: 1.8, speed: 6.2, pen: 0.5 },
  // novas: escopeta (vários chumbos, forte de perto), SMG (rápida, corre mais), metralhadora (pente de 100, lenta)
  shotgun: { name: 'Escopeta', kind: 'gun', slot: 'primary', mag: 6, reserve: 30, rate: 0.85, dmg: [14, 19], pellets: 8, spread: 0.08, range: 15, reload: 2.8, speed: 5.0, pen: 0.3, snd: [1500, 80, 0.55] },
  smg:    { name: 'SMG', kind: 'gun', slot: 'primary', mag: 30, reserve: 120, rate: 0.065, dmg: [14, 19], spread: 0.026, range: 26, reload: 1.9, speed: 5.7, pen: 0.35, snd: [5200, 240, 0.22] },
  lmg:    { name: 'Metralhadora', kind: 'gun', slot: 'primary', mag: 100, reserve: 200, rate: 0.09, dmg: [24, 30], spread: 0.042, range: 32, reload: 4.6, speed: 4.2, pen: 0.55, snd: [2600, 120, 0.4] },
  turret: { name: 'Metralhadora fixa', kind: 'gun', slot: 'turret', mag: 999, reserve: 0, rate: 0.075, dmg: [26, 32], spread: 0.022, range: 40, reload: 1, speed: 0, pen: 0.6, snd: [2200, 110, 0.45] },
};
const NADES = { flash: { name: 'Flash', s: 'F', fuse: 1.5 }, he: { name: 'HE', s: 'HE', fuse: 1.6 }, smoke: { name: 'Smoke', s: 'S', fuse: 1.2 },
  molotov: { name: 'Molotov', s: 'Mo', fuse: 2.5, impact: true }, impact: { name: 'Impacto', s: 'I', fuse: 3, impact: true }, mine: { name: 'Mina', s: 'Mi', fuse: 1.0 } };
const NADE_ORDER = ['he', 'flash', 'smoke', 'molotov', 'mine'];
const CLASSES = {
  tr:     { name: 'Terrorista', primary: 'ak', secondary: 'deagle', nades: { he: 1, flash: 1, smoke: 0, molotov: 1 }, armor: 0, helmet: false,
            pal: { pants: 0x7a6a50, shirt: 0x8c7a5a, vest: 0x4a4234, pack: 0x3d372c, helmet: 0x5a4d3a } },
  ct:     { name: 'CT', primary: 'm4', secondary: 'pistol', nades: { he: 0, flash: 1, smoke: 1, mine: 1 }, armor: 60, helmet: true,
            pal: { pants: 0x3f4650, shirt: 0x4c5560, vest: 0x2a3038, pack: 0x262b31, helmet: 0x2f353d } },
  medic:  { name: 'Médico', primary: 'm4', secondary: 'pistol', nades: { he: 0, flash: 0, smoke: 2 }, armor: 30, helmet: false, heal: true,
            pal: { pants: 0x5e6248, shirt: 0x6b6f52, vest: 0x464a36, pack: 0xd9d4c8, helmet: 0x4f5340 } },
  sniper: { name: 'Sniper', primary: 'awp', secondary: 'deagle', nades: { he: 0, flash: 1, smoke: 1 }, armor: 0, helmet: false, drone: 1,
            pal: { pants: 0x55603f, shirt: 0x5f6b45, vest: 0x3e4630, pack: 0x39402b, helmet: 0x4b5536 } },
};
// roupas: só visual (combinado: camuflagem NÃO muda a visão dos bots)
const SKINS = {
  padrao: null,
  deserto:  { pants: 0xb59b6a, shirt: 0xc4a877, vest: 0x8f7a52, pack: 0x7d6a47, helmet: 0xa38d60, spot: 0x8a7148 },
  floresta: { pants: 0x3f5233, shirt: 0x4d6340, vest: 0x33422a, pack: 0x2c3824, helmet: 0x3a4a2e, spot: 0x2a2a1c },
  urbano:   { pants: 0x5a5c60, shirt: 0x6e7075, vest: 0x3c3e42, pack: 0x34363a, helmet: 0x4a4c50, spot: 0x2a2b2e },
  neve:     { pants: 0xdfe3e6, shirt: 0xeef0f2, vest: 0xc5cbd0, pack: 0xb8bec4, helmet: 0xd5d9dd, spot: 0x9aa2aa },
  ghillie:  { pants: 0x4a5532, shirt: 0x55603a, vest: 0x3c4428, pack: 0x343b24, helmet: 0x48522f, spot: 0x6b6a3a, ghillie: true },
};
const TEAM_MODES = new Set(['tdm', 'bomb', 'ctf']), RESPAWN_MODES = new Set(['treino', 'tdm', 'ctf']);
const TEAM_COLOR = { A: 0x2f7fd0, B: 0xc0392b };
const HEAL_CD = 18;
const DIFF = { facil: { react: 1.7, err: 1.9, dmg: 0.55 }, medio: { react: 1, err: 1, dmg: 0.75 }, dificil: { react: 0.6, err: 0.55, dmg: 0.95 } };
let diff = DIFF.medio;

