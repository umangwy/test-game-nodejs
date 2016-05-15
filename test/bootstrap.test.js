/**
 * Created by umang.kedia on 14/05/16.
 */

var sails = require('sails');
var hasher = require("password-hash");

before(function (done) {

  this.timeout(5000);

  //setting test environment here
  sails.lift({
    environment: 'test'
  }, function (err, server) {
    if (err) return done(err);

    //put test data
    seedData();
    done(err, sails);
  });
});

function seedData() {
  //new user data
  sails.models.users.create({userName: "foo", password: hasher.generate("bar")}).exec(function (err) {
  });
}

after(function (done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});

