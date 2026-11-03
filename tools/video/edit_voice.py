"""Edit the film from Bishal's real narration, driven by an edit list (video/work/edl.json).
Usage: python tools/video/edit_voice.py [--no-capture] [--transcript=path.json] [--out=name]
- cuts each section's kept takes out of the recording (cut points snapped to the quietest moment),
- shows the spoken section name as a chapter card, captions what he actually said (names corrected,
  mis-hearings repaired against the script), times every on-screen click to the words he said,
- records the scenes (capture.mjs) and assembles the film with ffmpeg."""
import difflib, json, os, re, subprocess, sys
import numpy as np
SITE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VID = os.path.join(os.path.dirname(SITE), "video"); WORK = os.path.join(VID, "work"); OUT = os.path.join(VID, "out"); CLIPS = os.path.join(VID, "clips")
for d in (WORK, OUT, CLIPS): os.makedirs(d, exist_ok=True)
FF = r"C:\Users\Bishal Roy\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin"
FFMPEG = os.path.join(FF, "ffmpeg.exe")
arg = lambda k, d=None: next((a.split("=", 1)[1] for a in sys.argv if a.startswith(f"--{k}=")), d)
NAME = arg("out", "bishal-roy-the-vast-realm"); CAPTURE = "--no-capture" not in sys.argv
EDL = json.load(open(os.path.join(WORK, "edl.json"), encoding="utf-8"))
SRC = os.path.normpath(os.path.join(WORK, EDL["source"]))
TR = arg("transcript") or os.path.splitext(SRC)[0] + ".json"
def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode: sys.exit(f"FAILED {' '.join(map(str, cmd[:5]))}\n{r.stderr[-2500:]}")
    return r.stdout
norm = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())

