// Props and painted textures for the Pig War short, in the house look: two-tone lam() materials, hand-painted canvas
// textures, ink outlines on the shapes, flat bold cartoon colours. Everything faces -z (the cameras look along +z).
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import { INK, paintText } from "../dst/props";

const shadowAll = <T extends THREE.Object3D>(g: T): T => { g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return g; };
const font = (px: number, w = 900) => `${w} ${px}px "DejaVu Sans", "Arial Black", Arial, sans-serif`;

// ---------------- the pig ----------------
/** a round pink cartoon pig, snout toward -z, ~0.75 m tall at the back. head: a child group you can bob */
export const pig = () => {
  const g = new THREE.Group(), pink = lam("pigPink", () => ({ color: "#f4a3b4" })), dark = lam("pigDark", () => ({ color: "#d9788f" }));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 18), pink); body.scale.set(0.92, 0.82, 1.25); body.position.set(0, 0.5, 0.12);
  const head = new THREE.Group(); head.position.set(0, 0.62, -0.42);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 16), pink); skull.scale.set(1.05, 0.95, 0.95);
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.12, 20).rotateX(Math.PI / 2), dark); snout.position.set(0, -0.05, -0.27);
  head.add(skull, snout);
  for (const sx of [-1, 1]) {
    const nos = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), lam("pigNose", () => ({ color: "#7a3445" }))); nos.position.set(sx * 0.045, -0.05, -0.335);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), lam("eyeWhite", () => ({ color: "#ffffff" }))); eye.position.set(sx * 0.11, 0.08, -0.21);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.033, 10, 8), lam("eyeInk", () => ({ color: INK }))); pup.position.set(sx * 0.11, 0.09, -0.265);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 4), pink); ear.position.set(sx * 0.17, 0.25, -0.02); ear.rotation.set(-0.5, 0, sx * -0.45);
    head.add(nos, eye, pup, ear);
    for (const z of [-0.22, 0.42]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.3, 10), pink); leg.position.set(sx * 0.2, 0.15, z);
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.072, 0.05, 10), lam("pigNose", () => ({}))); hoof.position.set(sx * 0.2, 0.025, z);
      g.add(leg, hoof);
    }
  }
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 16, Math.PI * 1.6), pink); tail.position.set(0, 0.68, 0.66); tail.rotation.y = Math.PI / 2;
  g.add(body, head, tail);
  return { g: shadowAll(g), head };
};

// ---------------- potato patch ----------------
/** rows of leafy potato plants on brown ridges, x0..x1 along x, rows going back in +z from z = 0 */
export const potatoPatch = (x0: number, x1: number, rows: number) => {
  const g = new THREE.Group(), soil = lam("soil", () => ({ color: "#7a5236" })), leaf = lam("potLeaf", () => ({ color: "#5fa83a" })), leaf2 = lam("potLeaf2", () => ({ color: "#4a8f30" }));
  for (let r = 0; r < rows; r++) {
    const z = r * 0.9;
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, x1 - x0, 10, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), soil);
    ridge.position.set((x0 + x1) / 2, 0, z); g.add(ridge);
    for (let x = x0 + 0.35; x < x1 - 0.2; x += 0.62) {
      const k = Math.sin(x * 12.9 + r * 7.1) * 0.5 + 0.5;
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2 + 0.07 * k, 0), k > 0.5 ? leaf : leaf2); b.position.set(x + 0.1 * k, 0.28 + 0.04 * k, z); b.scale.y = 0.8; g.add(b);
    }
  }
  // a few dug-up potatoes in front of the first row (the pig's work)
  for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lam("potato", () => ({ color: "#c79a5a" }))); p.scale.set(1.3, 0.85, 1); p.position.set(x0 + 1.4 + i * 0.33, 0.06, -0.45 - (i % 2) * 0.12); g.add(p); }
  return shadowAll(g);
};

