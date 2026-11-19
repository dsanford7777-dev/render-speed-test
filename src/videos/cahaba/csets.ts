// The Cahaba bridge Short: the three sets. Built to claude/background-and-character-look.md: every light has a source,
// two scales of texture on every surface, no ink on the sets (NOINK), every corner dressed, air in every scene.
//   buildGorge   the river crossing: gorge, moving river, three stone piers, two iron spans, timber trestles, the train
//   buildTown    the street with the reward notice on the newspaper office wall
//   buildOffice  one room: the railroad's office in 1896, or a records room today
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD } from "../bridge/paint";
import { dustMotes, rockGeo, rockTex, dirtTex, mergeFacets, lightCone, pineGeo, bushGeo } from "../bridge/scenery";
import { M, T, noInk, putter, shadowAll, glow, flame, sheet, nz, mountain, rodGeo, houseAt, waterMat } from "../frozen/fsets";
import { foamTex } from "../frozen/fpaint";
import { brickTex, labelTex, glowTex, wallpaperTex, panelTex, carpetTex, clockTex, puffTex } from "../frozen/paint";
import { AFTERINK } from "../bridge/ink";
import { SET, H, PIER_X, SPAN_A, SPAN_B, RIM_L, RIM_R, RIVER_HW, groundY, CARS, POSTER, WALL_Z, TLAMP, ROOM, DESK, DLAMP } from "./place";
import { posterTex, newsTex, blueprintTex, folderTex, ironTex, pierTex, gravelTex, slopeTex, caSkyTex, signTex, coachTex, repC } from "./cpaint";

const M4 = (x: number, y: number, z: number, ry = 0, s = 1) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(s, s, s));
const sky = (G: THREE.Object3D, kind: Parameters<typeof caSkyTex>[0], ox: number, z: number, w: number, h: number, y0: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: caSkyTex(kind), fog: false, depthWrite: false })); m.rotation.y = Math.PI; m.position.set(ox, y0 + h / 2, z); m.renderOrder = -5; G.add(m); return m; };
/** a beam from a to b with a rectangular section (w across, t deep) */
const beamGeo = (a: THREE.Vector3, c: THREE.Vector3, w: number, t: number) => { const d = c.clone().sub(a), g = new THREE.BoxGeometry(w, d.length(), t); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize())); g.translate((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2); return g; };
const wheelTex = () => labelTex("", "#2a2a2e", "#2a2a2e", 1);

/** ties and two rails from x0 to x1 (rail top at y = 0), into batch b */
const track = (b: Batch, tie: THREE.Material, rail: THREE.Material, x0: number, x1: number, y = 0) => {
  for (let x = x0 + 0.3; x < x1; x += 0.72) b.add(boxGeo(V(x - 0.11, y - 0.32, -1.45), V(x + 0.11, y - 0.14, 1.45)), tie);
  for (const z of [-0.72, 0.72]) b.add(boxGeo(V(x0, y - 0.14, z - 0.045), V(x1, y, z + 0.045)), rail);
};
/** an iron deck-truss span of length len, centred on x = 0, rail top at y = 0: two trusses 3 m apart under the track */
const trussSpan = (len: number, iron: THREE.Material, tie: THREE.Material, rail: THREE.Material, ends = true) => {
  const G = new THREE.Group(), b = new Batch(), n = 8, D = 5.2, yT = -0.5, yB = yT - D, hl = len / 2;
  for (const z of [-1.5, 1.5]) {
    b.add(boxGeo(V(-hl, yT - 0.38, z - 0.17), V(hl, yT, z + 0.17), 2), iron); { const q = ends ? 0 : len / n; b.add(boxGeo(V(-hl + q, yB, z - 0.17), V(hl - q, yB + 0.34, z + 0.17), 2), iron); }
    for (let k = 0; k <= n; k++) { const x = -hl + (len * k) / n; if (ends || (k > 0 && k < n)) { const e = k === 0 ? 0.16 : k === n ? -0.16 : 0, w = e ? 0.16 : 0.12; b.add(boxGeo(V(x + e - w, yB, z - w), V(x + e + w, yT, z + w), 2), iron); }
      if (k < n) { const xn = x + len / n, up = k < n / 2; b.add(beamGeo(V(up ? x : xn, yT - 0.2, z), V(up ? xn : x, yB + 0.17, z), 0.2, 0.16), iron); } }
  }
  for (let k = 0; k <= n; k++) { const x = -hl + (len * k) / n; b.add(boxGeo(V(x - 0.09, yT - 0.3, -1.5), V(x + 0.09, yT - 0.1, 1.5)), iron); if (ends || (k > 0 && k < n)) b.add(boxGeo(V(x - 0.08, yB + 0.05, -1.5), V(x + 0.08, yB + 0.22, 1.5)), iron); if (k > 0 && k < n) { b.add(beamGeo(V(x, yT - 0.2, -1.5), V(x, yB + 0.14, 1.5), 0.1, 0.1), iron); } }
  track(b, tie, rail, -hl, hl); b.build(G, true); return G;
};

