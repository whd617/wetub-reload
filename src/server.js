import express from 'express';

const PORT = 4000;

const app = express(); // express function을 사용하면 express application을 생성해준다.

app.get('/', () => console.log('Somebody is trying to go home.')); // app이라는 application에 누군가가 어떤 route로, 이 경우엔 home으로 get request를 보낸다면, 반응하는 callback을 추가하는 것이다.

const handleListening = () =>
  console.log(`Server listenting on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening);
