/**
 * Users.js
 *
 * @description :: users and gameroom has one to one relationship
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    userId: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      columnName: 'userId',
      autoIncrement: true
    },
    userName: {
      type: 'string',
      unique: true,
      columnName: 'userName'
    },
    password: {
      type: 'string',
      columnName: 'password'
    },
    gameroom_created: {
      collection: 'gameroom',
      via: 'admin'
    }
  }
};

