// The War of the Bucket Short's painted textures: the city banners, the Pope's and the Emperor's banners, the frescoed
// "fur" walls and the starry vault of the bucket's room in Modena, the poet's title page, terracotta roofs, plaster.
import * as THREE from "three";
import { ctex } from "../bridge/paint";

const INK = "#1e1a22";
export const rep = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.repeat.set(x, y); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.needsUpdate = true; return c; };

export type BannerKind = "bologna" | "modena" | "pope" | "empire";
/** a cloth banner, 3:2: Bologna's red cross on white; Modena's yellow and blue halves; the Pope's crossed keys on red;
 *  the Emperor's black eagle on gold. A dark hem all round so it reads against the sky at phone size */
export const bannerTex = (k: BannerKind) => ctex("bkBanner_" + k, 384, 256, (g, r) => {
  const W = 384, H = 256;
  if (k === "bologna") { g.fillStyle = "#f4f0e6"; g.fillRect(0, 0, W, H); g.fillStyle = "#c8262c"; g.fillRect(W / 2 - 34, 0, 68, H); g.fillRect(0, H / 2 - 34, W, 68); }
  else if (k === "modena") { g.fillStyle = "#f2c230"; g.fillRect(0, 0, W / 2, H); g.fillStyle = "#2a4aa8"; g.fillRect(W / 2, 0, W / 2, H); }
  else if (k === "pope") {
    g.fillStyle = "#b8202a"; g.fillRect(0, 0, W, H);
    const key = (rot: number, col: string) => { g.save(); g.translate(W / 2, H / 2); g.rotate(rot); g.lineCap = "round";
      for (const [w, c] of [[30, INK], [18, col]] as [number, string][]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(0, -90); g.lineTo(0, 70); g.stroke(); g.beginPath(); g.moveTo(0, 50); g.lineTo(26, 50); g.moveTo(0, 74); g.lineTo(22, 74); g.stroke();
        g.beginPath(); g.ellipse(0, -92, 26, 22, 0, 0, 6.3); g.stroke(); }
      g.restore(); };
    key(-0.55, "#e8c040"); key(0.55, "#e6e8ee");
  } else {
    g.fillStyle = "#e8c040"; g.fillRect(0, 0, W, H);
    g.save(); g.translate(W / 2, H / 2 + 6); g.fillStyle = "#1a1618";
    // a heraldic eagle: body, spread wings with three feathers each, head turned, legs
    g.beginPath(); g.ellipse(0, 6, 26, 52, 0, 0, 6.3); g.fill();
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 18, -24); g.lineTo(s * 120, -64); g.lineTo(s * 112, -36); g.lineTo(s * 132, -30); g.lineTo(s * 104, -8); g.lineTo(s * 122, 4); g.lineTo(s * 84, 18); g.lineTo(s * 20, 8); g.closePath(); g.fill();
      g.fillRect(s * 10 - 5, 52, 10, 30); g.fillRect(s * 10 - 14 + (s > 0 ? 0 : -6), 78, 26, 8); }
    g.beginPath(); g.ellipse(10, -58, 16, 14, 0, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(22, -60); g.lineTo(42, -54); g.lineTo(22, -50); g.fill();
    g.fillStyle = "#c8262c"; g.beginPath(); g.moveTo(26, -50); g.lineTo(40, -42); g.lineTo(26, -46); g.fill();
    g.restore();
  }
  // cloth folds and the hem
  for (let x = 0; x < W; x += 48) { const gr = g.createLinearGradient(x, 0, x + 48, 0); gr.addColorStop(0, "rgba(0,0,0,0.0)"); gr.addColorStop(0.5, "rgba(0,0,0,0.14)"); gr.addColorStop(1, "rgba(255,255,255,0.06)"); g.fillStyle = gr; g.fillRect(x, 0, 48, H); }
  for (let i = 0; i < 300; i++) { g.fillStyle = r() > 0.5 ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)"; g.fillRect(r() * W, r() * H, 2 + r() * 10, 1 + r() * 2); }
  g.strokeStyle = INK; g.lineWidth = 12; g.strokeRect(6, 6, W - 12, H - 12);
});

/** the frescoed walls of the Sala della Secchia rapita: painted to look like rows of fine fur (vair, the blue-grey and
 *  white bell shapes of heraldry), with a red-brown dado band at the bottom */
