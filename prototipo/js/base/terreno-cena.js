'use strict';
// ================= terreno =================
function roadFactor(x, z) {
  const e = Math.max(Math.abs(x), Math.abs(z));
  const r1 = 1 - smooth(2.6, 6.5, Math.abs(z - 4));
  const r2 = 1 - smooth(2.6, 6.5, Math.abs(x + 14));
  return Math.max(r1, r2) * (1 - smooth(MAP - 8, MAP - 2, e));
}
function rawHeight(x, z) {
  let h = 1.6 * Math.sin(x * 0.09 + 0.5) * Math.cos(z * 0.075 - 0.3)
        + 0.7 * Math.sin(x * 0.21 + z * 0.17)
        + 5.5 * Math.exp(-((x - 24) ** 2 + (z - 20) ** 2) / 110)
        + 4.0 * Math.exp(-((x + 27) ** 2 + (z + 6) ** 2) / 80)
        + 6.5 * Math.exp(-((x - 44) ** 2 + (z - 36) ** 2) / 160) + 5.5 * Math.exp(-((x + 44) ** 2 + (z + 32) ** 2) / 140)
        + 4.5 * Math.exp(-((x - 40) ** 2 + (z + 46) ** 2) / 120) + 5.0 * Math.exp(-((x + 42) ** 2 + (z - 44) ** 2) / 130);
  const e = Math.max(Math.abs(x), Math.abs(z));
  h += smooth(MAP - 4, MAP + 9, e) * 15;
  h = lerp(h, -0.5 + 0.035 * x - 0.03 * z, roadFactor(x, z) * 0.75);
  return h;
}
const BARN = { x0: 6, x1: 26, z0: -36, z1: -21 };
let BARN_Y = 0;
function flatten(h, x, z, R, y) {
  const dx = Math.max(R.x0 - x, 0, x - R.x1), dz = Math.max(R.z0 - z, 0, z - R.z1);
  return lerp(y, h, smooth(0.4, 5, Math.hypot(dx, dz)));
}
const BK = { x0: 25, x1: 33, z0: -6, z1: 1 };       // bunker subterrâneo
let BK_TOP = 0, BK_FLOOR = 0;
const inBK = (x, z) => x > BK.x0 && x < BK.x1 && z > BK.z0 && z < BK.z1;
function terrainHeight(x, z) {
  if (inBK(x, z)) return BK_FLOOR;
  return flatten(flatten(flatten(rawHeight(x, z), x, z, BK, BK_TOP), x, z, BARN, BARN_Y), x, z, HOUSE, H0);
}
BARN_Y = rawHeight(16, -28.5);
BK_TOP = rawHeight(29, -2.5); BK_FLOOR = BK_TOP - 3.2;
function terrainColor(x, z) {
  const n = 0.5 + 0.5 * Math.sin(x * 0.37 + Math.sin(z * 0.23) * 2) * Math.cos(z * 0.31 - x * 0.11);
  const n2 = 0.5 + 0.5 * Math.sin(x * 1.7 + z * 1.3) * Math.sin(z * 1.9 - x * 0.7);
  let r = 0.66, g = 0.54, b = 0.39;
  const mix = (cr, cg, cb, t) => { r = lerp(r, cr, t); g = lerp(g, cg, t); b = lerp(b, cb, t); };
  mix(0.53, 0.42, 0.30, n * 0.6);
  mix(0.55, 0.53, 0.34, smooth(0.62, 0.92, n2) * 0.5);
  mix(0.50, 0.48, 0.45, roadFactor(x, z) * 0.9);
  const e = Math.max(Math.abs(x), Math.abs(z));
  mix(0.60, 0.51, 0.42, smooth(MAP - 3, MAP + 6, e));
  return [r, g, b];
}

// ================= renderer / cena =================
const canvas = $('#game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
const C = (r, g, b) => new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
scene.background = C(0.80, 0.71, 0.57);
scene.fog = new THREE.Fog(scene.background.clone(), 45, 100);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.5, 220);
const CAM_OFF = new V3(0, 17.5, 11.2);
camera.position.copy(CAM_OFF);
camera.lookAt(0, 0, 0);
let camScale = 1, camZoom = 1;
function onResize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camScale = camera.aspect < 1 ? 1.55 : camera.aspect < 1.4 ? 1.2 : camera.aspect > 1.9 ? 1.18 : 1;
  camera.updateProjectionMatrix();
}
addEventListener('resize', onResize); onResize();

const hemi = new THREE.HemisphereLight(C(0.92, 0.85, 0.74), C(0.38, 0.30, 0.22), 1.15);
scene.add(hemi);
const sun = new THREE.DirectionalLight(C(1, 0.9, 0.78), 2.5);
const SUN_OFF = new V3(-30, 17, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 100 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);
const lantern = new THREE.PointLight(0xfff2d8, 0, 14, 1.6); scene.add(lantern); // luz em volta do jogador à noite

let terrainMat;
{
  const SIZE = (MAP + 26) * 2, SEG = 160;
  const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    p.setY(i, terrainHeight(x, z));
    const [r, gg, b] = terrainColor(x, z);
    c.setRGB(r, gg, b, THREE.SRGBColorSpace);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  const m = new THREE.Mesh(g, terrainMat);
  m.receiveShadow = true;
  scene.add(m);
}

