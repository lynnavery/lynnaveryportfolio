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

// ——— Lynn Avery ellipse glitch (symbols then decode back to letters) ———
const GLITCH_TARGET_TEXT = "lynn avery";
/** How often we glitch a new letter: random between min and max (ms). */
const GLITCH_TRIGGER_INTERVAL_MIN_MS = 400;
const GLITCH_TRIGGER_INTERVAL_MAX_MS = 1020;
/** How long each letter stays as a symbol: random between min and max (ms). */
const GLITCH_DURATION_MIN_MS = 10;
const GLITCH_DURATION_MAX_MS = 800;
/** Chance (0–1) that a glitch is a flicker (several quick symbol flashes) instead of one hold. */
const GLITCH_FLICKER_CHANCE = 0.08;
/** Flicker: symbol visible (ms) and gap before next flash (ms). */
const GLITCH_FLICKER_ON_MS = 55;
const GLITCH_FLICKER_OFF_MS = 45;
/** Number of symbol flashes in one flicker. */
const GLITCH_FLICKER_STEPS = 3;
/**
 * Symbols to show instead of letters.
 * Keep these as single-codepoint characters so they don't change the string length
 * (which would otherwise shift the rest of the letters along the ellipse).
 */
const GLITCH_SYMBOLS = ["♣"];

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

/**
 * Randomly glitch letters in the ellipse text to symbols, then decode back.
 * Uses GLITCH_* config at top of file.
 */
function startEllipseGlitch(svgEl) {
  const textPaths = svgEl && svgEl.querySelectorAll("textPath");
  if (!textPaths || textPaths.length === 0) return;

  const len = GLITCH_TARGET_TEXT.length;
  /** For each index: null = show letter, or { symbol, until } = show symbol until time */
  const state = Array(len).fill(null);

  function pickRandomSymbol() {
    // Prefer single-code-unit symbols so the overall string length stays constant
    const singleUnit = GLITCH_SYMBOLS.filter(s => typeof s === "string" && s.length === 1);
    const pool = singleUnit.length ? singleUnit : GLITCH_SYMBOLS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function buildDisplayString() {
    const now = Date.now();
    let out = "";
    for (let i = 0; i < len; i++) {
      const s = state[i];
      if (s && now < s.until) out += s.symbol;
      else {
        if (s) state[i] = null;
        out += GLITCH_TARGET_TEXT[i];
      }
    }
    return out;
  }

  function updateDisplay() {
    const str = buildDisplayString();
    textPaths.forEach((tp) => { tp.textContent = str; });
  }

  function triggerOneGlitch() {
    const indices = [];
    for (let i = 0; i < len; i++) {
      if (state[i] === null && GLITCH_TARGET_TEXT[i] !== " ") indices.push(i);
    }
    if (indices.length > 0) {
      const i = indices[Math.floor(Math.random() * indices.length)];
      const isFlicker = Math.random() < GLITCH_FLICKER_CHANCE;

      if (isFlicker) {
        function doFlickerStep(step) {
          if (step <= 0) return;
          state[i] = {
            symbol: pickRandomSymbol(),
            until: Date.now() + GLITCH_FLICKER_ON_MS
          };
          setTimeout(() => {
            doFlickerStep(step - 1);
          }, GLITCH_FLICKER_ON_MS + GLITCH_FLICKER_OFF_MS);
        }
        doFlickerStep(GLITCH_FLICKER_STEPS);
      } else {
        const duration =
          GLITCH_DURATION_MIN_MS +
          Math.random() * (GLITCH_DURATION_MAX_MS - GLITCH_DURATION_MIN_MS);
        state[i] = {
          symbol: pickRandomSymbol(),
          until: Date.now() + duration
        };
      }
    }

    const nextMs =
      GLITCH_TRIGGER_INTERVAL_MIN_MS +
      Math.random() * (GLITCH_TRIGGER_INTERVAL_MAX_MS - GLITCH_TRIGGER_INTERVAL_MIN_MS);
    setTimeout(triggerOneGlitch, nextMs);
  }

  triggerOneGlitch();

  const updateInterval = 50;
  setInterval(updateDisplay, updateInterval);
  updateDisplay();
}

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
      text: GLITCH_TARGET_TEXT,
      textProperties: { fontSize: "2em" }
    });
    startEllipseGlitch(ellipseSvg);
  }

  loadContent(getPage());
  window.addEventListener('hashchange', () => loadContent(getPage()));
});
