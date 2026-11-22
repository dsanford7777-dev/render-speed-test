// The Lake Peigneur Short's world: two sets (psets.ts), only the one in shot is switched on.
// Look: character look B (bridge/toon.ts) and the background rules (claude/background-and-character-look.md): the sets
// carry no ink line, every light has a source, characters cast real shadows (a shadow twin turned to the light).
// Posed per frame: the lake's water level, the whirlpool (hole radius, depth, spin), the crater, the stream and the
// waterfall from the canal; the rig (tilt, roll, sink), the barges, the tug, the skiff, the island's slump; today's
// chimney; in the mine: the water front, the roof breach, the drill bit, the cage and its gate.
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
import { puffTex, sheetTex, hankyTex } from "../frozen/paint";
import { V3, FPS, SET, LAKE_SUN, HOLE, BED, BARGES, TUG, FISH, funnelY } from "./place";
import { buildLake, buildMine, LakeSet, MineSet } from "./psets";
import type { St3, CardKind } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const LP: Record<Light, LightPreset> = {
  // just after dawn on the lake: low warm sun, long shadows, a little haze
  dawn: { ...D, fogNear: 120, fogFar: 1300, lit: [1.4, 1.12, 0.86], shade: [0.36, 0.38, 0.54], lift: [0.06, 0.05, 0.09], charTint: [1.04, 0.94, 0.84], sideTint: [0.9, 0.88, 0.96], hemiI: 0.6, sunI: 2.4, sunCol: "#ffd2a0", sky: "#c9d4e4", ground: "#6a5a44", fog: "#e8d8c4" },
  // later that morning: the lake draining, bright and clear
  morn: { ...D, fogNear: 160, fogFar: 1500, lit: [1.42, 1.36, 1.2], shade: [0.42, 0.44, 0.56], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.94], sideTint: [0.9, 0.9, 0.95], hemiI: 0.68, sunI: 2.4, sunCol: "#fff0d6", sky: "#bcd2ea", ground: "#6a6048", fog: "#d4dee8" },
  // the days after (the refill): a soft overcast day
  day: { ...D, fogNear: 140, fogFar: 1400, lit: [1.3, 1.3, 1.28], shade: [0.5, 0.52, 0.6], lift: [0.07, 0.07, 0.09], charTint: [1.0, 0.99, 0.98], sideTint: [0.92, 0.92, 0.96], hemiI: 0.78, sunI: 1.6, sunCol: "#f4f2ec", sky: "#c4ccd6", ground: "#6a6450", fog: "#d0d6dc" },
  // today: a bright clear day, calm salt water
  today: { ...D, fogNear: 180, fogFar: 1600, lit: [1.44, 1.4, 1.28], shade: [0.46, 0.48, 0.58], lift: [0.06, 0.06, 0.08], charTint: [1.0, 0.98, 0.95], sideTint: [0.9, 0.9, 0.94], hemiI: 0.7, sunI: 2.3, sunCol: "#fff4e0", sky: "#b9d2ea", ground: "#6a6048", fog: "#cfdbe6" },
  // the salt mine: hanging lamps, white walls
  mine: { ...D, fogNear: 40, fogFar: 260, lit: [0.9, 0.84, 0.72], shade: [0.3, 0.3, 0.34], lift: [0.06, 0.06, 0.07], charTint: [1.02, 0.96, 0.88], sideTint: [0.9, 0.9, 0.94], hemiI: 0.42, sunI: 0, sunCol: "#ffe2b0", sky: "#d8d0c0", ground: "#6a6258", fog: "#2a2622", charShade: 0.88 },
};
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { dawn: "#e8d8c4", morn: "#d4dee8", day: "#d0d6dc", today: "#cfdbe6", mine: "#2a2622" };
const SKY: Record<Light, "morn" | "day"> = { dawn: "morn", morn: "day", day: "day", today: "day", mine: "day" };
const SUN: Record<Light, V3> = { dawn: LAKE_SUN, morn: [-0.4, 0.62, 0.68], day: [-0.3, 0.8, 0.5], today: [0.35, 0.7, 0.62], mine: [0, 1, 0] };
const LAMPLIT = new Set<Light>(["mine"]);

