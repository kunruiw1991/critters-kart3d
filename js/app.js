/**
 * Critter Kart 3D: Rainbow Grand Prix! (Three.js 3D WebGL Engine)
 * 100% Zero-Text 3D Kart Racing, Gliding & Star Dash starring all 8 Smiling Critters!
 */

/* global THREE */

const CRITTERS = [
  {
    id: 'dogday',
    icon: 'icons/dogday.jpg',
    badge: '☀️',
    earStyle: 'dog',
    bodyColor: 0xff8f00,
    trimColor: 0xffe082,
    skyColor: 0x6ec6ff,
    fogColor: 0xb3e5fc,
    groundColor: 0x66bb6a,
    roadColor: 0x37474f,
    treeColor: 0x43a047,
    trackLength: 340
  },
  {
    id: 'catnap',
    icon: 'icons/catnap.jpg',
    badge: '🌙',
    earStyle: 'cat',
    bodyColor: 0x7e57c2,
    trimColor: 0xe1bee7,
    skyColor: 0x281847,
    fogColor: 0x4a2c7a,
    groundColor: 0x311b92,
    roadColor: 0x261c3d,
    treeColor: 0x9575cd,
    trackLength: 360
  },
  {
    id: 'craftycorn',
    icon: 'icons/craftycorn.jpg',
    badge: '🎨',
    earStyle: 'unicorn',
    bodyColor: 0x26c6da,
    trimColor: 0xffffff,
    skyColor: 0x80deea,
    fogColor: 0xe0f7fa,
    groundColor: 0xf48fb1,
    roadColor: 0x455a64,
    treeColor: 0xba68c8,
    trackLength: 380
  },
  {
    id: 'hoppy',
    icon: 'icons/hoppy.jpg',
    badge: '⚡',
    earStyle: 'bunny',
    bodyColor: 0x00c853,
    trimColor: 0xb9f6ca,
    skyColor: 0x4fc3f7,
    fogColor: 0xb3e5fc,
    groundColor: 0x2e7d32,
    roadColor: 0x334148,
    treeColor: 0x00e676,
    trackLength: 400
  },
  {
    id: 'pickypiggy',
    icon: 'icons/picky.jpg',
    badge: '🍎',
    earStyle: 'pig',
    bodyColor: 0xf06292,
    trimColor: 0xf8bbd0,
    skyColor: 0xffb2dd,
    fogColor: 0xfce4ec,
    groundColor: 0xff80ab,
    roadColor: 0x4a2c3d,
    treeColor: 0xff4081,
    trackLength: 420
  },
  {
    id: 'bubba',
    icon: 'icons/bubba.jpg',
    badge: '❄️',
    earStyle: 'elephant',
    bodyColor: 0x29b6f6,
    trimColor: 0xb3e5fc,
    skyColor: 0x90caf9,
    fogColor: 0xe3f2fd,
    groundColor: 0xe1f5fe,
    roadColor: 0x37474f,
    treeColor: 0x4dd0e1,
    trackLength: 440
  },
  {
    id: 'bobby',
    icon: 'icons/bobby.jpg',
    badge: '💖',
    earStyle: 'bear',
    bodyColor: 0xe53935,
    trimColor: 0xffcdd2,
    skyColor: 0xff8a80,
    fogColor: 0xffebee,
    groundColor: 0xc62828,
    roadColor: 0x3e2723,
    treeColor: 0xff5252,
    trackLength: 460
  },
  {
    id: 'kickinchicken',
    icon: 'icons/kickin.jpg',
    badge: '🔥',
    earStyle: 'chicken',
    bodyColor: 0xffca28,
    trimColor: 0xff6f00,
    skyColor: 0xffab40,
    fogColor: 0xfff3e0,
    groundColor: 0xe65100,
    roadColor: 0x2e241f,
    treeColor: 0xff9100,
    trackLength: 480
  }
];

const LANES = [-5.6, -2.8, 0, 2.8, 5.6];
const RAINBOW_HEX = [0xff5252, 0xffb300, 0xffd54f, 0x69f0ae, 0x29b6f6, 0xab47bc];

// Sound Synthesizer
let soundEnabled = true;
let audioCtx = null;

function ensureAudio() {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.14, gainVal = 0.13, slideTo = null) {
  const actx = ensureAudio();
  if (!actx) return;
  try {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, actx.currentTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, actx.currentTime + duration);
    }
    gain.gain.setValueAtTime(gainVal, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + duration);
  } catch (_) {}
}

function playSteerSfx() {
  playTone(340, 'sine', 0.09, 0.1, 480);
}

function playJumpSfx() {
  playTone(300, 'triangle', 0.22, 0.16, 760);
}

function playStarSfx() {
  [587.33, 880, 1174.66].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sine', 0.16, 0.15, f * 1.08), i * 50);
  });
}

function playTurboSfx() {
  [330, 440, 659.25, 880].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sawtooth', 0.16, 0.12, f * 1.2), i * 45);
  });
}

function playShellSfx() {
  playTone(480, 'square', 0.14, 0.13, 920);
}

function playWinFanfare() {
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
    setTimeout(() => playTone(f, 'triangle', 0.25, 0.18, f * 1.05), i * 85);
  });
}

// Progress Persistence
let currentWorld = 0;
let cupStars = new Array(CRITTERS.length).fill(0);
try {
  const saved = JSON.parse(localStorage.getItem('critters_kart3d_stars_v1') || 'null');
  if (Array.isArray(saved) && saved.length === CRITTERS.length) {
    cupStars = saved;
  }
} catch (_) {}

function saveProgress() {
  try {
    localStorage.setItem('critters_kart3d_stars_v1', JSON.stringify(cupStars));
  } catch (_) {}
}

// Initialize Three.js WebGL Renderer, Scene & Camera
const canvas = document.getElementById('webglCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.5, 260);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x446688, 0.95);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfff8e1, 1.15);
dirLight.position.set(24, 42, 28);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);

