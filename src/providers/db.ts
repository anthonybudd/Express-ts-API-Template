import { Sequelize } from 'sequelize-typescript';

if (process.env.NODE_ENV === 'test') {
    process.env.DB_USERNAME = 'root';
    process.env.DB_PASSWORD = 'supersecret';
    process.env.DB_DATABASE = 'test';
}

const sequelize = new Sequelize({
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    host: process.env.DB_HOST || '',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
sequelize.authenticate().then(() => console.log('* DB Connected'));

export default sequelize;
