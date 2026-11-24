// The Centralia Short's painted textures: asphalt, the crack, the pit's layered walls, coal, rubbish, a winter sky.
import * as THREE from "three";
import { ctex } from "../bridge/paint";

/** worn 1960s asphalt: grey with darker patches, tar seams, grit, a faded centre line along u */
export const asphaltTex = (worn = false) => ctex("ceAsphalt" + (worn ? "W" : ""), 1024, 1024, (g, r) => {
  g.fillStyle = worn ? "#6a6a66" : "#58585a"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 70; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,250,240,0.06)" : "rgba(20,20,24,0.1)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 50 + r() * 160, 30 + r() * 90, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = ["rgba(120,120,116,0.5)", "rgba(58,58,62,0.5)", "rgba(138,134,128,0.4)", "rgba(74,74,76,0.5)"][Math.floor(r() * 4)]; g.fillRect(r() * 1024, r() * 1024, 1 + r() * 2, 1 + r() * 2); }
  g.strokeStyle = "rgba(20,20,22,0.55)"; g.lineCap = "round"; for (let i = 0; i < (worn ? 26 : 8); i++) { let x = r() * 1024, y = r() * 1024, a = r() * 6.283; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { a += (r() - 0.5) * 1.3; x += Math.cos(a) * 40; y += Math.sin(a) * 40; g.lineTo(x, y); } g.stroke(); }
});
/** the road's centre line, a dashed yellow band (a separate strip so it stays crisp) */
export const lineTex = () => ctex("ceLine", 256, 64, (g, r) => { g.clearRect(0, 0, 256, 64); g.fillStyle = "rgba(226,190,70,0.85)"; g.fillRect(0, 20, 150, 24); for (let i = 0; i < 80; i++) { g.clearRect(r() * 150, 20 + r() * 24, 3, 3); } });

/** the crack: a jagged black split with broken edges; `hot` paints an orange glow deep inside. Alpha outside the split. */
export const crackTex = (hot: boolean) => ctex("ceCrack" + (hot ? "H" : ""), 1024, 256, (g, r) => {
  g.clearRect(0, 0, 1024, 256);
  const top: [number, number][] = [], bot: [number, number][] = [];
  for (let x = 0; x <= 1024; x += 16) { const w = (34 + 50 * Math.sin((x / 1024) * Math.PI)) * (0.75 + 0.4 * r()), c = 128 + 14 * Math.sin(x * 0.02) + (r() - 0.5) * 14; top.push([x, c - w]); bot.push([x, c + w]); }
  // broken lip: lighter asphalt chunks round the edge
  g.fillStyle = "#8a8680"; g.beginPath(); top.forEach(([x, y], i) => (i ? g.lineTo(x, y - 10 - r() * 8) : g.moveTo(x, y - 12))); [...bot].reverse().forEach(([x, y]) => g.lineTo(x, y + 10 + r() * 8)); g.closePath(); g.fill();
  g.fillStyle = "#1a1416"; g.beginPath(); top.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); [...bot].reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fill();
  if (hot) { for (let i = 0; i < 40; i++) { const x = 40 + r() * 944, c = 128 + 14 * Math.sin(x * 0.02), gr = g.createRadialGradient(x, c, 0, x, c, 34 + r() * 30); gr.addColorStop(0, "rgba(255,190,80,0.95)"); gr.addColorStop(0.5, "rgba(230,80,30,0.7)"); gr.addColorStop(1, "rgba(120,20,10,0)"); g.fillStyle = gr; g.fillRect(x - 60, c - 60, 120, 120); } }
  g.strokeStyle = "#120c16"; g.lineWidth = 5; g.beginPath(); top.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.beginPath(); bot.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
});

