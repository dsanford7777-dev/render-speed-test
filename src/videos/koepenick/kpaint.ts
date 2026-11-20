// Painted textures for the Captain of Koepenick Short: the board of offices by the town hall gate, the receipt, the
// passport, coins and notes, the towels, a shop window, newspaper fronts, the Kaiser's portrait, a flag.
import * as THREE from "three";
import { ctex } from "../bridge/paint";

const INK = "#120c16";
const serif = (px: number, w = 900) => `${w} ${px}px Georgia, "Times New Roman", "DejaVu Serif", serif`;
const script = (px: number) => `italic 700 ${px}px "URW Chancery L", "Z003", "DejaVu Serif", Georgia, serif`;
const fit = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, maxW: number, col: string, w = 900, font = serif) => {
  g.font = font(px, w); while (g.measureText(s).width > maxW && px > 10) { px -= 2; g.font = font(px, w); }
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y); };
const paper = (g: CanvasRenderingContext2D, r: () => number, W: number, H: number, base: string) => {
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 700; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,250,235,0.12)" : "rgba(90,60,30,0.06)"; g.fillRect(r() * W, r() * H, 2 + r() * 8, 1 + r() * 3); }
  const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(90,60,30,0.22)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); };

/** the enamel board beside the gate: the town hall's offices, one per line. No passport office on it. */
export const OFFICES = ["MAGISTRAT", "STADTKASSE", "STANDESAMT", "STEUERAMT", "BAUAMT", "POLIZEI"];
export const boardTex = () => ctex("kpBoard", 640, 900, (g, r) => {
  g.fillStyle = "#1e2a3a"; g.fillRect(0, 0, 640, 900);
  for (let i = 0; i < 300; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.08)"; g.fillRect(r() * 640, r() * 900, 3 + r() * 12, 1 + r() * 3); }
  g.strokeStyle = "#e9c876"; g.lineWidth = 12; g.strokeRect(16, 16, 608, 868); g.lineWidth = 3; g.strokeRect(34, 34, 572, 832);
  fit(g, "RATHAUS", 320, 110, 92, 520, "#e9c876"); fit(g, "CÖPENICK", 320, 190, 56, 520, "#e9c876", 700);
  g.fillStyle = "#e9c876"; g.fillRect(70, 236, 500, 5);
  OFFICES.forEach((s, i) => { fit(g, s, 320, 312 + i * 98, 66, 520, "#f3ecd8"); g.fillStyle = "rgba(233,200,118,0.35)"; g.fillRect(110, 312 + i * 98 + 44, 420, 2); });
});

/** the receipt, as signed: "von Malzahn, H. i. 1. G.R." */
export const receiptTex = () => ctex("kpReceipt", 768, 560, (g, r) => {
  paper(g, r, 768, 560, "#f1e8d0");
  g.strokeStyle = "rgba(30,22,26,0.7)"; g.lineWidth = 4; g.strokeRect(24, 24, 720, 512);
  fit(g, "QUITTUNG", 384, 82, 72, 600, INK);
  g.fillStyle = "rgba(30,22,26,0.45)"; for (let k = 0; k < 3; k++) g.fillRect(90, 150 + k * 52, 588, 3);
  fit(g, "4000 Mark 70 Pf. erhalten", 384, 136, 46, 560, "#22305a", 700, (px) => script(px));
  fit(g, "Cöpenick, 16. Oktober 1906", 384, 188, 40, 560, "#22305a", 700, (px) => script(px));
  g.fillStyle = "rgba(30,22,26,0.45)"; g.fillRect(160, 470, 448, 3);
  fit(g, "v. Malzahn", 384, 360, 120, 600, "#22305a", 700, (px) => script(px));
  fit(g, "H. i. 1. G.R.", 384, 440, 54, 500, "#22305a", 700, (px) => script(px));
});

