
/**
 * ts-node ./src/scripts/modelDelete.ts --model="User" --id="d700932c-4a11-427f-9183-d6c4b69368f9"
 * docker exec -ti express-api ts-node ./src/scripts/modelDelete.ts --model="User" --id="d700932c-4a11-427f-9183-d6c4b69368f9"
 */
import 'dotenv/config';
import db from './../providers/db';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
if (!argv['model']) throw Error('You must provide --model argument');
if (!argv['id']) throw Error('You must provide --id argument');

(async function Main() {
    try {
        const modelName = String(argv['model']);
        const Model = await import(`./../models/${modelName}`);

        await Model.default.destroy({
            where: {
                id: argv['id']
            }
        });

        console.log(`Model ${argv['model']}:${argv['id']} deleted`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();


