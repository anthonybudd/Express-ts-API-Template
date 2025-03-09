import { body, validationResult, matchedData } from 'express-validator';
import { User, UserModel } from './../models/User';
import passport from './../providers/Passport';
import Email from './../providers/Email';
import middleware from './middleware';
import Group from './../models/Group';
import bcrypt from 'bcryptjs';
import express from 'express';

export const app = express.Router();


/**
 * GET /api/v1/user
 * 
 */
app.get('/user', [
    passport.authenticate('jwt', { session: false })
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        return res.json(await User.findByPk(req.user.id, {
            include: [Group],
            rejectOnEmpty: true,
        }));
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/v1/user
 * 
 */
app.post('/user', [
    passport.authenticate('jwt', { session: false }),
    body('firstName').optional(),
    body('lastName').optional(),
    body('bio').optional(),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);
        const user = await User.findByPk(req.user.id, { rejectOnEmpty: true });
        await user.update(data);
        return res.json(user);
    } catch (error) {
        next(error);
    }
});


/**
 * GET /api/v1/user/resend-verification-email
 * 
 */
app.post('/user/resend-verification-email', [
    passport.authenticate('jwt', { session: false }),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user = await User.findByPk(req.user.id, { rejectOnEmpty: true });
        await user.update({
            emailVerificationKey: String(Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111),
        });

        //////////////////////////////////////////
        // EMAIL THIS LINK TO THE USER
        const link = `${process.env.BACKEND_URL}/auth/verify-email/${user.emailVerificationKey}?redirect=1`;
        if (typeof global.it !== 'function') console.log(`\n\nEMAIL THIS TO THE USER\nEMAIL VERIFICATION LINK: ${link}\n\n`);
        // const html = Email.generate('Verify', { link, code: user.emailVerificationKey });
        //////////////////////////////////////////

        return res.json({ email: user.email });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/v1/user/update-password
 * 
 * Update Password
 */
app.post('/user/update-password', [
    passport.authenticate('jwt', { session: false }),
    middleware.checkPassword,
    body('newPassword')
        .notEmpty()
        .exists(),
    body('password')
        .notEmpty()
        .exists(),
    middleware.isStrongPassword,
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        await User.unscoped().update({
            password: bcrypt.hashSync(data.newPassword, bcrypt.genSaltSync(10)),
        }, {
            where: {
                id: req.user.id,
            }
        });

        return res.json({ success: true });
    } catch (error) {
        next(error);
    }
});
