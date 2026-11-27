// The Dexter Short: the four sets (place.ts says where). Built to the background rules and the production
// checklist: every post reaches the ground, nothing floats, far ground has texture, signs are whole words, every light
// has a source, trees keep clear of buildings and cameras, skies are closed, water moves and breaks at its edges.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD } from "../bridge/paint";
import { mergeFacets, pineGeo, bushGeo, dustMotes, rockGeo, rockTex, dirtTex, rockWall } from "../bridge/scenery";
import { M, noInk, shadowAll, sheet, rodGeo, houseAt, flame, waterMat, glow } from "../frozen/fsets";
import { foamTex } from "../frozen/fpaint";
import { NOINK } from "../bridge/ink";
import { signTex } from "../cahaba/cpaint";
import { SET, ST_Z0, ST_Z1, BLD_Z, BANK_Z0, BANK_Z1, bankZ, WATER_Y, FAR_Z, riverY, TAVERN, WHARF, SHIP, ROOM, BAR, TABLE, MAP, STOVE, SHORE_Z, LAKE_Y, OUTCROP, PORTAL, northY,
  CRATES, COALP, FIRE, SHOP, HS_Z0, HS_Z1, FENCE_Z, ARCH_W, ARCH_H, ARCH_Z, PATH_W, HOUSE_Z, HOUSE_W, HOUSE_D, HOUSE_H, COL_H, COLS, DEX_COL, COFFIN, DESK, DESK_Y } from "./place";
import { logTex, clapTex, streetTex, snowTex, copperRockTex, frostTex, twSkyTex, rep, pageTex, brickTex } from "./dpaint";

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
/** pines and leafy trees at spots [x, y, z, scale]; snow caps on the pines if snowy */
const forest = (G: THREE.Object3D, spots: [number, number, number, number][], key: string, leafy = 0.5, snow?: THREE.Object3D) => {
  const fol: Fol = [], bark: Fol = [], leaf: Fol = [], cap: Fol = [];
  spots.forEach(([x, y, z, s], i) => {
    const pine = ((i * 37) % 100) / 100 >= leafy;
    if (pine) { const h = 11 * s, [f, t] = pineGeo(h, 2.8 * s, i + 3); fol.push({ g: f, m: M4(x, y - 0.2, z, i), tint: 0.82 + 0.24 * ((i * 3) % 5) / 5 }); bark.push({ g: t, m: M4(x, y - 0.2, z, i) });
      if (snow) for (let k = 0; k < 3; k++) { const c = new THREE.ConeGeometry(2.2 * s * (1 - k * 0.27), 1.3 * s, 7); c.translate(0, h * (0.42 + k * 0.2), 0); cap.push({ g: c, m: M4(x, y, z, i + k) }); } return; }
    const t = new THREE.CylinderGeometry(0.22 * s, 0.4 * s, 5 * s, 7); t.translate(0, 2.4 * s, 0); bark.push({ g: t, m: M4(x, y - 0.2, z, i) });
    for (let k = 0; k < 3; k++) leaf.push({ g: bushGeo(2.3 * s, i * 7 + k, 4), m: M4(x + (k - 1) * 1.4 * s, y + (4.0 + (k % 2) * 1.3) * s, z + ((k * 5) % 3 - 1) * 1.0 * s, i + k), tint: 0.82 + 0.25 * ((i + k) % 3) / 2 });
    leaf.push({ g: bushGeo(2.9 * s, i * 3 + 1, 5), m: M4(x, y + 6.0 * s, z, i), tint: 0.95 }); });
  const mk = (l: Fol, k: string, col: string, par: THREE.Object3D) => { if (!l.length) return; const a = new THREE.Mesh(mergeFacets(l), lam(k, () => ({ color: col, vertexColors: true, flatShading: true }))); shadowAll(a); par.add(a); };
  mk(fol, "twPine" + key, "#3c5a3c", G); mk(bark, "twBark" + key, "#4a3c30", G); mk(leaf, "twLeaf" + key, "#5a7a36", G); if (snow) mk(cap, "twCap" + key, "#f2f5f8", snow);
};
/** a painted sign facing -z (toward the cameras): whole words */
const sign = (G: THREE.Object3D, text: string, x: number, y: number, z: number, w: number, h: number, bg = "#f2ecdc", fg = "#1a1a2a", ry = Math.PI) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: signTex(text, bg, fg, 1024, Math.round(1024 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; G.add(m); return m; };
/** a log cabin / store front facing -z: squared-log walls, a gable roof of boards, a door, two shuttered windows */
const cabin = (G: THREE.Object3D, x: number, z: number, w: number, d: number, h: number, wallM: THREE.Material, roofCol: string, lit = false) => {
  const g = new THREE.Group(); g.add(new THREE.Mesh(boxGeo(V(-w / 2, 0, 0), V(w / 2, h, d), 2), wallM));
  const sh = new THREE.Shape([new THREE.Vector2(-w / 2 - 0.35, h), new THREE.Vector2(0, h + w * 0.36), new THREE.Vector2(w / 2 + 0.35, h)]), rg = new THREE.ExtrudeGeometry(sh, { depth: d + 0.7, bevelEnabled: false }); rg.translate(0, 0, -0.35);
  g.add(new THREE.Mesh(rg, lam("twRoof" + roofCol, () => ({ map: planksHD(), color: roofCol }))));
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.0), M("twDoor", "#4a3022")); door.rotation.y = Math.PI; door.position.set(-0.1 * w, 1.0, -0.012); g.add(door);
  const win = new THREE.MeshBasicMaterial({ color: lit ? new THREE.Color(2.0, 1.5, 0.8) : new THREE.Color(0.2, 0.24, 0.3) });
  for (const sx of [-0.33, 0.25]) { if (Math.abs(sx * w + 0.1 * w) < 0.9) continue; const wm = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), win); wm.rotation.y = Math.PI; wm.position.set(sx * w, h * 0.55, -0.012); g.add(wm);
    for (const s2 of [-1, 1]) { const sht = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.95), M("twShutter", "#3a5a3a")); sht.rotation.y = Math.PI; sht.position.set(sx * w + s2 * 0.62, h * 0.55, -0.014); g.add(sht); } }
  g.position.set(x, 0, z); shadowAll(g); G.add(g); return g;
};

// =====================================================================================================================
export type RiverSet = { group: THREE.Group; water: ReturnType<typeof waterMat>; foam: THREE.Mesh[]; ship: THREE.Group; turf: (x: number, z: number) => number | null; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void;
  /** dressings: the pines (Newburyport, Newcastle), the palms (West Indies), crates of bed warmers, the coal heap, the strike board; skies */
  trees: THREE.Group; palms: THREE.Group; pans: THREE.Group; coal: THREE.Group; strike: THREE.Group; skies: Record<"day" | "grey" | "hot", THREE.Mesh> };
/** a palm: a leaning, ringed trunk and a fan of drooping fronds (two tones), every frond attached at the crown */
const palmAt = (G: THREE.Object3D, x: number, y: number, z: number, h: number, lean: number, seed: number) => {
  const g = new THREE.Group(), trunk = M("dxPalmTrunk", "#9a7a54"), ring = M("dxPalmRing", "#6a5236"), fr = [M("dxFrondA", "#4f9a4a"), M("dxFrondB", "#3a7a3c")];
  const tilt = new THREE.Group(); tilt.rotation.z = lean; g.add(tilt);
  tilt.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.26, h, 10).translate(0, h / 2, 0), trunk));
  for (let k = 1; k < 9; k++) tilt.add(new THREE.Mesh(new THREE.TorusGeometry(0.22 - k * 0.006, 0.035, 5, 14).rotateX(Math.PI / 2).translate(0, (k / 9) * h, 0), ring));
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + seed, len = 2.6 + 0.4 * Math.sin(k * 1.7 + seed);
    const f = new THREE.Group(); f.position.set(0, h - 0.05, 0); f.rotation.y = -a; tilt.add(f);
    const shp = new THREE.Shape([new THREE.Vector2(0, -0.05), new THREE.Vector2(len * 0.45, -0.34), new THREE.Vector2(len, 0), new THREE.Vector2(len * 0.45, 0.34), new THREE.Vector2(0, 0.05)]);
    const fg = new THREE.ShapeGeometry(shp); fg.rotateX(-Math.PI / 2); const pp = fg.attributes.position as THREE.BufferAttribute; for (let i = 0; i < pp.count; i++) { const u = pp.getX(i) / len; pp.setY(i, -0.9 * u * u - 0.1 * u); } fg.computeVertexNormals();
    f.add(new THREE.Mesh(fg, fr[k % 2])); }
  tilt.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6).translate(0, h - 0.1, 0), M("dxCoco", "#5a4226")));
  g.position.set(x, y, z); g.rotation.y = seed; shadowAll(g); G.add(g); return g; };
/** a warming pan: a lidded brass pan on a long wooden handle (local: the pan's centre at the origin, the handle along +x) */
export const warmingPan = (scale = 1) => { const g = new THREE.Group(), brass = M("dxBrass", "#d8a83a", { emissive: "#5a3a08", emissiveIntensity: 0.35 }), dk = M("dxBrassD", "#a8782a"), wd = M("dxPanWood", "#6a4226");
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.08, 18), dk)); const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.025, 18).translate(0, 0.05, 0), brass); g.add(lid);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 6).translate(Math.cos(a) * 0.09, 0.066, Math.sin(a) * 0.09), dk)); }
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.95, 8).rotateZ(Math.PI / 2).translate(0.64, 0.0, 0), wd));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8).rotateZ(Math.PI / 2).translate(0.2, 0, 0), brass));
  g.scale.setScalar(scale); shadowAll(g); return g; };
