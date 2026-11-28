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
import { SET, ST_Z0, ST_Z1, BLD_Z, BLD_X1, BANK_Z0, BANK_Z1, WATER_Y, FAR_Z, riverY, POST, STORE, WSIGN, CHAPEL_Z, CH_W, CH_D, CH_H, MHOUSE, ROOM, BAR, TABLE, MAP, STOVE, SHORE_Z, LAKE_Y, OUTCROP, PORTAL, northY, DESK, DESK_Y } from "./place";
import { logTex, clapTex, streetTex, snowTex, copperRockTex, frostTex, twSkyTex, rep, doc, wySkyTex, sackTex } from "./dpaint";

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
export type RiverSet = { group: THREE.Group; water: ReturnType<typeof waterMat>; turf: (x: number, z: number) => number | null; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void;
  /** dressings: 1889 (the mail sack on the post office bench) and today (the welcome sign); skies */
  old: THREE.Group; today: THREE.Group; poSign: THREE.Mesh; plate: THREE.Mesh; skies: Record<"day" | "today", THREE.Mesh> };
/** sagebrush: a low grey-green dome of small clumps (local origin on the ground) */
const sageGeo = (s: number, seed: number) => { const parts: Fol = []; for (let k = 0; k < 4; k++) { const a = seed * 1.7 + k * 1.9, d = 0.18 * s * (k ? 1 : 0); parts.push({ g: bushGeo(0.42 * s * (k ? 0.75 : 1), seed * 5 + k, 3), m: M4(Math.cos(a) * d, 0.22 * s, Math.sin(a) * d, a), tint: 0.9 + 0.2 * ((seed + k) % 3) / 2 }); } return parts; };
export function buildRiver(): RiverSet {
  const G = new THREE.Group(), ox = SET.river[0], b = new Batch(), old = new THREE.Group(), today = new THREE.Group(); G.add(old, today); let poSign: THREE.Mesh, plate: THREE.Mesh;
  const r = (k: number) => ((k * 9301 + 49297) % 233280) / 233280;
  const dark = lam("twWoodD", () => ({ map: planksHD(), color: "#5a4230" })), pole = lam("dbPole", () => ({ map: planksHD(), color: "#8a7458" }));
  // ground: dry grass everywhere, the track on top, the bank down to the creek, gravel at the water line, the far bench
  { const g = sheet(ox - 160, ox + 160, -80, 120, 160, 120, (x, z) => riverY(x - ox, z), 4);
    const m = new THREE.Mesh(g, lam("dbGrassM", () => ({ map: dirtTex("dbGrassT", "#7a7a44"), color: "#a8a070" }))); m.receiveShadow = true; G.add(m);
    const gb = sheet(ox - 160, ox + 160, BANK_Z0 + 1.2, BANK_Z1 + 1.5, 160, 8, (x, z) => riverY(x - ox, z) + 0.03, 3);
    const mb = new THREE.Mesh(gb, lam("dbBankM", () => ({ map: dirtTex("dbBankT", "#9a8462"), color: "#b8a080" }))); mb.receiveShadow = true; G.add(mb);
    const gf = sheet(ox - 160, ox + 160, FAR_Z - 2, FAR_Z + 3, 160, 6, (x, z) => riverY(x - ox, z) + 0.03, 3); const mf = new THREE.Mesh(gf, lam("dbBankM", () => ({ map: dirtTex("dbBankT", "#9a8462"), color: "#b8a080" }))); mf.receiveShadow = true; G.add(mf); }
  { const g = new THREE.PlaneGeometry(320, ST_Z1 - ST_Z0, 1, 1); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 50, uv.getY(i));
    const st = new THREE.Mesh(g, lam("twStreetM", () => ({ map: rep(streetTex(), 1, 1) }))); st.position.set(ox, 0.07, (ST_Z0 + ST_Z1) / 2); st.receiveShadow = true; G.add(st); }
  // the cabins along the far side of the track (screen right): squared logs, board roofs; the post office with its sign
  { const logA = lam("dbLogA", () => ({ map: rep(logTex("dbLogAT", "#8a6a4a"), 2, 1.1) })), logB = lam("dbLogB", () => ({ map: rep(logTex("dbLogBT", "#7a5a3c"), 2, 1.1) }));
    cabin(G, ox + POST.x, BLD_Z, 7, 6, 3.4, logA, "#5a4636", true);
    poSign = sign(G, "POST OFFICE", ox + POST.x, 3.75, BLD_Z - 0.04, 3.0, 0.62, "#2a3a6a", "#f2e6c8");
    b.add(B(ox + POST.x - 3.8, 2.55, BLD_Z - 1.6, ox + POST.x + 3.8, 2.65, BLD_Z), dark); // porch roof
    for (const sx of [-3.6, 3.6]) b.add(B(ox + POST.x + sx - 0.08, 0, BLD_Z - 1.6, ox + POST.x + sx + 0.08, 2.55, BLD_Z - 1.44), dark);
    b.add(B(ox + POST.x + 1.2, 0.45, BLD_Z - 0.75, ox + POST.x + 3.2, 0.52, BLD_Z - 0.35), dark); for (const sx of [1.3, 3.1]) b.add(B(ox + POST.x + sx - 0.05, 0, BLD_Z - 0.7, ox + POST.x + sx + 0.05, 0.45, BLD_Z - 0.4), dark); // a bench
    cabin(G, ox + STORE[0], BLD_Z, 8, 7, 3.8, logB, "#4a3a2e");
    sign(G, "GENERAL STORE", ox + STORE[0], 4.2, BLD_Z - 0.04, 3.4, 0.62, "#3a2418", "#f2d68a");
    cabin(G, ox - 35, BLD_Z + 2, 6, 6, 3.2, logA, "#4a3e34");
    cabin(G, ox - 45, BLD_Z + 1, 7, 6, 3.3, logB, "#4a3e34");
    cabin(G, ox - 56, BLD_Z + 2.5, 6, 6, 3.1, logA, "#4a3e34");
    cabin(G, ox - 6.5, BLD_Z + 1.5, 4.0, 5, 3.0, logB, "#4a3a2e");
    // across the track (behind the cameras for most shots): a few more, for the reverse angles
    for (const [x, w] of [[-20, 7], [-34, 8], [-48, 6]] as [number, number][]) { const g = cabin(G, ox + x, -10.5, w, 6, 3.3, logA, "#5a4636"); g.rotation.y = Math.PI; g.position.z = -5.5; } }
  // hitching rail and a water trough in front of the post office; barrels and crates by the store
  { const hx = STORE[0]; b.add(B(ox + hx - 2.6, 0.95, ST_Z1 + 0.5, ox + hx + 2.6, 1.05, ST_Z1 + 0.6), dark); for (const sx of [-2.5, 0, 2.5]) b.add(B(ox + hx + sx - 0.07, 0, ST_Z1 + 0.48, ox + hx + sx + 0.07, 1.0, ST_Z1 + 0.62), dark);
    b.add(B(ox - 19.5, 0, ST_Z1 + 0.4, ox - 17.5, 0.55, ST_Z1 + 1.1, 1), dark); b.add(B(ox - 19.4, 0.45, ST_Z1 + 0.5, ox - 17.6, 0.5, ST_Z1 + 1.0), M("twTroughW", "#4a6a7a"));
    const barrel = new THREE.CylinderGeometry(0.36, 0.36, 0.9, 12); for (const [x, z] of [[-27.3, 4.6], [-28.0, 4.9], [-20.6, 4.9]]) b.add(barrel.clone().translate(ox + x, 0.45, z), M("twBarrel", "#7a5232"));
    b.add(B(ox - 29.2, 0, 4.3, ox - 28.4, 0.75, 5.0, 1), lam("dxCrate", () => ({ map: planksHD(), color: "#b08a5a" }))); }
  // a pole corral on the open ground at screen left (posts down to the ground, three rails)
  { const x0 = 10, x1 = 30, z0 = 7, z1 = 14; const posts: [number, number][] = []; for (let x = x0; x <= x1; x += 2.5) { posts.push([x, z0], [x, z1]); } for (let z = z0 + 2.33; z < z1; z += 2.33) { posts.push([x0, z], [x1, z]); }
    for (const [x, z] of posts) { const gy = riverY(x, z); b.add(new THREE.CylinderGeometry(0.08, 0.1, 1.7, 7).translate(ox + x, gy + 0.75, z), pole); }
    for (const y of [0.45, 0.9, 1.35]) { b.add(rodGeo(V(ox + x0, y, z0), V(ox + x1, y, z0), 0.05), pole); b.add(rodGeo(V(ox + x0, y, z1), V(ox + x1, y, z1), 0.05), pole); b.add(rodGeo(V(ox + x0, y, z0), V(ox + x0, y, z1), 0.05), pole); b.add(rodGeo(V(ox + x1, y, z0), V(ox + x1, y, z1), 0.05), pole); } }
  // the creek: moving water, foam along both banks
  const water = waterMat("#3a5a5a", "#6a8a7a", "#c9d8de", "horsecreek"); water.U.uAmp.value = 0.12;
  { const g = new THREE.PlaneGeometry(320, FAR_Z - BANK_Z0 + 2, 200, 30); g.rotateX(-Math.PI / 2); g.translate(ox, WATER_Y, (FAR_Z + BANK_Z0) / 2 + 1); const w = new THREE.Mesh(g, water.mat); w.receiveShadow = true; G.add(w); }
  { const foamM = new THREE.MeshBasicMaterial({ map: foamTex(), transparent: true, depthWrite: false, opacity: 0.7, fog: true, color: new THREE.Color(0.9, 0.94, 0.96) });
    const zA = BANK_Z0 + (BANK_Z1 - BANK_Z0) * 0.62, zB = FAR_Z - 0.2;
    for (let x = -150; x <= 150; x += 2.6) for (const zf of [zA, zB]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.9), foamM); f.rotation.set(-Math.PI / 2, 0, 0.05 * Math.sin(x)); f.position.set(ox + x, WATER_Y + 0.08, zf + 0.2 * Math.sin(x * 1.3)); f.renderOrder = 2; G.add(f); }
    // rocks breaking the water mid-stream, each with a collar of foam
    for (let i = 0; i < 26; i++) { const x = -60 + r(i + 30) * 120, z = BANK_Z1 + 1 + r(i + 60) * (FAR_Z - BANK_Z1 - 2); const rk = new THREE.Mesh(rockGeo(0.35 + 0.3 * r(i + 90), i + 11, 0, 0.7), M("dbCreekRock", "#7a746c")); rk.position.set(ox + x, WATER_Y - 0.12, z); shadowAll(rk); G.add(rk);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), foamM); f.rotation.x = -Math.PI / 2; f.position.set(ox + x + 0.3, WATER_Y + 0.08, z); f.renderOrder = 2; G.add(f); } }
  // sagebrush over the open ground, cottonwoods along the creek, pines up on the far bench; clear of the track, the cabins,
  // the corral, the sign and every camera spot (the cameras work along the track and in front of the cabins)
  { const sage: Fol = [];
    for (let i = 0; i < 900; i++) { const x = -150 + r(i) * 300, z = -40 + r(i + 1700) * 150; if (z > ST_Z0 - 2.5 && z < ST_Z1 + 2.2) continue; if (z > BANK_Z0 - 0.5 && z < FAR_Z + 1.5) continue;
      if (x < BLD_X1 + 1 && z > BLD_Z - 2.5 && z < BLD_Z + 10) continue; if (x < -4 && z > -12 && z < -4) continue; if (x > 9 && x < 31 && z > 6 && z < 15) continue; if (Math.hypot(x - WSIGN[0], z - WSIGN[2]) < 2.2) continue;
      if (z < -2 && Math.abs(x) < 40 && z > -16) continue;
      const s = 0.8 + 0.6 * r(i + 2400); for (const q of sageGeo(s, i)) sage.push({ g: q.g, m: M4(ox + x, riverY(x, z), z, 0).multiply(q.m), tint: q.tint }); }
    const sm = new THREE.Mesh(mergeFacets(sage), lam("dbSage", () => ({ color: "#8a9a7a", vertexColors: true, flatShading: true }))); shadowAll(sm); G.add(sm);
    const spots: [number, number, number, number][] = [];
    for (let i = 0; i < 60; i++) { const x = -150 + r(i + 300) * 300, z = r(i + 350) < 0.5 ? BANK_Z0 - 1.5 - r(i + 380) * 2 : FAR_Z + 2 + r(i + 390) * 4; if (x < BLD_X1 + 2 && z < BANK_Z0 && z > BLD_Z - 1) { if (x > -60) continue; } spots.push([ox + x, riverY(x, z), z, 0.9 + r(i + 420) * 0.4]); }
    forest(G, spots.filter(([x, , z]) => !(x - ox > 8 && x - ox < 33 && z < 16)), "creekL", 1.01);
    const pines: [number, number, number, number][] = []; for (let i = 0; i < 120; i++) { const x = -150 + r(i + 500) * 300, z = FAR_Z + 12 + r(i + 600) * 50; pines.push([ox + x, riverY(x, z), z, 0.8 + r(i + 700) * 0.5]); }
    forest(G, pines, "bench", 0); }
  // 1889: a mail sack on the post office bench
  { const sk = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8).scale(1, 1.25, 0.8), lam("dbSackM", () => ({ map: sackTex() }))); sk.position.set(ox + POST.x + 2.2, 0.85, BLD_Z - 0.6); sk.rotation.y = Math.PI; shadowAll(sk); old.add(sk); }
  // today: the welcome sign beside the track: two log posts, a cross beam, the town's name big, WYOMING under it, and a
  // plate lower down that tells visitors how to say it
  { const sb = new Batch(); for (const sx of [-1.2, 1.2]) sb.add(new THREE.CylinderGeometry(0.12, 0.14, 3.4, 8).translate(ox + WSIGN[0] + sx, 1.7, WSIGN[2]), pole); sb.add(B(ox + WSIGN[0] - 1.4, 3.25, WSIGN[2] - 0.12, ox + WSIGN[0] + 1.4, 3.4, WSIGN[2] + 0.12), dark); sb.build(today, true);
    sign(today, "DUBOIS", ox + WSIGN[0], 2.75, WSIGN[2] - 0.13, 2.1, 0.74, "#5a3a22", "#f6e8c8");
    sign(today, "WYOMING", ox + WSIGN[0], 2.18, WSIGN[2] - 0.13, 1.3, 0.34, "#f6e8c8", "#5a3a22");
    plate = sign(today, "SAY IT: DOO-BOYS", ox + WSIGN[0], 1.15, WSIGN[2] - 0.13, 2.0, 0.4, "#f6e8c8", "#7a2418");
    shadowAll(today); }
  const skies = { day: skyPl(G, wySkyTex("day"), "#5a8ec8", ox, 30, 230, 160, -20), today: skyPl(G, wySkyTex("today"), "#4f86c6", ox, 30, 229, 160, -20) };
  const dust = dustMotes(V(ox, 2, 4), V(40, 4, 20), 160, new THREE.Color(1, 0.95, 0.8), 0.04, 0.35); G.add(dust.points);
  b.build(G, true); noInk(G);
  const turf = (x: number, z: number) => { const lx = x - ox; if (z > ST_Z0 - 0.1 && z < ST_Z1 + 0.1) return null; if (z > ST_Z1 && z < BLD_Z + 9 && lx < BLD_X1 + 0.5) return null; if (z > BANK_Z0 + 1.0 && z < FAR_Z + 2) return null; return riverY(lx, z) + 0.02; };
  return { group: G, water, turf, dust, drift: (t) => { water.U.uTime.value = t; dust.drift(t); }, old, today, poSign: poSign!, plate: plate!, skies };
}

