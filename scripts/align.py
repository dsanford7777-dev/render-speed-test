"""Re-time a short to its real narration.

usage: python scripts/align.py <voice.mp3> <timeline.ts>

Transcribes the voice with word timestamps (faster-whisper, runs free on the CPU), lines the words up with the
script's `say` text, and rewrites SEG_TIMES (segment start/end) and WORDS (caption words with times) in
timeline.ts. Shots, camera keys and captions all follow from those two tables.
"""
import difflib
import json
import re
import sys

from faster_whisper import WhisperModel

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def two(n):
    return [ONES[n]] if n < 20 else [TENS[n // 10]] + ([ONES[n % 10]] if n % 10 else [])


def num_words(s):
    """digits as spoken: years as pairs (1724 -> seventeen twenty four), decades (1960s), decimals (98.6), plain ints"""
    s = s.lower()
    plural = s.endswith("s")
    core = s[:-1] if plural else s
    if re.fullmatch(r"\d+\.\d+", core):
        a, b = core.split(".")
        return num_words(a) + ["point"] + [ONES[int(d)] for d in b]
    if not core.isdigit():
        return [s]
    n = int(core)
    if 1000 <= n <= 2099 and len(core) == 4:
        hi, lo = divmod(n, 100)
        out = two(hi) + (["hundred"] if lo == 0 else (["oh"] + [ONES[lo]] if lo < 10 else two(lo)))
    elif n < 100:
        out = two(n)
    elif n < 1000:
        h, r = divmod(n, 100)
        out = [ONES[h], "hundred"] + (two(r) if r else [])
    else:
        out = [core]
    if plural:
        last = out[-1]
        out[-1] = last[:-1] + "ies" if last.endswith("y") else last + "s"
    return out


def toks(text):
    """spoken tokens: lower case, hyphens split, punctuation dropped, digits spelled out"""
    out = []
    for w in re.split(r"[\s\-]+", text):
        w = re.sub(r"[^\w.']", "", w.lower()).strip(".'")
        if not w:
            continue
        out += num_words(w) if re.match(r"\d", w) else [w]
    return out


def main(audio, ts_path):
    src = open(ts_path, encoding="utf-8").read()
    segs = [(json.loads(a), json.loads(b)) for a, b in re.findall(r'\{ say: ("(?:[^"\\]|\\.)*"), show: ("(?:[^"\\]|\\.)*") \}', src)]
    assert segs, "no SEGMENTS found"
    full = " ".join(s for s, _ in segs)

    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    parts, _ = model.transcribe(audio, word_timestamps=True, initial_prompt=full, vad_filter=False)
    heard = []  # (token, start, end)
    for p in parts:
        for w in p.words:
            ts = toks(w.word)
            if not ts:
                continue
            d = (w.end - w.start) / len(ts)
            heard += [(t, w.start + i * d, w.start + (i + 1) * d) for i, t in enumerate(ts)]

    script = []  # (token, segment index)
    for i, (say, _) in enumerate(segs):
        script += [(t, i) for t in toks(say)]
    times = [None] * len(script)
    sm = difflib.SequenceMatcher(a=[t for t, _ in script], b=[t for t, _, _ in heard], autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = heard[blk.b + k][1:]
    # fill unmatched script tokens by interpolating between their matched neighbours
    known = [i for i, x in enumerate(times) if x]
    assert known, "nothing in the voice matched the script"
    for i in range(len(times)):
        if times[i]:
            continue
        lo = max([k for k in known if k < i], default=None)
        hi = min([k for k in known if k > i], default=None)
        if lo is None:
            times[i] = (times[hi][0], times[hi][0])
        elif hi is None:
            times[i] = (times[lo][1], times[lo][1])
        else:
            u = (i - lo) / (hi - lo)
            t = times[lo][1] + (times[hi][0] - times[lo][1]) * u
            times[i] = (t, t)
    matched = len(known) / len(times)
    print(f"matched {len(known)}/{len(times)} script words ({matched:.0%})")

    seg_times, words = [], []
    pos = 0
    for i, (say, show) in enumerate(segs):
        n = len(toks(say))
        span = times[pos:pos + n]
        seg_times.append([round(span[0][0], 3), round(span[-1][1], 3)])
        # caption words: line the shown words ("1724") up with the spoken ones ("seventeen twenty-four")
        say_t = toks(say)
        show_w = show.split()
        show_t, owner = [], []
        for j, w in enumerate(show_w):
            for t in toks(w):
                show_t.append(t)
                owner.append(j)
        got = [[] for _ in show_w]
        m2 = difflib.SequenceMatcher(a=show_t, b=say_t, autojunk=False)
        for blk in m2.get_matching_blocks():
            for k in range(blk.size):
                got[owner[blk.a + k]].append(span[blk.b + k])
        # shown words that match nothing take the gap between their neighbours
        for j, w in enumerate(show_w):
            if got[j]:
                a, b = got[j][0][0], got[j][-1][1]
            else:
                prev = next((got[x][-1][1] for x in range(j - 1, -1, -1) if got[x]), span[0][0])
                nxt = next((got[x][0][0] for x in range(j + 1, len(show_w)) if got[x]), span[-1][1])
                a, b = prev, max(prev, nxt)
            words.append({"w": w, "s": round(a, 3), "e": round(max(b, a + 0.08), 3), "seg": i})
        pos += n

    # replacement via a function: the JSON may contain backslashes (\u escapes) that re.sub would read as escapes
    seg_block = "// __SEG_TIMES__\nexport const SEG_TIMES: [number, number][] = " + json.dumps(seg_times) + ";\n// __END_SEG_TIMES__"
    word_block = "// __WORDS__\nexport const WORDS: Word[] | null = " + json.dumps(words, ensure_ascii=False) + ";\n// __END_WORDS__"
    src = re.sub(r"// __SEG_TIMES__\n.*?// __END_SEG_TIMES__", lambda m: seg_block, src, flags=re.S)
    src = re.sub(r"// __WORDS__\n.*?// __END_WORDS__", lambda m: word_block, src, flags=re.S)
    open(ts_path, "w", encoding="utf-8").write(src)
    print("segments:", seg_times)
    if matched < 0.8:
        sys.exit("fewer than 80% of the words matched: check the voice reads the script as written")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
