// The Frank Hayes Short: the four sets (place.ts says where). Built to the background rules and the production
// checklist: every post and support reaches the ground, nothing floats, far ground has texture, signs are whole
// words, every light has a source, trees keep clear of buildings.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD } from "../bridge/paint";
import { mergeFacets, pineGeo, bushGeo, dustMotes } from "../bridge/scenery";
import { M, T, shadowAll, glow, sheet, nz, rodGeo, flame } from "../frozen/fsets";
import { NOINK } from "../bridge/ink";
import { caSkyTex, signTex } from "../cahaba/cpaint";
import { SET, TURF, DIRT, STAND, FENCES, POST, JUDGES, AISLE, STALL_Z, ROOM, SCALE, HILL, GRAVE, trackY } from "./place";
import { turfTex, dirtTex, brushTex, crowdTex, dialTex, stoneTex, boardsTex, strawTex } from "./hpaint";

const at = <O extends THREE.Object3D>(o: O, p: THREE.Vector3) => { o.position.copy(p); return o; };
const M4 = (x: number, y: number, z: number, ry = 0, s = 1) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(s, s, s));
type Fol = { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[];
const B = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) => boxGeo(V(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)), V(Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)), tile);
/** a sky all the way round (open cylinder seen from inside) with a lid in its top colour */
const skyPl = (G: THREE.Object3D, kind: Parameters<typeof caSkyTex>[0], x: number, z: number, r: number, h: number, y0: number) => {
  const tx = caSkyTex(kind).clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(4, 1); tx.needsUpdate = true;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64, 1, true), new THREE.MeshBasicMaterial({ map: tx, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.position.set(x, y0 + h / 2, z); m.layers.set(NOINK); m.renderOrder = -6;
  let top = new THREE.Color("#7fb0dc"); const im = tx.image as HTMLCanvasElement | undefined;
  try { const d = im?.getContext?.("2d")?.getImageData(Math.floor(im.width / 2), 1, 1, 1).data; if (d) top = new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255).convertSRGBToLinear(); } catch { /* keep */ }
  const lid = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshBasicMaterial({ color: top, fog: false, depthWrite: false, side: THREE.DoubleSide }));
  lid.rotation.x = Math.PI / 2; lid.position.y = h / 2 - 0.5; lid.renderOrder = -5; lid.layers.set(NOINK); m.add(lid); G.add(m); return m; };
const trees = (G: THREE.Object3D, spots: [number, number, number, number][], key: string) => {
  const fol: Fol = [], bark: Fol = [];
  spots.forEach(([x, y, z, s], i) => {
    if (i % 3 === 0) { const [f, t] = pineGeo(13 * s, 3.4 * s, i + 3); fol.push({ g: f, m: M4(x, y - 0.2, z, i), tint: 0.85 + 0.2 * ((i * 3) % 4) / 4 }); bark.push({ g: t, m: M4(x, y - 0.2, z, i) }); }
    else { const t = new THREE.CylinderGeometry(0.28 * s, 0.45 * s, 5 * s, 7); t.translate(0, 2.5 * s, 0); bark.push({ g: t, m: M4(x, y - 0.2, z, i) });
      for (let k = 0; k < 3; k++) fol.push({ g: bushGeo(2.6 * s, i * 7 + k, 4), m: M4(x + (k - 1) * 1.6 * s, y + (4.2 + (k % 2) * 1.4) * s, z + ((k * 5) % 3 - 1) * 1.2 * s, i + k), tint: 0.82 + 0.25 * ((i + k) % 3) / 2 });
      fol.push({ g: bushGeo(3.2 * s, i * 3 + 1, 5), m: M4(x, y + 6.2 * s, z, i), tint: 0.95 }); } });
  const a = new THREE.Mesh(mergeFacets(fol), lam("hsFol" + key, () => ({ color: "#3e6a2e", vertexColors: true, flatShading: true }))), b = new THREE.Mesh(mergeFacets(bark), lam("hsBark" + key, () => ({ color: "#4a3c30", vertexColors: true, flatShading: true })));
  shadowAll(a); shadowAll(b); G.add(a, b); };
