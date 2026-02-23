# Portfolio Setup Guide

This is a customizable portfolio template built with HTML, CSS, and JavaScript. It uses **one page** and **HTML content files**, so you edit plain HTML to update the site—no markdown or build step.

## How It Works

### Overview
- **Single page** (`index.html`) holds the layout, nav, and ellipse. All sections (bio, works, live, press, contact) are shown on this page.
- **Content files** in the `content/` folder (`bio.html`, `works.html`, etc.) hold the HTML for each section.
- **JavaScript** (`script.js`) loads the right content based on the URL hash (`#bio`, `#works`, …) and injects it into `#main-content`.
- **CSS** (`styles.css`) handles styling and responsive layout.

### Content Flow
1. You open `index.html` or `index.html#works` (etc.).
2. The script reads the hash (e.g. `#works`) and fetches `content/works.html`.
3. The HTML from that file is inserted into the `#main-content` div.
4. The nav link for the current section gets the `active` class; the page title updates.

### Redirect Pages
`works.html`, `live.html`, `press.html`, and `contact.html` are redirect pages. They send visitors to `index.html#works`, `index.html#live`, etc., so old links and bookmarks still work.

## Getting Started with Your Own Portfolio

### Step 1: Clone or Copy This Repository
```bash
git clone <repository-url>
cd your-portfolio
```

### Step 2: Customize the Navigation
Edit the nav in **index.html**:

```html
<nav class="site-nav">
    <a href="#bio" class="active">bio</a>
    <a href="#works">works</a>
    <a href="#live">live</a>
    <a href="#press">press</a>
    <a href="#contact">contact</a>
</nav>
```

**To customize:**
- Change link text (e.g. "bio" → "about", "works" → "portfolio").
- Use `href="#sectionid"` for each section.
- Add or remove links as needed.
- The script sets `class="active"` automatically from the current hash; you only need `class="active"` on the default (e.g. bio) for the first load.

If you add a new section (e.g. Shop), add a nav link `href="#shop"` and create `content/shop.html`. Then add a redirect page `shop.html` that redirects to `index.html#shop` (see “Adding New Pages” below).

### Step 3: Update the Page Title
In **index.html**, change the `<title>`:

```html
<title>Lynn Avery</title>
<!-- Change to your name -->
<title>Jane Smith</title>
```

The script updates the title when switching sections (e.g. “Lynn Avery - Works”); the default is whatever you put in `index.html`.

