# Building Taktak Desktop Installers

This guide explains how to build platform-specific installers for Taktak Desktop.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Platform-specific requirements (see below)

## Quick Start

```bash
# Install dependencies
npm install

# Build for all platforms (requires appropriate OS)
npm run build:electron

# Build for specific platforms
npm run build:electron:win    # Windows
npm run build:electron:mac    # macOS
npm run build:electron:linux  # Linux
```

## Platform-Specific Requirements

### Windows

**Requirements:**
- Windows 10 or later
- Administrator privileges (for first build only)
- No code signing certificate required (unsigned builds work fine)

**Output:**
- `dist-electron/Taktak-Setup-1.0.0.exe` - NSIS installer (~80-100MB)

**Common Issues:**
1. **File lock errors**: Close any running Taktak instances and delete `dist-electron` folder
2. **Symbolic link errors**: Run terminal as Administrator for first build
3. **Code signing errors**: Builds are configured to skip signing (no certificate needed)

**Build Command:**
```bash
# Clean build
rmdir /s /q dist-electron
npm run build:electron:win
```

### macOS

**Requirements:**
- macOS 10.13 or later
- Xcode Command Line Tools: `xcode-select --install`
- No Apple Developer account required for local builds

**Output:**
- `dist-electron/Taktak-1.0.0-x64.dmg` - Intel Macs (~80-100MB)
- `dist-electron/Taktak-1.0.0-arm64.dmg` - Apple Silicon (~80-100MB)
- `dist-electron/Taktak-1.0.0-x64.zip` - Intel Macs (portable)
- `dist-electron/Taktak-1.0.0-arm64.zip` - Apple Silicon (portable)

**Build Command:**
```bash
# Clean build
rm -rf dist-electron
npm run build:electron:mac
```

**Note:** Builds are not notarized. Users will need to right-click → Open on first launch.

### Linux

**Requirements:**
- Ubuntu 18.04+ or equivalent
- Standard build tools: `sudo apt-get install build-essential`

**Output:**
- `dist-electron/Taktak-1.0.0-x64.AppImage` - Universal Linux (~80-100MB)
- `dist-electron/Taktak-1.0.0-amd64.deb` - Debian/Ubuntu package

**Build Command:**
```bash
# Clean build
rm -rf dist-electron
npm run build:electron:linux
```

## Configuration

The build configuration is in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "com.taktak.app",
    "productName": "Taktak",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "electron/**/*",
      "apps/client/dist/**/*",
      "apps/server/dist/**/*",
      "public/**/*"
    ]
  }
}
```

## File Size Optimization

Current installer sizes are ~80-100MB. To reduce:

1. **Exclude unnecessary node_modules**: Already configured to only include required dependencies
2. **Enable compression**: Set `compression: "maximum"` in build config
3. **Use asar archives**: Already enabled by default
4. **Split large dependencies**: Use dynamic imports in React code

## Auto-Updates

Installers are configured to use GitHub Releases for auto-updates:

```json
{
  "publish": {
    "provider": "github",
    "owner": "MfFischer",
    "repo": "taktak_automation_system",
    "releaseType": "release"
  }
}
```

### Publishing a Release

1. **Build all installers** (requires access to all platforms)
2. **Create GitHub release**:
   ```bash
   gh release create v1.0.0 \
     dist-electron/Taktak-Setup-1.0.0.exe \
     dist-electron/Taktak-1.0.0-x64.dmg \
     dist-electron/Taktak-1.0.0-arm64.dmg \
     dist-electron/Taktak-1.0.0-x64.AppImage \
     dist-electron/Taktak-1.0.0-amd64.deb \
     --title "Taktak Desktop v1.0.0" \
     --notes "Initial release"
   ```
3. **Verify auto-updater**: Launch app and check for updates in Settings

## CI/CD with GitHub Actions

For automated builds across all platforms, use GitHub Actions:

```yaml
name: Build Installers

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install
      - run: npm run build:electron
      
      - uses: actions/upload-artifact@v3
        with:
          name: installers-${{ matrix.os }}
          path: dist-electron/*
```

## Troubleshooting

### Build Fails with "Cannot find module"
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Installer Size Too Large
- Check `dist-electron/builder-effective-config.yaml` for included files
- Use `npm run build:electron -- --dir` to build unpacked app and inspect contents

### Auto-Updater Not Working
- Verify GitHub release exists with correct tag format (`v1.0.0`)
- Check that installer filenames match expected patterns
- Ensure `latest.yml` (Windows), `latest-mac.yml` (macOS), or `latest-linux.yml` (Linux) are published

### Code Signing Issues
- **Windows**: Builds are configured to skip signing (`signAndEditExecutable: false`)
- **macOS**: Builds are not notarized (users must right-click → Open)
- **Linux**: No signing required

## Next Steps

1. **Test installers** on each platform
2. **Create GitHub release** with all installers
3. **Update download links** on landing page
4. **Test auto-updater** by publishing a new version

## Resources

- [electron-builder Documentation](https://www.electron.build/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases)
- [electron-updater Guide](https://www.electron.build/auto-update)

