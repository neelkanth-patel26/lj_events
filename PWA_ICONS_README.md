# PWA Icon Generation

## Quick Setup

The app uses `/public/icon.svg` as the base icon. To generate all required PNG sizes:

### Option 1: Use an online tool
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `/public/icon.svg`
3. Download the generated icons
4. Place them in `/public/` directory with these names:
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
   - `icon-192-maskable.png` (192x192 with padding)
   - `icon-512-maskable.png` (512x512 with padding)

### Option 2: Use ImageMagick (if installed)
```bash
# Install ImageMagick first, then run:
magick convert public/icon.svg -resize 192x192 public/icon-192.png
magick convert public/icon.svg -resize 512x512 public/icon-512.png
magick convert public/icon.svg -resize 192x192 -background none -gravity center -extent 240x240 public/icon-192-maskable.png
magick convert public/icon.svg -resize 512x512 -background none -gravity center -extent 640x640 public/icon-512-maskable.png
```

### Option 3: Temporary Placeholder
For development, you can use the SVG icon directly. Modern browsers support it.

## Screenshots
For the manifest screenshots, take screenshots of:
- Mobile view (540x720): `/screenshot-mobile.png`
- Desktop view (1280x720): `/screenshot-desktop.png`

Or remove the screenshots section from `manifest.json` if not needed immediately.