/** a painted sign: a board with whole words on it (checklist: signs show whole, never cut) */
const sign = (G: THREE.Object3D, text: string, x: number, y: number, z: number, w: number, h: number, bg = "#f2ecdc", fg = "#1a1a2a", ry = 0) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: signTex(text, bg, fg, 1024, Math.round(1024 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; G.add(m); return m; };

// =====================================================================================================================
export type TrackSet = { group: THREE.Group; skies: Record<string, THREE.Mesh>; board: THREE.Mesh; turf: (x: number, z: number) => number | null; flag: THREE.Group };
export function buildTrack(): TrackSet {
  const G = new THREE.Group(), [ox] = SET.track, b = new Batch();
  const white = M("hsRail", "#f4f2ea"), wood = lam("hsWood", () => ({ map: planksHD(), color: "#a88a62" })), green = M("hsGreenPaint", "#2e5a3a"), roofM = M("hsRoof", "#6a5a50"), red = M("hsRed", "#b8352a");
  // ---- ground: the infield and lawns, the turf course, the dirt track ----
  { const g = sheet(ox - 900, ox + 1100, -420, 520, 200, 120, (x, z) => trackY(x - ox, z) + (Math.abs(z - (TURF.z0 + TURF.z1) / 2) < 14 || (z > DIRT.z0 - 2 && z < DIRT.z1 + 2) ? 0 : nz(x, z) * 1.2), 8);
    const m = new THREE.Mesh(g, lam("hsLawn", () => ({ map: turfTex(), color: "#7fa070" }))); m.receiveShadow = true; G.add(m); }
  { const g = new THREE.PlaneGeometry(1600, TURF.z1 - TURF.z0); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1600 / 12, uv.getY(i) * (TURF.z1 - TURF.z0) / 12);
    const m = new THREE.Mesh(g, lam("hsTurfC", () => ({ map: turfTex() }))); m.position.set(ox + 100, 0.015, (TURF.z0 + TURF.z1) / 2); m.receiveShadow = true; G.add(m); }
  { const g = new THREE.PlaneGeometry(1600, DIRT.z1 - DIRT.z0); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1600 / 14, uv.getY(i) * (DIRT.z1 - DIRT.z0) / 14);
    const m = new THREE.Mesh(g, lam("hsDirtC", () => ({ map: dirtTex() }))); m.position.set(ox + 100, 0.02, (DIRT.z0 + DIRT.z1) / 2); m.receiveShadow = true; G.add(m); }
  // ---- white rails: posts every 3 m, a top rail; both edges of both tracks ----
  for (const z of [TURF.z0, TURF.z1, DIRT.z0, DIRT.z1]) { const x0 = -500, x1 = 700, out = z === TURF.z0 || z === DIRT.z1 ? -1 : 1;
    for (let x = x0; x <= x1; x += 3) b.add(B(ox + x - 0.06, 0, z - 0.06, ox + x + 0.06, 1.12, z + 0.06), white);
    b.add(B(ox + x0, 1.02, z - 0.05 * out - 0.06, ox + x1, 1.14, z - 0.05 * out + 0.06), white); }
  // ---- brush fences across the turf course: a timber frame, packed brush, wings at each end ----
  const brush = lam("hsBrushM", () => ({ map: brushTex() }));
  for (const fx of FENCES) { const z0 = TURF.z0 + 0.3, z1 = TURF.z1 - 0.3, x = ox + fx;
    b.add(B(x - 0.55, 0, z0, x + 0.55, 0.45, z1), green);
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, z1 - z0), brush); f.position.set(x, 0.95, (z0 + z1) / 2); f.castShadow = f.receiveShadow = true; G.add(f);
    for (const z of [z0 - 1.6, z1 + 1.6]) { b.add(B(x - 0.4, 0, z - 1.2, x + 0.4, 1.6, z + 1.2), white); }
    b.add(B(x - 1.1, 0, z0, x - 0.55, 0.18, z1), green); }   // the take-off board
  // ---- the finish post: a white pole with a round black-and-white target, the line across the turf ----
  { const x = ox + POST.x; b.add(B(x - 0.09, 0, POST.z - 0.09, x + 0.09, 4.2, POST.z + 0.09), white);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 24), M("hsPostDisc", "#f4f2ea")); disc.rotation.x = Math.PI / 2; disc.position.set(x, 4.5, POST.z); G.add(disc);
    const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 20), M("hsPostDot", "#1a1a1e")); dot.rotation.x = Math.PI / 2; dot.position.set(x, 4.5, POST.z); G.add(dot);
    b.add(B(x - 0.04, 4.0, POST.z - 0.04, x + 0.04, 4.5, POST.z + 0.04), white);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.18, TURF.z1 - TURF.z0), M("hsLine", "#f4f2ea")); line.rotation.x = -Math.PI / 2; line.position.set(x, 0.03, (TURF.z0 + TURF.z1) / 2); G.add(line); }
  // ---- the judges' stand: a little roofed box on four posts, stairs up the back ----
  { const x = ox + JUDGES.x, z = JUDGES.z, fy = 3.6;
    for (const [dx, dz] of [[-1.5, -1.3], [1.5, -1.3], [-1.5, 1.3], [1.5, 1.3]]) b.add(B(x + dx - 0.12, 0, z + dz - 0.12, x + dx + 0.12, fy + 2.6, z + dz + 0.12), white);
    b.add(B(x - 1.8, fy - 0.2, z - 1.6, x + 1.8, fy, z + 1.6), wood);
    b.add(B(x - 1.8, fy, z - 1.6, x + 1.8, fy + 1.0, z - 1.5), white); b.add(B(x - 1.8, fy, z - 1.6, x - 1.7, fy + 1.0, z + 1.6), white); b.add(B(x + 1.7, fy, z - 1.6, x + 1.8, fy + 1.0, z + 1.6), white);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(2.9, 1.3, 4), roofM); rf.rotation.y = Math.PI / 4; rf.position.set(x, fy + 3.25, z); rf.castShadow = true; G.add(rf);
    for (let k = 0; k < 9; k++) b.add(B(x + 1.8 + k * 0.33, fy - 0.4 * k - 0.08, z + 0.4, x + 2.15 + k * 0.33, fy - 0.4 * k, z + 1.4), wood);
    // the stair's two stringers, from the floor's edge down to the ground, and a post under the top
    for (const sz of [z + 0.36, z + 1.44]) { const g = new THREE.BoxGeometry(Math.hypot(9 * 0.33, fy), 0.22, 0.08); g.rotateZ(-Math.atan2(fy, 9 * 0.33)); g.translate(x + 1.8 + 4.5 * 0.33, fy / 2 - 0.1, sz); b.add(g, wood); }
    b.add(B(x + 1.8, 0, z + 1.4, x + 4.9, 0.1, z + 1.5), wood);
    sign(G, "JUDGES", x, fy + 1.6, z - 1.62, 2.6, 0.5, "#2e5a3a", "#f4ecd0", Math.PI); }
  // ---- the result board beside it (its face is swapped in by the story: blank, or the winner) ----
  const boardFace = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.6), new THREE.MeshLambertMaterial({ map: signTex("OFFICIAL|WINNER: SWEET KISS", "#1e3a2a", "#f4ecd0", 1024, 512) }));
  { const x = ox + JUDGES.x - 8, z = JUDGES.z + 0.6; for (const dx of [-2.2, 2.2]) b.add(B(x + dx - 0.12, 0, z - 0.12, x + dx + 0.12, 5.6, z + 0.12), white);
    b.add(B(x - 2.8, 2.7, z - 0.02, x + 2.8, 5.6, z + 0.2), green); boardFace.position.set(x, 4.15, z - 0.16); boardFace.rotation.y = Math.PI; G.add(boardFace); }
  // ---- the grandstand: tiers of seats with the crowd, a roof on columns, a lawn and the rail in front ----
  { const x0 = ox + STAND.x0, x1 = ox + STAND.x1, z0 = STAND.z0, h = STAND.h, depth = 26;
    b.add(B(x0, 0, z0 + 0.0, x1, 1.6, z0 + 2.2), wood);   // the front wall of the apron
    for (let k = 0; k < 10; k++) b.add(B(x0, 1.6 + k * 0.9, z0 + 2.2 + k * 2.0, x1, 2.5 + k * 0.9, z0 + depth), M("hsTier", k % 2 ? "#8a7a6a" : "#7a6c5e"));
    // the crowd: painted rows on a slope just above the tiers
    const cw = x1 - x0, cr = new THREE.Mesh(new THREE.PlaneGeometry(cw, Math.hypot(20, 9)), new THREE.MeshLambertMaterial({ map: (() => { const t = crowdTex("a").clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(cw / 40, 1); t.needsUpdate = true; return t; })() }));
    cr.position.set((x0 + x1) / 2, 2.5 + 4.5 + 0.35, z0 + 2.2 + 10); cr.rotation.set(-Math.atan2(20, 9), Math.PI, 0, "YXZ"); G.add(cr);
    b.add(B(x0, 0, z0 + depth, x1, h, z0 + depth + 0.6), M("hsStandBack", "#d9cfb8"));
    for (let x = x0; x <= x1; x += 10) b.add(B(x - 0.25, 0, z0 + 3.4, x + 0.25, h, z0 + 3.9), white);
    const rf = new THREE.Mesh(B(x0 - 2, h, z0 + 1.0, x1 + 2, h + 0.5, z0 + depth + 1), roofM); rf.castShadow = true; G.add(rf);
    b.add(B(x0 - 2, h - 1.0, z0 + 0.9, x1 + 2, h, z0 + 1.1), M("hsFascia", "#e9e2cf"));
    for (const sx of [x0, x1]) b.add(B(sx - 0.3, 0, z0, sx + 0.3, h, z0 + depth + 0.6), M("hsStandBack", "#d9cfb8"));
    for (let x = x0 + 20; x < x1; x += 40) { const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), M("hsFlag", "#b8352a", { side: THREE.DoubleSide })); fl.position.set(x, h + 3.4, z0 + 4); G.add(fl); b.add(B(x - 0.04, h + 0.5, z0 + 3.96, x + 0.04, h + 4.0, z0 + 4.04), white); }
    sign(G, "BELMONT PARK", (x0 + x1) / 2, h - 0.5, z0 + 0.85, 26, 1.4, "#e9e2cf", "#2e3a5a", Math.PI);
    // the lawn in front of the stand: a second, lower rail of standing spectators is painted on the apron wall's top
    const ap = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 1.8), new THREE.MeshLambertMaterial({ map: (() => { const t = crowdTex("b", 1).clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set((x1 - x0) / 5, 1); t.needsUpdate = true; return t; })(), transparent: false }));
    ap.position.set((x0 + x1) / 2, 2.4, z0 + 1.0); ap.rotation.y = Math.PI; G.add(ap); }
  // ---- the starter's stand far up the course, with his flag (posed by the story) ----
  const flag = new THREE.Group(); { const x = ox + 470, z = TURF.z0 - 3; b.add(B(x - 0.9, 0, z - 0.9, x + 0.9, 1.6, z + 0.9), wood); for (let k = 0; k < 4; k++) b.add(B(x + 0.9 + k * 0.3, 0, z - 0.3, x + 1.2 + k * 0.3, 1.6 - k * 0.4, z + 0.3), wood);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6), M("hsFlagPole", "#6a4a2a")); pole.position.y = 0.55; flag.add(pole);
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), M("hsFlagRed", "#d23a2e", { side: THREE.DoubleSide })); cloth.position.set(0.36, 0.85, 0); flag.add(cloth); flag.visible = false; G.add(flag); }
  // ---- the paddock buildings and barns beyond the stand's ends, trees all round ----
  for (const [x, z, w, d] of [[-160, 60, 30, 14], [-210, 40, 22, 12], [230, 58, 36, 16], [290, 44, 24, 12]] as [number, number, number, number][]) {
    b.add(B(ox + x - w / 2, 0, z - d / 2, ox + x + w / 2, 5, z + d / 2), M("hsBarnRed", "#9a4a36"));
    b.add(B(ox + x - w / 2 - 0.5, 5, z - d / 2 - 0.5, ox + x + w / 2 + 0.5, 5.6, z + d / 2 + 0.5), roofM); b.add(B(ox + x - w / 2, 5.6, z - d / 4, ox + x + w / 2, 6.6, z + d / 4), roofM); }
  const spots: [number, number, number, number][] = [];
  for (let i = 0; i < 70; i++) { const x = -700 + i * 24 + ((i * 37) % 11), z = 96 + ((i * 53) % 40); spots.push([ox + x, trackY(x, z), z, 1.1 + ((i * 7) % 5) * 0.12]); }
  for (let i = 0; i < 60; i++) { const x = -700 + i * 28 + ((i * 41) % 13), z = -100 - ((i * 29) % 70); spots.push([ox + x, trackY(x, z), z, 1.2 + ((i * 3) % 5) * 0.14]); }
  for (let i = 0; i < 14; i++) { const x = -60 + i * 40 + ((i * 17) % 9), z = -52 - ((i * 13) % 12); spots.push([ox + x, 0, z, 0.9 + (i % 3) * 0.1]); }   // infield trees, clear of the course
  trees(G, spots, "T");
  b.build(G, true);
  const skies = { day: skyPl(G, "day", ox + 100, 0, 1400, 900, -200), morn: skyPl(G, "morn", ox + 100, 0, 1400, 900, -200), dusk: skyPl(G, "dusk", ox + 100, 0, 1400, 900, -200) };
  const turf = (x: number, z: number) => { const lx = x - ox; if (z > TURF.z0 - 1.2 && z < TURF.z1 + 1.2) return null; if (z > DIRT.z0 - 1 && z < DIRT.z1 + 1) return null; if (z > STAND.z0 - 1) return null;
    if (Math.abs(lx - JUDGES.x) < 2.4 && Math.abs(z - JUDGES.z) < 2.2) return null; return trackY(lx, z) + 0.02; };
  return { group: G, skies, board: boardFace, turf, flag };
}

