// The War of the Bucket Short's world: three sets (bsets.ts), only the one in shot is switched on; war horses and race
// horses (hayes/horse.ts) with riders as character cards on the saddle; the two armies as instanced cards (Bologna's
// many, Modena's few) with banners; the bucket as a prop that hangs, is carried and is held up.
// Look: character look B (bridge/toon.ts) and the background rules: every light has a source, characters cast real
// shadows (a shadow twin turned to the light). Nobody is shown hurt: the battle is charges, banners and men running.
import * as THREE from "three";
import { V } from "../bridge/build";
import { Pen, bodyFront, bodySide, fxContact, Outfit, rideUp, RIDE_DX } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { cardShade } from "../bridge/cardshade";
import { Grass } from "../bridge/grass";
import { ctex } from "../bridge/paint";
import { puffTex } from "../frozen/paint";
import { Horse, COATS } from "../hayes/horse";
import { V3, FPS, SET, GATE_SUN, NIGHT_SUN, DUSK_SUN, GREY_SUN, hillY } from "./place";
import { buildGate, buildHill, buildRoom, GateSet, HillSet, RoomSet, bucketGroup, bannerPole } from "./bsets";
import { pageTex, decreeTex } from "./bpaint";
import type { St3, Person3, CardKind } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const LP: Record<Light, LightPreset> = {
  // outside Bologna's walls: a clear autumn afternoon
  day: { ...D, fogNear: 120, fogFar: 900, lit: [1.38, 1.3, 1.14], shade: [0.42, 0.45, 0.58], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.93], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.3, sunCol: "#fff0d0", sky: "#b9d2ea", ground: "#5a6040", fog: "#c9d6e0" },
  // Monteveglio at night, September: moonlight and two torches at the gate
  night: { ...D, fogNear: 50, fogFar: 420, lit: [0.56, 0.62, 0.92], shade: [0.15, 0.19, 0.36], lift: [0.03, 0.04, 0.09], charTint: [0.84, 0.88, 1.04], sideTint: [0.78, 0.82, 0.98], hemiI: 0.42, sunI: 0.9, sunCol: "#9ab0e8", sky: "#4a5a8e", ground: "#22283e", fog: "#161e3a", charShade: 0.8 },
  // Zappolino, November 15, near sunset
  dusk: { ...D, fogNear: 90, fogFar: 640, lit: [1.32, 0.98, 0.74], shade: [0.32, 0.3, 0.48], lift: [0.06, 0.05, 0.09], charTint: [1.05, 0.9, 0.8], sideTint: [0.9, 0.84, 0.92], hemiI: 0.55, sunI: 2.1, sunCol: "#ffa868", sky: "#c89a9a", ground: "#4a3e38", fog: "#c89480" },
  // the hill country on a clear day (the armies gathering)
  field: { ...D, fogNear: 120, fogFar: 900, lit: [1.38, 1.3, 1.14], shade: [0.42, 0.45, 0.58], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.93], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.3, sunCol: "#fff0d0", sky: "#b9d2ea", ground: "#5a6040", fog: "#c9d6e0" },
  // January: a grey winter day
  grey: { ...D, fogNear: 80, fogFar: 600, lit: [1.16, 1.16, 1.2], shade: [0.48, 0.5, 0.6], lift: [0.07, 0.07, 0.09], charTint: [0.98, 0.98, 1.0], sideTint: [0.92, 0.92, 0.96], hemiI: 0.8, sunI: 1.0, sunCol: "#eef0f2", sky: "#c4c8d0", ground: "#5a6050", fog: "#c0c4ca" },
  // the tower room in Modena: daylight from the slit, the painted walls
  tower: { ...D, fogNear: 30, fogFar: 160, lit: [1.06, 1.0, 0.9], shade: [0.3, 0.3, 0.38], lift: [0.06, 0.06, 0.08], charTint: [1.02, 0.98, 0.92], sideTint: [0.92, 0.9, 0.92], hemiI: 0.62, sunI: 0, sunCol: "#fff2dc", sky: "#d8d0c8", ground: "#5a4a3a", fog: "#1a1820" },
  // the Pope's hall: candles and tall windows, red drapes
  pope: { ...D, fogNear: 30, fogFar: 160, lit: [1.02, 0.94, 0.84], shade: [0.28, 0.26, 0.32], lift: [0.05, 0.05, 0.06], charTint: [1.04, 0.97, 0.9], sideTint: [0.92, 0.88, 0.9], hemiI: 0.5, sunI: 0, sunCol: "#ffe8c4", sky: "#d8ccb8", ground: "#5a4436", fog: "#241c18" },
  // the Emperor's hall: the same room, blue drapes
  emp: { ...D, fogNear: 30, fogFar: 160, lit: [1.0, 0.96, 0.9], shade: [0.27, 0.27, 0.34], lift: [0.05, 0.05, 0.07], charTint: [1.03, 0.98, 0.93], sideTint: [0.9, 0.9, 0.94], hemiI: 0.5, sunI: 0, sunCol: "#f6f0e4", sky: "#d0ccc4", ground: "#4a4038", fog: "#1e1c20" },
  // the poet's study, 1600s: a candle and the window
  study: { ...D, fogNear: 30, fogFar: 140, lit: [0.98, 0.88, 0.74], shade: [0.24, 0.21, 0.22], lift: [0.04, 0.04, 0.04], charTint: [1.05, 0.95, 0.85], sideTint: [0.92, 0.86, 0.82], hemiI: 0.42, sunI: 0, sunCol: "#ffe0b0", sky: "#b8a890", ground: "#3a2a20", fog: "#1a1410" },
};
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { day: "#c9d6e0", field: "#c9d6e0", night: "#0c1228", dusk: "#4a3e58", grey: "#c0c4ca", tower: "#1a1820", pope: "#241c18", emp: "#1e1c20", study: "#1a1410" };
const SUN: Record<Light, V3> = { day: GATE_SUN, field: GATE_SUN, night: NIGHT_SUN, dusk: DUSK_SUN, grey: GREY_SUN, tower: [0, 1, 0], pope: [0, 1, 0], emp: [0, 1, 0], study: [0, 1, 0] };
const SETOF: Record<Light, "gate" | "hill" | "room"> = { day: "gate", field: "hill", night: "hill", dusk: "hill", grey: "hill", tower: "room", pope: "room", emp: "room", study: "room" };
const LAMPLIT = new Set<Light>(["tower", "pope", "emp", "study"]);

