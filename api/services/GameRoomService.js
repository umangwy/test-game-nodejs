/**
 * Created by umang.kedia on 10/05/16.
 */


module.exports = {
  /* subscribe to game summary updates like when new gameroom is created, no. of players in a gameroom */

  subscribeUsersToGameSummaryUpdates: function (req, res) {
    if (req.isSocket) {
      sails.sockets.join(req.socket, sails.config.gameconfig.gameSummaryUpdatesRoom);
    }
  },

  //publish game summary updates like when new gameroom is created, no. of players in a gameroom

  publishGameSummaryUpdates: function (req, res, data) {
    sails.sockets.broadcast(sails.config.gameconfig.gameSummaryUpdatesRoom, sails.config.gameconfig.gameSummaryUpdatesEvent, data);
  },

  //common room for all people in the game

  subscribeUserToGameUpdate: function (req, gameroomId) {
    if (req.isSocket) {
      sails.sockets.join(req.socket, "gameRoom" + gameroomId);
    }
  },

  //game room events like who joined, whose turn is this etc

  publishGameRoomUpdates: function (req, gameroomId, data) {
    sails.sockets.broadcast("gameRoom" + gameroomId, "gameRoomUpdate" + gameroomId, data);
  },

  //unsubscribe specific user from gameroom update when he is leaving the room or disconnected
  unsubscribeUserFromGameRoom: function (req, gameroomId) {
    if (!req.isSocket) {
      return req.badRequest('This endpoints only supports socket requests.');
    }
    sails.sockets.leave(req, "gameRoom" + gameroomId, function (err) {
        if (!err)
          console.log("user" + req.session.user + " unsubscribed from gameroom")
      });
  },

  //update about game room deleted and unsubscribe clients too
  publishGameRoomDeleteUpdate: function (req, gameroomId, data) {
    sails.sockets.broadcast("gameRoom" + gameroomId, "gameRoomDelete" + gameroomId, data);

    sails.sockets.removeRoomMembersFromRooms("gameRoom" + gameroomId, "gameRoom" + gameroomId, function(err) {
      if (!err)
        console.log("members removed from gameroom socket");

      else
        console.log("error in removing members from gameroom socket")
    })
  },

  //actual game update like result after player 1 turn etc

  publishGameUpdate: function (req, gameroomId, data) {
    sails.sockets.broadcast("gameRoom" + gameroomId, "gameUpdate" + gameroomId, data);
  }

};
