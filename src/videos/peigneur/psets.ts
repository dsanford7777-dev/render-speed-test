// The Lake Peigneur Short: the two sets. Built to claude/background-and-character-look.md and the production checklist
// (Nov 20-21 additions): every support reaches the ground or the water, trees keep clear of every structure, nothing
// floats, far ground has texture, water is never one flat plane, props read as what they are.
//   buildLake   the lake, Jefferson Island, the rig, the barges and the tug, the fisherman's skiff, the canal, the
//               whirlpool, the crater and the waterfall
//   buildMine   one room of the salt mine: pillars, lamps, a loader, the shaft station with the elevator cage
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD } from "../bridge/paint";
import { dustMotes, rockGeo, rockTex, mergeFacets, pineGeo, bushGeo } from "../bridge/scenery";
import { M, T, shadowAll, glow, sheet, nz, rodGeo } from "../frozen/fsets";
import { foamTex } from "../frozen/fpaint";
import { brickTex, puffTex } from "../frozen/paint";
import { NOINK } from "../bridge/ink";
import { caSkyTex, signTex } from "../cahaba/cpaint";
import { SET, LC, AX, AZ, BED, IC, IR, HOLE, HOUSE_F, PAD, PAD_Y, builtY, footprint, terraceW, RC, CANAL_Z, CANAL_X0, CANAL_X1, CANAL_HW, W0, HOUSE, HEADFRAME, CHIMNEY, groundY, groundAfter, islandY, craterY, RIG, BARGES, TUG,
  ROOF, PIL, PILLARS, END_Z, CAGE, BREACH, MINE_W, SHAFT_W, SHAFT_H, SHAFT_D } from "./place";
import { saltTex, swirlTex, flowTex, groundTex, hullTex, mudTex, mossTex } from "./ppaint";

const M4 = (x: number, y: number, z: number, ry = 0, s = 1) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(s, s, s));
const beamGeo = (a: THREE.Vector3, c: THREE.Vector3, w: number, t: number) => { const d = c.clone().sub(a), g = new THREE.BoxGeometry(w, d.length(), t); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize())); g.translate((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2); return g; };
/** a sky all the way round (an open cylinder seen from inside), so every camera direction has a backdrop */
const skyPl = (G: THREE.Object3D, kind: Parameters<typeof caSkyTex>[0], x: number, z: number, r: number, h: number, y0: number) => { const tx = caSkyTex(kind).clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(4, 1); tx.needsUpdate = true; const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64, 1, true), new THREE.MeshBasicMaterial({ map: tx, fog: false, depthWrite: false, side: THREE.BackSide })); m.position.set(x, y0 + h / 2, z); m.renderOrder = -5;
  // a lid in the sky's top colour, so a camera tilted up never sees past the cylinder's rim
  let top = new THREE.Color("#7fb0dc"); const im = tx.image as HTMLCanvasElement | undefined;
  try { const d = im?.getContext?.("2d")?.getImageData(Math.floor(im.width / 2), 1, 1, 1).data; if (d) top = new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255).convertSRGBToLinear(); } catch { /* keep the default */ }
  const lid = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshBasicMaterial({ color: top, fog: false, depthWrite: false, side: THREE.DoubleSide }));
  lid.rotation.x = Math.PI / 2; lid.position.y = h / 2 - 0.5; lid.renderOrder = -5; m.add(lid); G.add(m); return m; };

// =====================================================================================================================
/** lake water: moving waves, glints, fresnel to the sky; a round hole (the whirlpool) and a front (mine water running
 *  across the floor: nothing beyond z = uFront) can be cut out of it */
export const pWater = (deep: string, shallow: string, sky: string, key: string) => {
  const U = { uTime: { value: 0 }, uSun: { value: new THREE.Vector3(0.5, 0.4, -0.7) }, uDeep: { value: new THREE.Color(deep) }, uShal: { value: new THREE.Color(shallow) }, uSky: { value: new THREE.Color(sky) },
    uAmp: { value: 1 }, uHole: { value: new THREE.Vector2(0, 0) }, uHoleR: { value: 0 }, uFront: { value: 1e6 }, uPull: { value: 0 } };
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float uTime, uAmp;\nvarying vec3 vWP; varying vec3 vWN;\nfloat wv(vec2 p){ return 0.11*sin(p.x*0.9+uTime*1.3)+0.07*sin(p.y*1.3-uTime*1.7+p.x*0.4)+0.04*sin((p.x+p.y)*2.6+uTime*2.4)+0.025*sin(p.x*5.1-p.y*3.7+uTime*3.1); }")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvec4 wp0 = modelMatrix * vec4(position, 1.0);\nfloat hh = wv(wp0.xz) * uAmp;\ntransformed.y += hh;\nfloat ex = (wv(wp0.xz + vec2(0.15, 0.0)) - wv(wp0.xz - vec2(0.15, 0.0))) * uAmp / 0.3, ez = (wv(wp0.xz + vec2(0.0, 0.15)) - wv(wp0.xz - vec2(0.0, 0.15))) * uAmp / 0.3;\nvWN = normalize(vec3(-ex, 1.0, -ez));\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uTime, uHoleR, uFront, uPull; uniform vec2 uHole; uniform vec3 uSun, uDeep, uShal, uSky; varying vec3 vWP; varying vec3 vWN;\nfloat hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }")
      .replace("#include <map_fragment>", `
  float dh = length(vWP.xz - uHole);
  if (dh < uHoleR || vWP.z > uFront) discard;
  vec3 Vd = normalize(cameraPosition - vWP); vec3 N = normalize(vWN);
  float fr = pow(1.0 - max(dot(N, Vd), 0.0), 3.0);
  vec3 wc = mix(uShal, uDeep, clamp(0.35 + 0.5 * N.x + 0.3 * sin(vWP.x * 0.21 + vWP.z * 0.13), 0.0, 1.0));
  wc = mix(wc, uSky, 0.25 + 0.6 * fr);
  vec2 cg = floor(vWP.xz * 3.0 + vec2(uTime * 0.6, uTime * 0.25)); float fl = step(0.965, hs(cg)) * smoothstep(0.02, 0.09, vWP.y - floor(vWP.y));
  wc = mix(wc, vec3(0.95, 0.97, 1.0), fl * 0.75);
  // the pull toward the hole: spiral foam lines round it, thicker close in
  // Nov 22 (Daniel: the wide white rings read as gaps in the water): thin, broken, lighter-water streaks on log spirals,
  // and the water darkens a little toward the hole (the funnel's rim is painted that colour, so they meet without a seam)
  if (uPull > 0.0) { vec2 dv = vWP.xz - uHole; float ang = atan(dv.y, dv.x); float k = smoothstep(uHoleR * 2.6, uHoleR, dh) * uPull;
    float sp = 0.5 + 0.5 * sin(ang * 7.0 + log(max(dh, 1.0)) * 9.0 - uTime * 2.6), br = hs(floor(vec2(ang * 9.0, dh * 0.35)));
    wc = mix(wc, wc * 1.22 + vec3(0.04), k * smoothstep(0.9, 0.985, sp) * (0.35 + 0.65 * br) * 0.7); wc *= 1.0 - 0.18 * k; }
  // a white foam edge where the mine water runs over the floor
  if (uFront < 1e5) { float e = smoothstep(uFront - 2.5, uFront, vWP.z); wc = mix(wc, vec3(0.95, 0.96, 0.95), e * (0.6 + 0.4 * sin(vWP.x * 3.0 + uTime * 8.0))); }
  vec3 Hh = normalize(normalize(uSun) + Vd); float sp2 = pow(max(dot(N, Hh), 0.0), 120.0);
  diffuseColor.rgb = wc + vec3(1.0, 0.92, 0.78) * sp2 * 2.2;`)
      .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * 0.62; reflectedLight.indirectDiffuse = diffuseColor.rgb * 0.38;");
  };
  m.customProgramCacheKey = () => "pgWater_" + key;
  return { mat: m, U };
};

