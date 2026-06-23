# Altitude — Luxury Rooftop Café Website

A cinematic, scroll-driven website built for a luxury rooftop café or restaurant. No frameworks. No build step. Open the folder, drop in your images, update your text, done.

---

## What's Inside

```
/
├── index.html              Main HTML file — all sections live here
├── style.css               All styling, design tokens, responsive layout
├── main.js                 Scroll engine, animations, interactions
├── about_rooftop.jpg       About section photo
├── club_lounge.jpg         Club Lounge experience photo
├── restaurant_dining.jpg   Restaurant section photo
├── private_events.jpg      Private events section photo
└── sequence/               240 frames for the canvas animation (001.png → 240.png)
```

---

## How to Run

No installs. No terminal commands. Just open:

```
index.html
```

in any modern browser — or serve it locally if you want live reload:

```bash
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080`

---

## Sections

| # | Section | What It Does |
|---|---------|--------------|
| — | Loader | Preloads all 240 frames with a progress bar |
| — | Canvas Hero | 240-frame scroll-controlled cinematic sequence (Earth → Rooftop) |
| — | Marquee | Scrolling brand strip |
| 01 | About | Full-bleed split layout with stats counter |
| 02 | Signature Experiences | Club Lounge, Restaurant, Sky Deck — alternating image/text blocks |
| 03 | Elevated Experiences | 6-card grid (Sunset Dining, Brunch, Coffee, Chef's Table, etc.) |
| 04 | What's On | Events grid with date, price, book CTA |
| 05 | Private Events | Dark full-screen section with capacity info |
| 06 | Gallery | Masonry image grid with hover labels |
| 07 | Testimonials | Auto-rotating quotes with press logos |
| 08 | Reservations | Full booking form with guest picker |
| 09 | Newsletter | Email subscribe |
| — | Footer | Nav links, hours, address, social |

---

## Animations

Everything is handled by GSAP + Lenis. Here's what runs on scroll:

- **Canvas sequence** — 240 PNGs drawn frame-by-frame on HTML5 Canvas. Pinned while scrolling. Reversible.
- **Chapter titles** — fade in/out as different frame ranges are hit (Space, Atmosphere, City, Rooftop)
- **Word-split reveals** — every headline animates word-by-word sliding up from below
- **Eyebrow text** — character-by-character stagger on every section label
- **Clip-path image wipes** — left-to-right reveal on images as they enter the viewport
- **Slide left / right** — text columns alternate direction based on layout
- **Card stagger** — event and experience cards fade+slide in with staggered delay
- **Zoom-out reveals** — gallery images scale from 1.15 → 1.0 on enter
- **Counter animation** — stats (63 floors, 240° panorama, 18 hrs) count up when visible
- **Custom cursor** — dot + ring follower. Expands on links, morphs on images
- **Magnetic buttons** — CTAs follow the cursor with elastic snap-back
- **Card image parallax** — inner image shifts on mouse move inside card
- **Marquee parallax** — strip speed tied to scroll velocity
- **Smooth scroll** — Lenis with exponential easing throughout

---

## Customising the Content

### Rename the venue

Search and replace `Altitude` in `index.html`. Also update:

```html
<!-- Line 6 -->
<title>Your Name — Tagline Here</title>

<!-- Line 30 -->
<a href="#" class="nav-logo">YOUR NAME</a>

<!-- Footer -->
<p class="footer-logo">YOUR NAME</p>
```

### Change the address / contact

In `index.html`, find the `#reserve` section and footer:

```html
<a href="tel:+12125550199">+1 212 555 0199</a>
<a href="mailto:reserve@altitude.nyc">reserve@altitude.nyc</a>

One Financial Tower, Floor 63
New York, NY 10004
```

Replace with your actual details.

### Swap the photos

Just replace the four JPGs in the root folder — keep the exact same filenames:

```
about_rooftop.jpg
club_lounge.jpg
restaurant_dining.jpg
private_events.jpg
```

Any resolution works. They're all `object-fit: cover` so they crop automatically.

### Swap the canvas sequence

Drop 240 PNG frames into the `/sequence/` folder named:

```
001.png
002.png
...
240.png
```

Three digits, zero-padded. The `main.js` config at the top controls this:

```js
const CFG = {
  TOTAL_FRAMES:    240,      // number of frames
  SEQUENCE_PATH:   'sequence/',
  PAD_DIGITS:      3,        // 001, 002... if you use 4 digits → change to 4
  SCROLL_PER_FRAME: 3,       // scroll distance per frame — higher = slower animation
};
```

### Change the colour palette

All colours live in CSS custom properties at the top of `style.css`:

```css
:root {
  --white:      #FFFFFF;
  --warm-white: #F8F7F4;
  --beige:      #EFE8DE;
  --ink:        #111111;   /* main text */
  --mid:        #666666;   /* secondary text */
  --gold:       #A8845A;   /* accent */
  --border:     #EAEAEA;
}
```

Change `--gold` to your brand colour. Everything accent-related updates automatically.

### Change the fonts

Fonts are loaded from Google Fonts in `index.html` head:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant...&family=DM+Sans...">
```

Then referenced in `style.css`:

```css
--ff-display: 'Cormorant', serif;   /* headlines */
--ff-body:    'DM Sans', sans-serif; /* body text */
```

Swap either or both. Any Google Font works — just update the import URL and the variable.

### Edit the menu / events / experiences

All content is plain HTML in `index.html`. The event cards are structured like this:

```html
<article class="event-card" id="ev-brunch">
  <div class="event-card-img">
    <img src="your-photo.jpg" alt="Event name"/>
    <span class="event-tag">Brunch</span>
  </div>
  <div class="event-card-body">
    <p class="event-date">14 Jun 2025</p>
    <h3>Event Title</h3>
    <p>Short description goes here.</p>
    <div class="event-card-foot">
      <span class="event-price">From $85 per person</span>
      <a href="#reserve" class="event-book">Book Now →</a>
    </div>
  </div>
</article>
```

Copy/paste and edit. Add or remove cards as needed. The grid handles 3 columns automatically.

### Connect the reservation form

The form in `#reserve` is currently just front-end. To make it functional:

1. **Formspree (no code):** Add `action="https://formspree.io/f/YOUR_ID"` to the `<form>` tag and `method="POST"`.
2. **Netlify Forms:** Add `netlify` attribute to `<form>`.
3. **Custom backend:** The form has `id="reserveForm"` — hook into the `submit` event in `main.js` around line 860.

---

## Dependencies (CDN — no install needed)

| Library | Version | Purpose |
|---------|---------|---------|
| [GSAP](https://gsap.com) | 3.12.5 | All animations + ScrollTrigger |
| [Lenis](https://lenis.darkroom.engineering) | 1.1.14 | Smooth scroll |
| [Google Fonts](https://fonts.google.com) | — | Cormorant + DM Sans |

All three load from CDN in `index.html`. No npm, no bundler.

---

## Browser Support

Works in all modern browsers. The canvas sequence and clip-path animations require:

- Chrome 88+
- Firefox 89+
- Safari 15+
- Edge 88+

Internet Explorer is not supported (and hasn't been since 2022).

---

## Performance Notes

- The 240-frame sequence is the heaviest asset. Typical PNG sequences run 40–120 MB depending on resolution. Compress frames to WebP if load time matters.
- All section images use `loading="lazy"` except the sequence (which is preloaded intentionally).
- Lenis + GSAP ticker are connected so there's no double-rAF loop.
- The canvas uses `devicePixelRatio` capped at 2x so it looks sharp on Retina without destroying performance.

---

## File Editing Cheatsheet

| I want to change... | Open this file | Look for... |
|--------------------|---------------|-------------|
| Page text / sections | `index.html` | The relevant `<section id="...">` |
| Colours / fonts | `style.css` | `:root` at the top |
| Animation speed | `main.js` | `CFG` object at the top |
| Scroll pin length | `main.js` | `SCROLL_PER_FRAME` in CFG |
| Section layout | `style.css` | The section's class e.g. `.about-grid` |
| Nav links | `index.html` | `<nav class="nav-center">` |
| Footer content | `index.html` | `<footer class="footer">` |

---

## License

Single purchase — use on one project. Do not resell or redistribute the source files.
