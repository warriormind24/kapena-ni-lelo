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
const GALLERY_BATCH_SIZE = 9;

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
  { passive: true },
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
    { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.15, 0.4] },
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
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );
  for (const el of revealEls) io.observe(el);
} else {
  for (const el of revealEls) el.classList.add("is-visible");
}

async function loadLocalFacebookMedia() {
  try {
    const resp = await fetch("./facebook/index.json", { cache: "no-store" });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!data || !Array.isArray(data.posts)) return [];

    const mediaFiles = [];
    for (const post of data.posts) {
      if (Array.isArray(post.mediaUrls)) {
        for (const url of post.mediaUrls) {
          const filename = url.split('/').pop().split('?')[0];
          if (filename) {
            mediaFiles.push(`./facebook/media/${filename}`);
          }
        }
      }
    }
    return mediaFiles;
  } catch (_) {
    return [];
  }
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
  lightboxIndex =
    (lightboxIndex + delta + currentGallerySrcs.length) %
    currentGallerySrcs.length;
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

  // Full initial render only; subsequent loads should append.
  galleryGrid.replaceChildren();

  const slice = GALLERY_IMAGES.slice(0, count);
  currentGallerySrcs = slice.map((f) => `./${f}`);

  slice.forEach((file, i) => {
    // Eager-load only the first row (first 3–4 tiles) for better LCP.
    const eager = i < 4;
    galleryGrid.appendChild(buildGalleryItem(file, i, !eager));
  });
}

function appendGalleryItems(startIndex, endIndex) {
  if (!galleryGrid) return;

  const slice = GALLERY_IMAGES.slice(startIndex, endIndex);
  const start = startIndex;

  // Expand the lightbox sources to match appended items.
  currentGallerySrcs = GALLERY_IMAGES.slice(0, endIndex).map((f) => `./${f}`);

  slice.forEach((file, offset) => {
    const index = start + offset;
    const eager = index < 4;
    galleryGrid.appendChild(buildGalleryItem(file, index, !eager));
  });
}