/** a ribbon of running water along a path (stream, waterfall), width w; its texture scrolls (offset.y) */
const ribbon = (pts: THREE.Vector3[], w: number, tex: THREE.Texture, n = 80, floor?: (x: number, z: number) => number) => {
  const cv = new THREE.CatmullRomCurve3(pts), pos: number[] = [], uv: number[] = [], idx: number[] = []; let len = 0, prev = cv.getPoint(0);
  // `floor` (the ground's height, world x/z) keeps both edges just above the ground between the control points, so the
  // water lies in its bed instead of floating over it or sinking under it (Nov 22)
  const yAt = (x: number, z: number, y: number) => (floor ? Math.max(y, floor(x, z) + 0.12) : y + 0.05);
  for (let i = 0; i <= n; i++) { const u = i / n, p = cv.getPoint(u), tg = cv.getTangent(u); len += p.distanceTo(prev); prev = p;
    const side = V(-tg.z, 0, tg.x).normalize().multiplyScalar(w / 2);
    pos.push(p.x - side.x, yAt(p.x - side.x, p.z - side.z, p.y), p.z - side.z, p.x + side.x, yAt(p.x + side.x, p.z + side.z, p.y), p.z + side.z); uv.push(0, len / w, 1, len / w);
    if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, side: THREE.DoubleSide, fog: true, depthWrite: false });
  const m = new THREE.Mesh(g, mat); m.renderOrder = 2; return m;
};

// =====================================================================================================================
export type Barge = { g: THREE.Group };
export type LakeSet = {
  group: THREE.Group; pre: THREE.Mesh; post: THREE.Mesh; water: ReturnType<typeof pWater>; waterMesh: THREE.Mesh; canal: THREE.Mesh; funnel: THREE.Mesh; funnelTex: THREE.Texture;
  stream: THREE.Mesh; fall: THREE.Mesh; flowT: THREE.Texture[]; rig: THREE.Group; pipe: THREE.Group; barges: THREE.Group[]; tug: THREE.Group; skiff: THREE.Group;
  slump: THREE.Group; chimney: THREE.Group; today: THREE.Group; skies: Record<"morn" | "day", THREE.Mesh>; foam: THREE.Mesh[]; mist: ReturnType<typeof dustMotes>; drift: (t: number) => void;
  turf: (x: number, z: number) => number | null;
};

/** a lattice derrick: four legs tapering from base b (half width) at y0 to top t at y1, girts and X braces each bay */
const derrick = (bt: Batch, steel: THREE.Material, y0: number, y1: number, b: number, t: number) => {
  const bays = 9, L = (y: number) => b + (t - b) * (y - y0) / (y1 - y0);
  const corner = (sx: number, sz: number, y: number) => V(sx * L(y), y, sz * L(y));
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) bt.add(beamGeo(corner(sx, sz, y0), corner(sx, sz, y1), 0.5, 0.5), steel);
  for (let k = 0; k <= bays; k++) { const y = y0 + ((y1 - y0) * k) / bays;
    for (const [a, c] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]] as [number, number][][]) bt.add(beamGeo(corner(a[0], a[1], y), corner(c[0], c[1], y), 0.3, 0.3), steel);
    if (k < bays) { const yn = y0 + ((y1 - y0) * (k + 1)) / bays;
      for (const [a, c] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]] as [number, number][][]) {
        // the bottom bay is open on the -z and -x faces (the V-door side), so the crew on the floor can be seen
        if (k === 0 && (a[1] === -1 && c[1] === -1 || a[0] === -1 && c[0] === -1)) continue;
        bt.add(beamGeo(corner(a[0], a[1], y), corner(c[0], c[1], yn), 0.18, 0.18), steel); bt.add(beamGeo(corner(c[0], c[1], y), corner(a[0], a[1], yn), 0.18, 0.18), steel); } } }
  // the crown block and its frame on top
  bt.add(boxGeo(V(-t - 0.6, y1, -t - 0.6), V(t + 0.6, y1 + 0.6, t + 0.6), 0, true), steel); bt.add(boxGeo(V(-1.1, y1 + 0.6, -0.8), V(1.1, y1 + 2.2, 0.8), 0, true), steel);
};

