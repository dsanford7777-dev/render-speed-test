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

## Uploading (YouTube API, `upload.yml`)
- Google Cloud project `paradox-town-uploads` (account axonlearning.appreview@gmail.com), YouTube Data API v3, OAuth app "Paradox Town Uploader".
- Repo secrets: `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_SHORTS` (Paradox Town), `YT_REFRESH_EXPLAINED` (Paradox Town Explained). Never print them.
- **Until the project passes YouTube's API audit, every API upload is locked private and can't be made public, not even in Studio.** Don't upload a real video through it before the audit passes; test with a throwaway clip and delete it.
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