if (galleryGrid) {
  renderGallery(INITIAL_GALLERY);

  loadLocalFacebookMedia().then((fbMedia) => {
    if (!fbMedia.length || !galleryGrid) return;
    const start = GALLERY_IMAGES.length;
    fbMedia.forEach((src, i) => {
      const fig = document.createElement("figure");
      fig.className = "gallery__item";
      fig.tabIndex = 0;
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", `View media ${start + i + 1}`);

      const isVideo = /\.(mp4|mov|webm)(\?.*)?$/i.test(src) || /\/videos?\//i.test(src);

      if (isVideo) {
        const video = document.createElement("video");
        video.src = src;
        video.controls = true;
        video.preload = "metadata";
        video.style.cssText = "width: 100%; height: auto; border-radius: 12px; cursor: pointer;";
        video.setAttribute("playsinline", "");
        fig.appendChild(video);

        const open = () => {
          currentGallerySrcs = [...currentGallerySrcs, src];
          openLightbox(currentGallerySrcs.length - 1);
        };
        fig.addEventListener("click", open);
        fig.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        });
      } else {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Kapena Ni Lelo poultry farm — Facebook media ${start + i + 1}`;
        img.width = 640;
        img.height = 480;
        img.loading = "lazy";
        fig.appendChild(img);

        const open = () => {
          currentGallerySrcs = [...currentGallerySrcs, src];
          openLightbox(currentGallerySrcs.length - 1);
        };
        fig.addEventListener("click", open);
        fig.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        });
      }

      galleryGrid.appendChild(fig);
      currentGallerySrcs.push(src);
    });
  });

  if (galleryMore && GALLERY_IMAGES.length > INITIAL_GALLERY) {
    galleryMore.hidden = false;

    let loadedCount = INITIAL_GALLERY;

    galleryMore.addEventListener("click", () => {
      galleryMore.disabled = true;
      galleryMore.textContent = "Loading…";

      // Append in batches to avoid expensive DOM rebuilds.
      requestAnimationFrame(() => {
        const nextCount = Math.min(
          GALLERY_IMAGES.length,
          loadedCount + GALLERY_BATCH_SIZE,
        );
        appendGalleryItems(loadedCount, nextCount);
        loadedCount = nextCount;

        if (loadedCount >= GALLERY_IMAGES.length) {
          galleryMore.hidden = true;
          galleryMore.disabled = false;
          galleryMore.textContent = "Show more photos";
        } else {
          galleryMore.disabled = false;
          galleryMore.textContent = "Show more photos";
        }
      });
    });
  }
}

if (lightbox) {
  lightbox
    .querySelector(".lightbox__close")
    ?.addEventListener("click", () => lightbox.close());
  lightbox
    .querySelector(".lightbox__nav--prev")
    ?.addEventListener("click", () => shiftLightbox(-1));
  lightbox
    .querySelector(".lightbox__nav--next")
    ?.addEventListener("click", () => shiftLightbox(1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") shiftLightbox(-1);
    if (e.key === "ArrowRight") shiftLightbox(1);
  });
}

/* News: render embedded Facebook posts supplied by links */
const NEWS_POSTS = [
  {
    url: "https://www.facebook.com/agricoopawards/posts/pfbid02XotytKsRhRdvh7nci3YoZsjtN9P5oMtRHtYiu8cP6KEEamDrtpJprGrcNx5GvkGcl",
    title: "The Poultry Farmer of the Year crown handover",
    content:
      "2025 winner Fenny's Poultry hands the crown to 2026 winner Kapena Ni Lelo / Reuben Ngoma.",
    dateLabel: "7 November 2026",
    mediaUrls: ["./facebook/media/agricoop-awards-2026.jpg"],
    iframe:
      '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fagricoopawards%2Fposts%2Fpfbid02XotytKsRhRdvh7nci3YoZsjtN9P5oMtRHtYiu8cP6KEEamDrtpJprGrcNx5GvkGcl&show_text=true&width=500" width="500" height="859" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
  },
  {
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid0msNQksNjGLefe7HGHNqDjzJ7toLqPRKWjjjvcdMkMFMRsWe6mXWUnmR1StDVAHJwl&id=61552045534404",
    title: "Nevaeh graduates to Grade 1",
    content:
      "Congratulations to Nevaeh The Young Farmer as she graduates from Reception class to Grade 1. The team is proud of you.",
    dateLabel: "October 2026 (approx.)",
    iframe:
      '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0msNQksNjGLefe7HGHNqDjzJ7toLqPRKWjjjvcdMkMFMRsWe6mXWUnmR1StDVAHJwl%26id%3D61552045534404&show_text=true&width=500" width="500" height="441" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
  },
  {
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid0e49Y7oE2Xq69Ug8VTpK9MfuAyCoej7gRP3P2HvFzAhy8qovfTxhb7bbPR7UU8VtXl&id=61552045534404",
    title: "Keeping poultry safe during long-distance delivery",
    content:
      "How we are coping with the heat during long-distance deliveries to help keep the birds in good condition.",
    dateLabel: "October 2026 (approx.)",
    iframe:
      '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0e49Y7oE2Xq69Ug8VTpK9MfuAyCoej7gRP3P2HvFzAhy8qovfTxhb7bbPR7UU8VtXl%26id%3D61552045534404&show_text=true&width=500" width="500" height="609" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
  },
  {
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid09L3C3tzKKsKnV355kBwZnp5YCFA37YAv2ZjrwWm8xvukZfyZr7sbwv8cvPR5Tmufl&id=61552045534404",
    title: "Get advice before investing in poultry",
    content:
      "Consult before investing in poultry. Having money alone is no assurance of success.",
    dateLabel: "Date not listed",
    iframe:
      '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid09L3C3tzKKsKnV355kBwZnp5YCFA37YAv2ZjrwWm8xvukZfyZr7sbwv8cvPR5Tmufl%26id%3D61552045534404&show_text=true&width=500" width="500" height="634" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
  },
  {
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid02KLgVAMc5YwPmqY2LN61MqB9RbMXwdKS1EcdGqgm1y8oCAWCWNpmdQhHkAaLamYjl&id=61552045534404",
    title: "A shout-out from the 2025 poultry award winner",
    content: "Fenny's Poultry, the 2025 Poultry Farmer of the Year, gave us a big hype.",
    dateLabel: "November 2026 (approx.)",
    mediaUrls: ["./facebook/media/agricoop-awards-2026.jpg"],
    iframe:
      '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid02KLgVAMc5YwPmqY2LN61MqB9RbMXwdKS1EcdGqgm1y8oCAWCWNpmdQhHkAaLamYjl%26id%3D61552045534404&show_text=true&width=500" width="500" height="821" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
  },
  {
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid02qMQbUajdKQz4s6jFoEvzafwJqYp1ZA3NBn5ej7HnN24HyfF3AaT2piBiRSrKqcfyl&id=61552045534404",
    title: "Celebrating Poultry Farmer of the Year 2026",
    content:
      "Our youngest team member, Nevaeh The Young Farmer was the happiest to see our Managing Director awarded Poultry Farmer of The Year 2026.",
    dateLabel: "9 November 2026",
    mediaUrls: ["./facebook/media/poultry-farmer-of-the-year-2026.jpg"],
    iframe:
      '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid02qMQbUajdKQz4s6jFoEvzafwJqYp1ZA3NBn5ej7HnN24HyfF3AaT2piBiRSrKqcfyl%26id%3D61552045534404&show_text=true&width=500" width="500" height="609" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
  },
  {
    url: "https://www.facebook.com/reel/2996465130746308/",
    title: "Still celebrating the award",
    content: "We are still feeling the award. Enjoy your weekend, friends.",
    dateLabel: "Date not listed",
    mediaUrls: ["./facebook/media/award-reel-thumbnail.jpg"],
    iframe:
      '<iframe src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2996465130746308%2F&show_text=true&width=267&t=0" width="267" height="591" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>',
  },
  {
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid02r7dwWfQMJi6Mf5bBN7oSYv2Cm4X6t8VfNn34B6q7QyycxrJoJMqGQxGRWQzddpabl&id=61552045534404",
    title: "Keep poultry housing clean and comfortable",
    content:
      "Change bedding regularly. Keeping the poultry house clean and comfortable helps reduce disease outbreaks.",
    dateLabel: "Date not listed",
    iframe:
      '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid02r7dwWfQMJi6Mf5bBN7oSYv2Cm4X6t8VfNn34B6q7QyycxrJoJMqGQxGRWQzddpabl%26id%3D61552045534404&show_text=true&width=500" width="500" height="653" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
  },
  {
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid0pojmNGQFMy4eRQXJ7Jk6kxrimm35GWKEMt6mTZifFn6c2zAxjTCACVx5P18zDGFVl&id=61552045534404",
    title: "Plan for the Christmas and New Year batch",
    content:
      "Christmas and New Year batch is the equaliser. Make sure you grow and sell it well. Happy weekend, farmers.",
    dateLabel: "20 November 2026",
    iframe:
      '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0pojmNGQFMy4eRQXJ7Jk6kxrimm35GWKEMt6mTZifFn6c2zAxjTCACVx5P18zDGFVl%26id%3D61552045534404&show_text=true&width=500" width="500" height="634" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
  },
  {
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid09PKDXydZBAU2XrL7bHUE8MJfowHgtXDN4ZYRdjty2qpjfHgNo1hMzBiMqh8VB7mwl&id=61552045534404",
    title: "Why broiler farmers should avoid credit sales",
    content:
      "For a repeatable broiler cycle, avoid selling on credit unless you can manage it as a business decision.",
    dateLabel: "20 November 2026",
    iframe:
      '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid09PKDXydZBAU2XrL7bHUE8MJfowHgtXDN4ZYRdjty2qpjfHgNo1hMzBiMqh8VB7mwl%26id%3D61552045534404&show_text=true&width=500" width="500" height="392" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>',
  },
];

const NEWS_PAGE_SIZE = 6;
let newsPosts = [];
let renderedNewsCount = 0;

function getNewsTitle(post) {
  const title = String(post.title || "").trim();
  if (title && !/^(facebook post|latest facebook post)$/i.test(title)) {
    return title;
  }

  const content = String(post.content || post.message || "").trim();
  if (!content) return "Facebook update";
  const firstLine = content.split(/[\n.!?]/, 1)[0].trim();
  return firstLine.length > 72 ? `${firstLine.slice(0, 69).trim()}…` : firstLine;
}

function getNewsDate(post) {
  if (post.dateLabel) return post.dateLabel;
  if (!post.created_time) return "Date not listed";
  const date = new Date(post.created_time);
  if (!Number.isFinite(date.getTime())) return "Date not listed";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getFacebookEmbedConfig(post) {
  let src = "";
  let width = 500;
  let height = 560;
  let isVideo = false;

  if (post.iframe) {
    const srcMatch = String(post.iframe).match(
      /<iframe\b[^>]*\bsrc=(["'])(.*?)\1/i,
    );
    if (!srcMatch) {
      console.warn("Facebook embed markup has no iframe source.", post.url);
      return null;
    }

    src = srcMatch[2];
    const widthMatch = String(post.iframe).match(/\bwidth=["'](\d+)["']/i);
    const heightMatch = String(post.iframe).match(/\bheight=["'](\d+)["']/i);
    if (widthMatch) width = Number(widthMatch[1]);
    if (heightMatch) height = Number(heightMatch[1]);
  } else if (post.url) {
    try {
      const postUrl = new URL(post.url);
      const allowedHosts = ["facebook.com", "www.facebook.com", "web.facebook.com"];
      if (postUrl.protocol !== "https:" || !allowedHosts.includes(postUrl.hostname)) {
        console.warn("Skipping Facebook embed for an unsupported URL.", post.url);
        return null;
      }

      isVideo = /\/(?:reel|videos?)(?:\/|$)/i.test(postUrl.pathname);
      const embedUrl = new URL(
        `https://www.facebook.com/plugins/${isVideo ? "video" : "post"}.php`,
      );
      embedUrl.searchParams.set("href", postUrl.href);
      embedUrl.searchParams.set("show_text", "true");
      embedUrl.searchParams.set("width", String(width));
      src = embedUrl.href;
    } catch (error) {
      console.warn("Could not build Facebook embed URL.", error);
      return null;
    }
  } else {
    return null;
  }

  try {
    const embedUrl = new URL(src);
    if (
      embedUrl.protocol !== "https:" ||
      !["www.facebook.com", "web.facebook.com"].includes(embedUrl.hostname) ||
      !/^\/plugins\/(?:post|video)\.php$/.test(embedUrl.pathname)
    ) {
      console.warn("Skipping an unsupported Facebook embed URL.", src);
      return null;
    }
    isVideo = isVideo || embedUrl.pathname.endsWith("/video.php");
  } catch (error) {
    console.warn("Could not parse Facebook embed URL.", error);
    return null;
  }

  if (!Number.isFinite(width) || width < 200 || width > 1000) width = 500;
  if (!Number.isFinite(height) || height < 250 || height > 1600) height = 560;
  return { src, width, height, isVideo };
}

