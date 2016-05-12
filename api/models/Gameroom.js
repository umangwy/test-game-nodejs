/**
 * Gameroom.js
 *
 * @description :: Gameroom data, along with user id of gameroom admin
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    gameroomId: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      columnName: 'gameroomId',
      autoIncrement: true
    },
    gameroomName: {
      type: 'string',
      unique: true,
      columnName: 'gameroomName'
    },
    activeStatus: {
      type: 'integer',
      columnName : 'activeStatus',
      defaultsTo: 1
    },
    admin:{
      model:'users',
      unique: true
    }
  }
};

