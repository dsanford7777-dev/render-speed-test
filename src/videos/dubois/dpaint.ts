// The Dexter Short's painted textures: clapboard, the dirt street, skies (Newburyport day, Newcastle grey, West Indies
// hot), the book's pages (A Pickle for the Knowing Ones: its title page and the page of punctuation), paper money, gold
// coins, lumps of coal, punctuation marks, brick. (Logs, snow, copper rock, frost and the Toledo map are left from the
// world this was built from.)
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
export const twSkyTex = (kind: "day" | "winter" | "grey" | "hot") => ctex("twSky_" + kind, 1024, 1024, (g, r) => {
  const [a, b, c] = kind === "winter" ? ["#8a98aa", "#bcc6d0", "#e2e6ea"] : kind === "grey" ? ["#6e7278", "#9a9ca0", "#c4c2bc"] : kind === "hot" ? ["#3a8ad8", "#8ec4ec", "#f4ecd2"] : ["#6c9acc", "#acc8e2", "#eae6da"];
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, a); gr.addColorStop(0.6, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 22; i++) { const x = r() * 1024, y = 200 + r() * 560, w = 140 + r() * 300; for (let k = 0; k < 5; k++) { g.fillStyle = kind === "grey" ? (k % 2 ? "rgba(120,122,128,0.45)" : "rgba(80,82,88,0.4)") : kind === "winter" ? (k % 2 ? "rgba(240,242,246,0.4)" : "rgba(150,158,170,0.35)") : (k % 2 ? "rgba(255,255,255,0.55)" : "rgba(220,228,236,0.4)"); g.beginPath(); g.ellipse(x + (r() - 0.5) * w * 0.6, y + (r() - 0.5) * 30, w * (0.3 + 0.3 * r()), 18 + r() * 22, 0, 0, 6.3); g.fill(); } }
});

