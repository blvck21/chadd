# 🎙️ IchFickDiscord - Retro Voice Chat

Ein **hochperformantes Voice-Chat-Programm** mit kristallklarer Audio-Qualität und retro TeamSpeak-Design.

## 🚀 Neu: Production-Ready Features

- **📦 Debian Server Package**: Vollständiges .deb-Paket mit systemd Service
- **🖥️ Windows Client Installer**: Professioneller .msi Installer für einfache Verteilung
- **🔄 Auto-Updater**: Automatische Updates bei neuen Versionen
- **📊 Versions-Anzeige**: Aktuelle Version in der unteren rechten Ecke (klickbar für Update-Check)

## ✨ Features

### 🔊 **Crystal Clear Audio**

- **Opus Codec** mit 48kHz Sample Rate für beste Audio-Qualität
- **WebRTC** für niedrige Latenz P2P-Verbindungen
- **Noise Suppression**, Echo Cancellation & Auto Gain Control
- **Forward Error Correction** (FEC) für stabile Verbindungen

### 🏠 **Gruppenchats & Räume**

- **Dynamische Raum-Erstellung** mit anpassbaren Audio-Einstellungen
- **Admin-System** für Raum-Management
- **Benutzer-Liste** mit Live Voice Activity Detection
- **Channel-Tree** im retro TeamSpeak-Style

### 🎨 **Retro Design**

- **TeamSpeak 2/3 inspired** Interface
- **Dunkles Theme** mit grünen Akzenten
- **Monospace Font** für den authentischen Look
- **Smooth Animations** und Hover-Effekte

### 🖥️ **Cross-Platform**

- **Tauri Desktop App** (Windows, macOS, Linux)
- **Web-Version** läuft direkt im Browser
- **System Tray Integration**
- **Global Shortcuts** für Push-to-Talk

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Styled-Components
- **Desktop**: Tauri + Rust
- **Backend**: Node.js + Socket.io + Express
- **Audio**: WebRTC + Opus Codec
- **State Management**: Zustand

## 📦 Installation & Setup

### Entwicklung

### 1. **Dependencies installieren**

```bash
npm install
```

### 2. **Server starten**

```bash
npm run dev:server
```

### 3. **Desktop App starten**

```bash
npm run dev:desktop
```

### Production Build

### 🚀 **Schnelle Deployment**

```bash
# Windows (erstellt Server-Executable und Windows-Installer)
deploy.bat

# Linux (erstellt Debian-Paket und Windows-Installer)
./deploy.sh
```

### 📦 **Einzelne Komponenten**

```bash
# Debian Server Package
npm run build:server:deb

# Windows Client Installer
npm run build:desktop:windows

# Alles zusammen
npm run build:all
```

Siehe [`BUILD_GUIDE.md`](BUILD_GUIDE.md) für detaillierte Anweisungen.

## 🔧 Entwicklung

### **Server (Node.js)**

```bash
cd packages/server
npm run dev    # Development mit Hot Reload
npm run build  # Production Build
```

### **Desktop App (Tauri)**

```bash
cd packages/desktop
npm run tauri:dev     # Development
npm run tauri:build   # Production Build
```

## 🎵 Audio-Optimierungen

### **Opus Codec Einstellungen**

- **Sample Rate**: 48kHz (Studio-Qualität)
- **Bitrate**: 64kbps (Balance zwischen Qualität & Bandbreite)
- **Channels**: Mono (optimal für Voice)
- **FEC**: Aktiviert für Paketverlusts-Korrektur
- **DTX**: Diskontinuierliche Übertragung für Bandbreiten-Effizienz

### **WebRTC Audio Constraints**

```javascript
{
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
  channelCount: 1
}
```

## 🏗️ Architektur

```
ichfickdiscord/
├── packages/
│   ├── server/          # WebRTC Signaling Server
│   │   ├── src/
│   │   │   └── index.ts # Socket.io Server + Room Management
│   │   └── package.json
│   ├── desktop/         # Tauri Desktop App
│   │   ├── src/
│   │   │   ├── components/  # React Components
│   │   │   ├── stores/      # Zustand State Management
│   │   │   └── types/       # TypeScript Definitions
│   │   ├── src-tauri/       # Rust Backend
│   │   └── package.json
│   └── shared/          # Shared Types & Utils
└── package.json         # Workspace Root
```

## 🔌 WebRTC Signaling

### **Server Events**

- `join-room` - Benutzer tritt Raum bei
- `offer/answer` - WebRTC SDP Austausch
- `ice-candidate` - ICE Candidate Austausch
- `user-joined/left` - Benutzer Events

### **Audio Streaming**

- **P2P WebRTC** Verbindungen zwischen Clients
- **STUN Server** für NAT Traversal
- **Automatic fallback** zu TURN Server bei Problemen

## 🎮 Controls

### **Keyboard Shortcuts**

- `Ctrl+M` - Mikrofon stummschalten
- `Ctrl+D` - Deafen (alle stumm)
- `Space` - Push-to-Talk (konfigurierbar)

### **Audio Controls**

- **Mikrofon Ein/Aus** mit visueller Rückmeldung
- **Lautstärke-Regler** für Mikrofon und Lautsprecher
- **Voice Activity Detection** mit Live-Anzeige

## 🌐 Server Requirements

- **Node.js 18+**
- **Port 3001** für WebSocket Verbindungen
- **HTTPS** empfohlen für Produktion

## 🔧 Configuration

### **Audio Settings**

```typescript
audioConfig: {
  codec: 'opus',
  sampleRate: 48000,
  bitrate: 64000,
  fec: true,
  dtx: true
}
```

### **Room Settings**

```typescript
room: {
  maxUsers: 50,
  isPrivate: false,
  audioConfig: { /* siehe oben */ }
}
```

## 📸 Screenshots

### Main Interface

![Retro Voice Chat Interface](docs/screenshot-main.png)

### Channel Tree

![Channel Management](docs/screenshot-channels.png)

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Commite deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 License

MIT License - siehe [LICENSE](LICENSE) file.

## 🎯 Roadmap

- [ ] **Push-to-Talk** System
- [ ] **Audio-Device Selection**
- [ ] **Screen Sharing**
- [ ] **File Transfer**
- [ ] **Mobile App** (React Native)
- [ ] **Voice Recordings**
- [ ] **Admin Dashboard**

---

**Made with ❤️ for crystal clear voice communication**
