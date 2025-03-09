import { body, validationResult, matchedData } from 'express-validator';
import { User, UserModel } from './../models/User';
import { GroupUser } from './../models/GroupUser';
import passport from './../providers/Passport';
import Email from './../providers/Email';
import { Group } from './../models/Group';
import middleware from './middleware';
import bcrypt from 'bcryptjs';
import express from 'express';
import crypto from 'crypto';

export const app = express.Router();


/**
 * GET /api/v1/groups/:groupID
 *
 */
app.get('/groups/:groupID', [
    passport.authenticate('jwt', { session: false }),
    middleware.isInGroup,
], async (req: express.Request, res: express.Response) => {
    const group = await Group.findByPk(req.params.groupID, {
        include: (req.query.with === 'users') ? [User] : [],
    });

    return res.json(group);
});


/**
 * POST /api/v1/groups/:groupID
 *
 */
app.post('/groups/:groupID', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
    body('name')
], async (req: express.Request, res: express.Response) => {
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
});


/**
 * POST /api/v1/groups/:groupID/users/invite
 *
 */
app.post('/groups/:groupID/users/invite', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
    body('email').isEmail().toLowerCase(),
    body('role').default('User').isIn(['User', 'Admin']),
], async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { email, role } = matchedData(req);

    const groupID = req.params.groupID;
    const group = await Group.findByPk(groupID);

    if (!group) return res.status(404).json({
        msg: 'Group not found',
        code: 40403
    });

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

        if (relationship) return res.status(401).json({
            msg: 'User is already in this group',
            code: 98645,
        });
    } else {
        user = await User.create({
            email,
            password: bcrypt.hashSync(crypto.randomBytes(20).toString('hex'), bcrypt.genSaltSync(10)), // AB: Random password, will be updated by user
            firstName: '',
            emailVerificationKey: String(Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111),
            inviteKey: crypto.randomBytes(10).toString('hex'),
        });

        //////////////////////////////////////////
        // EMAIL THIS TO THE USER
        const link = `${process.env.FRONTEND_URL}/invite/${user.inviteKey}`;
        if (typeof global.it !== 'function') console.log(`\n\nEMAIL THIS TO THE USER\nINVITE LINK: ${link}\n\n`);

        // const html = Email.generate('Invite', { link, groupName: group.name });
        //////////////////////////////////////////
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
        role,
    });

    return res.json({
        groupID,
        userID: user.id,
        role,
    });
});


/**
 * POST /api/v1/groups/:groupID/users/:userID/resend-invitation-email
 * 
 */
app.post('/groups/:groupID/users/:userID/resend-invitation-email', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
], async (req: express.Request, res: express.Response) => {
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({
        msg: 'User not found',
        code: 40403
    });

    const group = await Group.findByPk(req.params.groupID);

    if (!group) return res.status(404).json({
        msg: 'Group not found',
        code: 40403
    });

    if (!user.inviteKey) return res.status(400).json({
        msg: 'This user has already accepted their invitation',
        code: 40422
    });

    await user.update({
        inviteKey: crypto.randomBytes(10).toString('hex'),
    });

    //////////////////////////////////////////
    // EMAIL THIS TO THE USER
    const link = `${process.env.FRONTEND_URL}/invite/${user.inviteKey}`;
    if (typeof global.it !== 'function') console.log(`\n\nEMAIL THIS TO THE USER\nINVITE LINK: ${link}\n\n`);

    // const html = Email.generate('Invite', { link, groupName: group.name })
    //////////////////////////////////////////

    return res.json({ email: user.email });
});


/**
 * POST /api/v1/groups/:groupID/users/:userID/set-role
 *
 */
app.post('/groups/:groupID/users/:userID/set-role', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
    body('role').default('User').isIn(['User', 'Admin']),
], async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { role } = matchedData(req);
    const groupID = req.params.groupID;
    const userID = req.params.userID;

    const group = await Group.findByPk(groupID);
    if (!group) return res.status(400).json({
        msg: `Group ${groupID} does not exist`,
        code: 13386,
    });

    if (group.ownerID === userID) return res.status(400).json({
        msg: 'You cannot remove the owner of the group',
        code: 20330,
    });

    const groupUsers = await GroupUser.findOne({
        where: {
            groupID, userID
        },
    });

    if (!groupUsers) return res.status(400).json({
        msg: `User ${userID} does not exist in group ${groupID}`,
        code: 10424,
    });

    await groupUsers.update({ role });

    return res.json({ userID, groupID, role });
});


/**
 * DELETE /api/v1/groups/:groupID/users/:userID
 *
 */
app.delete('/groups/:groupID/users/:userID', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
    middleware.isNotSelf,
], async (req: express.Request, res: express.Response) => {
    const groupID = req.params.groupID;
    const userID = req.params.userID;

    const group = await Group.findByPk(groupID);

    if (!group) return res.status(400).json({
        msg: `Group ${groupID} does not exist`,
        code: 10486,
    });

    if (group.ownerID === userID) return res.status(400).json({
        msg: 'You cannot remove the owner of the group',
        code: 63930,
    });

    await GroupUser.destroy({
        where: {
            groupID, userID
        }
    });

    return res.json({ userID, groupID });
});
