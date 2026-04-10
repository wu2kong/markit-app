# MarkIt

A cross-platform bookmark manager built with [Tauri](https://tauri.app/) v2, React, and TypeScript. Organize your bookmarks with folders, collections, tags, and notes — all stored locally in SQLite.

## Features

- **Multi-Workspace** — Create separate workspaces to isolate different bookmark collections
- **Folder Hierarchy** — Nest folders within folders for deep organization
- **Collections** — Group bookmarks into thematic collections across folders
- **Tags with Hierarchy** — Use nested tags with custom colors for flexible categorization
- **Notes** — Attach notes to any bookmark for context and annotations
- **Multiple Display Modes** — View bookmarks as a list, cards, or compact rows
- **Auto Metadata** — Automatically fetch page title, description, and favicon when adding a URL
- **Search** — Full-text search across all bookmarks in a workspace
- **Export** — Export bookmarks in CSV, JSON, or Markdown format
- **Dark / Light Theme** — Toggle between light and dark modes
- **Resizable Panels** — Drag to resize workspace sidebar, folder sidebar, bookmark list, and detail panel
- **Local-First** — All data is stored locally in SQLite; no cloud account required

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 · TypeScript · Tailwind CSS 4 · Zustand |
| Backend | Tauri v2 · Rust · rusqlite (SQLite) |
| Build | Vite · pnpm |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/) 
- [Rust](https://www.rust-lang.org/tools/install) ≥ 1.77
- Platform-specific dependencies for [Tauri v2](https://v2.tauri.app/start/prerequisites/)

### Install & Run

```bash
# Install frontend dependencies
pnpm install

# Start development server with Tauri window
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

The built application will be in `src-tauri/target/release/bundle/`.

## Project Structure

```
markit-app/
├── src/                        # React frontend
│   ├── components/
│   │   ├── bookmarks/          # Bookmark list, card, compact, context menu, add input
│   │   ├── common/             # Shared components (Toast, ContextMenu, ResizeHandle, Favicon)
│   │   ├── detail/             # Bookmark editor & notes panel
│   │   ├── layout/             # App header
│   │   └── sidebar/            # Workspace sidebar, folder tree, collections, tags, notes list
│   ├── stores/                 # Zustand state stores
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # API layer (Tauri IPC)
├── src-tauri/                  # Rust backend
│   ├── src/
│   │   ├── commands/           # Tauri command handlers (workspaces, folders, collections, tags, bookmarks, notes, metadata)
│   │   └── db/                 # SQLite initialization & models
│   └── Cargo.toml
├── package.json
└── vite.config.ts
```

## License

MIT