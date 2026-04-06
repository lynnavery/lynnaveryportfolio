// Persisted animation start time so animation progress continues across page loads
const __ANIM_STORAGE_KEY = 'animationStartTs';
let __animStartTs = Number(sessionStorage.getItem(__ANIM_STORAGE_KEY));
if (!__animStartTs) {
    __animStartTs = Date.now();
    sessionStorage.setItem(__ANIM_STORAGE_KEY, String(__animStartTs));
}
const __elapsedMsSinceStart = Date.now() - __animStartTs;

// Cache bust: read ?v= from our own script src (set in index.html); use for content fetches
const __CACHE_VERSION = (function() {
  try {
    var s = document.currentScript && document.currentScript.src;
    var m = s && s.match(/[?&]v=([^&]+)/);
    return m ? m[1] : String(Date.now());
  } catch (e) { return String(Date.now()); }
})();

const PAGES = { bio: 'bio', works: 'works', live: 'live', press: 'press' };

const __contentCache = {};
const __fetchPromises = {};

/**
 * ellipse text
 */
const createAnimation = ({
    duration = 21,
    reversed = false,
    target,
    text,
    textProperties = undefined
  }) => {
    const pathId = `path-${gsap.utils.random(100000, 999999, 1)}`;
    const props = { duration, ease: "none", repeat: -1 };

    gsap.set(target.querySelector("path"), {
      attr: { fill: "none", id: pathId, stroke: "none" }
    });

    target.insertAdjacentHTML(
      "beforeend",
      `
        <text>
          <textPath href='#${pathId}' startOffset="0%">${text}</textPath>
          <textPath href='#${pathId}' startOffset="0%">${text}</textPath>
        </text>
        `
    );

    if (textProperties) {
      gsap.set(target.querySelectorAll("textPath"), textProperties);
    }

    const tweenA = gsap.fromTo(
      target.querySelectorAll("textPath")[0],
      { attr: { startOffset: "0%" } },
      { attr: { startOffset: reversed ? "-100%" : "100%" }, ...props }
    );
    const tweenB = gsap.fromTo(
      target.querySelectorAll("textPath")[1],
      { attr: { startOffset: reversed ? "100%" : "-100%" } },
      { attr: { startOffset: "0%" }, ...props }
    );

    const elapsedSeconds = __elapsedMsSinceStart / 1000;
    const baseProgress = ((elapsedSeconds % duration) / duration + 1) % 1;
    tweenA.progress(baseProgress);
    tweenB.progress(baseProgress);
  };


function getPage() {
  const hash = (window.location.hash || '#bio').slice(1).toLowerCase();
  return PAGES[hash] ? hash : 'bio';
}

function setActiveNav(page) {
  document.querySelectorAll('.site-nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').slice(1).toLowerCase();
    a.classList.toggle('active', href === page);
  });
}

async function fetchPage(page) {
  if (__contentCache[page]) return;
  if (!__fetchPromises[page]) {
    __fetchPromises[page] = (async () => {
      const url = `content/${page}.html?v=${__CACHE_VERSION}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load content');
      const html = await response.text();
      const wrapper = document.createElement('div');
      wrapper.dataset.preloadPage = page;
      wrapper.style.display = 'none';
      wrapper.innerHTML = html;
      wrapper.querySelectorAll('img[src]').forEach(img => { new Image().src = img.getAttribute('src'); });
      const mc = document.getElementById('main-content');
      if (mc) mc.appendChild(wrapper);
      __contentCache[page] = { html, wrapper };
    })();
  }
  return __fetchPromises[page];
}

function applyPage(page, mainContent) {
  const entry = __contentCache[page];
  mainContent.className = `page-content page-${page}`;

  // Show only the current page's wrapper, hide others (never move iframes)
  mainContent.querySelectorAll('[data-preload-page]').forEach(w => {
    w.style.display = w.dataset.preloadPage === page ? '' : 'none';
  });

  if (page === 'works') {
    entry.wrapper.querySelectorAll('details').forEach(d => d.setAttribute('open', ''));
  }
  if (!entry.typeset && typeof typeset === 'function') {
    typeset('[data-preload-page="' + page + '"]');
    entry.typeset = true;
  }
}

async function loadContent(page) {
  const mainContent = document.getElementById('main-content');
  try {
    await fetchPage(page);
    applyPage(page, mainContent);
    setActiveNav(page);
    document.title = page === 'bio' ? 'Lynn Avery' : `Lynn Avery - ${page.charAt(0).toUpperCase() + page.slice(1)}`;
  } catch (error) {
    console.error('Error loading content:', error);
    if (mainContent) mainContent.innerHTML = '<p>Error loading content.</p>';
    setActiveNav(page);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.site-nav a').forEach(a => {
    a.setAttribute('data-text', a.textContent);
  });

  const ellipseSvg = document.querySelector(".ellipse svg");
  if (ellipseSvg) {
    createAnimation({
      duration: 21,
      reversed: true,
      target: ellipseSvg,
      text: "lynn avery",
      textProperties: { fontSize: "2em" }
    });
}

  const currentPage = getPage();
  loadContent(currentPage);
  window.addEventListener('hashchange', () => loadContent(getPage()));

  // Preload all other pages in the background after a short delay
  setTimeout(() => {
    Object.keys(PAGES).filter(p => p !== currentPage).forEach(p => fetchPage(p).catch(() => {}));
  }, 1000);
});
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  header.classList.toggle('wipe-out', window.scrollY > 50);
});

