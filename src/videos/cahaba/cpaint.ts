// Painted textures for the Cahaba bridge Short: the reward notice, newspaper front pages, the bridge drawing,
// a records folder, rusted iron, masonry, the winter skies, gravel.
import * as THREE from "three";
import { ctex } from "../bridge/paint";

const INK = "#120c16";
const serif = (px: number, w = 900) => `${w} ${px}px Georgia, "Times New Roman", "DejaVu Serif", serif`;
const fit = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, maxW: number, col: string, w = 900) => { g.font = serif(px, w); while (g.measureText(s).width > maxW && px > 10) { px -= 2; g.font = serif(px, w); } g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y); };
const paper = (g: CanvasRenderingContext2D, r: () => number, W: number, Hh: number, base: string) => { g.fillStyle = base; g.fillRect(0, 0, W, Hh); for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,250,235,0.12)" : "rgba(90,60,30,0.06)"; g.fillRect(r() * W, r() * Hh, 2 + r() * 8, 1 + r() * 3); }
  const gr = g.createRadialGradient(W / 2, Hh / 2, Math.min(W, Hh) * 0.3, W / 2, Hh / 2, Math.max(W, Hh) * 0.75); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(90,60,30,0.22)"); g.fillStyle = gr; g.fillRect(0, 0, W, Hh); };
const rules = (g: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number, step: number, r: () => number) => { g.strokeStyle = "rgba(30,22,26,0.55)"; g.lineWidth = 3; for (let y = y0; y < y1; y += step) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1 - (r() > 0.8 ? (x1 - x0) * 0.4 * r() : 0), y); g.stroke(); } };

