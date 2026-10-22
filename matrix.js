// Matrix ASCII Filter: draws webcam or video frames as Matrix digital rain, entirely in the browser.
const GLYPHS = 'ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
const MAX_WIDTH = 1280;
const TRAIL = 0.4; // rain trail length as a fraction of the screen height

const $ = id => document.getElementById(id);
const video = $('video'), out = $('out'), ctx = out.getContext('2d');
// one pixel per character cell; the browser does the downscaling for us
const sample = document.createElement('canvas');
const sctx = sample.getContext('2d', { willReadFrequently: true });

let cols = 0, rows = 0, cell = 0, glyphs = [], drops = [], speeds = [];
let recorder = null, audioCtx = null, audioDest = null;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
const status = msg => { $('status').textContent = msg; };

function resize() {
  if (!video.videoWidth) return;
  const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
  out.width = Math.round(video.videoWidth * scale);
  out.height = Math.round(video.videoHeight * scale);
  cell = +$('size').value;
  cols = sample.width = Math.ceil(out.width / cell);
  rows = sample.height = Math.ceil(out.height / cell);
  glyphs = Array.from({ length: cols * rows }, randomGlyph);
  drops = Array.from({ length: cols }, () => Math.random() * rows * 2 - rows);
  speeds = Array.from({ length: cols }, () => 0.2 + Math.random() * 0.4);
  // resizing a canvas resets its context state
  ctx.font = `${cell}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

function frame() {
  requestAnimationFrame(frame);
  if (!cols || video.readyState < 2) return;

  const mirror = !!video.srcObject; // mirror the webcam so it feels like a mirror
  sctx.setTransform(mirror ? -1 : 1, 0, 0, 1, mirror ? cols : 0, 0);
  sctx.drawImage(video, 0, 0, cols, rows);
  const px = sctx.getImageData(0, 0, cols, rows).data;

  const rain = $('rain').value / 100, color = $('color').checked, trail = rows * TRAIL;
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, out.width, out.height);
  let style = '';

  for (let c = 0; c < cols; c++) {
    drops[c] += speeds[c];
    if (drops[c] - trail > rows) { drops[c] = -Math.random() * rows * 0.5; speeds[c] = 0.2 + Math.random() * 0.4; }

    for (let r = 0; r < rows; r++) {
      const k = r * cols + c, i = k * 4;
      const lum = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
      const d = drops[c] - r;
      const boost = d >= 0 && d < trail ? 1 - d / trail : 0;
      // rain = 0: plain ASCII video; rain = 1: the image only shows inside falling trails
      const v = Math.min(1, lum * (1 - rain + rain * boost * 1.6));
      if (v < 0.04) continue;

      const head = rain > 0 && d >= 0 && d < 1;
      if (head || Math.random() < 0.002) glyphs[k] = randomGlyph();
      const s = head ? '#eaffea' : color ? `rgb(${px[i]},${px[i + 1]},${px[i + 2]})` : '#00ff41';
      if (s !== style) ctx.fillStyle = style = s;
      ctx.globalAlpha = v;
      ctx.fillText(glyphs[k], c * cell + cell / 2, r * cell + cell / 2);
    }
  }
}

function stopSource() {
  if (recorder) recorder.stop();
  if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
  if (video.src) URL.revokeObjectURL(video.src);
  video.srcObject = null;
  video.removeAttribute('src');
}

$('cam').onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
    stopSource();
    video.srcObject = stream;
    await video.play();
    $('rec').disabled = false;
    status('Webcam live. Press Record to save a clip.');
  } catch (e) {
    status(`Could not open the webcam: ${e.message}`);
  }
};

$('file').onchange = () => {
  const file = $('file').files[0];
  if (!file) return;
  stopSource();
  // route the video's sound through Web Audio once, so recordings can include it
  if (!audioCtx) {
    audioCtx = new AudioContext();
    audioDest = audioCtx.createMediaStreamDestination();
    const src = audioCtx.createMediaElementSource(video);
    src.connect(audioCtx.destination);
    src.connect(audioDest);
  }
  audioCtx.resume();
  video.src = URL.createObjectURL(file);
  video.loop = true;
  video.play().catch(e => status(`Could not play this video: ${e.message}`));
  $('rec').disabled = false;
  status(`Playing ${file.name}. Press Record to export the whole video with the filter.`);
  $('file').value = '';
};

$('rec').onclick = () => {
  if (recorder) return recorder.stop();

  const stream = out.captureStream(30);
  const isFile = !video.srcObject;
  if (isFile) audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
  const type = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
  const chunks = [];
  recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8e6 });
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(chunks, { type }));
    a.download = `matrix-${Date.now()}.${type.startsWith('video/mp4') ? 'mp4' : 'webm'}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    recorder = null;
    video.loop = true;
    if (isFile) video.play();
    $('rec').textContent = 'Record';
    $('rec').classList.remove('on');
    status('Saved to your Downloads folder.');
  };

  if (isFile) { // export the whole video from the start; recording stops at its end
    video.loop = false;
    video.currentTime = 0;
    video.play();
  }
  recorder.start(1000);
  $('rec').textContent = isFile ? 'Stop export' : 'Stop';
  $('rec').classList.add('on');
  status(isFile ? 'Exporting... keep this tab open until the video ends.' : 'Recording...');
};

video.addEventListener('loadedmetadata', resize);
video.addEventListener('resize', resize);
video.addEventListener('ended', () => recorder && recorder.stop());
$('size').oninput = resize;
requestAnimationFrame(frame);
