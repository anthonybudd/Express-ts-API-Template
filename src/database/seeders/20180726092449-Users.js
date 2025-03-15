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
    id: '007bedce-005b-41b4-96f5-c08ed7d88af3',
    email: 'mfa@example.com',
    password: bcrypt.hashSync('Password@1234', bcrypt.genSaltSync(10)),
    mfaEnabled: true,
    mfaSecret: '1234567890',
    firstName: 'MFA',
    lastName: 'User',
    bio: 'I am a user who has MFA enabled',
    emailVerified: true,
    tos: 'tos-version-2023-07-13',
    createdAt: day().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: day().format('YYYY-MM-DD HH:mm:ss'),
    lastLoginAt: day().format('YYYY-MM-DD HH:mm:ss'),
}, {
    id: 'd700932c-4a11-427f-9183-d6c4b69368f9',
    email: 'other.user@foobar.com',
    password: bcrypt.hashSync('Password@1234', bcrypt.genSaltSync(10)),
    mfaEnabled: false,
    firstName: 'John',
    lastName: 'Smith',
    bio: 'I am a user',
    tos: 'tos-version-2023-07-13',
    emailVerificationKey: 'f5009ff5',
    emailVerified: false,
    createdAt: day().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: day().format('YYYY-MM-DD HH:mm:ss'),
    lastLoginAt: day().format('YYYY-MM-DD HH:mm:ss'),
}];


module.exports = {
    up: (queryInterface) => queryInterface.bulkInsert('Users', insert).catch(err => console.log(err)),
    down: () => { }
};