export function buildRiver(): RiverSet {
  const G = new THREE.Group(), ox = SET.river[0], b = new Batch();
  const trees = new THREE.Group(), palms = new THREE.Group(), pans = new THREE.Group(), coal = new THREE.Group(), strike = new THREE.Group(); G.add(trees, palms, pans, coal, strike);
  const r = (k: number) => ((k * 9301 + 49297) % 233280) / 233280;
  const wood = lam("twWood", () => ({ map: planksHD(), color: "#8a6a4a" })), dark = lam("twWoodD", () => ({ map: planksHD(), color: "#5a4230" }));
  // ground: grass everywhere, the street on top, the bank down to the river, gravel at the water line, the far bank
  { const g = sheet(ox - 160, ox + 160, -80, 110, 160, 120, (x, z) => riverY(x - ox, z) + (z < BANK_Z0 || z > FAR_Z + 4 ? 0.05 * Math.sin(x * 0.7 + z * 0.4) : 0), 4);
    const m = new THREE.Mesh(g, lam("twGrassM", () => ({ map: dirtTex("twGrassT", "#4e6e30"), color: "#8aa05e" }))); m.receiveShadow = true; G.add(m);
    const gb = sheet(ox - 160, ox + 160, BANK_Z0 + 1.5, BANK_Z1 + 2, 160, 8, () => 0, 3);
    { const pp = gb.attributes.position as THREE.BufferAttribute; for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), z = bankZ(x - ox) + pp.getZ(i) - BANK_Z0; pp.setZ(i, z); pp.setY(i, riverY(x - ox, z) + 0.03); } gb.computeVertexNormals(); }
    const mb = new THREE.Mesh(gb, lam("twBankM", () => ({ map: dirtTex("twBankT", "#8a7458"), color: "#b09878" }))); mb.receiveShadow = true; G.add(mb);
    const gf = sheet(ox - 160, ox + 160, FAR_Z - 3, FAR_Z + 5, 160, 6, (x, z) => riverY(x - ox, z) + 0.03, 3); const mf = new THREE.Mesh(gf, lam("twBankM", () => ({ map: dirtTex("twBankT", "#8a7458"), color: "#b09878" }))); mf.receiveShadow = true; G.add(mf); }
  { const g = new THREE.PlaneGeometry(320, ST_Z1 - ST_Z0, 1, 1); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 50, uv.getY(i));
    const st = new THREE.Mesh(g, lam("twStreetM", () => ({ map: rep(streetTex(), 1, 1) }))); st.position.set(ox, 0.07, (ST_Z0 + ST_Z1) / 2); st.receiveShadow = true; G.add(st); }
  // board walks in front of the buildings
  b.add(B(ox - 60, 0, ST_Z1 + 0.2, ox - 4, 0.22, BLD_Z - 0.05, 2), wood);
  for (let x = -59; x <= -5; x += 3) b.add(B(ox + x - 0.08, 0, ST_Z1 + 0.25, ox + x + 0.08, 0.22, ST_Z1 + 0.4), dark);
  // the buildings along the far side of the street (screen right): log stores, frame houses; the tavern with its sign
  { const logM = lam("dxClapW", () => ({ map: rep(clapTex("#e6e0d2"), 2, 1.4) })), logM2 = lam("dxBrickM", () => ({ map: rep(brickTex(), 3, 2) }));
    cabin(G, ox + TAVERN.x, BLD_Z, 8, 7, 4.2, logM, "#5a4636", true);
    sign(G, "TAVERN", ox + TAVERN.x, 4.9, BLD_Z - 0.04, 3.4, 0.8, "#3a2418", "#f2d68a");
    b.add(B(ox + TAVERN.x - 4.4, 3.05, BLD_Z - 1.6, ox + TAVERN.x + 4.4, 3.15, BLD_Z), dark); // porch roof
    for (const sx of [-4.2, 4.2]) b.add(B(ox + TAVERN.x + sx - 0.08, 0, BLD_Z - 1.6, ox + TAVERN.x + sx + 0.08, 3.05, BLD_Z - 1.44), dark);
    cabin(G, ox - 24, BLD_Z, 9, 8, 4.6, logM2, "#4a3a2e");
    sign(G, "T. DEXTER|HIDES & GLOVES", ox + SHOP[0], 3.9, BLD_Z - 0.04, 3.2, 1.1, "#2a3a5a", "#f2e6c8");
    // hides hung on a rail beside his door (posts to the board walk)
    { const hb = new Batch(), hx = ox + SHOP[0] + 1.75; hb.add(B(hx - 0.95, 2.55, BLD_Z - 0.55, hx + 0.95, 2.62, BLD_Z - 0.48), dark); for (const sx of [-0.9, 0.9]) hb.add(B(hx + sx - 0.05, 0.22, BLD_Z - 0.56, hx + sx + 0.05, 2.62, BLD_Z - 0.46), dark); hb.build(G, true);
      [-0.55, 0.05, 0.6].forEach((dx, k) => { const pts: THREE.Vector2[] = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, rr = 0.34 + 0.07 * Math.sin(i * 2.7 + k) ; pts.push(new THREE.Vector2(Math.cos(a) * rr * 0.8, Math.sin(a) * rr * 1.15)); }
        const hm = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts)), M("dxHide" + k, ["#8a5a32", "#a87040", "#6a4224"][k])); hm.position.set(hx + dx, 1.9, BLD_Z - 0.6); hm.rotation.y = Math.PI; G.add(hm); }); }
    houseAt(b, G, ox - 35, BLD_Z + 3, 7, 6, 4.4, "#c9b48a", "#5a4a3e", false, 0);
    cabin(G, ox - 45, BLD_Z, 8, 7, 4.0, lam("twClapM", () => ({ map: rep(clapTex("#9aaab4"), 2, 1.4) })), "#4a3e34");
    houseAt(b, G, ox - 56, BLD_Z + 3, 7, 6, 4.2, "#a8846a", "#4a3e34", false, 0);
    cabin(G, ox - 6.5, BLD_Z + 1, 4.5, 6, 3.6, logM2, "#4a3a2e");
    // across the street (near side, behind the cameras for most shots): a few more, for the reverse angles
    for (const [x, w] of [[-20, 8], [-34, 9], [-48, 7]] as [number, number][]) { const g = cabin(G, ox + x, -10.5, w, 7, 4.0, logM, "#5a4636"); g.rotation.y = Math.PI; g.position.z = -5.5; } }
  // hitching rail and a water trough in front of the tavern; barrels and crates on the walk
  { b.add(B(ox + TAVERN.x - 2.8, 0.95, ST_Z1 - 0.6, ox + TAVERN.x + 2.8, 1.05, ST_Z1 - 0.5), dark); for (const sx of [-2.7, 0, 2.7]) b.add(B(ox + TAVERN.x + sx - 0.07, 0, ST_Z1 - 0.62, ox + TAVERN.x + sx + 0.07, 1.0, ST_Z1 - 0.48), dark);
    b.add(B(ox - 20, 0, ST_Z1 - 0.9, ox - 18, 0.55, ST_Z1 - 0.2, 1), dark); b.add(B(ox - 19.9, 0.45, ST_Z1 - 0.8, ox - 18.1, 0.5, ST_Z1 - 0.3), M("twTroughW", "#4a6a7a"));
    const barrel = new THREE.CylinderGeometry(0.36, 0.36, 0.9, 12); for (const [x, z] of [[-17.3, 4.4], [-16.6, 4.7], [-28.6, 4.5], [-29.3, 4.6]]) b.add(barrel.clone().translate(ox + x, 0.22 + 0.45, z), M("twBarrel", "#7a5232"));
    for (const [x, z] of [[-27.6, 4.5]]) b.add(B(ox + x - 0.45, 0.22, z - 0.4, ox + x + 0.45, 0.95, z + 0.4, 1), wood); }
  // the wharf: plank deck over the water on posts down to the river bed; bollards; crates
  { const { x0, x1, z1, y } = WHARF;
    b.add(B(ox + x0, y - 0.18, BANK_Z0 - 1.5, ox + x1, y, z1, 2), wood);
    for (let z = BANK_Z0; z <= z1; z += 3) for (const x of [x0 + 0.2, x1 - 0.2]) { const gy = riverY(x, z); b.add(new THREE.CylinderGeometry(0.16, 0.16, y - gy + 0.3, 8).translate(ox + x, (y + gy) / 2 - 0.1, z), dark); }
    for (const z of [18, 24]) b.add(new THREE.CylinderGeometry(0.14, 0.16, 0.5, 8).translate(ox + x1 - 0.4, y + 0.25, z), M("twIron", "#2e2a2c"));
    b.add(B(ox + x0 + 0.4, y, 20.5, ox + x0 + 1.4, y + 0.8, 21.5, 1), wood); b.add(B(ox + x0 + 0.5, y + 0.8, 20.7, ox + x0 + 1.2, y + 1.4, 21.3, 1), wood); }
  // the schooner moored off the wharf's end: hull, two masts with furled sails, a bowsprit
  const ship = new THREE.Group(); G.add(ship);
  { const hull = new THREE.Shape([new THREE.Vector2(-1.4, -6), new THREE.Vector2(1.4, -6), new THREE.Vector2(1.6, 2.6), new THREE.Vector2(0, 6.4), new THREE.Vector2(-1.6, 2.6)]);
    const hg = new THREE.ExtrudeGeometry(hull, { depth: 2.2, bevelEnabled: false }); hg.rotateX(-Math.PI / 2); hg.translate(0, -0.9, 0);
    ship.add(new THREE.Mesh(hg, M("twHull", "#2a2a32")));
    const st = new THREE.ExtrudeGeometry(hull, { depth: 0.25, bevelEnabled: false }); st.rotateX(-Math.PI / 2); st.translate(0, 0.5, 0); st.scale(1.01, 1, 1.01); ship.add(new THREE.Mesh(st, M("twHullS", "#e9e2cf")));
    const deck = new THREE.ExtrudeGeometry(hull, { depth: 0.05, bevelEnabled: false }); deck.rotateX(-Math.PI / 2); deck.translate(0, 1.28, 0); deck.scale(0.94, 1, 0.94); ship.add(new THREE.Mesh(deck, wood));
    const mast = M("twMast", "#6a4a30"), sail = M("twSail", "#e9e2cf");
    for (const [z, h] of [[-1.8, 11], [2.4, 12]] as [number, number][]) { ship.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, h, 8).translate(0, 1.3 + h / 2, z), mast));
      ship.add(new THREE.Mesh(rodGeo(V(0, 2.6, z), V(0, 2.6, z - 4.2), 0.07), mast)); ship.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 3.8, 10).rotateX(Math.PI / 2).translate(0, 2.9, z - 2.0), sail));
      ship.add(new THREE.Mesh(rodGeo(V(0, 1.3 + h, z), V(0, 1.3, z - 5.6), 0.02), M("twRope", "#3a3028"))); }
    ship.add(new THREE.Mesh(rodGeo(V(0, 1.4, 6.2), V(0, 2.4, 10.2), 0.07), mast));
    ship.position.set(ox + SHIP[0], SHIP[1], SHIP[2]); ship.rotation.y = -Math.PI / 2; shadowAll(ship); }
  // the river: moving water, foam along the banks and round the posts and the hull
  const water = waterMat("#2c4a4a", "#5a7a6a", "#b9cbd6", "maumee"); water.U.uAmp.value = 0.22;
  { const g = new THREE.PlaneGeometry(320, FAR_Z - 8, 200, 60); g.rotateX(-Math.PI / 2); g.translate(ox, WATER_Y, (FAR_Z + 8) / 2); const w = new THREE.Mesh(g, water.mat); w.receiveShadow = true; G.add(w); }
  const foam: THREE.Mesh[] = [], foamM = new THREE.MeshBasicMaterial({ map: foamTex(), transparent: true, depthWrite: false, opacity: 0.7, fog: true, color: new THREE.Color(0.9, 0.94, 0.96) });
  for (let x = -150; x <= 150; x += 2.6) { const zf = bankZ(x) + (BANK_Z1 - BANK_Z0) * 0.5, sl = (bankZ(x + 1) - bankZ(x - 1)) / 2; const f = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.0), foamM); f.rotation.set(-Math.PI / 2, 0, -Math.atan(sl)); f.position.set(ox + x, WATER_Y + 0.1, zf + 0.2 * Math.sin(x)); f.renderOrder = 2; G.add(f); foam.push(f); }
  for (let z = BANK_Z1; z <= WHARF.z1; z += 3) for (const x of [WHARF.x0 + 0.2, WHARF.x1 - 0.2]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), foamM); f.rotation.x = -Math.PI / 2; f.position.set(ox + x, WATER_Y + 0.1, z); f.renderOrder = 2; G.add(f); foam.push(f); }
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.4), foamM); f.rotation.x = -Math.PI / 2; f.position.set(ox + SHIP[0], WATER_Y + 0.1, SHIP[2]); f.renderOrder = 2; G.add(f); foam.push(f); }
  // trees: along the far bank and behind the town, clear of the buildings, the street and the camera spots
  { const spots: [number, number, number, number][] = [], r = (k: number) => ((k * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 110; i++) { const x = -150 + r(i) * 300, z = FAR_Z + 8 + r(i + 400) * 50; spots.push([ox + x, riverY(x, z), z, 0.8 + r(i + 900) * 0.5]); }
    for (let i = 0; i < 26; i++) { const x = -150 + r(i + 77) * 100; if (x > -64) continue; const z = 20 + r(i + 177) * 12; spots.push([ox + x, 0, z, 0.8 + r(i + 277) * 0.4]); }
    for (let i = 0; i < 24; i++) { const x = -80 + r(i + 55) * 70, z = BLD_Z + 13 + r(i + 155) * 8; if (x > -10) continue; spots.push([ox + x, 0, z, 0.8 + r(i + 255) * 0.4]); }
    forest(trees, spots.filter(([x, , z]) => z < bankZ(x - ox) - 1 || z > FAR_Z + 6), "river", 0.55);
    // the West Indies: palms on the near bank, along the street ends and over the far bank (none on the wharf or the street)
    const pal: [number, number][] = [[2.5, 7.2], [6.8, 6.4], [15.5, 7.6], [19, 6.8], [-2.8, 7.4], [-66, 4], [-70, 9], [24, 7.4]];
    pal.forEach(([x, z], i) => palmAt(palms, ox + x, 0, z, 6.2 + 1.3 * Math.sin(i * 2.3), 0.08 * Math.sin(i * 1.9) + 0.06, i * 1.3));
    for (let i = 0; i < 40; i++) { const x = -140 + r(i + 600) * 280, z = FAR_Z + 6 + r(i + 700) * 30; palmAt(palms, ox + x, riverY(x, z), z, 7 + 3 * r(i + 800), 0.1 * (r(i + 900) - 0.5), i); } }
  // the islanders' cooking fire: a ring of stones, crossed sticks, ash (the flames are puffs, posed per shot)
  { const [fx, , fz] = FIRE, st = M("dxFireSt", "#7a7068"), ash = M("dxAsh", "#3a3430"); for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, rk = new THREE.Mesh(rockGeo(0.16, k + 70, 0, 0.7), st); rk.position.set(ox + fx + Math.cos(a) * 0.5, 0.06, fz + Math.sin(a) * 0.5); palms.add(rk); }
    const ad = new THREE.Mesh(new THREE.CircleGeometry(0.42, 14), ash); ad.rotation.x = -Math.PI / 2; ad.position.set(ox + fx, 0.03, fz); palms.add(ad);
    for (const a of [0.3, 1.4, 2.5]) palms.add(new THREE.Mesh(rodGeo(V(ox + fx + Math.cos(a) * 0.45, 0.06, fz + Math.sin(a) * 0.45), V(ox + fx - Math.cos(a) * 0.3, 0.2, fz - Math.sin(a) * 0.3), 0.04), M("dxStick", "#5a3a22")));
    for (const sx of [-0.7, 0.7]) palms.add(new THREE.Mesh(rodGeo(V(ox + fx + sx, 0, fz), V(ox + fx + sx * 0.95, 1.1, fz), 0.03), M("dxStick", "#5a3a22")));
    palms.add(new THREE.Mesh(rodGeo(V(ox + fx - 0.75, 1.08, fz), V(ox + fx + 0.75, 1.08, fz), 0.025), M("dxStick", "#5a3a22"))); }
  // the cargo on the wharf: crates of bed warmers, a few out on top; the coal heap with a shovel and a barrow; the strike board
  { const [cx, cy, cz] = CRATES, crate = lam("dxCrate", () => ({ map: planksHD(), color: "#b08a5a" }));
    const cb = new Batch(); for (const [dx, dz, dy] of [[-0.6, 0, 0], [0.6, 0, 0], [0, 1.15, 0], [-0.6, 0, 0.9], [0.55, 1.2, 0.9]] as [number, number, number][]) cb.add(B(ox + cx + dx - 0.55, cy + dy, cz + dz - 0.5, ox + cx + dx + 0.55, cy + dy + 0.9, cz + dz + 0.5, 1), crate); cb.build(pans, true);
    for (const [dx, dy, dz, ry] of [[0.6, 0.92, -0.1, 0.4], [0.3, 0.95, 0.25, 2.2], [-0.4, 1.82, 0.1, -0.6]] as [number, number, number, number][]) { const wp = warmingPan(1); wp.position.set(ox + cx + dx, cy + dy, cz + dz); wp.rotation.y = ry; pans.add(wp); }
    const [kx, ky, kz] = COALP, cm = M("dxCoalM", "#2a282e"), cs = M("dxCoalS", "#4a4e5a");
    for (let i = 0; i < 26; i++) { const a = r(i + 40) * Math.PI * 2, d = 1.15 * Math.sqrt(r(i + 41)), hh = 0.95 * (1 - d / 1.3); const rk = new THREE.Mesh(rockGeo(0.32 + 0.22 * r(i + 42), i + 5, 0, 0.8), i % 4 ? cm : cs); rk.position.set(ox + kx + Math.cos(a) * d, ky + 0.1 + hh * r(i + 43), kz + Math.sin(a) * d * 0.8); coal.add(rk); }
    const heap = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.1, 10).translate(ox + kx, ky + 0.55, kz), cm); coal.add(heap);
    for (let i = 0; i < 14; i++) { const rk = new THREE.Mesh(rockGeo(0.22 + 0.1 * r(i + 90), i + 31, 0, 0.8), cm); rk.position.set(ox + SHIP[0] - 3 + 2.4 * r(i + 91), SHIP[1] + 1.4, SHIP[2] - 0.8 + 1.6 * r(i + 92)); coal.add(rk); }
    const bw = new Batch(); bw.add(B(ox + kx + 1.6, ky + 0.35, kz - 0.4, ox + kx + 2.4, ky + 0.65, kz + 0.4, 1), crate); bw.add(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 12).rotateX(Math.PI / 2).translate(ox + kx + 2.5, ky + 0.2, kz), M("dxIron", "#2e2a2c"));
    for (const dz of [-0.3, 0.3]) bw.add(rodGeo(V(ox + kx + 1.6, ky + 0.45, kz + dz), V(ox + kx + 0.9, ky + 0.75, kz + dz), 0.03), crate);
    for (const dz of [-0.3, 0.3]) bw.add(B(ox + kx + 1.7 - 0.03, ky, kz + dz - 0.03, ox + kx + 1.7 + 0.03, ky + 0.36, kz + dz + 0.03), crate);
    bw.build(coal, true); shadowAll(coal);
    const sb = new Batch(); for (const sx of [-1.0, 1.0]) sb.add(B(ox + 11 + sx - 0.06, WHARF.y, 10.4 - 0.06, ox + 11 + sx + 0.06, WHARF.y + 2.6, 10.4 + 0.06), M("dxPost", "#4a3424")); sb.build(strike, true);
    sign(strike, "STRIKE!|NO COAL DUG", ox + 11, WHARF.y + 2.0, 10.33, 2.4, 1.1, "#f2ecdc", "#a8231e"); shadowAll(strike); }
  const skies = { day: skyPl(G, twSkyTex("day"), "#6c9acc", ox, 30, 230, 160, -20), grey: skyPl(G, twSkyTex("grey"), "#6e7278", ox, 30, 229, 160, -20), hot: skyPl(G, twSkyTex("hot"), "#3a8ad8", ox, 30, 228, 160, -20) };
  const dust = dustMotes(V(ox, 2, 4), V(40, 4, 20), 160, new THREE.Color(1, 0.95, 0.8), 0.04, 0.35); G.add(dust.points);
  b.build(G, true); noInk(G);
  const turf = (x: number, z: number) => { const lx = x - ox; if (z > ST_Z0 - 0.1 && z < ST_Z1 + 0.1) return null; if (z > ST_Z1 && z < BLD_Z + 10 && lx < -4) return null; if (z > bankZ(lx) + 0.5 && z < FAR_Z + 4) return null; if (lx > WHARF.x0 - 0.3 && lx < WHARF.x1 + 0.3 && z > BANK_Z0 - 1.6) return null; if (Math.hypot(lx - FIRE[0], z - FIRE[2]) < 0.75) return null; return riverY(lx, z) + 0.05 * Math.sin(x * 0.7 + z * 0.4); };
  return { group: G, water, foam, ship, turf, dust, drift: (t) => { water.U.uTime.value = t; dust.drift(t); }, trees, palms, pans, coal, strike, skies };
}

