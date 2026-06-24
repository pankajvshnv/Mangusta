#!/usr/bin/env python3
"""
Convert numbered JPEG sequence → hero.mp4 + hero.webm for scroll scrubbing.
Frames are sorted numerically (1.jpg, 2.jpg ... 345.jpg).
"""
import os
import glob
import subprocess
import shutil
import tempfile

SEQUENCE_DIR = 'sequence'
OUTPUT_MP4   = 'hero.mp4'
OUTPUT_WEBM  = 'hero.webm'
FPS          = 25  # 25fps → 345 frames = 13.8s video

def get_sorted_frames():
    files = glob.glob(f'{SEQUENCE_DIR}/*.jpg')
    valid = [f for f in files if os.path.basename(f).split('.')[0].isdigit()]
    return sorted(valid, key=lambda x: int(os.path.basename(x).split('.')[0]))

def build_video():
    frames = get_sorted_frames()
    if not frames:
        print("ERROR: No frames found in sequence/")
        return False
    print(f"Found {len(frames)} frames")

    # Create a temp dir with frames renamed to ffmpeg's expected pattern (001.jpg, 002.jpg...)
    tmpdir = tempfile.mkdtemp()
    print(f"Staging frames in {tmpdir}...")
    for i, src in enumerate(frames):
        dst = os.path.join(tmpdir, f'{i+1:04d}.jpg')
        os.symlink(os.path.abspath(src), dst)

    input_pattern = os.path.join(tmpdir, '%04d.jpg')

    # ── MP4 (H.264) — universally supported ──────────────────────────────────
    print("\nConverting to MP4 (H.264)...")
    mp4_cmd = [
        'ffmpeg', '-y',
        '-framerate', str(FPS),
        '-i', input_pattern,
        '-c:v', 'libx264',
        '-crf', '20',           # 0=lossless, 51=worst; 20 is near-lossless
        '-preset', 'slow',      # better compression, same quality
        '-pix_fmt', 'yuv420p',  # required for browser compatibility
        '-movflags', '+faststart',  # moov atom at front → instant play
        OUTPUT_MP4
    ]
    result = subprocess.run(mp4_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("MP4 error:", result.stderr[-500:])
        shutil.rmtree(tmpdir)
        return False

    mp4_size = os.path.getsize(OUTPUT_MP4) / (1024*1024)
    print(f"✅ MP4 done: {OUTPUT_MP4} ({mp4_size:.1f} MB)")

    # ── WebM (VP9) — better compression for Chrome/Firefox ───────────────────
    print("\nConverting to WebM (VP9)...")
    webm_cmd = [
        'ffmpeg', '-y',
        '-framerate', str(FPS),
        '-i', input_pattern,
        '-c:v', 'libvpx-vp9',
        '-crf', '30',
        '-b:v', '0',
        '-deadline', 'good',
        '-cpu-used', '2',
        OUTPUT_WEBM
    ]
    result = subprocess.run(webm_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("WebM error:", result.stderr[-500:])
        print("Skipping WebM (MP4 only is fine)")
    else:
        webm_size = os.path.getsize(OUTPUT_WEBM) / (1024*1024)
        print(f"✅ WebM done: {OUTPUT_WEBM} ({webm_size:.1f} MB)")

    shutil.rmtree(tmpdir)
    print("\n🎬 Conversion complete!")
    return True

if __name__ == '__main__':
    build_video()
