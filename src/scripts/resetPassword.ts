/**
 * ts-node ./src/scripts/resetPassword.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e" --password="password"
 * docker exec -ti express-api ts-node ./src/scripts/resetPassword.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e" --password="password"
 *
 */
import 'dotenv/config';
import User from './../models/User';
import db from './../providers/db';
import minimist from 'minimist';
import bcrypt from 'bcryptjs';

const argv = minimist(process.argv.slice(2));
if (!argv['userID']) throw Error('You must provide --userID argument');
if (!argv['password']) throw Error('You must provide --password argument');

(async function Main() {
    try {
        const user = await User.findByPk(argv['userID']);

        if (!user) return console.error('User not found');

        await user.update({
            password: bcrypt.hashSync(argv['password'], bcrypt.genSaltSync(10)),
            passwordResetKey: null
        });

        console.log(`Password updated`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();

