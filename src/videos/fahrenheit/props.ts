// Props and painted textures for the Fahrenheit short, in the bridge short's look: two-tone lam() materials with
// hand-painted canvas textures, ink outlines on the shapes (the InkPass draws them), flat bold cartoon colours.
import * as THREE from "three";
import { lam, V, boxGeo, Batch } from "../bridge/build";
import { ctex, rep, beam, brick, stoneHD } from "../bridge/paint";
import { twoTone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";

const INK = "#241726";
const font = (px: number, w = 900) => `${w} ${px}px "DejaVu Sans", "Arial Black", Arial, sans-serif`;
/** big hand-painted number / word: fill + thick ink outline */
const paintText = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, fill: string, align: CanvasTextAlign = "center", ol = 0.16) => {
  g.font = font(px); g.textAlign = align; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = px * ol; g.strokeStyle = INK; g.strokeText(s, x, y);
  g.fillStyle = fill; g.fillText(s, x, y);
};

// ---------------- thermometer scale boards ----------------
/** value -> height fraction on a board: early board 0..~100 (Fahrenheit's 1724 scale), late board up to 212 */
export const BOARD = { early: { lo: -8, hi: 104 }, late: { lo: -8, hi: 222 } };
export const fracOf = (kind: "early" | "late", v: number) => (v - BOARD[kind].lo) / (BOARD[kind].hi - BOARD[kind].lo);
/** labels shown on the board, e.g. ["0", "32", "96"]; `glow` = the label that was just added (yellow) */
export const boardTex = (kind: "early" | "late", labels: string[], glow = "") => ctex(`board_${kind}_${labels.join("_")}_${glow}`, 256, 1024, (g) => {
  g.fillStyle = "#f1e3c2"; g.fillRect(0, 0, 256, 1024);
  // wood grain edges + ink frame
  g.fillStyle = "#c99a62"; g.fillRect(0, 0, 22, 1024); g.fillRect(234, 0, 22, 1024);
  g.lineWidth = 10; g.strokeStyle = INK; g.strokeRect(5, 5, 246, 1014);
  const yOf = (v: number) => 1024 - 40 - fracOf(kind, v) * (1024 - 80);
  // ticks: Fahrenheit's 64 divisions between 32 and 96 on the early board; every 4 degrees on the late one
  g.strokeStyle = INK;
  if (kind === "early") for (let k = 0; k <= 64; k++) { const v = 32 + k; const big = k % 16 === 0, mid = k % 8 === 0; g.lineWidth = big ? 6 : mid ? 4 : 2.5; g.beginPath(); g.moveTo(150, yOf(v)); g.lineTo(150 + (big ? 70 : mid ? 52 : 34), yOf(v)); g.stroke(); }
  else for (let v = 0; v <= 216; v += 4) { const big = v % 20 === 0; g.lineWidth = big ? 6 : 3; g.beginPath(); g.moveTo(150, yOf(v)); g.lineTo(150 + (big ? 66 : 36), yOf(v)); g.stroke(); }
  for (const s of labels) {
    const v = parseFloat(s);
    g.lineWidth = 7; g.beginPath(); g.moveTo(120, yOf(v)); g.lineTo(236, yOf(v)); g.stroke();
    paintText(g, s, 70, yOf(v), s.length > 3 ? 46 : 62, s === glow ? "#ffd84d" : "#ffffff");
  }
});

