// Kit 2: the look test (Nov 13, 2026). Everything new in one small world so it can be judged before it goes into real
// videos: rolling terrain with patchwork fields and grass in blades, a stone fort wall, an army of hundreds drawn as
// instanced cards, ground that breaks into blocks, rain, lanterns that glow and light the ground, a fuse the camera can
// ride, sparks, chips, smoke trails and an explosion, and characters whose hands reach to the tool they hold.
// Space: the fort wall runs along x at z = -14 (its face looks toward +z); the yard is in front of it; the army comes
// down the hillside from +z.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit, quad, tri } from "../bridge/build";
import { ctex, cobbleHD, planksHD, cloudHD, stoneHD, grassHD, rep } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { cardShade } from "../bridge/cardshade";
import { Board, INK, paintText } from "../dst/props";
import { signTex, newsTex, cashPile, suitcase } from "../lustig/props";
import { numTex, Cards, sparkTex } from "../hertzlong/props3d";
import { V3, FPS, PATCH, PN, PC, WORK, GUN, LAMPS, FUSE, ARMY, ARMY_Z, groundH } from "./place";
import type { St3 } from "./story";
type Light = "day" | "golden" | "grey" | "night";

// the street is a canyon: fog starts late so the far end still reads
const DAY_ST: LightPreset = { ...LIGHTS.day, fogNear: 60, fogFar: 520 };
const GOLD_ST: LightPreset = { ...LIGHTS.golden, el: 16, fogNear: 60, fogFar: 460 };
/** the morning of the crash: flat, overcast, colour drained */
const GREY_ST: LightPreset = { ...LIGHTS.day, az: 110, el: 62,
  lit: [1.02, 1.04, 1.1], shade: [0.42, 0.44, 0.52], lift: [0.07, 0.08, 0.12], charTint: [0.9, 0.92, 0.98], sideTint: [0.88, 0.9, 0.98],
  top: "#8e99ad", hor: "#c3c9d4", fog: "#b4bcc9", fogNear: 30, fogFar: 300, sunCol: "#e6ecf7", sunI: 1.5, sky: "#cfd6e2", ground: "#8a8790", hemiI: 0.8 };
const NIGHT_ST: LightPreset = {
  az: 35, el: 58,
  lit: [0.7, 0.78, 1.2], shade: [0.13, 0.15, 0.3], lift: [0.03, 0.05, 0.13], lambert: 0.35, sideK: 0.84, term: 0.2,
  charTint: [0.8, 0.86, 1.1], charShade: 0.86, charGrad: 0.1, bodyGrad: 0.22, sideTint: [0.78, 0.82, 1.0],
  blob: [0.6, 0.62, 0.8], actorShadow: false,
  top: "#0b1533", hor: "#22366a", skyCurve: [0.0, 0.5, 0.6], fog: "#1b2a54", fogNear: 60, fogFar: 500, sunDisc: "#000000",
  sunCol: "#a9c0ff", sunI: 1.7, sky: "#2a3f73", ground: "#1a1f33", hemiI: 0.4,
  bias: -0.00025, normalBias: 0.015,
};
const GREY_LOOK: WorldLook = { ...LOOK.day, sky: { c: ["#c3c9d4", "#b6bdca", "#a3acbd", "#939db1", "#8590a6"], e: [0, 3, 8, 16, 40] }, cloud: { lit: "#d5d9e2", mid: "#b9bfcc", shade: "#9aa2b4" }, sat: 0.82 };
const NIGHT_LOOK: WorldLook = { ...LOOK.day, sky: { c: ["#263a6e", "#1f3164", "#182955", "#111f46", "#0a1433"], e: [0, 3, 8, 16, 40] }, cloud: { lit: "#4a5f9c", mid: "#34477e", shade: "#243463" }, bounce: [0, 0, 0], sat: 1.0 };
const LP: Record<Light, LightPreset> = { day: DAY_ST, golden: GOLD_ST, grey: GREY_ST, night: NIGHT_ST };
const LK: Record<Light, WorldLook> = { day: LOOK.day, golden: LOOK.golden, grey: GREY_LOOK, night: NIGHT_LOOK };

