"""Transcribe recordings with word timings (faster-whisper small.en) and save JSON + a readable text file.
Usage: python tools/video/transcribe.py <audio> [<audio> ...]"""
import json, os, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
FF = r"C:\Users\Bishal Roy\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
PROMPT = ("Bishal Roy, Bengali, Wispr Flow, the Vast Realm, Roy, Class 10, Long Line, depot, Lake of Mirrors, kintsugi, Lantern Ring, "
          "Oracle's Reading Room, Feedback Loop, Interview Kickstart, StripSense, Crafters' Quarter, dwarves, alchemists, witches, elves, bards, "
          "Vast City, Echo Caves, Wispr Skyport, Ghar ka Flow, Campus Flow, Bolo, type mat karo, Hinglish, GDG, Council Chamber.")
model = WhisperModel("small.en", device="cpu", compute_type="int8")
for src in sys.argv[1:]:
    pcm = subprocess.run([FF, "-v", "error", "-i", src, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
    audio = np.frombuffer(pcm, dtype=np.float32)
    segs, _ = model.transcribe(audio, word_timestamps=True, initial_prompt=PROMPT, language="en", vad_filter=False, condition_on_previous_text=False)
    out = []
    for s in segs:
        out.append({"s": round(s.start, 2), "e": round(s.end, 2), "text": s.text.strip(), "words": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in s.words]})
    base = os.path.splitext(src)[0]
    json.dump(out, open(base + ".json", "w", encoding="utf-8"), indent=0)
    with open(base + ".txt", "w", encoding="utf-8") as f:
        for s in out: f.write(f"[{s['s']:7.2f} - {s['e']:7.2f}] {s['text']}\n")
    print("done", os.path.basename(src), len(out), "segments")
