/* AI-native SDLC playbook overview: deterministic motion graphics.
 * seek(t) draws the exact frame for time t (seconds). Pure function of t:
 * no wall clock, no CSS transitions, seeded randomness only.
 * Timeline is locked to 144 BPM: one beat = 0.4167 s, one bar = 1.667 s,
 * six bars = 10 s. Every scene starts on a bar line.
 * Helpers (easing, icons, bursts) are copied from the Bitovi Vibes overview
 * videos (video/coe-overview and video/factory-overview in that repo), so
 * this folder renders on its own.
 */
'use strict';
var W = 1280, H = 720, FPS = 30, DUR = 120, BPM = 144, BEAT = 60 / BPM, BAR = 4 * BEAT;
/* colors from site/assets/playbook.css, lightened where they sit on navy */
var C = {
  navy: '#0b1530', navy2: '#16244a', red: '#ca2f35', redL: '#fb8b8f',
  rose: '#fb7185', roseL: '#fda4af', roseD: '#e11d48',           // a person decides
  teal: '#5eead4', tealD: '#0d9488', tealM: '#14b8a6',            // an agent does the work
  amb: '#d97706', ambL: '#fcd34d',                                // a gate or check
  ind: '#a5b4fc', indD: '#4f46e5', indM: '#818cf8',               // a committed file
  slate: '#94a3b8', slateD: '#475569',                            // the traditional way
  green: '#86efac', fail: '#f87171',
  ink: '#ffffff', txt: '#e2e8f0', mut: '#a9b6cc', bg0: '#070d1f'
};
var MONO = 'JetBrains Mono';
var HOME = { x: 150, y: 392 };
var cv = document.getElementById('c');
var ctx = cv.getContext('2d');
function b(k) { return k * BEAT; }

/* ── math and easing ─────────────────────────────────────────────── */
function clamp(x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.max(a, Math.min(b, x)); }
function lerp(a, b, p) { return a + (b - a) * p; }
function P(t, a, b) { return clamp((t - a) / (b - a)); }
var E = {
  inOut: function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
  out: function (p) { return 1 - Math.pow(1 - p, 3); },
  in: function (p) { return p * p * p; },
  quad: function (p) { return p * p; },
  back: function (p) { var c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
};
function pop(t, t0, d) { return E.back(P(t, t0, t0 + (d || 0.4))); }
function fin(t, t0, d) { return E.out(P(t, t0, t0 + (d || 0.3))); }
function fade(t, a0, a1, b0, b1) { return P(t, a0, a1) * (1 - P(t, b0, b1)); }
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var r = Math.imul(seed ^ seed >>> 15, 1 | seed);
    r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}
function tri(u) { u = ((u % 2) + 2) % 2; return 1 - Math.abs(u - 1); }
function beatPulse(t) { var q = ((t % BEAT) + BEAT) % BEAT; return Math.exp(-q * 9); }
function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
/* keyframes: [[time, x, y, scale, arc]] eased per segment */
function kf(t, keys) {
  if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], s: keys[0][3] === undefined ? 1 : keys[0][3] };
  for (var i = 0; i < keys.length - 1; i++) {
    var a = keys[i], c = keys[i + 1];
    if (t <= c[0]) {
      var p = E.inOut((t - a[0]) / (c[0] - a[0]));
      var sa = a[3] === undefined ? 1 : a[3], sb = c[3] === undefined ? 1 : c[3];
      return { x: lerp(a[1], c[1], p), y: lerp(a[2], c[2], p) - Math.sin(Math.PI * p) * (c[4] || 0), s: lerp(sa, sb, p) };
    }
  }
  var l = keys[keys.length - 1];
  return { x: l[1], y: l[2], s: l[3] === undefined ? 1 : l[3] };
}

/* ── drawing helpers ─────────────────────────────────────────────── */
function setFont(size, w, fam) { ctx.font = (w || 700) + ' ' + size + 'px "' + (fam || 'Poppins') + '"'; }
function text(s, x, y, o) {
  o = o || {};
  ctx.save();
  setFont(o.size || 24, o.w || 700, o.f || 'Poppins');
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  ctx.globalAlpha *= (o.a === undefined ? 1 : o.a);
  if (o.ls) ctx.letterSpacing = o.ls + 'px';
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 14; }
  ctx.fillStyle = o.color || C.ink;
  ctx.fillText(s, x, y);
  ctx.restore();
}
function tw(s, size, w, f) { ctx.save(); setFont(size, w, f); var v = ctx.measureText(s).width; ctx.restore(); return v; }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function chip(s, x, y, o) {
  o = o || {};
  var size = o.size || 24, f = o.f || 'Poppins';
  ctx.save();
  ctx.globalAlpha *= (o.a === undefined ? 1 : o.a);
  setFont(size, o.w || 700, f);
  var w = ctx.measureText(s).width + size * 1.3, h = size * 1.75;
  ctx.translate(x, y); if (o.s !== undefined) ctx.scale(o.s, o.s); if (o.rot) ctx.rotate(o.rot);
  rr(-w / 2, -h / 2, w, h, o.sq ? 10 : h / 2);
  ctx.fillStyle = o.bg || hexA(o.color || C.teal, 0.18); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = o.color || C.teal; ctx.stroke();
  ctx.fillStyle = o.tc || C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(s, 0, 1);
  ctx.restore();
  return w;
}
function glow(x, y, r, color, a) {
  if (a <= 0 || r <= 0) return;
  var g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, a)); g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function line(x1, y1, x2, y2, color, w, dash) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w || 2; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function qPoint(x1, y1, cx, cy, x2, y2, p) {
  var a = (1 - p) * (1 - p), c = 2 * (1 - p) * p, d = p * p;
  return { x: a * x1 + c * cx + d * x2, y: a * y1 + c * cy + d * y2 };
}
function qCurve(x1, y1, cx, cy, x2, y2, p, color, w, dash, off) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w || 2; ctx.lineCap = 'round';
  if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = off || 0; }
  ctx.beginPath(); ctx.moveTo(x1, y1);
  var n = 28;
  for (var i = 1; i <= n; i++) { var q = qPoint(x1, y1, cx, cy, x2, y2, p * i / n); ctx.lineTo(q.x, q.y); }
  ctx.stroke(); ctx.restore();
}
function burst(x, y, t, t0, o) {
  o = o || {};
  var dt = t - t0, life = o.life || 0.9;
  if (dt < 0 || dt > life) return;
  var r = rng(o.seed || 7), n = o.n || 18, sp = o.speed || 520;
  ctx.save();
  for (var i = 0; i < n; i++) {
    var a = r() * Math.PI * 2, v = sp * (0.35 + r() * 0.86), sz = (o.size || 4) * (0.5 + r());
    var k = (1 - Math.exp(-dt * 5)) / 5;
    var px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + (o.grav || 0) * dt * dt;
    ctx.globalAlpha = 1 - dt / life;
    ctx.fillStyle = i % 3 === 0 ? (o.c2 || C.ambL) : (o.color || C.teal);
    if (i % 4 === 0) { ctx.save(); ctx.translate(px, py); ctx.rotate(a + dt * 6); ctx.fillRect(-sz, -sz * 0.35, sz * 2, sz * 0.7); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(px, py, sz * 0.6, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = (1 - dt / life) * 0.8; ctx.strokeStyle = o.color || C.teal; ctx.lineWidth = 3 * (1 - dt / life) + 0.5;
  ctx.beginPath(); ctx.arc(x, y, 12 + (o.ring || 90) * E.out(dt / life), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

/* ── icons ───────────────────────────────────────────────────────── */
function avatar(x, y, s, color, a) {
  if ((a !== undefined && a <= 0) || !(s > 2)) return;
  ctx.save(); ctx.globalAlpha *= (a === undefined ? 1 : a);
  ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2);
  ctx.fillStyle = hexA(color, 0.22); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = color; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, s - 1.5, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, -s * 0.22, s * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, s * 0.72, s * 0.62, s * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore(); ctx.restore();
}
function lockIcon(x, y, s, color, open) {
  ctx.save(); ctx.translate(x, y);
  var o = (open || 0) * s * 0.25;
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -s * 0.15 - o, s * 0.3, Math.PI, 0); ctx.lineTo(s * 0.3, s * 0.05 - o); ctx.moveTo(-s * 0.3, -s * 0.15 - o); ctx.lineTo(-s * 0.3, s * 0.05 - o * (1 - (open || 0)) ); ctx.stroke();
  rr(-s * 0.45, -s * 0.05, s * 0.9, s * 0.65, s * 0.12); ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(0, s * 0.24, s * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function gear(x, y, r, rot, color, fillA) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  var n = 8;
  for (var i = 0; i < n * 2; i++) {
    var a0 = i * Math.PI / n, a1 = (i + 1) * Math.PI / n;
    ctx.arc(0, 0, i % 2 === 0 ? r : r * 0.78, a0 + 0.08, a1 - 0.08);
  }
  ctx.closePath();
  ctx.fillStyle = hexA(color, fillA === undefined ? 0.25 : fillA); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
function checkIcon(x, y, s, color, p) {
  p = p === undefined ? 1 : p; if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.45, y);
  var p1 = Math.min(1, p * 2);
  ctx.lineTo(x - s * 0.45 + s * 0.3 * p1, y + s * 0.3 * p1);
  if (p > 0.5) { var p2 = (p - 0.5) * 2; ctx.lineTo(x - s * 0.15 + s * 0.6 * p2, y + s * 0.3 - s * 0.65 * p2); }
  ctx.stroke(); ctx.restore();
}
function crossIcon(x, y, s, color) {
  line(x - s / 2, y - s / 2, x + s / 2, y + s / 2, color, s * 0.22);
  line(x + s / 2, y - s / 2, x - s / 2, y + s / 2, color, s * 0.22);
}
/* a round badge with a check (ok) or a cross (fail) */
function badge(x, y, r, ok, sc) {
  if (!(sc > 0.01)) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = ok ? C.teal : C.fail; ctx.fill();
  if (ok) checkIcon(0, 0, r * 0.95, C.bg0, 1); else crossIcon(0, 0, r * 0.8, C.bg0);
  ctx.restore();
}
/* a person approving: rose avatar with a check badge */
function approver(x, y, s, a, ok) {
  avatar(x, y, s, C.rose, a);
  if (ok > 0) {
    ctx.save(); ctx.globalAlpha *= (a === undefined ? 1 : a);
    ctx.beginPath(); ctx.arc(x + s * 0.72, y + s * 0.72, s * 0.42 * ok, 0, Math.PI * 2); ctx.fillStyle = C.roseD; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
    checkIcon(x + s * 0.72, y + s * 0.72, s * 0.4 * ok, '#fff', 1);
    ctx.restore();
  }
}
function warnIcon(x, y, s, color) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(0, -s * 0.5); ctx.lineTo(s * 0.55, s * 0.45); ctx.lineTo(-s * 0.55, s * 0.45); ctx.closePath();
  ctx.lineJoin = 'round'; ctx.lineWidth = s * 0.08; ctx.strokeStyle = color; ctx.stroke();
  ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = C.bg0; rr(-s * 0.05, -s * 0.18, s * 0.1, s * 0.38, 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, s * 0.3, s * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function clockIcon(x, y, r, ang, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = hexA(color, 0.15); ctx.fill(); ctx.stroke();
  line(x, y, x + Math.cos(ang) * r * 0.7, y + Math.sin(ang) * r * 0.7, color, 3);
  line(x, y, x + Math.cos(ang / 12 - 1) * r * 0.45, y + Math.sin(ang / 12 - 1) * r * 0.45, color, 3);
  ctx.restore();
}
function bulb(x, y, s, color, a) {
  ctx.save(); ctx.globalAlpha *= (a === undefined ? 1 : a);
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y - s * 0.15, s * 0.5, 0, Math.PI * 2); ctx.fill();
  rr(x - s * 0.24, y + s * 0.3, s * 0.48, s * 0.28, 3); ctx.fill();
  ctx.strokeStyle = C.bg0; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - s * 0.24, y + s * 0.44); ctx.lineTo(x + s * 0.24, y + s * 0.44); ctx.stroke();
  ctx.restore();
}
function docIcon(x, y, s, color, a, rows) {
  if (a !== undefined && a <= 0) return;
  ctx.save(); ctx.globalAlpha *= (a === undefined ? 1 : a); ctx.translate(x, y);
  var w = s * 0.78, h = s, f = s * 0.24;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2 - f, -h / 2); ctx.lineTo(w / 2, -h / 2 + f); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath();
  ctx.fillStyle = hexA(color, 0.2); ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.5, s * 0.06); ctx.stroke();
  var n = rows === undefined ? 3 : rows;
  for (var i = 0; i < n; i++) { rr(-w / 2 + s * 0.14, -h / 2 + s * (0.34 + i * 0.18), (w - s * 0.28) * (i === n - 1 ? 0.6 : 1), s * 0.07, s * 0.035); ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
function pen(x, y, s, color, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot === undefined ? -0.7 : rot);
  rr(-s * 0.09, -s, s * 0.18, s * 0.78, 3); ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-s * 0.09, -s * 0.22); ctx.lineTo(s * 0.09, -s * 0.22); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = '#fde2e3'; ctx.fill();
  ctx.restore();
}
function bolt(x, y, s, color, a) {
  ctx.save(); ctx.globalAlpha *= (a === undefined ? 1 : a); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(s * 0.12, -s * 0.55); ctx.lineTo(-s * 0.32, s * 0.08); ctx.lineTo(-s * 0.02, s * 0.08); ctx.lineTo(-s * 0.14, s * 0.55); ctx.lineTo(s * 0.34, -s * 0.1); ctx.lineTo(s * 0.04, -s * 0.1); ctx.closePath();
  ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
/* a robot with eyelids (sleep 0..1) */
function bot2(x, y, s, color, o) {
  o = o || {};
  var a = o.a === undefined ? 1 : o.a; if (a <= 0 || s <= 1) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.globalAlpha *= a;
  if (o.glow) glow(0, 0, s * 1.6, color, o.glow);
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.beginPath(); ctx.moveTo(0, -s * 0.5); ctx.lineTo(0, -s * 0.72); ctx.stroke();
  ctx.fillStyle = o.ant || color; ctx.beginPath(); ctx.arc(0, -s * 0.78, s * 0.1, 0, Math.PI * 2); ctx.fill();
  rr(-s * 0.55, -s * 0.5, s * 1.1, s, s * 0.28);
  ctx.fillStyle = hexA(color, 0.22); ctx.fill(); ctx.stroke();
  var sl = o.sleep || 0, lx = (o.lookX || 0) * s * 0.06, ly = (o.lookY || 0) * s * 0.06;
  if (sl < 0.95) {
    ctx.save(); ctx.beginPath(); ctx.rect(-s * 0.5, -s * 0.02 - s * 0.15 + sl * s * 0.3, s, s); ctx.clip();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-s * 0.2, -s * 0.02, s * 0.15, 0, Math.PI * 2); ctx.arc(s * 0.2, -s * 0.02, s * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.bg0;
    ctx.beginPath(); ctx.arc(-s * 0.2 + lx, -s * 0.02 + ly, s * 0.07, 0, Math.PI * 2); ctx.arc(s * 0.2 + lx, -s * 0.02 + ly, s * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (sl > 0.5) { line(-s * 0.32, s * 0.06, -s * 0.08, s * 0.06, '#fff', Math.max(2, s * 0.05)); line(s * 0.08, s * 0.06, s * 0.32, s * 0.06, '#fff', Math.max(2, s * 0.05)); }
  ctx.restore();
}
function zzz(x, y, t, a) {
  for (var i = 0; i < 3; i++) {
    var u = ((t * 0.8 + i / 3) % 1);
    text('z', x + u * 30 + i * 4, y - u * 50, { size: 20 + u * 12, a: a * Math.sin(Math.PI * u), color: C.mut, f: 'Lato', w: 900 });
  }
}
function scribble(x, y, w, p, color, th) {
  if (p <= 0) return;
  rr(x, y - (th || 8) / 2, w * p, th || 8, (th || 8) / 2); ctx.fillStyle = color; ctx.fill();
}

/* ── the travelling piece of work ─────────────────────────────────── */
var KIND = {
  idea: [C.ambL, '#3a2c0a', '#231a06'], md: [C.ind, '#232a66', '#151a40'], diff: [C.teal, '#0e3a3a', '#0a2228'],
  pr: [C.ind, '#232a66', '#151a40'], live: [C.green, '#123a26', '#0a2217']
};
function cardIcon(kind, x, y, color) {
  if (kind === 'idea') bulb(x, y, 30, color);
  else if (kind === 'md') docIcon(x, y, 32, color, 1, 3);
  else if (kind === 'diff') {
    ctx.save(); ctx.lineCap = 'round';
    line(x - 12, y - 8, x + 12, y - 8, C.green, 4); line(x, y - 20 + 0, x, y + 4 - 0, C.green, 0.01);
    line(x - 12, y - 8, x + 12, y - 8, C.green, 4); line(x, y - 20, x, y + 4, C.green, 4);
    line(x - 12, y + 14, x + 12, y + 14, C.fail, 4);
    ctx.restore();
  } else if (kind === 'pr') {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x - 8, y - 11, 5, 0, Math.PI * 2); ctx.moveTo(x - 8 + 5, y + 11); ctx.arc(x - 8, y + 11, 5, 0, Math.PI * 2); ctx.stroke();
    line(x - 8, y - 6, x - 8, y + 6, color, 3); qCurve(x - 8, y - 6, x + 10, y - 6, x + 10, y + 10, 1, color, 3);
    ctx.restore();
  } else {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x - 7, y); ctx.lineTo(x - 2, y - 13); ctx.lineTo(x + 4, y + 12); ctx.lineTo(x + 8, y); ctx.lineTo(x + 16, y); ctx.stroke();
    ctx.restore();
  }
}
function cardW(label) { return tw(label, 25, 700, MONO) + 92; }
function drawCard(x, y, s, o) {
  var a = o.a === undefined ? 1 : o.a; if (a <= 0 || s <= 0.01) return;
  var k = KIND[o.kind], op = o.open || 0;
  var w0 = cardW(o.label), w = lerp(w0, 340, op), h = lerp(66, 400, op);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s * (o.flip === undefined ? 1 : o.flip), s);
  glow(0, 0, 150 + op * 120, k[0], 0.15 + beatPulse(o.t) * 0.12);
  rr(-w / 2, -h / 2, w, h, 18);
  var g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, k[1]); g.addColorStop(1, k[2]);
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = k[0]; ctx.stroke();
  var hy = lerp(0, -h / 2 + 38, op), ix = -w / 2 + 34;
  cardIcon(o.kind, ix, hy, k[0]);
  text(o.label, ix + 28, hy + 1, { size: 25, w: 700, f: MONO, align: 'left' });
  if (op > 0.5) line(-w / 2 + 18, hy + 32, w / 2 - 18, hy + 32, hexA(k[0], 0.4 * (op - 0.5) * 2), 2);
  ctx.restore();
}
/* flip the card around its vertical axis at t0, changing the label at the midpoint */
function flipF(lt, t0) { return Math.max(0.02, Math.abs(Math.cos(Math.PI * P(lt, t0 - 0.22, t0 + 0.22)))); }
/* a small static file chip (indigo, mono) */
function fileChip(s, x, y, o) {
  o = o || {};
  return chip(s, x, y, { s: o.s, a: o.a, size: o.size || 22, f: MONO, color: o.color || C.ind, bg: hexA(o.color === C.teal ? C.tealD : C.indD, 0.35), sq: true });
}

