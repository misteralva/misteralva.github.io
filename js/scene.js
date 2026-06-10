import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const NAVY = 0x09090f;

const MODELS = [
  { name:'Room', file:'assets/model.glb' },
];
let modelIdx    = 0;
let isSwitching = false;

const hotspots = [];

let spotlightMode = false;
let spotlight     = null;
let explodeActive = false;
const explodeData = [];

let renderer, scene, camera, model, accentLight, ambientLight, keyLight;
let dust, dustPositions;
let mx = 0, my = 0;
let clock = 0;
let _lastFrame = 0;
let _frameCount = 0;
let _paused = false;
let _lastInteract = performance.now();
let _dprAdjusted = false;
let _startTime = 0;
const _ACTIVE_MS = 1000 / 30;
const _IDLE_MS   = 1000 / 15;
let _lastRender  = 0;
document.addEventListener('visibilitychange', () => { _paused = document.hidden; });
let isEntering = false;
let pcScreenMesh = null;

const camPos    = new THREE.Vector3(0, 1.5, 7);
const camTarget = new THREE.Vector3(0, 0, 0);
const defaultCamPos    = new THREE.Vector3(0, 1.5, 7);
const defaultCamTarget = new THREE.Vector3(0, 0, 0);

let isDragging = false, dragX = 0, dragY = 0;
let _cachedMeshes = null;
let _canvasW = 0, _canvasH = 0;

let scrollVel = 0;
const _driftTarget  = new THREE.Vector3();
const _hotspotWorld = new THREE.Vector3();
const _lookTarget   = new THREE.Vector3();

const PRESETS = [
  { name:'Default',   bg:0x09090f, ambient:[0xffffff,2.5], key:[0xffffff,3.0], accent:[0x64ffda,1.0], css:'#64ffda' },
  { name:'Retrowave', bg:0x0a0015, ambient:[0xff88ff,1.8], key:[0xff88cc,2.0], accent:[0xff2d78,2.2], css:'#ff2d78' },
  { name:'Hacker',    bg:0x000a02, ambient:[0x00ff80,1.4], key:[0x88ffaa,2.2], accent:[0x00ff41,2.8], css:'#00ff41' },
  { name:'Warm',      bg:0x0d0804, ambient:[0xffd280,2.0], key:[0xffd28a,2.8], accent:[0xffb347,1.8], css:'#ffb347' },
];
let presetIdx = 0;

export function switchModel(idx) {
  if (isSwitching || idx === modelIdx || idx < 0 || idx >= MODELS.length) return;
  isSwitching = true;
  modelIdx    = idx;
  document.dispatchEvent(new CustomEvent('model-switching', { detail: { name: MODELS[idx].name } }));
  hotspots.forEach(h => h.el?.classList.remove('visible'));
  hotspots.length = 0;
  const canvas = document.getElementById('gl');
  if (typeof gsap !== 'undefined' && canvas) {
    gsap.to(canvas, {
      opacity: 0, duration: .35, ease: 'power2.in',
      onComplete() {
        clearModel();
        loadModelFile(MODELS[idx].file, () => {
          gsap.to(canvas, { opacity: 1, duration: .5, ease: 'power2.out' });
          isSwitching = false;
        });
      }
    });
  } else {
    clearModel();
    loadModelFile(MODELS[idx].file, () => { isSwitching = false; });
  }
}

function clearModel() {
  if (model) { scene?.remove(model); model = null; }
  _cachedMeshes = null;
  pcScreenMesh = null;
  if (dust)  { scene?.remove(dust);  dust  = null; }
  explodeData.length = 0;
  explodeActive      = false;
  if (spotlightMode) {
    spotlightMode = false;
    if (spotlight) { scene?.remove(spotlight); scene?.remove(spotlight.target); spotlight = null; }
    if (ambientLight && PRESETS[presetIdx]) ambientLight.intensity = PRESETS[presetIdx].ambient[1];
    if (keyLight     && PRESETS[presetIdx]) keyLight.intensity     = PRESETS[presetIdx].key[1];
  }
}