// ---------------- cast (1325, and the poet in the 1610s) ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** Bologna's foot: white tunics with the city's red cross, iron kettle hats, spears */
const BO = (extra: Partial<Outfit> = {}): Outfit => ({ jacket: "#efe8d8", cross: "#c8262c", pants: "#6a4a3a", boots: "#2a201c", hat: "kettle", cap: "#8a8e96", buttons: "#efe8d8", skin: "#f0d2b0", belt: "#5a3a26", spear: true, ...extra });
/** Modena's men: blue tunics with a yellow sash (the city's yellow and blue), kettle hats, spears */
const MO = (extra: Partial<Outfit> = {}): Outfit => ({ jacket: "#2a4aa8", sash: "#f2c230", pants: "#4a3a2e", boots: "#2a201c", hat: "kettle", cap: "#7a7e88", buttons: "#2a4aa8", skin: "#ecc8a4", belt: "#3a2a1e", spear: true, ...extra });
const TOWN = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#5a4a3a", boots: "#2a201c", hat: "hair", hair: "#5a3a24", buttons: jacket, skin: "#f0d2b0", ...extra });
export const OUT: Record<string, Who> = {
  bo1: who(BO({ moustache: "#5a3a24" }), 401, "bo1"), bo2: who(BO({ skin: "#e0b48c" }), 402, "bo2"), bo3: who(BO({ build: "stout", moustache: "#3a2a20" }), 403, "bo3"), bo4: who(BO({ skin: "#f5d6b8" }), 404, "bo4"),
  mo1: who(MO({ moustache: "#3a2a20" }), 405, "mo1"), mo2: who(MO({ skin: "#e0b48c" }), 406, "mo2"), mo3: who(MO({ build: "stout" }), 407, "mo3"), mo4: who(MO({ skin: "#f5d6b8", moustache: "#6a4a2a" }), 408, "mo4"),
  // the two traitors inside Monteveglio: Bologna's garrison, no spears (they work the gate)
  tr1: who(BO({ spear: false, moustache: "#2a1a12", hat: "hair", hair: "#2a1a12" }), 409, "tr1"), tr2: who(BO({ spear: false, skin: "#e0b48c", build: "stout" }), 410, "tr2"),
  // Bologna's podestà, who led its army: a red robe and a black cap
  podesta: who({ jacket: "#a8262c", pants: "#3a2a2a", boots: "#1e1a1a", hat: "beret", cap: "#1e1a20", buttons: "#e0b440", skin: "#ecc8a4", moustache: "#8a8a8a", sash: "#e0b440", build: "stout" }, 411, "podesta"),
  // Passerino Bonacolsi, lord of Mantua and Modena (no likeness is known: a lord in Modena's blue with a gold collar)
  bona: who({ jacket: "#1e3a8a", pants: "#2a2430", boots: "#1a1618", hat: "beret", cap: "#8a1e24", buttons: "#e0b440", skin: "#ecc8a4", moustache: "#3a2418", sash: "#e0b440", sword: true }, 412, "bona"),
  // Pope John XXII: white robes, a red cape, the mitre
  pope: who({ jacket: "#b8202a", pants: "#f4f0e6", boots: "#8a1e24", hat: "mitre", cap: "#f4f0e6", buttons: "#e0b440", skin: "#ecc8a4", dress: "#f4f0e6", build: "stout" }, 413, "pope"),
  // the Emperor, Louis of Bavaria: a crown and a red robe
  emp: who({ jacket: "#8a1e24", pants: "#2a2430", boots: "#1a1618", hat: "crown", buttons: "#e0b440", skin: "#f0d2b0", moustache: "#8a5a2a", dress: "#6a1a20", sash: "#e0b440" }, 414, "emp"),
  // Alessandro Tassoni, the poet (1565-1635): black doublet, white collar, a black cap, grey moustache
  poet: who({ jacket: "#1e1c24", pants: "#1e1c24", boots: "#1a1618", hat: "beret", cap: "#1a1820", buttons: "#c9c6be", skin: "#ecc8a4", moustache: "#9a9a9a", shirt: "#f6f2e8", tie: "#f6f2e8" }, 415, "poet"),
  // Modena's horsemen and the riders of the palio
  rm1: who(MO({ spear: false, moustache: "#3a2a20" }), 416, "rm1"), rm2: who(MO({ spear: false, skin: "#e0b48c" }), 417, "rm2"), rm3: who(MO({ spear: false, build: "stout" }), 418, "rm3"),
  pr1: who(MO({ spear: false, hat: "hair", hair: "#3a2418", sash: "#f2c230" }), 419, "pr1"), pr2: who(MO({ spear: false, hat: "hair", hair: "#7a5a2a", jacket: "#f2c230", sash: "#2a4aa8" }), 420, "pr2"), pr3: who(MO({ spear: false, hat: "cap", cap: "#2a4aa8", jacket: "#2a4aa8" }), 421, "pr3"),
  // Bologna's townspeople on the wall
  bc1: who(TOWN("#7a5a3a", { moustache: "#5a3a24" }), 422, "bc1"), bc2: who(TOWN("#5a6a7a", { hat: "bonnet", cap: "#e9e2cf", dress: "#6a7a8a" }), 423, "bc2"), bc3: who(TOWN("#8a3a2a", { hair: "#2a1a12" }), 424, "bc3"),
};
/** the horses: three war horses for Modena's cavalry, three for the palio */
export const HORSES = [
  { coat: COATS.bay, cloth: "#2a4aa8", key: "w1" }, { coat: COATS.grey, cloth: "#f2c230", key: "w2" }, { coat: COATS.darkbay, cloth: "#2a4aa8", key: "w3" },
  { coat: COATS.chestnut, cloth: "#f2c230", key: "p1" }, { coat: COATS.black, cloth: "#2a4aa8", key: "p2" }, { coat: COATS.grey, cloth: "#c8262c", key: "p3" },
];

