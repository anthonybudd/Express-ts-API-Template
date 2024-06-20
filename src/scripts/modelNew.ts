/**
 * npm run create --model="User"
 * ts-node ./src/scripts/modelNew.ts --model="User"
 * docker exec -ti express-api ts-node ./src/scripts/modelNew.ts --model="User"
 */
import 'dotenv/config';
import db from './../providers/db';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
if (!argv['model']) throw Error('You must provide --model argument');

(async function Main() {
    try {
        const modelName = String(argv['model']);
        const Model = await import(`./../models/${modelName}`);

        interface LooseObject {
            [key: string]: any;
        }

        const model: LooseObject = {};
        const attributes = Model.default.rawAttributes;
        const keys = Object.keys(attributes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const allowNull = attributes[key].allowNull;
            const notRequired = ['id', 'createdAt', 'updatedAt', 'deletedAt'];
            if (allowNull === false && !notRequired.includes(key)) model[key] = '';
        }

        console.log(JSON.stringify(model, null, 4));
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();


