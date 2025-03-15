import { body, validationResult, matchedData } from 'express-validator';
import passport from './../providers/Passport';
import Email from './../providers/Email';
import middleware from './middleware';
import Group from './../models/Group';
import User from './../models/User';
import * as OTPAuth from 'otpauth';
import bcrypt from 'bcryptjs';
import express from 'express';

export const app = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User
 */

/**
 * @openapi
 * /user:
 *   get:
 *     description: Get the current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
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
 * @openapi
 * /user:
 *   post:
 *     description: Update the current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               bio:
 *                 type: string
 *                 description: User's bio
 *     responses:
 *       200:
 *         description: Returns the current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
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
 * @openapi
 * /user/resend-verification-email:
 *   get:
 *     description: Resend the verification email
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
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
 * @openapi
 * /user/update-password:
 *   post:
 *     description: Update the current user's password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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

/**
 * @openapi
 * /user/enable-mfa:
 *   post:
 *     description: Enable MFA for the current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uri:
 *                   type: string
 */
app.post('/user/enable-mfa', [
    passport.authenticate('jwt', { session: false }),
    middleware.checkPassword,
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        const user = await User.findByPk(req.user.id, { rejectOnEmpty: true });

        const secret = new OTPAuth.Secret({ size: 20 });

        const totp = new OTPAuth.TOTP({
            issuer: 'express-api',
            label: user.email,
            algorithm: 'SHA3-512',
            digits: 6,
            period: 30,
            secret: secret.base32,
        });

        await User.unscoped().update({
            mfaEnabled: false,
            mfaSecret: secret.base32,
        }, {
            where: {
                id: req.user.id,
            }
        });

        return res.json({
            uri: totp.toString(),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @openapi
 * /user/confirm-mfa:
 *   post:
 *     description: Confirm MFA
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Returns success status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized - Invalid MFA code or MFA not enabled
 */
app.post('/user/confirm-mfa', [
    passport.authenticate('jwt', { session: false }),
    body('token')
        .exists()
        .isLength({ min: 6, max: 6 }),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const { token } = matchedData(req);

        const { mfaSecret, email: label } = await User.scope('mfa').findByPk(req.user.id, {
            rejectOnEmpty: true,
        });

        if (mfaSecret === null) return res.status(401).json({ message: 'MFA is not enabled for this account', code: 401 });

        const totp = new OTPAuth.TOTP({
            issuer: 'express-api',
            label,
            algorithm: 'SHA3-512',
            digits: 6,
            period: 30,
            secret: mfaSecret as string,
        });

        const delta = totp.validate({ token: token, window: 1 });
        if (delta === null) return res.status(401).json({ message: 'Incorrect MFA code', code: 401 });

        await User.unscoped().update({
            mfaEnabled: true,
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

/**
 * @openapi
 * /user/disable-mfa:
 *   post:
 *     description: Disable MFA
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns success status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized - Invalid MFA code or MFA not enabled
 */
app.post('/user/disable-mfa', [
    passport.authenticate('jwt', { session: false }),
    middleware.checkPassword,
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });

        await User.unscoped().update({
            mfaEnabled: false,
            mfaSecret: null,
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
