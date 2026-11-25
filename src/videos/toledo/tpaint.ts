// The Toledo War Short's painted textures: logs, clapboard, the dirt street, snow, copper rock, frosted glass, skies,
// and the hand-drawn map of the Toledo Strip / the Great Lakes (stylised, drawn in code from rough coordinates).
import * as THREE from "three";
import { ctex } from "../bridge/paint";

const INK = "#1e1a22";
export const rep = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.repeat.set(x, y); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.needsUpdate = true; return c; };

/** a wall of squared logs laid along u, pale chinking between them, end grain and knots */
export const logTex = (key = "twLog", base = "#8a6a4a") => ctex(key, 1024, 1024, (g, r) => {
  const n = 8, h = 1024 / n;
  for (let i = 0; i < n; i++) { const y = i * h; const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, "#d8cbb0"); gr.addColorStop(0.08, base); gr.addColorStop(0.55, base); gr.addColorStop(0.92, "#4a3626"); gr.addColorStop(1, "#d8cbb0"); g.fillStyle = gr; g.fillRect(0, y, 1024, h);
    for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(40,26,16,${(0.15 + 0.2 * r()).toFixed(2)})`; g.lineWidth = 2; const yy = y + h * (0.2 + 0.6 * r()); g.beginPath(); g.moveTo(r() * 1024, yy); g.lineTo(r() * 1024, yy + (r() - 0.5) * 6); g.stroke(); }
    for (let k = 0; k < 3; k++) { g.fillStyle = "rgba(50,32,20,0.55)"; g.beginPath(); g.ellipse(r() * 1024, y + h * (0.3 + 0.4 * r()), 7 + r() * 8, 4 + r() * 4, 0, 0, 6.3); g.fill(); } }
});
/** painted clapboard siding (horizontal boards with a shadow under each lap) */
export const clapTex = (col: string) => ctex("twClap" + col, 512, 512, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 32) { g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(0, y + 26, 512, 6); g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(0, y, 512, 4); }
  for (let i = 0; i < 160; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"; g.fillRect(r() * 512, r() * 512, 20 + r() * 60, 2); }
});
/** the dirt street: packed brown earth, two wheel ruts along u, hoofprints, pebbles, puddle stains */
export const streetTex = () => ctex("twStreet", 1024, 1024, (g, r) => {
  g.fillStyle = "#9a7a56"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(60,40,24,0.12)" : "rgba(230,200,160,0.12)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 4 + r() * 22, 3 + r() * 10, r() * 3, 0, 6.3); g.fill(); }
  for (const y of [330, 690]) { g.fillStyle = "rgba(60,40,26,0.35)"; g.fillRect(0, y, 1024, 46); g.fillStyle = "rgba(255,240,210,0.12)"; g.fillRect(0, y + 46, 1024, 6); }
  for (let i = 0; i < 70; i++) { g.fillStyle = "rgba(50,34,22,0.4)"; g.beginPath(); g.arc(r() * 1024, 380 + r() * 260, 8 + r() * 6, 0.3, 2.8); g.fill(); }
  for (let i = 0; i < 400; i++) { g.fillStyle = ["#b8a488", "#6a5a48", "#d8c8b0"][Math.floor(r() * 3)]; g.fillRect(r() * 1024, r() * 1024, 3 + r() * 4, 3 + r() * 3); }
});
/** deep snow with blue shadows and a few dry grass stalks poking through */
export const snowTex = () => ctex("twSnow", 1024, 1024, (g, r) => {
  g.fillStyle = "#eef2f6"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 300; i++) { g.fillStyle = r() > 0.5 ? "rgba(180,196,220,0.3)" : "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 30 + r() * 80, 12 + r() * 30, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 40; i++) { const x = r() * 1024, y = r() * 1024; for (let k = 0; k < 8; k++) { g.strokeStyle = "rgba(120,110,80,0.6)"; g.lineWidth = 2; const px = x + (r() - 0.5) * 30; g.beginPath(); g.moveTo(px, y); g.lineTo(px + (r() - 0.5) * 10, y - 10 - r() * 16); g.stroke(); } }
});
/** dark basalt with green-stained seams and bright native copper in it */
export const copperRockTex = () => ctex("twCopperRock", 1024, 1024, (g, r) => {
  g.fillStyle = "#4a4442"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 500; i++) { g.fillStyle = r() > 0.5 ? "rgba(20,18,20,0.25)" : "rgba(140,130,120,0.18)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 8 + r() * 40, 5 + r() * 20, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 18; i++) { g.strokeStyle = "rgba(70,150,120,0.55)"; g.lineWidth = 6 + r() * 8; g.beginPath(); let x = r() * 1024, y = r() * 1024; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 160; y += (r() - 0.3) * 120; g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 60; i++) { const x = r() * 1024, y = r() * 1024, s = 6 + r() * 18; g.fillStyle = "#d9793a"; g.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283, rr = s * (0.6 + 0.6 * r()); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.fillStyle = "#ffc98a"; g.fillRect(x - s * 0.3, y - s * 0.3, s * 0.4, s * 0.25); }
});
/** a frosted window: bright winter light behind, frost feathers growing in from the corners */
export const frostTex = () => ctex("twFrost", 512, 512, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#dfe8f2"); gr.addColorStop(1, "#f6f8fa"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 120; i++) { const cx = r() > 0.5 ? r() * 120 : 512 - r() * 120, cy = r() > 0.5 ? r() * 120 : 512 - r() * 120; g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); const a = r() * 6.28; for (let k = 1; k < 5; k++) g.lineTo(cx + Math.cos(a + (r() - 0.5)) * k * 18, cy + Math.sin(a + (r() - 0.5)) * k * 18); g.stroke(); }
  g.strokeStyle = "#5a4636"; g.lineWidth = 18; g.strokeRect(0, 0, 512, 512); g.lineWidth = 12; g.beginPath(); g.moveTo(256, 0); g.lineTo(256, 512); g.moveTo(0, 256); g.lineTo(512, 256); g.stroke();
});
export const twSkyTex = (kind: "day" | "winter") => ctex("twSky_" + kind, 1024, 1024, (g, r) => {
  const [a, b, c] = kind === "winter" ? ["#8a98aa", "#bcc6d0", "#e2e6ea"] : ["#6c9acc", "#acc8e2", "#eae6da"];
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, a); gr.addColorStop(0.6, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 22; i++) { const x = r() * 1024, y = 200 + r() * 560, w = 140 + r() * 300; for (let k = 0; k < 5; k++) { g.fillStyle = kind === "winter" ? (k % 2 ? "rgba(240,242,246,0.4)" : "rgba(150,158,170,0.35)") : (k % 2 ? "rgba(255,255,255,0.55)" : "rgba(220,228,236,0.4)"); g.beginPath(); g.ellipse(x + (r() - 0.5) * w * 0.6, y + (r() - 0.5) * 30, w * (0.3 + 0.3 * r()), 18 + r() * 22, 0, 0, 6.3); g.fill(); } }
});

// ---------------- the map ----------------
type LL = [number, number];
const ERIE: LL[] = [[-83.47, 41.7], [-83.2, 41.62], [-82.7, 41.45], [-81.7, 41.5], [-80.5, 41.95], [-79.8, 42.3], [-79.0, 42.8], [-79.8, 42.85], [-80.5, 42.6], [-81.6, 42.6], [-82.5, 42.0], [-83.1, 42.02], [-83.45, 41.8]];
const MICH: LL[] = [[-87.8, 41.62], [-87.0, 41.65], [-86.6, 41.9], [-86.3, 42.4], [-86.2, 43.0], [-86.5, 43.8], [-86.4, 44.4], [-86.0, 44.9], [-85.6, 45.3], [-85.0, 45.75], [-85.4, 45.85], [-86.0, 45.95], [-86.7, 45.85], [-87.0, 45.6], [-87.6, 45.1], [-87.9, 44.5], [-87.5, 44.0], [-87.8, 43.4], [-87.9, 42.8], [-87.8, 42.3]];
const SUP: LL[] = [[-92.1, 46.7], [-91.0, 46.9], [-90.4, 46.6], [-89.6, 46.85], [-88.4, 47.4], [-87.8, 47.45], [-88.0, 46.95], [-87.3, 46.5], [-86.5, 46.45], [-85.5, 46.75], [-84.8, 46.5], [-84.6, 46.9], [-85.0, 47.6], [-86.0, 48.9], [-88.5, 48.9], [-89.6, 48.0], [-90.5, 47.5], [-92.0, 46.8]];
const HUR: LL[] = [[-84.7, 45.85], [-84.0, 45.95], [-83.5, 45.9], [-82.5, 45.3], [-81.7, 45.25], [-81.4, 44.9], [-81.7, 44.4], [-81.75, 43.4], [-82.4, 43.0], [-82.5, 43.6], [-83.0, 44.05], [-83.6, 44.0], [-83.4, 44.4], [-83.3, 45.0], [-84.0, 45.5]];
const UP: LL[] = [[-90.4, 46.57], [-89.6, 46.85], [-88.4, 47.4], [-87.8, 47.45], [-88.0, 46.95], [-87.3, 46.5], [-86.5, 46.45], [-85.5, 46.75], [-84.8, 46.5], [-84.4, 46.3], [-84.1, 46.0], [-84.7, 45.9], [-85.4, 45.95], [-86.0, 45.95], [-86.7, 45.85], [-87.0, 45.6], [-87.6, 45.1], [-88.1, 45.8], [-89.0, 46.0], [-90.1, 46.3]];
/** the strip: between Michigan's line (due east from the bottom of Lake Michigan) and Ohio's (angled up to the bay) */
const STRIP: LL[] = [[-84.81, 41.62], [-83.3, 41.62], [-83.47, 41.7], [-83.45, 41.733], [-84.81, 41.696]];
const MAUMEE: LL[] = [[-83.47, 41.69], [-83.55, 41.65], [-83.65, 41.57], [-83.9, 41.47], [-84.2, 41.35], [-84.36, 41.28]];
/** "strip": the Toledo Strip, close (Michigan's claim north, Ohio's south); "up": the Great Lakes, the strip gone to Ohio,
 *  the Upper Peninsula picked out for Michigan */
export const mapTex = (kind: "strip" | "up") => ctex("twMap_" + kind, 1600, 1200, (g, r) => {
  const W = 1600, H = 1200, [l0, l1, b0, b1] = kind === "strip" ? [-85.6, -82.6, 41.15, 42.3] : [-92.2, -79.0, 40.4, 48.7];
  const P = ([lo, la]: LL): [number, number] => [((lo - l0) / (l1 - l0)) * W, ((b1 - la) / (b1 - b0)) * H];
  const poly = (pts: LL[], fill: string, stroke?: string, lw = 6) => { g.beginPath(); pts.forEach((p, i) => { const [x, y] = P(p); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = "round"; g.stroke(); } };
  const line = (pts: LL[], col: string, lw: number, dash: number[] = []) => { g.setLineDash(dash); g.beginPath(); pts.forEach((p, i) => { const [x, y] = P(p); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.stroke(); g.setLineDash([]); };
  const label = (s: string, p: LL, size: number, col = INK, ital = false) => { const [x, y] = P(p); g.font = `${ital ? "italic " : ""}900 ${size}px Montserrat, DejaVu Sans, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = size * 0.22; g.strokeStyle = "rgba(246,236,210,0.9)"; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); };
  // parchment
  g.fillStyle = "#efe2c2"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) { g.fillStyle = r() > 0.5 ? "rgba(140,100,50,0.06)" : "rgba(255,250,235,0.1)"; g.beginPath(); g.ellipse(r() * W, r() * H, 20 + r() * 90, 10 + r() * 40, r() * 3, 0, 6.3); g.fill(); }
  const water = "#9cc0d0";
  if (kind === "strip") {
    poly([[-84.81, 41.696], [-82.6, 41.75], [-82.6, 42.3], [-85.6, 42.3], [-85.6, 41.76], [-84.81, 41.76]], "#e7d9a6"); // Michigan
    poly([[-84.81, 41.15], [-82.6, 41.15], [-82.6, 41.62], [-84.81, 41.62]], "#cfe0b0"); // Ohio
    poly(STRIP, "rgba(214,60,50,0.45)", "#b3262b", 5);
    for (let k = 0; k < 40; k++) { const x0 = P([-84.81, 0])[0] + k * 34; g.strokeStyle = "rgba(179,38,43,0.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, P([0, 41.70])[1]); g.lineTo(x0 + 26, P([0, 41.625])[1]); g.stroke(); }
    poly(ERIE, water, "#5a8aa0", 5);
    line(MAUMEE, "#5a8aa0", 12);
    line([[-84.81, 41.15], [-84.81, 41.76]], INK, 5, [18, 12]); line([[-85.6, 41.76], [-84.81, 41.76]], INK, 5, [18, 12]);
    line([[-84.81, 41.696], [-83.45, 41.733]], "#2a4a8a", 7); line([[-84.81, 41.62], [-83.3, 41.62]], "#2a7a3a", 7);
    const t = P([-83.55, 41.663]); g.fillStyle = INK; g.beginPath(); g.arc(t[0], t[1], 16, 0, 6.3); g.fill(); g.fillStyle = "#ffd166"; g.beginPath(); g.arc(t[0], t[1], 9, 0, 6.3); g.fill();
    label("MICHIGAN", [-84.5, 42.05], 88, "#2a4a8a"); label("OHIO", [-84.2, 41.35], 88, "#2a7a3a"); label("INDIANA", [-85.22, 41.45], 46, "#5a4a3a");
    label("LAKE ERIE", [-82.95, 41.98], 52, "#2a5a7a", true); label("TOLEDO", [-83.62, 41.79], 60); label("Maumee River", [-83.9, 41.4], 34, "#2a5a7a", true);
    label("THE TOLEDO STRIP", [-84.12, 41.565], 44, "#b3262b");
  } else {
    poly([[-92.2, 40.4], [-79.0, 40.4], [-79.0, 48.7], [-92.2, 48.7]], "#e9dcbc");
    poly(UP, "#f2c14e", "#b07a10", 6);
    poly([[-84.81, 40.4], [-80.52, 40.4], [-80.52, 41.98], [-82.5, 41.7], [-83.45, 41.733], [-84.81, 41.696]], "#cfe0b0"); // Ohio, with the strip
    poly(STRIP, "rgba(214,60,50,0.5)", "#b3262b", 4);
    for (const lk of [MICH, SUP, HUR, ERIE]) poly(lk, water, "#5a8aa0", 5);
    line([[-84.81, 40.4], [-84.81, 41.76], [-86.8, 41.76]], INK, 4, [16, 10]); line([[-80.52, 40.4], [-80.52, 41.98]], INK, 4, [16, 10]);
    line([[-87.6, 45.1], [-88.1, 45.8], [-89.0, 46.0], [-90.1, 46.3], [-90.4, 46.57]], INK, 4, [16, 10]);
    const t = P([-83.55, 41.663]); g.fillStyle = INK; g.beginPath(); g.arc(t[0], t[1], 11, 0, 6.3); g.fill();
    label("UPPER PENINSULA", [-87.2, 46.25], 50, "#7a4a00"); label("MICHIGAN", [-84.6, 43.4], 64, "#2a4a8a"); label("OHIO", [-82.6, 40.9], 64, "#2a7a3a");
    label("WISCONSIN", [-89.9, 44.9], 40, "#5a4a3a"); label("INDIANA", [-86.4, 40.9], 40, "#5a4a3a"); label("TOLEDO", [-83.7, 42.15], 38);
    label("Lake Superior", [-87.2, 47.9], 40, "#2a5a7a", true); label("Lake Michigan", [-87.0, 43.3], 32, "#2a5a7a", true); label("Lake Huron", [-82.4, 44.55], 32, "#2a5a7a", true); label("Lake Erie", [-81.1, 42.18], 32, "#2a5a7a", true);
  }
  // a hand-ruled frame
  g.strokeStyle = "#5a4630"; g.lineWidth = 14; g.strokeRect(14, 14, W - 28, H - 28); g.lineWidth = 3; g.strokeRect(34, 34, W - 68, H - 68);
});
