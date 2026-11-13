// "What If You Woke Up in 1929 Knowing the Crash Was Coming?" (Paradox Town Explained #5): the three.js world, posed per
// frame from a shot spec (story3d.ts). Two sets. Wall Street: a canyon of office blocks along x, the Stock Exchange
// (steps, six columns, pediment) on the north side facing an open cross street, a bank further east whose sign, doors
// and door notice change per shot, a newsstand with a headline board, lamp posts, two motor cars, Trinity Church closing
// the west end. And one room redressed by its wall sign and props: a long table, a lectern, a trading post with its
// price board, a ticker under a glass dome spilling tape, a bed, a flag, cash, gold bars.
// Street space: x along Wall Street (east = +x), the Exchange on the +z side, cameras mostly on the -z side looking north.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit, quad, tri } from "../bridge/build";
import { ctex, cobbleHD, planksHD, cloudHD, stoneHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { Board, INK, paintText } from "../dst/props";
import { signTex, newsTex, cashPile, suitcase } from "../lustig/props";
import { numTex, Cards } from "../hertzlong/props3d";
import { FPS } from "./timeline";
import { V3, Rm, ROOM_O, SW } from "./story3d";
import type { St3 } from "./story3d";
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

export class CWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private stars: THREE.Points;
  private sunCache = new Map<number, THREE.Vector3>();
  private clouds: THREE.Mesh[] = []; private cloudMaps: Record<Light, THREE.Texture[]>;
  private winMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true, side: THREE.DoubleSide });
  private bankSign: Board; private doors: THREE.Mesh[] = []; private notice: Board; private stand: Board; private cars: THREE.Group[] = [];
  private roomSign: THREE.Mesh; private ceil: THREE.Mesh;
  private table = new THREE.Group(); private podium = new THREE.Group(); private post = new THREE.Group(); private postBoard: Board;
  private ticker = new THREE.Group(); private tapeA: THREE.Mesh; private tapeB: THREE.Mesh; private bed = new THREE.Group(); private flag = new THREE.Group();
  private cash: THREE.Group[] = []; private gold: THREE.Mesh[] = []; private rnum: Board; private case_: THREE.Group; private paper: Board;
  private slips: Cards; private sells: Cards; private bills: Cards;
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

    // ---------------- Wall Street ----------------
    const b = new Batch(), wb = new Batch();
    const asphalt = lam("crAsphalt", () => ({ map: asphaltTex() })), cobble = lam("cobbleHD", () => ({ map: cobbleHD() }));
    const lime = lam("crLime", () => ({ map: stoneHD("crLimeHD", ["#e6dcc8", "#ddd2bc", "#ece3d1", "#d6cab3"], "#b3a68e") })), limeFlat = M("crLimeFlat", "#e3d9c4", { side: THREE.DoubleSide });
    const dark = M("crDark", "#1d1b22"), trim = M("crTrim", "#b9ad96"), iron = M("crIron", "#2f2a3a"), gold = M("crGold", "#e8c45a"), wood = M("crWood", "#8a5a3a");
    const WALLS = ["#b8a58a", "#a39480", "#c2b49c", "#8f8478", "#a88f7a", "#9aa0a8", "#b09a86"].map((c, i) => M("crWall" + i, c));
    b.add(boxGeo(V(-400, -0.4, -400), V(400, 0, 400), 6), asphalt);
    // sidewalks: the whole north side, the south side either side of the cross street
    b.add(boxGeo(V(-140, 0, 6), V(140, SW, 12), 4), cobble);
    b.add(boxGeo(V(-140, 0, -12), V(-14, SW, -6), 4), cobble); b.add(boxGeo(V(14, 0, -12), V(140, SW, -6), 4), cobble);
    b.add(boxGeo(V(-20, 0, -90), V(-14, SW, -12), 4), cobble); b.add(boxGeo(V(14, 0, -90), V(20, SW, -12), 4), cobble);
    // the Stock Exchange: steps, six columns, entablature, pediment, tall windows behind the columns
    b.add(boxGeo(V(-16, 0, 12.6), V(16, 24, 40), 3), lime);
    for (let k = 0; k < 3; k++) b.add(boxGeo(V(-15.6 + k * 0.3, 0, 9.0 + k * 0.7), V(15.6 - k * 0.3, 0.3 * (k + 1), 12.6), 3), lime);
    for (let i = 0; i < 6; i++) { const x = -12.5 + i * 5; cylAt(b, limeFlat, 0.95, 1.05, 12.6, x, 0.9, 11.3, 22); b.add(boxGeo(V(x - 1.25, 0.9, 10.05), V(x + 1.25, 1.35, 12.55)), trim); b.add(boxGeo(V(x - 1.2, 13.2, 10.1), V(x + 1.2, 13.6, 12.5)), trim); }
    b.add(boxGeo(V(-15.4, 13.6, 9.9), V(15.4, 15.7, 12.7)), lime);
    b.add(boxGeo(V(-15.8, 15.7, 9.6), V(15.8, 16.1, 12.8)), trim);
    { const A = V(-15.8, 16.1, 9.7), B = V(15.8, 16.1, 9.7), C = V(0, 20.6, 9.7), A2 = V(-15.8, 16.1, 12.8), B2 = V(15.8, 16.1, 12.8), C2 = V(0, 20.6, 12.8);
      b.add(tri(B, A, C), limeFlat); b.add(quad(A, A2, C2, C), limeFlat); b.add(quad(B2, B, C, C2), limeFlat); }
    for (let i = 0; i < 5; i++) win(wb, this.winMat, -10 + i * 5, 7.6, 12.57, 2.6, 9.4, -1);
    b.add(boxGeo(V(-1.7, 0.9, 12.3), V(1.7, 5.4, 12.62)), dark);
    const exSign = new Board(9.4, 2.05, "cr_nyse", () => signTex("cr_nyse", "NEW YORK STOCK EXCHANGE", "#2f2a3a", "#e8c45a")); exSign.group.position.set(0, 14.65, 9.84); R.add(exSign.group);
    // the bank: a stone front with four columns, double doors, a sign that is repainted per shot
    b.add(boxGeo(V(34, 0, 12), V(58, 14, 40), 3), lime); b.add(boxGeo(V(33.7, 14, 11.7), V(58.3, 14.8, 40.3)), trim);
    b.add(boxGeo(V(38, 0, 10.2), V(54, 0.32, 12), 3), lime);
    for (const x of [39.5, 43.2, 48.8, 52.5]) { cylAt(b, limeFlat, 0.5, 0.56, 7.2, x, 0.32, 11.0, 18); b.add(boxGeo(V(x - 0.7, 7.5, 10.3), V(x + 0.7, 7.8, 11.7)), trim); }
    b.add(boxGeo(V(38.4, 7.8, 10.2), V(53.6, 10.1, 12.0)), lime);
    b.add(boxGeo(V(44.5, 0.32, 11.86), V(47.5, 4.1, 12.3)), dark); b.add(boxGeo(V(44.3, 4.1, 11.7), V(47.7, 4.4, 12.1)), trim);
    for (const x of [36.4, 41.4, 50.6, 55.6]) win(wb, this.winMat, x, 3.4, 11.97, 2.0, 3.6, -1);
    for (const x of [36.4, 41.4, 46, 50.6, 55.6]) win(wb, this.winMat, x, 12.1, 11.97, 2.0, 2.0, -1);
    for (const s of [-1, 1]) { const d = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.78, 0.12), wood); d.castShadow = true; d.userData.s = s; this.doors.push(d); R.add(d); const kn = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), gold); kn.position.set(-s * 0.55, -0.1, -0.09); d.add(kn); }
    this.bankSign = new Board(9.6, 2.1, "cr_bank0", () => signTex("cr_bank0", "CORNER SAVINGS BANK", "#2f2a3a", "#e8c45a")); this.bankSign.group.position.set(46, 8.95, 10.13); R.add(this.bankSign.group);
    this.notice = new Board(1.9, 1.1, "cr_notice0", () => noticeTex("CLOSED", "#fff6dc", "#c9373a")); this.notice.group.position.set(46, 2.45, 11.72); R.add(this.notice.group);
    // the rest of the canyon
    let wi = 0;
    const run = (x0: number, x1: number, s: number, hs: number[]) => { let x = x0, i = 0; while (x < x1 - 4) { const w = Math.min(x1 - x, 13 + ((i * 7 + wi) % 4) * 3.5); block(b, wb, this.winMat, x, x + w - 0.6, hs[i % hs.length], s, WALLS[wi++ % WALLS.length], trim); x += w; i++; } };
    run(-140, -16.6, 1, [44, 62, 36, 78, 50, 68]); run(16.6, 33.4, 1, [58]); run(58.6, 140, 1, [66, 40, 74, 52, 60]);
    run(-140, -20.4, -1, [56, 38, 70, 46, 64, 52]); run(20.4, 140, -1, [48, 72, 40, 60, 54, 66]);
    // the cross street's own walls (south of Wall Street), and the ends of the canyon
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const z0 = -40 - k * 22, x0 = s < 0 ? -48 : 20.4; b.add(boxGeo(V(x0, 0, z0 - 21.4), V(x0 + 27.6, 40 + ((k * 13) % 30), z0), 0), WALLS[(k + (s < 0 ? 2 : 5)) % WALLS.length]); }
    b.add(boxGeo(V(-30, 0, -150), V(30, 70, -128), 0), WALLS[3]);
    b.add(boxGeo(V(150, 0, -30), V(176, 90, 30), 0), WALLS[1]);
    // Trinity Church at the west end: a brown tower and spire
    const brown = M("crBrown", "#6b4a3a");
    b.add(boxGeo(V(-168, 0, -9), V(-150, 34, 9), 0), brown); b.add(boxGeo(V(-190, 0, -14), V(-168, 20, 14), 0), brown);
    { const sp2 = new THREE.ConeGeometry(9, 44, 4); sp2.rotateY(Math.PI / 4); sp2.translate(-159, 56, 0); b.add(sp2, brown); }
    // lamp posts
    for (let x = -100; x <= 100; x += 20) for (const z of [6.5, -6.5]) { if (z < 0 && (Math.abs(x) < 14 || x === -20)) continue; if (z > 0 && x >= 0 && x <= 40) continue; cylAt(b, iron, 0.09, 0.12, 4.2, x, SW, z, 8); const gl = new THREE.SphereGeometry(0.3, 10, 8); gl.translate(x, SW + 4.4, z); wb.add(gl, this.winMat); }
    // the newsstand on the south-west corner (it faces the road), with its headline board
    b.add(boxGeo(V(-27.2, SW, -9.8), V(-24.4, SW + 2.3, -8.6)), M("crKiosk", "#3f6f5a")); b.add(boxGeo(V(-27.5, SW + 2.3, -10.0), V(-24.1, SW + 2.5, -7.7)), M("crAwning", "#c9373a"));
    b.add(boxGeo(V(-27.1, SW + 0.9, -8.6), V(-24.5, SW + 1.0, -8.1)), wood);
    this.stand = new Board(1.5, 1.11, "cr_news0", () => newsTex("cr0", "The Daily News", "STOCKS", "SOAR")); this.stand.group.position.set(-22.9, SW + 0.72, -8.3); this.stand.group.rotation.set(-0.16, Math.PI, 0); R.add(this.stand.group);
    b.build(R); wb.build(R, false);
    for (const c of ["#23232b", "#3f5f4a"]) { const cg = car(c); cg.visible = false; R.add(cg); this.cars.push(cg); }

    // ---------------- the room ----------------
    const rb = new Batch(), O = ROOM_O;
    const wall = lam("crRoomWall", () => ({ map: stoneHD("crRoomWallHD", ["#efe2c6", "#e8d9ba", "#f4ead2", "#e2d2b0"], "#b8a684") })), floor = lam("ttDeck", () => ({ map: planksHD() }));
    rb.add(boxGeo(V(O[0] - 10, O[1] - 0.2, O[2] - 16), V(O[0] + 10, O[1], O[2] + 5), 4), floor);
    rb.add(boxGeo(V(O[0] - 7.3, O[1], O[2] - 5), V(O[0] - 7, O[1] + 7.2, O[2] + 3.8), 2), wall);
    rb.add(boxGeo(V(O[0] + 7, O[1], O[2] - 5), V(O[0] + 7.3, O[1] + 7.2, O[2] + 3.8), 2), wall);
    rb.add(boxGeo(V(O[0] - 7.3, O[1], O[2] + 3.5), V(O[0] + 7.3, O[1] + 7.2, O[2] + 3.8), 2), wall);
    rb.add(boxGeo(V(O[0] - 7, O[1], O[2] + 3.44), V(O[0] + 7, O[1] + 1.1, O[2] + 3.5)), M("wainscot", "#7a5236")); rb.add(boxGeo(V(O[0] - 7, O[1] + 1.1, O[2] + 3.42), V(O[0] + 7, O[1] + 1.2, O[2] + 3.5)), gold);
    rb.build(R);
    this.roomSign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.04), lam("sign_cr_room0", () => ({ map: signTex("cr_room0", "ROOM", "#2f2a3a", "#e8c45a") })));
    this.roomSign.rotation.y = Math.PI; this.roomSign.position.set(...Rm(0, 3.35, 3.4)); R.add(this.roomSign);
    this.ceil = new THREE.Mesh(new THREE.BoxGeometry(22, 0.3, 26), M("crCeil", "#e9dcc0")); this.ceil.position.set(...Rm(0, 7.35, -4)); this.ceil.castShadow = false; R.add(this.ceil);
    const part = (G: THREE.Group, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => { const ms = new THREE.Mesh(g, m); ms.position.set(x, y, z); G.add(ms); return ms; };
    // the table (x -2..3, z 0.1..1.1, top at 0.8)
    part(this.table, new THREE.BoxGeometry(5, 0.08, 1.0), M("crCloth", "#2f6b55"), 0.5, 0.76, 0.6);
    for (const [x, z] of [[-1.9, 0.2], [2.9, 0.2], [-1.9, 1.0], [2.9, 1.0]]) part(this.table, new THREE.BoxGeometry(0.1, 0.72, 0.1), wood, x, 0.36, z);
    // the lectern
    part(this.podium, new THREE.BoxGeometry(0.8, 0.86, 0.5), wood, 0, 0.43, 0.9); { const top = part(this.podium, new THREE.BoxGeometry(0.95, 0.06, 0.62), M("crWood2", "#6b4a2f"), 0, 0.9, 0.86); top.rotation.x = -0.25; }
    // the trading post: an eight-sided counter round a pole that carries the price board
    part(this.post, new THREE.CylinderGeometry(1.05, 1.05, 1.1, 8), wood, 0, 0.55, 1.2); part(this.post, new THREE.CylinderGeometry(1.14, 1.14, 0.08, 8), M("crWood2", "#6b4a2f"), 0, 1.14, 1.2);
    part(this.post, new THREE.CylinderGeometry(0.09, 0.09, 2.2, 8), iron, 0, 2.2, 1.2);
    this.postBoard = new Board(2.1, 1.1, "num_POST", () => numTex("U.S. STEEL")); this.postBoard.group.position.set(0, 3.5, 1.1); this.post.add(this.postBoard.group);
    // the ticker: a pedestal, the works, a glass dome, and the tape it spits out (down to the floor, then away from the wall)
    part(this.ticker, new THREE.CylinderGeometry(0.2, 0.26, 1.0, 12), wood, 0, 0.5, 0); part(this.ticker, new THREE.CylinderGeometry(0.2, 0.2, 0.2, 14), gold, 0, 1.1, 0);
    part(this.ticker, new THREE.SphereGeometry(0.26, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M("crGlass", "#cfe6f0"), 0, 1.2, 0); part(this.ticker, new THREE.BoxGeometry(0.6, 0.06, 0.6), wood, 0, 1.0, 0);
    const tapeM = M("crTape", "#fffaf0");
    this.tapeA = part(this.ticker, new THREE.BoxGeometry(0.11, 1, 0.012), tapeM, 0.27, 0.6, -0.1); this.tapeB = part(this.ticker, new THREE.BoxGeometry(0.11, 0.014, 1), tapeM, 0.27, 0.014, -0.1);
    // the bed: frame, striped mattress, pillow, blanket
    part(this.bed, new THREE.BoxGeometry(2.3, 0.3, 1.2), wood, 0, 0.3, 1.5); part(this.bed, new THREE.BoxGeometry(2.2, 0.28, 1.1), lam("crMattress", () => ({ map: mattressTex() })), 0, 0.59, 1.5);
    part(this.bed, new THREE.BoxGeometry(0.12, 1.2, 1.3), wood, 1.2, 0.6, 1.5); part(this.bed, new THREE.BoxGeometry(0.5, 0.14, 0.8), M("crPillow", "#fffaf0"), 0.75, 0.8, 1.5);
    part(this.bed, new THREE.BoxGeometry(1.2, 0.1, 1.14), M("crBlanket", "#c9373a"), -0.5, 0.76, 1.5);
    for (const x of [-1.05, 1.05]) for (const z of [1.0, 2.0]) part(this.bed, new THREE.BoxGeometry(0.1, 0.3, 0.1), wood, x, 0.15, z);
    // the flag on its pole
    part(this.flag, new THREE.CylinderGeometry(0.035, 0.035, 2.9, 8), gold, 0, 1.45, 0); { const f = part(this.flag, new THREE.PlaneGeometry(1.3, 0.82), lam("crFlag", () => ({ map: flagTex(), side: THREE.DoubleSide })), -0.68, 2.4, 0); f.rotation.y = Math.PI; }
    for (const [G, p] of [[this.table, Rm(0, 0, 0)], [this.podium, Rm(0, 0, 0)], [this.post, Rm(0, 0, 0)], [this.ticker, Rm(-3.2, 0, 0.9)], [this.bed, Rm(0, 0, 0)], [this.flag, Rm(-3.6, 0, 2.9)]] as [THREE.Group, V3][]) { G.position.set(...p); shadowAll(G); R.add(G); }
    for (let i = 0; i < 8; i++) { const cp = cashPile(); cp.visible = false; R.add(cp); this.cash.push(cp); }
    const goldM = M("crBar", "#e8b83a");
    for (let i = 0; i < 12; i++) { const gb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.11, 0.15), goldM); gb.castShadow = true; gb.visible = false; R.add(gb); this.gold.push(gb); }
    this.rnum = new Board(1.9, 1.2, "num_205", () => numTex("205")); R.add(this.rnum.group);
    this.case_ = suitcase(); this.case_.visible = false; R.add(this.case_);
    this.paper = new Board(0.9, 0.67, "cr_paper0", () => newsTex("crp0", "The Daily News", "STOCKS", "SOAR")); this.paper.group.visible = false; R.add(this.paper.group);
    this.slips = new Cards(R, slipTex(), 24, 0.5); this.sells = new Cards(R, sellTex(), 14, 0.5); this.bills = new Cards(R, billTex(), 14, 0.4);
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

    // ---------------- the street ----------------
    const sv = st.street ?? {}, bk = sv.bank ?? {};
    const lit = light === "night" ? [3.2, 2.4, 1.1] : light === "golden" ? [1.7, 1.1, 0.55] : light === "grey" ? [0.2, 0.23, 0.3] : [0.16, 0.22, 0.32];
    this.winMat.color.setRGB(lit[0], lit[1], lit[2]);
    const [bkey, btext] = bk.sign ?? ["cr_bank0", "CORNER SAVINGS BANK"];
    const bmat = lam(`sign_${bkey}`, () => ({ map: signTex(bkey, btext, "#2f2a3a", "#e8c45a") }));
    if (this.bankSign.face.material !== bmat) this.bankSign.face.material = bmat;
    const open = bk.open ?? 0;
    this.doors.forEach((d) => { const s = d.userData.s as number; d.position.set(46 + s * (0.75 + 1.35 * open), SW + 2.07, 11.8); });
    this.notice.group.visible = !!bk.notice;
    if (bk.notice) { const [nt, nbg, nfg] = bk.notice; const nm = lam(`notice_${nt}`, () => ({ map: noticeTex(nt, nbg ?? "#fff6dc", nfg ?? "#c9373a") })); if (this.notice.face.material !== nm) this.notice.face.material = nm; this.notice.group.position.set(bk.noticeX ?? 46, bk.noticeY ?? 2.45, bk.noticeX ? 11.9 : 11.68); }
    const nw = sv.news ?? ["cr0", "The Daily News", "STOCKS", "SOAR"];
    { const nm = lam(`news_${nw[0]}`, () => ({ map: newsTex(nw[0], nw[1], nw[2], nw[3]) })); if (this.stand.face.material !== nm) this.stand.face.material = nm; }
    this.cars.forEach((cg, i) => { const c2 = sv.cars?.[i]; cg.visible = !!c2; if (c2) { cg.position.set(c2.x, 0, c2.z); cg.rotation.y = c2.dir > 0 ? 0 : Math.PI; } });
    // ---------------- the room ----------------
    const rm = st.room;
    this.ceil.visible = true;
    if (rm) {
      const [key, text] = rm.sign;
      const mat = lam(`sign_${key}`, () => ({ map: signTex(key, text, "#2f2a3a", "#e8c45a") }));
      if (this.roomSign.material !== mat) this.roomSign.material = mat;
    }
    this.table.visible = !!rm?.table; this.podium.visible = !!rm?.podium; this.bed.visible = !!rm?.bed; this.flag.visible = !!rm?.flag;
    this.post.visible = !!rm?.post;
    if (rm?.post) { const [pt, pbg, pfg] = rm.post; this.postBoard.face.material = unlit(`num_${pt}_${pbg ?? ""}_${pfg ?? ""}`, () => numTex(pt, pbg, pfg)); }
    this.ticker.visible = rm?.ticker !== undefined;
    if (rm?.ticker !== undefined) {
      const k = Math.max(0.001, rm.ticker), drop = Math.min(1, k * 4) * 1.05, runL = Math.max(0.001, (k - 0.25) / 0.75) * 7;
      this.tapeA.scale.y = drop; this.tapeA.position.y = 1.1 - drop / 2; this.tapeA.position.x = 0.27 + 0.01 * Math.sin(t * 9);
      this.tapeB.visible = k > 0.25; this.tapeB.scale.z = runL; this.tapeB.position.z = -0.1 - runL / 2;
    }
    this.cash.forEach((cp, i) => { const p = rm?.cash?.[i] ?? st.cash?.[i]; cp.visible = !!p; if (p) cp.position.set(...p); });
    const ng = rm?.gold ?? 0, gp = rm?.goldAt ?? Rm(0.5, 0.8, 0.6);
    this.gold.forEach((gb, i) => { gb.visible = i < ng; const row = i < 5 ? 0 : i < 9 ? 1 : i < 11 ? 2 : 3, k = i < 5 ? i : i < 9 ? i - 5 : i < 11 ? i - 9 : 0, n = [5, 4, 2, 1][row]; gb.position.set(gp[0] + (k - (n - 1) / 2) * 0.38, gp[1] + 0.055 + row * 0.115, gp[2]); });
    const rn = st.num;
    if (rn) { this.rnum.face.material = unlit(`num_${rn.text}_${rn.bg ?? ""}_${rn.fg ?? ""}`, () => numTex(rn.text, rn.bg, rn.fg)); this.rnum.group.position.set(...rn.p); this.rnum.group.rotation.y = rn.yaw ?? 0; }
    this.rnum.group.visible = !!rn && (rn.k ?? 1) > 0.001; this.rnum.group.scale.setScalar(Math.max(0.001, rn ? rn.k ?? 1 : 1));
    this.case_.visible = !!st.suitcase; if (st.suitcase) this.case_.position.set(...st.suitcase);
    const pp = st.paper;
    this.paper.group.visible = !!pp;
    if (pp) { const nm = lam(`news_${pp.news[0]}`, () => ({ map: newsTex(pp.news[0], pp.news[1], pp.news[2], pp.news[3]) })); if (this.paper.face.material !== nm) this.paper.face.material = nm;
      this.paper.group.position.set(...pp.p); this.paper.group.quaternion.copy(cam.quaternion); this.paper.group.rotateY(Math.PI); this.paper.group.rotateZ(pp.spin ?? 0); this.paper.group.scale.setScalar(pp.s); }
    // ---- cards ----
    this.slips.hide(); this.sells.hide(); this.bills.hide();
    let np = 0, ni = 0, ns = 0;
    for (const cd of st.cards ?? []) {
      if (cd.kind === "slip") { this.slips.put(np, V(...cd.p), cam, cd.spin, cd.s); this.slips.list[np++]?.scale.set(cd.s, cd.s * 0.38, 1); }
      else if (cd.kind === "sell") this.sells.put(ni++, V(...cd.p), cam, cd.spin, cd.s);
      else { this.bills.put(ns, V(...cd.p), cam, cd.spin, cd.s); this.bills.list[ns++]?.scale.set(cd.s, cd.s * 0.5, 1); }
    }

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.man }));
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

