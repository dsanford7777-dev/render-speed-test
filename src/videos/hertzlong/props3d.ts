// 3D props for the 60 Hz long-form: a belt-driven generator, street and table lamps whose globes can glow, flicker or
// go dark, an induction motor, lattice pylons with wires, the converter station hut, painted number boards, a wall
// socket and the flat clock cards that fly at the lens. Same house look as the Shorts' props.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import { paintText, INK } from "../dst/props";

const shadowAll = <T extends THREE.Object3D>(g: T): T => { g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return g; };
const box = (w: number, h: number, d: number, key: string, col: string) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(key, () => ({ color: col })));
const cyl = (r0: number, r1: number, h: number, key: string, col: string, seg = 24) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), lam(key, () => ({ color: col })));

/** a generator about `s` metres tall: bed plate, two copper coil drums, a big spoked flywheel (wheel: spin about x) */
export const generator = (s = 1.6) => {
  const g = new THREE.Group(), u = s / 1.6;
  const bed = box(2.4 * u, 0.22 * u, 1.1 * u, "genBed", "#4a4658"); bed.position.y = 0.11 * u;
  const frame = box(1.2 * u, 0.9 * u, 0.9 * u, "genFrame", "#5d6f8f"); frame.position.set(-0.35 * u, 0.67 * u, 0);
  g.add(bed, frame);
  for (const z of [-0.26, 0.26]) {
    const coil = cyl(0.3 * u, 0.3 * u, 0.42 * u, "genCopper", "#d98a3a"); coil.rotation.x = Math.PI / 2; coil.position.set(-0.35 * u, 1.18 * u, z * u);
    const cap = cyl(0.33 * u, 0.33 * u, 0.05 * u, "genFrame", "#5d6f8f"); cap.rotation.x = Math.PI / 2; cap.position.set(-0.35 * u, 1.18 * u, z * u * 1.9);
    g.add(coil, cap);
  }
  const wheel = new THREE.Group(); wheel.position.set(0.75 * u, 0.86 * u, 0);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62 * u, 0.07 * u, 12, 40), lam("genRim", () => ({ color: "#c9373a" })));
  wheel.add(rim);
  for (let k = 0; k < 6; k++) { const sp = box(0.05 * u, 1.2 * u, 0.05 * u, "genSpoke", "#2f2a3a"); sp.rotation.z = (k / 6) * Math.PI; wheel.add(sp); }
  const hub = cyl(0.12 * u, 0.12 * u, 0.2 * u, "genSpoke", "#2f2a3a"); hub.rotation.x = Math.PI / 2; wheel.add(hub);
  g.add(wheel);
  const stand = box(0.14 * u, 0.86 * u, 0.5 * u, "genBed", "#4a4658"); stand.position.set(0.75 * u, 0.43 * u, 0.32 * u); g.add(stand);
  return { g: shadowAll(g), wheel };
};

/** an induction motor for the table: finned drum on feet, a shaft with a pulley (shaft: spin about x) */
export const motor = (s = 0.5) => {
  const g = new THREE.Group(), u = s / 0.5;
  const body = cyl(0.2 * u, 0.2 * u, 0.42 * u, "motorBody", "#3f6f8f"); body.rotation.z = Math.PI / 2; body.position.y = 0.26 * u;
  g.add(body);
  for (let k = 0; k < 5; k++) { const fin = cyl(0.225 * u, 0.225 * u, 0.02 * u, "motorFin", "#2f556f"); fin.rotation.z = Math.PI / 2; fin.position.set((-0.16 + k * 0.08) * u, 0.26 * u, 0); g.add(fin); }
  for (const x of [-0.14, 0.14]) { const ft = box(0.08 * u, 0.08 * u, 0.4 * u, "motorFin", "#2f556f"); ft.position.set(x * u, 0.04 * u, 0); g.add(ft); }
  const shaft = new THREE.Group(); shaft.position.set(0.3 * u, 0.26 * u, 0);
  const rod = cyl(0.03 * u, 0.03 * u, 0.2 * u, "genSpoke", "#2f2a3a"); rod.rotation.z = Math.PI / 2;
  const pulley = cyl(0.12 * u, 0.12 * u, 0.06 * u, "genRim", "#c9373a"); pulley.rotation.z = Math.PI / 2; pulley.position.x = 0.08 * u;
  const mark = box(0.062 * u, 0.2 * u, 0.03 * u, "motorMark", "#f6efdc"); mark.position.x = 0.08 * u;
  shaft.add(rod, pulley, mark); g.add(shaft);
  return { g: shadowAll(g), shaft };
};