export function toggleSpotlight() {
  spotlightMode = !spotlightMode;
  if (spotlightMode) {
    if (!spotlight) {
      spotlight = new THREE.SpotLight(0xffffff, 14, 20, Math.PI / 5.5, 0.28);
      spotlight.position.set(0, 5, 5);
      scene?.add(spotlight);
      scene?.add(spotlight.target);
    }
    if (ambientLight) ambientLight.intensity = 0.08;
    if (keyLight)     keyLight.intensity     = 0;
    if (accentLight)  accentLight.intensity  = 0.15;
  } else {
    const p = PRESETS[presetIdx];
    if (ambientLight) { ambientLight.intensity = p.ambient[1]; }
    if (keyLight)     { keyLight.intensity     = p.key[1]; }
    if (accentLight)  { accentLight.intensity  = p.accent[1]; }
  }
  return spotlightMode;
}

export function toggleExplode() {
  if (!model) return false;
  explodeActive = !explodeActive;

  if (!explodeData.length) {
    
    let pool = [...model.children];
    for (let depth = 0; depth < 4 && pool.length < 4; depth++) {
      const deeper = [];
      pool.forEach(c => { if (c.children?.length) deeper.push(...c.children); });
      if (deeper.length > pool.length) pool = deeper; else break;
    }
    pool.forEach(child => {
      explodeData.push({ obj: child, origPos: child.position.clone() });
    });
  }

  if (!explodeData.length) { explodeActive = !explodeActive; return false; }

  explodeData.forEach((d, i) => {
    
    const dir = d.origPos.clone().normalize();
    if (dir.length() < 0.04) {
      const a = (i / explodeData.length) * Math.PI * 2;
      dir.set(Math.cos(a), Math.sin(a * 0.7), Math.sin(a) * 0.5).normalize();
    }
    const dist   = 0.9 + (i % 5) * 0.18;
    const target = explodeActive
      ? d.origPos.clone().addScaledVector(dir, dist)
      : d.origPos.clone();

    if (typeof gsap !== 'undefined') {
      gsap.to(d.obj.position, {
        x: target.x, y: target.y, z: target.z,
        duration: explodeActive ? .55 : .9,
        delay: i * 0.008,
        ease: explodeActive ? 'power3.out' : 'elastic.out(1, 0.4)',
      });
    } else {
      d.obj.position.copy(target);
    }
  });
  return explodeActive;
}

function getModelSection(hitPoint, meshName) {
  const name = (meshName || '').toLowerCase();
  if (/chair|seat|sofa|couch|stool/.test(name))   return 'experience';
  if (/book|shelf|cabinet|drawer|rack/.test(name)) return 'skills';
  if (/lamp|light|plant|flower|decor/.test(name)) return 'contact';
  const { x, y } = hitPoint;
  if (x < -0.55) return 'experience';
  if (x >  0.55) return 'skills';
  if (y < -0.25) return 'about';
  return null;
}

function findPCScreen(group) {
  const all = [];
  group.traverse(child => {
    if (!child.isMesh) return;
    const box = new THREE.Box3().setFromObject(child);
    const sz  = box.getSize(new THREE.Vector3());
    const ctr = box.getCenter(new THREE.Vector3());
    all.push({ mesh: child, name: child.name, sz, ctr });
  });

  
  const named = all.filter(m => /screen|monitor|display|lcd|glass|emissive|emission|panel|crt|tv/i.test(m.name));
  if (named.length) return named[0].mesh;

  
  const sized = all.filter(m => {
    const d = [m.sz.x, m.sz.y, m.sz.z].sort((a,b)=>a-b);
    return d[2] < 2.0 && d[0] < 0.3 && d[2] > 0.05;
  });
  if (sized.length) {
    sized.sort((a,b) => Math.abs(a.ctr.x) - Math.abs(b.ctr.x));
    return sized[0].mesh;
  }

  
  all.sort((a,b) => a.sz.x * a.sz.y - b.sz.x * b.sz.y);
  const pick = all[Math.floor(all.length * 0.2)] ?? all[0];
  return pick?.mesh ?? null;
}

function getModelMeshes() {
  if (!model) return [];
  if (_cachedMeshes) return _cachedMeshes;
  _cachedMeshes = [];
  model.traverse(c => { if (c.isMesh) _cachedMeshes.push(c); });
  return _cachedMeshes;
}