// ---------------- cast ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** a 1980 rig hand: hard hat, coveralls */
const HAND = (cov: string, hat: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket: cov, pants: cov, boots: "#3a2a20", hat: "hardhat", cap: hat, buttons: cov, skin: "#ecc8a4", belt: "#2a2220", ...extra });
/** a salt miner: hard hat with a cap lamp, work clothes */
const MINER = (cov: string, hat: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket: cov, pants: "#3a3e4a", boots: "#2a2220", hat: "minerhat", cap: hat, buttons: cov, skin: "#e8c4a0", belt: "#2a2220", ...extra });
const SUIT = (col: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket: col, pants: col, boots: "#1a1618", hat: "hair", hair: "#5a4a3a", buttons: col, skin: "#f0d2b0", shirt: "#f4f0e6", tie: "#7a2a2a", ...extra });
export const OUT: Record<string, Who> = {
  // the rig crew: the driller, two floor hands, the toolpusher
  driller: who(HAND("#3a5a7a", "#f0ece0", { moustache: "#5a3a22" }), 201, "driller"),
  hand1: who(HAND("#8a5a2a", "#e8c43a"), 202, "hand1"),
  hand2: who(HAND("#5a6a3a", "#e8c43a", { skin: "#8a5a3c" }), 203, "hand2"),
  pusher: who(HAND("#6a4a3a", "#c0353a", { build: "stout", moustache: "#3a2a20", shirt: "#c9c2b0", plaid: "#4a3a30" }), 204, "pusher"),
  // the miners, and the foreman who drove round the far corners
  m1: who(MINER("#4a5a6a", "#f0ece0"), 205, "m1"),
  m2: who(MINER("#6a5a48", "#e8c43a", { moustache: "#3a2a20" }), 206, "m2"),
  m3: who(MINER("#3e4a3a", "#f0ece0", { skin: "#8a5a3c" }), 207, "m3"),
  m4: who(MINER("#5a4a5a", "#e8c43a", { build: "stout" }), 208, "m4"),
  m5: who(MINER("#4a4a52", "#f0ece0", { moustache: "#8a6a40" }), 209, "m5"),
  m6: who(MINER("#6a6a5a", "#e8c43a", { skin: "#c8946a" }), 210, "m6"),
  m7: who(MINER("#3a4a5a", "#f0ece0", { skin: "#f0d2b0" }), 211, "m7"),
  m8: who(MINER("#5a5a4a", "#e8c43a", { moustache: "#2a2220", skin: "#a8744c" }), 212, "m8"),
  foreman: who(MINER("#2e4a6a", "#c0353a", { moustache: "#6a4a2a" }), 213, "foreman"),
  // the fisherman (Leonce Viator Jr.) and his nephew
  fisher: who({ jacket: "#6a7a5a", pants: "#4a4a52", boots: "#3a2a20", hat: "cap", cap: "#c9b48a", buttons: "#6a7a5a", skin: "#e0b48c", moustache: "#4a3a2a", plaid: "#3a4a2a", shirt: "#c9c2b0" }, 214, "fisher"),
  nephew: who({ jacket: "#a85a3a", pants: "#3a4a6a", boots: "#2a2220", hat: "cap", cap: "#3a5a8a", buttons: "#a85a3a", skin: "#ecc8a4" }, 215, "nephew"),
  // the two companies: Texaco's man and the salt company's man (no logos)
  oil: who(SUIT("#4a4e58", { hair: "#7a7a80", tie: "#b8352a", build: "stout" }), 216, "oil"),
  salt: who(SUIT("#26304a", { hair: "#3a2a20", moustache: "#3a2a20", tie: "#2a6a4a" }), 217, "salt"),
  // locals on the shore
  local1: who({ jacket: "#7a4a5a", pants: "#3a3a44", boots: "#2a2220", hat: "hair", hair: "#6a4a2a", buttons: "#7a4a5a", skin: "#f5d2b4", dress: "#5a3a4a" }, 218, "local1"),
  local2: who({ jacket: "#5a6a7a", pants: "#4a4a3a", boots: "#2a2220", hat: "cap", cap: "#8a2a24", buttons: "#5a6a7a", skin: "#e8c4a0", plaid: "#3a4a5a" }, 219, "local2"),
};

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
const chunkTex = () => ctex("pgChunkT", 96, 96, (g, r) => { g.clearRect(0, 0, 96, 96); const pts: [number, number][] = []; for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283, rr = 20 + r() * 22; pts.push([48 + Math.cos(a) * rr, 48 + Math.sin(a) * rr * 0.55]); }
  g.fillStyle = "#6a5440"; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.strokeStyle = "#120c16"; g.lineWidth = 6; g.stroke(); });
