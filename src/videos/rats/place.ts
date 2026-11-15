// The exploding rats Short: where things stand, shared by the world and the shots.
// Five rooms, each its own box far from the others (x apart), all laid out the same way: floor at y = 0, back wall at
// z = +4 (signs hang on it, facing -z), side walls at x = ±6, the front wall at z = -7 behind the cameras, a ceiling at 4.2.
// Cameras sit on the -z side looking toward +z, so world +x is screen LEFT.
export type V3 = [number, number, number];
export const FPS = 30;

export type RoomKey = "wk" | "shop" | "boil" | "school" | "depot";
/** each room's origin */
export const ROOM: Record<RoomKey, V3> = { wk: [0, 0, 0], shop: [60, 0, 0], boil: [120, 0, 0], school: [180, 0, 0], depot: [240, 0, 0] };
export const RW = 6, RZ0 = -7, RZ1 = 4, RH = 4.2;
const at = (k: RoomKey) => (x: number, y: number, z: number): V3 => [ROOM[k][0] + x, ROOM[k][1] + y, ROOM[k][2] + z];
export const Wk = at("wk"), Sh = at("shop"), Bo = at("boil"), Sc = at("school"), De = at("depot");

/** the workshop bench: top height, its front edge (z) and back edge */
export const BENCH = { x0: -2.6, x1: 2.6, z0: 1.0, z1: 2.0, y: 0.92 };
/** the shop counter */
export const COUNTER = { x0: -2.2, x1: 2.2, z0: 0.7, z1: 1.5, y: 1.0 };
/** the boiler: its front face (z), the firebox door's centre, the coal pile's centre and size */
export const BOILER = { z: 1.6, r: 1.45, cy: 1.75, x: 0.6 };
export const FIRE: V3 = [0.6, 0.95, 1.6];
export const COAL: V3 = [-2.1, 0, 0.6];
export const COAL_R = 1.25, COAL_H = 0.85;
/** coal surface height at (x, z) in the boiler room's own coordinates */
export const coalY = (x: number, z: number) => Math.max(0, COAL_H * (1 - Math.hypot(x - COAL[0], (z - COAL[2]) * 1.1) / COAL_R));
/** the school: the glass case on its stand, the lectern */
export const CASE: V3 = [-0.6, 1.1, 1.9];
export const LECTERN: V3 = [1.9, 0, 1.6];
/** the depot: the crate the shipment came in */
export const CRATE: V3 = [0, 0, 1.0];
