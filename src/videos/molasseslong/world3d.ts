// The long-form's three.js world: the Molasses short's set (painted valley, quay, the tank, Commercial Street under the
// elevated railway, the firehouse, the wave, the cast as lit cards), driven by a per-shot spec (shots3d.ts) instead of
// the short's own shot list. update(spec, f, camera) poses everything; qa() measures framing for the check.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, buildTown, Kit, house } from "../bridge/build";
import { bed, ctex, stoneHD, cobbleHD, grassHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN, KID } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { ship } from "../fahrenheit/props";
import { WINTER } from "./shots3d";
import { Board } from "../dst/props";
import { FPS } from "./timeline";
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
import { St, Light3, Person } from "./shots3d";
import {
  D0, MX, M, V3, TANK, STREET, EL, FIRE, WAVE, GALLONS, EASEL, DESK, PLAQUE, HOSE, CAL, POLE, MPH, CART, HAT,
} from "../molasses/story";
import {
  buildTank, Tank, TANK_H, TANK_R, LiquidWave, molMat, questionMark, molSheet, elRail, ElRail, firehouse, cart, hat, hose, redX, easel, desk, cup, plank, brush,
  gallonsTex, planTex, treasurerTex, calendarTex, feetTex, mphTex, markPole,
} from "../molasses/props";

/** golden here is the warm "years before" look, lit from behind the lens so the tank's street face catches the sun */
const GOLD: LightPreset = { ...LIGHTS.golden, az: 145, el: 20, lit: [1.42, 0.98, 0.62], shade: [0.3, 0.26, 0.38], lift: [0.06, 0.07, 0.15], sunI: 4.0 };
const LP: Record<Light3, LightPreset> = { day: { ...LIGHTS.day, az: 135, el: 40 }, golden: GOLD, winter: { ...LIGHTS.day, az: 150, el: 26, ...WINTER } };
const LK: Record<Light3, WorldLook> = { day: LOOK.day, golden: LOOK.golden, winter: LOOK.day };

