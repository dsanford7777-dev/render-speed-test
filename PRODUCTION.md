# Paradox Town: how a short gets made (and checked)

This file and the Claude project doc `claude/production-checklist.md` hold the same checklist (synced Nov 22, 2026).

## Pipeline
1. **Script**: `src/videos/<short>/timeline.ts`, SEGMENTS (`say` = what the narrator reads, `show` = subtitles).
2. **Voice**: generate it in ElevenLabs, then push `public/<short>/voice-source.json` (url, target_seconds).
   The **Align to voice** workflow tightens it, transcribes it, re-times shots and subtitles to it, and starts the render.
   The composition id must already be in `src/Root.tsx` (its name = the folder name, any case, **letters only**), or the align step fails.
3. **Framing check** (`qa.yml`, also the first job of every render; the render does not run if it fails):
   - Renders every 5th frame small, and measures each one in the 3D scene itself (`FWorld.qa`):
     - every character: no head cut by the frame edge, no headless body, nobody too close to the lens, no face
       filling the screen (except shots listed in `CLOSEUP_OK`); people walking through a street may cross the sides;
     - every shot's **subjects** (`FWorld.subjects`: the prop or painted mark the narration is about at that moment)
       must be in shot, not hidden behind anything, and painted numbers must not sit under the subtitles.
   - Problems that last two samples or more fail the check. One-sample blips during camera moves are listed but allowed.
   - Publishes `qa.md` and numbered contact sheets (`sheet_*.jpg`, frame, shot and time on every tile) to the `qa` branch.
   - **Run it locally first on every changed range** (Nov 21): `node scripts/qa.mjs <Comp> <first> <last> <step> 0.3 <dir>` then `node scripts/qa-report.mjs <dir> <step>`, with `BROWSER_EXE` set. One range at a time (parallel runs share a tmp folder).
4. **By-eye pass (always, before anything is delivered)**: read every contact sheet against the narration.
   The measurements can't judge what a picture *means*: does the shot show what's being said, do numbers read, is
   anything ugly. Fix, re-run the check, re-read the sheets for the shots that changed.
   **Check every changed shot from its first frame to its last, not two frames** (Nov 13: the dam lake poked through the wall in the clocks Short because only two frames were checked).
   **Go through the "No known weak spots" list below shot by shot. Anything on it gets fixed here, before the render.**
5. **Render**: push `render.json`. Output is a GitHub release with the MP4 (voice muxed in) and a report.
6. **Final pass on the rendered MP4**: contact sheet every 10 frames before sending. Run the "No known weak spots" list again on these sheets. If anything on it shows, patch the shots (see "Fixing a video") and look again. **Do not upload with a list of weak spots.**
7. **Upload**: push `upload.json`. Default publish times (Daniel, Nov 16): **Shorts 10:00 AM Central, long-forms 12:00 PM Central.** If a Short links a long-form, upload the long-form first to get its id (or upload the Short with `LONGFORM_LINK_PENDING` and fix it with `manage.json` `replace_text` afterwards). If the upload job sits in `actions/checkout` for more than a few minutes, cancel and rerun it (Nov 16: hung 20 min, rerun took 1.5 min). **Scheduling (Daniel, Nov 20):** once a story's Short and long-form are both made, they go on the next day with nothing scheduled yet, at those times.

## No known weak spots (Daniel, Nov 17, after the Great Stink Short: "make sure you don't make those mistakes from now on")
The Great Stink Short was uploaded with seven weak spots that were seen, written down and shipped anyway. That is the mistake. A weak spot that has been noticed is a defect to fix, not a note for the report. Every video from now on passes this list at step 4 and again at step 6.

