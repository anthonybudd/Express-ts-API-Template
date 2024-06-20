
/**
 * npm run update --model="User" --id="c4644733-deea-47d8-b35a-86f30ff9618e"
 * ts-node ./src/scripts/modelUpdate.ts --model="User" --id="c4644733-deea-47d8-b35a-86f30ff9618e"
 * docker exec -ti express-api ts-node ./src/scripts/modelUpdate.ts --model="User" --id="c4644733-deea-47d8-b35a-86f30ff9618e"
 */
import 'dotenv/config';
import db from './../providers/db';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
if (!argv['id']) throw Error('You must provide --id argument');
if (!argv['model']) throw Error('You must provide --model argument');

(async function Main() {
    try {
        const modelName = String(argv['model']);
        const Model = await import(`./../models/${modelName}`);

        let data = '';
        let base64Decoded;
        let updated;

        for await (const chunk of process.stdin) data += chunk;

        try {
            base64Decoded = atob(data);
        } catch (error) {
            throw Error('Invalid base64 encoding');
        }

        try {
            updated = JSON.parse(base64Decoded);
            delete updated.id;
        } catch (error) {
            throw Error('Invalid JSON');
        }

        await Model.default.unscoped().update(updated, {
            where: { id: argv['id'] }
        });

        console.log(`Model ${argv['model']}:${argv['id']} updated`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();


