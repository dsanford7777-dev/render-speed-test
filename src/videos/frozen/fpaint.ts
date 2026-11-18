// The Frozen Graves Short: painted textures for its own sets and props (two scales on every surface: a broad
// mottle, then fine grit, flecks or grain on top). Labels, glows, puffs and paper come from ./paint (shared with Stink).
import * as THREE from "three";
import { ctex } from "../bridge/paint";

const INK = "#120c16";
const font = (px: number) => `900 ${px}px "Montserrat", "Arial Black", Arial, sans-serif`;
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, col: string, align: CanvasTextAlign = "center") => { g.font = font(px); g.textAlign = align; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y); };

/** wind-packed snow: blue-grey drifts, raised ridges (sastrugi) that catch the light, sparkle */
export const snowTex = (key = "frSnow") => ctex(key, 1024, 1024, (g, r) => {
  g.fillStyle = "#e6edf4"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 70; i++) { g.fillStyle = r() > 0.5 ? "rgba(150,170,200,0.10)" : "rgba(255,255,255,0.22)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 80 + r() * 200, 30 + r() * 70, r() * 0.6 - 0.3, 0, 6.3); g.fill(); }
  g.lineCap = "round";
  for (let i = 0; i < 260; i++) { const x = r() * 1024, y = r() * 1024, l = 40 + r() * 120, a = -0.2 + r() * 0.4;
    g.lineWidth = 5 + r() * 6; g.strokeStyle = "rgba(120,140,175,0.22)"; g.beginPath(); g.moveTo(x, y + 4); g.quadraticCurveTo(x + l * 0.5, y + 4 - 8 * r(), x + l * Math.cos(a), y + 4 + l * Math.sin(a)); g.stroke();
    g.lineWidth = 3; g.strokeStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l * 0.5, y - 8 * r(), x + l * Math.cos(a), y + l * Math.sin(a)); g.stroke(); }
  for (let i = 0; i < 3000; i++) { g.fillStyle = r() > 0.7 ? "rgba(255,255,255,0.95)" : "rgba(130,150,185,0.25)"; const s = 1 + r() * 2.5; g.fillRect(r() * 1024, r() * 1024, s, s); }
});

/** frost-shattered scree: grey-brown grit, flat stones of every size, a few tufts of dry moss */
export const screeTex = (key = "frScree") => ctex(key, 1024, 1024, (g, r) => {
  g.fillStyle = "#857a6e"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 60; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,240,215,0.08)" : "rgba(40,30,24,0.10)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 60 + r() * 160, 40 + r() * 100, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 5200; i++) { g.fillStyle = r() > 0.5 ? "rgba(225,215,200,0.3)" : "rgba(40,32,26,0.32)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 3, 2 + r() * 3); }
  for (let i = 0; i < 420; i++) { const x = r() * 1024, y = r() * 1024, s = 5 + r() * 16, n = 5 + Math.floor(r() * 3), a0 = r() * 6.3, sh = ["#9a9086", "#a8a096", "#7e746a", "#b3a99c", "#6e6560"][Math.floor(r() * 5)];
    const pts: [number, number][] = []; for (let k = 0; k < n; k++) { const a = a0 + (k * 6.283) / n, rr = s * (0.6 + 0.5 * r()); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7]); }
    g.fillStyle = "rgba(30,24,20,0.45)"; g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(px + 2, py + 3) : g.moveTo(px + 2, py + 3))); g.closePath(); g.fill();
    g.fillStyle = sh; g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,248,236,0.25)"; g.fillRect(x - s * 0.4, y - s * 0.35, s * 0.5, 2); }
  for (let i = 0; i < 60; i++) { const x = r() * 1024, y = r() * 1024; g.fillStyle = r() > 0.5 ? "rgba(120,124,70,0.55)" : "rgba(150,120,70,0.5)"; for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(x + (r() - 0.5) * 18, y + (r() - 0.5) * 12, 3 + r() * 4, 0, 6.3); g.fill(); } }
});

