# Mangusta 165 REV — Luxury Superyacht Website

A cinematic, scroll-driven website built for a luxury superyacht experience. No frameworks. No build step. Ready for Vercel deployment out of the box.

---

## What's Inside

```
/
├── index.html              Main HTML file — all sections live here
├── style.css               All styling, design tokens, responsive layout
├── main.js                 Scroll engine, animations, interactions
├── vercel.json             Vercel deployment configuration
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

### Deployment (Vercel)

This project includes a `vercel.json` file. To deploy:
1. Push this code to a GitHub repository.
2. Import the project in Vercel.
3. Deploy! Vercel will automatically serve the static files.

---

## Sections

| # | Section | What It Does |
|---|---------|--------------|
| — | Loader | Preloads all 240 frames with a progress bar |
| — | Canvas Hero | 240-frame scroll-controlled cinematic sequence |
| — | Marquee | Scrolling brand strip |
| 01 | The Vessel | Full-bleed split layout |
| 02 | Life Aboard | Ocean Lounge, Fine Dining, Sun Deck — alternating image/text blocks |
| 03 | Voyages | Grid of curated yacht experiences (Sunset Passage, Island Brunch, etc.) |
| 04 | Gallery | Masonry image grid |
| 05 | Private | Dark full-screen section with charter info |
| 06 | Enquire | Full booking/enquiry form |
| — | Footer | Nav links, specifications, social |

---

## Customising the Content

### Change the colour palette

All colours live in CSS custom properties at the top of `style.css`. Change `--gold` to your brand colour and everything accent-related updates automatically.

### Connect the enquiry form

The form in `#reserve` is currently just front-end. To make it functional:

1. **Formspree (no code):** Add `action="https://formspree.io/f/YOUR_ID"` to the `<form>` tag and `method="POST"`.
2. **Netlify Forms:** Add `netlify` attribute to `<form>`.
3. **Custom backend:** The form has `id="reserveForm"` — hook into the `submit` event in `main.js`.
