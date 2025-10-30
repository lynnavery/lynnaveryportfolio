/**
 * Toggle Expand Function
 * A reusable function that expands/collapses content when clicked.
 * 
 * @param {HTMLElement} element - The element that triggers the toggle
 */
// Persisted animation start time so animation progress continues across page loads
const __ANIM_STORAGE_KEY = 'animationStartTs';
let __animStartTs = Number(sessionStorage.getItem(__ANIM_STORAGE_KEY));
if (!__animStartTs) {
    __animStartTs = Date.now();
    sessionStorage.setItem(__ANIM_STORAGE_KEY, String(__animStartTs));
}
const __elapsedMsSinceStart = Date.now() - __animStartTs;
function toggleExpand(element) {
    // Find the expandable content associated with this element
    const section = element.closest('.expandable-section');
    const content = section.querySelector('.expandable-content');
    const indicator = element.querySelector('.toggle-indicator');
    
    // Update the +/- indicator and toggle
    if (content.classList.contains('expanded')) {
        // Collapsing - remove transition for instant collapse
        content.style.transition = 'none';
        content.classList.remove('expanded');
        indicator.textContent = '+';
    } else {
        // Expanding - add transition for smooth expand
        content.style.transition = '';
        content.classList.add('expanded');
        indicator.textContent = '-';
    }
}

/**
 * 
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

    // Keep progress continuous across page loads using persisted start time
    const elapsedSeconds = __elapsedMsSinceStart / 1000;
    const baseProgress = ((elapsedSeconds % duration) / duration + 1) % 1; // safe modulo
    tweenA.progress(baseProgress);
    tweenB.progress(baseProgress);
  };
  
document.addEventListener('DOMContentLoaded', function() {
  const ellipseSvg = document.querySelector(".ellipse svg");
  if (ellipseSvg) {
    createAnimation({
      duration: 21,
      reversed: true,
      target: ellipseSvg,
      text: "lynn avery",
      // textProperties: { fontSize: "19.5px", letterSpacing: "-0.47px" }
      // textProperties: { fontSize: "17px" }
      // Apparently iPhone decides 17px is not 17px 🙃
      textProperties: { fontSize: /iPhone/.test(navigator.userAgent) ? "19px" : "17px" }
    });
  }
  
  // Get the markdown file to load from the script tag's data attribute
  const scriptTag = document.querySelector('script[data-content]');
  const contentFile = scriptTag ? scriptTag.getAttribute('data-content') : 'content.md';
  loadMarkdownContent(contentFile);
});

/**
 * Load and render markdown content
 */
async function loadMarkdownContent(file = 'content.md') {
    try {
        // Configure marked to enable tables
        marked.use({
            breaks: true,
            gfm: true
        });
        
        const response = await fetch(file);
        if (!response.ok) throw new Error('Failed to load markdown content');
        let markdownText = await response.text();
        
        // Process expandable blocks
        const expandedBlocks = [];
        let blockIndex = 0;
        
        // Match expandable blocks
        const blockRegex = /\[\[expandable\]\]\s*\n((?:.|\n)*?)\[\[\/expandable\]\]/g;
        
        markdownText = markdownText.replace(blockRegex, (match, content) => {
            const lines = content.trim().split('\n');
            const title = lines[0].trim();
            const body = lines.slice(1).join('\n').trim();
            
            // Check if the title is a table row (starts and ends with |)
            const isTableRow = title.startsWith('|') && title.endsWith('|');
            
            let titleHtml;
            if (isTableRow) {
                // Parse as a table row
                const cells = title.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
                titleHtml = cells.map(cell => `<td>${marked.parseInline(cell)}</td>`).join('');
            } else {
                // Parse as regular markdown
                titleHtml = marked.parseInline(title);
            }
            
            // Parse the body as markdown to handle images and links
            const bodyHtml = marked.parse(body);
            
            const expandableClass = isTableRow ? 'expandable-section expandable-table-row' : 'expandable-section';
            
            const html = `<div class="${expandableClass}">
                <span class="clickable-text" onclick="toggleExpand(this)">
                    ${isTableRow ? `<table><tr>${titleHtml}</tr></table>` : titleHtml}<span class="toggle-indicator">+</span>
                </span>
                <div class="expandable-content">
                    ${bodyHtml}
                </div>
            </div>`;
            
            expandedBlocks.push(html);
            // Use HTML comment as placeholder that markdown won't touch
            return `<!-- BLOCK_${blockIndex++} -->`;
        });
        
        // Render the remaining markdown
        let htmlContent = marked.parse(markdownText);
        
        // Replace HTML comment placeholders with actual HTML
        for (let i = 0; i < expandedBlocks.length; i++) {
            htmlContent = htmlContent.replace(`<!-- BLOCK_${i} -->`, expandedBlocks[i]);
        }
        
        // Insert into the main content area
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = htmlContent;
            
            // Hide empty table header rows (separator rows like | :- | :- |)
            const tables = mainContent.querySelectorAll('table');
            tables.forEach(table => {
                const firstRow = table.querySelector('tr');
                if (firstRow) {
                    const cells = firstRow.querySelectorAll('th, td');
                    let isEmptyHeader = true;
                    cells.forEach(cell => {
                        const text = cell.textContent.trim();
                        // Check if cell is empty or only contains separator characters
                        if (text && !/^[\s|:-]+$/.test(text)) {
                            isEmptyHeader = false;
                        }
                    });
                    if (isEmptyHeader) {
                        firstRow.style.display = 'none';
                    }
                }
            });
            
            // Wrap consecutive expandable-table-row sections in a container for column alignment
            const tableRows = Array.from(mainContent.querySelectorAll('.expandable-table-row'));
            if (tableRows.length > 0) {
                let currentGroup = [];
                let currentWrapper = null;
                
                const createWrapper = () => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'expandable-table-group';
                    return wrapper;
                };
                
                tableRows.forEach((row, index) => {
                    const prevRow = index > 0 ? tableRows[index - 1] : null;
                    const nextRow = index < tableRows.length - 1 ? tableRows[index + 1] : null;
                    
                    // Check if row is consecutive with previous
                    const isConsecutive = prevRow && row.previousElementSibling === prevRow.nextElementSibling;
                    
                    if (!isConsecutive) {
                        // Start a new group
                        if (currentWrapper && currentGroup.length > 0) {
                            currentGroup.forEach(el => currentWrapper.appendChild(el));
                            currentWrapper = null;
                            currentGroup = [];
                        }
                        currentWrapper = createWrapper();
                        row.parentElement.insertBefore(currentWrapper, row);
                    }
                    
                    currentGroup.push(row);
                });
                
                // Add remaining group
                if (currentWrapper && currentGroup.length > 0) {
                    currentGroup.forEach(el => currentWrapper.appendChild(el));
                }
            }
        }
    } catch (error) {
        console.error('Error loading markdown:', error);
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = '<p>Error loading content: ' + error.message + '</p>';
        }
    }
}