function setupHotspots(loadedModel) {
  const container = document.getElementById('hotspot-container');
  if (!container) return;

  
  const pool = [];
  loadedModel.traverse(child => {
    if (!child.isMesh || child === pcScreenMesh) return;
    const box  = new THREE.Box3().setFromObject(child);
    const sz   = box.getSize(new THREE.Vector3());
    const ctr  = box.getCenter(new THREE.Vector3());
    const diag = sz.length();
    if (diag < 0.08 || diag > 5.5) return;
    pool.push({ mesh: child, ctr, diag });
  });

  if (pool.length < 3) return;

  
  const pickZone = (xMin, xMax) => {
    const cands = pool.filter(d => d.ctr.x >= xMin && d.ctr.x <= xMax);
    if (!cands.length) return null;
    cands.sort((a, b) => b.diag - a.diag);
    return cands[0];
  };

  
  const xCoords = pool.map(d => d.ctr.x);
  const xMin = Math.min(...xCoords), xMax = Math.max(...xCoords);
  const third = (xMax - xMin) / 3;

  const zones = [
    { section:'experience', label:'EXPERIENCE', xL: xMin,          xR: xMin + third,   yOffset: 0 },
    { section:'about',      label:'PROFILE',    xL: xMin + third,  xR: xMax - third,   yOffset: 0 },
    { section:'skills',     label:'SKILLS',     xL: xMax - third,  xR: xMax,           yOffset: 0 },
  ];

  zones.forEach(z => {
    const found = pickZone(z.xL, z.xR);
    if (!found) return;
    const el = document.createElement('div');
    el.className = 'hs-dot';
    el.innerHTML = '<div class="hs-ring"></div><span class="hs-lbl">' + z.label + '</span>';
    container.appendChild(el);
    el.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('model-section-click', { detail: { section: z.section } }));
    });
    hotspots.push({ mesh: found.mesh, el, yOffset: z.yOffset });
  });
}

function setPct(n) {
  const f = document.getElementById('gl-fill');
  const p = document.getElementById('gl-pct');
  if (f) f.style.width = Math.round(n) + '%';
  if (p && n < 100) p.textContent = `Cargando habitación… ${Math.round(n)}%`;
}

let _hintTimer;
function showHint(text) {
  const hint = document.getElementById('room-hint');
  const span = hint?.querySelector('span');
  if (!hint || !span) return;
  clearTimeout(_hintTimer);
  span.textContent = text;
  hint.classList.add('visible');
  _hintTimer = setTimeout(() => hint.classList.remove('visible'), 3500);
}

function hideGlLoad() {
  document.getElementById('gl-load')?.classList.add('out');
  const hint = document.getElementById('room-hint');
  const span = hint?.querySelector('span');
  if (hint && span) {
    span.textContent = 'drag girar  ·  scroll zoom  ·  doble click volver';
    hint.classList.add('visible');
    setTimeout(() => hint.classList.remove('visible'), 4500);
  }
}

function orbitCamera(dTheta, dPhi) {
  const offset = new THREE.Vector3().subVectors(camPos, camTarget);
  const r = offset.length();
  if (r < 0.01) return;
  let theta = Math.atan2(offset.x, offset.z);
  let phi   = Math.acos(THREE.MathUtils.clamp(offset.y / r, -1, 1));
  theta -= dTheta;
  phi    = THREE.MathUtils.clamp(phi + dPhi, 0.15, Math.PI - 0.15);
  camPos.set(
    camTarget.x + r * Math.sin(phi) * Math.sin(theta),
    camTarget.y + r * Math.cos(phi),
    camTarget.z + r * Math.sin(phi) * Math.cos(theta)
  );
}

function createDust() {
  const count = 50;
  const pos   = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - .5) * 4.5;
    pos[i*3+1] = (Math.random() - .5) * 3.0;
    pos[i*3+2] = (Math.random() - .5) * 4.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color:0x64ffda, size:0.025, transparent:true, opacity:0.14, sizeAttenuation:true });
  dustPositions = pos;
  dust = new THREE.Points(geo, mat);
  scene.add(dust);
}