- **Frame 0 matches the frames after it.** The hook's first frame has the same framing as the next ten; no wider first frame. Compare frame 0, 5 and 10 in stills.
- **Nobody is half in frame, anywhere.** That includes slides, pans and background people. Marking a character `extra` or `pass` only hides them from the framing check; it does not fix the picture. Move them fully in or take them out. (Great Stink: half-cut bench members on the "for years" slide.)
- **Whoever the line is about shows their face.** Three-quarter to camera at least once in the shot, not a profile behind a prop. (Great Stink: the man running for the door was a profile behind a handkerchief.)
- **Every thing the narration names is on screen when it is named.** Places and objects, not just people: if he runs "for the door", the door is in shot; if they "flush their toilets" into the river, a toilet or a pipe is shown. Go through the script noun by noun and point to each one in a still.
- **The subscribe mascot stands on empty floor.** Stage the last shot so nobody is where the mascot walks in and stands (left-centre, feet at ~57%). (Great Stink: he stood over the soaking man.)
- **Liquid reads at phone size.** A stream, pour or spill is at least as thick as a character's arm and a clearly different colour from what is behind it. (Great Stink: the pump's brown stream was a thin line.)
- **Water is never one flat plane.** It gets moving waves or ripples and a light reflection or highlight, and something breaks where it meets a bank or a hull.
- **Small set dressing reads as what it is.** Clothes on a line, signs and tools get their own colours and a lit side; nothing important is a dark shape against the sky.
- **A new set is looked at from every camera in the story, first frame to last,** before the render, not only the frames the framing check sampled.

### Added Nov 20 (Daniel's frames from the posted Cahaba long-form, 1:16–1:17, and Longyearbyen: "issues that need to not happen anymore")
- **Every support reaches the ground.** Trestle legs, posts, piers and poles end on the ground or on a footing, on slopes too: no legs stopping in mid-air. (Cahaba long-form: the timber bents beside the stone pier hung above the slope.) Check each support's bottom against the terrain height in code, not by eye.
- **Trees and scenery never pass through a structure.** No tree growing through a bridge deck, truss, roof or wall; keep a clear radius round every structure when scattering trees and rocks. (Cahaba: a pine rose through the span.)
- **Nothing floats.** Rocks, boulders and props rest on the ground or on something; snap scattered rocks to the terrain. (Cahaba: boulders hanging in the air near the deck.)
- **Distant walls and slopes get texture and detail,** never bare flat grey/white triangles (the background rule applies to far terrain too). (Cahaba: the far gorge wall.)
- **Tools are really held and work when they look like they work.** Hands on the handle; dirt only flies when the blade is actually digging. (Longyearbyen tent: dirt flew off a resting shovel.)
- **Nobody stands on a grave or other thing they wouldn't stand on.** Stage people beside the mounds and coffins, not on top. (Longyearbyen tent.)
- **Diagrams must be physically right.** The sun is in the sky, never drawn underground or inside a soil layer; every icon sits in the layer or place it describes. (Longyearbyen long-form 5:37: the sun was drawn inside the permafrost.)
- **Diagram labels never cover the things they label, and nothing is cut by the frame edge.** Keep a margin on every side for signs and text. (Same frame: "THAWS EVERY SUMMER" covered a coffin, the "SUMMER: IT THAWS" sign was cut off at the top, and labels ran to the right edge.)

### Added Nov 21 (Daniel's frames from the posted Köpenick long-form)
- **Flags read correctly at phone size.** Every stripe is visible: a dark stripe on a dark wall needs light on it or an outline. (Köpenick beer hall: the Imperial black-white-red flag lost its black stripe in the dark and read as Poland's white-red flag.) Check each flag in a still against the real one.
- **Every held prop is held and reads as what it is.** A prop someone has is in a visible hand, not hanging in front of or beside the body, and at a size and shape anyone can name. (Köpenick: the L-shaped shoe last over his chest in the "in prison" shot didn't read as a shoe at all; in the "caught at breakfast" shot the bread roll was an oversized brown cylinder floating at his shoulder with no hand showing.) The Nov 13 rule already said hands on props; check it on every prop, every shot.
- **The set matches the line.** When the narration says where we are ("in prison"), the shot is that place or something that clearly means it, not a reused set from another beat. (Köpenick: "in prison" played in the junk shop with its price tags.)
- **Faces read at phone size.** A "shock" mouth must not sit on top of a moustache or look like a gaping hole; check every close face with a moustache in a still. (Köpenick "for the reward": the big open "O" over his white moustache read as nothing anyone could name.) The Peigneur world now draws "shock" as "nervous" on anyone with a moustache.

### Added Nov 21 (Lake Peigneur build, found in our own still review)
- **No scenery just off frame reaching into it.** A tree limb whose canopy is out of shot reads as a black wire across the ground. Add every camera's spot (start and end) to the tree/rock clear-zones, not only the structures. (Peigneur garden shots: two long dark "wires" across the lawn. Nov 22: most such "wires" were really the `mergeFacets` bug below, not limbs.)
- **Moving set pieces turn about their own pivot.** A group rotated about the world origin swings hundreds of metres away. (Peigneur: the slumping island block flew into the sky over the whirlpool.) Set the group position so the pivot stays put, and hide pieces that would poke through the ground at rest.
- **Skies are closed.** A sky cylinder gets a lid in its top colour, or a tilted-up camera sees past the rim as a white arc.
- **Don't shoot through a lattice.** Open the face the camera looks through (a derrick's V-door) or move the camera; X-braces across the faces make the shot unreadable.
- **A Short shot reused in 16:9 shows more on each side.** Recheck every reused shot for what the portrait frame hid (Peigneur: barge hulls, a tug wheelhouse, the mine shed).
- **Board text fits the frame.** Long lines on number boards and check lists get shorter words or a smaller size; labels never overlap each other. **Local stills use a narrower stub font, so they can't prove a line fits:** size each line by character count (Montserrat 900 caps ≈ 0.78 em a character, keep it under ~1,600 px on a 1920 board, which leaves room for the board's own slide). Peigneur long-form: three board lines that fit locally ran off the frame in the real render and had to be patched.