function buildNewsCard(post, postIndex) {
  const card = document.createElement("article");
  card.className = "news-card";

  const title = getNewsTitle(post);
  const mediaUrls = Array.isArray(post.mediaUrls) ? post.mediaUrls : [];
  const videoUrl = mediaUrls.find((src) =>
    /\.(mp4|mov|webm)(\?.*)?$/i.test(src),
  );
  const localVideoThumbnail =
    videoUrl && /^\.\/facebook\/media\/[^?#]+\.(mp4|mov|webm)(\?.*)?$/i.test(videoUrl)
      ? videoUrl.replace(/\.(mp4|mov|webm)(\?.*)?$/i, ".jpg")
      : "";
  const mediaSrc =
    post.thumbnailUrl ||
    mediaUrls.find((src) => !/\.(mp4|mov|webm)(\?.*)?$/i.test(src)) ||
    localVideoThumbnail;
  const hasVideo =
    Boolean(videoUrl) ||
    /\/(?:reel|videos?)(?:\/|$)/i.test(post.url || "");

  const visual = document.createElement("div");
  visual.className = "news-card__visual";
  const showBrandImage = () => {
    visual.classList.add("news-card__visual--brand");
    const brandImage = document.createElement("img");
    brandImage.className = "news-card__brand-image";
    brandImage.src = "./logo.jpeg";
    brandImage.alt = "";
    brandImage.loading = "lazy";
    visual.appendChild(brandImage);
  };
  if (mediaSrc) {
    const image = document.createElement("img");
    image.className = "news-card__image";
    if (mediaSrc === localVideoThumbnail) {
      image.classList.add("news-card__image--video");
    }
    image.src = mediaSrc;
    image.alt = title;
    image.loading = postIndex < 3 ? "eager" : "lazy";
    image.decoding = "async";
    image.addEventListener(
      "error",
      () => {
        console.warn("News image failed to load; showing the farm logo.", mediaSrc);
        image.remove();
        showBrandImage();
      },
      { once: true },
    );
    visual.appendChild(image);
  } else {
    showBrandImage();
  }
  if (hasVideo || !mediaSrc) {
    const visualLabel = document.createElement("span");
    visualLabel.className = "news-card__visual-label";
    visualLabel.textContent = hasVideo ? "Facebook video" : "Facebook update";
    visual.appendChild(visualLabel);
  }

  const body = document.createElement("div");
  body.className = "news-card__body";

  const date = document.createElement("time");
  date.className = "news-card__date";
  date.textContent = getNewsDate(post);
  if (post.created_time) date.dateTime = post.created_time;

  const titleEl = document.createElement("h3");
  titleEl.className = "news-card__title";
  titleEl.textContent = title;

  const contentEl = document.createElement("p");
  contentEl.className = "news-card__content";
  const excerpt = String(
    post.content || post.message || "Open the Facebook post to read the full update.",
  )
    .replace(/\s+/g, " ")
    .trim();
  contentEl.textContent =
    excerpt.length > 150 ? `${excerpt.slice(0, 147).trim()}…` : excerpt;

  body.append(date, titleEl, contentEl);

  const actions = document.createElement("div");
  actions.className = "news-card__actions";
  const embed = getFacebookEmbedConfig(post);
  if (embed) {
    const loadButton = document.createElement("button");
    loadButton.className = "news-card__load";
    loadButton.type = "button";
    loadButton.textContent = embed.isVideo
      ? "Load Facebook video"
      : "Load Facebook post";
    loadButton.setAttribute("aria-expanded", "false");
    const embedId = `news-post-${postIndex}-embed`;
    loadButton.setAttribute("aria-controls", embedId);
    loadButton.addEventListener("click", () => {
      const currentFrame = card.querySelector(`#${embedId}`);
      if (currentFrame) {
        currentFrame.remove();
        loadButton.setAttribute("aria-expanded", "false");
        loadButton.textContent = embed.isVideo
          ? "Load Facebook video"
          : "Load Facebook post";
        return;
      }

      const frame = document.createElement("iframe");
      frame.className = "news-card__iframe";
      frame.id = embedId;
      frame.src = embed.src;
      frame.width = String(embed.width);
      frame.height = String(embed.height);
      frame.title = `${title} — Facebook`;
      frame.loading = "lazy";
      frame.setAttribute("scrolling", "no");
      frame.setAttribute("frameborder", "0");
      frame.setAttribute("allowfullscreen", "true");
      frame.setAttribute(
        "allow",
        "autoplay; clipboard-write; encrypted-media; picture-in-picture",
      );
      card.insertBefore(frame, actions);
      loadButton.setAttribute("aria-expanded", "true");
      loadButton.textContent = "Hide embed";
    });
    actions.appendChild(loadButton);
  }

  if (post.url) {
    const link = document.createElement("a");
    link.className = "news-card__link";
    link.href = post.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View on Facebook";
    actions.appendChild(link);
  }

  card.append(visual, body, actions);
  return card;
}

function renderMoreNews() {
  const grid = document.querySelector("#newsGrid");
  const loadMore = document.querySelector("#newsLoadMore");
  if (!grid) return;

  const nextCount = Math.min(renderedNewsCount + NEWS_PAGE_SIZE, newsPosts.length);
  for (let i = renderedNewsCount; i < nextCount; i += 1) {
    grid.appendChild(buildNewsCard(newsPosts[i], i));
  }
  renderedNewsCount = nextCount;
  if (loadMore) loadMore.hidden = renderedNewsCount >= newsPosts.length;
}

function renderNews(posts) {
  const grid = document.querySelector("#newsGrid");
  if (!grid) return;
  newsPosts = posts;
  renderedNewsCount = 0;
  grid.replaceChildren();
  renderMoreNews();
}

document
  .querySelector("#newsLoadMore")
  ?.addEventListener("click", renderMoreNews);

async function loadLocalFacebookPosts() {
  try {
    const resp = await fetch("./facebook/index.json", { cache: "no-store" });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data || !Array.isArray(data.posts) || data.posts.length === 0) return null;

    return data.posts.map((p) => ({
      url: p.permalink_url || "",
      title: p.title || "",
      content: p.message || p.story || "",
      created_time: p.created_time || "",
      dateLabel: p.dateLabel || "",
      mediaUrls: Array.isArray(p.mediaUrls) ? p.mediaUrls : [],
      thumbnailUrl: p.thumbnailUrl || "",
      iframe: p.iframe || "",
    }));
  } catch (_) {
    return null;
  }
}

