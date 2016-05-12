/**
 * GameroomController
 *
 * @description :: Server-side logic for managing gamerooms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  createGameRoom: function (req, res) {
    var gameroomName = req.param('gameroomName');

    if (!gameroomName) {
      return res.json(400, "Gameroom name cannot be empty");
    }
    // req.session.user = 1; //testing

    if (req.session.user !== undefined) {
      var loggedInUser = req.session.user;
      Gameroom.findOne({admin: loggedInUser}).exec(function (err, result) {
        if (err)
          return res.json(500, {error: "DB connection error"});

        if (result) {
          return res.json(400, {error: "You can create only one gameroom at a time"});
        }
        else {
          Gameroom.create({
            gameroomName: gameroomName,
            activeStatus: 1,
            admin: parseInt(loggedInUser)
          }).exec(function (err, result) {
            if (err)
              return res.json(500, {error: "DB connection error"});

            else {
              //insert that player into gameroom too
              console.log("gameroom created");
              Gameroom_Players.create({
                gameroomName: gameroomName,
                gameroomId: result.gameroomId,
                userId: parseInt(loggedInUser)
              }).exec(function () {
                console.log("creator added to gameroom");
                GameRoomService.publishGameSummaryUpdates(req, result.gameroomId, {}); //data can be anything here as client is again calling api
              });
              return res.json(result);
            }
          });
        }
      });
    }
    else {
      res.json(400, {error: 'You are not logged in'})
    }
  },
  getActiveGameRooms: function (req, res) {
    Gameroom.find({activeStatus: 1}).populate('admin').exec(function (err, result) {
      if (err)
        res.json(500, {error: "DB connection error"});

      GameRoomService.subscribeUsersToGameSummaryUpdates(req, res);
      return res.json(result);

    });
  },
  getGameRoomDetails: function (req, res) {
    Gameroom_Players.find().populate('gameroomId').populate('userId').exec(function (err, result) {
      if (err)
        res.json(500, {error: "DB connection error"});

      return res.json(result);
    })
  },
  getUsersCurrentGameroom: function (req, res) {
    var userId = req.param('userId');
    Gameroom_Players.findOne({userId: userId}).exec(function (err, result) {
      if (err)
        return res.json(500, {error: "DB connection error"});

      return res.json(200, {data: result});
    });

  },
  getGameRoomSummary: function (req, res) {
    Gameroom_Players.query("SELECT gameroomId, gameroomName,  count(*) as playersCount from gameroom_players GROUP BY gameroomId, gameroomName", function (err, result) {
      if (err)
        res.json(500, {error: "DB connection error"});

      GameRoomService.subscribeUsersToGameSummaryUpdates(req, res);
      return res.json(result);
    })
  },
  joinGameRoom: function (req, res) {
    var gameroomId = req.param('gameroomId');

    // req.session.user = 2; //testing

    if (req.session.user === undefined) {
      return res.json(400, {error: 'You are not logged in'});
    }

    var loggedInUser = req.session.user;
    Gameroom_Players.findOne({userId: loggedInUser}).exec(function (err, result) {
      if (err)
        return res.json(500, {error: "DB connection error"});

      if (result) {
        return res.json(400, {error: "You can join only one gameroom at a time"});
      }
      else {
        Gameroom.find({gameroomId: gameroomId}).exec(function (err, result) {
          if (result.length == 0) {
            return res.json(400, {error: "Gameroom doesn't exist"});
          }

          var gameroomName = result[0].gameroomName;
          Gameroom_Players.find({gameroomId: gameroomId}).exec(function (err, result) {
            if (result.length < sails.config.gameconfig.maxGamePlayers) {
              Gameroom_Players.create({
                gameroomName: gameroomName,
                gameroomId: gameroomId,
                userId: parseInt(loggedInUser)
              }).exec(function (err, result) {
                if (err)
                  return res.json(500, {error: "DB connection error"});

                GameRoomService.publishGameSummaryUpdates(req, res, JSON.stringify(result));
                req.session.gameroomId = gameroomId;
                return res.json(result.toJSON());
              });
            }
            else
              return res.json(400, {error: 'Gameroom can contain max ' + sails.config.gameconfig.maxGamePlayers + ' players'});
          });
        })
      }
    });

  },
  //landing page for game
  gameLandingPage: function (req, res) {
    var gameroomId = req.param('gameRoomId');
    if (!gameroomId) {
      return res.redirect('main/index');
    }

    if (req.session.user === undefined) {
      return res.redirect('main/index');
    }

    var loggedInUser = req.session.user;
    //check if user is added in the gameroom
    Gameroom_Players.findOne({
      userId: parseInt(loggedInUser),
      gameroomId: parseInt(gameroomId)
    }).exec(function (err, result) {
      if (!result) {
        return res.json(400, {error: "You are not added in this gameroom, gameroom id is " + gameroomId});
      }
      else {
        req.session.gameroomId = gameroomId;
        return res.view('main/game');
      }
    })
  },
  //called while game play
  playGame: function (req, res) {
    var gameroomId = req.param('gameRoomId');
    if (!gameroomId) {
      res.view('main/index');
    }

    if (req.session.user === undefined) {
      res.view('main/index');
    }

    var loggedInUser = req.session.user;
    //check if user is added in the gameroom

    var message = req.param("message");

    if (message) {
      var data = {message: message, userId: loggedInUser};
      GameRoomService.publishGameUpdate(req, gameroomId, data);
    }

    return res.json(200);
  },
  //called when someone enters specific gameroom
  subscribeToGame: function (req, res) {
    var gameroomId = req.param('gameRoomId');
    if (!gameroomId) {
      res.view('main/index');
    }

    if (req.session.user === undefined) {
      res.view('main/index');
    }

    var userId = req.session.user;
    var userName = req.session.userName;
    var data = {message: "User " + userName + " joined the game"};
    GameRoomService.subscribeUserToGameUpdate(req, gameroomId);
    GameRoomService.publishGameRoomUpdates(req, gameroomId, data);
  },
  leaveCurrentGame: function (req, res) {
    var gameroomId = req.param('gameRoomId');
    if (!gameroomId) {
      res.view('main/index');
    }

    if (req.session.user === undefined) {
      res.view('main/index');
    }
    var userId = req.session.user;

    //check if user is admin, if admin then delete all users from room and delete the gameroom itself
    Gameroom.findOne({admin: userId}).exec(function (err, result) {
      if (err)
        return res.json(500, {error: "DB connection error"});

      if (result) {
        console.log("userId " + userId + " is admin, deleting gameroom");
        Gameroom_Players.destroy({gameroomId: gameroomId}).exec(function (err) {
        });
        Gameroom.destroy({admin: userId}).exec(function (err) {
          if (!err)
            GameRoomService.publishGameRoomDeleteUpdate(req, gameroomId, {gameroomId: gameroomId});
        });
      }
      else {
        //if not admin
        Gameroom_Players.destroy({userId: userId}).exec(function (err) {
          if (!err) {
            var data = {message: "User " + req.session.userName + " has left the game"};
            GameRoomService.publishGameRoomUpdates(req, gameroomId, data);
            GameRoomService.unsubscribeUserFromGameRoom(req, gameroomId);
          }
        });
      }
      GameRoomService.publishGameSummaryUpdates(req, gameroomId, {}); //data can be anything here as client is again calling api

      return res.json(200);
    });

  }
};