### Added Nov 22 (Daniel's frames from the posted Lake Peigneur Short and long-form: "fix the code")
Fixed in the code the same day (Peigneur world and the shared `bridge/scenery.ts`); the rules stand for every new video.
- **Long thin dark lines across ground or water are broken geometry, not scenery.** `mergeFacets` (bridge/scenery.ts) copied indexed geometry (cylinder trunks, rods) as a triangle soup, which stitched long slivers across the scene: the "wires" on the Peigneur lawns, the black line across the lake today, the stray lines under the oaks. Fixed for every world that uses it (Cahaba, Köpenick, Longyearbyen, Great Stink, kit test). Any new merge helper must call `toNonIndexed()` first. To find a mystery line: the colour-index render (below), then raycast through its pixels and print what is hit; a NaN distance means broken geometry.
- **People ride what they ride.** In a boat or vehicle they move, bob, rock and turn with it (`ride: "skiff"` or a vehicle index in the Peigneur world; `ride` in the Titanic world), and they stand in the gaps between seats, never on a seat. Compare two frames 20 apart in every boat shot. (Peigneur: the skiff rocked and the two men didn't; both stood on the thwarts, which read as orange blocks under their feet.)
- **Every part of one body of water is painted in that water's colours.** A whirlpool, a pour or a fall uses the lake's palette and meets the lake with no seam or raised rim; foam is thin and broken. Wide white bands read as gaps in the water. (Peigneur: a striped tan/brown funnel and wide white rings.)
- **Running water runs the right way.** Check the direction against the facts and in two frames ~10 apart: downhill on a fall, and the way the story says (the Delcambre Canal ran from the Gulf INTO the crater). (Peigneur: the waterfall texture scrolled uphill.)
- **Running water is never blocky.** Soft, blurred streaks and foam; no hard rectangles (they read as pixels / Minecraft). A stream ribbon follows the ground at every vertex and fades at its edges, so it lies in its bed instead of floating over it like a slab.
- **Buildings sit on level ground.** On a slope, level the ground under the building and its yard (a terrace, `TERRACES` in peigneur/place.ts) and give it a foundation down to the lowest point, posts that reach the ground and steps to the door. People standing there use the terrace height. (Peigneur: the Jefferson house stood on a 6 m slope with its uphill side buried.)
- **Work is shown where the work is.** A pick strikes a wall or face, chips fly off the struck surface at the blow, a shovel goes into a heap. (Peigneur: a miner swung a pick at empty air in the middle of the room, chips appearing out of nowhere.)
- **Every way the narration says people moved is shown.** "In carts and vehicles", "drove": the vehicles are on screen with the people in them. (Peigneur long-form: the men walked while the line said carts; LaSalle "drove" while standing on foot.)
- **Lifts and cages run in a real shaft.** An opening in the wall, the shaft behind it; as the cage rises it goes out of sight. A subject that is meant to vanish stops being a subject once it has gone. (Peigneur: the cage hung in front of a painted dark rectangle and rose up the outside of the wall.)
- **Signs sit where every camera on them holds them whole.** Check each sign in every shot that sees it. (Peigneur: "CAGE: 8 MEN" cut by the frame; the signs are now centred over the shaft.)
- **Shorts: nothing important in the top ~17 % of the frame.** YouTube's Subscriptions / Live / Trends buttons cover roughly 7–13 % in the Shorts feed. Callouts and pills go at y ≥ 19 %. (Peigneur: "3 HOURS" and the Delcambre Canal pill sat under them.)
- **The picture holds while its caption is up.** If a caption ("11 BARGES", "WATERFALL POURED") is still on screen after the cut, the next shot must still show that thing, or the cut moves. Make the thing a subject of both shots. (Peigneur: "11 BARGES" over a shot of trees; "the waterfall poured into the hole" over a crater with no waterfall.)

If one of these can't be fixed in a reasonable time, the shot is restaged or cut so the problem is gone. The report to Daniel after an upload should have nothing under "weak spots".

## Fixing a video after it's rendered or uploaded (Nov 16)
- **Patch a few shots instead of re-rendering:** push `render.json` with `"range": [first, last]` (frames of the shots to fix; cuts are hard, so a shot runs from its `a` to the next shot's `a` − 1), then push `splice.json` `{"base": <final release>, "patch": <range release>, "frames": [first, last], "composition": ...}`. The Splice workflow swaps those frames in, keeps the base audio, checks the frame count, and releases `<Comp>-<date>-patch`. Don't render patches locally: the sandbox has no Montserrat, so text would not match.
- **YouTube can't swap the file of an existing upload.** Upload the fixed release as a new video, then push `manage.json` (Edit or delete uploaded videos workflow, `scripts/youtube_manage.py`): `replace_text` fixes links in other videos' descriptions; `delete` removes the old upload only if its exact title matches. Also drop the old id from `pending-comments.json`.
- **Map dots must sit on land:** check every city in a drawn map against the coastline polygon (point-in-polygon, ≥ 10 map units inside) before rendering. The 1850 map had New Orleans and Mobile in the Gulf and Buffalo in Lake Erie.

## Subscribe end card (Daniel, Nov 16: every Short from #12 on)
- Why: first-week analytics showed 6 net subscribers from ~18,000 Shorts views. Daniel asked for an animated subscribe button floating into the screen.
- Component: `src/videos/shared/SubscribeTag.tsx`. Add `<SubscribeTag total={TOTAL} />` as the last child of the Short's root `AbsoluteFill` (after Captions).
- What it does (Daniel's idea, Nov 16): no voice line, so the loop survives. Over the last ~3.2 s a "Paradox Town · a new paradox every day" card (real channel avatar, `public/brand/avatar.png`) floats up near the top. The mascot (the red-cap "you" from the What If long-forms, who is also the channel avatar) walks in from the left, winds up and slaps the red SUBSCRIBE button with an open palm ("SMACK!", screen shake, ripple), it flips to grey SUBSCRIBED with a ringing bell, he turns to camera, grins and gives a thumbs up, then everything floats away. The last 8 frames are clear, so the end still matches frame 0.
- Sound: Daniel's slap effect (`public/brand/slap.mp3`, "Slap with Glove") plays on the hit. The render workflow mixes it in automatically for any composition whose folder uses `<SubscribeTag`, 70 frames before the end (`SLAP_FROM_END`), started 0.203 s early because the sound's impact sits that far into the file. Don't override `len`/`tail` on a Short, or the slap and the sound drift apart.
- The mascot is drawn with the same toon code as the 3D cast (`bridge/toon.ts` on a 2D canvas), with a white sticker outline so he reads as an overlay, not someone standing in the scene. He stands above the captions (feet at ~57%).
- Props: `len` (frames on screen, default 96), `tail` (clear frames at the end, default 8), `top` (card centre in %, default 20), `line` (tagline), `outfit` + `seed` (use a Short's own main character instead of the mascot), `mascot: false` (card only).
- **Long-forms too (Daniel, Nov 16, from the next long-form on; the 1850 video is left as is):** every long-form script asks twice: once early, right after the cold open (e.g. "If you like weird history, subscribe."), and once near the end, before the closing question. Each ask gets `<SubscribeTag at={subscribeAt(wordAt(seg, "subscribe"))} />`, so the slap lands on the word "subscribe". In 16:9 the card sits upper right (scaled 0.72) and the mascot walks in from the right edge, mirrored. The render workflow puts the slap sound on every "subscribe" in the aligned WORDS (`scripts/slap_times.py`; Shorts with no spoken "subscribe" fall back to 70 frames before the end). Preview: `SubDemoWide` (the 1850 video with a test card at frame 3000).
- By-eye check: look at stills of the last 3.5 s (long-forms: the 3.5 s from each card's start). If the card hides a stamp or the mascot hides the main face, move the card with `top` (the mascot's spot is fixed in the component, so move the characters out of his spot instead). Stamps in the last 3.2 s sit clear of the card (Great Stink: `y: 82`). Preview: the `SubDemo` composition (the Genin Short with the card) and `thumbs/subscribe-tag-preview.jpg`.

## Visual rules (Daniel, Nov 13, kit 2 look; first applied on the KitTest and the clocks Short #7)
Standing rules for every new video, Shorts and long-form. The look comes from the Ricks Clips study in `claude/reference-channels.md`; the approved test is release `KitTest-20261113-1805` (`src/videos/kittest/`).
- **No bare flat lawn.** Grass is dense and looks the same in every shot.
- **Nothing floats in front of a character.** Hands are on whatever they hold (sticks, clocks, levers, hammers).
- **Things move in the direction they are hit.** A blast throws people outward from it.
- **Ground must not break into cubes.** Daniel rejected cube blocks as Minecraft-like; ground gives way in irregular chunks of earth.
- **One cannon fires one ball.** A sky full of trails needs many small rockets.
- **Crowds never walk through each other.** Keep fixed spacing in ranks and queues.
- **Shots in one scene share the same time of day.**
- **Cords, effects and water stay attached to what they belong to** (a plug in its socket, pulses riding the cord, a lake held by its dam).

### Props and boats (Daniel's notes on the posted Titanic v2, Nov 14; fixed in the code for future videos)
- **Everything on a table sits fully on it.** The fourth paper stack hung half off the end. Check prop footprints against the tabletop edges.
- **Paper resting on something lies flat on it** (`flat: true` on a paper card; `Cards.put(..., flat)` in `hertzlong/props3d.ts`). Camera-facing cards are only for paper in the air or in a hand. Slips stood upright and hovered above the pile.
- **Wheels have their spokes all the way round.** The ship's wheel had 4 spokes bunched in one quarter (rotation `k/8·π` should have been `k/4·π`). Check any radial prop (wheels, clock hands, gears) in a still.
- **Boats are open hulls** (side walls, floorboards, thwarts), not closed boxes. A closed box makes passengers look like they stand on a lid.
- **People in a moving boat ride it.** Give them `ride: <boat index>` and boat-local places (`inSeaBoat` in `titanicif/story3d.ts`), so they rotate and bob with it and stay inside the hull. Placing them in world coordinates put one through the side and sank the others to different depths.
- **Nobody stands where a seat or bench crosses.** Character cards are flat, so any bar running through their spot cuts through the body; skirts show it most (Daniel, Nov 14: seats bled through the women in dresses). Adults stand in the gaps between thwarts (`SEA_GAPS`); children stand on a thwart (`SEA_THWARTS`) so they see over the side.

### How to build it (code)
- **Hands:** give a pose `hands: V3[]` (world points); the arm reaches to where each point falls on the card. A card is 600 units wide, so a hand reaches about 0.6 m from the body centre. Side walkers use `carry`. Both are in `bridge/toon.ts`.
- **Grass:** `new Grass(root, turfY)` from `bridge/grass.ts`. `turfY(x, z)` returns the ground height, or null where no grass grows. Call `grass.update(cam)` every frame after the camera is set. Blades are placed round the camera from a fixed world pattern, so they don't swim between frames.
- **Smoke and dust that must cover outlines:** put them on layer `AFTERINK` with `ink.afterInk = true` (`bridge/ink.ts`).
- **Render cost:** about 5.4 s per frame (Titanic was 3.2). A Short takes about 45 minutes on Actions with 20 chunks.
- **Build traps from the Great Stink Short (Nov 17):** `boxGeo` has no bottom face unless asked, so a room needs its own ceiling plane; `walker()` takes an absolute x, so add the set's offset; a shadow twin's material must carry the card texture, `alphaTest: 0.5` and `side: DoubleSide`; a `public/<short>/norender` file makes the align workflow re-time without rendering; fetch the `qa` branch with `+qa:refs/remotes/origin/qa` after a force push.
- **Automatic checks to add to the framing check (Nov 20, from Daniel's Cahaba/Longyearbyen frames):** (1) every support's bottom vs terrain height (gap > 5 cm fails); (2) tree and rock positions vs structure footprints (overlap fails); (3) scattered rocks/props snapped to the terrain (any lifted above the ground fails); (4) 2D diagram labels vs the boxes of the shapes they label and vs a frame margin.
- **Finding a mystery object in a still (Nov 21):** give every mesh in the set a flat colour from its index (`MeshBasicMaterial`, 8 levels per channel), render one still, sample the pixel, then print that mesh's bounding box. Found the Peigneur "wires" in two renders. **Nov 22:** also put every mesh on `NOINK` for that render (otherwise a 1 px object is hidden under its own ink line), and raycast from the camera through the pixels in question, printing what is hit and at what distance (call `root.updateMatrixWorld(true)` first: card meshes report a box at the origin before that).

## Rules learned the hard way (Fahrenheit #1)
- Check that props don't sit inside other geometry (the kettle was built inside the chimney).
- When a close-up would push past a half-framed person, cut instead of gliding.
- Every narrated number or prop gets a subject entry with the words it belongs to.
- Night grade turns yellow grey: highlight with size and a red bar, not yellow.
- **Walkers must face the way they move on screen** (Nov 11: the Pig War Short's march shot and five long-form march shots had soldiers walking backwards). Side cards are drawn walking toward canvas right; the mirror flag now follows the camera (`mirror !== (right.x < 0)`) in pigwar/pigwarlong; the Lustig world mirrors from the direction of travel instead (`side.dir`). Copy one of those into any new world, and in the by-eye pass compare two frames ~20 apart in every walking shot.
- Seated cards (`mode: "sit"`) draw the head ~0.8 m lower than standing ones; the framing check needs the shifted head box (barber world has it).
- A floor laid at exactly ground height flickers against the grass: lift it a few centimetres (Lustig salon).
- "Golden" light on a north-facing wall or under the tower goes dark purple/teal: check a still before using it.

## Camera rules (Daniel, Nov 11: "we're not doing the swooping and crazy angles we talked about". First applied on Lustig #6)
- **Standing rule (Daniel, Nov 11, after seeing Lustig): every video is made like this, long-form included.** No video ships with creeping push-ins as its camera grammar.
- **No creeping push-ins as the default.** Barber's 12 shots were all the same slow `push()`, roll 0, fov 40–50. Every shot now gets a real move from the kit in `lustig/story.ts`: `orb` (orbit), `move` with `expo` (crane, dive, swoop, corkscrew), `snap` (snap zoom on a cut), tracking with a moving subject, long-lens slide.
- **Pace: a new setup every ~1.5 s** (Ricks Clips: 40 shots in 67 s). Lustig: 37 setups in 52 s. Nothing holds longer than ~2.5 s without the camera travelling.
- **Vary the lens and the horizon:** fov from ~24 (long-lens faces) to ~78 (wide, low, close); Dutch tilt on most close-ups, flipped on the next cut; low angles for power, high cranes for small/ashamed.
- **Opening 3 s = three different pictures** (Lustig: orbit of the whole tower, spin under its legs, snap to the grin).
- **3–5 things come at the lens per Short**, each with a shake.
- **Whip pans / whip cuts get the sideways blur** (`WHIPS` in story.ts).
- **Handheld sway on everything** except the loop frame; frame 0 and the last frames must be identical for the loop.
- **The camera can ride an object** (kit 2: it rides the fuse, then swings out to the cannon).
- Framing-check consequences: use a cut (not a glide) into any snap zoom; tight face shots need distance × tan(fov/2) ≥ 0.6 m so the head box stays inside 9:16; mark characters in moving shots `pass: true`; drop off-screen characters from the cast list instead of leaving them half in frame.
- Stamps, name tags and number callouts live in `Overlays.tsx` (upper third), so they stay sharp whatever the lens is doing. In Shorts keep them at y ≥ 19 % (Nov 22, see above).
- **Look at stills locally before pushing** (see `lustig-build-log.md` for the command): ~8 s a frame. `BROWSER_EXE=/usr/bin/google-chrome node scripts/stills.mjs <Comp> 0.5 <f,f,...> <dir>` (~20 s a still in the cloud sandbox).

### The same rules in a long-form (first applied on long-form #3, 60 Hz, Nov 11)
- 3D shots: the kit is copied into `hertzlong/story3d.ts` (`move`, `orbit`, `snap`, `kick`, `expo`, handheld sway in `specAt`, `whipAt` blur). Every 3D spec uses one of them; several cut to a second setup on a word.
- 2D boards and maps move too: `Mv` in `hertzlong/boards.tsx` gives every board a push, pull, slide, snap zoom or Dutch swing; maps travel between two views with a little roll. No board is a still.
- Long-form pace is a cut every ~3 s (174 shots in 8:25), not the Shorts' 1.5 s: a 1.5 s rhythm for 8 minutes would be ~340 setups.
- A person who would be half in frame at either end of a pan gets dropped or moved; start wide enough that everyone the shot keeps is whole from the first frame.
- With the cameras on the −z side, world +x is screen LEFT. Lay a set out so screen left/right matches the maps (west left, east right).
- Number boards in 3D are unlit materials, or white digits go grey when the sun is behind the board.
- Lamp halos (additive sprites) wash out anything behind them: keep them small and put signs in front of the lamps.

## Narration speed and length (Daniel, Nov 16: "we should make them faster"; chose denser scripts)
- **Target for Shorts: ~210–230 words in ~60 s** (~210–230 wpm), like Ricks Clips (Mine Salting 230 words / ~60 s, Cart 233 words / ~66 s). Write the script that long; don't just speed up an old-length script.
- **Where we were (YouTube transcripts, Nov 16; video length incl. loop tail, so true pace is a little higher):** Thermometer 205 words / 68 s (181 wpm), Molasses 141 / 51 (166), DST 136 / 47 (174), Pig War 115 / 47 (147), Barber 119 / 42 (170), Lustig 147 / 53 (166), LA clocks 146 / 51 (172), Log cannon 153 / 46 (200), Titanic key 135 / 47 (172), Rats 157 / 49 (192). Typical: ~115–160 words, ~165–200 wpm, 42–53 s. Great Stink (Nov 17) is the first at the new pace: 216 words / 58.0 s (223 wpm).
- The slowest Short (Pig War, 147 wpm) also has the lowest stayed-to-watch (63.3%). One data point, not proof; recheck once the faster Shorts have numbers.
- The voice has to deliver ~220 wpm too: check the aligned length against the word count before rendering, and if it reads slower, raise the ElevenLabs speed or tighten pauses in the align step rather than cutting words.

## Pacing rules (YouTube Studio feedback on the Daylight Saving short, Nov 9 — same notes on two runs)
- First word of narration at frame 0: no silence or slow visual ramp before it.
- Hit the hook's punchline (stamp, reveal) with a punch-in or camera shake.
- No held empty shot between story beats: cut straight from the last line of one beat to the first line of the next.
- Every narrated money figure or motive gets a big on-screen callout next to the action (e.g. "$200M", "CANDY LOBBY"), not just the subtitle.

## Hook rules (stayed-to-watch comparison, Nov 11: Thermometer 74.1%, DST 70.2%, Molasses 68.5%, Pig War 65.1%)
- **No year as the first words.** The two lowest openings both started with "In 1919," / "In 1859," (1.6s spent before the subject). The top two named a familiar subject at 0.0s. Put the year in line 2 (Thermometer: "1724." comes after the hook).
- **The surprising noun inside the first ~1.5s.** Thermometer says "thermometers" at 0.5s, DST says "daylight saving" at 0.6s; Pig War didn't say "pig" until 4.5s.
- **Frame 0 = the subject big and readable.** One close character or the action itself (Molasses wave). Not a wide shot of small figures.
- **Captions never sit on the subject in the first 2 seconds** (Pig War's "IN 1859" covered the pig).
- **First test of the rules, Barber pole (Nov 11, early read):** 71.8% stayed at 269 views, a few hours after upload. 2nd of 5, behind only Thermometer. Supports the rules; recheck at ~24 h to match the others.
- **Week-one Studio insight (Nov 16):** channel average stayed-to-watch 70.6%; Los Angeles clocks best at 75.5%, Pig War lowest at 63.3%. Target above 75%. Studio's own example hook started with a year ("In 1936, …"); ignore that part, the no-year rule stands.
- **Lake Peigneur Short (Nov 22, ~8 h after publishing):** 2.6K views (1.2K above usual), +4 subscribers, 69.9% stayed to watch, average view 0:48 of 1:05.
- Only a few data points so far; recheck as more Shorts come in.

## Visual ideas from a competitor's Molasses Short (ArimationClips, R3CGCtQP8po, studied Nov 11 via vidIQ)
- Opens close on a panicking face, then pulls out wide to the threat (wave over the street) in the first 3 s.
- Big expressive face close-ups between wides; whip pans and crash cuts during the action.
- Physical comedy inside the disaster (a truck tossed into the harbor, buildings sliding off foundations).
- Quick cutaway explainer for the science beat (honey jar + pancakes for viscosity), then back to the street.
- Light change for time passing (dusk for the trapped-in-syrup beat), aftermath ending (brown harbor, sweet smell decades later).

## Endings and maps (MapScroll review by Fable 5.2, Nov 10)
- **TODAY ending**: close on a modern connection viewers already know (a border, a building, a law still in force), then cut back to the opening frame so the video loops.
- **Map beats**: Shorts get at most one map beat, and only when geography is the point. Long-forms use a map whenever "where" matters (borders, routes, which side of a line).
- Maps are drawn in code (stylized, hand-drawn look). No satellite or third-party map textures unless the license is checked.

## Long-form pipeline notes (from long-form #3)
- Narration over 5,000 characters: generate it in parts, push `public/<video>/voice-parts.json`; the Fetch voice parts workflow joins them. Then start Align to voice by hand (a bot push doesn't trigger it): `gh api -X POST repos/<owner>/<repo>/actions/workflows/align.yml/dispatches -f ref=main -f 'inputs[short]=<folder>' -f 'inputs[render]=false'`.
- After aligning, look for runs of words with identical times: Whisper can drop a sentence and the aligner then stacks those words on one instant (it reported 98% matched and still lost three lines). Fix their times by hand from the pauses (`ffmpeg silencedetect`).
- The framing check only measures 3D shots, and its contact sheets skip frames ≥ 10,000 and shots ≥ 100. For a long-form, make the by-eye sheets locally (one still per shot) and from the final MP4.
- `render.json` for a long-form: `"chunks": 20, "step": 10`.
- Music: write `scripts/mix_<video>long.py` (copy the latest), run it after aligning, commit `public/<video>long/mix.m4a`, then run the Remux soundtrack workflow on the rendered release (`source_tag`, `composition`); upload the `-mix` release.

## Uploading (YouTube API, `upload.yml`)
- Status: working. Scheduled API uploads go public at `publishAt` (first proven with Titanic v2, Nov 14). Full notes in the Claude project doc `claude/youtube-upload.md`.
- Google Cloud project `paradox-town-uploads` (account axonlearning.appreview@gmail.com), YouTube Data API v3, OAuth app "Paradox Town Uploader".
- Repo secrets: `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_SHORTS` (Paradox Town), `YT_REFRESH_EXPLAINED` (Paradox Town Explained). Never print them.
- Push `upload.json` to main:
  ```json
  {
    "release": "Clocks-20261113-2228",
    "channel": "shorts",
    "title": "Why Los Angeles Took Everyone's Clocks #history #shorts",
    "description": "...",
    "tags": ["history", "shorts"],
    "publishAt": "2026-11-14T16:00:00-06:00",
    "thumbnail": "TitanicIf-thumbnail.jpg",
    "channelId": "UC..."
  }
  ```
  - `channel`: `shorts` or `explained`. `asset` defaults to `<Composition>.mp4` from the release.
  - `publishAt` needs a time zone and must be in the future; without it the video stays private.
  - `thumbnail`: a repo path or a release asset name (long-forms). Optional fields: `categoryId` (default 27 Education), `madeForKids` (default false), `containsSyntheticMedia` (default true: Studio's "Altered content" = Yes), `language` (default en; sets video and title/description language), `force` (re-upload a release already in `uploads.log`), `channelId` (fails the run loudly if the token belongs to another channel).
- Channel IDs (use as `channelId`): `shorts` = Paradox Town `UCl-QfCSpuFSXpego91Z5i7A`; `explained` = ParadoxTownExplained `UCx1xmhy5MastJ1ug1-KqygA`. Both tokens tested Nov 13 with `"release": "test"` (uploads a 5 s generated clip, private, not logged).
- Every upload is logged in `uploads.log`; the same release can't go to the same channel twice without `"force": true`.
- **Comment:** add `"comment": "..."` to `upload.json`. YouTube refuses comments on private videos, so it is queued in `pending-comments.json` and `comment.yml` (hourly, minute 17, or run by hand) posts it once the video is public. The refresh tokens need both scopes: `youtube.upload` and `youtube.force-ssl`.
- Can't be done by the API: **pinning** the comment, end screens, Test & Compare. Do those in Studio.
- Privacy policy / home page for the audit: `docs/` on GitHub Pages.
