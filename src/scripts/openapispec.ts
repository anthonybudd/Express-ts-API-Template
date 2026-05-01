/**
 * ts-node ./src/scripts/openapispec.ts
 * docker exec -ti express-api ts-node ./src/scripts/openapispec.ts
 * npm run exec:openapispec
 *
 */
import 'dotenv/config';
import { name as title, version } from '../../package.json';
import { convert } from '@catalystic/json-to-yaml';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';

(async function Main() {
    try {
        if (fs.existsSync('./OpenApiSpec.yml')) fs.unlinkSync('./OpenApiSpec.yml');

        const openapiSpecification = swaggerJsdoc({
            definition: {
                openapi: '3.0.0',
                info: {
                    title,
                    version,
                },
                servers: [
                    {
                        url: 'https://localhost/api/v1',
                        description: 'Local development server',
                    },
                    {
                        url: 'http://localhost:8888/api/v1',
                        description: 'Unsecured Local development server',
                    },
                    {
                        url: 'https://api.example.com/api/v1',
                        description: 'Production server',
                    },
                ]
            },
            apis: [
                './src/routes/Auth.ts', // AB: Keep this ordering
                './src/routes/User.ts',
                './src/**/*.ts'
            ],
        });

        let yaml = convert(openapiSpecification);
        yaml = yaml.replace(/(\b\d{3}\b):/g, '"$1":'); // AB: responses.200: -> responses."200":
        fs.writeFileSync('./OpenApiSpec.yml', yaml);
        console.log('API spec written to ./OpenApiSpec.yml');
    } catch (err) {
        console.error(err);
    }
})();
