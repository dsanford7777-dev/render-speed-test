// The Centralia Short's world: five sets (csets.ts), only the one in shot is switched on.
// Look: character look B (bridge/toon.ts) and the background rules: sets carry no ink line, every light has a source,
// characters cast real shadows (a shadow twin turned to the light), grass near the camera on every lawn.
// Posed per frame: the town's two times (1962 / today), the crack, the condemned notices, the moving van; the pit's
// burning heap and the seam glowing along the wall, the water down the borehole; the tunnel cold or burning; the yard's
// winter, the sinkhole; the room's two dressings; tools in hands (hose, torch, pick, shovel); cards; puffs.
import * as THREE from "three";
import { V, lam, Kit } from "../bridge/build";
import { Pen, bodyFront, bodySide, fxContact, Outfit } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { ctex } from "../bridge/paint";
import { Grass } from "../bridge/grass";
import { M } from "../frozen/fsets";
import { puffTex, sheetTex } from "../frozen/paint";
import { V3, FPS, SET, TOWN_SUN, PIT_SUN, YARD_SUN } from "./place";
import { buildTown, buildPit, buildMine, buildYard, buildRoom, TownSet, PitSet, MineSet, YardSet, RoomSet } from "./csets";
import type { St3, CardKind } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const LP: Record<Light, LightPreset> = {
  // the town in 1962: a clear late-spring day
  town62: { ...D, fogNear: 60, fogFar: 520, lit: [1.36, 1.28, 1.12], shade: [0.44, 0.47, 0.6], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.93], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.3, sunCol: "#fff0d0", sky: "#b9d2ea", ground: "#6a6048", fog: "#c9d6e0" },
  // the town today: hazy, a little colder; smoke in the air
  townT: { ...D, fogNear: 40, fogFar: 420, lit: [1.22, 1.2, 1.12], shade: [0.42, 0.45, 0.56], lift: [0.07, 0.07, 0.09], charTint: [1.0, 0.98, 0.95], sideTint: [0.9, 0.9, 0.94], hemiI: 0.66, sunI: 1.9, sunCol: "#f2ecdc", sky: "#c2d2e0", ground: "#6a6450", fog: "#cdd4da" },
  // the dump by day
  pit: { ...D, fogNear: 60, fogFar: 520, lit: [1.34, 1.26, 1.1], shade: [0.44, 0.46, 0.58], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.97, 0.92], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.2, sunCol: "#ffecc8", sky: "#b9cde0", ground: "#7a6a54", fog: "#c9d2d8" },
  // the evening they set it alight: dusk, the fire the brightest thing
  pitD: { ...D, fogNear: 50, fogFar: 420, lit: [0.96, 0.76, 0.68], shade: [0.26, 0.26, 0.42], lift: [0.05, 0.04, 0.09], charTint: [1.04, 0.88, 0.8], sideTint: [0.86, 0.8, 0.9], hemiI: 0.5, sunI: 1.2, sunCol: "#ff9a5a", sky: "#7a6a8a", ground: "#3a3040", fog: "#6a5a6e" },
  // the old mine tunnels, cold: one dim lamp
  mineC: { ...D, fogNear: 6, fogFar: 40, lit: [0.62, 0.6, 0.64], shade: [0.16, 0.16, 0.2], lift: [0.05, 0.05, 0.07], charTint: [0.96, 0.92, 0.88], sideTint: [0.9, 0.88, 0.9], hemiI: 0.3, sunI: 0, sunCol: "#ffffff", sky: "#3a3a44", ground: "#1a1a20", fog: "#08080c" },
  // the tunnels burning: orange from deep inside
  mineF: { ...D, fogNear: 10, fogFar: 60, lit: [1.0, 0.62, 0.4], shade: [0.2, 0.1, 0.09], lift: [0.06, 0.03, 0.03], charTint: [1.04, 0.84, 0.7], sideTint: [0.94, 0.8, 0.72], hemiI: 0.3, sunI: 0, sunCol: "#ff8a3a", sky: "#4a2418", ground: "#1a0c0a", fog: "#1a0806" },
  // the yard, Feb 14, 1981: overcast winter light
  yardW: { ...D, fogNear: 40, fogFar: 380, lit: [1.16, 1.18, 1.22], shade: [0.46, 0.5, 0.6], lift: [0.08, 0.08, 0.1], charTint: [1.0, 0.98, 0.98], sideTint: [0.92, 0.92, 0.96], hemiI: 0.72, sunI: 1.4, sunCol: "#e8eef6", sky: "#c2ccd6", ground: "#7a7868", fog: "#d2d8de" },
  // a back yard in summer
  yardS: { ...D, fogNear: 60, fogFar: 520, lit: [1.36, 1.28, 1.12], shade: [0.44, 0.47, 0.6], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.93], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.2, sunCol: "#fff0d0", sky: "#b9d2ea", ground: "#6a6048", fog: "#c9d6e0" },
  // the council room: a window and a hanging lamp
  council: { ...D, fogNear: 30, fogFar: 200, lit: [0.74, 0.64, 0.52], shade: [0.2, 0.17, 0.16], lift: [0.04, 0.03, 0.03], charTint: [1.04, 0.95, 0.84], sideTint: [0.92, 0.86, 0.78], hemiI: 0.36, sunI: 0, sunCol: "#ffe0b0", sky: "#8a7a68", ground: "#3a2a20", fog: "#1a1410" },
  // the cellar: one bare bulb, gas in the air
  cellar: { ...D, fogNear: 4, fogFar: 22, lit: [0.6, 0.56, 0.48], shade: [0.13, 0.13, 0.14], lift: [0.04, 0.04, 0.04], charTint: [1.0, 0.94, 0.86], sideTint: [0.9, 0.86, 0.82], hemiI: 0.24, sunI: 0, sunCol: "#ffd8a0", sky: "#4a4640", ground: "#1e1c1a", fog: "#4a4a44" },
};
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { town62: "#c9d6e0", townT: "#cdd4da", pit: "#c9d2d8", pitD: "#4a3e58", mineC: "#08080c", mineF: "#1a0806", yardW: "#d2d8de", yardS: "#c9d6e0", council: "#1a1410", cellar: "#2a2a26" };
const SUN: Record<Light, V3> = { town62: TOWN_SUN, townT: TOWN_SUN, pit: PIT_SUN, pitD: [-0.7, 0.24, 0.66], mineC: [0, 1, 0], mineF: [0, 1, 0], yardW: YARD_SUN, yardS: YARD_SUN, council: [0, 1, 0], cellar: [0, 1, 0] };
const SETOF: Record<Light, "town" | "pit" | "mine" | "yard" | "room"> = { town62: "town", townT: "town", pit: "pit", pitD: "pit", mineC: "mine", mineF: "mine", yardW: "yard", yardS: "yard", council: "room", cellar: "room" };
/** lamp-lit sets: characters take light from the point lights, their shadows fall from the key lamp */
const LAMPLIT = new Set<Light>(["mineC", "mineF", "council", "cellar"]);

