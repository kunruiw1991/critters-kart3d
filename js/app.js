/**
 * Critter Kart 3D: Rainbow Grand Prix! (Three.js 3D WebGL Engine)
 * Upgraded with Visceral 3D Crash & Impact Physics:
 * - Hit-Stop Micro-Freeze + 3D Camera Trauma Shake, FOV Punch & Dutch-Roll Jolt
 * - 3D Shockwave Rings, Starburst Cores, Grinding Metal Sparks & Engine Smoke
 * - 14-Piece 3D Shattering Crate/Barrel Debris with Road Bounce Restitution
 * - True 3D Kart-vs-Kart Sideswipe Door-Bangs & Airborne Flip Takedowns
 * - 3D Chassis Squash-and-Stretch, Nose Pitch Bucking & Spinning 3D Dizzy Stars Halo
 * - Multi-Layered Web Audio Sub-Bass + Filtered Noise Crunch + Tire Screech Synthesizer
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
    trackLength: 360
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
    trackLength: 380
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
    trackLength: 400
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
    trackLength: 420
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
    trackLength: 440
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
    trackLength: 460
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
    trackLength: 480
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
    trackLength: 500
  }
];

const LANES = [-5.6, -2.8, 0, 2.8, 5.6];
const RAINBOW_HEX = [0xff5252, 0xffb300, 0xffd54f, 0x69f0ae, 0x29b6f6, 0xab47bc];

// Multi-Layered Web Audio Synthesizer (Sub-Bass + Noise Crunch + Tire Skid)
let soundEnabled = true;
let audioCtx = null;
let noiseBuffer = null;

function ensureAudio() {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (audioCtx && !noiseBuffer) {
    const sampleRate = audioCtx.sampleRate;
    noiseBuffer = audioCtx.createBuffer(1, sampleRate * 0.6, sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.22));
    }
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
      osc.frequency.exponentialRampToValueAtTime(Math.max(18, slideTo), actx.currentTime + duration);
    }
    gain.gain.setValueAtTime(gainVal, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + duration);
  } catch (_) {}
}

function playNoiseCrunch(filterType = 'bandpass', startFreq = 900, endFreq = 180, duration = 0.26, gainVal = 0.36) {
  const actx = ensureAudio();
  if (!actx || !noiseBuffer) return;
  try {
    const src = actx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = actx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(startFreq, actx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), actx.currentTime + duration);
    filter.Q.setValueAtTime(1.8, actx.currentTime);

    const gain = actx.createGain();
    gain.gain.setValueAtTime(gainVal, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(actx.destination);
    src.start();
    src.stop(actx.currentTime + duration);
  } catch (_) {}
}

// Heavy Obstacle Crash Sound: Sub-Bass Thud + Wood/Metal Noise Crunch + Tire Skid Screech
function playHeavyCrashSfx() {
  playTone(145, 'triangle', 0.34, 0.44, 24);
  playTone(95, 'sawtooth', 0.28, 0.28, 28);
  playTone(215, 'square', 0.19, 0.2, 52);
  playNoiseCrunch('lowpass', 1650, 140, 0.3, 0.42);
  // Tire screech chirp + dizzy star warble
  setTimeout(() => playTone(1480, 'sine', 0.16, 0.11, 820), 35);
  setTimeout(() => playTone(520, 'triangle', 0.14, 0.12, 340), 120);
}

// Explosive Turbo / Shell Smash Sound: Sonic Boom + Wood/Crystal Shatter
function playSmashShatterSfx() {
  playTone(170, 'triangle', 0.28, 0.4, 30);
  playTone(320, 'sawtooth', 0.18, 0.22, 680);
  playNoiseCrunch('bandpass', 1900, 320, 0.24, 0.38);
}

// Kart-vs-Kart Bumper-Car Sideswipe Sound: Mid-Bass Bump + Metal Grinding Sparks
function playKartSideswipeSfx() {
  playTone(160, 'triangle', 0.22, 0.36, 38);
  playTone(280, 'sawtooth', 0.14, 0.2, 110);
  playNoiseCrunch('bandpass', 2400, 600, 0.2, 0.32);
}

function playSteerSfx() {
  playTone(340, 'sine', 0.08, 0.09, 490);
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

function playWinFanfare(starsEarned = 3) {
  const notes =
    starsEarned === 3
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5]
      : starsEarned === 2
        ? [523.25, 659.25, 783.99, 1046.5]
        : [523.25, 659.25, 783.99];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 'triangle', 0.25, 0.18, f * 1.05), i * 85);
  });
}

function playLoseSadSfx() {
  // Descending wah-wah-wah-waaah trombone loss sound
  [392.0, 369.99, 349.23, 311.13].forEach((f, i) => {
    const dur = i === 3 ? 0.48 : 0.22;
    setTimeout(() => playTone(f, 'sawtooth', dur, 0.2, f * 0.86), i * 195);
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
  critterTextures[c.id] = textureLoader.load(c.icon);
});

const worldGroup = new THREE.Group();
scene.add(worldGroup);

const dynamicGroup = new THREE.Group();
scene.add(dynamicGroup);

// Build a 3D Sculpted Smiling Critter Kart (with Chassis deformation group & 3D Dizzy Stars Halo!)
function createKartMesh(critterCfg, isPlayer = false) {
  const root = new THREE.Group();
  const deformGroup = new THREE.Group();
  root.add(deformGroup);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: critterCfg.bodyColor,
    roughness: 0.26,
    metalness: 0.16
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: critterCfg.trimColor,
    roughness: 0.22,
    metalness: 0.25
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x212121,
    roughness: 0.55
  });
  const bumperMat = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    metalness: 0.65,
    roughness: 0.2
  });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.52, 2.75), bodyMat);
  chassis.position.y = 0.52;
  chassis.castShadow = true;
  deformGroup.add(chassis);

  // Heavy Chrome Front & Rear Impact Bumpers
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.24, 0.26), bumperMat);
  frontBumper.position.set(0, 0.38, -2.08);
  deformGroup.add(frontBumper);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.38, 1.05), trimMat);
  nose.position.set(0, 0.5, -1.55);
  nose.castShadow = true;
  deformGroup.add(nose);

  [-0.98, 0.98].forEach((sx) => {
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 1.88), trimMat);
    pod.position.set(sx, 0.46, -0.05);
    pod.castShadow = true;
    deformGroup.add(pod);
  });

  const wingStrutL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.18), darkMat);
  wingStrutL.position.set(-0.55, 0.95, 1.2);
  const wingStrutR = wingStrutL.clone();
  wingStrutR.position.x = 0.55;
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.12, 0.48), trimMat);
  spoiler.position.set(0, 1.22, 1.25);
  deformGroup.add(wingStrutL, wingStrutR, spoiler);

  const pipeMat = new THREE.MeshStandardMaterial({ color: 0xeceff1, metalness: 0.7, roughness: 0.2 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6d00 });
  const flames = [];
  [-0.45, 0.45].forEach((px) => {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.55, 12), pipeMat);
    pipe.rotation.x = Math.PI / 2.3;
    pipe.position.set(px, 0.68, 1.45);
    deformGroup.add(pipe);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.05, 10), flameMat);
    flame.rotation.x = Math.PI / 2;
    flame.position.set(px, 0.68, 2.08);
    flame.visible = false;
    deformGroup.add(flame);
    flames.push(flame);
  });

  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.38, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.4, 12);
  hubGeo.rotateZ(Math.PI / 2);

  [
    [-1.08, 0.42, -1.05],
    [1.08, 0.42, -1.05],
    [-1.08, 0.42, 0.95],
    [1.08, 0.42, 0.95]
  ].forEach(([wx, wy, wz]) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, wy, wz);
    const tire = new THREE.Mesh(wheelGeo, darkMat);
    const hub = new THREE.Mesh(hubGeo, bumperMat);
    wGroup.add(tire, hub);
    deformGroup.add(wGroup);
    wheels.push(wGroup);
  });

  // Sculpted 3D Smiling Critter Driver Head + Species Ears
  const driverGroup = new THREE.Group();
  driverGroup.position.set(0, 1.28, -0.05);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 20), bodyMat);
  headMesh.castShadow = true;
  driverGroup.add(headMesh);

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
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.65, 12), bumperMat);
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

  const tex = critterTextures[critterCfg.id];
  const badgeMat = new THREE.MeshBasicMaterial({ map: tex });
  const backBadge = new THREE.Mesh(new THREE.CircleGeometry(0.46, 24), badgeMat);
  backBadge.position.set(0, 0.08, 0.63);
  driverGroup.add(backBadge);

  const hoodBadge = new THREE.Mesh(new THREE.CircleGeometry(0.48, 24), badgeMat);
  hoodBadge.rotation.x = -Math.PI / 2.2;
  hoodBadge.rotation.z = Math.PI;
  hoodBadge.position.set(0, 0.72, -1.52);
  deformGroup.add(hoodBadge);

  // 3D Orbiting Dizzy Stars Halo (visible when crashed/spun out!)
  const dizzyHalo = new THREE.Group();
  dizzyHalo.position.set(0, 0.92, 0);
  const dizzyStarGeo = new THREE.OctahedronGeometry(0.22, 0);
  const dizzyStarMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2;
    const st = new THREE.Mesh(dizzyStarGeo, dizzyStarMat);
    st.position.set(Math.cos(ang) * 0.78, 0, Math.sin(ang) * 0.78);
    dizzyHalo.add(st);
  }
  dizzyHalo.visible = false;
  driverGroup.add(dizzyHalo);

  deformGroup.add(driverGroup);

  // Deployable 3D Rainbow Glider Wings
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
  deformGroup.add(gliderWings);

  let magnetRing = null;
  if (isPlayer) {
    magnetRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.68, 0.09, 12, 36),
      new THREE.MeshBasicMaterial({ color: 0xe040fb })
    );
    magnetRing.rotation.x = Math.PI / 2;
    magnetRing.position.y = 0.65;
    magnetRing.visible = false;
    deformGroup.add(magnetRing);
  }

  return {
    root,
    deformGroup,
    wheels,
    flames,
    driverGroup,
    dizzyHalo,
    gliderWings,
    magnetRing
  };
}

// Player, Camera Trauma & Collision Physics State
let playerKart = null;
let playerState = {
  laneIndex: 2,
  x: 0,
  y: 0,
  vy: 0,
  z: 0,
  speed: 25,
  knockVx: 0,
  knockVz: 0,
  roll: 0,
  pitchKick: 0,
  spinAngle: 0,
  squash: 0,
  dizzyTimer: 0,
  gliding: false,
  turboTimer: 0,
  magnetTimer: 0,
  hitCooldown: 0,
  smokeTick: 0
};

let camTrauma = {
  shake: 0,
  rollKick: 0,
  pitchKick: 0,
  fovKick: 0
};

let hitStopTimer = 0;

let rivals = [];
let trackStars = [];
let mysteryBoxes = [];
let boostPads = [];
let obstacles = [];
let activeShells = [];
let particles3D = [];
let debrisChunks = [];
let shockwaves3D = [];

let finishedRacerCount = 0;
let playerFinishRank = 1;
let playerLostRace = false;
let lastLiveRank = 1;
let raceFinished = false;
let podiumOrbitAngle = 0;
let steerGuideShown = true;

function showRaceToast(emojiText) {
  const el = document.getElementById('raceToast');
  if (!el) return;
  el.textContent = emojiText;
  el.classList.remove('hidden');
  clearTimeout(showRaceToast._t);
  showRaceToast._t = setTimeout(() => el.classList.add('hidden'), 1200);
}

function triggerImpactScreenEffect(mode = 'crash-hard', badgeEmoji = '💥') {
  const overlay = document.getElementById('impactFlashOverlay');
  const badge = document.getElementById('impactBadgeBurst');
  if (overlay) {
    overlay.className = `impact-flash-overlay ${mode}`;
    clearTimeout(triggerImpactScreenEffect._ft);
    triggerImpactScreenEffect._ft = setTimeout(() => {
      overlay.className = 'impact-flash-overlay';
    }, 170);
  }
  if (badge && badgeEmoji) {
    badge.textContent = badgeEmoji;
    badge.classList.remove('hidden');
    clearTimeout(triggerImpactScreenEffect._bt);
    triggerImpactScreenEffect._bt = setTimeout(() => {
      badge.classList.add('hidden');
    }, 340);
  }
}

function hideSteerGuide() {
  if (!steerGuideShown) return;
  steerGuideShown = false;
  const g = document.getElementById('steerGuide');
  if (g) g.classList.add('hidden');
}

function clearGroup(group) {
  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }
}

// 3D Shockwave Ring + Starburst Core at Exact Impact Point
function spawnShockwave3D(x, y, z, hexColor = 0xffea00, maxScale = 4.8) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.65, 0.14, 12, 28),
    new THREE.MeshBasicMaterial({ color: hexColor, transparent: true, opacity: 0.95 })
  );
  ring.position.set(x, y, z);
  ring.rotation.x = Math.PI / 2;

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.75, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.9 })
  );
  core.position.set(x, y, z);

  dynamicGroup.add(ring, core);
  shockwaves3D.push({
    ring,
    core,
    scale: 0.3,
    maxScale,
    life: 0.28,
    maxLife: 0.28
  });
}

// High-Velocity 3D Metal Grinding Sparks (Bounce on Road!)
function spawnMetalSparks3D(x, y, z, count = 18) {
  const sparkGeo = new THREE.BoxGeometry(0.12, 0.12, 0.55);
  const colors = [0xffffff, 0xffea00, 0xff9100, 0xff3d00];
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
    const m = new THREE.Mesh(sparkGeo, mat);
    m.position.set(x, y, z);
    const ang = Math.random() * Math.PI * 2;
    const spd = 7 + Math.random() * 14;
    const vy = 4 + Math.random() * 10;
    m.rotation.y = ang;
    dynamicGroup.add(m);
    particles3D.push({
      mesh: m,
      vx: Math.cos(ang) * spd,
      vy,
      vz: Math.sin(ang) * spd,
      gravity: 28,
      bounce: true,
      life: 0.65 + Math.random() * 0.25
    });
  }
}

// 3D Tire & Engine Smoke Puffs
function spawnSmokePuff3D(x, y, z, isDark = false) {
  const puff = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 10, 10),
    new THREE.MeshBasicMaterial({
      color: isDark ? 0x424242 : 0xf5f5f5,
      transparent: true,
      opacity: 0.75
    })
  );
  puff.position.set(x + (Math.random() - 0.5) * 0.5, y, z + (Math.random() - 0.5) * 0.5);
  dynamicGroup.add(puff);
  particles3D.push({
    mesh: puff,
    vx: (Math.random() - 0.5) * 2.5,
    vy: 2.2 + Math.random() * 2.0,
    vz: 3.5 + Math.random() * 2.5,
    gravity: -1.5,
    grow: 2.4,
    life: 0.55
  });
}

// Shatter Obstacle Barrel/Crate into 14 Spinning, Road-Bouncing 3D Planks & Metal Hoops!
function shatterObstacleIntoDebris(obs, impactVx = 0, forwardBlastVz = -20) {
  obs.hit = true;
  obs.mesh.visible = false;

  const plankGeo = new THREE.BoxGeometry(0.32, 0.14, 0.88);
  const chunkGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
  const woodColors = [0xd84315, 0xff7043, 0xffca28, 0x8d6e63, 0xfff8e1];

  for (let i = 0; i < 14; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: woodColors[i % woodColors.length],
      roughness: 0.45
    });
    const m = new THREE.Mesh(i % 2 === 0 ? plankGeo : chunkGeo, mat);
    m.position.set(
      obs.x + (Math.random() - 0.5) * 0.9,
      obs.y + 0.2 + Math.random() * 0.6,
      obs.z + (Math.random() - 0.5) * 0.9
    );
    m.castShadow = true;
    dynamicGroup.add(m);

    const spreadAng = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const radialSpd = 5 + Math.random() * 11;
    debrisChunks.push({
      mesh: m,
      vx: Math.cos(spreadAng) * radialSpd + impactVx * 0.45,
      vy: 7 + Math.random() * 11,
      vz: Math.sin(spreadAng) * radialSpd + forwardBlastVz,
      rvx: (Math.random() - 0.5) * 18,
      rvy: (Math.random() - 0.5) * 18,
      rvz: (Math.random() - 0.5) * 18,
      life: 1.65
    });
  }
}

function spawn3DBurst(x, y, z, hexColor, count = 14) {
  const geo = new THREE.OctahedronGeometry(0.18, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: hexColor,
    emissive: hexColor,
    emissiveIntensity: 0.45,
    roughness: 0.25
  });
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    const ang = Math.random() * Math.PI * 2;
    const spd = 5 + Math.random() * 9;
    dynamicGroup.add(m);
    particles3D.push({
      mesh: m,
      vx: Math.cos(ang) * spd,
      vy: 3.5 + Math.random() * 7.5,
      vz: Math.sin(ang) * spd,
      rvx: (Math.random() - 0.5) * 14,
      rvy: (Math.random() - 0.5) * 14,
      gravity: 22,
      bounce: true,
      life: 0.65
    });
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
  debrisChunks = [];
  shockwaves3D = [];

  finishedRacerCount = 0;
  playerFinishRank = 1;
  playerLostRace = false;
  lastLiveRank = 1;
  raceFinished = false;
  clearTimeout(finishRace._modalTimer);
  podiumOrbitAngle = 0;
  hitStopTimer = 0;
  camTrauma = { shake: 0, rollKick: 0, pitchKick: 0, fovKick: 0, zoomKick: 0 };

  scene.background = new THREE.Color(cfg.skyColor);
  scene.fog = new THREE.FogExp2(cfg.fogColor, 0.0072);

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

    if (i % 2 === 0) {
      [-4.2, -1.4, 1.4, 4.2].forEach((lx) => {
        const st = new THREE.Mesh(stripeGeo, stripeMat);
        st.position.set(lx, 0.03, sz);
        worldGroup.add(st);
      });
    }
  }

  // Roadside 3D Stylized Trees & Fluffy 3D Clouds
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

  // 3 Giant Rainbow Arch Gates at 28%, 58%, 84% of the Track
  const checkpointRatios = [0.28, 0.58, 0.84];
  checkpointRatios.forEach((ratio, idx) => {
    const cpZ = -trackLen * ratio;
    const archGroup = createRainbowArchMesh(roadW);
    archGroup.position.set(0, 0, cpZ);
    worldGroup.add(archGroup);

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

  // Populate Track with Regular 3D Stars, Mystery Item Cubes, Rainbow Boost Ramps & Destructible Obstacles
  const starGeo = new THREE.OctahedronGeometry(0.65, 0);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    emissive: 0xff8f00,
    emissiveIntensity: 0.4,
    metalness: 0.4,
    roughness: 0.2
  });

  for (let z = -18; z > -trackLen + 20; z -= 12) {
    const nearCp = checkpointRatios.some((r) => Math.abs(z - -trackLen * r) < 6);
    if (nearCp) continue;

    const stepIdx = Math.floor(Math.abs(z) / 12);

    const starLane = LANES[(stepIdx + worldIdx) % LANES.length];
    const isSkyStar = stepIdx % 5 === 2;
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

    // Place 1 to 2 Destructible 3D Barrels/Crates per row for rich crash interactions
    const obsLanes = [LANES[(stepIdx * 3 + worldIdx) % LANES.length]];
    if (stepIdx % 2 === 0) {
      obsLanes.push(LANES[(stepIdx * 3 + worldIdx + 2) % LANES.length]);
    }
    obsLanes.forEach((obsLane, oIdx) => {
      if (Math.abs(obsLane - starLane) < 0.4) return;
      const obsMesh = createObstacle3DMesh(stepIdx + oIdx);
      obsMesh.position.set(obsLane, 0.68, z);
      obsMesh.castShadow = true;
      dynamicGroup.add(obsMesh);
      obstacles.push({
        mesh: obsMesh,
        x: obsLane,
        y: 0.68,
        z,
        hit: false
      });
    });
  }

  // Create Player 3D Smiling Critter Kart (Center Lane 2 on the 5-Kart Starting Grid)
  playerKart = createKartMesh(cfg, true);
  playerState.laneIndex = 2;
  playerState.x = LANES[2];
  playerState.y = 0;
  playerState.vy = 0;
  playerState.z = 0;
  playerState.speed = 25;
  playerState.knockVx = 0;
  playerState.knockVz = 0;
  playerState.roll = 0;
  playerState.pitchKick = 0;
  playerState.spinAngle = 0;
  playerState.squash = 0;
  playerState.dizzyTimer = 0;
  playerState.gliding = false;
  playerState.turboTimer = 0;
  playerState.magnetTimer = 0;
  playerState.hitCooldown = 0;
  playerState.finished = false;
  playerState.finishOrder = 0;
  playerKart.root.position.set(0, 0, 0);
  dynamicGroup.add(playerKart.root);

  // Create 4 Active 3D Rival Smiling Critter Karts (5 Racers Total across all 5 lanes!)
  // Speeds are calibrated so:
  // - Rival 0 (25.45) is the Pace Leader: requires stars/ramps/boost or takedown to beat for 1st (3⭐)
  // - Rival 1 (24.35) is the 2nd Contender
  // - Rival 2 (23.25) is the 3rd Contender (Top 3 cutoff to pass!)
  // - Rival 3 (22.15) is the 4th Contender
  const rivalStartLanes = [1, 3, 0, 4];
  const rivalStartZs = [-5, -3, -7, -2];
  const rivalBaseSpeeds = [25.45, 24.35, 23.25, 22.15];

  [1, 2, 3, 4].forEach((offset, idx) => {
    const rCfg = CRITTERS[(worldIdx + offset) % CRITTERS.length];
    const rKart = createKartMesh(rCfg, false);
    const startLane = rivalStartLanes[idx];
    const startZ = rivalStartZs[idx];
    rKart.root.position.set(LANES[startLane], 0, startZ);
    dynamicGroup.add(rKart.root);
    rivals.push({
      cfg: rCfg,
      kart: rKart,
      laneIndex: startLane,
      x: LANES[startLane],
      y: 0,
      vy: 0,
      z: startZ,
      knockVx: 0,
      knockVz: 0,
      roll: 0,
      tumbleX: 0,
      baseSpeed: rivalBaseSpeeds[idx],
      spinTimer: 0,
      squash: 0,
      clashCooldown: 0,
      laneSwitchTimer: 1.2 + idx * 0.55,
      finished: false,
      finishOrder: 0
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
  const isBarrel = stepIdx % 2 === 0;
  if (isBarrel) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 1.35, 14),
      new THREE.MeshStandardMaterial({ color: 0xd84315, roughness: 0.45 })
    );
    const bandTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.71, 0.71, 0.18, 14),
      new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.5 })
    );
    bandTop.position.y = 0.36;
    const bandBot = bandTop.clone();
    bandBot.position.y = -0.36;
    g.add(barrel, bandTop, bandBot);
  } else {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(1.36, 1.36, 1.36),
      new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.45 })
    );
    const brace1 = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.24, 1.42),
      new THREE.MeshStandardMaterial({ color: 0xffe082 })
    );
    const brace2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 1.42, 1.42),
      new THREE.MeshStandardMaterial({ color: 0xffe082 })
    );
    g.add(crate, brace1, brace2);
  }
  return g;
}

// Execute a Visceral Obstacle Collision (either Explosive Turbo Smash OR Heavy Physical Crash!)
function handleObstacleCollision(obs) {
  const contactX = (playerState.x + obs.x) * 0.5;
  const contactY = 0.85;
  const contactZ = obs.z;

  if (playerState.turboTimer > 0) {
    // TURBO SMASH: Plow through with Sonic Boom, FOV punch & 14-piece flying debris!
    hitStopTimer = 0.045;
    camTrauma.shake = 1.05;
    camTrauma.fovKick = 14;
    camTrauma.pitchKick = 0.08;
    camTrauma.zoomKick = -1.2;
    playerState.squash = 0.32;

    shatterObstacleIntoDebris(obs, (obs.x - playerState.x) * 9, -(playerState.speed + 28));
    spawnShockwave3D(contactX, contactY, contactZ, 0xffea00, 5.4);
    spawnMetalSparks3D(contactX, contactY, contactZ, 26);
    triggerImpactScreenEffect('smash-boom', '🔥');
    playSmashShatterSfx();
  } else {
    // HARD PHYSICAL CRASH: Hit-stop freeze, violent camera whip + shake, true backward rebound,
    // lateral lane shunt, chassis squash-and-stretch, nose pitch bucking, 14-piece crate shatter,
    // and spinning 3D dizzy stars halo!
    hitStopTimer = 0.065;
    const shuntDir = playerState.x >= obs.x ? 1 : -1;

    const nextLane = Math.max(0, Math.min(LANES.length - 1, playerState.laneIndex + shuntDir));
    playerState.laneIndex = nextLane;

    playerState.speed = 6.0; // sudden impact wall-stop deceleration!
    playerState.vy = 10.4;
    playerState.knockVx = shuntDir * 13.5;
    playerState.knockVz = 28.0; // real physical backward rebound off the crate!
    playerState.roll = -shuntDir * 0.65;
    playerState.pitchKick = -0.75; // nose violently rears skyward!
    playerState.spinAngle = Math.PI * 2;
    playerState.squash = 0.55;
    playerState.dizzyTimer = 1.55;
    playerState.hitCooldown = 0.9;

    camTrauma.shake = 1.45;
    camTrauma.rollKick = shuntDir * 0.25;
    camTrauma.pitchKick = -0.18;
    camTrauma.fovKick = -12;
    camTrauma.zoomKick = -2.4; // camera whips close to the crash!

    shatterObstacleIntoDebris(obs, shuntDir * 11, -16);
    spawnShockwave3D(contactX, contactY, contactZ, 0xff3d00, 5.0);
    spawnMetalSparks3D(contactX, contactY, contactZ, 28);
    for (let s = 0; s < 5; s++) {
      spawnSmokePuff3D(playerState.x, 0.6, playerState.z + 1.0, true);
    }
    triggerImpactScreenEffect('crash-hard', '💥');
    showRaceToast('💥💫');
    playHeavyCrashSfx();
  }
}

// Execute a Visceral 3D Kart-vs-Kart Collision (Sideswipe Door-Bang or Airborne Rear-End Takedown!)
function handleRivalKartCollision(r) {
  const contactX = (playerState.x + r.x) * 0.5;
  const contactY = 0.85;
  const contactZ = (playerState.z + r.z) * 0.5;
  const shuntDir = playerState.x >= r.x ? 1 : -1;
  const isRearRam = playerState.z > r.z + 0.6 || playerState.turboTimer > 0;

  r.clashCooldown = 0.55;

  if (isRearRam) {
    // AIRBORNE TAKEDOWN: Catapult the rival kart skyward in a 3D head-over-heels flip!
    hitStopTimer = 0.055;
    camTrauma.shake = 1.25;
    camTrauma.fovKick = 13;
    camTrauma.rollKick = shuntDir * 0.16;
    camTrauma.zoomKick = -1.6;

    playerState.squash = 0.38;
    playerState.pitchKick = 0.26;
    playerState.knockVx = shuntDir * 6.5;

    r.vy = 15.0;
    r.knockVx = -shuntDir * 14.5;
    r.knockVz = -30.0;
    r.tumbleX = Math.PI * 4;
    r.spinTimer = 1.75;
    r.squash = 0.5;
    r.laneIndex = Math.max(0, Math.min(LANES.length - 1, r.laneIndex - shuntDir));

    spawnShockwave3D(contactX, contactY, contactZ, 0xffea00, 5.2);
    spawnMetalSparks3D(contactX, contactY, contactZ, 28);
    triggerImpactScreenEffect('smash-boom', '💥');
    playSmashShatterSfx();
    showRaceToast('🏎️💥✨');
  } else {
    // BUMPER-CAR SIDESWIPE DOOR-BANG: Grinding metal sparks & violent opposite lateral recoil!
    hitStopTimer = 0.045;
    camTrauma.shake = 1.05;
    camTrauma.rollKick = shuntDir * 0.2;
    camTrauma.zoomKick = -1.4;

    playerState.knockVx = shuntDir * 12.0;
    playerState.roll = -shuntDir * 0.52;
    playerState.squash = 0.36;
    playerState.vy = Math.max(playerState.vy, 4.2);

    r.knockVx = -shuntDir * 16.5;
    r.vy = 7.5;
    r.roll = shuntDir * 0.62;
    r.spinTimer = 1.25;
    r.squash = 0.42;
    r.laneIndex = Math.max(0, Math.min(LANES.length - 1, r.laneIndex - shuntDir));

    spawnShockwave3D(contactX, contactY, contactZ, 0x00e5ff, 4.4);
    spawnMetalSparks3D(contactX, contactY, contactZ, 26);
    spawnSmokePuff3D(contactX, 0.4, contactZ, false);
    triggerImpactScreenEffect('smash-boom', '⚡');
    playKartSideswipeSfx();
  }
}

// Player Steering & Power-Up Controls
function steerLane(delta) {
  ensureAudio();
  hideSteerGuide();
  const next = Math.max(0, Math.min(LANES.length - 1, playerState.laneIndex + delta));
  if (next !== playerState.laneIndex) {
    playerState.laneIndex = next;
    playerState.roll = -delta * 0.32;
    spawnSmokePuff3D(playerState.x, 0.25, playerState.z + 1.1, false);
    playSteerSfx();
  }
}

function triggerJumpGlide() {
  ensureAudio();
  hideSteerGuide();
  if (playerState.y <= 0.15) {
    playerState.vy = 11.8;
    playerState.squash = -0.25;
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
  playerState.dizzyTimer = 0;
  playerState.hitCooldown = 0;
  camTrauma.fovKick = 10;
  camTrauma.shake = 0.45;
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
    vz: -(playerState.speed + 30),
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

function isWorldUnlocked(idx) {
  if (idx <= 0) return true;
  return (cupStars[idx - 1] || 0) >= 1 || (cupStars[idx] || 0) >= 1;
}

// UI Rendering (100% Zero-Text)
function renderWorldSelector() {
  const rail = document.getElementById('worldSelectorRail');
  if (!rail) return;
  rail.innerHTML = '';
  CRITTERS.forEach((c, idx) => {
    const unlocked = isWorldUnlocked(idx);
    const btn = document.createElement('button');
    btn.className =
      'world-pill' +
      (idx === currentWorld ? ' active' : '') +
      (unlocked ? '' : ' locked');
    const stars = cupStars[idx] || 0;
    const starBadge = !unlocked ? '🔒' : stars > 0 ? '⭐'.repeat(stars) : c.badge;
    btn.innerHTML = `
      <img src="${c.icon}" alt="" />
      <span class="world-pill-stars">${starBadge}</span>
    `;
    btn.addEventListener('click', () => {
      ensureAudio();
      if (!isWorldUnlocked(idx)) {
        playTone(180, 'square', 0.12, 0.14, 110);
        showRaceToast('🔒🥇🥈🥉');
        return;
      }
      document.getElementById('winModal').classList.add('hidden');
      buildRaceWorld(idx);
    });
    rail.appendChild(btn);
  });
}

// Rank-to-Stars & Rank-to-Medal Mapping:
// - 1st Place (🥇): 3 Stars (⭐⭐⭐) — Pass!
// - 2nd Place (🥈): 2 Stars (⭐⭐)  — Pass!
// - 3rd Place (🥉): 1 Star  (⭐)   — Pass! (Top 3 required to pass!)
// - 4th / 5th Place (😭): 0 Stars  — Lose! Must retry!
function getStarsForRank(rank) {
  if (rank === 1) return 3;
  if (rank === 2) return 2;
  if (rank === 3) return 1;
  return 0;
}

function getMedalForRank(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '😭';
}

// Compute Exact 5-Racer Standings (1st through 5th)
function computeStandings() {
  const cfg = CRITTERS[currentWorld];
  const entries = [
    {
      isPlayer: true,
      id: cfg.id,
      icon: cfg.icon,
      badge: cfg.badge,
      z: playerState.z,
      finished: Boolean(playerState.finished),
      finishOrder: playerState.finishOrder || 0
    },
    ...rivals.map((r, idx) => ({
      isPlayer: false,
      rivalIdx: idx,
      id: r.cfg.id,
      icon: r.cfg.icon,
      badge: r.cfg.badge,
      z: r.z,
      finished: Boolean(r.finished),
      finishOrder: r.finishOrder || 0
    }))
  ];

  entries.sort((a, b) => {
    if (a.finished && b.finished) {
      return a.finishOrder - b.finishOrder;
    }
    if (a.finished !== b.finished) {
      return a.finished ? -1 : 1;
    }
    // More negative z is further down the track toward -trackLength
    return a.z - b.z;
  });

  return entries;
}

function updateLiveRankHud() {
  const standings = computeStandings();
  const currentRank = standings.findIndex((s) => s.isPlayer) + 1;
  const projectedStars = getStarsForRank(currentRank);

  const rankChip = document.getElementById('hudRankChip');
  const rankEmoji = document.getElementById('hudRankEmoji');
  if (rankChip && rankEmoji) {
    rankEmoji.textContent = getMedalForRank(currentRank);
    const rankClass =
      currentRank === 1
        ? 'rank-1'
        : currentRank === 2
          ? 'rank-2'
          : currentRank === 3
            ? 'rank-3'
            : 'rank-lose';
    rankChip.className = `hud-rank-chip ${rankClass}`;
  }

  for (let i = 0; i < 3; i++) {
    const starEl = document.getElementById(`hudStar${i}`);
    if (starEl) {
      starEl.classList.toggle('earned', i < projectedStars);
    }
  }

  lastLiveRank = currentRank;
  return { standings, currentRank, projectedStars };
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

  updateLiveRankHud();
}

function finishRace() {
  if (raceFinished) return;
  raceFinished = true;

  if (!playerState.finished) {
    playerState.finished = true;
    playerState.finishOrder = ++finishedRacerCount;
  }

  const trackLen = CRITTERS[currentWorld].trackLength;
  document.getElementById('trackProgressFill').style.width = '100%';
  document.getElementById('playerMarker').style.left = '100%';
  rivals.forEach((r, idx) => {
    const rPct = r.finished ? 100 : Math.max(0, Math.min(100, (Math.abs(r.z) / trackLen) * 100));
    const el = document.getElementById(`rivalMarker${idx}`);
    if (el) el.style.left = `${rPct}%`;
  });

  const { standings, currentRank, projectedStars } = updateLiveRankHud();
  playerFinishRank = currentRank;
  const earnedStars = projectedStars; // 1st->3, 2nd->2, 3rd->1, 4th/5th->0
  const passedLevel = playerFinishRank <= 3;
  playerLostRace = !passedLevel;

  if (passedLevel) {
    cupStars[currentWorld] = Math.max(cupStars[currentWorld] || 0, earnedStars);
    saveProgress();
    renderWorldSelector();
    playWinFanfare(earnedStars);

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
  } else {
    // Lost the race (finished 4th or 5th, outside Top 3!)
    playerState.dizzyTimer = 99;
    playLoseSadSfx();
    showRaceToast('😭💔');
    for (let s = 0; s < 6; s++) {
      spawnSmokePuff3D(playerState.x, 0.7, playerState.z + 0.5, true);
    }
  }

  clearTimeout(finishRace._modalTimer);
  finishRace._modalTimer = setTimeout(() => {
    const cfg = CRITTERS[currentWorld];
    const cardEl = document.getElementById('winPodiumCard');
    const sparklesEl = document.getElementById('winSparklesHeader');
    const medalEl = document.getElementById('winMedalBadge');
    const starsEls = document.querySelectorAll('#winStarsRow .podium-star');
    const standingsRowEl = document.getElementById('podiumStandingsRow');
    const nextBtnEl = document.getElementById('btnWinNext');

    if (cardEl) {
      cardEl.classList.toggle('lose-card', !passedLevel);
    }
    if (sparklesEl) {
      sparklesEl.textContent = passedLevel ? '🏁 🏆 🌈 🏆 🏁' : '🌧️ 💥 😭 💥 🌧️';
    }
    document.getElementById('winDriverImg').src = cfg.icon;
    document.getElementById('winCupBadge').textContent = cfg.badge;
    if (medalEl) {
      medalEl.textContent = getMedalForRank(playerFinishRank);
    }

    starsEls.forEach((el, idx) => {
      el.classList.toggle('earned', idx < earnedStars);
    });

    if (standingsRowEl) {
      standingsRowEl.innerHTML = standings
        .map((entry, idx) => {
          const rankNum = idx + 1;
          const isTop3 = rankNum <= 3;
          const slotMedal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : '💔';
          const slotStars = getStarsForRank(rankNum);
          const starsHtml = slotStars > 0 ? '⭐'.repeat(slotStars) : '❌';
          return `
            <div class="standing-slot ${isTop3 ? 'rank-top3' : 'rank-out'} ${entry.isPlayer ? 'is-player' : ''}">
              ${entry.isPlayer ? '<span class="standing-you-crown">🏎️</span>' : ''}
              <span class="standing-medal">${slotMedal}</span>
              <img class="standing-avatar" src="${entry.icon}" alt="" />
              <span class="standing-stars">${starsHtml}</span>
            </div>
          `;
        })
        .join('');
    }

    // Must finish in Top 3 (1st, 2nd, or 3rd) to unlock/advance to the next level!
    if (nextBtnEl) {
      nextBtnEl.classList.toggle('hidden', !passedLevel);
    }

    document.getElementById('winModal').classList.remove('hidden');
  }, 1100);
}

// Main 3D Simulation Step
function updateGame3D(dt, timeSec) {
  const cfg = CRITTERS[currentWorld];
  const trackLen = cfg.trackLength;

  // Always animate 3D Shockwave Rings, Debris & Sparks even during Hit-Stop freeze!
  for (let i = shockwaves3D.length - 1; i >= 0; i--) {
    const sw = shockwaves3D[i];
    sw.life -= dt;
    const progress = 1 - Math.max(0, sw.life) / sw.maxLife;
    const sc = 0.35 + progress * sw.maxScale;
    sw.ring.scale.set(sc, sc, 1);
    sw.ring.material.opacity = (1 - progress) * 0.95;
    sw.core.scale.setScalar(0.5 + progress * (sw.maxScale * 0.65));
    sw.core.rotation.y += dt * 14;
    sw.core.rotation.x += dt * 10;
    sw.core.material.opacity = (1 - progress) * 0.85;
    if (sw.life <= 0) {
      dynamicGroup.remove(sw.ring, sw.core);
      shockwaves3D.splice(i, 1);
    }
  }

  // Update 14-piece Shattering Obstacle Planks & Chunks with Road Bounce!
  for (let i = debrisChunks.length - 1; i >= 0; i--) {
    const d = debrisChunks[i];
    d.mesh.position.x += d.vx * dt;
    d.mesh.position.y += d.vy * dt;
    d.mesh.position.z += d.vz * dt;
    d.mesh.rotation.x += d.rvx * dt;
    d.mesh.rotation.y += d.rvy * dt;
    d.mesh.rotation.z += d.rvz * dt;
    d.vy -= 28 * dt;

    if (d.mesh.position.y < 0.18 && d.vy < 0) {
      d.mesh.position.y = 0.18;
      d.vy = -d.vy * 0.54;
      d.vx *= 0.82;
      d.vz *= 0.82;
    }

    d.life -= dt;
    if (d.life <= 0) {
      dynamicGroup.remove(d.mesh);
      debrisChunks.splice(i, 1);
    }
  }

  // Update 3D Sparks, Smoke & Burst Particles
  for (let i = particles3D.length - 1; i >= 0; i--) {
    const p = particles3D[i];
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    if (p.rvx) p.mesh.rotation.x += p.rvx * dt;
    if (p.rvy) p.mesh.rotation.y += p.rvy * dt;
    p.vy -= (p.gravity !== undefined ? p.gravity : 16) * dt;
    if (p.bounce && p.mesh.position.y < 0.1 && p.vy < 0) {
      p.mesh.position.y = 0.1;
      p.vy = -p.vy * 0.5;
    }
    if (p.grow) {
      p.mesh.scale.addScalar(p.grow * dt);
      if (p.mesh.material.opacity !== undefined) {
        p.mesh.material.opacity = Math.max(0, p.life * 1.2);
      }
    }
    p.life -= dt;
    if (p.life <= 0) {
      dynamicGroup.remove(p.mesh);
      particles3D.splice(i, 1);
    }
  }

  // Hit-Stop Micro-Freeze for Maximum Impact Feel!
  if (hitStopTimer > 0) {
    hitStopTimer = Math.max(0, hitStopTimer - dt);
    return;
  }

  if (raceFinished) {
    podiumOrbitAngle += dt * 1.35;
    const camRadius = 7.5;
    camera.position.set(
      playerState.x + Math.sin(podiumOrbitAngle) * camRadius,
      3.8,
      playerState.z + Math.cos(podiumOrbitAngle) * camRadius
    );
    camera.lookAt(playerState.x, 1.2, playerState.z);
    if (playerLostRace) {
      playerKart.dizzyHalo.visible = true;
      playerKart.dizzyHalo.rotation.y += dt * 9.5;
      playerKart.driverGroup.rotation.z = Math.sin(timeSec * 4) * 0.25;
    } else {
      playerKart.driverGroup.rotation.y = Math.sin(timeSec * 5) * 0.35;
    }
    return;
  }

  // Power-Up & Status Timers
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
  if (playerState.dizzyTimer > 0) {
    playerState.dizzyTimer = Math.max(0, playerState.dizzyTimer - dt);
    playerState.smokeTick -= dt;
    if (playerState.smokeTick <= 0) {
      playerState.smokeTick = 0.11;
      spawnSmokePuff3D(playerState.x, playerState.y + 0.55, playerState.z + 1.35, true);
    }
  }

  // Decay Knockback Velocities & Camera Trauma
  playerState.knockVx *= Math.pow(0.015, dt);
  playerState.knockVz *= Math.pow(0.008, dt);
  playerState.pitchKick *= Math.pow(0.02, dt);
  playerState.squash *= Math.pow(0.01, dt);

  camTrauma.shake = Math.max(0, camTrauma.shake - dt * 3.1);
  camTrauma.rollKick *= Math.pow(0.03, dt);
  camTrauma.pitchKick *= Math.pow(0.03, dt);
  camTrauma.fovKick *= Math.pow(0.04, dt);
  camTrauma.zoomKick = (camTrauma.zoomKick || 0) * Math.pow(0.03, dt);

  // Compute Forward Kart Speed + Knockback Rebound
  const targetSpeed = playerState.turboTimer > 0 ? 37.5 : playerState.hitCooldown > 0 ? 13.5 : 25.0;
  playerState.speed += (targetSpeed - playerState.speed) * Math.min(1, dt * 6.5);
  playerState.z -= (playerState.speed - playerState.knockVz) * dt;

  // Horizontal Lane Drift + Lateral Collision Impulse
  const targetX = LANES[playerState.laneIndex];
  const dx = targetX - playerState.x;
  playerState.x += dx * Math.min(1, dt * 10.5) + playerState.knockVx * dt;
  playerState.x = Math.max(-7.3, Math.min(7.3, playerState.x));
  playerState.roll += (dx * -0.11 - playerState.roll) * Math.min(1, dt * 9.5);

  // Vertical Jump, Crash Hop & 3D Glider Wing Physics
  if (playerState.y > 0 || playerState.vy !== 0) {
    const gravity = playerState.gliding && playerState.vy < 0 ? 7.2 : 26.0;
    playerState.vy -= gravity * dt;
    playerState.y += playerState.vy * dt;
    if (playerState.y <= 0) {
      if (playerState.vy < -5) {
        // Landing squash!
        playerState.squash = 0.24;
        spawnSmokePuff3D(playerState.x, 0.2, playerState.z + 0.8, false);
      }
      playerState.y = 0;
      playerState.vy = 0;
      if (playerState.gliding) {
        playerState.gliding = false;
        updateBoostPedalVisuals();
      }
    }
  }

  if (playerState.spinAngle > 0) {
    playerState.spinAngle = Math.max(0, playerState.spinAngle - dt * Math.PI * 3.8);
  }

  // Apply 3D Transform + Chassis Squash-and-Stretch + Dizzy Stars Halo
  playerKart.root.position.set(playerState.x, playerState.y, playerState.z);
  playerKart.root.rotation.z = playerState.roll;
  playerKart.root.rotation.y = dx * -0.08 + playerState.spinAngle;
  playerKart.root.rotation.x =
    playerState.pitchKick + (playerState.y > 0.1 ? Math.min(0.22, playerState.vy * 0.02) : 0);

  const sq = playerState.squash;
  playerKart.deformGroup.scale.set(1 + sq * 0.75, 1 - sq * 0.55, 1 - sq * 0.72);

  playerKart.dizzyHalo.visible = playerState.dizzyTimer > 0;
  if (playerKart.dizzyHalo.visible) {
    playerKart.dizzyHalo.rotation.y += dt * 9.5;
    playerKart.dizzyHalo.rotation.z = Math.sin(timeSec * 10) * 0.22;
  }

  playerKart.wheels.forEach((w) => {
    w.rotation.x -= playerState.speed * dt * 1.45;
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

  // Update 4 Active 3D Rival Karts with Genuine Race Progression (NO Fake Position Teleportation!)
  const newlyCrossed = [];
  if (!playerState.finished && playerState.z <= -trackLen) {
    newlyCrossed.push(playerState);
  }

  rivals.forEach((r) => {
    if (r.clashCooldown > 0) r.clashCooldown = Math.max(0, r.clashCooldown - dt);
    if (r.spinTimer > 0) r.spinTimer = Math.max(0, r.spinTimer - dt);

    r.knockVx *= Math.pow(0.02, dt);
    r.knockVz *= Math.pow(0.015, dt);
    r.squash *= Math.pow(0.015, dt);
    r.roll *= Math.pow(0.03, dt);

    let rEffectiveSpeed = 0;
    if (r.finished) {
      // Already crossed the finish line (-trackLen): coast smoothly into the finish paddock!
      const parkZ = -trackLen - 6 - r.finishOrder * 3.5;
      if (r.z > parkZ) {
        rEffectiveSpeed = 12.0;
        r.z -= rEffectiveSpeed * dt;
      }
    } else {
      // Mild, realistic pace modulation (±10%) without ever teleporting r.z
      const gapZ = r.z - playerState.z; // gapZ < 0 means rival is ahead of player
      let paceFactor = 1.0;
      if (gapZ < -36) paceFactor = 0.91;
      else if (gapZ > 28) paceFactor = 1.1;

      rEffectiveSpeed = (r.spinTimer > 0 ? r.baseSpeed * 0.45 : r.baseSpeed) * paceFactor;
      r.z -= (rEffectiveSpeed - r.knockVz) * dt;

      if (r.z <= -trackLen) {
        newlyCrossed.push(r);
      }
    }

    r.laneSwitchTimer -= dt;
    if (!r.finished && r.laneSwitchTimer <= 0 && r.spinTimer <= 0) {
      r.laneSwitchTimer = 1.4 + Math.random() * 1.4;
      // Check if an obstacle is directly ahead in the rival's lane and try to dodge it
      const obstacleAhead = obstacles.some(
        (obs) => !obs.hit && obs.z < r.z && r.z - obs.z < 14 && Math.abs(obs.x - LANES[r.laneIndex]) < 1.1
      );
      if (obstacleAhead || Math.random() < 0.65) {
        const step = Math.random() < 0.5 ? -1 : 1;
        const candidateLane = Math.max(0, Math.min(LANES.length - 1, r.laneIndex + step));
        r.laneIndex = candidateLane;
      }
    }

    r.x += (LANES[r.laneIndex] - r.x) * Math.min(1, dt * 6.5) + r.knockVx * dt;
    r.x = Math.max(-7.2, Math.min(7.2, r.x));
  });

  // Resolve exact sub-frame photo-finish ordering for any racers crossing z <= -trackLen this frame
  if (newlyCrossed.length > 0) {
    newlyCrossed.sort((a, b) => a.z - b.z);
    newlyCrossed.forEach((racer) => {
      if (!racer.finished) {
        racer.finished = true;
        racer.finishOrder = ++finishedRacerCount;
      }
    });
  }

  rivals.forEach((r) => {
    const rEffectiveSpeed = r.finished ? 10 : r.baseSpeed;

    // Vertical airborne tumble physics for rival karts when rammed or shelled!
    if (r.y > 0 || r.vy !== 0) {
      r.vy -= 26.0 * dt;
      r.y += r.vy * dt;
      if (r.y <= 0) {
        if (r.vy < -4) {
          r.squash = 0.35;
          spawnMetalSparks3D(r.x, 0.25, r.z, 10);
        }
        r.y = 0;
        r.vy = 0;
      }
    }

    if (r.tumbleX > 0) {
      r.tumbleX = Math.max(0, r.tumbleX - dt * Math.PI * 3.6);
    }

    r.kart.root.position.set(r.x, r.y, r.z);
    r.kart.root.rotation.y = r.spinTimer > 0 ? r.spinTimer * Math.PI * 4 : 0;
    r.kart.root.rotation.x = r.tumbleX;
    r.kart.root.rotation.z = r.roll;
    r.kart.deformGroup.scale.set(
      1 + r.squash * 0.7,
      1 - r.squash * 0.5,
      1 - r.squash * 0.65
    );
    r.kart.dizzyHalo.visible = r.spinTimer > 0;
    if (r.kart.dizzyHalo.visible) {
      r.kart.dizzyHalo.rotation.y += dt * 10;
    }
    r.kart.wheels.forEach((w) => {
      w.rotation.x -= rEffectiveSpeed * dt * 1.3;
    });

    // Check 3D Kart-vs-Kart Collision with Player!
    if (
      !r.finished &&
      r.clashCooldown <= 0 &&
      Math.abs(r.z - playerState.z) < 2.55 &&
      Math.abs(r.x - playerState.x) < 1.85 &&
      Math.abs(r.y - playerState.y) < 1.4
    ) {
      handleRivalKartCollision(r);
    }
  });

  // Update Homing Rainbow Shells
  for (let i = activeShells.length - 1; i >= 0; i--) {
    const sh = activeShells[i];
    sh.z += sh.vz * dt;
    sh.life -= dt;
    sh.mesh.position.set(sh.x, 0.7, sh.z);
    sh.mesh.rotation.y += dt * 12;

    // Shatter obstacles in path
    for (const obs of obstacles) {
      if (obs.hit) continue;
      if (Math.abs(obs.z - sh.z) < 4.5 && Math.abs(obs.x - sh.x) < 3.8) {
        shatterObstacleIntoDebris(obs, (obs.x - sh.x) * 6, -24);
        spawnShockwave3D(obs.x, 0.9, obs.z, 0x00e676, 4.2);
        spawnMetalSparks3D(obs.x, 0.9, obs.z, 16);
        camTrauma.shake = Math.max(camTrauma.shake, 0.55);
        playSmashShatterSfx();
      }
    }

    // Catapult rival karts in path
    rivals.forEach((r) => {
      if (!r.finished && Math.abs(r.z - sh.z) < 2.8 && Math.abs(r.x - sh.x) < 2.5 && r.spinTimer <= 0) {
        r.vy = 13.5;
        r.knockVz = -24;
        r.tumbleX = Math.PI * 4;
        r.spinTimer = 1.6;
        r.squash = 0.45;
        spawnShockwave3D(r.x, 1.0, r.z, 0x00e676, 4.5);
        spawnMetalSparks3D(r.x, 1.0, r.z, 20);
        camTrauma.shake = Math.max(camTrauma.shake, 0.65);
        playSmashShatterSfx();
      }
    });

    if (sh.life <= 0) {
      dynamicGroup.remove(sh.mesh);
      activeShells.splice(i, 1);
    }
  }

  // Update 3D Spinning Stars (Collecting stars grants a mini speed surge to help overtake rivals!)
  trackStars.forEach((st) => {
    if (st.collected) return;
    st.mesh.rotation.y += dt * 3.0;

    const distZ = Math.abs(st.z - playerState.z);
    const pullRadius =
      playerState.magnetTimer > 0 ? 18 : st.checkpointIdx >= 0 ? 6.5 : 2.3;

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
      // Mini speed surge from collecting track stars!
      playerState.speed = Math.min(35.0, playerState.speed + (st.checkpointIdx >= 0 ? 4.5 : 2.2));
      playStarSfx();
      spawn3DBurst(playerState.x, playerState.y + 1.2, playerState.z, 0xffd54f, 10);
      if (st.checkpointIdx >= 0) {
        showRaceToast('⭐⚡✨');
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
      spawnShockwave3D(mb.x, 1.3, mb.z, 0xe040fb, 3.6);
      spawn3DBurst(mb.x, 1.3, mb.z, 0xe040fb, 14);
      const roll = Math.floor(Math.random() * 3);
      if (roll === 0) triggerTurboBoost();
      else if (roll === 1) triggerStarMagnet();
      else triggerRainbowShell();
    }
  });

  // Update 3D Launch Ramps (launch into air + aerial speed surge without auto-invincibility!)
  boostPads.forEach((bp) => {
    if (
      !bp.triggered &&
      Math.abs(bp.z - playerState.z) < 2.2 &&
      Math.abs(bp.x - playerState.x) < 1.8
    ) {
      bp.triggered = true;
      playerState.speed = Math.max(playerState.speed, 31.5);
      triggerJumpGlide();
    }
  });

  // Check Player vs Destructible 3D Obstacles
  obstacles.forEach((obs) => {
    if (obs.hit) return;
    if (
      Math.abs(obs.z - playerState.z) < 1.95 &&
      Math.abs(obs.x - playerState.x) < 1.62 &&
      playerState.y < 1.35
    ) {
      handleObstacleCollision(obs);
    }
  });

  // Update 3D Chase Camera with Trauma Shake, FOV Kick, Zoom Whip & Dutch-Roll Jolt!
  const baseFov = playerState.turboTimer > 0 ? 68 : 58;
  camera.fov += (baseFov + camTrauma.fovKick - camera.fov) * Math.min(1, dt * 9);
  camera.updateProjectionMatrix();

  const shakePow = camTrauma.shake * camTrauma.shake;
  const shakeX = (Math.random() * 2 - 1) * shakePow * 0.72;
  const shakeY = (Math.random() * 2 - 1) * shakePow * 0.58;
  const shakeZ = (Math.random() * 2 - 1) * shakePow * 0.45;

  const camX = playerState.x * 0.58 + shakeX;
  const camY = Math.max(1.8, 4.35 + playerState.y * 0.45 + shakeY);
  const camZ = playerState.z + 8.6 + (camTrauma.zoomKick || 0) + shakeZ;
  camera.position.set(camX, camY, camZ);
  camera.lookAt(
    playerState.x * 0.75 + shakeX * 0.4,
    1.15 + playerState.y * 0.3 + camTrauma.pitchKick * 3.5,
    playerState.z - 12
  );
  camera.rotation.z += camTrauma.rollKick;

  dirLight.position.set(playerState.x + 20, 40, playerState.z + 25);
  dirLight.target.position.set(playerState.x, 0, playerState.z - 10);
  dirLight.target.updateMatrixWorld();

  // Update Top Race Progress Bar Markers & Live Rank HUD
  const progressPct = Math.max(0, Math.min(100, (Math.abs(playerState.z) / trackLen) * 100));
  document.getElementById('trackProgressFill').style.width = `${progressPct}%`;
  document.getElementById('playerMarker').style.left = `${progressPct}%`;

  rivals.forEach((r, idx) => {
    const rPct = r.finished ? 100 : Math.max(0, Math.min(100, (Math.abs(r.z) / trackLen) * 100));
    const el = document.getElementById(`rivalMarker${idx}`);
    if (el) el.style.left = `${rPct}%`;
  });

  updateLiveRankHud();

  if (playerState.z <= -trackLen) {
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
  if (playerLostRace) return; // Cannot advance if outside Top 3!
  document.getElementById('winModal').classList.add('hidden');
  if (currentWorld < CRITTERS.length - 1) {
    buildRaceWorld(currentWorld + 1);
  } else {
    const grid = document.getElementById('finaleGrid');
    if (grid) {
      grid.innerHTML = CRITTERS.map((c, idx) => {
        const stars = Math.max(1, cupStars[idx] || 1);
        return `
        <div class="finale-tile">
          <img src="${c.icon}" alt="" />
          <span>${'⭐'.repeat(stars)} ${c.badge}</span>
        </div>
      `;
      }).join('');
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
