import request from 'supertest';
import app from '../src/app';

// AB: I'm still working on this, sequelize+jest is causing issues.

describe('Auth', () => {

  /**
   * GET  /api/v1/_authcheck
   * 
   */
  describe('GET /api/v1/_authcheck', () => {
    it('Should check auth status', (done) => {
      // request(app)
      //   .get('/what-is-this-even')
      //   .set('Accept', 'application/json')
      //   .expect(404, done);

      request(app)
        .post('/api/v1/auth/login')
        .send({
          email: process.env.TEST_EMAIL,
          password: process.env.TEST_PASSWORD,
        })
        .expect(200, done);
      //   .end((err, res) => {
      //     if (err) console.error(err);
      //     console.log(res);
      //     done();
      //     // request(app)
      //     //   .get('/api/v1/_authcheck')
      //     //   .set({
      //     //     'Authorization': `Bearer ${res.body.accessToken}`,
      //     //   })
      //     //   .expect(200, done);
      //   });
    });
  });
});