const dropTexW = () => ctex("pgDrop", 64, 96, (g) => { g.clearRect(0, 0, 64, 96); g.fillStyle = "#e8f2f4"; g.strokeStyle = "#120c16"; g.lineWidth = 6; g.beginPath(); g.moveTo(32, 8); g.quadraticCurveTo(58, 56, 32, 86); g.quadraticCurveTo(6, 56, 32, 8); g.fill(); g.stroke(); });
const saltBitTex = () => ctex("pgSaltBit", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = "#f4f2ec"; g.strokeStyle = "#120c16"; g.lineWidth = 5; g.beginPath(); g.moveTo(32, 6); g.lineTo(56, 30); g.lineTo(36, 58); g.lineTo(8, 36); g.closePath(); g.fill(); g.stroke(); });

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

export class PWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#2a2024", 80, 600); private bg = new THREE.Color();
  private lake: LakeSet; private mine: MineSet; private grass: Grass;
  private tools: { g: THREE.Group; handle: THREE.Mesh; heads: Record<string, THREE.Object3D> }[] = [];
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
    this.lake = buildLake(); this.mine = buildMine();
    R.add(this.lake.group, this.mine.group);
    this.grass = new Grass(this.lake.group, this.lake.turf);
    // posed props: the driller's brake handle, a miner's pick, a pen
    const wood = M("pgToolWood", "#8a6238"), iron = M("pgToolIron", "#34303a"), red = M("pgToolRed", "#b8352a");
    for (let i = 0; i < 4; i++) { const g = new THREE.Group(), handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 8), iron); g.add(handle);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), red);
      const pick = new THREE.Group(); { const bb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), iron); pick.add(bb); for (const sx of [-1, 1]) { const tp = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), iron); tp.rotation.z = -sx * Math.PI / 2; tp.position.x = sx * 0.4; pick.add(tp); } }
      const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.14, 6), M("pgPen", "#1a1a1e"));
      const shovel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.03), iron);
      const heads = { knob, pick, pen, shovel }; for (const h of Object.values(heads)) g.add(h); void wood;
      shadowAll(g); g.visible = false; R.add(g); this.tools.push({ g, handle, heads }); }
    this.cards = { paper: new CardPool(R, sheetTex(), 24, 0.24, 0.3, NOINK), chunk: new CardPool(R, chunkTex(), 60, 0.6, 0.6, NOINK), drop: new CardPool(R, dropTexW(), 60, 0.14, 0.2, AFTERINK), salt: new CardPool(R, saltBitTex(), 40, 0.18, 0.18, NOINK), cloth: new CardPool(R, hankyTex(), 4, 0.26, 0.26, NOINK) };
    const puffT = puffTex();
    for (let i = 0; i < 64; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose the world for shot `id` (spec st) at frame f */
  update(_id: number, st: St3, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, light: Light = st.light, L = LP[light], set = light === "mine" ? "mine" : "lake";
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = set === "lake" ? 0.08 : 0.04; cam.far = 5000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...(st.focus ?? c.look)), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    this.lake.group.visible = set === "lake"; this.mine.group.visible = set === "mine";
    // ---- lights ----
    const sunDir = this.v.set(...SUN[light]).normalize().clone();
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI; this.sun.castShadow = L.sunI > 0;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 8, 12, 160);
    this.sun.position.copy(focus).addScaledVector(sunDir, 300); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 1; sc.far = 700; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LK.bounce); TONE.uSat.value = LK.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint); CHAR.uLamp.value.x = LAMPLIT.has(light) ? 1 : 0;
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = this.bg.set(BG[light]);

    // ---------------- the lake ----------------
    if (set === "lake") { const K = this.lake, ox = SET.lake[0], lk = st.lake ?? {}, today = !!st.today;
      for (const [k, m] of Object.entries(K.skies)) m.visible = k === SKY[light];
      const lv = lk.lv ?? 0, hole = lk.hole ?? 0, depth = lk.depth ?? Math.min(40, hole * 0.55), crater = !!lk.crater || hole > 0;
      K.pre.visible = !crater; K.post.visible = crater;
      K.water.U.uTime.value = t; K.water.U.uSun.value.set(...SUN[light]); K.water.U.uHoleR.value = hole; K.water.U.uPull.value = lk.pull ?? (hole > 0 ? 1 : 0);
      K.waterMesh.visible = lk.lv === undefined || lv > BED - 0.05 || lv < BED - 0.5; K.waterMesh.position.y = lv;
      K.funnel.visible = hole > 0.5; if (hole > 0.5) { K.funnel.position.set(ox + HOLE.x, lv + 0.02, HOLE.z); K.funnel.scale.set(hole, depth, hole); K.funnel.rotation.y = t * (lk.spin ?? 0.5); }
      K.stream.visible = !!lk.stream; K.fall.visible = !!lk.fall; K.flowT[0].offset.y = -t * 0.35; K.flowT[1].offset.y = t * 0.9;
      // the rig: tilted about an axis through its hull, sinking; gone once it's down
      const rg = st.rig === undefined ? (today ? null : { tilt: 0, sink: 0 }) : st.rig;
      K.rig.visible = !!rg; if (rg) { K.rig.position.set(ox + HOLE.x + (rg.dx ?? 0), -(rg.sink ?? 0), HOLE.z + (rg.dz ?? 0)); K.rig.rotation.set(rg.tilt ?? 0, rg.yaw ?? 0, rg.roll ?? 0, "YXZ"); K.pipe.rotation.y = rg.spin ? t * 6 : 0; }
      // barges and the tug (lake coordinates [x, z, yaw, y, roll]); null hides one
      K.barges.forEach((b, i) => { const q = st.barges ? st.barges[i] : today ? null : [...BARGES[i], 0, 0];
        b.visible = !!q; if (q) { b.position.set(ox + q[0], q[3] ?? 0, q[1]); b.rotation.set(q[4] ?? 0, q[2], 0, "YXZ"); } });
      const tq = st.tug === undefined ? (today ? null : [...TUG, 0, 0]) : st.tug;
      K.tug.visible = !!tq; if (tq) { K.tug.position.set(ox + tq[0], tq[3] ?? 0, tq[1]); K.tug.rotation.set(tq[4] ?? 0, tq[2], 0, "YXZ"); }
      const sq = st.skiff; K.skiff.visible = !!sq; if (sq) { K.skiff.position.set(ox + sq[0], (sq[3] ?? 0) + 0.12 + 0.06 * Math.sin(t * 2.1), sq[1]); K.skiff.rotation.set(0.02 * Math.sin(t * 1.7), sq[2], 0.03 * Math.sin(t * 1.3)); }
      const sl = st.slump ?? 0; K.slump.visible = !today; K.slump.position.set(-sl * 34, -sl * 30, sl * 2); K.slump.rotation.set(0, 0, sl * 0.5);
      K.chimney.visible = today; K.today.visible = today;
      // foam rings: round the rig's hull, the barges in the water, the chimney (only where something meets water)
      let fr = 0; const ring = (x: number, z: number, s: number) => { const m = K.foam[fr++]; if (!m) return; m.visible = true; m.position.set(ox + x, lv + 0.07, z); m.scale.setScalar(s / 10); m.rotation.z = t * 0.2 + fr; };
      K.foam.forEach((m) => { m.visible = false; });
      if (lv > BED + 0.5) { if (rg && (rg.sink ?? 0) < 6) ring(HOLE.x + (rg.dx ?? 0), HOLE.z + (rg.dz ?? 0), 44); if (today) ring(152, 96, 7);
        (st.barges ?? (today ? [] : BARGES.map((b) => [...b, 0, 0] as number[]))).forEach((q) => { if (q && fr < K.foam.length - 1) ring(q[0], q[1], 30); }); }
      K.mist.points.visible = light === "dawn"; K.drift(t);
      this.grass.update(cam);
    }
    // ---------------- the mine ----------------
    if (set === "mine") { const N = this.mine, ox = SET.mine[0], mn = st.mine ?? {};
      N.water.U.uTime.value = t; N.water.U.uFront.value = mn.front ?? -1e4; N.waterMesh.position.y = mn.level ?? 0.05; N.waterMesh.visible = (mn.front ?? -1e4) > -150;
      N.jet.visible = !!mn.jet; N.hole.visible = !!mn.jet || (mn.bit ?? 0) > 0.55; N.jetT.offset.y = t * 1.6;
      N.bit.visible = mn.bit !== undefined; if (mn.bit !== undefined) N.bit.position.y = 18.5 - mn.bit * 6;
      N.gate.position.x = ox + 0 + (1 - (mn.gate ?? 0)) * -3.4; N.cage.position.y = mn.cageY ?? 0; N.gate.position.y = mn.cageY && (mn.gate ?? 0) > 0.5 ? mn.cageY : 0;
      N.lamps.forEach((l, i) => { l.intensity = 9 * (1 + 0.04 * Math.sin(t * 9 + i)); });
      N.drift(t); }

    // ---------------- props ----------------
    this.tools.forEach((tl, i) => { const q = st.tools?.[i]; tl.g.visible = !!q; if (!q) return;
      const gp = V(...q.g), bp = V(...q.b), d = bp.clone().sub(gp), len = d.length(); d.normalize();
      tl.handle.visible = q.kind !== "pen"; tl.handle.position.copy(gp).addScaledVector(d, len / 2); tl.handle.quaternion.setFromUnitVectors(V(0, 1, 0), d); tl.handle.scale.set(q.kind === "knob" ? 1.6 : 1, len, q.kind === "knob" ? 1.6 : 1);
      for (const [k, h] of Object.entries(tl.heads)) { h.visible = k === q.kind; if (k !== q.kind) continue;
        if (k === "pen") { h.position.copy(gp).addScaledVector(d, len / 2); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); }
        else if (k === "knob") h.position.copy(bp);
        else { h.position.copy(bp); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); } } });
    for (const p of Object.values(this.cards)) p.hide();
    const cn: Record<string, number> = {};
    for (const cd of st.cards ?? []) { const k = cn[cd.kind] ?? 0; cn[cd.kind] = k + 1; this.cards[cd.kind].put(k, cd.p, cam, cd.spin, cd.s, !!cd.flat); }
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    // checklist (Nov 21): a shock mouth never sits on a moustache; moustached faces show alarm with the wavy mouth
    const people = (st.people ?? []).map((q) => { const w = OUT[q.who] ?? OUT.m1; return { q: w.o.moustache && q.expr === "shock" ? { ...q, expr: "nervous" as const } : q, w }; });
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, low: !!q.low, extra: !!q.extra || !!q.side, s: q.s ?? 1 }));
    const key = st.key ?? [focus.x, focus.y + 2.2, focus.z - 1.5] as V3;
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed), ks = q.s ?? 1;
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
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      act.mesh.scale.set((mirror ? -1 : 1) * ks, ks, 1);
      act.mesh.castShadow = false; act.mesh.receiveShadow = false;
      act.caster.visible = true; act.caster.position.set(...q.p); act.caster.scale.copy(act.mesh.scale);
      act.caster.rotation.set(0, L.sunI <= 0 || LAMPLIT.has(light) ? Math.atan2(key[0] - q.p[0], key[2] - q.p[2]) : Math.atan2(sunDir.x, sunDir.z), 0);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = this.actors[i].caster.visible = false;
    // ---- contact shadows ----
    const cc = set === "mine" ? "#8a8478" : "#4a4a38";
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
    void lam; void funnelY; void FISH;
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
        if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh) return false;
        let o: THREE.Object3D | null = m; while (o) { if (!o.visible) return false; o = o.parent; }
        return !(Array.isArray(mat) ? false : mat.transparent || (mat as THREE.Material & { alphaTest?: number }).alphaTest > 0 || mat.colorWrite === false);
      });
      if (hit && hit.distance < dist - r) out.push(`${name}: hidden behind something ${(dist - hit.distance).toFixed(2)} m in front of it`);
    }
    return out;
  }
}
