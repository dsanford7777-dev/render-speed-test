// Background look test (Nov 16, 2026): one lamp-lit storeroom built to the background rules in
// claude/background-and-character-look.md. Named light sources with falloff, light pools and cast shadows, two scales of
// texture on every surface, no ink outline on the set, a dressed room, a foreground layer, dust in the air.
// The room stands on a 1 m plinth in a corner of the kit yard (the yard's grass stays below its floor).
import * as THREE from "three";
import { ctex, planksHD, stoneHD, rep } from "../bridge/paint";
import { NOINK } from "../bridge/ink";

export const ROOM = { x: 24, z: 22, y: 1.0, w: 9, d: 8, h: 3.3 };
const INK = "#241726";

const std = (map: THREE.Texture | null, color = "#ffffff", rough = 0.92, bump = 0.02): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial(map ? { map, color, roughness: rough, metalness: 0, bumpMap: map, bumpScale: bump } : { color, roughness: rough, metalness: 0 });

/** packed earth / flagstone floor: big worn slabs, then grit, pebbles and scuffs on top */
const floorTex = () => ctex("bgFloor", 2048, 2048, (g, r) => {
  g.fillStyle = "#8a6c4c"; g.fillRect(0, 0, 2048, 2048);
  for (let y = 0; y < 2048; y += 256) for (let x = (y / 256) % 2 ? -128 : 0; x < 2048; x += 384) {
    const v = 0.86 + 0.26 * r(); g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(116 * v)},${Math.round(82 * v)})`;
    g.fillRect(x + 6, y + 6, 372, 244);
  }
  g.strokeStyle = "rgba(52,36,24,0.8)"; g.lineWidth = 7;
  for (let y = 0; y < 2048; y += 256) for (let x = (y / 256) % 2 ? -128 : 0; x < 2048; x += 384) g.strokeRect(x + 3, y + 3, 378, 250);
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,226,180,0.16)" : "rgba(40,26,16,0.22)"; g.fillRect(r() * 2048, r() * 2048, 2 + r() * 5, 2 + r() * 4); }
  for (let i = 0; i < 260; i++) { g.strokeStyle = "rgba(48,32,20,0.35)"; g.lineWidth = 2 + r() * 2; const x = r() * 2048, y = r() * 2048; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20 * (r() - 0.5), y + 18, x + 40 * (r() - 0.5), y + 34 * r()); g.stroke(); }
});
/** crate side: boards, grain, nail heads and a stencilled label */
const crateTex = (label: string) => ctex("bgCrate_" + label, 512, 512, (g, r) => {
  g.fillStyle = "#c9a060"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4; i++) { const v = 0.88 + 0.2 * r(); g.fillStyle = `rgb(${Math.round(206 * v)},${Math.round(164 * v)},${Math.round(98 * v)})`; g.fillRect(0, i * 128 + 3, 512, 122);
    for (let k = 0; k < 14; k++) { g.strokeStyle = "rgba(96,62,28,0.28)"; g.lineWidth = 1 + r() * 2; const y = i * 128 + 8 + r() * 112; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(170, y + 8 * (r() - 0.5), 340, y + 8 * (r() - 0.5), 512, y); g.stroke(); }
    g.fillStyle = "rgba(40,26,16,0.75)"; for (const x of [14, 498]) { g.beginPath(); g.arc(x, i * 128 + 30, 5, 0, 6.3); g.fill(); g.beginPath(); g.arc(x, i * 128 + 98, 5, 0, 6.3); g.fill(); } }
  g.fillStyle = "rgba(48,30,16,0.9)"; for (let i = 1; i < 4; i++) g.fillRect(0, i * 128 - 3, 512, 6);
  g.fillStyle = "rgba(60,28,20,0.82)"; g.textAlign = "center"; g.textBaseline = "middle";
  const ls = label.split("|"); ls.forEach((s, i) => { g.font = `900 ${ls.length > 1 ? 74 : 96}px Georgia, "Times New Roman", serif`; g.fillText(s, 256, 256 + (i - (ls.length - 1) / 2) * 92); });
});
const rugTex = () => ctex("bgRug", 512, 768, (g, r) => {
  g.fillStyle = "#7a2630"; g.fillRect(0, 0, 512, 768); g.strokeStyle = "#d9b25a"; g.lineWidth = 14; g.strokeRect(26, 26, 460, 716); g.lineWidth = 5; g.strokeRect(54, 54, 404, 660);
  for (let y = 110; y < 680; y += 96) for (let x = 110; x < 430; x += 96) { g.fillStyle = (x + y) % 192 ? "#2f4f7a" : "#d9b25a"; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x + 30, y); g.lineTo(x, y + 30); g.lineTo(x - 30, y); g.closePath(); g.fill(); }
  for (let i = 0; i < 2500; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,230,200,0.08)" : "rgba(20,8,10,0.16)"; g.fillRect(r() * 512, r() * 768, 3, 2); }
});
const clockTex = () => ctex("bgClock", 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256); g.fillStyle = "#5a3a22"; g.beginPath(); g.arc(128, 128, 124, 0, 6.3); g.fill(); g.fillStyle = "#f3e9d2"; g.beginPath(); g.arc(128, 128, 100, 0, 6.3); g.fill();
  g.fillStyle = INK; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.beginPath(); g.arc(128 + 84 * Math.sin(a), 128 - 84 * Math.cos(a), i % 3 ? 4 : 8, 0, 6.3); g.fill(); }
  g.strokeStyle = INK; g.lineCap = "round"; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + 44, 128 - 30); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 - 16, 128 - 74); g.stroke();
});
const mapTex = () => ctex("bgMap", 512, 384, (g, r) => {
  g.fillStyle = "#5a3a22"; g.fillRect(0, 0, 512, 384); g.fillStyle = "#e9dcba"; g.fillRect(18, 18, 476, 348);
  g.strokeStyle = "#3f6f9a"; g.lineWidth = 16; g.beginPath(); g.moveTo(18, 250); g.bezierCurveTo(150, 150, 260, 320, 494, 170); g.stroke();
  g.fillStyle = "rgba(120,96,60,0.55)"; for (let i = 0; i < 60; i++) g.fillRect(40 + r() * 430, 40 + r() * 300, 14 + r() * 26, 10 + r() * 18);
  g.strokeStyle = "rgba(60,40,24,0.5)"; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(18, 40 + i * 40); g.lineTo(494, 40 + i * 40); g.stroke(); }
});
const windowTex = () => ctex("bgWindow", 256, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#2b4a9a"); gr.addColorStop(0.7, "#5d86d6"); gr.addColorStop(1, "#b9c8ee"); g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(178, 120, 30, 0, 6.3); g.fill();
  g.fillStyle = "#2a1b12"; g.fillRect(0, 0, 256, 16); g.fillRect(0, 496, 256, 16); g.fillRect(0, 0, 16, 512); g.fillRect(240, 0, 16, 512); g.fillRect(120, 0, 14, 512); for (const y of [170, 336]) g.fillRect(0, y, 256, 12);
});
const glowTex = () => ctex("bgGlow", 256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.2, "rgba(255,255,255,0.4)"); gr.addColorStop(0.5, "rgba(255,255,255,0.1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
const coneTex = () => ctex("bgCone", 64, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); });
const bookTex = () => ctex("bgBooks", 512, 128, (g, r) => { const cols = ["#7a2630", "#2f4f7a", "#3f6a4a", "#8a5a2a", "#4a3a5a", "#b08a4a", "#5a2a22"]; let x = 0; g.fillStyle = "#1c120c"; g.fillRect(0, 0, 512, 128);
  while (x < 512) { const w = 16 + r() * 26, h = 86 + r() * 38; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x + 1, 128 - h, w - 2, h); g.fillStyle = "rgba(230,200,120,0.75)"; g.fillRect(x + 4, 128 - h + 14, w - 8, 4); g.fillRect(x + 4, 128 - h + 26, w - 8, 3); x += w; } });

export type Room = { group: THREE.Group; lights: THREE.PointLight[]; halos: THREE.Sprite[]; motes: THREE.Points; moteBase: Float32Array; cone: THREE.Mesh };

export function buildRoom(): Room {
  const G = new THREE.Group(), { x: X, z: Z, y: Y, w: W, d: D, h: H } = ROOM;
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, cast = true, recv = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; m.layers.set(NOINK); G.add(m); return m; };
  const box = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, mat: THREE.Material, ry = 0, cast = true) => { const m = add(new THREE.BoxGeometry(sx, sy, sz), mat, cast); m.position.set(X + cx, Y + cy, Z + cz); m.rotation.y = ry; return m; };
  const cyl = (cx: number, cy: number, cz: number, r0: number, r1: number, hh: number, mat: THREE.Material, seg = 20) => { const m = add(new THREE.CylinderGeometry(r0, r1, hh, seg), mat); m.position.set(X + cx, Y + cy, Z + cz); return m; };
  // surfaces: big form + fine pattern, and the pattern also drives a bump so the lamp rakes across it
  const stoneT = stoneHD("bgStoneWall", ["#8f7a66", "#84705c", "#9a8572", "#7a6654"], "#3a2c22");
  const wallM = std(rep(stoneT, 5, 1.9), "#ffffff", 0.95, 0.06), wallSide = std(rep(stoneT, 4.4, 1.9), "#ffffff", 0.95, 0.06);
  const plankT = planksHD(), woodM = std(rep(plankT, 1, 1), "#8f7658", 0.85, 0.03), woodDark = std(rep(plankT, 0.5, 0.5), "#66503a", 0.85, 0.03), beamM = std(rep(plankT, 2, 0.25), "#5a4430", 0.9, 0.03);
  const floorM = std(rep(floorTex(), 3, 2.7), "#b8b0a8", 0.97, 0.06), ironM = std(null, "#2e2a30", 0.6), brassM = new THREE.MeshStandardMaterial({ color: "#c79a3a", roughness: 0.35, metalness: 0.8 });
  // shell
  box(0, -0.5, 0, W, 1.0, D, floorM, 0, false);
  box(0, H / 2, -D / 2, W, H, 0.3, wallM, 0, false); box(0, H / 2, D / 2, W, H, 0.3, wallM, 0, false);
  box(-W / 2, H / 2, 0, 0.3, H, D, wallSide, 0, false); box(W / 2, H / 2, 0, 0.3, H, D, wallSide, 0, false);
  box(0, H + 0.1, 0, W, 0.2, D, woodDark, 0, true);
  // wainscot on the back wall, ceiling beams and posts repeating into the room
  box(0, 0.55, -D / 2 + 0.2, W - 0.4, 1.1, 0.08, woodM, 0, false); box(0, 1.13, -D / 2 + 0.22, W - 0.4, 0.07, 0.12, beamM, 0, false);
  for (let k = 0; k < 4; k++) { const z = -D / 2 + 0.9 + k * 2.0; box(0, H - 0.14, z, W - 0.3, 0.26, 0.24, beamM); for (const sx of [-1, 1]) box(sx * (W / 2 - 0.3), H / 2, z, 0.24, H, 0.24, beamM); }
  // window on the back wall: cold night outside, against the warm lamps
  { const wm = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.9), new THREE.MeshBasicMaterial({ map: windowTex(), color: new THREE.Color(1.15, 1.15, 1.25), fog: false })); wm.position.set(X + 2.6, Y + 2.0, Z - D / 2 + 0.17); wm.layers.set(NOINK); G.add(wm); }
  // rug, table, papers, books, inkwell, table lamp
  { const rug = add(new THREE.PlaneGeometry(2.6, 3.9), std(rugTex(), "#7c7672", 1, 0.01), false); rug.rotation.x = -Math.PI / 2; rug.rotation.z = 0.12; rug.scale.setScalar(0.8); rug.position.set(X - 0.5, Y + 0.012, Z - 1.0); }
  box(1.3, 0.86, -1.9, 2.3, 0.08, 1.0, woodM); for (const [dx, dz] of [[-1.05, -0.4], [1.05, -0.4], [-1.05, 0.4], [1.05, 0.4]]) box(1.3 + dx, 0.41, -1.9 + dz, 0.09, 0.82, 0.09, woodDark);
  const paper = std(null, "#f3ead2", 0.9); for (const [dx, dz, ry] of [[0.6, -1.8, 0.2], [0.9, -2.05, -0.3], [1.75, -1.7, 0.5]]) box(dx, 0.905, dz, 0.3, 0.008, 0.21, paper, ry, false);
  for (let k = 0; k < 3; k++) box(2.05, 0.93 + k * 0.055, -2.1, 0.3 - k * 0.02, 0.05, 0.22, std(null, ["#7a2630", "#2f4f7a", "#3f6a4a"][k], 0.8), 0.15 * k);
  cyl(1.45, 0.94, -2.15, 0.04, 0.05, 0.08, ironM, 12);
  // chair
  box(2.4, 0.45, -1.0, 0.46, 0.05, 0.46, woodM, -0.5); box(2.5, 0.88, -0.82, 0.46, 0.8, 0.05, woodM, -0.5); for (const [dx, dz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) box(2.4 + dx, 0.22, -1.0 + dz, 0.05, 0.44, 0.05, woodDark, -0.5);
  // shelves with books and jars on the back wall
  for (let k = 0; k < 3; k++) { box(-2.3, 1.45 + k * 0.48, -D / 2 + 0.34, 2.3, 0.05, 0.3, woodDark);
    const bk = add(new THREE.PlaneGeometry(2.1, 0.34), new THREE.MeshStandardMaterial({ map: rep(bookTex(), 1, 1), roughness: 0.85 }), false); bk.position.set(X - 2.3 + (k % 2 ? 0.05 : -0.05), Y + 1.65 + k * 0.48, Z - D / 2 + 0.42); }
  for (const sx of [-3.45, -1.15]) box(sx, 1.95, -D / 2 + 0.34, 0.06, 1.5, 0.3, woodDark);
  for (let k = 0; k < 4; k++) cyl(-3.1 + k * 0.28, 2.58, -D / 2 + 0.36, 0.07, 0.07, 0.2, new THREE.MeshStandardMaterial({ color: ["#9fc0c8", "#c9b06a", "#a8c890", "#c88a70"][k], roughness: 0.2, transparent: true, opacity: 0.8 }), 12);
  // clock and map
  { const ck = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshStandardMaterial({ map: clockTex(), transparent: true, alphaTest: 0.5, roughness: 0.7 })); ck.position.set(X + 0.7, Y + 2.35, Z - D / 2 + 0.17); ck.layers.set(NOINK); G.add(ck);
    const mp = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshStandardMaterial({ map: mapTex(), roughness: 0.9 })); mp.rotation.y = Math.PI / 2; mp.position.set(X - W / 2 + 0.17, Y + 1.95, Z - 1.4); mp.layers.set(NOINK); G.add(mp); }
  // barrels: staves, iron hoops
  const barrel = (bx: number, bz: number, s = 1) => { const b = cyl(bx, 0.5 * s, bz, 0.3 * s, 0.3 * s, 1.0 * s, std(rep(plankT, 1.4, 0.5), "#9a6e40", 0.85, 0.04), 18); b.scale.set(1, 1, 1);
    const mid = cyl(bx, 0.5 * s, bz, 0.345 * s, 0.345 * s, 0.5 * s, std(rep(plankT, 1.4, 0.25), "#a67847", 0.85, 0.04), 18); void mid;
    for (const hy of [0.12, 0.3, 0.7, 0.88]) cyl(bx, hy * s, bz, 0.335 * s + (hy > 0.2 && hy < 0.8 ? 0.016 : 0), 0.335 * s + (hy > 0.2 && hy < 0.8 ? 0.016 : 0), 0.045 * s, ironM, 18); };
  barrel(-3.5, -2.9); barrel(-2.8, -3.1, 0.92); barrel(-3.3, -2.15, 0.8);
  // crates with stencilled labels, stacked and skewed
  const crate = (cx: number, cy: number, cz: number, s: number, label: string, ry: number) => box(cx, cy, cz, s, s * 0.8, s, std(crateTex(label), "#ffffff", 0.9, 0.03), ry);
  crate(3.4, 0.36, -3.0, 0.9, "LAMP|OIL", 0.1); crate(3.5, 1.0, -3.05, 0.7, "CANDLES|40 LBS", -0.2); crate(2.55, 0.3, -3.2, 0.75, "TEA", 0.3); crate(3.6, 0.3, -1.6, 0.75, "PARADOX|TOWN", -0.12);
  // sacks, bucket with water, ladder, coat pegs, rope coil, broom
  const sackM = std(null, "#b59a6a", 1); for (const [sx2, sz2, s] of [[-3.6, 0.4, 1], [-3.1, 0.8, 0.85], [-3.55, 1.25, 0.9]]) { const m = add(new THREE.SphereGeometry(0.34 * s, 14, 10), sackM); m.scale.set(1.15, 0.7, 1); m.position.set(X + sx2, Y + 0.24 * s, Z + sz2); }
  cyl(2.3, 0.17, 0.4, 0.2, 0.16, 0.34, std(rep(plankT, 1, 0.25), "#8a6a44", 0.85, 0.03), 14); { const wt = add(new THREE.CircleGeometry(0.18, 18), new THREE.MeshStandardMaterial({ color: "#3f6f9a", roughness: 0.08, metalness: 0.2 }), false); wt.rotation.x = -Math.PI / 2; wt.position.set(X + 2.3, Y + 0.31, Z + 0.4); }
  for (const sx of [-0.22, 0.22]) { const r = box(-4.0 + 0, 1.3, 2.2 + sx, 0.05, 2.7, 0.05, woodDark); r.rotation.z = -0.2; r.position.x = X - 3.85; } for (let k = 0; k < 6; k++) { const r = box(-3.85 + (k * 0.42 - 1.05) * 0.2, 0.25 + k * 0.42, 2.2, 0.04, 0.04, 0.44, woodDark); void r; }
  for (let k = 0; k < 3; k++) cyl(-0.9 + k * 0.4, 1.9, -D / 2 + 0.22, 0.02, 0.02, 0.14, brassM, 8).rotation.set(Math.PI / 2, 0, 0);
  { const rope = add(new THREE.TorusGeometry(0.2, 0.045, 8, 20), std(null, "#c9a85a", 1)); rope.position.set(X - 0.5, Y + 1.62, Z - D / 2 + 0.24); }
  // rubble and grit along the wall foot: the same stone, every size
  { let s = 17; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const rm = std(rep(stoneT, 0.3, 0.3), "#cdb090", 0.95, 0.04);
    for (let i = 0; i < 46; i++) { const sz = 0.03 + 0.09 * r() * r(); const m = add(new THREE.DodecahedronGeometry(sz, 0), rm, sz > 0.07); const along = r() > 0.45; m.position.set(X + (along ? (r() - 0.5) * (W - 1) : (r() > 0.5 ? 1 : -1) * (W / 2 - 0.35 - 0.3 * r())), Y + sz * 0.6, Z + (along ? -D / 2 + 0.3 + 0.5 * r() * r() : (r() - 0.5) * (D - 1))); m.rotation.set(r() * 3, r() * 3, r() * 3); } }
  // ---- named lights ----
  const lights: THREE.PointLight[] = [], halos: THREE.Sprite[] = [];
  const lantern = (lx: number, ly: number, lz: number, I: number, hang: boolean, shadow: boolean) => {
    const p = new THREE.PointLight("#ffb45a", I, 9, 2); p.position.set(X + lx, Y + ly, Z + lz); p.userData.I = I;
    if (shadow) { p.castShadow = true; p.shadow.mapSize.set(1024, 1024); p.shadow.bias = -0.004; p.shadow.radius = 4; p.shadow.camera.near = 0.15; p.shadow.camera.far = 14; }
    G.add(p); lights.push(p);
    cyl(lx, ly + 0.16, lz, 0.09, 0.11, 0.05, ironM, 12).castShadow = false; cyl(lx, ly - 0.17, lz, 0.11, 0.12, 0.06, std(null, "#8a2a22", 0.6), 12).castShadow = false;
    const glass = add(new THREE.CylinderGeometry(0.08, 0.09, 0.28, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 0.9), transparent: true, opacity: 0.85, fog: false }), false, false); glass.position.set(X + lx, Y + ly, Z + lz);
    if (hang) { const ch = cyl(lx, ly + 0.2 + (H - ly - 0.2) / 2, lz, 0.012, 0.012, H - ly - 0.2, ironM, 6); ch.castShadow = false; }
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(1.5, 0.95, 0.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); h.position.set(X + lx, Y + ly, Z + lz); h.scale.setScalar(1.5); h.userData.k = 1; h.layers.set(NOINK); G.add(h); halos.push(h);
  };
  lantern(-0.9, 2.45, -0.9, 13, true, true);     // hanging lantern over the rug: the key light
  lantern(1.75, 1.08, -2.0, 3.2, false, false);    // lamp on the table
  barrel(2.15, 1.2, 0.95); lantern(2.15, 1.14, 1.2, 1.4, false, false); halos[halos.length - 1].userData.k = 0.45;   // a barrel and lantern close to the lens: the foreground layer
  { const cold = new THREE.PointLight("#6f8fe0", 7, 7, 1.8); cold.position.set(X + 2.6, Y + 2.0, Z - D / 2 + 0.7); cold.userData.I = 7; G.add(cold); lights.push(cold); }
  // a soft cone of light under the hanging lantern, and dust drifting through it
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.35, 2.3, 28, 1, true), new THREE.MeshBasicMaterial({ map: coneTex(), color: new THREE.Color(1.0, 0.7, 0.32), transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  cone.position.set(X - 0.9, Y + 1.25, Z - 0.9); cone.layers.set(NOINK); G.add(cone);
  const N = 260, base = new Float32Array(N * 3); { let s = 5; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < N; i++) { base[i * 3] = X + (r() - 0.5) * (W - 1); base[i * 3 + 1] = Y + 0.2 + r() * (H - 0.5); base[i * 3 + 2] = Z + (r() - 0.5) * (D - 0.6); } }
  const mg = new THREE.BufferGeometry(); mg.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ map: glowTex(), color: new THREE.Color(1.6, 1.2, 0.7), size: 0.035, sizeAttenuation: true, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  motes.frustumCulled = false; motes.layers.set(NOINK); G.add(motes);
  return { group: G, lights, halos, motes, moteBase: base, cone };
}

/** per frame: lamps on or off, a little flicker, dust drifting */
export function poseRoom(rm: Room, on: boolean, t: number) {
  rm.group.visible = on; if (!on) return;
  rm.lights.forEach((l, i) => { l.intensity = (l.userData.I as number) * (1 + 0.05 * Math.sin(t * 9 + i * 2.1) + 0.03 * Math.sin(t * 23 + i)); });
  rm.halos.forEach((h, i) => h.scale.setScalar(1.5 * (h.userData.k as number) * (1 + 0.05 * Math.sin(t * 9 + i * 2.1))));
  const p = rm.motes.geometry.attributes.position as THREE.BufferAttribute, a = p.array as Float32Array, b = rm.moteBase;
  for (let i = 0; i < a.length / 3; i++) { a[i * 3] = b[i * 3] + 0.18 * Math.sin(t * 0.3 + i); a[i * 3 + 1] = b[i * 3 + 1] + 0.25 * Math.sin(t * 0.21 + i * 1.7); a[i * 3 + 2] = b[i * 3 + 2] + 0.18 * Math.cos(t * 0.26 + i * 0.6); }
  p.needsUpdate = true;
}
