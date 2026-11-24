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
import { TitanicIf, TitanicThumb, TITANICIF_FRAMES } from "./videos/titanicif/TitanicIf";
import { CrashIf, CrashThumb, CRASHIF_FRAMES } from "./videos/crashif/CrashIf";
import { PhoneIf, PhoneThumb, PHONEIF_FRAMES } from "./videos/phoneif/PhoneIf";
import { KitTest, KitTestWide, KIT_FRAMES } from "./videos/kittest/KitTest";
import { LogCannon, LOGCANNON_FRAMES } from "./videos/logcannon/LogCannon";
import { TitanicKey, TITANICKEY_FRAMES } from "./videos/titanickey/TitanicKey";
import { Rats, RATS_FRAMES } from "./videos/rats/Rats";
import { Genin, GENIN_FRAMES } from "./videos/genin/Genin";
import { Stink, STINK_FRAMES } from "./videos/stink/Stink";
import { Frozen, FROZEN_FRAMES } from "./videos/frozen/Frozen";
import { FrozenLong, FrozenThumb, FROZENLONG_FRAMES } from "./videos/frozenlong/FrozenLong";
import { Cahaba, CAHABA_FRAMES } from "./videos/cahaba/Cahaba";
import { CahabaLong, CahabaThumb, CAHABALONG_FRAMES } from "./videos/cahabalong/CahabaLong";
import { Koepenick, KOEPENICK_FRAMES } from "./videos/koepenick/Koepenick";
import { KoepenickLong, KoepenickThumb, KOEPENICKLONG_FRAMES } from "./videos/koepenicklong/KoepenickLong";
import { Peigneur, PEIGNEUR_FRAMES } from "./videos/peigneur/Peigneur";
import { PeigneurLong, PeigneurThumb, PEIGNEURLONG_FRAMES } from "./videos/peigneurlong/PeigneurLong";
import { Hayes, HAYES_FRAMES } from "./videos/hayes/Hayes";
import { Centralia, CENTRALIA_FRAMES } from "./videos/centralia/Centralia";
import { HayesLong, HayesThumb, HAYESLONG_FRAMES } from "./videos/hayeslong/HayesLong";
import { SubscribeTag } from "./videos/shared/SubscribeTag";
import { AbsoluteFill as AF } from "remotion";
const SubDemo: React.FC = () => <AF><Genin /><SubscribeTag total={GENIN_FRAMES} /></AF>;
const SubDemoWide: React.FC = () => <AF><PhoneIf /><SubscribeTag at={3000} /></AF>;

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
const KitTestPadded = padded(KitTest);
const KitTestWidePadded = padded(KitTestWide);
const FahrenheitPadded = padded(FahrenheitShort);
const DSTPadded = padded(DSTShort);
const MolassesPadded = padded(MolassesShort);
const MolassesLongPadded = padded(MolassesLong);
const PigWarPadded = padded(PigWarShort);
const PigWarLongPadded = padded(PigWarLong);
const BarberPadded = padded(BarberShort);
const LustigPadded = padded(LustigShort);
const ClocksPadded = padded(ClocksShort);
const LogCannonPadded = padded(LogCannon);
const TitanicKeyPadded = padded(TitanicKey);
const RatsPadded = padded(Rats);
const GeninPadded = padded(Genin);
const StinkPadded = padded(Stink);
const FrozenPadded = padded(Frozen);
const FrozenLongPadded = padded(FrozenLong);
const CahabaPadded = padded(Cahaba);
const KoepenickPadded = padded(Koepenick);
const PeigneurPadded = padded(Peigneur);
const PeigneurLongPadded = padded(PeigneurLong);
const PeigneurThumbPadded = padded(PeigneurThumb);
const HayesPadded = padded(Hayes);
const CentraliaPadded = padded(Centralia);
const HayesLongPadded = padded(HayesLong);
const HayesThumbPadded = padded(HayesThumb);
const KoepenickLongPadded = padded(KoepenickLong);
const KoepenickThumbPadded = padded(KoepenickThumb);
const CahabaLongPadded = padded(CahabaLong);
const CahabaThumbPadded = padded(CahabaThumb);
const FrozenThumbPadded = padded(FrozenThumb);
const SubDemoPadded = padded(SubDemo);
const SubDemoWidePadded = padded(SubDemoWide);
const HertzLongPadded = padded(HertzLong);
const HertzThumbPadded = padded(HertzThumb);
const TitanicIfPadded = padded(TitanicIf);
const TitanicThumbPadded = padded(TitanicThumb);
const CrashIfPadded = padded(CrashIf);
const PhoneIfPadded = padded(PhoneIf);
const PhoneThumbPadded = padded(PhoneThumb);
const CrashThumbPadded = padded(CrashThumb);

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
  <Composition id="TitanicIf" component={TitanicIf} durationInFrames={TITANICIF_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="TitanicIfPadded" component={TitanicIfPadded} durationInFrames={TITANICIF_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="TitanicThumb" component={TitanicThumb} durationInFrames={3} fps={30} width={1920} height={1080} />
  <Composition id="TitanicThumbPadded" component={TitanicThumbPadded} durationInFrames={3 + PAD} fps={30} width={1920} height={1080} />
  <Composition id="LogCannon" component={LogCannon} durationInFrames={LOGCANNON_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="LogCannonPadded" component={LogCannonPadded} durationInFrames={LOGCANNON_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="TitanicKey" component={TitanicKey} durationInFrames={TITANICKEY_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="TitanicKeyPadded" component={TitanicKeyPadded} durationInFrames={TITANICKEY_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Rats" component={Rats} durationInFrames={RATS_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="RatsPadded" component={RatsPadded} durationInFrames={RATS_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="SubDemo" component={SubDemo} durationInFrames={GENIN_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="SubDemoWide" component={SubDemoWide} durationInFrames={PHONEIF_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="SubDemoWidePadded" component={SubDemoWidePadded} durationInFrames={PHONEIF_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="SubDemoPadded" component={SubDemoPadded} durationInFrames={GENIN_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Genin" component={Genin} durationInFrames={GENIN_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="GeninPadded" component={GeninPadded} durationInFrames={GENIN_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Stink" component={Stink} durationInFrames={STINK_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="StinkPadded" component={StinkPadded} durationInFrames={STINK_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Frozen" component={Frozen} durationInFrames={FROZEN_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="FrozenPadded" component={FrozenPadded} durationInFrames={FROZEN_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Peigneur" component={Peigneur} durationInFrames={PEIGNEUR_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="PeigneurPadded" component={PeigneurPadded} durationInFrames={PEIGNEUR_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="PeigneurLong" component={PeigneurLong} durationInFrames={PEIGNEURLONG_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="PeigneurLongPadded" component={PeigneurLongPadded} durationInFrames={PEIGNEURLONG_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="PeigneurThumb" component={PeigneurThumb} durationInFrames={10} fps={30} width={1920} height={1080} />
  <Composition id="PeigneurThumbPadded" component={PeigneurThumbPadded} durationInFrames={10 + PAD} fps={30} width={1920} height={1080} />
  <Composition id="Centralia" component={Centralia} durationInFrames={CENTRALIA_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="CentraliaPadded" component={CentraliaPadded} durationInFrames={CENTRALIA_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="Hayes" component={Hayes} durationInFrames={HAYES_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="HayesPadded" component={HayesPadded} durationInFrames={HAYES_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="HayesLong" component={HayesLong} durationInFrames={HAYESLONG_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="HayesLongPadded" component={HayesLongPadded} durationInFrames={HAYESLONG_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="HayesThumb" component={HayesThumb} durationInFrames={10} fps={30} width={1920} height={1080} />
  <Composition id="HayesThumbPadded" component={HayesThumbPadded} durationInFrames={10 + PAD} fps={30} width={1920} height={1080} />
  <Composition id="Koepenick" component={Koepenick} durationInFrames={KOEPENICK_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="KoepenickPadded" component={KoepenickPadded} durationInFrames={KOEPENICK_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="KoepenickLong" component={KoepenickLong} durationInFrames={KOEPENICKLONG_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="KoepenickLongPadded" component={KoepenickLongPadded} durationInFrames={KOEPENICKLONG_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="KoepenickThumb" component={KoepenickThumb} durationInFrames={10} fps={30} width={1920} height={1080} />
  <Composition id="KoepenickThumbPadded" component={KoepenickThumbPadded} durationInFrames={10 + PAD} fps={30} width={1920} height={1080} />
  <Composition id="Cahaba" component={Cahaba} durationInFrames={CAHABA_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="CahabaPadded" component={CahabaPadded} durationInFrames={CAHABA_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="CahabaLong" component={CahabaLong} durationInFrames={CAHABALONG_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="CahabaLongPadded" component={CahabaLongPadded} durationInFrames={CAHABALONG_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="CahabaThumb" component={CahabaThumb} durationInFrames={10} fps={30} width={1920} height={1080} />
  <Composition id="CahabaThumbPadded" component={CahabaThumbPadded} durationInFrames={10 + PAD} fps={30} width={1920} height={1080} />
  <Composition id="FrozenLong" component={FrozenLong} durationInFrames={FROZENLONG_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="FrozenLongPadded" component={FrozenLongPadded} durationInFrames={FROZENLONG_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="FrozenThumb" component={FrozenThumb} durationInFrames={10} fps={30} width={1920} height={1080} />
  <Composition id="FrozenThumbPadded" component={FrozenThumbPadded} durationInFrames={10 + PAD} fps={30} width={1920} height={1080} />
  <Composition id="KitTest" component={KitTest} durationInFrames={KIT_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="KitTestWide" component={KitTestWide} durationInFrames={KIT_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="KitTestPadded" component={KitTestPadded} durationInFrames={KIT_FRAMES + PAD} fps={30} width={1080} height={1920} />
  <Composition id="KitTestWidePadded" component={KitTestWidePadded} durationInFrames={KIT_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="CrashIf" component={CrashIf} durationInFrames={CRASHIF_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="CrashIfPadded" component={CrashIfPadded} durationInFrames={CRASHIF_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="PhoneIf" component={PhoneIf} durationInFrames={PHONEIF_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="PhoneIfPadded" component={PhoneIfPadded} durationInFrames={PHONEIF_FRAMES + PAD} fps={30} width={1920} height={1080} />
  <Composition id="PhoneThumb" component={PhoneThumb} durationInFrames={3} fps={30} width={1920} height={1080} />
  <Composition id="PhoneThumbPadded" component={PhoneThumbPadded} durationInFrames={3 + PAD} fps={30} width={1920} height={1080} />
  <Composition id="CrashThumb" component={CrashThumb} durationInFrames={3} fps={30} width={1920} height={1080} />
  <Composition id="CrashThumbPadded" component={CrashThumbPadded} durationInFrames={3 + PAD} fps={30} width={1920} height={1080} />
  <Composition id="PigWarLongPadded" component={PigWarLongPadded} durationInFrames={PIGWARLONG_FRAMES + PAD} fps={30} width={1920} height={1080} />
</>);
