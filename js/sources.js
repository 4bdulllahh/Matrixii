// Video sources: the webcam and uploaded files. Both play into the hidden <video> element.
let audioCtx = null, audioDest = null;

function stopSource(video) {
  if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
  if (video.src) URL.revokeObjectURL(video.src);
  video.srcObject = null;
  video.removeAttribute('src');
}

async function startWebcam(video) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
  stopSource(video);
  video.srcObject = stream;
  await video.play();
}

function loadFile(video, file) {
  stopSource(video);
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
  return video.play();
}

// Sound of the uploaded file, for the recorder (the webcam has none).
const fileAudioTracks = () => audioDest ? audioDest.stream.getAudioTracks() : [];