/** a lamp: post of height h with a glass globe of radius r on top. set(k): 0 = dark glass, 1 = full glow (blooms) */
export class Lamp {
  group = new THREE.Group();
  private mat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  private halo: THREE.Sprite;
  constructor(public h: number, public r: number, post = "#2f2a3a") {
    const G = this.group;
    if (h > 0.9) {
      const p = cyl(r * 0.16, r * 0.26, h, "lampPost", post, 12); p.position.y = h / 2;
      const foot = cyl(r * 0.6, r * 0.75, r * 0.5, "lampPost", post, 16); foot.position.y = r * 0.25;
      const arm = box(r * 1.5, r * 0.12, r * 0.12, "lampPost", post); arm.position.y = h - r * 0.2;
      G.add(shadowAll(p), shadowAll(foot), shadowAll(arm));
    } else {
      const base = cyl(r * 0.7, r * 0.9, h * 0.25, "lampBrass", "#d9a83a", 20); base.position.y = h * 0.125;
      const neck = cyl(r * 0.18, r * 0.18, h * 0.75, "lampBrass", "#d9a83a", 10); neck.position.y = h * 0.6;
      G.add(shadowAll(base), shadowAll(neck));
    }
    const globe = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), this.mat); globe.position.y = h + r * 0.85; globe.layers.set(NOINK);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.0, r * 0.07, 8, 32), lam("lampPost", () => ({ color: post }))); ring.position.y = h + r * 0.85;
    this.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1.6, 1.25, 0.6), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    this.halo.position.y = h + r * 0.85; this.halo.layers.set(NOINK);
    G.add(globe, ring, this.halo);
    this.set(1);
  }
  set(k: number) {
    const a = Math.max(0, Math.min(1.4, k));
    this.mat.color.setRGB(0.2 + 3.4 * a, 0.2 + 2.7 * a, 0.22 + 1.3 * a);
    this.halo.visible = a > 0.02; this.halo.scale.setScalar(this.r * (3 + 5 * a)); (this.halo.material as THREE.SpriteMaterial).opacity = 0.75 * a;
  }
  top() { this.group.updateWorldMatrix(true, false); return this.group.localToWorld(new THREE.Vector3(0, this.h + this.r * 0.85, 0)); }
}
const haloTex = () => ctex("lampHalo", 256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 6, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.35, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
});

/** a lattice pylon of height h (three cross arms with insulators); the top arm is at h * 0.9 */
export const pylon = (h: number) => {
  const g = new THREE.Group(), steel = "#6c7486";
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = box(0.16, h * 1.01, 0.16, "pylonSteel", steel); leg.position.set(sx * h * 0.07, h / 2, sz * h * 0.07);
    leg.rotation.z = -sx * 0.085; leg.rotation.x = sz * 0.085; g.add(leg);
  }
  for (let k = 1; k < 7; k++) {
    const y = (k / 7) * h, w = h * 0.3 * (1 - (k / 7) * 0.72);
    for (const r of [0, Math.PI / 2]) { const b = box(w, 0.07, 0.07, "pylonSteel", steel); b.position.y = y; b.rotation.y = r; g.add(b); }
    const d = box(Math.hypot(w, h / 7), 0.05, 0.05, "pylonSteel", steel); d.position.set(0, y - h / 14, -w / 2); d.rotation.z = (k % 2 ? 1 : -1) * Math.atan2(h / 7, w); g.add(d);
  }
  for (const [y, w] of [[h * 0.9, h * 0.5], [h * 0.76, h * 0.62], [h * 0.62, h * 0.5]]) {
    const arm = box(w, 0.12, 0.12, "pylonSteel", steel); arm.position.y = y; g.add(arm);
    for (const sx of [-1, 1]) { const ins = cyl(0.07, 0.1, 0.5, "pylonIns", "#e8dcc0", 10); ins.position.set(sx * w * 0.46, y - 0.3, 0); g.add(ins); }
  }
  const cap = box(0.2, h * 0.1, 0.2, "pylonSteel", steel); cap.position.y = h * 0.95; g.add(cap);
  return shadowAll(g);
};
/** a sagging wire from a to b (world points), as a tube */
export const wire = (a: THREE.Vector3, b: THREE.Vector3, sag = 0.6, col = "#2f2a3a") => {
  const mid = a.clone().lerp(b, 0.5); mid.y -= sag;
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 20, 0.035, 6), lam(`wire_${col}`, () => ({ color: col })));
  m.castShadow = true; return m;
};
/** the converter station: a low brick hall with a flat roof, two tall bushings and a painted name board */
export const hut = () => {
  const g = new THREE.Group();
  const hall = box(3.6, 2.2, 2.4, "hutBrick", "#b5604a"); hall.position.y = 1.1;
  const roof = box(3.9, 0.2, 2.7, "hutRoof", "#4a4658"); roof.position.y = 2.3;
  const door = box(0.8, 1.5, 0.06, "hutDoor", "#2f2a3a"); door.position.set(-1.0, 0.75, -1.22);
  g.add(hall, roof, door);
  for (const x of [-1.1, 1.1]) {
    const b = cyl(0.12, 0.2, 1.5, "pylonIns", "#e8dcc0", 12); b.position.set(x, 3.15, 0); g.add(b);
    for (let k = 0; k < 4; k++) { const d = cyl(0.26, 0.26, 0.05, "pylonIns", "#e8dcc0", 16); d.position.set(x, 2.7 + k * 0.3, 0); g.add(d); }
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.6), lam("hutSign", () => ({ map: numTex("CONVERTER", "#2f2a3a", "#ffd84d", 1024, 300) })));
  sign.rotation.y = Math.PI; sign.position.set(0.55, 1.5, -1.23); g.add(sign);
  return shadowAll(g);
};

