// The Great Stink Short: painted surfaces. Every one has two scales of detail (a big form and a fine pattern on it).
import * as THREE from "three";
import { ctex } from "../bridge/paint";

const INK = "#241726";
const serif = (px: number, w = 900) => `${w} ${px}px Georgia, "Times New Roman", "DejaVu Serif", serif`;
const grain = (g: CanvasRenderingContext2D, r: () => number, S: number, n: number, dark: string, light: string, vertical = false) => {
  for (let i = 0; i < n; i++) { g.strokeStyle = r() > 0.5 ? dark : light; g.lineWidth = 1 + r() * 2; const a = r() * S, b = r() * S, l = 40 + r() * 160; g.beginPath();
    if (vertical) { g.moveTo(a, b); g.bezierCurveTo(a + 4 * (r() - 0.5), b + l / 3, a + 4 * (r() - 0.5), b + (2 * l) / 3, a, b + l); } else { g.moveTo(a, b); g.bezierCurveTo(a + l / 3, b + 4 * (r() - 0.5), a + (2 * l) / 3, b + 4 * (r() - 0.5), a + l, b); }
    g.stroke(); }
};
const speck = (g: CanvasRenderingContext2D, r: () => number, S: number, n: number, a = 0.2) => { for (let i = 0; i < n; i++) { g.fillStyle = r() > 0.5 ? `rgba(255,236,200,${a})` : `rgba(30,18,12,${a * 1.2})`; g.fillRect(r() * S, r() * S, 2 + r() * 4, 2 + r() * 3); } };

/** dark oak panelling: raised panels with a bevel, grain running up */
export const panelTex = () => ctex("skPanel", 1024, 1024, (g, r) => {
  g.fillStyle = "#6a4930"; g.fillRect(0, 0, 1024, 1024); grain(g, r, 1024, 500, "rgba(40,24,14,0.3)", "rgba(190,140,90,0.14)", true);
  for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) { const x = i * 256 + 26, y = j * 512 + 34, w = 204, h = 444;
    g.fillStyle = "rgba(30,16,10,0.55)"; g.fillRect(x - 8, y - 8, w + 16, h + 16); g.fillStyle = "#77543a"; g.fillRect(x, y, w, h);
    g.fillStyle = "rgba(255,214,160,0.2)"; g.fillRect(x, y, w, 9); g.fillRect(x, y, 9, h); g.fillStyle = "rgba(20,10,6,0.36)"; g.fillRect(x, y + h - 9, w, 9); g.fillRect(x + w - 9, y, 9, h);
    // a pointed arch cut into each panel
    g.strokeStyle = "rgba(30,16,10,0.6)"; g.lineWidth = 7; g.beginPath(); g.moveTo(x + 34, y + h - 40); g.lineTo(x + 34, y + 150); g.quadraticCurveTo(x + 40, y + 70, x + w / 2, y + 40); g.quadraticCurveTo(x + w - 40, y + 70, x + w - 34, y + 150); g.lineTo(x + w - 34, y + h - 40); g.closePath(); g.stroke();
    g.strokeStyle = "rgba(255,214,160,0.16)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 40, y + h - 46); g.lineTo(x + 40, y + 152); g.stroke(); }
  speck(g, r, 1024, 1800, 0.1);
});
/** flock wallpaper: deep red with a gold diaper pattern */
export const wallpaperTex = () => ctex("skPaper", 512, 512, (g, r) => {
  g.fillStyle = "#6e2028"; g.fillRect(0, 0, 512, 512);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = i * 128 + (j % 2) * 64, y = j * 128 + 64;
    for (const dx of [0, -512, 512]) { g.strokeStyle = "rgba(214,170,84,0.75)"; g.lineWidth = 5; g.beginPath(); g.moveTo(x + dx, y - 48); g.quadraticCurveTo(x + dx + 34, y, x + dx, y + 48); g.quadraticCurveTo(x + dx - 34, y, x + dx, y - 48); g.stroke();
      g.fillStyle = "rgba(214,170,84,0.8)"; g.beginPath(); g.arc(x + dx, y, 9, 0, 6.3); g.fill(); g.beginPath(); g.arc(x + dx + 64, y - 64, 5, 0, 6.3); g.fill(); } }
  for (let i = 0; i < 2200; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,200,180,0.06)" : "rgba(20,4,8,0.14)"; g.fillRect(r() * 512, r() * 512, 3, 5); }
});
/** the carpet: green field, gold border and motifs, worn patches */
export const carpetTex = () => ctex("skCarpet", 1024, 1024, (g, r) => {
  g.fillStyle = "#2f5a3c"; g.fillRect(0, 0, 1024, 1024);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const x = i * 128 + 64, y = j * 128 + 64; g.fillStyle = (i + j) % 2 ? "#c9a24a" : "#8a2f2a"; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x + 22, y); g.lineTo(x, y + 30); g.lineTo(x - 22, y); g.closePath(); g.fill(); g.strokeStyle = "rgba(20,40,26,0.6)"; g.lineWidth = 3; g.stroke(); }
  for (let i = 0; i < 6000; i++) { g.fillStyle = r() > 0.5 ? "rgba(220,240,200,0.07)" : "rgba(8,20,12,0.16)"; g.fillRect(r() * 1024, r() * 1024, 4, 2); }
  for (let i = 0; i < 12; i++) { g.fillStyle = "rgba(190,180,140,0.1)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 60 + r() * 90, 30 + r() * 50, r() * 3, 0, 6.3); g.fill(); }
});
/** buttoned green leather */
export const leatherTex = () => ctex("skLeather", 512, 512, (g, r) => {
  g.fillStyle = "#35634a"; g.fillRect(0, 0, 512, 512);
  for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) { const x = i * 128 + (j % 2) * 64 - 64, y = j * 128; const gr = g.createRadialGradient(x, y, 4, x, y, 92); gr.addColorStop(0, "rgba(10,24,16,0.6)"); gr.addColorStop(0.4, "rgba(10,24,16,0.12)"); gr.addColorStop(1, "rgba(140,200,160,0.12)"); g.fillStyle = gr; g.fillRect(x - 96, y - 96, 192, 192);
    g.fillStyle = "#c9a24a"; g.beginPath(); g.arc(x, y, 8, 0, 6.3); g.fill(); g.strokeStyle = "rgba(10,24,16,0.7)"; g.lineWidth = 3; g.stroke(); }
  speck(g, r, 512, 900, 0.08);
});
/** a heavy crimson curtain, pleats running down, a gold band near the hem. Wet: soaked dark from the top down, chalky
 *  white runs and tide marks from the lime, drips gathering at the hem. */
