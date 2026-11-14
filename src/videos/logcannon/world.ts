// The log cannon Short's world (kit 2 look): a fortified log barn on an island of ground inside a ditch and a ring of
// sharpened stakes, a flat grassy yard with a dirt path to its door, Washington's 80 men drawn up in two blocks (cards,
// instanced), a stand of pines (one of which can be felled), the log on its carriage, the men who walk out (instanced),
// and a British camp table far off. Grass in blades everywhere the ground is open.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit, tri } from "../bridge/build";
import { ctex, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, fxContact, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { cardShade } from "../bridge/cardshade";
import { Grass, GROUND } from "../bridge/grass";
import { Cards } from "../hertzlong/props3d";
import { V3, FPS, BARN, ISL, DITCH, STAKE, PATH_W, TREE, CAMP, TROOP, troopAt, COLN, colAt, groundH } from "./place";
import type { St3, Gun } from "./story";
type Light = "day" | "barn";

const DAY_ST: LightPreset = { ...LIGHTS.day, fogNear: 60, fogFar: 520 };
/** inside the barn: the same day, but under a roof */
const BARN_ST: LightPreset = { ...DAY_ST, lit: [1.0, 0.9, 0.74], shade: [0.2, 0.19, 0.23], lift: [0.03, 0.03, 0.05], charTint: [0.86, 0.79, 0.71], sideTint: [0.7, 0.66, 0.66], hemiI: 0.4 };
const LP: Record<Light, LightPreset> = { day: DAY_ST, barn: BARN_ST };
const LK: Record<Light, WorldLook> = { day: LOOK.day, barn: LOOK.day };

// ---------------- cast ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
const BLUE = (extra: Partial<Outfit> = {}): Outfit => ({ jacket: "#2f4f9a", pants: "#e6dcc4", boots: "#1e1a20", hat: "cap", cap: "#23232b", buttons: "#f1ede2", skin: "#f5c9a0", ...extra });
const LJ = ["#6b4a2f", "#5a4a3a", "#3f5f4a", "#7a5236", "#4a4038", "#5d5468", "#8a6a4a", "#3f4656"], LH = ["#3a2a20", "#5a4a3a", "#2b2f3d", "#4a3020"], LS = ["#f5c9a0", "#ecd0b6", SKIN, "#c99067", "#f0d2b0"];
const LOY = (i: number, extra: Partial<Outfit> = {}): Outfit => ({ jacket: LJ[i % LJ.length], pants: i % 2 ? "#4a4038" : "#5a5248", boots: "#2a201a", hat: i % 4 === 3 ? "hair" : "fedora", cap: LH[i % LH.length], hair: LH[(i + 1) % LH.length], buttons: "#c9b98a", skin: LS[i % LS.length], moustache: i % 3 === 1 ? LH[(i + 2) % LH.length] : undefined, build: i % 5 === 2 ? "stout" : undefined, ...extra });
const OUT: Record<string, Who> = {
  wash: who({ jacket: "#2f4f9a", pants: "#e6dcc4", boots: "#1e1a20", hat: "hair", hair: "#6b4a2f", buttons: "#e8c45a", sash: "#c0353a", sword: true, skin: "#f5c9a0" }, 41, "wash"),
  b1: who(BLUE({ rifle: true, moustache: "#3a2a20" }), 42, "b1"),
  b2: who(BLUE({ skin: SKIN }), 43, "b2"),
  b3: who(BLUE({ skin: "#ecd0b6", moustache: "#4a3020", build: "stout" }), 44, "b3"),
  ax: who(BLUE({ skin: "#c99067" }), 45, "ax"),
  br: who(BLUE({ skin: "#f0d2b0", hat: "hair", hair: "#b5462f" }), 46, "br"),
  rug: who({ jacket: "#3f5f4a", pants: "#4a4038", boots: "#2a201a", hat: "fedora", cap: "#3a3038", hair: "#8a8a92", moustache: "#8a8a92", buttons: "#e8c45a", build: "stout", skin: "#f0d2b0" }, 47, "rug"),
  corn: who({ jacket: "#c2382f", pants: "#f1ede2", boots: "#1e1a20", hat: "hair", hair: "#e6e2d8", buttons: "#e8c45a", build: "stout", skin: "#f5c9a0" }, 48, "corn"),
};
for (let i = 1; i <= 14; i++) OUT[`l${i}`] = who(LOY(i + 2), 60 + i, `l${i}`);
const SOLDIERS: [Outfit, Expr][] = [[BLUE({ rifle: true }), "stern"], [BLUE({ rifle: true, moustache: "#3a2a20", skin: "#ecd0b6" }), "stern"], [BLUE({ rifle: true, skin: SKIN }), "grin"], [BLUE({ rifle: true, moustache: "#8a8a92", build: "stout" }), "stern"], [BLUE({ rifle: true, skin: "#c99067" }), "neutral"], [BLUE({ rifle: true, hat: "hair", hair: "#b5462f", skin: "#f0d2b0" }), "stern"]];
const PRISONERS: [Outfit, Expr, number][] = [[LOY(0), "pained", 0], [LOY(1), "nervous", 0.25], [LOY(2), "stern", 0.5], [LOY(3), "dazed", 0.75], [LOY(5), "pained", 0.125], [LOY(6), "nervous", 0.625]];

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const M = (key: string, col: string, extra: THREE.MeshLambertMaterialParameters = {}) => lam(key, () => ({ color: col, ...extra }));

// ---------------- paint ----------------
const barkTex = () => { const t2 = ctex("lcBark", 256, 256, (g, r) => { g.fillStyle = "#7a5638"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 70; i++) { g.strokeStyle = r() > 0.5 ? "#5e4028" : "#8f6a48"; g.lineWidth = 2 + r() * 4; const x = r() * 256, y = r() * 256; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 8, y + 30 + r() * 90); g.stroke(); } }); t2.wrapS = t2.wrapT = THREE.RepeatWrapping; return t2; };
const ringTex = () => ctex("lcRings", 256, 256, (g) => { g.fillStyle = "#e3c692"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#b08a52"; for (let i = 1; i < 8; i++) { g.lineWidth = 3; g.beginPath(); g.ellipse(128 + i, 128 - i * 0.6, i * 15, i * 14.4, 0, 0, 6.3); g.stroke(); } g.strokeStyle = "#6b4a2f"; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 120, 0, 6.3); g.stroke(); });
const shingleTex = () => { const t2 = ctex("lcShingle", 512, 512, (g, r) => { g.fillStyle = "#5e4630"; g.fillRect(0, 0, 512, 512); for (let y = 0; y < 512; y += 64) for (let x = -32; x < 512; x += 64) { g.fillStyle = r() > 0.5 ? "#6b5038" : "#523c28"; g.fillRect(x + (y / 64 % 2) * 32 + 2, y + 2, 60, 60); } g.strokeStyle = "#2e2118"; g.lineWidth = 5; for (let y = 0; y <= 512; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); } }); t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.repeat.set(7, 3); return t2; };
const plankTex = () => { const t2 = ctex("lcPlank", 512, 512, (g, r) => { g.fillStyle = "#8a6238"; g.fillRect(0, 0, 512, 512); for (let x = 0; x < 512; x += 64) { g.fillStyle = r() > 0.5 ? "#93693d" : "#7d5832"; g.fillRect(x + 3, 0, 58, 512); } g.strokeStyle = "#3a2616"; g.lineWidth = 6; for (let x = 0; x <= 512; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); } }); t2.wrapS = t2.wrapT = THREE.RepeatWrapping; return t2; };
const pathTex = () => { const t2 = ctex("lcPath", 512, 512, (g, r) => { g.fillStyle = "#b08a58"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 260; i++) { g.fillStyle = r() > 0.5 ? "#c9a878" : "#8f6f48"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 5 + r() * 12, 3 + r() * 7, r() * 3, 0, 6.3); g.fill(); } }); return t2; };
const fieldsTex = () => ctex("lcFields", 2048, 2048, (g, r) => {
  g.fillStyle = GROUND; g.fillRect(0, 0, 2048, 2048);
  const cols = ["#6fb33f", "#d9c35a", "#4f9636", "#c9a94a", "#7dbb4c", "#a8743f", "#5aa23a", "#e0cf78", "#4a8c3a"];
  for (let y = 0; y < 2048; y += 96) for (let x = 0; x < 2048; x += 128) { g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x + 4, y + 4, 120, 88);
    g.strokeStyle = "rgba(40,70,30,0.35)"; g.lineWidth = 2; for (let k = 10; k < 88; k += 9) { g.beginPath(); g.moveTo(x + 6, y + 4 + k); g.lineTo(x + 122, y + 4 + k); g.stroke(); }
    g.strokeStyle = "#3f7a2e"; g.lineWidth = 6; g.strokeRect(x + 4, y + 4, 120, 88); }
  const gr = g.createRadialGradient(1024, 1024, 60, 1024, 1024, 470); gr.addColorStop(0, GROUND); gr.addColorStop(0.75, GROUND); gr.addColorStop(1, "rgba(63,122,40,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 2048, 2048);
});
const puffTex = () => ctex("lcPuff", 256, 256, (g, r) => { g.clearRect(0, 0, 256, 256); for (let i = 0; i < 9; i++) { const x = 128 + (r() - 0.5) * 110, y = 128 + (r() - 0.5) * 110, rr = 46 + r() * 34; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.7, "rgba(255,255,255,0.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 6.3); g.fill(); } });
const chipTex = () => ctex("lcChip", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = "#e8c98a"; g.strokeStyle = "#241726"; g.lineWidth = 5; g.beginPath(); g.moveTo(8, 40); g.lineTo(30, 10); g.lineTo(56, 26); g.lineTo(34, 54); g.closePath(); g.fill(); g.stroke(); });
const paperTex = () => ctex("lcPaper", 256, 192, (g) => { g.fillStyle = "#f6efdc"; g.fillRect(0, 0, 256, 192); g.strokeStyle = "#3a2e3a"; g.lineWidth = 4; for (let y = 40; y < 150; y += 28) { g.beginPath(); g.moveTo(24, y); for (let x = 24; x < (y > 120 ? 150 : 232); x += 8) g.lineTo(x + 8, y + (x % 16 ? -5 : 5)); g.stroke(); } });
const discTex = () => ctex("sunDisc", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });

// ---------------- geometry helpers ----------------
const UP = new THREE.Vector3(0, 1, 0), FZ = new THREE.Vector3(0, 0, 1);
/** a pine: bare trunk, then tiers of needles */
const pine = (b: Batch, trunk: THREE.Material, needle: THREE.Material[], x: number, y: number, z: number, h: number, yaw: number) => {
  const r = 0.019 * h, tg = new THREE.CylinderGeometry(r * 0.45, r, h * 0.8, 10, 1, true); tg.translate(x, y + h * 0.4, z); b.add(tg, trunk);
  for (let k = 0; k < 5; k++) { const u = k / 5, y0 = h * (0.34 + 0.6 * u * (1 - 0.18 * u)), hh = h * 0.27 * (1 - 0.45 * u), rr = h * 0.2 * (1 - 0.68 * u); const g = new THREE.ConeGeometry(rr, hh, 9, 1); g.rotateY(yaw + k); g.translate(x, y + y0 + hh / 2, z); b.add(g, needle[k % 2]); }
};
/** a log from a to b: bark round it, growth rings on both ends */
const logAt = (b: Batch, side: THREE.Material, end: THREE.Material, a: THREE.Vector3, c: THREE.Vector3, r: number, seg = 10) => {
  const d = c.clone().sub(a), len = d.length(); d.normalize();
  const g = new THREE.CylinderGeometry(r, r, len, seg, 1, true), mid = a.clone().add(c).multiplyScalar(0.5);
  b.add(g, side, new THREE.Matrix4().compose(mid, new THREE.Quaternion().setFromUnitVectors(UP, d), V(1, 1, 1)));
  for (const [p, n] of [[c, d], [a, d.clone().negate()]] as [THREE.Vector3, THREE.Vector3][]) b.add(new THREE.CircleGeometry(r, seg), end, new THREE.Matrix4().compose(p.clone().addScaledVector(n, 0.002), new THREE.Quaternion().setFromUnitVectors(FZ, n), V(1, 1, 1)));
};
const beamAt = (mat: THREE.Material, a: THREE.Vector3, c: THREE.Vector3, w: number, h: number) => { const d = c.clone().sub(a), m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d.length()), mat); m.position.copy(a).add(c).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(FZ, d.normalize()); return m; };
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
const inRect = (x: number, z: number, r: { x0: number; x1: number; z0: number; z1: number }, pad = 0) => x > r.x0 - pad && x < r.x1 + pad && z > r.z0 - pad && z < r.z1 + pad;
/** height of the open ground, or null where no grass grows (barn floor, ditch, paths, bridge) */
const turfY = (x: number, z: number): number | null => {
  if (inRect(x, z, DITCH)) {
    if (!inRect(x, z, ISL, -0.12)) return null;                       // the ditch itself (and the lip of the island)
    if (inRect(x, z, BARN, 0.35)) return null;                        // under the barn
    if (Math.abs(x) < PATH_W + 0.1 && z > BARN.z1) return null;       // the path to the door
    return 0;
  }
  if (inRect(x, z, DITCH, 0.12)) return null;                         // the outer lip
  if (Math.abs(x) < PATH_W + 0.1 && z > DITCH.z1 && z < 36) return null;
  return Math.abs(x) < 36 && z > -24 && z < 36 ? 0 : groundH(x, z, false);
};

