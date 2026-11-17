// Background look test, outdoors (Nov 16, 2026): a sunlit valley built to the background rules in
// claude/background-and-character-look.md. A faceted cliff with strata behind the road, a rutted dirt road that bends
// away past a cabin, pines in three bands that fade with distance, boulders and bushes of every size, a signpost you
// can read, a foreground layer close to the lens, dust in the air. No ink outline on any of it.
// It stands in the west half of the kit yard: the camera is on the road near x = -12 looking toward -x.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex, planksHD, rep } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import { rockTex, dirtTex, rockWall, rockGeo, pineGeo, bushGeo, mergeFacets, dustMotes } from "../bridge/scenery";
import { groundH } from "./place";

type P2 = [number, number];
/** the cliff runs through these points (x, z); its face looks toward the road */
const CLIFF: P2[] = [[-8, 36], [-20, 31], [-36, 23.5]];
const CLIFF_H = 9, EYE: P2 = [-12, 22];
export const CABIN: [number, number] = [-47, 14.2];
/** the road's centre line: z at x */
export const roadZ = (x: number) => 22 + 0.4 * Math.sin(0.3 * x) - (x < -24 ? 0.005 * (x + 24) * (x + 24) : 0);
const gy = (x: number, z: number) => (Math.abs(x) < 36 && z > -14 && z < 36 ? 0 : groundH(x, z, false));
const segs = CLIFF.slice(1).map((b, i) => { const a = CLIFF[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), d: P2 = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], mid: P2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let n: P2 = [-d[1], d[0]]; if ((EYE[0] - mid[0]) * n[0] + (EYE[1] - mid[1]) * n[1] < 0) n = [d[1], -d[0]];
  return { L, d, n, mid, th: Math.atan2(n[0], n[1]) }; });
/** no grass here: the road, the cabin floor, under the cliff */
export const valleyClear = (x: number, z: number) => {
  if (x > -5 || x < -75 || z < 4) return false;
  if (Math.abs(z - roadZ(x)) < 1.45) return true;
  if (Math.abs(x - CABIN[0]) < 3.3 && Math.abs(z - CABIN[1]) < 2.7) return true;
  for (const s of segs) { const px = x - s.mid[0], pz = z - s.mid[1], f = px * s.n[0] + pz * s.n[1], a = px * s.d[0] + pz * s.d[1]; if (Math.abs(a) < s.L / 2 + 0.6 && f < 0.7 && f > -9) return true; }
  return false;
};

