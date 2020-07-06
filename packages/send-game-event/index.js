// MIKE: replace accessors and destructuring with lenses

import fetch from 'node-fetch'
import { json, send } from 'micro'
import { interpret } from 'xstate'
import * as L from 'partial.lenses'
import { models } from "@hasura-guessing-game/lenses";
import { gameMachine, createGameMachine, getRandomInt } from './src/gameMachine.js'
const { gameService: GameService, gameSessionByPk: GameSession } = models
import * as Transform from './src/transform'

// MIKE: put gql queries in their own files
// MIKE: use gql fragments 
const HASURA_QUERY = `
  query gameSessionByPk($id: Int!) {
    game_session_by_pk(id: $id) {
      players(order_by: {created_at: asc}) {
        user_id
      }
      secret_number
      winner_id
      id
      completion_status
      closest_guess
      closest_guesser_id
      turn_index
      host_id
      game_events(order_by: {created_at: asc}) {
        event_type
        payload
        id
      }
    }
  }
`

const HASURA_OPERATION = `
  mutation sendGameEvent($closest_guess: Int, $closest_guesser_id: Int, $completion_status: completion_status_enum, $secret_number: Int, $turn_index: Int, $winner_id: Int, $pk_columns: game_session_pk_columns_input!, $event_type: String, $payload: json, $game_session_id: Int) {
    update_game_session_by_pk(_set: {closest_guess: $closest_guess, closest_guesser_id: $closest_guesser_id, completion_status: $completion_status, secret_number: $secret_number, turn_index: $turn_index, winner_id: $winner_id}, pk_columns: $pk_columns) {
      closest_guess
      closest_guesser_id
      completion_status
      id
      players(order_by: {created_at: asc}) {
        user_id
      }
      secret_number
      turn_index
      winner_id
    }
    insert_game_event_one(object: {game_session_id: $game_session_id, event_type: $event_type, payload: $payload}) {
      id
    }
  }
`;

// MIKE: try and eliminate duplicate code between this and the next function
// execute the parent operation in Hasura
const executeOperation = async (variables) => {
  const fetchResponse = await fetch(
    // MIKE: replace second value with env var
    process.env.HASURA_ENDPOINT || 'http://localhost:8080/v1/graphql',
    {
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      }),
      headers: {
        // MIKE: replace second value with env var
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || 'HVVTa3PSDocVJvbliFlu'
      }
    }
  );

  const data = await fetchResponse.json();
  return data;
};

// MIKE: try and eliminate duplicate code between this and the last function
// execute the parent operation in Hasura
const executeQuery = async (variables) => {
  const fetchResponse = await fetch(
    // MIKE: replace second value with env var
    process.env.HASURA_ENDPOINT || 'http://localhost:8080/v1/graphql',
    {
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_QUERY,
        variables
      }),
      headers: {
        // MIKE: replace second value with env var
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || 'HVVTa3PSDocVJvbliFlu'
      }
    }
  );

  const data = await fetchResponse.json();
  return data;
};

// Request Handler
const handler = async (req, res) => {
  // get request data
  let reqData = null
  try {
    reqData = await json(req);
  } catch (e) {
    // MIKE: this will throw silently and return an empty object
    reqData = {}
  }

  const userId = reqData.session_variables['x-hasura-user-id']
  const { gameSessionId, eventType, payload } = reqData.input

  // query for game session
  const gameSessionData = await executeQuery({ id: gameSessionId })

  // create game service and send it the event
  let secretNumber = null

  if (GameSession.Get.gameEvents(gameSessionData).length > 0) {
    secretNumber = GameSession.Get.secretNumber(gameSessionData)
  } else {
    secretNumber = getRandomInt(-100, 100)
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

  // replay events on gameService to get most recent state
  if (GameSession.Get.gameEvents(gameSessionData).length > 0) {
    // MIKE: you should probably pass the events to send as an array instead
    GameSession.Get.gameEvents(gameSessionData).forEach(event => {
      gameService.send({
        type: event.event_type,
        ...event.payload
      })
    })
  }

  // send input event
  gameService.send({ type: eventType, ...payload })

  // execute operation
  await executeOperation({
    ...Transform.gameService.model(gameService),
    pk_columns: { id: gameSessionId },
    event_type: eventType,
    payload,
    game_session_id: gameSessionId,
  })

  send(
    res,
    '200',
    {
      id: gameSessionId,
    })
};

module.exports = handler;