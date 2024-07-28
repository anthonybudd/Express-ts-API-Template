const day = require('dayjs');

const insert = [{
    id: '{{ UUID }}',
    name: 'Seeded {{ ModelName }}',
    createdAt: day().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: day().format('YYYY-MM-DD HH:mm:ss'),
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
