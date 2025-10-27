# Lynn Avery Portfolio

A portfolio website built with HTML, CSS, and JavaScript, with content managed through Markdown.

## Setup

1. Clone this repository
2. Run a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open http://localhost:8000 in your browser

## Content Management

Edit `content.md` to update the portfolio content. The file uses:
- Standard Markdown syntax
- Custom expandable sections using `[[expandable]]` tags

### Expandable Sections

Use the following format for collapsible content:

```markdown
[[expandable]]
Section Title
Content goes here. Can include **bold**, *italic*, [links](url), and images.
[[/expandable]]
```