/** a deck barge, length L, beam B: a raked steel hull with a coaming, deck cargo by kind */
const barge = (L: number, B: number, kind: number) => {
  const g = new THREE.Group(), bt = new Batch(), hull = lam("pgHullB" + (kind % 2), () => ({ map: hullTex("b" + (kind % 2), kind % 2 ? "#5a3a30" : "#4a4a4e") })), deck = M("pgDeck", "#5a5248"), rust = M("pgRust", "#8a4a2a");
  const hl = L / 2, hb = B / 2, fb = 1.6;
  bt.add(boxGeo(V(-hl + 2.5, -1.4, -hb), V(hl - 2.5, fb, hb), 4), hull);
  for (const s of [-1, 1]) { const x0 = s * (hl - 2.5), x1 = s * hl; const sh = new THREE.Shape([new THREE.Vector2(0, -1.4), new THREE.Vector2(0, fb), new THREE.Vector2((x1 - x0), fb), new THREE.Vector2(0, -1.4)]);
    const eg = new THREE.ExtrudeGeometry(sh, { depth: B, bevelEnabled: false }); eg.translate(x0, 0, -hb); bt.add(eg, hull); }
  bt.add(boxGeo(V(-hl + 0.3, fb, -hb), V(hl - 0.3, fb + 0.08, hb)), deck);
  for (const s of [-1, 1]) bt.add(boxGeo(V(-hl + 0.6, fb, s * hb - (s > 0 ? 0.35 : 0)), V(hl - 0.6, fb + 0.6, s * hb + (s < 0 ? 0.35 : 0))), rust);
  if (kind % 3 === 0) { // pipe stacked on racks
    for (let r = 0; r < 3; r++) for (let k = 0; k < 6 - r; k++) bt.add(new THREE.CylinderGeometry(0.32, 0.32, L * 0.7, 10).rotateZ(Math.PI / 2).translate(0, fb + 0.4 + r * 0.6, -1.6 + k * 0.66 + r * 0.33), M("pgPipe", "#6a6e76"));
    for (const x of [-L * 0.25, 0, L * 0.25]) bt.add(boxGeo(V(x - 0.2, fb, -2.4), V(x + 0.2, fb + 0.3, 2.4)), rust);
  } else if (kind % 3 === 1) { // mud tanks and a pump house
    for (const x of [-L * 0.22, L * 0.05]) bt.add(new THREE.CylinderGeometry(2.0, 2.0, 7, 16).rotateZ(Math.PI / 2).translate(x, fb + 2.0, 0), M("pgTank", "#8a8a7a"));
    bt.add(boxGeo(V(L * 0.22, fb, -2.2), V(L * 0.38, fb + 3, 2.2), 2), lam("pgShed", () => ({ map: planksHD(), color: "#b9b2a0" })));
  } else { // sacks and drums under a tarp
    for (let k = 0; k < 14; k++) bt.add(new THREE.CylinderGeometry(0.4, 0.4, 1.1, 10).translate(-L * 0.3 + (k % 7) * 1.0, fb + 0.55, -1 + Math.floor(k / 7) * 1.1), M(k % 3 ? "pgDrumB" : "pgDrumR", k % 3 ? "#3a5a7a" : "#9a3a2a"));
    bt.add(boxGeo(V(0, fb, -2.5), V(L * 0.32, fb + 1.6, 2.5)), M("pgTarp", "#5a6a44"));
  }
  bt.build(g, true); return g;
};
/** the tug: a hull with a raised bow, a cabin with windows, a stack, tyre fenders */
const tug = () => {
  const g = new THREE.Group(), bt = new Batch(), hull = lam("pgTugHull", () => ({ map: hullTex("tug", "#2a3a4a") })), white = M("pgTugCab", "#e9e4d6"), red = M("pgTugRed", "#a33a2a"), win = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.18, 0.24, 0.3), fog: true });
  const hs = new THREE.Shape([new THREE.Vector2(-9, -1.6), new THREE.Vector2(7, -1.6), new THREE.Vector2(10.5, 1.8), new THREE.Vector2(-9.5, 1.4)]); const he = new THREE.ExtrudeGeometry(hs, { depth: 7, bevelEnabled: false }); he.translate(0, 0, -3.5); bt.add(he, hull);
  bt.add(boxGeo(V(-9.2, 1.4, -3.5), V(10, 1.75, 3.5)), red);
  bt.add(boxGeo(V(-4.5, 1.6, -2.4), V(3.5, 4.4, 2.4), 2), white); bt.add(boxGeo(V(-2.5, 4.4, -2.0), V(2.6, 6.6, 2.0), 2), white); bt.add(boxGeo(V(-2.8, 6.6, -2.3), V(2.9, 6.9, 2.3)), red);
  for (const z of [-2.02, 2.02]) for (let k = 0; k < 4; k++) { const w2 = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.8), win); w2.position.set(-1.8 + k * 1.2, 5.6, z * (z < 0 ? 1.005 : 1.005)); w2.rotation.y = z < 0 ? Math.PI : 0; g.add(w2); }
  { const w3 = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.8), win); w3.rotation.y = -Math.PI / 2; w3.position.set(2.62, 5.6, 0); g.add(w3); }
  bt.add(new THREE.CylinderGeometry(0.6, 0.7, 3.2, 12).translate(-3.6, 6.0, 0), red); bt.add(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 12).translate(-3.6, 7.6, 0), M("pgStackTop", "#1e1e22"));
  for (let k = 0; k < 7; k++) for (const z of [-3.55, 3.55]) bt.add(new THREE.TorusGeometry(0.45, 0.18, 6, 12).translate(-7 + k * 2.3, 0.9, z), M("pgTyre", "#1a1a1e"));
  bt.build(g, true); return g;
};
/** the fisherman's skiff: an open hull (sides, floorboards, two thwarts) and an outboard */
const skiff = () => {
  const g = new THREE.Group(), bt = new Batch(), hull = M("pgSkiff", "#7a8a6a"), wood = lam("pgSkiffWood", () => ({ map: planksHD(), color: "#9a7a52" }));
  bt.add(boxGeo(V(-2.3, -0.2, -0.75), V(2.3, -0.1, 0.75)), wood);
  for (const s of [-1, 1]) bt.add(boxGeo(V(-2.3, -0.3, s * 0.75 - 0.05), V(2.3, 0.45, s * 0.75 + 0.05)), hull);
  bt.add(boxGeo(V(-2.35, -0.3, -0.8), V(-2.25, 0.45, 0.8)), hull);
  const bow = new THREE.Shape([new THREE.Vector2(-0.8, -0.3), new THREE.Vector2(0.8, -0.3), new THREE.Vector2(0.8, 0.45), new THREE.Vector2(-0.8, 0.45)]); void bow;
  for (const s of [-1, 1]) bt.add(beamGeo(V(2.3, -0.1, s * 0.75), V(3.0, 0.3, 0), 0.08, 0.7), hull);
  for (const x of [-0.6, 1.0]) bt.add(boxGeo(V(x - 0.15, 0.12, -0.72), V(x + 0.15, 0.2, 0.72)), wood);
  bt.add(boxGeo(V(-2.75, 0.1, -0.2), V(-2.3, 0.8, 0.2)), M("pgMotor", "#2a2a30")); bt.add(boxGeo(V(-2.6, -0.6, -0.06), V(-2.5, 0.1, 0.06)), M("pgMotor", "#2a2a30"));
  bt.build(g, true); return g;
};
/** a live oak: a short thick trunk, long low limbs, a broad dark canopy, moss hanging */
const oak = (fol: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[], bark: typeof fol, moss: THREE.Vector3[], x: number, y: number, z: number, s: number, seed: number) => {
  const t = new THREE.CylinderGeometry(0.5 * s, 0.85 * s, 3.2 * s, 7); t.translate(0, 1.6 * s, 0); bark.push({ g: t, m: M4(x, y - 0.2, z, seed) });
  for (let k = 0; k < 4; k++) { const a = seed + k * 1.7, l = 5.5 * s; bark.push({ g: rodGeo(V(0, 2.8 * s, 0), V(Math.cos(a) * l, 4.2 * s, Math.sin(a) * l), 0.3 * s), m: M4(x, y, z) });
    fol.push({ g: bushGeo(3.0 * s, seed * 7 + k, 4), m: M4(x + Math.cos(a) * l * 0.9, y + 3.4 * s, z + Math.sin(a) * l * 0.9, a), tint: 0.85 + 0.2 * ((seed + k) % 3) / 2 });
    moss.push(V(x + Math.cos(a) * l * 0.7, y + 3.6 * s, z + Math.sin(a) * l * 0.7)); }
  fol.push({ g: bushGeo(3.6 * s, seed * 3 + 1, 5), m: M4(x, y + 4.4 * s, z, seed), tint: 0.95 });
};
/** a bald cypress at the water's edge: a fluted base, a tall straight trunk, a flat-topped crown */
const cypress = (fol: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[], bark: typeof fol, x: number, y: number, z: number, h: number, seed: number) => {
  const b = new THREE.CylinderGeometry(0.35, 1.1, 2.0, 8); b.translate(0, 1.0, 0); bark.push({ g: b, m: M4(x, y - 0.3, z) });
  const t = new THREE.CylinderGeometry(0.22, 0.35, h * 0.85, 6); t.translate(0, h * 0.45, 0); bark.push({ g: t, m: M4(x, y, z) });
  for (let k = 0; k < 3; k++) { const g = bushGeo(h * 0.16, seed + k * 5, 4); g.scale(1.3, 0.55, 1.3); fol.push({ g, m: M4(x + (k - 1) * 0.6, y + h * (0.62 + 0.13 * k), z + ((k * 5) % 3 - 1) * 0.5, seed + k), tint: 0.8 + 0.25 * (k % 2) }); }
};

