/**
 * Created by umang.kedia on 14/05/16.
 */

var request = require('supertest');

describe('MainController', function() {
  describe('POST /login', function () {
    it('testing login', function (done) {
      request(sails.hooks.http.app)
        .post('/login')
        .send({userName: 'foo', password: 'bar'})
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          console.log("error");

          done();
        })
    });
  });
});
