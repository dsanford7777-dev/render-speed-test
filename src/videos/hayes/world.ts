// The Frank Hayes Short's world: four sets (hsets.ts), only the one in shot is switched on; five racehorses and
// three stable horses (horse.ts), posed per frame; riders are character cards sitting on the saddle.
// Look: character look B (bridge/toon.ts) and the background rules: every light has a source, characters cast real
// shadows (a shadow twin turned to the light). Nobody is shown hurt: Frank's fall is a slide off the saddle onto the
// turf, and after that he is only seen lying still at a distance, with people round him.
import * as THREE from "three";
import { V } from "../bridge/build";
import { Pen, bodyFront, bodySide, fxContact, Outfit, rideUp, RIDE_DX } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { Grass } from "../bridge/grass";
import { M } from "../frozen/fsets";
import { puffTex } from "../frozen/paint";
import { V3, FPS } from "./place";
import { buildTrack, buildStable, buildWeigh, buildGrave, TrackSet, StableSet, WeighSet, GraveSet } from "./hsets";
import { Horse, COATS } from "./horse";
import { needleAt } from "./hpaint";
import type { St3, Person3 } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const LP: Record<Light, LightPreset> = {
  // race day, June 4: a clear afternoon
  day: { ...D, fogNear: 220, fogFar: 1500, lit: [1.42, 1.36, 1.22], shade: [0.42, 0.44, 0.56], lift: [0.06, 0.06, 0.09], charTint: [1.02, 0.98, 0.94], sideTint: [0.9, 0.9, 0.95], hemiI: 0.68, sunI: 2.4, sunCol: "#fff0d6", sky: "#bcd2ea", ground: "#5a6a40", fog: "#c8d6e4" },
  // the morning before: dawn on the track, low and pink
  dawn: { ...D, fogNear: 90, fogFar: 900, lit: [1.36, 1.08, 0.88], shade: [0.34, 0.36, 0.52], lift: [0.06, 0.05, 0.09], charTint: [1.04, 0.92, 0.84], sideTint: [0.9, 0.88, 0.96], hemiI: 0.58, sunI: 2.1, sunCol: "#ffc89a", sky: "#c9c4dc", ground: "#5a5240", fog: "#d8c4c0" },
  // an evening at the rail: warm, long shadows
  eve: { ...D, fogNear: 120, fogFar: 1000, lit: [1.42, 1.06, 0.78], shade: [0.36, 0.32, 0.5], lift: [0.07, 0.05, 0.09], charTint: [1.06, 0.92, 0.8], sideTint: [0.92, 0.86, 0.94], hemiI: 0.55, sunI: 2.2, sunCol: "#ffb070", sky: "#d4a8a0", ground: "#5a4a3a", fog: "#d8a890" },
  // inside the barn: lanterns and the open door
  barn: { ...D, fogNear: 30, fogFar: 140, lit: [1.08, 0.98, 0.82], shade: [0.34, 0.32, 0.36], lift: [0.07, 0.06, 0.07], charTint: [1.04, 0.96, 0.86], sideTint: [0.92, 0.9, 0.92], hemiI: 0.5, sunI: 1.3, sunCol: "#ffe8c4", sky: "#d8ccb0", ground: "#6a5a44", fog: "#4a3a2c" },
  // the weighing room: a window and a hanging lamp
  room: { ...D, fogNear: 30, fogFar: 120, lit: [1.06, 1.0, 0.88], shade: [0.36, 0.36, 0.4], lift: [0.07, 0.07, 0.08], charTint: [1.02, 0.98, 0.92], sideTint: [0.92, 0.92, 0.94], hemiI: 0.55, sunI: 1.1, sunCol: "#fff2dc", sky: "#e0d6c0", ground: "#6a5a48", fog: "#3a322a" },
  // the funeral: a soft grey day
  grey: { ...D, fogNear: 90, fogFar: 700, lit: [1.18, 1.18, 1.2], shade: [0.5, 0.52, 0.6], lift: [0.07, 0.07, 0.09], charTint: [0.98, 0.98, 1.0], sideTint: [0.92, 0.92, 0.96], hemiI: 0.82, sunI: 1.0, sunCol: "#eef0f2", sky: "#c4c8d0", ground: "#5a6050", fog: "#c0c4ca" },
};
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { day: "#cfdbe6", dawn: "#e0d0d4", eve: "#e0b8a0", barn: "#3a2e24", room: "#3a322a", grey: "#c8ccd2" };
const SKY: Record<Light, "day" | "morn" | "dusk"> = { day: "day", dawn: "morn", eve: "dusk", barn: "day", room: "day", grey: "day" };
const SUN: Record<Light, V3> = { day: [-0.35, 0.72, -0.6], dawn: [0.8, 0.28, -0.5], eve: [-0.85, 0.3, -0.45], barn: [0.1, 0.5, 1], room: [0.5, 0.6, 1], grey: [-0.2, 0.9, -0.3] };
const LAMPLIT = new Set<Light>(["barn", "room"]);
const SETS: Record<Light, "track" | "stable" | "weigh" | "grave"> = { day: "track", dawn: "track", eve: "track", barn: "stable", room: "weigh", grey: "grave" };

