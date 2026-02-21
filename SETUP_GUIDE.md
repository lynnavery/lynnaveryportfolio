# Portfolio Setup Guide

This is a customizable portfolio template built with HTML, CSS, and JavaScript. It uses **Markdown files for content management**, making it easy to update without touching HTML code.

## How It Works

### Overview
- **HTML pages** (`index.html`, `works.html`, etc.) contain the structure and styling
- **Markdown files** (`bio.md`, `works.md`, etc.) contain your actual content
- **JavaScript** (`script.js`) automatically converts Markdown to HTML when the page loads
- **CSS** (`styles.css`) handles all styling and responsive design

### Content Flow
1. Each HTML file has a `<script src="script.js" data-content="filename.md"></script>` tag
2. When the page loads, JavaScript reads the specified `.md` file
3. The content is converted from Markdown to HTML using the `marked` library
4. The HTML is inserted into the page's `#main-content` div
5. Custom JavaScript features (like expandable sections) are activated

## Getting Started with Your Own Portfolio

### Step 1: Clone or Copy This Repository
```bash
git clone <repository-url>
cd your-portfolio
```

### Step 2: Customize the Navigation
Edit the **navigation menu** that appears on every page. Find this in each HTML file:

```html
<nav class="site-nav">
    <a href="index.html" class="active">bio</a>
    <a href="works.html">works</a>
    <a href="performances.html">performances</a>
    <a href="press.html">press</a>
    <a href="contact.html">contact</a>
</nav>
```

**To customize:**
- Change link text (e.g., "bio" → "about", "works" → "portfolio")
- Change or remove links to pages you don't need
- Add new links if needed
- Keep one link with `class="active"` (this highlights the current page)

### Step 3: Update Page Titles
In each HTML file, change the `<title>` tag. For example:

```html
<!-- In index.html -->
<title>Lynn Avery</title>

<!-- Should become -->
<title>Jane Smith</title>
```

### Step 4: Create Your Content in Markdown Files
This is the easiest part! Just edit the `.md` files with your content.

#### Basic Markdown Syntax
- **Bold**: `**text**` → **text**
- *Italic*: `*text*` → *text*
- [Links](url): `[text](url)`
- # Heading 1
- ## Heading 2
- ### Heading 3
- Lists:
  ```markdown
  - Item 1
  - Item 2
  ```
- Numbered lists:
  ```markdown
  1. First
  2. Second
  ```

#### Line Breaks
Use two spaces at the end of a line, then press Enter:
```markdown
Line one  
Line two
```

### Step 5: Add Expandable Sections (Optional)
You can create collapsible content blocks that users can click to expand/collapse.

```markdown
[[details]]
[[summary]]
Click Me to Expand
[[/summary]]
This content is hidden by default and expands when clicked.
You can use **bold**, *italic*, [links](url), and other markdown here.
[[/details]]
```

**Visual Result:**
- Users see: `+ Click Me to Expand`
- When clicked: The section expands and the `+` becomes `-`
- When clicked again: The section collapses

### Step 6: Add Images
Place image files in the `img/` folder, then reference them in your Markdown:

```markdown
![Alt text](img/filename.jpg)
```

**Example:**
```markdown
![My photo](img/profile.jpg)
![Album cover](img/album-artwork.png)
```

### Step 7: Customize Colors and Fonts
Edit `styles.css` to change:

**Colors:**
```css
body {
    color: #000;           /* Text color */
    background: #fff;      /* Background color */
}
```

**Fonts:**
Currently uses "DM Sans" from Google Fonts. To change:
```html
<!-- In the <head> section of HTML files, find this line: -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:..." rel="stylesheet">

<!-- Replace DM+Sans with another font name, e.g., Roboto, Playfair+Display, etc. -->
<link href="https://fonts.googleapis.com/css2?family=YOUR+FONT+NAME:..." rel="stylesheet">

<!-- Then update CSS: -->
body {
    font-family: 'YOUR FONT NAME', sans-serif;
}
```

