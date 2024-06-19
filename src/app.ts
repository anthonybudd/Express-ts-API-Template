require('dotenv').config();
import fileUpload from 'express-fileupload';
import ErrorHandler from './providers/ErrorHandler';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import './models/Relationships';

// Controllers
import { app as Auth } from './routes/Auth';
import { app as User } from './routes/User';
import { app as Groups } from './routes/Groups';


console.log('*************************************');
console.log('* Express.ts API Boilerplate');
console.log('*');
console.log('* ENV');
console.log(`* NODE_ENV: ${process.env.NODE_ENV}`);
(process.env.H_CAPTCHA_SECRET) ? console.log(`* H_CAPTCHA_SECRET: Enabled`) : console.log(`* ⚠️ H_CAPTCHA_SECRET not set. Login/Sign-up requests will not require captcha validadation!`);
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
app.use('/api/v1/', Auth);
app.use('/api/v1/', User);
app.use('/api/v1/', Groups);
app.use('/api/v1/', Books);
app.use(ErrorHandler);

export default app;
