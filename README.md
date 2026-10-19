<p align="center">
  <img src="public/logo.png" alt="D-Deck Logo" width="300" />
</p>

# D-Deck

A lightweight, local-first desktop to-do widget for Windows with dedicated category backlogs and 3-stage precision reminders.

**SOFTWARE DEVELOPER - Dharshan V**

## Background

Most task management tools today are trapped inside heavy browser tabs or locked behind recurring subscription models and cloud telemetry. On mobile, home screen widgets are common, but on Windows, having a dedicated floating widget that stays on your desktop without requiring third-party shells or memory-heavy browser extensions is surprisingly rare.

I built D-Deck for my own daily setup. As a developer, I write code, manage project milestones, play games, watch movies, hit the gym, and handle daily errands. Lumping all of that into a single generic to-do list doesn't work. D-Deck provides distinct, purpose-built lists with an ultra-compact, persistent desktop HUD widget that is always within reach.

## Features

### Ultra-Compact Desktop Widget
- 50% smaller visual footprint than standard utility windows (280px × 380px).
- Sits unobtrusively on your desktop or stays pinned on top of active applications.
- Draggable with permanent screen position memory across restarts.
- 2-click task capture with quick-category assignment and subtask checklists.
- 1-click toggle between compact floating widget and the full command deck.

### 3-Stage Smart Reminders
Unlike basic to-do apps with a single ping, D-Deck monitors your scheduled tasks at three critical moments:
1. **T - 5 minutes**: Advance heads-up notification before your task or session begins.
2. **T (Exact time)**: Prompt alert when the scheduled time arrives.
3. **T + 5 minutes**: Follow-up notification if the task remains uncompleted, ensuring you don't sleep through or miss your schedule.
- When you check off a task, subsequent reminders automatically stop.

### Dedicated Category Boards
- **Coding**: Sprint tasks, bug fixes, repo actions, and technical notes.
- **Projects**: Multi-day initiatives with duration spans and milestone tracking.
- **Gaming**: Backlog, currently playing titles, and platform tags.
- **Movies**: Watchlist with viewing status and personal ratings.
- **Daily**: Chores, hydration reminders, and day-to-day routines.
- **Fitness**: Training splits, workouts, and cardio sessions.

### Windows Native Integration
- Starts with Windows on user login (toggleable in settings).
- Sends native Windows toast notifications for upcoming tasks, scheduled times, and overdue items.
- Silent minimize to system tray icon.

### Local-First Privacy
- 100% offline. No cloud databases, no user accounts, and zero telemetry.
- All tasks and preferences are saved directly to a single JSON file in `%APPDATA%/d-deck/d-deck-data.json`.
- 1-click JSON backup and data export.

## Availability

D-Deck is not distributed through commercial app stores. It is available as a free, open-source release:
- **Windows**: NSIS installer and standalone portable build available via GitHub Releases and official website.
- **Android**: Companion APK in progress using the same offline local data model.

## Developer

**SOFTWARE DEVELOPER - Dharshan V**  
GitHub: [https://github.com/Dharsh606](https://github.com/Dharsh606)  
Project Repository: [https://github.com/Dharsh606/D-Deck](https://github.com/Dharsh606/D-Deck)

## License

MIT License. Free to use, modify, and distribute.