// Load Critter Portrait Textures
const textureLoader = new THREE.TextureLoader();
const critterTextures = {};
CRITTERS.forEach((c) => {
  const tex = textureLoader.load(c.icon);
  critterTextures[c.id] = tex;
});

// World Group Containers
const worldGroup = new THREE.Group();
scene.add(worldGroup);

const dynamicGroup = new THREE.Group();
scene.add(dynamicGroup);

// Build a 3D Sculpted Smiling Critter Kart
function createKartMesh(critterCfg, isPlayer = false) {
  const root = new THREE.Group();

  // Kart main aerodynamic chassis
  const bodyMat = new THREE.MeshStandardMaterial({
    color: critterCfg.bodyColor,
    roughness: 0.28,
    metalness: 0.15
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: critterCfg.trimColor,
    roughness: 0.22,
    metalness: 0.25
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x212121,
    roughness: 0.6
  });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.52, 2.75), bodyMat);
  chassis.position.y = 0.52;
  chassis.castShadow = true;
  root.add(chassis);

  // Sloped front nose hood
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.38, 1.05), trimMat);
  nose.position.set(0, 0.5, -1.55);
  nose.castShadow = true;
  root.add(nose);

  // Side racing pods
  [-0.98, 0.98].forEach((sx) => {
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.4, 1.85), trimMat);
    pod.position.set(sx, 0.46, -0.05);
    pod.castShadow = true;
    root.add(pod);
  });

  // Rear Spoiler Wing
  const wingStrutL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.18), darkMat);
  wingStrutL.position.set(-0.55, 0.95, 1.2);
  const wingStrutR = wingStrutL.clone();
  wingStrutR.position.x = 0.55;
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 0.48), trimMat);
  spoiler.position.set(0, 1.22, 1.25);
  root.add(wingStrutL, wingStrutR, spoiler);

  // Twin Chrome Exhaust Pipes + Turbo Flame Cones
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0xeceff1, metalness: 0.7, roughness: 0.2 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6d00 });
  const flames = [];
  [-0.45, 0.45].forEach((px) => {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.55, 12), pipeMat);
    pipe.rotation.x = Math.PI / 2.3;
    pipe.position.set(px, 0.68, 1.45);
    root.add(pipe);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.95, 10), flameMat);
    flame.rotation.x = Math.PI / 2;
    flame.position.set(px, 0.68, 2.05);
    flame.visible = false;
    root.add(flame);
    flames.push(flame);
  });

  // 4 Spinning Racing Wheels
  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.36, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.38, 12);
  hubGeo.rotateZ(Math.PI / 2);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.5, roughness: 0.3 });

  [
    [-1.06, 0.42, -1.05],
    [1.06, 0.42, -1.05],
    [-1.06, 0.42, 0.95],
    [1.06, 0.42, 0.95]
  ].forEach(([wx, wy, wz]) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, wy, wz);
    const tire = new THREE.Mesh(wheelGeo, darkMat);
    const hub = new THREE.Mesh(hubGeo, hubMat);
    wGroup.add(tire, hub);
    root.add(wGroup);
    wheels.push(wGroup);
  });

  // Sculpted 3D Smiling Critter Driver Head + Ears + Portrait Emblem
  const driverGroup = new THREE.Group();
  driverGroup.position.set(0, 1.28, -0.05);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 20), bodyMat);
  headMesh.castShadow = true;
  driverGroup.add(headMesh);

  // Sculpted 3D Ears based on Critter species
  if (critterCfg.earStyle === 'dog') {
    [-0.56, 0.56].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.58, 0.32), trimMat);
      ear.position.set(ex, 0.08, 0);
      ear.rotation.z = ex < 0 ? 0.25 : -0.25;
      driverGroup.add(ear);
    });
  } else if (critterCfg.earStyle === 'cat') {
    [-0.4, 0.4].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.48, 12), bodyMat);
      ear.position.set(ex, 0.62, 0);
      ear.rotation.z = ex < 0 ? 0.22 : -0.22;
      driverGroup.add(ear);
    });
  } else if (critterCfg.earStyle === 'unicorn') {
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.65, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.4, roughness: 0.2 })
    );
    horn.position.set(0, 0.78, -0.15);
    driverGroup.add(horn);
  } else if (critterCfg.earStyle === 'bunny') {
    [-0.28, 0.28].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.75, 12), bodyMat);
      ear.position.set(ex, 0.78, 0);
      driverGroup.add(ear);
    });
  } else if (critterCfg.earStyle === 'elephant') {
    [-0.65, 0.65].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 14), trimMat);
      ear.scale.set(0.45, 1.0, 0.9);
      ear.position.set(ex, 0.12, 0);
      driverGroup.add(ear);
    });
  } else if (critterCfg.earStyle === 'chicken') {
    const crest = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.42, 0.48),
      new THREE.MeshStandardMaterial({ color: 0xff5252 })
    );
    crest.position.set(0, 0.68, 0);
    driverGroup.add(crest);
  } else {
    [-0.45, 0.45].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), bodyMat);
      ear.position.set(ex, 0.52, 0);
      driverGroup.add(ear);
    });
  }

  // Circular Portrait Medallion on Back of Driver Helmet & Front Hood
  const tex = critterTextures[critterCfg.id];
  const badgeMat = new THREE.MeshBasicMaterial({ map: tex });
  const backBadge = new THREE.Mesh(new THREE.CircleGeometry(0.46, 24), badgeMat);
  backBadge.position.set(0, 0.08, 0.63);
  driverGroup.add(backBadge);

  const hoodBadge = new THREE.Mesh(new THREE.CircleGeometry(0.48, 24), badgeMat);
  hoodBadge.rotation.x = -Math.PI / 2.2;
  hoodBadge.rotation.z = Math.PI;
  hoodBadge.position.set(0, 0.72, -1.52);
  root.add(hoodBadge);

  root.add(driverGroup);

  // Deployable 3D Rainbow Glider Wings (for Jump / Glider Mode)
  const gliderWings = new THREE.Group();
  gliderWings.position.set(0, 0.88, 0.1);
  [-1, 1].forEach((side) => {
    RAINBOW_HEX.slice(0, 4).forEach((col, idx) => {
      const feather = new THREE.Mesh(
        new THREE.BoxGeometry(1.15 - idx * 0.18, 0.07, 0.34),
        new THREE.MeshBasicMaterial({ color: col })
      );
      feather.position.set(side * (1.25 + idx * 0.22), idx * 0.04, idx * 0.18);
      feather.rotation.z = side * -0.12;
      gliderWings.add(feather);
    });
  });
  gliderWings.scale.set(0.001, 1, 1);
  gliderWings.visible = false;
  root.add(gliderWings);

  // 3D Star Magnet Aura Ring
  let magnetRing = null;
  if (isPlayer) {
    magnetRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.09, 12, 36),
      new THREE.MeshBasicMaterial({ color: 0xe040fb })
    );
    magnetRing.rotation.x = Math.PI / 2;
    magnetRing.position.y = 0.65;
    magnetRing.visible = false;
    root.add(magnetRing);
  }

  return {
    root,
    wheels,
    flames,
    driverGroup,
    gliderWings,
    magnetRing
  };
}

