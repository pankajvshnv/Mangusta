import os
import glob
import shutil
from PIL import Image
import concurrent.futures

INPUT_DIR = 'sequence'
OUTPUT_DIR = 'sequence_thinned'
KEEP_EVERY = 3        # keep frame 1, 4, 7, 10 ... (every 3rd)
MAX_WIDTH = 960       # also bump to 960px for sharpness on retina
QUALITY = 55          # slightly higher quality at 960px

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Get all frames sorted numerically
all_files = sorted(glob.glob(f'{INPUT_DIR}/*.jpg'), 
                   key=lambda x: int(os.path.basename(x).replace('_test', '').split('.')[0]) if os.path.basename(x).replace('_test', '').split('.')[0].isdigit() else 99999)

# Only include valid numbered files
valid_files = [f for f in all_files if os.path.basename(f).split('.')[0].isdigit()]
print(f"Total frames: {len(valid_files)}")

# Pick every Nth frame
kept = valid_files[::KEEP_EVERY]
print(f"Keeping every {KEEP_EVERY}rd frame: {len(kept)} frames")

def process(args):
    src, new_num = args
    dst = os.path.join(OUTPUT_DIR, f'{new_num}.jpg')
    try:
        img = Image.open(src)
        if img.width < MAX_WIDTH:
            # If already smaller, just save at higher quality
            img.save(dst, 'JPEG', quality=QUALITY, optimize=True)
        else:
            ratio = MAX_WIDTH / img.width
            new_h = int(img.height * ratio)
            img = img.resize((MAX_WIDTH, new_h), Image.Resampling.LANCZOS)
            img.save(dst, 'JPEG', quality=QUALITY, optimize=True)
        return True
    except Exception as e:
        print(f"Error {src}: {e}")
        return False

tasks = [(src, i+1) for i, src in enumerate(kept)]

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    results = list(ex.map(process, tasks))

total_in = sum(os.path.getsize(f) for f in valid_files) / (1024*1024)
total_out = sum(os.path.getsize(os.path.join(OUTPUT_DIR, f)) for f in os.listdir(OUTPUT_DIR)) / (1024*1024)

print(f"\nDone! {results.count(True)}/{len(tasks)} frames processed")
print(f"Before: {total_in:.1f} MB | After: {total_out:.1f} MB")
print(f"New TOTAL_FRAMES for main.js: {len(kept)}")
