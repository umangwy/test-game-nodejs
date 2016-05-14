/**
 * Created by umang.kedia on 14/05/16.
 */

var request = require('supertest');
var should = require("should");

describe('MainController', function () {
  describe('POST /login', function () {
    it('tests successful login', function (done) {
      request(sails.hooks.http.app)
        .post('/login')
        .send({userName: 'foo', password: 'bar'})
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          done(err);
        });
    });
    it('tests user not found', function (done) {
      request(sails.hooks.http.app)
        .post('/login')
        .send({userName: 'test', password: 'bar'})
        .set('Accept', 'application/json')
        .expect(404)
        .end(function (err, res) {
          res.body.error.should.equal("User not Found");
          done(err);
        });
    });
    it('tests wrong password', function (done) {
      request(sails.hooks.http.app)
        .post('/login')
        .send({userName: 'foo', password: 'barr'})
        .set('Accept', 'application/json')
        .expect(400)
        .end(function (err, res) {
          res.body.error.should.equal("Wrong Password");
          done(err);
        });
    });
  });
});
