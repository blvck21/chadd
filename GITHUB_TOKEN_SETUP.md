# 🔐 GitHub Token Setup für Private Repository Updates

## 📋 Schritt-für-Schritt Anleitung

### 1. **GitHub Personal Access Token erstellen**

1. **GitHub.com** → **Settings** (dein Profil-Icon → Settings)
2. **Developer settings** (ganz unten in der linken Sidebar)
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token** → **Generate new token (classic)**

### 2. **Token-Konfiguration**

**Name:** `CHADD Update Checker`
**Expiration:** `No expiration` (oder nach Bedarf)

**Scopes (Berechtigungen) auswählen:**

- ✅ **`repo`** - Full control of private repositories
  - ✅ `repo:status` - Access commit status
  - ✅ `repo_deployment` - Access deployment status
  - ✅ `public_repo` - Access public repositories
  - ✅ `repo:invite` - Access repository invitations

**Wichtig:** Nur `repo` scope ist wirklich nötig!

### 3. **Token kopieren und sicher speichern**

⚠️ **WICHTIG:** Der Token wird nur EINMAL angezeigt!

1. **Token kopieren** (beginnt mit `ghp_...`)
2. **Sicher speichern** (z.B. in einem Passwort-Manager)

### 4. **Token in der Entwicklung konfigurieren**

**Datei:** `packages/desktop/.env.local`

```env
# Ersetze 'your_token_here' mit deinem echten Token
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. **Repository URL aktualisieren**

**Datei:** `packages/desktop/src-tauri/src/lib.rs` (Zeile ~32)

```rust
let repo_url = "https://api.github.com/repos/DEIN_USERNAME/CHADD/releases/latest";
```

### 6. **Testen**

```bash
cd packages/desktop
npm run tauri dev
```

Klicke auf **"Updates"** - es sollte jetzt funktionieren!

## 🚀 **Production Deployment**

### Für Windows (Executable)

```bash
# Setze Umgebungsvariable vor dem Start
set GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CHADD.exe
```

### Für Linux/macOS

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
./CHADD
```

### Für Server/Docker

```dockerfile
ENV GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔒 **Sicherheitshinweise**

✅ **Token niemals in Code committen**  
✅ **`.env.local` ist in .gitignore**  
✅ **Token hat minimale Berechtigungen**  
✅ **Token regelmäßig rotieren**  
❌ **Token niemals in öffentlichen Logs**  
❌ **Token niemals in Screenshots/Videos**

## 🐛 **Troubleshooting**

### "Authentication failed"

- Token korrekt kopiert?
- `repo` scope aktiviert?
- Token noch gültig?

### "Repository not found"

- Repository URL korrekt?
- Repository existiert?
- Token hat Zugriff auf das Repository?

### "No GitHub token found"

- `.env.local` existiert?
- `GITHUB_TOKEN` Variable gesetzt?
- Datei im richtigen Verzeichnis?

## 📝 **Backup-Plan**

Falls Token-System Probleme macht:

1. **Repository temporär öffentlich machen**
2. **Updates testen**
3. **Wieder privat machen**
4. **Token-Problem beheben**

---

**Fertig!** Dein privates Repository hat jetzt ein sicheres Update-System! 🎉
