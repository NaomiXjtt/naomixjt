/* =========================================================
   Petals of Mind — script.js (full)
   - Data-driven palette + modals (meets assignment)
   - Drag & drop arrange, select, scale, z-index, delete
   - Keyboard shortcuts, tool panel positioning
   - Result page: render final arrangement + encouragement
   - Share page: floating bubbles + reactions
   - Detail modal: open/close
   - Simple view router
   ========================================================= */

/* -------------------- 0) Simple Router -------------------- */
const VIEWS = ["home", "flower", "result", "share", "detail"];
function showView(id) {
  VIEWS.forEach(v =>
    document.getElementById(v)?.classList.toggle("active", v === id)
  );
  if (id === "share") startShare(); else stopShare();
  if (id === "home") requestAnimationFrame(positionToolsNearVase);
}
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-nav]");
  if (!nav) return;
  e.preventDefault();
  showView(nav.getAttribute("data-nav"));
});

/* -------------------- 1) Data Array -------------------- */
const FLOWERS = [
  { id: "camellia",  name: "Camellia",  img: "https://i.postimg.cc/wB0M8j5T/Camilia-no-bg.png",
    meaning: "Steadfast love, admiration, quiet strength.",
    encouragement: "Your calm devotion is enough; keep showing up for yourself, gently and consistently.",
    mood: "comfort" },

  { id: "craneflower", name: "Crane Flower", img: "https://i.postimg.cc/ZqVnt5P0/Crane-flower-no-bg.png",
    meaning: "Celebration, freedom, confident uniqueness.",
    encouragement: "Let your colors show—your differences are your power.",
    mood: "joy" },

  { id: "daisy", name: "Daisy", img: "https://i.postimg.cc/252yRSdy/Daisy-no-bg.png",
    meaning: "Fresh starts, sincerity, simple joy.",
    encouragement: "Start small and honest—clarity grows when you begin.",
    mood: "clarity" },

  { id: "gladioli", name: "Gladioli", img: "https://i.postimg.cc/6QYqJpV3/Gladioli-no-bg.png",
    meaning: "Courage, resilience, integrity.",
    encouragement: "Hold your ground—your values are your compass.",
    mood: "strength" },

  { id: "hyacinth", name: "Hyacinth", img: "https://i.postimg.cc/LsN5K8kn/hyacinth-no-bg.png",
    meaning: "Renewal and heartfelt words.",
    encouragement: "Say what you feel—new growth begins with truth.",
    mood: "renewal" },

  { id: "hydrangea", name: "Hydrangea", img: "https://i.postimg.cc/N0pFqj8y/Hydrangea-no-bg.png",
    meaning: "Gratitude, empathy, layered feelings.",
    encouragement: "Be proud of your depth—your feelings are valid and wise.",
    mood: "calm" },

  { id: "iris", name: "Iris", img: "https://i.postimg.cc/SsRsybVm/Iris-no-bg.png",
    meaning: "Hope and vision; a bridge to clarity.",
    encouragement: "Trust the bigger picture—your path is unfolding.",
    mood: "hope" },

  { id: "jasmine", name: "Jasmine", img: "https://i.postimg.cc/rmsm82gM/Jasmin-no-bg.png",
    meaning: "Comfort, tenderness, faithful affection.",
    encouragement: "Let gentleness be your strength today.",
    mood: "comfort" },

  { id: "lily", name: "Lily", img: "https://i.postimg.cc/85c51gw1/Lily-no-bg.png",
    meaning: "Purity, sincerity, gentle renewal.",
    encouragement: "Breathe—today is allowed to be a clean page.",
    mood: "renewal" },

  { id: "lilyvalley", name: "Lily of the Valley", img: "https://i.postimg.cc/Hxnxp13Y/lily-of-the-valley-no-bg.png",
    meaning: "Humility, comfort, quiet joy.",
    encouragement: "Small, steady kindness counts—toward others and yourself.",
    mood: "comfort" },

  { id: "lotus", name: "Lotus", img: "https://i.postimg.cc/DZ0Z235y/Lotus-no-bg.png",
    meaning: "Resilience and awakening; rising clean from the mud.",
    encouragement: "You are growing even when it feels messy—keep rising.",
    mood: "calm" },

  { id: "narcissus", name: "Narcissus", img: "https://i.postimg.cc/QtCtXZSd/narcissus-no-bg.png",
    meaning: "Self-respect and new beginnings.",
    encouragement: "Choose what nourishes you—new chapters welcome you.",
    mood: "clarity" },

  { id: "nightbloom", name: "Night Blooming Cereus", img: "https://i.postimg.cc/Jn0n1CKh/night-blooming-cereus-no-bg.png",
    meaning: "Rarity and wonder; precious brief moments.",
    encouragement: "Treasure your small wins—brief light still warms.",
    mood: "hope" },

  { id: "orchid", name: "Orchid", img: "https://i.postimg.cc/mDkDbWVD/Orchid-no-ng.png",
    meaning: "Grace and quiet strength.",
    encouragement: "Your softness is not weakness—it’s well-trained strength.",
    mood: "calm" },

  { id: "osmanthus", name: "Osmanthus", img: "https://i.postimg.cc/XJqJV6xq/Osmanthus-no-bg.png",
    meaning: "Warmth, harmony, fragrant memories.",
    encouragement: "Let comfort guide you back to what feels like home.",
    mood: "comfort" },

  { id: "peony", name: "Peony", img: "https://i.postimg.cc/rmsm82gz/peony-no-bg.png",
    meaning: "Prosperity and compassion.",
    encouragement: "There’s room for you to bloom big—take up space kindly.",
    mood: "strength" },

  { id: "rosalia", name: "Rosalia", img: "https://i.postimg.cc/QtCtXZSB/Rosalia-no-bg.png",
    meaning: "Celebration and remembrance.",
    encouragement: "Carry your memories gently—they can coexist with delight.",
    mood: "joy" },

  { id: "rose", name: "Rose", img: "https://i.postimg.cc/85c51gwJ/Roses-no-bg.png",
    meaning: "Love and the courage of the heart.",
    encouragement: "It’s brave to care—keep tending what matters to you.",
    mood: "strength" },

  { id: "sunflower", name: "Sunflower", img: "https://i.postimg.cc/bJrJzfLt/Sunflowers-no-bg.png",
    meaning: "Optimism and loyalty.",
    encouragement: "Look for the warm spot—your attention is a superpower.",
    mood: "joy" },

  { id: "tulips", name: "Tulips", img: "https://i.postimg.cc/B6b6qfN1/Tulips.png",
    meaning: "Sincerity and gentle joy.",
    encouragement: "Let simple joys count—they add up to real balance.",
    mood: "joy" }
];