/** glass thermometer on a wooden scale board. Height h, liquid level set per frame with setLevel(fraction 0..1) */
export class Thermo {
  group = new THREE.Group();
  private board: THREE.Mesh; private col: THREE.Mesh; private colH: number;
  constructor(public kind: "early" | "late", h: number, labels: string[] = []) {
    const w = h * 0.25, R = this.group;
    this.board = new THREE.Mesh(new THREE.BoxGeometry(w, h, h * 0.04), [
      lam("thermoWood", () => ({ map: beam() })), lam("thermoWood", () => ({ map: beam() })), lam("thermoWood", () => ({ map: beam() })),
      lam("thermoWood", () => ({ map: beam() })), lam("thermoWood", () => ({ map: beam() })), this.faceMat(labels),
    ]);
    this.board.position.set(0, h / 2, 0);
    // the painted face is the -z side (the shop cameras look along +z). Seen from -z, texture-left is world +x, so the
    // tube (at 0.53 of the texture width, between the labels and the ticks) sits at x = +w/2 - 0.53 w
    const tx = w * (0.5 - 0.53), r = h * 0.018, fz = -h * 0.03;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h * 0.9, 12), new THREE.MeshBasicMaterial({ color: "#d8f1ff", transparent: true, opacity: 0.55 }));
    glass.position.set(tx, h * 0.5, fz); glass.layers.set(NOINK);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(r * 2.2, 16, 12), redMat());
    bulb.position.set(tx, h * 0.05, fz);
    this.colH = h * 0.86;
    this.col = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, 1, 8).translate(0, 0.5, 0), redMat());
    this.col.position.set(tx, h * 0.05, fz);
    R.add(this.board, glass, bulb, this.col);
    R.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  }
  private faceMat(labels: string[], glow = "") { return lam(`boardFace_${this.kind}_${labels.join("_")}_${glow}`, () => ({ map: boardTex(this.kind, labels, glow) })); }
  setLabels(labels: string[], glow = "") { (this.board.material as THREE.Material[])[5] = this.faceMat(labels, glow); }
  /** liquid top at value v on this board's scale */
  setValue(v: number) {
    const h = this.colH / 0.86, top = (40 + fracOf(this.kind, v) * 944) / 1024; // board-height fraction of that label line
    this.col.scale.y = Math.max(0.001, top * h - 0.05 * h);
  }
}
const redMat = () => twoTone(new THREE.MeshPhongMaterial({ color: "#e0332e", emissive: "#5a0c0a", specular: "#ffffff", shininess: 80 }), 0.4);

/** a small thermometer: just a glass rod with a red column (in buckets, under arms, on the shelf) */
export const rod = (len: number, level: number) => {
  const g = new THREE.Group(), r = len * 0.035;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), new THREE.MeshBasicMaterial({ color: "#e4f6ff", transparent: true, opacity: 0.6 }));
  glass.position.y = len / 2; glass.layers.set(NOINK);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(r * 1.8, 12, 10), redMat()); bulb.position.y = r;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, len * level, 8), redMat()); col.position.y = (len * level) / 2;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.2, r * 1.2, len * 0.06, 10), lam("brass", () => ({ color: "#d9a83a" }))); cap.position.y = len;
  g.add(glass, bulb, col, cap);
  return g;
};

// ---------------- simple turned props ----------------
const lathe = (pts: [number, number][], seg = 28) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
export const staveTex = (key: string, col: string, band: string) => ctex(key, 512, 256, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 16; i++) { g.fillStyle = r() > 0.5 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"; g.fillRect(i * 32, 0, 32, 256); g.fillStyle = "rgba(36,23,38,0.55)"; g.fillRect(i * 32, 0, 3, 256); }
  g.fillStyle = band; for (const y of [26, 216]) g.fillRect(0, y, 512, 22);
  g.fillStyle = INK; for (const y of [26, 216]) { g.fillRect(0, y, 512, 3); g.fillRect(0, y + 19, 512, 3); }
});
/** wooden bucket of salty ice (radius r) */
export const bucket = (r: number) => {
  const g = new THREE.Group(), h = r * 1.5;
  const body = new THREE.Mesh(lathe([[r * 0.82, 0], [r, h]]).toNonIndexed(), lam("bucketWood", () => ({ map: staveTex("bucketStave", "#b37a45", "#6d6f78"), side: THREE.DoubleSide })));
  const floor = new THREE.Mesh(new THREE.CircleGeometry(r * 0.82, 24).rotateX(-Math.PI / 2), lam("bucketWood", () => ({})));
  g.add(body, floor);
  // ice chunks + salt crust, heaped a little over the rim
  const ice = lam("ice", () => ({ color: "#e9f8ff" }));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, d = (i % 3) * r * 0.25, s = r * (0.26 + 0.05 * (i % 2));
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.8, s), ice);
    m.position.set(Math.cos(a) * d, h * 0.86 + (i % 3) * 0.02, Math.sin(a) * d); m.rotation.set(i, i * 2, 0);
    g.add(m);
  }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(r * 0.98, 0.012, 6, 24, Math.PI), lam("ironHandle", () => ({ color: "#4a4e5a" })));
  handle.position.y = h; g.add(handle);
  g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  return g;
};
/** water barrel (radius r) */
export const barrel = (r: number) => {
  const g = new THREE.Group(), h = r * 2.1;
  const body = new THREE.Mesh(lathe([[r * 0.86, 0], [r, h * 0.5], [r * 0.86, h]]), lam("barrelWood", () => ({ map: staveTex("barrelStave", "#a56a3c", "#5d616c"), side: THREE.DoubleSide })));
  const water = new THREE.Mesh(new THREE.CircleGeometry(r * 0.85, 24).rotateX(-Math.PI / 2), lam("barrelWater", () => ({ color: "#5fb7d6" })));
  water.position.y = h * 0.9;
  g.add(body, water);
  const ice = lam("ice", () => ({ color: "#e9f8ff" }));
  for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(r * 0.3, r * 0.15, r * 0.28), ice); m.position.set((i - 1.5) * r * 0.3, h * 0.92, (i % 2) * r * 0.25); m.rotation.y = i; g.add(m); }
  g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  return g;
};
/** copper kettle, base at y = 0 */
export const kettle = () => {
  const g = new THREE.Group();
  const cu = twoTone(new THREE.MeshPhongMaterial({ color: "#c46a3a", specular: "#ffd2a8", shininess: 50 }), 0.2);
  g.add(new THREE.Mesh(lathe([[0.001, 0], [0.2, 0.01], [0.24, 0.12], [0.2, 0.26], [0.08, 0.31], [0.06, 0.36], [0.001, 0.37]]), cu));
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.045, 0.26, 10), cu);
  spout.position.set(0.25, 0.2, 0); spout.rotation.z = -0.9; g.add(spout);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 20, Math.PI), lam("ironHandle", () => ({ color: "#4a4e5a" })));
  handle.position.y = 0.33; g.add(handle);
  g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  return g;
};
/** wax candle with a glowing flame (emissive > 1 feeds the bloom) */
export const candle = () => {
  const g = new THREE.Group();
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.2, 14), lam("wax", () => ({ color: "#f3ead6" })));
  wax.position.y = 0.1;
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.02, 20), lam("brass", () => ({ color: "#d9a83a" })));
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10).scale(1, 2.1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.2, 1.2) }));
  flame.position.y = 0.245; flame.layers.set(NOINK);
  g.add(wax, dish, flame);
  return { g, flame };
};

