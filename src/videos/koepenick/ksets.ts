// The Captain of Koepenick Short: the three sets. Built to claude/background-and-character-look.md: every light has a
// source, two scales of texture on every surface, no ink on the sets (NOINK), every corner dressed, air in every scene.
//   buildStreet  a Berlin street at noon: shop fronts (junk dealer, tailor), the army swimming baths' gate, the station
//   buildSquare  Koepenick's town square: the red-brick town hall, its gate (posable leaves) and the board of offices
//   buildRoom    one room, five dressings: junk shop, beer hall, mayor's office, the Kaiser's study, Luxembourg counter
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD, facadeHD, cobbleHD, stoneHD, roofHD } from "../bridge/paint";
import { dustMotes, lightCone, bushGeo, mergeFacets, dirtTex } from "../bridge/scenery";
import { M, T, noInk, putter, shadowAll, flame, sheet, nz } from "../frozen/fsets";
import { brickTex, labelTex, wallpaperTex, panelTex, carpetTex, clockTex, curtainTex } from "../frozen/paint";
import { caSkyTex, signTex } from "../cahaba/cpaint";
import { SET, WZ, KERB, PAVE, JUNK_X, TAILOR_X, BATHS_X, STATION_X, COLUMN, TZ, GATE, BOARD, TOWER_X, ROOM, DESK, TABLE, COUNTER } from "./place";
import { boardTex, kaiserPortraitTex, flagTex, shopWinTex, receiptTex, repK } from "./kpaint";

const M4 = (x: number, y: number, z: number, ry = 0, s = 1) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(s, s, s));
const sky = (G: THREE.Object3D, kind: Parameters<typeof caSkyTex>[0], ox: number, z: number, w: number, h: number, y0: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: caSkyTex(kind), fog: false, depthWrite: false })); m.rotation.y = Math.PI; m.position.set(ox, y0 + h / 2, z); m.renderOrder = -5; G.add(m); return m; };
/** a plane facing -z (toward the cameras) at set coords */
const front = (G: THREE.Object3D, ox: number, w: number, h: number, mat: THREE.Material, x: number, y: number, z: number, cast = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.rotation.y = Math.PI; m.position.set(ox + x, y, z); m.castShadow = cast; m.receiveShadow = true; G.add(m); return m; };
const winLit = (k: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color(k * 1.0, k * 0.86, k * 0.62), fog: true });
const glass = () => M("kpGlass", "#2a3644");

/** a street lamp (gas lantern on a cast-iron post) */
const gasLamp = (b: Batch, G: THREE.Object3D, x: number, z: number, iron: THREE.Material, lit: boolean) => {
  b.add(new THREE.CylinderGeometry(0.07, 0.12, 3.6, 8).translate(x, 1.8, z), iron); b.add(new THREE.CylinderGeometry(0.18, 0.22, 0.4, 8).translate(x, 0.2, z), iron);
  b.add(new THREE.CylinderGeometry(0.26, 0.14, 0.5, 6).translate(x, 3.85, z), M("kpLantern", "#e9e2c8", { emissive: lit ? "#ffd27a" : "#000000", emissiveIntensity: lit ? 0.6 : 0 }));
  b.add(new THREE.ConeGeometry(0.3, 0.26, 6).translate(x, 4.23, z), iron);
};
/** a linden on a pavement: trunk and three leaf clumps */
const linden = (list: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[], b: Batch, bark: THREE.Material, x: number, z: number, h: number, seed: number) => {
  b.add(new THREE.CylinderGeometry(0.16, 0.24, h * 0.55, 7).translate(x, h * 0.275, z), bark);
  for (let k = 0; k < 3; k++) list.push({ g: bushGeo(h * 0.24, seed + k, 6), m: M4(x + Math.sin(seed + k * 2.1) * 0.8, h * (0.58 + 0.13 * k), z + Math.cos(seed + k * 1.7) * 0.6, k), tint: 0.85 + 0.1 * k });
};
/** a town house front (several storeys) with its own facade painting; ground floor plain plaster for shop fronts */
const houseFront = (b: Batch, G: THREE.Object3D, ox: number, x: number, w: number, h: number, col: string, key: string, z: number, depth = 10, shop = true) => {
  const up = lam("kpFac" + key, () => ({ map: facadeHD("kp" + key, w, h - 4.2, { wall: col, shutter: "#4a5a4a" }) }));
  const plaster = M("kpPl" + key, col), cornice = M("kpCorn", "#e2d8c4"), slate = lam("kpSlate", () => ({ map: roofHD("#5a5e6a", true) }));
  b.add(boxGeo(V(ox + x - w / 2, 0, z), V(ox + x + w / 2, h, z + depth)), plaster);
  front(G, ox, w, h - 4.2, up, x, 4.2 + (h - 4.2) / 2, z - 0.02);
  if (shop) b.add(boxGeo(V(ox + x - w / 2 - 0.05, 3.9, z - 0.25), V(ox + x + w / 2 + 0.05, 4.2, z)), cornice);
  b.add(boxGeo(V(ox + x - w / 2 - 0.1, h - 0.2, z - 0.4), V(ox + x + w / 2 + 0.1, h + 0.15, z)), cornice);
  const rg = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-0.2, 0), new THREE.Vector2(2.4, 2.2), new THREE.Vector2(depth - 2.4, 2.2), new THREE.Vector2(depth + 0.2, 0)]), { depth: w, bevelEnabled: false });
  rg.rotateY(-Math.PI / 2); rg.translate(ox + x + w / 2, h + 0.15, z - 0.2); b.add(rg, slate);
  for (const dx of [-w / 3, w / 3]) b.add(boxGeo(V(ox + x + dx - 0.3, h + 0.6, z + 3), V(ox + x + dx + 0.3, h + 3.0, z + 3.6)), M("kpChimney", "#8a5a48"));
};

