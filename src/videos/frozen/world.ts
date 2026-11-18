// The Frozen Graves Short's world: six sets (fsets.ts), only the one in shot is switched on.
// Look: character look B (bridge/toon.ts) and the background rules (claude/background-and-character-look.md): the sets
// carry no ink line, every light has a source, characters cast real shadows (a shadow twin turned to the light).
// Posed per frame: the cemetery's season (snow, bare scree), the pit, the tent, the lanterns; the radar cart; the water;
// the candles; the cut's thaw and frost; Hultin's pit and lantern; the lab screen and the parcel; tools in hands
// (shovels, picks, shears, a dynamite stick, a pen); flying cards (paper, masks, viruses, sparks, earth, snowflakes);
// puffs (blast, smoke, breath); a duffel bag, a register.
import * as THREE from "three";
import { V, lam, Kit } from "../bridge/build";
import { Pen, bodyFront, bodySide, fxContact, Outfit, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { V3, FPS, GRAVE_SUN, QUAY_SUN, ALASKA_SUN, SET, RADAR_Z } from "./place";
import { buildGrave, buildQuay, buildWard, buildCut, buildAlaska, buildLab, GraveSet, QuaySet, WardSet, CutSet, AlaskaSet, LabSet, M } from "./fsets";
import { puffTex, sheetTex, hankyTex, glowTex, labelTex } from "./paint";
import { virusTex, flakeTex, sunTex, registerTex, seqTex, calTex, earthTex, maskTex } from "./fpaint";
import { ctex } from "../bridge/paint";
import type { St3, CardKind } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const LP: Record<Light, LightPreset> = {
  // the cemetery on an October night in 1918: lanterns and blue snow-light
  night: { ...D, fogNear: 30, fogFar: 260, lit: [0.62, 0.7, 0.98], shade: [0.2, 0.24, 0.42], lift: [0.04, 0.05, 0.1], charTint: [0.86, 0.9, 1.06], sideTint: [0.8, 0.84, 1.0], hemiI: 0.42, sunI: 0.9, sunCol: "#9ab0e8", sky: "#5a6a9e", ground: "#2a3050", fog: "#1c2648", charShade: 0.82 },
  // 1998: an overcast Arctic summer day, bare scree, soft shadows
  grey: { ...D, fogNear: 40, fogFar: 380, lit: [1.3, 1.3, 1.32], shade: [0.46, 0.47, 0.54], lift: [0.06, 0.06, 0.08], charTint: [0.98, 0.97, 0.96], sideTint: [0.9, 0.9, 0.94], hemiI: 0.7, sunI: 1.9, sunCol: "#f2f0ea", sky: "#c6ccd4", ground: "#7a7068", fog: "#c9d0d8" },
  // today: blue twilight on new snow, a pink band low in the sky
  twilight: { ...D, fogNear: 40, fogFar: 320, lit: [1.0, 0.92, 1.05], shade: [0.3, 0.32, 0.55], lift: [0.05, 0.05, 0.12], charTint: [0.96, 0.92, 1.0], sideTint: [0.86, 0.84, 1.0], hemiI: 0.55, sunI: 1.3, sunCol: "#ffc8b0", sky: "#8a8ab8", ground: "#4a4a6a", fog: "#6a6a94" },
  // the quay at dusk, snow falling
  quay: { ...D, fogNear: 30, fogFar: 300, lit: [0.98, 0.94, 1.02], shade: [0.3, 0.32, 0.46], lift: [0.05, 0.05, 0.1], charTint: [0.95, 0.93, 0.98], sideTint: [0.86, 0.86, 0.96], hemiI: 0.55, sunI: 1.4, sunCol: "#e8d8c8", sky: "#8a94b0", ground: "#5a5a6a", fog: "#8a90a8" },
  // the ward at night: candles and one lamp
  ward: { ...D, fogNear: 30, fogFar: 200, lit: [0.42, 0.34, 0.26], shade: [0.1, 0.08, 0.08], lift: [0.03, 0.02, 0.03], charTint: [1.02, 0.9, 0.76], sideTint: [0.92, 0.82, 0.72], hemiI: 0.16, sunI: 0, sunCol: "#ffd0a0", sky: "#5a4a40", ground: "#2a2018", fog: "#0c0908" },
  // the cut: a work lamp in the dark
  cut: { ...D, fogNear: 40, fogFar: 200, lit: [0.55, 0.52, 0.5], shade: [0.12, 0.12, 0.16], lift: [0.04, 0.04, 0.06], charTint: [1, 0.96, 0.9], sideTint: [0.9, 0.88, 0.86], hemiI: 0.3, sunI: 0, sunCol: "#ffffff", sky: "#4a5470", ground: "#1a1a22", fog: "#0e1220" },
  // Alaska, August 1997: pale overcast over the tundra
  alaska: { ...D, fogNear: 50, fogFar: 520, lit: [1.38, 1.32, 1.22], shade: [0.44, 0.44, 0.5], lift: [0.06, 0.06, 0.08], charTint: [1.0, 0.97, 0.94], sideTint: [0.9, 0.9, 0.92], hemiI: 0.66, sunI: 2.0, sunCol: "#fff2dc", sky: "#cdd2d6", ground: "#7a7048", fog: "#c9ccc8" },
  // the lab: cool fluorescent light
  lab: { ...D, fogNear: 30, fogFar: 200, lit: [0.85, 0.88, 0.92], shade: [0.3, 0.32, 0.36], lift: [0.05, 0.05, 0.06], charTint: [0.98, 0.98, 1.0], sideTint: [0.9, 0.92, 0.96], hemiI: 0.55, sunI: 0, sunCol: "#ffffff", sky: "#e8eef4", ground: "#9a9a96", fog: "#cfd4d8" },
};
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { night: "#0e1630", grey: "#c4cbd3", twilight: "#3a3e66", quay: "#5a6480", ward: "#0a0807", cut: "#0c1020", alaska: "#c9ccc8", lab: "#d8dde2" };
const SUN: Record<Light, V3> = { night: [-0.3, 0.6, 0.74], grey: GRAVE_SUN, twilight: [0.2, 0.25, 0.95], quay: QUAY_SUN, ward: [0, 1, 0], cut: [0, 1, 0], alaska: ALASKA_SUN, lab: [0, 1, 0] };
const SETOF: Record<Light, "grave" | "quay" | "ward" | "cut" | "alaska" | "lab"> = { night: "grave", grey: "grave", twilight: "grave", quay: "quay", ward: "ward", cut: "cut", alaska: "alaska", lab: "lab" };
/** lamp-lit sets: characters take light from the point lights, their shadows fall from the key lamp */
const LAMPLIT = new Set<Light>(["ward", "cut", "night", "lab"]);

// ---------------- cast ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** a miner of 1918: wool jacket, cap, braces */
const MINER = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#3e3a40", boots: "#1e1a20", hat: "cap", cap: "#3a3430", buttons: jacket, skin: "#ecc8a4", braces: "#5a4028", ...extra });
/** a 1998 scientist in a white protective suit with the hood up (the mask is the "hanky" card) */
const SUIT = (seed: number, extra: Partial<Outfit> = {}): Outfit => ({ jacket: "#f4f4f0", pants: "#eeeeea", boots: "#2e4a6a", hat: "cap", cap: "#f4f4f0", buttons: "#d8d8d4", skin: "#f0d2b0", ...extra, ...(seed ? {} : {}) });
const OUT: Record<string, Who> = {
  // 1918 miners (the sick off the ship, the men at the graves)
  miner1: who(MINER("#4a5a6a", { moustache: "#3a2a20" }), 71, "miner1"),
  miner2: who(MINER("#6a4a3a", { cap: "#2e2a2c", skin: "#f0d2b0" }), 72, "miner2"),
  miner3: who(MINER("#3e4a3a", { hat: "hair", hair: "#c9a060", skin: "#f5c9a0" }), 73, "miner3"),
  miner4: who(MINER("#5a5248", { build: "stout", moustache: "#8a5a30", plaid: "#3a3430" }), 74, "miner4"),
  miner5: who(MINER("#2e3440", { cap: "#5a3a34", skin: "#e8bc94" }), 75, "miner5"),
  sick1: who(MINER("#7a8a9a", { hat: "hair", hair: "#6a4a2a", skin: "#e8dcc8" }), 76, "sick1"),
  sick2: who(MINER("#8a7a6a", { cap: "#4a4a50", skin: "#e4d8c4" }), 77, "sick2"),
  sick3: who(MINER("#5a6a5a", { hat: "hair", hair: "#d8b070", skin: "#ecdcc8" }), 78, "sick3"),
  // the nurse and the doctor at the company hospital
  nurse: who({ jacket: "#f4f0e6", pants: "#3a3a44", boots: "#1e1a20", hat: "bonnet", cap: "#ffffff", dress: "#4a5a7a", buttons: "#f4f0e6", skin: "#f5d2b4", hair: "#7a4a2a" }, 79, "nurse"),
  doctor: who({ jacket: "#2a2a32", pants: "#2a2a32", boots: "#1e1a20", hat: "hair", hair: "#8a8a92", moustache: "#8a8a92", buttons: "#d9d4c8", skin: "#f0d2b0", shirt: "#f6f2e8", tie: "#2a2630", build: "stout" }, 80, "doctor"),
  // 1998: the team in white suits; the leader without a hood
  lead: who({ jacket: "#f4f4f0", pants: "#eeeeea", boots: "#2e4a6a", hat: "hair", hair: "#7a4a2a", buttons: "#d8d8d4", skin: "#f5d2b4", dress: "#eeeeea" }, 81, "lead"),
  sci1: who(SUIT(1, { skin: "#f0d2b0" }), 82, "sci1"),
  sci2: who(SUIT(2, { skin: "#e0b48c", build: "stout" }), 83, "sci2"),
  sci3: who(SUIT(3, { skin: "#f5c9a0" }), 84, "sci3"),
  sci4: who(SUIT(4, { skin: "#ecd0b6" }), 85, "sci4"),
  // 1997: Johan Hultin (white hair, a plaid shirt, a work jacket), the villagers who helped him, the pathologist
  hultin: who({ jacket: "#5a6a4a", pants: "#4a4a52", boots: "#3a2a20", hat: "hair", hair: "#e8e6e0", moustache: "#e8e6e0", buttons: "#5a6a4a", skin: "#f0d2b0", plaid: "#8a3a2e", shirt: "#c9b8a0" }, 86, "hultin"),
  vil1: who({ jacket: "#3a5a7a", pants: "#3a3a44", boots: "#2a221c", hat: "cap", cap: "#c9302c", buttons: "#3a5a7a", skin: "#c8946a", hair: "#1a1612" }, 87, "vil1"),
  vil2: who({ jacket: "#7a4a3a", pants: "#3e3a40", boots: "#2a221c", hat: "hair", hair: "#1a1612", buttons: "#7a4a3a", skin: "#b8845a" }, 88, "vil2"),
  vil3: who({ jacket: "#4a6a4a", pants: "#3a3a44", boots: "#2a221c", hat: "cap", cap: "#2e2a2c", buttons: "#4a6a4a", skin: "#c08a60", hair: "#1a1612", build: "stout" }, 89, "vil3"),
  path: who({ jacket: "#f6f6f2", pants: "#3a3e4a", boots: "#2a2a2e", hat: "hair", hair: "#3a2a20", buttons: "#d8d8d4", skin: SKIN, shirt: "#a8c0d8", tie: "#2f4f7a" }, 90, "path"),
};

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
const sparkTex = () => ctex("frSpark", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = "#fff2a0"; g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283, r = k % 2 ? 10 : 30; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = "#120c16"; g.lineWidth = 4; g.stroke(); });
const chunkTex = () => ctex("frChunk", 96, 96, (g, r) => { g.clearRect(0, 0, 96, 96); const pts: [number, number][] = []; for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283, rr = 26 + r() * 16; pts.push([48 + Math.cos(a) * rr, 48 + Math.sin(a) * rr]); }
  g.fillStyle = "#5e4634"; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.strokeStyle = "#120c16"; g.lineWidth = 6; g.stroke(); g.fillStyle = "#e6edf4"; g.beginPath(); g.ellipse(40, 30, 16, 8, -0.3, 0, 6.3); g.fill(); void earthTex; });

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