// ---------------- paper with Fahrenheit's halving marks ----------------
/** cut = how many times the 32..96 line has been halved (0..6): 2^cut equal parts */
export const paperTex = (cut: number) => ctex(`paper_${cut}`, 1024, 640, (g) => {
  g.fillStyle = "#f4e9cf"; g.fillRect(0, 0, 1024, 640);
  g.strokeStyle = "rgba(150,110,60,0.25)"; g.lineWidth = 24; g.strokeRect(12, 12, 1000, 616);
  const x0 = 110, x1 = 914, y = 330;
  g.strokeStyle = INK; g.lineCap = "round";
  g.lineWidth = 9; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
  for (let k = 0; k <= cut; k++) {
    const n = 2 ** k, len = [120, 92, 74, 58, 44, 34, 26][k], w = [9, 8, 7, 6, 5, 4, 3.5][k];
    g.lineWidth = w;
    for (let i = 0; i <= n; i++) { if (k > 0 && i % 2 === 0) continue; const x = x0 + ((x1 - x0) * i) / n; g.beginPath(); g.moveTo(x, y - len / 2); g.lineTo(x, y + len / 2); g.stroke(); }
  }
  paintText(g, "32", x0, y + 120, 92, "#ffffff");
  paintText(g, "96", x1, y + 120, 92, "#ffffff");
  if (cut >= 6) paintText(g, "64 steps", 512, 140, 84, "#ffd84d");
});

