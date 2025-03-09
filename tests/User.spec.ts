import 'dotenv/config';
import { expect } from 'chai';
import axios, { Axios } from 'axios';

let api: Axios;

describe('User', () => {

    before('User', async () => {
        const { data } = await axios.post(`http://127.0.0.1/api/v1/auth/login`, {
            email: process.env.TEST_EMAIL,
            password: process.env.TEST_PASSWORD,
        });

        api = axios.create({
            baseURL: 'http://127.0.0.1',
            headers: {
                Authorization: `Bearer ${data.accessToken}`,
            }
        });
    });

    describe('GET /api/v1/user', () => {
        it('Should return current user', async () => {
            const { data } = await api.get(`/api/v1/user`);
            expect(data).to.have.property('id');
            expect(data).to.have.property('email');
            expect(data).to.have.property('firstName');
        });
    });

    describe('POST /api/v1/user', () => {
        it('Should return current user', async () => {
            const { data } = await api.post(`/api/v1/user`, {
                firstName: 'Alex',
                lastName: 'Jones',
                bio: 'bio here',
            });
            expect(data).to.have.property('id');
            expect(data).to.have.property('firstName');
            expect(data).to.have.property('lastName');
            expect(data).to.have.property('bio');

            expect(data.firstName).to.equal('Alex');
            expect(data.lastName).to.equal('Jones');
            expect(data.bio).to.equal('bio here');
        });
    });

    describe('POST /api/v1/user/resend-verification-email', () => {
        it('Should resend verification email', async () => {
            const { data } = await api.post(`/api/v1/user/resend-verification-email`);
            expect(data).to.have.property('email');
            expect(data.email).to.equal(process.env.TEST_EMAIL);
        });
    });

    describe('POST /api/v1/user/update-password', () => {
        it('Should update the users password', async () => {
            const { data } = await api.post(`/api/v1/user/update-password`, {
                newPassword: 'New_PASSWORD!4321',
                password: 'Password@1234',
            });
            expect(data.success).to.equal(true);
        });
    });
});
