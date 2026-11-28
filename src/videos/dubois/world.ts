// The Dubois Short's world: four sets (dsets.ts), only the one in shot is switched on.
// Look: character look B (bridge/toon.ts) and the background rules: sets carry no ink line, every light has a source,
// characters cast real shadows (a shadow twin turned to the light), grass near the camera on every lawn.
// Posed per frame: the Horse Creek settlement (1889 / today), the mission, the room's three dressings (the settlers' cabin,
// the office in Washington with its wall board, the 1937 law office); horses with riders (hayes/horse.ts); paper cards.
import * as THREE from "three";
import { V, lam, Kit } from "../bridge/build";
import { Pen, bodyFront, bodySide, fxContact, Outfit, rideUp, RIDE_DX } from "../bridge/toon";
import { Horse, COATS } from "../hayes/horse";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { Grass } from "../bridge/grass";
import { ctex } from "../bridge/paint";
import { M } from "../frozen/fsets";
import { puffTex, sheetTex } from "../frozen/paint";
import { V3, FPS, SET, RIVER_SUN, WOODS_SUN, NORTH_SUN } from "./place";
import { buildRiver, buildWoods, buildRoom, buildNorth, RiverSet, WoodsSet, RoomSet, NorthSet } from "./dsets";
import { noteTex, coinTex, coalTex, markTex, sackTex } from "./dpaint";
import type { St3, CardKind, Person3 } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const LP: Record<Light, LightPreset> = {
  // the upper Wind River valley, 1889: a clear high-desert day, warm sun, cool blue shade
  valley: { ...D, fogNear: 90, fogFar: 640, lit: [1.38, 1.28, 1.1], shade: [0.44, 0.47, 0.62], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.93], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.4, sunCol: "#fff0d0", sky: "#a6c8e4", ground: "#7a7048", fog: "#d4dce0" },
  // the same valley today: a little cooler and brighter
  today: { ...D, fogNear: 100, fogFar: 680, lit: [1.34, 1.3, 1.18], shade: [0.44, 0.48, 0.64], lift: [0.06, 0.06, 0.09], charTint: [1.01, 0.99, 0.96], sideTint: [0.9, 0.91, 0.96], hemiI: 0.66, sunI: 2.35, sunCol: "#fff4e0", sky: "#9cc2e4", ground: "#7a7450", fog: "#d8e2e8" },
  // the mission on the prairie
  mission: { ...D, fogNear: 90, fogFar: 600, lit: [1.36, 1.28, 1.12], shade: [0.44, 0.47, 0.62], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.93], sideTint: [0.9, 0.9, 0.95], hemiI: 0.64, sunI: 2.3, sunCol: "#fff0d0", sky: "#a6c8e4", ground: "#7a7048", fog: "#d4dce0" },
  // the settlers' cabin: two oil lanterns and a window
  cabin: { ...D, fogNear: 30, fogFar: 200, lit: [0.84, 0.7, 0.54], shade: [0.22, 0.18, 0.16], lift: [0.04, 0.03, 0.03], charTint: [1.05, 0.95, 0.83], sideTint: [0.92, 0.86, 0.78], hemiI: 0.38, sunI: 0, sunCol: "#ffe0b0", sky: "#8a7a68", ground: "#3a2a20", fog: "#1a1410" },
  // the office in Washington: tall windows, pale plaster
  capitol: { ...D, fogNear: 30, fogFar: 200, lit: [1.08, 1.04, 0.96], shade: [0.34, 0.33, 0.36], lift: [0.05, 0.05, 0.06], charTint: [1.02, 0.98, 0.94], sideTint: [0.92, 0.9, 0.9], hemiI: 0.62, sunI: 0, sunCol: "#ffffff", sky: "#c8c0b0", ground: "#6a5a48", fog: "#2a2420" },
  // the law office in Jackson, 1937: a desk lamp and the window
  office: { ...D, fogNear: 30, fogFar: 200, lit: [0.94, 0.86, 0.72], shade: [0.27, 0.23, 0.21], lift: [0.05, 0.04, 0.04], charTint: [1.04, 0.96, 0.86], sideTint: [0.92, 0.88, 0.82], hemiI: 0.46, sunI: 0, sunCol: "#ffe8c0", sky: "#a89880", ground: "#3a2a20", fog: "#1e1814" },
};
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { valley: "#d4dce0", today: "#d8e2e8", mission: "#d4dce0", cabin: "#1a1410", capitol: "#2a2420", office: "#1e1814" };
const SUN: Record<Light, V3> = { valley: RIVER_SUN, today: [-0.4, 0.68, -0.6], mission: WOODS_SUN, cabin: [0, 1, 0], capitol: [0, 1, 0], office: [0, 1, 0] };
const SETOF: Record<Light, "river" | "woods" | "room" | "north"> = { valley: "river", today: "river", mission: "woods", cabin: "room", capitol: "room", office: "room" };
/** lamp-lit sets: characters take light from the point lights, their shadows fall from the key lamp */
const LAMPLIT = new Set<Light>(["cabin", "capitol", "office"]);
void NORTH_SUN;

