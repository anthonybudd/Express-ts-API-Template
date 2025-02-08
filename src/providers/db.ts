import { Sequelize } from 'sequelize-typescript';

const connections = require('./connections');
let connection = (typeof global.it === 'function') ? 'test' : process.env.DB_CONNECTION;
if (!connection) connection = 'default';
const sequelize = new Sequelize(connections[connection]);
sequelize.authenticate();

export default sequelize;
