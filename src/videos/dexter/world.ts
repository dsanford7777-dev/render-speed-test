// The Dexter Short's world: four sets (dsets.ts), only the one in shot is switched on.
// Look: character look B (bridge/toon.ts) and the background rules: sets carry no ink line, every light has a source,
// characters cast real shadows (a shadow twin turned to the light), grass near the camera on every lawn.
// Posed per frame: the port in three dressings (Newburyport, Newcastle, the West Indies), the mansion (the coffin for
// the wake), the room's two dressings (tavern / study) and the study's page board; props in hands (warming pans, a
// cane); cards (paper money, gold coins, coal, punctuation marks); puffs (cooking smoke, coal dust).
import * as THREE from "three";
import { V, lam, Kit } from "../bridge/build";
import { Pen, bodyFront, bodySide, fxContact, Outfit } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { Grass } from "../bridge/grass";
import { ctex } from "../bridge/paint";
import { M } from "../frozen/fsets";
import { puffTex, sheetTex } from "../frozen/paint";
import { V3, FPS, SET, RIVER_SUN, WOODS_SUN, NORTH_SUN } from "./place";
import { buildRiver, buildWoods, buildRoom, buildNorth, RiverSet, WoodsSet, RoomSet, NorthSet, warmingPan } from "./dsets";
import { noteTex, coinTex, coalTex, markTex } from "./dpaint";
import type { St3, CardKind } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const LP: Record<Light, LightPreset> = {
  // Newburyport, the 1790s: a clear New England day
  port: { ...D, fogNear: 70, fogFar: 560, lit: [1.36, 1.28, 1.12], shade: [0.44, 0.47, 0.6], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.93], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.3, sunCol: "#fff0d0", sky: "#b9d2ea", ground: "#5a6040", fog: "#c9d6e0" },
  // Newcastle upon Tyne: grey, sooty, low soft light
  newcastle: { ...D, fogNear: 40, fogFar: 300, lit: [1.06, 1.06, 1.08], shade: [0.42, 0.44, 0.5], lift: [0.07, 0.07, 0.08], charTint: [0.98, 0.97, 0.96], sideTint: [0.9, 0.9, 0.92], hemiI: 0.8, sunI: 1.1, sunCol: "#e8e6e0", sky: "#9a9ca0", ground: "#4a4a44", fog: "#a8a8a6" },
  // the West Indies: hot, high sun, saturated
  tropic: { ...D, fogNear: 90, fogFar: 640, lit: [1.44, 1.34, 1.1], shade: [0.42, 0.46, 0.62], lift: [0.06, 0.06, 0.09], charTint: [1.03, 0.99, 0.92], sideTint: [0.92, 0.9, 0.94], hemiI: 0.62, sunI: 2.6, sunCol: "#fff2c8", sky: "#8ec4ec", ground: "#6a6a3a", fog: "#cfe2ec" },
  // the mansion on High Street: a bright day
  mansion: { ...D, fogNear: 70, fogFar: 520, lit: [1.34, 1.27, 1.12], shade: [0.44, 0.47, 0.6], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.93], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.2, sunCol: "#fff0d0", sky: "#b9d2ea", ground: "#5a6040", fog: "#c9d6e0" },
  // the mock wake: the same lawn under an overcast sky
  wake: { ...D, fogNear: 50, fogFar: 380, lit: [1.1, 1.1, 1.12], shade: [0.44, 0.46, 0.54], lift: [0.07, 0.07, 0.08], charTint: [1.0, 0.98, 0.96], sideTint: [0.9, 0.9, 0.93], hemiI: 0.78, sunI: 1.2, sunCol: "#eceae4", sky: "#a8aab0", ground: "#4e5640", fog: "#b4b6b8" },
  // the tavern: two oil lanterns and a window
  tavern: { ...D, fogNear: 30, fogFar: 200, lit: [0.8, 0.66, 0.5], shade: [0.21, 0.17, 0.15], lift: [0.04, 0.03, 0.03], charTint: [1.05, 0.95, 0.83], sideTint: [0.92, 0.86, 0.78], hemiI: 0.36, sunI: 0, sunCol: "#ffe0b0", sky: "#8a7a68", ground: "#3a2a20", fog: "#1a1410" },
  // the study: the candle and the window
  study: { ...D, fogNear: 30, fogFar: 200, lit: [0.92, 0.84, 0.7], shade: [0.26, 0.22, 0.2], lift: [0.05, 0.04, 0.04], charTint: [1.04, 0.96, 0.86], sideTint: [0.92, 0.88, 0.82], hemiI: 0.44, sunI: 0, sunCol: "#ffe8c0", sky: "#a89880", ground: "#3a2a20", fog: "#1e1814" },
};
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { port: "#c9d6e0", newcastle: "#a8a8a6", tropic: "#cfe2ec", mansion: "#c9d6e0", wake: "#b4b6b8", tavern: "#1a1410", study: "#1e1814" };
const SUN: Record<Light, V3> = { port: RIVER_SUN, newcastle: [-0.3, 0.75, -0.6], tropic: [-0.35, 0.82, -0.45], mansion: WOODS_SUN, wake: [-0.3, 0.78, -0.55], tavern: [0, 1, 0], study: [0, 1, 0] };
const SETOF: Record<Light, "river" | "woods" | "room" | "north"> = { port: "river", newcastle: "river", tropic: "river", mansion: "woods", wake: "woods", tavern: "room", study: "room" };
/** lamp-lit sets: characters take light from the point lights, their shadows fall from the key lamp */
const LAMPLIT = new Set<Light>(["tavern", "study"]);
void NORTH_SUN;

