// The Lustig short's three.js world: the bridge short's painted town and river, the Eiffel Tower at the far end of the
// main street, an open-roofed hotel salon out on the meadow (redressed as Chicago at the end), and the cast as lit flat
// cards. update(id, f, camera) poses everything for shot `id` at frame f (a pure function of id + f).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, buildTown, Kit } from "../bridge/build";
import { bed, ctex, stoneHD, cobbleHD, grassHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, fxPuff, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { FPS, SHOTS, Light } from "./timeline";
import { D0, TC, T, LU0, BUYER, PO, SALON, S, QUAY, LU_S, DEALERS, LU_LEAN, LETTER, MODEL, CASH, CAPONE, LU_C, V3, camAt, smooth, clamp01, expo, A, M, LOOP_F, dealersZ, runZ, frontZ, copZ, cashX } from "./story";
import { buildTower, TOWER_H, buildSalon, Salon, signTex, saleTex, newsTex, letterTex, fakeTex, Flyers, cashPile, suitcase, topHat, GOLD } from "./props";
import { Board } from "../dst/props";

/** shots whose big face close-up is the point */
const CLOSEUP_OK = new Set<number>([2, 3, 6, 7, 8, 9, 10, 12, 13, 17, 19]);
const LP: Record<Light, LightPreset> = { day: LIGHTS.day, golden: LIGHTS.golden, night: LIGHTS.day };
const LK: Record<Light, WorldLook> = { day: LOOK.day, golden: LOOK.golden, night: LOOK.day };

// ---------------- cast ----------------
const LUSTIG: Outfit = { jacket: "#4b3f8f", pants: "#2b2b3a", boots: "#241726", hat: "tophat", moustache: "#2a201a", buttons: "#e8c45a", skin: SKIN };
const LUSTIG_BARE: Outfit = { ...LUSTIG, hat: "hair", hair: "#2a201a" };
const POISSON: Outfit = { jacket: "#8a5a2b", pants: "#4a3a2c", boots: "#3a2a20", hat: "hair", hair: "#b0562a", moustache: "#b0562a", skin: "#f5c9a0", build: "stout" };
const DEALER2: Outfit = { jacket: "#3f6fb5", pants: "#3b3f52", boots: "#4a3426", hat: "tophat", skin: "#ecd0b6" };
const DEALER3: Outfit = { jacket: "#5d7a3a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#d9d2c4", moustache: "#d9d2c4", skin: "#c99067" };
const BUYER_O: Outfit = { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "tophat", moustache: "#4a3426", skin: "#ecd0b6", build: "stout" };
const COP: Outfit = { jacket: "#26335e", pants: "#26335e", boots: "#241726", hat: "cap", cap: "#26335e", buttons: "#d9dde0", belt: "#f1efe6", moustache: "#2a201a", skin: "#f5c9a0" };
const CAPONE_O: Outfit = { jacket: "#6b6e80", pants: "#55586a", boots: "#241726", hat: "fedora", cap: "#e6dfcc", buttons: "#2e2a36", skin: "#f5c9a0", build: "stout" };
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
const L_ = who(LUSTIG, 3, "lustig"), LB_ = who(LUSTIG_BARE, 3, "lustigBare"), P_ = who(POISSON, 7, "poisson"), D2_ = who(DEALER2, 11, "dealer2"), D3_ = who(DEALER3, 14, "dealer3");
const BU_ = who(BUYER_O, 17, "buyer"), C1_ = who(COP, 21, "cop1"), C2_ = who({ ...COP, moustache: undefined, skin: "#ecd0b6" }, 24, "cop2"), CA_ = who(CAPONE_O, 29, "capone");
const DEAL = [P_, D2_, D3_];
const NEWS = {
  tower: () => newsTex("tower", "LE JOURNAL", "EIFFEL TOWER", "TOO COSTLY!"),
  d1: () => newsTex("d1", "DIE ZEITUNG", "MONDAY:", "NO NEWS"),
  d2: () => newsTex("d2", "DIE ZEITUNG", "TUESDAY:", "STILL NOTHING"),
  d3: () => newsTex("d3", "DIE ZEITUNG", "WEDNESDAY:", "CAT IN TREE"),
};

/** drawing size by distance: [canvas w, h, scale from the 600 x 1000 design] */
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
/** march = front-view walk/run phase; side = side-view run (dir = the way they move, so the card faces it); pass = may cross the frame edges */
type Pose = { expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; blink?: number; sit?: boolean; sweat?: boolean; march?: number; pass?: boolean; side?: { phase: number; dir: V3; stride?: number } };

// ---------------- world ----------------
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
  private tower: THREE.Group; private model: THREE.Group; private modelPivot = new THREE.Group(); private salon: Salon;
  private letter: THREE.Mesh; private fake: THREE.Mesh; private envelopes: Flyers; private bills: Flyers;
  private cash: THREE.Group; private bag: THREE.Group; private hat: THREE.Group; private paper: THREE.Mesh;
  private sale: Board; private wien: Board;
  private lastPeople: { name: string; p: V3; walking: boolean; sit?: boolean }[] = [];
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
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)) };
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
    // ---- the tower at the far end of the main street, and the model of it on the salon table ----
    this.tower = buildTower(); this.tower.position.set(...TC); R.add(this.tower);
    this.model = buildTower(); this.model.scale.setScalar(1.1 / TOWER_H); this.modelPivot.add(this.model); this.modelPivot.position.set(...MODEL); R.add(this.modelPivot);
    // ---- the salon, the forged letter on its table (the text reads from the -z side, looking down) ----
    this.salon = buildSalon(R, SALON[0], SALON[1], SALON[2]);
    this.letter = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.45), lam("forgedLetter", () => ({ map: letterTex() })));
    this.letter.rotation.set(-Math.PI / 2, 0, Math.PI); this.letter.position.set(...LETTER); this.letter.receiveShadow = true; R.add(this.letter);
    this.fake = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.172), new THREE.MeshBasicMaterial({ map: fakeTex(), transparent: true, depthWrite: false, toneMapped: false }));
    this.fake.layers.set(NOINK); this.fake.renderOrder = 5; this.fake.rotation.set(-Math.PI / 2, 0, Math.PI - 0.3); this.fake.position.set(LETTER[0] - 0.02, LETTER[1] + 0.006, LETTER[2] - 0.05); R.add(this.fake);
    this.envelopes = new Flyers(R, "envelope", 7, 0.3);
    this.bills = new Flyers(R, "bill", 10, 0.24);
    this.cash = cashPile(); R.add(this.cash);
    this.bag = suitcase(); R.add(this.bag);
    this.hat = topHat(); R.add(this.hat);
    // the newspaper Lustig hides behind (face swapped per headline)
    this.paper = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.705), lam("news_tower", () => ({ map: NEWS.tower(), side: THREE.DoubleSide })));
    this.paper.castShadow = true; R.add(this.paper);
    // boards: FOR SALE in front of the tower, the Vienna road sign on the quay
    this.sale = new Board(1.7, 0.93, "towerSale_false", () => saleTex(false), 2.3); this.sale.group.position.set(10.65, D0 + 2.77, 201.0); R.add(this.sale.group);
    this.wien = new Board(1.3, 0.3, "sign_wien", () => signTex("wien", "WIEN  2 km", "#f6efdc", "#2f2a3a"), 1.55); this.wien.group.position.set(39.0, D0 + 1.7, 35.0); R.add(this.wien.group);
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
    const m = M(), loop = id === 19 && f >= LOOP_F();
    const fwd = cam.getWorldDirection(V(0, 0, 0)), rightV = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), upV = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 1);
    const at = (p: V3) => V(p[0], p[1], p[2]);
    /** a point just in front of the lens, offset sideways/up (metres), for things thrown at the camera */
    const lens = (dx: number, dy: number, ahead = 0.03) => cam.position.clone().addScaledVector(fwd, ahead).addScaledVector(rightV, dx).addScaledVector(upV, dy);
    // the model tower on the table: stands in the salon reveal, topples toward the lens on "down" and bounces
    const fallU = id === 6 ? (f < m.down ? 0 : Math.min(1, ((f - m.down) / 8) ** 2)) : 0;
    const bounce = id === 6 && f >= m.down + 8 ? 0.25 * Math.exp(-(f - m.down - 8) / 4) * Math.abs(Math.sin((f - m.down - 8) * 0.9)) : 0;
    this.modelPivot.visible = (id === 5 && f >= m.luxury - 3) || id === 6;
    this.modelPivot.rotation.x = -(1.5 * fallU - bounce);
    // the forged letter and its FAKE stamp; envelopes fly off the table at the lens on "letters"
    this.letter.visible = id === 4;
    this.fake.visible = id === 4 && f >= m.fake;
    if (this.fake.visible) { const u = clamp01((f - m.fake) / 4); this.fake.scale.setScalar(1.7 - 0.7 * u); (this.fake.material as THREE.MeshBasicMaterial).opacity = 0.4 + 0.6 * u; }
    this.envelopes.hide(); this.bills.hide();
    if (id === 4) this.envelopes.list.forEach((_, k) => {
      const u = (f - (m.letters - 1 + k * 2)) / 11;
      if (u < 0 || u > 1.05) return;
      const p = at(LETTER).add(V((k - 3) * 0.06, 0.03, 0)).lerp(lens(((k % 3) - 1) * 0.16, k % 2 ? 0.1 : -0.08), u);
      p.y += 0.3 * Math.sin(Math.PI * Math.min(1, u));
      this.envelopes.put(k, p, cam, k * 1.1 + u * 3);
    });
    // the cash: slams down in front of Poisson (11); slides to Lustig and back in Chicago (19)
    this.cash.visible = (id === 11 && f >= m.paid - 5) || (id === 19 && !loop && f >= m.handed - 2);
    if (id === 11) { const d = f - m.paid; this.cash.position.set(CASH[0], CASH[1] + (d < 0 ? 1.1 * (-d / 5) : 0), CASH[2]); this.cash.scale.set(0.6, 0.6 * (d >= 0 && d < 6 ? 1 - 0.25 * Math.sin((d / 6) * Math.PI) : 1), 0.6); }
    if (id === 19) { this.cash.position.set(...S(cashX(f), 0.8, 0.55)); this.cash.scale.set(0.6, 0.6, 0.6); }
    // the suitcase: swinging beside him on the run (12), at his feet in Vienna (13); bank notes stream out of it
    this.bag.visible = id === 12 || id === 13;
    const front = id === 12 && f >= m.suitcase - 2, bob = 0.07 * Math.sin(t * 20);
    if (id === 12 && !front) { this.bag.position.set(0.86, D0 + 0.62 + bob, runZ(f) - 0.32); this.bag.rotation.set(0, Math.PI / 2, 0.15 * Math.sin(t * 10)); }
    if (front) { this.bag.position.set(1.02, D0 + 0.62 + bob, frontZ(f) - 0.05); this.bag.rotation.set(0, 0, 0.15 * Math.sin(t * 10)); }
    if (id === 13) { this.bag.position.set(QUAY[0] + 0.55, D0 + 0.19, QUAY[2] + 0.1); this.bag.rotation.set(0, 0, 0); }
    if (id === 12) this.bills.list.slice(0, 8).forEach((_, k) => {
      const age = (((f - A(12)) + k * 5) % 40) / 40, b = this.bag.position;
      const p = front
        ? V(b.x + ((k % 3) - 1) * 0.5 * age, D0 + 0.7 + 0.8 * Math.sin(Math.PI * age), b.z - age * (b.z - 100.3))
        : V(b.x + age * 3.6, D0 + 0.7 + 0.9 * Math.sin(Math.PI * age), b.z + age * 2.6);
      this.bills.put(k, p, cam, k + age * 6);
    });
    // Capone's reward flies at the lens
    if (id === 19 && !loop && f >= m.reward && f < m.honesty - 3) this.bills.list.slice(0, 6).forEach((_, k) => {
      const u = (f - (m.reward + k)) / 9;
      if (u < 0 || u > 1.05) return;
      const p = at(S(1.4, 1.2, 1.5)).lerp(lens(((k % 3) - 1) * 0.12, (((k + 1) % 3) - 1) * 0.1), u);
      p.y += 0.2 * Math.sin(Math.PI * Math.min(1, u));
      this.bills.put(k, p, cam, k * 0.9 + u * 4);
    });
    // the top hat: held out upside down for the bribe (9), left spinning on the grass when he vanishes (18)
    const hatOut = id === 9 && f >= m.asked - 2;
    this.hat.visible = hatOut || id === 18;
    if (hatOut) {
      const u = expo((f - (m.bribe - 5)) / 7);
      this.hat.position.copy(at(S(-1.5, 1.12, 1.55)).lerp(at(S(-1.21, 1.27, 0.05)), u));
      this.hat.rotation.set(1.15, 0, 0.25 * Math.sin(t * 9)); this.hat.scale.setScalar(1);
    }
    if (id === 18) { const d = Math.exp(-(f - A(18)) / 22); this.hat.position.set(LU0[0], D0 + 0.01, LU0[2]); this.hat.rotation.set(0.3 * d * Math.sin(t * 13), t * 7 * d, 0.3 * d * Math.cos(t * 13)); this.hat.scale.setScalar(1); }
    // the newspaper he hides behind: turned to the camera, held a little toward it; headline changes on the words
    const paperOn = (id === 3 && f < m.paris - 1) || id === 13;
    this.paper.visible = paperOn;
    if (paperOn) {
      const base = id === 3 ? LU0 : QUAY, yaw = Math.atan2(cam.position.x - base[0], cam.position.z - base[2]);
      const key = id === 3 ? "tower" : f < m.every ? "d1" : f < m.day ? "d2" : "d3";
      this.paper.material = lam(`news_${key}`, () => ({ map: NEWS[key as keyof typeof NEWS](), side: THREE.DoubleSide }));
      const flip = id === 13 ? Math.min(...[m.every, m.day].map((x) => Math.abs(f - x))) : 9;
      const drop = id === 13 ? 0.42 * smooth((f - (m.nothing + 5)) / 6) : 0;
      this.paper.position.set(base[0] + 0.3 * Math.sin(yaw), D0 + 0.84 - drop, base[2] + 0.3 * Math.cos(yaw));
      this.paper.rotation.set(0, yaw, 0.03 * Math.sin(t * 3)); this.paper.scale.set(1, flip < 3 ? 0.35 + 0.22 * flip : 1, 1);
    }
    // boards
    this.sale.group.visible = id >= 16 && id <= 18;
    const again = id > 16 || (id === 16 && f >= m.again);
    this.sale.setFace(`towerSale_${again}`, () => saleTex(again));
    if (id === 16 && f >= m.again) this.sale.group.scale.setScalar(1 + 0.12 * Math.sin(clamp01((f - m.again) / 8) * Math.PI)); else this.sale.group.scale.setScalar(1);
    this.wien.group.visible = id === 13;
    const city = id === 19 ? "chicago" : "hotel";
    this.salon.sign.material = lam(`sign_${city}`, () => ({ map: signTex(city, id === 19 ? "CHICAGO" : "HÔTEL DE CRILLON", "#2f2a3a", GOLD) }));


    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const people: { w: Who; p: V3; pose: Pose }[] = [];
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    const add = (w: Who, p: V3, pose: Pose) => people.push({ w, p, pose });
    switch (id) {
      case 2: add(L_, LU0, { expr: "grin", blink: blink(3) }); break;
      case 3: if (f < m.paris + 1) add(L_, LU0, { expr: "smile", blink: blink(3), pass: true }); break;
      case 5:
        if (f < m.luxury - 3) DEAL.forEach((w, k) => add(w, S([-0.85, 0, 0.85][k], 0, dealersZ(f) + [0.3, 0, 0.5][k]), { expr: k === 0 ? "nervous" : "smile", blink: blink(w.seed), march: ((t * 1.9 + k * 0.33) % 1 + 1) % 1, pass: true }));
        else { add(L_, LU_S, { expr: "grin", blink: blink(3), pass: true }); DEAL.forEach((w, k) => add(w, DEALERS[k], { expr: "smile", blink: blink(w.seed), pass: true })); }
        break;
      case 6: if (f < m.tower - 2) add(L_, LU_S, { expr: "grin", blink: blink(3), headTilt: 0.05 }); break;
      case 7:
        if (f < m.tell - 2) DEAL.forEach((w, k) => add(w, DEALERS[k], { expr: f >= m.iron ? "grin" : "shock", blink: blink(w.seed), pass: true }));
        else add(L_, LU_S, { expr: "whistle", blink: 0 });
        break;
      case 8:
        if (f < m.andre - 3) DEAL.forEach((w, k) => add(w, DEALERS[k], { expr: k === 0 ? "nervous" : "smile", blink: blink(w.seed), sweat: k === 0 }));
        else add(P_, DEALERS[0], { expr: f >= m.nervous - 2 ? "pained" : "nervous", blink: blink(7), sweat: true });
        break;
      case 9:
        add(f >= m.asked - 2 ? LB_ : L_, LU_LEAN, { expr: f >= m.asked - 2 ? "grin" : "smile_closed", headTilt: -0.14, blink: blink(3), pass: true });
        add(P_, DEALERS[0], { expr: "nervous", blink: blink(7), sweat: true, pass: true });
        break;
      case 10:
        add(P_, DEALERS[0], { expr: f < m.settled - 2 ? "nervous" : f < m.only - 2 ? "relief" : "grin", blink: blink(7), sweat: f < m.settled - 2, pass: f >= m.only - 2 });
        if (f >= m.only - 2) add(L_, S(-1.65, 0, 1.75), { expr: "grin", blink: blink(3), pass: true });
        break;
      case 11: add(P_, DEALERS[0], { expr: "relief_open", blink: blink(7), pass: true }); break;
      case 12:
        if (f < m.suitcase - 2) { const z = runZ(f); add(L_, [0.8, D0, z], { expr: "grin", blink: 0, side: { phase: (((140 - z) / 2.4) % 1 + 1) % 1, dir: [0, 0, -1], stride: 1.5 } }); }
        else add(L_, [0.6, D0, frontZ(f)], { expr: "laugh", blink: 0, march: (t * 3.4) % 1, pass: true });
        break;
      case 13: add(L_, QUAY, { expr: f < m.nothing - 2 ? "neutral" : f < m.nothing + 8 ? "shock" : "grin", blink: f < m.nothing - 2 ? blink(3) : 0 }); break;
      case 14: add(P_, PO, { expr: "pained", blink: blink(7), sweat: true, headTilt: 0.12, pass: true }); break;
      case 16: add(L_, LU0, { expr: "grin", blink: blink(3), pass: true }); add(BU_, BUYER, { expr: "stern", blink: blink(17), pass: true }); break;
      case 17:
        add(C1_, [0, D0, copZ(f)], { expr: "whistle", blink: 0, march: (t * 3.2) % 1, pass: true });
        add(C2_, [1.0, D0, copZ(f) + 3.2], { expr: "stern", blink: 0, march: (t * 3.2 + 0.5) % 1, pass: true });
        break;
      case 19:
        if (loop) break;
        if (f < m.handed - 2) add(CA_, CAPONE, { expr: "stern", blink: blink(29) });
        else if (f < m.got - 2) { add(CA_, CAPONE, { expr: f >= m.gave + 8 ? "shock" : "stern", blink: blink(29), pass: true }); add(L_, LU_C, { expr: "grin", blink: blink(3), pass: true }); }
        else if (f < m.honesty - 3) add(CA_, CAPONE, { expr: "grin", blink: blink(29) });
        else add(L_, LU_C, { expr: "grin", blink: 0 });
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

    if (id === 18 && f - A(18) < 16) { const q = Math.floor((f - A(18)) / 2); fxl.push({ key: `puff|${q}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q / 8), pos: [LU0[0], D0 + 0.55, LU0[2] - 0.1], w: 1.7, h: 1.7, soft: true }); }

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
      case 1: return [["tower", V(...T(0, 40, 0)), 4, s.a + 12, m.scrap - 4, this.tower]];
      case 4: return [["forged letter", V(...LETTER), 0.05, s.a + 10, m.letters - 4, this.letter]];
      case 6: return [["model tower", V(MODEL[0], MODEL[1] + 0.5, MODEL[2]), 0.05, m.tower + 2, m.down - 1, this.modelPivot]];
      case 11: return [["cash", V(CASH[0], CASH[1] + 0.15, CASH[2]), 0.05, m.paid + 3, s.b, this.cash]];
      case 13: return [["newspaper", this.paper.position.clone(), 0.05, s.a + 26, m.nothing - 4, this.paper]];
      case 16: return [["FOR SALE sign", this.sale.pos(), 0.2, s.a + 8, s.b, this.sale.group]];
      case 18: return [["top hat", V(LU0[0], D0 + 0.1, LU0[2]), 0.05, s.a + 12, m.america - 3, this.hat]];
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