/* -------------------- 2) Render chips + modals -------------------- */
function renderPalette(data) {
  const grid = document.getElementById("home-palette");
  if (!grid) return;
  grid.innerHTML = "";
  data.forEach(item => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.draggable = true;
    chip.dataset.name = item.name;
    chip.dataset.src  = item.img;
    chip.title = item.name;

    const img = document.createElement("img");
    img.src = item.img; img.alt = item.name; img.draggable = false;

    const info = document.createElement("a");
    info.className = "chip-info";
    info.href = `#m-${item.id}`;
    info.setAttribute("aria-label", `${item.name} meaning`);
    info.draggable = false;
    info.textContent = "i";

    chip.appendChild(img);
    chip.appendChild(info);
    grid.appendChild(chip);
  });
}

function renderModals(data) {
  let mount = document.getElementById("flower-modals");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "flower-modals";
    document.body.appendChild(mount);
  }
  mount.innerHTML = "";

  data.forEach(item => {
    const section = document.createElement("section");
    section.id = `m-${item.id}`;
    section.className = "modal";
    section.setAttribute("role", "dialog");
    section.setAttribute("aria-labelledby", `m-${item.id}-title`);

    section.innerHTML = `
      <a class="modal-scrim" href="#"></a>
      <div class="modal-card">
        <header>
          <h3 id="m-${item.id}-title">${item.name} — ${item.meaning.split(".")[0].toLowerCase()}</h3>
          <a class="close" href="#">×</a>
        </header>
        <div class="body">
          <img src="${item.img}" alt="${item.name}">
          <div class="meta">
            <h4>Meaning</h4><p>${item.meaning}</p>
            <h4>Encouragement</h4><p>${item.encouragement}</p>
          </div>
        </div>
      </div>
    `;
    mount.appendChild(section);
  });
}

