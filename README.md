# Cartoon 3D short render farm

Renders shorts made with the [claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) skill (MIT) on free GitHub Actions runners.

**To render:** set the composition in `render.json` and push. The video is split into chunks rendered in parallel, joined, checked for blank frames, and published to the `renders` branch (`<Composition>.mp4` + `report.md`).

Notes
- Runners have no GPU, so each frame takes several seconds; chunks keep a full short to well under an hour.
- Each composition needs a `<Id>Padded` twin in `src/Root.tsx` (see the `padded()` helper): software GL blanks the first frame each render tab draws, so chunks start `PAD` frames early and those frames are dropped.
- Video only for now; narration and music are muxed in later.
