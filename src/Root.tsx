import React from "react";
import { Composition, Freeze, useCurrentFrame } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";

// Render-farm padding: on software GL (GitHub runners) the first frame each render tab draws comes out blank.
// "<Id>Padded" plays the real video delayed by PAD frames (frames 0..PAD-1 repeat frame 0), so every chunk can
// start PAD frames early and the stitch step drops those warm-up frames. Keep PAD in step with render.yml.
export const PAD = 2;
const padded = (C: React.FC) => {
  const P: React.FC = () => {
    const f = useCurrentFrame();
    // Warm-up frames (p < PAD) show frames well past the start, so the first real frame (0) is a *change* for every
    // tab; repeating frame 0 made R3F skip the redraw and frame 0 came out blank.
    return <Freeze frame={f < PAD ? PAD + 8 + f : f - PAD}><C /></Freeze>;
  };
  return P;
};
const BridgeShortPadded = padded(BridgeShort);

export const Root: React.FC = () => (<>
  <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="BridgeShortPadded" component={BridgeShortPadded} durationInFrames={BRIDGE_FRAMES + PAD} fps={30} width={1080} height={1920} />
</>);