/** painted board face: big text on a flat colour with an ink border */
export const numTex = (s: string, bg = "#f6efdc", fg = "#c9373a", w = 1024, h = 640) => ctex(`num_${s}_${bg}_${fg}_${w}`, w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.lineWidth = 26; g.strokeStyle = INK; g.strokeRect(13, 13, w - 26, h - 26);
  let px = h * 0.62; g.font = `900 ${px}px Montserrat, Arial, sans-serif`;
  while (g.measureText(s).width > w * 0.82 && px > 40) { px -= 6; g.font = `900 ${px}px Montserrat, Arial, sans-serif`; }
  paintText(g, s, w / 2, h / 2 + px * 0.04, px, fg, "center", 0.12);
});
/** a two-slot wall socket plate */
export const socketTex = () => ctex("wallSocket", 512, 640, (g) => {
  g.fillStyle = "#f6efdc"; g.beginPath(); g.roundRect(20, 20, 472, 600, 60); g.fill(); g.lineWidth = 22; g.strokeStyle = INK; g.stroke();
  g.fillStyle = INK;
  for (const y of [190, 450]) { g.beginPath(); g.roundRect(170, y - 70, 44, 140, 10); g.fill(); g.beginPath(); g.roundRect(298, y - 70, 44, 140, 10); g.fill(); }
  g.beginPath(); g.arc(256, 320, 16, 0, Math.PI * 2); g.fill();
});
/** a clock face card (drawn at ten past ten) for the clocks that fly at the lens */
export const clockCardTex = () => ctex("clockCard", 512, 512, (g) => {
  g.clearRect(0, 0, 512, 512);
  g.fillStyle = "#b5462f"; g.beginPath(); g.arc(256, 256, 252, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#f6efdc"; g.beginPath(); g.arc(256, 256, 214, 0, Math.PI * 2); g.fill();
  g.lineWidth = 16; g.strokeStyle = INK; g.beginPath(); g.arc(256, 256, 214, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(256, 256, 246, 0, Math.PI * 2); g.stroke();
  for (let h = 0; h < 12; h++) { const a = (h / 12) * Math.PI * 2; g.lineWidth = h % 3 ? 10 : 20; g.beginPath(); g.moveTo(256 + Math.sin(a) * 168, 256 - Math.cos(a) * 168); g.lineTo(256 + Math.sin(a) * 198, 256 - Math.cos(a) * 198); g.stroke(); }
  g.lineCap = "round"; g.lineWidth = 22; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 - 90, 256 - 60); g.stroke();
  g.lineWidth = 14; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + 70, 256 - 140); g.stroke();
  g.fillStyle = "#d9a83a"; g.beginPath(); g.arc(256, 256, 20, 0, Math.PI * 2); g.fill();
});
/** flat cut-out cards that always face the camera (clocks thrown at the lens, sparks) */
export class Cards {
  list: THREE.Mesh[] = [];
  constructor(root: THREE.Object3D, tex: THREE.Texture, n: number, w: number) {
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w), mat); m.visible = false; m.layers.set(NOINK); m.renderOrder = 3; root.add(m); this.list.push(m); }
  }
  hide() { for (const m of this.list) m.visible = false; }
  put(k: number, p: THREE.Vector3, cam: THREE.Camera, spin: number, scale = 1) {
    const m = this.list[k]; if (!m) return; m.visible = true; m.position.copy(p); m.quaternion.copy(cam.quaternion); m.rotateZ(spin); m.scale.setScalar(scale);
  }
}
/** a jagged spark burst */
export const sparkTex = () => ctex("sparkBurst", 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256); g.translate(128, 128);
  g.fillStyle = "#fff3a0"; g.strokeStyle = INK; g.lineWidth = 8; g.lineJoin = "round"; g.beginPath();
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, r = k % 2 ? 50 : 118; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.closePath(); g.fill(); g.stroke();
});
