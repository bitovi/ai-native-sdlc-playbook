#!/usr/bin/env python3
"""Original jazz cue for the AI-native SDLC playbook overview video. numpy only.

144 BPM (one bar = 1.667 s, six bars = 10 s, so scene cuts land on bar
lines), swung eighths, key of G major. The intro floats on a C lydian
color, the stage sections run on two new six-bar progressions, and the
Maintain section turns to E minor with a straight-eighth bossa feel.
Writes build/music.wav (44.1 kHz, 16-bit stereo, 120 s).

Band: brushes and ride, walking upright bass, Rhodes-style electric piano
(FM synthesis), and a vibraphone for riffs and for the hits that line up
with the picture. Light reverb from an FFT convolution.

The instrument models are the same family as the Bitovi Vibes overview
videos (video/coe-overview and video/factory-overview in that repo).
"""
import os
import wave
import numpy as np

SR = 44100
BPM = 144
BEAT = 60 / BPM
BAR = BEAT * 4
DUR = 120.0
N = int(SR * DUR)
SWING = 0.63
rng = np.random.default_rng(2026)

dry = np.zeros((2, N))
wet = np.zeros((2, N))


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(sig, t, pan=0.0, gain=1.0, send=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    l = np.cos((pan + 1) * np.pi / 4) * gain
    r = np.sin((pan + 1) * np.pi / 4) * gain
    dry[0, i:i + len(sig)] += sig * l
    dry[1, i:i + len(sig)] += sig * r
    if send:
        wet[0, i:i + len(sig)] += sig * l * send
        wet[1, i:i + len(sig)] += sig * r * send


def band(x, lo=None, hi=None):
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, n)


def env_tail(n, rel=0.03):
    e = np.ones(n)
    r = min(n, int(rel * SR))
    e[n - r:] = np.linspace(1, 0, r)
    a = min(n, int(0.003 * SR))
    e[:a] *= np.linspace(0, 1, a)
    return e


# ── instruments ─────────────────────────────────────────────────────
def rhodes(m, dur, vel=0.6):
    f = mtof(m)
    n = int((dur + 1.0) * SR)
    t = np.arange(n) / SR
    idx = 1.7 * vel * np.exp(-t * 7) + 0.22
    mod = np.sin(2 * np.pi * f * t) * idx
    body = np.sin(2 * np.pi * f * t + mod)
    tine = 0.22 * vel * np.sin(2 * np.pi * f * 7.03 * t) * np.exp(-t * 22)
    amp = np.exp(-t * 0.95)
    gate = np.ones(n)
    k = int(dur * SR)
    gate[k:] = np.exp(-(t[k:] - dur) * 10)
    trem = 1 + 0.16 * np.sin(2 * np.pi * 4.8 * t)
    return (body + tine) * amp * gate * trem * env_tail(n, 0.01) * vel * 1.7


def vibes(m, dur=1.4, vel=0.6):
    f = mtof(m)
    n = int((dur + 0.6) * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 7) \
        + 0.08 * np.sin(2 * np.pi * f * 10.0 * t) * np.exp(-t * 18)
    amp = np.exp(-t * 1.8) * (1 + 0.24 * np.sin(2 * np.pi * 5.2 * t))
    return s * amp * env_tail(n, 0.2) * vel * 1.5


def bass(m, dur, vel=0.8):
    f = mtof(m)
    n = int((dur + 0.08) * SR)
    t = np.arange(n) / SR
    bend = 1 + 0.012 * np.exp(-t * 40)
    ph = 2 * np.pi * f * np.cumsum(bend) / SR
    s = np.sin(ph) + 0.6 * np.sin(2 * ph) * np.exp(-t * 4) + 0.28 * np.sin(3 * ph) * np.exp(-t * 9)
    amp = np.exp(-t * 2.5)
    thump = band(rng.standard_normal(n), 80, 600) * np.exp(-t * 60) * 0.25
    return (s * amp + thump) * env_tail(n, 0.04) * vel * 0.38


def kick(vel=0.6):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    f = 54 + 80 * np.exp(-t * 34)
    click = band(rng.standard_normal(n), 2000, 7000) * np.exp(-t * 300) * 0.15
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12) + click) * vel * 0.5