// ---------------- cast ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** racing silks: jacket and cap in the owner's colours, white breeches, black boots */
const SILKS = (jacket: string, sash: string, cap: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, sash, pants: "#f2eee4", boots: "#1a1618", hat: "cap", cap, buttons: jacket, skin: "#f0d0b0", ...extra });
const SUIT = (col: string, hat: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket: col, pants: col, boots: "#1a1618", hat, cap: extra.cap ?? "#3a3430", buttons: col, skin: "#f0d2b0", shirt: "#f4f0e6", tie: "#5a2a2a", ...extra });
export const OUT: Record<string, Who> = {
  // Frank: at work in the stable (cap, shirt and braces); in Sweet Kiss's silks, blue and yellow (TwinSpires); out jogging in a heavy sweater
  frank: who({ jacket: "#7a8a9a", pants: "#4a4038", boots: "#3a2a20", hat: "cap", cap: "#5a4a3a", buttons: "#7a8a9a", skin: "#f0d0b0", braces: "#5a3a2a", plaid: "#5a6a7a" }, 301, "frank"),
  frankRace: who(SILKS("#2a4aa8", "#f2c230", "#f2c230"), 301, "frankRace"),
  frankJog: who({ jacket: "#8a8478", pants: "#4a4038", boots: "#3a2a20", hat: "cap", cap: "#5a4a3a", buttons: "#8a8478", skin: "#f0d0b0" }, 301, "frankJog"),
  // the other riders (no names: none are known), their silks
  j1: who(SILKS("#b8352a", "#f4f0e6", "#b8352a"), 302, "j1"),
  j2: who(SILKS("#2a7a4a", "#f2c230", "#2a7a4a", { skin: "#e0b48c" }), 303, "j2"),
  j3: who(SILKS("#6a3a7a", "#f4f0e6", "#f4f0e6"), 304, "j3"),
  j4: who(SILKS("#e07a2a", "#2a2a3a", "#2a2a3a", { skin: "#c8946a" }), 305, "j4"),
  // the owner, Miss Frayling (no likeness is known: a woman of 1923 in a cloche and a long coat)
  boss: who({ jacket: "#5a4a6a", pants: "#3a3040", boots: "#2a2020", hat: "bonnet", cap: "#3a2a3a", buttons: "#c9a46a", skin: "#f4d8c0", dress: "#5a4a6a", hair: "#4a3020" }, 306, "boss"),
  clerk: who(SUIT("#4a4e58", "hair", { hair: "#7a7a80", moustache: "#7a7a80", tie: "#2a4a6a" }), 307, "clerk"),
  hand: who({ jacket: "#9a6a3a", pants: "#3a3a44", boots: "#2a2220", hat: "cap", cap: "#3a4a5a", buttons: "#9a6a3a", skin: "#a8744c", braces: "#2a2a2a" }, 308, "hand"),
  doctor: who(SUIT("#2a2e3a", "fedora", { cap: "#2a2a30", moustache: "#5a4a3a", tie: "#7a2a2a", build: "stout" }), 309, "doctor"),
  att1: who({ jacket: "#e8e4d8", pants: "#3a3a44", boots: "#2a2220", hat: "cap", cap: "#2a3a5a", buttons: "#2a3a5a", skin: "#f0d0b0" }, 310, "att1"),
  att2: who({ jacket: "#e8e4d8", pants: "#3a3a44", boots: "#2a2220", hat: "cap", cap: "#2a3a5a", buttons: "#2a3a5a", skin: "#c8946a", moustache: "#2a2220" }, 311, "att2"),
  judge1: who(SUIT("#2a2a30", "tophat", { cap: "#1a1a1e", moustache: "#8a8a8a" }), 312, "judge1"),
  judge2: who(SUIT("#3a3430", "fedora", { cap: "#4a4038" }), 313, "judge2"),
  starter: who(SUIT("#4a3a2a", "fedora", { cap: "#3a3028", plaid: "#5a4a3a" }), 314, "starter"),
  // racegoers at the rail and mourners at the grave
  fan1: who(SUIT("#6a5a48", "fedora", { cap: "#e6d29a", tie: "#a8352a" }), 315, "fan1"),
  fan2: who({ jacket: "#a8485a", pants: "#3a3040", boots: "#2a2020", hat: "bonnet", cap: "#e6d29a", buttons: "#f4f0e6", skin: "#f4dcc4", dress: "#a8485a" }, 316, "fan2"),
  fan3: who(SUIT("#3a4a5a", "fedora", { cap: "#3a3430", moustache: "#3a2a20", skin: "#e0b48c" }), 317, "fan3"),
  fan4: who({ jacket: "#4a6a8a", pants: "#3a3040", boots: "#2a2020", hat: "bonnet", cap: "#4a6a8a", buttons: "#f4f0e6", skin: "#f0d0b0", dress: "#4a6a8a" }, 318, "fan4"),
  fan5: who(SUIT("#d8ccb4", "fedora", { cap: "#e6d29a", tie: "#2a4a6a", skin: "#c8946a" }), 319, "fan5"),
  mourn1: who(SUIT("#1e1e24", "fedora", { cap: "#1a1a1e", tie: "#1a1a1e" }), 320, "mourn1"),
  mourn2: who({ jacket: "#1e1e24", pants: "#1e1e24", boots: "#1a1618", hat: "bonnet", cap: "#1a1a1e", buttons: "#1e1e24", skin: "#f0d2b8", dress: "#1e1e24" }, 321, "mourn2"),
  mourn3: who(SUIT("#2a2a30", "hair", { hair: "#5a4a3a", tie: "#1a1a1e" }), 322, "mourn3"),
  mother: who({ jacket: "#2a2a30", pants: "#2a2a30", boots: "#1a1618", hat: "bonnet", cap: "#1a1a1e", buttons: "#2a2a30", skin: "#f0d2b8", dress: "#2a2a30", build: "stout" }, 323, "mother"),
};
/** the five in the race: Sweet Kiss (a bay, number 2 is invented dressing: no saddle-cloth number is known) and four others */
export const HORSES = [
  { coat: COATS.bay, num: 3, key: "kiss" }, { coat: COATS.chestnut, num: 1, key: "gimme" }, { coat: COATS.grey, num: 2, key: "h3" },
  { coat: COATS.darkbay, num: 4, key: "h4" }, { coat: COATS.black, num: 5, key: "h5" },
  { coat: COATS.chestnut, num: 6, key: "s1" }, { coat: COATS.grey, num: 7, key: "s2" }, { coat: COATS.darkbay, num: 8, key: "s3" },
];

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

