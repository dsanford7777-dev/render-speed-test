// The Cahaba bridge Short's world: three sets (csets.ts), only the one in shot is switched on.
// Look: character look B (bridge/toon.ts) and the background rules (claude/background-and-character-look.md): the sets
// carry no ink line, every light has a source, characters cast real shadows (a shadow twin turned to the light).
// Posed per frame: the train (where it is, its wheels, its fall), the two iron spans, the wreck and its smoke, the
// river; the reward notice; the office's two dressings and the papers on the desk; tools in hands (paste brush,
// reverse lever, pen, crowbar, pick); newspapers held up; flying cards (paper, sparks, splinters); puffs.
import * as THREE from "three";
import { V, lam, Kit } from "../bridge/build";
import { Pen, bodyFront, bodySide, fxContact, Outfit } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { ctex } from "../bridge/paint";
import { M } from "../frozen/fsets";
import { puffTex, sheetTex, hankyTex } from "../frozen/paint";
import { V3, FPS, SET, GORGE_SUN, TOWN_SUN, carPose, spanPose } from "./place";
import { buildGorge, buildTown, buildOffice, GorgeSet, TownSet, OfficeSet } from "./csets";
import { newsTex, caSkyTex } from "./cpaint";
import type { St3, CardKind, NewsKey } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const LP: Record<Light, LightPreset> = {
  // the morning of the wreck: a cold, clear winter morning, low sun
  morn: { ...D, fogNear: 60, fogFar: 520, lit: [1.34, 1.24, 1.06], shade: [0.42, 0.46, 0.6], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.97, 0.9], sideTint: [0.9, 0.9, 0.96], hemiI: 0.62, sunI: 2.3, sunCol: "#ffe4b8", sky: "#b9cde0", ground: "#6a5a48", fog: "#c9d4dc" },
  // the evening after: the light going, fire in the river
  dusk: { ...D, fogNear: 50, fogFar: 420, lit: [0.92, 0.72, 0.66], shade: [0.26, 0.26, 0.42], lift: [0.05, 0.04, 0.09], charTint: [0.98, 0.86, 0.84], sideTint: [0.84, 0.8, 0.92], hemiI: 0.5, sunI: 1.3, sunCol: "#ff9a5a", sky: "#7a6a8a", ground: "#3a3040", fog: "#6a5a6e" },
  // the story the papers told: men on the bridge by night
  night: { ...D, fogNear: 40, fogFar: 360, lit: [0.5, 0.58, 0.9], shade: [0.14, 0.18, 0.36], lift: [0.03, 0.04, 0.09], charTint: [0.8, 0.86, 1.04], sideTint: [0.76, 0.8, 0.98], hemiI: 0.4, sunI: 0.9, sunCol: "#9ab0e8", sky: "#4a5a8e", ground: "#22283e", fog: "#161e3a", charShade: 0.8 },
  // today: a mild bright day, only the piers standing
  today: { ...D, fogNear: 70, fogFar: 600, lit: [1.4, 1.36, 1.24], shade: [0.48, 0.5, 0.58], lift: [0.06, 0.06, 0.08], charTint: [1.0, 0.98, 0.95], sideTint: [0.9, 0.9, 0.94], hemiI: 0.7, sunI: 2.2, sunCol: "#fff2dc", sky: "#b9d2ea", ground: "#6a6048", fog: "#c9d6e0" },
  // the street at night: one lamp by the wall, lit windows
  townN: { ...D, fogNear: 30, fogFar: 260, lit: [0.7, 0.66, 0.84], shade: [0.2, 0.2, 0.34], lift: [0.03, 0.03, 0.07], charTint: [1.0, 0.92, 0.84], sideTint: [0.86, 0.84, 0.92], hemiI: 0.34, sunI: 0.5, sunCol: "#8a9ad8", sky: "#3a4670", ground: "#22202a", fog: "#10142a", charShade: 0.84 },
  // the street by day
  townD: { ...D, fogNear: 50, fogFar: 420, lit: [1.34, 1.26, 1.1], shade: [0.44, 0.46, 0.58], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.97, 0.92], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.2, sunCol: "#ffecc8", sky: "#b9cde0", ground: "#7a6a54", fog: "#c9d2d8" },
  // the railroad's office: a desk lamp and a hanging lamp
  rr: { ...D, fogNear: 30, fogFar: 200, lit: [0.5, 0.4, 0.3], shade: [0.11, 0.09, 0.09], lift: [0.03, 0.02, 0.03], charTint: [1.04, 0.92, 0.78], sideTint: [0.92, 0.84, 0.74], hemiI: 0.2, sunI: 0, sunCol: "#ffd0a0", sky: "#5a4a40", ground: "#2a2018", fog: "#0c0908" },
  // the records room today: a strip light and the desk lamp
  arch: { ...D, fogNear: 30, fogFar: 200, lit: [0.78, 0.8, 0.84], shade: [0.26, 0.28, 0.33], lift: [0.05, 0.05, 0.06], charTint: [0.99, 0.98, 0.98], sideTint: [0.9, 0.92, 0.96], hemiI: 0.5, sunI: 0, sunCol: "#ffffff", sky: "#dfe6ee", ground: "#8a8a84", fog: "#b9c0c8" },
};
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { morn: "#c9d4dc", dusk: "#4a3e58", night: "#0c1228", today: "#c9d6e0", townN: "#0c1024", townD: "#c9d2d8", rr: "#0a0807", arch: "#aab0b8" };
const SUN: Record<Light, V3> = { morn: GORGE_SUN, dusk: [-0.7, 0.22, 0.68], night: [-0.3, 0.6, 0.74], today: [0.4, 0.7, -0.6], townN: [-0.3, 0.6, 0.74], townD: TOWN_SUN, rr: [0, 1, 0], arch: [0, 1, 0] };
const SETOF: Record<Light, "gorge" | "town" | "office"> = { morn: "gorge", dusk: "gorge", night: "gorge", today: "gorge", townN: "town", townD: "town", rr: "office", arch: "office" };
const GSKY: Record<string, "morn" | "dusk" | "night" | "day"> = { morn: "morn", dusk: "dusk", night: "night", today: "day" };
/** lamp-lit sets: characters take light from the point lights, their shadows fall from the key lamp */
const LAMPLIT = new Set<Light>(["townN", "rr", "arch"]);