// ---------------- cast (Newburyport, the 1790s) ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
const GENT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#e8dcc0", boots: "#1a1618", hat: "tricorn", cap: "#24202a", buttons: "#c9a23a", skin: "#f0d2b0", shirt: "#f6f2e8", tie: "#f6f2e8", ...extra });
const SAIL = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#d8d0bc", boots: "#2a221c", hat: "cap", cap: "#2a2a3a", buttons: jacket, skin: "#e8c4a0", shirt: "#efe6cf", ...extra });
const ISL = (jacket: string, skin: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#e8e0cc", boots: "#3a2a20", hat: "fedora", cap: "#d8c08a", buttons: jacket, skin, shirt: "#f4efe0", ...extra });
/** a painted wooden statue on a column: ordinary costume colours, a touch flatter (they are painted wood), never blinks */
const STAT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#e8dcc0", boots: "#2a2420", hat: "tricorn", cap: "#2a2630", buttons: "#d8b04a", skin: "#e8c09a", shirt: "#f6f2e8", ...extra });
const OUT: Record<string, Who> = {
  // Timothy Dexter: a dark green coat, a cocked hat, a big grin (his portrait has the hat, the cane and the dog)
  dexter: who(GENT("#2e5a3a", { cap: "#1e1c22", band: "#d8b04a", skin: "#f2d0ae", tie: "#f6f2e8", build: "stout" }), 401, "dexter"),
  // Dexter in his leather days: a work shirt and an apron-brown waistcoat, no hat
  dexterw: who({ jacket: "#7a5232", pants: "#5a4a3a", boots: "#2a221c", hat: "hair", hair: "#6a4a2a", buttons: "#7a5232", skin: "#f2d0ae", shirt: "#efe6cf", braces: "#4a3020", build: "stout" }, 401, "dexterw"),
  // Elizabeth, his wife
  wife: who({ jacket: "#3a3a4a", pants: "#2a2a32", boots: "#1e1a20", hat: "bonnet", cap: "#e9e2cf", dress: "#4a4a5e", buttons: "#3a3a4a", skin: "#f5d6b8" }, 402, "wife"),
  // Newburyport's merchants: wigs, cocked hats, fine coats
  m1: who(GENT("#4a2a3a", { moustache: "#8a8a92", hat: "hair", hair: "#e8e6e0" }), 403, "m1"), m2: who(GENT("#2a3a5a", { build: "stout" }), 404, "m2"),
  m3: who(GENT("#5a4a2a", { skin: "#e8c4a0", hat: "hair", hair: "#d8d6d0" }), 405, "m3"), m4: who(GENT("#3a2a22", { moustache: "#3a2a20" }), 406, "m4"),
  // sailors and dockers
  s1: who(SAIL("#2a3a5a"), 407, "s1"), s2: who(SAIL("#6a3a2a", { skin: "#c8946a" }), 408, "s2"), s3: who(SAIL("#3a5a4a", { hat: "hair", hair: "#3a2a20", moustache: "#3a2a20" }), 409, "s3"),
  // Newcastle's miners, idle on strike: dark jackets, caps, coal-smudged
  mn1: who({ jacket: "#3a3a40", pants: "#2e2c30", boots: "#1e1a20", hat: "cap", cap: "#2a2a2e", buttons: "#3a3a40", skin: "#d8b896", braces: "#4a3a2a", moustache: "#2a2220" }, 410, "mn1"),
  mn2: who({ jacket: "#4a4038", pants: "#2e2c30", boots: "#1e1a20", hat: "cap", cap: "#3a3430", buttons: "#4a4038", skin: "#e0c0a0", braces: "#2a2220", build: "stout" }, 411, "mn2"),
  mn3: who({ jacket: "#2e3440", pants: "#2e2c30", boots: "#1e1a20", hat: "hair", hair: "#5a4030", buttons: "#2e3440", skin: "#e8c8a8" }, 412, "mn3"),
  // a Newcastle buyer
  buyer: who(GENT("#3a3a44", { hat: "tophat", cap: "#2e2a36", pants: "#3a3a40" }), 413, "buyer"),
  // the islands: planters and cooks
  i1: who(ISL("#e8dcc0", "#b07c54"), 414, "i1"), i2: who(ISL("#c95a3a", "#a87048", { hat: "hair", hair: "#1e1a1a", dress: "#d8743a" }), 415, "i2"), i3: who(ISL("#f2ecd8", "#b8805a", { moustache: "#1e1a1a" }), 416, "i3"),
  // townsfolk and mourners (the wake), readers
  t1: who({ jacket: "#6a5a7a", pants: "#3a3a44", boots: "#2a221c", hat: "bonnet", cap: "#e9e2cf", dress: "#3a3a46", buttons: "#6a5a7a", skin: "#f5d2b4" }, 417, "t1"),
  t2: who({ jacket: "#2a2a30", pants: "#2a2a32", boots: "#2a221c", hat: "tricorn", cap: "#1e1c22", buttons: "#2a2a30", skin: "#e8c4a0", shirt: "#efe6cf" }, 418, "t2"),
  t3: who({ jacket: "#3a2a2a", pants: "#2a2a32", boots: "#2a221c", hat: "hair", hair: "#c9a060", buttons: "#3a2a2a", skin: "#f0d2b0", shirt: "#efe6cf" }, 419, "t3"),
  t4: who({ jacket: "#2a3a3a", pants: "#3a3a44", boots: "#2a221c", hat: "bonnet", cap: "#d8c0a0", dress: "#2a3434", buttons: "#2a3a3a", skin: "#f0d2b8" }, 420, "t4"),
  t5: who({ jacket: "#2e2a34", pants: "#2a2a32", boots: "#2a221c", hat: "tophat", cap: "#2e2a36", buttons: "#2e2a34", skin: "#e0b48c", moustache: "#2a1a12" }, 421, "t5"),
  t6: who({ jacket: "#4a3a4a", pants: "#3a3a44", boots: "#2a221c", hat: "bonnet", cap: "#e9e2cf", dress: "#3a2e3a", buttons: "#4a3a4a", skin: "#c8946a" }, 422, "t6"),
  // the statues: Washington in his blue and buff, Adams, Jefferson (red hair), Dexter himself, Napoleon, Pitt, Franklin
  washington: who(STAT("#2a4a8a", { pants: "#e8d8b0", hat: "hair", hair: "#f2f0ea", skin: "#ecc8a4", buttons: "#e8c45a", sash: "#e8d8b0" }), 430, "washington"),
  adams: who(STAT("#4a3a2a", { hat: "hair", hair: "#e8e6e0", build: "stout" }), 431, "adams"),
  jefferson: who(STAT("#6a3a2a", { hat: "hair", hair: "#c8643a", skin: "#f0cca8" }), 432, "jefferson"),
  dexstat: who(STAT("#2e5a3a", { cap: "#1e1c22", band: "#e8c45a", skin: "#f2d0ae", build: "stout" }), 433, "dexstat"),
  napoleon: who(STAT("#2a3a6a", { pants: "#f2ecd8", cap: "#1e1c22", band: "#e8c45a", sash: "#c0353a" }), 434, "napoleon"),
  pitt: who(STAT("#3a2a2a", { hat: "hair", hair: "#e8e6e0", pants: "#2a2a2e" }), 435, "pitt"),
  franklin: who(STAT("#6a5a3a", { hat: "hair", hair: "#e8e6e0", build: "stout", skin: "#ecc8a4" }), 436, "franklin"),
  stat1: who(STAT("#8a2a2a", { hat: "hair", hair: "#3a2a20" }), 437, "stat1"), stat2: who(STAT("#2a6a5a", { cap: "#2a2630" }), 438, "stat2"),
  stat3: who(STAT("#e8dcc0", { hat: "hair", hair: "#e8c45a", dress: "#f2ecd8", skin: "#f2d6b8" }), 439, "stat3"), stat4: who(STAT("#5a3a6a", { hat: "crown" }), 440, "stat4"),
  man: who(GENT("#3a3a3a"), 499, "man"),
};

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
const sparkTex = () => ctex("twSpark", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = "#ffd27a"; g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283, r = k % 2 ? 10 : 30; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = "#120c16"; g.lineWidth = 4; g.stroke(); });
const flakeTex = () => ctex("twFlake", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.strokeStyle = "#ffffff"; g.lineWidth = 5; g.lineCap = "round"; for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI; g.beginPath(); g.moveTo(32 - Math.cos(a) * 24, 32 - Math.sin(a) * 24); g.lineTo(32 + Math.cos(a) * 24, 32 + Math.sin(a) * 24); g.stroke(); } });
const nuggetTex = () => ctex("twNugget", 96, 96, (g, r) => { g.clearRect(0, 0, 96, 96); const pts: [number, number][] = []; for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283, rr = 20 + r() * 20; pts.push([48 + Math.cos(a) * rr, 48 + Math.sin(a) * rr * 0.8]); }
  g.fillStyle = "#d9793a"; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.fillStyle = "#ffb27a"; g.beginPath(); g.arc(40, 38, 8, 0, 6.3); g.fill(); g.strokeStyle = "#120c16"; g.lineWidth = 6; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke(); });

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

