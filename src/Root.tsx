import { BannerArt, AvatarArt } from "./videos/brand/Brand";
import React from "react";
import { Composition, Freeze, useCurrentFrame } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { FahrenheitShort, FAHRENHEIT_FRAMES } from "./videos/fahrenheit/Fahrenheit";
import { DSTShort, DST_FRAMES } from "./videos/dst/DST";

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
const FahrenheitPadded = padded(FahrenheitShort);
const DSTPadded = padded(DSTShort);

export const Root: React.FC = () => (<>
  <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="BridgeShortPadded" component={BridgeShortPadded} durationInFrames={BRIDGE_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Banner" component={BannerArt} durationInFrames={3} fps={30} width={2560} height={1440} />
  <Composition id="Avatar" component={AvatarArt} durationInFrames={3} fps={30} width={800} height={800} />
  <Composition id="Fahrenheit" component={FahrenheitShort} durationInFrames={FAHRENHEIT_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="FahrenheitPadded" component={FahrenheitPadded} durationInFrames={FAHRENHEIT_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="DST" component={DSTShort} durationInFrames={DST_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="DSTPadded" component={DSTPadded} durationInFrames={DST_FRAMES + PAD} fps={30} width={1080} height={1920} />
</>);
