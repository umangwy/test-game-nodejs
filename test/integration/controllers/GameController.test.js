/**
 * Created by umang.kedia on 15/05/16.
 */

var request = require('supertest');
var should = require("should");

describe('GameController', function () {

  describe('POST /createGame', function () {
    var agent;

    //create session before gameroom creation
    it('logs in and creates session', function (done) {
      agent = request.agent(sails.hooks.http.app);

      agent
        .post('/login')
        .send({userName: 'foo', password: 'bar'})
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          done(err);
        });
    });
    it("creates game using existing session", function (done) {
      agent
        .post('/createGameRoom')
        .send({gameroomName: 'game1'})
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          res.body.gameroomName.should.equal("game1");
          res.body.should.not.have.property('error');

          // check admin inserted in gameroom table too.
          sails.models.gameroom.find({admin : res.body.admin}).exec(function (err, result) {
            result.length.should.equal(1);
            done(err);
          });
        });
    })
  });
});
