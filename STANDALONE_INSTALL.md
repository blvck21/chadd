# IchFickDiscord - Standalone Server Installation

🚀 **One-command installation for Debian/Ubuntu servers**

## Quick Install

Run this single command on your Debian/Ubuntu server:

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/ichfickdiscord/main/standalone-debian-setup.sh | sudo bash
```

## What This Does

The standalone installer will:

1. ✅ **Update your system** packages
2. ✅ **Install Node.js 18** from NodeSource
3. ✅ **Create a secure system user** for the service
4. ✅ **Build the complete server application** from scratch
5. ✅ **Install all dependencies** automatically
6. ✅ **Create a systemd service** with security hardening
7. ✅ **Configure UFW firewall** (opens port 3001)
8. ✅ **Create management commands** for easy control

## After Installation

Your server will be running at: `http://YOUR_SERVER_IP:3001`

### Management Commands

```bash
ichfickdiscord start     # Start the server
ichfickdiscord stop      # Stop the server
ichfickdiscord restart   # Restart the server
ichfickdiscord status    # Show status
ichfickdiscord logs      # View live logs
ichfickdiscord info      # Show server information
ichfickdiscord config    # Edit configuration
```

## Manual Installation

If you prefer to download and review the script first:

```bash
# Download the installer
wget https://raw.githubusercontent.com/your-repo/ichfickdiscord/main/standalone-debian-setup.sh

# Make it executable
chmod +x standalone-debian-setup.sh

# Review the script (optional but recommended)
less standalone-debian-setup.sh

# Run the installer
sudo ./standalone-debian-setup.sh
```

## System Requirements

- **OS**: Debian 10+ or Ubuntu 18.04+
- **RAM**: 512MB minimum (1GB recommended)
- **Storage**: 1GB free space
- **Network**: Internet connection for package downloads
- **Access**: sudo/root privileges

## Features

- 🎙️ **Voice Chat**: Real-time voice communication
- 💬 **Text Chat**: Integrated text messaging
- 🏠 **Multiple Rooms**: Create and join different chat rooms
- 🔒 **Secure**: Runs with security hardening
- 📊 **Monitoring**: Built-in health checks and logging
- 🔄 **Auto-restart**: Automatically restarts on crash
- 🚀 **Auto-start**: Starts automatically on server boot

## Server Configuration

The server configuration is located at `/opt/ichfickdiscord/server.config.json`:

```json
{
  "port": 3001,
  "host": "0.0.0.0",
  "cors": {
    "origin": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowedHeaders": ["Content-Type", "Authorization"],
    "credentials": true
  },
  "logging": {
    "level": "info",
    "file": "/opt/ichfickdiscord/logs/server.log"
  },
  "voice": {
    "quality": "high",
    "maxUsers": 50,
    "codec": "opus"
  },
  "features": {
    "rooms": true,
    "directMessages": false,
    "fileSharing": false
  }
}
```

Edit with: `ichfickdiscord config`

## API Endpoints

- `GET /` - Server information
- `GET /health` - Health check
- `GET /stats` - Server statistics
- `GET /rooms` - Available rooms

## Troubleshooting

### Check if server is running:

```bash
ichfickdiscord status
```

### View logs:

```bash
ichfickdiscord logs
```

### Check network connectivity:

```bash
curl http://localhost:3001
```

### Restart if needed:

```bash
ichfickdiscord restart
```

### Check firewall:

```bash
sudo ufw status
```

## Uninstall

To completely remove the server:

```bash
# Stop and disable service
sudo systemctl stop ichfickdiscord
sudo systemctl disable ichfickdiscord

# Remove files
sudo rm -rf /opt/ichfickdiscord
sudo rm /etc/systemd/system/ichfickdiscord.service
sudo rm /usr/local/bin/ichfickdiscord

# Remove user
sudo userdel ichfickdiscord

# Reload systemd
sudo systemctl daemon-reload
```

## Support

If you encounter issues:

1. Check the logs: `ichfickdiscord logs`
2. Verify service status: `ichfickdiscord status`
3. Check server info: `ichfickdiscord info`
4. Test network connectivity: `curl http://localhost:3001`

---

**🎉 Your retro voice chat server is now ready to use!**