// ---------------- the map ----------------
type LL = [number, number];
const ERIE: LL[] = [[-83.47, 41.7], [-83.2, 41.62], [-82.7, 41.45], [-81.7, 41.5], [-80.5, 41.95], [-79.8, 42.3], [-79.0, 42.8], [-79.8, 42.85], [-80.5, 42.6], [-81.6, 42.6], [-82.5, 42.0], [-83.1, 42.02], [-83.45, 41.8]];
const MICH: LL[] = [[-87.8, 41.62], [-87.0, 41.65], [-86.6, 41.9], [-86.3, 42.4], [-86.2, 43.0], [-86.5, 43.8], [-86.4, 44.4], [-86.0, 44.9], [-85.6, 45.3], [-85.0, 45.75], [-85.4, 45.85], [-86.0, 45.95], [-86.7, 45.85], [-87.0, 45.6], [-87.6, 45.1], [-87.9, 44.5], [-87.5, 44.0], [-87.8, 43.4], [-87.9, 42.8], [-87.8, 42.3]];
const SUP: LL[] = [[-92.1, 46.7], [-91.0, 46.9], [-90.4, 46.6], [-89.6, 46.85], [-88.4, 47.4], [-87.8, 47.45], [-88.0, 46.95], [-87.3, 46.5], [-86.5, 46.45], [-85.5, 46.75], [-84.8, 46.5], [-84.6, 46.9], [-85.0, 47.6], [-86.0, 48.9], [-88.5, 48.9], [-89.6, 48.0], [-90.5, 47.5], [-92.0, 46.8]];
const HUR: LL[] = [[-84.7, 45.85], [-84.0, 45.95], [-83.5, 45.9], [-82.5, 45.3], [-81.7, 45.25], [-81.4, 44.9], [-81.7, 44.4], [-81.75, 43.4], [-82.4, 43.0], [-82.5, 43.6], [-83.0, 44.05], [-83.6, 44.0], [-83.4, 44.4], [-83.3, 45.0], [-84.0, 45.5]];
const UP: LL[] = [[-90.4, 46.57], [-89.6, 46.85], [-88.4, 47.4], [-87.8, 47.45], [-88.0, 46.95], [-87.3, 46.5], [-86.5, 46.45], [-85.5, 46.75], [-84.8, 46.5], [-84.4, 46.3], [-84.1, 46.0], [-84.7, 45.9], [-85.4, 45.95], [-86.0, 45.95], [-86.7, 45.85], [-87.0, 45.6], [-87.6, 45.1], [-88.1, 45.8], [-89.0, 46.0], [-90.1, 46.3]];
/** the strip: between Michigan's line to the south (due east from the bottom of Lake Michigan) and Ohio's to the north (angled up to the bay) */
const STRIP: LL[] = [[-84.81, 41.62], [-83.3, 41.62], [-83.47, 41.7], [-83.45, 41.733], [-84.81, 41.696]];
const MAUMEE: LL[] = [[-83.47, 41.69], [-83.55, 41.65], [-83.65, 41.57], [-83.9, 41.47], [-84.2, 41.35], [-84.36, 41.28]];
/** "strip": the Toledo Strip, close (the land between the two claimed lines); "up": the Great Lakes, the strip gone to Ohio,
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
    line([[-84.81, 41.696], [-83.45, 41.733]], "#2a7a3a", 7); line([[-84.81, 41.62], [-83.3, 41.62]], "#2a4a8a", 7); // Ohio claimed the northern (Harris) line, Michigan the southern (Fulton) one
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

// ---------------- Dexter's own things ----------------
const fitText = (g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, maxW: number, col: string, font = "Georgia, 'DejaVu Serif', serif", weight = "700") => {
  let z = size; g.font = `${weight} ${z}px ${font}`; while (g.measureText(s).width > maxW && z > 8) { z -= 2; g.font = `${weight} ${z}px ${font}`; }
  g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, x, y);
};
/** old paper: warm, foxed, darker at the edges */
const oldPaper = (g: CanvasRenderingContext2D, r: () => number, w: number, h: number, base = "#efe2c2") => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { g.fillStyle = r() > 0.5 ? "rgba(120,80,30,0.06)" : "rgba(255,250,235,0.08)"; g.beginPath(); g.ellipse(r() * w, r() * h, 6 + r() * 40, 4 + r() * 24, r() * 3, 0, 6.3); g.fill(); }
  const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.7); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(110,70,30,0.35)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
};
// Dexter's own words (1802, public domain), as he spelled them, run on with no stops: the page the camera reads
const PICKLE = "I Dreamed of warming pans three Nits that thay would doue in the west ingas I got not more than fortey two thousand put them into nine vessels for difernt parts of the west ingas the pans thay mad yous of them for Coucking I cleared sevinty nine per sent and I made or cleared forty seven thousands Dolors this is the truth I am the first Lord in the younited States".split(" ");
/** the book's pages on the study board: "pickle" its title and a run of his text; "punct" the page of stops and marks */
export const pageTex = (kind: "pickle" | "punct") => ctex("dxPage_" + kind, 1300, 880, (g, r) => {
  const w = 1300, h = 880; oldPaper(g, r, w, h);
  g.strokeStyle = "#3a2a1a"; g.lineWidth = 10; g.strokeRect(24, 24, w - 48, h - 48); g.lineWidth = 3; g.strokeRect(42, 42, w - 84, h - 84);
  if (kind === "pickle") {
    fitText(g, "A PICKLE FOR THE KNOWING ONES", w / 2, 120, 84, w - 180, "#2a1a10");
    fitText(g, "OR PLAIN TRUTHS IN A HOMESPUN DRESS", w / 2, 200, 44, w - 260, "#5a3a20", undefined, "400");
    fitText(g, "BY TIMOTHY DEXTER", w / 2, 262, 42, w - 260, "#2a1a10");
    g.fillStyle = "#3a2a1a"; g.fillRect(w / 2 - 260, 305, 520, 4);
    g.font = "400 40px Georgia, 'DejaVu Serif', serif"; g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillStyle = "#2a1a10";
    let x = 90, y = 380; for (const wd of [...PICKLE, ...PICKLE]) { const ww = g.measureText(wd + " ").width; if (x + ww > w - 90) { x = 90; y += 60; } if (y > h - 70) break; g.fillText(wd, x, y); x += ww; }
  } else {
    fitText(g, "FOR THE KNOWING ONES:", w / 2, 110, 64, w - 200, "#2a1a10");
    g.font = "700 64px Georgia, 'DejaVu Serif', serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#2a1a10";
    const row = ". , ; : ! ? . , ; : ! ? . , ; : ! ?";
    for (let i = 0; i < 9; i++) g.fillText(row, w / 2, 210 + i * 72);
  }
});
/** a paper note of the war: "CONTINENTAL CURRENCY", a denomination, a seal */
export const noteTex = () => ctex("dxNote", 256, 160, (g, r) => {
  g.clearRect(0, 0, 256, 160); g.fillStyle = "#e4d9b0"; g.fillRect(8, 8, 240, 144); for (let i = 0; i < 60; i++) { g.fillStyle = "rgba(90,70,30,0.08)"; g.fillRect(8 + r() * 230, 8 + r() * 140, 10 + r() * 20, 2); }
  g.strokeStyle = "#1e1a22"; g.lineWidth = 7; g.strokeRect(8, 8, 240, 144); g.strokeStyle = "#4a5a3a"; g.lineWidth = 3; g.strokeRect(20, 20, 216, 120);
  fitText(g, "CONTINENTAL", 128, 46, 30, 196, "#2a2a1a"); fitText(g, "CURRENCY", 128, 76, 24, 160, "#2a2a1a");
  g.fillStyle = "#6a2a20"; g.beginPath(); g.arc(128, 116, 18, 0, 6.3); g.fill(); fitText(g, "$1", 128, 117, 20, 30, "#f2e6c8");
});
/** a gold coin, face on */
export const coinTex = () => ctex("dxCoin", 96, 96, (g) => {
  g.clearRect(0, 0, 96, 96); g.fillStyle = "#e0b040"; g.beginPath(); g.arc(48, 48, 38, 0, 6.3); g.fill(); g.strokeStyle = "#1e1a22"; g.lineWidth = 6; g.stroke();
  g.strokeStyle = "#a87a20"; g.lineWidth = 4; g.beginPath(); g.arc(48, 48, 27, 0, 6.3); g.stroke(); g.fillStyle = "#fff0b0"; g.beginPath(); g.ellipse(36, 34, 9, 6, -0.6, 0, 6.3); g.fill();
});
/** a lump of coal: black, faceted, a blue-grey sheen on its facets */
export const coalTex = () => ctex("dxCoal", 96, 96, (g, r) => {
  g.clearRect(0, 0, 96, 96); const pts: [number, number][] = []; for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283, rr = 24 + r() * 16; pts.push([48 + Math.cos(a) * rr, 48 + Math.sin(a) * rr * 0.85]); }
  g.fillStyle = "#26242a"; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.fillStyle = "#5a6070"; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.lineTo(48, 44); g.lineTo(pts[1][0], pts[1][1]); g.closePath(); g.fill();
  g.strokeStyle = "#0e0c10"; g.lineWidth = 5; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
});
/** a punctuation mark flying out of the pepper pot: big, black, with a white outline so it reads on any wall */
export const markTex = (ch: string) => ctex("dxMark_" + ch.charCodeAt(0), 128, 128, (g) => {
  g.clearRect(0, 0, 128, 128); g.font = "900 120px Georgia, 'DejaVu Serif', serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 14; g.strokeStyle = "#fffaf0"; g.strokeText(ch, 64, 60); g.fillStyle = "#1e1a22"; g.fillText(ch, 64, 60);
});
/** red brick with pale mortar */
export const brickTex = () => ctex("dxBrick", 512, 512, (g, r) => {
  g.fillStyle = "#d8cbb4"; g.fillRect(0, 0, 512, 512);
  for (let y = 0, row = 0; y < 512; y += 32, row++) for (let x = -(row % 2) * 32; x < 512; x += 64) { const c = ["#9a4a34", "#a8563c", "#8a3e2c", "#b06048"][Math.floor(r() * 4)]; g.fillStyle = c; g.fillRect(x + 3, y + 3, 58, 26); }
});