// =====================================================================================================================
export type StreetSet = { group: THREE.Group; skies: Record<"day", THREE.Mesh>; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildStreet(): StreetSet {
  const G = new THREE.Group(), ox = SET.street[0], b = new Batch(), leaves: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [];
  const iron = M("kpIron", "#2a2e2c"), bark = M("kpBark", "#4a3a2e"), stoneM = lam("kpPave", () => ({ map: repK(stoneHD("kpPaveT", ["#c8beac", "#bdb29f", "#d0c6b4", "#b6ab98"], "#9a8f80"), 6, 1) }));
  const dark = M("kpDark", "#2e2622"), wood = lam("kpWood", () => ({ map: planksHD(), color: "#6a4a34" }));
  // the street: cobbles; a raised pavement of stone slabs along the fronts with a granite kerb
  { const g = sheet(ox - 80, ox + 80, -40, KERB, 80, 30, (x, z) => 0.02 * nz(x, z) - (z < -30 ? 0.3 : 0), 4), m = new THREE.Mesh(g, T("kpCobble", () => cobbleHD())); m.receiveShadow = true; G.add(m); }
  b.add(boxGeo(V(ox - 80, 0, KERB), V(ox + 80, PAVE, WZ), 1.6), stoneM); b.add(boxGeo(V(ox - 80, 0, KERB - 0.18), V(ox + 80, PAVE, KERB)), M("kpKerb", "#8a8478"));
  // the far side of the street (seen in reverse shots): a row of fronts facing +z
  for (const [x, w, col] of [[-20, 9, "#cfc3a8"], [-10, 10, "#d8cdb6"], [0, 9, "#c9b896"], [10, 10, "#d6c6a6"], [20, 9, "#cbbfa8"]] as [number, number, string][]) {
    b.add(boxGeo(V(ox + x - w / 2, 0, -24), V(ox + x + w / 2, 14, -16)), M("kpFarH" + col, col));
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, 14), lam("kpFar" + col, () => ({ map: facadeHD("kpFar" + col, w, 14, { wall: col, shutter: "#4a5a4a", door: true }) }))); f.position.set(ox + x, 7, -15.98); f.receiveShadow = true; G.add(f); }
  b.add(boxGeo(V(ox - 80, 0, -16), V(ox + 80, PAVE, -13.4), 1.6), stoneM);
  // ---- the fronts along z = WZ (+x is screen left): house, junk dealer, tailor, baths gate, station, house ----
  houseFront(b, G, ox, 19.5, 8, 15, "#d9c9a8", "A", WZ);
  houseFront(b, G, ox, JUNK_X, 7, 14, "#c9b48e", "B", WZ);
  houseFront(b, G, ox, TAILOR_X + 0.25, 7.5, 15.5, "#d6cbb5", "C", WZ);
  houseFront(b, G, ox, -28, 9, 14, "#cdbfa5", "D", WZ);
  // shop fronts: dark timber surround, a lit window of goods each side of the door, a painted sign board
  const shopFront = (x: number, kind: "junk" | "tailor", sign: string, bg: string) => {
    b.add(boxGeo(V(ox + x - 3.2, 0, WZ - 0.12), V(ox + x + 3.2, 3.6, WZ)), dark);
    for (const sx of [-1.75, 1.75]) { front(G, ox, 2.2, 2.3, lam("kpWinM" + kind, () => ({ map: shopWinTex(kind) })), x + sx, 1.85, WZ - 0.14); b.add(boxGeo(V(ox + x + sx - 1.2, 0.55, WZ - 0.3), V(ox + x + sx + 1.2, 0.7, WZ - 0.12)), dark); }
    front(G, ox, 1.1, 2.6, M("kpShopDoor" + kind, "#4a3226"), x, 1.3 + PAVE, WZ - 0.15); front(G, ox, 0.7, 0.9, glass(), x, 2.0, WZ - 0.16);
    front(G, ox, 5.8, 0.8, lam("kpSign" + kind, () => ({ map: signTex(sign, bg, "#f3e2b0", 1024, 160) })), x, 3.25, WZ - 0.16, false);
  };
  shopFront(JUNK_X, "junk", "TRÖDLER · ALTE KLEIDER", "#3a2a22"); shopFront(TAILOR_X, "tailor", "HERRENMODEN", "#22303a");
  // the junk dealer's goods spill onto the pavement: a rail of coats, a crate of boots, a chair
  { const cols = ["#26304a", "#5a4a3a", "#6a3a3a"]; b.add(boxGeo(V(ox + JUNK_X + 3.4, 1.9, WZ - 1.2), V(ox + JUNK_X + 5.2, 1.96, WZ - 1.1)), iron);
    for (const x of [3.45, 5.15]) b.add(boxGeo(V(ox + JUNK_X + x - 0.03, PAVE, WZ - 1.18), V(ox + JUNK_X + x + 0.03, 1.96, WZ - 1.12)), iron);
    cols.forEach((c, i) => b.add(new THREE.CylinderGeometry(0.2, 0.28, 1.1, 8).translate(ox + JUNK_X + 3.75 + i * 0.55, 1.32, WZ - 1.15), M("kpCoatR" + i, c)));
    const cr = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.55), lam("kpBootCrate", () => ({ map: labelTex("STIEFEL", "#a8834e") }))); cr.position.set(ox + JUNK_X - 3.8, PAVE + 0.25, WZ - 0.9); cr.rotation.y = Math.PI + 0.1; shadowAll(cr); G.add(cr); }
  // ---- the army swimming baths: a brick wall with an arched gate, a painted sign over it, the yard and trees behind ----
  { const brick = lam("kpBathBrick", () => ({ map: repK(brickTex("kpBathB", ["#9a5a44", "#8a4e3c", "#a6624c", "#7e4636"], "#c9b8a0", 0.2), 4, 1) })), x0 = BATHS_X - 4.6, x1 = BATHS_X + 4.6, gw = 1.7;
    b.add(boxGeo(V(ox + x0, 0, WZ), V(ox + BATHS_X - gw, 3.4, WZ + 0.5), 1.2), brick); b.add(boxGeo(V(ox + BATHS_X + gw, 0, WZ), V(ox + x1, 3.4, WZ + 0.5), 1.2), brick);
    for (const sx of [-1, 1]) { b.add(boxGeo(V(ox + BATHS_X + sx * gw - 0.35, 0, WZ - 0.2), V(ox + BATHS_X + sx * gw + 0.35, 4.3, WZ + 0.6)), brick); b.add(boxGeo(V(ox + BATHS_X + sx * gw - 0.45, 4.3, WZ - 0.3), V(ox + BATHS_X + sx * gw + 0.45, 4.5, WZ + 0.7)), M("kpCap", "#d8cfbd")); }
    b.add(boxGeo(V(ox + BATHS_X - gw - 0.35, 3.9, WZ - 0.1), V(ox + BATHS_X + gw + 0.35, 4.3, WZ + 0.5)), brick);
    front(G, ox, 3.2, 0.7, lam("kpBathSign", () => ({ map: signTex("MILITÄR-|SCHWIMMANSTALT", "#e9e2cc", "#22303a", 1024, 240) })), BATHS_X, 4.75, WZ - 0.32, false);
    b.add(boxGeo(V(ox + BATHS_X - 1.65, 4.4, WZ - 0.3), V(ox + BATHS_X + 1.65, 4.44, WZ - 0.28)), iron);
    // behind the gate: a gravel yard, a timber bathing hut, the edge of the lake with a jetty, poplars
    { const g = sheet(ox + x0 - 6, ox + x1 + 6, WZ + 0.4, WZ + 30, 20, 30, (x, z) => 0.03 * nz(x, z), 3), m = new THREE.Mesh(g, T("kpYard", () => dirtTex("kpYardT", "#a89878"))); m.receiveShadow = true; G.add(m); }
    b.add(boxGeo(V(ox + BATHS_X - 5, 0, WZ + 9), V(ox + BATHS_X + 3, 3.2, WZ + 13)), wood); b.add(boxGeo(V(ox + BATHS_X - 5.3, 3.2, WZ + 8.7), V(ox + BATHS_X + 3.3, 3.5, WZ + 13.3)), M("kpHutRoof", "#5a4a40"));
    front(G, ox, 3.4, 0.6, lam("kpHutSign", () => ({ map: signTex("BADEANSTALT", "#e9e2cc", "#3a2a22", 1024, 180) })), BATHS_X - 1, 2.6, WZ + 8.98, false);
    { const wtr = new THREE.Mesh(new THREE.PlaneGeometry(40, 18), lam("kpLake", () => ({ color: "#4a7a9a", emissive: "#203848", emissiveIntensity: 0.4 }))); wtr.rotation.x = -Math.PI / 2; wtr.position.set(ox + BATHS_X, 0.02, WZ + 24); G.add(wtr); }
    for (const x of [-9, -6.5, 2.5, 5]) linden(leaves, b, bark, ox + BATHS_X + x, WZ + 5 + Math.abs(x) * 0.4, 9, x * 3.1); }
  // ---- the station: a brick hall with a tall arched entrance, a clock in the gable, BAHNHOF in gold ----
  { const brick = lam("kpStBrick", () => ({ map: repK(brickTex("kpStB", ["#a65e44", "#985440", "#b26a4e", "#8a4a38"], "#d9c8ae", 0.25), 5, 3) })), stone = M("kpStStone", "#d8cfbd"), x0 = STATION_X - 6.5, x1 = STATION_X + 6.5, ew = 2.2;
    b.add(boxGeo(V(ox + x0, 0, WZ), V(ox + STATION_X - ew, 11, WZ + 12), 1.4), brick); b.add(boxGeo(V(ox + STATION_X + ew, 0, WZ), V(ox + x1, 11, WZ + 12), 1.4), brick); b.add(boxGeo(V(ox + STATION_X - ew, 5.6, WZ), V(ox + STATION_X + ew, 11, WZ + 12), 1.4), brick);
    b.add(boxGeo(V(ox + STATION_X - ew, 0, WZ + 3), V(ox + STATION_X + ew, 5.6, WZ + 3.2)), M("kpStIn", "#3a2e28"));
    front(G, ox, 3.6, 3.2, winLit(0.75), STATION_X, 3.6, WZ + 2.98);
    for (const sx of [-1, 1]) b.add(boxGeo(V(ox + STATION_X + sx * ew - 0.3, 0, WZ - 0.25), V(ox + STATION_X + sx * ew + 0.3, 5.8, WZ + 0.1)), stone);
    b.add(boxGeo(V(ox + STATION_X - ew - 0.3, 5.6, WZ - 0.25), V(ox + STATION_X + ew + 0.3, 6.1, WZ + 0.1)), stone);
    front(G, ox, 5.4, 1.0, lam("kpStSign", () => ({ map: signTex("BAHNHOF", "#2a2228", "#e9c876", 1024, 190) })), STATION_X, 6.7, WZ - 0.04, false);
    const gab = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-6.7, 0), new THREE.Vector2(0, 4.2), new THREE.Vector2(6.7, 0)]), { depth: 0.5, bevelEnabled: false }); gab.translate(ox + STATION_X, 11, WZ - 0.1); b.add(gab, brick);
    { const ck = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), lam("kpStClock", () => ({ map: clockTex("kpStClockT") }))); ck.rotation.y = Math.PI; ck.position.set(ox + STATION_X, 12.5, WZ - 0.12); G.add(ck); }
    for (const sx of [-4.4, 4.4]) for (const y of [2.6, 7.6]) { front(G, ox, 1.4, 2.2, glass(), STATION_X + sx, y, WZ - 0.02); b.add(boxGeo(V(ox + STATION_X + sx - 0.85, y - 1.25, WZ - 0.15), V(ox + STATION_X + sx + 0.85, y - 1.1, WZ)), stone); }
    b.add(boxGeo(V(ox + x0 - 0.2, 11, WZ - 0.3), V(ox + x1 + 0.2, 11.3, WZ + 12)), stone); }
  // ---- the advertising column, lamps, trees, a bench, a cab-horse trough ----
  { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.8, 24, 1, true), lam("kpColumn", () => ({ map: repK(labelTex("ZIRKUS BUSCH|HEUTE!", "#e9d27a", "rgba(120,30,24,0.95)", 2), 3, 1) }))); col.position.set(ox + COLUMN[0], 1.6 + PAVE, COLUMN[2]); shadowAll(col); G.add(col);
    b.add(new THREE.CylinderGeometry(0.7, 0.7, 0.3, 24).translate(ox + COLUMN[0], PAVE + 0.15, COLUMN[2]), M("kpColBase", "#3a4a3a")); b.add(new THREE.SphereGeometry(0.7, 20, 10, 0, 6.3, 0, Math.PI / 2).translate(ox + COLUMN[0], 3.0 + PAVE, COLUMN[2]), M("kpColTop", "#3a5a4a")); }
  for (const x of [-9, 8, 24]) gasLamp(b, G, ox + x, KERB + 0.4, iron, false);
  for (const x of [15.5, -21]) linden(leaves, b, bark, ox + x, KERB + 0.6, 8.5, x);
  b.add(boxGeo(V(ox + 6.2, PAVE + 0.42, KERB + 0.9), V(ox + 7.9, PAVE + 0.5, KERB + 1.3)), wood); for (const x of [6.3, 7.8]) b.add(boxGeo(V(ox + x - 0.04, PAVE, KERB + 0.95), V(ox + x + 0.04, PAVE + 0.42, KERB + 1.25)), iron);
  b.build(G, true);
  { const lv = new THREE.Mesh(mergeFacets(leaves), lam("kpLeaves", () => ({ color: "#6a8a3a", vertexColors: true, flatShading: true }))); lv.castShadow = true; lv.receiveShadow = true; G.add(lv); }
  const skies = { day: sky(G, "day", ox, 300, 1600, 700, -40) };
  const dust = dustMotes(V(ox, 2.2, 2), V(18, 4, 8), 200, new THREE.Color(1.0, 0.95, 0.8), 0.03, 0.4); G.add(dust.points);
  noInk(G);
  return { group: G, skies, dust, drift: (t) => dust.drift(t) };
}

