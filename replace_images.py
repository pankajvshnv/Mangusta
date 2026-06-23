import re

urls = [
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/1_M165REV.3_running-8.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/1_M165REV.3_running-7.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/1_M165REV.3_running-5.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/1_M165REV.3_running-4.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/1_M165REV.3_running-3.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/5_M165REV.3_interiors_main_salon-9.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/5_M165REV.3_interiors_main_salon-8.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/5_M165REV.3_interiors_main_salon-6.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/5_M165REV.3_interiors_main_salon-5.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/4_M165REV.3_exteriors_main_deck-29.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/4_M165REV.3_exteriors_main_deck-28.jpg",
    "https://www.mangustayachts.com/wp-content/uploads/2024/09/4_M165REV.3_exteriors_main_deck-26.jpg",
]

with open("index.html", "r") as f:
    html = f.read()

def repl(match):
    global urls
    if len(urls) > 0:
        return 'src="' + urls.pop(0) + '"'
    return match.group(0)

html = re.sub(r'src="sequence/\d+\.jpg"', repl, html)

with open("index.html", "w") as f:
    f.write(html)