// ---------------- flags ----------------
export const usFlagTex = () => ctex("usFlag1859", 512, 300, (g) => {
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#c9373a"; g.fillRect(0, (i * 300) / 13, 512, 300 / 13 + 1); }
  g.fillStyle = "#1f3f8f"; g.fillRect(0, 0, 220, 162);
  g.fillStyle = "#ffffff";
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { g.beginPath(); g.arc(18 + c * 31 + (r % 2) * 8, 18 + r * 31, 6.5, 0, Math.PI * 2); g.fill(); }
  g.lineWidth = 12; g.strokeStyle = INK; g.strokeRect(6, 6, 500, 288);
});
/** the 1801 Union flag (with St Patrick's saltire) */
export const ukFlagTex = () => ctex("union1801", 512, 300, (g) => {
  g.fillStyle = "#1f3f8f"; g.fillRect(0, 0, 512, 300);
  g.lineCap = "butt"; g.strokeStyle = "#ffffff"; g.lineWidth = 58;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(512, 300); g.moveTo(512, 0); g.lineTo(0, 300); g.stroke();
  g.strokeStyle = "#c9373a"; g.lineWidth = 18;
  g.beginPath(); g.moveTo(0, -10); g.lineTo(512, 290); g.moveTo(512, 10); g.lineTo(0, 310); g.stroke();
  g.fillStyle = "#ffffff"; g.fillRect(0, 108, 512, 84); g.fillRect(214, 0, 84, 300);
  g.fillStyle = "#c9373a"; g.fillRect(0, 124, 512, 52); g.fillRect(230, 0, 52, 300);
  g.lineWidth = 12; g.strokeStyle = INK; g.strokeRect(6, 6, 500, 288);
});
/** flag on a pole; the cloth hangs from the pole toward +x. raise(u) slides the cloth from the foot (0) to the top (1) */
export class Flag {
  group = new THREE.Group(); cloth: THREE.Mesh; private top: number;
  constructor(key: string, tex: () => THREE.Texture, public h = 4.2, public w = 1.5) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, h, 8), lam("flagPole", () => ({ color: "#f4f1ea" }))); pole.position.y = h / 2;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lam("brass", () => ({ color: "#d9a83a" }))); knob.position.y = h + 0.05;
    this.cloth = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.6, 10, 3), lam(key, () => ({ map: tex(), side: THREE.DoubleSide })));
    this.cloth.geometry.translate(w / 2 + 0.05, 0, 0);
    this.top = h - w * 0.3 - 0.1; this.cloth.position.y = this.top;
    this.group.add(pole, knob, this.cloth); shadowAll(this.group);
  }
  wave(t: number, k = 1) {
    const p = this.cloth.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, k * 0.12 * Math.sin(t * 4.5 - x * 2.6) * (x / this.w)); }
    p.needsUpdate = true;
  }
  raise(u: number) { this.cloth.position.y = 1.9 + (this.top - 1.9) * Math.max(0, Math.min(1, u)); this.cloth.visible = u > 0.001; }
  clothPos() { this.group.updateWorldMatrix(true, true); return this.cloth.localToWorld(new THREE.Vector3(this.w / 2, 0, 0)); }
}

// ---------------- army kit ----------------
/** field cannon, muzzle toward -z, wheels 1.1 m */
export const cannon = () => {
  const g = new THREE.Group(), iron = lam("cannonIron", () => ({ color: "#3a3d47" })), wood = lam("cannonWood", () => ({ color: "#7a5236" }));
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 1.7, 14).rotateX(Math.PI / 2), iron); barrel.position.set(0, 0.72, -0.25); barrel.rotation.x = -0.08;
  const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 6, 14), iron); muzzle.position.set(0, 0.79, -1.1);
  const trail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 1.6), wood); trail.position.set(0, 0.35, 0.55); trail.rotation.x = 0.32;
  g.add(barrel, muzzle, trail);
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 6, 20), wood); w.rotation.y = Math.PI / 2; w.position.set(sx * 0.38, 0.55, 0); g.add(w);
    for (let k = 0; k < 4; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.96, 0.05), wood); sp.position.set(sx * 0.38, 0.55, 0); sp.rotation.x = (k / 4) * Math.PI; g.add(sp); }
  }
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8).rotateZ(Math.PI / 2), iron); axle.position.y = 0.55; g.add(axle);
  return shadowAll(g);
};
/** round army tent (the Sibley tents of American Camp), door toward -z */
export const tent = (r = 1.6, h = 2.6) => {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 18, 1, true), lam("tentCloth", () => ({ color: "#efe6cf", side: THREE.DoubleSide }))); c.position.y = h / 2;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 6), lam("poleWood", () => ({ color: "#7a5236" }))); pole.position.y = h + 0.2;
  // dark door triangle on the -z face, tilted to lie on the cone
  const dm = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.45, 0, 0), new THREE.Vector3(0.45, 0, 0), new THREE.Vector3(0, 1.3, 0)]), lam("tentDoor", () => ({ color: "#5a4a3a", side: THREE.DoubleSide })));
  dm.geometry.computeVertexNormals(); dm.position.set(0, 0.02, -r - 0.02); dm.rotation.x = Math.atan2(r, h); g.add(dm);
  g.add(c, pole);
  return shadowAll(g);
};