// Render initial news posts
// If env/endpoint is configured, fetch newest posts automatically.
async function initNews() {
  const grid = document.querySelector("#newsGrid");
  if (!grid) return;

  let posts = null;

  try {
    const resp = await fetch("/api/facebook-page-posts?limit=25");
    if (resp.ok) {
      const data = await resp.json();
      if (
        data &&
        data.ok === true &&
        Array.isArray(data.posts) &&
        data.posts.length
      ) {
        posts = data.posts.map((p) => ({
          url: p.url,
          title: "",
          content: p.content || "",
          created_time: p.created_time || "",
          mediaUrls: Array.isArray(p.mediaUrls) ? p.mediaUrls : [],
          thumbnailUrl: p.thumbnailUrl || "",
          iframe: p.iframe || "",
        }));
      }
    }
  } catch (_) {
    // fall through
  }

  if (!posts) {
    posts = await loadLocalFacebookPosts();
  }

  if (!posts) {
    renderNews(NEWS_POSTS);
    return;
  }

  renderNews(posts);
}

initNews();

/* Product filter */
const productTabs = document.querySelectorAll(".product-tabs__btn");
const productTiles = Array.from(
  document.querySelectorAll("#productGrid .tile"),
);

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

/* Service filter */
const serviceTabs = document.querySelectorAll(".service-tabs__btn");
const serviceCards = Array.from(
  document.querySelectorAll("#servicesGrid .service-card"),
);