/* -------------------- 3) Home interactions -------------------- */
const homeStage   = document.getElementById("home-stage");
const homePalette = document.getElementById("home-palette");
const btnClear    = document.getElementById("btn-clear");
const btnFinish   = document.getElementById("btn-finish");
const tools       = document.getElementById("stageTools");
const vaseImg     = document.querySelector("#home-stage .vase");

let selected = null;
let zCounter = 10;

// Clear / Finish
btnClear?.addEventListener("click", () => {
  [...homeStage.querySelectorAll(".placed")].forEach(el => el.remove());
  setSelected(null);
});
btnFinish?.addEventListener("click", () => {
  buildResultFromHome();
  showView("result");
});

// Drag from palette
homePalette?.addEventListener("dragstart", (e) => {
  const chip = e.target.closest(".chip"); if (!chip) return;
  e.dataTransfer.setData("text/plain", JSON.stringify({
    src: chip.dataset.src, name: chip.dataset.name
  }));
});

homeStage?.addEventListener("dragover", (e) => e.preventDefault());
homeStage?.addEventListener("drop", (e) => {
  e.preventDefault();
  const raw = e.dataTransfer.getData("text/plain");
  if (!raw) return;
  const { src, name } = JSON.parse(raw);
  const rect = homeStage.getBoundingClientRect();
  addPlacedImage({ src, name, x: e.clientX - rect.left, y: e.clientY - rect.top });
});

// selection helpers
function setSelected(el) {
  if (selected && selected.isConnected) selected.classList.remove("selected");
  selected = el || null;
  if (selected) {
    selected.classList.add("selected");
    tools.style.display = "flex";
    updateToolButtons();
    positionToolsNearVase();
  } else {
    tools.style.display = "none";
  }
}

homeStage?.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".placed")) setSelected(null);
});

function addPlacedImage({ src, name, x, y }) {
  const box = document.createElement("div");
  box.className = "placed";
  box.style.left = (x - 90) + "px";   // default width ~180
  box.style.top  = (y - 90) + "px";
  box.style.zIndex = ++zCounter;
  box.dataset.scale = "1";
  box.dataset.src = src;
  box.dataset.name = name || "Flower";

  const img = document.createElement("img");
  img.className = "placed-img";
  img.src = src;
  img.alt = name || "Flower";
  box.appendChild(img);

  homeStage.appendChild(box);

  // select / remove
  box.addEventListener("click", (e) => { e.stopPropagation(); setSelected(box); });
  box.addEventListener("dblclick", () => { if (selected === box) setSelected(null); box.remove(); });

  // wheel scale
  box.addEventListener("wheel", (e) => {
    if (selected !== box) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    scaleSelectedBy(delta);
    positionToolsNearVase();
  }, { passive: false });

  // drag within stage
  enableDragWithin(box, homeStage);
}

function enableDragWithin(el, container) {
  let dragging = false, ox = 0, oy = 0;
  el.style.cursor = "grab";
  el.addEventListener("mousedown", (e) => {
    dragging = true; ox = e.offsetX; oy = e.offsetY; el.style.cursor = "grabbing";
    setSelected(el);
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = container.getBoundingClientRect();
    el.style.left = (e.clientX - rect.left - ox) + "px";
    el.style.top  = (e.clientY - rect.top  - oy) + "px";
  });
  document.addEventListener("mouseup", () => { dragging = false; el.style.cursor = "grab"; });
}

/* ---- tool buttons ---- */
const btnSmaller = document.getElementById("btnSmaller");
const btnBigger  = document.getElementById("btnBigger");
const btnFront   = document.getElementById("btnFront");
const btnBack    = document.getElementById("btnBack");
const btnDelete  = document.getElementById("btnDelete");

