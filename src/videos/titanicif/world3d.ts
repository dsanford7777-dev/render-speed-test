// "What If You Were the Only One Who Knew the Titanic Would Sink?" (Paradox Town Explained #4): the three.js world, posed
// per frame from a shot spec (story3d.ts). An open ocean with: the Titanic (hull, superstructure, four funnels, masts
// with the crow's nest and its bell, the boat deck with sixteen lifeboats, lit windows), Southampton's quay alongside
// her, the iceberg and loose floes, a second steamer (the Californian / the Carpathia), a ship's room redressed by its
// wall sign (bridge, wireless room), boats in the water, and flat cards for paper, ice and sparks.
// Ship space: bow toward +x, y up from the waterline, cameras mostly on the -z side (so the bow is screen left).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit, quad, tri } from "../bridge/build";
import { ctex, cobbleHD, planksHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { Board, INK } from "../dst/props";
import { buildSalon, Salon, signTex } from "../lustig/props";
import { numTex, sparkTex, Cards } from "../hertzlong/props3d";
import { FPS } from "./timeline";
import { V3, Rm, ROOM_O, DECK, NEST } from "./story3d";
import type { St3 } from "./story3d";
type Light = "day" | "golden" | "night";

// open sea: the fog starts far out so the whole ship reads from a distance
const DAY_SEA: LightPreset = { ...LIGHTS.day, fogNear: 160, fogFar: 1500 };
const GOLD_SEA: LightPreset = { ...LIGHTS.golden, fogNear: 160, fogFar: 1300 };
const NIGHT_SEA: LightPreset = {
  az: 35, el: 58,
  lit: [0.66, 0.76, 1.22], shade: [0.11, 0.13, 0.28], lift: [0.03, 0.05, 0.13], lambert: 0.35, sideK: 0.84, term: 0.2,
  charTint: [0.78, 0.84, 1.1], charShade: 0.86, charGrad: 0.1, bodyGrad: 0.22, sideTint: [0.78, 0.82, 1.0],
  blob: [0.6, 0.62, 0.8], actorShadow: false,
  top: "#0b1533", hor: "#22366a", skyCurve: [0.0, 0.5, 0.6], fog: "#1b2a54", fogNear: 90, fogFar: 900, sunDisc: "#000000",
  sunCol: "#a9c0ff", sunI: 1.6, sky: "#2a3f73", ground: "#1a1f33", hemiI: 0.35,
  bias: -0.00025, normalBias: 0.015,
};
const NIGHT_LOOK: WorldLook = {
  sky: { c: ["#263a6e", "#1f3164", "#182955", "#111f46", "#0a1433"], e: [0, 3, 8, 16, 40] },
  water: { near: "#122a52", mid: "#0f2448", far: "#182f5c", crest: "#3f66a8", trough: "#08142e", glint: "#b9c9f5", shade: [0.5, 0.56, 0.72] },
  cloud: { lit: "#4a5f9c", mid: "#34477e", shade: "#243463" },
  bounce: [0, 0, 0], sat: 1.0,
};
const LP: Record<Light, LightPreset> = { day: DAY_SEA, golden: GOLD_SEA, night: NIGHT_SEA };
const LK: Record<Light, WorldLook> = { day: LOOK.day, golden: LOOK.golden, night: NIGHT_LOOK };

// ---------------- cast ----------------
const SUIT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#3a2a20", buttons: "#d9d4c8", skin: "#f5c9a0", ...extra });
const NAVY = "#1f2a44";
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** everyone the shots can place, by name. "you" is the viewer: red cap, blue jacket, white trainers, in every chapter. */
const OUT: Record<string, Who> = {
  you: who({ jacket: "#2f6fd0", pants: "#39405a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", skin: SKIN, buttons: "#f4f1ea" }, 41, "you"),
  smith: who(SUIT(NAVY, { hat: "cap", cap: "#f1ede2", moustache: "#e9e5dc", build: "stout", buttons: "#e8c45a", sash: undefined }), 42, "smith"),
  murdoch: who(SUIT(NAVY, { hat: "cap", cap: NAVY, buttons: "#e8c45a", skin: "#ecd0b6" }), 43, "murdoch"),
  officer: who(SUIT(NAVY, { hat: "cap", cap: NAVY, buttons: "#e8c45a", moustache: "#4a3020" }), 44, "officer"),
  helm: who(SUIT("#3a4a6a", { hat: "cap", cap: "#2b2f3d", skin: "#c99067" }), 45, "helm"),
  fleet: who(SUIT("#3f4656", { hat: "cap", cap: "#2b2f3d", skin: "#ecd0b6" }), 46, "fleet"),
  lee: who(SUIT("#4a4038", { hat: "cap", cap: "#4a4038", moustache: "#3a2a20" }), 47, "lee"),
  phillips: who(SUIT("#2b2f3d", { hair: "#4a3020", skin: "#f5c9a0", buttons: "#e8c45a" }), 48, "phillips"),
  bride: who(SUIT("#3a3038", { hair: "#1e1a20", skin: "#ecd0b6" }), 49, "bride"),
  andrews: who(SUIT("#5a4a3a", { hair: "#3a2a20", moustache: undefined, skin: "#f5c9a0" }), 50, "andrews"),
  man: who(SUIT("#6b4a2f", { hat: "fedora", cap: "#5a4a3a", moustache: "#6b4a2f" }), 51, "man"),
  gent: who(SUIT("#1d1b22", { hat: "tophat", moustache: "#8a8a92", build: "stout", buttons: "#e8c45a" }), 52, "gent"),
  lady: who(SUIT("#c25a7a", { hat: "bonnet", dress: "#c25a7a", skin: SKIN }), 53, "lady"),
  lady2: who(SUIT("#5a8fc2", { hat: "bonnet", dress: "#5a8fc2", skin: "#f5c9a0" }), 54, "lady2"),
  lady3: who(SUIT("#d9a441", { hat: "bonnet", dress: "#d9a441", skin: "#c99067" }), 55, "lady3"),
  mother: who(SUIT("#7b5ac9", { hat: "bonnet", dress: "#7b5ac9", skin: "#ecd0b6" }), 56, "mother"),
  kid: who({ jacket: "#f08a2c", pants: "#3b5b9a", boots: "#5a3b2a", hat: "cap", cap: "#7a5236", build: "kid" }, 57, "kid"),
  husband: who(SUIT("#3f5f4a", { hat: "tophat", moustache: "#2a201a" }), 58, "husband"),
  wife: who(SUIT("#a63d4c", { hat: "bonnet", dress: "#a63d4c", skin: SKIN }), 59, "wife"),
  worker: who(SUIT("#7a5236", { hat: "cap", cap: "#5a4a3a", skin: "#c99067", moustache: "#2a201a" }), 60, "worker"),
  worker2: who(SUIT("#4a6a9a", { hat: "cap", cap: "#2b2f3d", skin: "#f5c9a0" }), 61, "worker2"),
  gent2: who(SUIT("#4a5a7a", { hat: "tophat", moustache: "#b5462f", skin: SKIN }), 62, "gent2"),
  gent3: who(SUIT("#8a5a3a", { hat: "fedora", cap: "#3a2a20", skin: "#f0d2b0" }), 63, "gent3"),
  sailor: who(SUIT("#f1ede2", { hat: "cap", cap: "#f1ede2", pants: NAVY, skin: "#f5c9a0" }), 64, "sailor"),
};

const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const M = (key: string, col: string, extra: THREE.MeshLambertMaterialParameters = {}) => lam(key, () => ({ color: col, ...extra }));
const UNLIT = new Map<string, THREE.MeshBasicMaterial>();
const unlit = (key: string, tex: () => THREE.Texture) => { let m = UNLIT.get(key); if (!m) { m = new THREE.MeshBasicMaterial({ map: tex(), color: new THREE.Color(0.9, 0.9, 0.9) }); UNLIT.set(key, m); } return m; };

// ---------------- geometry helpers ----------------
/** pointed end of a hull in plan: from the flat face at x0 (half beam w) to the point at x1, between y0 and y1 */
const prow = (b: Batch, x0: number, x1: number, w: number, y0: number, y1: number, mat: THREE.Material, top?: THREE.Material) => {
  const A = V(x0, y0, -w), B = V(x1, y0, 0), C = V(x1, y1, 0), D = V(x0, y1, -w), E = V(x0, y0, w), F = V(x0, y1, w);
  b.add(quad(A, B, C, D), mat); b.add(quad(B, E, F, C), mat);
  if (top) b.add(x1 > x0 ? tri(D, F, C) : tri(F, D, C), top);
};
/** one small window quad on a wall facing -z / +z (s = -1 / 1) or +x (axis "x") */
const win = (b: Batch, mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, s: number, axis: "z" | "x" = "z") => {
  if (axis === "z") {
    const a = V(x - w / 2, y - h / 2, z), c = V(x + w / 2, y + h / 2, z);
    b.add(s < 0 ? quad(V(c.x, a.y, z), V(a.x, a.y, z), V(a.x, c.y, z), V(c.x, c.y, z)) : quad(V(a.x, a.y, z), V(c.x, a.y, z), V(c.x, c.y, z), V(a.x, c.y, z)), mat);
  } else b.add(quad(V(x, y - h / 2, z + w / 2), V(x, y - h / 2, z - w / 2), V(x, y + h / 2, z - w / 2), V(x, y + h / 2, z + w / 2)), mat);
};
const cylAt = (b: Batch, mat: THREE.Material, r0: number, r1: number, h: number, x: number, y: number, z: number, rake = 0, seg = 20, open = false) => {
  const g = new THREE.CylinderGeometry(r0, r1, h, seg, 1, open);
  g.translate(0, h / 2, 0);
  b.add(g, mat, new THREE.Matrix4().makeTranslation(x, y, z).multiply(new THREE.Matrix4().makeRotationZ(rake)));
};
/** a wooden lifeboat about 9 m long centred on the origin, keel at y = 0 */
const lifeboat = () => {
  const g = new THREE.Group(), b = new Batch();
  const white = M("ttBoat", "#f4f0e6", { side: THREE.DoubleSide }), rim = M("ttBoatRim", "#7a5236"), inside = M("ttBoatIn", "#c9a06a");
  b.add(boxGeo(V(-3.4, 0, -1.25), V(3.4, 1.15, 1.25), 0, true), white);
  prow(b, 3.4, 4.6, 1.25, 0, 1.15, white, rim); prow(b, -3.4, -4.6, 1.25, 0, 1.15, white, rim);
  b.add(boxGeo(V(-3.4, 1.15, -1.32), V(3.4, 1.24, -1.12)), rim); b.add(boxGeo(V(-3.4, 1.15, 1.12), V(3.4, 1.24, 1.32)), rim);
  b.add(boxGeo(V(-3.4, 0.55, -1.12), V(3.4, 0.6, 1.12)), inside);
  for (const x of [-2.6, -1.3, 0, 1.3, 2.6]) b.add(boxGeo(V(x - 0.14, 0.6, -1.12), V(x + 0.14, 0.95, 1.12)), rim);
  b.build(g);
  return g;
};
/** a small steamer about 110 m long (the Californian: one tall funnel, four masts; reused as the Carpathia) */
const steamer = () => {
  const g = new THREE.Group(), b = new Batch(), wb = new Batch();
  const black = M("ttHull2", "#23232b", { side: THREE.DoubleSide }), white = M("ttWhite", "#f1ede2"), deck = M("ttBrownDeck", "#a9825a");
  const funnel = new THREE.MeshLambertMaterial({ color: "#d9806a" }), winMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, side: THREE.DoubleSide });
  b.add(boxGeo(V(-48, -3, -6.5), V(46, 5, 6.5)), black);
  prow(b, 46, 56, 6.5, -3, 5, black, deck); prow(b, -48, -55, 6.5, -3, 5, black, deck);
  b.add(boxGeo(V(-48, 5, -6.4), V(46, 5.08, 6.4)), deck);
  b.add(boxGeo(V(-20, 5, -5.4), V(16, 8.2, 5.4)), white); b.add(boxGeo(V(-12, 8.2, -4.2), V(10, 10.6, 4.2)), white);
  cylAt(b, funnel, 1.7, 1.7, 9.5, -2, 10.6, 0, 0.08); cylAt(b, M("ttDark", "#1d1b22"), 1.74, 1.74, 2.6, -2.75, 19.9, 0, 0.08);
  for (const x of [34, 20, -26, -40]) cylAt(b, M("ttMast", "#7a5236"), 0.16, 0.26, 17, x, 5, 0, 0.05, 8);
  for (const s of [-1, 1]) {
    for (let x = -44; x <= 42; x += 3.2) win(wb, winMat, x, 2.2, s * 6.53, 0.5, 0.5, s);
    for (let x = -18; x <= 14; x += 2.4) win(wb, winMat, x, 6.6, s * 5.43, 0.9, 0.8, s);
    for (let x = -10; x <= 8; x += 2.4) win(wb, winMat, x, 9.4, s * 4.23, 0.9, 0.8, s);
  }
  b.build(g); wb.build(g, false);
  return { g, winMat, funnel };
};
const paperTex = () => ctex("ttSlip", 512, 320, (g) => {
  g.fillStyle = "#fff6dc"; g.fillRect(8, 8, 496, 304); g.lineWidth = 12; g.strokeStyle = INK; g.strokeRect(8, 8, 496, 304);
  g.fillStyle = "#c9373a"; g.fillRect(28, 28, 456, 52);
  g.fillStyle = INK; for (let k = 0; k < 4; k++) g.fillRect(40, 112 + k * 46, k === 3 ? 240 : 430, 16);
});
const iceTex = () => ctex("ttIceChunk", 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256); g.fillStyle = "#eaf4fb"; g.strokeStyle = INK; g.lineWidth = 12; g.lineJoin = "round";
  g.beginPath(); [[40, 150], [70, 60], [150, 34], [220, 100], [200, 196], [110, 226]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = "#9fc3e0"; g.lineWidth = 8; g.beginPath(); g.moveTo(80, 90); g.lineTo(140, 120); g.lineTo(120, 190); g.stroke();
});
const stackTex = () => ctex("ttPaperStack", 64, 256, (g) => {
  g.fillStyle = "#fff6dc"; g.fillRect(0, 0, 64, 256); g.fillStyle = "#b9ab8a"; for (let y = 4; y < 256; y += 8) g.fillRect(0, y, 64, 2);
});
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
type Pose = { expr: Expr };
void (null as unknown as Pose);