// ---------------- cast ----------------
const SUIT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#3a2a20", buttons: "#d9d4c8", skin: "#f5c9a0", ...extra });
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** everyone the shots can place, by name. "you" is the viewer: red cap, blue jacket, white trainers, in every chapter. */
const OUT: Record<string, Who> = {
  you: who({ jacket: "#2f6fd0", pants: "#39405a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", skin: SKIN, buttons: "#f4f1ea" }, 41, "you"),
  babson: who(SUIT("#5a4a3a", { hair: "#d9d4c8", moustache: "#d9d4c8", build: "stout", skin: "#f0d2b0" }), 42, "babson"),
  fisher: who(SUIT("#3f4656", { hair: "#8a8a92", moustache: "#8a8a92", skin: "#ecd0b6" }), 43, "fisher"),
  whitney: who(SUIT("#1d1b22", { hat: "tophat", build: "stout", buttons: "#e8c45a", skin: "#f5c9a0" }), 44, "whitney"),
  lamont: who(SUIT("#23232b", { hair: "#b9b3a8", skin: "#ecd0b6", buttons: "#e8c45a" }), 45, "lamont"),
  banker2: who(SUIT("#2b2f3d", { hat: "tophat", moustache: "#8a8a92", build: "stout", buttons: "#e8c45a" }), 46, "banker2"),
  banker3: who(SUIT("#3a3038", { hat: "tophat", moustache: "#2a201a", skin: SKIN, buttons: "#e8c45a" }), 47, "banker3"),
  banker4: who(SUIT("#1f2a44", { hair: "#4a3020", moustache: "#4a3020", build: "stout", buttons: "#e8c45a" }), 48, "banker4"),
  hoover: who(SUIT("#23232b", { hair: "#8a8a92", build: "stout", skin: "#f0d2b0" }), 49, "hoover"),
  livermore: who(SUIT("#cfc8ba", { hat: "fedora", cap: "#b9b3a8", pants: "#b9b3a8", hair: "#d9c08a", skin: "#f5c9a0" }), 50, "livermore"),
  broker: who(SUIT("#f1ede2", { hair: "#3a2a20", pants: "#3f4656", moustache: "#3a2a20", buttons: "#2b2f3d" }), 51, "broker"),
  broker2: who(SUIT("#e9dcc0", { hair: "#1e1a20", pants: "#2b2f3d", skin: "#ecd0b6", buttons: "#2b2f3d" }), 52, "broker2"),
  broker3: who(SUIT("#d9e2ee", { hair: "#b5462f", pants: "#4a4038", skin: SKIN, buttons: "#2b2f3d" }), 53, "broker3"),
  clerk: who(SUIT("#f1ede2", { hat: "cap", cap: "#3f9a5a", pants: "#3a3038", skin: "#f5c9a0" }), 54, "clerk"),
  newsboy: who({ jacket: "#8a5a3a", pants: "#4a4038", boots: "#3a2a20", hat: "cap", cap: "#5a4a3a", build: "kid", skin: SKIN }, 55, "newsboy"),
  teller: who(SUIT("#3f5f4a", { hair: "#3a2a20", moustache: "#3a2a20", skin: "#ecd0b6" }), 56, "teller"),
  official: who(SUIT("#1f2a44", { hat: "fedora", cap: "#1f2a44", moustache: "#2a201a", buttons: "#e8c45a" }), 57, "official"),
  mother: who(SUIT("#7b5ac9", { hat: "bonnet", dress: "#7b5ac9", skin: "#ecd0b6" }), 58, "mother"),
  kid: who({ jacket: "#f08a2c", pants: "#3b5b9a", boots: "#5a3b2a", hat: "cap", cap: "#7a5236", build: "kid" }, 59, "kid"),
  oldman: who(SUIT("#6b4a2f", { hat: "fedora", cap: "#5a4a3a", moustache: "#d9d4c8", hair: "#d9d4c8", skin: "#f0d2b0" }), 60, "oldman"),
  grocer: who(SUIT("#f1ede2", { hair: "#1e1a20", moustache: "#1e1a20", pants: "#4a6a9a", skin: "#c99067", build: "stout" }), 61, "grocer"),
  lady: who(SUIT("#c25a7a", { hat: "bonnet", dress: "#c25a7a", skin: SKIN }), 62, "lady"),
  lady2: who(SUIT("#5a8fc2", { hat: "bonnet", dress: "#5a8fc2", skin: "#f5c9a0" }), 63, "lady2"),
  worker: who(SUIT("#7a5236", { hat: "cap", cap: "#5a4a3a", skin: "#c99067", moustache: "#2a201a" }), 64, "worker"),
  gent: who(SUIT("#1d1b22", { hat: "tophat", moustache: "#8a8a92", build: "stout", buttons: "#e8c45a" }), 65, "gent"),
};
OUT.carp = who({ jacket: "#c2384a", pants: "#4a4038", boots: "#3a2a20", hat: "hair", hair: "#5a3b2a", skin: SKIN, buttons: "#e8c45a" }, 71, "carp");
OUT.chief = who(SUIT("#2f4f9a", { hat: "cap", cap: "#c9373a", moustache: "#3a2a20", build: "stout", buttons: "#e8c45a" }), 72, "chief");
OUT.scout = who(SUIT("#a8312f", { hat: "cap", cap: "#8a8f98", buttons: "#f1ede2", skin: "#f5c9a0" }), 73, "scout");
// the crowd: c0..c47, mostly men in dark suits and hats, some women, generated from a fixed seed
{
  const J = ["#3f4656", "#5a4a3a", "#2b2f3d", "#6b4a2f", "#4a5a7a", "#3f5f4a", "#7a5236", "#4a4038", "#23232b", "#5d5468"];
  const D = ["#c25a7a", "#5a8fc2", "#d9a441", "#7b5ac9", "#3f9a5a", "#a63d4c"], SK = ["#f5c9a0", "#ecd0b6", SKIN, "#c99067", "#f0d2b0"];
  const HR = ["#3a2a20", "#1e1a20", "#4a3020", "#8a8a92", "#b5462f"];
  for (let i = 0; i < 48; i++) {
    const lady = i % 5 === 3, j = J[(i * 7 + 3) % J.length];
    const o: Outfit = lady ? SUIT(D[i % D.length], { hat: "bonnet", dress: D[i % D.length], skin: SK[i % SK.length] })
      : SUIT(j, { hat: i % 3 === 0 ? "fedora" : i % 3 === 1 ? "cap" : i % 7 === 2 ? "tophat" : "hair", cap: J[(i * 3 + 1) % J.length], hair: HR[i % HR.length], skin: SK[(i * 3) % SK.length], moustache: i % 4 === 1 ? HR[(i + 2) % HR.length] : undefined, build: i % 6 === 4 ? "stout" : undefined });
    OUT[`c${i}`] = who(o, 100 + i, `c${i}`);
  }
}

const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const M = (key: string, col: string, extra: THREE.MeshLambertMaterialParameters = {}) => lam(key, () => ({ color: col, ...extra }));
const UNLIT = new Map<string, THREE.MeshBasicMaterial>();
const unlit = (key: string, tex: () => THREE.Texture) => { let m = UNLIT.get(key); if (!m) { m = new THREE.MeshBasicMaterial({ map: tex(), color: new THREE.Color(0.9, 0.9, 0.9) }); UNLIT.set(key, m); } return m; };

