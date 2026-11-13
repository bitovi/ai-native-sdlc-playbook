#!/usr/bin/env bash
# Re-render the AI-native SDLC playbook overview video from source.
#   bash video/sdlc-overview/make.sh
# Writes build/ (git-ignored) and the two published files in site/.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
OUT_DIR="$REPO/site"
cd "$HERE"

echo "1/4 music"
python3 music.py

echo "2/4 frames"
rm -rf build/frames
WORKERS="${WORKERS:-4}" node render.js

echo "3/4 encode"
ffmpeg -loglevel error -y -framerate 30 -i build/frames/f%05d.png -i build/music.wav \
  -c:v libx264 -profile:v high -preset slow -crf "${CRF:-21}" -pix_fmt yuv420p -tune animation \
  -c:a aac -b:a 160k -movflags +faststart -shortest \
  "$OUT_DIR/sdlc-overview.mp4"

echo "4/4 poster (the assembled loop on the end card)"
ffmpeg -loglevel error -y -i build/frames/f03510.png -q:v 3 "$OUT_DIR/sdlc-overview-poster.jpg"

ls -lh "$OUT_DIR/sdlc-overview.mp4" "$OUT_DIR/sdlc-overview-poster.jpg"
