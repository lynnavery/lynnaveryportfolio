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

// Read a CSS color variable as a 6-digit hex (for places CSS can't reach,
// like Bandcamp's player URL and the browser theme-color)
function cssVarHex(name) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000';
  ctx.fillRect(0, 0, 1, 1);
  return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3))
    .map(n => n.toString(16).padStart(2, '0')).join('');
}

let __tones = null;
function tones() {
  if (!__tones) __tones = { ink: cssVarHex('--ink'), paper: cssVarHex('--paper') };
  return __tones;
}
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

    // Respect reduced motion: hold the name still
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      [tweenA, tweenB].forEach(t => reduceMotion.matches ? t.pause() : t.resume());
    };
    syncMotion();
    reduceMotion.addEventListener('change', syncMotion);
  };


function getPage() {
  const hash = (window.location.hash || '#bio').slice(1).toLowerCase();
  return PAGES[hash] ? hash : 'bio';
}

function setActiveNav(page) {
  document.querySelectorAll('.site-nav a, .mini-nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').slice(1).toLowerCase();
    const isCurrent = href === page;
    a.classList.toggle('active', isCurrent);
    if (isCurrent) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
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
      // Bandcamp players take their colors from the URL. Links follow --ink;
      // the player box only comes in light or dark, so pick the one nearer --paper.
      const { ink, paper } = tones();
      const paperIsDark = parseInt(paper.slice(0, 2), 16) * 0.299
        + parseInt(paper.slice(2, 4), 16) * 0.587
        + parseInt(paper.slice(4, 6), 16) * 0.114 < 128;
      wrapper.querySelectorAll('iframe[src*="bandcamp.com/EmbeddedPlayer"]').forEach(f => {
        f.setAttribute('src', f.getAttribute('src')
          .replace(/bgcol=[0-9a-f]{6}/i, `bgcol=${paperIsDark ? '333333' : 'ffffff'}`)
          .replace(/linkcol=[0-9a-f]{6}/i, `linkcol=${ink}`));
      });
      const mc = document.getElementById('main-content');
      if (mc) mc.appendChild(wrapper);
      __contentCache[page] = { html, wrapper };
    })().catch(err => {
      // forget the failed attempt so "try again" really refetches
      delete __fetchPromises[page];
      throw err;
    });
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

  if (!entry.typeset && typeof typeset === 'function') {
    typeset('[data-preload-page="' + page + '"]');
    entry.typeset = true;
  }
}

async function loadContent(page, { focus = false } = {}) {
  const mainContent = document.getElementById('main-content');
  const status = document.getElementById('load-status');
  setActiveNav(page);
  if (status) status.textContent = '';
  // Only say "loading" if it's actually slow
  const slow = setTimeout(() => {
    if (status) status.textContent = 'loading…';
    mainContent.setAttribute('aria-busy', 'true');
  }, 400);
  try {
    await fetchPage(page);
    if (page !== getPage()) return; // visitor already moved on
    applyPage(page, mainContent);
    if (status) status.textContent = '';
    document.title = page === 'bio' ? 'Lynn Avery' : `Lynn Avery - ${page.charAt(0).toUpperCase() + page.slice(1)}`;
    if (focus) mainContent.focus({ preventScroll: true });
  } catch (error) {
    console.error('Error loading content:', error);
    if (page !== getPage()) return;
    mainContent.querySelectorAll('[data-preload-page]').forEach(w => { w.style.display = 'none'; });
    if (status) status.innerHTML = 'couldn\'t load this page. <button type="button" class="retry">try again</button> or write to <a href="mailto:lynn@pleasecalltobook.com">lynn@pleasecalltobook.com</a>';
  } finally {
    clearTimeout(slow);
    mainContent.removeAttribute('aria-busy');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = `#${tones().paper}`;

  document.querySelectorAll('.site-nav a, .mini-nav a').forEach(a => {
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
  window.addEventListener('hashchange', () => loadContent(getPage(), { focus: true }));

  // Preload all other pages in the background after a short delay
  setTimeout(() => {
    Object.keys(PAGES).filter(p => p !== currentPage).forEach(p => fetchPage(p).catch(() => {}));
  }, 1000);
});
// A compact nav slides in when scrolling back up past the header
let __lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  const miniNav = document.querySelector('.mini-nav');
  const y = window.scrollY;
  if (miniNav) {
    if (y < header.offsetHeight) miniNav.classList.remove('shown');
    else if (y < __lastScrollY - 4) miniNav.classList.add('shown');
    else if (y > __lastScrollY + 4) miniNav.classList.remove('shown');
    // hidden nav stays out of the tab order and away from screen readers
    miniNav.inert = !miniNav.classList.contains('shown');
  }
  __lastScrollY = y;
}, { passive: true });

document.addEventListener('click', e => {
  if (e.target.closest('.retry')) {
    loadContent(getPage(), { focus: true });
    return;
  }
  if (!e.target.closest('.to-top')) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
});

