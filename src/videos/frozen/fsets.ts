// The Frozen Graves Short: the six sets. Built to claude/background-and-character-look.md: every light has a source,
// two scales of texture on every surface, no ink on the sets (NOINK), every corner dressed, air in every scene.
//   buildGrave   the cemetery above Longyear City (snow or bare scree; the 1998 tent and dig; lanterns for 1918)
//   buildQuay    the coal quay, 1918: pier, the steamship Forsete, moving water with foam at every piling and the hull
//   buildWard    the company hospital at night: seven beds, seven candles, a hanging lamp, a stove
//   buildCut     the ground cut open: snow, the thawing layer, the frozen layer, the seven coffins end-on
//   buildAlaska  Brevig Mission, 1997: tundra, houses, a church, the mass grave under two crosses, a bush plane
//   buildLab     the pathology lab, 1997
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import { dustMotes, rockGeo, rockWall, rockTex, mergeFacets, lightCone, pineGeo } from "../bridge/scenery";
import { SET, CROSS_X, CROSS_Z, PIT, LID_Y, HILL_Z, hillY, TENT, PIER, SHORE_Z, SHIP, GANG, WARD, BED_X, BED_Z, CUT, MASS, APIT, LAB, BENCH_Y, SCOPE, SCREEN } from "./place";
import { snowTex, screeTex, earthTex, iceEarthTex, mudCutTex, tundraTex, skyTex, plateTex, canvasTex, radarTex, seqTex, parcelTex, flagTex, calTex, registerTex, boardTex, labWallTex, tileTex, foamTex, repeat } from "./fpaint";
import { glowTex, labelTex } from "./paint";

export const M = (key: string, col: string, extra: THREE.MeshLambertMaterialParameters = {}) => lam(key, () => ({ color: col, ...extra }));
const T = (key: string, tex: () => THREE.Texture, extra: THREE.MeshLambertMaterialParameters = {}) => lam(key, () => ({ map: tex(), ...extra }));
export const noInk = <O extends THREE.Object3D>(o: O) => { o.traverse((c) => { c.layers.set(NOINK); }); return o; };
type Put = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, cast?: boolean) => THREE.Mesh;
const putter = (G: THREE.Object3D, ox: number): Put => (g, m, x, y, z, cast = true) => { const ms = new THREE.Mesh(g, m); ms.position.set(ox + x, y, z); ms.castShadow = cast; ms.receiveShadow = true; G.add(ms); return ms; };
const shadowAll = <O extends THREE.Object3D>(o: O) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
const glow = (col: THREE.Color, s: number) => { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); h.scale.setScalar(s); return h; };
const flame = (G: THREE.Object3D, p: THREE.Vector3, s = 0.05) => { const f = new THREE.Mesh(new THREE.SphereGeometry(s, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 0.9), fog: false })); f.scale.y = 1.7; f.position.copy(p); G.add(f); const h = glow(new THREE.Color(1.4, 0.85, 0.35), s * 16); h.position.copy(p); G.add(h); return { f, h }; };
/** a ground sheet over x0..x1, z0..z1 following y(x, z), with UVs in metres / tile */
const sheet = (x0: number, x1: number, z0: number, z1: number, nx: number, nz: number, y: (x: number, z: number) => number, tile: number) => {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, y(x, z)); uv.setXY(i, x / tile, z / tile); }
  g.computeVertexNormals(); return g;
};
const nz = (x: number, z: number) => 0.06 * Math.sin(x * 1.7 + z * 0.9) + 0.04 * Math.sin(x * 3.1 - z * 2.3);
/** a backdrop sky that never lights or casts */
const skyPlane = (G: THREE.Object3D, kind: Parameters<typeof skyTex>[0], ox: number, z: number, w: number, h: number, y0: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: skyTex(kind), fog: false, depthWrite: false })); m.rotation.y = Math.PI; m.position.set(ox, y0 + h / 2, z); m.renderOrder = -5; G.add(m); return m; };
/** a faceted mountain face: each facet coloured between rock and snow by how much it faces up and how high it is
 *  (with a little noise), so snow lies in streaks and on ledges; quiet contrast, the fog does the rest */
const mountain = (G: THREE.Object3D, key: string, ox: number, y0: number, z: number, W: number, H: number, seed: number, lean: number, snowK: number, base = "#6e6258") => {
  const g = rockWall(W, H, Math.max(2.5, W / 34), W / 46, seed, 9, (u, v) => 0.5 + 0.5 * Math.sin(u * 7 + seed) * v), rot = new THREE.Matrix4().makeRotationX(-lean).premultiply(new THREE.Matrix4().makeRotationY(Math.PI));
  g.applyMatrix4(rot); g.translate(ox, y0, z);
  const p = g.attributes.position as THREE.BufferAttribute, col = g.attributes.color as THREE.BufferAttribute, a = V(0, 0, 0), b = V(0, 0, 0), c = V(0, 0, 0), n = V(0, 0, 0);
  const rock = new THREE.Color(base), rock2 = new THREE.Color(base).multiplyScalar(0.8), snow = new THREE.Color("#e2e8ef"), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) { a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2); n.crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize(); if (n.y < 0) n.negate();
    const hgt = ((a.y + b.y + c.y) / 3 - y0) / H, band = 0.5 + 0.5 * Math.sin(((a.y + b.y + c.y) / 3) * 0.55 + seed), k = THREE.MathUtils.smoothstep(n.y * 0.9 + 0.45 * hgt + 0.18 * band + 0.1 * Math.sin(a.x * 0.31), 1.0 - snowK, 1.25 - snowK);
    tmp.copy(band > 0.5 ? rock : rock2).lerp(snow, k).multiplyScalar(0.92 + 0.08 * col.getX(i)); for (let j = 0; j < 3; j++) col.setXYZ(i + j, tmp.r, tmp.g, tmp.b); }
  col.needsUpdate = true;
  const m = new THREE.Mesh(g, lam(key, () => ({ vertexColors: true, flatShading: true }))); m.receiveShadow = true; G.add(m);
  return { rock: m, snow: m };
};
/** a white-painted wooden cross, 1.15 m, with a name plate; faces -z */
const crossAt = (b: Batch, plates: THREE.Group, mat: THREE.Material, x: number, y: number, z: number, k: number, s = 1) => {
  b.add(boxGeo(V(x - 0.045 * s, y - 0.25, z - 0.045 * s), V(x + 0.045 * s, y + 1.15 * s, z + 0.045 * s)), mat);
  b.add(boxGeo(V(x - 0.32 * s, y + 0.78 * s, z - 0.04 * s), V(x + 0.32 * s, y + 0.87 * s, z + 0.04 * s)), mat);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.26 * s, 0.13 * s), lam("frPlateM" + k, () => ({ map: plateTex(k) }))); pl.rotation.y = Math.PI; pl.position.set(x, y + 0.6 * s, z - 0.05 * s); plates.add(pl);
};
/** a timber trestle of the old coal cableway: four splayed legs, braces, a head frame */
const trestle = (b: Batch, mat: THREE.Material, x: number, y: number, z: number, h: number) => {
  const leg = (dx: number, dz: number) => { const g = new THREE.BoxGeometry(0.22, h, 0.22), m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(dz * 0.08, 0, -dx * 0.08)); m.setPosition(x + dx * (0.9 + 0.0), y + h / 2, z + dz * 0.9); b.add(g, mat, m); };
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) leg(dx, dz);
  for (let k = 1; k < 5; k++) { const yy = y + (k * h) / 5, w = 1.25 - 0.09 * k; b.add(boxGeo(V(x - w, yy, z - w), V(x + w, yy + 0.16, z - w + 0.14)), mat); b.add(boxGeo(V(x - w, yy, z + w - 0.14), V(x + w, yy + 0.16, z + w)), mat); b.add(boxGeo(V(x - w, yy, z - w), V(x - w + 0.14, yy + 0.16, z + w)), mat); b.add(boxGeo(V(x + w - 0.14, yy, z - w), V(x + w, yy + 0.16, z + w)), mat); }
  b.add(boxGeo(V(x - 1.6, y + h, z - 0.3), V(x + 1.6, y + h + 0.35, z + 0.3)), mat);
};
/** a thin rod from a to b */
const rodGeo = (a: THREE.Vector3, c: THREE.Vector3, r: number) => { const d = c.clone().sub(a), g = new THREE.CylinderGeometry(r, r, d.length(), 6); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize())); g.translate((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2); return g; };
/** a gabled house: walls of colour col, a roof (snow on it if snowy), windows (lit or dark) */
const houseAt = (b: Batch, G: THREE.Object3D, x: number, z: number, w: number, d: number, h: number, col: string, roof: string, lit: boolean, yaw = 0, y0 = 0) => {
  const g = new THREE.Group(), wall = lam("frWall" + col, () => ({ map: planksHD(), color: col })), rf = M("frRoof" + roof, roof), win = new THREE.MeshBasicMaterial({ color: lit ? new THREE.Color(2.2, 1.6, 0.8) : new THREE.Color(0.18, 0.22, 0.3), fog: true });
  const bx = new THREE.Mesh(boxGeo(V(-w / 2, 0, -d / 2), V(w / 2, h, d / 2), 2), wall); g.add(bx);
  const sh = new THREE.Shape([new THREE.Vector2(-w / 2 - 0.25, h), new THREE.Vector2(0, h + w * 0.42), new THREE.Vector2(w / 2 + 0.25, h)]), rg = new THREE.ExtrudeGeometry(sh, { depth: d + 0.5, bevelEnabled: false }); rg.translate(0, 0, -d / 2 - 0.25);
  g.add(new THREE.Mesh(rg, rf));
  for (const sx of [-0.28, 0.28]) { const wm = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), win); wm.rotation.y = Math.PI; wm.position.set(sx * w, h * 0.55, -d / 2 - 0.01); g.add(wm); }
  const dr = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.8), M("frDoor", "#3a2a22")); dr.rotation.y = Math.PI; dr.position.set(0.05 * w, 0.9, -d / 2 - 0.012); g.add(dr);
  g.position.set(x, y0, z); g.rotation.y = yaw; shadowAll(g); G.add(g); void b; return g;
};

// =====================================================================================================================
export type GraveSet = { group: THREE.Group; snow: THREE.Group; bare: THREE.Group; lid: THREE.Group; pit: THREE.Group; tent: THREE.Group; lanterns: THREE.Group;
  lamps: THREE.PointLight[]; flood: THREE.PointLight; flakes: ReturnType<typeof dustMotes>; dust: ReturnType<typeof dustMotes>; skies: Record<"night" | "grey" | "twilight", THREE.Mesh>;
  coffins: THREE.Group; radar: THREE.Group; field: THREE.InstancedMesh; crosses: THREE.Group; fill: THREE.Mesh; drift: (t: number) => void };
