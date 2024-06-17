import { body, validationResult, matchedData } from 'express-validator';
import errorHandler from '../providers/errorHandler';
import generateJWT from './../providers/generateJWT';
import { User, UserModel } from './../models/User';
import { Group } from './../models/Group';
import { GroupUser } from './../models/GroupUser';
import passport from './../providers/passport';
import { ucFirst } from './../providers/helpers';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt-nodejs';
import express from 'express';
import moment from 'moment';
import crypto from 'crypto';

export const app = express.Router();


/**
 * GET /api/v1/groups/:groupID
 *
 */
app.get('/groups/:groupID', [
    passport.authenticate('jwt', { session: false }),
    // middleware.isInGroup,
], async (req: express.Request, res: express.Response) => {
    // try {
    const group = await Group.findByPk(req.params.groupID, {
        include: (req.query.with === 'users') ? [User] : [],
    });

    return res.json(group);
    // } catch (error) {
    //     return errorHandler(error, res);
    // }
});


/**
 * POST /api/v1/groups/:groupID
 *
 */
app.post('/groups/:groupID', [
    passport.authenticate('jwt', { session: false }),
    // middleware.isInGroup,
    body('name')
], async (req: express.Request, res: express.Response) => {
    // try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const data = matchedData(req);

    await Group.update(data, {
        where: {
            id: req.params.groupID
        }
    });

    return res.json(
        await Group.findByPk(req.params.groupID)
    );
    // } catch (error) {
    //     return errorHandler(error, res);
    // }
});


/**
 * POST /api/v1/groups/:groupID/users/invite
 *
 */
app.post('/groups/:groupID/users/invite', [
    passport.authenticate('jwt', { session: false }),
    // middleware.isGroupOwner,
    body('email').isEmail().toLowerCase(),
], async (req: express.Request, res: express.Response) => {
    // try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { email } = matchedData(req);

    const groupID = req.params.groupID;

    let user = await User.findOne({
        where: { email }
    });

    if (user) {
        if (user.id === req.user.id) return res.status(401).json({
            msg: 'You cannot add yourself to a group',
            code: 98644,
        });

        // Check if relationship already exists
        const relationship = await GroupUser.findOne({
            where: {
                groupID,
                userID: user.id
            }
        });
        if (relationship) return res.json({
            groupID,
            userID: user.id
        });
    } else {
        // try {
        user = await User.create({
            email,
            password: bcrypt.hashSync(crypto.randomBytes(20).toString('hex'), bcrypt.genSaltSync(10)), // AB: Random password, will be updated by user
            firstName: '',
            lastName: '',
            lastLoginAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            emailVerificationKey: crypto.randomBytes(20).toString('hex'),
        });

        //////////////////////////////////////////
        // EMAIL THIS TO THE USER
        const inviteLink = `${process.env.FRONTEND_URL}/invite/${user.inviteKey}`;
        if (typeof global.it !== 'function') console.log(`\n\nEMAIL THIS TO THE USER\nINVITE LINK: ${inviteLink}\n\n`);
        //
        //////////////////////////////////////////

        // } catch (error) {
        //     errorHandler(error);
        // }
    }

    // Delete all existing relationships first
    await GroupUser.destroy({
        where: {
            groupID,
            userID: user.id,
        }
    });

    await GroupUser.create({
        groupID,
        userID: user.id,
    });

    return res.json({
        groupID,
        userID: user.id,
    });
    // } catch (error) {
    //     return errorHandler(error, res);
    // }
});


/**
 * DELETE /api/v1/groups/:groupID/users/:userID
 *
 */
app.delete('/groups/:groupID/users/:userID', [
    passport.authenticate('jwt', { session: false }),
    // middleware.isGroupOwner,
    // middleware.isNotSelf,
], async (req: express.Request, res: express.Response) => {

    await GroupUser.destroy({
        where: {
            groupID: req.params.groupID,
            userID: req.params.userID,
        }
    });

    return res.json({
        userID: req.params.userID,
        groupID: req.params.groupID
    });
});
