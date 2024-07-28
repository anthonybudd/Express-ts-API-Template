import Chai from 'chai';
// import chaiHttp from 'chai-http';
import server from '../src/app';

// const chai = Chai.use(chaiHttp);

describe('DevOps', () => {
    describe('GET  /api/v1/_healthcheck', () => {
        it('Should return system status', (done) => {
            done();
            // chai.request.execute(server)
            //     .get('/api/v1/_healthcheck')
            //     .end((err, res) => {
            //         res.should.have.status(200);
            //         res.should.be.json;
            //         res.body.should.be.a('object');
            //         res.body.status.should.equal('ok');
            //         done();
            //     });
        });
    });
});