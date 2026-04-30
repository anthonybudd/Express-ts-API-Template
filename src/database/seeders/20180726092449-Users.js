const bcrypt = require('bcryptjs');
const day = require('dayjs');


const insert = [{
    id: 'c4644733-deea-47d8-b35a-86f30ff9618e',
    email: 'user@example.com',
    password: bcrypt.hashSync('Password@1234', bcrypt.genSaltSync(10)),
    mfaEnabled: false,
    firstName: 'User',
    lastName: 'One',
    bio: 'I am a user',
    tos: 'tos-version-2023-07-13',
    emailVerified: true,
    createdAt: day().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: day().format('YYYY-MM-DD HH:mm:ss'),
    lastLoginAt: day().format('YYYY-MM-DD HH:mm:ss'),
}, {
    id: 'd700932c-4a11-427f-9183-d6c4b69368f9',
    email: 'other.user@example.com',
    password: bcrypt.hashSync('Password@1234', bcrypt.genSaltSync(10)),
    mfaEnabled: false,
    firstName: 'John',
    lastName: 'Smith',
    bio: 'I am the other user',
    tos: 'tos-version-2023-07-13',
    emailVerificationKey: 'f5009ff5',
    emailVerified: false,
    createdAt: day().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: day().format('YYYY-MM-DD HH:mm:ss'),
    lastLoginAt: day().format('YYYY-MM-DD HH:mm:ss'),
}, {
    id: 'b7ac1ed8-8cbc-4ccd-b475-ceca4b951802',
    email: 'invite@example.comm',
    password: bcrypt.hashSync('Password@1234', bcrypt.genSaltSync(10)),
    mfaEnabled: false,
    firstName: 'Invite',
    lastName: 'User',
    bio: 'This user was invited to the platform',
    tos: 'tos-version-2023-07-13',
    emailVerified: false,
    createdAt: day().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: day().format('YYYY-MM-DD HH:mm:ss'),
    lastLoginAt: day().format('YYYY-MM-DD HH:mm:ss'),
}];


module.exports = {
    up: (queryInterface) => queryInterface.bulkInsert('Users', insert).catch(err => console.log(err)),
    down: () => { }
};
