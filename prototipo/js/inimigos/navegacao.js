'use strict';
// ---------- navegação dos bots: grade de 0,5 m + A* (desvia de paredes, casas, carros e contêineres) ----------
// Só vale no nível do chão. Dentro da casa, no terraço/escada e dentro do bunker os bots usam a rota feita à mão (linha reta).
const NAV_C = 0.5, NAV_N = Math.round((MAP * 2) / NAV_C), NAV_INF = 0.4, NAV_SZ = NAV_N * NAV_N;
const navBlocked = new Uint8Array(NAV_SZ), navHgt = new Float32Array(NAV_SZ);
const navG = new Float32Array(NAV_SZ), navFrom = new Int32Array(NAV_SZ), navSeen = new Uint32Array(NAV_SZ), navClosed = new Uint32Array(NAV_SZ);
let navGen = 0;
const navIdx = (x, z) => { const i = Math.floor((x + MAP) / NAV_C), j = Math.floor((z + MAP) / NAV_C); return i < 0 || j < 0 || i >= NAV_N || j >= NAV_N ? -1 : j * NAV_N + i; };
const navX = k => -MAP + ((k % NAV_N) + 0.5) * NAV_C, navZ = k => -MAP + (((k / NAV_N) | 0) + 0.5) * NAV_C;
const inHouseRect = (x, z, m = 0) => x > HOUSE.x0 - m && x < HOUSE.x1 + m && z > HOUSE.z0 - m && z < HOUSE.z1 + m;
const navBase = k => { const x = navX(k), z = navZ(k); return Math.max(Math.abs(x), Math.abs(z)) > MAP - 2.2 || (x > 26.5 && x < BK.x1 + 0.6 && z > -0.7 && z < BK.z1 + 0.4) ? 1 : 0; }; // borda e vão da rampa do bunker
const navHits = (c, k) => { if (c.door && !c.leaf) return false; /* porta fechada o bot abre; folha aberta é parede */ const x = navX(k), z = navZ(k), h = navHgt[k];
  return x > c.x0 - NAV_INF && x < c.x1 + NAV_INF && z > c.z0 - NAV_INF && z < c.z1 + NAV_INF && c.y1 > h + 0.35 && c.y0 < h + 1.7; };
