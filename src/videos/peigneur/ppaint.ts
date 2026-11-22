// Painted textures for the Lake Peigneur Short: rock salt, the whirlpool's spiral, running water for the stream and the
// waterfall, the ground (one detail texture tinted by vertex colour), rusty hull steel, the derrick's paint.
import { ctex } from "../bridge/paint";

/** rock salt: grey-white with crystal glints and darker bands (the strata), two scales of detail */
export const saltTex = () => ctex("pgSalt", 1024, 1024, (g, r) => {
  g.fillStyle = "#cfcac0"; g.fillRect(0, 0, 1024, 1024);
  for (let b = 0; b < 9; b++) { const y = b * 118 + r() * 40, h = 14 + r() * 40; g.fillStyle = `rgba(${120 + r() * 40 | 0},${110 + r() * 30 | 0},${100 + r() * 30 | 0},${(0.16 + 0.2 * r()).toFixed(2)})`; g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + 10 * Math.sin(x * 0.01 + b)); for (let x = 1024; x >= 0; x -= 64) g.lineTo(x, y + h + 8 * Math.sin(x * 0.013 + b * 2)); g.closePath(); g.fill(); }
  for (let i = 0; i < 2600; i++) { const x = r() * 1024, y = r() * 1024, s = 3 + r() * 14; g.fillStyle = r() > 0.55 ? `rgba(255,255,255,${(0.25 + 0.5 * r()).toFixed(2)})` : `rgba(90,84,78,${(0.08 + 0.15 * r()).toFixed(2)})`;
    g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.7, y); g.lineTo(x, y + s * 0.6); g.lineTo(x - s * 0.6, y); g.closePath(); g.fill(); }
  // drill-face scoring from the mining machines
  for (let i = 0; i < 70; i++) { const x = r() * 1024, y = r() * 1024; g.strokeStyle = "rgba(110,100,92,0.18)"; g.lineWidth = 3 + r() * 4; g.beginPath(); g.arc(x, y, 60 + r() * 120, 0.2, 1.2 + r()); g.stroke(); }
});
/** the whirlpool seen from above: spiral streaks of foam on brown-green water (rotated by the world each frame) */
export const swirlTex = () => ctex("pgSwirl", 1024, 1024, (g, r) => {
  const c = 512; const gr = g.createRadialGradient(c, c, 20, c, c, 512); gr.addColorStop(0, "#1a1a16"); gr.addColorStop(0.25, "#3a3a2c"); gr.addColorStop(0.6, "#4e5a44"); gr.addColorStop(1, "#5e6e56");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let k = 0; k < 90; k++) { const a0 = r() * 6.283, w = 3 + r() * 9, al = 0.25 + 0.55 * r(); g.strokeStyle = r() > 0.3 ? `rgba(240,238,226,${al.toFixed(2)})` : `rgba(120,100,70,${al.toFixed(2)})`; g.lineWidth = w; g.lineCap = "round"; g.beginPath();
    for (let s = 0; s <= 60; s++) { const u = s / 60, rr = 500 * (1 - u) + 20, a = a0 + u * 7.5; const x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr; if (s) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
});
/** running water for ribbons (stream, waterfall, roof breach): streaks along v, scrolled by the world */
export const flowTex = (key: string, base: string, streak: string) => ctex("pgFlow_" + key, 256, 1024, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 256, 1024);
  for (let i = 0; i < 260; i++) { const x = r() * 256, y = r() * 1024, l = 40 + r() * 220, w = 2 + r() * 10; g.fillStyle = r() > 0.35 ? streak : "rgba(255,255,255,0.85)"; g.globalAlpha = 0.25 + 0.6 * r(); g.fillRect(x, y, w, l); g.fillRect(x, y - 1024, w, l); }
  g.globalAlpha = 1;
});
/** the ground: one neutral detail texture (grit, pebbles, cracks); the colour comes from vertex colours */
export const groundTex = () => ctex("pgGround", 1024, 1024, (g, r) => {
  g.fillStyle = "#d8d4cc"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 5200; i++) { const v = 150 + r() * 105 | 0; g.fillStyle = `rgba(${v},${v - 6},${v - 14},${(0.25 + 0.5 * r()).toFixed(2)})`; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 7, 2 + r() * 5); }
  for (let i = 0; i < 40; i++) { g.strokeStyle = "rgba(90,80,70,0.25)"; g.lineWidth = 2 + r() * 3; g.beginPath(); let x = r() * 1024, y = r() * 1024; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 120; y += (r() - 0.5) * 120; g.lineTo(x, y); } g.stroke(); }
});
/** rusty steel plate for hulls and tanks */
export const hullTex = (key: string, base: string) => ctex("pgHull_" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) { g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(0, y, 512, 3); }
  for (let i = 0; i < 120; i++) { const x = r() * 512, y = r() * 512; const gr = g.createLinearGradient(0, y, 0, y + 80 + r() * 90); gr.addColorStop(0, "rgba(140,70,30,0.55)"); gr.addColorStop(1, "rgba(140,70,30,0)"); g.fillStyle = gr; g.fillRect(x, y, 3 + r() * 6, 80 + r() * 90); }
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.06)" : "rgba(60,30,20,0.12)"; g.fillRect(r() * 512, r() * 512, 2 + r() * 6, 2 + r() * 4); }
});
/** the crater's wet mud walls */
export const mudTex = () => ctex("pgMud", 1024, 1024, (g, r) => {
  g.fillStyle = "#5a4a3a"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 60; i++) { const y = r() * 1024; g.fillStyle = r() > 0.5 ? "rgba(40,30,24,0.3)" : "rgba(130,110,84,0.25)"; g.fillRect(0, y, 1024, 6 + r() * 26); }
  for (let i = 0; i < 2400; i++) { g.fillStyle = r() > 0.5 ? "rgba(190,180,160,0.25)" : "rgba(30,24,20,0.2)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 6, 1 + r() * 3); }
  for (let i = 0; i < 140; i++) { const x = r() * 1024, y = r() * 1024, l = 30 + r() * 120; g.strokeStyle = "rgba(200,210,215,0.3)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 10, y + l); g.stroke(); }
});
/** Spanish moss hanging from the live oaks (a grey strand card) */
export const mossTex = () => ctex("pgMoss", 128, 256, (g, r) => {
  g.clearRect(0, 0, 128, 256);
  for (let i = 0; i < 40; i++) { const x = 20 + r() * 88, l = 80 + r() * 160; g.strokeStyle = `rgba(${150 + r() * 40 | 0},${158 + r() * 40 | 0},${140 + r() * 30 | 0},0.9)`; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, 0);
    for (let y = 0; y < l; y += 16) g.lineTo(x + 6 * Math.sin(y * 0.08 + i), y); g.stroke(); }
});
