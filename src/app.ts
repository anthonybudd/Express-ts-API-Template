import 'dotenv/config';
import ErrorHandler from './providers/ErrorHandler';
import { rateLimit } from 'express-rate-limit';
import fileUpload from 'express-fileupload';
import express from 'express';
// import cron from 'node-cron';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import './models/Relationships';


////////////////////////////////////////////////
// Controllers
import { app as Auth } from './routes/Auth';
import { app as User } from './routes/User';
import { app as Groups } from './routes/Groups';


const isTest = (process.env.NODE_ENV === 'test');
if (!isTest) console.log('*************************************');
if (!isTest) console.log('* express-api');
if (!isTest) console.log('*');
if (!isTest) console.log('* ENV');
if (!isTest) console.log(`* NODE_ENV: ${process.env.NODE_ENV}`);
if (!isTest) console.log((process.env.H_CAPTCHA_SECRET) ? `* H_CAPTCHA_SECRET: Enabled` : `* ⚠️ H_CAPTCHA_SECRET not set. Login/Sign-up requests will not require captcha validadation!`);
if (!isTest) console.log('*');


////////////////////////////////////////////////
// Express
const app = express();
app.disable('x-powered-by');
if (!isTest) app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    parseNested: true,
    tempFileDir: '/tmp',
}));
app.get('/_readiness', (req, res) => res.send('healthy'));
app.get('/api/v1/_healthcheck', (req, res) => res.json({ message: 'healthy' }));
if (!isTest) app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000,
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
}));


////////////////////////////////////////////////
// Cron Jobs
// cron.schedule('*/5 * * * *', async () => console.log('Cron task executed'));


////////////////////////////////////////////////
// HTTP
app.use('/api/v1/', Auth);
app.use('/api/v1/', User);
app.use('/api/v1/', Groups);
app.use(ErrorHandler);

export default app;
