// The Frank Hayes long-form uses the Short's places (../hayes/place.ts), plus where Frank walks a horse cool:
// along the dirt track's inner rail, in track coordinates (the track set sits at x = 0).
export * from "../hayes/place";
import { DIRT } from "../hayes/place";
export const STABLE_YARD = { x: 40, z: DIRT.z0 + 3 };
