import { body, validationResult, matchedData } from 'express-validator';
import errorHandler from './../providers/errorHandler';
import generateJWT from './../providers/generateJWT';
import { User, UserModel } from './../models/User';
// import { Group, GroupModel } from './../models/Group';
// import { GroupUser, GroupUserModel } from './../models/GroupUser';
import passport from './../providers/passport';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt-nodejs';
import express from 'express';
import moment from 'moment';
import crypto from 'crypto';

import * as fs from 'fs';
import jwt from 'jsonwebtoken';

export const app = express.Router();


/**
 * GET /api/v1/_authcheck
 * 
 * Helper route for testing auth status
 */
app.get('/_authcheck', [
    // passport.authenticate('jwt', { session: false })

    // async (req: express.Request, res: express.Response, next: Function) => {
    //     const payload = req.headers.authorization?.split(' ')[1];
    //     if (!payload) return res.status(401).json({ message: 'Unauthorized', code: 401 });
    //     console.log(jwt.verify(payload, fs.readFileSync(process.env.PUBLIC_KEY_PATH || '/app/public.pem', 'utf8')));
    //     req.user = jwt.verify(payload, fs.readFileSync(process.env.PUBLIC_KEY_PATH || '/app/public.pem', 'utf8'));
    //     return next();
    // }

    async (req: express.Request, res: express.Response, next: Function) => {
        req.user = { id: '123' };
        return next();
    }
], async (req: express.Request, res: express.Response) => res.json({
    auth: true,
    id: req.user?.id
}));


/**
 * POST api/v1/auth/login
 * 
 */
app.post('/auth/login', [
    body('email').exists().toLowerCase(),
    body('password').exists(),
], async (req: express.Request, res: express.Response, next: Function) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });

    passport.authenticate('local', { session: false }, (err: Error | null, user: UserModel | null) => {
        if (err) return errorHandler(err, res);
        if (!user) return res.status(401).json({ message: 'Incorrect email or password', code: 401 });

        req.login(user, { session: false }, (err: Error) => {
            if (err) return errorHandler(err, res);

            res.json({
                accessToken: generateJWT(user)
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
    body('password', 'Your password must be atleast 7 characters long')
        .isLength({ min: 7 }),
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
], async (req: express.Request, res: express.Response) => {
    // try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const data = matchedData(req);

    const userID = uuidv4();
    const groupID = uuidv4();
    const ucFirst = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
    if (!data.lastName) data.lastName = '';
    if (!data.groupName) data.groupName = data.firstName.concat("'s Team");

    // await Group.create({
    //     id: groupID,
    //     name: data.groupName,
    //     ownerID: userID,
    // });

    // await GroupsUsers.create({ userID, groupID });

    const user = await User.create({
        id: userID,
        email: data.email,
        password: bcrypt.hashSync(data.password, bcrypt.genSaltSync(10)),
        firstName: ucFirst(data.firstName),
        lastName: ucFirst(data.lastName),
        lastLoginAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        tos: data.tos,
        emailVerificationKey: crypto.randomBytes(20).toString('hex'),
    });


    //////////////////////////////////////////
    // EMAIL THIS TO THE USER
    const emailVerificationLink = `${process.env.FRONTEND_URL}/validate-email/${user.emailVerificationKey}`;
    if (typeof global.it !== 'function') console.log(`\n\nEMAIL THIS TO THE USER\nEMAIL VERIFICATION LINK: ${emailVerificationLink}\n\n`);

    // Delete this line when you're ready to send emails
    user.update({ emailVerified: true });
    //////////////////////////////////////////


    return passport.authenticate('local', { session: false }, (err: Error, user: UserModel) => {
        if (err) return errorHandler(err, res);

        req.login(user, { session: false }, (err) => {
            if (err) return errorHandler(err, res);

            res.json({
                accessToken: generateJWT(user)
            });
        });
    })(req, res);
    // } catch (error) {
    //     return errorHandler(error, res);
    // }
});
