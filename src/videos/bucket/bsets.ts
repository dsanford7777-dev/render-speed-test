// The War of the Bucket Short: the three sets (place.ts says where) and the props that travel between them (the
// bucket, the banners). Built to the background rules and the production checklist: every post reaches the ground,
// nothing floats, far ground has texture, every light has a source, trees keep clear of buildings and cameras, skies
// are closed, water moves and breaks at its edges, banners read at phone size.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD, stoneHD } from "../bridge/paint";
import { mergeFacets, pineGeo, bushGeo, dustMotes, dirtTex, rockGeo } from "../bridge/scenery";
import { M, noInk, shadowAll, sheet, rodGeo, flame, waterMat, glow } from "../frozen/fsets";
import { foamTex } from "../frozen/fpaint";
import { brickTex } from "../frozen/paint";
import { NOINK } from "../bridge/ink";
import { caSkyTex } from "../cahaba/cpaint";
import { twSkyTex } from "../toledo/tpaint";
import { SET, WALL_Z, WALL_T, WALL_H, PARA_H, MERLON_H, WALK_Y, TOWER_W, TOWER_Z, TOWER_H, GATE_W, GATE_H, ROAD_W, RACE_Z, RACE_W, WELL, WELL_R, WELL_H,
  HILL_C, HILL_TOP, HILL_Y, HILL_R, CASTLE_S, CASTLE_H, CASTLE_GZ, CASTLE_GATE_W, CASTLE_GATE_H, RIVER_X, RIVER_W, RIVER_Y, hillY, ROOM, HANG, THRONE, DESK } from "./place";
import { staveTex, bannerTex, BannerKind, vairTex, starsTex, plasterTex, drapeTex, bookTex, tileRoofTex, roadTex, gateDoorTex, rep } from "./bpaint";

const M4 = (x: number, y: number, z: number, ry = 0, s = 1, sy = s) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(s, sy, s));
type Fol = { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[];
const B = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) => boxGeo(V(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)), V(Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)), tile);
const rnd = (k: number) => ((k * 9301 + 49297) % 233280) / 233280;
/** a sky all the way round with a lid in its top colour (checklist: skies are closed) */
const skyPl = (G: THREE.Object3D, tex: THREE.Texture, top: string, x: number, z: number, r: number, h: number, y0: number) => {
  const tx = tex.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(4, 1); tx.needsUpdate = true;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64, 1, true), new THREE.MeshBasicMaterial({ map: tx, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.position.set(x, y0 + h / 2, z); m.layers.set(NOINK); m.renderOrder = -6;
  const lid = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(top), fog: false, depthWrite: false, side: THREE.DoubleSide }));
  lid.rotation.x = Math.PI / 2; lid.position.y = h / 2 - 0.5; lid.renderOrder = -5; lid.layers.set(NOINK); m.add(lid); G.add(m); return m; };
/** a wall face with an arched opening, extruded toward +z: outline goes round the arch (no hole), so it triangulates cleanly */
const archWall = (w: number, h: number, gw: number, gh: number, d: number) => {
  const r = gw / 2, s = gh - r, pts = [new THREE.Vector2(-w / 2, 0), new THREE.Vector2(-r, 0), new THREE.Vector2(-r, s)];
  for (let k = 1; k < 16; k++) { const a = Math.PI - (k / 16) * Math.PI; pts.push(new THREE.Vector2(r * Math.cos(a), s + r * Math.sin(a))); }
  pts.push(new THREE.Vector2(r, s), new THREE.Vector2(r, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(w / 2, h), new THREE.Vector2(-w / 2, h));
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: d, bevelEnabled: false }); return g;
};
/** square merlons along x from x0 to x1 at height y, depth z0..z1 */
const merlons = (b: Batch, m: THREE.Material, x0: number, x1: number, y: number, z0: number, z1: number, w = 1.3, gap = 1.0, h = MERLON_H) => {
  for (let x = x0; x + w <= x1 + 0.01; x += w + gap) b.add(B(x, y, z0, x + w, y + h, z1, 2), m); };
/** trees at spots [x, y, z, scale]: cypresses (tall, narrow) and broad leafy trees */
const trees = (G: THREE.Object3D, spots: [number, number, number, number][], key: string, cypress = 0.4) => {
  const fol: Fol = [], bark: Fol = [], leaf: Fol = [];
  spots.forEach(([x, y, z, s], i) => {
    if (rnd(i * 7 + 3) < cypress) { const h = 9 * s, [f, t] = pineGeo(h, 1.25 * s, i + 5); fol.push({ g: f, m: M4(x, y - 0.2, z, i, 1, 1), tint: 0.78 + 0.2 * rnd(i) }); bark.push({ g: t, m: M4(x, y - 0.2, z, i) }); return; }
    const t = new THREE.CylinderGeometry(0.22 * s, 0.4 * s, 4.4 * s, 7); t.translate(0, 2.0 * s, 0); bark.push({ g: t, m: M4(x, y - 0.2, z, i) });
    for (let k = 0; k < 3; k++) leaf.push({ g: bushGeo(2.1 * s, i * 7 + k, 4), m: M4(x + (k - 1) * 1.3 * s, y + (3.6 + (k % 2) * 1.2) * s, z + ((k * 5) % 3 - 1) * 0.9 * s, i + k), tint: 0.82 + 0.25 * ((i + k) % 3) / 2 });
    leaf.push({ g: bushGeo(2.6 * s, i * 3 + 1, 5), m: M4(x, y + 5.4 * s, z, i), tint: 0.95 }); });
  const mk = (l: Fol, k: string, col: string) => { if (!l.length) return; const a = new THREE.Mesh(mergeFacets(l), lam(k, () => ({ color: col, vertexColors: true, flatShading: true }))); shadowAll(a); G.add(a); };
  mk(fol, "bkCyp" + key, "#2f4e2e"); mk(bark, "bkBark" + key, "#4a3c30"); mk(leaf, "bkLeaf" + key, "#5a7a36");
};
const grassM = () => lam("bkGrassM", () => ({ map: dirtTex("bkGrassT", "#4e6e30"), color: "#8aa05e" }));

// ---------------- props: the bucket and the banners ----------------
/** the bucket: oak staves (wider at the top), two iron hoops, an iron bail handle. Origin at the top of the handle, so
 *  it can hang from a hook, a chain or a hand; the bottom sits BUCKET_DROP below */
