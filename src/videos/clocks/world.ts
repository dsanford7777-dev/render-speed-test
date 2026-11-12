// The Los Angeles clocks short's three.js world: the house town and river (the queue stands on the main street), and out
// on the meadow the pulse yard (socket, 60 and 50 boards, knife switch, post clock, drummer), Hoover Dam, the room
// (kitchen / clock depot / power company, by its wall sign), the field of clocks, the refrigerators, the old generator.
// The cast are lit flat cards. update(id, f, camera) poses everything for shot `id` at frame f (pure function of id + f).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, buildTown, Kit } from "../bridge/build";
import { bed, ctex, stoneHD, cobbleHD, grassHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { FPS, SHOTS, Light } from "./timeline";
import { D0, V3, HUG, QUEUE, Yd, L, C, R, Dm, SALON, S, F, Fr, G, SOCKET, B60, B50, ANGELENO, LEVER, CLOCK, SOCKET2, DRUMMER, DRUM, DAM60, TOASTER, BULB, TCLOCK, WORKER, BOSS, GEN, G50, ENGINEER,
  camAt, smooth, clamp01, expo, A, B, M, LOOP_F, walkZ, frontZ, cashX } from "./story";
import { dam, lever, toaster, toastTex, fridge, drum, pulseTex, nameTex, BLUE, RED, GOLD } from "./props";
import { Clock, postClock, Board } from "../dst/props";
import { buildSalon, Salon, signTex, Flyers, cashPile } from "../lustig/props";
import { generator, Lamp, wire, numTex, socketTex, clockCardTex, sparkTex, Cards } from "../hertzlong/props3d";

/** shots whose big face close-up is the point */
const CLOSEUP_OK = new Set<number>([1, 3, 4, 10, 11, 12, 13, 17, 18]);
const LP: Record<Light, LightPreset> = { day: LIGHTS.day, golden: LIGHTS.golden, night: LIGHTS.day };
const LK: Record<Light, WorldLook> = { day: LOOK.day, golden: LOOK.golden, night: LOOK.day };

// ---------------- cast ----------------
const SUIT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#3a2a20", buttons: "#d9d4c8", skin: "#f5c9a0", ...extra });
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
const HUG_ = who(SUIT("#8a5a3a", { hat: "fedora", cap: "#5a4a3a", moustache: "#3a2a20" }), 3, "hugger");
const Q_ = [
  who(SUIT("#5a8fc2", { hat: "bonnet", dress: "#5a8fc2" }), 10, "q0"),
  who(SUIT("#3f7d4a", { hat: "cap", cap: "#2f5fb5", skin: "#ecd0b6" }), 13, "q1"),
  who(SUIT("#d9a441", { hat: "bonnet", dress: "#d9a441", skin: "#c99067" }), 12, "q2"),
  who(SUIT("#6b4a2f", { hat: "tophat", moustache: "#6b4a2f", build: "stout" }), 5, "q3"),
  who(SUIT("#c25a7a", { hat: "bonnet", dress: "#c25a7a", skin: SKIN }), 9, "q4"),
  who(SUIT("#4a5a7a", { hair: "#b5462f", moustache: "#b5462f", skin: SKIN }), 6, "q5"),
];
const ANG_ = who(SUIT("#e0a03a", { hat: "fedora", cap: "#f1e6c8", skin: "#c99067", hair: "#2a201a" }), 21, "angeleno");
const DRUM_ = who(SUIT("#c9373a", { hat: "shako", buttons: "#e8c45a", belt: "#f1efe6", skin: "#f5c9a0" }), 24, "drummer");
const WORK_ = who(SUIT("#4a6a9a", { hat: "cap", cap: "#2b2f3d", moustache: "#2a201a", skin: "#c99067", buttons: "#e8c45a" }), 14, "worker");
const BOSS_ = who(SUIT("#2b2f3d", { hat: "tophat", moustache: "#8a8a92", hair: "#8a8a92", build: "stout", buttons: "#e8c45a" }), 29, "boss");
const ENG_ = who(SUIT("#5a4a6a", { hair: "#d9d4c8", moustache: "#d9d4c8", skin: "#ecd0b6" }), 31, "engineer");

/** drawing size by distance: [canvas w, h, scale from the 600 x 1000 design] */
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
/** march = front-view walk/run phase; side = side-view run (dir = the way they move, so the card faces it); pass = may cross the frame edges */
type Pose = { expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; blink?: number; sit?: boolean; sweat?: boolean; march?: number; pass?: boolean; side?: { phase: number; dir: V3; stride?: number } };

// ---------------- world ----------------
export class CWorld {
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
  private socket: Board; private socket2: Board; private b60: Board; private b50: Board; private lev: { g: THREE.Group; arm: THREE.Group };
  private pclock: Clock; private drumP: { g: THREE.Group; sticks: THREE.Group[] }; private damG: THREE.Group; private dam60: Board;
  private salon: Salon; private toast: { g: THREE.Group; toast: THREE.Mesh[] }; private bulb: Lamp; private tclocks: Clock[] = [];
  private hugClock: Clock; private cards: Cards; private field: Cards; private sparks: Cards; private pulses: Cards; private toastCard: Cards;
  private fridges: THREE.Group[] = []; private gen: { g: THREE.Group; wheel: THREE.Group }; private g50: Board; private g60: Board;
  private bills: Flyers; private cash: THREE.Group; private fixed: Board;
  private lastPeople: { name: string; p: V3; walking: boolean; sit?: boolean }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    const R0 = this.root;
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
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R0.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R0.add(this.sunDisc);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R0.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60, w = 130 + (i % 4) * 30;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R0.add(m);
    }
    // ---- ground, river, quays, main street ----
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
      b.add(boxGeo(V(-600, D0, s < 0 ? -30.5 : 30), V(600, D0 + 0.75, s < 0 ? -30 : 30.5), 2), cope);
    }
    b.add(quadUp(-900, 900, -30, 30, 225, 7.5, -0.6 - D0), lam("bed", () => ({ map: bed() })));
    b.build(R0);
    buildTown(R0, kit, []);
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
    const wm = new THREE.Mesh(quadUp(-900, 900, -30, 30, 1, 1, -D0), waterM); wm.receiveShadow = true; R0.add(wm);
    // ---- the pulse yard: wall socket, the blue 60 board ----
    this.socket = new Board(0.8, 1.0, "wallSocket", socketTex, 1.05); this.socket.group.position.set(...SOCKET); R0.add(this.socket.group);
    this.b60 = new Board(2.4, 1.5, "num_60_blue", () => numTex("60", BLUE, "#ffffff"), 1.85); this.b60.group.position.set(...B60); R0.add(this.b60.group);
    // ---- the Los Angeles corner: the red 50 board (flips to 60), the knife switch, a palm ----
    this.b50 = new Board(1.9, 1.2, "num_50_red", () => numTex("50", RED, "#ffffff"), 1.7); this.b50.group.position.set(...B50); R0.add(this.b50.group);
    this.lev = lever(); this.lev.g.position.set(...LEVER); R0.add(this.lev.g);
    R0.add(palm(L(-3.4, 0, 2.6), 6.5), palm(L(5.6, 0, 3.4), 5.2));
    // ---- the post clock, wired to a socket ----
    const pc = postClock(0.95, 2.5); pc.g.position.set(...C(0, 0, 0)); R0.add(pc.g); this.pclock = pc.clock;
    this.socket2 = new Board(0.8, 1.0, "wallSocket", socketTex, 0.7); this.socket2.group.position.set(...SOCKET2); R0.add(this.socket2.group);
    R0.add(wire(V(...C(-3.4, 1.72, 0.02)), V(...C(-0.1, 2.69, 0.16)), 0.25));
    // ---- the drummer's drum ----
    this.drumP = drum(); this.drumP.g.position.set(...DRUM); R0.add(this.drumP.g);
    // ---- Hoover Dam ----
    this.damG = dam(); this.damG.position.set(...Dm(0, 0, 0)); R0.add(this.damG);
    this.dam60 = new Board(5.2, 3.2, "num_60_blue", () => numTex("60", BLUE, "#ffffff")); this.dam60.group.position.set(...DAM60); R0.add(this.dam60.group);
    // ---- the room: kitchen table things, the depot's clocks, the power company's cash ----
    this.salon = buildSalon(R0, SALON[0], SALON[1], SALON[2]); this.salon.archSign.visible = false;
    this.toast = toaster(); this.toast.g.position.set(...TOASTER); R0.add(this.toast.g);
    this.bulb = new Lamp(0.42, 0.13); this.bulb.group.position.set(...BULB); R0.add(this.bulb.group);
    for (let k = 0; k < 5; k++) { const c = new Clock(0.24, ["#b5462f", "#2f5fb5", "#3f7d4a", "#d9a441", "#7a5236"][k]); c.group.position.set(...S(-1.4 + k * 0.95, 0.8 + 0.27, 0.6)); R0.add(c.group); this.tclocks.push(c); }
    this.fixed = new Board(1.5, 0.5, "cname_fixed", () => nameTex("fixed", "FIXED: 60", "#3f9a5a", "#ffffff", 1024, 340)); this.fixed.group.position.set(...S(0.5, 2.25, 3.38)); R0.add(this.fixed.group);
    this.cash = cashPile(); R0.add(this.cash);
    this.bills = new Flyers(R0, "bill", 10, 0.24);
    // ---- clocks: the one he hugs, cut-out cards for the ones carried, thrown and laid out in the field ----
    this.hugClock = new Clock(0.27, "#b5462f"); R0.add(this.hugClock.group);
    this.cards = new Cards(R0, clockCardTex(), 14, 0.7);
    this.field = new Cards(R0, clockCardTex(), 16 * 9, 1.15);
    this.sparks = new Cards(R0, sparkTex(), 2, 1.0);
    this.pulses = new Cards(R0, pulseTex(), 6, 0.22);
    this.toastCard = new Cards(R0, toastTex(), 1, 0.3);
    // ---- the refrigerators ----
    for (let k = 0; k < 16; k++) { const fr = fridge(); fr.position.set(...Fr(-10.5 + k * 1.5, 0, (k % 2) * 0.12)); R0.add(fr); this.fridges.push(fr); }
    // ---- the old generator and the number somebody picked ----
    this.gen = generator(1.9); this.gen.g.position.set(...GEN); R0.add(this.gen.g);
    this.g50 = new Board(1.9, 1.2, "num_50_red", () => numTex("50", RED, "#ffffff"), 1.7); this.g50.group.position.set(...G50); R0.add(this.g50.group);
    this.g60 = new Board(1.15, 0.72, "num_60_blue", () => numTex("60", BLUE, "#ffffff")); this.g60.group.position.set(...G(0.95, 1.45, 0.1)); R0.add(this.g60.group);
    void GOLD; void ctex; void cobbleHD;
  }

  private shotSun(id: number, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const s = SHOTS[id - 1];
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) { const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LP[s.light], K = LK[s.light];
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- lights ----
    const sunDir = this.shotSun(id, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    if (s.light === "golden") Rr = Math.max(Rr, 30);
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
    this.sunDisc.visible = s.light === "golden";
    if (this.sunDisc.visible) { this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900); this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7))); }
    for (let i = 0; i < this.clouds.length; i++) { const m = this.clouds[i]; m.lookAt(cam.position.x, m.position.y, cam.position.z); (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[s.light][i % 4]; }
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;

    // ---- props per shot ----
    const m = M(), loop = id === 18 && f >= LOOP_F(), hookish = id === 1 || loop;
    const fwd = cam.getWorldDirection(V(0, 0, 0)), rightV = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), upV = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 1);
    const at = (p: V3) => V(p[0], p[1], p[2]);
    /** a point just in front of the lens, offset sideways/up (metres), for things thrown at the camera */
    const lens = (dx: number, dy: number, ahead = 0.03) => cam.position.clone().addScaledVector(fwd, ahead).addScaledVector(rightV, dx).addScaledVector(upV, dy);
    const beat = (hz: number) => 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * hz);
    this.cards.hide(); this.field.hide(); this.sparks.hide(); this.pulses.hide(); this.toastCard.hide(); this.bills.hide();
    // the clock he hugs: against his chest, hands racing once the camera is under him
    this.hugClock.group.visible = hookish;
    if (hookish) { const ff = loop ? 0 : f; this.hugClock.group.position.set(HUG[0], D0 + 0.98, HUG[2] - 0.3); this.hugClock.setTime(10.17 + (ff >= m.clocks - 2 ? (ff - (m.clocks - 2)) / FPS * 2.5 : ff / FPS * 0.2)); }
    // the rest of the queue hold cut-out clocks in front of them
    if (hookish) QUEUE.forEach((q, k) => this.cards.put(k, V(q[0], q[1] + 0.98, q[2] - 0.28), cam, 0, 0.8));
    // the socket's pulse: a spark that beats on the plate
    if (id === 2) this.sparks.put(0, V(SOCKET[0], SOCKET[1], SOCKET[2] - 0.1), cam, f * 0.5, 0.14 + 0.2 * beat(3));
    // boards: the Los Angeles 50 flips to 60 when the switch is thrown
    const flipped = id === 6 && f >= m.switched;
    this.b50.setFace(flipped ? "num_60_blue" : "num_50_red", () => (flipped ? numTex("60", BLUE, "#ffffff") : numTex("50", RED, "#ffffff")));
    this.b50.group.scale.setScalar(flipped ? 1 + 0.16 * Math.sin(clamp01((f - m.switched) / 8) * Math.PI) : 1);
    this.b50.group.rotation.y = id === 6 ? Math.PI * 2 * expo((f - (m.switched - 4)) / 8) : 0;
    this.lev.arm.rotation.z = id === 6 ? 0.75 - 1.5 * expo((f - (m.switched - 6)) / 6) : 0.75;
    if (id === 6 && f >= m.switched - 1 && f < m.switched + 9) this.sparks.put(0, V(LEVER[0], LEVER[1] + 1.75, LEVER[2] - 0.2), cam, f * 0.8, 0.9);
    // the room's wall sign and what's on the table
    const room = id === 7 || id === 8 ? "kitchen" : id === 13 ? "depot" : "power";
    this.salon.sign.material = lam(`sign_c_${room}`, () => ({ map: signTex(`c_${room}`, room === "kitchen" ? "HOME SWEET HOME" : room === "depot" ? "CLOCK DEPOT" : "THE POWER COMPANY", "#2f2a3a", "#e8c45a") }));
    this.toast.g.visible = id === 7;
    const pop = id === 7 ? expo((f - (m.toastMind - 3)) / 5) : 0;
    this.toast.toast[0].position.y = 0.2 + 0.11 * pop; this.toast.toast[1].position.y = 0.2 + 0.11 * pop; this.toast.toast[1].visible = !(id === 7 && f >= m.toastMind);
    if (id === 7 && f >= m.toastMind && f < m.light - 2) {
      const u = clamp01((f - m.toastMind) / 9), p = at([TOASTER[0], TOASTER[1] + 0.4, TOASTER[2]]).lerp(lens(0.04, 0.02, 0.8), u); p.y += 0.25 * Math.sin(Math.PI * u);
      if (u < 1) this.toastCard.put(0, p, cam, u * 5, 0.8 + 0.3 * u);
    }
    this.bulb.group.visible = id === 7; this.bulb.set(id === 7 && f >= m.light - 2 ? 1.1 : 0.5);
    const nClocks = id === 8 ? 1 : id === 13 ? 5 : 0;
    this.tclocks.forEach((c, i) => { c.group.visible = id === 8 ? i === 2 : i < nClocks; c.setTime(10.17 + (id === 8 ? 5 : 0.4) * ((f - A(id)) / FPS) * (1 + i * 0.07)); });
    // "clocks minded": one jumps off the table at the lens
    if (id === 8 && f >= m.minded) { const u = clamp01((f - m.minded) / 8), p = at(TCLOCK).lerp(lens(0, 0.08, 0.75), u); if (u < 1) this.cards.put(0, p, cam, u * 3, 0.5 + 1.4 * u); }
    // the depot: mended clocks fly back out at the lens; the FIXED board pops up on "rebuilt"
    this.fixed.group.visible = id === 13 && f >= m.rebuilt;
    if (this.fixed.group.visible) this.fixed.group.scale.setScalar(1 + 0.2 * Math.sin(clamp01((f - m.rebuilt) / 8) * Math.PI));
    if (id === 13 && f >= m.sent - 2 && f < m.within - 2) for (let k = 0; k < 10; k++) {
      const u = (f - (m.sent + k * 2.2)) / 14;
      if (u <= 0 || u >= 1) continue;
      const x = -1.4 + (k * 1.7) % 3.9, p = at(S(x, 1.2, 0.6)).lerp(lens(((k % 3) - 1) * 0.3, (((k + 1) % 3) - 1) * 0.25 + 0.1, 0.8), u); p.y += 0.5 * Math.sin(Math.PI * u);
      this.cards.put(k, p, cam, (k % 2 ? 1 : -1) * u * 5, 0.7 + 0.9 * u);
    }
    // the post clock: steady while the pulses are counted, racing once the band speeds up
    const fast = id === 11 && f >= m.theClock - 2;
    this.pclock.setTime(10.17 + (fast ? 3.2 * (f - (m.theClock - 2)) / FPS : 0.25 * Math.floor(((f - A(id)) / FPS) * 3) / 3));
    if (id === 9 || fast) for (let k = 0; k < 6; k++) {
      const u = ((((f - A(id)) / FPS) * (fast ? 2.6 : 1.1) + k / 6) % 1 + 1) % 1;
      const a = V(...C(-3.4, 1.72, -0.06)), b = V(...C(-0.1, 2.69, 0.08)), p = a.lerp(b, u); p.y -= 0.25 * 4 * u * (1 - u) * 0.5;
      this.pulses.put(k, p, cam, 0, 1);
    }
    // the drummer's sticks: on the beat, then far too fast
    const hz = id === 11 ? 7 : 2.2;
    this.drumP.sticks.forEach((s, i) => { s.rotation.x = -0.5 - 0.7 * Math.max(0, Math.sin(t * Math.PI * 2 * hz + i * Math.PI)); s.rotation.z = (i ? -1 : 1) * 0.25; });
    // the field of clocks pops up row by row; the refrigerators rock on their feet
    if (id === 14 || id === 15) for (let j = 0; j < 9; j++) for (let i = 0; i < 16; i++) {
      const k = j * 16 + i, born = id === 14 ? A(14) + 6 + j * 3 + (i % 4) : -1e9, u = clamp01((f - born) / 5);
      if (u <= 0) continue;
      this.field.put(k, V(...F(-12 + 1.6 * i + (j % 2) * 0.5, 0.62, j * 1.75)), cam, 0.12 * Math.sin(k * 1.3), 0.4 + 0.6 * u);
    }
    this.fridges.forEach((fr, k) => { fr.rotation.z = id === 16 ? 0.05 * Math.sin(t * 9 + k * 0.9) : 0; });
    // the bill: notes fly at the lens on "34"; the cash slides away from the boss on "third"
    this.cash.visible = id === 17;
    if (id === 17) { this.cash.position.set(...S(cashX(f), 0.8, 0.55)); this.cash.scale.set(0.6, 0.6, 0.6); }
    if (id === 17 && f >= m.n34 && f < m.third - 2) this.bills.list.slice(0, 8).forEach((_, k) => {
      const u = (f - (m.n34 + k)) / 9;
      if (u < 0 || u > 1.05) return;
      const p = at(S(1.4, 1.1, 1.3)).lerp(lens(((k % 3) - 1) * 0.12, (((k + 1) % 3) - 1) * 0.1), u); p.y += 0.2 * Math.sin(Math.PI * Math.min(1, u));
      this.bills.put(k, p, cam, k * 0.9 + u * 4);
    });
    // the old generator turns; the 60 it could have been pops up on the last word
    this.gen.wheel.rotation.z = -t * 5;
    this.g60.group.visible = id === 18 && !loop && f >= m.p60 - 2;
    if (this.g60.group.visible) this.g60.group.scale.setScalar(1 + 0.2 * Math.sin(clamp01((f - (m.p60 - 2)) / 8) * Math.PI));

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const people: { w: Who; p: V3; pose: Pose }[] = [];
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    const add = (w: Who, p: V3, pose: Pose) => people.push({ w, p, pose });
    const queue = () => QUEUE.forEach((q, k) => add(Q_[k], q, { expr: (["stern", "nervous", "neutral", "stern", "pained", "neutral"] as Expr[])[k], blink: blink(Q_[k].seed), pass: true }));
    switch (loop ? 1 : id) {
      case 1: {
        const ff = loop ? 0 : f, wide = ff >= m.hand - 2 && ff < m.clocks - 2;
        add(HUG_, HUG, { expr: ff >= m.clocks - 2 ? "pained" : "nervous", blink: loop || ff < 3 ? 0 : blink(3), sweat: !wide, pass: wide });
        if (ff < m.clocks - 2) queue();
        break;
      }
      case 3: if (f >= m.los - 4 && f < m.fifty - 2) add(ANG_, ANGELENO, { expr: "smile", blink: blink(21), pass: true }); break;
      case 4: add(ANG_, ANGELENO, { expr: f >= m.cared - 2 ? "whistle" : "smile_closed", blink: 0, headTilt: f >= m.cared - 2 ? 0.1 : 0 }); break;
      case 6: break;
      case 10: add(DRUM_, DRUMMER, { expr: f >= m.following - 2 ? "smile_closed" : "smile", blink: blink(24), pass: true }); break;
      case 11: if (f < m.theClock - 2) add(DRUM_, DRUMMER, { expr: "pained", blink: 0, sweat: true, pass: true }); break;
      case 12:
        if (f < m.depots - 2) [0, 1, 2].forEach((k) => {
          const z = walkZ(f) + 1.5 * k, ph = ((((140 - z) / 1.6) % 1) + 1) % 1;
          add(Q_[k], [0.8 + (k % 2) * 0.3, D0, z], { expr: k === 1 ? "nervous" : "stern", blink: 0, side: { phase: ph, dir: [0, 0, -1], stride: 0.8 } });
          this.cards.put(k, V(1.0 + (k % 2) * 0.3, D0 + 1.1 + 0.03 * Math.sin(z * 3.9), z - 0.42), cam, 0, 0.62);
        });
        else [0, 1, 2].forEach((k) => {
          const z = frontZ(f) + 1.6 * k, x = 0.6 + [0, -0.9, 0.9][k];
          add(([HUG_, Q_[0], Q_[1]])[k], [x, D0, z], { expr: k ? "stern" : "pained", blink: 0, march: (t * 2.2 + k * 0.33) % 1, pass: true });
          this.cards.put(k, V(x, D0 + 0.98, z - 0.28), cam, 0.06 * Math.sin(t * 13 + k), 0.8);
        });
        break;
      case 13:
        add(WORK_, WORKER, { expr: f >= m.sent - 2 && f < m.within - 2 ? "shock" : f >= m.rebuilt ? "grin" : "stern", blink: blink(14), pass: true });
        if (f >= m.within - 2) { add(Q_[0], S(-3.4, 0, 2.2), { expr: "relief", blink: blink(10), pass: true }); add(Q_[2], S(4.2, 0, 2.2), { expr: "grin", blink: blink(12), pass: true }); }
        break;
      case 17:
        if (f < m.third - 2) add(BOSS_, BOSS, { expr: f >= m.n34 ? "shock" : "stern", blink: blink(29) });
        else if (f >= m.made - 2) add(BOSS_, BOSS, { expr: "pained", blink: 0, sweat: true });
        break;
      case 18:
        if (f < m.someone - 2) add(ENG_, ENGINEER, { expr: "smile", blink: blink(31), pass: true });
        else if (f < m.p50 - 2) add(ENG_, ENGINEER, { expr: "whistle", blink: 0 });
        break;
    }
    this.lastPeople = people.map((q) => ({ name: q.w.key, p: q.p, walking: !!q.pose.side || q.pose.march !== undefined || !!q.pose.pass, sit: !!q.pose.sit }));
    let ai = 0;
    for (const q of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, chh, k] = tier(d), a = this.actor(ai++), Pz = q.pose;
      // side cards are drawn facing canvas right: flip them when they move toward screen left
      const mirror = !!Pz.side && Pz.side.dir[0] * right.x + Pz.side.dir[2] * right.z < 0;
      const light = mirror ? Math.PI - lightA : lightA;
      const key = Pz.side
        ? `S|${q.w.key}|${Pz.expr}|${Math.round(Pz.side.phase * 16)}|${Pz.blink ?? 0}|${light.toFixed(2)}`
        : `F|${q.w.key}|${Pz.expr}|${Pz.look ?? 0}|${(Pz.headTilt ?? 0).toFixed(2)}|${Pz.facing ?? 0}|${Pz.blink ?? 0}|${Pz.sit ? 1 : 0}|${Pz.march === undefined ? -1 : Math.round(Pz.march * 16)}|${light.toFixed(2)}`;
      a.r = this.pool.req(key, cw, chh, k, (p: Pen) => Pz.side
        ? bodySide(p, q.w.o, { mode: "march", phase: Math.round(Pz.side!.phase * 16) / 16, expr: Pz.expr, blink: Pz.blink, stride: Pz.side!.stride ?? 0.8, stomp: 0.6, light, seed: q.w.seed })
        : bodyFront(p, q.w.o, { mode: Pz.sit ? "sit" : Pz.march !== undefined ? "march" : "stand", phase: Pz.march === undefined ? 0 : Math.round(Pz.march * 16) / 16, expr: Pz.expr, look: Pz.look ?? 0, headTilt: Pz.headTilt ?? 0, facing: Pz.facing ?? 0, blink: Pz.blink, light, seed: q.w.seed }));
      a.mesh.visible = true;
      a.mesh.position.set(...q.p);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      a.mesh.scale.set(mirror ? -1 : 1, 1, 1);
      a.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- effects: contact shadows under everyone standing ----
    const fxl: { key: string; cw: number; ch: number; draw: (p: Pen) => void; pos: V3; w: number; h: number; flat?: boolean; soft?: boolean }[] = [];
    const cc = "#8a8ab0";
    // sweat drop beside the head (screen right, a little toward the lens), bobbing
    for (const q of people) if (q.pose.sweat) {
      const hy = q.p[1] + (q.pose.sit ? 0.78 : 1.58) + 0.02 * Math.sin(t * 6), sp = V(q.p[0], hy, q.p[2]).addScaledVector(right, 0.24);
      const toCam = cam.position.clone().sub(sp).normalize(); sp.addScaledVector(toCam, 0.12);
      fxl.push({ key: "sweatDrop", cw: 128, ch: 192, draw: sweatDrop, pos: [sp.x, sp.y, sp.z], w: 0.09, h: 0.135 });
    }
    for (const q of people) if (!q.pose.sit) fxl.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), pos: [q.p[0], q.p[1] + 0.022, q.p[2]], w: 0.55, h: 0.42, flat: true });


    let fi = 0;
    for (const p of fxl) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(...p.pos), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft); e.mesh.visible = true; e.mesh.position.set(...p.pos);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, 0); else e.mesh.quaternion.copy(cam.quaternion);
      e.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of this.actors) if (a.mesh.visible) a.bind();
    for (const e of this.fxs) if (e.mesh.visible) e.bind();
    return focus;
  }
  /** what must be clearly in shot, and when: [name, world point, radius, from frame, to frame] */
  private subjects(id: number): [string, THREE.Vector3, number, number, number, THREE.Object3D?][] {
    const s = SHOTS[id - 1], m = M();
    switch (id) {
      case 1: return [["his clock", V(HUG[0], D0 + 0.98, HUG[2] - 0.34), 0.05, 2, m.hand - 4, this.hugClock.group]];
      case 2: return [["wall socket", V(SOCKET[0], SOCKET[1], SOCKET[2] - 0.05), 0.1, s.a + 8, s.b, this.socket.group]];
      case 3: return [["60 board", this.b60.pos(), 0.2, s.a + 10, m.los - 6, this.b60.group], ["50 board", this.b50.pos(), 0.2, m.fifty + 6, s.b, this.b50.group]];
      case 5: return [["dam 60 board", this.dam60.pos(), 0.3, m.dam60 + 6, s.b, this.dam60.group]];
      case 6: return [["knife switch", V(LEVER[0], LEVER[1] + 1.5, LEVER[2] - 0.1), 0.2, s.a + 8, m.switched - 3, this.lev.g], ["flipped board", this.b50.pos(), 0.2, m.switched + 8, s.b, this.b50.group]];
      case 7: return [["toaster", V(TOASTER[0], TOASTER[1] + 0.15, TOASTER[2] - 0.1), 0.05, s.a + 12, m.toastMind - 2, this.toast.g], ["light bulb", this.bulb.top(), 0.1, m.light + 6, s.b, this.bulb.group]];
      case 8: return [["table clock", this.tclocks[2].facePos(), 0.05, s.a + 8, m.minded - 1, this.tclocks[2].group]];
      case 9: return [["post clock", V(...CLOCK), 0.3, s.a + 6, m.counts - 4]];
      case 11: return [["post clock", V(...CLOCK), 0.3, m.theClock + 6, s.b]];
      case 16: return [["refrigerator", V(...Fr(0, 1.0, -0.4)), 0.2, m.fridges + 6, s.b, this.fridges[7]]];
      case 17: return [["cash", V(...S(cashX(m.third + 10), 0.95, 0.55)), 0.2, m.third + 10, m.third + 10, this.cash]];
      case 18: return [["50 board", this.g50.pos(), 0.2, m.p50 + 6, LOOP_F() - 1, this.g50.group]];
      default: return [];
    }
  }

  /** framing checks for this frame (call right after update). Pure measurement, no drawing. */
  qa(id: number, f: number, cam: THREE.PerspectiveCamera): string[] {
    const out: string[] = [], right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), p = new THREE.Vector3();
    // fraction of a camera-facing box that is inside the frame (x, y in NDC); -1 when part of it is behind the lens
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
      // seated cards draw the head ~0.8 m lower than standing ones (legs folded under the torso)
      const dy = q.sit ? -0.8 : 0, head = box(q.p, -0.27, 0.27, 1.16 + dy, 1.84 + dy), body = box(q.p, -0.3, 0.3, 0.05, 1.16 + dy);
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      // people walking through a street may enter and leave at the sides; nobody may be cut at the top or bottom
      else if (head.frac > 0.02 && head.frac < 0.97 && (!q.walking || (head.vcut && head.inX))) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12) out.push(`${q.name}: body in shot without the head`);
      if (head.frac > 0.02 && head.h > 1.6 && !CLOSEUP_OK.has(id)) out.push(`${q.name}: face fills the screen`);
    }
    for (const [name, at, r, a, b, own] of this.subjects(id)) {
      if (f < a || f > b) continue;
      p.copy(at).project(cam);
      if (p.z > 1 || Math.abs(p.x) > 0.9 || Math.abs(p.y) > 0.9) { out.push(`${name}: not in shot`); continue; }
      // painted numbers and lines must not sit under the subtitles (caption band around 61% down the frame)
      if (/mark|line/.test(name) && Math.abs(p.y + 0.22) < 0.1 && Math.abs(p.x) < 0.55) out.push(`${name}: under the subtitles`);
      const dir = at.clone().sub(cam.position), dist = dir.length();
      this.ray.set(cam.position, dir.normalize()); this.ray.far = dist; this.ray.layers.set(0);
      const hit = this.ray.intersectObject(this.root, true).find((h) => {
        const m = h.object as THREE.Mesh, mat = m.material as THREE.Material;
        let o: THREE.Object3D | null = m; while (o) { if (!o.visible || o === own) return false; o = o.parent; }
        return !(Array.isArray(mat) ? false : mat.transparent || (mat as THREE.Material & { alphaTest?: number }).alphaTest > 0) && h.object !== this.sky;
      });
      if (hit && hit.distance < dist - r) out.push(`${name}: hidden behind something ${(dist - hit.distance).toFixed(2)} m in front of it`);
    }
    return out;
  }
}
/** cartoon sweat drop: light blue teardrop, ink outline, white glint */
const sweatDrop = (p: Pen) => {
  const g = p.g; g.beginPath(); g.moveTo(64, 14); g.quadraticCurveTo(118, 110, 108, 138); g.arc(64, 132, 44, 0.15, Math.PI - 0.15); g.quadraticCurveTo(10, 110, 64, 14); g.closePath();
  g.fillStyle = "#9fd3f5"; g.fill(); g.lineWidth = 10; g.strokeStyle = "#241726"; g.stroke();
  g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(48, 128, 9, 18, 0.3, 0, Math.PI * 2); g.fill();
};
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


/** a palm: leaning trunk and a fan of fronds */
const palm = (p: V3, h: number) => {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, h, 10), lam("palmTrunk", () => ({ color: "#a8845a" }))); trunk.position.y = h / 2; trunk.rotation.z = 0.06;
  g.add(trunk);
  for (let k = 0; k < 9; k++) {
    const fr = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 0.5), lam("palmFrond", () => ({ color: "#4f9a4a" })));
    const a = (k / 9) * Math.PI * 2; fr.position.set(Math.cos(a) * 1.15 - 0.06 * h * 0.3, h - 0.25, Math.sin(a) * 1.15); fr.rotation.set(0, -a, -0.45);
    g.add(fr);
  }
  g.position.set(...p); g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  return g;
};