function filterServices(filter) {
  for (const tab of serviceTabs) {
    const active = tab.dataset.serviceFilter === filter;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  }

  for (const card of serviceCards) {
    const type = card.dataset.service || "";
    let show = false;
    if (filter === "all") show = true;
    else if (filter === "soon") show = type === "soon";
    else show = type === filter;

    card.classList.toggle("is-hidden", !show);
    if (show) card.style.animation = "stagger-in 0.4s var(--ease) both";
  }
}

for (const tab of serviceTabs) {
  tab.addEventListener("click", () => {
    filterServices(tab.dataset.serviceFilter || "all");
  });
}

document.querySelectorAll("[data-notify]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const service = btn.getAttribute("data-notify") || "New service";
    const subject = encodeURIComponent(
      `Kapena Ni Lelo — Interest in ${service}`,
    );
    const body = encodeURIComponent(
      [
        "Hello Kapena Ni Lelo Poultry Farm,",
        "",
        `I would like to be notified when "${service}" launches.`,
        "",
        "Name:",
        "Phone or email:",
      ].join("\n"),
    );
    window.location.href = `mailto:kapananilelo@gmail.com?subject=${subject}&body=${body}`;
  });
});

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
      ].join("\n"),
    );

    window.location.href = `mailto:kapananilelo@gmail.com?subject=${subject}&body=${body}`;
  });

  quoteForm.addEventListener("input", () => {
    if (formError && !formError.hidden) showFormError("");
  });
}
