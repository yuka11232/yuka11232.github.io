document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  if (category) {
    // Find matching chip button
    const chips = document.querySelectorAll(".chip");
    chips.forEach(chip => {
      if (chip.dataset.category === category) {
        // deactivate others
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");

        // trigger your existing filtering logic
        chip.click();
      }
    });
  }
});



const ALL_LOCATIONS = (typeof locations !== "undefined" ? locations : []).map(x => ({
  ...x,
  cat: (x.cat || x.category || "").toString(),
  sub: x.sub || x.location || "",
  photos: Array.isArray(x.photos) && x.photos.length > 0 ? x.photos : (x.image ? [x.image] : []),
}));

let state = { query: "", category: "all", sort: "az", view: "grid" };

const gridEl = document.getElementById("grid");
const countNumberEl = document.getElementById("countNumber");
const sortSelectEl = document.getElementById("sortSelect");
const gridBtnEl = document.getElementById("gridBtn");
const listBtnEl = document.getElementById("listBtn");

const chipsMobile = document.getElementById("chipsMobile");
const chipsDesktop = document.getElementById("chipsDesktop");

const searchMobile = document.getElementById("searchMobile");
const searchDesktop = document.getElementById("searchDesktop");

const backMobile = document.getElementById("backMobile");
const backDesktop = document.getElementById("backDesktop");

const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalDesc = document.getElementById("modalDesc");
const modalLink = document.getElementById("modalLink");
const galleryViewport = document.getElementById("galleryViewport");
const galleryDots = document.getElementById("galleryDots");
const prevImg = document.getElementById("prevImg");
const nextImg = document.getElementById("nextImg");
const closeModalBtn = document.getElementById("closeModal");

let galleryIndex = 0;
let galleryImgs = [];

function applyFilters(items) {
  let out = items;
  if (state.category !== "all") {
    out = out.filter(i => i.cat.toLowerCase() === state.category.toLowerCase());
  }
  if (state.query) {
    const q = state.query.toLowerCase();
    out = out.filter(i => 
      i.title.toLowerCase().includes(q) || 
      i.sub.toLowerCase().includes(q) || 
      i.desc.toLowerCase().includes(q)
    );
  }
  out.sort((a, b) => 
    state.sort === 'az' 
      ? a.title.localeCompare(b.title) 
      : b.title.localeCompare(a.title)
  );
  return out;
}

function updateCount(n) {
  countNumberEl.textContent = n;
}

function render() {
  const items = applyFilters(ALL_LOCATIONS);
  updateCount(items.length);
  gridEl.classList.toggle("list", state.view === "list");
  gridEl.innerHTML = "";
  
  if (!items.length) {
    gridEl.innerHTML = `<div class="about"><h2>No results</h2><p class="muted">Try another search or category.</p></div>`;
    return;
  }
  
  const frag = document.createDocumentFragment();
  items.forEach(item => frag.appendChild(renderCard(item)));
  gridEl.appendChild(frag);
}

function renderCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const image = document.createElement("div");
  image.className = "card-image";
  image.style.backgroundImage = `url(${item.photos[0]})`;

  const overlay = document.createElement("div");
  overlay.className = "card-overlay";

  const badge = document.createElement("div");
  badge.className = "card-badge";
  badge.textContent = item.cat.charAt(0).toUpperCase() + item.cat.slice(1);

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = item.title;

  const loc = document.createElement("p");
  loc.className = "card-location";
  loc.textContent = item.sub;

  const desc = document.createElement("p");
  desc.className = "card-desc";
  desc.textContent = item.desc;

  body.append(title, loc, desc);
  card.append(image, overlay, badge, body);

  card.addEventListener("click", () => openModal(item));

  return card;
}

function openModal(item) {
  if (!modal) return;
  
  modalTitle.textContent = item.title;
  modalSub.textContent = item.sub;
  modalDesc.textContent = item.desc;
  modalLink.href = item.link;

  galleryViewport.innerHTML = "";
  galleryDots.innerHTML = "";
  galleryImgs = item.photos || [];
  galleryIndex = 0;

  galleryImgs.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = i === 0 ? "active" : "";
    img.alt = `${item.title} - Image ${i + 1}`;
    galleryViewport.appendChild(img);

    const dot = document.createElement("button");
    dot.className = i === 0 ? "gallery-dot active" : "gallery-dot";
    dot.setAttribute("aria-label", `View image ${i + 1}`);
    dot.addEventListener("click", () => showGallery(i));
    galleryDots.appendChild(dot);
  });

  if (prevImg && nextImg) {
    prevImg.style.display = galleryImgs.length > 1 ? "grid" : "none";
    nextImg.style.display = galleryImgs.length > 1 ? "grid" : "none";
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

function showGallery(index) {
  galleryIndex = index;
  const imgs = galleryViewport.querySelectorAll("img");
  const dots = galleryDots.querySelectorAll(".gallery-dot");
  imgs.forEach((img, i) => img.classList.toggle("active", i === index));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", closeModal);
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (prevImg) {
  prevImg.addEventListener("click", () => {
    showGallery((galleryIndex - 1 + galleryImgs.length) % galleryImgs.length);
  });
}

if (nextImg) {
  nextImg.addEventListener("click", () => {
    showGallery((galleryIndex + 1) % galleryImgs.length);
  });
}

document.addEventListener("keydown", (e) => {
  if (modal && modal.classList.contains("show")) {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft" && galleryImgs.length > 1) {
      showGallery((galleryIndex - 1 + galleryImgs.length) % galleryImgs.length);
    }
    if (e.key === "ArrowRight" && galleryImgs.length > 1) {
      showGallery((galleryIndex + 1) % galleryImgs.length);
    }
  }
});

function setCategory(cat) {
  state.category = cat;
  [chipsMobile, chipsDesktop].forEach(c => {
    if (!c) return;
    c.querySelectorAll(".chip").forEach(chip => 
      chip.classList.toggle("active", chip.dataset.category === cat)
    );
  });
  render();
}

[chipsMobile, chipsDesktop].forEach(c => {
  if (!c) return;
  c.addEventListener("click", e => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    setCategory(btn.dataset.category);
  });
});

function bindSearch(input) {
  if (!input) return;
  input.addEventListener("input", () => {
    state.query = input.value.trim();
    if (input === searchMobile && searchDesktop && searchDesktop.value !== state.query) {
      searchDesktop.value = state.query;
    }
    if (input === searchDesktop && searchMobile && searchMobile.value !== state.query) {
      searchMobile.value = state.query;
    }
    render();
  });
}

bindSearch(searchMobile);
bindSearch(searchDesktop);

if (sortSelectEl) {
  sortSelectEl.addEventListener("change", () => {
    state.sort = sortSelectEl.value;
    render();
  });
}

function setView(view) {
  state.view = view;
  gridBtnEl.classList.toggle("active", view === "grid");
  listBtnEl.classList.toggle("active", view === "list");
  render();
}

if (gridBtnEl) gridBtnEl.addEventListener("click", () => setView("grid"));
if (listBtnEl) listBtnEl.addEventListener("click", () => setView("list"));

if (backMobile) {
  backMobile.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  });
}

if (backDesktop) {
  backDesktop.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  });
}

render();