/* ── the six-stage loop (persistent) ─────────────────────────────── */
var STG = ['Plan', 'Design', 'Build', 'Test', 'Deploy', 'Maintain'];
var FULL = { cx: 640, cy: 350, R: 190 }, MINI = { cx: 1150, cy: 112, R: 64 }, ENDR = { cx: 640, cy: 240, R: 160 };
function LINE(i) { return { x: 190 + i * 180, y: 372 }; }
function ang(i) { return -Math.PI / 2 + i * Math.PI / 3; }
function mixR(a, c, p, arc) { return { cx: lerp(a.cx, c.cx, p), cy: lerp(a.cy, c.cy, p) - Math.sin(Math.PI * p) * (arc || 0), R: lerp(a.R, c.R, p) }; }
function ringGeo(t) {
  if (t < 18.6) return FULL;
  if (t < 20.0) return mixR(FULL, MINI, E.inOut(P(t, 18.6, 20.0)), 40);
  if (t < 80.0) return MINI;
  if (t < 81.2) return mixR(MINI, FULL, E.inOut(P(t, 80.0, 81.2)), -30);
  if (t < 89.55) return FULL;
  if (t < 90.6) return mixR(FULL, MINI, E.inOut(P(t, 89.55, 90.6)), 40);
  if (t < 110.0) return MINI;
  if (t < 111.4) return mixR(MINI, ENDR, E.inOut(P(t, 110.0, 111.4)), -30);
  return ENDR;
}
function nodePos(t, i) {
  var g = ringGeo(t);
  var rp = { x: g.cx + g.R * Math.cos(ang(i)), y: g.cy + g.R * Math.sin(ang(i)) };
  if (t >= 11.4) return rp;
  var m = E.inOut(P(t, 10.0 + i * 0.08, 10.9 + i * 0.08)), lp = LINE(i);
  return { x: lerp(lp.x, rp.x, m), y: lerp(lp.y, rp.y, m) - Math.sin(Math.PI * m) * 70, m: m };
}
function ringQ(g) { return clamp((g.R - MINI.R) / (FULL.R - MINI.R)); }
/* the stage the corner indicator lights, as a float (0 = Plan ... 5 = Maintain) */
var STEPS = [30, 40, 50, 60, 70];
function puckU(t) { var u = 0; STEPS.forEach(function (s) { u += E.inOut(P(t, s - 0.45, s + 0.45)); }); return u; }
function puckA(t) { return t < 18.4 ? 0 : t < 80 ? fin(t, 19.4, 0.4) : 1 - P(t, 80.0, 80.5); }
function drawRing(t) {
  var g = ringGeo(t), q = ringQ(g), nr = 19 + 33 * q, nameA = clamp((q - 0.45) / 0.3);
  var morphed = t >= 10.9;
  var miniA = 1 - clamp(q / 0.35);
  // corner panel
  if (miniA > 0.01) {
    ctx.save(); ctx.globalAlpha = miniA;
    rr(g.cx - 90, g.cy - 90, 180, 180, 24); ctx.fillStyle = 'rgba(9,17,40,.78)'; ctx.fill();
    ctx.strokeStyle = 'rgba(94,234,212,.28)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  // the traditional line (cold open)
  if (t < 10.6) {
    var la = 1 - P(t, 10.0, 10.5);
    for (var i = 0; i < 5; i++) {
      var p0 = nodePos(t, i), p1 = nodePos(t, i + 1), d = E.out(P(t, 0.3 + i * 0.2, 0.6 + i * 0.2));
      if (d > 0) {
        ctx.save(); ctx.globalAlpha = la;
        line(p0.x + 56, p0.y, lerp(p0.x + 56, p1.x - 62, d), lerp(p0.y, p1.y, d), hexA(C.slate, 0.6), 3, [3, 9]);
        if (d > 0.95) { ctx.fillStyle = hexA(C.slate, 0.8); ctx.beginPath(); ctx.moveTo(p1.x - 58, p1.y); ctx.lineTo(p1.x - 70, p1.y - 7); ctx.lineTo(p1.x - 70, p1.y + 7); ctx.closePath(); ctx.fill(); }
        ctx.restore();
      }
    }
  }
  // the ring
  if (morphed) {
    var dp = E.inOut(P(t, 10.9, 11.7));
    var flash = t >= 15.0 && t < 16.0 ? 1 - P(t, 15.0, 16.0) : 0;
    ctx.save();
    ctx.strokeStyle = hexA(C.slate, 0.35 + 0.4 * flash); ctx.lineWidth = Math.max(2, 3 * q + 1);
    ctx.beginPath(); ctx.arc(g.cx, g.cy, g.R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * dp); ctx.stroke();
    if (dp >= 1) {
      ctx.strokeStyle = flash > 0 ? hexA(C.ambL, 0.5 + 0.5 * flash) : C.teal; ctx.lineWidth = Math.max(2.5, 4 * q + 1);
      ctx.setLineDash([10 * (0.5 + q * 0.5), 18 * (0.5 + q * 0.5)]); ctx.lineDashOffset = -t * 46 * (0.4 + q * 0.6);
      ctx.globalAlpha = P(t, 11.6, 12.1);
      ctx.beginPath(); ctx.arc(g.cx, g.cy, g.R, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    if (flash > 0) glow(g.cx, g.cy, g.R * 1.6, C.ambL, 0.25 * flash);
  }
  // centre label
  if (morphed && nameA > 0) {
    var ca = nameA * P(t, 11.2, 11.7) * (t >= 81.2 && t < 89.6 ? 0.9 : 1);
    var cs = g.R / FULL.R;
    text('AI-native', g.cx, g.cy - 15 * cs, { size: Math.round(28 * cs), w: 800, a: ca });
    text('SDLC', g.cx, g.cy + 19 * cs, { size: Math.round(28 * cs), w: 800, a: ca, color: C.teal });
  }
  // nodes
  var u = puckU(t), pa = puckA(t), lit = Math.round(u);
  for (var j = 0; j < 6; j++) {
    var p = nodePos(t, j);
    var sc = t < 10 ? pop(t, 0.2 + j * 0.2, 0.4) : 1;
    if (sc <= 0) continue;
    var isLit = (pa > 0.5 && j === lit && t < 80.5) || (j === 0 && t >= 115.0);
    var buildFast = t < 10.2 && j === 2 && t > 1.67;
    var stroke = t < 10 ? (buildFast ? C.teal : C.slate) : (p.m !== undefined ? (p.m > 0.5 ? C.teal : C.slate) : C.teal);
    var fill = isLit ? C.red : (buildFast ? '#0e3a3a' : C.navy2);
    var rN = nr * sc * (isLit ? 1.12 + beatPulse(t) * 0.08 : 1);
    if (isLit) glow(p.x, p.y, rN * 2.4, C.red, 0.45);
    if (buildFast) glow(p.x, p.y, rN * 2.2, C.teal, 0.25 + beatPulse(t) * 0.25);
    ctx.beginPath(); ctx.arc(p.x, p.y, rN, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = isLit ? 3 : 2.5; ctx.strokeStyle = isLit ? '#fff' : hexA(stroke, 0.85); ctx.stroke();
    var numSize = Math.round(19 + 5 * q);
    if (nameA < 1) text(String(j + 1), p.x, p.y + 1, { size: numSize, w: 800, a: (1 - nameA), color: '#fff' });
    if (nameA > 0) {
      text(STG[j], p.x, p.y + 2, { size: Math.round(21 * nr / 52), w: 700, a: nameA * sc, color: '#fff' });
      var bx = p.x - nr * 0.78, by = p.y - nr * 0.78;
      ctx.save(); ctx.globalAlpha = nameA * sc;
      ctx.beginPath(); ctx.arc(bx, by, 15 * nr / 52, 0, Math.PI * 2); ctx.fillStyle = isLit ? '#fff' : (t < 10.5 && !buildFast ? C.slateD : C.tealD); ctx.fill();
      ctx.restore();
      text(String(j + 1), bx, by + 1, { size: Math.round(17 * nr / 52), w: 800, a: nameA * sc, color: isLit ? C.red : '#fff' });
    }
  }
  // the moving marker on the mini loop: travels to the next stage between scenes
  if (pa > 0 && t < 80.5) {
    var a = ang(0) + u * Math.PI / 3, px = g.cx + g.R * Math.cos(a), py = g.cy + g.R * Math.sin(a);
    var moving = Math.abs(u - lit) > 0.04;
    if (moving) { glow(px, py, 34, C.red, 0.7 * pa); ctx.beginPath(); ctx.arc(px, py, 9 * pa, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); }
  }
}

/* ── background ─────────────────────────────────────────────────── */
var BOKEH = (function () { var r = rng(61), a = []; for (var i = 0; i < 30; i++) a.push({ x: r() * 1600, y: r() * 720, r: 8 + r() * 34, d: 0.05 + r() * 0.25, c: [C.teal, C.indM, C.roseL, C.ambL][i % 4], a: 0.04 + r() * 0.08, ph: r() * 6 }); return a; })();
var GRAIN = (function () {
  var g = document.createElement('canvas'); g.width = 256; g.height = 256;
  var gc = g.getContext('2d'), id = gc.createImageData(256, 256), r = rng(9);
  for (var i = 0; i < id.data.length; i += 4) { var v = 110 + r() * 145; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  gc.putImageData(id, 0, 0); return g;
})();
var grainPattern = null;
/* scene changes turn a big wheel: the old scene rolls out left, the next rolls in from the right */
var WHEELS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
var RW = 1500, DW = 0.95;
function wheelU(t) { var u = 0; WHEELS.forEach(function (w) { u += E.inOut(P(t, w - 0.45, w + 0.45)); }); return u; }
function drawBG(t) {
  var g = ctx.createRadialGradient(1090, 0, 40, 900, 120, 1250);
  g.addColorStop(0, C.navy2); g.addColorStop(0.62, C.navy); g.addColorStop(1, '#070d1f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  glow(1000 + Math.sin(t * 0.21) * 80, 120, 560, C.tealD, 0.14);
  glow(200 + Math.cos(t * 0.17) * 60, 620, 520, C.indD, 0.12);
  glow(320, 180, 420, C.roseD, 0.05);
  var cx = wheelU(t) * 1100;
  BOKEH.forEach(function (bk) {
    var x = ((bk.x - cx * bk.d + t * 6 * bk.d * 10) % 1600 + 1600) % 1600 - 160;
    var y = bk.y + Math.sin(t * 0.5 + bk.ph) * 14 + wheelU(t) * 0;
    glow(x, y, bk.r * 2.2, bk.c, bk.a);
  });
}
function drawVignette() {
  var g = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 820);
  g.addColorStop(0, 'rgba(3,7,18,0)'); g.addColorStop(1, 'rgba(3,7,18,.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (!grainPattern) grainPattern = ctx.createPattern(GRAIN, 'repeat');
  ctx.save(); ctx.globalAlpha = 0.035; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = grainPattern; ctx.fillRect(0, 0, W, H); ctx.restore();
}
/* curved motion streaks around the wheel's hub during a scene change */
function drawWheelStreaks(t) {
  WHEELS.forEach(function (w0) {
    var p = P(t, w0 - 0.45, w0 + 0.45); if (p <= 0 || p >= 1) return;
    var k = Math.sin(Math.PI * p), r = rng(w0 * 17);
    ctx.save(); ctx.globalAlpha = 0.55 * k; ctx.lineCap = 'round';
    for (var i = 0; i < 18; i++) {
      var rad = RW - 360 + r() * 640, len = 0.08 + r() * 0.22, a0 = -Math.PI / 2 + 0.55 - (p * 1.6 + r() * 1.2) % 1.4;
      ctx.strokeStyle = [C.teal, C.ind, C.ambL][i % 3]; ctx.lineWidth = 1 + r() * 2.5;
      ctx.beginPath(); ctx.arc(640, 360 + RW, rad, a0, a0 + len); ctx.stroke();
    }
    ctx.restore();
  });
}

/* ── captions ───────────────────────────────────────────────────── */
var CAPS = [
  [0.5, 4.55, 'AI made writing code *fast*.'],
  [4.7, 9.75, 'The process around the code still moves at *human speed*.'],
  [10.45, 12.95, 'So the line becomes a *loop*.'],
  [13.1, 16.1, 'Each stage leaves a *file* the next stage reads.'],
  [16.25, 19.6, 'Agents do the work. *People hold the gates*.'],
  [20.5, 24.85, 'Describe the problem in *your own words*.'],
  [25.0, 29.6, 'Claude drafts *intent.md*. The product owner approves it.'],
  [30.5, 34.85, 'Claude turns the intent into *spec.md* in one session.'],
  [35.0, 39.6, 'Skills apply your rules. Claude *flags concerns* for a person.'],
  [40.5, 44.85, 'Plan mode first. Claude reads, then writes *plan.md*.'],
  [45.0, 49.6, 'Parallel sessions build it, all reading *CLAUDE.md*.'],
  [50.5, 54.85, 'Claude *checks its own work* until the tests pass.'],
  [55.0, 59.6, 'Evals rerun when *CLAUDE.md, skills, or hooks* change.'],
  [60.5, 64.85, 'Claude reviews *every PR*. A code owner approves.'],
  [65.0, 69.6, 'Hooks hold the *production release* until a person signs off.'],
  [70.5, 74.85, 'Agents watch production against *control bands*.'],
  [75.0, 79.6, 'A breach becomes a new *intent.md* for Stage 1.'],
  [80.5, 84.85, 'Production signals feed *the next plan*.'],
  [85.0, 89.6, 'Every file is committed, so the history is your *audit trail*.'],
  [90.5, 94.85, 'Start with any play that needs *nothing first*.'],
  [95.0, 99.6, 'Each row builds on the one below, up to *closing the loop*.'],
  [100.5, 104.85, 'Run each step *by hand* first, then save it as a command.'],
  [105.0, 109.6, 'Then each approved file *triggers the next step*.']
];
function drawCaption(t) {
  for (var i = 0; i < CAPS.length; i++) {
    var c = CAPS[i]; if (t < c[0] || t > c[1]) continue;
    var pin = E.back(P(t, c[0], c[0] + 0.35)), pout = E.in(P(t, c[1] - 0.25, c[1]));
    var a = P(t, c[0], c[0] + 0.2) * (1 - pout);
    var parts = c[2].split('*');
    var size = 36;
    setFont(size, 700, 'Poppins');
    var wsum = 0; parts.forEach(function (p) { wsum += ctx.measureText(p).width; });
    if (wsum > 1130) { size = Math.floor(size * 1130 / wsum); setFont(size, 700, 'Poppins'); wsum = 0; parts.forEach(function (p) { wsum += ctx.measureText(p).width; }); }
    var y = 655 + (1 - pin) * 18 + pout * 10;
    ctx.save(); ctx.globalAlpha = a;
    var bw = wsum + 60, bh = 68;
    rr(W / 2 - bw / 2, y - bh / 2, bw, bh, 20);
    ctx.fillStyle = 'rgba(7,13,31,.84)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(94,234,212,.35)'; ctx.stroke();
    var x = W / 2 - wsum / 2;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    for (var j = 0; j < parts.length; j++) {
      ctx.fillStyle = j % 2 ? C.teal : '#ffffff';
      ctx.fillText(parts[j], x, y + 2); x += ctx.measureText(parts[j]).width;
    }
    ctx.restore();
  }
}

/* ── header (kicker + title) ─────────────────────────────────────── */
var HDR = [
  [20, 30, 'STAGE 1', 'Plan'], [30, 40, 'STAGE 2', 'Design'], [40, 50, 'STAGE 3', 'Build'],
  [50, 60, 'STAGE 4', 'Test'], [60, 70, 'STAGE 5', 'Deploy'], [70, 80, 'STAGE 6', 'Maintain'],
  [80, 90, 'THE LOOP', 'Back to Plan'], [90, 100, 'YOUR ROADMAP', 'Where to start'], [100, 110, 'YOUR ROADMAP', 'Then automate']
];
function drawHeader(t) {
  HDR.forEach(function (h) {
    var pin = E.out(P(t, h[0], h[0] + 0.45)), pout = E.in(P(t, h[1] - 0.45, h[1] - 0.05));
    var a = pin * (1 - pout); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    var dy = (1 - pin) * 26 - pout * 20;
    rr(56, 38 + dy, 6, 70, 3); ctx.fillStyle = C.red; ctx.fill();
    text(h[2], 78, 54 + dy, { size: 20, w: 700, color: C.roseL, align: 'left', ls: 2.5 });
    text(h[3], 77, 89 + dy, { size: 40, w: 800, align: 'left' });
    ctx.restore();
  });
}

/* ── S0: code got fast, the process did not (0 to 10) ─────────────── */
var CHIPT = []; (function () { for (var k = 0; k < 16; k++) CHIPT.push(1.67 + k * BEAT); })();
var TEST_DONE = [3.33, 5.0, 6.67, 8.33];   // Test lets one item through every bar
function sOpen(t) {
  var bx = LINE(2).x, by = LINE(2).y, tx = LINE(3).x, dx = LINE(4).x;
  var out = 1 - P(t, 9.0, 9.7);
  // the agent on Build
  var bp = pop(t, 1.67, 0.4) * (1 - E.in(P(t, 9.0, 9.6)));
  if (bp > 0) {
    bot2(bx, by - 120 - Math.abs(Math.sin(Math.PI * t / BEAT)) * 6, 74 * bp, C.teal, { glow: 0.3 + beatPulse(t) * 0.2, lookX: 1 });
    gear(bx + 50, by - 160, 16 * bp, t * 9, C.teal, 0.3);
  }
  // chips: fly from Build into a pile above Test; Test lets one through every bar to Deploy
  var landed = 0; CHIPT.forEach(function (tk) { if (t >= tk + 0.42) landed++; });
  var passed = 0; TEST_DONE.forEach(function (td) { if (t >= td) passed++; });
  function slotT(j) { return { x: tx + ((j % 2) - 0.5) * 66, y: by - 82 - Math.floor(j / 2) * 27 }; }
  function slotD(j) { return { x: dx, y: by - 82 - j * 27 }; }
  function codeChip(x, y, c, a, rot) {
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot || 0);
    rr(-29, -11, 58, 22, 6); ctx.fillStyle = hexA(c, 0.35); ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.stroke();
    scribble(-19, 0, 34, 1, hexA('#ffffff', 0.6), 5);
    ctx.restore();
  }
  var fall = E.in(P(t, 8.9, 9.7));
  // queue in front of Test (oldest at the bottom leaves first)
  var inQ = landed - passed;
  for (var j = 0; j < inQ; j++) {
    var s = slotT(j);
    var drop = 0; for (var q = 0; q < TEST_DONE.length; q++) if (t >= TEST_DONE[q] && t < TEST_DONE[q] + 0.3) drop = (1 - E.out(P(t, TEST_DONE[q], TEST_DONE[q] + 0.3))) * 27;
    codeChip(s.x, s.y - (j >= 2 ? drop : 0) + fall * 120, C.ambL, out, 0);
  }
  if (inQ > 3 && out > 0) {
    var n = inQ;
    text(String(n), tx + 70, slotT(n - 1).y - 6, { size: 30, w: 800, color: C.ambL, a: out * P(t, 3.0, 3.4), align: 'left' });
  }
  // in flight from Build
  CHIPT.forEach(function (tk, k) {
    if (t < tk || t >= tk + 0.42) return;
    var p = E.inOut(P(t, tk, tk + 0.42)), s = slotT(Math.min(landed - passed + 0, 30));
    var x = lerp(bx + 30, s.x, p), y = lerp(by - 70, s.y, p) - Math.sin(Math.PI * p) * 80;
    codeChip(x, y, C.teal, 1, (1 - p) * 0.6);
    if (p < 0.8) line(x - 34, y, x - 70, y + 6, hexA(C.teal, 0.4), 2);
  });
  // let through to Deploy, where it waits again
  for (var d = 0; d < TEST_DONE.length; d++) {
    var td = TEST_DONE[d]; if (t < td) continue;
    var pp = E.inOut(P(t, td, td + 0.45)), from = { x: tx, y: by - 82 }, to = slotD(d);
    codeChip(lerp(from.x, to.x, pp), lerp(from.y, to.y, pp) - Math.sin(Math.PI * pp) * 50 + fall * 120, C.ambL, out);
  }
  // human-speed clocks under the slow stages
  [0, 1, 3, 4].forEach(function (i, k) {
    var c0 = 5.0 + k * BEAT, cp = pop(t, c0, 0.4) * out;
    if (cp <= 0) return;
    var p = LINE(i);
    ctx.save(); ctx.translate(p.x, p.y + 96); ctx.scale(cp, cp);
    clockIcon(0, 0, 22, (t - c0) * 1.2 - 1.5, C.ambL);
    ctx.restore();
  });
  // AI speed under Build
  var fa = pop(t, 2.1, 0.4) * out;
  if (fa > 0) { ctx.save(); ctx.translate(bx, by + 96); ctx.scale(fa, fa); bolt(0, 0, 44, C.teal); ctx.restore(); }
}

/* ── S1: the line becomes a loop (10 to 20) ──────────────────────── */
var GATES = [0, 1, 4, 5];   // a person approves intent, spec, the release; triages findings
function sLoop(t) {
  var g = FULL;
  var fadeOut = 1 - P(t, 18.3, 18.75);
  // a glowing marker runs the loop once and leaves a file at each stage
  if (t >= 12.5 && t < 15.25) {
    var u = P(t, 12.5, 15.0), a = ang(0) + u * Math.PI * 2;
    var px = g.cx + g.R * Math.cos(a), py = g.cy + g.R * Math.sin(a);
    for (var k = 1; k < 10; k++) { var a2 = a - k * 0.05; glow(g.cx + g.R * Math.cos(a2), g.cy + g.R * Math.sin(a2), 20 - k, C.ind, 0.5 * (1 - k / 10)); }
    glow(px, py, 40, C.ind, 0.8); ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  }
  for (var i = 0; i < 6; i++) {
    var ti = 12.5 + (i + 1) * BEAT; if (i === 5) ti = 12.5 + 6 * BEAT - 0.01;
    var tt = 12.5 + i * BEAT + BEAT;
    var dp = pop(t, 12.5 + i * BEAT, 0.35) * fadeOut;
    if (dp <= 0) continue;
    var rr2 = g.R - 92, x = g.cx + rr2 * Math.cos(ang(i)), y = g.cy + rr2 * Math.sin(ang(i));
    if (i === 0) y += 6;
    docIcon(x, y, 34 * dp, C.ind, 1, 2);
    burst(g.cx + g.R * Math.cos(ang(i)), g.cy + g.R * Math.sin(ang(i)), t, 12.5 + i * BEAT, { n: 10, speed: 320, ring: 50, life: 0.5, seed: 30 + i, color: C.ind });
  }
  if (t >= 15.0) burst(g.cx, g.cy - g.R, t, 15.0, { n: 40, speed: 900, ring: 260, life: 1.1, seed: 15, color: C.ambL, c2: C.teal });
  // agents ride the loop
  var ba = fin(t, 16.25, 0.4) * fadeOut;
  if (ba > 0) for (var k2 = 0; k2 < 2; k2++) {
    var aa = ang(0) + Math.PI / 6 + k2 * Math.PI + (t - 16.25) * 0.9;
    bot2(g.cx + g.R * Math.cos(aa), g.cy + g.R * Math.sin(aa), 40 * ba, C.teal, { glow: 0.3, lookX: Math.cos(aa + Math.PI / 2) });
  }
  // people at the gates
  GATES.forEach(function (i, k) {
    var t0 = 16.25 + k * BEAT, gp = pop(t, t0, 0.4) * fadeOut;
    if (gp <= 0) return;
    var rr3 = g.R + 92, x = g.cx + rr3 * Math.cos(ang(i)), y = g.cy + rr3 * Math.sin(ang(i));
    line(lerp(g.cx + (g.R + 56) * Math.cos(ang(i)), x, 0), lerp(g.cy + (g.R + 56) * Math.sin(ang(i)), y, 0), x - 34 * Math.cos(ang(i)) * gp, y - 34 * Math.sin(ang(i)) * gp, hexA(C.rose, 0.6 * gp), 2.5, [4, 6]);
    approver(x, y, 30 * gp, 1, fin(t, t0 + 0.2, 0.3));
    burst(x, y, t, t0, { n: 10, speed: 300, ring: 46, life: 0.5, seed: 70 + k, color: C.rose });
  });
}

/* ── S2: Plan (20 to 30) ─────────────────────────────────────────── */
var ORIG = { x: 370, y: 430 }, CLB = { x: 930, y: 420 }, PAGE = { x: 650, y: 372 };
function tokS2(lt) {
  var p = kf(lt, [[0.3, HOME.x, HOME.y, 1], [1.1, ORIG.x, ORIG.y - 150, 1, 40], [4.45, ORIG.x, ORIG.y - 150, 1], [5.0, PAGE.x, PAGE.y, 1, 50], [8.95, PAGE.x, PAGE.y, 1], [9.5, HOME.x, HOME.y, 1, 40]]);
  p.open = E.inOut(P(lt, 4.95, 5.35)) * (1 - E.inOut(P(lt, 8.6, 8.95)));
  var after = lt >= 4.7;
  p.kind = after ? 'md' : 'idea'; p.label = after ? 'intent.md' : 'idea';
  p.flip = flipF(lt, 4.7);
  return p;
}
function sPlan(t) {
  var lt = t - 20;
  var ex = 1;
  // the originator and Claude
  var ap = pop(lt, -0.45, 0.4) * ex;
  approver(ORIG.x, ORIG.y, 62 * ap, ap, fin(lt, 7.5, 0.3));
  var bp = pop(lt, -0.3, 0.4) * ex;
  bot2(CLB.x, CLB.y, 124 * bp, C.teal, { glow: 0.25 + beatPulse(t) * 0.15, lookX: lt < 4.5 ? -1 : -0.5 });
  // the conversation: you describe, Claude asks
  var chatA = 1 - P(lt, 4.3, 4.7);
  if (chatA > 0) {
    ctx.save(); ctx.globalAlpha = chatA;
    for (var k = 0; k < 6; k++) {
      var tb = 1.25 + k * BEAT; if (lt < tb) continue;
      var off = 0; for (var j = k + 1; j < 6; j++) off += E.out(P(lt, 1.25 + j * BEAT, 1.25 + j * BEAT + 0.18));
      var mine = k % 2 === 0, y = 500 - off * 70, w = mine ? 200 + (k * 37) % 60 : 110;
      var bx = mine ? 480 : 820 - w, sp = pop(lt, tb, 0.3);
      ctx.save(); ctx.translate(mine ? bx : bx + w, y); ctx.scale(sp, sp); ctx.translate(-(mine ? bx : bx + w), -y);
      rr(bx, y - 29, w, 58, 22); ctx.fillStyle = mine ? hexA(C.roseD, 0.32) : hexA(C.tealD, 0.4); ctx.fill();
      ctx.strokeStyle = mine ? C.rose : C.teal; ctx.lineWidth = 2; ctx.stroke();
      if (mine) { scribble(bx + 18, y - 6, w - 36, 1, 'rgba(255,255,255,.55)', 7); scribble(bx + 18, y + 9, (w - 36) * 0.6, 1, 'rgba(255,255,255,.35)', 7); }
      else text('?', bx + w / 2, y + 2, { size: 38, w: 800, color: C.teal });
      ctx.restore();
    }
    ctx.restore();
  }
  // writing intent.md
  var op = E.inOut(P(lt, 4.95, 5.35)) * (1 - E.inOut(P(lt, 8.6, 8.95)));
  if (op > 0.95) {
    var top = PAGE.y - 200;
    ['Problem', 'Outcome', 'Constraints'].forEach(function (lbl, k) {
      var t0 = 5.42 + k * BEAT, y = top + 112 + k * 92, cp = pop(lt, t0, 0.35);
      var cw = tw(lbl, 24, 700, 'Poppins') + 31;
      if (cp > 0) chip(lbl, PAGE.x - 148 + cw / 2, y - 18, { s: cp, color: C.ind, bg: hexA(C.indD, 0.35), size: 24 });
      var w1 = 250 - k * 40;
      scribble(PAGE.x - 140, y + 22, w1, E.out(P(lt, t0 + 0.1, t0 + 0.5)), 'rgba(255,255,255,.45)', 8);
      var wp = P(lt, t0 + 0.1, t0 + 0.5);
      if (wp > 0 && wp < 1) pen(PAGE.x - 140 + w1 * E.out(wp), y + 24, 38, C.roseL, -0.6);
      burst(PAGE.x - 148 + cw / 2, y - 18, lt, t0, { n: 8, speed: 300, ring: 40, life: 0.5, seed: 200 + k, color: C.ind });
    });
    // approved
    var sp2 = pop(lt, 7.5, 0.4);
    if (sp2 > 0) {
      var sx = PAGE.x + 172, sy = top - 6;
      ctx.beginPath(); ctx.arc(sx, sy, 32 * sp2, 0, Math.PI * 2); ctx.fillStyle = C.roseD; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
      checkIcon(sx, sy, 28 * sp2, '#fff', P(lt, 7.5, 7.8));
      burst(sx, sy, lt, 7.5, { n: 22, speed: 600, ring: 90, seed: 240, color: C.rose });
      qCurve(ORIG.x + 40, ORIG.y - 40, ORIG.x + 80, sy, sx - 36, sy, E.out(P(lt, 7.2, 7.5)) * (1 - P(lt, 8.2, 8.5)), hexA(C.rose, 0.7), 3, [6, 7]);
    }
  }
}

/* ── S3: Design (30 to 40) ───────────────────────────────────────── */
var DB = { x: 690, y: 390 }, SKX = [545, 690, 835], SKN = ['Brand', 'Security', 'UX'], PO = { x: 1005, y: 505 };
function tokS3(lt) {
  var p = kf(lt, [[0.3, HOME.x, HOME.y, 1], [1.1, 470, DB.y, 0.95, 40], [3.75, 470, DB.y, 0.95], [4.2, DB.x, DB.y, 0.05], [4.6, DB.x, DB.y, 0.05], [5.05, 880, DB.y, 1], [8.85, 880, DB.y, 1], [9.5, HOME.x, HOME.y, 1, 40]]);
  var after = lt >= 4.4;
  p.kind = 'md'; p.label = after ? 'spec.md' : 'intent.md';
  if (lt > 4.15 && lt < 4.65) p.s = 0;
  return p;
}
function sDesign(t) {
  var lt = t - 30, ex = 1;
  // one working session
  var fp = E.out(P(lt, -0.45, 0.2)) * ex;
  ctx.save(); ctx.globalAlpha = fp;
  rr(360, 175, 660, 395, 28); ctx.fillStyle = 'rgba(13,148,136,.07)'; ctx.fill();
  ctx.setLineDash([12, 9]); ctx.lineDashOffset = -t * 20; ctx.strokeStyle = hexA(C.teal, 0.45); ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  var think = lt > 4.1 && lt < 4.7;
  bot2(DB.x, DB.y + (think ? Math.sin(lt * 40) * 2 : 0), 128 * pop(lt, -0.3, 0.4) * ex, C.teal, { glow: 0.25 + (think ? 0.5 : beatPulse(t) * 0.15), lookX: lt < 4.4 ? -1 : 1 });
  // skills orbit in, then lock into a row
  SKN.forEach(function (nm, k) {
    var t0 = 1.25 + k * BEAT, a0 = pop(lt, t0, 0.4) * ex;
    if (a0 <= 0) return;
    var orb = -Math.PI / 2 + k * 2.1 + (lt - t0) * 2.2, R = 170 * (1 - E.out(P(lt, t0, t0 + 0.4)) * 0.0);
    var ox = DB.x + Math.cos(orb) * 175, oy = DB.y + Math.sin(orb) * 120;
    var sp = E.inOut(P(lt, 3.0, 3.6));
    var x = lerp(ox, SKX[k], sp), y = lerp(oy, 232, sp);
    chip(nm, x, y, { s: a0, color: C.teal, bg: hexA(C.tealD, 0.4), size: 27 });
    // each skill stamps the spec
    var st = 4.17 + k * 0.21;
    if (lt > st - 0.05 && lt < st + 0.3) { var bp = P(lt, st - 0.05, st + 0.15); line(x, y + 22, lerp(x, DB.x, bp), lerp(y + 22, DB.y - 40, bp), C.ambL, 4); }
    burst(DB.x, DB.y - 40, lt, st + 0.15, { n: 8, speed: 300, ring: 40, life: 0.45, seed: 300 + k, color: C.teal });
  });
  // a flagged concern goes to the product owner, who resolves it
  var cp = pop(lt, 5.42, 0.4) * ex;
  if (cp > 0) {
    var fly = E.inOut(P(lt, 6.67, 7.2));
    var cx = lerp(880, PO.x - 150, fly), cy = lerp(DB.y - 82, PO.y, fly) - Math.sin(Math.PI * fly) * 40;
    var res = P(lt, 7.5, 7.7);
    ctx.save(); ctx.globalAlpha *= 1 - res * 0.0;
    ctx.translate(cx, cy); ctx.scale(cp, cp);
    chip('Concern', 0, 0, { color: res > 0 ? C.teal : C.ambL, bg: hexA(res > 0 ? C.tealD : C.amb, 0.35), size: 24 });
    if (res <= 0) warnIcon(-74, -24, 26, C.ambL);
    ctx.restore();
    burst(880, DB.y - 82, lt, 5.42, { n: 12, speed: 380, ring: 50, life: 0.55, seed: 330, color: C.ambL });
  }
  var pp = pop(lt, 6.25, 0.4) * ex;
  approver(PO.x, PO.y, 48 * pp, pp, fin(lt, 7.5, 0.3));
  burst(PO.x, PO.y, lt, 7.5, { n: 20, speed: 520, ring: 80, seed: 340, color: C.rose });
}

/* ── S4: Build (40 to 50) ────────────────────────────────────────── */
var BB = { x: 700, y: 340 }, FILES = [220, 300, 380, 460], LANE = [272, 387, 502], LX = 590, CMD = { x: 470, y: 192 };
function tokS4(lt) {
  var p = kf(lt, [[0.3, HOME.x, HOME.y, 1], [1.1, 455, BB.y, 0.95, 40], [4.6, 455, BB.y, 0.95], [5.05, 400, LANE[1], 0.85], [8.85, 400, LANE[1], 0.85], [9.5, HOME.x, HOME.y, 1, 40]]);
  var l = lt < 2.92 ? 'spec.md' : lt < 8.33 ? 'plan.md' : 'diff + tests';
  p.kind = lt < 8.33 ? 'md' : 'diff'; p.label = l;
  p.flip = Math.min(flipF(lt, 2.92), flipF(lt, 8.33));
  return p;
}
function sBuild(t) {
  var lt = t - 40, ex = 1;
  // part A: plan mode reads the code, writes plan.md
  var A = (1 - E.inOut(P(lt, 4.6, 5.1)));
  if (A > 0) {
    ctx.save(); ctx.globalAlpha = A;
    var sc = lt > 1.25 && lt < 2.9;
    FILES.forEach(function (fy, k) {
      var fp = pop(lt, -0.45 + k * 0.06, 0.4);
      docIcon(960, fy, 62 * fp, C.slate, 1, 3);
      var open = E.out(P(lt, 4.17, 4.4));
      if (fp > 0) lockIcon(998, fy + 12, 32 * fp, open > 0 ? C.teal : C.ambL, open);
    });
    if (sc) {
      var sy = lerp(220, 440, tri((lt - 1.25) / 0.83));
      ctx.save(); ctx.globalAlpha *= 0.22; ctx.fillStyle = C.teal;
      ctx.beginPath(); ctx.moveTo(BB.x + 40, BB.y - 6); ctx.lineTo(925, sy - 32); ctx.lineTo(925, sy + 32); ctx.closePath(); ctx.fill(); ctx.restore();
      line(925, sy, 1000, sy, C.teal, 3);
    }
    bot2(BB.x, BB.y, 116 * pop(lt, -0.3, 0.4), C.teal, { glow: 0.25 + beatPulse(t) * 0.15, lookX: lt < 2.9 ? 1 : -1, lookY: sc ? tri((lt - 1.25) / 0.83) - 0.5 : 0 });
    var mp = pop(lt, 0.55, 0.4);
    if (mp > 0) chip('plan mode', BB.x, BB.y - 112, { s: mp, color: C.teal, bg: hexA(C.tealD, 0.4), size: 27 });
    if (lt > 2.5 && lt < 3.0) { var ap = E.inOut(P(lt, 2.5, 2.9)); docIcon(lerp(BB.x - 40, 520, ap), lerp(BB.y, BB.y - 10, ap) - Math.sin(Math.PI * ap) * 60, 34, C.ind, 1 - P(ap, 0.85, 1), 3); }
    // the engineer accepts the plan
    var ep = pop(lt, 3.33, 0.4);
    approver(455, BB.y + 130, 46 * ep, ep, fin(lt, 4.17, 0.3));
    burst(455, BB.y, lt, 4.17, { n: 20, speed: 520, ring: 80, seed: 410, color: C.rose });
    ctx.restore();
  }
  // part B: parallel sessions, each in its own worktree, all reading CLAUDE.md
  var Bp = E.out(P(lt, 4.9, 5.4)) * ex;
  if (Bp > 0) {
    ctx.save(); ctx.globalAlpha = Bp;
    var cm = pop(lt, 5.0, 0.4);
    if (cm > 0) { docIcon(CMD.x + 360, CMD.y - 8, 44 * cm, C.ind, 1, 3); fileChip('CLAUDE.md', CMD.x + 480, CMD.y - 8, { s: cm, size: 26 }); }
    LANE.forEach(function (y, k) {
      var t0 = 5.0 + k * BEAT;
      // split from plan.md
      var sp = E.inOut(P(lt, t0, t0 + 0.4));
      if (sp > 0 && sp < 1) docIcon(lerp(470, LX, sp), lerp(LANE[1], y, sp) - Math.sin(Math.PI * sp) * 40, 30, C.ind, 1, 3);
      var rp = E.out(P(lt, t0 - 0.2, t0 + 0.3));
      rr(LX - 34, y - 42, 480 * rp, 84, 42); ctx.fillStyle = 'rgba(13,148,136,.12)'; ctx.fill(); ctx.strokeStyle = hexA(C.teal, 0.4); ctx.lineWidth = 2; ctx.stroke();
      var on = lt > t0 + 0.4;
      bot2(LX + 20, y, 66 * pop(lt, t0 + 0.3, 0.35), C.teal, { glow: 0.2, lookX: 1 });
      // CLAUDE.md feeds every session
      var fd = E.out(P(lt, t0 + 0.4, t0 + 0.8));
      qCurve(CMD.x + 360, CMD.y + 18, LX + 20 - 60, (CMD.y + y) / 2, LX + 20, y - 36, fd * (lt < 8.4 ? 1 : 1 - P(lt, 8.4, 8.8)), hexA(C.ind, 0.65), 2.5, [5, 7], -t * 30);
      // code grows in the lane
      for (var c = 0; c < 6; c++) {
        var ct = t0 + 0.7 + c * 0.38 + k * 0.1; var cpp = pop(lt, ct, 0.3);
        if (cpp <= 0 || !on) continue;
        var merge = E.in(P(lt, 8.0, 8.33));
        var cx2 = lerp(LX + 92 + c * 62, 400, merge), cy2 = lerp(y, LANE[1], merge);
        ctx.save(); ctx.globalAlpha *= 1 - merge * 0.9;
        rr(cx2 - 25, cy2 - 12, 50, 24, 7); ctx.fillStyle = hexA(c % 3 === 2 ? C.ambL : C.green, 0.35 * cpp); ctx.fill(); ctx.strokeStyle = c % 3 === 2 ? C.ambL : C.green; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
      }
    });
    burst(400, LANE[1], lt, 8.33, { n: 28, speed: 640, ring: 100, seed: 430, color: C.teal, c2: C.green });
    ctx.restore();
  }
}

/* ── S5: Test (50 to 60) ─────────────────────────────────────────── */
var LOOP = { x: 500, y: 395, r: 140 }, EV = { x0: 760, y0: 268, dx: 42, dy: 42, cols: 8, rows: 5 };
var BAD = 21;   // the eval that fails when the CLAUDE.md line is dropped
function tokS5(lt) {
  var p;
  if (lt < 1.25) p = kf(lt, [[0.3, HOME.x, HOME.y, 1], [1.1, LOOP.x - LOOP.r, LOOP.y, 0.75, 40], [1.25, LOOP.x - LOOP.r, LOOP.y, 0.75]]);
  else if (lt < 3.75) { var u = E.inOut(P(lt, 1.25, 2.5)) + E.inOut(P(lt, 2.5, 3.75)), a = Math.PI + u * Math.PI * 2; p = { x: LOOP.x + LOOP.r * Math.cos(a), y: LOOP.y + LOOP.r * Math.sin(a), s: 0.75 }; }
  else p = kf(lt, [[3.75, LOOP.x - LOOP.r, LOOP.y, 0.75], [4.3, LOOP.x, LOOP.y - LOOP.r - 70, 0.85, 30], [8.85, LOOP.x, LOOP.y - LOOP.r - 70, 0.85], [9.5, HOME.x, HOME.y, 1, 40]]);
  var after = lt >= 8.5;
  p.kind = after ? 'pr' : 'diff'; p.label = after ? 'PR' : 'diff + tests';
  p.flip = flipF(lt, 8.5);
  return p;
}
function sTest(t) {
  var lt = t - 50, ex = 1;
  // feedback loop: run the tests, fix, run again
  var la = E.out(P(lt, -0.45, 0.2)) * ex;
  ctx.save(); ctx.globalAlpha = la;
  ctx.beginPath(); ctx.arc(LOOP.x, LOOP.y, LOOP.r, 0, Math.PI * 2); ctx.strokeStyle = hexA(C.teal, 0.25); ctx.lineWidth = 16; ctx.stroke();
  ctx.setLineDash([8, 14]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = hexA(C.teal, 0.8); ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
  text('make test', LOOP.x, LOOP.y + 14, { size: 28, f: MONO, w: 700, color: C.teal });
  ctx.restore();
  var f1 = pop(lt, 2.5, 0.35) * (1 - P(lt, 3.3, 3.55)), f2 = pop(lt, 3.75, 0.4);
  badge(LOOP.x, LOOP.y - 40, 28, false, f1 * ex);
  badge(LOOP.x, LOOP.y - 40, 28, true, f2 * ex);
  burst(LOOP.x, LOOP.y - 40, lt, 2.5, { n: 10, speed: 320, ring: 40, life: 0.5, seed: 501, color: C.fail });
  burst(LOOP.x, LOOP.y - 40, lt, 3.75, { n: 22, speed: 560, ring: 90, seed: 502, color: C.teal, c2: C.green });
  // evals: a suite of real tasks reruns when the setup changes
  var ea = E.out(P(lt, 4.5, 5.0)) * ex;
  if (ea <= 0) return;
  ctx.save(); ctx.globalAlpha = ea;
  var gx = EV.x0 + (EV.cols - 1) * EV.dx / 2;
  chip('evals', gx, EV.y0 - 56, { color: C.ambL, bg: hexA(C.amb, 0.3), size: 27 });
  var cmY = 520, cm = pop(lt, 4.6, 0.4);
  fileChip('CLAUDE.md', gx, cmY, { s: cm, size: 27 });
  // a line is dropped, then restored
  var strike = E.out(P(lt, 5.42, 5.7)) * (1 - P(lt, 7.9, 8.2));
  if (strike > 0) { line(gx - 92, cmY + 2, gx - 92 + 184 * strike, cmY + 2, C.fail, 4); }
  if (lt > 5.2 && lt < 5.8) pen(gx + 60, cmY - 4, 40, C.roseL, -0.6);
  if (lt > 7.6 && lt < 8.25) pen(gx + 60, cmY - 4, 40, C.roseL, -0.6 + Math.sin(lt * 30) * 0.15);
  // trigger wave up from CLAUDE.md
  var wv = P(lt, 5.83, 7.0);
  if (wv > 0 && wv < 1) { ctx.save(); ctx.globalAlpha *= Math.sin(Math.PI * wv) * 0.6; ctx.strokeStyle = C.ambL; ctx.lineWidth = 3; rr(EV.x0 - 22, lerp(cmY - 30, EV.y0 - 22, wv), (EV.cols - 1) * EV.dx + 44, 4, 2); ctx.stroke(); ctx.restore(); }
  for (var r = 0; r < EV.rows; r++) for (var c = 0; c < EV.cols; c++) {
    var i = r * EV.cols + c, x = EV.x0 + c * EV.dx, y = EV.y0 + r * EV.dy;
    var on = lt > 5.83 + (EV.rows - 1 - r) * 0.22 + c * 0.02;
    var bad = i === BAD && lt > 6.67 && lt < 8.33;
    var fixed = i === BAD && lt >= 8.33;
    ctx.beginPath(); ctx.arc(x, y, bad ? 16 + beatPulse(t) * 3 : 13, 0, Math.PI * 2);
    ctx.fillStyle = bad ? C.fail : on ? C.teal : 'rgba(255,255,255,.14)'; ctx.fill();
    if (bad) crossIcon(x, y, 12, C.bg0);
    if (fixed) burst(x, y, lt, 8.33, { n: 14, speed: 380, ring: 50, life: 0.6, seed: 520, color: C.teal });
  }
  // the gate holds the config change while an eval is red
  var gp = pop(lt, 7.08, 0.3) * (1 - P(lt, 8.33, 8.6));
  if (gp > 0) {
    ctx.save(); ctx.translate(gx, cmY - 40); ctx.scale(gp, gp);
    rr(-120, -7, 240, 14, 7); ctx.fillStyle = C.ambL; ctx.fill();
    for (var s = 0; s < 6; s++) { ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.moveTo(-110 + s * 40, -7); ctx.lineTo(-96 + s * 40, -7); ctx.lineTo(-106 + s * 40, 7); ctx.lineTo(-120 + s * 40, 7); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  ctx.restore();
}

/* ── S6: Deploy (60 to 70) ───────────────────────────────────────── */
var TY = 232, BY2 = 500, TX0 = 320, TX1 = 1000;
var SCAN = [[480, 'Bugs'], [655, 'Security'], [830, 'Compliance']];
var ENV = [[910, 'dev'], [765, 'staging'], [520, 'production']], PGX = 640;
function deployPath(lt) {
  // top track left to right, U-turn, bottom track right to left
  if (lt < 1.0) return kf(lt, [[0.3, HOME.x, HOME.y, 1], [1.0, TX0, TY, 0.82, 30]]);
  if (lt < 3.75) { var k = kf(lt, [[1.0, TX0, TY, 0.82], [1.67, SCAN[0][0], TY, 0.82], [2.08, SCAN[0][0], TY, 0.82], [2.5, SCAN[1][0], TY, 0.82], [2.92, SCAN[1][0], TY, 0.82], [3.33, SCAN[2][0], TY, 0.82], [3.6, SCAN[2][0], TY, 0.82], [3.75, TX1, TY, 0.82]]); return k; }
  if (lt < 4.6) return { x: TX1, y: TY, s: 0.82 };
  if (lt < 5.1) { var u = E.inOut(P(lt, 4.6, 5.1)), a = -Math.PI / 2 + u * Math.PI; var rU = (BY2 - TY) / 2; return { x: TX1 + rU * Math.cos(a), y: (TY + BY2) / 2 + rU * Math.sin(a), s: 0.82 }; }
  return kf(lt, [[5.1, TX1, BY2, 0.82], [5.6, ENV[0][0], BY2, 0.82], [5.83, ENV[0][0], BY2, 0.82], [6.25, ENV[1][0], BY2, 0.82], [6.45, ENV[1][0], BY2, 0.82], [6.8, PGX + 85, BY2, 0.82], [7.6, PGX + 85, BY2, 0.82], [8.1, ENV[2][0], BY2, 0.82], [8.9, ENV[2][0], BY2, 0.82], [9.5, HOME.x, HOME.y, 1, 40]]);
}
function tokS6(lt) {
  var p = deployPath(lt);
  var after = lt >= 8.33;
  p.kind = after ? 'live' : 'pr'; p.label = after ? 'live' : 'PR';
  p.flip = flipF(lt, 8.33);
  return p;
}
function sDeploy(t) {
  var lt = t - 60, ex = 1;
  var ta = E.out(P(lt, -0.45, 0.2)) * ex;
  ctx.save(); ctx.globalAlpha = ta;
  // tracks
  ctx.lineCap = 'round';
  line(TX0, TY, TX1, TY, 'rgba(148,163,184,.3)', 10);
  ctx.beginPath(); ctx.arc(TX1, (TY + BY2) / 2, (BY2 - TY) / 2, -Math.PI / 2, Math.PI / 2); ctx.strokeStyle = 'rgba(148,163,184,.3)'; ctx.lineWidth = 10; ctx.stroke();
  line(TX1, BY2, 420, BY2, 'rgba(148,163,184,.3)', 10);
  // review passes
  SCAN.forEach(function (s, k) {
    var x = s[0], t0 = 1.67 + k * 0.83, active = lt > t0 - 0.1 && lt < t0 + 0.45;
    rr(x - 56, TY - 62, 112, 124, 24);
    ctx.fillStyle = active ? 'rgba(13,148,136,.22)' : 'rgba(13,148,136,.08)'; ctx.fill();
    ctx.strokeStyle = active ? C.teal : hexA(C.teal, 0.5); ctx.lineWidth = active ? 3 : 2; ctx.stroke();
    if (active) { var sy = lerp(TY - 52, TY + 52, tri((lt - t0 + 0.1) / 0.28)); line(x - 50, sy, x + 50, sy, C.teal, 3); }
    text(s[1], x, TY + 98, { size: 26, w: 700, color: lt > t0 + 0.3 ? C.teal : C.txt });
    var dn = pop(lt, t0 + 0.3, 0.3);
    if (dn > 0) { ctx.beginPath(); ctx.arc(x, TY - 84, 15 * dn, 0, Math.PI * 2); ctx.fillStyle = C.teal; ctx.fill(); checkIcon(x, TY - 84, 14 * dn, C.bg0, 1); }
  });
  // code owner approves
  var cp = pop(lt, 3.75, 0.4);
  approver(935, TY - 96, 40 * cp, cp, fin(lt, 4.17, 0.3));
  burst(935, TY - 96, lt, 4.17, { n: 18, speed: 480, ring: 70, seed: 610, color: C.rose });
  // environments
  ENV.forEach(function (e, k) {
    var x = e[0];
    rr(x - 58, BY2 + 30, 116, 12, 6); ctx.fillStyle = k === 2 ? hexA(C.rose, 0.5) : hexA(C.teal, 0.45); ctx.fill();
    text(e[1], x, BY2 + 70, { size: 26, w: 700, color: k === 2 ? C.roseL : C.txt });
  });
  // the production gate: a hook holds the release until the release manager signs off
  var lift = E.back(P(lt, 7.5, 7.85));
  var gy = BY2 - 50 - lift * 70;
  ctx.save(); ctx.translate(PGX, 0);
  line(0, BY2 - 70, 0, BY2 + 40, C.ambL, 5);
  rr(-8, gy, 16, 100, 6); ctx.fillStyle = C.ambL; ctx.fill();
  for (var s2 = 0; s2 < 4; s2++) { ctx.fillStyle = C.bg0; ctx.fillRect(-8, gy + 10 + s2 * 24, 16, 10); }
  ctx.restore();
  var held = lt > 6.8 && lt < 7.5;
  lockIcon(PGX, BY2 - 102, 38, held ? C.ambL : (lt >= 7.5 ? C.teal : C.ambL), E.out(P(lt, 7.5, 7.75)));
  if (held) glow(PGX, BY2, 90, C.ambL, 0.25 + beatPulse(t) * 0.25);
  var rp = pop(lt, 6.67, 0.4);
  approver(470, (TY + BY2) / 2 + 30, 44 * rp, rp, fin(lt, 7.5, 0.3));
  if (rp > 0) qCurve(510, (TY + BY2) / 2 + 40, 580, (TY + BY2) / 2 + 60, PGX - 22, BY2 - 102, E.out(P(lt, 7.0, 7.5)) * (1 - P(lt, 8.2, 8.6)), hexA(C.rose, 0.7), 3, [6, 7]);
  burst(PGX, BY2 - 102, lt, 7.5, { n: 22, speed: 560, ring: 90, seed: 620, color: C.rose, c2: C.ambL });
  burst(ENV[2][0], BY2, lt, 8.33, { n: 28, speed: 640, ring: 100, seed: 630, color: C.green, c2: C.teal });
  ctx.restore();
}

/* ── S7: Maintain (70 to 80) ─────────────────────────────────────── */
var CH = { x0: 330, x1: 990, y0: 215, y1: 525, mean: 470, s1: 425, s2: 380, s3: 335 };
var MB = { x: 870, y: 145 }, MC = { x: 560, y: 145 };
function reading(tau) {
  var r = rng(Math.floor(tau * 10) + 7000), n = (r() - 0.5) * 34 + Math.sin(tau * 3.1) * 8;
  var spike = tau > 3.3 && tau < 4.6 ? E.out(P(tau, 3.3, 3.45)) * (1 - E.inOut(P(tau, 4.1, 4.6))) : 0;
  return CH.mean + n - spike * 225;
}
function tokS7(lt) {
  var p = kf(lt, [[0.3, HOME.x, HOME.y, 1], [1.1, MC.x, MC.y, 0.95, 40], [5.4, MC.x, MC.y, 0.95], [5.83, MB.x - 160, MB.y + 6, 0.95], [8.85, MB.x - 160, MB.y + 6, 0.95], [9.5, HOME.x, HOME.y, 1, 40]]);
  var after = lt >= 6.25;
  p.kind = after ? 'md' : 'live'; p.label = after ? 'intent.md' : 'live';
  p.flip = flipF(lt, 6.25);
  if (lt > 3.3 && lt < 4.17) p.x += Math.sin(lt * 50) * 4;
  return p;
}
function sMaintain(t) {
  var lt = t - 70, ex = 1;
  var ca = E.out(P(lt, -0.45, 0.2)) * ex;
  ctx.save(); ctx.globalAlpha = ca;
  rr(CH.x0 - 20, CH.y0, CH.x1 - CH.x0 + 40, CH.y1 - CH.y0, 22); ctx.fillStyle = 'rgba(9,17,40,.6)'; ctx.fill(); ctx.strokeStyle = 'rgba(148,163,184,.25)'; ctx.lineWidth = 1.5; ctx.stroke();
  // control bands
  [[CH.mean, CH.s1, C.teal, '1σ'], [CH.s1, CH.s2, C.ambL, '2σ'], [CH.s2, CH.s3, C.rose, '3σ']].forEach(function (bd, k) {
    var bp = E.out(P(lt, 0.4 + k * BEAT, 0.8 + k * BEAT));
    ctx.fillStyle = hexA(bd[2], 0.1 + k * 0.03); ctx.fillRect(CH.x0, bd[1], (CH.x1 - CH.x0) * bp, bd[0] - bd[1]);
    line(CH.x0, bd[1], CH.x0 + (CH.x1 - CH.x0) * bp, bd[1], hexA(bd[2], 0.7), 2, [6, 6]);
    text(bd[3], CH.x1 + 4, bd[1] + 2, { size: 24, w: 800, f: 'Lato', color: bd[2], a: bp, align: 'left' });
  });
  line(CH.x0, CH.mean, CH.x1, CH.mean, 'rgba(255,255,255,.35)', 2);
  // the live metric scrolls in from the right
  ctx.save(); ctx.beginPath(); ctx.rect(CH.x0, CH.y0, CH.x1 - CH.x0, CH.y1 - CH.y0); ctx.clip();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath();
  var SPD = 110, first = true;
  for (var x = CH.x0; x <= CH.x1; x += 6) {
    var tau = lt - (CH.x1 - x) / SPD; var y = reading(tau);
    if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // the breach point
  var bx = CH.x1 - (lt - 3.38) * SPD;
  if (lt > 3.3 && bx > CH.x0) { var by = reading(3.45); glow(bx, by, 50, C.fail, 0.6); ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fillStyle = C.fail; ctx.fill(); }
  // the rollback point
  var rx = CH.x1 - (lt - 4.17) * SPD;
  if (lt > 4.17 && rx > CH.x0) line(rx, CH.y0 + 10, rx, CH.y1 - 10, hexA(C.ambL, 0.7), 2, [5, 6]);
  ctx.restore();
  ctx.beginPath(); ctx.arc(CH.x1, reading(lt), 6, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  burst(CH.x1, reading(3.45), lt, 3.33, { n: 20, speed: 520, ring: 90, seed: 701, color: C.fail, c2: C.ambL });
  // the monitoring agent: asleep, wakes on the breach, rolls back, writes the next intent.md
  var wake = E.out(P(lt, 3.33, 3.6));
  bot2(MB.x, MB.y, 84 * pop(lt, -0.3, 0.4), C.teal, { glow: 0.2 + wake * 0.4, sleep: 1 - wake, lookX: -1, ant: wake > 0 && lt < 4.2 ? (Math.floor(lt * 8) % 2 ? C.fail : C.ambL) : C.teal });
  if (wake < 0.5) zzz(MB.x + 40, MB.y - 40, t, 1 - wake * 2);
  var rb = pop(lt, 4.17, 0.4) * (1 - P(lt, 5.6, 5.9));
  if (rb > 0) chip('rollback', MB.x + 4, MB.y + 82, { s: rb, color: C.ambL, bg: hexA(C.amb, 0.35), size: 24 });
  if (lt > 5.83 && lt < 6.4) { var wp = P(lt, 5.83, 6.25); line(MB.x - 46, MB.y, lerp(MB.x - 46, MB.x - 60, wp), MB.y, C.teal, 3); pen(MB.x - 60, MB.y + 18, 36, C.teal, -0.6 + Math.sin(lt * 30) * 0.2); }
  burst(MB.x - 160, MB.y + 6, lt, 6.25, { n: 24, speed: 560, ring: 90, seed: 720, color: C.ind, c2: C.teal });
  ctx.restore();
}

/* ── S8: the loop closes (80 to 90) ──────────────────────────────── */
var ARTS = ['intent.md', 'spec.md', 'plan.md', 'tests', 'PR', 'metrics'];
var LAP0 = 83.333, NODE_DT = 2 * BEAT;   // one stage every two beats
function nodeXY(i, R) { var g = FULL; R = R || g.R; return { x: g.cx + R * Math.cos(ang(i)), y: g.cy + R * Math.sin(ang(i)) }; }
function tokS8(lt) {
  var t = 80 + lt, g = FULL, a;
  if (t < 81.25) { var m = nodeXY(5); return { x: lerp(HOME.x, m.x, E.inOut(P(t, 80.3, 81.25))), y: lerp(HOME.y, m.y, E.inOut(P(t, 80.3, 81.25))) - Math.sin(Math.PI * P(t, 80.3, 81.25)) * 50, s: lerp(1, 0.62, P(t, 80.3, 81.25)), kind: 'md', label: 'intent.md' }; }
  if (t < LAP0) { a = ang(5) + E.inOut(P(t, 82.0, LAP0)) * Math.PI / 3; return { x: g.cx + g.R * Math.cos(a), y: g.cy + g.R * Math.sin(a), s: 0.62, kind: 'md', label: 'intent.md' }; }
  if (t < 89.2) {
    var u = clamp((t - LAP0) / NODE_DT, 0, 6), i = Math.min(5, Math.floor(u + 0.5)) % 6;
    var seg = Math.floor(u), f = u - seg, uu = seg + E.inOut(f);
    a = ang(0) + uu * Math.PI / 3;
    var lbl = ARTS[Math.min(5, Math.floor(u + 0.5))];
    if (u >= 5.5) lbl = 'intent.md';
    var kind = lbl === 'PR' ? 'pr' : lbl === 'tests' ? 'diff' : lbl === 'metrics' ? 'live' : 'md';
    return { x: g.cx + g.R * Math.cos(a), y: g.cy + g.R * Math.sin(a), s: 0.62, kind: kind, label: lbl, flip: Math.max(0.05, Math.abs(Math.cos(Math.PI * (u + 0.5)))) * 0 + flipNear(u) };
  }
  var e = { x: g.cx, y: g.cy - g.R };
  var r = kf(t, [[89.2, e.x, e.y, 0.62], [90.0, HOME.x, HOME.y, 1, 30]]);
  r.kind = 'md'; r.label = 'intent.md';
  return r;
}
function flipNear(u) { var d = Math.abs(u - Math.round(u) - 0.5 + 0.5 * 0); var q = Math.abs(((u + 0.5) % 1) - 0.5); return q > 0.12 ? 1 : Math.max(0.05, q / 0.12); }
function sClose(t) {
  var g = FULL, lt = t - 80;
  // the closing arc: Maintain back to Plan, drawn amber
  var ap = E.inOut(P(t, 82.0, LAP0)) * (1 - P(t, 88.8, 89.4));
  if (ap > 0) {
    ctx.save(); ctx.strokeStyle = C.ambL; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.shadowColor = C.ambL; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(g.cx, g.cy, g.R, ang(5), ang(5) + ap * Math.PI / 3); ctx.stroke(); ctx.restore();
  }
  if (t >= LAP0) { var pl = nodeXY(0); burst(pl.x, pl.y, t, LAP0, { n: 44, speed: 1000, ring: 300, life: 1.2, seed: 83, color: C.ambL, c2: C.teal }); }
  // each stage leaves its file
  var out = 1 - P(t, 88.9, 89.4);
  for (var i = 0; i < 6; i++) {
    var ti = LAP0 + i * NODE_DT, cp = pop(t, ti, 0.35) * out;
    if (cp <= 0) continue;
    var n = nodeXY(i), right = i <= 2 || i === 3, w = tw(ARTS[i], 22, 700, MONO) + 30;
    var x = right ? n.x + 62 + w / 2 : n.x - 62 - w / 2, y = n.y;
    if (i === 0) { x = n.x + 62 + w / 2; y = n.y; }
    if (i === 3) { x = n.x + 62 + w / 2; }
    fileChip(ARTS[i], x, y, { s: cp, size: 22, color: i === 3 ? C.teal : C.ind });
    burst(n.x, n.y, t, ti, { n: 10, speed: 340, ring: 56, life: 0.5, seed: 800 + i, color: C.ind });
  }
}

/* ── S9: where to start (90 to 100) ─────────────────────────────── */
var BW = 120, BH = 68;
var ROWS = [
  { y: 518, xs: [300, 436, 572, 708, 844, 980], st: [1, 3, 3, 3, 4, 5] },
  { y: 432, xs: [572, 844], st: [3, 4] },
  { y: 346, xs: [436, 708], st: [2, 5] },
  { y: 260, xs: [640], st: [5] },
  { y: 174, xs: [640], st: [6] }
];
/* course dependency graph: [row, idx] needs [row, idx] */
var DEPS = [[[1, 0], [0, 2]], [[1, 1], [0, 2]], [[1, 1], [0, 4]], [[2, 0], [0, 0]], [[2, 0], [0, 3]], [[2, 1], [1, 1]], [[2, 1], [1, 0]], [[3, 0], [2, 1]], [[3, 0], [0, 5]], [[4, 0], [3, 0]], [[4, 0], [0, 0]]];
function blockT(r, k) {
  if (r === 0) return 0.83 + k * BEAT;
  return [0, 5.0, 5.83, 6.67, 7.5][r] + k * BEAT;
}
function blockPos(r, k, lt) {
  var R = ROWS[r], t0 = blockT(r, k), p = E.back(P(lt, t0, t0 + 0.4));
  return { x: R.xs[k], y: R.y - (1 - p) * 120, a: P(lt, t0, t0 + 0.15), t0: t0 };
}
function tokS9(lt) {
  var hops = [[0.3, HOME.x, HOME.y, 1], [1.1, ROWS[0].xs[0], ROWS[0].y - 66, 0.56, 40], [5.3, ROWS[0].xs[0], ROWS[0].y - 66, 0.56], [5.9, ROWS[1].xs[0], ROWS[1].y - 66, 0.56, 50],
    [6.15, ROWS[1].xs[0], ROWS[1].y - 66, 0.56], [6.6, ROWS[2].xs[0], ROWS[2].y - 66, 0.56, 50], [7.0, ROWS[2].xs[0], ROWS[2].y - 66, 0.56], [7.45, ROWS[3].xs[0], ROWS[3].y - 66, 0.56, 50],
    [7.85, ROWS[3].xs[0], ROWS[3].y - 66, 0.56], [8.3, ROWS[4].xs[0] + 150, ROWS[4].y, 0.56, 40], [8.85, ROWS[4].xs[0] + 150, ROWS[4].y, 0.56], [9.5, HOME.x, HOME.y, 1, 40]];
  var p = kf(lt, hops); p.kind = 'md'; p.label = 'intent.md';
  return p;
}
function sStart(t) {
  var lt = t - 90, ex = 1;
  ctx.save(); ctx.globalAlpha = ex;
  // dependency lines
  DEPS.forEach(function (d, k) {
    var a = blockPos(d[0][0], d[0][1], lt), c = blockPos(d[1][0], d[1][1], lt);
    var lp = E.out(P(lt, a.t0 + 0.3, a.t0 + 0.8));
    if (lp <= 0) return;
    qCurve(c.x, c.y - BH / 2, c.x, (c.y + a.y) / 2, a.x, a.y + BH / 2, lp, hexA(C.teal, 0.45), 2.5);
  });
  var gh = E.out(P(lt, -0.45, 0.2));
  ROWS.forEach(function (R, r) {
    R.xs.forEach(function (x, k) {
      var b0 = blockPos(r, k, lt);
      ctx.save(); ctx.globalAlpha *= gh * (1 - b0.a); ctx.setLineDash([7, 7]); rr(x - BW / 2, R.y - BH / 2, BW, BH, 14); ctx.strokeStyle = hexA(C.slate, 0.45); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      if (b0.a <= 0) return;
      var top = r === 4, start = r === 0;
      ctx.save(); ctx.globalAlpha *= b0.a;
      if (start && lt > 3.33) glow(b0.x, b0.y, 80, C.teal, 0.18 + beatPulse(t) * 0.12);
      if (top) glow(b0.x, b0.y, 120, C.ambL, 0.3 + beatPulse(t) * 0.15);
      rr(b0.x - BW / 2, b0.y - BH / 2, BW, BH, 14);
      ctx.fillStyle = top ? 'rgba(217,119,6,.3)' : start ? 'rgba(13,148,136,.3)' : 'rgba(22,36,74,.95)'; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = top ? C.ambL : start ? C.teal : hexA(C.slate, 0.7); ctx.stroke();
      text(String(R.st[k]), b0.x, b0.y + 2, { size: 30, w: 800, color: top ? C.ambL : start ? C.teal : C.txt });
      ctx.restore();
      if (b0.a > 0) burst(b0.x, b0.y + BH / 2, lt, b0.t0 + 0.4, { n: 8, speed: 260, ring: 36, life: 0.4, seed: 900 + r * 10 + k, color: top ? C.ambL : C.teal });
    });
  });
  var sa = pop(lt, 3.33, 0.4);
  if (sa > 0) {
    ctx.save(); ctx.globalAlpha *= sa;
    line(240, ROWS[0].y + 52, 1040, ROWS[0].y + 52, hexA(C.teal, 0.6), 2.5);
    line(240, ROWS[0].y + 42, 240, ROWS[0].y + 52, hexA(C.teal, 0.6), 2.5); line(1040, ROWS[0].y + 42, 1040, ROWS[0].y + 52, hexA(C.teal, 0.6), 2.5);
    ctx.restore();
    chip('Start anywhere', 640, ROWS[0].y + 56, { s: sa, color: C.teal, bg: 'rgba(9,17,40,.95)', size: 26 });
  }
  var ta = pop(lt, 7.92, 0.4);
  if (ta > 0) chip('Closing the loop', 640 - 245, ROWS[4].y, { s: ta, color: C.ambL, bg: hexA(C.amb, 0.3), size: 27 });
  burst(640, ROWS[4].y, lt, 7.9, { n: 30, speed: 700, ring: 120, seed: 950, color: C.ambL, c2: C.teal });
  ctx.restore();
}

/* ── S10: then automate (100 to 110) ─────────────────────────────── */
var ST = [[390, 'By hand'], [640, 'Command'], [890, 'On merge']], SY = 262;
var CHAIN = [['intent.md', 390], ['spec.md', 640], ['plan.md', 890]], CY = 492;
function tokS10(lt) {
  var p = kf(lt, [[0.3, HOME.x, HOME.y, 1], [1.0, ST[0][0], SY - 108, 0.72, 30], [2.2, ST[0][0], SY - 108, 0.72], [2.6, ST[1][0], SY - 108, 0.72, 30], [3.5, ST[1][0], SY - 108, 0.72], [3.8, ST[2][0], SY - 108, 0.72, 30], [4.6, ST[2][0], SY - 108, 0.72], [5.0, CHAIN[0][1], CY, 0.92, 50], [8.85, CHAIN[0][1], CY, 0.92], [9.5, HOME.x, HOME.y, 1, 40]]);
  p.kind = 'md'; p.label = 'intent.md';
  return p;
}
function sAuto(t) {
  var lt = t - 100, ex = 1;
  ctx.save(); ctx.globalAlpha = ex;
  // three ways to run a step, faster each time
  var tr = E.out(P(lt, -0.45, 0.3));
  line(ST[0][0] - 90, SY, ST[0][0] - 90 + (ST[2][0] - ST[0][0] + 180) * tr, SY, 'rgba(148,163,184,.3)', 8);
  ST.forEach(function (s, k) {
    var x = s[0], sp = pop(lt, -0.35 + k * 0.12, 0.4), act = [1.25, 2.92, 4.17][k];
    var on = lt > act;
    ctx.save(); ctx.translate(x, SY); ctx.scale(sp, sp);
    rr(-72, -52, 144, 104, 24); ctx.fillStyle = on ? 'rgba(13,148,136,.3)' : 'rgba(22,36,74,.95)'; ctx.fill();
    ctx.strokeStyle = on ? C.teal : hexA(C.slate, 0.7); ctx.lineWidth = 2.5; ctx.stroke();
    if (k === 0) { avatar(-18, 0, 32, C.rose); text('>_', 32, 2, { size: 28, f: MONO, color: C.teal }); }
    if (k === 1) text('/', 0, 2, { size: 60, f: MONO, w: 700, color: C.teal });
    if (k === 2) bolt(0, 0, 66, C.ambL);
    ctx.restore();
    text(s[1], x, SY + 86, { size: 27, w: 700, a: sp, color: on ? C.teal : C.txt });
    burst(x, SY, lt, act, { n: 14, speed: 420, ring: 64, life: 0.55, seed: 1000 + k, color: k === 2 ? C.ambL : C.teal });
    if (k === 0 && lt > 1.25 && lt < 2.2) for (var d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(x - 18 + d * 18, SY - 74 - Math.abs(Math.sin(lt * 14 + d)) * 6, 5, 0, Math.PI * 2); ctx.fillStyle = C.roseL; ctx.fill(); }
  });
  // each approved file fires the next step
  CHAIN.forEach(function (c, k) {
    var t0 = [5.0, 6.25, 7.5][k], cp = pop(lt, t0, 0.4);
    var gw = tw(c[0], 27, 700, MONO) + 35;
    ctx.save(); ctx.globalAlpha *= tr * (1 - P(lt, t0, t0 + 0.2)); ctx.setLineDash([7, 7]); rr(c[1] - gw / 2, CY - 24, gw, 48, 10); ctx.strokeStyle = hexA(C.ind, 0.45); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    if (k > 0 && cp > 0) fileChip(c[0], c[1], CY, { s: cp, size: 27 });
    var ok = 5.83 + k * 1.25;
    if (k < 2) {
      var ax = c[1], ok0 = pop(lt, ok, 0.35);
      if (ok0 > 0) approver(ax, CY - 74, 28 * ok0, ok0, 1);
      var fp = E.inOut(P(lt, ok + 0.1, ok + 0.42));
      if (fp > 0 && fp < 1) { var bx = lerp(c[1] + 100, CHAIN[k + 1][1] - 90, fp); bolt(bx, CY, 46, C.ambL); glow(bx, CY, 50, C.ambL, 0.5); }
      if (lt > ok + 0.42) line(c[1] + 100, CY, CHAIN[k + 1][1] - 92, CY, hexA(C.ambL, 0.6), 3, [6, 8]);
    }
  });
  var more = E.out(P(lt, 8.1, 8.5));
  if (more > 0) { line(CHAIN[2][1] + 90, CY, CHAIN[2][1] + 90 + 90 * more, CY, hexA(C.ambL, 0.6), 3, [6, 8]); bolt(CHAIN[2][1] + 90 + 104 * more, CY, 40, C.ambL, more); }
  ctx.restore();
}

/* ── end card (110 to 120) ──────────────────────────────────────── */
function tokEnd(lt) {
  var g = ENDR, t = 110 + lt;
  var top = { x: g.cx, y: g.cy - g.R };
  if (t < 111.6) { var r = kf(t, [[110.0, HOME.x, HOME.y, 1], [111.6, top.x, top.y, 0.5, 60]]); r.kind = 'md'; r.label = 'intent.md'; return r; }
  var u = clamp((t - 111.6) / (115.0 - 111.6)), a = ang(0) + E.inOut(u) * Math.PI * 2;
  return { x: g.cx + g.R * Math.cos(a), y: g.cy + g.R * Math.sin(a), s: 0.5 * (1 - E.in(P(t, 114.8, 115.05))), kind: 'md', label: 'intent.md' };
}
function sEnd(t) {
  var lt = t - 110;
  var a1 = fin(lt, 1.9, 0.5), a2 = fin(lt, 2.5, 0.5), a3 = fin(lt, 3.1, 0.5);
  text('The AI-native SDLC playbook', 640, 486 + (1 - a1) * 24, { size: 52, w: 800, a: a1 });
  ctx.save(); ctx.globalAlpha = a2;
  var s = 'Start with Stage 1: Plan';
  setFont(28, 700, 'Poppins'); var w = ctx.measureText(s).width + 64;
  rr(640 - w / 2, 532 + (1 - a2) * 20, w, 58, 29); ctx.fillStyle = 'rgba(202,47,53,.9)'; ctx.fill();
  text(s, 640, 562 + (1 - a2) * 20, { size: 28, w: 700, color: '#fff' });
  ctx.restore();
  text('Bitovi  ·  SDLC Playbook  ·  Based on the Claude Academy course', 640, 650, { size: 22, w: 700, f: 'Lato', color: C.mut, a: a3 });
  if (t >= 115 && t < 116.4) { var m = { x: ENDR.cx, y: ENDR.cy - ENDR.R }; burst(m.x, m.y, t, 115, { n: 46, speed: 1200, ring: 380, life: 1.3, seed: 115, color: C.teal, c2: C.ambL }); }
  if (t >= 115) glow(640, 240, 420, C.tealD, 0.3 * (1 - P(t, 115, 118)));
  // after the work lands in Plan, a marker keeps running the loop
  if (t > 115.2) {
    var g = ENDR, a = ang(0) + (t - 115.2) * 1.3, k = fin(t, 115.2, 0.5);
    for (var i = 1; i < 10; i++) { var a2 = a - i * 0.05; glow(g.cx + g.R * Math.cos(a2), g.cy + g.R * Math.sin(a2), 18 - i, C.teal, 0.5 * k * (1 - i / 10)); }
    glow(g.cx + g.R * Math.cos(a), g.cy + g.R * Math.sin(a), 30, C.teal, 0.8 * k);
    ctx.beginPath(); ctx.arc(g.cx + g.R * Math.cos(a), g.cy + g.R * Math.sin(a), 8 * k, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  }
}

/* ── scene table and token routing ───────────────────────────────── */
var SCENES = [
  { a: 0, b: 10.4, draw: sOpen },
  { a: 10, b: 19.0, draw: sLoop },
  { a: 20, b: 30, draw: sPlan, tok: tokS2, win: 1, wout: 1 },
  { a: 30, b: 40, draw: sDesign, tok: tokS3, win: 1, wout: 1 },
  { a: 40, b: 50, draw: sBuild, tok: tokS4, win: 1, wout: 1 },
  { a: 50, b: 60, draw: sTest, tok: tokS5, win: 1, wout: 1 },
  { a: 60, b: 70, draw: sDeploy, tok: tokS6, win: 1, wout: 1 },
  { a: 70, b: 80, draw: sMaintain, tok: tokS7, win: 1, wout: 1 },
  { a: 80, b: 90, draw: sClose, tok: tokS8 },
  { a: 90, b: 100, draw: sStart, tok: tokS9, win: 1, wout: 1 },
  { a: 100, b: 110, draw: sAuto, tok: tokS10, win: 1, wout: 1 },
  { a: 110, b: 120.01, draw: sEnd, tok: tokEnd }
];
function tokS1(t) {
  var pl = nodeXY(0);
  if (t < 18.6) return { x: pl.x, y: pl.y - 2, s: 0.62 * pop(t, 18.0, 0.4), kind: 'idea', label: 'idea' };
  var r = kf(t, [[18.6, pl.x, pl.y - 2, 0.62], [19.7, HOME.x, HOME.y, 1, 60]]); r.kind = 'idea'; r.label = 'idea';
  return r;
}
function tokenState(t) {
  if (t < 18.0) return null;
  if (t < 20) return tokS1(t);
  for (var i = 0; i < SCENES.length; i++) {
    var s = SCENES[i];
    if (t >= s.a && t < s.b && s.tok) return s.tok(t - s.a);
  }
  return null;
}
function drawToken(t) {
  var st = tokenState(t); if (!st || !(st.s > 0.01)) return;
  var bob = st.open ? 0 : Math.sin(t * 2.4) * 3;
  drawCard(st.x, st.y + bob, st.s, { label: st.label, kind: st.kind, open: st.open || 0, flip: st.flip, t: t });
}

function seek(t) {
  t = clamp(t, 0, DUR);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  drawBG(t);
  var shake = t > 15.0 && t < 15.3 ? Math.sin((t - 15.0) * 90) * 5 * (1 - (t - 15.0) / 0.3) : 0;
  ctx.save(); ctx.translate(0, shake);
  drawWheelStreaks(t);
  var planScene = null;
  SCENES.forEach(function (s) {
    var lo = s.a - (s.win ? 0.45 : 0), hi = s.b + (s.wout ? 0.45 : 0);
    if (t < lo || t > hi) return;
    var th = 0;
    if (s.win) th += DW * (1 - E.inOut(P(t, s.a - 0.45, s.a + 0.45)));
    if (s.wout) th -= DW * E.inOut(P(t, s.b - 0.45, s.b + 0.45));
    ctx.save();
    if (th) { ctx.translate(640, 360 + RW); ctx.rotate(th); ctx.translate(-640, -(360 + RW)); }
    if (s.draw === sPlan) planScene = th; else s.draw(t);
    ctx.restore();
  });
  drawRing(t);
  // the Plan scene draws its page over the card, so the card goes first there
  if (planScene !== null) {
    ctx.save(); if (planScene) { ctx.translate(640, 360 + RW); ctx.rotate(planScene); ctx.translate(-640, -(360 + RW)); }
    var lt = t - 20, under = lt < 4.9 || lt > 8.95;
    if (under) { sPlan(t); ctx.restore(); drawToken(t); }
    else { ctx.restore(); drawToken(t); ctx.save(); sPlan(t); ctx.restore(); }
  } else drawToken(t);
  ctx.restore();
  drawHeader(t);
  drawCaption(t);
  drawVignette();
}
window.seek = seek;
window.DUR = DUR;