export const BUCKET_DROP = 0.56;
export const bucketGroup = () => {
  const g = new THREE.Group(), oak = lam("bkOak", () => ({ map: staveTex() })), iron = M("bkIron", "#3a3438"), dark = M("bkBucketIn", "#2a1c14");
  const prof = [new THREE.Vector2(0.15, 0), new THREE.Vector2(0.19, 0.36), new THREE.Vector2(0.175, 0.36), new THREE.Vector2(0.137, 0.03), new THREE.Vector2(0.0, 0.03)];
  const wall = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), oak); wall.position.y = -BUCKET_DROP; g.add(wall);
  const base = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), dark); base.rotation.x = Math.PI / 2; base.position.y = -BUCKET_DROP + 0.001; g.add(base);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20), dark); inner.rotation.x = -Math.PI / 2; inner.position.y = -BUCKET_DROP + 0.04; g.add(inner);
  for (const [y, r] of [[0.07, 0.159], [0.29, 0.183]]) { const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 28), iron); h.rotation.x = Math.PI / 2; h.position.y = -BUCKET_DROP + y; g.add(h); }
  // the bail: a half ring from lug to lug, over the top; lugs on the rim
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.195, 0.011, 6, 20, Math.PI), iron); bail.position.y = -BUCKET_DROP + 0.36; bail.scale.y = 1.0; g.add(bail);
  bail.position.y = -0.195; // top of the bail at the origin
  for (const s of [-1, 1]) { const lug = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.07, 0.03), iron); lug.position.set(s * 0.19, -BUCKET_DROP + 0.35, 0); g.add(lug); }
  // the bail's ends meet the lugs: bail radius 0.195 centred 0.195 below the origin puts its ends at y = -0.195 (lug top at -0.17)
  shadowAll(g); return g;
};
/** a banner on a pole: the cloth hangs from a cross-bar at the top and ripples (call wave(t)). Origin at the pole's foot */
export const bannerPole = (kind: BannerKind, h = 3.6, w = 1.05) => {
  const g = new THREE.Group(), wood = M("bkPole", "#6a4a30");
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, h, 7).translate(0, h / 2, 0), wood));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, w + 0.1, 6).rotateZ(Math.PI / 2).translate(w / 2, h - 0.06, 0), wood));
  const geo = new THREE.PlaneGeometry(w, w * 0.66, 10, 4); geo.translate(w / 2, h - 0.06 - w * 0.33, 0);
  const mat = new THREE.MeshLambertMaterial({ map: bannerTex(kind), emissiveMap: bannerTex(kind), emissive: new THREE.Color(0.42, 0.42, 0.42), side: THREE.DoubleSide });
  const cloth = new THREE.Mesh(geo, mat); g.add(cloth);
  const base = (geo.attributes.position as THREE.BufferAttribute).array.slice() as Float32Array;
  const wave = (t: number, ph = 0) => { const p = geo.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, 0.07 * (x / w) * Math.sin(t * 3.2 + x * 4 + ph)); } p.needsUpdate = true; geo.computeVertexNormals(); };
  shadowAll(g); return { g, mat, wave };
};

