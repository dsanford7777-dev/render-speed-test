// The Centralia Short: the five sets (place.ts says where). Built to the background rules and the production checklist:
// every post reaches the ground, nothing floats, far ground has texture, signs are whole words, every light has a
// source, trees keep clear of buildings, skies are closed.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD } from "../bridge/paint";
import { mergeFacets, pineGeo, bushGeo, dustMotes, rockGeo, rockTex, dirtTex, rockWall } from "../bridge/scenery";
import { M, T, noInk, shadowAll, glow, sheet, nz, mountain, rodGeo, houseAt, flame } from "../frozen/fsets";
import { brickTex, labelTex, wallpaperTex, panelTex, clockTex } from "../frozen/paint";
import { NOINK } from "../bridge/ink";
import { caSkyTex, signTex, repC } from "../cahaba/cpaint";
import { GAS, SET, ROAD_Z0, ROAD_Z1, WALK_Z, FRONT_Z, crackZ, HOLD, PIT_C, RX, RZ, DEPTH, SEAM, pitY, HEAP, RIM, TRUCK, TRENCH, BORE, TUN, HOUSE_Z, TREE, HOLE, HOLE_R, ROOM, DESK } from "./place";
import { graffitiTex as ctexG, asphaltTex, lineTex, crackTex, strataTex, coalTex, emberTex, ceSkyTex, snowGrassTex } from "./cepaint";

const M4 = (x: number, y: number, z: number, ry = 0, s = 1) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(s, s, s));
type Fol = { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[];
const B = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) => boxGeo(V(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)), V(Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)), tile);
/** a sky all the way round with a lid in its top colour (checklist: skies are closed) */
const skyPl = (G: THREE.Object3D, tex: THREE.Texture, top: string, x: number, z: number, r: number, h: number, y0: number) => {
  const tx = tex.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(4, 1); tx.needsUpdate = true;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64, 1, true), new THREE.MeshBasicMaterial({ map: tx, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.position.set(x, y0 + h / 2, z); m.layers.set(NOINK); m.renderOrder = -6;
  const lid = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(top), fog: false, depthWrite: false, side: THREE.DoubleSide }));
  lid.rotation.x = Math.PI / 2; lid.position.y = h / 2 - 0.5; lid.renderOrder = -5; lid.layers.set(NOINK); m.add(lid); G.add(m); return m; };
/** leafy trees and pines (summer) or bare trees (winter) at spots [x, y, z, scale] */
const trees = (G: THREE.Object3D, spots: [number, number, number, number][], key: string, bare = false) => {
  const fol: Fol = [], bark: Fol = [];
  spots.forEach(([x, y, z, s], i) => {
    if (i % 3 === 0 && !bare) { const [f, t] = pineGeo(12 * s, 3.2 * s, i + 3); fol.push({ g: f, m: M4(x, y - 0.2, z, i), tint: 0.85 + 0.2 * ((i * 3) % 4) / 4 }); bark.push({ g: t, m: M4(x, y - 0.2, z, i) }); return; }
    const t = new THREE.CylinderGeometry(0.24 * s, 0.42 * s, 5 * s, 7); t.translate(0, 2.4 * s, 0); bark.push({ g: t, m: M4(x, y - 0.2, z, i) });
    if (bare) { for (let k = 0; k < 6; k++) { const a = k * 1.05 + i, up = 3.2 + (k % 3) * 0.7, len = 2.2 + (k % 2) * 0.9; bark.push({ g: rodGeo(V(0, up * s, 0), V(Math.cos(a) * len * s, (up + 1.6 + (k % 2)) * s, Math.sin(a) * len * s), 0.09 * s), m: M4(x, y, z, 0) }); } return; }
    for (let k = 0; k < 3; k++) fol.push({ g: bushGeo(2.4 * s, i * 7 + k, 4), m: M4(x + (k - 1) * 1.5 * s, y + (4.0 + (k % 2) * 1.3) * s, z + ((k * 5) % 3 - 1) * 1.1 * s, i + k), tint: 0.82 + 0.25 * ((i + k) % 3) / 2 });
    fol.push({ g: bushGeo(3.0 * s, i * 3 + 1, 5), m: M4(x, y + 6.0 * s, z, i), tint: 0.95 }); });
  if (fol.length) { const a = new THREE.Mesh(mergeFacets(fol), lam("ceFol" + key, () => ({ color: "#4a6a32", vertexColors: true, flatShading: true }))); shadowAll(a); G.add(a); }
  const b = new THREE.Mesh(mergeFacets(bark), lam("ceBark" + key, () => ({ color: "#4a3c30", vertexColors: true, flatShading: true }))); shadowAll(b); G.add(b); };
