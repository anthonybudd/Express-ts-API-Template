const moment = require('moment');

const insert = [{
    id: '{{ UUID }}',
    name: 'Seeded {{ ModelName }}',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    {{#userID}}
    userID: '{{ userID }}',
    {{/userID}}
    {{#groupID}}
    groupID: '{{ groupID }}',
    {{/groupID}}
}];

module.exports = {
    up: (queryInterface,) => queryInterface.bulkInsert('{{ ModelNames }}', insert),
    down: () => { }
};
