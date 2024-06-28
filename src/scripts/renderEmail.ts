/**
 * npm run email --template="Forgot" --link="https://google.com"
 * ts-node ./src/scripts/renderEmail.ts --template="Forgot" --link="https://google.com"
 * docker exec -ti express-api ts-node ./src/scripts/renderEmail.ts --template="Forgot" --link="https://google.com"
 */
import 'dotenv/config';
import Email from './../providers/Email';
import minimist from 'minimist';
import * as fs from 'fs';

const argv = minimist(process.argv.slice(2));
if (!argv['template']) throw Error('You must provide --template argument');

(async function Main() {
    try {
        const filepath = `/tmp/email.html`;
        fs.writeFileSync(filepath, Email.generate(argv['template'], argv));
        console.log(`\nContainer: ${filepath}`);
        console.log(`Local: ./.vol${filepath}`);
    } catch (err) {
        console.error(err);
    }
})();