/** fresh-dug earth: dark brown, clods, stones, wet sheen */
export const earthTex = (key = "frEarth", base = "#5e4634") => ctex(key, 1024, 1024, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 80; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,220,180,0.07)" : "rgba(20,12,8,0.14)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 50 + r() * 130, 30 + r() * 80, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 700; i++) { const x = r() * 1024, y = r() * 1024, s = 4 + r() * 12; g.fillStyle = "rgba(20,12,8,0.45)"; g.beginPath(); g.ellipse(x + 2, y + 3, s, s * 0.7, 0, 0, 6.3); g.fill(); g.fillStyle = r() > 0.6 ? "#7a5e48" : "#6a5040"; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, 6.3); g.fill(); g.fillStyle = "rgba(255,230,200,0.18)"; g.fillRect(x - s * 0.4, y - s * 0.4, s * 0.6, 2); }
  for (let i = 0; i < 90; i++) { const x = r() * 1024, y = r() * 1024, s = 4 + r() * 8; g.fillStyle = "#a59a8c"; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, 6.3); g.fill(); }
});

/** permafrost seen in the cut: ice-bound earth, blue-white veins and crystals */
export const iceEarthTex = () => ctex("frIceEarth", 1024, 1024, (g, r) => {
  g.fillStyle = "#8fa6bc"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 70; i++) { g.fillStyle = r() > 0.5 ? "rgba(230,242,255,0.18)" : "rgba(60,70,90,0.14)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 70 + r() * 150, 30 + r() * 70, r() * 0.8, 0, 6.3); g.fill(); }
  g.lineCap = "round";
  for (let i = 0; i < 70; i++) { let x = r() * 1024, y = r() * 1024; g.strokeStyle = "rgba(245,252,255,0.75)"; g.lineWidth = 2 + r() * 4; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 90; y += 20 + r() * 50; g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 380; i++) { const x = r() * 1024, y = r() * 1024, s = 3 + r() * 9; g.fillStyle = "rgba(70,62,58,0.55)"; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 1800; i++) { g.fillStyle = "rgba(255,255,255,0.8)"; const s = 1 + r() * 2; g.fillRect(r() * 1024, r() * 1024, s, s); }
});

/** the thawing top layer seen in the cut: brown, wet, with water beads */
export const mudCutTex = () => ctex("frMudCut", 1024, 1024, (g, r) => {
  g.fillStyle = "#6a5240"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024;) { const h = 20 + r() * 60; g.fillStyle = r() > 0.5 ? "rgba(40,26,16,0.16)" : "rgba(255,226,190,0.08)"; g.fillRect(0, y, 1024, h * 0.6); y += h; }
  for (let i = 0; i < 520; i++) { const x = r() * 1024, y = r() * 1024, s = 4 + r() * 12; g.fillStyle = r() > 0.5 ? "#8a7a6a" : "#4a3a2e"; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 260; i++) { const x = r() * 1024, y = r() * 1024; g.fillStyle = "rgba(190,220,240,0.6)"; g.beginPath(); g.arc(x, y, 2 + r() * 3, 0, 6.3); g.fill(); g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(x - 1, y - 2, 2, 2); }
});

/** tundra in late summer: olive and rust mosses, pale lichen, dark wet patches, dwarf willow sprigs */
export const tundraTex = () => ctex("frTundra", 1024, 1024, (g, r) => {
  g.fillStyle = "#7d7448"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 140; i++) { g.fillStyle = ["rgba(150,90,50,0.22)", "rgba(90,100,50,0.25)", "rgba(220,214,180,0.18)", "rgba(50,46,30,0.18)"][Math.floor(r() * 4)]; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 30 + r() * 120, 20 + r() * 70, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 2200; i++) { const x = r() * 1024, y = r() * 1024; g.strokeStyle = r() > 0.5 ? "rgba(190,170,100,0.55)" : "rgba(60,58,30,0.5)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 8, y - 6 - r() * 8); g.stroke(); }
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(230,226,200,0.6)" : "rgba(170,60,40,0.5)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 3, 2 + r() * 3); }
});

