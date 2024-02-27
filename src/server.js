import express from 'express'; // express도 export default로 구성되어져 있다.
import morgan from 'morgan';
import globalRouter from './routers/globalRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';

const PORT = 4000;

const app = express(); // express function을 사용하면 express application을 생성해준다.
const logger = morgan('dev');

app.set('view engine', 'pug'); // 뷰 엔진을 pug로 설정
app.set('views', process.cwd() + '/src/views'); // 뷰 엔진의 디렉토리 경로 변경하기
app.use(logger);
app.use('/', globalRouter);
app.use('/videos', videoRouter);
app.use('/users', userRouter);

const handleListening = () =>
  console.log(`Server listenting on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening);
