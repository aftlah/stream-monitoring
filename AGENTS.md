<!-- BEGIN:nextjs-agent-rules -->
# AGENTS.md

## Project Overview

This project is called **RAGE LIVE MONITOR**.

RAGE LIVE MONITOR is a YouTube livestream monitoring dashboard that displays channels currently broadcasting live.

The application is NOT a streaming platform.

The application is a monitoring dashboard focused on:

* Live channel discovery
* Multi-stream monitoring
* Fast loading
* Responsive layouts
* Premium gaming UI

---

## Tech Stack

Always use:

* Next.js 15 App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React

Avoid introducing:

* Redux
* Zustand
* MobX
* Firebase
* Prisma
* ORM libraries
* Unnecessary dependencies

Keep the project lightweight.

---

## Architecture Rules

### Data Source

Use:

`/data/streamers.json`

as the single source of truth for monitored channels.

Do NOT introduce a database unless explicitly requested.

Do NOT create:

* PostgreSQL
* MySQL
* MongoDB
* Supabase

without approval.

---

### YouTube API

All livestream information must come from:

YouTube Data API v3

Create reusable helpers inside:

`lib/youtube.ts`

Keep API logic isolated from UI components.

---

### Component Design

Components must be:

* Small
* Reusable
* Typed
* Single responsibility

Avoid large monolithic components.

Preferred structure:

components/
├── app-header.tsx
├── stats-bar.tsx
├── layout-switcher.tsx
├── live-grid.tsx
├── live-card.tsx
├── live-sidebar.tsx
├── live-player.tsx
├── empty-state.tsx
└── search-streamer.tsx

---

### TypeScript Rules

Never use:

any

Always create proper types.

Store shared types inside:

types/

Examples:

* Streamer
* LiveStream
* LayoutOption
* YoutubeResponse

Use strict typing.

---

### Server Components First

Prefer:

Server Components

before Client Components.

Only use:

"use client"

when absolutely necessary.

Examples:

Allowed:

* Modal interactions
* Search input
* Layout switching

Avoid client components for data fetching.

---

### Data Fetching

Prefer:

* Server Components
* cache()
* revalidate

Avoid:

* useEffect fetching
* duplicated requests
* client-side API polling when server rendering is sufficient

---

### Styling Rules

Theme follows the RAGE brand.

Primary colors:

Background: #0A0A0A
Card: #111111
Primary: #EAB308
Secondary: #CA8A04
Accent: #FACC15
Border: #262626
Foreground: #FAFAFA

Danger: #EF4444

---

### Visual Identity

Design language:

* Competitive Gaming
* Esports Organization
* Tactical Dashboard
* Command Center
* Premium Gaming UI

Avoid:

* Blue cyberpunk themes
* Glassmorphism
* Excessive gradients
* Low contrast text

Use:

* Dark backgrounds
* Gold accents
* Thin borders
* Subtle glow effects

---

### UI Requirements

Every screen should maintain:

* Consistent spacing
* Strong hierarchy
* Responsive layout
* Accessibility

Support:

Desktop
Tablet
Mobile

---

### Accessibility

Always include:

* aria-label
* semantic HTML
* keyboard navigation
* focus states

Do not sacrifice accessibility for visual effects.

---

### Performance Rules

Prioritize:

* Fast first load
* Minimal JavaScript
* Server rendering
* Component reusability

Avoid:

* unnecessary state
* unnecessary effects
* large dependencies

---

### Folder Structure

app/
components/
data/
lib/
types/
hooks/

Keep the structure organized.

Do not create deeply nested folders without justification.

---

### Code Quality

Every change must:

* Compile successfully
* Pass TypeScript checks
* Follow existing architecture
* Follow existing design system

Avoid quick hacks.

Prefer maintainable solutions.

---

### Agent Behavior

Before creating new code:

1. Reuse existing components when possible.
2. Reuse existing utilities when possible.
3. Preserve visual consistency.
4. Preserve TypeScript safety.
5. Preserve performance.

Do not introduce new architectural patterns unless necessary.

When unsure, choose the simplest solution that fits the current architecture.

---

### Goal

Build and maintain a fast, clean, scalable livestream monitoring dashboard with a premium black-and-gold gaming aesthetic consistent with the RAGE brand.

<!-- END:nextjs-agent-rules -->