export function buildLake(): LakeSet {
  const G = new THREE.Group(), ox = SET.lake[0];
  const gT = groundTex();
  // ---- the ground: lake bed, shores, the island, the canal; a second sheet with the crater for after the hole opened ----
  const colorAt = (x: number, z: number, y: number, after: boolean) => {
    const cr = after ? craterY(x, z) : 99, inC = cr < 50 && cr <= groundY(x, z) + 0.01;
    const k = 0.92 + 0.12 * Math.sin(x * 0.13 + z * 0.07) + 0.06 * Math.sin(x * 0.7 - z * 0.5);
    if (inC) { const d = (BED - y) / 45; return new THREE.Color().setRGB(0.36 * k - 0.08 * d, 0.3 * k - 0.07 * d, 0.24 * k - 0.05 * d); }
    if (y < -1.2) return new THREE.Color().setRGB(0.42 * k, 0.37 * k, 0.29 * k);            // lake bed mud
    if (y < 0.8) return new THREE.Color().setRGB(0.56 * k, 0.5 * k, 0.37 * k);              // the beach line
    const isl = islandY(x, z) > 0.5 ? 1 : 0;
    return new THREE.Color().setRGB((0.3 - 0.04 * isl) * k, (0.48 - 0.03 * isl) * k, (0.2 - 0.02 * isl) * k);   // grass
  };
  const mkGround = (fy: (x: number, z: number) => number, after: boolean) => {
    const g = sheet(ox - 720, ox + 720, -320, 720, 300, 220, (x, z) => { const h = fy(x - ox, z), w = Math.min(1, Math.max(0, (h - 0.7) / 3.3)); return h + nz(x, z) * 3 * w * w * (3 - 2 * w) * (1 - terraceW(x - ox, z)); }, 7);  // the bumps fade in: a hard step at the 0.7 contour drew ink lines across the lawns
    const p = g.attributes.position as THREE.BufferAttribute, cols = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const c = colorAt(p.getX(i) - ox, p.getZ(i), p.getY(i), after); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const m = new THREE.Mesh(g, lam("pgGround" + (after ? "A" : "B"), () => ({ map: gT, vertexColors: true }))); m.receiveShadow = true; G.add(m); return m; };
  const pre = mkGround(groundY, false), post = mkGround(groundAfter, true);
  // the crater's walls close up: wet mud with drips (only after)
  { const g = sheet(ox + HOLE.x - RC - 4, ox + HOLE.x + RC + 4, HOLE.z - RC - 4, HOLE.z + RC + 4, 120, 120, (x, z) => { const c = craterY(x - ox, z); return c < 50 ? Math.min(groundY(x - ox, z), c) + 0.04 : -999; }, 9);
    const p = g.attributes.position as THREE.BufferAttribute, keep: number[] = []; const idx = g.index!;
    for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2); if (p.getY(a) > -900 && p.getY(b) > -900 && p.getY(c) > -900) keep.push(a, b, c); }
    g.setIndex(keep); g.computeVertexNormals();
    const m = new THREE.Mesh(g, T("pgMudM", () => mudTex(), { transparent: false })); m.receiveShadow = true; post.add(m); m.position.set(0, 0, 0); }
  // ---- water: the lake (a hole can open in it), the canal, the whirlpool's funnel, the stream and the waterfall ----
  const water = pWater("#30473c", "#5c7458", "#b8c9cf", "lake"); water.U.uAmp.value = 0.25; water.U.uHole.value.set(ox + HOLE.x, HOLE.z);
  const wg = new THREE.PlaneGeometry(1000, 640, 200, 128); wg.rotateX(-Math.PI / 2); wg.translate(ox + LC.x, 0, LC.z + 20);
  const waterMesh = new THREE.Mesh(wg, water.mat); waterMesh.receiveShadow = true; G.add(waterMesh);
  const canalG = new THREE.PlaneGeometry(CANAL_X1 - CANAL_X0 + 40, CANAL_HW * 2 + 6, 60, 6); canalG.rotateX(-Math.PI / 2); canalG.translate(ox + (CANAL_X0 + CANAL_X1) / 2 + 20, 0, CANAL_Z);
  const canal = new THREE.Mesh(canalG, water.mat); canal.receiveShadow = true; G.add(canal);
  const funnelTex = swirlTex();
  const lathe = new THREE.LatheGeometry(Array.from({ length: 33 }, (_, i) => { const r = 1 - i / 32; return new THREE.Vector2(Math.max(0.004, r), -Math.pow(1 - r, 2.5)); }), 64);
  { const uv = lathe.attributes.uv as THREE.BufferAttribute, p = lathe.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + 0.5 * p.getX(i), 0.5 + 0.5 * p.getZ(i)); }
  // unlit like the lake's water (pWater replaces the lighting with its own colour), so the rim matches the lake exactly
  const funnel = new THREE.Mesh(lathe, new THREE.MeshBasicMaterial({ map: funnelTex, side: THREE.DoubleSide, fog: true })); funnel.layers.set(NOINK); funnel.visible = false; G.add(funnel);
  const flowA = flowTex("stream", "#5e6e60", "rgba(220,226,220,0.8)"), flowB = flowTex("fall", "#7a8e8a", "rgba(240,244,244,0.9)");
  for (const t2 of [flowA, flowB]) { t2.wrapS = t2.wrapT = THREE.RepeatWrapping; }
  const bedY = (x: number, z: number) => groundAfter(x - ox, z);
  const stream = ribbon([V(ox + CANAL_X1 + 36, -0.05, CANAL_Z), V(ox + CANAL_X1 + 48, BED + 0.4, CANAL_Z), V(ox - 300, BED + 0.3, CANAL_Z - 10), V(ox - 160, BED + 0.25, W0.z + 20), V(ox + W0.x - 6, BED + 0.2, W0.z)], 16, flowA, 120, bedY); stream.visible = false; G.add(stream);
  const fallPts: THREE.Vector3[] = []; for (let i = 0; i <= 12; i++) { const u = i / 12, x = W0.x + 2 + u * 30, z = W0.z - 2 * u; fallPts.push(V(ox + x, Math.max(craterY(x, z), BED - 45) + 0.6 + (1 - u) * 1.2 * (1 - u), z)); }
  const fall = ribbon(fallPts, 14, flowB, 60, bedY); fall.visible = false; G.add(fall);
  const foam: THREE.Mesh[] = [], foamM = new THREE.MeshBasicMaterial({ map: foamTex(), transparent: true, depthWrite: false, opacity: 0.75, fog: true, color: new THREE.Color(0.92, 0.94, 0.95) });
  const ring = (x: number, z: number, s: number) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(s, s), foamM); f.rotation.x = -Math.PI / 2; f.position.set(ox + x, 0.07, z); f.renderOrder = 2; G.add(f); foam.push(f); return f; };
  // ---- trees: live oaks on the island, cypress and scrub round the shores, a far tree line; none inside the clear
  //      radius of any structure (the rig, the house, the headframe, the barges) ----
  const fol: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [], bark: typeof fol = [], cyF: typeof fol = [], cyB: typeof fol = [], scrub: typeof fol = [], moss: THREE.Vector3[] = [];
  const clear = (x: number, z: number, r: number) => [[HOUSE.x, HOUSE.z, 26], [HEADFRAME.x, HEADFRAME.z, 22], [HOLE.x, HOLE.z, RC + 6], [CHIMNEY.x, CHIMNEY.z, 10], [HOUSE.x - 28, HOUSE.z - 48, 32] /* the garden cameras stand here: no oak (or its moss) in front of the lens */].every(([a, b, c]) => Math.hypot(x - a, z - b) > c + r);
  for (let i = 0; i < 70; i++) { const a = i * 2.4, d = 20 + ((i * 37) % 95), x = IC.x + Math.cos(a) * d, z = IC.z + Math.sin(a) * d * 0.9, y = islandY(x, z); if (y < 2 || !clear(x, z, 8)) continue; oak(fol, bark, moss, ox + x, y, z, 1.0 + ((i * 7) % 5) * 0.12, i); }
  // the slump: the island's edge nearest the hole, with its oaks, as one piece that can slide into the crater
  const slump = new THREE.Group(); G.add(slump);
  { const sf: typeof fol = [], sb: typeof fol = [], sm2: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) { const x = HOLE.x + RC - 10 + (i % 3) * 9, z = HOLE.z - 16 + Math.floor(i / 3) * 14, y = Math.max(islandY(x, z), 1.5); oak(sf, sb, sm2, ox + x, y, z, 0.9 + (i % 3) * 0.1, 50 + i); }
    const chunk = new THREE.Mesh(rockGeo(16, 7, 2, 0.35), M("pgChunk", "#4a6a2e", { flatShading: true })); chunk.position.set(ox + HOLE.x + RC, -2, HOLE.z + 2); chunk.scale.set(1.4, 3.5, 1.6); chunk.castShadow = true; chunk.receiveShadow = true; slump.add(chunk);
    const ms = new THREE.Mesh(mergeFacets(sf), lam("pgOakS", () => ({ color: "#3e5a30", vertexColors: true, flatShading: true }))), mb = new THREE.Mesh(mergeFacets(sb), lam("pgBarkS", () => ({ color: "#4a3c30", vertexColors: true, flatShading: true })));
    shadowAll(ms); shadowAll(mb); slump.add(ms, mb); slump.visible = false; slump.userData.home = new THREE.Vector3(); }
  for (let i = 0; i < 300; i++) { const a = (i / 300) * 6.283 + Math.sin(i * 3.1) * 0.02, e = 1.02 + ((i * 13) % 9) * 0.012, x = LC.x + Math.cos(a) * AX * Math.sqrt(e), z = LC.z + Math.sin(a) * AZ * Math.sqrt(e), y = groundY(x, z);
    if (islandY(x, z) > 0.5 || (x < CANAL_X1 + 40 && Math.abs(z - CANAL_Z) < CANAL_HW + 10) || (z < -40 && Math.abs(x) < 170)) continue; cypress(cyF, cyB, ox + x, y, z, 13 + ((i * 7) % 6) * 1.5, i); }
  for (let i = 0; i < 520; i++) { const a = (i / 520) * 6.283, e = 1.5 + ((i * 17) % 11) * 0.08, x = LC.x + Math.cos(a) * AX * Math.sqrt(e), z = LC.z + Math.sin(a) * AZ * Math.sqrt(e), y = groundY(x, z);
    if (z < -40 && Math.abs(x) < 220) continue; if (x < CANAL_X1 + 40 && Math.abs(z - CANAL_Z) < CANAL_HW + 10) continue;
    if (i % 2) { const [f, t] = pineGeo(14 + (i % 5) * 2, 3.2, i); cyF.push({ g: f, m: M4(ox + x, y - 0.3, z, i), tint: 0.85 + 0.2 * ((i * 3) % 4) / 4 }); cyB.push({ g: t, m: M4(ox + x, y - 0.3, z, i) }); }
    else cypress(cyF, cyB, ox + x, y, z, 15 + (i % 7), i + 900); }
  for (let i = 0; i < 160; i++) { const a = (i / 160) * 6.283, e = 1.04 + ((i * 11) % 7) * 0.03, x = LC.x + Math.cos(a) * AX * Math.sqrt(e), z = LC.z + Math.sin(a) * AZ * Math.sqrt(e), y = groundY(x, z); if (islandY(x, z) > 0.5 || (z < -40 && Math.abs(x) < 170)) continue;
    scrub.push({ g: bushGeo(1.2 + (i % 4) * 0.4, i + 3, 4), m: M4(ox + x, y - 0.2, z, i), tint: 0.85 + 0.25 * ((i * 7) % 5) / 5 }); }
  const mk = (l: typeof fol, key: string, col: string) => { const ms = new THREE.Mesh(mergeFacets(l), lam(key, () => ({ color: col, vertexColors: true, flatShading: true }))); shadowAll(ms); G.add(ms); return ms; };
  mk(fol, "pgOak", "#3e5a30"); mk(bark, "pgBark", "#4a3c30"); mk(cyF, "pgCyp", "#4e6a3a"); mk(cyB, "pgCypB", "#5a4636"); mk(scrub, "pgScrub", "#5a7a3a");
  { const mm = new THREE.MeshBasicMaterial({ map: mossTex(), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, fog: true, color: new THREE.Color(0.8, 0.82, 0.76) });
    for (const p of moss) for (let k = 0; k < 2; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.6), mm); m.position.set(p.x + k * 0.8 - 0.4, p.y - 1.2, p.z + (k ? 0.5 : -0.4)); m.rotation.y = k * 1.3 + p.x; m.layers.set(NOINK); G.add(m); } }
  // ---- the island: the Jefferson house (white, a gallery, a cupola), a glasshouse, the mine headframe and its sheds,
  //      a parking lot with trucks ----
  { const hy = HOUSE_F, b = new Batch(), white = lam("pgHouseW", () => ({ map: planksHD(), color: "#ece6d8" })), roof = M("pgHouseR", "#5a4a44"), green = M("pgShutter", "#3a5a3a"), dark = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.12, 0.14, 0.18), fog: true });
    const hx = ox + HOUSE.x, hz = HOUSE.z;
    b.add(boxGeo(V(hx - 9, hy, hz - 6), V(hx + 9, hy + 8, hz + 6), 2), white);
    const rs = new THREE.Shape([new THREE.Vector2(-9.8, 0), new THREE.Vector2(0, 5.5), new THREE.Vector2(9.8, 0)]); const rg = new THREE.ExtrudeGeometry(rs, { depth: 13.4, bevelEnabled: false }); rg.translate(hx, hy + 8, hz - 6.7); b.add(rg, roof);
    b.add(boxGeo(V(hx - 1.6, hy + 12, hz - 1.6), V(hx + 1.6, hy + 15, hz + 1.6), 1), white); b.add(new THREE.ConeGeometry(2.4, 2.2, 4).rotateY(Math.PI / 4).translate(hx, hy + 16.1, hz), roof);
    b.add(boxGeo(V(hx - 10, hy + 3.6, hz - 8.4), V(hx + 10, hy + 3.9, hz - 6)), white); b.add(boxGeo(V(hx - 10.2, hy + 7.8, hz - 8.6), V(hx + 10.2, hy + 8.1, hz - 6)), roof);
    // gallery posts: each one from the ground under it to the roof edge (Nov 22: every support reaches the ground)
    for (let k = 0; k <= 8; k++) { const px2 = HOUSE.x - 9.6 + k * 2.4, g0 = builtY(px2, HOUSE.z - 8.2) - 0.3; b.add(new THREE.CylinderGeometry(0.16, 0.16, hy + 7.8 - g0, 8).translate(ox + px2, (g0 + hy + 7.8) / 2, hz - 8.2), white); }
    // the house sits level on a brick foundation that goes down to the lowest ground under it (Nov 22: on the slope the
    // uphill side used to be buried), and front steps come down from the gallery to the lawn
    { const hl = footprint(HOUSE.x, HOUSE.z - 1.3, 10.4, 7.6).lo - 0.6, brick = T("pgFound", () => brickTex("pgFoundT", ["#8a5a48", "#7a4e3e", "#9a6450"], "#b9ab96", 0.25));
      b.add(boxGeo(V(hx - 9.1, hl, hz - 6.1), V(hx + 9.1, hy + 0.02, hz + 6.1), 1), brick);
      const sg = builtY(HOUSE.x, HOUSE.z - 10.6), n = Math.max(1, Math.ceil((hy - sg) / 0.3));
      for (let k = 0; k < n; k++) b.add(boxGeo(V(hx - 1.6, sg - 0.3, hz - 8.6 - (n - k) * 0.36), V(hx + 1.6, sg + (hy - sg) * (k + 1) / n, hz - 8.6 - (n - k - 1) * 0.36)), M("pgStep", "#9a8a72")); }
    for (let k = 0; k < 6; k++) for (const yy of [2.2, 5.8]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.7), dark); w.rotation.y = Math.PI; w.position.set(hx - 7 + k * 2.8, hy + yy, hz - 6.02); G.add(w); for (const s of [-1, 1]) b.add(boxGeo(V(hx - 7 + k * 2.8 + s * 0.7 - 0.2, hy + yy - 0.85, hz - 6.12), V(hx - 7 + k * 2.8 + s * 0.7 + 0.2, hy + yy + 0.85, hz - 6.04)), green); }
    b.add(boxGeo(V(hx - 10, hy - 0.3, hz - 8.6), V(hx + 10, hy + 0.06, hz - 5.8)), M("pgPorch", "#9a8a72"));
    // a glasshouse beside it
    const glass = new THREE.MeshLambertMaterial({ color: "#cfe0e4", transparent: true, opacity: 0.55 }), gx = hx - 30, gz = hz + 4, gf = footprint(HOUSE.x - 30, HOUSE.z + 4, 6, 3), gy2 = gf.hi + 0.1;
    b.add(boxGeo(V(gx - 6.1, gf.lo - 0.4, gz - 3.1), V(gx + 6.1, gy2, gz + 3.1)), M("pgSill", "#8a7a66"));
    b.add(boxGeo(V(gx - 6, gy2, gz - 3), V(gx + 6, gy2 + 3, gz + 3)), glass); for (let k = 0; k <= 6; k++) b.add(boxGeo(V(gx - 6 + k * 2 - 0.06, gy2, gz - 3.05), V(gx - 6 + k * 2 + 0.06, gy2 + 3.4, gz + 3.05)), white);
    // the mine headframe: a steel A-frame over the shaft, two sheaves, a hoist house, a brine tank; a pad round it
    const fx = ox + HEADFRAME.x, fz = HEADFRAME.z, fy = PAD_Y, steel = M("pgFrame", "#8a8e96");
    b.add(boxGeo(V(fx - 14, PAD.lo - 0.8, fz - 12), V(fx + 14, fy, fz + 12)), M("pgPad", "#8a867c"));   // the pad is level; its edge is a low retaining wall on the downhill side
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) b.add(beamGeo(V(fx + sx * 4, fy, fz + sz * 4), V(fx + sx * 1.2, fy + 24, fz + sz * 1.2), 0.5, 0.5), steel);
    for (let y = fy + 4; y < fy + 24; y += 5) { const w = 4 - 2.8 * (y - fy) / 24; for (const [a, c] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]] as [number, number][][]) b.add(beamGeo(V(fx + a[0] * w, y, fz + a[1] * w), V(fx + c[0] * w, y, fz + c[1] * w), 0.25, 0.25), steel); }
    b.add(beamGeo(V(fx + 10, fy, fz), V(fx + 1.2, fy + 23, fz), 0.6, 0.6), steel);
    for (const s of [-0.6, 0.6]) b.add(new THREE.TorusGeometry(1.6, 0.18, 6, 18).translate(fx, fy + 25, fz + s), steel);
    b.add(boxGeo(V(fx + 9, fy, fz - 5), V(fx + 19, fy + 7, fz + 5), 2), lam("pgHoist", () => ({ map: planksHD(), color: "#a8a08a" }))); b.add(boxGeo(V(fx + 8.6, fy + 7, fz - 5.4), V(fx + 19.4, fy + 7.4, fz + 5.4)), roof);
    b.add(boxGeo(V(fx - 13, fy, fz - 11), V(fx - 5, fy + 5, fz - 3), 2), lam("pgShed2", () => ({ map: planksHD(), color: "#8a6a4a" })));
    b.add(new THREE.CylinderGeometry(3, 3, 6, 16).translate(fx - 9, fy + 3, fz + 7), M("pgBrine", "#c9c6bc"));
    // the parking lot: asphalt and pickup trucks
    const lot = footprint(HEADFRAME.x + 30, HEADFRAME.z - 18, 14, 8), px = ox + HEADFRAME.x + 30, pz = HEADFRAME.z - 18, py = lot.hi;
    b.add(boxGeo(V(px - 14, lot.lo - 0.6, pz - 8), V(px + 14, py + 0.12, pz + 8)), M("pgAsphalt", "#3e3e42"));
    for (let k = 0; k < 6; k++) { const tx = px - 11 + k * 4.4, col = ["#a33a2a", "#e9e4d6", "#3a5a7a", "#6a7a3a", "#c9a23a", "#2a2a30"][k];
      b.add(boxGeo(V(tx - 0.95, py + 0.5, pz - 2.6), V(tx + 0.95, py + 1.4, pz + 2.6)), M("pgTruck" + k, col)); b.add(boxGeo(V(tx - 0.9, py + 1.4, pz - 2.4), V(tx + 0.9, py + 2.2, pz - 0.6)), M("pgTruck" + k, col));
      for (const [wx, wz] of [[-0.95, -1.7], [0.95, -1.7], [-0.95, 1.7], [0.95, 1.7]]) b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 10).rotateZ(Math.PI / 2).translate(tx + wx, py + 0.42, pz + wz), M("pgTyre", "#1a1a1e")); }
    b.build(G, true); }
  // ---- the rig: a drilling barge sitting on the lake bed (hull to the bottom, so it stands), a deck, the derrick,
  //      the drawworks house, pipe racks, mud tanks, stairs; the drill pipe in the rotary table (it turns) ----
  const rig = new THREE.Group(), pipe = new THREE.Group(); G.add(rig); rig.add(pipe);
  { const b = new Batch(), hull = lam("pgRigHull", () => ({ map: hullTex("rig", "#7a7a72") })), steel = M("pgRigSteel", "#d9d4c6"), red = M("pgRigRed", "#b8352a"), shed = lam("pgRigShed", () => ({ map: planksHD(), color: "#c9c2ae" })), D = RIG.deck;
    b.add(boxGeo(V(-18, BED - 0.5, -12), V(18, 2.2, 12), 4, true), hull);                 // the barge hull resting on the bed
    for (const [x, z] of [[-14, -9], [14, -9], [14, 9], [-14, 9]]) b.add(boxGeo(V(x - 0.8, 2.2, z - 0.8), V(x + 0.8, D, z + 0.8)), steel);   // columns from the hull to the deck
    b.add(boxGeo(V(-16, D, -11), V(16, D + 0.6, 11), 3, true), M("pgRigDeck", "#6a6a6e"));
    for (const z of [-11, 11]) b.add(boxGeo(V(-16, D + 0.6, z - 0.06), V(16, D + 1.7, z + 0.06)), red); for (const x of [-16, 16]) b.add(boxGeo(V(x - 0.06, D + 0.6, -11), V(x + 0.06, D + 1.7, 11)), red);
    derrick(b, steel, D + 0.6, D + 0.6 + RIG.tower, 5.5, 1.2);
    b.add(boxGeo(V(-6, D + 0.6, -6), V(6, D + 1.4, 6)), M("pgFloor", "#8a8478"));                     // the drill floor
    b.add(boxGeo(V(7, D + 0.6, -5), V(15, D + 5.5, 5), 2), shed); b.add(boxGeo(V(6.6, D + 5.5, -5.4), V(15.4, D + 5.9, 5.4)), red);   // drawworks house
    for (const x of [-14, -10]) b.add(new THREE.CylinderGeometry(1.8, 1.8, 5.5, 14).translate(x, D + 3.4, 7), M("pgMudTank", "#8a8a7a"));
    for (let k = 0; k < 6; k++) b.add(new THREE.CylinderGeometry(0.18, 0.18, 12, 8).rotateZ(Math.PI / 2).translate(-7, D + 1.0 + (k % 3) * 0.36, -8.5 + Math.floor(k / 3) * 0.4 + (k % 3) * 0.2), M("pgPipe", "#6a6e76"));
    for (let k = 0; k < 10; k++) b.add(boxGeo(V(-16.8, D - k * 0.65 - 0.15, 4 - k * 0.6), V(-15.2, D - k * 0.65, 4.6 - k * 0.6)), red);
    b.add(boxGeo(V(-17, 2.2, -2), V(-15, 2.4, 2)), red);
    b.build(rig, true);
    // the kelly and the drill pipe going down into the water through the rotary table
    const k1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 14, 6), M("pgKelly", "#3a3a40")); k1.position.y = D + 7.4; pipe.add(k1);
    const k2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, D + 6, 10), M("pgPipe", "#6a6e76")); k2.position.y = (D - 6) / 2; pipe.add(k2);
    const tb = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.35, 16), M("pgTable", "#2a2a30")); tb.position.y = D + 1.55; pipe.add(tb);
    for (let i = 0; i < 6; i++) { const lug = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 1.2), M("pgLug", "#c9a23a")); lug.position.set(Math.cos(i) * 0.9, D + 1.8, Math.sin(i) * 0.9); lug.rotation.y = -i; pipe.add(lug); }
    shadowAll(pipe); rig.position.set(ox + RIG.x, 0, RIG.z); }
  // ---- barges and the tug ----
  const barges = BARGES.map(([x, z, yaw], i) => { const g = barge(30 + (i % 3) * 4, 9 + (i % 2) * 2, i); g.position.set(ox + x, 0, z); g.rotation.y = yaw; G.add(g); return g; });
  const tg = tug(); tg.position.set(ox + TUG[0], 0, TUG[1]); tg.rotation.y = TUG[2]; G.add(tg);
  const sk = skiff(); G.add(sk);
  // ---- today: the brick chimney standing in the water; a marker sign on the near shore ----
  const chimney = new THREE.Group(), today = new THREE.Group(); G.add(chimney, today);
  { const br = T("pgBrick", () => brickTex("pgBrickT", ["#9a4a34", "#8a3e2c", "#a85a40", "#7a3a2a"], "#c9b9a0", 0.2));
    const c = new THREE.Mesh(boxGeo(V(-1.3, BED - 1, -0.9), V(1.3, 9, 0.9), 1.2), br); c.position.set(ox + CHIMNEY.x, 0, CHIMNEY.z); c.castShadow = true; c.receiveShadow = true; chimney.add(c);
    const cap = new THREE.Mesh(boxGeo(V(-1.5, 9, -1.1), V(1.5, 9.4, 1.1)), br); cap.position.copy(c.position); chimney.add(cap);
    const fp = new THREE.Mesh(boxGeo(V(-0.7, 0.6, -0.95), V(0.7, 1.9, -0.89)), M("pgHearth", "#2a1e1a")); fp.position.copy(c.position); chimney.add(fp);
    ring(CHIMNEY.x, CHIMNEY.z, 7);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), M("pgPost", "#5a4a3a")); post.position.set(ox - 6, 1.4, -70); today.add(post);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.3), new THREE.MeshLambertMaterial({ map: signTex("LAKE PEIGNEUR", "#2a4a3a", "#f0e6c8", 1024, 512) })); sign.position.set(ox - 6, 2.5, -70.05); sign.rotation.y = Math.PI; today.add(sign); shadowAll(today); }
  // foam rings where the water meets things (rig hull, chimney, barges' bows) -- posed by the world
  for (let i = 0; i < 14; i++) ring(0, 0, 10);
  // ---- skies and air ----
  const skies = { morn: skyPl(G, "morn", ox, 170, 2400, 1700, -300), day: skyPl(G, "day", ox, 170, 2400, 1700, -300) };
  const mist = dustMotes(V(ox, 3, 40), V(240, 8, 200), 260, new THREE.Color(0.95, 0.9, 0.8), 0.12, 0.35); G.add(mist.points);
  const turf = (x: number, z: number) => { const y = groundY(x - ox, z); if (y < 0.75) return null; for (const [a, b, r] of [[HOUSE.x, HOUSE.z, 14], [HEADFRAME.x, HEADFRAME.z, 16], [HEADFRAME.x + 30, HEADFRAME.z - 18, 16]] as [number, number, number][]) if (Math.hypot(x - ox - a, z - b) < r) return null; return y + 0.02; };
  return { group: G, pre, post, water, waterMesh, canal, funnel, funnelTex, stream, fall, flowT: [flowA, flowB], rig, pipe, barges, tug: tg, skiff: sk, slump, chimney, today, skies, foam, mist, drift: (t: number) => mist.drift(t), turf };
}

