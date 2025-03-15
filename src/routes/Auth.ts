import { body, validationResult, matchedData } from 'express-validator';
import generateJWT from './../providers/GenerateJWT';
import { User, UserModel } from './../models/User';
import { GroupUser } from './../models/GroupUser';
import { ucFirst } from './../providers/Helpers';
import passport from './../providers/Passport';
import { Group } from './../models/Group';
import Email from './../providers/Email';
import middleware from './middleware';
import { v4 as uuidv4 } from 'uuid';
import * as OTPAuth from "otpauth";
import bcrypt from 'bcryptjs';
import express from 'express';
import crypto from 'crypto';
import day from 'dayjs';

export const app = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication routes
 * 
 * components:
 *   schemas:
 *     AccessToken:
 *       properties:
 *         accessToken:
 *           type: string
 */


/**
 * @swagger
 * /_authcheck:
 *   get:
 *     description: Check if access token is valid
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auth:
 *                   type: boolean
 *                 id:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
app.get('/_authcheck', [
    passport.authenticate('jwt', { session: false })
], async (req: express.Request, res: express.Response) => res.json({
    auth: true,
    id: req.user.id
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     description: Get access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               token:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 description: Optional MFA code if enabled for account
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/AccessToken'
 *       401:
 *         description: Invalid credentials or MFA code
 *       403:
 *         description: MFA code required but not provided
 *       422:
 *         description: Validation errors
 */
app.post('/auth/login', [
    body('email').exists().toLowerCase(),
    body('password').exists(),
    body('token').optional().isLength({ min: 6, max: 6 }),
    middleware.hCaptcha,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { mfaRequired } = await User.scope('mfa').findOne({
            where: {
                email: req.body.email
            },
            rejectOnEmpty: true
        });

        if (mfaRequired && !req.body.token) {
            return res.status(403).json({ message: 'MFA is enabled for this account', code: 403 });
        } else {
            return next();
        }
    },
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { token } = matchedData(req);

    passport.authenticate('local', { session: false }, async (err: Error | null, user: UserModel | null) => {
        if (err) throw err;
        if (!user) return res.status(401).json({ message: 'Incorrect email or password', code: 401 });

        const { mfaRequired, email: label, mfaSecret } = await User.scope('mfa').findByPk(user.get('id'), { rejectOnEmpty: true });
        if (mfaRequired) {
            const totp = new OTPAuth.TOTP({
                issuer: 'express-api',
                label,
                algorithm: 'SHA3-512',
                digits: 6,
                period: 30,
                secret: mfaSecret as string,
            });
            const delta = totp.validate({ token: token, window: 1 });
            if (delta === null) return res.status(401).json({ message: 'Invalid MFA code', code: 401 });
        }

        req.login(user, { session: false }, (err: Error) => {
            if (err) throw err;

            res.json({
                accessToken: generateJWT(user, { expiresIn: "24h" })
            });

            User.update({
                lastLoginAt: day().format('YYYY-MM-DD HH:mm:ss'),
            }, {
                where: {
                    id: user.get('id')
                },
            });
        });
    })(req, res, next);
});

/**
 * @openapi
 * /auth/sign-up:
 *   post:
 *     description: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - tos
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password (must meet strength requirements)
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name (optional)
 *               groupName:
 *                 type: string
 *                 description: Name for the user's default group (optional)
 *               tos:
 *                 type: boolean
 *                 description: Acceptance of Terms of Service
 *     responses:
 *       200:
 *         description: Successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/AccessToken'
 *       422:
 *         description: Validation errors (email taken, weak password, etc.)
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
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
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
            mfaEnabled: false,
            firstName: ucFirst(data.firstName),
            lastName: ucFirst(data.lastName),
            lastLoginAt: day().format("YYYY-MM-DD HH:mm:ss"),
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
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /auth/verify-email/{emailVerificationKey}:
 *   get:
 *     description: Verify a user's email address using the verification key
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: emailVerificationKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification key sent to the user's email
 *       - in: query
 *         name: redirect
 *         schema:
 *           type: string
 *           enum: ['1']
 *         description: If set to '1', redirects to frontend after verification
 *     responses:
 *       200:
 *         description: Email successfully verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                 id:
 *                   type: string
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
 * @openapi
 * /auth/forgot:
 *   post:
 *     description: Request a password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const { email } = matchedData(req);

        const user = await User.findOne({
            where: { email },
            rejectOnEmpty: true
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
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /auth/get-user-by-reset-key/{passwordResetKey}:
 *   get:
 *     description: Get user information by password reset key
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: passwordResetKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset key sent to the user's email
 *     responses:
 *       200:
 *         description: Returns user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 */