export class TWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private WU: Record<string, THREE.IUniform>;
  private sunDisc: THREE.Sprite; private stars: THREE.Points;
  private sunCache = new Map<number, THREE.Vector3>();
  private clouds: THREE.Mesh[] = []; private cloudMaps: Record<Light, THREE.Texture[]>;
  private ship = new THREE.Group(); private winMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, side: THREE.DoubleSide });
  private boat7: THREE.Group; private falls: THREE.Mesh[] = []; private bell: THREE.Group;
  private dock = new THREE.Group(); private berg = new THREE.Group(); private floes = new THREE.Group();
  private cal: { g: THREE.Group; winMat: THREE.MeshBasicMaterial; funnel: THREE.MeshLambertMaterial };
  private seaBoats: THREE.Group[] = [];
  private salon: Salon; private wheel: THREE.Group; private wheelRim: THREE.Group; private radio: THREE.Group; private stacks: THREE.Mesh[] = []; private rnum: Board;
  private papers: Cards; private ices: Cards; private sparks: Cards;
  private lastPeople: { name: string; p: V3; walking: boolean; low: boolean }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    void kit;
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1900, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    // stars for the moonless night (fixed pattern, upper sky only)
    const sp: number[] = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 520; i++) { const a = rnd() * Math.PI * 2, el = 0.1 + rnd() * 1.3, r = 1700; sp.push(r * Math.cos(el) * Math.cos(a), r * Math.sin(el), r * Math.cos(el) * Math.sin(a)); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color(1.5, 1.6, 2.0), size: 2.6, sizeAttenuation: false, fog: false, depthWrite: false }));
    this.stars.frustumCulled = false; this.stars.layers.set(NOINK); R.add(this.stars);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, NIGHT_LOOK.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 1150 + (i % 3) * 90, w = 230 + (i % 4) * 50;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 200 + (i % 4) * 60, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    // ---- the sea ----
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wFlow: { value: 0 }, wCalm: { value: 1 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", WATER_DECL).replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "titanicSea1";
    const wg = new THREE.PlaneGeometry(4200, 4200); wg.rotateX(-Math.PI / 2);
    const wm = new THREE.Mesh(wg, waterM); wm.receiveShadow = true; R.add(wm);

    // ---- the Titanic ----
    const S = this.ship; R.add(S);
    const b = new Batch(), wb = new Batch();
    const black = M("ttHull", "#23232b"), black2 = M("ttHull2", "#23232b", { side: THREE.DoubleSide }), white = M("ttWhite", "#f1ede2"), white2 = M("ttWhite2", "#f1ede2", { side: THREE.DoubleSide });
    const buff = M("ttBuff", "#e2a04e"), dark = M("ttDark", "#1d1b22"), wood = lam("ttDeck", () => ({ map: planksHD() })), mast = M("ttMast", "#7a5236"), grey = M("ttRoof", "#cfc8ba"), gold = M("ttGold", "#e8c45a");
    b.add(boxGeo(V(-125, -4, -14), V(115, 9.7, 14)), black);
    b.add(boxGeo(V(-125, 9.7, -14.03), V(115, 11, 14.03)), white);
    prow(b, 115, 136, 14, -4, 9.7, black2); prow(b, 115, 136, 14.03, 9.7, 11, white2, wood);
    prow(b, -125, -137, 14, -4, 9.7, black2); prow(b, -125, -137, 14.03, 9.7, 11, white2, wood);
    b.add(boxGeo(V(-125, 11, -13.9), V(-95, 11.06, 13.9), 4), wood); b.add(boxGeo(V(80, 11, -13.9), V(115, 11.06, 13.9), 4), wood);
    b.add(boxGeo(V(-95, 11, -13.6), V(80, DECK - 0.12, 13.6)), white);
    b.add(boxGeo(V(-95.3, DECK - 0.12, -13.85), V(80.3, DECK, 13.85), 4), wood);
    b.add(boxGeo(V(-85, DECK, -7.5), V(66, DECK + 3.1, 7.5)), white);
    b.add(boxGeo(V(-85.2, DECK + 3.1, -7.7), V(66.2, DECK + 3.25, 7.7)), grey);
    b.add(boxGeo(V(68, DECK, -11), V(76, DECK + 3.2, 11)), white); b.add(boxGeo(V(67.8, DECK + 3.2, -11.2), V(76.2, DECK + 3.34, 11.2)), grey);
    for (const x of [52, 18, -16, -50]) {
      const y0 = DECK + 3.25, rake = 0.14, h = 14, dx = -Math.sin(rake) * h, dy = Math.cos(rake) * h;
      cylAt(b, buff, 3.4, 3.4, h, x, y0, 0, rake, 28); cylAt(b, dark, 3.46, 3.46, 4.6, x + dx, y0 + dy, 0, rake, 28);
    }
    cylAt(b, mast, 0.3, 0.5, 34, 97, 11, 0, 0.07, 10); cylAt(b, mast, 0.3, 0.5, 32, -104, 11, 0, 0.07, 10);
    // crow's nest (a tub on the front of the foremast) and its bell
    cylAt(b, white2, 1.05, 0.9, 1.15, NEST[0], NEST[1], 0, 0, 18, true);
    cylAt(b, grey, 0.9, 0.9, 0.06, NEST[0], NEST[1], 0, 0, 18);
    b.add(boxGeo(V(NEST[0] + 0.1, NEST[1] + 2.75, -0.05), V(NEST[0] + 0.95, NEST[1] + 2.83, 0.05)), dark);
    this.bell = new THREE.Group(); this.bell.position.set(NEST[0] + 0.85, NEST[1] + 2.75, 0);
    const bl = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.34, 14, 1, true), gold); bl.position.y = -0.2; (bl.material as THREE.Material).side = THREE.DoubleSide;
    const clap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), dark); clap.position.y = -0.38;
    this.bell.add(bl, clap); S.add(this.bell);
    // rails round the boat deck
    for (const s of [-1, 1]) {
      b.add(boxGeo(V(-95, DECK + 1.02, s * 13.8 - 0.04), V(80, DECK + 1.1, s * 13.8 + 0.04)), white);
      b.add(boxGeo(V(-95, DECK + 0.5, s * 13.8 - 0.025), V(80, DECK + 0.55, s * 13.8 + 0.025)), white);
      for (let x = -95; x <= 80; x += 2.5) b.add(boxGeo(V(x - 0.04, DECK, s * 13.8 - 0.04), V(x + 0.04, DECK + 1.05, s * 13.8 + 0.04)), white);
    }
    // sixteen lifeboats on chocks with their davits; the one the story lowers is a separate, movable boat
    const proto = lifeboat();
    for (const s of [-1, 1]) for (const x of BOAT_X) {
      for (const dx of [-3.9, 3.9]) {
        b.add(boxGeo(V(x + dx - 0.1, DECK, s * 13.45 - 0.1), V(x + dx + 0.1, DECK + 3.1, s * 13.45 + 0.1)), white);
        b.add(boxGeo(V(x + dx - 0.08, DECK + 3.02, Math.min(s * 13.4, s * 15.6)), V(x + dx + 0.08, DECK + 3.18, Math.max(s * 13.4, s * 15.6))), white);
      }
      if (s < 0 && x === BOAT7_X) continue;
      b.addObject(proto, new THREE.Matrix4().makeTranslation(x, DECK + 0.25, s * 12.3));
    }
    this.boat7 = lifeboat(); S.add(this.boat7);
    for (const dx of [-3.9, 3.9]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.05), dark); f.userData.dx = dx; this.falls.push(f); S.add(f); }
    // windows: portholes down the hull, big windows along the superstructure and the deckhouse, the bridge front
    for (const s of [-1, 1]) {
      for (let x = -120; x <= 111; x += 3) { win(wb, this.winMat, x, 4.4, s * 14.03, 0.55, 0.55, s); win(wb, this.winMat, x + 1.5, 7.3, s * 14.03, 0.55, 0.55, s); }
      for (let x = -93; x <= 78; x += 2.4) { win(wb, this.winMat, x, 12.5, s * 13.63, 1.05, 0.9, s); win(wb, this.winMat, x, 14.9, s * 13.63, 1.05, 0.9, s); }
      for (let x = -83; x <= 64; x += 3) win(wb, this.winMat, x, DECK + 1.75, s * 7.53, 1.2, 1.05, s);
    }
    for (let z = -9.6; z <= 9.6; z += 1.6) win(wb, this.winMat, 76.03, DECK + 2.05, z, 1.1, 0.9, 1, "x");
    b.build(S); wb.build(S, false);

    // ---- Southampton: the quay alongside (on the -z side), a long shed, bollards, crates, the gangway ----
    const D = this.dock; R.add(D);
    const db = new Batch(), cobble = lam("cobbleHD", () => ({ map: cobbleHD() })), brick = M("ttBrick", "#a8553f"), roof = M("ttShedRoof", "#5a4f58"), crate = M("ttCrate", "#b5866a");
    db.add(boxGeo(V(-190, -4, -90), V(190, QUAY, -16.2), 4), cobble);
    db.add(boxGeo(V(-170, QUAY, -78), V(170, QUAY + 8, -52), 0), brick); db.add(boxGeo(V(-172, QUAY + 8, -80), V(172, QUAY + 8.6, -50)), roof);
    for (let x = -160; x <= 160; x += 16) cylAt(db, dark, 0.32, 0.4, 0.7, x, QUAY, -17.4, 0, 12);
    for (const [x, z, n] of [[-34, -40, 3], [-30, -42, 2], [46, -44, 3], [50, -41, 1], [-70, -38, 2], [84, -40, 2]] as const)
      for (let k = 0; k < n; k++) db.add(boxGeo(V(x - 0.9, QUAY + k * 1.5, z - 0.9), V(x + 0.9, QUAY + 1.5 + k * 1.5, z + 0.9)), crate);
    const ramp = new THREE.BoxGeometry(1.6, 0.14, 7.2); ramp.rotateX(Math.atan2(5.2 - QUAY, 5.4)); ramp.translate(GANG_X, (5.2 + QUAY) / 2, -16.6);
    db.add(ramp, crate);
    db.build(D);
    const sgn = new Board(14, 2.6, "tt_soton", () => signTex("tt_soton", "WHITE STAR LINE · SOUTHAMPTON", "#2f2a3a", "#e8c45a")); sgn.group.position.set(0, QUAY + 5.6, -51.9); D.add(sgn.group);

    // ---- the iceberg, and loose floes ----
    const ice = M("ttIce", "#e6f0fa"), ice2 = M("ttIce2", "#c7dbee");
    const pk = (r: number, h: number, x: number, z: number, m: THREE.Material, seg = 6, rot = 0) => { const g = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m); g.position.set(x, h / 2 - 1, z); g.rotation.y = rot; g.castShadow = true; g.receiveShadow = true; this.berg.add(g); };
    pk(15, 24, 0, 0, ice, 6, 0.3); pk(11, 15, 11, 4, ice2, 5, 1.1); pk(9, 11, -10, -3, ice, 5, 0.6); pk(13, 6, 3, -8, ice2, 7, 0.2); pk(8, 8, -4, 9, ice2, 5, 2.0);
    R.add(this.berg);
    for (let i = 0; i < 46; i++) {
      const a = rnd() * Math.PI * 2, d = 20 + rnd() * 190, w = 2 + rnd() * 7;
      const f = new THREE.Mesh(new THREE.CylinderGeometry(w, w * 1.1, 0.9, 6), i % 2 ? ice : ice2); f.position.set(Math.cos(a) * d, 0.1, Math.sin(a) * d); f.rotation.y = rnd() * 3; f.scale.z = 0.6 + rnd() * 0.5; f.receiveShadow = true;
      this.floes.add(f);
    }
    R.add(this.floes);
    // ---- the other steamer, and boats in the water ----
    this.cal = steamer(); R.add(this.cal.g);
    for (let i = 0; i < 6; i++) { const sb = lifeboat(); sb.visible = false; R.add(sb); this.seaBoats.push(sb); }

    // ---- the room: a roofed salon whose wall sign is swapped per shot, a ship's wheel, the wireless set, paper ----
    this.salon = buildSalon(R, ROOM_O[0], ROOM_O[1], ROOM_O[2]);
    this.salon.archSign.visible = false;
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 24), M("ttCeil", "#e9dcc0")); ceil.position.set(ROOM_O[0], ROOM_O[1] + 4.55, ROOM_O[2] - 4); ceil.castShadow = false; R.add(ceil);
    const back = new THREE.Mesh(new THREE.BoxGeometry(60, 30, 0.3), M("ttDark", "#1d1b22")); back.position.set(ROOM_O[0], ROOM_O[1] + 6, ROOM_O[2] - 22); back.castShadow = false; R.add(back);
    this.wheel = new THREE.Group(); this.wheelRim = new THREE.Group();
    const wd = M("ttWheel", "#8a5a3a");
    this.wheelRim.add(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 10, 32), wd));
    for (let k = 0; k < 8; k++) { const sp2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.3, 0.05), wd); sp2.rotation.z = (k / 8) * Math.PI; if (k < 4) this.wheelRim.add(sp2); }
    this.wheelRim.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12).rotateX(Math.PI / 2), gold));
    this.wheelRim.position.set(0, 1.2, -0.12);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.2, 0.3), wd); ped.position.y = 0.6;
    this.wheel.add(ped, this.wheelRim); this.wheel.traverse((o) => { o.castShadow = true; }); this.wheel.position.set(...Rm(WHEEL_X, 0, 0.75)); R.add(this.wheel);
    this.radio = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.6), wd); base.position.y = 0.06;
    const coil = (x: number) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.34, 16), M("ttCopper", "#d98a3a")); c.position.set(x, 0.29, 0.05); return c; };
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.08), gold); key.position.set(0.2, 0.2, -0.2); key.rotation.z = 0.12;
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), dark); knob.position.set(0.4, 0.25, -0.2);
    this.radio.add(base, coil(-0.3), coil(0.02), key, knob); this.radio.traverse((o) => { o.castShadow = true; }); this.radio.position.set(...Rm(0.5, 0.8, 0.6)); R.add(this.radio);
    for (let k = 0; k < 4; k++) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.22), lam("ttPaperStack", () => ({ map: stackTex() }))); st.position.set(...Rm(1.5 + k * 0.5, 0.8, 0.6)); st.castShadow = true; this.stacks.push(st); R.add(st); }
    this.rnum = new Board(1.9, 1.2, "num_SOS", () => numTex("SOS")); this.rnum.group.position.set(...Rm(0.5, 2.15, 3.38)); R.add(this.rnum.group);
    this.papers = new Cards(R, paperTex(), 16, 0.6); this.ices = new Cards(R, iceTex(), 10, 0.5); this.sparks = new Cards(R, sparkTex(), 6, 1.0);
  }

  private shotSun(id: number, L: LightPreset, sample: (f: number) => { pos: V3; look: V3 }, a: number, b: number) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = a; f < b; f += 3) { const c = sample(f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose the world for shot `id` (spec st) at frame f; sample(f) gives the shot's camera at any frame (for the sun) */
  update(id: number, st: St3, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene, sample: (f: number) => { pos: V3; look: V3 }, a: number, b: number) {
    const t = f / FPS, light: Light = st.light, L = LP[light], K = LK[light];
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 4000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...(st.focus ?? c.look)), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- lights ----
    const sunDir = this.shotSun(id, L, sample, a, b);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 260);
    if (light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 420); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 900; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position); this.stars.position.copy(cam.position); this.stars.visible = light === "night";
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = light === "golden";
    if (this.sunDisc.visible) { this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 1500); this.sunDisc.scale.setScalar(2 * 1500 * Math.tan(THREE.MathUtils.degToRad(1.7))); }
    for (let i = 0; i < this.clouds.length; i++) { const m = this.clouds[i]; m.visible = light !== "night"; m.lookAt(cam.position.x, m.position.y, cam.position.z); (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[light][i % 4]; }
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wFlow.value = (st.flow ?? 0.35) * t; W.wCalm.value = light === "night" ? 0.45 : 1;

    // ---- the ship ----
    const sh = st.ship ?? {}, S = this.ship;
    S.visible = !sh.hide;
    S.position.set(0, -(sh.sink ?? 0), 0); S.rotation.set(0, sh.yaw ?? 0, sh.pitch ?? 0);
    const lit = sh.lights ?? 1;
    if (light === "night") this.winMat.color.setRGB(0.25 + 3.1 * lit, 0.22 + 2.3 * lit, 0.2 + 1.0 * lit); else if (light === "golden") this.winMat.color.setRGB(1.6, 1.0, 0.5); else this.winMat.color.setRGB(0.2, 0.28, 0.38);
    const bt = st.boat ?? { out: 0, drop: 0 };
    this.boat7.position.set(BOAT7_X, DECK + 0.25 + 0.5 * bt.out - bt.drop, -12.3 - 3.0 * bt.out);
    this.falls.forEach((fl) => { const top = DECK + 3.02, y = this.boat7.position.y + 1.2, len = Math.max(0.05, top - y); fl.visible = bt.out > 0.5; fl.scale.set(1, len, 1); fl.position.set(BOAT7_X + (fl.userData.dx as number), y + len / 2, -15.3); });
    this.bell.rotation.z = st.bell ?? 0;
    this.dock.visible = !!st.dock;
    const bg = st.berg;
    this.berg.visible = !!bg; if (bg) { this.berg.position.set(...bg.p); this.berg.scale.setScalar(bg.s ?? 1); this.berg.rotation.y = bg.yaw ?? 0; }
    this.floes.visible = !!st.floes; if (st.floes) this.floes.position.set(...st.floes);
    const cl = st.cal;
    this.cal.g.visible = !!cl;
    if (cl) {
      this.cal.g.position.set(...cl.p); this.cal.g.rotation.y = cl.yaw ?? 0;
      this.cal.funnel.color.set(cl.kind === "carp" ? "#c9373a" : "#d9806a");
      const k = cl.lights;
      if (light === "night") this.cal.winMat.color.setRGB(0.2 + 3.0 * k, 0.2 + 2.2 * k, 0.2 + 1.0 * k); else this.cal.winMat.color.setRGB(light === "golden" ? 1.5 : 0.2, light === "golden" ? 0.95 : 0.28, light === "golden" ? 0.5 : 0.38);
    }
    this.seaBoats.forEach((sb, i) => { const p = st.seaBoats?.[i]; sb.visible = !!p; if (p) { sb.position.set(p[0], p[1] - 0.45 + 0.08 * Math.sin(t * 1.3 + i), p[2]); sb.rotation.set(0, i * 0.9 + 0.3, 0.03 * Math.sin(t * 1.1 + i * 2)); } });
    // ---- the room ----
    const rm = st.room;
    if (rm) {
      const [key, text] = rm.sign;
      const mat = lam(`sign_${key}`, () => ({ map: signTex(key, text, "#2f2a3a", "#e8c45a") }));
      if (this.salon.sign.material !== mat) this.salon.sign.material = mat;
    }
    this.wheel.visible = rm?.wheel !== undefined; this.wheelRim.rotation.z = rm?.wheel ?? 0;
    this.radio.visible = !!rm?.radio;
    this.stacks.forEach((s2, i) => { const n = 0.55 * (rm?.papers?.[i] ?? 0); s2.visible = n > 0.01; s2.scale.y = Math.max(0.01, n); s2.position.y = ROOM_O[1] + 0.8 + n / 2; });
    const rn = rm?.num;
    if (rn) this.rnum.face.material = unlit(`num_${rn.text}_${rn.bg ?? ""}_${rn.fg ?? ""}`, () => numTex(rn.text, rn.bg, rn.fg));
    this.rnum.group.visible = !!rn && (rn.k ?? 1) > 0.001; this.rnum.group.scale.setScalar(Math.max(0.001, rn ? rn.k ?? 1 : 1));
    // ---- cards ----
    this.papers.hide(); this.ices.hide(); this.sparks.hide();
    let np = 0, ni = 0, ns = 0;
    for (const cd of st.cards ?? []) {
      if (cd.kind === "paper") this.papers.put(np++, V(...cd.p), cam, cd.spin, cd.s);
      else if (cd.kind === "ice") this.ices.put(ni++, V(...cd.p), cam, cd.spin, cd.s);
      else this.sparks.put(ns++, V(...cd.p), cam, cd.spin, cd.s);
    }

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.man }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, walking: !!q.side, low: !!q.low }));
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed);
      // side cards are drawn walking toward canvas right; walkers move along world x, so flip by where +x is on screen
      const mirror = !!q.side && (q.side.mirror !== (right.x < 0));
      const lt = mirror ? Math.PI - lightA : lightA;
      const key = q.side
        ? `S|${w.key}|${q.expr}|${Math.round(q.side.phase * 16)}|${bl}|${lt.toFixed(2)}`
        : `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${lt.toFixed(2)}`;
      act.r = this.pool.req(key, cw, ch, kk, (p: Pen) => q.side
        ? bodySide(p, w.o, { mode: "march", phase: Math.round(q.side.phase * 16) / 16, expr: q.expr, blink: bl, stride: q.side.stride ?? 0.8, stomp: 0.4, light: lt, seed: w.seed })
        : bodyFront(p, w.o, { mode: "stand", expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: q.wave, light: lt, seed: w.seed }));
      act.mesh.visible = true;
      act.mesh.position.set(...q.p);
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      act.mesh.scale.set(mirror ? -1 : 1, 1, 1);
      act.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- contact shadows ----
    const cc = light === "night" ? "#5d6aa8" : "#8a8ab0";
    let fi = 0;
    for (const { q } of people) {
      if (q.low) continue;
      const pos: V3 = [q.p[0], q.p[1] + 0.022, q.p[2]];
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(...pos), 0.6))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(`blob|contact|${cc}`, 128, 128, 1, (p) => fxContact(p, cc));
      e2.use(false); e2.mesh.visible = true; e2.mesh.position.set(...pos); e2.mesh.rotation.set(-Math.PI / 2, 0, 0); e2.mesh.scale.set(0.55, 0.42, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a2 of this.actors) if (a2.mesh.visible) a2.bind();
    for (const e3 of this.fxs) if (e3.mesh.visible) e3.bind();
    return focus;
  }
  /** framing checks for this frame (call right after update). Pure measurement, no drawing. */
  qa(st: St3, cam: THREE.PerspectiveCamera): string[] {
    const out: string[] = [], right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), p = new THREE.Vector3();
    const box = (c: V3, x0: number, x1: number, y0: number, y1: number) => {
      let a = 9, b = -9, cc = 9, d = -9;
      for (const [dx, dy] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
        p.set(c[0], c[1] + dy, c[2]).addScaledVector(right, dx);
        if (p.clone().sub(cam.position).dot(cam.getWorldDirection(this.v)) < 0.15) return { frac: -1, h: 9, vcut: true, inX: true };
        p.project(cam); a = Math.min(a, p.x); b = Math.max(b, p.x); cc = Math.min(cc, p.y); d = Math.max(d, p.y);
      }
      const ix = Math.max(0, Math.min(b, 1) - Math.max(a, -1)), iy = Math.max(0, Math.min(d, 1) - Math.max(cc, -1));
      return { frac: (ix * iy) / Math.max(1e-6, (b - a) * (d - cc)), h: d - cc, vcut: cc < -1 || d > 1, inX: b > -1 && a < 1 };
    };
    for (const q of this.lastPeople) {
      const head = box(q.p, -0.27, 0.27, 1.16, 1.84), body = box(q.p, -0.3, 0.3, q.low ? 1.0 : 0.05, 1.16);
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      else if (head.frac > 0.02 && head.frac < 0.97 && (!q.walking || (head.vcut && head.inX))) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12) out.push(`${q.name}: body in shot without the head`);
      if (head.frac > 0.02 && head.h > 1.6 && !st.closeup) out.push(`${q.name}: face fills the screen`);
    }
    for (const [name, at, r] of st.subjects ?? []) {
      const v3 = V(...at);
      p.copy(v3).project(cam);
      if (p.z > 1 || Math.abs(p.x) > 0.92 || Math.abs(p.y) > 0.9) { out.push(`${name}: not in shot`); continue; }
      if (p.y < -0.48 && Math.abs(p.x) < 0.6) out.push(`${name}: under the subtitles`);
      const dir = v3.clone().sub(cam.position), dist = dir.length();
      this.ray.set(cam.position, dir.normalize()); this.ray.far = dist; this.ray.layers.set(0);
      const hit = this.ray.intersectObject(this.root, true).find((h) => {
        const m = h.object as THREE.Mesh, mat = m.material as THREE.Material;
        let o: THREE.Object3D | null = m; while (o) { if (!o.visible) return false; o = o.parent; }
        return !(Array.isArray(mat) ? false : mat.transparent || (mat as THREE.Material & { alphaTest?: number }).alphaTest > 0) && h.object !== this.sky && (h.object as THREE.Points).isPoints !== true;
      });
      if (hit && hit.distance < dist - r) out.push(`${name}: hidden behind something ${(dist - hit.distance).toFixed(2)} m in front of it`);
    }
    return out;
  }
}

/** lifeboat stations along the boat deck (x of each boat's middle), both sides; the story's boat is BOAT7_X on the -z side */
export const BOAT_X = [58, 47, 36, 25, -38, -49, -60, -71];
export const BOAT7_X = 25;
/** quay level, and where the gangway meets it */
export const QUAY = 2.4, GANG_X = 18, WHEEL_X = -3.4;

const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wFlow, wCalm;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(wFlow, 0.0);
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6 * wCalm);
  wc = mix(wc, wCrest, mk.r * 0.7 * wCalm);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf) * wCalm);
  diffuseColor.rgb = wc;`;
