// Props and painted textures for the Lustig short (Paradox Town #6), in the house look: two-tone lam() materials,
// hand-painted canvas textures, ink outlines on the shapes, flat bold cartoon colours.
import * as THREE from "three";
import { lam, boxGeo, V, Batch } from "../bridge/build";
import { ctex, beam, stoneHD } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import { INK, paintText } from "../dst/props";

const shadowAll = <T extends THREE.Object3D>(g: T): T => { g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return g; };
const font = (px: number, w = 900) => `${w} ${px}px "DejaVu Sans", "Arial Black", Arial, sans-serif`;
export const RED = "#d8323a", GOLD = "#e8c45a", GREEN = "#3f9a5a", CREAM = "#f6efdc";

// ---------------- the tower ----------------
export const TOWER_H = 84;
/** distance of a leg's centre line from the axis, and the leg's thickness, at height y */
const sOf = (y: number) => 0.5 + 13.5 * Math.exp(-y / 20);
const wOf = (y: number) => 0.8 + 2.6 * Math.exp(-y / 25);
const ironTex = () => ctex("eiffelIron", 512, 512, (g) => {
  g.fillStyle = "#8d7059"; g.fillRect(0, 0, 512, 512);
  // cross bracing, two bays per tile
  for (const y0 of [0, 256]) {
    g.lineCap = "round";
    for (const [w, col] of [[40, "#5a4336"], [16, "#a98a6e"]] as [number, string][]) {
      g.lineWidth = w; g.strokeStyle = col;
      g.beginPath(); g.moveTo(30, y0 + 20); g.lineTo(482, y0 + 236); g.moveTo(482, y0 + 20); g.lineTo(30, y0 + 236); g.stroke();
    }
    g.fillStyle = "#4a372d"; g.fillRect(0, y0 - 14, 512, 28); g.fillRect(0, y0 + 242, 512, 28);
  }
  g.fillStyle = "#4a372d"; g.fillRect(0, 0, 34, 512); g.fillRect(478, 0, 34, 512);
  g.fillStyle = "#c9ab8c"; for (let y = 16; y < 512; y += 32) { g.beginPath(); g.arc(17, y, 5, 0, 7); g.arc(495, y, 5, 0, 7); g.fill(); }
});
let LEGS: THREE.BufferGeometry | null = null;
/** the four legs as square tubes swept along the tower's curve, up to the top platform */
const legsGeo = () => {
  if (LEGS) return LEGS;
  const pos: number[] = [], uv: number[] = [], N = 44, top = 71;
  const ring = (sx: number, sz: number, y: number): [number, number, number][] => {
    const s = sOf(y), w = wOf(y) / 2, cx = sx * s, cz = sz * s;
    return [[cx - w, y, cz - w], [cx + w, y, cz - w], [cx + w, y, cz + w], [cx - w, y, cz + w]];
  };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let i = 0; i < N; i++) {
    const y0 = (top * i) / N, y1 = (top * (i + 1)) / N, a = ring(sx, sz, y0), b = ring(sx, sz, y1);
    for (let k = 0; k < 4; k++) {
      const k2 = (k + 1) % 4, v0 = y0 / 4, v1 = y1 / 4;
      pos.push(...a[k], ...b[k], ...b[k2], ...a[k], ...b[k2], ...a[k2]);
      uv.push(0, v0, 0, v1, 1, v1, 0, v0, 1, v1, 1, v0);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  LEGS = g;
  return g;
};
/** the Eiffel Tower, base centre at the group's origin, TOWER_H tall. Scale the group for the table model. */
export const buildTower = () => {
  const G = new THREE.Group();
  const iron = lam("eiffelIron", () => ({ map: ironTex(), side: THREE.DoubleSide })), dark = lam("eiffelDeck", () => ({ color: "#6a5241" }));
  G.add(new THREE.Mesh(legsGeo(), iron));
  // platforms: four beams round a hole (so you can look up through them), then a solid top deck
  for (const [y, t] of [[14.5, 1.4], [29.5, 1.2]] as [number, number][]) {
    const h = sOf(y) + wOf(y) / 2 + 1.4, b = Math.min(3.4, h * 0.4);
    for (const s of [-1, 1]) {
      const bx = new THREE.Mesh(new THREE.BoxGeometry(2 * h, t, b), dark); bx.position.set(0, y, s * (h - b / 2));
      const bz = new THREE.Mesh(new THREE.BoxGeometry(b, t, 2 * h), dark); bz.position.set(s * (h - b / 2), y, 0);
      G.add(bx, bz);
    }
  }
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1, 4.8), dark); deck.position.y = 70.5;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 2.6), iron); cabin.position.y = 72.6;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.9, 5.2, 4), dark); cap.rotation.y = Math.PI / 4; cap.position.y = 76.8;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 5, 8), dark); mast.position.y = 81.5;
  G.add(deck, cabin, cap, mast);
  // the arches between the legs
  for (let k = 0; k < 4; k++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(9.4, 0.55, 8, 28, Math.PI), dark);
    const a = (k * Math.PI) / 2; arch.rotation.y = a; arch.position.set(Math.sin(a) * 10.6, 1.4, Math.cos(a) * 10.6);
    G.add(arch);
  }
  return shadowAll(G);
};

