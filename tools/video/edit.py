"""Turns one narration file into the finished video.
Usage: python tools/video/edit.py <voice file> [--no-capture] [--out name]
1. Transcribes the voice (faster-whisper, word timings) and finds the spoken "Part N" markers.
2. Cuts each part's audio (markers and retakes' leading silence removed) and works out cue times from keywords.
3. Records the scenes with capture.mjs using those exact timings (skip with --no-capture to reuse clips).
4. Assembles: clips with cross-fades, voice on top, burned-in captions, end card, loudness normalised.
Writes video/out/<name>.mp4 and video/out/<name>-transcript.txt for review."""
import json, os, re, subprocess, sys, shutil
SITE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VID = os.path.join(os.path.dirname(SITE), "video")
FF = r"C:\Users\Bishal Roy\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin"
FFMPEG, FFPROBE = os.path.join(FF, "ffmpeg.exe"), os.path.join(FF, "ffprobe.exe")
WORK = os.path.join(VID, "work"); OUT = os.path.join(VID, "out"); CLIPS = os.path.join(VID, "clips")
for d in (WORK, OUT, CLIPS): os.makedirs(d, exist_ok=True)

args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args: sys.exit(__doc__)
SRC = args[0]
NAME = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--out=")), "bishal-roy-wispr-flow")
CAPTURE = "--no-capture" not in sys.argv

def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode: sys.exit(f"FAILED: {' '.join(cmd[:6])}...\n{r.stderr[-2000:]}")
    return r.stdout

# ---------- 1. clean voice + transcript ----------
voice = os.path.join(WORK, "voice.wav")
run([FFMPEG, "-y", "-i", SRC, "-ac", "1", "-ar", "48000", "-af", "highpass=f=70,lowpass=f=15000,afftdn=nf=-25", voice])
from faster_whisper import WhisperModel
model = WhisperModel("base.en", device="cpu", compute_type="int8")
PROMPT = ("Bishal Roy, Bengali, Wispr Flow, Wispr Skyport, Vast Realm, Roy, Chandrapur, Lake of Mirrors, Smart India Hackathon, "
          "Rajasthan Royals, Feedback Loop, StripSense, Ghar ka Flow, Campus Flow, Hinglish, Part one.")
import numpy as np
pcm = subprocess.run([FFMPEG, "-v", "error", "-i", voice, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
audio = np.frombuffer(pcm, dtype=np.float32)
segs, _ = model.transcribe(audio, word_timestamps=True, initial_prompt=PROMPT, vad_filter=False, language="en")
words = [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in s.words]
open(os.path.join(OUT, NAME + "-transcript.txt"), "w", encoding="utf-8").write(" ".join(f"[{w['s']:.1f}]{w['w']}" for w in words))

# ---------- 2. split on the spoken "Part N" markers ----------
NUM = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, **{str(i): i for i in range(1, 10)}}
norm = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())
marks = []
for i, w in enumerate(words[:-1]):
    if norm(w["w"]) in ("part", "parts") and norm(words[i + 1]["w"]) in NUM:
        n = NUM[norm(words[i + 1]["w"])]
        if not marks or n == marks[-1][0] + 1 or (n == marks[-1][0] and True): marks.append((n, i, words[i + 1]["e"]))
# a re-read part ("Part three" said twice): keep the last occurrence of each number
last = {}
for n, i, e in marks: last[n] = (i, e)
parts = {}
order = sorted(last)
if not order: sys.exit("No 'Part N' markers found. Check the transcript in video/out/.")
for k, n in enumerate(order):
    i, after = last[n]
    end_i = last[order[k + 1]][0] if k + 1 < len(order) else len(words)
    ws = [w for w in words[i + 2:end_i]]
    if not ws: continue
    parts[n] = {"start": ws[0]["s"], "end": ws[-1]["e"], "words": ws}

