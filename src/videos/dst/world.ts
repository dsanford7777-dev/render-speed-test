// The daylight saving short's three.js world: the Fahrenheit short's painted town and river, the workshop (1916),
// plus a farm out west, a Congress hall out east, stalls and Halloween decorations on the near-bank main street, and
// the cast as lit flat cards. update(id, f, camera) poses everything for shot `id` at frame f (pure in id + f).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, buildTown, Kit } from "../bridge/build";
import { bed, ctex, stoneHD, cobbleHD, grassHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN, KID } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { FPS, SHOTS, Light, wordAt } from "./timeline";
import { D0, SHOP, FARM, HALL, F, S, C, ST, V3, camAt, BANNER, smooth, clamp01, SHOP_CLOCK, SHOP_YEAR, COAL, ST_CLOCK, SALE, GREEN, GRILL, MONEY } from "./story";
import { buildShop, Shop } from "../fahrenheit/props";
import { buildFarm, Farm, buildChamber, Chamber, Clock, postClock, Board, yearTex, milkSignTex, congressTex, paperTex, bannerTex, saleTex, moneyTex, grill, golf, pumpkin, candyPumpkin, pitchfork } from "./props";

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
/** shots whose big face close-up is the point (the sleepy ending) */
const CLOSEUP_OK = new Set([17]);
const LP: Record<Light, LightPreset> = { day: LIGHTS.day, golden: LIGHTS.golden, night: NIGHT };
const LK: Record<Light, WorldLook> = { day: LOOK.day, golden: LOOK.golden, night: NIGHT_LOOK };

