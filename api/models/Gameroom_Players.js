/**
 * Gameroom_Players.js
 *
 * @description :: Contains id of gameroom and id of players in that gameroom. This is one-way relationship
 */

module.exports = {

  attributes: {
    gameroomId: {
      model: 'gameroom'
    },
    gameroomName: {
      type: 'string'
    },
    userId: {
      model: 'users'
    },
    gameScore: {
      type: 'integer',
      defaultsTo: 0
    }
  }
};