def ride(vel=0.3):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    metal = sum(np.sin(2 * np.pi * fr * t + p) for fr, p in [(3310, 0), (4520, 1), (5980, 2), (7410, .5), (9050, 1.7)]) / 5
    noise = band(rng.standard_normal(n), 5000, 14000)
    return (metal * 0.6 + noise * 0.5) * np.exp(-t * 5) * (1 - np.exp(-t * 900)) * vel


def hat(vel=0.25, open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return band(rng.standard_normal(n), 6500, 15000) * np.exp(-t * (14 if open_ else 80)) * vel


def brush(vel=0.2, dur=0.32):
    """a brush slap with a short swish"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = np.exp(-t * 22) + 0.35 * np.exp(-t * 6)
    return band(rng.standard_normal(n), 1500, 9000) * e * vel


def swirl(dur, vel=0.06):
    """the circular brush stroke under a bar"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = 0.6 + 0.4 * np.sin(2 * np.pi * t / BEAT - np.pi / 2)
    return band(rng.standard_normal(n), 2000, 7000) * e * env_tail(n, 0.05) * vel


def snare(vel=0.2):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 196 * t) * np.exp(-t * 30) * 0.5
    noise = band(rng.standard_normal(n), 1200, 9000) * np.exp(-t * 18)
    return (body + noise) * vel


def rim(vel=0.25):
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 1750 * t) * np.exp(-t * 90) + 0.6 * np.sin(2 * np.pi * 840 * t) * np.exp(-t * 70)
    return (tone + band(rng.standard_normal(n), 2500, 9000) * np.exp(-t * 120) * 0.5) * vel


def crash(vel=0.4):
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    metal = sum(np.sin(2 * np.pi * fr * t + p) for fr, p in [(2810, 0), (4070, 1), (5390, 2), (6690, .3), (8180, 1.1), (9700, 2.2)]) / 6
    noise = band(rng.standard_normal(n), 3500, 15000)
    return (noise * 0.7 + metal * 0.4) * np.exp(-t * 1.7) * (1 - np.exp(-t * 400)) * vel


def whoosh(dur=0.44, vel=0.13):
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = (t / dur) ** 2.2
    e[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return band(rng.standard_normal(n), 900, 7000) * e * vel


def tick(vel=0.1, f=2600):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 200) * vel


# ── harmony ─────────────────────────────────────────────────────────
CH = {  # root pitch class, chord tones (semitones), Rhodes voicing (midi)
    'Gmaj9': (7, [0, 4, 7, 11], [59, 62, 66, 69]),
    'E7alt': (4, [0, 4, 8, 10], [56, 62, 67, 72]),
    'Am9': (9, [0, 3, 7, 10], [60, 64, 67, 71]),
    'D13': (2, [0, 4, 7, 10], [54, 60, 64, 71]),
    'D7sus': (2, [0, 5, 7, 10], [60, 64, 67, 69]),
    'Cmaj9': (0, [0, 4, 7, 11], [59, 62, 64, 67]),
    'F13': (5, [0, 4, 7, 10], [57, 63, 67, 74]),
    'Bm7': (11, [0, 3, 7, 10], [57, 62, 64, 66]),
    'Em9': (4, [0, 3, 7, 10], [55, 59, 62, 66]),
    'Cmaj7#11': (0, [0, 4, 7, 11], [59, 64, 66, 67]),
    'B7alt': (11, [0, 4, 8, 10], [57, 63, 67, 72]),
}
A = ['Gmaj9', 'E7alt', 'Am9', 'D13', 'Gmaj9', 'D7sus']
B = ['Cmaj9', 'F13', 'Bm7', 'E7alt', 'Am9', 'D13']
M = ['Em9', 'Em9', 'Cmaj7#11', 'B7alt', 'Em9', 'B7alt']          # Maintain: E minor bossa
BARS = (['Cmaj7#11', 'Bm7', 'Am9', 'Bm7', 'Cmaj7#11', 'D7sus']    # 0-10 s    code got fast
        + ['Am9', 'D7sus', 'D13']                                  # 10-15 s   the line becomes a loop
        + ['Gmaj9', 'Em9', 'D13']                                  # 15-20 s   lift: the loop runs
        + A + B + A + B + A + M                                    # 20-80 s   six stages
        + ['Am9', 'D7sus', 'Gmaj9', 'Em9', 'Cmaj9', 'D13']         # 80-90 s   the loop closes (lift at 83.3)
        + B + A                                                    # 90-110 s  roadmap
        + ['Cmaj9', 'Am9', 'D7sus', 'Gmaj9', 'Gmaj9', 'Gmaj9'])    # 110-120 s end
