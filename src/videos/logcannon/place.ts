// The log cannon Short: where things stand, shared by the world and the shots.
// Space: the fortified barn sits at the -z end of a flat yard, its door looking toward +z. A ditch rings it, then a
// ring of sharpened stakes. Washington's men stand in two blocks either side of the path at +z; pines grow to the east.
export type V3 = [number, number, number];
export const FPS = 30;

/** the barn's footprint, wall height, ridge height and door */
export const BARN = { x0: -6, x1: 6, z0: -13, z1: -5, h: 3.4, ridge: 5.7, doorW: 2.4, doorH: 2.7 };
/** the island of ground the barn stands on, and the outer edge of the ditch round it */
export const ISL = { x0: -8.5, x1: 8.5, z0: -15.5, z1: -2.5 };
export const DITCH = { x0: -10.3, x1: 10.3, z0: -17.3, z1: -0.7, d: 1.1 };
/** the line of stakes outside the ditch (front line at z = STAKE.z1, with a gap for the path) */
export const STAKE = { x0: -11.3, x1: 11.3, z0: -18.3, z1: 0.3, gap: 1.9 };
export const PATH_W = 1.3;
/** where the log cannon ends up, and which way it points (at the door) */
export const GUNF: V3 = [-3.2, 0, 6.0];
export const GUN_YAW = -0.283;
/** the pine that gets cut down, and where the log is worked on */
export const TREE: V3 = [17, 0, 4];
export const BENCH: V3 = [12.6, 0, 10];
/** the British general's camp table, far from the fort */
export const CAMP: V3 = [-24, 0, 27];
/** Washington's 80 men: two blocks of 5 x 8 either side of the path */
export const TROOP = 80;
export const troopAt = (i: number): V3 => { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2), col = k % 5, row = Math.floor(k / 5); return [side * (4.6 + col * 1.5), 0, 9 + row * 1.7]; };
/** the men who walk out: two abreast down the path */
export const COLN = 104, COL_GAP = 1.3;
export const colAt = (i: number, adv: number): V3 => [i % 2 ? 0.55 : -0.55, 0, BARN.z1 - 0.9 + adv - Math.floor(i / 2) * COL_GAP];

/** ground height: a flat yard, then the hillside behind the troops, then rolling country */
export function groundH(x: number, z: number, mesh: boolean) {
  const sm = (a: number, b: number, v: number) => { const u = Math.max(0, Math.min(1, (v - a) / (b - a))); return u * u * (3 - 2 * u); };
  const hill = 16 * sm(34, 150, z) + 22 * sm(150, 330, z);
  const roll = (3.2 * Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.017) + 2.2 * Math.sin(x * 0.047 + z * 0.031)) * sm(60, 160, Math.hypot(x, z));
  const back = 5 * sm(-40, -160, z);
  const h = hill + roll + back;
  return mesh && Math.abs(x) < 31 && z > -26 && z < 31 ? -3.2 : h;
}
