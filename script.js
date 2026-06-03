document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const GALLERY_IMAGES = [
  "IMG-20260523-WA0022.jpg",
  "IMG-20260523-WA0027.jpg",
  "IMG-20260523-WA0029.jpg",
  "IMG-20260523-WA0031.jpg",
  "IMG-20260523-WA0032.jpg",
  "IMG-20260523-WA0033.jpg",
  "IMG-20260523-WA0034.jpg",
  "IMG-20260523-WA0035.jpg",
  "IMG-20260523-WA0036.jpg",
  "IMG-20260523-WA0037.jpg",
  "IMG-20260523-WA0038.jpg",
  "IMG-20260523-WA0039.jpg",
  "IMG-20260523-WA0040.jpg",
  "IMG-20260523-WA0041.jpg",
  "IMG-20260523-WA0042.jpg",
  "IMG-20260523-WA0043.jpg",
  "IMG-20260523-WA0068.jpg",
  "IMG-20260523-WA0069.jpg",
  "IMG-20260523-WA0070.jpg",
  "IMG-20260523-WA0074.jpg",
  "IMG-20260523-WA0075.jpg",
  "IMG-20260523-WA0077.jpg",
  "IMG-20260523-WA0079.jpg",
  "IMG-20260523-WA0080.jpg",
  "IMG-20260523-WA0081.jpg",
  "IMG-20260523-WA0082.jpg",
  "IMG-20260523-WA0083.jpg",
  "IMG-20260523-WA0084.jpg",
  "IMG-20260523-WA0085.jpg",
  "IMG-20260523-WA0086.jpg",
  "IMG-20260523-WA0087.jpg",
  "IMG-20260523-WA0088.jpg",
  "IMG-20260523-WA0089.jpg",
  "IMG-20260523-WA0090.jpg",
  "IMG-20260523-WA0091.jpg",
  "IMG-20260523-WA0092.jpg",
  "IMG-20260523-WA0093.jpg",
  "IMG-20260523-WA0094.jpg",
  "IMG-20260523-WA0095.jpg",
  "IMG-20260523-WA0096.jpg",
  "IMG-20260523-WA0097.jpg",
  "IMG-20260523-WA0098.jpg",
  "IMG-20260523-WA0100.jpg",
  "IMG-20260523-WA0101.jpg",
  "IMG-20260523-WA0102.jpg",
  "IMG-20260523-WA0103.jpg",
  "IMG-20260523-WA0104.jpg",
  "IMG-20260523-WA0105.jpg",
  "IMG-20260523-WA0106.jpg",
];

const INITIAL_GALLERY = 9;

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#nav");
const navBackdrop = document.querySelector("#navBackdrop");
const header = document.querySelector("#header");
const scrollBar = document.querySelector(".scroll-progress__bar");
const backTop = document.querySelector("#backTop");
const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
const sections = navLinks
  .map((link) => {
    const id = link.getAttribute("href")?.slice(1);
    return id ? document.getElementById(id) : null;
  })
  .filter(Boolean);

function setNav(open) {
  if (!navToggle || !nav) return;
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("nav-open", open);
  if (navBackdrop) {
    navBackdrop.hidden = !open;
    navBackdrop.classList.toggle("is-visible", open);
    navBackdrop.setAttribute("aria-hidden", String(!open));
  }
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    setNav(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", (e) => {
    if (e.target instanceof HTMLAnchorElement) setNav(false);
  });

  navBackdrop?.addEventListener("click", () => setNav(false));

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNav(false);
  });
}

function updateScrollUI() {
  const scrollY = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (scrollY / max) * 100 : 0;

  if (scrollBar) scrollBar.style.width = `${progress}%`;
  if (header) header.classList.toggle("is-scrolled", scrollY > 8);
  if (backTop) backTop.classList.toggle("is-visible", scrollY > 400);
}

let scrollTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScrollUI();
      scrollTicking = false;
    });
  },
  { passive: true }
);
updateScrollUI();

if (backTop) {
  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (sections.length && navLinks.length && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      for (const link of navLinks) {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", active);
        if (link.classList.contains("nav__cta")) continue;
        link.setAttribute("aria-current", active ? "page" : "false");
      }
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.15, 0.4] }
  );
  for (const section of sections) sectionObserver.observe(section);
}

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const revealEls = Array.from(document.querySelectorAll(".reveal"));
if (revealEls.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  for (const el of revealEls) io.observe(el);
} else {
  for (const el of revealEls) el.classList.add("is-visible");
}

/* Gallery */
let lightboxIndex = 0;
let currentGallerySrcs = [];

const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightboxImg");
const lightboxCaption = document.querySelector("#lightboxCaption");

function openLightbox(index) {
  if (!lightbox || !lightboxImg || !currentGallerySrcs.length) return;
  lightboxIndex = index;
  const src = currentGallerySrcs[lightboxIndex];
  lightboxImg.src = src;
  lightboxImg.alt = `Kapena Ni Lelo poultry farm — photo ${lightboxIndex + 1}`;
  if (lightboxCaption) {
    lightboxCaption.textContent = `Photo ${lightboxIndex + 1} of ${currentGallerySrcs.length}`;
  }
  lightbox.showModal();
}