assert len(BARS) == 72
SECTION = {}
for i, name in enumerate(['A', 'B', 'A', 'B', 'A', 'M', 'L', 'B', 'A']):
    for b in range(12 + i * 6, 18 + i * 6):
        SECTION[b] = name
FINAL = 69 * BAR   # 115.0 s, the button


def bar_t(b):
    return b * BAR


def pos(b, beat, off=False):
    return bar_t(b) + beat * BEAT + (SWING * BEAT if off else 0) + rng.normal(0, 0.003)


def spos(b, eighth):
    """straight eighths for the bossa section"""
    return bar_t(b) + eighth * BEAT / 2 + rng.normal(0, 0.002)


def bass_note(pc, lo=31):
    m = 28 + ((pc - 4) % 12)
    return m if m >= lo else m + 12


# ── drums ───────────────────────────────────────────────────────────
for b in range(72):
    t0 = bar_t(b)
    if b >= 69:
        continue
    sec = SECTION.get(b)
    if b < 6:     # intro: brush swirl, slaps on 2 and 4, a light hat
        place(swirl(BAR, 0.05 + 0.01 * b), t0, 0.2)
        for bt in (1, 3):
            place(brush(0.16), pos(b, bt), -0.15, send=0.1)
        for bt in range(4):
            place(hat(0.08), pos(b, bt, True), 0.35)
        if b >= 2:
            place(kick(0.28), pos(b, 0))
        if b == 5:
            for k in range(8):
                place(snare(0.04 + 0.12 * k / 7), t0 + 2 * BEAT + k * BEAT / 4, 0.1, send=0.12)
        continue
    if 6 <= b <= 8:   # the loop forms: ride comes in, pulse builds, roll into the lift
        for bt in range(4):
            place(ride(0.2 + 0.03 * (b - 6)), pos(b, bt), 0.35, send=0.1)
            place(ride(0.12), pos(b, bt, True), 0.35, send=0.08)
        place(kick(0.34), pos(b, 0)); place(kick(0.24), pos(b, 2))
        for bt in (1, 3):
            place(brush(0.18), pos(b, bt), -0.15, send=0.1)
        if b == 8:
            for k in range(16):
                place(snare(0.05 + 0.24 * k / 15), t0 + k * BEAT / 4, 0.1, send=0.15)
        continue
    if sec == 'M':   # bossa: rim clave, straight eighths on the ride, soft kick pattern
        for e in range(8):
            place(ride(0.2 if e % 2 == 0 else 0.13), spos(b, e), 0.35, send=0.08)
        for e in ([0, 3, 6] if b % 2 == 0 else [2, 4]):
            place(rim(0.22), spos(b, e), -0.2, send=0.1)
        for e, v in [(0, .4), (3, .25), (4, .34), (7, .22)]:
            place(kick(v), spos(b, e))
        continue
    # swing groove: ride pattern, hats and brush slaps on 2 and 4, feathered kick
    lift = sec == 'L' or b >= 54
    for bt, off, v in [(0, False, .3), (1, False, .24), (1, True, .17), (2, False, .28), (3, False, .24), (3, True, .17)]:
        place(ride(v), pos(b, bt, off), 0.35, send=0.1)
    for bt in (1, 3):
        place(hat(0.2), pos(b, bt), 0.3)
        place(brush(0.2 if not lift else 0.24), pos(b, bt), -0.15, send=0.12)
    place(kick(0.4), pos(b, 0))
    place(kick(0.22), pos(b, 2))
    if lift:
        place(kick(0.24), pos(b, 1, True))
    for bt in range(4):
        if rng.random() < 0.28:
            place(snare(0.05), pos(b, bt, True), -0.1)
    if (b - 12) % 6 == 5 or b == 11:
        place(snare(0.26), pos(b, 3, True), -0.1, send=0.2)   # kick-up into the cut

