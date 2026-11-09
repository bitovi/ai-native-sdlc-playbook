#!/usr/bin/env bash
# scripts/build.sh - Build the AI-native SDLC playbook into public/.
# No dependencies beyond bash, cp, and find.
#
# Copies site/ to public/ and, in .html/.css/.js files, replaces:
#   {{BP}}                -> base path (BASE_PATH env, e.g. /ai-native-sdlc-playbook; empty for root)
#   <!-- @site-header --> -> site/_partials/header.html
#   <!-- @site-footer --> -> site/_partials/footer.html
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/site"
PUBLIC="$REPO_ROOT/public"
BP="${BASE_PATH:-}"

read_file() { local c; c="$(cat "$1"; printf x)"; printf '%s' "${c%x}"; }
HEADER="$(read_file "$SRC/_partials/header.html")"
FOOTER="$(read_file "$SRC/_partials/footer.html")"

rm -rf "$PUBLIC"
cp -R "$SRC" "$PUBLIC"
rm -rf "$PUBLIC/_partials"
touch "$PUBLIC/.nojekyll"

while IFS= read -r f; do
  content="$(read_file "$f")"
  content="${content//"<!-- @site-header -->"/"$HEADER"}"
  content="${content//"<!-- @site-footer -->"/"$FOOTER"}"
  content="${content//"{{BP}}"/"$BP"}"
  printf '%s' "$content" > "$f"
done < <(find "$PUBLIC" -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \))

echo "Built $(find "$PUBLIC" -name '*.html' | wc -l | tr -d ' ') page(s) into public/ (base path: '${BP}')"
