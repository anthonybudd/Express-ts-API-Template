import 'dotenv/config';
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../src/app';


describe('DevOps', () => {

    describe('GET /api/v1/_healthcheck', () => {
        it('Should return healthy status', (done) => {
            supertest(app)
                .get('/api/v1/_healthcheck')
                .expect(200)
                .end((err, res) => {
                    expect(res.body).to.have.property('message');
                    expect(res.body.message).to.equal('healthy');
                    done(err);
                });
        });
    });

    describe('GET /_readiness', () => {
        it('Should return healthy status', (done) => {
            supertest(app)
                .get('/_readiness')
                .expect(200)
                .end((err, res) => {
                    expect(res.text).to.equal('healthy');
                    done(err);
                });
        });
    });
});
