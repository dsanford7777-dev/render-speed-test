# Centralia long-form audio mix: voice + ducked music beds + a few effects anchored to the shot timeline.
# Output: public/centralialong/mix.m4a (voice + 8 s end card), -15 LUFS. Same YouTube Audio Library files as long-form #1.
#   python3 scripts/mix_centralialong.py   (run from the repo root after the timeline is aligned; needs npx tsx for the shot list)
import subprocess, numpy as np, json, re, math, os
SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = ROOT + "/public/molasseslong/audio/"
VOICE = ROOT + "/public/centralialong/voice.mp3"
_ts = open(ROOT + "/src/videos/centralialong/timeline.ts").read()
ST = json.loads(re.search(r"export const SEG_TIMES: \[number, number\]\[\] = (\[.*?\]);", _ts, re.S).group(1))
VOICE_END = math.ceil((ST[-1][1] + 0.6) * 30)
TOTAL = (VOICE_END + 8 * 30) / 30
# the shot list (start frame and spec name) straight from the timeline module
_js = 'import { SHOTS } from "' + ROOT + '/src/videos/centralialong/timeline"; console.log(JSON.stringify(SHOTS.map((s) => [s.g, s.a])));'
open("/tmp/hl_shots.ts", "w").write(_js)
SHOTS = [(g, a / 30) for g, a in json.loads(subprocess.run(["npx", "tsx", "/tmp/hl_shots.ts"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1])]
def S0(seg): return ST[seg][0]
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def db(x): return 10 ** (x / 20)
N = int(TOTAL * SR)
voice = load(VOICE)[:N]
out_v = np.zeros((N, 2), np.float32); out_v[:len(voice)] = voice
music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)
def place(buf, clip, t, gain_db=0.0, dur=None, fin=0.01, fout=0.15, src=0.0):
    c = clip[int(src * SR):]
    if dur is not None: c = c[:int(dur * SR)]
    c = c * db(gain_db); n = len(c)
    if n == 0: return
    env = np.ones(n, np.float32); a, b = int(fin * SR), int(fout * SR)
    if a: env[:min(a, n)] = np.linspace(0, 1, min(a, n))
    if b: env[-min(b, n):] *= np.linspace(1, 0, min(b, n))
    c = c * env[:, None]; i = int(t * SR)
    if i >= N: return
    m = min(n, N - i); buf[i:i + m] += c[:m]
M = {k: load(A + f"{k}.mp3") for k in ["m1_coldopen", "m2_history", "m3_warning", "m4_disaster", "m5_aftermath", "m6_court", "m7_ending"]}
S = {k: load(A + f"sfx_{k}.mp3") for k in ["whoosh", "impact", "paper", "stamp", "riser"]}
CH = {k: S0(i) for k, i in [("ch1", 5), ("ch2", 8), ("ch3", 15), ("ch4", 20), ("ch5", 26), ("ch6", 33), ("ch7", 38), ("ch8", 44), ("ch9", 47)]}
# eerie for the cold open, a walk through the coal town and the dump, uneasy while the fire spreads and the warnings
# pile up, full tension for the hole, quiet for the buyout, searching for the holdouts' fight, warm for the ending
BEDS = [("m1_coldopen", 0.0, CH["ch1"], -12, 0.2, 2.0, 0), ("m2_history", CH["ch1"], CH["ch3"], -12, 2.0, 2.5, 0),
        ("m3_warning", CH["ch3"], CH["ch5"], -12, 2.0, 2.5, 0), ("m4_disaster", CH["ch5"], CH["ch6"], -13, 1.5, 2.5, 0),
        ("m5_aftermath", CH["ch6"], CH["ch7"], -11, 2.0, 2.0, 0), ("m6_court", CH["ch7"], CH["ch8"], -12, 2.0, 2.0, 0),
        ("m7_ending", CH["ch8"], TOTAL, -10, 1.5, 4.0, 0)]
for k, a, b, g, fi, fo, src in BEDS: place(music, M[k], a, g, dur=b - a + fo * 0.5, fin=fi, fout=fo, src=src)
FX = {"title": ("whoosh", -12, None), "strangest": ("whoosh", -14, None), "map": ("whoosh", -14, None), "n172": ("stamp", -12, None),
      "feb14": ("paper", -12, 1.5), "n663": ("stamp", -12, None), "n1992": ("paper", -12, 1.5), "zipcard": ("stamp", -12, None),
      "n349": ("stamp", -12, None), "grafcard": ("whoosh", -13, None), "n250": ("riser", -15, 3.0), "question": ("whoosh", -13, None)}
seen = set()
for g, t in SHOTS:
    if g in FX and (g, round(t)) not in seen: seen.add((g, round(t))); k, gain, dur = FX[g]; place(sfx, S[k], t + 0.05, gain, dur=dur, fin=0.02, fout=0.5)
_W = json.loads(re.search(r"export const WORDS: Word\[\] \| null = (\[.*?\]);", _ts, re.S).group(1))
_gave = next(w["s"] for w in _W if w["seg"] == 28 and w["w"].lower().startswith("gave"))
place(sfx, S["impact"], _gave + 0.1, -16, dur=1.2, fin=0.01, fout=0.4); seen.add(("thud", 0))
v = np.abs(out_v).max(axis=1); win = int(0.05 * SR)
env = np.convolve(v, np.ones(win) / win, mode="same"); speech = (env > 0.02).astype(np.float32)
k_att, k_rel = 1 - np.exp(-1 / (0.06 * SR)), 1 - np.exp(-1 / (0.4 * SR))
g = np.empty_like(speech); s = 0.0
for i in range(0, len(speech), 240):
    target = speech[i:i + 240].max(); s += ((k_att if target > s else k_rel) * 240) * (target - s); s = min(max(s, 0.0), 1.0); g[i:i + 240] = s
music *= (1.0 - g * (1 - db(-9)))[:, None]
mix = out_v + music + sfx; peak = float(np.abs(mix).max())
mix = np.tanh(mix * 1.1) / np.tanh(1.1) if peak > 0.98 else mix
mix = mix * (0.93 / max(0.93, float(np.abs(mix).max())))
os.makedirs("/tmp/hl", exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "/tmp/cll/mix.wav"], input=mix.astype(np.float32).tobytes(), check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "/tmp/cll/mix.wav", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", ROOT + "/public/centralialong/mix.m4a"], check=True)
sp = g > 0.9
def rms(x, m): return 20 * np.log10(np.sqrt((x[m] ** 2).mean()) + 1e-9)
print("total", round(TOTAL, 1), "peak", round(peak, 3), "voice", round(rms(out_v, sp), 1), "music under voice", round(rms(music, sp), 1), "music in gaps", round(rms(music, ~sp), 1), "fx", len(seen), "shots", len(SHOTS))