btnSmaller?.addEventListener("click", () => scaleSelectedBy(-0.08));
btnBigger ?.addEventListener("click", () => scaleSelectedBy(+0.08));
btnFront  ?.addEventListener("click", () => bringToFront());
btnBack   ?.addEventListener("click", () => sendToBack());
btnDelete ?.addEventListener("click", () => deleteSelected());

function updateToolButtons() {
  const on = !!selected;
  [btnSmaller, btnBigger, btnFront, btnBack, btnDelete].forEach(b => b && (b.disabled = !on));
}

function scaleSelectedBy(delta) {
  if (!selected) return;
  const cur = parseFloat(selected.dataset.scale || "1");
  let next = Math.max(0.4, Math.min(2.6, cur + delta));
  selected.dataset.scale = String(next);
  selected.style.transformOrigin = "center bottom";
  selected.style.transform = `scale(${next})`;
}

function bringToFront() {
  if (!selected) return;
  selected.style.zIndex = ++zCounter;
}
function sendToBack() {
  if (!selected) return;
  const minZ = 2; // vase is 1
  const current = parseInt(selected.style.zIndex || zCounter, 10);
  selected.style.zIndex = Math.max(minZ, current - 10);
}
function deleteSelected() {
  if (!selected) return;
  const n = selected; setSelected(null); n.remove();
}

/* ---- keyboard shortcuts ---- */
document.addEventListener("keydown", (e) => {
  if (!selected) return;
  if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); deleteSelected(); }
  if (e.key === "[") { e.preventDefault(); scaleSelectedBy(-0.08); }
  if (e.key === "]") { e.preventDefault(); scaleSelectedBy(+0.08); }
  if (e.key === ".") { e.preventDefault(); bringToFront(); }
  if (e.key === ",") { e.preventDefault(); sendToBack(); }
});

/* ---- tool panel position (float near vase) ---- */
function positionToolsNearVase() {
  const tools = document.getElementById("stageTools");
  const vase  = document.querySelector("#home-stage .vase");
  if (!tools || !vase) return;
  const stageRect = homeStage.getBoundingClientRect();
  const vaseRect  = vase.getBoundingClientRect();
  let x = vaseRect.right - stageRect.left + 12;
  let y = vaseRect.top   - stageRect.top  + vaseRect.height * 0.35;

  const prev = tools.style.display;
  tools.style.display = "flex";
  const tw = tools.offsetWidth, th = tools.offsetHeight, pad = 8;
  if (x + tw > homeStage.clientWidth - pad) x = Math.max(pad, homeStage.clientWidth - pad - tw);
  if (y + th > homeStage.clientHeight - pad) y = Math.max(pad, homeStage.clientHeight - pad - th);
  if (y < pad) y = pad;

  tools.style.left = x + "px";
  tools.style.top  = y + "px";
  if (!selected) tools.style.display = "none";
}
if (vaseImg && !vaseImg.complete) vaseImg.addEventListener("load", positionToolsNearVase);
else positionToolsNearVase();
window.addEventListener("resize", positionToolsNearVase);

/* -------------------- 4) Result page build -------------------- */
const resultStage = document.getElementById("result-stage");
const resultBubbles = document.getElementById("result-bubbles");
const resultEncText = document.getElementById("result-enc-text");

document.getElementById("btn-save")?.addEventListener("click", () => {
  alert("Save Image (placeholder). You can add html2canvas in the future to export.");
});