export class TwWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#2a2024", 80, 600); private bg = new THREE.Color();
  private river: RiverSet; private woods: WoodsSet; private room: RoomSet; private north: NorthSet;
  private grassR: Grass; private grassW: Grass; private grassN: Grass; private northGrass = false;
  private tools: { g: THREE.Group; barrel: THREE.Mesh; heads: Record<string, THREE.Object3D> }[] = [];
  private pans: THREE.Group[] = []; private canes: THREE.Group[] = []; private pot = new THREE.Group();
  private cards: Record<CardKind, CardPool>;
  private puffs: THREE.Sprite[] = [];
  private lastPeople: { name: string; p: V3; low: boolean; extra: boolean; s: number }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    void kit; const R = this.root;
    this.hemi = new THREE.HemisphereLight("#ffe9d0", "#5c4a44", 0.6);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.4);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.river = buildRiver(); this.woods = buildWoods(); this.room = buildRoom(); this.north = buildNorth();
    R.add(this.river.group, this.woods.group, this.room.group, this.north.group);
    this.grassR = new Grass(this.river.group, this.river.turf); this.grassW = new Grass(this.woods.group, this.woods.turf); this.grassN = new Grass(this.north.group, (x, z) => (this.northGrass ? this.north.turf(x, z) : null));
    // ---- posed props: a musket (wooden stock + iron barrel), a penknife, a pickaxe (they keep their ink line) ----
    const wood = M("twToolWood", "#7a5232"), iron = M("twToolIron", "#34303a"), steel = M("twToolSteel", "#eef0f4", { emissive: "#8a8c94", emissiveIntensity: 0.6 });
    for (let i = 0; i < 6; i++) { const g = new THREE.Group(), barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 8), iron); g.add(barrel);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.11), wood); stock.geometry.translate(0, -0.21, 0);
      const knife = new THREE.Group(); { const hnd = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.13, 0.03), wood); hnd.position.y = 0.04; const bl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.008), steel); bl.position.y = -0.1; knife.add(hnd, bl); }
      const pick = new THREE.Group(); { const bb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), iron); pick.add(bb); for (const sx of [-1, 1]) { const tp = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), iron); tp.rotation.z = -sx * Math.PI / 2; tp.position.x = sx * 0.4; pick.add(tp); } }
      const heads = { stock, knife, pick }; for (const h of Object.values(heads)) g.add(h);
      shadowAll(g); g.visible = false; R.add(g); this.tools.push({ g, barrel, heads }); }
    // warming pans to hold (the handle's grip is 0.95 m from the pan's centre along local +x), and canes
    for (let i = 0; i < 6; i++) { const g = warmingPan(1); g.visible = false; R.add(g); this.pans.push(g); }
    const caneW = M("dxCane", "#3a2418"), knob = M("dxKnob", "#d8b04a", { emissive: "#5a3a08", emissiveIntensity: 0.3 });
    for (let i = 0; i < 2; i++) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.012, 1, 8).translate(0, -0.5, 0), caneW)); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), knob)); shadowAll(g); g.visible = false; R.add(g); this.canes.push(g); }
    { const pw = M("dxPewter", "#b8bcc4", { emissive: "#3a3c44", emissiveIntensity: 0.3 }); this.pot.add(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.13, 14).translate(0, 0.065, 0), pw)); this.pot.add(new THREE.Mesh(new THREE.SphereGeometry(0.046, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.13, 0), pw));
      for (let k = 0; k < 5; k++) this.pot.add(new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 4).translate(0.022 * Math.cos(k * 1.26), 0.172, 0.022 * Math.sin(k * 1.26)), M("dxPotHole", "#1e1a22"))); shadowAll(this.pot); this.pot.visible = false; R.add(this.pot); }
    this.cards = { paper: new CardPool(R, sheetTex(), 24, 0.24, 0.3, NOINK), spark: new CardPool(R, sparkTex(), 40, 0.14, 0.14, AFTERINK), flake: new CardPool(R, flakeTex(), 80, 0.09, 0.09, AFTERINK), nugget: new CardPool(R, nuggetTex(), 30, 0.22, 0.22, NOINK),
      note: new CardPool(R, noteTex(), 60, 0.34, 0.21, NOINK), coin: new CardPool(R, coinTex(), 70, 0.14, 0.14, NOINK), coal: new CardPool(R, coalTex(), 40, 0.24, 0.24, NOINK),
      dot: new CardPool(R, markTex("."), 30, 0.22, 0.22, AFTERINK), comma: new CardPool(R, markTex(","), 30, 0.22, 0.22, AFTERINK), qmark: new CardPool(R, markTex("?"), 30, 0.22, 0.22, AFTERINK) };
    const puffT = puffTex();
    for (let i = 0; i < 64; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
    void lam;
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
    const flick = (k: number) => 1 + 0.14 * Math.sin(t * 9 + k) + 0.08 * Math.sin(t * 23 + 2 * k);

    // ---------------- the sets ----------------
    this.river.group.visible = set === "river"; this.woods.group.visible = set === "woods"; this.room.group.visible = set === "room"; this.north.group.visible = false;
    if (set === "river") { const Rv = this.river, trop = light === "tropic", nc = light === "newcastle";
      Rv.trees.visible = !trop; Rv.palms.visible = trop; Rv.pans.visible = !!st.pans3 || trop; Rv.coal.visible = !!st.coal || nc; Rv.strike.visible = nc;
      Rv.skies.day.visible = light === "port"; Rv.skies.grey.visible = nc; Rv.skies.hot.visible = trop;
      Rv.drift(t); Rv.water.U.uSun.value.set(...SUN[light]); this.grassR.update(cam); }
    if (set === "woods") { const Mn = this.woods; Mn.coffin.visible = light === "wake" || !!st.coffin; Mn.skies.day.visible = light !== "wake"; Mn.skies.grey.visible = light === "wake"; Mn.drift(t); this.grassW.update(cam); }
    if (set === "room") { const Rm = this.room; Rm.tavern.visible = light === "tavern"; Rm.study.visible = light === "study"; Rm.congress.visible = false; Rm.conv.visible = false;
      Rm.map.map = Rm.mapTex[st.page ?? "pickle"]; Rm.map.needsUpdate = true;
      Rm.lamps.forEach((l, i) => { l.intensity = light === "tavern" ? 9 * flick(i) * 0.95 : 0; });
      Rm.win.intensity = light === "study" ? 7 : light === "tavern" ? 3 : 0; Rm.candle.intensity = light === "study" ? 7 * flick(3) : 0;
      Rm.stove.intensity = 0; Rm.stoveGlow.visible = false; Rm.drift(t); }
    // ---------------- props ----------------
    this.tools.forEach((tl, i) => { const q = st.tools?.[i]; tl.g.visible = !!q; if (!q) return;
      const gp = V(...q.g), bp = V(...q.b), d = bp.clone().sub(gp), len = d.length(); d.normalize();
      const gun = q.kind === "musket";
      tl.barrel.visible = gun; if (gun) { tl.barrel.position.copy(gp).addScaledVector(d, len / 2); tl.barrel.quaternion.setFromUnitVectors(V(0, 1, 0), d); tl.barrel.scale.set(1, len, 1); }
      const head = gun ? "stock" : q.kind;
      for (const [k, h] of Object.entries(tl.heads)) { h.visible = k === head; if (k !== head) continue; h.position.copy(k === "pick" ? bp : gp); h.quaternion.setFromUnitVectors(V(0, 1, 0), k === "stock" ? d : d.clone().negate()); if (k === "pick") h.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))); } });
    this.pans.forEach((g, i) => { const q = st.pans?.[i]; g.visible = !!q; if (!q) return; const dir = V(...q.dir).normalize(); g.position.set(q.hand[0] + dir.x * 0.95, q.hand[1] + dir.y * 0.95, q.hand[2] + dir.z * 0.95);
      g.quaternion.setFromUnitVectors(V(1, 0, 0), dir.clone().negate()); if (q.roll) g.rotateX(q.roll); });
    this.canes.forEach((g, i) => { const q = st.canes?.[i]; g.visible = !!q; if (!q) return; const d = V(...q.b).sub(V(...q.g)), len = d.length(); g.position.set(...q.g); g.quaternion.setFromUnitVectors(V(0, -1, 0), d.normalize()); g.scale.set(1, len, 1); });
    this.pot.visible = !!st.pot; if (st.pot) { this.pot.position.set(...st.pot); this.pot.rotation.set(0.25 * Math.sin(t * 30), 0, 0.3); }
    for (const p of Object.values(this.cards)) p.hide();
    const cn: Record<string, number> = {};
    for (const cd of st.cards ?? []) { const k = cn[cd.kind] ?? 0; cn[cd.kind] = k + 1; this.cards[cd.kind].put(k, cd.p, cam, cd.spin, cd.s, !!cd.flat); }
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.man }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, low: !!q.low, extra: !!q.extra || !!q.side, s: q.s ?? (OUT[q.who]?.o.build === "kid" ? 0.72 : 1) }));
    const key = st.key ?? [focus.x, focus.y + 2.2, focus.z - 1.5] as V3;
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = w.key.startsWith("stat") || ["washington", "adams", "jefferson", "dexstat", "napoleon", "pitt", "franklin"].includes(w.key) ? 0 : blink(w.seed), ks = q.s ?? (w.o.build === "kid" ? 0.72 : 1);
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz2 = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz2) || 1, n3 = V(nx / nl2, 0, nz2 / nl2), crs = V(n3.z, 0, -n3.x);
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs) / ks, (pc.y - q.p[1]) / ks]; };
      const mirror = !!q.side && (q.side.mirror !== (right.x < 0));
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
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), q.tilt ?? 0);
      act.mesh.scale.set((mirror ? -1 : 1) * ks, ks, 1);
      act.mesh.castShadow = false; act.mesh.receiveShadow = false;
      act.caster.visible = !q.air; act.caster.position.set(...q.p); act.caster.scale.copy(act.mesh.scale);
      act.caster.rotation.set(0, L.sunI <= 0 || LAMPLIT.has(light) ? Math.atan2(key[0] - q.p[0], key[2] - q.p[2]) : Math.atan2(sunDir.x, sunDir.z), 0);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = this.actors[i].caster.visible = false;
    // ---- contact shadows ----
    const cc = set === "room" ? "#2a2420" : light === "newcastle" ? "#4a4848" : "#5a5248";
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
    void SET;
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
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      else if (head.frac > 0.02 && head.frac < 0.97) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12) out.push(`${q.name}: body in shot without the head`);
      if (head.frac > 0.02 && head.h > 1.6 && !st.closeup) out.push(`${q.name}: face fills the screen`);
      if (!q.extra && head.frac >= 0 && head.frac <= 0.02 && body.frac <= 0.12) out.push(`${q.name}: not in shot at all`);
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