// ---------------- cast ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** the volunteer firemen of 1962: long dark coats, black helmets */
const FF = (coat: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket: coat, pants: "#2a2a30", boots: "#1a1618", hat: "hardhat", cap: "#1e1e22", buttons: "#c9a23a", skin: "#f0d2b0", belt: "#c9b25a", ...extra });
const MINER = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#3e3a40", boots: "#1e1a20", hat: "minerhat", cap: "#3a3430", buttons: jacket, skin: "#ecc8a4", braces: "#5a4028", ...extra });
const CREW = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#3a4a5a", boots: "#2a221c", hat: "hardhat", cap: "#e0b22a", buttons: jacket, skin: "#e8c4a0", ...extra });
const OUT: Record<string, Who> = {
  ff1: who(FF("#2a2a30", { moustache: "#3a2a20" }), 201, "ff1"), ff2: who(FF("#33302e", { skin: "#e0b48c", build: "stout" }), 202, "ff2"), ff3: who(FF("#2a2e34"), 203, "ff3"),
  ff4: who(FF("#302a2a", { moustache: "#8a5a30", skin: "#c8946a" }), 204, "ff4"), ff5: who(FF("#2c2c2c", { skin: "#f5c9a0" }), 205, "ff5"),
  // townspeople of 1962
  man: who({ jacket: "#5a6a7a", pants: "#3a3e48", boots: "#1e1a20", hat: "fedora", cap: "#4a4438", buttons: "#5a6a7a", skin: "#f0d2b0", shirt: "#f2ece0", tie: "#7a2a24" }, 206, "man"),
  wife: who({ jacket: "#b8506a", pants: "#3a3a44", boots: "#2a221c", hat: "hair", hair: "#6a4a2a", dress: "#c86a80", buttons: "#b8506a", skin: "#f5d2b4" }, 207, "wife"),
  kid: who({ jacket: "#3a7ab8", pants: "#3a3e4a", boots: "#2a221c", hat: "hair", hair: "#c9a060", buttons: "#3a7ab8", skin: "#f5d2b4", build: "kid", shirt: "#f2ece0" }, 208, "kid"),
  m1: who(MINER("#4a5a6a", { moustache: "#3a2a20" }), 209, "m1"), m2: who(MINER("#6a4a3a", { skin: "#e0b48c", build: "stout" }), 210, "m2"),
  // the council
  c1: who({ jacket: "#2a2a32", pants: "#2a2a32", boots: "#1a1618", hat: "hair", hair: "#8a8a92", buttons: "#2a2a32", skin: "#f0d2b0", shirt: "#f6f2e8", tie: "#2a3a5a", moustache: "#8a8a92" }, 211, "c1"),
  c2: who({ jacket: "#4a3e34", pants: "#3a3028", boots: "#1a1618", hat: "hair", hair: "#3a2a20", buttons: "#4a3e34", skin: "#e8c4a0", shirt: "#f6f2e8", tie: "#7a2a24", build: "stout" }, 212, "c2"),
  c3: who({ jacket: "#3a4a3a", pants: "#2a302a", boots: "#1a1618", hat: "hair", hair: "#c9c6be", buttons: "#3a4a3a", skin: "#f5d2b4", shirt: "#f6f2e8", tie: "#3a3a3a" }, 213, "c3"),
  // the crews of the 1960s-70s
  w1: who(CREW("#6a5a3a"), 214, "w1"), w2: who(CREW("#4a5a6a", { moustache: "#3a2a20" }), 215, "w2"), w3: who(CREW("#7a4a3a", { skin: "#8a5a3c" }), 216, "w3"),
  // 1981: Todd (12), in a red winter jacket; his cousin Eric, older, in green
  todd: who({ jacket: "#c0392b", pants: "#3a4a6a", boots: "#2a221c", hat: "cap", cap: "#2a4a7a", buttons: "#c0392b", skin: "#f5d2b4", build: "kid", shirt: "#e9e2d2" }, 217, "todd"),
  eric: who({ jacket: "#3a6a4a", pants: "#3a3e4a", boots: "#2a221c", hat: "hair", hair: "#6a4a2a", buttons: "#3a6a4a", skin: "#f5d2b4", shirt: "#e9e2d2" }, 218, "eric"),
  // the people who stayed (older, today)
  holdM: who({ jacket: "#6a5a4a", pants: "#3a3a40", boots: "#2a221c", hat: "cap", cap: "#3a4a3a", buttons: "#6a5a4a", skin: "#e8c8a8", moustache: "#d8d6d0", plaid: "#4a3a2a" }, 219, "holdM"),
  holdW: who({ jacket: "#7a6a8a", pants: "#3a3a44", boots: "#2a221c", hat: "hair", hair: "#d8d6d0", dress: "#5a4a6a", buttons: "#7a6a8a", skin: "#f0d2b8" }, 220, "holdW"),
  r3: who({ jacket: "#2f6a6a", pants: "#3a3e4a", boots: "#2a2a2e", hat: "hair", hair: "#5a3a22", buttons: "#2f6a6a", skin: "#f5d2b4", shirt: "#f0ece2" }, 221, "r3"),
  r4: who({ jacket: "#8a6a3a", pants: "#4a4a3a", boots: "#2a221c", hat: "cap", cap: "#7a2a24", buttons: "#8a6a3a", skin: "#c8946a" }, 222, "r4"),
  r5: who({ jacket: "#4a4a6a", pants: "#3a3a44", boots: "#2a221c", hat: "hair", hair: "#8a8a8a", buttons: "#4a4a6a", skin: "#f0d2b0", moustache: "#8a8a8a" }, 223, "r5"),
};

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
const sparkTex = () => ctex("ceSpark", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = "#ffd27a"; g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283, r = k % 2 ? 10 : 30; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = "#120c16"; g.lineWidth = 4; g.stroke(); });
const chunkTex = () => ctex("ceChunkT", 96, 96, (g, r) => { g.clearRect(0, 0, 96, 96); const pts: [number, number][] = []; for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283, rr = 20 + r() * 22; pts.push([48 + Math.cos(a) * rr, 48 + Math.sin(a) * rr * 0.7]); }
  g.fillStyle = "#6a5440"; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.strokeStyle = "#120c16"; g.lineWidth = 6; g.stroke(); });

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

