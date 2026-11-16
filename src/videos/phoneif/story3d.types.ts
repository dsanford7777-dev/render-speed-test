// Shared types and set coordinates for the 1850 phone long-form's 3D shots (world3d.ts builds, story3d.ts poses).
import type { Expr } from "../bridge/toon";

export type V3 = [number, number, number];
/** pier deck height above the water; sidewalk height on Broadway */
export const PIER = 1.6, SW = 0.14;
/** Broadway sits far from the wharf (out of each other's fog); the room is further still */
export const BW_O: V3 = [0, 0, -3000];
export const ROOM_O: V3 = [1400, 0, 1400];
const at = (o: V3) => (x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
export const Rm = at(ROOM_O);
export const Bw = at(BW_O);

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Person3 = {
  who: string; p: V3; expr: Expr; look?: number; headTilt?: number; facing?: -1 | 0 | 1; wave?: number; low?: boolean; extra?: boolean;
  side?: { phase: number; mirror: boolean; stride?: number };
  /** world points the hands reach to (a phone, a jar, a key) */
  hw?: V3[];
};
/** the phone: where it is, which way its screen faces ("cam" = toward the camera, a number = yaw), what the screen shows */
export type Phone = { p: V3; face?: "cam" | number; tilt?: number; screen: string; s?: number; glow?: number };
export type Num = { text: string; bg?: string; fg?: string; k?: number; p: V3; yaw?: number; w?: number };
export type Card = { kind: "paper" | "note" | "hat"; p: V3; spin: number; s: number; flat?: boolean };
export type Room = {
  sign: [string, string];
  table?: boolean; telegraph?: boolean; jars?: number; jarsLit?: number; magnet?: boolean; beds?: boolean; basin?: boolean;
  mermaid?: boolean; bed?: boolean; candle?: number; daguerre?: boolean; map?: boolean; wires?: boolean;
};
export type St3 = {
  light: "day" | "golden" | "night" | "fog"; cam: Cam; dof?: number; focus?: V3; closeup?: boolean;
  people?: Person3[]; subjects?: [string, V3, number][]; wipe?: { color: string; a: number };
  /** the ship: x offset (pulling in), smoke amount */
  ship?: { x?: number; smoke?: number };
  room?: Room; phone?: Phone | null; num?: Num | null; cards?: Card[];
};