// ---------------- signs, banner ----------------
export const shopSignTex = () => ctex("shopSign", 512, 384, (g) => {
  g.fillStyle = "#2f5f6a"; g.fillRect(0, 0, 512, 384);
  g.lineWidth = 16; g.strokeStyle = "#e8c45a"; g.strokeRect(14, 14, 484, 356);
  // a big cartoon thermometer
  g.fillStyle = "#f4f1ea"; g.strokeStyle = INK; g.lineWidth = 9;
  g.beginPath(); g.roundRect(226, 52, 60, 220, 30); g.fill(); g.stroke();
  g.fillStyle = "#e0332e"; g.beginPath(); g.arc(256, 290, 46, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillRect(244, 150, 24, 140);
  paintText(g, "D.G.F.", 256, 345, 46, "#e8c45a", "center", 0.12);
});
export const bannerTex = () => ctex("goMetric", 1024, 256, (g) => {
  g.fillStyle = "#f6efe0"; g.fillRect(0, 0, 1024, 256);
  g.fillStyle = "#c9373a"; g.fillRect(0, 0, 1024, 26); g.fillRect(0, 230, 1024, 26);
  paintText(g, "GO METRIC", 512, 118, 150, "#2f5fb5", "center", 0.1);
  g.font = font(34, 700); g.fillStyle = INK; g.textAlign = "center"; g.fillText("METRIC CONVERSION ACT  •  1975", 512, 205);
});

// ---------------- workshop set (open-roofed room) ----------------
export type Shop = {
  hero: Thermo; late: Thermo; bucketT: THREE.Group; bucketRod: THREE.Group; barrelRod: THREE.Group; armRod: THREE.Group;
  salt: THREE.Group; candle: ReturnType<typeof candle>; paper: THREE.Mesh; kettle: THREE.Group; glow: THREE.Mesh; furnaceGlow: THREE.MeshBasicMaterial;
  night: THREE.Object3D[];
};
/** room centred on (cx, D0, cz): walls on -x, +x and +z, open towards -z and to the sky; beams across the top */
export const buildShop = (root: THREE.Object3D, cx: number, y0: number, cz: number): Shop => {
  const b = new Batch();
  const floor = lam("shopFloor", () => ({ map: rep(beam(), 2, 2) }));
  const wall = lam("shopWall", () => ({ map: stoneHD("shopWallHD", ["#d8c7a8", "#cdbb9b", "#e2d2b4", "#c4b293"], "#9c8a70") }));
  const wood = lam("shopBeam", () => ({ map: beam() }));
  const brk = lam("shopBrick", () => ({ map: rep(brick(), 1, 1) }));
  const X0 = cx - 4, X1 = cx + 4, Z0 = cz - 3, Z1 = cz + 3, H = 3.6;
  b.add(boxGeo(V(X0 - 2, y0 - 0.2, Z0 - 6), V(X1 + 2, y0, Z1 + 1), 3), floor);
  b.add(boxGeo(V(X0 - 0.3, y0, Z0), V(X0, y0 + H, Z1 + 0.3), 2), wall);
  b.add(boxGeo(V(X1, y0, Z0), V(X1 + 0.3, y0 + H, Z1 + 0.3), 2), wall);
  b.add(boxGeo(V(X0 - 0.3, y0, Z1), V(X1 + 0.3, y0 + H, Z1 + 0.3), 2), wall);
  for (let k = 0; k < 5; k++) { const z = Z0 + 0.6 + k * 1.35; b.add(boxGeo(V(X0 - 0.3, y0 + H, z - 0.12), V(X1 + 0.3, y0 + H + 0.24, z + 0.12)), wood); }
  // workbench, shelf, furnace + chimney
  b.add(boxGeo(V(cx - 1.8, y0, cz + 0.6), V(cx + 1.8, y0 + 0.92, cz + 1.5), 1), wood);
  b.add(boxGeo(V(X0 + 0.6, y0 + 1.48, Z1 - 0.32), V(cx + 0.4, y0 + 1.54, Z1)), wood);
  b.add(boxGeo(V(X0 + 0.6, y0 + 2.18, Z1 - 0.32), V(cx + 0.4, y0 + 2.24, Z1)), wood);
  b.add(boxGeo(V(X1 - 2.0, y0, Z1 - 1.2), V(X1 - 0.2, y0 + 1.5, Z1)), brk);
  b.add(boxGeo(V(X1 - 1.4, y0 + 1.5, Z1 - 0.8), V(X1 - 0.6, y0 + H + 1.4, Z1)), brk);
  b.add(boxGeo(V(X1 - 2.1, y0 + 1.5, Z1 - 1.3), V(X1 - 0.1, y0 + 1.62, Z1 + 0.05)), lam("shopCope", () => ({ color: "#8f7f72" })));
  b.build(root);
  // furnace mouth: emissive (blooms by day, glows by night)
  const furnaceGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.4, 0.4) });
  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.55), furnaceGlow);
  mouth.position.set(X1 - 1.1, y0 + 0.5, Z1 - 1.21); mouth.rotation.y = Math.PI; mouth.layers.set(NOINK);
  root.add(mouth);
  // the hero thermometer on the bench, the late (1700s -> 212) board on the back wall by the furnace
  const hero = new Thermo("early", 0.95); hero.group.position.set(cx + 0.65, y0 + 0.92, cz + 1.05); root.add(hero.group);
  const late = new Thermo("late", 1.5, ["32", "96", "212"]); late.group.position.set(X1 - 2.55, y0 + 0.95, Z1 - 0.05); root.add(late.group);
  // shelf of thermometers that disagree
  [0.62, 0.35, 0.8, 0.5, 0.22, 0.7, 0.44].forEach((lv, i) => { const r = rod(0.5, lv); r.position.set(X0 + 0.85 + i * 0.5, y0 + 1.54, Z1 - 0.16); r.rotation.z = (i % 3 - 1) * 0.04; root.add(r); });
  [0.3, 0.75, 0.55, 0.15, 0.9].forEach((lv, i) => { const r = rod(0.42, lv); r.position.set(X0 + 1.0 + i * 0.6, y0 + 2.24, Z1 - 0.16); root.add(r); });
  const bucketT = bucket(0.3); bucketT.position.set(cx - 1.4, y0, cz - 0.2); root.add(bucketT);
  const bucketRod = rod(0.55, 0.1); bucketRod.position.set(cx - 1.4 + 0.05, y0 + 0.35, cz - 0.2); bucketRod.rotation.z = -0.25; root.add(bucketRod);
  const br = barrel(0.42); br.position.set(cx + 2.7, y0, cz - 0.1); root.add(br);
  const barrelRod = rod(0.6, 0.45); barrelRod.position.set(cx + 2.7, y0 + 0.62, cz - 0.1); barrelRod.rotation.z = 0.3; root.add(barrelRod);
  const armRod = rod(0.34, 0.75); root.add(armRod);
  // salt falling from a scoop (shot 4): small white grains, animated by the world
  const salt = new THREE.Group();
  const grain = new THREE.BoxGeometry(0.018, 0.018, 0.018), sm = lam("salt", () => ({ color: "#ffffff" }));
  for (let i = 0; i < 40; i++) salt.add(new THREE.Mesh(grain, sm));
  root.add(salt);
  // night props: candle, paper with the halving marks, warm light pool on the bench
  const cnd = candle(); cnd.g.position.set(cx - 0.55, y0 + 0.92, cz + 1.15); root.add(cnd.g);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), lam("paper0", () => ({ map: paperTex(0) })));
  paper.rotation.set(-Math.PI / 2, 0, Math.PI); paper.position.set(cx + 0.05, y0 + 0.925, cz + 1.0); root.add(paper); // turned to read from the lens side (-z)
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshBasicMaterial({ map: poolTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.0, 0.62, 0.28) }));
  glow.rotation.x = -Math.PI / 2; glow.position.set(cx - 0.3, y0 + 0.93, cz + 1.05); glow.layers.set(NOINK); root.add(glow);
  const ket = kettle(); ket.position.set(X1 - 1.1, y0 + 1.62, Z1 - 0.65); root.add(ket);
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && !m.receiveShadow) { m.receiveShadow = true; } });
  return { hero, late, bucketT, bucketRod, barrelRod, armRod, salt, candle: cnd, paper, kettle: ket, glow, furnaceGlow, night: [cnd.g, glow] };
};
const poolTex = () => ctex("warmPool", 256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,255,255,0.75)"); gr.addColorStop(0.45, "rgba(255,255,255,0.3)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
});

