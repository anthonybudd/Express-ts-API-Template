import { body, validationResult, matchedData } from 'express-validator';
import { User, UserModel } from './../models/User';
import passport from './../providers/Passport';
import Email from './../providers/Email';
import middleware from './middleware';
import Group from './../models/Group';
import bcrypt from 'bcrypt-nodejs';
import express from 'express';

export const app = express.Router();


/**
 * GET /api/v1/user
 * 
 */
app.get('/user', [
    passport.authenticate('jwt', { session: false })
], async (req: express.Request, res: express.Response) => {
    const user = await User.findByPk(req.user.id, {
        include: [Group],
    });

    if (!user) return res.status(404).send('User not found');

    return res.json(user);
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
], async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const data = matchedData(req);

    await User.update(data, { where: { id: req.user.id } });

    return res.json(
        await User.findByPk(req.user.id)
    );
});


/**
 * GET /api/v1/user/resend-verification-email
 * 
 */
app.post('/user/resend-verification-email', [
    passport.authenticate('jwt', { session: false }),
], async (req: express.Request, res: express.Response) => {
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({
        msg: 'User not found',
        code: 40403
    });

    await user.update({
        emailVerificationKey: String(Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111),
    });


    //////////////////////////////////////////
    // EMAIL THIS TO THE USER
    const link = `${process.env.BACKEND_URL}/auth/verify-email/${user.emailVerificationKey}?redirect=1`;
    if (typeof global.it !== 'function') console.log(`\n\nEMAIL THIS TO THE USER\nEMAIL VERIFICATION LINK: ${link}\n\n`);

    // const html = Email.generate('Verify', { link, code: user.emailVerificationKey });
    //////////////////////////////////////////

    return res.json({ email: user.email });
});


/**
 * POST /api/v1/user/update-password
 * 
 * Update Password
 */
app.post('/user/update-password', [
    passport.authenticate('jwt', { session: false }),
    middleware.checkPassword,
    body('password')
        .notEmpty()
        .exists(),
    middleware.isStrongPassword,
], async (req: express.Request, res: express.Response) => {
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
});
