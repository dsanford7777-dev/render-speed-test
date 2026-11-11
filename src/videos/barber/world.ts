// The barber pole short's three.js world: the bridge short's painted town and river, an open-roofed barber's shop out
// on the meadow, and a barber's shop front on the main street (pole, window sill with bowls, the old staff), with the
// cast as lit flat cards. update(id, f, camera) poses everything for shot `id` at frame f (a pure function of id + f).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, buildTown, Kit } from "../bridge/build";
import { bed, ctex, stoneHD, cobbleHD, grassHD, waterNear, waterFar, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, Expr, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { FPS, SHOTS, Light, wordAt } from "./timeline";
import { D0, SHOP, S, P, V3, camAt, smooth, clamp01, POLE, FRONT, SILL, FLAG, A } from "./story";
import { buildShop, Shop, Pole, Staff, sill, frontTex, bannedTex, jobsTex, surgeonTex, BloodBowl } from "./props";
import { Board } from "../dst/props";
import { Flag, usFlagTex } from "../pigwar/props";

/** shots whose big face close-up is the point */
const CLOSEUP_OK = new Set<number>([4]);
const LP: Record<Light, LightPreset> = { day: LIGHTS.day, golden: LIGHTS.golden, night: LIGHTS.day };
const LK: Record<Light, WorldLook> = { day: LOOK.day, golden: LOOK.golden, night: LOOK.day };

// ---------------- cast ----------------
const BARBER: Outfit = { jacket: "#f1ece0", pants: "#3b3f52", boots: "#3a2a20", hat: "hair", hair: "#2a201a", moustache: "#2a201a", buttons: "#c9373a", skin: "#f5c9a0", build: "stout" };
const PATIENT: Outfit = { jacket: "#5d7a3a", pants: "#6b4a2f", boots: "#3a2a20", hat: "hair", hair: "#d9a441", skin: SKIN };
const LADY: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#d9a441", skin: "#ecd0b6" };
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
const B_ = who(BARBER, 3, "barber"), C_ = who(PATIENT, 7, "patient"), W_ = who(LADY, 11, "passerby");

/** drawing size by distance: [canvas w, h, scale from the 600 x 1000 design] */
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
type Pose = { expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; blink?: number; sit?: boolean; side?: { phase: number; mirror: boolean; stride?: number } };

// ---------------- world ----------------
export class BWorld {
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
  private shop: Shop; private pole: Pole; private staff: Staff; private sillG: { g: THREE.Group; bowls: BloodBowl[] };
  private banned: THREE.Mesh; private surgeon: Board; private jobs: Board; private flag: Flag;
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
    // ---- the barber's shop out on the meadow ----
    this.shop = buildShop(R, SHOP[0], SHOP[1], SHOP[2]);
    // ---- the shop front on the main street (west row): a solid block behind it in case the row has a gap ----
    const fb = new Batch();
    fb.add(boxGeo(V(-10, D0, FRONT.z0 - 0.4), V(FRONT.x - 0.01, D0 + 4.6, FRONT.z1 + 0.4), 2), lam("frontBlock", () => ({ map: stoneHD("frontBlockHD", ["#d8c7a8", "#cdbb9b", "#e2d2b4", "#c4b293"], "#9c8a70") })));
    fb.build(R);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(FRONT.z1 - FRONT.z0, FRONT.h), lam("barberFront", () => ({ map: frontTex() })));
    panel.rotation.y = Math.PI / 2; panel.position.set(FRONT.x, D0 + FRONT.h / 2, (FRONT.z0 + FRONT.z1) / 2); panel.receiveShadow = true; R.add(panel);
    this.sillG = sill(); this.sillG.g.position.set(...SILL); R.add(this.sillG.g);
    this.banned = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.94), new THREE.MeshBasicMaterial({ map: bannedTex(), transparent: true, depthWrite: false, toneMapped: false }));
    this.banned.layers.set(NOINK); this.banned.renderOrder = 5; this.banned.rotation.y = Math.PI / 2; this.banned.position.set(-5.55, D0 + 1.72, SILL[2]); R.add(this.banned);
    this.pole = new Pole(1.2, 0.13); this.pole.group.position.set(...POLE); R.add(this.pole.group);
    this.staff = new Staff(1.25); this.staff.group.position.set(...POLE); R.add(this.staff.group);
    this.flag = new Flag("usFlag1859", usFlagTex, 3.3, 1.3); this.flag.group.position.set(...FLAG); this.flag.group.rotation.y = Math.PI / 2; R.add(this.flag.group);
    // ---- boards in the shop ----
    this.surgeon = new Board(1.5, 0.59, "barberSurgeon", surgeonTex); this.surgeon.group.position.set(...S(-0.95, 2.45, 0.9)); R.add(this.surgeon.group);
    this.jobs = new Board(1.6, 0.66, "jobs_0", () => jobsTex(0)); this.jobs.group.position.set(...S(0, 2.38, 1.45)); R.add(this.jobs.group);
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
    const pop = (f0: number) => { const k = smooth((f - (f0 - 3)) / 7); return k <= 0.001 ? 0 : k * (1 + 0.14 * Math.sin(clamp01((f - f0) / 10) * Math.PI)); };
    const setPop = (o: THREE.Object3D, k: number) => { o.visible = k > 0.001; o.scale.setScalar(Math.max(0.001, k)); };
    const w = (seg: number, x: string) => wordAt(seg, x);
    const street = id === 1 || id >= 6;
    // the pole: modern red-white-blue in the hook, red-white from the dissolve, blue again on "blue"
    const poleOn = id === 1 || id >= 9;
    this.pole.group.visible = poleOn && street;
    this.pole.spin(t, id === 1 || id === 12 ? 0.35 : 0.12);
    this.pole.setBlue(id === 1 || (id === 12 && f >= w(15, "blue") - 2));
    const fBowl = w(14, "bowl");
    this.pole.ball.visible = !(id === 11 && f >= fBowl - 2);
    this.pole.bowl.visible = id === 11 && f >= fBowl - 2;
    if (this.pole.bowl.visible) this.pole.bowl.scale.setScalar(Math.max(0.001, pop(fBowl)));
    // the staff: hanging bandages (7), twisting (8), fully wrapped under the dissolve (9)
    this.staff.group.visible = (id === 7 || id === 8 || id === 9) && street;
    this.staff.wrap(id === 7 ? 0 : id === 8 ? smooth((f - (A(8) + 4)) / Math.max(1, SHOTS[7].b - SHOTS[7].a - 10)) : 1, t);
    // flag on "flag"
    this.flag.wave(t);
    setPop(this.flag.group, id === 12 ? pop(w(16, "flag")) : 0);
    // window bowls and the BANNED stamp
    for (const b of this.sillG.bowls) b.setFill(0.9);
    const fBan = w(8, "banned") - 3;
    this.banned.visible = id === 6 && f >= fBan;
    if (this.banned.visible) { const u = clamp01((f - fBan) / 5); this.banned.scale.setScalar(1.6 - 0.6 * u); (this.banned.material as THREE.MeshBasicMaterial).opacity = u; }
    // shop boards
    setPop(this.surgeon.group, id === 2 ? pop(w(2, "surgeon")) : 0);
    const nJobs = id !== 3 ? 0 : f >= w(3, "blood") ? 3 : f >= w(3, "teeth") ? 2 : f >= w(3, "hair") ? 1 : 0;
    this.jobs.setFace(`jobs_${nJobs}`, () => jobsTex(nJobs)); this.jobs.group.visible = id === 3;
    // the bowl: drops fall on "cut", the bowl fills from "ran"
    const sh = this.shop, fCut = w(5, "cut"), fRan = w(6, "ran"), bowlTop = S(-1.35, 1.45, 0.35);
    sh.bowl.setFill(id < 5 ? 0 : id > 5 ? 0.85 : f < fCut ? 0 : f < fRan ? 0.15 * smooth((f - fCut) / 20) : 0.15 + 0.7 * smooth((f - fRan) / 40));
    sh.drops.forEach((d, k) => {
      const f0 = fCut + k * 9, u = (f - f0) / 9;
      d.visible = id === 5 && u >= 0 && (f < fRan + 30 ? true : false);
      const uu = ((u % 1) + 1) % 1;
      d.position.set(bowlTop[0] + (k - 1) * 0.03, bowlTop[1] - uu * 0.55, bowlTop[2]);
    });
    // the staff in the patient's hand (shots 3, 4)
    sh.heldStaff.visible = id === 3 || id === 4;
    sh.heldStaff.position.set(...S(0.27, 0.95, 0.42));


    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const people: { w: Who; p: V3; pose: Pose }[] = [];
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n * 2.3; return ph < 0.13 ? 1 : 0; };
    switch (id) {
      case 2: people.push({ w: B_, p: S(0.85, 0, 1.05), pose: { expr: f > w(2, "surgeon") ? "grin" : "smile", look: -1, blink: blink(3) } }); break;
      case 3:
        people.push({ w: C_, p: S(0, 0, 0.55), pose: { expr: f > w(3, "blood") ? "shock" : f > w(3, "teeth") ? "nervous" : "smile", sit: true, blink: blink(7) } });
        people.push({ w: B_, p: S(0.95, 0, 1.15), pose: { expr: "grin", look: -1, blink: blink(3) } });
        break;
      case 4: people.push({ w: C_, p: S(0, 0, 0.55), pose: { expr: "pained", sit: true, blink: blink(7) } }); break;
      case 6: people.push({ w: W_, p: [-3.7, D0, 100.9], pose: { expr: f > w(7, "windows") ? "shock" : "neutral", look: 1, blink: blink(11) } }); break;
    }
    this.lastPeople = people.map((q) => ({ name: q.w.key, p: q.p, walking: !!q.pose.side }));
    let ai = 0;
    for (const q of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, chh, k] = tier(d), a = this.actor(ai++), Pz = q.pose;
      const mirror = !!Pz.side && Pz.side.mirror;
      const light = mirror ? Math.PI - lightA : lightA;
      const key = Pz.side
        ? `S|${q.w.key}|${Pz.expr}|${Math.round(Pz.side.phase * 16)}|${Pz.blink ?? 0}|${light.toFixed(2)}`
        : `F|${q.w.key}|${Pz.expr}|${Pz.look ?? 0}|${(Pz.headTilt ?? 0).toFixed(2)}|${Pz.facing ?? 0}|${Pz.blink ?? 0}|${Pz.sit ? 1 : 0}|${light.toFixed(2)}`;
      a.r = this.pool.req(key, cw, chh, k, (p: Pen) => Pz.side
        ? bodySide(p, q.w.o, { mode: "march", phase: Math.round(Pz.side.phase * 16) / 16, expr: Pz.expr, blink: Pz.blink, stride: Pz.side.stride ?? 0.8, stomp: 0.6, light, seed: q.w.seed })
        : bodyFront(p, q.w.o, { mode: Pz.sit ? "sit" : "stand", expr: Pz.expr, look: Pz.look ?? 0, headTilt: Pz.headTilt ?? 0, facing: Pz.facing ?? 0, blink: Pz.blink, light, seed: q.w.seed }));
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
    const s = SHOTS[id - 1], w = (seg: number, x: string) => wordAt(seg, x), all = (n: string, p: THREE.Vector3, r: number, o?: THREE.Object3D): [string, THREE.Vector3, number, number, number, THREE.Object3D?] => [n, p, r, s.a, s.b, o];
    switch (id) {
      case 1: return [all("pole", V(...POLE), 0.2, this.pole.group), ["pole top", V(...P(0, 0.75, 0)), 0.05, s.a, w(1, "blood") - 4, this.pole.group]];
      case 2: return [["SURGEON board", this.surgeon.pos(), 0.2, w(2, "surgeon") + 4, s.b, this.surgeon.group]];
      case 3: return [["jobs board", this.jobs.pos(), 0.2, s.a, s.b, this.jobs.group]];
      case 4: return [all("held staff", V(...S(0.27, 0.95, 0.42)), 0.05, this.shop.heldStaff)];
      case 5: return [all("bowl", V(...S(-1.35, 0.92, 0.35)), 0.08, this.shop.bowl.group)];
      case 6: return [all("window bowls", V(SILL[0], SILL[1] + 0.1, SILL[2]), 0.3, this.sillG.g)];
      case 7: case 8: return [all("staff", V(...POLE), 0.1, this.staff.group)];
      case 9: case 10: return [all("pole", V(...POLE), 0.1, this.pole.group)];
      case 11: return [all("ball on top", V(...P(0, 0.75, 0)), 0.05, this.pole.group)];
      case 12: return [["pole", V(...POLE), 0.1, s.a, s.b, this.pole.group], ["flag", this.flag.clothPos(), 0.2, w(16, "flag") + 6, SHOTS[11].b - 40, this.flag.group]];
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

