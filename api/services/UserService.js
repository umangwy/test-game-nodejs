/**
 * Created by umang.kedia on 09/05/16.
 */

module.exports = {
  getLoggedInUser: function (userId) {
    if (userId !== undefined) {
      Users.findOne({userId: userId}).exec(function (err, foundUser) {
        if (err || !foundUser)
          return;

        return foundUser.userName;
      });
    }
  }
};