// Player & Track State
let playerKart = null;
let playerState = {
  laneIndex: 2,
  x: 0,
  y: 0,
  vy: 0,
  z: 0,
  speed: 24,
  roll: 0,
  spinAngle: 0,
  gliding: false,
  turboTimer: 0,
  magnetTimer: 0,
  hitCooldown: 0
};

let rivals = [];
let trackStars = [];
let mysteryBoxes = [];
let boostPads = [];
let obstacles = [];
let activeShells = [];
let particles3D = [];

let checkpointStarsEarned = [false, false, false];
let raceFinished = false;
let podiumOrbitAngle = 0;
let steerGuideShown = true;

function showRaceToast(emojiText) {
  const el = document.getElementById('raceToast');
  if (!el) return;
  el.textContent = emojiText;
  el.classList.remove('hidden');
  clearTimeout(showRaceToast._t);
  showRaceToast._t = setTimeout(() => el.classList.add('hidden'), 1250);
}

function hideSteerGuide() {
  if (!steerGuideShown) return;
  steerGuideShown = false;
  const g = document.getElementById('steerGuide');
  if (g) g.classList.add('hidden');
}

function clearGroup(group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
  }
}

// Build Complete 3D World & Race Track for Selected Smiling Critter
function buildRaceWorld(worldIdx) {
  currentWorld = worldIdx;
  const cfg = CRITTERS[worldIdx];

  clearGroup(worldGroup);
  clearGroup(dynamicGroup);

  rivals = [];
  trackStars = [];
  mysteryBoxes = [];
  boostPads = [];
  obstacles = [];
  activeShells = [];
  particles3D = [];

  checkpointStarsEarned = [false, false, false];
  raceFinished = false;
  podiumOrbitAngle = 0;

  scene.background = new THREE.Color(cfg.skyColor);
  scene.fog = new THREE.FogExp2(cfg.fogColor, 0.0075);

  const trackLen = cfg.trackLength;

  // Wide Ground Plane
  const groundMat = new THREE.MeshStandardMaterial({ color: cfg.groundColor, roughness: 0.85 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, trackLen + 220), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.05, -trackLen / 2 + 20);
  ground.receiveShadow = true;
  worldGroup.add(ground);

  // 5-Lane Highway Road Surface
  const roadW = 16.2;
  const roadMat = new THREE.MeshStandardMaterial({ color: cfg.roadColor, roughness: 0.55 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(roadW, trackLen + 140), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, -trackLen / 2 + 20);
  road.receiveShadow = true;
  worldGroup.add(road);

  // Rainbow Curbs & Glowing Lane Dividers
  const segLen = 6;
  const totalSegs = Math.floor((trackLen + 60) / segLen);
  const curbGeo = new THREE.BoxGeometry(0.65, 0.28, segLen * 0.92);
  const stripeGeo = new THREE.PlaneGeometry(0.18, segLen * 0.55);
  stripeGeo.rotateX(-Math.PI / 2);
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });

  for (let i = 0; i < totalSegs; i++) {
    const sz = 20 - i * segLen;
    const curbMat = new THREE.MeshBasicMaterial({
      color: RAINBOW_HEX[i % RAINBOW_HEX.length]
    });

    const curbL = new THREE.Mesh(curbGeo, curbMat);
    curbL.position.set(-roadW / 2 - 0.3, 0.14, sz);
    const curbR = new THREE.Mesh(curbGeo, curbMat);
    curbR.position.set(roadW / 2 + 0.3, 0.14, sz);
    worldGroup.add(curbL, curbR);

    // 4 interior lane divider stripes
    if (i % 2 === 0) {
      [-4.2, -1.4, 1.4, 4.2].forEach((lx) => {
        const st = new THREE.Mesh(stripeGeo, stripeMat);
        st.position.set(lx, 0.03, sz);
        worldGroup.add(st);
      });
    }
  }

  // Roadside 3D Stylized Trees, Crystals & Fluffy 3D Clouds
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.8 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: cfg.treeColor, roughness: 0.45 });
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });

  for (let z = 10; z > -trackLen - 40; z -= 18) {
    [-1, 1].forEach((side) => {
      const tx = side * (12.5 + (Math.abs(z) % 7));
      const tree = new THREE.Group();
      tree.position.set(tx, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.2, 8), trunkMat);
      trunk.position.y = 1.1;
      const crown1 = new THREE.Mesh(new THREE.ConeGeometry(2.1, 3.4, 9), foliageMat);
      crown1.position.y = 3.2;
      const crown2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.6, 9), foliageMat);
      crown2.position.y = 4.8;
      tree.add(trunk, crown1, crown2);
      worldGroup.add(tree);
    });

    // Overhead 3D Fluffy Clouds
    if (Math.abs(z) % 36 === 0) {
      const cloud = new THREE.Group();
      const side = (Math.abs(z) / 36) % 2 === 0 ? -1 : 1;
      cloud.position.set(side * 18, 16 + (Math.abs(z) % 5), z);
      [
        [0, 0, 2.6],
        [-2.2, -0.4, 1.9],
        [2.2, -0.4, 1.9]
      ].forEach(([cx, cy, cr]) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(cr, 12, 12), cloudMat);
        puff.position.set(cx, cy, 0);
        cloud.add(puff);
      });
      worldGroup.add(cloud);
    }
  }

  // 3 Giant Checkpoint Star Gates at 28%, 58%, 84% of the Track
  const checkpointRatios = [0.28, 0.58, 0.84];
  checkpointRatios.forEach((ratio, idx) => {
    const cpZ = -trackLen * ratio;
    const archGroup = createRainbowArchMesh(roadW);
    archGroup.position.set(0, 0, cpZ);
    worldGroup.add(archGroup);

    // Giant Checkpoint Star in center or lane
    const starLaneX = LANES[(idx * 2 + 1) % LANES.length];
    const starMesh = createStar3DMesh(1.15);
    starMesh.position.set(starLaneX, 1.35, cpZ);
    dynamicGroup.add(starMesh);
    trackStars.push({
      mesh: starMesh,
      x: starLaneX,
      y: 1.35,
      z: cpZ,
      collected: false,
      checkpointIdx: idx
    });
  });

  // Grand 3D Checkered Finish Line Arch at z = -trackLen
  const finishArch = createFinishLineArchMesh(roadW);
  finishArch.position.set(0, 0, -trackLen);
  worldGroup.add(finishArch);

  // Populate Track with Regular 3D Stars, Mystery Item Cubes, Rainbow Boost Ramps & Obstacles
  const starGeo = new THREE.OctahedronGeometry(0.65, 0);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    emissive: 0xff8f00,
    emissiveIntensity: 0.4,
    metalness: 0.4,
    roughness: 0.2
  });

  for (let z = -22; z > -trackLen + 24; z -= 14) {
    // Skip right on top of checkpoint arches
    const nearCp = checkpointRatios.some((r) => Math.abs(z - -trackLen * r) < 6);
    if (nearCp) continue;

    const stepIdx = Math.floor(Math.abs(z) / 14);

    // Line of 3 spinning 3D Gold Stars
    const starLane = LANES[(stepIdx + worldIdx) % LANES.length];
    const isSkyStar = stepIdx % 4 === 2;
    const starY = isSkyStar ? 3.2 : 1.05;
    const sMesh = new THREE.Mesh(starGeo, starMat);
    sMesh.position.set(starLane, starY, z);
    dynamicGroup.add(sMesh);
    trackStars.push({
      mesh: sMesh,
      x: starLane,
      y: starY,
      z,
      collected: false,
      checkpointIdx: -1
    });

    // 3D Rainbow Boost Ramp right before sky stars!
    if (isSkyStar) {
      const padGroup = new THREE.Group();
      padGroup.position.set(starLane, 0.08, z + 6.5);
      const rampMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.22, 3.2),
        new THREE.MeshBasicMaterial({ color: 0x00e676 })
      );
      rampMesh.rotation.x = 0.14;
      padGroup.add(rampMesh);
      dynamicGroup.add(padGroup);
      boostPads.push({ mesh: padGroup, x: starLane, z: z + 6.5, triggered: false });
    }

    // 3D Translucent Rainbow Mystery Item Box
    if (stepIdx % 3 === 1) {
      const boxLane = LANES[(stepIdx * 2 + 2) % LANES.length];
      const boxGroup = new THREE.Group();
      boxGroup.position.set(boxLane, 1.25, z);
      const outerCube = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 1.15, 1.15),
        new THREE.MeshStandardMaterial({
          color: RAINBOW_HEX[stepIdx % RAINBOW_HEX.length],
          transparent: true,
          opacity: 0.78,
          roughness: 0.15
        })
      );
      const innerCore = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.42, 0),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      boxGroup.add(outerCube, innerCore);
      dynamicGroup.add(boxGroup);
      mysteryBoxes.push({ mesh: boxGroup, x: boxLane, z, active: true });
    }

    // 3D Obstacle Crates / Barrels (placed on 1 or 2 lanes, leaving 3+ lanes open)
    if (stepIdx % 2 === 0) {
      const obsLane = LANES[(stepIdx * 3 + worldIdx) % LANES.length];
      if (Math.abs(obsLane - starLane) > 0.5) {
        const obsMesh = createObstacle3DMesh(stepIdx);
        obsMesh.position.set(obsLane, 0.65, z);
        dynamicGroup.add(obsMesh);
        obstacles.push({
          mesh: obsMesh,
          x: obsLane,
          y: 0.65,
          z,
          hit: false,
          vx: 0,
          vy: 0,
          vz: 0
        });
      }
    }
  }

  // Create Player 3D Smiling Critter Kart
  playerKart = createKartMesh(cfg, true);
  playerState.laneIndex = 2;
  playerState.x = LANES[2];
  playerState.y = 0;
  playerState.vy = 0;
  playerState.z = 0;
  playerState.speed = 24;
  playerState.roll = 0;
  playerState.spinAngle = 0;
  playerState.gliding = false;
  playerState.turboTimer = 0;
  playerState.magnetTimer = 0;
  playerState.hitCooldown = 0;
  playerKart.root.position.set(0, 0, 0);
  dynamicGroup.add(playerKart.root);

  // Create 2 Friendly Rival 3D Smiling Critter Karts
  [1, 2].forEach((offset, idx) => {
    const rCfg = CRITTERS[(worldIdx + offset) % CRITTERS.length];
    const rKart = createKartMesh(rCfg, false);
    const startLane = idx === 0 ? 1 : 3;
    const startZ = -6 - idx * 5;
    rKart.root.position.set(LANES[startLane], 0, startZ);
    dynamicGroup.add(rKart.root);
    rivals.push({
      cfg: rCfg,
      kart: rKart,
      laneIndex: startLane,
      x: LANES[startLane],
      z: startZ,
      baseSpeed: 21.5 + idx * 0.9,
      spinTimer: 0,
      laneSwitchTimer: 1.8 + idx
    });
  });

  renderWorldSelector();
  updateHudDom();
}