export function buildGrave(): GraveSet {
  const G = new THREE.Group(), ox = SET.grave[0], put = putter(G, ox);
  const snow = new THREE.Group(), bare = new THREE.Group(), lid = new THREE.Group(), pit = new THREE.Group(), tent = new THREE.Group(), lanterns = new THREE.Group(), coffins = new THREE.Group();
  G.add(snow, bare, lid, pit, tent, lanterns);
  const snowM = T("frSnowM", () => snowTex()), screeM = T("frScreeM", () => screeTex()), earthM = T("frEarthM", () => earthTex()), white = M("frWhite", "#f2efe6"), wood = lam("frTrestle", () => ({ map: planksHD(), color: "#6a5242" })), dark = M("frDarkWood", "#4a3a30");
  // ---- the ground: terrace and hillside, in four strips round the pit (so the pit can open) ----
  const gy = (x: number, z: number) => hillY(z) + (z > HILL_Z ? 0.5 * Math.sin(x * 0.2 + z * 0.15) : 0) + nz(x, z) * (Math.abs(x) < 6 && z < 6 && z > -6 ? 0.4 : 1);
  const strips: [number, number, number, number][] = [[-60, PIT.x0, -40, 60], [PIT.x1, 60, -40, 60], [PIT.x0, PIT.x1, -40, PIT.z0], [PIT.x0, PIT.x1, PIT.z1, 60]];
  for (const [x0, x1, z0, z1] of strips) { const g = sheet(ox + x0, ox + x1, z0, z1, Math.max(2, Math.round((x1 - x0) / 0.8)), Math.max(2, Math.round((z1 - z0) / 0.8)), (x, z) => gy(x - ox, z), 2.4);
    for (const [grp, m, dy] of [[snow, snowM, 0.03], [bare, screeM, 0]] as [THREE.Group, THREE.Material, number][]) { const ms = new THREE.Mesh(g, m); ms.position.y = dy; ms.receiveShadow = true; grp.add(ms); } }
  // the lid: undug ground over the pit with seven low grave mounds (snow or stone-edged gravel)
  { const g = sheet(ox + PIT.x0, ox + PIT.x1, PIT.z0, PIT.z1, 12, 6, () => 0, 2.4); for (const [m, dy] of [[snowM, 0.03], [screeM, 0]] as [THREE.Material, number][]) { const ms = new THREE.Mesh(g, m); ms.position.y = dy; ms.receiveShadow = true; ms.userData.kind = m === snowM ? "snow" : "bare"; lid.add(ms); }
    for (const x of CROSS_X) for (const [m, k] of [[snowM, "snow"], [screeM, "bare"]] as [THREE.Material, string][]) { const md = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); md.scale.set(0.36, 0.16, 0.95); md.position.set(ox + x, 0.02, 1.95); md.receiveShadow = true; md.castShadow = true; md.userData.kind = k; lid.add(md); } }
  // the pit: earth walls, a floor, the seven coffin lids less than a metre down, a ladder, spoil heaps either side
  { const b = new Batch(), { x0, x1, z0, z1, d } = PIT;
    b.add(boxGeo(V(ox + x0 - 0.3, -d - 0.3, z0 - 0.3), V(ox + x1 + 0.3, -d, z1 + 0.3)), earthM);
    b.add(boxGeo(V(ox + x0 - 0.3, -d, z1), V(ox + x1 + 0.3, 0.001, z1 + 0.3), 1.2), earthM); b.add(boxGeo(V(ox + x0 - 0.3, -d, z0 - 0.3), V(ox + x1 + 0.3, 0.001, z0), 1.2), earthM);
    b.add(boxGeo(V(ox + x0 - 0.3, -d, z0), V(ox + x0, 0.001, z1), 1.2), earthM); b.add(boxGeo(V(ox + x1, -d, z0), V(ox + x1 + 0.3, 0.001, z1), 1.2), earthM);
    b.build(pit, true);
    const cw = M("frCoffin", "#5a4436"); for (const x of CROSS_X) { const c = new THREE.Mesh(boxGeo(V(-0.25, -0.34, -0.92), V(0.25, 0, 0.92), 0.6), cw); c.position.set(ox + x, LID_Y, 1.95); c.castShadow = true; c.receiveShadow = true; coffins.add(c);
      for (const zz of [-0.5, 0.5]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 0.06), M("frCoffinBand", "#3a2c24")); s.position.set(ox + x, LID_Y + 0.005, 1.95 + zz); coffins.add(s); } }
    pit.add(coffins);
    { const fm = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), earthM); fm.rotation.x = -Math.PI / 2; fm.position.set(ox + (x0 + x1) / 2, -0.5, (z0 + z1) / 2); fm.receiveShadow = true; fm.name = "fill"; pit.add(fm); }
    for (const sx of [-1, 1]) { const h = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), earthM); h.scale.set(1.1, 0.55, 1.5); h.position.set(ox + sx * 4.6, 0, 2.0); h.castShadow = true; h.receiveShadow = true; pit.add(h); }
    const lad = new THREE.Group(), lw = M("frLadder", "#b08a54"); for (const sx of [-0.2, 0.2]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 0.05), lw); r.position.set(sx, 0.55, 0); lad.add(r); } for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.035, 0.05), lw); s.position.set(0, -0.2 + k * 0.32, 0); lad.add(s); }
    lad.rotation.x = 0.3; lad.position.set(ox + 2.9, -0.4, 0.98); shadowAll(lad); pit.add(lad); }
  // ---- the seven white crosses (and older, darker ones in the rows below) ----
  const crosses = new THREE.Group(), plates = new THREE.Group(); G.add(crosses); crosses.add(plates);
  { const cb = new Batch(); CROSS_X.forEach((x, k) => crossAt(cb, plates, white, ox + x, 0, CROSS_Z, k)); cb.build(crosses, true); }
  { const b = new Batch();
    for (const [zr, xs] of [[-1.7, [3.6, 2.3, -3.6]], [-3.7, [2.9, -4.4]]] as [number, number[]][]) for (const x of xs) { b.add(boxGeo(V(ox + x - 0.035, -0.2, zr - 0.035), V(ox + x + 0.035, 0.85, zr + 0.035)), dark); b.add(boxGeo(V(ox + x - 0.24, 0.58, zr - 0.03), V(ox + x + 0.24, 0.65, zr + 0.03)), dark); }
    // the picket fence round the cemetery, a gate at the front
    for (let x = -5.6; x <= 5.6; x += 0.32) { if (Math.abs(x) < 0.7) continue; b.add(boxGeo(V(ox + x - 0.035, 0, -5.6), V(ox + x + 0.035, 0.85 + 0.05 * Math.sin(x * 9), -5.55)), white); b.add(boxGeo(V(ox + x - 0.035, 0, 6.2), V(ox + x + 0.035, 0.85, 6.25)), white); }
    for (let z = -5.6; z <= 6.2; z += 0.32) for (const sx of [-1, 1]) b.add(boxGeo(V(ox + sx * 5.62 - 0.03, hillY(z), z - 0.035), V(ox + sx * 5.62 + 0.03, hillY(z) + 0.85, z + 0.035)), white);
    for (const y of [0.25, 0.65]) { b.add(boxGeo(V(ox - 5.6, y, -5.62), V(ox - 0.7, y + 0.07, -5.58)), white); b.add(boxGeo(V(ox + 0.7, y, -5.62), V(ox + 5.6, y + 0.07, -5.58)), white); b.add(boxGeo(V(ox - 5.6, y, 6.18), V(ox + 5.6, y + 0.07, 6.22)), white); }
    for (const sx of [-1, 1]) b.add(boxGeo(V(ox + sx * 0.75 - 0.07, 0, -5.67), V(ox + sx * 0.75 + 0.07, 1.25, -5.53)), white);
    // the old coal cableway climbing the slope on the left (+x): three trestles and the cables between them
    const tr: [number, number, number][] = [[12, 14, 8], [13.5, 26, 9], [15, 38, 10]]; for (const [x, z, h] of tr) trestle(b, wood, ox + x, hillY(z) - 0.2, z, h);
    for (let k = 0; k < tr.length - 1; k++) for (const dz of [-0.25, 0.25]) { const [xa, za, ha] = tr[k], [xb, zb, hb] = tr[k + 1]; b.add(rodGeo(V(ox + xa + 1.4, hillY(za) + ha + 0.2, za + dz), V(ox + xb + 1.4, hillY(zb) + hb + 0.2, zb + dz), 0.03), dark); }
    { const [xa, za, ha] = tr[0]; for (const dz of [-0.25, 0.25]) b.add(rodGeo(V(ox + xa + 1.4, hillY(za) + ha + 0.2, za + dz), V(ox + xa - 2, -6, -30 + dz), 0.03), dark); }
    b.build(G, true); }
  // ---- named lights: two lanterns on poles (1918), the floodlight in the tent (1998) ----
  const lamps: THREE.PointLight[] = [];
  for (const [x, z] of [[3.9, 0.6], [-3.6, 1.2]]) { const pole = put(new THREE.CylinderGeometry(0.04, 0.05, 1.7, 8), dark, x, 0.85, z); lanterns.add(pole); G.remove(pole);
    const box = put(new THREE.BoxGeometry(0.2, 0.28, 0.2), M("frLantern", "#2a2a2e"), x, 1.84, z); lanterns.add(box); G.remove(box);
    const fl = flame(lanterns, V(ox + x, 1.84, z), 0.045); void fl; const pl = new THREE.PointLight("#ffb860", 7, 11, 1.4); pl.position.set(ox + x, 1.9, z); pl.castShadow = false; lanterns.add(pl); lamps.push(pl);
    const cone = lightCone(1.3, 1.8, new THREE.Color(1.0, 0.75, 0.4), 0.22); cone.position.set(ox + x, 1.86, z); lanterns.add(cone); }
  // ---- the 1998 tent over the graves: an aluminium frame, canvas roof, back and sides; the front open ----
  const flood = new THREE.PointLight("#e8f0ff", 0, 12, 1.2);
  { const b = new Batch(), al = M("frAlu", "#b9bcc2"), cv = T("frCanvasM", () => canvasTex(), { side: THREE.DoubleSide, color: "#7d8a62" }), { x0, x1, z0, z1, eave, ridge } = TENT;
    for (const x of [x0, 0, x1]) for (const z of [z0, z1]) { if (x === 0 && z === z0) continue; b.add(boxGeo(V(ox + x - 0.04, 0, z - 0.04), V(ox + x + 0.04, x === 0 ? ridge : eave, z + 0.04)), al); }
    for (const z of [z0, z1]) { b.add(rodGeo(V(ox + x0, eave, z), V(ox, ridge, z), 0.035), al); b.add(rodGeo(V(ox, ridge, z), V(ox + x1, eave, z), 0.035), al); }
    b.add(rodGeo(V(ox, ridge, z0), V(ox, ridge, z1), 0.035), al);
    const roof = (xa: number) => { const g = new THREE.BufferGeometry(), p = [ox + xa, eave, z0, ox, ridge, z0, ox, ridge, z1, ox + xa, eave, z0, ox, ridge, z1, ox + xa, eave, z1]; g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2)); g.computeVertexNormals(); return g; };
    b.add(roof(x0), cv); b.add(roof(x1), cv);
    b.add(boxGeo(V(ox + x0, 0, z1), V(ox + x1, eave, z1 + 0.01)), cv);
    for (const x of [x0, x1]) b.add(boxGeo(V(ox + x - 0.005, 0, z0 + 0.9), V(ox + x + 0.005, eave, z1)), cv);
    b.build(tent, true);
    // guy ropes and pegs
    for (const [x, z, sx] of [[x0, z0, -1], [x1, z0, 1], [x0, z1, -1], [x1, z1, 1]] as [number, number, number][]) { const r = new THREE.Mesh(rodGeo(V(ox + x, eave, z), V(ox + x + sx * 1.4, 0.02, z), 0.008), M("frRope", "#d8cdb0")); tent.add(r); }
    const lamp = put(new THREE.BoxGeometry(0.3, 0.2, 0.15), M("frFloodBody", "#2a2a2e"), 0, ridge - 0.25, 2.1); tent.add(lamp); G.remove(lamp);
    const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.14), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3.2), fog: false })); lens.rotation.x = Math.PI / 2; lens.position.set(ox, ridge - 0.36, 2.1); tent.add(lens);
    const h = glow(new THREE.Color(0.9, 0.95, 1.1), 1.2); h.position.set(ox, ridge - 0.38, 2.1); tent.add(h);
    flood.position.set(ox, ridge - 0.5, 2.0); tent.add(flood);
    // the kit outside the tent: cases with the four flags, a generator, a wheelbarrow, buckets of samples
    const cases: [number, number, "ca" | "uk" | "us" | "no"][] = [[-3.75, -0.7, "ca"], [-4.41, -0.55, "uk"], [-5.07, -0.7, "us"], [-5.73, -0.55, "no"]];
    for (const [x, z, fl] of cases) { const c = put(new THREE.BoxGeometry(0.62, 0.42, 0.42), M("frCase", "#3a4048"), x, 0.21, z); tent.add(c); G.remove(c);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshBasicMaterial({ map: flagTex(fl), color: new THREE.Color(0.95, 0.95, 0.95) })); f.rotation.y = Math.PI; f.position.set(ox + x, 0.24, z - 0.215); tent.add(f); }
    const gen = put(new THREE.BoxGeometry(0.8, 0.6, 0.55), M("frGen", "#c9a23a"), -4.4, 0.3, 4.6); tent.add(gen); G.remove(gen);
    const wb = new THREE.Group(), wm = M("frBarrow", "#4f7a4a"); { const tray = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.25, 0.85), wm); tray.position.y = 0.45; wb.add(tray); const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 14), M("frTyre", "#1e1e22")); wh.rotation.z = Math.PI / 2; wh.position.set(0, 0.17, -0.5); wb.add(wh); for (const sx of [-0.25, 0.25]) { const hd = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.8), wm); hd.position.set(sx, 0.5, 0.55); wb.add(hd); } }
    wb.position.set(ox + 4.4, 0, 3.6); wb.rotation.y = 0.5; shadowAll(wb); tent.add(wb); }
  // the ground radar cart (posed by the world each shot)
  const radar = new THREE.Group();
  { const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.42), M("frRadarBody", "#e8c43a")); body.position.y = 0.16; radar.add(body);
    for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12), M("frTyre", "#1e1e22")); w.rotation.z = Math.PI / 2; w.position.set(sx * 0.3, 0.09, 0); radar.add(w); }
    const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.0, 6), M("frAlu", "#b9bcc2")); hd.rotation.x = -0.75; hd.position.set(0, 0.55, -0.32); radar.add(hd);
    const scr = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.05), M("frRadarScr", "#2a2a2e")); scr.position.set(0, 0.92, -0.62); scr.rotation.x = -0.4; radar.add(scr);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.16), new THREE.MeshBasicMaterial({ map: radarTex(), color: new THREE.Color(1.3, 1.3, 1.3), fog: false })); face.rotation.set(-0.4, Math.PI, 0); face.position.set(0, 0.94, -0.665); radar.add(face);
    shadowAll(radar); radar.visible = false; G.add(radar); }
  // ---- the mountain behind, the far side of the valley, the skies ----
  mountain(G, "frGraveMt", ox + 4, hillY(44) - 2, 44, 150, 62, 7, 0.42, 0.55);
  mountain(G, "frGraveMt2", ox - 70, 0, 140, 220, 80, 11, 0.2, 0.6, "#7a7068");
  const skies = { night: skyPlane(G, "night", ox, 330, 1400, 600, -20), grey: skyPlane(G, "grey", ox, 330, 1400, 600, -20), twilight: skyPlane(G, "twilight", ox, 330, 1400, 600, -20) };
  // the town below the cemetery (behind the cameras, -z): coloured wooden houses, lit windows, snow on the roofs
  { const b = new Batch(); for (const [x, z, col, yaw] of [[-14, -26, "#8a2f2a", 0.2], [-6, -30, "#3f5a7a", -0.1], [3, -28, "#c9a23a", 0.1], [11, -33, "#4a6a4a", -0.2], [-20, -38, "#6a4a6a", 0.1], [-9, -42, "#a8583a", 0], [6, -44, "#3a4a5a", 0.2], [18, -40, "#8a2f2a", -0.1], [-2, -52, "#5a6a7a", 0.1], [14, -55, "#c9a23a", -0.2]] as [number, number, string, number][]) houseAt(b, G, ox + x, z, 6, 4.5, 3.2, col, "#e9eef3", true, Math.PI + yaw, -0.6); b.build(G, true); }
  // boulders and rubble along the slope; rocks in the fence corners
  { const list: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [];
    for (let i = 0; i < 46; i++) { const x = (i * 37.7) % 60 - 30, z = 7 + ((i * 13.1) % 30), s = 0.3 + ((i * 7) % 10) * 0.12; if (Math.abs(x) < 6 && z < 9) continue; list.push({ g: rockGeo(s, i + 3), m: new THREE.Matrix4().makeTranslation(ox + x, hillY(z) + s * 0.2, z) }); }
    for (const [x, z] of [[5.1, -5.1], [-5.2, -5.0], [5.0, 5.6], [-5.1, 5.7]]) list.push({ g: rockGeo(0.35, 77 + x), m: new THREE.Matrix4().makeTranslation(ox + x, 0.08, z) });
    const rk = new THREE.Mesh(mergeFacets(list), lam("frBoulder", () => ({ map: rockTex("frBoulderT", "#7a7068"), vertexColors: true, flatShading: true }))); rk.castShadow = true; rk.receiveShadow = true; G.add(rk); }
  // ---- "tens of millions": a field of crosses running to the horizon (the world shows it for one shot) ----
  const field = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), white, 2400);
  { const m = new THREE.Matrix4(); let k = 0; for (let j = 0; j < 60 && k < 2400; j++) for (let i = 0; i < 40 && k < 2400; i++) { const x = (i - 19.5) * 1.6 + (j % 2) * 0.8, z = -12 - j * 1.8; if (Math.abs(x) < 6 && z > -8) continue;
      m.compose(V(ox + x, 0.55, z), new THREE.Quaternion(), V(0.07, 1.1, 0.07)); field.setMatrixAt(k++, m); m.compose(V(ox + x, 0.8, z), new THREE.Quaternion(), V(0.5, 0.08, 0.07)); field.setMatrixAt(k++, m); }
    field.count = k; field.castShadow = true; field.visible = false; G.add(field); }
  // ---- air: falling snow (1918, today) and dust in the tent's light (1998) ----
  const flakes = dustMotes(V(ox, 3, 1), V(26, 8, 22), 900, new THREE.Color(0.95, 0.97, 1.0), 0.06, 0.85); G.add(flakes.points);
  const dust = dustMotes(V(ox, 1.4, 2.0), V(7, 2.6, 3.5), 140, new THREE.Color(1.0, 0.95, 0.85), 0.03, 0.5); tent.add(dust.points);
  noInk(G);
  const drift = (t: number) => { const a = flakes.points.geometry.attributes.position.array as Float32Array; flakes.drift(t); for (let i = 0; i < a.length; i += 3) { a[i + 1] = 7 - (((7 - a[i + 1]) + t * 0.9 + (i % 7) * 0.3) % 8); } dust.drift(t); };
  const fill = pit.getObjectByName("fill") as THREE.Mesh;
  return { group: G, snow, bare, lid, pit, tent, lanterns, lamps, flood, flakes, dust, skies, coffins, radar, field, crosses, fill, drift };
}

