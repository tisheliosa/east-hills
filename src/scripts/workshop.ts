/**
 * "The Workshop" — the interactive 3D centrepiece.
 *
 * Six objects representing the six trades, all built procedurally from
 * Three.js primitives. There are no model files, textures or HDR maps to
 * download: the studio lighting comes from a generated RoomEnvironment and the
 * "blueprint" look from EdgesGeometry outlines over brushed-metal materials.
 *
 * Loaded dynamically by Workshop3D.astro only when the canvas is on screen and
 * the visitor has not asked for reduced motion.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export type ModelKey = 'switchboard' | 'fridge' | 'aircon' | 'hotwater' | 'deck' | 'laminate';

export interface WorkshopHandle {
  show(key: ModelKey): void;
  destroy(): void;
}

/* ------------------------------------------------------------------ config */

const FRAME_TARGET = 2.45; // every model is normalised to this max dimension
const AUTO_SPIN = 0.0032; // radians per frame when idle
const DAMPING = 0.92;
const TILT_MIN = -0.42;
const TILT_MAX = 0.62;

/* --------------------------------------------------------------- materials */

const materials = {
  shell: new THREE.MeshStandardMaterial({ color: 0xdcdad3, metalness: 0.3, roughness: 0.45 }),
  shellLight: new THREE.MeshStandardMaterial({ color: 0xefeee8, metalness: 0.18, roughness: 0.52 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb4b8bd, metalness: 0.94, roughness: 0.28 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1e1e1c, metalness: 0.5, roughness: 0.55 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb4530a, metalness: 0.86, roughness: 0.33 }),
  timber: new THREE.MeshStandardMaterial({ color: 0x9c6b3e, metalness: 0.02, roughness: 0.74 }),
  timberAlt: new THREE.MeshStandardMaterial({ color: 0x855629, metalness: 0.02, roughness: 0.78 }),
  // Semi-transparent physical material rather than true transmission: it reads
  // convincingly as glass, costs far less to render, and behaves correctly
  // against the transparent canvas background.
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xdfeaea,
    metalness: 0,
    roughness: 0.06,
    transparent: true,
    opacity: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
  }),
  smoked: new THREE.MeshPhysicalMaterial({
    color: 0x9aa3a3,
    metalness: 0.1,
    roughness: 0.12,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  }),
};

const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0x0b0b0a,
  transparent: true,
  opacity: 0.2,
});

/* ----------------------------------------------------------------- helpers */

type Mat = THREE.Material;

function box(w: number, h: number, d: number, mat: Mat, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  return mesh;
}

function rbox(w: number, h: number, d: number, r: number, mat: Mat, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
  mesh.position.set(x, y, z);
  return mesh;
}

function cyl(
  radius: number,
  height: number,
  mat: Mat,
  x = 0,
  y = 0,
  z = 0,
  segments = 24,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), mat);
  mesh.position.set(x, y, z);
  return mesh;
}

/** Adds thin outline edges — the "technical drawing" layer of the look. */
function edged(mesh: THREE.Mesh, threshold = 30): THREE.Mesh {
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry, threshold),
    edgeMaterial,
  );
  mesh.add(lines);
  return mesh;
}

/**
 * Centres a model on the origin and scales it so every object reads at a
 * consistent size, no matter what units it was modelled in.
 */
function normalize(model: THREE.Group): THREE.Group {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());

  model.position.sub(center);

  const outer = new THREE.Group();
  outer.add(model);
  outer.scale.setScalar(FRAME_TARGET / Math.max(size.x, size.y, size.z));
  return outer;
}

/* ------------------------------------------------------------------ models */

/**
 * Upright commercial display fridge with a glass door.
 *
 * Built as a hollow shell from five panels rather than one solid box, so the
 * interior and shelves are actually visible through the glass door.
 */