/* 将 home-stage 的摆放克隆到 result-stage，并生成文案气泡与鼓励语 */
function buildResultFromHome() {
  // 清空 result
  resultStage.querySelectorAll(".placed").forEach(n => n.remove());
  resultBubbles.innerHTML = "";
  resultEncText.textContent = "";

  // 统计 bouquet 组成（用于文案）
  const counts = {}; // name -> { count, mood, meaning }
  const paletteBySrc = Object.fromEntries(FLOWERS.map(f => [f.img, f]));

  // 克隆元素
  const homeRect = homeStage.getBoundingClientRect();
  const resultRect = resultStage.getBoundingClientRect();
  const scaleX = resultRect.width / homeRect.width;
  const scaleY = resultRect.height / homeRect.height;

  homeStage.querySelectorAll(".placed").forEach(srcEl => {
    const clone = document.createElement("div");
    clone.className = "placed";
    const img = document.createElement("img");
    img.className = "placed-img";
    img.src = srcEl.dataset.src || srcEl.querySelector("img")?.src || "";
    img.alt = srcEl.dataset.name || "Flower";
    clone.appendChild(img);

    // 位置 / 缩放 / 层级
    const left = parseFloat(srcEl.style.left) || 0;
    const top  = parseFloat(srcEl.style.top)  || 0;
    const z    = parseInt(srcEl.style.zIndex|| 10, 10);
    const k    = parseFloat(srcEl.dataset.scale || "1");

    clone.style.left = (left * scaleX) + "px";
    clone.style.top  = (top  * scaleY) + "px";
    clone.style.zIndex = z;
    clone.dataset.scale = k;
    clone.style.transformOrigin = "center bottom";
    clone.style.transform = `scale(${k})`;

    resultStage.appendChild(clone);

    // 统计
    const meta = paletteBySrc[img.src] || {};
    const key = meta.name || img.alt;
    if (!counts[key]) counts[key] = { count: 0, mood: meta.mood || "calm", meaning: meta.meaning || "" };
    counts[key].count++;
  });

  // 选出出现次数最多的 3 种花，生成气泡
  const top3 = Object.entries(counts)
    .sort((a,b) => b[1].count - a[1].count)
    .slice(0,3);

  top3.forEach(([name, data], idx) => {
    const bubble = document.createElement("section");
    bubble.className = "bubble dyn";
    bubble.style.setProperty("--i", idx+1); // 若你的 CSS 用到
    const p = document.createElement("p");
    p.style.margin = "0";
    p.textContent = `${name}: ${data.meaning || "—"}`;
    bubble.appendChild(p);
    resultBubbles.appendChild(bubble);
  });

  // 生成 Encouragement（根据主导情绪）
  const moodScores = {};
  Object.values(counts).forEach(v => {
    moodScores[v.mood] = (moodScores[v.mood] || 0) + v.count;
  });
  const mainMood = Object.entries(moodScores).sort((a,b)=>b[1]-a[1])[0]?.[0] || "calm";
  const moodToEnc = {
    calm:   "Your bouquet carries steadiness and peace. Trust the gentle pace—you’re already moving.",
    joy:    "This bouquet radiates bright, playful energy. Let yourself celebrate small wins today.",
    renewal:"I see fresh air and clean pages here. Breathe in, and begin from where you are.",
    strength:"There’s firm ground under you. Your values and courage keep the shape together.",
    clarity:"Simple truths shine in your bouquet. Naming what matters will keep you focused.",
    hope:   "Light gathers at the edges. Keep orienting toward what warms and guides you.",
    comfort:"Soft presence and care weave this together. Be kind to yourself like you are to others."
  };
  resultEncText.textContent = moodToEnc[mainMood] || moodToEnc.calm;
}

/* -------------------- 5) Share page (floating bubbles) -------------------- */
let shareTicking = false, shareAnimId = null;
const wall = document.getElementById("share-wall");

document.getElementById("btn-add")?.addEventListener("click", () => createBubble());

function rnd(min, max) { return Math.random() * (max - min) + min; }
function uid() { return Math.random().toString(36).slice(2, 9); }

