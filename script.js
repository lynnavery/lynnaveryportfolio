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

const PAGES = { bio: 'bio', works: 'works', live: 'live', press: 'press', contact: 'contact' };

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

async function loadContent(page) {
  const file = `content/${page}.html`;
  const url = `${file}?v=${__CACHE_VERSION}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load content');
    const html = await response.text();

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = html;

      if (page === 'works') {
        mainContent.querySelectorAll('details').forEach(d => d.setAttribute('open', ''));
      }
    }
    setActiveNav(page);
    document.title = page === 'bio' ? 'Lynn Avery' : `Lynn Avery - ${page.charAt(0).toUpperCase() + page.slice(1)}`;
  } catch (error) {
    console.error('Error loading content:', error);
    const mainContent = document.getElementById('main-content');
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

  loadContent(getPage());
  window.addEventListener('hashchange', () => loadContent(getPage()));
});