function shiftLightbox(delta) {
  if (!currentGallerySrcs.length) return;
  lightboxIndex = (lightboxIndex + delta + currentGallerySrcs.length) % currentGallerySrcs.length;
  openLightbox(lightboxIndex);
}

function buildGalleryItem(filename, index, lazy) {
  const fig = document.createElement("figure");
  fig.className = "gallery__item";
  fig.tabIndex = 0;
  fig.setAttribute("role", "button");
  fig.setAttribute("aria-label", `View photo ${index + 1}`);

  const img = document.createElement("img");
  const src = `./${filename}`;
  img.src = src;
  img.alt = `Kapena Ni Lelo poultry farm operations — photo ${index + 1}`;
  img.width = 640;
  img.height = 480;
  if (lazy) img.loading = "lazy";
  fig.appendChild(img);

  const open = () => openLightbox(index);
  fig.addEventListener("click", open);
  fig.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });

  return fig;
}

const galleryGrid = document.querySelector("#galleryGrid");
const galleryMore = document.querySelector("#galleryMore");

function renderGallery(count) {
  if (!galleryGrid) return;
  galleryGrid.replaceChildren();
  const slice = GALLERY_IMAGES.slice(0, count);
  currentGallerySrcs = slice.map((f) => `./${f}`);
  slice.forEach((file, i) => {
    galleryGrid.appendChild(buildGalleryItem(file, i, i > 2));
  });
}

if (galleryGrid) {
  renderGallery(INITIAL_GALLERY);
  if (galleryMore && GALLERY_IMAGES.length > INITIAL_GALLERY) {
    galleryMore.hidden = false;
    galleryMore.addEventListener("click", () => {
      galleryMore.disabled = true;
      galleryMore.textContent = "Loading…";
      requestAnimationFrame(() => {
        renderGallery(GALLERY_IMAGES.length);
        galleryMore.hidden = true;
      });
    });
  }
}

if (lightbox) {
  lightbox.querySelector(".lightbox__close")?.addEventListener("click", () => lightbox.close());
  lightbox.querySelector(".lightbox__nav--prev")?.addEventListener("click", () => shiftLightbox(-1));
  lightbox.querySelector(".lightbox__nav--next")?.addEventListener("click", () => shiftLightbox(1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") shiftLightbox(-1);
    if (e.key === "ArrowRight") shiftLightbox(1);
  });
}

/* Product filter */
const productTabs = document.querySelectorAll(".product-tabs__btn");
const productTiles = Array.from(document.querySelectorAll("#productGrid .tile"));

function filterProducts(filter) {
  for (const tab of productTabs) {
    const active = tab.dataset.filter === filter;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  }

  for (const tile of productTiles) {
    const cat = tile.dataset.category || "other";
    const show = filter === "all" || cat === filter;
    tile.classList.toggle("is-hidden", !show);
    tile.style.animation = show ? "stagger-in 0.4s var(--ease) both" : "none";
  }
}

for (const tab of productTabs) {
  tab.addEventListener("click", () => {
    filterProducts(tab.dataset.filter || "all");
  });
}

/* Form */
const quoteForm = document.querySelector("#quoteForm");
const formError = document.querySelector("#formError");

function showFormError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.hidden = !message;
}

function validateForm(form) {
  const name = form.elements.namedItem("name");
  const contact = form.elements.namedItem("contact");
  const message = form.elements.namedItem("message");

  if (!(name instanceof HTMLInputElement)) return false;
  if (!(contact instanceof HTMLInputElement)) return false;
  if (!(message instanceof HTMLTextAreaElement)) return false;

  const nameVal = name.value.trim();
  const contactVal = contact.value.trim();
  const messageVal = message.value.trim();

  if (nameVal.length < 2) {
    showFormError("Please enter your name (at least 2 characters).");
    name.focus();
    return false;
  }

  const hasEmail = /@/.test(contactVal);
  const hasPhone = /[\d+][\d\s\-()]{6,}/.test(contactVal);
  if (contactVal.length < 5 || (!hasEmail && !hasPhone)) {
    showFormError("Please enter a valid phone number or email address.");
    contact.focus();
    return false;
  }

  if (messageVal.length < 10) {
    showFormError("Please describe your request (at least 10 characters).");
    message.focus();
    return false;
  }

  showFormError("");
  return { nameVal, contactVal, messageVal };
}

if (quoteForm) {
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const result = validateForm(form);
    if (!result) return;

    const subject = encodeURIComponent("Kapena Ni Lelo — Quote request");
    const body = encodeURIComponent(
      [
        "Hello Kapena Ni Lelo Poultry Farm,",
        "",
        result.messageVal,
        "",
        `Name: ${result.nameVal}`,
        `Contact: ${result.contactVal}`,
      ].join("\n")
    );

    window.location.href = `mailto:kapananilelo@gmail.com?subject=${subject}&body=${body}`;
  });

  quoteForm.addEventListener("input", () => {
    if (formError && !formError.hidden) showFormError("");
  });
}
