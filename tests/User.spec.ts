import 'dotenv/config';
import supertest from 'supertest';
import { expect } from 'chai';
import * as OTPAuth from "otpauth";
import app from '../src/app';
import User from '../src/models/User';


describe('User', () => {
    let accessToken: string;

    before(async () => {
        const response = await supertest(app)
            .post('/api/v1/auth/login')
            .send({
                email: process.env.TEST_EMAIL,
                password: process.env.TEST_PASSWORD,
            });

        accessToken = response.body.accessToken;
    });

    describe('GET /api/v1/user', () => {
        it('should return the current user', async () => {
            const response = await supertest(app)
                .get('/api/v1/user')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).to.have.property('id');
            expect(response.body).to.have.property('email');
            expect(response.body).to.have.property('firstName');
            expect(response.body).to.have.property('lastName');
            expect(response.body).to.have.property('groups');
            expect(response.body.groups).to.be.an('array');
        });

        it('should return 401 if not authenticated', async () => {
            await supertest(app)
                .get('/api/v1/user')
                .expect(401);
        });
    });

    describe('POST /api/v1/user', () => {
        it('should update user profile', async () => {
            const userData = {
                firstName: 'Updated',
                lastName: 'User',
                bio: 'Updated bio information'
            };

            const response = await supertest(app)
                .post('/api/v1/user')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(userData)
                .expect(200);

            expect(response.body).to.have.property('firstName', userData.firstName);
            expect(response.body).to.have.property('lastName', userData.lastName);
            expect(response.body).to.have.property('bio', userData.bio);
        });
    });

    describe('POST /api/v1/user/resend-verification-email', () => {
        it('should resend verification email', async () => {
            const response = await supertest(app)
                .post('/api/v1/user/resend-verification-email')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).to.have.property('email');
        });
    });

    describe('POST /api/v1/user/update-password', () => {
        it('should update user password', async () => {
            const passwordData = {
                password: process.env.TEST_PASSWORD,
                newPassword: 'NewPassword@1234',
            };

            const response = await supertest(app)
                .post('/api/v1/user/update-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(passwordData)
                .expect(200);

            expect(response.body).to.have.property('success', true);

            // Reset password back to original for other tests
            const resetData = {
                currentPassword: 'NewPassword@1234',
                newPassword: process.env.TEST_PASSWORD,
                confirmPassword: process.env.TEST_PASSWORD
            };

            await supertest(app)
                .post('/api/v1/user/update-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(resetData);
        });

        it('should reject if passwords do not match', async () => {
            const response = await supertest(app)
                .post('/api/v1/user/update-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: process.env.TEST_PASSWORD,
                    newPassword: 'NewPassword@1234',
                    confirmPassword: 'DifferentPassword@1234'
                })
                .expect(422);

            expect(response.body).to.have.property('errors');
        });
    });

    describe('POST /api/v1/user/enable-mfa', () => {
        it('should generate MFA uri', async () => {
            const response = await supertest(app)
                .post('/api/v1/user/enable-mfa')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    password: 'NewPassword@1234',
                })
                .expect(200);

            expect(response.body).to.have.property('uri');
        });
    });

    describe('POST /api/v1/user/confirm-mfa', async () => {
        it('should validate MFA token and enable MFA', async () => {

            const { mfaSecret, email: label } = await User.scope('mfa').findOne({
                where: {
                    email: process.env.TEST_EMAIL as string,
                },
                rejectOnEmpty: true
            });

            let totp = new OTPAuth.TOTP({
                issuer: 'express-api',
                label,
                algorithm: 'SHA3-512',
                digits: 6,
                period: 30,
                secret: mfaSecret as string,
            });

            const response = await supertest(app)
                .post('/api/v1/user/confirm-mfa')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ token: totp.generate() })
                .expect(200);

            expect(response.body).to.have.property('success');
        });
    });

    describe('POST /api/v1/user/disable-mfa', () => {
        it('should disable MFA for the user', async () => {
            const response = await supertest(app)
                .post('/api/v1/user/disable-mfa')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ password: 'NewPassword@1234' })
                .expect(200);

            expect(response.body).to.have.property('success', true);
        });
    });
});
