// A racehorse for the Frank Hayes Short: low-poly 3D, toon-lit, inked like the characters (it is a character).
// Local frame: +x forward (nose), +y up, origin on the ground under the barrel. Every frame `pose` sets the gait
// (stand / walk / canter / gallop), the stride phase, an optional jump (0..1 over a fence) and the head carriage,
// then drops the whole horse so its lowest hoof touches the ground: no hoof ever sinks in or floats (checklist).
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex } from "../bridge/paint";

export type Coat = { body: string; dark: string; legs: string; blaze?: boolean };
export const COATS: Record<string, Coat> = {
  bay: { body: "#7a4a2c", dark: "#2a1c16", legs: "#2a1c16" },
  chestnut: { body: "#a8602e", dark: "#7a3e1e", legs: "#a8602e", blaze: true },
  grey: { body: "#b8b4ac", dark: "#6a6660", legs: "#8a8680" },
  darkbay: { body: "#4a2e20", dark: "#1a1210", legs: "#1a1210" },
  black: { body: "#2a2426", dark: "#141012", legs: "#141012", blaze: true },
};
export type Gait = "stand" | "walk" | "trot" | "canter" | "gallop";
export type HorsePose = { gait: Gait; phase: number; jump?: number; head?: number; tail?: number };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const TAU = Math.PI * 2;
type Leg = { root: THREE.Group; knee: THREE.Group; fet: THREE.Group; hoof: THREE.Object3D; front: boolean; side: number };

const clothTex = (n: number) => ctex("hsCloth" + n, 256, 192, (g) => {
  g.fillStyle = "#f4f0e6"; g.fillRect(0, 0, 256, 192); g.strokeStyle = "#120c16"; g.lineWidth = 10; g.strokeRect(5, 5, 246, 182);
  g.fillStyle = "#120c16"; g.font = "900 120px Montserrat, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(n), 128, 104);
});