export class KWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private crowdPool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private stars: THREE.Points;
  private sunCache = new Map<number, THREE.Vector3>();
  private clouds: THREE.Mesh[] = []; private cloudMaps: Record<Light, THREE.Texture[]>;
  private grass: Grass;
  private troop: { mesh: THREE.InstancedMesh; at: V3[]; sc: number[] }[] = [];
  private col: { mesh: THREE.InstancedMesh; idx: number[]; sc: number[]; mat: THREE.MeshLambertMaterial; texA: THREE.Texture; texB: THREE.Texture; texS: THREE.Texture; off: number }[] = [];
  private doorL = new THREE.Group(); private doorR = new THREE.Group();
  private fellG = new THREE.Group();
  private gunG = new THREE.Group(); private carriage = new THREE.Group(); private blocks = new THREE.Group(); private wheels: THREE.Group[] = [];
  private sleeve: THREE.Mesh; private blackDisc: THREE.Mesh;
  private axe = new THREE.Group(); private brush = new THREE.Group(); private quill = new THREE.Group();
  private puffs: THREE.Sprite[] = []; private chips: Cards;
  private m5 = new THREE.Matrix4(); private q5 = new THREE.Quaternion(); private s5 = new THREE.Vector3(1, 1, 1); private e5 = new THREE.Euler();
  private lastPeople: { name: string; p: V3; walking: boolean; low: boolean; extra: boolean }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();
  constructor(kit: Kit) {
    void kit; const R = this.root;
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
    const sp: number[] = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 420; i++) { const a = rnd() * Math.PI * 2, el = 0.1 + rnd() * 1.3, r = 1700; sp.push(r * Math.cos(el) * Math.cos(a), r * Math.sin(el), r * Math.cos(el) * Math.sin(a)); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color(1.5, 1.6, 2.0), size: 2.6, sizeAttenuation: false, fog: false, depthWrite: false }));
    this.stars.frustumCulled = false; this.stars.layers.set(NOINK); R.add(this.stars);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((q) => cloudHD(q, LOOK.day.cloud)), barn: [0, 1, 2, 3].map((q) => cloudHD(q, LOOK.day.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 1150 + (i % 3) * 90, w = 230 + (i % 4) * 50;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 320 + (i % 4) * 70, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---------------- the land ----------------
    const wood = M("lcWood", "#8a5a3a"), wood2 = M("lcWood2", "#6b4a2f"), iron = M("lcIron", "#3a3a48"), black = M("lcBlack", "#1b161c"), dark = M("lcDark", "#15101a");
    const bark = lam("lcBarkM", () => ({ map: barkTex() })), rings = lam("lcRingsM", () => ({ map: ringTex() })), plank = lam("lcPlankM", () => ({ map: plankTex() }));
    const tg = new THREE.PlaneGeometry(900, 900, 180, 180); tg.rotateX(-Math.PI / 2);
    { const p = tg.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setY(i, groundH(p.getX(i), p.getZ(i), true)); tg.computeVertexNormals(); }
    const land = new THREE.Mesh(tg, lam("lcFieldsM", () => ({ map: fieldsTex() }))); land.receiveShadow = true; R.add(land);
    // the yard: a slab with a ring cut out of it for the ditch; the barn stands on the island in the middle
    const yb = new Batch(), turf = M("lcTurf", GROUND), dirt = M("lcDirt", "#5e4632"), floor = M("lcFloor", "#6b5139"), path = lam("lcPathM", () => ({ map: pathTex() }));
    const D = DITCH, I = ISL;
    for (const [x0, x1, z0, z1] of [[-36, 36, D.z1, 36], [-36, 36, -24, D.z0], [-36, D.x0, D.z0, D.z1], [D.x1, 36, D.z0, D.z1], [I.x0, I.x1, I.z0, I.z1]]) yb.add(boxGeo(V(x0, -3.4, z0), V(x1, 0, z1), 3), turf);
    yb.add(boxGeo(V(D.x0, -3.4, D.z0), V(D.x1, -D.d, D.z1)), dirt);
    // bare earth on the ditch's banks
    const e = 0.04;
    for (const [x0, x1, z0, z1] of [[D.x0 - e, D.x0 + e, D.z0, D.z1], [D.x1 - e, D.x1 + e, D.z0, D.z1], [D.x0, D.x1, D.z0 - e, D.z0 + e], [D.x0, D.x1, D.z1 - e, D.z1 + e],
      [I.x0 - e, I.x0 + e, I.z0, I.z1], [I.x1 - e, I.x1 + e, I.z0, I.z1], [I.x0, I.x1, I.z0 - e, I.z0 + e], [I.x0, I.x1, I.z1 - e, I.z1 + e]]) yb.add(boxGeo(V(x0, -D.d, z0), V(x1, -0.03, z1)), dirt);
    yb.add(boxGeo(V(-PATH_W, 0, D.z1), V(PATH_W, 0.025, 36), 2), path);
    yb.add(boxGeo(V(-PATH_W, 0, BARN.z1), V(PATH_W, 0.025, I.z1), 2), path);
    yb.add(boxGeo(V(BARN.x0 + 0.1, 0, BARN.z0 + 0.1), V(BARN.x1 - 0.1, 0.03, BARN.z1 - 0.1)), floor);
    // the plank bridge over the ditch
    yb.add(boxGeo(V(-PATH_W - 0.1, 0.03, I.z1 - 0.25), V(PATH_W + 0.1, 0.11, D.z1 + 0.25)), plank);
    for (const x of [-1.0, 1.0]) yb.add(boxGeo(V(x - 0.1, -0.2, I.z1 - 0.2), V(x + 0.1, 0.03, D.z1 + 0.2)), wood2);
    yb.build(R);
    this.grass = new Grass(R, turfY);
    // far mountains
    const mb = new Batch(), rockM = M("lcRock", "#7f93a8"), rockM2 = M("lcRock2", "#6b8f6a");
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + 0.2, d = 380 + (i % 3) * 40, hh = 70 + ((i * 37) % 60); const g = new THREE.ConeGeometry(60 + (i % 4) * 22, hh, 7); g.translate(Math.cos(a) * d, hh / 2 - 6, Math.sin(a) * d); mb.add(g, i % 2 ? rockM : rockM2); }
    mb.build(R);

    // ---------------- the barn ----------------
    const bb = new Batch(), LR = 0.2, n = Math.round(BARN.h / (2 * LR)), hw = BARN.doorW / 2, ov = 0.35;
    for (let i = 0; i < n; i++) { const y = LR + i * 2 * LR, ys = y + LR;
      logAt(bb, bark, rings, V(BARN.x0 - ov, y, BARN.z0), V(BARN.x1 + ov, y, BARN.z0), LR);
      if (y - LR < BARN.doorH) { logAt(bb, bark, rings, V(BARN.x0 - ov, y, BARN.z1), V(-hw, y, BARN.z1), LR); logAt(bb, bark, rings, V(hw, y, BARN.z1), V(BARN.x1 + ov, y, BARN.z1), LR); }
      else logAt(bb, bark, rings, V(BARN.x0 - ov, y, BARN.z1), V(BARN.x1 + ov, y, BARN.z1), LR);
      if (ys < BARN.h + LR) for (const x of [BARN.x0, BARN.x1]) logAt(bb, bark, rings, V(x, ys, BARN.z0 - ov), V(x, ys, BARN.z1 + ov), LR); }
    // door frame
    for (const x of [-hw, hw]) bb.add(boxGeo(V(x - 0.1, 0, BARN.z1 - 0.22), V(x + 0.1, BARN.doorH + 0.1, BARN.z1 + 0.22)), wood2);
    bb.add(boxGeo(V(-hw - 0.1, BARN.doorH, BARN.z1 - 0.22), V(hw + 0.1, BARN.doorH + 0.2, BARN.z1 + 0.22)), wood2);
    // gables and roof
    const zm = (BARN.z0 + BARN.z1) / 2, eave = 0.6, ry = BARN.h + 0.15;
    for (const x of [BARN.x0, BARN.x1]) { const a = V(x, ry - 0.2, BARN.z0 - 0.2), c = V(x, ry - 0.2, BARN.z1 + 0.2), d = V(x, BARN.ridge, zm); bb.add(tri(a, c, d), plank); bb.add(tri(c, a, d), plank); }
    bb.build(R);
    { const half = BARN.z1 - zm + eave, rise = BARN.ridge - ry + 0.12, len = Math.hypot(half, rise * (half / (BARN.z1 - zm))), ang = Math.atan2(BARN.ridge - ry, BARN.z1 - zm), roofM = lam("lcRoofM", () => ({ map: shingleTex() }));
      for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(BARN.x1 - BARN.x0 + 1.4, 0.14, len), roofM); m.position.set(0, (BARN.ridge + ry - Math.tan(ang) * eave) / 2 + 0.1, zm + s * half / 2); m.rotation.x = s * ang; m.castShadow = m.receiveShadow = true; R.add(m); } }
    // loopholes in the front wall
    for (const x of [-4.2, -2.6, 2.6, 4.2]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.06), dark); m.position.set(x, 1.6, BARN.z1 + LR - 0.01); R.add(m); }
    // the door: two leaves, hinged on the posts, opening outward
    for (const s of [-1, 1]) { const g = s < 0 ? this.doorL : this.doorR, w = hw - 0.1;
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(w, BARN.doorH - 0.04, 0.08), plank); leaf.position.set(-s * w / 2, BARN.doorH / 2, 0);
      for (const y of [0.55, BARN.doorH - 0.55]) { const br = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, 0.16, 0.05), wood2); br.position.set(-s * w / 2, y, 0.06); g.add(br); }
      g.add(leaf); g.position.set(s * (hw - 0.1), 0.02, BARN.z1 + 0.05); shadowAll(g); R.add(g); }

    // ---------------- the ring of stakes ----------------
    const sb = new Batch(), stakeM = M("lcStake", "#b08a58"), q = new THREE.Quaternion(), eu = new THREE.Euler(); let ss = 17; const rs = () => (ss = (ss * 16807) % 2147483647) / 2147483647;
    const stake = (x: number, z: number, ox: number, oz: number) => { const L = 1.7 + 0.4 * rs(), g = new THREE.CylinderGeometry(0.012, 0.075, L, 6, 1); g.translate(0, L / 2 - 0.25, 0);
      const tilt = 0.9 + 0.15 * rs(), sw = (rs() - 0.5) * 0.5; eu.set(oz * tilt + ox * sw, 0, -ox * tilt + oz * sw); sb.add(g, stakeM, new THREE.Matrix4().compose(V(x, 0, z), q.setFromEuler(eu), V(1, 1, 1))); };
    for (let x = STAKE.x0; x <= STAKE.x1; x += 0.4) { if (Math.abs(x) > STAKE.gap) stake(x, STAKE.z1, 0, 1); stake(x, STAKE.z0, 0, -1); }
    for (let z = STAKE.z0; z <= STAKE.z1; z += 0.4) { stake(STAKE.x0, z, -1, 0); stake(STAKE.x1, z, 1, 0); }
    // the rail the stakes lean on
    for (const [x0, x1] of [[STAKE.x0, -STAKE.gap], [STAKE.gap, STAKE.x1]]) logAt(sb, bark, rings, V(x0, 0.5, STAKE.z1 + 0.42), V(x1, 0.5, STAKE.z1 + 0.42), 0.08, 8);
    logAt(sb, bark, rings, V(STAKE.x0, 0.5, STAKE.z0 - 0.42), V(STAKE.x1, 0.5, STAKE.z0 - 0.42), 0.08, 8);
    for (const s of [-1, 1]) logAt(sb, bark, rings, V(s * (STAKE.x1 + 0.42), 0.5, STAKE.z0), V(s * (STAKE.x1 + 0.42), 0.5, STAKE.z1), 0.08, 8);
    sb.build(R);

    // ---------------- pines ----------------
    { let st = 23; const rt = () => (st = (st * 16807) % 2147483647) / 2147483647; const placed: [number, number][] = [[TREE[0], TREE[2]]];
      const tb = new Batch(), needle = [M("lcNeedle", "#2f7a3a"), M("lcNeedle2", "#3b8c46")];
      const tryAdd = (x: number, z: number, h: number) => { if (placed.some(([a, b]) => Math.hypot(a - x, b - z) < 3.4)) return; placed.push([x, z]);
        pine(tb, bark, needle, x, Math.abs(x) < 36 && z > -24 && z < 36 ? 0 : groundH(x, z, false), z, h, rt() * 6); };
      for (let i = 0; i < 90; i++) { const x = 15.5 + rt() * 30, z = -30 + rt() * 64; if ((z > 0.5 && z < 7.5) || (x < 19 && z > 6 && z < 15)) continue; tryAdd(x, z, 9 + rt() * 5); }
      for (let i = 0; i < 40; i++) tryAdd(-46 + rt() * 30, -34 + rt() * 40, 9 + rt() * 5);
      tb.build(R);
      // the one that comes down: it hinges on its stump
      const fb = new Batch(); pine(fb, bark, needle, 0, -0.45, 0, 11, 1); fb.build(this.fellG); shadowAll(this.fellG);
      this.fellG.position.set(TREE[0], 0.45, TREE[2]); R.add(this.fellG);
      const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.46, 12), bark); stump.position.set(TREE[0], 0.25, TREE[2]); stump.castShadow = true; R.add(stump); }

    // ---------------- the log on its carriage ----------------
    { const G = this.gunG, Y = 0.92, LR2 = 0.21;
      const lb = new Batch(); logAt(lb, bark, rings, V(0, Y, -1.7), V(0, Y, 1.0), LR2, 14); lb.build(G);
      this.sleeve = new THREE.Mesh(new THREE.CylinderGeometry(LR2 + 0.004, LR2 + 0.004, 0.55, 14, 1, true), black); this.sleeve.geometry.rotateX(Math.PI / 2); this.sleeve.geometry.translate(0, 0, 0.275); this.sleeve.position.set(0, Y, -1.7);
      this.blackDisc = new THREE.Mesh(new THREE.CircleGeometry(LR2 + 0.004, 18), black); this.blackDisc.rotation.y = Math.PI; this.blackDisc.position.set(0, Y, -1.706);
      G.add(this.sleeve, this.blackDisc);
      const C = this.carriage;
      const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), wood2); ax.rotation.z = Math.PI / 2; ax.position.set(0, 0.62, 0); C.add(ax);
      const cr = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.13, 0.7), wood); cr.position.set(0, 0.66, 0); C.add(cr);
      C.add(beamAt(wood, V(0, 0.62, 0.3), V(0, 0.08, 2.35), 0.16, 0.13));
      for (const sx of [-0.66, 0.66]) { const w = new THREE.Group(); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.06, 8, 24), wood2); rim.rotation.y = Math.PI / 2; w.add(rim);
        for (let k = 0; k < 4; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.07), wood); sp.rotation.x = (k * Math.PI) / 4; w.add(sp); }
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.16, 10), wood2); hub.rotation.z = Math.PI / 2; w.add(hub);
        w.position.set(sx, 0.62, 0); C.add(w); this.wheels.push(w); }
      for (const z of [-1.05, 0.55]) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.33, 0.22), wood2); bl.position.set(0, 0.545, z); this.blocks.add(bl); }
      G.add(C, this.blocks); shadowAll(G); R.add(G); }

    // ---------------- tools ----------------
    { const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.8, 8), wood); hl.position.y = 0.3; const hd = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.05), iron); hd.position.set(0.08, AXE_L, 0); this.axe.add(hl, hd);
      const bh = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 6), wood); bh.position.y = 0.12; const bt = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.05), black); bt.position.y = 0.27; this.brush.add(bh, bt);
      const nib = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.012, 0.12, 5), dark); nib.position.y = 0.06; const fe = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.3), M("lcFeather", "#f4f0e6", { side: THREE.DoubleSide })); fe.position.y = -0.14; this.quill.add(nib, fe);
      for (const g of [this.axe, this.brush, this.quill]) { g.traverse((o) => { o.castShadow = true; }); g.visible = false; R.add(g); } }

    // ---------------- the British camp ----------------
    { const cb = new Batch(), [cx, , cz] = CAMP, canvas = M("lcCanvas", "#efe6cf");
      cb.add(boxGeo(V(cx - 0.8, 0.74, cz - 0.4), V(cx + 0.8, 0.8, cz + 0.4)), wood);
      for (const [x, z] of [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]]) cb.add(boxGeo(V(cx + x - 0.04, 0, cz + z - 0.04), V(cx + x + 0.04, 0.74, cz + z + 0.04)), wood2);
      const ink = new THREE.CylinderGeometry(0.035, 0.045, 0.07, 8); ink.translate(cx + 0.5, 0.835, cz + 0.2); cb.add(ink, dark);
      const tent = new THREE.ConeGeometry(2.3, 3.2, 10); tent.translate(cx + 3.6, 1.6, cz + 5.6); cb.add(tent, canvas);
      const tent2 = new THREE.ConeGeometry(2.0, 2.8, 10); tent2.translate(cx - 4.2, 1.4, cz + 7.5); cb.add(tent2, canvas);
      cb.build(R);
      const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), lam("lcPaperM", () => ({ map: paperTex() }))); pp.rotation.x = -Math.PI / 2; pp.rotation.z = Math.PI; pp.position.set(cx + 0.02, 0.806, cz + 0.08); pp.receiveShadow = true; R.add(pp); }

    // puffs (dust) and wood chips
    const puffT = puffTex();
    for (let i = 0; i < 40; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
    this.chips = new Cards(R, chipTex(), 16, 0.16);

    // ---------------- the two crowds: a few cards each, instanced ----------------
    const cardG = new THREE.PlaneGeometry(600 * SUc, 1000 * SUc); cardG.translate(0, (975 - 500) * SUc, 0);
    const inst = (tex: THREE.Texture, count: number) => { const mat = cardShade(new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide })); mat.alphaToCoverage = false;
      const mesh = new THREE.InstancedMesh(cardG, mat, count); mesh.layers.set(NOINK); mesh.frustumCulled = false; mesh.receiveShadow = true; R.add(mesh); return { mesh, mat }; };
    const tr = SOLDIERS.map(([o, ex], i) => this.crowdPool.req(`blue${i}`, 300, 500, 0.5, (p: Pen) => bodyFront(p, o, { mode: "stand", expr: ex, look: 0, light: -0.8, seed: 200 + i })));
    const pr = (d: number, mode: "march" | "stand") => PRISONERS.map(([o, ex, ph], i) => this.crowdPool.req(`loy${i}_${mode}_${d}`, 300, 500, 0.5, (p: Pen) => bodyFront(p, o, mode === "march" ? { mode, phase: ph + d, expr: ex, look: 0, light: -0.8, seed: 300 + i } : { mode, expr: ex, look: 0, light: -0.8, seed: 300 + i })));
    const pa = pr(0, "march"), pb = pr(0.5, "march"), ps = pr(0, "stand");
    this.crowdPool.flush();
    let sa = 5; const ra = () => (sa = (sa * 16807) % 2147483647) / 2147483647;
    tr.forEach((rq, vi) => { const at: V3[] = [], sc: number[] = []; for (let i = vi; i < TROOP; i += tr.length) { const p = troopAt(i); at.push([p[0] + (ra() - 0.5) * 0.25, 0, p[2] + (ra() - 0.5) * 0.2]); sc.push(0.92 + 0.16 * ra()); }
      this.troop.push({ mesh: inst(rq.tex!, at.length).mesh, at, sc }); });
    pa.forEach((rq, vi) => { const idx: number[] = [], sc: number[] = []; for (let i = vi; i < COLN; i += pa.length) { idx.push(i); sc.push(0.92 + 0.16 * ra()); }
      const { mesh, mat } = inst(rq.tex!, idx.length); this.col.push({ mesh, idx, sc, mat, texA: rq.tex!, texB: pb[vi].tex!, texS: ps[vi].tex!, off: PRISONERS[vi][2] }); });
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
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 260);
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
    this.sky.position.copy(cam.position); this.stars.position.copy(cam.position); this.stars.visible = false;
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = false;
    if (this.sunDisc.visible) { this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 1500); this.sunDisc.scale.setScalar(2 * 1500 * Math.tan(THREE.MathUtils.degToRad(1.7))); }
    for (let i = 0; i < this.clouds.length; i++) { const m = this.clouds[i]; m.visible = true; m.lookAt(cam.position.x, m.position.y, cam.position.z); (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[light][i % 4]; }

    // ---------------- the land and what stands on it ----------------
    this.grass.update(cam);
    const dk = st.door ?? 0; this.doorL.rotation.y = -1.75 * dk; this.doorR.rotation.y = 1.75 * dk;
    this.fellG.rotation.z = -1.5 * Math.min(1, st.fell ?? 0);
    const g: Gun | null | undefined = st.gun; this.gunG.visible = !!g;
    if (g) { this.gunG.position.set(...g.p); this.gunG.rotation.y = g.yaw; const wh = g.wheels !== false; this.carriage.visible = wh; this.blocks.visible = !wh;
      for (const w of this.wheels) w.rotation.x = -(g.spin ?? 0);
      const bk = Math.max(0, Math.min(1, g.black ?? 1)); this.sleeve.visible = this.blackDisc.visible = bk > 0.01; this.sleeve.scale.set(1, 1, Math.max(0.02, Math.min(1, bk * 1.25))); this.blackDisc.scale.setScalar(Math.min(1, bk * 2.2)); }
    for (const c2 of this.troop) { for (let i = 0; i < c2.at.length; i++) { const p = c2.at[i];
        this.e5.set(0, Math.atan2(cam.position.x - p[0], cam.position.z - p[2]), 0); this.m5.compose(this.v.set(p[0], 0, p[2]), this.q5.setFromEuler(this.e5), this.s5.setScalar(c2.sc[i])); c2.mesh.setMatrixAt(i, this.m5); }
      c2.mesh.instanceMatrix.needsUpdate = true; }
    const cl = st.col;
    for (const c2 of this.col) { c2.mesh.visible = !!cl; if (!cl) continue;
      const tx = !cl.march ? c2.texS : (t * 1.9 + c2.off) % 1 < 0.5 ? c2.texA : c2.texB; if (c2.mat.map !== tx) { c2.mat.map = tx; c2.mat.needsUpdate = true; }
      for (let i = 0; i < c2.idx.length; i++) { const p = colAt(c2.idx[i], cl.adv), out = p[2] > BARN.z1 - 0.35 && p[2] < 35.5, y = cl.march ? 0.06 * Math.abs(Math.sin(t * 5.5 + c2.idx[i])) : 0;
        this.e5.set(0, Math.atan2(cam.position.x - p[0], cam.position.z - p[2]), 0); this.m5.compose(this.v.set(p[0], y, p[2]), this.q5.setFromEuler(this.e5), this.s5.setScalar(out ? c2.sc[i] : 0)); c2.mesh.setMatrixAt(i, this.m5); }
      c2.mesh.instanceMatrix.needsUpdate = true; }
    this.s5.set(1, 1, 1);
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });
    this.chips.hide(); let nch = 0;
    for (const cd of st.cards ?? []) if (cd.kind === "chip") this.chips.put(nch++, V(...cd.p), cam, cd.spin, cd.s);
    this.axe.visible = this.brush.visible = this.quill.visible = false;

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), cu = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 1);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.l1 }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, walking: false, low: !!q.low, extra: !!q.extra }));
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed);
      let hr: [number, number] | undefined = q.hold?.r, hl: [number, number] | undefined = q.hold?.l;
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz = cam.position.z - q.p[2], nl = Math.hypot(nx, nz) || 1, n3 = V(nx / nl, 0, nz / nl), cr = V(n3.z, 0, -n3.x);
      // where a point in the world falls on this character's card, as seen from the camera (metres from the feet)
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(cr), pc.y - q.p[1]]; };
      const give = (hc: [number, number]) => { if ((hc[0] >= 0 && !hr) || hl) hr = hc; else hl = hc; };
      const tl = q.tool;
      if (tl) { let tg: THREE.Group, at3: THREE.Vector3, ang: number;
        if (tl.kind === "axe") { const at = V(...tl.at), side = at.clone().sub(o3).dot(right) >= 0 ? 1 : -1, th1 = 1.3, th = 0.25 + (th1 - 0.25) * tl.k;
          at3 = at.clone().addScaledVector(cu, 0.02 - AXE_L * Math.cos(th1)).addScaledVector(right, -side * AXE_L * Math.sin(th1)).addScaledVector(cu, 0.3 * (1 - tl.k)).addScaledVector(right, -side * 0.1 * (1 - tl.k));
          ang = -side * th; tg = this.axe; tg.scale.set(side, 1, 1); }
        else { const len = tl.kind === "brush" ? 0.3 : 0.11; at3 = V(...tl.at).addScaledVector(cu, len); ang = Math.PI + (tl.kind === "quill" ? 0.3 : 0); tg = tl.kind === "brush" ? this.brush : this.quill; }
        give(onCard(at3)); tg.visible = true; tg.position.copy(at3); tg.quaternion.copy(cam.quaternion); tg.rotateZ(ang); }
      for (const hwp of q.hw ?? []) give(onCard(V(...hwp)));
      const hk = hr || hl ? [hr, hl].flat().map((x) => (x ?? 9).toFixed(2)).join(",") : "";
      const key = `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${hk}|${q.march === undefined ? "" : Math.round(q.march * 12)}|${lightA.toFixed(2)}`;
      const hands = hr || hl ? { r: hr ? [300 + hr[0] / SUc, 975 - hr[1] / SUc] as [number, number] : undefined, l: hl ? [300 + hl[0] / SUc, 975 - hl[1] / SUc] as [number, number] : undefined } : undefined;
      act.r = this.pool.req(key, cw, ch, kk, (p: Pen) => bodyFront(p, w.o, { mode: q.march === undefined ? "stand" : "march", phase: q.march === undefined ? undefined : Math.round(q.march * 12) / 12, expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: hands ? undefined : q.wave, hands, light: lightA, seed: w.seed }));
      act.mesh.visible = true;
      act.mesh.position.set(...q.p);
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      act.mesh.scale.set(1, 1, 1);
      act.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- contact shadows ----
    const cc = "#8a8ab0";
    let fi = 0;
    for (const { q } of people) {
      if (q.low) continue;
      const pos: V3 = [q.p[0], q.p[1] + 0.03, q.p[2]];
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
      if (q.extra) continue; // crowd extras may sit on the frame edge
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

/** grip to the middle of the axe head */
const AXE_L = 0.62;