// =====================================================================================================================
/** moving water: a subdivided sheet whose vertices rise and fall in the vertex shader, a sky-and-sun highlight in the
 *  fragment shader, crest flecks painted by noise; uTime drives it */
export const waterMat = (deep: string, shallow: string, sky: string, key: string) => {
  const U = { uTime: { value: 0 }, uSun: { value: new THREE.Vector3(0.5, 0.4, -0.7) }, uDeep: { value: new THREE.Color(deep) }, uShal: { value: new THREE.Color(shallow) }, uSky: { value: new THREE.Color(sky) }, uAmp: { value: 1 } };
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float uTime, uAmp;\nvarying vec3 vWP; varying vec3 vWN;\nfloat wv(vec2 p){ return 0.11*sin(p.x*0.9+uTime*1.3)+0.07*sin(p.y*1.3-uTime*1.7+p.x*0.4)+0.04*sin((p.x+p.y)*2.6+uTime*2.4)+0.025*sin(p.x*5.1-p.y*3.7+uTime*3.1); }")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvec4 wp0 = modelMatrix * vec4(position, 1.0);\nfloat hh = wv(wp0.xz) * uAmp;\ntransformed.y += hh;\nfloat ex = (wv(wp0.xz + vec2(0.15, 0.0)) - wv(wp0.xz - vec2(0.15, 0.0))) * uAmp / 0.3, ez = (wv(wp0.xz + vec2(0.0, 0.15)) - wv(wp0.xz - vec2(0.0, 0.15))) * uAmp / 0.3;\nvWN = normalize(vec3(-ex, 1.0, -ez));\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;")
      .replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uTime; uniform vec3 uSun, uDeep, uShal, uSky; varying vec3 vWP; varying vec3 vWN;\nfloat hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }")
      .replace("#include <map_fragment>", `
  vec3 Vd = normalize(cameraPosition - vWP); vec3 N = normalize(vWN);
  float fr = pow(1.0 - max(dot(N, Vd), 0.0), 3.0);
  vec3 wc = mix(uShal, uDeep, clamp(0.35 + 0.5 * N.x + 0.3 * sin(vWP.x * 0.21 + vWP.z * 0.13), 0.0, 1.0));
  wc = mix(wc, uSky, 0.25 + 0.6 * fr);
  vec2 cg = floor(vWP.xz * 3.0 + vec2(uTime * 0.6, uTime * 0.25)); float fl = step(0.965, hs(cg)) * smoothstep(0.02, 0.09, vWP.y);
  wc = mix(wc, vec3(0.95, 0.97, 1.0), fl * 0.75);
  vec3 Hh = normalize(normalize(uSun) + Vd); float sp = pow(max(dot(N, Hh), 0.0), 120.0);
  diffuseColor.rgb = wc + vec3(1.0, 0.92, 0.78) * sp * 2.2;`)
      .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * 0.62; reflectedLight.indirectDiffuse = diffuseColor.rgb * 0.38;");
  };
  m.customProgramCacheKey = () => "frWater_" + key;
  return { mat: m, U };
};