// =====================================================================================================================
export type WoodsSet = { group: THREE.Group; turf: (x: number, z: number) => number | null; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void; skies: Record<"day", THREE.Mesh> };
/** the mission: a white board chapel with a front tower and a cross, a log mission house beside it, open prairie */
export function buildWoods(): WoodsSet {
  const G = new THREE.Group(), ox = SET.woods[0], b = new Batch(), r = (k: number) => ((k * 9301 + 49297) % 233280) / 233280;
  const gy = (x: number, z: number) => 0.04 * Math.sin(x * 0.4 + z * 0.3) + 0.03 * Math.sin(x * 1.1 - z * 0.7);
  const white = lam("dbChapelW", () => ({ map: rep(clapTex("#f2eee2"), 3, 2) })), trim = M("dxTrim", "#fbf8f0"), roofM = lam("dbChapelRoof", () => ({ map: planksHD(), color: "#5a5258" })), dark = lam("dxWoodD", () => ({ map: planksHD(), color: "#4a3424" }));
  { const g = sheet(ox - 140, ox + 140, -70, 130, 140, 95, (x, z) => gy(x - ox, z), 4), m = new THREE.Mesh(g, lam("dbGrassM", () => ({ map: dirtTex("dbGrassT", "#7a7a44"), color: "#a8a070" }))); m.receiveShadow = true; G.add(m); }
  // a beaten path to the chapel door
  { const g = new THREE.PlaneGeometry(2.0, CHAPEL_Z + 12); g.rotateX(-Math.PI / 2); const pm = new THREE.Mesh(g, lam("twStreetM", () => ({ map: rep(streetTex(), 1, 1) }))); pm.position.set(ox, 0.06, (CHAPEL_Z - 12) / 2); pm.receiveShadow = true; G.add(pm); }
  // the chapel: board walls, a steep gable roof, a square tower at the front with a little spire and a cross, pointed windows
  { const hw = CH_W / 2, z0 = CHAPEL_Z + 1.6, z1 = z0 + CH_D;
    G.add(new THREE.Mesh(boxGeo(V(ox - hw, 0, z0), V(ox + hw, CH_H, z1), 2), white));
    b.add(B(ox - hw - 0.1, 0, z0 - 0.1, ox + hw + 0.1, 0.4, z1 + 0.1), M("dxFound", "#a89a8a"));
    const sh = new THREE.Shape([new THREE.Vector2(-hw - 0.4, CH_H), new THREE.Vector2(0, CH_H + CH_W * 0.62), new THREE.Vector2(hw + 0.4, CH_H)]), rg = new THREE.ExtrudeGeometry(sh, { depth: CH_D + 0.6, bevelEnabled: false }); rg.translate(ox, 0, z0 - 0.3); G.add(new THREE.Mesh(rg, roofM));
    const gab = new THREE.Shape([new THREE.Vector2(-hw, CH_H), new THREE.Vector2(0, CH_H + CH_W * 0.58), new THREE.Vector2(hw, CH_H)]); const gg = new THREE.ShapeGeometry(gab); gg.translate(ox, 0, z0 - 0.01); G.add(new THREE.Mesh(gg, white));
    // the tower: in front of the gable, its own door under a little roof, a belfry, a spire, the cross on top
    const tw = 1.0, tz0 = CHAPEL_Z - 0.4, tz1 = z0; G.add(new THREE.Mesh(boxGeo(V(ox - tw, 0, tz0), V(ox + tw, CH_H + 2.2, tz1), 2), white));
    b.add(B(ox - tw - 0.12, CH_H + 2.2, tz0 - 0.12, ox + tw + 0.12, CH_H + 2.4, tz1 + 0.12), trim);
    for (const sx of [-1, 1]) b.add(B(ox + sx * (tw - 0.1) - 0.1, CH_H + 2.4, tz0 - 0.05, ox + sx * (tw - 0.1) + 0.1, CH_H + 3.5, tz0 + 0.15), trim);
    b.add(B(ox - tw - 0.12, CH_H + 3.5, tz0 - 0.12, ox + tw + 0.12, CH_H + 3.65, tz1 + 0.12), trim);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.05, 3.2, 4).rotateY(Math.PI / 4), roofM); spire.position.set(ox, CH_H + 3.65 + 1.6, (tz0 + tz1) / 2); G.add(spire);
    const cy = CH_H + 3.65 + 3.2; b.add(B(ox - 0.06, cy - 0.05, (tz0 + tz1) / 2 - 0.06, ox + 0.06, cy + 1.1, (tz0 + tz1) / 2 + 0.06), M("dbCross", "#2a2420")); b.add(B(ox - 0.38, cy + 0.6, (tz0 + tz1) / 2 - 0.06, ox + 0.38, cy + 0.72, (tz0 + tz1) / 2 + 0.06), M("dbCross", "#2a2420"));
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.2), M("dbChDoor", "#7a3a2a")); door.rotation.y = Math.PI; door.position.set(ox, 1.1, tz0 - 0.02); G.add(door);
    b.add(B(ox - 0.75, 2.2, tz0 - 0.08, ox + 0.75, 2.32, tz0), trim); for (const st of [0, 1]) b.add(B(ox - 0.9, 0.15 * st, tz0 - 0.4 * (2 - st), ox + 0.9, 0.15 * (st + 1), tz0, 1), M("dxStep", "#c8c0b4"));
    const glass = new THREE.MeshLambertMaterial({ color: "#3a4a5a" });
    const arch = (x: number, y: number, z: number, ry: number) => { const shp = new THREE.Shape([new THREE.Vector2(-0.32, -0.6), new THREE.Vector2(0.32, -0.6), new THREE.Vector2(0.32, 0.25), new THREE.Vector2(0, 0.62), new THREE.Vector2(-0.32, 0.25)]); const m = new THREE.Mesh(new THREE.ShapeGeometry(shp), glass); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); };
    arch(ox, CH_H + 1.1, tz0 - 0.02, Math.PI); for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) arch(ox + sx * (hw + 0.02), 2.0, z0 + 2 + k * 2.6, sx > 0 ? Math.PI / 2 : -Math.PI / 2); }
  // the mission house: a log cabin at screen right, a woodpile
  { cabin(G, ox + MHOUSE[0], MHOUSE[2], 8, 6, 3.3, lam("dbLogA", () => ({ map: rep(logTex("dbLogAT", "#8a6a4a"), 2, 1.1) })), "#4a3e34");
    for (let k = 0; k < 18; k++) b.add(new THREE.CylinderGeometry(0.09, 0.09, 1.0, 7).rotateX(Math.PI / 2).translate(ox + MHOUSE[0] + 4.5 + (k % 6) * 0.19, 0.09 + Math.floor(k / 6) * 0.17, MHOUSE[2] + 1.0), dark); }
  // sagebrush and a few cottonwoods, clear of the buildings, the path and the cameras (they work on the -z side)
  { const sage: Fol = []; for (let i = 0; i < 700; i++) { const x = -130 + r(i) * 260, z = -50 + r(i + 1700) * 170; if (Math.abs(x) < 9 && z > -16 && z < CHAPEL_Z + CH_D + 4) continue; if (x < -4 && x > -17 && z > 4 && z < 18) continue; if (Math.abs(x) < 14 && z < 4 && z > -20) continue;
      const s = 0.8 + 0.6 * r(i + 2400); for (const q of sageGeo(s, i)) sage.push({ g: q.g, m: M4(ox + x, gy(x, z), z, 0).multiply(q.m), tint: q.tint }); }
    const sm = new THREE.Mesh(mergeFacets(sage), lam("dbSage", () => ({ color: "#8a9a7a", vertexColors: true, flatShading: true }))); shadowAll(sm); G.add(sm);
    const spots: [number, number, number, number][] = []; for (let i = 0; i < 26; i++) { const x = (r(i + 40) < 0.5 ? -1 : 1) * (18 + r(i + 50) * 50), z = 8 + r(i + 60) * 50; spots.push([ox + x, gy(x, z), z, 0.9 + r(i + 70) * 0.4]); }
    forest(G, spots, "mission", 1.01); }
  const skies = { day: skyPl(G, wySkyTex("day"), "#5a8ec8", ox, 8, 220, 160, -20) };
  const dust = dustMotes(V(ox, 2, 4), V(30, 4, 20), 160, new THREE.Color(1, 0.96, 0.82), 0.04, 0.4); G.add(dust.points);
  b.build(G, true); shadowAll(G); noInk(G);
  const turf = (x: number, z: number) => { const lx = x - ox; if (Math.abs(lx) < 1.1 && z < CHAPEL_Z) return null; if (Math.abs(lx) < CH_W / 2 + 0.3 && z > CHAPEL_Z - 1.4 && z < CHAPEL_Z + 1.6 + CH_D + 0.3) return null; if (lx < MHOUSE[0] + 4.3 && lx > MHOUSE[0] - 4.3 && z > MHOUSE[2] - 0.3 && z < MHOUSE[2] + 6.3) return null; return gy(lx, z); };
  return { group: G, turf, dust, drift: (t) => dust.drift(t), skies };
}

