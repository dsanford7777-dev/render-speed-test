// The Pig War long-form's three.js world (built from the Short's sets, posed per frame from a shot spec, shots3d.ts): the house river and banks (no town: an island meadow), Cutlar's farm and potato
// patch, the hill with two flags, the standoff field, the quay with the warship behind, the two camps, the pig's grave,
// and the hall for the Kaiser. update(id, f, camera) poses everything for shot `id` at frame f (pure in id + f).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "../bridge/build";
import { bed, ctex, cobbleHD, stoneHD, grassHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { FPS } from "./timeline";
import { D0, V3, smooth, clamp01, Fm, Hl, St, Q, Cp, G, C, FARM_O, HALL, SHIP_Z } from "../pigwar/story";
import { buildFarm, Farm, buildChamber, Chamber, Board } from "../dst/props";
import { ship } from "../fahrenheit/props";
import { potatoPatch, Flag, usFlagTex, ukFlagTex, cannon, tent, arrestTex, noTex, kaiserTex, grave, bangCard } from "../pigwar/props";
import { hog, statue, dock } from "./props3d";
import type { St3, Person3 } from "./shots3d";
type Light = "day" | "golden" | "night";

const LP: Record<Light, LightPreset> = { day: LIGHTS.day, golden: LIGHTS.golden, night: LIGHTS.day };
const LK: Record<Light, WorldLook> = { day: LOOK.day, golden: LOOK.golden, night: LOOK.day };

// ---------------- cast ----------------
const US: Outfit = { jacket: "#2f4f8f", pants: "#7f9cc9", boots: "#1e1a20", hat: "cap", cap: "#24345e", belt: "#f1efe6", buttons: "#e8c45a", rifle: true, skin: SKIN };
const UK: Outfit = { jacket: "#c9373a", pants: "#2b2f3d", boots: "#1e1a20", hat: "shako", belt: "#f1efe6", buttons: "#e8c45a", rifle: true, skin: SKIN };
const USK: Outfit[] = [US, { ...US, skin: "#f5c9a0", moustache: "#6b4a2f" }, { ...US, skin: "#c99067" }, { ...US, skin: "#ecd0b6" }, { ...US, skin: "#f5c9a0" }, { ...US, skin: SKIN, moustache: "#2a201a" }];
const UKK: Outfit[] = [UK, { ...UK, skin: "#f5c9a0", moustache: "#b5462f" }, { ...UK, skin: "#ecd0b6" }, { ...UK, skin: "#f5c9a0" }, { ...UK, skin: SKIN, moustache: "#4a3020" }, { ...UK, skin: "#ecd0b6" }];
const CUTLAR: Outfit = { jacket: "#5d7a3a", pants: "#4a5a7a", boots: "#3a2a20", hat: "cap", cap: "#d9a441", skin: "#f5c9a0", moustache: "#6b4a2f", rifle: true };
const OFFICER_UK: Outfit = { jacket: "#c9373a", pants: "#2b2f3d", boots: "#1e1a20", hat: "shako_tall", buttons: "#e8c45a", sash: "#e8c45a", sword: true, moustache: "#4a3020", skin: "#ecd0b6", build: "stout" };
const GOVERNOR: Outfit = { jacket: "#2b2f3d", pants: "#2b2f3d", boots: "#1e1a20", hat: "tophat", buttons: "#d9d4c8", skin: "#c99067" };
const ADMIRAL: Outfit = { jacket: "#1f2f5f", pants: "#1f2f5f", boots: "#1e1a20", hat: "cap", cap: "#1f2f5f", buttons: "#e8c45a", sash: "#e8c45a", moustache: "#e8e8e8", skin: "#f5c9a0", build: "stout" };
const KAISER: Outfit = { jacket: "#2b3a63", pants: "#1d1b22", boots: "#1e1a20", hat: "spike", buttons: "#e8c45a", sash: "#e8c45a", moustache: "#eeeeee", skin: "#f5c9a0", build: "stout" };
const PICKETT: Outfit = { jacket: "#24345e", pants: "#7f9cc9", boots: "#1e1a20", hat: "cap", cap: "#24345e", buttons: "#e8c45a", sash: "#e8c45a", sword: true, moustache: "#6b4a2f", skin: "#f5c9a0" };
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** everyone the shots can place, by name */
const OUT: Record<string, Who> = {
  ...Object.fromEntries(USK.map((o, k) => [`us${k}`, who(o, 10 + k, `us${k}`)])),
  ...Object.fromEntries(UKK.map((o, k) => [`uk${k}`, who(o, 20 + k, `uk${k}`)])),
  cutlar: who(CUTLAR, 5, "cutlar"), cutlar_nr: who({ ...CUTLAR, rifle: false }, 5, "cutlar_nr"), officer: who(OFFICER_UK, 30, "officer"),
  governor: who(GOVERNOR, 40, "governor"), admiral: who(ADMIRAL, 41, "admiral"), kaiser: who(KAISER, 50, "kaiser"), pickett: who(PICKETT, 60, "pickett"),
};

/** drawing size by distance: [canvas w, h, scale from the 600 x 1000 design] */
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
type Pose = { expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; blink?: number; wave?: number; side?: { phase: number; mirror: boolean; stride?: number } };

export class LWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private WU: Record<string, THREE.IUniform>;
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private clouds: THREE.Mesh[] = []; private cloudMaps: Record<Light, THREE.Texture[]>;
  private farm: Farm; private hall: Chamber;
  private pigA: { g: THREE.Group; head: THREE.Group }; private patch: THREE.Group;
  private hillUS: Flag; private hillUK: Flag; private mound: THREE.Mesh;
  private ship: THREE.Group; private cannons: THREE.Group[] = [];
  private arrest: Board; private no: Board; private ship2: THREE.Group; private statue: { g: THREE.Group; head: THREE.Group }; private dock: THREE.Group;
  private campUS: Flag; private campUK: Flag; private march: Flag; private tents: THREE.Group[] = [];
  private stone: THREE.Group; private bang: THREE.Mesh;
  private lastPeople: { name: string; p: V3; walking: boolean }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    void kit;
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
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60, w = 130 + (i % 4) * 30;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    // ---- ground, river, banks (grass right to a stone edge; no quay town) ----
    const b = new Batch();
    const grass = lam("grassHD", () => ({ map: grassHD() }));
    const wall = lam("wallHD", () => ({ map: stoneHD("wallHD", ["#c9bcaa", "#bfb19f", "#d1c5b4", "#b8aa97"], "#958776") }));
    const cope = lam("copeHD", () => ({ map: stoneHD("copeHD", ["#e6dccd", "#ddd3c3", "#ece4d6", "#d6cbba"], "#aea293") }));
    void cobbleHD;
    for (const s of [-1, 1]) {
      const zn = s * 30, zf = s * 900;
      b.add(s < 0 ? quadUp(-900, 900, zf, zn, 450, 217.5) : quadUp(-900, 900, zn, zf, 450, 217.5), grass);
      b.add(s < 0 ? wallQuad(-900, 900, -30, 1) : wallQuad(900, -900, 30, -1), wall);
      b.add(boxGeo(V(-600, D0, s < 0 ? -30.5 : 30), V(600, D0 + 0.35, s < 0 ? -30 : 30.5), 2), cope);
    }
    b.add(quadUp(-900, 900, -30, 30, 225, 7.5, -0.6 - D0), lam("bed", () => ({ map: bed() })));
    b.build(R);
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
    // ---- Cutlar's farm (the DST farm without its clock, cow and milk sign) + the potato patch ----
    this.farm = buildFarm(R, FARM_O[0], FARM_O[1], FARM_O[2]);
    for (const o of [this.farm.clockG, this.farm.cow, this.farm.milkSign.group, ...this.farm.cans]) o.visible = false;
    for (const d of this.farm.dew) d.visible = false;
    this.patch = potatoPatch(-1.5, 4.2, 3); this.patch.position.set(...Fm(0, 0, -1.2)); R.add(this.patch);
    this.pigA = hog("hogBlack", "#3a3038", "#d98a9a"); R.add(this.pigA.g);
    this.arrest = new Board(0.62, 0.8, "arrestOrder", arrestTex, 1.0); this.arrest.group.position.set(...Fm(0.05, 1.0 + 0.4, -3.3)); R.add(this.arrest.group);
    this.bang = bangCard(); R.add(this.bang);
    // ---- the hill with two flags ----
    this.mound = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), lam("grassMound", () => ({ map: grassHD() })));
    this.mound.scale.set(1.2, 0.18, 1); this.mound.position.set(...Hl(0, -0.05, 0.5)); this.mound.receiveShadow = true; R.add(this.mound);
    this.hillUS = new Flag("usFlag1859", usFlagTex, 4.4, 1.6); this.hillUS.group.position.set(...Hl(-1.0, 0.62, 0)); R.add(this.hillUS.group);
    this.hillUK = new Flag("union1801", ukFlagTex, 4.4, 1.6); this.hillUK.group.position.set(...Hl(1.0, 0.62, 0)); R.add(this.hillUK.group);
    // ---- the warship (1801 Union flag) ----
    this.ship = ship(); this.ship.position.set(-216, 0.6, SHIP_Z); R.add(this.ship);
    const uf = lam("union1801", () => ({ map: ukFlagTex(), side: THREE.DoubleSide }));
    this.ship.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.geometry instanceof THREE.PlaneGeometry && [2.4, 2.6].includes(Math.round(m.geometry.parameters.width * 10) / 10)) m.material = uf; });
    // ---- the standoff field: cannons and count boards ----
    for (let k = 0; k < 4; k++) { const c = cannon(); c.position.set(...St(-3.4 - k * 1.5, 0, 2.6)); c.rotation.y = 0.15; R.add(c); this.cannons.push(c); }
    this.march = new Flag("usFlag1859", usFlagTex, 2.9, 1.1); R.add(this.march.group);
    // ---- second warship, the company dock, the statue ----
    this.ship2 = ship(); this.ship2.position.set(-150, 0.6, SHIP_Z + 6); this.ship2.scale.setScalar(0.85); R.add(this.ship2);
    this.ship2.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.geometry instanceof THREE.PlaneGeometry && [2.4, 2.6].includes(Math.round(m.geometry.parameters.width * 10) / 10)) m.material = uf; });
    this.dock = dock(9, 2.4); this.dock.position.set(...Q(-6, 0, 4.0)); R.add(this.dock);
    this.statue = statue(); this.statue.g.position.set(...G(4, 0, 0)); R.add(this.statue.g);
    // ---- the quay: NO board ----
    this.no = new Board(0.8, 0.5, "bigNo", noTex); this.no.group.position.set(...Q(1.4, 2.55, 0.6)); R.add(this.no.group);
    // ---- the two camps ----
    for (const [x, z] of [[-2.6, 4.2], [-1.4, 6.0], [-3.4, 7.2], [2.6, 4.2], [1.4, 6.0], [3.4, 7.2]] as const) { const t = tent(1.0, 1.9); t.position.set(...Cp(x, 0, z)); R.add(t); this.tents.push(t); }
    this.campUS = new Flag("usFlag1859", usFlagTex, 3.6, 1.2); this.campUS.group.position.set(...Cp(-1.9, 0, 1.6)); R.add(this.campUS.group);
    this.campUK = new Flag("union1801", ukFlagTex, 3.6, 1.2); this.campUK.group.position.set(...Cp(1.2, 0, 1.6)); R.add(this.campUK.group);
    // ---- the grave ----
    this.stone = grave(); this.stone.position.set(...G(0, 0, 0)); R.add(this.stone);
    // ---- the hall: the Kaiser's arbitration ----
    this.hall = buildChamber(R, HALL[0], HALL[1], HALL[2]);
    this.hall.board.material = lam("kaiserBoard_false", () => ({ map: kaiserTex(false) }));
    this.hall.paper.visible = false; this.hall.board.scale.setScalar(0.62); this.hall.board.position.y += 0.35; for (const c of this.hall.candies) c.visible = false;
  }

  private shotSun(id: number, L: LightPreset, sample: (f: number) => { pos: V3; look: V3 }, a: number, b: number) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = a; f < b; f += 3) { const c = sample(f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose the world for shot `id` (spec st) at frame f; sample(f) gives the shot's camera at any frame (for the sun) */
  update(id: number, st: St3, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene, sample: (f: number) => { pos: V3; look: V3 }, a: number, b: number) {
    const t = f / FPS, light: Light = st.light, L = LP[light], K = LK[light];
    // ---- camera ----
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...(st.focus ?? c.look)), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- lights ----
    const sunDir = this.shotSun(id, L, sample, a, b);
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
    this.sunDisc.visible = light === "golden";
    if (this.sunDisc.visible) { this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900); this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7))); }
    for (let i = 0; i < this.clouds.length; i++) { const m = this.clouds[i]; m.lookAt(cam.position.x, m.position.y, cam.position.z); (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[light][i % 4]; }
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;

    // ---- props ----
    const setPop = (o: THREE.Object3D, k: number) => { o.visible = k > 0.001; o.scale.setScalar(Math.max(0.001, k)); };
    const P = this.pigA;
    P.g.visible = !!st.pig; P.g.rotation.set(0, 0, 0); P.head.rotation.set(0, 0, 0);
    if (st.pig) {
      P.g.position.set(st.pig.p[0], st.pig.p[1] + 0.45 * (st.pig.jump ?? 0), st.pig.p[2]); P.g.rotation.y = st.pig.ry ?? 0;
      P.head.rotation.x = st.pig.nod ?? 0; P.head.rotation.y = st.pig.turn ?? 0;
      if (st.pig.walk !== undefined) P.g.position.y += 0.03 * Math.abs(Math.sin(st.pig.walk * Math.PI * 2));
    }
    this.bang.visible = !!st.bang;
    if (st.bang) { this.bang.position.set(...st.bang); this.bang.quaternion.copy(cam.quaternion); this.bang.scale.setScalar(st.bangScale ?? 1); }
    this.arrest.group.visible = !!st.arrest;
    setPop(this.no.group, st.no ?? 0);
    for (const fl of [this.hillUS, this.hillUK, this.campUS, this.campUK, this.march]) fl.wave(t);
    this.hillUS.raise(st.hillUS ?? 1); this.hillUK.raise(st.hillUK ?? 1); this.hillUK.group.visible = (st.hillUK ?? 1) >= 0;
    this.campUS.raise(st.campUS ?? 1); this.campUK.raise(st.campUK ?? 1);
    this.ship.visible = !!st.ship;
    if (st.ship) this.ship.position.set(st.ship[0], st.ship[1] + 0.08 * Math.sin(t * 2), st.ship[2]);
    this.ship.rotation.z = 0.015 * Math.sin(t * 1.6);
    this.ship2.visible = !!st.ship2;
    if (st.ship2) this.ship2.position.set(st.ship2[0], st.ship2[1] + 0.08 * Math.sin(t * 2 + 1), st.ship2[2]);
    this.ship2.rotation.z = 0.015 * Math.sin(t * 1.4 + 1);
    this.cannons.forEach((cn, i) => { cn.visible = i < (st.cannons ?? 0); });
    this.stone.visible = !!st.grave;
    this.statue.g.visible = !!st.statue;
    this.dock.visible = st.dock ?? true;
    this.hall.board.material = lam("kaiserBoard_false", () => ({ map: kaiserTex(false) }));

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.us0 }));
    this.march.group.visible = !!st.march;
    if (st.march) this.march.group.position.set(...st.march);
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, walking: !!q.side }));
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed);
      const mirror = !!q.side && q.side.mirror;
      const lt = mirror ? Math.PI - lightA : lightA;
      const key = q.side
        ? `S|${w.key}|${q.expr}|${Math.round(q.side.phase * 16)}|${bl}|${lt.toFixed(2)}`
        : `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${lt.toFixed(2)}`;
      act.r = this.pool.req(key, cw, ch, kk, (p: Pen) => q.side
        ? bodySide(p, w.o, { mode: "march", phase: Math.round(q.side.phase * 16) / 16, expr: q.expr, blink: bl, stride: q.side.stride ?? 0.8, stomp: 0.6, light: lt, seed: w.seed })
        : bodyFront(p, w.o, { mode: "stand", expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: q.wave, light: lt, seed: w.seed }));
      act.mesh.visible = true;
      act.mesh.position.set(...q.p);
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      act.mesh.scale.set(mirror ? -1 : 1, 1, 1);
      act.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- contact shadows ----
    const cc = "#8a8ab0";
    let fi = 0;
    for (const { q } of people) {
      const pos: V3 = [q.p[0], q.p[1] + 0.022, q.p[2]];
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(...pos), 0.6))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(`blob|contact|${cc}`, 128, 128, 1, (p) => fxContact(p, cc));
      e.use(false); e.mesh.visible = true; e.mesh.position.set(...pos); e.mesh.rotation.set(-Math.PI / 2, 0, 0); e.mesh.scale.set(0.55, 0.42, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a2 of this.actors) if (a2.mesh.visible) a2.bind();
    for (const e2 of this.fxs) if (e2.mesh.visible) e2.bind();
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
      const head = box(q.p, -0.27, 0.27, 1.16, 1.84), body = box(q.p, -0.3, 0.3, 0.05, 1.16);
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      else if (head.frac > 0.02 && head.frac < 0.97 && (!q.walking || (head.vcut && head.inX))) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12) out.push(`${q.name}: body in shot without the head`);
      if (head.frac > 0.02 && head.h > 1.6 && !st.closeup) out.push(`${q.name}: face fills the screen`);
    }
    for (const [name, at, r] of st.subjects ?? []) {
      const v3 = V(...at);
      p.copy(v3).project(cam);
      if (p.z > 1 || Math.abs(p.x) > 0.92 || Math.abs(p.y) > 0.9) { out.push(`${name}: not in shot`); continue; }
      if (p.y < -0.48 && Math.abs(p.x) < 0.6) out.push(`${name}: under the subtitles`);
      const dir = v3.clone().sub(cam.position), dist = dir.length();
      this.ray.set(cam.position, dir.normalize()); this.ray.far = dist; this.ray.layers.set(0);
      const hit = this.ray.intersectObject(this.root, true).find((h) => {
        const m = h.object as THREE.Mesh, mat = m.material as THREE.Material;
        let o: THREE.Object3D | null = m; while (o) { if (!o.visible || o === this.pigA.g || o === this.statue.g) return false; o = o.parent; }
        return !(Array.isArray(mat) ? false : mat.transparent || (mat as THREE.Material & { alphaTest?: number }).alphaTest > 0) && h.object !== this.sky;
      });
      if (hit && hit.distance < dist - r) out.push(`${name}: hidden behind something ${(dist - hit.distance).toFixed(2)} m in front of it`);
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

