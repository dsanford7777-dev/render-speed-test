"""Print the slap times (ms, space separated) for the subscribe end card of one composition.
Long-forms: one slap per spoken "subscribe" in the aligned WORDS of src/videos/<comp>/timeline.ts (the composition
places <SubscribeTag at={subscribeAt(wordAt(seg, "subscribe"))} /> so the hit lands on that word).
Shorts (no "subscribe" in the narration): one slap SLAP_FROM_END = 70 frames before the end.
public/brand/slap.mp3 hits 0.203 s into the file, so each start is that much earlier. Prints nothing if the
composition doesn't use <SubscribeTag."""
import json, pathlib, re, sys
comp, total = sys.argv[1].lower(), int(sys.argv[2])
d = pathlib.Path("src/videos") / comp
if not d.is_dir() or not any("<SubscribeTag" in p.read_text(errors="ignore") for p in d.glob("*.tsx")):
    sys.exit(0)
HIT, FPS = 0.203, 30
times = []
tl = d / "timeline.ts"
if tl.exists():
    m = re.search(r"export const WORDS: Word\[\] \| null = (\[.*?\]);", tl.read_text(), re.S)
    if m:
        for w in json.loads(m.group(1)):
            if re.sub(r"[^\w]", "", w["w"].lower()).startswith("subscrib"):
                times.append(round(w["s"] * FPS) / FPS)
if not times:
    times = [(total - 70) / FPS]
print(" ".join(str(max(0, round((t - HIT) * 1000))) for t in times))
