/**
 * npm run create --model="User"
 * ts-node ./src/scripts/modelCreate.ts --model="User"
 * docker exec -ti express-api ts-node ./src/scripts/modelCreate.ts --model="User"
 */
import 'dotenv/config';
import db from './../providers/db';
import minimist from 'minimist';
import bcrypt from 'bcryptjs';

const argv = minimist(process.argv.slice(2));
if (!argv['model']) throw Error('You must provide --model argument');

(async function Main() {
    try {
        const modelName = String(argv['model']);
        const Model = await import(`./../models/${modelName}`);

        let data = '';
        let base64Decoded;
        let newModel;

        for await (const chunk of process.stdin) data += chunk;

        try {
            base64Decoded = atob(data);
        } catch (error) {
            throw Error('Invalid base64 encoding');
        }

        try {
            newModel = JSON.parse(base64Decoded);
            delete newModel.id;
            if (newModel.password) newModel.password = bcrypt.hashSync(newModel.password, bcrypt.genSaltSync(10));
        } catch (error) {
            throw Error('Invalid JSON');
        }

        const model = await Model.default.create(newModel);

        console.log(`Model created ${argv['model']}:${model.id}`);
    } catch (err) {
        console.error(err);
    } finally {
        db.connectionManager.close();
    }
})();