function navCellsOf(c, f) {
  const i0 = Math.max(0, Math.floor((c.x0 - NAV_INF + MAP) / NAV_C)), i1 = Math.min(NAV_N - 1, Math.floor((c.x1 + NAV_INF + MAP) / NAV_C));
  const j0 = Math.max(0, Math.floor((c.z0 - NAV_INF + MAP) / NAV_C)), j1 = Math.min(NAV_N - 1, Math.floor((c.z1 + NAV_INF + MAP) / NAV_C));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) f(j * NAV_N + i);
}
function navBuild() {
  for (let k = 0; k < NAV_SZ; k++) { const x = navX(k), z = navZ(k); navHgt[k] = inBK(x, z) ? BK_TOP : terrainHeight(x, z); navBlocked[k] = navBase(k); }
  for (const c of colliders) navCellsOf(c, k => { if (navHits(c, k)) navBlocked[k] = 1; });
}
function navRefresh(gone) {   // um caixote quebrou: recalcula só a área dele
  if (!gone) return;
  navCellsOf(gone, k => { navBlocked[k] = navBase(k) || (colliders.some(c => navHits(c, k)) ? 1 : 0); });
}
const navFree = k => k >= 0 && !navBlocked[k];
function navNearestFree(k) {
  if (k < 0 || navFree(k)) return k;
  const i0 = k % NAV_N, j0 = (k / NAV_N) | 0;
  for (let r = 1; r <= 8; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
    if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
    const i = i0 + di, j = j0 + dj; if (i < 0 || j < 0 || i >= NAV_N || j >= NAV_N) continue;
    if (!navBlocked[j * NAV_N + i]) return j * NAV_N + i;
  }
  return -1;
}
// linha livre na grade (ignora o começo/fim colados em obstáculo: bot encostado na parede, alvo ao lado de caixote)
function navLineClear(ax, az, bx, bz) {
  const d = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(d / 0.25));
  for (let s = 0; s <= n; s++) {
    const t = s / n, k = navIdx(lerp(ax, bx, t), lerp(az, bz, t));
    if (k < 0) return false;
    if (navBlocked[k] && t * d > 0.7 && (1 - t) * d > 0.7) return false;
  }
  return true;
}
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
const heapK = [], heapF = [];
function heapPush(k, f) { let i = heapK.length; heapK.push(k); heapF.push(f); while (i > 0) { const p = (i - 1) >> 1; if (heapF[p] <= f) break; heapK[i] = heapK[p]; heapF[i] = heapF[p]; i = p; } heapK[i] = k; heapF[i] = f; }
function heapPop() {
  const top = heapK[0], k = heapK.pop(), f = heapF.pop(), n = heapK.length;
  if (n) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && heapF[c + 1] < heapF[c]) c++; if (heapF[c] >= f) break; heapK[i] = heapK[c]; heapF[i] = heapF[c]; i = c; } heapK[i] = k; heapF[i] = f; }
  return top;
}
function navPath(sx, sz, gx, gz) {
  const s = navNearestFree(navIdx(sx, sz)), g = navNearestFree(navIdx(gx, gz));
  if (s < 0 || g < 0) return null;
  navGen++; heapK.length = heapF.length = 0;
  const gi = g % NAV_N, gj = (g / NAV_N) | 0;
  const H = k => { const dx = Math.abs((k % NAV_N) - gi), dz = Math.abs(((k / NAV_N) | 0) - gj); return dx + dz - 0.5858 * Math.min(dx, dz); };
  navSeen[s] = navGen; navG[s] = 0; navFrom[s] = -1; heapPush(s, H(s));
  let found = false, iter = 0;
  while (heapK.length && iter++ < 40000) {
    const k = heapPop();
    if (k === g) { found = true; break; }
    if (navClosed[k] === navGen) continue; navClosed[k] = navGen;
    const i = k % NAV_N, j = (k / NAV_N) | 0;
    for (const [di, dj, cost] of NB) {
      const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= NAV_N || nj >= NAV_N) continue;
      const nk = nj * NAV_N + ni; if (navBlocked[nk] || navClosed[nk] === navGen) continue;
      if (di && dj && (navBlocked[j * NAV_N + ni] || navBlocked[nj * NAV_N + i])) continue;   // não corta quina
      const ng = navG[k] + cost;
      if (navSeen[nk] === navGen && ng >= navG[nk]) continue;
      navSeen[nk] = navGen; navG[nk] = ng; navFrom[nk] = k; heapPush(nk, ng + H(nk));
    }
  }
  if (!found) return null;
  const cells = []; for (let k = g; k !== -1; k = navFrom[k]) cells.push(k); cells.reverse();
  // suaviza: só guarda as quinas onde a linha reta deixa de passar
  const out = []; let ax = sx, az = sz;
  for (let t = 1; t < cells.length; t++) {
    if (!navLineClear(ax, az, navX(cells[t]), navZ(cells[t]))) { ax = navX(cells[t - 1]); az = navZ(cells[t - 1]); out.push([ax, az]); }
  }
  out.push(navFree(navIdx(gx, gz)) ? [gx, gz] : [navX(g), navZ(g)]);
  return out;
}
// direção para o bot andar até (gx, gz): reta quando dá, senão segue o caminho do A* (recalcula a cada 1,5 s ou se o alvo mudar)
function navSteer(b, gx, gz) {
  const ai = b.ai, dx = gx - b.pos.x, dz = gz - b.pos.z, l = Math.hypot(dx, dz);
  if (l < 0.01) return [0, 0];
  const k0 = navIdx(b.pos.x, b.pos.z), nh = k0 >= 0 ? navHgt[k0] : b.y;
  if (Math.abs(b.y - nh) > 1.2 || navLineClear(b.pos.x, b.pos.z, gx, gz)) { ai.path = null; return [dx / l, dz / l]; }
  if (!ai.path || ai.pathT <= 0 || Math.hypot(ai.pathGoal[0] - gx, ai.pathGoal[1] - gz) > 1.5) {
    ai.path = navPath(b.pos.x, b.pos.z, gx, gz) || [[gx, gz]]; ai.pathI = 0; ai.pathT = 1.5; ai.pathGoal = [gx, gz];
  }
  const P = ai.path;
  while (ai.pathI < P.length - 1 && (Math.hypot(P[ai.pathI][0] - b.pos.x, P[ai.pathI][1] - b.pos.z) < 0.45 || navLineClear(b.pos.x, b.pos.z, P[ai.pathI + 1][0], P[ai.pathI + 1][1]))) ai.pathI++;
  const nx = P[ai.pathI][0] - b.pos.x, nz = P[ai.pathI][1] - b.pos.z, nl = Math.hypot(nx, nz);
  return nl < 0.01 ? [dx / l, dz / l] : [nx / nl, nz / nl];
}
navBuild();

