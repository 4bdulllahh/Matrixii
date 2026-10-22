// The filter: draws each video frame as a grid of characters with falling rain trails.
const MAX_WIDTH = 1280;
const TRAIL = 0.4; // rain trail length as a fraction of the screen height

// one pixel per character cell; the browser does the downscaling for us
const sample = document.createElement('canvas');
const sctx = sample.getContext('2d', { willReadFrequently: true });

const grid = { cols: 0, rows: 0, cell: 0, glyphs: [], drops: [], speeds: [] };

const randomChar = style => style.chars[Math.floor(Math.random() * style.chars.length)];
const randomSpeed = () => 0.2 + Math.random() * 0.4; // rows per frame

// Rebuild the grid for the current video size, cell size and style.
function setupGrid(out, video, cell, style) {
  if (!video.videoWidth) return;
  const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
  out.width = Math.round(video.videoWidth * scale);
  out.height = Math.round(video.videoHeight * scale);

  grid.cell = cell;
  grid.cols = sample.width = Math.ceil(out.width / cell);
  grid.rows = sample.height = Math.ceil(out.height / cell);
  grid.glyphs = Array.from({ length: grid.cols * grid.rows }, () => randomChar(style));
  grid.drops = Array.from({ length: grid.cols }, () => Math.random() * grid.rows * 2 - grid.rows);
  grid.speeds = Array.from({ length: grid.cols }, randomSpeed);

  // resizing a canvas resets its context state
  const ctx = out.getContext('2d');
  ctx.font = `${cell}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

// Brightness 0..1 of one pixel after invert and contrast.
function brightness(r, g, b, invert, contrast) {
  let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (invert) lum = 1 - lum;
  return Math.min(1, Math.max(0, (lum - 0.5) * contrast + 0.5));
}

// How strongly the falling drop in this column lights row r: 1 at the head, fading to 0 along the trail.
function rainBoost(c, r, trail) {
  const d = grid.drops[c] - r;
  return d >= 0 && d < trail ? 1 - d / trail : 0;
}

// s = { style, rain, contrast, invert, color, mirror }
function drawFrame(out, video, s) {
  const { cols, rows, cell, glyphs, drops, speeds } = grid;
  if (!cols) return;
  const ctx = out.getContext('2d');

  sctx.setTransform(s.mirror ? -1 : 1, 0, 0, 1, s.mirror ? cols : 0, 0);
  sctx.drawImage(video, 0, 0, cols, rows);
  const px = sctx.getImageData(0, 0, cols, rows).data;

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, out.width, out.height);

  const { style, rain } = s, trail = rows * TRAIL, last = style.chars.length - 1;
  let fill = '';

  for (let c = 0; c < cols; c++) {
    drops[c] += speeds[c];
    if (drops[c] - trail > rows) { drops[c] = -Math.random() * rows * 0.5; speeds[c] = randomSpeed(); }

    for (let r = 0; r < rows; r++) {
      const k = r * cols + c, i = k * 4;
      let R = px[i], G = px[i + 1], B = px[i + 2];
      if (s.invert) { R = 255 - R; G = 255 - G; B = 255 - B; }
      const boost = rainBoost(c, r, trail);
      // rain = 0: plain ASCII video; rain = 1: the image only shows inside falling trails
      const v = Math.min(1, brightness(px[i], px[i + 1], px[i + 2], s.invert, s.contrast) * (1 - rain + rain * boost * 1.6));
      if (v < 0.06) continue;

      const head = rain > 0 && boost > 1 - 1 / trail;
      let ch;
      if (style.ramp) {
        ch = style.chars[Math.round(v * last)];
        if (ch === ' ') continue;
      } else {
        if (head || Math.random() < 0.002) glyphs[k] = randomChar(style);
        ch = glyphs[k];
      }

      const f = head && !style.ramp ? '#eaffea' : s.color ? `rgb(${R},${G},${B})` : style.color;
      if (f !== fill) ctx.fillStyle = fill = f;
      // square root lifts mid-tones (faces, skin) that thin glyphs would otherwise render too faint
      ctx.globalAlpha = style.ramp ? 1 : Math.sqrt(v);
      ctx.fillText(ch, c * cell + cell / 2, r * cell + cell / 2);
    }
  }
}
