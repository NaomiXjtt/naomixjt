# naomixjt
# Petals of Mind — Architecture Decision

## Chosen Architecture
**Option B — Single-Page Sections (Show/Hide)**

## Rationale
This project behaves as an interactive flow with multiple *states* (home → result → share → detail) rather than independent standalone pages.  
A single-page structure avoids page reloads and preserves in-memory states such as drag-and-drop flowers, z-index layering, floating bubbles, and modal dialogs.  
The existing prototype already uses multiple `<section>` blocks and a simple JavaScript view router to toggle the `.active` state.

## Sections Implemented
- **Home (`#home`)** — Vase + draggable flower palette + editing tools
- **Result (`#result`)** — Shows final bouquet, bubbles, and encouragement text
- **Share (`#share`)** — Public wall with animated draggable bubbles and reactions
- **Detail (`#detail`)** — Single shared work view + comment modal
- **Flower (`#flower`)** — Template section for flower introduction page
- **Flower Meaning Modals** — Implemented using pure HTML/CSS `:target`

## Navigation Strategy
Navigation is handled by:
1) A unified `<nav>` with links using `data-nav` or `#hash`  
2) A JavaScript `showView(id)` router that toggles visible sections  
3) (Optional addition) syncing the URL hash so browser back/forward still works  

This ensures users always know where they are, can switch screens without reload, and can directly deep-link using URLs.

## Anticipated Challenges
- **State persistence** — Arranged flowers and reactions currently live only in memory; exporting or re-loading states will require storage
- **Performance** — Multiple transparent PNGs and animated bubbles may challenge low-end devices
- **Accessibility** — Drag-and-drop and modals require additional ARIA and keyboard support
- **Responsive layout** — Stage, palette, and toolbars need adjustments on small screens
- **Hybrid expansion** — If future static pages (About/Privacy/Help) are needed, may later add limited multi-page structure

## Folder Structure
