
/**
 * ts-node ./src/scripts/forgotPassword.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e"
 * docker exec -ti express-api ts-node ./src/scripts/forgotPassword.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e"
 *
 */
require('dotenv').config();
import User from './../models/User';
import db from './../providers/db';
import minimist from 'minimist';
import crypto from 'crypto';

const argv = minimist(process.argv.slice(2));
if (!argv['userID']) throw Error('You must provide --userID argument');

(async function Main() {
    try {
        const user = await User.findByPk(argv['userID']);

        const passwordResetKey = crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');

        await user.update({ passwordResetKey });

        console.log(`\n\nEMAIL THIS TO THE USER\nPASSWORD RESET LINK: ${process.env.FRONTEND_URL}/reset/${passwordResetKey}\n\n`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();