// =====================================================================================================================
export type GateSet = { group: THREE.Group; doorL: THREE.Group; doorR: THREE.Group; rope: THREE.Mesh; banners: ReturnType<typeof bannerPole>[]; turf: (x: number, z: number) => number | null; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void; setRope: (len: number) => void };
export function buildGate(): GateSet {
  const G = new THREE.Group(), ox = SET.gate[0], b = new Batch();
  const brick = lam("bkBrick", () => ({ map: rep(brickTex("bkBrickT", ["#b4603e", "#a85a3a", "#c06a44", "#9a5236"], "#d8c4a8", 0.15), 0.35, 0.35) }));
  const brickD = lam("bkBrickD", () => ({ map: rep(brickTex("bkBrickT", ["#b4603e", "#a85a3a", "#c06a44", "#9a5236"], "#d8c4a8", 0.15), 0.35, 0.35), color: "#c8b0a0" }));
  const gy = (x: number, z: number) => 0.05 * Math.sin(x * 0.7 + z * 0.4) + 0.04 * Math.sin(x * 1.9 - z * 1.3);
  // ground: grass, the road out of the gate (toward the cameras) and the road along the wall, packed dirt
  { const m = new THREE.Mesh(sheet(ox - 170, ox + 170, -110, 150, 170, 130, (x, z) => gy(x, z), 4), grassM()); m.receiveShadow = true; G.add(m);
    const rd = lam("bkRoadM", () => ({ map: roadTex() }));
    const g1 = new THREE.PlaneGeometry(340, RACE_W); g1.rotateX(-Math.PI / 2); { const uv = g1.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 48, uv.getY(i)); }
    const m1 = new THREE.Mesh(g1, rd); m1.position.set(ox, 0.07, RACE_Z); m1.receiveShadow = true; G.add(m1);
    const g2 = new THREE.PlaneGeometry(ROAD_W, 110); g2.rotateX(-Math.PI / 2); { const uv = g2.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i) * 16, uv.getX(i)); }
    const m2 = new THREE.Mesh(g2, rd); m2.rotation.y = 0; m2.position.set(ox, 0.075, -50 + RACE_Z); m2.receiveShadow = true; G.add(m2);
    const g3 = new THREE.PlaneGeometry(ROAD_W, TOWER_Z - RACE_Z - RACE_W / 2 + 0.5); g3.rotateX(-Math.PI / 2); const m3 = new THREE.Mesh(g3, rd); m3.position.set(ox, 0.076, (TOWER_Z + RACE_Z + RACE_W / 2) / 2); m3.receiveShadow = true; G.add(m3); }
  // the city wall either side of the gate tower: body, parapet, square merlons, the walk behind
  const L = 150, hw = TOWER_W / 2;
  for (const [x0, x1] of [[-L, -hw], [hw, L]]) {
    b.add(B(ox + x0, 0, WALL_Z, ox + x1, WALL_H, WALL_Z + WALL_T, 3), brick);
    b.add(B(ox + x0, WALL_H, WALL_Z, ox + x1, WALL_H + PARA_H, WALL_Z + 0.55, 3), brick);
    merlons(b, brick, ox + x0 + 0.3, ox + x1 - 0.3, WALL_H + PARA_H, WALL_Z, WALL_Z + 0.55);
    b.add(B(ox + x0, WALL_H + 0.0, WALL_Z + WALL_T - 0.3, ox + x1, WALL_H + 0.55, WALL_Z + WALL_T, 3), brickD);
    // a stepped plinth at the foot and a string course under the parapet
    b.add(B(ox + x0, 0, WALL_Z - 0.35, ox + x1, 0.6, WALL_Z, 3), brickD); b.add(B(ox + x0, WALL_H - 0.18, WALL_Z - 0.12, ox + x1, WALL_H, WALL_Z, 3), brickD);
    // square towers along the wall every 30 m
    for (let x = x0 + 18; x < x1 - 4; x += 30) { b.add(B(ox + x - 2.6, 0, WALL_Z - 2.2, ox + x + 2.6, WALL_H + 3.2, WALL_Z + WALL_T, 3), brick); merlons(b, brick, ox + x - 2.5, ox + x + 2.5, WALL_H + 3.2, WALL_Z - 2.2, WALL_Z - 1.6, 1.0, 0.8);
      for (const sx of [-1, 1]) b.add(B(ox + x + sx * 2.5 - 0.3, WALL_H + 3.2, WALL_Z - 2.2, ox + x + sx * 2.5 + 0.3, WALL_H + 4.4, WALL_Z + WALL_T, 2), brick); }
  }
  // the gate tower: an arched passage right through, a gate in it, merlons on top, Bologna's banners on its face
  { const d = WALL_Z + WALL_T + 1.2 - TOWER_Z, aw = archWall(TOWER_W, TOWER_H, GATE_W, GATE_H, d); aw.translate(ox, 0, TOWER_Z); b.add(aw, brick);
    // passage: floor of stone, a dark far end (the city seen through it is out of scope: doors shut most of the time)
    b.add(B(ox - GATE_W / 2, 0, TOWER_Z, ox + GATE_W / 2, 0.08, TOWER_Z + d, 1), lam("bkPassFloor", () => ({ map: rep(stoneHD("bkFlag", ["#a89a88", "#9a8c7a", "#b2a490", "#8e8270"], "#6a6052"), 0.5, 0.5) })));
    const back = new THREE.Mesh(new THREE.PlaneGeometry(GATE_W, GATE_H), M("bkPassBack", "#2a221e")); back.rotation.y = Math.PI; back.position.set(ox, GATE_H / 2, TOWER_Z + d - 0.05); G.add(back);
    merlons(b, brick, ox - hw + 0.2, ox + hw - 0.2, TOWER_H, TOWER_Z, TOWER_Z + 0.6, 1.2, 0.9);
    for (const sx of [-1, 1]) b.add(B(ox + sx * hw - 0.3, TOWER_H, TOWER_Z, ox + sx * hw + 0.3, TOWER_H + MERLON_H, TOWER_Z + d, 2), brick);
    // a white stone arch ring and a coat of arms panel above it
    const ring = new THREE.Mesh(new THREE.TorusGeometry(GATE_W / 2 + 0.25, 0.22, 6, 20, Math.PI), M("bkArchStone", "#d8cdb8")); ring.position.set(ox, GATE_H - GATE_W / 2, TOWER_Z - 0.12); ring.scale.z = 0.5; G.add(ring);
    for (const sx of [-1, 1]) b.add(B(ox + sx * (GATE_W / 2 + 0.03), 0, TOWER_Z - 0.2, ox + sx * (GATE_W / 2 + 0.47), GATE_H - GATE_W / 2, TOWER_Z + 0.02), M("bkArchStone", "#d8cdb8"));
    const arms = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshLambertMaterial({ map: bannerTex("bologna") })); arms.rotation.y = Math.PI; arms.position.set(ox, GATE_H + 2.6, TOWER_Z - 0.03); G.add(arms);
    // slit windows
    for (const [x, y] of [[-3.2, 10], [3.2, 10], [0, 13.5]]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1.3), M("bkSlit", "#1a1416")); s.rotation.y = Math.PI; s.position.set(ox + x, y, TOWER_Z - 0.03); G.add(s); } }
  // the gate's two oak leaves, hinged at the arch's sides (the world swings them: closed = 0, open = 1)
  const doorL = new THREE.Group(), doorR = new THREE.Group();
  { const dm = lam("bkGateDoorM", () => ({ map: gateDoorTex() })), lw = GATE_W / 2 + 0.03, R = GATE_W / 2, hh = GATE_H - R;
    for (const [grp, sg] of [[doorL, 1], [doorR, -1]] as [THREE.Group, number][]) {
      // a leaf from its hinge (x = 0) to the meeting edge (x = lw): straight up the meeting edge, then the arch quarter back down to the hinge side
      const poly: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(lw, 0), new THREE.Vector2(lw, hh + R)];
      for (let k = 1; k <= 10; k++) { const a = Math.PI / 2 + (k / 10) * (Math.PI / 2); poly.push(new THREE.Vector2(R + R * Math.cos(a), hh + R * Math.sin(a))); }
      const geo = new THREE.ExtrudeGeometry(new THREE.Shape(poly), { depth: 0.16, bevelEnabled: false }); { const uv = geo.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / lw, uv.getY(i) / GATE_H); }
      const leaf = new THREE.Mesh(geo, dm); leaf.scale.x = sg > 0 ? -1 : 1; grp.add(leaf);
      grp.position.set(ox + sg * R, 0.08, TOWER_Z + 1.2); shadowAll(grp); G.add(grp); } }
  // the city behind the wall: terracotta roofs, plastered houses, the tall brick towers of Bologna
  { const roof = lam("bkRoofM", () => ({ map: rep(tileRoofTex(), 0.25, 0.25) })), cols = ["#d8b890", "#e0c8a0", "#c89870", "#e4d0b0"];
    for (let i = 0; i < 70; i++) { const x = -120 + rnd(i) * 240, z = WALL_Z + WALL_T + 4 + rnd(i + 70) * 60, w = 6 + rnd(i + 140) * 6, d = 6 + rnd(i + 210) * 5, h = 8 + rnd(i + 280) * 6;
      if (Math.abs(x) < 6 && z < WALL_Z + 12) continue;
      b.add(B(ox + x - w / 2, 0, z, ox + x + w / 2, h, z + d, 3), M("bkHouse" + (i % 4), cols[i % 4]));
      const sh = new THREE.Shape([new THREE.Vector2(-w / 2 - 0.3, h), new THREE.Vector2(0, h + w * 0.28), new THREE.Vector2(w / 2 + 0.3, h)]), rg = new THREE.ExtrudeGeometry(sh, { depth: d + 0.6, bevelEnabled: false }); rg.translate(ox + x, 0, z - 0.3); b.add(rg, roof); }
    for (const [x, z, h, w] of [[-14, 46, 62, 5.2], [9, 40, 44, 4.6], [30, 58, 52, 4.8], [-38, 60, 40, 4.2], [52, 44, 34, 4.4], [-60, 50, 46, 4.6]] as [number, number, number, number][]) {
      b.add(B(ox + x - w / 2, 0, z - w / 2, ox + x + w / 2, h, z + w / 2, 3), brick);
      merlons(b, brick, ox + x - w / 2, ox + x + w / 2, h, z - w / 2, z - w / 2 + 0.5, 0.8, 0.7);
      for (let y = 6; y < h - 2; y += 7) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.2), M("bkSlit", "#1a1416")); s.rotation.y = Math.PI; s.position.set(ox + x, y, z - w / 2 - 0.02); G.add(s); } } }
  // the well: a round stone curb, dark water inside, two posts, a beam and a windlass with its crank; the rope
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 6), M("bkRope", "#8a7a5a")); rope.castShadow = true; G.add(rope);
  { const [wx, , wz] = WELL, stone = lam("bkWellStone", () => ({ map: rep(stoneHD("bkWellT", ["#c8bca8", "#b8ac98", "#d4c8b4", "#aea290"], "#8a8070"), 0.6, 0.6) }));
    const prof = [new THREE.Vector2(WELL_R - 0.22, 0), new THREE.Vector2(WELL_R, 0), new THREE.Vector2(WELL_R, WELL_H), new THREE.Vector2(WELL_R + 0.05, WELL_H), new THREE.Vector2(WELL_R + 0.05, WELL_H + 0.1), new THREE.Vector2(WELL_R - 0.27, WELL_H + 0.1), new THREE.Vector2(WELL_R - 0.27, WELL_H - 0.05), new THREE.Vector2(WELL_R - 0.22, WELL_H - 0.05), new THREE.Vector2(WELL_R - 0.22, 0)];
    const curb = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), stone); curb.position.set(ox + wx, 0, wz); shadowAll(curb); G.add(curb);
    const wtr = new THREE.Mesh(new THREE.CircleGeometry(WELL_R - 0.23, 24), new THREE.MeshLambertMaterial({ color: "#1e2a30", emissive: "#0a1418" })); wtr.rotation.x = -Math.PI / 2; wtr.position.set(ox + wx, WELL_H - 0.45, wz); G.add(wtr);
    const hl = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 18), new THREE.MeshBasicMaterial({ color: "#8ab0c0", transparent: true, opacity: 0.5 })); hl.rotation.x = -Math.PI / 2; hl.position.set(ox + wx + 0.2, WELL_H - 0.44, wz - 0.15); G.add(hl);
    const wood = lam("bkWellWood", () => ({ map: planksHD(), color: "#7a5434" }));
    for (const s of [-1, 1]) b.add(B(ox + wx + s * (WELL_R + 0.02) - 0.09, 0, wz - 0.09, ox + wx + s * (WELL_R + 0.02) + 0.09, 2.3, wz + 0.09), wood);
    b.add(B(ox + wx - WELL_R - 0.25, 2.3, wz - 0.12, ox + wx + WELL_R + 0.25, 2.5, wz + 0.12), wood);
    // a little tiled roof over the beam
    { const sh = new THREE.Shape([new THREE.Vector2(-0.7, 0), new THREE.Vector2(0, 0.55), new THREE.Vector2(0.7, 0)]), rg = new THREE.ExtrudeGeometry(sh, { depth: 2 * WELL_R + 0.9, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(ox + wx - WELL_R - 0.45, 2.5, wz); b.add(rg, lam("bkRoofM", () => ({ map: rep(tileRoofTex(), 0.25, 0.25) }))); }
    b.add(new THREE.CylinderGeometry(0.11, 0.11, 2 * WELL_R - 0.1, 10).rotateZ(Math.PI / 2).translate(ox + wx, 1.98, wz), wood);
    b.add(B(ox + wx + WELL_R + 0.02, 1.93, wz - 0.03, ox + wx + WELL_R + 0.34, 2.03, wz + 0.03), M("bkIron", "#3a3438"));
    b.add(B(ox + wx + WELL_R + 0.3, 1.7, wz - 0.03, ox + wx + WELL_R + 0.36, 2.0, wz + 0.03), M("bkIron", "#3a3438"));
    // a stone trough beside it, wet ground round the curb
    b.add(B(ox + wx - 2.9, 0, wz - 0.35, ox + wx - 1.5, 0.55, wz + 0.35, 1), stone); const tw = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.5), new THREE.MeshLambertMaterial({ color: "#2a3e48", emissive: "#0e1a20" })); tw.rotation.x = -Math.PI / 2; tw.position.set(ox + wx - 2.2, 0.5, wz); G.add(tw);
    const wet = new THREE.Mesh(new THREE.CircleGeometry(WELL_R + 0.7, 24), M("bkWet", "#6a5a44")); wet.rotation.x = -Math.PI / 2; wet.position.set(ox + wx, 0.06, wz); G.add(wet); }
  // Bologna's banners on poles along the wall walk (posed by the world: they ripple)
  const banners = [-33, -25, 9, 33].map((x) => { const bp = bannerPole("bologna", 3.4, 1.2); bp.g.position.set(ox + x, WALK_Y, WALL_Z + 1.6); G.add(bp.g); return bp; });
  // trees: poplars and cypresses along the roads and out on the plain, clear of the wall, the roads, the well and the cameras
  { const spots: [number, number, number, number][] = [];
    for (let i = 0; i < 160; i++) { const x = -160 + rnd(i + 11) * 320, z = -100 + rnd(i + 311) * (WALL_Z - 6 + 100);
      if (z > RACE_Z - RACE_W / 2 - 6) continue; if (Math.abs(x) < ROAD_W / 2 + 5) continue; if (Math.hypot(x - WELL[0], z - WELL[2]) < 8) continue; if (z > -40 && Math.abs(x) < 30) continue;
      spots.push([ox + x, gy(ox + x, z), z, 0.85 + rnd(i + 611) * 0.5]); }
    trees(G, spots, "gate", 0.55); }
  skyPl(G, caSkyTex("day"), "#5f95cf", ox, 20, 260, 190, -20);
  const dust = dustMotes(V(ox, 2, 4), V(40, 4, 20), 160, new THREE.Color(1, 0.95, 0.8), 0.04, 0.35); G.add(dust.points);
  b.build(G, true); noInk(G);
  const setRope = (len: number) => { const top = V(ox + WELL[0], 1.98 - 0.11, WELL[2]); rope.position.set(top.x, top.y - len / 2, top.z); rope.scale.set(1, Math.max(0.01, len), 1); };
  setRope(0.25);
  const turf = (x: number, z: number) => { const lx = x - ox; if (Math.abs(z - RACE_Z) < RACE_W / 2 + 0.2) return null; if (Math.abs(lx) < ROAD_W / 2 + 0.2 && z < TOWER_Z + 2) return null; if (z > WALL_Z - 2.4) return null;
    if (Math.hypot(lx - WELL[0], z - WELL[2]) < WELL_R + 0.8) return null; if (lx > WELL[0] - 3.1 && lx < WELL[0] - 1.3 && Math.abs(z - WELL[2]) < 0.5) return null; return gy(x, z); };
  return { group: G, doorL, doorR, rope, banners, turf, dust, drift: (t) => { dust.drift(t); banners.forEach((bp, i) => bp.wave(t, i)); }, setRope };
}