// =====================================================================================================================
export type MineSet = { group: THREE.Group; water: ReturnType<typeof pWater>; waterMesh: THREE.Mesh; jet: THREE.Mesh; hole: THREE.Mesh; jetT: THREE.Texture; bit: THREE.Group; gate: THREE.Group; cage: THREE.Group; carts: THREE.Group[];
  lamps: THREE.PointLight[]; heads: THREE.Sprite[]; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildMine(): MineSet {
  const G = new THREE.Group(), [ox] = SET.mine, salt = T("pgSaltM", () => saltTex()), b = new Batch();
  const W = MINE_W, Z0 = -150;
  // floor (salt with tyre tracks), roof, the side walls and the end wall at the shaft station
  b.add(boxGeo(V(ox - W, -0.4, Z0), V(ox + W, 0, END_Z + SHAFT_D + 1), 9), salt);
  b.add(boxGeo(V(ox - W, ROOF, Z0), V(ox + W, ROOF + 0.4, END_Z), 9, true), salt);
  for (const s of [-1, 1]) b.add(boxGeo(V(ox + s * W - 0.4, 0, Z0), V(ox + s * W + 0.4, ROOF, END_Z + 2), 9), salt);
  // the end wall, with the shaft's opening cut through it (Nov 22: the cage used to hang in front of a painted dark
  // rectangle and rose up the outside of the wall; now it rides in a real shaft and goes up out of sight)
  { const cx = ox + CAGE.x; b.add(boxGeo(V(ox - W, 0, END_Z), V(cx - SHAFT_W, ROOF, END_Z + 1), 9), salt); b.add(boxGeo(V(cx + SHAFT_W, 0, END_Z), V(ox + W, ROOF, END_Z + 1), 9), salt);
    b.add(boxGeo(V(cx - SHAFT_W, SHAFT_H, END_Z), V(cx + SHAFT_W, ROOF, END_Z + 1), 9), salt); }
  b.add(boxGeo(V(ox - W, 0, Z0 - 1), V(ox + W, ROOF, Z0), 9), salt);
  for (const [x, z] of PILLARS) b.add(boxGeo(V(ox + x - PIL / 2, 0, z - PIL / 2), V(ox + x + PIL / 2, ROOF, z + PIL / 2), 9), salt);
  // tyre ruts along the main drift
  for (const x of [-1.2, 1.2]) b.add(boxGeo(V(ox + x - 0.25, 0, Z0), V(ox + x + 0.25, 0.012, END_Z - 3)), M("pgRut", "#a8a296"));
  // the shaft station: a steel collar in the end wall, the cage (open frame, mesh sides, a gate), the shaft above it
  const steel = M("pgCageSteel", "#5a5e66"), yel = M("pgCageYel", "#d9b23a"), mesh = new THREE.MeshLambertMaterial({ color: "#7a7e86", transparent: true, opacity: 0.45, side: THREE.DoubleSide });
  // the shaft: timber-lined, running up out of the room (sides, back, a sump floor); a yellow steel collar round the opening
  { const cx = ox + CAGE.x, lining = lam("pgShaftWood", () => ({ map: planksHD(), color: "#5a4a3a" })), z0 = END_Z, z1 = END_Z + SHAFT_D;
    for (const sx of [-1, 1]) b.add(boxGeo(V(cx + sx * SHAFT_W - (sx > 0 ? 0 : 0.3), -1, z0), V(cx + sx * SHAFT_W + (sx > 0 ? 0.3 : 0), ROOF + 40, z1 + 0.3), 3), lining);
    b.add(boxGeo(V(cx - SHAFT_W - 0.3, -1, z1), V(cx + SHAFT_W + 0.3, ROOF + 40, z1 + 0.3), 3), lining);
    b.add(boxGeo(V(cx - SHAFT_W, -0.6, z0), V(cx + SHAFT_W, -0.02, z1)), M("pgSump", "#2a2622"));
    for (let k = 0; k < 6; k++) b.add(boxGeo(V(cx - SHAFT_W, 0.6 + k * 2.4, z1 - 0.12), V(cx + SHAFT_W, 0.8 + k * 2.4, z1)), M("pgShaftBeam", "#3a2e24"));   // cross timbers
    for (const s of [-1, 1]) b.add(boxGeo(V(cx + s * (SHAFT_W + 0.25) - 0.25, 0, END_Z - 0.5), V(cx + s * (SHAFT_W + 0.25) + 0.25, SHAFT_H + 0.55, END_Z)), yel);
    b.add(boxGeo(V(cx - SHAFT_W - 0.5, SHAFT_H, END_Z - 0.5), V(cx + SHAFT_W + 0.5, SHAFT_H + 0.55, END_Z)), yel); }
  const cage = new THREE.Group(); { const cb = new Batch(), w = 1.6, d = 1.4, h = 2.6;
    cb.add(boxGeo(V(-w, 0, -d), V(w, 0.15, d)), steel); cb.add(boxGeo(V(-w, h, -d), V(w, h + 0.15, d)), steel);
    for (const [x, z] of [[-w, -d], [w, -d], [w, d], [-w, d]]) cb.add(boxGeo(V(x - 0.07, 0, z - 0.07), V(x + 0.07, h, z + 0.07)), steel);
    for (const s of [-1, 1]) cb.add(boxGeo(V(s * w - 0.02, 0.15, -d), V(s * w + 0.02, h, d)), mesh); cb.add(boxGeo(V(-w, 0.15, d - 0.02), V(w, h, d + 0.02)), mesh);
    cb.add(new THREE.CylinderGeometry(0.05, 0.05, 50, 6).translate(0, h + 25, 0), steel);   // the hoist rope, up the shaft
    cb.build(cage, true); cage.position.set(ox + CAGE.x, 0, CAGE.z - 0.2); G.add(cage); }
  const gate = new THREE.Group(); { const gb = new Batch(); for (let k = 0; k <= 8; k++) gb.add(boxGeo(V(-1.6 + k * 0.4 - 0.025, 0.1, -0.02), V(-1.6 + k * 0.4 + 0.025, 2.5, 0.02)), yel); gb.add(boxGeo(V(-1.6, 1.2, -0.03), V(1.6, 1.28, 0.03)), yel); gb.build(gate, true); gate.position.set(ox + CAGE.x, 0, CAGE.z - 1.65); G.add(gate); }
  // sign: the cage's limit (8 men)
  const sg = (s: string, x: number, y: number, z: number, w: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshLambertMaterial({ map: signTex(s, "#d9b23a", "#1a1a1e", 1024, 256) })); m.position.set(ox + x, y, z); m.rotation.y = Math.PI; G.add(m); };
  // centred over the opening, so every shot of the cage holds the signs whole (Nov 22: "CAGE: 8 MEN" was cut by the frame)
  sg("CAGE: 8 MEN", CAGE.x, SHAFT_H + 0.27, END_Z - 0.53, 2.2);   // the limit plate on the collar's lintel itself (the "1300 LEVEL" sign is gone: it was cut by the frame, and it contradicted the 1,500 ft in the narration)
  // a heap of broken salt at the foot of the working face (the east face of the pillar at 17, -17), where the crew cut
  { const pileM = T("pgSaltPile", () => saltTex(), { flatShading: true }); for (let k = 0; k < 12; k++) { const r0 = 0.12 + ((k * 37) % 10) / 55, g = rockGeo(r0, 70 + k, 1, 0.6); g.translate(ox + 25.2 + ((k * 13) % 5) * 0.16, r0 * 0.3, -16.2 + k * 0.2); b.add(g, pileM); } }
  // a loader parked in a drift, and a lamp string: a lamp every 12 m along the main drifts, some with point lights
  { const ld = new THREE.Group(), lb = new Batch(), body = M("pgLoader", "#d98a2a"), dark = M("pgLoaderD", "#2a2a30");
    lb.add(boxGeo(V(-3.2, 0.9, -1.4), V(2.2, 2.4, 1.4)), body); lb.add(boxGeo(V(0.4, 2.4, -1.2), V(2.0, 3.6, 1.2)), dark); lb.add(boxGeo(V(-5.0, 0.4, -1.6), V(-3.2, 1.8, 1.6)), body);
    for (const [x, z] of [[-2.4, -1.4], [1.4, -1.4], [-2.4, 1.4], [1.4, 1.4]]) lb.add(new THREE.CylinderGeometry(0.85, 0.85, 0.6, 14).rotateX(Math.PI / 2).translate(x, 0.85, z), dark);
    lb.build(ld, true); ld.position.set(ox + 62, 0, -66); ld.rotation.y = 1.2; G.add(ld); }
  const lamps: THREE.PointLight[] = [], lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.1, 1.5), fog: true });
  for (const [x0, z0, x1, z1] of [[0, -140, 0, END_Z - 4], [-100, -34, 100, -34], [-100, -68, 100, -68], [-100, 26, 100, 26]] as [number, number, number, number][]) {
    const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 12);
    for (let k = 0; k <= n; k++) { const x = x0 + ((x1 - x0) * k) / n, z = z0 + ((z1 - z0) * k) / n; const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), lampM); bulb.position.set(ox + x, ROOF - 1.4, z); G.add(bulb);
      const h = glow(new THREE.Color(1.4, 1.2, 0.8), 2.2); h.position.copy(bulb.position); G.add(h); b.add(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 4).translate(ox + x, ROOF - 0.7, z), M("pgWire", "#1a1a1e"));
      if (k % 2 === 0) { const l = new THREE.PointLight("#ffe2b0", 9, 24, 1.3); l.position.set(ox + x, ROOF - 1.8, z); G.add(l); lamps.push(l); } } }
  b.build(G, true);
  // water across the floor (the front moves toward the shaft), the roof breach jet, the drill bit coming through
  const water = pWater("#3a4a48", "#7a8a82", "#c9cfcc", "mine"); water.U.uAmp.value = 0.12; water.U.uFront.value = -1e4;
  const wg = new THREE.PlaneGeometry(W * 2, END_Z - Z0, 160, 120); wg.rotateX(-Math.PI / 2); wg.translate(ox, 0.05, (Z0 + END_Z) / 2);
  const waterMesh = new THREE.Mesh(wg, water.mat); waterMesh.receiveShadow = true; G.add(waterMesh);
  const jetT = flowTex("jet", "#6e7e7a", "rgba(235,240,238,0.9)", false); jetT.wrapS = jetT.wrapT = THREE.RepeatWrapping;
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.4, ROOF, 16, 1, true), new THREE.MeshBasicMaterial({ map: jetT, transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false, fog: true }));
  jet.position.set(ox + BREACH.x, ROOF / 2, BREACH.z); jet.visible = false; G.add(jet);
  const bit = new THREE.Group(); { const pp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 8, 10), M("pgPipe", "#6a6e76")); pp.position.y = 4; bit.add(pp); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 8), M("pgBit", "#c9a23a")); cone.rotation.x = Math.PI; bit.add(cone); shadowAll(bit); bit.position.set(ox + BREACH.x, ROOF + 4, BREACH.z); bit.visible = false; G.add(bit); }
  // a ragged hole in the roof round the breach
  const hole = new THREE.Mesh(new THREE.CircleGeometry(2.6, 12), new THREE.MeshBasicMaterial({ color: "#121214" })); hole.rotation.x = Math.PI / 2; hole.position.set(ox + BREACH.x, ROOF - 0.02, BREACH.z); hole.visible = false; G.add(hole);
  const heads: THREE.Sprite[] = []; for (let i = 0; i < 12; i++) { const h = glow(new THREE.Color(1.6, 1.5, 1.1), 0.9); h.visible = false; G.add(h); heads.push(h); }
  const dust = dustMotes(V(ox, 6, -20), V(80, 6, 60), 220, new THREE.Color(1, 0.97, 0.9), 0.05, 0.45); G.add(dust.points);
  // the mine's vehicles (Nov 22: the long-form said "in carts and vehicles" over men on foot): two personnel carriers
  // (a low open tub on four big tyres, a driver's seat and wheel up front, men stand in the tub) and the foreman's jeep.
  // Local frame: forward is +x, the tub floor is at TUB_Y. Posed per shot (st.mine.carts); hidden otherwise.
  const carts = [0, 1, 2].map((k) => { const g = new THREE.Group(), cb = new Batch(), jeep = k === 2, body = M(jeep ? "pgJeep" : "pgCart", jeep ? "#c9a23a" : "#d98a2a"), dark = M("pgCartD", "#2a2a30"), tyre = M("pgTyre", "#1a1a1e");
    const L = jeep ? 3.4 : 4.6, Wd = jeep ? 1.7 : 2.1, fl = 0.75;
    cb.add(boxGeo(V(-L / 2, 0.45, -Wd / 2), V(L / 2, fl, Wd / 2)), body);                                     // chassis and floor
    for (const sz of [-1, 1]) cb.add(boxGeo(V(-L / 2, fl, sz * Wd / 2 - (sz > 0 ? 0.08 : 0)), V(jeep ? 0.2 : L / 2 - 1.2, fl + 0.55, sz * Wd / 2 + (sz < 0 ? 0.08 : 0))), body);   // tub sides
    cb.add(boxGeo(V(-L / 2, fl, -Wd / 2), V(-L / 2 + 0.08, fl + 0.55, Wd / 2)), body);                           // tailgate
    cb.add(boxGeo(V(L / 2 - 1.1, fl, -Wd / 2), V(L / 2, fl + 0.7, Wd / 2), 2), body);                            // engine hood up front
    cb.add(boxGeo(V(L / 2 - 1.6, fl, -0.45), V(L / 2 - 1.15, fl + 0.45, 0.45)), dark);                           // driver's seat
    cb.add(new THREE.TorusGeometry(0.22, 0.035, 6, 16).rotateY(Math.PI / 2).rotateZ(0.5).translate(L / 2 - 1.15, fl + 1.0, 0), dark);   // steering wheel
    cb.add(rodGeo(V(L / 2 - 1.1, fl + 0.7, 0), V(L / 2 - 1.15, fl + 1.0, 0), 0.03), dark);
    for (const sz of [-1, 1]) cb.add(rodGeo(V(L / 2 - 1.3, fl, sz * (Wd / 2 - 0.1)), V(L / 2 - 1.3, fl + 1.5, sz * (Wd / 2 - 0.1)), 0.05), dark);   // roll bar
    cb.add(rodGeo(V(L / 2 - 1.3, fl + 1.5, -(Wd / 2 - 0.1)), V(L / 2 - 1.3, fl + 1.5, Wd / 2 - 0.1), 0.05), dark);
    for (const [x, z] of [[-L / 2 + 0.7, -Wd / 2], [L / 2 - 0.7, -Wd / 2], [-L / 2 + 0.7, Wd / 2], [L / 2 - 0.7, Wd / 2]]) cb.add(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 14).rotateX(Math.PI / 2).translate(x, 0.45, z), tyre);
    cb.add(new THREE.SphereGeometry(0.12, 8, 6).translate(L / 2 + 0.02, fl + 0.45, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.8, 1.2), fog: true }));   // headlamp
    cb.build(g, true); g.visible = false; G.add(g); return g; });
  void puffTex; void rockTex;
  return { group: G, water, waterMesh, jet, hole, jetT, bit, gate, cage, carts, lamps, heads, dust, drift: (t: number) => dust.drift(t) };
}
