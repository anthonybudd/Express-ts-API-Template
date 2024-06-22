/**
 * ts-node ./src/scripts/jwt.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e"
 * docker exec -ti express-api ts-node ./src/scripts/jwt.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e"
 *
 */
import 'dotenv/config';
import generateJWT from './../providers/GenerateJWT';
import User from './../models/User';
import db from './../providers/db';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
if (!argv['userID']) throw Error('You must provide --userID argument');

(async function Main() {
    try {
        const user = await User.findByPk(argv['userID']);
        if (!user) return console.error('User not found');
        const jwt = generateJWT(user, { expiresIn: "24h" });
        console.log(`\n\nJWT:\n\n${jwt}\n\n`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();