// =====================================================================================================================
export type Car = { g: THREE.Group; wheels: THREE.Mesh[]; rods: THREE.Mesh[]; len: number };
export type GorgeSet = { group: THREE.Group; water: ReturnType<typeof waterMat>; foam: THREE.Mesh[]; spans: THREE.Group[]; works: THREE.Group; cars: Car[]; wreck: THREE.Group; smoke: THREE.Sprite[]; steam: THREE.Sprite[];
  fire: THREE.PointLight; embers: THREE.Mesh[]; head: THREE.PointLight; cabLamp: THREE.PointLight; skies: Record<"morn" | "dusk" | "night" | "day", THREE.Mesh>; mist: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildGorge(): GorgeSet {
  const G = new THREE.Group(), ox = SET.gorge[0];
  const iron = lam("caIronM", () => ({ map: ironTex() })), tie = lam("caTie", () => ({ map: planksHD(), color: "#5a4636" })), rail = M("caRail", "#8a8e96"), timber = lam("caTimber", () => ({ map: planksHD(), color: "#7a5c40" })), pier = T("caPierM", () => pierTex());
  // ---- the ground: one sheet across the gorge, leaf litter and rock; gravel on the banks and the river bed ----
  const gy = (x: number, z: number) => groundY(x - ox) + (Math.abs(x - ox) < 22 ? 0.25 : 1) * (nz(x, z) + (Math.abs(x - ox) > 24 ? 0.9 * Math.sin(x * 0.21 + z * 0.13) + 0.5 * Math.sin(z * 0.31 - x * 0.07) : 0)) * (Math.abs(z) < 3 && (x - ox > RIM_L - 2 || x - ox < RIM_R + 2) ? 0 : 1);
  { const g = sheet(ox - 150, ox + 170, -80, 170, 200, 150, gy, 7), m = new THREE.Mesh(g, T("caSlopeM", () => slopeTex())); m.receiveShadow = true; G.add(m);
    const gb = sheet(ox - 14, ox + 22, -80, 170, 40, 120, (x, z) => gy(x, z) + 0.03, 4), mb = new THREE.Mesh(gb, T("caGravelM", () => gravelTex())); mb.receiveShadow = true; G.add(mb); }
  // ---- the river: moving water, rocks breaking it, foam where it meets rocks and piers ----
  const water = waterMat("#23423a", "#58785e", "#b9cbd6", "gorge"); water.U.uAmp.value = 0.32;
  { const g = new THREE.PlaneGeometry(24, 250, 60, 300); g.rotateX(-Math.PI / 2); g.translate(ox, 0, 45); const w = new THREE.Mesh(g, water.mat); w.receiveShadow = true; G.add(w); }
  const foam: THREE.Mesh[] = [], foamM = new THREE.MeshBasicMaterial({ map: foamTex(), transparent: true, depthWrite: false, opacity: 0.7, fog: true, color: new THREE.Color(0.9, 0.94, 0.96) });
  const ring = (x: number, z: number, s: number) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(s, s), foamM); f.rotation.x = -Math.PI / 2; f.position.set(ox + x, 0.07, z); f.renderOrder = 2; G.add(f); foam.push(f); };
  { const list: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [];
    for (let i = 0; i < 26; i++) { const x = ((i * 7.3) % 17) - 8.5, z = -60 + ((i * 23.7) % 150), s = 0.35 + ((i * 5) % 7) * 0.13; if (Math.abs(z) < 2.5 && Math.abs(x) < 6) continue; list.push({ g: rockGeo(s, i + 11), m: M4(ox + x, -0.05, z, i) }); ring(x, z, s * 3.4); }
    for (let i = 0; i < 90; i++) { const sd = i % 2 ? 1 : -1, x = sd > 0 ? 11 + ((i * 13.7) % 62) : -10 - ((i * 9.1) % 32), z = -70 + ((i * 31.3) % 220), s = 0.4 + ((i * 7) % 9) * 0.22; if (Math.abs(z) < 3.2 || (x > 9.5 && x < 24 && z > -18 && z < 2)) continue; list.push({ g: rockGeo(s, i + 60), m: M4(ox + x, gy(ox + x, z) + s * 0.15, z, i * 1.3), tint: 0.85 + 0.3 * ((i * 3) % 5) / 5 }); }
    const rk = new THREE.Mesh(mergeFacets(list), lam("caBoulder", () => ({ map: rockTex("caBoulderT", "#8a8276"), vertexColors: true, flatShading: true }))); rk.castShadow = true; rk.receiveShadow = true; G.add(rk); }
  // ---- trees: pines in three bands (paler with distance), bare winter trees between, brown brush ----
  { const fol: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = [], tr: typeof fol = [], bare: typeof fol = [], brush: typeof fol = [];
    for (let i = 0; i < 230; i++) { const sd = i % 3 === 0 ? -1 : 1, x = sd > 0 ? 24 + ((i * 17.3) % 130) : -14 - ((i * 11.9) % 120), z = -60 + ((i * 41.7) % 220), y = gy(ox + x, z), h = 7 + ((i * 7) % 9); if (Math.abs(z) < 5) continue;
      if (i % 4 === 0) { const t = new THREE.CylinderGeometry(0.07, 0.16, h * 0.8, 6); t.translate(0, h * 0.4, 0); bare.push({ g: t, m: M4(ox + x, y - 0.2, z) }); for (let k = 0; k < 5; k++) { const a = k * 2.4 + i, yy = h * (0.42 + 0.09 * k), l = h * 0.3; bare.push({ g: rodGeo(V(0, yy, 0), V(Math.cos(a) * l, yy + l * 0.8, Math.sin(a) * l), 0.035), m: M4(ox + x, y - 0.2, z) }); } continue; }
      const [f, t] = pineGeo(h, h * 0.2, i * 3 + 1), m = M4(ox + x, y - 0.2, z, i), far = Math.min(1, Math.max(0, (z - 10) / 140)); fol.push({ g: f, m, tint: 0.8 + 0.25 * ((i * 5) % 7) / 7 + 0.5 * far }); tr.push({ g: t, m }); }
    for (let i = 0; i < 70; i++) { const sd = i % 2 ? 1 : -1, x = sd > 0 ? 12 + ((i * 5.7) % 60) : -10.5 - ((i * 4.3) % 30), z = -50 + ((i * 19.9) % 150); if (Math.abs(z) < 3.4 || (x > 9.5 && x < 24 && z > -18 && z < 6)) continue; brush.push({ g: bushGeo(0.5 + ((i * 3) % 5) * 0.14, i + 9, 5), m: M4(ox + x, gy(ox + x, z) - 0.1, z, i), tint: 0.85 + 0.3 * ((i * 7) % 5) / 5 }); }
    const mk = (l: typeof fol, key: string, col: string) => { const ms = new THREE.Mesh(mergeFacets(l), lam(key, () => ({ color: col, vertexColors: true, flatShading: true }))); ms.castShadow = true; ms.receiveShadow = true; G.add(ms); };
    mk(fol, "caPine", "#3f5a40"); mk(tr, "caTrunk", "#4a3a2c"); mk(bare, "caBare", "#5a4a3e"); mk(brush, "caBrush", "#8a6a44"); }
  // ---- the three stone piers (all that stands today) ----
  for (const x of PIER_X) { const y0 = groundY(x) - 1.5, y1 = H - 6.15, g = new THREE.CylinderGeometry(1.75, 2.9, y1 - y0, 4, 1); g.rotateY(Math.PI / 4); g.scale(1, 1, 1.45);
    const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * ((y1 - y0) / 4));
    const m = new THREE.Mesh(g, pier); m.position.set(ox + x, (y0 + y1) / 2, 0); m.castShadow = true; m.receiveShadow = true; G.add(m);
    const cap = new THREE.Mesh(boxGeo(V(-1.6, 0, -2.5), V(1.6, 0.45, 2.5), 2), pier); cap.position.set(ox + x, y1, 0); cap.castShadow = true; G.add(cap); if (Math.abs(x) < 20) ring(x, 0, 9); }
  // ---- everything that is gone today: the two iron spans, the timber trestles, the track on the rims ----
  const works = new THREE.Group(); G.add(works);
  const spans = [SPAN_A, SPAN_B].map(([a, c]) => { const s = trussSpan(c - a, iron, tie, rail); s.position.set(ox + (a + c) / 2, H, 0); works.add(s); return s; });
  { const b = new Batch();
    const bent = (x: number) => { const y0 = groundY(x) - 0.4, y1 = H - 0.6, hgt = y1 - y0, sp = 1.5 + 0.11 * hgt;
      for (const s of [-1, 1]) { b.add(beamGeo(V(ox + x, y0, s * sp), V(ox + x, y1, s * 1.5), 0.3, 0.3), timber); b.add(beamGeo(V(ox + x, y0, s * 0.5), V(ox + x, y1, s * 0.5), 0.26, 0.26), timber); }
      for (let yy = y0 + 2.2; yy < y1 - 1; yy += 4.4) { const u = (yy - y0) / hgt, w = sp + (1.5 - sp) * u + 0.3; b.add(boxGeo(V(ox + x - 0.1, yy, -w), V(ox + x + 0.1, yy + 0.24, w)), timber); if (yy + 4.4 < y1) { const u2 = (yy + 4.4 - y0) / hgt, w2 = sp + (1.5 - sp) * u2; b.add(beamGeo(V(ox + x + 0.16, yy, -w), V(ox + x + 0.16, yy + 4.4, w2), 0.07, 0.2), timber); } }
      b.add(boxGeo(V(ox + x - 0.18, y1, -1.9), V(ox + x + 0.18, y1 + 0.3, 1.9)), timber); };
    for (const [a, c] of [[PIER_X[0], RIM_L], [RIM_R, PIER_X[2]]]) { for (let x = a + 4.5; x < c - 2; x += 4.5) bent(x); for (const z of [-0.8, 0.8]) b.add(boxGeo(V(ox + a, H - 0.62, z - 0.16), V(ox + c, H - 0.3, z + 0.16), 3), timber); }
    b.build(works, true);
    const tb = new Batch(), tg = new THREE.Group(); track(tb, tie, rail, PIER_X[0], 170); track(tb, tie, rail, -150, PIER_X[2]); tb.build(tg, true); tg.position.set(ox, H, 0); works.add(tg);
    // a telegraph line along the track on the +x rim, a milepost
    const pb = new Batch(); for (let x = RIM_L + 6; x < 170; x += 22) { pb.add(new THREE.CylinderGeometry(0.09, 0.12, 6.5, 6).translate(ox + x, H + 3.0, 3.4), timber); pb.add(boxGeo(V(ox + x - 0.05, H + 5.6, 2.7), V(ox + x + 0.05, H + 5.7, 4.1)), timber); } pb.build(works, true); }
  // ---- the train: engine, tender, baggage car, two coaches; each a group with its centre on the rail ----
  const black = M("caLoco", "#26262c"), brass = M("caBrass", "#c9a23a"), red = M("caRedTrim", "#8a2a24"), dkwood = M("caCarFrame", "#3a2c24"), roofM = M("caCarRoof", "#4a4a50"), warm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.72, 0.42), fog: true });
  const wheelM = M("caWheel", "#1e1e22"), tyre = M("caTyre", "#7a7e86");
  const wheel = (car: Car, x: number, r: number) => { for (const z of [-0.8, 0.8]) { const g = new THREE.Group(), w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.14, 20).rotateX(Math.PI / 2), tyre), hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.22, r * 0.22, 0.2, 10).rotateX(Math.PI / 2), wheelM); g.add(w, hub);
    for (let k = 0; k < 8; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(r * 1.9, 0.07, 0.16), wheelM); sp.rotation.z = (k * Math.PI) / 8; g.add(sp); }
    const ms = g as unknown as THREE.Mesh; ms.position.set(x, r, z); ms.userData.r = r; shadowAll(g); car.g.add(g); car.wheels.push(ms); } };
  const cars: Car[] = CARS.map((c, i) => { const car: Car = { g: new THREE.Group(), wheels: [], rods: [], len: c.len }, b = new Batch(), hl = c.len / 2;
    if (c.k === "engine") {
      b.add(new THREE.CylinderGeometry(0.8, 0.8, 5.9, 18).rotateZ(Math.PI / 2).translate(-1.3, 2.15, 0), black); b.add(new THREE.CylinderGeometry(0.86, 0.86, 0.5, 18).rotateZ(Math.PI / 2).translate(-4.2, 2.15, 0), black);
      b.add(new THREE.CylinderGeometry(0.3, 0.22, 1.5, 12).translate(-3.7, 3.5, 0), black); b.add(new THREE.CylinderGeometry(0.46, 0.3, 0.45, 12).translate(-3.7, 4.4, 0), black);
      for (const x of [-2.2, -0.6]) b.add(new THREE.SphereGeometry(0.42, 12, 8).translate(x, 3.0, 0), brass); b.add(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8).translate(0.6, 3.2, 0), brass);
      b.add(boxGeo(V(-4.7, 1.0, -1.0), V(4.4, 1.25, 1.0)), red); b.add(boxGeo(V(-4.75, 2.95, -0.25), V(-4.35, 3.4, 0.25)), black);
      for (let k = 0; k < 7; k++) b.add(beamGeo(V(-4.7, 1.0, -1.0 + k * 0.33), V(-5.6, 0.12, -0.3 + k * 0.1), 0.06, 0.06), red);
      // the cab: floor, roof, back wall, the far side wall; the near (-z) side is open above a low panel so the crew show
      b.add(boxGeo(V(1.7, 1.2, -1.3), V(4.4, 1.3, 1.3), 0, true), dkwood); b.add(boxGeo(V(1.5, 3.75, -1.45), V(4.6, 3.9, 1.45), 0, true), black); b.add(boxGeo(V(1.7, 1.3, 1.2), V(4.4, 3.75, 1.3)), M("caCabIn", "#7a5236"));
      b.add(boxGeo(V(1.7, 1.3, -1.3), V(4.4, 2.05, -1.2)), black); for (const x of [1.7, 4.3]) b.add(boxGeo(V(x, 2.05, -1.3), V(x + 0.1, 3.75, -1.2)), black);
      b.add(boxGeo(V(1.7, 1.3, -1.2), V(1.82, 3.75, 1.2)), M("caBackhead", "#34343a")); b.add(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 14).rotateZ(Math.PI / 2).translate(1.86, 1.75, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.1, 0.4) }));
      for (const [y, z] of [[2.7, -0.4], [2.9, 0.3], [2.5, 0.6]]) b.add(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 12).rotateZ(Math.PI / 2).translate(1.86, y, z), brass);
      for (const x of [-0.9, 0.75, 2.4]) wheel(car, x, 0.86); for (const x of [-3.9, -2.9]) wheel(car, x, 0.42);
      for (const z of [-0.98, 0.98]) { const rd = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 0.06), tyre); rd.position.set(0.75, 0.86, z); rd.castShadow = true; car.g.add(rd); car.rods.push(rd); }
    } else if (c.k === "tender") {
      b.add(boxGeo(V(-hl + 0.2, 1.0, -1.25), V(hl - 0.2, 2.5, 1.25)), black); b.add(boxGeo(V(-hl + 0.2, 2.5, -1.25), V(hl - 0.2, 2.62, 1.25)), red);
      const coal = new THREE.Mesh(rockGeo(1.2, 5, 2, 0.45), lam("caCoal", () => ({ map: rockTex("caCoalT", "#2a2a2e"), vertexColors: true, flatShading: true }))); coal.scale.set(1.7, 0.7, 0.9); coal.position.set(-0.3, 2.55, 0); coal.castShadow = true; car.g.add(coal);
      for (const x of [-1.9, -1.0, 1.0, 1.9]) wheel(car, x, 0.42);
    } else {
      const coach = c.k === "coach", side = lam("caSide" + c.k, () => ({ map: coachTex(coach ? "" : "BAGGAGE", coach ? "#5a3324" : "#4a3a2c") }));
      b.add(boxGeo(V(-hl, 0.95, -1.35), V(hl, 1.1, 1.35), 0, true), dkwood); b.add(boxGeo(V(-hl, 1.1, 1.25), V(hl, 3.4, 1.35), 6), side);
      if (coach) { b.add(boxGeo(V(-hl, 1.1, -1.35), V(hl, 2.05, -1.25), 6), side); b.add(boxGeo(V(-hl, 2.95, -1.35), V(hl, 3.4, -1.25), 6), side); for (let x = -hl; x <= hl + 0.01; x += 1.3) b.add(boxGeo(V(x - 0.07, 2.05, -1.35), V(x + 0.07, 2.95, -1.25)), dkwood);
        const back = new THREE.Mesh(new THREE.PlaneGeometry(c.len - 0.2, 2.2), warm); back.rotation.y = Math.PI; back.position.set(0, 2.25, 1.24); car.g.add(back);
        for (let x = -hl + 1.0; x < hl - 0.5; x += 1.3) b.add(boxGeo(V(x - 0.25, 1.1, 0.5), V(x + 0.25, 1.95, 1.2)), M("caSeat", "#6a2a2a")); }
      else { b.add(boxGeo(V(-hl, 1.1, -1.35), V(hl, 3.4, -1.25), 6), side); b.add(boxGeo(V(-1.0, 1.15, -1.38), V(1.0, 3.2, -1.34)), dkwood); }
      for (const x of [-hl, hl - 0.1]) b.add(boxGeo(V(x, 1.1, -1.35), V(x + 0.1, 3.4, 1.35)), dkwood);
      b.add(boxGeo(V(-hl - 0.3, 3.4, -1.5), V(hl + 0.3, 3.55, 1.5), 0, true), roofM); b.add(boxGeo(V(-hl + 0.6, 3.55, -0.6), V(hl - 0.6, 3.85, 0.6)), roofM);
      for (const x of [-hl + 1.2, -hl + 2.3, hl - 2.3, hl - 1.2]) wheel(car, x, 0.42);
    }
    b.build(car.g, true); car.g.position.set(ox + 120 + i * 14, H, 0); G.add(car.g); return car; });
  const head = new THREE.PointLight("#ffe0a0", 0, 30, 1.2); head.position.set(-4.9, 3.2, 0); cars[0].g.add(head); { const h = glow(new THREE.Color(1.5, 1.2, 0.7), 1.6); h.position.set(-4.82, 3.18, 0); cars[0].g.add(h); }
  const cabLamp = new THREE.PointLight("#ff9a50", 0, 5, 1.4); cabLamp.position.set(2.3, 2.0, -0.2); cars[0].g.add(cabLamp);
  // steam and smoke from the stack; the smoke of the wreck
  const spr = (n: number, col: THREE.Color) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color: col, transparent: true, depthWrite: false, opacity: 0, fog: false })); s.visible = false; G.add(s); return s; });
  const steam = spr(12, new THREE.Color(0.6, 0.6, 0.64)), smoke = spr(18, new THREE.Color(0.2, 0.19, 0.2));
  // ---- the wreck, afterwards: the fallen spans in the river, the cars under them, fire in it (no people are shown) ----
  const wreck = new THREE.Group(); wreck.visible = false; G.add(wreck);
  { const a = trussSpan(34, iron, tie, rail, false); a.position.set(ox + 9, 9.5, 0.6); a.rotation.set(0.12, 0.05, -1.02); wreck.add(a);
    const c = trussSpan(34, iron, tie, rail, false); c.position.set(ox - 3, 2.0, -1.5); c.rotation.set(0.5, 0.22, 0.1); wreck.add(c);
    const charred = M("caChar", "#2a2422"); for (const [x, y, z, rx, rz, l] of [[-2, 1.2, 1.2, 0.3, 0.2, 12], [6, 2.0, -0.8, -0.4, 0.5, 12], [-9, 0.9, 0.4, 0.1, -0.3, 10]]) { const m = new THREE.Mesh(boxGeo(V(-l / 2, -1.2, -1.3), V(l / 2, 1.2, 1.3), 0, true), charred); m.position.set(ox + x, y, z); m.rotation.set(rx, 0.3 * rz, rz); m.castShadow = true; wreck.add(m); }
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 7, 14).rotateZ(Math.PI / 2), black); eng.position.set(ox - 6, 1.0, -2.6); eng.rotation.set(0, 0.5, 0.25); eng.castShadow = true; wreck.add(eng);
    for (const [x, z] of [[-6, 0], [4, 1], [-1, -3], [9, -1]]) ring(x, z, 7); }
  const fire = new THREE.PointLight("#ff8a3a", 0, 40, 1.3); fire.position.set(ox + 0, 3.5, -1); G.add(fire);
  const embers: THREE.Mesh[] = []; for (const [x, y, z] of [[-3, 1.9, -1.4], [2, 2.6, -0.9], [6, 3.0, -0.2], [-8, 1.5, -0.6]]) { const f = flame(wreck, V(ox + x, y, z), 0.32); embers.push(f.f); }
  // ---- the far ridge and the skies ----
  mountain(G, "caRidge", ox + 20, 6, 170, 520, 74, 31, 0.5, 0.02, "#7a6a58"); mountain(G, "caRidge2", ox - 90, 20, 240, 520, 90, 43, 0.35, 0.02, "#8f8a86");
  const skies = { morn: sky(G, "morn", ox, 420, 1800, 800, -40), dusk: sky(G, "dusk", ox, 420, 1800, 800, -40), night: sky(G, "night", ox, 420, 1800, 800, -40), day: sky(G, "day", ox, 420, 1800, 800, -40) };
  const mist = dustMotes(V(ox, 5, 5), V(60, 14, 90), 500, new THREE.Color(0.95, 0.96, 1.0), 0.22, 0.12); G.add(mist.points);
  noInk(G); for (const sp of [...steam, ...smoke]) sp.layers.set(AFTERINK);
  return { group: G, water, foam, spans, works, cars, wreck, smoke, steam, fire, embers, head, cabLamp, skies, mist, drift: (t) => mist.drift(t) };
}

