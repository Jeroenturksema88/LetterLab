#!/usr/bin/env bash
# scripts/maak-pwa-icons.sh
# Genereert PNG-iconen voor PWA, Apple Touch en favicon vanuit het master SVG-bestand.
# Vereist: rsvg-convert (brew install librsvg)
#
# Gebruik: bash scripts/maak-pwa-icons.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "FOUT: rsvg-convert ontbreekt. Installeer met: brew install librsvg" >&2
  exit 1
fi

ICON_SVG="public/icons/icon.svg"
MASKABLE_SVG="public/icons/icon-maskable.svg"
OUT_DIR="public/icons"

mkdir -p "$OUT_DIR"

# Standaard PWA-iconen (transparante hoeken via afgeronde rand in SVG)
rsvg-convert -w 192  -h 192  "$ICON_SVG" -o "$OUT_DIR/icon-192.png"
rsvg-convert -w 512  -h 512  "$ICON_SVG" -o "$OUT_DIR/icon-512.png"

# Maskable iconen (volledig gevuld, voor adaptieve Android-iconen)
rsvg-convert -w 192  -h 192  "$MASKABLE_SVG" -o "$OUT_DIR/icon-maskable-192.png"
rsvg-convert -w 512  -h 512  "$MASKABLE_SVG" -o "$OUT_DIR/icon-maskable-512.png"

# Apple Touch Icon (180x180, geen transparantie nodig — iOS rondt zelf af)
rsvg-convert -w 180  -h 180  "$MASKABLE_SVG" -o "$OUT_DIR/apple-touch-icon.png"

# Favicons
rsvg-convert -w 32   -h 32   "$ICON_SVG" -o "$OUT_DIR/favicon-32.png"
rsvg-convert -w 16   -h 16   "$ICON_SVG" -o "$OUT_DIR/favicon-16.png"

echo "Klaar:"
ls -lh "$OUT_DIR"/*.png
