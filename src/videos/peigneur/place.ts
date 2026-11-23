// The Lake Peigneur Short (November 20, 1980: an oil rig drills into a salt mine and the lake drains into it).
// Two sets, far apart along x. Cameras sit on the -z side looking toward +z, so world +x is screen LEFT.
//   lake   Lake Peigneur and its shores: a shallow lake (bed 3 m down), Jefferson Island rising on the +x side (the
//          Jefferson house and live oaks on top, the salt mine's headframe on its near slope), the Texaco rig standing
//          in the water over the mine, barges and a tug moored round it, the Delcambre Canal coming in on the -x side.
//          Posed per shot: the water level, the whirlpool (its radius), the crater (after the hole opens), the stream
//          and waterfall from the canal (running backwards), the rig (tilt, roll, sink), the barges and the tug.
//   mine   one room of the salt mine, 1,300-1,500 ft down: white salt walls, giant pillars, lamps, a loader, the
//          shaft station with the one elevator cage. Water can come through the roof and run across the floor.
// Scale: metres. The rig's derrick is 45 m (about 150 ft); the crater 45 m deep (the waterfall was ~150-164 ft).
import { nz } from "../frozen/fsets";
export type V3 = [number, number, number];
export const FPS = 30;

export type SetKey = "lake" | "mine";
export const SET: Record<SetKey, V3> = { lake: [0, 0, 0], mine: [3000, 0, 0] };
const at = (k: SetKey) => (x: number, y: number, z: number): V3 => [SET[k][0] + x, SET[k][1] + y, SET[k][2] + z];
export const Lk = at("lake"), Mn = at("mine");

const sm = (a: number, b: number, x: number) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };

// ---- the lake ----
/** the lake: an ellipse (centre, half axes); the bed is 3 m under the surface */
export const LC = { x: 0, z: 170 }, AX = 430, AZ = 240, BED = -3;
/** Jefferson Island: a salt dome hill, 22 m high, on the +x side */
export const IC = { x: 250, z: 190 }, IR = 130, IH = 22;
/** the hole: where the rig stood and the whirlpool turned; the crater it left (radius, depth below the bed) */
export const HOLE = { x: 70, z: 160 }, RC = 95, CD = 45;
/** the Delcambre Canal comes in from -x along z = CANAL_Z; after the lake drained it ran backwards across the bed to the
 *  crater's rim at W0 and poured over */
export const CANAL_Z = 215, CANAL_X0 = -640, CANAL_X1 = -410, CANAL_HW = 11;
export const W0 = { x: HOLE.x - RC + 2, z: HOLE.z + 18 };
/** the near shore, where people stand to watch (the cameras' side) */
export const SHORE_Z = -66;
/** the Jefferson house (top of the island) and the salt mine's headframe (near slope of the island) */
export const HOUSE = { x: 268, z: 228 };
export const HEADFRAME = { x: 196, z: 108 };
/** a brick chimney still standing in the water today */
export const CHIMNEY = { x: 152, z: 96 };
/** the fisherman's spot */
export const FISH = { x: -40, z: 70 };

const lakeE = (x: number, z: number) => ((x - LC.x) / AX) ** 2 + ((z - LC.z) / AZ) ** 2;
/** the island's height above the lake surface at (x, z) (negative = under water) */
export const islandY = (x: number, z: number) => { const d = Math.hypot(x - IC.x, z - IC.z); return BED + (IH - BED) * sm(IR, 26, d) + 1.6 * Math.sin(x * 0.05 + z * 0.04) * sm(IR, 60, d); };
/** the crater floor (only after the hole opened) */
export const craterY = (x: number, z: number) => { const r = Math.hypot(x - HOLE.x, z - HOLE.z); if (r >= RC) return 99; const u = r / RC; return BED - CD * Math.pow(1 - u * u, 0.8) + 0.8 * Math.sin(x * 0.3 + z * 0.2) * u; };
/** ground height before the crater (lake bed, shores, island, the canal) */
export const groundY = (x: number, z: number) => {
  const e = lakeE(x, z);
  let y = e < 0.9 ? BED : e < 1.0 ? BED + (0.6 - BED) * sm(0.9, 1.0, e) : 0.6 + 1.6 * sm(1.0, 1.8, e) + 0.5 * Math.sin(x * 0.031 + z * 0.023) * sm(1.05, 1.4, e);
  y = Math.max(y, islandY(x, z));
  if (x < CANAL_X1 + 30 && Math.abs(z - CANAL_Z) < CANAL_HW + 6) y = Math.min(y, BED + (0.6 - BED) * sm(CANAL_HW, CANAL_HW + 6, Math.abs(z - CANAL_Z)));
  { let bt: Terrace | null = null, bw = 0; for (const t of TERRACES) { const w = terraceK(t, x, z); if (w > bw) { bw = w; bt = t; } } if (bt) y += (bt.y - y) * bw; }   // the nearest terrace wins
  return y;
};
/** level terraces cut into the island where something stands (Nov 22: the house was built level on a 6 m slope, so its
 *  uphill side was buried): the ground is levelled under the house, the headframe's pad and the parking lot, and
 *  blends back to the hill over `m` metres round each */