// ---------------- Dubois ----------------
/** the Wind River sky: blue overhead, a pale band at the horizon, the snowy Absaroka / Wind River peaks behind a line of
 *  red-and-cream striped badlands, sage flats below the horizon (the cylinder's foot, under the far ground) */
export const wySkyTex = (kind: "day" | "today" | "dusk") => ctex("dbSky_" + kind, 2048, 1024, (g, r) => {
  const W = 2048, H = 1024, HZ = 880;
  const [a, b, c] = kind === "dusk" ? ["#4a5a8a", "#c88a6a", "#f2c890"] : kind === "today" ? ["#4f86c6", "#9cc2e4", "#e4ecee"] : ["#5a8ec8", "#a6c8e4", "#ece8dc"];
  const gr = g.createLinearGradient(0, 0, 0, HZ); gr.addColorStop(0, a); gr.addColorStop(0.62, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, W, HZ);
  for (let i = 0; i < 18; i++) { const x = r() * W, y = 120 + r() * 420, w = 160 + r() * 320; for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? "rgba(255,255,255,0.55)" : "rgba(226,232,240,0.42)"; g.beginPath(); g.ellipse(x + (r() - 0.5) * w * 0.6, y + (r() - 0.5) * 30, w * (0.3 + 0.3 * r()), 16 + r() * 20, 0, 0, 6.3); g.fill(); } }
  // far peaks: a jagged blue-grey range with snow on every summit and gully lines down the faces (wraps at the seam)
  const ridge = (y0: number, amp: number, n: number, col: string, snow: number, seed: number) => {
    const pts: [number, number][] = []; for (let k = 0; k <= n; k++) { const x = (k / n) * W, s = Math.sin(k * 1.7 + seed) * 0.5 + Math.sin(k * 0.61 + seed * 2) * 0.5; pts.push([x, y0 - amp * (0.45 + 0.55 * Math.abs(s)) - (k % 2 ? 0 : amp * 0.25 * r())]); }
    pts[n][1] = pts[0][1];
    g.fillStyle = col; g.beginPath(); g.moveTo(0, HZ); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(W, HZ); g.closePath(); g.fill();
    // lit faces: a lighter wedge down the left of each peak
    for (let k = 1; k < n; k++) { const [x, y] = pts[k]; if (y > pts[k - 1][1] || y > pts[k + 1][1]) continue; g.fillStyle = "rgba(255,255,255,0.13)"; g.beginPath(); g.moveTo(x, y); g.lineTo(pts[k - 1][0], pts[k - 1][1]); g.lineTo(x - 10, y0 + 30); g.closePath(); g.fill();
      if (snow > 0) { g.fillStyle = "#f4f6f8"; g.beginPath(); g.moveTo(x, y); g.lineTo(x - snow * 1.1, y + snow * 0.9); g.lineTo(x - snow * 0.4, y + snow * 0.7); g.lineTo(x, y + snow * 1.05); g.lineTo(x + snow * 0.5, y + snow * 0.65); g.lineTo(x + snow * 1.0, y + snow * 0.85); g.closePath(); g.fill(); }
      g.strokeStyle = "rgba(40,50,70,0.25)"; g.lineWidth = 3; for (let q = 0; q < 3; q++) { g.beginPath(); g.moveTo(x + (q - 1) * 14, y + 26); g.lineTo(x + (q - 1) * 30 + (r() - 0.5) * 20, y0 + 10); g.stroke(); } } };
  ridge(770, 210, 26, "#7f8fa8", 46, 1.3);
  ridge(800, 120, 34, "#6a7a90", 26, 4.1);
  // the badlands: flat-topped buttes in red, cream and rust bands, eroded gullies down their fronts
  const bands = ["#b9533a", "#e4cfa8", "#c96a46", "#9a4232", "#e8d8b8", "#b86a4a"];
  for (let i = 0; i < 14; i++) { const x0 = (i / 14) * W + r() * 40, w = 90 + r() * 120, h = 40 + r() * 46, top = HZ - 6 - h;
    const sh: [number, number][] = [[x0, HZ], [x0 + w * 0.12, top + 8], [x0 + w * 0.2, top], [x0 + w * 0.78, top], [x0 + w * 0.9, top + 10], [x0 + w, HZ]];
    g.save(); g.beginPath(); sh.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    for (let k = 0; k < 7; k++) { g.fillStyle = bands[(k + i) % bands.length]; g.fillRect(x0 - 2, top + (k * h) / 7, w + 4, h / 7 + 1); }
    g.strokeStyle = "rgba(80,30,20,0.35)"; g.lineWidth = 3; for (let q = 0; q < 6; q++) { const gx = x0 + w * (0.15 + 0.7 * r()); g.beginPath(); g.moveTo(gx, top + 4); g.lineTo(gx + (r() - 0.5) * 10, HZ); g.stroke(); }
    g.fillStyle = "rgba(255,240,220,0.18)"; g.fillRect(x0, top, w * 0.35, h); g.restore(); }
  // the sage flats below the horizon, with dots of sagebrush
  const gg = g.createLinearGradient(0, HZ, 0, H); gg.addColorStop(0, "#9a9a72"); gg.addColorStop(1, "#7a7a58"); g.fillStyle = gg; g.fillRect(0, HZ, W, H - HZ);
  for (let i = 0; i < 700; i++) { g.fillStyle = r() > 0.5 ? "rgba(90,100,70,0.6)" : "rgba(170,170,130,0.5)"; g.beginPath(); g.ellipse(r() * W, HZ + 4 + r() * (H - HZ), 3 + r() * 6, 2 + r() * 3, 0, 0, 6.3); g.fill(); }
});
/** the wall board in Washington: the post office application (black ink: TIBO), the same form amended in red (DUBOIS),
 *  the map of the territories (Idaho next to Wyoming, the Horse Creek dot), and the 1937 newspaper */
