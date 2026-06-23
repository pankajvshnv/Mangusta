import os
import re

html_path = '/Users/pankajvshnv/Documents/palace_COPY/index.html'
css_path = '/Users/pankajvshnv/Documents/palace_COPY/style.css'
js_path = '/Users/pankajvshnv/Documents/palace_COPY/main.js'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace HTML Content
html = html.replace('Altitude', 'Lukshmi Vilas Palace')
html = html.replace('ALTITUDE', 'LUKSHMI VILAS PALACE')
html = html.replace("The City's Most Exclusive Rooftop Destination", "A Legacy of Timeless Elegance")
html = html.replace("Rooftop Dining", "Heritage Stays")
html = html.replace("Artisan Coffee", "Royal Banquets")
html = html.replace("Skyline Views", "Historic Architecture")
html = html.replace("Elevated Living", "Majestic Gardens")
html = html.replace("Sunset Sessions", "Cultural Events")
html = html.replace("The Journey Begins", "The Royal Gates Open")
html = html.replace("Descending Through Clouds", "A Legacy Preserved")
html = html.replace("One Iconic Destination", "The Indo-Saracenic Marvel")
html = html.replace("Welcome to Altitude", "Welcome to Lukshmi Vilas Palace")
html = html.replace("Floor 63 · The Rooftop", "The Grand Courtyard")
html = html.replace("400 km above Earth", "Since 1890")
html = html.replace("Entering the atmosphere", "Timeless Elegance")
html = html.replace("A city reveals itself", "Vadodara's Pride")
html = html.replace("about_rooftop.jpg", "palace_exterior.png")
html = html.replace("club_lounge.jpg", "darbar_hall.png")
html = html.replace("restaurant_dining.jpg", "palace_museum.png")
html = html.replace("private_events.jpg", "royal_gardens.png")

# Loader and Logo replacements
html = html.replace('<p class="loader-wordmark">LUKSHMI VILAS PALACE</p>', '<img src="logo.png" class="loader-wordmark" alt="Logo" style="width:120px; filter:invert(1); margin-bottom:20px;">')
html = html.replace('<a href="#" class="nav-logo" id="navLogo" aria-label="Lukshmi Vilas Palace home">LUKSHMI VILAS PALACE</a>', '<a href="#" class="nav-logo" id="navLogo" aria-label="Lukshmi Vilas Palace home"><img src="logo.png" alt="Lukshmi Vilas Palace" style="height: 45px; filter: invert(1); transition: filter 0.3s;" id="navLogoImg"></a>')

# Add Hero Logo
if '<canvas id="canvas"' in html and 'hero-logo' not in html:
    html = html.replace('<canvas id="canvas" aria-hidden="true"></canvas>', '<canvas id="canvas" aria-hidden="true"></canvas>\n    <img src="logo.png" id="heroLogo" alt="Lukshmi Vilas Palace Logo" class="hero-logo">')

# Update Sections
html = html.replace('Where sky', 'Where history')
html = html.replace('meets the city.', 'meets majesty.')
html = html.replace('Perched sixty-three floors above the streets of New York, Lukshmi Vilas Palace is not simply a venue', 'Spanning over 500 acres in Vadodara, Lukshmi Vilas Palace is not simply a residence')
html = html.replace('destination conceived for those who believe that extraordinary moments belong at extraordinary heights', 'masterpiece of Indo-Saracenic architecture built by Maharaja Sayajirao Gaekwad III')
html = html.replace('Floors above the city', 'Acres of Estate')
html = html.replace('data-target="63"', 'data-target="500"')
html = html.replace('Degree panorama', 'Rooms of Luxury')
html = html.replace('data-target="240"', 'data-target="170"')
html = html.replace('Hours open daily', 'Years of History')
html = html.replace('data-target="18"', 'data-target="135"')

html = html.replace('The Club<br/>Lounge', 'The Darbar<br/>Hall')
html = html.replace('The<br/>Restaurant', 'The Palace<br/>Museum')
html = html.replace('The<br/>Sky Deck', 'The Royal<br/>Gardens')

html = html.replace('Sky-high social experiences in a setting defined by premium travertine', 'A breathtaking space featuring an exquisite Venetian mosaic floor, ornate Belgian stained-glass windows, and towering archways')
html = html.replace('Elevated dining conceived around a philosophy of restraint.', 'Discover classical European and Indian oil paintings, including works by Raja Ravi Varma, amidst historic marble corridors.')
html = html.replace('An open-air sanctuary sixty-three floors above street level.', 'Sprawling, manicured royal gardens featuring elegant fountains, stone pathways, and wandering peacocks.')

# Form changes
html = html.replace('The Club Lounge', 'The Darbar Hall')
html = html.replace('The Restaurant', 'The Palace Museum')
html = html.replace('The Sky Deck', 'The Royal Gardens')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

# Replace CSS
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace("--gold:       #A8845A;", "--gold:       #D4AF37;")
css = css.replace("--gold-light: #C4A47A;", "--gold-light: #F3E5AB;")
css = css.replace("'Cormorant', 'Georgia', 'Times New Roman', serif", "'Cinzel', 'Playfair Display', serif")

# Add Hero logo css if not present
if '.hero-logo' not in css:
    css += """
.hero-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(80vw, 400px);
  z-index: 10;
  pointer-events: none;
  filter: invert(1);
}

.nav--light #navLogoImg {
  filter: invert(0) !important;
}
"""

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

# Replace JS
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Add fast fade out for hero logo
if "const hl = $('#heroLogo');" not in js:
    # Find onUpdate function in ScrollTrigger
    js = js.replace("""        scrollCue && (p > 0.015 ? scrollCue.classList.add('gone') : scrollCue.classList.remove('gone'));""",
"""        scrollCue && (p > 0.015 ? scrollCue.classList.add('gone') : scrollCue.classList.remove('gone'));
        const hl = $('#heroLogo');
        if (hl) {
          // Fades out extremely fast (under 0.10s of scrolling equivalent)
          hl.style.opacity = Math.max(0, 1 - (p * 30));
        }""")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Files updated successfully.")