// =====================================================================================================================
export type WoodsSet = { group: THREE.Group; turf: (x: number, z: number) => number | null; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void; coffin: THREE.Group; lid: THREE.Object3D; skies: Record<"day" | "grey", THREE.Mesh> };
/** Lord Dexter's mansion on High Street (set-local, the cameras on the street side, -z, looking toward the house, +z) */
export function buildWoods(): WoodsSet {
  const G = new THREE.Group(), ox = SET.woods[0], b = new Batch(), r = (k: number) => ((k * 9301 + 49297) % 233280) / 233280;
  const gy = (x: number, z: number) => (z < FENCE_Z ? 0 : 0.03 * Math.sin(x * 0.5 + z * 0.3) + 0.03 * Math.sin(x * 1.3 - z * 0.9));
  const white = M("dxPaintW", "#eeeae0"), trim = M("dxTrim", "#fbf8f0"), gold = M("dxGold", "#e0b040", { emissive: "#6a4a08", emissiveIntensity: 0.45 }), dark = lam("dxWoodD", () => ({ map: planksHD(), color: "#4a3424" }));
  // ground: the lawn, High Street's dirt in front, the gravel path from the gate to the door
  { const g = sheet(ox - 140, ox + 140, -70, 120, 140, 95, (x, z) => gy(x - ox, z), 4), m = new THREE.Mesh(g, lam("dxLawnM", () => ({ map: dirtTex("dxLawnT", "#4e6e30"), color: "#8aa05e" }))); m.receiveShadow = true; G.add(m); }
  { const g = new THREE.PlaneGeometry(280, HS_Z1 - HS_Z0, 1, 1); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 44, uv.getY(i));
    const st = new THREE.Mesh(g, lam("twStreetM", () => ({ map: rep(streetTex(), 1, 1) }))); st.position.set(ox, 0.06, (HS_Z0 + HS_Z1) / 2); st.receiveShadow = true; G.add(st); }
  { const g = new THREE.PlaneGeometry(PATH_W * 2, HOUSE_Z - FENCE_Z + 0.5); g.rotateX(-Math.PI / 2); const pm = new THREE.Mesh(g, lam("dxGravel", () => ({ map: dirtTex("dxGravelT", "#c8b898"), color: "#e0d4bc" }))); pm.position.set(ox, 0.07, (HOUSE_Z + FENCE_Z) / 2); pm.receiveShadow = true; G.add(pm); }
  // the white picket fence along the street, open at the gate
  for (let x = -40; x <= 40; x += 0.32) { if (Math.abs(x) < ARCH_W / 2 - 0.2) continue; b.add(B(ox + x - 0.05, 0, FENCE_Z - 0.03, ox + x + 0.05, 1.05, FENCE_Z + 0.03), white); }
  for (const y of [0.35, 0.8]) for (const s0 of [-1, 1]) b.add(B(ox + s0 * (ARCH_W / 2 - 0.2), y, FENCE_Z + 0.03, ox + s0 * 40, y + 0.08, FENCE_Z + 0.09), white);
  // the great arch over the gate: two square pillars, a deep beam, a half-round under it; the three statues stand on top
  { const hw = ARCH_W / 2; for (const s0 of [-1, 1]) { b.add(B(ox + s0 * hw - 0.45, 0, ARCH_Z - 0.45, ox + s0 * hw + 0.45, ARCH_H - 0.7, ARCH_Z + 0.45, 1), white); b.add(B(ox + s0 * hw - 0.55, ARCH_H - 0.85, ARCH_Z - 0.55, ox + s0 * hw + 0.55, ARCH_H - 0.7, ARCH_Z + 0.55), trim); b.add(B(ox + s0 * hw - 0.55, 0, ARCH_Z - 0.55, ox + s0 * hw + 0.55, 0.3, ARCH_Z + 0.55), trim); }
    b.add(B(ox - hw - 0.7, ARCH_H - 0.7, ARCH_Z - 0.6, ox + hw + 0.7, ARCH_H, ARCH_Z + 0.6, 1), white); b.add(B(ox - hw - 0.8, ARCH_H, ARCH_Z - 0.7, ox + hw + 0.8, ARCH_H + 0.12, ARCH_Z + 0.7), trim);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(hw - 0.45, 0.16, 8, 28, Math.PI), trim); ring.position.set(ox, ARCH_H - 0.7 - (hw - 0.45) * 0.55, ARCH_Z - 0.3); ring.scale.set(1, 0.55, 1); G.add(ring); }
  // the statue columns: plinth, a fluted white shaft, a capital and a square top a statue stands on
  COLS.forEach(([x, z], i) => { b.add(B(ox + x - 0.55, 0, z - 0.55, ox + x + 0.55, 0.45, z + 0.55, 1), trim); b.add(new THREE.CylinderGeometry(0.3, 0.36, COL_H - 0.75, 14).translate(ox + x, 0.45 + (COL_H - 0.75) / 2, z), white);
    b.add(new THREE.CylinderGeometry(0.46, 0.32, 0.22, 14).translate(ox + x, COL_H - 0.19, z), trim); b.add(B(ox + x - 0.55, COL_H - 0.08, z - 0.55, ox + x + 0.55, COL_H + 0.08, z + 0.55), trim); void i; });
  // Dexter's sign on the front of his own column
  { const [x, z] = COLS[DEX_COL]; sign(G, "I AM THE FIRST IN THE EAST|THE FIRST IN THE WEST|AND THE GREATEST PHILOSOPHER|IN THE WESTERN WORLD", ox + x, COL_H - 1.25, z - 0.4, 1.5, 1.0, "#f6ecd2", "#2a1a12"); }
  // the house: three storeys of white clapboard, a hipped roof, a cupola with a gold eagle, minarets with gold balls,
  // a portico with columns at the door; windows with dark glass, white frames and green shutters
  { const hw = HOUSE_W / 2, z0 = HOUSE_Z, z1 = HOUSE_Z + HOUSE_D, H = HOUSE_H, clap = lam("dxHouseClap", () => ({ map: rep(clapTex("#f4f0e6"), 6, 4) }));
    G.add(new THREE.Mesh(boxGeo(V(ox - hw, 0, z0), V(ox + hw, H, z1), 2), clap));
    b.add(B(ox - hw - 0.15, 0, z0 - 0.15, ox + hw + 0.15, 0.6, z1 + 0.15, 1), M("dxFound", "#a89a8a"));
    b.add(B(ox - hw - 0.3, H - 0.25, z0 - 0.3, ox + hw + 0.3, H, z1 + 0.3), trim);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.SQRT2 / 2, 1, 4, 1).rotateY(Math.PI / 4), lam("dxRoof", () => ({ map: planksHD(), color: "#4a4650" }))); roof.scale.set(HOUSE_W + 0.6, 3.2, HOUSE_D + 0.6); roof.position.set(ox, H + 1.6, (z0 + z1) / 2); G.add(roof);
    const cy = H + 2.4, cz = (z0 + z1) / 2; b.add(new THREE.CylinderGeometry(1.0, 1.0, 1.6, 8).translate(ox, cy + 0.8, cz), white); b.add(new THREE.CylinderGeometry(1.15, 1.15, 0.12, 8).translate(ox, cy + 1.66, cz), trim);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M("dxDome", "#5a7a6a")); dome.position.set(ox, cy + 1.7, cz); G.add(dome);
    // the gold eagle: body, head, spread wings, on a ball
    const eg = new THREE.Group(); eg.position.set(ox, cy + 2.95, cz); G.add(eg);
    eg.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8).translate(0, -0.25, 0), gold)); eg.add(new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8).scale(0.8, 1.2, 0.8).translate(0, 0.2, 0), gold)); eg.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8).translate(0, 0.62, -0.05), gold));
    eg.add(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6).rotateX(-Math.PI / 2).translate(0, 0.6, -0.24), M("dxBeak", "#c98a20")));
    for (const s0 of [-1, 1]) { const w = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(1.1, 0.55), new THREE.Vector2(1.25, 0.1), new THREE.Vector2(0.95, -0.15), new THREE.Vector2(0.7, -0.05), new THREE.Vector2(0.45, -0.25)])), gold);
      w.position.set(s0 * 0.15, 0.25, 0); w.scale.set(s0, 1, 1); w.rotation.y = -s0 * 0.25; eg.add(w); }
    for (const sx of [-1, 1]) { const mx = ox + sx * (hw - 1.2), mz = z0 + 1.2; b.add(new THREE.CylinderGeometry(0.28, 0.34, 3.2, 10).translate(mx, H + 1.4, mz), white); b.add(new THREE.ConeGeometry(0.34, 0.9, 10).translate(mx, H + 3.45, mz), M("dxDome", "#5a7a6a"));
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 8), gold); ball.position.set(mx, H + 4.1, mz); G.add(ball); }
    const glass = new THREE.MeshLambertMaterial({ color: "#2e3a46" }), shut = M("dxShut", "#2e5a3a");
    for (let fl = 0; fl < 3; fl++) for (let k = 0; k < 7; k++) { const x = -hw + 1.6 + k * ((HOUSE_W - 3.2) / 6), y = 1.8 + fl * 2.85; if (fl === 0 && k === 3) continue;
      const wm = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.6), glass); wm.rotation.y = Math.PI; wm.position.set(ox + x, y, z0 - 0.02); G.add(wm);
      b.add(B(ox + x - 0.62, y - 0.9, z0 - 0.08, ox + x + 0.62, y - 0.8, z0), trim); b.add(B(ox + x - 0.62, y + 0.8, z0 - 0.08, ox + x + 0.62, y + 0.92, z0), trim);
      for (const sx of [-1, 1]) b.add(B(ox + x + sx * 0.55 - 0.24, y - 0.8, z0 - 0.06, ox + x + sx * 0.55 + 0.24, y + 0.8, z0 - 0.02), shut); }
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.5), M("dxDoor", "#2a3a2e")); door.rotation.y = Math.PI; door.position.set(ox, 1.85, z0 - 0.03); G.add(door);
    b.add(B(ox - 1.8, 0.6, z0 - 2.4, ox + 1.8, 0.8, z0, 1), trim); for (const st of [0, 1, 2]) b.add(B(ox - 1.6, 0.2 * st, z0 - 2.4 - 0.35 * (3 - st), ox + 1.6, 0.2 * (st + 1), z0 - 2.4, 1), M("dxStep", "#c8c0b4"));
    for (const sx of [-1.45, 1.45]) b.add(new THREE.CylinderGeometry(0.16, 0.18, 3.3, 12).translate(ox + sx, 0.8 + 1.65, z0 - 2.1), white);
    const ped = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-2.0, 0), new THREE.Vector2(0, 1.0), new THREE.Vector2(2.0, 0)]), { depth: 2.5, bevelEnabled: false }); ped.translate(ox, 4.1, z0 - 2.5); G.add(new THREE.Mesh(ped, trim));
    b.add(B(ox - 2.0, 3.85, z0 - 2.5, ox + 2.0, 4.15, z0), trim); }
  // the mock wake: the coffin on two trestles before the steps, its lid off and propped beside it
  const coffin = new THREE.Group(); G.add(coffin); let lid: THREE.Object3D;
  { const [x, , z] = COFFIN, mah = M("dxMahog", "#5a2a1c"), brass = M("dxBrassC", "#d8a83a");
    const shp = new THREE.Shape([new THREE.Vector2(-0.28, -1.0), new THREE.Vector2(0.28, -1.0), new THREE.Vector2(0.36, 0.45), new THREE.Vector2(0.24, 1.0), new THREE.Vector2(-0.24, 1.0), new THREE.Vector2(-0.36, 0.45)]);
    const box = new THREE.ExtrudeGeometry(shp, { depth: 0.42, bevelEnabled: false }); box.rotateX(-Math.PI / 2); box.rotateY(Math.PI / 2); box.translate(ox + x, 0.78, z); coffin.add(new THREE.Mesh(box, mah));
    const lg = new THREE.ExtrudeGeometry(shp, { depth: 0.06, bevelEnabled: false }); lg.rotateX(-Math.PI / 2); lg.rotateY(Math.PI / 2); lg.translate(ox + x, 1.2, z); const l = new THREE.Mesh(lg, M("dxMahogL", "#6a3424")); coffin.add(l); lid = l;
    for (const dx of [-0.6, 0.6]) { const tb = new Batch(); tb.add(B(ox + x + dx - 0.05, 0.7, z - 0.4, ox + x + dx + 0.05, 0.78, z + 0.4), dark); for (const dz of [-0.35, 0.35]) tb.add(rodGeo(V(ox + x + dx, 0.74, z + dz), V(ox + x + dx + 0.18 * Math.sign(dz), 0, z + dz * 1.25), 0.035), dark); tb.build(coffin, true); }
    for (const dx of [-0.5, 0, 0.5]) coffin.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8).rotateZ(Math.PI / 2).translate(ox + x + dx, 0.98, z - 0.37), brass));
    shadowAll(coffin); }
  // across High Street: three neighbours' houses facing the mansion (for the shots from the porch)
  for (const [x, c] of [[-14, "#c9b48a"], [0, "#a8846a"], [16, "#d8cdb0"]] as [number, string][]) houseAt(b, G, ox + x, HS_Z0 - 7, 9, 7, 6.5, c, "#4a3e34", false, Math.PI);
  // elms round the house and along the far side, clear of the house, the columns, the arch and every camera spot
  { const spots: [number, number, number, number][] = [];
    for (let i = 0; i < 70; i++) { const x = -80 + r(i) * 160, z = HOUSE_Z + HOUSE_D + 6 + r(i + 200) * 40; spots.push([ox + x, gy(x, z), z, 0.9 + r(i + 300) * 0.5]); }
    for (let i = 0; i < 30; i++) { const sx = r(i + 400) < 0.5 ? -1 : 1, x = sx * (HOUSE_W / 2 + 7 + r(i + 500) * 30), z = 4 + r(i + 600) * 30; spots.push([ox + x, gy(x, z), z, 0.9 + r(i + 700) * 0.4]); }
    for (let i = 0; i < 30; i++) { const x = -90 + r(i + 800) * 180, z = HS_Z0 - 22 - r(i + 900) * 30; spots.push([ox + x, 0, z, 0.9 + r(i + 950) * 0.4]); }
    forest(G, spots, "mansion", 0.85); }
  const skies = { day: skyPl(G, twSkyTex("day"), "#6c9acc", ox, 8, 220, 160, -20), grey: skyPl(G, twSkyTex("grey"), "#6e7278", ox, 8, 219, 160, -20) };
  const dust = dustMotes(V(ox, 2, 4), V(30, 4, 20), 160, new THREE.Color(1, 0.96, 0.82), 0.04, 0.4); G.add(dust.points);
  b.build(G, true); shadowAll(G); noInk(G);
  const turf = (x: number, z: number) => { const lx = x - ox; if (z < FENCE_Z + 0.1) return null; if (Math.abs(lx) < PATH_W + 0.1 && z < HOUSE_Z) return null;
    if (Math.abs(lx) < HOUSE_W / 2 + 0.4 && z > HOUSE_Z - 2.9 && z < HOUSE_Z + HOUSE_D + 0.4) return null;
    for (const [cx, cz] of COLS) if (Math.abs(lx - cx) < 0.65 && Math.abs(z - cz) < 0.65) return null;
    if (Math.abs(Math.abs(lx) - ARCH_W / 2) < 0.65 && Math.abs(z - ARCH_Z) < 0.65) return null;
    if (Math.abs(lx - COFFIN[0]) < 1.3 && Math.abs(z - COFFIN[2]) < 1.5) return null; return gy(lx, z); };
  return { group: G, turf, dust, drift: (t) => dust.drift(t), coffin, lid: lid!, skies };
}

