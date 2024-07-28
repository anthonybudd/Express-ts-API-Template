import 'dotenv/config';
import { expect } from 'chai';
import axios, { Axios } from 'axios';

let api: Axios;
let groupID: string = 'fdab7a99-2c38-444b-bcb3-f7cef61c275b';
let userID: string = 'd700932c-4a11-427f-9183-d6c4b69368f9'; // User2

describe('Group', () => {

    before('Group', async () => {
        const { data } = await axios.post(`${process.env.TEST_URL}/api/v1/auth/login`, {
            email: process.env.TEST_EMAIL,
            password: process.env.TEST_PASSWORD,
        });

        api = axios.create({
            baseURL: process.env.TEST_URL,
            headers: {
                Authorization: `Bearer ${data.accessToken}`,
            }
        });
    });

    describe('GET /api/v1/groups/:groupID', () => {
        it('Should return group by ID', async () => {
            const { data } = await api.get(`/api/v1/groups/${groupID}`);
            expect(data).to.have.property('id');
            expect(data).to.have.property('name');
        });
    });

    describe('POST /api/v1/groups/:groupID', () => {
        it('Should update group by ID', async () => {
            const { data } = await api.post(`/api/v1/groups/${groupID}`, {
                name: 'Updated Group Name',
            });
            expect(data).to.have.property('id');
            expect(data).to.have.property('name');
            expect(data.name).to.equal('Updated Group Name');
        });
    });

    describe('POST /api/v1/groups/:groupID/users/invite', () => {
        it('Should invite the user to the group', async () => {
            const { data } = await api.post(`/api/v1/groups/${groupID}/users/invite`, {
                email: 'new-user@gmail.com',
                role: 'User',
            });
            expect(data).to.have.property('groupID');
            expect(data).to.have.property('userID');
            expect(data).to.have.property('role');
            expect(data.groupID).to.equal(groupID);
            expect(data.role).to.equal('User');
        });
    });

    // describe('POST /api/v1/groups/:groupID/users/:userID/resend-invitation-email', () => {
    //     it('Should resend invitation email', async () => {
    //         const { data: invite } = await api.post(`/api/v1/groups/${groupID}/users/invite`, {
    //             email: 'another-new-user@gmail.com',
    //             role: 'User',
    //         });
    //         const { data } = await api.post(`/api/v1/groups/${groupID}/users/${invite.userID}/resend-invitation-email`);
    //         expect(data).to.have.property('email');
    //         expect(data.email).to.equal('another-new-user@gmail.com');
    //     });
    // });

    // describe('POST /api/v1/groups/:groupID/users/:userID/set-role', () => {
    //     it('Should update the users Role within the group', async () => {
    //         const { data } = await api.post(`/api/v1/groups/${groupID}/users/${userID}/set-role`, {
    //             role: 'Admin',
    //         });
    //         expect(data).to.have.property('groupID');
    //         expect(data).to.have.property('userID');
    //         expect(data).to.have.property('role');
    //         expect(data.groupID).to.equal(groupID);
    //         expect(data.userID).to.equal(userID);
    //         expect(data.role).to.equal('Admin');
    //     });
    // });

    describe('DELETE /api/v1/groups/:groupID/users/:userID', () => {
        it('Should remove the user from the group', async () => {
            const { data } = await api.delete(`/api/v1/groups/${groupID}/users/${userID}`);
            expect(data).to.have.property('groupID');
            expect(data).to.have.property('userID');
            expect(data.groupID).to.equal(groupID);
            expect(data.userID).to.equal(userID);
        });
    });
});