export function initScene() {
  const canvas = document.getElementById('gl');
  if (!canvas) return;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.0));
  renderer.shadowMap.enabled = false;
  const iw = canvas.offsetWidth  || window.innerWidth;
  const ih = canvas.offsetHeight || window.innerHeight;
  renderer.setSize(iw, ih);
  _canvasW = iw; _canvasH = ih;
  renderer.outputColorSpace    = THREE.SRGBColorSpace;
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.6;

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(50, iw / ih, 0.01, 200);
  camera.position.copy(camPos);
  camera.lookAt(camTarget);

  ambientLight = new THREE.AmbientLight(0xffffff, 3.5); scene.add(ambientLight);
  keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
  keyLight.position.set(5, 8, 6); scene.add(keyLight);
  accentLight = new THREE.PointLight(0x64ffda, 2.6, 22);
  accentLight.position.set(-2, 1, 4); scene.add(accentLight);
  const rimLight = new THREE.PointLight(0x64ffda, 1.4, 16);
  rimLight.position.set(3, -1, 3); scene.add(rimLight);

  window.addEventListener('resize', () => {
    const rw = canvas.offsetWidth, rh = canvas.offsetHeight;
    if (!rw || !rh) return;
    _canvasW = rw; _canvasH = rh;
    renderer.setSize(rw, rh);
    camera.aspect = rw / rh;
    camera.updateProjectionMatrix();
  });

  
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    scrollVel = THREE.MathUtils.clamp(scrollVel + e.deltaY * 0.003, -3, 3);
  }, { passive:false });

  
  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = true;
    dragX = e.clientX; dragY = e.clientY;
  });
  canvas.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - dragX, dy = e.clientY - dragY;
    dragX = e.clientX; dragY = e.clientY;
    orbitCamera(dx * 0.007, dy * 0.006);
  });
  canvas.addEventListener('mouseup',    () => { isDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });

  
  let tpx = 0, tpy = 0;
  canvas.addEventListener('touchstart', e => {
    tpx = e.touches[0].clientX; tpy = e.touches[0].clientY;
  }, { passive:true });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    orbitCamera(
      (e.touches[0].clientX - tpx) * 0.007,
      (e.touches[0].clientY - tpy) * 0.006
    );
    tpx = e.touches[0].clientX; tpy = e.touches[0].clientY;
  }, { passive:false });

  
  const pcRaycaster  = new THREE.Raycaster();
  const pcPtr        = new THREE.Vector2();
  let pcClickState   = 'idle';  
  let pcScreenPoint  = null;
  let lastHoverCheck = 0;

  
  canvas.addEventListener('mousemove', e => {
    if (!pcScreenMesh || isEntering) return;
    const now = performance.now();
    if (now - lastHoverCheck < 60) return;
    lastHoverCheck = now;
    const rect = canvas.getBoundingClientRect();
    pcPtr.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    pcPtr.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    pcRaycaster.setFromCamera(pcPtr, camera);
    const hits = pcRaycaster.intersectObjects(getModelMeshes(), false);
    canvas.style.cursor = (hits.length && hits[0].object === pcScreenMesh) ? 'pointer' : '';
  });

  canvas.addEventListener('click', e => {
    if (!model || !pcScreenMesh || document.body.dataset.dragging || isDragging || isEntering) return;
    const rect = canvas.getBoundingClientRect();
    pcPtr.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    pcPtr.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    pcRaycaster.setFromCamera(pcPtr, camera);

    
    const hits = pcRaycaster.intersectObjects(getModelMeshes(), false);
    if (!hits.length || hits[0].object !== pcScreenMesh) {
      pcClickState = 'idle';
      return;
    }

    const hit = hits[0].point;

    if (pcClickState === 'idle') {
      
      pcScreenPoint = hit.clone();
      const dir    = new THREE.Vector3().subVectors(camera.position, hit).normalize();
      const newPos = hit.clone().addScaledVector(dir, 1.7);
      camPos.copy(newPos);
      camTarget.copy(hit);
      pcClickState = 'zoomed';
      showHint('entering projects…');
      setTimeout(() => {
        if (pcClickState === 'zoomed' && !isEntering) {
          pcClickState = 'entering';
          _enterComputerAnimation();
        }
      }, 750);
    }
  });

  
  function _enterComputerAnimation() {
    isEntering = true;
    const sp      = pcScreenPoint || camTarget;
    const glCanvas = document.getElementById('gl');

    const towardCam = new THREE.Vector3().subVectors(camera.position, sp).normalize();
    const stopPos   = sp.clone().addScaledVector(towardCam, 0.55);

    if (typeof gsap !== 'undefined') {
      const fovProxy = { fov: camera.fov };
      gsap.to(fovProxy, {
        fov: 72, duration: .55, ease: 'power2.in',
        onUpdate() { camera.fov = fovProxy.fov; camera.updateProjectionMatrix(); }
      });
      gsap.to(camera.position, {
        x: stopPos.x, y: stopPos.y, z: stopPos.z,
        duration: .55, ease: 'power2.in',
        onUpdate() { camera.lookAt(sp); }
      });
      if (accentLight) {
        gsap.to(accentLight, { intensity: 14, duration: .35, ease: 'power3.in' });
      }
      if (glCanvas) {
        gsap.to(glCanvas, {
          filter: 'brightness(0) saturate(0)',
          duration: .45, delay: .1, ease: 'power2.in'
        });
      }
    }

    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('enter-computer', { detail: { point: sp } }));
    }, 600);
  }

  loadModel();
  renderLoop();
}

