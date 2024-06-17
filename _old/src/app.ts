require('dotenv').config();
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import fileUpload from 'express-fileupload';

// Controllers
import { app as Auth } from './routes/Auth';
import { app as User } from './routes/User';
// import Groups from './routes/Groups';


console.log('*************************************');
console.log('* Express.ts API Boilerplate');
console.log('*');
console.log('* ENV');
console.log(`* NODE_ENV: ${process.env.NODE_ENV}`);
(process.env.H_CAPTCHA_SECRET === null) ? console.log(`* H_CAPTCHA_SECRET: null ⚠️  Login/Sign-up requests will not require captcha validadation!`) : console.log(`* H_CAPTCHA_SECRET: Enabled`);
console.log('*');
console.log('*');


////////////////////////////////////////////////
// Express
const app = express();
app.disable('x-powered-by');
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
  parseNested: true,
}));
app.get('/_readiness', (req, res) => res.send('healthy'));
app.get('/api/v1/_healthcheck', (req, res) => res.json({ messsage: 'healthy' }));


////////////////////////////////////////////////
// HTTP
// app.use('/api/v1', api);
app.use('/api/v1/', Auth);
// app.use('/api/v1/', User);
// app.use('/api/v1/', Groups);

export default app;
