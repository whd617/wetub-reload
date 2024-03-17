const startBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
   const a = document.createElement('a');
   a.href = videoFile;
   a.download = 'MyRecording.webm'; // a태그는 download라는 걸 갖고 있다.(.webm 이라는 확장자 설정)
   document.body.appendChild(a); // a태그를 body안에 넣기
   a.click(); // 사용자가 링크를 클릭한 것처럼 작동한다.
};

const handleStop = () => {
   startBtn.innerText = 'Download Recording';
   startBtn.removeEventListener('click', handleStop);
   startBtn.addEventListener('click', handleDownload);
   recorder.stop();
};

const handleStart = () => {
   startBtn.innerText = 'Stop Recording';
   startBtn.removeEventListener('click', handleStart);
   startBtn.addEventListener('click', handleStop);
   recorder = new MediaRecorder(stream, { mimeType: 'video / webm' });
   recorder.ondataavailable = (event) => {
      videoFile = URL.createObjectURL(event.data);
      video.srcObject = null;
      video.src = videoFile;
      video.loop = true; // 비디오를 반복재생 시키기
      video.play();
   };
   recorder.start();
};

const init = async () => {
   stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
   });
   video.srcObject = stream; // src 객체이다.
   video.play();
};
init();
startBtn.addEventListener('click', handleStart);