// ---------------- cast ----------------
export const HELPER: Outfit = { jacket: "#3f6fb5", pants: "#5a4a3a", boots: "#4a3426", hat: "cap", cap: "#c0353a", skin: "#f5c9a0" };
const FARMERS: Outfit[] = [
  { jacket: "#4a7db8", pants: "#4a7db8", boots: "#4a3426", hat: "cap", cap: "#d9a441", skin: "#f5c9a0", moustache: "#6b4a2f" },
  { jacket: "#c0553a", pants: "#3b5b9a", boots: "#3a2a20", hat: "cap", cap: "#5d7a3a", skin: SKIN },
  { jacket: "#5d7a3a", pants: "#4a7db8", boots: "#4a3426", hat: "hair", hair: "#5a3b2a", skin: "#c99067", moustache: "#2a201a" },
];
const SENATORS: Outfit[] = [
  { jacket: "#2b2f3d", pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#d9d4c8", skin: SKIN, moustache: "#d9d4c8", buttons: "#e8c45a" },
  { jacket: "#3b3346", pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#4a3020", skin: "#f5c9a0" },
  { jacket: "#2f3f52", pants: "#2b2f3d", boots: "#1e1a20", hat: "tophat", skin: "#ecd0b6", moustache: "#4a3020" },
  { jacket: "#4a3a2f", pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#2a201a", skin: "#c99067" },
  { jacket: "#2b2f3d", pants: "#3b3346", boots: "#1e1a20", hat: "hair", hair: "#8a8a8a", skin: "#f5c9a0", moustache: "#8a8a8a" },
  { jacket: "#3a4a3a", pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#5a3b2a", skin: SKIN },
];
const FOLK1918: Outfit[] = [
  { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "tophat", skin: SKIN },
  { jacket: "#5d7a3a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#d9a441", skin: "#f5c9a0" },
  { jacket: "#2f5f6a", pants: "#3b3f52", boots: "#4a3426", hat: "cap", cap: "#5a3b2a", skin: "#ecd0b6" },
  { jacket: "#7a4b2a", pants: "#5a4a3a", boots: "#2a201a", hat: "hair", hair: "#4a3020", skin: "#c99067", moustache: "#4a3020" },
  { jacket: "#3f6fb5", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#c0553a", skin: SKIN },
];
const KIDS: Outfit[] = [
  { ...KID },
  { ...KID, jacket: "#7b5ac9", cap: "#2f8f8a", skin: "#c99067" },
  { ...KID, jacket: "#2f8f8a", hat: "hair", hair: "#2a201a", skin: "#f5c9a0" },
  { ...KID, jacket: "#e0332e", cap: "#ffd84d", skin: "#ecd0b6" },
  { ...KID, jacket: "#3b3346", hat: "hair", hair: "#d9a441", skin: SKIN },
];
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
const H_ = who(HELPER, 5, "help");
const FM = FARMERS.map((o, k) => who(o, 30 + k, `farm_${k}`));

/** drawing size by distance: [canvas w, h, scale from the 600 x 1000 design] */
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
type Pose = { expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; blink?: number; side?: { phase: number; mirror: boolean; stride?: number }; fork?: boolean; candy?: boolean };

// ---------------- world ----------------
export class DWorld {
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
  private shop: Shop; private farm: Farm; private hall: Chamber;
  private shopClock: Clock; private yearBoard: Board; private coal: THREE.Group;
  private banner: THREE.Mesh; private stClock: Clock;
  private sale: Board; private green: THREE.Group; private grill: THREE.Group; private money: Board;
  private lanterns: THREE.Group[] = []; private handCandy: THREE.Group; private forks: THREE.Group[] = [];
  private lastPeople: { name: string; p: V3; walking: boolean }[] = [];
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
    // ---- workshop (1916): wall clock, year board, coal heap by the stove ----
    this.shop = buildShop(R, SHOP[0], SHOP[1], SHOP[2]);
    this.shopClock = new Clock(0.4, "#6b4a2f"); this.shopClock.group.position.set(...SHOP_CLOCK); R.add(this.shopClock.group);
    this.yearBoard = new Board(0.9, 0.45, "year_1916", () => yearTex("1916")); this.yearBoard.group.position.set(...SHOP_YEAR); R.add(this.yearBoard.group);
    this.coal = coalHeap(); this.coal.position.set(...COAL); R.add(this.coal);
    this.shop.late.group.visible = false; this.shop.hero.group.visible = false; this.shop.bucketRod.visible = false; this.shop.barrelRod.visible = false; this.shop.paper.visible = false; this.shop.barrel.visible = false; this.shop.bucketT.visible = false;
    // ---- farm, Congress hall ----
    this.farm = buildFarm(R, FARM[0], FARM[1], FARM[2]);
    this.hall = buildChamber(R, HALL[0], HALL[1], HALL[2]);
    // ---- main street: banner, street clock, stalls, jack-o'-lanterns ----
    const bg = new THREE.PlaneGeometry(5.4, 1.35, 16, 2);
    this.banner = new THREE.Mesh(bg, lam("banner_1918", () => ({ map: bannerTex("1918", "SAVE DAYLIGHT!", "CLOCKS FORWARD ONE HOUR  •  1918"), side: THREE.DoubleSide })));
    this.banner.position.set(...BANNER); this.banner.castShadow = true; this.banner.receiveShadow = true; R.add(this.banner);
    for (const sx of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 4.2, 8), lam("poleWood", () => ({ color: "#7a5236" })));
      p.position.set(BANNER[0] + sx * 2.85, D0 + 2.6, BANNER[2]); p.scale.y = 5.2 / 4.2; p.castShadow = true; R.add(p);
    }
    const sc = postClock(0.42, 2.3); sc.g.position.set(...ST_CLOCK); sc.g.rotation.y = Math.PI; R.add(sc.g); this.stClock = sc.clock;
    this.sale = new Board(1.0, 0.75, "saleSign", saleTex, 1.0); this.sale.group.position.set(SALE[0], SALE[1] + 1.0 + 0.375, SALE[2]); this.sale.group.rotation.y = Math.PI; R.add(this.sale.group);
    this.green = golf(); this.green.position.set(...GREEN); R.add(this.green);
    this.grill = grill(); this.grill.position.set(...GRILL); R.add(this.grill);
    this.money = new Board(2.3, 0.86, "money200", moneyTex, 1.9); this.money.group.position.set(...MONEY); this.money.group.rotation.y = Math.PI; R.add(this.money.group);
    for (const sx of [-1, 1]) for (let z = -47.5; z > -80; z -= 5.5) {
      const p = pumpkin(0.26, true); p.position.set(sx * 5.3, D0, z + (sx > 0 ? 2.2 : 0)); p.rotation.y = sx < 0 ? -Math.PI / 2 : Math.PI / 2;
      R.add(p); this.lanterns.push(p);
    }
    this.handCandy = candyPumpkin(0.13); R.add(this.handCandy);
    for (let i = 0; i < 3; i++) { const pf = pitchfork(); R.add(pf); this.forks.push(pf); }
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
    const night = s.light === "night", sh = this.shop, fm = this.farm, hl = this.hall;
    for (const o of sh.night) o.visible = night && id <= 4;
    sh.furnaceGlow.color.setRGB(night ? 2.4 : 3.2, night ? 0.95 : 1.4, night ? 0.25 : 0.4);
    sh.candle.flame.scale.set(1, 1 + 0.12 * Math.sin(t * 23), 1);
    sh.salt.visible = false; sh.scoop.visible = false; sh.armRod.visible = false;
    // farm clock: 6:00, BANNED stamp from "banned" on
    const fBan = wordAt(1, "banned");
    fm.clock.setTime(6.0); fm.clock.setStamp(id === 2 && f >= fBan - 2);
    // workshop clock jumps an hour on "Moving"
    const fMove = wordAt(3, "Moving");
    this.shopClock.setTime(id === 4 ? 9 + smooth((f - fMove) / 16) : 9);
    // dew twinkles; milk train 7:00 -> 6:00 on "early"
    fm.dew.forEach((d, i) => d.scale.setScalar(0.6 + 0.6 * Math.max(0, Math.sin(t * 5 + i * 1.7))));
    const fEarly = wordAt(6, "early");
    fm.milkSign.setFace(`milkSign_${id === 7 && f >= fEarly - 2}`, () => milkSignTex(id === 7 && f >= fEarly - 2));
    // hall: VETOED on "vetoed"; REPEALED! on "overrode"; candy pumpkins only in shot 15
    const fVeto = wordAt(8, "vetoed"), fOver = wordAt(9, "overrode");
    const vetoed = id === 9 && f >= fVeto - 2;
    hl.paper.material = lam(`vetoPaper_${vetoed ? 1 : 0}`, () => ({ map: paperTex(vetoed ? 1 : 0) }));
    const rep = id === 10 && f >= fOver - 2;
    hl.board.material = lam(`congressBoard_${rep}`, () => ({ map: congressTex(rep) }));
    for (const c of hl.candies) c.visible = id === 15;
    // street
    this.stClock.setTime(id === 11 ? 5.25 + 0.4 * smooth((f - SHOTS[10].a) / 40) : 5.5);
    const halloween = id === 14 || id === 16 || id === 17;
    for (const p of this.lanterns) p.visible = halloween;
    const bkey = id === 16 ? "2005" : "1918";
    this.banner.material = lam(`banner_${bkey}`, () => ({ map: id === 16 ? bannerTex("2005", "TRICK OR TREAT!", "HALLOWEEN IN DAYLIGHT  •  2005", "#e0731f") : bannerTex("1918", "SAVE DAYLIGHT!", "CLOCKS FORWARD ONE HOUR  •  1918"), side: THREE.DoubleSide }));
    const bp = this.banner.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < bp.count; i++) { const x = bp.getX(i); bp.setZ(i, 0.08 * Math.sin(t * 3 + x * 1.3) * (1 - Math.abs(x) / 2.7)); }
    bp.needsUpdate = true;
    const f200 = wordAt(12, "$200");
    const mk = id === 13 ? smooth((f - (f200 - 3)) / 7) : 0;
    this.money.group.visible = mk > 0.001;
    this.money.group.scale.setScalar(Math.max(0.001, mk * (1 + 0.12 * Math.sin(clamp01((f - f200) / 10) * Math.PI))));

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const people: { w: Who; p: V3; pose: Pose }[] = [];
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    const L_ = (seg: number, w: string) => wordAt(seg, w);
    /** walkers crossing the camera's view: lanes, speed; along x (street seen lengthwise) or z (seen across) */
    const walkers = (outs: Outfit[], seed0: number, keyp: string, axis: "x" | "z", lanes: [number, number], span: [number, number], t0: number) => outs.forEach((o, k) => {
      const dir = k % 2 ? -1 : 1, lane = dir > 0 ? lanes[0] : lanes[1], sp = 1.2 + 0.1 * (k % 3), L = span[1] - span[0];
      const x0 = span[0] + ((k * 3.7) % L);
      const u = span[0] + ((((x0 - span[0]) + dir * sp * (t - t0)) % L) + L) % L;
      const dist = (u - span[0]) * dir;
      const p: V3 = axis === "x" ? [u, D0, lane] : [lane, D0, u];
      people.push({ w: who(o, seed0 + k, `${keyp}_${k}`), p, pose: { expr: k === 2 ? "smile" : "smile_closed", blink: blink(seed0 + k), side: { phase: ((dist / 1.6) % 1 + 1) % 1, mirror: axis === "x" ? dir < 0 : dir > 0, stride: 0.8 } } });
    });
    switch (id) {
      case 1: people.push({ w: FM[0], p: F(-0.15, 0, 0.7), pose: { expr: "stern", look: 1, blink: blink(30), fork: true } }); break;
      case 2:
        people.push({ w: FM[0], p: F(-0.05, 0, 1.9), pose: { expr: f > fBan ? "grin" : "stern", look: 1, blink: blink(30), fork: true } });
        people.push({ w: FM[1], p: F(-1.25, 0, 2.7), pose: { expr: f > fBan ? "laugh" : "stern", blink: blink(31), fork: true } });
        people.push({ w: FM[2], p: F(-2.45, 0, 3.4), pose: { expr: f > fBan ? "grin" : "stern", blink: blink(32), fork: true } });
        break;
      case 5: walkers(FOLK1918, 40, "f18", "x", [-40.5, -42.3], [-5.5, 5.5], SHOTS[4].a / FPS); break;
      case 6: break;
      case 8: [0, 1, 2].forEach((k) => people.push({ w: FM[k], p: C(-1.1 + k * 1.1, 0, 2.6 + (k === 1 ? 0.35 : 0)), pose: { expr: k === 1 ? "laugh" : "stern", blink: blink(30 + k), fork: true } })); break;
      case 10: SENATORS.forEach((o, k) => { const sx = k % 2 ? 1 : -1, j = Math.floor(k / 2), row = j === 2 ? -1.45 : 0.65, x = sx * (1.3 + (j % 2) * 1.5);
        people.push({ w: who(o, 50 + k, `sen_${k}`), p: C(x, 0, row), pose: { expr: f > fOver ? (k % 3 ? "laugh" : "grin") : "neutral", blink: blink(50 + k) } }); }); break;
      case 11: people.push({ w: H_, p: ST(1.15, 0, -40.7), pose: { expr: "nervous", headTilt: 0.16 * smooth((f - SHOTS[10].a) / 12), look: 1, blink: blink(5) } }); break;
      case 14: walkers(KIDS, 60, "kid", "z", [-2.6, -1.0], [-68, -52], SHOTS[13].a / FPS); break;
      case 16: walkers(KIDS, 60, "kid", "x", [-40.5, -42.3], [-5.5, 5.5], SHOTS[15].a / FPS); break;
      case 17: people.push({ w: H_, p: ST(0.1, 0, -41.0), pose: { expr: f > L_(16, "thank") ? "smile_closed" : "dazed", blink: blink(5), candy: true } }); break;
    }
    this.lastPeople = people.map((q) => ({ name: q.w === H_ ? "helper" : q.w.key, p: q.p, walking: !!q.pose.side }));
    // pitchforks beside the farmers, the candy pumpkin held up at the end
    let fk = 0;
    for (const q of people) if (q.pose.fork && fk < this.forks.length) {
      const pf = this.forks[fk++], toCam = cam.position.clone().sub(V(...q.p)).setY(0).normalize();
      pf.visible = true; pf.position.set(...q.p).addScaledVector(right, 0.36).addScaledVector(toCam, 0.05);
      pf.quaternion.copy(cam.quaternion); pf.rotation.set(0, Math.atan2(toCam.x, toCam.z), 0.06);
    }
    for (let i = fk; i < this.forks.length; i++) this.forks[i].visible = false;
    const holder = people.find((q) => q.pose.candy);
    this.handCandy.visible = !!holder;
    if (holder) { const toCam = cam.position.clone().sub(V(...holder.p)).setY(0).normalize(); this.handCandy.position.set(...holder.p).addScaledVector(toCam, 0.32).addScaledVector(right, -0.12).add(V(0, 1.1, 0)); }
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
    // ---- effects: contact shadows under everyone, grill smoke ----
    const fxl: { key: string; cw: number; ch: number; draw: (p: Pen) => void; pos: V3; w: number; h: number; flat?: boolean; soft?: boolean }[] = [];
    const cc = night ? "#5d6aa8" : "#8a8ab0";
    for (const q of people) fxl.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), pos: [q.p[0], q.p[1] + 0.022, q.p[2]], w: 0.55, h: 0.42, flat: true });
    if (id === 12) for (let k = 0; k < 6; k++) {
      const u = ((t * 0.5 + k / 6) % 1), sz = 0.18 + u * 0.5;
      fxl.push({ key: `steam${k % 3}`, cw: 256, ch: 256, draw: (p) => steam(p, k % 3), pos: [GRILL[0] + u * 0.3, GRILL[1] + 1.0 + u * 1.0, GRILL[2]], w: sz, h: sz, soft: true });
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
    const s = SHOTS[id - 1], fm = this.farm, hl = this.hall, w = (seg: number, x: string) => wordAt(seg, x), all = (n: string, p: THREE.Vector3, r: number, o?: THREE.Object3D): [string, THREE.Vector3, number, number, number, THREE.Object3D?] => [n, p, r, s.a, s.b, o];
    switch (id) {
      case 1: return [all("farm clock", fm.clock.facePos(), 0.2, fm.clockG)];
      case 2: return [["farm clock", fm.clock.facePos(), 0.2, w(1, "banned") + 10, s.b, fm.clockG]];
      case 3: return [all("1916 board", this.yearBoard.pos(), 0.1, this.yearBoard.group), all("workshop clock", this.shopClock.facePos(), 0.1, this.shopClock.group)];
      case 4: return [["workshop clock", this.shopClock.facePos(), 0.1, s.a, w(3, "coal") - 14, this.shopClock.group], ["coal heap", V(COAL[0], COAL[1] + 0.3, COAL[2]), 0.1, w(3, "coal") + 14, s.b, this.coal]];
      case 5: return [all("banner", V(...BANNER), 0.2, this.banner)];
      case 6: return [all("farm clock", fm.clock.facePos(), 0.2, fm.clockG), all("cow", V(...F(2.55, 1.3, 2.5)), 0.15, fm.cow)];
      case 7: return [["hay", V(...F(-3.0, 0.9, 3.6)), 0.15, s.a, w(6, "milk") - 14, fm.hay[0]], ["milk sign", fm.milkSign.pos(), 0.1, w(6, "milk") + 14, s.b, fm.milkSign.group]];
      case 8: return [all("CONGRESS board", V(...C(0, 3.1, 5.9)), 0.3)];
      case 9: return [all("repeal paper", hl.podiumTop.clone(), 0.05, hl.paper)];
      case 10: return [["REPEALED board", V(...C(0, 3.1, 5.9)), 0.3, w(9, "overrode"), s.b]];
      case 11: return [all("street clock", this.stClock.facePos(), 0.1, this.stClock.group)];
      case 12: return [["SALE sign", this.sale.pos(), 0.1, s.a + 4, w(11, "golf") - 10, this.sale.group], ["golf flag", V(GREEN[0] + 0.3, GREEN[1] + 1.4, GREEN[2] + 0.2), 0.1, w(11, "golf") + 10, w(11, "barbecue") - 10, this.green], ["grill", V(GRILL[0], GRILL[1] + 0.8, GRILL[2]), 0.1, w(11, "barbecue") + 10, s.b, this.grill]];
      case 13: return [["golf green", V(...GREEN), 0.3, s.a, w(12, "$200") - 4, this.green], ["$200,000,000 board", this.money.pos(), 0.2, w(12, "$200") + 8, s.b, this.money.group]];
      case 14: return [all("jack-o'-lantern", V(-5.3, D0 + 0.25, -58.5), 0.1)];
      case 15: { const m = Math.round((s.a + s.b) / 2); return [["candy pumpkin", hl.candies[8].position.clone().add(V(0, 0.06, 0)), 0.05, s.a, m, hl.candies[8]], ["candy pumpkin", hl.candies[7].position.clone().add(V(0, 0.06, 0)), 0.05, m, s.b, hl.candies[7]]]; }
      case 16: return [all("banner", V(...BANNER), 0.2, this.banner)];
      case 17: return [all("candy pumpkin", this.handCandy.position.clone().add(V(0, 0.08, 0)), 0.05, this.handCandy)];
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
      const head = box(q.p, -0.27, 0.27, 1.16, 1.84), body = box(q.p, -0.3, 0.3, 0.05, 1.16);
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


const coalHeap = () => {
  const g = new THREE.Group(), m = lam("coal", () => ({ color: "#2a2730" }));
  for (let i = 0; i < 46; i++) {
    const k = Math.sin(i * 12.9898) * 43758.5453, r = k - Math.floor(k), a = i * 2.39996, d = Math.sqrt(i / 46) * 0.62;
    const s = 0.09 + 0.06 * r, h = (1 - d / 0.62) * 0.42;
    const c = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), m); c.position.set(Math.cos(a) * d, s * 0.6 + h, Math.sin(a) * d * 0.8); c.rotation.set(i, i * 1.7, i * 0.3);
    g.add(c);
  }
  const shovel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.05), lam("poleWood", () => ({ color: "#7a5236" }))); shovel.position.set(0.55, 0.55, 0.1); shovel.rotation.z = -0.35; g.add(shovel);
  g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  return g;
};
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