// =====================================================================================================================
export type TownSet = { group: THREE.Group; poster: THREE.Mesh; posterQ: THREE.Mesh; lamps: THREE.PointLight[]; lit: THREE.Group; skies: Record<"night" | "day", THREE.Mesh>; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildTown(): TownSet {
  const G = new THREE.Group(), ox = SET.town[0], put = putter(G, ox), b = new Batch(), lit = new THREE.Group(); G.add(lit);
  const brick = lam("caBrickM", () => ({ map: repC(brickTex("caBrick", ["#8a4a3a", "#7a4034", "#96564a", "#6e3a30"], "#4a3a34", 0.5), 3, 1.2) })), wood = lam("caTownWood", () => ({ map: planksHD(), color: "#8a7458" })), dark = M("caTownDark", "#3a2c24"), stoneM = M("caKerb", "#8a8478");
  // the street: rutted dirt, a plank sidewalk along the wall
  { const g = sheet(ox - 70, ox + 70, -60, 60, 60, 50, (x, z) => (z > 1.4 && z < WALL_Z ? 0 : 0.03 * Math.sin(x * 2.1 + z)) - (z < -70 ? 1 : 0), 5), m = new THREE.Mesh(g, T("caStreet", () => dirtTex("caStreetT", "#8a7458", true))); m.receiveShadow = true; G.add(m); }
  b.add(boxGeo(V(ox - 9, 0, 1.3), V(ox + 9, 0.16, WALL_Z), 2), wood); b.add(boxGeo(V(ox - 9, 0, 1.2), V(ox + 9, 0.16, 1.3)), stoneM);
  // the newspaper office: a brick front with a door, a lit window, a painted sign; the notice goes up on the wall between
  b.add(boxGeo(V(ox - 9, 0, WALL_Z), V(ox + 9, 6.2, WALL_Z + 0.5), 0), brick); b.add(boxGeo(V(ox - 9.2, 6.2, WALL_Z - 0.2), V(ox + 9.2, 6.6, WALL_Z + 0.7)), stoneM);
  { const s = put(new THREE.PlaneGeometry(7.5, 1.1), lam("caNewsSign", () => ({ map: signTex("THE NEWS", "#1e2a3a", "#e9c876", 1024, 160) })), 0, 4.9, WALL_Z - 0.02, false); s.rotation.y = Math.PI; }
  { const d = put(new THREE.PlaneGeometry(1.15, 2.3), M("caDoor", "#3a2a22"), 3.4, 1.31, WALL_Z - 0.02, false); d.rotation.y = Math.PI; const fr = put(new THREE.PlaneGeometry(1.4, 2.5), stoneM, 3.4, 1.38, WALL_Z - 0.01, false); fr.rotation.y = Math.PI; }
  for (const x of [-4.0, 6.2]) { const fr = put(new THREE.PlaneGeometry(1.9, 1.9), stoneM, x, 2.2, WALL_Z - 0.01, false); fr.rotation.y = Math.PI;
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 1.65), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.45, 0.75), fog: true })); wn.rotation.y = Math.PI; wn.position.set(ox + x, 2.2, WALL_Z - 0.03); lit.add(wn);
    const dk = put(new THREE.PlaneGeometry(1.65, 1.65), M("caWinDark", "#2a3440"), x, 2.2, WALL_Z - 0.02, false); dk.rotation.y = Math.PI;
    for (const [w, h] of [[1.65, 0.06], [0.06, 1.65]]) { const mu = put(new THREE.PlaneGeometry(w, h), dark, x, 2.2, WALL_Z - 0.04, false); mu.rotation.y = Math.PI; } }
  // the reward notice (and the version with three blank faces), a little proud of the wall
  const mkPoster = (q: boolean) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), new THREE.MeshLambertMaterial({ map: posterTex(q) })); p.rotation.y = Math.PI; p.position.set(ox + POSTER[0], POSTER[1], WALL_Z - 0.03); p.receiveShadow = true; G.add(p); return p; };
  const poster = mkPoster(false), posterQ = mkPoster(true);
  // older bills on the wall either side, a notice board
  for (const [x, y, k] of [[-2.3, 1.5, 0], [2.3, 1.95, 1], [-1.95, 2.6, 2]] as [number, number, number][]) { const bl = put(new THREE.PlaneGeometry(0.6, 0.8), lam("caBill" + k, () => ({ map: labelTex(["AUCTION|SAT.", "COAL|MINERS|WANTED", "L. & N.|TIME TABLE"][k], "#d9cfb4", "rgba(30,20,20,0.9)", 1) })), x, y, WALL_Z - 0.015, false); bl.rotation.set(0, Math.PI, 0.04 * (k - 1)); }
  // the street lamp by the wall (named light), a second down the street
  const lamps: THREE.PointLight[] = [];
  for (const [x, z] of [[TLAMP[0], TLAMP[2]], [11, -6]]) { b.add(new THREE.CylinderGeometry(0.06, 0.09, TLAMP[1], 8).translate(ox + x, TLAMP[1] / 2, z), dark); b.add(boxGeo(V(ox + x - 0.16, TLAMP[1], z - 0.16), V(ox + x + 0.16, TLAMP[1] + 0.36, z + 0.16)), dark);
    const fl = flame(lit, V(ox + x, TLAMP[1] + 0.16, z), 0.06); void fl; const pl = new THREE.PointLight("#ffb860", 14, 15, 1.2); pl.position.set(ox + x, TLAMP[1] + 0.1, z - 0.2); lit.add(pl); lamps.push(pl);
    const cone = lightCone(1.9, 3.0, new THREE.Color(1.0, 0.76, 0.42), 0.26); cone.position.set(ox + x, TLAMP[1] + 0.1, z); lit.add(cone); }
  // dressing: barrels, crates of newsprint, a paste bucket, a bench, a handcart of papers, a hitching rail, a horse trough
  for (const [x, z] of [[-6.2, 2.3], [-6.9, 2.5], [7.9, 2.4]]) { b.add(new THREE.CylinderGeometry(0.34, 0.3, 0.9, 12).translate(ox + x, 0.61, z), wood); for (const y of [0.35, 0.9]) b.add(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 12).translate(ox + x, y, z), dark); }
  for (const [x, z, y, k] of [[-5.1, 2.4, 0.44, 0], [-5.0, 2.45, 1.0, 1], [5.3, 2.5, 0.44, 2]] as [number, number, number, number][]) { const c = put(new THREE.BoxGeometry(0.75, 0.56, 0.6), lam("caCrate" + k, () => ({ map: labelTex(k === 2 ? "INK" : "NEWS|PRINT", "#a8834e") })), x, y, z); c.rotation.y = 0.15 * (k - 1); }
  b.add(new THREE.CylinderGeometry(0.16, 0.13, 0.3, 10).translate(ox + 1.25, 0.31, 2.35), M("caPail", "#7a7e86")); b.add(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 10).translate(ox + 1.25, 0.45, 2.35), M("caPaste", "#e9e2cf"));
  b.add(boxGeo(V(ox - 3.6, 0.6, 2.35), V(ox - 2.7, 0.66, 2.8)), wood); for (const x of [-3.55, -2.75]) b.add(boxGeo(V(ox + x - 0.04, 0.16, 2.4), V(ox + x + 0.04, 0.6, 2.75)), dark);
  for (const x of [8.5, 10.5]) b.add(boxGeo(V(ox + x - 0.07, 0, 0.4), V(ox + x + 0.07, 1.0, 0.54)), dark); b.add(boxGeo(V(ox + 8.4, 0.92, 0.42), V(ox + 10.6, 1.02, 0.52)), dark);
  { const cart = new THREE.Group(), tray = new THREE.Mesh(boxGeo(V(-0.6, 0.5, -0.4), V(0.6, 0.62, 0.4), 0, true), wood); cart.add(tray); for (const z of [-0.46, 0.46]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 16).rotateX(Math.PI / 2), dark); w.position.set(0, 0.36, z); cart.add(w); }
    for (let k = 0; k < 3; k++) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.5), lam("caPapers", () => ({ color: "#e9e2cf" }))); st.position.set(-0.36 + k * 0.36, 0.73, 0); cart.add(st); }
    cart.position.set(ox - 8.2, 0, 0.2); cart.rotation.y = 0.4; shadowAll(cart); G.add(cart); }
  // the rest of the street: a company store and miners' houses on both sides, a telegraph pole, the hill behind
  houseAt(b, G, ox + 15, 6, 9, 6, 4.2, "#7a5a3a", "#4a4038", true, 0, 0); { const s = put(new THREE.PlaneGeometry(5.5, 0.9), lam("caStoreSign", () => ({ map: signTex("COMPANY STORE", "#e9e2cc", "#2a2228", 1024, 170) })), 15, 3.5, 2.96, false); s.rotation.y = Math.PI; }
  for (const [x, z, col, yaw] of [[-17, 7, "#6a5a4a", 0.05], [-27, 9, "#5a6a5a", -0.1], [27, 9, "#7a4a40", 0.1], [-14, -22, "#5a4a3a", Math.PI], [0, -24, "#6a6a5a", Math.PI + 0.1], [14, -23, "#7a5a3a", Math.PI - 0.1], [-30, -20, "#5a5a6a", Math.PI], [38, 12, "#6a5a4a", 0], [-40, 11, "#7a6a5a", 0.1]] as [number, number, string, number][]) houseAt(b, G, ox + x, z, 6.5, 4.6, 3.1, col, "#4a4038", true, yaw, 0);
  b.add(new THREE.CylinderGeometry(0.1, 0.14, 8, 6).translate(ox - 11, 4, 2.2), dark); b.add(boxGeo(V(ox - 11.8, 7.3, 2.15), V(ox - 10.2, 7.42, 2.25)), dark);
  b.build(G, true);
  mountain(G, "caTownHill", ox, -2, 90, 420, 46, 57, 0.6, 0.02, "#6a5e4c");
  const skies = { night: sky(G, "night", ox, 300, 1400, 600, -30), day: sky(G, "morn", ox, 300, 1400, 600, -30) };
  const dust = dustMotes(V(ox, 2.2, 1), V(14, 4, 8), 220, new THREE.Color(1.0, 0.9, 0.7), 0.035, 0.5); G.add(dust.points);
  noInk(G);
  return { group: G, poster, posterQ, lamps, lit, skies, dust, drift: (t) => dust.drift(t) };
}

