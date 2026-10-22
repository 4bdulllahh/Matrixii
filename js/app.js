// App wiring: connects the controls in index.html to the filter, the sources and the recorder.
const $ = id => document.getElementById(id);
const video = $('video'), out = $('out');
const ui = {
  cam: $('cam'), file: $('file'), rec: $('rec'), status: $('status'),
  style: $('style'), size: $('size'), rain: $('rain'), contrast: $('contrast'), invert: $('invert'), color: $('color'),
};

const status = msg => { ui.status.textContent = msg; };
const currentStyle = () => STYLES[ui.style.value];
const isWebcam = () => !!video.srcObject;

// ---------- Filter settings ----------
STYLES.forEach((s, i) => ui.style.add(new Option(s.name, i)));

const relayout = () => setupGrid(out, video, +ui.size.value, currentStyle());

const settings = () => ({
  style: currentStyle(),
  rain: ui.rain.value / 100,
  contrast: ui.contrast.value / 100,
  invert: ui.invert.checked,
  color: ui.color.checked,
  mirror: isWebcam(), // mirror the webcam so it feels like a mirror
});

ui.size.oninput = relayout;
ui.style.onchange = relayout;
video.addEventListener('loadedmetadata', relayout);
video.addEventListener('resize', relayout);

// ---------- Sources ----------
ui.cam.onclick = async () => {
  stopRecording();
  try {
    await startWebcam(video);
    ui.rec.disabled = false;
    status('Webcam live. Press Record to save a clip.');
  } catch (e) {
    status(`Could not open the webcam: ${e.message}`);
  }
};

ui.file.onchange = () => {
  const file = ui.file.files[0];
  if (!file) return;
  stopRecording();
  loadFile(video, file).catch(e => status(`Could not play this video: ${e.message}`));
  ui.rec.disabled = false;
  status(`Playing ${file.name}. Press Record to export the whole video with the filter.`);
  ui.file.value = '';
};

// ---------- Recording ----------
function setRecButton(on) {
  ui.rec.textContent = on ? (isWebcam() ? 'Stop' : 'Stop export') : 'Record';
  ui.rec.classList.toggle('on', on);
}

ui.rec.onclick = () => {
  if (isRecording()) return stopRecording();

  const fromFile = !isWebcam();
  startRecording(out, fromFile ? fileAudioTracks() : [], () => {
    video.loop = true;
    if (fromFile && video.src) video.play();
    setRecButton(false);
    status('Saved to your Downloads folder.');
  });
  if (fromFile) { // export the whole video from the start; recording stops when it ends
    video.loop = false;
    video.currentTime = 0;
    video.play();
  }
  setRecButton(true);
  status(fromFile ? 'Exporting... keep this tab open until the video ends.' : 'Recording...');
};

video.addEventListener('ended', stopRecording);

// ---------- Render loop ----------
function loop() {
  requestAnimationFrame(loop);
  if (video.readyState >= 2) drawFrame(out, video, settings());
}
requestAnimationFrame(loop);
