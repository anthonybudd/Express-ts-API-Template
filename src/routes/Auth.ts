import moment from 'moment';
import express from 'express';
import passport from './../providers/passport';
import { body, validationResult } from 'express-validator';
import User from './../models/User';

import MessageResponse from './../interfaces/MessageResponse';
import UserInterface from './../interfaces/UserInterface';

const router = express.Router();


/**
 * POST api/v1/auth/login
 * 
 */
router.post<{}, MessageResponse>('/auth/login', [
    body('email').exists().toLowerCase(),
    body('password').exists(),
], async (req: express.Request, res: express.Response, next: Function) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });

    passport.authenticate('local', { session: false }, (err: Error | null, user: User | null) => {
        // if (err) return errorHandler(err, res);
        if (!user) return res.status(401).json('Incorrect email or password');

        req.login(user, { session: false }, (err: Error) => {
            // if (err) return errorHandler(err, res);

            res.json({
                // accessToken: generateJWT(user)
                accessToken: {}
            });

            // user.update({
            //     lastLoginAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            // });
        });
    })(req, res, next);
});

export default router;