// =====================================================================================================================
export type HillSet = { group: THREE.Group; skies: Record<"dusk" | "night" | "grey" | "field", THREE.Mesh>; doorL: THREE.Group; doorR: THREE.Group; flag: ReturnType<typeof bannerPole>; flagTex: Record<"bologna" | "modena", THREE.Texture>;
  torches: THREE.PointLight[]; torchFx: THREE.Object3D[]; moon: THREE.Sprite; foam: THREE.MeshBasicMaterial; water: ReturnType<typeof waterMat>; turf: (x: number, z: number) => number | null; drift: (t: number) => void };
export function buildHill(): HillSet {
  const G = new THREE.Group(), ox = SET.hill[0], b = new Batch();
  const gy = (x: number, z: number) => hillY(x - ox, z);
  { const m = new THREE.Mesh(sheet(ox - 220, ox + 220, -140, 240, 220, 190, gy, 4), grassM()); m.receiveShadow = true; G.add(m); }
  // a track up the hill to the castle gate (bare earth), so the gate shots stand on something trodden
  { const pts: THREE.Vector3[] = []; for (let k = 0; k <= 40; k++) { const z = -20 + (k / 40) * (CASTLE_GZ - 0.5 + 20), x = 6 * Math.sin(k * 0.12); pts.push(V(ox + x, gy(ox + x, z) + 0.06, z)); }
    const pos: number[] = [], uv: number[] = []; for (let k = 0; k < pts.length - 1; k++) { const a = pts[k], c = pts[k + 1], w = 1.6;
      pos.push(a.x - w, a.y, a.z, a.x + w, a.y, a.z, c.x - w, c.y, c.z, a.x + w, a.y, a.z, c.x + w, c.y, c.z, c.x - w, c.y, c.z); uv.push(0, k / 3, 1, k / 3, 0, (k + 1) / 3, 1, k / 3, 1, (k + 1) / 3, 0, (k + 1) / 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, lam("bkTrackM", () => ({ map: roadTex(), side: THREE.DoubleSide }))); m.receiveShadow = true; G.add(m); }
  // the castle on top: grey stone curtain walls, square corner towers, a tall keep, a gatehouse with an arched gate
  const stone = lam("bkCastle", () => ({ map: rep(stoneHD("bkCastleT", ["#b8ae9c", "#aaa08e", "#c4baa8", "#a29884"], "#7a7264"), 0.3, 0.3) }));
  const cx = ox + HILL_C[0], cz = HILL_C[1], s = CASTLE_S / 2, y0 = HILL_Y - 0.6, th = 1.8;
  { // walls: back and sides whole; the front split round the gatehouse
    b.add(B(cx - s, y0, cz + s - th, cx + s, y0 + CASTLE_H, cz + s, 3), stone);
    for (const sx of [-1, 1]) b.add(B(cx + sx * s - (sx > 0 ? th : 0), y0, cz - s, cx + sx * s + (sx < 0 ? th : 0), y0 + CASTLE_H, cz + s, 3), stone);
    const gw2 = 3.6; for (const [a, c] of [[-s, -gw2], [gw2, s]]) b.add(B(cx + a, y0, cz - s, cx + c, y0 + CASTLE_H, cz - s + th, 3), stone);
    for (const [a, c, z0, z1] of [[-s, s, cz + s - 0.6, cz + s], [-s, s, cz - s, cz - s + 0.6]] as [number, number, number, number][]) merlons(b, stone, cx + a + 0.2, cx + c - 0.2, y0 + CASTLE_H, z0, z1, 1.1, 0.9);
    for (const sx of [-1, 1]) for (let z = cz - s + 0.4; z < cz + s - 1.4; z += 2.0) b.add(B(cx + sx * s - (sx > 0 ? 0.6 : 0), y0 + CASTLE_H, z, cx + sx * s + (sx < 0 ? 0.6 : 0), y0 + CASTLE_H + 1.1, z + 1.1, 2), stone);
    // gatehouse: a tower straddling the front wall with the arch through it
    const gh = archWall(2 * gw2, CASTLE_H + 4.5, CASTLE_GATE_W, CASTLE_GATE_H, th + 1.6); gh.translate(cx, y0, cz - s - 0.8); b.add(gh, stone);
    merlons(b, stone, cx - gw2 + 0.1, cx + gw2 - 0.1, y0 + CASTLE_H + 4.5, cz - s - 0.8, cz - s - 0.2, 1.0, 0.8);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(CASTLE_GATE_W, CASTLE_GATE_H), M("bkCPass", "#1e1a18")); back.rotation.y = Math.PI; back.position.set(cx, y0 + CASTLE_GATE_H / 2, cz - s + th + 0.75); G.add(back);
    b.add(B(cx - CASTLE_GATE_W / 2, y0 - 0.2, cz - s - 0.8, cx + CASTLE_GATE_W / 2, y0 + 0.62, cz - s + th + 0.8, 1), stone);
    // corner towers and the keep
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const tx = cx + sx * s, tz = cz + sz * s; b.add(B(tx - 2.6, y0 - 1.5, tz - 2.6, tx + 2.6, y0 + CASTLE_H + 3.5, tz + 2.6, 3), stone); merlons(b, stone, tx - 2.5, tx + 2.5, y0 + CASTLE_H + 3.5, tz - 2.6, tz - 2.0, 0.9, 0.8); }
    b.add(B(cx - 3.6, y0, cz + 2, cx + 3.6, y0 + 22, cz + 9.2, 3), stone); merlons(b, stone, cx - 3.5, cx + 3.5, y0 + 22, cz + 2, cz + 2.6, 0.9, 0.8);
    for (const [x, y] of [[-1.6, 10], [1.6, 14], [0, 18]]) { const sl = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1.2), M("bkSlit", "#1a1416")); sl.rotation.y = Math.PI; sl.position.set(cx + x, y0 + y, cz + 1.98); G.add(sl); }
    for (const [x, y] of [[-4.5, 6], [4.5, 6]]) { const sl = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.0), M("bkSlit", "#1a1416")); sl.rotation.y = Math.PI; sl.position.set(cx + x, y0 + y, cz - s - 0.02); G.add(sl); } }
  // the castle's gate leaves
  const doorL = new THREE.Group(), doorR = new THREE.Group();
  { const dm = lam("bkGateDoorM", () => ({ map: gateDoorTex() })), lw = CASTLE_GATE_W / 2 + 0.03, hh = CASTLE_GATE_H - CASTLE_GATE_W / 2, R = CASTLE_GATE_W / 2;
    for (const [grp, sg] of [[doorL, 1], [doorR, -1]] as [THREE.Group, number][]) {
      const poly: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(lw, 0), new THREE.Vector2(lw, hh + R)];
      for (let k = 1; k <= 10; k++) { const a = Math.PI / 2 + (k / 10) * (Math.PI / 2); poly.push(new THREE.Vector2(R + R * Math.cos(a), hh + R * Math.sin(a))); }
      const geo = new THREE.ExtrudeGeometry(new THREE.Shape(poly), { depth: 0.14, bevelEnabled: false }); { const uv = geo.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / lw, uv.getY(i) / CASTLE_GATE_H); }
      const leaf = new THREE.Mesh(geo, dm); leaf.scale.x = sg > 0 ? -1 : 1; grp.add(leaf);
      grp.position.set(cx + sg * R, y0 + 0.62, cz - s + 0.3); shadowAll(grp); G.add(grp); } }
  // torches either side of the gate (night only): iron brackets, flames, point lights
  const torches: THREE.PointLight[] = [], torchFx: THREE.Object3D[] = [];
  for (const sx of [-1, 1]) { const p = V(cx + sx * 2.6, y0 + 3.2, cz - s - 1.0); b.add(B(p.x - 0.04, p.y - 0.5, p.z - 0.04, p.x + 0.04, p.y, p.z + 0.04), M("bkIron", "#3a3438"));
    const g = new THREE.Group(); flame(g, V(p.x, p.y + 0.12, p.z), 0.09); G.add(g); torchFx.push(g);
    const l = new THREE.PointLight("#ffb060", 0, 22, 1.4); l.position.set(p.x, p.y + 0.2, p.z - 0.4); G.add(l); torches.push(l); }
  // the flag on the keep: whose castle it is (posed by the world)
  const flag = bannerPole("bologna", 4.5, 2.2); flag.g.position.set(cx, y0 + 22, cz + 5.6); G.add(flag.g);
  const flagTex = { bologna: bannerTex("bologna"), modena: bannerTex("modena") };
  // the Panaro: a shallow river along z with moving water and foam at both banks, reeds and gravel
  const water = waterMat("#2e4a52", "#5a7a70", "#c0ccd2", "panaro"); water.U.uAmp.value = 0.18;
  const foamM = new THREE.MeshBasicMaterial({ map: foamTex(), transparent: true, depthWrite: false, opacity: 0.7, color: new THREE.Color(0.9, 0.94, 0.96) });
  { const g = new THREE.PlaneGeometry(RIVER_W + 2, 380, 30, 200); g.rotateX(-Math.PI / 2); g.translate(ox + RIVER_X, RIVER_Y, 50); const w = new THREE.Mesh(g, water.mat); w.receiveShadow = true; G.add(w);
    for (const sx of [-1, 1]) for (let z = -120; z < 220; z += 3) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.6), foamM); f.rotation.x = -Math.PI / 2; f.position.set(ox + RIVER_X + sx * (RIVER_W / 2 - 0.2) + 0.2 * Math.sin(z), RIVER_Y + 0.1, z); f.renderOrder = 2; G.add(f); }
    const gravel = lam("bkGravel", () => ({ map: dirtTex("bkGravelT", "#9a8a72"), color: "#b8a890" }));
    for (const sx of [-1, 1]) { const gg = sheet(ox + RIVER_X + sx * (RIVER_W / 2 + 2.2) - 2.4, ox + RIVER_X + sx * (RIVER_W / 2 + 2.2) + 2.4, -120, 220, 6, 170, (x, z) => gy(x, z) + 0.04, 3); const gm = new THREE.Mesh(gg, gravel); gm.receiveShadow = true; G.add(gm); }
    const rocks: Fol = []; for (let i = 0; i < 60; i++) { const sx = rnd(i) < 0.5 ? -1 : 1, x = RIVER_X + sx * (RIVER_W / 2 + 1 + rnd(i + 9) * 2.5), z = -100 + rnd(i + 99) * 300, r = 0.25 + rnd(i + 199) * 0.4; rocks.push({ g: rockGeo(r, i + 7, 0, 0.6), m: M4(ox + x, gy(ox + x, z) + r * 0.25, z, i), tint: 0.9 + 0.2 * rnd(i + 3) }); }
    const rm = new THREE.Mesh(mergeFacets(rocks), lam("bkRock", () => ({ color: "#a89c8a", vertexColors: true, flatShading: true }))); shadowAll(rm); G.add(rm); }
  // trees: scattered on the plain and the lower slopes, clear of the castle, the river, the battlefield and the cameras
  { const spots: [number, number, number, number][] = [];
    for (let i = 0; i < 260; i++) { const x = -200 + rnd(i + 21) * 400, z = -130 + rnd(i + 421) * 360, d = Math.hypot(x - HILL_C[0], (z - HILL_C[1]) * 0.9);
      if (d < HILL_TOP + 6) continue; if (Math.abs(x - RIVER_X) < RIVER_W / 2 + 7) continue; if (x > -55 && x < 60 && z > -45 && z < 50) continue; if (x > RIVER_X - 30 && x < RIVER_X + 30 && z > -40 && z < 30) continue;
      spots.push([ox + x, gy(ox + x, z), z, 0.85 + rnd(i + 821) * 0.5]); }
    trees(G, spots, "hill", 0.45); }
  // far hills on the horizon so the plain doesn't end on a flat line
  { const far: Fol = []; for (let i = 0; i < 14; i++) { const x = -260 + i * 40 + rnd(i) * 20, z = 280 + rnd(i + 30) * 50, r = 40 + rnd(i + 60) * 30; const g = new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2); far.push({ g, m: M4(ox + x, -2, z, i, 1, 0.32 + rnd(i + 90) * 0.12), tint: 0.85 + 0.15 * rnd(i + 5) }); }
    const fm = new THREE.Mesh(mergeFacets(far), lam("bkFarHill", () => ({ map: dirtTex("bkFarT", "#5a6e3a"), color: "#7a8a58", vertexColors: true, flatShading: true }))); fm.receiveShadow = true; G.add(fm); }
  const skies = { dusk: skyPl(G, caSkyTex("dusk"), "#2b3558", ox, 60, 420, 260, -40), night: skyPl(G, caSkyTex("night"), "#0a1026", ox, 60, 420, 260, -40), grey: skyPl(G, twSkyTex("winter"), "#8a98aa", ox, 60, 420, 260, -40), field: skyPl(G, caSkyTex("day"), "#5f95cf", ox, 60, 420, 260, -40) };
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 10, 64, 64, 64); gr.addColorStop(0, "rgba(255,250,230,1)"); gr.addColorStop(0.45, "rgba(255,248,220,0.95)"); gr.addColorStop(0.5, "rgba(220,220,240,0.25)"); gr.addColorStop(1, "rgba(200,210,240,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), fog: false, depthWrite: false, transparent: true }));
  moon.scale.setScalar(26); moon.position.set(ox - 60, 110, 380); moon.layers.set(NOINK); G.add(moon);
  b.build(G, true); noInk(G);
  for (const t of torchFx) t.traverse((o) => o.layers.set(NOINK));
  const turf = (x: number, z: number) => { const lx = x - ox; if (Math.abs(lx - RIVER_X) < RIVER_W / 2 + 4.6) return null; if (Math.abs(lx - HILL_C[0]) < s + 3.2 && Math.abs(z - HILL_C[1]) < s + 3.2) return null;
    if (z > -20 && z < CASTLE_GZ && Math.abs(lx - 6 * Math.sin(((z + 20) / (CASTLE_GZ + 20)) * 40 * 0.12)) < 1.8) return null; return gy(x, z); };
  void HILL_R;
  return { group: G, skies, doorL, doorR, flag, flagTex, torches, torchFx, moon, foam: foamM, water, turf, drift: (t) => { water.U.uTime.value = t; flag.wave(t); } };
}