export const vairTex = () => ctex("bkVair", 1024, 1024, (g, r) => {
  g.fillStyle = "#e9e2d2"; g.fillRect(0, 0, 1024, 1024);
  const cw = 64, ch = 72;
  for (let row = 0; row < 15; row++) for (let col = -1; col < 17; col++) {
    const x = col * cw + (row % 2 ? cw / 2 : 0), y = row * ch;
    g.fillStyle = row % 2 ? "#6a7c96" : "#5a6c88";
    g.beginPath(); g.moveTo(x, y + ch); g.lineTo(x, y + ch * 0.42); g.quadraticCurveTo(x + cw * 0.08, y + ch * 0.12, x + cw / 2, y); g.quadraticCurveTo(x + cw * 0.92, y + ch * 0.12, x + cw, y + ch * 0.42); g.lineTo(x + cw, y + ch); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,255,255,0.12)"; g.beginPath(); g.ellipse(x + cw * 0.36, y + ch * 0.4, 6, 14, 0.2, 0, 6.3); g.fill();
    for (let k = 0; k < 4; k++) { g.strokeStyle = "rgba(30,30,50,0.25)"; g.lineWidth = 2; const px = x + cw * (0.2 + 0.2 * k); g.beginPath(); g.moveTo(px, y + ch * 0.5); g.lineTo(px + 2, y + ch * 0.9); g.stroke(); }
  }
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(90,70,40,0.05)" : "rgba(255,250,235,0.06)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 6 + r() * 40, 4 + r() * 20, r() * 3, 0, 6.3); g.fill(); }
  // age: soft cracks and losses in the plaster
  for (let i = 0; i < 26; i++) { g.strokeStyle = "rgba(80,60,40,0.22)"; g.lineWidth = 1.5; let x = r() * 1024, y = r() * 1024; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 60; y += (r() - 0.2) * 50; g.lineTo(x, y); } g.stroke(); }
});
/** the vault: deep blue with gold eight-point stars */
export const starsTex = () => ctex("bkStars", 1024, 1024, (g, r) => {
  const gr = g.createRadialGradient(512, 512, 40, 512, 512, 760); gr.addColorStop(0, "#2c4a8a"); gr.addColorStop(1, "#1a2a5a"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 120; i++) { const x = (i % 11) * 96 + (Math.floor(i / 11) % 2 ? 48 : 0) + (r() - 0.5) * 10, y = Math.floor(i / 11) * 96 + 40, s = 14 + r() * 6;
    g.fillStyle = "#e8c050"; g.beginPath(); for (let k = 0; k < 16; k++) { const a = (k / 16) * 6.283, rr = k % 2 ? s * 0.38 : s; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
  for (let i = 0; i < 500; i++) { g.fillStyle = "rgba(255,255,255,0.03)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 20, 1 + r() * 3); }
});
/** warm lime plaster for the halls */
export const plasterTex = (key: string, base: string) => ctex(key, 1024, 1024, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() > 0.5 ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 8 + r() * 50, 6 + r() * 30, r() * 3, 0, 6.3); g.fill(); }
  for (let i = 0; i < 18; i++) { g.strokeStyle = "rgba(60,40,30,0.16)"; g.lineWidth = 1.5; let x = r() * 1024, y = r() * 1024; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 70; y += (r() - 0.3) * 60; g.lineTo(x, y); } g.stroke(); }
});
/** a hanging drape: deep folds in one colour, a gold fringe at the bottom */
export const drapeTex = (key: string, col: string) => ctex("bkDrape" + key, 512, 1024, (g) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 1024);
  for (let x = 0; x < 512; x += 64) { const gr = g.createLinearGradient(x, 0, x + 64, 0); gr.addColorStop(0, "rgba(0,0,0,0.32)"); gr.addColorStop(0.45, "rgba(255,255,255,0.12)"); gr.addColorStop(1, "rgba(0,0,0,0.32)"); g.fillStyle = gr; g.fillRect(x, 0, 64, 1024); }
  g.fillStyle = "#e0b440"; g.fillRect(0, 960, 512, 64); g.fillStyle = "rgba(0,0,0,0.25)"; for (let x = 0; x < 512; x += 12) g.fillRect(x, 990, 4, 34);
});
/** an open book: two pages, the title page of Tassoni's poem on the right, writing on the left */
export const bookTex = () => ctex("bkBook", 1024, 640, (g, r) => {
  g.fillStyle = "#5a2a1a"; g.fillRect(0, 0, 1024, 640);
  g.fillStyle = "#f2e8d0"; g.fillRect(24, 24, 480, 592); g.fillRect(520, 24, 480, 592);
  g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(496, 24, 32, 592);
  g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 64px Montserrat, DejaVu Sans, sans-serif"; g.fillText("LA SECCHIA", 760, 210); g.fillText("RAPITA", 760, 290);
  g.font = "700 30px Montserrat, DejaVu Sans, sans-serif"; g.fillText("Alessandro Tassoni", 760, 380);
  // a little bucket on the title page
  g.strokeStyle = INK; g.lineWidth = 6; g.fillStyle = "#a8743a"; g.beginPath(); g.moveTo(720, 460); g.lineTo(800, 460); g.lineTo(790, 540); g.lineTo(730, 540); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.arc(760, 460, 40, Math.PI, 0); g.stroke();
  for (let y = 70; y < 590; y += 26) { g.strokeStyle = "rgba(30,26,34,0.45)"; g.lineWidth = 4; g.beginPath(); g.moveTo(60, y); g.lineTo(60 + 380 * (0.6 + 0.4 * r()), y); g.stroke(); }
});
/** a written page (camera-facing paper cards) */
export const pageTex = () => ctex("bkPage", 128, 160, (g, r) => {
  g.clearRect(0, 0, 128, 160); g.fillStyle = "#f4ecd6"; g.fillRect(10, 10, 108, 140); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(10, 10, 108, 140);
  for (let y = 30; y < 140; y += 14) { g.strokeStyle = "rgba(30,26,34,0.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(22, y); g.lineTo(22 + 84 * (0.6 + 0.4 * r()), y); g.stroke(); }
});
/** the Pope's decree: a sealed parchment with a red wax seal */
export const decreeTex = () => ctex("bkDecree", 256, 320, (g, r) => {
  g.clearRect(0, 0, 256, 320); g.fillStyle = "#efe2c2"; g.fillRect(16, 16, 224, 288); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(16, 16, 224, 288);
  for (let y = 50; y < 230; y += 20) { g.strokeStyle = "rgba(30,26,34,0.55)"; g.lineWidth = 4; g.beginPath(); g.moveTo(40, y); g.lineTo(40 + 176 * (0.6 + 0.4 * r()), y); g.stroke(); }
  g.fillStyle = "#b8202a"; g.beginPath(); g.arc(128, 262, 26, 0, 6.3); g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
});
/** terracotta roof tiles (Bologna's roofs over the wall) */
export const tileRoofTex = () => ctex("bkRoof", 1024, 1024, (g, r) => {
  g.fillStyle = "#b05a36"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 40) { g.fillStyle = "rgba(60,20,10,0.35)"; g.fillRect(0, y + 32, 1024, 8);
    for (let x = (y / 40) % 2 ? 0 : 24; x < 1024; x += 48) { g.fillStyle = r() > 0.5 ? "rgba(255,200,160,0.12)" : "rgba(80,30,10,0.12)"; g.fillRect(x, y, 40, 32); g.fillStyle = "rgba(40,10,0,0.25)"; g.fillRect(x + 40, y, 8, 32); } }
});
/** packed dirt road with ruts along u and hoofprints */
export const roadTex = () => ctex("bkRoad", 1024, 1024, (g, r) => {
  g.fillStyle = "#a88a62"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(70,50,30,0.12)" : "rgba(240,215,175,0.12)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 4 + r() * 24, 3 + r() * 10, r() * 3, 0, 6.3); g.fill(); }
  for (const y of [320, 700]) { g.fillStyle = "rgba(70,50,30,0.3)"; g.fillRect(0, y, 1024, 44); }
  for (let i = 0; i < 80; i++) { g.fillStyle = "rgba(60,40,24,0.4)"; g.beginPath(); g.arc(r() * 1024, 380 + r() * 260, 8 + r() * 6, 0.3, 2.8); g.fill(); }
  for (let i = 0; i < 400; i++) { g.fillStyle = ["#c8b498", "#7a6a58", "#e0d0b8"][Math.floor(r() * 3)]; g.fillRect(r() * 1024, r() * 1024, 3 + r() * 4, 3 + r() * 3); }
});
/** dark wood with iron studs: castle and city gates */
export const gateDoorTex = () => ctex("bkGateDoor", 512, 1024, (g, r) => {
  g.fillStyle = "#5a3a24"; g.fillRect(0, 0, 512, 1024);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = r() > 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,230,200,0.06)"; g.fillRect(x, 0, 64, 1024); g.fillStyle = "rgba(0,0,0,0.4)"; g.fillRect(x + 60, 0, 4, 1024); }
  for (const y of [160, 512, 860]) { g.fillStyle = "#2a2426"; g.fillRect(0, y, 512, 44); for (let x = 20; x < 512; x += 48) { g.fillStyle = "#6a6468"; g.beginPath(); g.arc(x, y + 22, 8, 0, 6.3); g.fill(); } }
});
/** the bucket's oak staves: twelve boards round, dark seams between them, grain along them, worn lighter at the rim */
export const staveTex = () => ctex("bkStave", 512, 256, (g, r) => {
  const n = 12, w = 512 / n;
  for (let i = 0; i < n; i++) { g.fillStyle = ["#8a5a32", "#7e5230", "#946238"][i % 3]; g.fillRect(i * w, 0, w, 256);
    for (let k = 0; k < 6; k++) { g.strokeStyle = "rgba(50,30,16,0.25)"; g.lineWidth = 1.5; const x = i * w + 4 + r() * (w - 8); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 4, 256); g.stroke(); }
    g.fillStyle = "#2a1a10"; g.fillRect(i * w, 0, 3, 256); }
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "rgba(0,0,0,0.18)"); gr.addColorStop(0.8, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(255,230,200,0.12)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
});
