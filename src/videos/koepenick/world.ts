// The Captain of Koepenick Short's world: three sets (ksets.ts), only the one in shot is switched on.
// Look: character look B (bridge/toon.ts) and the background rules (claude/background-and-character-look.md): the sets
// carry no ink line, every light has a source, characters cast real shadows (a shadow twin turned to the light).
// Posed per frame: the town hall gate's leaves; the room's dressing, the cash box and its lid, the receipt, two mail
// sacks, the stacks of notes; things in hands (steins, a pen, a boot and a hammer, a sack, a newspaper); flying cards
// (coins, notes, a passport); towels on the four swimmers' shoulders.
import * as THREE from "three";
import { V, lam, Kit } from "../bridge/build";
import { Pen, bodyFront, bodySide, fxContact, Outfit } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { M } from "../frozen/fsets";
import { puffTex, sheetTex } from "../frozen/paint";
import { V3, FPS, SET, STREET_SUN, SQUARE_SUN } from "./place";
import { buildStreet, buildSquare, buildRoom, StreetSet, SquareSet, RoomSet, Dressing } from "./ksets";
import { coinTex, noteTex, towelTex, sausageTex, passportTex, newsTex } from "./kpaint";
import type { St3, CardKind, NewsKey } from "./story";
type Light = St3["light"];

const D = LIGHTS.day;
const LP: Record<Light, LightPreset> = {
  // Berlin at noon, mid-October: high pale sun, cool shade
  noon: { ...D, fogNear: 60, fogFar: 520, lit: [1.36, 1.3, 1.16], shade: [0.46, 0.48, 0.6], lift: [0.06, 0.06, 0.08], charTint: [1.02, 0.98, 0.94], sideTint: [0.9, 0.9, 0.95], hemiI: 0.66, sunI: 2.3, sunCol: "#fff0d8", sky: "#b9d0e6", ground: "#7a6e5e", fog: "#c9d4dc" },
  // Koepenick at a quarter to three: lower, warmer sun across the square
  aft: { ...D, fogNear: 60, fogFar: 520, lit: [1.38, 1.22, 1.0], shade: [0.42, 0.42, 0.56], lift: [0.06, 0.05, 0.08], charTint: [1.04, 0.96, 0.88], sideTint: [0.92, 0.88, 0.92], hemiI: 0.6, sunI: 2.4, sunCol: "#ffdcae", sky: "#b0c6dc", ground: "#7a6a58", fog: "#cfd2d4" },
  // the junk shop: one window, a hanging lamp
  junk: { ...D, fogNear: 30, fogFar: 200, lit: [0.72, 0.64, 0.52], shade: [0.2, 0.18, 0.18], lift: [0.06, 0.05, 0.05], charTint: [1.02, 0.94, 0.84], sideTint: [0.92, 0.86, 0.8], hemiI: 0.55, sunI: 0, sunCol: "#ffe0b0", sky: "#8a7a64", ground: "#3a2e24", fog: "#1a1410" },
  // the beer hall: warm lamplight, dark wood
  pub: { ...D, fogNear: 30, fogFar: 200, lit: [0.66, 0.52, 0.38], shade: [0.16, 0.12, 0.11], lift: [0.04, 0.03, 0.03], charTint: [1.06, 0.92, 0.78], sideTint: [0.94, 0.84, 0.74], hemiI: 0.3, sunI: 0, sunCol: "#ffd0a0", sky: "#6a5040", ground: "#2a1e16", fog: "#0e0a08" },
  // the mayor's office in the afternoon: window light and a lamp
  office: { ...D, fogNear: 30, fogFar: 200, lit: [0.86, 0.82, 0.74], shade: [0.26, 0.26, 0.3], lift: [0.05, 0.05, 0.06], charTint: [1.02, 0.97, 0.92], sideTint: [0.92, 0.9, 0.92], hemiI: 0.46, sunI: 0, sunCol: "#ffffff", sky: "#d6dbe0", ground: "#5a4a3a", fog: "#9aa0a8" },
  // the Kaiser's study: red and gold
  palace: { ...D, fogNear: 30, fogFar: 200, lit: [0.84, 0.72, 0.64], shade: [0.24, 0.18, 0.2], lift: [0.05, 0.04, 0.05], charTint: [1.04, 0.95, 0.88], sideTint: [0.94, 0.86, 0.86], hemiI: 0.42, sunI: 0, sunCol: "#ffe8c8", sky: "#c8a8a0", ground: "#4a2a26", fog: "#5a3a3a" },
  // the Luxembourg office, 1910: bright, plain
  lux: { ...D, fogNear: 30, fogFar: 200, lit: [0.92, 0.9, 0.86], shade: [0.3, 0.31, 0.34], lift: [0.05, 0.05, 0.06], charTint: [1.0, 0.98, 0.95], sideTint: [0.92, 0.92, 0.94], hemiI: 0.5, sunI: 0, sunCol: "#ffffff", sky: "#e0e4e8", ground: "#6a6a64", fog: "#b9c0c8" },
};
const LK: WorldLook = LOOK.day;
const BG: Record<Light, string> = { noon: "#c9d4dc", aft: "#cfd2d4", junk: "#1a1410", pub: "#0e0a08", office: "#9aa0a8", palace: "#5a3a3a", lux: "#b9c0c8" };
const SUN: Record<Light, V3> = { noon: STREET_SUN, aft: SQUARE_SUN, junk: [0, 1, 0], pub: [0, 1, 0], office: [0, 1, 0], palace: [0, 1, 0], lux: [0, 1, 0] };
const SETOF: Record<Light, "street" | "square" | "room"> = { noon: "street", aft: "square", junk: "room", pub: "room", office: "room", palace: "room", lux: "room" };
/** lamp-lit sets: characters take light from the point lights, their shadows fall from the key lamp */
const LAMPLIT = new Set<Light>(["junk", "pub", "office", "palace", "lux"]);