/** a dark winter sky: deep blue at the top, a pale band at the horizon, stars, and (for the 1918 night) a faint aurora */
export const skyTex = (kind: "night" | "grey" | "twilight" | "dusk") => ctex("frSky_" + kind, 1024, 1024, (g, r) => {
  const st: Record<string, [string, string, string]> = { night: ["#0b1430", "#1e2c58", "#5a6a8e"], grey: ["#8c99a8", "#b7c1cb", "#dfe3e6"], twilight: ["#26365e", "#7d6f96", "#f0b89a"], dusk: ["#2a3a5e", "#5a6a8e", "#c9b6a6"] };
  const [a, b, c] = st[kind], gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, a); gr.addColorStop(0.62, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  if (kind === "night" || kind === "twilight" || kind === "dusk") for (let i = 0; i < (kind === "night" ? 520 : 140); i++) { const y = r() * 700, s = r() > 0.95 ? 3 : 1.5; g.fillStyle = `rgba(255,255,255,${(0.35 + 0.6 * r() * (1 - y / 900)).toFixed(2)})`; g.fillRect(r() * 1024, y, s, s); }
  if (kind === "night") for (let k = 0; k < 3; k++) { g.save(); g.globalCompositeOperation = "lighter"; for (let x = 0; x < 1024; x += 3) { const y0 = 220 + 90 * Math.sin(x * 0.006 + k * 1.7) + 30 * Math.sin(x * 0.019 + k), h = 160 + 60 * Math.sin(x * 0.011 + k * 2.1);
      const gg = g.createLinearGradient(0, y0 - h, 0, y0); gg.addColorStop(0, "rgba(60,200,140,0)"); gg.addColorStop(0.8, `rgba(70,210,150,${(0.10 - k * 0.02).toFixed(2)})`); gg.addColorStop(1, "rgba(70,210,150,0)"); g.fillStyle = gg; g.fillRect(x, y0 - h, 3, h); } g.restore(); }
  if (kind === "grey") for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.10)" : "rgba(100,110,125,0.08)"; g.beginPath(); g.ellipse(r() * 1024, r() * 640, 120 + r() * 220, 30 + r() * 50, 0, 0, 6.3); g.fill(); }
});

/** the black name plate on each cross */
export const plateTex = (k: number) => ctex("frPlate" + k, 256, 128, (g, r) => {
  g.fillStyle = "#1c1a20"; g.fillRect(0, 0, 256, 128); g.strokeStyle = "#d8c690"; g.lineWidth = 6; g.strokeRect(10, 10, 236, 108);
  g.fillStyle = "rgba(216,198,144,0.7)"; g.fillRect(40, 38, 120 + r() * 50, 9); text(g, "1918", 128, 84, 40, "#e8d8a6");
  void k;
});