export const curtainTex = (wet: boolean) => ctex("skCurtain" + (wet ? "W" : "D"), 256, 1024, (g, r) => {
  g.fillStyle = wet ? "#5c1a22" : "#9a2630"; g.fillRect(0, 0, 256, 1024);
  for (let i = 0; i < 6; i++) { const x = i * 42.7; const gr = g.createLinearGradient(x, 0, x + 42.7, 0); gr.addColorStop(0, "rgba(255,170,150,0.18)"); gr.addColorStop(0.45, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(20,0,6,0.5)"); g.fillStyle = gr; g.fillRect(x, 0, 42.7, 1024); }
  g.fillStyle = "#c9a24a"; g.fillRect(0, 900, 256, 26); g.fillStyle = "rgba(60,36,10,0.6)"; for (let x = 0; x < 256; x += 16) g.fillRect(x, 900, 3, 26);
  for (let x = 4; x < 256; x += 10) { g.strokeStyle = "#c9a24a"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 1000); g.lineTo(x + (r() - 0.5) * 4, 1024); g.stroke(); }
  if (wet) {
    for (let i = 0; i < 46; i++) { const x = r() * 256, y0 = r() * 500, l = 200 + r() * 520; const gr = g.createLinearGradient(0, y0, 0, y0 + l); gr.addColorStop(0, "rgba(240,236,220,0)"); gr.addColorStop(0.3, "rgba(240,236,220,0.5)"); gr.addColorStop(1, "rgba(240,236,220,0.06)"); g.strokeStyle = gr; g.lineWidth = 3 + r() * 7; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + 6 * (r() - 0.5), y0 + l / 3, x + 6 * (r() - 0.5), y0 + (2 * l) / 3, x + 8 * (r() - 0.5), y0 + l); g.stroke(); }
    for (let i = 0; i < 26; i++) { g.fillStyle = "rgba(238,232,214,0.34)"; g.beginPath(); g.ellipse(r() * 256, 120 + r() * 800, 14 + r() * 30, 8 + r() * 16, r() * 3, 0, 6.3); g.fill(); }
    const gr = g.createLinearGradient(0, 700, 0, 1024); gr.addColorStop(0, "rgba(20,0,6,0)"); gr.addColorStop(1, "rgba(20,0,6,0.5)"); g.fillStyle = gr; g.fillRect(0, 700, 256, 324);
  }
  for (let i = 0; i < 1200; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,200,190,0.07)" : "rgba(30,0,8,0.14)"; g.fillRect(r() * 256, r() * 1024, 2, 6); }
});
/** what the windows look onto: a hot, hazy sky, the far bank in silhouette, the brown river */
export const riverViewTex = () => ctex("skView", 1024, 512, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#c9d2c4"); gr.addColorStop(0.42, "#efe2ae"); gr.addColorStop(0.62, "#e6cf94"); gr.addColorStop(0.64, "#a8906a"); gr.addColorStop(1, "#7a6238"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  const sun = g.createRadialGradient(700, 150, 10, 700, 150, 300); sun.addColorStop(0, "rgba(255,250,220,0.95)"); sun.addColorStop(0.2, "rgba(255,244,200,0.5)"); sun.addColorStop(1, "rgba(255,240,190,0)"); g.fillStyle = sun; g.fillRect(0, 0, 1024, 512);
  for (const [y, col, h] of [[322, "rgba(176,160,128,0.75)", 26], [330, "rgba(140,124,100,0.85)", 40]] as [number, string, number][]) { g.fillStyle = col; let x = 0; while (x < 1024) { const w = 20 + r() * 60, hh = h * (0.4 + r() * 0.8); g.fillRect(x, y - hh, w, hh + 8); if (r() > 0.6) g.fillRect(x + w / 2 - 3, y - hh - 22 - r() * 26, 6, 30); x += w; } }
  for (let i = 0; i < 160; i++) { g.strokeStyle = r() > 0.5 ? "rgba(230,210,150,0.3)" : "rgba(70,54,30,0.3)"; g.lineWidth = 2; const x = r() * 1024, y = 340 + r() * 170; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 + r() * 80, y); g.stroke(); }
});
/** the river: brown-green murk, slow ripples, scum and floating bits */
export const waterTex = () => { const t = ctex("skWater", 1024, 1024, (g, r) => {
  const S = 1024; g.fillStyle = "#6a5a34"; g.fillRect(0, 0, S, S);
  const wrap = (x: number, y: number, rad: number, f: (x: number, y: number) => void) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) if (x + dx > -rad && x + dx < S + rad && y + dy > -rad && y + dy < S + rad) f(x + dx, y + dy); };
  for (let i = 0; i < 40; i++) { const x = r() * S, y = r() * S, rx = 90 + r() * 200, ry = 30 + r() * 70, c = r() > 0.5 ? "rgba(96,104,50,0.4)" : "rgba(60,44,22,0.4)"; wrap(x, y, 300, (xx, yy) => { g.fillStyle = c; g.beginPath(); g.ellipse(xx, yy, rx, ry, 0, 0, 6.3); g.fill(); }); }
  g.lineCap = "round";
  for (let i = 0; i < 520; i++) { const x = r() * S, y = r() * S, l = 30 + r() * 90; g.strokeStyle = r() > 0.45 ? "rgba(214,196,130,0.38)" : "rgba(30,22,10,0.4)"; g.lineWidth = 2 + r() * 3; wrap(x, y, 130, (xx, yy) => { g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + l / 2, yy + 5 * (r() - 0.5), xx + l, yy); g.stroke(); }); }
  for (let i = 0; i < 70; i++) { const x = r() * S, y = r() * S, s = 8 + r() * 22; wrap(x, y, 40, (xx, yy) => { g.fillStyle = "rgba(188,186,120,0.5)"; g.beginPath(); g.ellipse(xx, yy, s * 1.6, s * 0.6, 0, 0, 6.3); g.fill(); g.fillStyle = "rgba(226,222,170,0.5)"; g.beginPath(); g.ellipse(xx - 2, yy - 1, s, s * 0.35, 0, 0, 6.3); g.fill(); }); }
  for (let i = 0; i < 90; i++) { g.fillStyle = r() > 0.5 ? "#3a2c18" : "#8a7a52"; g.fillRect(r() * S, r() * S, 4 + r() * 10, 3 + r() * 4); }
}); return t; };
/** river mud: dark, wet, lumpy, with shine and litter */
export const mudTex = () => ctex("skMud", 1024, 1024, (g, r) => {
  g.fillStyle = "#4a3a26"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 90; i++) { g.fillStyle = r() > 0.5 ? "rgba(30,22,14,0.4)" : "rgba(110,92,60,0.3)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 30 + r() * 110, 14 + r() * 50, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 260; i++) { const x = r() * 1024, y = r() * 1024, s = 6 + r() * 20; g.fillStyle = "rgba(20,14,8,0.5)"; g.beginPath(); g.ellipse(x + 2, y + 3, s, s * 0.5, 0, 0, 6.3); g.fill(); g.fillStyle = "rgba(200,190,150,0.26)"; g.beginPath(); g.ellipse(x - 2, y - 2, s * 0.6, s * 0.2, 0, 0, 6.3); g.fill(); }
  speck(g, r, 1024, 4000, 0.16);
});
/** the building's river front, 8 m to the tile: honey stone, two bays by two storeys of tall traceried windows */
export const facadeTex = () => ctex("skFacade", 1024, 1024, (g, r) => {
  g.fillStyle = "#d8bf8c"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < 1024; x += 64) { const v = 0.94 + 0.12 * r(); g.fillStyle = `rgba(${Math.round(216 * v)},${Math.round(190 * v)},${Math.round(140 * v)},1)`; g.fillRect(x + 1, y + 1, 62, 30); }
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const x = i * 512 + 256, y = j * 512;
    g.fillStyle = "#b89f70"; g.fillRect(i * 512, y + 468, 512, 44); g.fillStyle = "rgba(60,40,20,0.35)"; g.fillRect(i * 512, y + 506, 512, 6); g.fillStyle = "rgba(255,240,200,0.3)"; g.fillRect(i * 512, y + 468, 512, 5);
    for (let k = 0; k < 8; k++) { g.strokeStyle = "rgba(90,66,36,0.5)"; g.lineWidth = 4; g.strokeRect(i * 512 + 8 + k * 62, y + 474, 54, 28); }
    // the window: a pointed opening, dark glass, a mullion and tracery
    g.fillStyle = "#2c2a30"; g.beginPath(); g.moveTo(x - 92, y + 430); g.lineTo(x - 92, y + 170); g.quadraticCurveTo(x - 80, y + 70, x, y + 36); g.quadraticCurveTo(x + 80, y + 70, x + 92, y + 170); g.lineTo(x + 92, y + 430); g.closePath(); g.fill();
    g.strokeStyle = "#a88c5a"; g.lineWidth = 14; g.stroke(); g.strokeStyle = "#cdb480"; g.lineWidth = 10; g.beginPath(); g.moveTo(x, y + 60); g.lineTo(x, y + 430); g.moveTo(x - 92, y + 250); g.lineTo(x + 92, y + 250); g.stroke();
    g.beginPath(); g.arc(x, y + 120, 34, 0, 6.3); g.stroke(); g.fillStyle = "rgba(180,200,220,0.2)"; g.fillRect(x - 76, y + 270, 60, 120);
    for (const sx of [-1, 1]) { g.fillStyle = "#c2a878"; g.fillRect(x + sx * 196 - 30, y, 60, 468); g.fillStyle = "rgba(60,40,20,0.3)"; g.fillRect(x + sx * 196 + (sx > 0 ? 22 : -30), y, 8, 468); g.strokeStyle = "rgba(90,66,36,0.45)"; g.lineWidth = 4; for (let k = 0; k < 5; k++) g.strokeRect(x + sx * 196 - 20, y + 16 + k * 90, 40, 74); }
  }
  for (let i = 0; i < 60; i++) { const x = r() * 1024, y0 = r() * 900; const gr = g.createLinearGradient(0, y0, 0, y0 + 160); gr.addColorStop(0, "rgba(40,30,20,0.26)"); gr.addColorStop(1, "rgba(40,30,20,0)"); g.fillStyle = gr; g.fillRect(x, y0, 8 + r() * 16, 160); }
  speck(g, r, 1024, 2600, 0.1);
});
/** brick, 3 m to the tile. Soot: London stock brick blackened; clean: the new sewer's red engineering brick */
export const brickTex = (key: string, cols: string[], mortar: string, soot = 0) => ctex(key, 1024, 1024, (g, r) => {
  g.fillStyle = mortar; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 32) for (let x = -64; x < 1024; x += 64) { const xx = x + ((y / 32) % 2) * 32; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(xx + 3, y + 3, 58, 26);
    g.fillStyle = "rgba(255,230,200,0.14)"; g.fillRect(xx + 3, y + 3, 58, 4); g.fillStyle = "rgba(20,10,8,0.2)"; g.fillRect(xx + 3, y + 25, 58, 4); if (r() > 0.86) { g.fillStyle = "rgba(20,10,10,0.28)"; g.fillRect(xx + 3, y + 3, 58, 26); } }
  if (soot) { for (let i = 0; i < 70; i++) { const x = r() * 1024, y0 = r() * 800; const gr = g.createLinearGradient(0, y0, 0, y0 + 300); gr.addColorStop(0, `rgba(16,12,12,${0.5 * soot})`); gr.addColorStop(1, "rgba(16,12,12,0)"); g.fillStyle = gr; g.fillRect(x, y0, 20 + r() * 70, 300); }
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(16,12,12,${0.3 * soot})`; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 60 + r() * 120, 40 + r() * 90, r() * 3, 0, 6.3); g.fill(); } }
  speck(g, r, 1024, 2400, 0.12);
});
/** a stencilled or painted label (crate, barrel, board): cream or timber ground, dark letters, up to three lines split on | */
export const labelTex = (s: string, bg = "#c9a060", fg = "rgba(52,28,18,0.92)", wide = 2) => ctex("skLabel_" + s + bg, 256 * wide, 256, (g, r) => {
  const W = 256 * wide; g.fillStyle = bg; g.fillRect(0, 0, W, 256);
  for (let k = 0; k < 30; k++) { g.strokeStyle = "rgba(60,36,16,0.22)"; g.lineWidth = 1 + r() * 2; const y = r() * 256; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W / 3, y + 8 * (r() - 0.5), (2 * W) / 3, y + 8 * (r() - 0.5), W, y); g.stroke(); }
  g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(8, 8, W - 16, 240);
  const ls = s.split("|"); g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  ls.forEach((l, i) => { let px = ls.length > 2 ? 62 : ls.length > 1 ? 84 : 120; g.font = serif(px); while (g.measureText(l).width > W - 50 && px > 24) { px -= 4; g.font = serif(px); } g.fillText(l, W / 2, 128 + (i - (ls.length - 1) / 2) * (ls.length > 2 ? 70 : 96)); });
});
/** the bill on the table: a sheet of parchment with a heading you can read */
export const billTex = () => ctex("skBill", 512, 720, (g, r) => {
  g.fillStyle = "#efe3c2"; g.fillRect(0, 0, 512, 720); g.strokeStyle = "#8a7448"; g.lineWidth = 8; g.strokeRect(4, 4, 504, 712);
  g.fillStyle = INK; g.textAlign = "center"; g.font = serif(64); g.fillText("AN ACT", 256, 96); g.font = serif(34, 700); g.fillText("for the MAIN DRAINAGE", 256, 152); g.fillText("of the METROPOLIS", 256, 196);
  g.fillRect(96, 222, 320, 5); g.strokeStyle = "rgba(36,23,38,0.7)"; g.lineWidth = 4;
  for (let y = 270; y < 600; y += 30) { g.beginPath(); g.moveTo(60, y); for (let x = 60; x < 452; x += 12) g.lineTo(x, y + 3 * Math.sin(x * 0.3 + y)); g.stroke(); }
  g.fillStyle = "#a02828"; g.beginPath(); g.arc(400, 640, 38, 0, 6.3); g.fill(); g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.arc(392, 632, 14, 0, 6.3); g.fill(); void r;
});
/** the engineer's drawing */
export const planTex = () => ctex("skPlan", 512, 360, (g) => {
  g.fillStyle = "#dfe6ea"; g.fillRect(0, 0, 512, 360); g.strokeStyle = "#3a5a7a"; g.lineWidth = 6; g.strokeRect(6, 6, 500, 348);
  g.fillStyle = "#2a4460"; g.textAlign = "center"; g.font = serif(40); g.fillText("MAIN DRAINAGE", 256, 56);
  g.strokeStyle = "#2a4460"; g.lineWidth = 5; g.beginPath(); g.ellipse(160, 210, 78, 100, 0, 0, 6.3); g.stroke(); g.beginPath(); g.ellipse(160, 210, 60, 82, 0, 0, 6.3); g.stroke();
  g.lineWidth = 4; g.beginPath(); g.moveTo(280, 130); g.lineTo(470, 130); g.moveTo(280, 290); g.lineTo(470, 290); g.moveTo(280, 130); g.lineTo(280, 290); g.stroke(); for (let x = 300; x < 470; x += 28) { g.beginPath(); g.moveTo(x, 130); g.lineTo(x, 290); g.stroke(); }
});
/** a gilt-framed portrait of a whiskered gentleman */
export const portraitTex = (k: number) => ctex("skPortrait" + k, 256, 320, (g) => {
  g.fillStyle = "#b8923c"; g.fillRect(0, 0, 256, 320); g.fillStyle = "#8a6a24"; g.fillRect(10, 10, 236, 300); g.fillStyle = "#d9b860"; g.fillRect(18, 18, 220, 284);
  g.fillStyle = ["#2c3a34", "#3a2a2c", "#2a2e3e"][k % 3]; g.fillRect(30, 30, 196, 260);
  g.fillStyle = ["#1c1a20", "#3a2a1a", "#24303a"][k % 3]; g.beginPath(); g.ellipse(128, 300, 86, 110, 0, 0, 6.3); g.fill();
  g.fillStyle = "#e8c8a4"; g.beginPath(); g.arc(128, 140, 46, 0, 6.3); g.fill(); g.fillStyle = ["#d9d4c8", "#3a2a20", "#8a8a92"][k % 3]; g.beginPath(); g.arc(128, 118, 48, 3.3, 6.1); g.fill(); g.fillRect(84, 136, 14, 46); g.fillRect(158, 136, 14, 46);
  g.fillStyle = "#f4f0e6"; g.fillRect(112, 186, 32, 26);
});
/** a clock face */
export const clockTex = (key = "skClock", face = "#f3e9d2") => ctex(key, 512, 512, (g) => {
  g.clearRect(0, 0, 512, 512); g.fillStyle = "#3a2c1c"; g.beginPath(); g.arc(256, 256, 250, 0, 6.3); g.fill(); g.fillStyle = "#c9a24a"; g.beginPath(); g.arc(256, 256, 232, 0, 6.3); g.fill(); g.fillStyle = face; g.beginPath(); g.arc(256, 256, 210, 0, 6.3); g.fill();
  g.fillStyle = INK; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.save(); g.translate(256 + 176 * Math.sin(a), 256 - 176 * Math.cos(a)); g.rotate(a); g.fillRect(-7, -22, 14, 44); g.restore(); }
  g.strokeStyle = INK; g.lineCap = "round"; g.lineWidth = 20; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + 96, 256 - 56); g.stroke(); g.lineWidth = 12; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 - 30, 256 - 150); g.stroke();
});
/** soft round puff (smoke, haze, the stink) */
export const puffTex = () => ctex("skPuff", 256, 256, (g, r) => { g.clearRect(0, 0, 256, 256); for (let i = 0; i < 9; i++) { const x = 128 + (r() - 0.5) * 110, y = 128 + (r() - 0.5) * 110, rr = 46 + r() * 34; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.6, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 6.3); g.fill(); } });
/** a wavy stink line with a curl on top (drawn over the picture, like a cartoon smell) */
export const stinkTex = () => ctex("skStink", 128, 512, (g) => { g.clearRect(0, 0, 128, 512); g.lineCap = "round"; g.lineJoin = "round";
  for (const [w, c] of [[30, "rgba(36,23,38,0.85)"], [18, "#b9c84a"]] as [number, string][]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(64, 490); for (let y = 490; y > 110; y -= 8) g.lineTo(64 + 30 * Math.sin((490 - y) * 0.03), y); g.quadraticCurveTo(110, 60, 70, 40); g.quadraticCurveTo(40, 30, 44, 62); g.stroke(); } });
/** a white sheet of paper or card */
export const sheetTex = () => ctex("skSheet", 128, 160, (g) => { g.clearRect(0, 0, 128, 160); g.fillStyle = "#f6f1e4"; g.fillRect(12, 12, 104, 136); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(12, 12, 104, 136); g.strokeStyle = "rgba(36,23,38,0.5)"; g.lineWidth = 4; for (let y = 40; y < 130; y += 18) { g.beginPath(); g.moveTo(28, y); g.lineTo(100, y); g.stroke(); } });
/** a handkerchief: a white cloth bunched in a fist */
export const hankyTex = () => ctex("skHanky", 128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.fillStyle = "#fbf8f0"; g.strokeStyle = INK; g.lineWidth = 9; g.lineJoin = "round"; g.beginPath(); g.moveTo(22, 40); g.quadraticCurveTo(64, 10, 106, 36); g.lineTo(112, 84); g.lineTo(92, 74); g.lineTo(80, 112); g.lineTo(60, 80); g.lineTo(38, 108); g.lineTo(30, 78); g.lineTo(14, 84); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = "rgba(36,23,38,0.35)"; g.lineWidth = 4; g.beginPath(); g.moveTo(50, 40); g.lineTo(56, 74); g.moveTo(78, 38); g.lineTo(82, 70); g.stroke(); });
/** a drop of lime wash */
export const dropTex = () => ctex("skDrop", 64, 96, (g) => { g.clearRect(0, 0, 64, 96); g.fillStyle = "#f4f0e2"; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(32, 8); g.quadraticCurveTo(58, 56, 32, 86); g.quadraticCurveTo(6, 56, 32, 8); g.fill(); g.stroke(); });
/** a round glow for lamps */
export const glowTex = () => ctex("skGlow", 256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.2, "rgba(255,255,255,0.4)"); gr.addColorStop(0.5, "rgba(255,255,255,0.1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
/** a shaft of light: bright at the window (v = 1), gone by the floor, soft at the sides */
export const shaftTex = () => ctex("skShaft", 128, 256, (g) => { g.clearRect(0, 0, 128, 256); for (let y = 0; y < 256; y++) { const a = Math.pow(1 - y / 255, 1.3); const gr = g.createLinearGradient(0, 0, 128, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, `rgba(255,255,255,${a.toFixed(3)})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, y, 128, 1); } });
/** washing on a line: one garment */
export const clothTex = (k: number) => ctex("skCloth" + k, 128, 160, (g, r) => { g.clearRect(0, 0, 128, 160); const c = ["#b9b2a0", "#8a4a44", "#56708a", "#a89468", "#c9c2b0", "#6a7a5a"][k % 6]; g.fillStyle = c; g.strokeStyle = "rgba(36,23,38,0.8)"; g.lineWidth = 6; g.lineJoin = "round"; g.beginPath();
  if (k % 2) { g.moveTo(14, 12); g.lineTo(114, 12); g.lineTo(108, 150); g.lineTo(20, 146); } else { g.moveTo(6, 16); g.lineTo(44, 10); g.lineTo(84, 10); g.lineTo(122, 16); g.lineTo(112, 60); g.lineTo(94, 52); g.lineTo(98, 150); g.lineTo(30, 150); g.lineTo(34, 52); g.lineTo(16, 60); }
  g.closePath(); g.fill(); g.stroke(); for (let i = 0; i < 5; i++) { g.fillStyle = "rgba(40,30,24,0.18)"; g.fillRect(20 + r() * 80, 30 + r() * 100, 14, 10); } });
/** a tenement window: dark panes, a frame, sometimes a rag stuffed in a broken pane */
export const tenWinTex = (k: number) => ctex("skTenWin" + k, 128, 192, (g) => { g.fillStyle = "#3a3026"; g.fillRect(0, 0, 128, 192); g.fillStyle = k % 3 === 0 ? "#6a5a30" : "#1c1a1e"; g.fillRect(10, 10, 108, 172); g.strokeStyle = "#5a4a3a"; g.lineWidth = 8; g.beginPath(); g.moveTo(64, 10); g.lineTo(64, 182); g.moveTo(10, 96); g.lineTo(118, 96); g.stroke(); if (k % 2) { g.fillStyle = "#8a7a62"; g.fillRect(14, 104, 44, 40); } g.fillStyle = "rgba(200,210,220,0.12)"; g.fillRect(70, 16, 40, 70); });
export const repT = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.repeat.set(x, y); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.needsUpdate = true; return c; };
