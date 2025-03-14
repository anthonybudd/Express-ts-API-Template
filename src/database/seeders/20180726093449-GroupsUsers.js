const day = require('dayjs');

const insert = [
    {
        id: '1872dcde-b79d-4f28-a36b-a22af519ac23',
        userID: 'c4644733-deea-47d8-b35a-86f30ff9618e',
        groupID: 'fdab7a99-2c38-444b-bcb3-f7cef61c275b',
        role: 'Admin',
        createdAt: day().format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        id: 'f4444505-cec7-4f91-948f-cdf3d4471c9e',
        userID: 'c4644733-deea-47d8-b35a-86f30ff9618e',
        groupID: 'be1fcb4e-caf9-41c2-ac27-c06fa24da36a',
        role: 'User',
        createdAt: day().add(1, 'min').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        id: 'ed748a2d-453b-4bc8-b80d-bf1056e2b920',
        userID: 'd700932c-4a11-427f-9183-d6c4b69368f9',
        groupID: 'be1fcb4e-caf9-41c2-ac27-c06fa24da36a',
        role: 'Admin',
        createdAt: day().format('YYYY-MM-DD HH:mm:ss'),
    },


    {
        id: 'f2c5ec2e-7a64-4000-92d0-c80e62ed1c35',
        userID: 'b7ac1ed8-8cbc-4ccd-b475-ceca4b951802',
        groupID: 'be1fcb4e-caf9-41c2-ac27-c06fa24da36a',
        role: 'User',
        createdAt: day().format('YYYY-MM-DD HH:mm:ss'),
    }
];


module.exports = {
    up: (queryInterface) => queryInterface.bulkInsert('GroupsUsers', insert).catch(err => console.log(err)),
    down: () => { }
};