// ---------------- the salon ----------------
const carpetTex = () => ctex("salonCarpet", 256, 256, (g) => {
  g.fillStyle = "#8c2f3c"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#c9a14a"; g.lineWidth = 10; g.strokeRect(20, 20, 216, 216);
  g.fillStyle = "#a63d4c"; g.beginPath(); g.moveTo(128, 60); g.lineTo(196, 128); g.lineTo(128, 196); g.lineTo(60, 128); g.closePath(); g.fill();
});
const clothTex = () => ctex("salonCloth", 256, 256, (g) => { g.fillStyle = "#2f6b55"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#e8c45a"; g.lineWidth = 12; g.strokeRect(6, 6, 244, 244); });
export type Salon = { sign: THREE.Mesh; archSign: THREE.Mesh };
/** open-roofed hotel salon centred on (cx, y0, cz): walls on -x, +x and +z, open toward -z, an entrance arch at z = -7.5.
 *  A long table (x -2..3, z 0.1..1.1, top at 0.8). The wall sign's face is swapped between the hotel and Chicago. */
export const buildSalon = (root: THREE.Object3D, cx: number, y0: number, cz: number): Salon => {
  const b = new Batch();
  const floor = lam("salonFloor", () => ({ map: carpetTex() }));
  const wall = lam("salonWall", () => ({ map: stoneHD("salonWallHD", ["#efe2c6", "#e8d9ba", "#f4ead2", "#e2d2b0"], "#b8a684") }));
  const wood = lam("shopBeam", () => ({ map: beam() })), gold = lam("salonGold", () => ({ color: GOLD }));
  const X0 = cx - 5.5, X1 = cx + 5.5, Z0 = cz - 3.5, Z1 = cz + 3.5, H = 4.4;
  b.add(boxGeo(V(X0 - 3, y0 - 0.2, cz - 13), V(X1 + 3, y0 + 0.03, Z1 + 1), 3), floor);
  b.add(boxGeo(V(X0 - 0.3, y0, Z0), V(X0, y0 + H, Z1 + 0.3), 2), wall);
  b.add(boxGeo(V(X1, y0, Z0), V(X1 + 0.3, y0 + H, Z1 + 0.3), 2), wall);
  b.add(boxGeo(V(X0 - 0.3, y0, Z1), V(X1 + 0.3, y0 + H, Z1 + 0.3), 2), wall);
  b.add(boxGeo(V(X0, y0, Z1 - 0.06), V(X1, y0 + 1.1, Z1)), lam("wainscot", () => ({ color: "#7a5236" })));
  b.add(boxGeo(V(X0, y0 + 1.1, Z1 - 0.08), V(X1, y0 + 1.2, Z1)), gold);
  // the table: cloth top, four legs
  b.add(boxGeo(V(cx - 2.0, y0 + 0.72, cz + 0.1), V(cx + 3.0, y0 + 0.8, cz + 1.1), 1), lam("salonCloth", () => ({ map: clothTex() })));
  for (const [x, z] of [[-1.9, 0.2], [2.9, 0.2], [-1.9, 1.0], [2.9, 1.0]]) b.add(boxGeo(V(cx + x - 0.05, y0, cz + z - 0.05), V(cx + x + 0.05, y0 + 0.72, cz + z + 0.05)), wood);
  // the entrance arch: two pillars and a lintel
  for (const s of [-1, 1]) b.add(boxGeo(V(cx + s * 2.6 - 0.3, y0, cz - 7.8), V(cx + s * 2.6 + 0.3, y0 + 3.4, cz - 7.2), 2), wall);
  b.add(boxGeo(V(cx - 3.1, y0 + 3.4, cz - 7.9), V(cx + 3.1, y0 + 4.1, cz - 7.1), 2), wall);
  b.add(boxGeo(V(cx - 3.2, y0 + 4.1, cz - 8.0), V(cx + 3.2, y0 + 4.25, cz - 7.0)), gold);
  b.build(root);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.95), lam("sign_hotel", () => ({ map: signTex("hotel", "HÔTEL DE CRILLON", "#2f2a3a", GOLD) })));
  sign.rotation.y = Math.PI; sign.position.set(cx - 0.3, y0 + 3.2, Z1 - 0.02); root.add(sign);
  // the arch sign faces into the room (the camera backs away from the door)
  const archSign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.72), lam("sign_hotel", () => ({ map: signTex("hotel", "HÔTEL DE CRILLON", "#2f2a3a", GOLD) })));
  archSign.position.set(cx, y0 + 3.0, cz - 7.08); root.add(archSign);
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && !m.receiveShadow) m.receiveShadow = true; });
  return { sign, archSign };
};
/** a painted name board: one line, ink border */
export const signTex = (key: string, s: string, bg: string, fg: string) => ctex(`sign_${key}`, 1024, 232, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 232); g.lineWidth = 16; g.strokeStyle = fg; g.strokeRect(14, 14, 996, 204);
  let px = 110; g.font = font(px); while (g.measureText(s).width > 900 && px > 40) { px -= 4; g.font = font(px); }
  paintText(g, s, 512, 120, px, fg, "center", 0.1);
});
/** FOR SALE board (and the same with AGAIN slapped across it) */
export const saleTex = (again: boolean) => ctex(`towerSale_${again}`, 1024, 560, (g) => {
  g.fillStyle = CREAM; g.fillRect(0, 0, 1024, 560); g.lineWidth = 22; g.strokeStyle = INK; g.strokeRect(11, 11, 1002, 538);
  paintText(g, "FOR SALE", 512, 190, 170, RED, "center", 0.1);
  paintText(g, "1 TOWER · USED", 512, 400, 92, "#2f2a3a", "center", 0.06);
  if (again) {
    g.save(); g.translate(512, 290); g.rotate(-0.2);
    g.fillStyle = "#ffd84d"; g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.roundRect(-330, -95, 660, 190, 20); g.fill(); g.stroke();
    paintText(g, "AGAIN!", 0, 8, 150, INK, "center", 0);
    g.restore();
  }
});