// ---------------- the armies (hill set): Bologna's many on the slope below the castle, Modena's few on the plain ----------------
export type ArmyKey = "bolo" | "mode";
type Rank = { p: V3; r: number };
const hy = (x: number, z: number) => hillY(x - SET.hill[0], z);
const rr = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ranks = (x0: number, x1: number, z0: number, z1: number, dx: number, dz: number, seed: number): Rank[] => {
  const out: Rank[] = []; let k = 0;
  for (let z = z0; z <= z1; z += dz) for (let x = x0 + ((Math.round((z - z0) / dz) % 2) * dx) / 2; x <= x1; x += dx) { const px = SET.hill[0] + x + (rr(seed + k) - 0.5) * dx * 0.45, pz = z + (rr(seed + k + 5000) - 0.5) * dz * 0.4; out.push({ p: [px, hy(px, pz), pz], r: rr(seed + k + 9000) }); k++; }
  return out; };
export const ARMY: Record<ArmyKey, { ranks: Rank[]; march: V3; flee: V3 }> = {
  bolo: { ranks: ranks(-52, 52, 10, 26, 1.55, 1.15, 11), march: [0, 0, -1], flee: [1, 0, 0.35] },
  mode: { ranks: ranks(-17, 17, -13, -2, 1.45, 1.0, 77), march: [0, 0, 1], flee: [0, 0, 1] },
};
/** where rank i of an army stands at time u (s) in a state */
export const armyAt = (k: ArmyKey, i: number, state: "stand" | "march" | "flee", u: number): V3 => {
  const a = ARMY[k], rk = a.ranks[i], v = state === "stand" ? 0 : state === "march" ? 1.2 : 3.4 * (0.75 + 0.5 * rk.r), d = state === "flee" ? a.flee : a.march, s = Math.max(0, u - (state === "flee" ? rk.r * 0.8 : 0)) * v;
  const l = Math.hypot(d[0], d[2]) || 1, x = rk.p[0] + (d[0] / l) * s, z = rk.p[2] + (d[2] / l) * s; return [x, hy(x, z), z]; };

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const dustTex = () => ctex("bkDustCard", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, "rgba(200,170,130,0.9)"); gr.addColorStop(1, "rgba(200,170,130,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });

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

type Inst = { mesh: THREE.InstancedMesh; mat: THREE.MeshLambertMaterial; idx: number[]; tex: Record<string, THREE.Texture> };

export class BkWorld {
  root = new THREE.Group();
  private pool = new Pool(); private crowdPool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#2a2024", 80, 600); private bg = new THREE.Color();
  private gate: GateSet; private hill: HillSet; private room: RoomSet;
  private grassG: Grass; private grassH: Grass;
  private horses: Horse[] = [];
  private bucket: THREE.Group;
  private armies: Record<ArmyKey, Inst[]> = { bolo: [], mode: [] };
  private armyBanners: Record<ArmyKey, { bp: ReturnType<typeof bannerPole>; i: number }[]> = { bolo: [], mode: [] };
  private cards: Record<CardKind, CardPool>;
  private puffs: THREE.Sprite[] = [];
  private lastPeople: { name: string; p: V3; low: boolean; extra: boolean; s: number }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3(); private v2 = new THREE.Vector3();
  private m5 = new THREE.Matrix4(); private q5 = new THREE.Quaternion(); private s5 = new THREE.Vector3(1, 1, 1); private e5 = new THREE.Euler();

  constructor() {
    const R = this.root;
    this.hemi = new THREE.HemisphereLight("#ffe9d0", "#5c4a44", 0.6);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.4);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.gate = buildGate(); this.hill = buildHill(); this.room = buildRoom();
    R.add(this.gate.group, this.hill.group, this.room.group);
    this.grassG = new Grass(this.gate.group, this.gate.turf); this.grassH = new Grass(this.hill.group, this.hill.turf);
    for (const h of HORSES) { const hr = new Horse(h.coat, 0, h.key, h.cloth); hr.g.visible = false; R.add(hr.g); this.horses.push(hr); }
    this.bucket = bucketGroup(); this.bucket.visible = false; R.add(this.bucket);
    this.cards = { page: new CardPool(R, pageTex(), 24, 0.22, 0.28, NOINK), decree: new CardPool(R, decreeTex(), 2, 0.3, 0.38, NOINK), dust: new CardPool(R, dustTex(), 40, 0.9, 0.9, AFTERINK) };
    const puffT = puffTex();
    for (let i = 0; i < 80; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
    // ---- the armies: a handful of card variants each, instanced over the ranks ----
    const cardG = new THREE.PlaneGeometry(600 * SUc, 1000 * SUc); cardG.translate(0, (975 - 500) * SUc, 0);
    const mk = (count: number) => { const mat = cardShade(new THREE.MeshLambertMaterial({ map: null, alphaTest: 0.5, side: THREE.DoubleSide })); mat.alphaToCoverage = false;
      const mesh = new THREE.InstancedMesh(cardG, mat, count); mesh.layers.set(NOINK); mesh.frustumCulled = false; mesh.receiveShadow = true; mesh.visible = false; R.add(mesh); return { mesh, mat }; };
    const variants: Record<ArmyKey, Outfit[]> = { bolo: [BO(), BO({ skin: "#e0b48c", moustache: "#3a2a20" }), BO({ build: "stout" }), BO({ skin: "#f5d6b8", cap: "#6a6e76" }), BO({ hat: "cap", cap: "#8a2a24", spear: true }), BO({ moustache: "#6a4a2a", skin: "#c8946a" })],
      mode: [MO(), MO({ skin: "#e0b48c", moustache: "#3a2a20" }), MO({ build: "stout" }), MO({ jacket: "#f2c230", sash: "#2a4aa8" }), MO({ cap: "#5a5e66", skin: "#f5d6b8" })] };
    for (const k of ["bolo", "mode"] as ArmyKey[]) {
      const vs = variants[k], n = ARMY[k].ranks.length;
      vs.forEach((o, vi) => {
        const seed = 500 + vi + (k === "mode" ? 50 : 0);
        const reqs: Record<string, ReturnType<Pool["req"]>> = {
          stand: this.crowdPool.req(`${k}${vi}st`, 300, 500, 0.5, (p: Pen) => bodyFront(p, o, { mode: "stand", expr: k === "bolo" ? "stern" : "grin", look: 0, light: -0.8, seed })),
          m0: this.crowdPool.req(`${k}${vi}m0`, 300, 500, 0.5, (p: Pen) => bodySide(p, o, { mode: "march", phase: 0, expr: "stern", stride: 1.0, stomp: 0.4, light: -0.8, seed })),
          m1: this.crowdPool.req(`${k}${vi}m1`, 300, 500, 0.5, (p: Pen) => bodySide(p, o, { mode: "march", phase: 0.5, expr: "stern", stride: 1.0, stomp: 0.4, light: -0.8, seed })),
          f0: this.crowdPool.req(`${k}${vi}f0`, 300, 500, 0.5, (p: Pen) => bodySide(p, { ...o, spear: false }, { mode: "march", phase: 0.25, expr: "shock", stride: 1.25, stomp: 0.4, light: -0.8, seed })),
          f1: this.crowdPool.req(`${k}${vi}f1`, 300, 500, 0.5, (p: Pen) => bodySide(p, { ...o, spear: false }, { mode: "march", phase: 0.75, expr: "shock", stride: 1.25, stomp: 0.4, light: -0.8, seed })),
        };
        const idx: number[] = []; for (let i = vi; i < n; i += vs.length) idx.push(i);
        const { mesh, mat } = mk(idx.length);
        this.armies[k].push({ mesh, mat, idx, tex: reqs as unknown as Record<string, THREE.Texture> });
      });
    }
    this.crowdPool.flush();
    for (const k of ["bolo", "mode"] as ArmyKey[]) for (const it of this.armies[k]) { const rq = it.tex as unknown as Record<string, { tex?: THREE.Texture }>; const tx: Record<string, THREE.Texture> = {}; for (const [kk, r] of Object.entries(rq)) tx[kk] = r.tex!; it.tex = tx; it.mat.map = tx.stand; it.mat.needsUpdate = true; }
    // banners carried in the ranks
    for (const [k, kind, picks] of [["bolo", "bologna", [40, 140, 260, 380, 520, 700]], ["mode", "modena", [20, 90, 170]]] as [ArmyKey, "bologna" | "modena", number[]][])
      for (const i of picks) { const bp = bannerPole(kind, 3.8, 1.3); bp.g.visible = false; R.add(bp.g); this.armyBanners[k].push({ bp, i }); }
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose the world for spec st at frame f */
  update(_id: number, st: St3, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, light: Light = st.light, L = LP[light], set = SETOF[light];
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = set === "room" ? 0.04 : 0.08; cam.far = 3000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...(st.focus ?? c.look)), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    this.gate.group.visible = set === "gate"; this.hill.group.visible = set === "hill"; this.room.group.visible = set === "room";
    // ---- lights ----
    const sunDir = this.v.set(...SUN[light]).normalize().clone();
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI; this.sun.castShadow = L.sunI > 0;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 8, 12, 120);
    this.sun.position.copy(focus).addScaledVector(sunDir, 300); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 1; sc.far = 700; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LK.bounce); TONE.uSat.value = LK.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint); CHAR.uLamp.value.x = LAMPLIT.has(light) ? 1 : 0;
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = this.bg.set(BG[light]);
    const flick = (k: number) => 1 + 0.12 * Math.sin(t * 9 + k) + 0.07 * Math.sin(t * 23 + 2 * k);

    // ---------------- the sets ----------------
    if (set === "gate") { const g = this.gate, o = st.gate ?? 0; g.doorL.rotation.y = 1.45 * o; g.doorR.rotation.y = -1.45 * o; g.setRope(st.rope ?? 0.25); g.drift(t); this.grassG.update(cam); }
    if (set === "hill") { const H = this.hill;
      for (const [k, m] of Object.entries(H.skies)) m.visible = k === light;
      H.moon.visible = light === "night";
      const o = st.castleGate ?? 0; H.doorL.rotation.y = 1.4 * o; H.doorR.rotation.y = -1.4 * o;
      H.flag.mat.map = H.flag.mat.emissiveMap = H.flagTex[st.flag ?? "bologna"]; H.flag.mat.needsUpdate = true;
      H.torches.forEach((l, i) => { l.intensity = light === "night" ? 14 * flick(i) : 0; }); H.torchFx.forEach((g) => { g.visible = light === "night"; });
      H.water.U.uSun.value.set(...(light === "night" ? [0, 0.3, -1] as V3 : SUN[light])); H.water.U.uSky.value.set(light === "night" ? "#2a3452" : light === "dusk" ? "#b08a8a" : "#c0ccd2"); H.foam.color.setRGB(...(light === "night" ? [0.32, 0.36, 0.46] : [0.9, 0.94, 0.96]) as [number, number, number]); H.foam.opacity = light === "night" ? 0.45 : 0.7; H.water.U.uDeep.value.set(light === "night" ? "#0e1a26" : "#2e4a52"); H.water.U.uShal.value.set(light === "night" ? "#1e3040" : "#5a7a70"); H.drift(t); this.grassH.update(cam); }
    if (set === "room") { const Rm = this.room;
      Rm.tower.visible = light === "tower"; Rm.hall.visible = light === "pope" || light === "emp"; Rm.pope.visible = light === "pope"; Rm.emp.visible = light === "emp"; Rm.study.visible = light === "study";
      Rm.lamps.forEach((l, i) => { l.intensity = (i === 0 ? light === "study" : light === "pope" || light === "emp") ? 8 * flick(i) : 0; });
      Rm.win.intensity = light === "tower" ? 14 : light === "study" ? 5 : light === "pope" || light === "emp" ? 9 : 0;
      Rm.drift(t); }

    // ---------------- props ----------------
    const bq = st.bucket; this.bucket.visible = !!bq;
    if (bq) { this.bucket.position.set(...bq.p); this.bucket.rotation.set(bq.r?.[0] ?? 0, bq.r?.[1] ?? 0, bq.r?.[2] ?? 0, "YXZ"); }
    for (const p of Object.values(this.cards)) p.hide();
    const cn: Record<string, number> = {};
    for (const cd of st.cards ?? []) { const k = cn[cd.kind] ?? 0; cn[cd.kind] = k + 1; this.cards[cd.kind].put(k, cd.p, cam, cd.spin, cd.s, !!cd.flat); }
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });

    // ---------------- the armies ----------------
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    for (const k of ["bolo", "mode"] as ArmyKey[]) {
      const q = set === "hill" ? st.army?.[k] : undefined;
      for (const it of this.armies[k]) { it.mesh.visible = !!q; if (!q) continue;
        const side = q.state !== "stand", d = q.state === "flee" ? ARMY[k].flee : ARMY[k].march, mirror = (d[0] * right.x + d[2] * right.z) < 0;
        const ph = (t * (q.state === "flee" ? 3.2 : 1.9) + it.idx[0] * 0.37) % 1, tx = !side ? it.tex.stand : q.state === "flee" ? (ph < 0.5 ? it.tex.f0 : it.tex.f1) : ph < 0.5 ? it.tex.m0 : it.tex.m1;
        if (it.mat.map !== tx) { it.mat.map = tx; it.mat.needsUpdate = true; }
        for (let j = 0; j < it.idx.length; j++) { const i = it.idx[j], p = armyAt(k, i, q.state, q.u), sc2 = 0.92 + 0.16 * ARMY[k].ranks[i].r, bob = side ? 0.05 * Math.abs(Math.sin(t * 6 + i)) : 0;
          const hide = q.hide ? q.hide(i, p) : false;
          this.e5.set(0, Math.atan2(cam.position.x - p[0], cam.position.z - p[2]), 0); this.m5.compose(this.v.set(p[0], p[1] + bob, p[2]), this.q5.setFromEuler(this.e5), this.s5.set((mirror && side ? -1 : 1) * sc2 * (hide ? 0 : 1), sc2 * (hide ? 0 : 1), 1)); it.mesh.setMatrixAt(j, this.m5); }
        it.mesh.instanceMatrix.needsUpdate = true; }
      for (const { bp, i } of this.armyBanners[k]) { bp.g.visible = !!q && q.state !== "flee"; if (!bp.g.visible) continue; const p = armyAt(k, i, q!.state, q!.u); bp.g.position.set(p[0] + 0.35, p[1], p[2]); bp.g.rotation.y = Math.PI; bp.wave(t, i); }
    }
    this.s5.set(1, 1, 1);

    // ---- horses ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const riders: Person3[] = [];
    this.horses.forEach((h, i) => { const q = st.horses?.find((x) => x.k === i); h.g.visible = !!q; if (!q) return;
      h.g.position.set(...q.p); h.g.rotation.set(0, q.yaw, 0); h.rider(!!q.rider, true);
      h.pose({ gait: q.gait, phase: q.phase, jump: q.jump, head: q.head });
      if (!q.rider) return;
      const fwd = V(Math.cos(q.yaw), 0, -Math.sin(q.yaw)), lz = V(Math.sin(q.yaw), 0, Math.cos(q.yaw)), toCam = cam.position.clone().sub(h.g.position).setY(0).normalize();
      const side = Math.sign(lz.dot(toCam)) || 1, screenR = fwd.dot(right) >= 0;
      const seat = h.saddle.getWorldPosition(this.v2).clone(), ow = OUT[q.rider.who] ?? OUT.rm1, up = rideUp(ow.o) * SUc;
      const base = seat.clone().addScaledVector(lz, side * 0.33).addScaledVector(fwd, RIDE_DX * SUc); base.y -= up;
      riders.push({ who: q.rider.who, p: [base.x, base.y, base.z], expr: q.rider.expr, ride: { pose: q.rider.pose ?? 0, mirror: !screenR, tilt: q.rider.tilt ?? 0 } });
    });

    // ---- cast ----
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = [...(st.people ?? []), ...riders].map((q0) => { const w = OUT[q0.who] ?? OUT.bo1; return { q: w.o.moustache && q0.expr === "shock" ? { ...q0, expr: "nervous" as const } : q0, w }; });
    this.lastPeople = people.map(({ q, w }) => ({ name: q.who, p: q.p, low: !!q.low || !!q.ride, extra: !!q.extra || !!q.side, s: q.s ?? (w.o.build === "kid" ? 0.72 : 1) }));
    const key = st.key ?? [focus.x, focus.y + 2.2, focus.z - 1.5] as V3;
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = q.ride && (q.ride.pose ?? 0) >= 0.4 ? 1 : blink(w.seed), ks = q.s ?? 1;
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz2 = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz2) || 1, n3 = V(nx / nl2, 0, nz2 / nl2), crs = V(n3.z, 0, -n3.x);
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs) / ks, (pc.y - o3.y) / ks]; };
      let mirror = false, rz = 0;
      if (q.ride) {
        mirror = q.ride.mirror; rz = q.ride.tilt ?? 0; const lt = mirror ? Math.PI - lightA : lightA, pose = Math.round((q.ride.pose ?? 0) * 8) / 8;
        const kkey = `R|${w.key}|${q.expr}|${pose}|${bl}|${lt.toFixed(2)}`;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodySide(p, w.o, { mode: "ride", pose, expr: q.expr, blink: bl, light: lt, seed: w.seed }));
      } else if (q.side) {
        mirror = q.side.mirror !== (right.x < 0); const lt = mirror ? Math.PI - lightA : lightA;
        const ph = Math.round(q.side.phase * 16) / 16, cw3 = q.side.carry, cy = cw3 ? onCard(V(...cw3)) : null, carry = cy ? [300 + (mirror ? -cy[0] : cy[0]) / SUc, 975 - cy[1] / SUc] as [number, number] : undefined;
        const kkey = `S|${w.key}|${q.expr}|${ph}|${bl}|${lt.toFixed(2)}|${carry ? carry.map((x) => Math.round(x / 12)).join(",") : ""}|${q.side.stride ?? 0.8}`;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodySide(p, w.o, { mode: "march", phase: ph, expr: q.expr, blink: bl, stride: q.side!.stride ?? 0.8, stomp: 0.4, light: lt, seed: w.seed, carry }));
        rz = q.tilt ?? 0;
      } else {
        let hr: [number, number] | undefined, hl: [number, number] | undefined;
        const give = (hc: [number, number]) => { if ((hc[0] >= 0 && !hr) || hl) hr = hc; else hl = hc; };
        for (const hwp of q.hw ?? []) give(onCard(V(...hwp)));
        const hk = hr || hl ? [hr, hl].flat().map((x) => (x ?? 9).toFixed(2)).join(",") : "";
        const kkey = `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${hk}|${q.march === undefined ? "" : Math.round(q.march * 12)}|${lightA.toFixed(2)}|${q.mode ?? ""}`;
        const hands = hr || hl ? { r: hr ? [300 + hr[0] / SUc, 975 - hr[1] / SUc] as [number, number] : undefined, l: hl ? [300 + hl[0] / SUc, 975 - hl[1] / SUc] as [number, number] : undefined } : undefined;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodyFront(p, w.o, { mode: q.mode ?? (q.march === undefined ? "stand" : "march"), phase: q.march === undefined ? undefined : Math.round(q.march * 12) / 12, expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: hands ? undefined : q.wave, hands, light: lightA, seed: w.seed }));
        rz = q.tilt ?? 0;
      }
      act.mesh.visible = true;
      act.mesh.position.set(...q.p);
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), rz, "YXZ");
      act.mesh.scale.set((mirror ? -1 : 1) * ks, ks, 1);
      act.mesh.castShadow = false; act.mesh.receiveShadow = false;
      act.caster.visible = !q.air; act.caster.position.set(...q.p); act.caster.scale.copy(act.mesh.scale);
      act.caster.rotation.set(0, L.sunI <= 0 || LAMPLIT.has(light) ? Math.atan2(key[0] - q.p[0], key[2] - q.p[2]) : Math.atan2(sunDir.x, sunDir.z), 0);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = this.actors[i].caster.visible = false;
    // ---- contact shadows (not under riders: the horse shades them) ----
    const cc = set === "room" ? "#2a2420" : light === "night" ? "#1a2030" : "#4a4a30";
    let fi = 0;
    for (const { q } of people) {
      if (q.low || q.air || q.ride) continue;
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
      const k = q.s, head = box(q.p, -0.27 * k, 0.27 * k, 1.16 * k, 1.84 * k), body = box(q.p, -0.3 * k, 0.3 * k, (q.low ? 1.0 : 0.05) * k, 1.16 * k);
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      else if (head.frac > 0.02 && head.frac < 0.97) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12 && !q.low) out.push(`${q.name}: body in shot without the head`);
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
        if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh) return false;
        let o: THREE.Object3D | null = m; while (o) { if (!o.visible) return false; o = o.parent; }
        return !(Array.isArray(mat) ? false : mat.transparent || (mat as THREE.Material & { alphaTest?: number }).alphaTest > 0 || mat.colorWrite === false);
      });
      if (hit && hit.distance < dist - r) out.push(`${name}: hidden behind something ${(dist - hit.distance).toFixed(2)} m in front of it`);
    }
    return out;
  }
}
