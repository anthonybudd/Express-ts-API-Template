import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import * as qs from 'qs';

export default async (req: Request, res: Response, next: NextFunction) => {

    const htoken = req.body.htoken;

    // Skip hCaptcha validation if running tests
    if (typeof global.it === 'function') {
        return next();
    }

    if (!process.env.H_CAPTCHA_SECRET) {
        console.log('⚠️  Warning: H_CAPTCHA_SECRET not set, skipping captcha validadation');
        return next();
    }

    if (!htoken) return res.status(422).json({
        errors: {
            htoken: {
                location: 'body',
                param: 'htoken',
                msg: 'You must complete the captcha',
            },
        },
    });

    const { data } = await axios.post('https://hcaptcha.com/siteverify',
        qs.stringify({
            response: htoken,
            secret: process.env.H_CAPTCHA_SECRET,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        },
    );

    if (data.success) return next();

    return res.status(422).json({
        errors: {
            htoken: {
                location: 'body',
                param: 'htoken',
                msg: 'Captcha validation failed.',
            },
        },
    });
};
