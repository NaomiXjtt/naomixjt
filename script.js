/* =======================
   Petals of Mind — core
   ======================= */

/* Flower data (you can keep extending) */
const FLOWER_DATA = {
  Camellia: {
    meaning: "Steadfast love, admiration, quiet strength.",
    enc: "Your calm devotion is enough; keep showing up for yourself."
  },
  Daisy: {
    meaning: "Fresh starts, sincerity, simple joy.",
    enc: "Start small and honest—clarity grows when you begin."
  }
  // … add more flowers here if you like
};

/* ---------- Global state ---------- */

let currentArrangement = [];
let currentUsedFlowers = [];
let currentSnapshot = "";     // PNG dataURL of the current bouquet

let selected = null;
let zCounter = 20;

/* Diary data */
let diaryItems = [];
let currentDetailId = null;

/* Small helpers */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function formatDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* =======================
   Simple view router
   ======================= */

const views = ["home", "flower", "result", "share", "detail"];

function showView(id) {
  views.forEach(v => {
    const el = document.getElementById(v);
    if (!el) return;
    el.classList.toggle("active", v === id);
  });

  if (id === "home") {
    requestAnimationFrame(positionToolsNearVase);
  }
  if (id === "share") {
    buildDiaryList();
  }
}

document.querySelectorAll("[data-nav]").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    const target = a.getAttribute("data-nav");
    showView(target);
  });
});

/* =======================
   HOME: drag & flower ops
   ======================= */

const homeStage   = document.getElementById("home-stage");
const homePalette = document.getElementById("home-palette");
const btnClear    = document.getElementById("btn-clear");
const btnFinish   = document.getElementById("btn-finish");
const tools       = document.getElementById("stageTools");

/* Prevent tools from triggering stage mousedown */
if (tools) {
  tools.addEventListener("mousedown", e => {
    e.stopPropagation();
  });
}

/* ----- Clear / Finish ----- */

if (btnClear) {
  btnClear.addEventListener("click", () => {
    [...homeStage.querySelectorAll(".placed")].forEach(el => el.remove());
    setSelected(null);
    currentArrangement = [];
    currentUsedFlowers = [];
    currentSnapshot = "";
  });
}

/* Finish = capture arrangement + snapshot then go to Result */
if (btnFinish) {
  btnFinish.addEventListener("click", async () => {
    const placed = homeStage.querySelectorAll(".placed");
    if (!placed.length) {
      alert("Try adding some flowers to the vase first ✿");
      return;
    }

    // 1. record positions + flowers
    captureArrangement();

    // 2. take snapshot with html2canvas
    try {
      const canvas = await html2canvas(homeStage, {
        backgroundColor: '#F6ECD9',  // ✅ 不再透明，避免把 body 背景截进去
        useCORS: true,
        scale: 2
      });
      currentSnapshot = canvas.toDataURL("image/png");
      const resultImg = document.getElementById("result-img");
      if (resultImg) {
        resultImg.src = currentSnapshot;
      }
    } catch (err) {
      console.error("Snapshot failed:", err);
      currentSnapshot = "";
    }

    // 3. build encouragement text + show Result
    buildResultView();
    showView("result");
  });
}

/* ----- Dragging from palette ----- */

if (homePalette) {
  homePalette.addEventListener("dragstart", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        src: chip.dataset.src,
        name: chip.dataset.name
      })
    );
  });
}