// =====================================================================================================================
export type RoomSet = { group: THREE.Group; tavern: THREE.Group; congress: THREE.Group; conv: THREE.Group; study: THREE.Group; candle: THREE.PointLight; map: THREE.MeshLambertMaterial; mapTex: Record<"app" | "red" | "map" | "news", THREE.Texture>;
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
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.68), new THREE.MeshLambertMaterial({ map: (() => { const t = signTex("", "#ffffff", "#ffffff", 512, 320); const c = t.image as HTMLCanvasElement, g = c.getContext("2d")!; for (let k = 0; k < 13; k++) { g.fillStyle = k % 2 ? "#f2f2f2" : "#b3262b"; g.fillRect(0, k * 320 / 13, 512, 320 / 13 + 1); } g.fillStyle = "#2a3a6a"; g.fillRect(0, 0, 220, 172); g.fillStyle = "#ffffff"; [7, 6, 7, 6, 6, 6].forEach((n, row) => { for (let i = 0; i < n; i++) { g.beginPath(); g.arc(18 + (row % 2 ? 15 : 0) + i * 30, 15 + row * 28, 6, 0, 6.3); g.fill(); } }); /* 38 stars (1889) */ t.needsUpdate = true; return t; })(), side: THREE.DoubleSide }));
    fl.rotation.y = Math.PI; fl.position.set(ox - 1.8, 2.4, z1 - 0.97); congress.add(fl);
    // tall windows in the side wall with daylight
    for (const z of [-3.6, -0.8]) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.55) })); wn.rotation.y = -Math.PI / 2; wn.position.set(ox + w - 0.02, 1.9, z); congress.add(wn); } }
  bc.build(congress, true);
  const map = new THREE.MeshLambertMaterial({ map: doc("app") }), mapTx = { app: doc("app"), red: doc("red"), map: doc("map"), news: doc("news") };
  { const mp = new THREE.Mesh(new THREE.PlaneGeometry(MAP.w, MAP.h), map); mp.rotation.y = Math.PI; mp.position.set(ox + MAP.x, MAP.y, z1 - 0.13); congress.add(mp); }
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