### Step 4: Edit Content (HTML)
Edit the files in the **content/** folder. Use normal HTML: paragraphs, links, lists, images, tables, etc.

**Example – content/bio.html:**
```html
<img src="img/me.png" alt="Photo" />
<p>Your bio text here. Use <a href="https://example.com">links</a>, <em>emphasis</em>, <strong>bold</strong>.</p>
<p>Another paragraph.</p>
```

**Images:** Put image files in `img/` and reference them with `src="img/filename.jpg"` (or `.png`, etc.).

**Expandable sections:** Use `<details>` and `<summary>`:

```html
<details class="expandable-section">
  <summary class="expandable-summary">Click to expand</summary>
  <div class="expandable-content">
    <p>Hidden content here.</p>
  </div>
</details>
```

On the works page, album rows use `expandable-section expandable-table-row` and a `<table>` inside `<summary>` so the layout matches the rest of the works list. You can copy the structure from `content/works.html`.

### Step 5: Customize Colors and Fonts
Edit **styles.css**.

**Colors:**
```css
body {
    color: #000;
    background: #fff;
}
```

**Fonts:** The site uses “DM Sans” from Google Fonts. To change it, update the `<link>` in **index.html** and the `font-family` in `styles.css`:

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:..." rel="stylesheet">
<!-- Change to another Google Font if you like -->
```

```css
body {
    font-family: 'DM Sans', sans-serif;
}
```

Find fonts at [Google Fonts](https://fonts.google.com/).

## File Structure

```
your-portfolio/
├── index.html              # Single page (nav, ellipse, #main-content)
├── works.html              # Redirect → index.html#works
├── live.html               # Redirect → index.html#live
├── press.html              # Redirect → index.html#press
├── contact.html            # Redirect → index.html#contact
├── content/
│   ├── bio.html            # Bio section content
│   ├── works.html          # Works section content
│   ├── live.html           # Live/events section content
│   ├── press.html          # Press section content
│   └── contact.html        # Contact section content
├── styles.css              # Styling
├── script.js               # Loads content by hash, ellipse animation
├── img/                    # Images
│   └── [your-images]
└── README.md
```

The old `.md` files (e.g. `bio.md`, `works.md`) are no longer used by the site; you can delete them if you don’t need them.

## Customizing Layout

### Container width
In **styles.css**:

```css
.container {
    max-width: 800px;
    margin: 0 auto;
}
```

### Spacing
```css
.site-nav {
    margin-bottom: 2em;
    margin-top: 2em;
}

.page-content {
    line-height: 1.6;
}
```

(The main content div uses the class `page-content` for styling.)

## Adding New Pages (Sections)

To add a new section (e.g. “Shop”):

1. **Create `content/shop.html`** with your HTML content.

2. **Add a nav link in index.html:**
   ```html
   <a href="#shop">shop</a>
   ```

3. **Register the section in script.js** so the hash is recognized and the title works:
   - In the `PAGES` object, add: `shop: 'shop'`.
   - The script already loads `content/${page}.html`, so `content/shop.html` will be loaded for `#shop`.

4. **Optional – redirect page** so `shop.html` works as a URL:
   - Create `shop.html` with:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta http-equiv="refresh" content="0;url=index.html#shop">
       <title>Redirect to Shop</title>
   </head>
   <body><p><a href="index.html#shop">Go to Shop</a></p></body>
   </html>
   ```

## Special Features

### Animated rotating text
The ellipse at the top shows rotating text (e.g. “lynn avery”). The path and animation are set in **script.js** and the SVG in **index.html**.

### Responsive design
Layout adapts to screen size using `max-width`, viewport units, and media queries in **styles.css**.

## Deployment

### Local testing
- Serve the folder with a local server (e.g. `python3 -m http.server 8000`) and open `http://localhost:8000` or `http://localhost:8000/index.html#works`.
- Editing a file in `content/` and refreshing will show your changes.

### Deploying online

**GitHub Pages**
1. Push the repo to GitHub.
2. Settings → Pages → “Deploy from a branch” → choose `main` (or your default branch).
3. Site will be at `https://yourusername.github.io/repo-name`.

**Other hosting**
- Upload the whole folder to Netlify, Vercel, or any static host. No build step required.

## Troubleshooting

**Content not showing?**
- Check the browser address bar: the hash must match a key in the `PAGES` object in `script.js` (e.g. `#works`).
- Ensure the corresponding file exists (e.g. `content/works.html`).
- Open the browser console (F12) for errors (e.g. 404 on the content file).

**Wrong section on load?**
- Default is `#bio`. If there’s no hash or an unknown hash, the script falls back to `bio`. Confirm the hash in the URL.

**Styling looks wrong?**
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) and ensure `styles.css` is in the same directory as `index.html`.

**Images not loading?**
- Use paths like `img/filename.jpg` from the project root. Ensure files are in the `img/` folder.

**Expandable sections not opening?**
- Use the classes `expandable-section`, `expandable-summary`, and `expandable-content` as in the examples above. Check the console for JavaScript errors.

## Reference

- **script.js** – Hash-based loading, content fetch, active nav, title, ellipse animation.
- **styles.css** – All styles, including `.expandable-section`, table layout for works.
- **content/*.html** – Section content in plain HTML.
- **index.html** – Single-page shell, nav, and `#main-content`.
