
/**
 * ts-node ./src/scripts/modelGet.ts --model="User" --id="c4644733-deea-47d8-b35a-86f30ff9618e"
 * docker exec -ti express-api ts-node ./src/scripts/modelGet.ts --model="User" --id="c4644733-deea-47d8-b35a-86f30ff9618e"
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

        const model = await Model.default.unscoped().findOne({
            where: { id: argv['id'] }
        });

        if (!model) throw Error('Model not found');

        console.log(JSON.stringify(model.get({ plain: true }), null, 4));
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();