function buildFridge(): THREE.Group {
  const g = new THREE.Group();

  const W = 1.34;
  const H = 2;
  const D = 0.78;
  const t = 0.055;

  // Carcass panels: back, sides, top, floor.
  g.add(edged(box(W, H, t, materials.shell, 0, 0, -D / 2 + t / 2)));
  g.add(edged(box(t, H, D, materials.shell, -W / 2 + t / 2, 0, 0)));
  g.add(edged(box(t, H, D, materials.shell, W / 2 - t / 2, 0, 0)));
  g.add(edged(box(W, t, D, materials.shell, 0, H / 2 - t / 2, 0)));
  g.add(edged(box(W, t, D, materials.shell, 0, -H / 2 + t / 2, 0)));

  // Interior shelves, now genuinely visible behind the glass.
  for (let i = 0; i < 4; i++) {
    g.add(box(W - t * 2 - 0.02, 0.028, D - t - 0.12, materials.steel, 0, -0.6 + i * 0.4, 0.02));
  }

  // Canopy above and kick plate below.
  g.add(edged(box(W + 0.02, 0.17, D + 0.02, materials.dark, 0, H / 2 + 0.085, 0)));
  g.add(box(0.94, 0.04, 0.012, materials.copper, 0, H / 2 + 0.085, D / 2 + 0.016));
  g.add(edged(box(W + 0.02, 0.15, D + 0.02, materials.dark, 0, -H / 2 - 0.075, 0)));

  // Door frame, then the glass panel inside it.
  const fw = 1.24;
  const fh = 1.84;
  const fr = 0.075;
  const dz = D / 2 + 0.02;
  g.add(box(fw, fr, 0.07, materials.steel, 0, fh / 2 - fr / 2, dz));
  g.add(box(fw, fr, 0.07, materials.steel, 0, -fh / 2 + fr / 2, dz));
  g.add(box(fr, fh, 0.07, materials.steel, -fw / 2 + fr / 2, 0, dz));
  g.add(box(fr, fh, 0.07, materials.steel, fw / 2 - fr / 2, 0, dz));
  g.add(box(fw - fr * 2, fh - fr * 2, 0.022, materials.glass, 0, 0, dz));

  // Vertical pull handle on standoffs, set near the opening edge.
  g.add(cyl(0.024, 1.5, materials.steel, 0.52, 0, dz + 0.11));
  for (const y of [0.66, -0.66]) {
    const arm = cyl(0.018, 0.1, materials.steel, 0.52, y, dz + 0.06);
    arm.rotation.x = Math.PI / 2;
    g.add(arm);
  }

  for (const x of [-0.54, 0.54]) {
    for (const z of [-0.28, 0.28]) {
      g.add(cyl(0.042, 0.09, materials.dark, x, -H / 2 - 0.19, z, 12));
    }
  }

  return g;
}

/** Wall-mounted split-system head unit. */
function buildAircon(): THREE.Group {
  const g = new THREE.Group();

  const W = 2.1;
  const H = 0.6;
  const D = 0.42;
  const cy = 0.3; // body centre height

  g.add(edged(rbox(W, H, D, 0.1, materials.shellLight, 0, cy, 0)));

  // Wall mounting plate behind the unit.
  g.add(box(1.72, 0.46, 0.05, materials.dark, 0, cy, -D / 2 - 0.02));

  // Recessed intake grille on the top face: a dark inset with light ribs over
  // it, which reads as slots rather than as painted-on panels.
  g.add(box(1.66, 0.02, 0.26, materials.dark, 0, cy + H / 2 - 0.012, -0.02));
  for (let i = 0; i < 7; i++) {
    g.add(box(1.66, 0.022, 0.018, materials.shellLight, 0, cy + H / 2 - 0.004, -0.14 + i * 0.04));
  }

  // Air outlet: a deep dark recess so the angled louvre blades in front of it
  // actually read as blades rather than as a flat white slab.
  g.add(box(1.8, 0.2, 0.12, materials.dark, 0, cy - H / 2 + 0.08, D / 2 - 0.09));
  for (let i = 0; i < 2; i++) {
    const blade = box(1.74, 0.03, 0.17, materials.shellLight, 0, cy - H / 2 + 0.14 - i * 0.085, D / 2 - 0.05);
    blade.rotation.x = -0.62;
    g.add(blade);
  }

  // Panel seam plus a short copper accent, all inset from the rounded corners
  // so nothing pokes past the body silhouette.
  g.add(box(1.86, 0.008, 0.004, materials.steel, 0, cy + 0.04, D / 2 + 0.002));
  g.add(box(0.34, 0.016, 0.006, materials.copper, -0.76, cy + 0.04, D / 2 + 0.004));
  g.add(box(0.16, 0.045, 0.008, materials.dark, 0.74, cy - 0.12, D / 2 + 0.003));

  // Refrigerant pipework leaving the right-hand side.
  const pipe = cyl(0.04, 0.34, materials.steel, W / 2 + 0.09, 0.08, -0.12);
  pipe.rotation.z = Math.PI / 2;
  g.add(pipe);
  const lagging = cyl(0.055, 0.16, materials.shell, W / 2 + 0.02, 0.08, -0.12);
  lagging.rotation.z = Math.PI / 2;
  g.add(lagging);

  return g;
}

