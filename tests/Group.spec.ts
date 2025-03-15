import 'dotenv/config';
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../src/app';

describe('Group', () => {

    let api: supertest.SuperTest<supertest.Test>;
    let accessToken: string;
    const groupID = 'fdab7a99-2c38-444b-bcb3-f7cef61c275b';
    const userID = 'c4644733-deea-47d8-b35a-86f30ff9618e';
    const inviteUserID = 'b7ac1ed8-8cbc-4ccd-b475-ceca4b951802';

    before(async () => {
        const response = await supertest(app)
            .post('/api/v1/auth/login')
            .send({
                email: process.env.TEST_EMAIL,
                password: process.env.TEST_PASSWORD,
            });

        accessToken = response.body.accessToken;
    });

    describe('GET /api/v1/groups/:groupID', () => {
        it('should return group by ID', async () => {
            const response = await supertest(app)
                .get(`/api/v1/groups/${groupID}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).to.have.property('id');
            expect(response.body).to.have.property('name');
        });

        it('should return group with users when with=users query param is provided', async () => {
            const response = await supertest(app)
                .get(`/api/v1/groups/${groupID}?with=users`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).to.have.property('id');
            expect(response.body).to.have.property('name');
            expect(response.body).to.have.property('users');
            expect(response.body.users).to.be.an('array');
        });
    });

    describe('POST /api/v1/groups/:groupID', () => {
        it('should update group name', async () => {
            const newName = 'Updated Group Name';
            const response = await supertest(app)
                .post(`/api/v1/groups/${groupID}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ name: newName })
                .expect(200);

            expect(response.body).to.have.property('id');
            expect(response.body).to.have.property('name');
            expect(response.body.name).to.equal(newName);
        });
    });

    describe('POST /api/v1/groups/:groupID/users/invite', () => {
        it('should invite a user to the group', async () => {
            const response = await supertest(app)
                .post(`/api/v1/groups/${groupID}/users/invite`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    email: 'test-invite@example.com',
                    role: 'User'
                })
                .expect(200);

            expect(response.body).to.have.property('groupID');
            expect(response.body.groupID).to.equal(groupID);
        });
    });

    // describe('POST /api/v1/groups/:groupID/users/:userID/resend-invitation-email', () => {
    //     it('should resend invitation email to user', async () => {
    //         const response = await supertest(app)
    //             .post(`/api/v1/groups/${groupID}/users/${inviteUserID}/resend-invitation-email`)
    //             .set('Authorization', `Bearer ${accessToken}`);
    //         // .expect(200);

    //         console.log(response.body);
    //         expect(response.body).to.have.property('success');
    //         expect(response.body.success).to.be.true;
    //     });
    // });

    // describe('POST /api/v1/groups/:groupID/users/:userID/set-role', () => {
    //     it('should update user role in the group', async () => {
    //         const response = await supertest(app)
    //             .post(`/api/v1/groups/${groupID}/users/${inviteUserID}/set-role`)
    //             .set('Authorization', `Bearer ${accessToken}`)
    //             .send({ role: 'Admin' })
    //             .expect(200);

    //         expect(response.body).to.have.property('groupID');
    //         expect(response.body).to.have.property('userID');
    //         expect(response.body).to.have.property('role');
    //         expect(response.body.role).to.equal('Admin');
    //     });
    // });

    describe('DELETE /api/v1/groups/:groupID/users/:userID', () => {
        it('should remove user from the group', async () => {
            const response = await supertest(app)
                .delete(`/api/v1/groups/${groupID}/users/${inviteUserID}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).to.have.property('groupID');
            expect(response.body).to.have.property('userID');
        });
    });
});