if (homeStage) {
  homeStage.addEventListener("dragover", e => e.preventDefault());

  homeStage.addEventListener("drop", e => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;
    const { src, name } = JSON.parse(raw);
    const rect = homeStage.getBoundingClientRect();
    addPlacedImage({
      src,
      name,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  });

  // click blank stage to clear selection (clicking tools does nothing)
  homeStage.addEventListener("mousedown", e => {
    if (e.target.closest("#stageTools")) return;
    if (!e.target.closest(".placed")) {
      setSelected(null);
    }
  });
}

/* =======================
   selection / transform / z-index
   ======================= */

function applyTransform(box) {
  const scale = parseFloat(box.dataset.scale || "1");
  const rot   = parseFloat(box.dataset.rotation || "0");
  box.style.transformOrigin = "50% 100%";
  box.style.transform = `scale(${scale}) rotate(${rot}deg)`;
}

function setSelected(el) {
  if (selected && selected.isConnected) {
    selected.classList.remove("selected");
  }
  selected = el;
  if (selected) {
    selected.classList.add("selected");
    if (tools) {
      tools.style.display = "flex";
      updateToolButtons();
      positionToolsNearVase();
    }
  } else if (tools) {
    tools.style.display = "none";
  }
}

/* Create one placed flower */

function addPlacedImage({ src, name, x, y }) {
  const box = document.createElement("div");
  box.className = "placed";
  box.style.position = "absolute";
  box.style.left = x - 90 + "px";
  box.style.top  = y - 90 + "px";
  box.style.zIndex = ++zCounter;
  box.dataset.scale    = "1";
  box.dataset.rotation = "0";

  const img = document.createElement("img");
  img.className = "placed-img";
  img.src = src;
  img.alt = name || "Flower";
  box.appendChild(img);

  applyTransform(box);
  homeStage.appendChild(box);

  box.addEventListener("click", e => {
    e.stopPropagation();
    setSelected(box);
  });

  box.addEventListener("dblclick", () => {
    if (selected === box) setSelected(null);
    box.remove();
  });

  // wheel to scale
  box.addEventListener(
    "wheel",
    e => {
      if (selected !== box) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      scaleSelectedBy(delta);
      positionToolsNearVase();
    },
    { passive: false }
  );

  enableDragWithin(box, homeStage);
}

/* Drag logic */

function enableDragWithin(el, container) {
  let dragging = false;
  let ox = 0, oy = 0;

  el.addEventListener("mousedown", e => {
    dragging = true;
    ox = e.offsetX;
    oy = e.offsetY;
    el.style.cursor = "grabbing";
    if (container === homeStage) {
      setSelected(el);
    }
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    const rect = container.getBoundingClientRect();
    el.style.left = e.clientX - rect.left - ox + "px";
    el.style.top  = e.clientY - rect.top  - oy + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    el.style.cursor = "grab";
  });
}

/* =======================
   tools binding
   ======================= */

const btnSmaller     = document.getElementById("btnSmaller");
const btnBigger      = document.getElementById("btnBigger");
const btnRotateLeft  = document.getElementById("btnRotateLeft");
const btnRotateRight = document.getElementById("btnRotateRight");
const btnFront       = document.getElementById("btnFront");
const btnBack        = document.getElementById("btnBack");
const btnDelete      = document.getElementById("btnDelete");

if (btnSmaller)     btnSmaller.addEventListener("click", () => scaleSelectedBy(-0.08));
if (btnBigger)      btnBigger .addEventListener("click", () => scaleSelectedBy(+0.08));
if (btnRotateLeft)  btnRotateLeft .addEventListener("click", () => rotateSelectedBy(-15));
if (btnRotateRight) btnRotateRight.addEventListener("click", () => rotateSelectedBy(+15));
if (btnFront)       btnFront  .addEventListener("click", () => bringToFront());
if (btnBack)        btnBack   .addEventListener("click", () => sendToBack());
if (btnDelete)      btnDelete .addEventListener("click", () => deleteSelected());

function updateToolButtons() {
  const on = !!selected;
  [
    btnSmaller,
    btnBigger,
    btnRotateLeft,
    btnRotateRight,
    btnFront,
    btnBack,
    btnDelete
  ].forEach(b => {
    if (!b) return;
    b.disabled = !on;
  });
}

/* scale */

function scaleSelectedBy(delta) {
  if (!selected) return;
  const cur = parseFloat(selected.dataset.scale || "1");
  const next = Math.max(0.4, Math.min(2.6, cur + delta));
  selected.dataset.scale = String(next);
  applyTransform(selected);
}

/* rotate */

function rotateSelectedBy(deltaDeg) {
  if (!selected) return;
  const cur = parseFloat(selected.dataset.rotation || "0");
  const next = cur + deltaDeg;
  selected.dataset.rotation = String(next);
  applyTransform(selected);
}

/* z-index */

function bringToFront() {
  if (!selected) return;
  selected.style.zIndex = ++zCounter;
}

function sendToBack() {
  if (!selected) return;
  const others = [...homeStage.querySelectorAll(".placed")].filter(
    el => el !== selected
  );
  const minZ = others.length
    ? Math.min(...others.map(el => parseInt(el.style.zIndex || "20", 10)))
    : 1;
  selected.style.zIndex = minZ - 1;
}

/* delete */

function deleteSelected() {
  if (!selected) return;
  const node = selected;
  setSelected(null);
  node.remove();
}

/* keyboard shortcuts */

document.addEventListener("keydown", e => {
  if (!selected) return;

  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    deleteSelected();
  }
  if (e.key === "[") {
    e.preventDefault();
    scaleSelectedBy(-0.08);
  }
  if (e.key === "]") {
    e.preventDefault();
    scaleSelectedBy(+0.08);
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    rotateSelectedBy(-5);
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    rotateSelectedBy(+5);
  }
});