// =====================================================================================================================
export type StableSet = { group: THREE.Group; lamps: THREE.PointLight[]; motes: ReturnType<typeof dustMotes>; tools: Record<string, THREE.Group> };
export function buildStable(): StableSet {
  const G = new THREE.Group(), [ox] = SET.stable, b = new Batch(), { hw, z0, z1, h, stall } = AISLE;
  const wall = lam("hsBarnW", () => ({ map: boardsTex("barn", "#d8ccb4") })), dark = lam("hsBarnD", () => ({ map: boardsTex("stall", "#8a6a48") })), beam = M("hsBeam", "#6a4a30"), straw = lam("hsStrawM", () => ({ map: strawTex() })), iron = M("hsIron", "#34303a");
  // floor: packed earth in the aisle, straw in the stalls
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, z1 - z0 + 8), lam("hsAisle", () => ({ map: dirtTex(), color: "#9a8a76" }))); f.rotation.x = -Math.PI / 2; f.position.set(ox, 0.01, (z0 + z1) / 2 + 4); f.receiveShadow = true; G.add(f); }
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(3.4, z1 - z0), straw); f.rotation.x = -Math.PI / 2; f.position.set(ox + s * (hw + 1.7), 0.02, (z0 + z1) / 2); f.receiveShadow = true; G.add(f);
    // the outer wall, the stall fronts (a low boarded half with iron bars above), dividers between stalls
    b.add(B(ox + s * (hw + 3.4), 0, z0, ox + s * (hw + 3.6), h, z1), wall);
    for (let k = 0; k * stall + z0 < z1 - 1; k++) { const za = STALL_Z(k) - stall / 2, zb = za + stall;
      b.add(B(ox + s * hw, 0, za, ox + s * (hw + 0.08), 1.3, za + 0.15), beam); b.add(B(ox + s * hw, 0, zb - 0.15, ox + s * (hw + 0.08), 1.3, zb), beam);
      // the half door: the lower door is shut, the top open so the horse can look out
      b.add(B(ox + s * hw, 0.05, za + 0.15, ox + s * (hw + 0.06), 1.25, zb - 0.15), dark);
      b.add(B(ox + s * hw - 0.04, 1.25, za, ox + s * (hw + 0.1), 1.34, zb), beam);
      b.add(B(ox + s * (hw + 0.01), 1.34, za, ox + s * (hw + 0.09), h - 0.8, za + 0.15), beam); b.add(B(ox + s * (hw + 0.01), 1.34, zb - 0.15, ox + s * (hw + 0.09), h - 0.8, zb), beam);
      b.add(B(ox + s * hw, h - 0.9, za, ox + s * (hw + 0.12), h - 0.8, zb), beam);
      b.add(B(ox + s * (hw + 0.08), 0, zb - 0.06, ox + s * (hw + 3.4), 2.2, zb + 0.06), dark);   // the divider
      const ns = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.28), new THREE.MeshLambertMaterial({ map: signTex(["DUKE", "MOLLY", "SWEET KISS", "BISCUIT", "MAJOR", "PENNY", "ROVER", "DUCHESS", "BUCK", "LADY", "CHIEF", "ROSIE", "KING"][(k + (s > 0 ? 6 : 0)) % 13], "#f2ecdc", "#2a2020", 512, 160) }));
      ns.position.set(ox + s * (hw - 0.01), 1.55, (za + zb) / 2); ns.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; G.add(ns); } }
  // the roof: rafters and a ridge, lanterns on hooks; the near end wall; the far door open onto daylight
  for (let z = z0; z <= z1; z += 2.4) b.add(B(ox - hw - 3.6, h, z - 0.1, ox + hw + 3.6, h + 0.22, z + 0.1), beam);
  b.add(B(ox - hw - 3.6, h + 0.22, z0, ox + hw + 3.6, h + 0.3, z1), M("hsLoft", "#5a4434"));
  b.add(B(ox - hw - 3.6, 0, z0 - 0.3, ox + hw + 3.6, h + 0.3, z0), wall);
  for (const s of [-1, 1]) b.add(B(ox + s * hw, 0, z1, ox + s * (hw + 3.6), h + 0.3, z1 + 0.3), wall);
  b.add(B(ox - hw, 3.1, z1, ox + hw, h + 0.3, z1 + 0.3), wall);
  { const day = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.3), fog: false })); day.position.set(ox, 6, z1 + 18); day.layers.set(NOINK); G.add(day);
    const yard = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), lam("hsYard", () => ({ map: dirtTex(), color: "#d8c09a" }))); yard.rotation.x = -Math.PI / 2; yard.position.set(ox, 0.0, z1 + 15); G.add(yard);
    trees(G, [[ox - 10, 0, z1 + 22, 0.9], [ox + 9, 0, z1 + 26, 1], [ox + 2, 0, z1 + 30, 1.1]], "S"); }
  const lamps: THREE.PointLight[] = [];
  for (let z = z0 + 4; z < z1 - 2; z += 9) { const l = new THREE.PointLight("#ffd29a", 7, 9, 1.6); l.position.set(ox, h - 0.9, z); G.add(l); lamps.push(l);
    b.add(B(ox - 0.12, h - 1.05, z - 0.12, ox + 0.12, h - 0.7, z + 0.12), M("hsLantern", "#3a3430")); flame(G, V(ox, h - 0.9, z), 0.05); G.add(at(glow(new THREE.Color("#ffcf8a"), 0.9), V(ox, h - 0.9, z))); b.add(B(ox - 0.01, h - 0.7, z - 0.01, ox + 0.01, h, z + 0.01), iron); }
  // dressing: hay bales, buckets, a wheelbarrow, a saddle on a rack, a pitchfork (the pitchfork is posed by the story)
  for (const [x, z] of [[-1.2, 28], [-1.2, 29.4], [1.3, -12], [0.05, 28.1]] as [number, number][]) { const hb = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.6), straw); hb.position.set(ox + x, 0.25, z); hb.rotation.y = 0.1 * x; shadowAll(hb); G.add(hb); }
  { const hb = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.6), straw); hb.position.set(ox - 1.2, 0.75, 28.7); hb.rotation.y = 0.3; shadowAll(hb); G.add(hb); }
  for (const [x, z] of [[1.55, 2], [-1.55, 9.2], [1.55, 15]] as [number, number][]) { const bk = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.32, 12, 1, true), M("hsBucket", "#7a8a9a", { side: THREE.DoubleSide })); bk.position.set(ox + x, 0.16, z); shadowAll(bk); G.add(bk); }
  const tools: Record<string, THREE.Group> = {};
  { const g = new THREE.Group(), w2 = M("hsHandle", "#b08a5a"); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.4, 6), w2)); for (let k = -1; k <= 1; k++) { const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.32, 5), iron); t2.position.set(k * 0.05, -0.85, 0); g.add(t2); }
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.02), iron); cross.position.y = -0.7; g.add(cross); shadowAll(g); G.add(g); tools.fork = g; }
  { const g = new THREE.Group(), w2 = M("hsBarrow", "#5a6a4a"); const tub = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.36, 0.62), w2); tub.position.y = 0.5; g.add(tub);
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 14), iron); wh.rotation.x = Math.PI / 2; wh.position.set(0.55, 0.2, 0); g.add(wh);
    for (const s of [-1, 1]) { g.add(Object.assign(new THREE.Mesh(rodGeo(V(0.5, 0.25, s * 0.22), V(-1.0, 0.62, s * 0.26), 0.025), beam))); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.04), beam), V(-0.35, 0.18, s * 0.24))); }
    const load = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 6), straw); load.scale.set(1.1, 0.35, 0.7); load.position.set(0, 0.7, 0); g.add(load); shadowAll(g); G.add(g); tools.barrow = g; }
  { const g = new THREE.Group(); const sd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.36), M("hsSaddle", "#5a3420")); sd.position.y = 1.12; g.add(sd);
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.06), beam), V(0, 1.04, 0))); g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.04, 0.06), beam), V(0, 0.52, 0)));
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.4), beam), V(0, 0.02, 0))); g.position.set(ox - 1.4, 0, 20); shadowAll(g); G.add(g); }
  b.build(G, true);
  const motes = dustMotes(V(ox, 2, (z0 + z1) / 2), V(hw * 2, 3, z1 - z0), 260, new THREE.Color("#ffe8c0"), 0.03, 0.5); motes.points.layers.set(NOINK); G.add(motes.points);
  return { group: G, lamps, motes, tools };
}