app.get('/auth/get-user-by-reset-key/:passwordResetKey', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user = await User.findOne({
            where: {
                passwordResetKey: req.params.passwordResetKey
            },
            attributes: ['id', 'email'],
            rejectOnEmpty: true,
        });

        return res.json({
            id: user.id,
            email: user.email
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /auth/reset:
 *   post:
 *     description: Reset user password using reset key
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - passwordResetKey
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: New password (must meet strength requirements)
 *               passwordResetKey:
 *                 type: string
 *                 description: Password reset key sent to the user's email
 *     responses:
 *       200:
 *         description: Password successfully reset and user logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/AccessToken'
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
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const { email, password, passwordResetKey } = matchedData(req);

        const user = await User.findOne({
            where: { email, passwordResetKey },
            include: [Group],
            rejectOnEmpty: true
        });

        await user.update({
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
            passwordResetKey: null,
        });

        return passport.authenticate('local', { session: false }, (err: Error | null, user: UserModel | null) => {
            if (err) throw err;
            if (!user) throw new Error('User not found');

            req.login(user, { session: false }, (err) => {
                if (err) throw err;

                return res.json({ accessToken: generateJWT(user, { expiresIn: "24h" }) });
            });
        })(req, res);
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /auth/get-user-by-invite-key/{inviteKey}:
 *   get:
 *     description: Get user information by invite key
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: inviteKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation key sent to the user's email
 *     responses:
 *       200:
 *         description: Returns basic user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User's email address
 */
app.get('/auth/get-user-by-invite-key/:inviteKey', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user = await User.findOne({
            where: {
                inviteKey: req.params.inviteKey
            },
            attributes: ['id', 'email'],
            rejectOnEmpty: true
        });

        return res.json({
            id: user.id,
            email: user.email
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /auth/invite:
 *   post:
 *     description: Accept an invitation and create a user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - tos
 *               - inviteKey
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password (must meet strength requirements)
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name (optional)
 *               tos:
 *                 type: boolean
 *                 description: Acceptance of Terms of Service
 *               inviteKey:
 *                 type: string
 *                 description: Invitation key received via email
 *     responses:
 *       200:
 *         description: Successfully accepted invitation and created account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/AccessToken'
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
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        const user = await User.findOne({
            where: { inviteKey: data.inviteKey },
            rejectOnEmpty: true
        });

        await user.update({
            password: bcrypt.hashSync(data.password, bcrypt.genSaltSync(10)),
            firstName: ucFirst(data.firstName),
            lastName: ucFirst(data.lastName),
            lastLoginAt: day().format('YYYY-MM-DD HH:mm:ss'),
            tos: data.tos,
            inviteKey: null,
            emailVerified: true,
            emailVerificationKey: null,
        });

        return passport.authenticate('local', { session: false }, (err: Error | null, user: UserModel | null) => {
            if (err) throw err;
            if (!user) throw new Error('User not found');

            req.login(user, { session: false }, (err) => {
                if (err) throw err;

                return res.json({ accessToken: generateJWT(user, { expiresIn: "24h" }) });
            });
        })(req, res);
    } catch (error) {
        next(error);
    }
});