// ---------------- geometry helpers ----------------
/** one window quad on a wall facing -z (s = -1) or +z (s = 1) */
const win = (b: Batch, mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, s: number) => {
  const a = V(x - w / 2, y - h / 2, z), c = V(x + w / 2, y + h / 2, z);
  b.add(s < 0 ? quad(V(c.x, a.y, z), V(a.x, a.y, z), V(a.x, c.y, z), V(c.x, c.y, z)) : quad(V(a.x, a.y, z), V(c.x, a.y, z), V(c.x, c.y, z), V(a.x, c.y, z)), mat);
};
const cylAt = (b: Batch, mat: THREE.Material, r0: number, r1: number, h: number, x: number, y: number, z: number, seg = 20) => {
  const g = new THREE.CylinderGeometry(r0, r1, h, seg, 1); g.translate(x, y + h / 2, z); b.add(g, mat);
};
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
/** an office block on the north (s = 1, front at z0 facing -z) or south (s = -1, front facing +z) side, windows in a grid */
const block = (b: Batch, wb: Batch, winMat: THREE.Material, x0: number, x1: number, h: number, s: number, mat: THREE.Material, trim: THREE.Material) => {
  const zf = s * 12, zb = s * 40;
  b.add(boxGeo(V(x0, 0, Math.min(zf, zb)), V(x1, h, Math.max(zf, zb)), 0), mat);
  b.add(boxGeo(V(x0 - 0.3, h, Math.min(zf, zb) - 0.3), V(x1 + 0.3, h + 0.7, Math.max(zf, zb) + 0.3)), trim);
  b.add(boxGeo(V(x0 - 0.15, 4.6, Math.min(zf - s * 0.2, zf)), V(x1 + 0.15, 5.1, Math.max(zf - s * 0.2, zf))), trim);
  const n = Math.max(2, Math.floor((x1 - x0) / 3.2)), dx = (x1 - x0) / n;
  for (let y = 7.4; y < h - 2; y += 4.1) for (let i = 0; i < n; i++) win(wb, winMat, x0 + dx * (i + 0.5), y, zf - s * 0.03, dx * 0.5, 2.3, -s);
  for (let i = 0; i < n; i++) win(wb, winMat, x0 + dx * (i + 0.5), 2.5, zf - s * 0.03, dx * 0.62, 3.0, -s);
};
/** a 1920s motor car about 3.8 m long, nose toward +x */
const car = (col: string) => {
  const G = new THREE.Group(), body = M("car_" + col, col), dark = M("carDark", "#1d1b22"), glass = M("carGlass", "#9fc3e0");
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => { const ms = new THREE.Mesh(g, m); ms.position.set(x, y, z); G.add(ms); return ms; };
  add(new THREE.BoxGeometry(3.8, 0.7, 1.5), body, 0, 0.75, 0); add(new THREE.BoxGeometry(1.9, 0.95, 1.4), body, -0.45, 1.55, 0);
  add(new THREE.BoxGeometry(1.92, 0.5, 1.42), glass, -0.45, 1.62, 0); add(new THREE.BoxGeometry(2.1, 0.1, 1.56), dark, -0.45, 2.06, 0);
  add(new THREE.BoxGeometry(0.2, 0.5, 1.2), dark, 1.95, 0.85, 0);
  for (const [x, z] of [[1.2, 0.8], [1.2, -0.8], [-1.2, 0.8], [-1.2, -0.8]]) { const w = add(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 16), dark, x, 0.42, z); w.rotation.x = Math.PI / 2; }
  for (const z of [0.5, -0.5]) add(new THREE.SphereGeometry(0.14, 10, 8), M("carLamp", "#f6e7a8"), 1.98, 1.0, z);
  return shadowAll(G);
};
const slipTex = () => ctex("crSlip", 256, 96, (g) => { g.fillStyle = "#fffaf0"; g.fillRect(4, 4, 248, 88); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(4, 4, 248, 88); g.fillStyle = INK; for (let k = 0; k < 5; k++) g.fillRect(22 + k * 44, 36, 30, 22); });
const sellTex = () => ctex("crSell", 256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.fillStyle = "#c9373a"; g.fillRect(8, 60, 240, 136); g.lineWidth = 12; g.strokeStyle = INK; g.strokeRect(8, 60, 240, 136); paintText(g, "SELL", 128, 132, 92, "#ffffff", "center", 0.1); });
const billTex = () => ctex("crBill", 256, 128, (g) => { g.fillStyle = "#7fc48a"; g.fillRect(4, 4, 248, 120); g.lineWidth = 10; g.strokeStyle = INK; g.strokeRect(4, 4, 248, 120); g.strokeStyle = "#2f6b55"; g.lineWidth = 8; g.beginPath(); g.arc(128, 64, 34, 0, Math.PI * 2); g.stroke(); paintText(g, "$", 128, 68, 56, "#2f6b55", "center", 0); });
const mattressTex = () => ctex("crMattress", 256, 256, (g) => { g.fillStyle = "#f4f0e6"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#7da0d0"; for (let x = 12; x < 256; x += 40) g.fillRect(x, 0, 14, 256); });
const asphaltTex = () => ctex("crAsphalt", 512, 512, (g, r) => { g.fillStyle = "#57555f"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "#615f6a" : "#4c4a54"; g.fillRect(r() * 512, r() * 512, 3 + r() * 5, 2 + r() * 3); } });
const flagTex = () => ctex("crFlag", 512, 320, (g) => { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#f4f0e6" : "#c9373a"; g.fillRect(0, (i * 320) / 13, 512, 320 / 13 + 1); } g.fillStyle = "#2f4f9a"; g.fillRect(0, 0, 210, 172); g.fillStyle = "#f4f0e6"; for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) { g.beginPath(); g.arc(22 + x * 33, 20 + y * 33, 7, 0, Math.PI * 2); g.fill(); } });
const noticeTex = (s: string, bg: string, fg: string) => ctex(`crNotice_${s}`, 512, 300, (g) => { g.fillStyle = bg; g.fillRect(0, 0, 512, 300); g.lineWidth = 16; g.strokeStyle = INK; g.strokeRect(8, 8, 496, 284); const ws = s.split("|"); ws.forEach((w, i) => { let px = ws.length > 1 ? 104 : 150; g.font = `900 ${px}px Montserrat, Arial, sans-serif`; while (g.measureText(w).width > 440 && px > 30) { px -= 4; g.font = `900 ${px}px Montserrat, Arial, sans-serif`; } paintText(g, w, 256, 150 + (i - (ws.length - 1) / 2) * 118, px, fg, "center", 0.08); }); });
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

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
  private winMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true, side: THREE.DoubleSide });
  private crowd: { mesh: THREE.InstancedMesh; at: V3[]; ph: number[] }[] = []; private flags: THREE.Group[] = [];
  private cells: { body: THREE.InstancedMesh; top: THREE.InstancedMesh; d: number[] };
  private lid: THREE.Mesh;
  private rain: THREE.Mesh; private rainSeed: number[] = [];
  private lamps: { bulb: THREE.Mesh; halo: THREE.Sprite; pool: THREE.Mesh; light: THREE.PointLight }[] = [];
  private fuse: THREE.Mesh; private fuseBurnt: THREE.Mesh; private fusePath: THREE.CatmullRomCurve3; private sparkLight: THREE.Sprite;
  private hammer = new THREE.Group(); private torch = new THREE.Group(); private flame: THREE.Sprite;
  private puffs: THREE.Sprite[] = []; private sparks: Cards; private chips: Cards;
  private m5 = new THREE.Matrix4(); private q5 = new THREE.Quaternion(); private s5 = new THREE.Vector3(1, 1, 1); private e5 = new THREE.Euler();
  private lastPeople: { name: string; p: V3; walking: boolean; low: boolean; extra: boolean }[] = [];
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
    const sp: number[] = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 420; i++) { const a = rnd() * Math.PI * 2, el = 0.1 + rnd() * 1.3, r = 1700; sp.push(r * Math.cos(el) * Math.cos(a), r * Math.sin(el), r * Math.cos(el) * Math.sin(a)); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color(1.5, 1.6, 2.0), size: 2.6, sizeAttenuation: false, fog: false, depthWrite: false }));
    this.stars.frustumCulled = false; this.stars.layers.set(NOINK); R.add(this.stars);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), grey: [0, 1, 2, 3].map((k) => cloudHD(k, GREY_LOOK.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, NIGHT_LOOK.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 1150 + (i % 3) * 90, w = 230 + (i % 4) * 50;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 320 + (i % 4) * 70, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }


    // ---------------- the land ----------------
    const dark = M("k2Dark", "#1d1b22"), wood = M("k2Wood", "#8a5a3a"), wood2 = M("k2Wood2", "#6b4a2f"), iron = M("k2Iron", "#3a3a48"), gold = M("k2Gold", "#e8c45a");
    const tg = new THREE.PlaneGeometry(900, 900, 180, 180); tg.rotateX(-Math.PI / 2);
    { const p = tg.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setY(i, groundH(p.getX(i), p.getZ(i), true)); tg.computeVertexNormals(); }
    const land = new THREE.Mesh(tg, lam("k2Fields", () => ({ map: fieldsTex() }))); land.receiveShadow = true; R.add(land);
    // the yard: a slab with a square hole where the ground can break
    const yb = new Batch(), turf = lam("k2Turf", () => ({ map: rep(grassHD(), 1, 1) })), dirt = M("k2Dirt", "#7a5a3c"), path = lam("k2Path", () => ({ map: pathTex() }));
    const [hx0, hx1, hz0, hz1] = [PATCH[0] - PN * PC / 2, PATCH[0] + PN * PC / 2, PATCH[1] - PN * PC / 2, PATCH[1] + PN * PC / 2];
    for (const [x0, x1, z0, z1] of [[-36, 36, -14, hz0], [-36, 36, hz1, 36], [-36, hx0, hz0, hz1], [hx1, 36, hz0, hz1]]) yb.add(boxGeo(V(x0, -3.4, z0), V(x1, 0, z1), 3), turf);
    yb.add(boxGeo(V(-2.2, 0, -14), V(2.2, 0.025, 36), 2), path);
    yb.add(boxGeo(V(hx0, -3.4, hz0), V(hx1, -1.9, hz1)), dirt);
    yb.build(R);
    // the ground that breaks: PN x PN blocks, grass on top, earth below
    { const n = PN * PN, bg = new THREE.BoxGeometry(PC - 0.02, 2.6, PC - 0.02), tgm = new THREE.BoxGeometry(PC - 0.02, 0.1, PC - 0.02);
      const body = new THREE.InstancedMesh(bg, dirt, n), top = new THREE.InstancedMesh(tgm, M("k2TurfFlat", "#6fae3c"), n);
      body.receiveShadow = top.receiveShadow = true; body.castShadow = true; R.add(body, top);
      const d: number[] = []; let s2 = 31; const r2 = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < n; i++) { const cx = (i % PN) - (PN - 1) / 2, cz = Math.floor(i / PN) - (PN - 1) / 2, ring = Math.max(Math.abs(cx), Math.abs(cz));
        d.push(ring === 0 ? 0 : ring === 1 ? -1.25 - 0.4 * r2() : ring === 2 ? (r2() > 0.5 ? -0.55 : 0.4) * (0.6 + 0.6 * r2()) : (r2() - 0.5) * 0.3); }
      this.cells = { body, top, d };
      this.lid = new THREE.Mesh(new THREE.BoxGeometry(PN * PC, 0.12, PN * PC), turf); this.lid.position.set(PATCH[0], -0.06, PATCH[1]); this.lid.receiveShadow = true; R.add(this.lid); }
    // grass: tufts of curved blades in the lawn's own greens (dark at the root, light at the tip), never outlined
    { const P3: number[] = [], C3: number[] = [], N3: number[] = []; let sg = 91; const rg3 = () => (sg = (sg * 16807) % 2147483647) / 2147483647;
      for (let b = 0; b < 5; b++) { const a = b * 1.257 + rg3(), ox = Math.cos(a) * 0.07 * (b ? 1 : 0), oz = Math.sin(a) * 0.07 * (b ? 1 : 0), h = 0.2 + 0.2 * rg3(), wd = 0.026 + 0.012 * rg3(), ln = 0.05 + 0.1 * rg3();
        const cx = Math.cos(a + 1.57), cz = Math.sin(a + 1.57), lx = Math.cos(a) * ln, lz = Math.sin(a) * ln;
        const pt = (u: number, sgn: number, wk: number): [number, number, number] => [ox + lx * u * u + cx * wd * wk * sgn, h * u, oz + lz * u * u + cz * wd * wk * sgn];
        const A = pt(0, -1, 1), B = pt(0, 1, 1), Cc = pt(0.55, -1, 0.7), D = pt(0.55, 1, 0.7), T = pt(1, 0, 0);
        const tri = (p: [number, number, number][], c: number[]) => p.forEach((q, n) => { P3.push(...q); C3.push(c[n], c[n], c[n]); N3.push(0, 1, 0); });
        tri([A, B, D], [0.62, 0.62, 0.98]); tri([A, D, Cc], [0.62, 0.98, 0.98]); tri([Cc, D, T], [0.98, 0.98, 1.22]); }
      const tuft = new THREE.BufferGeometry(); tuft.setAttribute("position", new THREE.Float32BufferAttribute(P3, 3)); tuft.setAttribute("color", new THREE.Float32BufferAttribute(C3, 3)); tuft.setAttribute("normal", new THREE.Float32BufferAttribute(N3, 3));
      let s3 = 77; const r3 = () => (s3 = (s3 * 16807) % 2147483647) / 2147483647;
      for (const [col, n] of [["#6fae3c", 6500], ["#7cba42", 5000], ["#62a236", 4000]] as [string, number][]) {
        const im = new THREE.InstancedMesh(tuft, M("k2Tuft" + col, col, { side: THREE.DoubleSide, vertexColors: true }), n); im.layers.set(NOINK); im.receiveShadow = true; im.frustumCulled = false;
        for (let i = 0; i < n; i++) { let x = 0, z = 0; do { x = -30 + 60 * r3(); z = -13.6 + 44 * r3(); } while ((Math.abs(x) < 2.3) || (x > hx0 - 0.15 && x < hx1 + 0.15 && z > hz0 - 0.15 && z < hz1 + 0.15));
          const sc = 0.8 + 0.7 * r3(); this.e5.set(0, r3() * 6.3, 0); this.m5.compose(this.v.set(x, 0, z), this.q5.setFromEuler(this.e5), this.s5.set(sc, sc * (0.8 + 0.5 * r3()), sc)); im.setMatrixAt(i, this.m5); }
        R.add(im); } this.s5.set(1, 1, 1); }
    // far mountains
    const mb = new Batch(), rockM = M("k2Rock", "#7f93a8"), rockM2 = M("k2Rock2", "#6b8f6a");
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + 0.2, d = 380 + (i % 3) * 40, hh = 70 + ((i * 37) % 60); const g = new THREE.ConeGeometry(60 + (i % 4) * 22, hh, 7); g.translate(Math.cos(a) * d, hh / 2 - 6, Math.sin(a) * d); mb.add(g, i % 2 ? rockM : rockM2); }
    mb.build(R);

    // ---------------- the fort wall ----------------
    const wb2 = new Batch(), stone = lam("k2Stone", () => ({ map: stoneHD("k2StoneHD", ["#b9b4ac", "#a9a39a", "#c6c1b8", "#9c968e"], "#5f5a58") })), roofM = M("k2Roof", "#c2452f");
    for (const [x0, x1] of [[-60, -2.6], [2.6, 60]]) wb2.add(boxGeo(V(x0, 0, -17), V(x1, 7, -14), 2.2), stone);
    wb2.add(boxGeo(V(-2.6, 4.6, -17), V(2.6, 7, -14), 2.2), stone); wb2.add(boxGeo(V(-2.6, 0, -16.6), V(2.6, 4.6, -16.2)), wood2);
    for (let x = -59; x < 60; x += 2.4) wb2.add(boxGeo(V(x, 7, -14.7), V(x + 1.3, 8, -14), 2.2), stone);
    for (const x of [-22, 22]) { wb2.add(boxGeo(V(x - 3.2, 0, -18.4), V(x + 3.2, 10.5, -12.6), 2.2), stone); const cg = new THREE.ConeGeometry(4.6, 5.4, 8); cg.translate(x, 13.2, -15.5); wb2.add(cg, roofM); }
    // a workbench frame the carpenter hammers on, and a crate
    wb2.add(boxGeo(V(WORK[0] - 0.9, 0, WORK[2] - 0.25), V(WORK[0] - 0.75, 1.05, WORK[2] + 0.25)), wood); wb2.add(boxGeo(V(WORK[0] + 0.75, 0, WORK[2] - 0.25), V(WORK[0] + 0.9, 1.05, WORK[2] + 0.25)), wood);
    wb2.add(boxGeo(V(WORK[0] - 1.0, 1.05, WORK[2] - 0.32), V(WORK[0] + 1.0, 1.2, WORK[2] + 0.32)), wood2);
    for (let k = 0; k < 5; k++) { const pg = new THREE.CylinderGeometry(0.035, 0.035, 0.22, 8); pg.translate(WORK[0] - 0.6 + k * 0.3, 1.31, WORK[2]); wb2.add(pg, gold); }
    // the cannon the fuse runs to
    { const bg2 = new THREE.CylinderGeometry(0.2, 0.28, 2.0, 16); bg2.rotateX(Math.PI / 2 - 0.22); bg2.translate(GUN[0], 0.95, GUN[2] + 0.5); wb2.add(bg2, iron);
      wb2.add(boxGeo(V(GUN[0] - 0.4, 0.25, GUN[2] - 0.7), V(GUN[0] + 0.4, 0.6, GUN[2] + 0.9)), wood);
      for (const sx of [-0.52, 0.52]) { const wg = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 18); wg.rotateZ(Math.PI / 2); wg.translate(GUN[0] + sx, 0.5, GUN[2]); wb2.add(wg, wood2); } }
    wb2.build(R);
    for (const x of [-9, 9]) { const bn = new Board(1.6, 3.4, "k2_banner", () => bannerTex("#2f4f9a")); bn.group.position.set(x, 4.9, -13.9); bn.group.rotation.y = Math.PI; R.add(bn.group); }
    // lanterns: two on the wall, one on a post in the yard
    const haloT = glowTex2(), poolT = glowTex2();
    for (const p of LAMPS) {
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.26), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })); bulb.position.set(...p); bulb.layers.set(NOINK);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloT, color: new THREE.Color(1.6, 1.0, 0.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); halo.position.set(...p); halo.scale.setScalar(2.6); halo.layers.set(NOINK);
      const pt2 = new THREE.PointLight("#ffc46a", 0, 11, 1.6); pt2.position.set(p[0], p[1] - 0.1, p[2] + (p[2] < -12 ? 0.5 : 0)); R.add(pt2);
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: poolT, color: new THREE.Color(1.0, 0.62, 0.22), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -3 }));
      pl.rotation.x = -Math.PI / 2; pl.position.set(p[0], 0.05, p[2] + (p[2] < -12 ? 2.4 : 0)); pl.layers.set(NOINK);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.36), dark); cap.position.set(p[0], p[1] + 0.22, p[2]);
      if (p[2] > -12) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, p[1], 8), wood2); post.position.set(p[0] + 0.3, p[1] / 2, p[2]); const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.05), wood2); arm.position.set(p[0] + 0.15, p[1] + 0.3, p[2]); R.add(post, arm); }
      R.add(bulb, halo, pl, cap); this.lamps.push({ bulb, halo, pool: pl, light: pt2 });
    }
    // the fuse: a rope on the grass from the gate path round to the cannon
    this.fusePath = new THREE.CatmullRomCurve3(FUSE.map((p) => V(...p)));
    const ropeM = lam("k2Rope", () => ({ map: ropeTex() }));
    this.fuse = new THREE.Mesh(new THREE.TubeGeometry(this.fusePath, 160, 0.045, 8), ropeM); this.fuse.castShadow = true;
    this.fuseBurnt = new THREE.Mesh(new THREE.TubeGeometry(this.fusePath, 160, 0.047, 8), M("k2Burnt", "#2a2428")); R.add(this.fuse, this.fuseBurnt);
    this.sparkLight = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloT, color: new THREE.Color(3.0, 2.2, 1.0), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); this.sparkLight.layers.set(NOINK); R.add(this.sparkLight);
    // tools
    { const hd = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.14), iron); hd.position.y = 0.34; const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.46, 8), wood); hl.position.y = 0.13; this.hammer.add(hd, hl);
      const st2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.7, 8), wood2); st2.position.y = 0.2; const wr = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.2, 10), M("k2Wrap", "#d9a441")); wr.position.y = 0.59;
      this.flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex(), color: new THREE.Color(2.4, 1.6, 0.7), transparent: true, depthWrite: false, fog: false })); this.flame.position.y = 0.93; this.flame.scale.set(0.42, 0.62, 1); this.flame.layers.set(NOINK);
      this.torch.add(st2, wr, this.flame);
      for (const g of [this.hammer, this.torch]) { g.traverse((o) => { o.castShadow = true; }); g.visible = false; R.add(g); } }
    // rain: streaks with real width (two triangles a drop), brighter near the camera
    { const n = 2400, pos = new Float32Array(n * 18); for (let i = 0; i < n; i++) this.rainSeed.push(rnd(), rnd(), rnd());
      const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      this.rain = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 0.88, 1.15), transparent: true, opacity: 0.5, fog: false, depthWrite: false, side: THREE.DoubleSide })); this.rain.frustumCulled = false; this.rain.layers.set(NOINK); R.add(this.rain); }
    // puffs (smoke, dust, fire), sparks, wood chips
    const puffT = puffTex();
    for (let i = 0; i < 260; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
    this.sparks = new Cards(R, sparkTex(), 14, 0.5); this.chips = new Cards(R, chipTex(), 16, 0.16);
    // ---------------- the army: six soldier cards, hundreds of instances ----------------
    const reqs = SOLDIERS.map(([o, ex, ph], i) => this.crowdPool.req(`sold${i}`, 300, 500, 0.5, (p: Pen) => bodyFront(p, o, { mode: "march", phase: ph, expr: ex, look: 0, light: -0.8, seed: 200 + i })));
    this.crowdPool.flush();
    const cardG = new THREE.PlaneGeometry(600 * 0.00216, 1000 * 0.00216); cardG.translate(0, (975 - 500) * 0.00216, 0);
    const per = Math.ceil(ARMY / reqs.length); let sa = 5; const ra = () => (sa = (sa * 16807) % 2147483647) / 2147483647;
    reqs.forEach((rq, vi) => {
      const mat = cardShade(new THREE.MeshLambertMaterial({ map: rq.tex!, alphaTest: 0.5, side: THREE.DoubleSide })); mat.alphaToCoverage = false;
      const mesh = new THREE.InstancedMesh(cardG, mat, per); mesh.layers.set(NOINK); mesh.frustumCulled = false; mesh.receiveShadow = true; R.add(mesh);
      const at: V3[] = [], ph: number[] = [];
      for (let k = 0; k < per; k++) { const idx = k * reqs.length + vi, col = idx % 34, row = Math.floor(idx / 34), x = (col - 16.5) * 2.1 + (ra() - 0.5) * 1.1 + (row % 2) * 1.0, z = ARMY_Z + row * 2.3 + (ra() - 0.5) * 0.9; at.push([x, 0.86 + 0.3 * ra(), z]); ph.push(ra() * 6.3); }
      this.crowd.push({ mesh, at, ph });
    });
    { const fm = lam("k2FlagM", () => ({ map: bannerTex("#b3302c"), side: THREE.DoubleSide }));
      for (let i = 0; i < 8; i++) { const g = new THREE.Group(), pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5.4, 6), wood2); pole.position.y = 2.7; const bn = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.3), fm); bn.position.set(0.7, 4.15, 0); bn.castShadow = true; g.add(pole, bn);
        g.userData.x = [-30, -21, -13, -4.6, 5.4, 13, 21, 30][i]; g.userData.z = ARMY_Z + 5 + (i % 3) * 9; R.add(g); this.flags.push(g); } }
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

    // ---------------- the land, the army, the weather ----------------
    this.winMat.color.setRGB(1, 1, 1);
    const brk = st.breakK ?? 0;
    this.lid.visible = brk <= 0; this.cells.body.visible = this.cells.top.visible = brk > 0;
    { const { body, top, d } = this.cells; for (let i = 0; i < d.length; i++) { const cx = PATCH[0] + ((i % PN) - (PN - 1) / 2) * PC, cz = PATCH[1] + (Math.floor(i / PN) - (PN - 1) / 2) * PC, y = d[i] * brk;
        this.m5.makeTranslation(cx, y - 1.35, cz); body.setMatrixAt(i, this.m5); this.m5.makeTranslation(cx, y, cz); top.setMatrixAt(i, this.m5); }
      body.instanceMatrix.needsUpdate = true; top.instanceMatrix.needsUpdate = true; }
    const ar = st.army;
    for (const c2 of this.crowd) { c2.mesh.visible = !!ar; if (!ar) continue;
      for (let i = 0; i < c2.at.length; i++) { const a2 = c2.at[i], z = a2[2] - ar.adv, y = groundH(a2[0], z, false) + (ar.march ? 0.07 * Math.abs(Math.sin(t * 5.5 + c2.ph[i])) : 0);
        this.e5.set(0, Math.atan2(cam.position.x - a2[0], cam.position.z - z), 0); this.m5.compose(this.v.set(a2[0], y, z), this.q5.setFromEuler(this.e5), this.s5.setScalar(a2[1])); c2.mesh.setMatrixAt(i, this.m5); }
      this.s5.set(1, 1, 1);
      c2.mesh.instanceMatrix.needsUpdate = true; }
    this.flags.forEach((g) => { g.visible = !!ar; if (ar) { const z = (g.userData.z as number) - ar.adv; g.position.set(g.userData.x as number, groundH(g.userData.x as number, z, false), z); g.rotation.z = 0.04 * Math.sin(t * 2 + (g.userData.x as number)); } });
    const rn = st.rain ?? 0; this.rain.visible = rn > 0;
    if (rn > 0) { const pa = (this.rain.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array, n = this.rainSeed.length / 3, cx = cam.position.x, cz = cam.position.z;
      const rr = this.v.setFromMatrixColumn(cam.matrixWorld, 0), rx = rr.x, rz = rr.z;
      for (let i = 0; i < n; i++) { const x = cx - 9 + 18 * this.rainSeed[i * 3], z = cz - 9 + 18 * this.rainSeed[i * 3 + 2], y = 11 - ((this.rainSeed[i * 3 + 1] * 11 + t * 15) % 11), d = Math.hypot(x - cx, z - cz), wd = 0.0035 + 0.0009 * d, ln = 0.5, sl = 0.07, o = i * 18;
        const ax = x - rx * wd, az = z - rz * wd, bx = x + rx * wd, bz = z + rz * wd;
        pa[o] = ax; pa[o + 1] = y; pa[o + 2] = az; pa[o + 3] = bx; pa[o + 4] = y; pa[o + 5] = bz; pa[o + 6] = bx + sl; pa[o + 7] = y - ln; pa[o + 8] = bz;
        pa[o + 9] = ax; pa[o + 10] = y; pa[o + 11] = az; pa[o + 12] = bx + sl; pa[o + 13] = y - ln; pa[o + 14] = bz; pa[o + 15] = ax + sl; pa[o + 16] = y - ln; pa[o + 17] = az; }
      (this.rain.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true; (this.rain.material as THREE.MeshBasicMaterial).opacity = 0.38 * rn; }
    const lk = st.lamps ?? 0;
    for (const lp of this.lamps) { lp.halo.visible = lp.pool.visible = lk > 0.01; (lp.bulb.material as THREE.MeshBasicMaterial).color.setRGB(0.5 + 3.4 * lk, 0.45 + 2.3 * lk, 0.35 + 0.8 * lk);
      const fl = 1 + 0.06 * Math.sin(t * 11 + lp.bulb.position.x); lp.halo.scale.setScalar(2.3 * fl); (lp.halo.material as THREE.SpriteMaterial).opacity = 0.5 * lk; (lp.pool.material as THREE.MeshBasicMaterial).opacity = 0.22 * lk * fl; lp.light.intensity = 26 * lk * fl; }
    const fu = st.fuse;
    this.fuse.visible = this.fuseBurnt.visible = fu !== undefined; this.sparkLight.visible = fu !== undefined && fu > 0 && fu < 1;
    if (fu !== undefined) { const seg = 160 * 8 * 6, cut = Math.floor(160 * Math.max(0, Math.min(1, fu))) * 8 * 6; this.fuseBurnt.geometry.setDrawRange(0, cut); this.fuse.geometry.setDrawRange(cut, seg - cut);
      const sp = this.fusePath.getPointAt(Math.max(0, Math.min(1, fu))); this.sparkLight.position.set(sp.x, sp.y + 0.08, sp.z); this.sparkLight.scale.setScalar(0.9 + 0.25 * Math.sin(t * 40)); }
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });
    this.sparks.hide(); this.chips.hide(); let nsp = 0, nch = 0;
    for (const cd of st.cards ?? []) { if (cd.kind === "spark") this.sparks.put(nsp++, V(...cd.p), cam, cd.spin, cd.s); else this.chips.put(nch++, V(...cd.p), cam, cd.spin, cd.s); }
    this.hammer.visible = this.torch.visible = false;

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.c0 }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, walking: !!q.side, low: !!q.low, extra: !!q.extra }));
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
        : `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${q.hold ? [q.hold.r, q.hold.l].flat().map((n) => (n ?? 9).toFixed(2)).join(",") : ""}|${lt.toFixed(2)}`;
      act.r = this.pool.req(key, cw, ch, kk, (p: Pen) => q.side
        ? bodySide(p, w.o, { mode: "march", phase: Math.round(q.side.phase * 16) / 16, expr: q.expr, blink: bl, stride: q.side.stride ?? 0.8, stomp: 0.4, light: lt, seed: w.seed })
        : bodyFront(p, w.o, { mode: "stand", expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: q.wave, hands: q.hold ? { r: q.hold.r ? [300 + q.hold.r[0] / 0.00216, 975 - q.hold.r[1] / 0.00216] : undefined, l: q.hold.l ? [300 + q.hold.l[0] / 0.00216, 975 - q.hold.l[1] / 0.00216] : undefined } : undefined, light: lt, seed: w.seed }));
      act.mesh.visible = true;
      act.mesh.position.set(...q.p);
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      act.mesh.scale.set(mirror ? -1 : 1, 1, 1);
      act.mesh.castShadow = L.actorShadow;
      if (q.hold?.tool && q.hold.r) { const g = q.hold.tool === "hammer" ? this.hammer : this.torch, up = cam.up; void up;
        g.visible = true; g.position.set(q.p[0], q.p[1] + q.hold.r[1], q.p[2]).addScaledVector(right, q.hold.r[0] * (mirror ? -1 : 1)); g.position.addScaledVector(this.v.copy(cam.position).sub(g.position).normalize(), 0.06);
        g.quaternion.copy(cam.quaternion); g.rotateZ(q.hold.swing ?? 0); }
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- contact shadows ----
    const cc = light === "night" ? "#5d6aa8" : light === "grey" ? "#7d8094" : "#8a8ab0";
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