// =====================================================================================================================
export type WeighSet = { group: THREE.Group; needle: THREE.Group; lamp: THREE.PointLight; cup: THREE.Group; plate: THREE.Group };
export function buildWeigh(): WeighSet {
  const G = new THREE.Group(), [ox] = SET.weigh, b = new Batch(), { w, d, h } = ROOM;
  const wall = lam("hsRoomW", () => ({ map: boardsTex("room", "#e4d8bc") })), floor = lam("hsRoomF", () => ({ map: planksHD(), color: "#9a7a58" })), trim = M("hsTrim", "#5a3e2a"), iron = M("hsScaleIron", "#2e3a34"), brass = M("hsBrass", "#c9a24a");
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floor); f.rotation.x = -Math.PI / 2; f.position.set(ox, 0, d / 2 - 1); f.receiveShadow = true; G.add(f); }
  b.add(B(ox - w / 2, 0, d - 1, ox + w / 2, h, d - 0.8), wall);   // back wall
  for (const s of [-1, 1]) b.add(B(ox + s * w / 2, 0, -1, ox + s * (w / 2 + 0.2), h, d - 0.8), wall);
  b.add(B(ox - w / 2, h, -1, ox + w / 2, h + 0.2, d - 0.8), M("hsCeil", "#cfc4aa"));
  b.add(B(ox - w / 2, 0, d - 1.05, ox + w / 2, 1.0, d - 1.0), trim); b.add(B(ox - w / 2, 0.98, d - 1.08, ox + w / 2, 1.06, d - 1.0), trim);
  // a window in the back wall (daylight beyond), a coat rack, saddles on pegs, a bench
  { const wx = ox - 2.6; b.add(B(wx - 0.9, 1.1, d - 1.12, wx + 0.9, 2.7, d - 1.04), trim);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.45, 1.3), fog: false })); pane.position.set(wx, 1.9, d - 1.13); pane.rotation.y = Math.PI; pane.layers.set(NOINK); G.add(pane);
    b.add(B(wx - 0.03, 1.15, d - 1.14, wx + 0.03, 2.65, d - 1.12), trim); b.add(B(wx - 0.85, 1.87, d - 1.14, wx + 0.85, 1.93, d - 1.12), trim); }
  for (let k = 0; k < 3; k++) { const x = ox + 1.2 + k * 1.0; b.add(B(x - 0.03, 1.6, d - 1.3, x + 0.03, 1.66, d - 1.05), trim); const sd = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.1, 0.3), M("hsSaddle", "#5a3420")); sd.position.set(x, 1.7, d - 1.2); sd.rotation.z = 0.1; shadowAll(sd); G.add(sd); }
  b.add(B(ox + 0.4, 0.42, d - 1.6, ox + 4.2, 0.48, d - 1.15), M("hsBench", "#7a5a3a")); for (const x of [0.5, 4.1]) b.add(B(ox + x - 0.05, 0, d - 1.55, ox + x + 0.05, 0.42, d - 1.2), trim);
  sign(G, "WEIGHING ROOM", ox - 2.6, 3.1, d - 1.12, 2.4, 0.42, "#2e3a2e", "#f4ecd0", Math.PI);
  // the platform scale: a plate on the floor, a column, the big round dial and its needle
  { const sx = ox + SCALE.x, sz = SCALE.z;
    b.add(B(sx - 0.55, 0, sz - 0.45, sx + 0.55, 0.12, sz + 0.45), iron); b.add(B(sx - 0.5, 0.12, sz - 0.4, sx + 0.5, 0.14, sz + 0.4), M("hsScalePlate", "#6a7470"));
    b.add(B(sx - 0.09, 0, sz + 0.45, sx + 0.09, 1.7, sz + 0.62), iron);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 32), brass); rim.rotation.x = Math.PI / 2; rim.position.set(sx, 2.05, sz + 0.54); shadowAll(rim); G.add(rim);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), new THREE.MeshLambertMaterial({ map: dialTex() })); face.position.set(sx, 2.05, sz + 0.485); face.rotation.y = Math.PI; G.add(face);
    b.add(B(sx - 0.3, 1.6, sz + 0.45, sx + 0.3, 1.66, sz + 0.62), iron); }
  const needle = new THREE.Group(); { const n = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.36, 0.01), M("hsNeedle", "#120c16")); n.position.y = 0.15; needle.add(n); needle.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 12).rotateX(Math.PI / 2), brass));
    needle.position.set(ox + SCALE.x, 2.05, SCALE.z + 0.47); G.add(needle); }
  // the clerk's desk with a ledger and an inkwell, a lamp hanging over the scale
  { const dx = ox - 1.9, dz = 2.6; b.add(B(dx - 0.8, 0.74, dz - 0.4, dx + 0.8, 0.8, dz + 0.4), trim); for (const [a, c] of [[-0.74, -0.34], [0.74, -0.34], [-0.74, 0.34], [0.74, 0.34]]) b.add(B(dx + a - 0.04, 0, dz + c - 0.04, dx + a + 0.04, 0.74, dz + c + 0.04), trim);
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.34), M("hsLedger", "#7a2a24")); led.position.set(dx + 0.1, 0.82, dz - 0.05); G.add(led); const pg = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.3), M("hsPage", "#f4f0e2")); pg.rotation.x = -Math.PI / 2; pg.position.set(dx + 0.1, 0.845, dz - 0.05); G.add(pg);
    b.add(B(dx - 0.35, 0, dz + 0.55, dx + 0.05, 0.46, dz + 0.95), trim); }
  // the hot box in the corner: a tall wooden cabinet with a hole for the head, a door with a latch
  { const hx = ox + 3.6, hz = 1.2; b.add(B(hx - 0.5, 0, hz - 0.5, hx + 0.5, 1.5, hz + 0.5), lam("hsHotBox", () => ({ map: planksHD(), color: "#8a5a3a" })));
    b.add(B(hx - 0.5, 1.5, hz - 0.5, hx + 0.5, 1.58, hz - 0.16), trim); b.add(B(hx - 0.5, 1.5, hz + 0.16, hx + 0.5, 1.58, hz + 0.5), trim); b.add(B(hx - 0.5, 1.5, hz - 0.16, hx - 0.18, 1.58, hz + 0.16), trim); b.add(B(hx + 0.18, 1.5, hz - 0.16, hx + 0.5, 1.58, hz + 0.16), trim);
    b.add(B(hx - 0.52, 0.7, hz - 0.12, hx - 0.5, 0.8, hz + 0.12), brass); }
  const lamp = new THREE.PointLight("#ffe2b0", 6, 10, 1.5); lamp.position.set(ox + 0.2, h - 0.5, 2.2); G.add(lamp);
  b.add(B(ox + 0.2 - 0.01, h - 0.45, 2.2 - 0.01, ox + 0.2 + 0.01, h, 2.2 + 0.01), iron);
  { const sh = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 16, 1, true), M("hsShade", "#2e4a3a", { side: THREE.DoubleSide })); sh.position.set(ox + 0.2, h - 0.5, 2.2); G.add(sh); G.add(at(glow(new THREE.Color("#ffe2b0"), 0.6), V(ox + 0.2, h - 0.58, 2.2))); }
  // a tin cup of water and a plate (posed by the story)
  const cup = new THREE.Group(); { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.1, 14, 1, true), M("hsCup", "#9aa4ac", { side: THREE.DoubleSide })); c.position.y = 0.05; cup.add(c); const wt = new THREE.Mesh(new THREE.CircleGeometry(0.04, 14), M("hsWater", "#7ab0d0")); wt.rotation.x = -Math.PI / 2; wt.position.y = 0.085; cup.add(wt); shadowAll(cup); cup.visible = false; G.add(cup); }
  const plate = new THREE.Group(); { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.02, 20), M("hsPlate", "#f2eee4")); plate.add(p);
    for (const [x, z, c, s] of [[-0.03, 0.02, "#c9a24a", 0.05], [0.04, -0.03, "#7a4a2a", 0.06], [0.02, 0.05, "#5a8a3a", 0.035]] as [number, number, string, number][]) { const f = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 6), M("hsFood" + c, c)); f.scale.y = 0.5; f.position.set(x, 0.025, z); plate.add(f); } shadowAll(plate); plate.visible = false; G.add(plate); }
  b.build(G, true);
  return { group: G, needle, lamp, cup, plate };
}

