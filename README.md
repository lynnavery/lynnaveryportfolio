# Lynn Avery Portfolio

A portfolio website built with HTML, CSS, and JavaScript, with content managed through Markdown, then converted using Markd.

## Content Management

Edit `content.md` to update the portfolio content. The file uses:
- Standard Markdown syntax
- Custom expandable sections using `[[details]]` and `[[summary]]` tags (convert to HTML `<details>` / `<summary>`)

### Expandable Sections

Use the following format for collapsible content:

```markdown
[[details]]
[[summary]]
Section Title
[[/summary]]
Content goes here. Can include **bold**, *italic*, [links](url), and images.
[[/details]]

For line breaks, use double space then enter. The rest of formatting follows typical markup syntax
```