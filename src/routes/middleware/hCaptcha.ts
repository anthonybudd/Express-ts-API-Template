import { NextFunction, Request, Response } from 'express';
import hCaptcha from './../../providers/hCaptcha';

export default async (req: Request, res: Response, next: NextFunction) => {

    const htoken = req.body.htoken;

    // Skip hCaptcha validation if running tests
    if (typeof global.it === 'function') {
        return next();
    }

    if (!process.env.H_CAPTCHA_SECRET) {
        console.log(`⚠️  Warning: H_CAPTCHA_SECRET not set, skipping captcha validadation`);
        return next();
    }

    if (!htoken) return res.status(422).json({
        errors: {
            htoken: {
                location: 'body',
                param: 'htoken',
                msg: 'You must complete the captcha'
            }
        }
    });

    const { data } = await hCaptcha.verify(htoken);

    if (data.success) return next();

    return res.status(422).json({
        errors: {
            htoken: {
                location: 'body',
                param: 'htoken',
                msg: 'Captcha validation failed.'
            }
        }
    });
};
