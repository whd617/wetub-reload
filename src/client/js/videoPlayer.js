const video = document.querySelector('video');
const playBtn = document.querySelector('#play');
const playBtnIcon = playBtn.querySelector('i');
const muteBtn = document.getElementById('mute');
const muteBtnIcon = muteBtn.querySelector('i');
const volumeRange = document.getElementById('volume');
const currentTiem = document.getElementById('currentTiem');
const totalTime = document.getElementById('totalTime');
const timeline = document.getElementById('timeline');
const fullScreenBtn = document.getElementById('fullScreen');
const fullScreenBtnIcon = fullScreenBtn.querySelector('i');
const videoContainer = document.getElementById('videoContainer');
const videoControls = document.getElementById('videoControls');

let controlsTimeout = null;
let controlsMovementTimeout = null;
// videoPlayer: html input value갑과 동일하게 설정
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (event) => {
   if (video.paused) {
      // if the video is playing, pause it
      video.play();
   } else {
      // else play the video.
      video.pause();
   }
   playBtnIcon.classList = video.paused ? 'fas fa-play' : 'fas fa-pause';
};

const handleKeyVideo = (event) => {
   if (event.code === 'Space') {
      handlePlayClick();
   }
   if (event.code === 'KeyM') {
      handleMuteClick();
   }
};

const handleMuteClick = (event) => {
   if (video.muted) {
      video.muted = false;
   } else {
      video.muted = true;
   }
   muteBtnIcon.classList = video.muted
      ? 'fas fa-volume-mute'
      : 'fas fa-volume-up';
   volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
   //event.target.value === const {target: { value },} = event;

   const {
      target: { value },
   } = event;
   if (video.muted) {
      video.muted = false;
      muteBtnIcon.classList = 'fas fa-volume-mute';
   }
   if (Number(value) === 0) {
      muteBtnIcon.classList = 'fas fa-volume-mute';
      video.muted = true;
   } else {
      muteBtnIcon.classList = 'fas fa-volume-up';
      video.muted = false;
   }
   // volume이라는 global variable를 업데이트
   volumeValue = value;
   // 비디오의 볼륨을 바꾸는 것
   video.volume = value;
};

const formateTime = (seconds) =>
   new Date(seconds * 1000).toISOString().substr(14, 5);

const handleLoadedMetadata = () => {
   totalTime.innerText = formateTime(Math.floor(video.duration));
   // video의 maximum 설정
   timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
   currentTiem.innerText = formateTime(Math.floor(video.currentTime));
   timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
   // console.log(event.target.value);
   const {
      target: { value },
   } = event;
   video.currentTime = value;
};

const handleFullScreen = () => {
   const fullscreen = document.fullscreenElement;
   if (fullscreen) {
      document.exitFullscreen();
      fullScreenBtnIcon.classList = 'fas fa-expand';
   } else {
      videoContainer.requestFullscreen();
      fullScreenBtnIcon.classList = 'fas fa-compress';
   }
};

const hideControls = () => videoControls.classList.remove('showing');

const handleMouseMove = () => {
   if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      controlsTimeout = null;
   }
   if (controlsMovementTimeout) {
      clearTimeout(controlsMovementTimeout);
      controlsMovementTimeout = null;
   }
   videoControls.classList.add('showing');
   controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
   controlsTimeout = setTimeout(hideControls, 3000);
};

playBtn.addEventListener('click', handlePlayClick);
muteBtn.addEventListener('click', handleMuteClick);
volumeRange.addEventListener('input', handleVolumeChange);
video.addEventListener('loadedmetadata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);
video.addEventListener('click', handlePlayClick);
video.addEventListener('click', handlePlayClick);
document.addEventListener('keyup', handleKeyVideo);
videoContainer.addEventListener('mousemove', handleMouseMove);
videoContainer.addEventListener('mouseleave', handleMouseLeave);
timeline.addEventListener('input', handleTimelineChange);
fullScreenBtn.addEventListener('click', handleFullScreen);
