/**
 * Created by umang.kedia on 14/05/16.
 */

var sails = require('sails');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(5000);

  sails.lift({
    // configuration for testing purposes
  }, function(err, server) {
    if (err) return done(err);
    // here you can load fixtures, etc.

    sails.models.users.create({userName: "foo", password: "bar"}).exec(function (err) {
      console.log(err);
    });
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.models.users.destroy({userName: "foo"}).exec(function (err) {
    sails.lower(done);
  });
});

