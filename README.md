# naomixjt
# 🌸 Petals of Mind  
*Interactive Emotional Bouquet Builder*

This project allows users to drag-and-drop flowers to build an emotional bouquet, generate personalized encouragement, and explore others’ creations in a floating “share wall.”  
It is built as a **single-page interactive web experience** with dynamic content generated entirely through JavaScript.

---

# 🔄 Week 8 Update — Dynamic JavaScript Content

This week’s focus was converting my previously static flower palette into a **data-driven interface** using:

- JavaScript arrays  
- `forEach()` loops  
- `document.createElement()`  
- Dynamic DOM insertion

### ✔️ What I completed this week
- Created a **`FLOWERS` array** (20 flower objects with `id`, `name`, `img`, `meaning`, `encouragement`, `mood`)
- Built two rendering functions:
  - `renderPalette(FLOWERS)` — generates draggable flower chips
  - `renderModals(FLOWERS)` — generates the meaning pop-up modals
- Replaced all static HTML chips & modals with JS-generated elements
- Verified that dynamic elements still work with:
  - Drag & drop into vase
  - Selection / scaling / z-index / deletion
  - Result page rendering
  - Share page animation
- Updated architecture notes and file structure

### ✔️ Challenges
- Integrating dynamic content with existing drag-and-drop logic
- Positioning modal + toolbars consistently after generation
- Ensuring scaling/transform logic still works with dynamically created nodes

### ✔️ What I plan for next week
- Add search/filter for flowers
- Improve ARIA labels for modals and draggable elements
- Begin responsive adjustments for mobile screens

---

# 🏗️ Architecture Decision  
**Option B — Single Page with Section Switching**

This project is best represented as a **state-driven experience**, not a multi-page site.  
Flower arrangements, drag state, tool position, and animated share bubbles should persist without page reloads.

### Why this architecture works
- Keeps flower arrangement & animations in memory  
- Fast transitions between views  
- Modals and drag interactions work consistently  
- Simple JavaScript router handles navigation cleanly  

### Sections in Use
- **Home (`#home`)** — drag, scale, reorder flowers  
- **Result (`#result`)** — final bouquet + encouragement  
- **Share (`#share`)** — floating public wall + reactions  
- **Detail (`#detail`)** — single-item view + comment modal  
- **Flower (`#flower`)** — template section  
- **Flower Modals** — now fully generated via JS  

### Navigation Strategy
- Elements use `data-nav="home"` etc.  
- `showView(id)` toggles the `.active` section  
- Hash navigation may be added later for deep links  

### Potential Future Challenges
- State persistence (localStorage or database)
- Performance with large PNGs
- Accessibility for drag + modal semantics
- Responsive layout tuning

---

# 🗂️ Project Structure


### JavaScript Responsibilities (`script.js`)
- Flower data array  
- Dynamic generation of:
  - Palette chips  
  - Meaning modals  
- Drag & drop interactions  
- Selection tools (scale / z-index / delete)  
- Result page rendering  
- Share wall animation + drag + reactions  
- Comment modal for detail page  
- Simple hash-free router  

---

# 🧪 Dynamic Content Example
This project uses JavaScript arrays and loops to dynamically generate all flower elements, replacing the previously static hard-coded HTML. Below are two examples that demonstrate how the data structure works and how the DOM is created.
{
  id: "rose",
  name: "Rose",
  img: "images/rose.png",
  meaning: "Love and courage.",
  encouragement: "Keep tending what matters to you.",
  mood: "strength"
}
Each flower item stores all information needed to generate:
the draggable chip
the flower meaning modal
the result page encouragement
the share-wall mood bubble

The following JavaScript snippet shows how each flower item is converted into a draggable palette chip:

FLOWERS.forEach(item => {
  const chip = document.createElement("div");
  chip.className = "chip";
  chip.draggable = true;
  chip.dataset.name = item.name;
  chip.dataset.src = item.img;

  const img = document.createElement("img");
  img.src = item.img;
  img.alt = item.name;

  chip.appendChild(img);
  palette.appendChild(chip);
});

Summary
This week’s work successfully transitions the project from a static layout to a scalable dynamic system powered by JavaScript arrays.
New flowers or content can now be added simply by editing the data array, and the UI updates automatically.
This greatly improves maintainability and sets a strong foundation for expanding the project.