// =====================================================================================================================
export type SquareSet = { group: THREE.Group; leaves: THREE.Group[]; skies: Record<"day", THREE.Mesh>; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildSquare(): SquareSet {
  const G = new THREE.Group(), ox = SET.square[0], b = new Batch(), leaves: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [];
  const iron = M("kpIron", "#2a2e2c"), bark = M("kpBark", "#4a3a2e"), stone = M("kpHallStone", "#e0d6c2"), wood = lam("kpWood", () => ({ map: planksHD(), color: "#6a4a34" }));
  const brick = lam("kpHallBrick", () => ({ map: repK(brickTex("kpHallB", ["#a8523c", "#9a4a36", "#b45e46", "#8c4230"], "#d9c4a6", 0.15), 8, 3) }));
  // the square: cobbles, a stone apron in front of the town hall
  { const g = sheet(ox - 90, ox + 90, -60, TZ, 90, 40, (x, z) => 0.02 * nz(x, z), 4), m = new THREE.Mesh(g, T("kpCobble", () => cobbleHD())); m.receiveShadow = true; G.add(m); }
  b.add(boxGeo(V(ox - 16, 0, TZ - 3), V(ox + 16, 0.12, TZ), 1.6), lam("kpApron", () => ({ map: repK(stoneHD("kpPaveT", ["#c8beac", "#bdb29f", "#d0c6b4", "#b6ab98"], "#9a8f80"), 8, 1) })));
  // ---- the town hall: three storeys of red brick with stone bands, gothic windows, stepped gables, the tower ----
  const H = 11.5, X0 = -15, X1 = 15, gw = GATE.w / 2;
  b.add(boxGeo(V(ox + X0, 0, TZ), V(ox + GATE.x - gw, H, TZ + 12), 2), brick); b.add(boxGeo(V(ox + GATE.x + gw, 0, TZ), V(ox + X1, H, TZ + 12), 2), brick);
  b.add(boxGeo(V(ox + GATE.x - gw, GATE.h, TZ), V(ox + GATE.x + gw, H, TZ + 12), 2), brick);
  for (const y of [0.9, 4.5, 8.0]) b.add(boxGeo(V(ox + X0 - 0.05, y, TZ - 0.12), V(ox + X1 + 0.05, y + 0.22, TZ)), stone);
  b.add(boxGeo(V(ox + X0 - 0.1, H - 0.3, TZ - 0.3), V(ox + X1 + 0.1, H, TZ)), stone);
  // the gate's stone surround and the passage behind it (a vaulted way into the courtyard)
  for (const sx of [-1, 1]) b.add(boxGeo(V(ox + GATE.x + sx * gw - 0.35, 0, TZ - 0.3), V(ox + GATE.x + sx * gw + 0.35, GATE.h + 0.5, TZ + 0.05)), stone);
  b.add(boxGeo(V(ox + GATE.x - gw - 0.35, GATE.h, TZ - 0.3), V(ox + GATE.x + gw + 0.35, GATE.h + 0.8, TZ + 0.05)), stone);
  front(G, ox, 3.4, 0.55, lam("kpRathausSign", () => ({ map: signTex("RATHAUS", "#e0d6c2", "#5a2a20", 1024, 170) })), GATE.x, GATE.h + 0.4, TZ - 0.32, false);
  b.add(boxGeo(V(ox + GATE.x - gw, 0, TZ), V(ox + GATE.x - gw + 0.05, GATE.h, TZ + 7)), M("kpPassW", "#b9a68a")); b.add(boxGeo(V(ox + GATE.x + gw - 0.05, 0, TZ), V(ox + GATE.x + gw, GATE.h, TZ + 7)), M("kpPassW", "#b9a68a"));
  b.add(boxGeo(V(ox + GATE.x - gw, GATE.h - 0.05, TZ), V(ox + GATE.x + gw, GATE.h, TZ + 7), 0, true), M("kpPassC", "#a8957a"));
  b.add(boxGeo(V(ox + GATE.x - gw, 0, TZ + 7), V(ox + GATE.x + gw, GATE.h, TZ + 7.3)), M("kpCourt", "#c9b896"));
  front(G, ox, 1.4, 2.4, M("kpCourtDoor", "#4a3226"), GATE.x, 1.2, TZ + 6.98);
  { const st = new THREE.Mesh(boxGeo(V(-gw, 0, 0), V(gw, 0.04, 7), 1.5), lam("kpPassFloor", () => ({ map: repK(stoneHD("kpPaveT", ["#c8beac", "#bdb29f", "#d0c6b4", "#b6ab98"], "#9a8f80"), 1, 2) }))); st.position.set(ox + GATE.x, 0, TZ); st.receiveShadow = true; G.add(st); }
  // windows: tall pointed lancets in white stone frames, lit warm inside on the upper floors
  const lancet = (x: number, y: number, w: number, h: number, lit: boolean) => {
    const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h - w * 0.55); sh.quadraticCurveTo(w / 2, h - w * 0.1, 0, h); sh.quadraticCurveTo(-w / 2, h - w * 0.1, -w / 2, h - w * 0.55); sh.closePath();
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(sh), stone); fr.scale.set(1.25, 1.12, 1); fr.rotation.y = Math.PI; fr.position.set(ox + x, y - 0.12, TZ - 0.03); G.add(fr);
    const gl = new THREE.Mesh(new THREE.ShapeGeometry(sh), lit ? winLit(1.15) : glass()); gl.rotation.y = Math.PI; gl.position.set(ox + x, y, TZ - 0.05); G.add(gl);
    const mu = new THREE.Mesh(new THREE.PlaneGeometry(0.05, h * 0.9), iron); mu.rotation.y = Math.PI; mu.position.set(ox + x, y + h * 0.45, TZ - 0.06); G.add(mu);
    const mu2 = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.05), iron); mu2.rotation.y = Math.PI; mu2.position.set(ox + x, y + h * 0.45, TZ - 0.06); G.add(mu2); };
  for (const x of [-13, -10.6, -4.4, 4.4, 7.2, 10, 12.8]) { if (Math.abs(x - TOWER_X) < 2.4) continue; lancet(x, 1.5, 1.1, 2.4, false); lancet(x, 5.1, 1.1, 2.5, x > 0); lancet(x, 8.5, 1.0, 2.2, x < 0); }
  for (const x of [-2.4, 2.4]) { lancet(x, 5.1, 0.9, 2.5, true); lancet(x, 8.5, 0.9, 2.2, false); }
  // stepped gables over the front, three of them
  const stepGable = (cx: number, w: number, steps: number, sh: number) => { for (let k = 0; k < steps; k++) { const ww = w * (1 - k / steps); b.add(boxGeo(V(ox + cx - ww / 2, H + k * sh, TZ), V(ox + cx + ww / 2, H + (k + 1) * sh, TZ + 1.0), 2), brick); b.add(boxGeo(V(ox + cx - ww / 2 - 0.1, H + (k + 1) * sh - 0.12, TZ - 0.1), V(ox + cx + ww / 2 + 0.1, H + (k + 1) * sh, TZ + 1.05)), stone); } };
  stepGable(0, 8, 5, 1.0); stepGable(11, 6, 4, 0.9);
  { const roof = lam("kpHallRoof", () => ({ map: roofHD("#6a3a30") })), rg = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(6, 5.5), new THREE.Vector2(12, 0)]), { depth: X1 - X0, bevelEnabled: false }); rg.rotateY(-Math.PI / 2); rg.translate(ox + X1, H, TZ + 0.5); b.add(rg, roof); }
  // the tower: brick shaft, a clock on each face, a copper-green spire
  { const tw = 4.4, tx = TOWER_X, th = 24, copper = M("kpCopper", "#5a9a82");
    b.add(boxGeo(V(ox + tx - tw / 2, 0, TZ - 0.6), V(ox + tx + tw / 2, th, TZ + tw - 0.6), 2), brick);
    for (const y of [4.5, 8.0, 12, 18, th - 0.3]) b.add(boxGeo(V(ox + tx - tw / 2 - 0.08, y, TZ - 0.72), V(ox + tx + tw / 2 + 0.08, y + 0.3, TZ + tw - 0.5)), stone);
    for (const y of [9.5, 13.6]) lancet(tx, y, 1.0, 2.4, false);
    { const ck = new THREE.Mesh(new THREE.CircleGeometry(1.25, 32), lam("kpHallClock", () => ({ map: clockTex("kpHallClockT") }))); ck.rotation.y = Math.PI; ck.position.set(ox + tx, 20.2, TZ - 0.66); G.add(ck); }
    b.add(new THREE.ConeGeometry(tw * 0.78, 9, 4).rotateY(Math.PI / 4).translate(ox + tx, th + 4.5, TZ + tw / 2 - 0.6), copper);
    b.add(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6).translate(ox + tx, th + 10, TZ + tw / 2 - 0.6), M("kpGilt", "#e8c45a")); b.add(new THREE.SphereGeometry(0.22, 10, 8).translate(ox + tx, th + 9.2, TZ + tw / 2 - 0.6), M("kpGilt", "#e8c45a")); }
  // two steps up to the gate
  for (let k = 0; k < 2; k++) b.add(boxGeo(V(ox + GATE.x - gw - 0.6 + k * 0.2, 0.12 + k * 0.12, TZ - 1.1 + k * 0.4), V(ox + GATE.x + gw + 0.6 - k * 0.2, 0.24 + k * 0.12, TZ)), stone);
  // the board of offices beside the gate (screen left of it), and a lamp bracket over it
  { const bd = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.4), new THREE.MeshLambertMaterial({ map: boardTex() })); bd.rotation.y = Math.PI; bd.position.set(ox + BOARD[0], BOARD[1], BOARD[2] - 0.12); bd.receiveShadow = true; G.add(bd);
    b.add(boxGeo(V(ox + BOARD[0] - 0.56, BOARD[1] - 0.76, BOARD[2] - 0.04), V(ox + BOARD[0] + 0.56, BOARD[1] + 0.76, BOARD[2] + 0.02)), stone); }
  // ---- the rest of the square: houses on three sides, lamps, lindens, a pump, benches, a cab with its horse missing ----
  const side = (x: number, z: number, yaw: number, w: number, h: number, col: string, key: string) => { const g = new THREE.Group(), fac = lam("kpSqF" + key, () => ({ map: facadeHD("kpSq" + key, w, h, { wall: col, shutter: "#4a5a4a", door: true }) }));
    const bx = new THREE.Mesh(boxGeo(V(-w / 2, 0, 0), V(w / 2, h, 10)), M("kpSqH" + key, col)); g.add(bx); const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), fac); f.rotation.y = Math.PI; f.position.set(0, h / 2, -0.02); g.add(f);
    const rg = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-0.2, 0), new THREE.Vector2(2.4, 2.4), new THREE.Vector2(7.6, 2.4), new THREE.Vector2(10.2, 0)]), { depth: w, bevelEnabled: false }); rg.rotateY(-Math.PI / 2); rg.translate(w / 2, h, -0.2); g.add(new THREE.Mesh(rg, lam("kpSlate", () => ({ map: roofHD("#5a5e6a", true) }))));
    g.position.set(ox + x, 0, z); g.rotation.y = yaw; shadowAll(g); G.add(g); };
  side(25, TZ - 2, 0, 9, 13, "#d9c9a8", "1"); side(-25, TZ - 2, 0, 9, 12, "#cdbfa5", "2"); side(35, -4, Math.PI / 2, 12, 12, "#d6cbb5", "3"); side(-35, -4, -Math.PI / 2, 12, 13, "#c9b896", "4");
  for (const [x, w, col] of [[-16, 12, "#d0c4aa"], [0, 14, "#d9ceb8"], [16, 12, "#c9bb9a"]] as [number, number, string][]) side(x, -30, Math.PI, w, 13, col, "b" + x);
  for (const [x, z] of [[-8.5, 7], [8.5, 7], [-8.5, -6], [8.5, -6]]) gasLamp(b, G, ox + x, z, iron, false);
  for (const [x, z] of [[-14, 3], [14, 3], [-18, -12], [18, -12]]) linden(leaves, b, bark, ox + x, z, 9.5, x + z);
  { b.add(new THREE.CylinderGeometry(0.22, 0.3, 1.6, 10).translate(ox + 6.5, 0.8, 1.5), M("kpPump", "#3a5a4a")); b.add(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6).rotateZ(Math.PI / 2).translate(ox + 6.35, 1.3, 1.5), iron); b.add(new THREE.CylinderGeometry(0.7, 0.6, 0.45, 16).translate(ox + 6.5, 0.22, 1.0), M("kpTrough", "#8a8478")); }
  for (const x of [-11, 11]) { b.add(boxGeo(V(ox + x - 0.9, 0.42, 4.0), V(ox + x + 0.9, 0.5, 4.4)), wood); for (const dx of [-0.8, 0.8]) b.add(boxGeo(V(ox + x + dx - 0.04, 0, 4.05), V(ox + x + dx + 0.04, 0.42, 4.35)), iron); }
  b.build(G, true);
  // the gate: two iron leaves hinged at the jambs; the world swings them open (rotation.y) into the passage
  const gateLeaves: THREE.Group[] = [];
  for (const sx of [1, -1]) { const lg = new THREE.Group(), lb2 = new Batch(), hgt = GATE.h - 0.25, len = gw - 0.02;
    for (const y of [0.15, hgt / 2, hgt - 0.1]) lb2.add(boxGeo(V(-0.04 + (sx > 0 ? -len : 0), y - 0.05, -0.04), V(0.04 + (sx > 0 ? 0 : len), y + 0.05, 0.04)), iron);
    for (let k = 0; k <= 9; k++) { const x = (sx > 0 ? -1 : 1) * (len * k) / 9; lb2.add(new THREE.CylinderGeometry(0.025, 0.025, hgt, 6).translate(x, hgt / 2 + 0.05, 0), iron); lb2.add(new THREE.ConeGeometry(0.05, 0.16, 6).translate(x, hgt + 0.13, 0), M("kpGilt", "#e8c45a")); }
    lb2.build(lg, true); lg.position.set(ox + GATE.x + sx * gw, 0.24, TZ + 0.25); G.add(lg); gateLeaves.push(lg); }
  { const lv = new THREE.Mesh(mergeFacets(leaves), lam("kpLeavesA", () => ({ color: "#8a8a3a", vertexColors: true, flatShading: true }))); lv.castShadow = true; lv.receiveShadow = true; G.add(lv); }
  const skies = { day: sky(G, "day", ox, 300, 1600, 700, -40) };
  const dust = dustMotes(V(ox, 2.2, 4), V(18, 4, 8), 200, new THREE.Color(1.0, 0.9, 0.75), 0.03, 0.4); G.add(dust.points);
  noInk(G);
  return { group: G, leaves: gateLeaves, skies, dust, drift: (t) => dust.drift(t) };
}

