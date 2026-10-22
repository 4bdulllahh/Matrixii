# Matrixii

Turn your webcam or any video into **Matrix-style digital rain** and other ASCII art. Live, in real time, and 100% on your own computer.

- 🎥 **Live webcam**: see yourself in the Matrix as you move.
- 📁 **Upload a video**: convert it and export the result (with its original sound).
- 🔤 **8 styles**: Matrix, Binary, Hex, Code, Classic ASCII, Detailed ASCII, Blocks, Dots.
- 🎛️ **Tweak it**: character size, rain amount, contrast, invert, and Matrix colors or the video's original colors.
- 🔒 **Private**: nothing is uploaded anywhere; all processing happens in your browser.
- 📦 **Zero install**: no Python, no OpenCV, no packages.

## How to use

**Online:** open the hosted site (Vercel) and you're done.

**Offline:**
1. [Download the ZIP](../../archive/refs/heads/main.zip) (or `git clone` this repo) and unzip it.
2. Double-click **`index.html`**. It opens in your browser (Chrome, Edge or Firefox).

Then:
1. Click **Use webcam** (allow camera access) or **Upload video**.
2. Pick a **Style**. If you are hard to see, turn on **Invert** (good with a bright background) or raise **Contrast**.
3. Press **Record** to save a clip. For an uploaded video, Record exports the whole video from start to end.

Exports are saved to your Downloads folder as `.mp4` (Chrome/Edge) or `.webm` (Firefox).

> **Webcam blocked offline?** Some browsers refuse camera access for files opened from disk. If that happens, run
> `python -m http.server` in this folder and open http://localhost:8000 instead.

## How it works

Each frame is shrunk so that one pixel equals one character cell. The brightness of that pixel decides which character
is drawn (ASCII styles) or how bright it is (Matrix-like styles). Falling "rain" trails in each column light up the
image as they pass. Recording uses the browser's built-in `MediaRecorder`.

| File | What it is |
|------|------------|
| `index.html` | The page and its controls |
| `css/style.css` | All styling |
| `js/styles.js` | The ASCII styles (add your own here) |
| `js/filter.js` | Turns a video frame into characters + rain |
| `js/sources.js` | Webcam and uploaded-video input |
| `js/recorder.js` | Recording and downloading the result |
| `js/app.js` | Connects the controls to everything above |