# lifts, crashes, and scene changes
for t, v in [(15.0, .5), (20.0, .22), (50.0, .2), (60.0, .2), (83.333, .5), (90.0, .22), (110.0, .22)]:
    place(crash(v), t, -0.3, send=0.3)
    place(kick(0.6), t)
for t in (20, 30, 40, 50, 60, 70, 80, 90, 100, 110):
    place(whoosh(), t - 0.45, 0.0, send=0.2)
place(whoosh(0.9, 0.1), 9.15)      # the line bends into a loop
place(whoosh(1.1, 0.1), 18.55)     # the loop flies to the corner

# ── bass ────────────────────────────────────────────────────────────
BOSSA = [(0, 0, .45, .78), (3, 7, .3, .6), (4, 7, .4, .66), (7, 0, .2, .55)]   # eighth, interval, dur, vel
for b, name in enumerate(BARS):
    pc, tones, _ = CH[name]
    root = bass_note(pc)
    if b >= 69:
        if b == 69:
            place(bass(bass_note(7), 3.6, 0.9), FINAL)
        continue
    if b < 6:   # intro: two-feel with a pickup
        place(bass(root, 0.75, 0.7), pos(b, 0))
        fifth = root + 7 if root + 7 <= 45 else root - 5
        place(bass(fifth, 0.6, 0.6), pos(b, 2))
        if b % 2:
            place(bass(root + 2 if root + 2 <= 45 else root - 10, 0.2, 0.45), pos(b, 3, True))
        continue
    if 6 <= b <= 8:   # pedal on D under the build
        for k in range(8):
            place(bass(bass_note(2), 0.18, 0.5 + 0.08 * (k % 2)), bar_t(b) + k * BEAT / 2)
        continue
    if SECTION.get(b) == 'M':
        for e, iv, d, v in BOSSA:
            place(bass(root + iv if root + iv <= 45 else root + iv - 12, d, v), spos(b, e))
        continue
    nxt = CH[BARS[b + 1]][0] if b + 1 < 72 else 7
    nroot = bass_note(nxt)
    third, fifth = root + tones[1], root + tones[2]
    seven = root + tones[3] - 12 if root + tones[3] > 45 else root + tones[3]
    line_ = [root, rng.choice([third, fifth]), rng.choice([fifth, seven, third]), nroot + rng.choice([-1, 1])]
    for bt, m in enumerate(line_):
        m = int(m)
        if m > 45:
            m -= 12
        place(bass(m, 0.4, 0.76 if bt == 0 else 0.62), pos(b, bt))
    if rng.random() < 0.3:
        place(bass(int(line_[2]) - (12 if line_[2] > 45 else 0), 0.12, 0.36), pos(b, 2, True))

# ── Rhodes comping ──────────────────────────────────────────────────
PATTERNS = [
    [(0, False, .9, .55), (1, True, .4, .5)],
    [(0, True, .35, .5), (2, False, .6, .48)],
    [(0, False, .35, .5), (1, True, .3, .46), (3, False, .5, .45)],
    [(1, False, .3, .48), (2, True, .3, .46), (3, True, .5, .44)],
]
for b, name in enumerate(BARS):
    _, _, voicing = CH[name]
    if b >= 69:
        continue
    sec = SECTION.get(b)
    if b < 6:
        hits = [(0, False, 1.5, .42)] + ([(2, True, .5, .3)] if b % 2 else [])
    elif 6 <= b <= 8:
        hits = [(0, False, .3, .45), (1, True, .25, .42), (2, True, .25, .42), (3, True, .3, .45)]
    elif b == 9:
        hits = [(0, False, 1.5, .75)]
    elif sec == 'M':
        hits = None
        for e, d, v in [(0, .25, .45), (3, .2, .4), (6, .3, .42)] if b % 2 == 0 else [(2, .25, .42), (5, .4, .44)]:
            t0 = spos(b, e)
            for k, m in enumerate(voicing):
                place(rhodes(m, d, v * 0.55), t0 + k * 0.004, -0.25 + 0.15 * k, 0.3, send=0.3)
        continue
    elif b == 50:
        hits = [(0, False, 1.5, .75)]
    else:
        hits = PATTERNS[int(rng.integers(len(PATTERNS)))]
    for bt, off, d, v in hits:
        t0 = pos(b, bt, off)
        for k, m in enumerate(voicing):
            place(rhodes(m, d, v * 0.55), t0 + k * 0.005, -0.25 + 0.15 * k, 0.3, send=0.28)