export class Horse {
  g = new THREE.Group(); body = new THREE.Group(); neck = new THREE.Group(); head = new THREE.Group(); tail = new THREE.Group();
  saddle = new THREE.Object3D(); hands = new THREE.Object3D(); bit = new THREE.Object3D();
  private legs: Leg[] = []; private reins: THREE.Mesh; private hasRider = true;
  private m = new THREE.Matrix4(); private v = new THREE.Vector3(); private v2 = new THREE.Vector3();
  constructor(coat: Coat, num: number, key: string) {
    const C = lam("hsBody_" + key, () => ({ color: coat.body })), D = lam("hsDark_" + key, () => ({ color: coat.dark })), Lg = lam("hsLeg_" + key, () => ({ color: coat.legs }));
    const hoofM = lam("hsHoof", () => ({ color: "#2a2622" })), white = lam("hsWhite", () => ({ color: "#f2eee4" })), tack = lam("hsTack", () => ({ color: "#3a2618" })), cloth = lam("hsClothM" + num, () => ({ map: clothTex(num) }));
    const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, p?: [number, number, number], r?: [number, number, number], s?: [number, number, number]) => {
      const ms = new THREE.Mesh(geo, mat); if (p) ms.position.set(...p); if (r) ms.rotation.set(...r); if (s) ms.scale.set(...s); ms.castShadow = true; ms.receiveShadow = true; return ms; };
    const sph = (r: number) => new THREE.SphereGeometry(r, 14, 10);
    const cyl = (r0: number, r1: number, h: number, n = 10) => { const c = new THREE.CylinderGeometry(r0, r1, h, n); c.translate(0, -h / 2, 0); return c; };   // hangs down from its top
    this.g.add(this.body);
    // ---- barrel, chest, hindquarters: one smooth capsule, the croup and the chest blended into its ends ----
    { const cap = new THREE.CapsuleGeometry(0.37, 1.18, 8, 18); cap.rotateZ(Math.PI / 2); this.body.add(mesh(cap, C, [0, 0, 0], undefined, [1, 1, 0.84])); }
    this.body.add(mesh(sph(0.36), C, [-0.6, 0.07, 0], undefined, [1.15, 1.0, 0.9]));
    this.body.add(mesh(sph(0.33), C, [0.6, 0.0, 0], undefined, [1.1, 1.05, 0.86]));
    // ---- saddle cloth (the number), the little race saddle, the girth ----
    for (const s of [-1, 1]) { const c = mesh(new THREE.PlaneGeometry(0.62, 0.42), cloth, [-0.06, 0.1, s * 0.33], [0, s > 0 ? 0 : Math.PI, 0]); this.body.add(c); }
    this.body.add(mesh(new THREE.BoxGeometry(0.46, 0.06, 0.34), tack, [0.16, 0.39, 0], [0, 0, -0.04]));
    this.saddle.position.set(0.18, 0.4, 0); this.body.add(this.saddle);
    this.hands.position.set(0.62, 0.52, 0); this.body.add(this.hands);
    // ---- neck (pivot at the withers' front), head, ears, mane ----
    this.neck.position.set(0.72, 0.18, 0); this.body.add(this.neck);
    { const n = new THREE.CylinderGeometry(0.13, 0.27, 0.86, 12); n.translate(0, 0.41, 0); const nm = mesh(n, C); nm.rotation.z = -0.62; this.neck.add(nm);
      for (let k = 0; k < 6; k++) { const u = k / 5, mn = mesh(new THREE.BoxGeometry(0.16, 0.05, 0.06), D, [Math.sin(0.62) * 0.82 * u - 0.1, Math.cos(0.62) * 0.82 * u + 0.12 - 0.03 * u, 0], [0, 0, -0.62 + 0.1]); this.neck.add(mn); } }
    this.head.position.set(Math.sin(0.62) * 0.8, Math.cos(0.62) * 0.8, 0); this.neck.add(this.head);
    { const h = new THREE.CylinderGeometry(0.13, 0.075, 0.62, 10); h.translate(0, -0.31, 0); const hm = mesh(h, C); hm.rotation.z = 0.75; this.head.add(hm);
      // the muzzle and the cheek, the ears
      this.head.add(mesh(sph(0.09), C, [Math.sin(0.75) * 0.6, -Math.cos(0.75) * 0.6 - 0.0, 0], undefined, [1.1, 0.9, 0.95]));
      this.head.add(mesh(sph(0.12), C, [0.08, -0.04, 0], undefined, [1.1, 1, 0.9]));
      for (const s of [-1, 1]) { const e = mesh(new THREE.ConeGeometry(0.035, 0.14, 6), C, [-0.04, 0.1, s * 0.06], [s * 0.2, 0, 0.25]); this.head.add(e); }
      if (coat.blaze) this.head.add(mesh(new THREE.BoxGeometry(0.36, 0.035, 0.05), white, [0.22, -0.01, 0], [0, 0, -0.9]));
      // the bridle: a noseband and the bit ring
      this.head.add(mesh(new THREE.TorusGeometry(0.085, 0.014, 5, 16), tack, [Math.sin(0.75) * 0.42, -Math.cos(0.75) * 0.42, 0], [0, Math.PI / 2, 0.68]));
      this.bit.position.set(Math.sin(0.75) * 0.52, -Math.cos(0.75) * 0.52 - 0.03, 0); this.head.add(this.bit); }
    // ---- tail ----
    this.tail.position.set(-1.0, 0.2, 0); this.body.add(this.tail);
    this.tail.add(mesh(new THREE.CylinderGeometry(0.035, 0.12, 0.82, 8).translate(0, -0.41, 0), D));
    // ---- legs: front (shoulder) and hind (hip) pivots in the body frame ----
    for (const front of [true, false]) for (const side of [-1, 1]) {
      const root = new THREE.Group(), knee = new THREE.Group(), fet = new THREE.Group();
      root.position.set(front ? 0.56 : -0.64, front ? -0.2 : -0.12, side * 0.16);
      const L1 = front ? 0.47 : 0.52, L2 = 0.4;
      root.add(mesh(cyl(front ? 0.14 : 0.2, 0.07, L1 + (front ? 0.16 : 0.14)), C, [0, front ? 0.16 : 0.14, 0], undefined, [1, 1, front ? 0.8 : 0.7]));
      knee.position.set(0, -L1, 0); root.add(knee);
      knee.add(mesh(sph(0.06), Lg));
      knee.add(mesh(cyl(0.05, 0.042, L2), Lg));
      fet.position.set(0, -L2, 0); knee.add(fet);
      fet.add(mesh(sph(0.05), Lg));
      const hoof = mesh(cyl(0.055, 0.068, 0.14, 8), hoofM, [0.03, -0.04, 0], [0, 0, 0.25]); fet.add(hoof);
      const tip = new THREE.Object3D(); tip.position.set(0.05, -0.2, 0); fet.add(tip);
      this.body.add(root); this.legs.push({ root, knee, fet, hoof: tip, front, side });
    }
    // ---- reins: one strip from the bit to the rider's hands, rebuilt each frame ----
    this.reins = mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 5), tack); this.reins.castShadow = false; this.g.add(this.reins);
  }
  rider(on: boolean) { this.hasRider = on; this.saddle.visible = on; }
  /** set the gait and drop the horse onto the ground; returns nothing (read saddle/hands/bit via world positions) */
  pose(q: HorsePose) {
    const g = q.gait, p = ((q.phase % 1) + 1) % 1, j = q.jump ?? -1, air = j >= 0 && j <= 1;
    // footfall offsets and stance share: transverse gallop (hind L, hind R, fore L, fore R), canter, four-beat walk
    const OFF: Record<Gait, number[]> = { gallop: [0.38, 0.48, 0.0, 0.1], canter: [0.3, 0.55, 0.0, 0.3], trot: [0.5, 0.0, 0.0, 0.5], walk: [0.25, 0.75, 0.0, 0.5], stand: [0, 0, 0, 0] };
    const DUTY: Record<Gait, number> = { gallop: 0.38, canter: 0.45, trot: 0.5, walk: 0.62, stand: 1 };
    const AMP: Record<Gait, number> = { gallop: 1, canter: 0.8, trot: 0.6, walk: 0.42, stand: 0 };
    const amp = AMP[g], duty = DUTY[g];
    this.legs.forEach((L, i) => {
      // order: front L(-1), front R(+1), hind L, hind R
      const off = OFF[g][L.front ? (L.side < 0 ? 0 : 1) + 2 : L.side < 0 ? 0 : 1] ?? 0, c = (((p - off) % 1) + 1) % 1;
      let up: number, lo: number;
      const reach = L.front ? 0.55 : 0.45, back = L.front ? -0.62 : -0.55;
      if (g === "stand") { up = L.front ? 0.02 : -0.22; lo = L.front ? -0.02 : 0.24; }
      else if (c < duty) { const s = c / duty; up = (reach + (back - reach) * s) * amp + (L.front ? 0 : -0.2); lo = L.front ? 0.05 * amp : 0.2 + 0.15 * amp * s; }
      else { const s = (c - duty) / (1 - duty), fl = Math.sin(Math.PI * s); up = (back + (reach - back) * sm(s)) * amp + (L.front ? 0 : -0.2); lo = L.front ? -1.9 * fl * amp : 0.2 + 1.3 * fl * amp; }
      if (air) { const k = Math.sin(Math.PI * clamp01(j * 1.15)) ** 0.6;   // over the fence: forelegs folded under, hind legs trailing
        up = up * (1 - k) + (L.front ? 0.9 : -0.85) * k; lo = lo * (1 - k) + (L.front ? -2.3 : 0.5) * k; }
      L.root.rotation.z = up; L.knee.rotation.z = lo; L.fet.rotation.z = L.front ? (lo < -0.3 ? -0.5 : 0.1 * amp) : lo > 0.6 ? 0.4 : -0.1; void i;
    });
    // body pitch and the head's nod: the neck reaches out on each stride; head carriage (+ = up)
    const pitch = g === "gallop" ? 0.05 * Math.sin(TAU * p) : g === "canter" ? 0.06 * Math.sin(TAU * p) : 0;
    const jp = air ? 0.32 * Math.cos(Math.PI * j) : 0;
    this.body.rotation.z = pitch + jp;
    this.neck.rotation.z = (q.head ?? 0) * 0.5 + (g === "gallop" ? -0.28 + 0.1 * Math.sin(TAU * p + 1.2) : g === "canter" ? -0.18 + 0.08 * Math.sin(TAU * p + 1.2) : g === "walk" ? 0.05 * Math.sin(TAU * 2 * p) : 0.05);
    this.head.rotation.z = -(q.head ?? 0) * 0.3 + (air ? 0.15 : 0);
    this.tail.rotation.z = -(q.tail ?? (g === "gallop" || air ? 0.9 : g === "canter" ? 0.6 : 0.15)) + 0.08 * Math.sin(TAU * p * 2);
    // drop onto the ground: the lowest hoof touches y = 0 (plus the jump's height over a fence)
    this.body.position.set(0, 1.3, 0); this.body.updateMatrix();
    let low = 9;
    for (const L of this.legs) { L.root.updateMatrix(); L.knee.updateMatrix(); L.fet.updateMatrix(); (L.hoof as THREE.Object3D).updateMatrix();
      this.m.copy(this.body.matrix).multiply(L.root.matrix).multiply(L.knee.matrix).multiply(L.fet.matrix).multiply(L.hoof.matrix);
      low = Math.min(low, this.v.setFromMatrixPosition(this.m).y); }
    const lift = air ? 1.55 * Math.sin(Math.PI * j) : 0;
    this.body.position.y = 1.3 - low + lift;
    this.g.updateMatrixWorld(true);
    // the reins, from the bit to the hands
    this.reins.visible = this.hasRider;
    if (this.hasRider) { const a = this.bit.getWorldPosition(this.v), b = this.hands.getWorldPosition(this.v2);
      this.g.worldToLocal(a); this.g.worldToLocal(b); const d = b.clone().sub(a);
      this.reins.position.copy(a).addScaledVector(d, 0.5); this.reins.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); this.reins.scale.set(1, d.length(), 1); this.reins.updateMatrixWorld(); }
  }
}