export class HWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#2a2024", 80, 600); private bg = new THREE.Color();
  private track: TrackSet; private stable: StableSet; private weigh: WeighSet; private grave: GraveSet;
  private grassT: Grass; private grassG: Grass;
  private horses: Horse[] = [];
  private props: Record<string, THREE.Object3D> = {};
  private puffs: THREE.Sprite[] = [];
  private lastPeople: { name: string; p: V3; low: boolean; s: number; lying?: boolean }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3(); private v2 = new THREE.Vector3();

  constructor() {
    const R = this.root;
    this.hemi = new THREE.HemisphereLight("#ffe9d0", "#5c4a44", 0.6);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.4);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.track = buildTrack(); this.stable = buildStable(); this.weigh = buildWeigh(); this.grave = buildGrave();
    R.add(this.track.group, this.stable.group, this.weigh.group, this.grave.group);
    this.grassT = new Grass(this.track.group, this.track.turf); this.grassG = new Grass(this.grave.group, this.grave.turf);
    for (const h of HORSES) { const hr = new Horse(h.coat, h.num, h.key); hr.g.visible = false; R.add(hr.g); this.horses.push(hr); }
    // props that can turn up in any set: the pitchfork and barrow, the cup and the plate, the starter's flag, the doctor's bag
    Object.assign(this.props, { fork: this.stable.tools.fork, barrow: this.stable.tools.barrow, cup: this.weigh.cup, plate: this.weigh.plate, flag: this.track.flag });
    { const g = new THREE.Group(), bag = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.16), M("hsBag", "#2a1c16")); bag.position.y = 0.13; g.add(bag);
      const hd = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 5, 12, Math.PI), M("hsBagH", "#1a1210")); hd.position.y = 0.24; g.add(hd); g.traverse((m) => { m.castShadow = true; }); this.props.bag = g; }
    { const g = new THREE.Group(), cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M("hsSilkCap", "#f2c230")); g.add(cap); const pk = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.12), M("hsSilkCap", "#f2c230")); pk.position.set(0.1, 0.0, 0); g.add(pk); this.props.cap = g; }
    for (const o of Object.values(this.props)) { o.visible = false; R.add(o); }
    const puffT = puffTex();
    for (let i = 0; i < 80; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose the world for spec st at frame f */
  update(_id: number, st: St3, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, light: Light = st.light, L = LP[light], set = SETS[light];
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = set === "track" || set === "grave" ? 0.08 : 0.04; cam.far = 5000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...(st.focus ?? c.look)), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    this.track.group.visible = set === "track"; this.stable.group.visible = set === "stable"; this.weigh.group.visible = set === "weigh"; this.grave.group.visible = set === "grave";
    // ---- lights ----
    const sunDir = this.v.set(...SUN[light]).normalize().clone();
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI; this.sun.castShadow = L.sunI > 0;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 8, 12, 140);
    this.sun.position.copy(focus).addScaledVector(sunDir, 300); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 1; sc.far = 700; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LK.bounce); TONE.uSat.value = LK.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint); CHAR.uLamp.value.x = LAMPLIT.has(light) ? 1 : 0;
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = this.bg.set(BG[light]);
    if (set === "track") { for (const [k, m] of Object.entries(this.track.skies)) m.visible = k === SKY[light]; this.track.board.visible = !!st.board; this.grassT.update(cam); }
    if (set === "stable") { this.stable.lamps.forEach((l, i) => { l.intensity = 7 * (1 + 0.05 * Math.sin(t * 8 + i * 2)); }); this.stable.motes.drift(t); }
    if (set === "weigh") this.weigh.needle.rotation.z = needleAt(st.needle ?? 0);
    if (set === "grave") this.grassG.update(cam);

    // ---- props ----
    for (const [k, o] of Object.entries(this.props)) { const q = st.props?.[k]; o.visible = !!q; if (q) { o.position.set(...q.p); o.rotation.set(q.r?.[0] ?? 0, q.r?.[1] ?? 0, q.r?.[2] ?? 0, "YXZ"); } }
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; } });

    // ---- horses ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const riders: Person3[] = [];
    this.horses.forEach((h, i) => { const q = st.horses?.find((x) => x.k === i); h.g.visible = !!q; if (!q) return;
      h.g.position.set(...q.p); h.g.rotation.set(0, q.yaw, 0); h.rider(!!q.rider && !q.rider.off && (q.rider.slide ?? 0) < 0.3, !!q.rider || !!q.tack);
      h.pose({ gait: q.gait, phase: q.phase, jump: q.jump, head: q.head });
      if (!q.rider) return;
      const fwd = V(Math.cos(q.yaw), 0, -Math.sin(q.yaw)), lz = V(Math.sin(q.yaw), 0, Math.cos(q.yaw)), toCam = cam.position.clone().sub(h.g.position).setY(0).normalize();
      const side = Math.sign(lz.dot(toCam)) || 1, screenR = fwd.dot(right) >= 0;
      const seat = h.saddle.getWorldPosition(this.v2).clone(), ow = OUT[q.rider.who] ?? OUT.j1, up = rideUp(ow.o) * SUc;
      const u = q.rider.slide ?? 0, e = u * u, lie = q.rider.off;
      const base = seat.clone().addScaledVector(lz, side * (0.33 + 0.55 * u)).addScaledVector(fwd, RIDE_DX * SUc); base.y -= up;
      const ground = q.p[1];
      if (lie) riders.push({ who: q.rider.who, p: lie, expr: q.rider.expr, ride: { pose: 1, mirror: !screenR, tilt: screenR ? -Math.PI / 2 : Math.PI / 2, lying: true } });
      else riders.push({ who: q.rider.who, p: [base.x, base.y + (ground + 0.2 - base.y) * e, base.z], expr: q.rider.expr, ride: { pose: q.rider.pose ?? 0, mirror: !screenR, tilt: (q.rider.tilt ?? 0) + (screenR ? -1 : 1) * (Math.PI / 2) * e } });
    });

    // ---- cast ----
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = [...(st.people ?? []), ...riders].map((q0) => { const w = OUT[q0.who] ?? OUT.fan1; return { q: w.o.moustache && q0.expr === "shock" ? { ...q0, expr: "nervous" as const } : q0, w }; });
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, low: !!q.low || !!q.ride, s: q.s ?? 1, lying: !!q.ride?.lying }));
    const key = st.key ?? [focus.x, focus.y + 2.2, focus.z - 1.5] as V3;
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = q.ride?.lying || (q.ride && (q.ride.pose ?? 0) >= 0.4) || q.shut ? 1 : blink(w.seed), ks = q.s ?? 1;
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz2 = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz2) || 1, n3 = V(nx / nl2, 0, nz2 / nl2), crs = V(n3.z, 0, -n3.x);
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs) / ks, (pc.y - o3.y) / ks]; };
      let mirror = false, rz = 0;
      const lt0 = lightA;
      if (q.ride) {
        mirror = q.ride.mirror; rz = q.ride.tilt ?? 0; const lt = mirror ? Math.PI - lt0 : lt0, pose = Math.round((q.ride.pose ?? 0) * 8) / 8;
        const kkey = `R|${w.key}|${q.expr}|${pose}|${bl}|${lt.toFixed(2)}`;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodySide(p, w.o, { mode: "ride", pose, expr: q.expr, blink: bl, light: lt, seed: w.seed }));
      } else if (q.side) {
        mirror = !!q.side && (q.side.mirror !== (right.x < 0)); const lt = mirror ? Math.PI - lt0 : lt0;
        const ph = Math.round(q.side.phase * 16) / 16, cw3 = q.side.carry, cy = cw3 ? onCard(V(...cw3)) : null, carry = cy ? [300 + (mirror ? -cy[0] : cy[0]) / SUc, 975 - cy[1] / SUc] as [number, number] : undefined;
        const kkey = `S|${w.key}|${q.expr}|${ph}|${bl}|${lt.toFixed(2)}|${carry ? carry.map((x) => Math.round(x / 12)).join(",") : ""}|${q.side.stride ?? 0.8}|${q.side.mode ?? "march"}`;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodySide(p, w.o, { mode: q.side!.mode ?? "march", phase: ph, expr: q.expr, blink: bl, stride: q.side!.stride ?? 0.8, stomp: 0.4, light: lt, seed: w.seed, carry }));
        rz = q.tilt ?? 0;
      } else {
        let hr: [number, number] | undefined, hl: [number, number] | undefined;
        const give = (hc: [number, number]) => { if ((hc[0] >= 0 && !hr) || hl) hr = hc; else hl = hc; };
        for (const hwp of q.hw ?? []) give(onCard(V(...hwp)));
        const hk = hr || hl ? [hr, hl].flat().map((x) => (x ?? 9).toFixed(2)).join(",") : "";
        const kkey = `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${hk}|${q.march === undefined ? "" : Math.round(q.march * 12)}|${lt0.toFixed(2)}|${q.mode ?? ""}`;
        const hands = hr || hl ? { r: hr ? [300 + hr[0] / SUc, 975 - hr[1] / SUc] as [number, number] : undefined, l: hl ? [300 + hl[0] / SUc, 975 - hl[1] / SUc] as [number, number] : undefined } : undefined;
        act.r = this.pool.req(kkey, cw, ch, kk, (p: Pen) => bodyFront(p, w.o, { mode: q.mode ?? (q.march === undefined ? "stand" : "march"), phase: q.march === undefined ? undefined : Math.round(q.march * 12) / 12, expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: q.wave, hands, light: lt0, seed: w.seed }));
        rz = q.tilt ?? 0;
      }
      act.mesh.visible = true;
      act.mesh.position.set(...q.p);
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), rz, "YXZ");
      act.mesh.scale.set((mirror ? -1 : 1) * ks, ks, 1);
      act.mesh.castShadow = false; act.mesh.receiveShadow = false;
      act.caster.visible = !q.ride?.lying; act.caster.position.set(...q.p); act.caster.scale.copy(act.mesh.scale);
      act.caster.rotation.set(0, L.sunI <= 0 || LAMPLIT.has(light) ? Math.atan2(key[0] - q.p[0], key[2] - q.p[2]) : Math.atan2(sunDir.x, sunDir.z), 0);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = this.actors[i].caster.visible = false;
    // ---- contact shadows (not under riders: the horse shades them) ----
    const cc = set === "track" || set === "grave" ? "#3a4a2a" : "#5a4a3a";
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
      if (q.lying) continue;
      const k = q.s, head = box(q.p, -0.27 * k, 0.27 * k, 1.16 * k, 1.84 * k), body = box(q.p, -0.3 * k, 0.3 * k, (q.low ? 1.0 : 0.05) * k, 1.16 * k);
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      else if (head.frac > 0.02 && head.frac < 0.97) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12 && !q.low) out.push(`${q.name}: body in shot without the head`);
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
