# real-time-game

a [Sails](http://sailsjs.org) application


Problem Statement:
The objective is to create a 2-4 player game using Sails.js framework with the following flow:
User Registration -> User starts a game -> Players join a game from a list of available games -> All players ready -> Play the game -> Game over, close the game room and delist it.
The communication should occur in realtime, using websockets.


About the Game:
This is a 2-4 player anagram solving game. Users can either create a new game or join a game from the list of currently active gamerooms. 'Enter' takes a player to the game page, 'Home' takes them back to the home page and 'Leave' disjoins the player from the game. Players may 'Enter' or 'Leave' the gameroom at any stage. Once players enter a gameroom, they can also chat with each other in real-time and view live game updates.
The game has 5 levels. Players get 10 points for each correct anagram solved. Any player can start the game once there are more than 2 players in a gameroom. As soon as any of the players enter the correct answer, the game advances to the next level. The player with the maximum score in the end wins the game.


Assumptions:
1. User and gameroom names must be unique
2. If the admin leaves a gameroom, the gameroom gets delisted
3. Players may create or join multiple games at a time.
4. Once a game starts, new players cannot join the game mid-way.
5. Past games cannot be accessed.

Implementation Details:
1. There are two controllers: MainController - for users signup, login and logout, GameController - for all game related activities like game creation, joining, getting game scores etc
2. There are three models for storing data: Users(Contains users login information), Gameroom(Contains gameroom information like name, admin), Gameroom_Players(contains active players in the gameroom).
3. GameroomService is used by controllers to broadcast/subscribe users with game information.
4. config/gameconfig.js contains basic config like minGamePlayers, maxGamePlayers , maxLevels etc
5. Unit test cases are in test folder. To run unit test execute : npm test. It will run using the test.js config
6. There are two views file: index.ejs(for login, signup), game.ejs(when user is inside the game).
7. mysql is used as default datastore.

How to run:
1. Start mysql on default port(3306).
2. Run init script from root folder (sh init.sh) (assuming root has no password)
3. Run sails : sails lift
4. Go to "http://localhost:1337" to access the app.

Running test cases:
1. Run "npm test"

