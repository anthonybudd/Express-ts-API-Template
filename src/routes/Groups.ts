import { body, validationResult, matchedData, param } from 'express-validator';
import { GroupUser } from './../models/GroupUser';
import passport from './../providers/Passport';
import Email from './../providers/Email';
import { Group } from './../models/Group';
import middleware from './middleware';
import User from './../models/User';
import bcrypt from 'bcryptjs';
import express from 'express';
import crypto from 'crypto';

export const app = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Groups
 *     description: Groups
 */

/**
 * @openapi
 * /groups/{groupID}:
 *   get:
 *     description: Get a group by ID
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to retrieve
 *       - in: query
 *         name: with
 *         schema:
 *           type: string
 *           enum: [users]
 *         description: Include related data (users) in the response
 *     responses:
 *       200:
 *         description: Returns the group information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                   description: Only included when with=users query parameter is provided
 */
app.get('/groups/:groupID', [
    passport.authenticate('jwt', { session: false }),
    middleware.isInGroup,
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        return res.json(await Group.findByPk(req.params.groupID, {
            include: (req.query.with === 'users') ? [User] : [],
            rejectOnEmpty: true
        }));
    } catch (error) {
        return next(error);
    }
});

/**
 * @openapi
 * /groups/{groupID}:
 *   post:
 *     description: Update a group's information
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the group
 *     responses:
 *       200:
 *         description: Returns the updated group information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 */
app.post('/groups/:groupID', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
    body('name')
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const data = matchedData(req);

        const group = await Group.findByPk(req.params.groupID, {
            rejectOnEmpty: true
        });

        await group.update(data);

        return res.json(group);
    } catch (error) {
        return next(error);
    }
});

/**
 * @openapi
 * /groups/{groupID}/users/invite:
 *   post:
 *     description: Invite a user to a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to invite the user to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user to invite
 *               role:
 *                 type: string
 *                 enum: [User, Admin]
 *                 default: User
 *                 description: Role to assign to the user in the group
 *     responses:
 *       200:
 *         description: User successfully invited to the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groupID:
 *                   type: string
 *                 userID:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [User, Admin]
 */
app.post('/groups/:groupID/users/invite', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
    param('groupID').isUUID(),
    body('email').isEmail().toLowerCase(),
    body('role').default('User').isIn(['User', 'Admin']),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const { email, role, groupID } = matchedData(req);

        const group = await Group.findByPk(groupID, { rejectOnEmpty: true });

        let user = await User.findOne({
            where: { email },
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
            // const html = Email.generate('Default', { 
            //     title: `You've been invited to join ${group.name}`,
            //     body: `You have been invited to join ${group.name} by ${req.user.firstName} ${req.user.lastName}. Click the button below to accept the invitation.`,
            //     link,
            //     linkText: 'Accept Invitation'
            // });
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
    } catch (error) {
        return next(error);
    }
});

/**
 * @swagger
 * /groups/{groupID}/users/{userID}/resend-invitation-email:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Resend invitation email to a user
 *     description: Regenerates the invitation link and resends the invitation email to a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to resend invitation to
 *     responses:
 *       200:
 *         description: Invitation email resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: Email address of the user
 */
app.post('/groups/:groupID/users/:userID/resend-invitation-email', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user = await User.unscoped().findByPk(req.params.userID, {
            rejectOnEmpty: true
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
    } catch (error) {
        return next(error);
    }
});

/**
 * @openapi
 * /groups/{groupID}/users/{userID}/set-role:
 *   post:
 *     description: Set a user's role within a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose role will be changed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [User, Admin]
 *                 default: User
 *                 description: The role to assign to the user
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: string
 *                 groupID:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [User, Admin]
 */
app.post('/groups/:groupID/users/:userID/set-role', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
    body('role').default('User').isIn(['User', 'Admin']),
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
        const { role } = matchedData(req);

        const groupID = req.params.groupID;
        const userID = req.params.userID;

        // AB: Required to check if user exists
        await User.findByPk(userID, {
            rejectOnEmpty: true
        });

        const group = await Group.findByPk(groupID, {
            rejectOnEmpty: true
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
    } catch (error) {
        return next(error);
    }
});

/**
 * @openapi
 * /groups/{groupID}/users/{userID}:
 *   delete:
 *     description: Remove a user from a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to remove from the group
 *     responses:
 *       200:
 *         description: User successfully removed from the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groupID:
 *                   type: string
 *                 userID:
 *                   type: string
 */
app.delete('/groups/:groupID/users/:userID', [
    passport.authenticate('jwt', { session: false }),
    middleware.hasRole('Admin'),
    middleware.isNotSelf,
], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const groupID = req.params.groupID;
        const userID = req.params.userID;

        const group = await Group.findByPk(groupID, {
            rejectOnEmpty: true
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
    } catch (error) {
        return next(error);
    }
});