function loadModelFile(file, onDone) {
  if (location.protocol === 'file:') {
    const el = document.getElementById('gl-pct');
    if (el) el.textContent = 'Live Server requerido';
    return;
  }
  let fake = 0;
  const iv = setInterval(() => { fake = Math.min(fake + Math.random()*3, 85); setPct(fake); }, 120);

  new GLTFLoader().load(file,
    gltf => {
      clearInterval(iv); setPct(100);
      model = gltf.scene;
      const box  = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const ctr  = box.getCenter(new THREE.Vector3());
      const max  = Math.max(size.x, size.y, size.z);
      const ts   = 4.0;
      model.scale.setScalar(ts / max);
      model.position.set(-ctr.x*(ts/max), -ctr.y*(ts/max), -ctr.z*(ts/max));
      const z = size.z*(ts/max)*1.4 + 2;
      camPos.set(0, .5, z); camTarget.set(0, 0, 0);
      defaultCamPos.copy(camPos); defaultCamTarget.copy(camTarget);
      if (camera) { camera.position.copy(camPos); camera.lookAt(camTarget); }
      model.traverse(child => {
        if (!child.isMesh) return;
        const boost = m => { if (m?.emissiveIntensity !== undefined) m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.35); };
        Array.isArray(child.material) ? child.material.forEach(boost) : boost(child.material);
      });
      scene.add(model);
      pcScreenMesh = findPCScreen(model);
      createDust();
      _buildPcHotspot();
      setupHotspots(model);
      setTimeout(hideGlLoad, 500);
      setTimeout(() => showHint('click the PC monitor → projects'), 5500);

      onDone?.();
    },
    xhr => { if (xhr.total > 0) { clearInterval(iv); setPct((xhr.loaded/xhr.total)*100); } },
    err => { clearInterval(iv); console.error('[Scene]', err); onDone?.(); }
  );
}

function _buildPcHotspot() {
  const container = document.getElementById('hotspot-container');
  if (!container) return;
  container.innerHTML = '';
  hotspots.length = 0;
  if (!pcScreenMesh) return;

  const el = document.createElement('div');
  el.className = 'hs-pc';
  el.innerHTML = '<div class="hs-ring"></div><span class="hs-lbl">PROJECTS</span>';
  container.appendChild(el);

  el.addEventListener('click', () => {
    if (isEntering) return;
    isEntering = true;
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('enter-computer'));
    }, 80);
  });

  hotspots.push({ mesh: pcScreenMesh, el });
}

function loadModel() {
  loadModelFile(MODELS[0].file);
}