const signTex = () => ctex("vlSign", 512, 256, (g, r) => {
  g.fillStyle = "#c9a060"; g.fillRect(0, 0, 512, 256);
  for (let k = 0; k < 40; k++) { g.strokeStyle = "rgba(96,62,28,0.3)"; g.lineWidth = 1 + r() * 2.5; const y = r() * 256; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(170, y + 10 * (r() - 0.5), 340, y + 10 * (r() - 0.5), 512, y); g.stroke(); }
  g.strokeStyle = "rgba(60,36,20,0.9)"; g.lineWidth = 10; g.strokeRect(8, 8, 496, 240);
  g.fillStyle = "rgba(52,28,18,0.92)"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = '900 78px Georgia, "Times New Roman", serif'; g.fillText("PARADOX", 256, 82); g.font = '900 62px Georgia, "Times New Roman", serif'; g.fillText("TOWN  2 MI", 256, 176);
});
const shingleTex = () => ctex("vlShingle", 512, 512, (g, r) => {
  g.fillStyle = "#8a4a34"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) for (let x = (y / 64) % 2 ? -40 : 0; x < 512; x += 80) { const v = 0.82 + 0.3 * r(); g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(78 * v)},${Math.round(54 * v)})`; g.fillRect(x + 2, y + 2, 76, 60); g.fillStyle = "rgba(40,18,12,0.45)"; g.fillRect(x + 2, y + 56, 76, 6); }
});
const logTex = () => ctex("vlLog", 512, 512, (g, r) => {
  g.fillStyle = "#a9805c"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6; i++) { const y = i * 85.3, v = 0.86 + 0.24 * r(); const gr = g.createLinearGradient(0, y, 0, y + 85); gr.addColorStop(0, `rgba(255,230,190,${0.22 * v})`); gr.addColorStop(0.5, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(40,22,12,0.5)"); g.fillStyle = gr; g.fillRect(0, y, 512, 85.3);
    for (let k = 0; k < 9; k++) { g.strokeStyle = "rgba(80,50,28,0.3)"; g.lineWidth = 1 + r() * 2; const yy = y + 8 + r() * 68; g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(170, yy + 6 * (r() - 0.5), 340, yy + 6 * (r() - 0.5), 512, yy); g.stroke(); }
    for (let k = 0; k < 2; k++) { g.fillStyle = "rgba(60,36,20,0.55)"; g.beginPath(); g.ellipse(r() * 512, y + 20 + r() * 44, 9, 5, 0, 0, 6.3); g.fill(); } }
});

export type Valley = { group: THREE.Group; drift: (t: number) => void };

export function buildValley(): Valley {
  const G = new THREE.Group(); let sd = 23; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const put = (geo: THREE.BufferGeometry, mat: THREE.Material, cast = true, recv = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; G.add(m); return m; };
  const F = { vertexColors: true, flatShading: true };
  const cliffM = lam("vlCliff", () => ({ map: rockTex("vlCliffT", "#c9a57e", true), ...F })), stoneM = lam("vlStone", () => ({ map: rockTex("vlStoneT", "#b7a590"), ...F }));
  const pineM = [lam("vlPine0", () => ({ color: "#2b6638", ...F })), lam("vlPine1", () => ({ color: "#4f8870", ...F })), lam("vlPine2", () => ({ color: "#8fb4b0", ...F }))];
  const barkM = [lam("vlBark0", () => ({ color: "#6b4a30", ...F })), lam("vlBark1", () => ({ color: "#86796c", ...F })), lam("vlBark2", () => ({ color: "#a9bcbc", ...F }))];
  const aspenM = [lam("vlAspen0", () => ({ color: "#e3b93a", ...F })), lam("vlAspen1", () => ({ color: "#d9c276", ...F }))], birchM = lam("vlBirch", () => ({ color: "#e6dfcf", ...F }));
  const bushM = lam("vlBush", () => ({ color: "#33662f", ...F })), bushM2 = lam("vlBush2", () => ({ color: "#4f7631", ...F }));
  const turf = lam("k2TurfDark", () => ({ color: "#3f7a28" })), roadM = lam("vlRoad", () => ({ map: dirtTex("vlDirt", "#b28c60", true) }));
  const plank = planksHD(), woodM = lam("vlWood", () => ({ map: rep(plank, 1, 1), color: "#b08862" })), woodDark = lam("vlWoodDark", () => ({ map: rep(plank, 0.5, 0.5), color: "#7a5a3c" }));
  const M4 = (x: number, y: number, z: number, ry = 0, s = 1, sy = s) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(s, sy, s));

  // ---- the meadow beyond the yard (the kit's patchwork fields would read as farmland) ----
  { const g = new THREE.PlaneGeometry(126, 130, 25, 26); g.rotateX(-Math.PI / 2); g.translate(-98.95, 0, 20); const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, groundH(p.getX(i), p.getZ(i), false) + 0.05); g.computeVertexNormals(); put(g, turf, false); }
  // ---- the road: a ribbon with wheel ruts along it ----
  { const P: number[] = [], UV: number[] = [], I: number[] = []; let len = 0, n = 0;
    for (let x = -4; x >= -74; x -= 1, n++) { const z = roadZ(x), dz = roadZ(x - 0.5) - roadZ(x + 0.5), tl = Math.hypot(1, dz), nx = dz / tl, nz = 1 / tl, w = 1.4 + 0.12 * Math.sin(x * 0.9);
      const y = (x < -35.5 ? groundH(x, z, false) + 0.09 : 0.03); if (n) len += Math.hypot(1, roadZ(x) - roadZ(x + 1));
      P.push(x - nx * w, y, z + nz * w, x + nx * w, y, z - nz * w); UV.push(0, len / 3, 1, len / 3);
      if (n) { const a = (n - 1) * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(UV, 2)); g.setIndex(I); g.computeVertexNormals();
    const nr = g.attributes.normal as THREE.BufferAttribute; if (nr.getY(0) < 0) { g.setIndex(I.map((_, k) => I[k - (k % 3) + [0, 2, 1][k % 3]])); g.computeVertexNormals(); }
    put(g, roadM, false); }
  // ---- the cliff: faceted faces with strata, a rough top, a lower buttress in front ----
  segs.forEach((s, k) => { const grp = new THREE.Group(); grp.position.set(s.mid[0], 0, s.mid[1]); grp.rotation.y = s.th; G.add(grp);
    const ledge = (u: number, v: number) => (v < 0.28 ? 1.7 - 2.4 * v : 0.75) + 0.55 * Math.sin(u * 13 + k * 2) * Math.sin(v * 7 + k) + (v > 0.55 && v < 0.7 ? 0.5 : 0);
    const face = new THREE.Mesh(rockWall(s.L + 1.2, CLIFF_H, 1.05, 1.0, 11 + k * 7, 7, ledge), cliffM); face.castShadow = face.receiveShadow = true; grp.add(face);
    const cap = new THREE.Mesh(rockWall(s.L + 1.2, 9, 1.3, 0.5, 31 + k * 5, 7), cliffM); cap.rotation.x = -Math.PI / 2; cap.position.y = CLIFF_H - 0.05; cap.receiveShadow = true; grp.add(cap);
    if (k === 1) { const b = new THREE.Mesh(rockWall(8, 3.4, 0.8, 0.9, 51, 5, (u, v) => 0.7 + 0.8 * Math.sin(u * 3.14) * (1 - 0.5 * v)), cliffM); b.position.set(3.2, 0, 1.1); b.rotation.y = -0.14; b.castShadow = b.receiveShadow = true; grp.add(b);
      const bc = new THREE.Mesh(rockWall(8, 1.6, 0.8, 0.3, 53, 5), cliffM); bc.rotation.x = -Math.PI / 2; bc.position.set(3.2, 3.38, 1.1); bc.rotation.z = 0; bc.receiveShadow = true; grp.add(bc); } });
  // world point at `a` metres along segment k (from its middle), `f` metres in front of the face
  const at = (k: number, a: number, f: number): P2 => { const s = segs[k]; return [s.mid[0] + s.d[0] * a + s.n[0] * f, s.mid[1] + s.d[1] * a + s.n[1] * f]; };
  // ---- rocks of every size: talus at the cliff foot, blocks along its top edge, stones by the road, pebbles on it ----
  { const list: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [];
    for (let i = 0; i < 26; i++) { const k = i % 3 === 0 ? 0 : 1, s = segs[k], a = (r() - 0.5) * s.L, f = 0.9 + 2.3 * r() * r(), rad = 0.25 + 1.25 * r() * r() * (f < 1.6 ? 1 : 0.6), [x, z] = at(k, a, f); list.push({ g: rockGeo(rad, i + 3, 1, 0.7), m: M4(x, rad * 0.32, z, r() * 6) }); }
    for (let i = 0; i < 14; i++) { const k = i % 2, s = segs[k], [x, z] = at(k, (r() - 0.5) * s.L, -0.5 - 0.9 * r()), rad = 0.5 + 0.9 * r(); list.push({ g: rockGeo(rad, i + 40, 1, 0.6), m: M4(x, CLIFF_H + rad * 0.2, z, r() * 6) }); }
    for (let i = 0; i < 22; i++) { const x = -9 - 46 * r(), side = r() > 0.5 ? 1 : -1, rad = 0.12 + 0.42 * r() * r(), z = roadZ(x) + side * (1.6 + 1.6 * r()); list.push({ g: rockGeo(rad, i + 60, 0, 0.7), m: M4(x, gy(x, z) + rad * 0.3, z, r() * 6) }); }
    const m = put(mergeFacets(list), stoneM); m.name = "rocks";
    const peb: typeof list = []; for (let i = 0; i < 46; i++) { const x = -8 - 34 * r(), rad = 0.035 + 0.07 * r(), z = roadZ(x) + (r() - 0.5) * 2.4; peb.push({ g: rockGeo(rad, i + 90, 0, 0.6), m: M4(x, 0.03 + rad * 0.3, z, r() * 6), tint: 0.9 + 0.3 * r() }); }
    put(mergeFacets(peb), stoneM); }
  // ---- trees: three bands, each paler and bluer than the one in front (the far ones are faded before the fog touches them) ----
  const band = (b: number, spots: [number, number, number, number][], cast: boolean) => { const fol: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [], tr: typeof fol = [];
    spots.forEach(([x, y, z, h], i) => { const [f, t] = pineGeo(h, h * (0.2 + 0.05 * r()), i * 3 + b * 50 + 1), m = M4(x, y - 0.1, z, r() * 6), tint = 0.86 + 0.28 * r(); fol.push({ g: f, m, tint }); tr.push({ g: t, m }); });
    put(mergeFacets(fol), pineM[b], cast, false); put(mergeFacets(tr), barkM[b], cast, false); };
  { const near: [number, number, number, number][] = [];
    for (let i = 0; i < 13; i++) { const k = i % 2, s = segs[k], [x, z] = at(k, (i / 13 - 0.5) * s.L * 0.95 + r(), -1.4 - 4.5 * r()); near.push([x, CLIFF_H, z, 4.5 + 3.5 * r()]); }
    for (const [x, z, h] of [[-23.5, 17.2, 8.5], [-27.5, 15.4, 10], [-31.5, 16.8, 7.5], [-19.8, 15.0, 9], [-37, 14.6, 9.5], [-15.5, 16.2, 7.5]]) near.push([x, 0, z, h]);
    band(0, near, true);
    const mid: [number, number, number, number][] = [];
    for (let i = 0; i < 46; i++) { const x = -54 - 30 * r(), z = -12 + 44 * r(); if (Math.abs(z - roadZ(Math.max(x, -74))) < 3 || (Math.abs(x - CABIN[0]) < 6 && Math.abs(z - CABIN[1]) < 5)) continue; mid.push([x, groundH(x, z, false), z, 8 + 5 * r()]); }
    for (let i = 0; i < 10; i++) { const x = -40 - 14 * r(), z = 26 + 10 * r(); mid.push([x, gy(x, z), z, 9 + 4 * r()]); }
    band(1, mid, false);
    const far: [number, number, number, number][] = [];
    for (let i = 0; i < 90; i++) { const x = -92 - 62 * r(), z = -45 + 110 * r(); far.push([x, groundH(x, z, false), z, 10 + 7 * r()]); }
    band(2, far, false); }
  // far hills under the last band of trees, the same pale blue-green
  { const list: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [];
    for (const [x, z, rad, sy] of [[-150, -30, 46, 0.5], [-175, 30, 60, 0.55], [-140, 75, 44, 0.5], [-120, -55, 34, 0.45], [-200, -10, 70, 0.6]]) list.push({ g: rockGeo(rad, x, 2, 1), m: M4(x, -6, z, 0, 1, sy), tint: 1.04 });
    put(mergeFacets(list), lam("vlHill", () => ({ color: "#a3c2bb", ...F })), false, false); }
  // aspens: round yellow crowns on pale trunks, a few near the cabin and a few further off
  [0, 1].forEach((b) => { const crown: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [], tr: typeof crown = [];
    const spots: [number, number, number][] = b ? [[-58, 20, 5], [-62, 8, 5.5], [-66, 24, 6], [-57, 2, 5]] : [[-42.5, 11.5, 4.6], [-51.5, 12.2, 5.2], [-52.5, 22.6, 4.4], [-44, 23.6, 4.0]];
    spots.forEach(([x, z, h], i) => { const y = gy(x, z); crown.push({ g: bushGeo(h * 0.36, i + b * 9 + 70, 6), m: M4(x, y + h * 0.5, z, r() * 6), tint: 0.9 + 0.2 * r() }); const t = new THREE.CylinderGeometry(0.07, 0.11, h * 0.62, 6); t.translate(0, h * 0.31, 0); tr.push({ g: t, m: M4(x, y, z) }); });
    put(mergeFacets(crown), aspenM[b], !b, false); put(mergeFacets(tr), birchM, !b, false); });
  // bushes: at the cliff foot, by the road, round the cabin
  { const a: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [], b2: typeof a = [];
    for (let i = 0; i < 16; i++) { const k = i % 3 === 0 ? 0 : 1, s = segs[k], [x, z] = at(k, (r() - 0.5) * s.L, 1.2 + 2.2 * r()); (i % 2 ? a : b2).push({ g: bushGeo(0.35 + 0.4 * r(), i + 5, 5), m: M4(x, 0, z, r() * 6), tint: 0.88 + 0.26 * r() }); }
    for (let i = 0; i < 16; i++) { const x = -10 - 48 * r(), z = roadZ(x) - 2.6 - 3.2 * r(); (i % 2 ? a : b2).push({ g: bushGeo(0.3 + 0.45 * r(), i + 25, 5), m: M4(x, gy(x, z), z, r() * 6), tint: 0.88 + 0.26 * r() }); }
    put(mergeFacets(a), bushM); put(mergeFacets(b2), bushM2); }
  // ---- the cabin: log walls, a shingle roof, a stone chimney, a lit window, a wood pile ----
  { const C = new THREE.Group(), cy = gy(CABIN[0], CABIN[1]); C.position.set(CABIN[0], cy, CABIN[1]); C.rotation.y = 0.12; G.add(C);
    const logM = lam("vlLogs", () => ({ map: rep(logTex(), 2, 1) })), roofM = lam("vlRoof", () => ({ map: rep(shingleTex(), 3, 2), side: THREE.DoubleSide }));
    const cb = (sx: number, sy: number, sz: number, x: number, y: number, z: number, m: THREE.Material, ry = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = o.receiveShadow = true; C.add(o); return o; };
    const Wd = 5.4, Dp = 4.2, Hh = 2.5;
    cb(Wd, Hh, Dp, 0, Hh / 2, 0, logM);
    // gable ends
    for (const sx of [-1, 1]) { const sh = new THREE.Shape([new THREE.Vector2(-Dp / 2, 0), new THREE.Vector2(Dp / 2, 0), new THREE.Vector2(0, 1.5)]), g = new THREE.ShapeGeometry(sh); const o = new THREE.Mesh(g, lam("vlGable", () => ({ map: rep(logTex(), 1, 1), side: THREE.DoubleSide }))); o.rotation.y = Math.PI / 2; o.position.set(sx * (Wd / 2 - 0.005), Hh, 0); o.castShadow = o.receiveShadow = true; C.add(o);
      const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 4 + 0.5, uv.getY(i) / 3); }
    for (const sz of [-1, 1]) { const o = new THREE.Mesh(new THREE.BoxGeometry(Wd + 0.8, 0.1, 2.85), roofM); o.position.set(0, Hh + 0.72, sz * 1.2); o.rotation.x = sz * 0.62; o.castShadow = o.receiveShadow = true; C.add(o); }
    cb(0.9, 1.9, 0.08, -0.7, 0.95, Dp / 2 + 0.03, woodDark); cb(1.1, 0.12, 0.12, -0.7, 1.96, Dp / 2 + 0.05, woodM);
    const glass = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.25, 0.6) });
    for (const [x, y, z, ry] of [[1.2, 1.45, Dp / 2 + 0.04, 0], [Wd / 2 + 0.04, 1.45, 0.2, Math.PI / 2]] as [number, number, number, number][]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), glass); w.position.set(x, y, z); w.rotation.y = ry; C.add(w);
      const fr = (sx: number, sy: number, dx: number, dy: number) => { const o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, 0.07), woodDark); o.position.set(x + (ry ? 0 : dx), y + dy, z + (ry ? -dx : 0)); o.rotation.y = ry; C.add(o); };
      fr(1.0, 0.1, 0, 0.45); fr(1.0, 0.1, 0, -0.45); fr(0.1, 1.0, 0.45, 0); fr(0.1, 1.0, -0.45, 0); fr(0.06, 0.8, 0, 0); fr(0.8, 0.06, 0, 0); }
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.4, 0.8), lam("vlChimney", () => ({ map: rep(rockTex("vlStoneT", "#b7a590"), 0.5, 2) }))); ch.position.set(-1.6, 2.2, -1.2); ch.castShadow = ch.receiveShadow = true; C.add(ch);
    // porch step, wood pile, barrel
    cb(2.0, 0.16, 0.8, -0.7, 0.08, Dp / 2 + 0.45, woodM);
    for (let i = 0; i < 9; i++) { const o = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.9, 8), i % 2 ? woodM : woodDark); o.rotation.z = Math.PI / 2; o.position.set(Wd / 2 + 0.6, 0.13 + Math.floor(i / 4) * 0.25, 0.9 + (i % 4) * 0.27 + (Math.floor(i / 4) % 2) * 0.13); o.castShadow = true; C.add(o); }
    { const o = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.27, 0.9, 14), woodM); o.position.set(1.9, 0.45, Dp / 2 + 0.5); o.castShadow = true; C.add(o); } }
  // ---- by the road: a signpost you can read, a rail fence running away, a fallen log ----
  { const sx = -25, sz = roadZ(sx) + 1.75; const post = put(new THREE.BoxGeometry(0.14, 2.3, 0.14), woodDark); post.position.set(sx, 1.15, sz);
    const board = put(new THREE.BoxGeometry(0.06, 0.62, 1.3), lam("vlSignM", () => ({ map: signTex() }))); board.position.set(sx + 0.1, 1.95, sz); board.rotation.x = -0.05;
    // BoxGeometry maps the texture on its +x face with u along -z: flip so the words read left to right from the road
    for (let x = -23; x >= -39; x -= 2) { const z = roadZ(x) - 2.1, p = put(new THREE.BoxGeometry(0.13, 1.05, 0.13), woodDark); p.position.set(x, 0.52, z); p.rotation.y = r();
      if (x > -39) { const z2 = roadZ(x - 2) - 2.1, L = Math.hypot(2, z2 - z); for (const h of [0.45, 0.85]) { const rail = put(new THREE.BoxGeometry(L + 0.2, 0.09, 0.06), woodM); rail.position.set(x - 1, h + 0.03 * (r() - 0.5), (z + z2) / 2); rail.rotation.y = Math.atan2(z2 - z, 2); rail.rotation.z = 0.03 * (r() - 0.5); } } }
    const [lx, lz] = at(1, -2.5, 3.0), log = put(new THREE.CylinderGeometry(0.22, 0.26, 3.2, 10), lam("vlBarkLog", () => ({ map: rep(logTex(), 1, 0.2), color: "#8a6a4c" }))); log.rotation.z = Math.PI / 2; log.rotation.y = 0.5; log.position.set(lx, 0.22, lz); }
  // ---- foreground, close to the lens: a boulder and a bush low on the left ----
  { const list = [{ g: rockGeo(0.55, 201, 1, 0.8), m: M4(-14.1, 0.2, 22.95, 1.2) }, { g: rockGeo(0.28, 203, 1, 0.8), m: M4(-14.6, 0.1, 22.5, 0.4) }]; put(mergeFacets(list), stoneM);
    put(mergeFacets([{ g: bushGeo(0.36, 205, 6), m: M4(-14.0, 0.3, 23.15, 0.7) }]), bushM); }
  // dust and pollen drifting in the sun
  const dust = dustMotes(new THREE.Vector3(-18, 1.6, 22), new THREE.Vector3(12, 2.2, 6), 150, new THREE.Color(1.4, 1.3, 1.0), 0.022, 0.38); G.add(dust.points);
  G.traverse((o) => { o.layers.set(NOINK); });
  return { group: G, drift: dust.drift };
}

/** chimney smoke for the shot spec: soft grey puffs rising and leaning with the wind */
export const cabinSmoke = (t: number) => Array.from({ length: 7 }, (_, i) => { const u = ((t * 0.16 + i / 7) % 1), y = gy(CABIN[0], CABIN[1]) + 4.6 + 6.5 * u;
  return { p: [CABIN[0] - 1.75 - 2.6 * u * u, y, CABIN[1] - 1.0 + 0.5 * Math.sin(i * 2.1 + u * 3)] as [number, number, number], s: 0.9 + 2.8 * u, c: [0.86, 0.86, 0.9] as [number, number, number], a: 0.5 * (1 - u) * Math.min(1, u * 8) }; });