/** the strip-mine pit's wall: sandstone and shale in bands (fine scale), for the facets' big scale */
export const strataTex = () => ctex("ceStrata", 1024, 1024, (g, r) => {
  g.fillStyle = "#8a7660"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024;) { const h = 20 + r() * 70; g.fillStyle = ["rgba(120,96,70,0.5)", "rgba(80,70,64,0.45)", "rgba(150,126,94,0.4)", "rgba(96,84,70,0.5)"][Math.floor(r() * 4)]; g.fillRect(0, y, 1024, h); g.fillStyle = "rgba(40,30,24,0.35)"; g.fillRect(0, y, 1024, 2 + r() * 3); y += h; }
  for (let i = 0; i < 3000; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,236,200,0.08)" : "rgba(40,28,20,0.12)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 6, 2 + r() * 4); }
});
/** coal: near-black with blue-grey glints and fracture lines */
export const coalTex = () => ctex("ceCoal", 1024, 1024, (g, r) => {
  g.fillStyle = "#3a3842"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 900; i++) { const x = r() * 1024, y = r() * 1024, s = 6 + r() * 26; g.fillStyle = r() > 0.6 ? "rgba(170,180,200,0.3)" : "rgba(0,0,0,0.3)"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y + s * 0.3 * (r() - 0.5)); g.lineTo(x + s * 0.4, y + s * 0.6); g.closePath(); g.fill(); }
  g.strokeStyle = "rgba(170,180,200,0.22)"; g.lineWidth = 2; for (let i = 0; i < 60; i++) { const y = r() * 1024; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + 8 * Math.sin(x * 0.03 + i)); g.stroke(); }
});
/** glowing coal: the same with hot cracks */
export const emberTex = () => ctex("ceEmber", 512, 512, (g, r) => {
  g.fillStyle = "#2a1410"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) { const x = r() * 512, y = r() * 512, gr = g.createRadialGradient(x, y, 0, x, y, 20 + r() * 40); gr.addColorStop(0, "rgba(255,200,90,1)"); gr.addColorStop(0.4, "rgba(240,90,30,0.85)"); gr.addColorStop(1, "rgba(120,20,10,0)"); g.fillStyle = gr; g.fillRect(x - 70, y - 70, 140, 140); }
  g.strokeStyle = "rgba(20,8,6,0.8)"; g.lineWidth = 6; for (let i = 0; i < 26; i++) { let x = r() * 512, y = r() * 512, a = r() * 6.283; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { a += (r() - 0.5) * 1.4; x += Math.cos(a) * 34; y += Math.sin(a) * 34; g.lineTo(x, y); } g.stroke(); }
});
/** a winter sky (overcast, low cloud) and a hazy summer one */
export const ceSkyTex = (kind: "winter" | "haze") => ctex("ceSky_" + kind, 1024, 1024, (g, r) => {
  const [a, b, c] = kind === "winter" ? ["#8a96a6", "#b9c2cc", "#dfe3e6"] : ["#7aa0c8", "#b8cfe0", "#e6e2d6"];
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, a); gr.addColorStop(0.6, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 22; i++) { const x = r() * 1024, y = 200 + r() * 600, w = 140 + r() * 300; for (let k = 0; k < 5; k++) { g.fillStyle = kind === "winter" ? (k % 2 ? "rgba(240,242,246,0.4)" : "rgba(150,158,170,0.35)") : (k % 2 ? "rgba(255,255,255,0.55)" : "rgba(220,228,236,0.4)"); g.beginPath(); g.ellipse(x + (r() - 0.5) * w, y + (r() - 0.5) * 30, w * (0.3 + 0.3 * r()), 16 + r() * 26, 0, 0, 6.3); g.fill(); } }
});
/** patchy snow over frozen grass (the yard in February) */
export const snowGrassTex = () => ctex("ceSnowGrass", 1024, 1024, (g, r) => {
  g.fillStyle = "#6e6a50"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) { g.strokeStyle = ["#857e5a", "#5a5a40", "#9a9068"][Math.floor(r() * 3)]; g.lineWidth = 2; const x = r() * 1024, y = r() * 1024; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 8, y - 8 - r() * 10); g.stroke(); }
  for (let i = 0; i < 46; i++) { g.fillStyle = r() > 0.3 ? "rgba(236,240,244,0.92)" : "rgba(210,218,228,0.85)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 40 + r() * 150, 24 + r() * 80, r() * 3, 0, 6.3); g.fill(); }
});
/** the money: a stack-of-bills face */
export const billTex = () => ctex("ceBill", 256, 128, (g, r) => { g.fillStyle = "#7aa87a"; g.fillRect(0, 0, 256, 128); g.strokeStyle = "#2a4a2a"; g.lineWidth = 8; g.strokeRect(8, 8, 240, 112); g.fillStyle = "#2a4a2a"; g.font = "900 64px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", 128, 66); for (let i = 0; i < 60; i++) { g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(r() * 256, r() * 128, 6, 2); } });
export const rep = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.repeat.set(x, y); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.needsUpdate = true; return c; };
