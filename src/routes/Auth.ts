import { body, validationResult, matchedData } from 'express-validator';
import generateJWT from './../providers/GenerateJWT';
import { User, UserModel } from './../models/User';
import { GroupUser } from './../models/GroupUser';
import { ucFirst } from './../providers/Helpers';
import passport from './../providers/Passport';
import Email from './../providers/Email';
import { Group } from './../models/Group';
import middleware from './middleware';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt-nodejs';
import express from 'express';
import moment from 'moment';
import crypto from 'crypto';

export const app = express.Router();


/**
 * GET /api/v1/_authcheck
 * 
 * Helper route for testing auth status
 */
app.get('/_authcheck', [
    passport.authenticate('jwt', { session: false })
], async (req: express.Request, res: express.Response) => res.json({
    auth: true,
    id: req.user.id
}));


/**
 * POST api/v1/auth/login
 * 
 */
app.post('/auth/login', [
    body('email').exists().toLowerCase(),
    body('password').exists(),
    middleware.hCaptcha,
], async (req: express.Request, res: express.Response, next: Function) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });

    passport.authenticate('local', { session: false }, (err: Error | null, user: UserModel | null) => {
        if (err) throw err;
        if (!user) return res.status(401).json({ message: 'Incorrect email or password', code: 401 });

        req.login(user, { session: false }, (err: Error) => {
            if (err) throw err;

            res.json({
                accessToken: generateJWT(user, { expiresIn: "24h" })
            });

            User.update({
                lastLoginAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            }, {
                where: {
                    id: user.get('id')
                },
            });
        });
    })(req, res, next);
});


/**
 * POST /api/v1/auth/sign-up
 * 
 */
app.post('/auth/sign-up', [
    body('email')
        .isEmail()
        .trim()
        .toLowerCase()
        .custom(async (email) => {
            const user = await User.findOne({ where: { email } });
            if (user) throw new Error('This email address is taken');
        }),
    body('password')
        .notEmpty()
        .exists(),
    body('firstName', 'You must provide your first name')
        .notEmpty()
        .exists(),
    body('lastName')
        .default('')
        .optional(),
    body('groupName')
        .optional(),
    body('tos', 'You must accept the Terms of Service to use this platform')
        .exists()
        .notEmpty(),
    middleware.isStrongPassword,
    middleware.hCaptcha,
], async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const data = matchedData(req);

    const userID = uuidv4();
    const groupID = uuidv4();
    if (!data.lastName) data.lastName = '';
    if (!data.groupName) data.groupName = data.firstName.concat("'s Team");

    await Group.create({
        id: groupID,
        name: data.groupName,
        ownerID: userID,
    });

    await GroupUser.create({ userID, groupID, role: 'Admin' });

    const user = await User.create({
        id: userID,
        email: data.email,
        password: bcrypt.hashSync(data.password, bcrypt.genSaltSync(10)),
        firstName: ucFirst(data.firstName),
        lastName: ucFirst(data.lastName),
        lastLoginAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        tos: data.tos,
        emailVerificationKey: String(Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111),
    });


    //////////////////////////////////////////
    // EMAIL THIS TO THE USER
    const link = `${process.env.BACKEND_URL}/auth/verify-email/${user.emailVerificationKey}?redirect=1`;
    if (typeof global.it !== 'function') console.log(`\n\nEMAIL THIS TO THE USER\nEMAIL VERIFICATION LINK: ${link}\n\n`);

    // const html = Email.generate('Verify', { link, code: user.emailVerificationKey });
    //////////////////////////////////////////


    return passport.authenticate('local', { session: false }, (err: Error, user: UserModel) => {
        if (err) throw err;

        req.login(user, { session: false }, (err) => {
            if (err) throw err;

            res.json({
                accessToken: generateJWT(user, { expiresIn: "24h" })
            });
        });
    })(req, res);
});


/**
 * GET /api/v1/auth/verify-email/:emailVerificationKey
 * 
 */
app.get('/auth/verify-email/:emailVerificationKey', async (req: express.Request, res: express.Response) => {
    const user = await User.findOne({
        where: {
            emailVerificationKey: req.params.emailVerificationKey
        }
    });

    if (!user) return res.status(404).json({
        msg: 'Invalid verification code',
        code: 40402
    });

    await user.update({
        emailVerified: true,
        emailVerificationKey: null,
    });

    if (req.query.redirect === '1') return res.redirect(`${process.env.FRONTEND_URL}?email_verified=1`);
    return res.json({ verified: true, id: user.id });
});