/** tent canvas: off-white, seams, a few stains */
export const canvasTex = () => ctex("frCanvas", 512, 512, (g, r) => {
  g.fillStyle = "#eeeae0"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2400; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.4)" : "rgba(120,110,95,0.12)"; g.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2); }
  g.strokeStyle = "rgba(120,110,95,0.35)"; g.lineWidth = 3; for (const x of [128, 256, 384]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  for (let i = 0; i < 8; i++) { g.fillStyle = "rgba(150,130,100,0.08)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 40, 10 + r() * 20, 0, 0, 6.3); g.fill(); }
});

/** the radar cart's screen: the trace with seven bumps (one per coffin) */
export const radarTex = () => ctex("frRadar", 512, 320, (g) => {
  g.fillStyle = "#0c1a10"; g.fillRect(0, 0, 512, 320); g.strokeStyle = "rgba(90,200,110,0.25)"; g.lineWidth = 2;
  for (let x = 0; x < 512; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 320); g.stroke(); } for (let y = 0; y < 320; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  g.strokeStyle = "#7dff8e"; g.lineWidth = 6; g.beginPath();
  for (let x = 0; x <= 512; x += 4) { let y = 120; for (let k = 0; k < 7; k++) { const c = 50 + k * 68, d = (x - c) / 16; y += 70 * Math.exp(-d * d); } g.lineTo(x, y); } g.stroke();
  text(g, "7 COFFINS", 256, 280, 40, "#7dff8e");
});

/** the computer screen in the lab: rows of genetic letters, the last line in the reveal colour */
export const seqTex = (done: boolean) => ctex("frSeq" + (done ? "D" : "R"), 512, 384, (g, r) => {
  g.fillStyle = "#0c1420"; g.fillRect(0, 0, 512, 384);
  g.font = "700 26px monospace"; g.textAlign = "left"; g.textBaseline = "top";
  const L = "ACGT"; for (let y = 0; y < 11; y++) { let s = ""; for (let k = 0; k < 24; k++) s += L[Math.floor(r() * 4)]; g.fillStyle = y < 10 ? "rgba(140,220,255,0.85)" : "#ffd84d"; g.fillText(s, 26, 18 + y * 30); }
  if (done) { g.fillStyle = "rgba(12,20,32,0.82)"; g.fillRect(40, 130, 432, 120); g.strokeStyle = "#ffd84d"; g.lineWidth = 6; g.strokeRect(40, 130, 432, 120); text(g, "1918 FLU", 256, 172, 52, "#ffd84d"); text(g, "COMPLETE", 256, 220, 34, "#ffffff"); }
});

/** a cardboard parcel's top: tape, address block, FRAGILE */
export const parcelTex = () => ctex("frParcel", 512, 384, (g, r) => {
  g.fillStyle = "#c49a62"; g.fillRect(0, 0, 512, 384); for (let i = 0; i < 1200; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,230,190,0.2)" : "rgba(90,60,30,0.15)"; g.fillRect(r() * 512, r() * 384, 2, 2); }
  g.fillStyle = "rgba(220,200,150,0.75)"; g.fillRect(226, 0, 60, 384);
  g.fillStyle = "#f6f1e4"; g.fillRect(40, 40, 170, 110); g.fillStyle = "#5a4a3a"; for (let k = 0; k < 4; k++) g.fillRect(56, 62 + k * 22, 120 - k * 14, 8);
  g.save(); g.translate(380, 290); g.rotate(-0.12); g.strokeStyle = "#c9302c"; g.lineWidth = 8; g.strokeRect(-110, -36, 220, 72); text(g, "FRAGILE", 0, 2, 46, "#c9302c"); g.restore();
  text(g, "WASHINGTON DC", 380, 110, 30, INK);
});

/** small flag patches for the scientists' cases (the four countries) */
export const flagTex = (c: "ca" | "uk" | "us" | "no") => ctex("frFlag_" + c, 192, 128, (g) => {
  if (c === "ca") { g.fillStyle = "#d52b1e"; g.fillRect(0, 0, 192, 128); g.fillStyle = "#ffffff"; g.fillRect(48, 0, 96, 128); g.fillStyle = "#d52b1e"; g.beginPath(); g.moveTo(96, 24); g.lineTo(112, 56); g.lineTo(130, 50); g.lineTo(118, 80); g.lineTo(100, 78); g.lineTo(100, 104); g.lineTo(92, 104); g.lineTo(92, 78); g.lineTo(74, 80); g.lineTo(62, 50); g.lineTo(80, 56); g.closePath(); g.fill(); }
  if (c === "no") { g.fillStyle = "#ba0c2f"; g.fillRect(0, 0, 192, 128); g.fillStyle = "#ffffff"; g.fillRect(52, 0, 32, 128); g.fillRect(0, 48, 192, 32); g.fillStyle = "#00205b"; g.fillRect(60, 0, 16, 128); g.fillRect(0, 56, 192, 16); }
  if (c === "us") { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#b22234"; g.fillRect(0, (i * 128) / 13, 192, 128 / 13 + 1); } g.fillStyle = "#3c3b6e"; g.fillRect(0, 0, 84, 69); g.fillStyle = "#ffffff"; for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) g.fillRect(8 + x * 16, 8 + y * 16, 5, 5); }
  if (c === "uk") { g.fillStyle = "#012169"; g.fillRect(0, 0, 192, 128); g.strokeStyle = "#ffffff"; g.lineWidth = 26; g.beginPath(); g.moveTo(0, 0); g.lineTo(192, 128); g.moveTo(192, 0); g.lineTo(0, 128); g.stroke(); g.strokeStyle = "#c8102e"; g.lineWidth = 9; g.stroke();
    g.fillStyle = "#ffffff"; g.fillRect(78, 0, 36, 128); g.fillRect(0, 46, 192, 36); g.fillStyle = "#c8102e"; g.fillRect(86, 0, 20, 128); g.fillRect(0, 54, 192, 20); }
  g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(0, 0, 192, 128);
});

/** a cartoon flu virus: a round body with knobbed spikes, outlined; `dead` greys it and cracks it */
export const virusTex = (dead = false) => ctex("frVirus" + (dead ? "D" : "L"), 256, 256, (g, r) => {
  g.clearRect(0, 0, 256, 256); const body = dead ? "#8a8a84" : "#7fd25a", rim = dead ? "#5a5a56" : "#3f8f2c", knob = dead ? "#a8a49c" : "#e0533a";
  g.lineCap = "round";
  for (let k = 0; k < 14; k++) { const a = (k / 14) * 6.283 + 0.1, x0 = 128 + Math.cos(a) * 70, y0 = 128 + Math.sin(a) * 70, x1 = 128 + Math.cos(a) * 104, y1 = 128 + Math.sin(a) * 104;
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = rim; g.lineWidth = 8; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(x1, y1, 15, 0, 6.3); g.fill(); g.fillStyle = knob; g.beginPath(); g.arc(x1, y1, 10, 0, 6.3); g.fill(); }
  g.fillStyle = INK; g.beginPath(); g.arc(128, 128, 80, 0, 6.3); g.fill(); g.fillStyle = body; g.beginPath(); g.arc(128, 128, 72, 0, 6.3); g.fill();
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(104, 100, 26, 16, -0.6, 0, 6.3); g.fill();
  for (let i = 0; i < 9; i++) { g.fillStyle = dead ? "rgba(60,60,56,0.35)" : "rgba(40,110,30,0.35)"; g.beginPath(); g.arc(90 + r() * 80, 100 + r() * 70, 6 + r() * 8, 0, 6.3); g.fill(); }
  if (dead) { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(96, 70); g.lineTo(120, 120); g.lineTo(104, 150); g.lineTo(130, 190); g.stroke(); }
  else { g.fillStyle = INK; g.beginPath(); g.arc(106, 122, 9, 0, 6.3); g.arc(150, 122, 9, 0, 6.3); g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.beginPath(); g.arc(128, 140, 22, 0.2, Math.PI - 0.2); g.stroke(); }
});

/** a snowflake and a sun, for the seasons turning in the cut */
export const flakeTex = () => ctex("frFlake", 128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.lineCap = "round"; for (const [w, c] of [[14, INK], [7, "#e8f4ff"]] as [number, string][]) { g.strokeStyle = c; g.lineWidth = w; for (let k = 0; k < 3; k++) { const a = (k * Math.PI) / 3; g.beginPath(); g.moveTo(64 - Math.cos(a) * 48, 64 - Math.sin(a) * 48); g.lineTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48); g.stroke(); } } });
export const sunTex = () => ctex("frSun", 128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.lineCap = "round"; for (let k = 0; k < 10; k++) { const a = (k / 10) * 6.283; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(64 + Math.cos(a) * 34, 64 + Math.sin(a) * 34); g.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56); g.stroke(); g.strokeStyle = "#ffcf3a"; g.lineWidth = 7; g.stroke(); }
  g.fillStyle = INK; g.beginPath(); g.arc(64, 64, 30, 0, 6.3); g.fill(); g.fillStyle = "#ffcf3a"; g.beginPath(); g.arc(64, 64, 23, 0, 6.3); g.fill(); });

