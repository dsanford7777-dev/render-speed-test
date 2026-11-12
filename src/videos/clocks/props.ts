// Props for the Los Angeles clocks short (Paradox Town #7), in the house look: flat two-tone lam() materials and painted
// canvas textures. New here: Hoover Dam, the big knife switch, a toaster, a refrigerator, a drum.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex } from "../bridge/paint";
import { INK, paintText } from "../dst/props";

const shadowAll = <T extends THREE.Object3D>(g: T): T => { g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return g; };
const box = (w: number, h: number, d: number, key: string, col: string) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(key, () => ({ color: col })));
const cyl = (r0: number, r1: number, h: number, key: string, col: string, seg = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), lam(key, () => ({ color: col })));
export const BLUE = "#2f5fb5", RED = "#c9373a", CREAM = "#f6efdc", GOLD = "#e8c45a";

const concreteTex = () => ctex("damConcrete", 512, 512, (g) => {
  g.fillStyle = "#d6cdb9"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#b3a993"; g.lineWidth = 6;
  for (let y = 0; y <= 512; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  for (let y = 0; y < 512; y += 64) for (let x = (y / 64) % 2 ? 128 : 0; x <= 512; x += 256) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); }
});
export const DAM_H = 46;
/** Hoover Dam: a curved concrete wall DAM_H tall between two canyon walls, four intake towers behind it, the powerhouse
 *  at its foot. The downstream face looks toward -z; the group's origin is on the ground at the middle of the wall. */
export const dam = () => {
  const G = new THREE.Group();
  const conc = lam("damConcrete", () => ({ map: concreteTex() }));
  for (let i = -4; i <= 4; i++) {
    const x = i * 7, z = 0.03 * x * x;
    const geo = new THREE.BoxGeometry(7.6, DAM_H, 6);
    const uv = geo.getAttribute("uv"); for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * 2, uv.getY(k) * 10);
    const seg = new THREE.Mesh(geo, conc);
    seg.position.set(x, DAM_H / 2, z); seg.rotation.y = -Math.atan(0.06 * x);
    G.add(seg);
  }
  const lip = box(66, 1.2, 8, "damLip", "#a89f8b"); lip.position.set(0, DAM_H + 0.6, 12); G.add(lip);
  for (const s of [-1, 1]) {
    const cliff = box(40, 66, 60, "damRock", "#a8704a"); cliff.position.set(s * 50, 33, 14); G.add(cliff);
    const ledge = box(44, 10, 64, "damRock2", "#8f5c3c"); ledge.position.set(s * 52, 5, 12); G.add(ledge);
    for (const k of [0, 1]) {
      const tw = cyl(2.2, 2.6, 16, "damTower", "#cfc6b4", 12); tw.position.set(s * (9 + k * 12), DAM_H + 4, 20 + k * 5); G.add(tw);
      const cap = cyl(2.9, 2.9, 1.2, "damLip", "#a89f8b", 12); cap.position.set(s * (9 + k * 12), DAM_H + 12.6, 20 + k * 5); G.add(cap);
    }
  }
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

/** a 1940s refrigerator, 1.7 m tall, door toward -z */
export const fridge = () => {
  const G = new THREE.Group();
  const body = box(0.8, 1.55, 0.7, "fridgeWhite", "#f1efe6"); body.position.y = 0.9;
  const top = cyl(0.4, 0.4, 0.7, "fridgeWhite", "#f1efe6", 20); top.rotation.x = Math.PI / 2; top.scale.set(1, 1, 0.35); top.position.y = 1.66;
  const seam = box(0.82, 0.02, 0.02, "fridgeSeam", "#8c8a84"); seam.position.set(0, 1.25, -0.36);
  const handle = box(0.05, 0.34, 0.05, "fridgeHandle", "#8c8a84"); handle.position.set(-0.3, 0.95, -0.39);
  const badge = box(0.16, 0.05, 0.02, "fridgeBadge", RED); badge.position.set(0, 1.45, -0.36);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const ft = box(0.07, 0.13, 0.07, "fridgeHandle", "#8c8a84"); ft.position.set(sx * 0.33, 0.065, sz * 0.28); G.add(ft); }
  G.add(body, top, seam, handle, badge);
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