import difflib
md = open(os.path.join(VID, "VIDEO-SCRIPT.md"), encoding="utf-8").read()
SCRIPT = [re.sub(r"[*]", "", t) for t in re.findall(r"^> (.+)$", md, flags=re.M)][:9]
def aligned(n, heard):
    """Script words for part n, each with a time taken from the matching heard word (or interpolated)."""
    if n - 1 >= len(SCRIPT): return heard
    sw = SCRIPT[n - 1].split()
    a = [norm(x) for x in sw]; b = [norm(w["w"]) for w in heard]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    if sm.ratio() < 0.6: return heard            # he said something different: caption what was said
    t = [None] * len(sw)
    for blk in sm.get_matching_blocks():
        for j in range(blk.size): t[blk.a + j] = (heard[blk.b + j]["s"], heard[blk.b + j]["e"])
    known = [i for i, x in enumerate(t) if x]
    for i in range(len(sw)):
        if t[i]: continue
        lo = max([k for k in known if k < i], default=None); hi = min([k for k in known if k > i], default=None)
        s0 = t[lo][1] if lo is not None else heard[0]["s"]; e0 = t[hi][0] if hi is not None else heard[-1]["e"]
        span = [k for k in range(i, len(sw)) if not t[k] and (hi is None or k < hi)]
        step = (e0 - s0) / (len(span) + 1); t[i] = (s0 + step * (span.index(i) + 0.5), s0 + step * (span.index(i) + 1))
    return [{"w": sw[i], "s": t[i][0], "e": t[i][1]} for i in range(len(sw))]
# ---------- cue times from keywords (seconds into the part's voice) ----------
CUES = {1: {"enter": ("world", 1)}, 2: {"turn1": ("straight", 1), "turn2": ("island", 1), "travel": ("explore", 1)},
        3: {"depot": ("depot", 1), "sky": ("until", 1)}, 4: {"tower": ("mirror", 1), "mirror": ("turn", 1)},
        5: {"turn": ("spins", 1), "enter": ("shop", 1), "bag": ("numbers", 1), "next": ("stripsense", 1)},
        6: {"forge": ("every", 1), "strike": ("strike", 1), "strike2": ("stage", 3)},
        7: {"crystal1": ("scene", 1), "crystal2": ("feedback", 1), "speak": ("typing", 1)},
        8: {"plan1": ("gap", 1), "plan2": ("creators", 1)}, 9: {"depart": ("next", 1)}}
LEAD = 0.5   # seconds of picture before each part's voice starts
timing = {}
for n, p in parts.items():
    voice_len = p["end"] - p["start"]
    dur = round(LEAD + voice_len + 0.9, 2)
    cues = {}
    aw = aligned(n, p["words"])           # script words with times, robust to misheard words
    for cue, (word, nth) in CUES.get(n, {}).items():
        hits = [w for w in aw if norm(w["w"]) == word]
        if len(hits) >= nth: cues[cue] = round(LEAD + hits[nth - 1]["s"] - p["start"], 2)
    if n == 3 and "sky" in cues:   # the engine change (about 3 s) lands on "rebuilt the engine"; the sky-train lifts off on "until ... the ground"
        cues["rollout"] = round(max(cues.get("depot", 0) + 1.5, cues["sky"] - 3.0), 2)
        dur = max(dur, round(cues["sky"] + 3.4, 2))
    if n == 7: cues["speak"] = round(max(cues.get("crystal2", 0) + 1.0, dur - 4.4), 2)
    if n == 8: dur = max(dur, cues.get("plan2", 0) + 3.0)
    if n == 4 and "tower" in cues and "mirror" in cues: cues["mirror"] = max(cues["mirror"], round(cues["tower"] + 2.6, 2))
    if n == 6 and "forge" in cues and "strike" in cues: cues["strike"] = max(cues["strike"], round(cues["forge"] + 1.4, 2))
    if n == 5 and "turn" in cues and "enter" in cues: cues["enter"] = max(cues["enter"], round(cues["turn"] + 1.2, 2))   # say "the skyport": the cave lights up and carries us on
    if n == 1 and "enter" in cues: dur = max(dur, cues["enter"] + 1.2)
    timing[str(n)] = {"dur": dur, "cues": cues, "voice": [p["start"], p["end"]]}
json.dump(timing, open(os.path.join(WORK, "timing.json"), "w"), indent=1)
print("parts:", {k: v["dur"] for k, v in timing.items()}, "total ~", round(sum(v["dur"] for v in timing.values()), 1), "s")