/** Electric storage hot water cylinder with elbow pipework. */
function buildHotWater(): THREE.Group {
  const g = new THREE.Group();

  const R = 0.52;
  const HH = 0.78; // half the cylindrical body height

  g.add(cyl(R, HH * 2, materials.shell, 0, 0, 0, 44));

  // Flattened domes — a storage cylinder, not a gas bottle.
  const domeGeo = new THREE.SphereGeometry(R, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const top = new THREE.Mesh(domeGeo, materials.shell);
  top.position.y = HH;
  top.scale.y = 0.42;
  g.add(top);
  const base = new THREE.Mesh(domeGeo, materials.shell);
  base.position.y = -HH;
  base.scale.y = 0.42;
  base.rotation.x = Math.PI;
  g.add(base);

  const domeH = R * 0.42;

  // Fine jacket seams. Deliberately steel rather than copper: bright rings at
  // this scale read as plastic hoops and cheapen the whole object.
  for (const y of [0.36, -0.36]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R + 0.002, 0.009, 8, 48), materials.steel);
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
  }

  // Top cap, sitting clear of the dome.
  g.add(cyl(0.26, 0.1, materials.dark, 0, HH + domeH + 0.04, 0, 28));

  // Flow and return pipes with elbows turning outward.
  for (const [i, x] of [-0.22, 0.22].entries()) {
    const baseY = HH + domeH + 0.09;
    g.add(cyl(0.045, 0.3, materials.steel, x, baseY + 0.15, 0, 16));
    const elbow = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.045, 10, 22, Math.PI / 2),
      materials.steel,
    );
    elbow.position.set(x, baseY + 0.3, 0);
    elbow.rotation.set(Math.PI / 2, 0, i === 0 ? Math.PI : Math.PI / 2);
    g.add(elbow);
    const run = cyl(0.045, 0.22, materials.steel, x + (i === 0 ? -0.11 : 0.11), baseY + 0.4, 0, 16);
    run.rotation.z = Math.PI / 2;
    g.add(run);
  }

  // Pressure relief valve on the shoulder.
  const valve = cyl(0.05, 0.2, materials.copper, 0.34, HH - 0.02, 0.3, 14);
  valve.rotation.set(0.4, 0, -0.6);
  g.add(valve);

  // Element access cover and rating plate.
  g.add(edged(box(0.3, 0.2, 0.02, materials.dark, 0, 0.06, R + 0.005)));
  g.add(cyl(0.13, 0.05, materials.steel, 0, -0.42, R - 0.02, 20));

  return g;
}

/** Switchboard enclosure with breaker rows behind a smoked door. */
function buildSwitchboard(): THREE.Group {
  const g = new THREE.Group();

  g.add(edged(rbox(1.5, 1.16, 0.34, 0.03, materials.shell)));
  g.add(box(1.36, 1.02, 0.02, materials.dark, 0, 0, 0.1));

  // Two DIN rails of breakers.
  for (const railY of [0.24, -0.14]) {
    g.add(box(1.26, 0.055, 0.05, materials.steel, 0, railY - 0.17, 0.12));
    for (let i = 0; i < 9; i++) {
      const x = -0.56 + i * 0.14;
      g.add(box(0.115, 0.3, 0.15, materials.shellLight, x, railY, 0.16));
      g.add(box(0.055, 0.075, 0.04, materials.copper, x, railY + 0.07, 0.24));
    }
  }

  g.add(box(1.26, 0.05, 0.025, materials.copper, 0, -0.45, 0.12));

  // Door, hinged open on the left so the breakers stay visible.
  const door = new THREE.Group();
  const panel = rbox(1.5, 1.16, 0.045, 0.03, materials.smoked, 0.75, 0, 0);
  door.add(panel);
  door.add(cyl(0.022, 0.2, materials.steel, 1.4, 0, 0.06, 12));
  door.position.set(-0.75, 0, 0.19);
  door.rotation.y = -1.15;
  g.add(door);

  return g;
}