export const doc = (kind: "app" | "red" | "map" | "news") => ctex("dbDoc_" + kind, 1300, 880, (g, r) => {
  const w = 1300, h = 880; oldPaper(g, r, w, h, kind === "news" ? "#e8e0cc" : "#efe2c2");
  if (kind === "map") {
    // Wyoming (41-45 N, 104.05-111.05 W) and Idaho beside it (east edge 111.05 W from 42 N to 44.5 N, then the Montana line); Horse Creek at 43.5 N, 109.6 W
    const WY: [number, number][] = [[690, 250], [1180, 250], [1180, 640], [690, 640]];
    const ID: [number, number][] = [[270, 542], [690, 542], [690, 299], [640, 282], [600, 232], [560, 202], [520, 122], [470, 62], [430, 30], [360, 30], [360, 120], [330, 200], [300, 300], [270, 360]];
    const poly = (pts: [number, number][], fill: string) => { g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = "#3a2a1a"; g.lineWidth = 7; g.lineJoin = "round"; g.stroke(); };
    poly(ID, "#e9b86a"); poly(WY, "#a8c88a");
    fitText(g, "IDAHO", 495, 430, 92, 300, "#7a3a10", undefined, "900"); fitText(g, "WYOMING", 960, 560, 96, 400, "#2a5a2a", undefined, "900");
    const [px, py] = [789, 393]; g.fillStyle = "#1e1a22"; g.beginPath(); g.arc(px, py, 18, 0, 6.3); g.fill(); g.fillStyle = "#e0332e"; g.beginPath(); g.arc(px, py, 10, 0, 6.3); g.fill();
    fitText(g, "HORSE CREEK", px + 90, py + 52, 40, 280, "#1e1a22", undefined, "900");
  } else if (kind === "news") {
    fitText(g, "THE CASPER TRIBUNE", w / 2, 110, 78, w - 160, "#1e1a22", undefined, "900");
    g.fillStyle = "#1e1a22"; g.fillRect(70, 160, w - 140, 6); fitText(g, "1937", w / 2, 196, 34, 200, "#3a3030", undefined, "700"); g.fillRect(70, 226, w - 140, 3);
    fitText(g, "\"I NAMED DUBOIS\"", w / 2, 320, 96, w - 160, "#1e1a22", undefined, "900");
    fitText(g, "says Jackson lawyer W. L. Simpson", w / 2, 410, 46, w - 260, "#3a3030", undefined, "700");
    g.fillStyle = "rgba(30,26,34,0.55)"; for (let col = 0; col < 3; col++) for (let k = 0; k < 9; k++) g.fillRect(90 + col * 390, 470 + k * 40, 340 - (k === 8 ? 140 : 0), 14);
  } else {
    g.strokeStyle = "#3a2a1a"; g.lineWidth = 8; g.strokeRect(24, 24, w - 48, h - 48);
    fitText(g, "POST OFFICE DEPARTMENT", w / 2, 92, 56, w - 200, "#2a1a10", undefined, "900");
    fitText(g, "Application for a new post office", w / 2, 152, 38, w - 260, "#4a3a2a", undefined, "400");
    g.fillStyle = "#3a2a1a"; g.fillRect(90, 186, w - 180, 3);
    const rows: [string, string][] = [["Territory:", "Wyoming"], ["County:", "Fremont"], ["Situated on:", "Horse Creek"], ["Postmaster:", "Chas. C. Smith"]];
    rows.forEach(([k, v], i) => { const y = 250 + i * 66; g.font = "400 38px Georgia, 'DejaVu Serif', serif"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "#4a3a2a"; g.fillText(k, 110, y); g.font = "italic 400 42px Georgia, 'DejaVu Serif', serif"; g.fillStyle = "#1e1a22"; g.fillText(v, 420, y); g.fillStyle = "rgba(58,42,26,0.5)"; g.fillRect(410, y + 24, 600, 2); });
    g.font = "400 42px Georgia, 'DejaVu Serif', serif"; g.textAlign = "left"; g.fillStyle = "#4a3a2a"; g.fillText("Proposed name:", 110, 560);
    // the name the settlers wrote, in black ink, big
    g.font = "italic 700 150px Georgia, 'DejaVu Serif', serif"; g.textAlign = "center"; g.fillStyle = "#1e1a22"; g.fillText("Tibo", 720, 600);
    if (kind === "red") {
      g.strokeStyle = "#c8201e"; g.lineWidth = 16; g.lineCap = "round"; g.beginPath(); g.moveTo(560, 610); g.lineTo(890, 586); g.stroke(); g.beginPath(); g.moveTo(570, 640); g.lineTo(880, 560); g.stroke();
      g.save(); g.translate(720, 760); g.rotate(-0.06); g.font = "italic 900 150px Georgia, 'DejaVu Serif', serif"; g.fillStyle = "#c8201e"; g.fillText("Dubois", 0, 0); g.restore();
    }
  }
  g.strokeStyle = "#5a4630"; g.lineWidth = 12; g.strokeRect(10, 10, w - 20, h - 20);
});
/** a mail sack's canvas: tan sackcloth with "U.S. MAIL" stencilled on it */
export const sackTex = () => ctex("dbSack", 256, 256, (g, r) => {
  g.fillStyle = "#c8b48a"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 400; i++) { g.fillStyle = r() > 0.5 ? "rgba(90,70,40,0.12)" : "rgba(255,250,230,0.12)"; g.fillRect(r() * 256, r() * 256, 2 + r() * 10, 1); }
  fitText(g, "U.S.", 128, 100, 64, 200, "#2a3a6a", undefined, "900"); fitText(g, "MAIL", 128, 160, 64, 200, "#2a3a6a", undefined, "900");
});
