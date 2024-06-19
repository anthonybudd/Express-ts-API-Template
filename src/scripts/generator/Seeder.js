const moment = require('moment');

const insert = [{
    id: '{{ UUID }}',
    name: 'Seeed {{ ModelName }}',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
}];

module.exports = {
    up: (queryInterface,) => queryInterface.bulkInsert('{{ ModelNames }}', insert),
    down: () => { }
};
