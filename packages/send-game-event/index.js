import fetch from 'node-fetch'
import { json, send } from 'micro'
import { interpret } from 'xstate'
import { executeQuery, getRandomInt } from '@hasura-guessing-game/util'
import { models } from "@hasura-guessing-game/lenses"
import { createGameMachine } from '@hasura-guessing-game/game-machine'
import * as Transform from './src/transform'
const { gameService: GameService, gameSessionByPk: GameSession } = models

// MIKE: put gql queries in their own files
// MIKE: use gql fragments 
const QUERY_GAME_SESSION_BY_PK = `
  query gameSessionByPk($id: Int!) {
    game_session_by_pk(id: $id) {
      id
      players(order_by: {created_at: asc}) {
        user_id
      }
      secret_number
      host_id
      game_events(order_by: {created_at: asc}) {
        id
        event_type
        user_id
        payload
      }
    }
  }
`

const MUTATION_UPDATE_GAME_SESSION_BY_PK = `
  mutation updateGameSessionByPk($closest_guess: Int, $closest_guesser_id: Int, $completion_status: completion_status_enum, $secret_number: Int, $turn_index: Int, $winner_id: Int, $pk_columns: game_session_pk_columns_input!, $event_type: String, $payload: json, $game_session_id: Int, $user_id: Int) {
    update_game_session_by_pk(_set: {closest_guess: $closest_guess, closest_guesser_id: $closest_guesser_id, completion_status: $completion_status, secret_number: $secret_number, turn_index: $turn_index, winner_id: $winner_id}, pk_columns: $pk_columns) {
      id
    }
    insert_game_event_one(object: {game_session_id: $game_session_id, event_type: $event_type, payload: $payload, user_id: $user_id}) {
      id
    }
  }
`

// inject dependencies into executeQuery
const executeQuery$ = executeQuery(
  // MIKE: replace second value with env var
  process.env.HASURA_ENDPOINT || 'http://localhost:8080/v1/graphql',
  {
    // MIKE: replace second value with env var
    'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || 'HVVTa3PSDocVJvbliFlu'
  }
)

// request handler
const handler = async (req, res) => {
  // get request data
  let reqData = null
  try {
    reqData = await json(req)
  } catch (error) {
    send(res, 400, { error })
    return
  }

  const userId = reqData.session_variables['x-hasura-user-id']
  const { gameSessionId, eventType, payload } = reqData.input

  // query for game session
  const gameSessionData = await executeQuery$(
    QUERY_GAME_SESSION_BY_PK,
    { id: gameSessionId }
  )

  // create and start gameService
  let secretNumber = null
  if (!GameSession.Get.secretNumber(gameSessionData)) {
    // generate a random secret number if none exists
    secretNumber = getRandomInt(-100, 100)
  } else {
    secretNumber = GameSession.Get.secretNumber(gameSessionData)
  }

  const gameMachine = createGameMachine(
    GameSession.Get.hostId(gameSessionData),
    GameSession.Get.playerIds(gameSessionData),
    secretNumber,
  )

  const gameService = interpret(gameMachine)
    .onTransition((state) => {
      if (state.changed) {
        // MIKE: when you add proper logging, turn this off and on with an
        // environment variable instead of commenting it out:

        // console.log(state.value)
        // console.log(state.context)
      }
    })
    .start();

  // replay old events on gameService to get most recent state
  if (GameSession.Get.gameEvents(gameSessionData).length > 0) {
    gameService.send(
      GameSession.Get.gameEvents(gameSessionData)
      // MIKE: overwriting the payload's playerId like this will prevent a
      // mismatch between that and the event's user_id from causing access
      // control problems, but it may result in the payload being technically
      // "incorrect". this applies to other similar cases later in file
      // MIKE: extract this mapping into a lens and a transform. this applies to
      // other similar cases later in file
        .map(event => ({ type: event.event_type, ...event.payload, playerId: event.user_id }))
    )
  }

  // send new input event
  gameService.send({ type: eventType, ...payload, playerId: userId })

  // update game_session record with latest state
  await executeQuery$(
    MUTATION_UPDATE_GAME_SESSION_BY_PK,
    {
      ...Transform.gameService.model(gameService),
      pk_columns: { id: gameSessionId },
      event_type: eventType,
      payload: { ...payload, playerId: userId },
      game_session_id: gameSessionId,
      user_id: userId,
    },
  )

  send(
    res,
    200,
    {
      id: gameSessionId,
    })
};

export default handler