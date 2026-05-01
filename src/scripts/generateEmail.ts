/**
 * npm run email -- --template="Forgot" --link="https://google.com"
 * ts-node ./src/scripts/generateEmail.ts --template="Verify" --code="512616" --link="https://google.com"
*/

// Verify
// docker exec -ti express-api ts-node ./src/scripts/generateEmail.ts --template="Verify" --code="512616" --firstName="John" && open ./.vol/tmp/email.html

// Reset
// docker exec -ti express-api ts-node ./src/scripts/generateEmail.ts --template="Reset" --firstName="John" --link="https://google.com" && open ./.vol/tmp/email.html

// Invite
// docker exec -ti express-api ts-node ./src/scripts/generateEmail.ts --template="Default" --title="You've been invited to join Group A" --body="You have been invited to join Group A by John Smith. Click the button below to accept the invitation." --link="https://google.com" --linkText="Accept Invitation" && open ./.vol/tmp/email.html

import 'dotenv/config';
import { generateEmail } from './../providers/Helpers';
import minimist from 'minimist';
import * as fs from 'fs';

const argv = minimist(process.argv.slice(2));
if (!argv['template']) throw Error('You must provide --template argument');

(async function Main() {
    try {
        const filepath = `/tmp/email.html`;
        fs.writeFileSync(filepath, generateEmail(argv['template'], argv));
        console.log(`\nOpen in browser:`);
        console.log(`  open ./.vol${filepath}`);
    } catch (err) {
        console.error(err);
    }
})();
