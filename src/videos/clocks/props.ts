// Props for the Los Angeles clocks short (Paradox Town #7), in the house look: flat two-tone lam() materials and painted
// canvas textures. New here: Hoover Dam, the big knife switch, a toaster, a refrigerator, a drum.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex } from "../bridge/paint";
import { INK, paintText } from "../dst/props";

const shadowAll = <T extends THREE.Object3D>(g: T): T => { g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return g; };
const box = (w: number, h: number, d: number, key: string, col: string) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(key, () => ({ color: col, ...(key === "fridgeWhite" || key === "fridgeDoor" ? { emissive: "#4a4840" } : {}) })));
const cyl = (r0: number, r1: number, h: number, key: string, col: string, seg = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), lam(key, () => ({ color: col })));
export const BLUE = "#2f5fb5", RED = "#c9373a", CREAM = "#f6efdc", GOLD = "#e8c45a";

const concreteTex = () => ctex("damConcrete2", 512, 1024, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "#e2d8c2"); gr.addColorStop(1, "#c4b89e"); g.fillStyle = gr; g.fillRect(0, 0, 512, 1024);
  // water stains running down the face
  for (let i = 0; i < 46; i++) { const x = r() * 512, w = 6 + r() * 26, h = 200 + r() * 700; const s = g.createLinearGradient(0, 0, 0, h); s.addColorStop(0, "rgba(120,104,84,0.34)"); s.addColorStop(1, "rgba(120,104,84,0)"); g.fillStyle = s; g.fillRect(x, 0, w, h); }
  // the pour lines of the concrete blocks
  g.strokeStyle = "#8f846e"; g.lineWidth = 7;
  for (let y = 0; y <= 1024; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  for (let y = 0; y < 1024; y += 64) for (let x = (y / 64) % 2 ? 128 : 0; x <= 512; x += 256) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); }
});
const rockTex = () => ctex("damRockTex", 512, 512, (g, r) => {
  g.fillStyle = "#a8704a"; g.fillRect(0, 0, 512, 512);
  // strata: bands of red and tan rock, broken by cracks
  let y = 0; while (y < 512) { const h = 14 + r() * 46; g.fillStyle = ["#b57a50", "#9a6240", "#c08a5c", "#8f5a3a", "#a86e48", "#c79a6c"][Math.floor(r() * 6)]; g.fillRect(0, y, 512, h); y += h; }
  g.strokeStyle = "rgba(70,40,26,0.7)"; g.lineWidth = 5; g.lineCap = "round";
  for (let i = 0; i < 26; i++) { let x = r() * 512, yy = r() * 512; g.beginPath(); g.moveTo(x, yy); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 40; yy += 20 + r() * 40; g.lineTo(x, yy); } g.stroke(); }
});
const riverTex = () => ctex("damRiver", 256, 512, (g, r) => {
  g.fillStyle = "#3f86c9"; g.fillRect(0, 0, 256, 512);
  g.strokeStyle = "rgba(210,236,255,0.75)"; g.lineWidth = 5; g.lineCap = "round";
  for (let i = 0; i < 70; i++) { const x = r() * 256, y = r() * 512, l = 20 + r() * 50; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y + l / 2, x, y + l); g.stroke(); }
});
export const DAM_H = 46;
/** Hoover Dam: a curved concrete wall DAM_H tall wedged in a red-rock canyon, four intake towers and the lake behind
 *  it, the powerhouse and the river at its foot. The downstream face looks toward -z; the group's origin is on the
 *  ground at the middle of the wall. No grass here: bare rock and desert. */