export type QuaySet = { group: THREE.Group; water: ReturnType<typeof waterMat>; foam: THREE.Mesh[]; smoke: THREE.Sprite[]; ship: THREE.Group; lamps: THREE.PointLight[]; flakes: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildQuay(): QuaySet {
  const G = new THREE.Group(), ox = SET.quay[0], put = putter(G, ox), b = new Batch();
  const snowM = T("frSnowM", () => snowTex()), deck = lam("frDeck", () => ({ map: planksHD(), color: "#8a7864" })), pile = M("frPile", "#4a3a30"), coal = lam("frCoal", () => ({ map: rockTex("frCoalT", "#2a2a2e"), vertexColors: true, flatShading: true }));
  // ---- water, moving ----
  const water = waterMat("#1c3448", "#3e6478", "#93a8ba", "quay");
  { const g = new THREE.PlaneGeometry(260, 140, 220, 120); g.rotateX(-Math.PI / 2); g.translate(ox, 0, SHORE_Z - 70); const w = new THREE.Mesh(g, water.mat); w.receiveShadow = true; G.add(w); }
  // ---- the pier: a plank deck on two rows of pilings, a rail on the far side, bollards ----
  b.add(boxGeo(V(ox - PIER.hw, PIER.y - 0.2, PIER.z0), V(ox + PIER.hw, PIER.y, PIER.z1 + 1), 2.5), deck);
  const foam: THREE.Mesh[] = [], foamM = new THREE.MeshBasicMaterial({ map: foamTex(), transparent: true, depthWrite: false, opacity: 0.6, fog: true, color: new THREE.Color(0.8, 0.84, 0.9) });
  for (let z = PIER.z0 + 1; z <= PIER.z1; z += 3) for (const sx of [-1, 1]) { const x = sx * (PIER.hw - 0.15); b.add(new THREE.CylinderGeometry(0.17, 0.2, 5, 10).translate(ox + x, PIER.y - 2.7, z), pile);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), foamM); f.rotation.x = -Math.PI / 2; f.position.set(ox + x, 0.06, z); f.renderOrder = 2; G.add(f); foam.push(f); }
  for (let z = PIER.z0 + 1; z <= PIER.z1; z += 2) b.add(boxGeo(V(ox - PIER.hw - 0.02, PIER.y + 0.85, z - 0.04), V(ox - PIER.hw + 0.06, PIER.y + 0.92, z + 2)), pile);
  for (let z = PIER.z0 + 1; z <= PIER.z1; z += 2) b.add(boxGeo(V(ox - PIER.hw - 0.02, PIER.y, z - 0.05), V(ox - PIER.hw + 0.08, PIER.y + 0.95, z + 0.05)), pile);
  for (const z of [-22, -12, 0]) b.add(new THREE.CylinderGeometry(0.16, 0.2, 0.45, 10).translate(ox + PIER.hw - 0.3, PIER.y + 0.22, z), M("frBollard", "#2a2a30"));
  // a snow crust along the deck edges
  for (const sx of [-1, 1]) b.add(boxGeo(V(ox + sx * PIER.hw - 0.3 * (sx > 0 ? 1 : 0), PIER.y, PIER.z0), V(ox + sx * PIER.hw + 0.3 * (sx < 0 ? 1 : 0) - (sx > 0 ? 0 : 0), PIER.y + 0.05, PIER.z1)), snowM);
  // ---- the shore: snow over the land, the coal heaps, the store shed, the miners' houses, a signpost ----
  { const g = sheet(ox - 130, ox + 130, SHORE_Z - 2, 160, 120, 60, (x, z) => Math.max(-0.3, Math.min(1.25 + 0.04 * (z - SHORE_Z), 0.0 + (z - SHORE_Z + 2) * 0.9)) + 0.4 * Math.sin((x - ox) * 0.08) * Math.min(1, (z - SHORE_Z) / 20) + nz(x, z), 3); const s = new THREE.Mesh(g, snowM); s.receiveShadow = true; G.add(s); }
  { const list: { g: THREE.BufferGeometry; m: THREE.Matrix4 }[] = []; for (const [x, z, s] of [[-9, 22, 3.4], [-13, 26, 2.6], [-6.5, 27, 2.2], [11, 24, 2.8]]) { const g = rockGeo(s, x * 3 + z, 2, 0.55); list.push({ g, m: new THREE.Matrix4().makeTranslation(ox + x, 1.4, z) }); }
    const cm = new THREE.Mesh(mergeFacets(list), coal); cm.castShadow = true; cm.receiveShadow = true; G.add(cm);
    for (const [x, z, s] of [[-9, 22, 3.4], [-13, 26, 2.6], [11, 24, 2.8]]) { const cap = new THREE.Mesh(new THREE.SphereGeometry(s * 0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), snowM); cap.scale.y = 0.45; cap.position.set(ox + x, 1.4 + s * 0.5, z); G.add(cap); } }
  houseAt(b, G, ox - 6.5, SHORE_Z + 5.5, 7, 4.5, 3.4, "#8a2f2a", "#e9eef3", true, 0, 1.25);
  { const sg = put(new THREE.PlaneGeometry(4.2, 0.9), lam("frShedSign", () => ({ map: boardTex("LONGYEAR CITY", "#2c3a44", "#f0e6c8") })), -6.5, 4.0 + 1.25, SHORE_Z + 3.2, false); sg.rotation.y = Math.PI; }
  for (const [x, z, col] of [[9, 34, "#5a6a7a"], [15, 38, "#7a5a3a"], [-16, 40, "#4a6a5a"], [-24, 46, "#7a4a40"], [22, 48, "#6a6a5a"], [3, 52, "#5a4a5a"]] as [number, number, string][]) houseAt(b, G, ox + x, z, 6, 4, 3, col, "#e9eef3", true, 0.2 * Math.sin(x), 1.25 + 0.04 * (z - SHORE_Z));
  // the signpost on the pier: plot-carrying (how far north this is)
  { b.add(boxGeo(V(ox - 1.95, PIER.y, 2.95), V(ox - 1.85, PIER.y + 2.6, 3.05)), pile);
    const s1 = put(new THREE.PlaneGeometry(1.6, 0.42), lam("frSignNP", () => ({ map: boardTex("NORTH POLE|1300 KM", "#e9e2cc", "#2a2228", 768, 256), side: THREE.DoubleSide })), -1.4, PIER.y + 2.25, 2.94, false); s1.rotation.y = Math.PI;
    const s2 = put(new THREE.PlaneGeometry(1.5, 0.36), lam("frSignTr", () => ({ map: boardTex("TROMSØ 950 KM", "#2c3a44", "#f0e6c8", 768, 192), side: THREE.DoubleSide })), -2.4, PIER.y + 1.75, 2.94, false); s2.rotation.y = Math.PI; }
  // crates and sacks stacked on the pier
  for (const [x, z, k] of [[-1.6, -4, 0], [-1.7, -4.9, 1], [-1.65, -4.45, 2], [1.7, 7, 3]] as [number, number, number][]) { const c = put(new THREE.BoxGeometry(0.7, 0.55, 0.6), lam("frCrate" + k, () => ({ map: labelTex(k === 3 ? "COAL|SACKS" : "STORE|NORSKE", "#a8834e") })), x, PIER.y + 0.28 + (k === 2 ? 0.56 : 0), z); c.rotation.y = 0.2 * k; }
  // ---- named lights: three lamps on posts along the pier ----
  const lamps: THREE.PointLight[] = [];
  for (const z of [-18, -6, 6]) { b.add(boxGeo(V(ox - PIER.hw + 0.05, PIER.y, z - 0.06), V(ox - PIER.hw + 0.17, PIER.y + 2.7, z + 0.06)), pile); put(new THREE.BoxGeometry(0.22, 0.3, 0.22), M("frLantern", "#2a2a2e"), -PIER.hw + 0.11, PIER.y + 2.85, z);
    flame(G, V(ox - PIER.hw + 0.11, PIER.y + 2.85, z), 0.05); const pl = new THREE.PointLight("#ffb860", 8, 13, 1.4); pl.position.set(ox - PIER.hw + 0.3, PIER.y + 2.7, z); G.add(pl); lamps.push(pl); }
  b.build(G, true);
  // ---- the steamship Forsete alongside: black hull, red boot-topping, white deckhouse, a tall funnel, two masts ----
  const ship = new THREE.Group(); G.add(ship);
  { const sb = new Batch(), { x0, x1, z0, z1, deck: dk } = SHIP, cx = (x0 + x1) / 2, hb = (x1 - x0) / 2, hull = M("frHull", "#1e1e24"), red = M("frBoot", "#9a2a26"), wh = M("frWhiteS", "#ece6d8"), fun = M("frFunnel", "#1e1e24"), band = M("frFunBand", "#c9302c"), mast = M("frMast", "#7a5236");
    const hullShape = (y0: number, y1: number, m: THREE.Material, inset = 0) => { const sh = new THREE.Shape(); sh.moveTo(-hb + inset, 0); sh.lineTo(hb - inset, 0); sh.lineTo(hb - inset, (z1 - z0) - 6); sh.quadraticCurveTo(hb - inset, (z1 - z0) - 1.5, 0, (z1 - z0) + 1.2); sh.quadraticCurveTo(-hb + inset, (z1 - z0) - 1.5, -hb + inset, (z1 - z0) - 6); sh.lineTo(-hb + inset, 0);
      const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false }); g.rotateX(Math.PI / 2); g.translate(ox + cx, y1, z0); sb.add(g, m); };
    hullShape(-1.2, 0.35, red, 0.05); hullShape(0.35, dk, hull);
    sb.add(boxGeo(V(ox + cx - 2.0, dk, z0 + 9), V(ox + cx + 2.0, dk + 2.2, z0 + 17)), wh); sb.add(boxGeo(V(ox + cx - 2.2, dk + 2.2, z0 + 8.6), V(ox + cx + 2.2, dk + 2.35, z0 + 17.4)), M("frDeckRoof", "#8a7a6a"));
    sb.add(boxGeo(V(ox + cx - 1.4, dk + 2.35, z0 + 14), V(ox + cx + 1.4, dk + 3.6, z0 + 17)), wh);
    sb.add(new THREE.CylinderGeometry(0.75, 0.8, 5.5, 16).translate(ox + cx, dk + 2.2 + 2.75, z0 + 11.5), fun); sb.add(new THREE.CylinderGeometry(0.82, 0.82, 0.6, 16).translate(ox + cx, dk + 2.2 + 4.2, z0 + 11.5), band);
    for (const z of [z0 + 4, z1 - 5]) sb.add(new THREE.CylinderGeometry(0.12, 0.16, 13, 8).translate(ox + cx, dk + 6.5, z), mast);
    sb.add(rodGeo(V(ox + cx, dk + 12.8, z0 + 4), V(ox + cx, dk + 12.8, z1 - 5), 0.025), mast); sb.add(rodGeo(V(ox + cx, dk + 12.8, z1 - 5), V(ox + cx, dk + 0.3, z1 + 0.8), 0.02), mast); sb.add(rodGeo(V(ox + cx, dk + 12.8, z0 + 4), V(ox + cx, dk + 0.3, z0 + 0.3), 0.02), mast);
    for (const s of [-1, 1]) for (const z of [z0 + 4, z1 - 5]) sb.add(rodGeo(V(ox + cx, dk + 11, z), V(ox + cx + s * hb, dk + 0.2, z - 1.5), 0.018), mast);
    // portholes along the hull (lit), rails
    for (let z = z0 + 3; z < z1 - 4; z += 1.6) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.7, 0.8) })); w.rotation.y = -Math.PI / 2; w.position.set(ox + x0 - 0.01, dk - 1.1, z); ship.add(w); }
    for (let z = z0; z < z1 - 3; z += 1.2) sb.add(boxGeo(V(ox + x0 + 0.02, dk, z), V(ox + x0 + 0.08, dk + 0.95, z + 0.05)), wh); sb.add(boxGeo(V(ox + x0 + 0.02, dk + 0.9, z0), V(ox + x0 + 0.08, dk + 0.97, z1 - 3)), wh);
    sb.build(ship, true);
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.55), lam("frShipName", () => ({ map: boardTex("FORSETE", "#1e1e24", "#ece6d8", 768, 160) }))); nm.rotation.y = -Math.PI / 2 - 0.42; nm.position.set(ox + x0 + 1.1, dk - 0.6, z1 - 1.2); ship.add(nm);
    // the gangway down onto the pier
    const gw = new THREE.Mesh(boxGeo(V(-0.45, -0.04, 0), V(0.45, 0.04, 3.0)), deck), gy0 = PIER.y, gy1 = dk; gw.rotation.set(0, -Math.PI / 2, 0); gw.position.set(ox + GANG[0] - 0.2, gy0, GANG[2]); gw.rotation.z = Math.atan2(gy1 - gy0, 3.0); gw.castShadow = true; ship.add(gw);
    // foam along the hull at the waterline
    for (const [x, rot] of [[x0 - 0.15, 0], [x1 + 0.15, 0]] as [number, number][]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.8, z1 - z0), foamM); f.rotation.set(-Math.PI / 2, 0, rot); f.position.set(ox + x, 0.07, (z0 + z1) / 2); f.renderOrder = 2; ship.add(f); foam.push(f); } }
  // smoke from the funnel
  const smoke: THREE.Sprite[] = []; { const sm = new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(0.32, 0.31, 0.34), transparent: true, depthWrite: false, opacity: 0.7 }); for (let i = 0; i < 12; i++) { const s = new THREE.Sprite(sm.clone()); G.add(s); smoke.push(s); } }
  mountain(G, "frQuayMt", ox + 10, 0, 125, 320, 72, 21, 0.3, 0.62);
  skyPlane(G, "dusk", ox, 400, 1600, 700, -30);
  for (let i = 0; i < 40; i++) { const [f, t] = pineGeo(1, 1, i); void f; void t; break; }
  const flakes = dustMotes(V(ox, 3.5, -6), V(30, 8, 30), 700, new THREE.Color(0.95, 0.97, 1.0), 0.06, 0.8); G.add(flakes.points);
  noInk(G);
  const drift = (t: number) => { const a = flakes.points.geometry.attributes.position.array as Float32Array; flakes.drift(t); for (let i = 0; i < a.length; i += 3) a[i + 1] = 7.5 - (((7.5 - a[i + 1]) + t * 1.1 + (i % 5) * 0.4) % 8); };
  return { group: G, water, foam, smoke, ship, lamps, flakes, drift };
}

