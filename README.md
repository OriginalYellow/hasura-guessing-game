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
  * the game rules will be all be applied server-side
  * any input sent to the server by a player will validated there to prevent cheating
* implement a concept of "game sessions":
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
* authentication/authorization/access control requirements:
  * JWT's (JSON Web Tokens) will be used for authentication and authorization
    * a JWT will be stored in the browser for both "temporary" users and "password-protected" users
    * hasura's permission system works smoothly with JWTs, and should be used as much as possible to...
      * authenticate users/decode JWTs ([docs](https://hasura.io/docs/1.0/graphql/manual/auth/authentication/jwt.html))
      * authorize mutations, actions, and queries ([docs](https://hasura.io/docs/1.0/graphql/manual/auth/authorization/index.html))
  * implement a concept of "temporary" users
    * site visitors will be able to sign up as a "temporary" user and then must either choose a user name or a random name will be created for them
    * temporary users can create and join games just like any other user
    * a JWT will be generated just once upon sign-up and then stored in the users' browser storage
    * temporary users may permanently lose their account if they clear their browsers' storage
    * temporary users will have the option of adding a password to their account later (effectively upgrading their account from the temporary status to a "password-protected" status)
  * implement secure password storage and token refreshing for "password-protected" users
    * **this is low priority**
    * you could use Auth0's basic JWT authentication flow to implement this