export const dam = () => {
  const G = new THREE.Group();
  const conc = lam("damConcrete2", () => ({ map: concreteTex() })), rock = lam("damRockT", () => ({ map: rockTex() })), rock2 = lam("damRockT2", () => ({ map: rockTex(), color: "#d8c8b8" }));
  const scaleUV = (geo: THREE.BufferGeometry, su: number, sv: number) => { const uv = geo.getAttribute("uv"); for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * su, uv.getY(k) * sv); return geo; };
  for (const tx of [rockTex(), concreteTex(), riverTex()]) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.needsUpdate = true; }
  for (let i = -4; i <= 4; i++) {
    const x = i * 7, z = 0.03 * x * x;
    const seg = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(7.6, DAM_H, 6), 1.5, 4), conc);
    seg.position.set(x, DAM_H / 2, z); seg.rotation.y = -Math.atan(0.06 * x);
    G.add(seg);
  }
  const lip = box(66, 1.2, 8, "damLip", "#a89f8b"); lip.position.set(0, DAM_H + 0.6, 12); G.add(lip);
  // the canyon: stepped cliffs on both sides, running out downstream; desert floor; the river
  const floor = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(300, 0.1, 280), 6, 6), lam("damDesert", () => ({ color: "#c79a6c" }))); floor.position.set(0, 0.03, -60); G.add(floor);
  for (const s of [-1, 1]) {
    const mk = (w: number, h: number, d: number, x: number, z: number, m: THREE.Material) => { const c = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(w, h, d), w / 30, h / 30), m); c.position.set(s * x, h / 2, z); G.add(c); };
    mk(40, 66, 60, 50, 14, rock); mk(44, 12, 64, 52, 12, rock2);
    mk(46, 54, 50, 55, -40, rock2); mk(52, 40, 54, 62, -92, rock); mk(60, 26, 60, 72, -150, rock2); mk(30, 18, 40, 44, -58, rock);
    for (const k of [0, 1]) {
      const tw = cyl(2.2, 2.6, 16, "damTower", "#cfc6b4", 12); tw.position.set(s * (9 + k * 12), DAM_H + 4, 20 + k * 5); G.add(tw);
      const cap = cyl(2.9, 2.9, 1.2, "damLip", "#a89f8b", 12); cap.position.set(s * (9 + k * 12), DAM_H + 12.6, 20 + k * 5); G.add(cap);
    }
  }
  const lake = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(62, 0.2, 110), 4, 4), lam("damLake", () => ({ map: riverTex(), color: "#bcd2ea" }))); lake.position.set(0, DAM_H - 4, 68); G.add(lake);
  const river = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(16, 0.12, 170), 1, 8), lam("damRiver", () => ({ map: riverTex() }))); river.position.set(0, 0.09, -100); G.add(river);
  const house = box(34, 7, 7, "damHouse", "#e4dbc8"); house.position.set(0, 3.5, -6.5); G.add(house);
  const roof = box(35, 0.8, 8, "damLip", "#a89f8b"); roof.position.set(0, 7.4, -6.5); G.add(roof);
  for (let k = -5; k <= 5; k++) { if (Math.abs(k) < 2) continue; const w = box(1.4, 3.2, 0.2, "damWindow", "#3a4660"); w.position.set(k * 2.9, 3.6, -10.05); G.add(w); }
  return shadowAll(G);
};

/** a big knife switch on a slate panel: arm.rotation.z swings it from open (+0.7) to closed (-0.7) */
export const lever = () => {
  const G = new THREE.Group();
  const post = box(0.16, 1.1, 0.16, "leverPost", "#5a3b2a"); post.position.y = 0.55;
  const panel = box(0.9, 0.9, 0.1, "leverSlate", "#3a3a48"); panel.position.y = 1.45;
  const arm = new THREE.Group(); arm.position.set(0, 1.2, -0.09);
  const blade = box(0.07, 0.75, 0.05, "leverCopper", "#d98a3a"); blade.position.y = 0.37;
  const grip = cyl(0.07, 0.07, 0.3, "leverGrip", RED, 14); grip.rotation.x = Math.PI / 2; grip.position.set(0, 0.78, -0.1);
  arm.add(blade, grip);
  for (const sx of [-1, 1]) { const jaw = box(0.12, 0.14, 0.08, "leverCopper", "#d98a3a"); jaw.position.set(sx * 0.3, 1.72, -0.08); G.add(jaw); }
  G.add(post, panel, arm);
  return { g: shadowAll(G), arm };
};

/** a chrome pop-up toaster (origin on the table under it); toast: two slices whose y the world animates */
export const toaster = () => {
  const G = new THREE.Group();
  const body = box(0.36, 0.22, 0.19, "toasterChrome", "#c9ced6"); body.position.y = 0.13;
  const base = box(0.38, 0.03, 0.21, "toasterBase", "#2f2a3a"); base.position.y = 0.015;
  const knob = cyl(0.025, 0.025, 0.03, "toasterBase", "#2f2a3a", 12); knob.rotation.x = Math.PI / 2; knob.position.set(0.12, 0.09, -0.105);
  G.add(body, base, knob);
  const toast: THREE.Mesh[] = [];
  for (const z of [-0.045, 0.045]) {
    const slot = box(0.26, 0.01, 0.035, "toasterBase", "#2f2a3a"); slot.position.set(0, 0.242, z); G.add(slot);
    const t = box(0.2, 0.2, 0.024, "toastBread", "#d9a05a"); t.position.set(0, 0.2, z); G.add(t); toast.push(t);
  }
  return { g: shadowAll(G), toast };
};
/** a slice of toast as a flat card (for the one that flies at the lens) */
export const toastTex = () => ctex("toastCard", 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256);
  g.fillStyle = "#b9762f"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(28, 40, 200, 190, 30); g.fill(); g.stroke();
  g.beginPath(); g.arc(88, 62, 46, Math.PI, 0); g.arc(168, 62, 46, Math.PI, 0); g.fill(); g.stroke();
  g.fillStyle = "#e9b56a"; g.beginPath(); g.roundRect(50, 62, 156, 150, 22); g.fill();
});