// ---------------- cast ----------------
const JELL: Outfit = { jacket: "#2b2f3d", pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#4a3020", skin: "#f5c9a0", moustache: "#4a3020", buttons: "#e8c45a" };
const PAINTER: Outfit = { jacket: "#e8e2d4", pants: "#d9d2c2", boots: "#4a3426", hat: "cap", cap: "#e8e2d4", skin: SKIN };
const FOLK: Outfit[] = [
  { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "cap", cap: "#5a3b2a", skin: SKIN },
  { jacket: "#5d7a3a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#d9a441", skin: "#f5c9a0" },
  { jacket: "#2f5f6a", pants: "#3b3f52", boots: "#4a3426", hat: "cap", cap: "#2f2a3a", skin: "#ecd0b6", moustache: "#4a3020" },
  { jacket: "#7a4b2a", pants: "#5a4a3a", boots: "#2a201a", hat: "hair", hair: "#2a201a", skin: "#c99067" },
  { jacket: "#3f6fb5", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#c0553a", skin: SKIN },
];
const KIDS: Outfit[] = [
  { ...KID, jacket: "#7b5ac9", cap: "#2f8f8a", skin: "#c99067" },
  { ...KID, jacket: "#2f8f8a", hat: "hair", hair: "#2a201a", skin: "#f5c9a0" },
  { ...KID, jacket: "#e0332e", cap: "#ffd84d", skin: "#ecd0b6" },
];
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** the cast by name: "jell", "painter", "folk0".."folk4", "kid0".."kid2" */
const CAST = (name: string): Who => {
  if (name === "jell") return who(JELL, 7, "jell");
  if (name === "painter") return who(PAINTER, 9, "painter");
  const m = /^(folk|kid)(\d+)$/.exec(name);
  if (m) { const k = Number(m[2]); return m[1] === "kid" ? who(KIDS[k % 3], 60 + k, name) : who(FOLK[k % 5], 40 + k, name); }
  return who(FOLK[0], 40, name);
};

const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
type Pose = { expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; blink?: number; side?: { phase: number; mirror: boolean; stride?: number }; cup?: boolean; brush?: boolean };

export class LWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private WU: Record<string, THREE.IUniform>;
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<string, THREE.Vector3>();
  private clouds: THREE.Mesh[] = []; private cloudMaps: Record<Light3, THREE.Texture[]>;
  private tank: Tank; private wave: LiquidWave; private gush: LiquidWave; private puddle: THREE.Mesh; private qm: THREE.Mesh; private sheet: THREE.Group;
  private el: ElRail; private fire: THREE.Group; private fireBase: THREE.Mesh;
  private gallons: Board; private plan: Board; private plaque: Board; private cal: Board; private feet: Board; private mph: Board;
  private easel: THREE.Group; private desk: THREE.Group; private hose: THREE.Group; private x: THREE.Group;
  private pole: THREE.Group; private cart: THREE.Group; private hat: THREE.Group;
  private cups: THREE.Group[] = []; private pipes: THREE.Mesh[] = []; private plank: THREE.Group; private brush: THREE.Group;
  private drips: THREE.Mesh[] = []; private rivets: THREE.Mesh[] = [];
  private lastPeople: { name: string; p: V3; walking: boolean }[] = [];
  private ship!: THREE.Group; private quayPipe!: THREE.Group; private flakes: THREE.Mesh[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), winter: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60, w = 130 + (i % 4) * 30;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    // ---- ground, river, quays (the shared valley), plus this short's quay, street and tank yard ----
    const b = new Batch();
    const grass = lam("grassHD", () => ({ map: grassHD() })), cobble = lam("cobbleHD", () => ({ map: cobbleHD() }));
    const wall = lam("wallHD", () => ({ map: stoneHD("wallHD", ["#c9bcaa", "#bfb19f", "#d1c5b4", "#b8aa97"], "#958776") }));
    const cope = lam("copeHD", () => ({ map: stoneHD("copeHD", ["#e6dccd", "#ddd3c3", "#ece4d6", "#d6cbba"], "#aea293") }));
    for (const s of [-1, 1]) {
      const zn = s * 30, zf = s * 900;
      b.add(s < 0 ? quadUp(-900, 900, zf, zn, 450, 217.5) : quadUp(-900, 900, zn, zf, 450, 217.5), grass);
      b.add(s < 0 ? quadUp(-160, 160, -36.5, -30, 80, 1.625, 0.012) : quadUp(-160, 160, 30, 36.5, 80, 1.625, 0.012), cobble);
      b.add(s < 0 ? quadUp(-6, 6, -170, -36.5, 3, 33.375, 0.012) : quadUp(-6, 6, 36.5, 170, 3, 33.375, 0.012), cobble);
      b.add(s < 0 ? wallQuad(-900, 900, -30, 1) : wallQuad(900, -900, 30, -1), wall);
      b.add(boxGeo(V(-600, D0, s < 0 ? -30.5 : 30), V(900, D0 + 0.75, s < 0 ? -30 : 30.5), 2), cope);
    }
    b.add(quadUp(MX - 60, MX + 80, -36.5, -30.5, 35, 1.5, 0.012), cobble);              // waterfront
    b.add(quadUp(MX - 1, MX + 11, STREET.z1, -36.5, 3, 31, 0.014), cobble);              // Commercial Street
    b.add(quadUp(MX - 32, MX - 1, -68, -36.5, 8, 8, 0.013), cobble);                     // tank yard
    b.add(quadUp(-900, 900, -30, 30, 225, 7.5, -0.6 - D0), lam("bed", () => ({ map: bed() })));
    // street houses: east side all along (fronts on x = MX + 11, a gap for the firehouse), west side south of the yard
    const pick = [7, 9, 7, 9, 9, 7], hh = [8.4, 9.8, 7, 9.8, 8.4, 9.8, 7];
    let z = -38, k = 0;
    while (z > STREET.z1) { const w = pick[k % 6]; house(b, MX + 15, z - w / 2, -Math.PI / 2, w, 8, hh[k % 7], (k * 3) % 8); z -= w + 0.3; k++; }
    z = -70; k = 2;
    while (z > STREET.z1) { const w = pick[k % 6]; if (z - w < FIRE[2] + 4.6 && z > FIRE[2] - 4.6) { z = FIRE[2] - 4.8; continue; } house(b, MX - 5, z - w / 2, Math.PI / 2, w, 8, hh[k % 7], (k * 5) % 8); z -= w + 0.3; k++; }
    // quay furniture
    for (let x = MX - 56; x <= MX + 76; x += 12) if (Math.abs(x - MX - 5) > 6) b.add(boxGeo(V(x - 0.25, D0, -31.4), V(x + 0.25, D0 + 0.5, -30.9)), lam("bollard", () => ({ color: "#3b3f52" })));
    b.build(R);
    buildTown(R, kit, []);
    // river
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wTime: { value: 0 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", WATER_DECL).replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "fahrRiver1";
    const wm = new THREE.Mesh(quadUp(-900, 900, -30, 30, 1, 1, -D0), waterM); wm.receiveShadow = true; R.add(wm);
    // ---- the tank and its ship ----
    this.tank = buildTank(); this.tank.group.position.set(...TANK); R.add(this.tank.group);
    const sh = ship(); sh.position.set(MX - 30, 0.6, -22); sh.rotation.y = 0.05; R.add(sh); this.ship = sh;
    // the pipe from the quay to the tank (ship-pump shot): along the yard, then up the tank's north face
    this.quayPipe = new THREE.Group();
    const pm = lam("ironHandle", () => ({ color: "#4a4e5a" }));
    const run = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 9.2, 14).rotateX(Math.PI / 2), pm); run.position.set(MX - 18, D0 + 0.34, -34.8);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 15.6, 14), pm); up.position.set(MX - 18, D0 + 7.8, -39.5); // just outside the north wall (z = -40.17 at this x)
    const hoseUp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 12), pm); hoseUp.position.set(MX - 18, D0 - 1.6, -30.4);
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 6.9, 12).rotateX(-Math.atan2(6.4, 2.5)), pm); deck.position.set(MX - 18, 4.7, -27.2);
    for (const m of [run, up, hoseUp, deck]) { m.castShadow = true; this.quayPipe.add(m); }
    this.quayPipe.visible = false; R.add(this.quayPipe);
    const fm = lam("steelFlake", () => ({ color: "#8e8a94" }));
    for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.16 - (i % 3) * 0.03, 0.025, 0.11 + (i % 2) * 0.04), fm); m.castShadow = true; m.visible = false; R.add(m); this.flakes.push(m); }
    // ---- the El, the firehouse ----
    this.el = elRail(EL.z0, EL.z1, EL.h, EL.bentZ); this.el.group.position.set(EL.x, D0, 0); R.add(this.el.group);
    const fh = firehouse(); this.fire = fh.g; this.fireBase = fh.base as unknown as THREE.Mesh;
    this.fire.position.set(...FIRE); this.fire.rotation.y = Math.PI; R.add(this.fire);
    (fh.base as THREE.Object3D).position.set(FIRE[0], FIRE[1], FIRE[2]); R.add(fh.base);
    // ---- the molasses ----
    this.wave = new LiquidWave(WAVE.w, WAVE.H, 44, "wave"); R.add(this.wave.group);
    this.gush = new LiquidWave(4.4, 7.4, 6, "gush", 16); this.gush.group.rotation.y = -Math.PI / 2; R.add(this.gush.group);
    this.puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), molMat()); this.puddle.receiveShadow = true; R.add(this.puddle);
    this.qm = questionMark(); R.add(this.qm);
    this.sheet = molSheet(15, 120); this.sheet.position.set(WAVE.x, D0 + 0.35, -100); R.add(this.sheet);
    // ---- signs and props ----
    const atX = <T extends THREE.Object3D>(o: T, p: V3, face: "x" | "-z" = "x") => { o.position.set(...p); o.rotation.y = face === "x" ? -Math.PI / 2 : 0; R.add(o); return o; };
    this.gallons = new Board(2.4, 1.2, "gallons", gallonsTex, 1.5); atX(this.gallons.group, GALLONS);
    this.easel = easel(); atX(this.easel, EASEL);
    this.plan = new Board(0.9, 1.2, "tankPlan", planTex); atX(this.plan.group, [EASEL[0] - 0.05, EASEL[1] + 1.55, EASEL[2]]); this.plan.group.rotation.z = Math.PI; this.plan.group.rotation.order = "YXZ";
    this.desk = desk(); atX(this.desk, DESK);
    this.plaque = new Board(1.5, 0.38, "treasurer", treasurerTex, 2.25); atX(this.plaque.group, PLAQUE);
    this.hose = hose(); atX(this.hose, HOSE);
    this.x = redX(0.7); atX(this.x, [HOSE[0] + 0.7, HOSE[1] + 0.55, HOSE[2] - 0.2]);
    this.cal = new Board(0.8, 1.0, "calendar1919", calendarTex, 1.8); atX(this.cal.group, CAL);
    this.pole = markPole(); atX(this.pole, POLE, "-z");
    this.feet = new Board(1.2, 0.75, "feet25", feetTex); atX(this.feet.group, [POLE[0], POLE[1] + 8.25, POLE[2]], "-z");
    this.mph = new Board(1.2, 1.5, "mph35", mphTex, 1.75); atX(this.mph.group, MPH, "-z");
    this.cart = cart(); this.cart.position.set(...CART); this.cart.rotation.set(0.12, 0.5, -0.08); R.add(this.cart);
    this.hat = hat(); this.hat.position.set(...HAT); this.hat.rotation.set(0.15, 0, 0.1); R.add(this.hat);
    for (let i = 0; i < 3; i++) { const c = cup(); R.add(c); this.cups.push(c); }
    const pipeM = lam("ironHandle", () => ({ color: "#4a4e5a" }));
    for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 10).rotateZ(Math.PI / 2), pipeM); p.castShadow = true; R.add(p); this.pipes.push(p); }
    this.plank = plank(); R.add(this.plank);
    this.brush = brush(); R.add(this.brush);
    const dripM = lam("molassesDrip", () => ({ color: "#4a220c" }));
    for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), dripM); d.scale.set(1, 1.6, 1); d.castShadow = true; R.add(d); this.drips.push(d); }
    const rivM = lam("rivet", () => ({ color: "#3c1f0e" }));
    for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), rivM); R.add(r); this.rivets.push(r); }
  }

  private shotSun(key: string, look: [number, number], L: LightPreset) {
    let v = this.sunCache.get(key);
    if (v) return v;
    const n = Math.hypot(look[0], look[1]) || 1, fx = look[0] / n, fz = look[1] / n;
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(key, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  /** pose everything for one long-form 3D shot (`key` = shot key, for caches) at frame f */
  update(key: string, st: St, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, light = st.light, K = LK[light], L: LightPreset = { ...LP[light], ...(st.sunAz !== undefined ? { az: st.sunAz } : {}) };
    // ---- camera ----
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- lights (sun direction fixed per shot, from the shot's first framing) ----
    const sunDir = this.shotSun(`${key}|${light}|${L.az}`, st.sunLook ?? [c.look[0] - c.pos[0], c.look[2] - c.pos[2]], L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    if (light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = light === "golden" && !st.noSunDisc;
    if (this.sunDisc.visible) { this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900); this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7))); }
    for (let i = 0; i < this.clouds.length; i++) { const m = this.clouds[i]; m.lookAt(cam.position.x, m.position.y, cam.position.z); (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[light][i % 4]; }
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;

    // ---- the set, per spec ----
    const tk = this.tank, flood = !!st.flood;
    tk.group.visible = st.tank !== false;
    tk.whole.visible = !flood; tk.burst.visible = flood;
    const paintK = st.paint ?? 0;
    tk.paint.visible = paintK > 0.002; tk.paint.scale.y = Math.max(0.002, paintK);
    const crackK = st.crack ?? 0;
    tk.hole.visible = crackK > 0.01; tk.hole.scale.set(0.3 + 4.2 * crackK, 0.6 + 7.4 * crackK, 1); tk.hole.position.y = (0.6 + 7.4 * crackK) / 2;
    const wf = st.wave ?? null;
    this.wave.group.visible = wf !== null;
    if (wf !== null) { this.wave.group.position.set(WAVE.x, D0, wf); this.wave.group.scale.set(1, st.surge ?? 1, 1); this.wave.update(t); }
    const gk = st.gush ?? 0;
    this.gush.group.visible = crackK > 0.12 && gk > 0;
    if (this.gush.group.visible) {
      this.gush.group.position.set(TANK[0] + TANK_R + 0.05 + 3.8 * gk, D0, TANK[2]);
      this.gush.group.scale.set((0.3 + 4.2 * crackK) * 0.8 / 4.4, Math.max(0.05, crackK * 1.08), 1);
      this.gush.update(t);
    }
    this.puddle.visible = gk > 0.02;
    this.puddle.position.set(TANK[0] + TANK_R + 0.8 + 2.2 * gk, D0 + 0.05, TANK[2]); this.puddle.scale.set(1.0 + 2.6 * gk, 1, 1.6 + 3.2 * gk);
    this.sheet.visible = !!st.sheet;
    const kk = st.fire ?? 0;
    this.fire.position.set(FIRE[0] - 1.6 * kk, FIRE[1] + 0.15 * kk, FIRE[2] - 0.8 * kk); this.fire.rotation.set(0.04 * kk, Math.PI - 0.16 * kk, 0.07 * kk);
    const tw = st.twist ?? 0;
    this.el.bent.rotation.set(-0.3 * tw, 0.45 * tw, 0.7 * tw); // bigger than the short's: it has to read in a wide 16:9 frame
    this.el.group.visible = st.el !== false;
    this.ship.visible = st.ship !== false;
    if (st.shipAt) this.ship.position.set(...st.shipAt); else this.ship.position.set(MX - 30, 0.6, -22);
    this.quayPipe.visible = !!st.pipe;
    // short-only signs and props stay hidden unless a spec asks for them
    this.gallons.group.visible = false; this.easel.visible = this.plan.group.visible = false;
    this.desk.visible = this.plaque.group.visible = !!st.desk; this.hose.visible = !!st.hose; this.cal.group.visible = false;
    const xs = st.xMark ?? 0;
    this.x.visible = xs > 0.01; this.x.scale.setScalar(Math.max(0.001, xs * (1 + 0.15 * Math.sin(Math.min(1, xs) * Math.PI))));
    this.pole.visible = this.feet.group.visible = !!st.pole;
    this.mph.group.visible = !!st.mph;
    this.cart.visible = this.hat.visible = !!st.debris;
    this.qm.visible = false;
    this.plank.visible = this.brush.visible = false;
    this.drips.forEach((d, i) => {
      d.visible = false;
      if (st.drips === "seam" && i < 8) {
        const u = ((t * 0.35 + i * 0.37) % 1), zz = TANK[2] - 0.9 + (i % 4) * 0.55, y0 = 3.4 + (i % 3) * 0.5;
        d.visible = true; d.position.set(TANK[0] + TANK_R + 0.04, D0 + y0 - u * 2.2, zz);
      }
    });
    this.flakes.forEach((m, i) => {
      const k = st.flakes === undefined ? 0 : clamp01(st.flakes * 1.6 - i * 0.08), top = D0 + 0.84;
      m.visible = k > 0;
      if (m.visible) { m.position.set(DESK[0] - 0.45 + (i % 4) * 0.2, top + (1 - k * k) * 1.4, DESK[2] - 0.15 + Math.floor(i / 4) * 0.22); m.rotation.set((1 - k) * 3 + i, i * 0.7, (1 - k) * 2); }
    });
    this.rivets.forEach((r, i) => {
      const tau = st.rivets ?? -1;
      r.visible = tau > 0 && tau < 1.6;
      if (r.visible) {
        const a = (i / 14) * 2.2 - 1.1, vy = 4 + (i % 5), vx = 3 + (i % 3) * 1.5;
        r.position.set(TANK[0] + TANK_R + 0.2 + vx * tau, D0 + 1.5 + (i % 7) * 0.9 + vy * tau - 4.9 * tau * tau, TANK[2] + a * 1.2 + Math.sin(a) * vx * tau * 0.5);
      }
    });

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const people: Person[] = st.people ?? [];
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    this.lastPeople = people.map((q) => ({ name: q.who, p: q.p, walking: !!q.side || !!q.running }));
    let ci = 0;
    for (const q of people) if (q.cup && ci < this.cups.length) {
      const cpp = this.cups[ci], pp = this.pipes[ci++], wallX = TANK[0] + TANK_R;
      cpp.visible = true; cpp.position.set(q.p[0] + 0.3, q.p[1] + 0.66, q.p[2] + 0.2);
      pp.visible = false; void wallX;
    }
    for (let i = ci; i < this.cups.length; i++) { this.cups[i].visible = false; this.pipes[i].visible = false; }
    if (st.drips === "cups") this.drips.forEach((d, i) => {
      if (i >= 2 * ci) return;
      const k = i % ci, u = ((t * 1.1 + Math.floor(i / ci) * 0.5 + k * 0.29) % 1), cp = this.cups[k].position;
      d.visible = true; d.position.set(cp.x, D0 + 1.72 - u * (D0 + 1.72 - cp.y - 0.12), cp.z);
    });
    const pnt = people.find((q) => q.brush);
    if (pnt) {
      this.plank.visible = this.brush.visible = true;
      this.plank.position.set(pnt.p[0], pnt.p[1] - 0.03, pnt.p[2] + 0.6);
      this.brush.position.set(pnt.p[0] - 0.45, pnt.p[1] + 0.55, pnt.p[2] + 0.05); this.brush.rotation.set(0, 0, 0.35 + 0.15 * Math.sin(t * 7));
    }
    let ai = 0;
    for (const q of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const W_ = CAST(q.who), [w, h, k] = tier(d), a = this.actor(ai++);
      const mirror = !!q.side && q.side.mirror;
      const lt = mirror ? Math.PI - lightA : lightA, bl = q.blink ?? blink(W_.seed);
      const pkey = q.side
        ? `S|${W_.key}|${q.expr}|${Math.round(q.side.phase * 16)}|${bl}|${lt.toFixed(2)}`
        : `F|${W_.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${lt.toFixed(2)}`;
      a.r = this.pool.req(pkey, w, h, k, (p: Pen) => q.side
        ? bodySide(p, W_.o, { mode: "march", phase: Math.round(q.side.phase * 16) / 16, expr: q.expr, blink: bl, stride: q.side.stride ?? 0.8, stomp: 0.6, light: lt, seed: W_.seed })
        : bodyFront(p, W_.o, { mode: "stand", expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, light: lt, seed: W_.seed }));
      a.mesh.visible = true;
      a.mesh.position.set(...q.p);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      a.mesh.scale.set(mirror ? -1 : 1, 1, 1);
      a.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    const cc = "#8a8ab0";
    let fi = 0;
    for (const q of people) {
      const pos: V3 = [q.p[0], q.p[1] + 0.022, q.p[2]];
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(...pos), 0.6))) continue;
      const fx = this.fx(fi++);
      fx.r = this.pool.req(`blob|contact|${cc}`, 128, 128, 1, (p) => fxContact(p, cc));
      fx.use(false); fx.mesh.visible = true; fx.mesh.position.set(...pos); fx.mesh.rotation.set(-Math.PI / 2, 0, 0); fx.mesh.scale.set(0.55, 0.42, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of this.actors) if (a.mesh.visible) a.bind();
    for (const e2 of this.fxs) if (e2.mesh.visible) e2.bind();
    return focus;
  }
  /** framing checks for this frame (call right after update). Pure measurement, no drawing. */
  qa(st: St, cam: THREE.PerspectiveCamera): string[] {
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
      const head = box(q.p, -0.27, 0.27, 1.16, 1.84), body = box(q.p, -0.3, 0.3, 0.05, 1.16);
      if (st.lunge) continue;
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      else if (head.frac > 0.02 && head.frac < 0.97 && (!q.walking || (head.vcut && head.inX))) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12) out.push(`${q.name}: body in shot without the head`);
      if (head.frac > 0.02 && head.h > 1.6 && !st.closeup) out.push(`${q.name}: face fills the screen`);
    }
    // the subject the narration is about must be in shot (16:9: captions sit at y < -0.55) and not hidden
    for (const [name, at, r] of st.subjects ?? []) {
      const w = V(...at);
      p.copy(w).project(cam);
      if (p.z > 1 || Math.abs(p.x) > 0.92 || Math.abs(p.y) > 0.9) { out.push(`${name}: not in shot`); continue; }
      if (/mark|line|board|sign/.test(name) && p.y < -0.5 && Math.abs(p.x) < 0.6) out.push(`${name}: under the subtitles`);
      const dir = w.clone().sub(cam.position), dd = dir.length();
      this.ray.set(cam.position, dir.normalize()); this.ray.far = dd; this.ray.layers.set(0);
      const hit = this.ray.intersectObject(this.root, true).find((h) => {
        const m = h.object as THREE.Mesh, mat = m.material as THREE.Material;
        let o: THREE.Object3D | null = m; while (o) { if (!o.visible) return false; o = o.parent; }
        return !(Array.isArray(mat) ? false : mat.transparent || (mat as THREE.Material & { alphaTest?: number }).alphaTest > 0) && h.object !== this.sky;
      });
      if (hit && hit.distance < dd - r) out.push(`${name}: hidden behind something ${(dd - hit.distance).toFixed(2)} m in front of it`);
    }
    return out;
  }
}

const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wTime;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(0.35 * wTime, 0.0);
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6);
  wc = mix(wc, wCrest, mk.r * 0.7);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf));
  diffuseColor.rgb = wc;`;
function quadUp(x0: number, x1: number, z0: number, z1: number, u: number, v: number, dy = 0) {
  const y = D0 + dy, g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
}
function wallQuad(x0: number, x1: number, z: number, dir: number) {
  const g = new THREE.BufferGeometry(), y0 = -0.6, y1 = D0;
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(Array(6).fill([0, 0, dir]).flat(), 3));
  const u = Math.abs(x1 - x0) / 4, v = (y1 - y0) / 4;
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
}