function createRainbowArchMesh(roadW) {
  const g = new THREE.Group();
  const pillarGeo = new THREE.CylinderGeometry(0.45, 0.55, 7.5, 12);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.3, roughness: 0.3 });
  [-roadW / 2 - 0.5, roadW / 2 + 0.5].forEach((px) => {
    const p = new THREE.Mesh(pillarGeo, pillarMat);
    p.position.set(px, 3.75, 0);
    g.add(p);
  });
  const crossbar = new THREE.Mesh(
    new THREE.BoxGeometry(roadW + 2.2, 0.9, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x29b6f6 })
  );
  crossbar.position.set(0, 7.5, 0);
  g.add(crossbar);
  return g;
}

function createFinishLineArchMesh(roadW) {
  const g = createRainbowArchMesh(roadW);
  // Add checkered banner blocks across top
  const count = 12;
  const blockW = (roadW + 1.0) / count;
  for (let i = 0; i < count; i++) {
    for (let row = 0; row < 2; row++) {
      const isWhite = (i + row) % 2 === 0;
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(blockW, 0.65, 0.95),
        new THREE.MeshBasicMaterial({ color: isWhite ? 0xffffff : 0x212121 })
      );
      b.position.set(-roadW / 2 - 0.5 + blockW * (i + 0.5), 6.5 + row * 0.65, 0);
      g.add(b);
    }
  }
  return g;
}