// ---------------- ship ----------------
/** a little two-masted sailing ship, bow toward +x, waterline at y = 0 */
export const ship = () => {
  const g = new THREE.Group();
  const hull = new THREE.Shape();
  hull.moveTo(-6, 2.2); hull.lineTo(6.6, 2.2); hull.quadraticCurveTo(6.2, 0.2, 3.5, -0.9); hull.lineTo(-5.2, -0.9); hull.quadraticCurveTo(-6.2, 0.4, -6, 2.2);
  const hg = new THREE.ExtrudeGeometry(hull, { depth: 3.2, bevelEnabled: false }); hg.translate(0, 0, -1.6);
  const wood = lam("hullWood", () => ({ map: rep(beam(), 3, 1) }));
  g.add(new THREE.Mesh(hg, wood));
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.35, 3.3), lam("hullStripe", () => ({ color: "#c9373a" })));
  stripe.position.set(0.2, 1.75, 0); g.add(stripe);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.12, 3.0), lam("deckWood", () => ({ color: "#d9a86c" })));
  deck.position.set(0.2, 2.15, 0); g.add(deck);
  const cloth = lam("sail", () => ({ color: "#f7f1e1", side: THREE.DoubleSide }));
  for (const [x, h] of [[-2, 9], [2.4, 10.5]] as const) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, h, 8), wood); mast.position.set(x, 2.2 + h / 2, 0); g.add(mast);
    for (const [y, w, sh] of [[2.2 + h * 0.42, 4.6, 2.6], [2.2 + h * 0.78, 3.6, 2.0]] as const) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(w, sh, 8, 4), cloth);
      const p = s.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (w / 2); p.setZ(i, 0.55 * (1 - u * u)); }
      s.geometry.computeVertexNormals();
      s.rotation.y = Math.PI / 2 - 0.65; s.position.set(x + 0.35, y, 0); g.add(s);
    }
  }
  const pen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), lam("pennant2", () => ({ color: "#c9373a", side: THREE.DoubleSide })));
  pen.position.set(2.4 - 0.6, 2.2 + 10.5 + 0.3, 0); g.add(pen);
  g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  return g;
};