/** a wall calendar page */
export const calTex = (day: number) => ctex("frCal" + day, 256, 320, (g) => {
  g.fillStyle = "#f3ecdc"; g.fillRect(0, 0, 256, 320); g.fillStyle = "#b8332e"; g.fillRect(0, 0, 256, 80); text(g, "OKTOBER", 128, 30, 34, "#ffffff"); text(g, "1918", 128, 62, 26, "#ffffff");
  text(g, String(day), 128, 200, 150, INK); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(4, 4, 248, 312);
});

/** the hospital register: ruled columns, seven entries */
export const registerTex = () => ctex("frRegister", 512, 360, (g, r) => {
  g.fillStyle = "#f1e8d0"; g.fillRect(0, 0, 512, 360); g.strokeStyle = "rgba(90,70,50,0.4)"; g.lineWidth = 2;
  for (let y = 60; y < 360; y += 40) { g.beginPath(); g.moveTo(20, y); g.lineTo(492, y); g.stroke(); } g.beginPath(); g.moveTo(380, 30); g.lineTo(380, 340); g.stroke();
  text(g, "OKT 1918", 256, 32, 30, "#4a3a2a");
  const ages = [19, 22, 24, 21, 26, 23, 28];
  ages.forEach((a, k) => { g.fillStyle = "rgba(40,30,50,0.85)"; g.fillRect(36, 78 + k * 40, 140 + r() * 160, 8); text(g, String(a), 436, 82 + k * 40, 30, k === 6 ? "#b8332e" : "#2a2440"); });
});

