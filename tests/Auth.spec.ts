import 'dotenv/config';
import { expect } from 'chai';
import axios from 'axios';

// const chai = Chai.use(chaiHttp); // AB: Does not work. "Error: TypeError: Unknown file extension .ts"

describe('Auth', () => {

    describe('GET /api/v1/_authcheck', () => {
        it('Should check auth status', (done) => {
            axios.post(`http://127.0.0.1/api/v1/auth/login`, {
                email: process.env.TEST_EMAIL,
                password: process.env.TEST_PASSWORD,
            }).then((res) => axios.get(`http://127.0.0.1/api/v1/_authcheck`, {
                headers: {
                    'Authorization': `Bearer ${res.data.accessToken}`,
                }
            }).then((res) => {
                expect(res.data).to.have.property('id');
                done();
            }));
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('Should return AccessToken', (done) => {
            axios.post(`http://127.0.0.1/api/v1/auth/login`, {
                email: process.env.TEST_EMAIL,
                password: process.env.TEST_PASSWORD,
            }).then((res) => {
                expect(res.data).to.have.property('accessToken');
                done();
            });
        });
    });

    describe('POST /api/v1/auth/sign-up', () => {
        it('Should create a new user', (done) => {
            axios.post(`http://127.0.0.1/api/v1/auth/sign-up`, {
                email: 'test@example.com',
                password: 'Password@1234',
                firstName: 'Test User',
                tos: 'tos-version-2023-07-13'
            }).then((res) => {
                expect(res.status).to.equal(200);
                expect(res.data).to.have.property('accessToken');
                done();
            }).catch((err) => done(err.response.data || err));
        });
    });

    describe('GET /api/v1/auth/verify-email/:emailVerificationKey', () => {
        it('Should verify email address', (done) => {
            const emailVerificationKey = 'd6c4b69368f9';
            axios.get(`http://127.0.0.1/api/v1/auth/verify-email/${emailVerificationKey}`)
                .then((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.data).to.have.property('verified');
                    expect(res.data.verified).to.equal(true);
                    done();
                }).catch((err) => done(err.response.data || err));
        });
    });

    // describe('POST /api/v1/auth/forgot', () => {
    //     it('Should send forgot email', (done) => {
    //         axios.post(`http://127.0.0.1/api/v1/auth/forgot`, {
    //             email: 'other.user@foobar.com',
    //         }).then((res) => {
    //             expect(res.status).to.equal(200);
    //             expect(res.data).to.have.property('verified');
    //             expect(res.data.verified).to.equal(true);
    //             done();
    //         }).catch((err) => done(err.response.data || err));
    //     });
    // });

    // GET  /api/v1/auth/get-user-by-reset-key/:passwordResetKey
    // POST /api/v1/auth/reset
    // GET  /api/v1/auth/get-user-by-invite-key/:inviteKey
    // POST /api/v1/auth/invite
});
