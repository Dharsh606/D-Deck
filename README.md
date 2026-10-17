# D-Deck

A lightweight desktop to-do widget for Windows with dedicated lists and a local water intake tracker.

**Software Developer:** Dharshan V

## Background

Most to-do software today is either trapped inside a browser tab or locked behind cloud accounts and subscriptions. On mobile, home screen widgets are common, but on Windows, having a simple widget that stays on the desktop or floats when needed is surprisingly difficult to find without installing heavy third-party shells or Chrome extensions.

I built D-Deck for my own daily workflow. I watch movies, play games, write code, work on personal projects, and try to drink 3 to 4 liters of water every day. Mixing all of that into one generic checklist never worked well, so D-Deck splits everything into separate lists while keeping an interactive widget on the desktop for quick access.

## Features

### Desktop Widget
- Stays on the desktop or can be pinned on top of other windows.
- Frameless, draggable, and opens a quick-add dialog directly from the widget.
- Can be collapsed to a compact HUD or expanded to a full management view when organizing larger lists.

### Separate Lists
Instead of one long dump of tasks, D-Deck provides dedicated categories:
- **Coding**: Bugs, features, repo tasks, and technical notes.
- **Projects**: Multi-day milestones with duration tracking and deadlines.
- **Gaming**: Backlog, currently playing, and completed games with platform tags.
- **Movies**: Watchlist with personal ratings (1-5 stars) and viewing status.
- **Daily**: Day-to-day errands and recurring chores.
- **Fitness**: Workouts, cardio, and physical goals.

### Water Tracker
- Configurable daily water intake goal (defaults to 3.5 liters).
- Quick add buttons for 250ml (glass) and 500ml (bottle) directly on the widget.
- Visual intake progress without needing to open a separate tracking app.
- Optional reminder notifications if intake falls behind during the day.

### Windows Integration
- Starts with Windows on user login (toggleable in settings).
- Sends native Windows notifications on startup for any overdue tasks or missed water goals.
- Runs in the system tray when closed or minimized.

### Storage and Privacy
- 100% offline. No cloud databases, no user accounts, and no telemetry.
- All tasks and water logs are written directly to a local JSON file in `%APPDATA%/d-deck/`.
- Built-in JSON export so you can back up or move your data anytime.

## Availability

D-Deck is not published to the Microsoft Store or Google Play. It is distributed directly as an open-source project:
- **Windows**: Standalone executable and installer available on GitHub Releases and personal website downloads.
- **Android**: Companion build in progress to share the same local storage structure with an Android home-screen widget.

## Developer

**Software Developer:** Dharshan V  
GitHub: [https://github.com/Dharsh606](https://github.com/Dharsh606)

## License

MIT License. Free to use, modify, and distribute.
