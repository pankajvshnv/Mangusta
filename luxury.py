import re

html_path = '/Users/pankajvshnv/Documents/palace_COPY/index.html'
css_path = '/Users/pankajvshnv/Documents/palace_COPY/style.css'

# 1. Update HTML
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('Three worlds.', 'A Heritage Preserved.')
html = html.replace('One address.', 'A Legacy Continued.')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Update CSS
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Fix hero text alignment to center of screen
css = css.replace(
"""
.chapter {
  position: absolute;
  bottom: clamp(80px, 10vh, 130px);
  left: var(--gutter);
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.9s var(--ease-out),
              transform 0.9s var(--ease-out);
  pointer-events: none;
  max-width: 520px;
}
.chapter.active {
  opacity: 1;
  transform: translateY(0);
}
""",
"""
.chapter {
  position: absolute;
  bottom: clamp(80px, 10vh, 130px);
  left: 50%;
  transform: translate(-50%, 16px);
  opacity: 0;
  transition: opacity 0.9s var(--ease-out),
              transform 0.9s var(--ease-out);
  pointer-events: none;
  width: 100%;
  max-width: 600px;
  text-align: center;
}
.chapter.active {
  opacity: 1;
  transform: translate(-50%, 0);
}
"""
)

# Enhance cards with luxury design
css = css.replace(
"""
.exp-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 0;
  border-top: 1px solid var(--gold);
  background: var(--warm-white);
}
""",
"""
.exp-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 40px;
  margin: 40px auto;
  max-width: 1000px;
  background: #fdfcf9;
  border: 1px solid var(--gold);
  outline: 1px solid var(--gold);
  outline-offset: -8px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.06);
  border-radius: 4px;
}
"""
)

# Update event card styling
css = css.replace(
"""
.event-card {
  background: var(--white);
  transition: transform 0.4s var(--ease-out);
}
""",
"""
.event-card {
  background: #fdfcf9;
  border: 1px solid var(--gold);
  outline: 1px solid var(--gold);
  outline-offset: -6px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.05);
  transition: transform 0.4s var(--ease-out), box-shadow 0.4s var(--ease-out);
}
.event-card:hover {
  box-shadow: 0 25px 45px rgba(0,0,0,0.1);
}
"""
)

# Enhance buttons to look like plaques
css = css.replace(
"""
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 36px;
  background: var(--ink);
  color: #fff;
  font-family: var(--ff-body);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: 1px solid var(--ink);
  border-radius: var(--radius);
  transition: background 0.35s var(--ease-out),
              color 0.35s,
              border-color 0.35s,
              transform 0.35s var(--ease-out);
  white-space: nowrap;
}
""",
"""
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 36px;
  background: var(--ink);
  color: var(--gold-light);
  font-family: var(--ff-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: 1px solid var(--gold);
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgba(212, 175, 55, 0.2);
  transition: background 0.35s var(--ease-out),
              color 0.35s,
              border-color 0.35s,
              transform 0.35s var(--ease-out);
  white-space: nowrap;
}
"""
)

# Update card images to have a subtle internal frame
css += """
.exp-block-img img, .event-card-img img {
  border: 1px solid rgba(212, 175, 55, 0.4);
  padding: 4px;
  background: #fff;
}
"""

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("Luxury design applied.")