function createStar3DMesh(scale = 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    emissive: 0xffa000,
    emissiveIntensity: 0.5,
    metalness: 0.5,
    roughness: 0.15
  });
  const c1 = new THREE.Mesh(new THREE.OctahedronGeometry(0.85 * scale, 0), mat);
  const c2 = c1.clone();
  c2.rotation.y = Math.PI / 4;
  c2.rotation.z = Math.PI / 4;
  g.add(c1, c2);
  return g;
}

function createObstacle3DMesh(stepIdx) {
  const g = new THREE.Group();
  const isBarrel = stepIdx % 4 === 0;
  if (isBarrel) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.62, 1.25, 14),
      new THREE.MeshStandardMaterial({ color: 0xd84315, roughness: 0.5 })
    );
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.25, 14),
      new THREE.MeshStandardMaterial({ color: 0xffd54f })
    );
    g.add(barrel, band);
  } else {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 1.25, 1.25),
      new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.45 })
    );
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.28, 1.3),
      new THREE.MeshStandardMaterial({ color: 0xffe082 })
    );
    g.add(crate, trim);
  }
  return g;
}

function spawn3DBurst(x, y, z, hexColor, count = 14) {
  const geo = new THREE.SphereGeometry(0.18, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: hexColor });
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    const ang = Math.random() * Math.PI * 2;
    const spd = 4 + Math.random() * 8;
    dynamicGroup.add(m);
    particles3D.push({
      mesh: m,
      vx: Math.cos(ang) * spd,
      vy: 3 + Math.random() * 7,
      vz: Math.sin(ang) * spd,
      life: 0.75
    });
  }
}

// Player Actions & Power-Ups
function steerLane(delta) {
  ensureAudio();
  hideSteerGuide();
  const next = Math.max(0, Math.min(LANES.length - 1, playerState.laneIndex + delta));
  if (next !== playerState.laneIndex) {
    playerState.laneIndex = next;
    playerState.roll = -delta * 0.28;
    playSteerSfx();
  }
}

function triggerJumpGlide() {
  ensureAudio();
  hideSteerGuide();
  if (playerState.y <= 0.15) {
    playerState.vy = 11.5;
    playerState.gliding = true;
    playJumpSfx();
    showRaceToast('🪽🌈✨');
  } else {
    playerState.gliding = true;
    playerState.vy = Math.max(playerState.vy, 3.5);
  }
}

function triggerTurboBoost() {
  ensureAudio();
  hideSteerGuide();
  playerState.turboTimer = 5.5;
  playTurboSfx();
  showRaceToast('🍄🔥✨');
  updateBoostPedalVisuals();
}

function triggerRainbowShell() {
  ensureAudio();
  hideSteerGuide();
  playShellSfx();
  showRaceToast('🐢🌟✨');

  const shellGroup = new THREE.Group();
  shellGroup.position.set(playerState.x, 0.7, playerState.z - 2.2);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x00e676, roughness: 0.2, metalness: 0.3 })
  );
  dome.scale.y = 0.72;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.66, 0.12, 10, 20),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  ring.rotation.x = Math.PI / 2;
  shellGroup.add(dome, ring);
  dynamicGroup.add(shellGroup);

  activeShells.push({
    mesh: shellGroup,
    x: playerState.x,
    z: playerState.z - 2.2,
    vz: -(playerState.speed + 28),
    life: 3.5
  });
}

function triggerStarMagnet() {
  ensureAudio();
  hideSteerGuide();
  playerState.magnetTimer = 7.0;
  playStarSfx();
  showRaceToast('🧲⭐✨');
  updateBoostPedalVisuals();
}

function updateBoostPedalVisuals() {
  document.getElementById('btnItemTurbo').classList.toggle('active-boost', playerState.turboTimer > 0);
  document.getElementById('btnItemMagnet').classList.toggle('active-boost', playerState.magnetTimer > 0);
  document.getElementById('btnJumpGlide').classList.toggle('active-boost', playerState.gliding);
}

// UI Rendering (100% Zero-Text)
function renderWorldSelector() {
  const rail = document.getElementById('worldSelectorRail');
  if (!rail) return;
  rail.innerHTML = '';
  CRITTERS.forEach((c, idx) => {
    const btn = document.createElement('button');
    btn.className = 'world-pill' + (idx === currentWorld ? ' active' : '');
    const stars = cupStars[idx] || 0;
    const starBadge = stars > 0 ? '⭐'.repeat(stars) : c.badge;
    btn.innerHTML = `
      <img src="${c.icon}" alt="" />
      <span class="world-pill-stars">${starBadge}</span>
    `;
    btn.addEventListener('click', () => {
      ensureAudio();
      document.getElementById('winModal').classList.add('hidden');
      buildRaceWorld(idx);
    });
    rail.appendChild(btn);
  });
}

