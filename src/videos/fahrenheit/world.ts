// The Fahrenheit short's three.js world: the bridge short's painted town and river (no bridge), an open-roofed
// glassblower's workshop out on the meadow, a sailing ship, a 1975 GO METRIC! banner on the quay, and the cast as lit
// flat cards. update(id, f, camera) poses everything for shot `id` at frame f (a pure function of id + f).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, buildTown, Kit } from "../bridge/build";
import { bed, ctex, stoneHD, cobbleHD, grassHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { FPS, SHOTS, Light, wordAt, SEG_TIMES } from "./timeline";
import { D0, SHOP, S, V3, camAt, SIGN, SHIP_Z, shipX, BANNER, smooth, clamp01 } from "./story";
import { buildShop, Shop, ship, shopSignTex, bannerTex, paperTex } from "./props";

// ---------------- night look (the explanation after "You see") ----------------
export const NIGHT: LightPreset = {
  az: 35, el: 58,
  lit: [0.62, 0.72, 1.18], shade: [0.1, 0.12, 0.27], lift: [0.03, 0.05, 0.13], lambert: 0.35, sideK: 0.84, term: 0.2,
  charTint: [0.74, 0.8, 1.08], charShade: 0.86, charGrad: 0.1, bodyGrad: 0.22, sideTint: [0.78, 0.82, 1.0],
  blob: [0.6, 0.62, 0.8], actorShadow: false,
  top: "#0f1b3d", hor: "#2a3f73", skyCurve: [0.0, 0.5, 0.6], fog: "#22325e", fogNear: 30, fogFar: 260, sunDisc: "#000000",
  sunCol: "#a9c0ff", sunI: 1.6, sky: "#2a3f73", ground: "#1a1f33", hemiI: 0.35,
  bias: -0.00025, normalBias: 0.015,
};
export const NIGHT_LOOK: WorldLook = {
  sky: { c: ["#2c4277", "#253a6d", "#1d2f5e", "#162650", "#0e1a3d"], e: [0, 3, 8, 16, 40] },
  water: { near: "#16345e", mid: "#122b52", far: "#1c3a6a", crest: "#4f7cc0", trough: "#0b1a38", glint: "#c9d8ff", shade: [0.5, 0.56, 0.72] },
  cloud: { lit: "#6f86c4", mid: "#4d639f", shade: "#33467c" },
  bounce: [0, 0, 0],
  sat: 1.0,
};
/** shots whose big face close-up is the point (the deadpan ending) */
const CLOSEUP_OK = new Set([13]);
const LP: Record<Light, LightPreset> = { day: LIGHTS.day, golden: LIGHTS.golden, night: NIGHT };
const LK: Record<Light, WorldLook> = { day: LOOK.day, golden: LOOK.golden, night: NIGHT_LOOK };

// ---------------- cast ----------------
export const FAHRENHEIT: Outfit = { jacket: "#6b4a2f", pants: "#3b3f52", boots: "#3a2a20", hat: "hair", hair: "#eee8dc", buttons: "#e8c45a", skin: SKIN };
export const HELPER: Outfit = { jacket: "#3f6fb5", pants: "#5a4a3a", boots: "#4a3426", hat: "cap", cap: "#c0353a", skin: "#f5c9a0" };
const SEVENTIES: Outfit[] = [
  { jacket: "#d9822b", pants: "#3b5b9a", boots: "#4a3426", hat: "hair", hair: "#5a3b2a", skin: "#f5c9a0" },
  { jacket: "#2f8f8a", pants: "#7a4b2a", boots: "#2a201a", hat: "hair", hair: "#2a201a", skin: "#c99067" },
  { jacket: "#d4a72c", pants: "#5a3b2a", boots: "#4a3426", hat: "cap", cap: "#2f5fb5", skin: SKIN },
  { jacket: "#8c3b4a", pants: "#3b5b9a", boots: "#f4f1ea", hat: "hair", hair: "#d9a441", skin: "#ecd0b6" },
  { jacket: "#7a4b2a", pants: "#d9822b", boots: "#2a201a", hat: "hair", hair: "#4a3020", skin: "#f5c9a0", moustache: "#4a3020" },
  { jacket: "#5a8fc2", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#2a201a", skin: "#c99067" },
];
const FOLK1724: Outfit[] = [
  { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "tophat", skin: SKIN },
  { jacket: "#5d7a3a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#d9a441", skin: "#f5c9a0" },
  { jacket: "#2f5f6a", pants: "#3b3f52", boots: "#4a3426", hat: "tophat", skin: "#ecd0b6" },
];
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
const F_ = who(FAHRENHEIT, 3, "fahr"), H_ = who(HELPER, 5, "help");

/** drawing size by distance: [canvas w, h, scale from the 600 x 1000 design] */
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
type Pose = { expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; blink?: number; side?: { phase: number; mirror: boolean; stride?: number } };

// ---------------- world ----------------
export class FWorld {
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
  private shop: Shop; private ship: THREE.Group; private banner: THREE.Mesh;
  private lastPeople: { name: string; p: V3 }[] = [];
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
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, NIGHT_LOOK.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60, w = 130 + (i % 4) * 30;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
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
    // ---- workshop out on the meadow ----
    this.shop = buildShop(R, SHOP[0], SHOP[1], SHOP[2]);
    // ---- the glassblower's sign on the main street (far bank, west row, fronts at x = -6) ----
    const sign = new THREE.Group();
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), lam("shopSign", () => ({ map: shopSignTex() })));
    board.rotation.y = Math.PI; board.position.set(...SIGN);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.96, 0.05), lam("signWood", () => ({ color: "#5a3b2a" }))); back.position.set(SIGN[0], SIGN[1], SIGN[2] + 0.03);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.07, 0.07), lam("ironHandle", () => ({ color: "#4a4e5a" }))); arm.position.set(-5.05, SIGN[1] + 0.55, SIGN[2]);
    sign.add(board, back, arm); sign.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); R.add(sign);
    // ---- ship + banner ----
    this.ship = ship(); R.add(this.ship);
    const bg = new THREE.PlaneGeometry(5.4, 1.35, 16, 2);
    this.banner = new THREE.Mesh(bg, lam("goMetric", () => ({ map: bannerTex(), side: THREE.DoubleSide })));
    this.banner.position.set(...BANNER); this.banner.castShadow = true; this.banner.receiveShadow = true; R.add(this.banner);
    for (const sx of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 4.2, 8), lam("poleWood", () => ({ color: "#7a5236" })));
      p.position.set(BANNER[0] + sx * 2.85, D0 + 2.6, BANNER[2]); p.scale.y = 5.2 / 4.2; p.castShadow = true; R.add(p);
    }
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
    const sh = this.shop, night = s.light === "night";
    for (const o of sh.night) o.visible = night;
    sh.furnaceGlow.color.setRGB(night ? 4.5 : 3.2, night ? 1.9 : 1.4, night ? 0.5 : 0.4);
    sh.candle.flame.scale.set(1, 1 + 0.12 * Math.sin(t * 23), 1);
    // hero board: 0 on "zero", 32 and 96 painted on as they are said
    const fZero = wordAt(4, "zero"), f32 = wordAt(6, "32"), f96 = wordAt(6, "96");
    const glowFor = (f0: number) => f >= f0 && f < f0 + 24;
    if (id <= 4) { sh.hero.setLabels([]); sh.hero.setValue(64); }
    else if (id === 5) { sh.hero.setLabels(f >= fZero ? ["0"] : [], glowFor(fZero) ? "0" : ""); sh.hero.setValue(64 * (1 - smooth((f - s.a) / 30))); }
    else if (id === 6) { sh.hero.setLabels(["0"]); sh.hero.setValue(0); }
    else if (id === 7) {
      const L7 = f >= f96 ? ["0", "32", "96"] : f >= f32 ? ["0", "32"] : ["0"];
      sh.hero.setLabels(L7, glowFor(f96) ? "96" : glowFor(f32) ? "32" : "");
      sh.hero.setValue(f < f32 ? 0 : f < f96 ? 32 * smooth((f - f32) / 15) : 32 + 64 * smooth((f - f96) / 15));
    } else { sh.hero.setLabels(["0", "32", "96"]); sh.hero.setValue(64); }
    // late board (shot 12): column races to 212; 96 rolls to 98.6
    const f212 = wordAt(11, "212"), f986 = wordAt(11, "98.6"), fNorm = wordAt(11, "normal"), f96b = wordAt(11, "96");
    if (id === 12) {
      sh.late.setLabels(f >= f986 ? ["32", "98.6", "212"] : ["32", "96", "212"], f >= f986 ? "98.6" : f >= f96b ? "96" : f >= f212 && f < f212 + 30 ? "212" : "");
      sh.late.setValue(f < fNorm - 6
        ? (f < f212 - 20 ? 70 : 70 + 142 * smooth((f - (f212 - 20)) / 22))
        : f < f986 - 4 ? 212 - 116 * smooth((f - (fNorm - 6)) / 20) : 96 + 2.6 * smooth((f - (f986 - 4)) / 14));
    } else { sh.late.setLabels(["32", "96", "212"]); sh.late.setValue(70); }
    // paper: the 32..96 line halved once more on each beat between "cutting" and "No"
    const fc0 = wordAt(8, "cutting"), fNo = wordAt(8, "No");
    const cut = id !== 9 || f < fc0 ? 0 : Math.min(6, 1 + Math.floor((6 * (f - fc0)) / Math.max(1, fNo - fc0)));
    sh.paper.material = lam(`paper${cut}`, () => ({ map: paperTex(cut) }));
    // salt into the bucket (shot 4)
    const fSalt = wordAt(3, "salt") - 10;
    sh.salt.visible = id === 4 && f >= fSalt;
    sh.scoop.visible = id === 4;
    sh.salt.children.forEach((g, i) => {
      const u = ((f - fSalt) / 14 + (i * 0.618) % 1) % 1, k = Math.sin(i * 12.9898) * 43758.5453, r = k - Math.floor(k);
      g.scale.setScalar(0.55);
      g.position.set(S(-1.4, 0, 0)[0] + (r - 0.5) * 0.03, D0 + 0.9 - u * 0.42, S(0, 0, -0.3)[2] + u * 0.06 + ((r * 7) % 1 - 0.5) * 0.03);
    });
    // kettle steam handled with the fx below; ship sails, banner flutters
    this.ship.visible = id === 10;
    this.ship.position.set(shipX(f), 0.05 * Math.sin(t * 1.7), SHIP_Z); this.ship.rotation.set(0.03 * Math.sin(t * 1.3), 0, 0.02 * Math.sin(t * 1.1));
    const bp = this.banner.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < bp.count; i++) { const x = bp.getX(i); bp.setZ(i, 0.08 * Math.sin(t * 3 + x * 1.3) * (1 - Math.abs(x) / 2.7)); }
    bp.needsUpdate = true;

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const people: { w: Who; p: V3; pose: Pose }[] = [];
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    const L_ = (seg: number, w: string) => wordAt(seg, w);
    switch (id) {
      case 1: people.push({ w: H_, p: S(-0.4, 0, -0.05), pose: { expr: f > L_(0, "armpit") - 4 ? "nervous" : "smile", look: f > L_(0, "armpit") ? -1 : 0, blink: blink(5) } }); break;
      // townsfolk well down the street, past the sign, so the camera's glide to the sign never runs into them
      case 2: [0, 1, 2].forEach((k) => people.push({ w: who(FOLK1724[k], 10 + k, `f24_${k}`), p: [(k - 1) * 2.4, D0, 82 + k * 5 - (k === 1 ? 1 : 0) * 0.8 * (t - SHOTS[1].a / FPS)], pose: { expr: "smile_closed", blink: blink(k) } })); break;
      case 3: people.push({ w: F_, p: S(-0.55, 0, 2.05), pose: { expr: f > L_(2, "So") ? "neutral" : "stern", blink: blink(3), look: f > L_(2, "So") ? 0 : -1 } }); break;
      case 4: people.push({ w: F_, p: S(-2.45, 0, 0.35), pose: { expr: f > L_(3, "salt") ? "grin" : "smile", blink: blink(3), facing: 1 } }); break;
      case 6: people.push({ w: H_, p: S(1.95, 0, -0.75), pose: { expr: f > L_(5, "healthy") ? "smile" : "neutral", blink: blink(5) } }); break;
      case 7: people.push({ w: F_, p: S(-0.15, 0, 1.95), pose: { expr: f > f96 ? "grin" : "smile", blink: blink(3), look: f > f32 ? 1 : 0 } }); break;
      case 8: people.push({ w: F_, p: S(0, 0, -0.4), pose: { expr: "smile_closed", headTilt: 0.14 * smooth((f - s.a) / 10), blink: blink(3) } }); break;
      case 9: people.push({ w: F_, p: S(-0.15, 0, 1.95), pose: { expr: f > L_(8, "64") ? "grin" : "smile", blink: blink(3), look: 1 } }); break;
      case 11: SEVENTIES.forEach((o, k) => {
        const dir = k % 2 ? -1 : 1, lane = dir > 0 ? -40.5 : -42.3, sp = 1.25 + 0.1 * (k % 3), x0 = -5.5 + ((k * 3.7) % 11);
        const x = -5.5 + ((((x0 + 5.5) + dir * sp * (t - SHOTS[10].a / FPS)) % 11) + 11) % 11;
        const dist = (x + 5.5) * dir;
        people.push({ w: who(o, 20 + k, `s70_${k}`), p: [x, D0, lane], pose: { expr: k === 2 ? "smile" : "neutral", blink: blink(20 + k), side: { phase: ((dist / 1.6) % 1 + 1) % 1, mirror: dir < 0, stride: 0.8 } } });
      }); break;
      case 12: people.push({ w: F_, p: S(0.55, 0, 1.75), pose: { expr: f > f986 ? "shock" : "neutral", blink: blink(3), look: 1 } }); break;
      case 13: people.push({ w: H_, p: S(0.2, 0, -0.4), pose: { expr: "neutral", blink: blink(5) } }); break;
    }
    // the man's thermometer under his arm (shots 1, 6, 13)
    const helper = people.find((q) => q.w === H_);
    sh.armRod.visible = !!helper && (id === 1 || (id === 6 && f > L_(5, "thermometer") - 6) || id === 13);
    if (helper && sh.armRod.visible) {
      const toCam = cam.position.clone().sub(V(...helper.p)).setY(0).normalize();
      // tucked under the arm: bulb in the armpit just behind the card (the arm hides it), the rod pokes up past the shoulder
      sh.armRod.position.set(...helper.p).addScaledVector(right, -0.17).add(V(0, 1.06, 0)).addScaledVector(toCam, -0.03);
      sh.armRod.quaternion.copy(cam.quaternion); sh.armRod.rotateZ(0.5);
    }
    this.lastPeople = people.map((q) => ({ name: q.w === F_ ? "Fahrenheit" : q.w === H_ ? "helper" : q.w.key, p: q.p }));
    let ai = 0;
    for (const q of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [w, h, k] = tier(d), a = this.actor(ai++), P = q.pose;
      const mirror = !!P.side && P.side.mirror;
      const light = mirror ? Math.PI - lightA : lightA;
      const key = P.side
        ? `S|${q.w.key}|${P.expr}|${Math.round(P.side.phase * 16)}|${P.blink ?? 0}|${light.toFixed(2)}`
        : `F|${q.w.key}|${P.expr}|${P.look ?? 0}|${(P.headTilt ?? 0).toFixed(2)}|${P.facing ?? 0}|${P.blink ?? 0}|${light.toFixed(2)}`;
      a.r = this.pool.req(key, w, h, k, (p: Pen) => P.side
        ? bodySide(p, q.w.o, { mode: "march", phase: Math.round(P.side.phase * 16) / 16, expr: P.expr, blink: P.blink, stride: P.side.stride ?? 0.8, stomp: 0.6, light, seed: q.w.seed })
        : bodyFront(p, q.w.o, { mode: "stand", expr: P.expr, look: P.look ?? 0, headTilt: P.headTilt ?? 0, facing: P.facing ?? 0, blink: P.blink, light, seed: q.w.seed }));
      a.mesh.visible = true;
      a.mesh.position.set(...q.p);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      a.mesh.scale.set(mirror ? -1 : 1, 1, 1);
      a.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- effects: contact shadows under everyone, kettle steam ----
    const fxl: { key: string; cw: number; ch: number; draw: (p: Pen) => void; pos: V3; w: number; h: number; flat?: boolean; soft?: boolean }[] = [];
    const cc = night ? "#5d6aa8" : "#8a8ab0";
    for (const q of people) fxl.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), pos: [q.p[0], q.p[1] + 0.022, q.p[2]], w: 0.55, h: 0.42, flat: true });
    if (id === 12) for (let k = 0; k < 6; k++) {
      const u = ((t * 0.55 + k / 6) % 1), sz = 0.12 + u * 0.4, sp = spout(sh.kettle, this.v), kp: V3 = [sp.x - 0.25, sp.y, sp.z];
      fxl.push({ key: `steam${k % 3}`, cw: 256, ch: 256, draw: (p) => steam(p, k % 3), pos: [kp[0] + 0.25 + u * 0.25, kp[1] + u * 0.7, kp[2] - 0.05], w: sz, h: sz, soft: true });
    }
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
    const s = SHOTS[id - 1], sh = this.shop, w = (seg: number, x: string) => wordAt(seg, x), all = (n: string, p: THREE.Vector3, r: number, o?: THREE.Object3D): [string, THREE.Vector3, number, number, number, THREE.Object3D?] => [n, p, r, s.a, s.b, o];
    const pt = (o: THREE.Object3D, x = 0, y = 0, z = 0) => { o.updateWorldMatrix(true, false); return o.localToWorld(new THREE.Vector3(x, y, z)); };
    switch (id) {
      case 1: return [["bucket", V(...S(-1.4, 0.4, -0.2)), 0.1, s.a, w(0, "and"), sh.bucketT]];
      case 2: return [["shop sign", V(...SIGN), 0.4, w(1, "Daniel") + 15, s.b]];
      case 4: return [all("bucket", V(...S(-1.4, 0.4, -0.2)), 0.1, sh.bucketT)];
      case 5: return [["0 mark", sh.hero.labelPos(0), 0.04, w(4, "zero"), s.b]];
      case 6: return [["barrel", V(...S(2.7, 0.8, -0.1)), 0.1, s.a, w(5, "Third"), sh.barrel]];
      case 7: return [["32 mark", sh.hero.labelPos(32), 0.04, w(6, "32"), w(6, "body")], ["96 mark", sh.hero.labelPos(96), 0.04, w(6, "96"), s.b]];
      case 9: return [["paper", pt(sh.paper), 0.05, w(8, "From") + 15, w(8, "No"), sh.paper], ["96 mark", sh.hero.labelPos(96), 0.04, w(8, "His") + 32, s.b]];
      case 10: return [all("ship", V(shipX((s.a + s.b) / 2), 5, SHIP_Z), 0.5, this.ship)];
      case 11: return [all("GO METRIC banner", V(...BANNER), 0.2, this.banner)];
      case 12: return [["kettle", pt(sh.kettle, 0, 0.15, 0), 0.05, s.a, w(11, "normal") - 16, sh.kettle], ["212 mark", sh.late.labelPos(212), 0.05, w(11, "212"), w(11, "normal")], ["98.6 mark", sh.late.labelPos(98.6), 0.05, w(11, "98.6"), s.b]];
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
        if (p.clone().sub(cam.position).dot(cam.getWorldDirection(this.v)) < 0.15) return { frac: -1, h: 9 };
        p.project(cam); a = Math.min(a, p.x); b = Math.max(b, p.x); cc = Math.min(cc, p.y); d = Math.max(d, p.y);
      }
      const ix = Math.max(0, Math.min(b, 1) - Math.max(a, -1)), iy = Math.max(0, Math.min(d, 1) - Math.max(cc, -1));
      return { frac: (ix * iy) / Math.max(1e-6, (b - a) * (d - cc)), h: d - cc };
    };
    for (const q of this.lastPeople) {
      const head = box(q.p, -0.27, 0.27, 1.16, 1.84), body = box(q.p, -0.3, 0.3, 0.05, 1.16);
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      else if (head.frac > 0.02 && head.frac < 0.97) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12) out.push(`${q.name}: body in shot without the head`);
      if (head.frac > 0.02 && head.h > 1.6 && !CLOSEUP_OK.has(id)) out.push(`${q.name}: face fills the screen`);
    }
    for (const [name, at, r, a, b, own] of this.subjects(id)) {
      if (f < a || f > b) continue;
      p.copy(at).project(cam);
      if (p.z > 1 || Math.abs(p.x) > 0.9 || Math.abs(p.y) > 0.9) { out.push(`${name}: not in shot`); continue; }
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

const spout = (k: THREE.Object3D, out: THREE.Vector3) => { k.updateWorldMatrix(true, false); return k.localToWorld(out.set(0.33, 0.32, 0)); };
const steam = (p: Pen, v: number) => {
  for (const [x, y, r] of [[[110, 140, 60], [150, 110, 54], [140, 160, 48]], [[120, 120, 64], [160, 150, 50], [100, 160, 44]], [[128, 128, 70], [90, 120, 40], [170, 130, 42]]][v]) p.ell(x, y, r, r * 0.85, "#eef1f8", 0);
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
export { clamp01, SEG_TIMES };