// =====================================================================================================================
export type RoomSet = { group: THREE.Group; tavern: THREE.Group; congress: THREE.Group; conv: THREE.Group; study: THREE.Group; candle: THREE.PointLight; map: THREE.MeshLambertMaterial; mapTex: Record<"pickle" | "punct", THREE.Texture>;
  lamps: THREE.PointLight[]; win: THREE.PointLight; stove: THREE.PointLight; stoveGlow: THREE.Sprite; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildRoom(): RoomSet {
  const G = new THREE.Group(), ox = SET.room[0], tavern = new THREE.Group(), congress = new THREE.Group(), conv = new THREE.Group(); G.add(tavern, congress, conv);
  const { w, z0, z1, h } = ROOM, bt = new Batch(), bc = new Batch(), bv = new Batch();
  const floorM = lam("twRmFloor", () => ({ map: planksHD(), color: "#8a6a4e" })), oak = lam("twRmOak", () => ({ map: planksHD(), color: "#6a4630" })), dark = lam("twRmDark", () => ({ map: planksHD(), color: "#4a3224" }));
  const walls = (bb: Batch, wallM: THREE.Material, ceil: THREE.Material) => { bb.add(B(ox - w, -0.1, z0, ox + w, 0, z1, 2), floorM); bb.add(B(ox - w, h, z0, ox + w, h + 0.1, z1), ceil); bb.add(B(ox - w, 0, z1, ox + w, h, z1 + 0.15, 2), wallM); for (const sx of [-1, 1]) bb.add(B(ox + sx * w, 0, z0, ox + sx * (w + 0.15), h, z1, 2), wallM); };
  // ---- the tavern: log walls, a long bar with bottles behind it, barrels, a round table and chairs, beams, lanterns ----
  { const logM = lam("twRmLog", () => ({ map: rep(logTex("twRmLogT", "#7a5a3e"), 3, 1.1) })); walls(bt, logM, dark);
    for (let z = z0 + 1; z < z1; z += 2.2) bt.add(B(ox - w, h - 0.3, z, ox + w, h, z + 0.25), dark);
    bt.add(B(ox + BAR.x0, 0, BAR.z - 0.35, ox + BAR.x1, BAR.y, BAR.z + 0.35, 1), oak); bt.add(B(ox + BAR.x0 - 0.05, BAR.y, BAR.z - 0.42, ox + BAR.x1 + 0.05, BAR.y + 0.07, BAR.z + 0.42), dark);
    for (const y of [1.5, 2.1]) { bt.add(B(ox + BAR.x0, y, z1 - 0.35, ox + BAR.x1, y + 0.05, z1), dark); for (let k = 0; k < 12; k++) bt.add(new THREE.CylinderGeometry(0.045, 0.06, 0.3, 8).translate(ox + BAR.x0 + 0.25 + k * 0.42, y + 0.19, z1 - 0.18), M("twBottle" + (k % 3), ["#3a6a3a", "#6a3a22", "#c9b88a"][k % 3])); }
    const barrel = new THREE.CylinderGeometry(0.4, 0.4, 1.0, 14); for (const [x, z] of [[3.9, 3.2], [4.4, 2.3], [3.4, 2.2]]) bt.add(barrel.clone().translate(ox + x, 0.5, z), M("twBarrel", "#7a5232"));
    bt.add(barrel.clone().rotateZ(Math.PI / 2).translate(ox + 3.9, 1.4, 3.2), M("twBarrel", "#7a5232"));
    const [tx, , tz] = TABLE; bt.add(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 18).translate(ox + tx, 0.76, tz), oak); bt.add(new THREE.CylinderGeometry(0.08, 0.12, 0.74, 8).translate(ox + tx, 0.37, tz), oak);
    for (const a of [0.6, 2.3, 4.1]) { const cx = ox + tx + Math.cos(a) * 1.05, cz = tz + Math.sin(a) * 1.05; bt.add(B(cx - 0.22, 0.44, cz - 0.22, cx + 0.22, 0.5, cz + 0.22), oak); for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) bt.add(B(cx + dx - 0.03, 0, cz + dz - 0.03, cx + dx + 0.03, 0.44, cz + dz + 0.03), oak); }
    bt.add(new THREE.CylinderGeometry(0.05, 0.04, 0.18, 8).translate(ox + tx + 0.2, 0.88, tz), M("twMug", "#c9b48a")); bt.add(new THREE.CylinderGeometry(0.05, 0.04, 0.18, 8).translate(ox + tx - 0.3, 0.88, tz + 0.2), M("twMug", "#c9b48a"));
    // a window in the front-left wall with daylight
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.5, 1.4) })); win.rotation.y = -Math.PI / 2; win.position.set(ox + w - 0.02, 1.8, -1.0); tavern.add(win);
    // lanterns hanging from the beams on chains
    for (const [x, z] of [[-1.8, 0.8], [1.6, 0.2]]) { bt.add(rodGeo(V(ox + x, h - 0.3, z), V(ox + x, h - 0.9, z), 0.012), M("twChainL", "#2a2628")); bt.add(B(ox + x - 0.12, h - 1.2, z - 0.12, ox + x + 0.12, h - 0.9, z + 0.12), M("twLantern", "#2a2628")); flame(tavern, V(ox + x, h - 1.05, z), 0.05); } }
  bt.build(tavern, true);
  // ---- Congress: pale plaster and pilasters, red drapes, tiered desks, the big map on an easel-board on the back wall ----
  { const plaster = M("twPlaster", "#e8dcc4"), pil = M("twPilaster", "#f2ead8"), drape = M("twDrape", "#8a2a2a"); walls(bc, plaster, M("twCeil", "#f0e8d8"));
    for (const x of [-4.2, -2.6, 2.6, 4.2]) bc.add(B(ox + x - 0.22, 0, z1 - 0.3, ox + x + 0.22, h, z1), pil);
    for (const x of [-3.4, 3.4]) bc.add(B(ox + x - 0.5, 0.4, z1 - 0.2, ox + x + 0.5, h - 0.1, z1 - 0.1), drape);
    bc.add(B(ox - 2.1, 0, z1 - 1.2, ox + 2.1, 0.35, z1), oak); bc.add(B(ox - 1.4, 0.35, z1 - 1.1, ox + 1.4, 1.35, z1 - 0.6), oak);
    for (const [z, y] of [[-1.4, 0], [-2.6, 0.18], [-3.8, 0.36]]) { bc.add(B(ox - 4.4, 0, z - 0.5, ox + 4.4, y, z + 0.5), floorM); for (const x of [-3.0, -1.0, 1.0, 3.0]) { bc.add(B(ox + x - 0.6, y, z + 0.2, ox + x + 0.6, y + 0.82, z + 0.45), oak); bc.add(B(ox + x - 0.62, y + 0.82, z + 0.1, ox + x + 0.62, y + 0.86, z + 0.5), dark); } }
    // the map: a framed board on the back wall above the speaker's desk
    bc.add(B(ox + MAP.x - MAP.w / 2 - 0.1, MAP.y - MAP.h / 2 - 0.1, z1 - 0.12, ox + MAP.x + MAP.w / 2 + 0.1, MAP.y + MAP.h / 2 + 0.1, z1 - 0.04), dark);
    // a flag on a pole with a stand
    bc.add(B(ox - 2.4, 0, z1 - 1.0, ox - 2.34, 2.8, z1 - 0.94), M("twPole", "#c9a23a")); bc.add(B(ox - 2.55, 0, z1 - 1.15, ox - 2.2, 0.1, z1 - 0.8), M("twPole", "#c9a23a"));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.68), new THREE.MeshLambertMaterial({ map: (() => { const t = signTex("", "#ffffff", "#ffffff", 512, 320); const c = t.image as HTMLCanvasElement, g = c.getContext("2d")!; for (let k = 0; k < 13; k++) { g.fillStyle = k % 2 ? "#f2f2f2" : "#b3262b"; g.fillRect(0, k * 320 / 13, 512, 320 / 13 + 1); } g.fillStyle = "#2a3a6a"; g.fillRect(0, 0, 220, 172); g.fillStyle = "#ffffff"; for (let i = 0; i < 24; i++) { g.beginPath(); g.arc(22 + (i % 6) * 35, 20 + Math.floor(i / 6) * 40, 7, 0, 6.3); g.fill(); } t.needsUpdate = true; return t; })(), side: THREE.DoubleSide }));
    fl.rotation.y = Math.PI; fl.position.set(ox - 1.8, 2.4, z1 - 0.97); congress.add(fl);
    // tall windows in the side wall with daylight
    for (const z of [-3.6, -0.8]) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.55) })); wn.rotation.y = -Math.PI / 2; wn.position.set(ox + w - 0.02, 1.9, z); congress.add(wn); } }
  bc.build(congress, true);
  const map = new THREE.MeshLambertMaterial({ map: pageTex("pickle") }), mapTx = { pickle: pageTex("pickle"), punct: pageTex("punct") };
  // ---- Dexter's study: panelled plaster, bookshelves, a window, a tall standing desk with a candle, a quill and ink, and
  // the page board on the back wall above the desk (it shows the page he is on: his book's opening, then the page of stops) ----
  const study = new THREE.Group(); G.add(study);
  let candle: THREE.PointLight;
  { const bs = new Batch(), plaster = M("dxStPlaster", "#e8d8b8"), panel = lam("dxStPanel", () => ({ map: planksHD(), color: "#6a4a32" })); walls(bs, plaster, M("twCeil", "#f0e8d8"));
    bs.add(B(ox - w, 0, z1 - 0.06, ox + w, 1.0, z1), panel); for (const sx of [-1, 1]) bs.add(B(ox + sx * (w - 0.06), 0, z0, ox + sx * w, 1.0, z1), panel);
    // shelves of books either side of the board
    for (const sx of [-1, 1]) { const x0 = sx * 2.2, x1 = sx * 4.6; bs.add(B(ox + x0, 0, z1 - 0.45, ox + x1, 2.9, z1 - 0.4), panel);
      for (const y of [0.9, 1.55, 2.2]) { bs.add(B(ox + x0, y, z1 - 0.45, ox + x1, y + 0.05, z1 - 0.05), panel); let x = Math.min(x0, x1) + 0.06, k = 0;
        while (x < Math.max(x0, x1) - 0.12) { const bw = 0.07 + 0.05 * ((k * 7) % 3) / 2, bh = 0.42 + 0.14 * ((k * 5) % 4) / 3; bs.add(B(ox + x, y + 0.05, z1 - 0.38, ox + x + bw, y + 0.05 + bh, z1 - 0.12), M("dxBook" + (k % 5), ["#7a2a24", "#2a4a3a", "#3a3a5a", "#8a6a3a", "#4a2a1a"][k % 5])); x += bw + 0.01; k++; } } }
    // the board frame
    bs.add(B(ox + MAP.x - MAP.w / 2 - 0.12, MAP.y - MAP.h / 2 - 0.12, z1 - 0.12, ox + MAP.x + MAP.w / 2 + 0.12, MAP.y + MAP.h / 2 + 0.12, z1 - 0.04), M("dxFrame", "#c9a23a"));
    // the standing desk: a sloped top on four legs, a ledge, the ink pot, the quill, a stack of written pages
    const [dx, , dz] = DESK, oak = lam("twRmOak", () => ({ map: planksHD(), color: "#6a4630" }));
    const top = new THREE.Mesh(boxGeo(V(-0.75, -0.03, -0.35), V(0.75, 0.03, 0.35), 1), oak); top.position.set(ox + dx, DESK_Y, dz); top.rotation.x = -0.28; study.add(top);
    for (const [lx, lz] of [[-0.68, -0.28], [0.68, -0.28], [-0.68, 0.28], [0.68, 0.28]]) bs.add(B(ox + dx + lx - 0.04, 0, dz + lz - 0.04, ox + dx + lx + 0.04, DESK_Y - (lz < 0 ? 0.1 : -0.08), dz + lz + 0.04), oak);
    bs.add(B(ox + dx - 0.75, DESK_Y + 0.1, dz + 0.3, ox + dx + 0.75, DESK_Y + 0.14, dz + 0.4), oak);
    bs.add(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 10).translate(ox + dx + 0.5, DESK_Y + 0.18, dz + 0.35), M("dxInk", "#1a1a22"));
    bs.add(rodGeo(V(ox + dx + 0.5, DESK_Y + 0.2, dz + 0.35), V(ox + dx + 0.42, DESK_Y + 0.5, dz + 0.3), 0.008), M("dxQuill", "#f4f0e6"));
    const pg = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.55), M("dxPage", "#f2ead2")); pg.position.set(ox + dx - 0.15, DESK_Y + 0.04, dz - 0.02); pg.rotation.set(-Math.PI / 2 - 0.28, 0, 0.05); study.add(pg);
    // a candle on the desk's ledge (its flame is the room's warm light) and the window's cool light from the side
    bs.add(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 10).translate(ox + dx - 0.55, DESK_Y + 0.25, dz + 0.35), M("dxWax", "#f4ecd4")); flame(study, V(ox + dx - 0.55, DESK_Y + 0.41, dz + 0.35), 0.035);
    candle = new THREE.PointLight("#ffc880", 0, 8, 1.4); candle.position.set(ox + dx - 0.55, DESK_Y + 0.55, dz + 0.2); study.add(candle);
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.5, 1.45) })); wn.rotation.y = -Math.PI / 2; wn.position.set(ox + w - 0.02, 1.9, -1.2); study.add(wn);
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), M("dxRug", "#7a2a2a")); rug.rotation.x = -Math.PI / 2; rug.position.set(ox, 0.012, 0.6); study.add(rug);
    bs.build(study, true); }
  { const mp = new THREE.Mesh(new THREE.PlaneGeometry(MAP.w, MAP.h), map); mp.rotation.y = Math.PI; mp.position.set(ox + MAP.x, MAP.y, z1 - 0.13); study.add(mp); }
  // ---- the Frostbitten Convention: log walls, frosted windows, an iron stove glowing, benches of delegates, a table ----
  { const logM = lam("twRmLogC", () => ({ map: rep(logTex("twRmLogCT", "#8a6a4a"), 3, 1.1) })); walls(bv, logM, dark);
    for (let z = z0 + 1; z < z1; z += 2.2) bv.add(B(ox - w, h - 0.3, z, ox + w, h, z + 0.25), dark);
    const fm = lam("twFrostM", () => ({ map: frostTex(), emissive: "#9aa8b8", emissiveIntensity: 0.55 }));
    for (const x of [-1.7, 1.7]) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), fm); wn.rotation.y = Math.PI; wn.position.set(ox + x, 1.9, z1 - 0.02); conv.add(wn); }
    { const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), fm); wn.rotation.y = -Math.PI / 2; wn.position.set(ox + w - 0.02, 1.9, -1.4); conv.add(wn); }
    const [sx, , sz] = STOVE; bv.add(new THREE.CylinderGeometry(0.42, 0.42, 0.9, 14).translate(ox + sx, 0.65, sz), M("twStove", "#2a2628")); for (const [dx, dz] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) bv.add(B(ox + sx + dx - 0.04, 0, sz + dz - 0.04, ox + sx + dx + 0.04, 0.22, sz + dz + 0.04), M("twStove", "#2a2628"));
    bv.add(new THREE.CylinderGeometry(0.09, 0.09, h - 1.1, 8).translate(ox + sx, 1.1 + (h - 1.1) / 2, sz), M("twStove", "#2a2628"));
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.22), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 1.4, 0.5) })); door.rotation.y = Math.PI; door.position.set(ox + sx, 0.6, sz - 0.425); conv.add(door);
    bv.add(B(ox - 1.6, 0.74, z1 - 1.4, ox + 1.6, 0.8, z1 - 0.7), oak); for (const x of [-1.5, 1.5]) for (const z of [z1 - 1.35, z1 - 0.75]) bv.add(B(ox + x - 0.04, 0, z - 0.04, ox + x + 0.04, 0.74, z + 0.04), oak);
    for (const z of [-0.6, -2.0, -3.4]) for (const x of [-2.4, 2.0]) { bv.add(B(ox + x - 1.5, 0.42, z - 0.2, ox + x + 1.5, 0.48, z + 0.2), oak); for (const dx of [-1.3, 1.3]) bv.add(B(ox + x + dx - 0.05, 0, z - 0.15, ox + x + dx + 0.05, 0.42, z + 0.15), oak); }
    for (let k = 0; k < 3; k++) { const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), M("twPaper", "#efe6cf")); pp.rotation.set(-Math.PI / 2, 0, Math.PI + 0.12 * (k - 1)); pp.position.set(ox - 0.7 + k * 0.7, 0.805, z1 - 1.05); conv.add(pp); } }
  bv.build(conv, true);
  const lamps: THREE.PointLight[] = [];
  for (const [x, z] of [[-1.8, 0.8], [1.6, 0.2]]) { const l = new THREE.PointLight("#ffd8a0", 0, 12, 1.3); l.position.set(ox + x, h - 1.05, z); tavern.add(l); lamps.push(l); }
  const win = new THREE.PointLight("#e8eef6", 0, 16, 1.2); win.position.set(ox + w - 0.8, 2.2, -1.4); G.add(win);
  const stove = new THREE.PointLight("#ff9a4a", 0, 9, 1.4); stove.position.set(ox + STOVE[0], 0.7, STOVE[2] - 0.7); conv.add(stove);
  const stoveGlow = glow(new THREE.Color(1.0, 0.55, 0.2), 1.4); stoveGlow.position.set(ox + STOVE[0], 0.6, STOVE[2] - 0.5); conv.add(stoveGlow);
  const dust = dustMotes(V(ox, 1.6, 0), V(8, 2.8, 8), 200, new THREE.Color(1, 0.9, 0.7), 0.03, 0.45); G.add(dust.points);
  noInk(G);
  return { group: G, tavern, congress, conv, study, candle: candle!, map, mapTex: mapTx, lamps, win, stove, stoveGlow, dust, drift: (t) => dust.drift(t) };
}