function updateHudDom() {
  const cfg = CRITTERS[currentWorld];
  document.getElementById('hudDriverImg').src = cfg.icon;
  document.getElementById('hudCupEmoji').textContent = cfg.badge;
  document.getElementById('playerMarkerImg').src = cfg.icon;

  rivals.forEach((r, idx) => {
    const imgEl = document.getElementById(`rivalMarkerImg${idx}`);
    if (imgEl) imgEl.src = r.cfg.icon;
  });

  for (let i = 0; i < 3; i++) {
    const earned = checkpointStarsEarned[i];
    document.getElementById(`hudStar${i}`).classList.toggle('earned', earned);
    document.getElementById(`cpStar${i}`).classList.toggle('collected', earned);
  }
}

function finishRace() {
  if (raceFinished) return;
  raceFinished = true;
  // Ensure all 3 stars are awarded on crossing the finish arch
  checkpointStarsEarned = [true, true, true];
  cupStars[currentWorld] = 3;
  saveProgress();
  updateHudDom();
  renderWorldSelector();
  playWinFanfare();

  // Launch celebratory 3D rainbow fireworks around the finish arch
  for (let i = 0; i < 5; i++) {
    const col = RAINBOW_HEX[i % RAINBOW_HEX.length];
    spawn3DBurst(
      playerState.x + (i - 2) * 2.2,
      3.2 + (i % 2) * 1.5,
      playerState.z - 4,
      col,
      18
    );
  }

  setTimeout(() => {
    const cfg = CRITTERS[currentWorld];
    document.getElementById('winDriverImg').src = cfg.icon;
    document.getElementById('winCupBadge').textContent = cfg.badge;
    document.getElementById('winModal').classList.remove('hidden');
  }, 1150);
}