function renderLoop(now) {
  requestAnimationFrame(renderLoop);
  if (!renderer || _paused) return;
  _frameCount++;
  if (_frameCount === 1) _startTime = now;
  if (!_dprAdjusted && _frameCount === 60) {
    if (now - _startTime > 2000) renderer.setPixelRatio(1.0);
    _dprAdjusted = true;
  }
  const delta = _lastFrame ? Math.min((now - _lastFrame) / 1000, 0.05) : 0.01667;
  _lastFrame = now;
  clock += delta;
  const lf = t => 1 - Math.pow(1 - t, delta / 0.01667);
  const idle = (now - _lastInteract) > 3000;

  if (scrollVel !== 0) {
    const toTarget = new THREE.Vector3().subVectors(camTarget, camPos).normalize();
    camPos.addScaledVector(toTarget, scrollVel);
    scrollVel *= 0.86;
    if (Math.abs(scrollVel) < 0.001) scrollVel = 0;
    const dist = camPos.distanceTo(camTarget);
    if (dist < 1.3) camPos.addScaledVector(toTarget, -(1.3 - dist));
    else if (dist > 16) camPos.addScaledVector(toTarget, dist - 16);
  }

  if (spotlightMode && spotlight) {
    spotlight.position.set(mx * 4.5, -my * 2.5 + 4, 5.5);
    spotlight.target.position.set(mx * 1.8, -my * 1, 0);
    spotlight.target.updateMatrixWorld();
  }

  if (!idle) {
    if (model) {
      model.rotation.y += (mx * 0.07 - model.rotation.y) * lf(0.025);
      model.rotation.x += (my * 0.025 - model.rotation.x) * lf(0.025);
    }
    if (!isEntering) {
      _driftTarget.set(camPos.x + mx * 0.55, camPos.y - my * 0.28, camPos.z);
      camera.position.lerp(_driftTarget, lf(0.048));
      _lookTarget.set(camTarget.x + mx * 0.14, camTarget.y - my * 0.07, camTarget.z);
      camera.lookAt(_lookTarget);
    }
  }

  if (hotspots.length && renderer && _frameCount % 3 === 0) {
    const W = _canvasW;
    const H = _canvasH;
    hotspots.forEach(h => {
      if (h.mesh) h.mesh.getWorldPosition(_hotspotWorld);
      else _hotspotWorld.copy(h.worldPos);
      const p = _hotspotWorld.clone().project(camera);
      if (p.z > 1) { h.el.style.opacity = '0'; return; }
      const x = (p.x * .5 + .5) * W;
      const y = (-p.y * .5 + .5) * H;
      if (x < 0 || x > W || y < 0 || y > H) { h.el.style.opacity = '0'; return; }
      h.el.style.left = x + 'px';
      h.el.style.top  = (y + (h.yOffset !== undefined ? h.yOffset : 65)) + 'px';
      h.el.style.opacity = '';
    });
  }

  if (accentLight && _frameCount % 10 === 0) {
    const p = PRESETS[presetIdx];
    accentLight.intensity  = p.accent[1] * (0.85 + Math.sin(clock * 0.7) * 0.15);
    accentLight.position.x = -2 + Math.sin(clock * 0.35) * 0.4;
    accentLight.position.z =  4 + Math.cos(clock * 0.28) * 0.3;
  }

  if (dust && dustPositions && !idle && _frameCount % 2 === 0) {
    const pa = dust.geometry.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      pa.array[i*3+1] += Math.sin(clock * 0.5 + i * 1.3) * 0.0005;
      pa.array[i*3]   += Math.cos(clock * 0.4 + i * 1.1) * 0.0003;
    }
    pa.needsUpdate = true;
    dust.material.color.setHex(presetIdx === 0 ? 0x64ffda : PRESETS[presetIdx].accent[0]);
  }

  const frameBudget = idle ? _IDLE_MS : _ACTIVE_MS;
  if (now - _lastRender < frameBudget) return;
  _lastRender = now;
  renderer.render(scene, camera);
}

document.addEventListener('mousemove', e => {
  mx = (e.clientX / window.innerWidth  - .5) * 2;
  my = (e.clientY / window.innerHeight - .5) * 2;
  _lastInteract = performance.now();
});
document.addEventListener('wheel',      () => { _lastInteract = performance.now(); }, { passive: true });
document.addEventListener('touchstart', () => { _lastInteract = performance.now(); }, { passive: true });