// =====================================================================================================================
export type WardSet = { group: THREE.Group; candles: { f: THREE.Mesh; h: THREE.Sprite; l: THREE.PointLight }[]; cal: THREE.Mesh; lamp: THREE.PointLight; stove: THREE.PointLight; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildWard(): WardSet {
  const G = new THREE.Group(), ox = SET.ward[0], put = putter(G, ox), b = new Batch(), { w: W, z0: Z0, z1: Z1, h: H } = WARD;
  const plank = lam("frWardPlank", () => ({ map: planksHD(), color: "#c9b49a" })), floor = lam("frWardFloor", () => ({ map: planksHD(), color: "#9a8068" })), beam = M("frBeam", "#5a4434"), iron = M("frIron", "#2e2c34"), wool = M("frBlanket", "#6e7a8a"), linen = M("frLinen", "#efe9dc");
  b.add(boxGeo(V(ox - W - 0.3, -0.3, Z0 - 0.3), V(ox + W + 0.3, 0, Z1 + 0.3), 2.5), floor);
  b.add(boxGeo(V(ox - W - 0.3, H, Z0 - 0.3), V(ox + W + 0.3, H + 0.25, Z1 + 0.3), 2.5), plank);
  b.add(boxGeo(V(ox - W - 0.3, 0, Z1), V(ox + W + 0.3, H, Z1 + 0.3), 2.5), plank);
  b.add(boxGeo(V(ox + W, 0, Z0), V(ox + W + 0.3, H, Z1), 2.5), plank);
  // the -x wall (screen right) has a window looking onto the night
  b.add(boxGeo(V(ox - W - 0.3, 0, Z0), V(ox - W, 1.0, Z1), 2.5), plank); b.add(boxGeo(V(ox - W - 0.3, 2.3, Z0), V(ox - W, H, Z1), 2.5), plank); b.add(boxGeo(V(ox - W - 0.3, 1.0, Z0), V(ox - W, 2.3, -1.4), 2.5), plank); b.add(boxGeo(V(ox - W - 0.3, 1.0, 0.0), V(ox - W, 2.3, Z1), 2.5), plank);
  for (const z of [-1.4, -0.7, 0]) b.add(boxGeo(V(ox - W - 0.25, 1.0, z - 0.04), V(ox - W - 0.05, 2.3, z + 0.04)), beam); b.add(boxGeo(V(ox - W - 0.25, 1.62, -1.4), V(ox - W - 0.05, 1.68, 0)), beam);
  { const v = put(new THREE.PlaneGeometry(1.6, 1.5), new THREE.MeshBasicMaterial({ map: skyTex("night"), color: new THREE.Color(0.8, 0.85, 1.0), fog: false }), -W - 0.6, 1.65, -0.7, false); v.rotation.y = Math.PI / 2; }
  for (let x = -W; x <= W; x += 1.4) b.add(boxGeo(V(ox + x - 0.1, H - 0.25, Z0), V(ox + x + 0.1, H, Z1)), beam);
  b.add(boxGeo(V(ox - W, 0, Z0 - 0.3), V(ox + W, H, Z0)), plank);
  // the seven beds along the back wall; a stool and a candle at each
  const candles: WardSet["candles"] = [];
  BED_X.forEach((x, k) => { const z = BED_Z;
    for (const [dx, dz, h] of [[-0.45, 0.95, 1.0], [0.45, 0.95, 1.0], [-0.45, -0.95, 0.62], [0.45, -0.95, 0.62]]) b.add(new THREE.CylinderGeometry(0.025, 0.025, h, 6).translate(ox + x + dx, h / 2, z + dz), iron);
    b.add(rodGeo(V(ox + x - 0.45, 0.95, z + 0.95), V(ox + x + 0.45, 0.95, z + 0.95), 0.025), iron); b.add(rodGeo(V(ox + x - 0.45, 0.62, z - 0.95), V(ox + x + 0.45, 0.62, z - 0.95), 0.025), iron);
    b.add(boxGeo(V(ox + x - 0.45, 0.4, z - 0.95), V(ox + x + 0.45, 0.52, z + 0.95)), linen);
    b.add(boxGeo(V(ox + x - 0.5, 0.28, z - 0.99), V(ox + x + 0.5, 0.62, z + 0.45)), wool); b.add(boxGeo(V(ox + x - 0.47, 0.6, z + 0.2), V(ox + x + 0.47, 0.62, z + 0.45)), linen);
    const pw = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.32), linen); pw.position.set(ox + x, 0.6, z + 0.72); pw.castShadow = true; G.add(pw);
    const sx = x - 0.7; b.add(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 12).translate(ox + sx, 0.5, z + 0.7), beam); for (const a of [0, 2.1, 4.2]) b.add(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6).translate(ox + sx + 0.12 * Math.cos(a), 0.25, z + 0.7 + 0.12 * Math.sin(a)), beam);
    b.add(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8).translate(ox + sx, 0.6, z + 0.7), M("frWax", "#f4ecd4")); b.add(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 12).translate(ox + sx, 0.525, z + 0.7), M("frBrassW", "#c9a04a"));
    const fl = flame(G, V(ox + sx, 0.72, z + 0.7), 0.022), l = new THREE.PointLight("#ffb050", 1.6, 2.6, 1.6); l.position.set(ox + sx, 0.85, z + 0.55); G.add(l); candles.push({ f: fl.f, h: fl.h, l }); void k; });
  // the hanging lamp in the middle (key light), the stove at the front left, a washstand, coats on pegs, a cabinet
  const lamp = new THREE.PointLight("#ffc070", 10, 11, 1.4); lamp.position.set(ox, 2.35, 0.6); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); G.add(lamp);
  b.add(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 4).translate(ox, H - 0.55, 0.6), iron); put(new THREE.CylinderGeometry(0.16, 0.22, 0.12, 12), M("frLampShade", "#2e4a3a"), 0, 2.58, 0.6); flame(G, V(ox, 2.48, 0.6), 0.04);
  { const lc = lightCone(2.4, 2.4, new THREE.Color(1.0, 0.8, 0.45), 0.18); lc.position.set(ox, 2.5, 0.6); G.add(lc); }
  b.add(new THREE.CylinderGeometry(0.38, 0.42, 0.95, 16).translate(ox + 4.6, 0.5, -3.6), iron); b.add(new THREE.CylinderGeometry(0.09, 0.09, H - 1, 8).translate(ox + 4.6, 0.95 + (H - 1) / 2, -3.6), iron);
  const stoveGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.16), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.3, 0.4), fog: false })); stoveGlow.rotation.y = Math.PI; stoveGlow.position.set(ox + 4.6, 0.42, -4.03); G.add(stoveGlow);
  const stove = new THREE.PointLight("#ff8a3a", 4, 5, 1.6); stove.position.set(ox + 4.4, 0.5, -4.3); G.add(stove);
  b.add(boxGeo(V(ox - 4.9, 0, -4.4), V(ox - 4.1, 0.85, -3.8)), beam); put(new THREE.CylinderGeometry(0.22, 0.15, 0.12, 14), M("frBasin", "#e8e4dc"), -4.5, 0.92, -4.1); put(new THREE.CylinderGeometry(0.08, 0.11, 0.3, 12), M("frJug", "#e8e4dc"), -4.25, 1.0, -3.95);
  for (const [x, col] of [[3.0, "#3a3e4a"], [2.4, "#5a4a3a"], [1.8, "#3e4a3a"]] as [number, string][]) { b.add(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6).rotateX(Math.PI / 2).translate(ox + x, 1.9, Z0 + 0.1), beam); const c = put(new THREE.BoxGeometry(0.5, 1.0, 0.12), M("frCoat" + col, col), x, 1.4, Z0 + 0.12); c.castShadow = true; }
  b.add(boxGeo(V(ox + 5.0, 0, 1.0), V(ox + W, 1.9, 2.2)), beam); for (let k = 0; k < 6; k++) put(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8), M("frBottle" + (k % 3), ["#4a7a5a", "#7a4a2a", "#d8d2c4"][k % 3]), 5.15, 1.99, 1.15 + k * 0.17);
  const cal = put(new THREE.PlaneGeometry(0.42, 0.52), new THREE.MeshLambertMaterial({ map: calTex(1) }), -1.4 + 0.7, 1.9, Z1 - 0.02, false); cal.rotation.y = Math.PI;
  b.build(G, true);
  const dust = dustMotes(V(ox, 1.6, 0.5), V(10, 2.6, 8), 220, new THREE.Color(1.0, 0.9, 0.7), 0.025, 0.45); G.add(dust.points);
  noInk(G);
  return { group: G, candles, cal, lamp, stove, dust, drift: (t) => dust.drift(t) };
}