// =====================================================================================================================
export type Dressing = "junk" | "pub" | "office" | "palace" | "lux";
export type RoomSet = { group: THREE.Group; dress: Record<Dressing, THREE.Group>; lamps: Record<Dressing, THREE.PointLight[]>; view: THREE.MeshBasicMaterial; cashbox: THREE.Group; lid: THREE.Mesh;
  receipt: THREE.Mesh; sacks: THREE.Group[]; bills: THREE.Group; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildRoom(): RoomSet {
  const G = new THREE.Group(), ox = SET.room[0], b = new Batch(), { w: W, z0: Z0, z1: Z1, h: Hh } = ROOM;
  const floor = lam("kpRmFloor", () => ({ map: planksHD(), color: "#8a6a4e" })), plaster = M("kpRmCeil", "#d9d2c2"), oak = lam("kpOak", () => ({ map: planksHD(), color: "#6a4630" })), dark = M("kpRmDark", "#2e2622");
  b.add(boxGeo(V(ox - W - 0.3, -0.3, Z0 - 0.3), V(ox + W + 0.3, 0, Z1 + 0.3), 2.5), floor); b.add(boxGeo(V(ox - W - 0.3, Hh, Z0 - 0.3), V(ox + W + 0.3, Hh + 0.25, Z1 + 0.3), 0, true), plaster);
  b.build(G, true);
  const dress = { junk: new THREE.Group(), pub: new THREE.Group(), office: new THREE.Group(), palace: new THREE.Group(), lux: new THREE.Group() } as Record<Dressing, THREE.Group>;
  for (const g of Object.values(dress)) G.add(g);
  const lamps = { junk: [], pub: [], office: [], palace: [], lux: [] } as Record<Dressing, THREE.PointLight[]>;
  /** walls for one dressing: back (+z), the +x side (screen left), the -x side with a window (screen right), the front (-z, behind the cameras) */
  const walls = (d: Dressing, paper: THREE.Material, dado: THREE.Material, win: boolean) => { const wb = new Batch(), g = dress[d];
    wb.add(boxGeo(V(ox - W - 0.3, 1.1, Z1), V(ox + W + 0.3, Hh, Z1 + 0.3)), paper); wb.add(boxGeo(V(ox - W - 0.3, 0, Z1 - 0.04), V(ox + W + 0.3, 1.1, Z1 + 0.3)), dado);
    wb.add(boxGeo(V(ox + W, 0, Z0), V(ox + W + 0.3, Hh, Z1)), paper); wb.add(boxGeo(V(ox - W, 0, Z0 - 0.3), V(ox + W, Hh, Z0)), paper);
    if (win) { for (const [y0, y1, za, zb] of [[0, 1.0, Z0, Z1], [2.5, Hh, Z0, Z1], [1.0, 2.5, Z0, -0.7], [1.0, 2.5, 1.0, Z1]]) wb.add(boxGeo(V(ox - W - 0.3, y0, za), V(ox - W, y1, zb)), paper);
      for (const z of [-0.7, 0.15, 1.0]) wb.add(boxGeo(V(ox - W - 0.22, 1.0, z - 0.04), V(ox - W - 0.04, 2.5, z + 0.04)), dark); wb.add(boxGeo(V(ox - W - 0.22, 1.72, -0.7), V(ox - W - 0.04, 1.78, 1.0)), dark); }
    else wb.add(boxGeo(V(ox - W - 0.3, 0, Z0), V(ox - W, Hh, Z1)), paper);
    wb.build(g, true); };
  const view = new THREE.MeshBasicMaterial({ map: caSkyTex("day"), color: new THREE.Color(1.05, 1.05, 1.1), fog: false });
  const winView = (d: Dressing) => { const v = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.7), view); v.rotation.y = Math.PI / 2; v.position.set(ox - W - 0.6, 1.75, 0.15); dress[d].add(v);
    const pl = new THREE.PointLight("#fff2dc", 6, 10, 1.2); pl.position.set(ox - W + 0.6, 2.0, 0.15); dress[d].add(pl); lamps[d].push(pl); };
  const hanging = (d: Dressing, x: number, z: number, col: string, k: number) => { const hb = new Batch(); hb.add(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 4).translate(ox + x, Hh - 0.4, z), dark); hb.add(new THREE.CylinderGeometry(0.2, 0.32, 0.16, 14).translate(ox + x, Hh - 0.86, z), M("kpShade" + col, col)); hb.build(dress[d], true);
    flame(dress[d], V(ox + x, Hh - 0.9, z), 0.04); const pl = new THREE.PointLight("#ffb860", k, 10, 1.3); pl.position.set(ox + x, Hh - 1.05, z - 0.1); dress[d].add(pl); lamps[d].push(pl);
    const cone = lightCone(1.0, 1.8, new THREE.Color(1.0, 0.8, 0.5), 0.18); cone.position.set(ox + x, Hh - 0.92, z); dress[d].add(cone); };
  const desk = (d: Dressing, top: THREE.Material) => { const db = new Batch();
    db.add(boxGeo(V(ox + DESK.x - DESK.hw, DESK.y - 0.07, DESK.z - DESK.hd), V(ox + DESK.x + DESK.hw, DESK.y, DESK.z + DESK.hd), 1.5, true), top);
    for (const sx of [-1, 1]) db.add(boxGeo(V(ox + DESK.x + sx * (DESK.hw - 0.32) - 0.3, 0, DESK.z - DESK.hd + 0.06), V(ox + DESK.x + sx * (DESK.hw - 0.32) + 0.3, DESK.y - 0.07, DESK.z + DESK.hd - 0.06), 1.5), top);
    db.build(dress[d], true); };
  const pic = (d: Dressing, tex: () => THREE.Texture, key: string, x: number, y: number, w: number, h: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam(key, () => ({ map: tex() }))); m.rotation.y = Math.PI; m.position.set(ox + x, y, Z1 - 0.05); dress[d].add(m); return m; };

  // ---- junk shop: shelves of helmets and boots, coats on a rail, a sword on the wall, the counter ----
  { const d = "junk" as Dressing, jb = new Batch(); walls(d, lam("kpJunkPaper", () => ({ map: repK(wallpaperTex(), 4, 1.4), color: "#a89878" })), lam("kpJunkPanel", () => ({ map: repK(panelTex(), 5, 1), color: "#8a7458" })), true); winView(d); hanging(d, 0.6, 0.6, "#4a5a44", 7);
    jb.add(boxGeo(V(ox - 4.3, 0, Z1 - 0.5), V(ox - 1.2, 2.8, Z1 - 0.06)), oak);
    for (let y = 0.5; y < 2.7; y += 0.62) { jb.add(boxGeo(V(ox - 4.2, y, Z1 - 0.56), V(ox - 1.3, y + 0.04, Z1 - 0.1)), dark);
      for (let k = 0; k < 5; k++) { const x = -4.0 + k * 0.58, key = (k + Math.round(y * 3)) % 4;
        if (key === 0) { jb.add(new THREE.SphereGeometry(0.17, 12, 8, 0, 6.3, 0, Math.PI / 2).translate(ox + x, y + 0.05, Z1 - 0.3), M("kpHelm", "#1d1b22")); jb.add(new THREE.ConeGeometry(0.03, 0.12, 6).translate(ox + x, y + 0.27, Z1 - 0.3), M("kpBrass", "#e8c45a")); }
        else if (key === 1) jb.add(boxGeo(V(ox + x - 0.18, y + 0.04, Z1 - 0.45), V(ox + x + 0.18, y + 0.34, Z1 - 0.2)), M("kpBoot", "#3a2a22"));
        else if (key === 2) jb.add(new THREE.CylinderGeometry(0.12, 0.14, 0.22, 10).translate(ox + x, y + 0.15, Z1 - 0.3), M("kpJar", "#7a8a8a"));
        else jb.add(boxGeo(V(ox + x - 0.2, y + 0.04, Z1 - 0.45), V(ox + x + 0.2, y + 0.18, Z1 - 0.15)), M("kpFold" + key, ["#26304a", "#5a4a3a", "#6a3a3a"][k % 3])); } }
    // a rail of coats (screen left), a sword and a cap on the back wall, a mannequin in a guardsman's coat
    jb.add(boxGeo(V(ox + 1.4, 2.1, Z1 - 0.45), V(ox + 4.2, 2.16, Z1 - 0.39)), M("kpRail", "#8a8e96"));
    ["#26304a", "#5a4a3a", "#3a4a3a", "#6a3a3a", "#2b3a63"].forEach((c, i) => jb.add(new THREE.CylinderGeometry(0.2, 0.3, 1.2, 10).translate(ox + 1.7 + i * 0.6, 1.45, Z1 - 0.42), M("kpCoatJ" + i, c)));
    jb.add(boxGeo(V(ox - 0.6, 2.25, Z1 - 0.08), V(ox + 0.8, 2.29, Z1 - 0.04)), M("kpBlade", "#c9ccd2")); jb.add(boxGeo(V(ox + 0.8, 2.21, Z1 - 0.09), V(ox + 1.0, 2.33, Z1 - 0.04)), M("kpBrass", "#e8c45a"));
    // the counter (posable goods are added by the world: coat, cap, sword with price tags)
    jb.add(boxGeo(V(ox + COUNTER.x - COUNTER.hw, 0, COUNTER.z - COUNTER.hd), V(ox + COUNTER.x + COUNTER.hw, COUNTER.y, COUNTER.z + COUNTER.hd), 1.5, true), oak);
    jb.add(boxGeo(V(ox + COUNTER.x - COUNTER.hw - 0.04, COUNTER.y, COUNTER.z - COUNTER.hd - 0.04), V(ox + COUNTER.x + COUNTER.hw + 0.04, COUNTER.y + 0.05, COUNTER.z + COUNTER.hd + 0.04)), dark);
    // goods on the counter: the greatcoat folded, the peaked cap, the sword, each with a price tag
    jb.add(boxGeo(V(ox + COUNTER.x + 0.5, COUNTER.y + 0.05, COUNTER.z - 0.25), V(ox + COUNTER.x + 1.3, COUNTER.y + 0.2, COUNTER.z + 0.25)), M("kpCoatF", "#26304a"));
    jb.add(new THREE.CylinderGeometry(0.2, 0.17, 0.12, 16).translate(ox + COUNTER.x - 0.2, COUNTER.y + 0.11, COUNTER.z), M("kpCapF", "#26304a")); jb.add(new THREE.CylinderGeometry(0.175, 0.175, 0.05, 16).translate(ox + COUNTER.x - 0.2, COUNTER.y + 0.08, COUNTER.z), M("kpCapB", "#c0353a"));
    jb.add(boxGeo(V(ox + COUNTER.x - 1.4, COUNTER.y + 0.05, COUNTER.z - 0.05), V(ox + COUNTER.x - 0.5, COUNTER.y + 0.09, COUNTER.z + 0.03)), M("kpBlade", "#c9ccd2"));
    jb.build(dress[d], true);
    for (const [x, t] of [[0.9, "8 M"], [-0.2, "2 M"], [-1.0, "3 M"]] as [number, string][]) { const tg = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.17), lam("kpTag" + t, () => ({ map: labelTex(t, "#f3ecd8", "rgba(30,20,20,0.9)", 1) }))); tg.rotation.set(-0.45, Math.PI, 0); tg.position.set(ox + COUNTER.x + x, COUNTER.y + 0.27, COUNTER.z - 0.34); dress[d].add(tg); } }

  // ---- beer hall: dark panelling, a bar with taps and barrels, the long table and benches, antlers, hanging lamps ----
  { const d = "pub" as Dressing, pb = new Batch(); walls(d, lam("kpPubWall", () => ({ map: repK(panelTex(), 5, 1.6), color: "#7a5a3e" })), lam("kpPubDado", () => ({ map: repK(panelTex(), 5, 1), color: "#5a3e2a" })), false);
    hanging(d, 1.2, 0.3, "#7a4a2a", 9); hanging(d, -1.4, 0.3, "#7a4a2a", 9);
    pb.add(boxGeo(V(ox - 4.2, 0, Z1 - 1.0), V(ox - 1.4, 1.1, Z1 - 0.4), 1.2), oak); pb.add(boxGeo(V(ox - 4.25, 1.1, Z1 - 1.05), V(ox - 1.35, 1.16, Z1 - 0.35)), dark);
    for (const x of [-3.6, -3.0, -2.4]) { pb.add(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 6).translate(ox + x, 1.33, Z1 - 0.7), M("kpTap", "#c9a23a")); pb.add(new THREE.SphereGeometry(0.05, 8, 6).translate(ox + x, 1.52, Z1 - 0.7), M("kpTap", "#c9a23a")); }
    for (const [x, y] of [[-3.8, 1.75], [-3.0, 1.75], [-2.2, 1.75]]) { pb.add(new THREE.CylinderGeometry(0.34, 0.34, 0.7, 14).rotateX(Math.PI / 2).translate(ox + x, y, Z1 - 0.35), oak); pb.add(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 14).rotateX(Math.PI / 2).translate(ox + x, y, Z1 - 0.72), dark); }
    // the long table across the room, benches front and back
    pb.add(boxGeo(V(ox + TABLE.x - TABLE.hw, TABLE.y - 0.07, TABLE.z - TABLE.hd), V(ox + TABLE.x + TABLE.hw, TABLE.y, TABLE.z + TABLE.hd), 1.5, true), oak);
    for (const sx of [-1, 1]) pb.add(boxGeo(V(ox + TABLE.x + sx * (TABLE.hw - 0.3) - 0.06, 0, TABLE.z - 0.3), V(ox + TABLE.x + sx * (TABLE.hw - 0.3) + 0.06, TABLE.y - 0.07, TABLE.z + 0.3)), oak);
    pb.add(boxGeo(V(ox + TABLE.x - TABLE.hw, 0.42, TABLE.z + TABLE.hd + 0.25), V(ox + TABLE.x + TABLE.hw, 0.48, TABLE.z + TABLE.hd + 0.6)), oak);
    // on the table: steins, plates of sausages, a bread basket (the posable steins are the ones in hands)
    for (const [x, k] of [[-1.6, 0], [-0.9, 1], [1.0, 0], [1.7, 1]] as [number, number][]) { pb.add(new THREE.CylinderGeometry(0.075, 0.075, 0.2, 12).translate(ox + x, TABLE.y + 0.1, TABLE.z + 0.15 * (k ? 1 : -1)), M("kpStein", "#c9c2b0")); pb.add(new THREE.CylinderGeometry(0.072, 0.072, 0.04, 12).translate(ox + x, TABLE.y + 0.21, TABLE.z + 0.15 * (k ? 1 : -1)), M("kpFoam", "#fbf6e8")); }
    for (const x of [-0.3, 0.6]) { pb.add(new THREE.CylinderGeometry(0.2, 0.17, 0.03, 16).translate(ox + x, TABLE.y + 0.015, TABLE.z), M("kpPlate", "#f3efe4")); for (let k = 0; k < 3; k++) pb.add(new THREE.CapsuleGeometry(0.03, 0.16, 4, 8).rotateZ(Math.PI / 2).rotateY(k * 0.5).translate(ox + x, TABLE.y + 0.06, TABLE.z - 0.05 + k * 0.05), M("kpWurst", "#b8643a")); }
    pb.add(boxGeo(V(ox - 0.1, 2.3, Z1 - 0.1), V(ox + 0.1, 2.5, Z1 - 0.04)), dark);
    for (const sx of [-1, 1]) pb.add(new THREE.CylinderGeometry(0.02, 0.03, 0.6, 5).rotateZ(sx * 0.9).translate(ox + sx * 0.22, 2.6, Z1 - 0.07), M("kpAntler", "#d9c8a8"));
    pb.build(dress[d], true);
    pic(d, () => flagTex(["#1d1b22", "#f3efe4", "#c0353a"], "reich"), "kpPubFlag", 2.6, 2.3, 1.1, 0.72);
    pic(d, kaiserPortraitTex, "kpPubKaiser", 1.2, 2.25, 0.6, 0.75); }

  // ---- the mayor's office (and the treasury): desk, the Kaiser on the wall, a safe, ledgers, a window ----
  { const d = "office" as Dressing, ob = new Batch(); walls(d, lam("kpOfPaper", () => ({ map: repK(wallpaperTex(), 4, 1.4), color: "#b9c2a8" })), lam("kpOfPanel", () => ({ map: repK(panelTex(), 5, 1) })), true); winView(d); hanging(d, 0.3, 0.4, "#3a5a44", 6);
    desk(d, oak);
    { const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.2), lam("kpRug", () => ({ map: carpetTex() }))); rug.rotation.x = -Math.PI / 2; rug.position.set(ox, 0.012, 0.4); rug.receiveShadow = true; dress[d].add(rug); }
    ob.add(boxGeo(V(ox + 2.6, 0, Z1 - 1.0), V(ox + 3.8, 1.5, Z1 - 0.06)), M("kpSafe", "#2e3a34")); ob.add(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 14).rotateX(Math.PI / 2).translate(ox + 3.2, 0.85, Z1 - 1.03), M("kpBrass", "#e8c45a"));
    ob.add(boxGeo(V(ox - 4.1, 0, Z1 - 0.5), V(ox - 2.3, 2.5, Z1 - 0.06)), oak); for (let y = 0.35; y < 2.4; y += 0.52) { ob.add(boxGeo(V(ox - 4.0, y, Z1 - 0.56), V(ox - 2.4, y + 0.04, Z1 - 0.1)), dark); for (let x = -3.95; x < -2.45; x += 0.13) ob.add(boxGeo(V(ox + x, y + 0.04, Z1 - 0.5), V(ox + x + 0.1, y + 0.34 + 0.08 * Math.sin(x * 37 + y * 9), Z1 - 0.2)), M("kpBook" + (Math.floor((x + 9) * 7.7 + y * 3) % 4), ["#5a2a26", "#2e4a3a", "#3a3a5a", "#6a5030"][Math.floor((x + 9) * 7.7 + y * 3) % 4])); }
    ob.add(boxGeo(V(ox + 0.55, DESK.y, DESK.z + 0.18), V(ox + 0.95, DESK.y + 0.16, DESK.z + 0.46)), M("kpLedgers", "#5a2a26")); ob.add(new THREE.CylinderGeometry(0.05, 0.06, 0.07, 10).translate(ox - 0.75, DESK.y + 0.035, DESK.z + 0.36), dark);
    // the mayor's chair behind the desk
    ob.add(boxGeo(V(ox - 0.35, 0.45, DESK.z + DESK.hd + 0.2), V(ox + 0.35, 0.52, DESK.z + DESK.hd + 0.7)), oak); ob.add(boxGeo(V(ox - 0.35, 0.52, DESK.z + DESK.hd + 0.62), V(ox + 0.35, 1.3, DESK.z + DESK.hd + 0.7)), M("kpLeather", "#5a2a26"));
    ob.build(dress[d], true);
    pic(d, kaiserPortraitTex, "kpOfKaiser", 0.3, 2.25, 0.8, 1.0);
    { const ck = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), lam("kpOfClock", () => ({ map: clockTex("kpOfClockT") }))); ck.rotation.y = Math.PI; ck.position.set(ox + 3.2, 2.3, Z1 - 0.06); dress[d].add(ck); } }

  // ---- the Kaiser's study: red damask, gilt, a big desk, the flag, his own portrait ----
  { const d = "palace" as Dressing, kb = new Batch(); walls(d, lam("kpPalWall", () => ({ map: repK(wallpaperTex(), 4, 1.4), color: "#b0424a" })), lam("kpPalDado", () => ({ map: repK(panelTex(), 5, 1), color: "#e8d8b0" })), true); winView(d);
    hanging(d, 0.0, 0.5, "#c9a23a", 7);
    desk(d, lam("kpPalDesk", () => ({ map: planksHD(), color: "#4a2a22" })));
    kb.add(boxGeo(V(ox - 0.45, 0.45, DESK.z + DESK.hd + 0.2), V(ox + 0.45, 0.55, DESK.z + DESK.hd + 0.75)), M("kpGilt", "#c9a23a")); kb.add(boxGeo(V(ox - 0.45, 0.55, DESK.z + DESK.hd + 0.65), V(ox + 0.45, 1.75, DESK.z + DESK.hd + 0.75)), M("kpThrone", "#8a1e28"));
    kb.add(new THREE.SphereGeometry(0.28, 16, 12).translate(ox + 3.3, 1.35, Z1 - 0.8), M("kpGlobe", "#c9b47a")); kb.add(new THREE.CylinderGeometry(0.05, 0.12, 1.05, 8).translate(ox + 3.3, 0.53, Z1 - 0.8), M("kpGilt", "#c9a23a"));
    for (const x of [-3.4, 3.4]) kb.add(boxGeo(V(ox + x - 0.5, 0, Z1 - 0.2), V(ox + x + 0.5, Hh, Z1 - 0.08)), lam("kpDrape", () => ({ map: curtainTex(false), color: "#a83038" })));
    kb.build(dress[d], true);
    pic(d, kaiserPortraitTex, "kpPalKaiser", 0, 2.35, 1.1, 1.4); pic(d, () => flagTex(["#1d1b22", "#f3efe4", "#c0353a"], "reich"), "kpPalFlag", -1.9, 2.4, 1.2, 0.8); }

  // ---- Luxembourg passport office: pale walls, the counter, the flag, a sign, a stamp and ink pad ----
  { const d = "lux" as Dressing, lb = new Batch(); walls(d, lam("kpLuxWall", () => ({ map: repK(wallpaperTex(), 4, 1.4), color: "#d9d6c2" })), lam("kpLuxDado", () => ({ map: repK(panelTex(), 5, 1), color: "#6a7a8a" })), true); winView(d);
    hanging(d, 0.4, 0.5, "#3a5a6a", 5);
    desk(d, lam("kpLuxDesk", () => ({ map: planksHD(), color: "#7a5a3e" })));
    lb.add(boxGeo(V(ox - 0.9, DESK.y, DESK.z + 0.1), V(ox - 0.6, DESK.y + 0.03, DESK.z + 0.3)), M("kpInk", "#2a3a6a")); lb.add(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 8).translate(ox - 0.4, DESK.y + 0.07, DESK.z + 0.2), M("kpStampH", "#5a3a2a"));
    lb.add(boxGeo(V(ox + 0.5, DESK.y, DESK.z + 0.15), V(ox + 1.0, DESK.y + 0.1, DESK.z + 0.45)), M("kpFiles", "#c9b47a"));
    lb.add(boxGeo(V(ox - 0.35, 0.45, DESK.z + DESK.hd + 0.2), V(ox + 0.35, 0.52, DESK.z + DESK.hd + 0.7)), oak); lb.add(boxGeo(V(ox - 0.35, 0.52, DESK.z + DESK.hd + 0.62), V(ox + 0.35, 1.3, DESK.z + DESK.hd + 0.7)), oak);
    lb.build(dress[d], true);
    pic(d, () => flagTex(["#e2333a", "#f6f3ea", "#5ab4e8"], "lux"), "kpLuxFlag", 2.4, 2.3, 1.3, 0.85);
    pic(d, () => signTex("PASSEPORTS", "#22303a", "#f3e2b0", 1024, 200), "kpLuxSign", -0.5, 2.55, 2.4, 0.48);
    { const ck = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), lam("kpLuxClock", () => ({ map: clockTex("kpLuxClockT") }))); ck.rotation.y = Math.PI; ck.position.set(ox - 2.8, 2.4, Z1 - 0.06); dress.lux.add(ck); } }

  // ---- posable: the town's cash box (lid opens), the receipt on the desk, two mail sacks, a stack of notes ----
  const cashbox = new THREE.Group(); { const body = new THREE.Mesh(boxGeo(V(-0.25, 0, -0.17), V(0.25, 0.2, 0.17), 0, true), M("kpCashBox", "#3a4a3a")); cashbox.add(body);
    const lid = new THREE.Mesh(boxGeo(V(-0.25, 0, -0.34), V(0.25, 0.04, 0), 0, true), M("kpCashLid", "#2e3a2e")); lid.position.set(0, 0.2, 0.17); cashbox.add(lid);
    const coins = new THREE.Mesh(boxGeo(V(-0.22, 0.12, -0.14), V(0.22, 0.17, 0.14)), M("kpCoins", "#e8c45a")); cashbox.add(coins);
    cashbox.position.set(ox + 0.35, DESK.y, DESK.z - 0.05); shadowAll(cashbox); cashbox.visible = false; G.add(cashbox); }
  const lid = cashbox.children[1] as THREE.Mesh;
  const receipt = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.45), new THREE.MeshLambertMaterial({ map: receiptTex() })); receipt.rotation.set(-Math.PI / 2, 0, Math.PI); receipt.position.set(ox - 0.35, DESK.y + 0.006, DESK.z - 0.15); receipt.receiveShadow = true; receipt.visible = false; G.add(receipt);
  const sacks: THREE.Group[] = []; for (let k = 0; k < 2; k++) { const s = new THREE.Group(), bag = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), M("kpSack", "#c9b48a")); bag.scale.set(1, 1.25, 0.85); bag.position.y = -0.24; s.add(bag);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.12, 8), M("kpSackN", "#a8946a")); neck.position.y = -0.02; s.add(neck);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.13), lam("kpSackTag", () => ({ map: labelTex("POST", "#e9d27a", "rgba(30,20,20,0.9)", 1) }))); tag.position.set(0, -0.22, -0.17); tag.rotation.y = Math.PI; s.add(tag);
    shadowAll(s); s.visible = false; G.add(s); sacks.push(s); }
  const bills = new THREE.Group(); { for (let k = 0; k < 4; k++) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.12), M("kpBills", "#b9c9a8")); st.position.set((k % 2) * 0.24 - 0.12, 0.025 + Math.floor(k / 2) * 0.05, 0); bills.add(st); } bills.position.set(ox - 0.35, DESK.y, DESK.z + 0.2); shadowAll(bills); bills.visible = false; G.add(bills); }
  const dust = dustMotes(V(ox, 1.6, 0.6), V(7, 2.6, 5), 220, new THREE.Color(1.0, 0.9, 0.7), 0.03, 0.5); G.add(dust.points);
  noInk(G);
  return { group: G, dress, lamps, view, cashbox, lid, receipt, sacks, bills, dust, drift: (t) => dust.drift(t) };
}