/** a painted sign facing -z (toward the cameras): whole words */
const sign = (G: THREE.Object3D, text: string, x: number, y: number, z: number, w: number, h: number, bg = "#f2ecdc", fg = "#1a1a2a", ry = Math.PI) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: signTex(text, bg, fg, 1024, Math.round(1024 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; G.add(m); return m; };
const rng = (seed: number) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

// =====================================================================================================================
export type TownSet = { group: THREE.Group; old: THREE.Group; now: THREE.Group; crack: THREE.Group; condemned: THREE.Group; van: THREE.Group; lot: THREE.Mesh;
  skies: { day: THREE.Mesh; haze: THREE.Mesh }; turf: (x: number, z: number) => number | null; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildTown(): TownSet {
  const G = new THREE.Group(), ox = SET.town[0], b = new Batch(), bo = new Batch(), old = new THREE.Group(), now = new THREE.Group(), crack = new THREE.Group(), condemned = new THREE.Group(); G.add(old, now, crack, condemned);
  const concrete = lam("ceWalk", () => ({ map: repC(dirtTex("ceWalkT", "#a8a49a"), 2, 2) })), dark = M("ceTownDark", "#2e2a2a"), wood = lam("ceTownWood", () => ({ map: planksHD(), color: "#7a6a58" }));
  // ground: grass lots everywhere off the road (grass tufts drawn near the camera), the road and sidewalks on top
  const gy = (x: number, z: number) => 0.04 * Math.sin(x * 0.7 + z * 0.4) + (z > 40 ? (z - 40) * 0.22 : 0);
  { const g = sheet(ox - 110, ox + 110, -70, 90, 110, 80, gy, 4), m = new THREE.Mesh(g, lam("ceLotM", () => ({ map: dirtTex("ceLotT", "#4a6a2e"), color: "#7a9a5a" }))); m.receiveShadow = true; G.add(m); }
  { const g = new THREE.PlaneGeometry(220, ROAD_Z1 - ROAD_Z0, 1, 1); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 55, uv.getY(i) * 2);
    const road = new THREE.Mesh(g, lam("ceRoadM", () => ({ map: repC(asphaltTex(), 1, 1) }))); road.position.set(ox, 0.06, (ROAD_Z0 + ROAD_Z1) / 2); road.receiveShadow = true; G.add(road);
    const lg = new THREE.PlaneGeometry(220, 0.16); lg.rotateX(-Math.PI / 2); const luv = lg.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < luv.count; i++) luv.setX(i, luv.getX(i) * 70);
    const lt = lineTex(); lt.wrapS = THREE.RepeatWrapping; const ln = new THREE.Mesh(lg, new THREE.MeshLambertMaterial({ map: lt, transparent: true, alphaTest: 0.3 })); ln.position.set(ox, 0.075, 0.3); ln.receiveShadow = true; G.add(ln); }
  for (const [z0, z1] of [[ROAD_Z1, WALK_Z + 1.6], [ROAD_Z0 - 1.6, ROAD_Z0]]) b.add(B(ox - 110, 0, z0, ox + 110, 0.14, z1, 3), concrete);
  // the brick block (1962): the borough sign, the post office with its ZIP code, a door and two windows
  { const brick = lam("ceBrickM", () => ({ map: repC(brickTex("ceBrick", ["#8a4a3a", "#7a4034", "#96564a", "#6e3a30"], "#4a3a34", 0.5), 3, 1.2) })), stone = M("ceStone", "#b8b0a0");
    bo.add(B(ox - 9, 0, FRONT_Z, ox + 9, 7.4, FRONT_Z + 8, 0), brick); bo.add(B(ox - 9.3, 7.4, FRONT_Z - 0.25, ox + 9.3, 7.8, FRONT_Z + 8.3), stone);
    sign(old, "BOROUGH OF CENTRALIA", ox + 4.2, 5.9, FRONT_Z - 0.03, 7.6, 1.0, "#1e2a3a", "#e9c876");
    sign(old, "U.S. POST OFFICE", ox - 4.6, 5.9, FRONT_Z - 0.03, 6.8, 1.0, "#f2ecdc", "#1e2a4a");
    sign(old, "CENTRALIA, PA 17927", ox - 4.6, 3.55, FRONT_Z - 0.04, 3.6, 0.62, "#1e2a4a", "#f2ecdc");
    for (const x of [-6.8, -2.4, 2.4, 6.4]) { const fr = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.0), stone); fr.rotation.y = Math.PI; fr.position.set(ox + x, 2.0 + (x === -2.4 ? -0.2 : 0), FRONT_Z - 0.01); old.add(fr);
      const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.75), M(x === -2.4 ? "ceDoorM" : "ceWinM", x === -2.4 ? "#3a2a22" : "#3a4a5a")); wn.rotation.y = Math.PI; wn.position.set(ox + x, 1.95 + (x === -2.4 ? -0.15 : 0), FRONT_Z - 0.02); old.add(wn); }
    for (const x of [-6.8, 2.4, 6.4]) for (const [w, h] of [[1.55, 0.06], [0.06, 1.75]]) { const mu = new THREE.Mesh(new THREE.PlaneGeometry(w, h), dark); mu.rotation.y = Math.PI; mu.position.set(ox + x, 1.95, FRONT_Z - 0.03); old.add(mu); }
    for (let k = 0; k < 4; k++) { const w2 = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.4), M("ceWinM", "#3a4a5a")); w2.rotation.y = Math.PI; w2.position.set(ox - 6.8 + k * 4.4, 4.0 + (k === 0 ? 10 : 0), FRONT_Z - 0.02); if (k) old.add(w2); }
    // a mailbox and a bench on the sidewalk
    bo.add(B(ox - 7.9, 0.14, 5.1, ox - 7.4, 1.1, 5.6), M("ceMailbox", "#2a4a7a")); bo.add(B(ox - 7.95, 1.1, 5.05, ox - 7.35, 1.2, 5.65), M("ceMailbox", "#2a4a7a"));
    bo.add(B(ox + 1.0, 0.55, 5.6, ox + 2.8, 0.62, 6.0), wood); for (const x of [1.1, 2.7]) bo.add(B(ox + x - 0.04, 0.14, 5.65, ox + x + 0.04, 0.55, 5.95), dark); }
  // the frame houses along the street (1962); the two holdouts stand in both
  const houses: [number, number, string, number][] = [];
  for (const sgn of [1, -1]) for (let k = 0; k < 6; k++) { const x = sgn * (14 + k * 8.5); if (HOLD.some((h) => Math.abs(h.x - x) < 4) || Math.abs(x - GAS.x) < 4) continue; houses.push([x, 11 + (k % 2) * 0.6, ["#c9c2b0", "#9ab0b8", "#d8c89a", "#b8a090", "#a8b89a", "#e0d8c8"][(k + (sgn > 0 ? 0 : 3)) % 6], 0.03 * (k % 3 - 1)]); }
  for (const [x, z, col, yaw] of houses) { const h = houseAt(b, old, ox + x, z, 6.2, 7, 5.6, col, "#4a4038", false, yaw, 0); h.traverse((m) => { m.castShadow = true; }); }
  for (const [x, z, col] of [[-12, -16, "#b8a890"], [6, -17, "#c9c2b0"], [22, -16, "#9ab0b8"], [-26, -17, "#d8c89a"]] as [number, number, string][]) houseAt(b, old, ox + x, z, 6.2, 7, 5.6, col, "#4a4038", false, Math.PI, 0);
  HOLD.forEach((hh, i) => { const g = houseAt(b, G, ox + hh.x, hh.z, 6.4, 7, 5.8, i ? "#e0d8c8" : "#c9b89a", "#3a3438", false, 0, 0); void g;
    // a porch with posts to the ground and steps (the holdouts sit out here)
    b.add(B(ox + hh.x - 3.2, 0, hh.z - 5.4, ox + hh.x + 3.2, 0.45, hh.z - 3.5), wood); b.add(B(ox + hh.x - 3.3, 2.9, hh.z - 5.5, ox + hh.x + 3.3, 3.05, hh.z - 3.4), M("ceRoofP", "#3a3438"));
    for (const dx of [-3.0, 3.0]) b.add(B(ox + hh.x + dx - 0.08, 0, hh.z - 5.4, ox + hh.x + dx + 0.08, 2.9, hh.z - 5.24), M("cePost", "#e9e2d2"));
    b.add(B(ox + hh.x - 0.7, 0, hh.z - 5.9, ox + hh.x + 0.7, 0.22, hh.z - 5.4), wood); });
  // condemned notices on the doors (the state took the houses)
  for (const [x, z] of houses.slice(0, 8).map(([x, z]) => [x, z] as [number, number])) { const n = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.8), lam("ceCondemn", () => ({ map: labelTex("CONDEMNED|COMMONWEALTH|OF PENNA.", "#f2ecdc", "rgba(170,30,24,0.95)", 1) }))); n.rotation.y = Math.PI; n.position.set(ox + x + 0.31, 1.15, z - 3.5 - 0.03); condemned.add(n); }
  // the moving van (the buyout): a box truck by the kerb, its back open
  const van = new THREE.Group(); { const body = lam("ceVanM", () => ({ map: signTex("MOVING", "#e9e2cc", "#2a4a7a", 1024, 400) })), cab = M("ceVanCab", "#2a4a7a"), tyre = M("ceTyre", "#1a1a1e"), chrome = M("ceChrome", "#c9ccd2");
    van.add(new THREE.Mesh(B(-3.2, 0.7, -1.2, 1.6, 3.4, 1.2), body)); van.add(new THREE.Mesh(B(1.6, 0.7, -1.15, 3.6, 2.5, 1.15), cab)); van.add(new THREE.Mesh(B(2.2, 1.6, -1.16, 3.4, 2.3, 1.16), M("ceVanGlass", "#5a6a7a")));
    van.add(new THREE.Mesh(B(3.55, 0.6, -1.1, 3.75, 0.95, 1.1), chrome));
    for (const x of [-2.2, 0.0, 2.7]) for (const z of [-1.05, 1.05]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16).rotateX(Math.PI / 2), tyre); w.position.set(x, 0.5, z); van.add(w); }
    const ramp = new THREE.Mesh(B(-5.2, 0, -0.7, -3.2, 0.06, 0.7), wood); ramp.rotation.z = -0.33; ramp.position.y = 0.35; van.add(ramp);
    for (let k = 0; k < 5; k++) { const bx = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), lam("ceBox" + (k % 2), () => ({ map: labelTex(k % 2 ? "KITCHEN" : "BOOKS", "#b9a27a", "rgba(30,20,20,0.9)", 1) }))); bx.position.set(-2.6 + (k % 3) * 0.7, 0.95 + Math.floor(k / 3) * 0.5, -0.3 + (k % 2) * 0.5); van.add(bx); }
    van.position.set(ox - 14, 0, 2.2); van.rotation.y = Math.PI; shadowAll(van); old.add(van); }
  // John Coddington's gas station (1962-79): a small cinder-block office, a canopy on two posts, two pumps on an island, the
  // fill caps of the underground tanks in the apron
  { const block = M("ceGasBlock", "#e9e2cf"), trim = M("ceGasTrim", "#2a6a3a"), pump = M("ceGasPump", "#c0392b"), apron = lam("ceApron", () => ({ map: repC(dirtTex("ceApronT", "#9a968c"), 2, 2) })), x = ox + GAS.x;
    bo.add(B(x - 9, 0.14, 5.75, x + 9, 0.16, 15), apron); bo.add(B(x - 4, 0, 11, x + 4, 3.4, 16), block); bo.add(B(x - 4.2, 3.4, 10.8, x + 4.2, 3.8, 16.2), trim);
    bo.add(B(x - 5, 3.6, 6.2, x + 5, 3.9, 10.8), trim); for (const dx of [-4.6, 4.6]) bo.add(B(x + dx - 0.12, 0.14, 7.0, x + dx + 0.12, 3.6, 7.24), M("ceGasPost", "#e9e2cf"));
    bo.add(B(x - 2.4, 0.14, 7.2, x + 2.4, 0.34, 8.0), M("ceIsland", "#c9c2b0"));
    for (const dx of [-1.2, 1.2]) { bo.add(B(x + dx - 0.35, 0.34, 7.4, x + dx + 0.35, 1.8, 7.8), pump); bo.add(new THREE.SphereGeometry(0.28, 12, 8).translate(x + dx, 2.05, 7.6), M("ceGlobe", "#f6f2e8")); }
    sign(old, "CODDINGTON'S", x, 2.6, 10.97, 4.6, 0.7, "#2a6a3a", "#f6f2e8"); sign(old, "GAS", x, 3.75, 6.18, 1.6, 0.42, "#2a6a3a", "#f6f2e8");
    for (let k = 0; k < 4; k++) bo.add(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 14).translate(x - 3.4 + k * 0.9, 0.18, 9.4), M("ceFillCap", "#3a3a40"));
    { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.1), M("ceGasDoor", "#3a4a5a")); d.rotation.y = Math.PI; d.position.set(x + 1.8, 1.19, 10.98); old.add(d); const w = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), M("ceWinM", "#3a4a5a")); w.rotation.y = Math.PI; w.position.set(x - 1.6, 1.6, 10.98); old.add(w); } }
  // telegraph poles, the hill, a church on the hill (both times)
  for (const x of [-34, -24, 27, 44, 60, -50]) { b.add(new THREE.CylinderGeometry(0.11, 0.15, 9, 7).translate(ox + x, 4.5, 5.9), dark); b.add(B(ox + x - 0.9, 8.3, 5.85, ox + x + 0.9, 8.42, 5.95), dark); }
  { const ch = lam("ceChurch", () => ({ map: planksHD(), color: "#ecebe4" })), x = ox - 6, z = 74, y = gy(-6, 74); b.add(B(x - 4, y - 1, z, x + 4, y + 6, z + 10), ch); b.add(B(x - 1.4, y + 6, z - 0.4, x + 1.4, y + 10, z + 2.4), ch);
    for (const wx of [-2.6, 2.6]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.0), M("ceChWin", "#3a4a6a")); w.rotation.y = Math.PI; w.position.set(x + wx, y + 2.8, z - 0.02); G.add(w); }
    { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.4), M("ceChDoor", "#5a3a2a")); d.rotation.y = Math.PI; d.position.set(x, y + 1.2, z - 0.42); G.add(d); const r = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-4.4, 0), new THREE.Vector2(0, 3.2), new THREE.Vector2(4.4, 0)])), M("ceChRoof", "#5a5a64")); r.rotation.y = Math.PI; r.position.set(x, y + 6, z - 0.03); G.add(r); }
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 10), M("ceDome", "#6a8ab0")); dome.scale.y = 1.25; dome.position.set(x, y + 11.1, z + 1); G.add(dome); b.add(B(x - 0.08, y + 12.6, z + 0.92, x + 0.08, y + 14, z + 1.08), M("ceGold", "#d9b85a")); b.add(B(x - 0.5, y + 13.4, z + 0.92, x + 0.5, y + 13.55, z + 1.08), M("ceGold", "#d9b85a")); }
  trees(G, [[ox - 40, gy(-40, 30), 30, 1.1], [ox + 46, gy(46, 32), 30, 1.0], [ox + 4, gy(4, 34), 34, 1.15], [ox - 64, gy(-64, 24), 24, 1.0], [ox + 70, gy(70, 22), 22, 1.1], [ox + 30, gy(30, 52), 52, 1.2], [ox - 34, gy(-34, 56), 56, 1.1], [ox + 60, -30, -30, 1], [ox - 58, -32, -32, 1.1]].map(([x, y, z, s]) => [x, y, z, s] as [number, number, number, number]), "T");
  mountain(G, "ceTownHill", ox, -2, 130, 520, 52, 61, 0.6, 0.0, "#5a6a48");
  b.build(G, true); bo.build(old, true);
  // the crack across the road (today): a strip that follows crackZ, hot inside; asphalt chunks heaved at its lips
  { const n = 40, g = new THREE.PlaneGeometry(26, 2.6, n, 1); g.rotateX(-Math.PI / 2); const p = g.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + crackZ(p.getX(i)));
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: crackTex(true), transparent: true, alphaTest: 0.2, emissive: new THREE.Color(0.9, 0.35, 0.08), emissiveMap: crackTex(true) })); m.position.set(ox, 0.085, 0); m.receiveShadow = true; crack.add(m);
    const rk: Fol = []; for (let i = 0; i < 26; i++) { const x = -12 + i, s = i % 2 ? 1 : -1; rk.push({ g: rockGeo(0.28 + 0.1 * (i % 3), i + 4, 0, 0.45), m: new THREE.Matrix4().compose(V(ox + x, 0.1, crackZ(x) + s * (0.62 + 0.15 * (i % 3))), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3 * s, i, 0)), V(1.3, 0.5, 0.9)) }); }
    const cm = new THREE.Mesh(mergeFacets(rk), lam("ceChunk", () => ({ map: asphaltTex(true), vertexColors: true, flatShading: true }))); shadowAll(cm); crack.add(cm); }
  { const gt = ctexG(); const g = new THREE.PlaneGeometry(30, 7.6); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: gt, transparent: true, alphaTest: 0.1 })); m.position.set(ox + 31, 0.08, 0); m.receiveShadow = true; now.add(m); }
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), lam("ceLotPatch", () => ({ map: dirtTex("ceLotT", "#4a6a2e"), color: "#7a9a5a" }))); lot.rotation.x = -Math.PI / 2; lot.position.set(ox, 0.16, FRONT_Z + 4); now.add(lot);
  const skies = { day: skyPl(G, caSkyTex("day"), "#5f95cf", ox, 0, 600, 420, -60), haze: skyPl(G, ceSkyTex("haze"), "#7aa0c8", ox, 0, 600, 420, -60) };
  const dust = dustMotes(V(ox, 1.6, 0), V(16, 3, 10), 160, new THREE.Color(1, 0.96, 0.9), 0.03, 0.4); G.add(dust.points);
  noInk(G);
  const turf = (x: number, z: number) => { const lx = x - ox; if (z > ROAD_Z0 - 1.7 && z < WALK_Z + 1.7) return null; if (Math.abs(lx) < 10 && z > FRONT_Z - 0.3 && z < FRONT_Z + 8.4) return null; for (const h of HOLD) if (Math.abs(lx - h.x) < 3.6 && z > h.z - 6 && z < h.z + 3.8) return null; return gy(lx, z); };
  return { group: G, old, now, crack, condemned, van, lot, skies, turf, dust, drift: (t) => dust.drift(t) };
}