// =====================================================================================================================
export type CutSet = { group: THREE.Group; mud: THREE.MeshLambertMaterial; frost: THREE.Mesh; ghosts: THREE.Group; coffins: THREE.Group; line: THREE.Mesh; snowTop: THREE.Mesh; motes: ReturnType<typeof dustMotes>; lamp: THREE.PointLight; drift: (t: number) => void };
export function buildCut(): CutSet {
  const G = new THREE.Group(), ox = SET.cut[0], b = new Batch(), { w: W, z: Z, top, ice, bot } = CUT;
  const mud = new THREE.MeshLambertMaterial({ map: mudCutTex() }), iceM = T("frIceCutM", () => iceEarthTex()), scree = T("frScreeM", () => screeTex()), snowM = T("frSnowM", () => snowTex());
  // the block: thawing layer on top of the frozen layer, cut face toward the camera (-z), 6 m deep into the picture
  b.add(boxGeo(V(ox - W, bot, Z), V(ox + W, ice, Z + 6), 1.6, true), iceM);
  { const m = new THREE.Mesh(boxGeo(V(ox - W, ice, Z), V(ox + W, top, Z + 6), 1.6), mud); m.receiveShadow = true; m.castShadow = true; G.add(m); }
  b.add(boxGeo(V(ox - W, top, Z), V(ox + W, top + 0.02, Z + 6), 2.4), scree);
  b.build(G, true);
  const snowTop = new THREE.Mesh(boxGeo(V(ox - W, top + 0.02, Z), V(ox + W, top + 0.1, Z + 6), 2.4), snowM); snowTop.receiveShadow = true; G.add(snowTop);
  // frost creeping over the thawing layer's face when it freezes (opacity posed per frame)
  const frost = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, top - ice), new THREE.MeshBasicMaterial({ map: iceEarthTex(), transparent: true, opacity: 0, depthWrite: false, color: new THREE.Color(1.15, 1.2, 1.3) })); frost.rotation.y = Math.PI; frost.position.set(ox, (top + ice) / 2, Z - 0.012); G.add(frost);
  // the frozen line: a bright cyan band across the face at the top of the permafrost
  const line = new THREE.Mesh(new THREE.PlaneGeometry(2 * W + 0.4, 0.06), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.6, 2.2), fog: false })); line.rotation.y = Math.PI; line.position.set(ox, ice, Z - 0.02); G.add(line);
  // the seven coffins seen end-on in the cut, their lids 0.82 m down; the seven crosses on top
  const coffins = new THREE.Group(); G.add(coffins);
  const cw = M("frCoffin", "#5a4436"), plates = new THREE.Group(); G.add(plates);
  { const cb = new Batch(); CROSS_X.forEach((x, k) => { cb.add(boxGeo(V(ox + x - 0.25, LID_Y - 0.34, Z - 0.03), V(ox + x + 0.25, LID_Y, Z + 1.9)), cw); crossAt(b, plates, M("frWhite", "#f2efe6"), ox + x, top + 0.05, Z + 1.0, k, 0.8); void k; }); cb.build(coffins, true); b.build(G, true); }
  // where everyone hoped they were: ghost coffins six feet down, inside the frozen layer
  const ghosts = new THREE.Group(); G.add(ghosts);
  { const gm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.75, 1.2, 1.6), transparent: true, opacity: 0.35, depthWrite: false, fog: false }), em = new THREE.LineBasicMaterial({ color: new THREE.Color(0.85, 1.4, 1.8), fog: false });
    for (const x of CROSS_X) { const g = new THREE.PlaneGeometry(0.5, 0.34), m = new THREE.Mesh(g, gm); m.rotation.y = Math.PI; m.position.set(ox + x, -1.83 - 0.17, Z - 0.015); ghosts.add(m); const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), em); e.rotation.y = Math.PI; e.position.copy(m.position); e.position.z -= 0.002; ghosts.add(e); } }
  // the depth ruler on the left (+x): a striped pole with marks
  { const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, -bot + 0.3, 0.06), new THREE.MeshBasicMaterial({ map: labelTex("|", "#f2efe6", "rgba(0,0,0,0)", 1), color: new THREE.Color(1, 1, 1) })); pole.position.set(ox + W + 0.35, (bot + 0.3) / 2, Z - 0.05); G.add(pole);
    for (let k = 0; k <= 3; k++) { const t2 = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.03), new THREE.MeshBasicMaterial({ color: "#120c16" })); t2.rotation.y = Math.PI; t2.position.set(ox + W + 0.35, -k, Z - 0.085); G.add(t2); }
    const lab = (s: string, y: number, col: string) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.24), new THREE.MeshBasicMaterial({ map: boardTex(s, col, "#ffffff", 512, 128), fog: false })); m.rotation.y = Math.PI; m.position.set(ox + W + 0.95, y, Z - 0.06); G.add(m); };
    lab("1 M", -1, "#2a2a2e"); lab("2 M", -2, "#2a2a2e"); }
  // the studio round it: a dark gradient backdrop, a hanging work lamp (named light), snow in the air
  { const bg = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({ map: skyTex("night"), color: new THREE.Color(0.55, 0.6, 0.75), fog: false, depthWrite: false })); bg.rotation.y = Math.PI; bg.position.set(ox, 2, 18); bg.renderOrder = -5; G.add(bg); }
  const lamp = new THREE.PointLight("#fff0d8", 26, 16, 1.2); lamp.position.set(ox - 1.5, 3.4, Z - 2.6); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); G.add(lamp);
  { const shade = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.25, 14, 1, true), M("frShade", "#3a3a40", { side: THREE.DoubleSide })); shade.position.set(ox - 1.5, 3.55, Z - 2.6); G.add(shade); const bulb = glow(new THREE.Color(1.3, 1.2, 1.0), 0.7); bulb.position.set(ox - 1.5, 3.45, Z - 2.6); G.add(bulb); G.add(new THREE.Mesh(rodGeo(V(ox - 1.5, 3.65, Z - 2.6), V(ox - 1.5, 9, Z - 2.6), 0.01), M("frCord", "#1a1a1e"))); }
  const motes = dustMotes(V(ox, 1.5, Z - 1.5), V(12, 6, 5), 300, new THREE.Color(0.95, 0.97, 1.0), 0.04, 0.6); G.add(motes.points);
  noInk(G);
  return { group: G, mud, frost, ghosts, coffins, line, snowTop, motes, lamp, drift: (t) => { motes.drift(t); const a = motes.points.geometry.attributes.position.array as Float32Array; for (let i = 1; i < a.length; i += 3) a[i] = 4.5 - (((4.5 - a[i]) + t * 0.5 + (i % 9) * 0.2) % 6); } };
}