for k, m in enumerate([55, 59, 62, 64, 69, 71]):      # final chord: G6/9 over the low G
    place(rhodes(m, 3.2, 0.5), FINAL + k * 0.012, -0.3 + 0.12 * k, 0.32, send=0.4)


# ── vibraphone ──────────────────────────────────────────────────────
def vib(m, t, d=0.7, v=0.36, pan=0.3):
    place(vibes(m, d, v), t, pan, 0.3, send=0.42)


def slot(s):
    return (s // 2) * BEAT + (SWING * BEAT if s % 2 else 0)


# cold open: six stages pop in a line, then code pours out of Build
for i, m in enumerate([67, 69, 71, 72, 74, 76]):
    vib(m, 0.2 + i * 0.2, 0.45, 0.24)
vib(83, 2.1, 0.5, 0.26)                               # the bolt under Build
for k in range(16):                                   # each code item leaves Build
    place(tick(0.07, 2400 + (k % 4) * 200), 1.67 + k * BEAT, 0.4)
for t in (3.33, 5.0, 6.67, 8.33):                     # Test lets one through, slowly
    place(rim(0.2), t, -0.2, send=0.1)
for k in range(4):                                    # human-speed clocks
    place(tick(0.09, 1300), 5.0 + k * BEAT, -0.3)
# the line bends into a loop, nodes land, the ring closes
for i, m in enumerate([67, 71, 74, 78, 81, 83]):
    vib(m, 10.9 + i * 0.08, 0.6, 0.26)
# a marker runs the loop and leaves a file at each stage
for i, m in enumerate([74, 76, 78, 79, 81, 83]):
    vib(m, 12.5 + i * BEAT, 0.5, 0.3)
for k, m in enumerate([67, 71, 74, 78, 83]):          # lift: the loop runs
    vib(m, 15.0 + k * 0.05, 2.0, 0.4)
for k, m in enumerate([79, 81, 83, 86]):              # people at the gates
    vib(m, 16.25 + k * BEAT, 0.5, 0.28)
    place(rim(0.16), 16.25 + k * BEAT, 0.2)
vib(86, 18.0, 0.8, 0.32)                              # the idea appears

RIFFS = {
    'A': [(0, 74), (1, 76), (3, 78), (4, 81), (6, 79), (9, 76), (10, 74), (12, 71)],
    'B': [(1, 76), (2, 79), (4, 83), (5, 81), (7, 79), (8, 76), (11, 74), (13, 76)],
    'M': [(0, 71), (3, 74), (5, 76), (8, 79), (10, 78), (12, 76), (14, 74)],
    'L': [(0, 79), (2, 81), (3, 83), (5, 86), (8, 83), (10, 81), (12, 79)],
}
for i, name in enumerate(['A', 'B', 'A', 'B', 'A', 'M', 'L', 'B', 'A']):
    start = 20 + 10 * i
    up = 12 if i in (2, 3) else (5 if i in (7, 8) else 0)     # Build and Test an octave up; roadmap a fourth up
    for s, m in RIFFS[name]:
        vib(m + up, start + 4 * BAR + slot(s), 0.5, 0.26 if up == 12 else 0.3)   # riff in bar 5 of the section

# hits that line up with the picture (times match anim.js)
# Plan
for k in range(6):                                    # you describe (high), Claude asks (low)
    vib([79, 74, 81, 74, 83, 76][k], 21.25 + k * BEAT, 0.4, 0.24 if k % 2 == 0 else 0.2)
vib(81, 24.7, 0.6, 0.3)                               # idea becomes intent.md
for k, m in enumerate([74, 78, 81]):                  # Problem, Outcome, Constraints
    vib(m, 25.42 + k * BEAT, 0.5, 0.32)
place(kick(0.5), 27.5); vib(83, 27.5, 0.9, 0.34); vib(86, 27.55, 0.9, 0.3)   # approved
# Design
for k, m in enumerate([76, 79, 83]):                  # skills arrive
    vib(m, 31.25 + k * BEAT, 0.5, 0.3)
for k, m in enumerate([83, 86, 88]):                  # skills stamp the spec
    vib(m, 34.17 + k * 0.21, 0.3, 0.26)
place(bass(bass_note(4), 0.3, 0.5), 35.42); place(rim(0.24), 35.42, 0.2)   # concern flagged
place(kick(0.45), 37.5); vib(79, 37.5, 0.8, 0.32); vib(83, 37.55, 0.8, 0.28)  # resolved
# Build
vib(78, 40.55, 0.5, 0.26)                             # plan mode
vib(81, 42.92, 0.6, 0.3)                              # plan.md
place(kick(0.5), 44.17); vib(86, 44.17, 0.7, 0.32)    # the engineer accepts, locks open
for k, m in enumerate([74, 78, 81]):                  # three parallel sessions
    vib(m, 45.0 + k * BEAT, 0.5, 0.28)
for k, m in enumerate([79, 83, 86, 91]):              # the work comes back together
    vib(m, 48.33 + k * 0.04, 1.0, 0.3)
# Test
place(bass(bass_note(4, 28), 0.25, 0.5), 52.5); place(snare(0.22), 52.5, -0.2)   # red
for k, m in enumerate([79, 83, 86]):                  # green
    vib(m, 53.75 + k * 0.05, 0.8, 0.32)
place(tick(0.08, 1800), 55.42, 0.3)                   # a line is dropped from CLAUDE.md
for k in range(5):                                    # evals rerun
    vib(74 + 2 * k, 55.83 + k * 0.23, 0.3, 0.2)
place(bass(bass_note(4, 28), 0.3, 0.5), 56.67); place(snare(0.24), 56.67, -0.2)   # one eval fails
place(kick(0.5), 57.08); place(snare(0.3), 57.08, 0, 1, send=0.2)                 # the gate holds the change
vib(86, 58.33, 0.7, 0.32)                             # line restored, all green
# Deploy
for k, m in enumerate([76, 79, 83]):                  # three review passes
    vib(m, 61.67 + k * 0.83, 0.5, 0.28)
place(kick(0.45), 64.17); vib(86, 64.17, 0.7, 0.32)   # the code owner approves
vib(79, 65.6, 0.4, 0.26); vib(81, 66.25, 0.4, 0.26)   # dev, staging
place(bass(bass_note(2), 0.4, 0.55), 66.8)            # held at the production gate
place(kick(0.55), 67.5); place(snare(0.3), 67.5, 0, 1, send=0.2); vib(83, 67.5, 0.8, 0.32)   # release manager signs off
for k, m in enumerate([79, 83, 86, 90]):              # live
    vib(m, 68.33 + k * 0.04, 1.0, 0.3)
# Maintain
for k, m in enumerate([71, 74, 76]):                  # control bands draw in
    vib(m, 70.4 + k * BEAT, 0.5, 0.22)
place(crash(0.3), 73.33, 0.3, send=0.2); place(kick(0.6), 73.33); place(snare(0.3), 73.33)   # breach
vib(83, 73.33, 0.3, 0.3); vib(77, 73.5, 0.3, 0.28); vib(83, 73.66, 0.3, 0.26)                # the alarm
place(rim(0.26), 74.17, 0.2); place(rim(0.2), 74.38, 0.2)   # rollback
vib(76, 76.25, 0.7, 0.3); vib(79, 76.3, 0.7, 0.26)    # the agent writes intent.md
# the loop closes
for k, m in enumerate([71, 74, 76, 79]):
    vib(m, 82.0 + k * 0.33, 0.4, 0.24)                # Maintain back to Plan
for k, m in enumerate([67, 71, 74, 79, 83, 86]):      # lift
    vib(m, 83.333 + k * 0.05, 2.0, 0.36)
for i, m in enumerate([79, 81, 83, 86, 88]):          # a file at each stage
    vib(m, 83.333 + (i + 1) * 2 * BEAT, 0.5, 0.26)
# roadmap
for k, m in enumerate([67, 69, 71, 72, 74, 76]):      # row 1 blocks land
    vib(m, 90.83 + k * BEAT, 0.4, 0.24)
vib(79, 93.33, 0.6, 0.28)                             # start anywhere
for k, t in enumerate([95.0, 95.42, 95.83, 96.25, 96.67]):
    vib(78 + 2 * k, t, 0.4, 0.26)
for k, m in enumerate([79, 83, 86, 91]):              # closing the loop on top
    vib(m, 97.5 + k * 0.05, 1.2, 0.32)
place(kick(0.5), 97.5)
for t, m in [(101.25, 79), (102.92, 83), (104.17, 86)]:   # by hand, command, on merge
    vib(m, t, 0.5, 0.3)
place(tick(0.1, 2000), 104.17)
for k in range(2):                                    # approved, then it fires the next step
    place(rim(0.2), 105.83 + k * 1.25, 0.2)
    vib(83 + 3 * k, 105.93 + k * 1.25, 0.4, 0.28)
    vib(79 + 3 * k, 106.25 + k * 1.25, 0.5, 0.28)
# end: the button
place(crash(0.45), FINAL, -0.3, send=0.35); place(kick(0.7), FINAL)
for k, m in enumerate([67, 71, 74, 76, 81, 86]):
    vib(m, FINAL + k * 0.06, 3.0, 0.34)

# ── reverb, master ──────────────────────────────────────────────────
ir_n = int(2.2 * SR)
ti = np.arange(ir_n) / SR
irs = []
for ch in range(2):
    ir = rng.standard_normal(ir_n) * np.exp(-ti * 3.0)
    ir = band(ir, 250, 6000)
    ir[: int(0.012 * SR)] = 0
    irs.append(ir / np.sqrt(np.sum(ir ** 2)))
L = N + ir_n
nfft = 1 << (L - 1).bit_length()
out = dry.copy()
for ch in range(2):
    rev = np.fft.irfft(np.fft.rfft(wet[ch], nfft) * np.fft.rfft(irs[ch], nfft), nfft)[:N]
    out[ch] += rev * 0.55

# low shelf cut below 100 Hz so the bass does not dominate
for ch in range(2):
    X = np.fft.rfft(out[ch])
    f = np.fft.rfftfreq(N, 1 / SR)
    g = 1 - 0.45 / (1 + (f / 100) ** 4)
    g[f < 25] *= (f[f < 25] / 25) ** 2
    out[ch] = np.fft.irfft(X * g, N)

t = np.arange(N) / SR
shape = np.interp(t, [0, 10.0, 15.0, 117.5, 120.0], [0.84, 0.92, 1.0, 1.0, 0.0])
shape *= np.where(t > 117.5, np.cos(np.clip((t - 117.5) / 2.5, 0, 1) * np.pi / 2) ** 2, 1)
out *= shape
out -= out.mean(axis=1, keepdims=True)
peak = np.max(np.abs(out))
out = out / peak * 1.3
out = np.tanh(out) / np.tanh(1.3) * 0.89     # soft limit, peak about -1 dBFS
fade_in = int(0.01 * SR)
out[:, :fade_in] *= np.linspace(0, 1, fade_in)

os.makedirs(os.path.join(os.path.dirname(__file__) or '.', 'build'), exist_ok=True)
path = os.path.join(os.path.dirname(__file__) or '.', 'build', 'music.wav')
pcm = (np.clip(out.T, -1, 1) * 32767).astype('<i2')
with wave.open(path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f'wrote {path}: {N / SR:.1f} s, peak {np.max(np.abs(out)):.3f}')