function createBubble(opts = {}) {
  const b = document.createElement("div");
  b.className = "bubble"; b.dataset.id = uid();
  const W = wall.clientWidth, H = wall.clientHeight;
  const s = opts.size ?? rnd(140, 190);
  b.style.width = b.style.height = s + "px";
  b.style.left = (opts.x ?? rnd(0, W - s)) + "px";
  b.style.top  = (opts.y ?? rnd(0, H - s)) + "px";
  b.innerHTML = `
    <div class="thumb" aria-hidden="true">Art</div>
    <div class="label">${opts.title || "User’s Work"}</div>
    <div class="reactions">
      <div class="react like" role="button" aria-pressed="false" aria-label="Like"><span>👍</span><span class="count">${opts.likes || 0}</span></div>
      <div class="react fav" role="button" aria-pressed="false" aria-label="Favorite"><span>💗</span><span class="count">${opts.favs || 0}</span></div>
    </div>
  `;
  b.querySelector(".like").addEventListener("click", (e) => { e.stopPropagation(); toggleReact(e.currentTarget); });
  b.querySelector(".fav").addEventListener("click",  (e) => { e.stopPropagation(); toggleReact(e.currentTarget); });
  b.addEventListener("click", () => showView("detail"));
  enableDragBubble(b);
  b._vx = rnd(-0.15, 0.15); b._vy = rnd(-0.2, -0.05);
  wall.appendChild(b);
  return b;
}

function toggleReact(el) {
  const cnt = el.querySelector(".count");
  const active = el.classList.toggle("active");
  el.setAttribute("aria-pressed", active ? "true" : "false");
  cnt.textContent = Math.max(0, (+cnt.textContent) + (active ? 1 : -1));
}

function enableDragBubble(el) {
  let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
  el.style.cursor = "grab";
  el.addEventListener("pointerdown", (e) => {
    dragging = true; el.setPointerCapture(e.pointerId);
    sx = e.clientX; sy = e.clientY;
    const r = el.getBoundingClientRect(), wr = wall.getBoundingClientRect();
    sl = r.left - wr.left; st = r.top - wr.top;
    el.style.cursor = "grabbing"; el._dragHold = true;
  });
  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy, w = wall.clientWidth, h = wall.clientHeight, s = el.offsetWidth;
    el.style.left = Math.max(0, Math.min(sl + dx, w - s)) + "px";
    el.style.top  = Math.max(0, Math.min(st + dy, h - s)) + "px";
  });
  el.addEventListener("pointerup", (e) => {
    dragging = false; el.releasePointerCapture(e.pointerId); el.style.cursor = "grab"; requestAnimationFrame(() => el._dragHold = false);
  });
  el.addEventListener("pointercancel", () => { dragging = false; el.style.cursor = "grab"; el._dragHold = false; });
}

function shareTick() {
  if (!shareTicking) return;
  const W = wall.clientWidth, H = wall.clientHeight;
  wall.querySelectorAll(".bubble").forEach(b => {
    if (b._dragHold) return;
    const s = b.offsetWidth; let x = parseFloat(b.style.left), y = parseFloat(b.style.top);
    x += b._vx; y += b._vy;
    if (x < -s*0.05) x = W - s*0.95; if (x > W - s*0.95) x = -s*0.05;
    if (y < -s*0.2)  y = H - s*0.8;  if (y > H - s*0.8)  y = -s*0.2;
    b.style.left = x + "px"; b.style.top = y + "px";
  });
  shareAnimId = requestAnimationFrame(shareTick);
}

function startShare() {
  if (shareTicking) return;
  shareTicking = true;
  if (!wall.querySelector(".bubble")) {
    for (let i = 0; i < 10; i++) {
      createBubble({ title: "User’s Work", likes: Math.floor(Math.random() * 10), favs: Math.floor(Math.random() * 8) });
    }
  }
  shareAnimId = requestAnimationFrame(shareTick);
}
function stopShare() {
  shareTicking = false;
  if (shareAnimId) { cancelAnimationFrame(shareAnimId); shareAnimId = null; }
}

/* -------------------- 6) Detail modal -------------------- */
const detailModal = document.getElementById("detail-modal");
document.getElementById("btn-leave")?.addEventListener("click", () => {
  detailModal.style.display = "block"; detailModal.setAttribute("aria-hidden", "false");
});
document.getElementById("btn-close")?.addEventListener("click", () => {
  detailModal.style.display = "none"; detailModal.setAttribute("aria-hidden", "true");
});

/* -------------------- 7) Init -------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderPalette(FLOWERS);
  renderModals(FLOWERS);
  // 初始视图（如果你的 HTML 默认已显示 .active，可不用）
  // showView("home");
});