// =====================================================================================================================
export type AlaskaSet = { group: THREE.Group; lid: THREE.Group; pit: THREE.Group; plane: THREE.Group; prop: THREE.Mesh; lantern: THREE.PointLight; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildAlaska(): AlaskaSet {
  const G = new THREE.Group(), ox = SET.alaska[0], put = putter(G, ox), b = new Batch();
  const tundra = T("frTundraM", () => tundraTex()), earthM = T("frEarthM", () => earthTex()), iceM = T("frIceCutM", () => iceEarthTex()), white = M("frWhite", "#f2efe6"), gravel = T("frScreeM", () => screeTex());
  // tundra round the pit (four strips so the pit can open)
  const { x0, x1, z0, z1, d } = APIT, ty = (x: number, z: number) => 0.25 * Math.sin((x - ox) * 0.09 + z * 0.05) * Math.min(1, Math.hypot(x - ox, z - 3) / 12) + nz(x, z) * 0.6;
  for (const [a0, a1, c0, c1] of [[-140, x0, -60, 200], [x1, 140, -60, 200], [x0, x1, -60, z0], [x0, x1, z1, 200]] as [number, number, number, number][]) { const g = sheet(ox + a0, ox + a1, c0, c1, Math.max(2, Math.round((a1 - a0) / 1.4)), Math.max(2, Math.round((c1 - c0) / 1.4)), ty, 3); const m = new THREE.Mesh(g, tundra); m.receiveShadow = true; G.add(m); }
  const lid = new THREE.Group(), pit = new THREE.Group(); G.add(lid, pit);
  { const m = new THREE.Mesh(sheet(ox + x0, ox + x1, z0, z1, 6, 6, () => 0, 3), tundra); m.receiveShadow = true; lid.add(m); }
  // the pit: thawed earth at the top, then frozen ground (ice in it), a lantern at the edge, spoil and shovels
  { const pb = new Batch(), ice = -0.55;
    for (const [m, ya, yb] of [[earthM, ice, 0.001], [iceM, -d, ice]] as [THREE.Material, number, number][]) { pb.add(boxGeo(V(ox + x0 - 0.3, ya, z1), V(ox + x1 + 0.3, yb, z1 + 0.3), 1.2), m); pb.add(boxGeo(V(ox + x0 - 0.3, ya, z0 - 0.3), V(ox + x1 + 0.3, yb, z0), 1.2), m); pb.add(boxGeo(V(ox + x0 - 0.3, ya, z0), V(ox + x0, yb, z1), 1.2), m); pb.add(boxGeo(V(ox + x1, ya, z0), V(ox + x1 + 0.3, yb, z1), 1.2), m); }
    pb.add(boxGeo(V(ox + x0 - 0.3, -d - 0.3, z0 - 0.3), V(ox + x1 + 0.3, -d, z1 + 0.3), 1.2), iceM); pb.build(pit, true);
    for (const [sx, s] of [[-1, 1.0], [1, 0.8]] as [number, number][]) { const h = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), earthM); h.scale.set(1.1 * s, 0.6 * s, 1.4 * s); h.position.set(ox + sx * 2.7, 0, 3.2); h.castShadow = true; h.receiveShadow = true; pit.add(h); }
    const tarp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), M("frTarp", "#3f6a8a", { side: THREE.DoubleSide })); tarp.rotation.set(-Math.PI / 2, 0, 0.3); tarp.position.set(ox - 2.6, 0.03, 1.2); pit.add(tarp); }
  const lantern = new THREE.PointLight("#ffb860", 0, 6, 1.4);
  { const lx = 1.55, lz = 2.0; const box = put(new THREE.BoxGeometry(0.18, 0.26, 0.18), M("frLantern", "#2a2a2e"), lx, 0.13, lz); pit.add(box); G.remove(box); flame(pit, V(ox + lx, 0.17, lz), 0.04); lantern.position.set(ox + lx, 0.4, lz); pit.add(lantern); }
  // the mass grave's fence and its two big crosses
  { const [mx, , mz] = MASS; for (let x = -3.2; x <= 3.2; x += 0.34) { b.add(boxGeo(V(ox + mx + x - 0.03, 0, mz - 2.6), V(ox + mx + x + 0.03, 0.75, mz - 2.56)), white); b.add(boxGeo(V(ox + mx + x - 0.03, 0, mz + 2.6), V(ox + mx + x + 0.03, 0.75, mz + 2.64)), white); }
    for (let z = -2.6; z <= 2.6; z += 0.34) for (const sx of [-1, 1]) b.add(boxGeo(V(ox + mx + sx * 3.22 - 0.03, 0, mz + z - 0.03), V(ox + mx + sx * 3.22 + 0.03, 0.75, mz + z + 0.03)), white);
    for (const y of [0.22, 0.58]) for (const zz of [-2.58, 2.62]) b.add(boxGeo(V(ox + mx - 3.2, y, mz + zz - 0.02), V(ox + mx + 3.2, y + 0.06, mz + zz + 0.02)), white);
    for (const x of [-1.6, 1.6]) { b.add(boxGeo(V(ox + mx + x - 0.08, 0, mz + 2.2 - 0.08), V(ox + mx + x + 0.08, 2.6, mz + 2.2 + 0.08)), white); b.add(boxGeo(V(ox + mx + x - 0.6, 1.85, mz + 2.2 - 0.07), V(ox + mx + x + 0.6, 2.0, mz + 2.2 + 0.07)), white); } }
  // the village: small painted houses, the church with its steeple, fuel drums, a boat pulled up, power poles
  for (const [x, z, col, yaw] of [[-36, 22, "#6a8aa8", 0.1], [-40, 34, "#c9b36a", -0.2], [9, 16, "#a84a3a", 0.15], [16, 22, "#7a9a6a", -0.1], [-6, 26, "#d8d0c0", 0.05], [22, 30, "#5a6a8a", 0.2], [-26, 30, "#9a6a8a", -0.1]] as [number, number, string, number][]) houseAt(b, G, ox + x, z, 5, 4, 2.6, col, "#4a4a50", false, yaw);
  { const cx = 4, cz = 34; houseAt(b, G, ox + cx, cz, 6, 9, 3.6, "#f2efe6", "#7a2a2a", false, 0); b.add(boxGeo(V(ox + cx - 0.9, 0, cz - 5.4), V(ox + cx + 0.9, 7.5, cz - 3.6)), white); const sp = put(new THREE.ConeGeometry(1.1, 3.2, 4), M("frSteeple", "#7a2a2a"), cx, 9.1, cz - 4.5); sp.rotation.y = Math.PI / 4;
    b.add(boxGeo(V(ox + cx - 0.05, 10.7, cz - 4.55), V(ox + cx + 0.05, 11.8, cz - 4.45)), white); b.add(boxGeo(V(ox + cx - 0.3, 11.3, cz - 4.55), V(ox + cx + 0.3, 11.4, cz - 4.45)), white); }
  for (const [x, z] of [[-9, 11], [-8.4, 11.4], [-8.9, 11.9], [12, 12.5]]) b.add(new THREE.CylinderGeometry(0.3, 0.3, 0.88, 12).translate(ox + x, 0.44, z), M("frDrum", "#3a5a7a"));
  for (const z of [-20, 10, 40, 70]) { b.add(new THREE.CylinderGeometry(0.1, 0.12, 7, 8).translate(ox - 30, 3.5, z), M("frPole", "#5a4a3a")); b.add(boxGeo(V(ox - 31, 6.6, z - 0.06), V(ox - 29, 6.72, z + 0.06)), M("frPole", "#5a4a3a")); }
  for (let k = 0; k < 3; k++) b.add(rodGeo(V(ox - 30 - 0.9 + k * 0.9, 6.7, -20), V(ox - 30 - 0.9 + k * 0.9, 6.5, 70), 0.012), M("frCord", "#1a1a1e"));
  // the bush plane on the gravel strip (screen right, -x): high wing, red and white
  const plane = new THREE.Group(), red = M("frPlaneRed", "#b8332e"), pw = M("frPlaneW", "#ece6d8");
  { const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.3, 6.5, 14), pw); fus.rotation.z = Math.PI / 2; fus.position.set(0, 1.4, 0); plane.add(fus);
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.55, 1.0, 14), red); nose.rotation.z = Math.PI / 2; nose.position.set(3.4, 1.4, 0); plane.add(nose);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 11), red); wing.position.set(1.4, 2.15, 0); plane.add(wing);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.1), red); tail.position.set(-3.0, 2.1, 0); plane.add(tail); const st = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 3.0), red); st.position.set(-3.0, 1.55, 0); plane.add(st);
    for (const sz of [-1, 1]) { const strut = new THREE.Mesh(rodGeo(V(0.9, 1.1, sz * 0.5), V(1.4, 2.1, sz * 2.8), 0.04), pw); plane.add(strut); const leg = new THREE.Mesh(rodGeo(V(2.2, 1.0, sz * 0.4), V(2.2, 0.4, sz * 1.1), 0.05), M("frIron", "#2e2c34")); plane.add(leg);
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16), M("frTyre", "#1e1e22")); wh.rotation.x = Math.PI / 2; wh.position.set(2.2, 0.38, sz * 1.15); plane.add(wh); }
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.12), M("frPlaneGlass", "#3a4a5a")); win.position.set(1.8, 1.7, 0); plane.add(win);
    const reg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), new THREE.MeshLambertMaterial({ map: boardTex("N4417B", "#ece6d8", "#2a2228", 512, 128), side: THREE.DoubleSide })); reg.position.set(-1.6, 1.45, -0.42); reg.rotation.y = Math.PI; plane.add(reg); }
  const prop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.0, 0.16), M("frProp", "#2a2a2e")); prop.position.set(3.95, 1.4, 0); plane.add(prop);
  shadowAll(plane); plane.position.set(ox - 13, 0, 9); plane.rotation.y = -0.5; G.add(plane);
  { const strip = new THREE.Mesh(new THREE.PlaneGeometry(10, 120), gravel); strip.rotation.x = -Math.PI / 2; strip.position.set(ox - 16, 0.03, 20); strip.receiveShadow = true; G.add(strip); }
  b.build(G, true);
  // low hills far off, paler; the grey sky; a few snow patches on the hills
  mountain(G, "frAkHills", ox, 0, 260, 700, 36, 33, 0.1, 0.25, "#8a8070");
  skyPlane(G, "grey", ox, 480, 1800, 700, -30);
  const dust = dustMotes(V(ox, 1.2, 3), V(16, 3, 12), 160, new THREE.Color(1.0, 0.98, 0.9), 0.03, 0.4); G.add(dust.points);
  noInk(G);
  return { group: G, lid, pit, plane, prop, lantern, dust, drift: (t) => dust.drift(t) };
}