// =====================================================================================================================
export type NorthSet = { group: THREE.Group; winter: THREE.Group; summer: THREE.Group; water: ReturnType<typeof waterMat>; copper: THREE.Group; turf: (x: number, z: number) => number | null; flakes: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildNorth(): NorthSet {
  const G = new THREE.Group(), ox = SET.north[0], winter = new THREE.Group(), summer = new THREE.Group(), copper = new THREE.Group(); G.add(winter, summer, copper); const b = new Batch();
  const gy = (x: number, z: number) => northY(x - ox, z);
  // ground: snow (winter) or grass and rock (summer); the rock face the mine is cut into, behind the outcrop
  { const g = sheet(ox - 140, ox + 140, -70, SHORE_Z + 4, 140, 60, gy, 4);
    const ms = new THREE.Mesh(g, lam("twSnowM", () => ({ map: snowTex() }))); ms.receiveShadow = true; winter.add(ms);
    const mg = new THREE.Mesh(g, lam("twNGrassM", () => ({ map: dirtTex("twNGrassT", "#5a6e38"), color: "#8a9a62" }))); mg.receiveShadow = true; summer.add(mg); }
  const rockM = lam("twCuRock", () => ({ map: copperRockTex(), vertexColors: true, flatShading: true }));
  // the rock face only on the screen-left side (x 0..20), so the lake stays open on the right; a side face closes its end
  const FX0 = -1, FX1 = 21, FZ = PORTAL[2] + 0.25;
  { const wall = rockWall(FX1 - FX0, 9, 1.4, 1.6, 7, 3), m = new THREE.Mesh(wall, rockM); m.position.set(ox + (FX0 + FX1) / 2, gy(ox, FZ) - 0.6, FZ); m.rotation.y = Math.PI; shadowAll(m); G.add(m);
    const side = rockWall(SHORE_Z - FZ + 1, 9, 1.4, 1.4, 11, 3), ms = new THREE.Mesh(side, rockM); ms.position.set(ox + FX0, gy(ox + FX0, FZ) - 0.6, (FZ + SHORE_Z) / 2); ms.rotation.y = -Math.PI / 2; shadowAll(ms); G.add(ms);
    const top = sheet(ox + FX0, ox + FX1, FZ - 0.1, SHORE_Z + 0.5, 30, 10, (x, z) => 8.2 + 0.4 * Math.sin(x * 0.4 + z), 4); const mt = new THREE.Mesh(top, lam("twCuTop", () => ({ map: copperRockTex(), color: "#8a8a86" }))); mt.receiveShadow = true; G.add(mt);
    const snowTop = new THREE.Mesh(top.clone().translate(0, 0.08, 0), lam("twSnowTopM", () => ({ map: snowTex() }))); winter.add(snowTop); }
  // the outcrop near the camera: big rocks with copper in them (the first finds)
  { const list: Fol = []; for (let i = 0; i < 7; i++) { const [cx, , cz] = OUTCROP, x = cx + ((i * 1.7) % 4) - 2, z = cz + ((i * 2.3) % 2.6) - 1.3, s = 0.7 + ((i * 3) % 5) * 0.18; list.push({ g: rockGeo(s, i + 30, 1, 0.7), m: M4(ox + x, gy(ox + x, z) + s * 0.2, z, i), tint: 0.9 + 0.2 * ((i * 7) % 3) / 3 }); }
    const m = new THREE.Mesh(mergeFacets(list), rockM); shadowAll(m); G.add(m);
    const cu = M("twCopper", "#d9793a", { emissive: "#7a3210", emissiveIntensity: 0.35 });
    for (let i = 0; i < 9; i++) { const [cx, , cz] = OUTCROP, x = cx + ((i * 1.3) % 3.4) - 1.7, z = cz - 1.0 + ((i * 0.7) % 1.2) - 0.6, s = 0.12 + ((i * 5) % 4) * 0.05; const n = new THREE.Mesh(rockGeo(s, i + 70, 0, 0.6), cu); n.position.set(ox + x, gy(ox + x, z) + 0.55 + ((i * 3) % 4) * 0.18, z - 0.25); shadowAll(n); copper.add(n); } }
  // the mine portal: timber posts and a lintel set into the face, black inside; rails and an ore cart full of copper
  { const [px, , pz] = PORTAL, y0 = gy(ox + px, pz), tim = lam("twTimber", () => ({ map: planksHD(), color: "#6a4a30" }));
    for (const sx of [-1.1, 1.1]) b.add(B(ox + px + sx - 0.16, y0 - 0.2, pz - 0.16, ox + px + sx + 0.16, y0 + 2.6, pz + 0.16), tim);
    b.add(B(ox + px - 1.45, y0 + 2.6, pz - 0.2, ox + px + 1.45, y0 + 2.95, pz + 0.2), tim);
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 2.6), new THREE.MeshBasicMaterial({ color: "#060406" })); hole.rotation.y = Math.PI; hole.position.set(ox + px, y0 + 1.3, pz + 0.2); G.add(hole);
    for (const sx of [-0.45, 0.45]) b.add(B(ox + px + sx - 0.04, y0, pz - 7, ox + px + sx + 0.04, y0 + 0.08, pz + 0.3), M("twRail", "#5a5658"));
    for (let z = pz - 7; z < pz; z += 0.7) b.add(B(ox + px - 0.7, y0 - 0.02, z - 0.1, ox + px + 0.7, y0 + 0.03, z + 0.1), tim);
    const cart = new THREE.Group(); cart.add(new THREE.Mesh(boxGeo(V(-0.6, 0.35, -0.8), V(0.6, 1.15, 0.8), 1), M("twCart", "#4a3a2e")));
    for (const [wx, wz] of [[-0.45, -0.5], [0.45, -0.5], [-0.45, 0.5], [0.45, 0.5]]) cart.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12).rotateZ(Math.PI / 2).translate(wx, 0.22, wz), M("twIron2", "#2a2628")));
    const cu = M("twCopper", "#d9793a", { emissive: "#7a3210", emissiveIntensity: 0.35 }); for (let i = 0; i < 10; i++) { const n = new THREE.Mesh(rockGeo(0.2 + (i % 3) * 0.05, i + 90, 0, 0.7), cu); n.position.set(-0.35 + (i % 4) * 0.23, 1.2 + (i % 2) * 0.08, -0.55 + Math.floor(i / 4) * 0.5); cart.add(n); }
    cart.position.set(ox + px, y0 + 0.04, pz - 3.6); shadowAll(cart); summer.add(cart);
    // a pile of copper at the portal (summer) and a sign
    sign(summer, "COPPER MINE", ox + px, y0 + 3.4, pz - 0.25, 2.6, 0.6, "#3a2418", "#f2d68a"); }
  // the lake beyond the shore: moving water; ice floes in winter
  const water = waterMat("#2a3e52", "#4a6a80", "#c2ccd6", "superior"); water.U.uAmp.value = 0.3;
  { const g = new THREE.PlaneGeometry(400, 260, 200, 80); g.rotateX(-Math.PI / 2); g.translate(ox, LAKE_Y, SHORE_Z + 128); const w = new THREE.Mesh(g, water.mat); w.receiveShadow = true; G.add(w);
    for (let i = 0; i < 40; i++) { const x = -120 + ((i * 37) % 240), z = SHORE_Z + 3 + ((i * 13) % 50), s = 2 + ((i * 7) % 5); const fl = new THREE.Mesh(new THREE.CircleGeometry(s, 7), M("twIce", "#e6eef4")); fl.rotation.x = -Math.PI / 2; fl.position.set(ox + x, LAKE_Y + 0.15, z); fl.scale.y = 0.6 + ((i * 3) % 4) * 0.15; winter.add(fl); } }
  // forest: pines all round (snow caps in winter), clear of the cameras and the face
  { const spots: [number, number, number, number][] = [], r = (k: number) => ((k * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 240; i++) { const x = -130 + r(i) * 260, z = -60 + r(i + 500) * 76; if (x > -14 && x < 26 && z > -14) continue; spots.push([ox + x, gy(ox + x, z), z, 0.85 + r(i + 900) * 0.45]); }
    for (let i = 0; i < 70; i++) { const x = -60 + r(i + 700) * 50, z = 8 + r(i + 800) * 10; if (Math.hypot(x - OUTCROP[0], z - OUTCROP[2]) < 6) continue; spots.push([ox + x, gy(ox + x, z), z, 0.75 + r(i + 860) * 0.45]); }
    for (let i = 0; i < 30; i++) { const x = FX0 + 2 + r(i + 40) * (FX1 - FX0 - 4), z = FZ + 3 + r(i + 140) * (SHORE_Z - FZ - 4); spots.push([ox + x, 8.2, z, 0.7 + r(i + 240) * 0.3]); }
    forest(G, spots, "north", 0, winter); }
  skyPl(G, twSkyTex("winter"), "#8a98aa", ox, 10, 240, 170, -20);
  const flakes = dustMotes(V(ox, 3, 4), V(30, 7, 24), 420, new THREE.Color(1, 1, 1), 0.05, 0.8); winter.add(flakes.points);
  b.build(G, true); noInk(G);
  const turf = (x: number, z: number) => { const lx = x - ox; if (z > SHORE_Z - 3 || (lx > FX0 - 0.5 && z > FZ - 0.6) || (Math.abs(lx - PORTAL[0]) < 1.2 && z > PORTAL[2] - 7.4)) return null; return gy(x, z); };
  return { group: G, winter, summer, water, copper, turf, flakes, drift: (t) => { water.U.uTime.value = t; flakes.drift(t); } };
}
void rockTex;
