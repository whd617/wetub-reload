console.log(process.env);
import express from 'express'; // express도 export default로 구성되어져 있다.
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';
import { localMiddleware } from './middlewares';

const app = express(); // express function을 사용하면 express application을 생성해준다.
const logger = morgan('dev');

app.set('view engine', 'pug'); // 뷰 엔진을 pug로 설정
app.set('views', process.cwd() + '/src/views'); // 뷰 엔진의 디렉토리 경로 변경하기
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 위치 중요!

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false, // 로그인한 사용자에게만 cookie와 sessionID를 제공하기 위해 false로 설정
    saveUninitialized: false, // 세션을 수정할 때만 세션을 DB에 저장하고 쿠키를 넘겨주는 기능
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }), // MongoDB에 세션정보가 들어가게 하는 기능(세션들을 database에 저장하도록 만든것이다.)
  }),
);

app.use((req, res, next) => {
  req.sessionStore.all((error, sessions) => {
    next();
  });
});

app.get('/add-one', (req, res, next) => {
  req.session.potato += 1;
  return res.send(`${req.session.id}\n${req.session.potato}`);
});

app.use(localMiddleware);
app.use('/', rootRouter);
app.use('/videos', videoRouter);
app.use('/users', userRouter);

export default app;