// =====================================================================================================================
export type PitSet = { group: THREE.Group; seam: THREE.Mesh[]; fire: THREE.PointLight; heapGlow: THREE.Mesh; stream: THREE.Mesh; streamT: THREE.Texture; skies: { day: THREE.Mesh; dusk: THREE.Mesh }; turf: (x: number, z: number) => number | null; drift: (t: number) => void };
export const pitGround = (x: number, z: number) => { const lx = x - SET.pit[0]; let y = pitY(lx, z) + 0.6 * nz(lx * 0.7, z * 0.7);
  if (Math.abs(lx - TRENCH[0]) < 11 && Math.abs(z - TRENCH[2]) < 1.0) y -= 2.2 * Math.min(1, (1.0 - Math.abs(z - TRENCH[2])) * 3) * Math.min(1, (11 - Math.abs(lx - TRENCH[0])) * 2);
  return y; };
export function buildPit(): PitSet {
  const G = new THREE.Group(), ox = SET.pit[0], b = new Batch();
  // the ground: grass round the rim, the pit's walls in layers, the coal seam a black band, the floor dirt
  { const g = sheet(ox - 90, ox + 90, -50, 90, 180, 140, pitGround, 6), p = g.attributes.position as THREE.BufferAttribute, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), wall = y < -0.4 && y > -DEPTH + 0.4, seam = y > SEAM[0] && y < SEAM[1], floor = y <= -DEPTH + 0.4;
      const c = seam ? [0.16, 0.15, 0.17] : wall ? [0.95 + 0.1 * Math.sin(y * 3), 0.88 + 0.08 * Math.sin(y * 3), 0.8] : floor ? [0.7, 0.62, 0.52] : [0.72, 0.86, 0.6]; col.set(c, i * 3); }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, lam("cePitGround", () => ({ map: strataTex(), vertexColors: true }))); m.receiveShadow = true; G.add(m); }
  // the seam can glow: 56 strips round the pit wall at the seam's height, lit in order from the heap outward
  const seam: THREE.Mesh[] = [], emb = emberTex(); emb.wrapS = THREE.RepeatWrapping;
  for (let i = 0; i < 56; i++) { const a0 = (i / 56) * 6.283, a1 = ((i + 1) / 56) * 6.283, pts: THREE.Vector3[] = [];
    for (const a of [a0, a1]) { // find the wall radius where the ground crosses the seam's middle
      let r = 0.62; for (let k = 0; k < 40; k++) { const rr = 0.62 + k * 0.01, x = PIT_C[0] + Math.cos(a) * RX * rr, z = PIT_C[2] + Math.sin(a) * RZ * rr; if (pitY(x, z) > (SEAM[0] + SEAM[1]) / 2) { r = rr; break; } }
      for (const y of [SEAM[0] + 0.15, SEAM[1] - 0.15]) { const rr = r + (y - (SEAM[0] + SEAM[1]) / 2) * 0.012, x = PIT_C[0] + Math.cos(a) * RX * rr * 0.985, z = PIT_C[2] + Math.sin(a) * RZ * rr * 0.985; pts.push(V(ox + x, y + 0.04, z)); } }
    const g = new THREE.BufferGeometry().setFromPoints([pts[0], pts[1], pts[3], pts[0], pts[3], pts[2]]); g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0], 2)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: emb, transparent: true, opacity: 0, side: THREE.DoubleSide, color: new THREE.Color(1.6, 1.1, 0.8), depthWrite: false })); m.layers.set(NOINK); m.visible = false; G.add(m); seam.push(m); }
  // the rubbish heap: crates, cans, tyres, a mattress, an old stove, papers
  { const r = rng(77), card = lam("ceCard", () => ({ map: labelTex("", "#a8834e", "#a8834e", 1) })), can = M("ceCan", "#8a8e96"), tyre = M("ceTyre2", "#1e1e22"), mat = lam("ceMatt", () => ({ map: labelTex("", "#d9c8b0", "#d9c8b0", 1) })), rust = M("ceRust", "#8a4a2a"), paperM = M("cePaperHeap", "#e9e2cf");
    const hp = (x: number, z: number) => Math.max(0, 1.1 * (1 - Math.hypot(x, z) / 4.2));
    for (let i = 0; i < 170; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 4.2, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.8, y = HEAP[1] + hp(x, z), k = i % 6, yaw = r() * 3;
      const m4 = new THREE.Matrix4().compose(V(ox + HEAP[0] + x, y, HEAP[2] + z), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.8, yaw, (r() - 0.5) * 0.8)), V(1, 1, 1));
      if (k === 0) b.add(new THREE.BoxGeometry(0.6 + r() * 0.4, 0.4 + r() * 0.3, 0.5), card, m4);
      else if (k === 1) b.add(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8), can, m4);
      else if (k === 2) b.add(new THREE.TorusGeometry(0.34, 0.13, 6, 12), tyre, m4);
      else if (k === 3) b.add(new THREE.BoxGeometry(0.9, 0.08, 0.6), paperM, m4);
      else if (k === 4 && i % 18 === 4) b.add(new THREE.BoxGeometry(1.6, 0.25, 1.0), mat, m4);
      else b.add(new THREE.BoxGeometry(0.35, 0.35, 0.35), rust, m4); }
    const mound = new THREE.Mesh(new THREE.SphereGeometry(4.2, 18, 10, 0, 6.283, 0, Math.PI / 2), lam("ceMound", () => ({ map: dirtTex("ceMoundT", "#5a4a3a") }))); mound.scale.set(1, 0.26, 0.8); mound.position.set(ox + HEAP[0], HEAP[1] - 0.05, HEAP[2]); mound.receiveShadow = true; G.add(mound); }
  const heapGlow = new THREE.Mesh(new THREE.SphereGeometry(4.0, 18, 10, 0, 6.283, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ map: emb, transparent: true, opacity: 0, color: new THREE.Color(1.4, 1.0, 0.8), depthWrite: false })); heapGlow.scale.set(1, 0.28, 0.82); heapGlow.position.set(ox + HEAP[0], HEAP[1] + 0.02, HEAP[2]); heapGlow.layers.set(NOINK); heapGlow.visible = false; G.add(heapGlow);
  const fire = new THREE.PointLight("#ff8a3a", 0, 40, 1.4); fire.position.set(ox + HEAP[0], HEAP[1] + 2.5, HEAP[2] - 1); G.add(fire);
  // the fire company's truck on the near rim: red, a cab, a ladder, a hose reel; the company's name on the door
  { const red = M("ceRed", "#b3262b"), chrome = M("ceChrome2", "#c9ccd2"), tyre = M("ceTyre3", "#1a1a1e"), glass = M("ceGlass", "#5a6a7a"), [tx, , tz] = TRUCK, ty = pitGround(ox + tx, tz);
    const g = new THREE.Group(); g.add(new THREE.Mesh(B(-3.4, 0.7, -1.15, 1.4, 2.2, 1.15), red)); g.add(new THREE.Mesh(B(1.4, 0.7, -1.1, 3.4, 2.5, 1.1), red)); g.add(new THREE.Mesh(B(1.9, 1.7, -1.12, 3.1, 2.35, 1.12), glass)); g.add(new THREE.Mesh(B(3.38, 0.55, -1.05, 3.6, 0.9, 1.05), chrome));
    for (const z of [-0.5, 0.5]) g.add(new THREE.Mesh(B(-3.2, 2.35 + 0 * z, z - 0.06, 1.2, 2.45, z + 0.06), chrome)); for (let k = 0; k < 9; k++) g.add(new THREE.Mesh(B(-3.1 + k * 0.5, 2.36, -0.5, -3.05 + k * 0.5, 2.42, 0.5), chrome));
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.9, 16).rotateX(Math.PI / 2).translate(-1.6, 2.7, 0), M("ceHoseReel", "#5a4a3a")));
    for (const x of [-2.4, 2.4]) for (const z of [-1.05, 1.05]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.32, 16).rotateX(Math.PI / 2), tyre); w.position.set(x, 0.55, z); g.add(w); }
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), lam("ceFireCo", () => ({ map: signTex("CENTRALIA|FIRE CO.", "#b3262b", "#f2e2a0", 1024, 280) }))); nm.position.set(-1.0, 1.45, -1.16); nm.rotation.y = Math.PI; g.add(nm);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.3, 0.2) })); lamp.position.set(2.6, 2.62, 0); g.add(lamp);
    g.position.set(ox + tx, ty, tz); g.rotation.y = 0.12; shadowAll(g); G.add(g); }
  // the cemetery beyond the far rim: grey stones in rows, an iron fence, its name
  { const stone = lam("ceStoneG", () => ({ map: rockTex("ceStoneT", "#9a9690") })), iron = M("ceIron", "#2a2a2e"), z0 = PIT_C[2] + RZ + 5;
    for (let row = 0; row < 4; row++) for (let k = 0; k < 9; k++) { const x = -14 + k * 3.4 + (row % 2) * 1.2, z = z0 + 2 + row * 2.6, y = pitGround(ox + x, z), h = 0.7 + ((k * 7 + row) % 3) * 0.25; b.add(B(ox + x - 0.32, y - 0.2, z - 0.1, ox + x + 0.32, y + h, z + 0.1), stone); if ((k + row) % 3 === 0) b.add(B(ox + x - 0.05, y + h, z - 0.05, ox + x + 0.05, y + h + 0.5, z + 0.05), stone); }
    for (let k = 0; k <= 34; k++) { const x = -17 + k, y = pitGround(ox + x, z0); b.add(B(ox + x - 0.025, y - 0.1, z0 - 0.025, ox + x + 0.025, y + 1.2, z0 + 0.025), iron); }
    for (const y of [0.4, 1.05]) for (let k = 0; k < 34; k++) { const x = -17 + k, ya = pitGround(ox + x, z0) + y; b.add(B(ox + x, ya, z0 - 0.03, ox + x + 1, ya + 0.05, z0 + 0.03), iron); }
    sign(G, "ODD FELLOWS CEMETERY", ox + 2, pitGround(ox + 2, z0) + 2.2, z0 - 0.06, 4.8, 0.7, "#2a2a2e", "#e9e2cf");
    b.add(B(ox - 0.6, pitGround(ox, z0) - 0.1, z0 - 0.05, ox - 0.45, pitGround(ox, z0) + 2.6, z0 + 0.05), iron); b.add(B(ox + 4.45, pitGround(ox + 4.5, z0) - 0.1, z0 - 0.05, ox + 4.6, pitGround(ox + 4.5, z0) + 2.6, z0 + 0.05), iron); }
  // the trench (later years): dirt heaped along both sides; the borehole: a steel casing, a pipe and a hose feeding it
  { const dirt = lam("ceSpoil", () => ({ map: dirtTex("ceSpoilT", "#6a5440"), vertexColors: true, flatShading: true })), rk: Fol = [];
    for (let i = 0; i < 24; i++) { const x = TRENCH[0] - 10.5 + i * 0.9, s = i % 2 ? 1.6 : -1.6; rk.push({ g: rockGeo(0.7 + 0.25 * (i % 3), i + 30, 1, 0.5), m: new THREE.Matrix4().compose(V(ox + x, pitGround(ox + x, TRENCH[2] + s) - 0.1, TRENCH[2] + s), new THREE.Quaternion(), V(1.4, 0.7, 1.0)) }); }
    const sp = new THREE.Mesh(mergeFacets(rk), dirt); shadowAll(sp); G.add(sp);
    const steel = M("ceSteel", "#6a6e76"), y0 = pitGround(ox + BORE[0], BORE[2]);
    b.add(new THREE.CylinderGeometry(0.45, 0.45, 1.1, 18, 1, true).translate(ox + BORE[0], y0 + 0.5, BORE[2]), steel); b.add(new THREE.CircleGeometry(0.44, 18).rotateX(-Math.PI / 2).translate(ox + BORE[0], y0 + 0.8, BORE[2]), M("ceBoreDark", "#0e0c0e"));
    b.add(new THREE.TorusGeometry(0.46, 0.06, 6, 18).rotateX(Math.PI / 2).translate(ox + BORE[0], y0 + 1.05, BORE[2]), steel);
    // the hose from the water truck, ending in a nozzle over the casing (on a post, so it is held, not floating)
    b.add(rodGeo(V(ox + BORE[0] + 6, y0 + 0.2, BORE[2] + 3), V(ox + BORE[0] + 0.9, y0 + 0.2, BORE[2] + 0.6), 0.07), M("ceHose", "#8a3a2a")); b.add(rodGeo(V(ox + BORE[0] + 0.9, y0 + 0.2, BORE[2] + 0.6), V(ox + BORE[0] + 0.5, y0 + 2.2, BORE[2] + 0.2), 0.07), M("ceHose", "#8a3a2a"));
    b.add(B(ox + BORE[0] + 0.85, y0 - 0.2, BORE[2] + 0.5, ox + BORE[0] + 1.0, y0 + 2.3, BORE[2] + 0.65), M("cePost2", "#7a5c40"));
    b.add(rodGeo(V(ox + BORE[0] + 0.5, y0 + 2.2, BORE[2] + 0.2), V(ox + BORE[0] + 0.15, y0 + 2.15, BORE[2] + 0.05), 0.06), M("ceBrass", "#c9a23a")); }
  const streamT = new THREE.CanvasTexture((() => { const c = document.createElement("canvas"); c.width = 128; c.height = 256; const g = c.getContext("2d")!; g.fillStyle = "rgb(170,206,236)"; g.fillRect(0, 0, 128, 256); g.filter = "blur(5px)";
    for (let i = 0; i < 46; i++) { const x = (i * 37) % 128, y = (i * 71) % 256; g.fillStyle = i % 3 ? "rgba(255,255,255,0.55)" : "rgba(110,150,190,0.45)"; g.beginPath(); g.ellipse(x, y, 5 + (i % 4) * 2, 30 + (i % 5) * 10, 0, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(x, y + 256, 5, 30, 0, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(x, y - 256, 5, 30, 0, 0, 6.3); g.fill(); } return c; })());
  streamT.wrapS = streamT.wrapT = THREE.RepeatWrapping;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 1.4, 12, 1, true), new THREE.MeshBasicMaterial({ map: streamT, transparent: true, opacity: 0.95 }));
  { const y0 = pitGround(ox + BORE[0], BORE[2]); stream.position.set(ox + BORE[0] + 0.1, y0 + 1.45, BORE[2] - 0.02); } stream.layers.set(NOINK); stream.visible = false; G.add(stream);
  // the woods round the dump, a hill; trees clear of the pit, the truck, the cemetery and the trench
  const spots: [number, number, number, number][] = [];
  for (let i = 0; i < 26; i++) { const a = (i / 26) * 6.283 + 0.13 * Math.sin(i * 3), r = 1.65 + 0.35 * ((i * 7) % 5) / 5, x = PIT_C[0] + Math.cos(a) * RX * r, z = PIT_C[2] + Math.sin(a) * RZ * r;
    if (z < RIM[2] + 2 || (z > PIT_C[2] + RZ + 3 && z < PIT_C[2] + RZ + 15 && Math.abs(x) < 19) || Math.hypot(x - TRUCK[0], z - TRUCK[2]) < 7 || Math.abs(x - TRENCH[0]) < 16) continue; spots.push([ox + x, pitGround(ox + x, z), z, 0.9 + 0.3 * ((i * 3) % 4) / 4]); }
  for (let i = 0; i < 16; i++) { const x = -80 + i * 11, z = 70 + (i % 3) * 6; spots.push([ox + x, pitGround(ox + x, z), z, 1.1]); }
  trees(G, spots, "P");
  mountain(G, "cePitHill", ox, -2, 140, 520, 56, 23, 0.6, 0.0, "#5a6a48");
  b.build(G, true);
  const skies = { day: skyPl(G, caSkyTex("day"), "#5f95cf", ox, 20, 600, 420, -60), dusk: skyPl(G, caSkyTex("dusk"), "#2b3558", ox, 20, 600, 420, -60) };
  noInk(G);
  const turf = (x: number, z: number) => { const lx = x - ox, r = Math.hypot((lx - PIT_C[0]) / RX, (z - PIT_C[2]) / RZ); if (r < 1.08) return null; if (Math.abs(lx - TRENCH[0]) < 12 && Math.abs(z - TRENCH[2]) < 3) return null; if (Math.hypot(lx - BORE[0], z - BORE[2]) < 1.2) return null; if (Math.abs(lx - TRUCK[0]) < 4.5 && Math.abs(z - TRUCK[2]) < 2) return null; return pitGround(x, z); };
  return { group: G, seam, fire, heapGlow, stream, streamT, skies, turf, drift: (t) => { streamT.offset.y = -t * 2.2; } };
}

