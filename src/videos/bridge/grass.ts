// Dense, fine grass over open ground (kit 2). Tufts sit on a fixed world pattern, so nothing swims when the camera
// moves, but only the ones near the camera are drawn: three nested layers, each fading out before it ends.
// The world supplies turfY(x, z): the ground height there, or null where no grass grows (paths, floors, water).
import * as THREE from "three";
import { lam } from "./build";
import { NOINK } from "./ink";

/** the colour of the bare ground under the grass (use it for the ground mesh so far-off land matches) */
export const GROUND = "#3f7a28";
const PAL = ["#2f6a22", "#3a7a26", "#44862a", "#4e912e", "#5a9c33", "#68a83a", "#79b344", "#93bd50"].map((c) => new THREE.Color(c));
const hsh = (i: number, j: number, k: number) => { let n = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1274126177)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };

export class Grass {
  private layers: { mesh: THREE.InstancedMesh; cell: number; R: number; f0: number; sc: number; cap: number }[] = [];
  private m = new THREE.Matrix4(); private q = new THREE.Quaternion(); private e = new THREE.Euler(); private v = new THREE.Vector3(); private s = new THREE.Vector3(); private c = new THREE.Color();
  constructor(root: THREE.Object3D, private turfY: (x: number, z: number) => number | null) {
    const P: number[] = [], C: number[] = [], N: number[] = []; let sg = 91; const rnd = () => (sg = (sg * 16807) % 2147483647) / 2147483647;
    for (let b = 0; b < 9; b++) { const a = b * 0.698 + rnd(), rr = b ? 0.03 + 0.07 * rnd() : 0, ox = Math.cos(a * 2.3) * rr, oz = Math.sin(a * 2.3) * rr, h = 0.14 + 0.15 * rnd(), wd = 0.008 + 0.005 * rnd(), ln = 0.03 + 0.11 * rnd();
      const cx = Math.cos(a + 1.57), cz = Math.sin(a + 1.57), lx = Math.cos(a) * ln, lz = Math.sin(a) * ln;
      const pt = (u: number, sgn: number, wk: number): [number, number, number] => [ox + lx * u * u + cx * wd * wk * sgn, h * u, oz + lz * u * u + cz * wd * wk * sgn];
      const A = pt(0, -1, 1), B = pt(0, 1, 1), Cc = pt(0.55, -1, 0.75), D = pt(0.55, 1, 0.75), T = pt(1, 0, 0);
      const tri = (p: [number, number, number][], c: number[]) => p.forEach((q, n) => { P.push(...q); C.push(c[n], c[n], c[n]); N.push(0, 1, 0); });
      tri([A, B, D], [0.55, 0.55, 0.95]); tri([A, D, Cc], [0.55, 0.95, 0.95]); tri([Cc, D, T], [0.95, 0.95, 1.12]); }
    const tuft = new THREE.BufferGeometry(); tuft.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); tuft.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); tuft.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    const gm = lam("grassBlade", () => ({ color: "#ffffff", side: THREE.DoubleSide, vertexColors: true }));
    for (const [cell, R, f0, sc, cap] of [[0.115, 11, 8, 1, 15000], [0.3, 30, 23, 1.5, 13000], [0.8, 80, 62, 2.7, 13000]]) {
      const im = new THREE.InstancedMesh(tuft, gm, cap); im.layers.set(NOINK); im.receiveShadow = true; im.frustumCulled = false; im.count = 0; im.setColorAt(0, this.c.set("#ffffff")); root.add(im);
      this.layers.push({ mesh: im, cell, R, f0, sc, cap }); }
  }
  /** place the tufts round this camera (call once a frame, after the camera is set) */
  update(cam: THREE.PerspectiveCamera) {
    const cx = cam.position.x, cz = cam.position.z, el = cam.matrixWorld.elements; let fx = -el[8], fz = -el[10]; const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl;
    this.layers.forEach((L, li) => { const { mesh, cell, R, f0, sc, cap } = L; let n = 0;
      const i0 = Math.floor((cx - R) / cell), i1 = Math.ceil((cx + R) / cell), j0 = Math.floor((cz - R) / cell), j1 = Math.ceil((cz + R) / cell);
      for (let j = j0; j <= j1 && n < cap; j++) for (let i = i0; i <= i1 && n < cap; i++) {
        const h1 = hsh(i, j, li * 7 + 1), x = (i + h1) * cell, z = (j + hsh(i, j, li * 7 + 2)) * cell, dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz);
        if (d > R || d < 0.45 || (d > 3 && dx * fx + dz * fz < 0.5 * d)) continue;
        const y = this.turfY(x, z); if (y === null) continue;
        const h3 = hsh(i, j, li * 7 + 3), fade = d > f0 ? 1 - (d - f0) / (R - f0) : 1, s = sc * (0.75 + 0.6 * h3) * fade;
        this.e.set(0, h1 * 6.283, 0); this.m.compose(this.v.set(x, y, z), this.q.setFromEuler(this.e), this.s.set(s, (1 + 0.45 * (s - 1)) * (0.8 + 0.5 * hsh(i, j, li * 7 + 4)) * Math.min(1, fade * 3), s)); mesh.setMatrixAt(n, this.m);
        // patches of colour a few metres across, plus blade-to-blade variety
        const patch = 0.5 + 0.5 * Math.sin(x * 0.31 + 1.7 * Math.sin(z * 0.23)) * Math.cos(z * 0.27 + 0.6);
        mesh.setColorAt(n, PAL[Math.min(PAL.length - 1, Math.floor((0.55 * patch + 0.45 * h3) * PAL.length))]); n++; }
      mesh.count = n; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; });
  }
}