# ---------- audio: clean once, then snap cuts to the quietest point ----------
SR = 48000
clean = os.path.join(WORK, "voice-clean.wav")
run([FFMPEG, "-y", "-i", SRC, "-ac", "1", "-ar", str(SR), "-af", "highpass=f=75,lowpass=f=14000,afftdn=nf=-25", clean])
pcm = np.frombuffer(run_bin := subprocess.run([FFMPEG, "-v", "error", "-i", clean, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout, dtype=np.float32)
hop = int(SR * 0.01); env = np.sqrt(np.convolve(pcm ** 2, np.ones(hop * 2) / (hop * 2), mode="same"))[::hop]   # 10 ms RMS
def snap(t, side, win=0.3):
    """Move a cut to the quietest 10 ms nearby, but only AWAY from the speech it bounds:
    a start may move earlier (never into the first word), an end may move later (never into the last)."""
    lo, hi = (t - win, t + 0.03) if side == "start" else (t - 0.03, t + win)
    a, b = max(0, int(lo * 100)), min(len(env) - 1, int(hi * 100))
    return (a + int(np.argmin(env[a:b + 1]))) / 100 if b > a else t

# ---------- transcript words ----------
segs = json.load(open(TR, encoding="utf-8"))
WORDS = [w for s in segs for w in s["words"]]
# the recogniser sometimes stretches a word across a long pause; pull a long word in to where its sound really is
db = 20 * np.log10(env + 1e-6)
for w in WORDS:
    if w["e"] - w["s"] > 0.6:
        a, b = int(w["s"] * 100), min(len(db) - 1, int(w["e"] * 100))
        loud = np.nonzero(db[a:b + 1] > -45)[0]
        if len(loud): w["s"], w["e"] = round((a + loud[0]) / 100, 2), round(max((a + loud[-1]) / 100 + 0.05, (a + loud[0]) / 100 + 0.1), 2)
md = open(os.path.join(VID, "VIDEO-SCRIPT.md"), encoding="utf-8").read()
SCRIPT = [re.sub(r"[*]", "", t) for t in re.findall(r"^> (.+)$", md, flags=re.M)][:10]
FIX = [(r"\bwhisper\b", "Wispr"), (r"\bwisper\b", "Wispr"), (r"\bvistorflow\b", "Wispr Flow"), (r"\bvishal\b", "Bishal"), (r"\bbishel\b", "Bishal"),
       (r"\blightning ring\b", "Lantern Ring"), (r"\bdharaka\b", "Ghar ka"), (r"\bbolu\b", "Bolo"), (r"\bmatkaru\b", "mat karo"), (r"\bchinglish\b", "Hinglish"),
       (r"\bstag\b", "strike"), (r"\bexplode\b", "explore"), (r"\bindian growth\b", "India growth"), (r"(\d) %", r"\1%"), (r"\bi\b", "I")]
def fix(t):
    for a, b in FIX: t = re.sub(a, b, t, flags=re.I)
    return t

# ---------- build each section ----------
LEAD, HEADGAP, TAIL, XF = 0.5, 0.55, 0.8, 0.45
sections = []
for sec in EDL["sections"]:
    n = sec["n"]; pieces = []
    h0, h1 = snap(sec["head"][0], "start"), snap(sec["head"][1], "end")
    pieces.append(("head", h0, h1))
    for a, b in sec["keep"]: pieces.append(("body", snap(a, "start"), snap(b, "end")))
    # timeline inside the section (seconds from the section's audio start)
    t, mapped, body_words = 0.0, [], []
    for kind, a, b in pieces:
        mapped.append((kind, a, b, t))
        for w in WORDS:
            # a word belongs to this take if most of it lies inside (the recogniser often stretches a first word back into the pause)
            if kind == "body" and w["e"] > a + 0.08 and w["s"] < b - 0.05 and (min(w["e"], b) - max(w["s"], a)) >= 0.5 * min(0.25, w["e"] - w["s"]):
                body_words.append({"w": w["w"], "s": max(w["s"], a) - a + t, "e": min(w["e"], b) - a + t})
        t += (b - a) + (HEADGAP if kind == "head" else 0.12)
    sec_len = t
    # audio file for the section
    wav = os.path.join(WORK, f"sec{n}.wav")
    f = []; ins = []
    for k, (kind, a, b, at) in enumerate(mapped):
        f.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={max(0, b - a - 0.04):.3f}:d=0.04,adelay={int(at * 1000)}|{int(at * 1000)}[p{k}]")
        ins.append(f"[p{k}]")
    f.append(f"{''.join(ins)}amix=inputs={len(ins)}:normalize=0,apad,atrim=0:{sec_len:.3f}[o]")
    run([FFMPEG, "-y", "-i", clean, "-filter_complex", ";".join(f), "-map", "[o]", "-ac", "1", "-ar", str(SR), wav])
    head_len = mapped[0][2] - mapped[0][1]
    sections.append({"n": n, "title": sec["title"], "wav": wav, "len": sec_len, "head_len": head_len, "words": body_words})

# ---------- captions: what he said, with mis-hearings repaired from the script ----------
def caption_words(n, heard):
    if n - 1 >= len(SCRIPT): return heard
    sw = SCRIPT[n - 1].split(); a = [norm(x) for x in sw]; b = [norm(w["w"]) for w in heard]
    out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        hs = heard[j1:j2]
        if op == "equal":
            out += [{"w": sw[i1 + k], "s": hs[k]["s"], "e": hs[k]["e"]} for k in range(len(hs))]
        elif op == "replace" and abs((i2 - i1) - (j2 - j1)) <= 1 and (i2 - i1) <= 3:   # a mis-hearing: use the script's spelling
            for k in range(i2 - i1):
                src = hs[min(k, len(hs) - 1)]
                out.append({"w": sw[i1 + k], "s": src["s"], "e": src["e"]})
        elif op in ("replace", "insert"):                                           # he said something new: keep his words
            out += [{"w": fix(h["w"]), "s": h["s"], "e": h["e"]} for h in hs]
        # "delete": a script word he didn't say -> not captioned
    return capfix(n, out)

# lines he improvised or re-phrased, cleaned up after listening to every take (old words -> new words)
CAPFIX = {3: [("setbacks. and grew.", "setbacks and grew.")],
          4: [("That's the golden line shows in the towers to fill in the gaps.", "That's why the golden lines show in the towers: to fill in the gaps.")],
          5: [("classes, and every project has its card shows", "classes. And every project has its card that shows")],
          6: [("makers: Just for example, dwarves", "makers. Just for example: dwarves")],
          8: [("question why voice?", "question: why voice?")],
          9: [("plans. a Ghar ka", "plans. Ghar ka"), ("festival kit", "festive kit")],
          10: [("too and who", "too, and who")]}
def capfix(n, ws):
    for old, new in CAPFIX.get(n, []):
        o, nw = old.split(), new.split(); txt = [fix(w["w"]) for w in ws]
        for i in range(len(ws) - len(o) + 1):
            if txt[i:i + len(o)] == o:
                seg = ws[i:i + len(o)]; s0, e0 = seg[0]["s"], seg[-1]["e"]
                if len(nw) == len(o): rep = [{"w": nw[k], "s": seg[k]["s"], "e": seg[k]["e"]} for k in range(len(o))]
                else: st = (e0 - s0) / len(nw); rep = [{"w": nw[k], "s": s0 + k * st, "e": s0 + (k + 1) * st} for k in range(len(nw))]
                ws = ws[:i] + rep + ws[i + len(o):]; break
        else: print(f"  !! caption fix not applied in part {n}: {old!r}")
    return ws

WEAK = set("a an the of to my and with from is in into for at on by that his its who when what i im you as or so but every each one".split())
def split_sentence(s):
    """Halve a long sentence until each piece fits on one line: cut at a comma near the middle,
    otherwise at the middle, but never right after a small word like "a" or "the"."""
    if len(s) <= 2 or (len(" ".join(w["w"] for w in s)) <= 64 and len(s) <= 11): return [s]
    n = len(s); mid = round(n / 2); cut = None
    for d in (0, 1, -1, 2, -2, 3, -3):
        i = mid + d
        if 2 <= i <= n - 2 and s[i - 1]["w"].endswith((",", ":", ";")): cut = i; break
    joined = lambda i: s[i]["w"][:1].isdigit() or (s[i - 1]["w"][:1].isupper() and s[i]["w"][:1].isupper())   # "Class 10", "Echo Caves"
    for d in (0, -1, 1, -2, 2):
        if cut is not None: break
        i = mid + d
        if 2 <= i <= n - 2 and norm(s[i - 1]["w"]) not in WEAK and not joined(i): cut = i
    cut = cut or mid
    return split_sentence(s[:cut]) + split_sentence(s[cut:])
def cap_chunks(ws):
    """One caption per sentence, long sentences split into one-line pieces."""
    out, sent = [], []
    for j, w in enumerate(ws):
        sent.append(w)
        if w["w"].endswith((".", "?", "!")) or j == len(ws) - 1: out += split_sentence(sent); sent = []
    return out

# ---------- cue times from his actual words ----------
CUES = {1: {"enter": [("so", 1)]}, 2: {"turn1": [("journey", 1)], "turn2": [("island", 1)], "travel": [("balloons", 1), ("balloon", 1)]},
        3: {"depot": [("depot", 1), ("depart", 1)], "sky": [("until", 1)]},
        4: {"tower": [("fly", 1)], "mirror": [("turn", 1)], "lakeflip": [("neither", 1)], "golden": [("golden", 1)]},
        5: {"turn": [("spins", 1)], "enter": [("oracle", 1), ("oracles", 1)], "bag": [("achieved", 1)], "next": [("public", 1)], "plaza": [("11", 1), ("eleven", 1)]},
        6: {"w1": [("dwarves", 1)], "w2": [("alchemists", 1)], "w3": [("witches", 1)], "w4": [("elves", 1)], "w5": [("bards", 1)],
            "forge": [("every", 1)], "strike": [("stag", 1), ("strike", 1)], "strike2": [("use", 1)]},
        7: {"turn": [("heart", 1)], "turn2": [("bridge", 1)], "travel": [("journey", 1)], "crown": [("crown", 1)]},
        8: {"crystal1": [("speak", 1)], "speak": [("crystal", 1)]},
        9: {"plan1": [("dharaka", 1), ("ghar", 1), ("three", 1)], "plan2": [("campus", 1)], "plan3": [("bolu", 1), ("bolo", 1)]},
        10: {"depart": [("next", 1)]}}
timing = {}
for S in sections:
    n = S["n"]; off = LEAD; cues = {}
    for cue, alts in CUES.get(n, {}).items():
        for word, nth in alts:
            hits = [w for w in S["words"] if norm(w["w"]) == word]
            if len(hits) >= nth: cues[cue] = round(off + hits[nth - 1]["s"], 2); break
    dur = round(LEAD + S["len"] + TAIL, 2)
    if n == 1 and "enter" in cues: dur = max(dur, cues["enter"] + 1.2)
    if n == 3 and "sky" in cues: cues["rollout"] = round(max(cues.get("depot", 0) + 1.5, cues["sky"] - 3.0), 2); dur = max(dur, round(cues["sky"] + 3.4, 2))
    if n == 4:
        if "tower" in cues and "mirror" in cues: cues["mirror"] = max(cues["mirror"], round(cues["tower"] + 2.6, 2))
        if "golden" in cues and "lakeflip" in cues: cues["golden"] = max(cues["golden"], round(cues["lakeflip"] + 2.0, 2))
        dur = max(dur, round(max(cues.values()) + 2.2, 2))
    if n == 5:
        if "turn" in cues and "enter" in cues: cues["enter"] = max(cues["enter"], round(cues["turn"] + 1.2, 2))
        if "plaza" in cues: cues.update(spin1=round(cues["plaza"] + 1.3, 2), spin2=round(cues["plaza"] + 2.2, 2), spin3=round(cues["plaza"] + 3.1, 2)); dur = max(dur, cues["spin3"] + 1.2)
    if n == 6 and "forge" in cues and "strike" in cues: cues["strike"] = max(cues["strike"], round(cues["forge"] + 1.4, 2))
    if n == 7: dur = max(dur, round(cues.get("crown", 0) + 2.4, 2))
    if n == 8: cues["speak"] = round(max(cues.get("crystal1", 0) + 2.0, cues.get("speak", 0)), 2); dur = max(dur, round(cues["speak"] + 3.4, 2))
    if n == 9: dur = max(dur, round(cues.get("plan3", 0) + 3.0, 2))
    timing[str(n)] = {"dur": dur, "cues": cues}
    S["dur"] = dur
json.dump(timing, open(os.path.join(WORK, "timing.json"), "w"), indent=1)
print("sections:", {s["n"]: round(s["dur"], 1) for s in sections}, "film ~", round(sum(s["dur"] for s in sections) - XF * (len(sections) - 1) + 4.5, 1), "s")
missing = {s["n"]: [c for c in CUES.get(s["n"], {}) if c not in timing[str(s["n"])]["cues"]] for s in sections}
print("cues not found:", {k: v for k, v in missing.items() if v})

if "--plan" in sys.argv:
    for S in sections:
        print(f"\n[{S['n']} {S['title']}] dur {S['dur']}s  cues {timing[str(S['n'])]['cues']}")
        print("   CAPTIONS: " + "  |  ".join(fix(" ".join(x["w"] for x in c)) for c in cap_chunks(caption_words(S["n"], S["words"]))))
    sys.exit(0)

# ---------- record ----------
if CAPTURE:
    print("recording scenes…")
    r = subprocess.run(["node", "tools/video/capture.mjs", f"--timing={os.path.join(WORK, 'timing.json')}"], cwd=SITE, text=True, capture_output=True)
    print(r.stdout[-900:])
    if r.returncode: sys.exit(r.stderr[-1500:])

# ---------- assemble ----------
titles_dir = os.path.join(WORK, "titles")
run(["node", "tools/video/titlecards.mjs", titles_dir, *[s["title"] for s in sections]], cwd=SITE)
end_png = os.path.join(WORK, "endcard.png"); run(["node", "tools/video/endcard.mjs", end_png], cwd=SITE)
inputs, filt, offs = [], [], []
N = len(sections); nin = 0
def add(*a):
    global nin
    inputs.extend(a); nin += 1; return nin - 1
for k, S in enumerate(sections):
    add("-i", os.path.join(CLIPS, f"part{S['n']}.webm"))
    filt.append(f"[{k}:v]trim=0:{S['dur']},setpts=PTS-STARTPTS,fps=30,format=yuv420p,setsar=1[v{k}]")
iend = add("-loop", "1", "-t", "4.5", "-i", end_png)
filt.append(f"[{iend}:v]fps=30,format=yuv420p,setsar=1,fade=t=in:st=0:d=0.6[v{N}]")
cur, t = "v0", sections[0]["dur"]; offs.append(0.0)
for k in range(1, N + 1):
    off = t - XF; offs.append(off)
    filt.append(f"[{cur}][v{k}]xfade=transition=fade:duration={XF}:offset={off:.3f}[x{k}]"); cur = f"x{k}"
    t = off + (sections[k]["dur"] if k < N else 4.5)
total = t
# chapter cards over the start of each section
for k, S in enumerate(sections):
    idx = add("-loop", "1", "-t", f"{S['head_len'] + LEAD + 1.6:.2f}", "-i", os.path.join(titles_dir, f"title{S['n']}.png"))
    st = offs[k] + 0.15; d = S["head_len"] + LEAD + 1.3
    filt.append(f"[{idx}:v]format=rgba,fade=t=in:st=0:d=0.35:alpha=1,fade=t=out:st={d:.2f}:d=0.4:alpha=1,setpts=PTS+{st:.3f}/TB[t{k}]")
    filt.append(f"[{cur}][t{k}]overlay=0:0:eof_action=pass[c{k}]"); cur = f"c{k}"
# voice
amix = []
for k, S in enumerate(sections):
    idx = add("-i", S["wav"])
    d = int((offs[k] + LEAD) * 1000)
    filt.append(f"[{idx}:a]adelay={d}|{d}[a{k}]"); amix.append(f"[a{k}]")
filt.append(f"{''.join(amix)}amix=inputs={N}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,apad,atrim=0:{total:.3f}[aout]")
# captions
def ts(x): return f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
ass = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1920", "PlayResY: 1080", "", "[V4+ Styles]",
       "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       "Style: Cap,Segoe UI Semibold,46,&H00F4FBFF,&H000000FF,&H00140D0A,&H96140D0A,0,0,0,0,100,100,0.5,0,3,14,0,2,160,160,70,1", "", "[Events]",
       "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
review = []
for k, S in enumerate(sections):
    ws = caption_words(S["n"], S["words"]); shift = offs[k] + LEAD; chunk = []
    review.append(f"\n[{S['title']}] " + " ".join(w["w"] for w in ws))
    for chunk in cap_chunks(ws):
        text = fix(" ".join(x["w"] for x in chunk))
        ass.append(f"Dialogue: 0,{ts(chunk[0]['s'] + shift)},{ts(chunk[-1]['e'] + shift + 0.15)},Cap,,0,0,0,,{text}")
ass_path = os.path.join(WORK, "captions.ass"); open(ass_path, "w", encoding="utf-8").write("\n".join(ass))
open(os.path.join(OUT, NAME + "-captions-review.txt"), "w", encoding="utf-8").write("".join(review))
sub = ass_path.replace("\\", "/").replace(":", "\\:")
filt.append(f"[{cur}]subtitles='{sub}'[vout]")
final = os.path.join(OUT, NAME + ".mp4")
print("assembling…")
run([FFMPEG, "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
     "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{total:.3f}", final])
print("DONE:", final, round(total, 1), "s")