/** Timber deck section showing framing, posts and a step. */
function buildDeck(): THREE.Group {
  const g = new THREE.Group();

  // Deck boards with a visible expansion gap.
  for (let i = 0; i < 7; i++) {
    const z = -0.9 + i * 0.3;
    g.add(edged(box(2.2, 0.07, 0.26, i % 2 ? materials.timber : materials.timberAlt, 0, 0, z)));
    // Fixing screws, two per board.
    for (const x of [-0.78, 0.78]) {
      g.add(cyl(0.018, 0.012, materials.steel, x, 0.04, z, 8));
    }
  }

  // Joists running under the boards, then bearers under those.
  for (const x of [-0.82, 0, 0.82]) {
    g.add(edged(box(0.11, 0.17, 1.95, materials.timberAlt, x, -0.13, 0)));
  }
  for (const z of [-0.82, 0.82]) {
    g.add(edged(box(2.3, 0.12, 0.12, materials.timberAlt, 0, -0.28, z)));
  }

  // Posts.
  for (const x of [-0.95, 0.95]) {
    for (const z of [-0.82, 0.82]) {
      g.add(edged(box(0.15, 0.5, 0.15, materials.timberAlt, x, -0.6, z)));
    }
  }

  // A single step off the front edge, tied back to the deck with side cheeks so
  // it reads as a step rather than a detached bench.
  for (let i = 0; i < 2; i++) {
    g.add(edged(box(1.12, 0.07, 0.26, materials.timber, 0, -0.3, 1.08 + i * 0.3)));
  }
  for (const x of [-0.52, 0.52]) {
    g.add(edged(box(0.09, 0.46, 0.72, materials.timberAlt, x, -0.42, 1.2)));
  }

  return g;
}

/** Laminate floor build-up with one plank lifted to show the click profile. */
function buildLaminate(): THREE.Group {
  const g = new THREE.Group();

  g.add(edged(box(2.5, 0.07, 2, materials.dark, 0, -0.1, 0.1)));
  g.add(box(2.42, 0.025, 1.92, materials.steel, 0, -0.05, 0.1));

  // Staggered plank rows, the way laminate is actually laid.
  const rows: Array<Array<[number, number]>> = [
    [
      [-0.65, 1.1],
      [0.62, 1.16],
    ],
    [
      [-0.9, 0.6],
      [0.15, 1.5],
    ],
    [
      [-0.55, 1.3],
      [0.72, 0.96],
    ],
  ];

  rows.forEach((row, r) => {
    const z = -0.48 + r * 0.48;
    row.forEach(([x, w], i) => {
      const mat = (r + i) % 2 ? materials.timber : materials.timberAlt;
      g.add(edged(box(w, 0.055, 0.44, mat, x, 0, z)));
    });
  });

  // One plank raised and angled mid-click, tongue edge exposed — the moment
  // that explains how laminate actually goes down.
  const lifted = new THREE.Group();
  lifted.add(edged(box(1.2, 0.055, 0.44, materials.timber)));
  lifted.add(box(1.2, 0.02, 0.045, materials.copper, 0, 0.002, -0.235));
  lifted.position.set(-0.1, 0.12, 0.9);
  lifted.rotation.set(-0.3, 0, 0.04);
  g.add(lifted);

  return g;
}

const builders: Record<ModelKey, () => THREE.Group> = {
  fridge: buildFridge,
  aircon: buildAircon,
  hotwater: buildHotWater,
  switchboard: buildSwitchboard,
  deck: buildDeck,
  laminate: buildLaminate,
};

/* -------------------------------------------------------------------- init */