// =====================================================================================================================
export type GraveSet = { group: THREE.Group; turf: (x: number, z: number) => number | null };
export function buildGrave(): GraveSet {
  const G = new THREE.Group(), [ox] = SET.grave, b = new Batch(), stone = lam("hsStoneM", () => ({ map: stoneTex() })), iron = M("hsFence", "#2a2a2e");
  { const g = sheet(ox - 300, ox + 300, -200, 400, 120, 120, (x, z) => HILL(x - ox, z) + nz(x, z) * 0.6, 6); const m = new THREE.Mesh(g, lam("hsHill", () => ({ map: turfTex(), color: "#8aa47a" }))); m.receiveShadow = true; G.add(m); }
  // rows of headstones up the slope (blank faces: no invented names), a few crosses and obelisks
  for (let row = 0; row < 12; row++) for (let k = 0; k < 22; k++) { const x = -60 + k * 5.5 + (row % 2) * 2.4 + ((k * 7 + row * 3) % 5) * 0.3, z = 12 + row * 5 + ((k * 3) % 4) * 0.4; if (Math.abs(x - GRAVE.x) < 5 && Math.abs(z - GRAVE.z) < 6) continue;
    const y = HILL(x, z) - 0.05, kind = (k * 5 + row * 3) % 7, wx = ox + x;
    if (kind === 0) { b.add(B(wx - 0.25, y, z - 0.25, wx + 0.25, y + 0.3, z + 0.25), stone); b.add(B(wx - 0.12, y + 0.3, z - 0.12, wx + 0.12, y + 2.2, z + 0.12), stone); }
    else if (kind === 1) { b.add(B(wx - 0.07, y, z - 0.07, wx + 0.07, y + 1.3, z + 0.07), stone); b.add(B(wx - 0.35, y + 0.85, z - 0.07, wx + 0.35, y + 1.0, z + 0.07), stone); }
    else { const hh = 0.7 + (kind % 3) * 0.2; b.add(B(wx - 0.4, y, z - 0.1, wx + 0.4, y + hh, z + 0.1), stone); b.add(B(wx - 0.3, y + hh, z - 0.1, wx + 0.3, y + hh + 0.12, z + 0.1), stone); } }
  // Frank's grave: a fresh mound, a plain stone, flowers (the wreath is posed in the story's shots as a prop)
  { const x = ox + GRAVE.x, z = GRAVE.z, y = HILL(GRAVE.x, GRAVE.z);
    const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam("hsMound", () => ({ map: dirtTex(), color: "#8a6a4a" }))); mound.scale.set(0.9, 0.35, 1.3); mound.position.set(x, y - 0.05, z); shadowAll(mound); G.add(mound);
    b.add(B(x - 0.45, y - 0.05, z + 1.4, x + 0.45, y + 0.95, z + 1.6), stone);
    const wreath = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 8, 20), M("hsWreathG", "#3a6a34")); wreath.position.set(x, y + 0.88, z + 1.32); shadowAll(wreath); G.add(wreath);
    for (let k = 0; k < 22; k++) { const a = (k / 22) * 6.283, f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M(k % 2 ? "hsFlwB" : "hsFlwY", k % 2 ? "#2a4aa8" : "#f2c230")); f.position.set(x + Math.cos(a) * 0.32, y + 0.88 + Math.sin(a) * 0.32, z + 1.26); G.add(f); }
    for (let k = 0; k < 26; k++) { const fx = ((k * 37) % 13 - 6) * 0.035, fz = 0.55 + ((k * 23) % 11 - 5) * 0.045, top = y - 0.05 + 0.35 * Math.sqrt(Math.max(0, 1 - (fx / 0.9) ** 2 - (fz / 1.3) ** 2));
      const f = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.025, 7), M(k % 3 === 0 ? "hsFlwY" : k % 3 === 1 ? "hsFlwB" : "hsFlwW", k % 3 === 0 ? "#f2c230" : k % 3 === 1 ? "#2a4aa8" : "#f4f0e6")); f.position.set(x + fx, top + 0.06, z + fz); f.rotation.set((k % 5) * 0.2 - 0.4, 0, (k % 3) * 0.2 - 0.2); G.add(f);
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 4), M("hsStem", "#3a6a34")); st.position.set(x + fx, top + 0.02, z + fz); G.add(st); } }
  // the iron fence along the road below, gate posts, a path; trees
  for (let x = -120; x <= 120; x += 0.5) b.add(B(ox + x - 0.015, HILL(x, -8) - 0.1, -8.02, ox + x + 0.015, HILL(x, -8) + 1.5, -7.98), iron);
  for (let x = -120; x < 120; x += 6) { const y0 = HILL(x, -8); b.add(B(ox + x, y0 + 1.25, -8.03, ox + x + 6, y0 + 1.3, -7.97), iron); b.add(B(ox + x, y0 + 0.3, -8.03, ox + x + 6, y0 + 0.35, -7.97), iron); }
  const spots: [number, number, number, number][] = [];
  for (let i = 0; i < 30; i++) { const x = -150 + i * 11 + ((i * 13) % 7), z = 80 + ((i * 29) % 40); spots.push([ox + x, HILL(x, z), z, 1.1 + (i % 4) * 0.12]); }
  for (const [x, z] of [[-14, 18], [12, 30], [-26, 40], [24, 14], [-8, 52], [34, 44]] as [number, number][]) spots.push([ox + x, HILL(x, z), z, 1.0]);
  trees(G, spots, "G");
  b.build(G, true);
  skyPl(G, "day", ox, 100, 1200, 800, -200);
  const turf = (x: number, z: number) => { const lx = x - ox; if (Math.abs(lx - GRAVE.x) < 1.2 && Math.abs(z - GRAVE.z) < 1.7) return null; return HILL(lx, z) + nz(x, z) * 0.6 + 0.02; };
  return { group: G, turf };
}
