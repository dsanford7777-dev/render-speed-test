// The 60 Hz long-form's three.js world, posed per frame from a shot spec (story3d.ts). The house river and banks, and four
// sets far apart on the grass: the lamp yard (three street lamps, the generator, a number board), the room (the Lustig
// salon redressed by its wall sign: Westinghouse, AEG, Tokyo, Osaka, the clock depot), the post clock, and the two
// pylon lines that stop short of each other with the converter station between them.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "../bridge/build";
import { bed, ctex, cobbleHD, stoneHD, grassHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { FPS } from "./timeline";
import { Clock, postClock, Board } from "../dst/props";
import { buildSalon, Salon, signTex } from "../lustig/props";
import { generator, motor, Lamp, pylon, wire, hut, numTex, socketTex, clockCardTex, sparkTex, Cards } from "./props3d";
import { D0, V3, Lm, Rm, Ck, Py, ROOM_O } from "./story3d";
import type { St3, Person3 } from "./story3d";
type Light = "day" | "golden" | "night";

const LP: Record<Light, LightPreset> = { day: LIGHTS.day, golden: LIGHTS.golden, night: LIGHTS.day };
const LK: Record<Light, WorldLook> = { day: LOOK.day, golden: LOOK.golden, night: LOOK.day };

// ---------------- cast ----------------
const SUIT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#3a2a20", buttons: "#d9d4c8", skin: "#f5c9a0", ...extra });
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** everyone the shots can place, by name */
const OUT: Record<string, Who> = {
  westinghouse: who(SUIT("#2b2f3d", { moustache: "#8a8a92", hair: "#8a8a92", build: "stout", buttons: "#e8c45a" }), 1, "westinghouse"),
  tesla: who(SUIT("#3a3038", { moustache: "#1e1a20", hair: "#1e1a20", skin: "#ecd0b6" }), 2, "tesla"),
  eng0: who(SUIT("#6b4a2f", { hair: "#6b4a2f", moustache: "#6b4a2f" }), 3, "eng0"),
  eng1: who(SUIT("#3f5f4a", { hair: "#2a201a", skin: "#ecd0b6" }), 4, "eng1"),
  eng2: who(SUIT("#4a5a7a", { hair: "#b5462f", moustache: "#b5462f", skin: SKIN }), 5, "eng2"),
  rathenau: who(SUIT("#1d1b22", { moustache: "#d9d4c8", hair: "#d9d4c8", build: "stout", sash: "#e8c45a" }), 6, "rathenau"),
  ger0: who(SUIT("#5a4a6a", { hair: "#d9a441", moustache: "#d9a441" }), 7, "ger0"),
  ger1: who(SUIT("#3a4a3a", { hat: "tophat", moustache: "#4a3020", skin: "#ecd0b6" }), 8, "ger1"),
  ger2: who(SUIT("#6a3a3a", { hat: "bonnet", dress: "#c25a7a", skin: SKIN }), 9, "ger2"),
  la0: who(SUIT("#5a8fc2", { hat: "bonnet", dress: "#5a8fc2", skin: "#f5c9a0" }), 10, "la0"),
  la1: who(SUIT("#8a5a3a", { hat: "fedora", cap: "#5a4a3a", moustache: "#3a2a20" }), 11, "la1"),
  la2: who(SUIT("#d9a441", { hat: "bonnet", dress: "#d9a441", skin: "#c99067" }), 12, "la2"),
  la3: who(SUIT("#3f7d4a", { hat: "cap", cap: "#2f5fb5", skin: "#ecd0b6" }), 13, "la3"),
  worker: who(SUIT("#4a6a9a", { hat: "cap", cap: "#2b2f3d", moustache: "#2a201a", skin: "#c99067", buttons: "#e8c45a" }), 14, "worker"),
  tokyo: who(SUIT("#1d1b22", { hat: "tophat", moustache: "#1e1a20", skin: "#f0d2b0" }), 15, "tokyo"),
  osaka: who(SUIT("#4a3a2a", { hat: "fedora", cap: "#2b2f3d", skin: "#f0d2b0", hair: "#1e1a20" }), 16, "osaka"),
  aegman: who(SUIT("#3a4a6a", { hat: "tophat", moustache: "#d9a441", build: "stout", skin: "#f5c9a0" }), 17, "aegman"),
  geman: who(SUIT("#7a5236", { hat: "fedora", cap: "#7a5236", moustache: "#6b4a2f", skin: SKIN }), 18, "geman"),
};

/** drawing size by distance: [canvas w, h, scale from the 600 x 1000 design] */
const UNLIT = new Map<string, THREE.MeshBasicMaterial>();
/** an unlit face for the number boards: the digits stay white whichever side the sun is on */
const unlit = (key: string, tex: () => THREE.Texture) => { let m = UNLIT.get(key); if (!m) { m = new THREE.MeshBasicMaterial({ map: tex(), color: new THREE.Color(0.9, 0.9, 0.9) }); UNLIT.set(key, m); } return m; };
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
type Pose = { expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; blink?: number; wave?: number; side?: { phase: number; mirror: boolean; stride?: number } };

export class HWorld {
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
  private lamps: Lamp[] = []; private gen: { g: THREE.Group; wheel: THREE.Group }; private sign: Board; private socket: Board;
  private salon: Salon; private mot: { g: THREE.Group; shaft: THREE.Group }; private bulb: Lamp; private bulb2: Lamp; private tgen: { g: THREE.Group; wheel: THREE.Group };
  private rnum: Board; private tclocks: Clock[] = []; private pclock: Clock;
  private west: Lamp[] = []; private east: Lamp[] = []; private hutG: THREE.Group; private b60: Board; private b50: Board;
  private cards: Cards; private sparks: Cards;
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
    // ---- the lamp yard: three street lamps, the generator, a number board, a wall socket on a post ----
    for (const x of [-3, 0, 3]) { const l = new Lamp(3.2, 0.34); l.group.position.set(...Lm(x, 0, 0)); R.add(l.group); this.lamps.push(l); }
    for (let k = 0; k < 2; k++) R.add(wire(V(...Lm(-3 + k * 3, 3.25, 0)), V(...Lm(k * 3, 3.25, 0)), 0.35));
    this.gen = generator(1.9); this.gen.g.position.set(...Lm(-6.8, 0, 0.6)); R.add(this.gen.g);
    R.add(wire(V(...Lm(-6.4, 1.5, 0.6)), V(...Lm(-3, 3.25, 0)), 0.5));
    this.sign = new Board(1.9, 1.2, "num_60", () => numTex("60"), 1.5); this.sign.group.position.set(...Lm(1.55, 2.1, -0.7)); R.add(this.sign.group);
    this.socket = new Board(0.8, 1.0, "wallSocket", socketTex, 1.0); this.socket.group.position.set(...Lm(9, 1.5, 0)); R.add(this.socket.group);
    // ---- the room (Lustig's salon; the wall sign is swapped per shot) ----
    this.salon = buildSalon(R, ROOM_O[0], ROOM_O[1], ROOM_O[2]);
    this.salon.archSign.visible = false;
    this.mot = motor(0.62); this.mot.g.position.set(...Rm(0.5, 0.8, 0.6)); R.add(this.mot.g);
    this.bulb = new Lamp(0.42, 0.13); this.bulb.group.position.set(...Rm(2.2, 0.8, 0.6)); R.add(this.bulb.group);
    this.bulb2 = new Lamp(0.42, 0.13); this.bulb2.group.position.set(...Rm(-1.2, 0.8, 0.6)); R.add(this.bulb2.group);
    this.tgen = generator(0.66); this.tgen.g.position.set(...Rm(0.5, 0.8, 0.6)); R.add(this.tgen.g);
    this.rnum = new Board(1.9, 1.2, "num_60", () => numTex("60")); this.rnum.group.position.set(...Rm(0.5, 2.15, 3.38)); R.add(this.rnum.group);
    for (let k = 0; k < 5; k++) { const c = new Clock(0.24, ["#b5462f", "#2f5fb5", "#3f7d4a", "#d9a441", "#7a5236"][k]); c.group.position.set(...Rm(-1.4 + k * 0.95, 0.8 + 0.27, 0.6)); R.add(c.group); this.tclocks.push(c); }
    // ---- the post clock ----
    const pc = postClock(0.95, 2.5); pc.g.position.set(...Ck(0, 0, 0)); R.add(pc.g); this.pclock = pc.clock;
    // ---- the two lines that never meet: west (60) on +x and east (50) on -x, so that with the cameras on the -z side
    //      west is screen left and east is screen right, as on the maps; the converter station between them ----
    for (const s of [-1, 1]) {
      for (const x of [9, 27]) { const p = pylon(9); p.position.set(...Py(s * x, 0, 0)); R.add(p); }
      for (const [y, dx] of [[7.82, 2.07], [6.56, 2.55]] as const) {
        R.add(wire(V(...Py(s * (9 - dx), y, 0)), V(...Py(s * 1.25, 4.0, 0)), 0.5));
        R.add(wire(V(...Py(s * (9 + dx), y, 0)), V(...Py(s * (27 - dx), y, 0)), 1.1));
        R.add(wire(V(...Py(s * (27 + dx), y, 0)), V(...Py(s * 60, y + 1, 0)), 1.4));
      }
      for (const x of [4.6, 6.2, 7.8]) { const l = new Lamp(2.3, 0.26); l.group.position.set(...Py(s * x, 0, -2.6)); R.add(l.group); (s > 0 ? this.west : this.east).push(l); }
    }
    this.b60 = new Board(1.5, 0.95, "num_60_#2f5fb5_#ffffff", () => numTex("60", "#2f5fb5", "#ffffff"), 1.0); this.b60.group.position.set(...Py(3.4, 1.5, 1.6)); R.add(this.b60.group);
    this.b50 = new Board(1.5, 0.95, "num_50_#c9373a_#ffffff", () => numTex("50", "#c9373a", "#ffffff"), 1.0); this.b50.group.position.set(...Py(-3.4, 1.5, 1.6)); R.add(this.b50.group);
    this.hutG = hut(); this.hutG.position.set(...Py(0, 0, 0)); R.add(this.hutG);
    this.cards = new Cards(R, clockCardTex(), 14, 0.7);
    this.sparks = new Cards(R, sparkTex(), 3, 1.0);
    void ctex; void Batch;
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
    const tw = (i: number, hz: number) => 0.55 + 0.45 * Math.sign(Math.sin(t * Math.PI * 2 * hz + i * 1.7));
    const lk = st.lamps ?? [1, 1, 1];
    this.lamps.forEach((l, i) => l.set((lk[i] ?? lk[0]) * (st.flicker ? tw(i, st.flicker) : 1)));
    this.gen.wheel.rotation.z = -(st.gen ?? t * 5);
    const sg = st.sign;
    if (sg) this.sign.face.material = unlit(`num_${sg.text}_${sg.bg ?? ""}_${sg.fg ?? ""}`, () => numTex(sg.text, sg.bg, sg.fg));
    setPop(this.sign.group, sg ? sg.k ?? 1 : 0);
    const rm = st.room;
    if (rm) {
      const [key, text] = rm.sign;
      const mat = lam(`sign_${key}`, () => ({ map: signTex(key, text, "#2f2a3a", "#e8c45a") }));
      if (this.salon.sign.material !== mat) this.salon.sign.material = mat;
    }
    const mv = rm?.motor;
    this.mot.g.visible = mv !== undefined && mv !== null;
    if (this.mot.g.visible) {
      this.mot.shaft.rotation.x = mv as number;
      const j = rm?.shake ?? 0; this.mot.g.position.set(...Rm(0.5 + 0.02 * j * Math.sin(f * 2.1), 0.8 + 0.015 * j * Math.abs(Math.sin(f * 1.7)), 0.6)); this.mot.g.rotation.z = 0.05 * j * Math.sin(f * 2.6);
    }
    this.tgen.g.visible = rm?.tgen !== undefined; this.tgen.wheel.rotation.z = -(rm?.tgen ?? 0);
    this.bulb.group.visible = rm?.bulb !== undefined; this.bulb.set((rm?.bulb ?? 0) * (rm?.flicker ? tw(0, rm.flicker) : 1));
    this.bulb2.group.visible = rm?.bulb2 !== undefined; this.bulb2.set((rm?.bulb2 ?? 0) * (rm?.flicker2 ? tw(1, rm.flicker2) : 1));
    const rn = rm?.num;
    if (rn) this.rnum.face.material = unlit(`num_${rn.text}_${rn.bg ?? ""}_${rn.fg ?? ""}`, () => numTex(rn.text, rn.bg, rn.fg));
    setPop(this.rnum.group, rn ? rn.k ?? 1 : 0);
    this.tclocks.forEach((c, i) => { c.group.visible = i < (rm?.clocks ?? 0); c.setTime(10.17 + (rm?.clockRate ?? 0) * t * (1 + i * 0.07)); });
    this.pclock.setTime(st.clock ?? 10.17);
    const py = st.pyl ?? { west: 1, east: 1 };
    this.west.forEach((l, i) => l.set(py.west * (py.wturn !== undefined ? (Math.floor(py.wturn) % 3 === i ? 0 : 1) : 1)));
    this.east.forEach((l, i) => l.set(py.east * (py.eturn !== undefined ? (Math.floor(py.eturn) % 3 === i ? 0.0 : 1) : 1)));
    this.hutG.visible = !!py.hut;
    this.b60.group.visible = this.b50.group.visible = py.boards !== false;
    this.sparks.hide();
    if (py.spark) { const sc = py.spark * (1 + 0.25 * Math.sin(f * 2.4)); this.sparks.put(0, V(...Py(0, 4.0, 0)), cam, f * 0.7, sc); }
    if (st.spark) this.sparks.put(1, V(...st.spark.p), cam, f * 0.9, st.spark.s);
    this.cards.hide();
    (st.cards ?? []).forEach((cd, i) => this.cards.put(i, V(...cd.p), cam, cd.spin, cd.s));


    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.eng0 }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, walking: !!q.side }));
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed);
      // side cards are drawn walking toward canvas right; marchers move along world x, so whether they read as moving
      // left or right depends on the camera: flip when world +x points left on screen (camera looking along +z)
      const mirror = !!q.side && (q.side.mirror !== (right.x < 0));
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
        let o: THREE.Object3D | null = m; while (o) { if (!o.visible) return false; o = o.parent; }
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