Find fonts at [Google Fonts](https://fonts.google.com/)

## File Structure

```
your-portfolio/
├── index.html              # Bio/About page
├── works.html              # Portfolio/Works page
├── performances.html       # Performances/Events page
├── press.html              # Press/Media page
├── contact.html            # Contact page
├── bio.md                  # Content for bio page
├── works.md                # Content for works page
├── performances.md         # Content for performances page
├── press.md                # Content for press page
├── contact.md              # Content for contact page
├── styles.css              # All styling
├── script.js               # JavaScript functionality
├── img/                    # Folder for images
│   └── [your-images]
└── README.md               # Documentation
```

## Customizing Layout

### Container Width
The content has a maximum width. To change it, edit in `styles.css`:

```css
.container {
    max-width: 800px;      /* Change this value in pixels */
    margin: 0 auto;
}
```

### Spacing and Margins
Adjust spacing between sections in `styles.css`:

```css
.site-nav {
    margin-bottom: 2em;    /* Space below navigation */
    margin-top: 2em;       /* Space above navigation */
}

.markdown-content {
    line-height: 1.6;      /* Space between lines (1.6 is normal) */
}
```

## Adding New Pages

If you want to add a new page (e.g., "Shop"):

1. **Create a new HTML file** (e.g., `shop.html`):
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <link rel="preconnect" href="https://fonts.googleapis.com">
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:..." rel="stylesheet">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Your Name - Shop</title>
       <link rel="stylesheet" href="styles.css">
       <script src="https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js"></script>
       <script>
           if (typeof marked !== 'undefined') {
               marked.use({
                   gfm: true,
                   breaks: true
               });
           }
       </script>
   </head>
   <body>
       <div class="container">
           <div class="ellipse">
               <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                 <path d="M227 120C227 142.091 178.871 160 119.5 160C60.1294 160 12 142.091 12 120C12 97.9086 60.1294 80 119.5 80C178.871 80 227 97.9086 227 120Z" fill="none" />
               </svg>
           </div>
           <nav class="site-nav">
               <a href="index.html">bio</a>
               <a href="works.html">works</a>
               <a href="performances.html">performances</a>
               <a href="press.html">press</a>
               <a href="shop.html" class="active">shop</a>
               <a href="contact.html">contact</a>
           </nav>
           <div id="main-content" class="markdown-content"></div>
       </div>
       <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
       <script src="script.js" data-content="shop.md"></script>
   </body>
   </html>
   ```

2. **Create a markdown file** (`shop.md`) with your content

3. **Update navigation** on all other HTML files to include the new link

## Special Features

### Animated Rotating Text
The ellipse at the top displays rotating text. This is controlled by the SVG path and the animation settings in `script.js`. The text currently shows "lynn avery" and cycles continuously.

### Responsive Design
The site automatically adapts to mobile, tablet, and desktop screens. The CSS uses:
- `max-width` to limit content width on large screens
- `vw` and `vh` units for responsive sizing
- Media queries for mobile optimization

## Deployment

### Local Testing
1. Open any `.html` file in your browser
2. Changes to `.md` files will appear after refreshing the page

### Deploying Online

**GitHub Pages (Free)**
1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" and choose `main` branch
4. Your site will be live at `https://yourusername.github.io/repo-name`

**Other Hosting**
- Netlify, Vercel, or any static hosting service
- Simply upload all files to your hosting provider

## Troubleshooting

**Content not showing up?**
- Check that the markdown file name matches the `data-content` value in the script tag
- Make sure the `.md` file is in the same folder as the `.html` files
- Check browser console (F12) for error messages

**Styling looks wrong?**
- Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Make sure `styles.css` is in the same folder

**Images not loading?**
- Check that image paths start with `img/`
- Make sure images are actually in the `img/` folder
- Try refreshing the page

**Expandable sections not working?**
- Make sure the syntax is exactly: `[[details]]` with `[[summary]]` ... `[[/summary]]` for the heading and the rest until `[[/details]]` for the body
- Check browser console for JavaScript errors

## Questions or Issues?

Refer to the files included in this project:
- `script.js` - Controls markdown rendering and interactive features
- `styles.css` - All styling
- Individual `.md` files - Content examples
- `.html` files - Template structure
