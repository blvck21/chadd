# IchFickDiscord Build Guide

This guide covers building the server executable for Debian and setting up the Windows client with auto-updater functionality.

## Prerequisites

### For Server (Debian Package)

- Node.js 18+
- npm or yarn
- pkg (for creating executable): `npm install -g pkg`
- dpkg-deb (for creating .deb package) - available on most Linux distributions

### For Client (Windows)

- Node.js 18+
- Rust toolchain
- Tauri CLI: `npm install -g @tauri-apps/cli`

## Building the Server (Debian)

### 1. Install Dependencies

```bash
cd packages/server
npm install
```

### 2. Build Executable

```bash
npm run build:executable
```

This creates `ichfickdiscord-server` executable.

### 3. Create Debian Package

```bash
npm run build:deb
```

This creates a `.deb` package in `packages/server/build/`.

### 4. Install on Debian/Ubuntu

```bash
sudo dpkg -i ichfickdiscord-server_1.0.0_amd64.deb
```

### 5. Server Management

```bash
# Start the service
sudo systemctl start ichfickdiscord-server

# Enable auto-start on boot
sudo systemctl enable ichfickdiscord-server

# Check status
sudo systemctl status ichfickdiscord-server

# View logs
sudo journalctl -u ichfickdiscord-server -f
```

### Configuration

Server configuration is located at `/etc/ichfickdiscord/server.config.json` after installation.

## Building the Windows Client

### 1. Install Dependencies

```bash
cd packages/desktop
npm install
```

### 2. Build for Windows

```bash
npm run tauri:build:windows
```

This creates:

- `.msi` installer in `packages/desktop/src-tauri/target/release/bundle/msi/`
- `.exe` portable executable in `packages/desktop/src-tauri/target/release/`

### 3. Build from Root

```bash
# Build both server and client
npm run build:all

# Or individually
npm run build:server:deb
npm run build:desktop:windows
```

## Auto-Updater Setup

### 1. Release Server

The project includes a simple release server for handling updates:

```bash
cd release-server
npm install
npm start
```

Server runs on port 3001 by default.

### 2. Update Tauri Configuration

Update the updater endpoint in `packages/desktop/src-tauri/tauri.conf.json`:

```json
{
  "updater": {
    "active": true,
    "dialog": true,
    "endpoints": [
      "https://your-update-server.com/{{target}}/{{current_version}}"
    ]
  }
}
```

### 3. Publishing Updates

To publish a new version:

1. Update version numbers in:

   - `package.json` (root)
   - `packages/desktop/package.json`
   - `packages/desktop/src-tauri/tauri.conf.json`

2. Build the new version:

   ```bash
   npm run build:desktop:windows
   ```

3. Upload to your release server or use the built-in upload endpoint:
   ```bash
   curl -X POST http://your-server:3001/upload/windows-x86_64 \
     -H "Content-Type: application/json" \
     -d '{
       "version": "1.0.1",
       "notes": "Bug fixes and improvements",
       "signature": "signature_here",
       "filename": "IchFickDiscord_1.0.1_x64_en-US.msi"
     }'
   ```

## Version Display

The client now displays the current version in the bottom-right corner. Features:

- Shows current version number
- Clickable to check for updates manually
- Shows "(Checking...)" status during update checks
- Automatic update checks on app startup

## Directory Structure

```
ichfickdiscord/
├── packages/
│   ├── server/
│   │   ├── build/                 # Generated .deb packages
│   │   ├── scripts/
│   │   │   └── create-deb.js     # Debian package creation script
│   │   └── ...
│   └── desktop/
│       ├── src-tauri/
│       │   └── target/
│       │       └── release/
│       │           └── bundle/   # Generated installers
│       └── ...
├── release-server/               # Update server
│   ├── src/
│   │   └── index.js
│   └── releases/                # Release files storage
└── BUILD_GUIDE.md               # This file
```

## Deployment

### Server Deployment

1. Build the Debian package on a Linux system
2. Transfer the `.deb` file to your target server
3. Install with `dpkg -i`
4. Configure firewall to allow the server port (default: 3000)
5. Start and enable the service

### Client Distribution

1. Build the Windows installer
2. Distribute the `.msi` file to users
3. Set up the release server for auto-updates
4. Users can install and will automatically receive updates

## Troubleshooting

### Server Issues

- Check logs: `sudo journalctl -u ichfickdiscord-server -f`
- Check service status: `sudo systemctl status ichfickdiscord-server`
- Verify configuration: `cat /etc/ichfickdiscord/server.config.json`

### Client Issues

- Check Tauri console for errors
- Verify network connectivity to server
- Check updater endpoints are accessible

### Build Issues

- Ensure all dependencies are installed
- Check Node.js and Rust versions
- Verify pkg is installed globally for server builds

## Security Notes

- The auto-updater uses public key signatures for security
- Generate your own key pair for production use
- The example release server has no authentication - add proper auth for production
- Configure proper firewall rules for server deployment

## Support

For issues and questions, check the project repository or create an issue.
