// Background look test (Nov 16, 2026): one lamp-lit rock-cut storeroom built to the background rules in
// claude/background-and-character-look.md. Named light sources with falloff, light pools and cast shadows, two scales of
// texture on every surface (faceted rock + flecks, planks + grain), no ink outline on the set, a dressed room, a
// foreground layer close to the lens, dust in the air.
// The room stands on a 1 m plinth in a corner of the kit yard (the yard's grass stays below its floor).
import * as THREE from "three";
import { ctex, planksHD, rep } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import { rockTex, rockWall, rockGeo, dustMotes, lightCone } from "../bridge/scenery";

export const ROOM = { x: 24, z: 22, y: 1.0, w: 9, d: 8, h: 3.3 };
/** the key lantern (world): characters' shadow twins turn to face it */
export const ROOM_KEY: [number, number, number] = [ROOM.x - 0.6, ROOM.y + 2.6, ROOM.z - 2.2];
const INK = "#241726";

const std = (map: THREE.Texture | null, color = "#ffffff", rough = 0.92, bump = 0.02): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial(map ? { map, color, roughness: rough, metalness: 0, bumpMap: map, bumpScale: bump } : { color, roughness: rough, metalness: 0 });

/** flagstone floor: big worn slabs, then grit, pebbles and scuffs on top */
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
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#22408c"); gr.addColorStop(0.7, "#4f78c8"); gr.addColorStop(1, "#9db2e6"); g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(178, 120, 30, 0, 6.3); g.fill();
  g.fillStyle = "#2a1b12"; g.fillRect(120, 0, 14, 512); for (const y of [170, 336]) g.fillRect(0, y, 256, 12);
});
const glowTex = () => ctex("bgGlow", 256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.2, "rgba(255,255,255,0.4)"); gr.addColorStop(0.5, "rgba(255,255,255,0.1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
const bookTex = () => ctex("bgBooks", 512, 128, (g, r) => { const cols = ["#7a2630", "#2f4f7a", "#3f6a4a", "#8a5a2a", "#4a3a5a", "#b08a4a", "#5a2a22"]; let x = 0; g.fillStyle = "#1c120c"; g.fillRect(0, 0, 512, 128);
  while (x < 512) { const w = 16 + r() * 26, h = 86 + r() * 38; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x + 1, 128 - h, w - 2, h); g.fillStyle = "rgba(230,200,120,0.75)"; g.fillRect(x + 4, 128 - h + 14, w - 8, 4); g.fillRect(x + 4, 128 - h + 26, w - 8, 3); x += w; } });

export type Room = { group: THREE.Group; lights: THREE.PointLight[]; halos: THREE.Sprite[]; drift: (t: number) => void };

