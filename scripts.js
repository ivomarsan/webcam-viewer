const controlBar = document.querySelector('#WebcamViewer__controlBar');
const videoWrapper = document.querySelector('#WebcamViewer__videoWrapper');
const videoStreaming = document.querySelector('#WebcamViewer__videoStreaming');
const audioSourceSelect = document.querySelector('#WebcamViewer__audioSourceSelect');
const videoSourceSelect = document.querySelector('#WebcamViewer__videoSourceSelect');
const fillContentCheckbox = document.querySelector('#WebcamViewer__fillContentCheckbox');

audioSourceSelect.onchange = getStream;
videoSourceSelect.onchange = getStream;

getStream().then(getDevices).then(gotDevices);

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos; // make available to console
  
  for (const deviceInfo of deviceInfos) {
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || `Microphone ${audioSourceSelect.length + 1}`;
      audioSourceSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `Camera ${videoSourceSelect.length + 1}`;
      videoSourceSelect.appendChild(option);
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  const audioSource = audioSourceSelect.value;
  const videoSource = videoSourceSelect.value;
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {
      deviceId: videoSource ? {exact: videoSource} : undefined,
      width: {
        min: 1280,
        ideal: 1920,
        max: 2560,
      },
      height: {
        min: 720,
        ideal: 1080,
        max: 1440,
      }
    }
  };

  return navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(error => console.error(error));
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console

  audioSourceSelect.selectedIndex = [...audioSourceSelect.options].
    findIndex(option => option.text === stream.getAudioTracks()[0].label);

  videoSourceSelect.selectedIndex = [...videoSourceSelect.options].
    findIndex(option => option.text === stream.getVideoTracks()[0].label);

  videoStreaming.srcObject = stream;
}

function getFullscreenElement() {
  return document.fullscreenElement   //standard property
  || document.webkitFullscreenElement //safari/opera support
  || document.mozFullscreenElement    //firefox support
  || document.msFullscreenElement;    //ie/edge support
}

function toggleFullscreen() {
  if(getFullscreenElement()) {
    document.exitFullscreen();
  }else {
    document.documentElement.requestFullscreen().catch(console.log);
  }
}

let idleTimer = null;
let isControlBarVisible = false;

function showControlBar(time) {
  clearTimeout(idleTimer);
  const controlBarVisibleClass = 'WebcamViewer__controlBar--isVisible'

  if (isControlBarVisible) {
    controlBar.classList.add(controlBarVisibleClass)
  }
  
  isControlBarVisible = false;
  idleTimer = setTimeout(function() {
    controlBar.classList.remove(controlBarVisibleClass)
    isControlBarVisible = true;
  }, time);
}

document.addEventListener('mousemove', () => showControlBar(2000))

showControlBar(0);

videoWrapper.addEventListener('dblclick', () => {
  toggleFullscreen();
});

fillContentCheckbox.addEventListener('click', ({ target }) => {
  const isChecked = target?.checked
  const fillContentClass = 'WebcamViewer__videoStreaming--fillContent'

  if (isChecked) {
    videoStreaming.classList.add(fillContentClass)
  } else {
    videoStreaming.classList.remove(fillContentClass)
  }
}, false);