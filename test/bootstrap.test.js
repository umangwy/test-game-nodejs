/**
 * Created by umang.kedia on 14/05/16.
 */

var sails = require('sails');
var hasher = require("password-hash");

before(function (done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(5000);

  //setting development environment here
  sails.lift({
    environment: 'test'
  }, function (err, server) {
    if (err) return done(err);

    //put test data
    sails.models.users.create({userName: "foo", password: hasher.generate("bar")}).exec(function (err) {
      console.log(err);
    });
    done(err, sails);
  });
});

after(function (done) {
  // here you can clear fixtures, etc.
  sails.models.users.destroy({userName: "foo"}).exec(function (err) {
    sails.lower(done);
  });
});