// ---------------- paper ----------------
/** a newspaper front page: masthead, one big headline (two lines), grey columns */
export const newsTex = (key: string, mast: string, l1: string, l2: string) => ctex(`news_${key}`, 1024, 760, (g) => {
  g.fillStyle = "#efe6d0"; g.fillRect(0, 0, 1024, 760); g.lineWidth = 14; g.strokeStyle = INK; g.strokeRect(7, 7, 1010, 746);
  g.fillStyle = INK; g.font = `900 92px Georgia, "DejaVu Serif", serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(mast, 512, 82);
  g.fillRect(40, 140, 944, 10); g.fillRect(40, 160, 944, 4);
  const fit = (s: string, y: number) => { let px = 150; g.font = font(px); while (g.measureText(s).width > 930 && px > 50) { px -= 4; g.font = font(px); } g.fillStyle = INK; g.fillText(s, 512, y); };
  fit(l1, 262); fit(l2, 420);
  g.fillStyle = "#8f8778"; for (let c = 0; c < 3; c++) for (let r = 0; r < 9; r++) g.fillRect(48 + c * 318, 520 + r * 24, 280 - (r === 8 ? 120 : 0), 10);
});
/** the forged letter: tricolour bar, letterhead, typed lines, a signature */
export const letterTex = () => ctex("forgedLetter", 1024, 740, (g) => {
  g.fillStyle = "#fbf6ea"; g.fillRect(0, 0, 1024, 740); g.lineWidth = 12; g.strokeStyle = INK; g.strokeRect(6, 6, 1012, 728);
  ["#2f4f9f", "#ffffff", RED].forEach((c, i) => { g.fillStyle = c; g.fillRect(60 + i * 60, 44, 60, 40); }); g.lineWidth = 6; g.strokeRect(60, 44, 180, 40);
  g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle";
  g.font = font(54); g.fillText("RÉPUBLIQUE FRANÇAISE", 270, 66);
  g.font = font(40, 700); g.fillText("Ministry of Posts & Telegraphs", 60, 150);
  g.font = font(64); g.fillText("SECRET: TOWER FOR SALE", 60, 250);
  g.fillStyle = "#7d7568"; for (let r = 0; r < 6; r++) g.fillRect(60, 330 + r * 44, r === 5 ? 520 : 900, 14);
  g.strokeStyle = "#2f4f9f"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(600, 660);
  for (let i = 0; i < 9; i++) g.quadraticCurveTo(630 + i * 38, 600 + (i % 2) * 90, 660 + i * 38, 650); g.stroke();
});
export const fakeTex = () => ctex("fakeStamp", 1024, 420, (g) => {
  g.strokeStyle = RED; g.lineWidth = 30; g.beginPath(); g.roundRect(30, 30, 964, 360, 40); g.stroke();
  g.fillStyle = RED; g.font = font(280); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("FAKE", 512, 220);
});
const envTex = () => ctex("envelope", 512, 340, (g) => {
  g.fillStyle = "#fbf6ea"; g.fillRect(0, 0, 512, 340); g.lineWidth = 16; g.strokeStyle = INK; g.strokeRect(8, 8, 496, 324);
  g.lineWidth = 10; g.beginPath(); g.moveTo(8, 8); g.lineTo(256, 190); g.lineTo(504, 8); g.stroke();
  g.fillStyle = RED; g.beginPath(); g.arc(256, 196, 44, 0, 7); g.fill(); g.lineWidth = 8; g.stroke();
});
const billTex = () => ctex("bankNote", 512, 256, (g) => {
  g.fillStyle = "#7fc48a"; g.fillRect(0, 0, 512, 256); g.lineWidth = 18; g.strokeStyle = INK; g.strokeRect(9, 9, 494, 238);
  g.strokeStyle = "#2f7a4a"; g.lineWidth = 10; g.strokeRect(34, 34, 444, 188);
  g.fillStyle = "#e9f6e4"; g.beginPath(); g.ellipse(256, 128, 70, 82, 0, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  paintText(g, "$", 256, 134, 120, "#2f7a4a", "center", 0.08);
});

// ---------------- flat things that fly at the lens ----------------
/** a handful of unlit cut-out cards (envelopes or bank notes) the world throws around; they always face the camera */
export class Flyers {
  list: THREE.Mesh[] = [];
  constructor(root: THREE.Object3D, kind: "envelope" | "bill", n: number, w: number) {
    const map = kind === "envelope" ? envTex() : billTex(), h = kind === "envelope" ? w * 0.66 : w * 0.5;
    const mat = new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide });
    for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.visible = false; m.layers.set(NOINK); m.renderOrder = 3; root.add(m); this.list.push(m); }
  }
  hide() { for (const m of this.list) m.visible = false; }
  /** put card k at p, facing the camera, turned by `spin` about the view axis */
  put(k: number, p: THREE.Vector3, cam: THREE.Camera, spin: number, scale = 1) {
    const m = this.list[k]; m.visible = true; m.position.copy(p); m.quaternion.copy(cam.quaternion); m.rotateZ(spin); m.scale.setScalar(scale);
  }
}

// ---------------- money, luggage, hat ----------------
const noteStack = (n: number) => {
  const G = new THREE.Group(), paper = lam("noteGreen", () => ({ color: "#7fc48a" })), band = lam("noteBand", () => ({ color: "#f6efdc" }));
  for (let i = 0; i < n; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 0.13), paper); s.position.set((i % 2) * 0.02, 0.035 + i * 0.07, 0); s.rotation.y = (i % 3 - 1) * 0.12;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.074, 0.134), band); b.position.copy(s.position); b.rotation.copy(s.rotation);
    G.add(s, b);
  }
  return shadowAll(G);
};
/** three stacks of bank notes side by side; origin on the table under the middle stack */
export const cashPile = () => { const G = new THREE.Group(); [[-0.3, 3], [0, 4], [0.3, 3]].forEach(([x, n]) => { const s = noteStack(n); s.position.x = x; G.add(s); }); return G; };
export const suitcase = () => {
  const G = new THREE.Group(), hide = lam("caseLeather", () => ({ color: "#9a5a2e" })), trim = lam("caseTrim", () => ({ color: "#5a3420" }));
  G.add(new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.38, 0.16), hide));
  for (const x of [-0.2, 0.2]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.39, 0.17), trim); s.position.x = x; G.add(s); }
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 6, 14, Math.PI), trim); h.position.y = 0.19; G.add(h);
  // a few notes sticking out of the lid
  const note = lam("noteGreen", () => ({ color: "#7fc48a" }));
  for (const [x, r] of [[-0.12, 0.3], [0.05, -0.2], [0.17, 0.15]]) { const n = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.012), note); n.position.set(x, 0.21, 0); n.rotation.z = r; G.add(n); }
  return shadowAll(G);
};
/** a top hat, crown along +y, open at the bottom (y = 0 is the brim). Turn it over to hold it out for a bribe. */
export const topHat = () => {
  const G = new THREE.Group(), felt = lam("hatFelt", () => ({ color: "#2e2a36", side: THREE.DoubleSide })), band = lam("hatBand", () => ({ color: "#5b3fa8" }));
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.105, 0.2, 24, 1, true), felt); crown.position.y = 0.1;
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.115, 24), felt); top.rotation.x = -Math.PI / 2; top.position.y = 0.2;
  const brim = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.19, 28), felt); brim.rotation.x = -Math.PI / 2;
  const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.109, 0.108, 0.045, 24, 1, true), band); bd.position.y = 0.035;
  G.add(crown, top, brim, bd);
  return shadowAll(G);
};
