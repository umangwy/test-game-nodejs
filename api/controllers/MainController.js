/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: function (req, res) {
    console.log(req.session.user);
    // var userName = UserService.getLoggedInUser(req.session.user);

    if (req.session.user !== undefined) {
      id = req.session.user;
      Users.findOne({userId: id}).exec(function (err, foundUser) {
        if (err || !foundUser)
          res.view('main/index');

        req.session.userName = foundUser.userName;
        res.view('main/index', {userName: foundUser.userName})
      });
    }
    else {
      res.view('main/index')
    }
  },
  signup: function (req, res) {
    var userName = req.param("userName");
    var password = req.param("password");

    if (!userName && !password) {
      res.send(400, {error: "error in username and password"});
    }

    Users.findByUserName(userName).exec(function (err, user) {
      if (err) {
        res.send(500, {error: "DB Error"});
      }
      else if (user.length) {
        res.set('error', 'username already registered');
        res.send(400);
      }
      else {
        Users.create({userName: userName, password: password}).exec(function (err, user) {
          if (err) {
            res.send(500, {error: "Error while signing up"});
          }
          else {
            req.session.user = user.userId;
            req.session.userName = user.userName;
            return res.redirect('/');
          }
        });
      }
    });
  },
  login: function (req, res) {
    var userName = req.param("userName");
    var password = req.param("password");

    Users.findByUserName(userName).exec(function (err, user) {
      if (err) {
        res.send(500, {error: "DB Error"});
      } else {
        if (user.length) {
          if (password == user[0].password) {
            req.session.user = user[0].userId;
            req.session.userName = user[0].userName;
            return res.json(200);
          } else {
            res.set('error', 'wrong password');
            res.send(400, {error: "Wrong Password"});
          }
        } else {
          res.set('error', 'user not found');
          res.send(404, {error: "User not Found"});
        }
      }
    });
  },
  logout: function (req, res) {
    req.session.destroy(function(err) {
        return res.redirect('/');
    });
  }
};

