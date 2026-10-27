import { NextFunction, Request, Response } from 'express';
import { isTest } from '../../providers/Helpers';
import axios from 'axios';
import * as qs from 'qs';

export default async (req: Request, res: Response, next: NextFunction) => {

    // Skip hCaptcha validation if running tests
    if (isTest) return next();

    if (!process.env.H_CAPTCHA_SECRET) {
        console.log('⚠️  Warning: H_CAPTCHA_SECRET not set, skipping captcha validadation');
        return next();
    }

    if (!req.body.htoken) return res.status(422).json({
        errors: {
            htoken: {
                location: 'body',
                param: 'htoken',
                msg: 'You must complete the captcha',
            },
        },
    });

    const { data } = await axios.post('https://hcaptcha.com/siteverify', qs.stringify({
        response: req.body.htoken,
        secret: process.env.H_CAPTCHA_SECRET,
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (data.success === true) return next();

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