// Main 3D Simulation Step
function updateGame3D(dt, timeSec) {
  const cfg = CRITTERS[currentWorld];
  const trackLen = cfg.trackLength;

  // Update 3D particles
  for (let i = particles3D.length - 1; i >= 0; i--) {
    const p = particles3D[i];
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    p.vy -= 14 * dt;
    p.life -= dt;
    if (p.life <= 0) {
      dynamicGroup.remove(p.mesh);
      particles3D.splice(i, 1);
    }
  }

  if (raceFinished) {
    // 3D Orbiting Podium Camera around victorious Smiling Critter Kart!
    podiumOrbitAngle += dt * 1.35;
    const camRadius = 7.5;
    camera.position.set(
      playerState.x + Math.sin(podiumOrbitAngle) * camRadius,
      3.8,
      playerState.z + Math.cos(podiumOrbitAngle) * camRadius
    );
    camera.lookAt(playerState.x, 1.2, playerState.z);
    playerKart.driverGroup.rotation.y = Math.sin(timeSec * 5) * 0.35;
    return;
  }

  // Power-Up Timers
  if (playerState.turboTimer > 0) {
    playerState.turboTimer = Math.max(0, playerState.turboTimer - dt);
    if (playerState.turboTimer === 0) updateBoostPedalVisuals();
  }
  if (playerState.magnetTimer > 0) {
    playerState.magnetTimer = Math.max(0, playerState.magnetTimer - dt);
    if (playerState.magnetTimer === 0) updateBoostPedalVisuals();
  }
  if (playerState.hitCooldown > 0) {
    playerState.hitCooldown = Math.max(0, playerState.hitCooldown - dt);
  }

  // Compute Forward Kart Speed
  const targetSpeed = playerState.turboTimer > 0 ? 37 : playerState.hitCooldown > 0 ? 15 : 24.5;
  playerState.speed += (targetSpeed - playerState.speed) * Math.min(1, dt * 6);
  playerState.z -= playerState.speed * dt;

  // Smooth Horizontal Lane Drift & Banking Roll
  const targetX = LANES[playerState.laneIndex];
  const dx = targetX - playerState.x;
  playerState.x += dx * Math.min(1, dt * 10);
  playerState.roll += (dx * -0.11 - playerState.roll) * Math.min(1, dt * 10);

  // Vertical Jump & 3D Glider Wing Physics
  if (playerState.y > 0 || playerState.vy !== 0) {
    const gravity = playerState.gliding && playerState.vy < 0 ? 7.2 : 24.0;
    playerState.vy -= gravity * dt;
    playerState.y += playerState.vy * dt;
    if (playerState.y <= 0) {
      playerState.y = 0;
      playerState.vy = 0;
      if (playerState.gliding) {
        playerState.gliding = false;
        updateBoostPedalVisuals();
      }
    }
  }

  // Spin recovery animation when bumping an obstacle
  if (playerState.spinAngle > 0) {
    playerState.spinAngle = Math.max(0, playerState.spinAngle - dt * Math.PI * 3.8);
  }

  // Update Player Kart 3D Transform, Wheels, Glider Wings & Turbo Flames
  playerKart.root.position.set(playerState.x, playerState.y, playerState.z);
  playerKart.root.rotation.z = playerState.roll;
  playerKart.root.rotation.y = dx * -0.08 + playerState.spinAngle;
  playerKart.root.rotation.x = playerState.y > 0.1 ? Math.min(0.22, playerState.vy * 0.02) : 0;

  playerKart.wheels.forEach((w) => {
    w.rotation.x -= playerState.speed * dt * 1.4;
  });

  playerKart.flames.forEach((f) => {
    f.visible = playerState.turboTimer > 0;
    if (f.visible) {
      f.scale.setScalar(0.85 + Math.sin(timeSec * 28) * 0.25);
    }
  });

  if (playerKart.magnetRing) {
    playerKart.magnetRing.visible = playerState.magnetTimer > 0;
    playerKart.magnetRing.rotation.z += dt * 4;
  }

  if (playerState.gliding) {
    playerKart.gliderWings.visible = true;
    const ws = Math.min(1, playerKart.gliderWings.scale.x + dt * 6);
    playerKart.gliderWings.scale.set(ws, 1, 1);
  } else {
    playerKart.gliderWings.visible = false;
    playerKart.gliderWings.scale.set(0.01, 1, 1);
  }

  // Update 2 Friendly Rival 3D Karts
  rivals.forEach((r) => {
    r.z -= r.baseSpeed * dt;
    // Keep rivals within reasonablerubber-band range so race feels lively
    if (r.z < playerState.z - 26) {
      r.z = playerState.z - 26;
    } else if (r.z > playerState.z + 18) {
      r.z = playerState.z + 18;
    }

    r.laneSwitchTimer -= dt;
    if (r.laneSwitchTimer <= 0) {
      r.laneSwitchTimer = 2.0 + Math.random() * 1.8;
      const step = Math.random() < 0.5 ? -1 : 1;
      r.laneIndex = Math.max(0, Math.min(LANES.length - 1, r.laneIndex + step));
    }
    r.x += (LANES[r.laneIndex] - r.x) * Math.min(1, dt * 6);

    if (r.spinTimer > 0) {
      r.spinTimer = Math.max(0, r.spinTimer - dt);
    }

    r.kart.root.position.set(r.x, 0, r.z);
    r.kart.root.rotation.y = r.spinTimer > 0 ? r.spinTimer * Math.PI * 4 : 0;
    r.kart.wheels.forEach((w) => {
      w.rotation.x -= r.baseSpeed * dt * 1.3;
    });
  });

  // Update Homing Rainbow Shells
  for (let i = activeShells.length - 1; i >= 0; i--) {
    const sh = activeShells[i];
    sh.z += sh.vz * dt;
    sh.life -= dt;
    sh.mesh.position.set(sh.x, 0.7, sh.z);
    sh.mesh.rotation.y += dt * 10;

    // Hit obstacle ahead
    for (const obs of obstacles) {
      if (obs.hit) continue;
      if (Math.abs(obs.z - sh.z) < 4.5 && Math.abs(obs.x - sh.x) < 3.6) {
        obs.hit = true;
        obs.vy = 12;
        obs.vx = (Math.random() - 0.5) * 10;
        obs.vz = -18;
        spawn3DBurst(obs.x, 1.0, obs.z, 0x00e676, 12);
        playTone(520, 'triangle', 0.12, 0.14, 880);
      }
    }

    // Spin rival kart if close
    rivals.forEach((r) => {
      if (Math.abs(r.z - sh.z) < 2.5 && Math.abs(r.x - sh.x) < 2.2 && r.spinTimer <= 0) {
        r.spinTimer = 1.0;
        r.z += 4;
        spawn3DBurst(r.x, 1.2, r.z, 0xffd54f, 10);
      }
    });

    if (sh.life <= 0) {
      dynamicGroup.remove(sh.mesh);
      activeShells.splice(i, 1);
    }
  }

  // Update 3D Spinning Stars & Checkpoint Stars
  trackStars.forEach((st) => {
    if (st.collected) return;
    st.mesh.rotation.y += dt * 3.0;

    // Pull stars into kart when Magnet is active or when passing Checkpoint Star Arch
    const distZ = Math.abs(st.z - playerState.z);
    const pullRadius =
      playerState.magnetTimer > 0 ? 18 : st.checkpointIdx >= 0 ? 9.5 : 2.3;

    if (distZ < pullRadius && Math.abs(st.x - playerState.x) < pullRadius) {
      st.x += (playerState.x - st.x) * Math.min(1, dt * 11);
      st.y += (playerState.y + 1.0 - st.y) * Math.min(1, dt * 11);
      st.z += (playerState.z - st.z) * Math.min(1, dt * 11);
      st.mesh.position.set(st.x, st.y, st.z);
    }

    if (
      Math.abs(st.z - playerState.z) < 2.3 &&
      Math.abs(st.x - playerState.x) < 2.3 &&
      Math.abs(st.y - (playerState.y + 1.0)) < 2.4
    ) {
      st.collected = true;
      st.mesh.visible = false;
      playStarSfx();
      spawn3DBurst(playerState.x, playerState.y + 1.2, playerState.z, 0xffd54f, 10);
      if (st.checkpointIdx >= 0) {
        checkpointStarsEarned[st.checkpointIdx] = true;
        updateHudDom();
        showRaceToast('⭐🏆✨');
      }
    }
  });

  // Update 3D Mystery Item Boxes
  mysteryBoxes.forEach((mb) => {
    if (!mb.active) return;
    mb.mesh.rotation.x += dt * 1.8;
    mb.mesh.rotation.y += dt * 2.4;
    if (Math.abs(mb.z - playerState.z) < 2.2 && Math.abs(mb.x - playerState.x) < 2.1) {
      mb.active = false;
      mb.mesh.visible = false;
      spawn3DBurst(mb.x, 1.3, mb.z, 0xe040fb, 14);
      const roll = Math.floor(Math.random() * 3);
      if (roll === 0) triggerTurboBoost();
      else if (roll === 1) triggerStarMagnet();
      else triggerRainbowShell();
    }
  });

  // Update 3D Rainbow Boost Ramps
  boostPads.forEach((bp) => {
    if (
      !bp.triggered &&
      Math.abs(bp.z - playerState.z) < 2.3 &&
      Math.abs(bp.x - playerState.x) < 1.9
    ) {
      bp.triggered = true;
      playerState.turboTimer = Math.max(playerState.turboTimer, 2.8);
      triggerJumpGlide();
    }
  });

  // Update 3D Obstacles
  obstacles.forEach((obs) => {
    if (obs.hit) {
      obs.mesh.position.x += obs.vx * dt;
      obs.mesh.position.y += obs.vy * dt;
      obs.mesh.position.z += obs.vz * dt;
      obs.mesh.rotation.x += dt * 8;
      obs.mesh.rotation.z += dt * 6;
      obs.vy -= 20 * dt;
      return;
    }

    if (
      Math.abs(obs.z - playerState.z) < 1.85 &&
      Math.abs(obs.x - playerState.x) < 1.55 &&
      playerState.y < 1.25
    ) {
      obs.hit = true;
      obs.vy = 11;
      obs.vx = (obs.x >= playerState.x ? 1 : -1) * 8;
      obs.vz = -16;

      if (playerState.turboTimer > 0) {
        // Smash right through during Turbo!
        spawn3DBurst(obs.x, 1.0, obs.z, 0xff6d00, 14);
        playTone(480, 'triangle', 0.1, 0.14, 760);
      } else {
        // Forgiving spin-hop without losing race progress
        playerState.hitCooldown = 0.55;
        playerState.spinAngle = Math.PI * 2;
        spawn3DBurst(obs.x, 1.0, obs.z, 0xff8a80, 10);
        playTone(220, 'sine', 0.16, 0.14, 150);
      }
    }
  });

  // Update 3D Chase Camera behind Player Kart
  const targetFov = playerState.turboTimer > 0 ? 68 : 58;
  camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 6);
  camera.updateProjectionMatrix();

  const camX = playerState.x * 0.58;
  const camY = 4.35 + playerState.y * 0.45;
  const camZ = playerState.z + 8.6;
  camera.position.set(camX, camY, camZ);
  camera.lookAt(playerState.x * 0.75, 1.15 + playerState.y * 0.3, playerState.z - 12);

  // Move directional light with player so shadows stay crisp
  dirLight.position.set(playerState.x + 20, 40, playerState.z + 25);
  dirLight.target.position.set(playerState.x, 0, playerState.z - 10);
  dirLight.target.updateMatrixWorld();

  // Update Top Race Progress Bar Markers
  const progressPct = Math.max(0, Math.min(100, (Math.abs(playerState.z) / trackLen) * 100));
  document.getElementById('trackProgressFill').style.width = `${progressPct}%`;
  document.getElementById('playerMarker').style.left = `${progressPct}%`;

  rivals.forEach((r, idx) => {
    const rPct = Math.max(0, Math.min(100, (Math.abs(r.z) / trackLen) * 100));
    const el = document.getElementById(`rivalMarker${idx}`);
    if (el) el.style.left = `${rPct}%`;
  });

  if (Math.abs(playerState.z) >= trackLen) {
    finishRace();
  }
}

