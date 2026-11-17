// The Great Stink Short's world: four sets (sets.ts, sets2.ts), only the one in shot is switched on.
// Look: character look B (bridge/toon.ts) and the background rules (claude/background-and-character-look.md): the sets
// carry no ink line, every light has a source, characters cast real shadows (a shadow twin turned to the light).
// Posed per frame: the curtains (dry or soaked), the river's level and the sewer mouths pouring, brushes / shovels /
// picks / a quill held in hands, buckets, flying paper, handkerchiefs, stink lines, a newspaper, the bill, money bags,
// suitcases, packing crates, the pump's stream, the sewer's water.
import * as THREE from "three";
import { V, lam, Kit } from "../bridge/build";
import { Pen, bodyFront, bodySide, fxContact, Outfit, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { newsTex, suitcase } from "../lustig/props";
import { V3, FPS, ROOM_SUN, RIVER_SUN, STREET_SUN, WATER, OUTFALL_Y, SEWER_LAMPS, SET, SEWER } from "./place";
import { buildRoom, buildStreet, RoomSet, StreetSet, M, makeBucket } from "./sets";
import { buildRiver, buildSewer, RiverSet, SewerSet } from "./sets2";
import { billTex, planTex, puffTex, stinkTex, sheetTex, hankyTex, dropTex, labelTex } from "./paint";
import type { St3, CardKind } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const ROOM_L: LightPreset = { ...D, fogNear: 80, fogFar: 600, lit: [1.62, 1.42, 1.0], shade: [0.5, 0.41, 0.35], lift: [0.06, 0.05, 0.05], charTint: [1.0, 0.93, 0.85], sideTint: [0.9, 0.86, 0.84], hemiI: 0.5, sunI: 2.7, sunCol: "#ffe2b0", sky: "#ffe6c0", ground: "#5a4234", fog: "#2a2018" };
const RIVER_L: LightPreset = { ...D, fogNear: 34, fogFar: 250, lit: [1.5, 1.36, 1.02], shade: [0.44, 0.38, 0.33], lift: [0.07, 0.06, 0.06], charTint: [1.0, 0.95, 0.86], sideTint: [0.9, 0.88, 0.84], hemiI: 0.6, sunI: 2.6, sunCol: "#fff0c8", sky: "#f2e6c0", ground: "#7a6a48", fog: "#dccb9c" };
const STREET_L: LightPreset = { ...D, fogNear: 12, fogFar: 64, lit: [1.42, 1.26, 0.96], shade: [0.36, 0.32, 0.3], lift: [0.06, 0.055, 0.06], charTint: [0.96, 0.91, 0.84], sideTint: [0.86, 0.84, 0.82], hemiI: 0.52, sunI: 2.5, sunCol: "#ffe8bc", sky: "#e6dcc0", ground: "#4a4034", fog: "#cdbf9c" };
const SEWER_L: LightPreset = { ...D, fogNear: 14, fogFar: 62, lit: [0.5, 0.4, 0.3], shade: [0.1, 0.08, 0.07], lift: [0.03, 0.02, 0.02], charTint: [1.02, 0.9, 0.74], sideTint: [0.92, 0.82, 0.7], hemiI: 0.14, sunI: 0, sunCol: "#ffd0a0", sky: "#6e5a48", ground: "#2c2018", fog: "#0a0706" };
const LP: Record<Light, LightPreset> = { room: ROOM_L, river: RIVER_L, street: STREET_L, sewer: SEWER_L };
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { room: "#1a1412", river: "#a9b6b8", street: "#dcd2b2", sewer: "#050404" };
const SUN: Record<Light, V3> = { room: ROOM_SUN, river: RIVER_SUN, street: STREET_SUN, sewer: [0, 1, 0] };

// ---------------- cast ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** a gentleman of 1858: frock coat, white shirt front, a cravat */
const GENT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#3a3640", boots: "#1e1a20", hat: "tophat", hair: "#3a2a20", buttons: "#d9d4c8", skin: "#f5c9a0", shirt: "#f6f2e8", tie: "#2a2630", ...extra });
const WORK = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#5a4e40", boots: "#2a221c", hat: "cap", cap: "#4a4034", buttons: jacket, skin: "#e8bc94", braces: "#5a4028", ...extra });
const OUT: Record<string, Who> = {
  // the senior member who says no: stout, white whiskers, a red cravat
  chief: who(GENT("#23222c", { build: "stout", hair: "#d9d4c8", moustache: "#d9d4c8", tie: "#a82a2a", buttons: "#e8c45a", skin: "#f0d2b0" }), 41, "chief"),
  // the clerk who asks: young, bare-headed, grey coat
  clerk: who(GENT("#7a7468", { hat: "hair", hair: "#8a5a30", tie: "#3f5a7a", skin: SKIN, pants: "#4a4650" }), 42, "clerk"),
  // the man in charge of the money: black curls, a plum coat, a bright cravat, no hat indoors
  chancellor: who(GENT("#4a2a4a", { hat: "hair", hair: "#16121a", tie: "#d9b04a", buttons: "#d9b04a", skin: "#ecd0b6", pants: "#2e2a34" }), 43, "chancellor"),
  // other members
  mp1: who(GENT("#2b3440", { moustache: "#3a2a20", tie: "#3f6a4a" }), 44, "mp1"),
  mp2: who(GENT("#3a2e2a", { hair: "#8a8a92", moustache: "#8a8a92", build: "stout", skin: "#ecd0b6", tie: "#6a2a3a" }), 45, "mp2"),
  mp3: who(GENT("#2a2a32", { hat: "hair", hair: "#b5462f", skin: "#f5c9a0", tie: "#2f4f7a" }), 46, "mp3"),
  mp4: who(GENT("#34383a", { moustache: "#16121a", skin: "#e0b48c", tie: "#8a6a2a" }), 47, "mp4"),
  mp5: who(GENT("#2e2630", { hair: "#d9d4c8", hat: "hair", moustache: "#d9d4c8", skin: "#f0d2b0", tie: "#3a3a3a" }), 48, "mp5"),
  mp6: who(GENT("#30343e", { build: "stout", moustache: "#5a3b2a", skin: SKIN, tie: "#7a2a2a" }), 49, "mp6"),
  // the famous scientist: grey side-whiskers, a dark coat, no hat
  scientist: who(GENT("#34404a", { hat: "hair", hair: "#b9b3a8", moustache: "#b9b3a8", skin: "#ecd0b6", tie: "#1c1a20", buttons: "#9a9a9a" }), 50, "scientist"),
  // the men with the buckets: shirtsleeves, braces, caps
  hand1: who(WORK("#e6dfcc", { plaid: undefined, moustache: "#3a2a20" }), 51, "hand1"),
  hand2: who(WORK("#d9d2bc", { cap: "#5a3a34", build: "stout", skin: "#f0d2b0" }), 52, "hand2"),
  // the people of the court
  mother: who({ jacket: "#6a5a52", pants: "#4a4038", boots: "#2a221c", hat: "bonnet", cap: "#b9b2a0", dress: "#6a5a66", buttons: "#6a5a52", skin: "#e8bc94", hair: "#3a2a20" }, 53, "mother"),
  kid: who({ jacket: "#8a7a5a", pants: "#4a4038", boots: "#2a221c", hat: "cap", cap: "#5a4a3a", buttons: "#8a7a5a", skin: "#f0c8a0", build: "kid", braces: "#4a3424" }, 54, "kid"),
  oldman: who(WORK("#5a5248", { hat: "hair", hair: "#c9c4b8", moustache: "#c9c4b8", build: "stout", skin: "#e0b48c", plaid: "#3a3430" }), 55, "oldman"),
  girl: who({ jacket: "#7a6a5a", pants: "#4a4038", boots: "#2a221c", hat: "bonnet", cap: "#a89a84", dress: "#5a6a6a", buttons: "#7a6a5a", skin: "#f0c8a0", build: "kid" }, 56, "girl"),
  poor1: who(WORK("#6a5e50", { cap: "#3a3430", plaid: "#4a4238" }), 57, "poor1"),
  // the well-off leaving town
  lady: who({ jacket: "#7a3a5a", pants: "#4a2a3a", boots: "#2a221c", hat: "bonnet", cap: "#e6d9b8", dress: "#8a3f66", buttons: "#e8c45a", skin: "#f5d2b4", hair: "#5a3b2a" }, 58, "lady"),
  toff: who(GENT("#3a4a5a", { moustache: "#5a3b2a", tie: "#a82a2a", buttons: "#e8c45a" }), 59, "toff"),
  toff2: who(GENT("#4a3a2e", { build: "stout", hair: "#8a8a92", moustache: "#8a8a92", tie: "#3f6a4a", skin: "#f0d2b0" }), 60, "toff2"),
  // the sewer: the engineer and his navvies
  engineer: who(GENT("#3a3a42", { moustache: "#3a2a20", tie: "#2f4f7a", skin: "#ecd0b6" }), 61, "engineer"),
  navvy1: who(WORK("#8a3a2e", { plaid: "#5a221a", moustache: "#2a201a", build: "stout" }), 62, "navvy1"),
  navvy2: who(WORK("#4a5a6a", { cap: "#2e2a2c", skin: "#f0c8a0" }), 63, "navvy2"),
  navvy3: who(WORK("#6a6a4a", { plaid: "#4a4a30", cap: "#5a3a34", moustache: "#8a5a30", skin: SKIN }), 64, "navvy3"),
};

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };

