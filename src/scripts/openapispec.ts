/**
 * ts-node ./src/scripts/jsdoc.ts
 * docker exec -ti express-api ts-node ./src/scripts/jsdoc.ts
 * npm run exec:jsdoc
 *
 */
import 'dotenv/config';
import { convert } from "@catalystic/json-to-yaml";
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';

(async function Main() {
    try {
        const openapiSpecification = swaggerJsdoc({
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'express-api',
                    version: '1.0.0',
                },
            },
            apis: ['./src/**/*.ts'],
        });

        const yaml = convert(openapiSpecification);
        fs.writeFileSync('./OpenApiSpec.yml', yaml);
        console.log('API spec written to ./OpenApiSpec.yml');
    } catch (err) {
        console.error(err);
    }
})();
