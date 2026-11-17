// The Great Stink Short: the river in front of Parliament, and the new sewer under the city.
//   buildRiver  a quay and a timber jetty on the near side, the brown river (its level is posed: it sinks in the hot
//               summer and bares the mud and the sewer mouths), the terrace wall, the long gothic front, the clock tower.
//   buildSewer  a round brick tunnel running away into the dark, lit only by its own lanterns (lamp light on everything).
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD, cobbleHD, stoneHD } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import { dustMotes, rockGeo, mergeFacets } from "../bridge/scenery";
import { SET, RIVER, WATER, JETTY, OUTFALLS, OUTFALL_Y, SEWER, SEWER_LAMPS } from "./place";
import { waterTex, mudTex, facadeTex, brickTex, labelTex, clockTex, glowTex, repT } from "./paint";
import { M, makeBucket } from "./sets";
import { ctex } from "../bridge/paint";

const noInk = (o: THREE.Object3D) => { o.traverse((c) => { c.layers.set(NOINK); }); return o; };
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
const skyTex = () => ctex("skSky", 64, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#8fa6b4"); gr.addColorStop(0.45, "#cfd0b4"); gr.addColorStop(0.78, "#ecdca6"); gr.addColorStop(1, "#d9c490"); g.fillStyle = gr; g.fillRect(0, 0, 64, 512); });
const pourTex = () => ctex("skPour", 64, 256, (g, r) => { g.clearRect(0, 0, 64, 256); const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, "rgba(90,70,36,0)"); gr.addColorStop(0.3, "rgba(104,84,44,0.95)"); gr.addColorStop(0.7, "rgba(84,66,34,0.95)"); gr.addColorStop(1, "rgba(90,70,36,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 40; i++) { g.strokeStyle = r() > 0.5 ? "rgba(190,170,110,0.5)" : "rgba(40,28,12,0.5)"; g.lineWidth = 2; const x = 14 + r() * 36, y = r() * 256; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2 * (r() - 0.5), y + 20 + r() * 40); g.stroke(); } });

export type RiverSet = { group: THREE.Group; water: THREE.Mesh; waterMap: THREE.Texture; pours: THREE.Mesh[]; pourMap: THREE.Texture; barge: THREE.Group; boat: THREE.Group; drift: (t: number) => void };
export function buildRiver(): RiverSet {
  const G = new THREE.Group(), ox = SET.river[0], b = new Batch(), nb = new Batch(), { zQuay: ZQ, zWall: ZW, yTerrace: YT, zFacade: ZF, yQuay: YQ } = RIVER;
  const put = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, cast = true) => { const ms = new THREE.Mesh(g, m); ms.position.set(ox + x, y, z); ms.castShadow = cast; ms.receiveShadow = true; G.add(ms); return ms; };
  const stone = lam("skRvStone", () => ({ map: stoneHD("skRvStoneHD", ["#b4a684", "#a89a7a", "#bfb190", "#9c8e70"], "#6a6048") })), stoneDark = lam("skRvStoneD", () => ({ map: stoneHD("skRvStoneDHD", ["#8a7e64", "#7e7258", "#94886c"], "#4e4636") }));
  const cob = lam("skRvCobble", () => ({ map: cobbleHD(), color: "#b0a48e" })), fac = lam("skFacadeM", () => ({ map: facadeTex() })), slate = M("skSlate", "#4a4e5a"), trim = M("skRvTrim", "#c9b384"), wood = lam("skRvPlank", () => ({ map: planksHD(), color: "#9a7c58" })), wood2 = M("skRvWood2", "#5a4430"), iron = M("skIron", "#34303a");
  // ---- near side: the quay, and a jetty running out over the water ----
  b.add(boxGeo(V(ox - 90, -3.2, -44), V(ox + 90, YQ, ZQ), 4), cob); b.add(boxGeo(V(ox - 90, YQ - 0.5, ZQ - 0.02), V(ox + 90, YQ + 0.02, ZQ + 0.25), 2.4), stone);
  b.add(boxGeo(V(ox - JETTY.hw, JETTY.y - 0.12, ZQ), V(ox + JETTY.hw, JETTY.y + 0.04, JETTY.z1), 2), wood);
  for (const z of [ZQ + 0.8, -1.2, JETTY.z1 - 0.3]) for (const sx of [-1, 1]) { const g = new THREE.CylinderGeometry(0.13, 0.15, 4.2, 8); g.translate(ox + sx * (JETTY.hw - 0.05), JETTY.y - 1.7, z); b.add(g, wood2); }
  for (const z of [ZQ + 0.8, -1.2, JETTY.z1 - 0.3]) b.add(boxGeo(V(ox - JETTY.hw - 0.1, JETTY.y - 0.3, z - 0.07), V(ox + JETTY.hw + 0.1, JETTY.y - 0.12, z + 0.07)), wood2);
  // bollards, lamp posts, crates and sacks along the quay; a board pointing people out of town
  for (let x = -26; x <= 26; x += 4.4) if (Math.abs(x) > 2.2) { const g = new THREE.CylinderGeometry(0.16, 0.2, 0.7, 10); g.translate(ox + x, YQ + 0.35, ZQ - 0.45); b.add(g, iron); const c = new THREE.SphereGeometry(0.2, 10, 8); c.translate(ox + x, YQ + 0.72, ZQ - 0.45); b.add(c, iron); }
  for (const x of [-6.6, 6.6, -19.8, 19.8]) { const g = new THREE.CylinderGeometry(0.06, 0.09, 3.3, 8); g.translate(ox + x, YQ + 1.65, ZQ - 1.5); b.add(g, iron); const h = new THREE.BoxGeometry(0.34, 0.44, 0.34); h.translate(ox + x, YQ + 3.5, ZQ - 1.5); b.add(h, iron);
    const gl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.26), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.4, 1.1) })); gl.position.set(ox + x, YQ + 3.5, ZQ - 1.5); G.add(gl); }
  for (const [x, z, s, ry] of [[-3.3, -6.8, 0.8, 0.2], [-4.2, -6.5, 0.6, -0.3], [-3.5, -6.7, 0.5, 0.5], [9.5, -7.4, 0.9, 0.1], [10.5, -7.2, 0.7, -0.4], [-12, -8, 0.8, 0.3]]) { const m = put(new THREE.BoxGeometry(s, s * 0.8, s), lam("skCrateRv", () => ({ map: labelTex("LONDON", "#a8834e") })), x, YQ + s * 0.4 + (x === -3.5 ? 0.64 : 0), z); m.rotation.y = ry; }
  { const post = put(new THREE.BoxGeometry(0.14, 2.7, 0.14), wood2, 1.3, YQ + 1.35, ZQ - 1.3); void post;
    const bd = put(new THREE.BoxGeometry(1.7, 0.6, 0.06), lam("skRailBoard", () => ({ map: labelTex("TO THE RAILWAY →|ANYWHERE BUT HERE", "#e6dcc0", "rgba(40,30,26,0.95)", 3) })), 1.3, YQ + 2.45, ZQ - 1.38); bd.rotation.y = Math.PI; }
  // ---- the bed of the river: mud sloping in from both sides, lumpy, littered ----
  { const zA = ZQ - 0.2, zB = ZW + 0.2, D = zB - zA, g0 = new THREE.PlaneGeometry(180, D, 90, 14); g0.rotateX(-Math.PI / 2); g0.translate(ox, 0, (zA + zB) / 2);
    const p = g0.attributes.position as THREE.BufferAttribute, uv = g0.attributes.uv as THREE.BufferAttribute, sm = (v: number) => { const u = Math.max(0, Math.min(1, v)); return u * u * (3 - 2 * u); };
    const h = (x: number, z: number) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), d = Math.min(z - zA, zB - z); p.setY(i, -0.3 - 2.0 * sm(d / 5.2) + 0.2 * h(Math.round(x), Math.round(z * 2)) * sm(d / 1.5) + 0.12 * Math.sin(x * 0.7 + z)); uv.setXY(i, x / 6, z / 6); }
    const g = g0.toNonIndexed(); g.computeVertexNormals(); const n = g.attributes.position.count, col = new Float32Array(n * 3); for (let t = 0; t < n; t += 3) { const k = 0.82 + 0.3 * h(t, 7); for (let j = 0; j < 9; j++) col[t * 3 + j] = k; } g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, lam("skMudM", () => ({ map: mudTex(), vertexColors: true, flatShading: true }))); m.receiveShadow = true; G.add(m);
    // litter left on the mud: barrels, planks, a wheel, crates, stones
    const junk: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[] = []; let s = 5; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 60; i++) { const x = (r() - 0.5) * 70, side = r() > 0.5, z = side ? ZW - 0.6 - 3.4 * r() : ZQ + 0.6 + 3.2 * r(), d = Math.min(z - zA, zB - z), y = -0.3 - 2.0 * sm(d / 5.2); junk.push({ g: rockGeo(0.1 + 0.22 * r() * r(), i + 11, 0, 0.6), m: new THREE.Matrix4().makeTranslation(ox + x, y + 0.05, z), tint: 0.7 + 0.5 * r() }); }
    const jm = new THREE.Mesh(mergeFacets(junk), lam("skMudStone", () => ({ color: "#6a5c46", vertexColors: true, flatShading: true }))); jm.castShadow = true; jm.receiveShadow = true; G.add(jm);
    for (const [x, z, ry, rz] of [[-4.5, 9.6, 0.4, 1.3], [7.5, 10.2, 1.2, 1.45], [-15, 9.9, 2.0, 1.2], [3.2, -1.6, 0.6, 1.4]]) { const y = -0.3 - 2.0 * sm(Math.min(z - zA, zB - z) / 5.2); const br = put(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 12), M("skStaveMud", "#5a4630"), x, y + 0.25, z); br.rotation.set(0, ry, rz); }
    for (const [x, z, ry] of [[-9, 10.4, 0.3], [11, 9.4, -0.5], [-1.5, 10.7, 1.1], [-6.5, -2.0, 0.2], [13.5, -2.4, -0.7]]) { const y = -0.3 - 2.0 * sm(Math.min(z - zA, zB - z) / 5.2); const pl = put(new THREE.BoxGeometry(2.2, 0.06, 0.24), wood2, x, y + 0.08, z); pl.rotation.set(0.1, ry, 0.06); }
    { const y = -0.3 - 2.0 * sm((ZW + 0.2 - 9.2) / 5.2); const wh = put(new THREE.TorusGeometry(0.55, 0.06, 6, 20), wood2, 2.2, y + 0.3, 9.2); wh.rotation.set(1.1, 0.3, 0); for (let k = 0; k < 4; k++) { const sp = put(new THREE.BoxGeometry(1.06, 0.045, 0.045), wood2, 2.2, y + 0.3, 9.2); sp.rotation.set(1.1, 0.3, (k * Math.PI) / 4, "YXZ"); } } }
  // ---- the water (level posed per frame) ----
  const waterMap = repT(waterTex(), 14, 1.4);
  const water = new THREE.Mesh(plane(180, ZW - ZQ + 0.4), lam("skWaterM", () => ({ map: waterMap, color: "#b9a892" }))); water.rotation.x = -Math.PI / 2; water.position.set(ox, WATER.high, (ZQ + ZW) / 2); water.receiveShadow = true; G.add(water);
  // ---- the terrace wall with its sewer mouths, the balustrade, the terrace ----
  b.add(boxGeo(V(ox - 90, -3.2, ZW), V(ox + 90, YT, ZW + 1.4), 2.4), stone); b.add(boxGeo(V(ox - 90, YT - 0.3, ZW + 1.4), V(ox + 90, YT, ZF), 2.4), stoneDark);
  b.add(boxGeo(V(ox - 90, YT, ZW + 0.1), V(ox + 90, YT + 0.16, ZW + 0.5)), trim); b.add(boxGeo(V(ox - 90, YT + 0.86, ZW + 0.08), V(ox + 90, YT + 1.0, ZW + 0.52)), trim);
  for (let x = -88; x <= 88; x += 0.55) { const g = new THREE.CylinderGeometry(0.07, 0.09, 0.72, 6); g.translate(ox + x, YT + 0.5, ZW + 0.3); nb.add(g, trim); }
  for (let x = -84.5; x <= 85; x += 6.5) { b.add(boxGeo(V(ox + x - 0.3, YT, ZW), V(ox + x + 0.3, YT + 1.25, ZW + 0.6), 1.2), stone); const c = new THREE.SphereGeometry(0.24, 10, 8); c.translate(ox + x, YT + 1.45, ZW + 0.3); b.add(c, trim); }
  const pourMap = repT(pourTex(), 1, 2), pours: THREE.Mesh[] = [];
  for (const x of OUTFALLS) { const hole = put(new THREE.CircleGeometry(0.62, 22), new THREE.MeshBasicMaterial({ color: "#0c0a0a" }), x, OUTFALL_Y, ZW - 0.015, false); hole.rotation.y = Math.PI;
    const ring = put(new THREE.TorusGeometry(0.68, 0.12, 8, 26), lam("skOutRing", () => ({ map: brickTex("skOutRingT", ["#8a4a36", "#7a3e2e", "#96543e"], "#4a3430") })), x, OUTFALL_Y, ZW - 0.02); void ring;
    const stain = put(plane(1.5, 2.6), new THREE.MeshLambertMaterial({ map: pourMap, color: "#6a5a40", transparent: true, opacity: 0.55 }), x, OUTFALL_Y - 1.7, ZW - 0.012, false); stain.rotation.y = Math.PI;
    const pr = new THREE.Mesh(plane(0.9, 1), new THREE.MeshLambertMaterial({ map: pourMap, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide })); pr.position.set(ox + x, OUTFALL_Y - 0.8, ZW - 0.22); pr.rotation.y = Math.PI; G.add(pr); pours.push(pr); }
  // ---- the building: a long front in bays, buttresses with pinnacles, a slate roof with a spiked ridge ----
  const X0 = -54, X1 = 38, TOP = YT + 16;
  b.add(boxGeo(V(ox + X0, YT, ZF), V(ox + X1, TOP, ZF + 14), 8), fac); b.add(boxGeo(V(ox + X0 - 0.2, TOP, ZF - 0.25), V(ox + X1 + 0.2, TOP + 0.7, ZF + 14.2), 4), trim);
  b.add(boxGeo(V(ox + X0 + 1, TOP + 0.7, ZF + 2), V(ox + X1 - 1, TOP + 3.6, ZF + 13), 6), slate);
  for (let x = X0; x <= X1 + 0.1; x += 4) { b.add(boxGeo(V(ox + x - 0.34, YT, ZF - 0.75), V(ox + x + 0.34, TOP + 0.9, ZF), 4), trim); const pc = new THREE.ConeGeometry(0.42, 2.4, 4); pc.rotateY(Math.PI / 4); pc.translate(ox + x, TOP + 2.1, ZF - 0.38); nb.add(pc, trim);
    for (const y of [YT + 5, YT + 10.5]) b.add(boxGeo(V(ox + x - 0.42, y, ZF - 0.85), V(ox + x + 0.42, y + 0.3, ZF)), stoneDark); }
  for (let x = X0 + 2; x < X1; x += 2) { const sp = new THREE.ConeGeometry(0.12, 1.1, 4); sp.translate(ox + x, TOP + 4.15, ZF + 7.5); nb.add(sp, iron); }
  // end pavilions, and the clock tower away to screen left
  for (const [x0, x1, hgt] of [[X1, X1 + 8, TOP + 7], [X0 - 8, X0, TOP + 7]]) { b.add(boxGeo(V(ox + x0, YT, ZF - 0.6), V(ox + x1, hgt, ZF + 14), 8), fac); const rf = new THREE.ConeGeometry(6.2, 6, 4); rf.rotateY(Math.PI / 4); rf.translate(ox + (x0 + x1) / 2, hgt + 3, ZF + 4.2); nb.add(rf, slate);
    for (const tx of [x0, x1]) { const tr = new THREE.CylinderGeometry(0.7, 0.7, hgt - YT + 2, 8); tr.translate(ox + tx, (hgt + YT) / 2 + 1, ZF - 0.6); nb.add(tr, trim); const tc = new THREE.ConeGeometry(0.85, 3, 8); tc.translate(ox + tx, hgt + 3.5, ZF - 0.6); nb.add(tc, slate); } }
  { const cx = 52, cz = ZF + 5, hw = 4.2, clockY = YT + 46;
    b.add(boxGeo(V(ox + cx - hw, YT, cz - hw), V(ox + cx + hw, clockY - 4.5, cz + hw), 8), fac); b.add(boxGeo(V(ox + cx - hw - 0.5, clockY - 4.5, cz - hw - 0.5), V(ox + cx + hw + 0.5, clockY + 4.8, cz + hw + 0.5), 0), trim);
    const face = put(plane(7.2, 7.2), new THREE.MeshLambertMaterial({ map: clockTex("skBigClock", "#f1ead6"), transparent: true, alphaTest: 0.5 }), cx, clockY, cz - hw - 0.53, false); face.rotation.y = Math.PI;
    b.add(boxGeo(V(ox + cx - hw - 0.2, clockY + 4.8, cz - hw - 0.2), V(ox + cx + hw + 0.2, clockY + 9, cz + hw + 0.2), 8), fac);
    const sp = new THREE.ConeGeometry(6.4, 15, 4); sp.rotateY(Math.PI / 4); sp.translate(ox + cx, clockY + 16.5, cz); nb.add(sp, slate); const fin = new THREE.ConeGeometry(0.5, 5, 6); fin.translate(ox + cx, clockY + 26, cz); nb.add(fin, M("skGold", "#d9b04a"));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const tc = new THREE.ConeGeometry(0.8, 4.5, 6); tc.translate(ox + cx + sx * hw, clockY + 11.2, cz + sz * hw); nb.add(tc, trim); } }
  // far along the river both ways: pale warehouses and chimneys, faded before the haze reaches them
  { const far = lam("skRvFar", () => ({ color: "#b9ac8c" })), far2 = lam("skRvFar2", () => ({ color: "#c9bd9c" })); let s = 3; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (const sx of [-1, 1]) for (let i = 0; i < 16; i++) { const x = sx * (70 + i * 9 + r() * 4), w = 6 + r() * 8, hgt = 7 + r() * 12, z = ZW + 6 + r() * 30; nb.add(boxGeo(V(ox + x - w / 2, 0, z), V(ox + x + w / 2, hgt, z + 12)), i % 2 ? far : far2);
      if (r() > 0.4) { const ch = new THREE.CylinderGeometry(0.5, 0.7, hgt * 0.9, 8); ch.translate(ox + x + 1, hgt + hgt * 0.45, z + 4); nb.add(ch, far); } } }
  b.build(G, true); nb.build(G, false);
  // ---- afloat: a sailing barge with a brown sail, and a rowing boat by the jetty (both posed: they ground when the water goes) ----
  const barge = new THREE.Group(), tar = M("skTar", "#2e2620"), sailM = M("skSail", "#8a4a30", { side: THREE.DoubleSide });
  { const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => { const ms = new THREE.Mesh(g, m); ms.position.set(x, y, z); ms.castShadow = true; ms.receiveShadow = true; barge.add(ms); return ms; };
    add(new THREE.BoxGeometry(8.4, 1.1, 2.5), tar, 0, 0.45, 0); const bow = add(new THREE.ConeGeometry(1.25, 1.8, 4), tar, 5.0, 0.45, 0); bow.rotation.z = -Math.PI / 2; bow.rotation.x = Math.PI / 4; bow.scale.set(0.9, 1, 0.44 / 0.9);
    add(new THREE.BoxGeometry(8.6, 0.1, 2.7), wood2, 0, 1.02, 0); add(new THREE.BoxGeometry(1.8, 0.8, 1.6), M("skCabin", "#5a6a4a"), -2.8, 1.45, 0); add(new THREE.CylinderGeometry(0.09, 0.12, 8.5, 8), wood2, 0.8, 5.2, 0);
    const sail = add(new THREE.PlaneGeometry(4.6, 6.2, 6, 6), sailM, 2.2, 5.2, 0.1); const sp = sail.geometry.attributes.position as THREE.BufferAttribute; for (let i = 0; i < sp.count; i++) sp.setZ(i, 0.35 * Math.sin((sp.getX(i) / 4.6 + 0.5) * Math.PI)); sail.geometry.computeVertexNormals();
    const sprit = add(new THREE.CylinderGeometry(0.05, 0.05, 7.6, 6), wood2, 2.4, 5.3, 0.1); sprit.rotation.z = -0.62; for (let k = 0; k < 3; k++) add(new THREE.BoxGeometry(0.7, 0.5, 0.7), lam("skCrateRv", () => ({ map: labelTex("LONDON", "#a8834e") })), 1.5 + k * 0.9, 1.32, 0.3 * (k % 2 ? 1 : -1)); }
  barge.position.set(ox - 11.5, WATER.high - 0.3, 6.2); barge.rotation.y = 0.12; G.add(barge);
  const boat = new THREE.Group();
  { const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M("skBoat", "#6a7a5a", { side: THREE.DoubleSide })); hull.scale.set(1.7, 0.5, 0.62); hull.castShadow = true; boat.add(hull);
    for (const x of [-0.6, 0.3]) { const th = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 1.05), wood2); th.position.set(x, -0.12, 0); boat.add(th); } const oar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.08), wood2); oar.position.set(0, -0.05, 0.3); oar.rotation.y = 0.2; boat.add(oar); }
  boat.position.set(ox + 3.3, WATER.high + 0.3, -2.4); boat.rotation.y = 0.5; G.add(boat);
  // ---- the sky behind everything: a hot hazy gradient ----
  { const sk = new THREE.Mesh(plane(1400, 420), new THREE.MeshBasicMaterial({ map: skyTex(), fog: false, depthWrite: false })); sk.rotation.y = Math.PI; sk.position.set(ox, 150, 260); sk.renderOrder = -5; G.add(sk); }
  const dust = dustMotes(new THREE.Vector3(ox, 1.6, -4), new THREE.Vector3(14, 3, 8), 140, new THREE.Color(1.3, 1.2, 0.8), 0.024, 0.35); G.add(dust.points);
  noInk(G);
  return { group: G, water, waterMap, pours, pourMap, barge, boat, drift: dust.drift };
}