/** a 1930s refrigerator, 1.75 m tall, door toward -z: enamel cabinet on legs, a door with a raised panel, chrome
 *  latch handle and hinges, a maker's badge, and the round cooling unit on top */
export const fridge = () => {
  const G = new THREE.Group(), W = "#f4f1e6", CH = "#9aa0aa";
  const body = box(0.84, 1.3, 0.66, "fridgeWhite", W); body.position.y = 0.95;
  const plinth = box(0.88, 0.08, 0.7, "fridgeTrim", "#d9d4c4"); plinth.position.y = 0.28;
  const crown = box(0.9, 0.07, 0.72, "fridgeTrim", "#d9d4c4"); crown.position.y = 1.63;
  const door = box(0.74, 1.16, 0.05, "fridgeDoor", "#fbf9f0"); door.position.set(0, 0.95, -0.35);
  const panel = box(0.56, 0.9, 0.03, "fridgeWhite", W); panel.position.set(0, 0.95, -0.385);
  const handle = box(0.05, 0.26, 0.06, "fridgeChrome", CH); handle.position.set(-0.29, 1.0, -0.4);
  const latch = box(0.12, 0.05, 0.05, "fridgeChrome", CH); latch.position.set(-0.33, 1.0, -0.39);
  const badge = box(0.2, 0.06, 0.02, "fridgeBadge", RED); badge.position.set(0, 1.42, -0.405);
  for (const y of [0.55, 1.35]) { const h = box(0.05, 0.12, 0.05, "fridgeChrome", CH); h.position.set(0.39, y, -0.37); G.add(h); }
  // the cooling unit on top: a drum of fins with a cap
  const unit = cyl(0.27, 0.27, 0.3, "fridgeUnit", "#e6e2d4", 22); unit.position.y = 1.82;
  for (let k = 0; k < 4; k++) { const fin = cyl(0.29, 0.29, 0.025, "fridgeTrim", "#c9c4b4", 22); fin.position.y = 1.71 + k * 0.07; G.add(fin); }
  const cap = cyl(0.2, 0.25, 0.06, "fridgeTrim", "#d9d4c4", 22); cap.position.y = 2.0;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const ft = box(0.06, 0.26, 0.06, "fridgeTrim", "#d9d4c4"); ft.position.set(sx * 0.36, 0.13, sz * 0.27); ft.rotation.z = -sx * 0.08; G.add(ft); }
  G.add(body, plinth, crown, door, panel, handle, latch, badge, unit, cap);
  return shadowAll(G);
};

/** a marching drum on a stand, skin on top at y = 0.95 */
export const drum = () => {
  const G = new THREE.Group();
  const shell = cyl(0.34, 0.34, 0.4, "drumShell", RED, 28); shell.position.y = 0.75;
  const skin = cyl(0.33, 0.33, 0.02, "drumSkin", CREAM, 28); skin.position.y = 0.96;
  for (const y of [0.56, 0.94]) { const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.025, 8, 32), lam("drumHoop", () => ({ color: GOLD }))); hoop.rotation.x = Math.PI / 2; hoop.position.y = y; G.add(hoop); }
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2, leg = box(0.04, 0.6, 0.04, "leverPost", "#5a3b2a"); leg.position.set(Math.cos(a) * 0.22, 0.29, Math.sin(a) * 0.22); leg.rotation.z = Math.cos(a) * 0.2; leg.rotation.x = -Math.sin(a) * 0.2; G.add(leg); }
  const sticks: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const st = new THREE.Group(); st.position.set(sx * 0.3, 1.25, -0.25);
    const rod = cyl(0.014, 0.018, 0.5, "drumStick", "#e9d3a2", 8); rod.position.y = -0.22; st.add(rod);
    G.add(st); sticks.push(st);
  }
  G.add(shell, skin);
  return { g: shadowAll(G), sticks };
};

/** a pulse: bright yellow dot with an ink ring (runs along the wire) */
export const pulseTex = () => ctex("pulseDot", 128, 128, (g) => {
  g.clearRect(0, 0, 128, 128);
  g.fillStyle = "#ffe14d"; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.arc(64, 64, 46, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = "#ffffff"; g.beginPath(); g.arc(50, 50, 14, 0, Math.PI * 2); g.fill();
});
/** a street or shop name board: one line on a flat colour with an ink border */
export const nameTex = (key: string, s: string, bg: string, fg: string, w = 1024, h = 300) => ctex(`cname_${key}`, w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.lineWidth = 20; g.strokeStyle = INK; g.strokeRect(10, 10, w - 20, h - 20);
  let px = h * 0.56; g.font = `900 ${px}px Montserrat, "DejaVu Sans", Arial, sans-serif`;
  while (g.measureText(s).width > w * 0.84 && px > 30) { px -= 4; g.font = `900 ${px}px Montserrat, "DejaVu Sans", Arial, sans-serif`; }
  paintText(g, s, w / 2, h / 2 + px * 0.04, px, fg, "center", 0.1);
});
