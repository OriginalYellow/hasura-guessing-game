# hasura-guessing-game
minimal multiplayer guessing game webapp, the purpose of which is to demonstrate hasura, graphql, and other cool things

## game design
#### summary
* a simple competitive guessing-game 
* requires 2 or more players
* turn-based
* there are multiple ways to win (see "rules" below)

#### rules
* when the game starts, the computer choses a random, secret number
* in a set order, players take turns guessing the secret number
* there are two possible ways to win:
  * if player X guesses correctly, they will instantly win
  * if player X's guess is the closest guess so far, and another player doesn't make a closer guess after player X makes theirs, player X will win at the start of their next turn
* the current closest guess (and the player who made it) will be displayed at all times to all players 

## features/technical requirements
* the player/user client will run in a browser (this is a "web app")
* the "game design" should be implemented like so:
  * the game state's single source of truth is stored server-side
  * users can start game sessions (the creator of a game session is called the "session host")
  * the session host is also a player in their own game session
  * each game session has a unique URL 
  * as long as the completion status of a game session is "NOT_STARTED", any user who navigates to that game session's unique URL will join that game as an additional player
  * once there are at least two players, the session host can start the game 
* players' clients must be updated in real-time to display:
  * the name of the player currently taking their turn
  * what the current newest closest guess is
  * what the completion status of the game is, (NOT_STARTED|ONGOING|COMPLETE)
    * if the game is complete, the winner's name should be instantly displayed as well