export type SewerSet = { group: THREE.Group; works: THREE.Group; water: THREE.Mesh; waterMap: THREE.Texture; lights: THREE.PointLight[]; halos: THREE.Sprite[]; drift: (t: number) => void };
export function buildSewer(): SewerSet {
  const G = new THREE.Group(), ox = SET.sewer[0], { r: R, wall: CY, ch: CH, z0: Z0, z1: Z1 } = SEWER, L = Z1 - Z0, zc = (Z0 + Z1) / 2;
  const std = (map: THREE.Texture | null, color = "#ffffff", rough = 0.9, bump = 0.03, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial(map ? { map, color, roughness: rough, metalness: 0, bumpMap: map, bumpScale: bump, ...extra } : { color, roughness: rough, metalness: 0, ...extra });
  const put = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, cast = true, to: THREE.Object3D = G) => { const ms = new THREE.Mesh(g, m); ms.position.set(ox + x, y, z); ms.castShadow = cast; ms.receiveShadow = true; to.add(ms); return ms; };
  const bt = brickTex("skSewerBrick", ["#a85a40", "#9a4e38", "#b4664a", "#8e4632"], "#5a4a40");
  // the tube: a full round of brick, the walkways and channel cutting across its lower part
  { const tube = new THREE.CylinderGeometry(R, R, L, 36, 1, true); tube.rotateX(Math.PI / 2); const m = put(tube, std(repT(bt, 5, L / 3), "#ffffff", 0.92, 0.05, { side: THREE.BackSide }), 0, CY + 0.4, zc, false); void m; }
  const hw = Math.sqrt(R * R - (CY + 0.4) * (CY + 0.4)), flag = stoneHD("skSewerFlag", ["#8a8278", "#7e766c", "#968e84"], "#4a443e");
  for (const sx of [-1, 1]) put(new THREE.BoxGeometry(hw - CH + 0.3, 0.8, L), std(repT(flag, 0.6, L / 2.4), "#c9c2b8", 0.95, 0.04), sx * (CH + (hw - CH + 0.3) / 2), -0.4, zc, false);
  put(new THREE.BoxGeometry(2 * CH, 0.1, L), std(repT(bt, 0.6, L / 3), "#8a8078", 0.95, 0.04), 0, -0.78, zc, false);
  // ribs: a ring of header bricks every 4 m, pulling the eye down the tunnel
  { const rm = std(repT(bt, 6, 0.12), "#d8b8a0", 0.9, 0.04); for (let z = Z0 + 2; z < Z1; z += 4) { const t = put(new THREE.TorusGeometry(R - 0.07, 0.1, 6, 44), rm, 0, CY + 0.4, z, false); void t; } }
  put(new THREE.CircleGeometry(R, 24), new THREE.MeshBasicMaterial({ color: "#050404" }), 0, CY + 0.4, Z1 - 0.1, false).rotation.y = Math.PI;
  // the water in the channel (posed: a trickle while they build, a river today)
  const waterMap = repT(waterTex(), 0.5, 12);
  const water = put(plane(2 * CH, L), new THREE.MeshStandardMaterial({ map: waterMap, color: "#a89878", roughness: 0.25, metalness: 0.1 }), 0, -0.62, zc, false); water.rotation.x = -Math.PI / 2;
  // ---- named lights: lanterns hung from the crown; the near ones light the brick, the far ones are only glows ----
  const lights: THREE.PointLight[] = [], halos: THREE.Sprite[] = [], ironM = std(null, "#2a262c", 0.6), topY = CY + 0.4 + R;
  SEWER_LAMPS.forEach((z, i) => { const y = topY - 1.05;
    put(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 5), ironM, 0, topY - 0.45, z, false); put(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 10), ironM, 0, y + 0.16, z, false); put(new THREE.CylinderGeometry(0.12, 0.13, 0.05, 10), ironM, 0, y - 0.16, z, false);
    const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.27, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 0.9), fog: false })); gl.position.set(ox, y, z); G.add(gl);
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(1.5, 0.95, 0.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); h.position.set(ox, y, z); h.scale.setScalar(1.5); G.add(h); halos.push(h);
    if (i < 4) { const p = new THREE.PointLight("#ffb45a", i === 0 ? 11 : 9, 12, 1.6); p.position.set(ox, y - 0.1, z); p.userData.I = p.intensity; if (i === 0) { p.castShadow = true; p.shadow.mapSize.set(1024, 1024); p.shadow.bias = -0.004; p.shadow.camera.near = 0.15; p.shadow.camera.far = 16; } G.add(p); lights.push(p); } });
  { const fill = new THREE.PointLight("#ffb45a", 1.6, 9, 2); fill.position.set(ox + 0.8, 1.8, -3.5); fill.userData.I = 1.6; G.add(fill); lights.push(fill); }
  // ---- the works (only while they are building): brick stacks, a mortar tub, a barrow, a ladder, a plank over the channel, props ----
  const works = new THREE.Group(); G.add(works);
  { const wood = std(repT(planksHD(), 0.5, 0.5), "#8f7658", 0.85, 0.03), wd = std(null, "#6a5238", 0.9), stack = std(repT(bt, 0.5, 0.4), "#ffffff", 0.9, 0.04);
    for (const [x, z, hgt] of [[1.42, 4.4, 0.7], [1.42, 5.3, 0.45], [-1.4, 8.2, 0.8], [1.4, 13.5, 0.6], [-1.42, 15.2, 0.5]]) put(new THREE.BoxGeometry(0.62, hgt, 0.78), stack, x, hgt / 2, z, true, works);
    put(new THREE.CylinderGeometry(0.36, 0.3, 0.3, 14), wd, -1.38, 0.15, 3.3, true, works); put(new THREE.CylinderGeometry(0.33, 0.33, 0.02, 14), std(null, "#b9b4a8", 1), -1.38, 0.29, 3.3, false, works);
    { const bw = new THREE.Group(); const tray = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.56), wood); tray.position.y = 0.48; bw.add(tray); const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 14), wd); wh.rotation.x = Math.PI / 2; wh.position.set(0.62, 0.2, 0); bw.add(wh);
      for (const sz of [-0.24, 0.24]) { const hd = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.04), wd); hd.position.set(-0.3, 0.4, sz); hd.rotation.z = -0.12; bw.add(hd); const lg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.04), wd); lg.position.set(-0.3, 0.18, sz); bw.add(lg); }
      const ld = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), stack); ld.scale.set(1.1, 0.5, 0.75); ld.position.y = 0.66; bw.add(ld);
      bw.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); bw.rotation.y = Math.PI / 2 + 0.2; bw.position.set(ox + 1.36, 0, 9.3); works.add(bw); }
    put(new THREE.BoxGeometry(2.4, 0.06, 0.4), wood, 0, 0.03, 6.6, true, works);
    { const lad = new THREE.Group(); for (const sz of [-0.22, 0.22]) { const rl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.0, 0.05), wd); rl.position.set(0, 1.5, sz); lad.add(rl); } for (let k = 0; k < 7; k++) { const rg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.44), wd); rg.position.set(0, 0.3 + k * 0.4, 0); lad.add(rg); } lad.traverse((o) => { o.castShadow = true; }); lad.rotation.z = 0.2; lad.position.set(ox - 1.55, 0, 11.2); works.add(lad); }
    // timber props holding the fresh arch at the far working face
    for (const z of [19, 21.5]) { for (const sx of [-1, 1]) { const pst = put(new THREE.BoxGeometry(0.16, 3.3, 0.16), wd, sx * 1.5, 1.65, z, true, works); pst.rotation.z = sx * -0.12; } put(new THREE.BoxGeometry(3.4, 0.16, 0.16), wd, 0, 3.3, z, true, works); }
    for (const [x, z] of [[-1.3, 5.6], [1.35, 11.6]]) { const bk = makeBucket("#b9b4a8"); bk.traverse((o) => { const ms = o as THREE.Mesh; if (ms.isMesh) ms.material = wd; }); bk.position.set(ox + x, 0, z); works.add(bk); }
    const rub = mergeFacets(Array.from({ length: 30 }, (_, i) => ({ g: rockGeo(0.04 + 0.07 * ((i * 7) % 5) / 5, i + 3, 0, 0.6), m: new THREE.Matrix4().makeTranslation(ox + (i % 2 ? 1 : -1) * (1.05 + 0.5 * ((i * 13) % 7) / 7), 0.03, 1 + i * 0.62) }))); const rm = new THREE.Mesh(rub, std(null, "#a8604a", 0.95, 0, { vertexColors: true, flatShading: true })); rm.castShadow = true; works.add(rm); }
  const dust = dustMotes(new THREE.Vector3(ox, 2.0, 6), new THREE.Vector3(3.4, 3, 16), 200, new THREE.Color(1.6, 1.2, 0.7), 0.03, 0.5); G.add(dust.points);
  noInk(G);
  return { group: G, works, water, waterMap, lights, halos, drift: dust.drift };
}