/* =======================
   Tool position near vase
   ======================= */

function positionToolsNearVase() {
  const vase = document.querySelector("#home-stage .vase");
  if (!tools || !vase || !homeStage) return;

  const stageRect = homeStage.getBoundingClientRect();
  const vaseRect  = vase.getBoundingClientRect();

  let x = vaseRect.right - stageRect.left + 12;
  let y = vaseRect.top   - stageRect.top  + vaseRect.height * 0.35;

  tools.style.display = "flex";
  const tw  = tools.offsetWidth;
  const th  = tools.offsetHeight;
  const pad = 8;

  if (x + tw > homeStage.clientWidth - pad)
    x = Math.max(pad, homeStage.clientWidth - pad - tw);
  if (y + th > homeStage.clientHeight - pad)
    y = Math.max(pad, homeStage.clientHeight - pad - th);
  if (y < pad) y = pad;

  tools.style.left = x + "px";
  tools.style.top  = y + "px";

  if (!selected) tools.style.display = "none";
}

const vaseImg = document.querySelector("#home-stage .vase");
if (vaseImg && !vaseImg.complete) {
  vaseImg.addEventListener("load", positionToolsNearVase);
} else {
  positionToolsNearVase();
}
window.addEventListener("resize", positionToolsNearVase);

/* =======================
   Arrangement recording
   ======================= */

const resultEncText = document.getElementById("result-enc-text");

/* Collect current placed flowers from home-stage */
function captureArrangement() {
  const boxes = [...homeStage.querySelectorAll(".placed")];

  currentArrangement = boxes.map(box => {
    const img = box.querySelector("img");
    return {
      src: img.src,
      name: img.alt || "Flower",
      x: parseFloat(box.style.left) || 0,
      y: parseFloat(box.style.top)  || 0,
      scale: parseFloat(box.dataset.scale || "1"),
      rotation: parseFloat(box.dataset.rotation || "0"),
      z: parseInt(box.style.zIndex || "20", 10)
    };
  });

  currentUsedFlowers = [...new Set(currentArrangement.map(f => f.name))];
}

/* Result page: only builds encouragement text now */
function buildResultView() {
  const msgs = currentUsedFlowers
    .map(n => FLOWER_DATA[n]?.enc)
    .filter(Boolean);

  let text;
  if (!msgs.length) {
    text = "You created something uniquely yours. That's already enough.";
  } else if (msgs.length === 1) {
    text = msgs[0];
  } else {
    text = msgs.slice(0, 3).join(" ");
  }

  if (resultEncText) resultEncText.textContent = text;
}

/* =======================
   Bouquet Diary
   ======================= */

const diaryList       = document.getElementById("diary-list");
const btnSaveToDiary  = document.getElementById("btn-save");

const detailView      = document.getElementById("detail");
const detailEncP      = detailView ? detailView.querySelector("#detail-enc") : null;
const detailNoteP     = detailView ? detailView.querySelector("#detail-note") : null;
const detailImg       = document.getElementById("detail-img");