# ---------- 3. record the scenes ----------
if CAPTURE:
    print("recording scenes…")
    r = subprocess.run(["node", "tools/video/capture.mjs", f"--timing={os.path.join(WORK, 'timing.json')}"], cwd=SITE, text=True, capture_output=True)
    print(r.stdout[-800:]);
    if r.returncode: sys.exit(r.stderr[-1500:])

# ---------- 4. assemble ----------
XF = 0.45
seq = [str(n) for n in sorted(map(int, timing))]
# end card
end_png = os.path.join(WORK, "endcard.png")
run(["node", "tools/video/endcard.mjs", end_png], cwd=SITE)
inputs, filt, t_offsets = [], [], []
for k, n in enumerate(seq):
    inputs += ["-i", os.path.join(CLIPS, f"part{n}.webm")]
    filt.append(f"[{k}:v]trim=0:{timing[n]['dur']},setpts=PTS-STARTPTS,fps=30,format=yuv420p,setsar=1[v{k}]")
inputs += ["-loop", "1", "-t", "5", "-i", end_png]
ke = len(seq)
filt.append(f"[{ke}:v]fps=30,format=yuv420p,setsar=1,fade=t=in:st=0:d=0.6[v{ke}]")
# chain cross-fades
cur, t = "v0", timing[seq[0]]["dur"]
t_offsets.append(0.0)
for k in range(1, ke + 1):
    off = t - XF
    t_offsets.append(off)
    filt.append(f"[{cur}][v{k}]xfade=transition=fade:duration={XF}:offset={off:.3f}[x{k}]")
    cur = f"x{k}"
    t = off + (timing[seq[k]]["dur"] if k < ke else 5)
total = t
# voice: each part's audio placed at its clip start + LEAD
ai = ke + 1
inputs += ["-i", voice]
amix = []
for k, n in enumerate(seq):
    s, e = timing[n]["voice"]
    d = int((t_offsets[k] + LEAD) * 1000)
    filt.append(f"[{ai}:a]atrim={max(0, s - 0.08):.3f}:{e + 0.25:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.05,adelay={d}|{d}[a{k}]")
    amix.append(f"[a{k}]")
filt.append(f"{''.join(amix)}amix=inputs={len(amix)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,apad,atrim=0:{total:.3f}[aout]")

# captions (ASS), phrases of up to ~7 words, timed to the final timeline
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f"{h}:{m:02d}:{s:05.2f}"
FIX = {r"\bwisper\b": "Wispr", r"\bwhisper flow\b": "Wispr Flow", r"\bbishel\b": "Bishal", r"\bvishal\b": "Bishal", r"(\d) %": r"\1%"}
ass = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1920", "PlayResY: 1080", "", "[V4+ Styles]",
       "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       "Style: Cap,Segoe UI Semibold,46,&H00F4FBFF,&H000000FF,&H00140D0A,&H96140D0A,0,0,0,0,100,100,0.5,0,3,14,0,2,160,160,70,1", "",
       "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
for k, n in enumerate(seq):
    ws = aligned(int(n), parts[int(n)]["words"]); shift = t_offsets[k] + LEAD - timing[n]["voice"][0]
    chunk = []
    for j, w in enumerate(ws):
        chunk.append(w)
        brk = w["w"].endswith((".", "?", "!", ",", ":")) and len(chunk) >= 3
        if len(chunk) >= 7 or brk or j == len(ws) - 1:
            text = " ".join(x["w"] for x in chunk)
            for a, b in FIX.items(): text = re.sub(a, b, text, flags=re.I)
            ass.append(f"Dialogue: 0,{ts(chunk[0]['s'] + shift)},{ts(chunk[-1]['e'] + shift + 0.15)},Cap,,0,0,0,,{text}")
            chunk = []
ass_path = os.path.join(WORK, "captions.ass"); open(ass_path, "w", encoding="utf-8").write("\n".join(ass))
sub = ass_path.replace("\\", "/").replace(":", "\\:")
filt.append(f"[{cur}]subtitles='{sub}'[vout]")
final = os.path.join(OUT, NAME + ".mp4")
cmd = [FFMPEG, "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[vout]", "-map", "[aout]",
       "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{total:.3f}", final]
print("assembling…"); run(cmd)
print("DONE:", final, round(total, 1), "s")
