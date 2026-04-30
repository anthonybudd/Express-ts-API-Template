import 'dotenv/config';
import GroupUser from '../src/models/GroupUser';
import { Group } from '../src/models/Group';
import { User } from '../src/models/User';
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import crypto from 'crypto';


describe('Auth', () => {
    const randomEmail = (prefix: string) => `${prefix}.${crypto.randomBytes(8).toString('hex')}@example.com`;
    const login = (email: string, password: string) => supertest(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

    describe('GET /api/v1/_authcheck', () => {
        it('Should check auth status', async () => {
            const loginRes = await login(process.env.TEST_EMAIL as string, process.env.TEST_PASSWORD as string)
                .expect(200);

            const authcheckRes = await supertest(app)
                .get('/api/v1/_authcheck')
                .set({
                    Authorization: `Bearer ${loginRes.body.accessToken}`,
                })
                .expect(200);

            expect(authcheckRes.body.auth).to.equal(true);
            expect(authcheckRes.body.id).to.be.a('string');
        });

        it('Should reject missing access token', async () => {
            await supertest(app)
                .get('/api/v1/_authcheck')
                .expect(401);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('Should return AccessToken', async () => {
            const res = await login(process.env.TEST_EMAIL as string, process.env.TEST_PASSWORD as string)
                .expect(200);

            expect(res.body.accessToken).to.be.a('string');
            expect(res.body.accessToken.length).to.be.greaterThan(20);
        });

        it('Should reject incorrect credentials', async () => {
            const res = await login(process.env.TEST_EMAIL as string, 'DefinitelyWrongPassword123!')
                .expect(401);

            expect(res.body.msg).to.equal('Incorrect email or password');
        });
    });

    describe('POST /api/v1/auth/sign-up', () => {
        const testEmail = randomEmail('test.signup');
        const testPassword = 'StrongPass123!';

        it('Should create a new user account', async () => {
            const res = await supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: testEmail,
                    password: testPassword,
                    firstName: 'Test',
                    lastName: 'User',
                    tos: 'tos-version-2026',
                })
                .expect(200);

            expect(res.body.accessToken).to.be.a('string');
            const createdUser = await User.unscoped().findOne({ where: { email: testEmail }, rejectOnEmpty: true });
            expect(createdUser.firstName).to.equal('Test');
            expect(createdUser.lastName).to.equal('User');
            expect(createdUser.emailVerified).to.equal(false);
            expect(createdUser.emailVerificationKey).to.be.a('string');
        });

        it('Should reject weak passwords', async () => {
            const res = await supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: randomEmail('another.test'),
                    password: 'weak',
                    firstName: 'Test',
                    lastName: 'User',
                    tos: 'tos-version-2026',
                })
                .expect(422);

            expect(res.body.errors.password.msg).to.be.a('string');
        });

        it('Should reject duplicate emails', async () => {
            const res = await supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: testEmail,
                    password: testPassword,
                    firstName: 'Test',
                    lastName: 'User',
                    tos: 'tos-version-2026',
                })
                .expect(422);

            expect(res.body.errors.email.msg).to.equal('This email address is taken');
        });
    });

    describe('GET /api/v1/auth/verify-email/:emailVerificationKey', () => {
        let emailVerificationKey: string;
        const testEmail = randomEmail('test.verify');

        before(async () => {
            await supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: testEmail,
                    password: 'StrongPass123!',
                    firstName: 'Test',
                    lastName: 'User',
                    tos: 'tos-version-2026',
                });

            const user = await User.unscoped().findOne({ where: { email: testEmail } });
            if (!user || !user.emailVerificationKey) {
                throw new Error('Failed to create test user or get verification key');
            }
            emailVerificationKey = user.emailVerificationKey;
        });

        it('Should verify email with valid key', async () => {
            const res = await supertest(app)
                .get(`/api/v1/auth/verify-email/${emailVerificationKey}`)
                .expect(200);

            expect(res.body.verified).to.equal(true);
            expect(res.body.id).to.be.a('string');

            const user = await User.unscoped().findOne({ where: { email: testEmail }, rejectOnEmpty: true });
            expect(user.emailVerified).to.equal(true);
            expect(user.emailVerificationKey).to.equal(null);
        });

        it('Should reject invalid verification key', async () => {
            await supertest(app)
                .get('/api/v1/auth/verify-email/invalid-key')
                .expect(404);
        });

        it('Should reject reused verification key', async () => {
            await supertest(app)
                .get(`/api/v1/auth/verify-email/${emailVerificationKey}`)
                .expect(404);
        });
    });

    describe('Password Reset Flow', () => {
        let passwordResetKey: string;
        const testEmail = randomEmail('test.reset');
        const newPassword = 'NewStrongPass123!';

        before(async () => {
            await supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: testEmail,
                    password: 'StrongPass123!',
                    firstName: 'Test',
                    lastName: 'User',
                    tos: 'tos-version-2026',
                });

            await supertest(app)
                .post('/api/v1/auth/forgot')
                .send({ email: testEmail })
                .expect(200);

            const user = await User.unscoped().findOne({ where: { email: testEmail }, rejectOnEmpty: true });
            passwordResetKey = user.passwordResetKey as string;
        });

        describe('POST /api/v1/auth/forgot', () => {
            it('Should initiate password reset', async () => {
                const res = await supertest(app)
                    .post('/api/v1/auth/forgot')
                    .send({ email: testEmail })
                    .expect(200);

                expect(res.body.success).to.equal(true);
                const user = await User.unscoped().findOne({ where: { email: testEmail }, rejectOnEmpty: true });
                expect(user.passwordResetKey).to.be.a('string');
                passwordResetKey = user.passwordResetKey as string;
            });

            it('Should reject non-existent email', async () => {
                const res = await supertest(app)
                    .post('/api/v1/auth/forgot')
                    .send({ email: 'nonexistent@example.com' })
                    .expect(422);

                expect(res.body.errors.email.msg).to.equal('This email address does not exist');
            });
        });

        describe('GET /api/v1/auth/get-user-by-reset-key/:passwordResetKey', () => {
            it('Should return user info for valid reset key', async () => {
                const res = await supertest(app)
                    .get(`/api/v1/auth/get-user-by-reset-key/${passwordResetKey}`)
                    .expect(200);

                expect(res.body.id).to.be.a('string');
                expect(res.body.email).to.equal(testEmail);
            });

            it('Should reject invalid reset key', async () => {
                await supertest(app)
                    .get('/api/v1/auth/get-user-by-reset-key/invalid-key')
                    .expect(404);
            });
        });

        describe('POST /api/v1/auth/reset', () => {
            it('Should reset password with valid key', async () => {
                const res = await supertest(app)
                    .post('/api/v1/auth/reset')
                    .send({
                        email: testEmail,
                        password: newPassword,
                        passwordResetKey: passwordResetKey
                    })
                    .expect(200);

                expect(res.body.accessToken).to.be.a('string');
                const user = await User.unscoped().findOne({ where: { email: testEmail }, rejectOnEmpty: true });
                expect(user.passwordResetKey).to.equal(null);
                await login(testEmail, newPassword).expect(200);
            });

            it('Should reject invalid reset key', async () => {
                const res = await supertest(app)
                    .post('/api/v1/auth/reset')
                    .send({
                        email: testEmail,
                        password: newPassword,
                        passwordResetKey: 'invalid-key'
                    })
                    .expect(422);

                expect(res.body.errors.passwordResetKey.msg).to.equal('This link has expired');
            });
        });
    });

    describe('User Invitation Flow', () => {
        let inviteKey: string;
        const testEmail = `${crypto.randomBytes(10).toString('hex')}@example.com`;

        describe('GET /api/v1/auth/get-user-by-invite-key/:inviteKey', () => {
            before(async () => {
                // Create a user with invite key
                const user = await User.create({
                    email: testEmail,
                    password: 'temporary',
                    firstName: '',
                    tos: 'tos-version-2026',
                });
                const group = await Group.create({
                    name: 'Test group',
                    ownerID: user.id,
                });
                const relationship = await GroupUser.create({
                    groupID: group.id,
                    userID: user.id,
                    role: 'User',
                    inviteKey: crypto.randomBytes(10).toString('hex'),
                });
                inviteKey = relationship.inviteKey as string;
            });

            it('Should return user info for valid invite key', async () => {
                const res = await supertest(app)
                    .get(`/api/v1/auth/get-user-by-invite-key/${inviteKey}`)
                    .expect(200);

                expect(res.body.id).to.be.a('string');
                expect(res.body.email).to.equal(testEmail);
            });

            it('Should reject invalid invite key', async () => {
                await supertest(app)
                    .get('/api/v1/auth/get-user-by-invite-key/invalid-key')
                    .expect(404);
            });
        });

        describe('POST /api/v1/auth/sign-up/with-invite', () => {
            it('Should accept invitation and create account', async () => {
                const res = await supertest(app)
                    .post('/api/v1/auth/sign-up/with-invite')
                    .send({
                        email: testEmail,
                        password: 'StrongPass123!',
                        firstName: 'Test',
                        lastName: 'User',
                        tos: 'tos-version-2026',
                        inviteKey: inviteKey
                    })
                    .expect(200);

                expect(res.body.accessToken).to.be.a('string');
                const user = await User.unscoped().findOne({ where: { email: testEmail }, rejectOnEmpty: true });
                const relationship = await GroupUser.unscoped().findOne({ where: { userID: user.id }, rejectOnEmpty: true });
                expect(user.emailVerified).to.equal(true);
                expect(user.emailVerificationKey).to.equal(null);
                expect(relationship.inviteKey).to.equal(null);
            });

            it('Should reject invalid invite key', async () => {
                await supertest(app)
                    .post('/api/v1/auth/sign-up/with-invite')
                    .send({
                        email: 'another@example.com',
                        password: 'StrongPass123!',
                        firstName: 'Test',
                        lastName: 'User',
                        tos: 'tos-version-2026',
                        inviteKey: 'invalid-key'
                    })
                    .expect(404);
            });
        });
    });
});
