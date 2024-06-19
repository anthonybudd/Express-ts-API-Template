
/**
 * ts-node ./src/scripts/generate.ts --model="Book" -d
 * docker exec -ti express-api ts-node ./src/scripts/generate.ts --model="Book" -d
*/
import { lcFirst } from './../providers/Helpers';
import * as inflection from 'inflection';
import { v4 as uuidv4 } from 'uuid';
import Mustache from 'Mustache';
import minimist from 'minimist';
import moment from 'moment';
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
    };

    if (argv['v']) console.log(params);
    if (isDryRun) console.log(`\n\n⚠️  Dry run. Will not write any files.\n\n`);


    ////////////////////////////////////////////////
    // Model
    const pathModel = path.resolve(`./src/models/${params.ModelName}.ts`);
    if (!argv['force'] && fs.existsSync(pathModel)) throw new Error(`File already exists at ${pathModel}`);
    if (!isDryRun) fs.writeFileSync(pathModel, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Model.ts'), 'utf8'), params));
    console.log(`Created: ${pathModel}`);

    // const modelsIndex = path.resolve(`./src/models/index.js`);
    // const fileContent = fs.readFileSync(modelsIndex, 'utf8');
    // if (!fileContent.includes(`const ${params.ModelName}`)) {
    //     const lines = fileContent.split('\n');
    //     let lastLineWithClosingBracket;
    //     let lastLineWithRequirePlusOne;
    //     for (let i = lines.length - 1; i >= 0; i--) {
    //         const line = lines[i].trim();
    //         if (line.endsWith('};')) {
    //             lastLineWithClosingBracket = (i + 1);
    //         }

    //         if (line.includes('require(') && !lastLineWithRequirePlusOne) {
    //             lastLineWithRequirePlusOne = (i + 2);
    //         }
    //     }

    //     if (lastLineWithRequirePlusOne) {
    //         const requireLine = `const ${params.ModelName} = require('./${params.ModelName}');\n`;
    //         lines.splice(lastLineWithRequirePlusOne - 1, 1, requireLine);
    //     }

    //     if (lastLineWithClosingBracket) {
    //         const newLines = ([
    //             `    ${params.ModelName},`,
    //             '};',
    //         ]).join('\n');
    //         lines.splice(lastLineWithClosingBracket - 1, 1, newLines);
    //     }
    //     if (!isDryRun) fs.writeFileSync(modelsIndex, lines.join('\n'));
    // }


    ////////////////////////////////////////////////
    // Route
    // const pathRoute = path.resolve(`./src/routes/${params.ModelNames}.ts`);
    // if (!argv['force'] && fs.existsSync(pathRoute)) throw new Error(`File already exists at ${pathRoute}`);
    // if (!isDryRun) fs.writeFileSync(pathRoute, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Route.ts'), 'utf8'), params));
    // console.log(`Created: ${pathRoute}`);

    // const mainIndex = path.resolve(`./src/index.js`);
    // const mainIndexContent = fs.readFileSync(mainIndex, 'utf8');
    // if (!mainIndexContent.includes(`require('./routes/${params.ModelNames}'));`)) {
    //     const mainIndexLines = mainIndexContent.split('\n');
    //     let lastLineWithRouteRequirePlusOne;
    //     for (let ii = mainIndexLines.length - 1; ii >= 0; ii--) {
    //         const line = mainIndexLines[ii].trim();
    //         if (line.includes(`require('./routes/`) && !lastLineWithRouteRequirePlusOne) {
    //             lastLineWithRouteRequirePlusOne = (ii + 2);
    //         }
    //     }

    //     if (lastLineWithRouteRequirePlusOne) {
    //         const routeRequireLine = `app.use('/api/v1/', require('./routes/${params.ModelNames}'));\n`;
    //         mainIndexLines.splice(lastLineWithRouteRequirePlusOne - 1, 1, routeRequireLine);
    //         if (!isDryRun) fs.writeFileSync(mainIndex, mainIndexLines.join('\n'));
    //     }
    // }


    ////////////////////////////////////////////////
    // Migration
    const pathMigration = path.resolve(`./src/database/migrations/${moment().format('YYYYMMDDHHmmss')}-create-${params.ModelNames}.js`);
    if (!argv['force'] && fs.existsSync(pathMigration)) throw new Error(`File already exists at ${pathMigration}`);
    if (!isDryRun) fs.writeFileSync(pathMigration, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Migration.js'), 'utf8'), params));
    console.log(`Created: ${pathMigration}`);


    ////////////////////////////////////////////////
    // Seeder
    const pathSeeder = path.resolve(`./src/database/seeders/${moment().format('YYYYMMDDHHmmss')}-${params.ModelNames}.js`);
    if (!argv['force'] && fs.existsSync(pathSeeder)) throw new Error(`File already exists at ${pathSeeder}`);
    if (!isDryRun) fs.writeFileSync(pathSeeder, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Seeder.js'), 'utf8'), params));
    console.log(`Created: ${pathSeeder}`);


    ////////////////////////////////////////////////
    // Test
    // const pathTest = path.resolve(`./tests/${params.ModelName}.js`);
    // if (!argv['force'] && fs.existsSync(pathTest)) throw new Error(`File already exists at ${pathTest}`);
    // if (!isDryRun) fs.writeFileSync(pathTest, Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/Test.js'), 'utf8'), params));
    // console.log(`Created: ${pathTest}`);


    ////////////////////////////////////////////////
    // Requests
    const pathRequests = path.resolve(`./requests.http`);
    const requestContent = fs.readFileSync(pathRequests, 'utf8');
    const newRequest = Mustache.render(fs.readFileSync(path.resolve('./src/scripts/generator/requests.http'), 'utf8'), params);
    if (!requestContent.includes(`### ${params.ModelName}`)) {
        if (!isDryRun) fs.writeFileSync(pathRequests, requestContent + '\n' + newRequest);
        console.log(`Updated: ${pathRequests}`);
    }
})();