const SOLD = (extra: Partial<Outfit>): Outfit => ({ jacket: "#a8312f", pants: "#3a3038", boots: "#1e1a20", hat: "cap", cap: "#8a8f98", buttons: "#f1ede2", skin: "#f5c9a0", ...extra });
const SOLDIERS: [Outfit, Expr, number][] = [[SOLD({}), "stern", 0], [SOLD({ moustache: "#3a2a20", skin: "#ecd0b6" }), "grin", 0.25], [SOLD({ skin: SKIN }), "laugh", 0.5], [SOLD({ moustache: "#8a8a92", build: "stout" }), "stern", 0.75], [SOLD({ skin: "#c99067" }), "smile", 0.125], [SOLD({ hair: "#b5462f", skin: "#f0d2b0" }), "stern", 0.625]];
const fieldsTex = () => ctex("k2Fields", 2048, 2048, (g, r) => {
  g.fillStyle = "#5aa23a"; g.fillRect(0, 0, 2048, 2048);
  const cols = ["#6fb33f", "#d9c35a", "#4f9636", "#c9a94a", "#7dbb4c", "#a8743f", "#5aa23a", "#e0cf78", "#4a8c3a"];
  for (let y = 0; y < 2048; y += 96) for (let x = 0; x < 2048; x += 128) { const w = 128 + Math.floor(r() * 3) * 0, c = cols[Math.floor(r() * cols.length)];
    g.fillStyle = c; g.fillRect(x + 4, y + 4, w - 8, 88);
    g.strokeStyle = "rgba(40,70,30,0.35)"; g.lineWidth = 2; for (let k = 10; k < 88; k += 9) { g.beginPath(); g.moveTo(x + 6, y + 4 + k); g.lineTo(x + w - 6, y + 4 + k); g.stroke(); }
    g.strokeStyle = "#3f7a2e"; g.lineWidth = 6; g.strokeRect(x + 4, y + 4, w - 8, 88); }
  // the middle (the yard, the hillside the army is on) stays open grass, with the road running up it
  const gr = g.createRadialGradient(1024, 1024, 60, 1024, 1024, 430); gr.addColorStop(0, "rgba(98,170,58,1)"); gr.addColorStop(0.75, "rgba(98,170,58,1)"); gr.addColorStop(1, "rgba(98,170,58,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 2048, 2048);
  g.strokeStyle = "#b08a58"; g.lineWidth = 12; g.lineCap = "round"; g.beginPath(); g.moveTo(1024, 1024 - 40); g.bezierCurveTo(1024, 1200, 1100, 1300, 1000, 1500); g.bezierCurveTo(940, 1650, 1080, 1800, 1024, 2048); g.stroke();
  g.strokeStyle = "#5f8fd0"; g.lineWidth = 16; g.beginPath(); g.moveTo(0, 520); g.bezierCurveTo(500, 600, 900, 420, 2048, 560); g.stroke();
});
const pathTex = () => { const t2 = ctex("k2Path", 512, 512, (g, r) => { g.fillStyle = "#b08a58"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 260; i++) { g.fillStyle = r() > 0.5 ? "#c9a878" : "#8f6f48"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 5 + r() * 12, 3 + r() * 7, r() * 3, 0, 6.3); g.fill(); } }); return t2; };
const ropeTex = () => { const t2 = ctex("k2Rope", 64, 64, (g) => { g.fillStyle = "#d9b25a"; g.fillRect(0, 0, 64, 64); g.strokeStyle = "#8f6a2a"; g.lineWidth = 7; for (let i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 40, 64); g.stroke(); } }); t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.repeat.set(60, 2); return t2; };
const bannerTex = (bg: string) => ctex("k2Banner" + bg, 256, 512, (g) => { g.fillStyle = bg; g.fillRect(0, 0, 256, 512); g.lineWidth = 16; g.strokeStyle = "#e8c45a"; g.strokeRect(10, 10, 236, 492);
  g.fillStyle = "#f4f0e6"; g.beginPath(); g.moveTo(128, 90); g.lineTo(196, 200); g.lineTo(168, 200); g.lineTo(168, 330); g.lineTo(88, 330); g.lineTo(88, 200); g.lineTo(60, 200); g.closePath(); g.fill(); g.fillRect(70, 360, 116, 26);
  g.strokeStyle = "#e8c45a"; g.lineWidth = 14; g.beginPath(); g.moveTo(70, 440); g.lineTo(128, 400); g.lineTo(186, 440); g.stroke(); });
