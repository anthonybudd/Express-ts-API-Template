// AB: Cannot be .ts because of the https://github.com/sequelize/cli/blob/2571924a9ed4e8d2f8bbb1ba606d72e8a9debe35/src/helpers/config-helper.js#L51C51-L51C55

require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || '3306',
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
    test: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: 'express-api-db-test',
        port: process.env.DB_PORT || '3306',
        dialect: 'mysql',
    }
};
