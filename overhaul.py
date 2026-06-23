import re

css_path = '/Users/pankajvshnv/Documents/palace_COPY/style.css'
js_path = '/Users/pankajvshnv/Documents/palace_COPY/main.js'

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update CSS Layouts to be Centered and Symmetrical
css = css.replace(
"""
.about-grid {
  display: grid;
  grid-template-columns: 55% 45%;
  min-height: 90vh;
}
""",
"""
.about-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 0;
  background: var(--warm-white);
}
"""
)

css = css.replace(
"""
.about-text-col {
  background: var(--warm-white);
  display: flex;
  align-items: center;
  padding: clamp(60px, 8vw, 120px) clamp(40px, 5vw, 80px);
}
""",
"""
.about-text-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}
"""
)

css = css.replace(
"""
.exp-block {
  display: grid;
  grid-template-columns: 60% 40%;
  min-height: 80vh;
  border-top: 1px solid var(--border);
}
.exp-block--rev { grid-template-columns: 40% 60%; }
.exp-block--rev .exp-block-img { order: 2; }
.exp-block--rev .exp-block-text { order: 1; }
""",
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
.exp-block--rev { }
.exp-block--rev .exp-block-img { order: 1; }
.exp-block--rev .exp-block-text { order: 2; }
"""
)

css = css.replace(
"""
.exp-block-text {
  display: flex;
  align-items: center;
  background: var(--warm-white);
  padding: clamp(48px, 6vw, 100px) clamp(36px, 4vw, 80px);
}
""",
"""
.exp-block-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 60px 20px;
}
"""
)

css = css.replace(
"""
.exp-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}
""",
"""
.exp-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
"""
)

css = css.replace(
"""
.events-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
""",
"""
.events-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 60px;
}
"""
)

# Update styling to be more royal
css = css.replace("var(--border)", "rgba(212, 175, 55, 0.3)") # Use gold for borders

# Write back CSS
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)


# 2. Update JS Animations
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Make all animations slower and remove split text
js = js.replace("duration: 1.1", "duration: 2.5")
js = js.replace("duration: 0.95", "duration: 2.0")
js = js.replace("duration: 0.9", "duration: 2.0")
js = js.replace("duration: 1.05", "duration: 2.5")
js = js.replace("duration: 1.15", "duration: 2.5")
js = js.replace("ease: 'power4.out'", "ease: 'power2.out'")
js = js.replace("ease: 'power3.out'", "ease: 'power2.out'")

# Remove word splitting functionality call to stop staggered sliding
js = js.replace("splitWords(h);", "// splitWords(h);")
js = js.replace("splitWords(title);", "// splitWords(title);")
js = js.replace("splitWords(el);", "// splitWords(el);")
js = js.replace("splitWords(line);", "// splitWords(line);")

# Change stagger animations to simple fades
js = js.replace("{ y: '115%', opacity: 0 }", "{ y: 30, opacity: 0 }")
js = js.replace("{ y: '0%', opacity: 1,", "{ y: 0, opacity: 1,")

# Change image reveals from fast clips to slow fades and zooms
js = js.replace(
"""
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start:   opts.start || 'top 78%',
        once:    true,
      }
    });
    tl.fromTo(wrapper, { clipPath: startClip }, { clipPath: endClip, duration: opts.dur || 1.5, ease: 'expo.inOut' })
      .fromTo(img,     { scale: 1.18 },         { scale: 1,         duration: opts.imgDur || 1.7, ease: 'expo.out' }, '<');
""",
"""
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start:   opts.start || 'top 85%',
        once:    true,
      }
    });
    tl.fromTo(wrapper, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 2.5, ease: 'power2.out' })
      .fromTo(img,     { scale: 1.08 },       { scale: 1,         duration: 4.0, ease: 'power2.out' }, '<');
"""
)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Design and animation overhaul applied.")
