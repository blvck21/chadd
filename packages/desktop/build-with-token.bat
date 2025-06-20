@echo off
echo 🚀 Building CHADD with GitHub Token...

REM Setze den GitHub Token als Umgebungsvariable
REM WICHTIG: Ersetze 'your_token_here' mit deinem echten Token!
set GITHUB_TOKEN=your_token_here

REM Build die Anwendung
echo 📦 Installing dependencies...
call npm install

echo 🔨 Building Tauri application...
call npm run tauri build

echo ✅ Build completed!
echo 🔑 Token was used for build (not included in final binary)

pause 