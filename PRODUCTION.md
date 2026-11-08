# Paradox Town: how a short gets made (and checked)

## Pipeline
1. **Script**: `src/videos/<short>/timeline.ts`, SEGMENTS (`say` = what the narrator reads, `show` = subtitles).
2. **Voice**: generate it in ElevenLabs, then push `public/<short>/voice-source.json` (url, target_seconds).
   The **Align to voice** workflow tightens it, transcribes it, re-times shots and subtitles to it, and starts the render.
3. **Framing check** (`qa.yml`, also the first job of every render; the render does not run if it fails):
   - Renders every 5th frame small, and measures each one in the 3D scene itself (`FWorld.qa`):
     - every character: no head cut by the frame edge, no headless body, nobody too close to the lens, no face
       filling the screen (except shots listed in `CLOSEUP_OK`); people walking through a street may cross the sides;
     - every shot's **subjects** (`FWorld.subjects`: the prop or painted mark the narration is about at that moment)
       must be in shot, not hidden behind anything, and painted numbers must not sit under the subtitles.
   - Problems that last two samples or more fail the check. One-sample blips during camera moves are listed but allowed.
   - Publishes `qa.md` and numbered contact sheets (`sheet_*.jpg`, frame, shot and time on every tile) to the `qa` branch.
4. **By-eye pass (always, before anything is delivered)**: read every contact sheet against the narration.
   The measurements can't judge what a picture *means*: does the shot show what's being said, do numbers read, is
   anything ugly. Fix, re-run the check, re-read the sheets for the shots that changed.
5. **Render**: push `render.json`. Output is a GitHub release with the MP4 (voice muxed in) and a report.
6. **Final pass on the rendered MP4**: contact sheet every 10 frames before sending.

## Rules learned the hard way (Fahrenheit #1)
- Check that props don't sit inside other geometry (the kettle was built inside the chimney).
- When a close-up would push past a half-framed person, cut instead of gliding.
- Every narrated number or prop gets a subject entry with the words it belongs to.
- Night grade turns yellow grey: highlight with size and a red bar, not yellow.