/** a wooden sign board: light letters on dark paint */
export const boardTex = (s: string, bg = "#2c3a44", fg = "#f0e6c8", w = 1024, h = 256) => ctex("frBoard_" + s + bg, w, h, (g, r) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"; g.fillRect(0, r() * h, w, 2 + r() * 4); }
  g.lineWidth = 12; g.strokeStyle = "rgba(0,0,0,0.5)"; g.strokeRect(8, 8, w - 16, h - 16);
  const lines = s.split("|"); lines.forEach((ln, k) => text(g, ln, w / 2, h * (k + 1) / (lines.length + 1), Math.min(h * 0.46 / lines.length * 1.6, (w * 1.5) / Math.max(4, ln.length)), fg));
});

/** a lab coat-white wall with a dado stripe; tiled floor */
export const labWallTex = () => ctex("frLabWall", 512, 512, (g, r) => { g.fillStyle = "#e4e8e4"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 1400; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.4)" : "rgba(120,130,125,0.1)"; g.fillRect(r() * 512, r() * 512, 2, 2); } g.fillStyle = "#4f7a8a"; g.fillRect(0, 330, 512, 18); });
export const tileTex = () => ctex("frTile", 512, 512, (g, r) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#cfd3cd" : "#b9bfba"; g.fillRect(x * 64, y * 64, 64, 64); g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(x * 64 + 4, y * 64 + 4, 56, 4); } for (let i = 0; i < 2000; i++) { g.fillStyle = "rgba(60,60,60,0.12)"; g.fillRect(r() * 512, r() * 512, 2, 2); } g.strokeStyle = "rgba(80,80,80,0.5)"; g.lineWidth = 2; for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64, 512); g.moveTo(0, k * 64); g.lineTo(512, k * 64); g.stroke(); } });

/** foam ring where water meets a piling or a hull */
export const foamTex = () => ctex("frFoam", 256, 256, (g, r) => { g.clearRect(0, 0, 256, 256); for (let i = 0; i < 160; i++) { const a = r() * 6.283, d = 70 + r() * 40; g.fillStyle = `rgba(255,255,255,${(0.4 + 0.5 * r()).toFixed(2)})`; g.beginPath(); g.ellipse(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, 4 + r() * 9, 3 + r() * 5, a, 0, 6.3); g.fill(); } });

export const repeat = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.repeat.set(x, y); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.needsUpdate = true; return c; };

/** a pale blue face mask: pleats, a nose wire, ear loops */
export const maskTex = () => ctex("frMask", 192, 128, (g) => { g.clearRect(0, 0, 192, 128); g.fillStyle = "#cfe3f0"; g.beginPath(); g.moveTo(30, 22); g.quadraticCurveTo(96, 6, 162, 22); g.lineTo(166, 98); g.quadraticCurveTo(96, 124, 26, 98); g.closePath(); g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = "rgba(60,90,120,0.6)"; g.lineWidth = 4; for (const y of [48, 66, 84]) { g.beginPath(); g.moveTo(34, y); g.quadraticCurveTo(96, y + 6, 158, y); g.stroke(); } g.strokeStyle = "#9aa4ac"; g.lineWidth = 6; g.beginPath(); g.moveTo(70, 20); g.lineTo(122, 20); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(28, 30); g.lineTo(6, 56); g.lineTo(28, 90); g.moveTo(164, 30); g.lineTo(186, 56); g.lineTo(164, 90); g.stroke(); });