const glowTex2 = () => ctex("k2GlowSoft", 256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,0.85)"); gr.addColorStop(0.18, "rgba(255,255,255,0.42)"); gr.addColorStop(0.45, "rgba(255,255,255,0.13)"); gr.addColorStop(0.75, "rgba(255,255,255,0.03)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
const puffTex = () => ctex("k2Puff", 256, 256, (g, r) => { g.clearRect(0, 0, 256, 256); for (let i = 0; i < 9; i++) { const x = 128 + (r() - 0.5) * 110, y = 128 + (r() - 0.5) * 110, rr = 46 + r() * 34; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.7, "rgba(255,255,255,0.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 6.3); g.fill(); } });
const flameTex = () => ctex("k2Flame", 128, 192, (g) => { g.clearRect(0, 0, 128, 192); const gr = g.createLinearGradient(0, 192, 0, 0); gr.addColorStop(0, "#fff6c8"); gr.addColorStop(0.45, "#ffc24a"); gr.addColorStop(1, "#f0552a"); g.fillStyle = gr; g.beginPath(); g.moveTo(64, 4); g.bezierCurveTo(110, 70, 120, 130, 64, 188); g.bezierCurveTo(8, 130, 30, 80, 64, 4); g.fill(); });
const chipTex = () => ctex("k2Chip", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = "#e8c98a"; g.strokeStyle = "#241726"; g.lineWidth = 5; g.beginPath(); g.moveTo(8, 40); g.lineTo(30, 10); g.lineTo(56, 26); g.lineTo(34, 54); g.closePath(); g.fill(); g.stroke(); });