// ---------------- cast ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** a coal miner of 1896: wool jacket, cap, braces */
const MINER = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#3e3a40", boots: "#1e1a20", hat: "cap", cap: "#3a3430", buttons: jacket, skin: "#ecc8a4", braces: "#5a4028", ...extra });
const SUITED = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: jacket, boots: "#1a1618", hat: "tophat", cap: "#1e1a20", buttons: "#c9a23a", skin: "#f0d2b0", shirt: "#f6f2e8", tie: "#7a1e1e", ...extra });
const OUT: Record<string, Who> = {
  // the railroad's man (top hat, watch-chain buttons) and its lawyer
  rr: who(SUITED("#2a2a32", { build: "stout", moustache: "#3a2a20" }), 101, "rr"),
  lawyer: who(SUITED("#3a3440", { hat: "hair", hair: "#8a8a92", moustache: "#8a8a92", tie: "#2a3a5a" }), 102, "lawyer"),
  // the crew: the engineer, and Sam Spencer the fireman
  engineer: who({ jacket: "#4a6a8a", pants: "#3a4a62", boots: "#1e1a20", hat: "cap", cap: "#5a7a9a", buttons: "#4a6a8a", skin: "#f0d2b0", moustache: "#5a3a22", braces: "#3a4a62", shirt: "#c9c2b0" }, 103, "engineer"),
  fireman: who({ jacket: "#5a5248", pants: "#3a3a40", boots: "#1e1a20", hat: "cap", cap: "#2e2a2c", buttons: "#5a5248", skin: "#8a5a3c", braces: "#3a2a20", shirt: "#b9b2a0" }, 104, "fireman"),
  // miners and their families (on the train, in the town, on the river bank)
  m1: who(MINER("#4a5a6a", { moustache: "#3a2a20" }), 105, "m1"),
  m2: who(MINER("#6a4a3a", { cap: "#2e2a2c", skin: "#e0b48c", build: "stout" }), 106, "m2"),
  m3: who(MINER("#3e4a3a", { hat: "hair", hair: "#c9a060", skin: "#f5c9a0" }), 107, "m3"),
  m4: who(MINER("#5a5248", { moustache: "#8a5a30", plaid: "#3a3430", skin: "#c8946a" }), 108, "m4"),
  // the same four as the newspapers drew them: "fiends", a kerchief over the face
  b1: who(MINER("#4a5a6a", { moustache: "#3a2a20", bandana: "#b3262b" }), 105, "b1"),
  b2: who(MINER("#6a4a3a", { cap: "#2e2a2c", skin: "#e0b48c", build: "stout", bandana: "#b3262b" }), 106, "b2"),
  b3: who(MINER("#3e4a3a", { hat: "hair", hair: "#c9a060", skin: "#f5c9a0", bandana: "#2e4a7a" }), 107, "b3"),
  b4: who(MINER("#5a5248", { moustache: "#8a5a30", plaid: "#3a3430", skin: "#c8946a", bandana: "#b3262b" }), 108, "b4"),
  wife: who({ jacket: "#7a4a5a", pants: "#3a3a44", boots: "#1e1a20", hat: "bonnet", cap: "#e9e2d2", dress: "#5a3a4a", buttons: "#7a4a5a", skin: "#f5d2b4", hair: "#6a4a2a" }, 109, "wife"),
  wife2: who({ jacket: "#4a6a6a", pants: "#3a3a44", boots: "#1e1a20", hat: "bonnet", cap: "#d9cfb4", dress: "#3a5a5a", buttons: "#4a6a6a", skin: "#e8c4a0", hair: "#3a2a20" }, 110, "wife2"),
  kid: who({ jacket: "#8a6a3a", pants: "#4a4a52", boots: "#2a221c", hat: "cap", cap: "#5a4a3a", buttons: "#8a6a3a", skin: "#f5d2b4", build: "kid" }, 111, "kid"),
  old: who(MINER("#5a5a5a", { hat: "hair", hair: "#d8d6d0", moustache: "#d8d6d0", skin: "#e8c8a8" }), 112, "old"),
  // the town at night: a newsboy, a reporter with a notebook, the man who wrote to the paper
  newsboy: who({ jacket: "#6a5a3a", pants: "#3a3a40", boots: "#2a221c", hat: "cap", cap: "#7a2a24", buttons: "#6a5a3a", skin: "#f0d2b0", build: "kid", braces: "#3a2a20", shirt: "#d9d2c2" }, 113, "newsboy"),
  reporter: who({ jacket: "#6a6048", pants: "#4a4438", boots: "#1e1a20", hat: "fedora", cap: "#4a4438", buttons: "#6a6048", skin: "#f5d2b4", shirt: "#f6f2e8", tie: "#3a5a3a", plaid: "#4a4438" }, 114, "reporter"),
  writer: who({ jacket: "#4a3a34", pants: "#3a3038", boots: "#1e1a20", hat: "hair", hair: "#5a3a22", buttons: "#4a3a34", skin: "#f0d2b0", shirt: "#f6f2e8", tie: "#2a2630", moustache: "#5a3a22" }, 115, "writer"),
  // the long-form: Henry Hanbury the conductor (off duty, in his uniform coat), his wife and two children; a farmer
  conductor: who({ jacket: "#26304a", pants: "#26304a", boots: "#1a1618", hat: "cap", cap: "#26304a", buttons: "#c9a23a", skin: "#f0d2b0", moustache: "#3a2a20", shirt: "#f6f2e8", tie: "#1e1a20" }, 117, "conductor"),
  ora: who({ jacket: "#4a5a7a", pants: "#3a3a44", boots: "#1e1a20", hat: "bonnet", cap: "#f0e9d9", dress: "#3a4a6a", buttons: "#4a5a7a", skin: "#f5d2b4", hair: "#8a5a30" }, 118, "ora"),
  girl: who({ jacket: "#8a4a5a", pants: "#3a3a44", boots: "#2a221c", hat: "bonnet", cap: "#f0e9d9", dress: "#7a3a4a", buttons: "#8a4a5a", skin: "#f5d2b4", hair: "#8a5a30", build: "kid" }, 119, "girl"),
  farmer: who({ jacket: "#7a6a4a", pants: "#4a4a3a", boots: "#2a221c", hat: "fedora", cap: "#8a7a5a", buttons: "#7a6a4a", skin: "#e8c4a0", braces: "#3a2a20", plaid: "#5a4a3a", moustache: "#6a5a4a" }, 120, "farmer"),
  // today: the historian
  historian: who({ jacket: "#2f6a6a", pants: "#3a3e4a", boots: "#2a2a2e", hat: "hair", hair: "#7a4a2a", buttons: "#2f6a6a", skin: "#f5d2b4", dress: "#3a3e4a", shirt: "#f0ece2" }, 116, "historian"),
};

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
const sparkTex = () => ctex("caSpark", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = "#fff2a0"; g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283, r = k % 2 ? 10 : 30; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = "#120c16"; g.lineWidth = 4; g.stroke(); });
const chunkTex = () => ctex("caChunk", 96, 96, (g, r) => { g.clearRect(0, 0, 96, 96); const pts: [number, number][] = []; for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283, rr = 20 + r() * 22; pts.push([48 + Math.cos(a) * rr, 48 + Math.sin(a) * rr * 0.55]); }
  g.fillStyle = "#8a6238"; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.strokeStyle = "#120c16"; g.lineWidth = 6; g.stroke(); });
