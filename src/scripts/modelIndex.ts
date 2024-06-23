/**
 * npm run index --model="User" --prop="id" --value="email"
 * ts-node ./src/scripts/modelIndex.ts --model="User" --prop="id" --value="email"
 * docker exec -ti express-api ts-node ./src/scripts/modelIndex.ts --model="User" --prop="id" --value="email"
 */
import 'dotenv/config';
import db from './../providers/db';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
if (!argv['model']) throw Error('You must provide --model argument');
if (!argv['prop']) throw Error('You must provide --prop argument');
if (!argv['value']) throw Error('You must provide --value argument');

(async function Main() {
    try {
        const modelName = String(argv['model']);
        const prop = String(argv['prop']);
        const value = String(argv['value']);
        const Model = await import(`./../models/${modelName}`);

        const models = await Model.default.unscoped().findAll();

        for (let i = 0; i < models.length; i++) {
            console.log(models[i][prop], models[i][value]);
        }
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();