// =====================================================================================================================
export type OfficeSet = { group: THREE.Group; old: THREE.Group; arch: THREE.Group; lamp: THREE.PointLight; hang: THREE.PointLight; tube: THREE.PointLight; view: THREE.MeshBasicMaterial;
  sacks: THREE.Mesh[]; blueprint: THREE.Mesh; folder: THREE.Mesh; letter: THREE.Mesh; claims: THREE.Mesh; dust: ReturnType<typeof dustMotes>; drift: (t: number) => void };
export function buildOffice(): OfficeSet {
  const G = new THREE.Group(), ox = SET.office[0], put = putter(G, ox), b = new Batch(), { w: W, z0: Z0, z1: Z1, h: Hh } = ROOM, old = new THREE.Group(), arch = new THREE.Group(); G.add(old, arch);
  const floor = lam("caOfFloor", () => ({ map: planksHD(), color: "#8a6a4e" })), paperM = lam("caOfPaper", () => ({ map: repC(wallpaperTex(), 4, 1.4), color: "#b9c2a8" })), panel = lam("caOfPanel", () => ({ map: repC(panelTex(), 5, 1) })), oak = lam("caOak", () => ({ map: planksHD(), color: "#6a4630" })), dark = M("caOfDark", "#2e2622"), plaster = M("caCeil", "#d9d2c2");
  b.add(boxGeo(V(ox - W - 0.3, -0.3, Z0 - 0.3), V(ox + W + 0.3, 0, Z1 + 0.3), 2.5), floor); b.add(boxGeo(V(ox - W - 0.3, Hh, Z0 - 0.3), V(ox + W + 0.3, Hh + 0.25, Z1 + 0.3), 0, true), plaster);
  b.add(boxGeo(V(ox - W - 0.3, 1.1, Z1), V(ox + W + 0.3, Hh, Z1 + 0.3)), paperM); b.add(boxGeo(V(ox - W - 0.3, 0, Z1 - 0.04), V(ox + W + 0.3, 1.1, Z1 + 0.3)), panel);
  b.add(boxGeo(V(ox + W, 0, Z0), V(ox + W + 0.3, Hh, Z1)), paperM); b.add(boxGeo(V(ox - W, 0, Z0 - 0.3), V(ox + W, Hh, Z0)), paperM);
  // the -x wall (screen right) has a window
  for (const [y0, y1, za, zb] of [[0, 1.0, Z0, Z1], [2.4, Hh, Z0, Z1], [1.0, 2.4, Z0, -0.6], [1.0, 2.4, 0.9, Z1]]) b.add(boxGeo(V(ox - W - 0.3, y0, za), V(ox - W, y1, zb)), paperM);
  for (const z of [-0.6, 0.15, 0.9]) b.add(boxGeo(V(ox - W - 0.22, 1.0, z - 0.04), V(ox - W - 0.04, 2.4, z + 0.04)), dark); b.add(boxGeo(V(ox - W - 0.22, 1.68, -0.6), V(ox - W - 0.04, 1.74, 0.9)), dark);
  const view = new THREE.MeshBasicMaterial({ map: caSkyTex("night"), color: new THREE.Color(0.9, 0.9, 1.0), fog: false }); { const v = put(new THREE.PlaneGeometry(1.8, 1.6), view, -W - 0.6, 1.7, 0.15, false); v.rotation.y = Math.PI / 2; }
  // the desk and its chair, a rug; the lamp on the desk (named light)
  b.add(boxGeo(V(ox + DESK.x - DESK.hw, DESK.y - 0.07, DESK.z - DESK.hd), V(ox + DESK.x + DESK.hw, DESK.y, DESK.z + DESK.hd), 1.5, true), oak);
  for (const sx of [-1, 1]) b.add(boxGeo(V(ox + DESK.x + sx * (DESK.hw - 0.32) - 0.3, 0, DESK.z - DESK.hd + 0.06), V(ox + DESK.x + sx * (DESK.hw - 0.32) + 0.3, DESK.y - 0.07, DESK.z + DESK.hd - 0.06), 1.5), oak);
  { const rug = put(new THREE.PlaneGeometry(4.6, 3.2), lam("caRug", () => ({ map: carpetTex() })), 0, 0.012, 0.4, false); rug.rotation.x = -Math.PI / 2; }
  b.add(new THREE.CylinderGeometry(0.11, 0.14, 0.05, 12).translate(ox + DLAMP[0], DESK.y + 0.025, DLAMP[2]), M("caLampBase", "#c9a23a")); b.add(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 6).translate(ox + DLAMP[0], DESK.y + 0.26, DLAMP[2]), M("caLampBase", "#c9a23a"));
  { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 0.2, 14, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 1.2, 0.6), side: THREE.DoubleSide, fog: false })); sh.position.set(ox + DLAMP[0], DLAMP[1] + 0.08, DLAMP[2]); G.add(sh); flame(G, V(ox + DLAMP[0], DLAMP[1], DLAMP[2]), 0.035); }
  const lamp = new THREE.PointLight("#ffc070", 9, 9, 1.4); lamp.position.set(ox + DLAMP[0] + 0.1, DLAMP[1] + 0.05, DLAMP[2] - 0.3); G.add(lamp);
  { const cone = lightCone(0.9, 0.55, new THREE.Color(1.0, 0.8, 0.45), 0.3); cone.position.set(ox + DLAMP[0], DLAMP[1], DLAMP[2]); G.add(cone); }
  // on the desk: an inkwell, a blotter, a stack of ledgers
  b.add(boxGeo(V(ox + 0.55, DESK.y, DESK.z + 0.1), V(ox + 0.95, DESK.y + 0.16, DESK.z + 0.42)), M("caLedgers", "#5a2a26")); b.add(new THREE.CylinderGeometry(0.05, 0.06, 0.07, 10).translate(ox - 0.35, DESK.y + 0.035, DESK.z + 0.36), dark);
  // ---- 1896 dressing: a safe, a wall map of the line, a bookcase of ledgers, a wall clock, a coat stand, a hanging lamp ----
  { const ob = new Batch();
    ob.add(boxGeo(V(ox + 2.6, 0, Z1 - 1.0), V(ox + 3.8, 1.5, Z1 - 0.06)), M("caSafe", "#2e3a34")); ob.add(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 14).rotateX(Math.PI / 2).translate(ox + 3.2, 0.85, Z1 - 1.03), M("caDial", "#c9a23a")); ob.add(boxGeo(V(ox + 2.7, 0.1, Z1 - 1.02), V(ox + 3.7, 1.4, Z1 - 1.0)), M("caSafeDoor", "#26302c"));
    ob.add(boxGeo(V(ox - 4.1, 0, Z1 - 0.5), V(ox - 2.3, 2.5, Z1 - 0.06)), oak); for (let y = 0.35; y < 2.4; y += 0.52) { ob.add(boxGeo(V(ox - 4.0, y, Z1 - 0.56), V(ox - 2.4, y + 0.04, Z1 - 0.1)), dark); for (let x = -3.95; x < -2.45; x += 0.13) ob.add(boxGeo(V(ox + x, y + 0.04, Z1 - 0.5), V(ox + x + 0.1, y + 0.34 + 0.08 * Math.sin(x * 37 + y * 9), Z1 - 0.2)), M("caBook" + (Math.floor((x + 9) * 7.7 + y * 3) % 4), ["#5a2a26", "#2e4a3a", "#3a3a5a", "#6a5030"][Math.floor((x + 9) * 7.7 + y * 3) % 4])); }
    for (const [x, col] of [[2.2, "#2a2a30"]] as [number, string][]) { ob.add(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6).translate(ox + x - 0.6, 0.95, Z1 - 0.35), dark); ob.add(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 10).translate(ox + x - 0.6, 0.02, Z1 - 0.35), dark); ob.add(new THREE.CylinderGeometry(0.2, 0.26, 0.9, 10).translate(ox + x - 0.6, 1.35, Z1 - 0.35), M("caCoat", col)); }
    ob.add(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 4).translate(ox + 0.3, Hh - 0.4, 0.4), dark); ob.add(new THREE.CylinderGeometry(0.2, 0.3, 0.14, 14).translate(ox + 0.3, Hh - 0.84, 0.4), M("caShade", "#3a5a44"));
    ob.build(old, true);
    const mp = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.3), lam("caWallMap", () => ({ map: signTex("L. & N. R. R.|BIRMINGHAM MINERAL|DIVISION", "#e2d6b4", "#3a2a22", 1024, 580) }))); mp.rotation.y = Math.PI; mp.position.set(ox + 0.3, 2.05, Z1 - 0.06); old.add(mp);
    const ck = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), lam("caClock", () => ({ map: clockTex("caClockT") }))); ck.rotation.y = Math.PI; ck.position.set(ox + 3.2, 2.3, Z1 - 0.06); old.add(ck);
    flame(old, V(ox + 0.3, Hh - 0.86, 0.4), 0.04); }
  const hang = new THREE.PointLight("#ffb060", 7, 10, 1.3); hang.position.set(ox + 0.3, Hh - 1.0, 0.3); old.add(hang);
  // ---- today's dressing: steel shelves of records boxes along the back wall, a strip light ----
  { const ab = new Batch(), steel = M("caSteel", "#8a9098");
    for (const x0 of [-4.3, -1.9, 0.5, 2.9]) { for (const x of [x0, x0 + 2.2]) ab.add(boxGeo(V(ox + x - 0.03, 0, Z1 - 0.62), V(ox + x + 0.03, 2.8, Z1 - 0.06)), steel);
      for (let y = 0.1; y < 2.7; y += 0.62) { ab.add(boxGeo(V(ox + x0, y, Z1 - 0.62), V(ox + x0 + 2.2, y + 0.03, Z1 - 0.06)), steel); for (let k = 0; k < 5; k++) { const bx = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.44, 0.48), lam("caBox" + ((k + Math.round(y * 3)) % 3), () => ({ map: labelTex(["L&N|1896", "L&N|1897", "BRIDGES"][(k + Math.round(y * 3)) % 3], "#b9a27a", "rgba(30,20,20,0.9)", 1) }))); bx.position.set(ox + x0 + 0.3 + k * 0.4, y + 0.25, Z1 - 0.36); bx.castShadow = true; arch.add(bx); } } }
    ab.add(boxGeo(V(ox - 1.1, Hh - 0.1, 0.1), V(ox + 1.1, Hh - 0.02, 0.3)), M("caTubeBody", "#d8dade")); ab.build(arch, true);
    const tb = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.04, 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3.1, 3.3), fog: false })); tb.position.set(ox, Hh - 0.13, 0.2); arch.add(tb); }
  const tube = new THREE.PointLight("#e6f0ff", 8, 12, 1.2); tube.position.set(ox, Hh - 0.4, 0.2); arch.add(tube);
  b.build(G, true);
  // ---- posed papers: money sacks, the bridge drawing, a folder, a letter, a heap of claims ----
  const sacks: THREE.Mesh[] = []; for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), lam("caSack", () => ({ map: labelTex("$", "#b9a27a", "rgba(30,20,20,0.9)", 1) }))); s.scale.set(1, 1.15, 0.9); s.position.set(ox + 0.1 + (k % 3) * 0.24 - (k > 2 ? 0.12 : 0), DESK.y + 0.12 + (k > 2 ? 0.17 : 0), DESK.z + 0.1); s.rotation.y = Math.PI + 0.2 * k; s.castShadow = true; s.visible = false; G.add(s); sacks.push(s); }
  const flat = (w: number, h: number, tex: () => THREE.Texture, key: string, x: number, z: number, yaw = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam(key, () => ({ map: tex() }))); m.rotation.set(-Math.PI / 2, 0, Math.PI + yaw); m.position.set(ox + x, DESK.y + 0.006, DESK.z + z); m.receiveShadow = true; m.visible = false; G.add(m); return m; };
  const blueprint = flat(1.5, 0.94, blueprintTex, "caBlueM", -0.05, -0.02), folder = flat(0.62, 0.46, () => folderTex("L. & N. R.R.|CAHABA BRIDGE"), "caFolderM", 0.2, -0.05, 0.12), letter = flat(0.42, 0.56, () => labelTex("TO THE|EDITOR", "#f3ecd8", "rgba(30,20,20,0.85)", 1), "caLetterM", 0.12, -0.12, -0.1);
  const claims = new THREE.Mesh(boxGeo(V(-0.3, 0, -0.22), V(0.3, 0.5, 0.22), 0), lam("caClaims", () => ({ map: labelTex("CLAIMS", "#e9e2cf", "rgba(160,30,24,0.95)", 1) }))); claims.position.set(ox + 0.25, DESK.y, DESK.z - 0.1); claims.castShadow = true; claims.visible = false; G.add(claims);
  const dust = dustMotes(V(ox, 1.6, 0.6), V(7, 2.6, 5), 200, new THREE.Color(1.0, 0.9, 0.7), 0.03, 0.5); G.add(dust.points);
  noInk(G); void wheelTex;
  return { group: G, old, arch, lamp, hang, tube, view, sacks, blueprint, folder, letter, claims, dust, drift: (t) => dust.drift(t) };
}