export class CeWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#2a2024", 80, 600); private bg = new THREE.Color();
  private town: TownSet; private pit: PitSet; private mine: MineSet; private yard: YardSet; private room: RoomSet;
  private grassT: Grass; private grassP: Grass; private grassY: Grass; private yardGrass = false; private woodM: THREE.Material;
  private tools: { g: THREE.Group; handle: THREE.Mesh; tail: THREE.Mesh; heads: Record<string, THREE.Object3D> }[] = [];
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
    this.town = buildTown(); this.pit = buildPit(); this.mine = buildMine(); this.yard = buildYard(); this.room = buildRoom();
    R.add(this.town.group, this.pit.group, this.mine.group, this.yard.group, this.room.group);
    this.grassT = new Grass(this.town.group, this.town.turf); this.grassP = new Grass(this.pit.group, this.pit.turf); this.grassY = new Grass(this.yard.group, (x, z) => (this.yardGrass ? this.yard.turf(x, z) : null));
    // ---- posed props (these keep their ink line: they are what the characters hold) ----
    const wood = M("ceToolWood", "#8a6238"); this.woodM = wood; const iron = M("ceToolIron", "#34303a"), brass = M("ceToolBrass", "#c9a23a"), hoseM = M("ceToolHose", "#8a3a2a");
    for (let i = 0; i < 6; i++) { const g = new THREE.Group(), handle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1, 8), wood), tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), hoseM); g.add(handle, tail);
      const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 10), brass);
      const pick = new THREE.Group(); { const bb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), iron); pick.add(bb); for (const sx of [-1, 1]) { const tp = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), iron); tp.rotation.z = -sx * Math.PI / 2; tp.position.x = sx * 0.4; pick.add(tp); } }
      const shovel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.03), iron);
      const torch = new THREE.Group(); { const rag = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), M("ceRag", "#3a2a20")); torch.add(rag); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.8, 0.6), fog: false })); fl.scale.y = 1.8; fl.position.y = -0.14; fl.layers.set(AFTERINK); torch.add(fl); }
      const heads = { nozzle, pick, shovel, torch }; for (const h of Object.values(heads)) g.add(h);
      shadowAll(g); g.visible = false; R.add(g); this.tools.push({ g, handle, tail, heads }); }
    this.cards = { paper: new CardPool(R, sheetTex(), 24, 0.24, 0.3, NOINK), spark: new CardPool(R, sparkTex(), 40, 0.14, 0.14, AFTERINK), chunk: new CardPool(R, chunkTex(), 40, 0.4, 0.4, NOINK) };
    const puffT = puffTex();
    for (let i = 0; i < 64; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
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
    this.town.group.visible = set === "town"; this.pit.group.visible = set === "pit"; this.mine.group.visible = set === "mine"; this.yard.group.visible = set === "yard"; this.room.group.visible = set === "room";
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
    if (set === "town") { const T2 = this.town, today = light === "townT";
      T2.old.visible = !today; T2.now.visible = today; T2.crack.visible = today; T2.skies.day.visible = !today; T2.skies.haze.visible = today;
      T2.condemned.visible = !!st.condemned && !today; T2.van.visible = !!st.van && !today; T2.drift(t); T2.dust.points.visible = today;
      this.grassT.update(cam); }
    if (set === "pit") { const P2 = this.pit, dusk = light === "pitD"; P2.skies.day.visible = !dusk; P2.skies.dusk.visible = dusk;
      const fire = st.fire ?? 0; P2.fire.intensity = 60 * fire * flick(0); P2.heapGlow.visible = (st.heat ?? 0) > 0; (P2.heapGlow.material as THREE.MeshBasicMaterial).opacity = Math.min(1, st.heat ?? 0) * (0.8 + 0.2 * flick(1));
      const sp = st.seam ?? 0; P2.seam.forEach((m, i) => { const a = (i / P2.seam.length) * 6.283, d = Math.min(Math.abs(a - 1.4), 6.283 - Math.abs(a - 1.4)) / Math.PI, k = Math.max(0, Math.min(1, (sp - d) * 4)); m.visible = k > 0; (m.material as THREE.MeshBasicMaterial).opacity = k * (0.75 + 0.25 * Math.sin(t * 5 + i)); });
      P2.stream.visible = !!st.flush; P2.drift(t); this.grassP.update(cam); }
    if (set === "mine") { const M2 = this.mine, burn = light === "mineF" ? (st.burn ?? 1) : 0;
      M2.embers.forEach((m, i) => { const k = Math.max(0, Math.min(1, burn * 1.6 - (1 - i / M2.embers.length) * 0.9)); m.visible = k > 0; (m.material as THREE.MeshBasicMaterial).opacity = k * (0.7 + 0.3 * Math.sin(t * 4 + i * 1.7)); });
      M2.fires.forEach((l, i) => { l.intensity = burn * (30 + 14 * i) * flick(i); }); M2.lamp.intensity = light === "mineC" ? 12 : 0; M2.lamps2.forEach((l) => { l.intensity = light === "mineC" ? 8 : 0; }); M2.dust.points.visible = true; M2.drift(t); }
    if (set === "yard") { const Y = this.yard, win = light === "yardW", open = win && st.hole === "open";
      Y.winter.visible = win && !open; Y.winterHole.visible = open; Y.summer.visible = !win; Y.hole.visible = open; Y.snow.visible = win; Y.skies.winter.visible = win; Y.skies.day.visible = !win;
      this.yardGrass = !win; this.grassY.update(cam); }
    if (set === "room") { const Rm = this.room, cel = light === "cellar"; Rm.council.visible = !cel; Rm.cellar.visible = cel; Rm.lamp.intensity = cel ? 0 : 8 * (1 + 0.04 * Math.sin(t * 7)); Rm.bulb.intensity = cel ? 9 * (1 + 0.05 * Math.sin(t * 13)) : 0; Rm.drift(t); }

    // ---------------- props ----------------
    this.tools.forEach((tl, i) => { const q = st.tools?.[i]; tl.g.visible = !!q; if (!q) return;
      const gp = V(...q.g), bp = V(...q.b), d = bp.clone().sub(gp), len = d.length(); d.normalize();
      const hose = q.kind === "hose";
      tl.handle.visible = true; tl.handle.position.copy(gp).addScaledVector(d, len / 2); tl.handle.quaternion.setFromUnitVectors(V(0, 1, 0), d); tl.handle.scale.set(hose ? 2.0 : 1, len, hose ? 2.0 : 1);
      tl.handle.material = hose ? tl.tail.material : this.woodM;
      tl.tail.visible = hose && !!q.tail; if (hose && q.tail) { const tp = V(...q.tail), td = gp.clone().sub(tp), tlen = td.length(); tl.tail.position.copy(tp).addScaledVector(td, 0.5); tl.tail.quaternion.setFromUnitVectors(V(0, 1, 0), td.normalize()); tl.tail.scale.set(1, tlen, 1); }
      const head = hose ? "nozzle" : q.kind;
      for (const [k, h] of Object.entries(tl.heads)) { h.visible = k === head; if (k !== head) continue; h.position.copy(bp); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); if (k === "nozzle") h.quaternion.setFromUnitVectors(V(0, 1, 0), d); if (k === "pick") h.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))); } });
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
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed), ks = q.s ?? (w.o.build === "kid" ? 0.72 : 1);
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
    const cc = set === "room" || set === "mine" ? "#2a2420" : "#5a5248";
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
    void lam; void SET;
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
