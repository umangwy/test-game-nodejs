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


        Gameroom.create({
          gameroomName: gameroomName,
          activeStatus: 0,
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
    var gameroomId = req.param("gameroomId");
    Gameroom.findOne({gameroomId: gameroomId}).exec(function (err, result) {
      if (err)
        res.json(500, {error: "DB connection error"});

      return res.json(200, result);
    })
  },
  getUsersCurrentGameroom: function (req, res) {
    var userId = req.param('userId');
    Gameroom_Players.find({userId: userId}).exec(function (err, result) {
      if (err)
        return res.json(500, {error: "DB connection error"});

      return res.json(200, result);
    });

  },
  getGameRoomSummary: function (req, res) {
    Gameroom.find().populate('admin').exec(function (err, result) {
      if (err)
        res.json(500, {error: "DB connection error"});

      GameRoomService.subscribeUsersToGameSummaryUpdates(req, res);
      return res.json(result);
    })
  },
  joinGameRoom: function (req, res) {
    var gameroomId = req.param('gameroomId');

    if (req.session.user === undefined) {
      return res.json(400, {error: 'You are not logged in'});
    }

    var loggedInUser = req.session.user;
    Gameroom_Players.findOne({userId: loggedInUser, gameroomId: gameroomId}).exec(function (err, result) {
      if (err)
        return res.json(500, {error: "DB connection error"});

      if (result) {
        return res.json(400, {error: "You are already added in this room"});
      }
      else {
        Gameroom.findOne({gameroomId: gameroomId}).exec(function (err, result) {
          if (!result) {
            return res.json(400, {error: "Gameroom doesn't exist"});
          }
          else if (result.activeStatus == 1) {
            return res.json(400, {error: "You cannot join the game once it has started"});
          }

          var gameroomName = result[0].gameroomName;
          Gameroom_Players.find({gameroomId: gameroomId}).exec(function (err, result) {
            if (result.length < sails.config.gameconfig.maxGamePlayers) {
              Gameroom.query("UPDATE gameroom set activePlayers=activePlayers+1 where gameroomId=" + gameroomId, function () {
              });
              Gameroom_Players.create({
                gameroomName: gameroomName,
                gameroomId: gameroomId,
                userId: parseInt(loggedInUser)
              }).exec(function (err, result) {
                if (err)
                  return res.json(500, {error: "DB connection error"});

                GameRoomService.publishGameSummaryUpdates(req, res, JSON.stringify(result));
                return res.json(result.toJSON());
              });
            }
            else
              return res.json(400, {error: 'Gameroom can contain max ' + sails.config.gameconfig.maxGamePlayers + ' players'});
          });
        });
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
        //sending gameroomid is necessary, because player can play multiple game at one and we can't store gameroomid in session
        return res.view('main/game', {gameroomId: gameroomId});
      }
    })
  },
  //called while game chat
  gameChat: function (req, res) {
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
      var data = {message: message, userId: loggedInUser, userName: req.session.userName};
      GameRoomService.publishGameChat(req, gameroomId, data);
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

    var userName = req.session.userName;
    var data = {message: "User " + userName + " joined the game"};
    GameRoomService.subscribeUserToGameUpdate(req, gameroomId);
    GameRoomService.publishGameRoomUpdates(req, gameroomId, data);
    GameRoomService.publishGameScores(req, gameroomId, {});
  },
  leaveCurrentGame: function (req, res) {
    var gameroomId = req.param('gameRoomId');
    if (!gameroomId) {
      return res.view('main/index');
    }

    if (req.session.user === undefined) {
      return res.view('main/index');
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
        //if not admin then delete from gameroom_players and decrease active players count from gameroom
        Gameroom_Players.destroy({userId: userId}).exec(function (err) {
          if (!err) {
            var data = {message: "User " + req.session.userName + " has left the game"};
            Gameroom.query("UPDATE gameroom SET activePlayers=activePlayers-1 where gameroomId=" + gameroomId, function () {
              GameRoomService.publishGameRoomUpdates(req, gameroomId, data);
              GameRoomService.unsubscribeUserFromGameRoom(req, gameroomId);
            });
          }
        });
      }
      GameRoomService.publishGameScores(req, gameroomId, {});
      GameRoomService.publishGameSummaryUpdates(req, gameroomId, {}); //data can be anything here as client is again calling api

      return res.json(200);
    });
  },
  startGame: function (req, res) {
    var gameroomId = req.param('gameRoomId');

    if (req.session.user === undefined) {
      return res.json(400, {error: "User is not logged in"});
    }

    //check if game has already started, and check there are are minimum no. of players before starting the game
    Gameroom_Players.find({gameroomId: gameroomId}).exec(function (err, result) {
      if (result.length >= sails.config.gameconfig.minGamePlayers) {
        Gameroom.update({gameroomId: gameroomId}, {activeStatus: 1}).exec(function (err, result) {
          if (err) {
            return res.json(500, {error: "DB connection error"});
          }

          GameRoomService.publishGameStartUpdate(req, gameroomId, {});
          var data = {message: "User " + req.session.userName + " started the game"};
          GameRoomService.publishGameRoomUpdates(req, gameroomId, data);
          return res.json(200);
        });
      }

      else {
        console.log("Cannot start game due to insufficient players");
        return res.json(403, {error: "You need at least " + sails.config.gameconfig.minGamePlayers + " players to start the game"});
      }
    });
  },
  getGameScores: function (req, res) {
    var gameroomId = req.param('gameRoomId');

    if (req.session.user === undefined) {
      return res.json(400, {error: "User is not logged in"});
    }

    Gameroom_Players.find({gameroomId: gameroomId}).populate('userId').exec(function (err, result) {
      if (err) {
        return res.json(500, {error: "DB connection error"});
      }

      return res.json(200, result);
    });

  },
  updateScore: function (req, res) {
    var gameroomId = req.param('gameroomId');
    var answer = req.param('answer').toLowerCase();
    var currentLevel = req.param('currentLevel');
    var userId = req.session.user;
    console.log("update score for gameroomid " + gameroomId + ", user: " + userId + ", level" + currentLevel);

    if (userId === undefined || gameroomId === undefined || (answer === undefined && currentLevel === undefined)) {
      return res.json(400, {error: "Wrong input"});
    }

    questions = sails.config.gameconfig.questions;
    if (currentLevel > questions.length || questions[currentLevel - 1].answer != answer) {
      return res.json(400, {error: "Wrong answer! Please try again"});
    }

    //can't update level and score in using waterline update
    Gameroom_Players.query("UPDATE gameroom_players SET gameScore=gameScore+10 where gameroomId = " + gameroomId + " and " +
      "userId=" + userId, function (err, result) {
      if (err) {
        return res.json(500, {error: "DB connection error"});
      }

      //update level of the players
      Gameroom.query("UPDATE gameroom SET currentLevel=currentLevel+1 where gameroomId = " + gameroomId, function (err, result) {
        if (err) {
          return res.json(500, {error: "DB connection error"});
        }

        console.log("Result after updating level:" + result);
        GameRoomService.publishGameScores(req, gameroomId, {});
        var data = {message: "User " + req.session.userName + " answered the question correctly"};
        GameRoomService.publishGameRoomUpdates(req, gameroomId, data);

        //send next question update with currentLevel if max levels not reached. else end the game
        Gameroom.findOne({gameroomId: gameroomId}).exec(function (err, result) {

          //send final scores if final level is reached
          if (result.currentLevel - 1 >= sails.config.gameconfig.maxLevels) {
            Gameroom_Players.find({gameroomId: gameroomId}).populate('userId').exec(function (err, result) {

              var scores = [];
              result.forEach(function (currentValue, index, arr) {
                scores.push(currentValue.toJSON());
              });
              GameRoomService.publishGameEndUpdate(req, gameroomId, scores);

              //delete gameroom
              Gameroom_Players.destroy({gameroomId: gameroomId}).exec(function (err) {
              });
              Gameroom.destroy({gameroomId: gameroomId}).exec(function (err) {
                GameRoomService.publishGameSummaryUpdates(req, gameroomId, {}); //data can be anything here as client is again calling api
              });
            });
          }
          else {
            questions = sails.config.gameconfig.questions;
            GameRoomService.publishNextQuestion(req, gameroomId, {
              currentLevel: result.currentLevel,
              question: questions[result.currentLevel - 1].question
            });
          }

          return res.json(200);
        });

      });
    });
  },
  getNextQuestion: function (req, res) {
    var gameroomId = req.param('gameroomId');
    var userId = req.session.user;

    if (userId === undefined || gameroomId === undefined) {
      return res.json(400, {error: "User is not logged in"});
    }


    Gameroom.findOne({gameroomId: gameroomId}).exec(function (err, result) {
      var currentLevel = result.currentLevel;

      if (currentLevel <= sails.config.gameconfig.maxLevels) {
        var questions = sails.config.gameconfig.questions;
        var questionDetails = {currentLevel: currentLevel, question: questions[currentLevel - 1].question};
        return res.json(200, questionDetails);
      }

      return res.json(200, {});
    });
  }
};