// ---------------- cast ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** a Guards infantryman: dark blue tunic, red collar, white belts, spiked helmet, rifle */
const GUARD = (skin: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket: "#2b3a63", pants: "#1d1b22", boots: "#141216", hat: "spike", belt: "#f1efe6", buttons: "#e8c45a", rifle: true, skin, ...extra });
const CITY = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#3a3640", boots: "#1e1a20", hat: "fedora", cap: "#4a4438", buttons: jacket, skin: "#f0d2b0", shirt: "#f6f2e8", tie: "#3a2a20", ...extra });
const OUT: Record<string, Who> = {
  // Voigt: as the captain (peaked cap with the red band, greatcoat, sword, white moustache), as himself, in his new suit
  cap: who({ jacket: "#26304a", pants: "#1d1b22", boots: "#141216", hat: "visor", cap: "#26304a", band: "#c0353a", buttons: "#e8c45a", sword: true, sash: "#c9ccd2", moustache: "#eeece6", skin: "#ecc8a4", belt: null, shirt: "#f6f2e8" }, 201, "cap"),
  voigt: who({ jacket: "#5a4a3a", pants: "#3a3430", boots: "#2a221c", hat: "cap", cap: "#4a4440", buttons: "#5a4a3a", moustache: "#eeece6", skin: "#ecc8a4", braces: "#3a2a20", shirt: "#c9c2b0" }, 201, "voigt"),
  suit: who({ jacket: "#3a3440", pants: "#3a3440", boots: "#141216", hat: "fedora", cap: "#2e2a34", buttons: "#3a3440", moustache: "#eeece6", skin: "#ecc8a4", shirt: "#f6f2e8", tie: "#7a1e1e" }, 201, "suit"),
  // ten guardsmen (g1-g4 are the swimmers, g5-g10 from the shooting range)
  g1: who(GUARD("#f0d2b0", { moustache: "#6a4a2a" }), 211, "g1"), g2: who(GUARD("#e8c4a0"), 212, "g2"), g3: who(GUARD("#f5d2b4", { moustache: "#3a2a20" }), 213, "g3"), g4: who(GUARD("#d8a888"), 214, "g4"),
  g5: who(GUARD("#f0d2b0"), 215, "g5"), g6: who(GUARD("#e0b48c", { moustache: "#8a5a30" }), 216, "g6"), g7: who(GUARD("#f5c9a0"), 217, "g7"), g8: who(GUARD("#ecc8a4", { moustache: "#5a3a22" }), 218, "g8"), g9: who(GUARD("#d8a888"), 219, "g9"), g10: who(GUARD("#f0d2b0"), 220, "g10"),
  // the same men off duty in the beer hall (no rifles)
  b1: who(GUARD("#f0d2b0", { moustache: "#6a4a2a", rifle: false }), 211, "b1"), b2: who(GUARD("#e8c4a0", { rifle: false }), 212, "b2"), b3: who(GUARD("#f5d2b4", { moustache: "#3a2a20", rifle: false }), 213, "b3"), b4: who(GUARD("#d8a888", { rifle: false }), 214, "b4"),
  // Koepenick: the mayor (frock coat, grey hair and moustache), his wife, the treasurer (spectacles of a man, thin hair)
  mayor: who({ jacket: "#2a2a32", pants: "#2a2a32", boots: "#141216", hat: "hair", hair: "#a8a8b0", moustache: "#a8a8b0", buttons: "#2a2a32", skin: "#f0d2b0", shirt: "#f6f2e8", tie: "#1e1a20", build: "stout" }, 221, "mayor"),
  wife: who({ jacket: "#4a3a5a", pants: "#3a3a44", boots: "#1e1a20", hat: "bonnet", cap: "#e9e2d2", dress: "#3a2e4a", buttons: "#4a3a5a", skin: "#f5d2b4", hair: "#8a7a6a" }, 222, "wife"),
  treas: who({ jacket: "#4a4a42", pants: "#3a3a36", boots: "#1e1a20", hat: "hair", hair: "#6a5a4a", moustache: "#6a5a4a", buttons: "#4a4a42", skin: "#f0d2b0", shirt: "#f6f2e8", tie: "#2a3a5a" }, 223, "treas"),
  // the junk dealer (cardigan, cap), Berlin policemen, the Kaiser, the Luxembourg clerk
  dealer: who({ jacket: "#6a5a3a", pants: "#3a3a36", boots: "#2a221c", hat: "cap", cap: "#3a3430", buttons: "#6a5a3a", skin: "#e8c4a0", moustache: "#3a2a20", plaid: "#4a3e2a", shirt: "#d9d2c2" }, 224, "dealer"),
  cop1: who({ jacket: "#1e3a5a", pants: "#1d1b22", boots: "#141216", hat: "spike", belt: "#1d1b22", buttons: "#e8e8e8", skin: "#f0d2b0", moustache: "#3a2a20", build: "stout" }, 225, "cop1"),
  cop2: who({ jacket: "#1e3a5a", pants: "#1d1b22", boots: "#141216", hat: "spike", belt: "#1d1b22", buttons: "#e8e8e8", skin: "#e8c4a0" }, 226, "cop2"),
  kaiser: who({ jacket: "#2b3a63", pants: "#1d1b22", boots: "#1e1a20", hat: "spike", buttons: "#e8c45a", sash: "#e8c45a", moustache: "#3a2a20", skin: "#f5c9a0", build: "stout" }, 227, "kaiser"),
  clerk: who(CITY("#4a5a6a", { hat: "hair", hair: "#3a2a20", moustache: "#3a2a20" }), 228, "clerk"),
  // passers-by and readers who laugh at the papers
  p1: who(CITY("#6a5a4a"), 231, "p1"), p2: who(CITY("#3a4a5a", { hat: "tophat", moustache: "#5a3a22" }), 232, "p2"),
  p3: who({ jacket: "#7a4a5a", pants: "#3a3a44", boots: "#1e1a20", hat: "bonnet", cap: "#f0e9d9", dress: "#5a3a4a", buttons: "#7a4a5a", skin: "#f5d2b4", hair: "#6a4a2a" }, 233, "p3"),
  p4: who(CITY("#5a6a4a", { hat: "cap", cap: "#3a3430", tie: undefined, braces: "#3a2a20" }), 234, "p4"),
  p5: who({ jacket: "#4a6a6a", pants: "#3a3a44", boots: "#1e1a20", hat: "bonnet", cap: "#d9cfb4", dress: "#3a5a5a", buttons: "#4a6a6a", skin: "#e8c4a0", hair: "#3a2a20" }, 235, "p5"),
  boy: who({ jacket: "#6a5a3a", pants: "#3a3a40", boots: "#2a221c", hat: "cap", cap: "#7a2a24", buttons: "#6a5a3a", skin: "#f0d2b0", build: "kid", braces: "#3a2a20", shirt: "#d9d2c2" }, 236, "boy"),
};

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
const NEWS: Record<NewsKey, [string, string]> = { fake: ["FALSCHER|HAUPTMANN!", "BERLINER ZEITUNG"], ha: ["THE FAKE|CAPTAIN!", "LONDON DAILY"], cap: ["LE FAUX|CAPITAINE", "LE PETIT JOURNAL"] };

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