// ---------------- signs and boards ----------------
export const countTex = (key: string, big: string, small: string, bg: string, fg = "#ffffff", acc = "#ffd84d") => ctex(`count_${key}`, 1024, 640, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 640);
  g.lineWidth = 22; g.strokeStyle = acc; g.strokeRect(18, 18, 988, 604);
  paintText(g, big, 512, 300, big.length > 4 ? 290 : 340, fg, "center", 0.1);
  paintText(g, small, 512, 530, 84, acc, "center", 0.14);
});
export const arrestTex = () => ctex("arrestOrder", 640, 820, (g) => {
  g.fillStyle = "#f4e9cf"; g.fillRect(0, 0, 640, 820);
  g.strokeStyle = "rgba(150,110,60,0.35)"; g.lineWidth = 20; g.strokeRect(10, 10, 620, 800);
  paintText(g, "ARREST", 320, 120, 130, "#c9373a", "center", 0.1);
  paintText(g, "ORDER", 320, 245, 100, "#c9373a", "center", 0.1);
  g.font = font(52, 800); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("LYMAN CUTLAR", 320, 390); g.font = font(40, 700); g.fillText("for the matter", 320, 470); g.fillText("of one pig", 320, 520);
  for (let i = 0; i < 3; i++) { g.fillStyle = "rgba(36,23,38,0.3)"; g.fillRect(120, 600 + i * 46, 400 - i * 60, 12); }
  g.save(); g.translate(470, 720); g.rotate(-0.2); g.strokeStyle = "#c9373a"; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 62, 0, Math.PI * 2); g.stroke();
  paintText(g, "VR", 0, 4, 52, "#c9373a", "center", 0.04); g.restore();
});
export const noTex = () => ctex("bigNo", 640, 400, (g) => {
  g.fillStyle = "#c9373a"; g.fillRect(0, 0, 640, 400);
  g.lineWidth = 18; g.strokeStyle = "#ffffff"; g.strokeRect(16, 16, 608, 368);
  paintText(g, "NO.", 320, 205, 230, "#ffffff", "center", 0.1);
});
export const pigWarTex = () => ctex("warOverPig", 1024, 560, (g) => {
  g.fillStyle = "#f6efe0"; g.fillRect(0, 0, 1024, 560);
  g.fillStyle = "#c9373a"; g.fillRect(0, 0, 1024, 30); g.fillRect(0, 530, 1024, 30);
  paintText(g, "A WAR?", 512, 175, 170, "#1f3f8f", "center", 0.1);
  paintText(g, "OVER A PIG?", 512, 375, 150, "#c9373a", "center", 0.1);
});
export const yearCountTex = (y: number) => ctex(`yearCount_${y}`, 768, 560, (g) => {
  g.fillStyle = "#f6efdc"; g.fillRect(0, 0, 768, 560);
  g.fillStyle = "#c9373a"; g.fillRect(0, 0, 768, 140);
  for (const x of [190, 578]) { g.fillStyle = INK; g.beginPath(); g.arc(x, 30, 18, 0, Math.PI * 2); g.fill(); }
  paintText(g, "SHARING THE ISLAND", 384, 90, 56, "#ffffff", "center", 0.12);
  paintText(g, String(y), 384, 330, 250, "#1f3f8f", "center", 0.08);
  paintText(g, `YEAR ${Math.max(1, y - 1859)}`, 384, 495, 64, "#c9373a", "center", 0.12);
});
export const kaiserTex = (decided: boolean) => ctex(`kaiserBoard_${decided}`, 1024, 384, (g) => {
  g.fillStyle = "#1d1b22"; g.fillRect(0, 0, 1024, 384);
  g.fillStyle = "#e8c45a"; g.fillRect(0, 0, 1024, 20); g.fillRect(0, 364, 1024, 20);
  if (!decided) { paintText(g, "ARBITRATION", 512, 150, 130, "#e8c45a", "center", 0.1); paintText(g, "BY THE GERMAN EMPEROR", 512, 280, 62, "#ffffff", "center", 0.14); }
  else { paintText(g, "HARO STRAIT", 512, 150, 130, "#ffffff", "center", 0.1); paintText(g, "ISLAND TO THE U.S.A.", 512, 280, 70, "#ffd84d", "center", 0.14); }
});
export const graveTex = () => ctex("pigGrave", 512, 640, (g) => {
  g.fillStyle = "#b9b4c4"; g.fillRect(0, 0, 512, 640);
  for (let i = 0; i < 60; i++) { g.fillStyle = i % 2 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"; g.fillRect((i * 97) % 512, (i * 53) % 640, 30, 18); }
  paintText(g, "R.I.P.", 256, 150, 110, "#ffffff", "center", 0.12);
  paintText(g, "THE PIG", 256, 290, 92, "#f4a3b4", "center", 0.14);
  paintText(g, "1859", 256, 420, 96, "#ffffff", "center", 0.12);
  g.font = font(34, 800); g.fillStyle = INK; g.textAlign = "center"; g.fillText("ONLY CASUALTY", 256, 540);
});
/** gravestone with a rounded top, face toward -z, 0.75 m wide */
export const grave = () => {
  const g = new THREE.Group(), w = 0.75, h = 0.95;
  const shape = new THREE.Shape(); shape.moveTo(-w / 2, 0); shape.lineTo(-w / 2, h - w / 2); shape.absarc(0, h - w / 2, w / 2, Math.PI, 0, true); shape.lineTo(w / 2, 0); shape.lineTo(-w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false }); geo.translate(0, 0, -0.08);
  const stone = new THREE.Mesh(geo, lam("graveStone", () => ({ color: "#a9a4b6" }))); g.add(stone);
  const face = new THREE.Mesh(new THREE.ShapeGeometry(shape), lam("pigGrave", () => ({ map: graveTex() })));
  const uv = face.geometry.attributes.uv as THREE.BufferAttribute, pos = face.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, pos.getY(i) / h);
  face.rotation.y = Math.PI; face.position.z = -0.085; g.add(face);
  const mound = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam("soil", () => ({ color: "#7a5236" }))); mound.scale.set(0.9, 0.18, 1.2); mound.position.set(0, 0, -0.75); g.add(mound);
  const flowerCols = ["#ffd84d", "#e0332e", "#ffffff", "#7b5ac9"];
  for (let i = 0; i < 7; i++) {
    const x = (i % 2 ? 1 : -1) * (0.28 + 0.06 * (i % 3)), z = -0.18 - (i % 3) * 0.1;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 5), lam("potLeaf", () => ({ color: "#5fa83a" }))); st.position.set(x, 0.18, z);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), lam(`flower${i % 4}`, () => ({ color: flowerCols[i % 4] }))); fl.position.set(x, 0.3, z);
    g.add(st, fl);
  }
  const pot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lam("potato", () => ({ color: "#c79a5a" }))); pot.scale.set(1.4, 0.85, 1); pot.position.set(0.05, 0.07, -0.3); g.add(pot);
  return shadowAll(g);
};
/** comic "BANG!" burst on a camera-facing card (no ink outline pass) */
export const bangTex = () => ctex("bangBurst", 512, 512, (g) => {
  g.clearRect(0, 0, 512, 512);
  const burst = (r0: number, r1: number, fill: string) => { g.beginPath(); for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2, r = k % 2 ? r0 : r1; g.lineTo(256 + Math.cos(a) * r, 256 + Math.sin(a) * r); } g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); };
  burst(150, 240, "#ffd84d"); burst(100, 160, "#ffffff");
  paintText(g, "BANG!", 256, 262, 118, "#e0332e", "center", 0.12);
});
export const bangCard = () => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: bangTex(), transparent: true, depthWrite: false, toneMapped: false }));
  m.layers.set(NOINK); m.renderOrder = 5;
  return m;
};