/* Save current bouquet as a diary entry */
function addCurrentToDiary() {
  if (!currentArrangement || !currentArrangement.length) {
    alert("Finish your bouquet first, then save it to your diary ✿");
    return;
  }

  if (!currentSnapshot) {
    alert("Something went wrong with the snapshot. Please try tapping Finish again.");
    return;
  }

  const today   = new Date();
  const dateStr = formatDate(today);
  const label   = `Entry ${diaryItems.length + 1}`;
  const encText = resultEncText ? (resultEncText.textContent || "").trim() : "";

  const snapshotArr = JSON.parse(JSON.stringify(currentArrangement));

  const item = {
    id: uid(),
    label,
    date: dateStr,
    enc: encText || "This bouquet carries a quiet story of care and reflection.",
    note: "",
    snapshot: currentSnapshot,
    arrangement: snapshotArr
  };

  diaryItems.push(item);
  buildDiaryList();
  showView("share");
}

/* Bind Save to Diary button */

if (btnSaveToDiary) {
  btnSaveToDiary.addEventListener("click", () => {
    addCurrentToDiary();
  });
}

/* Build diary list in Share view */

function buildDiaryList() {
  if (!diaryList) return;
  diaryList.innerHTML = "";

  if (!diaryItems.length) {
    diaryList.innerHTML =
      `<p style="font-size:14px; opacity:.8;">No entries yet. Save a bouquet from the Result page to start your diary ✿</p>`;
    return;
  }

  diaryItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "diary-item";
    div.dataset.id = item.id;

    const preview = item.note || item.enc;
    const shortPreview =
      preview.length > 60 ? preview.slice(0, 57) + "..." : preview;

    div.innerHTML = `
      <div class="meta">
        <span class="label">${item.label}</span>
        <span class="date">${item.date}</span>
        <span style="font-size:12px; opacity:.85;">${shortPreview}</span>
      </div>
      <button class="delete-btn" type="button" aria-label="Delete entry">✕</button>
    `;

    div.addEventListener("click", () => openDetail(item.id));

    const delBtn = div.querySelector(".delete-btn");
    delBtn.addEventListener("click", e => {
      e.stopPropagation();
      diaryItems = diaryItems.filter(d => d.id !== item.id);

      if (currentDetailId === item.id) {
        currentDetailId = null;
        showView("share");
      }

      buildDiaryList();
    });

    diaryList.appendChild(div);
  });
}

/* Open detail view for a diary entry */

function openDetail(id) {
  const item = diaryItems.find(d => d.id === id);
  if (!item) return;

  currentDetailId = item.id;

  if (detailEncP) {
    detailEncP.textContent = item.enc;
  }
  if (detailNoteP) {
    detailNoteP.textContent = item.note || "(No diary written yet.)";
  }

  if (detailImg) {
    if (item.snapshot) {
      detailImg.src = item.snapshot;
    } else {
      detailImg.removeAttribute("src");
      detailImg.alt = "No snapshot available.";
    }
  }

  showView("detail");
}

/* =======================
   Diary modal
   ======================= */

const detailModal   = document.getElementById("detail-modal");
const btnWrite      = document.getElementById("btn-write");
const btnClose      = document.getElementById("btn-close");
const btnPost       = document.getElementById("btn-post");
const diaryTextarea = document.getElementById("diary-text");

if (btnWrite && detailModal) {
  btnWrite.addEventListener("click", () => {
    if (!currentDetailId) return;
    const item = diaryItems.find(d => d.id === currentDetailId);
    if (item && diaryTextarea) {
      diaryTextarea.value = item.note || "";
    }
    detailModal.style.display = "block";
  });
}
if (btnClose && detailModal) {
  btnClose.addEventListener("click", () => {
    detailModal.style.display = "none";
  });
}
if (btnPost && detailModal && diaryTextarea) {
  btnPost.addEventListener("click", () => {
    if (!currentDetailId) return;
    const item = diaryItems.find(d => d.id === currentDetailId);
    if (!item) return;

    const text = diaryTextarea.value.trim();
    item.note = text;

    if (detailNoteP) {
      detailNoteP.textContent = text || "(No diary written yet.)";
    }

    buildDiaryList();
    detailModal.style.display = "none";
  });
}

/* Initial diary state */
buildDiaryList();
