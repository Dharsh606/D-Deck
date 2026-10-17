# ⚡ D-Deck
> **The Futuristic Desktop Widget & Personal Life Command Center for Windows & Mobile.**

[![MIT License](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Android-blue.svg)]()
[![Privacy](https://img.shields.io/badge/Storage-100%25%20Offline%20Local-emerald.svg)]()
[![GitHub](https://img.shields.io/badge/Repo-Dharsh606%2FD--Deck-purple.svg)](https://github.com/Dharsh606/D-Deck)

---

## 🌟 Overview

Most to-do list applications require you to open a heavy browser tab or click through multi-step apps. 

**D-Deck** reimagines personal task tracking by putting a **sleek, interactive, frameless HUD widget directly on your desktop home screen**. 

With D-Deck, you can:
- **Add tasks in under 2 seconds** directly from the floating desktop widget.
- **Track daily hydration** (target: 3 to 4 Liters) with 1-click logging and missed-water reminders.
- **Organize your real life in dedicated spaces**: Movies & Watchlist, Gaming Backlog, Coding & Tech, Projects, Daily Chores, and Fitness.
- **Windows Startup Integration**: Silently boots when you log into Windows and triggers native Windows Toast notifications alerting you of missed tasks or morning priorities.
- **100% Offline & Private**: Zero databases in the cloud, zero accounts required. All data stays strictly on your personal machine.

---

## ✨ Key Features

### 1. 🖥️ Interactive Desktop Widget (Always Within Reach)
- **Frameless & Draggable**: Drags smoothly across your desktop.
- **Quick-Add Popover**: Click the glowing `+` button on the widget to immediately drop tasks into any category with keyboard shortcuts.
- **Pin / Always-on-Top Toggle**: Pin it above all windows while coding/working, or tuck it on the desktop.
- **Expand / Collapse**: Effortlessly toggle between the compact widget HUD and the full Command Center.

### 2. 🗂️ Dedicated Life Spheres
No more mixing your movie watchlist with your urgent coding bugs. D-Deck provides purpose-built spaces:
- 💻 **Coding & Tech**: Repositories, bugs, tech debt, and algorithms.
- 🚀 **Projects**: Multi-day milestones, client deliverables, and launch countdowns.
- 🎮 **Gaming Backlog**: Games in progress, backlog queue, platform tags (PC, Steam, Console).
- 🎬 **Movies & Series**: Cinema watchlist, star ratings, and watching status.
- 📋 **Daily Activities**: Quick errands, daily chores, and routines.
- 🏃 **Fitness & Health**: Workouts, cardio routines, and physical objectives.

### 3. 💧 Smart Hydration Engine (3–4 Liters Target)
- Direct 1-tap quick logging (+250ml glass / +500ml bottle) right from the widget.
- Real-time animated progress tube with celebration particles upon reaching your daily goal.
- Startup and periodic reminder notifications if you fall behind your schedule.

### 4. 🚀 Windows Startup & Native Notifications
- Automatically starts when Windows unlocks.
- Analyzes previous days and notifies you of:
  - Overdue tasks you missed.
  - Today's agenda count.
  - Hydration status.

### 5. 🔒 100% Local Storage & Privacy
- Stores data in your local Windows user profile (`%APPDATA%/d-deck/d-deck-data.json`).
- Zero cloud servers. Instant load times.
- 1-click **Export to JSON** backup anytime.

---

## 🛠️ Tech Stack

- **Runtime**: [Electron](https://www.electronjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Cyberpunk & Glassmorphism theme)
- **Audio Synthesis**: Web Audio API (Futuristic UI sound effects & haptic chimes)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Packaging**: [Electron Builder](https://www.electron.build/) (Windows NSIS & Portable `.exe`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Dharsh606/D-Deck.git
cd D-Deck
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
```bash
# Starts Vite dev server + Electron with hot reload
npm run electron:dev
```

Or build and run production mode locally:
```bash
npm run build
npm start
```

---

## 📦 Building the Windows Distribution

To build standalone Windows executables for your portfolio website or GitHub releases:

```bash
# Build portable Windows executable (.exe)
npm run dist:win

# Build full Windows installer (.exe with desktop & start menu shortcuts)
npm run pack:win
```
The output installers will be generated in the `release/` folder.

---

## 🌐 Showcase & Distribution Website

A modern landing page is included in the `website/` directory. It can be hosted on GitHub Pages, Vercel, or embedded directly into your personal portfolio website.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
Created with passion by **Dharshan**.