// ---------------- cast (Horse Creek, 1889; Washington; today) ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** a homesteader: work shirt, vest or coat, a wide Western hat */
const RANCH = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#5a5040", boots: "#3a2a1e", hat: "cowboy", cap: "#b08a5a", buttons: jacket, skin: "#e8c4a0", shirt: "#e8dcc4", braces: "#3a2a1e", ...extra });
/** a Washington man of 1889: a dark frock coat, a white collar */
const DC = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#2a2a30", boots: "#1a1618", hat: "hair", hair: "#3a2a20", buttons: jacket, skin: "#f0d2b0", shirt: "#f6f2e8", tie: "#1e1a22", ...extra });
const OUT: Record<string, Who> = {
  // the settlers on Horse Creek
  smith: who(RANCH("#6a4a32", { moustache: "#5a4030", build: "stout" }), 501, "smith"),
  simpson: who(RANCH("#3a5a7a", { cap: "#8a6a44", skin: "#f0d2b0" }), 502, "simpson"),
  r1: who(RANCH("#7a3a2a", { moustache: "#3a2a1a" }), 503, "r1"), r2: who(RANCH("#4a5a3a", { cap: "#6a5a44", skin: "#e0b48c" }), 504, "r2"),
  r3: who(RANCH("#5a4a6a", { cap: "#c8a878", moustache: "#8a6a4a" }), 505, "r3"),
  wife1: who({ jacket: "#6a4a5a", pants: "#3a3040", boots: "#2a221c", hat: "bonnet", cap: "#e9e2cf", dress: "#7a5a6a", buttons: "#6a4a5a", skin: "#f5d6b8" }, 506, "wife1"),
  kid: who({ jacket: "#c86a3a", pants: "#4a4a6a", boots: "#3a2a1e", hat: "cowboy", cap: "#c8a878", buttons: "#c86a3a", skin: "#f2d0ae", build: "kid" }, 507, "kid"),
  // the old French trapper (the long-form's meeting): buckskin, a fur cap
  trapper: who({ jacket: "#a8865a", pants: "#7a6040", boots: "#4a3424", hat: "cap", cap: "#6a4a2e", buttons: "#a8865a", skin: "#e0b48c", moustache: "#d8d4cc", shirt: "#c8a878" }, 508, "trapper"),
  // the mail rider
  rider: who(RANCH("#5a3a2a", { cap: "#7a5a3a", bandana: undefined }), 509, "rider"),
  // Father John Roberts: a black clerical coat and a white collar
  roberts: who({ jacket: "#22202a", pants: "#22202a", boots: "#1a1618", hat: "hair", hair: "#6a4a2e", buttons: "#22202a", skin: "#f2d4b4", shirt: "#f6f2e8", tie: "#f6f2e8", moustache: "#6a4a2e" }, 510, "roberts"),
  // Shoshone friends of the mission: everyday 1880s clothes (cloth coats, wide hats, a shawl), no costume
  sh1: who({ jacket: "#3a5a7a", pants: "#3a3a44", boots: "#5a3a24", hat: "cowboy", cap: "#3a3030", buttons: "#3a5a7a", skin: "#b07c54", hair: "#1a1414", shirt: "#e8dcc4" }, 511, "sh1"),
  sh2: who({ jacket: "#8a2a2a", pants: "#3a2a2a", boots: "#5a3a24", hat: "hair", hair: "#1a1414", dress: "#6a3a5a", buttons: "#8a2a2a", skin: "#a87048" }, 512, "sh2"),
  sh3: who({ jacket: "#5a6a3a", pants: "#3a3a30", boots: "#5a3a24", hat: "cowboy", cap: "#5a4a3a", buttons: "#5a6a3a", skin: "#b8805a", shirt: "#d8c8a8" }, 513, "sh3"),
  shkid: who({ jacket: "#c8943a", pants: "#4a3a2a", boots: "#5a3a24", hat: "hair", hair: "#1a1414", buttons: "#c8943a", skin: "#b07c54", build: "kid" }, 514, "shkid"),
  // Washington: Fred Dubois (Idaho's delegate: a big dark moustache), Joseph Carey (Wyoming's delegate: a beard-grey moustache),
  // the clerk with the red pen
  dubois: who(DC("#2a2a3a", { moustache: "#2a1a12", hair: "#2a1a12", tie: "#7a1a1a", build: "stout" }), 520, "dubois"),
  carey: who(DC("#3a3428", { moustache: "#9a9088", hair: "#9a9088", tie: "#1e1a22" }), 521, "carey"),
  clerk: who(DC("#4a4a52", { hat: "hair", hair: "#7a5a3a", skin: "#f2d6b8", tie: "#1e1a22" }), 522, "clerk"),
  // 1937: Billy Simpson, the lawyer, older
  simpsonold: who(DC("#4a3a2a", { hair: "#d8d4cc", moustache: "#d8d4cc", tie: "#2a4a7a" }), 523, "simpsonold"),
  // today: a local in a work coat and a Western hat; a visitor in bright modern clothes
  local: who(RANCH("#7a2a22", { cap: "#3a2e26", pants: "#3a4a6a", moustache: "#5a4030", shirt: "#e8dcc4", braces: undefined }), 530, "local"),
  local2: who(RANCH("#3a4a5a", { cap: "#c8a878", pants: "#3a4a6a", skin: "#f0d2b0", braces: undefined }), 531, "local2"),
  tourist: who({ jacket: "#2a8ad8", pants: "#c8b890", boots: "#f2f2f2", hat: "cap", cap: "#e0332e", buttons: "#2a8ad8", skin: "#f2d0ae", shirt: "#f2f2f2" }, 532, "tourist"),
  // Butch Cassidy (as a young cowboy, 1889)
  butch: who(RANCH("#8a6a3a", { cap: "#6a5038", skin: "#f0c8a0", shirt: "#e8dcc4", braces: undefined, bandana: undefined, tie: "#c8382e" }), 540, "butch"),
  hainer: who(RANCH("#4a4a3a", { cap: "#3a3028", moustache: "#5a3a22" }), 541, "hainer"),
  man: who(RANCH("#5a5a5a"), 599, "man"),
};
/** the horses: the mail rider's, Butch's and two of his herd */
export const HORSES = [{ coat: COATS.bay, key: "hm", cloth: "#7a2a22" }, { coat: COATS.chestnut, key: "hb", cloth: "#2a4a6a" }, { coat: COATS.grey, key: "h2", cloth: "#5a4a32" }, { coat: COATS.darkbay, key: "h3", cloth: "#6a5a2a" }];

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
  private canes: THREE.Group[] = []; private horses: Horse[] = []; private v2 = new THREE.Vector3();
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
    const caneW = M("dxCane", "#3a2418"), knob = M("dxKnob", "#d8b04a", { emissive: "#5a3a08", emissiveIntensity: 0.3 });
    for (let i = 0; i < 2; i++) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.012, 1, 8).translate(0, -0.5, 0), caneW)); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), knob)); shadowAll(g); g.visible = false; R.add(g); this.canes.push(g); }
    for (const h of HORSES) { const hr = new Horse(h.coat, 0, h.key, h.cloth); hr.g.visible = false; R.add(hr.g); this.horses.push(hr); }
    this.cards = { paper: new CardPool(R, sheetTex(), 24, 0.24, 0.3, NOINK), spark: new CardPool(R, sparkTex(), 40, 0.14, 0.14, AFTERINK), flake: new CardPool(R, flakeTex(), 80, 0.09, 0.09, AFTERINK), nugget: new CardPool(R, nuggetTex(), 30, 0.22, 0.22, NOINK),
      note: new CardPool(R, noteTex(), 60, 0.34, 0.21, NOINK), coin: new CardPool(R, coinTex(), 70, 0.14, 0.14, NOINK), coal: new CardPool(R, coalTex(), 40, 0.24, 0.24, NOINK),
      dot: new CardPool(R, markTex("."), 30, 0.22, 0.22, AFTERINK), comma: new CardPool(R, markTex(","), 30, 0.22, 0.22, AFTERINK), qmark: new CardPool(R, markTex("?"), 30, 0.22, 0.22, AFTERINK), sack: new CardPool(R, sackTex(), 6, 0.5, 0.6, NOINK) };
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
    if (set === "river") { const Rv = this.river, now = light === "today"; Rv.old.visible = !now && st.posign !== false; Rv.today.visible = now; Rv.poSign.visible = now || st.posign !== false; Rv.plate.visible = !!st.plate; Rv.skies.day.visible = !now; Rv.skies.today.visible = now;
      Rv.drift(t); Rv.water.U.uSun.value.set(...SUN[light]); this.grassR.update(cam); }
    if (set === "woods") { this.woods.drift(t); this.grassW.update(cam); }
    if (set === "room") { const Rm = this.room; Rm.tavern.visible = light === "cabin"; Rm.congress.visible = light === "capitol"; Rm.study.visible = light === "office"; Rm.conv.visible = false;
      Rm.map.map = Rm.mapTex[st.page ?? (light === "office" ? "news" : "app")]; Rm.map.needsUpdate = true;
      Rm.lamps.forEach((l, i) => { l.intensity = light === "cabin" ? 9 * flick(i) * 0.95 : 0; });
      Rm.win.intensity = light === "office" ? 7 : light === "cabin" ? 3 : light === "capitol" ? 11 : 0; Rm.candle.intensity = light === "office" ? 7 * flick(3) : 0;
      Rm.stove.intensity = 0; Rm.stoveGlow.visible = false; Rm.drift(t); }
    // ---------------- props ----------------
    this.tools.forEach((tl, i) => { const q = st.tools?.[i]; tl.g.visible = !!q; if (!q) return;
      const gp = V(...q.g), bp = V(...q.b), d = bp.clone().sub(gp), len = d.length(); d.normalize();
      const gun = q.kind === "musket";
      tl.barrel.visible = gun; if (gun) { tl.barrel.position.copy(gp).addScaledVector(d, len / 2); tl.barrel.quaternion.setFromUnitVectors(V(0, 1, 0), d); tl.barrel.scale.set(1, len, 1); }
      const head = gun ? "stock" : q.kind;
      for (const [k, h] of Object.entries(tl.heads)) { h.visible = k === head; if (k !== head) continue; h.position.copy(k === "pick" ? bp : gp); h.quaternion.setFromUnitVectors(V(0, 1, 0), k === "stock" ? d : d.clone().negate()); if (k === "pick") h.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))); } });
    this.canes.forEach((g, i) => { const q = st.canes?.[i]; g.visible = !!q; if (!q) return; const d = V(...q.b).sub(V(...q.g)), len = d.length(); g.position.set(...q.g); g.quaternion.setFromUnitVectors(V(0, -1, 0), d.normalize()); g.scale.set(1, len, 1); });
    for (const p of Object.values(this.cards)) p.hide();
    const cn: Record<string, number> = {};
    for (const cd of st.cards ?? []) { const k = cn[cd.kind] ?? 0; cn[cd.kind] = k + 1; this.cards[cd.kind].put(k, cd.p, cam, cd.spin, cd.s, !!cd.flat); }
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    // ---- horses: each is posed on the ground; its rider is a side-view card set on the saddle ----
    const riders: Person3[] = [];
    this.horses.forEach((h, i) => { const q = st.horses?.find((x) => x.k === i); h.g.visible = !!q; if (!q) return;
      h.g.position.set(...q.p); h.g.rotation.set(0, q.yaw, 0); h.rider(!!q.rider, true);
      h.pose({ gait: q.gait, phase: q.phase, head: q.head });
      if (!q.rider) return;
      const fwd = V(Math.cos(q.yaw), 0, -Math.sin(q.yaw)), lz = V(Math.sin(q.yaw), 0, Math.cos(q.yaw)), toCam = cam.position.clone().sub(h.g.position).setY(0).normalize();
      const side = Math.sign(lz.dot(toCam)) || 1, screenR = fwd.dot(right) >= 0;
      const seat = h.saddle.getWorldPosition(this.v2).clone(), ow = OUT[q.rider.who] ?? OUT.rider, up = rideUp(ow.o) * SUc;
      const base = seat.clone().addScaledVector(lz, side * 0.33).addScaledVector(fwd, RIDE_DX * SUc); base.y -= up;
      riders.push({ who: q.rider.who, p: [base.x, base.y, base.z], expr: q.rider.expr, ride: { pose: q.rider.pose ?? 0, mirror: !screenR, tilt: 0 } });
    });
    const people = [...(st.people ?? []), ...riders].map((q0) => { const w = OUT[q0.who] ?? OUT.man; return { q: w.o.moustache && q0.expr === "shock" ? { ...q0, expr: "nervous" as const } : q0, w }; });
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, low: !!q.low || !!q.ride, extra: !!q.extra || !!q.side || !!q.ride, s: q.s ?? (OUT[q.who]?.o.build === "kid" ? 0.72 : 1) }));
    const key = st.key ?? [focus.x, focus.y + 2.2, focus.z - 1.5] as V3;
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed), ks = q.s ?? (w.o.build === "kid" ? 0.72 : 1);
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz2 = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz2) || 1, n3 = V(nx / nl2, 0, nz2 / nl2), crs = V(n3.z, 0, -n3.x);
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs) / ks, (pc.y - q.p[1]) / ks]; };
      const mirror = q.ride ? q.ride.mirror : !!q.side && (q.side.mirror !== (right.x < 0));
      const lt = mirror ? Math.PI - lightA : lightA;
      if (q.ride) {
        const pose = Math.round((q.ride.pose ?? 0) * 8) / 8, kkey = `R|${w.key}|${q.expr}|${pose}|${bl}|${lt.toFixed(2)}`;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodySide(p, w.o, { mode: "ride", pose, expr: q.expr, blink: bl, light: lt, seed: w.seed }));
      } else if (q.side) {
        const ph = Math.round(q.side.phase * 16) / 16, cw3 = q.side.carry, cy = cw3 ? onCard(V(...cw3)) : null, carry = cy ? [300 + (mirror ? -cy[0] : cy[0]) / SUc, 975 - cy[1] / SUc] as [number, number] : undefined;
        const kkey = `S|${w.key}|${q.expr}|${ph}|${bl}|${lt.toFixed(2)}|${carry ? carry.map((x) => Math.round(x / 12)).join(",") : ""}|${q.side.stride ?? 0.8}`;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodySide(p, w.o, { mode: "march", phase: ph, expr: q.expr, blink: bl, stride: q.side!.stride ?? 0.8, stomp: 0.4, light: lt, seed: w.seed, carry }));
      } else {
        let hr: [number, number] | undefined, hl: [number, number] | undefined;
        const give = (hc: [number, number]) => { if ((hc[0] >= 0 && !hr) || hl) hr = hc; else hl = hc; };
        for (const hwp of q.hw ?? []) give(onCard(V(...hwp)));
        const hk = hr || hl ? [hr, hl].flat().map((x) => (x ?? 9).toFixed(2)).join(",") : "";
        const kkey = `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${hk}|${q.march === undefined ? "" : Math.round(q.march * 12)}|${lt.toFixed(2)}|${q.mode ?? ""}`;
        const hands = hr || hl ? { r: hr ? [300 + hr[0] / SUc, 975 - hr[1] / SUc] as [number, number] : undefined, l: hl ? [300 + hl[0] / SUc, 975 - hl[1] / SUc] as [number, number] : undefined } : undefined;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodyFront(p, w.o, { mode: q.mode ?? (q.march === undefined ? "stand" : "march"), phase: q.march === undefined ? undefined : Math.round(q.march * 12) / 12, expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: hands ? undefined : q.wave, hands, light: lt, seed: w.seed }));
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
    const cc = set === "room" ? "#2a2420" : "#5a5440";
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