/** the Luxembourg passport: a small dark-red booklet with a gold crest and lettering */
export const passportTex = () => ctex("kpPassport", 320, 440, (g, r) => {
  g.fillStyle = "#6a1a22"; g.fillRect(0, 0, 320, 440);
  for (let i = 0; i < 400; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"; g.fillRect(r() * 320, r() * 440, 2 + r() * 6, 1 + r() * 2); }
  g.strokeStyle = INK; g.lineWidth = 14; g.strokeRect(7, 7, 306, 426);
  g.strokeStyle = "#e9c876"; g.lineWidth = 4; g.strokeRect(26, 26, 268, 388);
  fit(g, "PASSEPORT", 160, 92, 50, 250, "#e9c876");
  g.fillStyle = "#e9c876"; g.beginPath(); g.moveTo(160, 160); g.lineTo(210, 190); g.lineTo(200, 270); g.lineTo(160, 300); g.lineTo(120, 270); g.lineTo(110, 190); g.closePath(); g.fill();
  g.fillStyle = "#6a1a22"; for (let k = 0; k < 5; k++) g.fillRect(124, 196 + k * 18, 72, 8);
  fit(g, "GRAND-DUCHÉ DE", 160, 340, 26, 250, "#e9c876", 700); fit(g, "LUXEMBOURG", 160, 378, 38, 250, "#e9c876");
});

/** a gold coin (Mark) and a banknote, as flying/held cards */
export const coinTex = () => ctex("kpCoin", 96, 96, (g) => { g.clearRect(0, 0, 96, 96); g.fillStyle = "#e8c45a"; g.beginPath(); g.arc(48, 48, 38, 0, 6.3); g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  g.strokeStyle = "rgba(120,80,20,0.8)"; g.lineWidth = 4; g.beginPath(); g.arc(48, 48, 26, 0, 6.3); g.stroke(); g.fillStyle = "rgba(120,80,20,0.9)"; g.font = serif(34); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("1", 48, 50); });
export const noteTex = () => ctex("kpNote", 192, 112, (g, r) => { g.clearRect(0, 0, 192, 112); g.fillStyle = "#b9c9a8"; g.fillRect(8, 8, 176, 96); for (let i = 0; i < 80; i++) { g.fillStyle = r() > 0.5 ? "rgba(40,70,40,0.18)" : "rgba(255,255,255,0.15)"; g.fillRect(8 + r() * 170, 8 + r() * 90, 3 + r() * 10, 1 + r() * 3); }
  g.strokeStyle = INK; g.lineWidth = 7; g.strokeRect(8, 8, 176, 96); g.strokeStyle = "rgba(40,70,40,0.8)"; g.lineWidth = 3; g.strokeRect(20, 20, 152, 72); g.fillStyle = "rgba(40,60,40,0.95)"; g.font = serif(36); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("100", 96, 58); });
/** a bath towel over a shoulder: white with two blue stripes */
export const towelTex = () => ctex("kpTowel", 128, 192, (g) => { g.clearRect(0, 0, 128, 192); g.fillStyle = "#f6f3ea"; g.beginPath(); g.moveTo(22, 10); g.lineTo(106, 10); g.lineTo(112, 182); g.lineTo(16, 182); g.closePath(); g.fill();
  g.fillStyle = "#3a6ab0"; g.fillRect(18, 128, 92, 12); g.fillRect(18, 150, 92, 8); g.strokeStyle = INK; g.lineWidth = 7; g.lineJoin = "round"; g.beginPath(); g.moveTo(22, 10); g.lineTo(106, 10); g.lineTo(112, 182); g.lineTo(16, 182); g.closePath(); g.stroke(); });
/** a sausage on a fork / in a hand */
export const sausageTex = () => ctex("kpSausage", 160, 64, (g) => { g.clearRect(0, 0, 160, 64); g.fillStyle = "#b8643a"; g.beginPath(); g.ellipse(80, 32, 66, 20, 0, 0, 6.3); g.fill(); g.fillStyle = "rgba(255,220,180,0.4)"; g.beginPath(); g.ellipse(70, 24, 46, 6, 0, 0, 6.3); g.fill();
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.ellipse(80, 32, 66, 20, 0, 0, 6.3); g.stroke(); });
/** a newspaper front: masthead, a red headline (lines split on |), columns */
export const newsTex = (head: string, mast: string) => ctex("kpNews_" + head + mast, 768, 1024, (g, r) => {
  paper(g, r, 768, 1024, "#e9e2cf"); fit(g, mast, 384, 78, 74, 700, INK); g.fillStyle = INK; g.fillRect(30, 128, 708, 6); g.fillRect(30, 142, 708, 2);
  const ls = head.split("|"); ls.forEach((l, i) => fit(g, l, 384, 236 + i * 150, ls.length > 1 ? 130 : 170, 700, i === 0 ? "#b3261e" : INK));
  const y0 = 220 + ls.length * 150; g.fillStyle = INK; g.fillRect(30, y0, 708, 4);
  // a cartoon of the captain: cap, moustache
  g.strokeStyle = INK; g.lineWidth = 7; g.fillStyle = "#f3e2c6"; g.beginPath(); g.arc(150, y0 + 170, 70, 0, 6.3); g.fill(); g.stroke();
  g.fillStyle = "#26304a"; g.fillRect(70, y0 + 74, 160, 46); g.strokeRect(70, y0 + 74, 160, 46); g.fillStyle = "#c0353a"; g.fillRect(84, y0 + 104, 132, 14);
  g.fillStyle = "#eeeeee"; g.beginPath(); g.ellipse(150, y0 + 200, 50, 14, 0, 0, 6.3); g.fill(); g.stroke();
  for (let c = 1; c < 3; c++) { g.strokeStyle = "rgba(30,22,26,0.55)"; g.lineWidth = 3; for (let y = y0 + 34; y < 990; y += 22) { g.beginPath(); g.moveTo(40 + c * 238, y); g.lineTo(40 + c * 238 + 212 - (r() > 0.8 ? 70 : 0), y); g.stroke(); } }
});
/** the Kaiser's portrait in a gilt frame (moustache up, spiked helmet) */
export const kaiserPortraitTex = () => ctex("kpKaiserPic", 512, 640, (g, r) => {
  g.fillStyle = "#c9a23a"; g.fillRect(0, 0, 512, 640); g.fillStyle = "#3a2a2a"; g.fillRect(36, 36, 440, 568);
  const gr = g.createRadialGradient(256, 300, 40, 256, 300, 320); gr.addColorStop(0, "#6a5a4a"); gr.addColorStop(1, "#2a2020"); g.fillStyle = gr; g.fillRect(36, 36, 440, 568);
  g.strokeStyle = INK; g.lineWidth = 8; g.fillStyle = "#2b3a63"; g.beginPath(); g.moveTo(110, 600); g.quadraticCurveTo(256, 380, 402, 600); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#f3d2b0"; g.beginPath(); g.ellipse(256, 300, 86, 104, 0, 0, 6.3); g.fill(); g.stroke();
  g.fillStyle = "#1d1b22"; g.beginPath(); g.ellipse(256, 222, 96, 58, 0, Math.PI, 0); g.fill(); g.stroke(); g.fillStyle = "#e8c45a"; g.beginPath(); g.moveTo(246, 168); g.lineTo(266, 168); g.lineTo(256, 112); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = "#3a2a20"; g.lineWidth = 14; g.lineCap = "round"; g.beginPath(); g.moveTo(256, 340); g.quadraticCurveTo(206, 330, 196, 296); g.moveTo(256, 340); g.quadraticCurveTo(306, 330, 316, 296); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(224, 290, 8, 0, 6.3); g.arc(288, 290, 8, 0, 6.3); g.fill();
  for (let i = 0; i < 200; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,240,200,0.04)" : "rgba(0,0,0,0.06)"; g.fillRect(36 + r() * 440, 36 + r() * 568, 2 + r() * 10, 2 + r() * 10); }
});
/** a flag: three horizontal bands (top to bottom) */
export const flagTex = (cols: string[], key: string) => ctex("kpFlag_" + key, 384, 256, (g) => { cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, (i * 256) / cols.length, 384, 256 / cols.length + 1); }); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, 376, 248); });
/** a shop window: goods behind glass, a reflection streak */
export const shopWinTex = (kind: "junk" | "tailor" | "baker") => ctex("kpWin_" + kind, 512, 512, (g, r) => {
  g.fillStyle = "#2a2a34"; g.fillRect(0, 0, 512, 512);
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "rgba(255,230,190,0.22)"); gr.addColorStop(1, "rgba(0,0,0,0.2)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = INK; g.lineWidth = 6;
  if (kind === "junk") { // coats on hooks, a helmet, a sword, a clock, boots
    const cols = ["#26304a", "#5a4a3a", "#3a5a3a", "#6a3a3a"]; cols.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.moveTo(60 + i * 110, 90); g.lineTo(120 + i * 110, 90); g.lineTo(130 + i * 110, 300); g.lineTo(50 + i * 110, 300); g.closePath(); g.fill(); g.stroke(); });
    g.fillStyle = "#1d1b22"; g.beginPath(); g.ellipse(120, 400, 46, 30, 0, Math.PI, 0); g.fill(); g.stroke(); g.fillStyle = "#e8c45a"; g.fillRect(114, 340, 12, 30);
    g.strokeStyle = "#c9ccd2"; g.lineWidth = 10; g.beginPath(); g.moveTo(240, 460); g.lineTo(440, 340); g.stroke(); g.strokeStyle = INK; g.lineWidth = 6;
    g.fillStyle = "#f3e9d2"; g.beginPath(); g.arc(400, 430, 40, 0, 6.3); g.fill(); g.stroke();
    for (const [x, y, t] of [[90, 300, "3 M"], [300, 300, "2 M"], [180, 440, "5 M"]] as [number, number, string][]) { g.fillStyle = "#f3ecd8"; g.fillRect(x - 34, y, 68, 34); g.strokeRect(x - 34, y, 68, 34); g.fillStyle = INK; g.font = serif(24); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, x, y + 18); }
  } else if (kind === "tailor") { // two dummies in suits, bolts of cloth
    for (const [x, c] of [[150, "#3a3440"], [360, "#4a4a5a"]] as [number, string][]) { g.fillStyle = c; g.beginPath(); g.moveTo(x - 70, 140); g.lineTo(x + 70, 140); g.lineTo(x + 60, 380); g.lineTo(x - 60, 380); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "#f6f2e8"; g.beginPath(); g.moveTo(x - 20, 140); g.lineTo(x + 20, 140); g.lineTo(x, 220); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "#8a6238"; g.fillRect(x - 6, 380, 12, 80); g.beginPath(); g.ellipse(x, 120, 30, 20, 0, 0, 6.3); g.fill(); g.stroke(); }
    ["#7a3a3a", "#3a5a7a", "#6a6a3a"].forEach((c, i) => { g.fillStyle = c; g.fillRect(40 + i * 150, 440, 120, 50); g.strokeRect(40 + i * 150, 440, 120, 50); });
  } else { for (let i = 0; i < 9; i++) { g.fillStyle = "#c98a4a"; g.beginPath(); g.ellipse(90 + (i % 3) * 160, 140 + Math.floor(i / 3) * 130, 56, 34, 0, 0, 6.3); g.fill(); g.stroke(); } }
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.04})`; g.fillRect(r() * 512, r() * 512, 2, 2); }
  g.fillStyle = "rgba(255,255,255,0.16)"; g.beginPath(); g.moveTo(330, 0); g.lineTo(400, 0); g.lineTo(150, 512); g.lineTo(80, 512); g.closePath(); g.fill();
});
export const repK = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.repeat.set(x, y); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.needsUpdate = true; return c; };
