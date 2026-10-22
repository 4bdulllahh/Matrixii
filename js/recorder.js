// Recording: captures the canvas (plus optional sound) and downloads the result.
let recorder = null;

const isRecording = () => recorder !== null;

function startRecording(canvas, audioTracks, onSaved) {
  const stream = canvas.captureStream(30);
  audioTracks.forEach(t => stream.addTrack(t));
  // mp4 where supported (Chrome/Edge), webm otherwise (Firefox)
  const type = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
  const chunks = [];

  recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8e6 });
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(chunks, { type }));
    a.download = `matrixii-${Date.now()}.${type.startsWith('video/mp4') ? 'mp4' : 'webm'}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    recorder = null;
    onSaved();
  };
  recorder.start(1000);
}

function stopRecording() {
  if (recorder) recorder.stop();
}
