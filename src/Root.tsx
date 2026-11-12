import { BannerArt, AvatarArt } from "./videos/brand/Brand";
import React from "react";
import { Composition, Freeze, useCurrentFrame } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { FahrenheitShort, FAHRENHEIT_FRAMES } from "./videos/fahrenheit/Fahrenheit";
import { DSTShort, DST_FRAMES } from "./videos/dst/DST";
import { MolassesShort, MOLASSES_FRAMES } from "./videos/molasses/Molasses";
import { MolassesLong, MOLASSESLONG_FRAMES } from "./videos/molasseslong/MolassesLong";
import { PigWarShort, PIGWAR_FRAMES } from "./videos/pigwar/PigWar";
import { PigWarLong, PIGWARLONG_FRAMES } from "./videos/pigwarlong/PigWarLong";
import { BarberShort, BARBER_FRAMES } from "./videos/barber/Barber";
import { LustigShort, LUSTIG_FRAMES } from "./videos/lustig/Lustig";
import { ClocksShort, CLOCKS_FRAMES } from "./videos/clocks/Clocks";
import { HertzLong, HertzThumb, HERTZLONG_FRAMES } from "./videos/hertzlong/HertzLong";

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
const MolassesPadded = padded(MolassesShort);
const MolassesLongPadded = padded(MolassesLong);
const PigWarPadded = padded(PigWarShort);
const PigWarLongPadded = padded(PigWarLong);
const BarberPadded = padded(BarberShort);
const LustigPadded = padded(LustigShort);
const ClocksPadded = padded(ClocksShort);
const HertzLongPadded = padded(HertzLong);
const HertzThumbPadded = padded(HertzThumb);

export const Root: React.FC = () => (<>
  <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="BridgeShortPadded" component={BridgeShortPadded} durationInFrames={BRIDGE_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Banner" component={BannerArt} durationInFrames={3} fps={30} width={2560} height={1440} />
  <Composition id="Avatar" component={AvatarArt} durationInFrames={3} fps={30} width={800} height={800} />
  <Composition id="Fahrenheit" component={FahrenheitShort} durationInFrames={FAHRENHEIT_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="FahrenheitPadded" component={FahrenheitPadded} durationInFrames={FAHRENHEIT_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="DST" component={DSTShort} durationInFrames={DST_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="DSTPadded" component={DSTPadded} durationInFrames={DST_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Molasses" component={MolassesShort} durationInFrames={MOLASSES_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="MolassesPadded" component={MolassesPadded} durationInFrames={MOLASSES_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="MolassesLong" component={MolassesLong} durationInFrames={MOLASSESLONG_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="MolassesLongPadded" component={MolassesLongPadded} durationInFrames={MOLASSESLONG_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="PigWar" component={PigWarShort} durationInFrames={PIGWAR_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="PigWarPadded" component={PigWarPadded} durationInFrames={PIGWAR_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="PigWarLong" component={PigWarLong} durationInFrames={PIGWARLONG_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="Barber" component={BarberShort} durationInFrames={BARBER_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="BarberPadded" component={BarberPadded} durationInFrames={BARBER_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Lustig" component={LustigShort} durationInFrames={LUSTIG_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="LustigPadded" component={LustigPadded} durationInFrames={LUSTIG_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Clocks" component={ClocksShort} durationInFrames={CLOCKS_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="ClocksPadded" component={ClocksPadded} durationInFrames={CLOCKS_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="HertzLong" component={HertzLong} durationInFrames={HERTZLONG_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="HertzThumb" component={HertzThumb} durationInFrames={3} fps={30} width={1920} height={1080} />
  <Composition id="HertzThumbPadded" component={HertzThumbPadded} durationInFrames={3 + PAD} fps={30} width={1920} height={1080} />
  <Composition id="HertzLongPadded" component={HertzLongPadded} durationInFrames={HERTZLONG_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="PigWarLongPadded" component={PigWarLongPadded} durationInFrames={PIGWARLONG_FRAMES + PAD} fps={30} width={1920} height={1080} />
</>);