/** the reward notice. q: the three wanted men drawn as blank outlines with question marks */
export const posterTex = (q = false) => ctex("caPoster" + (q ? "Q" : ""), 768, 1024, (g, r) => {
  paper(g, r, 768, 1024, "#efe2c2"); g.strokeStyle = INK; g.lineWidth = 14; g.strokeRect(22, 22, 724, 980); g.lineWidth = 4; g.strokeRect(44, 44, 680, 936);
  fit(g, "$10,000", 384, 190, 210, 640, "#b3261e"); fit(g, "REWARD", 384, 372, 150, 640, INK);
  g.fillStyle = INK; g.fillRect(90, 462, 588, 8);
  if (q) { for (let k = 0; k < 3; k++) { const x = 190 + k * 194, y = 640; g.fillStyle = "rgba(18,12,22,0.14)"; g.strokeStyle = INK; g.lineWidth = 7; g.setLineDash([16, 12]); g.beginPath(); g.arc(x, y - 60, 46, 0, 6.3); g.stroke(); g.beginPath(); g.moveTo(x - 76, y + 130); g.quadraticCurveTo(x - 70, y + 6, x, y + 2); g.quadraticCurveTo(x + 70, y + 6, x + 76, y + 130); g.stroke(); g.setLineDash([]); fit(g, "?", x, y - 56, 78, 80, "#b3261e"); }
    fit(g, "THREE MEN. NO NAMES.", 384, 850, 46, 600, INK); }
  else { fit(g, "for the arrest and evidence to convict", 384, 528, 40, 600, INK, 700); fit(g, "the party or parties who wrecked", 384, 584, 40, 600, INK, 700); fit(g, "THE BRIDGE", 384, 676, 96, 600, INK); fit(g, "over the Cahaba River", 384, 764, 52, 600, INK, 700); fit(g, "Sunday, Dec. 27, 1896", 384, 834, 44, 600, INK, 700); }
  g.fillStyle = INK; g.fillRect(90, 892, 588, 6); fit(g, "THE RAILROAD", 384, 940, 44, 600, INK);
});
/** a newspaper front page: masthead, a big headline (lines split on |), columns of type */
export const newsTex = (head: string, mast = "THE DAILY NEWS") => ctex("caNews_" + head, 768, 1024, (g, r) => {
  paper(g, r, 768, 1024, "#e9e2cf"); fit(g, mast, 384, 78, 74, 700, INK); g.fillStyle = INK; g.fillRect(30, 128, 708, 6); g.fillRect(30, 142, 708, 2);
  const ls = head.split("|"); ls.forEach((l, i) => fit(g, l, 384, 236 + i * 150, ls.length > 1 ? 136 : 170, 700, i === 0 ? "#b3261e" : INK));
  const y0 = 220 + ls.length * 150; g.fillStyle = INK; g.fillRect(30, y0, 708, 4);
  for (let c = 0; c < 3; c++) rules(g, 40 + c * 238, 40 + c * 238 + 212, y0 + 34, 990, 22, r);
});
/** the bridge drawing from the files: white line on blue, the main span ringed in red */
export const blueprintTex = () => ctex("caBlue", 1024, 640, (g, r) => {
  g.fillStyle = "#1f4a7a"; g.fillRect(0, 0, 1024, 640); for (let i = 0; i < 500; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"; g.fillRect(r() * 1024, r() * 640, 3 + r() * 20, 1 + r() * 2); }
  g.strokeStyle = "rgba(230,240,255,0.9)"; g.lineWidth = 4; g.lineCap = "round";
  const yT = 250, yB = 330; g.beginPath(); g.moveTo(60, yT); g.lineTo(964, yT); g.stroke();
  for (const [x0, x1] of [[330, 600], [600, 870]]) { g.beginPath(); g.moveTo(x0, yB); g.lineTo(x1, yB); g.stroke(); const n = 6; for (let k = 0; k <= n; k++) { const x = x0 + ((x1 - x0) * k) / n; g.beginPath(); g.moveTo(x, yT); g.lineTo(x, yB); g.stroke(); if (k < n) { const xn = x0 + ((x1 - x0) * (k + 1)) / n; g.beginPath(); g.moveTo(x, k < n / 2 ? yT : yB); g.lineTo(xn, k < n / 2 ? yB : yT); g.stroke(); } } }
  for (const x of [330, 600, 870]) { g.beginPath(); g.moveTo(x - 22, yB); g.lineTo(x - 34, 560); g.lineTo(x + 34, 560); g.lineTo(x + 22, yB); g.closePath(); g.stroke(); }
  for (let x = 80; x < 330; x += 42) { g.beginPath(); g.moveTo(x, yT); g.lineTo(x - 8, 300 + (x - 80) * 0.9); g.stroke(); } for (let x = 900; x < 970; x += 34) { g.beginPath(); g.moveTo(x, yT); g.lineTo(x + 6, 300 + (964 - x) * 1.6); g.stroke(); }
  g.beginPath(); g.moveTo(40, 560); g.lineTo(984, 560); g.stroke();
  g.font = serif(34, 700); g.fillStyle = "rgba(230,240,255,0.9)"; g.textAlign = "left"; g.fillText("CAHABA RIVER BRIDGE", 60, 70); g.font = serif(24, 700); g.fillText("ELEVATION", 60, 108);
  g.strokeStyle = "#ff4a3a"; g.lineWidth = 10; g.beginPath(); g.ellipse(465, 290, 170, 86, -0.05, 0, 6.3); g.stroke(); g.font = serif(96); g.fillStyle = "#ff4a3a"; g.textAlign = "center"; g.fillText("?", 465, 190);
});
/** a manila records folder with a typed tab */
export const folderTex = (label: string) => ctex("caFolder_" + label, 512, 384, (g, r) => { paper(g, r, 512, 384, "#d9b877"); g.strokeStyle = "rgba(60,36,16,0.6)"; g.lineWidth = 6; g.strokeRect(8, 8, 496, 368);
  g.fillStyle = "#f3ecd8"; g.fillRect(70, 110, 372, 150); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(70, 110, 372, 150); const ls = label.split("|"); ls.forEach((l, i) => fit(g, l, 256, 185 + (i - (ls.length - 1) / 2) * 56, 50, 340, INK)); });
/** rusted, painted iron: red oxide with streaks and rivet rows */
export const ironTex = () => ctex("caIron", 512, 512, (g, r) => { g.fillStyle = "#6a3328"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 260; i++) { const x = r() * 512, y = r() * 512; const gr = g.createLinearGradient(0, y, 0, y + 120); gr.addColorStop(0, r() > 0.5 ? "rgba(40,18,14,0.35)" : "rgba(170,90,50,0.3)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x, y, 4 + r() * 14, 120); }
  for (let y = 32; y < 512; y += 64) for (let x = 16; x < 512; x += 32) { g.fillStyle = "rgba(30,14,10,0.6)"; g.beginPath(); g.arc(x, y, 4, 0, 6.3); g.fill(); g.fillStyle = "rgba(255,190,150,0.35)"; g.beginPath(); g.arc(x - 1, y - 1, 2, 0, 6.3); g.fill(); } });
/** coursed grey masonry (the piers): big blocks, lighter chipped edges, water stains running down */
export const pierTex = () => ctex("caPier", 1024, 1024, (g, r) => { g.fillStyle = "#5c5750"; g.fillRect(0, 0, 1024, 1024); const cols = ["#a39a8c", "#978e80", "#b0a798", "#8c8478", "#a89e8e"];
  for (let y = 0; y < 1024; y += 128) for (let x = -128; x < 1024; x += 256) { const xx = x + ((y / 128) % 2) * 128; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(xx + 5, y + 5, 246, 118); g.fillStyle = "rgba(255,245,225,0.18)"; g.fillRect(xx + 5, y + 5, 246, 10); g.fillStyle = "rgba(30,24,20,0.22)"; g.fillRect(xx + 5, y + 110, 246, 13);
    for (let k = 0; k < 26; k++) { g.fillStyle = r() > 0.5 ? "rgba(255,245,225,0.1)" : "rgba(30,24,20,0.12)"; g.fillRect(xx + 8 + r() * 236, y + 8 + r() * 108, 4 + r() * 16, 3 + r() * 8); } }
  for (let i = 0; i < 26; i++) { const x = r() * 1024, y0 = r() * 500; const gr = g.createLinearGradient(0, y0, 0, y0 + 520); gr.addColorStop(0, "rgba(36,40,34,0.34)"); gr.addColorStop(1, "rgba(36,40,34,0)"); g.fillStyle = gr; g.fillRect(x, y0, 12 + r() * 50, 520); } });
/** river gravel and leaf litter: pebbles of many sizes on brown earth */
export const gravelTex = () => ctex("caGravel", 1024, 1024, (g, r) => { g.fillStyle = "#7a6a56"; g.fillRect(0, 0, 1024, 1024); for (let i = 0; i < 60; i++) { g.fillStyle = r() > 0.5 ? "rgba(96,80,60,0.5)" : "rgba(140,124,100,0.4)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 60 + r() * 140, 40 + r() * 90, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 2600; i++) { const s = 2 + r() * (r() > 0.93 ? 16 : 6), x = r() * 1024, y = r() * 1024; g.fillStyle = ["#a89a86", "#8c7e6c", "#b9ad9a", "#6a5c4c", "#9a8a70"][Math.floor(r() * 5)]; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, 6.3); g.fill(); g.fillStyle = "rgba(30,22,16,0.35)"; g.beginPath(); g.ellipse(x + 1, y + s * 0.55, s, s * 0.25, 0, 0, 6.3); g.fill(); }
  for (let i = 0; i < 160; i++) { g.fillStyle = ["#8a4a22", "#a8662a", "#6a3a1a"][Math.floor(r() * 3)]; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 7, 4, r() * 3, 0, 6.3); g.fill(); } });
/** the winter hillside: brown leaf litter, grey rock showing through, dark seams */
export const slopeTex = () => ctex("caSlope", 1024, 1024, (g, r) => { g.fillStyle = "#6e5a44"; g.fillRect(0, 0, 1024, 1024); for (let i = 0; i < 90; i++) { g.fillStyle = ["rgba(120,112,100,0.55)", "rgba(88,70,50,0.5)", "rgba(140,104,62,0.35)", "rgba(70,74,56,0.4)"][Math.floor(r() * 4)]; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 50 + r() * 170, 26 + r() * 70, r() * 0.6 - 0.3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 40; i++) { g.strokeStyle = "rgba(30,24,20,0.4)"; g.lineWidth = 2 + r() * 3; const x = r() * 1024, y = r() * 1024; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 60 + r() * 160, y + (r() - 0.5) * 40); g.stroke(); }
  for (let i = 0; i < 2200; i++) { g.fillStyle = ["#8a5a2a", "#a8763a", "#5a4630", "#9a9284", "#70684e"][Math.floor(r() * 5)]; g.fillRect(r() * 1024, r() * 1024, 3 + r() * 7, 2 + r() * 4); } });
/** skies: a cold clear morning, the evening after, night, a mild day */
export const caSkyTex = (kind: "morn" | "dusk" | "night" | "day") => ctex("caSky_" + kind, 1024, 1024, (g, r) => {
  const st: Record<string, [string, string, string]> = { morn: ["#6f93bd", "#b5cbdc", "#f6dcb4"], dusk: ["#2b3558", "#8a5f72", "#f0a25e"], night: ["#0a1026", "#1a2446", "#3f4a6c"], day: ["#5f95cf", "#a9cbe6", "#e6eef2"] };
  const [a, b, c] = st[kind], gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, a); gr.addColorStop(0.6, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  if (kind === "night" || kind === "dusk") for (let i = 0; i < (kind === "night" ? 420 : 90); i++) { const y = r() * 620; g.fillStyle = `rgba(255,255,255,${(0.3 + 0.6 * r()).toFixed(2)})`; g.fillRect(r() * 1024, y, r() > 0.94 ? 3 : 1.5, r() > 0.94 ? 3 : 1.5); }
  const n = kind === "night" ? 6 : 16, cc = kind === "morn" ? ["rgba(255,244,226,0.5)", "rgba(246,200,160,0.35)"] : kind === "dusk" ? ["rgba(250,170,110,0.4)", "rgba(110,80,110,0.4)"] : kind === "night" ? ["rgba(60,70,100,0.4)", "rgba(40,50,80,0.4)"] : ["rgba(255,255,255,0.6)", "rgba(220,230,240,0.45)"];
  for (let i = 0; i < n; i++) { const x = r() * 1024, y = 380 + r() * 420, w = 120 + r() * 260; for (let k = 0; k < 5; k++) { g.fillStyle = cc[k % 2]; g.beginPath(); g.ellipse(x + (r() - 0.5) * w, y + (r() - 0.5) * 24, w * (0.3 + 0.3 * r()), 14 + r() * 22, 0, 0, 6.3); g.fill(); } }
});
/** a small enamel or painted sign */
export const signTex = (s: string, bg: string, fg: string, w = 1024, h = 256) => ctex("caSign_" + s + bg, w, h, (g, r) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); for (let i = 0; i < 50; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"; g.fillRect(0, r() * h, w, 2 + r() * 4); } g.lineWidth = 10; g.strokeStyle = fg; g.strokeRect(10, 10, w - 20, h - 20);
  const ls = s.split("|"); ls.forEach((l, i) => fit(g, l, w / 2, h * (i + 1) / (ls.length + 1), (h * 0.62) / ls.length, w - 60, fg)); });
/** coach side: varnished boards, a letterboard */
export const coachTex = (name: string, col: string) => ctex("caCoach_" + name + col, 1024, 256, (g, r) => { g.fillStyle = col; g.fillRect(0, 0, 1024, 256); for (let x = 0; x < 1024; x += 32) { g.fillStyle = r() > 0.5 ? "rgba(255,230,190,0.07)" : "rgba(0,0,0,0.1)"; g.fillRect(x, 0, 30, 256); g.fillStyle = "rgba(0,0,0,0.28)"; g.fillRect(x + 30, 0, 2, 256); }
  g.fillStyle = "rgba(20,12,10,0.5)"; g.fillRect(0, 0, 1024, 14); g.fillRect(0, 242, 1024, 14); if (name) fit(g, name, 512, 128, 110, 900, "#e9c876"); });
export const repC = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.repeat.set(x, y); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.needsUpdate = true; return c; };