// =====================================================================================================================
export type LabSet = { group: THREE.Group; screen: THREE.MeshBasicMaterial; parcel: THREE.Group; open: THREE.Group; jar: THREE.Group; tubes: THREE.PointLight[]; drift: (t: number) => void };
export function buildLab(): LabSet {
  const G = new THREE.Group(), ox = SET.lab[0], put = putter(G, ox), b = new Batch(), { w: W, z0: Z0, z1: Z1, h: H } = LAB;
  const wall = T("frLabWallM", () => labWallTex()), tile = lam("frTileM", () => ({ map: repeat(tileTex(), 6, 6) })), cab = M("frCab", "#d8d4c8"), top = M("frTop", "#2a2a30"), steel = M("frSteel", "#b9bcc2"), dark = M("frDarkLab", "#3a3a40");
  b.add(boxGeo(V(ox - W - 0.3, -0.3, Z0 - 0.3), V(ox + W + 0.3, 0, Z1 + 0.3)), tile);
  b.add(boxGeo(V(ox - W - 0.3, H, Z0 - 0.3), V(ox + W + 0.3, H + 0.25, Z1 + 0.3), 1), M("frCeil", "#e8e8e4"));
  b.add(boxGeo(V(ox - W - 0.3, 0, Z1), V(ox + W + 0.3, H, Z1 + 0.3), 2.0), wall); b.add(boxGeo(V(ox + W, 0, Z0), V(ox + W + 0.3, H, Z1), 2.0), wall); b.add(boxGeo(V(ox - W - 0.3, 0, Z0), V(ox - W, H, Z1), 2.0), wall); b.add(boxGeo(V(ox - W, 0, Z0 - 0.3), V(ox + W, H, Z0), 2.0), wall);
  // the bench along the back wall: cupboards, a black worktop, a shelf above
  b.add(boxGeo(V(ox - W + 0.2, 0, Z1 - 0.75), V(ox + W - 0.2, BENCH_Y - 0.04, Z1 - 0.02)), cab); b.add(boxGeo(V(ox - W + 0.15, BENCH_Y - 0.04, Z1 - 0.8), V(ox + W - 0.15, BENCH_Y, Z1)), top);
  for (let x = -W + 0.7; x < W - 0.4; x += 0.8) b.add(boxGeo(V(ox + x - 0.01, 0.1, Z1 - 0.77), V(ox + x + 0.01, BENCH_Y - 0.1, Z1 - 0.75)), dark);
  b.add(boxGeo(V(ox - W + 0.2, 1.75, Z1 - 0.35), V(ox + W - 0.2, 1.79, Z1 - 0.02)), steel);
  // microscope
  { const [sx, sy, sz] = SCOPE; b.add(boxGeo(V(ox + sx - 0.16, sy, sz - 0.12), V(ox + sx + 0.16, sy + 0.05, sz + 0.14)), dark); b.add(boxGeo(V(ox + sx - 0.05, sy + 0.05, sz + 0.06), V(ox + sx + 0.05, sy + 0.42, sz + 0.14)), dark);
    b.add(new THREE.CylinderGeometry(0.045, 0.05, 0.3, 12).rotateX(-0.5).translate(ox + sx, sy + 0.46, sz + 0.02), dark); for (const dx of [-0.03, 0.03]) b.add(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8).rotateX(-0.5).translate(ox + sx + dx, sy + 0.62, sz - 0.05), steel);
    b.add(boxGeo(V(ox + sx - 0.1, sy + 0.18, sz - 0.08), V(ox + sx + 0.1, sy + 0.2, sz + 0.06)), steel); }
  // the computer: a beige monitor showing the sequence, a keyboard
  const screen = new THREE.MeshBasicMaterial({ map: seqTex(false), color: new THREE.Color(1.25, 1.25, 1.25), fog: false });
  { const [mx, my, mz] = SCREEN; b.add(boxGeo(V(ox + mx - 0.3, my, mz - 0.25), V(ox + mx + 0.3, my + 0.48, mz + 0.25)), M("frBeige", "#d8cfb8")); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.36), screen); s.rotation.y = Math.PI; s.position.set(ox + mx, my + 0.25, mz - 0.255); G.add(s);
    b.add(boxGeo(V(ox + mx - 0.24, my, mz - 0.62), V(ox + mx + 0.24, my + 0.03, mz - 0.45)), M("frBeige", "#d8cfb8")); const gl = new THREE.PointLight("#9ad0ff", 1.5, 2.5, 1.5); gl.position.set(ox + mx, my + 0.3, mz - 0.6); G.add(gl); }
  // a rack of tubes, bottles, a freezer, a fume hood, a notice board
  for (let k = 0; k < 8; k++) put(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), M("frTube" + (k % 3), ["#e05a4a", "#e8e4dc", "#5a8ae0"][k % 3]), 2.0 + k * 0.035, BENCH_Y + 0.08, 3.4, false);
  b.add(boxGeo(V(ox + 1.96, BENCH_Y, 3.35), V(ox + 2.28, BENCH_Y + 0.05, 3.45)), steel);
  for (let k = 0; k < 7; k++) put(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), M("frBottleL" + (k % 3), ["#8a5a2a", "#e8e4dc", "#4a6a8a"][k % 3]), -3.8 + k * 0.4, 1.89, Z1 - 0.18, false);
  { b.add(boxGeo(V(ox - W + 0.05, 0, -1.6), V(ox - W + 0.85, 1.95, -0.4)), M("frFreezer", "#eeeeea")); const lb = put(new THREE.PlaneGeometry(0.5, 0.18), lam("frFreezLab", () => ({ map: labelTex("-80 °C", "#2f4f7a", "#ffffff", 2) })), -W + 0.86, 1.55, -1.0, false); lb.rotation.y = -Math.PI / 2; }
  b.add(boxGeo(V(ox + W - 1.2, BENCH_Y, Z1 - 0.78), V(ox + W - 0.15, 2.3, Z1 - 0.7)), M("frHoodGlass", "#9ab4c4", { transparent: true, opacity: 0.4 })); b.add(boxGeo(V(ox + W - 1.25, 2.3, Z1 - 0.8), V(ox + W - 0.1, 2.75, Z1 - 0.02)), cab);
  { const nb = put(new THREE.PlaneGeometry(1.2, 0.8), lam("frNotice", () => ({ map: labelTex("PATHOLOGY", "#b89a6a", "rgba(40,30,26,0.9)", 2) })), -1.2, 2.25, Z1 - 0.02, false); nb.rotation.y = Math.PI; }
  // the empty jar on the shelf: "1918 FLU" (nobody kept a sample)
  const jar = new THREE.Group(); { const g = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.26, 16, 1, true), new THREE.MeshLambertMaterial({ color: new THREE.Color(0.75, 0.85, 0.9), transparent: true, opacity: 0.35, side: THREE.DoubleSide })); jar.add(g); const lidm = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.04, 16), M("frJarLid", "#2a2a30")); lidm.position.y = 0.15; jar.add(lidm);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.09), new THREE.MeshBasicMaterial({ map: labelTex("1918 FLU", "#f6f1e4", "rgba(30,20,20,0.95)", 2) })); lb.rotation.y = Math.PI; lb.position.set(0, -0.02, -0.112); jar.add(lb); jar.position.set(ox - 0.3, 1.92, Z1 - 0.18); G.add(jar); }
  // the parcel from Alaska: closed, and opened (a cooler, sample tubes in ice)
  const parcel = new THREE.Group(), open = new THREE.Group();
  { const pm = new THREE.MeshLambertMaterial({ map: parcelTex() }), side = M("frCard", "#b98e58"); const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.38), [side, side, pm, side, side, side]); box.position.y = 0.15; parcel.add(box);
    const cool = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.26, 0.32), M("frCooler", "#f2f2ee")); cool.position.y = 0.13; open.add(cool); const ic = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.28), M("frIceL", "#d8ecf6")); ic.position.y = 0.265; open.add(ic);
    for (let k = 0; k < 4; k++) { const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), M("frTubeS", "#f6efdc")); tb.position.set(-0.12 + k * 0.08, 0.3, 0); tb.rotation.z = 0.2 * (k - 1.5); open.add(tb); } }
  shadowAll(parcel); shadowAll(open); parcel.visible = open.visible = false; G.add(parcel, open);
  // fluorescent tubes in the ceiling (named lights)
  const tubes: THREE.PointLight[] = [];
  for (const [x, z] of [[-2.2, 0], [2.2, 0], [0, 2.6]]) { const tb = put(new THREE.BoxGeometry(1.4, 0.05, 0.22), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.5, 2.6), fog: false }), x, H - 0.04, z, false); void tb; const l = new THREE.PointLight("#f0f6ff", 7, 9, 1.3); l.position.set(ox + x, H - 0.3, z); G.add(l); tubes.push(l); }
  // the window on the -x wall: blinds over a night sky
  { const v = put(new THREE.PlaneGeometry(1.8, 1.2), new THREE.MeshBasicMaterial({ map: skyTex("dusk"), color: new THREE.Color(0.6, 0.65, 0.8), fog: false }), -W + 0.01, 1.8, 1.2, false); v.rotation.y = Math.PI / 2; for (let k = 0; k < 10; k++) { const s = put(new THREE.BoxGeometry(0.02, 0.05, 1.8), M("frBlind", "#e8e4d8"), -W + 0.05, 1.25 + k * 0.12, 1.2, false); s.rotation.z = 0.5; } }
  b.build(G, true);
  const dust = dustMotes(V(ox, 1.6, 1), V(9, 2.6, 8), 120, new THREE.Color(0.95, 0.98, 1.0), 0.02, 0.35); G.add(dust.points);
  noInk(G);
  return { group: G, screen, parcel, open, jar, tubes, drift: (t) => dust.drift(t) };
}
