import 'dotenv/config';
import { User } from '../src/models/User';
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../src/app';


describe('Auth', () => {

    describe('GET /api/v1/_authcheck', () => {
        it('Should check auth status', (done) => {
            supertest(app)
                .post('/api/v1/auth/login')
                .send({
                    email: process.env.TEST_EMAIL,
                    password: process.env.TEST_PASSWORD,
                })
                .expect(200)
                .end((err, res) => {
                    supertest(app)
                        .get('/api/v1/_authcheck')
                        .set({
                            'Authorization': `Bearer ${res.body.accessToken}`,
                        })
                        .expect(200)
                        .end((err, res) => {
                            done(err);
                        });
                });
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('Should return AccessToken', (done) => {
            supertest(app)
                .post('/api/v1/auth/login')
                .send({
                    email: process.env.TEST_EMAIL,
                    password: process.env.TEST_PASSWORD,
                })
                .expect(200)
                .end((err, res) => {
                    done(err);
                });
        });
    });

    describe('POST /api/v1/auth/sign-up', () => {
        const testEmail = 'test.signup@example.com';

        it('Should create a new user account', (done) => {
            supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: testEmail,
                    password: 'StrongPass123!',
                    firstName: 'Test',
                    lastName: 'User',
                    tos: true
                })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    // expect(res.body).toHaveProperty('accessToken');
                    done();
                });
        });

        it('Should reject weak passwords', (done) => {
            supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: 'another.test@example.com',
                    password: 'weak',
                    firstName: 'Test',
                    lastName: 'User',
                    tos: true
                })
                .expect(422)
                .end((err, res) => {
                    done(err);
                });
        });

        it('Should reject duplicate emails', (done) => {
            supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: testEmail,
                    password: 'StrongPass123!',
                    firstName: 'Test',
                    lastName: 'User',
                    tos: true
                })
                .expect(422)
                .end((err, res) => {
                    done(err);
                });
        });
    });

    describe('GET /api/v1/auth/verify-email/:emailVerificationKey', () => {
        let emailVerificationKey: string;
        let testEmail = 'test.verify@example.com';

        before(async () => {
            const response = await supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: testEmail,
                    password: 'StrongPass123!',
                    firstName: 'Test',
                    lastName: 'User',
                    tos: true
                });

            // We need to get the verification key from the database
            const user = await User.unscoped().findOne({ where: { email: testEmail } });
            if (!user || !user.emailVerificationKey) {
                throw new Error('Failed to create test user or get verification key');
            }
            emailVerificationKey = user.emailVerificationKey;
        });

        it('Should verify email with valid key', (done) => {
            supertest(app)
                .get(`/api/v1/auth/verify-email/${emailVerificationKey}`)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    // expect(res.body.verified).toBe(true);
                    done();
                });
        });

        it('Should reject invalid verification key', (done) => {
            supertest(app)
                .get('/api/v1/auth/verify-email/invalid-key')
                .expect(404)
                .end((err, res) => {
                    done(err);
                });
        });
    });

    describe('Password Reset Flow', () => {
        let passwordResetKey: string;
        const testEmail = 'test.reset@example.com';

        before(async () => {
            // Create a test user
            await supertest(app)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: testEmail,
                    password: 'StrongPass123!',
                    firstName: 'Test',
                    lastName: 'User',
                    tos: true
                });

            await supertest(app)
                .post('/api/v1/auth/forgot')
                .send({ email: testEmail })
                .expect(200);

            const user = await User.unscoped().findOne({ where: { email: testEmail }, rejectOnEmpty: true });
            passwordResetKey = user.passwordResetKey as string;
        });

        describe('POST /api/v1/auth/forgot', () => {
            it('Should initiate password reset', (done) => {
                supertest(app)
                    .post('/api/v1/auth/forgot')
                    .send({ email: testEmail })
                    .expect(200)
                    .end(async (err, res) => {
                        if (err) return done(err);
                        // Get the reset key from database for next tests
                        const user = await User.unscoped().findOne({ where: { email: testEmail } });
                        if (!user || !user.passwordResetKey) {
                            return done(new Error('Failed to get password reset key'));
                        }
                        passwordResetKey = user.passwordResetKey;
                        done();
                    });
            });

            it('Should reject non-existent email', (done) => {
                supertest(app)
                    .post('/api/v1/auth/forgot')
                    .send({ email: 'nonexistent@example.com' })
                    .expect(422)
                    .end((err, res) => {
                        done(err);
                    });
            });
        });

        describe('GET /api/v1/auth/get-user-by-reset-key/:passwordResetKey', () => {
            it('Should return user info for valid reset key', (done) => {
                supertest(app)
                    .get(`/api/v1/auth/get-user-by-reset-key/${passwordResetKey}`)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        expect(res.body.email).to.equal(testEmail);
                        done();
                    });
            });

            it('Should reject invalid reset key', (done) => {
                supertest(app)
                    .get('/api/v1/auth/get-user-by-reset-key/invalid-key')
                    .expect(404)
                    .end((err, res) => {
                        done(err);
                    });
            });
        });

        describe('POST /api/v1/auth/reset', () => {
            it('Should reset password with valid key', (done) => {
                supertest(app)
                    .post('/api/v1/auth/reset')
                    .send({
                        email: testEmail,
                        password: 'NewStrongPass123!',
                        passwordResetKey: passwordResetKey
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        // expect(res.body).toHaveProperty('accessToken');
                        done();
                    });
            });

            it('Should reject invalid reset key', (done) => {
                supertest(app)
                    .post('/api/v1/auth/reset')
                    .send({
                        email: testEmail,
                        password: 'NewStrongPass123!',
                        passwordResetKey: 'invalid-key'
                    })
                    .expect(422)
                    .end((err, res) => {
                        done(err);
                    });
            });
        });
    });

    describe('User Invitation Flow', () => {
        let inviteKey: string;
        const testEmail = 'test.invite@example.com';

        describe('GET /api/v1/auth/get-user-by-invite-key/:inviteKey', () => {
            before(async () => {
                // Create a user with invite key
                const user = await User.create({
                    email: testEmail,
                    password: 'temporary',
                    firstName: '',
                    inviteKey: 'test-invite-key-123'
                });
                inviteKey = user.inviteKey as string;
            });

            it('Should return user info for valid invite key', (done) => {
                supertest(app)
                    .get(`/api/v1/auth/get-user-by-invite-key/${inviteKey}`)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        // expect(res.body.email).toBe(testEmail);
                        done();
                    });
            });

            it('Should reject invalid invite key', (done) => {
                supertest(app)
                    .get('/api/v1/auth/get-user-by-invite-key/invalid-key')
                    .expect(404)
                    .end((err, res) => {
                        done(err);
                    });
            });
        });

        describe('POST /api/v1/auth/invite', () => {
            it('Should accept invitation and create account', (done) => {
                supertest(app)
                    .post('/api/v1/auth/invite')
                    .send({
                        email: testEmail,
                        password: 'StrongPass123!',
                        firstName: 'Test',
                        lastName: 'User',
                        tos: true,
                        inviteKey: inviteKey
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        // expect(res.body).toHaveProperty('accessToken');
                        done();
                    });
            });

            it('Should reject invalid invite key', (done) => {
                supertest(app)
                    .post('/api/v1/auth/invite')
                    .send({
                        email: 'another@example.com',
                        password: 'StrongPass123!',
                        firstName: 'Test',
                        lastName: 'User',
                        tos: true,
                        inviteKey: 'invalid-key'
                    })
                    .expect(404)
                    .end((err, res) => {
                        done(err);
                    });
            });
        });
    });
});