// Pointer / Touch / Keyboard Controls on 3D Viewport & Pedals
let pointerStartX = null;
let pointerStartY = null;

canvas.addEventListener('pointerdown', (e) => {
  ensureAudio();
  hideSteerGuide();
  pointerStartX = e.clientX;
  pointerStartY = e.clientY;

  // Map horizontal screen tap directly to 1 of the 5 lanes for instant kid control!
  const ratioX = e.clientX / window.innerWidth;
  if (ratioX < 0.26) steerLane(-1);
  else if (ratioX > 0.74) steerLane(1);
});

canvas.addEventListener('pointermove', (e) => {
  if (pointerStartX === null) return;
  const dx = e.clientX - pointerStartX;
  const dy = e.clientY - pointerStartY;
  if (Math.abs(dx) > 48) {
    steerLane(dx > 0 ? 1 : -1);
    pointerStartX = e.clientX;
  }
  if (dy < -55) {
    triggerJumpGlide();
    pointerStartY = e.clientY;
  }
});

window.addEventListener('pointerup', () => {
  pointerStartX = null;
  pointerStartY = null;
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    steerLane(-1);
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    steerLane(1);
  } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
    e.preventDefault();
    triggerJumpGlide();
  } else if (e.key === '1') {
    triggerTurboBoost();
  } else if (e.key === '2') {
    triggerRainbowShell();
  } else if (e.key === '3') {
    triggerStarMagnet();
  }
});

// Bottom Arcade Pedals
document.getElementById('btnLaneLeft').addEventListener('click', () => steerLane(-1));
document.getElementById('btnLaneRight').addEventListener('click', () => steerLane(1));
document.getElementById('btnJumpGlide').addEventListener('click', () => triggerJumpGlide());
document.getElementById('btnItemTurbo').addEventListener('click', () => triggerTurboBoost());
document.getElementById('btnItemShell').addEventListener('click', () => triggerRainbowShell());
document.getElementById('btnItemMagnet').addEventListener('click', () => triggerStarMagnet());

document.getElementById('btnRestartRace').addEventListener('click', () => {
  ensureAudio();
  document.getElementById('winModal').classList.add('hidden');
  buildRaceWorld(currentWorld);
});

document.getElementById('btnSoundToggle').addEventListener('click', (e) => {
  soundEnabled = !soundEnabled;
  e.currentTarget.textContent = soundEnabled ? '🔊' : '🔇';
  if (soundEnabled) ensureAudio();
});

// Podium & Finale Modal Buttons
document.getElementById('btnWinReplay').addEventListener('click', () => {
  document.getElementById('winModal').classList.add('hidden');
  buildRaceWorld(currentWorld);
});

document.getElementById('btnWinNext').addEventListener('click', () => {
  document.getElementById('winModal').classList.add('hidden');
  if (currentWorld < CRITTERS.length - 1) {
    buildRaceWorld(currentWorld + 1);
  } else {
    const grid = document.getElementById('finaleGrid');
    if (grid) {
      grid.innerHTML = CRITTERS.map(
        (c) => `
        <div class="finale-tile">
          <img src="${c.icon}" alt="" />
          <span>⭐⭐⭐ ${c.badge}</span>
        </div>
      `
      ).join('');
    }
    document.getElementById('finaleModal').classList.remove('hidden');
  }
});

document.getElementById('btnFinaleClose').addEventListener('click', () => {
  document.getElementById('finaleModal').classList.add('hidden');
  buildRaceWorld(0);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start 3D Engine Loop
let lastTime = performance.now();
function animate(now) {
  const dt = Math.min(0.04, (now - lastTime) / 1000);
  lastTime = now;
  updateGame3D(dt, now / 1000);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

buildRaceWorld(0);
requestAnimationFrame(animate);