// =====================================================================================================================
export type MineSet = { group: THREE.Group; embers: THREE.Mesh[]; fires: THREE.PointLight[]; lamp: THREE.PointLight; lamps2: THREE.PointLight[]; bulbs: THREE.Group; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildMine(): MineSet {
  const G = new THREE.Group(), ox = SET.mine[0], b = new Batch(), { hw, h, z0, z1 } = TUN;
  const coal = lam("ceCoalM", () => ({ map: repC(coalTex(), 2, 1) })), floor = lam("ceMineFloor", () => ({ map: dirtTex("ceMineFloorT", "#3a3430") })), timber = lam("ceTimber", () => ({ map: planksHD(), color: "#6a5038" })), iron = M("ceRail", "#5a5a60");
  // walls and roof: rough coal (big facets over the texture), the floor packed dirt with rails on ties
  for (const sx of [-1, 1]) { const g = rockWall(z1 - z0, h + 0.6, 0.9, 0.22, 5 + sx, 3); g.rotateY(sx * Math.PI / 2); g.translate(ox + sx * hw, -0.2, (z0 + z1) / 2); const m = new THREE.Mesh(g, lam("ceCoalWall", () => ({ map: coalTex(), vertexColors: true, flatShading: true }))); m.material.side = THREE.DoubleSide; m.receiveShadow = true; G.add(m); }
  b.add(B(ox - hw - 0.3, -0.2, z0, ox + hw + 0.3, 0, z1, 2), floor); b.add(B(ox - hw - 0.4, h, z0, ox + hw + 0.4, h + 0.6, z1, 2), coal); for (const sx of [-1, 1]) b.add(B(ox + sx * (hw + 0.05), 0, z0, ox + sx * (hw + 0.6), h, z1, 2), coal);
  b.add(B(ox - hw - 0.6, 0, z1 - 0.2, ox + hw + 0.6, h, z1 + 0.4, 2), coal);
  for (let z = z0; z < z1; z += 0.8) b.add(B(ox - 0.75, 0.0, z, ox + 0.75, 0.08, z + 0.2), timber);
  for (const x of [-0.5, 0.5]) b.add(B(ox + x - 0.04, 0.08, z0, ox + x + 0.04, 0.16, z1), iron);
  // timber sets every 2.4 m: two posts to the floor and a cap under the roof
  for (let z = z0 + 1; z < z1; z += 2.4) { for (const sx of [-1, 1]) b.add(B(ox + sx * (hw - 0.3), 0, z, ox + sx * (hw - 0.05), h - 0.18, z + 0.25), timber); b.add(B(ox - hw + 0.02, h - 0.28, z, ox + hw - 0.02, h, z + 0.27), timber); }
  // the fire: hot patches on both walls and the roof from z 14 on, brighter deeper in; orange lights
  const embers: THREE.Mesh[] = [], emb = emberTex();
  for (let i = 0; i < 30; i++) { const z = 13 + i * 1.5, side = i % 3, w = 1.2 + (i % 2) * 0.8, m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9 + (i % 4) * 0.25), new THREE.MeshBasicMaterial({ map: emb, transparent: true, opacity: 0, color: new THREE.Color(1.8, 1.2, 0.9), depthWrite: false, side: THREE.DoubleSide }));
    if (side === 2) { m.rotation.x = Math.PI / 2; m.position.set(ox + 0.5 * Math.sin(i), h - 0.12, z); } else { m.rotation.y = side ? -Math.PI / 2 : Math.PI / 2; m.position.set(ox + (side ? 1 : -1) * (hw - 0.22), 0.5 + (i % 3) * 0.55, z); }
    m.layers.set(NOINK); m.visible = false; G.add(m); embers.push(m); }
  const fires = [18, 30, 44].map((z) => { const l = new THREE.PointLight("#ff7a2a", 0, 18, 1.5); l.position.set(ox, 1.4, z); G.add(l); return l; });
  // a miner's light for the cold tunnel (the old mines): a dim bulb near the camera end
  const bulbs = new THREE.Group(); G.add(bulbs);
  const lamp = new THREE.PointLight("#ffd8a0", 0, 22, 1.4); lamp.position.set(ox + 0.4, h - 0.4, 2); G.add(lamp); flame(bulbs, V(ox + 0.4, h - 0.35, 2), 0.05);
  const lamps2 = [9, 16].map((z) => { const l = new THREE.PointLight("#ffd8a0", 0, 14, 1.5); l.position.set(ox - 0.4, h - 0.4, z); G.add(l); flame(bulbs, V(ox - 0.4, h - 0.35, z), 0.04); return l; });
  b.build(G, true);
  const dust = dustMotes(V(ox, 1.2, 8), V(2.6, 2, 14), 260, new THREE.Color(1, 0.85, 0.7), 0.025, 0.5); G.add(dust.points);
  noInk(G);
  return { group: G, embers, fires, lamp, lamps2, bulbs, dust, drift: (t) => dust.drift(t) };
}