export function buildRoom(): Room {
  const G = new THREE.Group(), { x: X, z: Z, y: Y, w: W, d: D, h: H } = ROOM, Z0 = -D / 2;
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, cast = true, recv = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; m.layers.set(NOINK); G.add(m); return m; };
  const box = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, mat: THREE.Material, ry = 0, cast = true) => { const m = add(new THREE.BoxGeometry(sx, sy, sz), mat, cast); m.position.set(X + cx, Y + cy, Z + cz); m.rotation.y = ry; return m; };
  const cyl = (cx: number, cy: number, cz: number, r0: number, r1: number, hh: number, mat: THREE.Material, seg = 20) => { const m = add(new THREE.CylinderGeometry(r0, r1, hh, seg), mat); m.position.set(X + cx, Y + cy, Z + cz); return m; };
  // surfaces: big form + fine pattern, and the pattern also drives a bump so the lamp rakes across it
  const rockT = rockTex("bgRock", "#a98866"), rockM = new THREE.MeshStandardMaterial({ map: rockT, bumpMap: rockT, bumpScale: 0.05, roughness: 0.96, metalness: 0, vertexColors: true, flatShading: true });
  const shellM = std(null, "#3a2c22", 1);
  const plankT = planksHD(), woodM = std(rep(plankT, 1, 1), "#8f7658", 0.85, 0.03), woodDark = std(rep(plankT, 0.5, 0.5), "#66503a", 0.85, 0.03), beamM = std(rep(plankT, 2, 0.25), "#5a4430", 0.9, 0.03);
  const floorM = std(rep(floorTex(), 3, 2.7), "#b8b0a8", 0.97, 0.06), ironM = std(null, "#2e2a30", 0.6), brassM = new THREE.MeshStandardMaterial({ color: "#c79a3a", roughness: 0.35, metalness: 0.8 });
  // shell: plain boxes keep the light in; the rock faces stand just inside them
  box(0, -0.5, 0, W, 1.0, D, floorM, 0, false);
  box(0, H / 2, Z0, W, H, 0.3, shellM, 0, false); box(0, H / 2, D / 2, W, H, 0.3, shellM, 0, false);
  box(-W / 2, H / 2, 0, 0.3, H, D, shellM, 0, false); box(W / 2, H / 2, 0, 0.3, H, D, shellM, 0, false);
  box(0, H + 0.1, 0, W, 0.2, D, woodDark, 0, true);
  { const flat = (u: number, v: number) => { const x = (u - 0.5) * (W - 0.3), y = v * H; return (x > -1.05 && x < 0.55 && y > 0.85) || (x > -3.95 && x < -2.25 && y > 0.9 && y < 3.0) || (x > -2.2 && x < -0.85 && y > 1.8 && y < 2.2) || (x > 0.55 && x < 1.5 && y > 1.9 && y < 2.8) ? 0.25 : 1; };
    const back = add(rockWall(W - 0.3, H, 0.7, 0.42, 3, 2.6, flat), rockM, false); back.position.set(X, Y, Z + Z0 + 0.16);
    const left = add(rockWall(D - 0.3, H, 0.7, 0.3, 5, 2.6), rockM, false); left.rotation.y = Math.PI / 2; left.position.set(X - W / 2 + 0.16, Y, Z);
    const right = add(rockWall(D - 0.3, H, 0.7, 0.3, 8, 2.6), rockM, false); right.rotation.y = -Math.PI / 2; right.position.set(X + W / 2 - 0.16, Y, Z); }
  // wainscot along the back wall, ceiling beams and posts repeating into the room
  for (let k = 0; k < 4; k++) { const z = Z0 + 0.9 + k * 2.0; box(0, H - 0.14, z, W - 0.3, 0.26, 0.24, beamM); for (const sx of [-1, 1]) box(sx * (W / 2 - 0.5), H / 2, z, 0.24, H, 0.24, beamM); }
  // window in a timber frame: cold night outside, against the warm lamps
  { for (const sx of [-0.62, 0.62]) box(-0.25 + sx, 2.0, Z0 + 0.42, 0.14, 2.14, 0.16, woodDark, 0, false); for (const sy of [-1.0, 1.0]) box(-0.25, 2.0 + sy, Z0 + 0.42, 1.38, 0.14, 0.16, woodDark, 0, false);
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.9), new THREE.MeshBasicMaterial({ map: windowTex(), color: new THREE.Color(1.1, 1.1, 1.2), fog: false })); wm.position.set(X - 0.25, Y + 2.0, Z + Z0 + 0.46); wm.layers.set(NOINK); G.add(wm);
    box(-0.25, 0.98, Z0 + 0.5, 1.5, 0.06, 0.26, woodM); }
  // rug, table, papers, books, inkwell
  { const rug = add(new THREE.PlaneGeometry(2.6, 3.9), std(rugTex(), "#d6cec6", 1, 0.01), false); rug.rotation.x = -Math.PI / 2; rug.rotation.z = 0.12; rug.scale.setScalar(0.8); rug.position.set(X - 0.5, Y + 0.012, Z - 1.0); }
  box(1.7, 0.86, -2.0, 1.9, 0.08, 0.95, woodM); for (const [dx, dz] of [[-0.85, -0.38], [0.85, -0.38], [-0.85, 0.38], [0.85, 0.38]]) box(1.7 + dx, 0.41, -2.0 + dz, 0.09, 0.82, 0.09, woodDark);
  const paper = std(null, "#f3ead2", 0.9); for (const [dx, dz, ry] of [[1.1, -1.9, 0.2], [1.4, -2.15, -0.3], [2.1, -1.8, 0.5]]) box(dx, 0.905, dz, 0.3, 0.008, 0.21, paper, ry, false);
  for (let k = 0; k < 3; k++) box(2.35, 0.93 + k * 0.055, -2.2, 0.3 - k * 0.02, 0.05, 0.22, std(null, ["#7a2630", "#2f4f7a", "#3f6a4a"][k], 0.8), 0.15 * k);
  cyl(1.75, 0.94, -2.25, 0.04, 0.05, 0.08, ironM, 12);
  // chair
  box(2.5, 0.45, -1.05, 0.46, 0.05, 0.46, woodM, -0.5); box(2.6, 0.88, -0.87, 0.46, 0.8, 0.05, woodM, -0.5); for (const [dx, dz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) box(2.5 + dx, 0.22, -1.05 + dz, 0.05, 0.44, 0.05, woodDark, -0.5);
  // shelves with books and jars, on a plank back panel
  box(-3.1, 1.95, Z0 + 0.42, 1.5, 1.7, 0.05, woodM, 0, false);
  for (let k = 0; k < 3; k++) { box(-3.1, 1.3 + k * 0.48, Z0 + 0.6, 1.5, 0.05, 0.3, woodDark);
    const bk = add(new THREE.PlaneGeometry(1.3, 0.34), new THREE.MeshStandardMaterial({ map: rep(bookTex(), 0.62, 1), roughness: 0.85 }), false); bk.position.set(X - 3.1 + (k % 2 ? 0.04 : -0.04), Y + 1.5 + k * 0.48, Z + Z0 + 0.68); }
  for (const sx of [-3.85, -2.35]) box(sx, 1.95, Z0 + 0.6, 0.06, 1.7, 0.3, woodDark);
  for (let k = 0; k < 4; k++) cyl(-3.5 + k * 0.26, 2.9, Z0 + 0.62, 0.07, 0.07, 0.2, new THREE.MeshStandardMaterial({ color: ["#9fc0c8", "#c9b06a", "#a8c890", "#c88a70"][k], roughness: 0.2, transparent: true, opacity: 0.8 }), 12);
  // clock on a board, a peg rail with a rope coil, a map on the side wall
  { box(1.0, 2.35, Z0 + 0.42, 0.8, 0.8, 0.05, woodM, 0, false);
    const ck = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshStandardMaterial({ map: clockTex(), transparent: true, alphaTest: 0.5, roughness: 0.7 })); ck.position.set(X + 1.0, Y + 2.35, Z + Z0 + 0.46); ck.layers.set(NOINK); G.add(ck);
    box(-1.5, 2.0, Z0 + 0.44, 1.2, 0.16, 0.05, woodM, 0, false);
    for (let k = 0; k < 3; k++) cyl(-1.9 + k * 0.4, 2.0, Z0 + 0.52, 0.02, 0.02, 0.14, brassM, 8).rotation.set(Math.PI / 2, 0, 0);
    const rope = add(new THREE.TorusGeometry(0.2, 0.045, 8, 20), std(null, "#c9a85a", 1)); rope.position.set(X - 1.5, Y + 1.76, Z + Z0 + 0.54);
    box(-W / 2 + 0.52, 1.95, -1.4, 0.05, 1.3, 1.7, woodM, 0, false);
    const mp = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshStandardMaterial({ map: mapTex(), roughness: 0.9 })); mp.rotation.y = Math.PI / 2; mp.position.set(X - W / 2 + 0.56, Y + 1.95, Z - 1.4); mp.layers.set(NOINK); G.add(mp); }
  // barrels: staves, a fatter belly, iron hoops
  const barrel = (bx: number, bz: number, s = 1) => { cyl(bx, 0.5 * s, bz, 0.3 * s, 0.3 * s, 1.0 * s, std(rep(plankT, 1.4, 0.5), "#9a6e40", 0.85, 0.04), 18);
    cyl(bx, 0.5 * s, bz, 0.345 * s, 0.345 * s, 0.5 * s, std(rep(plankT, 1.4, 0.25), "#a67847", 0.85, 0.04), 18);
    for (const hy of [0.12, 0.3, 0.7, 0.88]) { const rr = 0.335 * s + (hy > 0.2 && hy < 0.8 ? 0.016 : 0); cyl(bx, hy * s, bz, rr, rr, 0.045 * s, ironM, 18); } };
  barrel(-2.9, -3.0); barrel(-2.2, -3.1, 0.92); barrel(-2.65, -2.3, 0.8);
  // crates with stencilled labels, stacked and skewed
  const crate = (cx: number, cy: number, cz: number, s: number, label: string, ry: number) => box(cx, cy, cz, s, s * 0.8, s, std(crateTex(label), "#ffffff", 0.9, 0.03), ry);
  crate(-0.25, 0.36, -3.0, 0.9, "LAMP|OIL", 0.08); crate(3.4, 0.36, -3.0, 0.9, "TEA", 0.1); crate(3.5, 1.0, -3.05, 0.7, "CANDLES|40 LBS", -0.2); crate(3.6, 0.3, -1.6, 0.75, "PARADOX|TOWN", -0.12); crate(-3.7, 0.3, -1.2, 0.75, "SALT", 0.2);
  // sacks, bucket with water, ladder
  const sackM = std(null, "#b59a6a", 1); for (const [sx2, sz2, s] of [[-3.6, 0.4, 1], [-3.1, 0.8, 0.85], [-3.55, 1.25, 0.9]]) { const m = add(new THREE.SphereGeometry(0.34 * s, 14, 10), sackM); m.scale.set(1.15, 0.7, 1); m.position.set(X + sx2, Y + 0.24 * s, Z + sz2); }
  cyl(0.9, 0.17, -2.9, 0.2, 0.16, 0.34, std(rep(plankT, 1, 0.25), "#8a6a44", 0.85, 0.03), 14); { const wt = add(new THREE.CircleGeometry(0.18, 18), new THREE.MeshStandardMaterial({ color: "#3f6f9a", roughness: 0.08, metalness: 0.2 }), false); wt.rotation.x = -Math.PI / 2; wt.position.set(X + 0.9, Y + 0.31, Z - 2.9); }
  { const lad = new THREE.Group(); for (const sx of [-0.22, 0.22]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.7, 0.05), woodDark); r.position.set(0, 1.35, sx); lad.add(r); } for (let k = 0; k < 6; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.44), woodDark); r.position.set(0, 0.3 + k * 0.42, 0); lad.add(r); }
    lad.traverse((o) => { o.castShadow = true; o.receiveShadow = true; o.layers.set(NOINK); }); lad.rotation.z = -0.2; lad.position.set(X - 3.6, Y, Z + 2.2); G.add(lad); }
  // rubble and grit along the wall foot: the same rock, every size
  { let s = 17; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 54; i++) { const sz = 0.035 + 0.13 * r() * r(); const m = add(rockGeo(sz, i, 0), rockM, sz > 0.07); const along = r() > 0.45; m.position.set(X + (along ? (r() - 0.5) * (W - 1) : (r() > 0.5 ? 1 : -1) * (W / 2 - 0.6 - 0.3 * r())), Y + sz * 0.5, Z + (along ? Z0 + 0.6 + 0.5 * r() * r() : (r() - 0.5) * (D - 1))); m.rotation.y = r() * 6; } }
  // ---- named lights ----
  const lights: THREE.PointLight[] = [], halos: THREE.Sprite[] = [];
  const lantern = (lx: number, ly: number, lz: number, I: number, hang: boolean, shadow: boolean, glow = 1) => {
    const p = new THREE.PointLight("#ffb45a", I, 10, 1.6); p.position.set(X + lx, Y + ly, Z + lz); p.userData.I = I;
    if (shadow) { p.castShadow = true; p.shadow.mapSize.set(1024, 1024); p.shadow.bias = -0.004; p.shadow.radius = 4; p.shadow.camera.near = 0.15; p.shadow.camera.far = 14; }
    G.add(p); lights.push(p);
    cyl(lx, ly + 0.16, lz, 0.09, 0.11, 0.05, ironM, 12).castShadow = false; cyl(lx, ly - 0.17, lz, 0.11, 0.12, 0.06, std(null, "#8a2a22", 0.6), 12).castShadow = false;
    const glass = add(new THREE.CylinderGeometry(0.08, 0.09, 0.28, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 0.9), transparent: true, opacity: 0.85, fog: false }), false, false); glass.position.set(X + lx, Y + ly, Z + lz);
    if (hang) { const ch = cyl(lx, ly + 0.2 + (H - ly - 0.2) / 2, lz, 0.012, 0.012, H - ly - 0.2, ironM, 6); ch.castShadow = false; }
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(1.5, 0.95, 0.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); h.position.set(X + lx, Y + ly, Z + lz); h.userData.k = glow; h.scale.setScalar(1.5 * glow); h.layers.set(NOINK); G.add(h); halos.push(h);
  };
  lantern(-0.6, 2.6, -2.2, 10, true, true, 0.85);              // hanging lantern over the rug: the key light
  lantern(-0.25, 0.9, -3.0, 2.0, false, false, 0.7);      // lamp on the crate under the window
  barrel(0.46, 1.51, 0.98);                               // and a barrel close to the lens (foreground, bottom of frame)
  { cyl(0.36, 1.05, 1.45, 0.05, 0.045, 0.1, std(null, "#c9c4b8", 0.5), 12); const coil = add(new THREE.TorusGeometry(0.11, 0.03, 8, 18), std(null, "#c9a85a", 1)); coil.rotation.x = Math.PI / 2; coil.position.set(X + 0.56, Y + 1.01, Z + 1.56); }
  { const fill = new THREE.PointLight("#ffb45a", 0.7, 8, 2); fill.position.set(X + 1.0, Y + 2.0, Z + 0.9); fill.userData.I = 0.7; G.add(fill); lights.push(fill); }
  { const cold = new THREE.PointLight("#6f8fe0", 7, 7, 1.8); cold.position.set(X - 0.25, Y + 2.0, Z + Z0 + 1.0); cold.userData.I = 7; G.add(cold); lights.push(cold); }
  // a soft cone of light under the hanging lantern, and dust drifting through the room
  const cone = lightCone(1.25, 2.5, new THREE.Color(1.0, 0.7, 0.34), 0.5); cone.position.set(X - 0.6, Y + 2.48, Z - 2.2); cone.layers.set(NOINK); G.add(cone);
  const dust = dustMotes(new THREE.Vector3(X, Y + H / 2, Z), new THREE.Vector3(W - 1, H - 0.5, D - 0.6), 260, new THREE.Color(1.6, 1.2, 0.7));
  dust.points.layers.set(NOINK); G.add(dust.points);
  return { group: G, lights, halos, drift: dust.drift };
}

/** per frame: lamps on or off, a little flicker, dust drifting */
export function poseRoom(rm: Room, on: boolean, t: number) {
  rm.group.visible = on; if (!on) return;
  rm.lights.forEach((l, i) => { l.intensity = (l.userData.I as number) * (1 + 0.05 * Math.sin(t * 9 + i * 2.1) + 0.03 * Math.sin(t * 23 + i)); });
  rm.halos.forEach((h, i) => h.scale.setScalar(1.5 * (h.userData.k as number) * (1 + 0.05 * Math.sin(t * 9 + i * 2.1))));
  rm.drift(t);
}
