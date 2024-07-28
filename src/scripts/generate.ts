/**
 * ts-node ./src/scripts/generate.ts --model="Book" -d
 * docker exec -ti express-api ts-node ./src/scripts/generate.ts --model="Book" -d
 * 
 * --force
 * --userID
 * --groupID
*/
import { lcFirst } from './../providers/Helpers';
import * as inflection from 'inflection';
import { v4 as uuidv4 } from 'uuid';
import Mustache from 'Mustache';
import minimist from 'minimist';
import day from 'dayjs';
import * as path from 'path';
import * as fs from 'fs';

const argv = minimist(process.argv.slice(2));
if (!argv['model']) throw Error('You must provide --model argument');
if (/^\d/.test(argv['model'])) throw Error('--model cannot start with a number');

(async function Main() {
    const ModelName = argv['model'];
    const isDryRun = !!argv['d'] || false;
    const isForce = !!argv['force'] || false;

    const params = {
        modelname: ModelName.toLowerCase(),
        modelName: lcFirst(ModelName),
        ModelName,
        MODELNAME: ModelName.toUpperCase(),

        modelnames: inflection.pluralize(ModelName.toLowerCase()),
        modelNames: inflection.pluralize(lcFirst(ModelName)),
        ModelNames: inflection.pluralize(ModelName),
        UUID: uuidv4(),

        userID: (argv['userID']) ? 'c4644733-deea-47d8-b35a-86f30ff9618e' : false, // user@exmaple.com
        groupID: (argv['groupID']) ? 'fdab7a99-2c38-444b-bcb3-f7cef61c275b' : false, // Group A
    };

    if (argv['v']) console.log(params);
    if (isDryRun) console.log(`\n\n⚠️  Dry run. Will not write any files.\n\n`);


    ////////////////////////////////////////////////
    // Model
    const pathModel = path.resolve(`./src/models/${params.ModelName}.ts`);
    if (!isForce && fs.existsSync(pathModel)) throw new Error(`File already exists at ${pathModel}`);
    if (!isDryRun) fs.writeFileSync(pathModel, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Model.ts'), 'utf8'), params));
    console.log(`Created: ${pathModel}`);


    ////////////////////////////////////////////////
    // Route
    const pathRoute = path.resolve(`./src/routes/${params.ModelNames}.ts`);
    if (!isForce && fs.existsSync(pathRoute)) throw new Error(`File already exists at ${pathRoute}`);
    if (!isDryRun) fs.writeFileSync(pathRoute, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Route.ts'), 'utf8'), params));
    console.log(`Created: ${pathRoute}`);

    const appPath = path.resolve(`./src/app.ts`);
    const appContent = fs.readFileSync(appPath, 'utf8');
    const routeImport = `import { app as ${params.ModelNames} } from './routes/${params.ModelNames}';`;
    if (!appContent.includes(routeImport)) {
        const appLines = appContent.split('\n');
        let importLine;
        let useLine;

        for (let i = 0; i < appLines.length; i++) {
            const line = appLines[i].trim();
            if (appLines[i + 1] === undefined) break;
            const nextLine = appLines[i + 1].trim();
            if (line.includes(`import { app as `) && nextLine == '') {
                importLine = i + 1;
            }
            if (line.includes(`app.use(ErrorHandler)`)) {
                useLine = i;
            }
        }

        if (importLine) appLines.splice(importLine, 1, `${routeImport}\n`);
        if (useLine) appLines.splice(useLine, 1, `app.use('/api/v1/', ${params.ModelNames});\n${appLines[useLine]}`);
        if (!isDryRun) fs.writeFileSync(appPath, appLines.join('\n'));
    }


    ////////////////////////////////////////////////
    // Migration
    const pathMigration = path.resolve(`./src/database/migrations/${day().format('YYYYMMDDHHmmss')}-create-${params.ModelNames}.js`);
    const migrations = fs.readdirSync(path.resolve(`./src/database/migrations/`)).map((str) => (str.replaceAll(/[0-9]/g, '')));
    if (!isForce && migrations.includes(`-create-${params.ModelNames}.js`)) throw new Error(`File already exists at ${pathMigration}`);
    if (!isDryRun) fs.writeFileSync(pathMigration, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Migration.js'), 'utf8'), params));
    console.log(`Created: ${pathMigration}`);


    ////////////////////////////////////////////////
    // Seeder
    const pathSeeder = path.resolve(`./src/database/seeders/${day().format('YYYYMMDDHHmmss')}-${params.ModelNames}.js`);
    const seeders = fs.readdirSync(path.resolve(`./src/database/seeders/`)).map((str) => (str.replaceAll(/[0-9]/g, '')));
    if (!isForce && seeders.includes(`-${params.ModelNames}.js`)) throw new Error(`File already exists at ${pathSeeder}`);
    if (!isDryRun) fs.writeFileSync(pathSeeder, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Seeder.js'), 'utf8'), params));
    console.log(`Created: ${pathSeeder}`);


    ////////////////////////////////////////////////
    // Test
    // const pathTest = path.resolve(`./tests/${params.ModelName}.js`);
    // if (isForce && fs.existsSync(pathTest)) throw new Error(`File already exists at ${pathTest}`);
    // if (!isDryRun) fs.writeFileSync(pathTest, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Test.js'), 'utf8'), params));
    // console.log(`Created: ${pathTest}`);


    ////////////////////////////////////////////////
    // Requests
    const pathRequests = path.resolve(`./requests.http`);
    const requestContent = fs.readFileSync(pathRequests, 'utf8');
    const newRequest = Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/requests.http'), 'utf8'), params);
    if (!requestContent.includes(`# ${params.ModelName}`)) {
        if (!isDryRun) fs.writeFileSync(pathRequests, requestContent + '\n' + newRequest);
        console.log(`Updated: ${pathRequests}`);
    }
})();