// =====================================================================================================================
export type RoomSet = { group: THREE.Group; tower: THREE.Group; hall: THREE.Group; pope: THREE.Group; emp: THREE.Group; study: THREE.Group; bucket: THREE.Group; chain: THREE.Group;
  lamps: THREE.PointLight[]; win: THREE.PointLight; candles: THREE.Object3D[]; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildRoom(): RoomSet {
  const G = new THREE.Group(), ox = SET.room[0], tower = new THREE.Group(), hall = new THREE.Group(), pope = new THREE.Group(), emp = new THREE.Group(), study = new THREE.Group(); G.add(tower, hall, study); hall.add(pope, emp);
  const { w, z0, z1, h } = ROOM, bt = new Batch(), bh = new Batch(), bs = new Batch();
  const floorM = lam("bkRmFloor", () => ({ map: rep(stoneHD("bkRmFloorT", ["#b8a48a", "#a8947a", "#c4b096", "#9e8a70"], "#6a5a48"), 0.5, 0.5) })), oak = lam("bkRmOak", () => ({ map: planksHD(), color: "#6a4630" })), dark = lam("bkRmDark", () => ({ map: planksHD(), color: "#4a3224" }));
  const walls = (bb: Batch, wallM: THREE.Material, ceil: THREE.Material) => { bb.add(B(ox - w, -0.1, z0, ox + w, 0, z1, 2), floorM); bb.add(B(ox - w, h, z0, ox + w, h + 0.1, z1), ceil); bb.add(B(ox - w, 0, z1, ox + w, h, z1 + 0.15, 2), wallM); for (const sx of [-1, 1]) bb.add(B(ox + sx * w, 0, z0, ox + sx * (w + 0.15), h, z1, 2), wallM); bb.add(B(ox - w, 0, z0 - 0.15, ox + w, h, z0, 2), wallM); };
  // ---- the tower room in Modena: walls painted as fur, a starry vault, a slit window; the bucket on its chain ----
  { const vair = lam("bkVairM", () => ({ map: rep(vairTex(), 0.5, 0.5) })); walls(bt, vair, lam("bkStarsM", () => ({ map: rep(starsTex(), 0.3, 0.3), emissive: "#1a2a5a", emissiveIntensity: 0.25 })));
    const dado = M("bkDado", "#7a3a2a"); bt.add(B(ox - w, 0, z1 - 0.06, ox + w, 0.9, z1, 1), dado); for (const sx of [-1, 1]) bt.add(B(ox + sx * w - (sx > 0 ? 0.06 : 0), 0, z0, ox + sx * w + (sx < 0 ? 0.06 : 0), 0.9, z1, 1), dado);
    // a painted gold band where the walls meet the vault
    bt.add(B(ox - w, h - 0.35, z1 - 0.06, ox + w, h - 0.05, z1, 1), M("bkGoldBand", "#c89a3a")); for (const sx of [-1, 1]) bt.add(B(ox + sx * w - (sx > 0 ? 0.06 : 0), h - 0.35, z0, ox + sx * w + (sx < 0 ? 0.06 : 0), h - 0.05, z1, 1), M("bkGoldBand", "#c89a3a"));
    const slit = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.55, 1.4) })); slit.rotation.y = -Math.PI / 2; slit.position.set(ox + w - 0.02, 3.0, -1.2); tower.add(slit);
    // the iron grate in the vault the chain hangs through
    bt.add(B(ox + HANG[0] - 0.6, h - 0.06, HANG[2] - 0.6, ox + HANG[0] + 0.6, h, HANG[2] + 0.6), M("bkGrate", "#2a2426")); }
  bt.build(tower, true);
  // the bucket and its chain: oval iron links from the grate down to the bail
  const bucket = bucketGroup(); bucket.position.set(ox + HANG[0], HANG[1], HANG[2]); tower.add(bucket);
  const chain = new THREE.Group(); { const iron = M("bkChain", "#4a4448"), n = Math.ceil((h - HANG[1]) / 0.085); for (let k = 0; k < n; k++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 5, 10), iron); l.scale.y = 1.6; l.position.set(0, 0.04 + k * 0.085, 0); l.rotation.y = k % 2 ? Math.PI / 2 : 0; chain.add(l); } chain.position.set(ox + HANG[0], HANG[1], HANG[2]); shadowAll(chain); tower.add(chain); }
  // ---- the hall (Pope / Emperor): plaster walls, a dais with a throne, a banner behind it, drapes, candle stands ----
  { walls(bh, lam("bkHallPl", () => ({ map: plasterTex("bkHallPlT", "#d8c8a8") })), dark);
    for (let x = -w + 0.5; x < w; x += 1.6) bh.add(B(ox + x, h - 0.4, z0, ox + x + 0.3, h, z1), dark);
    const [tx, ty, tz] = THRONE; bh.add(B(ox - 2.2, 0, tz - 1.1, ox + 2.2, ty, z1, 1), M("bkDais", "#8a7a64")); bh.add(B(ox - 1.6, ty, tz - 0.85, ox + 1.6, ty + 0.04, z1, 1), M("bkCarpet", "#8a2a2a"));
    // the throne: seat, high back, arms, gilded finials
    const gold = M("bkGilt", "#c9a23a"), wood = M("bkThrone", "#5a3a26");
    bh.add(B(ox + tx - 0.5, ty, tz - 0.3, ox + tx + 0.5, ty + 0.48, tz + 0.3, 1), wood); bh.add(B(ox + tx - 0.5, ty + 0.48, tz + 0.18, ox + tx + 0.5, ty + 2.1, tz + 0.32, 1), wood);
    for (const sx of [-1, 1]) { bh.add(B(ox + tx + sx * 0.5 - 0.06, ty + 0.48, tz - 0.3, ox + tx + sx * 0.5 + 0.06, ty + 0.82, tz + 0.3), wood); bh.add(new THREE.SphereGeometry(0.08, 10, 8).translate(ox + tx + sx * 0.46, ty + 2.18, tz + 0.25), gold); }
    bh.add(B(ox + tx - 0.42, ty + 0.5, tz - 0.27, ox + tx + 0.42, ty + 0.56, tz + 0.27), M("bkCushion", "#a8302a"));
    // candle stands
    for (const sx of [-1.9, 1.9]) { bh.add(new THREE.CylinderGeometry(0.04, 0.12, 1.5, 8).translate(ox + sx, ty + 0.75, tz - 0.6), gold); bh.add(new THREE.CylinderGeometry(0.035, 0.035, 0.25, 8).translate(ox + sx, ty + 1.62, tz - 0.6), M("bkWax", "#f2ead6")); }
    // tall windows in the side wall
    for (const z of [-4.2, -1.4]) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.48, 1.4) })); wn.rotation.y = -Math.PI / 2; wn.position.set(ox + w - 0.02, 2.6, z); hall.add(wn); } }
  bh.build(hall, true);
  const candles: THREE.Object3D[] = [];
  for (const sx of [-1.9, 1.9]) { const g = new THREE.Group(); flame(g, V(ox + sx, THRONE[1] + 1.8, THRONE[2] - 0.6), 0.04); hall.add(g); candles.push(g); }
  // the Pope's dressing: red drapes, the crossed-keys banner; the Emperor's: blue drapes, the eagle banner
  for (const [grp, k, col] of [[pope, "pope", "#8a1e24"], [emp, "empire", "#2a3a6a"]] as [THREE.Group, BannerKind, string][]) {
    const dm = lam("bkDrapeM" + k, () => ({ map: drapeTex(k, col) }));
    for (const sx of [-1, 1]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.4, h - 0.5), dm); d.rotation.y = Math.PI; d.position.set(ox + sx * 3.4, (h - 0.5) / 2 + 0.05, z1 - 0.05); grp.add(d); }
    const bn = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.8), new THREE.MeshLambertMaterial({ map: bannerTex(k) })); bn.rotation.y = Math.PI; bn.position.set(ox, THRONE[1] + 3.3, z1 - 0.05); grp.add(bn); }
  // ---- the study, 1600s: plaster walls, a desk with books, a candle, a shelf of books, a leaded window ----
  { walls(bs, lam("bkStudyPl", () => ({ map: plasterTex("bkStudyPlT", "#cbb898") })), dark);
    for (let x = -w + 0.4; x < w; x += 1.4) bs.add(B(ox + x, h - 0.35, z0, ox + x + 0.26, h, z1), dark);
    const [dx, , dz] = DESK; bs.add(B(ox + dx - 1.0, 0.76, dz - 0.5, ox + dx + 1.0, 0.82, dz + 0.5), oak);
    for (const [ex, ez] of [[-0.92, -0.42], [0.92, -0.42], [-0.92, 0.42], [0.92, 0.42]]) bs.add(B(ox + dx + ex - 0.05, 0, dz + ez - 0.05, ox + dx + ex + 0.05, 0.76, dz + ez + 0.05), oak);
    // stacked books on the desk and on the shelf along the back wall
    const bc = ["#6a2a22", "#2a4a3a", "#5a4a2a", "#3a2a4a", "#7a5a2a"];
    for (let k = 0; k < 4; k++) bs.add(B(ox + dx + 0.55 - 0.18, 0.82 + k * 0.07, dz - 0.15 - 0.12 + 0.02 * k, ox + dx + 0.55 + 0.18, 0.82 + (k + 1) * 0.07, dz - 0.15 + 0.12), M("bkBk" + k, bc[k]));
    for (const y of [1.0, 1.6, 2.2]) { bs.add(B(ox - 4.4, y, z1 - 0.45, ox - 1.0, y + 0.05, z1), dark); for (let k = 0; k < 14; k++) bs.add(B(ox - 4.35 + k * 0.24, y + 0.05, z1 - 0.4, ox - 4.35 + k * 0.24 + 0.2, y + 0.38 + 0.08 * ((k * 7) % 3), z1 - 0.06), M("bkBk" + (k % 5), bc[k % 5])); }
    // the inkwell and the open book (its title page faces up toward the camera side)
    bs.add(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 10).translate(ox + dx - 0.55, 0.86, dz + 0.05), M("bkInk", "#1a1618"));
    bs.add(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 8).translate(ox + dx - 0.8, 0.93, dz + 0.25), M("bkWax", "#f2ead6"));
    // a chair behind the desk
    bs.add(B(ox + dx - 0.25, 0.45, dz + 0.65, ox + dx + 0.25, 0.5, dz + 1.15), oak); bs.add(B(ox + dx - 0.25, 0.5, dz + 1.1, ox + dx + 0.25, 1.25, dz + 1.15), oak);
    for (const [ex, ez] of [[-0.22, 0.68], [0.22, 0.68], [-0.22, 1.12], [0.22, 1.12]]) bs.add(B(ox + dx + ex - 0.03, 0, dz + ez - 0.03, ox + dx + ex + 0.03, 0.45, dz + ez + 0.03), oak);
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.7), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.45, 1.42, 1.3) })); wn.rotation.y = -Math.PI / 2; wn.position.set(ox + w - 0.02, 2.2, 0.2); study.add(wn);
    for (const k of [-1, 0, 1]) bs.add(B(ox + w - 0.04, 1.35, 0.2 + k * 0.42 - 0.02, ox + w, 3.05, 0.2 + k * 0.42 + 0.02), dark);
    bs.add(B(ox + w - 0.04, 2.18, -0.45, ox + w, 2.22, 0.85), dark); }
  bs.build(study, true);
  { const book = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), lam("bkBookM", () => ({ map: bookTex() }))); book.rotation.set(-Math.PI / 2 + 0.18, Math.PI, 0, "YXZ"); book.position.set(ox + DESK[0] - 0.05, 0.86, DESK[2] - 0.12); study.add(book);
    const g = new THREE.Group(); flame(g, V(ox + DESK[0] - 0.8, 1.08, DESK[2] + 0.25), 0.035); study.add(g); candles.push(g); }
  const lamps: THREE.PointLight[] = [];
  { const l = new THREE.PointLight("#ffd8a0", 0, 10, 1.4); l.position.set(ox + DESK[0] - 0.8, 1.2, DESK[2] + 0.1); study.add(l); lamps.push(l); }
  for (const sx of [-1.9, 1.9]) { const l = new THREE.PointLight("#ffd8a0", 0, 9, 1.4); l.position.set(ox + sx, THRONE[1] + 1.9, THRONE[2] - 0.9); hall.add(l); lamps.push(l); }
  const win = new THREE.PointLight("#eef0f6", 0, 18, 1.1); win.position.set(ox + w - 1.0, 2.8, -1.2); G.add(win);
  const dust = dustMotes(V(ox, 2.2, 0), V(8, 4, 9), 220, new THREE.Color(1, 0.92, 0.75), 0.03, 0.45); G.add(dust.points);
  noInk(G); for (const c of candles) c.traverse((o) => o.layers.set(NOINK));
  return { group: G, tower, hall, pope, emp, study, bucket, chain, lamps, win, candles, dust, drift: (t) => { dust.drift(t); const sw = 0.025 * Math.sin(t * 0.9); bucket.rotation.z = sw; bucket.rotation.y = 0.3 * Math.sin(t * 0.35); } };
}
void glow;
