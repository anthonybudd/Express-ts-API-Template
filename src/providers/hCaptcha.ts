import axios from 'axios';
import * as qs from 'qs';

const hCaptcha = axios.create({
    baseURL: 'https://hcaptcha.com',
});

export default {
    verify: async (response: string) => await hCaptcha.post('/siteverify',
        qs.stringify({
            response,
            secret: process.env.H_CAPTCHA_SECRET,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    ),

    axios: hCaptcha,
};
