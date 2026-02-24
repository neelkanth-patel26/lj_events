# Custom Title Bar - PWA Limitations

## Current Implementation

The custom title bar provides a native-like experience within PWA limitations:

### Features
- **Mac Style**: Traffic light buttons (red, yellow, green) on the left
- **Windows Style**: Standard minimize, maximize, close buttons on the right
- **Platform Detection**: Automatically adapts to user's OS
- **Draggable**: Title bar area allows window dragging
- **Responsive**: Only shows on desktop (≥768px) in standalone mode

### PWA Limitations

⚠️ **Important**: Browser-based PWAs cannot fully remove browser controls. The custom title bar appears BELOW the browser's native controls.

#### What Works:
- ✅ Custom title bar with window controls
- ✅ Fullscreen mode (maximize)
- ✅ Window close with confirmation
- ✅ Platform-specific styling

#### What Doesn't Work:
- ❌ Cannot remove browser's native title bar
- ❌ Cannot truly minimize (only resize)
- ❌ Limited window management APIs

## For True Native Experience

To completely remove browser controls and have full window management, you need a native app wrapper:

### Option 1: Electron (Recommended)
```bash
npm install electron electron-builder
```

### Option 2: Tauri (Lightweight)
```bash
npm install @tauri-apps/cli @tauri-apps/api
```

### Option 3: Capacitor (Cross-platform)
```bash
npm install @capacitor/core @capacitor/cli
```

## Browser Support

| Browser | Window Controls Overlay | Standalone Mode |
|---------|------------------------|-----------------|
| Chrome  | ✅ Partial             | ✅ Yes          |
| Edge    | ✅ Partial             | ✅ Yes          |
| Safari  | ❌ No                  | ✅ Yes          |
| Firefox | ❌ No                  | ⚠️ Limited      |

## Future Improvements

When converting to native app:
1. Full window control APIs
2. System tray integration
3. Native notifications
4. Auto-updates
5. Deep OS integration