/** camera-facing cut-out cards of one kind (paper, handkerchiefs, drops, stink lines) */
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
  private room: RoomSet; private river: RiverSet; private street: StreetSet; private sewer: SewerSet;
  private tools: { g: THREE.Group; handle: THREE.Mesh; heads: Record<string, THREE.Object3D> }[] = [];
  private buckets: THREE.Group[] = []; private bucketsB: THREE.Group[] = [];
  private cards: Record<CardKind, CardPool>;
  private puffs: THREE.Sprite[] = [];
  private news: THREE.Mesh; private bill: THREE.Mesh; private plan: THREE.Mesh;
  private bags: THREE.Group[] = []; private cases: THREE.Group[] = []; private crates: THREE.Mesh[] = [];
  private lastPeople: { name: string; p: V3; low: boolean; extra: boolean; s: number }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    void kit; const R = this.root;
    this.hemi = new THREE.HemisphereLight("#ffe9d0", "#5c4a44", 0.6);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.4);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.room = buildRoom(); this.river = buildRiver(); this.street = buildStreet(); this.sewer = buildSewer();
    R.add(this.room.group, this.river.group, this.street.group, this.sewer.group);
    // ---- posed props (these keep their ink line: they are what the characters hold) ----
    const wood = M("skToolWood", "#8a6238"), iron = M("skIron", "#34303a");
    for (let i = 0; i < 6; i++) { const g = new THREE.Group(), handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 8), wood); g.add(handle);
      const brush = new THREE.Group(); { const blk = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.09), wood); const br = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.1), M("skBristle", "#f1eee2")); br.position.y = -0.09; brush.add(blk, br); }
      const shovel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.32), iron);
      const pick = new THREE.Group(); { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), iron); pick.add(bar); for (const sx of [-1, 1]) { const tp = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), iron); tp.rotation.z = -sx * Math.PI / 2; tp.position.x = sx * 0.4; pick.add(tp); } }
      const quill = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.34, 6), M("skQuill", "#f6f2e8")); quill.scale.z = 0.25;
      const heads = { brush, shovel, pick, quill }; for (const h of Object.values(heads)) g.add(h);
      shadowAll(g); g.visible = false; R.add(g); this.tools.push({ g, handle, heads }); }
    for (let i = 0; i < 3; i++) { const bk = makeBucket("#f1eee2"); bk.visible = false; R.add(bk); this.buckets.push(bk); const bb = makeBucket("#6a5430"); bb.visible = false; R.add(bb); this.bucketsB.push(bb); }
    this.cards = { paper: new CardPool(R, sheetTex(), 28, 0.24, 0.3, NOINK), hanky: new CardPool(R, hankyTex(), 12, 0.24, 0.24, NOINK), drop: new CardPool(R, dropTex(), 30, 0.07, 0.105, NOINK), stink: new CardPool(R, stinkTex(), 30, 0.3, 1.2, AFTERINK) };
    const puffT = puffTex();
    for (let i = 0; i < 48; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
    this.news = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.742), new THREE.MeshBasicMaterial({ map: newsTex("stink", "THE TIMES", "THE GREAT STINK", "FIX THE RIVER!"), side: THREE.DoubleSide, color: new THREE.Color(0.95, 0.95, 0.95) })); this.news.visible = false; this.news.layers.set(NOINK); R.add(this.news);
    this.bill = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.59), lam("skBillM", () => ({ map: billTex(), side: THREE.DoubleSide }))); this.bill.visible = false; this.bill.receiveShadow = true; R.add(this.bill);
    this.plan = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), new THREE.MeshBasicMaterial({ map: planTex(), side: THREE.DoubleSide, color: new THREE.Color(0.9, 0.9, 0.9) })); this.plan.visible = false; this.plan.layers.set(NOINK); R.add(this.plan);
    for (let i = 0; i < 4; i++) { const g = new THREE.Group(), sack = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), M("skBag", "#c9b07a")); sack.scale.set(1, 0.85, 1); sack.position.y = 0.17; const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.1, 10), M("skBag", "#c9b07a")); neck.position.y = 0.36; const tie = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 12), M("skBagTie", "#6a4a2a")); tie.rotation.x = Math.PI / 2; tie.position.y = 0.33;
      const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: labelTex("£", "#c9b07a", "rgba(60,36,16,0.95)", 1), color: new THREE.Color(0.9, 0.9, 0.9) })); lb.rotation.y = Math.PI; lb.position.set(0, 0.17, -0.2); g.add(sack, neck, tie, lb); shadowAll(g); g.visible = false; R.add(g); this.bags.push(g); }
    for (let i = 0; i < 4; i++) { const c = suitcase(); c.traverse((o) => { o.castShadow = true; }); c.visible = false; R.add(c); this.cases.push(c); }
    for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.44), lam("skCrateMove", () => ({ map: labelTex("COMMONS|PAPERS", "#a8834e") }))); c.castShadow = true; c.visible = false; R.add(c); this.crates.push(c); }
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose the world for shot `id` (spec st) at frame f */
  update(_id: number, st: St3, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, light: Light = st.light, L = LP[light];
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.04; cam.far = 1600; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...(st.focus ?? c.look)), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- which set is standing ----
    this.room.group.visible = light === "room"; this.river.group.visible = light === "river"; this.street.group.visible = light === "street"; this.sewer.group.visible = light === "sewer";
    // ---- lights ----
    const sunDir = this.v.set(...SUN[light]).normalize().clone();
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI; this.sun.castShadow = L.sunI > 0;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 6, 10, 46);
    this.sun.position.copy(focus).addScaledVector(sunDir, 70); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LK.bounce); TONE.uSat.value = LK.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint); CHAR.uLamp.value.x = light === "sewer" ? 1 : 0;
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = this.bg.set(BG[light]);

    // ---------------- the sets ----------------
    if (light === "room") { this.room.dry.visible = !st.wet; this.room.wet.visible = !!st.wet; this.room.drift(t); }
    if (light === "river") { const R2 = this.river, lv = st.river ?? WATER.high, low = THREE.MathUtils.clamp((WATER.high - lv) / (WATER.high - WATER.low), 0, 1);
      R2.water.position.y = lv; R2.waterMap.offset.x = t * 0.012; R2.pourMap.offset.y = t * 1.4; R2.drift(t);
      const top = OUTFALL_Y - 0.5; R2.pours.forEach((p, i) => { const on = (st.pour ?? 0) > 0 && lv < top - 0.1; p.visible = on; if (on) { const k = (st.pour ?? 0) * (0.85 + 0.15 * Math.sin(t * 9 + i * 2)); p.scale.set(k, top - lv + 0.1, 1); p.position.y = (top + lv) / 2; } });
      R2.barge.position.y = Math.max(lv, -1.45) - 0.35 + 0.03 * Math.sin(t * 1.3) * (1 - low); R2.barge.rotation.z = 0.16 * low * low; R2.barge.rotation.x = 0.02 * Math.sin(t * 0.9) * (1 - low);
      R2.boat.position.y = Math.max(lv, -1.0) + 0.3 + 0.03 * Math.sin(t * 1.7 + 1) * (1 - low); R2.boat.rotation.z = -0.3 * low * low; }
    if (light === "street") { this.street.gutter.offset.y = -t * 0.5; this.street.spout.visible = !!st.pump; this.street.drift(t); }
    if (light === "sewer") { const S2 = this.sewer, fl = st.flow ?? 0; S2.works.visible = !!st.works; S2.water.position.y = -0.62 + 0.4 * fl; S2.waterMap.offset.y = -t * (0.12 + 1.5 * fl); S2.drift(t);
      S2.lights.forEach((l, i) => { l.intensity = (l.userData.I as number) * (1 + 0.05 * Math.sin(t * 9 + i * 2.1) + 0.03 * Math.sin(t * 23 + i)); });
      S2.halos.forEach((h, i) => h.scale.setScalar(1.5 * (1 + 0.05 * Math.sin(t * 9 + i * 2.1)))); }

    // ---------------- props ----------------
    this.tools.forEach((tl, i) => { const q = st.tools?.[i]; tl.g.visible = !!q; if (!q) return;
      const gp = V(...q.g), bp = V(...q.b), d = bp.clone().sub(gp), len = d.length(); d.normalize();
      tl.handle.visible = q.kind !== "quill"; tl.handle.position.copy(gp).addScaledVector(d, len / 2); tl.handle.quaternion.setFromUnitVectors(V(0, 1, 0), d); tl.handle.scale.set(q.kind === "pick" ? 1.3 : 1, len, q.kind === "pick" ? 1.3 : 1);
      for (const [k, h] of Object.entries(tl.heads)) { h.visible = k === q.kind; if (k !== q.kind) continue;
        if (k === "quill") { h.position.copy(gp).addScaledVector(d, len / 2); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); h.scale.set(1, len / 0.34, 0.25); }
        else { h.position.copy(bp); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); if (k === "shovel") h.position.addScaledVector(d, 0.14); } } });
    this.buckets.forEach((bk, i) => { const q = (st.buckets ?? []).filter((x) => !x.brown)[i]; bk.visible = !!q; if (q) bk.position.set(...q.p); });
    this.bucketsB.forEach((bk, i) => { const q = (st.buckets ?? []).filter((x) => x.brown)[i]; bk.visible = !!q; if (q) bk.position.set(...q.p); });
    for (const p of Object.values(this.cards)) p.hide();
    const cn: Record<string, number> = {};
    for (const cd of st.cards ?? []) { const k = cn[cd.kind] ?? 0; cn[cd.kind] = k + 1; this.cards[cd.kind].put(k, cd.p, cam, cd.spin, cd.s, !!cd.flat); }
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });
    this.news.visible = !!st.news; if (st.news) { this.news.position.set(...st.news.p); this.news.rotation.set(st.news.tilt, Math.PI + st.news.yaw, st.news.roll ?? 0, "YXZ"); this.news.scale.setScalar(st.news.s); }
    this.bill.visible = !!st.bill; if (st.bill) { this.bill.position.set(...st.bill.p); this.bill.rotation.set(-Math.PI / 2 + (st.bill.tilt ?? 0), Math.PI + st.bill.yaw, 0, "YXZ"); }
    this.plan.visible = !!st.plan; if (st.plan) { this.plan.position.set(...st.plan.p); this.plan.rotation.set(st.plan.tilt ?? 0, Math.PI + st.plan.yaw, 0, "YXZ"); }
    this.bags.forEach((g, i) => { const q = st.bags?.[i]; g.visible = !!q; if (q) { g.position.set(...q); g.rotation.y = i * 0.5; } });
    this.cases.forEach((g, i) => { const q = st.cases?.[i]; g.visible = !!q; if (q) { g.position.set(...q.p); g.rotation.set(0, q.yaw, 0); } });
    this.crates.forEach((g, i) => { const q = st.crates?.[i]; g.visible = !!q; if (q) { g.position.set(...q.p); g.rotation.set(0, q.yaw, q.tilt ?? 0); } });

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.mp1 }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, low: !!q.low, extra: !!q.extra || !!q.side, s: q.s ?? (OUT[q.who]?.o.build === "kid" ? 0.72 : 1) }));
    // the lamp the sewer's shadows fall from: the nearest lantern in front of the camera
    const key = st.key ?? [SET.sewer[0], SEWER.wall + 0.4 + SEWER.r - 1.15, SEWER_LAMPS[0]] as V3;
    let ai = 0; const hankies: V3[] = [];
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed), ks = q.s ?? (w.o.build === "kid" ? 0.72 : 1);
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz) || 1, n3 = V(nx / nl2, 0, nz / nl2), crs = V(n3.z, 0, -n3.x);
      // where a point in the world falls on this character's card, as seen from the camera (metres from the feet)
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs) / ks, (pc.y - q.p[1]) / ks]; };
      const mirror = !!q.side && (q.side.mirror !== (right.x < 0));
      // a handkerchief over the nose: a hand goes to it (walkers bring both hands up), and the cloth sits just in front of the face
      const noseW: V3 | null = !q.hanky ? null : q.side ? (q.side.carry ?? [q.p[0] + (q.side.mirror ? -0.3 : 0.3), q.p[1] + 1.36 * ks, q.p[2]]) : [q.p[0] + n3.x * 0.16, q.p[1] + 1.37 * ks, q.p[2] + n3.z * 0.16];
      if (noseW) hankies.push(q.side ? [noseW[0] + n3.x * 0.1, noseW[1], noseW[2] + n3.z * 0.1] : noseW);
      const lt = mirror ? Math.PI - lightA : lightA;
      if (q.side) {
        const ph = Math.round(q.side.phase * 16) / 16, cw3 = q.side.carry ?? noseW, cy = cw3 ? onCard(V(...cw3)) : null, carry = cy ? [300 + (mirror ? -cy[0] : cy[0]) / SUc, 975 - cy[1] / SUc] as [number, number] : undefined;
        const kkey = `S|${w.key}|${q.expr}|${ph}|${bl}|${lt.toFixed(2)}|${carry ? carry.map((x) => Math.round(x / 12)).join(",") : ""}|${q.side.stride ?? 0.8}`;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodySide(p, w.o, { mode: "march", phase: ph, expr: q.expr, blink: bl, stride: q.side!.stride ?? 0.8, stomp: 0.4, light: lt, seed: w.seed, carry }));
      } else {
        let hr: [number, number] | undefined, hl: [number, number] | undefined;
        const give = (hc: [number, number]) => { if ((hc[0] >= 0 && !hr) || hl) hr = hc; else hl = hc; };
        if (noseW) give(onCard(V(...noseW)));
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
      // shadow twin: an unseen copy of the card turned to face the light, so a flat card throws a whole shadow
      act.caster.visible = true; act.caster.position.set(...q.p); act.caster.scale.copy(act.mesh.scale);
      act.caster.rotation.set(0, light === "sewer" ? Math.atan2(key[0] - q.p[0], key[2] - q.p[2]) : Math.atan2(sunDir.x, sunDir.z), 0);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = this.actors[i].caster.visible = false;
    hankies.forEach((hp, i) => this.cards.hanky.put((cn.hanky ?? 0) + i, hp, cam, 0.12, 1.0, false));
    // ---- contact shadows ----
    const cc = light === "sewer" ? "#5a3a34" : light === "room" ? "#6a5a5c" : "#7a6a70";
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
      if (q.extra) continue;
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
