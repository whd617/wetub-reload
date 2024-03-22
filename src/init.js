import 'dotenv/config';
import connect from './db'; // mongoDB Atlas를 사용시 꼭 연결해줘야한다.
import './models/Video';
import './models/User';
import './models/Comment';
import app from './server';

const PORT = 4000;
connect(); // mongoDB Atlas를 사용시 꼭 연결해줘야한다.

const handleListening = () =>
   console.log(`Server listenting on port http://localhost:${PORT}🚀`);

app.listen(PORT, handleListening);
