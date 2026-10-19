<p align="center">
  <img src="public/logo.png" alt="D-Deck Logo" width="300" />
</p>

# D-Deck

A futuristic, ultra-compact desktop HUD widget & command center for Windows, engineered with frosted acrylic glassmorphism, persistent reminders, Focus Flow sprints, and daily habit auto-reset.

> **Crafted by Code & Chaos** • *We Built Stuff*

---

## ⚡ The Philosophy

Most task management tools today are trapped inside heavy browser tabs or locked behind recurring subscription models and cloud telemetry. On mobile, home screen widgets are common, but on Windows, having a dedicated floating widget that stays on your desktop without cluttering your taskbar or Alt+Tab switcher has been missing.

D-Deck gives you complete control over your focus. Built for developers, gamers, and creators who need instantaneous task capture and continuous accountability without distraction.

---

## ✨ Features

### 🖥️ Pure Desktop HUD Experience
- **Taskbar-Free Floating Widget**: Sits directly on your desktop canvas with zero clutter in the Windows taskbar or Alt+Tab switcher.
- **Glassmorphism Aesthetic**: Translucent frosted acrylic styling matching modern Windows 11 design standards.
- **Permanent Spatial Memory**: Draggable with exact coordinates remembered across app and system restarts.
- **Global Stealth Hotkey**: Press `Ctrl+Shift+D` anywhere across Windows to summon or hide the widget instantly over games and full-screen apps.

### ⏱️ Focus Flow Sprint Timer
- 1-click countdown sprint timer embedded directly into the widget titlebar (15m, 25m, 45m, 60m).
- Visual pulse and gentle audio chime notifications upon sprint completion.

### 🔔 Continuous Pinpoint Reminders
- **T - 1 minute**: Advance heads-up ping before your scheduled task starts.
- **T (Exact time)**: Crisp audio alert when the task schedule arrives.
- **T + every minute**: Continuous reminder alerts every minute until you mark the task complete or snooze it.

### 🔄 Daily Habit Auto-Reset
- Toggle "Daily Routine" on tasks like workouts, hydration, or gaming sessions.
- Automatically resets completed routine tasks at midnight for the next day, eliminating manual re-entry.

### 🏷️ Flexible Freeform Tags & Search
- Create customized tags on the fly without rigid predetermined categories.
- Real-time search and filter across all tasks, routines, and backlogs.

### 🔒 100% Offline & Private
- No cloud servers, no account registration, and zero telemetry.
- All data stored locally in `%APPDATA%/d-deck/d-deck-data.json`.
- 1-click export and import for seamless backups.

---

## 📦 Downloads & Releases

D-Deck is free, open-source software under the MIT License.

| Edition | File | Description |
| :--- | :--- | :--- |
| **Windows Installer** | `D-Deck-Setup-<version>.exe` | Recommended for Windows 10/11. Installs desktop shortcut and startup registration. |
| **Windows Portable** | `D-Deck-Portable-<version>.exe` | Standalone single executable. Runs instantly without installation. |

Download the latest release from [GitHub Releases](https://github.com/Dharsh606/D-Deck/releases).

---

## 🚀 Releasing a New Version (One Command)

To release a new version to GitHub, simply run:

```bash
# Releases the next patch version (e.g. 1.0.0 -> 1.0.1)
npm run release

# Or specify a bump type or exact version
npm run release:patch
npm run release:minor
npm run release:major
npm run release 1.0.2
```

### What happens automatically:
1. `package.json` version is updated.
2. A release commit and Git tag (`v<version>`) are generated.
3. Both `main` and the release tag are pushed to GitHub.
4. GitHub Actions builds the clean NSIS Installer and Portable binaries and publishes the GitHub release automatically.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run Vite dev server with hot reload
npm run dev

# Run Electron desktop app in development
npm run electron:dev

# Build production binaries locally
npm run pack:win
```

---

## 📜 Team & License

- **Team**: **Code & Chaos**
- **Tagline**: *We Built Stuff*
- **Repository**: [https://github.com/Dharsh606/D-Deck](https://github.com/Dharsh606/D-Deck)
- **License**: MIT License
