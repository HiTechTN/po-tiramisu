#!/usr/bin/env bash
# build-ios-icons.sh — Convert SVG source files to PNGs for iOS Assets.xcassets
# Usage: bash scripts/build-ios-icons.sh
# Requires: ImageMagick (convert command)
# Note: SVGs use Georgia font — install it if output looks wrong

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DESIGN_DIR="$PROJECT_DIR/ios/design"
ICON_DIR="$PROJECT_DIR/ios/App/App/Assets.xcassets/AppIcon.appiconset"
SPLASH_DIR="$PROJECT_DIR/ios/App/App/Assets.xcassets/Splash.imageset"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
check() { [[ -s "$1" ]] || error "Failed to generate $1"; }

# Check ImageMagick
command -v convert &>/dev/null || error "ImageMagick not found. Install with: brew install imagemagick (macOS) or apt install imagemagick (Linux)"

# Check source files exist
[[ -f "$DESIGN_DIR/AppIcon-1024.svg" ]] || error "Missing $DESIGN_DIR/AppIcon-1024.svg"
[[ -f "$DESIGN_DIR/splash.svg" ]]      || error "Missing $DESIGN_DIR/splash.svg"

info "Converting SVG sources to iOS PNGs..."

# --- App Icon ---
info "Generating AppIcon-1024.png (1024×1024)..."
convert "$DESIGN_DIR/AppIcon-1024.svg" \
  -background none \
  -resize 1024x1024 \
  "$ICON_DIR/AppIcon-1024.png"
check "$ICON_DIR/AppIcon-1024.png"

# --- Splash Screens ---
# 1x = 2732×2732 (iPhone 6.7" @1x)
info "Generating splash-1x.png (2732×2732)..."
convert "$DESIGN_DIR/splash.svg" \
  -background none \
  -resize 2732x2732 \
  "$SPLASH_DIR/splash-1x.png"
check "$SPLASH_DIR/splash-1x.png"

# 2x = 5464×5464 (iPhone 6.7" @2x) — use magick if available for memory limits
info "Generating splash-2x.png (5464×5464)..."
if command -v magick &>/dev/null; then
  magick "$DESIGN_DIR/splash.svg" \
    -background none \
    -resize 5464x5464 \
    "$SPLASH_DIR/splash-2x.png"
else
  convert "$DESIGN_DIR/splash.svg" \
    -background none \
    -resize 5464x5464 \
    "$SPLASH_DIR/splash-2x.png"
fi
check "$SPLASH_DIR/splash-2x.png"

# 3x = 4096×4096 (ImageMagick 6 memory-safe cap)
info "Generating splash-3x.png (4096×4096)..."
convert "$DESIGN_DIR/splash.svg" \
  -background none \
  -resize 4096x4096 \
  "$SPLASH_DIR/splash-3x.png"
check "$SPLASH_DIR/splash-3x.png"

# --- Summary ---
info "Done! Generated files:"
echo ""
echo "  $ICON_DIR/AppIcon-1024.png"
echo "  $SPLASH_DIR/splash-1x.png"
echo "  $SPLASH_DIR/splash-2x.png"
echo "  $SPLASH_DIR/splash-3x.png"
echo ""
info "SVG sources: $DESIGN_DIR/"
info "Edit the SVGs and re-run this script to regenerate PNGs."