const NEWS: Record<NewsKey, string> = { fiends: "FIENDS!|WRECK TRAIN", did: "TRAIN|WRECKERS|DID IT", robbers: "ROBBERS!|$10,000 REWARD" };

/** camera-facing cut-out cards of one kind */
class CardPool {
  list: THREE.Mesh[] = [];
  constructor(root: THREE.Object3D, tex: THREE.Texture, n: number, w: number, h: number, layer: number) {
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, fog: false });
    for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.visible = false; m.layers.set(layer); m.renderOrder = 3; root.add(m); this.list.push(m); }
  }
  hide() { for (const m of this.list) m.visible = false; }
  put(k: number, p: V3, cam: THREE.Camera, spin: number, s: number, flat: boolean) { const m = this.list[k]; if (!m) return; m.visible = true; m.position.set(...p);
    if (flat) m.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, spin)); else { m.quaternion.copy(cam.quaternion); m.rotateZ(spin); } m.scale.setScalar(s); }
}

export class CWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#2a2024", 80, 600); private bg = new THREE.Color();
  private gorge: GorgeSet; private town: TownSet; private office: OfficeSet;
  private tools: { g: THREE.Group; handle: THREE.Mesh; heads: Record<string, THREE.Object3D> }[] = [];
  private cards: Record<CardKind, CardPool>;
  private puffs: THREE.Sprite[] = [];
  private news: THREE.Mesh[] = []; private newsT: Record<NewsKey, THREE.Texture>;
  private viewT: Record<"night" | "day", THREE.Texture>;
  private lastPeople: { name: string; p: V3; low: boolean; extra: boolean; s: number }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    void kit; const R = this.root;
    this.hemi = new THREE.HemisphereLight("#ffe9d0", "#5c4a44", 0.6);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.4);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.gorge = buildGorge(); this.town = buildTown(); this.office = buildOffice();
    R.add(this.gorge.group, this.town.group, this.office.group);
    // ---- posed props (these keep their ink line: they are what the characters hold) ----
    const wood = M("caToolWood", "#8a6238"), iron = M("caToolIron", "#34303a"), brassM = M("caToolBrass", "#c9a23a");
    for (let i = 0; i < 4; i++) { const g = new THREE.Group(), handle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 8), wood); g.add(handle);
      const brush = new THREE.Group(); { const hd = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.07), wood); brush.add(hd); const br = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.1, 0.06), M("caBristle", "#e9e2cf")); br.position.y = -0.07; brush.add(br); }
      const lever = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), brassM);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.03), iron);
      const pick = new THREE.Group(); { const bb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), iron); pick.add(bb); for (const sx of [-1, 1]) { const tp = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), iron); tp.rotation.z = -sx * Math.PI / 2; tp.position.x = sx * 0.4; pick.add(tp); } }
      const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.16, 6), M("caPen", "#1a1a1e"));
      const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.14, 6), M("caPencil", "#c9a23a"));
      const heads = { brush, lever, bar, pick, quill, pencil }; for (const h of Object.values(heads)) g.add(h);
      shadowAll(g); g.visible = false; R.add(g); this.tools.push({ g, handle, heads }); }
    this.cards = { paper: new CardPool(R, sheetTex(), 24, 0.24, 0.3, NOINK), spark: new CardPool(R, sparkTex(), 30, 0.14, 0.14, AFTERINK), chunk: new CardPool(R, chunkTex(), 40, 0.5, 0.5, NOINK), cloth: new CardPool(R, hankyTex(), 6, 0.26, 0.26, NOINK) };
    const puffT = puffTex();
    for (let i = 0; i < 48; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
    this.newsT = { fiends: newsTex(NEWS.fiends), did: newsTex(NEWS.did), robbers: newsTex(NEWS.robbers) };
    for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.667), new THREE.MeshBasicMaterial({ map: this.newsT.fiends, side: THREE.DoubleSide, color: new THREE.Color(0.92, 0.9, 0.86) })); m.visible = false; m.castShadow = true; R.add(m); this.news.push(m); }
    this.viewT = { night: caSkyTex("night"), day: caSkyTex("day") };
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose the world for shot `id` (spec st) at frame f */
  update(_id: number, st: St3, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, light: Light = st.light, L = LP[light], set = SETOF[light];
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.04; cam.far = 2400; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...(st.focus ?? c.look)), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    this.gorge.group.visible = set === "gorge"; this.town.group.visible = set === "town"; this.office.group.visible = set === "office";
    // ---- lights ----
    const sunDir = this.v.set(...SUN[light]).normalize().clone();
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI; this.sun.castShadow = L.sunI > 0;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 6, 10, 70);
    this.sun.position.copy(focus).addScaledVector(sunDir, 120); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 1; sc.far = 260; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LK.bounce); TONE.uSat.value = LK.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint); CHAR.uLamp.value.x = LAMPLIT.has(light) ? 1 : 0;
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = this.bg.set(BG[light]);

    // ---------------- the sets ----------------
    if (set === "gorge") { const G2 = this.gorge, ox = SET.gorge[0], tr = st.train, fall = tr?.fall ?? (st.wreck || st.ruin ? 2 : 0);
      for (const [k, m] of Object.entries(G2.skies)) m.visible = k === GSKY[light];
      G2.water.U.uTime.value = t; G2.water.U.uSun.value.set(...SUN[light]);
      G2.foam.forEach((m, i) => { m.rotation.z = t * 0.25 + i; const k = 1 + 0.1 * Math.sin(t * 2 + i * 1.3); m.scale.set(k, k, 1); });
      G2.works.visible = !st.ruin;
      G2.spans.forEach((s, i) => { const sp = spanPose(i, fall); s.visible = sp.on; s.position.set(ox + sp.p[0], sp.p[1], sp.p[2]); s.rotation.set(sp.rx, 0, sp.rz); });
      G2.cars.forEach((car, i) => { car.g.visible = !!tr; if (!tr) return; const cp = carPose(tr.x, i, tr.fall ?? 0); car.g.visible = cp.on; car.g.position.set(ox + cp.p[0], cp.p[1], cp.p[2]); car.g.rotation.set(cp.rx, 0, cp.rz);
        const roll = tr.locked ? 0 : cp.p[0]; for (const w of car.wheels) w.rotation.z = roll / (w.userData.r as number); car.rods.forEach((r) => { r.position.y = 0.86 + 0.3 * Math.sin(roll / 0.86); r.position.x = 0.75 + 0.3 * Math.cos(roll / 0.86); }); });
      G2.head.intensity = tr && light !== "today" ? 6 : 0; G2.cabLamp.intensity = st.cab ? 5 * (1 + 0.1 * Math.sin(t * 9)) : 0;
      const stack = tr ? carPose(tr.x, 0, tr.fall ?? 0) : null;
      G2.steam.forEach((s, i) => { const on = !!stack && stack.on && (tr!.fall ?? 0) < 0.25; s.visible = on; if (!on) return; const u = (t * 0.9 + i / G2.steam.length) % 1, sp = tr!.speed ?? 9; s.position.set(ox + stack!.p[0] - 3.7 + sp * u * 1.1, stack!.p[1] + 4.8 + 3.4 * Math.sqrt(u), 0.3 * Math.sin(i * 2.1)); s.scale.setScalar(1.0 + 4.2 * u); (s.material as THREE.SpriteMaterial).opacity = 0.75 * (1 - u); });
      G2.wreck.visible = !!st.wreck; G2.fire.intensity = st.wreck ? 26 * (1 + 0.14 * Math.sin(t * 9) + 0.08 * Math.sin(t * 23)) : 0;
      G2.embers.forEach((e, i) => { e.scale.set(1, 1.7 + 0.5 * Math.sin(t * 11 + i * 2), 1); });
      G2.smoke.forEach((s, i) => { s.visible = !!st.wreck; if (!st.wreck) return; const u = (t * 0.12 + i / G2.smoke.length) % 1; s.position.set(ox + (i % 3) * 4 - 4 + 5 * u * u, 3 + 34 * u, -1 + 1.5 * Math.sin(i * 1.7)); s.scale.setScalar(4 + 16 * u); (s.material as THREE.SpriteMaterial).opacity = 0.62 * (1 - u * 0.85); });
      G2.mist.points.visible = light === "morn" || light === "dusk"; G2.drift(t); }
    if (set === "town") { const T2 = this.town, night = light === "townN"; T2.lit.visible = night; T2.skies.night.visible = night; T2.skies.day.visible = !night;
      T2.lamps.forEach((l, i) => { l.intensity = 14 * (1 + 0.06 * Math.sin(t * 11 + i * 2) + 0.04 * Math.sin(t * 27 + i)); });
      T2.poster.visible = st.poster === "reward"; T2.posterQ.visible = st.poster === "q"; T2.dust.points.visible = night; T2.drift(t); }
    if (set === "office") { const O = this.office, old = light === "rr"; O.old.visible = old; O.arch.visible = !old; O.view.map = this.viewT[old ? "night" : "day"];
      O.lamp.intensity = (old ? 9 : 4) * (1 + 0.05 * Math.sin(t * 9)); O.hang.intensity = old ? 7 * (1 + 0.04 * Math.sin(t * 7)) : 0; O.tube.intensity = old ? 0 : 8;
      O.sacks.forEach((s, i) => { s.visible = i < (st.sacks ?? 0); }); O.blueprint.visible = !!st.blueprint; O.folder.visible = !!st.folder; O.letter.visible = !!st.letter; O.claims.visible = !!st.claims; O.drift(t); }

    // ---------------- props ----------------
    this.tools.forEach((tl, i) => { const q = st.tools?.[i]; tl.g.visible = !!q; if (!q) return;
      const gp = V(...q.g), bp = V(...q.b), d = bp.clone().sub(gp), len = d.length(); d.normalize();
      const short = q.kind === "quill" || q.kind === "pencil";
      tl.handle.visible = !short; tl.handle.position.copy(gp).addScaledVector(d, len / 2); tl.handle.quaternion.setFromUnitVectors(V(0, 1, 0), d); tl.handle.scale.set(q.kind === "lever" || q.kind === "bar" ? 1.5 : 1, len, q.kind === "lever" || q.kind === "bar" ? 1.5 : 1);
      for (const [k, h] of Object.entries(tl.heads)) { h.visible = k === q.kind; if (k !== q.kind) continue;
        if (short) { h.position.copy(gp).addScaledVector(d, len / 2); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); h.scale.setScalar(q.s ?? 1); }
        else if (k === "lever") { h.position.copy(gp); }
        else { h.position.copy(bp); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); } } });
    for (const p of Object.values(this.cards)) p.hide();
    const cn: Record<string, number> = {};
    for (const cd of st.cards ?? []) { const k = cn[cd.kind] ?? 0; cn[cd.kind] = k + 1; this.cards[cd.kind].put(k, cd.p, cam, cd.spin, cd.s, !!cd.flat); }
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });
    this.news.forEach((m, i) => { const n = st.news?.[i]; m.visible = !!n; if (!n) return; (m.material as THREE.MeshBasicMaterial).map = this.newsT[n.head]; m.position.set(...n.p); m.rotation.set(n.tilt ?? 0, Math.atan2(cam.position.x - n.p[0], cam.position.z - n.p[2]) + (n.yaw ?? 0), n.roll ?? 0, "YXZ"); m.scale.setScalar(n.s ?? 1); });

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.m1 }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, low: !!q.low, extra: !!q.extra || !!q.side, s: q.s ?? (OUT[q.who]?.o.build === "kid" ? 0.72 : 1) }));
    const key = st.key ?? [focus.x, focus.y + 2.2, focus.z - 1.5] as V3;
    let ai = 0; const cloths: V3[] = [];
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed), ks = q.s ?? (w.o.build === "kid" ? 0.72 : 1);
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz2 = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz2) || 1, n3 = V(nx / nl2, 0, nz2 / nl2), crs = V(n3.z, 0, -n3.x);
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs) / ks, (pc.y - q.p[1]) / ks]; };
      const mirror = !!q.side && (q.side.mirror !== (right.x < 0));
      // a mask (protective suit) or a cloth to the mouth (the sick): a white card just in front of the face; the cloth needs a hand
      if (q.sling) cloths.push([q.p[0] + n3.x * 0.2 + crs.x * 0.1, q.p[1] + 1.02 * ks, q.p[2] + n3.z * 0.2 + crs.z * 0.1]);
      const lt = mirror ? Math.PI - lightA : lightA;
      if (q.side) {
        const ph = Math.round(q.side.phase * 16) / 16, cw3 = q.side.carry, cy = cw3 ? onCard(V(...cw3)) : null, carry = cy ? [300 + (mirror ? -cy[0] : cy[0]) / SUc, 975 - cy[1] / SUc] as [number, number] : undefined;
        const kkey = `S|${w.key}|${q.expr}|${ph}|${bl}|${lt.toFixed(2)}|${carry ? carry.map((x) => Math.round(x / 12)).join(",") : ""}|${q.side.stride ?? 0.8}`;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodySide(p, w.o, { mode: "march", phase: ph, expr: q.expr, blink: bl, stride: q.side!.stride ?? 0.8, stomp: 0.4, light: lt, seed: w.seed, carry }));
      } else {
        let hr: [number, number] | undefined, hl: [number, number] | undefined;
        const give = (hc: [number, number]) => { if ((hc[0] >= 0 && !hr) || hl) hr = hc; else hl = hc; };
        for (const hwp of q.hw ?? []) give(onCard(V(...hwp)));
        const hk = hr || hl ? [hr, hl].flat().map((x) => (x ?? 9).toFixed(2)).join(",") : "";
        const kkey = `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${hk}|${q.march === undefined ? "" : Math.round(q.march * 12)}|${lt.toFixed(2)}`;
        const hands = hr || hl ? { r: hr ? [300 + hr[0] / SUc, 975 - hr[1] / SUc] as [number, number] : undefined, l: hl ? [300 + hl[0] / SUc, 975 - hl[1] / SUc] as [number, number] : undefined } : undefined;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodyFront(p, w.o, { mode: q.march === undefined ? "stand" : "march", phase: q.march === undefined ? undefined : Math.round(q.march * 12) / 12, expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: hands ? undefined : q.wave, hands, light: lt, seed: w.seed }));
      }
      act.mesh.visible = true;
      act.mesh.position.set(...q.p);
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      act.mesh.scale.set((mirror ? -1 : 1) * ks, ks, 1);
      act.mesh.castShadow = false; act.mesh.receiveShadow = false;
      act.caster.visible = true; act.caster.position.set(...q.p); act.caster.scale.copy(act.mesh.scale);
      act.caster.rotation.set(0, L.sunI <= 0 || LAMPLIT.has(light) ? Math.atan2(key[0] - q.p[0], key[2] - q.p[2]) : Math.atan2(sunDir.x, sunDir.z), 0);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = this.actors[i].caster.visible = false;
    cloths.forEach((hp, i) => this.cards.cloth.put((cn.cloth ?? 0) + i, hp, cam, 0.5, 1.05, false));
    // ---- contact shadows ----
    const cc = set === "office" ? "#3a2a24" : "#5a5248";
    let fi = 0;
    for (const { q } of people) {
      if (q.low || q.air) continue;
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
    void lam;
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
      const k = q.s, head = box(q.p, -0.27 * k, 0.27 * k, 1.16 * k, 1.84 * k), body = box(q.p, -0.3 * k, 0.3 * k, (q.low ? 1.0 : 0.05) * k, 1.16 * k);
      // every character is measured, extras included: nobody may be half in frame (checklist, Nov 17)
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      else if (head.frac > 0.02 && head.frac < 0.97) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12) out.push(`${q.name}: body in shot without the head`);
      if (head.frac > 0.02 && head.h > 1.6 && !st.closeup) out.push(`${q.name}: face fills the screen`);
    }
    for (const [name, at, r] of st.subjects ?? []) {
      const v3 = V(...at);
      p.copy(v3).project(cam);
      if (p.z > 1 || Math.abs(p.x) > 0.92 || Math.abs(p.y) > 0.9) { out.push(`${name}: not in shot`); continue; }
      if (p.y < -0.48 && Math.abs(p.x) < 0.6) out.push(`${name}: under the subtitles`);
      const dir = v3.clone().sub(cam.position), dist = dir.length();
      this.ray.set(cam.position, dir.normalize()); this.ray.far = dist; this.ray.camera = cam; this.ray.layers.set(0); this.ray.layers.enable(NOINK);
      const hit = this.ray.intersectObject(this.root, true).find((h) => {
        const m = h.object as THREE.Mesh, mat = m.material as THREE.Material;
        if (!m.isMesh) return false;
        let o: THREE.Object3D | null = m; while (o) { if (!o.visible) return false; o = o.parent; }
        return !(Array.isArray(mat) ? false : mat.transparent || (mat as THREE.Material & { alphaTest?: number }).alphaTest > 0 || mat.colorWrite === false);
      });
      if (hit && hit.distance < dist - r) out.push(`${name}: hidden behind something ${(dist - hit.distance).toFixed(2)} m in front of it`);
    }
    return out;
  }
}
