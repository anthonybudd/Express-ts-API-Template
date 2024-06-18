
/**
 * ts-node ./src/scripts/inviteUser.ts --email="newuser@example.com" --groupID="fdab7a99-2c38-444b-bcb3-f7cef61c275b"
 * docker exec -ti express-api ts-node ./src/scripts/inviteUser.ts --email="newuser@example.com" --groupID="fdab7a99-2c38-444b-bcb3-f7cef61c275b"
 *
 */
require('dotenv').config();
import GroupUser from './../models/GroupUser';
import Group from './../models/Group';
import User from './../models/User';
import bcrypt from 'bcrypt-nodejs';
import db from './../providers/db';
import minimist from 'minimist';
import crypto from 'crypto';

const argv = minimist(process.argv.slice(2));
if (!argv['email']) throw Error('You must provide --email argument');
if (!argv['groupID']) throw Error('You must provide --groupID argument');

(async function Main() {
    try {
        const email = argv['email'];
        const groupID = argv['groupID'];


        const group = await Group.findByPk(groupID);
        if (!group) return console.error('Group not found');

        let user = await User.unscoped().findOne({
            where: { email }
        });

        if (user) {
            // Check if relationship already exists
            const relationship = await GroupUser.findOne({
                where: {
                    groupID,
                    userID: user.id
                }
            });
            if (relationship) return console.log(`User already in this group`);
        } else {
            user = await User.create({
                email,
                password: bcrypt.hashSync(crypto.randomBytes(20).toString('hex'), bcrypt.genSaltSync(10)), // AB: Random password, will be updated by user
                firstName: '',
                inviteKey: crypto.randomBytes(20).toString('hex')
            });

            const inviteLink = `${process.env.FRONTEND_URL}/invite/${user.inviteKey}`;

            console.log(user.get({ plain: true }));
            console.log(`\n\nEMAIL THIS LINK TO THE USER: \n${inviteLink}\n\n`);
        }

        // Delete all first
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

        console.log(`User ${user.email} invited`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
