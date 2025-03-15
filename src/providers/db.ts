import { Sequelize } from 'sequelize-typescript';

if (process.env.NODE_ENV === 'test') {
    process.env.DB_USERNAME = 'root';
    process.env.DB_PASSWORD = 'supersecret';
    process.env.DB_DATABASE = 'test';
}

const sequelize = new Sequelize({
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
sequelize.authenticate().then(() => console.log(`* DB Connected (${process.env.NODE_ENV})`));

export default sequelize;