type Terrace = { x: number; z: number; hx: number; hz: number; y: number; m: number };
const terraceK = (t: Terrace, x: number, z: number) => { const dx = Math.max(0, Math.abs(x - t.x) - t.hx), dz = Math.max(0, Math.abs(z - t.z) - t.hz), d = Math.hypot(dx, dz); return d >= t.m ? 0 : 1 - sm(0, t.m, d); };
const TERRACES: Terrace[] = [];
/** how much a terrace flattens the ground here (0..1): the ground sheet's noise is faded out by it too */
export const terraceW = (x: number, z: number) => TERRACES.reduce((a, t) => Math.max(a, terraceK(t, x, z)), 0);
/** the ground's height as actually built: the ground sheet adds a little noise on land (psets mkGround) */
export const builtY = (x: number, z: number) => { const h = groundY(x, z), w = Math.min(1, Math.max(0, (h - 0.7) / 3.3)); return h + nz(x, z) * 3 * w * w * (3 - 2 * w) * (1 - terraceW(x, z)); };
/** the highest and lowest built ground under a footprint (centre, half sizes): a building's floor goes just above the
 *  highest point and its foundation down to the lowest, so on a slope no corner is buried and none floats (Nov 22) */
export const footprint = (cx: number, cz: number, hx: number, hz: number) => { let hi = -1e9, lo = 1e9;
  for (let i = 0; i <= 8; i++) for (let k = 0; k <= 8; k++) { const y = builtY(cx - hx + (2 * hx * i) / 8, cz - hz + (2 * hz * k) / 8); hi = Math.max(hi, y); lo = Math.min(lo, y); }
  return { hi, lo }; };
/** ground height after the crater opened */
export const groundAfter = (x: number, z: number) => Math.min(groundY(x, z), craterY(x, z));

TERRACES.push(
  { x: HOUSE.x, z: HOUSE.z - 1.3, hx: 12, hz: 9.5, y: islandY(HOUSE.x, HOUSE.z), m: 9 },
  { x: HEADFRAME.x, z: HEADFRAME.z, hx: 15, hz: 13, y: islandY(HEADFRAME.x, HEADFRAME.z), m: 10 },
  { x: HEADFRAME.x + 30, z: HEADFRAME.z - 18, hx: 15, hz: 9, y: islandY(HEADFRAME.x + 30, HEADFRAME.z - 18), m: 9 });
/** the house's floor (above the highest ground under it, gallery included) and the top of the headframe's pad */
export const HOUSE_F = footprint(HOUSE.x, HOUSE.z - 1.3, 10.4, 7.6).hi + 0.35;
export const PAD = footprint(HEADFRAME.x, HEADFRAME.z, 14, 12), PAD_Y = PAD.hi + 0.15;

/** the whirlpool's surface: radius R at the top, depth D in the middle; y relative to the water level */
export const funnelY = (r: number, R: number, D: number) => (r >= R ? 0 : -D * Math.pow(1 - r / R, 2.5));

// ---- the rig ----
/** where the rig stands (over the hole), the deck height, the derrick height */
export const RIG = { x: HOLE.x, z: HOLE.z, deck: 6.5, tower: 45 };
/** barges and the tug moored round the rig before: [x, z, yaw] in lake coordinates */
export const BARGES: [number, number, number][] = [
  [HOLE.x - 34, HOLE.z - 20, 0.2], [HOLE.x - 36, HOLE.z + 4, 0.15], [HOLE.x + 36, HOLE.z - 12, -0.3], [HOLE.x + 30, HOLE.z + 28, -0.5], [HOLE.x - 10, HOLE.z + 40, 1.5],
  [HOLE.x - 52, HOLE.z + 46, 0.9], [HOLE.x + 4, HOLE.z - 44, 1.6], [HOLE.x - 56, HOLE.z - 34, 0.4], [HOLE.x + 58, HOLE.z + 10, -1.2], [HOLE.x + 52, HOLE.z - 40, -0.8], [HOLE.x - 30, HOLE.z + 70, 1.1],
];
export const TUG: [number, number, number] = [HOLE.x + 44, HOLE.z - 78, 0.4];
export const LAKE_SUN: V3 = [0.52, 0.48, -0.71];

// ---- the mine ----
/** a room-and-pillar level: floor at 0, roof at ROOF; square pillars PIL wide, centred at x, z = +-17, +-51, +-85
 *  (z only below END_Z), so the open drifts run along x = 0, +-34, +-68 and z = -34, -68. The level ends in a solid
 *  salt wall at END_Z, where the shaft station is: the one elevator cage at CAGE. Water comes through the roof at BREACH. */
export const ROOF = 14, PITCH = 34, PIL = 16;
export const PILLARS: [number, number][] = (() => { const o: [number, number][] = []; for (const x of [-85, -51, -17, 17, 51, 85]) for (const z of [17, -17, -51, -85, -119]) o.push([x, z]); return o; })();
export const END_Z = 34;
/** the cage stands IN the shaft, behind an opening in the end wall (Nov 22: it used to hang in front of the wall and
 *  rose up the outside of it); the opening is SHAFT_W either side of x and SHAFT_H high, the shaft SHAFT_D deep */
export const SHAFT_W = 2.1, SHAFT_H = 3.3, SHAFT_D = 3.6;
export const CAGE = { x: 0, z: END_Z + 1.8 };
export const BREACH = { x: -34, z: -68 };
export const MINE_W = 110;