// =====================================================================================================================
export type YardSet = { group: THREE.Group; winter: THREE.Mesh; winterHole: THREE.Mesh; summer: THREE.Mesh; hole: THREE.Group; snow: THREE.Group; skies: { winter: THREE.Mesh; day: THREE.Mesh }; turf: (x: number, z: number) => number | null; drift: (t: number) => void };
export function buildYard(): YardSet {
  const G = new THREE.Group(), ox = SET.yard[0], b = new Batch(), hole = new THREE.Group(), snow = new THREE.Group(); G.add(hole, snow);
  const yy = (x: number, z: number) => 0.03 * Math.sin(x * 0.9 + z * 0.6) + (z > 40 ? (z - 40) * 0.2 : 0);
  const HX = ox + HOLE[0], HZ = HOLE[2], near = (x: number, z: number) => Math.abs(x - HX) < 4 && Math.abs(z - HZ) < 4;
  const ground = (key: string, tex: () => THREE.Texture, cut: boolean) => {
    const g = sheet(ox - 80, ox + 80, -50, 80, 160, 130, (x, z) => yy(x - ox, z) - 0.02, 3), p = g.attributes.position as THREE.BufferAttribute, idx: number[] = [], src = g.index!;
    const cen = (i: number) => [p.getX(i), p.getZ(i)];
    for (let i = 0; i < src.count; i += 3) { const a = src.getX(i), c = src.getX(i + 1), d = src.getX(i + 2), [x0, z0] = cen(a), [x1, z1] = cen(c), [x2, z2] = cen(d); if (near((x0 + x1 + x2) / 3, (z0 + z1 + z2) / 3)) continue; idx.push(a, c, d); }
    g.setIndex(idx);
    const fg = sheet(HX - 4.5, HX + 4.5, HZ - 4.5, HZ + 4.5, 90, 90, (x, z) => yy(x - ox, z), 3), fp = fg.attributes.position as THREE.BufferAttribute, fi: number[] = [], fsrc = fg.index!;
    const keep = (i: number) => !cut || Math.hypot(fp.getX(i) - HX, fp.getZ(i) - HZ) > HOLE_R;
    for (let i = 0; i < fsrc.count; i += 3) { const a = fsrc.getX(i), c = fsrc.getX(i + 1), d = fsrc.getX(i + 2); if (keep(a) && keep(c) && keep(d)) fi.push(a, c, d); }
    fg.setIndex(fi);
    const mat = lam(key, () => ({ map: tex() })), m = new THREE.Mesh(g, mat), m2 = new THREE.Mesh(fg, mat); m.receiveShadow = m2.receiveShadow = true; m.add(m2); G.add(m); return m; };
  const winter = ground("ceYardW", snowGrassTex, false), winterHole = ground("ceYardW", snowGrassTex, true), summer = ground("ceYardS", () => dirtTex("ceYardST", "#4a6a2e"), false);
  { const sm2 = lam("ceYardSM", () => ({ map: dirtTex("ceYardST", "#4a6a2e"), color: "#7a9a5a" })); summer.material = sm2; (summer.children[0] as THREE.Mesh).material = sm2; }
  // the sinkhole: a dirt throat going down, rough lip chunks, a black depth, roots across it from the tree's side
  { const wall = new THREE.Mesh(new THREE.CylinderGeometry(HOLE_R, HOLE_R * 0.85, 7, 20, 6, true), lam("ceThroat", () => ({ map: rockTex("ceThroatR", "#4a3a2e"), color: "#7a6a5a", side: THREE.BackSide }))); wall.position.set(ox + HOLE[0], -3.5, HOLE[2]); hole.add(wall);
    const deep = new THREE.Mesh(new THREE.CircleGeometry(HOLE_R * 0.9, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#060406" })); deep.position.set(ox + HOLE[0], -6.8, HOLE[2]); hole.add(deep);
    const rk: Fol = []; for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283; rk.push({ g: rockGeo(0.07 + 0.03 * (i % 3), i + 50, 0, 0.6), m: new THREE.Matrix4().compose(V(ox + HOLE[0] + Math.cos(a) * (HOLE_R + 0.08), 0.02, HOLE[2] + Math.sin(a) * (HOLE_R + 0.08)), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, i, 0.2)), V(1.2, 0.7, 1)) }); }
    const lip = new THREE.Mesh(mergeFacets(rk), lam("ceLip", () => ({ map: dirtTex("ceThroatT", "#4a3a2c"), vertexColors: true, flatShading: true }))); shadowAll(lip); hole.add(lip);
    const root = M("ceRoot", "#5a4030"); for (const [y, dz, dx] of [[-0.22, -0.2, 0.0], [-0.42, 0.18, 0.1], [-0.6, 0.0, -0.1], [-0.32, 0.05, 0.05]]) { const a0 = V(ox + HOLE[0] + HOLE_R - 0.02, -0.06, HOLE[2] + dz * 1.4), a1 = V(ox + HOLE[0] - HOLE_R * 0.5 + dx, y, HOLE[2] + dz); hole.add(new THREE.Mesh(rodGeo(a0, a1, 0.022), root)); } }
  // the house's back: siding, a back door with steps, a cellar window at ground level; a fence, a clothesline, the tree
  houseAt(b, G, ox, HOUSE_Z + 3.5, 7, 7, 5.8, "#c9c2b0", "#3a3438", false, 0, 0);
  b.add(B(ox - 0.8, 0, HOUSE_Z - 0.9, ox + 0.9, 0.22, HOUSE_Z - 0.01), M("ceStep", "#9a948a")); b.add(B(ox - 0.8, 0.22, HOUSE_Z - 0.55, ox + 0.9, 0.44, HOUSE_Z - 0.01), M("ceStep", "#9a948a"));
  { const cw = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.45), M("ceCellarWin", "#2a3440")); cw.rotation.y = Math.PI; cw.position.set(ox + 2.3, 0.3, HOUSE_Z - 0.02); G.add(cw); }
  const fence = lam("ceFence", () => ({ map: planksHD(), color: "#e9e2d2" }));
  for (const sx of [-1, 1]) for (let k = 0; k < 24; k++) { const z = -6 + k * 0.6; b.add(B(ox + sx * 7.5 - 0.05, 0, z, ox + sx * 7.5 + 0.05, 1.1, z + 0.4), fence); }
  for (const sx of [-1, 1]) for (const y of [0.3, 0.85]) b.add(B(ox + sx * 7.5 - 0.06, y, -6, ox + sx * 7.5 + 0.06, y + 0.08, 8.4), fence);
  for (const z of [1.5, 5.5]) b.add(B(ox + 5.2 - 0.06, 0, z - 0.06, ox + 5.2 + 0.06, 2.1, z + 0.06), M("ceLinePost", "#8a8478")); b.add(rodGeo(V(ox + 5.2, 2.0, 1.5), V(ox + 5.2, 2.0, 5.5), 0.012), M("ceLine2", "#e9e2d2"));
  trees(G, [[ox + TREE[0], 0, TREE[2], 1.0]], "Y", true);
  trees(G, [[ox - 14, yy(-14, 20), 20, 1.1], [ox + 16, yy(16, 24), 24, 1.0], [ox + 2, yy(2, 30), 30, 1.2], [ox - 30, yy(-30, 12), 12, 1.0], [ox + 30, yy(30, 14), 14, 1.1]], "YB", true);
  for (const [x, z, col] of [[-16, 14, "#9ab0b8"], [16, 15, "#d8c89a"], [-30, 18, "#b8a090"], [30, 19, "#a8b89a"]] as [number, number, string][]) houseAt(b, G, ox + x, z, 6.2, 7, 5.6, col, "#4a4038", false, 0, 0);
  // snow on the roofs and drifts by the fence (winter only)
  { const sw = M("ceSnow", "#eef2f6"); for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.6 + (i % 3) * 0.2, 10, 6, 0, 6.283, 0, Math.PI / 2), sw); d.scale.set(1.6, 0.35, 1); d.position.set(ox + (i % 2 ? 7.1 : -7.1), 0, -4 + i * 1.0); snow.add(d); } }
  mountain(G, "ceYardHill", ox, -2, 120, 520, 46, 41, 0.6, 0.0, "#6a6a58");
  b.build(G, true);
  const skies = { winter: skyPl(G, ceSkyTex("winter"), "#8a96a6", ox, 0, 500, 400, -60), day: skyPl(G, caSkyTex("day"), "#5f95cf", ox, 0, 500, 400, -60) };
  noInk(G);
  const turf = (x: number, z: number) => { const lx = x - ox; if (Math.abs(lx) < 4 && z > HOUSE_Z - 1.2) return null; if (Math.abs(Math.abs(lx) - 7.5) < 0.3) return null; return yy(lx, z); };
  return { group: G, winter, winterHole, summer, hole, snow, skies, turf, drift: () => {} };
}