export class SWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#2a2024", 80, 600); private bg = new THREE.Color();
  private grave: GraveSet; private quay: QuaySet; private ward: WardSet; private cut: CutSet; private alaska: AlaskaSet; private lab: LabSet;
  private tools: { g: THREE.Group; handle: THREE.Mesh; heads: Record<string, THREE.Object3D> }[] = [];
  private cards: Record<CardKind, CardPool>;
  private puffs: THREE.Sprite[] = [];
  private book: THREE.Mesh; private duffel: THREE.Group; private specimen: THREE.Group; private calMats: THREE.Texture[] = [];
  private lastPeople: { name: string; p: V3; low: boolean; extra: boolean; s: number }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    void kit; const R = this.root;
    this.hemi = new THREE.HemisphereLight("#ffe9d0", "#5c4a44", 0.6);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.4);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.grave = buildGrave(); this.quay = buildQuay(); this.ward = buildWard(); this.cut = buildCut(); this.alaska = buildAlaska(); this.lab = buildLab();
    R.add(this.grave.group, this.quay.group, this.ward.group, this.cut.group, this.alaska.group, this.lab.group);
    // ---- posed props (these keep their ink line: they are what the characters hold) ----
    const wood = M("frToolWood", "#8a6238"), iron = M("frToolIron", "#34303a"), steel = M("frShears", "#c9ccd2");
    for (let i = 0; i < 6; i++) { const g = new THREE.Group(), handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 8), wood); g.add(handle);
      const shovel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.32), iron);
      const pick = new THREE.Group(); { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), iron); pick.add(bar); for (const sx of [-1, 1]) { const tp = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), iron); tp.rotation.z = -sx * Math.PI / 2; tp.position.x = sx * 0.4; pick.add(tp); } }
      const shears = new THREE.Group(); { for (const sx of [-1, 1]) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.24, 0.012), steel); bl.position.set(sx * 0.012, -0.1, 0); bl.rotation.z = sx * 0.18; shears.add(bl); const hd = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 6, 12), M("frShearGrip", "#c9302c")); hd.position.set(sx * 0.04, 0.06, 0); shears.add(hd); } }
      const dyn = new THREE.Group(); { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 10), M("frDyn", "#c9302c")); dyn.add(st); const fu = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 4), M("frFuse", "#3a2a20")); fu.position.y = 0.16; dyn.add(fu); }
      const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.16, 6), M("frPen", "#1a1a1e"));
      const heads = { shovel, pick, shears, dynamite: dyn, quill }; for (const h of Object.values(heads)) g.add(h);
      shadowAll(g); g.visible = false; R.add(g); this.tools.push({ g, handle, heads }); }
    this.cards = { paper: new CardPool(R, sheetTex(), 12, 0.24, 0.3, NOINK), mask: new CardPool(R, maskTex(), 12, 0.3, 0.2, NOINK), virus: new CardPool(R, virusTex(false), 40, 0.3, 0.3, AFTERINK), dead: new CardPool(R, virusTex(true), 20, 0.3, 0.3, AFTERINK),
      flake: new CardPool(R, flakeTex(), 6, 0.6, 0.6, AFTERINK), sun: new CardPool(R, sunTex(), 6, 0.6, 0.6, AFTERINK), spark: new CardPool(R, sparkTex(), 24, 0.14, 0.14, AFTERINK), chunk: new CardPool(R, chunkTex(), 40, 0.26, 0.26, NOINK), cloth: new CardPool(R, hankyTex(), 8, 0.26, 0.26, NOINK) };
    const puffT = puffTex();
    for (let i = 0; i < 48; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
    this.book = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshLambertMaterial({ map: registerTex(), side: THREE.DoubleSide })); this.book.visible = false; this.book.receiveShadow = true; R.add(this.book);
    this.duffel = new THREE.Group(); { const bag = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.6, 14), M("frDuffel", "#4a5a3a")); bag.rotation.z = Math.PI / 2; bag.position.y = 0.2; this.duffel.add(bag); for (const sx of [-0.22, 0.22]) { const st = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.015, 6, 16), M("frStrap", "#2a2a2e")); st.rotation.y = Math.PI / 2; st.position.set(sx, 0.2, 0); this.duffel.add(st); } const hd = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 6, 12, Math.PI), M("frStrap", "#2a2a2e")); hd.position.y = 0.4; this.duffel.add(hd); }
    shadowAll(this.duffel); this.duffel.visible = false; R.add(this.duffel);
    for (let d = 1; d <= 7; d++) this.calMats.push(calTex(d));
    // the specimen jar Hultin holds up: glass, a lid, a label (nothing inside is shown)
    this.specimen = new THREE.Group(); { const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 14), M("frSpecGlass", "#c9dde6")); this.specimen.add(gl); const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 14), M("frJarLid", "#2a2a30")); lid.position.y = 0.095; this.specimen.add(lid);
      const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.08), new THREE.MeshBasicMaterial({ map: labelTex("LUNG|TISSUE", "#f6f1e4", "rgba(30,20,20,0.95)", 2) })); lb.position.set(0, -0.01, 0.0715); this.specimen.add(lb); }
    shadowAll(this.specimen); this.specimen.visible = false; R.add(this.specimen);
    void glowTex; void seqTex;
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
    this.grave.group.visible = set === "grave"; this.quay.group.visible = set === "quay"; this.ward.group.visible = set === "ward"; this.cut.group.visible = set === "cut"; this.alaska.group.visible = set === "alaska"; this.lab.group.visible = set === "lab";
    // ---- lights ----
    const sunDir = this.v.set(...SUN[light]).normalize().clone();
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI; this.sun.castShadow = L.sunI > 0;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 6, 10, 50);
    this.sun.position.copy(focus).addScaledVector(sunDir, 80); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 1; sc.far = 180; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LK.bounce); TONE.uSat.value = LK.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint); CHAR.uLamp.value.x = LAMPLIT.has(light) ? 1 : 0;
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = this.bg.set(BG[light]);

    // ---------------- the sets ----------------
    if (set === "grave") { const G2 = this.grave, snow = !!st.snow, dug = !!st.dug;
      G2.snow.visible = snow; G2.bare.visible = !snow; G2.lid.visible = !dug; G2.lid.children.forEach((m) => { m.visible = (m.userData.kind === "snow") === snow; }); G2.pit.visible = dug; G2.coffins.visible = dug && (st.coffins ?? true);
      G2.tent.visible = !!st.tent; G2.flood.intensity = st.tent ? 9 : 0; G2.lanterns.visible = !!st.lanterns; G2.lamps.forEach((l, i) => { l.intensity = 7 * (1 + 0.06 * Math.sin(t * 11 + i * 2) + 0.04 * Math.sin(t * 27 + i)); });
      G2.flakes.points.visible = snow && light !== "grey"; G2.field.visible = !!st.field;
      G2.skies.night.visible = light === "night"; G2.skies.grey.visible = light === "grey"; G2.skies.twilight.visible = light === "twilight";
      G2.radar.visible = !!st.radar; if (st.radar) { G2.radar.position.set(st.radar.p[0], st.radar.p[1], st.radar.p[2] ?? RADAR_Z); G2.radar.rotation.y = st.radar.yaw; }
      G2.crosses.visible = st.crosses ?? true; G2.fill.visible = st.fill !== undefined; if (st.fill !== undefined) G2.fill.position.y = st.fill;
      G2.drift(t); }
    if (set === "quay") { const Q = this.quay; Q.water.U.uTime.value = t; Q.water.U.uSun.value.set(...SUN.quay); Q.drift(t);
      Q.foam.forEach((m, i) => { m.rotation.z = t * 0.2 + i; const k = 1 + 0.08 * Math.sin(t * 2 + i * 1.3); m.scale.set(k, k, 1); (m.material as THREE.MeshBasicMaterial).opacity = 0.75 + 0.15 * Math.sin(t * 1.7 + i); });
      Q.ship.position.set(0, 0.06 * Math.sin(t * 0.9), st.shipZ ?? 0); Q.ship.rotation.z = 0.006 * Math.sin(t * 0.7);
      Q.smoke.forEach((s, i) => { const u = (t * 0.22 + i / Q.smoke.length) % 1; s.position.set(SET.quay[0] + 6.4 - 0.5 * u + 3 * u * u, 3.3 + 2.2 + 5.5 + 7 * u, -28 + 11.5 - 8 * u + (st.shipZ ?? 0)); s.scale.setScalar(1.2 + 5 * u); (s.material as THREE.SpriteMaterial).opacity = 0.7 * (1 - u); });
      Q.lamps.forEach((l, i) => { l.intensity = 8 * (1 + 0.06 * Math.sin(t * 11 + i * 2)); }); }
    if (set === "ward") { const W2 = this.ward, lit = st.candles ?? 7; W2.candles.forEach((c2, i) => { const on = i < lit, fl = 1 + 0.12 * Math.sin(t * 13 + i * 2.3) + 0.06 * Math.sin(t * 31 + i); c2.f.visible = on; c2.h.visible = on; c2.l.intensity = on ? 1.6 * fl : 0; c2.h.scale.setScalar(on ? 0.35 * fl : 0); });
      W2.lamp.intensity = 10 * (1 + 0.04 * Math.sin(t * 7)); W2.stove.intensity = 4 * (1 + 0.15 * Math.sin(t * 5) + 0.08 * Math.sin(t * 17));
      (W2.cal.material as THREE.MeshLambertMaterial).map = this.calMats[Math.max(0, Math.min(6, (st.day ?? 1) - 1))]; W2.drift(t); }
    if (set === "cut") { const C = this.cut, th = st.thaw ?? 1; C.mud.color.setRGB(0.55 + 0.45 * th, 0.6 + 0.4 * th, 0.75 + 0.25 * th); (C.frost.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - th);
      C.snowTop.visible = th < 0.5; C.ghosts.visible = !!st.ghosts; C.coffins.visible = st.coffins ?? true; C.line.scale.y = 1 + 0.3 * Math.sin(t * 6); C.lamp.intensity = 26; C.drift(t); }
    if (set === "alaska") { const A = this.alaska; A.lid.visible = !st.dug; A.pit.visible = !!st.dug; A.lantern.intensity = st.dug ? 3.5 * (1 + 0.06 * Math.sin(t * 11)) : 0; A.prop.rotation.x = (st.spin ?? 0) * t * 40; if (st.plane) { A.plane.position.set(...st.plane.p); A.plane.rotation.set(0, st.plane.yaw, st.plane.roll ?? 0); } else { A.plane.position.set(SET.alaska[0] - 13, 0, 9); A.plane.rotation.set(0, -0.5, 0); } A.drift(t); }
    if (set === "lab") { const Lb2 = this.lab; Lb2.screen.map = seqTex(!!st.done); Lb2.screen.needsUpdate = true; Lb2.parcel.visible = st.parcel?.open === false; Lb2.open.visible = st.parcel?.open === true; const pp = st.parcel;
      if (pp) for (const g of [Lb2.parcel, Lb2.open]) { g.position.set(...pp.p); g.rotation.set(pp.tilt ?? 0, pp.yaw, pp.roll ?? 0); }
      Lb2.jar.visible = st.jar ?? true; Lb2.drift(t); }

    // ---------------- props ----------------
    this.tools.forEach((tl, i) => { const q = st.tools?.[i]; tl.g.visible = !!q; if (!q) return;
      const gp = V(...q.g), bp = V(...q.b), d = bp.clone().sub(gp), len = d.length(); d.normalize();
      const short = q.kind === "quill" || q.kind === "shears" || q.kind === "dynamite";
      tl.handle.visible = !short; tl.handle.position.copy(gp).addScaledVector(d, len / 2); tl.handle.quaternion.setFromUnitVectors(V(0, 1, 0), d); tl.handle.scale.set(q.kind === "pick" ? 1.3 : 1, len, q.kind === "pick" ? 1.3 : 1);
      for (const [k, h] of Object.entries(tl.heads)) { h.visible = k === q.kind; if (k !== q.kind) continue;
        if (short) { h.position.copy(gp).addScaledVector(d, len / 2); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); h.scale.setScalar(q.s ?? 1); }
        else { h.position.copy(bp); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); if (k === "shovel") h.position.addScaledVector(d, 0.14); } } });
    for (const p of Object.values(this.cards)) p.hide();
    const cn: Record<string, number> = {};
    for (const cd of st.cards ?? []) { const k = cn[cd.kind] ?? 0; cn[cd.kind] = k + 1; this.cards[cd.kind].put(k, cd.p, cam, cd.spin, cd.s, !!cd.flat); }
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });
    this.book.visible = !!st.book; if (st.book) { this.book.position.set(...st.book.p); this.book.rotation.set(st.book.tilt ?? -Math.PI / 2, Math.PI + st.book.yaw, 0, "YXZ"); }
    this.specimen.visible = !!st.specimen; if (st.specimen) { this.specimen.position.set(...st.specimen); this.specimen.lookAt(cam.position.x, st.specimen[1], cam.position.z); this.specimen.scale.setScalar(1.6); }
    this.duffel.visible = !!st.duffel; if (st.duffel) { this.duffel.position.set(...st.duffel.p); this.duffel.rotation.set(0, st.duffel.yaw, st.duffel.roll ?? 0); }

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.miner1 }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, low: !!q.low, extra: !!q.extra || !!q.side, s: q.s ?? (OUT[q.who]?.o.build === "kid" ? 0.72 : 1) }));
    const key = st.key ?? [focus.x, focus.y + 2.2, focus.z - 1.5] as V3;
    let ai = 0; const masks: V3[] = [], cloths: V3[] = [];
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed), ks = q.s ?? (w.o.build === "kid" ? 0.72 : 1);
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz2 = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz2) || 1, n3 = V(nx / nl2, 0, nz2 / nl2), crs = V(n3.z, 0, -n3.x);
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs) / ks, (pc.y - q.p[1]) / ks]; };
      const mirror = !!q.side && (q.side.mirror !== (right.x < 0));
      // a mask (protective suit) or a cloth to the mouth (the sick): a white card just in front of the face; the cloth needs a hand
      if (q.mask) masks.push([q.p[0] + n3.x * 0.2, q.p[1] + 1.47 * ks, q.p[2] + n3.z * 0.2]);
      if (q.cloth) cloths.push([q.p[0] + n3.x * 0.22, q.p[1] + 1.42 * ks, q.p[2] + n3.z * 0.22]);
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
      act.caster.rotation.set(0, L.sunI <= 0 || LAMPLIT.has(light) && light !== "night" ? Math.atan2(key[0] - q.p[0], key[2] - q.p[2]) : Math.atan2(sunDir.x, sunDir.z), 0);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = this.actors[i].caster.visible = false;
    masks.forEach((hp, i) => this.cards.mask.put((cn.mask ?? 0) + i, hp, cam, 0, 1.0, false));
    cloths.forEach((hp, i) => this.cards.cloth.put(i, hp, cam, 0.15, 1.0, false));
    // ---- contact shadows ----
    const cc = set === "grave" && st.snow ? "#7a84a8" : set === "ward" ? "#3a2a24" : "#6a6268";
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
