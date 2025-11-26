/**
 * npm run email -- --template="Forgot" --link="https://google.com"
 * ts-node ./src/scripts/renderEmail.ts --template="Verify" --code="512616" --link="https://google.com"
*/

// Verify
// docker exec -ti express-api ts-node ./src/scripts/renderEmail.ts --template="Verify" --code="512616" --firstName="John" && open ./.vol/tmp/email.html

// Reset
// docker exec -ti express-api ts-node ./src/scripts/renderEmail.ts --template="Reset" --firstName="John" --link="https://google.com" && open ./.vol/tmp/email.html

// Invite
// docker exec -ti express-api ts-node ./src/scripts/renderEmail.ts --template="Default" --title="You've been invited to join Group A" --body="You have been invited to join Group A by John Smith. Click the button below to accept the invitation." --link="https://google.com" --linkText="Accept Invitation" && open ./.vol/tmp/email.html

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