/**
 * POST /api/v1/auth/forgot
 * 
 */
app.post('/auth/forgot', [
    body('email')
        .isEmail()
        .toLowerCase()
        .custom(async (email) => {
            const user = await User.findOne({ where: { email } });
            if (!user) throw new Error('This email address does not exist');
        }),
    middleware.hCaptcha,
], async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { email } = matchedData(req);

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({
        msg: 'User not found',
        code: 40401
    });

    const passwordResetKey = crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');

    await user.update({ passwordResetKey });

    //////////////////////////////////////////
    // EMAIL THIS TO THE USER
    const link = `${process.env.FRONTEND_URL}/reset/${passwordResetKey}`;
    if (typeof global.it !== 'function') console.log(`\n\nEMAIL THIS TO THE USER\nPASSWORD RESET LINK: ${link}\n\n`);

    // const html = Email.generate('Reset', { link })
    //////////////////////////////////////////

    return res.json({ success: true });
});


/**
 * GET /api/v1/auth/get-user-by-reset-key/:passwordResetKey
 * 
 */
app.get('/auth/get-user-by-reset-key/:passwordResetKey', async (req: express.Request, res: express.Response) => {
    const user = await User.findOne({
        where: {
            passwordResetKey: req.params.passwordResetKey
        },
    });
    if (!user) return res.status(404).send('Not found');

    return res.json({
        id: user.id,
        email: user.email
    });
});


/**
 * POST /api/v1/auth/reset
 * 
 */
app.post('/auth/reset', [
    body('email')
        .isEmail()
        .toLowerCase()
        .custom(async (email) => {
            const user = await User.findOne({ where: { email } });
            if (!user) throw new Error('This email address does not exist');
        }),
    body('password')
        .notEmpty()
        .exists(),
    body('passwordResetKey', 'This link has expired')
        .custom(async (passwordResetKey) => {
            if (!passwordResetKey) throw new Error('This link has expired');
            const user = await User.findOne({ where: { passwordResetKey } });
            if (!user) throw new Error('This link has expired');
        }),
    middleware.isStrongPassword,
    middleware.hCaptcha,
], async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { email, password, passwordResetKey } = matchedData(req);

    const user = await User.findOne({
        where: { email, passwordResetKey },
        include: [Group],
    });
    if (!user) return res.status(404).send('Not found');

    await user.update({
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        passwordResetKey: null,
    });

    return passport.authenticate('local', { session: false }, (err: Error | null, user: UserModel | null) => {
        if (err) throw err;

        if (!user) return res.status(401).json({ message: 'Error', code: 401 });
        req.login(user, { session: false }, (err) => {
            if (err) throw err;

            return res.json({ accessToken: generateJWT(user, { expiresIn: "24h" }) });
        });
    })(req, res);
});


/**
 * GET /api/v1/auth/get-user-by-invite-key/:inviteKey
 * 
 */
app.get('/auth/get-user-by-invite-key/:inviteKey', async (req: express.Request, res: express.Response) => {
    const user = await User.findOne({
        where: {
            inviteKey: req.params.inviteKey
        },
    });
    if (!user) return res.status(404).send('Not found');

    return res.json({
        id: user.id,
        email: user.email
    });
});


/**
 * POST /api/v1/auth/invite
 * 
 */
app.post('/auth/invite', [
    body('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .toLowerCase(),
    body('password')
        .notEmpty()
        .exists(),
    body('firstName', 'You must provide your first name')
        .exists(),
    body('lastName'),
    body('tos', 'You must accept the Terms of Service to use this platform')
        .exists(),
    body('inviteKey').exists(),
    middleware.isStrongPassword,
    middleware.hCaptcha,
], async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const data = matchedData(req);

    const user = await User.findOne({ where: { inviteKey: data.inviteKey } });
    if (!user) return res.status(404).send('Not found');
    await user.update({
        password: bcrypt.hashSync(data.password, bcrypt.genSaltSync(10)),
        firstName: ucFirst(data.firstName),
        lastName: ucFirst(data.lastName),
        lastLoginAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        tos: data.tos,
        inviteKey: null,
        emailVerified: true,
        emailVerificationKey: null,
    });

    return passport.authenticate('local', { session: false }, (err: Error | null, user: UserModel | null) => {
        if (err) throw err;

        if (!user) return res.status(401).json({ message: 'Error', code: 401 });
        req.login(user, { session: false }, (err) => {
            if (err) throw err;
            return res.json({ accessToken: generateJWT(user, { expiresIn: "24h" }) });
        });
    })(req, res);
});
