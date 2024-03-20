import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const actionBtn = document.getElementById('actionBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const files = {
   input: 'recording.webm',
   output: 'output.mp4',
   thumb: 'thumbnail.jpg',
};

const downloadFile = (fileUrl, fileName) => {
   actionBtn.removeEventListener('click', downloadFile);

   actionBtn.innerText = 'Transcodeing...';

   actionBtn.disabled = true;

   const a = document.createElement('a');
   a.href = fileUrl;
   a.download = fileName; // a태그는 download라는 걸 갖고 있다.(.webm 이라는 확장자 설정)
   document.body.appendChild(a); // a태그를 body안에 넣기
   a.click(); // 사용자가 링크를 클릭한 것처럼 작동한다.
};

const handleDownload = async () => {
   const ffmpeg = createFFmpeg({
      log: true,
   });
   await ffmpeg.load();

   ffmpeg.FS('writeFile', files.input, await fetchFile(videoFile));

   await ffmpeg.run('-i', files.input, '-r', '60', files.output);

   await ffmpeg.run(
      '-i',
      files.input,
      '-ss',
      '00:00:01',
      '-frames:v',
      '1',
      files.thumb,
   ); // thumbnail: video의 특정시간을 포맷

   const mp4File = ffmpeg.FS('readFile', files.output); // ffmpeg.FS()를 활용하요 output.mp4파일가져오기
   const thumbnailFile = ffmpeg.FS('readFile', files.thumb); // thumbnail 이미지 읽기

   const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' }); // new Blob()은 안에 배열을 받을 수 있다.
   const thumbnailBlob = new Blob([thumbnailFile.buffer], {
      type: 'image/jpg',
   });

   const mp4Url = URL.createObjectURL(mp4Blob);
   const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

   downloadFile(mp4Url, 'MyRecording.mp4');
   downloadFile(thumbnailUrl, 'MyThumbnail.jpg');

   ffmpeg.FS('unlink', files.input);
   ffmpeg.FS('unlink', files.output);
   ffmpeg.FS('unlink', files.thumb);

   URL.revokeObjectURL(mp4Url);
   URL.revokeObjectURL(thumbnailUrl);
   URL.revokeObjectURL(videoFile);

   actionBtn.disabled = false; // 버튼 블럭처리
   actionBtn.innerHTML = 'Record Again';
   actionBtn.addEventListener('click', handleStart);
};

const handleStart = () => {
   actionBtn.innerText = 'Recording';
   actionBtn.disable = true;
   actionBtn.removeEventListener('click', handleStart);
   recorder = new window.MediaRecorder(stream, { mimeType: 'video/webm' });
   recorder.ondataavailable = (event) => {
      videoFile = URL.createObjectURL(event.data);
      video.srcObject = null;
      video.src = videoFile;
      video.loop = true; // 비디오를 반복재생 시키기
      video.play();
      actionBtn.innerText = 'Download';
      actionBtn.disable = false;
      actionBtn.addEventListener('click', handleDownload);
   };
   recorder.start();
   setTimeout(() => {
      recorder.stop();
   }, 5000); // 영상을 길게 찍게 되면 용량이 커서 저장하는데 오래 걸리므로 녹화 5초로 설정
};

const init = async () => {
   stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
         width: 1024,
         height: 576,
      }, // 영상 크기 조절
   });
   video.srcObject = stream; // src 객체이다.
   video.play();
};
init();
actionBtn.addEventListener('click', handleStart);
