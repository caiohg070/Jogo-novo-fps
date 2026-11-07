'use strict';
// ================= clima =================
let weather = 'dia';
const RAIN_N = 1600, RAIN_BOX = [56, 26, 46];
const rainGeo = new THREE.BufferGeometry(), rainPos = new Float32Array(RAIN_N * 6), rainSpeed = new Float32Array(RAIN_N);
for (let i = 0; i < RAIN_N; i++) {
  const x = rand(-1, 1) * RAIN_BOX[0] / 2, y = rand(0, RAIN_BOX[1]), z = rand(-1, 1) * RAIN_BOX[2] / 2;
  rainPos.set([x, y, z, x + 0.04, y + 0.32, z + 0.02], i * 6); rainSpeed[i] = rand(22, 30);
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xb8c4d0, transparent: true, opacity: 0.45, depthWrite: false }));
rain.frustumCulled = false; rain.visible = false; scene.add(rain);
function applyWeather(w) {
  weather = w;
  const wet = w === 'chuva' || w === 'noite', night = w === 'noite';
  rain.visible = wet; puddles.visible = wet;
  if (w === 'dia') {
    scene.background = C(0.80, 0.71, 0.57); scene.fog.color.copy(scene.background); scene.fog.near = 45; scene.fog.far = 100;
    hemi.color = C(0.92, 0.85, 0.74); hemi.groundColor = C(0.38, 0.30, 0.22); hemi.intensity = 1.15;
    sun.color = C(1, 0.9, 0.78); sun.intensity = 2.5; renderer.toneMappingExposure = 1;
  } else if (w === 'chuva') {
    scene.background = C(0.52, 0.54, 0.56); scene.fog.color.copy(scene.background); scene.fog.near = 28; scene.fog.far = 80;
    hemi.color = C(0.70, 0.73, 0.78); hemi.groundColor = C(0.30, 0.28, 0.25); hemi.intensity = 1.25;
    sun.color = C(0.85, 0.88, 0.92); sun.intensity = 0.9; renderer.toneMappingExposure = 0.95;
  } else if (w === 'neblina') {
    scene.background = C(0.70, 0.71, 0.70); scene.fog.color.copy(scene.background); scene.fog.near = 7; scene.fog.far = 32;
    hemi.color = C(0.85, 0.85, 0.84); hemi.groundColor = C(0.40, 0.38, 0.35); hemi.intensity = 1.3;
    sun.color = C(0.9, 0.9, 0.9); sun.intensity = 0.7; renderer.toneMappingExposure = 1.0;
  } else {
    scene.background = C(0.10, 0.13, 0.18); scene.fog.color.copy(scene.background); scene.fog.near = 26; scene.fog.far = 80;
    hemi.color = C(0.42, 0.50, 0.68); hemi.groundColor = C(0.12, 0.12, 0.14); hemi.intensity = 0.95;
    sun.color = C(0.62, 0.72, 0.95); sun.intensity = 0.85; renderer.toneMappingExposure = 1.3;
  }
  for (const l of streetLights) l.intensity = night ? 45 : 0;
  lantern.intensity = night ? 12 : 0; lantern.distance = 18;
  terrainMat.roughness = wet ? 0.55 : 1; terrainMat.color.setScalar(wet ? 0.72 : 1);
  for (const m of allMats) m.roughness = wet ? Math.min(m.userData.rough, 0.5) : m.userData.rough;
  rain.material.opacity = night ? 0.2 : 0.28;
  if (rainGain) rainGain.gain.value = wet ? 0.12 : 0;
}
function updateRain(dt) {
  if (!rain.visible) return;
  rain.position.set(camTarget.x, camTarget.y - 2, camTarget.z - 4);
  const p = rainPos;
  for (let i = 0; i < RAIN_N; i++) {
    const o = i * 6, dy = rainSpeed[i] * dt;
    p[o + 1] -= dy; p[o + 4] -= dy; p[o] -= dy * 0.17; p[o + 3] -= dy * 0.17;
    if (p[o + 1] < 0) {
      const x = rand(-1, 1) * RAIN_BOX[0] / 2, z = rand(-1, 1) * RAIN_BOX[2] / 2, y = RAIN_BOX[1] + rand(0, 3);
      p[o] = x; p[o + 1] = y; p[o + 2] = z; p[o + 3] = x + 0.04; p[o + 4] = y + 0.32; p[o + 5] = z + 0.02;
    }
  }
  rainGeo.attributes.position.needsUpdate = true;
  if (Math.random() < dt * 25) {
    const x = camTarget.x + rand(-12, 12), z = camTarget.z + rand(-9, 9);
    spawnPart(new V3(x, groundAt(x, z, 50) + 0.05, z), 0xcfd8e0, 0.18, 0.25, new V3(0, 0.6, 0), false, 0.25, 0);
  }
}

