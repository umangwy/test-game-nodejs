# Anagrams

a [Sails](http://sailsjs.org) application


Problem Statement:
The objective is to create a 2-4 player game using Sails.js framework with the following flow:
User Registration -> User starts a game -> Players join a game from a list of available games -> All players ready -> Play the game -> Game over, close the game room and delist it.
The communication should occur in real-time, using websockets.


About Anagrams:
This is a 2-4 player anagram solving game. Users can either create a new game or join a game from the list of currently active game rooms. 'Enter' takes a player to the game page, 'Home' takes them back to the home page and 'Leave' disjoins the player from the game. Players may 'Enter' or 'Leave' the game room at any stage. Once players enter a game room, they can also chat with each other in real-time and view live game updates.

The game has 5 levels. Players get 10 points for each correct anagram solved. Any player can start the game once there are 2 or more players in a game room.

As soon as any of the players enter the correct answer, the game advances to the next level. The player with the maximum score in the end wins the game.


Assumptions:
1. User and gameroom names must be unique
2. If the admin leaves a game room, the game room gets delisted
3. Players may create or join multiple games at a time.
4. Once a game starts, new players cannot join the game mid-way.
5. Past games cannot be accessed.

Implementation Details:
1. There are two controllers:
MainController - for user signup, login and logout
GameController - for all game related activities like game creation, joining, fetching game scores etc.
2. There are three models for storing data:
Users - Contains user information like name, hashed password
Gameroom - Contains game room information like name, admin, current level of the game
Gameroom_Players - contains active player information of game rooms
3. GameroomService is used by controllers to broadcast/subscribe game information to users using websockets.
4. config/gameconfig.js contains basic config like minGamePlayers, maxGamePlayers , maxLevels etc.
5. Unit test cases are in the test folder. To run unit tests execute : npm test. Tests are run using test.js config
6. There are two 'views' files:
Index.ejs - for user login, signup and home
Game.ejs - for when user enters a game
7. mysql is used as the default data store.

How to run:
1. Start mysql on default port(3306).
2. Run init script from the root folder: sh init.sh (assuming root has no password)
3. Run sails : sails lift
4. Go to "http://localhost:1337" to access the app.

Running test cases:
1. Run "npm test"
