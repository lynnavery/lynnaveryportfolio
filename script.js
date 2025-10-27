/**
 * Toggle Expand Function
 * A reusable function that expands/collapses content when clicked.
 * 
 * @param {HTMLElement} element - The element that triggers the toggle
 */
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
  
    gsap.fromTo(
      target.querySelectorAll("textPath")[0],
      { attr: { startOffset: "0%" } },
      { attr: { startOffset: reversed ? "-100%" : "100%" }, ...props }
    );
    gsap.fromTo(
      target.querySelectorAll("textPath")[1],
      { attr: { startOffset: reversed ? "100%" : "-100%" } },
      { attr: { startOffset: "0%" }, ...props }
    );
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
  
  loadMarkdownContent();
});

/**
 * Load and render markdown content
 */
async function loadMarkdownContent() {
    try {
        const response = await fetch('content.md');
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
            
            // Parse the body as markdown to handle images and links
            const bodyHtml = marked.parse(body);
            
            const html = `<div class="expandable-section">
                <span class="clickable-text" onclick="toggleExpand(this)">
                    ${title}<span class="toggle-indicator">+</span>
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
        }
    } catch (error) {
        console.error('Error loading markdown:', error);
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = '<p>Error loading content: ' + error.message + '</p>';
        }
    }
}