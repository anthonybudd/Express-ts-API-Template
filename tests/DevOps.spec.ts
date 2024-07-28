import 'dotenv/config';
import { expect } from 'chai';
import axios from 'axios';

// const chai = Chai.use(chaiHttp); // AB: Does not work. "Error: TypeError: Unknown file extension .ts"

describe('DevOps', () => {
    describe('GET /api/v1/_healthcheck', () => {
        it('Should return system status', async () => {
            const { data } = await axios.get(`${process.env.TEST_URL}/api/v1/_healthcheck`);
            expect(data.message).to.equal('healthy');
        });
    });

    describe('GET /_readiness', () => {
        it('Should return system readiness', async () => {
            const { data } = await axios.get(`${process.env.TEST_URL}/_readiness`);
            expect(data).to.equal('healthy');
        });
    });
});
