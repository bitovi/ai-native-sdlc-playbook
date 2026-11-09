#!/usr/bin/env bash
# scripts/check-site.sh - Gate for the playbook site.
#
# Builds with the GitHub Pages base path, then checks every page for missing
# titles, leftover template tokens, broken internal links, and banned
# characters. Optionally loads every page in Chromium (desktop + phone).
#
# Usage:
#   bash scripts/check-site.sh             # build + static checks
#   bash scripts/check-site.sh --browser   # also the browser smoke test
#   SHOTS=/tmp/shots bash scripts/check-site.sh --browser   # plus screenshots
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC="$REPO_ROOT/public"
BASE="/ai-native-sdlc-playbook"
BROWSER=0
[ "${1:-}" = "--browser" ] && BROWSER=1

fail=0
err() { echo "  FAIL: $*"; fail=$((fail+1)); }

echo "[1/5] Build with BASE_PATH=$BASE"
BASE_PATH="$BASE" bash "$REPO_ROOT/scripts/build.sh" > /dev/null || { echo "GATE: FAIL (build)"; exit 1; }

pages=()
while IFS= read -r f; do pages+=("$f"); done < <(find "$PUBLIC" -name '*.html' | sort)
echo "      ${#pages[@]} page(s)"

echo "[2/5] Titles, viewport, leftover tokens"
for f in "${pages[@]}"; do
  rel="${f#$PUBLIC/}"
  grep -qi '<title>[^<]\+</title>' "$f" || err "$rel has no <title>"
  grep -qi 'name="viewport"' "$f" || err "$rel has no viewport meta"
  if grep -q '{{[A-Z_]*}}\|<!-- @site-' "$f"; then err "$rel has an unreplaced template marker"; fi
done

echo "[3/5] Internal links and assets resolve"
for f in "${pages[@]}"; do
  rel="${f#$PUBLIC/}"
  dir="$(dirname "$f")"
  while IFS= read -r url; do
    [ -z "$url" ] && continue
    case "$url" in
      http://*|https://*|//*|\#*|mailto:*|javascript:*|data:*|tel:*) continue ;;
      *\'*|*+*|*'${'*) continue ;;  # built in JS strings, not a real link
    esac
    path="${url%%#*}"; path="${path%%\?*}"
    [ -z "$path" ] && continue
    if [[ "$path" == /* ]]; then
      if [[ "$path" != "$BASE"/* && "$path" != "$BASE" ]]; then
        err "$rel links to '$url' without the base path (use {{BP}})"; continue
      fi
      target="$PUBLIC${path#$BASE}"
    else
      target="$dir/$path"
    fi
    if [ -d "$target" ]; then target="$target/index.html"; fi
    [ -e "$target" ] || err "$rel -> '$url' not found"
  done < <(grep -oE '(href|src)="[^"]*"' "$f" | sed -E 's/^(href|src)="//; s/"$//' | sort -u)
done

echo "[4/5] Banned characters in source (em dash)"
hits="$(grep -rnI -e $'\xe2\x80\x94' -e '&mdash;' "$REPO_ROOT/site" || true)"
if [ -n "$hits" ]; then echo "$hits" | head -20; err "em dashes found in site/ (house style: no em dashes)"; fi

echo "[5/5] Browser smoke test"
if [ "$BROWSER" = 1 ]; then
  node "$REPO_ROOT/scripts/browser-check.js" "$PUBLIC" "$BASE" "${pages[@]}" || err "browser check failed"
else
  echo "      skipped (pass --browser to run)"
fi

if [ "$fail" -gt 0 ]; then echo "GATE: FAIL ($fail problem(s), ${#pages[@]} pages checked)"; exit 1; fi
echo "GATE: PASS (${#pages[@]} pages checked, browser=$BROWSER)"
