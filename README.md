# Matrix ASCII Filter

Turn your webcam or any video into **Matrix-style digital rain**. Live, in real time, and 100% on your own computer.

- 🎥 **Live webcam**: see yourself in the Matrix as you move.
- 📁 **Upload a video**: convert it and export the result (with its original sound).
- 🎛️ **Tweak it**: character size, rain amount, Matrix green or original colors.
- 🔒 **Private**: nothing is uploaded anywhere; all processing happens in your browser.
- 📦 **Zero install**: no Python, no OpenCV, no packages. Just open a file.

## How to use

1. [Download the ZIP](../../archive/refs/heads/main.zip) (or `git clone` this repo) and unzip it.
2. Double-click **`index.html`**. It opens in your browser (Chrome, Edge or Firefox).
3. Click **Use webcam** (allow camera access) or **Upload video**.
4. Press **Record** to save a clip. For an uploaded video, Record exports the whole video from start to end.

Exports are saved to your Downloads folder as `.mp4` (Chrome/Edge) or `.webm` (Firefox).

> **Webcam blocked?** Some browsers refuse camera access for files opened from disk. If that happens, run
> `python -m http.server` in this folder and open http://localhost:8000 instead.

## How it works

Each frame is shrunk so that one pixel equals one character cell. The brightness of that pixel sets how bright the
katakana/digit glyph in that cell is drawn. Falling "rain" trails in each column light up the image as they pass, which
gives the digital-rain look. Recording uses the browser's built-in `MediaRecorder`.

| File | What it is |
|------|------------|
| `index.html` | The page: controls, layout and styling |
| `matrix.js` | The filter, webcam/video input and recording |