export class KWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#2a2024", 80, 600); private bg = new THREE.Color();
  private street: StreetSet; private square: SquareSet; private room: RoomSet;
  private tools: { g: THREE.Group; handle: THREE.Mesh; heads: Record<string, THREE.Object3D> }[] = [];
  private cards: Record<CardKind, CardPool>;
  private puffs: THREE.Sprite[] = [];
  private news: THREE.Mesh[] = []; private newsT: Record<NewsKey, THREE.Texture>;
  private lastPeople: { name: string; p: V3; low: boolean; extra: boolean; s: number }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    void kit; const R = this.root;
    this.hemi = new THREE.HemisphereLight("#ffe9d0", "#5c4a44", 0.6);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.4);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.street = buildStreet(); this.square = buildSquare(); this.room = buildRoom();
    R.add(this.street.group, this.square.group, this.room.group);
    for (const s of this.room.sacks) R.add(s); // the sacks travel: in the treasury, in his hands on the square and in the street
    // ---- posed props (these keep their ink line: they are what the characters hold) ----
    const wood = M("kpToolWood", "#8a6238"), iron = M("kpToolIron", "#34303a");
    for (let i = 0; i < 6; i++) { const g = new THREE.Group(), handle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 8), wood); g.add(handle);
      const stein = new THREE.Group(); { const body = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.22, 14), M("kpSteinT", "#c9c2b0")); stein.add(body); const foam = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 6, 0, 6.3, 0, Math.PI / 2), M("kpFoamT", "#fbf6e8")); foam.position.y = 0.11; foam.scale.y = 0.6; stein.add(foam);
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.03, 14), M("kpPewter", "#9a9ea6")); lid.position.set(0, 0.12, 0); lid.visible = false; stein.add(lid); const hdl = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.014, 6, 12, Math.PI), M("kpSteinT", "#c9c2b0")); hdl.rotation.z = -Math.PI / 2; hdl.position.set(0.09, 0, 0); stein.add(hdl); }
      const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.004, 0.17, 6), M("kpPenT", "#1a1a1e"));
      const hammer = new THREE.Group(); { const hd = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.05), iron); hammer.add(hd); }
      const boot = new THREE.Group(); { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.12), M("kpBootT", "#8a5a34")); leg.position.y = 0.13; boot.add(leg); const foot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.12), M("kpBootT", "#8a5a34")); foot.position.set(0.06, 0.0, 0); boot.add(foot); }
      const bread = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.14, 4, 8), M("kpBread", "#c98a4a")); bread.rotation.z = Math.PI / 2;
      const heads = { stein, quill, hammer, boot, bread }; for (const h of Object.values(heads)) g.add(h);
      shadowAll(g); g.visible = false; R.add(g); this.tools.push({ g, handle, heads }); }
    this.cards = { paper: new CardPool(R, sheetTex(), 12, 0.24, 0.3, NOINK), coin: new CardPool(R, coinTex(), 30, 0.09, 0.09, AFTERINK), note: new CardPool(R, noteTex(), 20, 0.2, 0.12, NOINK), towel: new CardPool(R, towelTex(), 4, 0.2, 0.32, NOINK),
      sausage: new CardPool(R, sausageTex(), 6, 0.2, 0.08, NOINK), passport: new CardPool(R, passportTex(), 2, 0.13, 0.18, NOINK) };
    const puffT = puffTex();
    for (let i = 0; i < 24; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
    this.newsT = { fake: newsTex(...NEWS.fake), ha: newsTex(...NEWS.ha), cap: newsTex(...NEWS.cap) };
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.667), new THREE.MeshBasicMaterial({ map: this.newsT.fake, side: THREE.DoubleSide, color: new THREE.Color(0.92, 0.9, 0.86) })); m.visible = false; m.castShadow = true; R.add(m); this.news.push(m); }
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
    this.street.group.visible = set === "street"; this.square.group.visible = set === "square"; this.room.group.visible = set === "room";
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
    if (set === "street") this.street.drift(t);
    if (set === "square") { const a = st.gate ?? 0; this.square.leaves[0].rotation.y = a; this.square.leaves[1].rotation.y = -a; this.square.drift(t); }
    if (set === "room") { const R2 = this.room, dr = light as Dressing;
      for (const [k, g] of Object.entries(R2.dress)) g.visible = k === dr;
      R2.lamps[dr].forEach((l, i) => { l.intensity = (l.userData.base ??= l.intensity) * (1 + 0.05 * Math.sin(t * 9 + i * 2)); });
      R2.cashbox.visible = !!st.cashbox; R2.lid.rotation.x = -(st.cashbox?.open ?? 0) * 1.9; R2.receipt.visible = !!st.receipt; R2.bills.visible = !!st.bills;
      R2.drift(t); }
    // mail sacks: in a hand (world point) or on the desk
    this.room.sacks.forEach((s, i) => { const q = st.sacks?.[i]; s.visible = !!q; if (!q) return; s.position.set(...q); s.rotation.set(0, 0.3 * i, 0.12 * Math.sin(t * 3 + i)); });

    // ---------------- props ----------------
    this.tools.forEach((tl, i) => { const q = st.tools?.[i]; tl.g.visible = !!q; if (!q) return;
      const gp = V(...q.g), bp = V(...q.b), d = bp.clone().sub(gp), len = d.length(); d.normalize();
      const held = q.kind === "stein" || q.kind === "boot" || q.kind === "bread";
      tl.handle.visible = q.kind === "hammer"; tl.handle.position.copy(gp).addScaledVector(d, len / 2); tl.handle.quaternion.setFromUnitVectors(V(0, 1, 0), d); tl.handle.scale.set(1, len, 1);
      for (const [k, h] of Object.entries(tl.heads)) { h.visible = k === q.kind; if (k !== q.kind) continue;
        if (q.kind === "quill") { h.position.copy(gp).addScaledVector(d, 0.085); h.quaternion.setFromUnitVectors(V(0, -1, 0), d); h.scale.setScalar(q.s ?? 1); }
        else if (held) { h.position.copy(gp); h.quaternion.setFromEuler(new THREE.Euler(0, Math.atan2(cam.position.x - gp.x, cam.position.z - gp.z) + (q.yaw ?? 0), q.tilt ?? 0)); h.scale.setScalar(q.s ?? 1); }
        else { h.position.copy(bp); h.quaternion.setFromUnitVectors(V(1, 0, 0), d.clone().cross(V(0, 1, 0)).lengthSq() > 0.01 ? V(0, 1, 0).cross(d).normalize() : V(1, 0, 0)); } } });
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
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.p1 }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, low: !!q.low, extra: !!q.extra || !!q.side, s: q.s ?? (OUT[q.who]?.o.build === "kid" ? 0.72 : 1) }));
    const key = st.key ?? [focus.x, focus.y + 2.2, focus.z - 1.5] as V3;
    let ai = 0; const towels: V3[] = [];
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed), ks = q.s ?? (w.o.build === "kid" ? 0.72 : 1);
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz2 = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz2) || 1, n3 = V(nx / nl2, 0, nz2 / nl2), crs = V(n3.z, 0, -n3.x);
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs) / ks, (pc.y - q.p[1]) / ks]; };
      const mirror = !!q.side && (q.side.mirror !== (right.x < 0));
      // a towel over the left shoulder: a card just in front of the body
      if (q.towel) towels.push([q.p[0] + n3.x * 0.16 + crs.x * (mirror ? -1 : 1) * 0.22 * ks, q.p[1] + 0.92 * ks, q.p[2] + n3.z * 0.16 + crs.z * (mirror ? -1 : 1) * 0.22 * ks]);
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
    towels.forEach((hp, i) => this.cards.towel.put(i, hp, cam, 0.05, 1, false));
    // ---- contact shadows ----
    const cc = set === "room" ? "#3a2a24" : "#5a5248";
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
