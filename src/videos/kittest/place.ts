// Kit 2 test: where things stand, shared by the world and the shots.
export type V3 = [number, number, number];
export const FPS = 30;

/** where things are */
export const PATCH: [number, number] = [6, -3], PN = 7, PC = 1.25;
export const WORK: V3 = [-6, 0, -8], GUN: V3 = [10, 0, -9.5];
export const LAMPS: V3[] = [[-5, 3.3, -13.7], [5, 3.3, -13.7], [-7.6, 2.5, -7.4]];
export const FUSE: V3[] = [[1.2, 0.05, 8], [1.6, 0.05, 4], [3.4, 0.05, 1.2], [3.0, 0.05, -1.2], [1.8, 0.05, -4], [3.2, 0.05, -6.5], [6.5, 0.05, -8.2], [9.2, 0.05, -9.2], [10, 0.5, -9.9], [10, 1.05, -10.1]];
export const ARMY = 480, ARMY_Z = 52;
/** ground height: flat yard, then the hillside the army comes down, then rolling country */
export function groundH(x: number, z: number, mesh: boolean) {
  const sm = (a: number, b: number, v: number) => { const u = Math.max(0, Math.min(1, (v - a) / (b - a))); return u * u * (3 - 2 * u); };
  const hill = 16 * sm(34, 150, z) + 22 * sm(150, 330, z);
  const roll = (3.2 * Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.017) + 2.2 * Math.sin(x * 0.047 + z * 0.031)) * sm(60, 160, Math.hypot(x, z));
  const back = 5 * sm(-40, -160, z);
  const h = hill + roll + back;
  return mesh && Math.abs(x) < 31 && z > -19 && z < 31 ? -3.2 : h;
}