export function createWorkshop(canvas: HTMLCanvasElement, initial: ModelKey): WorkshopHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(2.35, 1.45, 3.45);
  camera.lookAt(0, 0, 0);

  // Studio reflections from a generated environment — no HDR file needed.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const envMap = pmrem.fromScene(envScene, 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.68;

  const key = new THREE.DirectionalLight(0xffffff, 1.85);
  key.position.set(3.2, 4.4, 3.4);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe4ecf4, 0.7);
  fill.position.set(-3.4, 1.2, 2.2);
  scene.add(fill);

  // Kept deliberately weak and only lightly warm: a strong warm rim reads as a
  // brown stain on dark surfaces at grazing angles.
  const rim = new THREE.DirectionalLight(0xffe6cc, 0.45);
  rim.position.set(-1.6, 2.4, -3.6);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0xffffff, 0.32));

  const root = new THREE.Group();
  scene.add(root);

  // Models are built on first use rather than all six up front: constructing
  // them all at boot added ~200ms of blocking time for objects most visitors
  // never look at. Once built, a model stays in the scene so switching back is
  // instant and allocates nothing.
  const holders = new Map<ModelKey, THREE.Group>();

  function ensure(k: ModelKey): THREE.Group {
    let holder = holders.get(k);
    if (!holder) {
      holder = new THREE.Group();
      holder.add(normalize(builders[k]()));
      holder.visible = false;
      holder.scale.setScalar(0.001);
      holder.userData.presence = 0;
      root.add(holder);
      holders.set(k, holder);
    }
    return holder;
  }

  let active: ModelKey = initial;
  const first = ensure(active);
  first.visible = true;
  first.userData.presence = 1;
  first.scale.setScalar(1);

  /* --- interaction ---------------------------------------------------- */

  let rotY = -0.42;
  let rotX = 0.16;
  let targetRotX = 0.16;
  let velocity = 0;
  let dragging = false;
  let idle = true;
  let pointerId: number | null = null;
  let lastX = 0;
  let lastY = 0;

  const onPointerDown = (e: PointerEvent) => {
    dragging = true;
    idle = false;
    pointerId = e.pointerId;
    lastX = e.clientX;
    lastY = e.clientY;
    velocity = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    rotY += dx * 0.0085;
    velocity = dx * 0.0085;
    targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.005, TILT_MIN, TILT_MAX);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    canvas.style.cursor = 'grab';
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.style.cursor = 'grab';

  /* --- sizing --------------------------------------------------------- */

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    // Capped device pixel ratio: the visual gain above 2x is negligible and the
    // fill cost is not.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  /* --- loop ----------------------------------------------------------- */

  let frame = 0;
  let onScreen = true;
  let running = false;

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const tick = () => {
    frame = requestAnimationFrame(tick);

    if (!dragging) {
      if (Math.abs(velocity) > 0.0004) {
        rotY += velocity;
        velocity *= DAMPING;
      } else if (idle) {
        rotY += AUTO_SPIN;
      } else {
        // Resume the idle drift a moment after the visitor lets go.
        idle = true;
      }
    }

    rotX += (targetRotX - rotX) * 0.08;
    root.rotation.y = rotY;
    root.rotation.x = rotX;

    // Animate model presence (scale in/out) for the swap transition.
    holders.forEach((holder, k) => {
      const target = k === active ? 1 : 0;
      const p = holder.userData.presence as number;
      const next = p + (target - p) * 0.16;
      holder.userData.presence = next;
      holder.visible = next > 0.004;
      holder.scale.setScalar(Math.max(easeOut(next), 0.001));
      holder.position.y = (1 - next) * -0.45;
    });

    renderer.render(scene, camera);
  };

  const start = () => {
    if (running) return;
    running = true;
    frame = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  // Never burn frames on an offscreen canvas or a hidden tab.
  const visibility = new IntersectionObserver(
    (entries) => {
      onScreen = entries[0]?.isIntersecting ?? false;
      if (onScreen && !document.hidden) start();
      else stop();
    },
    { threshold: 0.01 },
  );
  visibility.observe(canvas);

  const onVisibilityChange = () => {
    if (document.hidden || !onScreen) stop();
    else start();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  start();

  return {
    show(k: ModelKey) {
      if (!(k in builders)) return;
      ensure(k);
      active = k;
      // A nudge on switch so the new object arrives with a little momentum.
      velocity = 0.02;
      idle = false;
      if (onScreen && !document.hidden) start();
    },
    destroy() {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) obj.geometry.dispose();
      });
      Object.values(materials).forEach((m) => m.dispose());
      edgeMaterial.dispose();
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