// =====================================================================================================================
export type RoomSet = { group: THREE.Group; council: THREE.Group; cellar: THREE.Group; lamp: THREE.PointLight; bulb: THREE.PointLight; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildRoom(): RoomSet {
  const G = new THREE.Group(), ox = SET.room[0], council = new THREE.Group(), cellar = new THREE.Group(); G.add(council, cellar);
  const { w, z0, z1, h } = ROOM, bc = new Batch(), bl = new Batch();
  // the council room: panelled walls, papered above, a long table, the flag, the borough's name, a clock, a window
  { const panel = lam("ceRmPanel", () => ({ map: repC(panelTex(), 5, 1) })), paper = lam("ceRmPaper", () => ({ map: repC(wallpaperTex(), 4, 1.4), color: "#c9c2a8" })), floorM = lam("ceRmFloor", () => ({ map: planksHD(), color: "#8a6a4e" })), oak = lam("ceRmOak", () => ({ map: planksHD(), color: "#6a4630" }));
    bc.add(B(ox - w, -0.1, z0, ox + w, 0, z1, 2), floorM); bc.add(B(ox - w, h, z0, ox + w, h + 0.1, z1), M("ceRmCeil", "#d9d2c2"));
    bc.add(B(ox - w, 0, z1, ox + w, 1.1, z1 + 0.1, 2), panel); bc.add(B(ox - w, 1.1, z1, ox + w, h, z1 + 0.1, 2), paper);
    for (const sx of [-1, 1]) { bc.add(B(ox + sx * w, 0, z0, ox + sx * (w + 0.1), 1.1, z1, 2), panel); bc.add(B(ox + sx * w, 1.1, z0, ox + sx * (w + 0.1), h, z1, 2), paper); }
    bc.add(B(ox - DESK.hw * 1.6, DESK.y - 0.06, DESK.z - DESK.hd, ox + DESK.hw * 1.6, DESK.y, DESK.z + DESK.hd), oak);
    for (const sx of [-1, 1]) bc.add(B(ox + sx * DESK.hw * 1.5 - 0.06, 0, DESK.z - DESK.hd + 0.05, ox + sx * DESK.hw * 1.5 + 0.06, DESK.y - 0.06, DESK.z + DESK.hd - 0.05), oak);
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.5), lam("ceRmName", () => ({ map: signTex("BOROUGH OF CENTRALIA|COUNCIL", "#2a3a2a", "#e9c876", 1024, 190) }))); nm.rotation.y = Math.PI; nm.position.set(ox - 0.9, 2.25, z1 - 0.02); council.add(nm);
    const ck = new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), lam("ceRmClock", () => ({ map: clockTex("ceRmClockT") }))); ck.rotation.y = Math.PI; ck.position.set(ox + 1.6, 2.35, z1 - 0.02); council.add(ck);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.5, 1.6) })); win.rotation.y = Math.PI; win.position.set(ox + 3.2, 1.9, z1 - 0.02); council.add(win);
    // the flag on a pole with a stand (stripes and the blue canton read at phone size)
    bc.add(B(ox + 2.4, 0, 2.9, ox + 2.46, 2.6, 2.96), M("ceRmPole", "#c9a23a")); bc.add(B(ox + 2.25, 0, 2.78, ox + 2.62, 0.1, 3.1), M("ceRmPole", "#c9a23a"));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.62), lam("ceRmFlag", () => ({ map: (() => { const t = signTex("", "#ffffff", "#ffffff", 512, 320); const c = t.image as HTMLCanvasElement, g = c.getContext("2d")!; for (let k = 0; k < 13; k++) { g.fillStyle = k % 2 ? "#f2f2f2" : "#b3262b"; g.fillRect(0, k * 320 / 13, 512, 320 / 13 + 1); } g.fillStyle = "#2a3a6a"; g.fillRect(0, 0, 220, 172); g.fillStyle = "#ffffff"; for (let i = 0; i < 30; i++) g.fillRect(12 + (i % 6) * 34, 10 + Math.floor(i / 6) * 32, 7, 7); t.needsUpdate = true; return t; })(), side: THREE.DoubleSide }))); fl.rotation.y = Math.PI; fl.position.set(ox + 1.93, 2.25, 2.93); council.add(fl);
    for (let k = 0; k < 3; k++) { const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), lam("ceRmPapers", () => ({ map: labelTex("DUMP|CLEAN-UP|MEMORIAL DAY", "#f3ecd8", "rgba(30,20,20,0.85)", 1) }))); pp.rotation.set(-Math.PI / 2, 0, Math.PI + 0.1 * (k - 1)); pp.position.set(ox - 0.8 + k * 0.8, DESK.y + 0.006, DESK.z - 0.1); council.add(pp); } }
  bc.build(council, true);
  // the cellar: rubble-stone walls, a concrete floor with cracks, the furnace, shelves of jars, the stair, a bare bulb
  { const stone = lam("ceCelStone", () => ({ map: repC(rockTex("ceCelStoneT", "#8a8478"), 3, 1.2) })), conc = lam("ceCelFloor", () => ({ map: repC(dirtTex("ceCelFloorT", "#8a8680"), 2, 2) })), wood = lam("ceCelWood", () => ({ map: planksHD(), color: "#7a6448" }));
    bl.add(B(ox - w, -0.1, z0, ox + w, 0, z1, 2), conc); bl.add(B(ox - w, h - 0.4, z0, ox + w, h - 0.3, z1), wood);
    bl.add(B(ox - w, 0, z1, ox + w, h, z1 + 0.2, 2), stone); for (const sx of [-1, 1]) bl.add(B(ox + sx * w, 0, z0, ox + sx * (w + 0.2), h, z1, 2), stone);
    for (let k = 0; k < 9; k++) bl.add(B(ox - 0.6 - k * 0.08, 0, z1 - 3.2 + k * 0.32, ox + 0.0, 0.25 + k * 0.25, z1 - 2.9 + k * 0.32), wood);
    bl.add(B(ox + 1.4, 0, z1 - 1.2, ox + 2.6, 1.6, z1 - 0.2), M("ceFurnace", "#4a4a50")); bl.add(new THREE.CylinderGeometry(0.16, 0.16, 1.4, 10).translate(ox + 2.0, 2.3, z1 - 0.7), M("ceFurnace", "#4a4a50"));
    for (const y of [0.4, 1.0, 1.6]) { bl.add(B(ox - 3.6, y, z1 - 0.55, ox - 1.6, y + 0.04, z1 - 0.1), wood); for (let k = 0; k < 6; k++) bl.add(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8).translate(ox - 3.4 + k * 0.34, y + 0.14, z1 - 0.3), M("ceJar" + (k % 3), ["#c9a23a", "#b3262b", "#6a8a3a"][k % 3])); }
    for (const sx of [-3.6, -1.6]) bl.add(B(ox + sx - 0.04, 0, z1 - 0.55, ox + sx + 0.04, 1.75, z1 - 0.45), wood);
    // floor cracks the gas comes up through
    for (const [x, z, a] of [[0.4, 0.2, 0.3], [-1.0, -0.6, -0.5], [1.2, -1.4, 0.9]] as [number, number, number][]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshLambertMaterial({ map: crackTex(false), transparent: true, alphaTest: 0.2 })); c.rotation.set(-Math.PI / 2, 0, a); c.position.set(ox + x, 0.01, z); cellar.add(c); } }
  { const mon = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), lam("ceMonitor", () => ({ map: labelTex("GAS|MONITOR", "#e9e2cf", "rgba(30,30,40,0.95)", 1) }))); mon.rotation.y = Math.PI; mon.position.set(ox - 0.9, 1.55, ROOM.z1 - 0.02); cellar.add(mon);
    const led = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.2, 0.15) })); led.rotation.y = Math.PI; led.position.set(ox - 0.75, 1.42, ROOM.z1 - 0.03); cellar.add(led); }
  bl.build(cellar, true);
  const lamp = new THREE.PointLight("#ffe2b8", 0, 14, 1.3); lamp.position.set(ox - 0.4, h - 0.5, 0.4); council.add(lamp); { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 0.25, 12, 1, true), M("ceShade", "#e9e2cf")); sh.position.set(ox - 0.4, h - 0.35, 0.4); council.add(sh); }
  const bulb = new THREE.PointLight("#ffd8a0", 0, 12, 1.3); bulb.position.set(ox + 0.4, h - 0.65, 0.2); cellar.add(bulb); flame(cellar, V(ox + 0.4, h - 0.6, 0.2), 0.05);
  const dust = dustMotes(V(ox, 1.4, 0), V(4, 2.5, 4), 160, new THREE.Color(1, 0.9, 0.7), 0.03, 0.5); G.add(dust.points);
  noInk(G);
  void glow; void T; void TRENCH; void HEAP;
  return { group: G, council, cellar, lamp, bulb, dust, drift: (t) => dust.drift(t) };
}
